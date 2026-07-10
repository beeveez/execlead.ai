import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * manageJourney — Journey read path + event recording.
 *
 * After H2, the default action reads from the UserProfile intelligence cache
 * instead of recomputing on every request. Computation is delegated to
 * recomputeIntelligence (triggered by entity automations or on cache miss).
 *
 * Actions:
 *   compute (default) — read cached journey data (recompute if stale)
 *   timeline          — read canonical timeline from JourneyEvent (M1)
 *   record            — create a JourneyEvent + trigger recompute
 *   enterprise        — aggregate from cached fields (M2, no in-memory compute)
 *   force_recompute   — invoke recomputeIntelligence and return fresh data
 */

const STALE_THRESHOLD_MS = 24 * 60 * 60 * 1000; // 24 hours

async function getProfile(base44, userId) {
  try {
    const profiles = await base44.asServiceRole.entities.UserProfile.filter({ created_by_id: userId }, '-created_date', 5);
    return profiles[0] || null;
  } catch (e) {
    console.error('[manageJourney] getProfile failed:', e.message);
    return null;
  }
}

function isCacheFresh(profile, configVersion) {
  if (!profile?.intelligence_computed_at) return false;
  if (profile.intelligence_config_version !== configVersion) return false;
  const age = Date.now() - new Date(profile.intelligence_computed_at).getTime();
  return age < STALE_THRESHOLD_MS;
}

function filterByRange(events, range) {
  if (range === 'lifetime') return events;
  const now = Date.now();
  const cutoff = range === '30d' ? now - 30 * 86400000 : range === '90d' ? now - 90 * 86400000 : range === 'year' ? now - 365 * 86400000 : 0;
  return events.filter((e) => new Date(e.date).getTime() >= cutoff);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const action = body.action || 'compute';

    // Get config for version checking (H1: single source of truth)
    const configRes = await base44.functions.invoke('manageConfig', {});
    const config = configRes.data;

    // ── record: create JourneyEvent + trigger recompute ──
    if (action === 'record') {
      const { event_type, module, points, title, description, category, milestone } = body;
      if (!event_type || !title) return Response.json({ error: 'event_type and title required' }, { status: 400 });
      const event = await base44.asServiceRole.entities.JourneyEvent.create({
        user_id: user.id,
        user_name: user.full_name || '',
        event_type,
        module: module || '',
        points: points || 0,
        title,
        description: description || '',
        category: category || 'contribution',
        milestone: milestone || false,
        event_date: new Date().toISOString(),
      });
      // Trigger async recompute (don't block the response)
      base44.functions.invoke('recomputeIntelligence', { user_id: user.id }).catch((e) => {
        console.error('[manageJourney] Post-record recompute failed:', e.message);
      });
      return Response.json({ event, recorded: true });
    }

    // ── force_recompute: invoke recomputeIntelligence ──
    if (action === 'force_recompute') {
      const res = await base44.functions.invoke('recomputeIntelligence', { user_id: user.id });
      return Response.json(res.data);
    }

    // ── enterprise: aggregate from cached fields (M2) ──
    if (action === 'enterprise') {
      const profile = await getProfile(base44, user.id);
      const orgId = body.organization_id || profile?.organization_id;
      if (!orgId) return Response.json({ error: 'No organization found' }, { status: 400 });

      // Use cached fields — no computation needed (M2)
      const orgProfiles = await base44.asServiceRole.entities.UserProfile.filter(
        { organization_id: orgId }, '-cached_journey_points', 500
      );

      const distribution = {};
      const readinessBuckets = { critical: 0, developing: 0, ready: 0, elite: 0 };
      let totalXp = 0, totalReadiness = 0, totalPromotion = 0, totalTrust = 0;

      orgProfiles.forEach((p) => {
        const levelId = p.cached_journey_level_id || 'seed';
        distribution[levelId] = (distribution[levelId] || 0) + 1;
        const xp = p.cached_journey_points || p.xp_points || 0;
        const readiness = p.cached_readiness_score || 0;
        totalXp += xp;
        totalReadiness += readiness;
        totalPromotion += p.cached_promotion_probability || 0;
        totalTrust += p.cached_trust_score || 0;
        if (readiness < 40) readinessBuckets.critical++;
        else if (readiness < 60) readinessBuckets.developing++;
        else if (readiness < 80) readinessBuckets.ready++;
        else readinessBuckets.elite++;
      });

      const count = orgProfiles.length;
      const avgPoints = count > 0 ? Math.round(totalXp / count) : 0;
      const avgReadiness = count > 0 ? Math.round(totalReadiness / count) : 0;
      const avgPromotion = count > 0 ? Math.round(totalPromotion / count) : 0;
      const avgTrust = count > 0 ? Math.round(totalTrust / count) : 0;

      // Get level from config
      const getLevelTitle = (id) => config.levels.find((l) => l.id === id)?.title || 'Seed';

      const topContributors = orgProfiles
        .slice(0, 5)
        .map((p) => ({
          name: p.full_name || 'Unknown',
          points: p.cached_journey_points || p.xp_points || 0,
          level: { id: p.cached_journey_level_id || 'seed', title: getLevelTitle(p.cached_journey_level_id) },
          promotion_readiness: p.cached_promotion_probability || 0,
        }));

      const emergingLeaders = orgProfiles.filter((p) => {
        const lvl = p.cached_journey_level_id || 'seed';
        return ['seed', 'emerging', 'manager'].includes(lvl);
      }).length;

      return Response.json({
        totalMembers: count,
        averagePoints: avgPoints,
        averageLevel: { id: 'computed', title: getLevelTitle('seed') }, // Will be computed from avg
        distribution,
        topContributors,
        emergingLeaders,
        averagePromotionReadiness: avgPromotion,
        averageReadiness: avgReadiness,
        averageTrust: avgTrust,
      });
    }

    // ── timeline: read canonical timeline from JourneyEvent (M1) ──
    if (action === 'timeline') {
      let events = [];
      try {
        const rawEvents = await base44.asServiceRole.entities.JourneyEvent.filter({ user_id: user.id }, '-event_date', 500);
        events = rawEvents.map((e) => {
          let icon = '⭐';
          if (e.metadata_json) {
            try { icon = JSON.parse(e.metadata_json).icon || icon; } catch {}
          }
          return {
            date: e.event_date || e.created_date,
            type: e.event_type,
            title: e.title,
            description: e.description || '',
            points: e.points || 0,
            category: e.category || 'contribution',
            icon,
            milestone: e.milestone || false,
          };
        });
      } catch (e) {
        console.error('[manageJourney] timeline query failed:', e.message);
      }
      const range = body.range || 'lifetime';
      return Response.json({ events: filterByRange(events, range), warnings: [] });
    }

    // ── compute (default): read from cache, recompute if stale ──
    const profile = await getProfile(base44, user.id);
    if (!profile) return Response.json({ error: 'Profile not found' }, { status: 404 });

    if (!isCacheFresh(profile, config.configVersion)) {
      // Cache stale or config version mismatch — recompute
      const res = await base44.functions.invoke('recomputeIntelligence', { user_id: user.id });
      return Response.json(res.data);
    }

    // Return cached data
    let cachedData = null;
    try {
      cachedData = JSON.parse(profile.cached_intelligence_json || 'null');
    } catch (e) {
      console.error('[manageJourney] Cache JSON parse failed:', e.message);
    }

    if (!cachedData) {
      // Cache corrupt — recompute
      const res = await base44.functions.invoke('recomputeIntelligence', { user_id: user.id });
      return Response.json(res.data);
    }

    // Return journey-specific fields from cache
    let warnings = [];
    try {
      warnings = JSON.parse(profile.intelligence_warnings_json || '[]');
    } catch {}

    return Response.json({
      totalPoints: cachedData.totalPoints,
      breakdown: cachedData.breakdown,
      level: cachedData.level,
      achievements: cachedData.achievements,
      recommendations: cachedData.recommendations,
      estimatedDays: cachedData.estimatedDays,
      streaks: cachedData.streaks,
      digest: cachedData.digest,
      timeline: cachedData.timeline,
      warnings,
      profile: cachedData.profile,
      cached: true,
      configVersion: profile.intelligence_config_version,
      computedAt: profile.intelligence_computed_at,
    });
  } catch (error) {
    console.error('[manageJourney] Unhandled error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * manageIntelligence — Intelligence read path.
 *
 * After H2, reads from the UserProfile intelligence cache instead of
 * recomputing on every request. Computation is delegated to
 * recomputeIntelligence (triggered by entity automations or on cache miss).
 *
 * Actions:
 *   compute (default) — read cached readiness/trust/forecast (recompute if stale)
 *   passport          — read cache + fetch published letters
 *   trust             — read cached trust data
 *   enterprise        — aggregate from cached fields (M2)
 *   force_recompute   — invoke recomputeIntelligence and return fresh data
 */

const STALE_THRESHOLD_MS = 24 * 60 * 60 * 1000;

async function getProfile(base44, userId) {
  try {
    const profiles = await base44.asServiceRole.entities.UserProfile.filter({ created_by_id: userId }, '-created_date', 5);
    return profiles[0] || null;
  } catch (e) {
    console.error('[manageIntelligence] getProfile failed:', e.message);
    return null;
  }
}

function isCacheFresh(profile, configVersion) {
  if (!profile?.intelligence_computed_at) return false;
  if (profile.intelligence_config_version !== configVersion) return false;
  const age = Date.now() - new Date(profile.intelligence_computed_at).getTime();
  return age < STALE_THRESHOLD_MS;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const action = body.action || 'compute';

    // Get config (H1: single source of truth)
    const configRes = await base44.functions.invoke('manageConfig', {});
    const config = configRes.data;

    // ── force_recompute ──
    if (action === 'force_recompute') {
      const res = await base44.functions.invoke('recomputeIntelligence', { user_id: user.id });
      return Response.json(res.data);
    }

    // ── enterprise: aggregate from cached fields (M2) ──
    if (action === 'enterprise') {
      const profile = await getProfile(base44, user.id);
      const orgId = body.organization_id || profile?.organization_id;
      if (!orgId) return Response.json({ error: 'No organization found' }, { status: 400 });

      const orgProfiles = await base44.asServiceRole.entities.UserProfile.filter(
        { organization_id: orgId }, '-cached_journey_points', 500
      );

      const members = orgProfiles.map((p) => ({
        id: p.id,
        name: p.full_name || 'Unknown',
        xp: p.cached_journey_points || p.xp_points || 0,
        level: { id: p.cached_journey_level_id || 'seed', title: config.levels.find((l) => l.id === (p.cached_journey_level_id || 'seed'))?.title || 'Seed' },
        readiness: p.cached_readiness_score || 0,
        promotion: p.cached_promotion_probability || 0,
        target_role: p.target_role,
        identity_verified: p.identity_verified,
        trust_score: p.cached_trust_score || p.trust_score || 40,
      }));

      const count = members.length;
      const avgReadiness = count > 0 ? Math.round(members.reduce((s, m) => s + m.readiness, 0) / count) : 0;
      const avgXp = count > 0 ? Math.round(members.reduce((s, m) => s + m.xp, 0) / count) : 0;
      const avgPromotion = count > 0 ? Math.round(members.reduce((s, m) => s + m.promotion, 0) / count) : 0;
      const avgTrust = count > 0 ? Math.round(members.reduce((s, m) => s + m.trust_score, 0) / count) : 0;

      const distribution = {};
      const readinessBuckets = { critical: 0, developing: 0, ready: 0, elite: 0 };
      members.forEach((m) => {
        distribution[m.level.id] = (distribution[m.level.id] || 0) + 1;
        if (m.readiness < 40) readinessBuckets.critical++;
        else if (m.readiness < 60) readinessBuckets.developing++;
        else if (m.readiness < 80) readinessBuckets.ready++;
        else readinessBuckets.elite++;
      });

      const highPotential = members.filter((m) => m.readiness >= 70 && m.xp >= 1000).sort((a, b) => b.xp - a.xp).slice(0, 10);
      const riskIndicators = members.filter((m) => m.readiness < 40 || m.trust_score < 30).slice(0, 10);
      const topContributors = members.sort((a, b) => b.xp - a.xp).slice(0, 5);

      // Get journey level from avg XP
      let avgLevel = config.levels[0];
      for (const l of config.levels) {
        if (avgXp >= l.points) avgLevel = l;
      }

      return Response.json({
        totalMembers: count,
        averageReadiness: avgReadiness,
        averageJourney: avgXp,
        averagePromotion: avgPromotion,
        averageTrust: avgTrust,
        journeyLevel: avgLevel,
        distribution,
        readinessBuckets,
        highPotential,
        riskIndicators,
        topContributors,
        members: members.slice(0, 50),
      });
    }

    // ── Default: read from cache ──
    const profile = await getProfile(base44, user.id);
    if (!profile) return Response.json({ error: 'Profile not found' }, { status: 404 });

    if (!isCacheFresh(profile, config.configVersion)) {
      const res = await base44.functions.invoke('recomputeIntelligence', { user_id: user.id });
      return Response.json(res.data);
    }

    let cachedData = null;
    try {
      cachedData = JSON.parse(profile.cached_intelligence_json || 'null');
    } catch (e) {
      console.error('[manageIntelligence] Cache JSON parse failed:', e.message);
    }

    if (!cachedData) {
      const res = await base44.functions.invoke('recomputeIntelligence', { user_id: user.id });
      return Response.json(res.data);
    }

    let warnings = [];
    try {
      warnings = JSON.parse(profile.intelligence_warnings_json || '[]');
    } catch {}

    // ── passport action: cache + published letters ──
    if (action === 'passport') {
      let letters = [];
      try {
        letters = await base44.asServiceRole.entities.LeadershipLetter.filter({ author_user_id: user.id, status: 'published' }, '-published_at', 10);
      } catch (e) {
        console.error('[manageIntelligence] passport letters query failed:', e.message);
        warnings.push('passport_letters');
      }

      return Response.json({
        profile: profile ? {
          full_name: profile.full_name, professional_headline: profile.professional_headline,
          current_role: profile.current_role, target_role: profile.target_role, target_company: profile.target_company,
          industry: profile.industry, years_experience: profile.years_experience, country: profile.country, city: profile.city,
          bio: profile.bio, skills: profile.skills || [], public_username: profile.public_username,
          organization_id: profile.organization_id, founding_member: profile.founding_member,
          identity_verified: profile.identity_verified, verified_executive: profile.verified_executive,
          linkedin_url: profile.linkedin_url, portfolio_url: profile.portfolio_url, resume_url: profile.resume_url,
        } : null,
        journey: cachedData.journey,
        readiness: cachedData.readiness,
        trust: cachedData.trust,
        reputation: cachedData.reputation,
        letters: letters.map((l) => ({ id: l.id, title: l.title, category: l.category, published_at: l.published_at })),
        forecast: cachedData.forecast,
        warnings,
        cached: true,
        configVersion: profile.intelligence_config_version,
      });
    }

    // ── trust action ──
    if (action === 'trust') {
      const trustTimeline = [];
      cachedData.trust.levels.filter((l) => l.unlocked).forEach((l) => trustTimeline.push({ level: l, date: profile?.created_date }));
      return Response.json({
        trust: cachedData.trust,
        trustTimeline,
        warnings,
        profile: profile ? {
          identity_verified: profile.identity_verified,
          verified_executive: profile.verified_executive,
          founding_member: profile.founding_member,
        } : null,
        cached: true,
        configVersion: profile.intelligence_config_version,
      });
    }

    // ── compute (default) ──
    return Response.json({
      readiness: cachedData.readiness,
      trust: cachedData.trust,
      forecast: cachedData.forecast,
      journey: cachedData.journey,
      reputation: cachedData.reputation,
      warnings,
      profile: cachedData.profile,
      cached: true,
      configVersion: profile.intelligence_config_version,
      computedAt: profile.intelligence_computed_at,
    });
  } catch (error) {
    console.error('[manageIntelligence] Unhandled error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
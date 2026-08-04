import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Identity Synchronization™ — automatically re-synthesizes a member's
// Executive Identity Graph™ whenever a source (Executive Success Story)
// changes. Triggered by an entity automation on ExecutiveSuccessStory.
// One canonical identity remains the single source of truth.

function safeParse(s, fallback) {
  try { return s ? JSON.parse(s) : fallback; } catch { return fallback; }
}

function synthesizeFromStory(story, userId) {
  if (!story) return null;
  const metrics = safeParse(story.metrics_snapshot_json, {});
  const ai = safeParse(story.ai_insights_json, {});
  const competencyTop = metrics.competencyTop || [];
  const readinessDims = metrics.readinessDimensions || [];
  const strengths = readinessDims
    .filter((d) => (d.score || 0) >= 75)
    .slice(0, 5)
    .map((d) => d.name);
  const role = story.target_role || 'Executive Leader';
  const industry = story.industry || '';
  return {
    user_id: userId,
    professional_headline: industry ? `${role} · ${industry}` : role,
    executive_summary: story.summary || '',
    leadership_narrative: story.narrative || '',
    core_value_proposition: ai.value_proposition || ai.biggest_breakthrough || '',
    leadership_philosophy: ai.leadership_philosophy || '',
    executive_brand_statement: '',
    top_competencies: competencyTop.slice(0, 5).map((c) => c.name),
    leadership_strengths: strengths,
    executive_differentiators: (ai.differentiators || []).slice(0, 5),
    career_highlights: (story.achievements || []).slice(0, 6),
    achievements: story.achievements || [],
    executive_readiness: (metrics.readiness && metrics.readiness.current) || 0,
    story_confidence: metrics.storyConfidence || 0,
    evidence_count: metrics.evidenceCount || 0,
    verification_status: 'not_verified',
    primary_industry: story.industry || '',
    primary_function: '',
    target_executive_role: story.target_role || '',
    preferred_geography: '',
    source_verification_json: JSON.stringify({
      professional_headline: 'ai_generated',
      executive_summary: 'verified',
      leadership_narrative: 'verified',
      core_value_proposition: 'ai_assisted',
      leadership_philosophy: 'ai_assisted',
      executive_brand_statement: 'ai_generated',
      top_competencies: 'verified',
      leadership_strengths: 'verified',
      executive_differentiators: 'ai_assisted',
      career_highlights: 'verified',
      achievements: 'verified',
      executive_readiness: 'verified',
      story_confidence: 'verified',
      evidence_count: 'verified',
    }),
  };
}

const ADMIN_ROLES = new Set(['founder_root_admin', 'super_admin', 'platform_admin', 'admin', 'developer']);

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    // Entity automation payload shape: { event, data } where data is the story.
    let sourceStory = body.data || body.story || null;
    const userId = sourceStory?.user_id || body.user_id;

    // ── Auth: entity-automation context (no user) is trusted; manual calls require auth ──
    let caller = null;
    try { caller = await base44.auth.me(); } catch (_) {}
    const isAutomation = !!body.event && !!body.data;
    if (!isAutomation) {
      if (!caller) return Response.json({ error: 'Unauthorized' }, { status: 401 });
      const isOwner = !!userId && caller.id === userId;
      const isAdmin = ADMIN_ROLES.has(caller.role);
      if (!isOwner && !isAdmin) return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // If no story provided (e.g. manual/test invocation), load the latest.
    if (!sourceStory && userId) {
      const stories = await base44.asServiceRole.entities.ExecutiveSuccessStory.filter(
        { user_id: userId },
        '-updated_date',
        1
      );
      sourceStory = stories && stories[0];
    }
    if (!sourceStory) return Response.json({ ok: true, skipped: 'no_story' });
    const ownerId = sourceStory.user_id || userId;
    if (!ownerId) return Response.json({ error: 'Missing user_id' }, { status: 400 });

    // Skip if the current identity is already newer than the story.
    const existing = await base44.asServiceRole.entities.ExecutiveIdentity.filter(
      { user_id: ownerId },
      '-generated_date',
      1
    );
    const latest = existing && existing[0];
    const storyUpdated = sourceStory.updated_date || sourceStory.generated_date;
    if (latest && storyUpdated) {
      const identityUpdated = latest.last_updated || latest.generated_date;
      if (new Date(identityUpdated) >= new Date(storyUpdated)) {
        return Response.json({ ok: true, skipped: 'already_in_sync', identity_id: latest.id });
      }
    }

    const data = synthesizeFromStory(sourceStory, ownerId);
    const all = await base44.asServiceRole.entities.ExecutiveIdentity.filter(
      { user_id: ownerId },
      '-generated_date',
      50
    );
    const version = `${(all ? all.length : 0) + 1}.0`;
    const payload = {
      identity_id: `EI-${Date.now().toString().slice(-6)}`,
      current_version: version,
      version,
      ...data,
      generated_date: new Date().toISOString(),
      last_updated: new Date().toISOString(),
      change_history_json: JSON.stringify([]),
    };
    const created = await base44.asServiceRole.entities.ExecutiveIdentity.create(payload);
    return Response.json({ ok: true, synced: true, identity_id: created && created.id, version });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
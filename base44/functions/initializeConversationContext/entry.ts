import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

/**
 * initializeConversationContext — In-App Agent Automation
 * ============================================================
 * Fires when a user starts a new EXEC™ conversation.
 *
 * Initializes four systems using EXISTING architecture (no duplicate logic):
 *   1. Executive Memory™       — ensure record exists, stamp context timestamp
 *   2. Journey™ + Intelligence  — invoke recomputeIntelligence (computes journey,
 *                                 readiness, trust, forecast, writes JourneyEvents,
 *                                 caches to UserProfile)
 *   3. Executive Context Engine™ — ensure AIAgentState exists, stamp last_active
 *   4. Analytics                 — log conversation start as UsageLog
 *
 * Triggered by: in_app_agent automation (event_types: conversation_started)
 * Payload: { event, message, app_user, payload_too_large }
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Authenticate the caller — the user id is derived from the verified
    // session, never from a client-supplied field. This prevents an
    // unauthenticated attacker from forging {"app_user":{"id":"victim"}} to
    // mutate another user's memory/agent state or exfiltrate their metrics.
    const user = await base44.auth.me().catch(() => null);
    if (!user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = user.id;

    const body = await req.json().catch(() => ({}));
    const { event } = body;

    const userName = user.full_name || user.name || '';
    const conversationId = event?.conversation_id || '';
    const agentName = event?.agent_name || 'executive_concierge';
    const channel = event?.channel || 'web';
    const now = new Date().toISOString();

    const results = { initialized: [], errors: [], conversationId, agentName, channel, userId };

    // ── 1. Executive Memory™ — ensure record exists, stamp context timestamp ──
    try {
      const existing = await base44.asServiceRole.entities.ExecutiveMemory.filter(
        { user_id: userId }, '-created_date', 1
      );
      if (existing && existing.length > 0) {
        await base44.asServiceRole.entities.ExecutiveMemory.update(existing[0].id, {
          last_context_gathered_at: now,
        });
        results.initialized.push('executive_memory_refreshed');
      } else {
        await base44.asServiceRole.entities.ExecutiveMemory.create({
          user_id: userId,
          executive_summary: '',
          goals_json: '[]',
          aspirations_json: '[]',
          achievements_json: '[]',
          notes_json: '[]',
          preferences_json: '{}',
          last_context_gathered_at: now,
        });
        results.initialized.push('executive_memory_created');
      }
    } catch (e) {
      results.errors.push({ step: 'executive_memory', error: e.message });
    }

    // ── 2. Journey™ + Intelligence — reuse recomputeIntelligence ──
    //    This computes journey points, readiness, trust, forecast,
    //    writes canonical JourneyEvent records, and persists to UserProfile cache.
    try {
      const intelRes = await base44.asServiceRole.functions.invoke('recomputeIntelligence', {
        user_id: userId,
      });
      if (intelRes.data && !intelRes.data.error) {
        results.initialized.push('journey_intelligence_ready');
        results.intelligence = {
          totalPoints: intelRes.data.totalPoints,
          level: intelRes.data.level?.current?.title || null,
          readinessScore: intelRes.data.readiness?.overallScore ?? null,
          trustScore: intelRes.data.trust?.totalScore ?? null,
          trustTier: intelRes.data.trust?.tier || null,
          promotionProbability: intelRes.data.forecast?.probability ?? null,
          recommendations: (intelRes.data.recommendations || []).slice(0, 3).map((r) => ({
            label: r.label,
            path: r.path,
            points: r.points,
          })),
        };
      } else {
        results.initialized.push('journey_intelligence_skipped');
      }
    } catch (e) {
      results.errors.push({ step: 'journey_intelligence', error: e.message });
    }

    // ── 3. Executive Context Engine™ — ensure AIAgentState exists ──
    try {
      const agentStates = await base44.asServiceRole.entities.AIAgentState.filter(
        { user_id: userId, agent_id: agentName }, '-created_date', 1
      );
      if (agentStates && agentStates.length > 0) {
        await base44.asServiceRole.entities.AIAgentState.update(agentStates[0].id, {
          last_active: now,
        });
        results.initialized.push('agent_state_refreshed');
      } else {
        await base44.asServiceRole.entities.AIAgentState.create({
          user_id: userId,
          agent_id: agentName,
          is_enabled: true,
          is_unlocked: true,
          last_active: now,
        });
        results.initialized.push('agent_state_created');
      }
    } catch (e) {
      results.errors.push({ step: 'agent_state', error: e.message });
    }

    // ── 4. Analytics — log conversation start ──
    try {
      await base44.asServiceRole.entities.UsageLog.create({
        module: 'other',
        status: 'success',
        response_time_ms: 0,
        prompt_id: conversationId,
        user_name: userName,
      });
      results.initialized.push('analytics_logged');
    } catch (e) {
      results.errors.push({ step: 'analytics', error: e.message });
    }

    return Response.json({ success: true, ...results });
  } catch (error) {
    console.error('[initializeConversationContext] Unhandled error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
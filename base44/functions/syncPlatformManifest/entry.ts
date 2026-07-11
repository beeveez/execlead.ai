import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Handle both manual admin calls and scheduled automation calls.
    let user = null;
    let isManualCall = false;
    try {
      user = await base44.auth.me();
      isManualCall = true;
    } catch (e) {
      // Scheduled automation — no user context
    }

    if (isManualCall && user && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });
    }

    // ── Manifest version metadata (mirrors src/lib/platformManifest.js) ──
    const manifestVersion = '1.0';
    const platformVersion = '2.0';
    const knowledgeVersion = '2.0';
    const frameworkVersion = '1.0';
    const promptVersion = '2.0';
    const buildNumber = '2026.07.11';

    // ── Knowledge Pack status from ELIMKnowledgePack entity ──
    // The canonical pack definitions (mirrors src/lib/elimFrameworks.js).
    // If the entity is empty, we seed it so backend and frontend agree.
    const PLATFORM_KNOWLEDGE_PACKS = [
      { pack_id: 'kp_eecf', framework_id: 'eecf', name: 'EECF™ Knowledge Pack', version: '1.0', status: 'active' },
      { pack_id: 'kp_leadership_dna', framework_id: 'leadership_dna', name: 'Leadership DNA™ Knowledge Pack', version: '2.0', status: 'active' },
      { pack_id: 'kp_eri', framework_id: 'eri', name: 'Executive Readiness Index™ Knowledge Pack', version: '1.2', status: 'active' },
      { pack_id: 'kp_erf', framework_id: 'erf', name: 'Executive Reputation Framework™ Knowledge Pack', version: '1.1', status: 'active' },
      { pack_id: 'kp_ejf', framework_id: 'ejf', name: 'Executive Journey Framework™ Knowledge Pack', version: '1.0', status: 'active' },
      { pack_id: 'kp_platform', framework_id: 'ejf', name: 'Platform Operations Knowledge Pack', version: '1.0', status: 'active' },
    ];

    let knowledgePacks = { total: 0, active: 0, draft: 0, archived: 0 };
    try {
      // Seed the entity if empty — ensures backend agrees with frontend definition
      const existing = await base44.asServiceRole.entities.ELIMKnowledgePack.list('-created_date', 100);
      if (existing.length === 0) {
        for (const pack of PLATFORM_KNOWLEDGE_PACKS) {
          await base44.asServiceRole.entities.ELIMKnowledgePack.create({
            pack_id: pack.pack_id,
            framework_id: pack.framework_id,
            name: pack.name,
            version: pack.version,
            status: pack.status,
          });
        }
      }

      const active = await base44.asServiceRole.entities.ELIMKnowledgePack.filter({ status: 'active' }, '-created_date', 50);
      const all = await base44.asServiceRole.entities.ELIMKnowledgePack.list('-created_date', 100);
      const draft = await base44.asServiceRole.entities.ELIMKnowledgePack.filter({ status: 'draft' }, '-created_date', 50);
      const archived = await base44.asServiceRole.entities.ELIMKnowledgePack.filter({ status: 'archived' }, '-created_date', 50);
      knowledgePacks = {
        total: all.length,
        active: active.length,
        draft: draft.length,
        archived: archived.length,
        active_packs: active.map((p) => ({
          pack_id: p.pack_id,
          name: p.name,
          framework_id: p.framework_id,
          version: p.version,
          status: p.status,
        })),
      };
    } catch (e) {
      // ELIMKnowledgePack entity may not exist yet — fall back to canonical definition
      knowledgePacks = {
        total: PLATFORM_KNOWLEDGE_PACKS.length,
        active: PLATFORM_KNOWLEDGE_PACKS.filter((p) => p.status === 'active').length,
        draft: PLATFORM_KNOWLEDGE_PACKS.filter((p) => p.status === 'draft').length,
        archived: PLATFORM_KNOWLEDGE_PACKS.filter((p) => p.status === 'archived').length,
        active_packs: PLATFORM_KNOWLEDGE_PACKS.filter((p) => p.status === 'active'),
      };
    }

    // ── Entity health check ──
    const entityHealth = {};
    const keyEntities = [
      'UserProfile', 'ExecutiveCompetency', 'JourneyEvent',
      'ExecutiveReputation', 'LeadershipDNA', 'ELIMKnowledgePack',
      'Subscription', 'Feature', 'Organization',
    ];
    for (const entityName of keyEntities) {
      try {
        const accessor = base44.asServiceRole.entities[entityName];
        if (accessor) {
          const records = await accessor.list('-created_date', 1);
          entityHealth[entityName] = { accessible: true, hasRecords: records.length > 0 };
        } else {
          entityHealth[entityName] = { accessible: false, error: 'Entity accessor not found' };
        }
      } catch (e) {
        entityHealth[entityName] = { accessible: false, error: e.message };
      }
    }

    // ── Config version check ──
    let configVersion = null;
    try {
      const configRes = await base44.asServiceRole.functions.invoke('manageConfig', { action: 'get' });
      configVersion = configRes?.data?.version || configRes?.data?.config_version || null;
    } catch (e) {}

    // ── Validation warnings ──
    const warnings = [];

    if (knowledgePacks.active === 0) {
      warnings.push({
        level: 'warning',
        code: 'NO_ACTIVE_KNOWLEDGE_PACKS',
        message: 'No active ELIM™ Knowledge Packs found. EXEC™ may rely on hardcoded knowledge instead of dynamic Knowledge Pack Engine™.',
      });
    }

    if (knowledgePacks.draft > 0) {
      warnings.push({
        level: 'info',
        code: 'DRAFT_KNOWLEDGE_PACKS',
        message: `${knowledgePacks.draft} Knowledge Pack(s) are in draft status. Review and activate them in the ELIM™ Management Center.`,
      });
    }

    const inaccessibleEntities = Object.entries(entityHealth)
      .filter(([_, v]) => !v.accessible)
      .map(([k]) => k);
    if (inaccessibleEntities.length > 0) {
      warnings.push({
        level: 'warning',
        code: 'INACCESSIBLE_ENTITIES',
        message: `Platform Manifest™ cannot access ${inaccessibleEntities.length} key entity(ies): ${inaccessibleEntities.join(', ')}.`,
      });
    }

    if (!configVersion) {
      warnings.push({
        level: 'info',
        code: 'CONFIG_VERSION_UNKNOWN',
        message: 'Platform config version could not be retrieved. Cache invalidation may not work correctly.',
      });
    }

    const syncStatus = warnings.filter((w) => w.level === 'warning').length === 0 ? 'synced' : 'needs_attention';

    return Response.json({
      status: 'success',
      sync_status: syncStatus,
      manifest_version: manifestVersion,
      platform_version: platformVersion,
      knowledge_version: knowledgeVersion,
      framework_version: frameworkVersion,
      prompt_version: promptVersion,
      config_version: configVersion,
      build_number: buildNumber,
      knowledge_packs: knowledgePacks,
      entity_health: entityHealth,
      warnings,
      warning_count: warnings.length,
      synchronized_at: new Date().toISOString(),
      triggered_by: isManualCall ? 'manual_admin' : 'scheduled_automation',
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
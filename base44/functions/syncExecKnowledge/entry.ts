import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Handle both manual admin calls and scheduled automation calls.
    // Scheduled automations have no user token — proceed with service role.
    let user = null;
    let isManualCall = false;
    try {
      user = await base44.auth.me();
      isManualCall = true;
    } catch (e) {
      // Scheduled automation — no user context
    }

    // Only block non-admin authenticated users from manual calls
    if (isManualCall && user && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });
    }

    // ── Version metadata (mirrors src/lib/execKnowledgeBase.js) ──
    const platformVersion = '2.0';
    const knowledgeVersion = '2.0';
    const promptVersion = '2.0';
    const lastSync = '2026-07-11';

    // ── Framework versions (mirrors src/lib/eelmMethodology.js + competencyCatalog.js) ──
    const frameworkVersions = {
      eelm: { name: 'EELM™', full: 'EXECLEAD Executive Leadership Methodology™', version: '1.0' },
      elim: { name: 'ELIM™', full: 'EXECLEAD Leadership Intelligence Model™', version: '1.0' },
      eecf: { name: 'EECF™', full: 'EXECLEAD Executive Competency Framework™', version: '1.0' },
      leadership_dna: { name: 'Leadership DNA™', version: '1.0' },
      readiness: { name: 'Executive Readiness™', version: '1.0' },
      reputation: { name: 'Executive Reputation™', version: '1.0' },
      journey: { name: 'Executive Journey™', version: '1.0' },
      trust: { name: 'Executive Trust™', version: '1.0' },
      passport: { name: 'Executive Passport™', version: '1.0' },
      intelligence_profile: { name: 'Executive Intelligence Profile™', version: '1.0' },
    };

    // ── Knowledge Pack status from ELIMKnowledgePack entity ──
    let knowledgePacks = [];
    let knowledgePackCount = 0;
    let activePackCount = 0;
    let draftPacks = [];
    let archivedPacks = [];
    try {
      knowledgePacks = await base44.asServiceRole.entities.ELIMKnowledgePack.filter({ status: 'active' }, '-created_date', 50);
      activePackCount = knowledgePacks.length;
      const allPacks = await base44.asServiceRole.entities.ELIMKnowledgePack.list('-created_date', 100);
      knowledgePackCount = allPacks.length;
      draftPacks = await base44.asServiceRole.entities.ELIMKnowledgePack.filter({ status: 'draft' }, '-created_date', 50);
      archivedPacks = await base44.asServiceRole.entities.ELIMKnowledgePack.filter({ status: 'archived' }, '-created_date', 50);
    } catch (e) {
      // ELIMKnowledgePack entity may not exist yet
    }

    // ── Config version check ──
    let configVersion = null;
    try {
      const configRes = await base44.asServiceRole.functions.invoke('manageConfig', { action: 'get' });
      configVersion = configRes?.data?.version || configRes?.data?.config_version || null;
    } catch (e) {}

    // ── Entity health check (verify key entities are accessible) ──
    const entityHealth = {};
    const keyEntities = ['UserProfile', 'ExecutiveCompetency', 'JourneyEvent', 'ExecutiveReputation', 'LeadershipDNA'];
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

    // ── Sync report & warnings (self-healing detection) ──
    const warnings = [];

    if (activePackCount === 0) {
      warnings.push({
        level: 'warning',
        code: 'NO_ACTIVE_KNOWLEDGE_PACKS',
        message: 'No active ELIM™ Knowledge Packs found. EXEC™ may rely on hardcoded knowledge instead of dynamic Knowledge Pack Engine™.',
      });
    }

    if (draftPacks.length > 0) {
      warnings.push({
        level: 'info',
        code: 'DRAFT_KNOWLEDGE_PACKS',
        message: `${draftPacks.length} Knowledge Pack(s) are in draft status. Review and activate them in the ELIM™ Management Center.`,
      });
    }

    // Entity health warnings
    const inaccessibleEntities = Object.entries(entityHealth)
      .filter(([_, v]) => !v.accessible)
      .map(([k]) => k);
    if (inaccessibleEntities.length > 0) {
      warnings.push({
        level: 'warning',
        code: 'INACCESSIBLE_ENTITIES',
        message: `EXEC™ cannot access ${inaccessibleEntities.length} key entity(ies): ${inaccessibleEntities.join(', ')}. Intelligence computations may fail.`,
      });
    }

    // Config version warning
    if (!configVersion) {
      warnings.push({
        level: 'info',
        code: 'CONFIG_VERSION_UNKNOWN',
        message: 'Platform config version could not be retrieved. Cache invalidation may not work correctly.',
      });
    }

    // ── Synchronization status ──
    const syncStatus = warnings.filter(w => w.level === 'warning').length === 0 ? 'synced' : 'needs_attention';

    return Response.json({
      status: 'success',
      sync_status: syncStatus,
      platform_version: platformVersion,
      knowledge_version: knowledgeVersion,
      prompt_version: promptVersion,
      config_version: configVersion,
      last_synchronized: lastSync,
      framework_versions: frameworkVersions,
      framework_count: Object.keys(frameworkVersions).length,
      knowledge_packs: {
        total: knowledgePackCount,
        active: activePackCount,
        draft: draftPacks.length,
        archived: archivedPacks.length,
        active_packs: knowledgePacks.map(p => ({
          pack_id: p.pack_id,
          name: p.name,
          framework_id: p.framework_id,
          version: p.version,
          status: p.status,
        })),
      },
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
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    // ── Knowledge Pack status from ELIMKnowledgePack entity ──
    let knowledgePacks = [];
    let knowledgePackCount = 0;
    let activePackCount = 0;
    try {
      knowledgePacks = await base44.asServiceRole.entities.ELIMKnowledgePack.filter({ status: 'active' }, '-created_date', 50);
      activePackCount = knowledgePacks.length;
      const allPacks = await base44.asServiceRole.entities.ELIMKnowledgePack.list('-created_date', 100);
      knowledgePackCount = allPacks.length;
    } catch (e) {
      // ELIMKnowledgePack entity may not exist yet
    }

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

    // ── Knowledge sync metadata ──
    const knowledgeVersion = '2.0';
    const promptVersion = '2.0';
    const lastSync = '2026-07-11';

    // ── Sync report ──
    const warnings = [];

    if (activePackCount === 0) {
      warnings.push({
        level: 'warning',
        code: 'NO_ACTIVE_KNOWLEDGE_PACKS',
        message: 'No active ELIM™ Knowledge Packs found. EXEC™ may rely on hardcoded knowledge instead of dynamic Knowledge Pack Engine™.',
      });
    }

    // Check for draft packs that should be activated
    let draftPacks = [];
    try {
      draftPacks = await base44.asServiceRole.entities.ELIMKnowledgePack.filter({ status: 'draft' }, '-created_date', 50);
    } catch (e) {}
    if (draftPacks.length > 0) {
      warnings.push({
        level: 'info',
        code: 'DRAFT_KNOWLEDGE_PACKS',
        message: `${draftPacks.length} Knowledge Pack(s) are in draft status. Review and activate them in the ELIM™ Management Center.`,
      });
    }

    return Response.json({
      status: 'success',
      knowledge_version: knowledgeVersion,
      prompt_version: promptVersion,
      last_synchronized: lastSync,
      framework_versions: frameworkVersions,
      knowledge_packs: {
        total: knowledgePackCount,
        active: activePackCount,
        active_packs: knowledgePacks.map(p => ({
          pack_id: p.pack_id,
          name: p.name,
          framework_id: p.framework_id,
          version: p.version,
          status: p.status,
        })),
      },
      warnings,
      synchronized_at: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
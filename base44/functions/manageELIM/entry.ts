import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin access required' }, { status: 403 });

    const body = await req.json();
    const { action } = body;

    switch (action) {
      case 'list_knowledge_packs': {
        const packs = await base44.asServiceRole.entities.ELIMKnowledgePack.list();
        return Response.json({ packs });
      }
      case 'create_knowledge_pack': {
        const pack = await base44.asServiceRole.entities.ELIMKnowledgePack.create({
          ...body.pack,
          created_by_id: user.id,
          created_by_name: user.full_name,
        });
        return Response.json({ pack });
      }
      case 'update_knowledge_pack': {
        const pack = await base44.asServiceRole.entities.ELIMKnowledgePack.update(body.pack_id, body.updates);
        return Response.json({ pack });
      }
      case 'delete_knowledge_pack': {
        await base44.asServiceRole.entities.ELIMKnowledgePack.delete(body.pack_id);
        return Response.json({ success: true });
      }
      case 'publish_version': {
        const pack = await base44.asServiceRole.entities.ELIMKnowledgePack.update(body.pack_id, {
          status: 'active',
          published_at: new Date().toISOString(),
          version: body.version || '1.0',
        });
        return Response.json({ pack });
      }
      case 'get_analytics': {
        const packs = await base44.asServiceRole.entities.ELIMKnowledgePack.list();
        const active = packs.filter((p) => p.status === 'active');
        const drafts = packs.filter((p) => p.status === 'draft');
        const archived = packs.filter((p) => p.status === 'archived');
        return Response.json({
          totalKnowledgePacks: packs.length,
          active: active.length,
          drafts: drafts.length,
          archived: archived.length,
          frameworks: 5,
          intelligenceScores: 14,
          evidenceSources: 21,
          frameworkVersions: active.reduce((acc, p) => {
            acc[p.framework_id] = p.version;
            return acc;
          }, {}),
        });
      }
      default:
        return Response.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
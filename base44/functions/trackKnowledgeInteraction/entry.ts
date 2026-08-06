import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const TYPES = ['search', 'no_result', 'article_view', 'vote', 'ai_ask', 'related_click', 'trust_ref'];

export default async function(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const type = body.interaction_type;
    if (!TYPES.includes(type)) {
      return Response.json({ ok: false, error: 'invalid interaction_type' }, { status: 400 });
    }
    const record = {
      interaction_type: type,
      query: (body.query || '').toString().slice(0, 240),
      slug: (body.slug || '').toString().slice(0, 120),
      category: (body.category || '').toString().slice(0, 80),
      audience: (body.audience || '').toString().slice(0, 40),
      source: (body.source || 'hub').toString().slice(0, 20),
      session_id: (body.session_id || 'anon').toString().slice(0, 64),
      user_id: body.user_id || null,
      path: (body.path || '').toString().slice(0, 200),
      referrer_path: (body.referrer_path || '').toString().slice(0, 300),
      helpful: !!body.helpful,
      result_count: Number(body.result_count) || 0,
      confidence: Number(body.confidence) || 0,
      ai_sources_count: Number(body.ai_sources_count) || 0,
      ai_no_result: !!body.ai_no_result,
      cited_slugs_json: body.cited_slugs_json ? JSON.stringify(body.cited_slugs_json).slice(0, 2000) : null,
      occurred_at: body.occurred_at || new Date().toISOString(),
    };
    const base44 = createClientFromRequest(req);
    await base44.asServiceRole.entities.KnowledgeInteraction.bulkCreate([record]);
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}
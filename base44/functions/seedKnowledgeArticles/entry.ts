import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { ARTICLES } from '../../shared/knowledgeArticles.js';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const existing = await base44.asServiceRole.entities.KnowledgeArticle.list('-updated_date', 500);
    const existingSlugs = new Set((existing || []).map((r) => r.slug));
    const toCreate = ARTICLES.filter((a) => !existingSlugs.has(a.slug)).map((a) => ({ ...a }));
    if (toCreate.length === 0) {
      return Response.json({ seeded: 0, total: existing.length, message: 'Knowledge library already up to date' });
    }
    const created = await base44.asServiceRole.entities.KnowledgeArticle.bulkCreate(toCreate);
    return Response.json({ seeded: created.length, total: (existing?.length || 0) + created.length });
  } catch (error) {
    return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
}
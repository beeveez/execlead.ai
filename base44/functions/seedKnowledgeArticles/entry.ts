import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { ARTICLES } from '../../shared/knowledgeArticles.js';
import { authorizeKnowledgeFunction } from '../../shared/knowledgeFunctionSecurity.ts';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const { response } = await authorizeKnowledgeFunction(req, base44, {
      action: 'seed_knowledge_articles',
      allowServiceToken: false,
      limit: 2,
      windowMs: 3_600_000,
    });
    if (response) return response;

    const existing = await base44.asServiceRole.entities.KnowledgeArticle.list('-updated_date', 500);
    const existingSlugs = new Set((existing || []).map((record) => record.slug));
    const toCreate = ARTICLES.filter((article) => !existingSlugs.has(article.slug)).map((article) => ({ ...article }));
    if (toCreate.length === 0) {
      return Response.json({ seeded: 0, total: existing.length, message: 'Knowledge library already up to date' });
    }
    const created = await base44.asServiceRole.entities.KnowledgeArticle.bulkCreate(toCreate);
    return Response.json({ seeded: created.length, total: (existing?.length || 0) + created.length });
  } catch {
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
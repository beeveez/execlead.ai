import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { computeKnowledgeIntelligence } from '../../shared/knowledgeIntelligenceEngine.js';
import { authorizeKnowledgeFunction } from '../../shared/knowledgeFunctionSecurity.ts';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const { response } = await authorizeKnowledgeFunction(req, base44, {
      action: 'get_knowledge_intelligence',
      allowServiceToken: false,
      limit: 30,
      windowMs: 60_000,
    });
    if (response) return response;

    const [interactions, articles] = await Promise.all([
      base44.asServiceRole.entities.KnowledgeInteraction.list('-created_date', 1000),
      base44.asServiceRole.entities.KnowledgeArticle.filter({ published: true }, '-updated_date', 500),
    ]);
    const intelligence = computeKnowledgeIntelligence(interactions || [], articles || []);
    return Response.json({ data: intelligence });
  } catch {
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
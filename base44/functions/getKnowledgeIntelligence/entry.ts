import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { computeKnowledgeIntelligence } from '../../shared/knowledgeIntelligenceEngine.js';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const [interactions, articles] = await Promise.all([
      base44.asServiceRole.entities.KnowledgeInteraction.list('-created_date', 1000),
      base44.asServiceRole.entities.KnowledgeArticle.filter({ published: true }, '-updated_date', 500),
    ]);
    const intelligence = computeKnowledgeIntelligence(interactions || [], articles || []);
    return Response.json({ data: intelligence });
  } catch (error) {
    return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
}
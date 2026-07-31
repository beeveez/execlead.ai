import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Public landing-page statistics.
// Returns real aggregate counts of evidence-based executive activity on the platform.
// Service role is used so unauthenticated visitors see accurate totals (read-only aggregates).
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const LIMIT = 100;
    const [scenarios, companies, stories, identities, evidence] = await Promise.all([
      base44.asServiceRole.entities.DecisionScenario.filter({}, undefined, LIMIT),
      base44.asServiceRole.entities.Company.filter({}, undefined, LIMIT),
      base44.asServiceRole.entities.ExecutiveSuccessStory.filter({}, undefined, LIMIT),
      base44.asServiceRole.entities.ExecutiveIdentity.filter({}, undefined, LIMIT),
      base44.asServiceRole.entities.EvidenceItem.filter({}, undefined, LIMIT),
    ]);
    return Response.json({
      simulations: scenarios.length,
      companies: companies.length,
      stories: stories.length,
      identities: identities.length,
      evidence: evidence.length,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Public landing-page statistics.
// Returns real aggregate counts of evidence-based executive activity on the platform.
// Service role is used so unauthenticated visitors see accurate totals (read-only aggregates).
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const LIMIT = 100;
    const [assessments, attempts, evidence, stories, identities] = await Promise.all([
      base44.asServiceRole.entities.ReadinessAssessment.filter({}, undefined, LIMIT),
      base44.asServiceRole.entities.DecisionAttempt.filter({}, undefined, LIMIT),
      base44.asServiceRole.entities.EvidenceItem.filter({}, undefined, LIMIT),
      base44.asServiceRole.entities.ExecutiveSuccessStory.filter({}, undefined, LIMIT),
      base44.asServiceRole.entities.ExecutiveIdentity.filter({}, undefined, LIMIT),
    ]);
    return Response.json({
      readinessJourneys: assessments.length,
      simulationsCompleted: attempts.length,
      evidenceRecords: evidence.length,
      executiveStories: stories.length,
      executiveIdentities: identities.length,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
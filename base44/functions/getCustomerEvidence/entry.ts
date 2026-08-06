import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const FALLBACK = "Growing with our Founding Members.";
const LIST_LIMIT = 1000;

function lastUpdated(records) {
  let latest = null;
  for (const r of records) {
    const t = r.updated_date || r.created_date;
    if (t && (!latest || t > latest)) latest = t;
  }
  return latest;
}

function buildMetric(key, label, value, source, records, isCount, formatter) {
  const sufficient = isCount
    ? (typeof value === "number" && value > 0)
    : (value !== null && value !== undefined);
  return {
    key,
    label,
    value: sufficient ? value : null,
    display: sufficient ? (formatter ? formatter(value) : String(value)) : null,
    source,
    lastUpdated: lastUpdated(records),
    sufficient,
  };
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);

    const [assessments, simulations, stories, identities, outcomes, founders, companies] = await Promise.all([
      base44.asServiceRole.entities.ReadinessAssessment.list("-updated_date", LIST_LIMIT),
      base44.asServiceRole.entities.DecisionAttempt.list("-updated_date", LIST_LIMIT),
      base44.asServiceRole.entities.ExecutiveSuccessStory.filter({ published: true }, "-updated_date", LIST_LIMIT),
      base44.asServiceRole.entities.ExecutiveIdentity.list("-updated_date", LIST_LIMIT),
      base44.asServiceRole.entities.ExecutiveOutcome.list("-updated_date", LIST_LIMIT),
      base44.asServiceRole.entities.FoundingMember.list("-updated_date", LIST_LIMIT),
      base44.asServiceRole.entities.Company.list("-updated_date", LIST_LIMIT),
    ]);

    // Average Readiness Improvement — per user, first vs last overall_score by created_date.
    const byUser = new Map();
    for (const a of assessments) {
      if (!a.user_id || typeof a.overall_score !== "number") continue;
      const arr = byUser.get(a.user_id) || [];
      arr.push(a);
      byUser.set(a.user_id, arr);
    }
    let impSum = 0;
    let impCount = 0;
    for (const arr of byUser.values()) {
      if (arr.length < 2) continue;
      const sorted = arr.slice().sort((a, b) => (a.created_date || "").localeCompare(b.created_date || ""));
      const delta = sorted[sorted.length - 1].overall_score - sorted[0].overall_score;
      if (Number.isFinite(delta)) {
        impSum += delta;
        impCount += 1;
      }
    }
    const avgImprovement = impCount > 0 ? Math.round((impSum / impCount) * 10) / 10 : null;

    const activeFounders = founders.filter(
      (f) => f.founding_member === true || ["active", "verified", "lifetime"].includes(f.status)
    );
    const liveCompanies = companies.filter((c) => c.is_archived !== true);

    const metrics = [
      buildMetric("assessments", "Executive Readiness Assessments Completed", assessments.length, "ReadinessAssessment", assessments, true),
      buildMetric("simulations", "Executive Simulations Completed", simulations.length, "DecisionAttempt", simulations, true),
      buildMetric("successStories", "Executive Success Stories Published", stories.length, "ExecutiveSuccessStory", stories, true),
      buildMetric("identityProfiles", "Executive Identity Profiles Created", identities.length, "ExecutiveIdentity", identities, true),
      buildMetric("avgImprovement", "Average Readiness Improvement", avgImprovement, "ReadinessAssessment", assessments, false, (v) => `+${v} pts`),
      buildMetric("outcomes", "Executive Outcomes Reported", outcomes.length, "ExecutiveOutcome", outcomes, true),
      buildMetric("foundingMembers", "Active Founding Members", activeFounders.length, "FoundingMember", founders, true),
      buildMetric("companies", "Companies Represented", liveCompanies.length, "Company", companies, true),
    ];

    const anySufficient = metrics.some((m) => m.sufficient);

    return Response.json({
      metrics,
      anySufficient,
      fallbackMessage: FALLBACK,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json(
      { error: error.message, metrics: [], anySufficient: false, fallbackMessage: FALLBACK },
      { status: 500 }
    );
  }
}
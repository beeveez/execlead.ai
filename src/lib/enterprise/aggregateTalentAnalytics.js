import { evaluateHighPotential } from "@/lib/enterprise/highPotentialEngine";
import { forecastPromotion } from "@/lib/enterprise/promotionForecastEngine";

export const READINESS_BUCKETS = { emerging: "0–39", operational: "40–59", strategic: "60–79", executive: "80–100" };
const bucketFor = (score) => score < 40 ? "emerging" : score < 60 ? "operational" : score < 80 ? "strategic" : "executive";
const delta = (current, previous) => previous == null ? null : Math.round((current - previous) * 10) / 10;

export function aggregateTalentAnalytics(records = [], previousSnapshot = null) {
  const organizations = new Set(records.map((record) => record.organizationId).filter(Boolean));
  if (organizations.size > 1) throw new Error("Cross-organization talent aggregation is not permitted.");
  const completed = records.filter((record) => record.status === "completed" || record.status === "calibrated");
  const scores = completed.map((record) => Number(record.readinessScore || 0));
  const distribution = { emerging: 0, operational: 0, strategic: 0, executive: 0 };
  scores.forEach((score) => { distribution[bucketFor(score)] += 1; });
  const highPotentialCount = completed.filter((record) => evaluateHighPotential(record).flagged).length;
  const promotionReadyCount = completed.filter((record) => forecastPromotion(record).category === "ready_now").length;
  const averageReadinessScore = scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0;
  const invitedCount = records.length;
  const startedCount = records.filter((record) => record.status !== "invited").length;
  const completedCount = completed.length;
  const completionRate = invitedCount ? Math.round((completedCount / invitedCount) * 1000) / 10 : 0;
  const successionBenchStrength = Math.min(100, Math.round(((promotionReadyCount * 2 + highPotentialCount) / Math.max(1, completedCount)) * 100));
  return { invitedCount, startedCount, completedCount, completionRate, averageReadinessScore, readinessDistribution: { buckets: distribution, labels: READINESS_BUCKETS }, highPotentialCount, promotionReadyCount, successionBenchStrength, trend: { completionRate: delta(completionRate, previousSnapshot?.completionRate), averageReadiness: delta(averageReadinessScore, previousSnapshot?.averageReadinessScore), highPotential: delta(highPotentialCount, previousSnapshot?.highPotentialCount), promotionReady: delta(promotionReadyCount, previousSnapshot?.promotionReadyCount) } };
}

export function aggregateCohorts(records = [], previousSnapshots = {}) {
  const cohorts = records.reduce((groups, record) => ({ ...groups, [record.cohortId]: [...(groups[record.cohortId] || []), record] }), {});
  return Object.fromEntries(Object.entries(cohorts).map(([cohortId, cohortRecords]) => [cohortId, aggregateTalentAnalytics(cohortRecords, previousSnapshots[cohortId])]));
}

export const maskEmployeeIdentifier = (value = "") => value.length < 5 ? "••••" : `${value.slice(0, 2)}•••${value.slice(-2)}`;
export const prepareMaskedTalentExport = (candidates = []) => candidates.map((candidate, index) => ({ ...candidate, employeeId: maskEmployeeIdentifier(candidate.employeeId), recommendedDevelopmentActions: { ...candidate.recommendedDevelopmentActions, displayName: `Employee ${String(index + 1).padStart(3, "0")}` } }));
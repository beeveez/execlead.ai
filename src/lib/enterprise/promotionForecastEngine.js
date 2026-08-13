import { recordForecastGeneration } from "@/lib/enterprise/talentAudit";

export const FORECAST_LABELS = {
  ready_now: "Ready Now",
  ready_6_months: "Ready in 3–6 Months",
  ready_12_months: "Ready in 6–12 Months",
  development_needed: "Development Required",
};

const clamp = (value) => Math.max(0, Math.min(100, Math.round(value)));

export function forecastPromotion(input = {}) {
  const signals = [input.readinessScore, input.simulationPerformance, input.missionCompletionRate, input.strategicJudgmentIndex, input.communicationIndex].map(Number);
  const composite = signals.reduce((sum, value) => sum + (value || 0), 0) / signals.length;
  const adjusted = composite + Math.min(10, Number(input.growthVelocity || 0) / 3) - Math.min(15, Number(input.competencyGapSeverity || 0) / 4);
  const category = adjusted >= 82 ? "ready_now" : adjusted >= 70 ? "ready_6_months" : adjusted >= 58 ? "ready_12_months" : "development_needed";
  const mean = signals.reduce((sum, value) => sum + value, 0) / signals.length;
  const variance = signals.reduce((sum, value) => sum + ((value - mean) ** 2), 0) / signals.length;
  const consistency = clamp(100 - Math.sqrt(variance) * 2);
  const evidenceVolume = clamp(Number(input.leadershipEvidenceCount || 0) * 8);
  return { category, label: FORECAST_LABELS[category], forecastConfidence: clamp(evidenceVolume * 0.55 + consistency * 0.45), compositeScore: clamp(adjusted) };
}

export async function generatePromotionForecast(input, auditContext) {
  const result = forecastPromotion(input);
  await recordForecastGeneration(auditContext);
  return result;
}
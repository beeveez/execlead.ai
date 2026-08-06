// Enterprise Scenario Engine™ — Conservative / Expected / Optimistic + custom
// multiplier. Produces comparable scenario result sets with confidence.
import { calculateRoi } from "./enterpriseMetrics";

export const SCENARIO_PRESETS = {
  conservative: { factor: 0.6, label: "Conservative" },
  expected: { factor: 1, label: "Expected" },
  optimistic: { factor: 1.4, label: "Optimistic" },
};

const SCENARIO_KEYS = ["adminTimeReduction", "reportingAutomation", "assessmentThroughputIncrease", "leadershipCoverageGrowth", "aiCoachingAdoption", "internalPromotionImprovement", "executiveHiringReduction", "assessmentStandardization", "managerProductivityImprovement", "hrProductivityImprovement"];

export function applyScenario(assumptions, factor) {
  const out = { ...assumptions };
  for (const k of SCENARIO_KEYS) out[k] = Math.min(100, Math.round(Number(assumptions[k] || 0) * factor));
  return out;
}

export function buildScenarios(inputs, assumptions, customFactor = 1) {
  const presets = Object.entries(SCENARIO_PRESETS).map(([key, preset]) => {
    const a = key === "expected" ? assumptions : applyScenario(assumptions, preset.factor);
    return { key, label: preset.label, factor: preset.factor, result: calculateRoi(inputs, a) };
  });
  const custom = { key: "custom", label: "Custom", factor: customFactor, result: calculateRoi(inputs, applyScenario(assumptions, customFactor)) };
  return [...presets, custom];
}
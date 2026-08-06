// Enterprise Upgrade Triggers — intelligent, value-framed upgrade
// recommendations based on utilization thresholds. Recommendations emphasize
// value, not limitations.

function pct(used, total) {
  if (!total) return 0;
  return Math.min(100, Math.round(((used || 0) / total) * 100));
}

const TEMPLATES = [
  {
    id: "simulation_allocation_high",
    test: (u) => pct(u.simulationCreditsUsed, u.simulationCreditsTotal) >= 90,
    title: "Executive Simulation allocation nearing its annual limit",
    message: (u) =>
      `This organization has consumed ${pct(u.simulationCreditsUsed, u.simulationCreditsTotal)}% of its annual Executive Simulation allocation.`,
    cta: "Unlock unlimited Executive Simulations with Enterprise Leadership OS™",
    severity: "high",
  },
  {
    id: "assessment_capacity_high",
    test: (u) => pct(u.assessmentCapacityUsed, u.assessmentCapacityTotal) >= 85,
    title: "Leadership assessment capacity nearing its limit",
    message: (u) =>
      `Your organization has reached ${pct(u.assessmentCapacityUsed, u.assessmentCapacityTotal)}% leadership assessment capacity.`,
    cta: "Expand assessment capacity with Enterprise Leadership OS™",
    severity: "high",
  },
  {
    id: "simulation_allocation_medium",
    test: (u) => pct(u.simulationCreditsUsed, u.simulationCreditsTotal) >= 70,
    title: "Plan ahead for Executive Simulations",
    message: (u) =>
      `Your organization has used ${pct(u.simulationCreditsUsed, u.simulationCreditsTotal)}% of its annual simulation allocation. Expansion bundles keep momentum without disruption.`,
    cta: "Explore Expansion Credit bundles",
    severity: "medium",
  },
];

export function evaluateUpgradeTriggers(utilization = {}) {
  return TEMPLATES.filter((t) => t.test(utilization)).map((t) => ({
    id: t.id,
    title: t.title,
    message: t.message(utilization),
    cta: t.cta,
    severity: t.severity,
  }));
}
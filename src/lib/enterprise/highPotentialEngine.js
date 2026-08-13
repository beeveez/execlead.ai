export function evaluateHighPotential(input = {}) {
  const checks = [
    [input.readinessScore >= 72, "Readiness is at or above 72"],
    [input.growthVelocity >= 15, "Growth velocity is at or above 15%"],
    [input.simulationPerformance >= 80, "Simulation performance is at or above 80"],
    [input.strategicJudgmentIndex >= 75, "Strategic judgment is at or above 75"],
    [input.missionCompletionRate >= 70, "Mission completion is at or above 70%"],
  ];
  const passed = checks.filter(([ok]) => ok);
  return {
    flagged: passed.length === checks.length,
    confidence: Math.round((passed.length / checks.length) * 100),
    rationale: passed.map(([, rationale]) => rationale),
  };
}

export const isHighPotential = (input) => evaluateHighPotential(input).flagged;
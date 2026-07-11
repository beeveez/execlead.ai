/**
 * EXECLEAD.AI — Feature Governance Rule™
 * ========================================
 * One governance rule that guides every major feature decision.
 *
 * Every major feature proposal must answer three questions before
 * development begins:
 *
 *   1. Does it improve executive outcomes?      (customer value)
 *   2. Does it strengthen EXEC™'s reasoning?    (competitive differentiation)
 *   3. Can it be built using the existing foundation? (architectural discipline)
 *
 * If a proposed feature cannot satisfy at least two of those three
 * criteria, it should be deferred.
 *
 * This discipline keeps the platform growing in depth rather than
 * accumulating more modules, keeping it coherent and aligned with its
 * vision as an Executive Intelligence Operating System.
 */

export const FEATURE_GOVERNANCE_CRITERIA = [
  {
    id: "executive_outcomes",
    label: "Improves Executive Outcomes",
    description: "Does it improve executive outcomes? (customer value)",
    pillar: "Customer Value",
  },
  {
    id: "exec_reasoning",
    label: "Strengthens EXEC™'s Reasoning",
    description: "Does it strengthen EXEC™'s reasoning? (competitive differentiation)",
    pillar: "Competitive Differentiation",
  },
  {
    id: "foundation_reuse",
    label: "Built on Existing Foundation",
    description: "Can it be built using the existing foundation? (architectural discipline)",
    pillar: "Architectural Discipline",
  },
];

export const FEATURE_GOVERNANCE_THRESHOLD = 2;

export const PLATFORM_PHILOSOPHY_QUESTION =
  "Does this make EXEC™ think better, or merely add another feature?";

export const FEATURE_GOVERNANCE_RULE = {
  id: "feature-governance-rule",
  name: "Feature Governance Rule™",
  version: "1.1",
  threshold: FEATURE_GOVERNANCE_THRESHOLD,
  criteria: FEATURE_GOVERNANCE_CRITERIA,
  preScreenQuestion: PLATFORM_PHILOSOPHY_QUESTION,
  principle:
    "Every major feature proposal must first pass the philosophy pre-screen, then satisfy at least two of three criteria before development begins. " +
    "This discipline helps EXECLEAD.AI grow in depth rather than simply accumulating more modules, " +
    "keeping the platform coherent and aligned with its vision as an Executive Intelligence Operating System.",
  escalationPath: "/developer/product",
};

/**
 * Philosophy pre-screen — the single gating question for every new capability.
 * If the answer is only "another feature," the proposal is deferred before
 * the three-criteria evaluation even runs.
 * @param {string} answer — "think_better" | "another_feature"
 * @returns {{ passed: boolean, reason: string }}
 */
export function evaluatePhilosophyPreScreen(answer) {
  if (answer === "think_better") {
    return { passed: true, reason: "Capability makes EXEC™ think better — proceeds to criteria evaluation." };
  }
  return { passed: false, reason: "Merely adds another feature — reconsider its priority." };
}

/**
 * Evaluate a feature proposal against the governance rule.
 * @param {Object} assessment — { executive_outcomes: bool, exec_reasoning: bool, foundation_reuse: bool }
 * @returns {{ passed: boolean, score: number, satisfied: string[], deferred: string[] }}
 */
export function evaluateFeatureProposal(assessment = {}) {
  const satisfied = FEATURE_GOVERNANCE_CRITERIA.filter(
    (c) => assessment[c.id] === true
  ).map((c) => c.id);
  const score = satisfied.length;
  return {
    passed: score >= FEATURE_GOVERNANCE_THRESHOLD,
    score,
    satisfied,
    deferred: FEATURE_GOVERNANCE_CRITERIA.filter((c) => !satisfied.includes(c.id)).map(
      (c) => c.id
    ),
  };
}
/**
 * EXECLEAD.AI — Architecture Impact Score™ Engine
 * ============================================================
 * Computes the overall Architecture Impact Score™ from eight
 * dimensions and derives a board recommendation.
 *
 * Dimensions (each 0-100):
 *   Complexity, Reusability, Maintainability, Scalability,
 *   Performance, Security, UX Consistency, Technical Debt
 *
 * Scoring philosophy:
 *   • Complexity: LOWER is better (high complexity = high score penalty)
 *   • Technical Debt: LOWER is better (high debt = high score penalty)
 *   • All others: HIGHER is better
 */

export const SCORE_DIMENSIONS = [
  { key: "complexity_score",        label: "Complexity",        invert: true,  weight: 1.25, description: "How structurally complex the change is. Lower complexity is better." },
  { key: "reusability_score",       label: "Reusability",       invert: false, weight: 1.0,  description: "Whether the change creates reusable components or patterns." },
  { key: "maintainability_score",   label: "Maintainability",   invert: false, weight: 1.25, description: "How easy the change will be to maintain over time." },
  { key: "scalability_score",       label: "Scalability",       invert: false, weight: 1.0,  description: "Whether the change supports future growth." },
  { key: "performance_score",       label: "Performance",       invert: false, weight: 1.0,  description: "Impact on platform performance and latency." },
  { key: "security_score",          label: "Security",          invert: false, weight: 1.5,  description: "Security posture of the proposed change." },
  { key: "ux_consistency_score",    label: "UX Consistency",    invert: false, weight: 1.0,  description: "Alignment with platform design principles." },
  { key: "technical_debt_score",    label: "Technical Debt",    invert: true,  weight: 1.25, description: "How much technical debt the change introduces. Lower is better." },
];

/**
 * Compute the overall Architecture Impact Score™ (0-100).
 * Inverts complexity and technical debt before weighting.
 */
export function computeOverallScore(scores) {
  let weightedSum = 0;
  let totalWeight = 0;

  SCORE_DIMENSIONS.forEach((dim) => {
    const raw = scores[dim.key] ?? 0;
    const adjusted = dim.invert ? (100 - raw) : raw;
    weightedSum += adjusted * dim.weight;
    totalWeight += dim.weight;
  });

  return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
}

/**
 * Derive a recommendation from the overall score and security posture.
 * Security is a hard gate — a low security score can veto approval.
 */
export function deriveRecommendation(scores, overallScore) {
  const security = scores.security_score ?? 0;
  const techDebt = scores.technical_debt_score ?? 0;
  const complexity = scores.complexity_score ?? 0;

  // Hard veto: unacceptable security
  if (security < 30) {
    return {
      recommendation: "reject",
      rationale: "Security score is below the acceptable threshold (30). The proposal cannot proceed without addressing security concerns.",
    };
  }

  // Hard veto: excessive technical debt
  if (techDebt > 80) {
    return {
      recommendation: "reject",
      rationale: "Technical debt score exceeds 80. The proposal introduces unacceptable long-term maintenance burden.",
    };
  }

  if (overallScore >= 80 && complexity < 70) {
    return {
      recommendation: "approve",
      rationale: "The proposal scores highly across all dimensions with manageable complexity. Recommended for approval.",
    };
  }

  if (overallScore >= 60) {
    return {
      recommendation: "approve_with_conditions",
      rationale: "The proposal is viable but requires conditions to mitigate identified risks before implementation.",
    };
  }

  if (overallScore >= 40) {
    return {
      recommendation: "needs_revision",
      rationale: "The proposal has merit but significant dimensions need improvement before it can be approved.",
    };
  }

  return {
    recommendation: "reject",
    rationale: "The proposal scores below the minimum threshold across critical dimensions. Not recommended for implementation.",
  };
}

/**
 * Full evaluation — computes overall score and recommendation.
 */
export function evaluateProposal(scores) {
  const overallScore = computeOverallScore(scores);
  const { recommendation, rationale } = deriveRecommendation(scores, overallScore);
  return { overallScore, recommendation, rationale };
}

export const RECOMMENDATION_META = {
  approve:                  { label: "Approve",                  color: "#10b981", bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
  approve_with_conditions:  { label: "Approve with Conditions",  color: "#f59e0b", bg: "bg-amber-500/10",   text: "text-amber-400",   border: "border-amber-500/20" },
  needs_revision:           { label: "Needs Revision",           color: "#f97316", bg: "bg-orange-500/10",  text: "text-orange-400",  border: "border-orange-500/20" },
  reject:                   { label: "Reject",                   color: "#ef4444", bg: "bg-red-500/10",     text: "text-red-400",     border: "border-red-500/20" },
  pending:                  { label: "Pending",                  color: "#6b7280", bg: "bg-white/5",        text: "text-white/40",    border: "border-white/10" },
};

export const PROPOSAL_TYPE_META = {
  new_workspace:               { label: "New Workspace",               icon: "Building2" },
  new_navigation_section:      { label: "New Navigation Section",      icon: "Layers" },
  new_entity:                  { label: "New Entity",                  icon: "Database" },
  new_platform_service:        { label: "New Platform Service",        icon: "Server" },
  new_ai_engine:               { label: "New AI Engine",               icon: "Brain" },
  cross_workspace_integration: { label: "Cross-Workspace Integration", icon: "Network" },
  breaking_architectural_change: { label: "Breaking Architectural Change", icon: "AlertTriangle" },
};

export const STATUS_META = {
  draft:                   { label: "Draft",                   color: "#6b7280" },
  submitted:               { label: "Submitted",               color: "#3b82f6" },
  under_review:            { label: "Under Review",            color: "#a855f7" },
  approved:                { label: "Approved",                color: "#10b981" },
  approved_with_conditions:{ label: "Approved w/ Conditions",  color: "#f59e0b" },
  needs_revision:          { label: "Needs Revision",          color: "#f97316" },
  rejected:                { label: "Rejected",                color: "#ef4444" },
  implemented:             { label: "Implemented",             color: "#06b6d4" },
  archived:                { label: "Archived",                color: "#6b7280" },
};

/**
 * Generate the next proposal ID (AGB-YYYY-XXXX).
 */
export function generateProposalId(existing) {
  const year = new Date().getFullYear();
  const prefix = `AGB-${year}-`;
  const nums = (existing || [])
    .filter((p) => p.proposal_id?.startsWith(prefix))
    .map((p) => parseInt(p.proposal_id.replace(prefix, ""), 10))
    .filter((n) => !isNaN(n));
  const next = (nums.length > 0 ? Math.max(...nums) : 0) + 1;
  return `${prefix}${String(next).padStart(4, "0")}`;
}
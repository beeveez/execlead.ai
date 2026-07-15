/**
 * Platform Readiness Engine™
 * ============================
 * The SINGLE SOURCE OF TRUTH for all platform readiness,
 * certification, and release decisions.
 *
 * No individual page calculates readiness independently.
 * Every page consumes the runtime state produced by this engine.
 *
 * RESPONSIBILITIES:
 *   • Collect inputs from 11 platform sources
 *   • Normalize scores to 0-100
 *   • Evaluate release criteria
 *   • Determine Platform Certification™
 *   • Publish readiness events
 *   • Provide a single runtime state
 *
 * OUTPUTS:
 *   • Platform Certification™ (certified | conditional | not_certified)
 *   • Deployment Readiness™ (0-100)
 *   • Launch Readiness™ (go | conditional | no_go)
 *   • Production Decision™ (go | no_go)
 *   • Overall Readiness™ (0-100)
 *   • Confidence™ (0-100)
 *   • Blocking Issues™ (array)
 *   • Warnings™ (array)
 */
import { dispatch as platformDispatch } from "./platformEventBus";

// ============================================================
// INPUT SOURCE DEFINITIONS
// ============================================================

export const INPUT_SOURCES = {
  foundation_certification: {
    id: "foundation_certification",
    name: "Foundation Certification™",
    weight: 0.15,
    category: "structural",
  },
  guardian: {
    id: "guardian",
    name: "Guardian™",
    weight: 0.08,
    category: "governance",
  },
  knowledge_health: {
    id: "knowledge_health",
    name: "Knowledge Health™",
    weight: 0.10,
    category: "intelligence",
  },
  runtime_health: {
    id: "runtime_health",
    name: "Runtime Health™",
    weight: 0.10,
    category: "operational",
  },
  security: {
    id: "security",
    name: "Security™",
    weight: 0.15,
    category: "trust",
  },
  performance: {
    id: "performance",
    name: "Performance™",
    weight: 0.08,
    category: "operational",
    contributionOnly: true,
  },
  scalability: {
    id: "scalability",
    name: "Scalability™",
    weight: 0.08,
    category: "operational",
    contributionOnly: true,
  },
  commercial_readiness: {
    id: "commercial_readiness",
    name: "Commercial Readiness™",
    weight: 0.05,
    category: "business",
  },
  architecture_audit: {
    id: "architecture_audit",
    name: "Architecture Audit™",
    weight: 0.07,
    category: "structural",
  },
  platform_intelligence: {
    id: "platform_intelligence",
    name: "Platform Intelligence™",
    weight: 0.07,
    category: "intelligence",
  },
  observability: {
    id: "observability",
    name: "Observability™",
    weight: 0.07,
    category: "operational",
  },
};

// Deployment-specific weights (subset focused on deployment safety)
const DEPLOYMENT_WEIGHTS = {
  foundation_certification: 0.25,
  runtime_health: 0.20,
  security: 0.25,
  architecture_audit: 0.15,
  observability: 0.15,
};

// ============================================================
// THRESHOLDS
// ============================================================

export const READINESS_THRESHOLDS = {
  certified: 85,
  conditional: 70,
  launchGo: 85,
  launchConditional: 70,
  blocking: 60,
  warning: 75,
};

// ============================================================
// LABELS & COLORS
// ============================================================

export const CERTIFICATION_STATUS = {
  certified: { label: "Certified", shortLabel: "Certified", color: "emerald", textColor: "text-emerald-400", bgColor: "bg-emerald-500/10", borderColor: "border-emerald-500/20" },
  conditional: { label: "Conditional", shortLabel: "Conditional", color: "amber", textColor: "text-amber-400", bgColor: "bg-amber-500/10", borderColor: "border-amber-500/20" },
  not_certified: { label: "Not Certified", shortLabel: "Not Certified", color: "red", textColor: "text-red-400", bgColor: "bg-red-500/10", borderColor: "border-red-500/20" },
};

export const LAUNCH_STATUS = {
  go: { label: "GO", shortLabel: "GO", color: "emerald", textColor: "text-emerald-400", bgColor: "bg-emerald-500/10", borderColor: "border-emerald-500/20" },
  conditional: { label: "Conditional", shortLabel: "Conditional", color: "amber", textColor: "text-amber-400", bgColor: "bg-amber-500/10", borderColor: "border-amber-500/20" },
  no_go: { label: "NO-GO", shortLabel: "NO-GO", color: "red", textColor: "text-red-400", bgColor: "bg-red-500/10", borderColor: "border-red-500/20" },
};

// ============================================================
// CORE COMPUTATION
// ============================================================

const clamp = (n) => Math.max(0, Math.min(100, Math.round(n)));

/**
 * Normalize a raw input into a standard shape.
 * rawInput: { score, blockingIssues?, warnings?, metadata? }
 */
function normalizeInput(sourceId, rawInput) {
  const source = INPUT_SOURCES[sourceId];
  if (!source) return null;

  const score = clamp(rawInput?.score ?? 0);
  const blockingIssues = rawInput?.blockingIssues || [];
  const warnings = rawInput?.warnings || [];
  const metadata = rawInput?.metadata || {};

  // A score below the blocking threshold automatically generates a blocking issue
  if (score < READINESS_THRESHOLDS.blocking && blockingIssues.length === 0) {
    blockingIssues.push({
      source: sourceId,
      sourceName: source.name,
      message: `${source.name} score (${score}) is below the blocking threshold (${READINESS_THRESHOLDS.blocking})`,
      severity: "critical",
    });
  } else if (score < READINESS_THRESHOLDS.warning && warnings.length === 0) {
    warnings.push({
      source: sourceId,
      sourceName: source.name,
      message: `${source.name} score (${score}) is below the warning threshold (${READINESS_THRESHOLDS.warning})`,
      severity: "warning",
    });
  }

  return {
    id: sourceId,
    name: source.name,
    category: source.category,
    weight: source.weight,
    contributionOnly: source.contributionOnly || false,
    score,
    blockingIssues,
    warnings,
    metadata,
  };
}

/**
 * Compute Overall Readiness™ — weighted average of all input scores.
 */
function computeOverallReadiness(inputs) {
  let weightedSum = 0;
  let totalWeight = 0;

  for (const input of inputs) {
    weightedSum += input.score * input.weight;
    totalWeight += input.weight;
  }

  return totalWeight > 0 ? clamp(weightedSum / totalWeight) : 0;
}

/**
 * Compute Deployment Readiness™ — weighted subset focused on deployment safety.
 */
function computeDeploymentReadiness(inputs) {
  let weightedSum = 0;
  let totalWeight = 0;

  for (const input of inputs) {
    const depWeight = DEPLOYMENT_WEIGHTS[input.id];
    if (depWeight) {
      weightedSum += input.score * depWeight;
      totalWeight += depWeight;
    }
  }

  return totalWeight > 0 ? clamp(weightedSum / totalWeight) : 0;
}

/**
 * Evaluate Platform Certification™.
 *   certified     — overall >= 85 AND no blocking issues
 *   conditional   — overall >= 70 AND no blocking issues
 *   not_certified — otherwise
 */
function evaluateCertification(overall, blockingIssues) {
  const hasBlocking = blockingIssues.length > 0;

  if (overall >= READINESS_THRESHOLDS.certified && !hasBlocking) return "certified";
  if (overall >= READINESS_THRESHOLDS.conditional && !hasBlocking) return "conditional";
  return "not_certified";
}

/**
 * Evaluate Launch Readiness™.
 *   go          — deployment readiness >= 85 AND certified
 *   conditional — deployment readiness >= 70 AND not not_certified
 *   no_go       — otherwise
 */
function evaluateLaunchReadiness(deploymentReadiness, certification) {
  if (deploymentReadiness >= READINESS_THRESHOLDS.launchGo && certification === "certified") return "go";
  if (deploymentReadiness >= READINESS_THRESHOLDS.launchConditional && certification !== "not_certified") return "conditional";
  return "no_go";
}

/**
 * Collect all blocking issues and warnings from inputs.
 */
function collectIssues(inputs) {
  const blockingIssues = [];
  const warnings = [];

  for (const input of inputs) {
    blockingIssues.push(...input.blockingIssues);
    warnings.push(...input.warnings);
  }

  return { blockingIssues, warnings };
}

/**
 * Compute Confidence™ — how reliable is the readiness assessment.
 * Factors: data completeness, score margin from thresholds, issue count.
 */
function computeConfidence(inputs, overall, blockingIssueCount) {
  let confidence = 100;

  // Data completeness penalty
  for (const input of inputs) {
    if (input.score === 0 && input.metadata?.noData) confidence -= 8;
  }

  // Score margin penalty — scores near thresholds are less confident
  const margin = Math.min(
    overall - READINESS_THRESHOLDS.certified,
    READINESS_THRESHOLDS.conditional - overall,
  );
  if (Math.abs(margin) < 3) confidence -= 15;
  else if (Math.abs(margin) < 5) confidence -= 8;

  // Blocking issues penalty
  confidence -= blockingIssueCount * 5;

  return clamp(Math.max(30, confidence));
}

/**
 * MAIN ENTRY POINT — Compute the full platform readiness state.
 *
 * @param {Object} rawInputs — { [sourceId]: { score, blockingIssues?, warnings?, metadata? } }
 * @returns {Object} Full readiness state with all outputs
 */
export function computePlatformReadiness(rawInputs) {
  const inputs = Object.keys(INPUT_SOURCES)
    .map((id) => normalizeInput(id, rawInputs?.[id]))
    .filter(Boolean);

  const overall = computeOverallReadiness(inputs);
  const deploymentReadiness = computeDeploymentReadiness(inputs);
  const { blockingIssues, warnings } = collectIssues(inputs);
  const certification = evaluateCertification(overall, blockingIssues);
  const launchReadiness = evaluateLaunchReadiness(deploymentReadiness, certification);
  const productionDecision = launchReadiness === "go" ? "go" : "no_go";
  const confidence = computeConfidence(inputs, overall, blockingIssues.length);

  return {
    overallReadiness: overall,
    deploymentReadiness,
    platformCertification: certification,
    launchReadiness,
    productionDecision,
    confidence,
    blockingIssues,
    warnings,
    inputs: inputs.map((i) => ({
      id: i.id,
      name: i.name,
      category: i.category,
      weight: i.weight,
      score: i.score,
      contributionOnly: i.contributionOnly,
    })),
    timestamp: new Date().toISOString(),
  };
}

// ============================================================
// RUNTIME STATE MANAGEMENT
// ============================================================

let runtimeState = null;
let previousCertification = null;
let previousLaunchReadiness = null;
const readinessSubscribers = new Set();

/**
 * Get the current runtime readiness state.
 * Returns null if not yet computed.
 */
export function getReadinessState() {
  return runtimeState;
}

/**
 * Update the runtime readiness state and publish events.
 * This is the ONLY function that should change platform readiness.
 */
export function updateReadinessState(rawInputs) {
  const newState = computePlatformReadiness(rawInputs);
  const prevState = runtimeState;
  runtimeState = newState;

  // Always publish PlatformReadinessUpdated
  platformDispatch("PlatformReadinessUpdated", {
    source: "platform_readiness_engine",
    state: newState,
    previousState: prevState,
  });

  // Publish CertificationChanged if certification status changed
  if (prevState && newState.platformCertification !== prevState.platformCertification) {
    platformDispatch("CertificationChanged", {
      source: "platform_readiness_engine",
      from: prevState.platformCertification,
      to: newState.platformCertification,
      overall: newState.overallReadiness,
    });
  }

  // Publish DeploymentDecisionChanged if launch readiness changed
  if (prevState && newState.launchReadiness !== prevState.launchReadiness) {
    platformDispatch("DeploymentDecisionChanged", {
      source: "platform_readiness_engine",
      from: prevState.launchReadiness,
      to: newState.launchReadiness,
      deploymentReadiness: newState.deploymentReadiness,
    });
  }

  // Publish BlockingIssueDetected if new blocking issues appeared
  if (newState.blockingIssues.length > 0) {
    const prevCount = prevState?.blockingIssues?.length || 0;
    if (newState.blockingIssues.length > prevCount) {
      platformDispatch("BlockingIssueDetected", {
        source: "platform_readiness_engine",
        issues: newState.blockingIssues,
        count: newState.blockingIssues.length,
      });
    }
  }

  // Publish ReleaseApproved or ReleaseBlocked
  if (prevState && newState.productionDecision !== prevState.productionDecision) {
    if (newState.productionDecision === "go") {
      platformDispatch("ReleaseApproved", {
        source: "platform_readiness_engine",
        overall: newState.overallReadiness,
        deploymentReadiness: newState.deploymentReadiness,
        confidence: newState.confidence,
      });
    } else {
      platformDispatch("ReleaseBlocked", {
        source: "platform_readiness_engine",
        overall: newState.overallReadiness,
        blockingIssues: newState.blockingIssues,
        confidence: newState.confidence,
      });
    }
  }

  // Notify local subscribers
  readinessSubscribers.forEach((cb) => {
    try { cb(newState); } catch {}
  });

  return newState;
}

/**
 * Subscribe to readiness state updates.
 * @param {Function} callback — receives the new state
 * @returns {Function} unsubscribe
 */
export function subscribeToReadiness(callback) {
  readinessSubscribers.add(callback);
  if (runtimeState) {
    try { callback(runtimeState); } catch {}
  }
  return () => {
    readinessSubscribers.delete(callback);
  };
}

// ============================================================
// DISPLAY MODE HELPERS
// ============================================================

export const DISPLAY_MODES = {
  certification: {
    label: "Platform Certification™",
    question: "Is the platform certified?",
    metricKey: "platformCertification",
    statusMap: CERTIFICATION_STATUS,
  },
  launch: {
    label: "Deployment Decision™",
    question: "Should this build be released?",
    metricKey: "launchReadiness",
    statusMap: LAUNCH_STATUS,
  },
  performance: {
    label: "Performance Health™",
    question: "How is platform performance?",
    metricKey: "performance",
    contributionOnly: true,
  },
  scalability: {
    label: "Scalability Health™",
    question: "How is platform scalability?",
    metricKey: "scalability",
    contributionOnly: true,
  },
  overall: {
    label: "Overall Readiness™",
    question: "What is the platform readiness?",
    metricKey: "overallReadiness",
  },
};
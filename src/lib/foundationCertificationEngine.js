/**
 * EXECLEAD.AI — FOUNDATION CERTIFICATION ENGINE™
 * ============================================================
 * Sprint 1.5 — Foundation Certification Sprint™
 *
 * The formal architectural acceptance test for EXECLEAD.AI.
 * The platform is certified ONLY when ALL thresholds are met:
 *   • Architecture Health ≥ 95%
 *   • Runtime Consistency = 100%
 *   • Knowledge Resolution = 100%
 *   • Platform Discoverability = 100%
 *   • Metadata Coverage = 100%
 *   • Configuration Consistency = 100%
 *   • Enterprise Readiness ≥ 95%
 *   • Foundation Score ≥ 95%
 *   • No Critical Manifest Errors
 *   • No Broken References / Orphans / Registry Drift / Metadata Gaps
 *
 * Only after certification may Sprint 2 (EXEC™ Cognitive Engine™) begin.
 */
import { computeFoundationVerification } from "./foundationVerificationEngine";
import { CONFIG_VERSION } from "./platformConfig";

// ── Certification Thresholds ──
export const CERTIFICATION_THRESHOLDS = {
  architectureHealth: { label: "Architecture Health", threshold: 95, exact: false },
  runtimeConsistency: { label: "Runtime Consistency", threshold: 100, exact: true },
  knowledgeResolution: { label: "Knowledge Resolution", threshold: 100, exact: true },
  platformDiscoverability: { label: "Platform Discoverability", threshold: 100, exact: true },
  metadataCoverage: { label: "Metadata Coverage", threshold: 100, exact: true },
  configurationConsistency: { label: "Configuration Consistency", threshold: 100, exact: true },
  enterpriseReadiness: { label: "Enterprise Readiness", threshold: 95, exact: false },
};

// ── Issue Categories (Phase 4: Categorized Blockers) ──
export const ISSUE_CATEGORIES = {
  metadata: { label: "Metadata", color: "amber" },
  discoverability: { label: "Discoverability", color: "cyan" },
  manifest: { label: "Platform Manifest", color: "indigo" },
  dependencies: { label: "Dependencies", color: "purple" },
};

// ── Repair Estimates by Severity ──
const REPAIR_ESTIMATES = {
  Critical: { autoRepair: false, manualReview: true, time: "2-4 hours" },
  High: { autoRepair: true, manualReview: true, time: "30-60 min" },
  Medium: { autoRepair: true, manualReview: false, time: "15-30 min" },
  Low: { autoRepair: true, manualReview: false, time: "5-15 min" },
};

// ── Categorize an issue into one of the 4 blocker categories ──
function categorizeIssue(issue) {
  const desc = (issue.description || "").toLowerCase();
  const phase = issue.phase;

  // Dependencies: broken chains, missing links, fallback logic
  if (
    desc.includes("chain") || desc.includes("dependency") || desc.includes("link") ||
    desc.includes("fallback") || desc.includes("broken at")
  ) {
    return "dependencies";
  }

  // Discoverability: EXEC™ can't explain/navigate/recommend/search
  if (
    phase === 4 || phase === 5 || phase === 6 ||
    desc.includes("discover") || desc.includes("explain") ||
    desc.includes("navigate") || desc.includes("knowledge entry") ||
    desc.includes("search") || desc.includes("reference") ||
    desc.includes("check(s)")
  ) {
    return "discoverability";
  }

  // Platform Manifest: orphans, duplicates, broken references, registration
  if (
    desc.includes("orphan") || desc.includes("duplicate") ||
    desc.includes("not registered") || desc.includes("not integrated") ||
    desc.includes("manifest") || phase === 1 || phase === 8 || phase === 9
  ) {
    return "manifest";
  }

  // Metadata: missing fields, descriptions, configuration gaps
  return "metadata";
}

// ── Enrich an issue with certification metadata ──
function enrichIssue(issue) {
  const category = categorizeIssue(issue);
  const repair = REPAIR_ESTIMATES[issue.severity] || REPAIR_ESTIMATES.Medium;
  return {
    ...issue,
    category,
    categoryLabel: ISSUE_CATEGORIES[category].label,
    categoryColor: ISSUE_CATEGORIES[category].color,
    rootCause: issue.description,
    affectedComponents: [issue.component],
    estimatedRepairTime: repair.time,
    autoRepairAvailable: repair.autoRepair,
    manualReviewRequired: repair.manualReview,
    deepLink: "/developer/diagnostics",
  };
}

// ── Generate actionable recommendations ──
function generateRecommendations(metrics, blockers) {
  const recs = [];
  metrics.forEach((m) => {
    if (!m.passed) {
      recs.push(
        `Raise ${m.label} from ${m.value}% to ${m.threshold}%${m.exact ? " (exact match required)" : " (minimum threshold)"}.`
      );
    }
  });
  blockers.forEach((b) => {
    if (b.count > 0) {
      recs.push(
        `Resolve ${b.count} ${b.label} blocker(s) — ${b.critical} critical, ${b.high} high, ${b.medium} medium.`
      );
    }
  });
  if (recs.length === 0) {
    recs.push("All certification thresholds met. Platform is certified for Sprint 2 (EXEC™ Cognitive Engine™).");
  }
  return recs;
}

// ── Estimate total completion time from issues ──
function estimateCompletion(issues) {
  if (issues.length === 0) return "Complete";
  const totalMinutes = issues.reduce((sum, i) => {
    const match = i.estimatedRepairTime?.match(/(\d+)-?(\d+)?/);
    return sum + (match ? parseInt(match[2] || match[1]) : 30);
  }, 0);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return hours > 0 ? `~${hours}h ${mins}m` : `~${mins}m`;
}

/**
 * Compute the full Foundation Certification™.
 * Returns certification status, metrics, categorized blockers,
 * release gate, versions, and recommendations.
 */
export function computeFoundationCertification() {
  const verification = computeFoundationVerification();
  const { scores, issues, successCriteria, versions, buildNumber } = verification;

  // Build the 7 certification metrics with pass/fail
  const metrics = Object.entries(CERTIFICATION_THRESHOLDS).map(([key, config]) => {
    const value = scores[key] ?? 0;
    const passed = config.exact ? value === config.threshold : value >= config.threshold;
    return {
      key,
      label: config.label,
      value,
      threshold: config.threshold,
      exact: config.exact,
      passed,
      delta: Math.max(0, config.threshold - value),
    };
  });

  // Enrich and categorize all issues
  const enrichedIssues = issues.map(enrichIssue);

  // Build categorized blockers
  const categorizedBlockers = Object.entries(ISSUE_CATEGORIES).map(([key, config]) => {
    const catIssues = enrichedIssues.filter((i) => i.category === key);
    return {
      category: key,
      label: config.label,
      color: config.color,
      count: catIssues.length,
      critical: catIssues.filter((i) => i.severity === "Critical").length,
      high: catIssues.filter((i) => i.severity === "High").length,
      medium: catIssues.filter((i) => i.severity === "Medium").length,
      low: catIssues.filter((i) => i.severity === "Low").length,
      issues: catIssues,
    };
  });

  // Certification gates
  const allMetricsPassed = metrics.every((m) => m.passed);
  const foundationScorePassed = scores.foundationScore >= 95;
  const noCriticalIssues = issues.filter((i) => i.severity === "Critical").length === 0;
  const certified = allMetricsPassed && foundationScorePassed && noCriticalIssues;

  const blockingDomains = categorizedBlockers.filter((c) => c.count > 0);
  const remainingTasks = enrichedIssues.length;
  const estCompletion = estimateCompletion(enrichedIssues);
  const recommendations = generateRecommendations(metrics, categorizedBlockers);

  return {
    certified,
    certificationDate: certified ? new Date().toISOString() : null,
    certificationAuthority: "EXECLEAD.AI Foundation Governance™",
    foundationScore: scores.foundationScore,
    requiredThreshold: 95,
    metrics,
    categorizedBlockers,
    totalBlockers: enrichedIssues.length,
    blockingDomains,
    remainingTasks,
    estimatedCompletion: estCompletion,
    releaseGate: {
      status: certified ? "CERTIFIED" : "BLOCKED",
      foundationCertified: certified,
      blockingDomains: blockingDomains.map((d) => d.label),
      remainingTasks,
      estimatedCompletion: estCompletion,
      certificationScore: scores.foundationScore,
      requiredThreshold: 95,
    },
    versions: {
      ...versions,
      config: CONFIG_VERSION,
    },
    buildNumber,
    sprintVersion: "1.5",
    successCriteria,
    recommendations,
    verification,
  };
}

/**
 * Generate the EXECLEAD.AI Foundation Certification Report™.
 * Returns a structured report object for display and download.
 */
export function generateCertificationReport(cert) {
  return {
    title: "EXECLEAD.AI Foundation Certification Report™",
    generatedAt: new Date().toISOString(),
    sprint: "Sprint 1.5 — Foundation Certification Sprint™",
    executiveSummary: {
      certified: cert.certified,
      foundationScore: cert.foundationScore,
      requiredThreshold: cert.requiredThreshold,
      certificationDate: cert.certificationDate,
      certificationAuthority: cert.certificationAuthority,
      totalBlockers: cert.totalBlockers,
      blockingDomains: cert.blockingDomains.map((d) => d.label),
      estimatedCompletion: cert.estimatedCompletion,
    },
    metrics: cert.metrics,
    architecturalGate: {
      totalIssues: cert.totalBlockers,
      categories: cert.categorizedBlockers.map((c) => ({
        category: c.label,
        count: c.count,
        critical: c.critical,
        high: c.high,
        medium: c.medium,
        low: c.low,
      })),
    },
    releaseGate: cert.releaseGate,
    recommendations: cert.recommendations,
    versions: cert.versions,
    buildNumber: cert.buildNumber,
  };
}
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
 * Only after certification may the next execution stream (RC1™) begin.
 */
import { computeFoundationVerification } from "./foundationVerificationEngine";
import { CONFIG_VERSION } from "./platformConfig";
import { computeReleaseStage } from "./releaseStageEngine";

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
    recs.push("All certification thresholds met. Platform is certified — next execution stream authorized.");
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
    releaseStage: computeReleaseStage(),
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
    executionStage: computeReleaseStage().currentStage,
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

// ============================================================
// UNIVERSAL EXPLAINABLE METRICS™ — Metric Diagnostics
// Every metric is clickable, explainable, traceable, actionable
// ============================================================

const METRIC_PHASE_MAP = {
  architectureHealth: [1],
  runtimeConsistency: [2],
  knowledgeResolution: [3],
  platformDiscoverability: [4, 5],
  metadataCoverage: [],
  configurationConsistency: [7],
  enterpriseReadiness: [10],
};

const METRIC_META = {
  architectureHealth: { owner: "Platform Engineering", deepLink: "/developer/diagnostics", dependencies: ["Platform Manifest™", "Core Platform Services™"] },
  runtimeConsistency: { owner: "Platform Engineering", deepLink: "/developer/diagnostics", dependencies: ["Platform State Manager™"] },
  knowledgeResolution: { owner: "AI Engineering", deepLink: "/developer/knowledge-sync", dependencies: ["Knowledge Resolution Engine™", "Knowledge Pack Engine™"] },
  platformDiscoverability: { owner: "Platform Engineering", deepLink: "/developer/governance", dependencies: ["Route Registry™", "Module Registry™", "EXEC™ Knowledge Index™"] },
  metadataCoverage: { owner: "Platform Engineering", deepLink: "/developer/governance", dependencies: ["Metadata Completion Engine™", "Platform Manifest™"] },
  configurationConsistency: { owner: "Platform Engineering", deepLink: "/developer/diagnostics", dependencies: ["Platform Config™", "Platform Manifest™"] },
  enterpriseReadiness: { owner: "Enterprise Engineering", deepLink: "/trust-center", dependencies: ["Enterprise Capability Suite™"] },
};

function getTrend(storageKey, currentScore) {
  try {
    const prev = localStorage.getItem(storageKey);
    localStorage.setItem(storageKey, String(currentScore));
    if (prev === null) return { direction: "stable", label: "Baseline established", delta: 0 };
    const delta = currentScore - parseInt(prev);
    return delta > 0 ? { direction: "up", label: `+${delta} pts`, delta }
      : delta < 0 ? { direction: "down", label: `${delta} pts`, delta }
      : { direction: "stable", label: "No change", delta: 0 };
  } catch { return { direction: "stable", label: "No history", delta: 0 }; }
}

function parseHours(issue) {
  const match = (issue.estimatedRepairTime || "").match(/(\d+)/);
  return match ? parseInt(match[1]) : 0.5;
}

export function computeMetricDiagnostics(cert, metricKey) {
  if (metricKey === "foundationScore" || metricKey === "certificationScore") {
    const currentScore = cert.foundationScore;
    const target = cert.requiredThreshold;
    const remainingGap = Math.max(0, target - currentScore);
    const issues = cert.verification.issues;
    const maxPoints = 100;
    const earnedPoints = currentScore;
    const gapPoints = remainingGap;
    const contributions = cert.metrics.map((m) => {
      const w = 1 / 7;
      const mp = Math.round((100 / 7) * 10) / 10;
      const ep = Math.round((m.value / 100) * mp * 10) / 10;
      const gp = Math.round((mp - ep) * 10) / 10;
      return { id: m.key, label: m.label, weight: w, maxPoints: mp, earnedPoints: ep, gapPoints: gp, current: m.value, target: m.threshold };
    });
    const estimatedHours = issues.reduce((s, i) => s + parseHours(i), 0);
    const days = Math.ceil(estimatedHours / 8);
    const projectedCompletion = remainingGap > 0 ? new Date(Date.now() + days * 86400000).toLocaleDateString() : "At target";
    return {
      metricKey, label: "Foundation Certification Score™",
      currentScore, target, remainingGap, isScore: true,
      contribution: { weight: 1, maxPoints, earnedPoints, gapPoints, formula: "Average of 7 certification metrics" },
      contributions,
      engineeringTasks: issues.length > 0 ? issues.slice(0, 20).map((i) => i.remediation || i.description) : ["Foundation at target — maintain posture"],
      dependencies: ["All 7 Certification Metrics™", "Platform Manifest™", "Foundation Verification Engine™"],
      evidence: issues.length > 0 ? issues.slice(0, 15).map((i) => `${i.severity}: ${i.component} — ${i.description}`) : ["All thresholds met"],
      owner: "Platform Engineering",
      estimatedHours,
      timeline: [
        { milestone: `Score at ${currentScore}/${target}`, target: "Current", status: "complete" },
        { milestone: `Close ${remainingGap}-point gap`, target: `${estimatedHours}h est.`, status: remainingGap > 0 ? "in_progress" : "complete" },
        { milestone: "Reach certification threshold", target: projectedCompletion, status: remainingGap > 0 ? "pending" : "complete" },
      ],
      risks: remainingGap > 5 ? [{ severity: "high", description: `${remainingGap} points below ${target}% threshold`, mitigation: "Prioritize metric gaps in current execution stream" }]
        : remainingGap > 0 ? [{ severity: "medium", description: `${remainingGap} points below threshold`, mitigation: "Close remaining gap" }]
        : [{ severity: "low", description: "At target", mitigation: "Maintain posture" }],
      trend: getTrend("fc_score_prev", currentScore),
      deepLinks: [{ label: "Open Diagnostics", url: "/developer/foundation-certification" }],
      issues,
    };
  }

  if (metricKey === "remainingTasks") {
    const count = cert.remainingTasks;
    const issues = cert.verification.issues;
    const estimatedHours = issues.reduce((s, i) => s + parseHours(i), 0);
    return {
      metricKey, label: "Remaining Tasks™",
      currentScore: count, target: 0, remainingGap: count, isCount: true,
      contribution: { weight: 0, maxPoints: 0, earnedPoints: 0, gapPoints: count, formula: "Count of unresolved certification issues" },
      engineeringTasks: issues.slice(0, 20).map((i) => i.remediation || i.description),
      dependencies: ["All Certification Metrics™"],
      evidence: issues.slice(0, 15).map((i) => `${i.severity}: ${i.component} — ${i.description}`),
      owner: "Platform Engineering",
      estimatedHours,
      timeline: [{ milestone: `${count} tasks remaining`, target: "Current", status: "in_progress" }, { milestone: "0 tasks", target: `${estimatedHours}h est.`, status: "pending" }],
      risks: count > 20 ? [{ severity: "high", description: `${count} unresolved tasks`, mitigation: "Execute Mass Ingestion Sprint™" }] : [{ severity: "medium", description: `${count} tasks`, mitigation: "Close remaining tasks" }],
      trend: getTrend("fc_tasks_prev", count),
      deepLinks: [{ label: "Open Blocker Registry", url: "/developer/diagnostics" }],
      issues,
    };
  }

  if (metricKey === "blockingDomains") {
    const count = cert.blockingDomains.length;
    const issues = cert.categorizedBlockers.filter((c) => c.count > 0).flatMap((c) => c.issues);
    return {
      metricKey, label: "Blocking Domains™",
      currentScore: count, target: 0, remainingGap: count, isCount: true,
      contribution: { weight: 0, maxPoints: 0, earnedPoints: 0, gapPoints: count, formula: "Count of blocker categories with unresolved issues" },
      engineeringTasks: cert.blockingDomains.map((d) => `Resolve ${d.count} ${d.label} blocker(s) — ${d.critical} critical, ${d.high} high`),
      dependencies: ["Categorized Blocker Registry™"],
      evidence: cert.blockingDomains.map((d) => `${d.label}: ${d.count} issues (${d.critical}C, ${d.high}H, ${d.medium}M, ${d.low}L)`),
      owner: "Platform Engineering",
      estimatedHours: issues.reduce((s, i) => s + parseHours(i), 0),
      timeline: [{ milestone: `${count} blocking domains`, target: "Current", status: "in_progress" }, { milestone: "0 blocking domains", target: "At certification", status: "pending" }],
      risks: count > 0 ? [{ severity: "high", description: `${count} domains blocking certification`, mitigation: "Resolve all categorized blockers" }] : [{ severity: "low", description: "No blocking domains", mitigation: "Maintain posture" }],
      trend: getTrend("fc_domains_prev", count),
      deepLinks: [{ label: "Open Blocker Registry", url: "/developer/diagnostics" }],
      issues,
    };
  }

  if (metricKey === "estimatedCompletion") {
    const issues = cert.verification.issues;
    const estimatedHours = issues.reduce((s, i) => s + parseHours(i), 0);
    const days = Math.ceil(estimatedHours / 8);
    const projectedCompletion = issues.length > 0 ? new Date(Date.now() + days * 86400000).toLocaleDateString() : "Complete";
    return {
      metricKey, label: "Estimated Completion™",
      currentScore: cert.estimatedCompletion, target: "Complete", remainingGap: issues.length > 0 ? `${estimatedHours}h` : "0h", isText: true,
      contribution: { weight: 0, maxPoints: 0, earnedPoints: 0, gapPoints: estimatedHours, formula: "Sum of estimated repair times across all issues" },
      engineeringTasks: issues.slice(0, 20).map((i) => `${i.component}: ${i.estimatedRepairTime}`),
      dependencies: ["All Certification Metrics™"],
      evidence: [`Total: ${estimatedHours}h`, `Issues: ${issues.length}`, `Days: ${days}`, `Projected: ${projectedCompletion}`],
      owner: "Platform Engineering",
      estimatedHours,
      timeline: [{ milestone: cert.estimatedCompletion, target: "Current", status: "in_progress" }, { milestone: "Complete", target: projectedCompletion, status: "pending" }],
      risks: estimatedHours > 20 ? [{ severity: "high", description: `${estimatedHours}h of work remaining`, mitigation: "Parallelize across team" }] : [{ severity: "medium", description: `${estimatedHours}h remaining`, mitigation: "Close issues in priority order" }],
      trend: getTrend("fc_completion_prev", estimatedHours),
      deepLinks: [{ label: "Open Diagnostics", url: "/developer/diagnostics" }],
      issues,
    };
  }

  // Individual certification metric
  const metric = cert.metrics.find((m) => m.key === metricKey);
  if (!metric) return null;

  const verification = cert.verification;
  const meta = METRIC_META[metricKey] || { owner: "Platform Engineering", deepLink: "/developer", dependencies: [] };
  const phases = METRIC_PHASE_MAP[metricKey] || [];

  const currentScore = metric.value;
  const target = metric.threshold;
  const remainingGap = metric.delta;

  const weight = 1 / 7;
  const maxPoints = Math.round((100 / 7) * 10) / 10;
  const earnedPoints = Math.round((currentScore / 100) * maxPoints * 10) / 10;
  const gapPoints = Math.round((maxPoints - earnedPoints) * 10) / 10;

  const issues = phases.length > 0 ? verification.issues.filter((i) => phases.includes(i.phase)) : [];
  const engineeringTasks = issues.length > 0
    ? issues.map((i) => i.remediation || i.description)
    : [`${metric.label} is at target — maintain current posture`];
  const evidence = issues.length > 0
    ? issues.map((i) => `${i.severity}: ${i.component} — ${i.description}`)
    : [`${metric.label} at ${currentScore}% — no issues detected`];
  const estimatedHours = issues.reduce((s, i) => s + parseHours(i), 0);
  const days = Math.ceil(estimatedHours / 8);
  const projectedCompletion = remainingGap > 0 ? new Date(Date.now() + days * 86400000).toLocaleDateString() : "At target";

  const risks = [];
  if (remainingGap > 10) risks.push({ severity: "high", description: `${remainingGap}-point gap to ${target}% threshold`, mitigation: "Prioritize in current execution stream" });
  else if (remainingGap > 0) risks.push({ severity: "medium", description: `${remainingGap}-point gap to ${target}% threshold`, mitigation: "Close gap to unblock certification" });
  if (issues.some((i) => i.severity === "Critical")) risks.push({ severity: "critical", description: `${issues.filter((i) => i.severity === "Critical").length} critical issue(s)`, mitigation: "Resolve critical issues immediately" });
  if (risks.length === 0) risks.push({ severity: "low", description: "No risks — metric at target", mitigation: "Maintain current posture" });

  return {
    metricKey,
    label: metric.label,
    currentScore, target, remainingGap,
    exact: metric.exact, passed: metric.passed,
    contribution: { weight, maxPoints, earnedPoints, gapPoints, formula: `${metric.label} contributes ${Math.round(weight * 100)}% of Foundation Score` },
    engineeringTasks,
    dependencies: meta.dependencies,
    evidence,
    owner: meta.owner,
    estimatedHours,
    timeline: remainingGap > 0 ? [
      { milestone: `${metric.label} at ${currentScore}%`, target: "Current", status: "complete" },
      { milestone: `Close ${remainingGap}-point gap`, target: `${estimatedHours}h est.`, status: "in_progress" },
      { milestone: `Reach ${target}% threshold`, target: projectedCompletion, status: "pending" },
    ] : [
      { milestone: `${metric.label} at ${currentScore}%`, target: "Current", status: "complete" },
      { milestone: "Target reached", target: "✓", status: "complete" },
    ],
    risks,
    trend: getTrend(`fc_metric_${metricKey}_prev`, currentScore),
    deepLinks: [{ label: "Open Diagnostics", url: meta.deepLink }],
    issues,
  };
}
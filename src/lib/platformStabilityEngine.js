/**
 * Platform Stability Engine™
 * ============================================================
 * Computes the Platform Stability Score™ from live platform
 * telemetry — Guardian findings, manifest errors, governance
 * certificate issues, and infrastructure health.
 *
 * Pure functions — no side effects, no context dependencies.
 */

/**
 * Compute the Platform Stability Score™ from live telemetry.
 *
 * @param {object} telemetry - { platformState, guardian, certificate }
 * @returns {{ overall: number, tier: string, categories: Array, metrics: object }}
 */
export function computeStabilityScore(telemetry) {
  const { platformState, guardian, certificate } = telemetry;

  const manifestErrors = platformState?.errorCount || 0;
  const manifestWarnings = platformState?.warningCount || 0;
  const guardianPending = guardian?.pending?.length || 0;
  const brokenNavPaths = guardian?.brokenNavPaths?.size || 0;
  const governanceFailures = certificate?.failures || 0;
  const governanceWarnings = certificate?.warnings || 0;
  const safeMode = platformState?.safeMode || false;

  // ── Category Scores (0–100) ──
  const errorStability = Math.max(0, 100 - manifestErrors * 10 - manifestWarnings * 2);
  const guardianStability = Math.max(0, 100 - guardianPending * 5 - brokenNavPaths * 5);
  const governanceStability = Math.max(0, 100 - governanceFailures * 10 - governanceWarnings * 2);
  const infraStability = Math.round((
    (platformState?.apiHealth || 100) +
    (platformState?.databaseHealth || 100) +
    (platformState?.cacheHealth || 100)
  ) / 3);
  const manifestStability = Math.max(0, 100 - manifestErrors * 5 - manifestWarnings * 1);
  const coverageStability = platformState?.coverage?.routeCoverage ?? 100;

  const categories = [
    { id: "errors", label: "Error Stability", score: errorStability, weight: 20, icon: "AlertOctagon" },
    { id: "guardian", label: "Guardian Stability", score: guardianStability, weight: 15, icon: "ShieldCheck" },
    { id: "governance", label: "Governance Stability", score: governanceStability, weight: 15, icon: "Boxes" },
    { id: "infrastructure", label: "Infrastructure Health", score: infraStability, weight: 20, icon: "Server" },
    { id: "manifest", label: "Manifest Integrity", score: manifestStability, weight: 15, icon: "FileCheck" },
    { id: "coverage", label: "Route Coverage", score: coverageStability, weight: 15, icon: "Route" },
  ];

  const weightedTotal = categories.reduce((sum, c) => sum + (c.score * c.weight / 100), 0);
  const overall = Math.max(0, Math.min(100, Math.round(weightedTotal) - (safeMode ? 10 : 0)));

  const tier = overall >= 95 ? "Production Stable"
    : overall >= 80 ? "Stable"
    : overall >= 60 ? "Degraded"
    : "Critical";

  const tierColor = overall >= 95 ? "#10b981"
    : overall >= 80 ? "#06b6d4"
    : overall >= 60 ? "#f59e0b"
    : "#ef4444";

  return {
    overall,
    tier,
    tierColor,
    categories,
    metrics: {
      manifestErrors,
      manifestWarnings,
      guardianPending,
      brokenNavPaths,
      governanceFailures,
      governanceWarnings,
      safeMode,
      platformStatus: platformState?.status || "unknown",
    },
  };
}

/**
 * Metrics that are NOT yet measured by live telemetry.
 * Displayed honestly as "Monitoring Pending" — never fabricated.
 */
export const PENDING_METRICS = [
  { id: "console-errors", label: "Console Errors", description: "Requires global window.onerror handler integration" },
  { id: "unhandled-exceptions", label: "Unhandled Exceptions", description: "Requires ErrorBoundary telemetry reporting" },
  { id: "auth-errors", label: "Authentication Errors", description: "Requires auth failure event tracking" },
  { id: "server-500", label: "500 Server Errors", description: "Requires server-side error aggregation" },
  { id: "perf-regressions", label: "Performance Regressions", description: "Requires performance baseline monitoring" },
  { id: "memory-leaks", label: "Memory Leak Detection", description: "Requires runtime memory profiling" },
];

/**
 * Success metric targets from the Product Excellence Program™.
 */
export const STABILITY_TARGETS = [
  { metric: "Critical Bugs", target: "0", current: (m) => m.governanceFailures },
  { metric: "Broken Routes", target: "0", current: (m) => m.brokenNavPaths },
  { metric: "Manifest Errors", target: "0", current: (m) => m.manifestErrors },
  { metric: "Guardian Findings", target: "0", current: (m) => m.guardianPending },
  { metric: "Safe Mode", target: "false", current: (m) => m.safeMode },
];
/**
 * EXECLEAD.AI — Deployment Pipeline™ v2.0
 * ============================================================
 * Refactored from an 8-stage build pipeline into a 4-milestone
 * Release Candidate flow:
 *
 *   1. Security Hardening        (Guardian™ scan + auto-repair)
 *   2. Security Verification     (Security Regression Suite™ + RLS audit)
 *   3. Release Candidate 1 (RC1) (Build + validation + knowledge sync + readiness)
 *   4. Production Certification™ (Formal evidence package)
 *   5. Sprint 4                  (Next phase — gated on certification)
 *
 * RC1 is an internal engineering milestone.
 * Production Certification™ is the formal evidence package that says
 * the release is ready. Sprint 4 (Enterprise Procurement™) begins only
 * after certification passes.
 */
import { runGovernancePipeline } from "./governancePipeline";
import { runGuardianScan } from "./guardianEngine";
import {
  discoverPlatformAssets,
  validateKnowledgeSync,
  buildRegistries,
  refreshIntelligenceCaches,
} from "./execKnowledgeSyncEngine";
import { computeDeploymentReadiness } from "./deploymentReadinessEngine";
import { dispatch } from "./platformEventBus";
import { PLATFORM_METADATA } from "./platformManifest";
import { runSecurityRegressionSuite } from "./securityRegressionSuite";

export const DEPLOYMENT_PIPELINE_STAGES = [
  { id: "security_hardening", name: "Security Hardening", description: "Guardian™ consistency scan and auto-repair" },
  { id: "security_verification", name: "Security Verification", description: "Security Regression Suite™ — 1,000 tests across 20 categories" },
  { id: "rc1", name: "Release Candidate 1 (RC1)", description: "Build, platform validation, knowledge sync, and deployment verification" },
  { id: "executive_release_review", name: "Executive Release Review™", description: "Executive decision gate — would you deploy to a Fortune 500 customer tomorrow?" },
  { id: "production_certification", name: "Production Certification™", description: "Formal evidence package certifying release readiness" },
  { id: "sprint_4", name: "Sprint 4", description: "Enterprise Procurement™ — gated on Production Certification™" },
];

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Runs the full RC pipeline sequentially.
 * @param {Object} options
 * @param {Function} options.onStageChange - Called with { id, status, data } on each stage transition.
 * @param {string} options.userId - Current user ID (for Guardian audit logging).
 * @returns {Promise<Object>} Pipeline result with all stage statuses and final decision.
 */
export async function runDeploymentPipeline({ onStageChange, userId } = {}) {
  const startTime = Date.now();
  const results = {};
  let syncAssets = null;
  let syncRegistries = null;
  let syncValidation = null;
  let governanceCert = null;
  let securityResults = null;
  let readiness = null;
  let intelligence = null;

  const setStage = (id, status, data = {}) => {
    const entry = { id, status, data, timestamp: new Date().toISOString() };
    results[id] = entry;
    onStageChange?.(entry);
  };

  // ── 1. Security Hardening ──
  setStage("security_hardening", "running");
  dispatch("GuardianStarted", { source: "deployment_pipeline" });
  await delay(150);
  try {
    const guardianResult = await runGuardianScan({ trigger: "deployment", userId, autoResolve: true });
    dispatch("GuardianCompleted", { source: "deployment_pipeline", scanId: guardianResult.scanId });
    const guardianPending = guardianResult.pending?.length ?? 0;
    setStage("security_hardening", guardianPending > 0 ? "warning" : "completed", {
      repaired: guardianResult.issuesFixed,
      pending: guardianPending,
      alerts: guardianResult.alertsCount,
      rolledBack: guardianResult.rolledBack,
    });
  } catch (e) {
    dispatch("GuardianCompleted", { source: "deployment_pipeline", error: e.message });
    setStage("security_hardening", "warning", { error: e.message });
  }

  // ── 2. Security Verification ──
  setStage("security_verification", "running");
  await delay(200);
  try {
    securityResults = runSecurityRegressionSuite();
    const securityBlocked = securityResults.blocked;
    const hasWarnings = (securityResults.warningFailures ?? 0) > 0;
    const verificationStatus = securityBlocked ? "failed" : (hasWarnings ? "warning" : "completed");
    setStage("security_verification", verificationStatus, {
      total: securityResults.total,
      passed: securityResults.passed,
      failed: securityResults.failed,
      blocked: securityBlocked,
      criticalFailures: securityResults.criticalFailures,
      warningFailures: securityResults.warningFailures ?? 0,
      categories: securityResults.categories?.length ?? 0,
    });
    dispatch("SecurityRegressionCompleted", {
      source: "deployment_pipeline",
      passed: securityResults.passed,
      failed: securityResults.failed,
      blocked: securityBlocked,
    });
  } catch (e) {
    setStage("security_verification", "failed", { error: e.message });
    securityResults = { blocked: true, total: 0, passed: 0, failed: 0, criticalFailures: 1, warningFailures: 0 };
  }

  // ── 3. Release Candidate 1 (RC1) ──
  setStage("rc1", "running");
  dispatch("DeploymentStarted", { source: "deployment_pipeline" });
  await delay(250);
  try {
    // Build
    const buildVersion = PLATFORM_METADATA.platformVersion;
    const buildNumber = PLATFORM_METADATA.buildNumber;

    // Platform Validation™
    governanceCert = runGovernancePipeline("deployment", 0);

    // EXEC™ Knowledge Synchronization™
    syncAssets = discoverPlatformAssets();
    syncValidation = validateKnowledgeSync(syncAssets);
    syncRegistries = buildRegistries(syncAssets, syncValidation);
    dispatch("KnowledgeSyncCompleted", { source: "deployment_pipeline", assets: syncAssets.counts });

    // EXEC™ Intelligence Refresh™
    intelligence = refreshIntelligenceCaches(syncAssets, syncRegistries);
    dispatch("IntelligenceRefreshCompleted", { source: "deployment_pipeline" });

    // Deployment Verification™
    readiness = computeDeploymentReadiness();

    const rc1Passed = governanceCert.failures === 0 && readiness.summary.canDeploy;
    setStage("rc1", rc1Passed ? "completed" : "failed", {
      version: buildVersion,
      buildNumber,
      governanceScore: governanceCert.overallGovernanceScore,
      certified: governanceCert.certified,
      governanceFailures: governanceCert.failures,
      governanceWarnings: governanceCert.warnings,
      assets: syncAssets.counts,
      registries: Object.keys(syncRegistries).length,
      syncFindings: syncValidation.findings.length,
      syncErrors: syncValidation.errors.length,
      intelligenceCaches: Object.keys(intelligence).length,
      capabilityGraphNodes: intelligence.capabilityGraph?.nodes ?? 0,
      platformGraphNodes: intelligence.platformGraph?.nodes ?? 0,
      readinessPassed: readiness.summary.passed,
      readinessTotal: readiness.summary.total,
      healthScore: readiness.summary.healthScore,
      canDeploy: readiness.summary.canDeploy,
    });
  } catch (e) {
    setStage("rc1", "failed", { error: e.message });
  }

  // ── 4. Executive Release Review™ ──
  await delay(150);
  const hardeningPassed = results.security_hardening?.status === "completed" || results.security_hardening?.status === "warning";
  const verificationPassed = results.security_verification?.status === "completed";
  const verificationWarning = results.security_verification?.status === "warning";
  const rc1Passed = results.rc1?.status === "completed";

  const criticalFailures = securityResults?.criticalFailures ?? 0;
  const warningFailures = securityResults?.warningFailures ?? 0;
  const guardianPending = results.security_hardening?.data?.pending ?? 0;
  const governanceWarnings = governanceCert?.warnings ?? 0;
  const governanceFailures = governanceCert?.failures ?? 0;

  const reviewHasWarnings = verificationWarning || governanceWarnings > 0 || guardianPending > 0 || warningFailures > 0;
  const reviewHasFailures = !rc1Passed || !verificationPassed || governanceFailures > 0 || criticalFailures > 0;

  const reviewRecommendation = reviewHasFailures
    ? "BLOCK_RELEASE"
    : reviewHasWarnings
      ? "DELAY_RELEASE"
      : "APPROVE_RC1";

  const reviewApproved = reviewRecommendation === "APPROVE_RC1";
  setStage("executive_release_review", reviewApproved ? "completed" : (reviewRecommendation === "DELAY_RELEASE" ? "warning" : "failed"), {
    recommendation: reviewRecommendation,
    rc1Passed,
    securityPassed: verificationPassed,
    hardeningPassed,
    criticalFailures,
    warningFailures,
    guardianPending,
    governanceFailures,
    governanceWarnings,
    healthScore: readiness?.summary?.healthScore ?? 0,
  });

  // ── 5. Production Certification™ ──
  await delay(150);
  const productionReady = reviewApproved;
  const finalDecision = reviewRecommendation === "APPROVE_RC1"
    ? "GO"
    : reviewRecommendation === "DELAY_RELEASE"
      ? "CONDITIONAL_GO"
      : "BLOCKED";

  setStage("production_certification", productionReady ? "completed" : "failed", {
    certified: productionReady,
    finalDecision,
    rcVersion: "RC1",
    buildNumber: PLATFORM_METADATA.buildNumber,
    platformVersion: PLATFORM_METADATA.platformVersion,
    governanceScore: governanceCert?.overallGovernanceScore ?? 0,
    securityPassed: verificationPassed,
    rc1Passed,
    hardeningPassed,
    reviewRecommendation,
  });
  dispatch("DeploymentCompleted", { source: "deployment_pipeline", productionReady, finalDecision });

  // ── 6. Sprint 4 (next phase — gated) ──
  const sprint4Ready = productionReady;
  setStage("sprint_4", sprint4Ready ? "completed" : "pending", {
    phase: "Enterprise Procurement™",
    ready: sprint4Ready,
    note: sprint4Ready
      ? "Certification complete — Sprint 4 cleared to begin."
      : "Blocked pending Production Certification™.",
  });

  const pipelineResult = {
    stages: results,
    productionReady,
    finalDecision,
    duration: Date.now() - startTime,
    timestamp: new Date().toISOString(),
    pipelineVersion: "2.0",
    platformVersion: PLATFORM_METADATA.platformVersion,
  };

  try {
    localStorage.setItem("deployment_pipeline_result", JSON.stringify(pipelineResult));
  } catch {}

  return pipelineResult;
}
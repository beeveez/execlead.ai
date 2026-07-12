/**
 * EXECLEAD.AI — Deployment Pipeline™
 * ============================================================
 * The automated deployment pipeline that runs whenever a developer
 * clicks Publish. Chains platform validation, Guardian™, knowledge
 * synchronization, and intelligence refresh into a single
 * self-updating sequence — making EXEC™ a self-aware intelligence
 * layer that never needs manual retraining after deployments.
 *
 *   1. Build
 *   2. Platform Validation™        (16-stage governance certification)
 *   3. Guardian™                    (consistency scan + auto-repair)
 *   4. EXEC™ Knowledge Synchronization™  (discover + register all assets)
 *   5. EXEC™ Intelligence Refresh™       (rebuild caches + graphs)
 *   6. Deployment Verification™    (readiness checks)
 *   7. Production Ready
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

export const DEPLOYMENT_PIPELINE_STAGES = [
  { id: "build", name: "Build", description: "Compile and bundle platform assets" },
  { id: "platform_validation", name: "Platform Validation™", description: "16-stage governance certification" },
  { id: "guardian", name: "Guardian™", description: "Consistency scan and auto-repair" },
  { id: "knowledge_sync", name: "EXEC™ Knowledge Synchronization™", description: "Discover and register all platform assets into 10 registries" },
  { id: "intelligence_refresh", name: "EXEC™ Intelligence Refresh™", description: "Rebuild intelligence caches, capability graph, and platform graph" },
  { id: "deployment_verification", name: "Deployment Verification™", description: "Verify all readiness checks pass" },
  { id: "production_ready", name: "Production Ready", description: "Platform is live, certified, and EXEC™ is self-aware" },
];

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Runs the full deployment pipeline sequentially.
 * @param {Object} options
 * @param {Function} options.onStageChange - Called with { id, status, data } on each stage transition.
 * @param {string} options.userId - Current user ID (for Guardian audit logging).
 * @returns {Promise<Object>} Pipeline result with all stage statuses.
 */
export async function runDeploymentPipeline({ onStageChange, userId } = {}) {
  const startTime = Date.now();
  const results = {};
  let syncAssets = null;
  let syncRegistries = null;

  const setStage = (id, status, data = {}) => {
    const entry = { id, status, data, timestamp: new Date().toISOString() };
    results[id] = entry;
    onStageChange?.(entry);
  };

  // ── 1. Build ──
  setStage("build", "running");
  dispatch("DeploymentStarted", { source: "deployment_pipeline" });
  await delay(200);
  setStage("build", "completed", {
    version: PLATFORM_METADATA.platformVersion,
    buildNumber: PLATFORM_METADATA.buildNumber,
  });

  // ── 2. Platform Validation™ ──
  setStage("platform_validation", "running");
  await delay(150);
  try {
    const cert = runGovernancePipeline("deployment", 0);
    const validationStatus = cert.failures > 0 ? "failed" : (cert.certified ? "completed" : "warning");
    setStage("platform_validation", validationStatus, {
      score: cert.overallGovernanceScore,
      certified: cert.certified,
      failures: cert.failures,
      warnings: cert.warnings,
    });
  } catch (e) {
    setStage("platform_validation", "failed", { error: e.message });
  }

  // ── 3. Guardian™ ──
  setStage("guardian", "running");
  dispatch("GuardianStarted", { source: "deployment_pipeline" });
  await delay(150);
  try {
    const guardianResult = await runGuardianScan({ trigger: "deployment", userId, autoResolve: true });
    dispatch("GuardianCompleted", { source: "deployment_pipeline", scanId: guardianResult.scanId });
    setStage("guardian", "completed", {
      repaired: guardianResult.issuesFixed,
      pending: guardianResult.pending?.length ?? 0,
      alerts: guardianResult.alertsCount,
      rolledBack: guardianResult.rolledBack,
    });
  } catch (e) {
    dispatch("GuardianCompleted", { source: "deployment_pipeline", error: e.message });
    setStage("guardian", "warning", { error: e.message });
  }

  // ── 4. EXEC™ Knowledge Synchronization™ ──
  setStage("knowledge_sync", "running");
  await delay(150);
  try {
    syncAssets = discoverPlatformAssets();
    const validation = validateKnowledgeSync(syncAssets);
    syncRegistries = buildRegistries(syncAssets, validation);
    dispatch("KnowledgeSyncCompleted", { source: "deployment_pipeline", assets: syncAssets.counts });
    setStage("knowledge_sync", "completed", {
      assets: syncAssets.counts,
      registries: Object.keys(syncRegistries).length,
      findings: validation.findings.length,
      errors: validation.errors.length,
    });
  } catch (e) {
    setStage("knowledge_sync", "failed", { error: e.message });
  }

  // ── 5. EXEC™ Intelligence Refresh™ ──
  setStage("intelligence_refresh", "running");
  await delay(150);
  try {
    if (!syncAssets || !syncRegistries) throw new Error("Knowledge sync did not produce assets");
    const intelligence = refreshIntelligenceCaches(syncAssets, syncRegistries);
    dispatch("IntelligenceRefreshCompleted", { source: "deployment_pipeline" });
    setStage("intelligence_refresh", "completed", {
      caches: Object.keys(intelligence).length,
      capabilityGraphNodes: intelligence.capabilityGraph?.nodes ?? 0,
      platformGraphNodes: intelligence.platformGraph?.nodes ?? 0,
    });
  } catch (e) {
    setStage("intelligence_refresh", "failed", { error: e.message });
  }

  // ── 6. Deployment Verification™ ──
  setStage("deployment_verification", "running");
  await delay(150);
  try {
    const readiness = computeDeploymentReadiness();
    setStage("deployment_verification", readiness.summary.canDeploy ? "completed" : "failed", {
      passed: readiness.summary.passed,
      total: readiness.summary.total,
      healthScore: readiness.summary.healthScore,
      canDeploy: readiness.summary.canDeploy,
    });
  } catch (e) {
    setStage("deployment_verification", "failed", { error: e.message });
  }

  // ── 7. Production Ready ──
  await delay(150);
  const productionReady = results.deployment_verification?.status === "completed";
  setStage("production_ready", productionReady ? "completed" : "failed", {
    productionReady,
    platformVersion: PLATFORM_METADATA.platformVersion,
  });
  dispatch("DeploymentCompleted", { source: "deployment_pipeline", productionReady });

  return {
    stages: results,
    productionReady,
    duration: Date.now() - startTime,
    timestamp: new Date().toISOString(),
    pipelineVersion: "1.0",
    platformVersion: PLATFORM_METADATA.platformVersion,
  };
}
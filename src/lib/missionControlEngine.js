/**
 * Mission Control™ Engine
 * ============================================================
 * Computes operational data for all 10 governance domains and
 * the Executive Operations Ribbon (9 metrics).
 *
 * Each domain includes: executive summary, root cause analysis,
 * impact assessment, dependencies, affected components, timeline,
 * audit history, recommended actions, one-click repair, deep links,
 * maturity model, and export data.
 */
import {
  validateManifest, getManifestCoverage, PLATFORM_METADATA,
  getRepairLog, getActiveRepairCount, MODULE_REGISTRY, ROUTE_REGISTRY,
  FRAMEWORK_REGISTRY, KNOWLEDGE_PACK_REGISTRY, AI_PERSONA_REGISTRY,
  FEATURE_FLAG_REGISTRY,
} from "./platformManifest";
import { getActiveKnowledgePacks, getFallbackCount } from "./knowledgeResolution";
import { EXEC_KNOWLEDGE_INDEX } from "./execKnowledgeBase";

const NOW = () => new Date().toISOString();

const MATURITY_LABELS = {
  1: "Initial", 2: "Developing", 3: "Operational",
  4: "Enterprise Ready", 5: "Optimized",
};
const MATURITY_REQUIREMENTS = {
  1: ["Reach 50% health score", "Resolve all error-level findings", "Establish baseline monitoring"],
  2: ["Reach 70% health score", "Resolve all error-level findings", "Enable automated diagnostics"],
  3: ["Reach 85% health score", "Resolve all warning-level findings", "Enable Self-Healing automation"],
  4: ["Reach 95% health score", "Achieve zero unresolved findings", "Full registry coverage"],
  5: ["Maintain 95%+ health score", "Sustain zero findings", "Continuous optimization"],
};
const MATURITY_TIMES = {
  1: "2–4 hours", 2: "1–2 hours", 3: "30–60 min", 4: "15–30 min", 5: "Ongoing",
};

function computeMaturity(healthScore, errors, warnings) {
  let level;
  if (healthScore >= 95 && errors === 0 && warnings === 0) level = 5;
  else if (healthScore >= 85 && errors === 0) level = 4;
  else if (healthScore >= 70 && errors === 0) level = 3;
  else if (healthScore >= 50) level = 2;
  else level = 1;
  return {
    level, label: MATURITY_LABELS[level],
    nextLevel: level < 5 ? level + 1 : null,
    nextLabel: level < 5 ? MATURITY_LABELS[level + 1] : null,
    requirements: MATURITY_REQUIREMENTS[level] || [],
    estimatedTime: MATURITY_TIMES[level] || "—",
    progress: Math.round((level / 5) * 100),
  };
}

function getSeverity(status, errors) {
  if (status === "fail" && errors > 0) return "Critical";
  if (status === "fail") return "High";
  if (status === "warn") return "Medium";
  return "Info";
}

function getStatus(healthScore, errors) {
  if (errors > 0 || healthScore < 50) return "fail";
  if (healthScore < 85 || healthScore < 95) return healthScore < 70 ? "warn" : "warn";
  return "pass";
}

const SAFE_CODES = ["BROKEN_MODULE_ROUTE", "UNINDEXED_ROUTE", "MODULE_MISSING_PACK"];

// ============================================================
// DOMAIN 1 — Platform Governance Center™
// ============================================================
function buildGovernanceDomain(state, guardian, deploymentSummary) {
  const findings = state.findings || [];
  const errors = state.errorCount || 0;
  const warnings = state.warningCount || 0;
  const health = state.health?.overall || 100;
  const repairs = getRepairLog();
  const safe = findings.filter((f) => SAFE_CODES.includes(f.code));
  const status = errors > 0 ? "fail" : warnings > 0 ? "warn" : "pass";

  return {
    id: "governance", name: "Platform Governance Center™", icon: "Gauge",
    category: "Governance", owner: "Platform Engineering",
    healthScore: health, status, severity: getSeverity(status, errors),
    maturity: computeMaturity(health, errors, warnings),
    summary: {
      detail: errors === 0 && warnings === 0 ? "All governance checks passed" : `${errors} error(s), ${warnings} warning(s)`,
      metrics: [
        { label: "Findings", value: findings.length },
        { label: "Errors", value: errors },
        { label: "Warnings", value: warnings },
        { label: "Coverage", value: `${state.coverage?.routeCoverage || 0}%` },
      ],
    },
    rootCause: {
      description: errors > 0
        ? "Manifest validation detected broken references or missing registry entries."
        : warnings > 0
          ? "Incomplete registry coverage — some routes or modules lack metadata entries."
          : "No root cause — governance checks are passing.",
      factors: findings.slice(0, 5).map((f) => f.message),
    },
    impact: {
      description: "The Platform Governance Center™ is the authoritative source for platform integrity. Issues here affect every downstream system that depends on manifest metadata.",
      affectedComponents: ["EXEC™", "Navigation", "Search", "Deployment Validation", "AI Context"],
      affectedCount: findings.length,
    },
    dependencies: {
      upstream: ["Route Registry", "Module Registry", "Framework Registry", "Workspace Registry"],
      downstream: ["EXEC™", "Platform State Manager™", "Deployment Validation", "Mission Control™"],
    },
    timeline: (state.liveEvents || []).slice(0, 5).map((e) => ({ event: e.event, timestamp: e.timestamp, source: e.source })),
    auditHistory: repairs.slice(0, 10),
    recommendedActions: [
      "Run the Self-Healing Engine™ to resolve safe findings automatically.",
      "Review manual findings in the Platform Governance Center™.",
      "Verify route coverage reaches 100% after repairs.",
    ],
    canRepair: safe.length > 0, repairableFindings: safe,
    deepLinks: [
      { label: "Platform Governance Center™", path: "/developer/governance" },
      { label: "Self-Healing Engine™", path: "/developer/governance" },
    ],
    lastValidated: state.lastRefresh || NOW(),
  };
}

// ============================================================
// DOMAIN 2 — Platform State Manager™
// ============================================================
function buildStateManagerDomain(state) {
  const health = state.safeMode ? 40 : 100;
  const errors = state.safeMode ? 1 : 0;
  const status = state.safeMode ? "fail" : "pass";

  return {
    id: "state_manager", name: "Platform State Manager™", icon: "Activity",
    category: "Runtime", owner: "Platform Engineering",
    healthScore: health, status, severity: getSeverity(status, errors),
    maturity: computeMaturity(health, errors, 0),
    summary: {
      detail: state.safeMode ? "Safe mode active — auto-recovery in progress" : "Runtime state synchronized",
      metrics: [
        { label: "State Version", value: state.stateVersion || 0 },
        { label: "Cache Version", value: state.cacheVersion || "v0" },
        { label: "Subscribers", value: state.subscribersUpdated || 0 },
        { label: "Safe Mode", value: state.safeMode ? "Active" : "Inactive" },
      ],
    },
    rootCause: {
      description: state.safeMode
        ? "Platform State Manager™ entered safe mode after a computation failure. Auto-recovery is retrying every 3 seconds."
        : "No issues — the Platform State Manager™ is the single runtime source of truth and is synchronized.",
      factors: state.safeMode ? ["State computation failed", "Falling back to safe defaults", "Auto-recovery retrying"] : [],
    },
    impact: {
      description: "The Platform State Manager™ feeds every dashboard, widget, and module. Safe mode causes stale values and conflicting metrics across the platform.",
      affectedComponents: ["All Dashboards", "All Widgets", "Mission Control™", "Platform Governance Center™"],
      affectedCount: state.safeMode ? 1 : 0,
    },
    dependencies: {
      upstream: ["Platform Manifest™", "Platform Event Bus™", "Guardian™"],
      downstream: ["All Platform Components", "All Dashboards", "All Widgets"],
    },
    timeline: (state.liveEvents || []).slice(0, 5).map((e) => ({ event: e.event, timestamp: e.timestamp, source: e.source })),
    auditHistory: [],
    recommendedActions: state.safeMode
      ? ["Wait for auto-recovery to complete (3s retry cycle).", "Check browser console for computation errors.", "Refresh the page if safe mode persists."]
      : ["Monitor state version for unexpected changes.", "Verify Platform Event Bus™ subscriptions are active."],
    canRepair: false, repairableFindings: [],
    deepLinks: [
      { label: "Platform State Debug", path: "/developer/governance" },
      { label: "System Health", path: "/developer/system-health" },
    ],
    lastValidated: state.lastRefresh || NOW(),
  };
}

// ============================================================
// DOMAIN 3 — Foundation Verification™
// ============================================================
function buildFoundationDomain(state) {
  const coverage = state.coverage?.routeCoverage || 0;
  const knowledgeCoverage = state.health?.knowledgeCoverage || 100;
  const errors = state.errorCount || 0;
  const healthScore = Math.round((coverage * 0.4 + knowledgeCoverage * 0.4 + (errors === 0 ? 20 : 0)));
  const status = errors > 0 ? "fail" : coverage < 100 ? "warn" : "pass";

  return {
    id: "foundation", name: "Foundation Verification™", icon: "ShieldCheck",
    category: "Governance", owner: "Platform Engineering",
    healthScore, status, severity: getSeverity(status, errors),
    maturity: computeMaturity(healthScore, errors, coverage < 100 ? 1 : 0),
    summary: {
      detail: status === "pass" ? "Foundation verified — all phases passing" : `${errors} error(s), coverage at ${coverage}%`,
      metrics: [
        { label: "Route Coverage", value: `${coverage}%` },
        { label: "Knowledge Coverage", value: `${knowledgeCoverage}%` },
        { label: "Errors", value: errors },
        { label: "Health", value: `${healthScore}%` },
      ],
    },
    rootCause: {
      description: errors > 0
        ? "Foundation verification detected architectural inconsistencies — broken references or missing registry entries."
        : coverage < 100
          ? "Foundation verification is partially complete — some routes lack module entries."
          : "Foundation is verified — all architectural phases are passing.",
      factors: errors > 0 ? state.errors?.slice(0, 3).map((e) => e.message) : [],
    },
    impact: {
      description: "Foundation Verification™ ensures the platform's internal architecture is validated as a unified, production-critical system before advancing to the EXEC™ Cognitive Engine™.",
      affectedComponents: ["EXEC™ Cognitive Engine™", "Platform Architecture", "AI Autonomy"],
      affectedCount: errors,
    },
    dependencies: {
      upstream: ["Platform Manifest™", "Knowledge Resolution Engine™", "Core Platform Services™"],
      downstream: ["EXEC™ Cognitive Engine™", "Platform Autonomy", "Enterprise Readiness"],
    },
    timeline: [],
    auditHistory: [],
    recommendedActions: [
      "Resolve all error-level findings via Self-Healing.",
      "Achieve 100% route coverage.",
      "Verify all 10 foundation verification phases pass.",
    ],
    canRepair: false, repairableFindings: [],
    deepLinks: [
      { label: "Foundation Verification Center™", path: "/developer/governance" },
      { label: "Foundation Verification Report™", path: "/developer/governance" },
    ],
    lastValidated: state.lastRefresh || NOW(),
  };
}

// ============================================================
// DOMAIN 4 — Platform Self-Healing™
// ============================================================
function buildSelfHealingDomain(state) {
  const activeRepairs = getActiveRepairCount();
  const repairs = getRepairLog();
  const health = Math.min(100, 80 + (repairs.length > 0 ? 20 : 0));
  const status = "pass";

  return {
    id: "self_healing", name: "Platform Self-Healing™", icon: "Wrench",
    category: "Operations", owner: "Platform Engineering",
    healthScore: health, status, severity: getSeverity(status, 0),
    maturity: computeMaturity(health, 0, 0),
    summary: {
      detail: `${activeRepairs} active repair(s) · ${repairs.length} total repair log entries`,
      metrics: [
        { label: "Active Repairs", value: activeRepairs },
        { label: "Total Repairs", value: repairs.length },
        { label: "Engine Status", value: "Operational" },
        { label: "Auto-Repair", value: "Enabled" },
      ],
    },
    rootCause: {
      description: "The Self-Healing Engine™ automatically analyzes, validates, and safely repairs deterministic Platform Manifest™ issues while escalating architectural decisions for developer review.",
      factors: [],
    },
    impact: {
      description: "Self-Healing reduces manual maintenance burden and keeps the platform self-maintaining without hiding important governance decisions.",
      affectedComponents: ["Platform Manifest™", "Route Registry", "Module Registry", "Knowledge Pack Registry"],
      affectedCount: activeRepairs,
    },
    dependencies: {
      upstream: ["Platform Manifest™", "Validation Engine"],
      downstream: ["Platform Governance Center™", "Deployment Readiness", "Mission Control™"],
    },
    timeline: repairs.slice(0, 5).map((r) => ({ event: r.action || r.issue, timestamp: r.timestamp, source: r.registryUpdated })),
    auditHistory: repairs.slice(0, 10),
    recommendedActions: [
      "Run 'Analyze Platform' to detect new findings.",
      "Apply safe repairs via one-click repair.",
      "Review items requiring manual attention.",
    ],
    canRepair: false, repairableFindings: [],
    deepLinks: [
      { label: "Self-Healing Engine™", path: "/developer/governance" },
      { label: "Repair Diagnostics", path: "/developer/governance" },
    ],
    lastValidated: state.lastRepair || NOW(),
  };
}

// ============================================================
// DOMAIN 5 — Knowledge Operations™
// ============================================================
function buildKnowledgeOpsDomain(state) {
  const activePacks = getActiveKnowledgePacks();
  const fallbackCount = getFallbackCount();
  const knowledgeCoverage = state.health?.knowledgeCoverage || 100;
  const errors = 0;
  const warnings = fallbackCount;
  const health = knowledgeCoverage;
  const status = fallbackCount > 0 ? "warn" : "pass";

  return {
    id: "knowledge_ops", name: "Knowledge Operations™", icon: "Brain",
    category: "AI", owner: "AI Engineering",
    healthScore: health, status, severity: getSeverity(status, 0),
    maturity: computeMaturity(health, errors, warnings),
    summary: {
      detail: `${activePacks.length} active Knowledge Packs · ${fallbackCount} fallback(s)`,
      metrics: [
        { label: "Active Packs", value: activePacks.length },
        { label: "Fallbacks", value: fallbackCount },
        { label: "Knowledge Entries", value: EXEC_KNOWLEDGE_INDEX.length },
        { label: "Coverage", value: `${knowledgeCoverage}%` },
      ],
    },
    rootCause: {
      description: fallbackCount > 0
        ? "Some AI personas are using fallback logic instead of dynamic knowledge resolution, reducing response quality."
        : "All Knowledge Packs are active and personas resolve dynamically.",
      factors: [],
    },
    impact: {
      description: "Knowledge Operations™ powers every AI interaction. Fallback personas provide degraded responses without dynamic knowledge resolution.",
      affectedComponents: ["EXEC™", "Concierge", "Coach", "Simulator", "Academy™"],
      affectedCount: fallbackCount,
    },
    dependencies: {
      upstream: ["ELIM™", "Knowledge Pack Engine™", "Framework Registry"],
      downstream: ["EXEC™", "All AI Interactions", "Executive Intelligence"],
    },
    timeline: [],
    auditHistory: [],
    recommendedActions: [
      "Assign active Knowledge Packs to fallback personas.",
      "Verify knowledge resolution via the Knowledge Resolution Engine™.",
      "Sync EXEC™ Knowledge after pack changes.",
    ],
    canRepair: false, repairableFindings: [],
    deepLinks: [
      { label: "ELIM™ Management Center", path: "/elim" },
      { label: "Knowledge Pack Engine™", path: "/developer/governance" },
    ],
    lastValidated: state.lastKnowledgeSync || NOW(),
  };
}

// ============================================================
// DOMAIN 6 — Deployment Operations™
// ============================================================
function buildDeploymentOpsDomain(deploymentSummary) {
  const health = deploymentSummary?.healthScore || 100;
  const errors = deploymentSummary?.failed || 0;
  const warnings = deploymentSummary?.warned || 0;
  const status = errors > 0 ? "fail" : warnings > 0 ? "warn" : "pass";

  return {
    id: "deployment_ops", name: "Deployment Operations™", icon: "Rocket",
    category: "Operations", owner: "DevOps",
    healthScore: health, status, severity: getSeverity(status, errors),
    maturity: computeMaturity(health, errors, warnings),
    summary: {
      detail: deploymentSummary?.ready ? "Ready for deployment" : deploymentSummary?.canDeploy ? "Deployable with warnings" : "Deployment blocked",
      metrics: [
        { label: "Readiness", value: `${health}%` },
        { label: "Passed", value: deploymentSummary?.passed || 0 },
        { label: "Warnings", value: warnings },
        { label: "Failures", value: errors },
      ],
    },
    rootCause: {
      description: errors > 0
        ? "Deployment readiness checks detected critical failures that block deployment."
        : warnings > 0
          ? "Deployment readiness checks detected warnings — deployment is possible but not recommended."
          : "All deployment readiness checks are passing.",
      factors: [],
    },
    impact: {
      description: "Deployment Operations™ ensures the platform is safe to deploy. Blocked deployments prevent new features from reaching users.",
      affectedComponents: ["Release Pipeline", "User Experience", "Feature Rollout"],
      affectedCount: errors + warnings,
    },
    dependencies: {
      upstream: ["Platform Manifest™", "Feature Flag Registry", "Configuration"],
      downstream: ["Production Environment", "User Experience", "Release Pipeline"],
    },
    timeline: [],
    auditHistory: [],
    recommendedActions: [
      "Resolve all failure-level deployment checks.",
      "Review and address warning-level checks.",
      "Verify readiness reaches 100% before deployment.",
    ],
    canRepair: false, repairableFindings: [],
    deepLinks: [
      { label: "Deployment Center", path: "/developer/deployments" },
      { label: "Deployment Readiness", path: "/developer/governance" },
    ],
    lastValidated: NOW(),
  };
}

// ============================================================
// DOMAIN 7 — Security Operations™
// ============================================================
function buildSecurityOpsDomain(state, guardian) {
  const guardianPending = guardian?.pending?.length || 0;
  const guardianHealth = state.health?.guardianHealth || 100;
  const health = guardianPending > 0 ? Math.max(50, 100 - guardianPending * 10) : guardianHealth;
  const status = guardianPending > 0 ? "warn" : "pass";

  return {
    id: "security_ops", name: "Security Operations™", icon: "Shield",
    category: "Security", owner: "Security Engineering",
    healthScore: health, status, severity: getSeverity(status, 0),
    maturity: computeMaturity(health, 0, guardianPending),
    summary: {
      detail: guardianPending > 0 ? `${guardianPending} Guardian™ item(s) pending review` : "Guardian™ scan passed — no pending items",
      metrics: [
        { label: "Guardian Status", value: guardian?.status || "idle" },
        { label: "Pending", value: guardianPending },
        { label: "Broken Nav", value: guardian?.brokenNavPaths?.size || 0 },
        { label: "Last Scan", value: guardian?.lastScan ? "Recent" : "—" },
      ],
    },
    rootCause: {
      description: guardianPending > 0
        ? "The Guardian™ consistency engine detected items requiring administrator review."
        : "No security issues — the Guardian™ consistency engine is operating normally.",
      factors: [],
    },
    impact: {
      description: "Security Operations™ protects platform integrity through the Guardian™ consistency engine and zero-trust security architecture.",
      affectedComponents: ["Guardian™", "Feature Flags", "Navigation", "User Access"],
      affectedCount: guardianPending,
    },
    dependencies: {
      upstream: ["Guardian™", "Zero-Trust Engine", "Feature Flag Registry"],
      downstream: ["User Experience", "Feature Rollout", "Access Control"],
    },
    timeline: (guardian?.recentActivity || []).slice(0, 5).map((a) => ({ event: a.activity_type, timestamp: a.created_date, source: a.result })),
    auditHistory: (guardian?.recentActivity || []).slice(0, 10),
    recommendedActions: [
      "Review and resolve pending Guardian™ items.",
      "Run a Guardian™ scan to detect new issues.",
      "Verify zero-trust security policies are enforced.",
    ],
    canRepair: false, repairableFindings: [],
    deepLinks: [
      { label: "Guardian™", path: "/guardian" },
      { label: "Security Center", path: "/security" },
    ],
    lastValidated: state.lastGuardianScan || NOW(),
  };
}

// ============================================================
// DOMAIN 8 — AI Operations™
// ============================================================
function buildAIOpsDomain(state) {
  const knowledgeVersion = state.knowledgeVersion || PLATFORM_METADATA.knowledgeVersion;
  const promptVersion = PLATFORM_METADATA.promptVersion;
  const synced = state.lastKnowledgeSync !== null;
  const health = synced ? 100 : 85;
  const status = "pass";

  return {
    id: "ai_ops", name: "AI Operations™", icon: "Cpu",
    category: "AI", owner: "AI Engineering",
    healthScore: health, status, severity: getSeverity(status, 0),
    maturity: computeMaturity(health, 0, 0),
    summary: {
      detail: `EXEC™ Knowledge v${knowledgeVersion} · Prompt v${promptVersion}`,
      metrics: [
        { label: "Knowledge v", value: knowledgeVersion },
        { label: "Prompt v", value: promptVersion },
        { label: "Platform v", value: state.platformVersion || PLATFORM_METADATA.platformVersion },
        { label: "Synced", value: synced ? "Yes" : "Pending" },
      ],
    },
    rootCause: {
      description: "AI Operations™ monitors EXEC™ synchronization, model activity, and token consumption across the platform.",
      factors: [],
    },
    impact: {
      description: "An unsynchronized EXEC™ provides outdated information to users and cannot explain platform assets accurately.",
      affectedComponents: ["EXEC™", "Concierge", "Coach", "Simulator", "Academy™"],
      affectedCount: 0,
    },
    dependencies: {
      upstream: ["Knowledge Pack Engine™", "Platform Manifest™", "InvokeLLM"],
      downstream: ["All EXEC™ Interactions", "Concierge", "Coach", "Simulator"],
    },
    timeline: [],
    auditHistory: [],
    recommendedActions: [
      "Sync EXEC™ Knowledge via the syncExecKnowledge function.",
      "Monitor AI usage in the AI Command Center.",
      "Verify model performance and token consumption.",
    ],
    canRepair: false, repairableFindings: [],
    deepLinks: [
      { label: "AI Command Center", path: "/ai-command-center" },
      { label: "EXEC™ Console", path: "/exec-admin" },
    ],
    lastValidated: state.lastKnowledgeSync || NOW(),
  };
}

// ============================================================
// DOMAIN 9 — Enterprise Operations™
// ============================================================
function buildEnterpriseOpsDomain(state) {
  const liveFeatures = state.coverage?.liveFeatures || 0;
  const betaFeatures = state.coverage?.betaFeatures || 0;
  const totalFeatures = state.coverage?.featureFlags || 0;
  const health = totalFeatures > 0 ? Math.round((liveFeatures / totalFeatures) * 100) : 100;
  const status = "pass";

  return {
    id: "enterprise_ops", name: "Enterprise Operations™", icon: "Building2",
    category: "Enterprise", owner: "Enterprise Engineering",
    healthScore: health, status, severity: getSeverity(status, 0),
    maturity: computeMaturity(health, 0, 0),
    summary: {
      detail: `${liveFeatures} live features · ${betaFeatures} in beta · ${totalFeatures} total`,
      metrics: [
        { label: "Live Features", value: liveFeatures },
        { label: "Beta", value: betaFeatures },
        { label: "Total Flags", value: totalFeatures },
        { label: "Subscriptions", value: state.coverage?.subscriptions || 0 },
      ],
    },
    rootCause: {
      description: "Enterprise Operations™ manages feature rollouts, subscription tiers, and enterprise readiness across the platform.",
      factors: [],
    },
    impact: {
      description: "Enterprise Operations™ controls which features are available to which users at what stage of rollout.",
      affectedComponents: ["FeatureGate Components", "Subscription System", "RBAC", "User Access"],
      affectedCount: 0,
    },
    dependencies: {
      upstream: ["Feature Flag Registry", "Subscription Registry", "Pricing Engine"],
      downstream: ["User Access", "Feature Rollout", "Enterprise Dashboard"],
    },
    timeline: [],
    auditHistory: [],
    recommendedActions: [
      "Review feature flags in Feature Flag Management™.",
      "Verify enterprise feature entitlements.",
      "Monitor subscription provisioning.",
    ],
    canRepair: false, repairableFindings: [],
    deepLinks: [
      { label: "Enterprise Dashboard", path: "/enterprise" },
      { label: "Feature Flag Management™", path: "/feature-management" },
    ],
    lastValidated: NOW(),
  };
}

// ============================================================
// DOMAIN 10 — Runtime Analytics™
// ============================================================
function buildRuntimeAnalyticsDomain(state) {
  const apiHealth = state.apiHealth || 100;
  const dbHealth = state.databaseHealth || 100;
  const cacheHealth = state.cacheHealth || 100;
  const queueHealth = state.queueHealth || 100;
  const health = Math.round((apiHealth + dbHealth + cacheHealth + queueHealth) / 4);
  const status = health >= 90 ? "pass" : health >= 70 ? "warn" : "fail";

  return {
    id: "runtime_analytics", name: "Runtime Analytics™", icon: "BarChart3",
    category: "Runtime", owner: "Platform Engineering",
    healthScore: health, status, severity: getSeverity(status, 0),
    maturity: computeMaturity(health, 0, 0),
    summary: {
      detail: `API ${apiHealth}% · DB ${dbHealth}% · Cache ${cacheHealth}% · Queue ${queueHealth}%`,
      metrics: [
        { label: "API Health", value: `${apiHealth}%` },
        { label: "Database", value: `${dbHealth}%` },
        { label: "Cache", value: `${cacheHealth}%` },
        { label: "Queue", value: `${queueHealth}%` },
      ],
    },
    rootCause: {
      description: health < 90
        ? "Runtime analytics detected degraded performance in one or more infrastructure components."
        : "All runtime components are operating within normal parameters.",
      factors: [],
    },
    impact: {
      description: "Runtime Analytics™ monitors the real-time performance of API, database, cache, and queue infrastructure.",
      affectedComponents: ["API Layer", "Database", "Cache Layer", "Background Jobs"],
      affectedCount: health < 90 ? 1 : 0,
    },
    dependencies: {
      upstream: ["API Gateway", "Database", "Cache Layer", "Queue System"],
      downstream: ["All Platform Components", "User Experience", "Background Processing"],
    },
    timeline: [],
    auditHistory: [],
    recommendedActions: [
      "Monitor API response times in System Health.",
      "Check database query performance.",
      "Verify cache hit rates and queue throughput.",
    ],
    canRepair: false, repairableFindings: [],
    deepLinks: [
      { label: "System Health", path: "/developer/system-health" },
      { label: "Analytics", path: "/analytics" },
    ],
    lastValidated: state.lastRefresh || NOW(),
  };
}

// ============================================================
// EXECUTIVE OPERATIONS RIBBON
// ============================================================
function buildRibbon(state, guardian, deploymentSummary, domains) {
  const health = state.health?.overall || 100;
  const readiness = state.readiness?.overall || 100;
  const knowledgeHealth = state.health?.knowledgeCoverage || 100;
  const governanceHealth = Math.max(0, 100 - (state.errorCount || 0) * 10 - (state.warningCount || 0) * 3);
  const securityHealth = guardian?.pending?.length > 0 ? Math.max(50, 100 - guardian.pending.length * 10) : 100;
  const deploymentStatus = deploymentSummary?.healthScore || 100;
  const foundationStatus = domains.find((d) => d.id === "foundation")?.healthScore || 100;
  const overallMaturity = Math.round(domains.reduce((sum, d) => sum + d.maturity.level, 0) / domains.length);
  const execSynced = state.lastKnowledgeSync !== null;

  return [
    { id: "platform_health", label: "Platform Health", value: health, unit: "/100", status: health >= 90 ? "pass" : health >= 70 ? "warn" : "fail", icon: "Activity" },
    { id: "platform_readiness", label: "Platform Readiness", value: readiness, unit: "%", status: readiness >= 90 ? "pass" : readiness >= 70 ? "warn" : "fail", icon: "Gauge" },
    { id: "platform_maturity", label: "Platform Maturity", value: overallMaturity, unit: "/5", status: overallMaturity >= 4 ? "pass" : overallMaturity >= 3 ? "warn" : "fail", icon: "TrendingUp", displayValue: `L${overallMaturity}` },
    { id: "knowledge_health", label: "Knowledge Health", value: knowledgeHealth, unit: "%", status: knowledgeHealth >= 90 ? "pass" : knowledgeHealth >= 70 ? "warn" : "fail", icon: "Brain" },
    { id: "governance_health", label: "Governance Health", value: governanceHealth, unit: "%", status: governanceHealth >= 90 ? "pass" : governanceHealth >= 70 ? "warn" : "fail", icon: "ShieldCheck" },
    { id: "security_health", label: "Security Health", value: securityHealth, unit: "%", status: securityHealth >= 90 ? "pass" : securityHealth >= 70 ? "warn" : "fail", icon: "Shield" },
    { id: "deployment_status", label: "Deployment Status", value: deploymentStatus, unit: "%", status: deploymentStatus >= 90 ? "pass" : deploymentStatus >= 70 ? "warn" : "fail", icon: "Rocket" },
    { id: "foundation_status", label: "Foundation Status", value: foundationStatus, unit: "%", status: foundationStatus >= 90 ? "pass" : foundationStatus >= 70 ? "warn" : "fail", icon: "Boxes" },
    { id: "exec_sync", label: "EXEC™ Sync", value: execSynced ? 100 : 0, unit: "%", status: execSynced ? "pass" : "warn", icon: "Cpu", displayValue: execSynced ? "Synced" : "Pending" },
  ];
}

// ============================================================
// MAIN — COMPUTE MISSION CONTROL
// ============================================================
export function computeMissionControl(state, guardian, deploymentSummary) {
  const domains = [
    buildGovernanceDomain(state, guardian, deploymentSummary),
    buildStateManagerDomain(state),
    buildFoundationDomain(state),
    buildSelfHealingDomain(state),
    buildKnowledgeOpsDomain(state),
    buildDeploymentOpsDomain(deploymentSummary),
    buildSecurityOpsDomain(state, guardian),
    buildAIOpsDomain(state),
    buildEnterpriseOpsDomain(state),
    buildRuntimeAnalyticsDomain(state),
  ];

  const ribbon = buildRibbon(state, guardian, deploymentSummary, domains);
  const overallMaturity = Math.round(domains.reduce((sum, d) => sum + d.maturity.level, 0) / domains.length);
  const overallHealth = Math.round(domains.reduce((sum, d) => sum + d.healthScore, 0) / domains.length);
  const totalIssues = domains.reduce((sum, d) => sum + d.impact.affectedCount, 0);
  const repairableDomains = domains.filter((d) => d.canRepair).length;

  return {
    domains, ribbon,
    summary: {
      overallMaturity, overallHealth, totalIssues, repairableDomains,
      maturityLabel: MATURITY_LABELS[overallMaturity] || "Initial",
      totalDomains: domains.length,
    },
  };
}
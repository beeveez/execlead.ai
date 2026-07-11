/**
 * EXECLEAD.AI — PLATFORM GOVERNANCE PIPELINE™
 * Version 1.0
 * ============================================================
 * The automated validation pipeline that runs after every
 * significant platform event.
 *
 * 16 Stages:
 *   1.  Platform Manifest™ Validation
 *   2.  Module Registry Validation
 *   3.  Route Registry Validation
 *   4.  Capability Registry Validation
 *   5.  Framework Registry Validation
 *   6.  Knowledge Pack Validation
 *   7.  Persona Registry Validation
 *   8.  Workspace Registry Validation
 *   9.  Navigation Registry Validation
 *   10. EXEC™ Knowledge Index Validation
 *   11. Platform State Refresh
 *   12. Registry Synchronization
 *   13. Configuration Validation
 *   14. Deployment Validation
 *   15. Self-Healing
 *   16. Final Governance Certification
 *
 * The pipeline is READ-ONLY — it validates and certifies but
 * never mutates platform state. All health data comes from the
 * same source functions used by Platform State Manager™.
 */
import {
  validateManifest, getManifestCoverage, PLATFORM_METADATA,
  MODULE_REGISTRY, ROUTE_REGISTRY, FRAMEWORK_REGISTRY,
  KNOWLEDGE_PACK_REGISTRY, AI_PERSONA_REGISTRY, WORKSPACE_REGISTRY,
  CAPABILITY_REGISTRY, FEATURE_FLAG_REGISTRY,
  getRepairLog, getActiveRepairCount,
} from "./platformManifest";
import {
  getActiveKnowledgePacks, isKnowledgePackEngineActive,
  getPersonaAudit, getCapabilityChain, getFallbackCount,
} from "./knowledgeResolution";
import { getSyncHealth, getRegistryCoverage } from "./registrySyncEngine";
import { computeDeploymentReadiness } from "./deploymentReadinessEngine";
import { analyzePlatform, computePlatformHealth } from "./selfHealingEngine";
import { EXEC_KNOWLEDGE_INDEX } from "./execKnowledgeBase";
import { CONFIG_VERSION } from "./platformConfig";
import { dispatch as platformDispatch } from "./platformEventBus";

const PIPELINE_VERSION = "1.0";

// Events that trigger the pipeline (debounced by the context)
export const PIPELINE_TRIGGERS = [
  "ManifestUpdated",
  "KnowledgeSyncCompleted",
  "SelfHealingCompleted",
  "ConfigUpdated",
  "PlatformCommitted",
  "DeploymentCompleted",
  "GuardianCompleted",
  "CacheInvalidated",
];

// ============================================================
// FINDING ENRICHMENT — drill-down data for each finding code
// ============================================================

const FINDING_ENRICHMENT = {
  BROKEN_MODULE_ROUTE: {
    rootCause: "Module references a route that does not exist in the Route Registry. The module's path was derived from the EXEC™ Knowledge Index at import time but the route was later removed or renamed.",
    impact: "Users cannot navigate to this module. EXEC™ cannot explain or recommend it. Manifest coverage is reduced.",
    recommendedAction: "Update the module's route reference to point to a valid route in the Route Registry, or re-add the missing route.",
    relatedRegistries: ["Module Registry™", "Route Registry™", "EXEC™ Knowledge Index"],
    autoRepairable: true,
  },
  UNINDEXED_ROUTE: {
    rootCause: "Route exists in the Route Registry but has no corresponding module entry in the EXEC™ Knowledge Index. The route was added to the app router but not registered in the manifest.",
    impact: "Reduces manifest coverage. The route is invisible to EXEC™ and search. Users can only access it via direct URL.",
    recommendedAction: "Create a module entry for this route in the EXEC™ Knowledge Index.",
    relatedRegistries: ["Route Registry™", "Module Registry™", "EXEC™ Knowledge Index"],
    autoRepairable: true,
  },
  MODULE_MISSING_PACK: {
    rootCause: "Module has no associated Knowledge Pack. The module's category does not map to a framework with an active pack.",
    impact: "EXEC™ cannot provide intelligent, domain-specific responses about this module.",
    recommendedAction: "Assign a Knowledge Pack based on the module's category mapping.",
    relatedRegistries: ["Module Registry™", "Knowledge Pack Registry™"],
    autoRepairable: true,
  },
  FRAMEWORK_MISSING_PACK: {
    rootCause: "Intelligence framework has no associated Knowledge Pack. The framework was registered in ELIM™ but no pack was created or assigned.",
    impact: "AI interactions within this framework's domain lack deep knowledge and context.",
    recommendedAction: "Assign or create a Knowledge Pack for this framework in the ELIM™ Management Center.",
    relatedRegistries: ["Framework Registry™", "Knowledge Pack Registry™"],
    autoRepairable: false,
  },
  EMPTY_WORKSPACE: {
    rootCause: "Workspace has no registered modules. The workspace was created but no modules were assigned to it.",
    impact: "Workspace appears empty to users and is not included in manifest coverage calculations.",
    recommendedAction: "Register at least one module for this workspace, or archive it if no longer needed.",
    relatedRegistries: ["Workspace Registry™", "Module Registry™"],
    autoRepairable: false,
  },
  PERSONA_FALLBACK: {
    rootCause: "AI persona is using fallback prompts instead of dynamic knowledge resolution. No active Knowledge Pack was resolved for the persona's framework.",
    impact: "Degraded AI response quality — persona lacks domain-specific knowledge and provides generic responses.",
    recommendedAction: "Assign an active Knowledge Pack for the persona's framework.",
    relatedRegistries: ["Persona Registry™", "Knowledge Pack Registry™", "Framework Registry™"],
    autoRepairable: false,
  },
  BROKEN_CAPABILITY_CHAIN: {
    rootCause: "Capability chain is broken — a link in the capability → knowledge pack → framework → persona chain is missing.",
    impact: "AI cannot execute this capability with full knowledge resolution.",
    recommendedAction: "Resolve the broken link in the capability chain.",
    relatedRegistries: ["Capability Registry™", "Framework Registry™", "Persona Registry™"],
    autoRepairable: false,
  },
  MISSING_NAVIGATION: {
    rootCause: "Module has no navigation entry. The module exists in the registry but its navigation location was not specified.",
    impact: "Module is only accessible via direct URL, reducing discoverability for users and EXEC™.",
    recommendedAction: "Add a navigation entry for this module.",
    relatedRegistries: ["Navigation Registry™", "Module Registry™"],
    autoRepairable: true,
  },
  MISSING_EXEC_ENTRY: {
    rootCause: "Module has no EXEC™ Knowledge Index entry. The module was registered in the Module Registry but not added to the knowledge base.",
    impact: "EXEC™ is unaware of this module, reducing AI platform awareness and recommendation quality.",
    recommendedAction: "Create an EXEC™ Knowledge Index entry for this module.",
    relatedRegistries: ["EXEC™ Knowledge Index", "Module Registry™"],
    autoRepairable: true,
  },
  CONFIG_MISMATCH: {
    rootCause: "Configuration version mismatch between Platform State Manager™ and Platform Manifest™.",
    impact: "May cause unpredictable behavior and stale configuration values across the platform.",
    recommendedAction: "Synchronize configVersion in PLATFORM_METADATA to match CONFIG_VERSION.",
    relatedRegistries: ["Platform State Manager™", "Platform Manifest™"],
    autoRepairable: false,
  },
  DEPLOYMENT_CHECK_FAILED: {
    rootCause: "Deployment readiness check failed — a critical validation did not pass.",
    impact: "Platform is not safe to deploy in its current state.",
    recommendedAction: "Resolve the failing deployment check before attempting deployment.",
    relatedRegistries: ["Deployment Readiness Engine™"],
    autoRepairable: false,
  },
  SYNC_GAP: {
    rootCause: "Registry synchronization gap — module exists in one registry but is missing from another.",
    impact: "Cross-registry inconsistency may cause navigation failures and reduced AI awareness.",
    recommendedAction: "Run the Registry Synchronization Engine™ to resolve the gap.",
    relatedRegistries: ["Registry Synchronization Engine™", "Module Registry™"],
    autoRepairable: true,
  },
  KNOWLEDGE_ENGINE_OFFLINE: {
    rootCause: "Knowledge Resolution Engine™ is offline — no active Knowledge Packs are loaded.",
    impact: "All AI personas use fallback logic. EXEC™ cannot provide intelligent responses.",
    recommendedAction: "Activate at least one Knowledge Pack in the ELIM™ Management Center.",
    relatedRegistries: ["Knowledge Pack Registry™", "Knowledge Resolution Engine™"],
    autoRepairable: false,
  },
  PLATFORM_STATE_DEGRADED: {
    rootCause: "Platform State Manager™ health is below threshold. State computation may have failed or safe mode may be active.",
    impact: "All dashboards and widgets may display stale or default values.",
    recommendedAction: "Wait for auto-recovery (3s retry cycle) or check browser console for errors.",
    relatedRegistries: ["Platform State Manager™"],
    autoRepairable: false,
  },
};

function enrichFinding(stageId, code, message, level, context = {}) {
  const e = FINDING_ENRICHMENT[code] || {
    rootCause: "Unknown root cause — requires manual investigation.",
    impact: "May affect platform consistency and governance.",
    recommendedAction: "Review and resolve manually in the Platform Governance Center™.",
    relatedRegistries: [],
    autoRepairable: false,
  };
  return {
    id: `${stageId}:${code}:${JSON.stringify(context).slice(0, 80)}`,
    stageId, code, message, level,
    rootCause: e.rootCause,
    affectedModules: context.affectedModules || [],
    evidence: context.evidence || [message],
    impact: e.impact,
    recommendedAction: e.recommendedAction,
    autoRepairable: e.autoRepairable,
    relatedRegistryEntries: e.relatedRegistries,
    auditHistory: context.auditHistory || [],
  };
}

function buildStage(id, name, order, findings, summary, startTime) {
  const errors = findings.filter((f) => f.level === "error").length;
  const warnings = findings.filter((f) => f.level === "warning").length;
  const infos = findings.filter((f) => f.level === "info").length;
  const status = errors > 0 ? "fail" : warnings > 0 ? "warn" : "pass";
  const score = Math.max(0, Math.min(100, 100 - errors * 10 - warnings * 3 - infos * 1));
  return { id, name, order, status, score, findings, summary, duration: Date.now() - startTime };
}

// ============================================================
// STAGE 1 — Platform Manifest™ Validation
// ============================================================
function stage01() {
  const start = Date.now();
  const raw = validateManifest();
  const coverage = getManifestCoverage();
  const findings = raw.map((f) => enrichFinding("s01_manifest", f.code, f.message, f.level, {
    affectedModules: f.context?.moduleId ? [f.context.moduleId] : f.context?.route ? [f.context.route] : [],
    evidence: [f.message, `Context: ${JSON.stringify(f.context || {})}`],
  }));
  return buildStage("s01_manifest", "Platform Manifest™ Validation", 1, findings,
    `${raw.length} finding(s) · ${coverage.routeCoverage}% route coverage`, start);
}

// ============================================================
// STAGE 2 — Module Registry Validation
// ============================================================
function stage02() {
  const start = Date.now();
  const findings = [];
  MODULE_REGISTRY.forEach((m) => {
    if (!m.routeExists) findings.push(enrichFinding("s02_modules", "BROKEN_MODULE_ROUTE",
      `Module "${m.moduleName}" references non-existent route "${m.route}".`, "error",
      { affectedModules: [m.moduleId], evidence: [`Route: ${m.route}`, `Module: ${m.moduleName}`, `Category: ${m.category}`] }));
    if (!m.knowledgePack) findings.push(enrichFinding("s02_modules", "MODULE_MISSING_PACK",
      `Module "${m.moduleName}" has no Knowledge Pack.`, "info",
      { affectedModules: [m.moduleId], evidence: [`Module: ${m.moduleName}`, `Category: ${m.category}`] }));
    if (!m.aiPersona) findings.push(enrichFinding("s02_modules", "BROKEN_CAPABILITY_CHAIN",
      `Module "${m.moduleName}" has no AI persona assigned.`, "warning",
      { affectedModules: [m.moduleId], evidence: [`Module: ${m.moduleName}`] }));
  });
  return buildStage("s02_modules", "Module Registry Validation", 2, findings,
    `${MODULE_REGISTRY.length} modules · ${findings.length} finding(s)`, start);
}

// ============================================================
// STAGE 3 — Route Registry Validation
// ============================================================
function stage03() {
  const start = Date.now();
  const modulePaths = new Set(MODULE_REGISTRY.map((m) => m.route));
  const findings = [];
  ROUTE_REGISTRY.forEach((r) => {
    if (!r.public && !modulePaths.has(r.url) && !isExemptRoute(r.url)) {
      findings.push(enrichFinding("s03_routes", "UNINDEXED_ROUTE",
        `Route "${r.url}" (${r.name}) has no module entry.`, "warning",
        { affectedModules: [r.url], evidence: [`Route: ${r.url}`, `Component: ${r.component || "unknown"}`] }));
    }
  });
  return buildStage("s03_routes", "Route Registry Validation", 3, findings,
    `${ROUTE_REGISTRY.length} routes · ${findings.length} unindexed`, start);
}

// ============================================================
// STAGE 4 — Capability Registry Validation
// ============================================================
function stage04() {
  const start = Date.now();
  const chains = getCapabilityChain();
  const broken = chains.filter((c) => !c.complete);
  const findings = broken.map((c) => enrichFinding("s04_capabilities", "BROKEN_CAPABILITY_CHAIN",
    `Capability "${c.capability}" chain broken at: ${c.brokenAt}.`, "warning",
    { affectedModules: [c.capability], evidence: [`Capability: ${c.capability}`, `Broken at: ${c.brokenAt}`] }));
  return buildStage("s04_capabilities", "Capability Registry Validation", 4, findings,
    `${CAPABILITY_REGISTRY.length} capabilities · ${broken.length} broken chain(s)`, start);
}

// ============================================================
// STAGE 5 — Framework Registry Validation
// ============================================================
function stage05() {
  const start = Date.now();
  const findings = [];
  FRAMEWORK_REGISTRY.forEach((f) => {
    if (f.type === "intelligence" && !f.knowledgePack) findings.push(enrichFinding("s05_frameworks", "FRAMEWORK_MISSING_PACK",
      `Framework "${f.name}" has no Knowledge Pack.`, "warning",
      { affectedModules: [f.frameworkId], evidence: [`Framework: ${f.name}`, `Type: ${f.type}`] }));
    if (f.dependencies && !f.dependencies.every((d) => FRAMEWORK_REGISTRY.some((fw) => fw.frameworkId === d)))
      findings.push(enrichFinding("s05_frameworks", "BROKEN_CAPABILITY_CHAIN",
        `Framework "${f.name}" has broken dependencies.`, "error",
        { affectedModules: [f.frameworkId], evidence: [`Framework: ${f.name}`, `Dependencies: ${f.dependencies.join(", ")}`] }));
  });
  return buildStage("s05_frameworks", "Framework Registry Validation", 5, findings,
    `${FRAMEWORK_REGISTRY.length} frameworks · ${findings.length} finding(s)`, start);
}

// ============================================================
// STAGE 6 — Knowledge Pack Validation
// ============================================================
function stage06() {
  const start = Date.now();
  const findings = [];
  const activePacks = getActiveKnowledgePacks();
  const engineActive = isKnowledgePackEngineActive();
  if (!engineActive) findings.push(enrichFinding("s06_knowledge_packs", "KNOWLEDGE_ENGINE_OFFLINE",
    "Knowledge Resolution Engine™ is offline — no active Knowledge Packs.", "error",
    { evidence: [`Active packs: ${activePacks.length}`, `Engine active: ${engineActive}`] }));
  return buildStage("s06_knowledge_packs", "Knowledge Pack Validation", 6, findings,
    `${KNOWLEDGE_PACK_REGISTRY.length} packs · ${activePacks.length} active`, start);
}

// ============================================================
// STAGE 7 — Persona Registry Validation
// ============================================================
function stage07() {
  const start = Date.now();
  const audit = getPersonaAudit();
  const fallbacks = audit.filter((p) => p.fallback);
  const findings = fallbacks.map((p) => enrichFinding("s07_personas", "PERSONA_FALLBACK",
    `Persona "${p.name}" uses fallback logic.`, "warning",
    { affectedModules: [p.personaId || p.name], evidence: [`Persona: ${p.name}`, `Framework: ${p.frameworkId}`] }));
  return buildStage("s07_personas", "Persona Registry Validation", 7, findings,
    `${AI_PERSONA_REGISTRY.length} personas · ${fallbacks.length} fallback(s)`, start);
}

// ============================================================
// STAGE 8 — Workspace Registry Validation
// ============================================================
function stage08() {
  const start = Date.now();
  const findings = [];
  WORKSPACE_REGISTRY.forEach((w) => {
    if (w.moduleCount === 0) findings.push(enrichFinding("s08_workspaces", "EMPTY_WORKSPACE",
      `Workspace "${w.name}" has no registered modules.`, "warning",
      { affectedModules: [w.workspaceId], evidence: [`Workspace: ${w.name}`, `ID: ${w.workspaceId}`] }));
  });
  return buildStage("s08_workspaces", "Workspace Registry Validation", 8, findings,
    `${WORKSPACE_REGISTRY.length} workspaces · ${findings.length} empty`, start);
}

// ============================================================
// STAGE 9 — Navigation Registry Validation
// ============================================================
function stage09() {
  const start = Date.now();
  const findings = [];
  MODULE_REGISTRY.forEach((m) => {
    if (!m.navigationLocation) findings.push(enrichFinding("s09_navigation", "MISSING_NAVIGATION",
      `Module "${m.moduleName}" has no navigation entry.`, "info",
      { affectedModules: [m.moduleId], evidence: [`Module: ${m.moduleName}`, `Route: ${m.route}`] }));
  });
  return buildStage("s09_navigation", "Navigation Registry Validation", 9, findings,
    `${MODULE_REGISTRY.length} modules · ${findings.length} missing nav`, start);
}

// ============================================================
// STAGE 10 — EXEC™ Knowledge Index Validation
// ============================================================
function stage10() {
  const start = Date.now();
  const findings = [];
  const knowledgePaths = new Set(EXEC_KNOWLEDGE_INDEX.map((e) => e.path));
  MODULE_REGISTRY.forEach((m) => {
    if (!knowledgePaths.has(m.route)) findings.push(enrichFinding("s10_exec_index", "MISSING_EXEC_ENTRY",
      `Module "${m.moduleName}" has no EXEC™ Knowledge Index entry.`, "warning",
      { affectedModules: [m.moduleId], evidence: [`Module: ${m.moduleName}`, `Route: ${m.route}`] }));
  });
  return buildStage("s10_exec_index", "EXEC™ Knowledge Index Validation", 10, findings,
    `${EXEC_KNOWLEDGE_INDEX.length} entries · ${findings.length} missing`, start);
}

// ============================================================
// STAGE 11 — Platform State Refresh
// ============================================================
function stage11(guardianPending = 0) {
  const start = Date.now();
  const health = computePlatformHealth(guardianPending);
  const findings = [];
  if (health.overall < 85) findings.push(enrichFinding("s11_platform_state", "PLATFORM_STATE_DEGRADED",
    `Platform health is ${health.overall}/100 — below certification threshold.`, "warning",
    { evidence: [`Overall: ${health.overall}`, `Errors: ${health.errors}`, `Warnings: ${health.warnings}`] }));
  return buildStage("s11_platform_state", "Platform State Refresh", 11, findings,
    `Health: ${health.overall}/100 · ${health.errors} errors · ${health.warnings} warnings`, start);
}

// ============================================================
// STAGE 12 — Registry Synchronization
// ============================================================
function stage12() {
  const start = Date.now();
  const syncHealth = getSyncHealth();
  const coverage = getRegistryCoverage();
  const findings = [];
  if (syncHealth.brokenRegistrations > 0) {
    const unsynced = coverage.filter((r) => r.coverage < 100);
    unsynced.forEach((r) => findings.push(enrichFinding("s12_registry_sync", "SYNC_GAP",
      `Registry "${r.name}" has ${r.total - r.passed} unsynchronized entries.`, "warning",
      { affectedModules: [], evidence: [`Registry: ${r.name}`, `Coverage: ${r.coverage}%`, `Passed: ${r.passed}/${r.total}`] })));
  }
  return buildStage("s12_registry_sync", "Registry Synchronization", 12, findings,
    `${syncHealth.syncPercentage}% synced · ${syncHealth.brokenRegistrations} gaps`, start);
}

// ============================================================
// STAGE 13 — Configuration Validation
// ============================================================
function stage13() {
  const start = Date.now();
  const findings = [];
  const configMatch = PLATFORM_METADATA.configVersion === CONFIG_VERSION;
  if (!configMatch) findings.push(enrichFinding("s13_config", "CONFIG_MISMATCH",
    `Config version mismatch: PLATFORM_METADATA=${PLATFORM_METADATA.configVersion} vs CONFIG_VERSION=${CONFIG_VERSION}.`, "error",
    { evidence: [`PLATFORM_METADATA: ${PLATFORM_METADATA.configVersion}`, `CONFIG_VERSION: ${CONFIG_VERSION}`] }));
  return buildStage("s13_config", "Configuration Validation", 13, findings,
    `Config v${PLATFORM_METADATA.configVersion} · ${configMatch ? "Consistent" : "Mismatch"}`, start);
}

// ============================================================
// STAGE 14 — Deployment Validation
// ============================================================
function stage14() {
  const start = Date.now();
  const deployment = computeDeploymentReadiness();
  const findings = [];
  deployment.checks.filter((c) => c.status === "fail").forEach((c) => findings.push(
    enrichFinding("s14_deployment", "DEPLOYMENT_CHECK_FAILED",
      `Deployment check failed: ${c.label}.`, "error",
      { evidence: [`Check: ${c.label}`, `Status: ${c.status}`, c.summary?.detail || ""] })
  ));
  deployment.checks.filter((c) => c.status === "warn").forEach((c) => findings.push(
    enrichFinding("s14_deployment", "DEPLOYMENT_CHECK_FAILED",
      `Deployment warning: ${c.label}.`, "warning",
      { evidence: [`Check: ${c.label}`, `Status: ${c.status}`, c.summary?.detail || ""] })
  ));
  return buildStage("s14_deployment", "Deployment Validation", 14, findings,
    `${deployment.summary.passed}/${deployment.summary.total} passed · ${deployment.summary.healthScore}%`, start);
}

// ============================================================
// STAGE 15 — Self-Healing
// ============================================================
function stage15() {
  const start = Date.now();
  const analysis = analyzePlatform();
  const activeRepairs = getActiveRepairCount();
  const repairLog = getRepairLog();
  const findings = [];
  if (analysis.totalFindings > 0) analysis.findings.slice(0, 20).forEach((f) => findings.push(
    enrichFinding("s15_self_healing", f.code, f.message, f.level,
      { affectedModules: f.context?.moduleId ? [f.context.moduleId] : [], evidence: [f.message], auditHistory: repairLog.filter((r) => r.code === f.code).slice(0, 5) })
  ));
  return buildStage("s15_self_healing", "Self-Healing", 15, findings,
    `${analysis.totalFindings} findings · ${activeRepairs} active repairs · Health: ${analysis.healthScore}`, start);
}

// ============================================================
// STAGE 16 — Final Governance Certification
// ============================================================
function stage16(stages, startTime) {
  const allFindings = stages.flatMap((s) => s.findings);
  const errors = allFindings.filter((f) => f.level === "error");
  const warnings = allFindings.filter((f) => f.level === "warning");
  const repairable = allFindings.filter((f) => f.autoRepairable);

  const overallScore = Math.round(stages.reduce((sum, s) => sum + s.score, 0) / stages.length);
  const certified = errors.length === 0 && overallScore >= 85;
  const status = certified ? "pass" : errors.length > 0 ? "fail" : "warn";

  return {
    id: "s16_certification",
    name: "Final Governance Certification",
    order: 16,
    status,
    score: overallScore,
    findings: [],
    summary: certified
      ? `Platform Certified — ${overallScore}/100 governance score`
      : `Platform Requires Attention — ${errors.length} failure(s), ${warnings.length} warning(s)`,
    duration: Date.now() - startTime,
    certified,
    errorCount: errors.length,
    warningCount: warnings.length,
    repairableCount: repairable.length,
  };
}

// ============================================================
// ROUTE EXEMPTION HELPER (mirrors platformManifest logic)
// ============================================================
const EXEMPT_PATTERNS = [
  "/login", "/register", "/forgot-password", "/reset-password", "/onboarding",
  "/legal", "/about", "/contact", "/u/:username", "/home",
  "/compare-plans", "/notifications", "/profile", "/settings", "/feedback",
  "/connected-accounts", "/developer", "/portal/:quoteId", "/verify/:verificationId",
  "/founders", "/founders-wall", "/trust-center", "/company-library",
  "/", "/pricing", "/leaderboard", "/guardian",
];

function isExemptRoute(path) {
  return EXEMPT_PATTERNS.some((e) => {
    if (e === path) return true;
    const eParts = e.split("/");
    const pParts = path.split("/");
    if (eParts.length !== pParts.length) return false;
    return eParts.every((ep, i) => ep.startsWith(":") || ep === pParts[i]);
  });
}

// ============================================================
// MAIN — RUN THE FULL PIPELINE
// ============================================================

export function runGovernancePipeline(trigger = "manual", guardianPending = 0) {
  const startTime = Date.now();

  const stages = [
    stage01(),
    stage02(),
    stage03(),
    stage04(),
    stage05(),
    stage06(),
    stage07(),
    stage08(),
    stage09(),
    stage10(),
    stage11(guardianPending),
    stage12(),
    stage13(),
    stage14(),
    stage15(),
  ];

  // Stage 16 — Final Certification (aggregates all previous stages)
  const certification = stage16(stages, startTime);
  stages.push(certification);

  // ── HEALTH DIMENSIONS ──
  const manifestHealth = stages[0].score;
  const registryHealth = Math.round(
    [stages[1], stages[2], stages[3], stages[4], stages[7], stages[8]].reduce((s, st) => s + st.score, 0) / 6
  );
  const knowledgeHealth = Math.round(
    [stages[5], stages[6], stages[9]].reduce((s, st) => s + st.score, 0) / 3
  );
  const synchronizationHealth = stages[11].score;
  const deploymentReadiness = stages[13].score;
  const platformState = stages[10].score;
  const enterpriseReadiness = certification.score;

  // ── ALL FINDINGS (with drill-down data) ──
  const allFindings = stages.slice(0, 15).flatMap((s) => s.findings);
  const errors = allFindings.filter((f) => f.level === "error");
  const warnings = allFindings.filter((f) => f.level === "warning");
  const repairActions = allFindings.filter((f) => f.autoRepairable);

  const certificate = {
    certificateId: `GOV-${Date.now()}`,
    timestamp: new Date().toISOString(),
    trigger,
    certified: certification.certified,
    overallGovernanceScore: certification.score,
    manifestHealth,
    registryHealth,
    knowledgeHealth,
    synchronizationHealth,
    deploymentReadiness,
    platformState,
    enterpriseReadiness,
    warnings: warnings.length,
    failures: errors.length,
    repairActions: repairActions.length,
    stages,
    findings: allFindings,
    duration: Date.now() - startTime,
    pipelineVersion: PIPELINE_VERSION,
    platformVersion: PLATFORM_METADATA.platformVersion,
  };

  // Dispatch completion event (does NOT trigger the pipeline — not in PIPELINE_TRIGGERS)
  platformDispatch("GovernancePipelineCompleted", {
    source: "governance_pipeline",
    certificateId: certificate.certificateId,
    certified: certificate.certified,
  });

  return certificate;
}

// ============================================================
// PIPELINE STAGE METADATA (for display without running)
// ============================================================

export const PIPELINE_STAGES = [
  { id: "s01_manifest", name: "Platform Manifest™ Validation", order: 1 },
  { id: "s02_modules", name: "Module Registry Validation", order: 2 },
  { id: "s03_routes", name: "Route Registry Validation", order: 3 },
  { id: "s04_capabilities", name: "Capability Registry Validation", order: 4 },
  { id: "s05_frameworks", name: "Framework Registry Validation", order: 5 },
  { id: "s06_knowledge_packs", name: "Knowledge Pack Validation", order: 6 },
  { id: "s07_personas", name: "Persona Registry Validation", order: 7 },
  { id: "s08_workspaces", name: "Workspace Registry Validation", order: 8 },
  { id: "s09_navigation", name: "Navigation Registry Validation", order: 9 },
  { id: "s10_exec_index", name: "EXEC™ Knowledge Index Validation", order: 10 },
  { id: "s11_platform_state", name: "Platform State Refresh", order: 11 },
  { id: "s12_registry_sync", name: "Registry Synchronization", order: 12 },
  { id: "s13_config", name: "Configuration Validation", order: 13 },
  { id: "s14_deployment", name: "Deployment Validation", order: 14 },
  { id: "s15_self_healing", name: "Self-Healing", order: 15 },
  { id: "s16_certification", name: "Final Governance Certification", order: 16 },
];

// ============================================================
// CERTIFICATE SUMMARY (for quick display)
// ============================================================

export function getCertificateSummary(certificate) {
  if (!certificate) return null;
  return {
    certified: certificate.certified,
    overallScore: certificate.overallGovernanceScore,
    failures: certificate.failures,
    warnings: certificate.warnings,
    repairActions: certificate.repairActions,
    timestamp: certificate.timestamp,
    trigger: certificate.trigger,
    dimensions: [
      { label: "Manifest Health", score: certificate.manifestHealth, stageId: "s01_manifest" },
      { label: "Registry Health", score: certificate.registryHealth, stageId: "registry" },
      { label: "Knowledge Health", score: certificate.knowledgeHealth, stageId: "knowledge" },
      { label: "Synchronization Health", score: certificate.synchronizationHealth, stageId: "s12_registry_sync" },
      { label: "Deployment Readiness", score: certificate.deploymentReadiness, stageId: "s14_deployment" },
      { label: "Platform State", score: certificate.platformState, stageId: "s11_platform_state" },
      { label: "Enterprise Readiness", score: certificate.enterpriseReadiness, stageId: "s16_certification" },
    ],
  };
}
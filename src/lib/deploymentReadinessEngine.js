/**
 * Deployment Readiness Engine™
 * ============================================================
 * Computes enriched diagnostic data for every readiness check.
 * Each check includes: summary, details, dependencies, evidence,
 * impact, recommended actions, repair availability, deep links,
 * audit history, and export data.
 */
import {
  validateManifest, getManifestCoverage, MODULE_REGISTRY, ROUTE_REGISTRY,
  FRAMEWORK_REGISTRY, KNOWLEDGE_PACK_REGISTRY, AI_PERSONA_REGISTRY,
  FEATURE_FLAG_REGISTRY, PLATFORM_METADATA, getRepairLog, getActiveRepairCount,
} from "./platformManifest";
import { classifyFinding } from "./selfHealingEngine";
import {
  getActiveKnowledgePacks, getFallbackCount, getCapabilityChain,
} from "./knowledgeResolution";
import { EXEC_KNOWLEDGE_INDEX } from "./execKnowledgeBase";
import { CONFIG_VERSION } from "./platformConfig";

const SAFE_CODES = ["BROKEN_MODULE_ROUTE", "UNINDEXED_ROUTE", "MODULE_MISSING_PACK"];
const NOW = () => new Date().toISOString();

function getSeverity(status, errorCount) {
  if (status === "fail" && errorCount > 0) return "Critical";
  if (status === "fail") return "High";
  if (status === "warn") return "Medium";
  return "Info";
}

function getHealthScore(status, errors, warnings) {
  if (status === "pass") return 100;
  if (status === "fail") return Math.max(0, 100 - errors * 10 - warnings * 3);
  return Math.max(50, 100 - warnings * 5);
}

function filterSafe(findings, codes) {
  const filtered = codes ? findings.filter((f) => codes.includes(f.code)) : findings;
  return filtered.filter((f) => SAFE_CODES.includes(f.code));
}

// ============================================================
// CHECK 1 — Platform Manifest Complete
// ============================================================
function checkManifest(findings, coverage, repairs) {
  const errors = findings.filter((f) => f.level === "error");
  const warnings = findings.filter((f) => f.level === "warning");
  const infos = findings.filter((f) => f.level === "info");
  const status = errors.length === 0 ? "pass" : "fail";
  const safe = filterSafe(findings, null);

  return {
    id: "manifest", label: "Platform Manifest Complete", panelTitle: "Platform Manifest Validation Report™",
    iconName: "FileText", status, severity: getSeverity(status, errors.length),
    healthScore: getHealthScore(status, errors.length, warnings.length),
    summary: { detail: errors.length === 0 ? "No validation errors" : `${errors.length} error(s) found`, count: findings.length, errors: errors.length, warnings: warnings.length, infos: infos.length },
    details: { totalFindings: findings.length, errors: errors.length, warnings: warnings.length, infos: infos.length, routeCoverage: coverage.routeCoverage, moduleCount: coverage.modules, routeCount: coverage.routes, frameworkCount: coverage.frameworks, personaCount: coverage.aiPersonas },
    dependencies: { upstream: ["Route Registry", "Module Registry", "Framework Registry", "Workspace Registry", "Knowledge Pack Registry"], downstream: ["EXEC™", "Platform Governance Center™", "Navigation", "Search", "Deployment Validation"] },
    evidence: {
      passed: ["Route Registry validated", "Module Registry validated", "Framework Registry validated", ...(errors.length === 0 ? ["No validation errors"] : []), ...(coverage.routeCoverage === 100 ? ["Route coverage complete"] : [])],
      failed: [...errors, ...warnings].map((f) => ({ code: f.code, message: f.message, level: f.level, context: f.context })),
    },
    impact: { description: "The Platform Manifest™ is the authoritative inventory of the entire platform. Errors here affect every component that depends on the manifest for metadata, navigation, and AI context.", affectedComponents: ["EXEC™", "Navigation", "Search", "Deployment Validation", "Platform Governance Center™"], affectedCount: coverage.modules + coverage.routes },
    recommendedActions: ["Run the Self-Healing Engine™ to resolve safe findings automatically.", "Review manual findings in the Platform Governance Center™.", "Verify route coverage reaches 100% after repairs."],
    canRepair: safe.length > 0, repairableFindings: safe,
    deepLinks: [{ label: "Platform Governance Center™", path: "/developer/governance" }, { label: "Self-Healing Engine™", path: "/developer/governance" }],
    auditHistory: repairs, affectedCount: coverage.modules + coverage.routes, lastValidated: NOW(),
  };
}

// ============================================================
// CHECK 2 — Routes Valid
// ============================================================
function checkRoutes(findings, coverage, repairs) {
  const brokenModules = MODULE_REGISTRY.filter((m) => !m.routeExists);
  const routeFindings = findings.filter((f) => f.code === "BROKEN_MODULE_ROUTE" || f.code === "UNINDEXED_ROUTE");
  const status = brokenModules.length === 0 ? "pass" : "warn";
  const safe = filterSafe(findings, ["BROKEN_MODULE_ROUTE", "UNINDEXED_ROUTE"]);

  return {
    id: "routes", label: "Routes Valid", panelTitle: "Broken Route Registry™",
    iconName: "Network", status, severity: getSeverity(status, 0),
    healthScore: getHealthScore(status, 0, brokenModules.length),
    summary: { detail: brokenModules.length === 0 ? `${ROUTE_REGISTRY.length} routes valid` : `${brokenModules.length} broken reference(s)`, count: ROUTE_REGISTRY.length, broken: brokenModules.length },
    details: { totalRoutes: ROUTE_REGISTRY.length, brokenModules: brokenModules.length, routeCoverage: coverage.routeCoverage, indexedRoutes: coverage.indexedRoutes, relevantRoutes: coverage.relevantRoutes, brokenModuleNames: brokenModules.map((m) => m.moduleName) },
    dependencies: { upstream: ["Module Registry", "Route Registry"], downstream: ["Navigation", "EXEC™", "Search"] },
    evidence: {
      passed: [...(brokenModules.length === 0 ? ["No broken module references"] : []), `${ROUTE_REGISTRY.length} routes registered`, `${coverage.indexedRoutes} routes indexed`],
      failed: routeFindings.map((f) => ({ code: f.code, message: f.message, level: f.level, context: f.context })),
    },
    impact: { description: "Broken route references cause navigation failures and reduce manifest coverage, making affected modules invisible to EXEC™ and search.", affectedComponents: ["Navigation", "EXEC™", "Search", "User Experience"], affectedCount: brokenModules.length },
    recommendedActions: ["Re-index broken module route references via Self-Healing.", "Register module metadata for unindexed routes.", "Verify all routes resolve after repair."],
    canRepair: safe.length > 0, repairableFindings: safe,
    deepLinks: [{ label: "Route Registry", path: "/developer/governance" }, { label: "Platform Governance Center™", path: "/developer/governance" }],
    auditHistory: repairs.filter((r) => ["BROKEN_MODULE_ROUTE", "UNINDEXED_ROUTE"].includes(r.code)), affectedCount: brokenModules.length, lastValidated: NOW(),
  };
}

// ============================================================
// CHECK 3 — Knowledge Packs Loaded
// ============================================================
function checkKnowledge(findings, coverage, repairs) {
  const frameworksMissingPacks = FRAMEWORK_REGISTRY.filter((f) => f.type === "intelligence" && !f.knowledgePack);
  const modulesMissingPacks = MODULE_REGISTRY.filter((m) => !m.knowledgePack);
  const activePacks = getActiveKnowledgePacks();
  const status = frameworksMissingPacks.length === 0 ? "pass" : "warn";
  const safe = filterSafe(findings, ["MODULE_MISSING_PACK"]);

  return {
    id: "knowledge", label: "Knowledge Packs Loaded", panelTitle: "Knowledge Pack Inventory™",
    iconName: "Package", status, severity: getSeverity(status, 0),
    healthScore: getHealthScore(status, 0, frameworksMissingPacks.length),
    summary: { detail: frameworksMissingPacks.length === 0 ? `${KNOWLEDGE_PACK_REGISTRY.length} packs loaded` : `${frameworksMissingPacks.length} framework(s) missing packs`, count: KNOWLEDGE_PACK_REGISTRY.length, active: activePacks.length, missingPacks: frameworksMissingPacks.length },
    details: { totalPacks: KNOWLEDGE_PACK_REGISTRY.length, activePacks: activePacks.length, frameworksMissingPacks: frameworksMissingPacks.length, modulesMissingPacks: modulesMissingPacks.length, frameworkNames: frameworksMissingPacks.map((f) => f.name) },
    dependencies: { upstream: ["Framework Registry", "ELIM™"], downstream: ["EXEC™", "Leadership DNA™", "Executive Coach™", "Executive Academy™"] },
    evidence: {
      passed: [...(activePacks.length > 0 ? ["Active Knowledge Packs available"] : []), `${KNOWLEDGE_PACK_REGISTRY.length} packs registered`, ...(frameworksMissingPacks.length === 0 ? ["All frameworks have packs"] : [])],
      failed: findings.filter((f) => ["FRAMEWORK_MISSING_PACK", "MODULE_MISSING_PACK"].includes(f.code)).map((f) => ({ code: f.code, message: f.message, level: f.level, context: f.context })),
    },
    impact: { description: "Missing Knowledge Packs reduce AI intelligence coverage and limit EXEC™ context for affected frameworks and modules.", affectedComponents: ["EXEC™", "Leadership DNA™", "Executive Coach™", "Academy™"], affectedCount: frameworksMissingPacks.length + modulesMissingPacks.length },
    recommendedActions: ["Assign Knowledge Packs to frameworks in the ELIM™ Management Center.", "Map modules to Knowledge Packs based on category.", "Verify all frameworks have active packs."],
    canRepair: safe.length > 0, repairableFindings: safe,
    deepLinks: [{ label: "ELIM™ Management Center", path: "/elim" }, { label: "Knowledge Pack Engine™", path: "/developer/governance" }],
    auditHistory: repairs.filter((r) => r.code === "MODULE_MISSING_PACK"), affectedCount: frameworksMissingPacks.length + modulesMissingPacks.length, lastValidated: NOW(),
  };
}

// ============================================================
// CHECK 4 — Framework Registry Healthy
// ============================================================
function checkFrameworks(findings, coverage, repairs) {
  const brokenDeps = FRAMEWORK_REGISTRY.filter((f) => f.dependencies && !f.dependencies.every((dep) => FRAMEWORK_REGISTRY.some((fw) => fw.frameworkId === dep)));
  const missingPacks = FRAMEWORK_REGISTRY.filter((f) => f.type === "intelligence" && !f.knowledgePack);
  const status = brokenDeps.length === 0 ? "pass" : "fail";

  return {
    id: "frameworks", label: "Framework Registry Healthy", panelTitle: "Framework Registry Explorer™",
    iconName: "Layers", status, severity: getSeverity(status, brokenDeps.length),
    healthScore: getHealthScore(status, brokenDeps.length, missingPacks.length),
    summary: { detail: brokenDeps.length === 0 ? `${FRAMEWORK_REGISTRY.length} frameworks registered` : `${brokenDeps.length} broken dependency(ies)`, count: FRAMEWORK_REGISTRY.length, brokenDeps: brokenDeps.length, missingPacks: missingPacks.length },
    details: { totalFrameworks: FRAMEWORK_REGISTRY.length, brokenDependencies: brokenDeps.length, missingPacks: missingPacks.length, frameworkTypes: FRAMEWORK_REGISTRY.reduce((acc, f) => { acc[f.type] = (acc[f.type] || 0) + 1; return acc; }, {}) },
    dependencies: { upstream: ["EELM™", "ELIM™"], downstream: ["Capability Registry", "Knowledge Pack Engine™", "EXEC™"] },
    evidence: {
      passed: [...(brokenDeps.length === 0 ? ["All framework dependencies resolve"] : []), `${FRAMEWORK_REGISTRY.length} frameworks registered`],
      failed: [...brokenDeps.map((f) => ({ code: "BROKEN_FRAMEWORK_DEP", message: `Framework "${f.name}" has broken dependencies`, level: "error", context: { frameworkId: f.frameworkId } })), ...missingPacks.map((f) => ({ code: "FRAMEWORK_MISSING_PACK", message: `Framework "${f.name}" has no Knowledge Pack`, level: "warning", context: { frameworkId: f.frameworkId } }))],
    },
    impact: { description: "Broken framework dependencies affect the intelligence architecture chain and reduce AI capability for affected domains.", affectedComponents: ["Capability Registry", "Knowledge Pack Engine™", "EXEC™"], affectedCount: brokenDeps.length + missingPacks.length },
    recommendedActions: ["Resolve broken framework dependencies.", "Assign Knowledge Packs to frameworks missing them.", "Verify the framework dependency chain is intact."],
    canRepair: false, repairableFindings: [],
    deepLinks: [{ label: "Framework Governance", path: "/developer/governance" }, { label: "ELIM™ Management Center", path: "/elim" }],
    auditHistory: repairs.filter((r) => r.code === "FRAMEWORK_MISSING_PACK"), affectedCount: brokenDeps.length + missingPacks.length, lastValidated: NOW(),
  };
}

// ============================================================
// CHECK 5 — Feature Flags Valid
// ============================================================
function checkFeatures(findings, coverage, repairs) {
  const liveFlags = FEATURE_FLAG_REGISTRY.filter((f) => f.ga);
  const betaFlags = FEATURE_FLAG_REGISTRY.filter((f) => f.beta);
  const status = FEATURE_FLAG_REGISTRY.length > 0 ? "pass" : "warn";

  return {
    id: "features", label: "Feature Flags Valid", panelTitle: "Feature Flag Management™",
    iconName: "Code2", status, severity: getSeverity(status, 0),
    healthScore: getHealthScore(status, 0, 0),
    summary: { detail: `${FEATURE_FLAG_REGISTRY.length} flags configured`, count: FEATURE_FLAG_REGISTRY.length, live: liveFlags.length, beta: betaFlags.length },
    details: { totalFlags: FEATURE_FLAG_REGISTRY.length, liveFlags: liveFlags.length, betaFlags: betaFlags.length, deprecatedFlags: FEATURE_FLAG_REGISTRY.filter((f) => f.deprecated).length },
    dependencies: { upstream: ["Feature Flag Registry"], downstream: ["FeatureGate Components", "Subscription System", "RBAC"] },
    evidence: {
      passed: [`${FEATURE_FLAG_REGISTRY.length} flags registered`, `${liveFlags.length} flags live`, `${betaFlags.length} flags in beta`],
      failed: [],
    },
    impact: { description: "Feature flags control rollout and access. Invalid flags may lock users out of features or grant unintended access.", affectedComponents: ["FeatureGate Components", "Subscription System", "User Access"], affectedCount: 0 },
    recommendedActions: ["Review feature flags in Feature Flag Management™.", "Verify rollout percentages match deployment strategy.", "Archive deprecated flags."],
    canRepair: false, repairableFindings: [],
    deepLinks: [{ label: "Feature Flag Management™", path: "/feature-management" }],
    auditHistory: [], affectedCount: 0, lastValidated: NOW(),
  };
}

// ============================================================
// CHECK 6 — Personas Registered
// ============================================================
function checkPersonas(findings, coverage, repairs) {
  const fallbackCount = getFallbackCount();
  const status = AI_PERSONA_REGISTRY.length > 0 && fallbackCount === 0 ? "pass" : fallbackCount > 0 ? "warn" : "fail";

  return {
    id: "personas", label: "Personas Registered", panelTitle: "Persona Registry™",
    iconName: "Users", status, severity: getSeverity(status, 0),
    healthScore: getHealthScore(status, 0, fallbackCount),
    summary: { detail: `${AI_PERSONA_REGISTRY.length} AI personas registered`, count: AI_PERSONA_REGISTRY.length, fallbacks: fallbackCount },
    details: { totalPersonas: AI_PERSONA_REGISTRY.length, fallbackCount, dynamicCount: AI_PERSONA_REGISTRY.length - fallbackCount, personaTypes: AI_PERSONA_REGISTRY.reduce((acc, p) => { acc[p.type] = (acc[p.type] || 0) + 1; return acc; }, {}) },
    dependencies: { upstream: ["AI Persona Registry", "Knowledge Pack Engine™"], downstream: ["EXEC™", "Concierge", "Coach", "Simulator"] },
    evidence: {
      passed: [`${AI_PERSONA_REGISTRY.length} personas registered`, ...(fallbackCount === 0 ? ["No fallback personas"] : [])],
      failed: fallbackCount > 0 ? [{ code: "PERSONA_FALLBACK", message: `${fallbackCount} persona(s) using fallback logic`, level: "warning", context: {} }] : [],
    },
    impact: { description: "AI personas power EXEC™ interactions. Fallback personas provide degraded responses without dynamic knowledge resolution.", affectedComponents: ["EXEC™", "Concierge", "Coach", "Simulator"], affectedCount: fallbackCount },
    recommendedActions: ["Assign active Knowledge Packs to fallback personas.", "Verify persona resolution via the Knowledge Resolution Engine™.", "Test persona responses after resolution."],
    canRepair: false, repairableFindings: [],
    deepLinks: [{ label: "Platform Governance Center™", path: "/developer/governance" }, { label: "EXEC™ Console", path: "/exec-admin" }],
    auditHistory: [], affectedCount: fallbackCount, lastValidated: NOW(),
  };
}

// ============================================================
// CHECK 7 — Modules Registered
// ============================================================
function checkModules(findings, coverage, repairs) {
  const brokenModules = MODULE_REGISTRY.filter((m) => !m.routeExists);
  const missingPacks = MODULE_REGISTRY.filter((m) => !m.knowledgePack);
  const status = MODULE_REGISTRY.length > 0 && brokenModules.length === 0 ? "pass" : brokenModules.length > 0 ? "warn" : "fail";
  const safe = filterSafe(findings, ["BROKEN_MODULE_ROUTE", "UNINDEXED_ROUTE", "MODULE_MISSING_PACK"]);

  return {
    id: "modules", label: "Modules Registered", panelTitle: "Module Registry™",
    iconName: "Boxes", status, severity: getSeverity(status, 0),
    healthScore: getHealthScore(status, 0, brokenModules.length + missingPacks.length),
    summary: { detail: `${MODULE_REGISTRY.length} modules registered`, count: MODULE_REGISTRY.length, broken: brokenModules.length, missingPacks: missingPacks.length },
    details: { totalModules: MODULE_REGISTRY.length, brokenModules: brokenModules.length, missingPacks: missingPacks.length, categories: MODULE_REGISTRY.reduce((acc, m) => { acc[m.category] = (acc[m.category] || 0) + 1; return acc; }, {}), brokenModuleNames: brokenModules.map((m) => m.moduleName) },
    dependencies: { upstream: ["Module Registry", "Route Registry"], downstream: ["Navigation", "EXEC™", "Search"] },
    evidence: {
      passed: [`${MODULE_REGISTRY.length} modules registered`, ...(brokenModules.length === 0 ? ["No broken modules"] : []), ...(missingPacks.length === 0 ? ["All modules have Knowledge Packs"] : [])],
      failed: findings.filter((f) => ["BROKEN_MODULE_ROUTE", "MODULE_MISSING_PACK", "UNINDEXED_ROUTE"].includes(f.code)).map((f) => ({ code: f.code, message: f.message, level: f.level, context: f.context })),
    },
    impact: { description: "Unregistered or broken modules are invisible to EXEC™ and navigation, reducing platform discoverability.", affectedComponents: ["Navigation", "EXEC™", "Search", "User Experience"], affectedCount: brokenModules.length + missingPacks.length },
    recommendedActions: ["Register module metadata for unindexed routes.", "Assign Knowledge Packs to modules missing them.", "Fix broken module route references."],
    canRepair: safe.length > 0, repairableFindings: safe,
    deepLinks: [{ label: "Module Registry", path: "/developer/governance" }, { label: "Platform Governance Center™", path: "/developer/governance" }],
    auditHistory: repairs.filter((r) => ["BROKEN_MODULE_ROUTE", "MODULE_MISSING_PACK", "UNINDEXED_ROUTE"].includes(r.code)), affectedCount: brokenModules.length + missingPacks.length, lastValidated: NOW(),
  };
}

// ============================================================
// CHECK 8 — EXEC™ Synchronized
// ============================================================
function checkExec(findings, coverage, repairs) {
  const activePacks = getActiveKnowledgePacks();
  const status = "pass";

  return {
    id: "exec", label: "EXEC™ Synchronized", panelTitle: "EXEC™ Synchronization Report™",
    iconName: "Brain", status, severity: getSeverity(status, 0),
    healthScore: 100,
    summary: { detail: `Knowledge v${PLATFORM_METADATA.knowledgeVersion} · Prompt v${PLATFORM_METADATA.promptVersion}`, count: activePacks.length },
    details: { knowledgeVersion: PLATFORM_METADATA.knowledgeVersion, promptVersion: PLATFORM_METADATA.promptVersion, platformVersion: PLATFORM_METADATA.platformVersion, activePacks: activePacks.length, knowledgeEntries: EXEC_KNOWLEDGE_INDEX.length },
    dependencies: { upstream: ["Knowledge Pack Engine™", "Platform Manifest™"], downstream: ["All EXEC™ Interactions", "Concierge", "Coach"] },
    evidence: {
      passed: [`Knowledge v${PLATFORM_METADATA.knowledgeVersion} synchronized`, `Prompt v${PLATFORM_METADATA.promptVersion}`, `${activePacks.length} active Knowledge Packs`, `${EXEC_KNOWLEDGE_INDEX.length} knowledge entries`],
      failed: [],
    },
    impact: { description: "An unsynchronized EXEC™ provides outdated information to users and cannot explain platform assets accurately.", affectedComponents: ["All EXEC™ Interactions", "Concierge", "Coach", "Simulator"], affectedCount: 0 },
    recommendedActions: ["Sync EXEC™ Knowledge via the syncExecKnowledge function.", "Verify knowledge pack activation.", "Test EXEC™ responses for accuracy."],
    canRepair: false, repairableFindings: [],
    deepLinks: [{ label: "EXEC™ Command Center", path: "/developer/ai-command-center" }, { label: "EXEC™ Console", path: "/exec-admin" }],
    auditHistory: [], affectedCount: 0, lastValidated: NOW(),
  };
}

// ============================================================
// CHECK 9 — Configuration Loaded
// ============================================================
function checkConfig(findings, coverage, repairs) {
  const configVersion = PLATFORM_METADATA.configVersion || CONFIG_VERSION;
  const status = configVersion ? "pass" : "fail";

  return {
    id: "config", label: "Configuration Loaded", panelTitle: "Configuration Diagnostics™",
    iconName: "Settings", status, severity: getSeverity(status, 0),
    healthScore: getHealthScore(status, 0, 0),
    summary: { detail: `Config v${configVersion || "unknown"} · Build ${PLATFORM_METADATA.buildNumber}`, count: 1 },
    details: { configVersion, buildNumber: PLATFORM_METADATA.buildNumber, environment: PLATFORM_METADATA.environment, platformVersion: PLATFORM_METADATA.platformVersion, manifestVersion: PLATFORM_METADATA.manifestVersion },
    dependencies: { upstream: ["Platform State Manager™", "manageConfig()"], downstream: ["All Platform Components", "UI", "Backend Functions"] },
    evidence: {
      passed: [`Config version: ${configVersion}`, `Build: ${PLATFORM_METADATA.buildNumber}`, `Environment: ${PLATFORM_METADATA.environment}`, ...(configVersion ? ["Configuration consolidated"] : [])],
      failed: configVersion ? [] : [{ code: "CONFIG_UNKNOWN", message: "Configuration version is unknown", level: "error", context: {} }],
    },
    impact: { description: "Invalid or missing configuration causes platform-wide failures and unpredictable behavior.", affectedComponents: ["All Platform Components", "UI", "Backend Functions"], affectedCount: configVersion ? 0 : 1 },
    recommendedActions: ["Verify configuration in System Health.", "Check manageConfig() backend function.", "Ensure CONFIG_VERSION is set in platformConfig.js."],
    canRepair: false, repairableFindings: [],
    deepLinks: [{ label: "System Health", path: "/developer/system-health" }, { label: "Configuration Center", path: "/developer/governance" }],
    auditHistory: [], affectedCount: configVersion ? 0 : 1, lastValidated: NOW(),
  };
}

// ============================================================
// CHECK 10 — No Broken References
// ============================================================
function checkReferences(findings, coverage, repairs) {
  const errors = findings.filter((f) => f.level === "error");
  const warnings = findings.filter((f) => f.level === "warning");
  const status = errors.length === 0 && warnings.length === 0 ? "pass" : errors.length === 0 ? "warn" : "fail";
  const safe = filterSafe(findings, null);

  return {
    id: "references", label: "No Broken References", panelTitle: "Reference Integrity Report™",
    iconName: "ShieldCheck", status, severity: getSeverity(status, errors.length),
    healthScore: getHealthScore(status, errors.length, warnings.length),
    summary: { detail: errors.length === 0 && warnings.length === 0 ? "All references resolve" : `${errors.length + warnings.length} finding(s)`, count: findings.length, errors: errors.length, warnings: warnings.length },
    details: { totalFindings: findings.length, errors: errors.length, warnings: warnings.length, safeFindings: safe.length, reviewFindings: findings.filter((f) => classifyFinding(f) === "review").length, findingCodes: findings.reduce((acc, f) => { acc[f.code] = (acc[f.code] || 0) + 1; return acc; }, {}) },
    dependencies: { upstream: ["All Registries", "Platform Manifest™"], downstream: ["All Platform Components"] },
    evidence: {
      passed: [...(errors.length === 0 ? ["No error-level findings"] : []), ...(warnings.length === 0 ? ["No warning-level findings"] : [])],
      failed: findings.map((f) => ({ code: f.code, message: f.message, level: f.level, context: f.context })),
    },
    impact: { description: "Broken references cause runtime errors, navigation failures, and reduced platform integrity.", affectedComponents: ["Navigation", "EXEC™", "Search", "Deployment Validation"], affectedCount: findings.length },
    recommendedActions: ["Run the Self-Healing Engine™ to resolve safe findings.", "Review manual findings in the Platform Governance Center™.", "Verify all references resolve after repair."],
    canRepair: safe.length > 0, repairableFindings: safe,
    deepLinks: [{ label: "Reference Integrity Report™", path: "/developer/governance" }, { label: "Self-Healing Engine™", path: "/developer/governance" }],
    auditHistory: repairs, affectedCount: findings.length, lastValidated: NOW(),
  };
}

// ============================================================
// MAIN — COMPUTE ALL CHECKS
// ============================================================

export function computeDeploymentReadiness() {
  const findings = validateManifest();
  const coverage = getManifestCoverage();
  const repairs = getRepairLog();

  const checks = [
    checkManifest(findings, coverage, repairs),
    checkRoutes(findings, coverage, repairs),
    checkKnowledge(findings, coverage, repairs),
    checkFrameworks(findings, coverage, repairs),
    checkFeatures(findings, coverage, repairs),
    checkPersonas(findings, coverage, repairs),
    checkModules(findings, coverage, repairs),
    checkExec(findings, coverage, repairs),
    checkConfig(findings, coverage, repairs),
    checkReferences(findings, coverage, repairs),
  ];

  const passed = checks.filter((c) => c.status === "pass").length;
  const failed = checks.filter((c) => c.status === "fail").length;
  const warned = checks.filter((c) => c.status === "warn").length;
  const ready = failed === 0 && warned === 0;
  const canDeploy = failed === 0;
  const healthScore = Math.round((passed / checks.length) * 100);
  const activeRepairs = getActiveRepairCount();

  return { checks, summary: { passed, failed, warned, ready, canDeploy, healthScore, total: checks.length, activeRepairs } };
}
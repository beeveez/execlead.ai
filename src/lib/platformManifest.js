/**
 * EXECLEAD.AI — PLATFORM MANIFEST™
 * Version 1.0
 * ---------------------------------------------------
 * The canonical inventory of the entire EXECLEAD.AI platform.
 *
 * The platform describes itself. Instead of developers manually
 * teaching EXEC™ about every feature, the platform exposes a
 * structured manifest. EXEC™ synchronizes from this manifest.
 *
 * Architecture:
 *   EXEC™ → Platform Manifest™ → Knowledge Packs → Frameworks
 *         → Capabilities → Workspaces → Routes → Recommendations
 *
 * Every subsystem registers itself here. This is the single
 * source of truth for modules, routes, workspaces, frameworks,
 * knowledge packs, AI personas, capabilities, subscriptions,
 * and feature flags.
 */
import { ROUTE_REGISTRY, routeMatches } from "./routeRegistry";
import { WORKSPACES, WORKSPACE_HOME, getRouteWorkspace } from "./workspaces";
import { WORKSPACE_PERSONAS, PAGE_PERSONA_OVERRIDES } from "./execWorkspacePersonas";
import { MODULE_PERSONA_OVERRIDES } from "./execModulePersonas";
import { DEFAULT_FEATURES, FEATURE_REGISTRY, PLAN_TIERS, normalizeFeature, isFeatureLive } from "./featureCatalog";
import { PLANS, PLAN_LIST } from "./plans";
import { ELIM_FRAMEWORKS, KNOWLEDGE_PACKS, ELIM_VERSION } from "./elimFrameworks";
import { EELM_FRAMEWORKS, EELM_VERSION } from "./eelmMethodology";
import { EXEC_KNOWLEDGE_INDEX, EXEC_FRAMEWORK_HIERARCHY, EXEC_KNOWLEDGE_VERSION, EXEC_PROMPT_VERSION, EXEC_PLATFORM_VERSION } from "./execKnowledgeBase";

// ============================================================
// PLATFORM METADATA
// ============================================================
export const PLATFORM_METADATA = {
  platformName: "EXECLEAD.AI",
  platformVersion: EXEC_PLATFORM_VERSION,
  releaseVersion: "2.0",
  configVersion: null,
  knowledgeVersion: EXEC_KNOWLEDGE_VERSION,
  frameworkVersion: EELM_VERSION,
  promptVersion: EXEC_PROMPT_VERSION,
  manifestVersion: "1.0",
  buildNumber: "2026.07.11",
  releaseDate: "2026-07-11",
  environment: "production",
  philosophy: "One Leadership Journey. One AI Platform. One Platform Manifest™.",
};

// ============================================================
// MODULE REGISTRY
// Derived from EXEC_KNOWLEDGE_INDEX, enriched with workspace,
// permissions, knowledge pack, and AI persona metadata.
// ============================================================

// Map module categories to knowledge pack framework IDs
const CATEGORY_TO_FRAMEWORK = {
  "Insights": "eecf",
  "Career": "eri",
  "Platform": "ejf",
  "Enterprise": "eri",
  "Account": "erf",
  "Network": "erf",
  "Core": "ejf",
  "Administration": "ejf",
  "Developer": "ejf",
};

// Map module IDs to their primary AI persona
const MODULE_TO_PERSONA = {
  "dashboard": "executive",
  "journey": "journey_coach",
  "leadership-dna": "leadership_dna_coach",
  "reputation": "reputation_advisor",
  "developer": "developer",
  "guardian": "guardian_advisor",
  "enterprise": "enterprise",
  "settings": "executive",
  "billing": "billing",
  "elim": "developer",
  "methodology": "executive",
  "intelligence": "executive",
};

function deriveModulePersona(moduleId, category) {
  if (MODULE_TO_PERSONA[moduleId]) return MODULE_TO_PERSONA[moduleId];
  if (category === "Developer") return "developer";
  if (category === "Enterprise") return "enterprise";
  if (category === "Administration") return "platform";
  return "executive";
}

function deriveModuleKnowledgePack(category) {
  const frameworkId = CATEGORY_TO_FRAMEWORK[category];
  if (!frameworkId) return null;
  const pack = KNOWLEDGE_PACKS.find((p) => p.framework_id === frameworkId);
  return pack?.id || null;
}

export const MODULE_REGISTRY = EXEC_KNOWLEDGE_INDEX.map((m) => {
  const routeEntry = ROUTE_REGISTRY.find((r) => routeMatches(r.url, m.path));
  const workspaces = getRouteWorkspace(m.path) || ["executive"];
  const featureDef = routeEntry?.feature ? DEFAULT_FEATURES.find((f) => f.id === routeEntry.feature) : null;
  const subscriptionPlan = featureDef?.minimumPlan || "free";
  return {
    moduleId: m.id,
    moduleName: m.name,
    description: m.description,
    purpose: m.purpose,
    category: m.category,
    workspace: workspaces[0],
    workspaces,
    route: m.path,
    routeExists: !!routeEntry,
    navigationLocation: m.findIt,
    keyFeatures: m.keyFeatures,
    aiPersona: deriveModulePersona(m.id, m.category),
    knowledgePack: deriveModuleKnowledgePack(m.category),
    permissions: routeEntry?.permission || "authenticated",
    subscriptionRequirements: subscriptionPlan,
    featureFlag: routeEntry?.feature || null,
    status: routeEntry?.status || "live",
    version: "1.0",
    owner: routeEntry?.owner || m.category,
    dependencies: [],
  };
});

// ============================================================
// WORKSPACE REGISTRY
// ============================================================
export const WORKSPACE_REGISTRY = Object.values(WORKSPACES).map((ws) => {
  const persona = WORKSPACE_PERSONAS[ws.id];
  return {
    workspaceId: ws.id,
    name: ws.label,
    description: ws.description,
    purpose: persona?.expertise?.[0] || ws.description,
    icon: ws.icon,
    color: ws.color,
    landingPage: WORKSPACE_HOME[ws.id],
    aiPersona: persona?.tagline || ws.label,
    knowledgePacks: KNOWLEDGE_PACKS.map((p) => p.id),
    permissions: [],
    moduleCount: MODULE_REGISTRY.filter((m) => m.workspaces.includes(ws.id)).length,
  };
});

// ============================================================
// FRAMEWORK REGISTRY
// Merges EELM™ governing methodology, ELIM™ intelligence frameworks,
// and the EXEC™ framework hierarchy into one canonical list.
// ============================================================
export const FRAMEWORK_REGISTRY = [
  // Governing methodology
  {
    frameworkId: "eelm",
    name: "EELM™",
    fullName: "EXECLEAD Executive Leadership Methodology™",
    version: EELM_VERSION,
    type: "methodology",
    description: "The governing methodology that defines how EXECLEAD.AI evaluates, develops, validates, measures, and evolves executive leadership capability.",
    purpose: "Govern all AI recommendations, assessments, and executive insights.",
    dependencies: [],
    knowledgePack: null,
    relatedModules: ["methodology"],
    owner: "Platform",
  },
  // ELIM™ intelligence frameworks
  ...ELIM_FRAMEWORKS.map((f) => ({
    frameworkId: f.id,
    name: f.shortName,
    fullName: f.name,
    version: f.version,
    type: "intelligence",
    description: f.description,
    purpose: f.description,
    domain: f.domain,
    color: f.color,
    dependencies: f.id === "eecf" ? ["eelm"] : ["eelm", "eecf"],
    knowledgePack: KNOWLEDGE_PACKS.find((p) => p.framework_id === f.id)?.id || null,
    relatedModules: f.powers?.map((p) => p.toLowerCase().replace(/[™]/g, "")) || [],
    owner: "ELIM™",
    components: f.components,
  })),
  // Platform frameworks from the EXEC™ hierarchy
  ...EXEC_FRAMEWORK_HIERARCHY.filter((f) => !["eelm", "eecf", "leadership_dna"].includes(f.id)).map((f) => ({
    frameworkId: f.id,
    name: f.name,
    fullName: f.full,
    version: f.version,
    type: "platform",
    description: f.description,
    purpose: f.description,
    dependencies: ["eelm", "elim"],
    knowledgePack: null,
    relatedModules: [f.id],
    owner: "Platform",
  })),
];

// ============================================================
// KNOWLEDGE PACK REGISTRY
// ============================================================
export const KNOWLEDGE_PACK_REGISTRY = KNOWLEDGE_PACKS.map((p) => {
  const framework = FRAMEWORK_REGISTRY.find((f) => f.frameworkId === p.framework_id);
  return {
    packId: p.id,
    name: p.name,
    version: p.version,
    status: p.status,
    description: p.description,
    supportedFramework: p.framework_id,
    supportedFrameworkName: framework?.name || p.framework_id,
    supportedModules: MODULE_REGISTRY.filter((m) => m.knowledgePack === p.id).map((m) => m.moduleId),
    supportedPersonas: [],
    contents: p.contents || [],
    lastUpdated: PLATFORM_METADATA.releaseDate,
  };
});

// ============================================================
// AI PERSONA REGISTRY
// ============================================================
const ALL_PERSONAS = [
  // Base workspace personas
  ...Object.values(WORKSPACE_PERSONAS).map((p) => ({
    personaId: p.id,
    name: p.tagline,
    subtitle: p.subtitle,
    type: "workspace",
    workspace: p.id,
    color: p.color,
    purpose: p.expertise?.[0] || p.subtitle,
    capabilities: p.expertise || [],
    quickActions: p.quickActions?.filter((a) => !a.focusOnly).map((a) => a.label) || [],
    suggestedQuestions: p.suggestedQuestions || [],
    knowledgePacks: KNOWLEDGE_PACKS.map((p) => p.id),
  })),
  // Page-context persona overrides
  ...PAGE_PERSONA_OVERRIDES.map((p) => ({
    personaId: p.id,
    name: p.tagline,
    subtitle: p.subtitle,
    type: "page_override",
    workspace: null,
    color: p.color,
    purpose: p.expertise?.[0] || p.subtitle,
    capabilities: p.expertise || [],
    quickActions: p.quickActions?.filter((a) => !a.focusOnly).map((a) => a.label) || [],
    suggestedQuestions: p.suggestedQuestions || [],
    knowledgePacks: [],
  })),
  // Module persona overrides
  ...MODULE_PERSONA_OVERRIDES.map((p) => ({
    personaId: p.id,
    name: p.tagline,
    subtitle: p.subtitle,
    type: "module_override",
    workspace: null,
    color: p.color,
    purpose: p.expertise?.[0] || p.subtitle,
    capabilities: p.expertise || [],
    quickActions: p.quickActions?.filter((a) => !a.focusOnly).map((a) => a.label) || [],
    suggestedQuestions: p.suggestedQuestions || [],
    knowledgePacks: [],
  })),
];

export const AI_PERSONA_REGISTRY = ALL_PERSONAS;

// ============================================================
// CAPABILITY REGISTRY
// Defines what EXEC™ and the platform can do.
// ============================================================
export const CAPABILITY_REGISTRY = [
  { capabilityId: "can_explain_modules", name: "Can Explain Modules", status: "active", workspace: "all", knowledgePack: null, dependencies: [], aiPersona: "executive" },
  { capabilityId: "can_coach", name: "Can Coach", status: "active", workspace: "executive", knowledgePack: "kp_leadership_dna", dependencies: ["leadership_dna"], aiPersona: "executive" },
  { capabilityId: "can_navigate", name: "Can Navigate", status: "active", workspace: "all", knowledgePack: null, dependencies: [], aiPersona: "executive" },
  { capabilityId: "can_recommend_learning", name: "Can Recommend Learning", status: "active", workspace: "executive", knowledgePack: "kp_ejf", dependencies: ["ejf"], aiPersona: "executive" },
  { capabilityId: "can_predict_readiness", name: "Can Predict Readiness", status: "active", workspace: "executive", knowledgePack: "kp_eri", dependencies: ["eri"], aiPersona: "executive" },
  { capabilityId: "can_analyze_resume", name: "Can Analyze Resume", status: "active", workspace: "executive", knowledgePack: "kp_eri", dependencies: ["eri"], aiPersona: "executive" },
  { capabilityId: "can_analyze_leadership_dna", name: "Can Analyze Leadership DNA", status: "active", workspace: "executive", knowledgePack: "kp_leadership_dna", dependencies: ["leadership_dna"], aiPersona: "leadership_dna_coach" },
  { capabilityId: "can_generate_reports", name: "Can Generate Reports", status: "active", workspace: "enterprise", knowledgePack: "kp_eri", dependencies: ["eri"], aiPersona: "enterprise" },
  { capabilityId: "can_review_reputation", name: "Can Review Reputation", status: "active", workspace: "executive", knowledgePack: "kp_erf", dependencies: ["erf"], aiPersona: "reputation_advisor" },
  { capabilityId: "can_execute_diagnostics", name: "Can Execute Diagnostics", status: "active", workspace: "developer", knowledgePack: null, dependencies: [], aiPersona: "developer" },
  { capabilityId: "can_review_billing", name: "Can Review Billing", status: "active", workspace: "all", knowledgePack: null, dependencies: [], aiPersona: "billing" },
  { capabilityId: "can_manage_organizations", name: "Can Manage Organizations", status: "active", workspace: "enterprise", knowledgePack: null, dependencies: [], aiPersona: "enterprise" },
  { capabilityId: "can_execute_actions", name: "Can Execute Actions", status: "future", workspace: "all", knowledgePack: null, dependencies: [], aiPersona: "executive" },
  { capabilityId: "can_create_workflows", name: "Can Create Workflows", status: "future", workspace: "all", knowledgePack: null, dependencies: [], aiPersona: "executive" },
  { capabilityId: "can_automate_tasks", name: "Can Automate Tasks", status: "future", workspace: "all", knowledgePack: null, dependencies: [], aiPersona: "executive" },
];

// ============================================================
// SUBSCRIPTION REGISTRY
// ============================================================
export const SUBSCRIPTION_REGISTRY = PLAN_LIST.map((plan) => ({
  planId: plan.id,
  name: plan.name,
  price: plan.price,
  tier: PLAN_TIERS[plan.id] ?? 0,
  entitlements: [],
  workspaces: plan.id === "enterprise" ? ["executive", "enterprise"] : ["executive"],
  capabilities: CAPABILITY_REGISTRY.filter((c) => c.status === "active").map((c) => c.capabilityId),
  modules: MODULE_REGISTRY.filter((m) => {
    const featureDef = m.featureFlag ? DEFAULT_FEATURES.find((f) => f.id === m.featureFlag) : null;
    const minPlan = featureDef?.minimumPlan || "free";
    return (PLAN_TIERS[minPlan] ?? 0) <= (PLAN_TIERS[plan.id] ?? 0);
  }).map((m) => m.moduleId),
  knowledgePacks: KNOWLEDGE_PACKS.map((p) => p.id),
}));

// ============================================================
// FEATURE FLAG REGISTRY
// ============================================================
export const FEATURE_FLAG_REGISTRY = DEFAULT_FEATURES.map((f) => {
  const norm = normalizeFeature(f);
  const reg = FEATURE_REGISTRY[f.id] || {};
  return {
    featureId: f.id,
    name: f.name,
    description: f.description,
    category: f.category,
    status: norm.status,
    environment: norm.status === "live" ? "production" : norm.status,
    dependencies: [],
    workspace: reg.module === "Enterprise" ? "enterprise" : "executive",
    rolloutPct: norm.status === "live" ? 100 : 0,
    beta: norm.status === "beta",
    ga: norm.status === "live",
    deprecated: norm.status === "deprecated",
    minimumPlan: f.minimumPlan,
    isEnabled: f.isEnabled,
    routePath: norm.routePath,
  };
});

// ============================================================
// ROUTE REGISTRY — re-export for manifest completeness
// ============================================================
export { ROUTE_REGISTRY, routeMatches };

// ============================================================
// MANIFEST ASSEMBLY
// ============================================================
export const PLATFORM_MANIFEST = {
  metadata: PLATFORM_METADATA,
  modules: MODULE_REGISTRY,
  routes: ROUTE_REGISTRY,
  workspaces: WORKSPACE_REGISTRY,
  frameworks: FRAMEWORK_REGISTRY,
  knowledgePacks: KNOWLEDGE_PACK_REGISTRY,
  aiPersonas: AI_PERSONA_REGISTRY,
  capabilities: CAPABILITY_REGISTRY,
  subscriptions: SUBSCRIPTION_REGISTRY,
  featureFlags: FEATURE_FLAG_REGISTRY,
};

// ============================================================
// VALIDATION & COVERAGE UTILITIES
// ============================================================

// Routes exempt from requiring a module entry (auth, utility, public, etc.)
const EXEMPT_ROUTE_PATTERNS = [
  "/login", "/register", "/forgot-password", "/reset-password", "/onboarding",
  "/legal", "/about", "/contact", "/u/:username", "/home", "/metrics",
  "/compare-plans", "/notifications", "/profile", "/settings", "/feedback",
  "/connected-accounts", "/developer", "/developer/audit-logs", "/developer/system-health",
  "/developer/api-keys", "/developer/database", "/developer/migrations", "/developer/deployments",
  "/developer/organizations", "/developer/diagnostics", "/developer/ai-command-center",
  "/developer/product", "/portal/:quoteId", "/verify/:verificationId",
  "/founders", "/founders-wall", "/trust-center", "/company-library", "/company-library/:id",
  "/", "/pricing", "/leaderboard", "/guardian",
];

function isRouteExempt(path) {
  return EXEMPT_ROUTE_PATTERNS.some((e) => routeMatches(e, path));
}

/**
 * Validate the manifest for completeness and consistency.
 * Returns warnings for anything missing or broken.
 */
export function validateManifest() {
  const warnings = [];
  const modulePaths = new Set(MODULE_REGISTRY.map((m) => m.route));

  // 1. Broken module references — modules pointing to non-existent routes
  const brokenModules = MODULE_REGISTRY.filter((m) => !m.routeExists);
  brokenModules.forEach((m) => {
    warnings.push({
      level: "error",
      code: "BROKEN_MODULE_ROUTE",
      message: `Module "${m.moduleName}" references route "${m.route}" which does not exist in the Route Registry.`,
      context: { moduleId: m.moduleId, route: m.route },
    });
  });

  // 2. Unindexed routes — routes without a module entry (and not exempt)
  const unindexedRoutes = ROUTE_REGISTRY.filter(
    (r) => !isRouteExempt(r.url) && !modulePaths.has(r.url) && !r.public
  );
  unindexedRoutes.forEach((r) => {
    warnings.push({
      level: "warning",
      code: "UNINDEXED_ROUTE",
      message: `Route "${r.url}" (${r.name}) has no module entry in the Module Registry.`,
      context: { route: r.url, componentName: r.component },
    });
  });

  // 3. Frameworks without knowledge packs
  const frameworksPacks = FRAMEWORK_REGISTRY.filter(
    (f) => f.type === "intelligence" && !f.knowledgePack
  );
  frameworksPacks.forEach((f) => {
    warnings.push({
      level: "warning",
      code: "FRAMEWORK_MISSING_PACK",
      message: `Framework "${f.name}" has no associated Knowledge Pack.`,
      context: { frameworkId: f.frameworkId },
    });
  });

  // 4. Workspaces with no modules
  const emptyWorkspaces = WORKSPACE_REGISTRY.filter((w) => w.moduleCount === 0);
  emptyWorkspaces.forEach((w) => {
    warnings.push({
      level: "warning",
      code: "EMPTY_WORKSPACE",
      message: `Workspace "${w.name}" has no registered modules.`,
      context: { workspaceId: w.workspaceId },
    });
  });

  // 5. Modules without a knowledge pack
  const modulesPacks = MODULE_REGISTRY.filter((m) => !m.knowledgePack);
  modulesPacks.forEach((m) => {
    warnings.push({
      level: "info",
      code: "MODULE_MISSING_PACK",
      message: `Module "${m.moduleName}" has no associated Knowledge Pack.`,
      context: { moduleId: m.moduleId },
    });
  });

  return warnings;
}

/**
 * Compute coverage metrics for the manifest.
 */
export function getManifestCoverage() {
  const modulePaths = new Set(MODULE_REGISTRY.map((m) => m.route));
  const relevantRoutes = ROUTE_REGISTRY.filter((r) => !isRouteExempt(r.url) && !r.public);
  const indexedRoutes = relevantRoutes.filter((r) => modulePaths.has(r.url));

  const routeCoverage = relevantRoutes.length > 0
    ? Math.round((indexedRoutes.length / relevantRoutes.length) * 100)
    : 100;

  const activeCapabilities = CAPABILITY_REGISTRY.filter((c) => c.status === "active").length;
  const futureCapabilities = CAPABILITY_REGISTRY.filter((c) => c.status === "future").length;

  const liveFeatures = FEATURE_FLAG_REGISTRY.filter((f) => f.ga).length;
  const betaFeatures = FEATURE_FLAG_REGISTRY.filter((f) => f.beta).length;

  return {
    modules: MODULE_REGISTRY.length,
    routes: ROUTE_REGISTRY.length,
    indexedRoutes: indexedRoutes.length,
    relevantRoutes: relevantRoutes.length,
    routeCoverage,
    workspaces: WORKSPACE_REGISTRY.length,
    frameworks: FRAMEWORK_REGISTRY.length,
    knowledgePacks: KNOWLEDGE_PACK_REGISTRY.length,
    aiPersonas: AI_PERSONA_REGISTRY.length,
    capabilities: CAPABILITY_REGISTRY.length,
    activeCapabilities,
    futureCapabilities,
    subscriptions: SUBSCRIPTION_REGISTRY.length,
    featureFlags: FEATURE_FLAG_REGISTRY.length,
    liveFeatures,
    betaFeatures,
  };
}

/**
 * Build a compact summary for EXEC™ prompt injection.
 */
export function buildManifestSummary() {
  const coverage = getManifestCoverage();
  return [
    `PLATFORM: ${PLATFORM_METADATA.platformName} v${PLATFORM_METADATA.platformVersion}`,
    `MANIFEST: v${PLATFORM_METADATA.manifestVersion} | BUILD: ${PLATFORM_METADATA.buildNumber}`,
    `MODULES: ${coverage.modules} | ROUTES: ${coverage.routes} (${coverage.routeCoverage}% coverage)`,
    `WORKSPACES: ${coverage.workspaces} | FRAMEWORKS: ${coverage.frameworks}`,
    `KNOWLEDGE PACKS: ${coverage.knowledgePacks} | AI PERSONAS: ${coverage.aiPersonas}`,
    `CAPABILITIES: ${coverage.activeCapabilities} active, ${coverage.futureCapabilities} future`,
    `SUBSCRIPTIONS: ${coverage.subscriptions} | FEATURE FLAGS: ${coverage.featureFlags}`,
  ].join("\n");
}
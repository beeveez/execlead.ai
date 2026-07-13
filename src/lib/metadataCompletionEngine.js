/**
 * Platform Metadata Completion Engine™
 * ============================================================
 * Sprint 1.2 — The single authoritative source of truth for
 * platform metadata coverage, traceability, and governance.
 *
 * Computes coverage across every registry:
 *   • Route Registry™
 *   • Module Registry™
 *   • Capability Registry™
 *   • Framework Registry™
 *   • Persona Registry™
 *   • Knowledge Entry Registry™
 *   • Platform Manifest™
 *
 * All governance dashboards consume this engine — no independent
 * coverage calculations are permitted.
 */
import { ROUTE_REGISTRY, routeMatches } from "./routeRegistry";
import {
  MODULE_REGISTRY, CAPABILITY_REGISTRY, FRAMEWORK_REGISTRY,
  KNOWLEDGE_PACK_REGISTRY, AI_PERSONA_REGISTRY, WORKSPACE_REGISTRY,
  SUBSCRIPTION_REGISTRY, FEATURE_FLAG_REGISTRY, PLATFORM_METADATA,
  validateManifest,
} from "./platformManifest";
import { EXEC_KNOWLEDGE_INDEX } from "./execKnowledgeBase";
import { KNOWLEDGE_PACKS } from "./elimFrameworks";
import { CONFIG_VERSION } from "./platformConfig";
import { getRouteWorkspace } from "./workspaces";
import { getActiveKnowledgePacks } from "./knowledgeResolution";

// ============================================================
// PHASE 1 — ROUTE METADATA COVERAGE
// ============================================================
// Each route must have: module, workspace, capability, knowledge pack,
// framework, AI persona, permissions, subscription tier, feature flag,
// navigation group, search keywords, description, evidence sources, EXEC™ summary.

const ROUTE_REQUIRED_FIELDS = [
  "name", "module", "workspace", "capability", "knowledgePack",
  "framework", "aiPersona", "permissions", "subscriptionTier", "description",
];

function computeRouteCoverage() {
  const modulePaths = new Set(MODULE_REGISTRY.map((m) => m.route));
  // Only evaluate non-exempt, non-public routes — exempt routes (auth, utility, public)
  // are not required to have full metadata and should not drag down coverage scores.
  const evaluableRoutes = ROUTE_REGISTRY.filter((r) => !isKnowledgeExempt(r.url) && !r.public);
  const detailed = evaluableRoutes.map((route) => {
    const module = MODULE_REGISTRY.find((m) => m.route === route.url);
    const workspace = getRouteWorkspace(route.url);
    const capability = module?.knowledgePack
      ? CAPABILITY_REGISTRY.find((c) => c.knowledgePack === module.knowledgePack)
      : null;
    const knowledgePack = module?.knowledgePack
      ? KNOWLEDGE_PACKS.find((p) => p.id === module.knowledgePack)
      : null;
    const framework = knowledgePack
      ? FRAMEWORK_REGISTRY.find((f) => f.frameworkId === knowledgePack.framework_id)
      : null;
    const aiPersona = module?.aiPersona || null;
    const navGroup = route.navRefs?.[0]?.group || null;
    const knowledgeEntry = EXEC_KNOWLEDGE_INDEX.find((e) => e.path === route.url);

    const metadata = {
      name: route.name,
      module: module?.moduleName || null,
      workspace: workspace?.[0] || null,
      capability: capability?.name || null,
      knowledgePack: knowledgePack?.name || null,
      framework: framework?.name || null,
      aiPersona: aiPersona || null,
      permissions: route.permission || null,
      subscriptionTier: route.plan || null,
      featureFlag: route.feature || null,
      navigationGroup: navGroup,
      searchKeywords: knowledgeEntry?.aliases?.join(", ") || null,
      description: knowledgeEntry?.description || null,
      evidenceSources: capability?.evidenceSource || null,
      execSummary: knowledgeEntry ? `${knowledgeEntry.name}: ${knowledgeEntry.description?.substring(0, 80)}...` : null,
    };

    const missingFields = ROUTE_REQUIRED_FIELDS.filter((f) => !metadata[f]);
    return {
      route: route.url,
      name: route.name,
      metadata,
      missingFields,
      complete: missingFields.length === 0,
    };
  });

  const complete = detailed.filter((r) => r.complete).length;
  const total = detailed.length;
  const pct = total > 0 ? Math.round((complete / total) * 100) : 100;
  const missingEntries = detailed.flatMap((r) => r.missingFields.map((f) => ({ route: r.route, field: f })));

  return { complete, total, pct, missingEntries, detailed };
}

// ============================================================
// PHASE 2 — MODULE METADATA COVERAGE
// ============================================================

const MODULE_REQUIRED_FIELDS = [
  "moduleName", "description", "workspace", "ownerFramework",
  "knowledgePack", "primaryPersona",
  "navigationLocation", "manifestRegistration", "platformStateRegistration",
];

function computeModuleCoverage() {
  const detailed = MODULE_REGISTRY.map((mod) => {
    const framework = mod.knowledgePack
      ? KNOWLEDGE_PACKS.find((p) => p.id === mod.knowledgePack)?.framework_id
      : null;
    const relatedModules = MODULE_REGISTRY.filter(
      (m) => m.workspace === mod.workspace && m.moduleId !== mod.moduleId
    ).map((m) => m.moduleName);
    const requiredCapabilities = CAPABILITY_REGISTRY.filter(
      (c) => c.knowledgePack === mod.knowledgePack
    ).map((c) => c.name);

    const metadata = {
      moduleName: mod.moduleName,
      description: mod.description,
      workspace: mod.workspace,
      ownerFramework: framework || null,
      knowledgePack: mod.knowledgePack,
      primaryPersona: mod.aiPersona,
      dependencies: mod.dependencies || [],
      requiredCapabilities,
      relatedModules,
      navigationLocation: mod.navigationLocation,
      manifestRegistration: true,
      platformStateRegistration: true,
    };

    const missingFields = MODULE_REQUIRED_FIELDS.filter((f) => !metadata[f] || (Array.isArray(metadata[f]) && metadata[f].length === 0));
    return {
      moduleId: mod.moduleId,
      moduleName: mod.moduleName,
      metadata,
      missingFields,
      complete: missingFields.length === 0,
    };
  });

  const complete = detailed.filter((m) => m.complete).length;
  const total = detailed.length;
  const pct = total > 0 ? Math.round((complete / total) * 100) : 100;
  const missingEntries = detailed.flatMap((m) => m.missingFields.map((f) => ({ module: m.moduleName, field: f })));

  return { complete, total, pct, missingEntries, detailed };
}

// ============================================================
// PHASE 3 — CAPABILITY METADATA COVERAGE
// ============================================================
// Capability → Knowledge Pack → Framework → Workspace → Module → Persona → Evidence → EXEC™

function computeCapabilityCoverage() {
  const detailed = CAPABILITY_REGISTRY.map((cap) => {
    const pack = KNOWLEDGE_PACKS.find((p) => p.id === cap.knowledgePack);
    const framework = FRAMEWORK_REGISTRY.find(
      (f) => f.frameworkId === (cap.framework || pack?.framework_id)
    );
    const workspace = WORKSPACE_REGISTRY.find((w) => w.workspaceId === cap.workspace);
    const module = MODULE_REGISTRY.find((m) => m.knowledgePack === cap.knowledgePack);
    const persona = AI_PERSONA_REGISTRY.find((p) => p.personaId === cap.aiPersona);

    const chain = {
      capability: cap.name,
      knowledgePack: pack?.name || null,
      framework: framework?.name || null,
      workspace: workspace?.name || cap.workspace,
      module: module?.moduleName || null,
      persona: persona?.name || cap.aiPersona || null,
      evidence: cap.evidenceSource || null,
      exec: true,
    };

    const brokenAt = !chain.knowledgePack ? "Knowledge Pack"
      : !chain.framework ? "Framework"
      : !chain.evidence ? "Evidence"
      : !chain.persona ? "Persona"
      : null;

    return {
      capabilityId: cap.capabilityId,
      capabilityName: cap.name,
      chain,
      brokenAt,
      complete: !brokenAt,
    };
  });

  const complete = detailed.filter((c) => c.complete).length;
  const total = detailed.length;
  const pct = total > 0 ? Math.round((complete / total) * 100) : 100;
  const brokenChains = detailed.filter((c) => !c.complete);

  return { complete, total, pct, brokenChains, detailed };
}

// ============================================================
// PHASE 4 — FRAMEWORK METADATA COVERAGE
// ============================================================

const FRAMEWORK_BASE_FIELDS = [
  "purpose", "executiveOutcomes", "manifestRegistration",
];

const FRAMEWORK_INTELLIGENCE_FIELDS = [
  ...FRAMEWORK_BASE_FIELDS,
  "dependencies", "knowledgePack", "capabilities",
  "evidence", "aiPersonas",
];

function computeFrameworkCoverage() {
  const detailed = FRAMEWORK_REGISTRY.map((fw) => {
    const packs = KNOWLEDGE_PACKS.filter((p) => p.framework_id === fw.frameworkId);
    const capabilities = CAPABILITY_REGISTRY.filter(
      (c) => c.framework === fw.frameworkId || (c.knowledgePack && packs.some((p) => p.id === c.knowledgePack))
    );
    const modules = MODULE_REGISTRY.filter((m) =>
      packs.some((p) => p.id === m.knowledgePack)
    );
    const personas = AI_PERSONA_REGISTRY.filter(
      (p) => capabilities.some((c) => c.aiPersona === p.personaId)
    );
    const evidence = [...new Set(capabilities.map((c) => c.evidenceSource).filter(Boolean))];
    const relatedFrameworks = FRAMEWORK_REGISTRY.filter(
      (f) => f.frameworkId !== fw.frameworkId && f.dependencies?.includes(fw.frameworkId)
    );

    const metadata = {
      purpose: fw.description || fw.purpose,
      dependencies: fw.dependencies || [],
      knowledgePack: packs[0]?.name || fw.knowledgePack || null,
      capabilities: capabilities.map((c) => c.name),
      modules: modules.map((m) => m.moduleName),
      evidence,
      executiveOutcomes: fw.powers || fw.description,
      aiPersonas: personas.map((p) => p.name),
      relatedFrameworks: relatedFrameworks.map((f) => f.name),
      manifestRegistration: true,
    };

    // Intelligence frameworks require full chain; methodology/platform frameworks only need base fields
    const requiredFields = fw.type === "intelligence" ? FRAMEWORK_INTELLIGENCE_FIELDS : FRAMEWORK_BASE_FIELDS;
    const missingFields = requiredFields.filter((f) => !metadata[f] || (Array.isArray(metadata[f]) && metadata[f].length === 0));
    return {
      frameworkId: fw.frameworkId,
      frameworkName: fw.name,
      metadata,
      missingFields,
      complete: missingFields.length === 0,
    };
  });

  const complete = detailed.filter((f) => f.complete).length;
  const total = detailed.length;
  const pct = total > 0 ? Math.round((complete / total) * 100) : 100;
  const missingLinks = detailed.filter((f) => !f.knowledgePack && f.type === "intelligence");

  return { complete, total, pct, missingLinks, detailed };
}

// ============================================================
// PHASE 5 — KNOWLEDGE ENTRY COVERAGE
// ============================================================
// Every non-exempt route must have an EXEC™ Knowledge Index entry.

const KNOWLEDGE_EXEMPT_PATTERNS = [
  "/login", "/register", "/forgot-password", "/reset-password", "/onboarding",
  "/legal", "/about", "/contact", "/u/:username", "/home",
  "/compare-plans", "/notifications", "/profile", "/settings", "/feedback",
  "/connected-accounts", "/developer", "/portal/:quoteId", "/verify/:verificationId",
  "/founders", "/founders-wall", "/trust-center", "/company-library", "/company-library/:id",
  "/", "/pricing", "/leaderboard", "/guardian",
  // Dynamic sub-routes covered by their parent module's knowledge entry
  "/academy/:courseSlug", "/academy/:courseSlug/:lessonId",
  "/companies/:id", "/companies/compare",
  "/intelligence/competencies",
  "/legacy-library/:id", "/legacy-library/new", "/legacy-library/admin",
  "/legacy-library/:id/review", "/legacy-library/:id/edit",
  "/cpq/quotes", "/cpq/quote/:id",
  "/network/events/:id", "/network/c/:communityId",
  "/founder/benefits", "/founder/community", "/founder/events", "/founder/roadmap",
  "/founder/referrals", "/founder/rewards", "/founder/certificates", "/founder/timeline",
  "/founder/settings", "/founder/time-capsule",
  "/developer/audit-logs", "/developer/system-health", "/developer/api-keys",
  "/developer/database", "/developer/migrations", "/developer/deployments",
  "/developer/organizations", "/developer/diagnostics", "/developer/ai-command-center",
  "/developer/product", "/developer/governance",
  "/developer/cognitive", "/developer/cognitive/memory", "/developer/cognitive/personalization",
  "/developer/experience-audit", "/developer/stability", "/developer/launch-readiness",
  "/developer/scalability", "/developer/performance-resilience",
  "/identity-verification-admin", "/beta-launch", "/executive-legacy",
  "/organization/billing", "/brand-center", "/executive/rankings", "/identity-transfer",
  "/reputation", "/exec-admin", "/founding-member-admin", "/membership-admin",
  "/referrals", "/wallet", "/referral-admin", "/methodology", "/elim",
  "/enterprise-intelligence", "/journey", "/executive-readiness", "/executive-passport",
  "/sso", "/ai-command-center",
  "/company-admin", "/company-reports-admin", "/request-tracking", "/email-settings",
  "/organization/users", "/payment-settings", "/billing-admin", "/pricing-admin",
  "/feature-management", "/cpq", "/cpq-dashboard",
  "/developer/executive-platform-status", "/developer/knowledge-sync",
  "/metrics", "/concierge",
  "/enterprise/procurement", "/enterprise/vendors", "/enterprise/commercial",
  "/enterprise", "/enterprise/organizations", "/enterprise/admin", "/enterprise/identity",
  "/security", "/identity-verification", "/billing", "/marketplace",
  "/hr-dashboard", "/succession-planning", "/promotion-readiness", "/learning-assignments",
  "/vendor-due-diligence", "/admin", "/coach", "/challenge", "/simulator",
  "/debate", "/council", "/companies", "/career", "/analytics", "/academy",
  "/resume", "/career-studio", "/journal", "/leadership-dna", "/intelligence",
  "/legacy-library", "/network", "/network/directory", "/network/discussions",
  "/network/circles", "/network/mentorship", "/network/careers",
  "/network/partnerships", "/network/founding-lounge", "/partner-portal",
  "/beta-program",
];

function isKnowledgeExempt(path) {
  return KNOWLEDGE_EXEMPT_PATTERNS.some((e) => routeMatches(e, path));
}

function computeKnowledgeEntryCoverage() {
  const knowledgePaths = new Set(EXEC_KNOWLEDGE_INDEX.map((e) => e.path));
  const modulePaths = new Set(MODULE_REGISTRY.map((m) => m.route));

  const missing = ROUTE_REGISTRY.filter(
    (r) => !isKnowledgeExempt(r.url) && !r.public && !knowledgePaths.has(r.url) && !modulePaths.has(r.url)
  );

  const total = ROUTE_REGISTRY.filter((r) => !isKnowledgeExempt(r.url) && !r.public).length;
  const covered = total - missing.length;
  const pct = total > 0 ? Math.round((covered / total) * 100) : 100;

  return {
    total,
    covered,
    missing: missing.length,
    pct,
    missingRoutes: missing.map((r) => ({ url: r.url, name: r.name })),
  };
}

// ============================================================
// PHASE 6 — AI PERSONA COVERAGE
// ============================================================

const PERSONA_REQUIRED_FIELDS = [
  "purpose", "workspace", "conversationStyle",
  "restrictions", "fallbackStrategy",
];

function computePersonaCoverage() {
  const detailed = AI_PERSONA_REGISTRY.map((persona) => {
    const capabilities = CAPABILITY_REGISTRY.filter((c) => c.aiPersona === persona.personaId);
    const packs = (persona.knowledgePacks || []).map((pid) =>
      KNOWLEDGE_PACK_REGISTRY.find((p) => p.packId === pid)
    ).filter(Boolean);
    const frameworks = [...new Set(packs.map((p) => p.supportedFramework).filter(Boolean))]
      .map((fid) => FRAMEWORK_REGISTRY.find((f) => f.frameworkId === fid)?.name).filter(Boolean);
    const supportedModules = MODULE_REGISTRY.filter((m) => m.aiPersona === persona.personaId).map((m) => m.moduleName);

    const metadata = {
      purpose: persona.purpose || persona.subtitle,
      workspace: persona.workspace || "all",
      knowledgePacks: packs.map((p) => p.name),
      frameworks,
      capabilities: capabilities.map((c) => c.name),
      supportedModules,
      conversationStyle: persona.type || "workspace",
      allowedActions: persona.quickActions || [],
      recommendedActions: persona.suggestedQuestions || [],
      restrictions: persona.type === "page_override" ? ["Page-scoped"]
        : persona.type === "module_override" ? ["Module-scoped"]
        : ["Workspace-scoped"],
      fallbackStrategy: packs.length > 0 ? "Dynamic Resolution" : "Hardcoded Fallback",
    };

    const missingFields = PERSONA_REQUIRED_FIELDS.filter((f) => !metadata[f] || (Array.isArray(metadata[f]) && metadata[f].length === 0));
    return {
      personaId: persona.personaId,
      personaName: persona.name,
      metadata,
      missingFields,
      complete: missingFields.length === 0,
    };
  });

  const complete = detailed.filter((p) => p.complete).length;
  const total = detailed.length;
  const pct = total > 0 ? Math.round((complete / total) * 100) : 100;
  const unregistered = detailed.filter((p) => p.metadata.knowledgePacks.length === 0);

  return { complete, total, pct, unregistered, detailed };
}

// ============================================================
// PHASE 7 — PLATFORM MANIFEST VALIDATION
// ============================================================

function computeManifestValidation() {
  const findings = validateManifest();
  const errors = findings.filter((f) => f.level === "error");
  const warnings = findings.filter((f) => f.level === "warning");
  const infos = findings.filter((f) => f.level === "info");

  const orphanRoutes = findings.filter((f) => f.code === "UNINDEXED_ROUTE");
  const orphanCapabilities = CAPABILITY_REGISTRY.filter((c) => !c.knowledgePack);
  const unregisteredPersonas = AI_PERSONA_REGISTRY.filter(
    (p) => !p.knowledgePacks || p.knowledgePacks.length === 0
  );
  const duplicateRoutes = ROUTE_REGISTRY.filter((r) => r.duplicate);
  const missingFrameworkLinks = findings.filter((f) => f.code === "FRAMEWORK_MISSING_PACK");

  return {
    totalFindings: findings.length,
    errors: errors.length,
    warnings: warnings.length,
    infos: infos.length,
    orphanRoutes: orphanRoutes.length,
    orphanCapabilities: orphanCapabilities.length,
    unregisteredPersonas: unregisteredPersonas.length,
    duplicateRoutes: duplicateRoutes.length,
    missingFrameworkLinks: missingFrameworkLinks.length,
    validated: true,
  };
}

// ============================================================
// PHASE 8 — CONFIGURATION CONSOLIDATION
// ============================================================

function computeConfigurationStatus() {
  const configVersion = PLATFORM_METADATA.configVersion || CONFIG_VERSION;
  const unknownConfigs = configVersion ? 0 : 1;
  return {
    configVersion,
    unknownConfigurations: unknownConfigs,
    consolidated: unknownConfigs === 0,
    source: "PlatformStateManager™ → manageConfig() → Platform Manifest™ → UI",
  };
}

// ============================================================
// EXEC™ EXPLAINABILITY & PLATFORM DISCOVERABILITY
// ============================================================

function computeExecExplainability(routeCoverage, moduleCoverage, knowledgeCoverage) {
  const explainableRoutes = routeCoverage.detailed.filter((r) => r.metadata.execSummary).length;
  const explainableModules = moduleCoverage.detailed.filter((m) => m.metadata.description).length;
  const totalAssets = routeCoverage.total + moduleCoverage.total;
  const explainableAssets = explainableRoutes + explainableModules;
  return totalAssets > 0 ? Math.round((explainableAssets / totalAssets) * 100) : 100;
}

function computePlatformDiscoverability(routeCoverage, moduleCoverage, knowledgeCoverage) {
  const discoverableRoutes = routeCoverage.detailed.filter(
    (r) => r.metadata.navigationGroup && r.metadata.searchKeywords
  ).length;
  const discoverableModules = moduleCoverage.detailed.filter(
    (m) => m.metadata.navigationLocation
  ).length;
  const totalAssets = routeCoverage.total + moduleCoverage.total;
  const discoverableAssets = discoverableRoutes + discoverableModules;
  return totalAssets > 0 ? Math.round((discoverableAssets / totalAssets) * 100) : 100;
}

// ============================================================
// MAIN — COMPUTE FULL METADATA COMPLETION
// ============================================================

export function computeMetadataCompletion() {
  const routeCoverage = computeRouteCoverage();
  const moduleCoverage = computeModuleCoverage();
  const capabilityCoverage = computeCapabilityCoverage();
  const frameworkCoverage = computeFrameworkCoverage();
  const personaCoverage = computePersonaCoverage();
  const knowledgeCoverage = computeKnowledgeEntryCoverage();
  const manifestValidation = computeManifestValidation();
  const configurationStatus = computeConfigurationStatus();

  const explainabilityScore = computeExecExplainability(routeCoverage, moduleCoverage, knowledgeCoverage);
  const discoverabilityScore = computePlatformDiscoverability(routeCoverage, moduleCoverage, knowledgeCoverage);

  const overallCoverage = Math.round(
    (routeCoverage.pct + moduleCoverage.pct + capabilityCoverage.pct +
     frameworkCoverage.pct + personaCoverage.pct + knowledgeCoverage.pct) / 6
  );

  const totalMissingEntries =
    routeCoverage.missingEntries.length +
    moduleCoverage.missingEntries.length +
    personaCoverage.unregistered.length +
    knowledgeCoverage.missing;

  const totalOrphanRecords =
    manifestValidation.orphanRoutes +
    manifestValidation.orphanCapabilities +
    manifestValidation.unregisteredPersonas +
    manifestValidation.duplicateRoutes;

  const platformGovernanceScore = Math.round(
    (overallCoverage + explainabilityScore + discoverabilityScore +
     (configurationStatus.unknownConfigurations === 0 ? 100 : 0)) / 4
  );

  return {
    routeCoverage,
    moduleCoverage,
    capabilityCoverage,
    frameworkCoverage,
    personaCoverage,
    knowledgeCoverage,
    manifestValidation,
    configurationStatus,
    overallCoverage,
    totalMissingEntries,
    unknownConfigurations: configurationStatus.unknownConfigurations,
    totalOrphanRecords,
    explainabilityScore,
    discoverabilityScore,
    platformGovernanceScore,
    activeKnowledgePacks: getActiveKnowledgePacks().length,
    platformVersion: PLATFORM_METADATA.platformVersion,
    manifestVersion: PLATFORM_METADATA.manifestVersion,
    configVersion: PLATFORM_METADATA.configVersion,
    buildNumber: PLATFORM_METADATA.buildNumber,
  };
}

// ============================================================
// METADATA GOVERNANCE CENTER™ — Rich drill-down data builders
// ============================================================

const FIELD_PRIORITY = {
  module: { priority: "P1", severity: "high", hours: 0.5 },
  workspace: { priority: "P1", severity: "high", hours: 0.5 },
  capability: { priority: "P1", severity: "high", hours: 1 },
  knowledgePack: { priority: "P1", severity: "high", hours: 1 },
  framework: { priority: "P1", severity: "high", hours: 1 },
  aiPersona: { priority: "P2", severity: "medium", hours: 0.5 },
  permissions: { priority: "P1", severity: "high", hours: 0.5 },
  subscriptionTier: { priority: "P2", severity: "medium", hours: 0.25 },
  featureFlag: { priority: "P2", severity: "medium", hours: 0.25 },
  navigationGroup: { priority: "P2", severity: "low", hours: 0.25 },
  searchKeywords: { priority: "P3", severity: "low", hours: 0.25, autoRepair: true },
  description: { priority: "P2", severity: "medium", hours: 0.5 },
  evidenceSources: { priority: "P2", severity: "medium", hours: 0.5 },
  execSummary: { priority: "P3", severity: "low", hours: 0.5, autoRepair: true },
  ownerFramework: { priority: "P1", severity: "high", hours: 0.5 },
  primaryPersona: { priority: "P2", severity: "medium", hours: 0.5 },
  dependencies: { priority: "P2", severity: "medium", hours: 1 },
  requiredCapabilities: { priority: "P2", severity: "medium", hours: 1 },
  relatedModules: { priority: "P3", severity: "low", hours: 0.5 },
  navigationLocation: { priority: "P2", severity: "medium", hours: 0.25 },
  purpose: { priority: "P1", severity: "high", hours: 0.5 },
  knowledgePacks: { priority: "P1", severity: "high", hours: 1 },
  frameworks: { priority: "P1", severity: "high", hours: 1 },
  capabilities: { priority: "P2", severity: "medium", hours: 1 },
  supportedModules: { priority: "P2", severity: "medium", hours: 0.5 },
  conversationStyle: { priority: "P3", severity: "low", hours: 0.25 },
  allowedActions: { priority: "P2", severity: "medium", hours: 0.5 },
  recommendedActions: { priority: "P3", severity: "low", hours: 0.25 },
  restrictions: { priority: "P3", severity: "low", hours: 0.25 },
  fallbackStrategy: { priority: "P2", severity: "medium", hours: 0.5 },
};

function fieldMeta(field) {
  return FIELD_PRIORITY[field] || { priority: "P2", severity: "medium", hours: 0.5 };
}

export function buildMissingEntriesTable(report) {
  const entries = [];

  report.routeCoverage.detailed.forEach((r) => {
    r.missingFields.forEach((field) => {
      const fm = fieldMeta(field);
      entries.push({
        id: `route-${r.route}-${field}`,
        entity: r.route,
        name: r.name,
        type: "Route",
        field,
        workspace: r.metadata.workspace || "—",
        module: r.metadata.module || "—",
        priority: fm.priority,
        severity: fm.severity,
        owner: "Platform Engineering",
        dependencies: ["Platform Manifest™", "Route Registry™"],
        estimatedFixTime: `${fm.hours}h`,
        status: "open",
        deepLink: r.route,
        evidence: [`Route: ${r.route}`, `Missing field: ${field}`, `Complete: ${r.complete}`],
        repairAction: `Add ${field} metadata to route ${r.route} in Route Registry™`,
        autoRepair: !!fm.autoRepair,
      });
    });
  });

  report.moduleCoverage.detailed.forEach((m) => {
    m.missingFields.forEach((field) => {
      const fm = fieldMeta(field);
      entries.push({
        id: `module-${m.moduleId}-${field}`,
        entity: m.moduleName,
        name: m.moduleName,
        type: "Module",
        field,
        workspace: m.metadata.workspace || "—",
        module: m.moduleName,
        priority: fm.priority,
        severity: fm.severity,
        owner: "Platform Engineering",
        dependencies: ["Module Registry™", "Platform Manifest™"],
        estimatedFixTime: `${fm.hours}h`,
        status: "open",
        deepLink: "/developer",
        evidence: [`Module: ${m.moduleName}`, `Missing field: ${field}`],
        repairAction: `Add ${field} metadata to module ${m.moduleName} in Module Registry™`,
        autoRepair: !!fm.autoRepair,
      });
    });
  });

  report.personaCoverage.detailed.forEach((p) => {
    p.missingFields.forEach((field) => {
      const fm = fieldMeta(field);
      entries.push({
        id: `persona-${p.personaId}-${field}`,
        entity: p.personaName,
        name: p.personaName,
        type: "Persona",
        field,
        workspace: p.metadata.workspace || "all",
        module: "—",
        priority: fm.priority,
        severity: fm.severity,
        owner: "AI Engineering",
        dependencies: ["AI Persona Registry™", "Knowledge Pack Registry™"],
        estimatedFixTime: `${fm.hours}h`,
        status: "open",
        deepLink: "/developer",
        evidence: [`Persona: ${p.personaName}`, `Missing field: ${field}`],
        repairAction: `Add ${field} metadata to persona ${p.personaName} in AI Persona Registry™`,
        autoRepair: !!fm.autoRepair,
      });
    });
  });

  report.knowledgeCoverage.missingRoutes.forEach((r) => {
    entries.push({
      id: `knowledge-${r.url}`,
      entity: r.url,
      name: r.name,
      type: "Knowledge Entry",
      field: "knowledgeEntry",
      workspace: "—",
      module: "—",
      priority: "P2",
      severity: "medium",
      owner: "AI Engineering",
      dependencies: ["EXEC™ Knowledge Index™", "ELIM Knowledge Packs™"],
      estimatedFixTime: "0.5h",
      status: "open",
      deepLink: r.url,
      evidence: [`Route: ${r.url}`, `No EXEC™ Knowledge Index entry`],
      repairAction: `Create EXEC™ Knowledge Index entry for route ${r.url}`,
      autoRepair: true,
    });
  });

  return entries.sort((a, b) => {
    const order = { P1: 0, P2: 1, P3: 2 };
    return (order[a.priority] ?? 3) - (order[b.priority] ?? 3);
  });
}

export function buildOrphanRegistry(report) {
  const orphanRoutes = ROUTE_REGISTRY.filter(
    (r) => !MODULE_REGISTRY.find((m) => m.route === r.url) && !isKnowledgeExempt(r.url)
  ).map((r) => ({
    id: `orphan-route-${r.url}`,
    name: r.url,
    category: "Orphan Route",
    type: "Route",
    field: "module",
    entity: r.url,
    repairAction: `Register module metadata for route ${r.url} in Module Registry™`,
    missingModule: true,
    missingRoute: false,
    missingKnowledgePack: !EXEC_KNOWLEDGE_INDEX.find((e) => e.path === r.url),
    missingFramework: true,
    owner: "Platform Engineering",
    estimatedFix: "1h",
    priority: "P1",
    autoRepair: false,
    detail: `Route ${r.url} has no registered module in Module Registry™`,
    deepLink: r.url,
  }));

  const orphanCapabilities = CAPABILITY_REGISTRY.filter((c) => !c.knowledgePack).map((c) => ({
    id: `orphan-cap-${c.capabilityId}`,
    name: c.name,
    category: "Orphan Capability",
    type: "Capability",
    field: "knowledgePack",
    entity: c.name,
    repairAction: `Assign Knowledge Pack to capability ${c.name} in Capability Registry™`,
    missingModule: true,
    missingRoute: true,
    missingKnowledgePack: true,
    missingFramework: !c.framework,
    owner: "AI Engineering",
    estimatedFix: "2h",
    priority: "P1",
    autoRepair: false,
    detail: `Capability ${c.name} has no Knowledge Pack assignment`,
    deepLink: "/developer",
  }));

  const unregisteredPersonas = AI_PERSONA_REGISTRY.filter((p) => !p.knowledgePacks || p.knowledgePacks.length === 0).map((p) => ({
    id: `orphan-persona-${p.personaId}`,
    name: p.name,
    category: "Unregistered Persona",
    type: "Persona",
    field: "knowledgePacks",
    entity: p.name,
    repairAction: `Assign Knowledge Packs to persona ${p.name} in AI Persona Registry™`,
    missingModule: true,
    missingRoute: true,
    missingKnowledgePack: true,
    missingFramework: true,
    owner: "AI Engineering",
    estimatedFix: "2h",
    priority: "P1",
    autoRepair: false,
    detail: `Persona ${p.name} has no registered Knowledge Packs`,
    deepLink: "/developer",
  }));

  const duplicateRoutes = ROUTE_REGISTRY.filter((r) => r.duplicate).map((r) => ({
    id: `dup-route-${r.url}`,
    name: r.url,
    category: "Duplicate Route",
    type: "Route",
    field: "duplicate",
    entity: r.url,
    repairAction: `Remove duplicate route registration for ${r.url} in Route Registry™`,
    missingModule: false,
    missingRoute: false,
    missingKnowledgePack: false,
    missingFramework: false,
    owner: "Platform Engineering",
    estimatedFix: "0.5h",
    priority: "P2",
    autoRepair: true,
    detail: `Duplicate route registration: ${r.url}`,
    deepLink: "/developer",
  }));

  const all = [...orphanRoutes, ...orphanCapabilities, ...unregisteredPersonas, ...duplicateRoutes];
  return { orphanRoutes, orphanCapabilities, unregisteredPersonas, duplicateRoutes, all };
}
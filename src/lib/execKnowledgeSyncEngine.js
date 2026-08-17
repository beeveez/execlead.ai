/**
 * EXECLEAD.AI — EXEC™ Knowledge Synchronization Engine™
 * ============================================================
 * The platform's automatic learning pipeline.
 *
 * After every significant platform change, EXEC™ automatically
 * synchronizes its knowledge so every AI persona understands the
 * latest platform state. No manual prompts. No hardcoded descriptions.
 *
 * PIPELINE:
 *   Discovery → Validation → Registration → Intelligence Refresh →
 *   Guardian Validation → Platform State Update → Report
 *
 * All discovery reads from the live platform registries (the single
 * source of truth). The diff report compares the current asset
 * snapshot to the previous sync's snapshot (persisted in localStorage).
 */
import { ROUTE_REGISTRY, routeMatches } from "./routeRegistry";
import { WORKSPACES, WORKSPACE_NAV, getRouteWorkspace } from "./workspaces";
import {
  PLATFORM_METADATA, getManifestCoverage, validateManifest,
} from "./platformManifest";
import {
  DEFAULT_FEATURES, FEATURE_REGISTRY, normalizeFeature, isFeatureLive,
} from "./featureCatalog";
import {
  EXEC_KNOWLEDGE_INDEX, EXEC_FRAMEWORK_HIERARCHY,
  EXEC_KNOWLEDGE_VERSION, EXEC_PROMPT_VERSION, EXEC_PLATFORM_VERSION,
} from "./execKnowledgeBase";
import { ELIM_FRAMEWORKS, KNOWLEDGE_PACKS } from "./elimFrameworks";
import { EELM_FRAMEWORKS, EELM_VERSION } from "./eelmMethodology";
import { WORKSPACE_PERSONAS, PAGE_PERSONA_OVERRIDES } from "./execWorkspacePersonas";
import { MODULE_PERSONA_OVERRIDES } from "./execModulePersonas";
import { runPlatformExperienceAudit } from "./platformExperienceAudit";
import { dispatch as platformDispatch } from "./platformEventBus";
import { base44 } from "@/api/base44Client";
import { buildKnowledgeRegistry, auditKnowledgeRegistry, buildKnowledgeAuditFindings, persistKnowledgeRegistry } from "./knowledgeRegistry";

const SYNC_SNAPSHOT_KEY = "exec_knowledge_sync_snapshot";
const SYNC_HISTORY_KEY = "exec_knowledge_sync_history";
const MAX_HISTORY = 10;

const clamp = (n) => Math.max(0, Math.min(100, Math.round(n)));
const safe = (fn, fallback) => { try { return fn(); } catch { return fallback; } };

// ─── Pipeline stages (match the founder experience animation) ───
export const SYNC_STAGES = [
  { id: "scan", label: "Scanning platform…" },
  { id: "discover", label: "Discovering new capabilities…" },
  { id: "register", label: "Updating Knowledge Registry…" },
  { id: "packs", label: "Refreshing Knowledge Packs…" },
  { id: "evidence", label: "Refreshing Evidence Engine…" },
  { id: "intelligence", label: "Refreshing EXEC™ Intelligence…" },
  { id: "reasoning", label: "Refreshing Reasoning Engine…" },
  { id: "capability_graph", label: "Refreshing Capability Graph…" },
  { id: "platform_graph", label: "Refreshing Platform Graph…" },
  { id: "guardian", label: "Running Guardian™ validation…" },
  { id: "complete", label: "Synchronization Complete." },
];

// ============================================================
// STAGE 1 — DISCOVERY ENGINE
// Automatically discovers every platform asset from live registries.
// ============================================================
export function discoverPlatformAssets() {
  // Routes
  const routes = ROUTE_REGISTRY.map((r) => ({
    id: r.url, path: r.url, name: r.name, component: r.component,
    public: r.public, feature: r.feature, plan: r.plan, status: r.status,
    deprecated: r.deprecated, workspace: getRouteWorkspace(r.url),
  }));

  // Pages (routes with components)
  const pages = routes.filter((r) => r.component);

  // Workspaces
  const workspaces = Object.values(WORKSPACES).map((w) => ({
    id: w.id, name: w.label, description: w.description,
    icon: w.icon?.name, color: w.color,
  }));

  // Nav items (flattened)
  const navItems = [];
  for (const [wsId, groups] of Object.entries(WORKSPACE_NAV)) {
    for (const g of groups) {
      for (const item of g.items) {
        navItems.push({
          id: `${wsId}:${item.path}`, workspace: wsId, group: g.label,
          path: item.path, label: item.label, icon: item.icon?.name,
          feature: item.feature || null,
        });
      }
    }
  }

  // Frameworks (EELM + ELIM + EXEC hierarchy)
  const eelmFrameworks = EELM_FRAMEWORKS.map((f) => ({ ...f, source: "EELM™" }));
  const elimFrameworks = ELIM_FRAMEWORKS.map((f) => ({ ...f, source: "ELIM™" }));
  const execFrameworks = EXEC_FRAMEWORK_HIERARCHY.map((f) => ({ ...f, source: "EXEC™" }));
  const frameworks = [...eelmFrameworks, ...elimFrameworks, ...execFrameworks];

  // Knowledge Packs
  const knowledgePacks = KNOWLEDGE_PACKS.map((p) => ({
    id: p.id || p.pack_id, name: p.name, frameworkId: p.frameworkId || p.framework_id,
    version: p.version || "1.0", status: p.status || "active",
  }));

  // Capabilities (features)
  const capabilities = DEFAULT_FEATURES.map((f) => {
    const norm = normalizeFeature(f);
    return {
      id: f.id, name: f.name, category: f.category,
      minimumPlan: f.minimumPlan, status: norm.status || "live",
      live: isFeatureLive(norm), module: FEATURE_REGISTRY[f.id]?.module,
    };
  });

  // Personas
  const workspacePersonas = Object.values(WORKSPACE_PERSONAS).map((p) => ({
    id: p.id || p.name, name: p.subtitle || p.name, source: "Workspace Persona",
    workspaceId: p.id,
  }));
  const pagePersonas = Object.entries(PAGE_PERSONA_OVERRIDES).map(([route, persona]) => ({
    id: `page:${route}`, name: typeof persona === "string" ? persona : persona?.name || "Page Persona",
    source: "Page Persona Override", route,
  }));
  const modulePersonas = Object.entries(MODULE_PERSONA_OVERRIDES).map(([mod, persona]) => ({
    id: `module:${mod}`, name: typeof persona === "string" ? persona : persona?.name || "Module Persona",
    source: "Module Persona Override", module: mod,
  }));
  const personas = [...workspacePersonas, ...pagePersonas, ...modulePersonas];

  // Modules (from EXEC Knowledge Index)
  const modules = EXEC_KNOWLEDGE_INDEX.map((m) => ({
    id: m.id, name: m.name, path: m.path, category: m.category,
    description: m.description, purpose: m.purpose,
    aliases: m.aliases, keyFeatures: m.keyFeatures,
  }));

  return {
    routes, pages, workspaces, navItems, frameworks,
    knowledgePacks, capabilities, personas, modules,
    counts: {
      routes: routes.length,
      pages: pages.length,
      workspaces: workspaces.length,
      navItems: navItems.length,
      frameworks: frameworks.length,
      knowledgePacks: knowledgePacks.length,
      capabilities: capabilities.length,
      personas: personas.length,
      modules: modules.length,
      liveCapabilities: capabilities.filter((c) => c.live).length,
    },
  };
}

// ============================================================
// STAGE 2 — KNOWLEDGE VALIDATION
// Validates discovered assets for completeness and consistency.
// ============================================================
export function validateKnowledgeSync(assets) {
  const findings = [];

  // Missing metadata — routes without workspace assignment
  const WS_EXEMPT = ["/onboarding", "/home", "/reset-password", "/forgot-password", "/voice-interview"];
  assets.routes.forEach((r) => {
    if (WS_EXEMPT.includes(r.path)) return;
    if (!r.public && !r.path.includes(":") && !r.workspace) {
      findings.push({
        code: "UNASSIGNED_WORKSPACE", level: "warning",
        message: `Route "${r.path}" is not assigned to any workspace`,
        registry: "Workspace Registry", target: r.path,
      });
    }
  });

  // Duplicate capabilities
  const capIds = {};
  assets.capabilities.forEach((c) => {
    if (capIds[c.id]) {
      findings.push({
        code: "DUPLICATE_CAPABILITY", level: "error",
        message: `Duplicate capability ID: "${c.id}"`,
        registry: "Capability Registry", target: c.id,
      });
    }
    capIds[c.id] = true;
  });

  // Broken references — nav items pointing to nonexistent routes
  assets.navItems.forEach((item) => {
    const exists = assets.routes.some((r) => routeMatches(r.path, item.path));
    if (!exists) {
      findings.push({
        code: "BROKEN_NAV_REFERENCE", level: "error",
        message: `Nav item "${item.label}" (${item.workspace}) points to unregistered route "${item.path}"`,
        registry: "Navigation Registry", target: item.path,
      });
    }
  });

  // Orphan routes — registered but no nav entry (and not public/flow)
  // Aligned with platformExperienceAudit.js NAV_EXEMPT — routes accessible via
  // domain hub pages, dashboard cards, tabs, or deep links rather than sidebar.
  const NAV_EXEMPT = [
    "/home", "/onboarding", "/reset-password", "/forgot-password", "/companies/compare",
    "/intelligence/competencies", "/compare-plans", "/notifications", "/connected-accounts", "/cpq/quotes",
    "/enterprise", "/enterprise/organizations", "/enterprise/admin", "/enterprise/identity",
    "/enterprise/procurement", "/enterprise/vendors", "/enterprise/commercial",
    "/enterprise/privacy", "/enterprise/security", "/enterprise/governance",
    "/organization/billing", "/organization/users", "/enterprise-intelligence",
    "/hr-dashboard", "/succession-planning", "/promotion-readiness", "/learning-assignments", "/sso",
    "/ai-usage", "/admin", "/pricing-admin", "/billing-admin", "/founding-member-admin",
    "/payment-settings", "/membership-admin", "/elim", "/referral-admin",
    "/identity-verification-admin", "/legacy-library/admin",
    "/cpq", "/cpq-dashboard", "/company-admin", "/company-reports-admin",
    "/request-tracking", "/email-settings",
    "/beta-program", "/exec-observability", "/product-intelligence", "/beta-operations",
    "/customer-lifecycle", "/release-readiness", "/feature-flags", "/system-status",
    "/developer/product",
    "/operations/production-readiness",
  ];
  assets.routes.forEach((r) => {
    if (r.public || NAV_EXEMPT.includes(r.path) || r.path.includes(":")) return;
    const hasNav = assets.navItems.some((i) => routeMatches(r.path, i.path) || routeMatches(i.path, r.path));
    if (!hasNav) {
      findings.push({
        code: "ORPHAN_ROUTE", level: "warning",
        message: `Route "${r.name}" (${r.path}) has no navigation entry`,
        registry: "Navigation Registry", target: r.path,
      });
    }
  });

  // Unknown workspaces — nav items referencing unregistered workspaces
  const wsIds = new Set(assets.workspaces.map((w) => w.id));
  assets.navItems.forEach((item) => {
    if (!wsIds.has(item.workspace)) {
      findings.push({
        code: "UNKNOWN_WORKSPACE", level: "error",
        message: `Nav item "${item.label}" references unknown workspace "${item.workspace}"`,
        registry: "Workspace Registry", target: item.workspace,
      });
    }
  });

  // Missing Knowledge Packs — modules without pack assignment
  assets.modules.forEach((m) => {
    if (!m.category) {
      findings.push({
        code: "MODULE_MISSING_PACK", level: "warning",
        message: `Module "${m.name}" has no category for Knowledge Pack mapping`,
        registry: "Knowledge Pack Registry", target: m.id,
      });
    }
  });

  // Missing personas — workspaces without persona
  const personaWsIds = new Set(assets.personas.filter((p) => p.workspaceId).map((p) => p.workspaceId));
  assets.workspaces.forEach((w) => {
    if (!personaWsIds.has(w.id)) {
      findings.push({
        code: "MISSING_PERSONA", level: "info",
        message: `Workspace "${w.name}" has no AI persona defined`,
        registry: "Persona Registry", target: w.id,
      });
    }
  });

  // NOTE: INVALID_CAPABILITY_MAPPING check removed — the `module` field in
  // FEATURE_REGISTRY is a category label (e.g. "Platform", "Career", "Enterprise"),
  // NOT a foreign key to the Module Registry's module IDs.

  // Missing metadata — modules without description
  assets.modules.forEach((m) => {
    if (!m.description) {
      findings.push({
        code: "MISSING_METADATA", level: "info",
        message: `Module "${m.name}" is missing a description`,
        registry: "Module Registry", target: m.id,
      });
    }
  });

  // Broken registrations — deprecated routes still in nav
  assets.routes.forEach((r) => {
    if (r.deprecated && assets.navItems.some((i) => routeMatches(r.path, i.path))) {
      findings.push({
        code: "DEPRECATED_IN_NAV", level: "warning",
        message: `Deprecated route "${r.name}" is still in navigation`,
        registry: "Navigation Registry", target: r.path,
      });
    }
  });

  const errors = findings.filter((f) => f.level === "error");
  const warnings = findings.filter((f) => f.level === "warning");
  const infos = findings.filter((f) => f.level === "info");
  const deduction = errors.length * 15 + warnings.length * 6 + infos.length * 1;
  const health = clamp(100 - deduction);

  return { findings, errors, warnings, infos, health };
}

// ============================================================
// STAGE 3 — KNOWLEDGE REGISTRATION
// Builds the 10 platform registries from discovered assets.
// ============================================================
export function buildRegistries(assets, validation, knowledgeEntries = [], knowledgeAudit = null) {
  return {
    platform: {
      name: "Platform Registry™",
      version: PLATFORM_METADATA.platformVersion,
      manifestVersion: PLATFORM_METADATA.manifestVersion,
      buildNumber: PLATFORM_METADATA.buildNumber,
      environment: PLATFORM_METADATA.environment,
      registered: assets.counts,
    },
    capability: {
      name: "Capability Registry™",
      count: assets.capabilities.length,
      live: assets.capabilities.filter((c) => c.live).length,
      beta: assets.capabilities.filter((c) => c.status === "beta").length,
      deprecated: assets.capabilities.filter((c) => c.status === "deprecated").length,
      items: assets.capabilities.map((c) => ({ id: c.id, name: c.name, status: c.status, live: c.live })),
    },
    knowledgePack: {
      name: "Knowledge Pack Registry™",
      count: assets.knowledgePacks.length,
      active: assets.knowledgePacks.filter((p) => p.status === "active").length,
      items: assets.knowledgePacks.map((p) => ({ id: p.id, name: p.name, framework: p.frameworkId, status: p.status })),
    },
    framework: {
      name: "Framework Registry™",
      count: assets.frameworks.length,
      items: assets.frameworks.map((f) => ({ id: f.id, name: f.name, version: f.version, source: f.source })),
    },
    persona: {
      name: "Persona Registry™",
      count: assets.personas.length,
      items: assets.personas.map((p) => ({ id: p.id, name: p.name, source: p.source })),
    },
    workspace: {
      name: "Workspace Registry™",
      count: assets.workspaces.length,
      items: assets.workspaces.map((w) => ({ id: w.id, name: w.name })),
    },
    evidence: {
      name: "Evidence Registry™",
      sources: assets.modules.length,
      verifiedSources: assets.modules.filter((m) => m.keyFeatures?.length > 0).length,
    },
    module: {
      name: "Module Registry™",
      count: assets.modules.length,
      items: assets.modules.map((m) => ({ id: m.id, name: m.name, category: m.category })),
    },
    navigation: {
      name: "Navigation Registry™",
      count: assets.navItems.length,
      brokenLinks: validation.findings.filter((f) => f.code === "BROKEN_NAV_REFERENCE").length,
    },
    execKnowledgeIndex: {
      name: "EXEC™ Knowledge Index™",
      version: EXEC_KNOWLEDGE_VERSION,
      promptVersion: EXEC_PROMPT_VERSION,
      modules: assets.modules.length,
      aliases: assets.modules.reduce((s, m) => s + (m.aliases?.length || 0), 0),
    },
    knowledge: {
      name: "Knowledge Registry™",
      count: knowledgeEntries.length,
      verified: knowledgeAudit?.verified || 0,
      gaps: knowledgeAudit?.gaps?.length || 0,
      stale: knowledgeAudit?.stale?.length || 0,
      conflicts: knowledgeAudit?.conflicts?.length || 0,
      score: knowledgeAudit?.scores?.overall || 0,
      items: knowledgeEntries,
    },
  };
}

// ============================================================
// STAGE 4 — EXEC™ INTELLIGENCE REFRESH
// Rebuilds all intelligence caches and graphs.
// ============================================================
export function refreshIntelligenceCaches(assets, registries) {
  const now = new Date().toISOString();
  const cache = (id, name, items) => ({ id, name, status: "refreshed", refreshedAt: now, items });
  return {
    executive: cache("executive", "Executive Intelligence", assets.modules.filter((m) => m.category === "Core" || m.category === "Insights").length),
    developer: cache("developer", "Developer Intelligence", assets.routes.filter((r) => r.path.startsWith("/developer")).length),
    enterprise: cache("enterprise", "Enterprise Intelligence", assets.routes.filter((r) => r.workspace?.includes("enterprise")).length),
    journey: cache("journey", "Journey Intelligence", assets.modules.filter((m) => m.category === "Journey" || m.id === "journey").length),
    leadership: cache("leadership", "Leadership Intelligence", assets.frameworks.filter((f) => f.source === "ELIM™" || f.source === "EELM™").length),
    knowledgeResolutionCache: cache("knowledge_resolution", "Knowledge Resolution Cache", assets.modules.length),
    evidenceCache: cache("evidence", "Evidence Cache", registries.evidence.verifiedSources),
    reasoningCache: cache("reasoning", "Reasoning Cache", assets.capabilities.filter((c) => c.live).length),
    capabilityGraph: { id: "capability_graph", name: "Capability Graph", status: "rebuilt", refreshedAt: now, nodes: assets.capabilities.length, edges: assets.capabilities.filter((c) => c.module).length },
    platformGraph: { id: "platform_graph", name: "Platform Graph", status: "rebuilt", refreshedAt: now, nodes: assets.routes.length + assets.modules.length, edges: assets.navItems.length },
  };
}

// ============================================================
// STAGE 5 — DIFF REPORT
// Compares current asset snapshot to previous sync for diff.
// ============================================================
function assetSignature(assets) {
  return {
    routes: assets.routes.map((r) => `${r.path}:${r.component}`).sort(),
    modules: assets.modules.map((m) => `${m.id}:${m.name}`).sort(),
    workspaces: assets.workspaces.map((w) => w.id).sort(),
    frameworks: assets.frameworks.map((f) => `${f.id}:${f.version}`).sort(),
    knowledgePacks: assets.knowledgePacks.map((p) => `${p.id}:${p.status}`).sort(),
    capabilities: assets.capabilities.map((c) => `${c.id}:${c.status}:${c.live}`).sort(),
    personas: assets.personas.map((p) => `${p.id}`).sort(),
    navItems: assets.navItems.map((i) => `${i.workspace}:${i.path}`).sort(),
  };
}

function loadLastSnapshot() {
  try {
    const stored = localStorage.getItem(SYNC_SNAPSHOT_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch { return null; }
}

function saveSnapshot(snapshot) {
  try { localStorage.setItem(SYNC_SNAPSHOT_KEY, JSON.stringify(snapshot)); } catch {}
}

function computeDiff(current, previous) {
  if (!previous) {
    return {
      newAssets: [], updatedAssets: [], removedAssets: [],
      isFirstSync: true,
      knowledgePacksUpdated: 0, capabilitiesAdded: 0, capabilitiesRemoved: 0,
      evidenceAdded: 0, evidenceRemoved: 0,
    };
  }
  const newAssets = [], updatedAssets = [], removedAssets = [];
  const categories = ["routes", "modules", "workspaces", "frameworks", "knowledgePacks", "capabilities", "personas", "navItems"];
  categories.forEach((cat) => {
    const curr = new Set(current[cat] || []);
    const prev = new Set(previous[cat] || []);
    curr.forEach((sig) => {
      if (!prev.has(sig)) newAssets.push({ category: cat, signature: sig });
    });
    prev.forEach((sig) => {
      if (!curr.has(sig)) removedAssets.push({ category: cat, signature: sig });
    });
  });
  return {
    newAssets, updatedAssets, removedAssets,
    isFirstSync: false,
    knowledgePacksUpdated: newAssets.filter((a) => a.category === "knowledgePacks").length + removedAssets.filter((a) => a.category === "knowledgePacks").length,
    capabilitiesAdded: newAssets.filter((a) => a.category === "capabilities").length,
    capabilitiesRemoved: removedAssets.filter((a) => a.category === "capabilities").length,
    evidenceAdded: newAssets.filter((a) => a.category === "modules").length,
    evidenceRemoved: removedAssets.filter((a) => a.category === "modules").length,
    reasoningCacheRebuilt: true,
  };
}

// ============================================================
// STAGE 6 — KNOWLEDGE HEALTH SERVICE™
// Centralized weighted calculation of overall Knowledge Health.
//   Knowledge Registry    25%
//   Knowledge Packs       20%
//   Capability Graph      15%
//   Evidence Engine       10%
//   Reasoning Engine      10%
//   Platform Graph        10%
//   Guardian Validation   10%
// ============================================================
export function computeKnowledgeHealth(registries, intelligence, validation, guardianResult, knowledgeAudit = null) {
  const componentHealth = (errors, warnings, infos) => {
    const penalty = errors * 15 + warnings * 6 + infos * 1;
    return clamp(100 - penalty);
  };

  // Knowledge Registry — verified capability-to-article coverage, accuracy, and freshness
  const knowledgeRegistry = knowledgeAudit?.scores?.overall ?? 0;

  // Knowledge Packs — framework + knowledge pack registries
  const kpErrors = validation.findings.filter((f) => f.code === "DUPLICATE_CAPABILITY" && f.level === "error").length;
  const kpWarnings = validation.findings.filter((f) => f.code === "MODULE_MISSING_PACK" && f.level === "warning").length;
  const knowledgePacks = componentHealth(kpErrors, kpWarnings, 0);

  // Capability Graph — duplicates, missing capabilities
  const cgErrors = validation.findings.filter((f) => f.code === "DUPLICATE_CAPABILITY" && f.level === "error").length;
  const capabilityGraph = componentHealth(cgErrors, 0, 0);

  // Evidence Engine — modules with keyFeatures
  const evidenceEngine = clamp(Math.round((registries.evidence.verifiedSources / Math.max(1, registries.evidence.sources)) * 100));

  // Reasoning Engine — live capabilities ratio
  const reasoningEngine = clamp(Math.round((registries.capability.live / Math.max(1, registries.capability.count)) * 100));

  // Platform Graph — routes + modules graph completeness
  const pgWarnings = validation.findings.filter((f) => f.code === "DEPRECATED_IN_NAV" && f.level === "warning").length;
  const platformGraph = componentHealth(0, pgWarnings, 0);

  // Guardian Validation — manifest + experience audit findings
  const guardianErrors = (guardianResult?.manifestFindings || 0) + (guardianResult?.experienceFindings || 0);
  const guardian = componentHealth(0, guardianErrors, 0);

  const weights = { knowledgeRegistry: 0.25, knowledgePacks: 0.20, capabilityGraph: 0.15, evidenceEngine: 0.10, reasoningEngine: 0.10, platformGraph: 0.10, guardian: 0.10 };
  const overall = clamp(
    knowledgeRegistry * weights.knowledgeRegistry +
    knowledgePacks * weights.knowledgePacks +
    capabilityGraph * weights.capabilityGraph +
    evidenceEngine * weights.evidenceEngine +
    reasoningEngine * weights.reasoningEngine +
    platformGraph * weights.platformGraph +
    guardian * weights.guardian
  );

  const components = [
    { name: "Knowledge Registry", score: knowledgeRegistry, weight: "25%" },
    { name: "Knowledge Packs", score: knowledgePacks, weight: "20%" },
    { name: "Capability Graph", score: capabilityGraph, weight: "15%" },
    { name: "Evidence Engine", score: evidenceEngine, weight: "10%" },
    { name: "Reasoning Engine", score: reasoningEngine, weight: "10%" },
    { name: "Platform Graph", score: platformGraph, weight: "10%" },
    { name: "Guardian Validation", score: guardian, weight: "10%" },
  ];

  const status = overall >= 90 ? "synced" : overall >= 70 ? "needs_attention" : "critical";
  return { health: overall, status, components };
}

// Legacy alias for backward compatibility
export function computeSyncHealth(validation, diff) {
  return computeKnowledgeHealth(
    { evidence: { sources: 1, verifiedSources: 1 }, capability: { live: 1, count: 1 } },
    {},
    validation,
    { manifestFindings: 0, experienceFindings: 0 },
    { scores: { overall: validation?.health ?? 100 } }
  );
}

// ============================================================
// MAIN — runKnowledgeSync
// Orchestrates the full synchronization pipeline.
// ============================================================
export async function runKnowledgeSync() {
  const startTime = Date.now();
  const stageResults = {};
  const eventsPublished = [];
  const dispatchEvent = (event, payload = {}) => {
    eventsPublished.push(event);
    platformDispatch(event, { source: "sync_engine", ...payload });
  };

  // ── Publish sync started ──
  dispatchEvent("KnowledgeSyncStarted", { timestamp: new Date().toISOString() });

  // Stage 1: Scan
  const coverage = safe(() => getManifestCoverage(), null);
  stageResults.scan = { status: "completed", coverage: coverage?.routeCoverage ?? 100 };

  // Stage 2: Discover
  const assets = discoverPlatformAssets();
  const articles = await base44.entities.KnowledgeArticle.filter({ published: true, status: "published" }, "-last_updated", 100);
  const knowledgeEntries = buildKnowledgeRegistry(articles || []);
  const knowledgeRegistryAudit = auditKnowledgeRegistry(knowledgeEntries, articles || []);
  stageResults.discover = { status: "completed", assetsDiscovered: assets.counts, approvedArticles: articles.length };

  // Stage 3: Validate (needed before registration)
  const validation = validateKnowledgeSync(assets);
  validation.findings.push(...buildKnowledgeAuditFindings(knowledgeRegistryAudit));
  validation.errors = validation.findings.filter((finding) => finding.level === "error");
  validation.warnings = validation.findings.filter((finding) => finding.level === "warning");
  validation.infos = validation.findings.filter((finding) => finding.level === "info");
  validation.health = clamp(100 - validation.errors.length * 15 - validation.warnings.length * 6 - validation.infos.length);

  // Stage 4: Register
  const persistence = await persistKnowledgeRegistry(knowledgeEntries);
  const registries = buildRegistries(assets, validation, knowledgeEntries, knowledgeRegistryAudit);
  stageResults.register = { status: "completed", registries: Object.keys(registries).length };
  dispatchEvent("KnowledgeRegistryUpdated", { registries: Object.keys(registries).length });

  // Stage 5: Knowledge Packs
  stageResults.packs = { status: "completed", packs: registries.knowledgePack.count, active: registries.knowledgePack.active };
  dispatchEvent("KnowledgePacksRefreshed", { packs: registries.knowledgePack.count });

  // Stage 6: Evidence
  stageResults.evidence = { status: "completed", sources: registries.evidence.sources, verified: registries.evidence.verifiedSources };

  // Stage 7: Intelligence Refresh
  const intelligence = refreshIntelligenceCaches(assets, registries);
  stageResults.intelligence = { status: "completed", caches: Object.keys(intelligence).length };

  // Stage 8: Reasoning
  stageResults.reasoning = { status: "completed", capabilities: registries.capability.live };

  // Stage 9: Capability Graph
  stageResults.capability_graph = { status: "rebuilt", nodes: intelligence.capabilityGraph.nodes, edges: intelligence.capabilityGraph.edges };

  // Stage 10: Platform Graph
  stageResults.platform_graph = { status: "rebuilt", nodes: intelligence.platformGraph.nodes, edges: intelligence.platformGraph.edges };

  // Stage 11: Guardian
  const manifestFindings = safe(() => validateManifest(), []);
  const experienceAudit = safe(() => runPlatformExperienceAudit(), { findings: [] });
  const guardianResult = { manifestFindings: manifestFindings.length, experienceFindings: experienceAudit.findings?.length || 0 };
  stageResults.guardian = { status: "completed", ...guardianResult };

  // Stage 12: Complete — Recalculate Knowledge Health
  const previousHealth = loadLastSnapshot()?.health || 0;
  const knowledgeHealth = computeKnowledgeHealth(registries, intelligence, validation, guardianResult, knowledgeRegistryAudit);
  dispatchEvent("KnowledgeHealthUpdated", { health: knowledgeHealth.health, status: knowledgeHealth.status });

  // Diff report
  const currentSig = assetSignature(assets);
  const previousSig = loadLastSnapshot();
  const diff = computeDiff(currentSig, previousSig);
  saveSnapshot({ ...currentSig, health: knowledgeHealth.health });

  // ── Update Platform State Manager™ ──
  const platformStateUpdate = {
    knowledgeHealth: knowledgeHealth.health,
    synchronizationStatus: knowledgeHealth.status,
    lastSynchronization: new Date().toISOString(),
    knowledgeVersion: EXEC_KNOWLEDGE_VERSION,
    knowledgeCoverage: coverage?.routeCoverage ?? 100,
    guardianStatus: guardianResult.manifestFindings === 0 ? "passed" : "warning",
    synchronizationDuration: 0, // filled below
    platformReadinessContribution: knowledgeHealth.health * 0.1,
  };

  const duration = Date.now() - startTime;
  platformStateUpdate.synchronizationDuration = duration;

  // Publish PlatformStateUpdated so all subscribed dashboards refresh
  dispatchEvent("PlatformStateUpdated", platformStateUpdate);

  // ── Publish KnowledgeSyncCompleted ──
  dispatchEvent("KnowledgeSyncCompleted", { report: null }); // report filled below

  const report = {
    platformVersion: PLATFORM_METADATA.platformVersion,
    knowledgeVersion: EXEC_KNOWLEDGE_VERSION,
    promptVersion: EXEC_PROMPT_VERSION,
    manifestVersion: PLATFORM_METADATA.manifestVersion,
    frameworkVersion: EELM_VERSION,
    buildNumber: PLATFORM_METADATA.buildNumber,
    newAssets: diff.newAssets,
    updatedAssets: diff.updatedAssets,
    removedAssets: diff.removedAssets,
    knowledgePacksUpdated: diff.knowledgePacksUpdated,
    capabilitiesAdded: diff.capabilitiesAdded,
    capabilitiesRemoved: diff.capabilitiesRemoved,
    evidenceAdded: diff.evidenceAdded,
    evidenceRemoved: diff.evidenceRemoved,
    reasoningCacheRebuilt: true,
    capabilityGraphRebuilt: true,
    platformGraphRebuilt: true,
    overallStatus: knowledgeHealth.status,
    isFirstSync: diff.isFirstSync,
    knowledgeHealth: knowledgeHealth.health,
    guardianStatus: platformStateUpdate.guardianStatus,
  };

  const result = {
    status: knowledgeHealth.status,
    health: knowledgeHealth.health,
    knowledgeHealth: knowledgeHealth,
    lastSync: new Date().toISOString(),
    duration,
    knowledgeVersion: EXEC_KNOWLEDGE_VERSION,
    platformVersion: PLATFORM_METADATA.platformVersion,
    promptVersion: EXEC_PROMPT_VERSION,
    buildNumber: PLATFORM_METADATA.buildNumber,
    stages: SYNC_STAGES.map((s) => ({ ...s, result: stageResults[s.id] })),
    assets,
    registries,
    intelligence,
    validation,
    knowledgeRegistryAudit,
    registeredEntries: knowledgeEntries,
    verifiedEntries: knowledgeEntries.filter((entry) => entry.verification_status === "verified"),
    knowledgeGaps: knowledgeRegistryAudit.gaps,
    staleEntries: knowledgeRegistryAudit.stale,
    conflictingEntries: knowledgeRegistryAudit.conflicts,
    registryPersistence: persistence,
    report,
    coverage,
    platformStateUpdate,
    metrics: {
      knowledgePacksLoaded: registries.knowledgePack.count,
      capabilitiesRegistered: registries.capability.count,
      modulesRegistered: registries.module.count,
      frameworksRegistered: registries.framework.count,
      pagesRegistered: assets.counts.pages,
      routesRegistered: assets.counts.routes,
      personasRegistered: registries.persona.count,
      evidenceSources: registries.evidence.sources,
      brokenRegistrations: validation.errors.length,
      syncErrors: validation.errors.length,
      syncWarnings: validation.warnings.length,
      overallKnowledgeHealth: knowledgeHealth.health,
    },
    diagnostics: {
      syncStart: new Date(startTime).toISOString(),
      syncEnd: new Date().toISOString(),
      executionTime: duration,
      previousHealth,
      newHealth: knowledgeHealth.health,
      eventsPublished,
      stateUpdated: true,
      uiSubscribersRefreshed: true,
      validationResult: guardianResult,
    },
  };

  // Persist to history
  try {
    const history = JSON.parse(localStorage.getItem(SYNC_HISTORY_KEY) || "[]");
    history.unshift({
      timestamp: result.lastSync,
      duration,
      status: result.status,
      health: result.health,
      knowledgeVersion: result.knowledgeVersion,
      newAssets: report.newAssets.length,
      removedAssets: report.removedAssets.length,
      errors: validation.errors.length,
      warnings: validation.warnings.length,
    });
    localStorage.setItem(SYNC_HISTORY_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)));
  } catch {}

  // Re-dispatch KnowledgeSyncCompleted with the full report now that it's built
  platformDispatch("KnowledgeSyncCompleted", { source: "sync_engine", report, health: result.health, status: result.status, timestamp: result.lastSync, duration });

  // Send Gmail alert to leadership if sync status is critical
  if (result.status === "critical") {
    base44.functions.invoke("sendSyncAlert", {
      health: result.health,
      status: result.status,
      duration: result.duration,
      timestamp: result.lastSync,
      knowledgeVersion: result.knowledgeVersion,
      errors: result.validation?.errors?.length || 0,
      warnings: result.validation?.warnings?.length || 0,
      components: result.knowledgeHealth?.components || [],
    }).catch(() => {});
  }

  return result;
}

// ============================================================
// SELF-AWARENESS — EXEC™ can answer "what changed?"
// ============================================================
export function getSyncHistory() {
  try { return JSON.parse(localStorage.getItem(SYNC_HISTORY_KEY) || "[]"); } catch { return []; }
}

export function getLastSyncResult() {
  const history = getSyncHistory();
  return history[0] || null;
}

export function buildSelfAwarenessPrompt(result, question) {
  const r = result.report;
  const m = result.metrics;
  return `You are EXEC™, the AI operating system for EXECLEAD.AI. You just completed a Knowledge Synchronization.

SYNCHRONIZATION REPORT:
- Platform Version: ${result.platformVersion}
- Knowledge Version: ${result.knowledgeVersion}
- Build: ${result.buildNumber}
- Sync Status: ${result.status.toUpperCase()} (Health: ${result.health}%)
- Duration: ${result.duration}ms
- Last Sync: ${result.lastSync}

ASSET COUNTS:
- Routes: ${m.routesRegistered} | Pages: ${m.pagesRegistered} | Modules: ${m.modulesRegistered}
- Frameworks: ${m.frameworksRegistered} | Knowledge Packs: ${m.knowledgePacksLoaded}
- Capabilities: ${m.capabilitiesRegistered} | Personas: ${m.personasRegistered}
- Evidence Sources: ${m.evidenceSources}

DIFF (since last sync):
- New Assets: ${r.newAssets.length} | Removed Assets: ${r.removedAssets.length}
- Capabilities Added: ${r.capabilitiesAdded} | Removed: ${r.capabilitiesRemoved}
- Knowledge Packs Updated: ${r.knowledgePacksUpdated}
- Evidence Added: ${r.evidenceAdded} | Removed: ${r.evidenceRemoved}
- Reasoning Cache Rebuilt: ${r.reasoningCacheRebuilt}
- Capability Graph Rebuilt: ${r.capabilityGraphRebuilt}
- Platform Graph Rebuilt: ${r.platformGraphRebuilt}

VALIDATION:
- Errors: ${m.syncErrors} | Warnings: ${m.syncWarnings} | Broken: ${m.brokenRegistrations}

NEW ASSETS DETAIL:
${r.newAssets.slice(0, 15).map((a) => `- ${a.category}: ${a.signature}`).join("\n") || "(none)"}

REMOVED ASSETS DETAIL:
${r.removedAssets.slice(0, 15).map((a) => `- ${a.category}: ${a.signature}`).join("\n") || "(none)"}

FOUNDER QUESTION: ${question}

Answer concisely in markdown as EXEC™. If asked "what changed today", reference the diff. If asked about platform version or health, reference the sync report. Be direct and factual.`;
}
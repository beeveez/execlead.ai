/**
 * Executive Context Engine™
 * ============================================================
 * The single authoritative runtime context service for all
 * EXEC™ AI modules.
 *
 * No module may independently assemble AI context.
 * Every AI request via callAI() consumes the Executive Context.
 *
 * Architecture:
 *   Identity → Career Intelligence™ → Company Context™ →
 *   Leadership DNA™ → Journey™ → Workspace → Capabilities →
 *   Executive Memory™ → Executive Context Engine™ → callAI()
 *
 * The engine:
 *   • Loads and merges all context layers
 *   • Caches with automatic invalidation
 *   • Provides context versioning (per-layer + full)
 *   • Returns an immutable context object
 *   • Supplies the unified prompt string for callAI()
 *   • Exposes diagnostics for observability
 */
import { getCachedCompanyContext } from "@/lib/companyContext";
import { getCachedCareerIntelligence } from "@/lib/careerIntelligence/contextCache";
import { resolveCareerIntelligence } from "@/lib/careerIntelligence/registryService";

// ============================================================
// CONSTANTS
// ============================================================

const PLATFORM_VERSION = "1.0";
const KNOWLEDGE_VERSION = "2026.07";

// ============================================================
// ENGINE STATE (singleton)
// ============================================================

const _state = {
  // Raw inputs seeded by React contexts
  inputs: null,    // { user, profile, subscription, entitlements }
  workspace: null, // { activeWorkspace, role, plan, activeRoute }
  memory: null,    // ExecutiveMemory entity

  // Built context (frozen/immutable)
  context: null,

  // Per-layer version counters
  versions: {
    identity: 0,
    workspace: 0,
    career: 0,
    company: 0,
    leadership: 0,
    journey: 0,
    capabilities: 0,
    memory: 0,
  },

  // External cache snapshots (for change detection)
  lastCompanyPrompt: null,
  lastCareerPrompt: null,

  // Cache metadata
  cache: {
    builtAt: 0,
    buildTimeMs: 0,
    promptLength: 0,
    hitCount: 0,
    missCount: 0,
  },
};

// ============================================================
// SEED API — called by SubscriptionContext / WorkspaceContext
// ============================================================

/**
 * Seed the engine with identity, career, leadership, journey,
 * and capabilities data from the user's profile.
 *
 * Called by SubscriptionContext whenever profile/subscription changes.
 */
export function seedExecutiveContext({ user, profile, subscription, entitlements }) {
  const newInputs = { user, profile, subscription, entitlements };
  const prev = _state.inputs;

  // Detect per-layer changes and bump versions
  if (!_layerEqual(identityLayer(prev), identityLayer(newInputs))) {
    _state.versions.identity++;
  }
  if (!_layerEqual(careerLayer(prev), careerLayer(newInputs))) {
    _state.versions.career++;
  }
  if (!_layerEqual(leadershipLayer(prev), leadershipLayer(newInputs))) {
    _state.versions.leadership++;
  }
  if (!_layerEqual(journeyLayer(prev), journeyLayer(newInputs))) {
    _state.versions.journey++;
  }
  if (!_layerEqual(capabilitiesLayer(prev), capabilitiesLayer(newInputs))) {
    _state.versions.capabilities++;
  }

  _state.inputs = newInputs;
  _invalidate();
}

/**
 * Seed the workspace layer.
 * Called by WorkspaceContext whenever workspace/role/plan changes.
 */
export function setWorkspaceContext(ws) {
  if (!_layerEqual(_state.workspace, ws)) {
    _state.workspace = ws;
    _state.versions.workspace++;
    _invalidate();
  }
}

/**
 * Seed the Executive Memory™ layer.
 * Called asynchronously after memory is loaded from the database.
 */
export function setMemoryContext(memory) {
  if (!_layerEqual(_state.memory, memory)) {
    _state.memory = memory;
    _state.versions.memory++;
    _invalidate();
  }
}

/**
 * Force a full rebuild on next getContext() call.
 */
export function invalidateExecutiveContext() {
  _invalidate();
}

// ============================================================
// CONTEXT ACCESS — called by callAI()
// ============================================================

/**
 * Returns the immutable ExecutiveContext object.
 * Automatically detects changes in external caches (company context,
 * career intelligence) and rebuilds if needed.
 *
 * Target: <20ms cached, <100ms fresh build.
 */
export function getExecutiveContext() {
  // Check if external caches (company, career) changed since last build
  const companyPrompt = getCachedCompanyContext() || "";
  const careerPrompt = getCachedCareerIntelligence() || "";

  if (_state.context) {
    const companyChanged = companyPrompt !== _state.lastCompanyPrompt;
    const careerChanged = careerPrompt !== _state.lastCareerPrompt;
    if (!companyChanged && !careerChanged) {
      _state.cache.hitCount++;
      return _state.context;
    }
    if (companyChanged) _state.versions.company++;
    if (careerChanged) _state.versions.career++;
  }

  _state.lastCompanyPrompt = companyPrompt;
  _state.lastCareerPrompt = careerPrompt;
  _state.cache.missCount++;
  _build();
  return _state.context;
}

/**
 * Returns the assembled prompt string for injection into LLM calls.
 */
export function getExecutiveContextPrompt() {
  const ctx = getExecutiveContext();
  return ctx?.promptString || "";
}

// ============================================================
// DIAGNOSTICS — for Developer Console observability
// ============================================================

export function getExecutiveContextDiagnostics() {
  const ctx = _state.context;
  const v = _state.versions;
  const fullVersion = v.identity + v.workspace + v.career + v.company +
    v.leadership + v.journey + v.capabilities + v.memory;

  return {
    contextVersion: fullVersion,
    layerVersions: { ...v },
    cacheStatus: ctx ? "ready" : "empty",
    cacheAgeMs: _state.cache.builtAt ? Date.now() - _state.cache.builtAt : 0,
    lastRefresh: _state.cache.builtAt,
    buildTimeMs: _state.cache.buildTimeMs,
    promptLength: _state.cache.promptLength,
    memorySizeBytes: _state.cache.promptLength,
    knowledgeVersion: KNOWLEDGE_VERSION,
    platformVersion: PLATFORM_VERSION,
    workspace: _state.workspace?.activeWorkspace || "—",
    persona: ctx?.workspace?.currentPersona || "—",
    activeRoute: _state.workspace?.activeRoute || "—",
    hasIdentity: !!_state.inputs?.user,
    hasProfile: !!_state.inputs?.profile,
    hasMemory: !!_state.memory,
    cacheHits: _state.cache.hitCount,
    cacheMisses: _state.cache.missCount,
    hitRate: _state.cache.hitCount + _state.cache.missCount > 0
      ? Math.round((_state.cache.hitCount / (_state.cache.hitCount + _state.cache.missCount)) * 100)
      : 0,
  };
}

// ============================================================
// INTERNAL: BUILD
// ============================================================

function _invalidate() {
  _state.context = null;
}

function _build() {
  const t0 = typeof performance !== "undefined" ? performance.now() : Date.now();
  const inputs = _state.inputs;
  const ws = _state.workspace;
  const mem = _state.memory;

  // ── Extract layers ──
  const identity = inputs ? identityLayer(inputs) : null;
  const careerForm = inputs ? careerLayer(inputs) : null;
  const careerIntel = careerForm ? resolveCareerIntelligence(careerForm) : null;
  const leadership = inputs ? leadershipLayer(inputs) : null;
  const journey = inputs ? journeyLayer(inputs) : null;
  const capabilities = inputs ? capabilitiesLayer(inputs) : null;

  // Company context & Career intelligence come from external caches
  // (seeded by SubscriptionContext — async company fetch lives there)
  const companyPrompt = _state.lastCompanyPrompt || "";
  const careerPrompt = _state.lastCareerPrompt || "";

  // Workspace layer
  const workspace = ws ? {
    activeWorkspace: ws.activeWorkspace || "executive",
    activeModule: ws.activeRoute || null,
    activeRoute: ws.activeRoute || null,
    currentPersona: _derivePersona(ws.activeWorkspace, ws.activeRoute),
    role: ws.role || "user",
    plan: ws.plan || "free",
  } : null;

  // Executive Memory layer
  const memory = mem ? {
    goals: _safeParseArray(mem.goals_json),
    aspirations: _safeParseArray(mem.aspirations_json),
    achievements: _safeParseArray(mem.achievements_json),
    preferences: _safeParseObject(mem.preferences_json),
    executiveSummary: mem.executive_summary || "",
    coachingThemes: _safeParseArray(mem.notes_json),
  } : null;

  // ── Compute full version ──
  const v = _state.versions;
  const fullVersion = v.identity + v.workspace + v.career + v.company +
    v.leadership + v.journey + v.capabilities + v.memory;

  // ── Build prompt string ──
  const parts = [];

  parts.push(`EXECUTIVE CONTEXT ENGINE™ — Context v${fullVersion}`);
  parts.push(`Platform ${PLATFORM_VERSION} | Knowledge ${KNOWLEDGE_VERSION} | ${new Date().toISOString().split("T")[0]}`);
  parts.push("");

  // IDENTITY
  if (identity) {
    parts.push("── IDENTITY ──");
    if (identity.displayName) parts.push(`Executive: ${identity.displayName}`);
    if (identity.role) parts.push(`Platform Role: ${identity.role}`);
    parts.push(`Subscription: ${identity.subscription || "free"}`);
    if (identity.organization) parts.push(`Organization: ${identity.organization}`);
    parts.push("");
  }

  // WORKSPACE
  if (workspace) {
    parts.push("── WORKSPACE ──");
    parts.push(`Active Workspace: ${workspace.activeWorkspace}`);
    parts.push(`AI Persona: ${workspace.currentPersona}`);
    if (workspace.activeRoute) parts.push(`Current Module: ${workspace.activeRoute}`);
    parts.push("");
  }

  // CAREER INTELLIGENCE (from cache)
  if (careerPrompt) {
    parts.push(careerPrompt);
    parts.push("");
  }

  // COMPANY CONTEXT (from cache)
  if (companyPrompt) {
    parts.push(companyPrompt);
    parts.push("");
  }

  // LEADERSHIP DNA
  if (leadership) {
    parts.push("── LEADERSHIP DNA™ ──");
    if (leadership.leadershipStyle) parts.push(`Leadership Style: ${leadership.leadershipStyle}`);
    if (leadership.strengths?.length) parts.push(`Executive Strengths: ${leadership.strengths.join(", ")}`);
    if (leadership.growthAreas?.length) parts.push(`Growth Areas: ${leadership.growthAreas.join(", ")}`);
    parts.push(`Executive Readiness: ${leadership.executiveReadiness}/100`);
    parts.push(`Promotion Readiness: ${leadership.promotionReadiness}/100`);
    parts.push(`Executive Presence: ${leadership.executivePresence}/100`);
    parts.push(`Leadership Maturity: ${leadership.leadershipMaturity}/100`);
    parts.push(`Commercial Maturity: ${leadership.commercialMaturity}/100`);
    parts.push(`Communication Growth: ${leadership.communicationGrowth}/100`);
    parts.push(`Confidence: ${leadership.confidence}/100`);
    parts.push("");
  }

  // JOURNEY
  if (journey) {
    parts.push("── JOURNEY™ ──");
    if (journey.stage) parts.push(`Journey Stage: ${journey.stage}`);
    parts.push(`Journey Points: ${journey.points}`);
    parts.push(`Readiness Score: ${journey.readinessScore}/100`);
    if (journey.currentObjective) parts.push(`Current Objective: ${journey.currentObjective}`);
    parts.push("");
  }

  // EXECUTIVE MEMORY
  if (memory?.executiveSummary) {
    parts.push("── EXECUTIVE MEMORY™ ──");
    parts.push(memory.executiveSummary);
    parts.push("");
  }

  // CAPABILITIES
  if (capabilities) {
    parts.push("── CAPABILITIES ──");
    parts.push(`Plan: ${capabilities.plan}`);
    if (capabilities.aiCreditsRemaining !== null) {
      parts.push(`AI Credits Remaining: ${capabilities.aiCreditsRemaining}`);
    }
    parts.push("");
  }

  // PERSONALIZATION DIRECTIVE
  const personaName = workspace?.currentPersona || "executive_mentor";
  const wsName = workspace?.activeWorkspace || "executive";
  parts.push(
    `PERSONALIZATION DIRECTIVE: You are operating as the ${personaName} persona in the ${wsName} workspace. ` +
    `Use the Executive Context above to personalize every response. ` +
    `Reference the user's role, company, career goals, leadership profile, and journey stage. ` +
    `Adapt terminology, recommendations, and KPIs to the active workspace. ` +
    `Never re-ask for information already provided in this context. ` +
    `Every conversation begins with understanding. Every recommendation begins with context.`
  );

  const promptString = parts.join("\n");

  // ── Assemble immutable context object ──
  const context = {
    version: {
      full: fullVersion,
      identity: v.identity,
      workspace: v.workspace,
      career: v.career,
      company: v.company,
      leadership: v.leadership,
      journey: v.journey,
      capabilities: v.capabilities,
      memory: v.memory,
    },
    identity,
    workspace,
    careerIntelligence: careerIntel?.intelligence || null,
    companyContext: companyPrompt ? { provided: true } : null,
    leadershipDNA: leadership,
    journey,
    capabilities,
    executiveMemory: memory,
    runtime: {
      currentDate: new Date().toISOString().split("T")[0],
      platformVersion: PLATFORM_VERSION,
      knowledgeVersion: KNOWLEDGE_VERSION,
      conversationId: null,
    },
    promptString,
  };

  Object.freeze(context);
  _state.context = context;
  _state.cache.builtAt = Date.now();
  _state.cache.buildTimeMs = Math.round((typeof performance !== "undefined" ? performance.now() : Date.now()) - t0);
  _state.cache.promptLength = promptString.length;
}

// ============================================================
// LAYER EXTRACTORS — pull structured data from raw inputs
// ============================================================

function identityLayer(inputs) {
  if (!inputs) return null;
  const { user, profile, subscription } = inputs;
  return {
    userId: user?.id || "",
    displayName: profile?.display_name || profile?.full_name || user?.full_name || "",
    email: user?.email || "",
    role: user?.role || "",
    subscription: subscription?.planTier || profile?.subscription_plan || "free",
    organization: profile?.organization_id || "",
  };
}

function careerLayer(inputs) {
  if (!inputs?.profile) return null;
  const p = inputs.profile;
  return {
    target_company: p.target_company,
    target_role: p.target_role,
    preferred_industry: p.preferred_industry,
    target_country: p.target_country,
    expected_salary: p.expected_salary,
    salary_currency: p.salary_currency,
    work_preference: p.work_preference,
  };
}

function leadershipLayer(inputs) {
  if (!inputs?.profile) return null;
  const p = inputs.profile;
  return {
    leadershipStyle: p.ai_personality || "executive_mentor",
    strengths: p.strong_areas || [],
    growthAreas: p.weak_areas || [],
    executiveReadiness: p.cached_readiness_score || 0,
    promotionReadiness: p.promotion_readiness || 0,
    executivePresence: p.executive_presence || 0,
    leadershipMaturity: p.leadership_maturity || 0,
    commercialMaturity: p.commercial_maturity || 0,
    communicationGrowth: p.communication_growth || 0,
    confidence: p.confidence || 0,
  };
}

function journeyLayer(inputs) {
  if (!inputs?.profile) return null;
  const p = inputs.profile;
  return {
    stage: p.career_stage || "",
    points: p.cached_journey_points || 0,
    levelId: p.cached_journey_level_id || "",
    readinessScore: p.cached_readiness_score || 0,
    currentObjective: p.career_goals || "",
    growthPlan: p.growth_plan || "",
  };
}

function capabilitiesLayer(inputs) {
  if (!inputs) return null;
  const { subscription, entitlements } = inputs;
  return {
    plan: subscription?.planTier || "free",
    features: entitlements?.features || [],
    aiCreditsRemaining: entitlements?.aiCreditsRemaining ?? null,
  };
}

// ============================================================
// HELPERS
// ============================================================

function _derivePersona(workspace, route) {
  const wsPersonas = {
    executive: "strategic_leader",
    enterprise: "enterprise_advisor",
    operations: "operations_strategist",
    developer: "platform_engineer",
  };
  return wsPersonas[workspace] || "executive_mentor";
}

function _layerEqual(a, b) {
  if (a === b) return true;
  if (!a || !b) return false;
  const ka = Object.keys(a);
  const kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  return ka.every(k => JSON.stringify(a[k]) === JSON.stringify(b[k]));
}

function _safeParseArray(str) {
  if (!str) return [];
  try { return JSON.parse(str); } catch { return []; }
}

function _safeParseObject(str) {
  if (!str) return {};
  try { return JSON.parse(str); } catch { return {}; }
}
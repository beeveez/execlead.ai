/**
 * EXECLEAD.AI — AI Optimization Layer™
 * ============================================================
 * The centralized gateway for ALL AI requests on the platform.
 *
 * No module should communicate directly with the LLM.
 * Every request passes through:
 *
 *   Intent Router™ → Decision Engine™ → Knowledge Layer™ →
 *   Cache Layer → Context Builder → AI Invocation (only if required) →
 *   Response Optimizer → Usage Tracking
 *
 * Philosophy:
 *   Artificial Intelligence should enhance executive thinking —
 *   not power every button click.
 *   Smarter AI. Not More AI.
 *
 * Performance Targets:
 *   Database Response   < 100ms
 *   Cache Response      < 50ms
 *   Knowledge Response  < 150ms
 *   AI Response          Only when required
 *   Optimization Rate   ≥ 40% (stretch: 60%)
 */

import { base44 } from "@/api/base44Client";
import { deriveProvider } from "@/lib/aiOperations";
import { enforcePolicy } from "@/lib/aiPolicyEngine";
import { routeModel, trackRoutingEvent } from "@/lib/modelRouterEngine";
import { generateRequestId, createRequestTrace } from "@/lib/aiObservabilityEngine";

// ============================================================
// §1 — INTENT ROUTER™
// Classifies every request into an intent category.
// ============================================================

export const INTENT_CATEGORIES = {
  static_information:    { label: "Static Information",      aiRequired: false, source: "database" },
  database_query:        { label: "Database Query",          aiRequired: false, source: "database" },
  analytics:             { label: "Analytics",               aiRequired: false, source: "database" },
  dashboard:             { label: "Dashboard",               aiRequired: false, source: "database" },
  knowledge:             { label: "Knowledge Article",        aiRequired: false, source: "knowledge" },
  configuration:         { label: "Configuration",            aiRequired: false, source: "database" },
  navigation:            { label: "Navigation",              aiRequired: false, source: "knowledge" },
  company_intelligence:  { label: "Company Intelligence",    aiRequired: false, source: "cache" },
  leadership_journey:    { label: "Leadership Journey",       aiRequired: false, source: "database" },
  executive_coaching:    { label: "Executive Coaching",       aiRequired: true,  source: "ai" },
  resume_analysis:       { label: "Resume Analysis",          aiRequired: true,  source: "ai" },
  interview_simulation:  { label: "Interview Simulation",     aiRequired: true,  source: "ai" },
  executive_debate:      { label: "Executive Debate",         aiRequired: true,  source: "ai" },
  decision_intelligence: { label: "Decision Intelligence",    aiRequired: true,  source: "ai" },
  developer_assistance:  { label: "Developer Assistance",    aiRequired: true,  source: "ai" },
  enterprise_operations: { label: "Enterprise Operations",    aiRequired: false, source: "database" },
  billing:               { label: "Billing",                  aiRequired: false, source: "database" },
  platform_governance:   { label: "Platform Governance",     aiRequired: false, source: "database" },
  general_inquiry:       { label: "General Inquiry",          aiRequired: true,  source: "ai" },
};

// Pattern → intent mapping. Order matters — first match wins.
const INTENT_PATTERNS = [
  { intent: "navigation", patterns: ["where is", "how do i find", "where can i find", "navigate to", "take me to", "show me the", "open the"] },
  { intent: "dashboard", patterns: ["show my dashboard", "dashboard", "home page", "overview"] },
  { intent: "billing", patterns: ["what plan", "my plan", "subscription", "billing", "invoice", "payment", "how much does", "pricing", "cost"] },
  { intent: "leadership_journey", patterns: ["journey", "my progress", "leadership level", "readiness score", "executive readiness", "milestone"] },
  { intent: "company_intelligence", patterns: ["company", "organization profile", "competitor", "industry", "market"] },
  { intent: "resume_analysis", patterns: ["resume", "cv", "critique my", "analyze my resume", "improve my resume"] },
  { intent: "interview_simulation", patterns: ["interview", "mock interview", "practice interview", "simulate interview"] },
  { intent: "executive_debate", patterns: ["debate", "argue", "counterargument", "both sides", "play devil"] },
  { intent: "decision_intelligence", patterns: ["decision", "should i", "compare", "scenario", "trade-off", "tradeoff", "which option", "recommend the best"] },
  { intent: "executive_coaching", patterns: ["coach", "advise", "guidance", "how should i handle", "leadership advice", "mentor", "help me with"] },
  { intent: "developer_assistance", patterns: ["developer", "api key", "deployment", "migration", "system health", "audit log", "diagnostic"] },
  { intent: "enterprise_operations", patterns: ["enterprise", "organization management", "sso", "team dashboard", "succession"] },
  { intent: "platform_governance", patterns: ["platform health", "platform status", "governance", "compliance", "readiness gate", "feature flag"] },
  { intent: "configuration", patterns: ["settings", "configure", "preference", "appearance", "theme", "notification setting"] },
  { intent: "analytics", patterns: ["analytics", "metrics", "kpi", "statistics", "report", "trends"] },
  { intent: "knowledge", patterns: ["what is", "how does", "explain", "what are", "tell me about", "documentation", "article"] },
  { intent: "database_query", patterns: ["my profile", "my wallet", "my achievements", "my credentials", "my trust", "my identity", "my learning", "leaderboard", "my evidence"] },
];

/**
 * Intent Router™ — classifies a request string into an intent category.
 */
export function classifyIntent(requestText) {
  if (!requestText || typeof requestText !== "string") return "general_inquiry";
  const lower = requestText.toLowerCase().trim();
  for (const { intent, patterns } of INTENT_PATTERNS) {
    if (patterns.some((p) => lower.includes(p))) return intent;
  }
  return "general_inquiry";
}

// ============================================================
// §2 — DECISION ENGINE™
// Determines whether AI is actually required.
// ============================================================

/**
 * Decision Engine™ — maps an intent to a resolution source.
 *
 * Returns:
 *   { aiRequired, source, reason, estimatedCost, tokenEstimate }
 */
export function evaluateDecision(intent, opts = {}) {
  const category = INTENT_CATEGORIES[intent] || INTENT_CATEGORIES.general_inquiry;

  // Cache overrides — if a cache key exists, prefer cache over raw AI
  if (opts.cacheAvailable && category.source === "ai") {
    return {
      aiRequired: false,
      source: "cache",
      reason: `Cached response available for ${category.label}`,
      estimatedCost: 0,
      tokenEstimate: 0,
    };
  }

  // Knowledge override — knowledge-first strategy
  if (opts.knowledgeAvailable && !category.aiRequired) {
    return {
      aiRequired: false,
      source: "knowledge",
      reason: `Knowledge Pack available for ${category.label}`,
      estimatedCost: 0,
      tokenEstimate: 0,
    };
  }

  return {
    aiRequired: category.aiRequired,
    source: category.source,
    reason: category.aiRequired
      ? `${category.label} requires reasoning — AI invocation justified`
      : `${category.label} served by ${category.source} — no AI needed`,
    estimatedCost: category.aiRequired ? estimateAICost(intent, opts) : 0,
    tokenEstimate: category.aiRequired ? estimateTokens(opts.prompt || "") : 0,
  };
}

// ============================================================
// §3 — AI COST OPTIMIZER™
// Estimates cost before invocation.
// ============================================================

const COST_TIERS = {
  executive_coaching:    { tier: "low",    costPerCall: 0.004, creditsPerCall: 1 },
  general_inquiry:       { tier: "low",    costPerCall: 0.004, creditsPerCall: 1 },
  developer_assistance:  { tier: "low",    costPerCall: 0.005, creditsPerCall: 1 },
  resume_analysis:       { tier: "high",   costPerCall: 0.020, creditsPerCall: 5 },
  interview_simulation:  { tier: "medium", costPerCall: 0.012, creditsPerCall: 3 },
  executive_debate:      { tier: "medium", costPerCall: 0.012, creditsPerCall: 3 },
  decision_intelligence: { tier: "high",   costPerCall: 0.020, creditsPerCall: 5 },
};

export function estimateAICost(intent, opts = {}) {
  const tier = COST_TIERS[intent];
  if (!tier) return 0.004;
  const tokenEstimate = estimateTokens(opts.prompt || "");
  const tokenMultiplier = tokenEstimate > 2000 ? 1.5 : tokenEstimate > 1000 ? 1.2 : 1.0;
  return Math.round(tier.costPerCall * tokenMultiplier * 10000) / 10000;
}

export function estimateCredits(intent) {
  return (COST_TIERS[intent] || { creditsPerCall: 1 }).creditsPerCall;
}

export function estimateTokens(text) {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

// ============================================================
// §4 — CACHE LAYER™
// Intelligent caching with invalidation triggers.
// ============================================================

const CACHE_PREFIX = "aol_cache:";
const CACHE_STATS_KEY = "aol_cache_stats";

const CACHEABLE_INTENTS = [
  "resume_analysis",
  "company_intelligence",
  "knowledge",
  "leadership_journey",
  "enterprise_operations",
  "platform_governance",
  "developer_assistance",
  "analytics",
];

const CACHE_TTL_MS = {
  resume_analysis: 1000 * 60 * 60 * 24,
  company_intelligence: 1000 * 60 * 60 * 6,
  knowledge: 1000 * 60 * 60 * 24 * 7,
  leadership_journey: 1000 * 60 * 60,
  enterprise_operations: 1000 * 60 * 30,
  platform_governance: 1000 * 60 * 15,
  developer_assistance: 1000 * 60 * 60 * 24,
  analytics: 1000 * 60 * 10,
};

const INVALIDATION_TRIGGERS = {
  resume_updated: ["resume_analysis"],
  knowledge_updated: ["knowledge", "developer_assistance"],
  company_updated: ["company_intelligence"],
  leadership_dna_updated: ["leadership_journey"],
  platform_updated: ["platform_governance", "enterprise_operations", "analytics"],
};

export function generateCacheKey(intent, requestText, userId) {
  const normalized = (requestText || "").toLowerCase().trim().slice(0, 200);
  return `${CACHE_PREFIX}${userId || "anon"}:${intent}:${btoa(normalized).slice(0, 32)}`;
}

export function isCacheable(intent) {
  return CACHEABLE_INTENTS.includes(intent);
}

export function getCached(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() > parsed.expiresAt) {
      localStorage.removeItem(key);
      return null;
    }
    incrementCacheStat("hits");
    return parsed.value;
  } catch {
    return null;
  }
}

export function setCached(key, value, intent) {
  const ttl = CACHE_TTL_MS[intent] || 1000 * 60 * 60;
  try {
    localStorage.setItem(key, JSON.stringify({
      value,
      createdAt: Date.now(),
      expiresAt: Date.now() + ttl,
    }));
    incrementCacheStat("sets");
  } catch {}
}

export function invalidateCache(trigger) {
  const intents = INVALIDATION_TRIGGERS[trigger];
  if (!intents) return;
  try {
    const keys = Object.keys(localStorage).filter((k) => k.startsWith(CACHE_PREFIX));
    keys.forEach((key) => {
      intents.forEach((intent) => {
        if (key.includes(`:${intent}:`)) localStorage.removeItem(key);
      });
    });
  } catch {}
}

function incrementCacheStat(type) {
  try {
    const raw = localStorage.getItem(CACHE_STATS_KEY);
    const stats = raw ? JSON.parse(raw) : { hits: 0, sets: 0, misses: 0 };
    stats[type] = (stats[type] || 0) + 1;
    localStorage.setItem(CACHE_STATS_KEY, JSON.stringify(stats));
  } catch {}
}

export function getCacheStats() {
  try {
    const raw = localStorage.getItem(CACHE_STATS_KEY);
    return raw ? JSON.parse(raw) : { hits: 0, sets: 0, misses: 0 };
  } catch {
    return { hits: 0, sets: 0, misses: 0 };
  }
}

// ============================================================
// §5 — KNOWLEDGE LAYER™
// Checks Knowledge Pack Engine™ before invoking AI.
// ============================================================

/**
 * Knowledge Layer™ — checks if a knowledge pack can answer the request.
 * Delegates to the platform's knowledge base modules.
 */
export async function checkKnowledgePack(intent, requestText, workspace) {
  try {
    const { findModule } = await import("@/lib/execKnowledgeBase");
    const module = findModule(requestText);
    if (module) {
      return {
        available: true,
        content: module,
        source: "knowledge_pack",
      };
    }
  } catch {}

  if (intent === "navigation") {
    return {
      available: true,
      content: null,
      source: "navigation_engine",
    };
  }

  return { available: false };
}

// ============================================================
// §6 — CONTEXT BUILDER™
// Assembles workspace-aware context before AI invocation.
// ============================================================

export function buildContext(opts = {}) {
  const {
    workspace,
    module,
    user,
    profile,
    organization,
    leadershipDNA,
    company,
    knowledgePack,
    conversation,
    subscription,
    permissions,
  } = opts;

  const context = {};
  const parts = [];

  if (workspace) {
    context.workspace = workspace;
    parts.push(`WORKSPACE: ${workspace}`);
  }

  if (module) {
    context.module = module;
    parts.push(`MODULE: ${module}`);
  }

  if (user) {
    context.user = { id: user.id, name: user.full_name, email: user.email };
    parts.push(`USER: ${user.full_name || user.email}`);
  }

  if (profile) {
    context.profile = {
      title: profile.current_title || profile.job_title,
      targetRole: profile.target_role || profile.aspired_role,
    };
    parts.push(`ROLE: ${profile.current_title || profile.job_title || "Executive"}`);
  }

  if (leadershipDNA) {
    context.leadershipDNA = true;
    parts.push(`LEADERSHIP DNA: ${leadershipDNA.leadership_maturity || "Not assessed"}`);
  }

  if (company) {
    context.company = company.name || company;
    parts.push(`COMPANY: ${company.name || company}`);
  }

  if (organization) {
    context.organization = organization.name || organization;
    parts.push(`ORGANIZATION: ${organization.name || organization}`);
  }

  if (knowledgePack) {
    context.knowledgePack = true;
    parts.push(`KNOWLEDGE PACK: Available`);
  }

  if (conversation && conversation.length > 0) {
    context.conversation = conversation.slice(-5).map((m) => ({ role: m.role, content: m.content?.slice(0, 200) }));
    parts.push(`PREVIOUS CONVERSATION: ${conversation.length} messages`);
  }

  if (subscription) {
    context.subscription = subscription.plan || "free";
    parts.push(`SUBSCRIPTION: ${subscription.plan || "free"}`);
  }

  return {
    assembled: parts.length > 0,
    contextString: parts.join("\n"),
    context,
  };
}

// ============================================================
// §7 — RESPONSE OPTIMIZER™
// Normalizes AI output and adds references.
// ============================================================

export function optimizeResponse(rawResponse, intent, opts = {}) {
  if (!rawResponse) return rawResponse;

  const result = typeof rawResponse === "string"
    ? { content: rawResponse }
    : { ...rawResponse };

  result._optimization = {
    intent,
    source: "ai",
    optimizedAt: new Date().toISOString(),
    references: deriveReferences(intent, opts),
    relatedModules: deriveRelatedModules(intent),
    suggestedActions: deriveSuggestedActions(intent, opts),
    recommendedLearning: deriveRecommendedLearning(intent),
  };

  return result;
}

function deriveReferences(intent, opts) {
  const refs = [];
  if (intent === "executive_coaching") refs.push("Executive Coach™", "Leadership DNA™");
  if (intent === "decision_intelligence") refs.push("Executive Decision Intelligence™", "Executive Digital Twin™");
  if (intent === "resume_analysis") refs.push("Resume Intelligence™", "Career Studio™");
  if (intent === "leadership_journey") refs.push("Executive Journey™", "Executive Readiness™");
  return refs;
}

function deriveRelatedModules(intent) {
  const map = {
    executive_coaching: ["/coach", "/leadership-dna"],
    decision_intelligence: ["/decision-intelligence", "/digital-twin"],
    resume_analysis: ["/resume", "/career-studio"],
    interview_simulation: ["/simulator"],
    executive_debate: ["/debate"],
  };
  return map[intent] || [];
}

function deriveSuggestedActions(intent, opts) {
  const map = {
    executive_coaching: ["Review Leadership DNA™", "Complete a Daily Challenge"],
    decision_intelligence: ["Run a scenario simulation", "Review career trajectory"],
    resume_analysis: ["Upload updated resume", "Review skill gaps"],
    interview_simulation: ["Complete another simulation", "Review performance metrics"],
  };
  return map[intent] || [];
}

function deriveRecommendedLearning(intent) {
  const map = {
    executive_coaching: ["Leadership Communication", "Emotional Intelligence"],
    decision_intelligence: ["Strategic Decision Making", "Risk Assessment"],
    resume_analysis: ["Executive Resume Writing", "Personal Branding"],
  };
  return map[intent] || [];
}

// ============================================================
// §8 — USAGE TRACKING™
// Records every optimization decision.
// ============================================================

async function trackOptimization(data) {
  try {
    await base44.entities.AIOptimizationEvent.create({
      request_text: (data.requestText || "").slice(0, 500),
      intent: data.intent,
      source: data.source,
      workspace: data.workspace || null,
      module: data.module || null,
      user_id: data.userId || null,
      user_name: data.userName || null,
      ai_required: data.aiRequired || false,
      cache_hit: data.cacheHit || false,
      knowledge_hit: data.knowledgeHit || false,
      database_hit: data.databaseHit || false,
      ai_invoked: data.aiInvoked || false,
      estimated_cost: data.estimatedCost || 0,
      estimated_cost_saved: data.estimatedCostSaved || 0,
      response_time_ms: data.responseTimeMs || 0,
      model: data.model || null,
      provider: data.provider || null,
      status: data.status || "optimized",
      optimization_reason: data.reason || null,
      context_assembled: data.contextAssembled || false,
      cache_key: data.cacheKey || null,
      token_estimate: data.tokenEstimate || 0,
      credits_saved: data.creditsSaved || 0,
    });
  } catch {}
}

// ============================================================
// §9 — MAIN GATEWAY: optimizeAI()
// The single entry point for all AI requests.
// ============================================================

/**
 * AI Optimization Layer™ — main gateway.
 *
 * @param {string} requestText - The user's request
 * @param {object} opts - { workspace, module, user, profile, invokeAI, ... }
 * @returns {Promise<{ source, content, intent, aiRequired, responseTimeMs, ... }>}
 */
export async function optimizeAI(requestText, opts = {}) {
  const startedAt = Date.now();
  const userId = opts.user?.id || null;
  const userName = opts.user?.full_name || opts.user?.email || null;

  // Step 1: Intent Classification
  const intent = classifyIntent(requestText);
  const category = INTENT_CATEGORIES[intent];

  // Step 2: Knowledge-First Check
  let knowledgeResult = null;
  if (!category.aiRequired) {
    knowledgeResult = await checkKnowledgePack(intent, requestText, opts.workspace);
  }

  // Step 3: Cache Check (for cacheable intents)
  let cacheKey = null;
  let cachedValue = null;
  if (isCacheable(intent)) {
    cacheKey = generateCacheKey(intent, requestText, userId);
    cachedValue = getCached(cacheKey);
  }

  // Step 4: Decision Engine
  const decision = evaluateDecision(intent, {
    cacheAvailable: !!cachedValue,
    knowledgeAvailable: !!knowledgeResult?.available,
    prompt: opts.prompt || requestText,
  });

  const responseTimeMs = Date.now() - startedAt;
  const estimatedCostSaved = category.aiRequired ? 0 : estimateAICost(intent, { prompt: requestText });
  const creditsSaved = category.aiRequired ? 0 : estimateCredits(intent);

  // Step 5: Route to appropriate source

  // Cache hit — serve immediately
  if (cachedValue) {
    await trackOptimization({
      requestText, intent, source: "cache", workspace: opts.workspace, module: opts.module,
      userId, userName, aiRequired: false, cacheHit: true, aiInvoked: false,
      estimatedCost: 0, estimatedCostSaved, responseTimeMs,
      status: "cache_served", reason: decision.reason, cacheKey, creditsSaved,
      tokenEstimate: estimateTokens(requestText),
    });
    return {
      source: "cache",
      content: cachedValue,
      intent,
      aiRequired: false,
      cacheHit: true,
      responseTimeMs,
      estimatedCostSaved,
      creditsSaved,
    };
  }

  // Knowledge hit — serve structured content
  if (knowledgeResult?.available && !category.aiRequired) {
    await trackOptimization({
      requestText, intent, source: "knowledge", workspace: opts.workspace, module: opts.module,
      userId, userName, aiRequired: false, knowledgeHit: true, aiInvoked: false,
      estimatedCost: 0, estimatedCostSaved, responseTimeMs,
      status: "knowledge_served", reason: decision.reason, creditsSaved,
      tokenEstimate: estimateTokens(requestText),
    });
    return {
      source: "knowledge",
      content: knowledgeResult.content,
      intent,
      aiRequired: false,
      knowledgeHit: true,
      responseTimeMs,
      estimatedCostSaved,
      creditsSaved,
    };
  }

  // Database / static — no AI needed
  if (!category.aiRequired) {
    await trackOptimization({
      requestText, intent, source: "database", workspace: opts.workspace, module: opts.module,
      userId, userName, aiRequired: false, databaseHit: true, aiInvoked: false,
      estimatedCost: 0, estimatedCostSaved, responseTimeMs,
      status: "database_served", reason: decision.reason, creditsSaved,
      tokenEstimate: estimateTokens(requestText),
    });
    return {
      source: "database",
      content: null,
      intent,
      aiRequired: false,
      databaseHit: true,
      responseTimeMs,
      estimatedCostSaved,
      creditsSaved,
    };
  }

  // Step 6a: Build workspace-aware context
  const contextResult = buildContext(opts);
  const fullPrompt = contextResult.assembled
    ? `${contextResult.contextString}\n\n---\n\n${opts.prompt || requestText}`
    : (opts.prompt || requestText);

  const estimatedCost = estimateAICost(intent, { prompt: fullPrompt });

  const requestId = generateRequestId();
  const policyStart = Date.now();

  // Step 6b: AI Policy Engine™ — enforce all policies before AI invocation
  const policyDecision = await enforcePolicy(requestText, {
    intent,
    plan: opts.plan || opts.subscription?.plan,
    workspace: opts.workspace,
    user: opts.user,
    organization: opts.organization,
    trustLevel: opts.trustLevel,
    estimatedCost,
    module: opts.module,
    feature: opts.feature,
    featureAllowed: opts.featureAllowed,
    contextSize: estimateTokens(fullPrompt),
    currentDailySpend: opts.currentDailySpend,
    currentMonthlySpend: opts.currentMonthlySpend,
  });

  // If policy blocks the request, return the upgrade message — no AI invoked
  if (!policyDecision.approved) {
    const blockedResponseTime = Date.now() - startedAt;
    await trackOptimization({
      requestText, intent, source: "ai", workspace: opts.workspace, module: opts.module,
      userId, userName, aiRequired: true, aiInvoked: false,
      estimatedCost: 0, estimatedCostSaved: estimatedCost, responseTimeMs: blockedResponseTime,
      model: policyDecision.model, provider: deriveProvider(policyDecision.model),
      status: "error",
      reason: `Policy blocked: ${policyDecision.violationType} — ${policyDecision.upgradeMessage}`,
      contextAssembled: contextResult.assembled,
      tokenEstimate: estimateTokens(fullPrompt),
      creditsSaved: estimateCredits(intent),
    });
    createRequestTrace({
      request_id: requestId,
      request_text: (requestText || "").slice(0, 500),
      intent,
      user_id: userId,
      user_name: userName,
      workspace: opts.workspace,
      module: opts.module,
      source: "policy_blocked",
      ai_required: true,
      ai_invoked: false,
      policy_blocked: true,
      policy_violation_type: policyDecision.violationType,
      optimization_time_ms: policyStart - startedAt,
      policy_time_ms: policyDecision.evaluationTimeMs || 0,
      total_response_time_ms: blockedResponseTime,
      credits_saved: estimateCredits(intent),
      response_status: "blocked",
      subscription: opts.plan || opts.subscription?.plan,
    });

    return {
      source: "policy_blocked",
      content: policyDecision.upgradeMessage,
      intent,
      aiRequired: true,
      aiInvoked: false,
      policyBlocked: true,
      policyDecision,
      responseTimeMs: blockedResponseTime,
      estimatedCostSaved: estimatedCost,
      creditsSaved: estimateCredits(intent),
    };
  }

  const routingStart = Date.now();

  // Step 7: Model Router™ — select the best model, with automatic fallback
  const routingDecision = routeModel({
    intent,
    contextSize: estimateTokens(fullPrompt),
    subscription: opts.plan || opts.subscription?.plan,
    workspace: opts.workspace,
    webSearchRequired: opts.aiOptions?.add_context_from_internet || false,
    streamingPreferred: opts.streaming || false,
  });

  const routingEnd = Date.now();
  const providerStart = Date.now();

  const modelChain = [routingDecision.selectedModel, ...routingDecision.fallbackChain];
  let aiResponse = null;
  let aiError = null;
  let actualModel = routingDecision.selectedModel;
  let fallbackFrom = null;
  let retryCount = 0;

  for (let i = 0; i < modelChain.length; i++) {
    const tryModel = modelChain[i];
    try {
      if (opts.invokeAI) {
        aiResponse = await opts.invokeAI({ prompt: fullPrompt, model: tryModel, ...opts.aiOptions });
      } else {
        aiResponse = await base44.integrations.Core.InvokeLLM({
          prompt: fullPrompt,
          model: tryModel,
          ...opts.aiOptions,
        });
      }
      actualModel = tryModel;
      if (i > 0) { fallbackFrom = modelChain[0]; retryCount = i; }
      aiError = null;
      break;
    } catch (err) {
      aiError = err;
      // Try next model in fallback chain
    }
  }

  const aiResponseTime = Date.now() - startedAt;

  // Track routing event with actual performance data
  trackRoutingEvent(routingDecision, {
    intent,
    success: !aiError,
    latencyMs: aiResponseTime,
    cost: routingDecision.estimatedCost,
    tokenInput: estimateTokens(fullPrompt),
    fallbackFrom,
    status: fallbackFrom ? "fallback_used" : (aiError ? "failed" : "success"),
    retryCount,
    userId, userName,
    workspace: opts.workspace,
    subscription: opts.plan || opts.subscription?.plan,
    module: opts.module,
    errorMessage: aiError?.message,
  });

  // Cache AI response if cacheable
  if (aiResponse && isCacheable(intent) && cacheKey) {
    setCached(cacheKey, aiResponse, intent);
  }

  // Optimize response
  const optimizedResponse = aiResponse ? optimizeResponse(aiResponse, intent, opts) : null;

  await trackOptimization({
    requestText, intent, source: "ai", workspace: opts.workspace, module: opts.module,
    userId, userName, aiRequired: true, aiInvoked: true,
    estimatedCost, estimatedCostSaved: 0, responseTimeMs: aiResponseTime,
    model: actualModel, provider: routingDecision.selectedProvider,
    status: aiError ? "error" : "ai_served",
    reason: decision.reason, contextAssembled: contextResult.assembled,
    cacheKey, tokenEstimate: estimateTokens(fullPrompt), creditsSaved: 0,
  });

  const providerEnd = Date.now();

  createRequestTrace({
    request_id: requestId,
    request_text: (requestText || "").slice(0, 500),
    intent,
    user_id: userId,
    user_name: userName,
    workspace: opts.workspace,
    module: opts.module,
    source: "ai",
    ai_required: true,
    ai_invoked: true,
    selected_model: actualModel,
    selected_provider: routingDecision.selectedProvider,
    tier: routingDecision.tier,
    fallback_used: !!fallbackFrom,
    fallback_from: fallbackFrom,
    retry_count: retryCount,
    optimization_time_ms: policyStart - startedAt,
    policy_time_ms: policyDecision.evaluationTimeMs || 0,
    routing_time_ms: routingEnd - routingStart,
    provider_time_ms: providerEnd - providerStart,
    total_response_time_ms: aiResponseTime,
    estimated_cost: estimatedCost,
    actual_cost: routingDecision.estimatedCost,
    token_input: estimateTokens(fullPrompt),
    response_status: aiError ? "failed" : (fallbackFrom ? "fallback" : "success"),
    error_message: aiError?.message,
    subscription: opts.plan || opts.subscription?.plan,
  });

  if (aiError) throw aiError;

  return {
    source: "ai",
    content: optimizedResponse,
    intent,
    aiRequired: true,
    aiInvoked: true,
    contextAssembled: contextResult.assembled,
    responseTimeMs: aiResponseTime,
    estimatedCost,
    estimatedCostSaved: 0,
    creditsSaved: 0,
    routingDecision,
  };
}

// ============================================================
// §10 — ANALYTICS AGGREGATION
// ============================================================

/**
 * Fetches aggregate optimization analytics from stored events.
 */
export async function getOptimizationAnalytics(limit = 500) {
  try {
    const events = await base44.entities.AIOptimizationEvent.list("-created_date", limit);

    const total = events.length;
    const aiInvoked = events.filter((e) => e.ai_invoked).length;
    const cacheHits = events.filter((e) => e.cache_hit).length;
    const knowledgeHits = events.filter((e) => e.knowledge_hit).length;
    const databaseHits = events.filter((e) => e.database_hit).length;
    const optimized = total - aiInvoked;

    const optimizationRate = total > 0 ? Math.round((optimized / total) * 100) : 0;
    const totalCostSaved = events.reduce((s, e) => s + (e.estimated_cost_saved || 0), 0);
    const totalCreditsSaved = events.reduce((s, e) => s + (e.credits_saved || 0), 0);
    const totalAICost = events.filter((e) => e.ai_invoked).reduce((s, e) => s + (e.estimated_cost || 0), 0);
    const avgResponseTime = total > 0
      ? Math.round(events.reduce((s, e) => s + (e.response_time_ms || 0), 0) / total)
      : 0;

    const intentBreakdown = {};
    events.forEach((e) => {
      if (!intentBreakdown[e.intent]) {
        intentBreakdown[e.intent] = { total: 0, aiInvoked: 0, optimized: 0 };
      }
      intentBreakdown[e.intent].total++;
      if (e.ai_invoked) intentBreakdown[e.intent].aiInvoked++;
      else intentBreakdown[e.intent].optimized++;
    });

    const sourceBreakdown = {
      database: databaseHits,
      cache: cacheHits,
      knowledge: knowledgeHits,
      ai: aiInvoked,
    };

    return {
      total,
      aiInvoked,
      optimized,
      cacheHits,
      knowledgeHits,
      databaseHits,
      optimizationRate,
      totalCostSaved: Math.round(totalCostSaved * 10000) / 10000,
      totalCreditsSaved,
      totalAICost: Math.round(totalAICost * 10000) / 10000,
      avgResponseTime,
      avgAICost: aiInvoked > 0 ? Math.round((totalAICost / aiInvoked) * 10000) / 10000 : 0,
      intentBreakdown,
      sourceBreakdown,
      cacheStats: getCacheStats(),
    };
  } catch {
    return {
      total: 0, aiInvoked: 0, optimized: 0, cacheHits: 0, knowledgeHits: 0,
      databaseHits: 0, optimizationRate: 0, totalCostSaved: 0, totalCreditsSaved: 0,
      totalAICost: 0, avgResponseTime: 0, avgAICost: 0,
      intentBreakdown: {}, sourceBreakdown: { database: 0, cache: 0, knowledge: 0, ai: 0 },
      cacheStats: { hits: 0, sets: 0, misses: 0 },
    };
  }
}

// ============================================================
// §11 — RULE ENGINE
// Deterministic rules for common queries.
// ============================================================

export const RULE_ENGINE = {
  "what plan am i on": { source: "billing_service", aiRequired: false },
  "show my leadership dna": { source: "leadership_dna_engine", aiRequired: false },
  "what is my platform readiness": { source: "platform_state_manager", aiRequired: false },
  "show my dashboard": { source: "dashboard_engine", aiRequired: false },
  "my trust score": { source: "trust_engine", aiRequired: false },
  "my wallet": { source: "wallet_engine", aiRequired: false },
  "my achievements": { source: "achievement_database", aiRequired: false },
  "my credentials": { source: "credential_engine", aiRequired: false },
  "my identity status": { source: "identity_engine", aiRequired: false },
  "my learning progress": { source: "learning_database", aiRequired: false },
  "my billing": { source: "billing_database", aiRequired: false },
  "platform metrics": { source: "metrics_engine", aiRequired: false },
};

export function checkRuleEngine(requestText) {
  if (!requestText) return null;
  const lower = requestText.toLowerCase().trim();
  for (const [pattern, rule] of Object.entries(RULE_ENGINE)) {
    if (lower.includes(pattern)) return rule;
  }
  return null;
}

// ============================================================
// EXPORTS SUMMARY
// ============================================================

export const AI_OPTIMIZATION_LAYER_VERSION = "1.0";
export const PERFORMANCE_TARGETS = {
  database: 100,
  cache: 50,
  knowledge: 150,
  optimizationRateMin: 40,
  optimizationRateStretch: 60,
};
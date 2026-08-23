import { base44 } from "@/api/base44Client";
import { getExecutiveContextPrompt, getExecutiveContext } from "@/lib/executiveContextEngine";
import { deriveProvider } from "@/lib/aiOperations";
import { routeModel, trackRoutingEvent } from "@/lib/modelRouterEngine";
import { getCachedAIResponse, cacheAIResponse, recordMetric } from "@/lib/creditOptimizer/index.js";
import { logStage } from "@/lib/execReliabilityEngine";

// Module → intent mapping for Model Router™ routing
const MODULE_INTENT_MAP = {
  coach: "executive_coaching",
  simulator: "interview_simulation",
  challenge: "executive_coaching",
  debate: "executive_debate",
  academy: "knowledge",
  companies: "company_intelligence",
  career: "resume_analysis",
  metrics: "analytics",
  resume: "resume_analysis",
  council: "executive_council",
  legacy: "executive_coaching",
  other: "general_inquiry",
};

const CONTEXT_FREE_CATEGORIES = new Set([
  "Strategic Comparison",
  "General Conversation",
  "Product Question",
  "Company Fact",
  "Educational Question",
]);
const CONTEXT_FREE_INTENTS = new Set(["general_inquiry", "knowledge", "company_intelligence", "product_question"]);

function shouldInjectExecutiveContext(module, responseCategory, contextPolicy, intent) {
  if (contextPolicy === "none") return false;
  if (contextPolicy === "full") return true;
  if (CONTEXT_FREE_CATEGORIES.has(responseCategory)) return false;
  if (CONTEXT_FREE_INTENTS.has(intent || MODULE_INTENT_MAP[module])) return false;
  if (module === "exec_quality_review" || module === "exec_quality_revision") return false;
  return true;
}

/**
 * AI call wrapper with automatic usage tracking.
 * Replaces base44.integrations.Core.InvokeLLM to log token/cost estimates,
 * response latency, provider, and success/error status — powering the
 * AI Operations Center. Errors are logged then re-thrown so callers
 * still see the original failure.
 */
const classifyError = (err) => {
  const msg = (err?.message || "").toLowerCase();
  if (msg.includes("timeout") || msg.includes("timed out")) return { status: "timeout", error_type: "timeout" };
  if (msg.includes("rate limit") || msg.includes("429")) return { status: "rate_limited", error_type: "rate_limit" };
  if (msg.includes("network") || msg.includes("fetch") || msg.includes("econnreset")) return { status: "network_error", error_type: "network" };
  if (msg.includes("validation") || msg.includes("invalid") || msg.includes("schema")) return { status: "validation_error", error_type: "validation" };
  return { status: "error", error_type: "provider_error" };
};

export const callAI = async (module, { prompt, intent, correlationId, responseCategory, contextPolicy = "auto", ...options }) => {
  // Executive context is request-aware. Public, product, general, educational,
  // and strategic-comparison requests never receive private runtime context.
  let contextPrompt = "";
  let ctx = null;
  if (shouldInjectExecutiveContext(module, responseCategory, contextPolicy, intent)) {
    try {
      contextPrompt = getExecutiveContextPrompt();
      ctx = getExecutiveContext();
      if (correlationId) logStage({ correlationId, stage: "executive_context", status: "success" });
    } catch (e) {
      if (correlationId) logStage({ correlationId, stage: "executive_context", status: "failure", error: e?.message || String(e) });
      console.error("[callAI] Executive Context Engine threw — proceeding without context:", e);
    }
  }
  if (!ctx) {
    try {
      ctx = getExecutiveContext();
    } catch {
      ctx = null;
    }
  }
  const fullPrompt = contextPrompt ? `${contextPrompt}\n\n${prompt}` : prompt;

  // ── Model Router™ — every request passes through the router ──
  const routingIntent = intent || MODULE_INTENT_MAP[module] || "general_inquiry";
  const subscription = ctx?.identity?.subscription || "free";
  let routingDecision;
  try {
    routingDecision = routeModel({
      intent: routingIntent,
      contextSize: Math.ceil(fullPrompt.length / 4),
      webSearchRequired: options.add_context_from_internet || false,
      streamingPreferred: false,
      subscription,
    });
    if (correlationId) logStage({ correlationId, stage: "model_routing", status: "success", extra: { model: routingDecision.selectedModel, provider: routingDecision.selectedProvider } });
  } catch (e) {
    if (correlationId) logStage({ correlationId, stage: "model_routing", status: "failure", error: e?.message || String(e) });
    throw e;
  }

  const modelChain = [routingDecision.selectedModel, ...routingDecision.fallbackChain];
  const startedAt = Date.now();

  // ── Credit Optimizer™ — AI Deduplication Cache ──
  // If this exact prompt + model was already processed, return the cached
  // response. Zero AI credits consumed on cache hit.
  recordMetric("aiCalls.total");
  const cachedResponse = getCachedAIResponse(fullPrompt, routingDecision.selectedModel);
  if (cachedResponse) {
    recordMetric("aiCalls.cached");
    if (correlationId) logStage({ correlationId, stage: "ai_call", status: "success", latencyMs: 0, extra: { cached: true, model: routingDecision.selectedModel, provider: routingDecision.selectedProvider } });
    return cachedResponse;
  }

  let res = null;
  let actualModel = routingDecision.selectedModel;
  let fallbackFrom = null;
  let retryCount = 0;
  let lastError = null;

  const attemptChain = async () => {
    for (let i = 0; i < modelChain.length; i++) {
      const tryModel = modelChain[i];
      try {
        res = await base44.integrations.Core.InvokeLLM({ prompt: fullPrompt, model: tryModel, ...options });
        actualModel = tryModel;
        if (i > 0) { fallbackFrom = modelChain[0]; retryCount = i; }
        lastError = null;
        return true;
      } catch (err) {
        lastError = err;
      }
    }
    return false;
  };

  await attemptChain();

  // ── Retry once for transient provider errors (timeout / network / rate limit) ──
  // Per EXEC™ Reliability spec: retry transient errors automatically before
  // surfacing a failure. Persistent/validation errors fall through.
  if (lastError) {
    const { error_type } = classifyError(lastError);
    if (error_type === "timeout" || error_type === "network" || error_type === "rate_limit") {
      retryCount++;
      lastError = null;
      await attemptChain();
    }
  }

  const latency = Date.now() - startedAt;
  const inputTokens = Math.ceil(fullPrompt.length / 4);

  // Failed after all fallbacks
  if (lastError) {
    const { status, error_type } = classifyError(lastError);
    if (correlationId) logStage({ correlationId, stage: "ai_call", status: "failure", latencyMs: latency, error: lastError?.message || String(lastError), extra: { model: actualModel, provider: deriveProvider(actualModel), error_type } });
    trackRoutingEvent(routingDecision, {
      intent: routingIntent, success: false, latencyMs: latency,
      cost: routingDecision.estimatedCost, tokenInput: inputTokens,
      fallbackFrom, status: "failed", retryCount, module,
      errorMessage: lastError.message,
    });
    try {
      await base44.entities.UsageLog.create({
        module, tokens_estimated: inputTokens, input_tokens: inputTokens,
        output_tokens: 0, cost_estimated: 0, model: actualModel,
        provider: deriveProvider(actualModel), response_time_ms: latency,
        status, error_type,
      });
    } catch (e) {}
    throw lastError;
  }

  // Success
  // ── Credit Optimizer™ — Cache AI Response for future deduplication ──
  cacheAIResponse(fullPrompt, actualModel, res);

  const responseLength = typeof res === "string" ? res.length : JSON.stringify(res || {}).length;
  const outputTokens = Math.ceil(responseLength / 4);
  const tokensEstimate = inputTokens + outputTokens;
  const costEstimate = (tokensEstimate / 1000) * 0.002;

  if (correlationId) logStage({ correlationId, stage: "ai_call", status: "success", latencyMs: latency, extra: { model: actualModel, provider: deriveProvider(actualModel), fallbackFrom, retryCount } });
  trackRoutingEvent(routingDecision, {
    intent: routingIntent, success: true, latencyMs: latency,
    cost: costEstimate, tokenInput: inputTokens, tokenOutput: outputTokens,
    fallbackFrom, status: fallbackFrom ? "fallback_used" : "success",
    retryCount, module,
  });

  try {
    await base44.entities.UsageLog.create({
      module, tokens_estimated: tokensEstimate, input_tokens: inputTokens,
      output_tokens: outputTokens, cost_estimated: costEstimate,
      model: actualModel, provider: deriveProvider(actualModel),
      response_time_ms: latency, status: "success",
    });
  } catch (e) {}

  return res;
};

export const awardXP = async (profile, amount) => {
  if (!profile) return;
  try {
    await base44.entities.UserProfile.update(profile.id, {
      xp_points: (profile.xp_points || 0) + amount,
    });
  } catch (e) {}
};
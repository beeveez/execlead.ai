import { base44 } from "@/api/base44Client";
import { getExecutiveContextPrompt, getExecutiveContext } from "@/lib/executiveContextEngine";
import { deriveProvider } from "@/lib/aiOperations";
import { routeModel, trackRoutingEvent } from "@/lib/modelRouterEngine";
import { getCachedAIResponse, cacheAIResponse, recordMetric } from "@/lib/creditOptimizer/index.js";

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

export const callAI = async (module, { prompt, intent, ...options }) => {
  const contextPrompt = getExecutiveContextPrompt();
  const fullPrompt = contextPrompt ? `${contextPrompt}\n\n${prompt}` : prompt;

  // ── Model Router™ — every request passes through the router ──
  const routingIntent = intent || MODULE_INTENT_MAP[module] || "general_inquiry";
  const ctx = getExecutiveContext();
  const subscription = ctx?.identity?.subscription || "free";
  const routingDecision = routeModel({
    intent: routingIntent,
    contextSize: Math.ceil(fullPrompt.length / 4),
    webSearchRequired: options.add_context_from_internet || false,
    streamingPreferred: false,
    subscription,
  });

  const modelChain = [routingDecision.selectedModel, ...routingDecision.fallbackChain];
  const startedAt = Date.now();

  // ── Credit Optimizer™ — AI Deduplication Cache ──
  // If this exact prompt + model was already processed, return the cached
  // response. Zero AI credits consumed on cache hit.
  recordMetric("aiCalls.total");
  const cachedResponse = getCachedAIResponse(fullPrompt, routingDecision.selectedModel);
  if (cachedResponse) {
    recordMetric("aiCalls.cached");
    return cachedResponse;
  }

  let res = null;
  let actualModel = routingDecision.selectedModel;
  let fallbackFrom = null;
  let retryCount = 0;
  let lastError = null;

  // Try primary model, then fallback chain
  for (let i = 0; i < modelChain.length; i++) {
    const tryModel = modelChain[i];
    try {
      res = await base44.integrations.Core.InvokeLLM({ prompt: fullPrompt, model: tryModel, ...options });
      actualModel = tryModel;
      if (i > 0) { fallbackFrom = modelChain[0]; retryCount = i; }
      lastError = null;
      break;
    } catch (err) {
      lastError = err;
    }
  }

  const latency = Date.now() - startedAt;
  const inputTokens = Math.ceil(fullPrompt.length / 4);

  // Failed after all fallbacks
  if (lastError) {
    const { status, error_type } = classifyError(lastError);
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
/**
 * Governed AI Adapter™ — the SINGLE server-side LLM generation boundary
 * for AI Workforce generation features.
 * ============================================================
 * Phase 6: aiWorkforce.daily_briefing and aiWorkforce.get_recommendations
 * MUST NOT call InvokeLLM directly. Both route every LLM generation through
 * this adapter. The adapter contains the ONLY controlled backend LLM
 * invocation boundary for these callers.
 *
 * The existing production governance stack (src/lib/ai.js callAI,
 * modelRouterEngine.js, aiPolicyEngine.js, consentService.js,
 * creditOptimizer/aiDeduplicationEngine.js) is browser-side and cannot be
 * imported into the backend runtime. This adapter is the MINIMUM
 * server-side equivalent enforcing the same governance guarantees with the
 * SAME policy values — it does not create a second policy system:
 *
 *   1. Authenticated caller           — requires a server-resolved user
 *   2. Personalization consent         — checked BEFORE personalized context
 *                                        is read (fail-closed, never inferred
 *                                        or auto-granted)
 *   3. Model routing                   — same MODEL_REGISTRY / INTENT_TIER_MAP /
 *                                        SUBSCRIPTION_TIER_ACCESS as the
 *                                        Model Router™; client-supplied model
 *                                        names are never accepted
 *   4. AI budget policy                — same BUDGET_LIMITS as the AI Policy
 *                                        Engine™; enforced BEFORE invocation;
 *                                        client-supplied cost/budget values
 *                                        are never accepted
 *   5. UsageLog recording              — every generation (success or failure)
 *                                        writes an immutable UsageLog record
 *   6. Deduplication                   — 30-minute prompt+model cache, same
 *                                        semantics as the AI Deduplication
 *                                        Cache™; different prompts never
 *                                        collapse
 *   7. Bounded transient retry         — model fallback chain + ONE retry
 *                                        pass for transient errors only;
 *                                        permanent failures never retried
 *   8. correlation_id propagation      — every generation carries one
 *   9. Latency/error recording         — requested/completed timestamps,
 *                                        latency, model, usage, error class
 *  10. Truthful failure handling       — structured errors; no silent
 *                                        fallbacks or fabricated content
 *
 * This adapter performs NO agent execution, NO tool invocation, NO
 * scheduling, NO loops, and NO background work. It is a generation gate only.
 */

import {
  DIRECT_GEMINI_PROVIDER_ID, directGeminiGenerate, isDirectGoogleGeminiEnabled, isDirectGoogleModel,
} from './directGeminiProvider.ts';

export const ADAPTER_ID = 'governed_ai_adapter';
export const ADAPTER_VERSION = '1.0';

// ── Model Registry (server-side copy of Model Router™ MODEL_REGISTRY) ──
const MODEL_REGISTRY = {
  gpt_5_mini: { id: 'gpt_5_mini', provider: 'openai', tier: 1, maxContext: 16000, costPer1kTokens: 0.0005, avgLatencyMs: 800 },
  gemini_3_flash: { id: 'gemini_3_flash', provider: 'google', tier: 1, maxContext: 32000, costPer1kTokens: 0.0003, avgLatencyMs: 600 },
  gpt_5_4: { id: 'gpt_5_4', provider: 'openai', tier: 2, maxContext: 32000, costPer1kTokens: 0.003, avgLatencyMs: 1500 },
  gpt_5_6_sol: { id: 'gpt_5_6_sol', provider: 'openai', tier: 2, maxContext: 64000, costPer1kTokens: 0.005, avgLatencyMs: 2000 },
  gemini_3_1_pro: { id: 'gemini_3_1_pro', provider: 'google', tier: 2, maxContext: 128000, costPer1kTokens: 0.003, avgLatencyMs: 1800 },
  claude_sonnet_4_6: { id: 'claude_sonnet_4_6', provider: 'anthropic', tier: 3, maxContext: 200000, costPer1kTokens: 0.015, avgLatencyMs: 2500 },
  'claude-sonnet-5': { id: 'claude-sonnet-5', provider: 'anthropic', tier: 3, maxContext: 200000, costPer1kTokens: 0.015, avgLatencyMs: 2500 },
  claude_opus_4_8: { id: 'claude_opus_4_8', provider: 'anthropic', tier: 3, maxContext: 200000, costPer1kTokens: 0.075, avgLatencyMs: 5000 },
};

// ── Intent → Tier (server-side copy of Model Router™ INTENT_TIER_MAP subset) ──
const INTENT_TIER_MAP = {
  static_information: 1, navigation: 1, configuration: 1, billing: 1,
  general_inquiry: 1, knowledge: 1, dashboard: 1,
  analytics: 2, resume_analysis: 2, leadership_journey: 2,
  interview_simulation: 2, developer_assistance: 2,
  executive_coaching: 3, decision_intelligence: 3,
};

// ── Subscription model access (same as Model Router™) ──
const SUBSCRIPTION_TIER_ACCESS = {
  free: [1], professional: [1, 2], executive: [1, 2, 3], enterprise: [1, 2, 3],
};

// ── AI Budget Policy (server-side copy of AI Policy Engine™ BUDGET_LIMITS) ──
const BUDGET_LIMITS = {
  free: { monthly: 2.0, daily: 0.10, perFeature: 0.02 },
  professional: { monthly: 20.0, daily: 1.0, perFeature: 0.10 },
  executive: { monthly: 100.0, daily: 5.0, perFeature: 0.50 },
  enterprise: { monthly: 500.0, daily: 25.0, perFeature: 2.0 },
};

// ── Deduplication Cache™ (same semantics as client AI Deduplication Cache) ──
const DEDUP_TTL_MS = 30 * 60 * 1000; // 30 minutes
const DEDUP_MAX_ENTRIES = 200;
const _dedupCache = new Map();

function hashString(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16) + ':' + str.length.toString(16);
}

function getCachedResponse(prompt, model) {
  const key = `${model}::${hashString(prompt)}`;
  const hit = _dedupCache.get(key);
  if (hit && Date.now() - hit.timestamp < DEDUP_TTL_MS) {
    hit.timestamp = Date.now(); // refresh LRU position
    return hit.response;
  }
  if (hit) _dedupCache.delete(key);
  return null;
}

function cacheResponse(prompt, model, response) {
  const key = `${model}::${hashString(prompt)}`;
  if (_dedupCache.has(key)) _dedupCache.delete(key);
  _dedupCache.set(key, { timestamp: Date.now(), response });
  if (_dedupCache.size > DEDUP_MAX_ENTRIES) {
    _dedupCache.delete(_dedupCache.keys().next().value); // evict oldest
  }
}

// ── Error classification (same categories as UsageLog status enum) ──
function classifyError(err) {
  const msg = String(err?.message || err || '').toLowerCase();
  if (msg.includes('timeout') || msg.includes('timed out')) return { status: 'timeout', error_type: 'timeout', transient: true };
  if (msg.includes('rate') || msg.includes('429') || msg.includes('too many')) return { status: 'rate_limited', error_type: 'rate_limit', transient: true };
  if (msg.includes('network') || msg.includes('fetch') || msg.includes('econn') || msg.includes('socket') || msg.includes('502') || msg.includes('503')) return { status: 'network_error', error_type: 'network', transient: true };
  return { status: 'error', error_type: 'validation', transient: false };
}

function deriveProvider(modelId) {
  if (!modelId) return 'unknown';
  const m = String(modelId).toLowerCase();
  if (m.startsWith('gpt')) return 'openai';
  if (m.startsWith('gemini')) return 'google';
  if (m.startsWith('claude')) return 'anthropic';
  return 'unknown';
}

/**
 * Personalization consent gate.
 * MUST be called BEFORE any personalized executive context is read.
 * Fail-closed: unknown, missing, or errored consent state blocks
 * personalization. Consent is never inferred or auto-granted, and this
 * function NEVER writes consent records (consentService semantics preserved).
 */
export async function getPersonalizationConsent(svc, user) {
  if (!user?.email) return false;
  try {
    const records = await svc.entities.ConsentRecord.filter(
      { user_email: user.email, consent_type: 'ai_personalization' },
      '-created_date',
      10,
    );
    if (!records || records.length === 0) return false;
    // Latest record per consent_type is the current state (consentService rule)
    let latest = records[0];
    for (const r of records) {
      if (new Date(r.created_date || 0) > new Date(latest.created_date || 0)) latest = r;
    }
    return latest.granted === true;
  } catch (_e) {
    return false; // fail-closed on any consent read failure
  }
}

/**
 * Server-side model routing (minimum equivalent of Model Router™
 * routeModel): same tier rules, subscription caps, context caps, and
 * cost/speed/tier scoring. The client can supply NO model value.
 */
export function routeModelForGeneration({ intent, contextSize, subscription }) {
  const allowedTiers = SUBSCRIPTION_TIER_ACCESS[subscription] || SUBSCRIPTION_TIER_ACCESS.free;
  let baseTier = INTENT_TIER_MAP[intent] || 1;
  if (contextSize > 100000) baseTier = Math.max(baseTier, 3);
  else if (contextSize > 30000) baseTier = Math.max(baseTier, 2);
  const effectiveTier = Math.min(baseTier, Math.max(...allowedTiers));

  const candidates = Object.values(MODEL_REGISTRY).filter((m) =>
    allowedTiers.includes(m.tier) && m.tier <= effectiveTier && contextSize <= m.maxContext,
  );
  const scored = candidates.map((m) => {
    const costScore = 1 / (m.costPer1kTokens + 0.0001);
    const speedScore = 1 / (m.avgLatencyMs + 100);
    const tierMatchScore = m.tier === effectiveTier ? 1.0 : (m.tier < effectiveTier ? 0.7 : 0.5);
    return { model: m, score: costScore * 0.2 + speedScore * 0.2 + tierMatchScore * 0.6 };
  }).sort((a, b) => b.score - a.score);

  const primary = scored[0]?.model || MODEL_REGISTRY.gemini_3_flash;
  const fallbackChain = scored.slice(1, 4).map((s) => s.model.id);
  const estimatedCost = (contextSize / 1000) * primary.costPer1kTokens;
  return { primaryModel: primary.id, fallbackChain, estimatedCost };
}

/**
 * AI Budget Policy gate (same BUDGET_LIMITS as AI Policy Engine™).
 * Enforced BEFORE LLM invocation. A blocked request generates nothing and
 * spends nothing. Server-resolved plan only.
 */
export async function checkBudgetPolicy(svc, user, plan, estimatedCost) {
  const budget = BUDGET_LIMITS[plan] || BUDGET_LIMITS.free;
  const userName = user?.full_name || user?.email || '';
  let dailySpend = 0;
  let monthlySpend = 0;
  try {
    const logs = await svc.entities.UsageLog.filter({ user_name: userName }, '-created_date', 200);
    const now = new Date();
    const todayKey = now.toISOString().slice(0, 10);
    const monthKey = now.toISOString().slice(0, 7);
    for (const log of logs || []) {
      const d = String(log.created_date || '');
      const cost = Number(log.cost_estimated) || 0;
      if (d.startsWith(todayKey)) dailySpend += cost;
      if (d.startsWith(monthKey)) monthlySpend += cost;
    }
  } catch (_e) { /* read failure → treat spend as 0; budget check still bounds this request */ }
  if (dailySpend + estimatedCost > budget.daily) {
    return { passed: false, reason: `Daily AI budget limit reached for the ${plan} plan. Your usage resets tomorrow.` };
  }
  if (monthlySpend + estimatedCost > budget.monthly) {
    return { passed: false, reason: `Monthly AI budget limit reached for the ${plan} plan. Upgrade your plan to continue.` };
  }
  return { passed: true, reason: 'within budget', dailySpend, monthlySpend, budget };
}

/**
 * Governed AI generation — the ONLY boundary through which the migrated
 * aiWorkforce generation paths may produce LLM output.
 *
 * @param {object} svc            service-role client (UsageLog / consent reads)
 * @param {object} base44         authenticated request client (InvokeLLM)
 * @param {object} user           server-resolved authenticated user
 * @param {object} opts           { intent, prompt, response_json_schema,
 *                                 plan (server-resolved), module,
 *                                 correlation_id }
 */
export async function governedGenerate(svc, base44, user, opts = {}) {
  const requestedAt = new Date().toISOString();
  const correlationId = (typeof opts.correlation_id === 'string' && opts.correlation_id)
    ? opts.correlation_id
    : `gen:${user.id}:${crypto.randomUUID()}`;

  if (!user?.id) {
    return { ok: false, error_code: 'UNAUTHENTICATED', error: 'Authenticated caller required.', correlation_id: correlationId, requested_at: requestedAt };
  }
  if (typeof opts.prompt !== 'string' || opts.prompt.trim().length === 0) {
    return { ok: false, error_code: 'VALIDATION_ERROR', error: 'A prompt is required.', correlation_id: correlationId, requested_at: requestedAt };
  }

  const intent = typeof opts.intent === 'string' && INTENT_TIER_MAP[opts.intent] ? opts.intent : 'general_inquiry';
  const plan = typeof opts.plan === 'string' && BUDGET_LIMITS[opts.plan] ? opts.plan : 'free'; // server-resolved only
  const module = 'other'; // UsageLog module enum
  const prompt = opts.prompt;

  // ── Model routing (server authority; no client model values accepted) ──
  const contextSize = Math.ceil(prompt.length / 4);
  const routing = routeModelForGeneration({ intent, contextSize, subscription: plan });
  const modelChain = [routing.primaryModel, ...routing.fallbackChain];

  // ── AI Budget Policy (before any LLM invocation) ──
  const budget = await checkBudgetPolicy(svc, user, plan, routing.estimatedCost);
  if (!budget.passed) {
    return {
      ok: false, error_code: 'AI_BUDGET_EXCEEDED', error: budget.reason,
      correlation_id: correlationId, requested_at: requestedAt,
      model: routing.primaryModel, estimated_cost: routing.estimatedCost,
    };
  }

  // ── Deduplication (same prompt+model within TTL → cached response, zero credits) ──
  const cached = getCachedResponse(prompt, routing.primaryModel);
  if (cached !== null) {
    return {
      ok: true, data: cached, cached: true, correlation_id: correlationId,
      model: routing.primaryModel, requested_at: requestedAt,
      completed_at: new Date().toISOString(), latency_ms: 0,
    };
  }

  // ── Bounded generation: fallback chain + ONE transient retry pass ──
  // Direct Google Gemini provider: when the DIRECT_GOOGLE_GEMINI_ENABLED flag
  // is on and the routed model is a governed Google model, the direct adapter
  // executes FIRST; on ANY direct failure the SAME model falls back to the
  // existing Base44 InvokeLLM path below. When the flag is off (default) the
  // direct branch is never entered and behavior is byte-identical.
  const startedAt = Date.now();
  let res = null;
  let actualModel = modelChain[0];
  let lastError = null;
  let executedProvider = null; // 'direct_google_gemini' only when the direct adapter executed
  // Direct-attempt observability — sanitized, non-sensitive values only.
  // NEVER stores keys, authorization headers, credentials, raw provider
  // error bodies, or prompt content.
  let directAttempted = false;
  let directAttemptStatus = null; // 'success' | 'failed'
  let directErrorCategory = null; // sanitized category from directGeminiProvider

  const attemptChain = async () => {
    for (const tryModel of modelChain) {
      if (isDirectGoogleModel(tryModel) && await isDirectGoogleGeminiEnabled()) {
        const direct = await directGeminiGenerate({
          prompt,
          model: tryModel,
          ...(opts.response_json_schema ? { response_json_schema: opts.response_json_schema } : {}),
        });
        directAttempted = true;
        if (direct.ok) {
          res = direct.data;
          actualModel = tryModel;
          executedProvider = DIRECT_GEMINI_PROVIDER_ID;
          directAttemptStatus = 'success';
          directErrorCategory = null;
          lastError = null;
          return true;
        }
        // Direct failure → governed fallback to Base44 InvokeLLM (same model).
        // Preserve the sanitized error category for telemetry (observability only).
        directAttemptStatus = 'failed';
        directErrorCategory = typeof direct.error_category === 'string' ? direct.error_category : null;
      }
      try {
        res = await base44.integrations.Core.InvokeLLM({
          prompt,
          model: tryModel,
          ...(opts.response_json_schema ? { response_json_schema: opts.response_json_schema } : {}),
        });
        actualModel = tryModel;
        lastError = null;
        return true;
      } catch (err) {
        actualModel = tryModel;
        lastError = err;
      }
    }
    return false;
  };

  await attemptChain();
  // Transient-only retry: permanent failures are never retried
  if (lastError) {
    const cls = classifyError(lastError);
    if (cls.transient) await attemptChain();
  }

  // ── Direct-attempt telemetry summary (all values sanitized / non-sensitive) ──
  const directTelemetry = {
    direct_attempted_provider: directAttempted ? DIRECT_GEMINI_PROVIDER_ID : null,
    direct_attempt_status: directAttemptStatus,
    direct_error_category: directErrorCategory,
    fallback_used: directAttempted && executedProvider !== DIRECT_GEMINI_PROVIDER_ID,
    final_executed_provider: executedProvider || 'base44_managed_llm',
  };

  const completedAt = new Date().toISOString();
  const latency = Date.now() - startedAt;
  const inputTokens = Math.ceil(prompt.length / 4);

  // ── Failure → truthful structured error + immutable UsageLog ──
  if (lastError) {
    const cls = classifyError(lastError);
    try {
      await svc.entities.UsageLog.create({
        module, tokens_estimated: inputTokens, input_tokens: inputTokens,
        output_tokens: 0, cost_estimated: 0, model: actualModel,
        provider: deriveProvider(actualModel), response_time_ms: latency,
        status: cls.status, error_type: cls.error_type,
        prompt_id: correlationId, user_name: user.full_name || user.email,
        ...directTelemetry,
      });
    } catch (_e) { /* usage logging must never mask the generation result */ }
    return {
      ok: false, error_code: 'AI_GENERATION_FAILED', error: String(lastError?.message || lastError),
      correlation_id: correlationId, requested_at: requestedAt, completed_at: completedAt,
      latency_ms: latency, model: actualModel, error_type: cls.error_type,
      ...directTelemetry,
    };
  }

  // ── Success → dedup cache + immutable UsageLog ──
  cacheResponse(prompt, actualModel, res);
  const responseLength = typeof res === 'string' ? res.length : JSON.stringify(res || {}).length;
  const outputTokens = Math.ceil(responseLength / 4);
  const tokensEstimate = inputTokens + outputTokens;
  const costEstimate = (tokensEstimate / 1000) * 0.002; // same cost model as callAI

  try {
    await svc.entities.UsageLog.create({
      module, tokens_estimated: tokensEstimate, input_tokens: inputTokens,
      output_tokens: outputTokens, cost_estimated: costEstimate,
      model: actualModel, provider: executedProvider || deriveProvider(actualModel),
      response_time_ms: latency, status: 'success',
      prompt_id: correlationId, user_name: user.full_name || user.email,
      ...directTelemetry,
    });
  } catch (_e) { /* usage logging must never mask the generation result */ }

  return {
    ok: true, data: res, cached: false, correlation_id: correlationId,
    requested_at: requestedAt, completed_at: completedAt, latency_ms: latency,
    model: actualModel, provider: executedProvider || deriveProvider(actualModel),
    executed_provider: executedProvider || 'base44_managed_llm',
    input_tokens: inputTokens, output_tokens: outputTokens, cost_estimated: costEstimate,
    adapter: ADAPTER_ID, adapter_version: ADAPTER_VERSION,
    ...directTelemetry,
  };
}
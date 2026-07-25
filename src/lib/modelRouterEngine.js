/**
 * EXECLEAD.AI — Model Router™
 * ============================================================
 * Core Platform Service #11
 *
 * Enterprise Multi-Model Intelligence Orchestrator.
 *
 *   User → EXEC™ → AI Optimization Layer™ → AI Policy Engine™ →
 *   Context Builder™ → Knowledge Pack Engine™ → Model Router™ →
 *   AI Provider → Response
 *
 * Determines the most appropriate AI model for every approved
 * request, optimizing for cost, speed, quality, context length,
 * reasoning depth, and availability.
 *
 * Philosophy:
 *   The best AI platform is not the one with the biggest model.
 *   It is the one that consistently chooses the right model
 *   for the right task.
 *
 *   One Leadership Journey. One AI Platform. Many Intelligent
 *   Models. One Model Router™.
 */

import { base44 } from "@/api/base44Client";

export const MODEL_ROUTER_VERSION = "1.0";

// ============================================================
// §1 — MODEL REGISTRY
// Provider-agnostic registry of all available models.
// ============================================================

export const MODEL_REGISTRY = {
  // ── Tier 1: Fast / Low Cost ──
  gpt_5_mini: {
    id: "gpt_5_mini",
    label: "GPT-5 Mini",
    provider: "openai",
    tier: 1,
    maxContext: 16000,
    costPer1kTokens: 0.0005,
    avgLatencyMs: 800,
    strengths: ["formatting", "summaries", "simple_qa", "grammar", "faq"],
    streamingSupported: true,
    webSearchSupported: false,
  },
  gemini_3_flash: {
    id: "gemini_3_flash",
    label: "Gemini 3 Flash",
    provider: "google",
    tier: 1,
    maxContext: 32000,
    costPer1kTokens: 0.0003,
    avgLatencyMs: 600,
    strengths: ["formatting", "summaries", "simple_qa", "knowledge_expansion", "faq", "web_search"],
    streamingSupported: true,
    webSearchSupported: true,
  },

  // ── Tier 2: Balanced ──
  gpt_5_4: {
    id: "gpt_5_4",
    label: "GPT-5.4",
    provider: "openai",
    tier: 2,
    maxContext: 32000,
    costPer1kTokens: 0.003,
    avgLatencyMs: 1500,
    strengths: ["resume_review", "leadership_analysis", "interview_feedback", "company_analysis", "career_coaching", "developer_assistance"],
    streamingSupported: true,
    webSearchSupported: false,
  },
  gpt_5_6_sol: {
    id: "gpt_5_6_sol",
    label: "GPT-5.6 Sol",
    provider: "openai",
    tier: 2,
    maxContext: 64000,
    costPer1kTokens: 0.005,
    avgLatencyMs: 2000,
    strengths: ["resume_review", "leadership_analysis", "career_coaching", "developer_assistance"],
    streamingSupported: true,
    webSearchSupported: false,
  },
  gemini_3_1_pro: {
    id: "gemini_3_1_pro",
    label: "Gemini 3.1 Pro",
    provider: "google",
    tier: 2,
    maxContext: 128000,
    costPer1kTokens: 0.003,
    avgLatencyMs: 1800,
    strengths: ["resume_review", "company_analysis", "knowledge_expansion", "web_search", "analytics"],
    streamingSupported: true,
    webSearchSupported: true,
  },

  // ── Tier 3: Advanced ──
  claude_sonnet_4_6: {
    id: "claude_sonnet_4_6",
    label: "Claude Sonnet 4.6",
    provider: "anthropic",
    tier: 3,
    maxContext: 200000,
    costPer1kTokens: 0.015,
    avgLatencyMs: 2500,
    strengths: ["executive_coaching", "strategic_thinking", "negotiation", "executive_debate", "decision_intelligence"],
    streamingSupported: true,
    webSearchSupported: false,
  },
  claude_opus_4_6: {
    id: "claude_opus_4_6",
    label: "Claude Opus 4.6",
    provider: "anthropic",
    tier: 3,
    maxContext: 200000,
    costPer1kTokens: 0.075,
    avgLatencyMs: 4000,
    strengths: ["executive_coaching", "strategic_thinking", "board_simulation", "executive_council"],
    streamingSupported: true,
    webSearchSupported: false,
  },
  claude_opus_4_7: {
    id: "claude_opus_4_7",
    label: "Claude Opus 4.7",
    provider: "anthropic",
    tier: 3,
    maxContext: 200000,
    costPer1kTokens: 0.075,
    avgLatencyMs: 4500,
    strengths: ["executive_coaching", "strategic_thinking", "board_simulation", "decision_intelligence"],
    streamingSupported: true,
    webSearchSupported: false,
  },
  claude_opus_4_8: {
    id: "claude_opus_4_8",
    label: "Claude Opus 4.8",
    provider: "anthropic",
    tier: 3,
    maxContext: 200000,
    costPer1kTokens: 0.075,
    avgLatencyMs: 5000,
    strengths: ["executive_coaching", "strategic_thinking", "board_simulation", "executive_council", "decision_intelligence", "enterprise_analysis"],
    streamingSupported: true,
    webSearchSupported: false,
  },
  "claude-sonnet-5": {
    id: "claude-sonnet-5",
    label: "Claude Sonnet 5",
    provider: "anthropic",
    tier: 3,
    maxContext: 200000,
    costPer1kTokens: 0.015,
    avgLatencyMs: 2500,
    strengths: ["executive_coaching", "strategic_thinking", "negotiation", "developer_assistance", "decision_intelligence"],
    streamingSupported: true,
    webSearchSupported: false,
  },
};

// ============================================================
// §2 — INTENT → TIER MAPPING
// ============================================================

export const INTENT_TIER_MAP = {
  // Tier 1 — Fast
  static_information: 1,
  navigation: 1,
  configuration: 1,
  billing: 1,
  general_inquiry: 1,
  knowledge: 1,
  database_query: 1,
  dashboard: 1,

  // Tier 2 — Balanced
  analytics: 2,
  resume_analysis: 2,
  leadership_journey: 2,
  company_intelligence: 2,
  interview_simulation: 2,
  developer_assistance: 2,

  // Tier 3 — Advanced
  executive_coaching: 3,
  executive_debate: 3,
  executive_council: 3,
  decision_intelligence: 3,
  enterprise_operations: 3,
  platform_governance: 3,
};

// ============================================================
// §3 — TIER LABELS
// ============================================================

export const TIER_LABELS = {
  1: { label: "Fast", description: "Low cost, high speed — formatting, summaries, simple Q&A" },
  2: { label: "Balanced", description: "Resume review, leadership analysis, interview feedback" },
  3: { label: "Advanced", description: "Executive coaching, strategic thinking, debate, council" },
};

// ============================================================
// §4 — SUBSCRIPTION MODEL ACCESS
// ============================================================

const SUBSCRIPTION_TIER_ACCESS = {
  free: [1],
  professional: [1, 2],
  executive: [1, 2, 3],
  enterprise: [1, 2, 3],
};

// ============================================================
// §5 — MODEL ROUTER™
// Main routing function — selects the best model for a request.
// ============================================================

/**
 * Route a request to the most appropriate model.
 *
 * @param {object} opts - { intent, contextSize, subscription, workspace, policyModel, estimatedCost, webSearchRequired, streamingPreferred }
 * @returns {object} Routing Decision
 */
export function routeModel(opts = {}) {
  const startedAt = Date.now();
  const intent = opts.intent || "general_inquiry";
  const contextSize = opts.contextSize || 0;
  const subscription = normalizeSubscription(opts.subscription);
  const workspace = opts.workspace || "executive";
  const webSearchRequired = opts.webSearchRequired || false;
  const streamingPreferred = opts.streamingPreferred || false;

  // ── Step 1: Determine base tier from intent ──
  let baseTier = INTENT_TIER_MAP[intent] || 1;

  // ── Step 2: Adjust tier for context size ──
  if (contextSize > 100000) baseTier = Math.max(baseTier, 3);
  else if (contextSize > 30000) baseTier = Math.max(baseTier, 2);

  // ── Step 3: Adjust tier for reasoning depth ──
  const reasoningDepth = assessReasoningDepth(intent);
  if (reasoningDepth === "deep") baseTier = Math.max(baseTier, 3);
  else if (reasoningDepth === "moderate") baseTier = Math.max(baseTier, 2);

  // ── Step 4: Filter by subscription ──
  const allowedTiers = SUBSCRIPTION_TIER_ACCESS[subscription] || [1];
  const effectiveTier = Math.min(baseTier, Math.max(...allowedTiers));

  // ── Step 5: Filter models by tier, context, and capabilities ──
  const candidates = Object.values(MODEL_REGISTRY).filter((m) => {
    if (!allowedTiers.includes(m.tier)) return false;
    if (m.tier > effectiveTier) return false;
    if (contextSize > m.maxContext) return false;
    if (webSearchRequired && !m.webSearchSupported) return false;
    return true;
  });

  // ── Step 6: Score candidates ──
  const scored = candidates.map((model) => {
    const strengthMatch = model.strengths.some((s) => s === intent || s === intentToStrength(intent));
    const costScore = 1 / (model.costPer1kTokens + 0.0001);
    const speedScore = 1 / (model.avgLatencyMs + 100);
    const tierMatchScore = model.tier === effectiveTier ? 1.0 : (model.tier < effectiveTier ? 0.7 : 0.5);
    const strengthBonus = strengthMatch ? 0.5 : 0;

    const totalScore = (costScore * 0.2) + (speedScore * 0.2) + (tierMatchScore * 0.3) + (strengthBonus * 0.3);
    return { model, score: totalScore, strengthMatch };
  });

  scored.sort((a, b) => b.score - a.score);

  // ── Step 7: Select primary model and build fallback chain ──
  const primary = scored[0]?.model || MODEL_REGISTRY.gemini_3_flash;
  const fallbackChain = scored
    .slice(1, 4)
    .filter((s) => s.model.id !== primary.id)
    .map((s) => s.model.id);

  // ── Step 8: Calculate estimates ──
  const estimatedCost = (contextSize / 1000) * primary.costPer1kTokens;
  const estimatedLatencyMs = primary.avgLatencyMs;
  const shouldStream = streamingPreferred && primary.streamingSupported;

  // ── Step 9: Build routing factors ──
  const routingFactors = {
    intent,
    baseTier,
    effectiveTier,
    contextSize,
    reasoningDepth,
    subscription,
    workspace,
    webSearchRequired,
    candidateCount: candidates.length,
    primaryStrengthMatch: scored[0]?.strengthMatch || false,
  };

  // ── Step 10: Build routing reason ──
  const routingReason = buildRoutingReason(intent, primary, effectiveTier, routingFactors);

  const evaluationTimeMs = Date.now() - startedAt;

  return {
    selectedModel: primary.id,
    selectedProvider: primary.provider,
    selectedLabel: primary.label,
    tier: primary.tier,
    fallbackChain,
    fallbackChainLabels: fallbackChain.map((id) => MODEL_REGISTRY[id]?.label).filter(Boolean),
    estimatedCost,
    estimatedLatencyMs,
    streaming: shouldStream,
    contextSize,
    routingReason,
    routingFactors,
    evaluationTimeMs,
  };
}

// ============================================================
// §6 — PERFORMANCE TRACKING
// ============================================================

/**
 * Track a routing event with actual performance data.
 * Call this after the LLM response (or failure).
 */
export async function trackRoutingEvent(routingDecision, performanceData = {}) {
  try {
    await base44.entities.ModelRoutingEvent.create({
      intent: performanceData.intent || routingDecision.routingFactors?.intent || null,
      selected_model: routingDecision.selectedModel,
      selected_provider: routingDecision.selectedProvider,
      tier: routingDecision.tier,
      fallback_from: performanceData.fallbackFrom || null,
      fallback_chain_json: JSON.stringify(routingDecision.fallbackChain || []),
      status: performanceData.status || (performanceData.success === false ? "failed" : "success"),
      latency_ms: performanceData.latencyMs || 0,
      cost: performanceData.cost || routingDecision.estimatedCost || 0,
      token_input: performanceData.tokenInput || routingDecision.contextSize || 0,
      token_output: performanceData.tokenOutput || 0,
      context_size: routingDecision.contextSize || 0,
      success: performanceData.success !== false,
      error_message: performanceData.errorMessage || null,
      user_id: performanceData.userId || null,
      user_name: performanceData.userName || null,
      workspace: performanceData.workspace || null,
      subscription: performanceData.subscription || null,
      module: performanceData.module || null,
      routing_reason: routingDecision.routingReason,
      routing_factors_json: JSON.stringify(routingDecision.routingFactors || {}),
      streaming: routingDecision.streaming || false,
      retry_count: performanceData.retryCount || 0,
    });
  } catch {}
}

// ============================================================
// §7 — ANALYTICS AGGREGATION
// ============================================================

export async function getRoutingAnalytics(limit = 500) {
  try {
    const events = await base44.entities.ModelRoutingEvent.list("-created_date", limit);

    const total = events.length;
    const successful = events.filter((e) => e.success).length;
    const failed = events.filter((e) => !e.success).length;
    const fallbacksUsed = events.filter((e) => e.status === "fallback_used").length;
    const retried = events.filter((e) => e.retry_count > 0).length;

    const successRate = total > 0 ? Math.round((successful / total) * 100) : 0;
    const fallbackRate = total > 0 ? Math.round((fallbacksUsed / total) * 100) : 0;
    const avgLatency = total > 0 ? Math.round(events.reduce((s, e) => s + (e.latency_ms || 0), 0) / total) : 0;
    const totalCost = events.reduce((s, e) => s + (e.cost || 0), 0);
    const avgCost = total > 0 ? totalCost / total : 0;
    const avgContextSize = total > 0 ? Math.round(events.reduce((s, e) => s + (e.context_size || 0), 0) / total) : 0;

    // Per-model breakdown
    const modelStats = {};
    events.forEach((e) => {
      const key = e.selected_model;
      if (!modelStats[key]) {
        modelStats[key] = {
          model: key,
          provider: e.selected_provider,
          tier: e.tier,
          requests: 0,
          successes: 0,
          failures: 0,
          fallbacks: 0,
          totalLatency: 0,
          totalCost: 0,
          totalTokensIn: 0,
          totalTokensOut: 0,
        };
      }
      modelStats[key].requests++;
      if (e.success) modelStats[key].successes++;
      else modelStats[key].failures++;
      if (e.status === "fallback_used") modelStats[key].fallbacks++;
      modelStats[key].totalLatency += e.latency_ms || 0;
      modelStats[key].totalCost += e.cost || 0;
      modelStats[key].totalTokensIn += e.token_input || 0;
      modelStats[key].totalTokensOut += e.token_output || 0;
    });

    // Compute per-model averages
    Object.values(modelStats).forEach((s) => {
      s.avgLatency = s.requests > 0 ? Math.round(s.totalLatency / s.requests) : 0;
      s.avgCost = s.requests > 0 ? s.totalCost / s.requests : 0;
      s.successRate = s.requests > 0 ? Math.round((s.successes / s.requests) * 100) : 0;
    });

    // Provider breakdown
    const providerStats = {};
    events.forEach((e) => {
      const p = e.selected_provider || "unknown";
      if (!providerStats[p]) providerStats[p] = { requests: 0, successes: 0, totalCost: 0, totalLatency: 0 };
      providerStats[p].requests++;
      if (e.success) providerStats[p].successes++;
      providerStats[p].totalCost += e.cost || 0;
      providerStats[p].totalLatency += e.latency_ms || 0;
    });
    Object.values(providerStats).forEach((p) => {
      p.successRate = p.requests > 0 ? Math.round((p.successes / p.requests) * 100) : 0;
      p.avgLatency = p.requests > 0 ? Math.round(p.totalLatency / p.requests) : 0;
    });

    // Tier distribution
    const tierDist = { 1: 0, 2: 0, 3: 0 };
    events.forEach((e) => {
      const t = e.tier || 1;
      tierDist[t] = (tierDist[t] || 0) + 1;
    });

    return {
      total,
      successful,
      failed,
      fallbacksUsed,
      retried,
      successRate,
      fallbackRate,
      avgLatency,
      totalCost,
      avgCost,
      avgContextSize,
      modelStats: Object.values(modelStats).sort((a, b) => b.requests - a.requests),
      providerStats,
      tierDist,
    };
  } catch {
    return {
      total: 0, successful: 0, failed: 0, fallbacksUsed: 0, retried: 0,
      successRate: 0, fallbackRate: 0, avgLatency: 0, totalCost: 0, avgCost: 0,
      avgContextSize: 0, modelStats: [], providerStats: {}, tierDist: { 1: 0, 2: 0, 3: 0 },
    };
  }
}

// ============================================================
// §8 — INTELLIGENT LEARNING
// Generates routing recommendations based on historical performance.
// ============================================================

export async function generateRoutingRecommendations(limit = 500) {
  try {
    const analytics = await getRoutingAnalytics(limit);
    const recommendations = [];

    if (analytics.total < 10) {
      return { recommendations: [], reason: "Insufficient data for recommendations (minimum 10 routing events required)" };
    }

    // ── Recommendation 1: Low success rate models ──
    analytics.modelStats.forEach((stat) => {
      if (stat.requests >= 5 && stat.successRate < 70) {
        const model = MODEL_REGISTRY[stat.model];
        recommendations.push({
          type: "low_success_rate",
          severity: stat.successRate < 50 ? "critical" : "warning",
          model: stat.model,
          modelLabel: model?.label || stat.model,
          message: `${model?.label || stat.model} has a ${stat.successRate}% success rate across ${stat.requests} requests — consider routing to a fallback model or adjusting the tier assignment.`,
          currentSuccessRate: stat.successRate,
        });
      }
    });

    // ── Recommendation 2: Cost optimization ──
    analytics.modelStats.forEach((stat) => {
      if (stat.requests >= 5 && stat.avgCost > 0.05) {
        const currentModel = MODEL_REGISTRY[stat.model];
        if (currentModel) {
          const cheaper = Object.values(MODEL_REGISTRY).filter((m) =>
            m.tier === currentModel.tier && m.costPer1kTokens < currentModel.costPer1kTokens
          );
          if (cheaper.length > 0) {
            const best = cheaper.sort((a, b) => a.costPer1kTokens - b.costPer1kTokens)[0];
            const savings = (currentModel.costPer1kTokens - best.costPer1kTokens) * stat.totalTokensIn / 1000;
            recommendations.push({
              type: "cost_optimization",
              severity: "info",
              model: stat.model,
              modelLabel: currentModel.label,
              message: `Switching ${currentModel.label} to ${best.label} for this intent could save ~$${savings.toFixed(2)} based on ${stat.requests} requests.`,
              potentialSavings: savings,
            });
          }
        }
      }
    });

    // ── Recommendation 3: High fallback rate ──
    if (analytics.fallbackRate > 15) {
      recommendations.push({
        type: "high_fallback_rate",
        severity: "warning",
        message: `Fallback rate is ${analytics.fallbackRate}% — primary models may be unavailable or underperforming. Review provider health.`,
        currentFallbackRate: analytics.fallbackRate,
      });
    }

    // ── Recommendation 4: Provider health ──
    Object.entries(analytics.providerStats).forEach(([provider, stats]) => {
      if (stats.requests >= 5 && stats.successRate < 80) {
        recommendations.push({
          type: "provider_health",
          severity: stats.successRate < 60 ? "critical" : "warning",
          provider,
          message: `Provider ${provider} has a ${stats.successRate}% success rate — consider adjusting fallback priorities.`,
          currentSuccessRate: stats.successRate,
        });
      }
    });

    return { recommendations, analytics };
  } catch {
    return { recommendations: [], reason: "Unable to generate recommendations" };
  }
}

// ============================================================
// §9 — HELPERS
// ============================================================

function normalizeSubscription(sub) {
  if (!sub) return "free";
  const lower = String(sub).toLowerCase();
  if (lower.includes("enterprise")) return "enterprise";
  if (lower.includes("executive")) return "executive";
  if (lower.includes("professional") || lower.includes("pro")) return "professional";
  return "free";
}

function assessReasoningDepth(intent) {
  const deepReasoning = ["executive_coaching", "executive_debate", "executive_council", "decision_intelligence", "enterprise_operations", "platform_governance"];
  const moderateReasoning = ["resume_analysis", "leadership_journey", "company_intelligence", "interview_simulation", "analytics", "developer_assistance"];

  if (deepReasoning.includes(intent)) return "deep";
  if (moderateReasoning.includes(intent)) return "moderate";
  return "light";
}

function intentToStrength(intent) {
  const map = {
    resume_analysis: "resume_review",
    leadership_journey: "leadership_analysis",
    company_intelligence: "company_analysis",
    interview_simulation: "interview_feedback",
    executive_coaching: "executive_coaching",
    executive_debate: "executive_debate",
    executive_council: "executive_council",
    decision_intelligence: "decision_intelligence",
    developer_assistance: "developer_assistance",
    enterprise_operations: "enterprise_analysis",
    knowledge: "knowledge_expansion",
    static_information: "simple_qa",
    general_inquiry: "simple_qa",
    configuration: "faq",
    billing: "faq",
  };
  return map[intent] || "simple_qa";
}

function buildRoutingReason(intent, model, tier, factors) {
  const tierLabel = TIER_LABELS[tier]?.label || `Tier ${tier}`;
  const strengthMatch = factors.primaryStrengthMatch
    ? "— model strengths match this intent"
    : "— best available model for this tier";
  return `Intent "${intent}" → ${tierLabel} tier → ${model.label} (${model.provider}) ${strengthMatch}. Context: ${factors.contextSize} tokens, subscription: ${factors.subscription}.`;
}
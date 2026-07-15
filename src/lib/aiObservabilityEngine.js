/**
 * EXECLEAD.AI — AI Observability Center™
 * ============================================================
 * Core Platform Service #12
 *
 * Enterprise AI Telemetry & Operations Platform.
 *
 *   User → EXEC™ → Optimization → Policy → Context → Knowledge →
 *   Model Router → LLM → AI Observability Center™ → Analytics →
 *   Platform Governance Center™
 *
 * Observes every AI request. Measures every decision.
 * Detects every anomaly. Provides complete visibility into AI operations.
 *
 * Philosophy:
 *   Artificial Intelligence should never operate as a black box.
 *   Enterprise platforms require complete visibility into every AI decision.
 */

import { base44 } from "@/api/base44Client";

export const OBSERVABILITY_VERSION = "1.0";

// ============================================================
// §1 — REQUEST ID GENERATION
// ============================================================

export function generateRequestId() {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// ============================================================
// §2 — TRACE CREATION
// ============================================================

export async function createRequestTrace(traceData) {
  try {
    await base44.entities.AIRequestTrace.create(traceData);
  } catch {}
}

// ============================================================
// §3 — OBSERVABILITY ANALYTICS
// Aggregates from AIRequestTrace + AIOptimizationEvent
// ============================================================

export async function getObservabilityAnalytics(limit = 500) {
  try {
    const [traces, optEvents] = await Promise.all([
      base44.entities.AIRequestTrace.list("-created_date", limit),
      base44.entities.AIOptimizationEvent.list("-created_date", limit),
    ]);

    // ── Trace-based metrics (AI-served + policy-blocked) ──
    const totalTraces = traces.length;
    const aiServed = traces.filter((t) => t.source === "ai").length;
    const policyBlocked = traces.filter((t) => t.source === "policy_blocked").length;
    const successful = traces.filter((t) => t.response_status === "success" || t.response_status === "fallback").length;
    const failed = traces.filter((t) => t.response_status === "failed").length;
    const fallbacksUsed = traces.filter((t) => t.fallback_used).length;

    const avgLatency = totalTraces > 0
      ? Math.round(traces.reduce((s, t) => s + (t.total_response_time_ms || 0), 0) / totalTraces)
      : 0;

    // Per-stage latency
    const avgOptimizationTime = totalTraces > 0
      ? Math.round(traces.reduce((s, t) => s + (t.optimization_time_ms || 0), 0) / totalTraces) : 0;
    const avgPolicyTime = totalTraces > 0
      ? Math.round(traces.reduce((s, t) => s + (t.policy_time_ms || 0), 0) / totalTraces) : 0;
    const avgRoutingTime = totalTraces > 0
      ? Math.round(traces.reduce((s, t) => s + (t.routing_time_ms || 0), 0) / totalTraces) : 0;
    const avgProviderTime = totalTraces > 0
      ? Math.round(traces.reduce((s, t) => s + (t.provider_time_ms || 0), 0) / totalTraces) : 0;

    const totalCost = traces.reduce((s, t) => s + (t.actual_cost || t.estimated_cost || 0), 0);
    const totalCreditsUsed = traces.reduce((s, t) => s + (t.credits_used || 0), 0);
    const totalCreditsSaved = traces.reduce((s, t) => s + (t.credits_saved || 0), 0);
    const avgTokenInput = totalTraces > 0
      ? Math.round(traces.reduce((s, t) => s + (t.token_input || 0), 0) / totalTraces) : 0;

    // ── Optimization-based metrics (all requests) ──
    const totalRequests = optEvents.length;
    const cacheHits = optEvents.filter((e) => e.cache_hit).length;
    const knowledgeHits = optEvents.filter((e) => e.knowledge_hit).length;
    const databaseHits = optEvents.filter((e) => e.database_hit).length;
    const aiInvoked = optEvents.filter((e) => e.ai_invoked).length;
    const optimized = totalRequests - aiInvoked;

    const optimizationRate = totalRequests > 0 ? Math.round((optimized / totalRequests) * 100) : 0;
    const cacheHitRate = totalRequests > 0 ? Math.round((cacheHits / totalRequests) * 100) : 0;
    const knowledgeHitRate = totalRequests > 0 ? Math.round((knowledgeHits / totalRequests) * 100) : 0;
    const databaseHitRate = totalRequests > 0 ? Math.round((databaseHits / totalRequests) * 100) : 0;
    const aiInvocationRate = totalRequests > 0 ? Math.round((aiInvoked / totalRequests) * 100) : 0;

    const totalCostSaved = optEvents.reduce((s, e) => s + (e.estimated_cost_saved || 0), 0);
    const totalCreditsSavedOpt = optEvents.reduce((s, e) => s + (e.credits_saved || 0), 0);

    // ── Policy metrics from traces ──
    const policyPassRate = totalTraces > 0
      ? Math.round(((totalTraces - policyBlocked) / totalTraces) * 100) : 100;

    // ── Provider success rate from traces ──
    const providerSuccessRate = aiServed > 0
      ? Math.round((successful / aiServed) * 100) : 100;

    // ── Model breakdown ──
    const modelStats = {};
    traces.filter((t) => t.selected_model).forEach((t) => {
      const key = t.selected_model;
      if (!modelStats[key]) modelStats[key] = { model: key, provider: t.selected_provider, tier: t.tier, requests: 0, successes: 0, latency: 0, cost: 0, fallbacks: 0 };
      modelStats[key].requests++;
      if (t.response_status === "success" || t.response_status === "fallback") modelStats[key].successes++;
      if (t.fallback_used) modelStats[key].fallbacks++;
      modelStats[key].latency += t.total_response_time_ms || 0;
      modelStats[key].cost += t.actual_cost || t.estimated_cost || 0;
    });
    Object.values(modelStats).forEach((s) => {
      s.avgLatency = s.requests > 0 ? Math.round(s.latency / s.requests) : 0;
      s.successRate = s.requests > 0 ? Math.round((s.successes / s.requests) * 100) : 0;
    });

    // ── Provider breakdown ──
    const providerStats = {};
    traces.filter((t) => t.selected_provider).forEach((t) => {
      const p = t.selected_provider;
      if (!providerStats[p]) providerStats[p] = { requests: 0, successes: 0, latency: 0, cost: 0 };
      providerStats[p].requests++;
      if (t.response_status === "success" || t.response_status === "fallback") providerStats[p].successes++;
      providerStats[p].latency += t.total_response_time_ms || 0;
      providerStats[p].cost += t.actual_cost || t.estimated_cost || 0;
    });
    Object.values(providerStats).forEach((p) => {
      p.successRate = p.requests > 0 ? Math.round((p.successes / p.requests) * 100) : 0;
      p.avgLatency = p.requests > 0 ? Math.round(p.latency / p.requests) : 0;
      p.status = p.successRate >= 90 ? "healthy" : p.successRate >= 70 ? "warning" : "critical";
    });

    // ── Workspace breakdown ──
    const workspaceStats = {};
    traces.forEach((t) => {
      const ws = t.workspace || "unknown";
      if (!workspaceStats[ws]) workspaceStats[ws] = { requests: 0, cost: 0, latency: 0, credits: 0 };
      workspaceStats[ws].requests++;
      workspaceStats[ws].cost += t.actual_cost || t.estimated_cost || 0;
      workspaceStats[ws].latency += t.total_response_time_ms || 0;
      workspaceStats[ws].credits += t.credits_used || 0;
    });
    Object.values(workspaceStats).forEach((ws) => {
      ws.avgLatency = ws.requests > 0 ? Math.round(ws.latency / ws.requests) : 0;
    });

    // ── Intent/feature breakdown ──
    const intentStats = {};
    traces.forEach((t) => {
      const intent = t.intent || "unknown";
      if (!intentStats[intent]) intentStats[intent] = { requests: 0, cost: 0, successes: 0, failures: 0 };
      intentStats[intent].requests++;
      intentStats[intent].cost += t.actual_cost || t.estimated_cost || 0;
      if (t.response_status === "success" || t.response_status === "fallback") intentStats[intent].successes++;
      else if (t.response_status === "failed") intentStats[intent].failures++;
    });

    // ── Cost analytics ──
    const costToday = traces.filter((t) => isToday(t.created_date)).reduce((s, t) => s + (t.actual_cost || t.estimated_cost || 0), 0);
    const costThisMonth = traces.filter((t) => isThisMonth(t.created_date)).reduce((s, t) => s + (t.actual_cost || t.estimated_cost || 0), 0);
    const dailyAvg = costThisMonth > 0 ? costThisMonth / Math.max(1, new Date().getDate()) : 0;
    const projectedMonthly = dailyAvg * 30;

    const successRate = aiServed > 0 ? Math.round((successful / aiServed) * 100) : 100;
    const fallbackRate = aiServed > 0 ? Math.round((fallbacksUsed / aiServed) * 100) : 0;

    return {
      // Trace metrics
      totalTraces,
      aiServed,
      policyBlocked,
      successful,
      failed,
      fallbacksUsed,
      successRate,
      fallbackRate,
      avgLatency,
      // Per-stage latency
      avgOptimizationTime,
      avgPolicyTime,
      avgRoutingTime,
      avgProviderTime,
      // Cost
      totalCost,
      totalCreditsUsed,
      totalCreditsSaved,
      avgTokenInput,
      costToday,
      costThisMonth,
      projectedMonthly,
      // Optimization metrics
      totalRequests,
      optimizationRate,
      cacheHitRate,
      knowledgeHitRate,
      databaseHitRate,
      aiInvocationRate,
      totalCostSaved,
      totalCreditsSavedOpt,
      // Policy
      policyPassRate,
      // Provider
      providerSuccessRate,
      // Breakdowns
      modelStats: Object.values(modelStats).sort((a, b) => b.requests - a.requests),
      providerStats,
      workspaceStats: Object.entries(workspaceStats).map(([ws, s]) => ({ workspace: ws, ...s })).sort((a, b) => b.requests - a.requests),
      intentStats: Object.entries(intentStats).map(([intent, s]) => ({ intent, ...s })).sort((a, b) => b.cost - a.cost),
      // Source distribution
      sourceDist: { database: databaseHits, cache: cacheHits, knowledge: knowledgeHits, ai: aiInvoked },
    };
  } catch {
    return getEmptyAnalytics();
  }
}

function getEmptyAnalytics() {
  return {
    totalTraces: 0, aiServed: 0, policyBlocked: 0, successful: 0, failed: 0, fallbacksUsed: 0,
    successRate: 100, fallbackRate: 0, avgLatency: 0,
    avgOptimizationTime: 0, avgPolicyTime: 0, avgRoutingTime: 0, avgProviderTime: 0,
    totalCost: 0, totalCreditsUsed: 0, totalCreditsSaved: 0, avgTokenInput: 0,
    costToday: 0, costThisMonth: 0, projectedMonthly: 0,
    totalRequests: 0, optimizationRate: 0, cacheHitRate: 0, knowledgeHitRate: 0,
    databaseHitRate: 0, aiInvocationRate: 0, totalCostSaved: 0, totalCreditsSavedOpt: 0,
    policyPassRate: 100, providerSuccessRate: 100,
    modelStats: [], providerStats: {}, workspaceStats: [], intentStats: [],
    sourceDist: { database: 0, cache: 0, knowledge: 0, ai: 0 },
  };
}

// ============================================================
// §4 — AI SCORE™
// ============================================================

export function calculateAIScore(metrics) {
  const optimizationScore = metrics.optimizationRate || 0;
  const latencyScore = metrics.avgLatency > 0
    ? Math.min(100, Math.max(0, 100 - Math.round(metrics.avgLatency / 50)))
    : 100;
  const cacheScore = metrics.cacheHitRate || 0;
  const knowledgeScore = metrics.knowledgeHitRate || 0;
  const policyScore = metrics.policyPassRate || 100;
  const providerScore = metrics.providerSuccessRate || 100;
  const successScore = metrics.successRate || 100;

  const score = Math.round(
    optimizationScore * 0.15 +
    latencyScore * 0.15 +
    cacheScore * 0.15 +
    knowledgeScore * 0.10 +
    policyScore * 0.15 +
    providerScore * 0.15 +
    successScore * 0.15
  );

  const label = score >= 90 ? "Enterprise Ready" : score >= 75 ? "Healthy" : score >= 60 ? "Warning" : "Critical";

  return {
    score,
    label,
    components: {
      optimization: { score: optimizationScore, label: "Optimization", weight: "15%" },
      latency: { score: latencyScore, label: "Latency", weight: "15%" },
      cache: { score: cacheScore, label: "Cache Efficiency", weight: "15%" },
      knowledge: { score: knowledgeScore, label: "Knowledge Efficiency", weight: "10%" },
      policy: { score: policyScore, label: "Policy Compliance", weight: "15%" },
      provider: { score: providerScore, label: "Provider Health", weight: "15%" },
      success: { score: successScore, label: "Success Rate", weight: "15%" },
    },
  };
}

// ============================================================
// §5 — ALERTS
// ============================================================

export function generateAlerts(metrics) {
  const alerts = [];

  if (metrics.avgLatency > 5000) {
    alerts.push({
      severity: metrics.avgLatency > 10000 ? "critical" : "warning",
      category: "latency",
      title: "High Latency Detected",
      message: `Average latency is ${metrics.avgLatency}ms — exceeds 5000ms threshold. Provider stage is the likely bottleneck.`,
    });
  }

  if (metrics.fallbackRate > 15) {
    alerts.push({
      severity: metrics.fallbackRate > 30 ? "critical" : "warning",
      category: "fallback",
      title: "High Fallback Rate",
      message: `Fallback rate is ${metrics.fallbackRate}% — primary models may be unavailable or underperforming.`,
    });
  }

  if (metrics.policyPassRate < 90 && metrics.totalTraces > 10) {
    alerts.push({
      severity: metrics.policyPassRate < 70 ? "critical" : "warning",
      category: "policy",
      title: "Policy Failures Spike",
      message: `Policy pass rate is ${metrics.policyPassRate}% — ${metrics.policyBlocked} requests blocked by policy engine.`,
    });
  }

  if (metrics.cacheHitRate < 20 && metrics.totalRequests > 20) {
    alerts.push({
      severity: "warning",
      category: "cache",
      title: "Cache Efficiency Low",
      message: `Cache hit rate is only ${metrics.cacheHitRate}% — consider expanding cache coverage for repetitive queries.`,
    });
  }

  if (metrics.providerSuccessRate < 90 && metrics.aiServed > 10) {
    alerts.push({
      severity: metrics.providerSuccessRate < 70 ? "critical" : "warning",
      category: "provider",
      title: "Provider Health Degraded",
      message: `Provider success rate is ${metrics.providerSuccessRate}% — check provider availability and error patterns.`,
    });
  }

  if (metrics.optimizationRate < 30 && metrics.totalRequests > 20) {
    alerts.push({
      severity: "warning",
      category: "optimization",
      title: "Low Optimization Rate",
      message: `Only ${metrics.optimizationRate}% of requests are optimized — most requests are hitting AI unnecessarily.`,
    });
  }

  // Provider-specific alerts
  Object.entries(metrics.providerStats || {}).forEach(([provider, stats]) => {
    if (stats.requests >= 5 && stats.status === "critical") {
      alerts.push({
        severity: "critical",
        category: "provider",
        title: `Provider ${provider} Critical`,
        message: `Provider ${provider} has a ${stats.successRate}% success rate — immediate attention required.`,
      });
    }
  });

  return alerts;
}

// ============================================================
// §6 — RECENT TRACES
// ============================================================

export async function getRecentTraces(limit = 20) {
  try {
    return await base44.entities.AIRequestTrace.list("-created_date", limit);
  } catch {
    return [];
  }
}

// ============================================================
// §7 — HELPERS
// ============================================================

function isToday(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

function isThisMonth(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}
/**
 * EXECLEAD.AI — Performance Monitor Engine™
 * ============================================================
 * Version 1.0 · Priority: P0
 *
 * Defines performance budgets, slow-endpoint thresholds, primary
 * bottlenecks, and the 12-strategy optimization checklist.
 * Computes latency percentiles from UsageLog records.
 */

// ── Performance Budgets (per route / operation) ──
export const PERFORMANCE_BUDGETS = [
  { route: "Home Dashboard", target: 150, unit: "ms", category: "critical" },
  { route: "Workspace Switch", target: 300, unit: "ms", category: "critical" },
  { route: "Search", target: 200, unit: "ms", category: "high" },
  { route: "AI Context Build", target: 100, unit: "ms", category: "high" },
  { route: "Manifest Validation", target: 500, unit: "ms", category: "medium" },
  { route: "Foundation Verification", target: null, unit: "background", category: "background" },
  { route: "Intelligence Recompute", target: null, unit: "background", category: "background" },
  { route: "Reputation Recalculation", target: null, unit: "background", category: "background" },
];

// ── Slow Endpoint Thresholds ──
export const SLOW_ENDPOINT_THRESHOLDS = {
  warning: 400,
  critical: 800,
  blocked: 2000,
};

// ── Primary Bottlenecks (priority order) ──
export const PRIMARY_BOTTLENECKS = [
  { rank: 1, name: "manageIntelligence", description: "Intelligence recomputation", optimization: "Background job + incremental recompute" },
  { rank: 2, name: "manageReputation", description: "Reputation recalculation", optimization: "Background job + weighted cache" },
  { rank: 3, name: "Platform Manifest Validation", description: "95-entity cross-reference", optimization: "Cache until changed + background" },
  { rank: 4, name: "syncJobs", description: "External API synchronization", optimization: "Background job + pagination" },
  { rank: 5, name: "ExecutiveReputation aggregation", description: "weighted_breakdown_json", optimization: "Precomputed cache field" },
  { rank: 6, name: "UserProfile intelligence", description: "cached_intelligence_json", optimization: "L3 database cache + TTL" },
  { rank: 7, name: "LeadershipLetter AI moderation", description: "AI review on submit", optimization: "Background AI + cache" },
  { rank: 8, name: "Foundation Verification", description: "10-phase scan", optimization: "Background only" },
];

// ── 12-Strategy Optimization Checklist ──
export const OPTIMIZATION_STRATEGIES = [
  { id: 1, name: "Computed Intelligence Cache™", status: "configured", description: "Persist leadership, reputation, readiness, journey, forecast, KPIs" },
  { id: 2, name: "Incremental Recomputation", status: "configured", description: "Recompute only changed dependencies" },
  { id: 3, name: "Parallel Processing", status: "planned", description: "Replace sequential with parallel where deps allow" },
  { id: 4, name: "Background Jobs", status: "implemented", description: "Move expensive ops out of request flow" },
  { id: 5, name: "Database Query Optimization", status: "audit_required", description: "Review N+1, indexes, joins, aggregations" },
  { id: 6, name: "Multi-Level Cache", status: "configured", description: "L1 in-memory, L2 session, L3 database" },
  { id: 7, name: "AI Optimization", status: "configured", description: "Cache → structured data → AI only if needed" },
  { id: 8, name: "Lazy Loading", status: "planned", description: "Load only what current screen requires" },
  { id: 9, name: "Pagination", status: "implemented", description: "Default 25, search/sort/filter, infinite scroll" },
  { id: 10, name: "Performance Monitoring", status: "implemented", description: "Dashboard with latency, cache hit, slow endpoints" },
  { id: 11, name: "Performance Budget", status: "configured", description: "Per-route targets enforced" },
  { id: 12, name: "Success Criteria", status: "tracking", description: "<150ms avg, <400ms P95, <800ms P99, >80% cache" },
];

// ── Success Criteria ──
export const SUCCESS_CRITERIA = [
  { metric: "Average response time", target: "<150 ms", current: "100-250 ms", status: "warning" },
  { metric: "P95 latency", target: "<400 ms", current: "500-800 ms", status: "critical" },
  { metric: "P99 latency", target: "<800 ms", current: "1,200-2,000 ms", status: "critical" },
  { metric: "Cache hit rate", target: ">80%", current: "Tracking", status: "pending" },
  { metric: "Blocking recomputations", target: "0", current: "Background jobs", status: "pass" },
  { metric: "Duplicate aggregations", target: "0", current: "Incremental", status: "pass" },
  { metric: "Background jobs for long tasks", target: "All", current: "8 job types", status: "pass" },
  { metric: "Functional identity", target: "Identical", current: "No changes", status: "pass" },
];

// ── Required Database Indexes ──
export const REQUIRED_INDEXES = [
  { field: "user_id", entities: "All user-scoped entities", status: "audit_required" },
  { field: "organization_id", entities: "Organization, OrgMembership, Invoice", status: "audit_required" },
  { field: "created_by_id", entities: "All entities (built-in)", status: "likely_present" },
  { field: "updated_date", entities: "Hot-path entities", status: "audit_required" },
  { field: "status", entities: "PerformanceJob, Subscription, BetaApplication", status: "audit_required" },
  { field: "subscription_plan", entities: "UserProfile, Subscription", status: "audit_required" },
];

// ── Latency Computation ──
export function computeLatencyPercentiles(records) {
  if (!records || records.length === 0) {
    return { avg: 0, p50: 0, p95: 0, p99: 0, count: 0 };
  }
  const times = records
    .map((r) => r.response_time_ms || 0)
    .filter((t) => t > 0)
    .sort((a, b) => a - b);
  if (times.length === 0) return { avg: 0, p50: 0, p95: 0, p99: 0, count: 0 };

  const avg = Math.round(times.reduce((s, t) => s + t, 0) / times.length);
  const p50 = times[Math.floor(times.length * 0.5)] || 0;
  const p95 = times[Math.floor(times.length * 0.95)] || 0;
  const p99 = times[Math.min(Math.floor(times.length * 0.99), times.length - 1)] || 0;

  return { avg, p50, p95, p99, count: times.length };
}

// ── Budget Compliance Check ──
export function getBudgetCompliance(measuredLatency) {
  return PERFORMANCE_BUDGETS.filter((b) => b.target !== null).map((budget) => {
    const within = measuredLatency > 0 ? measuredLatency <= budget.target : null;
    return { ...budget, measured: measuredLatency || "—", compliant: within };
  });
}
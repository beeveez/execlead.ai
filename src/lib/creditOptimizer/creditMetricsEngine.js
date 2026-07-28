/**
 * Credit Metrics Engine™
 * ============================================================
 * Tracks all optimization metrics for Integration Credit
 * consumption reduction. Persists to localStorage for session
 * continuity. Provides before/after comparison and savings
 * calculations.
 *
 * Metrics tracked:
 *   • AI Calls (total, deduplicated, skipped, cached)
 *   • Database Writes (total, skipped, bulk)
 *   • Dashboard Refreshes (total, cached)
 *   • Audit Writes (total, batched)
 *   • Cache Hits / Misses
 *   • Bulk Operations (total, records processed)
 *   • Import Deduplications (total, skipped)
 */

const STORAGE_KEY = "exec_credit_optimizer_metrics";
const CREDIT_COSTS = {
  aiCall: 3,
  databaseWrite: 1,
  dashboardRefresh: 2,
  auditWrite: 1,
};

const defaultMetrics = () => ({
  startedAt: new Date().toISOString(),
  aiCalls: { total: 0, deduplicated: 0, skipped: 0, cached: 0 },
  databaseWrites: { total: 0, skipped: 0, bulk: 0 },
  dashboardRefreshes: { total: 0, cached: 0 },
  auditWrites: { total: 0, batched: 0 },
  cacheHits: 0,
  cacheMisses: 0,
  bulkOperations: { total: 0, recordsProcessed: 0 },
  importDeduplications: { total: 0, skipped: 0 },
});

let metrics = loadMetrics();

function loadMetrics() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...defaultMetrics(), ...parsed };
    }
  } catch {}
  return defaultMetrics();
}

function saveMetrics() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(metrics)); } catch {}
}

export function recordMetric(path, delta = 1) {
  const parts = path.split(".");
  let obj = metrics;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!obj[parts[i]]) obj[parts[i]] = {};
    obj = obj[parts[i]];
  }
  const key = parts[parts.length - 1];
  obj[key] = (obj[key] || 0) + delta;
  saveMetrics();
}

export function getMetrics() {
  return JSON.parse(JSON.stringify(metrics));
}

export function resetMetrics() {
  metrics = defaultMetrics();
  saveMetrics();
}

export function calculateSavings() {
  const aiCreditsSaved =
    metrics.aiCalls.cached * CREDIT_COSTS.aiCall +
    metrics.aiCalls.skipped * CREDIT_COSTS.aiCall;
  const dbCreditsSaved = metrics.databaseWrites.skipped * CREDIT_COSTS.databaseWrite;
  const dashboardCreditsSaved = metrics.dashboardRefreshes.cached * CREDIT_COSTS.dashboardRefresh;
  const auditCreditsSaved = metrics.auditWrites.batched * CREDIT_COSTS.auditWrite;
  const importCreditsSaved = metrics.importDeduplications.skipped * CREDIT_COSTS.aiCall;

  const totalSaved = aiCreditsSaved + dbCreditsSaved + dashboardCreditsSaved + auditCreditsSaved + importCreditsSaved;

  const totalWithoutOptimization =
    (metrics.aiCalls.total + metrics.aiCalls.cached + metrics.aiCalls.skipped) * CREDIT_COSTS.aiCall +
    (metrics.databaseWrites.total + metrics.databaseWrites.skipped) * CREDIT_COSTS.databaseWrite +
    (metrics.dashboardRefreshes.total + metrics.dashboardRefreshes.cached) * CREDIT_COSTS.dashboardRefresh +
    (metrics.auditWrites.total + metrics.auditWrites.batched) * CREDIT_COSTS.auditWrite;

  const savingsPct = totalWithoutOptimization > 0
    ? Math.round((totalSaved / totalWithoutOptimization) * 100)
    : 0;

  const totalCacheLookups = metrics.cacheHits + metrics.cacheMisses;
  const cacheHitRate = totalCacheLookups > 0
    ? Math.round((metrics.cacheHits / totalCacheLookups) * 100)
    : 0;

  return {
    aiCreditsSaved,
    dbCreditsSaved,
    dashboardCreditsSaved,
    auditCreditsSaved,
    importCreditsSaved,
    totalSaved,
    totalWithoutOptimization,
    savingsPct,
    cacheHitRate,
  };
}

export { CREDIT_COSTS };
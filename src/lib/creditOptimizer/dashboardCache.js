/**
 * Dashboard Cache™
 * ============================================================
 * Caches dashboard computation results to prevent recomputing
 * on every page load. Refreshes only when data changes.
 *
 * Cache invalidation triggers:
 *   • Batch completed
 *   • Review saved
 *   • Review deleted
 *   • Review restored
 *   • Manual refresh
 */

import { recordMetric } from "./creditMetricsEngine";

const dashboardCache = new Map();
const DEFAULT_TTL = 60 * 1000; // 1 minute

/**
 * Get cached dashboard data. Returns null if expired or missing.
 */
export function getCachedDashboard(cacheKey, ttlMs = DEFAULT_TTL) {
  const cached = dashboardCache.get(cacheKey);
  if (cached && Date.now() < cached.expiresAt) {
    recordMetric("cacheHits");
    recordMetric("dashboardRefreshes.cached");
    return cached.data;
  }
  recordMetric("cacheMisses");
  recordMetric("dashboardRefreshes.total");
  return null;
}

/**
 * Set dashboard cache entry.
 */
export function setCachedDashboard(cacheKey, data, ttlMs = DEFAULT_TTL) {
  dashboardCache.set(cacheKey, {
    data,
    generatedAt: Date.now(),
    expiresAt: Date.now() + ttlMs,
  });
}

/**
 * Invalidate a specific cache key, or clear all if no key provided.
 */
export function invalidateDashboard(cacheKey = null) {
  if (cacheKey) {
    dashboardCache.delete(cacheKey);
  } else {
    dashboardCache.clear();
  }
}

/**
 * Get cache metadata (age, expiry) for a key.
 */
export function getCachedDashboardMeta(cacheKey) {
  const cached = dashboardCache.get(cacheKey);
  if (!cached) return null;
  return {
    generatedAt: cached.generatedAt,
    expiresAt: cached.expiresAt,
    ageMs: Date.now() - cached.generatedAt,
    ttlRemaining: Math.max(0, cached.expiresAt - Date.now()),
  };
}

/**
 * Get or set dashboard data — fetches from the provider if cache miss.
 * @param {string} cacheKey - Unique cache key
 * @param {function} provider - Async function that returns fresh data
 * @param {number} ttlMs - Cache TTL in milliseconds
 */
export async function getCachedOrCompute(cacheKey, provider, ttlMs = DEFAULT_TTL) {
  const cached = getCachedDashboard(cacheKey, ttlMs);
  if (cached) return cached;

  const fresh = await provider();
  setCachedDashboard(cacheKey, fresh, ttlMs);
  return fresh;
}

export function getDashboardCacheStats() {
  return {
    size: dashboardCache.size,
    entries: [...dashboardCache.entries()].map(([key, entry]) => ({
      key,
      generatedAt: entry.generatedAt,
      ageMs: Date.now() - entry.generatedAt,
      ttlRemaining: Math.max(0, entry.expiresAt - Date.now()),
    })),
  };
}

export { DEFAULT_TTL };
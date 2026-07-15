/**
 * EXECLEAD.AI — Executive Digital Twin Cache™ v2.0
 * =================================================
 * localStorage-backed snapshot cache with TTL, per-source
 * timing instrumentation, and progressive build support.
 *
 * Key improvements over v1:
 * - TTL-based cache freshness check (skip rebuild if fresh)
 * - Per-data-source timing tracking
 * - Progressive section readiness tracking
 */

const CACHE_PREFIX = 'dt_cache_';
const REBUILD_DEBOUNCE_MS = 2000;
const CACHE_TTL_MS = 120000; // 2 minutes — skip rebuild if cache is fresh

// ============================================================
// Cache Read / Write
// ============================================================

export function getCachedTwin(userId) {
  if (!userId) return null;
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + userId);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    parsed.isStale = isCacheStale(parsed.cachedAt);
    return parsed;
  } catch {
    return null;
  }
}

export function setCachedTwin(userId, twin, buildMetrics = {}) {
  if (!userId || !twin) return;
  try {
    const snapshot = {
      twin,
      computedAt: twin.computedAt || new Date().toISOString(),
      cachedAt: new Date().toISOString(),
      userId,
      buildMetrics,
    };
    localStorage.setItem(CACHE_PREFIX + userId, JSON.stringify(snapshot));
  } catch {
    // storage full or unavailable — non-fatal
  }
}

export function clearCachedTwin(userId) {
  if (!userId) return;
  try {
    localStorage.removeItem(CACHE_PREFIX + userId);
  } catch {
    // non-fatal
  }
}

export function isCacheStale(cachedAt) {
  if (!cachedAt) return true;
  return Date.now() - new Date(cachedAt).getTime() > CACHE_TTL_MS;
}

export function getCacheTTL() {
  return CACHE_TTL_MS;
}

// ============================================================
// Background Rebuild Queue
// ============================================================

let rebuildTimer = null;
const rebuildListeners = new Set();
let lastRebuildReason = null;

export function queueRebuild(reason = 'data_change') {
  lastRebuildReason = reason;
  if (rebuildTimer) clearTimeout(rebuildTimer);
  rebuildTimer = setTimeout(() => {
    rebuildListeners.forEach((fn) => fn(reason));
  }, REBUILD_DEBOUNCE_MS);
}

export function subscribeToRebuild(callback) {
  rebuildListeners.add(callback);
  return () => rebuildListeners.delete(callback);
}

export function getLastRebuildReason() {
  return lastRebuildReason;
}

// ============================================================
// Performance Metrics™ v2 — Per-Source Instrumentation
// ============================================================

export function createMetrics() {
  return {
    pageLoadStart: performance.now(),
    firstRenderTime: 0,
    totalLoadTime: 0,
    cacheHit: false,
    cacheStale: false,
    cacheAge: null,
    twinBuildTime: 0,
    coreBuildTime: 0,
    enrichmentTime: 0,
    llmResponseTime: 0,
    dataSourcesLoaded: 0,
    dataSourcesTotal: 12,
    dataSourcesTotalRequested: 12,
    dataSourceTimings: [], // [{ name, duration, status, recordCount }]
    slowestQuery: null, // { name, duration }
    blockingRequests: [], // queries >500ms
    parallelRequests: true,
    backgroundRefreshStatus: 'idle', // idle | refreshing | completed | error
    rebuildReason: null,
    sectionsReady: [],
    skippedRebuild: false, // true if cache was fresh and rebuild was skipped
  };
}

/**
 * Record a single data source timing.
 */
export function recordDataSourceTiming(metrics, name, duration, status, recordCount = 0) {
  const entry = { name, duration: Math.round(duration), status, recordCount };
  metrics.dataSourceTimings.push(entry);

  // Track slowest query
  if (!metrics.slowestQuery || duration > metrics.slowestQuery.duration) {
    metrics.slowestQuery = entry;
  }

  // Track blocking requests (>500ms)
  if (duration > 500) {
    metrics.blockingRequests.push(entry);
  }

  return metrics;
}

export function formatDuration(ms) {
  if (ms === 0 || ms === undefined || ms === null) return '—';
  if (ms < 1) return '<1ms';
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

export function formatCacheAge(cachedAt) {
  if (!cachedAt) return '—';
  const diff = Date.now() - new Date(cachedAt).getTime();
  if (diff < 60000) return `${Math.round(diff / 1000)}s ago`;
  if (diff < 3600000) return `${Math.round(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.round(diff / 3600000)}h ago`;
  return `${Math.round(diff / 86400000)}d ago`;
}
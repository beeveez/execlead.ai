/**
 * EXECLEAD.AI — Executive Digital Twin Cache™
 * =================================================
 * localStorage-backed snapshot cache for the Digital Twin.
 *
 * - Renders cached twin immediately on page open
 * - Refreshes in the background (never blocks UI)
 * - Tracks performance metrics for Developer Mode
 * - Debounced rebuild queue for data-change triggers
 */

const CACHE_PREFIX = 'dt_cache_';
const REBUILD_DEBOUNCE_MS = 2000;

// ============================================================
// Cache Read / Write
// ============================================================

export function getCachedTwin(userId) {
  if (!userId) return null;
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + userId);
    if (!raw) return null;
    return JSON.parse(raw);
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

// ============================================================
// Background Rebuild Queue
// Debounced — multiple change events collapse into one rebuild.
// The page subscribes and performs the actual data fetch + rebuild.
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
// Performance Metrics™
// ============================================================

export function createMetrics() {
  return {
    pageLoadStart: performance.now(),
    firstRenderTime: 0,
    totalLoadTime: 0,
    cacheHit: false,
    cacheAge: null,
    twinBuildTime: 0,
    llmResponseTime: 0,
    dataSourcesLoaded: 0,
    dataSourcesTotal: 12,
    backgroundRefreshStatus: 'idle', // idle | refreshing | completed | error
    rebuildReason: null,
    sectionsReady: [],
  };
}

export function formatDuration(ms) {
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
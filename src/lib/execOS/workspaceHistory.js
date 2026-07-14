/**
 * EXEC™ Operating System™ — Workspace History™
 * ============================================================
 * Tracks every page visit for "Recently Viewed", "Continue Where
 * You Left Off", and back/forward navigation. Persists to
 * sessionStorage so it survives page reloads within a session.
 */

const HISTORY_KEY = "execlead_workspace_history";
const MAX_HISTORY = 50;

const SKIP_PATHS = new Set([
  "/login", "/register", "/forgot-password", "/reset-password",
]);

export function addToHistory(pathname) {
  if (!pathname || SKIP_PATHS.has(pathname)) return;
  try {
    const history = getHistory();
    const filtered = history.filter((h) => h.path !== pathname);
    filtered.unshift({ path: pathname, timestamp: Date.now() });
    const trimmed = filtered.slice(0, MAX_HISTORY);
    sessionStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
  } catch { /* no-op */ }
}

export function getHistory() {
  try {
    const raw = sessionStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getRecent(limit = 6) {
  return getHistory().slice(0, limit);
}

export function clearHistory() {
  try {
    sessionStorage.removeItem(HISTORY_KEY);
  } catch { /* no-op */ }
}
/**
 * EXEC™ Tool Gateway™ — Invocation Audit (Phase 1)
 * ============================================================
 * Lightweight structured telemetry for tool invocations.
 *
 * Captures only what is necessary:
 *   tool name, tool version, user/context, timestamp,
 *   success/failure, duration, error category (where applicable).
 *
 * Never stores sensitive tool payloads or secrets. Reuses the platform's
 * analytics pipeline for event tracking (wired in index.js) — this module
 * is only the in-memory recent-invocation ring buffer that powers the
 * Developer Workspace diagnostics surface.
 *
 * Dependency-free by design.
 */

const MAX_INVOCATIONS = 50;
const _invocations = [];

export function recordInvocation(meta) {
  if (!meta || typeof meta !== "object") return;
  _invocations.push({
    toolName: meta.toolName || null,
    toolVersion: meta.toolVersion || null,
    userId: meta.userId || null,
    success: meta.success === true,
    durationMs: typeof meta.durationMs === "number" ? meta.durationMs : null,
    errorCategory: meta.errorCategory || null,
    timestamp: meta.timestamp || new Date().toISOString(),
  });
  if (_invocations.length > MAX_INVOCATIONS) _invocations.shift();
}

export function getRecentInvocations(limit = 20) {
  const n = typeof limit === "number" && limit > 0 ? Math.min(limit, MAX_INVOCATIONS) : 20;
  return _invocations.slice(-n).reverse();
}

export function getLastInvocation(toolName) {
  for (let i = _invocations.length - 1; i >= 0; i--) {
    if (!toolName || _invocations[i].toolName === toolName) return _invocations[i];
  }
  return null;
}

export function getInvocationCount() {
  return _invocations.length;
}

export function clearInvocationLog() {
  _invocations.length = 0;
}
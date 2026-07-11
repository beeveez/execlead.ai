/**
 * Platform Event Bus™
 * --------------------
 * Lightweight pub/sub event system for the Platform State Manager™.
 *
 * Any platform-state-changing operation (repair, knowledge sync, deployment,
 * guardian scan, manifest update, cache invalidation) dispatches an event here.
 * The PlatformStateManager subscribes to ALL events and recomputes, so every
 * consuming widget re-renders with identical values — no page refresh required.
 *
 * Events:
 *   PlatformStateUpdated  — generic state refresh
 *   ManifestUpdated       — manifest registry changed (or analyzed)
 *   KnowledgeUpdated      — knowledge index synced
 *   RepairCompleted       — self-healing repair finished
 *   DeploymentCompleted   — deployment finalized
 *   GuardianCompleted     — guardian scan finished
 *   WorkspaceChanged      — active workspace switched
 *   CacheInvalidated      — platform cache cleared
 */

export const PLATFORM_EVENTS = [
  "PlatformStateUpdated",
  "ManifestUpdated",
  "KnowledgeUpdated",
  "RepairCompleted",
  "DeploymentCompleted",
  "GuardianCompleted",
  "WorkspaceChanged",
  "CacheInvalidated",
];

const subscribers = new Map(PLATFORM_EVENTS.map((e) => [e, new Set()]));
let lastBroadcast = null;
let broadcastCount = 0;

export function subscribe(event, callback) {
  if (!subscribers.has(event)) subscribers.set(event, new Set());
  subscribers.get(event).add(callback);
  return () => subscribers.get(event).delete(callback);
}

export function subscribeAll(callback) {
  const unsubs = PLATFORM_EVENTS.map((e) => subscribe(e, callback));
  return () => unsubs.forEach((u) => u());
}

export function dispatch(event, payload) {
  const subs = subscribers.get(event);
  const notifiedCount = subs ? subs.size : 0;
  lastBroadcast = { event, timestamp: new Date().toISOString(), notifiedCount };
  broadcastCount++;
  if (subs) {
    subs.forEach((cb) => {
      try {
        cb(payload);
      } catch {}
    });
  }
  // Backward compat: also fire the legacy DOM event so any non-bus listeners refresh.
  try {
    window.dispatchEvent(new CustomEvent("platform-manifest-cache-invalidated"));
  } catch {}
}

export function getSubscriberCount() {
  let total = 0;
  subscribers.forEach((s) => {
    total += s.size;
  });
  return total;
}

export function getLastBroadcast() {
  return lastBroadcast;
}

export function getBroadcastCount() {
  return broadcastCount;
}
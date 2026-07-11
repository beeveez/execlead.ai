/**
 * Platform Event Bus™
 * --------------------
 * Lightweight pub/sub event system for the Platform State Manager™.
 *
 * Any platform-state-changing operation dispatches an event here.
 * The PlatformStateManager subscribes to ALL events and recomputes,
 * so every consuming widget re-renders with identical values —
 * no page refresh required.
 *
 * Events:
 *   PlatformStateUpdated    — generic state refresh
 *   ManifestUpdated         — manifest registry changed (or analyzed)
 *   KnowledgeUpdated        — knowledge index changed
 *   KnowledgeSyncCompleted  — knowledge sync finished
 *   SelfHealingStarted      — self-healing analysis began
 *   SelfHealingCompleted    — self-healing repair finished
 *   PlatformCommitted       — platform changes committed
 *   DeploymentStarted       — deployment began
 *   DeploymentCompleted     — deployment finalized
 *   GuardianStarted         — guardian scan began
 *   GuardianCompleted       — guardian scan finished
 *   WorkspaceChanged        — active workspace switched
 *   CacheInvalidated        — platform cache cleared
 *   ConfigUpdated           — configuration changed
 *   EntityChanged           — entity data changed
 */

export const PLATFORM_EVENTS = [
  "PlatformStateUpdated",
  "ManifestUpdated",
  "KnowledgeUpdated",
  "KnowledgeSyncCompleted",
  "SelfHealingStarted",
  "SelfHealingCompleted",
  "PlatformCommitted",
  "DeploymentStarted",
  "DeploymentCompleted",
  "GuardianStarted",
  "GuardianCompleted",
  "WorkspaceChanged",
  "CacheInvalidated",
  "ConfigUpdated",
  "EntityChanged",
];

const subscribers = new Map(PLATFORM_EVENTS.map((e) => [e, new Set()]));
let lastBroadcast = null;
let broadcastCount = 0;

export function subscribe(event, callback) {
  if (!subscribers.has(event)) subscribers.set(event, new Set());
  subscribers.get(event).add(callback);
  return () => subscribers.get(event).delete(callback);
}

/**
 * Subscribe to ALL platform events. Callback receives (eventName, payload).
 */
export function subscribeAll(callback) {
  const unsubs = PLATFORM_EVENTS.map((e) =>
    subscribe(e, (payload) => callback(e, payload))
  );
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
  // Backward compat: also fire the legacy DOM event.
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
/**
 * Platform Event Bus™
 * --------------------
 * Lightweight pub/sub event system for the Platform State Manager™.
 *
 * Guards against:
 *   • Recursive broadcasts (dispatching flag)
 *   • Undefined listeners (try/catch per callback)
 *   • Dispatch before initialization (no-op if no subscribers)
 */

export const PLATFORM_EVENTS = [
  "PlatformStateUpdated",
  "ManifestUpdated",
  "KnowledgeUpdated",
  "KnowledgeSyncStarted",
  "KnowledgeRegistryUpdated",
  "KnowledgePacksRefreshed",
  "KnowledgeHealthUpdated",
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
  "RegistrySynchronizationCompleted",
  "GovernancePipelineCompleted",
  "IntelligenceRefreshCompleted",
];

const subscribers = new Map(PLATFORM_EVENTS.map((e) => [e, new Set()]));
let lastBroadcast = null;
let broadcastCount = 0;
let dispatching = false;

export function subscribe(event, callback) {
  if (!subscribers.has(event)) subscribers.set(event, new Set());
  subscribers.get(event).add(callback);
  return () => {
    try {
      subscribers.get(event)?.delete(callback);
    } catch {}
  };
}

/**
 * Subscribe to ALL platform events. Callback receives (eventName, payload).
 */
export function subscribeAll(callback) {
  const unsubs = PLATFORM_EVENTS.map((e) =>
    subscribe(e, (payload) => callback(e, payload))
  );
  return () => unsubs.forEach((u) => {
    try { u(); } catch {}
  });
}

/**
 * Dispatch an event to all subscribers.
 * Guards against recursive broadcasts — if a subscriber triggers another
 * dispatch synchronously, the nested dispatch is silently dropped
 * to prevent infinite loops.
 */
export function dispatch(event, payload) {
  if (dispatching) return;
  dispatching = true;
  try {
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
  } finally {
    dispatching = false;
  }
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
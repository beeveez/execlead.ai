/**
 * EXECLEAD.AI — AI Invocation Guard™
 * ============================================================
 * Version 1.0 · Priority: P0
 *
 * Pre-flight checks before every AI request.
 * Ensures AI is never invoked when cached or structured data
 * can serve the response.
 *
 * Flow:
 *   1. Check if module is in AI-skip list
 *   2. Check L1/L2/L3 cache for existing result
 *   3. Check structured entity data
 *   4. Only invoke AI if all above miss
 */

// ── Modules where AI should NEVER be invoked ──
export const AI_SKIP_MODULES = [
  { module: "subscription", reason: "Use structured Subscription entity data" },
  { module: "dashboard", reason: "Use cached dashboard metrics (60s TTL)" },
  { module: "user_profile", reason: "Use UserProfile entity directly" },
  { module: "journey_progress", reason: "Use JourneyEvent records" },
  { module: "billing", reason: "Use Invoice / Subscription entities" },
  { module: "platform_status", reason: "Use PlatformStateEvent records" },
  { module: "feature_flags", reason: "Use FeatureFlag entity directly" },
  { module: "notifications", reason: "Use Notification entity directly" },
  { module: "workspace", reason: "Use WorkspaceContext (client-side)" },
  { module: "permissions", reason: "Use ROLE_PERMISSIONS map (no AI)" },
];

// ── Ordered Cache Check Steps ──
export const AI_CACHE_CHECK_STEPS = [
  { step: 1, name: "Check L1 in-memory cache", description: "Module-level Map lookup", fallback: "proceed to L2" },
  { step: 2, name: "Check L2 session cache", description: "sessionStorage lookup", fallback: "proceed to L3" },
  { step: 3, name: "Check L3 database cache", description: "cached_intelligence_json field", fallback: "proceed to entity" },
  { step: 4, name: "Check structured entity data", description: "Direct entity query (no AI)", fallback: "proceed to AI" },
  { step: 5, name: "Invoke AI", description: "Only if ALL above miss", fallback: "none — last resort" },
];

// ── AI Optimization Rules ──
export const AI_OPTIMIZATION_RULES = {
  useAutomaticModelByDefault: true,
  reserveGptFor: ["executive_briefing", "promotion_forecast", "career_advice"],
  cacheDeterministicResponses: true,
  deduplicateSimilarPrompts: true,
  batchRelatedRequests: true,
  maxRetries: 2,
  timeoutMs: 30000,
};

/**
 * Pre-flight check: should we invoke AI?
 * Returns { invoke, reason, step }
 */
export function shouldInvokeAI(module, hasCachedResult, hasStructuredData) {
  const skipModule = AI_SKIP_MODULES.find((m) => m.module === module);
  if (skipModule) {
    return { invoke: false, reason: skipModule.reason, step: "skip" };
  }
  if (hasCachedResult) {
    return { invoke: false, reason: "Cache hit — returning cached result", step: "L1/L2/L3" };
  }
  if (hasStructuredData) {
    return { invoke: false, reason: "Structured data available — no AI needed", step: "entity" };
  }
  return { invoke: true, reason: "Cache miss — AI invocation required", step: "AI" };
}

/**
 * Estimate credit savings from cache hits
 */
export function estimateCreditSavings(cacheHitRate, totalRequests, creditsPerCall = 3) {
  const saved = Math.round(totalRequests * cacheHitRate * creditsPerCall);
  return { savedCredits: saved, savedCalls: Math.round(totalRequests * cacheHitRate) };
}
/**
 * AI Deduplication Engine™
 * ============================================================
 * Caches AI responses by prompt hash + model. If the same
 * prompt is sent to the same model within the TTL window,
 * the cached response is returned — zero AI credits consumed.
 *
 * The AI must only run once per unique prompt. Everything else
 * reads the cached AI output.
 *
 * Cache key: hash(model + fullPrompt)
 * TTL: 30 minutes (configurable)
 * Max entries: 200 (LRU eviction)
 */

import { recordMetric } from "./creditMetricsEngine";

const TTL_MS = 30 * 60 * 1000; // 30 minutes
const MAX_ENTRIES = 200;
const EVICT_COUNT = 50;

const responseCache = new Map();

/**
 * Check for a cached AI response.
 * @returns The cached response, or null if no cache hit.
 */
export function getCachedAIResponse(prompt, model) {
  const hash = hashPrompt(prompt, model);
  const cached = responseCache.get(hash);
  if (cached && Date.now() - cached.timestamp < TTL_MS) {
    recordMetric("cacheHits");
    recordMetric("aiCalls.cached");
    recordMetric("aiCalls.deduplicated");
    return cached.response;
  }
  recordMetric("cacheMisses");
  return null;
}

/**
 * Cache an AI response for future deduplication.
 */
export function cacheAIResponse(prompt, model, response) {
  const hash = hashPrompt(prompt, model);
  responseCache.set(hash, {
    response,
    timestamp: Date.now(),
    model,
    promptLength: prompt.length,
  });

  // LRU eviction
  if (responseCache.size > MAX_ENTRIES) {
    const entries = [...responseCache.entries()].sort(
      (a, b) => a[1].timestamp - b[1].timestamp
    );
    for (let i = 0; i < EVICT_COUNT; i++) {
      responseCache.delete(entries[i][0]);
    }
  }
}

/**
 * Check if a cached response exists without recording metrics.
 */
export function hasCachedAIResponse(prompt, model) {
  const hash = hashPrompt(prompt, model);
  const cached = responseCache.get(hash);
  return cached && Date.now() - cached.timestamp < TTL_MS;
}

export function clearAICache() {
  responseCache.clear();
}

export function getAICacheStats() {
  return {
    size: responseCache.size,
    maxEntries: MAX_ENTRIES,
    ttlMs: TTL_MS,
    entries: [...responseCache.entries()].map(([hash, entry]) => ({
      hash,
      model: entry.model,
      timestamp: entry.timestamp,
      ageMs: Date.now() - entry.timestamp,
      promptLength: entry.promptLength,
    })),
  };
}

function hashPrompt(prompt, model) {
  const str = `${model || "auto"}::${prompt || ""}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return `aih_${Math.abs(hash).toString(36)}`;
}
/**
 * Import Deduplication Engine™
 * ============================================================
 * Detects duplicate content before AI processing.
 *
 * If duplicate:
 *   → Skip immediately
 *   → Never call AI
 *   → Never update dashboard
 *   → Never create audit
 *
 * Deduplication hash is based on content fingerprint + optional
 * salt (e.g., ticket ID, batch ID).
 */

import { recordMetric } from "./creditMetricsEngine";

const processedHashes = new Map(); // hash → { timestamp, entityId, label }
const TTL_MS = 60 * 60 * 1000; // 1 hour
const MAX_ENTRIES = 1000;

/**
 * Check if content has already been processed.
 * @param {string|object} content - The content to check
 * @param {object} options - { salt, normalizeWhitespace }
 * @returns { isDuplicate, hash, existingEntityId, existingLabel }
 */
export function isDuplicateImport(content, options = {}) {
  const hash = hashContent(content, options);
  const existing = processedHashes.get(hash);
  if (existing && Date.now() - existing.timestamp < TTL_MS) {
    recordMetric("importDeduplications.skipped");
    recordMetric("importDeduplications.total");
    return {
      isDuplicate: true,
      hash,
      existingEntityId: existing.entityId,
      existingLabel: existing.label,
    };
  }
  return { isDuplicate: false, hash };
}

/**
 * Mark content as processed.
 */
export function markImportProcessed(content, entityId = null, label = "", options = {}) {
  const hash = hashContent(content, options);
  processedHashes.set(hash, {
    timestamp: Date.now(),
    entityId,
    label,
  });

  // Prune old entries
  if (processedHashes.size > MAX_ENTRIES) {
    const entries = [...processedHashes.entries()].sort(
      (a, b) => a[1].timestamp - b[1].timestamp
    );
    for (let i = 0; i < 200; i++) {
      processedHashes.delete(entries[i][0]);
    }
  }
}

/**
 * Check multiple items for duplicates in one pass.
 * Returns { unique, duplicates }.
 */
export function filterDuplicateImports(items, options = {}) {
  const unique = [];
  const duplicates = [];

  for (const item of items) {
    const check = isDuplicateImport(item.content || item, {
      ...options,
      salt: options.salt || item.salt,
    });
    if (check.isDuplicate) {
      duplicates.push({ item, ...check });
    } else {
      unique.push(item);
      markImportProcessed(item.content || item, null, item.label || "", options);
    }
  }

  return { unique, duplicates };
}

export function clearImportCache() {
  processedHashes.clear();
}

export function getImportCacheStats() {
  return {
    size: processedHashes.size,
    maxEntries: MAX_ENTRIES,
    ttlMs: TTL_MS,
  };
}

function hashContent(content, options = {}) {
  const normalizeWhitespace = options.normalizeWhitespace !== false;
  let normalized =
    typeof content === "string"
      ? content
      : JSON.stringify(content || {});

  if (normalizeWhitespace) {
    normalized = normalized.replace(/\s+/g, " ").trim().toLowerCase();
  }

  const salt = options.salt || "";
  const str = `${salt}::${normalized}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return `imp_${Math.abs(hash).toString(36)}`;
}
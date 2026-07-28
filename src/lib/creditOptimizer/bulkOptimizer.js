/**
 * Bulk Operation Optimizer™
 * ============================================================
 * Wraps bulk create/update/delete operations to record metrics
 * and ensure batch operations are used instead of individual writes.
 *
 * Replaces:
 *   create → create → create → create
 * with:
 *   bulkCreate([all records])
 */

import { recordMetric } from "./creditMetricsEngine";

/**
 * Optimized bulk create — one database write for N records.
 */
export async function bulkCreateOptimized(entity, records) {
  if (!records || records.length === 0) return [];
  recordMetric("databaseWrites.bulk");
  recordMetric("databaseWrites.total");
  recordMetric("bulkOperations.total");
  recordMetric("bulkOperations.recordsProcessed", records.length);
  return await entity.bulkCreate(records);
}

/**
 * Optimized bulk update — one database write for N records.
 */
export async function bulkUpdateOptimized(entity, updates) {
  if (!updates || updates.length === 0) return [];
  recordMetric("databaseWrites.bulk");
  recordMetric("databaseWrites.total");
  recordMetric("bulkOperations.total");
  recordMetric("bulkOperations.recordsProcessed", updates.length);
  return await entity.bulkUpdate(updates);
}

/**
 * Optimized delete many — one database operation for N records.
 */
export async function deleteManyOptimized(entity, query) {
  recordMetric("databaseWrites.bulk");
  recordMetric("databaseWrites.total");
  recordMetric("bulkOperations.total");
  return await entity.deleteMany(query);
}

/**
 * Optimized update many — one database operation for N records.
 */
export async function updateManyOptimized(entity, query, update) {
  recordMetric("databaseWrites.bulk");
  recordMetric("databaseWrites.total");
  recordMetric("bulkOperations.total");
  return await entity.updateMany(query, update);
}

/**
 * Create a batched audit entry instead of individual audit records.
 * Reduces audit writes from N to 1 per batch.
 *
 * @param {string} action - The action being audited (e.g., "batch_imported")
 * @param {array} tickets - Array of ticket/review IDs included in the batch
 * @param {object} metadata - Additional audit metadata
 * @returns A structured audit record ready for a single create() call
 */
export function createBatchedAudit(action, tickets = [], metadata = {}) {
  recordMetric("auditWrites.batched");
  recordMetric("auditWrites.total");
  return {
    action,
    ticket_count: tickets.length,
    ticket_ids: tickets,
    ...metadata,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Record a single audit write (non-batched).
 */
export function recordAuditWrite() {
  recordMetric("auditWrites.total");
}
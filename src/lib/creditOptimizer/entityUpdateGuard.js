/**
 * Entity Update Guard™
 * ============================================================
 * Before every entity update, checks if values have actually
 * changed. If nothing changed, the write is skipped — saving
 * a database write credit.
 *
 *   if value unchanged → skip update
 *   Never write identical values.
 */

import { recordMetric } from "./creditMetricsEngine";

const SKIP_FIELDS = new Set([
  "id",
  "created_date",
  "updated_date",
  "created_by_id",
]);

/**
 * Compare current entity data with proposed updates.
 * Returns { shouldUpdate, changedFields, unchangedFields }.
 */
export function shouldUpdateEntity(currentEntity, updates) {
  if (!currentEntity) {
    return { shouldUpdate: true, changedFields: Object.keys(updates || {}), unchangedFields: [] };
  }

  const changedFields = [];
  const unchangedFields = [];

  for (const [key, newValue] of Object.entries(updates || {})) {
    if (SKIP_FIELDS.has(key)) continue;
    const currentValue = currentEntity[key];
    if (deepEqual(currentValue, newValue)) {
      unchangedFields.push(key);
    } else {
      changedFields.push(key);
    }
  }

  return { shouldUpdate: changedFields.length > 0, changedFields, unchangedFields };
}

/**
 * Guarded entity update — skips the write if no fields changed.
 * @param {object} entity - The Base44 entity SDK object
 * @param {string} id - Entity record ID
 * @param {object} updates - Fields to update
 * @param {object|null} currentData - Current entity data (optional — if null, always updates)
 * @returns The updated entity, or currentData if skipped.
 */
export async function guardedUpdate(entity, id, updates, currentData = null) {
  const { shouldUpdate, changedFields } = shouldUpdateEntity(currentData, updates);
  if (!shouldUpdate) {
    recordMetric("databaseWrites.skipped");
    return currentData;
  }
  recordMetric("databaseWrites.total");
  return await entity.update(id, updates);
}

/**
 * Guarded bulk update — filters out records with no changes.
 */
export function filterChangedRecords(updates, currentMap) {
  const changed = [];
  let skipped = 0;
  for (const update of updates) {
    if (!update.id) {
      changed.push(update);
      continue;
    }
    const current = currentMap?.[update.id];
    const { shouldUpdate } = shouldUpdateEntity(current, update);
    if (shouldUpdate) {
      changed.push(update);
    } else {
      skipped++;
    }
  }
  if (skipped > 0) recordMetric("databaseWrites.skipped", skipped);
  return { changed, skipped };
}

function deepEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return a === b;
  if (typeof a !== typeof b) return false;
  if (typeof a === "object") {
    try {
      return JSON.stringify(a) === JSON.stringify(b);
    } catch {
      return false;
    }
  }
  return a === b;
}
// ============================================================
// Continuous Improvement Action — Strict Update Allowlist Policy
// Critical #2 remediation: the former free-form updateImprovement
// field spread was a mass-assignment primitive. This policy is the
// single server-side authority for which ContinuousImprovementAction
// fields an authorized caller may modify.
//
// ALLOWED: only the fields the existing legitimate implementation
// uses (ImprovementLoopPanel lifecycle advancement and dismissal).
// DENIED by default: everything else — including ownership, creator,
// audit/provenance, and AI/source fields.
// ============================================================

export const IMPROVEMENT_UPDATE_ALLOWED_FIELDS = ['status', 'implemented_date', 'verified_date'];

// Status lifecycle values from the ContinuousImprovementAction entity schema.
const ALLOWED_STATUS_VALUES = ['identified', 'planned', 'in_progress', 'implemented', 'verified', 'dismissed'];

// Frame/control keys carried by the HTTP request envelope — never entity fields.
const ENVELOPE_KEYS = ['action', 'improvement_id'];

/**
 * Validate an updateImprovement request body against the strict allowlist.
 * Deny-by-default: any supplied field outside the allowlist rejects the whole
 * request BEFORE any entity write can occur.
 *
 * @returns {{ok: true, improvement_id: string, updates: Object} |
 *           {ok: false, error: string, rejected_fields: string[]}}
 */
export function validateImprovementUpdate(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, error: 'Request body required', rejected_fields: [] };
  }

  const improvement_id = body.improvement_id;
  if (!improvement_id || typeof improvement_id !== 'string') {
    return { ok: false, error: 'improvement_id required', rejected_fields: [] };
  }

  // All client-supplied fields other than the request envelope.
  const supplied = Object.keys(body).filter((k) => !ENVELOPE_KEYS.includes(k));

  const rejected = supplied.filter((k) => !IMPROVEMENT_UPDATE_ALLOWED_FIELDS.includes(k));
  if (rejected.length > 0) {
    return {
      ok: false,
      error: 'Update rejected: unknown or protected fields are not permitted',
      rejected_fields: rejected,
    };
  }

  const updates = {};
  for (const k of supplied) {
    if (body[k] === undefined) continue; // JSON bodies never carry undefined; defensive only
    updates[k] = body[k];
  }

  if (Object.keys(updates).length === 0) {
    return { ok: false, error: 'No allowlisted update fields supplied', rejected_fields: [] };
  }

  if ('status' in updates) {
    if (typeof updates.status !== 'string' || !ALLOWED_STATUS_VALUES.includes(updates.status)) {
      return { ok: false, error: 'Invalid status value', rejected_fields: ['status'] };
    }
  }

  for (const k of ['implemented_date', 'verified_date']) {
    if (k in updates && typeof updates[k] !== 'string') {
      return { ok: false, error: `${k} must be an ISO-8601 date-time string`, rejected_fields: [k] };
    }
  }

  return { ok: true, improvement_id, updates };
}
/**
 * Phase 8.2 — read_own_prospects (Growth Agent, read-only).
 * ============================================================
 * Strict input contract, bounded query constants, and fixed safe output
 * projection for retrieving the authenticated user's OWN Prospect records.
 *
 * Pure and deterministic: no LLM, no network, no external verification,
 * no writes, no email, no CRM, no payments, no scheduling.
 *
 * Ownership: the caller is resolved SERVER-side by the orchestration chain.
 * Client-supplied identity keys (user_id, owner_user_id, organization_id)
 * are never read — they are rejected by the input contract as unknown keys.
 * The query filter is always anchored to the server-resolved authenticated
 * user, so cross-user, cross-organization, and platform-wide reads are
 * structurally impossible through this tool.
 *
 * Query boundary: fixed deterministic ordering (-created_date), a fixed
 * maximum result count, and one optional safe filter — a registered
 * Prospect status. No arbitrary filters, sorts, limits, fields, entities,
 * operations, or queries are accepted.
 */

export const PROSPECT_READ_TOOL_ID = 'read_own_prospects';
export const PROSPECT_READ_MAX_RESULTS = 20;
export const PROSPECT_READ_STATUSES = ['NEW', 'QUALIFIED', 'DISQUALIFIED', 'PURSUING', 'CONVERTED'];
export const PROSPECT_READ_ORDER = '-created_date';

// Fixed safe projection — exactly the fields the tool may return.
// Never includes internal record id, ownership anchors, or tenant fields.
export const PROSPECT_READ_PROJECTION_FIELDS = [
  'prospect_id',
  'company_name',
  'website',
  'industry',
  'location',
  'source',
  'status',
  'qualification_score',
  'intelligence_summary',
  'intelligence_reference',
  'notes',
  'created_date',
  'updated_date',
];

// The only input keys a read request may carry. Everything else — including
// identity, selector, query, sort, limit, and projection keys — is rejected.
const ALLOWED_INPUT_KEYS = ['status'];

// Registry definition mirrored for deterministic tests. The LIVE
// AgentToolRegistry record is the authority; this constant documents the
// Phase 8.2 definition and stays DRAFT + disabled in code.
export const PROSPECT_READ_TOOL_REGISTRY_DEF = {
  tool_id: PROSPECT_READ_TOOL_ID,
  name: 'Read Own Prospects',
  target_type: 'ENTITY',
  target_name: 'Prospect',
  operation: 'READ',
  execution_scope: 'user_scoped',
  permission_scope: 'self_records',
  risk_level: 'low',
  human_approval_required: false,
  allowed_agent_ids: ['growth_agent'],
  status: 'DRAFT',
  enabled: false,
};

/**
 * Validate a read request input. Accepts absent/null input (plain list read)
 * or an object whose ONLY optional key is `status`, which must be one of the
 * registered Prospect lifecycle statuses. Returns a normalized input or a
 * structured rejection. Never grants anything, never reads identity fields.
 */
export function validateProspectReadInput(input) {
  if (input === undefined || input === null) {
    return { ok: true, input: { status: null } };
  }
  if (typeof input !== 'object' || Array.isArray(input)) {
    return {
      ok: false,
      error_code: 'PROSPECT_READ_INPUT_INVALID',
      error: 'Prospect read input must be omitted or a plain object.',
    };
  }
  for (const key of Object.keys(input)) {
    if (!ALLOWED_INPUT_KEYS.includes(key)) {
      return {
        ok: false,
        error_code: 'PROSPECT_READ_FIELD_REJECTED',
        error: `Unsupported prospect read field "${key}" — only an optional registered "status" filter is accepted.`,
      };
    }
  }
  let status = null;
  const rawStatus = input.status;
  if (rawStatus !== undefined && rawStatus !== null && rawStatus !== '') {
    if (typeof rawStatus !== 'string' || !PROSPECT_READ_STATUSES.includes(rawStatus)) {
      return {
        ok: false,
        error_code: 'PROSPECT_READ_STATUS_INVALID',
        error: `status must be one of the registered Prospect statuses: ${PROSPECT_READ_STATUSES.join(', ')}.`,
      };
    }
    status = rawStatus;
  }
  return { ok: true, input: { status } };
}

/**
 * Fixed safe projection of one Prospect record. Picks ONLY the allowed
 * fields; the internal record id, owner_user_id, organization_id, and any
 * unlisted field never pass through.
 */
export function projectProspect(record) {
  if (!record || typeof record !== 'object') return null;
  const projected = {};
  for (const field of PROSPECT_READ_PROJECTION_FIELDS) {
    if (record[field] !== undefined) projected[field] = record[field];
  }
  return projected;
}
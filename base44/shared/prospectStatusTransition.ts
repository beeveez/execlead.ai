/**
 * Phase 9 — update_own_prospect_status (Growth Agent, controlled lifecycle).
 * ============================================================
 * Strict input contract and explicit transition matrix for performing
 * exactly ONE persistent state mutation: a single Prospect.status
 * lifecycle transition on ONE Prospect owned by the SERVER-resolved
 * authenticated caller.
 *
 * Explicit transition matrix (the ONLY legal transitions):
 *   NEW → QUALIFIED | NEW → DISQUALIFIED
 *   QUALIFIED → PURSUING | QUALIFIED → DISQUALIFIED
 *   PURSUING → CONVERTED | PURSUING → DISQUALIFIED
 * DISQUALIFIED and CONVERTED are terminal — no outgoing transitions.
 * No arbitrary status assignment exists anywhere in this module.
 *
 * Mutation boundary: this capability changes ONLY Prospect.status.
 * It MUST NOT and CANNOT change qualification_score, intelligence_summary,
 * intelligence_reference, notes, company_name, website, industry, location,
 * source, owner_user_id, or organization_id — those keys are rejected by
 * the input contract as unknown fields, and the single-field update is
 * performed by the orchestration core. Qualification remains advisory:
 * qualify_own_prospect may RECOMMEND a status, but only a human-approved
 * update_own_prospect_status execution performs the transition.
 *
 * Ownership & tenant isolation: the caller is resolved SERVER-side by the
 * orchestration chain. Client-supplied identity keys (user_id,
 * owner_user_id, organization_id, current_status) are never read — they
 * are rejected by the input contract as unknown keys. The record lookup is
 * always anchored to the server-resolved authenticated user, so
 * cross-user, cross-organization, and platform-wide mutations are
 * structurally impossible through this tool. The client cannot supply a
 * trusted current status: the source status is always re-derived from the
 * database at request time and re-verified at execution time.
 *
 * Stale approval protection: the server-issued AgentApproval is bound to
 * (prospect_id, observed source status, requested new status, input hash).
 * Before any mutation the orchestration core re-reads the Prospect and
 * BLOCKS if the current status no longer equals the approved source
 * status — no last-write-wins behavior.
 *
 * Pure and deterministic: no LLM, no network, no email, no messaging, no
 * CRM, no payments, no scheduling, no background work, no autonomous
 * execution. This module never decides that a prospect SHOULD change
 * status — it only validates and performs human-approved transitions.
 *
 * This module is written in plain JS syntax so the exact shipped file can
 * be executed by the deterministic test suite without a Deno runtime.
 */

export const PROSPECT_STATUS_UPDATE_TOOL_ID = 'update_own_prospect_status';
export const PROSPECT_STATUSES = ['NEW', 'QUALIFIED', 'DISQUALIFIED', 'PURSUING', 'CONVERTED'];
export const PROSPECT_TRANSITION_REASON_MAX = 1000;

/** The explicit lifecycle transition matrix — the ONLY legal transitions. */
export const PROSPECT_STATUS_TRANSITIONS = {
  NEW: ['QUALIFIED', 'DISQUALIFIED'],
  QUALIFIED: ['PURSUING', 'DISQUALIFIED'],
  PURSUING: ['CONVERTED', 'DISQUALIFIED'],
  DISQUALIFIED: [],
  CONVERTED: [],
};

// Registry definition mirrored for deterministic tests. The LIVE
// AgentToolRegistry record is the authority; this constant documents the
// Phase 9 definition and stays DRAFT + disabled in code until activation.
export const PROSPECT_STATUS_UPDATE_TOOL_REGISTRY_DEF = {
  tool_id: PROSPECT_STATUS_UPDATE_TOOL_ID,
  name: 'Update Own Prospect Status',
  target_type: 'ENTITY',
  target_name: 'Prospect',
  operation: 'UPDATE',
  execution_scope: 'user_scoped',
  permission_scope: 'self_records',
  risk_level: 'medium',
  human_approval_required: true,
  allowed_agent_ids: ['growth_agent'],
  status: 'DRAFT',
  enabled: false,
};

// The ONLY input keys a transition request may carry. Everything else —
// identity, ownership, tenant, current_status, qualification_score, other
// Prospect fields, and entity/operation/function/query/database selector
// keys — is rejected.
const ALLOWED_INPUT_KEYS = ['prospect_id', 'new_status', 'transition_reason'];
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const CONTROL_CHAR_RE = /[\u0000-\u001F\u007F]/;

function reject(error_code, error) {
  return { ok: false, error_code, error };
}

/** Safe preview of a rejected field name — never echoes raw client input. */
function fieldPreview(name) {
  return String(name).replace(/[^\w.-]/g, '').substring(0, 40) || 'unknown';
}

function hasControlChars(s) {
  return CONTROL_CHAR_RE.test(s);
}

/**
 * Validate a transition request against the matrix. The source status is
 * ALWAYS the server-derived database status — never client-supplied.
 * Returns { ok: true } or { ok: false, error_code, error }.
 */
export function validateTransitionAgainstMatrix(sourceStatus, newStatus) {
  const targets = Object.prototype.hasOwnProperty.call(PROSPECT_STATUS_TRANSITIONS, sourceStatus)
    ? PROSPECT_STATUS_TRANSITIONS[sourceStatus]
    : null;
  if (!Array.isArray(targets)) {
    return reject('TRANSITION_SOURCE_STATUS_INVALID',
      `Source status "${fieldPreview(sourceStatus)}" is not a registered Prospect status.`);
  }
  if (!PROSPECT_STATUSES.includes(newStatus)) {
    return reject('TRANSITION_NEW_STATUS_INVALID', 'new_status must be a registered Prospect status.');
  }
  if (!targets.includes(newStatus)) {
    return reject('TRANSITION_NOT_PERMITTED',
      `Transition ${sourceStatus} → ${newStatus} is not permitted by the Prospect lifecycle matrix. `
      + `Allowed from ${sourceStatus}: ${targets.length > 0 ? targets.join(', ') : 'none (terminal status)'}.`);
  }
  return { ok: true };
}

/**
 * Validates and normalizes a status-transition request against the strict
 * contract: exactly one required prospect_id (bounded UUID issued
 * server-side at record creation) + one required new_status (exact
 * registered status) + one optional bounded transition_reason (≤1000
 * chars, no control characters). Any other key — including
 * current_status, ownership/tenant keys, other Prospect fields, and
 * arbitrary selector/query/operation keys — is rejected before anything
 * runs. This tool can never become generic Prospect UPDATE access.
 */
export function validateTransitionInput(rawInput) {
  if (rawInput === null || typeof rawInput !== 'object' || Array.isArray(rawInput)) {
    return reject('TRANSITION_INPUT_INVALID', 'Transition input must be a plain object with prospect_id and new_status.');
  }
  for (const key of Object.keys(rawInput)) {
    if (!ALLOWED_INPUT_KEYS.includes(key)) {
      return reject('TRANSITION_INPUT_FIELD_REJECTED',
        `Unsupported transition input field "${fieldPreview(key)}" — only prospect_id, new_status, and an optional transition_reason are accepted.`);
    }
  }

  const out = {};

  // prospect_id — required, bounded UUID.
  const rawId = rawInput.prospect_id;
  if (rawId === undefined || rawId === null || rawId === '') {
    return reject('TRANSITION_PROSPECT_ID_REQUIRED', 'prospect_id is required.');
  }
  if (typeof rawId !== 'string' || rawId.length > 100 || !UUID_RE.test(rawId.trim())) {
    return reject('TRANSITION_PROSPECT_ID_INVALID',
      'prospect_id must be the bounded prospect identifier issued at record creation.');
  }
  out.prospect_id = rawId.trim().toLowerCase();

  // new_status — required, exact registered status (no coercion, no case folding).
  const rawStatus = rawInput.new_status;
  if (rawStatus === undefined || rawStatus === null || rawStatus === '') {
    return reject('TRANSITION_NEW_STATUS_REQUIRED', 'new_status is required.');
  }
  if (typeof rawStatus !== 'string' || !PROSPECT_STATUSES.includes(rawStatus)) {
    return reject('TRANSITION_NEW_STATUS_INVALID',
      `new_status must be one of the registered Prospect statuses: ${PROSPECT_STATUSES.join(', ')}.`);
  }
  out.new_status = rawStatus;

  // transition_reason — optional, bounded, no control characters.
  const rawReason = rawInput.transition_reason;
  if (rawReason !== undefined && rawReason !== null && rawReason !== '') {
    if (typeof rawReason !== 'string') {
      return reject('TRANSITION_INPUT_FIELD_INVALID', 'transition_reason must be a string.');
    }
    const t = rawReason.trim();
    if (t === '') {
      return reject('TRANSITION_INPUT_FIELD_INVALID', 'transition_reason must not be blank.');
    }
    if (hasControlChars(t)) {
      return reject('TRANSITION_INPUT_CONTROL_CHARACTERS', 'transition_reason contains control characters.');
    }
    if (t.length > PROSPECT_TRANSITION_REASON_MAX) {
      return reject('TRANSITION_REASON_TOO_LONG',
        `transition_reason must be at most ${PROSPECT_TRANSITION_REASON_MAX} characters.`);
    }
    out.transition_reason = t;
  }

  return { ok: true, input: out };
}

/**
 * Deterministic hash of a transition request's allowed input fields. Used
 * ONLY to key idempotency and to bind an AgentApproval to the exact input
 * it was issued for — never for authorization. Total over any input value.
 */
export function prospectTransitionInputHash(input) {
  if (input === null || typeof input !== 'object' || Array.isArray(input)) return '';
  const parts = ['prospect_id', 'new_status', 'transition_reason'].map((k) => {
    const v = input[k];
    if (typeof v === 'string') return v;
    return '';
  });
  const s = parts.join('|');
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16);
}
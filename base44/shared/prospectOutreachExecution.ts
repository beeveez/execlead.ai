/**
 * Prospect Outreach Execution Boundary — Phase 11 deterministic contract.
 * ============================================================
 * THE governed contract for a future external outreach execution
 * capability. This module is a SECURITY BOUNDARY, not a delivery system:
 * in this phase (and until a delivery connector and production safeguards
 * are separately designed and approved) it performs NO external side
 * effect of any kind — no email, no SMS, no messaging, no CRM record, no
 * contact, no opportunity, no lead, no scheduling, no background work,
 * no automatic retry, no LLM, and no autonomous execution. Recipient
 * resolution terminates at DELIVERY_NOT_IMPLEMENTED.
 *
 * Security model:
 * - Strict allow-list input: the execution request accepts EXACTLY the
 *   five contract keys — prospect_id, channel, approved_draft_hash,
 *   approval_id, idempotency_key. EVERY other key is rejected
 *   (OUTREACH_EXECUTION_FIELD_REJECTED), including recipient, email,
 *   phone, external_id, message_id, crm_id, send, schedule, execute,
 *   user_id, owner_user_id, organization_id, entity, operation,
 *   function, query, database, selector, and any arbitrary field. The
 *   actual recipient is NEVER accepted as a client-controlled
 *   destination — recipient resolution is a future SERVER-side step.
 * - Draft binding: an approval is bound to the exact Prospect, channel,
 *   and approved draft hash observed server-side at approval-request
 *   time. At execution time all three are revalidated against the
 *   approval metadata with distinct BLOCK codes — no last-minute
 *   Prospect, channel, draft, or message substitution is possible.
 * - The input hash deliberately EXCLUDES approval_id so the approval
 *   issuance request and the later execution request bind to the SAME
 *   logical request hash.
 * - Status safety: only QUALIFIED or PURSUING Prospects may proceed;
 *   the live status is re-derived server-side at both approval-request
 *   time and execution time. No client-supplied status is ever read.
 * - This module is pure: no database access, no entity writes, no
 *   network calls, no LLM, no external action. All persistence and
 *   orchestration live in the Agent Orchestration Core (AgentExecution
 *   + AgentApproval), which remains the single orchestration authority.
 *
 * This module is written in plain JS syntax so the exact shipped file can
 * be executed by the deterministic test suite without a Deno runtime.
 */

export const OUTREACH_EXECUTION_TOOL = {
  tool_id: 'execute_prospect_outreach',
  name: 'Execute Prospect Outreach',
  target_type: 'INTERNAL_SERVICE',
  target_name: 'prospectOutreachExecution',
  operation: 'INVOKE',
  execution_scope: 'user_scoped',
  permission_scope: 'self_records',
  risk_level: 'high',
  human_approval_required: true,
  allowed_agent_ids: ['growth_agent'],
  status: 'DRAFT',
  enabled: false,
};

export const OUTREACH_EXECUTION_CHANNELS = ['EMAIL', 'LINKEDIN', 'CALL'];
export const OUTREACH_EXECUTION_ELIGIBLE_STATUSES = ['QUALIFIED', 'PURSUING'];
export const OUTREACH_RECIPIENT_RESOLUTION_STATUS = 'DELIVERY_NOT_IMPLEMENTED';
export const OUTREACH_EXECUTION_DRY_RUN_STATUS = 'DRY_RUN_BLOCKED_EXTERNAL_DELIVERY';
export const OUTREACH_EXECUTION_VERIFY_NOTICE =
  'DRY RUN — NOTHING SENT. This is a governed dry-run execution of the Outreach Execution Boundary: every governance check passed up to the external delivery boundary, and recipient resolution terminated at DELIVERY_NOT_IMPLEMENTED. No message was sent, scheduled, persisted, or transmitted; no external network call, email, SMS, messaging, or CRM action occurred; no delivery record was created; and nothing was delivered. The recipient can only ever be resolved server-side — client-supplied destinations are never accepted by this contract.';

const OUTREACH_EXECUTION_ALLOWED_FIELDS = [
  'prospect_id',
  'channel',
  'approved_draft_hash',
  'approval_id',
  'idempotency_key',
];
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DRAFT_HASH_RE = /^[0-9a-f]{8,64}$/;
const IDEMPOTENCY_KEY_RE = /^[A-Za-z0-9._-]{8,64}$/;

function reject(error_code, error) {
  return { ok: false, error_code, error };
}

/** Safe preview of a rejected field name — never echoes raw client input. */
function fieldPreview(name) {
  return String(name).replace(/[^\w.-]/g, '').substring(0, 40) || 'unknown';
}

/**
 * Validates and normalizes an outreach EXECUTION request against the strict
 * contract. Returns { ok: true, input } or { ok: false, error_code, error }.
 * approval_id is optional at approval-request time (the orchestration
 * approval gate issues a PENDING approval when absent) but nothing ever
 * executes without a verified server-issued approval.
 */
export function validateOutreachExecutionInput(rawInput) {
  if (rawInput === null || typeof rawInput !== 'object' || Array.isArray(rawInput)) {
    return reject('OUTREACH_EXECUTION_INPUT_INVALID', 'Outreach execution input must be a plain object.');
  }
  for (const key of Object.keys(rawInput)) {
    if (!OUTREACH_EXECUTION_ALLOWED_FIELDS.includes(key)) {
      return reject('OUTREACH_EXECUTION_FIELD_REJECTED',
        `Field "${fieldPreview(key)}" is not an accepted outreach execution input field.`);
    }
  }

  // prospect_id — required, bounded UUID issued at record creation.
  if (typeof rawInput.prospect_id !== 'string') {
    return reject('OUTREACH_EXECUTION_PROSPECT_ID_REQUIRED', 'prospect_id is required.');
  }
  const pid = rawInput.prospect_id.trim().toLowerCase();
  if (!UUID_RE.test(pid)) {
    return reject('OUTREACH_EXECUTION_PROSPECT_ID_INVALID', 'prospect_id must be the bounded prospect identifier issued at record creation.');
  }

  // channel — required, registered values only. The channel is the approved
  // delivery channel binding; NO channel is contacted in this phase.
  if (typeof rawInput.channel !== 'string') {
    return reject('OUTREACH_EXECUTION_CHANNEL_REQUIRED', 'channel is required.');
  }
  const channel = rawInput.channel.trim().toUpperCase();
  if (!OUTREACH_EXECUTION_CHANNELS.includes(channel)) {
    return reject('OUTREACH_EXECUTION_CHANNEL_INVALID',
      `channel must be one of: ${OUTREACH_EXECUTION_CHANNELS.join(', ')}. No channel is contacted in this phase — external delivery is not implemented.`);
  }

  // approved_draft_hash — required, 8-64 lowercase hex. Binds the execution
  // to the EXACT approved draft; substitution of another draft or message
  // changes the hash and is blocked at execution time.
  if (typeof rawInput.approved_draft_hash !== 'string') {
    return reject('OUTREACH_EXECUTION_DRAFT_HASH_REQUIRED', 'approved_draft_hash is required.');
  }
  const draftHash = rawInput.approved_draft_hash.trim().toLowerCase();
  if (!DRAFT_HASH_RE.test(draftHash)) {
    return reject('OUTREACH_EXECUTION_DRAFT_HASH_INVALID', 'approved_draft_hash must be 8-64 lowercase hexadecimal characters identifying the exact approved draft.');
  }

  // idempotency_key — required, bounded safe charset. Server-controlled
  // idempotency folds this key into the deterministic request hash.
  if (typeof rawInput.idempotency_key !== 'string') {
    return reject('OUTREACH_EXECUTION_IDEMPOTENCY_KEY_REQUIRED', 'idempotency_key is required.');
  }
  const idempotencyKey = rawInput.idempotency_key.trim();
  if (!IDEMPOTENCY_KEY_RE.test(idempotencyKey)) {
    return reject('OUTREACH_EXECUTION_IDEMPOTENCY_KEY_INVALID', 'idempotency_key must be 8-64 characters limited to letters, digits, dot, underscore, and hyphen.');
  }

  // approval_id — optional bounded UUID at approval-request time; a verified
  // server-issued approval is mandatory before anything executes.
  let approvalId = null;
  if (rawInput.approval_id !== undefined && rawInput.approval_id !== null && rawInput.approval_id !== '') {
    if (typeof rawInput.approval_id !== 'string') {
      return reject('OUTREACH_EXECUTION_APPROVAL_ID_INVALID', 'approval_id must be the server-issued approval identifier.');
    }
    const aid = rawInput.approval_id.trim().toLowerCase();
    if (!UUID_RE.test(aid)) {
      return reject('OUTREACH_EXECUTION_APPROVAL_ID_INVALID', 'approval_id must be the server-issued approval identifier.');
    }
    approvalId = aid;
  }

  return {
    ok: true,
    input: {
      prospect_id: pid,
      channel,
      approved_draft_hash: draftHash,
      idempotency_key: idempotencyKey,
      ...(approvalId ? { approval_id: approvalId } : {}),
    },
  };
}

/**
 * Deterministic hash of an outreach execution request's binding fields.
 * Used ONLY to key idempotency and to bind an approval to the exact input
 * it was issued for — never for authorization. approval_id is deliberately
 * EXCLUDED so the approval issuance request and the later execution request
 * produce the SAME logical request hash. Total over any input value.
 */
export function outreachExecutionInputHash(input) {
  if (input === null || typeof input !== 'object' || Array.isArray(input)) return '';
  const parts = ['prospect_id', 'channel', 'approved_draft_hash', 'idempotency_key']
    .map((k) => (typeof input[k] === 'string' ? input[k] : ''));
  const s = parts.join('|');
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16);
}

/**
 * Draft / Prospect / channel binding revalidation at execution time.
 * The approval metadata recorded server-side at approval-request time is
 * compared against the validated execution input. Any substitution of
 * another Prospect, another channel, or another draft (and therefore
 * another message) BLOCKS with a distinct truthful code. Missing or
 * malformed metadata fails closed.
 */
export function validateExecutionApprovalBinding(input, approvalMetadata) {
  const meta = (approvalMetadata && typeof approvalMetadata === 'object' && !Array.isArray(approvalMetadata))
    ? approvalMetadata
    : null;
  if (!meta || typeof meta.prospect_id !== 'string') {
    return reject('OUTREACH_APPROVAL_PROSPECT_MISMATCH',
      'The approval is not bound to a Prospect — no outreach execution is permitted.');
  }
  if (meta.prospect_id !== input.prospect_id) {
    return reject('OUTREACH_APPROVAL_PROSPECT_MISMATCH',
      'The approved Prospect and the requested Prospect differ — no Prospect substitution is permitted.');
  }
  if (meta.channel !== input.channel) {
    return reject('OUTREACH_APPROVAL_CHANNEL_MISMATCH',
      `The approved channel (${meta.channel || 'unknown'}) and the requested channel (${input.channel}) differ — no channel substitution is permitted.`);
  }
  if (meta.draft_hash !== input.approved_draft_hash) {
    return reject('OUTREACH_APPROVAL_DRAFT_HASH_MISMATCH',
      'The approved draft hash and the requested draft hash differ — no draft or message substitution is permitted.');
  }
  return { ok: true };
}

/**
 * Status safety at execution time. Only a QUALIFIED or PURSUING Prospect may
 * proceed to the execution boundary; NEW, DISQUALIFIED, and CONVERTED are
 * refused truthfully. The status is always the live server-derived value —
 * a client-supplied status is rejected as an unknown input key long before
 * this check and is never read.
 */
export function validateOutreachStatusEligibility(status) {
  if (OUTREACH_EXECUTION_ELIGIBLE_STATUSES.includes(status)) {
    return { ok: true, status };
  }
  return reject('OUTREACH_STATUS_NOT_ELIGIBLE',
    `Outreach execution is not permitted for a Prospect with status "${String(status)}" — only a ${OUTREACH_EXECUTION_ELIGIBLE_STATUSES.join(' or ')} Prospect may proceed to the execution boundary.`);
}

/**
 * Builds the governed DRY-RUN execution result. This is the terminal state
 * of Phase 11: all governance checks have passed up to the external
 * delivery boundary, recipient resolution terminates at
 * DELIVERY_NOT_IMPLEMENTED, and NOTHING is sent, scheduled, persisted, or
 * transmitted. The result never claims delivery and carries an explicit
 * DRY RUN — NOTHING SENT verification notice.
 */
export function buildOutreachExecutionDryRun(input, approvalId, ctx) {
  const meta = (ctx && typeof ctx === 'object') ? ctx : {};
  return {
    execution_status: OUTREACH_EXECUTION_DRY_RUN_STATUS,
    dry_run: true,
    external_delivery: false,
    delivered: false,
    sent: false,
    scheduled: false,
    persisted: false,
    channel: input.channel,
    prospect_id: input.prospect_id,
    approved_draft_hash: input.approved_draft_hash,
    idempotency_key: input.idempotency_key,
    approval_id: approvalId || null,
    prospect_status_at_execution: typeof meta.prospect_status === 'string' ? meta.prospect_status : null,
    recipient_resolution: {
      status: OUTREACH_RECIPIENT_RESOLUTION_STATUS,
      resolved_recipient: null,
      note: 'Recipient resolution is a future server-side step inside the Outreach Execution Boundary. The execution contract never accepts a client-supplied destination (email address, phone number, social account, or external contact ID); when delivery is implemented, the recipient may only be resolved server-side from the owned Prospect record.',
    },
    governance_checks_passed: [
      'server_resolved_requester_identity',
      'agent_registry_kill_switch',
      'tool_registry_kill_switch',
      'explicit_agent_allow_list',
      'exact_target_and_operation',
      'user_scoped_self_records_scope',
      'global_execution_stop_and_risk_threshold',
      'human_approval_verified_server_side',
      'approval_input_hash_binding',
      'prospect_binding',
      'channel_binding',
      'approved_draft_hash_binding',
      'single_use_approval_not_consumed',
      'prospect_status_revalidated_at_execution_time',
    ],
    verification_notice: OUTREACH_EXECUTION_VERIFY_NOTICE,
  };
}
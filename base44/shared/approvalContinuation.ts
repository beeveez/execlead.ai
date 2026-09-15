/**
 * Governed Approval Continuation — Phase 15 Remediation 2 (F-04).
 * ============================================================
 * REQUEST → PENDING APPROVAL → HUMAN APPROVES → APPROVED →
 * REQUESTER RESUMES → SERVER REVALIDATES → EXECUTES EXACTLY ONCE.
 *
 * This module is the PURE decision layer for resume_approved_execution —
 * the requester-facing continuation of an APPROVED server-issued
 * AgentApproval. It contains NO I/O: entity reads/writes and capability
 * delegation live in the Agent Orchestration Core™, which imports this
 * module. decide_approval remains DECISION ONLY — approval NEVER
 * auto-executes; continuation is a separate, explicit requester action.
 *
 * Client contract: the continuation request carries ONLY approval_id.
 * Identity, agent, tool, scope, risk, approval state, target, and
 * operation are recovered server-side from the approval binding and the
 * authoritative registries — never from the client. The recovered
 * bound_input is re-validated and hash-bound by the orchestration chain,
 * which re-checks registries, allow-lists, the exact target/operation,
 * scopes, the risk threshold, expiry, self-approval, single-use
 * consumption, and any mutable source state before exactly ONE execution.
 *
 * Idempotency: a consumed approval returns its existing execution and
 * never executes again — no second business mutation of any kind.
 *
 * External delivery safety: the execute_prospect_outreach route exists
 * only as a fail-closed proof — the tool is registered DRAFT + disabled
 * and its risk (high) exceeds the current threshold (medium), so a
 * resume of an outreach approval always blocks inside the chain. No
 * email is ever sent through continuation.
 *
 * Pure and deterministic: no imports, no database access, no network, no
 * LLM, no email. Written in plain JS syntax so the exact shipped file can
 * be executed by the deterministic test suite without a Deno runtime.
 */

export const RESUME_ACTION_NAME = 'resume_approved_execution';
export const RESUME_PROVENANCE_SOURCE = 'agent_orchestration_service';
export const RESUME_ALLOWED_CLIENT_KEYS = ['action', 'approval_id'];

/**
 * Canonical continuation routing table. tool_id → the registered
 * capability binding recovered from the approval. The LIVE
 * AgentToolRegistry remains the authority — the orchestration chain
 * re-validates agent/tool status+enabled, the explicit allow-list, the
 * exact target/operation, scopes, and the risk threshold at RESUME time.
 */
export const RESUME_CAPABILITY_ROUTES = {
  create_own_prospect: {
    agent_id: 'growth_agent',
    target_type: 'ENTITY',
    target_name: 'Prospect',
    operation: 'CREATE',
  },
  update_own_prospect_status: {
    agent_id: 'growth_agent',
    target_type: 'ENTITY',
    target_name: 'Prospect',
    operation: 'UPDATE',
  },
  verify_own_prospect_contact: {
    agent_id: 'growth_agent',
    target_type: 'ENTITY',
    target_name: 'ProspectContact',
    operation: 'UPDATE',
  },
  execute_prospect_outreach: {
    agent_id: 'growth_agent',
    target_type: 'INTERNAL_SERVICE',
    target_name: 'prospectOutreachExecution',
    operation: 'INVOKE',
  },
};

function reject(errorCode, error, httpStatus) {
  return { ok: false, error_code: errorCode, error: error, http_status: httpStatus };
}

/**
 * Strict client contract: ONLY approval_id (plus the router's action key)
 * is accepted. Any other client field — claimed agent/tool identity,
 * user/organization identity, claimed approval status, input, scope, or
 * risk — is rejected outright. The client can IDENTIFY the approved
 * request but never AUTHORIZE one.
 */
export function validateResumeClientInput(body) {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    return reject('RESUME_APPROVAL_ID_REQUIRED',
      'resume_approved_execution requires approval_id.', 400);
  }
  for (const key of Object.keys(body)) {
    if (!RESUME_ALLOWED_CLIENT_KEYS.includes(key)) {
      return reject('RESUME_CLIENT_FIELD_REJECTED',
        'Unsupported resume field "' + String(key).replace(/[^\w.-]/g, '').substring(0, 40)
        + '" — continuation accepts only approval_id; every authorization value is recovered server-side.',
        422);
    }
  }
  const raw = body.approval_id;
  if (raw === undefined || raw === null || raw === '') {
    return reject('RESUME_APPROVAL_ID_REQUIRED',
      'resume_approved_execution requires approval_id.', 400);
  }
  if (typeof raw !== 'string' || raw.trim().length < 8 || raw.length > 200) {
    return reject('RESUME_APPROVAL_ID_INVALID',
      'approval_id must be the server-issued approval identifier.', 400);
  }
  return { ok: true, approval_id: raw.trim() };
}

/**
 * Ordered server-side preconditions evaluated against the approval
 * binding BEFORE any capability delegation. Every rejection is
 * fail-closed and read-only — no records are created or mutated here.
 * Returns one of:
 *   { decision: 'NOT_FOUND' }
 *   { decision: 'BLOCK', error_code, error, http_status }
 *   { decision: 'RETURN_PENDING' }
 *   { decision: 'ALREADY_CONSUMED', executed_execution_id }
 *   { decision: 'PROCEED' }
 */
export function evaluateResumePreconditions(approval, requesterUserId, nowMs) {
  if (approval === null || typeof approval !== 'object') {
    return { decision: 'NOT_FOUND' };
  }
  // Requester must be the ORIGINAL requester (server-derived identity).
  if (typeof requesterUserId !== 'string' || requesterUserId.length === 0
    || approval.user_id !== requesterUserId) {
    return { decision: 'BLOCK', error_code: 'RESUME_REQUESTER_MISMATCH',
      error: 'Only the original requester may resume this approved request.',
      http_status: 403 };
  }
  // Only server-issued approvals can be resumed.
  if (approval.source !== RESUME_PROVENANCE_SOURCE) {
    return { decision: 'BLOCK', error_code: 'APPROVAL_PROVENANCE_INVALID',
      error: 'Only server-issued approvals can be resumed.', http_status: 403 };
  }
  // Undecided requests never execute.
  if (approval.status === 'PENDING') {
    return { decision: 'RETURN_PENDING' };
  }
  // Rejected / expired / cancelled requests never execute.
  if (approval.status === 'REJECTED') {
    return { decision: 'BLOCK', error_code: 'APPROVAL_REJECTED',
      error: 'The request was rejected by the approver — nothing will execute.',
      http_status: 403 };
  }
  if (approval.status !== 'APPROVED') {
    return { decision: 'BLOCK', error_code: 'APPROVAL_NOT_ACTIVE',
      error: 'The referenced approval is ' + String(approval.status)
        + ' — only an APPROVED approval can be resumed.',
      http_status: 403 };
  }
  // Expiry is re-evaluated at RESUME time from the binding.
  if (approval.expires_at && Date.parse(approval.expires_at) < nowMs) {
    return { decision: 'BLOCK', error_code: 'APPROVAL_EXPIRED',
      error: 'The approval window has expired — a new approval is required.',
      http_status: 403 };
  }
  // Single-use: a consumed approval never executes again (idempotent).
  const meta = approval.metadata && typeof approval.metadata === 'object'
    ? approval.metadata : {};
  if (typeof meta.executed_execution_id === 'string' && meta.executed_execution_id !== '') {
    return { decision: 'ALREADY_CONSUMED', executed_execution_id: meta.executed_execution_id };
  }
  // Self-approval prohibition is re-enforced at resume time.
  if (!approval.approver_user_id || approval.approver_user_id === approval.user_id) {
    return { decision: 'BLOCK', error_code: 'APPROVAL_SELF_APPROVED',
      error: 'Self-approval is prohibited; this approval cannot authorize execution.',
      http_status: 403 };
  }
  return { decision: 'PROCEED' };
}

/**
 * Recovers the original governed request input from the approval binding
 * (bound_input = the exact server-validated input captured at approval
 * issuance). The orchestration chain re-derives the deterministic input
 * hash from this recovered input and re-validates it against the
 * approval's input_hash binding — the approval can never authorize
 * different input, and any mutable source state is re-read fresh from
 * the database before exactly one mutation.
 */
export function recoverResumeInput(approval) {
  if (approval === null || typeof approval !== 'object') {
    return reject('RESUME_CAPABILITY_NOT_RESUMABLE',
      'No approval binding is available to recover.', 403);
  }
  const route = Object.prototype.hasOwnProperty.call(RESUME_CAPABILITY_ROUTES, approval.tool_id)
    ? RESUME_CAPABILITY_ROUTES[approval.tool_id]
    : null;
  if (!route) {
    return reject('RESUME_CAPABILITY_NOT_RESUMABLE',
      'The approved capability is not resumable through continuation.', 403);
  }
  // The capability binding on the approval must match the registered route.
  if (approval.agent_id !== route.agent_id) {
    return reject('APPROVAL_CAPABILITY_MISMATCH',
      'The approval binding does not match the registered continuation route.', 403);
  }
  const meta = approval.metadata && typeof approval.metadata === 'object'
    ? approval.metadata : {};
  const bound = meta.bound_input;
  if (bound === null || typeof bound !== 'object' || Array.isArray(bound)) {
    return reject('RESUME_INPUT_NOT_RECOVERABLE',
      'The original request input was not bound to this approval — resume by invoking the original governed request with your original input and this approval_id; every authorization value is re-validated server-side.',
      409);
  }
  return { ok: true, input: bound };
}
/**
 * Controlled First-Send Boundary — Phase 14F
 * ============================================================
 * SINGLE PURPOSE: evaluate, server-side, whether ONE explicitly
 * operator-requested, human-approved controlled test send may pass to the
 * AUTHORITATIVE Phase 14D Gmail Delivery Boundary — and build the governed
 * request that boundary consumes. This module NEVER performs a send, NEVER
 * acquires credentials, NEVER contacts Gmail, and persists nothing.
 *
 * ARCHITECTURE (operator-converged, never a bypass):
 * - The normal agent path REMAINS blocked: execute_prospect_outreach is
 *   registered HIGH risk while the global AgentOrchestrationConfig threshold
 *   is MEDIUM, so no Workforce agent can ever reach a delivery boundary.
 * - The Phase 14F operator path is a DEDICATED, read-first governance
 *   envelope that converges on the SAME authoritative 14D boundary — it
 *   adds a 30-point precondition checklist ON TOP of the 14D 20-point gate
 *   and delegates the single send to executeGovernedGmailDelivery, the sole
 *   transport-carrying path. No parallel transport, no Gmail bypass.
 * - Only platform operators (super_admin / platform_admin /
 *   founder_root_admin) may request the first send, and ONLY an explicitly
 *   APPROVED, single-use, non-self-approved AgentApproval bound to the
 *   exact Prospect, exact VERIFIED primary ProspectContact, exact draft
 *   hash, and observed Prospect status can pass.
 * - The recipient is resolved EXCLUSIVELY from the Prospect's VERIFIED,
 *   primary EMAIL ProspectContact (Phase 14E capability) — never from a
 *   client string, never inferred, never substituted after approval.
 * - The sender is the fixed server-controlled Growth mailbox
 *   growth@execleadai.co. Gmail authentication is exclusively the
 *   Base44-managed Gmail OAuth connector (Phase 14C boundary — identity
 *   r.valdez@execleadai.co, scope gmail.send only).
 * - ONE send, structurally: after any REAL-mode SENT exists, this phase can
 *   never send again (same-identity invocations replay the stored result;
 *   different-identity attempts fail closed with FIRST_SEND_ALREADY_COMPLETED).
 * - NO bulk, NO loops over prospects, NO CC/BCC, NO attachments, NO
 *   scheduling, NO automatic retry. Every client-supplied delivery
 *   directive (to/cc/bcc/from/sender/provider params/recipient arrays) is
 *   rejected before any state is read.
 *
 * This module is pure: no imports, no database access, no network, no LLM.
 * Written in plain JS syntax so the exact shipped file can be executed by
 * the deterministic test suite.
 */

export const FIRST_SEND_BOUNDARY_VERSION = '14F.1.0.0';
export const FIRST_SEND_AGENT_ID = 'growth_agent';
export const FIRST_SEND_TOOL_ID = 'execute_prospect_outreach';
export const FIRST_SEND_CHANNEL = 'EMAIL';
export const FIRST_SEND_CONNECTOR_ID = 'google_workspace_gmail';
export const FIRST_SEND_SENDER_IDENTITY = 'growth@execleadai.co';
export const FIRST_SEND_CONNECTOR_IDENTITY = 'r.valdez@execleadai.co';
export const FIRST_SEND_GMAIL_SCOPE = 'https://www.googleapis.com/auth/gmail.send';
export const FIRST_SEND_CONTROLLED_TEST_MARKER = 'EXECLEAD.AI CONTROLLED DELIVERY TEST';
export const FIRST_SEND_OPERATOR_ROLES = ['super_admin', 'platform_admin', 'founder_root_admin'];
export const FIRST_SEND_APPROVAL_SOURCE = 'agent_orchestration_service';
export const FIRST_SEND_PROSPECT_ELIGIBLE_STATUSES = ['QUALIFIED', 'PURSUING'];
export const FIRST_SEND_MAX_SUBJECT = 200;
export const FIRST_SEND_MAX_BODY = 2000;
export const FIRST_SEND_CHECKS_TOTAL = 30;

/** The 30-point pre-send checklist, evaluated in fixed order by
 * evaluateFirstSendPreconditions. The first failure terminates with the
 * deterministic code shown. */
export const FIRST_SEND_PRE_SEND_CHECKLIST = [
  '1 authenticated operator caller — FIRST_SEND_CALLER_NOT_AUTHENTICATED',
  '2 operator role authorization — FIRST_SEND_OPERATOR_UNAUTHORIZED',
  '3 governed request shape — FIRST_SEND_REQUEST_INVALID',
  '4 orchestration config exists (fail-closed) — FIRST_SEND_ORCHESTRATION_STOPPED',
  '5 orchestration not stopped — FIRST_SEND_ORCHESTRATION_STOPPED',
  '6 risk threshold remains MEDIUM — FIRST_SEND_RISK_THRESHOLD_CHANGED',
  '7 execute_prospect_outreach ACTIVE + enabled — FIRST_SEND_TOOL_NOT_ACTIVE',
  '8 google_workspace_gmail registry record exists — GATE_CONNECTOR_MISSING',
  '9 connector ACTIVE + enabled + supports_delivery — GATE_CONNECTOR_DISABLED',
  '10 real-delivery config exists (fail-closed) — GATE_REAL_DELIVERY_DISABLED',
  '11 real_delivery_enabled = true — GATE_REAL_DELIVERY_DISABLED',
  '12 approval record exists — GATE_APPROVAL_MISSING',
  '13 approval id binding — GATE_APPROVAL_MISMATCH',
  '14 approval user binding — FIRST_SEND_APPROVAL_USER_MISMATCH',
  '15 approval status APPROVED — GATE_APPROVAL_NOT_APPROVED',
  '16 approval not expired — GATE_APPROVAL_EXPIRED',
  '17 approval single-use — GATE_APPROVAL_ALREADY_EXECUTED',
  '18 approval not self-approved — GATE_APPROVAL_SELF_APPROVED',
  '19 approval provenance — FIRST_SEND_APPROVAL_PROVENANCE_INVALID',
  '20 approval capability binding — FIRST_SEND_APPROVAL_CAPABILITY_MISMATCH',
  '21 approval Prospect binding — FIRST_SEND_PROSPECT_APPROVAL_MISMATCH',
  '22 approval contact binding — GATE_APPROVAL_CONTACT_MISMATCH',
  '23 approval draft-hash binding — GATE_APPROVAL_DRAFT_HASH_MISMATCH',
  '24 Prospect exists and matches — GATE_PROSPECT_MISSING',
  '25 Prospect ownership / tenant boundary — GATE_PROSPECT_OWNERSHIP_MISMATCH',
  '26 Prospect lifecycle eligibility — GATE_PROSPECT_STATUS_INELIGIBLE',
  '27 Prospect status unchanged since approval — FIRST_SEND_PROSPECT_STATUS_CHANGED',
  '28 VERIFIED primary EMAIL contact resolved — GMAIL_RECIPIENT_NOT_VERIFIED family',
  '29 recipient contact binding (no substitution) — GMAIL_RECIPIENT_CONTACT_MISMATCH',
  '30 credential/sender/idempotency/one-send/client-parameter scan — terminal family',
];

/** Client fields that may never appear on the controlled first-send input.
 * Any bulk directive, secondary recipient, provider parameter, or delivery
 * identity injection is rejected before any state work begins. */
export const FIRST_SEND_CLIENT_DIRECTIVE_FIELDS = [
  'to', 'recipient', 'recipients', 'recipient_emails', 'recipient_email', 'recipient_name',
  'cc', 'bcc', 'from', 'sender', 'sender_email', 'reply_to', 'display_name',
  'mailbox', 'provider_id', 'provider_identity', 'api_parameters', 'params',
  'headers', 'attachments', 'in_reply_to', 'references', 'channel', 'destination',
  'delivery_identity', 'message_hash', 'approved_draft_hash', 'execution_id',
  'approval_id', 'correlation_id', 'schedule', 'send_at', 'retry', 'follow_ups',
  'batch', 'bulk', 'campaign', 'loop', 'count', 'limit',
];

const FIRST_SEND_INPUT_ALLOWED_FIELDS = [
  'prospect_id', 'recipient_contact_id', 'draft_subject', 'draft_body', 'idempotency_key',
];

/** Delivery directives that may NEVER appear on the GOVERNED REQUEST (the
 * server-built 14D-shaped request carries only governance fields — any
 * delivery directive on it is a client injection). */
const FIRST_SEND_REQUEST_DIRECTIVE_FIELDS = [
  'to', 'recipient', 'recipients', 'recipient_email', 'recipient_name',
  'cc', 'bcc', 'from', 'sender', 'sender_email', 'reply_to', 'display_name',
  'mailbox', 'provider_id', 'provider_identity', 'api_parameters', 'params',
  'headers', 'attachments', 'in_reply_to', 'references', 'destination',
  'schedule', 'send_at', 'retry', 'follow_ups', 'batch', 'campaign',
];

const FIRST_SEND_REQUEST_ALLOWED_FIELDS = [
  'prospect_id', 'channel', 'approved_draft_hash', 'approval_id',
  'execution_id', 'correlation_id', 'recipient_contact_id', 'message',
  'message_hash', 'delivery_identity',
];

const FIRST_SEND_VERIFIED_CONTACT_CONTRACT_FIELDS = [
  'contact_id', 'prospect_id', 'contact_type', 'contact_value',
  'verification_status', 'is_primary', 'verified_by', 'verified_at',
];

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL_RE = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
const IDEMPOTENCY_RE = /^[A-Za-z0-9:._-]{8,64}$/;
// Control characters are rejected in ALL draft content. Line breaks (\n, \r)
// are permitted ONLY in the draft BODY — email bodies are multi-line text and
// the deterministic outreach preparation engine emits paragraph breaks; the
// SUBJECT stays fully control-free (header-injection defense). Amendment is
// parity-enforced with the Phase 14D delivery boundary.
const CONTROL_RE = /[\u0000-\u001f\u007f]/;
const BODY_CONTROL_RE = /[\u0000-\u0009\u000b\u000c\u000e-\u001f\u007f]/;
const CREDENTIAL_LEAK_RE = /(ya29\.|AIza[\w-]{10,}|Bearer\s+[A-Za-z0-9._-]{20,}|-----BEGIN [A-Z ]+PRIVATE KEY-----|client_secret["'\s:=]+)/;

function firstSendReject(errorCode, error) {
  return { ok: false, error_code: errorCode, error: error };
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function deepFreeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const key of Object.keys(value)) deepFreeze(value[key]);
  }
  return value;
}

/** Deterministic FNV-1a hash — identical derivation family to the Phase
 * 11/12/13/14D governed bindings; used for binding, never authorization. */
function fnv1a(s) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

/** Governed draft hash over the operator-approved test draft. */
export function deriveFirstSendDraftHash(subject, body) {
  const s = typeof subject === 'string' ? subject : '';
  const b = typeof body === 'string' ? body : '';
  return fnv1a('firstsend-draft|' + s + '|' + b);
}

/** Boundary-facing FNV-1a — byte-identical output format to the
 * authoritative Phase 14D gmailDeliveryBoundary fnv1a (unpadded). The
 * draft hash keeps the padded 8-char format it was approved under; the
 * delivery identity and immutable-message hash are recomputed BY the 14D
 * boundary with its own unpadded fnv1a, so parity requires this exact
 * format here too (a leading zero would otherwise produce '04baa50f'
 * vs '4baa50f' and fail closed as GATE_MESSAGE_MUTATED). */
function fnv1aBoundary(s) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16);
}

/** Delivery identity — identical derivation to Phase 12/13/14D so the
 * request passes the authoritative boundary's binding checks unchanged. */
export function deriveFirstSendDeliveryIdentity(parts) {
  if (!isPlainObject(parts)) return '';
  const s = [
    typeof parts.execution_id === 'string' ? parts.execution_id : '',
    typeof parts.approved_draft_hash === 'string' ? parts.approved_draft_hash : '',
    typeof parts.prospect_id === 'string' ? parts.prospect_id : '',
    typeof parts.channel === 'string' ? parts.channel : '',
  ].join('|');
  return fnv1aBoundary(s);
}

/** Immutable-message hash — identical derivation to Phase 12/13/14D. */
export function deriveFirstSendMessageHash(message) {
  if (!isPlainObject(message)) return '';
  const s = [
    typeof message.approved_draft_hash === 'string' ? message.approved_draft_hash : '',
    typeof message.content_binding === 'string' ? message.content_binding : '',
    typeof message.subject === 'string' ? message.subject : '',
    typeof message.body === 'string' ? message.body : '',
  ].join('|');
  return fnv1aBoundary(s);
}

/** Strict allow-list validation of the operator's controlled first-send
 * input. Recipients, sender, provider parameters, scheduling, bulk and
 * approval/execution references are structurally unavailable — they are
 * server-resolved only. */
export function validateFirstSendInput(raw) {
  if (!isPlainObject(raw)) {
    return firstSendReject('FIRST_SEND_INPUT_INVALID',
      'The controlled first-send input must be a plain object with prospect_id, recipient_contact_id, draft_subject, draft_body and idempotency_key.');
  }
  for (const key of Object.keys(raw)) {
    if (FIRST_SEND_CLIENT_DIRECTIVE_FIELDS.includes(key)) {
      return firstSendReject('GATE_CLIENT_DELIVERY_PARAMETERS_REJECTED',
        'Client-supplied delivery directive "' + String(key).replace(/[^\w.-]/g, '').substring(0, 40) + '" is rejected — recipient, sender, provider identity, scheduling, and all delivery parameters are resolved server-side only.');
    }
    if (!FIRST_SEND_INPUT_ALLOWED_FIELDS.includes(key)) {
      return firstSendReject('FIRST_SEND_INPUT_FIELD_REJECTED',
        'Input field "' + String(key).replace(/[^\w.-]/g, '').substring(0, 40) + '" is not part of the controlled first-send contract.');
    }
  }
  if (typeof raw.prospect_id !== 'string' || !UUID_RE.test(raw.prospect_id.trim().toLowerCase())) {
    return firstSendReject('FIRST_SEND_INPUT_INVALID', 'prospect_id must be the bounded prospect identifier issued at record creation.');
  }
  if (typeof raw.recipient_contact_id !== 'string' || !UUID_RE.test(raw.recipient_contact_id.trim().toLowerCase())) {
    return firstSendReject('FIRST_SEND_INPUT_INVALID', 'recipient_contact_id must be the server-issued verified contact identifier.');
  }
  const content = validateFirstSendDraftContent(raw.draft_subject, raw.draft_body);
  if (!content.ok) return content;
  if (typeof raw.idempotency_key !== 'string' || !IDEMPOTENCY_RE.test(raw.idempotency_key.trim())) {
    return firstSendReject('FIRST_SEND_INPUT_INVALID', 'idempotency_key must be 8-64 characters from letters, digits, :, ., _, -.');
  }
  return deepFreeze({
    ok: true,
    input: {
      prospect_id: raw.prospect_id.trim().toLowerCase(),
      recipient_contact_id: raw.recipient_contact_id.trim().toLowerCase(),
      draft_subject: raw.draft_subject,
      draft_body: raw.draft_body,
      idempotency_key: raw.idempotency_key.trim(),
      draft_hash: deriveFirstSendDraftHash(raw.draft_subject, raw.draft_body),
    },
  });
}

/** Draft content validation: bounded plain text, carries the explicit
 * controlled-test marker, and never carries credential material. */
export function validateFirstSendDraftContent(subject, body) {
  if (typeof subject !== 'string' || typeof body !== 'string') {
    return firstSendReject('FIRST_SEND_INPUT_INVALID', 'draft_subject and draft_body are required plain strings.');
  }
  if (subject.length === 0 || subject.length > FIRST_SEND_MAX_SUBJECT || CONTROL_RE.test(subject)) {
    return firstSendReject('FIRST_SEND_INPUT_INVALID', 'draft_subject must be 1-200 characters of bounded plain text.');
  }
  if (!subject.includes(FIRST_SEND_CONTROLLED_TEST_MARKER)) {
    return firstSendReject('FIRST_SEND_CONTROLLED_MARKER_REQUIRED',
      'The controlled test draft subject must carry the explicit marker "' + FIRST_SEND_CONTROLLED_TEST_MARKER + '" — nothing unmarked may ever be sent by this phase.');
  }
  if (body.length === 0 || body.length > FIRST_SEND_MAX_BODY || BODY_CONTROL_RE.test(body)) {
    return firstSendReject('FIRST_SEND_INPUT_INVALID', 'draft_body must be 1-2000 characters of bounded plain text (line breaks permitted).');
  }
  if (CREDENTIAL_LEAK_RE.test(subject) || CREDENTIAL_LEAK_RE.test(body)) {
    return firstSendReject('FIRST_SEND_CREDENTIAL_LEAK_REJECTED',
      'The draft content carries credential-like material — credential material may never enter an outreach message.');
  }
  return { ok: true };
}

/**
 * THE server-side recipient resolver — identical contract to the Phase 14D
 * resolver (parity-enforced by tests). The ONLY permitted recipient source
 * is the Prospect's VERIFIED, primary, EMAIL ProspectContact. Fails closed
 * deterministically; no recipient is ever inferred from any other data.
 */
export function resolveFirstSendRecipient(prospectRecord, verifiedContactRecord) {
  if (!isPlainObject(prospectRecord) || typeof prospectRecord.prospect_id !== 'string') {
    return firstSendReject('GATE_PROSPECT_MISSING', 'No authoritative Prospect record exists — recipient resolution fails closed.');
  }
  if (!isPlainObject(verifiedContactRecord)) {
    return firstSendReject('GMAIL_RECIPIENT_NOT_VERIFIED',
      'No VERIFIED primary EMAIL ProspectContact exists for this Prospect — recipient resolution fails closed. No recipient is inferred from any other data.');
  }
  for (const key of Object.keys(verifiedContactRecord)) {
    if (!FIRST_SEND_VERIFIED_CONTACT_CONTRACT_FIELDS.includes(key)) {
      return firstSendReject('GMAIL_CONTACT_FIELD_REJECTED',
        'Verified-contact field "' + String(key).replace(/[^\w.-]/g, '').substring(0, 40) + '" is not part of the verified contact contract.');
    }
  }
  if (typeof verifiedContactRecord.contact_id !== 'string' || !UUID_RE.test(verifiedContactRecord.contact_id.trim().toLowerCase())) {
    return firstSendReject('GMAIL_CONTACT_ID_INVALID', 'The verified contact must carry its server-issued contact identifier.');
  }
  if (verifiedContactRecord.contact_type !== FIRST_SEND_CHANNEL) {
    return firstSendReject('GMAIL_CONTACT_TYPE_UNSUPPORTED', 'Only a VERIFIED EMAIL contact may resolve as an outreach recipient — no other contact type exists.');
  }
  if (typeof verifiedContactRecord.prospect_id !== 'string' || verifiedContactRecord.prospect_id.trim().toLowerCase() !== prospectRecord.prospect_id.trim().toLowerCase()) {
    return firstSendReject('GMAIL_CONTACT_PROSPECT_MISMATCH', 'The verified contact is not bound to this Prospect — no cross-Prospect recipient is permitted.');
  }
  if (verifiedContactRecord.verification_status === 'REVOKED') {
    return firstSendReject('GMAIL_CONTACT_REVOKED', 'The contact has been revoked — a revoked contact can never resolve as a recipient.');
  }
  if (verifiedContactRecord.verification_status !== 'VERIFIED') {
    return firstSendReject('GMAIL_CONTACT_UNVERIFIED', 'The contact is not VERIFIED — unverified recipients are never contacted. Verification is an explicit governed human action, never implied by email syntax.');
  }
  if (verifiedContactRecord.is_primary !== true) {
    return firstSendReject('GMAIL_CONTACT_NOT_PRIMARY', 'The contact is not the Prospect primary contact — only the single VERIFIED primary EMAIL contact may resolve as a recipient.');
  }
  const email = typeof verifiedContactRecord.contact_value === 'string' ? verifiedContactRecord.contact_value.trim().toLowerCase() : '';
  if (email.length === 0 || email.length > 320 || !EMAIL_RE.test(email)) {
    return firstSendReject('GMAIL_RECIPIENT_INVALID', 'The verified contact does not carry a valid recipient address — delivery fails closed.');
  }
  if (email === FIRST_SEND_SENDER_IDENTITY) {
    return firstSendReject('GMAIL_RECIPIENT_INVALID', 'The fixed sender identity may never be used as an outreach recipient.');
  }
  if (typeof verifiedContactRecord.verified_by !== 'string' || verifiedContactRecord.verified_by.trim().length === 0 || verifiedContactRecord.verified_by.length > 100) {
    return firstSendReject('GMAIL_CONTACT_UNVERIFIED', 'The contact carries no human verification provenance — unverified recipients are never contacted.');
  }
  if (typeof verifiedContactRecord.verified_at !== 'string' || verifiedContactRecord.verified_at.length < 10) {
    return firstSendReject('GMAIL_CONTACT_UNVERIFIED', 'The contact carries no verification timestamp — unverified recipients are never contacted.');
  }
  return {
    ok: true,
    recipient: deepFreeze({
      email: email,
      contact_id: verifiedContactRecord.contact_id.trim().toLowerCase(),
      verified_by: verifiedContactRecord.verified_by.trim(),
    }),
  };
}

/** Builds the Phase 14D-compatible governed delivery request. The message
 * recipient is structurally null — recipients are server-resolved only
 * inside the authoritative delivery boundary. */
export function buildFirstSendGovernedRequest(parts) {
  if (!isPlainObject(parts)) {
    return firstSendReject('FIRST_SEND_REQUEST_INVALID', 'The governed request parts are invalid.');
  }
  for (const key of Object.keys(parts)) {
    if (!['prospect_id', 'approval_id', 'execution_id', 'correlation_id', 'recipient_contact_id', 'approved_draft_hash', 'subject', 'body'].includes(key)) {
      return firstSendReject('FIRST_SEND_REQUEST_INVALID',
        'Request part "' + String(key).replace(/[^\w.-]/g, '').substring(0, 40) + '" is not part of the governed first-send request contract.');
    }
  }
  if (typeof parts.prospect_id !== 'string' || !UUID_RE.test(parts.prospect_id.trim().toLowerCase())) {
    return firstSendReject('FIRST_SEND_REQUEST_INVALID', 'prospect_id must be a bounded UUID.');
  }
  if (typeof parts.approval_id !== 'string' || !UUID_RE.test(parts.approval_id.trim().toLowerCase())) {
    return firstSendReject('FIRST_SEND_REQUEST_INVALID', 'approval_id must be a bounded UUID.');
  }
  if (typeof parts.execution_id !== 'string' || !UUID_RE.test(parts.execution_id.trim().toLowerCase())) {
    return firstSendReject('FIRST_SEND_REQUEST_INVALID', 'execution_id must be a bounded UUID.');
  }
  if (typeof parts.correlation_id !== 'string' || parts.correlation_id.trim().length < 8 || parts.correlation_id.length > 200) {
    return firstSendReject('FIRST_SEND_REQUEST_INVALID', 'correlation_id must be the governed correlation identifier.');
  }
  if (typeof parts.recipient_contact_id !== 'string' || !UUID_RE.test(parts.recipient_contact_id.trim().toLowerCase())) {
    return firstSendReject('FIRST_SEND_REQUEST_INVALID', 'recipient_contact_id must be a bounded UUID.');
  }
  if (typeof parts.approved_draft_hash !== 'string' || !/^[0-9a-f]{8,64}$/.test(parts.approved_draft_hash.trim().toLowerCase())) {
    return firstSendReject('FIRST_SEND_REQUEST_INVALID', 'approved_draft_hash must be 8-64 lowercase hexadecimal characters.');
  }
  if (typeof parts.subject !== 'string' || typeof parts.body !== 'string') {
    return firstSendReject('FIRST_SEND_REQUEST_INVALID', 'The approved draft subject and body are required.');
  }
  const normalized = {
    prospect_id: parts.prospect_id.trim().toLowerCase(),
    approval_id: parts.approval_id.trim().toLowerCase(),
    execution_id: parts.execution_id.trim().toLowerCase(),
    correlation_id: parts.correlation_id.trim(),
    recipient_contact_id: parts.recipient_contact_id.trim().toLowerCase(),
    approved_draft_hash: parts.approved_draft_hash.trim().toLowerCase(),
  };
  const message = deepFreeze({
    approved_draft_hash: normalized.approved_draft_hash,
    content_binding: 'APPROVED_DRAFT_HASH',
    to: null,
    subject: parts.subject,
    body: parts.body,
  });
  const request = deepFreeze({
    prospect_id: normalized.prospect_id,
    channel: FIRST_SEND_CHANNEL,
    approved_draft_hash: normalized.approved_draft_hash,
    approval_id: normalized.approval_id,
    execution_id: normalized.execution_id,
    correlation_id: normalized.correlation_id,
    recipient_contact_id: normalized.recipient_contact_id,
    message: message,
    message_hash: deriveFirstSendMessageHash(message),
    delivery_identity: deriveFirstSendDeliveryIdentity({
      execution_id: normalized.execution_id,
      approved_draft_hash: normalized.approved_draft_hash,
      prospect_id: normalized.prospect_id,
      channel: FIRST_SEND_CHANNEL,
    }),
  });
  return deepFreeze({ ok: true, request: request });
}

/**
 * THE 30-point pre-send checklist. Pure and deterministic: all state is
 * supplied as a server-read snapshot by the trusted orchestrator, in the
 * fixed order documented in FIRST_SEND_PRE_SEND_CHECKLIST. The first
 * failure terminates with a deterministic error code and NOTHING is sent.
 */
export function evaluateFirstSendPreconditions(serverState) {
  if (!isPlainObject(serverState)) {
    return firstSendReject('FIRST_SEND_STATE_INVALID', 'The first-send boundary requires a server-read state snapshot.');
  }
  // 1. authenticated caller
  const caller = serverState.authenticated_caller;
  if (!isPlainObject(caller) || typeof caller.user_id !== 'string' || caller.user_id.length === 0) {
    return firstSendReject('FIRST_SEND_CALLER_NOT_AUTHENTICATED', 'Check 1 failed: no authenticated caller — the first send fails closed.');
  }
  // 2. operator authorization — platform roles only
  if (!FIRST_SEND_OPERATOR_ROLES.includes(caller.role)) {
    return firstSendReject('FIRST_SEND_OPERATOR_UNAUTHORIZED',
      'Check 2 failed: the controlled first send may only be requested by a platform operator (super_admin, platform_admin, founder_root_admin).');
  }
  // 3. governed request shape
  const request = serverState.request;
  if (!isPlainObject(request)) {
    return firstSendReject('FIRST_SEND_REQUEST_INVALID', 'Check 3 failed: no governed first-send request was supplied.');
  }
  for (const key of Object.keys(request)) {
    if (FIRST_SEND_REQUEST_DIRECTIVE_FIELDS.includes(key)) {
      return firstSendReject('GATE_CLIENT_DELIVERY_PARAMETERS_REJECTED',
        'Check 3 failed: client-supplied delivery directive "' + String(key).replace(/[^\w.-]/g, '').substring(0, 40) + '" is rejected — delivery parameters are resolved server-side only.');
    }
    if (!FIRST_SEND_REQUEST_ALLOWED_FIELDS.includes(key)) {
      return firstSendReject('FIRST_SEND_REQUEST_INVALID',
        'Check 3 failed: request field "' + String(key).replace(/[^\w.-]/g, '').substring(0, 40) + '" is not part of the governed first-send request contract.');
    }
  }
  if (isPlainObject(request.message)) {
    for (const key of Object.keys(request.message)) {
      // A null-valued 'to' is the frozen server-built contract shape; any
      // directive key carrying a VALUE is a client injection.
      if (FIRST_SEND_REQUEST_DIRECTIVE_FIELDS.includes(key) && request.message[key] !== null && request.message[key] !== undefined) {
        return firstSendReject('GATE_CLIENT_DELIVERY_PARAMETERS_REJECTED',
          'Check 3 failed: client-supplied delivery directive "' + String(key).replace(/[^\w.-]/g, '').substring(0, 40) + '" is rejected — delivery parameters are resolved server-side only.');
      }
      if (!['approved_draft_hash', 'content_binding', 'to', 'subject', 'body'].includes(key)) {
        return firstSendReject('FIRST_SEND_REQUEST_INVALID',
          'Check 3 failed: message field "' + String(key).replace(/[^\w.-]/g, '').substring(0, 40) + '" is not part of the governed message contract.');
      }
    }
  }
  if (request.message && request.message.to !== null && request.message.to !== undefined) {
    return firstSendReject('GATE_CLIENT_DELIVERY_PARAMETERS_REJECTED',
      'Check 3 failed: a client-supplied recipient is never accepted — recipient resolution is a server-side step.');
  }
  // 4/5. orchestration config — fail-closed when missing or stopped
  const config = serverState.orchestration_config;
  if (!isPlainObject(config) || config.stop_new_executions === true) {
    return firstSendReject('FIRST_SEND_ORCHESTRATION_STOPPED',
      'Check 4/5 failed: the Agent Orchestration emergency stop is active or the config is missing — the first send fails closed.');
  }
  // 6. risk threshold — the operator path requires the threshold to remain
  // exactly MEDIUM: the normal agent path is then structurally blocked for
  // the HIGH-risk execute_prospect_outreach tool, and any threshold change
  // (up or down) halts the first send for operator review.
  if (config.max_risk_level !== 'medium') {
    return firstSendReject('FIRST_SEND_RISK_THRESHOLD_CHANGED',
      'Check 6 failed: the global risk threshold is no longer MEDIUM — the first send halts for operator review of the orchestration boundary.');
  }
  // 7. governed outreach tool explicitly ACTIVE + enabled (operator action)
  const toolRegistry = serverState.tool_registry_record;
  if (!isPlainObject(toolRegistry) || toolRegistry.tool_id !== FIRST_SEND_TOOL_ID
    || toolRegistry.status !== 'ACTIVE' || toolRegistry.enabled !== true) {
    return firstSendReject('FIRST_SEND_TOOL_NOT_ACTIVE',
      'Check 7 failed: the execute_prospect_outreach tool is not ACTIVE + enabled — this is an explicit operator activation that has not occurred.');
  }
  // 8/9. Gmail connector registry — ACTIVE + enabled + supports delivery
  const connector = serverState.connector_registry_record;
  if (!isPlainObject(connector) || connector.connector_id !== FIRST_SEND_CONNECTOR_ID) {
    return firstSendReject('GATE_CONNECTOR_MISSING',
      'Check 8 failed: the Google Workspace Gmail connector registry record does not exist.');
  }
  if (connector.status !== 'ACTIVE' || connector.enabled !== true || connector.supports_delivery !== true) {
    return firstSendReject('GATE_CONNECTOR_DISABLED',
      'Check 9 failed: the Google Workspace Gmail connector is not ACTIVE + enabled for delivery — the first send fails closed.');
  }
  // 10/11. global real-delivery permission — fail-closed when missing or off
  const globalConfig = serverState.global_real_delivery_record;
  if (!isPlainObject(globalConfig) || globalConfig.real_delivery_enabled !== true) {
    return firstSendReject('GATE_REAL_DELIVERY_DISABLED',
      'Check 10/11 failed: the global real-delivery permission is not enabled — the first send fails closed.');
  }
  // 12/13. approval exists and is the approval bound to this request
  const approval = serverState.approval_record;
  if (!isPlainObject(approval)) {
    return firstSendReject('GATE_APPROVAL_MISSING', 'Check 12 failed: no server approval record exists for this send.');
  }
  if (approval.approval_id !== request.approval_id) {
    return firstSendReject('GATE_APPROVAL_MISMATCH', 'Check 13 failed: the request approval does not match the server approval record.');
  }
  // 14. approval user binding — the approval belongs to the requesting operator
  if (approval.user_id !== caller.user_id) {
    return firstSendReject('FIRST_SEND_APPROVAL_USER_MISMATCH',
      'Check 14 failed: the approval belongs to a different user — no cross-user approval may authorize this send.');
  }
  // 15. approval status
  if (approval.status !== 'APPROVED') {
    return firstSendReject('GATE_APPROVAL_NOT_APPROVED',
      'Check 15 failed: the human approval is ' + String(approval.status) + ' — the first send fails closed.');
  }
  // 16. approval not expired
  const now = typeof serverState.now === 'string' ? serverState.now : '';
  if (typeof approval.expires_at === 'string' && now !== '' && approval.expires_at <= now) {
    return firstSendReject('GATE_APPROVAL_EXPIRED', 'Check 16 failed: the human approval has expired — the first send fails closed.');
  }
  // 17. single-use approval
  if (serverState.approval_already_executed === true
    || (isPlainObject(approval.metadata) && typeof approval.metadata.executed_execution_id === 'string')) {
    return firstSendReject('GATE_APPROVAL_ALREADY_EXECUTED',
      'Check 17 failed: the approval has already been consumed — approvals are single-use.');
  }
  // 18. self-approval prohibition
  if (!approval.approver_user_id || approval.approver_user_id === approval.user_id) {
    return firstSendReject('GATE_APPROVAL_SELF_APPROVED',
      'Check 18 failed: self-approval is prohibited; this approval cannot authorize the send.');
  }
  // 19. approval provenance
  if (approval.source !== FIRST_SEND_APPROVAL_SOURCE) {
    return firstSendReject('FIRST_SEND_APPROVAL_PROVENANCE_INVALID',
      'Check 19 failed: only server-issued approvals can authorize the first send.');
  }
  // 20. approval capability binding
  if (approval.agent_id !== FIRST_SEND_AGENT_ID || approval.tool_id !== FIRST_SEND_TOOL_ID) {
    return firstSendReject('FIRST_SEND_APPROVAL_CAPABILITY_MISMATCH',
      'Check 20 failed: the approval does not match the growth_agent / execute_prospect_outreach capability.');
  }
  const approvalMeta = isPlainObject(approval.metadata) ? approval.metadata : {};
  // 21. approval Prospect binding
  if (approvalMeta.prospect_id !== request.prospect_id) {
    return firstSendReject('FIRST_SEND_PROSPECT_APPROVAL_MISMATCH',
      'Check 21 failed: the approval was issued for a different Prospect — no Prospect substitution after approval.');
  }
  // 22. approval contact binding
  if (approvalMeta.recipient_contact_id !== request.recipient_contact_id) {
    return firstSendReject('GATE_APPROVAL_CONTACT_MISMATCH',
      'Check 22 failed: the approved recipient contact and the request contact differ — no contact substitution after approval.');
  }
  // 23. approval draft-hash binding
  if (approvalMeta.approved_draft_hash !== request.approved_draft_hash) {
    return firstSendReject('GATE_APPROVAL_DRAFT_HASH_MISMATCH',
      'Check 23 failed: the approved draft hash does not match the request — no draft substitution is permitted.');
  }
  // 24. Prospect exists and matches
  const prospect = serverState.prospect_record;
  if (!isPlainObject(prospect) || typeof prospect.prospect_id !== 'string' || prospect.prospect_id.trim().toLowerCase() !== request.prospect_id) {
    return firstSendReject('GATE_PROSPECT_MISSING', 'Check 24 failed: no matching authoritative Prospect record exists.');
  }
  // 25. ownership / tenant boundary
  const ownerOk = prospect.owner_user_id === caller.user_id;
  const tenantOk = typeof caller.organization_id === 'string' && caller.organization_id.length > 0
    && prospect.organization_id === caller.organization_id;
  if (!ownerOk && !tenantOk) {
    return firstSendReject('GATE_PROSPECT_OWNERSHIP_MISMATCH',
      'Check 25 failed: the Prospect does not belong to the authorized owner or tenant.');
  }
  // 26. Prospect lifecycle eligibility
  if (!FIRST_SEND_PROSPECT_ELIGIBLE_STATUSES.includes(prospect.status)) {
    return firstSendReject('GATE_PROSPECT_STATUS_INELIGIBLE',
      'Check 26 failed: the Prospect lifecycle status is not QUALIFIED or PURSUING.');
  }
  // 27. stale-approval protection: the approval bound the observed status
  if (typeof approvalMeta.prospect_status === 'string' && approvalMeta.prospect_status !== prospect.status) {
    return firstSendReject('FIRST_SEND_PROSPECT_STATUS_CHANGED',
      'Check 27 failed: the Prospect status changed since approval — the approval is stale; no send is performed.');
  }
  // 28. server-resolved recipient — ONLY the VERIFIED primary EMAIL contact
  const recipientResult = resolveFirstSendRecipient(prospect, serverState.verified_contact_record);
  if (!recipientResult.ok) {
    return firstSendReject(recipientResult.error_code, 'Check 28 failed: ' + recipientResult.error);
  }
  // 29. recipient binding — the resolved contact is exactly the approved one
  if (recipientResult.recipient.contact_id !== request.recipient_contact_id) {
    return firstSendReject('GMAIL_RECIPIENT_CONTACT_MISMATCH',
      'Check 29 failed: the resolved VERIFIED primary contact does not match the approved recipient contact — no contact substitution or post-approval recipient change is permitted.');
  }
  // 30a. credential status from the Phase 14C boundary — connected identity,
  // scope, and fixed sender. The token itself NEVER enters this module.
  const credentialStatus = serverState.credential_status;
  if (!isPlainObject(credentialStatus) || credentialStatus.connected !== true) {
    return firstSendReject('GMAIL_CONNECTOR_UNAVAILABLE',
      'Check 30 failed: the Base44-managed Gmail OAuth connector is not available with the required identity and scope — the boundary fails closed and nothing is sent.');
  }
  if (credentialStatus.expected_identity !== FIRST_SEND_CONNECTOR_IDENTITY) {
    return firstSendReject('FIRST_SEND_CONNECTOR_IDENTITY_MISMATCH',
      'Check 30 failed: the connected Gmail identity is not the authorized Google Workspace account.');
  }
  if (credentialStatus.sender_identity !== FIRST_SEND_SENDER_IDENTITY) {
    return firstSendReject('FIRST_SEND_SENDER_IDENTITY_REJECTED',
      'Check 30 failed: the only permitted sender is the fixed server-controlled EXECLEAD.AI Growth mailbox alias.');
  }
  if (credentialStatus.required_scope !== FIRST_SEND_GMAIL_SCOPE) {
    return firstSendReject('FIRST_SEND_SCOPE_MISMATCH',
      'Check 30 failed: the authorized Gmail scope is not the fixed gmail.send scope.');
  }
  if (serverState.declared_sender !== FIRST_SEND_SENDER_IDENTITY) {
    return firstSendReject('GATE_SENDER_IDENTITY_REJECTED',
      'Check 30 failed: the declared sender is not the fixed server-controlled Growth mailbox.');
  }
  // 30b. idempotency — no prior success for this delivery identity
  const prior = Array.isArray(serverState.prior_delivery_results) ? serverState.prior_delivery_results : [];
  if (prior.includes('SENT') || prior.includes('DELIVERED')) {
    return firstSendReject('GATE_DELIVERY_ALREADY_SUCCEEDED',
      'Check 30 failed: this logical delivery has already succeeded — replay is blocked.');
  }
  // 30c. ONE-send structural limit across the entire phase
  const priorRealSent = Array.isArray(serverState.prior_real_sent_results) ? serverState.prior_real_sent_results : [];
  if (priorRealSent.length > 0) {
    const own = priorRealSent.filter((r) => isPlainObject(r) && r.delivery_identity === request.delivery_identity);
    if (own.length > 0) {
      return {
        ok: false, replay: true, error_code: 'FIRST_SEND_REPLAY',
        error: 'Check 30 failed: this controlled first send already completed — the stored result is replayed idempotently and NO second message is sent.',
      };
    }
    return firstSendReject('FIRST_SEND_ALREADY_COMPLETED',
      'Check 30 failed: ONE controlled first send has already completed — this phase is structurally limited to a single real email and no further send is permitted.');
  }
  // 30d. redundant final scan — no client-controlled delivery directives
  // anywhere on the request (check 3 already rejected them; this is
  // defense in depth against state races after the state reads began)
  for (const key of Object.keys(request)) {
    if (FIRST_SEND_REQUEST_DIRECTIVE_FIELDS.includes(key)) {
      return firstSendReject('GATE_CLIENT_DELIVERY_PARAMETERS_REJECTED',
        'Check 30 failed: client-supplied delivery directive "' + String(key).replace(/[^\w.-]/g, '').substring(0, 40) + '" is rejected.');
    }
  }
  if (isPlainObject(request.message)) {
    for (const key of Object.keys(request.message)) {
      if (FIRST_SEND_REQUEST_DIRECTIVE_FIELDS.includes(key) && request.message[key] !== null && request.message[key] !== undefined) {
        return firstSendReject('GATE_CLIENT_DELIVERY_PARAMETERS_REJECTED',
          'Check 30 failed: client-supplied delivery directive "' + String(key).replace(/[^\w.-]/g, '').substring(0, 40) + '" is rejected — delivery parameters are server-side only.');
      }
    }
  }
  // 30e. immutable message + delivery identity bindings
  if (deriveFirstSendMessageHash(request.message) !== request.message_hash) {
    return firstSendReject('GATE_MESSAGE_MUTATED',
      'Check 30 failed: the message hash no longer matches the approved immutable draft.');
  }
  const identity = deriveFirstSendDeliveryIdentity({
    execution_id: request.execution_id,
    approved_draft_hash: request.approved_draft_hash,
    prospect_id: request.prospect_id,
    channel: request.channel,
  });
  if (identity !== request.delivery_identity) {
    return firstSendReject('GATE_DELIVERY_IDENTITY_MISMATCH',
      'Check 30 failed: the delivery identity no longer matches the governed request.');
  }
  if (request.approved_draft_hash !== approvalMeta.approved_draft_hash) {
    return firstSendReject('GATE_APPROVAL_DRAFT_HASH_MISMATCH',
      'Check 30 failed: the request draft hash is no longer the approval-bound draft.');
  }
  return deepFreeze({
    ok: true,
    checks_passed: FIRST_SEND_CHECKS_TOTAL,
    recipient: recipientResult.recipient,
    sender_identity: FIRST_SEND_SENDER_IDENTITY,
    request: request,
    boundary_version: FIRST_SEND_BOUNDARY_VERSION,
  });
}

/** Truthful, static phase status. Runtime decisions always read live
 * server state; NO email is sent by this module. */
export function getFirstSendBoundaryStatus() {
  return deepFreeze({
    phase: '14F',
    boundary_version: FIRST_SEND_BOUNDARY_VERSION,
    email_sent_by_this_module: false,
    network_calls: 0,
    transport: 'none — this module delegates the single send exclusively to the Phase 14D executeGovernedGmailDelivery boundary',
    operator_roles: FIRST_SEND_OPERATOR_ROLES,
    sender_identity: FIRST_SEND_SENDER_IDENTITY,
    connector_identity: FIRST_SEND_CONNECTOR_IDENTITY,
    gmail_scope: FIRST_SEND_GMAIL_SCOPE,
    one_send_limit: 'ONE real email for the entire phase; same-identity replays return the stored result; new attempts fail closed with FIRST_SEND_ALREADY_COMPLETED',
    agent_path: 'remains blocked — execute_prospect_outreach is HIGH risk while the global threshold is MEDIUM; no Workforce agent can reach a delivery boundary',
    checks_total: FIRST_SEND_CHECKS_TOTAL,
    checklist: FIRST_SEND_PRE_SEND_CHECKLIST,
  });
}
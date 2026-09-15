/**
 * Gmail Delivery Boundary — Phase 14D Controlled Gmail Delivery Activation
 * Gate and First-Send Readiness.
 * ============================================================
 * SINGLE PURPOSE: evaluate, server-side, whether ONE explicitly
 * authorized, human-approved governed OutreachDeliveryRequest may be
 * transmitted through the Base44-managed Gmail OAuth connector from the
 * fixed EXECLEAD.AI Growth mailbox — and perform that single send only
 * after every safeguard passes.
 *
 * THE GATE REMAINS CLOSED — NO EMAIL IS SENT BY THIS PHASE:
 * - Real delivery requires BOTH the OutreachRealDeliveryConfig global
 *   permission (real_delivery_enabled=true, default false, explicit
 *   operator action only) AND the google_workspace_gmail
 *   ExternalDeliveryConnectorRegistry record being ACTIVE+enabled. Both
 *   are false today and are never changed by code.
 * - Recipient resolution (Phase 14E): the ONLY permitted source is the
 *   Prospect's VERIFIED primary EMAIL ProspectContact — resolved
 *   server-side, revalidated here, and bound to the approved
 *   recipient_contact_id so the recipient can never change after
 *   approval. With no verified primary contact the resolver fails
 *   closed deterministically (GMAIL_RECIPIENT_NOT_VERIFIED) and no
 *   recipient can ever be inferred from a company name, domain,
 *   website, employee name, owner or user email, search results, Gmail
 *   contacts, LLM output, or any client or agent string. Recipient data
 *   never enters prompts or LLM context.
 * - The client and the Growth Agent can never control the recipient,
 *   sender, cc, bcc, provider identity, or any delivery parameter:
 *   the governed request is a strict allow-list and every extra field is
 *   rejected before any state is read.
 * - execute_prospect_outreach remains DRAFT+disabled and the Gmail
 *   connector registry record remains DRAFT+enabled=false, so the
 *   governed orchestration path cannot reach this boundary until the
 *   operator activates it. This module is not wired into any backend
 *   function in this phase; the single remaining wiring step is part of
 *   the explicit operator activation action.
 *
 * GOVERNED CHAIN (enforced order, single message, single use):
 *   Growth Agent -> Human Approval -> AgentOrchestrationCore -> Phase 11
 *   execute_prospect_outreach -> Phase 12 OutreachDeliveryRequest ->
 *   this delivery gate (20 ordered server-state validations) -> Phase
 *   14C connector-token credential boundary (identity, scope, sender) ->
 *   single Gmail API send -> truthful audit (SENT is provider
 *   acceptance only; DELIVERED is NEVER claimed by this boundary).
 *
 * MESSAGE IMMUTABILITY: the transport performs provider-required
 * encoding ONLY (RFC 5322 headers + base64url). No rewriting, no AI
 * personalization, no signature injection, no CTA modification, no
 * subject modification, no channel conversion, no hidden footer.
 *
 * CREDENTIAL ISOLATION: the Gmail connector token is acquired inside
 * the Phase 14C server-only boundary from a strictly allow-listed
 * gateway snapshot supplied by trusted server code, and is used only
 * inside the transport call. It is never returned, persisted, logged, or
 * included in any result, audit, execution record, approval, Prospect,
 * telemetry, or error.
 *
 * NO BULK/BACKGROUND BEHAVIOR: single request in, single message out.
 * No loops over Prospect collections, no campaigns, no batches, no
 * retry, no follow-up, no scheduling, no background delivery.
 *
 * This module is pure: no imports, no database access, no entity
 * writes (the execution boundary persists audits under the service
 * role), no LLM. It is written in plain JS syntax so the exact shipped
 * file can be executed by the deterministic test suite. The single
 * authorized Gmail API call lives only inside gmailTransportSend and is
 * reachable only after every gate check passes.
 */

export const GMAIL_DELIVERY_BOUNDARY_VERSION = '14E.1.0.0';
export const OUTREACH_REAL_DELIVERY_CONFIG_ID = 'outreach_real_delivery_global';
export const GMAIL_REAL_DELIVERY_REQUIREMENTS = [
  'outreach_real_delivery_global real_delivery_enabled = true (explicit operator action)',
  'google_workspace_gmail ExternalDeliveryConnectorRegistry record ACTIVE + enabled (explicit operator action)',
  'verified human-approved governed OutreachDeliveryRequest (single use, unexpired)',
  'server-resolved recipient from the Prospect VERIFIED primary EMAIL ProspectContact (Phase 14E verified-contact capability; fails closed when none exists)',
];
export const GMAIL_DELIVERY_AGENT_ID = 'growth_agent';
export const GMAIL_DELIVERY_TOOL_ID = 'execute_prospect_outreach';
export const GMAIL_DELIVERY_CONNECTOR_ID = 'google_workspace_gmail';
export const GMAIL_DELIVERY_CONNECTOR_TYPE = 'GOOGLE_WORKSPACE_GMAIL';
export const GMAIL_DELIVERY_CONNECTOR_VERSION = '1.0.0';
export const GMAIL_DELIVERY_SENDER_IDENTITY = 'growth@execleadai.co';
export const GMAIL_DELIVERY_CHANNEL = 'EMAIL';
export const GMAIL_DELIVERY_TRANSPORT_SCOPE = 'https://www.googleapis.com/auth/gmail.send';
export const GMAIL_DELIVERY_TRANSPORT_ENDPOINT = 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send';
export const GMAIL_DELIVERY_FORBIDDEN_RESULT_STATUS = 'DELIVERED';
export const GMAIL_DELIVERY_PROSPECT_ELIGIBLE_STATUSES = ['QUALIFIED', 'PURSUING'];
export const GMAIL_DELIVERY_RECIPIENT_RESOLUTION_NOT_IMPLEMENTED = 'NOT_IMPLEMENTED';
export const GMAIL_DELIVERY_RECIPIENT_RESOLUTION_VERIFIED_CONTACT = 'SERVER_VERIFIED_PROSPECT_CONTACT';

/** The frozen Phase 12 server-built destination contract fields. These
 * keys are legal ONLY in the server-built contract shape (EMAIL channel,
 * null recipient_reference, null provider_id) — any injected value is
 * rejected. */
export const GMAIL_DESTINATION_CONTRACT_FIELDS = [
  'destination_type', 'resolution_status', 'resolved_by', 'recipient_reference', 'provider_id',
];

/** Validates the governed request destination against the exact frozen
 * Phase 12 server-built contract. Recipients and provider identifiers are
 * server-resolved only — a destination carrying a recipient reference or
 * provider identifier is a client injection and is rejected. */
export function validateRealDeliveryDestination(destination) {
  if (destination === null || destination === undefined) return { ok: true };
  if (!isPlainObject(destination)) {
    return reject('GATE_REQUEST_INVALID', 'The destination must be the server-built Phase 12 destination contract object.');
  }
  for (const key of Object.keys(destination)) {
    if (!GMAIL_DESTINATION_CONTRACT_FIELDS.includes(key)) {
      return reject('GATE_CLIENT_DELIVERY_PARAMETERS_REJECTED',
        'Destination field "' + String(key).replace(/[^\w.-]/g, '').substring(0, 40) + '" is rejected — the destination is a server-built contract only.');
    }
  }
  if (destination.destination_type !== GMAIL_DELIVERY_CHANNEL) {
    return reject('GATE_REQUEST_INVALID', 'The destination must be the EMAIL channel contract.');
  }
  if (destination.recipient_reference !== null && destination.recipient_reference !== undefined) {
    return reject('GATE_CLIENT_DELIVERY_PARAMETERS_REJECTED',
      'A destination recipient_reference is never accepted — recipients are resolved server-side only.');
  }
  if (destination.provider_id !== null && destination.provider_id !== undefined) {
    return reject('GATE_CLIENT_DELIVERY_PARAMETERS_REJECTED',
      'A destination provider identifier is never accepted — provider mapping is server-side only.');
  }
  return { ok: true };
}

/** Fields a CLIENT or AGENT may never supply on the governed request.
 * The request allow-list below is the authoritative rejection surface;
 * this list documents the explicitly forbidden delivery directives. */
export const GMAIL_CLIENT_DELIVERY_FIELD_NAMES = [
  'to', 'recipient', 'recipient_email', 'recipient_name', 'recipient_url',
  'gmail_address', 'provider_recipient_id', 'cc', 'bcc', 'from', 'sender',
  'sender_email', 'reply_to', 'display_name', 'mailbox', 'sender_address',
  'provider_id', 'provider_identity', 'api_parameters', 'params',
  'headers', 'attachments', 'in_reply_to', 'references',
];

/** Strict field contract of the server-read VERIFIED ProspectContact
 * snapshot supplied by trusted server code (the Phase 14E verified-contact
 * capability). A contact record authorizes nothing on its own — it is
 * consumed ONLY by this resolver, and only in the VERIFIED, primary, EMAIL
 * shape for the exact Prospect. */
export const GMAIL_VERIFIED_CONTACT_CONTRACT_FIELDS = [
  'contact_id', 'prospect_id', 'contact_type', 'contact_value',
  'verification_status', 'is_primary', 'verified_by', 'verified_at',
];

/** Fields that must NEVER appear in a delivery audit record. */
export const GMAIL_DELIVERY_AUDIT_PROHIBITED_FIELDS = [
  'access_token', 'refresh_token', 'client_secret', 'token', 'private_key',
  'service_account', 'password', 'secret', 'connector_token',
];

const GMAIL_REQUEST_ALLOWED_FIELDS = [
  'prospect_id', 'channel', 'approved_draft_hash', 'approval_id',
  'execution_id', 'correlation_id', 'recipient_contact_id', 'destination', 'message',
  'message_hash', 'delivery_identity',
];
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DRAFT_HASH_RE = /^[0-9a-f]{8,64}$/;
const CORRELATION_RE = /^[A-Za-z0-9:._-]{8,200}$/;
const EMAIL_RE = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;

function reject(errorCode, error) {
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

/** Deterministic FNV-1a hash — identical derivation to the Phase 11/12/13
 * governed identity bindings, used only for identity and fingerprint
 * binding, never authorization. */
function fnv1a(s) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16);
}

/** Governed delivery identity — identical derivation to Phase 11/12/13. */
export function deriveRealDeliveryIdentity(parts) {
  if (!isPlainObject(parts)) return '';
  const s = [
    typeof parts.execution_id === 'string' ? parts.execution_id : '',
    typeof parts.approved_draft_hash === 'string' ? parts.approved_draft_hash : '',
    typeof parts.prospect_id === 'string' ? parts.prospect_id : '',
    typeof parts.channel === 'string' ? parts.channel : '',
  ].join('|');
  return fnv1a(s);
}

/** Immutable-message hash over the approved message envelope — identical
 * derivation to Phase 12/13 (the recipient is deliberately not part of
 * the hash; it is resolved server-side, never from the message). */
export function deriveRealDeliveryMessageHash(message) {
  if (!isPlainObject(message)) return '';
  const s = [
    typeof message.approved_draft_hash === 'string' ? message.approved_draft_hash : '',
    typeof message.content_binding === 'string' ? message.content_binding : '',
    typeof message.subject === 'string' ? message.subject : '',
    typeof message.body === 'string' ? message.body : '',
  ].join('|');
  return fnv1a(s);
}

/** Minimized recipient representation for audit records — the full
 * recipient address is never persisted by this boundary. */
export function fingerprintRecipient(recipientEmail) {
  if (typeof recipientEmail !== 'string' || recipientEmail.length === 0) return null;
  return fnv1a('gmail-recipient|' + recipientEmail.trim().toLowerCase());
}

/** Rejects any client/agent-supplied delivery directive key anywhere on
 * the request, its message, or its destination contract. */
export function validateNoClientDeliveryParameters(obj) {
  if (!isPlainObject(obj)) return { ok: true };
  for (const key of Object.keys(obj)) {
    if (GMAIL_CLIENT_DELIVERY_FIELD_NAMES.includes(key)) {
      return reject('GATE_CLIENT_DELIVERY_PARAMETERS_REJECTED',
        'Client-supplied delivery parameter "' + String(key).replace(/[^\w.-]/g, '').substring(0, 40) + '" is rejected — recipient, sender, provider identity, and all delivery parameters are resolved server-side only.');
    }
  }
  return { ok: true };
}

/** Strict allow-list validation of the governed OutreachDeliveryRequest
 * (mirrors the Phase 12/13 contract). The message recipient (to) must be
 * absent or null — recipients are server-resolved only. */
export function validateGovernedRealDeliveryRequest(request) {
  if (!isPlainObject(request)) {
    return reject('GATE_REQUEST_INVALID', 'The governed delivery request must be a plain object built by the execution boundary.');
  }
  for (const key of Object.keys(request)) {
    if (!GMAIL_REQUEST_ALLOWED_FIELDS.includes(key)) {
      return reject('GATE_CLIENT_DELIVERY_PARAMETERS_REJECTED',
        'Request field "' + String(key).replace(/[^\w.-]/g, '').substring(0, 40) + '" is not part of the governed delivery request contract.');
    }
  }
  if (typeof request.prospect_id !== 'string' || !UUID_RE.test(request.prospect_id.trim().toLowerCase())) {
    return reject('GATE_REQUEST_INVALID', 'prospect_id must be the bounded prospect identifier issued at record creation.');
  }
  if (typeof request.channel !== 'string' || request.channel.trim().toUpperCase() !== GMAIL_DELIVERY_CHANNEL) {
    return reject('GATE_REQUEST_INVALID', 'The governed Gmail delivery path supports the EMAIL channel only.');
  }
  if (typeof request.approved_draft_hash !== 'string' || !DRAFT_HASH_RE.test(request.approved_draft_hash.trim().toLowerCase())) {
    return reject('GATE_REQUEST_INVALID', 'approved_draft_hash must be 8-64 lowercase hexadecimal characters identifying the exact approved draft.');
  }
  if (typeof request.approval_id !== 'string' || !UUID_RE.test(request.approval_id.trim().toLowerCase())) {
    return reject('GATE_REQUEST_INVALID', 'approval_id must be the server-issued approval identifier binding this delivery.');
  }
  if (typeof request.execution_id !== 'string' || !UUID_RE.test(request.execution_id.trim().toLowerCase())) {
    return reject('GATE_REQUEST_INVALID', 'execution_id must be the server-issued governed execution identifier.');
  }
  if (typeof request.correlation_id !== 'string' || !CORRELATION_RE.test(request.correlation_id.trim())) {
    return reject('GATE_REQUEST_INVALID', 'correlation_id must be the governed correlation identifier issued by the execution boundary.');
  }
  if (typeof request.recipient_contact_id !== 'string' || !UUID_RE.test(request.recipient_contact_id.trim().toLowerCase())) {
    return reject('GATE_REQUEST_INVALID', 'recipient_contact_id must be the server-issued verified contact identifier binding this delivery to its exact recipient.');
  }
  if (typeof request.message_hash !== 'string' || request.message_hash === '') {
    return reject('GATE_REQUEST_INVALID', 'The governed request carries no message hash.');
  }
  if (typeof request.delivery_identity !== 'string' || request.delivery_identity === '') {
    return reject('GATE_REQUEST_INVALID', 'The governed request carries no delivery identity.');
  }
  const message = request.message;
  if (!isPlainObject(message)) {
    return reject('GATE_REQUEST_INVALID', 'The request must carry the server-built immutable message envelope.');
  }
  for (const key of Object.keys(message)) {
    if (!['approved_draft_hash', 'content_binding', 'to', 'subject', 'body'].includes(key)) {
      return reject('GATE_CLIENT_DELIVERY_PARAMETERS_REJECTED',
        'Message field "' + String(key).replace(/[^\w.-]/g, '').substring(0, 40) + '" is rejected — the approved message is immutable.');
    }
  }
  if (message.to !== null && message.to !== undefined) {
    return reject('GATE_CLIENT_DELIVERY_PARAMETERS_REJECTED',
      'A client-supplied recipient (to) is never accepted — recipient resolution is a server-side step.');
  }
  if (message.approved_draft_hash !== request.approved_draft_hash.trim().toLowerCase()) {
    return reject('GATE_REQUEST_INVALID', 'The message must be bound to the exact approved draft hash.');
  }
  if (message.content_binding !== 'APPROVED_DRAFT_HASH') {
    return reject('GATE_REQUEST_INVALID', 'The message content must remain bound to the approved draft hash.');
  }
  for (const field of ['subject', 'body']) {
    const value = message[field];
    if (value === null || value === undefined) continue;
    // Parity with the amended Phase 14F draft contract: line breaks (\n, \r)
    // are permitted in the multi-line BODY only; the SUBJECT stays fully
    // control-free (header-injection defense).
    const charRe = field === 'body' ? /[\u0000-\u0009\u000b\u000c\u000e-\u001f\u007f]/ : /[\u0000-\u001f\u007f]/;
    if (typeof value !== 'string' || value.length > 2000 || charRe.test(value)) {
      return reject('GATE_REQUEST_INVALID', 'Message content must be bounded plain text.');
    }
  }
  return {
    ok: true,
    normalized: {
      prospect_id: request.prospect_id.trim().toLowerCase(),
      channel: request.channel.trim().toUpperCase(),
      approved_draft_hash: request.approved_draft_hash.trim().toLowerCase(),
      approval_id: request.approval_id.trim().toLowerCase(),
      execution_id: request.execution_id.trim().toLowerCase(),
      correlation_id: request.correlation_id.trim(),
      recipient_contact_id: request.recipient_contact_id.trim().toLowerCase(),
      message: message,
      message_hash: request.message_hash,
      delivery_identity: request.delivery_identity,
    },
  };
}

/**
 * THE server-side recipient resolver. The ONLY permitted recipient source
 * is a VERIFIED, primary, EMAIL ProspectContact bound to the Prospect
 * record (the Phase 14E verified-contact capability — the contact record
 * is resolved server-side by the trusted orchestrator and revalidated
 * here against the full contract). No recipient is ever inferred from a
 * company name, domain, website, employee name, owner or user email,
 * search results, Gmail contacts, LLM output, or any client/agent
 * string, and recipient data never enters prompts or LLM context.
 * Fails closed deterministically.
 */
export function resolveAuthorizedOutreachRecipient(prospectRecord, verifiedContactRecord) {
  if (!isPlainObject(prospectRecord) || typeof prospectRecord.prospect_id !== 'string') {
    return reject('GATE_PROSPECT_MISSING', 'No authoritative Prospect record exists — recipient resolution fails closed.');
  }
  if (!isPlainObject(verifiedContactRecord)) {
    return reject('GMAIL_RECIPIENT_NOT_VERIFIED',
      'No VERIFIED primary EMAIL ProspectContact exists for this Prospect — recipient resolution fails closed. No recipient is inferred from any other data.');
  }
  for (const key of Object.keys(verifiedContactRecord)) {
    if (!GMAIL_VERIFIED_CONTACT_CONTRACT_FIELDS.includes(key)) {
      return reject('GMAIL_CONTACT_FIELD_REJECTED',
        'Verified-contact field "' + String(key).replace(/[^\w.-]/g, '').substring(0, 40) + '" is not part of the verified contact contract.');
    }
  }
  if (typeof verifiedContactRecord.contact_id !== 'string' || !UUID_RE.test(verifiedContactRecord.contact_id.trim().toLowerCase())) {
    return reject('GMAIL_CONTACT_ID_INVALID', 'The verified contact must carry its server-issued contact identifier.');
  }
  if (verifiedContactRecord.contact_type !== GMAIL_DELIVERY_CHANNEL) {
    return reject('GMAIL_CONTACT_TYPE_UNSUPPORTED', 'Only a VERIFIED EMAIL contact may resolve as an outreach recipient — no other contact type exists.');
  }
  if (typeof verifiedContactRecord.prospect_id !== 'string' || verifiedContactRecord.prospect_id.trim().toLowerCase() !== prospectRecord.prospect_id.trim().toLowerCase()) {
    return reject('GMAIL_CONTACT_PROSPECT_MISMATCH', 'The verified contact is not bound to this Prospect — no cross-Prospect recipient is permitted.');
  }
  if (verifiedContactRecord.verification_status === 'REVOKED') {
    return reject('GMAIL_CONTACT_REVOKED', 'The contact has been revoked — a revoked contact can never resolve as a recipient.');
  }
  if (verifiedContactRecord.verification_status !== 'VERIFIED') {
    return reject('GMAIL_CONTACT_UNVERIFIED', 'The contact is not VERIFIED — unverified recipients are never contacted. Verification is an explicit governed human action, never implied by email syntax.');
  }
  if (verifiedContactRecord.is_primary !== true) {
    return reject('GMAIL_CONTACT_NOT_PRIMARY', 'The contact is not the Prospect primary contact — only the single VERIFIED primary EMAIL contact may resolve as a recipient.');
  }
  const email = typeof verifiedContactRecord.contact_value === 'string' ? verifiedContactRecord.contact_value.trim().toLowerCase() : '';
  if (email.length === 0 || email.length > 320 || !EMAIL_RE.test(email)) {
    return reject('GMAIL_RECIPIENT_INVALID', 'The verified contact does not carry a valid recipient address — delivery fails closed.');
  }
  if (email === GMAIL_DELIVERY_SENDER_IDENTITY) {
    return reject('GMAIL_RECIPIENT_INVALID', 'The fixed sender identity may never be used as an outreach recipient.');
  }
  if (typeof verifiedContactRecord.verified_by !== 'string' || verifiedContactRecord.verified_by.trim().length === 0 || verifiedContactRecord.verified_by.length > 100) {
    return reject('GMAIL_CONTACT_UNVERIFIED', 'The contact carries no human verification provenance — unverified recipients are never contacted.');
  }
  if (typeof verifiedContactRecord.verified_at !== 'string' || verifiedContactRecord.verified_at.length < 10) {
    return reject('GMAIL_CONTACT_UNVERIFIED', 'The contact carries no verification timestamp — unverified recipients are never contacted.');
  }
  return {
    ok: true,
    recipient: deepFreeze({
      email: email,
      resolved_by: GMAIL_DELIVERY_RECIPIENT_RESOLUTION_VERIFIED_CONTACT,
      contact_id: verifiedContactRecord.contact_id.trim().toLowerCase(),
      verified_by: verifiedContactRecord.verified_by.trim(),
    }),
  };
}

/**
 * THE 20-point single-send safety gate. Evaluates server state in the
 * fixed order 1-20; the first failure terminates with a deterministic
 * error code. Pure and deterministic: all state is supplied as a
 * server-read snapshot by the trusted orchestrator.
 */
export function evaluateRealDeliveryGate(serverState) {
  if (!isPlainObject(serverState)) {
    return reject('GATE_STATE_INVALID', 'The delivery gate requires a server-read state snapshot.');
  }
  // 1. authenticated caller
  const caller = serverState.authenticated_caller;
  if (!isPlainObject(caller) || typeof caller.user_id !== 'string' || caller.user_id.length === 0) {
    return reject('GATE_CALLER_NOT_AUTHENTICATED', 'Check 1 failed: no authenticated caller — delivery fails closed.');
  }
  // 2. agent identity
  if (serverState.agent_id !== GMAIL_DELIVERY_AGENT_ID) {
    return reject('GATE_AGENT_IDENTITY_INVALID', 'Check 2 failed: the executing agent is not the authorized Growth Agent.');
  }
  // 3. tool identity
  if (serverState.tool_id !== GMAIL_DELIVERY_TOOL_ID) {
    return reject('GATE_TOOL_IDENTITY_INVALID', 'Check 3 failed: the invoked tool is not the governed outreach execution tool.');
  }
  // 4. governed request shape + execution identity
  const v = validateGovernedRealDeliveryRequest(serverState.request);
  if (!v.ok) return reject(v.error_code, 'Check 4/20 failed: ' + v.error);
  const request = v.normalized;
  const executionRecord = serverState.execution_record;
  if (!isPlainObject(executionRecord) || executionRecord.execution_id !== request.execution_id) {
    return reject('GATE_EXECUTION_MISMATCH', 'Check 4 failed: the request execution does not match the server execution record.');
  }
  // 5. approval identity
  const approval = serverState.approval_record;
  if (!isPlainObject(approval)) {
    return reject('GATE_APPROVAL_MISSING', 'Check 5 failed: no server approval record exists for this delivery.');
  }
  if (approval.approval_id !== request.approval_id) {
    return reject('GATE_APPROVAL_MISMATCH', 'Check 5 failed: the request approval does not match the server approval record.');
  }
  // 6. approval status APPROVED
  if (approval.status !== 'APPROVED') {
    return reject('GATE_APPROVAL_NOT_APPROVED', 'Check 6 failed: the human approval is not APPROVED — delivery fails closed.');
  }
  // 7. approval not expired
  const now = typeof serverState.now === 'string' ? serverState.now : '';
  if (typeof approval.expires_at === 'string' && now !== '' && approval.expires_at <= now) {
    return reject('GATE_APPROVAL_EXPIRED', 'Check 7 failed: the human approval has expired — delivery fails closed.');
  }
  // 8. approval single-use, not already executed
  if (serverState.approval_already_executed === true) {
    return reject('GATE_APPROVAL_ALREADY_EXECUTED', 'Check 8 failed: the approval has already been executed — approvals are single-use.');
  }
  // 9. approval hash matches the request draft hash
  const approvalDraftHash = isPlainObject(approval.metadata) && typeof approval.metadata.approved_draft_hash === 'string'
    ? approval.metadata.approved_draft_hash.trim().toLowerCase() : null;
  if (approvalDraftHash !== request.approved_draft_hash) {
    return reject('GATE_APPROVAL_DRAFT_HASH_MISMATCH', 'Check 9 failed: the approved draft hash does not match the request — no draft substitution is permitted.');
  }
  // Approval recipient-contact binding (Phase 14E): when the approval
  // binds a recipient contact, the request contact must be exactly that
  // contact — the approval can never become valid against a different
  // recipient, and a revoked, demoted, or changed contact fails closed at
  // checks 13/14 against the live server-resolved contact state.
  const approvalContactId = isPlainObject(approval.metadata) && typeof approval.metadata.recipient_contact_id === 'string'
    ? approval.metadata.recipient_contact_id.trim().toLowerCase() : null;
  if (approvalContactId !== null && approvalContactId !== request.recipient_contact_id) {
    return reject('GATE_APPROVAL_CONTACT_MISMATCH', 'Check 9 failed: the approved recipient contact and the request contact differ — no contact substitution after approval.');
  }
  // 10. Prospect exists and matches
  const prospect = serverState.prospect_record;
  if (!isPlainObject(prospect) || typeof prospect.prospect_id !== 'string' || prospect.prospect_id.trim().toLowerCase() !== request.prospect_id) {
    return reject('GATE_PROSPECT_MISSING', 'Check 10 failed: no matching authoritative Prospect record exists.');
  }
  // 11. Prospect ownership / tenant boundary
  const ownerOk = prospect.owner_user_id === caller.user_id;
  const tenantOk = typeof caller.organization_id === 'string' && caller.organization_id.length > 0
    && prospect.organization_id === caller.organization_id;
  if (!ownerOk && !tenantOk) {
    return reject('GATE_PROSPECT_OWNERSHIP_MISMATCH', 'Check 11 failed: the Prospect does not belong to the authorized owner or tenant.');
  }
  // 12. Prospect lifecycle status
  if (!GMAIL_DELIVERY_PROSPECT_ELIGIBLE_STATUSES.includes(prospect.status)) {
    return reject('GATE_PROSPECT_STATUS_INELIGIBLE', 'Check 12 failed: the Prospect lifecycle status is not QUALIFIED or PURSUING.');
  }
  // 13/14. server-resolved, valid recipient — ONLY the VERIFIED primary
  // EMAIL ProspectContact bound to this Prospect, and it must equal the
  // approved recipient_contact_id (no post-approval contact substitution).
  const recipientResult = resolveAuthorizedOutreachRecipient(prospect, serverState.verified_contact_record);
  if (!recipientResult.ok) {
    return reject(recipientResult.error_code, 'Check 13/14 failed: ' + recipientResult.error);
  }
  if (recipientResult.recipient.contact_id !== request.recipient_contact_id) {
    return reject('GMAIL_RECIPIENT_CONTACT_MISMATCH', 'Check 13/14 failed: the resolved VERIFIED primary contact does not match the approved recipient contact — no contact substitution or post-approval recipient change is permitted.');
  }
  // 15. fixed sender identity
  if (serverState.declared_sender !== GMAIL_DELIVERY_SENDER_IDENTITY) {
    return reject('GATE_SENDER_IDENTITY_REJECTED', 'Check 15 failed: the sender identity is not the fixed server-controlled Growth mailbox.');
  }
  // 16. Gmail connector enabled/active
  const connector = serverState.connector_registry_record;
  if (!isPlainObject(connector) || connector.connector_id !== GMAIL_DELIVERY_CONNECTOR_ID) {
    return reject('GATE_CONNECTOR_MISSING', 'Check 16 failed: the Google Workspace Gmail connector registry record does not exist.');
  }
  if (connector.status !== 'ACTIVE' || connector.enabled !== true || connector.supports_delivery !== true) {
    return reject('GATE_CONNECTOR_DISABLED', 'Check 16 failed: the Google Workspace Gmail connector is not ACTIVE+enabled for delivery — delivery fails closed.');
  }
  // 17. global real-delivery permission
  const globalConfig = serverState.global_real_delivery_record;
  if (!isPlainObject(globalConfig) || globalConfig.real_delivery_enabled !== true) {
    return reject('GATE_REAL_DELIVERY_DISABLED', 'Check 17 failed: the global real-delivery permission is not enabled — delivery fails closed.');
  }
  // 18. idempotency — no prior success for this delivery identity
  const prior = Array.isArray(serverState.prior_delivery_results) ? serverState.prior_delivery_results : [];
  if (prior.includes('SENT') || prior.includes('DELIVERED')) {
    return reject('GATE_DELIVERY_ALREADY_SUCCEEDED', 'Check 18 failed: this logical delivery has already succeeded — replay is blocked.');
  }
  // 19. immutable message hash
  if (deriveRealDeliveryMessageHash(request.message) !== request.message_hash) {
    return reject('GATE_MESSAGE_MUTATED', 'Check 19 failed: the message hash no longer matches the approved immutable draft.');
  }
  // delivery identity binding
  if (deriveRealDeliveryIdentity({
    execution_id: request.execution_id,
    approved_draft_hash: request.approved_draft_hash,
    prospect_id: request.prospect_id,
    channel: request.channel,
  }) !== request.delivery_identity) {
    return reject('GATE_DELIVERY_IDENTITY_MISMATCH', 'Check 19 failed: the delivery identity no longer matches the governed request.');
  }
  // 20. no client-controlled delivery parameters anywhere on the request
  const paramScan = validateNoClientDeliveryParameters(serverState.request);
  if (!paramScan.ok) return reject(paramScan.error_code, 'Check 20 failed: ' + paramScan.error);
  const destinationCheck = validateRealDeliveryDestination(serverState.request.destination);
  if (!destinationCheck.ok) return reject(destinationCheck.error_code, 'Check 20 failed: ' + destinationCheck.error);

  return deepFreeze({
    ok: true,
    checks_passed: 20,
    recipient: recipientResult.recipient,
    sender_identity: GMAIL_DELIVERY_SENDER_IDENTITY,
    request: request,
    boundary_version: GMAIL_DELIVERY_BOUNDARY_VERSION,
  });
}

/** Truthful Phase 14D activation status — static documentation of the
 * frozen controls; runtime decisions always read live server state. */
export function getRealDeliveryActivationStatus() {
  return deepFreeze({
    phase: '14D',
    boundary_version: GMAIL_DELIVERY_BOUNDARY_VERSION,
    real_delivery_enabled: false,
    global_permission_record: OUTREACH_REAL_DELIVERY_CONFIG_ID,
    connector_registry_state: 'DRAFT / enabled=false',
    execute_prospect_outreach_state: 'DRAFT / disabled',
    recipient_resolution: 'IMPLEMENTED (Phase 14E) — resolves ONLY the Prospect VERIFIED primary EMAIL ProspectContact (server-resolved, approval-bound by recipient_contact_id, fail-closed RECIPIENT_NOT_VERIFIED when none exists); real delivery remains OFF',
    activation_requirements: GMAIL_REAL_DELIVERY_REQUIREMENTS,
    automatic_activation: 'none — activation is an explicit operator action after this phase passes',
    email_sent_in_this_phase: false,
    verification: 'REAL DELIVERY = OFF. NO EMAIL WAS SENT. The complete activation path is implemented and deterministically tested, but activation remains an explicit operator action.',
  });
}

/** Builds the provider-neutral REAL-mode delivery audit record (the
 * execution boundary persists it under the service role). Stores only a
 * minimized recipient fingerprint — never the full recipient address —
 * and structurally excludes every credential field. */
export function buildRealDeliveryAuditRecord(request, outcome, ctx) {
  const context = isPlainObject(ctx) ? ctx : {};
  const record = {
    audit_id: typeof context.audit_id === 'string' ? context.audit_id : null,
    execution_id: request.execution_id,
    approval_id: request.approval_id,
    prospect_id: request.prospect_id,
    channel: GMAIL_DELIVERY_CHANNEL,
    connector_id: GMAIL_DELIVERY_CONNECTOR_ID,
    connector_type: GMAIL_DELIVERY_CONNECTOR_TYPE,
    connector_version: GMAIL_DELIVERY_CONNECTOR_VERSION,
    delivery_mode: 'REAL',
    result_status: outcome.result_status,
    correlation_id: request.correlation_id,
    timestamp: typeof context.timestamp === 'string' ? context.timestamp : null,
    error_code: outcome.error_code || null,
    user_id: typeof context.user_id === 'string' ? context.user_id : null,
    organization_id: typeof context.organization_id === 'string' ? context.organization_id : null,
    source: 'gmail_delivery_boundary',
    metadata: {
      sender_identity: GMAIL_DELIVERY_SENDER_IDENTITY,
      recipient_fingerprint: outcome.recipient_fingerprint || null,
      recipient_resolution: outcome.recipient_resolution || null,
      approved_draft_hash: request.approved_draft_hash,
      delivery_identity: request.delivery_identity,
      boundary_version: GMAIL_DELIVERY_BOUNDARY_VERSION,
      transport_invoked: outcome.transport_invoked === true,
      provider_message_id: outcome.provider_message_id || null,
      delivered_claimed: false,
    },
  };
  for (const key of Object.keys(record)) {
    if (GMAIL_DELIVERY_AUDIT_PROHIBITED_FIELDS.includes(key)) {
      throw new Error('Prohibited credential field "' + key + '" may never appear in a delivery audit record.');
    }
  }
  return record;
}

const BLOCKED_VERIFICATION = 'REAL DELIVERY GATE BLOCKED — NO EMAIL SENT. The governed Gmail delivery path terminated at the activation gate before any provider call: no message was sent, drafted, scheduled, or transmitted, no recipient was contacted, and no network call was made.';

function blockedOutcome(state, gate, errorCode, error, extra) {
  const caller = isPlainObject(state.authenticated_caller) ? state.authenticated_caller : {};
  const request = isPlainObject(state.request) ? state.request : {};
  const recipientFingerprint = (gate && gate.recipient) ? fingerprintRecipient(gate.recipient.email) : null;
  const outcome = {
    result_status: 'BLOCKED',
    error_code: errorCode,
    error: error,
    recipient_fingerprint: recipientFingerprint,
    recipient_resolution: (gate && gate.recipient) ? GMAIL_DELIVERY_RECIPIENT_RESOLUTION_VERIFIED_CONTACT : GMAIL_DELIVERY_RECIPIENT_RESOLUTION_NOT_IMPLEMENTED,
    transport_invoked: false,
  };
  const merged = extra ? Object.assign({}, outcome, extra) : outcome;
  return {
    delivery_status: 'BLOCKED',
    blocked: true,
    delivery_mode: 'REAL',
    boundary_version: GMAIL_DELIVERY_BOUNDARY_VERSION,
    connector_id: GMAIL_DELIVERY_CONNECTOR_ID,
    connector_type: GMAIL_DELIVERY_CONNECTOR_TYPE,
    sender_identity: GMAIL_DELIVERY_SENDER_IDENTITY,
    channel: typeof request.channel === 'string' ? request.channel : null,
    prospect_id: typeof request.prospect_id === 'string' ? request.prospect_id : null,
    approval_id: typeof request.approval_id === 'string' ? request.approval_id : null,
    execution_id: typeof request.execution_id === 'string' ? request.execution_id : null,
    correlation_id: typeof request.correlation_id === 'string' ? request.correlation_id : null,
    error_code: errorCode,
    error: error,
    recipient_resolved: false,
    sent: false,
    delivered: false,
    scheduled: false,
    persisted: false,
    network_calls: 0,
    transport_invoked: false,
    audit_record: buildRealDeliveryAuditRecord(
      {
        execution_id: request.execution_id || null,
        approval_id: request.approval_id || null,
        prospect_id: request.prospect_id || null,
        correlation_id: request.correlation_id || null,
        approved_draft_hash: isPlainObject(request.message) && typeof request.message.approved_draft_hash === 'string' ? request.message.approved_draft_hash : null,
        delivery_identity: typeof request.delivery_identity === 'string' ? request.delivery_identity : null,
      },
      merged,
      {
        timestamp: typeof state.now === 'string' ? state.now : null,
        user_id: typeof caller.user_id === 'string' ? caller.user_id : null,
        organization_id: typeof caller.organization_id === 'string' ? caller.organization_id : null,
      },
    ),
    verification: BLOCKED_VERIFICATION,
  };
}

/** Pure UTF-8 + base64url encoding — provider-required transport encoding
 * ONLY. The message bytes are never rewritten. */
function utf8Bytes(str) {
  const out = [];
  for (let i = 0; i < str.length; i++) {
    let c = str.charCodeAt(i);
    if (c < 128) {
      out.push(c);
    } else if (c < 2048) {
      out.push(192 | (c >> 6), 128 | (c & 63));
    } else {
      out.push(224 | (c >> 12), 128 | ((c >> 6) & 63), 128 | (c & 63));
    }
  }
  return out;
}

function base64UrlEncode(str) {
  const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  const bytes = utf8Bytes(str);
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i];
    const b1 = i + 1 < bytes.length ? bytes[i + 1] : 0;
    const b2 = i + 2 < bytes.length ? bytes[i + 2] : 0;
    out += ALPHABET[b0 >> 2];
    out += ALPHABET[((b0 & 3) << 4) | (b1 >> 4)];
    out += i + 1 < bytes.length ? ALPHABET[((b1 & 15) << 2) | (b2 >> 6)] : '=';
    out += i + 2 < bytes.length ? ALPHABET[b2 & 63] : '=';
  }
  return out;
}

/**
 * THE single authorized Gmail API send (users/me/messages/send). Uses
 * only the server-side connector token acquired by the Phase 14C
 * boundary, the fixed sender identity, and the server-resolved
 * recipient. Provider-required transport encoding only. Reachable only
 * after every gate check passes; never called in this phase.
 */
export async function gmailTransportSend(tokenContext, payload) {
  if (!isPlainObject(tokenContext) || typeof tokenContext.connector_token !== 'string' || tokenContext.connector_token.length === 0) {
    return { ok: false, error_code: 'GMAIL_TRANSPORT_TOKEN_MISSING', error: 'The server-side connector token context is missing — no send is possible.' };
  }
  const to = typeof payload.to === 'string' ? payload.to : '';
  const subject = typeof payload.subject === 'string' ? payload.subject : '';
  const body = typeof payload.body === 'string' ? payload.body : '';
  if (to === '' || subject === '' || body === '') {
    return { ok: false, error_code: 'GMAIL_TRANSPORT_PAYLOAD_INVALID', error: 'The immutable approved payload is incomplete — no send is possible.' };
  }
  const mime = 'From: ' + GMAIL_DELIVERY_SENDER_IDENTITY + '\r\n' +
    'To: ' + to + '\r\n' +
    'Subject: ' + subject + '\r\n' +
    'MIME-Version: 1.0\r\n' +
    'Content-Type: text/plain; charset=UTF-8\r\n' +
    '\r\n' + body;
  const raw = base64UrlEncode(mime);
  const response = await fetch(GMAIL_DELIVERY_TRANSPORT_ENDPOINT, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + tokenContext.connector_token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw: raw }),
  });
  if (response.ok) {
    const data = await response.json().catch(() => ({}));
    return { ok: true, provider_accepted: true, provider_message_id: typeof data.id === 'string' ? data.id : null };
  }
  return { ok: false, error_code: 'GMAIL_PROVIDER_REJECTED', provider_http_status: response.status };
}

/**
 * THE governed real-delivery executor — single request in, single message
 * out. Order: client-parameter rejection (before any state work), the
 * 20-point gate, the Phase 14C connector-token credential boundary, then
 * — only if everything passes — the single transport send. Every failure
 * terminates BEFORE the Gmail API is called and returns a truthful
 * BLOCKED/FAILED result plus the provider-neutral audit record. The
 * credential boundary object is the shipped Phase 14C provider supplied
 * by trusted server code; the gateway snapshot is strictly allow-listed
 * by that boundary. Tests always inject a transport; the default is the
 * real transport and is unreachable in this phase.
 */
export async function executeGovernedGmailDelivery(request, serverState, credentialBoundary, gatewaySnapshot, transport) {
  const earlyScan = validateNoClientDeliveryParameters(request);
  if (!earlyScan.ok) return blockedOutcome(serverState, null, earlyScan.error_code, earlyScan.error);

  const gate = evaluateRealDeliveryGate(serverState && isPlainObject(serverState)
    ? Object.assign({}, serverState, { request: request }) : { request: request });
  if (!gate.ok) return blockedOutcome(serverState, null, gate.error_code, gate.error);

  const caller = isPlainObject(serverState.authenticated_caller) ? serverState.authenticated_caller : {};
  const requestNormalized = gate.request;

  // Credential boundary — the shipped Phase 14C server-only provider.
  if (!isPlainObject(credentialBoundary)
    || typeof credentialBoundary.getGmailConnectorCredentialStatus !== 'function'
    || typeof credentialBoundary.acquireGmailConnectorTokenContext !== 'function') {
    return blockedOutcome(serverState, gate, 'GMAIL_CREDENTIAL_BOUNDARY_INVALID',
      'No genuine server-side Gmail OAuth connector-token boundary was supplied — the Base44-managed Gmail connector is the only credential source.');
  }
  const status = credentialBoundary.getGmailConnectorCredentialStatus(gatewaySnapshot);
  if (!isPlainObject(status) || status.connected !== true) {
    return blockedOutcome(serverState, gate,
      (status && typeof status.error_code === 'string') ? status.error_code : 'GMAIL_CONNECTOR_UNAVAILABLE',
      'The Base44-managed Gmail OAuth connector is not available with the required identity and scope — the boundary fails closed and nothing is sent.');
  }
  const acquired = credentialBoundary.acquireGmailConnectorTokenContext(
    { requested_sender: GMAIL_DELIVERY_SENDER_IDENTITY }, gatewaySnapshot,
  );
  if (!isPlainObject(acquired) || acquired.ok !== true) {
    return blockedOutcome(serverState, gate,
      (acquired && typeof acquired.error_code === 'string') ? acquired.error_code : 'GMAIL_CONNECTOR_TOKEN_ACQUISITION_FAILED',
      (acquired && typeof acquired.error === 'string') ? acquired.error.substring(0, 500) : 'Server-side Gmail connector-token acquisition failed closed.');
  }
  if (acquired.sender_identity !== GMAIL_DELIVERY_SENDER_IDENTITY) {
    return blockedOutcome(serverState, gate, 'GMAIL_SENDER_IDENTITY_MISMATCH',
      'The acquired connector-token context does not carry the fixed server-controlled Growth mailbox sender identity — nothing is sent.');
  }
  if (acquired.scope !== GMAIL_DELIVERY_TRANSPORT_SCOPE) {
    return blockedOutcome(serverState, gate, 'GMAIL_TRANSPORT_SCOPE_MISMATCH',
      'The acquired connector-token context does not carry exactly the fixed authorized Gmail sending scope — nothing is sent.');
  }

  // Single send. The token stays inside this call; the payload carries
  // only the server-resolved recipient and the immutable approved
  // subject/body. SENT means provider acceptance only — DELIVERED is
  // never claimed by this boundary.
  const sendTransport = (typeof transport === 'function') ? transport : gmailTransportSend;
  const recipient = gate.recipient;
  try {
    const sent = await sendTransport(acquired, {
      to: recipient.email,
      subject: requestNormalized.message.subject,
      body: requestNormalized.message.body,
      sender_identity: GMAIL_DELIVERY_SENDER_IDENTITY,
    });
    const fingerprint = fingerprintRecipient(recipient.email);
    if (!isPlainObject(sent) || sent.ok !== true) {
      const outcome = {
        result_status: 'FAILED',
        error_code: (sent && typeof sent.error_code === 'string') ? sent.error_code : 'GMAIL_PROVIDER_REJECTED',
        error: 'The Gmail provider rejected the single governed send — the approved message was not accepted.',
        recipient_fingerprint: fingerprint,
        recipient_resolution: GMAIL_DELIVERY_RECIPIENT_RESOLUTION_VERIFIED_CONTACT,
        transport_invoked: true,
      };
      return {
        delivery_status: 'FAILED',
        blocked: false,
        delivery_mode: 'REAL',
        boundary_version: GMAIL_DELIVERY_BOUNDARY_VERSION,
        connector_id: GMAIL_DELIVERY_CONNECTOR_ID,
        connector_type: GMAIL_DELIVERY_CONNECTOR_TYPE,
        sender_identity: GMAIL_DELIVERY_SENDER_IDENTITY,
        channel: requestNormalized.channel,
        prospect_id: requestNormalized.prospect_id,
        approval_id: requestNormalized.approval_id,
        execution_id: requestNormalized.execution_id,
        correlation_id: requestNormalized.correlation_id,
        recipient_resolved: true,
        recipient_fingerprint: fingerprint,
        sent: false,
        delivered: false,
        scheduled: false,
        persisted: false,
        transport_invoked: true,
        error_code: outcome.error_code,
        error: outcome.error,
        audit_record: buildRealDeliveryAuditRecord(requestNormalized, outcome, {
          timestamp: typeof serverState.now === 'string' ? serverState.now : null,
          user_id: typeof caller.user_id === 'string' ? caller.user_id : null,
          organization_id: typeof caller.organization_id === 'string' ? caller.organization_id : null,
        }),
        verification: 'GMAIL PROVIDER REJECTED THE SINGLE GOVERNED SEND — NO MESSAGE WAS ACCEPTED. No retry, no follow-up, and no bulk behavior exists.',
      };
    }
    const outcome = {
      result_status: 'SENT',
      error_code: null,
      recipient_fingerprint: fingerprint,
      recipient_resolution: GMAIL_DELIVERY_RECIPIENT_RESOLUTION_VERIFIED_CONTACT,
      transport_invoked: true,
      provider_message_id: typeof sent.provider_message_id === 'string' ? sent.provider_message_id : null,
    };
    return {
      delivery_status: 'SENT',
      blocked: false,
      delivery_mode: 'REAL',
      boundary_version: GMAIL_DELIVERY_BOUNDARY_VERSION,
      connector_id: GMAIL_DELIVERY_CONNECTOR_ID,
      connector_type: GMAIL_DELIVERY_CONNECTOR_TYPE,
      sender_identity: GMAIL_DELIVERY_SENDER_IDENTITY,
      channel: requestNormalized.channel,
      prospect_id: requestNormalized.prospect_id,
      approval_id: requestNormalized.approval_id,
      execution_id: requestNormalized.execution_id,
      correlation_id: requestNormalized.correlation_id,
      recipient_resolved: true,
      recipient_fingerprint: fingerprint,
      provider_accepted: true,
      provider_message_id: outcome.provider_message_id,
      sent: true,
      delivered: false,
      delivered_claimed: false,
      scheduled: false,
      persisted: false,
      transport_invoked: true,
      audit_record: buildRealDeliveryAuditRecord(requestNormalized, outcome, {
        timestamp: typeof serverState.now === 'string' ? serverState.now : null,
        user_id: typeof caller.user_id === 'string' ? caller.user_id : null,
        organization_id: typeof caller.organization_id === 'string' ? caller.organization_id : null,
      }),
      verification: 'GMAIL PROVIDER ACCEPTED THE SINGLE APPROVED MESSAGE — provider acceptance is NOT delivery confirmation, the boundary never claims DELIVERED, the approval is consumed as single-use, and no retry, follow-up, or bulk behavior exists.',
    };
  } catch (transportError) {
    const message = String(transportError && transportError.message ? transportError.message : transportError).substring(0, 300);
    const fingerprint = fingerprintRecipient(recipient.email);
    const outcome = {
      result_status: 'FAILED',
      error_code: 'GMAIL_TRANSPORT_ERROR',
      error: 'The governed transport failed before a send outcome could be confirmed — no delivery is claimed.',
      recipient_fingerprint: fingerprint,
      recipient_resolution: GMAIL_DELIVERY_RECIPIENT_RESOLUTION_VERIFIED_CONTACT,
      transport_invoked: true,
    };
    return {
      delivery_status: 'FAILED',
      blocked: false,
      delivery_mode: 'REAL',
      boundary_version: GMAIL_DELIVERY_BOUNDARY_VERSION,
      connector_id: GMAIL_DELIVERY_CONNECTOR_ID,
      sender_identity: GMAIL_DELIVERY_SENDER_IDENTITY,
      channel: requestNormalized.channel,
      prospect_id: requestNormalized.prospect_id,
      approval_id: requestNormalized.approval_id,
      execution_id: requestNormalized.execution_id,
      correlation_id: requestNormalized.correlation_id,
      recipient_resolved: true,
      recipient_fingerprint: fingerprint,
      sent: false,
      delivered: false,
      scheduled: false,
      persisted: false,
      transport_invoked: true,
      error_code: 'GMAIL_TRANSPORT_ERROR',
      error: message,
      audit_record: buildRealDeliveryAuditRecord(requestNormalized, outcome, {
        timestamp: typeof serverState.now === 'string' ? serverState.now : null,
        user_id: typeof caller.user_id === 'string' ? caller.user_id : null,
        organization_id: typeof caller.organization_id === 'string' ? caller.organization_id : null,
      }),
      verification: 'THE GOVERNED TRANSPORT FAILED BEFORE A SEND OUTCOME COULD BE CONFIRMED — no delivery is claimed and no retry exists.',
    };
  }
}
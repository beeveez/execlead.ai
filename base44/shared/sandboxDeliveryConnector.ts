/**
 * Sandbox Delivery Connector — Phase 12 external delivery connector
 * architecture and sandbox contract.
 * ============================================================
 * This module establishes the provider-neutral ExternalDeliveryConnector
 * interface and ships exactly ONE implementation: the non-delivering
 * Sandbox Delivery Connector, for contract validation only.
 *
 * THE GATE REMAINS CLOSED:
 * - Real delivery is NOT enabled. No real provider integration exists.
 * - The connector never performs a network call of any kind, never sends
 *   email, never sends SMS, never contacts a social platform, never writes
 *   to an external system, and never creates a CRM record.
 * - The connector NEVER makes authorization decisions. Authorization belongs to the
 *   Agent Orchestration Core (the single governed execution boundary). The
 *   connector receives an ALREADY-AUTHORIZED execution context and only
 *   validates the delivery contract, the immutable delivery identity, and
 *   the message immutability, then performs sandbox behavior.
 * - A OutreachDeliveryRequest can only be produced by the governed
 *   execution boundary — a client can never construct one for delivery.
 * - The destination is a server-resolved contract object only. Client
 *   destinations, arbitrary recipients, and arbitrary provider identifiers
 *   are rejected. In this phase destination resolution remains
 *   NOT_IMPLEMENTED — no destination is ever resolved or contacted.
 * - The delivery identity is exactly the Phase 11 governed identity:
 *   execution_id + approved_draft_hash + prospect_id + channel. There is NO
 *   second independent idempotency authority — a future real connector must
 *   receive this governed identity from the execution boundary.
 * - The approved message is immutable after approval: no rewriting, no
 *   personalization, no signature insertion, no CTA or subject modification,
 *   no recipient substitution, no channel substitution. The governed
 *   request is deeply frozen and hash-bound.
 * - SANDBOX results can only be NOT_ATTEMPTED, SANDBOX_ONLY, or BLOCKED.
 *   SENT and DELIVERED are structurally unavailable to the sandbox
 *   connector and can never be claimed.
 *
 * This module is pure: no imports, no database access, no entity writes,
 * no network calls, no background processing, no repeated sends, no
 * LLM. It is written in plain JS syntax so the exact shipped file can be
 * executed by the deterministic test suite.
 */

export const DELIVERY_CONNECTOR_ID = 'sandbox_delivery';
export const DELIVERY_CONNECTOR_NAME = 'Sandbox Delivery Connector';
export const DELIVERY_CONNECTOR_TYPE = 'SANDBOX';
export const DELIVERY_CONNECTOR_VERSION = '1.0.0';
export const DELIVERY_CHANNELS = ['EMAIL', 'LINKEDIN', 'CALL'];
export const DELIVERY_MODE_SANDBOX = 'SANDBOX';
export const SANDBOX_ALLOWED_RESULT_STATUSES = ['NOT_ATTEMPTED', 'SANDBOX_ONLY', 'BLOCKED'];
export const DELIVERY_STATUSES_UNAVAILABLE_TO_SANDBOX = ['SENT', 'DELIVERED'];
export const DELIVERY_RESULT_STATUSES_CONCEPTUAL = [
  'NOT_ATTEMPTED', 'SANDBOX_ONLY', 'BLOCKED', 'SENT', 'DELIVERED', 'FAILED',
];
export const DESTINATION_RESOLUTION_STATUS = 'NOT_IMPLEMENTED';
export const DESTINATION_RESOLVED_BY = 'server_delivery_boundary';
export const SANDBOX_VERIFY_NOTICE =
  'SANDBOX — NOTHING SENT. This is a governed sandbox delivery result produced by the Sandbox Delivery Connector: contract validation, delivery-identity binding, and message-immutability checks were performed, recipient resolution remains NOT_IMPLEMENTED, and no message was sent, scheduled, persisted, or transmitted; no external network call, email, SMS, messaging, or CRM action occurred. The sandbox connector performs no real delivery and never claims SENT or DELIVERED. A recipient can only ever be resolved server-side by a future governed delivery step — client-supplied destinations are never accepted.';

export const CONNECTOR_REGISTRY_SEED = [
  {
    connector_id: DELIVERY_CONNECTOR_ID,
    name: DELIVERY_CONNECTOR_NAME,
    connector_type: DELIVERY_CONNECTOR_TYPE,
    version: DELIVERY_CONNECTOR_VERSION,
    status: 'ACTIVE',
    enabled: true,
    supported_channels: DELIVERY_CHANNELS,
    supports_delivery: false,
    sandbox_only: true,
    requires_human_approval: true,
    source: 'production_catalog',
    description: 'Sandbox delivery connector for contract validation only. Never performs a network call, never sends email or SMS, never writes to an external system, and never creates CRM records. Real delivery providers will be registered only in a separately approved future phase.',
  },
];

export const EXECUTE_OUTREACH_TOOL_EXPECTED_STATE = {
  tool_id: 'execute_prospect_outreach',
  status: 'DRAFT',
  enabled: false,
  risk_level: 'HIGH',
  human_approval_required: true,
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DRAFT_HASH_RE = /^[0-9a-f]{8,64}$/;
const CORRELATION_RE = /^[A-Za-z0-9:._-]{8,200}$/;
const DELIVERY_REQUEST_ALLOWED_FIELDS = [
  'prospect_id', 'channel', 'approved_draft_hash', 'approval_id',
  'execution_id', 'correlation_id', 'destination', 'message',
  'message_hash', 'delivery_identity',
];
const DESTINATION_ALLOWED_FIELDS = [
  'destination_type', 'resolution_status', 'resolved_by',
  'recipient_reference', 'provider_id',
];
const MESSAGE_ALLOWED_FIELDS = [
  'approved_draft_hash', 'content_binding', 'subject', 'body',
];
const CONTROL_CHARS_RE = /[\u0000-\u001f\u007f]/;

function reject(errorCode, error) {
  return { ok: false, error_code: errorCode, error: error };
}

/** Deterministic FNV-1a hash. Used ONLY for identity and immutability
 * binding — never for authorization. */
function fnv1a(s) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16);
}

function deepFreeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const key of Object.keys(value)) deepFreeze(value[key]);
  }
  return value;
}

/**
 * THE immutable delivery identity — exactly the Phase 11 governed
 * boundary: execution_id + approved_draft_hash + prospect_id + channel.
 * The connector has NO independent idempotency authority: a future real
 * connector must receive this identity from the execution boundary.
 */
export function deriveDeliveryIdentity(parts) {
  if (parts === null || typeof parts !== 'object' || Array.isArray(parts)) return '';
  const s = [
    typeof parts.execution_id === 'string' ? parts.execution_id : '',
    typeof parts.approved_draft_hash === 'string' ? parts.approved_draft_hash : '',
    typeof parts.prospect_id === 'string' ? parts.prospect_id : '',
    typeof parts.channel === 'string' ? parts.channel : '',
  ].join('|');
  return fnv1a(s);
}

/** Deterministic hash of the approved message envelope — the immutability
 * anchor. Any mutation of the message after the governed request is built
 * changes this hash and is blocked at delivery time. */
export function deriveMessageHash(message) {
  if (message === null || typeof message !== 'object' || Array.isArray(message)) return '';
  const s = [
    typeof message.approved_draft_hash === 'string' ? message.approved_draft_hash : '',
    typeof message.content_binding === 'string' ? message.content_binding : '',
    typeof message.subject === 'string' ? message.subject : '',
    typeof message.body === 'string' ? message.body : '',
  ].join('|');
  return fnv1a(s);
}

/**
 * Truthful real-delivery readiness. Real delivery is NOT enabled — this
 * result is explicit and never uses vague "ready" language.
 */
export function getRealDeliveryReadiness() {
  return {
    real_delivery_enabled: false,
    real_delivery_connector: 'none',
    sandbox_connector: 'active',
    external_side_effects: 'disabled',
    human_approval: 'required',
    destination_resolution: DESTINATION_RESOLUTION_STATUS,
    supported_channels: DELIVERY_CHANNELS,
    message: 'Real external delivery is NOT enabled. The only delivery connector implementation is the sandbox connector, which performs contract validation only and never transmits anything. The execute_prospect_outreach tool remains DRAFT and disabled.',
  };
}

/** Connector capabilities (the ExternalDeliveryConnector getCapabilities()
 * equivalent) — truthful: this connector supports NO delivery. */
export function sandboxGetCapabilities() {
  const record = CONNECTOR_REGISTRY_SEED[0];
  return {
    connector_id: record.connector_id,
    name: record.name,
    connector_type: record.connector_type,
    version: record.version,
    status: record.status,
    enabled: record.enabled,
    supported_channels: record.supported_channels,
    supports_delivery: record.supports_delivery,
    sandbox_only: record.sandbox_only,
    requires_human_approval: record.requires_human_approval,
  };
}

/**
 * Server-resolved destination contract — the minimum fields necessary for
 * future provider mapping. In this phase NO destination is resolved: the
 * recipient reference and provider identifier are structurally null and
 * the resolution status is NOT_IMPLEMENTED. This object may only be built
 * server-side by the governed execution boundary.
 */
export function buildSandboxDestination(channel) {
  const destination = {
    destination_type: channel,
    resolution_status: DESTINATION_RESOLUTION_STATUS,
    resolved_by: DESTINATION_RESOLVED_BY,
    recipient_reference: null,
    provider_id: null,
  };
  return deepFreeze(destination);
}

/**
 * Validates the destination contract (the ExternalDeliveryConnector
 * validateDestination() equivalent). Rejects: malformed objects, unknown
 * keys (including provider-specific payload keys), a destination type that
 * does not match the approved channel, a client-supplied recipient, and an
 * arbitrary provider identifier.
 */
export function validateDeliveryDestination(destination, channel) {
  if (destination === null || typeof destination !== 'object' || Array.isArray(destination)) {
    return reject('DELIVERY_DESTINATION_INVALID', 'The destination must be a server-built destination contract object.');
  }
  for (const key of Object.keys(destination)) {
    if (!DESTINATION_ALLOWED_FIELDS.includes(key)) {
      return reject('DELIVERY_DESTINATION_FIELD_REJECTED',
        `Destination field "${String(key).replace(/[^\w.-]/g, '').substring(0, 40) || 'unknown'}" is not part of the destination contract.`);
    }
  }
  if (typeof channel !== 'string' || !DELIVERY_CHANNELS.includes(channel)) {
    return reject('DELIVERY_REQUEST_CHANNEL_UNSUPPORTED',
      `channel must be one of: ${DELIVERY_CHANNELS.join(', ')}. No channel is contacted in this phase.`);
  }
  if (destination.destination_type !== channel) {
    return reject('DELIVERY_DESTINATION_CHANNEL_MISMATCH',
      'The destination type and the approved channel differ — no channel substitution is permitted.');
  }
  if (destination.resolution_status !== DESTINATION_RESOLUTION_STATUS) {
    return reject('DELIVERY_DESTINATION_RESOLUTION_INVALID',
      'Destination resolution is not implemented; no destination may be resolved or contacted in this phase.');
  }
  if (destination.resolved_by !== DESTINATION_RESOLVED_BY) {
    return reject('DELIVERY_DESTINATION_PROVENANCE_INVALID',
      'The destination must be built server-side by the governed delivery boundary.');
  }
  if (destination.recipient_reference !== null && destination.recipient_reference !== undefined) {
    return reject('DELIVERY_DESTINATION_CLIENT_SUPPLIED',
      'A client-supplied recipient is never accepted — recipient resolution is a server-side step and remains not implemented.');
  }
  if (destination.provider_id !== null && destination.provider_id !== undefined) {
    return reject('DELIVERY_DESTINATION_PROVIDER_ID_REJECTED',
      'An arbitrary provider identifier is never accepted — provider mapping is a future governed server-side step.');
  }
  return { ok: true };
}

/**
 * Validates the approved message envelope. The message is an allow-listed
 * immutable contract: it is hash-bound to the approved draft and may not
 * carry any provider-specific payload, recipient, or mutation directive.
 */
export function validateDeliveryMessage(message, requestDraftHash) {
  if (message === null || typeof message !== 'object' || Array.isArray(message)) {
    return reject('DELIVERY_MESSAGE_INVALID', 'The message must be a server-built message contract object.');
  }
  for (const key of Object.keys(message)) {
    if (!MESSAGE_ALLOWED_FIELDS.includes(key)) {
      return reject('DELIVERY_MESSAGE_FIELD_REJECTED',
        `Message field "${String(key).replace(/[^\w.-]/g, '').substring(0, 40) || 'unknown'}" is rejected — the approved message cannot carry provider-specific or mutation directives.`);
    }
  }
  if (typeof message.approved_draft_hash !== 'string' || message.approved_draft_hash !== requestDraftHash) {
    return reject('DELIVERY_MESSAGE_DRAFT_HASH_MISMATCH',
      'The message must be bound to the exact approved draft hash — no draft or message substitution is permitted.');
  }
  if (message.content_binding !== 'APPROVED_DRAFT_HASH') {
    return reject('DELIVERY_MESSAGE_CONTENT_BINDING_INVALID',
      'The message content must remain bound to the approved draft hash produced by the governed preparation boundary.');
  }
  for (const field of ['subject', 'body']) {
    const value = message[field];
    if (value === null || value === undefined) continue;
    if (typeof value !== 'string' || value.length > 2000 || CONTROL_CHARS_RE.test(value)) {
      return reject('DELIVERY_MESSAGE_CONTENT_INVALID',
        'Message content must be bounded plain text; the connector never rewrites, personalizes, or augments the approved message.');
    }
  }
  return { ok: true };
}

/** Validates the governed delivery request fields (shared by the request
 * factory and the sandbox deliver validation — one contract, one truth). */
function validateGovernedDeliveryRequestFields(fields) {
  if (fields === null || typeof fields !== 'object' || Array.isArray(fields)) {
    return reject('DELIVERY_REQUEST_INVALID', 'The governed delivery request must be a plain object built by the execution boundary.');
  }
  for (const key of Object.keys(fields)) {
    if (!DELIVERY_REQUEST_ALLOWED_FIELDS.includes(key)) {
      return reject('DELIVERY_REQUEST_FIELD_REJECTED',
        `Field "${String(key).replace(/[^\w.-]/g, '').substring(0, 40) || 'unknown'}" is not part of the governed delivery request contract.`);
    }
  }

  if (typeof fields.prospect_id !== 'string' || !UUID_RE.test(fields.prospect_id.trim().toLowerCase())) {
    return reject('DELIVERY_REQUEST_PROSPECT_ID_INVALID', 'prospect_id must be the bounded prospect identifier issued at record creation.');
  }
  const channel = typeof fields.channel === 'string' ? fields.channel.trim().toUpperCase() : '';
  if (!DELIVERY_CHANNELS.includes(channel)) {
    return reject('DELIVERY_REQUEST_CHANNEL_UNSUPPORTED',
      `channel must be one of: ${DELIVERY_CHANNELS.join(', ')}. No channel is contacted in this phase.`);
  }
  if (typeof fields.approved_draft_hash !== 'string' || !DRAFT_HASH_RE.test(fields.approved_draft_hash.trim().toLowerCase())) {
    return reject('DELIVERY_REQUEST_DRAFT_HASH_INVALID', 'approved_draft_hash must be 8-64 lowercase hexadecimal characters identifying the exact approved draft.');
  }
  if (typeof fields.approval_id !== 'string' || !UUID_RE.test(fields.approval_id.trim().toLowerCase())) {
    return reject('DELIVERY_REQUEST_APPROVAL_ID_INVALID', 'approval_id must be the server-issued approval identifier binding this delivery.');
  }
  if (typeof fields.execution_id !== 'string' || !UUID_RE.test(fields.execution_id.trim().toLowerCase())) {
    return reject('DELIVERY_REQUEST_EXECUTION_ID_INVALID', 'execution_id must be the server-issued governed execution identifier.');
  }
  if (typeof fields.correlation_id !== 'string' || !CORRELATION_RE.test(fields.correlation_id.trim())) {
    return reject('DELIVERY_REQUEST_CORRELATION_ID_INVALID', 'correlation_id must be the governed correlation identifier issued by the execution boundary.');
  }

  const destinationCheck = validateDeliveryDestination(fields.destination, channel);
  if (!destinationCheck.ok) return destinationCheck;
  const messageCheck = validateDeliveryMessage(fields.message, fields.approved_draft_hash.trim().toLowerCase());
  if (!messageCheck.ok) return messageCheck;

  return {
    ok: true,
    normalized: {
      prospect_id: fields.prospect_id.trim().toLowerCase(),
      channel,
      approved_draft_hash: fields.approved_draft_hash.trim().toLowerCase(),
      approval_id: fields.approval_id.trim().toLowerCase(),
      execution_id: fields.execution_id.trim().toLowerCase(),
      correlation_id: fields.correlation_id.trim(),
      destination: fields.destination,
      message: fields.message,
    },
  };
}

/**
 * Builds the governed OutreachDeliveryRequest. This is the ONLY way the
 * request object can come into existence for delivery: it is produced by
 * the governed execution boundary (never by a client), it requires an
 * already-authorized boundary context, it is bound to the exact approval,
 * execution, Prospect, channel, and approved draft hash, and it is deeply
 * frozen with an immutable message hash and delivery identity.
 */
export function createGovernedDeliveryRequest(fields, boundaryContext) {
  if (boundaryContext === null || typeof boundaryContext !== 'object'
    || boundaryContext.authorization_verified !== true) {
    return reject('DELIVERY_CONTEXT_NOT_AUTHORIZED',
      'A governed delivery request may only be produced by the execution boundary after server-side authorization — the connector makes no authorization decisions.');
  }
  const v = validateGovernedDeliveryRequestFields(fields);
  if (!v.ok) return v;

  const request = {
    prospect_id: v.normalized.prospect_id,
    channel: v.normalized.channel,
    approved_draft_hash: v.normalized.approved_draft_hash,
    approval_id: v.normalized.approval_id,
    execution_id: v.normalized.execution_id,
    correlation_id: v.normalized.correlation_id,
    destination: deepFreeze({ ...v.normalized.destination }),
    message: deepFreeze({
      approved_draft_hash: v.normalized.message.approved_draft_hash,
      content_binding: v.normalized.message.content_binding,
      subject: v.normalized.message.subject === undefined ? null : v.normalized.message.subject,
      body: v.normalized.message.body === undefined ? null : v.normalized.message.body,
    }),
    message_hash: deriveMessageHash(v.normalized.message),
    delivery_identity: deriveDeliveryIdentity({
      execution_id: v.normalized.execution_id,
      approved_draft_hash: v.normalized.approved_draft_hash,
      prospect_id: v.normalized.prospect_id,
      channel: v.normalized.channel,
    }),
  };
  deepFreeze(request);
  return { ok: true, request };
}

/**
 * Structurally asserts the sandbox result guard: the sandbox connector can
 * never produce SENT or DELIVERED, and never claims an unknown status.
 */
export function assertSandboxResultStatus(status) {
  if (DELIVERY_STATUSES_UNAVAILABLE_TO_SANDBOX.includes(status)) {
    throw new Error(`The sandbox delivery connector can never produce status ${status} — real delivery is not enabled.`);
  }
  if (!SANDBOX_ALLOWED_RESULT_STATUSES.includes(status)) {
    throw new Error(`Unknown delivery result status: ${String(status)}`);
  }
  return true;
}

function sandboxBlocked(request, errorCode, error) {
  const r = (request && typeof request === 'object') ? request : {};
  return {
    delivery_status: 'BLOCKED',
    simulated: true,
    blocked: true,
    connector_id: DELIVERY_CONNECTOR_ID,
    connector_type: DELIVERY_CONNECTOR_TYPE,
    connector_version: DELIVERY_CONNECTOR_VERSION,
    delivery_mode: DELIVERY_MODE_SANDBOX,
    delivery_identity: typeof r.delivery_identity === 'string' ? r.delivery_identity : null,
    channel: typeof r.channel === 'string' ? r.channel : null,
    prospect_id: typeof r.prospect_id === 'string' ? r.prospect_id : null,
    approval_id: typeof r.approval_id === 'string' ? r.approval_id : null,
    execution_id: typeof r.execution_id === 'string' ? r.execution_id : null,
    correlation_id: typeof r.correlation_id === 'string' ? r.correlation_id : null,
    recipient_resolved: false,
    recipient_resolution: DESTINATION_RESOLUTION_STATUS,
    external_delivery: false,
    sent: false,
    delivered: false,
    scheduled: false,
    persisted: false,
    error_code: errorCode,
    error,
    verification: SANDBOX_VERIFY_NOTICE,
  };
}

/**
 * THE sandbox deliver() equivalent — contract validation only, never
 * delivery. Revalidates the full request contract, the immutable message
 * hash, the delivery identity, and every binding against the
 * already-authorized boundary context. Any failure BLOCKS truthfully. A
 * successful validation terminates safely at SANDBOX_ONLY and explicitly
 * states SANDBOX — NOTHING SENT. No network call is ever made.
 */
export function sandboxDeliver(request, boundaryContext) {
  if (boundaryContext === null || typeof boundaryContext !== 'object'
    || boundaryContext.authorization_verified !== true) {
    return sandboxBlocked(request, 'DELIVERY_CONTEXT_NOT_AUTHORIZED',
      'The connector received no authorized execution context — the Agent Orchestration Core is the only authorization authority.');
  }
  const expected = boundaryContext.expected;
  if (expected === null || typeof expected !== 'object') {
    return sandboxBlocked(request, 'DELIVERY_CONTEXT_INCOMPLETE',
      'The authorized boundary context is incomplete — no delivery validation can proceed.');
  }

  // Full contract revalidation on every call — request shape, destination,
  // message contract, derived hashes, and identity are all re-derived.
  if (request === null || typeof request !== 'object' || Array.isArray(request)) {
    return sandboxBlocked(request, 'DELIVERY_REQUEST_INVALID',
      'The governed delivery request is missing or malformed — no delivery validation can proceed.');
  }
  if (typeof request.message_hash !== 'string' || request.message_hash === '') {
    return sandboxBlocked(request, 'DELIVERY_MESSAGE_HASH_MISSING',
      'The governed request carries no message hash — a request may only be built by the execution boundary.');
  }
  if (typeof request.delivery_identity !== 'string' || request.delivery_identity === '') {
    return sandboxBlocked(request, 'DELIVERY_IDENTITY_MISSING',
      'The governed request carries no delivery identity — the Phase 11 governed identity is mandatory.');
  }
  const v = validateGovernedDeliveryRequestFields(request);
  if (!v.ok) {
    return sandboxBlocked(request, v.error_code, v.error);
  }
  if (deriveMessageHash(v.normalized.message) !== request.message_hash) {
    return sandboxBlocked(request, 'DELIVERY_MESSAGE_MUTATED',
      'The approved message hash no longer matches — the approved message is immutable after approval and any mutation is blocked.');
  }
  if (deriveDeliveryIdentity({
    execution_id: v.normalized.execution_id,
    approved_draft_hash: v.normalized.approved_draft_hash,
    prospect_id: v.normalized.prospect_id,
    channel: v.normalized.channel,
  }) !== request.delivery_identity) {
    return sandboxBlocked(request, 'DELIVERY_IDENTITY_MISMATCH',
      'The delivery identity no longer matches the governed request — no request replay or substitution is permitted.');
  }

  // Binding revalidation against the authorized boundary context.
  if (expected.approval_id !== v.normalized.approval_id) {
    return sandboxBlocked(request, 'DELIVERY_REQUEST_APPROVAL_MISMATCH',
      'The delivery request approval and the authorized approval differ — no approval substitution is permitted.');
  }
  if (expected.execution_id !== v.normalized.execution_id) {
    return sandboxBlocked(request, 'DELIVERY_REQUEST_EXECUTION_MISMATCH',
      'The delivery request execution and the authorized execution differ — no execution substitution is permitted.');
  }
  if (expected.correlation_id !== v.normalized.correlation_id) {
    return sandboxBlocked(request, 'DELIVERY_REQUEST_CORRELATION_MISMATCH',
      'The delivery request correlation and the authorized correlation differ — no correlation substitution is permitted.');
  }
  if (expected.prospect_id !== v.normalized.prospect_id) {
    return sandboxBlocked(request, 'DELIVERY_REQUEST_PROSPECT_MISMATCH',
      'The delivery request Prospect and the approved Prospect differ — no Prospect substitution is permitted.');
  }
  if (expected.channel !== v.normalized.channel) {
    return sandboxBlocked(request, 'DELIVERY_REQUEST_CHANNEL_MISMATCH',
      'The delivery request channel and the approved channel differ — no channel substitution is permitted.');
  }
  if (expected.approved_draft_hash !== v.normalized.approved_draft_hash) {
    return sandboxBlocked(request, 'DELIVERY_REQUEST_DRAFT_HASH_MISMATCH',
      'The delivery request draft hash and the approved draft hash differ — no draft or message substitution is permitted.');
  }
  if (typeof expected.delivery_identity !== 'string'
    || expected.delivery_identity !== request.delivery_identity) {
    return sandboxBlocked(request, 'DELIVERY_IDENTITY_MISMATCH',
      'The governed delivery identity does not match the authorized boundary identity — no replay of a different logical delivery is permitted.');
  }

  // Guard: structurally, this is the only success path and it can never
  // produce a real-delivery status.
  const status = 'SANDBOX_ONLY';
  assertSandboxResultStatus(status);
  return {
    delivery_status: status,
    simulated: true,
    blocked: false,
    connector_id: DELIVERY_CONNECTOR_ID,
    connector_type: DELIVERY_CONNECTOR_TYPE,
    connector_version: DELIVERY_CONNECTOR_VERSION,
    delivery_mode: DELIVERY_MODE_SANDBOX,
    delivery_identity: request.delivery_identity,
    channel: v.normalized.channel,
    prospect_id: v.normalized.prospect_id,
    approval_id: v.normalized.approval_id,
    execution_id: v.normalized.execution_id,
    correlation_id: v.normalized.correlation_id,
    approved_draft_hash: v.normalized.approved_draft_hash,
    recipient_resolved: false,
    recipient_resolution: DESTINATION_RESOLUTION_STATUS,
    external_delivery: false,
    sent: false,
    delivered: false,
    scheduled: false,
    persisted: false,
    network_calls: 0,
    verification: SANDBOX_VERIFY_NOTICE,
  };
}

/**
 * Sandbox getDeliveryStatus() equivalent — always truthful: no delivery
 * has ever been attempted by the sandbox connector.
 */
export function sandboxGetDeliveryStatus(deliveryIdentity) {
  return {
    delivery_status: 'NOT_ATTEMPTED',
    simulated: true,
    connector_id: DELIVERY_CONNECTOR_ID,
    delivery_mode: DELIVERY_MODE_SANDBOX,
    delivery_identity: typeof deliveryIdentity === 'string' ? deliveryIdentity : null,
    recipient_resolution: DESTINATION_RESOLUTION_STATUS,
    external_delivery: false,
    sent: false,
    delivered: false,
    scheduled: false,
    verification: SANDBOX_VERIFY_NOTICE,
  };
}

/**
 * Builds the provider-neutral delivery audit record (contract only — this
 * module never writes anything; persistence belongs to the execution
 * boundary acting under the service role). Every Phase 12 record carries
 * delivery_mode SANDBOX and can only report a sandbox-truthful status.
 */
export function buildDeliveryAuditRecord(request, result, ctx) {
  const context = (ctx && typeof ctx === 'object') ? ctx : {};
  return {
    audit_id: typeof context.audit_id === 'string' ? context.audit_id : null,
    execution_id: request.execution_id,
    approval_id: request.approval_id,
    prospect_id: request.prospect_id,
    channel: request.channel,
    connector_id: DELIVERY_CONNECTOR_ID,
    connector_type: DELIVERY_CONNECTOR_TYPE,
    connector_version: DELIVERY_CONNECTOR_VERSION,
    delivery_mode: DELIVERY_MODE_SANDBOX,
    result_status: result.delivery_status,
    correlation_id: request.correlation_id,
    timestamp: typeof context.timestamp === 'string' ? context.timestamp : null,
    error_code: result.error_code || null,
    user_id: typeof context.user_id === 'string' ? context.user_id : null,
    organization_id: typeof context.organization_id === 'string' ? context.organization_id : null,
    source: typeof context.source === 'string' ? context.source : 'sandbox_delivery_connector',
    metadata: {
      delivery_identity: request.delivery_identity,
      approved_draft_hash: request.approved_draft_hash,
      simulated: true,
      external_delivery: false,
      recipient_resolution: DESTINATION_RESOLUTION_STATUS,
    },
  };
}
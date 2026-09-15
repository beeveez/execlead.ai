/**
 * Google Workspace Gmail Connector — Phase 13 provider architecture.
 * ============================================================
 * This module is the FIRST real-provider adapter design behind the Phase 12
 * provider-neutral ExternalDeliveryConnector contract. It targets the
 * dedicated EXECLEAD.AI Growth mailbox: growth@execleadai.co.
 *
 * THE GATE REMAINS CLOSED — THIS CONNECTOR IS ARCHITECTURE ONLY:
 * - It is NOT connected. No Google OAuth flow was performed, no permission
 *   or scope was requested, no credential, API key, client secret, service
 *   account, or token was requested, stored, or read.
 * - It NEVER performs a network call of any kind. It never sends, drafts,
 *   reads, modifies, or deletes email, never contacts Gmail, and never
 *   contacts any recipient. It contains no provider SDK, no Google API
 *   client, no authorization library, and no SMTP path.
 * - It NEVER makes authorization decisions. Authorization belongs to the
 *   Agent Orchestration Core (the single governed execution boundary). The
 *   connector receives an ALREADY-AUTHORIZED execution context and only
 *   validates the provider contract; every operational path terminates at
 *   GMAIL_API_NOT_CONNECTED because the provider is not connected.
 * - The registry record is DRAFT and enabled=false, and the
 *   execute_prospect_outreach tool remains DRAFT and disabled, so REAL
 *   DELIVERY = FALSE under the kill switch.
 *
 * GOVERNED CHAIN (design only — the Gmail API is never reached):
 *   Growth Agent → AgentOrchestrationService → AgentOrchestrationCore
 *   → Phase 11 External Outreach Boundary → Phase 12
 *   ExternalDeliveryConnector → Google Gmail Connector → [GMAIL API — NOT
 *   CONNECTED, STOP HERE] → growth@execleadai.co
 *
 * AUTHENTICATION ARCHITECTURE (documented, NOT implemented):
 * - Future authentication MUST be server-side. No provider credential may
 *   ever be sent to the frontend, stored in localStorage or sessionStorage,
 *   included in AgentExecution or AgentApproval metadata, included in logs,
 *   prompts, or LLM context, or exposed to an AI agent or a user.
 * - The Growth Agent must NEVER possess a provider access token. The
 *   orchestration layer must NEVER expose provider credentials. The future
 *   connector receives a server-side authorized provider context — never
 *   credentials from the agent.
 * - The future authorization flow (e.g. Google OAuth, if selected for
 *   production) must be isolated from AgentRegistry, AgentToolRegistry,
 *   AgentExecution, AgentApproval, Prospect, ExecutiveMemory, AI context,
 *   and frontend agent prompts. No token persistence is permitted in this
 *   phase.
 *
 * MAILBOX SCOPE: the future integration is restricted to exactly
 * growth@execleadai.co. The Workforce must never receive generalized
 * Workspace access. Mailbox selection is never exposed to the client; there
 * is no send-as-any-user and no domain-wide arbitrary sending. The sender
 * identity is fixed server-controlled configuration and is not dynamically
 * configurable in this phase.
 *
 * READ ACCESS: this phase is SEND-ARCHITECTURE ONLY. Inbox reading, sent
 * mail, contacts, calendar, Drive, labels, threads, and attachments are all
 * prohibited. Future read functionality requires a separately approved
 * capability. Attachments (upload, Drive lookup, download, transmission)
 * are prohibited and require a separate security review.
 *
 * DELIVERY SEMANTICS (future, documented): REQUESTED → SUBMITTED → SENT →
 * DELIVERED → FAILED. An API submission success may never be reported as
 * DELIVERED. In this phase the connector can only ever return
 * NOT_ATTEMPTED, BLOCKED, or GMAIL_API_NOT_CONNECTED — SENT, DELIVERED,
 * SUBMITTED, and REQUESTED are structurally unavailable.
 *
 * BOUNCE / FAILURE ARCHITECTURE (documented, NOT implemented): rejected
 * recipient, mailbox unavailable, rate limit, provider error,
 * authentication failure, domain policy rejection, spam/reputation
 * rejection, and temporary provider outage. No automatic retry, follow-up,
 * campaign retry, or bulk sending exists or is designed in this phase.
 *
 * COMPLIANCE PREREQUISITES (documented, NOT implemented): before real
 * prospect outreach becomes executable the system must have an explicit
 * compliance design for unsubscribe, suppression, opt-out, lawful outreach
 * basis, jurisdictional requirements, sender identification, and
 * appropriate business contact information. Owning a mailbox never makes
 * prospect outreach legally permissible, and delivery must not be activated
 * until these controls are separately verified.
 *
 * RATE LIMITING (documented, NOT implemented): future server-side controls
 * must cover per-user, per-agent, per-organization, and provider rate
 * limits, daily send limits, and burst protection. No automatic high-volume
 * sender, campaigns, or bulk sending exist in this phase.
 *
 * KILL SWITCH: real Gmail delivery will require BOTH the global
 * orchestration permission AND this connector being enabled in the
 * provider registry. In this phase the connector is enabled=false and the
 * governed outreach tool is DRAFT+disabled, so real delivery is FALSE. The
 * existing global orchestration configuration is not modified.
 *
 * AUDIT: future real delivery must be traceable through AgentExecution,
 * AgentApproval, and OutreachDeliveryAudit preserving execution_id,
 * approval_id, prospect_id, channel, approved_draft_hash, correlation_id,
 * connector_id, connector_version, the delivery identity, result, and
 * timestamp. Provider credentials must NEVER be stored in the audit.
 *
 * This module is pure: no imports, no database access, no entity writes,
 * no network calls, no background processing, no retries, no scheduling,
 * no LLM. It is written in plain JS syntax so the exact shipped file can be
 * executed by the deterministic test suite.
 */

export const GMAIL_CONNECTOR_ID = 'google_workspace_gmail';
export const GMAIL_CONNECTOR_NAME = 'Google Workspace Gmail Connector';
export const GMAIL_CONNECTOR_TYPE = 'GOOGLE_WORKSPACE_GMAIL';
export const GMAIL_CONNECTOR_VERSION = '1.0.0';
export const GMAIL_DELIVERY_IDENTITY = 'growth@execleadai.co';
export const GMAIL_CHANNEL = 'EMAIL';
export const GMAIL_REGISTRY_STATUS = 'DRAFT';
export const GMAIL_REGISTRY_ENABLED = false;
export const GMAIL_DESTINATION_RESOLUTION_STATUS = 'NOT_IMPLEMENTED';
export const GMAIL_DESTINATION_RESOLVED_BY = 'server_delivery_boundary';
export const GMAIL_API_STATUS = 'GMAIL_API_NOT_CONNECTED';
export const GMAIL_ALLOWED_RESULT_STATUSES = ['NOT_ATTEMPTED', 'BLOCKED', 'GMAIL_API_NOT_CONNECTED'];
export const GMAIL_STATUSES_UNAVAILABLE = ['REQUESTED', 'SUBMITTED', 'SENT', 'DELIVERED', 'FAILED'];
export const GMAIL_VERIFY_NOTICE =
  'GMAIL API NOT CONNECTED — NOTHING SENT. This is a Google Workspace Gmail connector architecture result: the provider is not connected, no authorization flow was performed, no credential exists, and no message was sent, drafted, scheduled, persisted, or transmitted; no network call of any kind occurred. The sender identity is fixed server-side to growth@execleadai.co, recipient resolution remains NOT_IMPLEMENTED (server-side only), and the approved message is immutable. Real delivery requires a separately approved future phase that enables BOTH the global orchestration permission and this connector.';

/** Registry seed for the Google provider ARCHITECTURE record — DRAFT,
 * disabled, supports_delivery=false. A registry record never authorizes
 * execution on its own. */
export const GMAIL_REGISTRY_SEED = [
  {
    connector_id: GMAIL_CONNECTOR_ID,
    name: GMAIL_CONNECTOR_NAME,
    connector_type: GMAIL_CONNECTOR_TYPE,
    version: GMAIL_CONNECTOR_VERSION,
    status: GMAIL_REGISTRY_STATUS,
    enabled: GMAIL_REGISTRY_ENABLED,
    supported_channels: [GMAIL_CHANNEL],
    supports_delivery: false,
    sandbox_only: false,
    requires_human_approval: true,
    delivery_identity: GMAIL_DELIVERY_IDENTITY,
    source: 'production_catalog',
    description: 'Provider adapter architecture for governed Gmail delivery from the dedicated EXECLEAD.AI Growth mailbox. Not connected and not enabled.',
  },
];

/** The governed outreach tool must remain frozen in this phase. */
export const EXECUTE_OUTREACH_TOOL_EXPECTED_STATE = {
  tool_id: 'execute_prospect_outreach',
  status: 'DRAFT',
  enabled: false,
  risk_level: 'HIGH',
  human_approval_required: true,
};

/** Server-controlled sender configuration keys a CLIENT may never supply.
 * Sender identity is not dynamically configurable in this phase. */
export const GMAIL_CLIENT_SENDER_FIELD_NAMES = ['from', 'sender', 'sender_email', 'reply_to', 'display_name', 'mailbox', 'sender_address'];

/** Examples of sender identities that are always rejected — the only
 * permitted future sender identity is the fixed server-side configuration
 * value. */
export const GMAIL_FORBIDDEN_SENDER_EXAMPLES = [
  'ray@execleadai.co',
  'ray.execleadai@gmail.com',
  'growth@execleadai.com',
  'no-reply@execleadai.co',
];

/** Credential-like context keys that are ALWAYS rejected. The future
 * connector receives a server-side authorized provider context, never
 * credentials from an agent or client. */
export const GMAIL_CREDENTIAL_FIELD_NAMES = ['access_token', 'refresh_token', 'client_secret', 'token', 'id_token', 'session_key', 'private_key', 'service_account', 'credentials', 'password', 'secret'];

/** Fields that must NEVER appear in a delivery audit record. */
export const GMAIL_AUDIT_PROHIBITED_FIELDS = ['access_token', 'refresh_token', 'client_secret', 'token', 'private_key', 'service_account', 'password', 'secret'];

/** Documented future authentication architecture (no implementation). */
export const GMAIL_AUTHENTICATION_ARCHITECTURE = {
  server_side_only: true,
  credentials_in_frontend: 'prohibited',
  credentials_in_browser_storage: 'prohibited',
  credentials_in_execution_metadata: 'prohibited',
  credentials_in_approval_metadata: 'prohibited',
  credentials_in_logs: 'prohibited',
  credentials_in_prompts_or_llm_context: 'prohibited',
  credentials_exposed_to_agents: 'prohibited',
  growth_agent_possesses_token: 'prohibited',
  connector_receives: 'server_side_authorized_provider_context',
  token_persistence_in_this_phase: 'prohibited',
};

/** Isolation targets the future authorization flow must remain separate
 * from (documented requirement only). */
export const GMAIL_AUTHORIZATION_ISOLATION_TARGETS = [
  'AgentRegistry',
  'AgentToolRegistry',
  'AgentExecution',
  'AgentApproval',
  'Prospect',
  'ExecutiveMemory',
  'ai_context',
  'frontend_agent_prompts',
];

/** SEND-ARCHITECTURE ONLY — every read surface is prohibited in this phase. */
export const GMAIL_READ_ACCESS_PROHIBITED = [
  'inbox',
  'sent_mail',
  'contacts',
  'calendar',
  'drive',
  'gmail_labels',
  'gmail_threads',
  'attachments',
];

/** Attachments are prohibited and require a separate security review. */
export const GMAIL_ATTACHMENT_POLICY = {
  supported: false,
  file_upload: 'prohibited',
  drive_lookup: 'prohibited',
  attachment_download: 'prohibited',
  attachment_transmission: 'prohibited',
  separate_security_review_required: true,
};

/** Conceptual future delivery semantics — an API submission success is
 * never the same as delivery. None of these are producible in this phase. */
export const GMAIL_DELIVERY_SEMANTICS_CONCEPTUAL = ['REQUESTED', 'SUBMITTED', 'SENT', 'DELIVERED', 'FAILED'];

/** Documented future bounce/failure categories — no retry logic exists. */
export const GMAIL_BOUNCE_FAILURE_CATEGORIES = [
  'rejected_recipient',
  'mailbox_unavailable',
  'rate_limit',
  'provider_error',
  'authentication_failure',
  'domain_policy_rejection',
  'spam_reputation_rejection',
  'temporary_provider_outage',
];

/** Compliance design that must exist and be verified before real prospect
 * outreach may ever be executable. */
export const GMAIL_COMPLIANCE_PREREQUISITES = [
  'unsubscribe',
  'suppression_list',
  'opt_out',
  'lawful_outreach_basis',
  'jurisdictional_requirements',
  'sender_identification',
  'business_contact_information',
];

/** Documented future server-side rate-limit controls. No bulk or campaign
 * sender exists or is designed in this phase. */
export const GMAIL_RATE_LIMIT_ARCHITECTURE = {
  per_user_rate_limit: 'required_future_control',
  per_agent_rate_limit: 'required_future_control',
  per_organization_rate_limit: 'required_future_control',
  provider_rate_limit: 'required_future_control',
  daily_send_limit: 'required_future_control',
  burst_protection: 'required_future_control',
  automatic_high_volume_sender: 'prohibited',
  campaigns: 'prohibited',
  bulk_sending: 'prohibited',
};

/** Retry policy for this phase — none, and none designed. */
export const GMAIL_RETRY_POLICY = {
  automatic_retry: 'none',
  automatic_follow_up: 'none',
  campaign_retry: 'none',
};

/** Kill switch: real delivery requires BOTH the global orchestration
 * permission AND this connector being enabled. Both are false. */
export function gmailKillSwitchState() {
  return {
    real_delivery_enabled: false,
    connector_enabled: GMAIL_REGISTRY_ENABLED,
    connector_status: GMAIL_REGISTRY_STATUS,
    execute_prospect_outreach_status: EXECUTE_OUTREACH_TOOL_EXPECTED_STATE.status,
    execute_prospect_outreach_enabled: EXECUTE_OUTREACH_TOOL_EXPECTED_STATE.enabled,
    global_risk_threshold_unchanged: 'medium',
    required_for_real_delivery: [
      'global orchestration permission',
      'provider connector enabled state',
      'separately approved future phase',
    ],
    verification: 'REAL DELIVERY = FALSE. The Google connector is DRAFT and disabled and the governed outreach tool is DRAFT and disabled.',
  };
}

function reject(errorCode, error) {
  return { ok: false, error_code: errorCode, error: error };
}

/** Deterministic FNV-1a hash — identity/immutability binding only, never
 * authorization. Must match the Phase 12 governed identity derivation so a
 * governed request produced by the execution boundary verifies identically. */
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

/** The Phase 11/12 governed delivery identity — identical derivation, no
 * second idempotency authority. */
export function deriveGmailDeliveryIdentity(parts) {
  if (parts === null || typeof parts !== 'object' || Array.isArray(parts)) return '';
  const s = [
    typeof parts.execution_id === 'string' ? parts.execution_id : '',
    typeof parts.approved_draft_hash === 'string' ? parts.approved_draft_hash : '',
    typeof parts.prospect_id === 'string' ? parts.prospect_id : '',
    typeof parts.channel === 'string' ? parts.channel : '',
  ].join('|');
  return fnv1a(s);
}

/** Immutable-message hash over the governed message envelope — MUST match
 * the Phase 12 governed derivation exactly (approved_draft_hash,
 * content_binding, subject, body) so a governed request produced by the
 * execution boundary verifies identically. The recipient (to) is always
 * unresolved in this phase and is deliberately not part of the hash. */
export function deriveGmailMessageHash(message) {
  if (message === null || typeof message !== 'object' || Array.isArray(message)) return '';
  const s = [
    typeof message.approved_draft_hash === 'string' ? message.approved_draft_hash : '',
    typeof message.content_binding === 'string' ? message.content_binding : '',
    typeof message.subject === 'string' ? message.subject : '',
    typeof message.body === 'string' ? message.body : '',
  ].join('|');
  return fnv1a(s);
}

/** Truthful provider capabilities (getCapabilities() equivalent). */
export function gmailGetCapabilities() {
  return {
    connector_id: GMAIL_CONNECTOR_ID,
    name: GMAIL_CONNECTOR_NAME,
    connector_type: GMAIL_CONNECTOR_TYPE,
    version: GMAIL_CONNECTOR_VERSION,
    provider: GMAIL_CONNECTOR_TYPE,
    channel: GMAIL_CHANNEL,
    supported_channels: [GMAIL_CHANNEL],
    status: GMAIL_REGISTRY_STATUS,
    enabled: GMAIL_REGISTRY_ENABLED,
    delivery_enabled: false,
    connected: false,
    authenticated: false,
    sandbox: false,
    real_delivery: false,
    supports_delivery: false,
    sandbox_only: false,
    delivery_identity: GMAIL_DELIVERY_IDENTITY,
    approval_required: true,
    requires_human_approval: true,
    destination_resolution: GMAIL_DESTINATION_RESOLUTION_STATUS,
    api_status: GMAIL_API_STATUS,
    read_access: 'prohibited',
    attachments: 'prohibited',
    retry_policy: GMAIL_RETRY_POLICY,
  };
}

/**
 * Sender identity validation. The ONLY permitted future sender identity is
 * the fixed server-controlled configuration value growth@execleadai.co.
 * Sender identity is not dynamically configurable in this phase; mailbox
 * selection is never exposed to the client; arbitrary mailboxes, personal
 * addresses, and arbitrary Workspace or external addresses are rejected.
 */
export function validateGmailSenderIdentity(candidate) {
  if (typeof candidate !== 'string') {
    return reject('GMAIL_SENDER_IDENTITY_REJECTED', 'The sender identity is fixed server-side configuration and cannot be supplied or changed by any client or agent.');
  }
  if (candidate.trim().toLowerCase() !== GMAIL_DELIVERY_IDENTITY) {
    return reject('GMAIL_SENDER_IDENTITY_REJECTED', `Sender identity "${candidate.trim().toLowerCase()}" is rejected — the only permitted future sender identity is the fixed server-controlled configuration value.`);
  }
  return { ok: true, sender_identity: GMAIL_DELIVERY_IDENTITY };
}

/** Rejects any object carrying a client-supplied sender directive key. */
export function validateNoClientSenderDirective(obj) {
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) return { ok: true };
  for (const key of Object.keys(obj)) {
    if (GMAIL_CLIENT_SENDER_FIELD_NAMES.includes(key)) {
      return reject('GMAIL_CLIENT_SENDER_REJECTED',
        `Client-supplied sender field "${String(key).replace(/[^\w.-]/g, '').substring(0, 40) || 'unknown'}" is rejected — sender identity is fixed server-controlled configuration.`);
    }
  }
  return { ok: true };
}

/**
 * Server-resolved Gmail destination contract. In this phase NO destination
 * is resolved: recipient resolution is NOT_IMPLEMENTED, the recipient
 * reference is structurally null, and the provider identifier is null.
 * recipient_address is SERVER_RESOLVED_ONLY — never accepted from an
 * untrusted client, never resolved in this phase, never read from Gmail,
 * and never read from contacts.
 */
export function buildGmailDestination() {
  const destination = {
    destination_type: GMAIL_CHANNEL,
    resolution_status: GMAIL_DESTINATION_RESOLUTION_STATUS,
    resolved_by: GMAIL_DESTINATION_RESOLVED_BY,
    recipient_reference: null,
    provider_id: null,
  };
  return deepFreeze(destination);
}

/** Validates the Gmail destination contract. Rejects malformed objects,
 * unknown keys, a non-EMAIL destination type, a client-supplied recipient,
 * and an arbitrary provider identifier. */
export function validateGmailDestination(destination) {
  if (destination === null || typeof destination !== 'object' || Array.isArray(destination)) {
    return reject('GMAIL_DESTINATION_INVALID', 'The destination must be a server-built destination contract object.');
  }
  for (const key of Object.keys(destination)) {
    if (!['destination_type', 'resolution_status', 'resolved_by', 'recipient_reference', 'provider_id'].includes(key)) {
      return reject('GMAIL_DESTINATION_FIELD_REJECTED',
        `Destination field "${String(key).replace(/[^\w.-]/g, '').substring(0, 40) || 'unknown'}" is not part of the destination contract.`);
    }
  }
  if (destination.destination_type !== GMAIL_CHANNEL) {
    return reject('GMAIL_DESTINATION_CHANNEL_MISMATCH', 'The Gmail provider supports the EMAIL channel only — no channel substitution is permitted.');
  }
  if (destination.resolution_status !== GMAIL_DESTINATION_RESOLUTION_STATUS) {
    return reject('GMAIL_DESTINATION_RESOLUTION_INVALID', 'Destination resolution is not implemented; no recipient may be resolved or contacted in this phase.');
  }
  if (destination.resolved_by !== GMAIL_DESTINATION_RESOLVED_BY) {
    return reject('GMAIL_DESTINATION_PROVENANCE_INVALID', 'The destination must be built server-side by the governed delivery boundary.');
  }
  if (destination.recipient_reference !== null && destination.recipient_reference !== undefined) {
    return reject('GMAIL_CLIENT_RECIPIENT_REJECTED', 'A client-supplied recipient is never accepted — recipient resolution is a server-side step and remains not implemented.');
  }
  if (destination.provider_id !== null && destination.provider_id !== undefined) {
    return reject('GMAIL_PROVIDER_ID_REJECTED', 'An arbitrary provider identifier is never accepted — provider mapping is a future governed server-side step.');
  }
  return { ok: true };
}

/**
 * Validates the approved message envelope for the Gmail mapping. The
 * semantic future fields are to / subject / body, bound to the approved
 * draft hash. The recipient (to) must be null in this phase — it is
 * SERVER_RESOLVED_ONLY. The message is immutable after approval: no AI
 * rewriting, no automatic personalization, no signature injection, no CTA
 * modification, no content expansion or shortening, no automatic compliance
 * rewriting, and no provider-specific payload keys.
 */
export function validateGmailMessage(message, requestDraftHash) {
  if (message === null || typeof message !== 'object' || Array.isArray(message)) {
    return reject('GMAIL_MESSAGE_INVALID', 'The message must be a server-built message contract object.');
  }
  for (const key of Object.keys(message)) {
    if (!['approved_draft_hash', 'content_binding', 'to', 'subject', 'body'].includes(key)) {
      return reject('GMAIL_MESSAGE_FIELD_REJECTED',
        `Message field "${String(key).replace(/[^\w.-]/g, '').substring(0, 40) || 'unknown'}" is rejected — the approved message is immutable and cannot carry provider-specific or mutation directives.`);
    }
  }
  if (typeof message.approved_draft_hash !== 'string' || message.approved_draft_hash !== requestDraftHash) {
    return reject('GMAIL_MESSAGE_DRAFT_HASH_MISMATCH', 'The message must be bound to the exact approved draft hash — no draft or message substitution is permitted.');
  }
  if (message.content_binding !== 'APPROVED_DRAFT_HASH') {
    return reject('GMAIL_MESSAGE_CONTENT_BINDING_INVALID', 'The message content must remain bound to the approved draft hash produced by the governed preparation boundary.');
  }
  if (message.to !== null && message.to !== undefined) {
    return reject('GMAIL_CLIENT_RECIPIENT_REJECTED', 'A client-supplied recipient (to) is never accepted — recipient resolution is a server-side step and remains not implemented.');
  }
  for (const field of ['subject', 'body']) {
    const value = message[field];
    if (value === null || value === undefined) continue;
    if (typeof value !== 'string' || value.length > 2000 || /[\u0000-\u001f\u007f]/.test(value)) {
      return reject('GMAIL_MESSAGE_CONTENT_INVALID', 'Message content must be bounded plain text; the connector never rewrites, personalizes, or augments the approved message.');
    }
  }
  return { ok: true };
}

/**
 * Validates the provider context the connector may receive. The future
 * connector receives a server-side authorized provider context — NEVER
 * credentials from an agent or client. Any credential-like key, token, or
 * secret injected into the context is rejected.
 */
export function validateGmailProviderContext(context) {
  if (context === null || typeof context !== 'object' || Array.isArray(context)) {
    return reject('GMAIL_PROVIDER_CONTEXT_INVALID', 'The provider context must be a server-built object.');
  }
  for (const key of Object.keys(context)) {
    if (GMAIL_CREDENTIAL_FIELD_NAMES.includes(key)) {
      return reject('GMAIL_CREDENTIAL_INJECTION_REJECTED',
        `Credential field "${String(key).replace(/[^\w.-]/g, '').substring(0, 40) || 'unknown'}" is rejected — the connector receives a server-side authorized provider context, never credentials, and no credential may be sent to the frontend, stored in browser storage, execution or approval metadata, logs, prompts, or LLM context.`);
    }
  }
  return { ok: true };
}

const GMAIL_REQUEST_ALLOWED_FIELDS = [
  'prospect_id', 'channel', 'approved_draft_hash', 'approval_id',
  'execution_id', 'correlation_id', 'destination', 'message',
  'message_hash', 'delivery_identity',
];
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DRAFT_HASH_RE = /^[0-9a-f]{8,64}$/;
const CORRELATION_RE = /^[A-Za-z0-9:._-]{8,200}$/;

function validateGovernedRequestFields(fields) {
  if (fields === null || typeof fields !== 'object' || Array.isArray(fields)) {
    return reject('GMAIL_REQUEST_INVALID', 'The governed delivery request must be a plain object built by the execution boundary.');
  }
  for (const key of Object.keys(fields)) {
    if (!GMAIL_REQUEST_ALLOWED_FIELDS.includes(key)) {
      return reject('GMAIL_REQUEST_FIELD_REJECTED',
        `Field "${String(key).replace(/[^\w.-]/g, '').substring(0, 40) || 'unknown'}" is not part of the governed delivery request contract.`);
    }
  }
  if (typeof fields.prospect_id !== 'string' || !UUID_RE.test(fields.prospect_id.trim().toLowerCase())) {
    return reject('GMAIL_REQUEST_PROSPECT_ID_INVALID', 'prospect_id must be the bounded prospect identifier issued at record creation.');
  }
  const channel = typeof fields.channel === 'string' ? fields.channel.trim().toUpperCase() : '';
  if (channel !== GMAIL_CHANNEL) {
    return reject('GMAIL_REQUEST_CHANNEL_UNSUPPORTED', 'The Gmail provider supports the EMAIL channel only. No channel is contacted in this phase.');
  }
  if (typeof fields.approved_draft_hash !== 'string' || !DRAFT_HASH_RE.test(fields.approved_draft_hash.trim().toLowerCase())) {
    return reject('GMAIL_REQUEST_DRAFT_HASH_INVALID', 'approved_draft_hash must be 8-64 lowercase hexadecimal characters identifying the exact approved draft.');
  }
  if (typeof fields.approval_id !== 'string' || !UUID_RE.test(fields.approval_id.trim().toLowerCase())) {
    return reject('GMAIL_REQUEST_APPROVAL_ID_INVALID', 'approval_id must be the server-issued approval identifier binding this delivery.');
  }
  if (typeof fields.execution_id !== 'string' || !UUID_RE.test(fields.execution_id.trim().toLowerCase())) {
    return reject('GMAIL_REQUEST_EXECUTION_ID_INVALID', 'execution_id must be the server-issued governed execution identifier.');
  }
  if (typeof fields.correlation_id !== 'string' || !CORRELATION_RE.test(fields.correlation_id.trim())) {
    return reject('GMAIL_REQUEST_CORRELATION_ID_INVALID', 'correlation_id must be the governed correlation identifier issued by the execution boundary.');
  }
  const destinationCheck = validateGmailDestination(fields.destination);
  if (!destinationCheck.ok) return destinationCheck;
  const messageCheck = validateGmailMessage(fields.message, fields.approved_draft_hash.trim().toLowerCase());
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
 * Conceptual provider mapping (prepareDelivery() equivalent) — documents
 * the future mapping: EXECLEAD.AI approved message → provider message
 * representation → provider send operation. NO provider API call is made
 * or constructed: the mapping terminates at GMAIL_API_NOT_CONNECTED. The
 * sender is the fixed server-controlled identity; the recipient remains
 * unresolved (server-side only).
 */
export function gmailMapToProviderRepresentation(request) {
  const v = validateGovernedRequestFields(request);
  if (!v.ok) return v;
  return deepFreeze({
    provider: GMAIL_CONNECTOR_TYPE,
    connector_id: GMAIL_CONNECTOR_ID,
    from: GMAIL_DELIVERY_IDENTITY,
    to: null,
    subject: v.normalized.message.subject === undefined ? null : v.normalized.message.subject,
    body: v.normalized.message.body === undefined ? null : v.normalized.message.body,
    recipient_resolution: GMAIL_DESTINATION_RESOLUTION_STATUS,
    api_status: GMAIL_API_STATUS,
    api_call_made: false,
    network_calls: 0,
    verification: GMAIL_VERIFY_NOTICE,
  });
}

/** Structurally asserts the not-connected result guard: this connector can
 * never produce REQUESTED, SUBMITTED, SENT, DELIVERED, or FAILED. */
export function assertGmailResultStatus(status) {
  if (GMAIL_STATUSES_UNAVAILABLE.includes(status)) {
    throw new Error(`The Google Workspace Gmail connector can never produce status ${status} — the provider is not connected.`);
  }
  if (!GMAIL_ALLOWED_RESULT_STATUSES.includes(status)) {
    throw new Error(`Unknown delivery result status: ${String(status)}`);
  }
  return true;
}

function gmailBlocked(request, errorCode, error) {
  const r = (request && typeof request === 'object') ? request : {};
  return {
    delivery_status: 'BLOCKED',
    blocked: true,
    api_status: GMAIL_API_STATUS,
    connector_id: GMAIL_CONNECTOR_ID,
    connector_type: GMAIL_CONNECTOR_TYPE,
    connector_version: GMAIL_CONNECTOR_VERSION,
    delivery_mode: 'REAL',
    delivery_identity: typeof r.delivery_identity === 'string' ? r.delivery_identity : null,
    channel: typeof r.channel === 'string' ? r.channel : null,
    prospect_id: typeof r.prospect_id === 'string' ? r.prospect_id : null,
    approval_id: typeof r.approval_id === 'string' ? r.approval_id : null,
    execution_id: typeof r.execution_id === 'string' ? r.execution_id : null,
    correlation_id: typeof r.correlation_id === 'string' ? r.correlation_id : null,
    recipient_resolved: false,
    recipient_resolution: GMAIL_DESTINATION_RESOLUTION_STATUS,
    external_delivery: false,
    sent: false,
    delivered: false,
    scheduled: false,
    persisted: false,
    network_calls: 0,
    error_code: errorCode,
    error,
    verification: GMAIL_VERIFY_NOTICE,
  };
}

/**
 * THE Gmail deliver() equivalent — contract validation only. The provider
 * is NOT connected, so every fully-validated request terminates safely at
 * GMAIL_API_NOT_CONNECTED: no provider call is made, no message is sent,
 * drafted, or scheduled, and no recipient is contacted. The connector makes
 * NO authorization decisions — an already-authorized boundary context is
 * required, and direct or unauthorized invocation is blocked.
 */
export function gmailDeliver(request, boundaryContext) {
  if (boundaryContext === null || typeof boundaryContext !== 'object'
    || boundaryContext.authorization_verified !== true) {
    return gmailBlocked(request, 'GMAIL_CONTEXT_NOT_AUTHORIZED',
      'The connector received no authorized execution context — the Agent Orchestration Core is the only authorization authority and direct connector invocation is prohibited.');
  }
  const credentialCheck = validateGmailProviderContext(boundaryContext);
  if (!credentialCheck.ok) return gmailBlocked(request, credentialCheck.error_code, credentialCheck.error);
  const senderDirectiveCheck = validateNoClientSenderDirective(boundaryContext);
  if (!senderDirectiveCheck.ok) return gmailBlocked(request, senderDirectiveCheck.error_code, senderDirectiveCheck.error);
  const expected = boundaryContext.expected;
  if (expected === null || typeof expected !== 'object') {
    return gmailBlocked(request, 'GMAIL_CONTEXT_INCOMPLETE', 'The authorized boundary context is incomplete — no delivery validation can proceed.');
  }

  if (request === null || typeof request !== 'object' || Array.isArray(request)) {
    return gmailBlocked(request, 'GMAIL_REQUEST_INVALID', 'The governed delivery request is missing or malformed — no delivery validation can proceed.');
  }
  const senderInRequest = validateNoClientSenderDirective(request);
  if (!senderInRequest.ok) return gmailBlocked(request, senderInRequest.error_code, senderInRequest.error);
  if (request.message && typeof request.message === 'object') {
    const senderInMessage = validateNoClientSenderDirective(request.message);
    if (!senderInMessage.ok) return gmailBlocked(request, senderInMessage.error_code, senderInMessage.error);
  }
  if (request.destination && typeof request.destination === 'object') {
    const senderInDestination = validateNoClientSenderDirective(request.destination);
    if (!senderInDestination.ok) return gmailBlocked(request, senderInDestination.error_code, senderInDestination.error);
  }
  if (typeof request.message_hash !== 'string' || request.message_hash === '') {
    return gmailBlocked(request, 'GMAIL_MESSAGE_HASH_MISSING', 'The governed request carries no message hash — a request may only be built by the execution boundary.');
  }
  if (typeof request.delivery_identity !== 'string' || request.delivery_identity === '') {
    return gmailBlocked(request, 'GMAIL_DELIVERY_IDENTITY_MISSING', 'The governed request carries no delivery identity — the Phase 11 governed identity is mandatory.');
  }
  const v = validateGovernedRequestFields(request);
  if (!v.ok) return gmailBlocked(request, v.error_code, v.error);
  if (deriveGmailMessageHash(v.normalized.message) !== request.message_hash) {
    return gmailBlocked(request, 'GMAIL_MESSAGE_MUTATED',
      'The approved message hash no longer matches — the approved message is immutable after approval and any subject, body, or recipient mutation is blocked.');
  }
  if (deriveGmailDeliveryIdentity({
    execution_id: v.normalized.execution_id,
    approved_draft_hash: v.normalized.approved_draft_hash,
    prospect_id: v.normalized.prospect_id,
    channel: v.normalized.channel,
  }) !== request.delivery_identity) {
    return gmailBlocked(request, 'GMAIL_DELIVERY_IDENTITY_MISMATCH', 'The delivery identity no longer matches the governed request — no request replay or substitution is permitted.');
  }

  // Binding revalidation against the authorized boundary context.
  if (expected.approval_id !== v.normalized.approval_id) {
    return gmailBlocked(request, 'GMAIL_APPROVAL_MISMATCH', 'The delivery request approval and the authorized approval differ — no approval substitution or mutation is permitted.');
  }
  if (expected.execution_id !== v.normalized.execution_id) {
    return gmailBlocked(request, 'GMAIL_EXECUTION_MISMATCH', 'The delivery request execution and the authorized execution differ — no execution substitution is permitted.');
  }
  if (expected.correlation_id !== v.normalized.correlation_id) {
    return gmailBlocked(request, 'GMAIL_CORRELATION_MISMATCH', 'The delivery request correlation and the authorized correlation differ — no correlation substitution is permitted.');
  }
  if (expected.prospect_id !== v.normalized.prospect_id) {
    return gmailBlocked(request, 'GMAIL_PROSPECT_MISMATCH', 'The delivery request Prospect and the approved Prospect differ — no Prospect substitution is permitted.');
  }
  if (expected.channel !== v.normalized.channel) {
    return gmailBlocked(request, 'GMAIL_CHANNEL_MISMATCH', 'The delivery request channel and the approved channel differ — no channel substitution is permitted.');
  }
  if (expected.approved_draft_hash !== v.normalized.approved_draft_hash) {
    return gmailBlocked(request, 'GMAIL_DRAFT_HASH_MISMATCH', 'The delivery request draft hash and the approved draft hash differ — no draft or message substitution is permitted.');
  }
  if (typeof expected.delivery_identity !== 'string' || expected.delivery_identity !== request.delivery_identity) {
    return gmailBlocked(request, 'GMAIL_DELIVERY_IDENTITY_MISMATCH', 'The governed delivery identity does not match the authorized boundary identity — no replay of a different logical delivery is permitted.');
  }

  // Guard: the provider is not connected — this is the only terminal state
  // of a fully validated request, and it can never claim real delivery.
  const status = GMAIL_API_STATUS;
  assertGmailResultStatus(status);
  return {
    delivery_status: status,
    blocked: false,
    not_connected: true,
    api_status: GMAIL_API_STATUS,
    connector_id: GMAIL_CONNECTOR_ID,
    connector_type: GMAIL_CONNECTOR_TYPE,
    connector_version: GMAIL_CONNECTOR_VERSION,
    delivery_mode: 'REAL',
    sender_identity: GMAIL_DELIVERY_IDENTITY,
    delivery_identity: request.delivery_identity,
    channel: v.normalized.channel,
    prospect_id: v.normalized.prospect_id,
    approval_id: v.normalized.approval_id,
    execution_id: v.normalized.execution_id,
    correlation_id: v.normalized.correlation_id,
    approved_draft_hash: v.normalized.approved_draft_hash,
    recipient_resolved: false,
    recipient_resolution: GMAIL_DESTINATION_RESOLUTION_STATUS,
    external_delivery: false,
    sent: false,
    delivered: false,
    scheduled: false,
    persisted: false,
    network_calls: 0,
    verification: GMAIL_VERIFY_NOTICE,
  };
}

/** getDeliveryStatus() equivalent — always truthful: nothing has ever been
 * attempted by this connector because it is not connected. */
export function gmailGetDeliveryStatus(deliveryIdentity) {
  return {
    delivery_status: 'NOT_ATTEMPTED',
    api_status: GMAIL_API_STATUS,
    connector_id: GMAIL_CONNECTOR_ID,
    delivery_identity: typeof deliveryIdentity === 'string' ? deliveryIdentity : null,
    recipient_resolution: GMAIL_DESTINATION_RESOLUTION_STATUS,
    external_delivery: false,
    sent: false,
    delivered: false,
    scheduled: false,
    network_calls: 0,
    verification: GMAIL_VERIFY_NOTICE,
  };
}

/**
 * Builds the provider-neutral Gmail delivery audit record (contract only —
 * this module never writes anything; persistence belongs to the execution
 * boundary acting under the service role). No credential field may ever
 * appear: the record is built exclusively from allow-listed governed
 * fields, and prohibited credential fields are structurally excluded.
 */
export function buildGmailAuditRecord(request, result, ctx) {
  const context = (ctx && typeof ctx === 'object') ? ctx : {};
  const record = {
    audit_id: typeof context.audit_id === 'string' ? context.audit_id : null,
    execution_id: request.execution_id,
    approval_id: request.approval_id,
    prospect_id: request.prospect_id,
    channel: request.channel,
    connector_id: GMAIL_CONNECTOR_ID,
    connector_type: GMAIL_CONNECTOR_TYPE,
    connector_version: GMAIL_CONNECTOR_VERSION,
    delivery_mode: 'REAL',
    result_status: result.delivery_status,
    correlation_id: request.correlation_id,
    timestamp: typeof context.timestamp === 'string' ? context.timestamp : null,
    error_code: result.error_code || null,
    user_id: typeof context.user_id === 'string' ? context.user_id : null,
    organization_id: typeof context.organization_id === 'string' ? context.organization_id : null,
    source: typeof context.source === 'string' ? context.source : 'google_workspace_gmail_connector',
    metadata: {
      delivery_identity: request.delivery_identity,
      sender_identity: GMAIL_DELIVERY_IDENTITY,
      approved_draft_hash: request.approved_draft_hash,
      external_delivery: false,
      recipient_resolution: GMAIL_DESTINATION_RESOLUTION_STATUS,
      api_status: GMAIL_API_STATUS,
    },
  };
  // Structural guard: no prohibited credential field may ever be present.
  for (const key of Object.keys(record)) {
    if (GMAIL_AUDIT_PROHIBITED_FIELDS.includes(key)) {
      throw new Error(`Prohibited credential field "${key}" may never appear in a delivery audit record.`);
    }
  }
  return record;
}

// --- Phase 14C additive: server-side Gmail OAuth connector-token boundary --
// The connector holds no credentials and never will: the Base44-managed
// Gmail OAuth connector is the ONLY credential source. Trusted server code
// supplies the genuine server-only connector-token provider plus the
// sanitized server gateway snapshot; the connector validates the boundary
// contract and returns ONLY sanitized status. The connector token can
// never flow through this result to any client or agent. Service-account
// private keys and Google IAM token-signing delegation are NOT part of
// this architecture and are never used. Frontend code cannot reach this
// path, and real delivery remains disabled by the kill switch.

export const GMAIL_CONNECTOR_TOKEN_BOUNDARY_PROVIDER_ID = 'base44_gmail_oauth_connector_token_provider';

export const GMAIL_CONNECTOR_TOKEN_BOUNDARY_MARKERS = [
  'GMAIL_CONNECTOR_PROVIDER_ID',
  'GMAIL_CONNECTOR_ARCHITECTURE',
  'GMAIL_CONNECTOR_EXPECTED_IDENTITY',
  'GMAIL_CONNECTOR_REQUIRED_SCOPE',
  'GMAIL_SENDER_IDENTITY',
  'validateGmailConnectorIdentity',
  'validateGmailConnectorScopes',
  'validateGmailConnectorSender',
  'getGmailConnectorCredentialStatus',
  'acquireGmailConnectorTokenContext',
];

export function gmailRequestConnectorAuthentication(boundaryContext, tokenBoundary, gatewaySnapshot) {
  function authBlocked(errorCode, error) {
    return {
      ok: false,
      provider_authentication: 'BLOCKED',
      configured: false,
      authenticated: false,
      connected: false,
      delivery_enabled: false,
      api_status: GMAIL_API_STATUS,
      sender_identity: GMAIL_DELIVERY_IDENTITY,
      error_code: errorCode,
      error,
      external_delivery: false,
      sent: false,
      scheduled: false,
      persisted: false,
      network_calls: 0,
      verification: GMAIL_VERIFY_NOTICE,
    };
  }
  if (boundaryContext === null || typeof boundaryContext !== 'object'
    || boundaryContext.authorization_verified !== true) {
    return authBlocked('GMAIL_CONTEXT_NOT_AUTHORIZED',
      'Connector-token authentication requires an authorized server execution context — the Agent Orchestration Core is the only authorization authority.');
  }
  const credentialCheck = validateGmailProviderContext(boundaryContext);
  if (!credentialCheck.ok) return authBlocked(credentialCheck.error_code, credentialCheck.error);
  const senderDirectiveCheck = validateNoClientSenderDirective(boundaryContext);
  if (!senderDirectiveCheck.ok) return authBlocked(senderDirectiveCheck.error_code, senderDirectiveCheck.error);
  if (tokenBoundary === null || typeof tokenBoundary !== 'object') {
    return authBlocked('GMAIL_CONNECTOR_TOKEN_BOUNDARY_INVALID',
      'No genuine server-side Gmail OAuth connector-token boundary was supplied — the Base44-managed Gmail connector is the only credential source.');
  }
  for (const marker of GMAIL_CONNECTOR_TOKEN_BOUNDARY_MARKERS) {
    if (tokenBoundary[marker] === undefined) {
      return authBlocked('GMAIL_CONNECTOR_TOKEN_BOUNDARY_INVALID',
        'The supplied object does not satisfy the server-side connector-token boundary contract.');
    }
  }
  if (tokenBoundary.GMAIL_CONNECTOR_PROVIDER_ID !== GMAIL_CONNECTOR_TOKEN_BOUNDARY_PROVIDER_ID) {
    return authBlocked('GMAIL_CONNECTOR_TOKEN_BOUNDARY_INVALID',
      'The supplied connector-token boundary identity does not match the authorized provider boundary.');
  }
  if (tokenBoundary.GMAIL_CONNECTOR_ARCHITECTURE !== 'BASE44_MANAGED_GMAIL_OAUTH_CONNECTOR') {
    return authBlocked('GMAIL_CONNECTOR_TOKEN_BOUNDARY_MISMATCH',
      'The connector-token boundary architecture must be the Base44-managed Gmail OAuth connector — service-account and IAM-delegation architectures are not accepted.');
  }
  if (tokenBoundary.GMAIL_SENDER_IDENTITY !== GMAIL_DELIVERY_IDENTITY) {
    return authBlocked('GMAIL_CONNECTOR_TOKEN_BOUNDARY_MISMATCH',
      'The connector-token boundary sender does not match the fixed server-controlled Growth mailbox sender identity.');
  }
  const identitySelfCheck = tokenBoundary.validateGmailConnectorIdentity(tokenBoundary.GMAIL_CONNECTOR_EXPECTED_IDENTITY);
  if (identitySelfCheck === null || typeof identitySelfCheck !== 'object' || identitySelfCheck.ok !== true) {
    return authBlocked('GMAIL_CONNECTOR_TOKEN_BOUNDARY_MISMATCH',
      'The connector-token boundary failed its own connected-identity validation.');
  }
  const scopeSelfCheck = tokenBoundary.validateGmailConnectorScopes([tokenBoundary.GMAIL_CONNECTOR_REQUIRED_SCOPE]);
  if (scopeSelfCheck === null || typeof scopeSelfCheck !== 'object' || scopeSelfCheck.ok !== true) {
    return authBlocked('GMAIL_CONNECTOR_TOKEN_BOUNDARY_SCOPE_INVALID',
      'The connector-token boundary failed its own Gmail scope validation — exactly one authorized sending scope is required.');
  }
  const status = tokenBoundary.getGmailConnectorCredentialStatus(gatewaySnapshot);
  if (status === null || typeof status !== 'object' || status.connected !== true) {
    return {
      ok: false,
      provider_authentication: 'NOT_CONNECTED',
      configured: false,
      authenticated: false,
      connected: false,
      delivery_enabled: false,
      api_status: GMAIL_API_STATUS,
      sender_identity: GMAIL_DELIVERY_IDENTITY,
      missing_requirements: (status && Array.isArray(status.missing_requirements)) ? status.missing_requirements : null,
      error_code: (status && typeof status.error_code === 'string') ? status.error_code : 'GMAIL_CONNECTOR_UNAVAILABLE',
      error: 'The Base44-managed Gmail OAuth connector is not available with the required identity and scope — the boundary fails closed and nothing is sent.',
      external_delivery: false,
      sent: false,
      scheduled: false,
      persisted: false,
      network_calls: 0,
      verification: GMAIL_VERIFY_NOTICE,
    };
  }
  // Server-side acquisition only. The acquired connector-token context stays
  // inside this call and is NEVER returned — the output is rebuilt
  // exclusively from sanitized status fields, so no token material can
  // reach a client, an agent, an execution record, an approval record, a
  // Prospect, a prompt, telemetry, or any log.
  const acquired = tokenBoundary.acquireGmailConnectorTokenContext({ requested_sender: GMAIL_DELIVERY_IDENTITY }, gatewaySnapshot);
  if (acquired === null || typeof acquired !== 'object' || acquired.ok !== true) {
    const boundedError = (acquired && typeof acquired.error === 'string') ? acquired.error.substring(0, 500) : 'Server-side Gmail connector-token acquisition failed closed.';
    return authBlocked(
      (acquired && typeof acquired.error_code === 'string') ? acquired.error_code : 'GMAIL_CONNECTOR_TOKEN_ACQUISITION_FAILED',
      boundedError,
    );
  }
  if (acquired.sender_identity !== GMAIL_DELIVERY_IDENTITY) {
    return authBlocked('GMAIL_SENDER_IDENTITY_MISMATCH',
      'The acquired connector-token context does not carry the fixed server-controlled Growth mailbox sender identity — nothing is sent.');
  }
  return {
    ok: true,
    provider_authentication: 'SERVER_SIDE_ONLY',
    configured: true,
    authenticated: true,
    connected: true,
    delivery_enabled: false,
    api_status: GMAIL_API_STATUS,
    sender_identity: GMAIL_DELIVERY_IDENTITY,
    connected_identity: acquired.connected_identity,
    token_in_result: 'none — the connector token stays inside the server boundary and is never returned',
    external_delivery: false,
    sent: false,
    scheduled: false,
    persisted: false,
    network_calls: 0,
    verification: 'GMAIL OAUTH CONNECTOR-TOKEN AUTHENTICATION RESOLVED SERVER-SIDE ONLY — the Base44-managed Gmail connector is the only credential source, the token never leaves the server boundary and is never returned to any client or agent, recipient resolution remains NOT_IMPLEMENTED, and real delivery remains disabled by the kill switch — NOTHING SENT.',
  };
}
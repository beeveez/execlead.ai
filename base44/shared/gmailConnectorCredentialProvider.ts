/**
 * Gmail OAuth Connector-Token Provider — Phase 14C server-only credential
 * boundary for the EXECLEAD.AI Growth mailbox provider.
 * ============================================================
 * SINGLE PURPOSE: validate the Base44-managed Gmail OAuth connector
 * credential (the short-lived server-side connector token) for the governed
 * Google Workspace Gmail delivery path, exclusively inside trusted
 * server/backend code. Nothing else.
 *
 * FINAL AUTHORIZED ARCHITECTURE (operator decision, 2026-09-15):
 * - The Base44-managed Gmail OAuth connector is the ONLY credential source.
 * - Connected Google Workspace identity: r.valdez@execleadai.co
 * - Fixed sender identity (approved Gmail Send As alias): growth@execleadai.co
 * - The only authorized Gmail data scope is the fixed gmail.send scope.
 * - Google Cloud Domain-wide Delegation exists but is NOT used by this runtime.
 * - Service-account private keys are NOT supported and are never used —
 *   the Google Cloud organization correctly blocks service-account key
 *   creation and this boundary never requires one.
 * - Google IAM token-signing delegation is NOT used.
 * - No Google Cloud IAM was modified for this phase.
 *
 * CREDENTIAL MECHANISM (no token is ever persisted, exposed, or logged):
 * - The connector token enters this boundary ONLY via the sanitized server
 *   gateway snapshot supplied by trusted server code (the Base44
 *   server-side connector mechanism). No environment secret, no private
 *   key, no OAuth client secret is read by this module.
 * - The gateway snapshot is strictly allow-listed; every unknown field is
 *   rejected, and every acquisition revalidates availability, connected
 *   identity, granted scope, and token presence — failing closed with a
 *   deterministic error that never carries token material.
 *
 * ISOLATION GUARANTEES (enforced and test-verified):
 * - Server-only: a browser runtime is structurally refused, and this
 *   module is never imported by frontend code.
 * - The ONLY surface that can carry the connector token is
 *   acquireGmailConnectorTokenContext, which returns a frozen server-side
 *   context to trusted server callers. No status, error, result, log, or
 *   diagnostic ever carries the token.
 * - The connector token is never persisted to any application entity,
 *   never stored in browser storage, never written to telemetry or usage
 *   logs, never placed in prompts or LLM context, never shown to the
 *   Growth Agent or any client, and never included in execution or
 *   approval metadata, delivery audits, or error messages.
 * - This module performs NO network access and NO Gmail API call. The Gmail
 *   API can only be reached by a future separately approved activation
 *   phase, and only through the governed delivery boundary.
 *
 * This module is pure: no imports, no database access, no entity writes,
 * no network calls, no logging, no LLM. It is written in plain JS syntax so
 * the exact shipped file can be executed by the deterministic test suite.
 */

export const GMAIL_CONNECTOR_PROVIDER_ID = 'base44_gmail_oauth_connector_token_provider';
export const GMAIL_CONNECTOR_PROVIDER_VERSION = '1.0.0';
export const GMAIL_CONNECTOR_ARCHITECTURE = 'BASE44_MANAGED_GMAIL_OAUTH_CONNECTOR';
export const GMAIL_CONNECTOR_INTEGRATION_TYPE = 'gmail';
export const GMAIL_CONNECTOR_EXPECTED_IDENTITY = 'r.valdez@execleadai.co';
export const GMAIL_SENDER_IDENTITY = 'growth@execleadai.co';
export const GMAIL_CONNECTOR_REQUIRED_SCOPE = 'https://www.googleapis.com/auth/gmail.send';
export const GMAIL_CONNECTOR_IDENTITY_ONLY_SCOPES = ['email', 'openid'];
export const GMAIL_CONNECTOR_FORBIDDEN_GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/gmail.insert',
  'https://www.googleapis.com/auth/gmail.labels',
  'https://www.googleapis.com/auth/gmail.settings.basic',
  'https://mail.google.com/',
];
export const GMAIL_CONNECTOR_REJECTED_AUTH_ARCHITECTURES = [
  'SERVICE_ACCOUNT_PRIVATE_KEY',
  'SERVICE_ACCOUNT_KEY_FILE',
  'DOMAIN_WIDE_DELEGATION_KEY',
  'GOOGLE_IAM_TOKEN_SIGNING_DELEGATION',
];
export const GMAIL_CONNECTOR_TOKEN_NEVER_SURFACES = [
  'AgentRegistry',
  'AgentToolRegistry',
  'ExternalDeliveryConnectorRegistry',
  'AgentExecution',
  'AgentApproval',
  'Prospect',
  'prompts',
  'llm_context',
  'browser_local_storage',
  'browser_session_storage',
  'telemetry',
  'UsageLog',
  'notification_records',
  'delivery_audit_records',
  'error_messages',
  'execution_metadata',
  'execution_result_fields',
];
export const GMAIL_CONNECTOR_BOUNDARY_CONTRACT_MARKERS = [
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

const GMAIL_CONNECTOR_OPTION_FIELDS = ['requested_sender'];
const GMAIL_CONNECTOR_INJECTION_FIELDS = [
  'access_token',
  'refresh_token',
  'client_secret',
  'token',
  'id_token',
  'session_key',
  'private_key',
  'service_account',
  'credentials',
  'password',
  'secret',
];
const GMAIL_CONNECTOR_GATEWAY_FIELDS = [
  'connector_available',
  'connected_identity',
  'granted_scopes',
  'connector_token',
  'retrieval_status',
];
const GMAIL_CONNECTOR_CLIENT_DIRECTIVE_FIELDS = [
  'sender',
  'sender_email',
  'from',
  'mailbox',
  'gmail_account',
  'gmail_user',
  'account',
  'recipient',
  'to',
  'cc',
  'bcc',
  'provider_id',
  'destination',
  'params',
  'api_parameters',
  'query',
  'q',
];

function connectorReject(errorCode, error) {
  return { ok: false, error_code: errorCode, error: error };
}

function deepFreeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const key of Object.keys(value)) deepFreeze(value[key]);
  }
  return value;
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Server-only runtime guard. A browser runtime is structurally refused:
 * the connector-token provider can never execute or expose the connector
 * token in the browser, even if the module were ever bundled into frontend
 * code.
 */
export function gmailConnectorServerOnlyGuard(sandbox) {
  const s = (sandbox === null || sandbox === undefined)
    ? (typeof globalThis !== 'undefined' ? globalThis : {})
    : sandbox;
  if (typeof s.window !== 'undefined' || typeof s.document !== 'undefined') {
    return connectorReject('GMAIL_CONNECTOR_SERVER_ONLY',
      'The Gmail OAuth connector-token provider executes only in trusted server code — a browser runtime can never obtain the connector token.');
  }
  return { ok: true };
}

/**
 * Connected-identity enforcement. The only permitted connected Google
 * Workspace identity is the fixed primary Workspace account; arbitrary
 * accounts, the Growth alias itself, and any other address are rejected.
 */
export function validateGmailConnectorIdentity(identity) {
  if (typeof identity !== 'string'
    || identity.trim().toLowerCase() !== GMAIL_CONNECTOR_EXPECTED_IDENTITY) {
    return connectorReject('GMAIL_CONNECTOR_IDENTITY_REJECTED',
      'The connected Gmail OAuth identity does not match the authorized Google Workspace account — the boundary fails closed.');
  }
  return { ok: true, connected_identity: GMAIL_CONNECTOR_EXPECTED_IDENTITY };
}

/**
 * Scope enforcement. The granted scope set must contain exactly the fixed
 * gmail.send scope as its only Gmail data scope. Broader Gmail scopes,
 * read scopes, compose scopes, full-access scopes, and any additional data
 * scope are always rejected. Plain identity scopes alongside the sending
 * scope are permitted — they grant no Gmail data access.
 */
export function validateGmailConnectorScopes(scopes) {
  if (!Array.isArray(scopes) || scopes.some((s) => typeof s !== 'string')) {
    return connectorReject('GMAIL_CONNECTOR_SCOPE_REJECTED',
      'The granted Gmail scope set is missing or malformed — the boundary fails closed.');
  }
  const normalized = scopes.map((s) => s.trim());
  if (!normalized.includes(GMAIL_CONNECTOR_REQUIRED_SCOPE)) {
    return connectorReject('GMAIL_CONNECTOR_SCOPE_REJECTED',
      'The granted Gmail scopes do not include the fixed authorized sending scope — the boundary fails closed.');
  }
  for (const scope of GMAIL_CONNECTOR_FORBIDDEN_GMAIL_SCOPES) {
    if (normalized.includes(scope)) {
      return connectorReject('GMAIL_CONNECTOR_SCOPE_REJECTED',
        'A broader Gmail scope is present in the granted scope set — only the fixed sending scope may be granted.');
    }
  }
  const allowed = [GMAIL_CONNECTOR_REQUIRED_SCOPE].concat(GMAIL_CONNECTOR_IDENTITY_ONLY_SCOPES);
  for (const scope of normalized) {
    if (!allowed.includes(scope)) {
      return connectorReject('GMAIL_CONNECTOR_SCOPE_REJECTED',
        'The granted scope set contains a scope beyond the authorized sending scope and plain identity scopes — the boundary fails closed.');
    }
  }
  return { ok: true, gmail_scope: GMAIL_CONNECTOR_REQUIRED_SCOPE, granted_scopes: normalized };
}

/**
 * Sender enforcement. The only permitted sender is the fixed approved
 * Gmail Send As alias for the Growth mailbox; the connected Workspace
 * account itself, arbitrary mailboxes, and any client-supplied address
 * are always rejected.
 */
export function validateGmailConnectorSender(sender) {
  if (typeof sender !== 'string'
    || sender.trim().toLowerCase() !== GMAIL_SENDER_IDENTITY) {
    return connectorReject('GMAIL_SENDER_IDENTITY_REJECTED',
      'The only permitted sender is the fixed server-controlled EXECLEAD.AI Growth mailbox alias.');
  }
  return { ok: true, sender_identity: GMAIL_SENDER_IDENTITY };
}

/**
 * Client-directive enforcement. No caller may supply a sender, mailbox,
 * Gmail account, recipient, provider identity, destination, or arbitrary
 * Gmail API parameters — every such field is rejected before any
 * credential work begins.
 */
export function validateNoClientConnectorDirective(input) {
  if (!isPlainObject(input)) {
    return connectorReject('GMAIL_CONNECTOR_DIRECTIVE_INVALID',
      'The connector-token request must be a plain object.');
  }
  for (const key of Object.keys(input)) {
    if (GMAIL_CONNECTOR_CLIENT_DIRECTIVE_FIELDS.includes(key)) {
      return connectorReject('GMAIL_CONNECTOR_DIRECTIVE_REJECTED',
        'Client-supplied sender, mailbox, account, recipient, provider identity, destination, or Gmail API parameter fields are never accepted.');
    }
  }
  return { ok: true };
}

/**
 * Truthful sanitized connector status — never carries the connector token,
 * only configuration state. Safe for any diagnostic surface.
 */
export function getGmailConnectorCredentialStatus(gatewaySnapshot) {
  const base = {
    provider: GMAIL_CONNECTOR_PROVIDER_ID,
    provider_version: GMAIL_CONNECTOR_PROVIDER_VERSION,
    architecture: GMAIL_CONNECTOR_ARCHITECTURE,
    connector_type: GMAIL_CONNECTOR_INTEGRATION_TYPE,
    expected_identity: GMAIL_CONNECTOR_EXPECTED_IDENTITY,
    sender_identity: GMAIL_SENDER_IDENTITY,
    required_scope: GMAIL_CONNECTOR_REQUIRED_SCOPE,
    delivery_enabled: false,
    token_in_status: 'none — status never carries the connector token',
    never_surfaces: GMAIL_CONNECTOR_TOKEN_NEVER_SURFACES,
  };
  if (!isPlainObject(gatewaySnapshot)) {
    return deepFreeze({
      ...base,
      configured: false,
      connected: false,
      missing_requirements: ['gmail_connector_connection'],
      error_code: 'GMAIL_CONNECTOR_UNAVAILABLE',
    });
  }
  const missing = [];
  let errorCode = null;
  if (gatewaySnapshot.connector_available !== true) {
    missing.push('gmail_connector_connection');
    errorCode = 'GMAIL_CONNECTOR_UNAVAILABLE';
  }
  const identityCheck = validateGmailConnectorIdentity(gatewaySnapshot.connected_identity);
  if (!identityCheck.ok) {
    missing.push('connected_identity');
    if (errorCode === null) errorCode = identityCheck.error_code;
  }
  const scopeCheck = validateGmailConnectorScopes(gatewaySnapshot.granted_scopes);
  if (!scopeCheck.ok) {
    missing.push('gmail_send_scope');
    if (errorCode === null) errorCode = scopeCheck.error_code;
  }
  const tokenPresent = typeof gatewaySnapshot.connector_token === 'string'
    && gatewaySnapshot.connector_token.length > 0;
  const retrievalOk = gatewaySnapshot.retrieval_status === 'ok' && tokenPresent;
  if (!retrievalOk) {
    missing.push('connector_token');
    if (errorCode === null) errorCode = 'GMAIL_CONNECTOR_TOKEN_RETRIEVAL_FAILED';
  }
  const connected = missing.length === 0;
  return deepFreeze({
    ...base,
    configured: connected,
    connected,
    missing_requirements: missing,
    error_code: connected ? null : errorCode,
  });
}

/**
 * THE ONLY connector-token surface — server-side acquisition for the
 * governed Google Workspace Gmail connector path. Enforces the browser
 * guard, the fixed sender identity, and the strictly allow-listed server
 * gateway snapshot; revalidates availability, connected identity, granted
 * scope, and token presence; and fails closed with a deterministic error
 * that never carries token material. The returned context is frozen and is
 * intended exclusively for trusted server consumers — it must never be
 * persisted, logged, returned to a client, or shown to an agent.
 */
export function acquireGmailConnectorTokenContext(options, gatewaySnapshot) {
  const guard = gmailConnectorServerOnlyGuard();
  if (!guard.ok) return guard;
  const opts = isPlainObject(options) ? options : {};
  for (const key of Object.keys(opts)) {
    if (GMAIL_CONNECTOR_INJECTION_FIELDS.includes(key)) {
      return connectorReject('GMAIL_CONNECTOR_INJECTION_REJECTED',
        'Credential-like option fields are never accepted from any caller — the connector token is resolved exclusively by the Base44-managed Gmail OAuth connector on the server side.');
    }
    if (!GMAIL_CONNECTOR_OPTION_FIELDS.includes(key)) {
      return connectorReject('GMAIL_CONNECTOR_OPTION_FIELD_REJECTED',
        'The connector-token acquisition request accepts only the fixed sender identity preference.');
    }
  }
  const senderCheck = validateGmailConnectorSender(
    opts.requested_sender === undefined ? GMAIL_SENDER_IDENTITY : opts.requested_sender,
  );
  if (!senderCheck.ok) return senderCheck;
  if (!isPlainObject(gatewaySnapshot)) {
    return connectorReject('GMAIL_CONNECTOR_UNAVAILABLE',
      'No sanitized server gateway snapshot was supplied — the Base44-managed Gmail OAuth connector is the only credential source and the boundary fails closed.');
  }
  for (const key of Object.keys(gatewaySnapshot)) {
    if (!GMAIL_CONNECTOR_GATEWAY_FIELDS.includes(key)) {
      return connectorReject('GMAIL_CONNECTOR_GATEWAY_FIELD_REJECTED',
        'The server gateway snapshot carries a field outside the connector contract — the boundary fails closed.');
    }
  }
  if (gatewaySnapshot.connector_available !== true) {
    return connectorReject('GMAIL_CONNECTOR_UNAVAILABLE',
      'The Base44-managed Gmail OAuth connector is not available — the boundary fails closed and no credential is fabricated or exposed.');
  }
  if (gatewaySnapshot.retrieval_status !== 'ok'
    || typeof gatewaySnapshot.connector_token !== 'string'
    || gatewaySnapshot.connector_token.length === 0) {
    return connectorReject('GMAIL_CONNECTOR_TOKEN_RETRIEVAL_FAILED',
      'The server-side Gmail connector token could not be retrieved — no token is fabricated, defaulted, or exposed.');
  }
  const identityCheck = validateGmailConnectorIdentity(gatewaySnapshot.connected_identity);
  if (!identityCheck.ok) return identityCheck;
  const scopeCheck = validateGmailConnectorScopes(gatewaySnapshot.granted_scopes);
  if (!scopeCheck.ok) return scopeCheck;
  return deepFreeze({
    ok: true,
    provider: GMAIL_CONNECTOR_PROVIDER_ID,
    provider_version: GMAIL_CONNECTOR_PROVIDER_VERSION,
    architecture: GMAIL_CONNECTOR_ARCHITECTURE,
    connector_type: GMAIL_CONNECTOR_INTEGRATION_TYPE,
    connected_identity: GMAIL_CONNECTOR_EXPECTED_IDENTITY,
    sender_identity: GMAIL_SENDER_IDENTITY,
    scope: GMAIL_CONNECTOR_REQUIRED_SCOPE,
    granted_scopes: scopeCheck.granted_scopes,
    connector_token: gatewaySnapshot.connector_token,
    usage: 'server_side_only — the sole permitted consumer is the governed Google Workspace Gmail connector authentication path inside trusted server code',
    never_frontend: true,
    never_persisted: true,
    never_logged: true,
    never_agent_visible: true,
    network_calls: 0,
  });
}
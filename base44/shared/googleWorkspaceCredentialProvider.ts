/**
 * Google Workspace Gmail Credential Provider — Phase 14B server-only
 * credential boundary for the EXECLEAD.AI Growth mailbox provider.
 * ============================================================
 * SINGLE PURPOSE: resolve the minimum Google provider credential
 * material for the Google Workspace Gmail connector, exclusively inside
 * trusted server/backend code, from the platform-managed server-side
 * secret mechanism. Nothing else.
 *
 * AUTHORIZED ARCHITECTURE (already authorized by the platform operator):
 * - Google Cloud project: EXECLEADAI Workforce
 * - Service account: execlead-growth-mailer (client id 108668369512220543662)
 * - Google Workspace Domain-wide Delegation is authorized.
 * - The ONLY authorized scope: the fixed gmail.send scope (never broadened).
 * - The ONLY delegated subject mailbox: growth@execleadai.co
 *
 * CREDENTIAL MECHANISM (no secret value is ever created, fabricated,
 * hardcoded, or exposed by this module):
 * - The client email and private key material are resolved exclusively
 *   from the platform server-side secret references
 *   GOOGLE_GMAIL_SA_CLIENT_EMAIL and GOOGLE_GMAIL_SA_PRIVATE_KEY, which
 *   exist only in the server runtime.
 * - Until the operator supplies those secrets, every acquisition fails
 *   closed with a deterministic configuration error. No fallback, no
 *   default, no placeholder, no partial credential exists.
 *
 * ISOLATION GUARANTEES (enforced and test-verified):
 * - Server-only: a browser runtime is structurally refused, and this
 *   module is never imported by frontend code.
 * - The ONLY surface that can carry credential material is
 *   acquireGmailProviderCredentialContext, which returns a frozen
 *   server-side context to trusted server callers. No status, error
 *   message, log, or diagnostic ever carries a credential value.
 * - Credential material is never persisted to any application entity,
 *   never stored in browser storage, never written to telemetry or usage
 *   logs, never placed in prompts or LLM context, never shown to an agent
 *   or client, and never included in execution or approval metadata,
 *   delivery audits, or error messages.
 * - The Growth Agent can never receive provider credentials: agents and
 *   clients can never invoke this boundary (no frontend import, no client
 *   entry point, and the browser runtime guard).
 * - No token is minted, exchanged, cached, or refreshed in this phase —
 *   token acquisition belongs to a future separately approved activation.
 *   This module performs NO network access and NO Google API call.
 *
 * This module is pure: no imports, no database access, no entity writes,
 * no network calls, no logging, no LLM. It is written in plain JS syntax
 * so the exact shipped file can be executed by the deterministic test
 * suite.
 */

export const GMAIL_CREDENTIAL_PROVIDER_ID = 'google_workspace_gmail_credential_provider';
export const GMAIL_CREDENTIAL_PROVIDER_VERSION = '1.0.0';
export const GMAIL_CREDENTIAL_ARCHITECTURE = 'GOOGLE_SERVICE_ACCOUNT_DOMAIN_WIDE_DELEGATION';
export const GMAIL_SA_CLOUD_PROJECT = 'EXECLEADAI Workforce';
export const GMAIL_SA_NAME = 'execlead-growth-mailer';
export const GMAIL_SA_CLIENT_ID = '108668369512220543662';
export const GMAIL_DELEGATED_SUBJECT = 'growth@execleadai.co';
export const GMAIL_AUTHORIZED_SCOPE = 'https://www.googleapis.com/auth/gmail.send';
export const GMAIL_AUTHORIZED_SCOPES = [GMAIL_AUTHORIZED_SCOPE];
export const GMAIL_FORBIDDEN_SCOPE_EXAMPLES = [
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/gmail.insert',
  'https://www.googleapis.com/auth/gmail.labels',
  'https://mail.google.com/',
];
export const GMAIL_CREDENTIAL_SECRET_REFERENCES = {
  client_email: 'GOOGLE_GMAIL_SA_CLIENT_EMAIL',
  private_key: 'GOOGLE_GMAIL_SA_PRIVATE_KEY',
};
export const GMAIL_CREDENTIAL_NEVER_SURFACES = [
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
export const GMAIL_CREDENTIAL_BOUNDARY_CONTRACT_MARKERS = [
  'GMAIL_CREDENTIAL_PROVIDER_ID',
  'GMAIL_DELEGATED_SUBJECT',
  'GMAIL_AUTHORIZED_SCOPE',
  'GMAIL_AUTHORIZED_SCOPES',
  'validateGmailScope',
  'validateGmailDelegatedSubject',
  'getGmailCredentialStatus',
  'acquireGmailProviderCredentialContext',
];

const GMAIL_CREDENTIAL_OPTION_FIELDS = ['requested_subject', 'requested_scope'];
const GMAIL_CREDENTIAL_INJECTION_FIELDS = [
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
const SA_EMAIL_RE = /^[A-Za-z0-9._-]+@[A-Za-z0-9._-]+\.iam\.gserviceaccount\.com$/;

function credReject(errorCode, error) {
  return { ok: false, error_code: errorCode, error: error };
}

function deepFreeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const key of Object.keys(value)) deepFreeze(value[key]);
  }
  return value;
}

/**
 * Server-only runtime guard. A browser runtime is structurally refused:
 * the credential provider can never execute or expose material in the
 * browser, even if the module were ever bundled into frontend code.
 */
export function gmailCredentialServerOnlyGuard(sandbox) {
  const s = (sandbox === null || sandbox === undefined)
    ? (typeof globalThis !== 'undefined' ? globalThis : {})
    : sandbox;
  if (typeof s.window !== 'undefined' || typeof s.document !== 'undefined') {
    return credReject('GMAIL_CREDENTIAL_PROVIDER_SERVER_ONLY',
      'The Google Gmail credential provider executes only in trusted server code — a browser runtime can never obtain provider credential material.');
  }
  return { ok: true };
}

/**
 * Scope enforcement. The only authorized scope is the fixed gmail.send
 * scope; broader scopes, read scopes, compose scopes, full-access scopes,
 * and multi-scope requests are always rejected.
 */
export function validateGmailScope(scope) {
  if (typeof scope !== 'string' || scope.trim() !== GMAIL_AUTHORIZED_SCOPE) {
    return credReject('GMAIL_SCOPE_REJECTED',
      'The only authorized Google Workspace Gmail scope is the fixed server-side gmail.send scope — broader or additional scopes are never permitted.');
  }
  return { ok: true, scope: GMAIL_AUTHORIZED_SCOPE };
}

/**
 * Delegated identity enforcement. The only permitted delegated subject is
 * the fixed EXECLEAD.AI Growth mailbox; arbitrary mailboxes, personal
 * addresses, and other Workspace identities are always rejected.
 */
export function validateGmailDelegatedSubject(subject) {
  if (typeof subject !== 'string' || subject.trim().toLowerCase() !== GMAIL_DELEGATED_SUBJECT) {
    return credReject('GMAIL_DELEGATED_SUBJECT_REJECTED',
      'The only permitted delegated subject mailbox is the fixed server-side EXECLEAD.AI Growth mailbox.');
  }
  return { ok: true, delegated_subject: GMAIL_DELEGATED_SUBJECT };
}

/**
 * Server-runtime secret resolution. Literal secret-name lookups only —
 * no wholesale environment access, no dynamic keys. When the runtime has
 * no secret mechanism at all, the snapshot is empty and every acquisition
 * fails closed.
 */
function defaultCredentialEnvSnapshot() {
  if (typeof process === 'undefined' || !process.env) return {};
  return {
    GOOGLE_GMAIL_SA_CLIENT_EMAIL: (typeof process.env.GOOGLE_GMAIL_SA_CLIENT_EMAIL === 'string')
      ? process.env.GOOGLE_GMAIL_SA_CLIENT_EMAIL
      : null,
    GOOGLE_GMAIL_SA_PRIVATE_KEY: (typeof process.env.GOOGLE_GMAIL_SA_PRIVATE_KEY === 'string')
      ? process.env.GOOGLE_GMAIL_SA_PRIVATE_KEY
      : null,
  };
}

function missingCredentialSecretReferences(env) {
  const missing = [];
  if (!env || typeof env.GOOGLE_GMAIL_SA_CLIENT_EMAIL !== 'string' || env.GOOGLE_GMAIL_SA_CLIENT_EMAIL.trim() === '') {
    missing.push(GMAIL_CREDENTIAL_SECRET_REFERENCES.client_email);
  }
  if (!env || typeof env.GOOGLE_GMAIL_SA_PRIVATE_KEY !== 'string' || env.GOOGLE_GMAIL_SA_PRIVATE_KEY.trim() === '') {
    missing.push(GMAIL_CREDENTIAL_SECRET_REFERENCES.private_key);
  }
  return missing;
}

/**
 * Truthful credential status — never carries credential values, only the
 * secret reference NAMES that are missing. Safe for any diagnostic
 * surface.
 */
export function getGmailCredentialStatus(envSnapshot) {
  const env = (envSnapshot !== null && typeof envSnapshot === 'object' && !Array.isArray(envSnapshot))
    ? envSnapshot
    : defaultCredentialEnvSnapshot();
  const missing = missingCredentialSecretReferences(env);
  return deepFreeze({
    provider: GMAIL_CREDENTIAL_PROVIDER_ID,
    version: GMAIL_CREDENTIAL_PROVIDER_VERSION,
    architecture: GMAIL_CREDENTIAL_ARCHITECTURE,
    google_cloud_project: GMAIL_SA_CLOUD_PROJECT,
    service_account_name: GMAIL_SA_NAME,
    service_account_client_id: GMAIL_SA_CLIENT_ID,
    delegated_subject: GMAIL_DELEGATED_SUBJECT,
    authorized_scope: GMAIL_AUTHORIZED_SCOPE,
    authorized_scope_count: 1,
    configured: missing.length === 0,
    connected: false,
    authenticated: false,
    delivery_enabled: false,
    missing_secret_references: missing,
    credential_material_in_status: 'none — status carries only secret reference names, never values',
    never_surfaces: GMAIL_CREDENTIAL_NEVER_SURFACES,
  });
}

/**
 * THE ONLY credential-material surface — server-side acquisition for the
 * governed Google Workspace Gmail connector path. Enforces the browser
 * guard, the exact delegated subject, and the exact authorized scope;
 * resolves material ONLY from the server-side secret mechanism; and
 * fails closed with a deterministic configuration error when the
 * required material is unavailable. The returned context is frozen and
 * is intended exclusively for trusted server consumers — it must never
 * be persisted, logged, returned to a client, or shown to an agent.
 */
export function acquireGmailProviderCredentialContext(options, envSnapshot) {
  const guard = gmailCredentialServerOnlyGuard();
  if (!guard.ok) return guard;
  const opts = (options === null || typeof options !== 'object' || Array.isArray(options)) ? {} : options;
  for (const key of Object.keys(opts)) {
    if (GMAIL_CREDENTIAL_INJECTION_FIELDS.includes(key)) {
      return credReject('GMAIL_CREDENTIAL_INJECTION_REJECTED',
        'Credential-like option fields are never accepted from any caller — material is resolved exclusively from the server-side secret mechanism.');
    }
    if (!GMAIL_CREDENTIAL_OPTION_FIELDS.includes(key)) {
      return credReject('GMAIL_CREDENTIAL_OPTION_FIELD_REJECTED',
        'The credential acquisition request accepts only the delegated subject and scope preferences.');
    }
  }
  const subjectCheck = validateGmailDelegatedSubject(
    opts.requested_subject === undefined ? GMAIL_DELEGATED_SUBJECT : opts.requested_subject,
  );
  if (!subjectCheck.ok) return subjectCheck;
  const scopeCheck = validateGmailScope(
    opts.requested_scope === undefined ? GMAIL_AUTHORIZED_SCOPE : opts.requested_scope,
  );
  if (!scopeCheck.ok) return scopeCheck;
  const env = (envSnapshot !== null && typeof envSnapshot === 'object' && !Array.isArray(envSnapshot))
    ? envSnapshot
    : defaultCredentialEnvSnapshot();
  const missing = missingCredentialSecretReferences(env);
  if (missing.length > 0) {
    return credReject('GMAIL_CREDENTIALS_NOT_CONFIGURED',
      'Google Workspace Gmail provider credential material is not configured. Missing server-side secret references: '
        + missing.join(', ')
        + '. The credential boundary fails closed — no credential is fabricated, defaulted, or exposed, and the provider remains not connected.');
  }
  const clientEmail = env.GOOGLE_GMAIL_SA_CLIENT_EMAIL.trim();
  if (!SA_EMAIL_RE.test(clientEmail)) {
    return credReject('GMAIL_CREDENTIAL_CONFIG_INVALID',
      'The configured server-side client identity does not match the required Google service account identity format — no credential is exposed.');
  }
  const privateKey = env.GOOGLE_GMAIL_SA_PRIVATE_KEY.replace(/\s+$/, '');
  if (privateKey.indexOf('-----BEGIN PRIVATE KEY-----') !== 0
    || privateKey.indexOf('-----END PRIVATE KEY-----') < 0) {
    return credReject('GMAIL_CREDENTIAL_CONFIG_INVALID',
      'The configured server-side private key material does not match the required format — no credential is exposed.');
  }
  return deepFreeze({
    provider: GMAIL_CREDENTIAL_PROVIDER_ID,
    provider_version: GMAIL_CREDENTIAL_PROVIDER_VERSION,
    architecture: GMAIL_CREDENTIAL_ARCHITECTURE,
    google_cloud_project: GMAIL_SA_CLOUD_PROJECT,
    client_id: GMAIL_SA_CLIENT_ID,
    client_email: clientEmail,
    private_key: privateKey,
    delegated_subject: GMAIL_DELEGATED_SUBJECT,
    scope: GMAIL_AUTHORIZED_SCOPE,
    scopes: [GMAIL_AUTHORIZED_SCOPE],
    usage: 'server_side_only — the sole permitted consumer is the governed Google Workspace Gmail connector authentication path inside trusted server code',
    never_frontend: true,
    never_persisted: true,
    never_logged: true,
    never_agent_visible: true,
    token_minting: 'not implemented in this phase — no token is created, exchanged, cached, or refreshed',
    network_calls: 0,
  });
}
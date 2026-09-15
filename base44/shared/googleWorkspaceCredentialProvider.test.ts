/**
 * Google Workspace Gmail Credential Provider — Phase 14B deterministic
 * credential-isolation test suite. Runs under Deno (registered) or plain
 * Node (sequential) with no external dependencies. Verifies:
 * - the provider exists only in the server-side/backend path;
 * - no frontend import/reference to the credential provider exists;
 * - no credential material can reach AgentExecution, AgentApproval, the
 *   connector registry, Prospect records, delivery audits, prompts/LLM
 *   context, telemetry/usage logs, or error output;
 * - missing credentials fail closed with a deterministic error;
 * - the delegated subject is exactly growth@execleadai.co;
 * - the authorized scope is exactly the gmail.send scope;
 * - broader Gmail scopes are rejected;
 * - a browser/client can never obtain provider credentials;
 * - real Gmail delivery remains disabled;
 * - sandbox delivery remains unchanged.
 */

import {
  GMAIL_CREDENTIAL_PROVIDER_ID,
  GMAIL_CREDENTIAL_PROVIDER_VERSION,
  GMAIL_CREDENTIAL_ARCHITECTURE,
  GMAIL_SA_CLOUD_PROJECT,
  GMAIL_SA_NAME,
  GMAIL_SA_CLIENT_ID,
  GMAIL_DELEGATED_SUBJECT,
  GMAIL_AUTHORIZED_SCOPE,
  GMAIL_AUTHORIZED_SCOPES,
  GMAIL_FORBIDDEN_SCOPE_EXAMPLES,
  GMAIL_CREDENTIAL_SECRET_REFERENCES,
  GMAIL_CREDENTIAL_NEVER_SURFACES,
  GMAIL_CREDENTIAL_BOUNDARY_CONTRACT_MARKERS,
  gmailCredentialServerOnlyGuard,
  validateGmailScope,
  validateGmailDelegatedSubject,
  getGmailCredentialStatus,
  acquireGmailProviderCredentialContext,
} from './googleWorkspaceCredentialProvider.ts';
import {
  GMAIL_REGISTRY_SEED,
  GMAIL_DELIVERY_IDENTITY,
  GMAIL_CREDENTIAL_BOUNDARY_PROVIDER_ID,
  GMAIL_CREDENTIAL_BOUNDARY_MARKERS,
  EXECUTE_OUTREACH_TOOL_EXPECTED_STATE,
  gmailGetCapabilities,
  gmailKillSwitchState,
  gmailDeliver,
  gmailRequestProviderAuthentication,
  buildGmailAuditRecord,
} from './googleWorkspaceGmailConnector.ts';
import {
  CONNECTOR_REGISTRY_SEED,
  DELIVERY_CONNECTOR_ID,
  DELIVERY_CONNECTOR_TYPE,
  createGovernedDeliveryRequest,
  buildSandboxDestination,
} from './sandboxDeliveryConnector.ts';

const tests = [];
function test(name, fn) { tests.push({ name, fn }); }
function assertEquals(a, b, msg) { if (a !== b) throw new Error(`${msg || 'assertion failed'} — expected "${b}", got "${a}"`); }
function assertTrue(v, msg) { if (v !== true) throw new Error(msg || 'expected true'); }
function assertFalse(v, msg) { if (v !== false) throw new Error(msg || 'expected false'); }
function assertRejected(r, code) {
  if (!r || r.ok !== false) throw new Error(`expected rejection, got ok result: ${JSON.stringify(r).substring(0, 200)}`);
  if (code && r.error_code !== code) throw new Error(`expected error_code ${code}, got ${r.error_code}`);
}

// --- Fixtures: synthetic test shapes only — never real credentials ------
const FAKE_SA_EMAIL = 'execlead-growth-mailer@execleadai-workforce-test.iam.gserviceaccount.com';
const FAKE_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\nMIIFAKEYMATERIALFORTESHAPEVALIDATIONONLYTHISISNOTACREDENTIAL'
  + '0123456789abcdef'.repeat(12) + '\n-----END PRIVATE KEY-----\n';
const FAKE_ENV = { GOOGLE_GMAIL_SA_CLIENT_EMAIL: FAKE_SA_EMAIL, GOOGLE_GMAIL_SA_PRIVATE_KEY: FAKE_PRIVATE_KEY };

const PROSPECT_ID = '11111111-2222-3333-4444-555555555555';
const APPROVAL_ID = 'aaaa1111-bbbb-2222-cccc-3333dddd4444';
const EXECUTION_ID = 'eeee5555-ffff-6666-7777-88889999aaaa';
const CORRELATION_ID = 'wf:test:growth_agent:execute_prospect_outreach:abc12345';
const DRAFT_HASH = '0123456789abcdef';

function buildValidRequest() {
  const res = createGovernedDeliveryRequest({
    prospect_id: PROSPECT_ID,
    channel: 'EMAIL',
    approved_draft_hash: DRAFT_HASH,
    approval_id: APPROVAL_ID,
    execution_id: EXECUTION_ID,
    correlation_id: CORRELATION_ID,
    destination: buildSandboxDestination('EMAIL'),
    message: {
      approved_draft_hash: DRAFT_HASH,
      content_binding: 'APPROVED_DRAFT_HASH',
      subject: 'Approved subject',
      body: 'Approved body',
    },
  }, { authorization_verified: true });
  if (!res.ok) throw new Error('fixture build failed: ' + res.error);
  return res.request;
}

function authorizedContext(request) {
  return {
    authorization_verified: true,
    expected: {
      approval_id: APPROVAL_ID,
      execution_id: EXECUTION_ID,
      correlation_id: CORRELATION_ID,
      prospect_id: PROSPECT_ID,
      channel: 'EMAIL',
      approved_draft_hash: DRAFT_HASH,
      delivery_identity: request.delivery_identity,
    },
  };
}

const providerBoundary = {
  GMAIL_CREDENTIAL_PROVIDER_ID,
  GMAIL_DELEGATED_SUBJECT,
  GMAIL_AUTHORIZED_SCOPE,
  GMAIL_AUTHORIZED_SCOPES,
  validateGmailScope,
  validateGmailDelegatedSubject,
  getGmailCredentialStatus,
  acquireGmailProviderCredentialContext,
};

const configuredProviderBoundary = {
  ...providerBoundary,
  getGmailCredentialStatus: () => getGmailCredentialStatus(FAKE_ENV),
  acquireGmailProviderCredentialContext: (options) => acquireGmailProviderCredentialContext(options, FAKE_ENV),
};

// --- Source access -------------------------------------------------------
function readTextByPath(p) {
  if (typeof Deno !== 'undefined' && typeof Deno.readTextFileSync === 'function') {
    return Deno.readTextFileSync(p);
  }
  if (typeof __readFileSync === 'function') return __readFileSync(p, 'utf8');
  throw new Error(`no source reader available for ${p} — cannot verify credential isolation (fail closed)`);
}

function executableLines(src) {
  return src.split('\n').map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('*') && !l.startsWith('/*') && !l.startsWith('//'));
}

function isDocArrayItem(line) { return /^'[^']*',$/.test(line); }

function frontendScan(dir, patterns) {
  if (typeof __scanDirFor === 'function') return __scanDirFor(dir, patterns);
  if (typeof Deno !== 'undefined') {
    const results = { files_scanned: 0, matches: [] };
    const walk = (d) => {
      for (const entry of Deno.readDirSync(d)) {
        const p = d + '/' + entry.name;
        if (entry.isDirectory()) walk(p);
        else if (/\.(js|jsx|ts|tsx)$/.test(p)) {
          results.files_scanned++;
          const src = Deno.readTextFileSync(p);
          for (const pattern of patterns) {
            if (src.includes(pattern)) results.matches.push({ f: p, pattern });
          }
        }
      }
    };
    walk(dir);
    return results;
  }
  throw new Error('no directory scan mechanism available — cannot verify frontend credential isolation (fail closed)');
}

const CREDENTIAL_ISOLATION_PATTERNS = [
  'googleWorkspaceCredentialProvider',
  'GOOGLE_GMAIL_SA_PRIVATE_KEY',
  'GOOGLE_GMAIL_SA_CLIENT_EMAIL',
  'gmailRequestProviderAuthentication',
];

// --- E.1 Provider exists only in the server-side/backend path ------------
test('provider module identity is the server-only boundary', () => {
  assertEquals(GMAIL_CREDENTIAL_PROVIDER_ID, 'google_workspace_gmail_credential_provider', 'provider id');
  assertEquals(GMAIL_CREDENTIAL_PROVIDER_VERSION, '1.0.0', 'provider version');
  assertEquals(GMAIL_CREDENTIAL_ARCHITECTURE, 'GOOGLE_SERVICE_ACCOUNT_DOMAIN_WIDE_DELEGATION', 'architecture');
  assertEquals(GMAIL_SA_CLOUD_PROJECT, 'EXECLEADAI Workforce', 'cloud project');
  assertEquals(GMAIL_SA_NAME, 'execlead-growth-mailer', 'service account name');
  assertEquals(GMAIL_SA_CLIENT_ID, '108668369512220543662', 'service account client id');
});

test('provider module has zero imports and no frontend contract', async () => {
  const src = readTextByPath('base44/shared/googleWorkspaceCredentialProvider.ts');
  assertFalse(/^\s*import\b/m.test(src), 'the provider module must have zero imports');
  const lines = executableLines(src);
  for (const line of lines) {
    if (/localStorage|sessionStorage|indexedDB|document\.|window\.|setItem\(|export default/.test(line)) {
      throw new Error('browser surface found in provider code: ' + line.substring(0, 120));
    }
  }
});

// --- E.2 No frontend import/reference to the credential provider ---------
test('no frontend file imports or references the credential provider', () => {
  const scan = frontendScan('src', CREDENTIAL_ISOLATION_PATTERNS);
  if (scan.files_scanned < 300) throw new Error(`frontend scan suspiciously small (${scan.files_scanned} files) — fail closed`);
  if (scan.matches.length > 0) throw new Error('frontend credential reference found: ' + JSON.stringify(scan.matches[0]));
  assertTrue(true, `no frontend references across ${scan.files_scanned} files`);
});

test('no backend function currently invokes the credential provider (no server caller exists yet)', () => {
  const scan = frontendScan('base44/functions', CREDENTIAL_ISOLATION_PATTERNS);
  if (scan.files_scanned < 60) throw new Error(`functions scan suspiciously small (${scan.files_scanned} files) — fail closed`);
  if (scan.matches.length > 0) throw new Error('unexpected credential provider invocation in a function: ' + JSON.stringify(scan.matches[0]));
  assertTrue(true, 'no server caller — the connector receives the boundary only from trusted server code');
});

test('the Agent Orchestration Core and service router reference no credential boundary', () => {
  const core = readTextByPath('base44/shared/agentOrchestrationCore.ts');
  const service = readTextByPath('base44/functions/agentOrchestrationService/entry.ts');
  for (const src of [core, service]) {
    for (const pattern of CREDENTIAL_ISOLATION_PATTERNS) {
      if (src.includes(pattern)) throw new Error(`credential boundary reference "${pattern}" found in frozen orchestration code`);
    }
  }
});

// --- E.10 / E.14 Missing credentials fail closed; browser is refused ------
test('missing credentials fail closed with a deterministic configuration error', () => {
  const status = getGmailCredentialStatus({});
  assertFalse(status.configured, 'status not configured');
  assertEquals(status.connected, false, 'not connected');
  assertEquals(status.authenticated, false, 'not authenticated');
  assertEquals(status.delivery_enabled, false, 'delivery disabled');
  assertEquals(status.missing_secret_references.length, 2, 'both secret references missing');
  assertEquals(status.missing_secret_references[0], 'GOOGLE_GMAIL_SA_CLIENT_EMAIL', 'client email secret name');
  assertEquals(status.missing_secret_references[1], 'GOOGLE_GMAIL_SA_PRIVATE_KEY', 'private key secret name');
  const acquired = acquireGmailProviderCredentialContext({}, {});
  assertRejected(acquired, 'GMAIL_CREDENTIALS_NOT_CONFIGURED');
  assertTrue(acquired.error.includes('GOOGLE_GMAIL_SA_PRIVATE_KEY'), 'deterministic error names the missing secret reference');
});

test('fail-closed error message carries no credential value', () => {
  const partial = { GOOGLE_GMAIL_SA_CLIENT_EMAIL: FAKE_SA_EMAIL };
  const acquired = acquireGmailProviderCredentialContext({}, partial);
  assertRejected(acquired, 'GMAIL_CREDENTIALS_NOT_CONFIGURED');
  assertTrue(acquired.error.includes('GOOGLE_GMAIL_SA_PRIVATE_KEY'), 'names only the missing reference');
  if (acquired.error.includes(FAKE_SA_EMAIL)) throw new Error('error message leaked a configured credential value');
  assertTrue(true, 'error carries secret reference names only');
});

test('a browser runtime is structurally refused (server-only guard)', () => {
  assertRejected(gmailCredentialServerOnlyGuard({ window: {} }), 'GMAIL_CREDENTIAL_PROVIDER_SERVER_ONLY');
  assertRejected(gmailCredentialServerOnlyGuard({ document: {} }), 'GMAIL_CREDENTIAL_PROVIDER_SERVER_ONLY');
  assertEquals(gmailCredentialServerOnlyGuard({}).ok, true, 'non-browser sandbox passes');
});

// --- E.11 Delegated identity enforcement ---------------------------------
test('the delegated subject is exactly growth@execleadai.co', () => {
  assertEquals(GMAIL_DELEGATED_SUBJECT, 'growth@execleadai.co', 'delegated subject');
  assertEquals(validateGmailDelegatedSubject('growth@execleadai.co').ok, true, 'exact subject validates');
});

test('any other delegated subject is rejected', () => {
  assertRejected(validateGmailDelegatedSubject('ray@execleadai.co'), 'GMAIL_DELEGATED_SUBJECT_REJECTED');
  assertRejected(validateGmailDelegatedSubject('growth@execleadai.com'), 'GMAIL_DELEGATED_SUBJECT_REJECTED');
  assertRejected(validateGmailDelegatedSubject('workspace-admin@execleadai.co'), 'GMAIL_DELEGATED_SUBJECT_REJECTED');
  assertRejected(validateGmailDelegatedSubject('somebody@example.com'), 'GMAIL_DELEGATED_SUBJECT_REJECTED');
  assertRejected(validateGmailDelegatedSubject(null), 'GMAIL_DELEGATED_SUBJECT_REJECTED');
});

test('acquisition rejects a non-authorized delegated subject even when configured', () => {
  const acquired = acquireGmailProviderCredentialContext({ requested_subject: 'ray@execleadai.co' }, FAKE_ENV);
  assertRejected(acquired, 'GMAIL_DELEGATED_SUBJECT_REJECTED');
});

// --- E.12 / E.13 Scope enforcement ----------------------------------------
test('the authorized scope is exactly the gmail.send scope', () => {
  assertEquals(GMAIL_AUTHORIZED_SCOPE, 'https://www.googleapis.com/auth/gmail.send', 'authorized scope');
  assertEquals(GMAIL_AUTHORIZED_SCOPES.length, 1, 'exactly one authorized scope');
  assertEquals(GMAIL_AUTHORIZED_SCOPES[0], GMAIL_AUTHORIZED_SCOPE, 'no scope set broadening');
  assertEquals(validateGmailScope(GMAIL_AUTHORIZED_SCOPE).ok, true, 'exact scope validates');
});

test('broader Gmail scopes are rejected', () => {
  for (const bad of GMAIL_FORBIDDEN_SCOPE_EXAMPLES) {
    assertRejected(validateGmailScope(bad), 'GMAIL_SCOPE_REJECTED');
  }
  assertRejected(validateGmailScope('https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.readonly'), 'GMAIL_SCOPE_REJECTED');
  assertRejected(validateGmailScope(''), 'GMAIL_SCOPE_REJECTED');
  assertRejected(validateGmailScope(null), 'GMAIL_SCOPE_REJECTED');
  assertIncludesAll(GMAIL_FORBIDDEN_SCOPE_EXAMPLES, ['gmail.modify', 'gmail.readonly', 'mail.google.com']);
});

function assertIncludesAll(arr, needles) {
  for (const n of needles) {
    if (!arr.some((x) => x.includes(n))) throw new Error(`forbidden-scope guard missing "${n}"`);
  }
}

test('acquisition rejects a broadened scope even when configured', () => {
  const acquired = acquireGmailProviderCredentialContext(
    { requested_scope: 'https://www.googleapis.com/auth/gmail.modify' }, FAKE_ENV,
  );
  assertRejected(acquired, 'GMAIL_SCOPE_REJECTED');
});

// --- Configured-path shape (synthetic fixture, never a real credential) ---
test('configured acquisition returns a frozen server-only context with exact identity and scope', () => {
  const acquired = acquireGmailProviderCredentialContext({}, FAKE_ENV);
  assertEquals(acquired.ok, true, 'configured acquisition succeeds');
  assertEquals(Object.isFrozen(acquired), true, 'context is frozen');
  assertEquals(acquired.delegated_subject, 'growth@execleadai.co', 'delegated subject');
  assertEquals(acquired.scope, GMAIL_AUTHORIZED_SCOPE, 'scope');
  assertEquals(acquired.scopes.length, 1, 'single scope');
  assertEquals(acquired.client_id, '108668369512220543662', 'client id');
  assertTrue(acquired.usage.includes('server_side_only'), 'usage is server-side only');
  assertEquals(acquired.network_calls, 0, 'no network capability');
  assertTrue(acquired.token_minting.includes('not implemented'), 'no token minting in this phase');
});

test('malformed configured material is rejected without exposure', () => {
  assertRejected(acquireGmailProviderCredentialContext({}, { GOOGLE_GMAIL_SA_CLIENT_EMAIL: 'not-a-service-account@execleadai.co', GOOGLE_GMAIL_SA_PRIVATE_KEY: FAKE_PRIVATE_KEY }), 'GMAIL_CREDENTIAL_CONFIG_INVALID');
  assertRejected(acquireGmailProviderCredentialContext({}, { GOOGLE_GMAIL_SA_CLIENT_EMAIL: FAKE_SA_EMAIL, GOOGLE_GMAIL_SA_PRIVATE_KEY: 'plain-text-not-pem' }), 'GMAIL_CREDENTIAL_CONFIG_INVALID');
});

test('credential-like or unknown acquisition options are rejected', () => {
  assertRejected(acquireGmailProviderCredentialContext({ access_token: 'x' }, {}), 'GMAIL_CREDENTIAL_INJECTION_REJECTED');
  assertRejected(acquireGmailProviderCredentialContext({ private_key: 'x' }, {}), 'GMAIL_CREDENTIAL_INJECTION_REJECTED');
  assertRejected(acquireGmailProviderCredentialContext({ unknown_field: 1 }, {}), 'GMAIL_CREDENTIAL_OPTION_FIELD_REJECTED');
});

test('credential status never carries credential material', () => {
  const status = getGmailCredentialStatus(FAKE_ENV);
  assertEquals(status.configured, true, 'configured with fixture');
  const serialized = JSON.stringify(status);
  if (serialized.includes(FAKE_SA_EMAIL)) throw new Error('status leaked the client email value');
  if (serialized.includes('MIIFAKEYMATERIAL')) throw new Error('status leaked private key material');
  if (serialized.includes('BEGIN PRIVATE KEY')) throw new Error('status leaked PEM material');
  assertTrue(true, 'status carries only secret reference names and configuration state');
});

// --- E.3/E.4/E.5/E.6/E.7/E.8/E.9 No credential material in any governed surface
test('provider source references no governed entity, LLM, prompt, or telemetry surface', () => {
  const src = readTextByPath('base44/shared/googleWorkspaceCredentialProvider.ts');
  const lines = executableLines(src);
  for (const line of lines) {
    if (isDocArrayItem(line)) continue; // never-surface policy documentation strings
    if (/AgentExecution|AgentApproval|AgentRegistry|AgentToolRegistry|ExternalDeliveryConnectorRegistry|entities\.|base44\.|asServiceRole|invokeLLM|UsageLog|TelemetryEvent|telemetry|analytics|prompt|localStorage|sessionStorage|console\.|logger|log\(|fetch\(|XMLHttpRequest|axios|WebSocket|EventSource|google-auth-library|OAuth2Client|users\.messages|messages\.send|JWT|localStorage/.test(line)) {
      throw new Error('governed-entity or leak surface found in provider code: ' + line.substring(0, 120));
    }
  }
});

test('provider source contains no credential value literal (no PEM body, no service account JSON)', () => {
  const src = readTextByPath('base44/shared/googleWorkspaceCredentialProvider.ts');
  if (/"type"\s*:/.test(src)) throw new Error('service account JSON literal found');
  const pemBlock = /-----BEGIN[^\n]*-----[\s\S]{50,}?-----END[^\n]*-----/.exec(src);
  if (pemBlock) throw new Error('embedded PEM credential body found');
  const lines = executableLines(src);
  for (const line of lines) {
    if (line.includes('googleapis') && !line.includes('GMAIL_AUTHORIZED_SCOPE') && !isDocArrayItem(line)) {
      throw new Error('provider API surface found in code: ' + line.substring(0, 120));
    }
  }
  assertTrue(true, 'no credential values, only shape validation');
});

test('connector registry seed contains no credential material', () => {
  const serialized = JSON.stringify(GMAIL_REGISTRY_SEED);
  for (const pattern of ['GOOGLE_GMAIL', 'private_key', 'access_token', 'refresh_token', 'client_secret', 'BEGIN PRIVATE']) {
    if (serialized.includes(pattern)) throw new Error(`credential material "${pattern}" found in the connector registry seed`);
  }
});

test('delivery audit structurally excludes injected credential fields', () => {
  const request = buildValidRequest();
  const result = gmailDeliver(request, authorizedContext(request));
  const audit = buildGmailAuditRecord(request, result, {
    audit_id: 'audit-1',
    timestamp: '2026-09-15T00:00:00Z',
    user_id: 'user-1',
    access_token: 'SENTINEL_AT',
    private_key: 'SENTINEL_PK',
    refresh_token: 'SENTINEL_RT',
    client_secret: 'SENTINEL_CS',
  });
  const serialized = JSON.stringify(audit);
  for (const sentinel of ['SENTINEL_AT', 'SENTINEL_PK', 'SENTINEL_RT', 'SENTINEL_CS']) {
    if (serialized.includes(sentinel)) throw new Error(`credential sentinel leaked into the delivery audit: ${sentinel}`);
  }
});

test('credential never-surfaces policy covers every prohibited surface', () => {
  const required = [
    'AgentRegistry', 'AgentToolRegistry', 'ExternalDeliveryConnectorRegistry',
    'AgentExecution', 'AgentApproval', 'Prospect', 'prompts', 'llm_context',
    'browser_local_storage', 'browser_session_storage', 'telemetry', 'UsageLog',
    'notification_records', 'delivery_audit_records', 'error_messages',
    'execution_metadata', 'execution_result_fields',
  ];
  for (const surface of required) {
    if (!GMAIL_CREDENTIAL_NEVER_SURFACES.includes(surface)) throw new Error(`missing never-surface policy: ${surface}`);
  }
});

// --- Connector additive integration (server boundary through the provider) --
test('connector and provider boundary contracts match exactly (parity)', () => {
  assertEquals(GMAIL_CREDENTIAL_BOUNDARY_MARKERS.join(','), GMAIL_CREDENTIAL_BOUNDARY_CONTRACT_MARKERS.join(','), 'marker parity');
  assertEquals(GMAIL_CREDENTIAL_BOUNDARY_PROVIDER_ID, GMAIL_CREDENTIAL_PROVIDER_ID, 'boundary identity parity');
  assertEquals(GMAIL_DELIVERY_IDENTITY, GMAIL_DELEGATED_SUBJECT, 'delegated mailbox parity between connector and provider');
});

test('connector provider-authentication is fail-closed while credentials are not configured', () => {
  const result = gmailRequestProviderAuthentication({ authorization_verified: true }, providerBoundary);
  assertEquals(result.ok, true, 'governed request handled');
  assertEquals(result.provider_authentication, 'NOT_CONFIGURED', 'fail-closed until credentials exist');
  assertEquals(result.configured, false, 'not configured');
  assertEquals(result.authenticated, false, 'not authenticated');
  assertEquals(result.connected, false, 'not connected');
  assertEquals(result.delivery_enabled, false, 'delivery disabled');
  assertEquals(result.api_status, 'GMAIL_API_NOT_CONNECTED', 'api status unchanged');
  assertEquals(result.missing_secret_references.length, 2, 'missing secret reference names reported');
  const serialized = JSON.stringify(result);
  if (serialized.includes('BEGIN PRIVATE')) throw new Error('credential material in fail-closed result');
  if (serialized.includes('gserviceaccount')) throw new Error('client identity value in fail-closed result');
});

test('connector provider-authentication never returns credential material even when configured', () => {
  const result = gmailRequestProviderAuthentication({ authorization_verified: true }, configuredProviderBoundary);
  assertEquals(result.ok, true, 'configured boundary handled');
  assertEquals(result.provider_authentication, 'SERVER_SIDE_ONLY', 'server-side only resolution');
  assertEquals(result.authenticated, true, 'authenticated server-side');
  assertEquals(result.connected, false, 'still not connected');
  assertEquals(result.delivery_enabled, false, 'delivery still disabled');
  assertEquals(result.sent, false, 'nothing sent');
  const serialized = JSON.stringify(result);
  if (serialized.includes(FAKE_SA_EMAIL)) throw new Error('client email value leaked through connector result');
  if (serialized.includes('MIIFAKEYMATERIAL')) throw new Error('private key material leaked through connector result');
  if (serialized.includes('BEGIN PRIVATE KEY')) throw new Error('PEM material leaked through connector result');
  assertTrue(true, 'the acquired context stays inside the server call');
});

test('connector provider-authentication requires an authorized server context', () => {
  assertEquals(gmailRequestProviderAuthentication(null, providerBoundary).error_code, 'GMAIL_CONTEXT_NOT_AUTHORIZED', 'null context');
  assertEquals(gmailRequestProviderAuthentication({ authorization_verified: false }, providerBoundary).error_code, 'GMAIL_CONTEXT_NOT_AUTHORIZED', 'unverified context');
  assertEquals(gmailRequestProviderAuthentication({ authorization_verified: true, token: 'x' }, providerBoundary).error_code, 'GMAIL_CREDENTIAL_INJECTION_REJECTED', 'credential injection in context');
});

test('a non-genuine credential boundary is rejected', () => {
  assertEquals(gmailRequestProviderAuthentication({ authorization_verified: true }, null).error_code, 'GMAIL_CREDENTIAL_BOUNDARY_INVALID', 'no boundary');
  assertEquals(gmailRequestProviderAuthentication({ authorization_verified: true }, {}).error_code, 'GMAIL_CREDENTIAL_BOUNDARY_INVALID', 'empty boundary');
  assertEquals(gmailRequestProviderAuthentication({ authorization_verified: true }, { ...providerBoundary, GMAIL_DELEGATED_SUBJECT: 'ray@execleadai.co' }).error_code, 'GMAIL_CREDENTIAL_BOUNDARY_MISMATCH', 'wrong mailbox boundary');
  const twoScopes = { ...providerBoundary, GMAIL_AUTHORIZED_SCOPES: [GMAIL_AUTHORIZED_SCOPE, 'https://www.googleapis.com/auth/gmail.readonly'] };
  assertEquals(gmailRequestProviderAuthentication({ authorization_verified: true }, twoScopes).error_code, 'GMAIL_CREDENTIAL_BOUNDARY_SCOPE_INVALID', 'broadened scope boundary');
});

// --- E.15 Real Gmail delivery remains disabled ---------------------------
test('real Gmail delivery remains disabled (kill switch unchanged)', () => {
  const ks = gmailKillSwitchState();
  assertEquals(ks.real_delivery_enabled, false, 'real delivery false');
  assertEquals(ks.connector_enabled, false, 'connector disabled');
  assertEquals(ks.connector_status, 'DRAFT', 'connector DRAFT');
  assertEquals(ks.execute_prospect_outreach_enabled, false, 'outreach tool disabled');
  assertEquals(EXECUTE_OUTREACH_TOOL_EXPECTED_STATE.status, 'DRAFT', 'tool DRAFT');
  assertEquals(EXECUTE_OUTREACH_TOOL_EXPECTED_STATE.enabled, false, 'tool disabled');
  assertEquals(EXECUTE_OUTREACH_TOOL_EXPECTED_STATE.risk_level, 'HIGH', 'tool high risk');
  const caps = gmailGetCapabilities();
  assertEquals(caps.connected, false, 'not connected');
  assertEquals(caps.authenticated, false, 'not authenticated');
  assertEquals(caps.supports_delivery, false, 'supports delivery false');
  assertEquals(caps.delivery_enabled, false, 'delivery enabled false');
  assertEquals(GMAIL_REGISTRY_SEED[0].status, 'DRAFT', 'registry DRAFT');
  assertEquals(GMAIL_REGISTRY_SEED[0].enabled, false, 'registry disabled');
});

test('gmailDeliver regression: fully validated request still terminates not-connected', () => {
  const request = buildValidRequest();
  const result = gmailDeliver(request, authorizedContext(request));
  assertEquals(result.delivery_status, 'GMAIL_API_NOT_CONNECTED', 'terminal state unchanged');
  assertEquals(result.network_calls, 0, 'no network calls');
  assertEquals(result.sent, false, 'nothing sent');
});

// --- E.16 Sandbox delivery remains unchanged ------------------------------
test('sandbox connector remains ACTIVE, enabled, and non-delivering (unchanged)', () => {
  const sandboxRecord = CONNECTOR_REGISTRY_SEED[0];
  assertEquals(sandboxRecord.connector_id, 'sandbox_delivery', 'sandbox id unchanged');
  assertEquals(DELIVERY_CONNECTOR_ID, 'sandbox_delivery', 'sandbox export id unchanged');
  assertEquals(sandboxRecord.status, 'ACTIVE', 'sandbox remains ACTIVE');
  assertEquals(sandboxRecord.enabled, true, 'sandbox remains enabled');
  assertEquals(sandboxRecord.supports_delivery, false, 'sandbox never delivers');
  assertEquals(sandboxRecord.sandbox_only, true, 'sandbox remains sandbox_only');
  assertEquals(DELIVERY_CONNECTOR_TYPE, 'SANDBOX', 'sandbox type unchanged');
});

// --- Dual-runner -----------------------------------------------------------
if (typeof Deno !== 'undefined') {
  for (const t of tests) Deno.test(t.name, t.fn);
} else {
  (async () => {
    let pass = 0;
    let fail = 0;
    for (const t of tests) {
      try {
        await t.fn();
        pass++;
      } catch (e) {
        fail++;
        console.error(`FAIL: ${t.name} — ${e && e.message ? e.message : e}`);
      }
    }
    console.log(`RESULT ${pass}/${pass + fail} deterministic tests ${fail === 0 ? 'pass' : 'FAILED'}`);
    if (fail > 0) process.exitCode = 1;
  })();
}
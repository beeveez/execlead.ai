/**
 * Gmail OAuth Connector-Token Provider — Phase 14C deterministic test
 * suite. Runs under Deno (registered) or plain Node (sequential) with no
 * external dependencies. Verifies the Base44-managed Gmail OAuth connector
 * is the only credential source, that no service-account private key or
 * IAM token-signing path exists, that the connector token is server-only
 * and never surfaces in governed entities, prompts, telemetry, or results,
 * that identity / scope / sender enforcement fails closed, that client
 * directives are rejected, that Phase 11/12 approval binding, idempotency,
 * and the sandbox baseline are preserved, and that real Gmail delivery
 * remains disabled with no message ever sent.
 */

import {
  GMAIL_CONNECTOR_PROVIDER_ID,
  GMAIL_CONNECTOR_ARCHITECTURE,
  GMAIL_CONNECTOR_INTEGRATION_TYPE,
  GMAIL_CONNECTOR_EXPECTED_IDENTITY,
  GMAIL_SENDER_IDENTITY,
  GMAIL_CONNECTOR_REQUIRED_SCOPE,
  GMAIL_CONNECTOR_TOKEN_NEVER_SURFACES,
  GMAIL_CONNECTOR_BOUNDARY_CONTRACT_MARKERS,
  GMAIL_CONNECTOR_REJECTED_AUTH_ARCHITECTURES,
  gmailConnectorServerOnlyGuard,
  validateGmailConnectorIdentity,
  validateGmailConnectorScopes,
  validateGmailConnectorSender,
  validateNoClientConnectorDirective,
  getGmailConnectorCredentialStatus,
  acquireGmailConnectorTokenContext,
} from './gmailConnectorCredentialProvider.ts';
import {
  GMAIL_DELIVERY_IDENTITY,
  GMAIL_CONNECTOR_TOKEN_BOUNDARY_PROVIDER_ID,
  GMAIL_CONNECTOR_TOKEN_BOUNDARY_MARKERS,
  gmailRequestConnectorAuthentication,
  gmailGetCapabilities,
  gmailKillSwitchState,
  gmailDeliver,
  gmailGetDeliveryStatus,
  gmailMapToProviderRepresentation,
  deriveGmailDeliveryIdentity,
  validateGmailDestination,
  buildGmailDestination,
} from './googleWorkspaceGmailConnector.ts';
import {
  CONNECTOR_REGISTRY_SEED,
  DELIVERY_CONNECTOR_ID,
  DELIVERY_CONNECTOR_TYPE,
  getRealDeliveryReadiness,
  createGovernedDeliveryRequest,
  buildSandboxDestination,
} from './sandboxDeliveryConnector.ts';

const { readFileSync, readdirSync, statSync } = await import('node:fs');

const tests = [];
function test(name, fn) { tests.push({ name, fn }); }
function assertEquals(a, b, msg) { if (a !== b) throw new Error(`${msg || 'assertion failed'} — expected "${b}", got "${a}"`); }
function assertIncludes(arr, item, msg) { if (!arr.includes(item)) throw new Error(`${msg || 'assertion failed'} — missing "${item}"`); }
function assertTrue(v, msg) { if (v !== true) throw new Error(msg || 'expected true'); }
function assertFalse(v, msg) { if (v !== false) throw new Error(msg || 'expected false'); }
function assertRejected(r, code) {
  if (r.ok !== false) throw new Error(`expected rejection, got ok result: ${JSON.stringify(r).substring(0, 200)}`);
  if (code && r.error_code !== code) throw new Error(`expected error_code ${code}, got ${r.error_code}`);
}

const SENTINEL_TOKEN = 'ya29.SENTINEL-CONNECTOR-TOKEN-FOR-LEAK-TESTING-0123456789abcdef';
const PROSPECT_ID = '11111111-2222-3333-4444-555555555555';
const APPROVAL_ID = 'aaaa1111-bbbb-2222-cccc-3333dddd4444';
const EXECUTION_ID = 'eeee5555-ffff-6666-7777-88889999aaaa';
const CORRELATION_ID = 'wf:test:growth_agent:execute_prospect_outreach:abc12345';
const DRAFT_HASH = '0123456789abcdef';

function validGateway() {
  return {
    connector_available: true,
    connected_identity: GMAIL_CONNECTOR_EXPECTED_IDENTITY,
    granted_scopes: [GMAIL_CONNECTOR_REQUIRED_SCOPE, 'email'],
    connector_token: SENTINEL_TOKEN,
    retrieval_status: 'ok',
  };
}

function authorizedBoundaryContext() {
  return { authorization_verified: true };
}

async function readModuleSource(rel) {
  try {
    return await Deno.readTextFile(rel);
  } catch (_e) {
    return readFileSync(rel, 'utf8');
  }
}

async function readProviderSource() {
  return readModuleSource('base44/shared/gmailConnectorCredentialProvider.ts');
}

async function readConnectorSource() {
  return readModuleSource('base44/shared/googleWorkspaceGmailConnector.ts');
}

function executableLines(src) {
  return src.split('\n').map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('*') && !l.startsWith('/*') && !l.startsWith('//'))
    // Pure quoted-string array items are documentation data (isolation
    // target names, rejected-architecture names) — not executable access.
    .filter((l) => !/^'[^']*',$/.test(l));
}

function walkSourceFiles(dir, acc) {
  for (const entry of readdirSync(dir)) {
    const p = dir + '/' + entry;
    if (statSync(p).isDirectory()) {
      if (entry === 'node_modules' || entry === '.git') continue;
      walkSourceFiles(p, acc);
    } else if (/\.(js|jsx|ts|tsx)$/.test(entry)) {
      acc.push(p);
    }
  }
  return acc;
}

function governedFields(overrides) {
  const base = {
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
  };
  return overrides ? { ...base, ...overrides } : base;
}

function buildValidRequest() {
  const res = createGovernedDeliveryRequest(governedFields(), { authorization_verified: true });
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

// --- 1. The Base44 Gmail connector is the only credential source -----------
test('the Base44 Gmail OAuth connector is the only credential source', () => {
  assertEquals(GMAIL_CONNECTOR_ARCHITECTURE, 'BASE44_MANAGED_GMAIL_OAUTH_CONNECTOR', 'architecture');
  assertEquals(GMAIL_CONNECTOR_PROVIDER_ID, 'base44_gmail_oauth_connector_token_provider', 'provider id');
  assertEquals(GMAIL_CONNECTOR_INTEGRATION_TYPE, 'gmail', 'the Base44 connector integration type is the sole credential source');
  assertIncludes(GMAIL_CONNECTOR_REJECTED_AUTH_ARCHITECTURES, 'SERVICE_ACCOUNT_PRIVATE_KEY', 'service-account keys are a rejected architecture');
  assertIncludes(GMAIL_CONNECTOR_REJECTED_AUTH_ARCHITECTURES, 'GOOGLE_IAM_TOKEN_SIGNING_DELEGATION', 'IAM token-signing delegation is a rejected architecture');
  const status = getGmailConnectorCredentialStatus(validGateway());
  assertTrue(status.connected, 'a valid sanitized server gateway snapshot connects the boundary');
});

// --- 2. No service-account private key is referenced ------------------------
test('no service-account private key is referenced', async () => {
  const src = await readProviderSource();
  for (const line of executableLines(src)) {
    if (/BEGIN PRIVATE KEY|\.p12|\.pem|key_file|KEY_FILE/.test(line)) {
      throw new Error('private-key surface found in executable code: ' + line.substring(0, 120));
    }
    if (/private_key/.test(line) && !line.includes('GMAIL_CONNECTOR_INJECTION_FIELDS')) {
      throw new Error('private-key reference outside the injection guard: ' + line.substring(0, 120));
    }
  }
});

// --- 3. No private-key environment variable is required ----------------------
test('no private-key environment variable is required', async () => {
  const src = await readProviderSource();
  for (const raw of src.split('\n')) {
    if (/GOOGLE_GMAIL_SA_PRIVATE_KEY|GOOGLE_GMAIL_SA_CLIENT_EMAIL/.test(raw)) {
      throw new Error('private-key service-account secret reference found in the provider: ' + raw.substring(0, 120));
    }
  }
  for (const line of executableLines(src)) {
    if (/process\.|env\./.test(line)) {
      throw new Error('environment access found in executable code: ' + line.substring(0, 120));
    }
  }
});

// --- 4. No Google IAM signJwt path exists -----------------------------------
test('no Google IAM token-signing path exists', async () => {
  const src = await readProviderSource();
  const lower = src.toLowerCase();
  for (const term of ['signjwt', 'iamcredentials', 'jwt.io', 'rs256']) {
    if (lower.includes(term)) {
      throw new Error(`IAM token-signing surface "${term}" found in the provider`);
    }
  }
  for (const line of executableLines(src)) {
    if (/fetch\(|XMLHttpRequest|axios|WebSocket|EventSource/.test(line)) {
      throw new Error('network capability found in executable code: ' + line.substring(0, 120));
    }
  }
});

// --- 5. The connector token is server-only ----------------------------------
test('the connector token is server-only', () => {
  assertRejected(gmailConnectorServerOnlyGuard({ window: {} }), 'GMAIL_CONNECTOR_SERVER_ONLY');
  assertRejected(gmailConnectorServerOnlyGuard({ document: {} }), 'GMAIL_CONNECTOR_SERVER_ONLY');
  assertTrue(gmailConnectorServerOnlyGuard().ok, 'a server runtime passes the guard');
  const acquired = acquireGmailConnectorTokenContext({}, validGateway());
  assertTrue(acquired.ok, 'server-side acquisition succeeds');
  assertTrue(Object.isFrozen(acquired), 'the server-side token context is frozen');
  assertIncludes(acquired.usage, 'server_side_only', 'usage marker');
});

// --- 6-10. The token never surfaces in governed entities or telemetry -------
test('the token never enters AgentExecution records', async () => {
  const src = await readProviderSource();
  for (const line of executableLines(src)) {
    if (/entities\.|AgentExecution\.|\.create\(|\.update\(|base44\.|asServiceRole/.test(line)) {
      throw new Error('entity write surface found in the provider: ' + line.substring(0, 120));
    }
  }
});

test('the token never enters AgentApproval records', async () => {
  const src = await readProviderSource();
  for (const line of executableLines(src)) {
    if (/AgentApproval|decideApproval|approvalDecision/.test(line)) {
      throw new Error('approval surface found in the provider: ' + line.substring(0, 120));
    }
  }
});

test('the token never enters Prospect records', async () => {
  const src = await readProviderSource();
  for (const line of executableLines(src)) {
    if (/prospectIntelligence|prospectCreate|Prospect\.create|bulkCreate|updateMany|deleteMany/.test(line)) {
      throw new Error('Prospect write surface found in the provider: ' + line.substring(0, 120));
    }
  }
});

test('the token never enters LLM context or prompts', async () => {
  const src = await readProviderSource();
  for (const line of executableLines(src)) {
    if (/invokeLLM|prompt|llm_context/.test(line)) {
      throw new Error('LLM/prompt surface found in the provider: ' + line.substring(0, 120));
    }
  }
});

test('the token never enters telemetry or usage logs', async () => {
  const src = await readProviderSource();
  for (const line of executableLines(src)) {
    if (/UsageLog|telemetry|analytics|console\.|logger|log\(/.test(line)) {
      throw new Error('telemetry or logging surface found in the provider: ' + line.substring(0, 120));
    }
  }
});

test('the token never appears in any sanitized result (sentinel leak scan)', () => {
  const gateway = validGateway();
  const status = getGmailConnectorCredentialStatus(gateway);
  if (JSON.stringify(status).includes(SENTINEL_TOKEN)) throw new Error('sentinel token leaked through connector status');
  const authResult = gmailRequestConnectorAuthentication(authorizedBoundaryContext(), null, null);
  const result = gmailRequestConnectorAuthentication(authorizedBoundaryContext(), {
    GMAIL_CONNECTOR_PROVIDER_ID,
    GMAIL_CONNECTOR_ARCHITECTURE,
    GMAIL_CONNECTOR_EXPECTED_IDENTITY,
    GMAIL_CONNECTOR_REQUIRED_SCOPE,
    GMAIL_SENDER_IDENTITY,
    validateGmailConnectorIdentity,
    validateGmailConnectorScopes,
    validateGmailConnectorSender,
    getGmailConnectorCredentialStatus,
    acquireGmailConnectorTokenContext,
  }, gateway);
  if (!result.ok) throw new Error('connector authentication failed: ' + result.error_code);
  if (JSON.stringify(result).includes(SENTINEL_TOKEN)) throw new Error('sentinel token leaked through the connector authentication result');
  assertEquals(result.token_in_result, 'none — the connector token stays inside the server boundary and is never returned', 'explicit no-token marker');
  void authResult;
});

// --- 11. Connected identity must be r.valdez@execleadai.co ------------------
test('the connected identity must be the authorized Workspace account', () => {
  assertTrue(validateGmailConnectorIdentity(GMAIL_CONNECTOR_EXPECTED_IDENTITY).ok, 'expected identity validates');
  assertEquals(GMAIL_CONNECTOR_EXPECTED_IDENTITY, 'r.valdez@execleadai.co', 'the fixed authorized Workspace account');
  assertRejected(validateGmailConnectorIdentity('ray@execleadai.co'), 'GMAIL_CONNECTOR_IDENTITY_REJECTED');
  assertRejected(validateGmailConnectorIdentity(GMAIL_SENDER_IDENTITY), 'GMAIL_CONNECTOR_IDENTITY_REJECTED');
  assertRejected(validateGmailConnectorIdentity('r.valdez@gmail.com'), 'GMAIL_CONNECTOR_IDENTITY_REJECTED');
  assertRejected(validateGmailConnectorIdentity('workspace-admin@execleadai.co'), 'GMAIL_CONNECTOR_IDENTITY_REJECTED');
  assertRejected(validateGmailConnectorIdentity(null), 'GMAIL_CONNECTOR_IDENTITY_REJECTED');
  assertRejected(validateGmailConnectorIdentity(12345), 'GMAIL_CONNECTOR_IDENTITY_REJECTED');
});

// --- 12. The required scope must be exactly the gmail.send scope -------------
test('the granted scope must include the fixed sending scope', () => {
  const ok = validateGmailConnectorScopes([GMAIL_CONNECTOR_REQUIRED_SCOPE]);
  assertTrue(ok.ok, 'the sending scope alone validates');
  assertEquals(ok.gmail_scope, 'https://www.googleapis.com/auth/gmail.send', 'gmail.send only');
  const withIdentityScope = validateGmailConnectorScopes([GMAIL_CONNECTOR_REQUIRED_SCOPE, 'email']);
  assertTrue(withIdentityScope.ok, 'a plain identity scope alongside the sending scope is permitted');
  assertRejected(validateGmailConnectorScopes([]), 'GMAIL_CONNECTOR_SCOPE_REJECTED');
  assertRejected(validateGmailConnectorScopes(['email']), 'GMAIL_CONNECTOR_SCOPE_REJECTED');
  assertRejected(validateGmailConnectorScopes(null), 'GMAIL_CONNECTOR_SCOPE_REJECTED');
});

// --- 13. Broader Gmail scopes are rejected -----------------------------------
test('broader Gmail scopes are rejected', () => {
  const broader = [
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.compose',
    'https://www.googleapis.com/auth/gmail.insert',
    'https://www.googleapis.com/auth/gmail.labels',
    'https://www.googleapis.com/auth/gmail.settings.basic',
    'https://mail.google.com/',
  ];
  for (const scope of broader) {
    assertRejected(validateGmailConnectorScopes([GMAIL_CONNECTOR_REQUIRED_SCOPE, scope]), 'GMAIL_CONNECTOR_SCOPE_REJECTED');
  }
  assertRejected(validateGmailConnectorScopes([GMAIL_CONNECTOR_REQUIRED_SCOPE, 'https://www.googleapis.com/auth/cloud-platform']), 'GMAIL_CONNECTOR_SCOPE_REJECTED');
});

// --- 14. Sender must be growth@execleadai.co --------------------------------
test('the sender must be the fixed Growth mailbox alias', () => {
  assertTrue(validateGmailConnectorSender(GMAIL_SENDER_IDENTITY).ok, 'the Growth alias validates');
  assertEquals(GMAIL_SENDER_IDENTITY, 'growth@execleadai.co', 'fixed sender');
  assertEquals(GMAIL_DELIVERY_IDENTITY, 'growth@execleadai.co', 'connector sender parity');
  assertRejected(validateGmailConnectorSender('r.valdez@execleadai.co'), 'GMAIL_SENDER_IDENTITY_REJECTED');
  assertRejected(validateGmailConnectorSender('growth@execleadai.com'), 'GMAIL_SENDER_IDENTITY_REJECTED');
  assertRejected(validateGmailConnectorSender('attacker@example.com'), 'GMAIL_SENDER_IDENTITY_REJECTED');
  assertRejected(validateGmailConnectorSender(null), 'GMAIL_SENDER_IDENTITY_REJECTED');
});

// --- 15. Client-supplied sender is rejected ----------------------------------
test('client-supplied sender fields are rejected', () => {
  for (const key of ['sender', 'sender_email', 'from', 'mailbox', 'gmail_account', 'account']) {
    assertRejected(validateNoClientConnectorDirective({ [key]: 'x@y.z' }), 'GMAIL_CONNECTOR_DIRECTIVE_REJECTED');
  }
  assertRejected(
    gmailRequestConnectorAuthentication({ authorization_verified: true, from: 'attacker@evil.example' }, null, null),
    'GMAIL_CLIENT_SENDER_REJECTED',
  );
});

// --- 16. Client-supplied recipient is rejected --------------------------------
test('client-supplied recipient fields are rejected', () => {
  assertRejected(validateNoClientConnectorDirective({ recipient: 'victim@example.com' }), 'GMAIL_CONNECTOR_DIRECTIVE_REJECTED');
  assertRejected(validateNoClientConnectorDirective({ to: 'victim@example.com' }), 'GMAIL_CONNECTOR_DIRECTIVE_REJECTED');
  assertRejected(
    validateGmailDestination({ ...buildGmailDestination(), recipient_reference: 'victim@example.com' }),
    'GMAIL_CLIENT_RECIPIENT_REJECTED',
  );
});

// --- 17. Client-supplied provider/account identity is rejected ----------------
test('client-supplied provider or account identity is rejected', () => {
  assertRejected(validateNoClientConnectorDirective({ provider_id: 'gmail' }), 'GMAIL_CONNECTOR_DIRECTIVE_REJECTED');
  assertRejected(validateNoClientConnectorDirective({ gmail_account: 'someone@gmail.com' }), 'GMAIL_CONNECTOR_DIRECTIVE_REJECTED');
  assertRejected(validateNoClientConnectorDirective({ params: { userId: 'me' } }), 'GMAIL_CONNECTOR_DIRECTIVE_REJECTED');
  assertRejected(
    validateGmailDestination({ ...buildGmailDestination(), provider_id: 'gmail' }),
    'GMAIL_PROVIDER_ID_REJECTED',
  );
});

// --- 18. Approval draft-hash binding remains enforced -------------------------
test('the approved draft hash binding remains enforced', () => {
  const request = buildValidRequest();
  const context = authorizedContext(request);
  const hashMismatch = gmailDeliver(request, { ...context, expected: { ...context.expected, approved_draft_hash: 'ffffffffffffffff' } });
  assertEquals(hashMismatch.error_code, 'GMAIL_DRAFT_HASH_MISMATCH', 'draft hash binding mismatch');
  const forged = { ...request, approved_draft_hash: 'ffffffffffffffff' };
  assertEquals(gmailDeliver(forged, context).error_code, 'GMAIL_MESSAGE_DRAFT_HASH_MISMATCH', 'draft hash substitution fails the message binding');
});

// --- 19. Single-use approval substitution is blocked ---------------------------
test('approval substitution is blocked in the governed delivery contract', () => {
  const request = buildValidRequest();
  const context = authorizedContext(request);
  const mismatch = gmailDeliver(request, { ...context, expected: { ...context.expected, approval_id: '00000000-1111-2222-3333-444444444444' } });
  assertEquals(mismatch.error_code, 'GMAIL_APPROVAL_MISMATCH', 'approval binding mismatch');
  const forged = { ...request, approval_id: '00000000-1111-2222-3333-444444444444' };
  assertEquals(gmailDeliver(forged, context).error_code, 'GMAIL_APPROVAL_MISMATCH', 'approval substitution fails the approval binding');
});

// --- 20. Idempotency remains enforced ------------------------------------------
test('delivery identity idempotency remains enforced', () => {
  const parts = { execution_id: EXECUTION_ID, approved_draft_hash: DRAFT_HASH, prospect_id: PROSPECT_ID, channel: 'EMAIL' };
  const identityOne = deriveGmailDeliveryIdentity(parts);
  const identityTwo = deriveGmailDeliveryIdentity({ ...parts });
  assertEquals(identityOne, identityTwo, 'the governed identity is deterministic for the same logical delivery');
  const identityOther = deriveGmailDeliveryIdentity({ ...parts, prospect_id: '99999999-8888-7777-6666-555555555555' });
  assertTrue(identityOne !== identityOther, 'a different logical delivery carries a different governed identity');
  const request = buildValidRequest();
  const context = authorizedContext(request);
  const replay = gmailDeliver(request, { ...context, expected: { ...context.expected, delivery_identity: identityOther } });
  assertEquals(replay.error_code, 'GMAIL_DELIVERY_IDENTITY_MISMATCH', 'no replay of a different logical delivery is permitted');
});

// --- 21. The sandbox connector remains unchanged -------------------------------
test('the sandbox delivery connector remains unchanged and non-delivering', () => {
  const sandboxRecord = CONNECTOR_REGISTRY_SEED[0];
  assertEquals(sandboxRecord.connector_id, 'sandbox_delivery', 'sandbox id unchanged');
  assertEquals(DELIVERY_CONNECTOR_ID, 'sandbox_delivery', 'sandbox export id');
  assertEquals(sandboxRecord.status, 'ACTIVE', 'sandbox remains ACTIVE');
  assertEquals(sandboxRecord.enabled, true, 'sandbox remains enabled');
  assertEquals(sandboxRecord.supports_delivery, false, 'sandbox never delivers');
  assertEquals(sandboxRecord.sandbox_only, true, 'sandbox remains sandbox_only');
  assertEquals(DELIVERY_CONNECTOR_TYPE, 'SANDBOX', 'sandbox type unchanged');
  const readiness = getRealDeliveryReadiness();
  assertFalse(readiness.real_delivery_enabled, 'real delivery remains disabled');
});

// --- 22. Real Gmail delivery remains disabled -----------------------------------
test('real Gmail delivery remains disabled', () => {
  const caps = gmailGetCapabilities();
  assertFalse(caps.delivery_enabled, 'delivery_enabled false');
  assertFalse(caps.real_delivery, 'real_delivery false');
  assertFalse(caps.supports_delivery, 'supports_delivery false');
  assertFalse(caps.enabled, 'connector enabled false');
  const ks = gmailKillSwitchState();
  assertFalse(ks.real_delivery_enabled, 'kill switch real delivery false');
  assertFalse(ks.execute_prospect_outreach_enabled, 'execute_prospect_outreach remains disabled');
});

// --- 23. No Gmail message is ever sent -------------------------------------------
test('no Gmail message is sent and no API call is made', () => {
  const request = buildValidRequest();
  const result = gmailDeliver(request, authorizedContext(request));
  assertEquals(result.delivery_status, 'GMAIL_API_NOT_CONNECTED', 'terminal state remains not connected');
  assertFalse(result.sent, 'sent false');
  assertFalse(result.delivered, 'delivered false');
  assertFalse(result.persisted, 'persisted false');
  assertFalse(result.external_delivery, 'external delivery false');
  assertEquals(result.network_calls, 0, 'zero network calls');
  const mapping = gmailMapToProviderRepresentation(request);
  assertFalse(mapping.api_call_made, 'no provider API call is made');
  const auth = gmailRequestConnectorAuthentication(authorizedBoundaryContext(), {
    GMAIL_CONNECTOR_PROVIDER_ID,
    GMAIL_CONNECTOR_ARCHITECTURE,
    GMAIL_CONNECTOR_EXPECTED_IDENTITY,
    GMAIL_CONNECTOR_REQUIRED_SCOPE,
    GMAIL_SENDER_IDENTITY,
    validateGmailConnectorIdentity,
    validateGmailConnectorScopes,
    validateGmailConnectorSender,
    getGmailConnectorCredentialStatus,
    acquireGmailConnectorTokenContext,
  }, validGateway());
  assertTrue(auth.ok, 'server-side authentication resolves');
  assertEquals(auth.network_calls, 0, 'the authentication path makes zero network calls');
  assertFalse(auth.sent, 'the authentication path sends nothing');
  assertTrue(auth.verification.includes('NOTHING SENT'), 'the notice states nothing is sent');
});

// --- Connector-token authentication boundary contract ---------------------------
test('connector-token boundary markers match the provider contract', () => {
  assertEquals(GMAIL_CONNECTOR_TOKEN_BOUNDARY_PROVIDER_ID, GMAIL_CONNECTOR_PROVIDER_ID, 'provider id parity');
  for (const marker of GMAIL_CONNECTOR_TOKEN_BOUNDARY_MARKERS) {
    assertIncludes(GMAIL_CONNECTOR_BOUNDARY_CONTRACT_MARKERS, marker, `boundary marker ${marker}`);
  }
});

test('connector-token authentication succeeds only through the genuine server boundary', () => {
  const genuine = gmailRequestConnectorAuthentication(
    authorizedBoundaryContext(),
    {
      GMAIL_CONNECTOR_PROVIDER_ID,
      GMAIL_CONNECTOR_ARCHITECTURE,
      GMAIL_CONNECTOR_EXPECTED_IDENTITY,
      GMAIL_CONNECTOR_REQUIRED_SCOPE,
      GMAIL_SENDER_IDENTITY,
      validateGmailConnectorIdentity,
      validateGmailConnectorScopes,
      validateGmailConnectorSender,
      getGmailConnectorCredentialStatus,
      acquireGmailConnectorTokenContext,
    },
    validGateway(),
  );
  assertTrue(genuine.ok, 'genuine boundary + gateway authenticates');
  assertEquals(genuine.provider_authentication, 'SERVER_SIDE_ONLY', 'server-side-only marker');
  assertEquals(genuine.connected_identity, 'r.valdez@execleadai.co', 'connected identity reported');
  assertEquals(genuine.sender_identity, 'growth@execleadai.co', 'sender identity reported');
  assertFalse(genuine.delivery_enabled, 'authentication never enables delivery');
});

test('connector-token authentication fails closed on every invalid condition', () => {
  const boundary = {
    GMAIL_CONNECTOR_PROVIDER_ID,
    GMAIL_CONNECTOR_ARCHITECTURE,
    GMAIL_CONNECTOR_EXPECTED_IDENTITY,
    GMAIL_CONNECTOR_REQUIRED_SCOPE,
    GMAIL_SENDER_IDENTITY,
    validateGmailConnectorIdentity,
    validateGmailConnectorScopes,
    validateGmailConnectorSender,
    getGmailConnectorCredentialStatus,
    acquireGmailConnectorTokenContext,
  };
  assertRejected(
    gmailRequestConnectorAuthentication(null, boundary, validGateway()),
    'GMAIL_CONTEXT_NOT_AUTHORIZED',
  );
  assertRejected(
    gmailRequestConnectorAuthentication(authorizedBoundaryContext(), null, validGateway()),
    'GMAIL_CONNECTOR_TOKEN_BOUNDARY_INVALID',
  );
  const forgedBoundary = { ...boundary, GMAIL_CONNECTOR_PROVIDER_ID: 'fake_provider' };
  assertRejected(
    gmailRequestConnectorAuthentication(authorizedBoundaryContext(), forgedBoundary, validGateway()),
    'GMAIL_CONNECTOR_TOKEN_BOUNDARY_INVALID',
  );
  const wrongArchitecture = { ...boundary, GMAIL_CONNECTOR_ARCHITECTURE: 'SERVICE_ACCOUNT_DOMAIN_WIDE_DELEGATION' };
  assertRejected(
    gmailRequestConnectorAuthentication(authorizedBoundaryContext(), wrongArchitecture, validGateway()),
    'GMAIL_CONNECTOR_TOKEN_BOUNDARY_MISMATCH',
  );
  const unavailable = gmailRequestConnectorAuthentication(authorizedBoundaryContext(), boundary, null);
  assertFalse(unavailable.ok, 'no gateway fails closed');
  assertEquals(unavailable.provider_authentication, 'NOT_CONNECTED', 'unavailable gateway reports not connected');
  assertEquals(unavailable.error_code, 'GMAIL_CONNECTOR_UNAVAILABLE', 'unavailable connector code');
  const wrongIdentity = gmailRequestConnectorAuthentication(authorizedBoundaryContext(), boundary, { ...validGateway(), connected_identity: 'ray@execleadai.co' });
  assertEquals(wrongIdentity.error_code, 'GMAIL_CONNECTOR_IDENTITY_REJECTED', 'wrong connected identity fails closed');
  const broaderScope = gmailRequestConnectorAuthentication(authorizedBoundaryContext(), boundary, { ...validGateway(), granted_scopes: [GMAIL_CONNECTOR_REQUIRED_SCOPE, 'https://www.googleapis.com/auth/gmail.readonly'] });
  assertEquals(broaderScope.error_code, 'GMAIL_CONNECTOR_SCOPE_REJECTED', 'broader granted scope fails closed');
  const missingToken = gmailRequestConnectorAuthentication(authorizedBoundaryContext(), boundary, { ...validGateway(), connector_token: '' });
  assertEquals(missingToken.error_code, 'GMAIL_CONNECTOR_TOKEN_RETRIEVAL_FAILED', 'missing token fails closed');
  assertRejected(acquireGmailConnectorTokenContext({}, { ...validGateway(), unknown_field: 'x' }), 'GMAIL_CONNECTOR_GATEWAY_FIELD_REJECTED');
  assertRejected(acquireGmailConnectorTokenContext({ access_token: 'x' }, validGateway()), 'GMAIL_CONNECTOR_INJECTION_REJECTED');
  assertRejected(acquireGmailConnectorTokenContext({ unknown_option: 'x' }, validGateway()), 'GMAIL_CONNECTOR_OPTION_FIELD_REJECTED');
  assertRejected(acquireGmailConnectorTokenContext({ requested_sender: 'someone@execleadai.co' }, validGateway()), 'GMAIL_SENDER_IDENTITY_REJECTED');
});

test('connector status is truthful and sanitized without a gateway', () => {
  const status = getGmailConnectorCredentialStatus(null);
  assertFalse(status.connected, 'no gateway means not connected');
  assertEquals(status.error_code, 'GMAIL_CONNECTOR_UNAVAILABLE', 'unavailable code');
  assertIncludes(status.missing_requirements, 'gmail_connector_connection', 'missing requirement naming');
  assertEquals(status.delivery_enabled, false, 'status never enables delivery');
  if (JSON.stringify(status).includes('ya29')) throw new Error('status carries token material');
});

test('frontend code never imports the connector-token provider or calls the Gmail API directly', () => {
  const files = walkSourceFiles('src', []);
  // The Guardian measured-state module is a documentation/evidence registry —
  // it names governed modules in prose but never imports or invokes them.
  const filesToScan = files.filter((f) => !f.endsWith('src/lib/guardianMeasuredState.js'));
  let scanned = 0;
  for (const f of filesToScan) {
    scanned++;
    const src = readFileSync(f, 'utf8');
    if (src.includes('gmailConnectorCredentialProvider')) {
      throw new Error('frontend import of the server-only provider found: ' + f);
    }
    if (src.includes('googleWorkspaceGmailConnector')) {
      throw new Error('frontend import of the Gmail connector found: ' + f);
    }
    if (/gmail\.googleapis\.com|users\/me\/messages|googleapis\.com\/auth\/gmail/.test(src)) {
      throw new Error('frontend Gmail API surface found: ' + f);
    }
  }
  assertTrue(scanned > 100, `expected a full frontend scan, scanned ${scanned} files`);
});

test('the connector module keeps zero imports and no network or storage surface', async () => {
  const src = await readConnectorSource();
  if (/^\s*import\b/m.test(src)) throw new Error('the connector module must have zero imports');
  for (const line of executableLines(src)) {
    if (/fetch\(|XMLHttpRequest|axios|WebSocket|EventSource|googleapis|API_BASE/.test(line)) {
      throw new Error('provider API surface found in connector code: ' + line.substring(0, 120));
    }
    if (/localStorage|sessionStorage|indexedDB|setItem\(|writeFile|env\.|document\.|window\./.test(line)) {
      throw new Error('storage surface found in connector code: ' + line.substring(0, 120));
    }
    if (/console\.|logger|log\(/.test(line)) {
      throw new Error('logging surface found in connector code: ' + line.substring(0, 120));
    }
  }
});

test('the never-surfaces policy covers every governed destination', () => {
  for (const item of ['AgentExecution', 'AgentApproval', 'Prospect', 'llm_context', 'telemetry', 'UsageLog', 'delivery_audit_records']) {
    assertIncludes(GMAIL_CONNECTOR_TOKEN_NEVER_SURFACES, item, 'never-surfaces policy entry');
  }
});

// --- Dual-runner ------------------------------------------------------------------
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
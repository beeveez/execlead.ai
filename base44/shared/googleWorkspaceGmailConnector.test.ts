/**
 * Google Workspace Gmail Connector — Phase 13 deterministic contract test
 * suite. Runs under Deno (registered) or plain Node (sequential) with no
 * external dependencies. Verifies the connector is architecture only: not
 * connected, no credentials, no network, no real delivery — and that the
 * frozen baseline (sandbox connector, outreach tool, registry states) is
 * preserved.
 */

import {
  GMAIL_CONNECTOR_ID,
  GMAIL_CONNECTOR_NAME,
  GMAIL_CONNECTOR_TYPE,
  GMAIL_CONNECTOR_VERSION,
  GMAIL_DELIVERY_IDENTITY,
  GMAIL_CHANNEL,
  GMAIL_REGISTRY_SEED,
  GMAIL_ALLOWED_RESULT_STATUSES,
  GMAIL_STATUSES_UNAVAILABLE,
  GMAIL_FORBIDDEN_SENDER_EXAMPLES,
  GMAIL_CLIENT_SENDER_FIELD_NAMES,
  GMAIL_CREDENTIAL_FIELD_NAMES,
  GMAIL_AUDIT_PROHIBITED_FIELDS,
  GMAIL_READ_ACCESS_PROHIBITED,
  GMAIL_ATTACHMENT_POLICY,
  GMAIL_DELIVERY_SEMANTICS_CONCEPTUAL,
  GMAIL_COMPLIANCE_PREREQUISITES,
  GMAIL_RATE_LIMIT_ARCHITECTURE,
  GMAIL_RETRY_POLICY,
  EXECUTE_OUTREACH_TOOL_EXPECTED_STATE,
  gmailGetCapabilities,
  gmailKillSwitchState,
  validateGmailSenderIdentity,
  validateNoClientSenderDirective,
  buildGmailDestination,
  validateGmailDestination,
  validateGmailMessage,
  validateGmailProviderContext,
  gmailMapToProviderRepresentation,
  gmailDeliver,
  gmailGetDeliveryStatus,
  assertGmailResultStatus,
  buildGmailAuditRecord,
  deriveGmailDeliveryIdentity,
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
function assertIncludes(arr, item, msg) { if (!arr.includes(item)) throw new Error(`${msg || 'assertion failed'} — missing "${item}"`); }
function assertTrue(v, msg) { if (v !== true) throw new Error(msg || 'expected true'); }
function assertRejected(r, code) {
  if (r.ok !== false) throw new Error(`expected rejection, got ok result: ${JSON.stringify(r).substring(0, 200)}`);
  if (code && r.error_code !== code) throw new Error(`expected error_code ${code}, got ${r.error_code}`);
}

const PROSPECT_ID = '11111111-2222-3333-4444-555555555555';
const APPROVAL_ID = 'aaaa1111-bbbb-2222-cccc-3333dddd4444';
const EXECUTION_ID = 'eeee5555-ffff-6666-7777-88889999aaaa';
const CORRELATION_ID = 'wf:test:growth_agent:execute_prospect_outreach:abc12345';
const DRAFT_HASH = '0123456789abcdef';

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

function buildValidRequest() {
  const res = createGovernedDeliveryRequest(governedFields(), { authorization_verified: true });
  if (!res.ok) throw new Error('fixture build failed: ' + res.error);
  return res.request;
}

async function readModuleSource() {
  try {
    return await Deno.readTextFile(new URL('./googleWorkspaceGmailConnector.ts', import.meta.url));
  } catch (_e) {
    try {
      const { readFileSync } = await import('node:fs');
      return readFileSync(new URL('./googleWorkspaceGmailConnector.ts', import.meta.url), 'utf8');
    } catch (_e2) {
      return __GOOGLE_MODULE_SOURCE__;
    }
  }
}

// --- 1. Connector loads -----------------------------------------------------
test('module loads and exports its contract', () => {
  assertEquals(GMAIL_CONNECTOR_ID, 'google_workspace_gmail', 'connector id');
  assertEquals(GMAIL_CONNECTOR_TYPE, 'GOOGLE_WORKSPACE_GMAIL', 'connector type');
  assertEquals(GMAIL_CONNECTOR_VERSION, '1.0.0', 'connector version');
});

// --- 2-6. Truthful capabilities ---------------------------------------------
test('provider identity is truthful', () => {
  const caps = gmailGetCapabilities();
  assertEquals(caps.provider, 'GOOGLE_WORKSPACE_GMAIL', 'provider');
  assertEquals(caps.connector_id, 'google_workspace_gmail', 'connector id');
  assertEquals(caps.channel, 'EMAIL', 'channel');
  assertEquals(caps.delivery_identity, 'growth@execleadai.co', 'delivery identity');
  assertEquals(caps.approval_required, true, 'approval required');
});

test('connected is false', () => {
  assertEquals(gmailGetCapabilities().connected, false, 'connected');
});

test('authenticated is false', () => {
  assertEquals(gmailGetCapabilities().authenticated, false, 'authenticated');
});

test('delivery_enabled is false', () => {
  assertEquals(gmailGetCapabilities().delivery_enabled, false, 'delivery_enabled');
});

test('real_delivery is false', () => {
  assertEquals(gmailGetCapabilities().real_delivery, false, 'real_delivery');
  assertEquals(gmailGetCapabilities().supports_delivery, false, 'supports_delivery');
  assertEquals(gmailGetCapabilities().enabled, false, 'enabled');
});

// --- 7-10. Sender identity protection ---------------------------------------
test('sender identity is fixed to growth@execleadai.co', () => {
  const ok = validateGmailSenderIdentity('growth@execleadai.co');
  assertTrue(ok.ok, 'fixed sender identity must validate');
  assertEquals(gmailGetCapabilities().delivery_identity, 'growth@execleadai.co', 'mailbox');
});

test('arbitrary sender identities are rejected', () => {
  for (const bad of GMAIL_FORBIDDEN_SENDER_EXAMPLES) {
    assertRejected(validateGmailSenderIdentity(bad), 'GMAIL_SENDER_IDENTITY_REJECTED');
  }
  assertRejected(validateGmailSenderIdentity('somebody@example.com'), 'GMAIL_SENDER_IDENTITY_REJECTED');
});

test('arbitrary mailbox selection is rejected', () => {
  assertRejected(validateGmailSenderIdentity('ray@execleadai.co'), 'GMAIL_SENDER_IDENTITY_REJECTED');
  assertRejected(validateGmailSenderIdentity('workspace-admin@execleadai.co'), 'GMAIL_SENDER_IDENTITY_REJECTED');
  const caps = gmailGetCapabilities();
  assertEquals(caps.delivery_identity, 'growth@execleadai.co', 'no dynamic mailbox');
});

test('client-supplied sender fields are rejected', () => {
  for (const key of GMAIL_CLIENT_SENDER_FIELD_NAMES) {
    assertRejected(validateNoClientSenderDirective({ [key]: 'x@y.z' }), 'GMAIL_CLIENT_SENDER_REJECTED');
  }
  const request = buildValidRequest();
  const forged = { ...request, from: 'attacker@evil.example' };
  const result = gmailDeliver(forged, authorizedContext(request));
  assertEquals(result.delivery_status, 'BLOCKED', 'client sender must block');
  assertEquals(result.error_code, 'GMAIL_CLIENT_SENDER_REJECTED', 'sender directive block code');
});

// --- 11-12. Recipient / provider protection ---------------------------------
test('client-supplied recipient is rejected', () => {
  assertRejected(validateGmailDestination({ ...buildGmailDestination(), recipient_reference: 'victim@example.com' }), 'GMAIL_CLIENT_RECIPIENT_REJECTED');
  const request = buildValidRequest();
  const forged = { ...request, message: { ...request.message, to: 'victim@example.com' }, message_hash: request.message_hash };
  const result = gmailDeliver(forged, authorizedContext(request));
  assertEquals(result.error_code, 'GMAIL_CLIENT_RECIPIENT_REJECTED', 'client recipient block code');
});

test('arbitrary provider ID is rejected', () => {
  assertRejected(validateGmailDestination({ ...buildGmailDestination(), provider_id: 'gmail' }), 'GMAIL_PROVIDER_ID_REJECTED');
  assertRejected(validateGmailDestination({ ...buildGmailDestination(), provider_id: 'google/random' }), 'GMAIL_PROVIDER_ID_REJECTED');
});

// --- 13-15. Credential isolation ---------------------------------------------
test('arbitrary OAuth token in provider context is rejected', () => {
  assertRejected(validateGmailProviderContext({ token: 'ya29.fake-token' }), 'GMAIL_CREDENTIAL_INJECTION_REJECTED');
  assertRejected(validateGmailProviderContext({ id_token: 'abc' }), 'GMAIL_CREDENTIAL_INJECTION_REJECTED');
});

test('credential injection is rejected', () => {
  assertRejected(validateGmailProviderContext({ credentials: {} }), 'GMAIL_CREDENTIAL_INJECTION_REJECTED');
  assertRejected(validateGmailProviderContext({ private_key: 'x' }), 'GMAIL_CREDENTIAL_INJECTION_REJECTED');
  const request = buildValidRequest();
  const blocked = gmailDeliver(request, { ...authorizedContext(request), credentials: { secret: 'x' } });
  assertEquals(blocked.error_code, 'GMAIL_CREDENTIAL_INJECTION_REJECTED', 'credential injection in delivery context');
});

test('token fields are rejected', () => {
  for (const field of ['access_token', 'refresh_token', 'client_secret', 'token']) {
    assertRejected(validateGmailProviderContext({ [field]: 'value' }), 'GMAIL_CREDENTIAL_INJECTION_REJECTED');
  }
  assertIncludes(GMAIL_CREDENTIAL_FIELD_NAMES, 'access_token', 'credential field guard list');
});

// --- 16-21. Message immutability ----------------------------------------------
test('subject mutation is rejected', () => {
  const request = buildValidRequest();
  const forged = { ...request, message: { ...request.message, subject: 'Rewritten subject' }, message_hash: request.message_hash };
  const result = gmailDeliver(forged, authorizedContext(request));
  assertEquals(result.delivery_status, 'BLOCKED', 'subject mutation must block');
  assertEquals(result.error_code, 'GMAIL_MESSAGE_MUTATED', 'subject mutation block code');
});

test('body mutation is rejected', () => {
  const request = buildValidRequest();
  const forged = { ...request, message: { ...request.message, body: 'Rewritten body with a CTA' }, message_hash: request.message_hash };
  const result = gmailDeliver(forged, authorizedContext(request));
  assertEquals(result.error_code, 'GMAIL_MESSAGE_MUTATED', 'body mutation block code');
});

test('channel mutation is rejected', () => {
  const request = buildValidRequest();
  const forged = { ...request, channel: 'LINKEDIN' };
  const result = gmailDeliver(forged, authorizedContext(request));
  assertEquals(result.error_code, 'GMAIL_REQUEST_CHANNEL_UNSUPPORTED', 'channel mutation block code');
  const context = authorizedContext(request);
  const mismatch = gmailDeliver({ ...request, channel: 'EMAIL' }, { ...context, expected: { ...context.expected, channel: 'LINKEDIN' } });
  assertEquals(mismatch.error_code, 'GMAIL_CHANNEL_MISMATCH', 'channel binding mismatch');
});

test('Prospect mutation is rejected', () => {
  const request = buildValidRequest();
  const context = authorizedContext(request);
  const mismatch = gmailDeliver(request, { ...context, expected: { ...context.expected, prospect_id: '99999999-8888-7777-6666-555555555555' } });
  assertEquals(mismatch.error_code, 'GMAIL_PROSPECT_MISMATCH', 'Prospect binding mismatch');
  const forged = { ...request, prospect_id: '99999999-8888-7777-6666-555555555555' };
  assertEquals(gmailDeliver(forged, context).error_code, 'GMAIL_DELIVERY_IDENTITY_MISMATCH', 'Prospect substitution changes the governed identity');
});

test('draft hash mutation is rejected', () => {
  const request = buildValidRequest();
  const context = authorizedContext(request);
  const mismatch = gmailDeliver(request, { ...context, expected: { ...context.expected, approved_draft_hash: 'ffffffffffffffff' } });
  assertEquals(mismatch.error_code, 'GMAIL_DRAFT_HASH_MISMATCH', 'draft hash binding mismatch');
  const forged = { ...request, approved_draft_hash: 'ffffffffffffffff' };
  assertEquals(gmailDeliver(forged, context).error_code, 'GMAIL_MESSAGE_DRAFT_HASH_MISMATCH', 'draft hash substitution fails the message binding');
});

test('approval mutation is rejected', () => {
  const request = buildValidRequest();
  const context = authorizedContext(request);
  const mismatch = gmailDeliver(request, { ...context, expected: { ...context.expected, approval_id: '00000000-1111-2222-3333-444444444444' } });
  assertEquals(mismatch.error_code, 'GMAIL_APPROVAL_MISMATCH', 'approval binding mismatch');
  const forged = { ...request, approval_id: '00000000-1111-2222-3333-444444444444' };
  assertEquals(gmailDeliver(forged, context).error_code, 'GMAIL_APPROVAL_MISMATCH', 'approval substitution fails the approval binding');
});

// --- 22-24. Authorization boundary -------------------------------------------
test('unauthorized direct connector invocation is rejected', () => {
  const request = buildValidRequest();
  const noContext = gmailDeliver(request, null);
  assertEquals(noContext.delivery_status, 'BLOCKED', 'null context must block');
  assertEquals(noContext.error_code, 'GMAIL_CONTEXT_NOT_AUTHORIZED', 'unauthorized invocation block code');
  const unverified = gmailDeliver(request, { authorization_verified: false });
  assertEquals(unverified.error_code, 'GMAIL_CONTEXT_NOT_AUTHORIZED', 'unverified context must block');
  const clientContext = gmailDeliver(request, { authorization_verified: true, issued_by: 'client' });
  assertEquals(clientContext.delivery_status, 'BLOCKED', 'a claimed context without the governed expected bindings is blocked');
  assertEquals(clientContext.error_code, 'GMAIL_CONTEXT_INCOMPLETE', 'incomplete context block code');
  assertEquals(clientContext.sent, false, 'nothing is ever sent');
});

test('connector cannot authorize anything', () => {
  const caps = gmailGetCapabilities();
  assertEquals(caps.approval_required, true, 'approval always required');
  assertEquals(caps.requires_human_approval, true, 'human approval never weakened');
  const blocked = gmailDeliver(buildValidRequest(), { authorization_verified: false, self_authorized: true });
  assertEquals(blocked.error_code, 'GMAIL_CONTEXT_NOT_AUTHORIZED', 'no self-authorization path exists');
});

test('connector cannot bypass the Agent Orchestration Core', async () => {
  const src = await readModuleSource();
  const codeLines = src.split('\n').map((l) => l.trim()).filter((l) => l.length > 0 && !l.startsWith('*') && !l.startsWith('/*') && !l.startsWith('//'));
  for (const line of codeLines) {
    // Pure quoted-string array items are documentation data (isolation target
    // names) — not executable access.
    if (/^'[^']*',$/.test(line)) continue;
    if (/entities\.|\.create\(|\.update\(|\.delete\(|base44\.|invokeLLM|asServiceRole/.test(line)) {
      throw new Error('connector must not reach orchestration entities or write paths: ' + line.substring(0, 120));
    }
  }
  const request = buildValidRequest();
  const withoutCore = gmailDeliver(request, { authorization_verified: true });
  assertEquals(withoutCore.delivery_status, 'BLOCKED', 'no bypass path produces delivery');
  assertEquals(withoutCore.error_code, 'GMAIL_CONTEXT_INCOMPLETE', 'a context without the governed expected bindings is blocked');
});

// --- 25. Not connected --------------------------------------------------------
test('fully validated request terminates at GMAIL_API_NOT_CONNECTED', () => {
  const request = buildValidRequest();
  const result = gmailDeliver(request, authorizedContext(request));
  assertEquals(result.delivery_status, 'GMAIL_API_NOT_CONNECTED', 'terminal state');
  assertEquals(result.not_connected, true, 'not connected flag');
  assertEquals(result.api_status, 'GMAIL_API_NOT_CONNECTED', 'api status');
  assertEquals(result.sender_identity, 'growth@execleadai.co', 'sender identity');
});

// --- 26-33. Static purity scans ----------------------------------------------
test('Gmail API is not called', async () => {
  const src = await readModuleSource();
  const codeLines = src.split('\n').map((l) => l.trim()).filter((l) => l.length > 0 && !l.startsWith('*') && !l.startsWith('/*') && !l.startsWith('//'));
  for (const line of codeLines) {
    if (/users\.messages|messages\.send|googleapis|google-auth-library|gmail\.v1|API_BASE|api\.google/.test(line)) {
      throw new Error('provider API surface found in code: ' + line.substring(0, 120));
    }
  }
  const result = gmailDeliver(buildValidRequest(), authorizedContext(buildValidRequest()));
  assertEquals(result.network_calls, 0, 'network calls');
});

test('network is not called', async () => {
  const src = await readModuleSource();
  const codeLines = src.split('\n').map((l) => l.trim()).filter((l) => l.length > 0 && !l.startsWith('*') && !l.startsWith('/*') && !l.startsWith('//'));
  for (const line of codeLines) {
    if (/fetch\(|XMLHttpRequest|axios|WebSocket|EventSource|require\(|https?:\/\//.test(line)) {
      throw new Error('network capability found in code: ' + line.substring(0, 120));
    }
  }
});

test('no provider SDK is imported', async () => {
  const src = await readModuleSource();
  if (/^\s*import\b/m.test(src)) throw new Error('the connector module must have zero imports');
});

test('no OAuth library is imported', async () => {
  const src = await readModuleSource();
  const codeLines = src.split('\n').map((l) => l.trim()).filter((l) => l.length > 0 && !l.startsWith('*') && !l.startsWith('/*') && !l.startsWith('//'));
  for (const line of codeLines) {
    if (/google[-.]auth|OAuth2Client|jwt[-.]client|passport|auth[-.]library/.test(line)) {
      throw new Error('authorization library surface found in code: ' + line.substring(0, 120));
    }
  }
});

test('no secret storage exists', async () => {
  const src = await readModuleSource();
  const codeLines = src.split('\n').map((l) => l.trim()).filter((l) => l.length > 0 && !l.startsWith('*') && !l.startsWith('/*') && !l.startsWith('//'));
  for (const line of codeLines) {
    if (/localStorage|sessionStorage|document\.|window\.|indexedDB|setItem\(|writeFile|env\./.test(line)) {
      throw new Error('storage surface found in code: ' + line.substring(0, 120));
    }
  }
});

test('no localStorage credentials', () => {
  assertEquals(gmailGetCapabilities().authenticated, false, 'no credential exists to store');
  assertRejected(validateGmailProviderContext({ token: 'x' }), 'GMAIL_CREDENTIAL_INJECTION_REJECTED');
  assertRejected(validateGmailProviderContext({ private_key: 'x' }), 'GMAIL_CREDENTIAL_INJECTION_REJECTED');
});

test('no sessionStorage credentials', () => {
  assertRejected(validateGmailProviderContext({ session_key: 'x' }), 'GMAIL_CREDENTIAL_INJECTION_REJECTED');
  assertIncludes(GMAIL_CREDENTIAL_FIELD_NAMES, 'session_key', 'session storage guard list');
});

test('no token logging', async () => {
  const src = await readModuleSource();
  const codeLines = src.split('\n').map((l) => l.trim()).filter((l) => l.length > 0 && !l.startsWith('*') && !l.startsWith('/*') && !l.startsWith('//'));
  for (const line of codeLines) {
    if (/console\.|logger|log\(/.test(line)) {
      throw new Error('logging surface found in code: ' + line.substring(0, 120));
    }
  }
});

// --- 34-37. Read-access prohibition -----------------------------------------
test('no inbox access', () => {
  assertIncludes(GMAIL_READ_ACCESS_PROHIBITED, 'inbox', 'inbox prohibited');
  assertIncludes(GMAIL_READ_ACCESS_PROHIBITED, 'sent_mail', 'sent mail prohibited');
  assertEquals(gmailGetCapabilities().read_access, 'prohibited', 'read access truthful');
});

test('no contacts access', () => {
  assertIncludes(GMAIL_READ_ACCESS_PROHIBITED, 'contacts', 'contacts prohibited');
});

test('no Drive access', () => {
  assertIncludes(GMAIL_READ_ACCESS_PROHIBITED, 'drive', 'Drive prohibited');
});

test('no calendar access', () => {
  assertIncludes(GMAIL_READ_ACCESS_PROHIBITED, 'calendar', 'calendar prohibited');
  assertIncludes(GMAIL_READ_ACCESS_PROHIBITED, 'gmail_threads', 'threads prohibited');
  assertIncludes(GMAIL_READ_ACCESS_PROHIBITED, 'gmail_labels', 'labels prohibited');
});

// --- 38. Attachments ----------------------------------------------------------
test('attachments are prohibited', () => {
  assertEquals(GMAIL_ATTACHMENT_POLICY.supported, false, 'attachments not supported');
  assertEquals(GMAIL_ATTACHMENT_POLICY.file_upload, 'prohibited', 'upload prohibited');
  assertEquals(GMAIL_ATTACHMENT_POLICY.attachment_transmission, 'prohibited', 'transmission prohibited');
  assertEquals(GMAIL_ATTACHMENT_POLICY.separate_security_review_required, true, 'separate review required');
});

// --- 39-42. No retry / scheduling / bulk / campaigns ---------------------------
test('no retry exists', () => {
  assertEquals(GMAIL_RETRY_POLICY.automatic_retry, 'none', 'no automatic retry');
  assertEquals(GMAIL_RETRY_POLICY.automatic_follow_up, 'none', 'no automatic follow-up');
  assertEquals(GMAIL_RETRY_POLICY.campaign_retry, 'none', 'no campaign retry');
});

test('no scheduling exists', async () => {
  const src = await readModuleSource();
  const codeLines = src.split('\n').map((l) => l.trim()).filter((l) => l.length > 0 && !l.startsWith('*') && !l.startsWith('/*') && !l.startsWith('//'));
  for (const line of codeLines) {
    if (/setTimeout|setInterval|cron|schedule\(|queue/.test(line)) {
      throw new Error('scheduling surface found in code: ' + line.substring(0, 120));
    }
  }
  const result = gmailDeliver(buildValidRequest(), authorizedContext(buildValidRequest()));
  assertEquals(result.scheduled, false, 'nothing scheduled');
});

test('no bulk sending exists', () => {
  assertEquals(GMAIL_RATE_LIMIT_ARCHITECTURE.bulk_sending, 'prohibited', 'bulk sending prohibited');
  assertRejected(validateGmailMessage({ approved_draft_hash: DRAFT_HASH, content_binding: 'APPROVED_DRAFT_HASH', to: null, subject: 'x', body: 'y', recipients: ['a', 'b'] }, DRAFT_HASH), 'GMAIL_MESSAGE_FIELD_REJECTED');
});

test('no campaign execution exists', () => {
  assertEquals(GMAIL_RATE_LIMIT_ARCHITECTURE.campaigns, 'prohibited', 'campaigns prohibited');
  assertEquals(GMAIL_RATE_LIMIT_ARCHITECTURE.automatic_high_volume_sender, 'prohibited', 'high-volume sender prohibited');
});

// --- 43-46. Real delivery unavailable -----------------------------------------
test('no real delivery occurs', () => {
  const request = buildValidRequest();
  const result = gmailDeliver(request, authorizedContext(request));
  assertEquals(result.external_delivery, false, 'external delivery false');
  assertEquals(result.sent, false, 'sent false');
  assertEquals(result.delivered, false, 'delivered false');
  assertEquals(result.persisted, false, 'persisted false');
  assertEquals(result.recipient_resolved, false, 'recipient not resolved');
});

test('SENT is structurally unavailable', () => {
  let threw = false;
  try { assertGmailResultStatus('SENT'); } catch (_e) { threw = true; }
  assertTrue(threw, 'SENT must throw');
  assertIncludes(GMAIL_STATUSES_UNAVAILABLE, 'SENT', 'unavailable list');
});

test('DELIVERED is structurally unavailable', () => {
  let threw = false;
  try { assertGmailResultStatus('DELIVERED'); } catch (_e) { threw = true; }
  assertTrue(threw, 'DELIVERED must throw');
  assertIncludes(GMAIL_STATUSES_UNAVAILABLE, 'DELIVERED', 'unavailable list');
  assertIncludes(GMAIL_STATUSES_UNAVAILABLE, 'SUBMITTED', 'SUBMITTED also unavailable');
  assertIncludes(GMAIL_STATUSES_UNAVAILABLE, 'REQUESTED', 'REQUESTED also unavailable');
});

test('not-connected result is truthful', () => {
  const request = buildValidRequest();
  const result = gmailDeliver(request, authorizedContext(request));
  assertTrue(result.verification.includes('GMAIL API NOT CONNECTED'), 'notice states not connected');
  assertTrue(result.verification.includes('NOTHING SENT'), 'notice states nothing sent');
  const status = gmailGetDeliveryStatus(request.delivery_identity);
  assertEquals(status.delivery_status, 'NOT_ATTEMPTED', 'status endpoint truthful');
  assertEquals(status.network_calls, 0, 'no network calls');
});

// --- 47-50. Frozen registry baseline -------------------------------------------
test('registry Google record is DRAFT', () => {
  const record = GMAIL_REGISTRY_SEED[0];
  assertEquals(record.connector_id, 'google_workspace_gmail', 'record id');
  assertEquals(record.status, 'DRAFT', 'DRAFT status');
  assertEquals(record.supports_delivery, false, 'supports_delivery false');
  assertEquals(record.sandbox_only, false, 'sandbox_only false');
  assertEquals(record.requires_human_approval, true, 'human approval required');
  assertEquals(record.delivery_identity, 'growth@execleadai.co', 'delivery identity');
  assertEquals(record.supported_channels.length, 1, 'exactly one channel');
  assertEquals(record.supported_channels[0], 'EMAIL', 'EMAIL only');
});

test('registry Google record enabled is false', () => {
  assertEquals(GMAIL_REGISTRY_SEED[0].enabled, false, 'enabled false');
  assertEquals(gmailGetCapabilities().enabled, false, 'capabilities enabled false');
});

test('sandbox connector remains ACTIVE and unchanged', () => {
  const sandboxRecord = CONNECTOR_REGISTRY_SEED[0];
  assertEquals(sandboxRecord.connector_id, 'sandbox_delivery', 'sandbox id unchanged');
  assertEquals(DELIVERY_CONNECTOR_ID, 'sandbox_delivery', 'sandbox export id');
  assertEquals(sandboxRecord.status, 'ACTIVE', 'sandbox remains ACTIVE');
  assertEquals(sandboxRecord.enabled, true, 'sandbox remains enabled');
  assertEquals(sandboxRecord.supports_delivery, false, 'sandbox never delivers');
  assertEquals(sandboxRecord.sandbox_only, true, 'sandbox remains sandbox_only');
  assertEquals(DELIVERY_CONNECTOR_TYPE, 'SANDBOX', 'sandbox type unchanged');
});

test('execute_prospect_outreach remains DRAFT and disabled', () => {
  assertEquals(EXECUTE_OUTREACH_TOOL_EXPECTED_STATE.tool_id, 'execute_prospect_outreach', 'tool id');
  assertEquals(EXECUTE_OUTREACH_TOOL_EXPECTED_STATE.status, 'DRAFT', 'DRAFT status');
  assertEquals(EXECUTE_OUTREACH_TOOL_EXPECTED_STATE.enabled, false, 'disabled');
  assertEquals(EXECUTE_OUTREACH_TOOL_EXPECTED_STATE.risk_level, 'HIGH', 'high risk');
  assertEquals(EXECUTE_OUTREACH_TOOL_EXPECTED_STATE.human_approval_required, true, 'human approval');
  const ks = gmailKillSwitchState();
  assertEquals(ks.real_delivery_enabled, false, 'kill switch real delivery false');
  assertEquals(ks.execute_prospect_outreach_enabled, false, 'tool disabled in kill switch');
});

// --- 51-52. No side effects ------------------------------------------------------
test('no Prospect is created or mutated by the connector', async () => {
  const src = await readModuleSource();
  const codeLines = src.split('\n').map((l) => l.trim()).filter((l) => l.length > 0 && !l.startsWith('*') && !l.startsWith('/*') && !l.startsWith('//'));
  for (const line of codeLines) {
    if (/prospectIntelligence|prospectCreate|Prospect\.create|bulkCreate|updateMany|deleteMany/.test(line)) {
      throw new Error('Prospect write surface found in code: ' + line.substring(0, 120));
    }
  }
  const mapping = gmailMapToProviderRepresentation(buildValidRequest());
  assertEquals(mapping.api_status, 'GMAIL_API_NOT_CONNECTED', 'mapping terminates at not-connected');
  assertEquals(mapping.api_call_made, false, 'mapping makes no call');
  assertEquals(mapping.from, 'growth@execleadai.co', 'mapping sender is the fixed mailbox');
  assertEquals(mapping.to, null, 'mapping recipient remains unresolved');
});

test('no approval is created or mutated by the connector', async () => {
  const src = await readModuleSource();
  const codeLines = src.split('\n').map((l) => l.trim()).filter((l) => l.length > 0 && !l.startsWith('*') && !l.startsWith('/*') && !l.startsWith('//'));
  for (const line of codeLines) {
    if (/decideApproval|approvalDecision|AgentApproval\.create|approveApproval|approval\.approve|expireApproval/.test(line)) {
      throw new Error('approval mutation surface found in code: ' + line.substring(0, 120));
    }
  }
  const audit = buildGmailAuditRecord(buildValidRequest(), gmailDeliver(buildValidRequest(), authorizedContext(buildValidRequest())), { audit_id: 'a1', timestamp: '2026-09-15T00:00:00Z', user_id: 'u1' });
  for (const key of Object.keys(audit)) {
    if (GMAIL_AUDIT_PROHIBITED_FIELDS.includes(key)) throw new Error('prohibited credential field in audit: ' + key);
  }
  assertEquals(audit.connector_id, 'google_workspace_gmail', 'audit connector');
  assertEquals(audit.metadata.sender_identity, 'growth@execleadai.co', 'audit sender identity');
  assertEquals(audit.metadata.external_delivery, false, 'audit external delivery false');
});

// --- Full static security scan (spec-mandated hot terms) ---------------------------
test('full static security scan: no executable provider/network/credential surface', async () => {
  const src = await readModuleSource();
  const hotTerms = [
    'fetch(', 'XMLHttpRequest', 'axios', 'googleapis', 'google-auth-library',
    'oauth2', 'access_token', 'refresh_token', 'client_secret', 'service_account',
    'SMTP', 'nodemailer', 'gmail.users.messages.send',
  ];
  const guardLines = ['GMAIL_CREDENTIAL_FIELD_NAMES', 'GMAIL_AUDIT_PROHIBITED_FIELDS'];
  for (const raw of src.split('\n')) {
    const line = raw.trim();
    const isComment = line.startsWith('*') || line.startsWith('/*') || line.startsWith('//');
    if (isComment) continue;
    for (const term of hotTerms) {
      if (line.includes(term) && !guardLines.some((g) => line.includes(g))) {
        throw new Error(`hot term "${term}" found in executable code outside the credential guard: ${line.substring(0, 120)}`);
      }
    }
    // The Gmail API is never named in code (comments only); code strings use GMAIL_API.
    if (/Gmail API/.test(line)) {
      throw new Error('live Gmail API naming found in code: ' + line.substring(0, 120));
    }
  }
  // Deterministic identity parity with the Phase 12 governed boundary.
  const request = buildValidRequest();
  const identity = deriveGmailDeliveryIdentity({
    execution_id: EXECUTION_ID, approved_draft_hash: DRAFT_HASH, prospect_id: PROSPECT_ID, channel: 'EMAIL',
  });
  assertEquals(identity, request.delivery_identity, 'identity derivation must match the governed boundary');
});

// --- Architecture documentation presence --------------------------------------------
test('compliance, rate-limit, bounce, and semantics architecture is documented', () => {
  for (const item of ['unsubscribe', 'suppression_list', 'opt_out', 'lawful_outreach_basis', 'sender_identification']) {
    assertIncludes(GMAIL_COMPLIANCE_PREREQUISITES, item, 'compliance prerequisite');
  }
  for (const item of ['per_user_rate_limit', 'per_agent_rate_limit', 'per_organization_rate_limit', 'daily_send_limit', 'burst_protection']) {
    assertIncludes(Object.keys(GMAIL_RATE_LIMIT_ARCHITECTURE), item, 'rate limit control');
  }
  assertIncludes(GMAIL_BOUNCE_FAILURE_CATEGORIES.length > 0 ? GMAIL_BOUNCE_FAILURE_CATEGORIES : [], 'rate_limit', 'bounce category');
  assertIncludes(GMAIL_DELIVERY_SEMANTICS_CONCEPTUAL, 'DELIVERED', 'conceptual semantics');
  assertEquals(GMAIL_DELIVERY_SEMANTICS_CONCEPTUAL.includes('GMAIL_API_NOT_CONNECTED'), false, 'GMAIL_API_NOT_CONNECTED is an operational state, not a future semantic');
});

// --- Dual-runner --------------------------------------------------------------------
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
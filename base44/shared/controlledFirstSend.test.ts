// ============================================================
// Phase 14F — Controlled First-Send deterministic test suite
// Dual runner: Deno.test under Deno, sequential under plain Node.
// All tests are local/deterministic — NO network, NO database, NO LLM,
// NO real provider invocation, NO production records touched. The
// existing PENDING approval 786e0b21-efa2-4830-b0c9-7ebbb2a03aea is
// never read, referenced, or mutated by this suite.
// Run: node --experimental-strip-types base44/shared/controlledFirstSend.test.ts
// ============================================================
import {
  FIRST_SEND_BOUNDARY_VERSION,
  FIRST_SEND_AGENT_ID,
  FIRST_SEND_TOOL_ID,
  FIRST_SEND_CHANNEL,
  FIRST_SEND_CONNECTOR_ID,
  FIRST_SEND_SENDER_IDENTITY,
  FIRST_SEND_CONNECTOR_IDENTITY,
  FIRST_SEND_GMAIL_SCOPE,
  FIRST_SEND_CONTROLLED_TEST_MARKER,
  FIRST_SEND_OPERATOR_ROLES,
  FIRST_SEND_PRE_SEND_CHECKLIST,
  FIRST_SEND_CHECKS_TOTAL,
  deriveFirstSendDraftHash,
  deriveFirstSendDeliveryIdentity,
  deriveFirstSendMessageHash,
  validateFirstSendInput,
  validateFirstSendDraftContent,
  resolveFirstSendRecipient,
  buildFirstSendGovernedRequest,
  evaluateFirstSendPreconditions,
  getFirstSendBoundaryStatus,
} from './controlledFirstSend.ts';
import {
  validateGovernedRealDeliveryRequest,
  deriveRealDeliveryIdentity,
  deriveRealDeliveryMessageHash,
} from './gmailDeliveryBoundary.ts';
import {
  getGmailConnectorCredentialStatus,
  acquireGmailConnectorTokenContext,
  GMAIL_CONNECTOR_EXPECTED_IDENTITY,
  GMAIL_SENDER_IDENTITY,
  GMAIL_CONNECTOR_REQUIRED_SCOPE,
} from './gmailConnectorCredentialProvider.ts';

const isDeno = typeof Deno !== 'undefined' && typeof Deno.test === 'function';
const cases = [];
function test(name, fn) { cases.push([name, fn]); }
function assert(cond, label) { if (!cond) throw new Error('FAILED: ' + label); }

const PROSPECT_ID = '11111111-2222-3333-4444-555555555555';
const CONTACT_ID = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
const APPROVAL_ID = '99999999-8888-7777-6666-555555555555';
const EXECUTION_ID = '12345678-1234-1234-1234-123456789012';
const CALLER_ID = 'op-0000001-0000-0000-0000-000000000001';
const APPROVER_ID = 'op-0000002-0000-0000-0000-000000000002';
const OTHER_USER_ID = 'ux-999999-9999-9999-9999-999999999999';
const ORG_ID = 'org-00001-0000-0000-0000-000000000001';
const NOW = '2026-09-15T10:00:00Z';
const SUBJECT = 'EXECLEAD.AI CONTROLLED DELIVERY TEST — verifying the governed Gmail delivery path';
const BODY = 'This is a controlled delivery test message from the EXECLEAD.AI Growth mailbox. It was sent through the governed, human-approved delivery pipeline to verify email delivery configuration end-to-end. No action is requested. This is the only message in this test; no follow-up will be sent. — EXECLEAD.AI';
const IDEMPOTENCY = 'firstsend-op-1-20260915';
const DRAFT_HASH = deriveFirstSendDraftHash(SUBJECT, BODY);
const CORRELATION = 'wf14f:' + CALLER_ID + ':' + APPROVAL_ID;

const GATEWAY = {
  connector_available: true,
  connected_identity: GMAIL_CONNECTOR_EXPECTED_IDENTITY,
  granted_scopes: [GMAIL_CONNECTOR_REQUIRED_SCOPE, 'email'],
  connector_token: 'deterministic-test-connector-token',
  retrieval_status: 'ok',
};

function validInput() {
  return {
    prospect_id: PROSPECT_ID,
    recipient_contact_id: CONTACT_ID,
    draft_subject: SUBJECT,
    draft_body: BODY,
    idempotency_key: IDEMPOTENCY,
  };
}

function validRequest() {
  const built = buildFirstSendGovernedRequest({
    prospect_id: PROSPECT_ID,
    approval_id: APPROVAL_ID,
    execution_id: EXECUTION_ID,
    correlation_id: CORRELATION,
    recipient_contact_id: CONTACT_ID,
    approved_draft_hash: DRAFT_HASH,
    subject: SUBJECT,
    body: BODY,
  });
  assert(built.ok, 'fixture: governed request must build');
  return built.request;
}

function validContact() {
  return {
    contact_id: CONTACT_ID,
    prospect_id: PROSPECT_ID,
    contact_type: 'EMAIL',
    contact_value: 'authorized.test.recipient@example.com',
    verification_status: 'VERIFIED',
    is_primary: true,
    verified_by: 'verifier-user-1',
    verified_at: '2026-09-01T00:00:00Z',
  };
}

function baseState(overrides) {
  const state = {
    authenticated_caller: { user_id: CALLER_ID, role: 'platform_admin', organization_id: ORG_ID },
    request: validRequest(),
    orchestration_config: { stop_new_executions: false, max_risk_level: 'medium' },
    tool_registry_record: { tool_id: FIRST_SEND_TOOL_ID, status: 'ACTIVE', enabled: true, risk_level: 'high' },
    connector_registry_record: { connector_id: FIRST_SEND_CONNECTOR_ID, status: 'ACTIVE', enabled: true, supports_delivery: true },
    global_real_delivery_record: { real_delivery_enabled: true },
    approval_record: {
      approval_id: APPROVAL_ID,
      user_id: CALLER_ID,
      status: 'APPROVED',
      expires_at: '2027-01-01T00:00:00Z',
      approver_user_id: APPROVER_ID,
      source: 'agent_orchestration_service',
      agent_id: FIRST_SEND_AGENT_ID,
      tool_id: FIRST_SEND_TOOL_ID,
      metadata: {
        prospect_id: PROSPECT_ID,
        recipient_contact_id: CONTACT_ID,
        approved_draft_hash: DRAFT_HASH,
        prospect_status: 'QUALIFIED',
        input_hash: IDEMPOTENCY,
      },
    },
    prospect_record: {
      prospect_id: PROSPECT_ID,
      owner_user_id: CALLER_ID,
      organization_id: ORG_ID,
      status: 'QUALIFIED',
    },
    verified_contact_record: validContact(),
    declared_sender: FIRST_SEND_SENDER_IDENTITY,
    credential_status: getGmailConnectorCredentialStatus(GATEWAY),
    prior_delivery_results: [],
    prior_real_sent_results: [],
    approval_already_executed: false,
    now: NOW,
  };
  return overrides ? Object.assign({}, state, overrides) : state;
}

function check(state) {
  const result = evaluateFirstSendPreconditions(state);
  return { pass: result.ok === true, code: result.error_code || null, result };
}

// ── Contract sanity ──
test('boundary constants are fixed and truthful', () => {
  assert(FIRST_SEND_BOUNDARY_VERSION === '14F.1.0.0', 'version');
  assert(FIRST_SEND_AGENT_ID === 'growth_agent', 'agent id');
  assert(FIRST_SEND_TOOL_ID === 'execute_prospect_outreach', 'tool id');
  assert(FIRST_SEND_SENDER_IDENTITY === GMAIL_SENDER_IDENTITY, 'sender parity with 14C');
  assert(FIRST_SEND_CONNECTOR_IDENTITY === GMAIL_CONNECTOR_EXPECTED_IDENTITY, 'identity parity with 14C');
  assert(FIRST_SEND_GMAIL_SCOPE === GMAIL_CONNECTOR_REQUIRED_SCOPE, 'scope parity with 14C');
  assert(FIRST_SEND_OPERATOR_ROLES.length === 3, 'operator roles');
  assert(FIRST_SEND_PRE_SEND_CHECKLIST.length === FIRST_SEND_CHECKS_TOTAL, 'checklist has 30 documented checks');
  const status = getFirstSendBoundaryStatus();
  assert(status.email_sent_by_this_module === false, 'module never sends');
  assert(status.network_calls === 0, 'no network surface');
});

// ── Input contract (operator authorization, bulk, Gmail-bypass directives) ──
test('valid operator input validates and derives the draft hash', () => {
  const v = validateFirstSendInput(validInput());
  assert(v.ok, 'valid input passes');
  assert(v.input.prospect_id === PROSPECT_ID, 'prospect echoed');
  assert(v.input.draft_hash === DRAFT_HASH, 'draft hash derived');
});

test('operator authorization fields are structurally unavailable on input', () => {
  for (const banned of ['user_id', 'owner_user_id', 'organization_id', 'role', 'agent_id', 'tool_id']) {
    const v = validateFirstSendInput(Object.assign(validInput(), { [banned]: 'x' }));
    assert(!v.ok, 'banned: ' + banned);
    assert(v.error_code === 'FIRST_SEND_INPUT_FIELD_REJECTED', 'code: ' + banned);
  }
});

test('client delivery directives are rejected (bulk, cc/bcc, recipients, provider params, scheduling)', () => {
  const banned = ['to', 'recipients', 'recipient_emails', 'cc', 'bcc', 'from', 'sender_email',
    'attachments', 'provider_id', 'api_parameters', 'schedule', 'send_at', 'retry',
    'batch', 'campaign', 'count'];
  for (const key of banned) {
    const v = validateFirstSendInput(Object.assign(validInput(), { [key]: 'x' }));
    assert(!v.ok, 'directive rejected: ' + key);
    assert(v.error_code === 'GATE_CLIENT_DELIVERY_PARAMETERS_REJECTED', 'directive code: ' + key);
  }
});

test('bulk-send attempts are rejected (arrays, multiple recipients)', () => {
  for (const bad of [
    [validInput()], 'string', 42, true,
    Object.assign(validInput(), { recipients: ['a@example.com', 'b@example.com'] }),
  ]) {
    const v = validateFirstSendInput(bad);
    assert(!v.ok, 'bulk shape rejected: ' + JSON.stringify(bad).substring(0, 40));
  }
});

test('malformed identifiers and idempotency keys are rejected', () => {
  for (const patch of [
    { prospect_id: 'not-a-uuid' }, { prospect_id: '' },
    { recipient_contact_id: 'x' }, { recipient_contact_id: null },
    { idempotency_key: 'short' }, { idempotency_key: '' }, { idempotency_key: 'bad key with spaces!' },
  ]) {
    const v = validateFirstSendInput(Object.assign(validInput(), patch));
    assert(!v.ok, 'rejected: ' + JSON.stringify(patch));
    assert(v.error_code === 'FIRST_SEND_INPUT_INVALID', 'code: ' + JSON.stringify(patch));
  }
});

test('the controlled test marker is mandatory in the draft subject', () => {
  const v = validateFirstSendInput(Object.assign(validInput(), { draft_subject: 'Hello there' }));
  assert(!v.ok, 'unmarked subject rejected');
  assert(v.error_code === 'FIRST_SEND_CONTROLLED_MARKER_REQUIRED', 'marker code');
  const w = validateFirstSendDraftContent(SUBJECT, BODY);
  assert(w.ok, 'marked content passes');
});

test('draft bounds and control characters are enforced', () => {
  assert(!validateFirstSendDraftContent('', BODY).ok, 'empty subject');
  assert(!validateFirstSendDraftContent('x'.repeat(201), BODY).ok, 'long subject');
  assert(!validateFirstSendDraftContent(SUBJECT, '').ok, 'empty body');
  assert(!validateFirstSendDraftContent(SUBJECT, 'x'.repeat(2001)).ok, 'long body');
  assert(!validateFirstSendDraftContent(SUBJECT + String.fromCharCode(3), BODY).ok, 'control char subject');
  assert(!validateFirstSendDraftContent(SUBJECT, BODY + String.fromCharCode(31)).ok, 'control char body');
  assert(!validateFirstSendDraftContent(SUBJECT + '\n', BODY).ok, 'newline in subject still rejected (header-injection defense)');
  assert(validateFirstSendDraftContent(SUBJECT, BODY + '\nSecond paragraph.\r\n').ok, 'line breaks permitted in draft body');
});

test('credential material may never enter the draft content', () => {
  for (const leak of [
    'token: ya29.a0ARrdaM-abcdef123456',
    'key: AIzaSyA1234567890abcdefghij',
    'Authorization: Bearer abcdefghijklmnopqrstuvwxyz123456',
    'client_secret "abc123"',
  ]) {
    const v = validateFirstSendDraftContent(SUBJECT, BODY + ' ' + leak);
    assert(!v.ok, 'leak rejected: ' + leak.substring(0, 30));
    assert(v.error_code === 'FIRST_SEND_CREDENTIAL_LEAK_REJECTED', 'leak code');
  }
});

test('draft hash is deterministic and content-bound', () => {
  assert(deriveFirstSendDraftHash(SUBJECT, BODY) === DRAFT_HASH, 'deterministic');
  assert(deriveFirstSendDraftHash(SUBJECT, BODY + 'x') !== DRAFT_HASH, 'body-bound');
  assert(/^[0-9a-f]{8}$/.test(DRAFT_HASH), '8 lowercase hex — satisfies the 14D draft-hash contract');
});

// ── Parity with the authoritative Phase 14D boundary ──
test('the built governed request passes the 14D delivery request contract', () => {
  const request = validRequest();
  const v = validateGovernedRealDeliveryRequest(request);
  assert(v.ok, '14D contract accepts the 14F request: ' + JSON.stringify(v).substring(0, 200));
  assert(v.normalized.approved_draft_hash === DRAFT_HASH, 'draft hash bound');
  assert(v.normalized.message.to === null, 'recipient is server-resolved only');
});

test('delivery identity and message hash derivations match the 14D boundary', () => {
  const request = validRequest();
  assert(deriveRealDeliveryIdentity({
    execution_id: request.execution_id,
    approved_draft_hash: request.approved_draft_hash,
    prospect_id: request.prospect_id,
    channel: request.channel,
  }) === request.delivery_identity, 'identity parity');
  assert(deriveRealDeliveryMessageHash(request.message) === request.message_hash, 'message hash parity');
});

test('governed request builder rejects injected parts', () => {
  const bad = buildFirstSendGovernedRequest(Object.assign({
    prospect_id: PROSPECT_ID, approval_id: APPROVAL_ID, execution_id: EXECUTION_ID,
    correlation_id: CORRELATION, recipient_contact_id: CONTACT_ID,
    approved_draft_hash: DRAFT_HASH, subject: SUBJECT, body: BODY,
  }, { to: 'attacker@example.com' }));
  assert(!bad.ok, 'client recipient part rejected');
});

// ── The 30-point checklist: happy path ──
test('a fully valid server state passes all 30 checks', () => {
  const { pass, code, result } = check(baseState());
  assert(pass, 'happy path passes, got: ' + code);
  assert(result.checks_passed === FIRST_SEND_CHECKS_TOTAL, '30 checks');
  assert(result.recipient.email === 'authorized.test.recipient@example.com', 'recipient resolved');
  assert(result.sender_identity === FIRST_SEND_SENDER_IDENTITY, 'sender fixed');
});

// ── Checks 1/2: caller and operator authorization ──
test('unauthenticated callers fail closed', () => {
  for (const bad of [null, {}, { role: 'platform_admin' }]) {
    const r = evaluateFirstSendPreconditions(baseState({ authenticated_caller: bad }));
    assert(!r.ok, 'caller rejected');
    assert(r.error_code === 'FIRST_SEND_CALLER_NOT_AUTHENTICATED', 'code');
  }
});

test('non-operator roles are refused (operator authorization)', () => {
  for (const role of ['user', 'admin', 'developer', 'support', 'sales', 'enterprise_admin']) {
    const state = baseState();
    state.authenticated_caller = Object.assign({}, state.authenticated_caller, { role });
    const r = evaluateFirstSendPreconditions(state);
    assert(!r.ok, 'role refused: ' + role);
    assert(r.error_code === 'FIRST_SEND_OPERATOR_UNAUTHORIZED', 'code: ' + role);
  }
});

// ── Checks 3: governed request shape ──
test('a malformed or client-parameterized request fails closed', () => {
  const injected = Object.assign({}, validRequest(), { cc: 'x@example.com' });
  assert(!evaluateFirstSendPreconditions(baseState({ request: injected })).ok, 'cc injected');
  const recipientInjected = Object.assign({}, validRequest(), { message: Object.assign({}, validRequest().message, { to: 'x@example.com' }) });
  const r = evaluateFirstSendPreconditions(baseState({ request: recipientInjected }));
  assert(!r.ok, 'client recipient rejected');
  assert(r.error_code === 'GATE_CLIENT_DELIVERY_PARAMETERS_REJECTED', 'recipient code');
  assert(!evaluateFirstSendPreconditions(baseState({ request: null })).ok, 'missing request');
});

// ── Checks 4-6: orchestration stop and risk gate ──
test('the orchestration emergency stop halts the first send', () => {
  const r = evaluateFirstSendPreconditions(baseState({ orchestration_config: { stop_new_executions: true, max_risk_level: 'medium' } }));
  assert(!r.ok && r.error_code === 'FIRST_SEND_ORCHESTRATION_STOPPED', 'stopped');
  const missing = evaluateFirstSendPreconditions(baseState({ orchestration_config: null }));
  assert(!missing.ok && missing.error_code === 'FIRST_SEND_ORCHESTRATION_STOPPED', 'missing config fails closed');
});

test('a changed risk threshold halts the first send (risk gate)', () => {
  for (const level of ['high', 'critical', 'low']) {
    const r = evaluateFirstSendPreconditions(baseState({ orchestration_config: { stop_new_executions: false, max_risk_level: level } }));
    assert(!r.ok, 'threshold halts: ' + level);
    assert(r.error_code === 'FIRST_SEND_RISK_THRESHOLD_CHANGED', 'code: ' + level);
  }
  // The MEDIUM threshold is exactly what keeps the HIGH-risk agent path blocked.
  const cfg = baseState().orchestration_config;
  assert(cfg.max_risk_level === 'medium', 'fixture threshold is medium');
});

// ── Check 7: governed tool activation (current production state blocks) ──
test('a DRAFT or disabled execute_prospect_outreach tool blocks the first send', () => {
  for (const patch of [
    { status: 'DRAFT', enabled: false }, { status: 'ACTIVE', enabled: false }, { status: 'DRAFT', enabled: true },
  ]) {
    const state = baseState();
    state.tool_registry_record = Object.assign({}, state.tool_registry_record, patch);
    const r = evaluateFirstSendPreconditions(state);
    assert(!r.ok, 'tool state blocks: ' + JSON.stringify(patch));
    assert(r.error_code === 'FIRST_SEND_TOOL_NOT_ACTIVE', 'code: ' + JSON.stringify(patch));
  }
  const missing = evaluateFirstSendPreconditions(baseState({ tool_registry_record: null }));
  assert(!missing.ok && missing.error_code === 'FIRST_SEND_TOOL_NOT_ACTIVE', 'missing tool record blocks');
});

// ── Checks 8-11: connector registry and global activation (current state blocks) ──
test('a missing or disabled Gmail connector blocks the first send', () => {
  const missing = evaluateFirstSendPreconditions(baseState({ connector_registry_record: null }));
  assert(!missing.ok && missing.error_code === 'GATE_CONNECTOR_MISSING', 'missing registry record');
  for (const patch of [
    { status: 'DRAFT', enabled: false, supports_delivery: true },
    { status: 'ACTIVE', enabled: false, supports_delivery: true },
    { status: 'ACTIVE', enabled: true, supports_delivery: false },
  ]) {
    const state = baseState();
    state.connector_registry_record = Object.assign({}, state.connector_registry_record, patch);
    const r = evaluateFirstSendPreconditions(state);
    assert(!r.ok, 'connector state blocks: ' + JSON.stringify(patch));
    assert(r.error_code === 'GATE_CONNECTOR_DISABLED', 'code: ' + JSON.stringify(patch));
  }
});

test('the global real-delivery permission must be explicitly enabled', () => {
  const off = evaluateFirstSendPreconditions(baseState({ global_real_delivery_record: { real_delivery_enabled: false } }));
  assert(!off.ok && off.error_code === 'GATE_REAL_DELIVERY_DISABLED', 'disabled');
  const missing = evaluateFirstSendPreconditions(baseState({ global_real_delivery_record: null }));
  assert(!missing.ok && missing.error_code === 'GATE_REAL_DELIVERY_DISABLED', 'missing fails closed');
});

// ── Checks 12-18: approval required, status, expiry, single-use, self-approval ──
test('a missing or mismatched approval fails closed (approval required)', () => {
  const missing = evaluateFirstSendPreconditions(baseState({ approval_record: null }));
  assert(!missing.ok && missing.error_code === 'GATE_APPROVAL_MISSING', 'missing approval');
  const state = baseState();
  state.approval_record = Object.assign({}, state.approval_record, { approval_id: '00000000-0000-0000-0000-000000000000' });
  const r = evaluateFirstSendPreconditions(state);
  assert(!r.ok && r.error_code === 'GATE_APPROVAL_MISMATCH', 'mismatched approval');
});

test('a PENDING approval fails closed — nothing executes before decision', () => {
  const state = baseState();
  state.approval_record = Object.assign({}, state.approval_record, { status: 'PENDING', approver_user_id: null });
  const r = evaluateFirstSendPreconditions(state);
  assert(!r.ok, 'pending blocks');
  assert(r.error_code === 'GATE_APPROVAL_NOT_APPROVED', 'pending code');
  const rejected = baseState();
  rejected.approval_record = Object.assign({}, rejected.approval_record, { status: 'REJECTED' });
  assert(!evaluateFirstSendPreconditions(rejected).ok, 'rejected blocks');
});

test('an expired approval fails closed', () => {
  const state = baseState();
  state.approval_record = Object.assign({}, state.approval_record, { expires_at: '2026-09-15T09:59:59Z' });
  const r = evaluateFirstSendPreconditions(state);
  assert(!r.ok && r.error_code === 'GATE_APPROVAL_EXPIRED', 'expired');
  const fresh = baseState();
  fresh.approval_record = Object.assign({}, fresh.approval_record, { expires_at: '2026-09-15T10:00:01Z' });
  assert(evaluateFirstSendPreconditions(fresh).ok, 'unexpired passes');
});

test('a consumed approval is single-use (already executed)', () => {
  for (const patch of [
    { approval_already_executed: true },
  ]) {
    const r = evaluateFirstSendPreconditions(baseState(patch));
    assert(!r.ok, 'single-use blocks');
    assert(r.error_code === 'GATE_APPROVAL_ALREADY_EXECUTED', 'code');
  }
  const state = baseState();
  state.approval_record = Object.assign({}, state.approval_record, {
    metadata: Object.assign({}, state.approval_record.metadata, { executed_execution_id: 'e-1' }),
  });
  const r2 = evaluateFirstSendPreconditions(state);
  assert(!r2.ok && r2.error_code === 'GATE_APPROVAL_ALREADY_EXECUTED', 'metadata executed marker blocks');
});

test('self-approval is prohibited', () => {
  const state = baseState();
  state.approval_record = Object.assign({}, state.approval_record, { approver_user_id: CALLER_ID });
  const r = evaluateFirstSendPreconditions(state);
  assert(!r.ok && r.error_code === 'GATE_APPROVAL_SELF_APPROVED', 'self-approved');
  const none = baseState();
  none.approval_record = Object.assign({}, none.approval_record, { approver_user_id: null });
  assert(!evaluateFirstSendPreconditions(none).ok, 'missing approver blocks');
});

test('only server-issued approvals with the exact capability may authorize', () => {
  const foreign = baseState();
  foreign.approval_record = Object.assign({}, foreign.approval_record, { source: 'client' });
  const r = evaluateFirstSendPreconditions(foreign);
  assert(!r.ok && r.error_code === 'FIRST_SEND_APPROVAL_PROVENANCE_INVALID', 'provenance');
  for (const patch of [
    { agent_id: 'other_agent' }, { tool_id: 'some_other_tool' },
  ]) {
    const state = baseState();
    state.approval_record = Object.assign({}, state.approval_record, patch);
    const bad = evaluateFirstSendPreconditions(state);
    assert(!bad.ok, 'capability mismatch blocks: ' + JSON.stringify(patch));
    assert(bad.error_code === 'FIRST_SEND_APPROVAL_CAPABILITY_MISMATCH', 'code: ' + JSON.stringify(patch));
  }
});

test('an approval bound to a different user fails closed (cross-user protection)', () => {
  const state = baseState();
  state.approval_record = Object.assign({}, state.approval_record, { user_id: OTHER_USER_ID });
  const r = evaluateFirstSendPreconditions(state);
  assert(!r.ok, 'cross-user approval blocks');
  assert(r.error_code === 'FIRST_SEND_APPROVAL_USER_MISMATCH', 'code');
});

// ── Checks 21-23: exact Prospect / contact / draft-hash bindings ──
test('exact Prospect binding is enforced (no substitution after approval)', () => {
  const state = baseState();
  state.approval_record = Object.assign({}, state.approval_record, {
    metadata: Object.assign({}, state.approval_record.metadata, { prospect_id: '22222222-3333-4444-5555-666666666666' }),
  });
  const r = evaluateFirstSendPreconditions(state);
  assert(!r.ok && r.error_code === 'FIRST_SEND_PROSPECT_APPROVAL_MISMATCH', 'prospect binding');
});

test('exact ProspectContact binding is enforced (no recipient substitution)', () => {
  const state = baseState();
  state.approval_record = Object.assign({}, state.approval_record, {
    metadata: Object.assign({}, state.approval_record.metadata, { recipient_contact_id: 'bbbbbbbb-cccc-dddd-eeee-ffffffffff01' }),
  });
  const r = evaluateFirstSendPreconditions(state);
  assert(!r.ok, 'contact binding blocks');
  assert(r.error_code === 'GATE_APPROVAL_CONTACT_MISMATCH', 'code');
});

test('draft-hash substitution is blocked', () => {
  const state = baseState();
  state.approval_record = Object.assign({}, state.approval_record, {
    metadata: Object.assign({}, state.approval_record.metadata, { approved_draft_hash: deriveFirstSendDraftHash('EXECLEAD.AI CONTROLLED DELIVERY TEST — tampered', BODY) }),
  });
  const r = evaluateFirstSendPreconditions(state);
  assert(!r.ok && r.error_code === 'GATE_APPROVAL_DRAFT_HASH_MISMATCH', 'draft hash binding');
});

// ── Checks 24-27: Prospect existence, ownership, status ──
test('a missing Prospect fails closed', () => {
  const r = evaluateFirstSendPreconditions(baseState({ prospect_record: null }));
  assert(!r.ok && r.error_code === 'GATE_PROSPECT_MISSING', 'missing prospect');
});

test('cross-user and cross-tenant Prospect access is blocked', () => {
  const state = baseState();
  state.prospect_record = Object.assign({}, state.prospect_record, { owner_user_id: OTHER_USER_ID, organization_id: 'org-other' });
  const r = evaluateFirstSendPreconditions(state);
  assert(!r.ok, 'cross-user/tenant blocks');
  assert(r.error_code === 'GATE_PROSPECT_OWNERSHIP_MISMATCH', 'code');
  const tenantOnly = baseState();
  tenantOnly.prospect_record = Object.assign({}, tenantOnly.prospect_record, { owner_user_id: OTHER_USER_ID, organization_id: ORG_ID });
  assert(evaluateFirstSendPreconditions(tenantOnly).ok, 'tenant match passes (parity with the 14D ownership boundary)');
});

test('only QUALIFIED or PURSUING Prospects are eligible', () => {
  for (const status of ['NEW', 'DISQUALIFIED', 'CONVERTED']) {
    const state = baseState();
    state.prospect_record = Object.assign({}, state.prospect_record, { status });
    state.approval_record = Object.assign({}, state.approval_record, {
      metadata: Object.assign({}, state.approval_record.metadata, { prospect_status: status }),
    });
    const r = evaluateFirstSendPreconditions(state);
    assert(!r.ok, 'ineligible status blocks: ' + status);
    assert(r.error_code === 'GATE_PROSPECT_STATUS_INELIGIBLE', 'code: ' + status);
  }
  for (const status of ['QUALIFIED', 'PURSUING']) {
    const state = baseState();
    state.prospect_record = Object.assign({}, state.prospect_record, { status });
    state.approval_record = Object.assign({}, state.approval_record, {
      metadata: Object.assign({}, state.approval_record.metadata, { prospect_status: status }),
    });
    assert(evaluateFirstSendPreconditions(state).ok, 'eligible status passes: ' + status);
  }
});

test('a Prospect status that changed since approval makes the approval stale', () => {
  const state = baseState();
  state.prospect_record = Object.assign({}, state.prospect_record, { status: 'PURSUING' });
  const r = evaluateFirstSendPreconditions(state);
  assert(!r.ok, 'stale approval blocks');
  assert(r.error_code === 'FIRST_SEND_PROSPECT_STATUS_CHANGED', 'code');
});

// ── Check 28: recipient resolution (VERIFIED primary EMAIL contact) ──
test('recipient resolution fails closed without a verified primary contact', () => {
  const prospect = baseState().prospect_record;
  const noContact = resolveFirstSendRecipient(prospect, null);
  assert(!noContact.ok && noContact.error_code === 'GMAIL_RECIPIENT_NOT_VERIFIED', 'no contact');
  for (const patch of [
    { verification_status: 'UNVERIFIED' }, { verification_status: 'REVOKED' },
    { is_primary: false }, { contact_type: 'PHONE' },
    { verified_by: '' }, { verified_by: null }, { verified_at: 'x' },
    { contact_value: 'not-an-email' }, { contact_value: FIRST_SEND_SENDER_IDENTITY },
    { prospect_id: '22222222-3333-4444-5555-666666666666' },
    { contact_id: 'not-a-uuid' },
  ]) {
    const r = resolveFirstSendRecipient(prospect, Object.assign(validContact(), patch));
    assert(!r.ok, 'contact rejected: ' + JSON.stringify(patch).substring(0, 60));
  }
  assert(!resolveFirstSendRecipient(null, validContact()).ok, 'missing prospect rejected');
  const extra = Object.assign(validContact(), { secret: 'x' });
  assert(!resolveFirstSendRecipient(prospect, extra).ok, 'contract-extra field rejected');
  const ok = resolveFirstSendRecipient(prospect, validContact());
  assert(ok.ok && ok.recipient.contact_id === CONTACT_ID, 'valid contact resolves');
});

test('a contact field outside the verified contract is rejected', () => {
  const state = baseState();
  state.verified_contact_record = Object.assign(validContact(), { unexpected: 'field' });
  const r = evaluateFirstSendPreconditions(state);
  assert(!r.ok && r.error_code === 'GMAIL_CONTACT_FIELD_REJECTED', 'extra field');
});

// ── Check 29: recipient substitution ──
test('a resolved contact that differs from the approved contact blocks (recipient substitution)', () => {
  const state = baseState();
  state.verified_contact_record = Object.assign(validContact(), {
    contact_id: 'cccccccc-dddd-eeee-ffff-000000000002',
  });
  state.request = Object.assign({}, validRequest()); // still bound to CONTACT_ID
  const r = evaluateFirstSendPreconditions(state);
  assert(!r.ok, 'substitution blocks');
  assert(r.error_code === 'GMAIL_RECIPIENT_CONTACT_MISMATCH', 'code');
});

// ── Check 30: credentials, sender, idempotency, one-send, client parameters ──
test('an unavailable Gmail connector credential fails closed', () => {
  const state = baseState();
  state.credential_status = getGmailConnectorCredentialStatus(null);
  const r = evaluateFirstSendPreconditions(state);
  assert(!r.ok, 'unavailable credential blocks');
  assert(r.error_code === 'GMAIL_CONNECTOR_UNAVAILABLE', 'code');
});

test('connector identity, scope, and sender substitution are blocked', () => {
  for (const patch of [
    { expected_identity: 'someone-else@gmail.com' },
    { sender_identity: 'other.mailbox@execleadai.co' },
    { required_scope: 'https://www.googleapis.com/auth/gmail.compose' },
  ]) {
    const state = baseState();
    state.credential_status = Object.assign({}, state.credential_status, patch);
    const r = evaluateFirstSendPreconditions(state);
    assert(!r.ok, 'credential substitution blocks: ' + JSON.stringify(patch));
  }
  const state = baseState();
  state.declared_sender = 'attacker@evil.example';
  const r = evaluateFirstSendPreconditions(state);
  assert(!r.ok && r.error_code === 'GATE_SENDER_IDENTITY_REJECTED', 'declared sender substitution');
});

test('the 14C credential boundary itself rejects gateway and directive injection', () => {
  const leaked = Object.assign({}, GATEWAY, { injected: 'field' });
  assert(!acquireGmailConnectorTokenContext({ requested_sender: FIRST_SEND_SENDER_IDENTITY }, leaked).ok, 'gateway injection');
  assert(!acquireGmailConnectorTokenContext({ to: 'x@example.com' }, GATEWAY).ok, 'client directive');
  assert(!acquireGmailConnectorTokenContext({ access_token: 'abc' }, GATEWAY).ok, 'credential injection');
  const ctx = acquireGmailConnectorTokenContext({ requested_sender: FIRST_SEND_SENDER_IDENTITY }, GATEWAY);
  assert(ctx.ok && ctx.sender_identity === FIRST_SEND_SENDER_IDENTITY && ctx.scope === FIRST_SEND_GMAIL_SCOPE, 'valid acquisition');
  const status = getGmailConnectorCredentialStatus(GATEWAY);
  assert(status.connected === true && status.token_in_status.indexOf('none') === 0, 'sanitized status never carries the token');
});

test('idempotency: a prior success for this delivery identity blocks replay', () => {
  const state = baseState({ prior_delivery_results: ['SENT'] });
  const r = evaluateFirstSendPreconditions(state);
  assert(!r.ok && r.error_code === 'GATE_DELIVERY_ALREADY_SUCCEEDED', 'prior success');
});

test('one-send structural limit: any completed first send halts all further sends', () => {
  const other = baseState({
    prior_real_sent_results: [{ delivery_identity: 'some-other-identity', result_status: 'SENT' }],
  });
  const r = evaluateFirstSendPreconditions(other);
  assert(!r.ok && r.error_code === 'FIRST_SEND_ALREADY_COMPLETED', 'different identity');
  const own = baseState({
    prior_real_sent_results: [{ delivery_identity: validRequest().delivery_identity, result_status: 'SENT' }],
  });
  const replay = evaluateFirstSendPreconditions(own);
  assert(!replay.ok && replay.replay === true && replay.error_code === 'FIRST_SEND_REPLAY', 'same identity replays stored result');
});

test('client delivery parameters on the request fail the final scan', () => {
  const injected = Object.assign({}, validRequest(), { attachments: ['a.pdf'] });
  const r = evaluateFirstSendPreconditions(baseState({ request: injected }));
  assert(!r.ok && r.error_code === 'GATE_CLIENT_DELIVERY_PARAMETERS_REJECTED', 'attachment directive');
  const msgInjected = Object.assign({}, validRequest(), { message: Object.assign({}, validRequest().message, { bcc: 'x@example.com' }) });
  const r2 = evaluateFirstSendPreconditions(baseState({ request: msgInjected }));
  assert(!r2.ok && r2.error_code === 'GATE_CLIENT_DELIVERY_PARAMETERS_REJECTED', 'bcc directive');
});

test('message mutation and delivery-identity tampering fail closed', () => {
  const mutated = Object.assign({}, validRequest(), { message_hash: 'deadbeef' });
  const r = evaluateFirstSendPreconditions(baseState({ request: mutated }));
  assert(!r.ok && r.error_code === 'GATE_MESSAGE_MUTATED', 'mutated message');
  const tampered = Object.assign({}, validRequest(), { delivery_identity: 'nottheidentity' });
  const r2 = evaluateFirstSendPreconditions(baseState({ request: tampered }));
  assert(!r2.ok && r2.error_code === 'GATE_DELIVERY_IDENTITY_MISMATCH', 'tampered identity');
});

// ── Structural / no-bypass guarantees ──
test('the shipped first-send module carries no transport, network, or bulk surface', async () => {
  const read = isDeno
    ? Deno.readTextFileSync(new URL('./controlledFirstSend.ts', import.meta.url))
    : (await import('node:fs')).readFileSync(new URL('./controlledFirstSend.ts', import.meta.url), 'utf8');
  for (const forbidden of [
    'fetch(', 'gmail.googleapis.com', 'gmailTransportSend', 'XMLHttpRequest', 'setInterval',
    'setTimeout', 'sendEmail', 'bulkCreate', 'updateMany', 'deleteMany', 'campaign(',
  ]) {
    assert(!read.includes(forbidden), 'forbidden surface absent: ' + forbidden);
  }
  assert(read.includes('FIRST_SEND_CONTROLLED_TEST_MARKER'), 'marker contract present');
  assert(!read.includes('connector_token'), 'the module never handles the connector token');
});

test('the shipped module never references the existing PENDING approval or any live record', async () => {
  const read = isDeno
    ? Deno.readTextFileSync(new URL('./controlledFirstSend.ts', import.meta.url))
    : (await import('node:fs')).readFileSync(new URL('./controlledFirstSend.ts', import.meta.url), 'utf8');
  assert(!read.includes('786e0b21'), 'no reference to the existing PENDING approval');
  assert(!read.includes('entities.'), 'no entity persistence surface');
  assert(!read.includes('import '), 'pure module — no imports');
});

test('deterministic outputs are stable across invocations', () => {
  const r1 = evaluateFirstSendPreconditions(baseState());
  const r2 = evaluateFirstSendPreconditions(baseState());
  assert(r1.ok && r2.ok, 'both pass');
  assert(JSON.stringify(r1) === JSON.stringify(r2), 'fully deterministic');
});

if (isDeno) {
  for (const [name, fn] of cases) Deno.test(name, fn);
} else {
  let failed = 0;
  for (const [name, fn] of cases) {
    try { await fn(); console.log(`ok - ${name}`); }
    catch (e) { failed++; console.error(`FAIL - ${name}: ${e.message}`); }
  }
  console.log(`${cases.length - failed}/${cases.length} pass`);
  if (failed > 0) process.exitCode = 1;
}
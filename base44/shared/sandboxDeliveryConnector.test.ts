/**
 * Sandbox Delivery Connector — Phase 12 deterministic contract test suite.
 * ============================================================
 * Verifies the provider-neutral delivery contract and the non-delivering
 * sandbox implementation against the exact shipped module: capabilities,
 * request/destination/message contracts, binding and replay protection,
 * message immutability, result-status guarantees, authorization boundary,
 * real-delivery readiness truthfulness, registry seed, tool-registry freeze
 * expectations, and a static security scan proving zero external-delivery
 * capability surface.
 *
 * Dual-runner: registers Deno.test cases under a Deno test runner and runs
 * the same cases sequentially in plain JavaScript environments. All
 * fixtures are in-memory and deterministic — no network, no database, no
 * production data.
 */

import {
  DELIVERY_CHANNELS,
  DELIVERY_CONNECTOR_ID,
  DELIVERY_CONNECTOR_TYPE,
  DELIVERY_CONNECTOR_VERSION,
  DELIVERY_MODE_SANDBOX,
  DELIVERY_RESULT_STATUSES_CONCEPTUAL,
  DELIVERY_STATUSES_UNAVAILABLE_TO_SANDBOX,
  SANDBOX_ALLOWED_RESULT_STATUSES,
  SANDBOX_VERIFY_NOTICE,
  DESTINATION_RESOLUTION_STATUS,
  CONNECTOR_REGISTRY_SEED,
  EXECUTE_OUTREACH_TOOL_EXPECTED_STATE,
  buildSandboxDestination,
  createGovernedDeliveryRequest,
  deriveDeliveryIdentity,
  deriveMessageHash,
  getRealDeliveryReadiness,
  sandboxDeliver,
  sandboxGetCapabilities,
  sandboxGetDeliveryStatus,
  assertSandboxResultStatus,
  buildDeliveryAuditRecord,
  validateDeliveryDestination,
} from './sandboxDeliveryConnector.ts';

const __sandboxTests = [];
function sandboxTest(name, fn) { __sandboxTests.push({ name, fn }); }

function assert(cond, msg) {
  if (!cond) throw new Error(msg || 'assertion failed');
}
function assertEq(actual, expected, msg) {
  if (actual !== expected) {
    throw new Error(`${msg || 'value mismatch'} — expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}
function assertBlocked(result, code) {
  assertEq(result.delivery_status, 'BLOCKED', 'expected BLOCKED delivery result');
  assertEq(result.simulated, true, 'blocked result must be marked simulated');
  if (code) assertEq(result.error_code, code, 'blocked result error code');
  assertEq(result.sent, false, 'blocked result must claim nothing sent');
  assertEq(result.delivered, false, 'blocked result must claim nothing delivered');
  assert(result.verification.includes('NOTHING SENT'), 'blocked result must carry the NOTHING SENT notice');
}

function readModuleSource() {
  if (typeof globalThis !== 'undefined' && typeof globalThis.__SANDBOX_MODULE_SOURCE__ === 'string') {
    return globalThis.__SANDBOX_MODULE_SOURCE__;
  }
  if (typeof Deno !== 'undefined') {
    return Deno.readTextFileSync('base44/shared/sandboxDeliveryConnector.ts');
  }
  throw new Error('Module source unavailable for the static security scan.');
}
function assertSourceFree(tokens, label) {
  const source = readModuleSource();
  for (const token of tokens) {
    assert(source.indexOf(token) === -1, `${label} — module source contains forbidden token: ${token}`);
  }
}

// ── Fixtures ──
const FIX = {
  prospect_id: '11111111-1111-4111-8111-111111111111',
  channel: 'EMAIL',
  approved_draft_hash: 'abcdef1234567890',
  approval_id: '22222222-2222-4222-8222-222222222222',
  execution_id: '33333333-3333-4333-8333-333333333333',
  correlation_id: 'wf:user0:growth_agent:execute_prospect_outreach:1a2b3c4d',
};
function boundary(overrides) {
  const expected = {
    prospect_id: FIX.prospect_id,
    channel: FIX.channel,
    approved_draft_hash: FIX.approved_draft_hash,
    approval_id: FIX.approval_id,
    execution_id: FIX.execution_id,
    correlation_id: FIX.correlation_id,
    delivery_identity: deriveDeliveryIdentity(FIX),
  };
  return { authorization_verified: true, expected: { ...expected, ...(overrides || {}) } };
}
function validFields(overrides) {
  return {
    prospect_id: FIX.prospect_id,
    channel: FIX.channel,
    approved_draft_hash: FIX.approved_draft_hash,
    approval_id: FIX.approval_id,
    execution_id: FIX.execution_id,
    correlation_id: FIX.correlation_id,
    destination: buildSandboxDestination(FIX.channel),
    message: {
      approved_draft_hash: FIX.approved_draft_hash,
      content_binding: 'APPROVED_DRAFT_HASH',
      subject: null,
      body: null,
    },
    ...(overrides || {}),
  };
}
function governedRequest(overrides, ctxOverrides) {
  const created = createGovernedDeliveryRequest(validFields(overrides), boundary(ctxOverrides));
  assert(created.ok === true, `governed request creation failed: ${created.error_code} — ${created.error}`);
  return created.request;
}

// ── 1-4: initialization and truthful capabilities ──
sandboxTest('sandbox connector initializes and reports truthful capabilities', () => {
  const caps = sandboxGetCapabilities();
  assertEq(caps.connector_id, DELIVERY_CONNECTOR_ID, 'connector_id');
  assertEq(caps.connector_type, DELIVERY_CONNECTOR_TYPE, 'connector_type');
  assertEq(caps.version, DELIVERY_CONNECTOR_VERSION, 'version');
  assertEq(caps.status, 'ACTIVE', 'registry status');
  assertEq(caps.enabled, true, 'registry enabled');
});
sandboxTest('supports_delivery is false — the connector performs no delivery', () => {
  assertEq(sandboxGetCapabilities().supports_delivery, false, 'supports_delivery');
});
sandboxTest('sandbox_only is true — sandbox behavior is the only behavior', () => {
  assertEq(sandboxGetCapabilities().sandbox_only, true, 'sandbox_only');
});
sandboxTest('channels and human approval are truthful', () => {
  const caps = sandboxGetCapabilities();
  assertEq(JSON.stringify(caps.supported_channels), JSON.stringify(DELIVERY_CHANNELS), 'supported channels');
  assertEq(caps.requires_human_approval, true, 'human approval remains required');
});

// ── 5-10: no external capability surface ──
sandboxTest('no network APIs are invoked (static scan)', () => {
  assertSourceFree(['fetch(', 'XMLHttpRequest', 'axios', 'websocket'], 'no network APIs');
});
sandboxTest('no provider SDK is imported (static scan)', () => {
  const source = readModuleSource();
  assert(source.indexOf('import ') === -1, 'module must contain zero import statements');
  assert(source.indexOf('require(') === -1, 'module must contain zero require calls');
});
sandboxTest('no email is sent — sandbox result claims nothing sent', () => {
  const delivery = sandboxDeliver(governedRequest(), boundary());
  assertEq(delivery.delivery_status, 'SANDBOX_ONLY', 'sandbox result');
  assertEq(delivery.sent, false, 'nothing sent');
  assertEq(delivery.external_delivery, false, 'no external delivery');
  assertEq(delivery.network_calls, 0, 'zero network calls');
});
sandboxTest('no SMS is sent (static + behavioral)', () => {
  assertSourceFree(['sms'], 'no SMS surface');
  const delivery = sandboxDeliver(governedRequest(), boundary());
  assertEq(delivery.sent, false, 'nothing sent');
});
sandboxTest('no LinkedIn request is made (static scan)', () => {
  assertSourceFree(['linkedin'], 'no social platform surface');
});
sandboxTest('no CRM call and no database write exists (static scan)', () => {
  assertSourceFree(['hubspot', 'salesforce', 'entities.', 'asServiceRole'], 'no CRM or database surface');
});

// ── 11-12: valid sandbox delivery ──
sandboxTest('valid sandbox request returns SANDBOX_ONLY', () => {
  const delivery = sandboxDeliver(governedRequest(), boundary());
  assertEq(delivery.delivery_status, 'SANDBOX_ONLY', 'delivery status');
  assertEq(delivery.simulated, true, 'simulated marker');
  assertEq(delivery.delivery_mode, DELIVERY_MODE_SANDBOX, 'delivery mode');
  assertEq(delivery.recipient_resolution, DESTINATION_RESOLUTION_STATUS, 'destination resolution');
  assertEq(delivery.recipient_resolved, false, 'no recipient resolved');
  assertEq(delivery.persisted, false, 'nothing persisted');
  assertEq(delivery.scheduled, false, 'nothing scheduled');
});
sandboxTest('result explicitly says SANDBOX — NOTHING SENT', () => {
  const delivery = sandboxDeliver(governedRequest(), boundary());
  assert(delivery.verification.indexOf('SANDBOX — NOTHING SENT') === 0, 'explicit sandbox notice prefix');
  assertEq(delivery.verification, SANDBOX_VERIFY_NOTICE, 'exact verification notice');
});

// ── 13-15: missing governed identifiers blocked ──
sandboxTest('missing execution_id is blocked', () => {
  const fields = validFields();
  delete fields.execution_id;
  const created = createGovernedDeliveryRequest(fields, boundary());
  assert(created.ok === false && created.error_code === 'DELIVERY_REQUEST_EXECUTION_ID_INVALID',
    'missing execution_id must be rejected at creation');
  const delivered = sandboxDeliver(governedRequest(), boundary({ execution_id: '44444444-4444-4444-8444-444444444444' }));
  assertBlocked(delivered, 'DELIVERY_REQUEST_EXECUTION_MISMATCH');
});
sandboxTest('missing approval_id is blocked', () => {
  const fields = validFields();
  delete fields.approval_id;
  const created = createGovernedDeliveryRequest(fields, boundary());
  assert(created.ok === false && created.error_code === 'DELIVERY_REQUEST_APPROVAL_ID_INVALID',
    'missing approval_id must be rejected at creation');
  const delivered = sandboxDeliver(governedRequest(), boundary({ approval_id: '55555555-5555-4555-8555-555555555555' }));
  assertBlocked(delivered, 'DELIVERY_REQUEST_APPROVAL_MISMATCH');
});
sandboxTest('missing correlation_id is blocked', () => {
  const fields = validFields();
  delete fields.correlation_id;
  const created = createGovernedDeliveryRequest(fields, boundary());
  assert(created.ok === false && created.error_code === 'DELIVERY_REQUEST_CORRELATION_ID_INVALID',
    'missing correlation_id must be rejected at creation');
  const delivered = sandboxDeliver(governedRequest(), boundary({ correlation_id: 'wf:other:correlation:xxxx' }));
  assertBlocked(delivered, 'DELIVERY_REQUEST_CORRELATION_MISMATCH');
});

// ── 16: channel contract ──
sandboxTest('invalid channel is blocked', () => {
  const created = createGovernedDeliveryRequest(validFields({ channel: 'FAX' }), boundary());
  assert(created.ok === false && created.error_code === 'DELIVERY_REQUEST_CHANNEL_UNSUPPORTED',
    'unsupported channel rejected at creation');
  const destCheck = validateDeliveryDestination(buildSandboxDestination('EMAIL'), 'FAX');
  assert(destCheck.ok === false && destCheck.error_code === 'DELIVERY_REQUEST_CHANNEL_UNSUPPORTED',
    'destination validated against the registered channels only');
});

// ── 17-20: destination contract ──
sandboxTest('invalid destination object is blocked', () => {
  const created = createGovernedDeliveryRequest(validFields({ destination: { destination_type: 'EMAIL' } }), boundary());
  assert(created.ok === false && created.error_code === 'DELIVERY_DESTINATION_RESOLUTION_INVALID',
    'malformed destination rejected');
});
sandboxTest('client-supplied destination is blocked', () => {
  const bad = { ...buildSandboxDestination(FIX.channel), resolved_by: 'client' };
  const created = createGovernedDeliveryRequest(validFields({ destination: bad }), boundary());
  assert(created.ok === false && created.error_code === 'DELIVERY_DESTINATION_PROVENANCE_INVALID',
    'client-built destination provenance rejected');
});
sandboxTest('arbitrary recipient is blocked', () => {
  const bad = { ...buildSandboxDestination(FIX.channel), recipient_reference: 'someone@example.test' };
  const created = createGovernedDeliveryRequest(validFields({ destination: bad }), boundary());
  assert(created.ok === false && created.error_code === 'DELIVERY_DESTINATION_CLIENT_SUPPLIED',
    'client-supplied recipient rejected');
  const badMessage = validFields();
  badMessage.message = { ...badMessage.message, to: 'someone@example.test' };
  const created2 = createGovernedDeliveryRequest(badMessage, boundary());
  assert(created2.ok === false && created2.error_code === 'DELIVERY_MESSAGE_FIELD_REJECTED',
    'recipient smuggled inside the message rejected');
});
sandboxTest('arbitrary provider identifier is blocked', () => {
  const bad = { ...buildSandboxDestination(FIX.channel), provider_id: 'provider-abc-123' };
  const created = createGovernedDeliveryRequest(validFields({ destination: bad }), boundary());
  assert(created.ok === false && created.error_code === 'DELIVERY_DESTINATION_PROVIDER_ID_REJECTED',
    'arbitrary provider id rejected');
});

// ── 21-25: binding and replay protection ──
sandboxTest('draft hash mismatch is blocked', () => {
  const delivered = sandboxDeliver(governedRequest(), boundary({ approved_draft_hash: 'ffff0000ffff0000' }));
  assertBlocked(delivered, 'DELIVERY_REQUEST_DRAFT_HASH_MISMATCH');
});
sandboxTest('Prospect mismatch is blocked', () => {
  const delivered = sandboxDeliver(governedRequest(), boundary({ prospect_id: '99999999-9999-4999-8999-999999999999' }));
  assertBlocked(delivered, 'DELIVERY_REQUEST_PROSPECT_MISMATCH');
});
sandboxTest('approval mismatch is blocked', () => {
  const delivered = sandboxDeliver(governedRequest(), boundary({ approval_id: '55555555-5555-4555-8555-555555555555' }));
  assertBlocked(delivered, 'DELIVERY_REQUEST_APPROVAL_MISMATCH');
});
sandboxTest('execution mismatch is blocked', () => {
  const delivered = sandboxDeliver(governedRequest(), boundary({ execution_id: '44444444-4444-4444-8444-444444444444' }));
  assertBlocked(delivered, 'DELIVERY_REQUEST_EXECUTION_MISMATCH');
});
sandboxTest('replay identity mismatch is blocked', () => {
  const delivered = sandboxDeliver(governedRequest(), boundary({ delivery_identity: '00000000' }));
  assertBlocked(delivered, 'DELIVERY_IDENTITY_MISMATCH');
});

// ── 26-28: result status guarantees ──
sandboxTest('real delivery statuses are structurally unavailable to the sandbox', () => {
  assertEq(JSON.stringify(SANDBOX_ALLOWED_RESULT_STATUSES), JSON.stringify(['NOT_ATTEMPTED', 'SANDBOX_ONLY', 'BLOCKED']),
    'sandbox allowed statuses');
  for (const status of DELIVERY_STATUSES_UNAVAILABLE_TO_SANDBOX) {
    assert(SANDBOX_ALLOWED_RESULT_STATUSES.indexOf(status) === -1, `sandbox must not allow ${status}`);
  }
  let threw = false;
  try { assertSandboxResultStatus('SENT'); } catch (e) { threw = true; }
  assert(threw, 'the sandbox result guard must refuse SENT');
  let threw2 = false;
  try { assertSandboxResultStatus('DELIVERED'); } catch (e) { threw2 = true; }
  assert(threw2, 'the sandbox result guard must refuse DELIVERED');
});
sandboxTest('SENT can never be returned by the sandbox connector', () => {
  const ok = sandboxDeliver(governedRequest(), boundary());
  const blocked = sandboxDeliver(governedRequest(), boundary({ channel: 'LINKEDIN' }));
  assert(ok.delivery_status !== 'SENT' && blocked.delivery_status !== 'SENT', 'no SENT result');
  assertEq(ok.sent, false, 'never claims sent');
  assertEq(blocked.sent, false, 'blocked never claims sent');
});
sandboxTest('DELIVERED can never be returned by the sandbox connector', () => {
  const ok = sandboxDeliver(governedRequest(), boundary());
  assert(ok.delivery_status !== 'DELIVERED', 'no DELIVERED result');
  assertEq(ok.delivered, false, 'never claims delivered');
});

// ── 29-31: message immutability ──
sandboxTest('provider-specific message mutation is blocked', () => {
  const fields = validFields();
  fields.message = { ...fields.message, provider_overrides: { from_name: 'fake' } };
  const created = createGovernedDeliveryRequest(fields, boundary());
  assert(created.ok === false && created.error_code === 'DELIVERY_MESSAGE_FIELD_REJECTED',
    'provider-specific message directives rejected');
});
sandboxTest('message mutation after approval is blocked', () => {
  const request = governedRequest();
  const tampered = {
    ...request,
    message_hash: deriveMessageHash({
      approved_draft_hash: FIX.approved_draft_hash,
      content_binding: 'APPROVED_DRAFT_HASH',
      subject: null,
      body: 'rewritten content',
    }),
  };
  const delivered = sandboxDeliver(tampered, boundary());
  assertBlocked(delivered, 'DELIVERY_MESSAGE_MUTATED');
  assert(Object.isFrozen(request.message), 'the governed message envelope is deeply frozen');
  assert(Object.isFrozen(request), 'the governed request is deeply frozen');
});
sandboxTest('channel substitution is blocked', () => {
  const created = createGovernedDeliveryRequest(validFields({ destination: buildSandboxDestination('LINKEDIN') }), boundary());
  assert(created.ok === false && created.error_code === 'DELIVERY_DESTINATION_CHANNEL_MISMATCH',
    'destination/channel substitution rejected');
  const delivered = sandboxDeliver(governedRequest(), boundary({ channel: 'LINKEDIN' }));
  assertBlocked(delivered, 'DELIVERY_REQUEST_CHANNEL_MISMATCH');
});

// ── 32-33: authorization boundary ──
sandboxTest('the connector cannot authorize — no authorized context is blocked', () => {
  const noAuth = sandboxDeliver(governedRequest(), { authorization_verified: false, expected: {} });
  assertBlocked(noAuth, 'DELIVERY_CONTEXT_NOT_AUTHORIZED');
  const noContext = sandboxDeliver(governedRequest(), null);
  assertBlocked(noContext, 'DELIVERY_CONTEXT_NOT_AUTHORIZED');
  const created = createGovernedDeliveryRequest(validFields(), { authorization_verified: false });
  assert(created.ok === false && created.error_code === 'DELIVERY_CONTEXT_NOT_AUTHORIZED',
    'request creation also requires the authorized boundary context');
  assertSourceFree(['AgentRegistry', 'AgentToolRegistry', 'AgentApproval', 'user_condition', 'permission_scope', 'execution_scope'],
    'the connector module contains no authorization surface');
});
sandboxTest('the connector cannot bypass the orchestration core (static scan)', () => {
  assertSourceFree(['AgentOrchestrationCore', 'AgentExecution', 'orchestrate', 'asServiceRole'],
    'the connector module cannot reach the orchestration boundary');
});

// ── 34: readiness truthfulness ──
sandboxTest('real delivery readiness is truthful and explicit', () => {
  const readiness = getRealDeliveryReadiness();
  assertEq(readiness.real_delivery_enabled, false, 'real delivery NOT enabled');
  assertEq(readiness.real_delivery_connector, 'none', 'no real connector');
  assertEq(readiness.sandbox_connector, 'active', 'sandbox connector active');
  assertEq(readiness.external_side_effects, 'disabled', 'external side effects disabled');
  assertEq(readiness.human_approval, 'required', 'human approval required');
  assertEq(readiness.destination_resolution, 'NOT_IMPLEMENTED', 'destination resolution not implemented');
});

// ── 35-36: registry and tool freeze expectations ──
sandboxTest('connector registry seed contains only the sandbox connector', () => {
  assertEq(CONNECTOR_REGISTRY_SEED.length, 1, 'exactly one seeded connector');
  const seed = CONNECTOR_REGISTRY_SEED[0];
  assertEq(seed.connector_id, 'sandbox_delivery', 'sandbox connector id');
  assertEq(seed.connector_type, 'SANDBOX', 'sandbox type');
  assertEq(seed.supports_delivery, false, 'seeded connector supports no delivery');
  assertEq(seed.sandbox_only, true, 'seeded connector is sandbox only');
  assertEq(seed.requires_human_approval, true, 'seeded connector requires human approval');
});
sandboxTest('execute_prospect_outreach remains DRAFT + disabled + HIGH risk', () => {
  assertEq(EXECUTE_OUTREACH_TOOL_EXPECTED_STATE.tool_id, 'execute_prospect_outreach', 'tool id');
  assertEq(EXECUTE_OUTREACH_TOOL_EXPECTED_STATE.status, 'DRAFT', 'DRAFT status');
  assertEq(EXECUTE_OUTREACH_TOOL_EXPECTED_STATE.enabled, false, 'disabled');
  assertEq(EXECUTE_OUTREACH_TOOL_EXPECTED_STATE.risk_level, 'HIGH', 'risk stays HIGH');
  assertEq(EXECUTE_OUTREACH_TOOL_EXPECTED_STATE.human_approval_required, true, 'human approval stays required');
});

// ── 37-43: static security scan — no external surface of any kind ──
sandboxTest('no OAuth surface exists (static scan)', () => {
  assertSourceFree(['oauth', 'OAuth', 'grant', 'consent'], 'no authorization-delegation surface');
});
sandboxTest('no secrets surface exists (static scan)', () => {
  assertSourceFree(['secret', 'password', 'credential', 'token'], 'no secrets surface');
});
sandboxTest('no external credentials surface exists (static scan)', () => {
  assertSourceFree(['client_secret', 'api_key', 'access_token', 'bearer '], 'no external credentials');
});
sandboxTest('no background processing exists (static scan)', () => {
  assertSourceFree(['setInterval', 'setTimeout', 'cron', 'Worker(', 'queueMicrotask'], 'no background processing');
});
sandboxTest('no automatic reattempts exist (static scan)', () => {
  assertSourceFree(['retry', 'backoff', 'reattempt'], 'no reattempt logic');
});
sandboxTest('no scheduling behavior exists (static + behavioral)', () => {
  assertSourceFree(['scheduleAt', 'setInterval', 'setTimeout', 'cron'], 'no scheduling');
  const delivery = sandboxDeliver(governedRequest(), boundary());
  assertEq(delivery.scheduled, false, 'nothing scheduled');
});
sandboxTest('no external side effects of any kind exist (static scan)', () => {
  assertSourceFree(['fetch', 'XMLHttpRequest', 'axios', 'nodemailer', 'smtp', 'gmail', 'graph.microsoft',
    'linkedin', 'twilio', 'sendgrid', 'mailgun', 'hubspot', 'salesforce', 'import '], 'zero external-delivery dependencies');
});

// ── 44-49: destination model, status, identity, audit, determinism ──
sandboxTest('destination resolution remains NOT_IMPLEMENTED with no recipient', () => {
  const destination = buildSandboxDestination('LINKEDIN');
  assertEq(destination.resolution_status, 'NOT_IMPLEMENTED', 'resolution status');
  assertEq(destination.recipient_reference, null, 'no recipient');
  assertEq(destination.provider_id, null, 'no provider id');
  assert(Object.isFrozen(destination), 'destination contract is frozen');
});
sandboxTest('sandbox delivery status concept returns NOT_ATTEMPTED', () => {
  const status = sandboxGetDeliveryStatus('deadbeef');
  assertEq(status.delivery_status, 'NOT_ATTEMPTED', 'status');
  assertEq(status.simulated, true, 'simulated');
  assertEq(status.sent, false, 'nothing sent');
  assert(status.verification.includes('NOTHING SENT'), 'verification notice');
});
sandboxTest('delivery identity is deterministic and governed-boundary-derived only', () => {
  const identity = deriveDeliveryIdentity(FIX);
  assertEq(identity, deriveDeliveryIdentity(FIX), 'identity is deterministic');
  assertEq(identity.length > 0, true, 'identity present');
  assert(identity !== deriveDeliveryIdentity({ ...FIX, channel: 'LINKEDIN' }), 'identity binds the channel');
  assert(identity !== deriveDeliveryIdentity({ ...FIX, prospect_id: '99999999-9999-4999-8999-999999999999' }), 'identity binds the Prospect');
  assert(identity !== deriveDeliveryIdentity({ ...FIX, execution_id: '44444444-4444-4444-8444-444444444444' }), 'identity binds the execution');
  assert(identity !== deriveDeliveryIdentity({ ...FIX, approved_draft_hash: 'ffff0000ffff0000' }), 'identity binds the approved draft hash');
  const request = governedRequest();
  assertEq(request.delivery_identity, identity, 'the request carries exactly the governed identity — no second idempotency authority');
});
sandboxTest('delivery audit record builder produces SANDBOX-mode provenance', () => {
  const request = governedRequest();
  const delivery = sandboxDeliver(request, boundary());
  const audit = buildDeliveryAuditRecord(request, delivery, {
    audit_id: 'audit-0001',
    timestamp: '2026-09-15T00:00:00.000Z',
    source: 'agent_orchestration_service',
    user_id: 'user-0001',
    organization_id: 'org-0001',
  });
  assertEq(audit.delivery_mode, 'SANDBOX', 'audit delivery mode');
  assertEq(audit.result_status, 'SANDBOX_ONLY', 'audit result status');
  assertEq(audit.execution_id, FIX.execution_id, 'audit execution provenance');
  assertEq(audit.approval_id, FIX.approval_id, 'audit approval provenance');
  assertEq(audit.prospect_id, FIX.prospect_id, 'audit prospect provenance');
  assertEq(audit.channel, FIX.channel, 'audit channel provenance');
  assertEq(audit.connector_id, DELIVERY_CONNECTOR_ID, 'audit connector provenance');
  assertEq(audit.correlation_id, FIX.correlation_id, 'audit correlation provenance');
  assertEq(audit.error_code, null, 'no error for sandbox success');
  assertEq(audit.metadata.simulated, true, 'audit simulated marker');
  assertEq(audit.metadata.external_delivery, false, 'audit external delivery marker');
});
sandboxTest('the connector validates the full contract on every deliver call', () => {
  const request = governedRequest();
  assertEq(sandboxDeliver(request, boundary()).delivery_status, 'SANDBOX_ONLY', 'valid request passes');
  const stripped = { ...request, message_hash: undefined };
  assertBlocked(sandboxDeliver(stripped, boundary()), 'DELIVERY_MESSAGE_HASH_MISSING');
  const noIdentity = { ...request, delivery_identity: undefined };
  assertBlocked(sandboxDeliver(noIdentity, boundary()), 'DELIVERY_IDENTITY_MISSING');
  const extraKey = { ...request, recipient: 'someone@example.test' };
  assertBlocked(sandboxDeliver(extraKey, boundary()), 'DELIVERY_REQUEST_FIELD_REJECTED');
  assertEq(DELIVERY_RESULT_STATUSES_CONCEPTUAL.indexOf('FAILED') > -1, true,
    'the conceptual result contract lists FAILED for future real phases only');
});

// ── Dual-runner execution ──
export async function runSandboxSuite() {
  let pass = 0;
  let fail = 0;
  for (const t of __sandboxTests) {
    try {
      await t.fn();
      pass += 1;
    } catch (e) {
      fail += 1;
      if (typeof console !== 'undefined' && console.error) {
        console.error(`FAIL>> ${t.name} — ${(e && e.message) ? e.message : e}`);
      }
    }
  }
  const line = `RESULT ${pass}/${pass + fail} deterministic tests pass`;
  if (typeof console !== 'undefined' && console.log) console.log(line);
  return { pass, fail, line };
}

if (typeof Deno !== 'undefined') {
  for (const t of __sandboxTests) Deno.test(t.name, t.fn);
} else {
  await runSandboxSuite();
}
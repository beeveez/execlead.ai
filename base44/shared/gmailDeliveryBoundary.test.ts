// ============================================================
// Phase 14D — Controlled Gmail Delivery Activation Gate
// deterministic test suite. NO REAL GMAIL SEND OCCURS: every
// executeGovernedGmailDelivery call in this suite either terminates
// at the gate (BLOCKED, zero transport invocations) or injects a
// canned in-memory transport that performs no network access. The
// default real transport (gmailTransportSend) is never invoked.
// Run: deno test --allow-net --allow-read base44/shared/gmailDeliveryBoundary.test.ts
// All tests are local/deterministic — no network, no DB, no LLM.
// ============================================================
import {
  GMAIL_DELIVERY_BOUNDARY_VERSION,
  GMAIL_DELIVERY_SENDER_IDENTITY,
  GMAIL_DELIVERY_CONNECTOR_ID,
  GMAIL_DELIVERY_TRANSPORT_ENDPOINT,
  GMAIL_DELIVERY_TRANSPORT_SCOPE,
  evaluateRealDeliveryGate,
  executeGovernedGmailDelivery,
  resolveAuthorizedOutreachRecipient,
  validateNoClientDeliveryParameters,
  getRealDeliveryActivationStatus,
  deriveRealDeliveryMessageHash,
  deriveRealDeliveryIdentity,
  fingerprintRecipient,
  buildRealDeliveryAuditRecord,
} from "./gmailDeliveryBoundary.ts";
import {
  GMAIL_CONNECTOR_PROVIDER_ID,
  GMAIL_CONNECTOR_ARCHITECTURE,
  GMAIL_CONNECTOR_EXPECTED_IDENTITY,
  GMAIL_CONNECTOR_REQUIRED_SCOPE,
  validateGmailConnectorIdentity,
  validateGmailConnectorScopes,
  validateGmailConnectorSender,
  getGmailConnectorCredentialStatus,
  acquireGmailConnectorTokenContext,
} from "./gmailConnectorCredentialProvider.ts";
import {
  GMAIL_REGISTRY_STATUS,
  GMAIL_REGISTRY_ENABLED,
  GMAIL_REGISTRY_SEED,
  EXECUTE_OUTREACH_TOOL_EXPECTED_STATE,
} from "./googleWorkspaceGmailConnector.ts";

const NOW = "2026-09-15T10:00:00.000Z";
const PROSPECT_ID = "11111111-2222-4333-8444-555555555555";
const EXECUTION_ID = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee";
const APPROVAL_ID = "99999999-8888-4777-8666-555555555555";
const CORRELATION_ID = "corr:14d:test:0001";
const DRAFT_HASH = "a1b2c3d4e5f6";
const SUBJECT = "Governed outreach introduction";
const BODY = "Approved draft body — immutable, byte-identical at transport.";
const RECIPIENT = "decision.maker@prospect-company.example";
const SENTINEL_TOKEN = "SENTINEL_CONNECTOR_TOKEN_9f3a12";
const WRONG_TOKEN = "SHOULD_NEVER_APPEAR_7e11";

// The shipped Phase 14C server-only credential boundary.
const CREDENTIAL_BOUNDARY = {
  GMAIL_CONNECTOR_PROVIDER_ID,
  GMAIL_CONNECTOR_ARCHITECTURE,
  GMAIL_CONNECTOR_EXPECTED_IDENTITY,
  GMAIL_CONNECTOR_REQUIRED_SCOPE,
  validateGmailConnectorIdentity,
  validateGmailConnectorScopes,
  validateGmailConnectorSender,
  getGmailConnectorCredentialStatus,
  acquireGmailConnectorTokenContext,
};

const tests = [];
function test(name, fn) { tests.push({ name, fn }); }
function assert(cond, label) { if (!cond) throw new Error("FAILED: " + label); }
function assertEq(actual, expected, label) {
  const a = JSON.stringify(actual), e = JSON.stringify(expected);
  if (a !== e) throw new Error(label + ": expected " + e + " but got " + a);
}
function assertBlocked(result, errorCode, label) {
  assertEq(result.delivery_status, "BLOCKED", label + ": status BLOCKED");
  assertEq(result.blocked, true, label + ": blocked flag");
  assertEq(result.sent, false, label + ": nothing sent");
  assertEq(result.delivered, false, label + ": nothing delivered");
  assertEq(result.transport_invoked, false, label + ": transport never invoked");
  assertEq(result.audit_record.delivery_mode, "REAL", label + ": REAL audit mode");
  assertEq(result.audit_record.result_status, "BLOCKED", label + ": audit BLOCKED");
  if (errorCode) assertEq(result.error_code, errorCode, label + ": error code");
}

function baseRequest(overrides) {
  const message = {
    approved_draft_hash: DRAFT_HASH,
    content_binding: "APPROVED_DRAFT_HASH",
    to: null,
    subject: SUBJECT,
    body: BODY,
  };
  const request = {
    prospect_id: PROSPECT_ID,
    channel: "EMAIL",
    approved_draft_hash: DRAFT_HASH,
    approval_id: APPROVAL_ID,
    execution_id: EXECUTION_ID,
    correlation_id: CORRELATION_ID,
    destination: {
      destination_type: "EMAIL",
      resolution_status: "NOT_IMPLEMENTED",
      resolved_by: "server_delivery_boundary",
      recipient_reference: null,
      provider_id: null,
    },
    message: message,
    message_hash: deriveRealDeliveryMessageHash(message),
    delivery_identity: deriveRealDeliveryIdentity({
      execution_id: EXECUTION_ID,
      approved_draft_hash: DRAFT_HASH,
      prospect_id: PROSPECT_ID,
      channel: "EMAIL",
    }),
  };
  return Object.assign({}, request, overrides || {});
}

function validState(overrides) {
  const state = {
    authenticated_caller: { user_id: "user-0001", organization_id: "org-0001" },
    agent_id: "growth_agent",
    tool_id: "execute_prospect_outreach",
    request: baseRequest(),
    execution_record: { execution_id: EXECUTION_ID, status: "RUNNING" },
    approval_record: {
      approval_id: APPROVAL_ID,
      status: "APPROVED",
      expires_at: "2026-09-22T10:00:00.000Z",
      metadata: { approved_draft_hash: DRAFT_HASH, executed: false },
    },
    approval_already_executed: false,
    prospect_record: {
      prospect_id: PROSPECT_ID,
      owner_user_id: "user-0001",
      organization_id: "org-0001",
      status: "QUALIFIED",
    },
    approved_contact_source: {
      contact_source_id: "contact_src_test_001",
      prospect_id: PROSPECT_ID,
      contact_email: RECIPIENT,
      verified_by: "human_operator",
      verified_at: "2026-09-01T00:00:00.000Z",
    },
    connector_registry_record: {
      connector_id: GMAIL_DELIVERY_CONNECTOR_ID,
      status: "ACTIVE",
      enabled: true,
      supports_delivery: true,
    },
    global_real_delivery_record: {
      config_id: "outreach_real_delivery_global",
      real_delivery_enabled: true,
    },
    prior_delivery_results: [],
    declared_sender: GMAIL_DELIVERY_SENDER_IDENTITY,
    now: NOW,
  };
  return Object.assign({}, state, overrides || {});
}

function validGateway(overrides) {
  return Object.assign({
    connector_available: true,
    connected_identity: "r.valdez@execleadai.co",
    granted_scopes: [GMAIL_DELIVERY_TRANSPORT_SCOPE, "email"],
    connector_token: SENTINEL_TOKEN,
    retrieval_status: "ok",
  }, overrides || {});
}

function poisonedTransport() {
  return async function () { throw new Error("REAL_SEND_ATTEMPTED"); };
}

function cannedTransport(record) {
  record.calls = [];
  return async function (tokenContext, payload) {
    record.calls.push({ token: tokenContext.connector_token, payload: payload });
    return { ok: true, provider_accepted: true, provider_message_id: "msg-14d-test" };
  };
}

async function run(request, state, gateway, transport) {
  return await executeGovernedGmailDelivery(
    request || state.request, state, CREDENTIAL_BOUNDARY, gateway || validGateway(), transport || poisonedTransport(),
  );
}

// G1. Real delivery disabled -> blocked
test("real delivery disabled is blocked", async () => {
  const r = await run(null, validState({ global_real_delivery_record: { real_delivery_enabled: false } }));
  assertBlocked(r, "GATE_REAL_DELIVERY_DISABLED", "G1");
});

// G2. Connector disabled -> blocked
test("connector disabled is blocked", async () => {
  const r = await run(null, validState({ connector_registry_record: { connector_id: GMAIL_DELIVERY_CONNECTOR_ID, status: "DRAFT", enabled: false, supports_delivery: false } }));
  assertBlocked(r, "GATE_CONNECTOR_DISABLED", "G2");
});

// G3. Missing approval -> blocked
test("missing approval is blocked", async () => {
  const r = await run(null, validState({ approval_record: null }));
  assertBlocked(r, "GATE_APPROVAL_MISSING", "G3");
});

// G4. Pending approval -> blocked
test("pending approval is blocked", async () => {
  const r = await run(null, validState({ approval_record: { approval_id: APPROVAL_ID, status: "PENDING", expires_at: "2026-09-22T10:00:00.000Z", metadata: { approved_draft_hash: DRAFT_HASH } } }));
  assertBlocked(r, "GATE_APPROVAL_NOT_APPROVED", "G4");
});

// G5. Expired approval -> blocked
test("expired approval is blocked", async () => {
  const r = await run(null, validState({ approval_record: { approval_id: APPROVAL_ID, status: "APPROVED", expires_at: "2026-09-14T10:00:00.000Z", metadata: { approved_draft_hash: DRAFT_HASH } } }));
  assertBlocked(r, "GATE_APPROVAL_EXPIRED", "G5");
});

// G6. Already-used approval -> blocked
test("already-used approval is blocked", async () => {
  const r = await run(null, validState({ approval_already_executed: true }));
  assertBlocked(r, "GATE_APPROVAL_ALREADY_EXECUTED", "G6");
});

// G7. Approval hash mismatch -> blocked
test("approval draft hash mismatch is blocked", async () => {
  const r = await run(null, validState({ approval_record: { approval_id: APPROVAL_ID, status: "APPROVED", expires_at: "2026-09-22T10:00:00.000Z", metadata: { approved_draft_hash: "ffffffff11" } } }));
  assertBlocked(r, "GATE_APPROVAL_DRAFT_HASH_MISMATCH", "G7");
});

// G8. Prospect missing -> blocked
test("missing prospect is blocked", async () => {
  const r = await run(null, validState({ prospect_record: null }));
  assertBlocked(r, "GATE_PROSPECT_MISSING", "G8");
});

// G9. Invalid prospect status -> blocked
test("ineligible prospect status is blocked", async () => {
  const r = await run(null, validState({ prospect_record: { prospect_id: PROSPECT_ID, owner_user_id: "user-0001", organization_id: "org-0001", status: "NEW" } }));
  assertBlocked(r, "GATE_PROSPECT_STATUS_INELIGIBLE", "G9");
});

// G10. Recipient unavailable -> blocked, and this is the LIVE default
test("recipient unavailable fails closed as NOT_IMPLEMENTED", async () => {
  const r = await run(null, validState({ approved_contact_source: null }));
  assertBlocked(r, "GMAIL_RECIPIENT_RESOLUTION_NOT_IMPLEMENTED", "G10");
  const resolver = resolveAuthorizedOutreachRecipient(
    { prospect_id: PROSPECT_ID, status: "QUALIFIED" }, null,
  );
  assertEq(resolver.ok, false, "G10: resolver fails closed without a source");
});

// G11. Client-supplied recipient -> rejected
test("client-supplied recipient is rejected", async () => {
  const msg = { approved_draft_hash: DRAFT_HASH, content_binding: "APPROVED_DRAFT_HASH", to: "someone@evil.example", subject: SUBJECT, body: BODY };
  const req = baseRequest({ message: msg, message_hash: deriveRealDeliveryMessageHash(msg) });
  const r = await run(req, validState({ request: req }));
  assertBlocked(r, "GATE_CLIENT_DELIVERY_PARAMETERS_REJECTED", "G11a");
  const r2 = await run(baseRequest({ to: "someone@evil.example" }), validState({ request: baseRequest({ to: "someone@evil.example" }) }));
  assert(r2.delivery_status === "BLOCKED", "G11b: top-level recipient rejected");
});

// G12. Client-supplied sender -> rejected
test("client-supplied sender is rejected", async () => {
  const req = baseRequest({ sender: "ray@execleadai.co" });
  const r = await run(req, validState({ request: req }));
  assertBlocked(r, "GATE_CLIENT_DELIVERY_PARAMETERS_REJECTED", "G12a");
  const msg = { approved_draft_hash: DRAFT_HASH, content_binding: "APPROVED_DRAFT_HASH", to: null, subject: SUBJECT, body: BODY, from: "ray@execleadai.co" };
  const req2 = baseRequest({ message: msg, message_hash: deriveRealDeliveryMessageHash(msg) });
  const r2 = await run(req2, validState({ request: req2 }));
  assertBlocked(r2, "GATE_CLIENT_DELIVERY_PARAMETERS_REJECTED", "G12b");
});

// G13. Client-supplied provider identity -> rejected
test("client-supplied provider identity is rejected", async () => {
  const req = baseRequest({ provider_id: "evil-provider" });
  const r = await run(req, validState({ request: req }));
  assertBlocked(r, "GATE_CLIENT_DELIVERY_PARAMETERS_REJECTED", "G13");
});

// G14. Arbitrary delivery parameters -> rejected
test("arbitrary delivery parameters are rejected", async () => {
  for (const field of ["cc", "bcc", "params", "api_parameters", "headers", "attachments"]) {
    const req = baseRequest(Object.defineProperty({}, field, { value: "x", enumerable: true }));
    const r = await run(req, validState({ request: req }));
    assert(r.delivery_status === "BLOCKED", "G14: " + field + " rejected");
    assert(r.error_code === "GATE_CLIENT_DELIVERY_PARAMETERS_REJECTED" || r.error_code === "GATE_REQUEST_INVALID", "G14: code for " + field);
  }
});

// G15. Sender not the fixed Growth mailbox -> blocked
test("wrong sender identity is blocked", async () => {
  const r = await run(null, validState({ declared_sender: "other@execleadai.co" }));
  assertBlocked(r, "GATE_SENDER_IDENTITY_REJECTED", "G15");
});

// G16. Connector identity mismatch -> blocked at the credential boundary
test("connector identity mismatch is blocked", async () => {
  const r = await run(null, validState(), validGateway({ connected_identity: "wrong.identity@execleadai.co" }));
  assertBlocked(r, "GMAIL_CONNECTOR_IDENTITY_REJECTED", "G16");
});

// G17. Missing gmail.send scope -> blocked
test("missing gmail.send scope is blocked", async () => {
  const r = await run(null, validState(), validGateway({ granted_scopes: ["email"] }));
  assertBlocked(r, "GMAIL_CONNECTOR_SCOPE_REJECTED", "G17");
});

// G18. Broader Gmail scope -> rejected
test("broader gmail scope is rejected", async () => {
  const r = await run(null, validState(), validGateway({ granted_scopes: [GMAIL_DELIVERY_TRANSPORT_SCOPE, "email", "https://mail.google.com/"] }));
  assertBlocked(r, "GMAIL_CONNECTOR_SCOPE_REJECTED", "G18");
});

// G19. Immutable draft mismatch -> blocked
test("immutable draft mismatch is blocked", async () => {
  const mutated = { approved_draft_hash: DRAFT_HASH, content_binding: "APPROVED_DRAFT_HASH", to: null, subject: SUBJECT + " (personalized!)", body: BODY };
  const req = baseRequest({ message: mutated, message_hash: deriveRealDeliveryMessageHash({ approved_draft_hash: DRAFT_HASH, content_binding: "APPROVED_DRAFT_HASH", to: null, subject: SUBJECT, body: BODY }) });
  const r = await run(req, validState({ request: req }));
  assertBlocked(r, "GATE_MESSAGE_MUTATED", "G19");
});

// G20. Replay / idempotency -> blocked
test("replay after success is blocked", async () => {
  const r = await run(null, validState({ prior_delivery_results: ["SENT"] }));
  assertBlocked(r, "GATE_DELIVERY_ALREADY_SUCCEEDED", "G20");
});

// G21. Sandbox remains functional / baseline frozen
test("sandbox and frozen baseline remain unchanged", () => {
  assertEq(GMAIL_REGISTRY_STATUS, "DRAFT", "G21: Gmail registry stays DRAFT");
  assertEq(GMAIL_REGISTRY_ENABLED, false, "G21: Gmail registry stays disabled");
  assertEq(GMAIL_REGISTRY_SEED[0].connector_id, "google_workspace_gmail", "G21: seed connector id");
  assertEq(EXECUTE_OUTREACH_TOOL_EXPECTED_STATE.status, "DRAFT", "G21: outreach tool stays DRAFT");
  assertEq(EXECUTE_OUTREACH_TOOL_EXPECTED_STATE.enabled, false, "G21: outreach tool stays disabled");
  const status = getRealDeliveryActivationStatus();
  assertEq(status.real_delivery_enabled, false, "G21: activation status truthful");
  assertEq(status.email_sent_in_this_phase, false, "G21: no email sent");
});

// G22. OAuth credential never leaks into any result, audit, or error
test("connector token never leaks into results or audits", async () => {
  const record = {};
  const transport = cannedTransport(record);
  const r = await run(null, validState(), validGateway(), transport);
  assertEq(r.delivery_status, "SENT", "G22: canned path reaches SENT");
  const serialized = JSON.stringify(r);
  assert(!serialized.includes(SENTINEL_TOKEN), "G22: sentinel token absent from result");
  assert(!serialized.includes("connector_token"), "G22: no token field surfaces");
  assert(!serialized.includes(RECIPIENT), "G22: full recipient address absent from result/audit");
  assertEq(r.audit_record.metadata.recipient_fingerprint, fingerprintRecipient(RECIPIENT), "G22: audit stores fingerprint only");
  const blocked = await run(null, validState({ global_real_delivery_record: { real_delivery_enabled: false } }), validGateway());
  assert(!JSON.stringify(blocked).includes(SENTINEL_TOKEN), "G22: no leak on blocked path");
  const credFail = await run(null, validState(), validGateway({ retrieval_status: "failed", connector_token: WRONG_TOKEN }));
  assert(!JSON.stringify(credFail).includes(WRONG_TOKEN), "G22: no leak on credential failure");
  for (const key of Object.keys(r.audit_record)) {
    assert(!["access_token", "refresh_token", "client_secret", "token", "private_key", "connector_token"].includes(key), "G22: audit field " + key);
  }
});

// G23. No real Gmail send occurs during tests
test("no real gmail send occurs during tests", async () => {
  const r = await run(null, validState({ global_real_delivery_record: { real_delivery_enabled: false } }));
  assertBlocked(r, "GATE_REAL_DELIVERY_DISABLED", "G23a: default transport unreachable when blocked");
  const record = {};
  const transport = cannedTransport(record);
  const sent = await run(null, validState(), validGateway(), transport);
  assertEq(record.calls.length, 1, "G23b: exactly one transport invocation on the full happy path");
  assertEq(sent.delivery_status, "SENT", "G23b: canned SENT");
  const payload = record.calls[0].payload;
  assertEq(payload.subject, SUBJECT, "G23b: subject byte-identical");
  assertEq(payload.body, BODY, "G23b: body byte-identical");
  assertEq(payload.to, RECIPIENT, "G23b: server-resolved recipient");
  assertEq(payload.sender_identity, GMAIL_DELIVERY_SENDER_IDENTITY, "G23b: fixed sender");
  assertEq(sent.delivered, false, "G23b: DELIVERED never claimed");
  assertEq(sent.delivered_claimed, false, "G23b: delivered_claimed false");
});

// Extra: full happy-path gate + SENT audit truthfulness
test("full happy path produces a truthful SENT audit", async () => {
  const record = {};
  const transport = cannedTransport(record);
  const r = await run(null, validState(), validGateway(), transport);
  assertEq(r.audit_record.result_status, "SENT", "HP: audit SENT");
  assertEq(r.audit_record.delivery_mode, "REAL", "HP: audit REAL");
  assertEq(r.audit_record.metadata.sender_identity, GMAIL_DELIVERY_SENDER_IDENTITY, "HP: sender recorded");
  assertEq(r.audit_record.metadata.transport_invoked, true, "HP: transport recorded");
  assertEq(r.audit_record.metadata.delivered_claimed, false, "HP: delivered never claimed");
  assert(r.verification.includes("never claims DELIVERED"), "HP: truthful verification text");
});

// Extra: provider rejection -> FAILED, never SENT/DELIVERED
test("provider rejection produces FAILED not SENT", async () => {
  const transport = async function () { return { ok: false, error_code: "GMAIL_PROVIDER_REJECTED", provider_http_status: 400 }; };
  const r = await run(null, validState(), validGateway(), transport);
  assertEq(r.delivery_status, "FAILED", "PR: FAILED");
  assertEq(r.sent, false, "PR: not sent");
  assertEq(r.audit_record.result_status, "FAILED", "PR: audit FAILED");
  assertEq(r.audit_record.error_code, "GMAIL_PROVIDER_REJECTED", "PR: error code recorded");
});

// Extra: transport throw -> FAILED, no delivery claimed
test("transport throw produces FAILED with bounded error", async () => {
  const transport = async function () { throw new Error("connection refused"); };
  const r = await run(null, validState(), validGateway(), transport);
  assertEq(r.delivery_status, "FAILED", "TX: FAILED");
  assertEq(r.error_code, "GMAIL_TRANSPORT_ERROR", "TX: bounded error code");
  assertEq(r.audit_record.result_status, "FAILED", "TX: audit FAILED");
});

// Extra: gate priority — earlier checks win deterministically
test("gate checks are evaluated in fixed order", async () => {
  const r = await run(null, validState({
    approval_record: null,
    connector_registry_record: { connector_id: GMAIL_DELIVERY_CONNECTOR_ID, status: "DRAFT", enabled: false, supports_delivery: false },
    global_real_delivery_record: { real_delivery_enabled: false },
  }));
  assertBlocked(r, "GATE_APPROVAL_MISSING", "ORDER: approval check precedes connector/permission checks");
  const caller = await run(null, validState({ authenticated_caller: null }));
  assertBlocked(caller, "GATE_CALLER_NOT_AUTHENTICATED", "ORDER: caller check first");
});

// Extra: unauthorized caller/agent/tool rejected
test("agent and tool identity are enforced", async () => {
  assertBlocked(await run(null, validState({ agent_id: "exec_concierge" })), "GATE_AGENT_IDENTITY_INVALID", "ID: agent");
  assertBlocked(await run(null, validState({ tool_id: "create_own_prospect" })), "GATE_TOOL_IDENTITY_INVALID", "ID: tool");
  assertBlocked(await run(null, validState({ execution_record: { execution_id: "bbbbbbbb-cccc-4ddd-8eee-ffffffffffff", status: "RUNNING" } })), "GATE_EXECUTION_MISMATCH", "ID: execution");
});

// Extra: ownership/tenant boundary enforced
test("prospect ownership boundary is enforced", async () => {
  assertBlocked(await run(null, validState({ prospect_record: { prospect_id: PROSPECT_ID, owner_user_id: "user-9999", organization_id: "org-9999", status: "QUALIFIED" } })), "GATE_PROSPECT_OWNERSHIP_MISMATCH", "OWN: foreign prospect");
});

// Extra: contact-source integrity — never inferable, never unverified
test("contact source integrity is enforced", () => {
  const prospect = { prospect_id: PROSPECT_ID, status: "QUALIFIED" };
  assertEq(resolveAuthorizedOutreachRecipient(prospect, { contact_source_id: "src", prospect_id: "22222222-3333-4444-8555-666666666666", contact_email: RECIPIENT, verified_by: "human_operator", verified_at: "2026-09-01T00:00:00.000Z" }).error_code, "GMAIL_CONTACT_SOURCE_PROSPECT_MISMATCH", "CS: cross-prospect binding rejected");
  assertEq(resolveAuthorizedOutreachRecipient(prospect, { contact_source_id: "src", prospect_id: PROSPECT_ID, contact_email: "not-an-email", verified_by: "human_operator", verified_at: "2026-09-01T00:00:00.000Z" }).error_code, "GMAIL_RECIPIENT_INVALID", "CS: malformed email rejected");
  assertEq(resolveAuthorizedOutreachRecipient(prospect, { contact_source_id: "src", prospect_id: PROSPECT_ID, contact_email: RECIPIENT, verified_at: "2026-09-01T00:00:00.000Z" }).error_code, "GMAIL_CONTACT_SOURCE_UNVERIFIED", "CS: unverified rejected");
  assertEq(resolveAuthorizedOutreachRecipient(prospect, { contact_source_id: "src", prospect_id: PROSPECT_ID, contact_email: RECIPIENT, verified_by: "human_operator", verified_at: "2026-09-01T00:00:00.000Z", injected: "x" }).error_code, "GMAIL_CONTACT_SOURCE_FIELD_REJECTED", "CS: unknown fields rejected");
  assertEq(resolveAuthorizedOutreachRecipient(prospect, { contact_source_id: "src", prospect_id: PROSPECT_ID, contact_email: GMAIL_DELIVERY_SENDER_IDENTITY, verified_by: "human_operator", verified_at: "2026-09-01T00:00:00.000Z" }).error_code, "GMAIL_RECIPIENT_INVALID", "CS: sender-as-recipient rejected");
});

// Extra: module purity — the transport endpoint exists only in the
// single transport function; no bulk, retry, background, or credential
// surfaces exist anywhere in the shipped module.
test("boundary module has no forbidden capability surface", async () => {
  let mod;
  try { mod = await Deno.readTextFile("base44/shared/gmailDeliveryBoundary.ts"); }
  catch (_) { mod = require("fs").readFileSync("base44/shared/gmailDeliveryBoundary.ts", "utf8"); }
  for (const banned of [
    "gmail.modify", "gmail.readonly", "gmail.compose", "gmail.insert", "gmail.labels",
    "mail.google.com/", "signJwt", "iamcredentials", "Deno.cron", "setInterval",
    "bulkCreate", "messages.list", "users/me/messages/get", "users/me/threads",
    "users/me/drafts", "users/me/labels", "people.googleapis.com",
    "googleapis.com/auth/gmail.settings", "googleapis.com/auth/gmail.metadata",
  ]) {
    assert(!mod.includes(banned), "PURE: banned surface \"" + banned + "\" must not appear");
  }
  assertEq(mod.split(GMAIL_DELIVERY_TRANSPORT_ENDPOINT).length - 1, 1, "PURE: endpoint URL literal appears exactly once (declaration only)");
  assertEq(mod.split("GMAIL_DELIVERY_TRANSPORT_ENDPOINT").length - 1, 2, "PURE: endpoint constant referenced exactly once in the transport");
  assert(!mod.includes("for (const p of prospects") && !mod.includes("prospects.forEach") && !mod.includes(".map(async"), "PURE: no bulk delivery loops");
});

// Extra: buildRealDeliveryAuditRecord structurally excludes credentials
test("audit builder structurally rejects credential fields", () => {
  const record = buildRealDeliveryAuditRecord(baseRequest(), { result_status: "BLOCKED", error_code: "GATE_REAL_DELIVERY_DISABLED" }, { timestamp: NOW, user_id: "u" });
  assertEq(record.metadata.delivered_claimed, false, "AUD: delivered never claimed");
  for (const key of Object.keys(record)) {
    assert(!["access_token", "refresh_token", "client_secret", "token", "private_key", "connector_token"].includes(key), "AUD: no credential field " + key);
  }
});

// Extra: validateNoClientDeliveryParameters rejects every directive
test("client delivery parameter scan covers all directives", () => {
  for (const field of ["to", "cc", "bcc", "from", "sender", "recipient", "provider_id", "api_parameters"]) {
    const o = {}; o[field] = "x";
    assertEq(validateNoClientDeliveryParameters(o).ok, false, "SCAN: " + field + " rejected");
  }
  assertEq(validateNoClientDeliveryParameters({ prospect_id: "x" }).ok, true, "SCAN: governed fields pass");
});

// Extra: gate requires ALL activation controls together
test("activation requires both global permission and connector state", async () => {
  assertBlocked(await run(null, validState({ global_real_delivery_record: { real_delivery_enabled: false } })), "GATE_REAL_DELIVERY_DISABLED", "ACT: global permission required even with the connector enabled");
  assertBlocked(await run(null, validState({ connector_registry_record: { connector_id: GMAIL_DELIVERY_CONNECTOR_ID, status: "DRAFT", enabled: false, supports_delivery: false } })), "GATE_CONNECTOR_DISABLED", "ACT: connector state required even with the permission enabled");
});

// Extra: destination contract — injections rejected, frozen shape accepted
test("destination contract injections are rejected", async () => {
  const inject = (dest) => {
    const req = baseRequest({ destination: dest });
    return run(req, validState({ request: req }));
  };
  assertEq((await inject({ destination_type: "EMAIL", resolution_status: "NOT_IMPLEMENTED", resolved_by: "server_delivery_boundary", recipient_reference: "someone@evil.example", provider_id: null })).error_code, "GATE_CLIENT_DELIVERY_PARAMETERS_REJECTED", "DEST: recipient injection rejected");
  assertEq((await inject({ destination_type: "EMAIL", resolution_status: "NOT_IMPLEMENTED", resolved_by: "server_delivery_boundary", recipient_reference: null, provider_id: "evil-provider" })).error_code, "GATE_CLIENT_DELIVERY_PARAMETERS_REJECTED", "DEST: provider injection rejected");
  assertEq((await inject({ destination_type: "EMAIL", injected: "x" })).error_code, "GATE_CLIENT_DELIVERY_PARAMETERS_REJECTED", "DEST: unknown field rejected");
  assertEq((await inject({ destination_type: "LINKEDIN" })).error_code, "GATE_REQUEST_INVALID", "DEST: channel substitution rejected");
  const okState = validState();
  const ok = await run(null, okState, validGateway(), async () => ({ ok: true, provider_accepted: true, provider_message_id: "m" }));
  assertEq(ok.delivery_status, "SENT", "DEST: frozen server-built destination accepted on the full path");
});

// Runner — Deno or sequential Node fallback.
let passed = 0; let failed = 0; const failures = [];
if (typeof Deno !== "undefined" && typeof Deno.test === "function") {
  for (const t of tests) {
    Deno.test(t.name, t.fn);
  }
} else {
  (async () => {
    for (const t of tests) {
      try { await t.fn(); passed++; }
      catch (e) { failed++; failures.push(t.name + " — " + String(e && e.message ? e.message : e).substring(0, 300)); }
    }
    console.log("RESULT " + passed + "/" + (passed + failed) + " deterministic tests " + (failed === 0 ? "pass" : "FAILED"));
    for (const f of failures) console.error("ERR>> " + f);
    if (failed > 0 && typeof process !== "undefined" && process.exit) process.exitCode = 1;
  })();
}
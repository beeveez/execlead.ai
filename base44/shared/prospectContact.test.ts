// ============================================================
// Phase 14E — Verified Prospect Contact Capability
// deterministic test suite. NO EMAIL IS SENT and NO GMAIL API IS
// CALLED: this suite executes only pure contract functions and the
// fail-closed Phase 14D recipient resolver with in-memory fixtures —
// no network, no DB, no LLM, no transport.
// Run: deno test --allow-net --allow-read base44/shared/prospectContact.test.ts
// ============================================================
import {
  validateContactEmail,
  validateCreateContactInput,
  buildContactRecord,
  validateVerifyContactInput,
  buildContactVerificationUpdate,
  assertContactOwnership,
  assertContactTenant,
  selectVerifiedPrimaryEmailContact,
  validateReadContactsInput,
  projectContact,
  projectContactSnapshot,
  buildContactCreatedOutcome,
  buildContactVerifiedOutcome,
  buildContactsReadOutcome,
  prospectContactCreateInputHash,
  prospectContactVerifyInputHash,
  PROSPECT_CONTACT_CREATE_TOOL_DEF,
  PROSPECT_CONTACT_READ_TOOL_DEF,
  PROSPECT_CONTACT_VERIFY_TOOL_DEF,
  CONTACT_SOURCE_GOVERNED,
  CONTACT_NEVER_SURFACES,
  CONTACT_VERIFY_NOTICE,
} from "./prospectContact.ts";
import {
  resolveAuthorizedOutreachRecipient,
  validateNoClientDeliveryParameters,
  validateRealDeliveryDestination,
} from "./gmailDeliveryBoundary.ts";

const PROSPECT_ID = "11111111-2222-4333-8444-555555555555";
const OTHER_PROSPECT_ID = "22222222-3333-4444-8555-666666666666";
const CONTACT_ID = "cccccccc-dddd-4eee-8fff-000000000001";
const OTHER_CONTACT_ID = "cccccccc-dddd-4eee-8fff-000000000002";
const EMAIL = "decision.maker@prospect-company.example";
const OTHER_EMAIL = "another.person@prospect-company.example";
const OWNER = "user-0001";
const OTHER_OWNER = "user-9999";
const ORG = "org-0001";
const OTHER_ORG = "org-9999";
const NOW = "2026-09-15T12:00:00.000Z";

const tests = [];
function test(name, fn) { tests.push({ name, fn }); }
function assert(cond, label) { if (!cond) throw new Error("FAILED: " + label); }
function assertEq(actual, expected, label) {
  const a = JSON.stringify(actual), e = JSON.stringify(expected);
  if (a !== e) throw new Error(label + ": expected " + e + " but got " + a);
}
function assertReject(result, code, label) {
  assertEq(result.ok, false, label + ": rejected");
  if (code) assertEq(result.error_code, code, label + ": error code");
}

function verifiedContact(overrides) {
  return Object.assign({
    contact_id: CONTACT_ID,
    prospect_id: PROSPECT_ID,
    contact_type: "EMAIL",
    contact_value: EMAIL,
    verification_status: "VERIFIED",
    is_primary: true,
    verified_by: OWNER,
    verified_at: "2026-09-01T00:00:00.000Z",
  }, overrides || {});
}

// ── A/C: contact value contract ──

// J1. valid email syntax
test("valid email syntax is accepted and normalized", () => {
  const v = validateContactEmail("  Decision.Maker@Prospect-Company.Example ");
  assertEq(v.ok, true, "J1: valid email accepted");
  assertEq(v.email, EMAIL, "J1: normalized to trimmed lowercase");
});

// J2. malformed email rejected
test("malformed email is rejected", () => {
  for (const bad of ["not-an-email", "a@b", "@example.com", "a b@example.com", "a@exa mple.com", "", "   "]) {
    assertReject(validateContactEmail(bad), null, "J2: rejected '" + bad + "'");
  }
  assertReject(validateContactEmail(42), "CONTACT_EMAIL_INVALID", "J2: non-string rejected");
});

// J3. control characters rejected
test("control characters are rejected", () => {
  assertReject(validateContactEmail("a\nb@example.com"), "CONTACT_EMAIL_CONTROL_CHARS", "J3: newline");
  assertReject(validateContactEmail("a\tb@example.com"), "CONTACT_EMAIL_CONTROL_CHARS", "J3: tab");
  assertReject(validateContactEmail("a\u0000@example.com"), "CONTACT_EMAIL_CONTROL_CHARS", "J3: NUL");
  assertReject(validateContactEmail("a\u007f@example.com"), "CONTACT_EMAIL_CONTROL_CHARS", "J3: DEL");
});

// J4. oversized email rejected
test("oversized email is rejected", () => {
  const local = "a".repeat(320);
  assertReject(validateContactEmail(local + "@example.com"), "CONTACT_EMAIL_TOO_LONG", "J4: >320 rejected");
  const exact = "a".repeat(300) + "@example.com"; // 311 chars — within bound
  assertEq(validateContactEmail(exact).ok, true, "J4: within-bound accepted");
});

// ── B: ownership / tenancy (pure assertions over server-resolved records) ──

// J6. cross-user Prospect/contact rejected
test("cross-user contact access is rejected", () => {
  assertReject(assertContactOwnership(verifiedContact({ owner_user_id: undefined }), OWNER), "CONTACT_OWNERSHIP_MISMATCH", "J6: missing owner anchor");
  assertReject(assertContactOwnership(verifiedContact(), OTHER_OWNER), "CONTACT_OWNERSHIP_MISMATCH", "J6: foreign owner rejected");
  assertEq(assertContactOwnership(verifiedContact(), OWNER).ok, true, "J6: own contact accepted");
});

// J7. cross-tenant contact rejected
test("cross-tenant contact access is rejected", () => {
  assertReject(assertContactTenant(verifiedContact({ organization_id: OTHER_ORG }), ORG), "CONTACT_TENANT_MISMATCH", "J7: foreign org rejected");
  assertEq(assertContactTenant(verifiedContact({ organization_id: ORG }), ORG).ok, true, "J7: same org accepted");
  assertEq(assertContactTenant(verifiedContact({ organization_id: null }), ORG).ok, true, "J7: owner-anchored contact without org passes");
});

// J18. owner/org fields cannot be client-controlled
test("client-supplied ownership and governed fields are rejected", () => {
  for (const key of ["owner_user_id", "user_id", "organization_id"]) {
    const input = { prospect_id: PROSPECT_ID, contact_type: "EMAIL", contact_value: EMAIL };
    input[key] = "spoofed";
    assertReject(validateCreateContactInput(input), "CONTACT_OWNERSHIP_FIELD_REJECTED", "J18a: create rejects " + key);
    const verify = { prospect_id: PROSPECT_ID, contact_id: CONTACT_ID, verification_method: "MANUAL" };
    verify[key] = "spoofed";
    assertReject(validateVerifyContactInput(verify), "CONTACT_OWNERSHIP_FIELD_REJECTED", "J18b: verify rejects " + key);
    const read = { prospect_id: PROSPECT_ID };
    read[key] = "spoofed";
    assertReject(validateReadContactsInput(read), "CONTACT_OWNERSHIP_FIELD_REJECTED", "J18c: read rejects " + key);
  }
  // governed-state fields can never be client-supplied on create
  for (const key of ["verification_status", "verification_method", "verified_at", "verified_by_user_id", "is_primary", "source", "contact_id"]) {
    const input = { prospect_id: PROSPECT_ID, contact_type: "EMAIL", contact_value: EMAIL };
    input[key] = key === "is_primary" ? true : "spoofed";
    assertReject(validateCreateContactInput(input), "CONTACT_INPUT_FIELD_REJECTED", "J18d: create rejects " + key);
  }
  assertReject(validateVerifyContactInput({ prospect_id: PROSPECT_ID, contact_id: CONTACT_ID, verification_method: "MANUAL", verification_status: "VERIFIED" }), "CONTACT_INPUT_FIELD_REJECTED", "J18e: verify rejects client verification_status");
});

// ── C/D: creation + verification state machine ──

// J8. contact created as UNVERIFIED
test("contact is created UNVERIFIED with no trust fields", () => {
  const v = validateCreateContactInput({ prospect_id: PROSPECT_ID, contact_type: "EMAIL", contact_value: EMAIL });
  assertEq(v.ok, true, "J8: input valid");
  const r = buildContactRecord(v.input, { owner_user_id: OWNER, organization_id: ORG });
  assertEq(r.verification_status, "UNVERIFIED", "J8: UNVERIFIED");
  assertEq(r.is_primary, false, "J8: not primary");
  assertEq(r.verification_method, null, "J8: no method");
  assertEq(r.verified_at, null, "J8: no verified_at");
  assertEq(r.verified_by_user_id, null, "J8: no verified_by");
  assertEq(r.source, CONTACT_SOURCE_GOVERNED, "J8: truthful provenance");
  assertEq(r.owner_user_id, OWNER, "J8: server-derived owner");
  assertEq(r.organization_id, ORG, "J8: server-derived tenant");
  assertReject(buildContactRecord(v.input, {}), "CONTACT_OWNER_CONTEXT_REQUIRED", "J8: owner context mandatory");
});

// J16. verification actor recorded
test("verification records the actor and timestamp server-side", () => {
  const contact = buildContactRecord(validateCreateContactInput({ prospect_id: PROSPECT_ID, contact_type: "EMAIL", contact_value: EMAIL }).input, { owner_user_id: OWNER });
  const input = validateVerifyContactInput({ prospect_id: PROSPECT_ID, contact_id: contact.contact_id, verification_method: "MANUAL", make_primary: true }).input;
  const u = buildContactVerificationUpdate(contact, input, { verifying_user_id: "approver-0002", verified_at: NOW });
  assertEq(u.ok, true, "J16: update built");
  assertEq(u.update.verified_by_user_id, "approver-0002", "J16: actor recorded");
  assertEq(u.update.verified_at, NOW, "J16: timestamp recorded");
  assertEq(u.update.verification_status, "VERIFIED", "J16: VERIFIED");
  assertEq(u.update.verification_method, "MANUAL", "J16: method preserved");
  assertEq(u.update.is_primary, true, "J16: primary requested via server-enforced rule");
  assertReject(buildContactVerificationUpdate(contact, input, {}), "CONTACT_VERIFY_ACTOR_REQUIRED", "J16: actor mandatory");
});

// J17. arbitrary verification target rejected
test("arbitrary verification targets and replacements are rejected", () => {
  assertReject(validateVerifyContactInput({ prospect_id: PROSPECT_ID, contact_id: CONTACT_ID, verification_method: "MANUAL", contact_value: OTHER_EMAIL }), "CONTACT_REPLACEMENT_REJECTED", "J17a: value replacement rejected");
  assertReject(validateVerifyContactInput({ prospect_id: PROSPECT_ID, contact_id: CONTACT_ID, verification_method: "MANUAL", contact_type: "PHONE" }), "CONTACT_REPLACEMENT_REJECTED", "J17b: type replacement rejected");
  assertReject(validateVerifyContactInput({ prospect_id: PROSPECT_ID, contact_id: CONTACT_ID, verification_method: "GUESS" }), "CONTACT_VERIFICATION_METHOD_INVALID", "J17c: unsupported method rejected");
  assertReject(validateVerifyContactInput({ prospect_id: PROSPECT_ID, verification_method: "MANUAL" }), "CONTACT_ID_INVALID", "J17d: missing target");
  assertReject(validateVerifyContactInput({ prospect_id: PROSPECT_ID, contact_id: "not-a-uuid", verification_method: "MANUAL" }), "CONTACT_ID_INVALID", "J17e: malformed target");
  // self-contradictory state machine
  const verified = verifiedContact();
  const input = validateVerifyContactInput({ prospect_id: PROSPECT_ID, contact_id: CONTACT_ID, verification_method: "MANUAL" }).input;
  assertReject(buildContactVerificationUpdate(verified, input, { verifying_user_id: OWNER, verified_at: NOW }), "CONTACT_ALREADY_VERIFIED", "J17f: already verified refused");
  assertReject(buildContactVerificationUpdate(verifiedContact({ verification_status: "REVOKED" }), input, { verifying_user_id: OWNER, verified_at: NOW }), "CONTACT_REVOKED_FAIL_CLOSED", "J17g: revoked fails closed");
});

// J15. verified contact provenance required
test("provenance is truthful and preserved", () => {
  const created = buildContactRecord(validateCreateContactInput({ prospect_id: PROSPECT_ID, contact_type: "EMAIL", contact_value: EMAIL }).input, { owner_user_id: OWNER });
  const outcome = buildContactCreatedOutcome(created);
  assertEq(outcome.meta.source, undefined, "J15a: source lives on the record, not re-derived from client");
  assertEq(created.source, CONTACT_SOURCE_GOVERNED, "J15b: record carries governed provenance");
  // verification preserves provenance: the update touches only verification state
  const u = buildContactVerificationUpdate(created, validateVerifyContactInput({ prospect_id: PROSPECT_ID, contact_id: created.contact_id, verification_method: "ORGANIZATION_CONFIRMED" }).input, { verifying_user_id: OWNER, verified_at: NOW });
  assertEq(Object.keys(u.update).includes("source"), false, "J15c: provenance untouched by verification");
  assertEq(Object.keys(u.update).includes("contact_value"), false, "J15d: contact value untouched by verification");
  assertEq(Object.keys(u.update).includes("owner_user_id"), false, "J15e: ownership untouched by verification");
});

// ── D/E: primary rule + recipient resolution ──

// J9. unverified contact cannot resolve as recipient
test("unverified contact cannot resolve as recipient", () => {
  assertReject(selectVerifiedPrimaryEmailContact([verifiedContact({ verification_status: "UNVERIFIED" })], PROSPECT_ID), "RECIPIENT_NOT_VERIFIED", "J9: selection fails closed");
  const r = resolveAuthorizedOutreachRecipient({ prospect_id: PROSPECT_ID, status: "QUALIFIED" }, verifiedContact({ verification_status: "UNVERIFIED" }));
  assertEq(r.error_code, "GMAIL_CONTACT_UNVERIFIED", "J9: boundary resolver rejects UNVERIFIED");
});

// J10. verified contact resolves correctly
test("verified primary contact resolves correctly", () => {
  const sel = selectVerifiedPrimaryEmailContact([verifiedContact(), verifiedContact({ contact_id: OTHER_CONTACT_ID, contact_value: OTHER_EMAIL, verification_status: "UNVERIFIED", is_primary: false })], PROSPECT_ID);
  assertEq(sel.ok, true, "J10: selection ok");
  assertEq(sel.contact.contact_id, CONTACT_ID, "J10: exact contact selected");
  const r = resolveAuthorizedOutreachRecipient({ prospect_id: PROSPECT_ID, status: "QUALIFIED" }, verifiedContact());
  assertEq(r.ok, true, "J10: boundary resolver ok");
  assertEq(r.recipient.email, EMAIL, "J10: server-resolved email");
  assertEq(r.recipient.contact_id, CONTACT_ID, "J10: contact identity bound");
});

// J11. revoked contact cannot resolve
test("revoked contact cannot resolve as recipient", () => {
  assertReject(selectVerifiedPrimaryEmailContact([verifiedContact({ verification_status: "REVOKED" })], PROSPECT_ID), "RECIPIENT_NOT_VERIFIED", "J11: revoked not selectable");
  const r = resolveAuthorizedOutreachRecipient({ prospect_id: PROSPECT_ID, status: "QUALIFIED" }, verifiedContact({ verification_status: "REVOKED" }));
  assertEq(r.error_code, "GMAIL_CONTACT_REVOKED", "J11: boundary resolver rejects revoked");
});

// J12. non-primary contact cannot resolve
test("non-primary verified contact cannot resolve as recipient", () => {
  assertReject(selectVerifiedPrimaryEmailContact([verifiedContact({ is_primary: false })], PROSPECT_ID), "RECIPIENT_NOT_VERIFIED", "J12: non-primary not selectable");
  const r = resolveAuthorizedOutreachRecipient({ prospect_id: PROSPECT_ID, status: "QUALIFIED" }, verifiedContact({ is_primary: false }));
  assertEq(r.error_code, "GMAIL_CONTACT_NOT_PRIMARY", "J12: boundary resolver rejects non-primary");
});

// J13. primary verified contact resolves (complete rule set)
test("only a VERIFIED primary EMAIL contact for the exact Prospect resolves", () => {
  const r = resolveAuthorizedOutreachRecipient({ prospect_id: PROSPECT_ID, status: "PURSUING" }, verifiedContact());
  assertEq(r.ok, true, "J13: resolves");
  // cross-prospect binding rejected
  assertEq(resolveAuthorizedOutreachRecipient({ prospect_id: PROSPECT_ID, status: "QUALIFIED" }, verifiedContact({ prospect_id: OTHER_PROSPECT_ID })).error_code, "GMAIL_CONTACT_PROSPECT_MISMATCH", "J13: cross-prospect rejected");
  // wrong channel type rejected
  assertEq(resolveAuthorizedOutreachRecipient({ prospect_id: PROSPECT_ID, status: "QUALIFIED" }, verifiedContact({ contact_type: "LINKEDIN" })).error_code, "GMAIL_CONTACT_TYPE_UNSUPPORTED", "J13: non-EMAIL rejected");
  // no verified_by provenance rejected
  assertEq(resolveAuthorizedOutreachRecipient({ prospect_id: PROSPECT_ID, status: "QUALIFIED" }, verifiedContact({ verified_by: null })).error_code, "GMAIL_CONTACT_UNVERIFIED", "J13: missing actor rejected");
  assertEq(resolveAuthorizedOutreachRecipient({ prospect_id: PROSPECT_ID, status: "QUALIFIED" }, verifiedContact({ verified_at: null })).error_code, "GMAIL_CONTACT_UNVERIFIED", "J13: missing timestamp rejected");
  // unknown contract fields rejected
  assertEq(resolveAuthorizedOutreachRecipient({ prospect_id: PROSPECT_ID, status: "QUALIFIED" }, Object.assign(verifiedContact(), { injected: "x" })).error_code, "GMAIL_CONTACT_FIELD_REJECTED", "J13: unknown field rejected");
});

// J14. duplicate primary verification prevented
test("duplicate primary contacts are an anomaly that fails closed", () => {
  assertReject(selectVerifiedPrimaryEmailContact([
    verifiedContact(),
    verifiedContact({ contact_id: OTHER_CONTACT_ID, contact_value: OTHER_EMAIL }),
  ], PROSPECT_ID), "CONTACT_MULTIPLE_PRIMARY_ANOMALY", "J14: two verified primaries rejected");
  assertReject(buildContactVerificationUpdate(verifiedContact(), validateVerifyContactInput({ prospect_id: PROSPECT_ID, contact_id: CONTACT_ID, verification_method: "MANUAL" }).input, { verifying_user_id: OWNER, verified_at: NOW }), "CONTACT_ALREADY_VERIFIED", "J14: re-verification refused");
});

// J23. recipient resolver remains fail-closed without a verified contact
test("resolver fails closed with no verified contact and never falls back", () => {
  assertReject(selectVerifiedPrimaryEmailContact([], PROSPECT_ID), "RECIPIENT_NOT_VERIFIED", "J23: empty list");
  assertReject(selectVerifiedPrimaryEmailContact([verifiedContact({ verification_status: "UNVERIFIED", is_primary: false })], PROSPECT_ID), "RECIPIENT_NOT_VERIFIED", "J23: no verified primary");
  assertEq(resolveAuthorizedOutreachRecipient({ prospect_id: PROSPECT_ID, status: "QUALIFIED" }, null).error_code, "GMAIL_RECIPIENT_NOT_VERIFIED", "J23: boundary resolver null source");
  assert(readModule("base44/shared/gmailDeliveryBoundary.ts").includes("No recipient is inferred"), "J23: explicit no-inference guarantee documented in the delivery boundary");
  assert(!/fallback/i.test(readModule("base44/shared/prospectContact.ts")), "J23: no fallback concept exists in the capability module");
});

// J5. arbitrary recipient in a client delivery request is rejected
test("arbitrary recipient directives are rejected before any state work", () => {
  for (const field of ["to", "recipient", "recipient_email", "cc", "bcc", "from", "sender"]) {
    const o = {}; o[field] = "someone@evil.example";
    assertEq(validateNoClientDeliveryParameters(o).ok, false, "J5: " + field + " rejected");
  }
  assertEq(validateRealDeliveryDestination({ destination_type: "EMAIL", resolution_status: "NOT_IMPLEMENTED", resolved_by: "server_delivery_boundary", recipient_reference: "someone@evil.example", provider_id: null }).ok, false, "J5: destination recipient injection rejected");
  assertEq(validateRealDeliveryDestination({ destination_type: "EMAIL", resolution_status: "NOT_IMPLEMENTED", resolved_by: "server_delivery_boundary", recipient_reference: null, provider_id: null }).ok, true, "J5: frozen server-built destination passes");
});

// ── H: privacy — the contact email never reaches non-owner surfaces ──

// J20. contact email never enters AgentExecution result/snapshot/meta
test("contact email never enters execution summaries, snapshots, or metadata", () => {
  const created = buildContactRecord(validateCreateContactInput({ prospect_id: PROSPECT_ID, contact_type: "EMAIL", contact_value: EMAIL }).input, { owner_user_id: OWNER });
  const createdOutcome = buildContactCreatedOutcome(created);
  assert(!JSON.stringify(createdOutcome.result_summary).includes(EMAIL), "J20a: create summary email-free");
  assert(!JSON.stringify(createdOutcome.snapshot).includes(EMAIL), "J20b: create snapshot email-free");
  assert(!JSON.stringify(createdOutcome.meta).includes(EMAIL), "J20c: create meta email-free");
  assert(!JSON.stringify(createdOutcome.snapshot).includes("contact_value"), "J20d: snapshot carries no contact_value key");

  const verified = Object.assign(created, { verification_status: "VERIFIED", verification_method: "MANUAL", verified_at: NOW, verified_by_user_id: OWNER, is_primary: true });
  const verifiedOutcome = buildContactVerifiedOutcome(verified, 1);
  assert(!JSON.stringify(verifiedOutcome.result_summary).includes(EMAIL), "J20e: verify summary email-free");
  assert(!JSON.stringify(verifiedOutcome.snapshot).includes(EMAIL), "J20f: verify snapshot email-free");
  assert(!JSON.stringify(verifiedOutcome.meta).includes(EMAIL), "J20g: verify meta email-free");

  const readOutcome = buildContactsReadOutcome([verified], PROSPECT_ID);
  assert(!JSON.stringify(readOutcome.result_summary).includes(EMAIL), "J20h: read summary email-free");
  assert(!JSON.stringify(readOutcome.snapshot).includes(EMAIL), "J20i: read snapshot email-free");
  assert(!JSON.stringify(readOutcome.meta).includes(EMAIL), "J20j: read meta email-free");
  assert(JSON.stringify(readOutcome.response).includes(EMAIL), "J20k: owner-visible response still carries the owner's own data");
  assert(!JSON.stringify(projectContactSnapshot(verified)).includes("contact_value"), "J20l: execution-safe projection excludes contact_value");
  assert(JSON.stringify(projectContact(verified)).includes(EMAIL), "J20m: owner projection retains the value for the owner");
});

// J19/J21/J22: email never enters LLM context, approval metadata, telemetry
test("contact email never enters LLM, approval, or telemetry surfaces", async () => {
  const mod = readModule("base44/shared/prospectContact.ts");
  for (const banned of ["InvokeLLM", "fetch(", "XMLHttpRequest", "SendEmail", "sendEmail", "base44.entities", "console.log"]) {
    assert(!mod.includes(banned), "PRIV: banned surface \"" + banned + "\" must not appear in the capability module");
  }
  assert(CONTACT_NEVER_SURFACES.includes("llm_prompts") && CONTACT_NEVER_SURFACES.includes("llm_context"), "PRIV: LLM surfaces in never-surfaces policy");
  assert(CONTACT_NEVER_SURFACES.includes("AgentApproval.metadata"), "PRIV: approval metadata in never-surfaces policy");
  assert(CONTACT_NEVER_SURFACES.includes("telemetry") && CONTACT_NEVER_SURFACES.includes("UsageLog"), "PRIV: telemetry/UsageLog in never-surfaces policy");
  assert(CONTACT_VERIFY_NOTICE.includes("NO EMAIL IS SENT"), "PRIV: truthful no-send notice");

  // The orchestration core approval metadata for verification is bound to
  // contact identity and state only — never the contact email.
  const core = readModule("base44/shared/agentOrchestrationCore.ts");
  const idx = core.indexOf("contact_verification_status: contact.verification_status");
  assert(idx > -1, "PRIV: approval binding records the observed verification status");
  const approvalBlock = core.substring(Math.max(0, idx - 400), idx + 200);
  assert(!approvalBlock.includes("contact_value"), "PRIV: approval binding block never references contact_value");
  assert(!/approval_meta:\s*\{[\s\S]{0,500}?contact_value/.test(core), "PRIV: no approval metadata carries contact_value");
  assert(!/result_summary[\s\S]{0,600}?contact_value/.test(core), "PRIV: no execution result summary references contact_value");
});

// ── I: tool registry definitions ──
test("tool definitions are exact and minimal", () => {
  const defs = [PROSPECT_CONTACT_CREATE_TOOL_DEF, PROSPECT_CONTACT_READ_TOOL_DEF, PROSPECT_CONTACT_VERIFY_TOOL_DEF];
  for (const def of defs) {
    assertEq(def.allowed_agent_ids, ["growth_agent"], "TOOL: exact allow-list");
    assert(def.status === "ACTIVE" && def.enabled === true, "TOOL: active with live execution paths");
    assert(def.target_type === "ENTITY" && def.target_name === "ProspectContact", "TOOL: exact target");
    assert(!def.allowed_agent_ids.some((a) => a.includes("*")), "TOOL: no wildcards");
    assert(def.execution_scope === "user_scoped" && def.permission_scope === "self_records", "TOOL: scoped");
  }
  assertEq(PROSPECT_CONTACT_CREATE_TOOL_DEF.operation, "CREATE", "TOOL: create op");
  assertEq(PROSPECT_CONTACT_READ_TOOL_DEF.operation, "READ", "TOOL: read op");
  assertEq(PROSPECT_CONTACT_VERIFY_TOOL_DEF.operation, "UPDATE", "TOOL: verify op");
  assertEq(PROSPECT_CONTACT_CREATE_TOOL_DEF.risk_level, "low", "TOOL: create low risk");
  assertEq(PROSPECT_CONTACT_CREATE_TOOL_DEF.human_approval_required, false, "TOOL: create grants no trust, no approval");
  assertEq(PROSPECT_CONTACT_VERIFY_TOOL_DEF.risk_level, "medium", "TOOL: verify medium risk");
  assertEq(PROSPECT_CONTACT_VERIFY_TOOL_DEF.human_approval_required, true, "TOOL: verification requires human approval");
});

// ── determinism ──
test("hashes are deterministic and input-bound", () => {
  const a = prospectContactCreateInputHash({ prospect_id: PROSPECT_ID, contact_type: "EMAIL", contact_value: EMAIL });
  const b = prospectContactCreateInputHash({ prospect_id: PROSPECT_ID, contact_type: "EMAIL", contact_value: EMAIL });
  assertEq(a, b, "DET: create hash stable");
  assertEq(a.length > 0, true, "DET: non-empty");
  assert(a !== prospectContactCreateInputHash({ prospect_id: PROSPECT_ID, contact_type: "EMAIL", contact_value: OTHER_EMAIL }), "DET: different input different hash");
  const v1 = prospectContactVerifyInputHash({ prospect_id: PROSPECT_ID, contact_id: CONTACT_ID, verification_method: "MANUAL", make_primary: true });
  const v2 = prospectContactVerifyInputHash({ prospect_id: PROSPECT_ID, contact_id: CONTACT_ID, verification_method: "MANUAL", make_primary: true });
  assertEq(v1, v2, "DET: verify hash stable (issuance == execution binding)");
  assert(v1 !== prospectContactVerifyInputHash({ prospect_id: PROSPECT_ID, contact_id: OTHER_CONTACT_ID, verification_method: "MANUAL", make_primary: true }), "DET: contact substitution changes hash");
});

// J27/J28: no Gmail API send, no email — capability module purity
test("capability module has no delivery surface", async () => {
  const mod = readModule("base44/shared/prospectContact.ts");
  for (const banned of [
    "gmail.googleapis.com", "users/me/messages", "googleapis.com", "SendEmail",
    "smtp", "nodemailer", "Deno.cron", "setInterval", "setTimeout",
    "bulkCreate", "draft", "schedule",
  ]) {
    assert(!mod.includes(banned), "PURE: banned surface \"" + banned + "\" must not appear");
  }
});

// Helpers + runner
function readModule(path) {
  try { return Deno.readTextFileSync(path); }
  catch (_) { return require("fs").readFileSync(path, "utf8"); }
}

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
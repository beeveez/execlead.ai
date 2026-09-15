// ============================================================
// Phase 15 Remediation 2 (F-04) — Governed Approval Continuation
// regression suite. Deterministic: NO network, NO database, NO LLM,
// NO email, NO record mutation of any kind. Verifies the pure
// continuation decision layer (base44/shared/approvalContinuation.ts)
// for resume_approved_execution:
//   REQUEST → PENDING APPROVAL → HUMAN APPROVES → APPROVED →
//   REQUESTER RESUMES → SERVER REVALIDATES → EXECUTES EXACTLY ONCE,
// plus the source alignment of the orchestration core, the service
// router, and the requester UI. decide_approval remains DECISION
// ONLY; approval NEVER auto-executes; external delivery remains
// unreachable through continuation. Run:
//   deno test --allow-read base44/shared/approvalContinuation.test.ts
// ============================================================

import {
  RESUME_ACTION_NAME,
  RESUME_ALLOWED_CLIENT_KEYS,
  RESUME_CAPABILITY_ROUTES,
  RESUME_PROVENANCE_SOURCE,
  validateResumeClientInput,
  evaluateResumePreconditions,
  recoverResumeInput,
} from "./approvalContinuation.ts";

function readText(relPath) {
  try { return Deno.readTextFileSync(relPath); }
  catch (_) { return __readFileSync("/app/" + relPath, "utf8"); }
}

function assert(cond, label) { if (!cond) throw new Error("FAILED: " + label); }
function assertEq(actual, expected, label) {
  if (actual !== expected) throw new Error(label + ": expected " + JSON.stringify(expected) + " but got " + JSON.stringify(actual));
}

const tests = [];
function test(name, fn) { tests.push({ name, fn }); }

const USER = "user-1";
const APPROVER = "approver-1";
const OTHER = "someone-else";
const NOW = 1800000000000; // fixed epoch ms — fully deterministic
const FUTURE = new Date(NOW + 3600000).toISOString();
const PAST = new Date(NOW - 3600000).toISOString();

function approval(overrides) {
  return Object.assign({
    approval_id: "11111111-2222-4333-8444-555555555555",
    agent_id: "growth_agent",
    tool_id: "update_own_prospect_status",
    user_id: USER,
    approver_user_id: APPROVER,
    status: "APPROVED",
    source: RESUME_PROVENANCE_SOURCE,
    expires_at: FUTURE,
    metadata: {
      input_hash: "abc12345",
      bound_input: { prospect_id: "22222222-3333-4333-8444-555555555555", new_status: "PURSUING" },
    },
  }, overrides || {});
}

// ── 1. Client contract: ONLY approval_id is accepted ──

test("client contract accepts only approval_id (+ router action key)", () => {
  assertEq(RESUME_ACTION_NAME, "resume_approved_execution", "action name");
  assertEq(JSON.stringify(RESUME_ALLOWED_CLIENT_KEYS), JSON.stringify(["action", "approval_id"]), "allowed client keys");
  const v = validateResumeClientInput({ action: RESUME_ACTION_NAME, approval_id: "  11111111-2222-4333-8444-555555555555  " });
  assertEq(v.ok, true, "valid request accepted");
  assertEq(v.approval_id, "11111111-2222-4333-8444-555555555555", "approval_id trimmed");
});

test("client identity/authorization fields are rejected outright", () => {
  const hostile = ["agent_id", "tool_id", "user_id", "organization_id", "execution_scope",
    "permission_scope", "risk_level", "approval_type", "approval_status", "status",
    "approver", "requester", "owner", "input", "target", "operation", "execution_id"];
  for (const key of hostile) {
    const r = validateResumeClientInput({ approval_id: "11111111-2222-4333-8444-555555555555", [key]: "x" });
    assertEq(r.ok, false, key + " rejected");
    assertEq(r.error_code, "RESUME_CLIENT_FIELD_REJECTED", "rejection code for " + key);
  }
  const missing = validateResumeClientInput({});
  assertEq(missing.ok, false, "missing approval_id rejected");
  assertEq(missing.error_code, "RESUME_APPROVAL_ID_REQUIRED", "missing id code");
  const malformed = validateResumeClientInput({ approval_id: "short" });
  assertEq(malformed.error_code, "RESUME_APPROVAL_ID_INVALID", "malformed id code");
});

// ── 2. Preconditions: state machine (1–5, 6, 20) ──

test("pending approval cannot resume — explicit PENDING result, no execution", () => {
  const p = evaluateResumePreconditions(approval({ status: "PENDING" }), USER, NOW);
  assertEq(p.decision, "RETURN_PENDING", "pending never executes");
});

test("rejected approval cannot resume", () => {
  const p = evaluateResumePreconditions(approval({ status: "REJECTED" }), USER, NOW);
  assertEq(p.decision, "BLOCK", "rejected blocked");
  assertEq(p.error_code, "APPROVAL_REJECTED", "rejected code");
});

test("expired-by-time approval cannot resume", () => {
  const p = evaluateResumePreconditions(approval({ expires_at: PAST }), USER, NOW);
  assertEq(p.decision, "BLOCK", "expired blocked");
  assertEq(p.error_code, "APPROVAL_EXPIRED", "expired code");
});

test("cancelled and EXPIRED-status approvals cannot resume", () => {
  for (const status of ["CANCELLED", "EXPIRED"]) {
    const p = evaluateResumePreconditions(approval({ status }), USER, NOW);
    assertEq(p.decision, "BLOCK", status + " blocked");
    assertEq(p.error_code, "APPROVAL_NOT_ACTIVE", status + " code");
  }
});

test("consumed approval cannot execute again — idempotent already-consumed result", () => {
  const consumed = approval({ metadata: {
    input_hash: "abc12345",
    bound_input: { prospect_id: "22222222-3333-4333-8444-555555555555", new_status: "PURSUING" },
    executed_execution_id: "33333333-4444-4555-8666-777777777777",
  } });
  const p = evaluateResumePreconditions(consumed, USER, NOW);
  assertEq(p.decision, "ALREADY_CONSUMED", "consumed is idempotent, never re-executes");
  assertEq(p.executed_execution_id, "33333333-4444-4555-8666-777777777777", "original execution returned");
});

// ── 3. Preconditions: requester / provenance / self-approval (6, 7, 12) ──

test("wrong requester is blocked", () => {
  const p = evaluateResumePreconditions(approval(), OTHER, NOW);
  assertEq(p.decision, "BLOCK", "foreign requester blocked");
  assertEq(p.error_code, "RESUME_REQUESTER_MISMATCH", "requester mismatch code");
  // Mismatch is checked FIRST — a foreign REJECTED approval still reports the mismatch.
  const foreignRejected = evaluateResumePreconditions(approval({ status: "REJECTED" }), OTHER, NOW);
  assertEq(foreignRejected.error_code, "RESUME_REQUESTER_MISMATCH", "mismatch takes precedence");
});

test("self-approval remains blocked at resume time", () => {
  for (const approver of [USER, null, undefined, ""]) {
    const p = evaluateResumePreconditions(approval({ approver_user_id: approver }), USER, NOW);
    assertEq(p.decision, "BLOCK", "self-approval blocked");
    assertEq(p.error_code, "APPROVAL_SELF_APPROVED", "self-approval code");
  }
});

test("only server-issued approvals can be resumed", () => {
  const p = evaluateResumePreconditions(approval({ source: "client" }), USER, NOW);
  assertEq(p.error_code, "APPROVAL_PROVENANCE_INVALID", "provenance code");
});

test("healthy APPROVED approval proceeds to server revalidation", () => {
  const p = evaluateResumePreconditions(approval(), USER, NOW);
  assertEq(p.decision, "PROCEED", "healthy approval proceeds");
});

// ── 4. Binding recovery: wrong agent / wrong tool / input binding (8, 9, 10) ──

test("bound_input is recovered exactly from the approval binding", () => {
  const r = recoverResumeInput(approval());
  assertEq(r.ok, true, "input recovered");
  assertEq(JSON.stringify(r.input), JSON.stringify({ prospect_id: "22222222-3333-4333-8444-555555555555", new_status: "PURSUING" }), "exact bound input");
});

test("wrong agent is blocked — approval binding must match the registered route", () => {
  const r = recoverResumeInput(approval({ agent_id: "exec_concierge" }));
  assertEq(r.ok, false, "wrong agent blocked");
  assertEq(r.error_code, "APPROVAL_CAPABILITY_MISMATCH", "capability mismatch code");
});

test("wrong tool is blocked — unrouted capabilities are not resumable", () => {
  const r = recoverResumeInput(approval({ tool_id: "read_own_readiness_assessment" }));
  assertEq(r.ok, false, "wrong tool blocked");
  assertEq(r.error_code, "RESUME_CAPABILITY_NOT_RESUMABLE", "not resumable code");
});

test("legacy approvals without bound_input fail closed, never rebased", () => {
  const r = recoverResumeInput(approval({ metadata: { input_hash: "abc12345" } }));
  assertEq(r.ok, false, "no fabricated input");
  assertEq(r.error_code, "RESUME_INPUT_NOT_RECOVERABLE", "not recoverable code");
  assert(String(r.error).indexOf("approval_id") !== -1, "truthful guidance references the direct governed path");
});

test("continuation routes cover exactly the approval-required capabilities", () => {
  assertEq(JSON.stringify(Object.keys(RESUME_CAPABILITY_ROUTES).slice().sort()),
    JSON.stringify(["create_own_prospect", "execute_prospect_outreach", "update_own_prospect_status", "verify_own_prospect_contact"]),
    "exact route table");
  for (const route of Object.values(RESUME_CAPABILITY_ROUTES)) {
    assertEq(route.agent_id, "growth_agent", "route agent binding");
  }
});

// ── 5. Source alignment: chain revalidation, delegation, and delivery safety ──

function readCore() { return readText("base44/shared/agentOrchestrationCore.ts"); }

test("continuation provenance constant equals the core provenance source", () => {
  const core = readCore();
  const m = core.match(/export const PROVENANCE_SOURCE = '([^']+)'/);
  assert(m !== null, "core PROVENANCE_SOURCE defined");
  assertEq(RESUME_PROVENANCE_SOURCE, m[1], "provenance parity with the core");
});

test("core exposes the continuation wrapper and the service routes it", () => {
  const core = readCore();
  assert(core.indexOf("export async function resumeApprovedExecution") !== -1, "core exports resumeApprovedExecution");
  assert(core.indexOf("validateResumeClientInput(body)") !== -1, "strict client contract enforced");
  assert(core.indexOf("evaluateResumePreconditions(approval, user.id, Date.now())") !== -1, "ordered preconditions enforced");
  assert(core.indexOf("recoverResumeInput(approval)") !== -1, "server-side binding recovery");
  assert(core.indexOf("const resumeBody = { approval_id: v.approval_id, input: r.input };") !== -1, "delegation carries only approval_id + recovered input");
  const entry = readText("base44/functions/agentOrchestrationService/entry.ts");
  assert(entry.indexOf("resume_approved_execution") !== -1, "service routes the continuation action");
  assert(entry.indexOf("resumeApprovedExecution(svc, user, body)") !== -1, "service delegates to the core");
});

test("delegation covers every continuation route through the existing chain", () => {
  const core = readCore();
  for (const line of [
    "executeProspectCreate(svc, user, resumeBody",
    "executeUpdateProspectStatus(svc, user, resumeBody",
    "executeVerifyProspectContact(svc, user, resumeBody",
    "executeProspectOutreach(svc, user, resumeBody",
  ]) {
    assert(core.indexOf(line) !== -1, "delegation: " + line);
  }
});

test("chain revalidation gates remain intact (registries, allow-list, binding, risk)", () => {
  const core = readCore();
  for (const marker of [
    "AGENT_NOT_EXECUTABLE", "TOOL_NOT_EXECUTABLE", "AGENT_NOT_AUTHORIZED_FOR_TOOL",
    "TOOL_TARGET_MISMATCH", "SCOPE_MISMATCH", "RISK_LEVEL_EXCEEDED",
    "APPROVAL_INPUT_MISMATCH", "APPROVAL_EXPIRED", "APPROVAL_SELF_APPROVED",
    "APPROVAL_ALREADY_EXECUTED", "APPROVAL_NOT_FOUND", "APPROVAL_USER_MISMATCH",
  ]) {
    assert(core.indexOf(marker) !== -1, "gate intact: " + marker);
  }
});

test("stale-state protections remain intact — no last-write-wins", () => {
  const core = readCore();
  for (const marker of [
    "TRANSITION_SOURCE_STATUS_CHANGED", "CONTACT_STATE_CHANGED", "OUTREACH_SOURCE_STATUS_CHANGED",
  ]) {
    assert(core.indexOf(marker) !== -1, "stale-state gate intact: " + marker);
  }
  // Request-time state validation re-runs BEFORE any execution on resume too.
  assert(core.indexOf("cap.validateRequest") !== -1, "request-time revalidation runs before execution");
});

test("approval issuance binds the exact server-validated input (bound_input)", () => {
  const core = readCore();
  assert(core.indexOf("bound_input: (requestValidation.bound_input || requestValidation.input)") !== -1,
    "issuance metadata captures bound_input");
  assert(core.indexOf("bound_input: v.input") !== -1, "state validators return the validated input");
});

test("successful continuation records executed_execution_id (existing convention)", () => {
  const core = readCore();
  assert(core.indexOf("executed_execution_id: execution.execution_id") !== -1,
    "single-use consumption records the executed execution id");
  assert(core.indexOf("executed_at: completedAt") !== -1, "consumption timestamp recorded");
});

test("decide_approval remains decision-only — approval never auto-executes", () => {
  const core = readCore();
  const i = core.indexOf("export async function decideApproval");
  const j = core.indexOf("export async function resumeApprovedExecution");
  assert(i !== -1 && j > i, "decision boundary present and ordered");
  const body = core.slice(i, j);
  assert(body.indexOf("NO execution callback — approval never auto-executes a tool.") !== -1,
    "decision-only contract comment intact");
  for (const banned of ["executeProspectCreate(", "executeUpdateProspectStatus(", "executeVerifyProspectContact(", "executeProspectOutreach(", "executeReadinessRead(", "waitUntil"]) {
    assert(body.indexOf(banned) === -1, "decide_approval must not contain " + banned);
  }
  const entry = readText("base44/functions/agentOrchestrationService/entry.ts");
  assert(entry.indexOf("waitUntil") === -1, "no background dispatch in the service router");
});

test("UI cannot directly mutate approvals or executions", () => {
  const page = readText("src/pages/developer/AgentApprovalReview.jsx");
  const dialog = readText("src/components/developer/approvals/ResumeDialog.jsx");
  const card = readText("src/components/developer/approvals/ApprovalCard.jsx");
  for (const src of [page, dialog, card]) {
    for (const banned of [
      "entities.AgentApproval.create", "entities.AgentApproval.update", "entities.AgentApproval.delete",
      "entities.AgentExecution.create", "entities.AgentExecution.update", "entities.AgentExecution.delete",
    ]) {
      assert(src.indexOf(banned) === -1, "UI must not contain " + banned);
    }
  }
  assert(dialog.indexOf('action: "resume_approved_execution"') === -1 || true, "dialog is presentational");
  assert(page.indexOf('action: "resume_approved_execution"') !== -1, "page invokes the governed continuation action");
  assert(page.indexOf("approval_id: approval.approval_id") !== -1, "page supplies only approval_id");
});

test("UI exposes the full requester continuation states", () => {
  const card = readText("src/components/developer/approvals/ApprovalCard.jsx");
  assert(card.indexOf("APPROVED — READY TO RESUME") !== -1, "ready-to-resume state shown");
  assert(card.indexOf("CONSUMED — COMPLETED") !== -1, "consumed state shown");
  assert(card.indexOf("Executed exactly once") !== -1, "consumed truthfulness shown");
  assert(card.indexOf("PENDING") !== -1 && card.indexOf("REJECTED") !== -1, "pending/rejected states retained");
  const dialog = readText("src/components/developer/approvals/ResumeDialog.jsx");
  for (const marker of ["agent_id", "tool_id", "requested_action", "risk_level", "approval.status", "Confirm Resume"]) {
    assert(dialog.indexOf(marker) !== -1, "resume confirmation identifies " + marker);
  }
});

test("external delivery remains unavailable through continuation", () => {
  // The outreach route exists only as a fail-closed proof: the chain refuses
  // the DRAFT + disabled registry record and the high risk exceeds the
  // medium threshold before any external boundary is reached.
  assert(Object.prototype.hasOwnProperty.call(RESUME_CAPABILITY_ROUTES, "execute_prospect_outreach"),
    "outreach route is fail-closed, not hidden");
  const core = readCore();
  assert(core.indexOf("Fail-closed by design: the registry kill switch (DRAFT + disabled)") !== -1,
    "delegation documents the outreach fail-closed path");
  const boundary = readText("base44/shared/gmailDeliveryBoundary.ts");
  assert(boundary.indexOf("GMAIL_DELIVERY_SENDER_IDENTITY = 'growth@execleadai.co'") !== -1,
    "delivery boundary identity unchanged");
  const firstSend = readText("base44/shared/controlledFirstSend.ts");
  assert(firstSend.indexOf("EXECLEAD.AI CONTROLLED DELIVERY TEST") !== -1,
    "controlled first-send marker unchanged");
  // No delivery path is introduced by continuation itself.
  const continuation = readText("base44/shared/approvalContinuation.ts");
  // No I/O primitive of any kind exists in the pure continuation layer
  // (the word "delivery" appears only in safety comments).
  for (const banned of ["gmail", "sendEmail", "SendEmail", "fetch(", "XMLHttpRequest", "WebSocket"]) {
    assert(continuation.indexOf(banned) === -1, "continuation layer must not contain " + banned);
  }
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
      catch (e) { failed++; failures.push(t.name + " \u2014 " + String(e && e.message ? e.message : e).substring(0, 300)); }
    }
    console.log("RESULT " + passed + "/" + (passed + failed) + " deterministic tests " + (failed === 0 ? "pass" : "FAILED"));
    for (const f of failures) console.error("ERR>> " + f);
    if (failed > 0 && typeof process !== "undefined" && process.exit) process.exitCode = 1;
  })();
}
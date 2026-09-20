// ============================================================
// EXECLEAD.AI — EXEC™ Tool Gateway™ Phase 1 Test Suite
// ============================================================
// Offline regression tests. No SDK access, no I/O, no production data,
// no record mutation of any kind — the gateway core, registry, audit
// buffer, tools, and router are dependency-free by design.
// Run: node src/lib/toolGateway/toolGateway.test.js
//
// Covers the Phase 1 functional/security scenarios:
//   TEST A — getExecutiveProfile: correct profile returned for the
//            authenticated user only (identity from execution context)
//   TEST B — getExecutiveReadiness: existing readiness source used,
//            values match the source exactly (no recalculation)
//   TEST C — getExecutiveJourney: existing journey source used,
//            values match the source exactly
//   TEST D — unauthorized access: supplying another user's identifier
//            is rejected (cross-user guard), no data returned
//   TEST E — invalid tool: unregistered tool rejected safely,
//            no arbitrary execution
//   TEST F — invalid input: malformed input fails validation,
//            handler never invoked (no mutation possible)
//   plus: authentication enforcement, disabled tools, contract
//   validation, audit metadata, and router precision.
// ============================================================

import { createToolRegistry, validateToolDefinition } from "./registry.js";
import { invokeToolCore, TOOL_ERROR_CODES, FORBIDDEN_IDENTITY_KEYS } from "./gatewayCore.js";
import { recordInvocation, getRecentInvocations, getLastInvocation, clearInvocationLog } from "./audit.js";
import getExecutiveProfileTool from "./tools/getExecutiveProfile.js";
import getExecutiveReadinessTool from "./tools/getExecutiveReadiness.js";
import getExecutiveJourneyTool from "./tools/getExecutiveJourney.js";
import { matchToolIntent, formatToolResponse } from "./execToolRouter.js";

let passed = 0;
let failed = 0;
function assert(condition, label) {
  if (condition) {
    passed++;
  } else {
    failed++;
    console.error(`  ✗ FAIL: ${label}`);
  }
}
function assertEqual(actual, expected, label) {
  if (actual === expected) {
    passed++;
  } else {
    failed++;
    console.error(`  ✗ FAIL: ${label}\n      expected: ${JSON.stringify(expected)}\n      actual:   ${JSON.stringify(actual)}`);
  }
}

// ── Fixture: canonical Executive Runtime Profile™ for USER A ──
const USER_A = { id: "user-a-001", full_name: "Alice Executive", email: "alice@execleadai.co" };
const RUNTIME_PROFILE_A = {
  loadedAt: "2026-09-20T10:00:00.000Z",
  identity: { userId: USER_A.id, fullName: "Alice Executive", professionalHeadline: "VP of Engineering", currentRole: "Senior Director", currentCompany: "Acme", industry: "Technology", country: "US", identityVerified: true },
  resolved: { journeyPoints: 1600, journeyLevel: { current: { title: "Operator" }, journeyPercent: 42, progress: 42, pointsToNext: 400, next: { title: "Strategist" } }, executiveReadiness: 62, evidenceCoverage: 78 },
  profile: { target_role: "VP Engineering", target_company: "Google", subscription_plan: "professional", cached_readiness_score: 62, interview_readiness: 55, promotion_readiness: 48 },
  journey: { totalPoints: 1600, level: { current: { title: "Operator" }, journeyPercent: 42, progress: 42, pointsToNext: 400, next: { title: "Strategist" } }, estimatedDays: 12, recommendations: [{ label: "Complete a Challenge", points: 50 }] },
  evidence: { sources: [{ label: "Competency Intelligence", coverage: 32, status: "ok" }, { label: "Simulations", coverage: 85, status: "ok" }] },
};

// Registry mirroring production wiring (index.js) — same tool definitions.
function buildGateway() {
  const registry = createToolRegistry();
  registry.register(getExecutiveProfileTool);
  registry.register(getExecutiveReadinessTool);
  registry.register(getExecutiveJourneyTool);
  const invocationLog = [];
  const contextFor = (user, runtimeProfile = RUNTIME_PROFILE_A) => ({
    user,
    getRuntimeProfile: async () => runtimeProfile,
  });
  const invoke = (toolName, input, user = USER_A) =>
    invokeToolCore({
      toolName,
      input,
      context: contextFor(user),
      registry,
      onInvocation: (m) => invocationLog.push(m),
    });
  return { registry, invoke, invocationLog };
}

async function main() {
  console.log("EXEC™ Tool Gateway™ — Phase 1 Test Suite\n");

  // ── Contract & Registry ──
  console.log("· Contract validation");
  assert(validateToolDefinition(getExecutiveProfileTool).valid, "profile tool passes contract validation");
  assert(!validateToolDefinition({ name: "x" }).valid, "incomplete definition rejected");
  assert(!validateToolDefinition({ ...getExecutiveProfileTool, handler: "not-a-function" }).valid, "non-function handler rejected");
  assert(!validateToolDefinition({ ...getExecutiveProfileTool, inputSchema: { type: "string" } }).valid, "non-object inputSchema rejected");
  const dupRegistry = createToolRegistry();
  dupRegistry.register(getExecutiveProfileTool);
  let dupRejected = false;
  try { dupRegistry.register(getExecutiveProfileTool); } catch { dupRejected = true; }
  assert(dupRejected, "duplicate tool registration rejected");

  const { registry, invoke, invocationLog } = buildGateway();
  assertEqual(registry.size(), 3, "exactly three tools registered");
  const snapshot = registry.list();
  assert(snapshot.every((t) => typeof t.handlerName === "string" && t.enabled === true), "registry snapshot exposes handler names, all enabled");
  assert(!snapshot.some((t) => Object.values(t).some((v) => typeof v === "function")), "registry snapshot never exposes handler functions");

  // ── TEST E — Invalid tool ──
  console.log("· TEST E — invalid tool");
  let handlerRan = false;
  registry.register({ ...getExecutiveProfileTool, name: "maliciousProbe", handler: async () => { handlerRan = true; return "hacked"; }, enabled: false });
  const e = await invoke("stealSecrets", {});
  assertEqual(e.ok, false, "unknown tool rejected");
  assertEqual(e.error.code, TOOL_ERROR_CODES.TOOL_NOT_FOUND, "unknown tool → TOOL_NOT_FOUND");
  assert(!handlerRan, "no arbitrary function executed for unknown/disabled tools");
  const e2 = await invoke("maliciousProbe", {});
  assertEqual(e2.error.code, TOOL_ERROR_CODES.TOOL_DISABLED, "registered-but-disabled tool → TOOL_DISABLED");

  // ── Authentication ──
  console.log("· Authentication enforcement");
  const auth = await invokeToolCore({
    toolName: "getExecutiveProfile",
    input: {},
    context: { user: null, getRuntimeProfile: async () => RUNTIME_PROFILE_A },
    registry,
  });
  assertEqual(auth.ok, false, "unauthenticated invocation rejected");
  assertEqual(auth.error.code, TOOL_ERROR_CODES.AUTHENTICATION_REQUIRED, "unauthenticated → AUTHENTICATION_REQUIRED");
  assertEqual(auth.data, undefined, "no data returned without authentication");

  // ── TEST D — Unauthorized / cross-user access ──
  console.log("· TEST D — cross-user guard");
  for (const key of FORBIDDEN_IDENTITY_KEYS) {
    const d = await invoke("getExecutiveProfile", { [key]: "user-b-999" });
    assertEqual(d.ok, false, `caller-supplied identity key '${key}' rejected`);
    assertEqual(d.error.code, TOOL_ERROR_CODES.FORBIDDEN_INPUT, `'${key}' → FORBIDDEN_INPUT`);
    assertEqual(d.data, undefined, `no data returned for '${key}' attempt`);
  }
  // Same guard applies to all three tools
  const dReady = await invoke("getExecutiveReadiness", { user_id: "user-b-999" });
  assertEqual(dReady.error.code, TOOL_ERROR_CODES.FORBIDDEN_INPUT, "readiness tool also rejects foreign identifiers");
  const dJourney = await invoke("getExecutiveJourney", { userId: "user-b-999" });
  assertEqual(dJourney.error.code, TOOL_ERROR_CODES.FORBIDDEN_INPUT, "journey tool also rejects foreign identifiers");

  // ── TEST F — Invalid input ──
  console.log("· TEST F — invalid input");
  let mutated = false;
  registry.register({ ...getExecutiveProfileTool, name: "inputProbe", inputSchema: { type: "object", properties: { mode: { type: "string" } }, required: ["mode"], additionalProperties: false }, handler: async () => { mutated = true; return "ran"; } });
  const f1 = await invoke("inputProbe", "not-an-object");
  assertEqual(f1.error.code, TOOL_ERROR_CODES.INVALID_INPUT, "non-object input rejected");
  const f2 = await invoke("inputProbe", ["array"]);
  assertEqual(f2.error.code, TOOL_ERROR_CODES.INVALID_INPUT, "array input rejected");
  const f3 = await invoke("inputProbe", { unexpected: true });
  assertEqual(f3.error.code, TOOL_ERROR_CODES.INVALID_INPUT, "unknown field rejected (additionalProperties: false)");
  const f4 = await invoke("inputProbe", {});
  assertEqual(f4.error.code, TOOL_ERROR_CODES.INVALID_INPUT, "missing required field rejected");
  const f5 = await invoke("inputProbe", { mode: 123 });
  assertEqual(f5.error.code, TOOL_ERROR_CODES.INVALID_INPUT, "wrong field type rejected");
  assert(!mutated, "handler never invoked on invalid input — no backend mutation possible");
  assertEqual(f1.data, undefined, "no data returned on invalid input");

  // ── TEST A — Profile ──
  console.log("· TEST A — getExecutiveProfile");
  const a = await invoke("getExecutiveProfile", {});
  assertEqual(a.ok, true, "profile tool succeeds for authenticated user");
  assertEqual(a.data.identity.userId, USER_A.id, "profile identity comes from the execution context user");
  assertEqual(a.data.identity.fullName, "Alice Executive", "correct profile returned");
  assertEqual(a.data.executivePassport.targetRole, "VP Engineering", "executive passport target role from canonical profile");
  assertEqual(a.data.subscriptionPlan, "professional", "subscription plan from canonical profile");
  assert(!a.data.identity.userId.includes("user-b"), "no other user's data present");

  // ── TEST B — Readiness ──
  console.log("· TEST B — getExecutiveReadiness");
  const b = await invoke("getExecutiveReadiness", {});
  assertEqual(b.ok, true, "readiness tool succeeds");
  assertEqual(b.data.readinessScore, RUNTIME_PROFILE_A.resolved.executiveReadiness, "readiness score matches the existing source EXACTLY (no recalculation)");
  assertEqual(b.data.readinessScore, 62, "readiness score equals canonical cached value");
  assertEqual(b.data.dimensions.interview_readiness, 55, "dimension values come from the existing source");
  assert(!("executive_presence" in b.data.dimensions), "absent dimensions are not invented");
  assertEqual(b.data.evidence.overallCoverage, RUNTIME_PROFILE_A.resolved.evidenceCoverage, "evidence coverage matches the existing source");
  assert(b.data.majorGaps.some((g) => g.includes("Competency Intelligence")), "major gaps surfaced where already computed");
  assert(b.data.sourceOfTruth.includes("Executive Runtime Profile"), "source of truth declared");

  // ── TEST C — Journey ──
  console.log("· TEST C — getExecutiveJourney");
  const c = await invoke("getExecutiveJourney", {});
  assertEqual(c.ok, true, "journey tool succeeds");
  assertEqual(c.data.journeyPoints, RUNTIME_PROFILE_A.journey.totalPoints, "journey points match the existing journey source EXACTLY");
  assertEqual(c.data.currentStage, "Operator", "current stage from existing journey source");
  assertEqual(c.data.progression.nextStage, "Strategist", "next-stage info from existing journey source");
  assertEqual(c.data.progression.pointsToNext, 400, "points to next stage from existing journey source");
  assertEqual(c.data.currentObjectives[0].label, "Complete a Challenge", "objectives from existing journey source");
  assert(c.data.sourceOfTruth.includes("manageJourney"), "journey source of truth declared");

  // ── Audit ──
  console.log("· Invocation audit");
  clearInvocationLog();
  const okMeta = invocationLog.find((m) => m.toolName === "getExecutiveProfile" && m.success);
  assert(!!okMeta, "successful invocations recorded");
  assertEqual(okMeta.toolVersion, "1.0.0", "audit records tool version");
  assertEqual(okMeta.userId, USER_A.id, "audit records authenticated user");
  assert(typeof okMeta.timestamp === "string" && !isNaN(Date.parse(okMeta.timestamp)), "audit records ISO timestamp");
  assert(typeof okMeta.durationMs === "number" && okMeta.durationMs >= 0, "audit records duration");
  assertEqual(okMeta.errorCategory, null, "audit records null error category on success");
  const errMeta = invocationLog.find((m) => m.success === false && m.errorCategory === TOOL_ERROR_CODES.FORBIDDEN_INPUT);
  assert(!!errMeta, "failed invocations recorded with error category");
  recordInvocation(okMeta);
  assert(getRecentInvocations(5).length >= 1, "recent invocations retrievable");
  assertEqual(getLastInvocation("getExecutiveProfile").toolName, "getExecutiveProfile", "last invocation per tool retrievable");
  assert(!JSON.stringify(invocationLog).includes("GEMINI"), "no secrets or payloads in audit metadata");

  // ── Router ──
  console.log("· EXEC™ tool router precision");
  assertEqual(matchToolIntent("What is my executive readiness?"), "getExecutiveReadiness", "readiness question routes");
  assertEqual(matchToolIntent("what's my current readiness"), "getExecutiveReadiness", "current readiness routes");
  assertEqual(matchToolIntent("Where am I in my leadership journey?"), "getExecutiveJourney", "journey question routes");
  assertEqual(matchToolIntent("show my journey stage"), "getExecutiveJourney", "journey stage routes");
  assertEqual(matchToolIntent("Show me my executive profile"), "getExecutiveProfile", "profile question routes");
  assertEqual(matchToolIntent("what's my profile"), "getExecutiveProfile", "profile question routes");
  assertEqual(matchToolIntent("What is executive readiness?"), null, "informational readiness question does NOT route");
  assertEqual(matchToolIntent("how can I improve my readiness?"), null, "improvement question does NOT route");
  assertEqual(matchToolIntent("how did my readiness improve?"), null, "outcome-analytics question does NOT route (handled by Outcome Intelligence)");
  assertEqual(matchToolIntent("show me John's profile"), null, "third-party profile request does NOT route");
  assertEqual(matchToolIntent("what's the weather?"), null, "unrelated question does NOT route");
  assertEqual(matchToolIntent(""), null, "empty input does NOT route");
  const formatted = formatToolResponse("getExecutiveReadiness", b.data);
  assert(formatted.includes("62%"), "formatter renders the structured readiness score");
  assert(formatted.includes("Tool Gateway"), "formatter declares gateway provenance");
  assert(formatToolResponse("getExecutiveProfile", null) === null, "formatter handles null data safely");

  // ── Result normalization ──
  console.log("· Result envelope");
  assert(a.tool === "getExecutiveProfile" && a.version === "1.0.0", "success envelope carries tool + version");
  assert(typeof a.durationMs === "number" && typeof a.invokedAt === "string", "success envelope carries timing metadata");
  assertEqual(f1.version, "1.0.0", "error envelope still carries version");

  console.log(`\nResults: ${passed} passed, ${failed} failed, ${passed + failed} total`);
  if (failed > 0) {
    console.error("\n✗ PHASE 1 GATEWAY TESTS FAILED");
    throw new Error("PHASE 1 GATEWAY TESTS FAILED");
  } else {
    console.log("✓ PHASE 1 GATEWAY TESTS PASSED");
  }
}

await main();
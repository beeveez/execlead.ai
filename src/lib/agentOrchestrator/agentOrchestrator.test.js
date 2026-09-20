// ============================================================
// EXECLEAD.AI — Agent Orchestrator™ Phase 2A Test Suite
// ============================================================
// Offline regression tests. No SDK access, no I/O, no production data,
// no record mutation of any kind — the orchestrator core, agent registry,
// test agent, router, and the Phase 1 Tool Gateway™ (real gateway core +
// real tool handlers + fixture Executive Runtime Profile™) are all
// dependency-free by design.
// Run: node src/lib/agentOrchestrator/agentOrchestrator.test.js
//
// Covers the Phase 2A functional/security scenarios:
//   TEST A — agent registration, contract validation, version, enabled
//   TEST B — valid execution: agent runs in the authenticated context,
//            through the Tool Gateway™, returning correct executive context
//   TEST C — tool authorization: a tool outside the agent's allowed-tools
//            list is rejected; the underlying handler never executes
//   TEST D — cross-user protection: caller-supplied identity is rejected;
//            execution context identity cannot be overridden
//   TEST E — unknown agent: rejected safely, no arbitrary execution
//   TEST F — disabled agent: invocation rejected
//   TEST G — invalid input: validation failure, handler never executes
//   TEST H — tool failure: normalized failure, no retry loop,
//            EXEC™ fallback remains available
//   TEST I — timeout: bounded execution terminates safely, timeout recorded
//   TEST J — telemetry: success and failure both produce records
//   TEST K — regression: Phase 1 routing/gateway, tool registry, and
//            router precision remain intact
// ============================================================

import { createAgentRegistry, validateAgentDefinition } from "./registry.js";
import { orchestrateCore, ORCHESTRATION_ERROR_CODES, DEFAULT_AGENT_TIMEOUT_MS } from "./orchestratorCore.js";
import executiveContextAgent from "./agents/executiveContextAgent.js";
import { matchOrchestrationIntent, formatAgentResponse } from "./agentRouter.js";
import { createToolRegistry, validateToolDefinition } from "../toolGateway/registry.js";
import { invokeToolCore } from "../toolGateway/gatewayCore.js";
import { matchToolIntent, formatToolResponse } from "../toolGateway/execToolRouter.js";
import getExecutiveProfileTool from "../toolGateway/tools/getExecutiveProfile.js";
import getExecutiveReadinessTool from "../toolGateway/tools/getExecutiveReadiness.js";
import getExecutiveJourneyTool from "../toolGateway/tools/getExecutiveJourney.js";

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
  loadedAt: "2026-09-21T10:00:00.000Z",
  identity: { userId: USER_A.id, fullName: "Alice Executive", professionalHeadline: "VP of Engineering", currentRole: "Senior Director", currentCompany: "Acme", industry: "Technology", country: "US", identityVerified: true },
  resolved: { journeyPoints: 1600, executiveReadiness: 62, evidenceCoverage: 78 },
  profile: { target_role: "VP Engineering", target_company: "Google", subscription_plan: "professional", cached_readiness_score: 62, interview_readiness: 55, promotion_readiness: 48 },
};

// ── Real Phase 1 Tool Gateway™ (core + handlers) with a fixture runtime profile ──
const toolRegistry = createToolRegistry();
toolRegistry.register(getExecutiveProfileTool);
toolRegistry.register(getExecutiveReadinessTool);
toolRegistry.register(getExecutiveJourneyTool);

function makeGateway(fixture = {}) {
  const calls = [];
  const invoker = async (toolName, toolInput, toolOptions) => {
    calls.push({ toolName, toolInput, toolOptions });
    if ((fixture.failTools || []).includes(toolName)) {
      return {
        ok: false, tool: toolName, version: "1.0.0",
        error: { code: "TOOL_EXECUTION_ERROR", message: "Simulated Tool Gateway™ failure." },
        durationMs: 1, invokedAt: new Date().toISOString(),
      };
    }
    return invokeToolCore({
      toolName,
      input: toolInput,
      context: {
        user: toolOptions.user,
        getRuntimeProfile: async () => {
          if (fixture.failRuntimeProfile) throw new Error("Executive Runtime Profile™ unavailable.");
          return RUNTIME_PROFILE_A;
        },
      },
      registry: toolRegistry,
    });
  };
  return { invoker, calls };
}

function makeContext(overrides = {}) {
  return {
    user: USER_A,
    workspace: { id: "ws-1", name: "Executive" },
    runtimeProfile: RUNTIME_PROFILE_A,
    getRuntimeProfile: async () => RUNTIME_PROFILE_A,
    ...overrides,
  };
}

// Helper: a minimal valid agent contract for probes (used ONLY inside tests).
function makeProbeAgent(overrides = {}) {
  return {
    name: "probe_agent",
    displayName: "Probe Agent",
    description: "Test-only probe agent for the Phase 2A suite.",
    purpose: "Test probe.",
    version: "1.0.0",
    enabled: true,
    requiredPermissions: ["authenticated"],
    allowedTools: ["getExecutiveReadiness"],
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    outputSchema: { type: "object" },
    handler: async ({ invokeTool }) => ({ ok: true, tool: await invokeTool("getExecutiveReadiness", {}) }),
    ...overrides,
  };
}

console.log("── Agent Orchestrator™ Phase 2A Test Suite ──\n");

// ============================================================
// TEST A — Agent registration, contract validation, version, enabled
// ============================================================
{
  console.log("TEST A — agent registration");
  assert(validateAgentDefinition(executiveContextAgent).valid === true, "A1: executive_context_agent contract is valid");
  assertEqual(executiveContextAgent.version, "1.0.0", "A2: version exists (1.0.0)");
  assertEqual(executiveContextAgent.enabled, true, "A3: agent enabled by default");
  assert(
    executiveContextAgent.allowedTools.length === 3 &&
      executiveContextAgent.allowedTools.includes("getExecutiveProfile") &&
      executiveContextAgent.allowedTools.includes("getExecutiveReadiness") &&
      executiveContextAgent.allowedTools.includes("getExecutiveJourney"),
    "A4: allowed-tools list is exactly the three Tool Gateway™ tools"
  );

  const reg = createAgentRegistry();
  reg.register(executiveContextAgent);
  assert(reg.has("executive_context_agent") === true, "A5: agent registered in registry");
  assertEqual(reg.size(), 1, "A6: registry holds exactly one agent");
  const listed = reg.list()[0];
  assertEqual(listed.enabled, true, "A7: listed agent enabled");
  assert(typeof listed.handler === "undefined", "A8: diagnostics snapshot never exposes the handler");

  // enabled state toggle works
  reg.setEnabled("executive_context_agent", false);
  assertEqual(reg.list()[0].enabled, false, "A9: setEnabled(false) works");
  reg.setEnabled("executive_context_agent", true);
  assertEqual(reg.list()[0].enabled, true, "A10: setEnabled(true) restores");

  // invalid contracts are rejected
  assert(validateAgentDefinition(null).valid === false, "A11: null definition rejected");
  assert(
    validateAgentDefinition(makeProbeAgent({ handler: "not-a-function" })).valid === false,
    "A12: non-function handler rejected"
  );
  assert(
    validateAgentDefinition(makeProbeAgent({ allowedTools: [] })).valid === false,
    "A13: empty allowedTools rejected"
  );
  assert(
    validateAgentDefinition(makeProbeAgent({ name: "Bad-Name" })).valid === false,
    "A14: non-snake_case name rejected"
  );
  assert(
    validateAgentDefinition(makeProbeAgent({ timeoutMs: -5 })).valid === false,
    "A15: non-positive timeout rejected"
  );
  assert(
    validateAgentDefinition(makeProbeAgent({ inputSchema: { type: "array" } })).valid === false,
    "A16: non-object inputSchema rejected"
  );
}

// ============================================================
// TEST B — Valid execution (authenticated context, Tool Gateway™, correct data)
// ============================================================
{
  console.log("TEST B — valid execution");
  const reg = createAgentRegistry();
  reg.register(executiveContextAgent);
  const gw = makeGateway();

  const result = await orchestrateCore({
    agentName: "executive_context_agent",
    input: {},
    context: makeContext(),
    registry: reg,
    toolInvoker: gw.invoker,
  });

  assert(result.ok === true, "B1: orchestration succeeds");
  assertEqual(result.agent, "executive_context_agent", "B2: agent name returned");
  assertEqual(result.agentVersion, "1.0.0", "B3: agent version returned");
  assert(typeof result.requestId === "string" && result.requestId.startsWith("orch-"), "B4: request id issued");
  assert(typeof result.durationMs === "number" && result.durationMs >= 0, "B5: duration recorded");
  assert(result.toolsRequested !== null && result.toolsRequested.length === 3, "B6: toolsRequested recorded");
  assert(result.toolsSucceeded !== null && result.toolsSucceeded.length === 3, "B7: toolsSucceeded recorded");
  assert(
    result.toolsSucceeded.join(",") === "getExecutiveProfile,getExecutiveReadiness,getExecutiveJourney",
    "B8: all three tools succeeded"
  );
  assert(gw.calls.length === 3, "B9: the Tool Gateway™ was used (3 invocations)");
  assert(
    gw.calls.every((c) => c.toolOptions && c.toolOptions.user && c.toolOptions.user.id === USER_A.id),
    "B10: authenticated context preserved on every gateway call"
  );
  assert(
    gw.calls.every((c) => c.toolOptions.runtimeProfile === RUNTIME_PROFILE_A),
    "B11: runtime profile passed through to the gateway without rebuild"
  );

  // Correct executive context — values from the fixture runtime profile (no recalculation)
  const readiness = result.data.tools.find((t) => t.tool === "getExecutiveReadiness");
  assertEqual(readiness.data.readinessScore, RUNTIME_PROFILE_A.resolved.executiveReadiness, "B12: readiness matches the source exactly (62)");
  const journey = result.data.tools.find((t) => t.tool === "getExecutiveJourney");
  assertEqual(journey.data.journeyPoints, RUNTIME_PROFILE_A.resolved.journeyPoints, "B13: journey points match the source exactly (1600)");
  const profile = result.data.tools.find((t) => t.tool === "getExecutiveProfile");
  assertEqual(profile.data.executivePassport.targetRole, RUNTIME_PROFILE_A.profile.target_role, "B14: profile target role from the source");
}

// ============================================================
// TEST C — Tool authorization (allowed-tools list is enforced)
// ============================================================
{
  console.log("TEST C — tool authorization");
  const reg = createAgentRegistry();
  reg.register(executiveContextAgent);
  const gw = makeGateway();

  const result = await orchestrateCore({
    agentName: "executive_context_agent",
    input: { requestedTools: ["getExecutiveReadiness", "forbidden_arbitrary_tool"] },
    context: makeContext(),
    registry: reg,
    toolInvoker: gw.invoker,
  });

  const forbidden = result.data.tools.find((t) => t.tool === "forbidden_arbitrary_tool");
  assert(forbidden !== undefined, "C1: unauthorized tool attempt present in result");
  assert(forbidden.ok === false, "C2: unauthorized tool invocation rejected");
  assertEqual(forbidden.error.code, ORCHESTRATION_ERROR_CODES.UNAUTHORIZED_TOOL, "C3: rejection carries UNAUTHORIZED_TOOL");
  assert(
    !gw.calls.some((c) => c.toolName === "forbidden_arbitrary_tool"),
    "C4: underlying tool handler NEVER executes for the forbidden tool"
  );
  assert(gw.calls.length === 1 && gw.calls[0].toolName === "getExecutiveReadiness", "C5: only the authorized tool reached the gateway");
  assert(
    result.data.toolsSucceeded.join(",") === "getExecutiveReadiness",
    "C6: only the authorized tool is marked succeeded"
  );

  // Default (no requestedTools) never exceeds the whitelist either
  const gw2 = makeGateway();
  const result2 = await orchestrateCore({
    agentName: "executive_context_agent",
    input: {},
    context: makeContext(),
    registry: reg,
    toolInvoker: gw2.invoker,
  });
  assert(
    result2.data.tools.every((t) => executiveContextAgent.allowedTools.includes(t.tool)),
    "C7: default request stays inside the allowed-tools list"
  );
}

// ============================================================
// TEST D — Cross-user protection (identity cannot be overridden)
// ============================================================
{
  console.log("TEST D — cross-user protection");
  const reg = createAgentRegistry();
  reg.register(executiveContextAgent);
  const gw = makeGateway();

  // Caller-supplied identity in orchestration input is rejected before execution
  const r1 = await orchestrateCore({
    agentName: "executive_context_agent",
    input: { user_id: "user-b-999" },
    context: makeContext(),
    registry: reg,
    toolInvoker: gw.invoker,
  });
  assert(r1.ok === false, "D1: caller-supplied user_id rejected");
  assertEqual(r1.error.code, ORCHESTRATION_ERROR_CODES.FORBIDDEN_INPUT, "D2: rejection carries FORBIDDEN_INPUT");
  assert(gw.calls.length === 0, "D3: agent handler never executed on forbidden identity input");

  const r2 = await orchestrateCore({
    agentName: "executive_context_agent",
    input: { requestedTools: ["getExecutiveProfile"], subject_user_id: "user-b-999" },
    context: makeContext(),
    registry: reg,
    toolInvoker: gw.invoker,
  });
  assertEqual(r2.error.code, ORCHESTRATION_ERROR_CODES.FORBIDDEN_INPUT, "D4: subject_user_id also rejected");

  // Execution context is immutable — a rogue handler cannot change identity
  let captured = null;
  reg.register(
    makeProbeAgent({
      name: "context_probe_agent",
      handler: async ({ context, invokeTool }) => {
        captured = context;
        let threw = false;
        try {
          context.user.id = "hacker-override";
        } catch {
          threw = true;
        }
        const res = await invokeTool("getExecutiveReadiness", {});
        return { threw, res };
      },
    })
  );
  const gw2 = makeGateway();
  const r3 = await orchestrateCore({
    agentName: "context_probe_agent",
    input: {},
    context: makeContext(),
    registry: reg,
    toolInvoker: gw2.invoker,
  });
  assert(Object.isFrozen(captured) === true, "D5: execution context is frozen");
  assert(Object.isFrozen(captured.user) === true, "D6: context user object is frozen");
  assert(r3.data.threw === true, "D7: mutating the frozen context throws (strict mode)");
  assertEqual(captured.user.id, USER_A.id, "D8: identity remains the authenticated user");
  assert(
    gw2.calls[0] && gw2.calls[0].toolOptions.user.id === USER_A.id,
    "D9: gateway still receives the authenticated identity — no foreign data"
  );
  assertEqual(captured.agentName, "context_probe_agent", "D10: agent identity in execution context");
  assertEqual(captured.tenantContext.organizationId, null, "D11: tenant context derived, never caller-supplied");
}

// ============================================================
// TEST E — Unknown agent (no arbitrary execution)
// ============================================================
{
  console.log("TEST E — unknown agent");
  const reg = createAgentRegistry();
  reg.register(executiveContextAgent);
  const gw = makeGateway();

  for (const bad of ["rogue_agent", "", null, 123]) {
    const r = await orchestrateCore({
      agentName: bad,
      input: {},
      context: makeContext(),
      registry: reg,
      toolInvoker: gw.invoker,
    });
    assert(r.ok === false, `E: unknown agent rejected (${String(bad)})`);
    assertEqual(r.error.code, ORCHESTRATION_ERROR_CODES.AGENT_NOT_FOUND, `E: AGENT_NOT_FOUND for (${String(bad)})`);
  }
  assert(gw.calls.length === 0, "E: no tool invocation for any unknown agent");
}

// ============================================================
// TEST F — Disabled agent
// ============================================================
{
  console.log("TEST F — disabled agent");
  const reg = createAgentRegistry();
  reg.register(executiveContextAgent);
  reg.setEnabled("executive_context_agent", false);
  const gw = makeGateway();

  const r = await orchestrateCore({
    agentName: "executive_context_agent",
    input: {},
    context: makeContext(),
    registry: reg,
    toolInvoker: gw.invoker,
  });
  assert(r.ok === false, "F1: disabled agent invocation rejected");
  assertEqual(r.error.code, ORCHESTRATION_ERROR_CODES.AGENT_DISABLED, "F2: rejection carries AGENT_DISABLED");
  assert(gw.calls.length === 0, "F3: agent handler never executed");
}

// ============================================================
// TEST G — Invalid input (handler never executes)
// ============================================================
{
  console.log("TEST G — invalid input");
  const reg = createAgentRegistry();
  reg.register(executiveContextAgent);
  const gw = makeGateway();

  const r1 = await orchestrateCore({
    agentName: "executive_context_agent",
    input: "not-an-object",
    context: makeContext(),
    registry: reg,
    toolInvoker: gw.invoker,
  });
  assert(r1.ok === false, "G1: non-object input rejected");
  assertEqual(r1.error.code, ORCHESTRATION_ERROR_CODES.INVALID_INPUT, "G2: non-object carries INVALID_INPUT");

  const r2 = await orchestrateCore({
    agentName: "executive_context_agent",
    input: { requestedTools: "not-an-array" },
    context: makeContext(),
    registry: reg,
    toolInvoker: gw.invoker,
  });
  assert(r2.ok === false, "G3: wrong-typed requestedTools rejected");
  assertEqual(r2.error.code, ORCHESTRATION_ERROR_CODES.INVALID_INPUT, "G4: typed violation carries INVALID_INPUT");

  assert(gw.calls.length === 0, "G5: agent handler never executed on invalid input");

  // Authentication failure (no authenticated user)
  const r3 = await orchestrateCore({
    agentName: "executive_context_agent",
    input: {},
    context: makeContext({ user: null }),
    registry: reg,
    toolInvoker: gw.invoker,
  });
  assert(r3.ok === false, "G6: unauthenticated orchestration rejected");
  assertEqual(r3.error.code, ORCHESTRATION_ERROR_CODES.AUTHENTICATION_REQUIRED, "G7: carries AUTHENTICATION_REQUIRED");
  assert(gw.calls.length === 0, "G8: no tool invocation without authentication");
}

// ============================================================
// TEST H — Tool failure (normalized, no retries, fallback available)
// ============================================================
{
  console.log("TEST H — tool failure");
  const reg = createAgentRegistry();
  reg.register(executiveContextAgent);
  const gw = makeGateway({ failTools: ["getExecutiveReadiness"] });

  const r = await orchestrateCore({
    agentName: "executive_context_agent",
    input: { requestedTools: ["getExecutiveReadiness"] },
    context: makeContext(),
    registry: reg,
    toolInvoker: gw.invoker,
  });

  // Agent completes; the tool failure is normalized inside the result
  assert(r.ok === true, "H1: orchestration completes (no uncontrolled crash/retry)");
  const failed = r.data.tools[0];
  assert(failed.ok === false, "H2: failed tool reported as failed");
  assertEqual(failed.error.code, "TOOL_EXECUTION_ERROR", "H3: gateway error code surfaced");
  assertEqual(r.data.toolsSucceeded.length, 0, "H4: failed tool not counted as succeeded");
  assert(
    gw.calls.filter((c) => c.toolName === "getExecutiveReadiness").length === 1,
    "H5: exactly ONE attempt — no retry loop"
  );
  // EXEC™ fallback remains available: no successful tools → no formatted answer
  assert(formatAgentResponse(r.data) === null, "H6: no formatted answer when every tool failed (EXEC™ falls back to AI)");

  // Partial failure: succeeded tools still format; failed ones are skipped
  const gw2 = makeGateway({ failTools: ["getExecutiveJourney"] });
  const r2 = await orchestrateCore({
    agentName: "executive_context_agent",
    input: { requestedTools: ["getExecutiveReadiness", "getExecutiveJourney"] },
    context: makeContext(),
    registry: reg,
    toolInvoker: gw2.invoker,
  });
  const partialAnswer = formatAgentResponse(r2.data);
  assert(typeof partialAnswer === "string" && partialAnswer.includes("62%"), "H7: partial-success answer still formatted");
  assert(!partialAnswer.includes("Executive Journey™"), "H8: failed tool excluded from the formatted answer");

  // Runtime-profile failure inside a tool is also normalized by the gateway
  const gw3 = makeGateway({ failRuntimeProfile: true });
  const r3 = await orchestrateCore({
    agentName: "executive_context_agent",
    input: { requestedTools: ["getExecutiveProfile"] },
    context: makeContext(),
    registry: reg,
    toolInvoker: gw3.invoker,
  });
  assert(r3.data.tools[0].ok === false, "H9: gateway-level runtime-profile failure normalized");
}

// ============================================================
// TEST I — Timeout (bounded execution terminates safely)
// ============================================================
{
  console.log("TEST I — timeout");
  const reg = createAgentRegistry();
  reg.register(
    makeProbeAgent({
      name: "timeout_probe_agent",
      timeoutMs: 40,
      handler: () => new Promise((resolve) => setTimeout(() => resolve({ late: true }), 1200)),
    })
  );
  const gw = makeGateway();

  const start = Date.now();
  const r = await orchestrateCore({
    agentName: "timeout_probe_agent",
    input: {},
    context: makeContext(),
    registry: reg,
    toolInvoker: gw.invoker,
  });
  const elapsed = Date.now() - start;

  assert(r.ok === false, "I1: timed-out orchestration fails");
  assertEqual(r.error.code, ORCHESTRATION_ERROR_CODES.AGENT_TIMEOUT, "I2: carries AGENT_TIMEOUT");
  assert(r.error.message.includes("40ms"), "I3: timeout message names the policy");
  assert(elapsed < 1000, "I4: execution terminated promptly (no orphaned wait)");
  assert(r.durationMs >= 40 && r.durationMs < 1000, "I5: timeout recorded in the result");
  assertEqual(r.timeoutMs, 40, "I6: applied timeout policy returned");
  assert(gw.calls.length === 0, "I7: no tool side effects from the timed-out agent");

  // An agent finishing inside its timeout succeeds normally
  const reg2 = createAgentRegistry();
  reg2.register(
    makeProbeAgent({
      name: "fast_probe_agent",
      timeoutMs: 2000,
      handler: () => new Promise((resolve) => setTimeout(() => resolve({ done: true }), 20)),
    })
  );
  const r2 = await orchestrateCore({
    agentName: "fast_probe_agent",
    input: {},
    context: makeContext(),
    registry: reg2,
    toolInvoker: makeGateway().invoker,
  });
  assert(r2.ok === true, "I8: in-budget execution succeeds");
  assertEqual(r2.timeoutMs, 2000, "I9: custom timeout respected");
  assertEqual(DEFAULT_AGENT_TIMEOUT_MS, 15000, "I10: default timeout policy is 15000ms");
}

// ============================================================
// TEST J — Telemetry (success and failure records)
// ============================================================
{
  console.log("TEST J — telemetry");
  const reg = createAgentRegistry();
  reg.register(executiveContextAgent);
  const events = [];
  const onResult = (result, failureCategory) => events.push({ result, failureCategory });

  // Success record
  const gwOk = makeGateway();
  const r1 = await orchestrateCore({
    agentName: "executive_context_agent",
    input: { requestedTools: ["getExecutiveReadiness"] },
    context: makeContext(),
    registry: reg,
    toolInvoker: gwOk.invoker,
    onResult,
  });
  assert(events.length === 1, "J1: success telemetry emitted");
  const successEvt = events[0];
  assertEqual(successEvt.failureCategory, null, "J2: success has no failure category");
  assert(successEvt.result.ok === true, "J3: success result recorded");
  assertEqual(successEvt.result.agent, "executive_context_agent", "J4: agent name recorded");
  assertEqual(successEvt.result.agentVersion, "1.0.0", "J5: agent version recorded");
  assert(typeof successEvt.result.requestId === "string", "J6: request id recorded");
  assert(typeof successEvt.result.startedAt === "string" && typeof successEvt.result.completedAt === "string", "J7: timestamps recorded");
  assert(successEvt.result.toolsRequested.includes("getExecutiveReadiness"), "J8: tools requested recorded");
  assert(successEvt.result.toolsSucceeded.includes("getExecutiveReadiness"), "J9: tools succeeded recorded");

  // Failure record
  const r2 = await orchestrateCore({
    agentName: "missing_agent",
    input: {},
    context: makeContext(),
    registry: reg,
    toolInvoker: makeGateway().invoker,
    onResult,
  });
  assert(events.length === 2, "J10: failure telemetry emitted");
  const failureEvt = events[1];
  assert(failureEvt.result.ok === false, "J11: failure result recorded");
  assertEqual(failureEvt.failureCategory, ORCHESTRATION_ERROR_CODES.AGENT_NOT_FOUND, "J12: failure category recorded");

  // A crashing agent handler is normalized to AGENT_EXECUTION_ERROR
  const reg2 = createAgentRegistry();
  reg2.register(makeProbeAgent({ name: "crash_probe_agent", handler: async () => { throw new Error("boom"); } }));
  const events2 = [];
  const r3 = await orchestrateCore({
    agentName: "crash_probe_agent",
    input: {},
    context: makeContext(),
    registry: reg2,
    toolInvoker: makeGateway().invoker,
    onResult: (res, cat) => events2.push({ res, cat }),
  });
  assert(r3.ok === false, "J13: crashing agent fails safely");
  assertEqual(r3.error.code, ORCHESTRATION_ERROR_CODES.AGENT_EXECUTION_ERROR, "J14: carries AGENT_EXECUTION_ERROR");
  assertEqual(events2[0].cat, ORCHESTRATION_ERROR_CODES.AGENT_EXECUTION_ERROR, "J15: crash failure category recorded");

  // A telemetry sink failure must never break the orchestration path
  const r4 = await orchestrateCore({
    agentName: "executive_context_agent",
    input: { requestedTools: ["getExecutiveProfile"] },
    context: makeContext(),
    registry: reg,
    toolInvoker: makeGateway().invoker,
    onResult: () => { throw new Error("sink down"); },
  });
  assert(r4.ok === true, "J16: telemetry sink failure does not break orchestration");
}

// ============================================================
// TEST K — Regression (Phase 1 paths remain intact)
// ============================================================
{
  console.log("TEST K — regression");
  // K1: orchestration routing is narrow — combined readiness+journey only
  assertEqual(
    matchOrchestrationIntent("What is my current executive readiness and where am I in my leadership journey?"),
    "executive_context_agent",
    "K1: combined readiness+journey request delegates to the agent"
  );
  assertEqual(matchOrchestrationIntent("What's my readiness right now?"), null, "K2: readiness-only request does NOT orchestrate");
  assertEqual(matchOrchestrationIntent("Where am I in my leadership journey?"), null, "K3: journey-only request does NOT orchestrate");
  assertEqual(matchOrchestrationIntent("What is executive readiness?"), null, "K4: informational question does NOT orchestrate");
  assertEqual(matchOrchestrationIntent(""), null, "K5: empty input does NOT orchestrate");

  // K2: Phase 1 direct Tool Gateway routing still works for single intents
  assertEqual(matchToolIntent("what's my readiness right now"), "getExecutiveReadiness", "K6: Phase 1 router still matches readiness");
  assertEqual(matchToolIntent("where am I in my leadership journey"), "getExecutiveJourney", "K7: Phase 1 router still matches journey");
  assertEqual(matchToolIntent("show me my executive profile"), "getExecutiveProfile", "K8: Phase 1 router still matches profile");
  assertEqual(matchToolIntent("how can I improve my readiness"), null, "K9: improvement question still falls through to AI");

  // K3: Phase 1 direct invocation path still works (no orchestration required)
  const gw = makeGateway();
  const direct = await gw.invoker("getExecutiveReadiness", {}, {
    user: USER_A,
    runtimeProfile: RUNTIME_PROFILE_A,
  });
  assert(direct.ok === true, "K10: direct Tool Gateway invocation still succeeds");
  assertEqual(direct.data.readinessScore, 62, "K11: direct invocation returns the canonical readiness");

  // K4: Phase 1 formatter unchanged
  const formatted = formatToolResponse("getExecutiveReadiness", direct.data);
  assert(typeof formatted === "string" && formatted.includes("62%"), "K12: Phase 1 formatter unchanged");
  assert(formatted.includes("Tool Gateway™"), "K13: Phase 1 provenance note preserved");

  // K5: orchestration answer carries both sections + governance provenance
  const reg = createAgentRegistry();
  reg.register(executiveContextAgent);
  const r = await orchestrateCore({
    agentName: "executive_context_agent",
    input: { requestedTools: ["getExecutiveReadiness", "getExecutiveJourney"] },
    context: makeContext(),
    registry: reg,
    toolInvoker: makeGateway().invoker,
  });
  const answer = formatAgentResponse(r.data, { agent: r.agent, agentVersion: r.agentVersion });
  assert(answer.includes("Executive Readiness™") && answer.includes("Executive Journey™"), "K14: orchestrated answer covers both contexts");
  assert(answer.includes("executive_context_agent") && answer.includes("Tool Gateway"), "K15: governance provenance disclosed");

  // K6: registries are independent — the agent layer does not touch tool registration
  assertEqual(toolRegistry.size(), 3, "K16: tool registry still holds exactly the three Phase 1 tools");
  assert(
    ["getExecutiveProfile", "getExecutiveReadiness", "getExecutiveJourney"].every((t) =>
      validateToolDefinition(toolRegistry.get(t)).valid
    ),
    "K17: Phase 1 tool contracts remain valid"
  );
}

// ── Report ──
console.log(`\n${passed} passed, ${failed} failed (of ${passed + failed})`);
if (failed > 0) {
  console.error("\n✗ PHASE 2A AGENT ORCHESTRATOR TESTS FAILED");
  throw new Error("PHASE 2A AGENT ORCHESTRATOR TESTS FAILED");
}
console.log("✓ PHASE 2A AGENT ORCHESTRATOR TESTS PASSED");
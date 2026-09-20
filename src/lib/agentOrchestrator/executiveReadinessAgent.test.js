// ============================================================
// EXECLEAD.AI — Agent Orchestrator™ Phase 2B Test Suite
// ============================================================
// Offline regression tests for the executive_readiness_agent. No SDK access,
// no I/O, no production data, no record mutation — the agent, orchestrator
// core, registry, and the real Tool Gateway™ core + real tool handlers run
// against fixture Executive Runtime Profiles™.
// Run: node src/lib/agentOrchestrator/executiveReadinessAgent.test.js
//
// Covers the Phase 2B scenarios:
//   TEST A — Registration (contract, version, enabled, allowed tools)
//   TEST B — Valid readiness analysis (exact EXEC™ question, full chain)
//   TEST C — Score preservation (agent output === authoritative source)
//   TEST D — Evidence grounding (no fabricated evidence)
//   TEST E — Gap grounding (no invented gaps)
//   TEST F — Recommendation grounding (derived from retrieved context)
//   TEST G — Cross-user protection
//   TEST H — Unauthorized tool (orchestrator rejects; handler never executes)
//   TEST I — Tool failure (normalized, no retry, safe EXEC™ fallback)
//   TEST J — Timeout (bounded termination, telemetry records timeout)
//   TEST K — No invention (evidence unavailable → stated, not fabricated)
//   TEST L — Telemetry (success and failure recorded)
//   TEST M — Regression (Phase 1 + Phase 2A behavior unchanged)
// ============================================================

import { createAgentRegistry, validateAgentDefinition } from "./registry.js";
import { orchestrateCore, ORCHESTRATION_ERROR_CODES } from "./orchestratorCore.js";
import executiveContextAgent from "./agents/executiveContextAgent.js";
import executiveReadinessAgent from "./agents/executiveReadinessAgent.js";
import { matchOrchestrationIntent, formatAgentResponse } from "./agentRouter.js";
import { createToolRegistry } from "../toolGateway/registry.js";
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

const USER_A = { id: "user-a-001", full_name: "Alice Executive", email: "alice@execleadai.co" };

// ── Fixture RICH: a member with measured dimensions + evidence sources ──
const RUNTIME_PROFILE_RICH = {
  loadedAt: "2026-09-21T08:00:00.000Z",
  identity: { userId: USER_A.id, fullName: "Alice Executive", professionalHeadline: "COO", currentRole: "COO", currentCompany: "Acme", industry: "Technology", country: "US", identityVerified: true },
  resolved: { journeyPoints: 1600, executiveReadiness: 62, evidenceCoverage: 58 },
  profile: { target_role: "CEO", target_company: "Google", subscription_plan: "professional", cached_readiness_score: 62, interview_readiness: 55, promotion_readiness: 48, leadership_maturity: 75 },
  evidence: {
    sources: [
      { label: "Interview Evidence", coverage: 82, status: "strong" },
      { label: "Leadership Evidence", coverage: 30, status: "weak" },
      { label: "Identity Evidence", coverage: 55, status: "partial" },
    ],
  },
  journey: { totalPoints: 1600, level: { current: { title: "Emerging Leader" }, journeyPercent: 40 } },
};

// ── Fixture EMPTY: a member with NO readiness evidence available ──
const RUNTIME_PROFILE_EMPTY = {
  loadedAt: "2026-09-21T08:00:00.000Z",
  identity: { userId: USER_A.id, fullName: "Alice Executive", professionalHeadline: "COO", currentRole: "COO", currentCompany: "Acme", industry: "Technology", country: "US", identityVerified: true },
  resolved: { journeyPoints: 0, executiveReadiness: undefined, evidenceCoverage: undefined },
  profile: { target_role: null, target_company: null, subscription_plan: "free" },
  journey: { totalPoints: 0 },
};

const EXACT_QUESTION =
  "Why is my current executive readiness where it is, what evidence supports it, what are my biggest gaps, and what should I work on next?";

// ── Real Phase 1 Tool Gateway™ (core + handlers) over a fixture profile ──
const toolRegistry = createToolRegistry();
[getExecutiveProfileTool, getExecutiveReadinessTool, getExecutiveJourneyTool].forEach((t) => toolRegistry.register(t));

function makeGateway(profile, fixture = {}) {
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
        runtimeProfile: profile,
        getRuntimeProfile: async () => {
          if (fixture.failRuntimeProfile) throw new Error("Executive Runtime Profile™ unavailable.");
          return profile;
        },
      },
      registry: toolRegistry,
    });
  };
  return { invoker, calls };
}

function makeRegistry() {
  const reg = createAgentRegistry();
  reg.register(executiveContextAgent);
  reg.register(executiveReadinessAgent);
  return reg;
}

function makeContext(profile, overrides = {}) {
  return {
    user: USER_A,
    workspace: { id: "ws-1", name: "Executive" },
    runtimeProfile: profile,
    getRuntimeProfile: async () => profile,
    ...overrides,
  };
}

console.log("── Agent Orchestrator™ Phase 2B Test Suite ──\n");

// ============================================================
// TEST A — Registration
// ============================================================
{
  console.log("TEST A — registration");
  const check = validateAgentDefinition(executiveReadinessAgent);
  assert(check.valid === true, `A1: executive_readiness_agent contract valid${check.valid ? "" : ` (${check.error})`}`);
  assertEqual(executiveReadinessAgent.name, "executive_readiness_agent", "A2: agent name");
  assertEqual(executiveReadinessAgent.version, "1.0.0", "A3: version present");
  assertEqual(executiveReadinessAgent.enabled, true, "A4: enabled state correct");
  assertEqual(executiveReadinessAgent.requiredPermissions.join(","), "authenticated", "A5: requires authentication only");
  assert(
    executiveReadinessAgent.allowedTools.length === 3 &&
      executiveReadinessAgent.allowedTools.includes("getExecutiveProfile") &&
      executiveReadinessAgent.allowedTools.includes("getExecutiveReadiness") &&
      executiveReadinessAgent.allowedTools.includes("getExecutiveJourney"),
    "A6: allowed tools are exactly the minimum three read-only tools (no mutation/admin/cross-user tools)"
  );
  assert(typeof executiveReadinessAgent.timeoutMs === "number" && executiveReadinessAgent.timeoutMs > 0, "A7: bounded timeout policy");
  assertEqual(executiveReadinessAgent.inputSchema.type, "object", "A8: object input schema");
  assertEqual(executiveReadinessAgent.outputSchema.type, "object", "A9: object output schema");

  const reg = makeRegistry();
  assert(reg.has("executive_readiness_agent") === true, "A10: registered in the existing Agent Registry (no second registry)");
  assertEqual(reg.size(), 2, "A11: registry holds exactly the two production agents");
}

// ============================================================
// TEST B — Valid readiness analysis (exact EXEC™ question, full chain)
// ============================================================
let RICH_RESULT;
{
  console.log("TEST B — valid readiness analysis");
  const routedAgent = matchOrchestrationIntent(EXACT_QUESTION);
  assertEqual(routedAgent, "executive_readiness_agent", "B1: exact question routes to executive_readiness_agent");

  const reg = makeRegistry();
  const gw = makeGateway(RUNTIME_PROFILE_RICH);
  RICH_RESULT = await orchestrateCore({
    agentName: "executive_readiness_agent",
    input: {},
    context: makeContext(RUNTIME_PROFILE_RICH),
    registry: reg,
    toolInvoker: gw.invoker,
  });

  assert(RICH_RESULT.ok === true, "B2: orchestrator executes the agent");
  assertEqual(RICH_RESULT.agent, "executive_readiness_agent", "B3: agent identity");
  assertEqual(RICH_RESULT.agentVersion, "1.0.0", "B4: agent version");
  assert(
    RICH_RESULT.toolsRequested.join(",") === "getExecutiveProfile,getExecutiveReadiness,getExecutiveJourney",
    "B5: tools requested recorded"
  );
  assertEqual(RICH_RESULT.toolsSucceeded.length, 3, "B6: all three tools succeeded");
  assert(gw.calls.length === 3, "B7: Tool Gateway™ used for every retrieval (no direct service access)");
  assert(
    gw.calls.every((c) => c.toolOptions.user.id === USER_A.id),
    "B8: authenticated identity preserved on every gateway call"
  );

  const a = RICH_RESULT.data.analysis;
  assert(a !== null && typeof a === "object", "B9: structured analysis returned");
  assert(a.current_readiness !== null, "B10: current readiness present");
  assert(a.evidence_summary !== null, "B11: evidence summary present");
  assert(Array.isArray(a.key_strengths), "B12: key strengths present");
  assert(Array.isArray(a.key_gaps), "B13: key gaps present");
  assert(Array.isArray(a.development_priorities), "B14: development priorities present");
  assert(Array.isArray(a.recommended_actions) && a.recommended_actions.length > 0, "B15: recommended actions present");
  assert(Array.isArray(a.evidence_references) && a.evidence_references.length === 3, "B16: evidence references present");
  assert(a.readiness_source.includes("Executive Readiness™ engine"), "B17: readiness source declared");
  assert(a.agent === "executive_readiness_agent" && a.agent_version === "1.0.0", "B18: agent identity in output contract");
  assert(typeof a.request_id === "string" && a.request_id.startsWith("orch-"), "B19: request id in output contract");

  const formatted = formatAgentResponse(RICH_RESULT.data, { agent: RICH_RESULT.agent, agentVersion: RICH_RESULT.agentVersion });
  assert(typeof formatted === "string" && formatted.includes("Executive Readiness™ Analysis"), "B20: EXEC™-ready formatted analysis");
  assert(formatted.includes("62%"), "B21: formatted analysis shows the authoritative score");
  assert(formatted.includes("not verified facts"), "B22: recommendations labeled as not verified facts");
}

// ============================================================
// TEST C — Score preservation
// ============================================================
{
  console.log("TEST C — score preservation");
  const reg = makeRegistry();
  const gw = makeGateway(RUNTIME_PROFILE_RICH);

  // Direct authoritative retrieval through the Tool Gateway™ (Phase 1 path)
  const direct = await invokeToolCore({
    toolName: "getExecutiveReadiness",
    input: {},
    context: { user: USER_A, runtimeProfile: RUNTIME_PROFILE_RICH, getRuntimeProfile: async () => RUNTIME_PROFILE_RICH },
    registry: toolRegistry,
  });
  assert(direct.ok === true, "C1: direct authoritative retrieval succeeds");

  const result = await orchestrateCore({
    agentName: "executive_readiness_agent",
    input: {},
    context: makeContext(RUNTIME_PROFILE_RICH),
    registry: reg,
    toolInvoker: gw.invoker,
  });
  assertEqual(result.data.analysis.current_readiness.readinessScore, direct.data.readinessScore, "C2: agent score === Tool Gateway score (exact)");
  assertEqual(result.data.analysis.current_readiness.readinessScore, RUNTIME_PROFILE_RICH.resolved.executiveReadiness, "C3: agent score === authoritative source (62) — never recalculated");
  assert(
    result.data.analysis.current_readiness.provenance === "verified_platform_data",
    "C4: score provenance declared as verified platform data"
  );
  assertEqual(result.data.analysis.evidence_coverage, RUNTIME_PROFILE_RICH.resolved.evidenceCoverage, "C5: evidence coverage preserved from the source");
}

// ============================================================
// TEST D — Evidence grounding (no fabricated evidence)
// ============================================================
{
  console.log("TEST D — evidence grounding");
  const a = RICH_RESULT.data.analysis;
  const toolSources = RICH_RESULT.data.tools.find((t) => t.tool === "getExecutiveReadiness").data.evidence.sources.map((s) => s.label);
  const toolDims = Object.keys(RICH_RESULT.data.tools.find((t) => t.tool === "getExecutiveReadiness").data.dimensions);

  // Every cited evidence source exists in the authoritative source
  const citedSourceLabels = a.evidence_summary.sources.map((s) => s.label);
  assert(
    citedSourceLabels.every((l) => toolSources.includes(l)) && citedSourceLabels.length === toolSources.length,
    "D1: every cited evidence source exists in the authoritative source (no invented sources)"
  );
  // Coverage values match the source exactly
  const byLabel = Object.fromEntries(toolSources.map((l, i) => [l, RICH_RESULT.data.tools.find((t) => t.tool === "getExecutiveReadiness").data.evidence.sources[i].coverage]));
  assert(
    a.evidence_summary.sources.every((s) => s.coverage === byLabel[s.label]),
    "D2: cited coverage values match the authoritative source exactly"
  );
  // Every measured dimension exists in the source
  assert(
    a.evidence_summary.measured_dimensions.every((d) => toolDims.includes(d.dimension)),
    "D3: every measured dimension exists in the authoritative source"
  );
  assert(
    a.evidence_summary.measured_dimensions.every((d) => d.provenance === "verified_platform_data"),
    "D4: measured dimensions labeled verified platform data"
  );
  // Strengths are only from measured dimensions
  assert(
    a.key_strengths.every((s) => toolDims.includes(s.dimension) && s.provenance === "ai_synthesis"),
    "D5: key strengths derived only from measured dimensions (AI synthesis of verified data)"
  );
  // No invented achievement/certification/experience strings
  const serialized = JSON.stringify(a);
  for (const banned of ["certification", "achievement", "years of experience", "P&L", "Fortune", "MBA"]) {
    assert(!serialized.includes(banned), `D6: no fabricated content (${banned})`);
  }
}

// ============================================================
// TEST E — Gap grounding (no invented gaps)
// ============================================================
{
  console.log("TEST E — gap grounding");
  const a = RICH_RESULT.data.analysis;
  const readinessData = RICH_RESULT.data.tools.find((t) => t.tool === "getExecutiveReadiness").data;
  const toolSources = readinessData.evidence.sources;
  const toolDims = readinessData.dimensions;

  for (const gap of a.key_gaps) {
    if (gap.type === "limited_evidence" || gap.type === "partial_evidence") {
      const match = toolSources.find((s) => gap.description.startsWith(`${s.label}:`) && s.coverage < (gap.type === "limited_evidence" ? 40 : 70) && s.coverage >= (gap.type === "limited_evidence" ? 0 : 40));
      assert(match !== undefined, `E: evidence gap grounded (${gap.description})`);
    } else if (gap.type === "competency_development") {
      assert(
        toolDims[gap.dimension] === gap.value && gap.value < 70,
        `E: competency gap grounded (${gap.label} = ${gap.value})`
      );
    } else {
      assert(false, `E: unexpected gap type (${gap.type})`);
    }
  }

  // The fixture has exactly: 1 limited source (30%), 1 partial source (55%), 2 development dimensions (<70)
  assertEqual(a.key_gaps.length, 4, "E1: gap count matches the authoritative data exactly");
  assert(
    a.key_gaps.some((g) => g.type === "limited_evidence") &&
      a.key_gaps.some((g) => g.type === "partial_evidence") &&
      a.key_gaps.filter((g) => g.type === "competency_development").length === 2,
    "E2: gap types correctly distinguished (missing evidence / weak evidence / competency development)"
  );
  // No gap references a dimension that was never measured
  assert(
    a.key_gaps.every((g) => !g.dimension || g.dimension in toolDims),
    "E3: no gap references an unmeasured dimension"
  );
  // Verification gap appears only when identity is unverified
  const unverifiedProfile = { ...RUNTIME_PROFILE_RICH, identity: { ...RUNTIME_PROFILE_RICH.identity, identityVerified: false } };
  const reg = makeRegistry();
  const r2 = await orchestrateCore({
    agentName: "executive_readiness_agent",
    input: {},
    context: makeContext(unverifiedProfile),
    registry: reg,
    toolInvoker: makeGateway(unverifiedProfile).invoker,
  });
  assert(
    r2.data.analysis.key_gaps.some((g) => g.type === "incomplete_verification"),
    "E4: incomplete verification flagged when identity is unverified"
  );
  assert(
    !RICH_RESULT.data.analysis.key_gaps.some((g) => g.type === "incomplete_verification"),
    "E5: verification gap absent when identity is verified"
  );
}

// ============================================================
// TEST F — Recommendation grounding
// ============================================================
{
  console.log("TEST F — recommendation grounding");
  const a = RICH_RESULT.data.analysis;
  const readinessData = RICH_RESULT.data.tools.find((t) => t.tool === "getExecutiveReadiness").data;
  assert(a.recommended_actions.length > 0, "F1: recommendations generated from the retrieved context");
  assert(
    a.recommended_actions.every((r) => r.provenance === "recommendation"),
    "F2: every recommendation explicitly labeled RECOMMENDATION (never a verified fact)"
  );
  for (const r of a.recommended_actions) {
    if (r.basis.dimension) {
      assert(
        r.basis.measured_value === readinessData.dimensions[r.basis.dimension],
        `F3: dimension recommendation grounded in the measured value (${r.basis.label})`
      );
    }
    if (r.basis.evidence_source) {
      const src = readinessData.evidence.sources.find((s) => s.label === r.basis.evidence_source);
      assert(src !== undefined && src.coverage === r.basis.coverage, `F4: evidence recommendation grounded (${r.basis.evidence_source})`);
    }
  }
  // Priorities are ordered by measured value (lowest first)
  const dimPriorities = a.development_priorities.filter((p) => p.dimension);
  assert(
    dimPriorities.length === 2 && dimPriorities[0].value <= dimPriorities[1].value,
    "F5: development priorities ordered lowest measured dimension first"
  );
  assert(
    a.development_priorities.every((p) => p.provenance === "ai_synthesis" || p.provenance === "verified_platform_data"),
    "F6: every priority carries a provenance label"
  );
}

// ============================================================
// TEST G — Cross-user protection
// ============================================================
{
  console.log("TEST G — cross-user protection");
  const reg = makeRegistry();
  const gw = makeGateway(RUNTIME_PROFILE_RICH);

  const r = await orchestrateCore({
    agentName: "executive_readiness_agent",
    input: { user_id: "user-b-999" },
    context: makeContext(RUNTIME_PROFILE_RICH),
    registry: reg,
    toolInvoker: gw.invoker,
  });
  assert(r.ok === false, "G1: caller-supplied identity rejected");
  assertEqual(r.error.code, ORCHESTRATION_ERROR_CODES.FORBIDDEN_INPUT, "G2: FORBIDDEN_INPUT");
  assert(gw.calls.length === 0, "G3: agent handler never executed — no foreign data could be returned");

  const r2 = await orchestrateCore({
    agentName: "executive_readiness_agent",
    input: { organization_id: "foreign-org" },
    context: makeContext(RUNTIME_PROFILE_RICH),
    registry: reg,
    toolInvoker: gw.invoker,
  });
  assertEqual(r2.error.code, ORCHESTRATION_ERROR_CODES.FORBIDDEN_INPUT, "G4: caller-supplied tenant rejected");
}

// ============================================================
// TEST H — Unauthorized tool (orchestrator rejects; gateway never executes)
// ============================================================
{
  console.log("TEST H — unauthorized tool");
  const reg = makeRegistry();
  const gw = makeGateway(RUNTIME_PROFILE_RICH);

  // (1) The agent's input schema forbids arbitrary fields — a requestedTools
  //     injection fails validation before the handler ever executes.
  const r1 = await orchestrateCore({
    agentName: "executive_readiness_agent",
    input: { requestedTools: ["manageTenantData"] },
    context: makeContext(RUNTIME_PROFILE_RICH),
    registry: reg,
    toolInvoker: gw.invoker,
  });
  assert(r1.ok === false, "H1: tool-injection input rejected");
  assertEqual(r1.error.code, ORCHESTRATION_ERROR_CODES.INVALID_INPUT, "H2: carries INVALID_INPUT");
  assert(gw.calls.length === 0, "H3: handler never executed");

  // (2) A hijacked clone of the agent attempting a non-whitelisted tool is
  //     rejected by the orchestrator's permission boundary.
  reg.register({
    ...executiveReadinessAgent,
    name: "readiness_hijack_probe_agent",
    inputSchema: { type: "object", properties: { requestedTools: { type: "array" } }, additionalProperties: false },
    handler: async ({ invokeTool }) => {
      const res = await invokeTool("manageTenantData", {});
      return { attempted: res.ok, code: res.error?.code, toolsRequested: ["manageTenantData"], toolsSucceeded: [] };
    },
  });
  const r2 = await orchestrateCore({
    agentName: "readiness_hijack_probe_agent",
    input: { requestedTools: ["manageTenantData"] },
    context: makeContext(RUNTIME_PROFILE_RICH),
    registry: reg,
    toolInvoker: gw.invoker,
  });
  assert(r2.ok === true && r2.data.attempted === false, "H4: forbidden tool invocation rejected");
  assertEqual(r2.data.code, ORCHESTRATION_ERROR_CODES.UNAUTHORIZED_TOOL, "H5: carries UNAUTHORIZED_TOOL");
  assert(
    !gw.calls.some((c) => c.toolName === "manageTenantData"),
    "H6: the underlying Tool Gateway™ handler NEVER executed the forbidden tool"
  );
}

// ============================================================
// TEST I — Tool failure (normalized, no retry, safe EXEC™ fallback)
// ============================================================
{
  console.log("TEST I — tool failure");
  const reg = makeRegistry();

  // Readiness source fails → the analysis is never presented; EXEC™ falls back.
  const gw = makeGateway(RUNTIME_PROFILE_RICH, { failTools: ["getExecutiveReadiness"] });
  const r = await orchestrateCore({
    agentName: "executive_readiness_agent",
    input: {},
    context: makeContext(RUNTIME_PROFILE_RICH),
    registry: reg,
    toolInvoker: gw.invoker,
  });
  assert(r.ok === true, "I1: orchestration completes without uncontrolled crash");
  assertEqual(r.data.toolsSucceeded.length, 2, "I2: remaining tools succeeded");
  assert(
    gw.calls.filter((c) => c.toolName === "getExecutiveReadiness").length === 1,
    "I3: exactly ONE attempt — no uncontrolled retry"
  );
  assert(
    r.data.analysis.unavailable_notes.some((n) => n.includes("Executive Readiness™ data could not be retrieved")),
    "I4: readiness unavailability stated explicitly"
  );
  assert(formatAgentResponse(r.data, { agent: r.agent, agentVersion: r.agentVersion }) === null, "I5: no formatted analysis when the readiness source failed — EXEC™ falls back safely");

  // A non-core tool fails → analysis still delivered, failure disclosed.
  const gw2 = makeGateway(RUNTIME_PROFILE_RICH, { failTools: ["getExecutiveJourney"] });
  const r2 = await orchestrateCore({
    agentName: "executive_readiness_agent",
    input: {},
    context: makeContext(RUNTIME_PROFILE_RICH),
    registry: reg,
    toolInvoker: gw2.invoker,
  });
  const formatted2 = formatAgentResponse(r2.data, { agent: r2.agent, agentVersion: r2.agentVersion });
  assert(typeof formatted2 === "string" && formatted2.includes("62%"), "I6: partial failure still yields the grounded analysis");
  assert(formatted2.includes("getExecutiveJourney — unavailable"), "I7: failed tool disclosed in provenance (never presented as authoritative)");
}

// ============================================================
// TEST J — Timeout (bounded termination)
// ============================================================
{
  console.log("TEST J — timeout");
  const reg = makeRegistry();
  reg.register({
    ...executiveReadinessAgent,
    name: "readiness_timeout_probe_agent",
    timeoutMs: 40,
    handler: () => new Promise((resolve) => setTimeout(() => resolve({ late: true }), 1200)),
  });
  const gw = makeGateway(RUNTIME_PROFILE_RICH);
  const events = [];

  const start = Date.now();
  const r = await orchestrateCore({
    agentName: "readiness_timeout_probe_agent",
    input: {},
    context: makeContext(RUNTIME_PROFILE_RICH),
    registry: reg,
    toolInvoker: gw.invoker,
    onResult: (res, cat) => events.push({ cat, ok: res.ok }),
  });
  const elapsed = Date.now() - start;

  assert(r.ok === false, "J1: timed-out agent fails");
  assertEqual(r.error.code, ORCHESTRATION_ERROR_CODES.AGENT_TIMEOUT, "J2: carries AGENT_TIMEOUT");
  assert(elapsed < 1000, "J3: bounded termination — no orphaned wait");
  assertEqual(events[0].cat, ORCHESTRATION_ERROR_CODES.AGENT_TIMEOUT, "J4: telemetry records the timeout");
  assert(gw.calls.length === 0, "J5: no tool side effects from the timed-out agent");
}

// ============================================================
// TEST K — No invention (evidence unavailable → stated, not fabricated)
// ============================================================
{
  console.log("TEST K — no invention");
  const reg = makeRegistry();
  const gw = makeGateway(RUNTIME_PROFILE_EMPTY);
  const r = await orchestrateCore({
    agentName: "executive_readiness_agent",
    input: {},
    context: makeContext(RUNTIME_PROFILE_EMPTY),
    registry: reg,
    toolInvoker: gw.invoker,
  });

  assert(r.ok === true, "K1: orchestration completes");
  const a = r.data.analysis;

  // Score unavailable → stated, never invented
  assert(a.current_readiness === null, "K2: no readiness score invented");
  assert(
    a.unavailable_notes.some((n) => n.includes("score is currently unavailable")),
    "K3: score unavailability stated explicitly"
  );
  // No evidence fabricated
  assertEqual(a.evidence_summary.sources.length, 0, "K4: no evidence sources invented");
  assertEqual(a.evidence_summary.measured_dimensions.length, 0, "K5: no measured dimensions invented");
  assert(a.evidence_summary.interpretation === null, "K6: no interpretation fabricated without data");
  // No strengths/gaps/priorities/recommendations invented
  assertEqual(a.key_strengths.length, 0, "K7: no strengths invented");
  assertEqual(a.key_gaps.length, 0, "K8: no gaps invented");
  assertEqual(a.development_priorities.length, 0, "K9: no priorities invented");
  assertEqual(a.recommended_actions.length, 0, "K10: no recommendations invented without grounded context");
  assert(a.confidence === null, "K11: no confidence metric invented");

  const formatted = formatAgentResponse(r.data, { agent: r.agent, agentVersion: r.agentVersion });
  assert(formatted.includes("unavailable"), "K12: formatted output states unavailability");
  assert(!formatted.includes("% —"), "K13: formatted output presents no invented score");

  // All three tools succeeded against an empty profile — provenance shows success
  assertEqual(r.data.toolsSucceeded.length, 3, "K14: tools succeeded (empty data is valid data)");
}

// ============================================================
// TEST L — Telemetry (success and failure recorded)
// ============================================================
{
  console.log("TEST L — telemetry");
  const reg = makeRegistry();
  const events = [];
  const onResult = (result, failureCategory) => events.push({ result, failureCategory });

  const okResult = await orchestrateCore({
    agentName: "executive_readiness_agent",
    input: {},
    context: makeContext(RUNTIME_PROFILE_RICH),
    registry: reg,
    toolInvoker: makeGateway(RUNTIME_PROFILE_RICH).invoker,
    onResult,
  });
  assert(events.length === 1 && events[0].result.ok === true, "L1: success telemetry recorded");
  const s = events[0].result;
  assert(s.requestId.startsWith("orch-"), "L2: request id recorded");
  assertEqual(s.agent, "executive_readiness_agent", "L3: agent name recorded");
  assertEqual(s.agentVersion, "1.0.0", "L4: agent version recorded");
  assert(typeof s.startedAt === "string" && typeof s.completedAt === "string" && typeof s.durationMs === "number", "L5: timestamps + duration recorded");
  assertEqual(s.toolsSucceeded.length, 3, "L6: tools successfully executed recorded");
  assertEqual(events[0].failureCategory, null, "L7: success has no failure category");

  const failResult = await orchestrateCore({
    agentName: "executive_readiness_agent",
    input: {},
    context: makeContext(RUNTIME_PROFILE_RICH, { user: null }),
    registry: reg,
    toolInvoker: makeGateway(RUNTIME_PROFILE_RICH).invoker,
    onResult,
  });
  assert(failResult.ok === false, "L8: failure occurs");
  assertEqual(events[1].failureCategory, ORCHESTRATION_ERROR_CODES.AUTHENTICATION_REQUIRED, "L9: failure category recorded");

  // No sensitive payloads in the telemetry record
  const serialized = JSON.stringify(events);
  assert(!serialized.includes("alice@execleadai.co"), "L10: no PII in telemetry");
  assert(!serialized.includes("prompt"), "L11: no prompts in telemetry");
}

// ============================================================
// TEST M — Regression (Phase 1 + Phase 2A behavior unchanged)
// ============================================================
{
  console.log("TEST M — regression");
  // M1: combined readiness+journey still routes to the Phase 2A agent
  assertEqual(
    matchOrchestrationIntent("What is my current executive readiness and where am I in my leadership journey?"),
    "executive_context_agent",
    "M1: combined context request still routes to executive_context_agent"
  );
  // M2: simple factual retrieval stays on the Phase 1 direct path
  assertEqual(matchOrchestrationIntent("What's my current readiness score?"), null, "M2: factual score request does NOT orchestrate");
  assertEqual(matchOrchestrationIntent("What's my readiness right now?"), null, "M3: factual status request does NOT orchestrate");
  assertEqual(matchToolIntent("what's my readiness right now"), "getExecutiveReadiness", "M4: Phase 1 direct router unchanged");
  assertEqual(matchToolIntent("show me my executive profile"), "getExecutiveProfile", "M5: Phase 1 profile routing unchanged");
  assertEqual(matchToolIntent("how can I improve my readiness"), null, "M6: improvement question still falls through to AI");

  // M7: Phase 2A agent still executes and formats unchanged
  const reg = makeRegistry();
  const ctxResult = await orchestrateCore({
    agentName: "executive_context_agent",
    input: {},
    context: makeContext(RUNTIME_PROFILE_RICH),
    registry: reg,
    toolInvoker: makeGateway(RUNTIME_PROFILE_RICH).invoker,
  });
  const ctxAnswer = formatAgentResponse(ctxResult.data, { agent: ctxResult.agent, agentVersion: ctxResult.agentVersion });
  assert(ctxAnswer.includes("Executive Readiness™") && ctxAnswer.includes("Executive Journey™"), "M7: Phase 2A agent output unchanged");
  assert(ctxAnswer.includes("executive_context_agent"), "M8: Phase 2A provenance unchanged");

  // M9: Phase 1 formatter unchanged
  const direct = await invokeToolCore({
    toolName: "getExecutiveReadiness",
    input: {},
    context: { user: USER_A, runtimeProfile: RUNTIME_PROFILE_RICH, getRuntimeProfile: async () => RUNTIME_PROFILE_RICH },
    registry: toolRegistry,
  });
  const fmt = formatToolResponse("getExecutiveReadiness", direct.data);
  assert(fmt.includes("62%") && fmt.includes("Tool Gateway™"), "M9: Phase 1 formatter unchanged");

  // M10: registry independence — tool registry untouched by agent registration
  assertEqual(toolRegistry.size(), 3, "M10: Tool Registry still holds exactly the three Phase 1 tools");

  // M11: routing table for the new agent — analysis phrases route, noise does not
  assertEqual(matchOrchestrationIntent("why is my readiness where it is"), "executive_readiness_agent", "M11: why-question routes to the readiness agent");
  assertEqual(matchOrchestrationIntent("analyze my executive readiness"), "executive_readiness_agent", "M12: analyze-request routes to the readiness agent");
  assertEqual(matchOrchestrationIntent("what evidence supports my security claims about the company"), null, "M13: non-readiness evidence question does NOT orchestrate");
  assertEqual(matchOrchestrationIntent("What is executive readiness?"), null, "M14: informational question does NOT orchestrate");
  assertEqual(matchOrchestrationIntent(""), null, "M15: empty input does NOT orchestrate");
}

// ── Report ──
console.log(`\n${passed} passed, ${failed} failed (of ${passed + failed})`);
if (failed > 0) {
  console.error("\n✗ PHASE 2B EXECUTIVE READINESS AGENT TESTS FAILED");
  throw new Error("PHASE 2B EXECUTIVE READINESS AGENT TESTS FAILED");
}
console.log("✓ PHASE 2B EXECUTIVE READINESS AGENT TESTS PASSED");
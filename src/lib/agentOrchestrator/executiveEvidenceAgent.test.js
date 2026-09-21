// ============================================================
// EXECLEAD.AI — Agent Orchestrator™ Phase 3A Test Suite
// ============================================================
// Offline regression tests for controlled multi-agent collaboration:
// executive_evidence_agent + the bounded, structured, exactly-1-hop
// delegation from executive_readiness_agent. No SDK access, no I/O, no
// production data, no record mutation — the orchestrator core, registry,
// all three production agents, and the real Tool Gateway™ core + real tool
// handlers run against fixture Executive Runtime Profiles™.
// Run: node src/lib/agentOrchestrator/executiveEvidenceAgent.test.js
//
// Covers the Phase 3A scenarios:
//   TEST A — Evidence Agent registration (contract, schema, version, enabled)
//   TEST B — Direct Evidence Agent execution (orchestrator, context, tools)
//   TEST C — Readiness → Evidence delegation (the primary multi-agent workflow)
//   TEST D — Delegation authorization (only readiness may delegate)
//   TEST E — Recursive delegation (rejected at depth > 1)
//   TEST F — Arbitrary agent selection (rejected)
//   TEST G — Cross-user protection (foreign identity rejected)
//   TEST H — Evidence grounding (no fabricated evidence)
//   TEST I — Score preservation (evidence agent never touches readiness)
//   TEST J — Evidence Agent failure (normalized, safe fallback, no retry)
//   TEST K — Timeout (bounded termination, no orphaned execution)
//   TEST L — Telemetry (parent-child relationship visible)
//   TEST M — No mutation (read-only capability set)
//   TEST N — Regression (Phase 1 + 2A + 2B behavior intact)
// ============================================================

import { createAgentRegistry, validateAgentDefinition } from "./registry.js";
import { orchestrateCore, ORCHESTRATION_ERROR_CODES, MAX_DELEGATION_DEPTH } from "./orchestratorCore.js";
import executiveContextAgent from "./agents/executiveContextAgent.js";
import executiveReadinessAgent from "./agents/executiveReadinessAgent.js";
import executiveEvidenceAgent from "./agents/executiveEvidenceAgent.js";
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

// ── Fixture RICH: measured dimensions + three evidence sources ──
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

// ── Fixture EMPTY: no evidence available ──
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
        getRuntimeProfile: async () => profile,
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
  reg.register(executiveEvidenceAgent);
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

console.log("── Agent Orchestrator™ Phase 3A Test Suite ──\n");

// ============================================================
// TEST A — Evidence Agent registration
// ============================================================
{
  console.log("TEST A — registration");
  const check = validateAgentDefinition(executiveEvidenceAgent);
  assert(check.valid === true, `A1: executive_evidence_agent contract valid${check.valid ? "" : ` (${check.error})`}`);
  assertEqual(executiveEvidenceAgent.name, "executive_evidence_agent", "A2: agent name");
  assertEqual(executiveEvidenceAgent.version, "1.0.0", "A3: version present");
  assertEqual(executiveEvidenceAgent.enabled, true, "A4: enabled state correct");
  assertEqual(executiveEvidenceAgent.requiredPermissions.join(","), "authenticated", "A5: requires authentication only");
  assert(
    executiveEvidenceAgent.allowedTools.length === 2 &&
      executiveEvidenceAgent.allowedTools.includes("getExecutiveProfile") &&
      executiveEvidenceAgent.allowedTools.includes("getExecutiveReadiness"),
    "A6: allowed tools are exactly the minimum two read-only evidence sources (no mutation/admin/cross-user tools)"
  );
  assert(executiveEvidenceAgent.allowedDelegations === undefined, "A7: NO delegation rights — the Evidence Agent can never delegate");
  assert(typeof executiveEvidenceAgent.timeoutMs === "number" && executiveEvidenceAgent.timeoutMs > 0, "A8: bounded timeout policy");
  assertEqual(executiveEvidenceAgent.inputSchema.type, "object", "A9: object input schema");
  assertEqual(executiveEvidenceAgent.outputSchema.type, "object", "A10: object output schema");

  const reg = makeRegistry();
  assert(reg.has("executive_evidence_agent") === true, "A11: registered in the existing Agent Registry (no second registry)");
  assertEqual(reg.size(), 3, "A12: registry holds exactly the three production agents");
  assert(
    JSON.stringify(reg.list().map((a) => a.name)) ===
      JSON.stringify(["executive_context_agent", "executive_readiness_agent", "executive_evidence_agent"]),
    "A13: Developer Console registry lists exactly context, readiness, evidence"
  );
  assertEqual(reg.list()[1].allowedDelegations.join(","), "executive_evidence_agent", "A14: readiness agent's delegation whitelist is explicit");
  assert(reg.list()[2].allowedDelegations === null, "A15: evidence agent has no delegation whitelist (cannot delegate)");

  // Delegation whitelists are validated by the contract
  assert(
    validateAgentDefinition({ ...executiveEvidenceAgent, allowedDelegations: [] }).valid === false,
    "A16: empty allowedDelegations rejected"
  );
  assert(
    validateAgentDefinition({ ...executiveEvidenceAgent, allowedDelegations: "everyone" }).valid === false,
    "A17: non-array allowedDelegations rejected"
  );
  assertEqual(MAX_DELEGATION_DEPTH, 1, "A18: delegation depth is capped at exactly 1");
}

// ============================================================
// TEST B — Direct Evidence Agent execution (through the orchestrator)
// ============================================================
let DIRECT_EVIDENCE_RESULT;
{
  console.log("TEST B — direct evidence agent execution");
  const reg = makeRegistry();
  const gw = makeGateway(RUNTIME_PROFILE_RICH);

  DIRECT_EVIDENCE_RESULT = await orchestrateCore({
    agentName: "executive_evidence_agent",
    input: {},
    context: makeContext(RUNTIME_PROFILE_RICH),
    registry: reg,
    toolInvoker: gw.invoker,
  });

  assert(DIRECT_EVIDENCE_RESULT.ok === true, "B1: orchestrator executes the Evidence Agent");
  assertEqual(DIRECT_EVIDENCE_RESULT.agent, "executive_evidence_agent", "B2: agent identity");
  assertEqual(DIRECT_EVIDENCE_RESULT.agentVersion, "1.0.0", "B3: agent version");
  assert(DIRECT_EVIDENCE_RESULT.delegation.depth === 0, "B4: direct execution runs at depth 0");
  assert(gw.calls.length === 2, "B5: exactly the two authorized tools invoked");
  assert(
    gw.calls.every((c) => executiveEvidenceAgent.allowedTools.includes(c.toolName)),
    "B6: authorized tools only — no mutation/admin/cross-user tool"
  );
  assert(
    gw.calls.every((c) => c.toolOptions.user.id === USER_A.id),
    "B7: authenticated context preserved on every gateway call"
  );
  assert(gw.calls.every((c) => Object.keys(c.toolInput || {}).length === 0), "B8: no injected tool payloads (read-only retrieval)");

  const d = DIRECT_EVIDENCE_RESULT.data;
  assert(d.agent === "executive_evidence_agent" && d.agent_version === "1.0.0", "B9: agent + version in structured output");
  assert(Array.isArray(d.verified_evidence) && d.verified_evidence.length === 1, "B10: verified_evidence present");
  assert(Array.isArray(d.partial_evidence) && d.partial_evidence.length === 1, "B11: partial_evidence present");
  assert(Array.isArray(d.missing_evidence) && d.missing_evidence.length === 1, "B12: missing_evidence present");
  assert(Array.isArray(d.evidence_gaps) && d.evidence_gaps.length > 0, "B13: evidence_gaps present");
  assert(Array.isArray(d.relevant_dimensions), "B14: relevant_dimensions present");
  assert(d.evidence_summary && typeof d.evidence_summary === "object", "B15: evidence_summary present");
  assert(d.provenance && Array.isArray(d.provenance.evidence_references), "B16: provenance present");
  assert(d.confidence !== null && d.confidence.value === 58, "B17: confidence = authoritative evidence coverage");
  assert(d.requested_analysis === "evidence_inventory", "B18: default analysis type");
  assert(
    d.verified_evidence.every((v) => v.provenance === "verified_platform_data"),
    "B19: verified evidence labeled with provenance"
  );
}

// ============================================================
// TEST C — Readiness → Evidence delegation (primary multi-agent workflow)
// ============================================================
{
  console.log("TEST C — readiness → evidence delegation");
  assertEqual(matchOrchestrationIntent(EXACT_QUESTION), "executive_readiness_agent", "C1: exact question routes to the readiness agent");

  const reg = makeRegistry();
  const gw = makeGateway(RUNTIME_PROFILE_RICH);
  const result = await orchestrateCore({
    agentName: "executive_readiness_agent",
    input: {},
    context: makeContext(RUNTIME_PROFILE_RICH),
    registry: reg,
    toolInvoker: gw.invoker,
  });

  assert(result.ok === true, "C2: parent orchestration succeeds");
  assert(result.delegation.depth === 0 && result.delegation.parentAgentName === null, "C3: parent runs at depth 0");

  const a = result.data.analysis;
  assert(a.evidence_delegation !== null, "C4: structured delegation record present");
  assert(a.evidence_delegation.agent === "executive_evidence_agent", "C5: delegated to the evidence agent");
  assert(a.evidence_delegation.ok === true, "C6: delegation succeeded");
  assert(a.evidence_delegation.delegationDepth === 1, "C7: delegation depth recorded as 1");
  assert(typeof a.evidence_delegation.requestId === "string", "C8: child/delegation request id recorded");
  assert(a.evidence_delegation.parentRequestId === result.requestId, "C9: delegation links to the parent request id");
  assert(a.evidence_analysis !== null && a.evidence_analysis.agent === "executive_evidence_agent", "C10: structured evidence result returned to the readiness agent");
  assert(a.current_readiness.readinessScore === 62, "C11: final readiness value preserved exactly (62)");

  // The delegated child executed through the same governed Tool Gateway™
  assert(
    gw.calls.length === 5 &&
      gw.calls.filter((c) => c.toolOptions.delegatedBy === "executive_readiness_agent").length === 2,
    "C12: child evidence execution went through the Tool Gateway™ (marked delegatedBy)"
  );
  assert(
    gw.calls.every((c) => c.toolOptions.user.id === USER_A.id),
    "C13: child inherited the same immutable authenticated identity"
  );

  // EXEC™-ready final analysis includes the delegated evidence intelligence
  const formatted = formatAgentResponse(result.data, { agent: result.agent, agentVersion: result.agentVersion });
  assert(formatted.includes("Evidence Intelligence"), "C14: final analysis includes the evidence intelligence section");
  assert(formatted.includes("executive_evidence_agent"), "C15: delegated provenance disclosed");
  assert(formatted.includes("62%"), "C16: final analysis still reports the authoritative score");
}

// ============================================================
// TEST D — Delegation authorization (only readiness may delegate)
// ============================================================
{
  console.log("TEST D — delegation authorization");
  const reg = makeRegistry();
  let evidenceProbeExecuted = false;
  // A hijacked clone of the EVIDENCE agent with an execution marker
  reg.register({
    ...executiveEvidenceAgent,
    name: "evidence_sentinel_probe_agent",
    handler: async () => {
      evidenceProbeExecuted = true;
      return { marker: true, toolsRequested: [], toolsSucceeded: [] };
    },
  });
  // (1) The context agent (no allowedDelegations) attempts to delegate
  let captured = null;
  reg.register({
    ...executiveContextAgent,
    name: "context_delegation_probe_agent",
    handler: async ({ delegateAgent }) => {
      captured = await delegateAgent("evidence_sentinel_probe_agent", {});
      return { toolsRequested: [], toolsSucceeded: [] };
    },
  });
  const r1 = await orchestrateCore({
    agentName: "context_delegation_probe_agent",
    input: {},
    context: makeContext(RUNTIME_PROFILE_RICH),
    registry: reg,
    toolInvoker: makeGateway(RUNTIME_PROFILE_RICH).invoker,
  });
  assert(captured !== null && captured.ok === false, "D1: agent without delegation rights is rejected");
  assertEqual(captured.error.code, ORCHESTRATION_ERROR_CODES.UNAUTHORIZED_DELEGATION, "D2: carries UNAUTHORIZED_DELEGATION");
  assert(evidenceProbeExecuted === false, "D3: the target agent NEVER executed");

  // (2) The readiness agent attempts to delegate to an agent NOT on its whitelist
  let captured2 = null;
  reg.register({
    ...executiveReadinessAgent,
    name: "readiness_offwhitelist_probe_agent",
    handler: async ({ delegateAgent }) => {
      captured2 = await delegateAgent("executive_context_agent", {});
      return { toolsRequested: [], toolsSucceeded: [] };
    },
  });
  await orchestrateCore({
    agentName: "readiness_offwhitelist_probe_agent",
    input: {},
    context: makeContext(RUNTIME_PROFILE_RICH),
    registry: reg,
    toolInvoker: makeGateway(RUNTIME_PROFILE_RICH).invoker,
  });
  assert(captured2.ok === false, "D4: readiness agent cannot delegate to a non-whitelisted agent");
  assertEqual(captured2.error.code, ORCHESTRATION_ERROR_CODES.UNAUTHORIZED_DELEGATION, "D5: carries UNAUTHORIZED_DELEGATION");

  // (3) Production evidence agent itself has no allowedDelegations at all
  assert(executiveEvidenceAgent.allowedDelegations === undefined, "D6: evidence agent structurally cannot delegate");
}

// ============================================================
// TEST E — Recursive delegation (rejected at depth > 1)
// ============================================================
{
  console.log("TEST E — recursive delegation");
  const reg = makeRegistry();
  const events = [];
  let grandchildRejection = null;

  reg.register({
    ...executiveReadinessAgent,
    name: "depth_parent_probe_agent",
    allowedDelegations: ["depth_child_probe_agent"],
    handler: async ({ delegateAgent }) => {
      const child = await delegateAgent("depth_child_probe_agent", {});
      return { childOk: child.ok, toolsRequested: [], toolsSucceeded: [] };
    },
  });
  reg.register({
    ...executiveEvidenceAgent,
    name: "depth_child_probe_agent",
    // The child ILLEGALLY attempts to delegate once more (depth 2)
    handler: async ({ delegateAgent }) => {
      grandchildRejection = await delegateAgent("executive_context_agent", {});
      return { attempted: grandchildRejection !== null, toolsRequested: [], toolsSucceeded: [] };
    },
  });

  const start = Date.now();
  const r = await orchestrateCore({
    agentName: "depth_parent_probe_agent",
    input: {},
    context: makeContext(RUNTIME_PROFILE_RICH),
    registry: reg,
    toolInvoker: makeGateway(RUNTIME_PROFILE_RICH).invoker,
    onResult: (res, cat) => events.push({ res, cat }),
  });
  const elapsed = Date.now() - start;

  assert(r.ok === true && r.data.childOk === true, "E1: parent and child complete");
  assert(grandchildRejection !== null && grandchildRejection.ok === false, "E2: second-level delegation rejected");
  assertEqual(grandchildRejection.error.code, ORCHESTRATION_ERROR_CODES.DELEGATION_DEPTH_EXCEEDED, "E3: carries DELEGATION_DEPTH_EXCEEDED");
  assert(grandchildRejection.delegation.depth === 2, "E4: rejected delegation records the attempted depth (2)");
  assert(
    !events.some((e) => e.res.ok === true && e.res.agent === "executive_context_agent"),
    "E5: no second-level agent execution — the context agent never ran"
  );
  assert(
    events.some((e) => e.cat === ORCHESTRATION_ERROR_CODES.DELEGATION_DEPTH_EXCEEDED),
    "E6: telemetry records the rejection"
  );
  assert(elapsed < 5000, "E7: bounded termination — no orphaned wait");
}

// ============================================================
// TEST F — Arbitrary agent selection (rejected)
// ============================================================
{
  console.log("TEST F — arbitrary agent selection");
  const reg = makeRegistry();
  const results = [];
  reg.register({
    ...executiveReadinessAgent,
    name: "arbitrary_target_probe_agent",
    handler: async ({ delegateAgent }) => {
      results.push(await delegateAgent("totally_arbitrary_agent", {}));
      results.push(await delegateAgent("executive_context_agent", {}));
      results.push(await delegateAgent("executive_readiness_agent", {}));
      results.push(await delegateAgent(12345, {}));
      return { toolsRequested: [], toolsSucceeded: [] };
    },
  });
  await orchestrateCore({
    agentName: "arbitrary_target_probe_agent",
    input: {},
    context: makeContext(RUNTIME_PROFILE_RICH),
    registry: reg,
    toolInvoker: makeGateway(RUNTIME_PROFILE_RICH).invoker,
  });
  assert(results.length === 4 && results.every((x) => x.ok === false), "F1: every arbitrary/unauthorized target rejected");
  assert(
    results.every((x) => x.error.code === ORCHESTRATION_ERROR_CODES.UNAUTHORIZED_DELEGATION),
    "F2: all rejections carry UNAUTHORIZED_DELEGATION"
  );
  assert(
    results.every((x) => x.error.message.includes("not authorized to delegate")),
    "F3: rejection messages name the delegation boundary"
  );
}

// ============================================================
// TEST G — Cross-user protection
// ============================================================
{
  console.log("TEST G — cross-user protection");
  const reg = makeRegistry();

  // (1) Top-level caller-supplied identity rejected
  const gw1 = makeGateway(RUNTIME_PROFILE_RICH);
  const r1 = await orchestrateCore({
    agentName: "executive_evidence_agent",
    input: { user_id: "user-b-999" },
    context: makeContext(RUNTIME_PROFILE_RICH),
    registry: reg,
    toolInvoker: gw1.invoker,
  });
  assert(r1.ok === false, "G1: caller-supplied user_id rejected");
  assertEqual(r1.error.code, ORCHESTRATION_ERROR_CODES.FORBIDDEN_INPUT, "G2: carries FORBIDDEN_INPUT");
  assert(gw1.calls.length === 0, "G3: handler never executed — no foreign data could be returned");

  // (2) Identity smuggled through a delegation input is rejected by the child
  let delResult = null;
  reg.register({
    ...executiveReadinessAgent,
    name: "foreign_identity_probe_agent",
    handler: async ({ delegateAgent }) => {
      delResult = await delegateAgent("executive_evidence_agent", { user_id: "user-b-999", organization_id: "foreign-org" });
      return { toolsRequested: [], toolsSucceeded: [] };
    },
  });
  const gw2 = makeGateway(RUNTIME_PROFILE_RICH);
  const r2 = await orchestrateCore({
    agentName: "foreign_identity_probe_agent",
    input: {},
    context: makeContext(RUNTIME_PROFILE_RICH),
    registry: reg,
    toolInvoker: gw2.invoker,
  });
  assert(r2.ok === true, "G4: parent completes");
  assert(delResult.ok === false, "G5: delegated child rejects smuggled identity");
  assertEqual(delResult.error.code, ORCHESTRATION_ERROR_CODES.FORBIDDEN_INPUT, "G6: child carries FORBIDDEN_INPUT");
  assert(gw2.calls.length === 0, "G7: no evidence was retrieved for any foreign identity");
}

// ============================================================
// TEST H — Evidence grounding (no fabricated evidence)
// ============================================================
{
  console.log("TEST H — evidence grounding");
  const reg = makeRegistry();
  const gw = makeGateway(RUNTIME_PROFILE_RICH);
  const r = await orchestrateCore({
    agentName: "executive_evidence_agent",
    input: {
      requested_analysis: "evidence_gap_analysis",
      relevant_dimensions: ["promotion_readiness", "nonexistent_dimension"],
      readiness_context: { readinessScore: 62, evidenceCoverage: 58 },
    },
    context: makeContext(RUNTIME_PROFILE_RICH),
    registry: reg,
    toolInvoker: gw.invoker,
  });
  const d = r.data;
  const sourceLabels = RUNTIME_PROFILE_RICH.evidence.sources.map((s) => s.label);

  assertEqual(d.requested_analysis, "evidence_gap_analysis", "H1: requested analysis type honored");
  assert(
    d.verified_evidence.length === 1 && d.verified_evidence[0].label === "Interview Evidence" && d.verified_evidence[0].coverage === 82,
    "H2: fully documented evidence classified from the authoritative source"
  );
  assert(
    d.partial_evidence.length === 1 && d.partial_evidence[0].label === "Identity Evidence" && d.partial_evidence[0].coverage === 55,
    "H3: partial evidence classified from the authoritative source"
  );
  assert(
    d.missing_evidence.length === 1 && d.missing_evidence[0].label === "Leadership Evidence" && d.missing_evidence[0].coverage === 30,
    "H4: missing evidence classified from the authoritative source"
  );
  const allCited = [...d.verified_evidence, ...d.partial_evidence, ...d.missing_evidence, ...d.unquantified_evidence];
  assert(
    allCited.every((x) => sourceLabels.includes(x.label)),
    "H5: every cited evidence item exists in the authoritative source (no invented evidence)"
  );
  assert(
    d.evidence_gaps.every((g) => !g.area || sourceLabels.includes(g.area)),
    "H6: every evidence gap grounded in a real evidence source"
  );
  assert(
    d.relevant_dimensions.length === 1 && d.relevant_dimensions[0].dimension === "promotion_readiness",
    "H7: unknown requested dimensions ignored — never invented"
  );
  assert(
    d.recommended_evidence_actions.every((rec) => rec.provenance === "recommendation" && sourceLabels.includes(rec.basis.evidence_source)),
    "H8: recommended evidence actions grounded in retrieved sources, labeled recommendation"
  );

  // Empty fixture: nothing fabricated
  const r2 = await orchestrateCore({
    agentName: "executive_evidence_agent",
    input: {},
    context: makeContext(RUNTIME_PROFILE_EMPTY),
    registry: reg,
    toolInvoker: makeGateway(RUNTIME_PROFILE_EMPTY).invoker,
  });
  const d2 = r2.data;
  assert(
    d2.verified_evidence.length === 0 && d2.partial_evidence.length === 0 && d2.missing_evidence.length === 0 && d2.evidence_gaps.length === 0,
    "H9: no evidence fabricated when none exists"
  );
  assert(
    d2.unavailable_notes.some((n) => n.includes("No evidence-source coverage data")),
    "H10: evidence unavailability stated explicitly"
  );
  assert(d2.confidence === null, "H11: no confidence metric invented without data");
}

// ============================================================
// TEST I — Score preservation
// ============================================================
{
  console.log("TEST I — score preservation");
  // The Evidence Agent NEVER emits a readiness score of its own. The raw
  // Tool Gateway™ envelope (tools[]) is authoritative retrieved data — the
  // assertion targets the agent's own ANALYSIS fields, which must contain no
  // readiness score at all.
  const { tools: _rawToolEnvelope, ...evidenceAnalysisPayload } = DIRECT_EVIDENCE_RESULT.data;
  const serialized = JSON.stringify(evidenceAnalysisPayload);
  assert(!serialized.includes("readinessScore"), "I1: Evidence Agent analysis contains no readiness score (never calculated/modified)");
  assert(!serialized.includes("executiveReadiness"), "I1b: Evidence Agent analysis never re-derives the Executive Readiness™ value");

  // Full delegated workflow: final readiness value matches the authoritative source exactly
  const reg = makeRegistry();
  const direct = await invokeToolCore({
    toolName: "getExecutiveReadiness",
    input: {},
    context: { user: USER_A, runtimeProfile: RUNTIME_PROFILE_RICH, getRuntimeProfile: async () => RUNTIME_PROFILE_RICH },
    registry: toolRegistry,
  });
  const result = await orchestrateCore({
    agentName: "executive_readiness_agent",
    input: {},
    context: makeContext(RUNTIME_PROFILE_RICH),
    registry: reg,
    toolInvoker: makeGateway(RUNTIME_PROFILE_RICH).invoker,
  });
  assertEqual(result.data.analysis.current_readiness.readinessScore, direct.data.readinessScore, "I2: final readiness === Tool Gateway score");
  assertEqual(result.data.analysis.current_readiness.readinessScore, RUNTIME_PROFILE_RICH.resolved.executiveReadiness, "I3: final readiness === authoritative source (62) — no deviation");
}

// ============================================================
// TEST J — Evidence Agent failure (normalized, safe fallback, no retry)
// ============================================================
{
  console.log("TEST J — evidence agent failure");
  const reg = makeRegistry();
  reg.setEnabled("executive_evidence_agent", false); // delegation target unavailable
  const gw = makeGateway(RUNTIME_PROFILE_RICH);

  const r = await orchestrateCore({
    agentName: "executive_readiness_agent",
    input: {},
    context: makeContext(RUNTIME_PROFILE_RICH),
    registry: reg,
    toolInvoker: gw.invoker,
  });

  assert(r.ok === true, "J1: parent readiness analysis completes safely");
  assert(r.data.analysis.evidence_delegation.ok === false, "J2: delegation failure normalized");
  assertEqual(r.data.analysis.evidence_delegation.error_code, ORCHESTRATION_ERROR_CODES.AGENT_DISABLED, "J3: failure category surfaced (AGENT_DISABLED)");
  assert(r.data.analysis.evidence_analysis === null, "J4: no evidence analysis fabricated");
  assert(
    r.data.analysis.unavailable_notes.some((n) => n.includes("executive_evidence_agent") && n.includes("unavailable")),
    "J5: unavailability reported explicitly"
  );
  assert(
    gw.calls.length === 3 && gw.calls.every((c) => c.toolOptions.delegatedBy === null),
    "J6: no child tool execution and no uncontrolled retry — only the parent's own 3 retrievals"
  );
  assertEqual(r.data.analysis.current_readiness.readinessScore, 62, "J7: authoritative readiness still used");
  const formatted = formatAgentResponse(r.data, { agent: r.agent, agentVersion: r.agentVersion });
  assert(formatted.includes("Evidence Intelligence:** unavailable"), "J8: formatted analysis states the evidence analysis is unavailable");

  // Tool Gateway failure inside the child is also normalized
  const reg2 = makeRegistry();
  const gw2 = makeGateway(RUNTIME_PROFILE_RICH, { failTools: ["getExecutiveReadiness", "getExecutiveProfile"] });
  const r2 = await orchestrateCore({
    agentName: "executive_readiness_agent",
    input: {},
    context: makeContext(RUNTIME_PROFILE_RICH),
    registry: reg2,
    toolInvoker: gw2.invoker,
  });
  assert(r2.ok === true && r2.data.analysis.evidence_analysis !== null, "J9: child completes with explicit unavailability when its sources fail");
  assert(
    r2.data.analysis.evidence_analysis.unavailable_notes.some((n) => n.includes("could not be retrieved")),
    "J10: child states its evidence sources were unavailable"
  );
}

// ============================================================
// TEST K — Timeout (bounded termination, no orphaned execution)
// ============================================================
{
  console.log("TEST K — timeout");
  const reg = makeRegistry();
  reg.register({
    ...executiveEvidenceAgent,
    name: "timeout_evidence_probe_agent",
    timeoutMs: 40,
    handler: () => new Promise((resolve) => setTimeout(() => resolve({ late: true }), 1200)),
  });
  let childResult = null;
  reg.register({
    ...executiveReadinessAgent,
    name: "timeout_parent_probe_agent",
    allowedDelegations: ["timeout_evidence_probe_agent"],
    handler: async ({ delegateAgent }) => {
      childResult = await delegateAgent("timeout_evidence_probe_agent", {});
      return { toolsRequested: [], toolsSucceeded: [] };
    },
  });

  const start = Date.now();
  const r = await orchestrateCore({
    agentName: "timeout_parent_probe_agent",
    input: {},
    context: makeContext(RUNTIME_PROFILE_RICH),
    registry: reg,
    toolInvoker: makeGateway(RUNTIME_PROFILE_RICH).invoker,
  });
  const elapsed = Date.now() - start;

  assert(r.ok === true, "K1: parent completes despite the delegated timeout");
  assert(childResult.ok === false, "K2: timed-out delegated child fails");
  assertEqual(childResult.error.code, ORCHESTRATION_ERROR_CODES.AGENT_TIMEOUT, "K3: carries AGENT_TIMEOUT");
  assert(elapsed < 1000, "K4: bounded termination — no orphaned wait");
  assert(childResult.delegation.depth === 1, "K5: timeout recorded on the delegated execution (depth 1)");
  assert(childResult.data === undefined || childResult.data === null, "K6: no result data from the timed-out child");
}

// ============================================================
// TEST L — Telemetry (parent-child relationship visible)
// ============================================================
{
  console.log("TEST L — telemetry");
  const reg = makeRegistry();
  const events = [];
  const result = await orchestrateCore({
    agentName: "executive_readiness_agent",
    input: {},
    context: makeContext(RUNTIME_PROFILE_RICH),
    registry: reg,
    toolInvoker: makeGateway(RUNTIME_PROFILE_RICH).invoker,
    onResult: (res, cat) => events.push({ res, cat }),
  });

  assertEqual(events.length, 2, "L1: exactly two telemetry events (parent + child)");
  const childEvt = events.find((e) => e.res.agent === "executive_evidence_agent");
  const parentEvt = events.find((e) => e.res.agent === "executive_readiness_agent");
  assert(!!childEvt && !!parentEvt, "L2: parent and child events present");

  // Parent: executive_readiness_agent · depth 0 · success
  assertEqual(parentEvt.res.delegation.depth, 0, "L3: parent depth recorded (0)");
  assertEqual(parentEvt.res.delegation.parentAgentName, null, "L4: parent has no parent agent");
  assertEqual(parentEvt.cat, null, "L5: parent success has no failure category");
  assertEqual(parentEvt.res.ok, true, "L6: parent status success");
  assertEqual(parentEvt.res.toolsSucceeded.length, 3, "L7: parent tools recorded");
  assert(typeof parentEvt.res.durationMs === "number", "L8: parent duration recorded");

  // Child: executive_evidence_agent · depth 1 · parent readiness · success
  assertEqual(childEvt.res.delegation.depth, 1, "L9: child depth recorded (1)");
  assertEqual(childEvt.res.delegation.parentAgentName, "executive_readiness_agent", "L10: child records parent agent");
  assertEqual(childEvt.res.delegation.parentRequestId, parentEvt.res.requestId, "L11: child links to the parent request id");
  assertEqual(childEvt.res.ok, true, "L12: child status success");
  assertEqual(childEvt.cat, null, "L13: child success has no failure category");
  assertEqual(childEvt.res.toolsSucceeded.length, 2, "L14: child tools recorded");
  assert(typeof childEvt.res.durationMs === "number", "L15: child duration recorded");
  assertEqual(result.requestId, parentEvt.res.requestId, "L16: parent event correlates with the orchestration result");

  // Rejection telemetry carries the failure category + depth
  const events2 = [];
  const reg2 = createAgentRegistry();
  reg2.register(executiveContextAgent);
  reg2.register(executiveReadinessAgent);
  reg2.register(executiveEvidenceAgent);
  reg2.register({
    ...executiveEvidenceAgent,
    name: "depth_reject_probe_agent",
    handler: async ({ delegateAgent, context }) => {
      const rej = await delegateAgent("executive_context_agent", {});
      return { rejectionDepth: rej.delegation.depth, toolsRequested: [], toolsSucceeded: [] };
    },
  });
  // Execute the reject probe AS a delegated child to hit the depth cap
  reg2.register({
    ...executiveReadinessAgent,
    name: "depth_telemetry_parent_agent",
    allowedDelegations: ["depth_reject_probe_agent"],
    handler: async ({ delegateAgent }) => {
      const child = await delegateAgent("depth_reject_probe_agent", {});
      return { childOk: child.ok, toolsRequested: [], toolsSucceeded: [] };
    },
  });
  await orchestrateCore({
    agentName: "depth_telemetry_parent_agent",
    input: {},
    context: makeContext(RUNTIME_PROFILE_RICH),
    registry: reg2,
    toolInvoker: makeGateway(RUNTIME_PROFILE_RICH).invoker,
    onResult: (res, cat) => events2.push({ res, cat }),
  });
  const rejectionEvt = events2.find((e) => e.cat === ORCHESTRATION_ERROR_CODES.DELEGATION_DEPTH_EXCEEDED);
  assert(!!rejectionEvt, "L17: rejection telemetry emitted with DELEGATION_DEPTH_EXCEEDED");
  assertEqual(rejectionEvt.res.delegation.depth, 2, "L18: rejection records the attempted depth");
  assertEqual(rejectionEvt.res.delegation.parentAgentName, "depth_reject_probe_agent", "L19: rejection records the attempting parent");

  // No sensitive payloads or PII in any telemetry record
  const serialized = JSON.stringify([...events, ...events2]);
  assert(!serialized.includes("alice@execleadai.co"), "L20: no PII in telemetry");
  assert(!serialized.includes("prompt"), "L21: no prompts in telemetry");
}

// ============================================================
// TEST M — No mutation
// ============================================================
{
  console.log("TEST M — no mutation");
  const reg = makeRegistry();
  const gw = makeGateway(RUNTIME_PROFILE_RICH);
  await orchestrateCore({
    agentName: "executive_evidence_agent",
    input: {},
    context: makeContext(RUNTIME_PROFILE_RICH),
    registry: reg,
    toolInvoker: gw.invoker,
  });
  const MUTATION_TOOL_NAMES = ["create", "update", "delete", "bulkCreate", "bulkUpdate", "updateMany", "deleteMany", "manageTenantData", "manageReputation", "manageJourney"];
  assert(
    gw.calls.every((c) => !MUTATION_TOOL_NAMES.includes(c.toolName) && executiveEvidenceAgent.allowedTools.includes(c.toolName)),
    "M1: only read-only whitelisted tools invoked — no mutation capability exists"
  );
  assert(
    gw.calls.every((c) => Object.keys(c.toolInput || {}).length === 0),
    "M2: read-only retrievals carry no write payloads"
  );
  assert(
    executiveEvidenceAgent.allowedTools.every((t) => t.startsWith("get")),
    "M3: the evidence agent's tool whitelist contains only retrieval tools"
  );
  // The delegated child is equally read-only
  const gw2 = makeGateway(RUNTIME_PROFILE_RICH);
  await orchestrateCore({
    agentName: "executive_readiness_agent",
    input: {},
    context: makeContext(RUNTIME_PROFILE_RICH),
    registry: makeRegistry(),
    toolInvoker: gw2.invoker,
  });
  assert(
    gw2.calls.every((c) => ["getExecutiveProfile", "getExecutiveReadiness", "getExecutiveJourney"].includes(c.toolName)),
    "M4: the full delegated workflow performs only read-only retrievals"
  );
}

// ============================================================
// TEST N — Regression (Phase 1 + 2A + 2B behavior intact)
// ============================================================
{
  console.log("TEST N — regression");
  // N1: router unchanged — evidence agent is NOT directly routable from EXEC™
  assertEqual(matchOrchestrationIntent(EXACT_QUESTION), "executive_readiness_agent", "N1: exact question still routes to the readiness agent");
  assertEqual(matchOrchestrationIntent("analyze my evidence"), null, "N2: evidence-only question does NOT orchestrate directly");
  assertEqual(
    matchOrchestrationIntent("What is my current executive readiness and where am I in my leadership journey?"),
    "executive_context_agent",
    "N3: combined context request still routes to executive_context_agent"
  );
  assertEqual(matchOrchestrationIntent("What's my readiness right now?"), null, "N4: factual request does NOT orchestrate");
  assertEqual(matchToolIntent("what's my readiness right now"), "getExecutiveReadiness", "N5: Phase 1 direct router unchanged");

  // N6: Phase 2A context agent still executes and formats unchanged
  const reg = makeRegistry();
  const ctxResult = await orchestrateCore({
    agentName: "executive_context_agent",
    input: {},
    context: makeContext(RUNTIME_PROFILE_RICH),
    registry: reg,
    toolInvoker: makeGateway(RUNTIME_PROFILE_RICH).invoker,
  });
  const ctxAnswer = formatAgentResponse(ctxResult.data, { agent: ctxResult.agent, agentVersion: ctxResult.agentVersion });
  assert(ctxAnswer.includes("Executive Readiness™") && ctxAnswer.includes("Executive Journey™"), "N6: Phase 2A agent output unchanged (no delegation side effects)");
  assert(ctxResult.data.toolsRequested.length === 3 && ctxResult.delegation.depth === 0, "N7: context agent runs exactly as before");

  // N8: Phase 1 formatter unchanged
  const direct = await invokeToolCore({
    toolName: "getExecutiveReadiness",
    input: {},
    context: { user: USER_A, runtimeProfile: RUNTIME_PROFILE_RICH, getRuntimeProfile: async () => RUNTIME_PROFILE_RICH },
    registry: toolRegistry,
  });
  const fmt = formatToolResponse("getExecutiveReadiness", direct.data);
  assert(fmt.includes("62%") && fmt.includes("Tool Gateway™"), "N8: Phase 1 formatter unchanged");

  // N9: registry independence — the tool layer is untouched by agent registration
  assertEqual(toolRegistry.size(), 3, "N9: tool registry still holds exactly the three Phase 1 tools");

  // N10: all three production agent contracts remain valid
  for (const agent of [executiveContextAgent, executiveReadinessAgent, executiveEvidenceAgent]) {
    assert(validateAgentDefinition(agent).valid === true, `N10: ${agent.name} contract valid`);
  }

  // N11: empty-profile delegated workflow stays honest (no invention anywhere)
  const rEmpty = await orchestrateCore({
    agentName: "executive_readiness_agent",
    input: {},
    context: makeContext(RUNTIME_PROFILE_EMPTY),
    registry: makeRegistry(),
    toolInvoker: makeGateway(RUNTIME_PROFILE_EMPTY).invoker,
  });
  assert(rEmpty.ok === true, "N11: empty-profile delegated workflow completes");
  assert(rEmpty.data.analysis.evidence_delegation.ok === true, "N12: delegation succeeds (empty data is valid data)");
  assert(rEmpty.data.analysis.evidence_analysis.verified_evidence.length === 0, "N13: no evidence invented for an empty profile");
  assert(rEmpty.data.analysis.current_readiness === null, "N14: no readiness score invented");
  const fmtEmpty = formatAgentResponse(rEmpty.data, { agent: rEmpty.agent, agentVersion: rEmpty.agentVersion });
  assert(fmtEmpty.includes("unavailable"), "N15: formatted output states unavailability honestly");
}

// ── Report ──
console.log(`\n${passed} passed, ${failed} failed (of ${passed + failed})`);
if (failed > 0) {
  console.error("\n✗ PHASE 3A CONTROLLED MULTI-AGENT COLLABORATION TESTS FAILED");
  throw new Error("PHASE 3A CONTROLLED MULTI-AGENT COLLABORATION TESTS FAILED");
}
console.log("✓ PHASE 3A CONTROLLED MULTI-AGENT COLLABORATION TESTS PASSED");
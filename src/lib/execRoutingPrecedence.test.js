// ============================================================
// EXECLEAD.AI — EXEC™ Routing Precedence Test Suite
// ============================================================
// Regression tests for the EXEC™ routing precedence defect: the broad
// commercial/private-beta pricing fallback (bare "plan" token) intercepted
// leadership-analysis requests ("...create a prioritized development plan
// based on those gaps") BEFORE the Agent Router could classify them.
//
// Fix under test (minimal, surgical):
//   1. Leadership-development-plan exemption evaluated BEFORE the broad
//      pricing fallback in BOTH classifyExecQuestion and
//      isInformationalPricingQuestion (extracted to pricingIntent.js).
//   2. One added READINESS_ANALYSIS_PATTERN for development-plan/action
//      requests grounded in readiness.
// The commercial/private-beta guard is NOT removed and genuine pricing
// detection is NOT weakened.
//
// Run: node src/lib/execRoutingPrecedence.test.js
//
// Covers the required routing matrix:
//   A — Multi-agent leadership workflow → executive_readiness_agent
//   B — Readiness analysis            → executive_readiness_agent
//   C — Simple readiness               → Phase 1 direct readiness tool
//   D — Pricing                        → existing commercial route
//   E — Beta                           → existing beta route (not intercepted)
//   F — Commercial                     → existing commercial route
//   G — Leadership development         → executive_readiness_agent
// Plus the full multi-agent workflow proof (route, parent, child, depth,
// Tool Gateway calls, final response, telemetry).
// ============================================================

import { classifyExecQuestion, EXEC_QUESTION_CATEGORIES } from "./execQuestionClassifier.js";
import { isInformationalPricingQuestion } from "./pricingIntent.js";
import { matchOrchestrationIntent, formatAgentResponse } from "./agentOrchestrator/agentRouter.js";
import { matchToolIntent } from "./toolGateway/execToolRouter.js";
import { orchestrateCore, ORCHESTRATION_ERROR_CODES } from "./agentOrchestrator/orchestratorCore.js";
import { createAgentRegistry } from "./agentOrchestrator/registry.js";
import executiveContextAgent from "./agentOrchestrator/agents/executiveContextAgent.js";
import executiveReadinessAgent from "./agentOrchestrator/agents/executiveReadinessAgent.js";
import executiveEvidenceAgent from "./agentOrchestrator/agents/executiveEvidenceAgent.js";
import { createToolRegistry } from "./toolGateway/registry.js";
import { invokeToolCore } from "./toolGateway/gatewayCore.js";
import getExecutiveProfileTool from "./toolGateway/tools/getExecutiveProfile.js";
import getExecutiveReadinessTool from "./toolGateway/tools/getExecutiveReadiness.js";
import getExecutiveJourneyTool from "./toolGateway/tools/getExecutiveJourney.js";

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

// ── Guard predicates, mirroring ExecConciergeContext.sendMessage order ──
function guard1_informationalPricing(content) {
  const category = classifyExecQuestion(content);
  return (
    category === EXEC_QUESTION_CATEGORIES.INFORMATIONAL_PRICING || isInformationalPricingQuestion(content)
  );
}
function guard2_strategicComparison(content) {
  return classifyExecQuestion(content) === EXEC_QUESTION_CATEGORIES.STRATEGIC_COMPARISON;
}

// ── Fixture: Executive Runtime Profile™ ──
const USER_A = { id: "user-a-001", full_name: "Alice Executive", email: "alice@execleadai.co" };
const RUNTIME_PROFILE = {
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

const toolRegistry = createToolRegistry();
[getExecutiveProfileTool, getExecutiveReadinessTool, getExecutiveJourneyTool].forEach((t) => toolRegistry.register(t));

function makeGateway(profile) {
  const calls = [];
  const invoker = async (toolName, toolInput, toolOptions) => {
    calls.push({ toolName, toolInput, toolOptions });
    return invokeToolCore({
      toolName,
      input: toolInput,
      context: { user: toolOptions.user, runtimeProfile: profile, getRuntimeProfile: async () => profile },
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

// ── The exact failing request ──
const CASE_A =
  "Assess my readiness, identify the evidence gaps affecting my readiness, then create a prioritized development plan based on those gaps.";
const CASE_B =
  "Why is my current executive readiness where it is, what evidence supports it, what are my biggest gaps, and what should I work on next?";
const CASE_C = "What is my current readiness score?";
const CASE_D = "What plans and pricing are available?";
const CASE_E = "When will EXECLEAD.AI public beta launch?";
const CASE_F = "How much does Executive cost?";
const CASE_G = "What leadership development actions should I take based on my readiness gaps?";

console.log("── EXEC™ Routing Precedence Test Suite ──\n");

// ============================================================
// TEST A — Multi-agent leadership workflow
// ============================================================
{
  console.log("TEST A — multi-agent leadership workflow");
  assertEqual(classifyExecQuestion(CASE_A), EXEC_QUESTION_CATEGORIES.CAREER_GUIDANCE, "A1: classified as leadership analysis (Career Guidance), NOT pricing");
  assert(guard1_informationalPricing(CASE_A) === false, "A2: guard 1 (informational pricing) does NOT match");
  assert(guard2_strategicComparison(CASE_A) === false, "A3: guard 2 (strategic comparison) does NOT match");
  assertEqual(matchOrchestrationIntent(CASE_A), "executive_readiness_agent", "A4: Agent Router selects executive_readiness_agent");
}

// ============================================================
// TEST B — Readiness analysis (previously working)
// ============================================================
{
  console.log("TEST B — readiness analysis");
  assert(guard1_informationalPricing(CASE_B) === false, "B1: pricing guard does not match");
  assertEqual(matchOrchestrationIntent(CASE_B), "executive_readiness_agent", "B2: routes to executive_readiness_agent");
}

// ============================================================
// TEST C — Simple readiness → Phase 1 direct Tool Gateway path
// ============================================================
{
  console.log("TEST C — simple readiness");
  assert(guard1_informationalPricing(CASE_C) === false, "C1: pricing guard does not match");
  assertEqual(matchOrchestrationIntent(CASE_C), null, "C2: does NOT orchestrate (no analysis signal)");
  assertEqual(matchToolIntent(CASE_C), "getExecutiveReadiness", "C3: Phase 1 direct readiness Tool Gateway path unchanged");
}

// ============================================================
// TEST D — Pricing → existing commercial route preserved
// ============================================================
{
  console.log("TEST D — pricing");
  assertEqual(classifyExecQuestion(CASE_D), EXEC_QUESTION_CATEGORIES.INFORMATIONAL_PRICING, "D1: classified as Informational Pricing (unchanged)");
  assert(isInformationalPricingQuestion(CASE_D) === true, "D2: informational pricing predicate still matches");
  assertEqual(matchOrchestrationIntent(CASE_D), null, "D3: never routed to an agent");
  assertEqual(matchToolIntent(CASE_D), null, "D4: never routed to a tool");
}

// ============================================================
// TEST E — Beta → existing beta/knowledge route preserved
// ============================================================
{
  console.log("TEST E — beta");
  assertEqual(classifyExecQuestion(CASE_E), EXEC_QUESTION_CATEGORIES.PREDICTION, "E1: classified as Prediction (NOT claimed by the pricing fallback)");
  assert(guard1_informationalPricing(CASE_E) === false, "E2: pricing guard does not match");
  assertEqual(matchOrchestrationIntent(CASE_E), null, "E3: never routed to an agent — beta/knowledge route untouched");
  assertEqual(matchToolIntent(CASE_E), null, "E4: never routed to a tool");
}

// ============================================================
// TEST F — Commercial → existing commercial route preserved
// ============================================================
{
  console.log("TEST F — commercial");
  assertEqual(classifyExecQuestion(CASE_F), EXEC_QUESTION_CATEGORIES.INFORMATIONAL_PRICING, "F1: classified as Informational Pricing (unchanged)");
  assert(isInformationalPricingQuestion(CASE_F) === true, "F2: informational pricing predicate still matches");
  assertEqual(matchOrchestrationIntent(CASE_F), null, "F3: never routed to an agent");
}

// ============================================================
// TEST G — Leadership development → executive_readiness_agent
// ============================================================
{
  console.log("TEST G — leadership development");
  assert(guard1_informationalPricing(CASE_G) === false, "G1: pricing guard does not match");
  assertEqual(matchOrchestrationIntent(CASE_G), "executive_readiness_agent", "G2: routes to executive_readiness_agent");
}

// ============================================================
// Commercial-detection boundary — the fix must NOT weaken real pricing
// ============================================================
{
  console.log("TEST H — commercial detection boundary (no weakening)");
  for (const q of [
    "What plans and pricing are available?",
    "How much does Executive cost?",
    "What is included in professional?",
    "Show me the membership pricing",
    "What are the enterprise pricing options?",
    "What plans do you offer?",
  ]) {
    assert(guard1_informationalPricing(q) === true, `H: genuine pricing still detected (${q})`);
    assertEqual(matchOrchestrationIntent(q), null, `H: pricing never routed to an agent (${q})`);
  }
  // Development/coaching/action plans are leadership artifacts, not pricing
  for (const q of [
    CASE_A,
    "Help me build a development plan for my career growth",
    "What coaching plan fits my leadership gaps?",
    "Create an action plan for my readiness",
  ]) {
    assert(isInformationalPricingQuestion(q) === false, `H: leadership plan phrases never claimed as pricing (${q})`);
  }
  // Purchase/upgrade/plan-recommendation intent still wins over everything
  assertEqual(classifyExecQuestion("Which plan should I choose?"), EXEC_QUESTION_CATEGORIES.PLAN_RECOMMENDATION, "H: plan recommendation still detected first");
  assertEqual(classifyExecQuestion("How can I upgrade my membership?"), EXEC_QUESTION_CATEGORIES.UPGRADE_INTENT, "H: upgrade intent still detected");
  assertEqual(classifyExecQuestion("I want to buy a professional membership"), EXEC_QUESTION_CATEGORIES.PURCHASE_INTENT, "H: purchase intent still detected");
  assert(
    isInformationalPricingQuestion("Which development plan should I buy?") === false,
    "H: commercial action pattern still overrides the exemption (should-i-buy)"
  );
}

// ============================================================
// FULL WORKFLOW PROOF (CASE A) — route, agents, depth, gateway, response, telemetry
// ============================================================
{
  console.log("TEST W — full multi-agent workflow proof (CASE A)");
  const reg = makeRegistry();
  const gw = makeGateway(RUNTIME_PROFILE);
  const events = [];

  const result = await orchestrateCore({
    agentName: matchOrchestrationIntent(CASE_A), // the selected route
    input: {},
    context: {
      user: USER_A,
      workspace: { id: "ws-1", name: "Executive" },
      runtimeProfile: RUNTIME_PROFILE,
      getRuntimeProfile: async () => RUNTIME_PROFILE,
    },
    registry: reg,
    toolInvoker: gw.invoker,
    onResult: (res, cat) => events.push({ res, cat }),
  });

  // route / agents / depth
  assertEqual(result.agent, "executive_readiness_agent", "W1: selected route → executive_readiness_agent");
  assert(result.ok === true, "W2: orchestration succeeded");
  assertEqual(result.delegation.depth, 0, "W3: parent delegation depth 0");
  assertEqual(result.data.analysis.evidence_delegation.agent, "executive_evidence_agent", "W4: child agent → executive_evidence_agent");
  assert(result.data.analysis.evidence_delegation.ok === true, "W5: delegation succeeded");
  assertEqual(result.data.analysis.evidence_delegation.delegationDepth, 1, "W6: delegation depth 1");

  // Tool Gateway calls
  assertEqual(gw.calls.length, 5, "W7: exactly 5 governed Tool Gateway calls (3 parent + 2 child)");
  assertEqual(
    gw.calls.filter((c) => c.toolOptions.delegatedBy === "executive_readiness_agent").length,
    2,
    "W8: the child's calls run through the Tool Gateway™, marked delegatedBy"
  );
  assert(gw.calls.every((c) => c.toolOptions.user.id === USER_A.id), "W9: authenticated identity preserved throughout");

  // final response
  const formatted = formatAgentResponse(result.data, { agent: result.agent, agentVersion: result.agentVersion });
  assert(formatted.includes("Executive Readiness™ Analysis"), "W10: final response is the readiness analysis");
  assert(formatted.includes("Evidence Intelligence"), "W11: final response includes the delegated evidence intelligence");
  assert(formatted.includes("62%"), "W12: authoritative readiness value preserved in the final response");
  assert(!formatted.includes("Private Beta"), "W13: the generic Private Beta pricing response is GONE");
  assert(!formatted.includes("General Availability"), "W14: the pricing catalog response is GONE");

  // telemetry
  assertEqual(events.length, 2, "W15: two telemetry events (parent + child)");
  const parentEvt = events.find((e) => e.res.agent === "executive_readiness_agent");
  const childEvt = events.find((e) => e.res.agent === "executive_evidence_agent");
  assert(!!parentEvt && parentEvt.res.ok === true && parentEvt.cat === null, "W16: parent — executive_readiness_agent · depth 0 · success");
  assertEqual(childEvt.res.delegation.depth, 1, "W17: child — depth 1");
  assertEqual(childEvt.res.delegation.parentAgentName, "executive_readiness_agent", "W18: child records parent agent");
  assertEqual(childEvt.res.delegation.parentRequestId, parentEvt.res.requestId, "W19: child linked to parent request id");
  assert(childEvt.res.ok === true && childEvt.cat === null, "W20: child — executive_evidence_agent · depth 1 · success");
  assertEqual(childEvt.res.error, undefined, "W21: child has no error");
}

// ── Report ──
console.log(`\n${passed} passed, ${failed} failed (of ${passed + failed})`);
if (failed > 0) {
  console.error("\n✗ EXEC™ ROUTING PRECEDENCE TESTS FAILED");
  throw new Error("EXEC ROUTING PRECEDENCE TESTS FAILED");
}
console.log("✓ EXEC™ ROUTING PRECEDENCE TESTS PASSED");
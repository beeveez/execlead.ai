// ============================================================
// Phase 7 — Prospect Intelligence™ deterministic test suite
// Run: deno test --allow-net --allow-read base44/shared/prospectIntelligence.test.ts
// All tests are local/deterministic — no network, no DB, no LLM,
// no production records touched.
// ============================================================
import {
  validateProspectInput,
  buildProspectIntelligence,
  assertToolNotExecutable,
  PROSPECT_TOOL_REGISTRY_DEF,
  PROSPECT_TOOL_ID,
} from "./prospectIntelligence.ts";

function assertEquals(actual, expected, label) {
  const a = JSON.stringify(actual), e = JSON.stringify(expected);
  if (a !== e) throw new Error(`${label}: expected ${e} but got ${a}`);
}
function assert(cond, label) {
  if (!cond) throw new Error(`FAILED: ${label}`);
}

const VALID = {
  company_name: "Meridian Systems",
  website: "meridiansystems.example.com",
  industry: "Enterprise Software",
  location: "Singapore",
  context: "Evaluating for executive advisory engagement",
};
const NOW = new Date("2026-09-15T04:00:00.000Z");

// A. Valid prospect input
Deno.test("valid full input produces a complete structured result", () => {
  const v = validateProspectInput(VALID);
  assert(v.ok, "A: validation should pass");
  const r = buildProspectIntelligence(v.input, NOW);
  assertEquals(r.capability, PROSPECT_TOOL_ID, "A: capability");
  assertEquals(r.generated_at, "2026-09-15T04:00:00.000Z", "A: generated_at");
  assertEquals(Object.keys(r.result).length, 9, "A: section count");
  for (const s of Object.values(r.result)) {
    assert(["OBSERVED", "INFERRED", "UNKNOWN"].includes(s.epistemic_label), "A: epistemic label");
  }
  assert(r.evidence.length >= 5, "A: evidence present");
  assert(typeof r.confidence.overall === "number", "A: confidence numeric");
  assertEquals(r.prospect.company_name, "Meridian Systems", "A: company echo");
});

// B. Missing company name
Deno.test("missing company_name is rejected", () => {
  const rest = { ...VALID };
  delete rest.company_name;
  const v = validateProspectInput(rest);
  assert(!v.ok, "B: should fail");
  assertEquals(v.error_code, "PROSPECT_COMPANY_NAME_REQUIRED", "B: error code");
});

// C. Malformed input / arbitrary selectors / generic data-access prevention
Deno.test("malformed inputs are rejected", () => {
  const cases = [
    null, "string", 42, [],
    { ...VALID, entity: "User" },
    { ...VALID, tool_id: "read_own_user_profile" },
    { ...VALID, operation: "DELETE" },
    { ...VALID, query: "{}.filter" },
    { ...VALID, company_name: "A" },
    { ...VALID, company_name: "https://evil.example.com" },
    { ...VALID, company_name: "Acme<script>" },
    { ...VALID, website: "https://evil.com/path?q=1" },
    { ...VALID, website: "evil.com:8080/x" },
    { ...VALID, industry: "x".repeat(101) },
    { ...VALID, context: "y".repeat(501) },
  ];
  for (const c of cases) {
    const v = validateProspectInput(c);
    assert(!v.ok, `C: case should be rejected: ${JSON.stringify(c).slice(0, 60)}`);
  }
});

// H. Input values are inert data — never selectors
Deno.test("input values are never used as selectors", () => {
  const v = validateProspectInput({ company_name: "ReadinessAssessment" });
  assert(v.ok, "H: inert string validates as data");
  const r = buildProspectIntelligence(v.input, NOW);
  assert(JSON.stringify(r).includes('"company_name":"ReadinessAssessment"'), "H: echoed as data");
  assert(r.evidence.every((e) => e.source === "caller_supplied" || e.source === "input_completeness" || e.source === "heuristic_industry_model"), "H: no fabricated sources");
});

// I. Evidence insufficiency
Deno.test("minimal input yields INSUFFICIENT_EVIDENCE and explicit UNKNOWN", () => {
  const v = validateProspectInput({ company_name: "Obscure Co" });
  assert(v.ok, "I: validates");
  const r = buildProspectIntelligence(v.input, NOW);
  const insufficientSections = Object.values(r.result)
    .filter((s) => s.status === "INSUFFICIENT_EVIDENCE" || s.status === "UNKNOWN");
  assert(insufficientSections.length >= 4, "I: multiple sections insufficient/unknown");
  assert(r.result.recommended_next_step.content[0].includes("INSUFFICIENT EVIDENCE"), "I: next step says insufficient");
  assert(r.result.risks_disqualifiers.content.some((c) => c.includes("unverified")), "I: unverified risk stated");
});

// J. Confidence behavior
Deno.test("confidence is completeness-derived, monotonic, and capped", () => {
  const min = buildProspectIntelligence(validateProspectInput({ company_name: "A Corp" }).input, NOW);
  const full = buildProspectIntelligence(validateProspectInput(VALID).input, NOW);
  assert(full.confidence.overall > min.confidence.overall, "J: full > minimal");
  assert(full.confidence.overall <= 60, "J: hard cap at 60 (no external verification)");
  assert(min.confidence.overall < 35, "J: minimal is below the insufficiency threshold");
  assert(full.confidence.basis.includes("no external verification performed"), "J: basis is truthful");
  assert(!JSON.stringify(full).includes('"overall":100'), "J: confidence never manufactured");
});

// S. Growth Agent tool definition is NOT executable
Deno.test("tool definition is DRAFT + disabled + growth_agent-only", () => {
  assertEquals(PROSPECT_TOOL_REGISTRY_DEF.status, "DRAFT", "S: DRAFT");
  assertEquals(PROSPECT_TOOL_REGISTRY_DEF.enabled, false, "S: disabled");
  assertEquals(PROSPECT_TOOL_REGISTRY_DEF.allowed_agent_ids, ["growth_agent"], "S: allow-list");
  assert(!PROSPECT_TOOL_REGISTRY_DEF.allowed_agent_ids.some((a) => a.includes("*")), "S: no wildcards");
  const gate = assertToolNotExecutable(PROSPECT_TOOL_REGISTRY_DEF);
  assertEquals(gate.executable, false, "S: not executable");
});

// N/O/P/Q/R — negative guarantees: no LLM, no network, no messaging, no CRM,
// no payments, no scheduling, no background work in the service definition.
Deno.test("engine contains no forbidden capability surface", async () => {
  const mod = await Deno.readTextFile("base44/shared/prospectIntelligence.ts");
  for (const banned of [
    "InvokeLLM", "fetch(", "XMLHttpRequest", "SendEmail", "sendEmail",
    "integrations.Core", "entities.", "connector", "stripe", "payment",
    "setInterval", "setTimeout", "Deno.cron", "cron", "bulkCreate",
  ]) {
    assert(!mod.includes(banned), `N-R: banned surface "${banned}" must not appear`);
  }
});

// 23/24/25 — evidence, confidence, and unknowns are never fabricated
Deno.test("no fabricated external verification is claimed", () => {
  const v = validateProspectInput(VALID);
  const r = buildProspectIntelligence(v.input, NOW);
  assert(r.verification_notice.includes("No external verification was performed"), "23: notice present");
  const labels = new Set(r.evidence.map((e) => e.epistemic_label));
  assert(labels.has("OBSERVED"), "23: observed present");
  for (const e of r.evidence) {
    assert(["OBSERVED", "INFERRED", "UNKNOWN"].includes(e.epistemic_label), "23: valid labels only");
  }
});
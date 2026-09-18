// ============================================================
// Regression tests — improvementUpdatePolicy (Critical #2)
// Run: deno test --allow-net base44/shared/improvementUpdatePolicy.test.ts
// Maps to mandated verification matrix O / P / Q plus deny-by-default
// mass-assignment cases for ownership, creator, audit/provenance fields.
// ============================================================
import { validateImprovementUpdate, IMPROVEMENT_UPDATE_ALLOWED_FIELDS } from "./improvementUpdatePolicy.ts";

function assertEquals(actual, expected, label) {
  const a = JSON.stringify(actual), e = JSON.stringify(expected);
  if (a !== e) throw new Error(`[${label}] Expected ${e} but got ${a}`);
}

// ── TEST O — allowlisted fields are accepted ──

Deno.test("O1: status accepted (dismissal flow)", () => {
  const r = validateImprovementUpdate({ action: "updateImprovement", improvement_id: "imp_1", status: "dismissed" });
  assertEquals(r.ok, true, "O1a");
  assertEquals(r.updates, { status: "dismissed" }, "O1b");
});

Deno.test("O2: full lifecycle advancement (status + dates) accepted", () => {
  const r = validateImprovementUpdate({
    improvement_id: "imp_2",
    status: "implemented",
    implemented_date: "2026-09-18T01:00:00.000Z",
    verified_date: "2026-09-18T02:00:00.000Z",
  });
  assertEquals(r.ok, true, "O2");
});

Deno.test("O3: allowlist contains exactly the legitimate fields", () => {
  assertEquals(IMPROVEMENT_UPDATE_ALLOWED_FIELDS, ["status", "implemented_date", "verified_date"], "O3");
});

// ── TEST P — unknown fields are denied by default ──

Deno.test("P1: unknown field rejects the entire request", () => {
  const r = validateImprovementUpdate({ improvement_id: "imp_1", status: "planned", evil_field: "x" });
  assertEquals(r.ok, false, "P1a");
  assertEquals(r.rejected_fields, ["evil_field"], "P1b");
});

Deno.test("P2: allowlisted update with one unknown field writes NOTHING", () => {
  const r = validateImprovementUpdate({ improvement_id: "imp_1", status: "planned", notes: "injected" });
  assertEquals(r.ok, false, "P2a");
  assertEquals(r.rejected_fields, ["notes"], "P2b");
});

Deno.test("P3: empty update payload (only envelope keys) is rejected", () => {
  const r = validateImprovementUpdate({ action: "updateImprovement", improvement_id: "imp_1" });
  assertEquals(r.ok, false, "P3");
});

// ── TEST Q — ownership / creator / audit / provenance / security fields are protected ──

Deno.test("Q1: mass-assignment of ownership/creator fields is denied", () => {
  const r = validateImprovementUpdate({
    improvement_id: "imp_1",
    status: "planned",
    user_id: "attacker",
    user_name: "attacker",
    created_by_id: "attacker",
  });
  assertEquals(r.ok, false, "Q1a");
  assertEquals(r.rejected_fields.includes("user_id"), true, "Q1b");
  assertEquals(r.rejected_fields.includes("created_by_id"), true, "Q1c");
});

Deno.test("Q2: mass-assignment of audit/provenance fields is denied", () => {
  const r = validateImprovementUpdate({
    improvement_id: "imp_1",
    status: "planned",
    source_report_id: "forged_report",
    source_report_period: "2026-W01",
    ai_recommendation: "forged",
    title: "forged",
    target_id: "forged",
  });
  assertEquals(r.ok, false, "Q2a");
  assertEquals(r.rejected_fields.includes("source_report_id"), true, "Q2b");
  assertEquals(r.rejected_fields.includes("title"), true, "Q2c");
});

Deno.test("Q3: internal protected fields (id/timestamps outside allowlist) are denied", () => {
  const r = validateImprovementUpdate({ improvement_id: "imp_1", id: "other_record", created_date: "2020-01-01" });
  assertEquals(r.ok, false, "Q3a");
  assertEquals(r.rejected_fields, ["id", "created_date"], "Q3b");
});

// ── Validation of allowlisted field VALUES ──

Deno.test("V1: invalid status enum value is rejected", () => {
  const r = validateImprovementUpdate({ improvement_id: "imp_1", status: "hacked" });
  assertEquals(r.ok, false, "V1a");
  assertEquals(r.rejected_fields, ["status"], "V1b");
});

Deno.test("V2: non-string date fields are rejected", () => {
  const r = validateImprovementUpdate({ improvement_id: "imp_1", implemented_date: 12345 });
  assertEquals(r.ok, false, "V2");
});

// ── Request-shape validation ──

Deno.test("R1: missing improvement_id is rejected", () => {
  const r = validateImprovementUpdate({ status: "planned" });
  assertEquals(r.ok, false, "R1a");
  assertEquals(r.error, "improvement_id required", "R1b");
});

Deno.test("R2: non-object / array bodies are rejected", () => {
  assertEquals(validateImprovementUpdate(null).ok, false, "R2a");
  assertEquals(validateImprovementUpdate("[]").ok, false, "R2b");
  assertEquals(validateImprovementUpdate([{ improvement_id: "x" }]).ok, false, "R2c");
});
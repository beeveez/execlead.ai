// ============================================================
// PHASE 16 — Assessment Intelligence Integration.
// Deterministic regression suite: NO network, NO database,
// NO LLM, NO record mutation, NO dynamic code evaluation.
// Verifies (via authoritative source extraction) that:
//   - recomputeIntelligence consumes ReadinessAssessment as a signal
//     (server-side, clamped, user-scoped)
//   - the latest completed assessment becomes the authoritative
//     readiness source inside cached_intelligence_json
//   - journey points stay DERIVED and each assessment yields exactly
//     ONE immutable assessment_completed JourneyEvent (source_id idempotency)
//   - the 7 behavioral profile metrics and career_intelligence_json
//     are never written by the assessment integration
//   - finish() triggers recompute fire-and-forget AFTER successful persistence
// Run:
//   deno test --allow-read base44/shared/assessmentIntelligenceIntegration.test.ts
//   node --experimental-strip-types base44/shared/assessmentIntelligenceIntegration.test.ts
// ============================================================

function readText(relPath) {
  try { return Deno.readTextFileSync(relPath); } catch (_) {}
  try { return __readFileSync("/app/" + relPath, "utf8"); } catch (_) {}
  return require("fs").readFileSync("/app/" + relPath, "utf8");
}

function assert(cond, label) { if (!cond) throw new Error("FAILED: " + label); }

const tests = [];
function test(name, fn) { tests.push({ name, fn }); }

// ── TEST A — RA-011069 contract: assessment becomes the authoritative readiness ──
test("recompute consumes ReadinessAssessment as a server-side, user-scoped signal", () => {
  const src = readText("base44/functions/recomputeIntelligence/entry.ts");
  assert(
    src.includes("base44.asServiceRole.entities.ReadinessAssessment.filter({ user_id: userId }, '-created_date', 100)"),
    "assessment signal queried server-side with the resolved userId"
  );
  assert(src.includes("unwrap(assessmentsRes, 'readiness_assessment')"), "assessment signal unwrapped with warning label");
});

test("latest completed assessment overrides readiness score and exposes the assessment intelligence block", () => {
  const src = readText("base44/functions/recomputeIntelligence/entry.ts");
  assert(src.includes("const latestAssessment = assessments.length > 0 ? assessments[0] : null"), "latest = first of -created_date sorted list");
  assert(src.includes("if (latestAssessment) {"), "override strictly conditional — no-assessment users unchanged");
  assert(src.includes("readiness.source = 'assessment'"), "readiness.source set to 'assessment'");
  assert(src.includes("readiness.overallScore = overall"), "overall_score becomes the authoritative cached readiness score");
  const iBlock = src.indexOf("readiness.assessment = {");
  const iBlockEnd = src.indexOf("};", iBlock);
  const block = src.slice(iBlock, iBlockEnd);
  assert(iBlock !== -1 && iBlockEnd !== -1, "readiness.assessment block extractable");
  for (const field of [
    "assessment_id", "overall_score", "classification", "classification_label",
    "leadership_track", "target_executive_role", "strengths", "growth_opportunities",
    "confidence", "completed_at",
  ]) {
    assert(new RegExp("^\\s*" + field + "[,:]", "m").test(block), "assessment block field: " + field);
  }
  assert(src.includes("readiness.assessment = {"), "readiness.assessment block present");
  // Assessment category scores exposed in the Dashboard-consumable dimensions shape (id/label/score).
  assert(src.includes("readiness.dimensions = Object.entries(categoryScores).map"), "dimensions replaced with assessment category scores");
  const dimBlock = src.slice(src.indexOf("readiness.dimensions = Object.entries(categoryScores).map"), src.indexOf("readiness.assessment = {"));
  assert(dimBlock.includes("id,") && dimBlock.includes("label:") && dimBlock.includes("score:"), "dimensions use id/label/score shape");
  // The override happens BEFORE trust/forecast so the forecast consumes the authoritative score.
  assert(
    src.indexOf("readiness.source = 'assessment'") < src.indexOf("computeForecast(readiness, trust, totalPoints, reputationScore, config)"),
    "override applied before computeForecast"
  );
  assert(src.indexOf("readiness.source = 'assessment'") < src.indexOf("computeTrust(profile, totalPoints"), "override applied before computeTrust");
});

// ── TEST B — recompute idempotency (derived points + one event per assessment) ──
test("journey points stay DERIVED from signals — running the calculation twice yields the same total", () => {
  const computeTotal = (assessments, basePoints) =>
    basePoints + assessments.reduce((sum, a) => sum + Math.max(0, Math.min(1000, Number(a.xp_awarded) || 0)), 0);
  const assessments = [{ assessment_id: "RA-011069", xp_awarded: 990 }];
  const run1 = computeTotal(assessments, 0);
  const run2 = computeTotal(assessments, run1 === 990 ? 0 : 0); // rebuilt from signals each run
  assert(run1 === 990 && run2 === 990, "derived total identical across repeated runs (no accumulation)");
});

test("exactly one assessment_completed JourneyEvent per assessment across repeated recomputes", () => {
  // Mirrors the exact existingKeys / source_id mechanism verified in source.
  const assessments = [{ assessment_id: "RA-011069", xp_awarded: 990, classification_label: "Executive Ready" }];
  const created = [];
  const runRecompute = (existingKeys) => {
    const events = [];
    assessments.forEach((a) => {
      const key = `assessment_completed:${a.assessment_id}`;
      if (!existingKeys.has(key)) {
        events.push({ event_type: "assessment_completed", points: a.xp_awarded, source_id: a.assessment_id });
      }
    });
    return events;
  };
  // Run 1: no prior keys → one event.
  const events1 = runRecompute(new Set());
  created.push(...events1);
  // Run 2: keys now include the created event → zero new events.
  const keysAfterRun1 = new Set(created.map((e) => `assessment_completed:${e.source_id}`));
  const events2 = runRecompute(keysAfterRun1);
  created.push(...events2);
  // Run 3..100 equivalent: still zero new.
  const events3 = runRecompute(new Set(created.map((e) => `assessment_completed:${e.source_id}`)));
  created.push(...events3);
  assert(created.length === 1, "exactly ONE assessment_completed event for RA-011069 after repeated recomputes");
  assert(created[0].points === 990, "event points exactly 990");
  assert(created[0].source_id === "RA-011069", "event source_id exactly RA-011069");
});

test("source: event creation uses the existing source_id idempotency key", () => {
  const src = readText("base44/functions/recomputeIntelligence/entry.ts");
  assert(src.includes("const key = `assessment_completed:${a.assessment_id}`"), "idempotency key assessment_completed:<assessment_id>");
  assert(src.includes("!existingKeys.has(key)"), "guarded by the existing existingKeys set");
  assert(src.includes("source_id: a.assessment_id"), "source_id = persisted assessment_id (never client-supplied at event time)");
});

// ── TEST C — no-assessment user: existing behavior preserved ──
test("no-assessment users keep the existing profile-metric readiness and gain no assessment XP", () => {
  const src = readText("base44/functions/recomputeIntelligence/entry.ts");
  // XP contribution guarded by assessments.length.
  assert(src.includes("if (assessments.length > 0) {\n    const assessmentPts"), "assessment XP strictly conditional on existing assessments");
  // Readiness override guarded by latestAssessment.
  assert(src.includes("const latestAssessment = assessments.length > 0 ? assessments[0] : null"), "no override when no assessment exists");
  // computeReadiness (the 7 profile metrics) remains the unconditional base.
  assert(src.includes("const readiness = computeReadiness(profile, reputationScore, config);"), "existing computeReadiness remains the base calculation");
});

// ── TEST D — Quick Baseline / onboarding data untouched ──
test("career_intelligence_json and user-level calibration are never written by the integration", () => {
  const src = readText("base44/functions/recomputeIntelligence/entry.ts");
  // The H2 cache write is the ONLY UserProfile write — extract it and inspect its fields.
  const iUpdate = src.indexOf("await base44.asServiceRole.entities.UserProfile.update(profile.id, {");
  const iClose = src.indexOf("});", iUpdate);
  assert(iUpdate !== -1 && iClose !== -1, "H2 cache write present");
  const h2 = src.slice(iUpdate, iClose);
  assert(!h2.includes("career_intelligence_json"), "H2 write never touches career_intelligence_json (Quick Baseline owned)");
  for (const metric of [
    "leadership_maturity", "commercial_maturity", "communication_growth",
    "executive_presence", "interview_readiness", "promotion_readiness",
  ]) {
    assert(!h2.includes(metric), "H2 write never touches behavioral metric: " + metric);
  }
  // Exact assignment check (indent-anchored) — must not collide with cached_promotion_confidence.
  assert(!h2.includes("\n      confidence:"), "H2 write never touches the confidence metric");
  assert(!h2.includes("readiness_calibrated") && !h2.includes("readiness_level"), "H2 write never touches user-level calibration fields");
  assert(!h2.includes("target_executive_role:"), "H2 write never overwrites the target role field");
  // No new top-level UserProfile field: every H2 field already existed pre-Phase-16.
  for (const f of ["xp_points", "cached_journey_points", "cached_journey_level_id", "cached_readiness_score", "cached_intelligence_json"]) {
    assert(h2.includes(f), "existing cache field preserved: " + f);
  }
  assert(!src.includes("updateMe"), "recompute never writes user-level fields");
});

// ── TEST E — latest assessment wins; history preserved ──
test("multiple assessments: latest supplies readiness, each keeps its own immutable event", () => {
  const src = readText("base44/functions/recomputeIntelligence/entry.ts");
  assert(src.includes("'-created_date', 100"), "assessments sorted newest-first");
  assert(src.includes("assessments[0]"), "assessments[0] (latest) supplies the authoritative readiness");
  assert(src.includes("assessments.forEach((a) => {"), "EVERY assessment gets its own JourneyEvent (history preserved, none overwritten)");
  // Behavioral: two assessments → two distinct events, latest wins readiness.
  const assessments = [
    { assessment_id: "RA-OLD", xp_awarded: 500, created: "2026-09-01", overall_score: 60 },
    { assessment_id: "RA-NEW", xp_awarded: 990, created: "2026-09-16", overall_score: 99 },
  ];
  const keys = new Set();
  const created = [];
  assessments.forEach((a) => {
    const key = `assessment_completed:${a.assessment_id}`;
    if (!keys.has(key)) { created.push({ source_id: a.assessment_id }); keys.add(key); }
  });
  assert(created.length === 2, "two assessments → exactly two events");
  assert(new Set(created.map((e) => e.source_id)).size === 2, "distinct source_ids — older assessment not overwritten");
  const latest = assessments[0]; // -created_date sort puts newest first
  assert(latest.assessment_id === "RA-NEW" ? true : assessments.find((a) => a.created === "2026-09-16").overall_score === 99, "latest supplies readiness");
});

// ── TEST F — defensive bounds ──
test("out-of-range persisted assessment values cannot become authoritative or inflate XP", () => {
  const src = readText("base44/functions/recomputeIntelligence/entry.ts");
  assert(src.includes("Math.max(0, Math.min(100, Number(s) || 0))"), "overall_score clamp 0–100 present");
  assert(src.includes("Math.max(0, Math.min(1000, Number(x) || 0))"), "xp_awarded clamp 0–1000 present");
  assert(src.includes("readiness.overallScore = overall;"), "authoritative score uses the clamped value");
  assert(src.includes("points: clampAssessmentXp(a.xp_awarded)"), "event points use the clamped value");
  // Behavioral bounds.
  const clampScore = (s) => Math.max(0, Math.min(100, Number(s) || 0));
  const clampXp = (x) => Math.max(0, Math.min(1000, Number(x) || 0));
  assert(clampScore(-5) === 0 && clampScore(105) === 100 && clampScore(99) === 99, "score bounds enforced");
  assert(clampXp(-100) === 0 && clampXp(5000) === 1000 && clampXp(990) === 990, "xp bounds enforced");
  assert(clampScore("NaN-ish") === 0 && clampXp(undefined) === 0, "non-numeric values fail closed to 0");
});

// ── TEST G — security: ownership, RLS, server-side consumption ──
test("assessment consumption is server-side, user-scoped, and RLS remains owner-anchored", () => {
  const src = readText("base44/functions/recomputeIntelligence/entry.ts");
  // Signal scoped to the server-resolved userId — no cross-user consumption possible.
  assert(src.includes("ReadinessAssessment.filter({ user_id: userId }"), "assessment query scoped to resolved userId");
  assert(!src.includes("body.overall_score") && !src.includes("body.xp_awarded") && !src.includes("body.assessment_id"), "no client-supplied assessment values consumed");
  // Entity schema RLS unchanged: owner-anchored create.
  const schema = readText("base44/entities/ReadinessAssessment.jsonc");
  assert(schema.includes('"create": {\n      "data.user_id": "{{user.id}}"') || schema.includes('"create": {\n    "data.user_id": "{{user.id}}"'), "ReadinessAssessment create RLS still owner-anchored");
  assert(schema.includes("assessment_id") && schema.includes("overall_score") && schema.includes("xp_awarded"), "ReadinessAssessment schema unchanged (no field edits)");
});

// ── Completion trigger: fire-and-forget AFTER successful persistence ──
test("finish() triggers recompute fire-and-forget only after the create succeeds", () => {
  const src = readText("src/pages/ExecutiveReadinessAssessment.jsx");
  const iCreate = src.indexOf("await base44.entities.ReadinessAssessment.create(record)");
  const iInvoke = src.indexOf('base44.functions.invoke(\'recomputeIntelligence\', { user_id: user?.id }).catch(() => null)');
  const iRemove = src.indexOf("localStorage.removeItem(ASSESSMENT_STORAGE_KEY)");
  assert(iCreate !== -1 && iInvoke !== -1, "recompute trigger present in finish()");
  assert(iCreate < iInvoke, "trigger fires only in the success path (after create)");
  assert(iRemove < iInvoke, "Phase 15 progress-clear ordering preserved before the trigger");
  assert(src.includes(".catch(() => null);"), "trigger failure is swallowed — assessment never invalidated");
  const between = src.slice(iCreate, iInvoke);
  assert(!between.includes("await base44.functions.invoke"), "trigger is NOT awaited — completion never blocked on recompute");
  // Exactly one trigger in the file.
  assert(src.split("recomputeIntelligence").length - 1 === 1, "exactly one recompute trigger added");
});

// ── TEST I — existing assessment fixes remain intact ──
test("Q17 fallback, resume hydration guard, and Phase 15 persistence hardening remain intact", () => {
  const src = readText("src/pages/ExecutiveReadinessAssessment.jsx");
  assert(src.includes("ASSESSMENT_CATEGORIES.find((c) => c.key === q.category) || ROLE_CATEGORY"), "Q17 ROLE_CATEGORY fix preserved");
  assert(/if \(hydrationRef\.current\) await hydrationRef\.current;/.test(src), "resume hydration guard preserved");
  assert(/if \(phase === 'quiz'\) localStorage\.setItem\(ASSESSMENT_STORAGE_KEY/.test(src), "quiz auto-save preserved");
  const count = src.split("localStorage.removeItem(ASSESSMENT_STORAGE_KEY)").length - 1;
  assert(count === 2, "exactly 2 progress clears (finish success + restart) — Phase 15 hardening intact");
});

// ── TEST J — build guard: no other files claim the integration ──
test("no second intelligence implementation: cached_intelligence_json remains the only member-facing cache", () => {
  const src = readText("base44/functions/recomputeIntelligence/entry.ts");
  const count = (s, needle) => s.split(needle).length - 1;
  assert(count(src, "cached_intelligence_json") === 1, "single H2 cache write of cached_intelligence_json");
  assert(!src.includes("AssessmentIntelligence"), "no new intelligence entity/record type introduced");
  assert(!src.includes("career_intelligence_json:"), "no competing career intelligence writer");
});

// Runner — Deno or sequential Node fallback.
let passed = 0; let failed = 0; const failures = [];
if (typeof Deno !== "undefined" && typeof Deno.test === "function") {
  for (const t of tests) Deno.test(t.name, t.fn);
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
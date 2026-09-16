// ============================================================
// PHASE 15 — Assessment Completion Persistence hardening.
// Deterministic regression suite: NO network, NO database,
// NO LLM, NO record mutation, NO dynamic code evaluation.
// Verifies (via authoritative source extraction from
// src/pages/ExecutiveReadinessAssessment.jsx) that finish()
// removes execlead:assessment:progress ONLY AFTER the
// ReadinessAssessment create succeeds, and that a failed
// create preserves progress, answers, and retryability.
// Run:
//   deno test --allow-read base44/shared/assessmentCompletionPersistence.test.ts
// ============================================================

function readText(relPath) {
  try { return Deno.readTextFileSync(relPath); } catch (_) {}
  try { return __readFileSync("/app/" + relPath, "utf8"); } catch (_) {}
  return require("fs").readFileSync("/app/" + relPath, "utf8");
}

function assert(cond, label) { if (!cond) throw new Error("FAILED: " + label); }

/** Extracts the exact finish() implementation text — never re-implemented logic. */
function extractFinishBody(src) {
  const start = src.indexOf("const finish = useCallback(async () => {");
  assert(start !== -1, "finish() present in ExecutiveReadinessAssessment.jsx");
  const end = src.indexOf("}, [answers, assignedOnboarding", start);
  assert(end !== -1, "finish() dependency array found");
  return src.slice(start, end);
}

/** Extracts the PERSISTENCE catch block — anchored after the create call so the
 * earlier analytics try/catch (which legitimately spans other code) is excluded. */
function extractCatchBody(body) {
  const iCreate = body.indexOf("await base44.entities.ReadinessAssessment.create(record)");
  assert(iCreate !== -1, "create call present before locating the persistence catch");
  const iCatch = body.indexOf("} catch (e) {", iCreate);
  assert(iCatch !== -1, "finish() persistence catch block present");
  const iFinally = body.indexOf("} finally", iCatch);
  assert(iFinally !== -1, "finish() finally present");
  return body.slice(iCatch, iFinally);
}

const tests = [];
function test(name, fn) { tests.push({ name, fn }); }

test("finish() clears local progress only AFTER a successful database create", () => {
  const src = readText("src/pages/ExecutiveReadinessAssessment.jsx");
  const body = extractFinishBody(src);
  const iCreate = body.indexOf("await base44.entities.ReadinessAssessment.create(record)");
  const iRemove = body.indexOf("localStorage.removeItem(ASSESSMENT_STORAGE_KEY)");
  const iSaved = body.indexOf("setSavedAssessment(created)");
  assert(iCreate !== -1, "create call present");
  assert(iRemove !== -1, "progress clear present");
  assert(iCreate < iRemove, "create executes before progress clear");
  assert(iRemove < iSaved, "progress clears before completion is marked");
});

test("no progress clear occurs before the persistence attempt", () => {
  const src = readText("src/pages/ExecutiveReadinessAssessment.jsx");
  const body = extractFinishBody(src);
  const iPersist = body.indexOf("setPersisting(true)");
  const iCreate = body.indexOf("await base44.entities.ReadinessAssessment.create(record)");
  assert(iPersist !== -1 && iCreate !== -1 && iPersist < iCreate, "persisting state set before create");
  const preWrite = body.slice(0, iCreate);
  assert(preWrite.indexOf("removeItem") === -1, "NO removeItem anywhere before the create call");
  assert(preWrite.indexOf("setAnswers({})") === -1, "answers are never reset before the create call");
});

test("failure path preserves progress and answers — no false completion state", () => {
  const src = readText("src/pages/ExecutiveReadinessAssessment.jsx");
  const body = extractFinishBody(src);
  const catchBody = extractCatchBody(body);
  assert(catchBody.indexOf("removeItem") === -1, "catch never clears localStorage");
  assert(catchBody.indexOf("setAnswers({})") === -1, "catch never clears answers");
  assert(catchBody.indexOf("first-insight") === -1, "catch never enters the completion experience");
  assert(catchBody.indexOf("setSavedAssessment") === -1, "catch never marks the assessment saved");
  assert(catchBody.indexOf("variant: 'destructive'") !== -1, "error surfaced to the user");
  assert(catchBody.indexOf("try again") !== -1, "retry guidance surfaced");
  // Completion experience is entered only on the success side of the create.
  const iCreate = body.indexOf("await base44.entities.ReadinessAssessment.create(record)");
  const iInsight = body.indexOf("setPhase('first-insight')");
  assert(iInsight !== -1 && iInsight > iCreate, "first-insight renders only after create succeeds");
});

test("exactly two intentional progress clears: finish() success path + explicit restart()", () => {
  const src = readText("src/pages/ExecutiveReadinessAssessment.jsx");
  const count = src.split("localStorage.removeItem(ASSESSMENT_STORAGE_KEY)").length - 1;
  assert(count === 2, "exactly 2 clears (finish success + restart), found " + count);
  const body = extractFinishBody(src);
  assert(body.indexOf("localStorage.removeItem(ASSESSMENT_STORAGE_KEY)") !== -1, "one clear is in finish()");
  const iRestart = src.indexOf("const restart = () => {");
  const restartBody = src.slice(iRestart, src.indexOf("};", iRestart));
  assert(restartBody.indexOf("localStorage.removeItem(ASSESSMENT_STORAGE_KEY)") !== -1, "other clear is the explicit user restart");
});

test("behavioral contract: failed write retains progress; retry creates exactly one record", () => {
  // Mirrors the exact finish() ordering verified from source above.
  const store = new Map([["execlead:assessment:progress", JSON.stringify({ answers: { q1: 1, q17: 2 }, idx: 19 })]]);
  const storage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    removeItem: (k) => store.delete(k),
  };
  const created = [];
  let failWrite = true;
  const createRecord = () => {
    if (failWrite) throw new Error("simulated write failure");
    const rec = { id: "rec-1" };
    created.push(rec);
    return rec;
  };
  const runFinish = () => {
    let savedAssessment = null;
    let persisted = false;
    try {
      const rec = createRecord();
      storage.removeItem("execlead:assessment:progress"); // ONLY after success
      savedAssessment = rec;
      persisted = true;
    } catch (e) { /* answers + progress preserved; no false completion */ }
    return { savedAssessment, persisted };
  };
  // Attempt 1 — write fails.
  const r1 = runFinish();
  assert(r1.savedAssessment === null && r1.persisted === false, "no false completion on failure");
  assert(storage.getItem("execlead:assessment:progress") !== null, "progress retained after failed write");
  assert(created.length === 0, "failed attempt creates no record");
  // Retry — write succeeds.
  failWrite = false;
  const r2 = runFinish();
  assert(r2.savedAssessment !== null && r2.persisted === true, "retry persists");
  assert(storage.getItem("execlead:assessment:progress") === null, "progress cleared only after success");
  assert(created.length === 1, "exactly one record — no duplicates on retry");
});

test("persistence payload and schema are unchanged", () => {
  const src = readText("src/pages/ExecutiveReadinessAssessment.jsx");
  const body = extractFinishBody(src);
  for (const field of [
    "assessment_id", "user_id", "overall_score", "classification", "classification_label",
    "category_scores_json", "strengths_json", "growth_opportunities_json", "confidence",
    "promotion_forecast_json", "roadmap_json", "xp_awarded", "badges_json",
    "leadership_track", "target_executive_role", "answers_json", "completed_at",
  ]) {
    assert(body.indexOf(field + ":") !== -1, "payload field preserved: " + field);
  }
  assert(body.indexOf("computeFullResults(answers, track)") !== -1, "scoring unchanged");
  assert(body.indexOf("answers_json: JSON.stringify(answers)") !== -1, "answers still persisted in the record");
});

test("regression guards: Q17 fix, resume fix, and auto-save remain intact", () => {
  const src = readText("src/pages/ExecutiveReadinessAssessment.jsx");
  // Q17 ROLE_CATEGORY fallback.
  assert(src.indexOf("ASSESSMENT_CATEGORIES.find((c) => c.key === q.category) || ROLE_CATEGORY") !== -1, "Q17 ROLE_CATEGORY fix preserved");
  // Phase 15 resume race guard.
  assert(/if \(hydrationRef\.current\) await hydrationRef\.current;/.test(src), "resume hydration guard preserved");
  const iBegin = src.indexOf("const beginAssessment = async () => {");
  const beginBody = src.slice(iBegin, src.indexOf("};", iBegin));
  assert(beginBody.indexOf("removeItem") === -1, "resume path never clears progress");
  assert(beginBody.indexOf("saved.answers") !== -1, "resume path restores saved answers");
  // Auto-save still writes progress during the quiz.
  assert(/if \(phase === 'quiz'\) localStorage\.setItem\(ASSESSMENT_STORAGE_KEY/.test(src), "quiz auto-save preserved");
});

// Runner — Deno or sequential Node fallback.
let passed = 0; let failed = 0; const failures = [];
if (typeof Deno !== "undefined" && typeof Deno.test === "function") {
  for (const t of tests) Deno.test(t.name, t.fn);
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
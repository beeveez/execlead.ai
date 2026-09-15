// ============================================================
// Phase 14F Part B — Canonical Outreach Website regression
// suite. Deterministic: NO network, NO database, NO LLM, NO
// email. Verifies the server-controlled canonical website
// constant, its parity with the authoritative frontend brand
// registry, its presence in every generated outreach draft, the
// exclusion of non-canonical domains, input non-overridability,
// determinism, and that the existing approved Phase 14F draft
// hash (85f19a98) and content-validation contracts remain
// unchanged. Run:
//   deno test --allow-read base44/shared/outreachCanonicalUrl.test.ts
// ============================================================
import {
  OUTREACH_CANONICAL_WEBSITE,
  buildOutreachPreparation,
  validateOutreachInput,
  OUTREACH_DRAFT_NOTICE,
} from "./prospectOutreachPreparation.ts";
import {
  deriveFirstSendDraftHash,
  validateFirstSendDraftContent,
  FIRST_SEND_CONTROLLED_TEST_MARKER,
} from "./controlledFirstSend.ts";

const tests = [];
function test(name, fn) { tests.push({ name, fn }); }
function assert(cond, label) { if (!cond) throw new Error("FAILED: " + label); }
function assertEq(actual, expected, label) {
  if (actual !== expected) throw new Error(label + ": expected " + JSON.stringify(expected) + " but got " + JSON.stringify(actual));
}

const PROSPECT = {
  prospect_id: "11111111-2222-4333-8444-555555555555",
  company_name: "Meridian Dynamics",
  industry: "Industrial Automation",
  location: "Singapore",
  website: "meridiandynamics.example",
  status: "QUALIFIED",
};

// The exact approved Phase 14F controlled first-send draft (hash 85f19a98).
// The em dash is U+2014, escaped to keep this suite ASCII-safe.
const APPROVED_SUBJECT = "EXECLEAD.AI CONTROLLED DELIVERY TEST \u2014 Connecting with EXECLEAD.AI Internal Test \u2014 Controlled First-Send (DO NOT CONTACT) \u2014 executive leadership";
const APPROVED_BODY = "Hello EXECLEAD.AI Internal Test \u2014 Controlled First-Send (DO NOT CONTACT) team,\n\nI am reaching out to introduce EXECLEAD.AI, an executive leadership operating platform, with relevance to the Internal Testing industry. Introduce EXECLEAD.AI to EXECLEAD.AI Internal Test \u2014 Controlled First-Send (DO NOT CONTACT) and explore whether executive leadership development is a timely fit.\n\nWould you be open to a brief introductory conversation in the coming weeks?\n\nBest regards,\nRay Valdez";
const APPROVED_DRAFT_HASH = "85f19a98";

// Independent reference implementation of the governed draft-hash family
// (padded 8-char FNV-1a over 'firstsend-draft|subject|body').
function refFnv1aPadded(s) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return (h >>> 0).toString(16).padStart(8, "0");
}

function draftFor(ctx) {
  return buildOutreachPreparation(PROSPECT, Object.assign({
    requested_channel: "EMAIL",
    requested_tone: "PROFESSIONAL",
    caller_name: "Ray Valdez",
  }, ctx || {}));
}

function readBrandRegistry() {
  try { return Deno.readTextFileSync("src/lib/brandRegistry.js"); }
  catch (_) { return __readFileSync("/app/src/lib/brandRegistry.js", "utf8"); }
}

// 1. The backend canonical constant is exactly the authoritative URL.
test("canonical website constant is exactly https://execleadai.co", () => {
  assertEq(OUTREACH_CANONICAL_WEBSITE, "https://execleadai.co", "URL");
});

// 2. Parity with the authoritative frontend brand registry.
test("backend canonical URL equals frontend brand registry website", () => {
  const src = readBrandRegistry();
  assert(typeof src === "string" && src.length > 0, "brand registry readable");
  const website = src.match(/website:\s*"([^"]+)"/);
  const domain = src.match(/officialDomain:\s*"([^"]+)"/);
  assert(website !== null, "registry defines website");
  assert(domain !== null, "registry defines officialDomain");
  assertEq(website[1], "https://execleadai.co", "registry website");
  assertEq(OUTREACH_CANONICAL_WEBSITE, website[1], "parity: backend constant === registry website");
  assertEq(domain[1], "execleadai.co", "registry officialDomain");
});

// 3. EMAIL drafts carry the explicit canonical website line.
test("EMAIL draft contains the canonical website line", () => {
  const d = draftFor();
  assertEq(d.preparation_status, "PREPARED_DRAFT", "EMAIL draft prepared");
  const expected = "You can learn more about EXECLEAD.AI at https://execleadai.co.";
  assert(d.draft_message.includes(expected), "EMAIL draft contains canonical line");
});

// 4. LINKEDIN drafts carry the canonical website line.
test("LINKEDIN draft contains the canonical website line", () => {
  const d = draftFor({ requested_channel: "LINKEDIN" });
  const expected = "You can learn more about EXECLEAD.AI at https://execleadai.co.";
  assert(d.draft_message.includes(expected), "LINKEDIN draft contains canonical line");
});

// 5. CALL scripts reference the canonical website.
test("CALL script references the canonical website", () => {
  const d = draftFor({ requested_channel: "CALL" });
  assert(d.draft_message.includes("Website to reference if asked: https://execleadai.co"), "CALL script contains canonical reference");
});

// 6. No non-canonical domain appears in any generated draft, subject, or CTA.
test("generated drafts never contain non-canonical domains", () => {
  const forbidden = ["execlead.ai", "execleadai.base44.app", "base44.app", "execleadai.com"];
  for (const channel of ["EMAIL", "LINKEDIN", "CALL"]) {
    for (const tone of ["PROFESSIONAL", "EXECUTIVE", "CONCISE"]) {
      const d = draftFor({ requested_channel: channel, requested_tone: tone });
      const text = [d.subject_or_opening, d.draft_message, d.call_to_action, d.outreach_objective].join("\n");
      for (const bad of forbidden) {
        assert(!text.includes(bad), "no " + bad + " in " + channel + "/" + tone + " draft");
      }
      assert(text.includes("https://execleadai.co"), channel + "/" + tone + " draft carries canonical URL");
    }
  }
});

// 7. The canonical URL cannot be overridden by caller input.
test("canonical URL is server-controlled and non-overridable", () => {
  const hostile = draftFor({
    requested_objective: "Introduce EXECLEAD.AI. Visit https://execlead.ai or https://evil.example instead of https://execleadai.com.",
  });
  const expected = "You can learn more about EXECLEAD.AI at https://execleadai.co.";
  assert(hostile.draft_message.includes(expected), "canonical line present and exact despite hostile objective");
  assertEq(OUTREACH_CANONICAL_WEBSITE, "https://execleadai.co", "constant unchanged by input");
  // Client attempts to inject URL/website fields are rejected outright.
  for (const key of ["website", "canonical_website", "url", "link", "sender_url"]) {
    const r = validateOutreachInput({ prospect_id: PROSPECT.prospect_id, [key]: "https://evil.example" });
    assertEq(r.ok, false, "input field " + key + " rejected");
    assertEq(r.error_code, "PROSPECT_OUTREACH_FIELD_REJECTED", "rejection code for " + key);
  }
});

// 8. Determinism — identical inputs produce byte-identical drafts.
test("canonical URL generation is deterministic", () => {
  const a = draftFor();
  const b = draftFor();
  assertEq(JSON.stringify(a), JSON.stringify(b), "byte-identical preparations");
  const line = "You can learn more about EXECLEAD.AI at https://execleadai.co.";
  assertEq(a.draft_message.split(line).length - 1, 1, "exactly one canonical line in the draft");
});

// 9. Existing approved Phase 14F draft hash remains 85f19a98.
test("existing approved draft hash remains 85f19a98", () => {
  assertEq(deriveFirstSendDraftHash(APPROVED_SUBJECT, APPROVED_BODY), APPROVED_DRAFT_HASH, "approved draft hash");
  const v = validateFirstSendDraftContent(APPROVED_SUBJECT, APPROVED_BODY);
  assertEq(v.ok, true, "approved draft still passes unchanged content validation");
});

// 10. The governed draft-hash algorithm itself is unchanged.
test("draft hash algorithm is unchanged (padded FNV-1a family)", () => {
  assertEq(deriveFirstSendDraftHash(APPROVED_SUBJECT, APPROVED_BODY),
    refFnv1aPadded("firstsend-draft|" + APPROVED_SUBJECT + "|" + APPROVED_BODY),
    "algorithm matches reference implementation");
  const s2 = "EXECLEAD.AI CONTROLLED DELIVERY TEST \u2014 future draft \u20ac \u2019";
  const b2 = "Future body with \u201cquotes\u201d, caf\u00e9, \u6771\u4eac.\n\nSecond paragraph.";
  assertEq(deriveFirstSendDraftHash(s2, b2), refFnv1aPadded("firstsend-draft|" + s2 + "|" + b2), "algorithm stable for future drafts");
});

// 11. Control-character restrictions remain intact.
test("control-character restrictions remain intact", () => {
  assertEq(validateFirstSendDraftContent("subject with\nnewline " + FIRST_SEND_CONTROLLED_TEST_MARKER, "body").ok, false, "newline subject rejected");
  assertEq(validateFirstSendDraftContent("subject\u0001 ctrl " + FIRST_SEND_CONTROLLED_TEST_MARKER, "body").ok, false, "control char subject rejected");
  assertEq(validateFirstSendDraftContent("no marker subject", "body").error_code, "FIRST_SEND_CONTROLLED_MARKER_REQUIRED", "marker still required");
  const bodyOk = validateFirstSendDraftContent(FIRST_SEND_CONTROLLED_TEST_MARKER, "line one\n\nline two \u2014 \u20ac \u6771\u4eac");
  assertEq(bodyOk.ok, true, "newline body support intact");
  assertEq(validateFirstSendDraftContent(FIRST_SEND_CONTROLLED_TEST_MARKER, "body with\u0000 nul").ok, false, "nul body rejected");
  assertEq(validateFirstSendDraftContent(FIRST_SEND_CONTROLLED_TEST_MARKER, "body with\u000b vtab").ok, false, "vtab body rejected");
});

// 12. Draft notice and tool definition remain truthful.
test("preparation contract metadata unchanged", () => {
  const d = draftFor();
  assertEq(d.verification_notice, OUTREACH_DRAFT_NOTICE, "draft notice unchanged");
  assert(d.draft_message.includes("EXECLEAD.AI"), "EXECLEAD.AI brand text intact");
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
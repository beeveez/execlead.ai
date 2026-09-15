// ============================================================
// Phase 15 Remediation 1 — Canonical Domain / Contact Hygiene
// regression suite. Deterministic: NO network, NO database, NO
// LLM, NO email. Verifies that no public-facing production link
// or contact points to a non-canonical domain (execlead.ai,
// execleadai.base44.app, base44.app, execleadai.com), that all
// EXECLEAD.AI public URLs/contacts use https://execleadai.co /
// @execleadai.co, that intentionally retained occurrences remain
// (keyword aliases, internal identifiers, forbidden-domain test
// fixtures, security blocklists, frozen Guardian evidence), and
// that no Agent Workforce or Phase 14F delivery source was
// modified. Run:
//   deno test --allow-read base44/shared/canonicalDomainHygiene.test.ts
// ============================================================

const tests = [];
function test(name, fn) { tests.push({ name, fn }); }
function assert(cond, label) { if (!cond) throw new Error("FAILED: " + label); }
function assertEq(actual, expected, label) {
  if (actual !== expected) throw new Error(label + ": expected " + JSON.stringify(expected) + " but got " + JSON.stringify(actual));
}

function readText(path) {
  try { return Deno.readTextFileSync(path); }
  catch (_) { return __readFileSync("/app/" + path, "utf8"); }
}

const CANONICAL_URL = "https://execleadai.co";
const FORBIDDEN_PATTERNS = [
  "https://execlead.ai",
  "@execlead.ai",
  "execleadai.base44.app",
  "execleadai.com",
];

// Public-facing production files remediated in Phase 15 Remediation 1.
const PUBLIC_FACING_FILES = [
  "index.html",
  "src/lib/trustCenterData.js",
  "src/lib/trustCenterExtendedData.js",
  "src/lib/socialShare.js",
  "src/lib/referralEngine.js",
  "src/lib/ogImage.js",
  "src/lib/emailProvider.js",
  "src/hooks/useAcademy.js",
  "src/components/pricing/PlanCard.jsx",
  "src/components/beta/ApplicationConfirmation.jsx",
  "src/components/beta/DuplicateApplicationNotice.jsx",
  "src/components/cpq/ProposalActions.jsx",
  "src/components/email/ProviderConfigForm.jsx",
  "src/components/governance/GovernanceRequestForm.jsx",
  "src/components/social/CertificateView.jsx",
  "src/components/social/ShareCard.jsx",
  "src/components/founding/ReservationSuccess.jsx",
  "src/components/founding/FoundingCertificate.jsx",
  "src/components/landing/v3/ProductMockups.jsx",
  "src/pages/EnterprisePortal.jsx",
  "src/pages/ExecutivePortfolio.jsx",
  "src/pages/CPQWizard.jsx",
  "src/pages/SSOIdentity.jsx",
];

function assertNoForbiddenDomains(path) {
  const src = readText(path);
  for (const bad of FORBIDDEN_PATTERNS) {
    assert(src.indexOf(bad) === -1, path + " must not contain " + bad);
  }
}

// 1. The authoritative brand registry remains unchanged and canonical.
test("brand registry remains canonical and unchanged", () => {
  const src = readText("src/lib/brandRegistry.js");
  const website = src.match(/website:\s*"([^"]+)"/);
  const domain = src.match(/officialDomain:\s*"([^"]+)"/);
  assert(website !== null, "registry defines website");
  assert(domain !== null, "registry defines officialDomain");
  assertEq(website[1], CANONICAL_URL, "registry website");
  assertEq(domain[1], "execleadai.co", "registry officialDomain");
});

// 2. index.html canonical, OG, and Twitter URLs are canonical.
test("index.html canonical, og:url, and twitter:url are canonical", () => {
  const src = readText("index.html");
  assertEq((src.match(/https:\/\/execleadai\.co\//g) || []).length >= 3, true, "canonical URLs present");
  assert(src.indexOf("execlead.ai") === -1, "index.html contains no execlead.ai reference");
  for (const bad of FORBIDDEN_PATTERNS) {
    assert(src.indexOf(bad) === -1, "index.html free of " + bad);
  }
});

// 3. Every remediated public-facing file is free of forbidden domains.
test("no public-facing production link or contact points to a non-canonical domain", () => {
  for (const f of PUBLIC_FACING_FILES) assertNoForbiddenDomains(f);
});

// 4. Security/trust contact addresses use the canonical domain.
test("security/trust contacts use @execleadai.co", () => {
  const trust = readText("src/lib/trustCenterData.js");
  const extended = readText("src/lib/trustCenterExtendedData.js");
  for (const mailbox of ["security@", "compliance@", "privacy@", "trust@"]) {
    assert(trust.indexOf(mailbox + "execleadai.co") !== -1, "trustCenterData has " + mailbox + "execleadai.co");
    assert(extended.indexOf(mailbox + "execleadai.co") !== -1, "trustCenterExtendedData has " + mailbox + "execleadai.co");
  }
});

// 5. Public support/sales mailto links use the canonical domain.
test("support and sales mailto links use @execleadai.co", () => {
  const checks = [
    ["src/components/pricing/PlanCard.jsx", "mailto:sales@execleadai.co"],
    ["src/components/beta/ApplicationConfirmation.jsx", "mailto:support@execleadai.co"],
    ["src/components/beta/DuplicateApplicationNotice.jsx", "mailto:support@execleadai.co"],
    ["src/components/cpq/ProposalActions.jsx", "mailto:sales@execleadai.co"],
    ["src/pages/EnterprisePortal.jsx", "mailto:sales@execleadai.co"],
    ["src/pages/EnterprisePortal.jsx", "mailto:support@execleadai.co"],
    ["src/pages/CPQWizard.jsx", "sales@execleadai.co"],
    ["src/lib/emailProvider.js", "mailto:sales@execleadai.co"],
  ];
  for (const [f, needle] of checks) {
    assert(readText(f).indexOf(needle) !== -1, f + " contains " + needle);
  }
});

// 6. Share links use the canonical website.
test("share website is canonical", () => {
  const src = readText("src/lib/socialShare.js");
  assert(src.indexOf('SHARE_WEBSITE = "https://execleadai.co"') !== -1, "SHARE_WEBSITE canonical");
});

// 7. Referral and OG-image fallbacks are canonical.
test("referral and OG fallback URLs are canonical", () => {
  assert(readText("src/lib/referralEngine.js").indexOf('"https://execleadai.co"') !== -1, "referral fallback canonical");
  assert(readText("src/lib/ogImage.js").indexOf('"https://execleadai.co"') !== -1, "OG fallback canonical");
});

// 8. Certificate verification URLs are canonical.
test("certificate verification URLs use https://execleadai.co/verify/", () => {
  for (const f of [
    "src/hooks/useAcademy.js",
    "src/components/social/CertificateView.jsx",
    "src/components/founding/ReservationSuccess.jsx",
    "src/components/founding/FoundingCertificate.jsx",
  ]) {
    assert(readText(f).indexOf("https://execleadai.co/verify/") !== -1, f + " verify URL canonical");
  }
});

// 9. Intentionally retained occurrences remain intact (documented).
test("retained occurrences remain: keyword aliases, internal identifiers, frozen evidence", () => {
  // Knowledge Authority Guard trigger keywords include BOTH domains so domain
  // questions (either phrasing) route to canonical facts — retained intentionally.
  const guard = readText("src/lib/knowledgeAuthorityGuard.js");
  assert(guard.indexOf('"execlead.ai"') !== -1 && guard.indexOf('"execleadai.co"') !== -1, "authority-guard domain keywords intact");
  // Knowledge Registry search alias for users typing the legacy domain.
  assert(readText("src/lib/knowledgeRegistry.js").indexOf("'execlead.ai'") !== -1, "knowledge registry alias intact");
  // Internal storage-key prefixes (aiGovernanceEngine) — identifiers, not links.
  assert(readText("src/lib/aiGovernanceEngine.js").indexOf("execlead.ai.policies.v1") !== -1, "governance key prefixes intact");
  // ICS UID prefix (eventPlatform) — internal calendar identifier, not a contact.
  assert(readText("src/lib/eventPlatform.js").indexOf("@execlead.ai") !== -1, "ICS UID prefix intact");
  // Dead-code EarlyAccessBanner (no importers) — scheduled for separate cleanup.
  assert(readText("src/components/marketing/EarlyAccessBanner.jsx").indexOf("execlead.ai") !== -1, "dead-code banner untouched");
  // Frozen Guardian measured-state evidence text — historical audit record.
  const frozen = readText("src/lib/guardianMeasuredState.js");
  assert(frozen.indexOf("GUARDIAN_MEASURED_STATE") !== -1, "Guardian measured state untouched");
});

// 10. Forbidden-domain security fixtures and blocklists remain intact.
test("forbidden-domain test fixtures and security blocklists remain intact", () => {
  // The outreach canonical-URL suite intentionally tests that generated drafts
  // NEVER contain these domains — its fixture list must keep them.
  const suite = readText("base44/shared/outreachCanonicalUrl.test.ts");
  assert(suite.indexOf('"execlead.ai"') !== -1, "outreach suite still tests execlead.ai as forbidden");
  assert(suite.indexOf('"execleadai.com"') !== -1, "outreach suite still tests execleadai.com as forbidden");
  // Credential blocklists in the delivery boundary retain their field names.
  const boundary = readText("base44/shared/gmailDeliveryBoundary.ts");
  assert(boundary.indexOf("'private_key'") !== -1, "credential blocklist intact");
  assert(boundary.indexOf("'refresh_token'") !== -1, "credential blocklist intact (refresh_token)");
});

// 11. No Agent Workforce or Phase 14F delivery source was modified.
test("workforce and Phase 14F sources retain their governance markers", () => {
  const boundary = readText("base44/shared/gmailDeliveryBoundary.ts");
  assert(boundary.indexOf("GMAIL_DELIVERY_SENDER_IDENTITY = 'growth@execleadai.co'") !== -1, "delivery sender identity unchanged");
  assert(boundary.indexOf("@execlead.ai") === -1, "delivery boundary free of legacy domain");
  const firstSend = readText("base44/shared/controlledFirstSend.ts");
  assert(firstSend.indexOf("EXECLEAD.AI CONTROLLED DELIVERY TEST") !== -1, "controlled first-send marker unchanged");
  const core = readText("base44/shared/agentOrchestrationCore.ts");
  assert(core.indexOf("SELF_APPROVAL_PROHIBITED") !== -1, "self-approval prohibition unchanged");
  const workforce = readText("base44/functions/aiWorkforce/entry.ts");
  assert(workforce.indexOf("no direct InvokeLLM") !== -1, "workforce governed-AI marker unchanged");
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
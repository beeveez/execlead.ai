// ============================================================
// EXEC™ Knowledge Synchronization™ — page-level role-gate
// regression suite. Deterministic: NO network, NO database,
// NO LLM, NO synchronization, NO record mutation of any kind,
// NO dynamic code evaluation. Verifies (via authoritative
// source extraction, never re-implemented logic) that the
// page-level authorization predicate matches the canonical
// developer-workspace platform role set (DEVELOPER_ROLES in
// src/lib/workspaces.js):
//   developer, super_admin, founder_root_admin
// and that the shared global predicate
// (canAccessDeveloperWorkspace in src/lib/roles.js) is NOT
// broadened. Run:
//   deno test --allow-read base44/shared/execKnowledgeSyncAccess.test.ts
// ============================================================

function readText(relPath) {
  try { return Deno.readTextFileSync(relPath); }
  catch (_) { return __readFileSync("/app/" + relPath, "utf8"); }
}

function assert(cond, label) { if (!cond) throw new Error("FAILED: " + label); }
function assertEq(actual, expected, label) {
  if (actual !== expected) throw new Error(label + ": expected " + JSON.stringify(expected) + " but got " + JSON.stringify(actual));
}

/** Extracts the exported DEVELOPER_ROLES array literal from the canonical
 * workspace module — the single source of truth for the page gate. */
function extractDeveloperRoles() {
  const src = readText("src/lib/workspaces.js");
  const m = src.match(/export const DEVELOPER_ROLES = (\[[^\]]*\]);/);
  assert(m !== null, "workspaces.js exports DEVELOPER_ROLES as an array literal");
  return JSON.parse(m[1]);
}

/** Extracts the exact canAccessDeveloperWorkspace implementation text. */
function extractGlobalPredicateSource() {
  const src = readText("src/lib/roles.js");
  const i = src.indexOf("export function canAccessDeveloperWorkspace");
  assert(i !== -1, "canAccessDeveloperWorkspace present in roles.js");
  const j = src.indexOf("}", i);
  return src.slice(i, j + 1);
}

/** Extracts the ROLE_ALIASES map (legacy name -> canonical role) so
 * tested role names are proven to normalize to a non-authorized role
 * even through legacy aliases. */
function extractAliasMap() {
  const src = readText("src/lib/roles.js");
  const m = src.match(/const ROLE_ALIASES = \{([\s\S]*?)\};/);
  assert(m !== null, "ROLE_ALIASES present in roles.js");
  const map = {};
  const re = /([A-Za-z_][A-Za-z0-9_]*)\s*:\s*([A-Za-z_][A-Za-z0-9_]*)/g;
  let k;
  while ((k = re.exec(m[1])) !== null) map[k[1]] = k[2];
  return map;
}

/** Resolves a role through the authoritative alias map — mirroring
 * normalizeRole for non-registered legacy names. */
function resolveRole(role, aliases) {
  return aliases[role] || role;
}

const tests = [];
function test(name, fn) { tests.push({ name, fn }); }

// 1. The canonical developer-workspace role set is exactly the three
//    platform roles — founder_root_admin included, platform_admin NOT
//    (canonical policy does not extend the developer workspace to
//    platform_admin; no new hierarchy is invented here).
test("canonical DEVELOPER_ROLES equals developer, super_admin, founder_root_admin", () => {
  const set = extractDeveloperRoles();
  assert(Array.isArray(set), "DEVELOPER_ROLES is an exported array");
  assertEq(JSON.stringify(set.slice().sort()), JSON.stringify(["developer", "founder_root_admin", "super_admin"]), "exact canonical set");
  assert(set.includes("developer"), "developer preserved");
  assert(set.includes("super_admin"), "super_admin preserved");
  assert(set.includes("founder_root_admin"), "founder_root_admin recognized");
  assert(!set.includes("platform_admin"), "platform_admin not invented into the developer set");
});

// 2. The shared global predicate is NOT broadened — it keeps its
//    original developer/super_admin semantics for every other consumer.
test("canAccessDeveloperWorkspace remains unchanged (developer + super_admin only)", () => {
  const body = extractGlobalPredicateSource();
  assert(body.includes('"developer"') && body.includes('"super_admin"'), "original two roles preserved");
  assert(!body.includes("founder_root_admin"), "global predicate not broadened to founder_root_admin");
});

// 3. THE page predicate: the existing founder_root_admin platform
//    account is authorized for EXEC™ Knowledge Synchronization™.
test("founder_root_admin passes the page-level gate", () => {
  const set = extractDeveloperRoles();
  const aliases = extractAliasMap();
  assertEq(resolveRole("founder_root_admin", aliases), "founder_root_admin", "role not remapped");
  assertEq(set.includes(resolveRole("founder_root_admin", aliases)), true, "founder_root_admin authorized");
});

// 4. Developer and Super Admin access remain intact.
test("developer and super_admin remain authorized", () => {
  const set = extractDeveloperRoles();
  const aliases = extractAliasMap();
  for (const r of ["developer", "super_admin"]) {
    assertEq(set.includes(resolveRole(r, aliases)), true, r + " authorized");
  }
});

// 5. Ordinary and unauthorized roles are still rejected by the page gate.
test("ordinary and non-canonical roles are rejected", () => {
  const set = extractDeveloperRoles();
  const aliases = extractAliasMap();
  const rejected = [
    "customer", "user", "enterprise_user", "enterprise_manager", "enterprise_admin",
    "organization_owner", "hrbp", "leadership_development_head", "talent_director",
    "vp_talent_management", "chro", "support", "sales", "finance", "content_manager",
    "reviewer", "platform_admin", "security_admin", "instructor", "coach",
  ];
  for (const r of rejected) {
    assertEq(set.includes(resolveRole(r, aliases)), false, JSON.stringify(r) + " rejected");
  }
  assertEq(set.includes(null), false, "unauthenticated (null role) rejected");
});

// 6. The page actually uses the canonical predicate — source alignment.
test("ExecKnowledgeSync page gates on the canonical DEVELOPER_ROLES predicate", () => {
  const page = readText("src/pages/developer/ExecKnowledgeSync.jsx");
  assert(page.includes('import { DEVELOPER_ROLES } from "@/lib/workspaces"'), "page imports canonical DEVELOPER_ROLES");
  assert(page.includes('import { normalizeRole } from "@/lib/roles"'), "page uses the authoritative role normalizer");
  assert(page.includes("DEVELOPER_ROLES.includes(normalizeRole(user?.role))"), "page predicate is canonical role-set membership over the authenticated user");
  assert(!/const \{ canAccessDeveloper \} = useDeveloper/.test(page), "page no longer relies on the stale developer/super_admin-only predicate");
});

// 7. The page-level authorization gate still exists (not removed, not public).
test("the page authorization gate remains enforced and non-public", () => {
  const page = readText("src/pages/developer/ExecKnowledgeSync.jsx");
  assert(/if \(!canAccessSync\) \{/.test(page), "gated branch present");
  assert(page.includes("Developer Access Required"), "rejection surface retained");
  assert(/restricted to Developer, Super Admin, and Founder Root Admin/.test(page), "gate copy is truthful about the authorized role set");
});

// 8. No synchronization is triggered by this suite and the page module
//    itself performs reads/render only — no persistence of any kind.
test("page module performs no synchronization or persistence itself", () => {
  const page = readText("src/pages/developer/ExecKnowledgeSync.jsx");
  for (const banned of ["base44.entities", "base44.functions", "invoke(", "localStorage.setItem"]) {
    assert(!page.includes(banned), "page source must not contain " + banned);
  }
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
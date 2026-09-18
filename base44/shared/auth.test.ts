// ============================================================
// Regression tests — decodeServiceToken() / authenticateRequest()
// SDR-001 Critical remediation: unverified service-token JWT must never authorize.
// Run: deno test --allow-net base44/shared/auth.test.ts
// Tests A–I map to the mandated security verification matrix.
// ============================================================
import { decodeServiceToken, authenticateRequest, constantTimeCompare } from "./auth.ts";

// Self-contained assertion (avoids external jsr: dependency that could break
// the platform build if this shared file is compiled).
function assertEquals(actual, expected, label) {
  const a = JSON.stringify(actual), e = JSON.stringify(expected);
  if (a !== e) throw new Error(`[${label}] Expected ${e} but got ${a}`);
}

// ── Helpers ──
function b64url(obj) {
  return btoa(JSON.stringify(obj)).replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
}
function makeToken({ alg = "HS256", sig = "ZmFrZV9zaWduYXR1cmU", payload = {} } = {}) {
  return `${b64url({ alg })}.${b64url(payload)}.${sig}`;
}
function fakeReq(headers = {}, body = {}) {
  return {
    headers: { get: (k) => headers[k] ?? null },
    json: async () => body,
  };
}
function fakeBase44(user = null) {
  return { auth: { me: async () => user } };
}
const FUTURE_EXP = Math.floor(Date.now() / 1000) + 3600;

// ── TEST A — forged JWT (HS256, internal claims, future exp, fake signature) ──

Deno.test("A1: decodeServiceToken rejects a forged internal-service JWT", () => {
  const forged = makeToken({ payload: { internal_service_token: true, caller: "backend_functions", exp: FUTURE_EXP } });
  assertEquals(decodeServiceToken(forged).valid, false, "A1");
});

Deno.test("A2: forged service header NEVER authorizes — allowServiceToken:true (explicit opt-in)", async () => {
  const forged = makeToken({ payload: { internal_service_token: true, caller: "backend_functions", exp: FUTURE_EXP } });
  const auth = await authenticateRequest(fakeReq({ "base44-service-authorization": forged }, {}), fakeBase44(null), {
    allowServiceToken: true, requireAdmin: true,
  });
  assertEquals(auth.authenticated, false, "A2a");
  assertEquals(auth.authorized, false, "A2b");
  assertEquals(auth.isSystemCall, false, "A2c");
  assertEquals(auth.statusCode, 401, "A2d");
});

Deno.test("A3: forged service header NEVER authorizes — default options (former tier default)", async () => {
  const forged = makeToken({ payload: { internal_service_token: true, exp: FUTURE_EXP } });
  const auth = await authenticateRequest(fakeReq({ "base44-service-authorization": forged }, {}), fakeBase44(null), {
    requireAdmin: true,
  });
  assertEquals(auth.authenticated, false, "A3a");
  assertEquals(auth.authorized, false, "A3b");
  assertEquals(auth.isSystemCall, false, "A3c");
});

// ── TEST B — tampered payload (modified without valid signature) ──

Deno.test("B1: tampered-payload token is rejected", () => {
  const legit = makeToken({ payload: { internal_service_token: true, exp: FUTURE_EXP } });
  const parts = legit.split(".");
  const tamperedPayload = b64url({ internal_service_token: true, caller: "backend_functions", exp: FUTURE_EXP });
  const tampered = `${parts[0]}.${tamperedPayload}.${parts[2]}`; // signature unchanged
  assertEquals(decodeServiceToken(tampered).valid, false, "B1");
});

Deno.test("B2: tampered token does not authorize a request", async () => {
  const parts = makeToken({ payload: { internal_service_token: true, exp: FUTURE_EXP } }).split(".");
  const tampered = `${parts[0]}.${b64url({ internal_service_token: true, exp: FUTURE_EXP, admin: true })}.${parts[2]}`;
  const auth = await authenticateRequest(fakeReq({ "base44-service-authorization": tampered }, {}), fakeBase44(null), {});
  assertEquals(auth.authenticated, false, "B2");
});

// ── TEST C — expired token ──

Deno.test("C1: expired token is rejected by the parser", () => {
  const expired = makeToken({ payload: { internal_service_token: true, caller: "backend_functions", exp: Math.floor(Date.now() / 1000) - 60 } });
  assertEquals(decodeServiceToken(expired).valid, false, "C1");
});

Deno.test("C2: expired token does not authorize a request", async () => {
  const expired = makeToken({ payload: { internal_service_token: true, exp: Math.floor(Date.now() / 1000) - 60 } });
  const auth = await authenticateRequest(fakeReq({ "base44-service-authorization": expired }, {}), fakeBase44(null), {
    allowServiceToken: true,
  });
  assertEquals(auth.authenticated, false, "C2");
});

// ── TEST D — malformed token ──

Deno.test("D1: malformed tokens are rejected", () => {
  assertEquals(decodeServiceToken("not.a.jwt.extra").valid, false, "D1a");
  assertEquals(decodeServiceToken("onlyone").valid, false, "D1b");
  assertEquals(decodeServiceToken("a.b.").valid, false, "D1c");
  assertEquals(decodeServiceToken("!!not-base64!!.!!.sig").valid, false, "D1d");
});

// ── TEST E — missing service authorization ──

Deno.test("E1: missing service header does not authorize a required path", async () => {
  const auth = await authenticateRequest(fakeReq({}, {}), fakeBase44(null), { requireAdmin: true, allowSystemSecret: false });
  assertEquals(auth.authenticated, false, "E1a");
  assertEquals(auth.statusCode, 401, "E1b");
});

// ── TEST F — legitimate authenticated admin path ──

Deno.test("F1: authenticated admin still authorizes (with forged service header present)", async () => {
  const forged = makeToken({ payload: { internal_service_token: true, exp: FUTURE_EXP } });
  const req = fakeReq({ "base44-service-authorization": forged }, {});
  const auth = await authenticateRequest(req, fakeBase44({ id: "u1", role: "admin", email: "a@b.c", full_name: "Admin" }), { requireAdmin: true });
  assertEquals(auth.authenticated, true, "F1a");
  assertEquals(auth.authorized, true, "F1b");
  assertEquals(auth.authMethod, "admin_user", "F1c");
});

Deno.test("F2: authenticated non-admin is authenticated but NOT authorized (requireAdmin)", async () => {
  const auth = await authenticateRequest(fakeReq({}, {}), fakeBase44({ id: "u2", role: "user", email: "u@b.c", full_name: "User" }), { requireAdmin: true });
  assertEquals(auth.authenticated, true, "F2a");
  assertEquals(auth.authorized, false, "F2b");
  assertEquals(auth.statusCode, 403, "F2c");
});

// ── TEST G — legitimate service path via the VERIFIED mechanism (DISPATCH_BATCH_TOKEN) ──

Deno.test("G1: system secret (constant-time verified) continues to authenticate system calls", async () => {
  Deno.env.set("DISPATCH_BATCH_TOKEN", "test-secret-token");
  const auth = await authenticateRequest(fakeReq({}, {}), fakeBase44(null), { body: { system_token: "test-secret-token" }, allowSystemSecret: true, requireAdmin: true });
  assertEquals(auth.authenticated, true, "G1a");
  assertEquals(auth.authorized, true, "G1b");
  assertEquals(auth.isSystemCall, true, "G1c");
  assertEquals(auth.authMethod, "system_secret", "G1d");
});

Deno.test("G2: WRONG system secret is rejected (constant-time compare)", async () => {
  Deno.env.set("DISPATCH_BATCH_TOKEN", "correct-secret");
  const auth = await authenticateRequest(fakeReq({}, {}), fakeBase44(null), { body: { system_token: "wrong-secret" }, allowSystemSecret: true });
  assertEquals(auth.authenticated, false, "G2");
});

// ── TEST H — privilege boundary: forged header can never grant system/admin ──

Deno.test("H1: forged header cannot produce isSystemCall/admin authorization under ANY options", async () => {
  const forged = makeToken({ payload: { internal_service_token: true, caller: "backend_functions", exp: FUTURE_EXP, role: "super_admin" } });
  for (const opts of [
    {},
    { allowServiceToken: true },
    { allowServiceToken: true, requireAdmin: true },
    { requireAdmin: false },
    { allowSystemSecret: true, requireAdmin: true },
  ]) {
    const auth = await authenticateRequest(fakeReq({ "base44-service-authorization": forged }, {}), fakeBase44(null), opts);
    assertEquals(auth.isSystemCall, false, `H1-systemCall-${JSON.stringify(opts)}`);
    assertEquals(auth.authenticated, false, `H1-auth-${JSON.stringify(opts)}`);
  }
});

// ── TEST I — no partial/side-effect execution on rejection ──
// authenticateRequest is the gate: every rejection above returns a fully-denied
// result (authenticated:false / authorized:false / isSystemCall:false), so
// callers' enforceAuth() short-circuits to 401/403 BEFORE any privileged
// operation can execute. This test proves no rejection path carries any
// privileged state out of the gate.

Deno.test("I1: every rejection path returns a fully-denied result (zero privileged state)", async () => {
  const forged = makeToken({ payload: { internal_service_token: true, exp: FUTURE_EXP } });
  Deno.env.set("DISPATCH_BATCH_TOKEN", "right-secret");
  const scenarios = [
    ["forged-header", fakeReq({ "base44-service-authorization": forged }, {}), { allowServiceToken: true }],
    ["missing-header", fakeReq({}, {}), { requireAdmin: true, allowSystemSecret: false }],
    ["wrong-secret", fakeReq({}, {}), { body: { system_token: "wrong" }, allowSystemSecret: true }],
  ];
  for (const [name, req, opts] of scenarios) {
    const auth = await authenticateRequest(req, fakeBase44(null), opts);
    assertEquals(auth.authenticated, false, `I1-${name}-authenticated`);
    assertEquals(auth.authorized, false, `I1-${name}-authorized`);
    assertEquals(auth.isSystemCall, false, `I1-${name}-system`);
    assertEquals(auth.user, null, `I1-${name}-user`);
    assertEquals(auth.statusCode, 401, `I1-${name}-status`);
  }
});

// ── constantTimeCompare (preserved verified mechanism) ──

Deno.test("constantTimeCompare rejects mismatched lengths", () => {
  assertEquals(constantTimeCompare("abc", "abcd"), false, "ctc1");
});

Deno.test("constantTimeCompare accepts equal strings and rejects unequal", () => {
  assertEquals(constantTimeCompare("secret", "secret"), true, "ctc2a");
  assertEquals(constantTimeCompare("secret", "secreX"), false, "ctc2b");
});
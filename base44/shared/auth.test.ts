// ============================================================
// Regression tests — decodeServiceToken() / authenticateRequest()
// Security Decision Record SDR-001
// Run: deno test --allow-net base44/shared/auth.test.ts
// ============================================================
import { decodeServiceToken, authenticateRequest, constantTimeCompare } from "./auth.ts";
import { assertEquals } from "jsr:@std/assert@0.221";

// ── Helpers ──
function b64url(obj) {
  return btoa(JSON.stringify(obj)).replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
}
function makeToken({ alg = "HS256", sig = "c2lnbmF0dXJl", payload = {} } = {}) {
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

// ── decodeServiceToken: rejection cases ──

Deno.test("decodeServiceToken rejects missing header", () => {
  assertEquals(decodeServiceToken(null).valid, false);
  assertEquals(decodeServiceToken("").valid, false);
});

Deno.test("decodeServiceToken rejects non-JWT (wrong segment count)", () => {
  assertEquals(decodeServiceToken("not.a.jwt.extra").valid, false);
  assertEquals(decodeServiceToken("onlyone").valid, false);
});

Deno.test("decodeServiceToken rejects alg:none (unsigned)", () => {
  const t = makeToken({ alg: "none", payload: { internal_service_token: true } });
  assertEquals(decodeServiceToken(t).valid, false);
});

Deno.test("decodeServiceToken rejects missing alg", () => {
  const t = `${b64url({})}.${b64url({ internal_service_token: true })}.sig`;
  assertEquals(decodeServiceToken(t).valid, false);
});

Deno.test("decodeServiceToken rejects empty signature segment", () => {
  const t = `${b64url({ alg: "HS256" })}.${b64url({ internal_service_token: true })}.`;
  assertEquals(decodeServiceToken(t).valid, false);
});

Deno.test("decodeServiceToken rejects expired token", () => {
  const t = makeToken({ payload: { internal_service_token: true, exp: 1 } });
  assertEquals(decodeServiceToken(t).valid, false);
});

Deno.test("decodeServiceToken rejects token missing internal-service claims", () => {
  const t = makeToken({ payload: { exp: Math.floor(Date.now() / 1000) + 3600 } });
  assertEquals(decodeServiceToken(t).valid, false);
});

Deno.test("decodeServiceToken accepts a well-formed internal-service token", () => {
  const t = makeToken({ payload: { internal_service_token: true, exp: Math.floor(Date.now() / 1000) + 3600 } });
  const r = decodeServiceToken(t);
  assertEquals(r.valid, true);
  assertEquals(r.payload.internal_service_token, true);
});

Deno.test("decodeServiceToken accepts caller:'backend_functions' claim", () => {
  const t = makeToken({ payload: { caller: "backend_functions", exp: Math.floor(Date.now() / 1000) + 3600 } });
  assertEquals(decodeServiceToken(t).valid, true);
});

// ── authenticateRequest: service-token opt-out (defense-in-depth) ──

Deno.test("authenticateRequest: forged service header alone does NOT authorize when allowServiceToken:false", async () => {
  const forged = makeToken({ payload: { internal_service_token: true, exp: Math.floor(Date.now() / 1000) + 3600 } });
  const req = fakeReq({ "base44-service-authorization": forged }, {});
  const base44 = fakeBase44(null); // no user, no DISPATCH_BATCH_TOKEN
  const auth = await authenticateRequest(req, base44, { allowServiceToken: false, allowSystemSecret: true, requireAdmin: true });
  assertEquals(auth.authenticated, false);
  assertEquals(auth.authorized, false);
  assertEquals(auth.statusCode, 401);
});

Deno.test("authenticateRequest: forged service header DOES authorize when allowServiceToken:true (documents gateway dependency)", async () => {
  // This asserts current behavior: the header is trusted. In production the gateway
  // guarantees only platform-injected (verified) headers reach this code (SDR-001).
  const forged = makeToken({ payload: { internal_service_token: true, exp: Math.floor(Date.now() / 1000) + 3600 } });
  const req = fakeReq({ "base44-service-authorization": forged }, {});
  const base44 = fakeBase44(null);
  const auth = await authenticateRequest(req, base44, { allowServiceToken: true, requireAdmin: true });
  assertEquals(auth.authenticated, true);
  assertEquals(auth.isSystemCall, true);
  assertEquals(auth.authMethod, "platform_service");
});

Deno.test("authenticateRequest: admin user still authorizes with allowServiceToken:false", async () => {
  const req = fakeReq({}, {});
  const base44 = fakeBase44({ id: "u1", role: "admin", email: "a@b.c", full_name: "Admin" });
  const auth = await authenticateRequest(req, base44, { allowServiceToken: false, requireAdmin: true });
  assertEquals(auth.authenticated, true);
  assertEquals(auth.authorized, true);
  assertEquals(auth.authMethod, "admin_user");
});

// ── constantTimeCompare ──

Deno.test("constantTimeCompare rejects mismatched lengths", () => {
  assertEquals(constantTimeCompare("abc", "abcd"), false);
});

Deno.test("constantTimeCompare accepts equal strings and rejects unequal", () => {
  assertEquals(constantTimeCompare("secret", "secret"), true);
  assertEquals(constantTimeCompare("secret", "secreX"), false);
});
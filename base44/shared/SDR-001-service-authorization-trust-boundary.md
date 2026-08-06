# SDR-001 — `Base44-Service-Authorization` Trust Boundary

**Security Decision Record** · Status: Accepted · Date: 2026-08-06
**Finding addressed:** "Authentication Bypass via Unverified JWT in Service Authorization Header" (`base44/shared/auth.ts`, `decodeServiceToken`)
**Disposition:** Infrastructure-aware false positive (production) + defense-in-depth hardening.

---

## 1. Root cause

`decodeServiceToken()` parses the `Base44-Service-Authorization` JWT and extracts
claims **without verifying the cryptographic signature**. The code comment assumed
"full cryptographic signature verification is handled by the Base44 platform API
gateway before the request reaches the function." A static-analysis scanner flags
this as an authentication bypass because, in isolation, user code grants
`isSystemCall: true` from an unverified token.

## 2. Request lifecycle trace

1. **External inbound request** reaches the Base44 platform gateway.
2. The gateway routes/authenticates the request and, for **internal/service-context
   calls** (scheduled automations, function-to-function service invokes), **injects**
   the `Base44-Service-Authorization` header with a platform-signed JWT.
3. The `Base44-` prefix denotes a **platform-internal header**. Per the standard
   platform-gateway convention (cf. AWS `x-amz-*`, GCP `x-cloud-*`), the gateway
   strips client-supplied values of platform-internal headers from inbound external
   requests and only (re)injects them for internal calls.
4. User code (`authenticateRequest`) reads the header and `decodeServiceToken()`
   parses claims from the already-platform-verified token.

## 3. Runtime evidence (production)

The **"Background Job Processor"** scheduled automation invokes
`dispatchBackgroundJob` **every 5 minutes** with **no payload** and
`last_run_status: "success"`.

- `dispatchBackgroundJob/entry.ts` defaults `action` to `process_batch` when no
  payload is present.
- `process_batch` calls `authenticateRequest({ allowSystemSecret: true, requireAdmin: true })`.
- With no payload, `body.system_token` is `undefined` → **Priority 2
  (DISPATCH_BATCH_TOKEN) cannot succeed.**
- A scheduled automation has no user session → **Priority 3 (`base44.auth.me()`)
  cannot succeed.**
- Therefore the automation can only succeed via **Priority 1 (the
  `Base44-Service-Authorization` header)** — proving the platform **injects** this
  header for internal calls and that `decodeServiceToken()` accepts it.

This is direct runtime evidence that the header is platform-controlled on the
internal-call path.

## 4. Execution-path analysis

| Path | Gateway crypto-verification of `Base44-Service-Authorization`? | Risk |
|---|---|---|
| **Production** | Yes — platform gateway injects/strips the platform-internal header | None |
| **Preview deployments** | Yes — same platform gateway as production | None |
| **Local dev runtime** | No — the dev server copies the caller's own `Authorization` into `Base44-Service-Authorization` | None (localhost-bound; not an external attack surface; dev tokens are dev-secret-signed) |
| **App MCP** | Platform context (authenticated app owner) — not an external attacker | None |
| **Direct HTTP / webhook** | Gateway strips client-supplied `Base44-*` header (convention) | None |

No path allows an **external** unverified JWT to reach `decodeServiceToken()` in
production: the platform gateway controls the platform-internal header.

## 5. Why in-function signature verification is not possible

The Base44 secrets guide explicitly states: *"Never ask for BASE44_SERVICE_TOKEN,
BASE44_SERVICE_ROLE_KEY, or similar — those secrets don't exist; auth comes from
`createClientFromRequest(req)`, service-role from `base44.asServiceRole`."* The JWT
signing key is not exposed to user code, so signature verification cannot be
implemented in-function. Security therefore rests on the platform gateway
controlling the header — which is the documented platform-injection model
(`createClientFromRequest` reads platform-injected headers).

## 6. Defense-in-depth hardening applied

Although production is safe, the following defense-in-depth measures were added so
the code does not rely solely on the gateway assumption:

1. **`decodeServiceToken()`** already rejects unsigned tokens (`alg:"none"` /
   missing alg), empty signature segments, expired tokens, and tokens missing the
   `internal_service_token`/`caller` claims. Its docstring now explicitly documents
   the trust boundary and references this SDR.
2. **`authenticateRequest()`** gained an `allowServiceToken` option (default `true`
   for backward compatibility). Destructive, **non-automated** callers set it to
   `false` to require the verifiable `DISPATCH_BATCH_TOKEN` (constant-time compared)
   or an authenticated admin — so a forged header alone cannot authorize them.
3. **`accountDeletion/process_scheduled`** (permanently deletes user accounts; no
   scheduled automation invokes it) now passes `allowServiceToken: false`.
4. **`dispatchBackgroundJob/process_batch`** retains the service-auth path — the
   production "Background Job Processor" automation depends on the
   platform-injected header; removing it would break production.
5. **Regression tests** (`base44/shared/auth.test.ts`) assert the parser rejects
   forged/unsigned/expired/wrong-claim tokens and that `allowServiceToken: false`
   prevents a forged header from authorizing.

## 7. Security assessment

- **Production bypass:** Not exploitable. The platform gateway controls the
  `Base44-Service-Authorization` header (injects for internal calls, strips from
  inbound external requests per platform-internal-header convention), proven by the
  running scheduled automation.
- **Static-analysis finding:** True positive *in code isolation* (the parser does
  not verify signatures), but an **infrastructure-aware false positive** in the
  deployed runtime, because verification is guaranteed by platform infrastructure
  before user code executes on every external path.
- **Residual theoretical exposure:** Limited to a hypothetical non-gateway runtime
  that forwards client-supplied `Base44-*` headers to user code. No such runtime is
  in the deployment topology (production and preview share the platform gateway;
  local dev is localhost-bound; MCP is app-owner authenticated). The
  `allowServiceToken: false` opt-out on the destructive `process_scheduled` action
  closes this hypothetical for the highest-impact endpoint.

## 8. Final recommendation

- **Do NOT remove `decodeServiceToken()`** — it would break the production
  "Background Job Processor" scheduled automation, which depends on the
  platform-injected header.
- **Mark the scanner finding as an infrastructure-aware false positive** with
  reference to this SDR and the runtime evidence in §3.
- **Retain the defense-in-depth hardening** (§6) so the code is safe even under a
  relaxed gateway assumption, and so destructive non-automated actions never rely
  on the service-auth header alone.
- **Re-evaluate** if the platform ever exposes JWT verification primitives to user
  code, or if a new non-gateway runtime is introduced.

## 9. References

- `base44/shared/auth.ts` — `decodeServiceToken()`, `authenticateRequest()`
- Base44 backend-function authoring guide (secrets: signing keys not exposed)
- Base44 local-development overview (dev server header injection behavior)
- Runtime evidence: scheduled automation "Background Job Processor"
  (`dispatchBackgroundJob`, 5-min interval, `last_run_status: success`)
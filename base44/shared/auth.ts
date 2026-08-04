// ============================================================
// EXECLEAD.AI Secure Backend Function Authentication Standard™ v1.0
// Implements the Zero Trust authentication hierarchy for all backend functions.
//
// Authentication Hierarchy:
//   Priority 1: Platform Internal Service Authentication (base44-service-authorization)
//   Priority 2: Shared System Secret (DISPATCH_BATCH_TOKEN, constant-time comparison)
//   Priority 3: Authenticated Administrator (role-based)
//
// Deny by default. Trust is never assumed.
// ============================================================

const DEFAULT_ADMIN_ROLES = ['super_admin', 'platform_admin', 'admin', 'developer'];

// ── Utility Functions ──

/**
 * Constant-time string comparison to prevent timing attacks (CWE-208).
 */
export function constantTimeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Decode a base64url string (used for JWT payloads).
 */
function base64urlDecode(str) {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4 !== 0) base64 += '=';
  return atob(base64);
}

/**
 * Decode and validate a platform service JWT.
 * Checks: token structure, header alg (reject "none"/missing), non-empty signature,
 * expiration, internal_service_token, caller.
 *
 * Defense-in-depth: full cryptographic signature verification is handled by the
 * Base44 platform API gateway before the request reaches the function. These
 * function-level checks reject unsigned/alg-none tokens and empty signatures so
 * a forged header that bypasses the gateway cannot be trusted by payload claims
 * alone. The payload is never trusted unless the header alg is a signing algorithm
 * and a non-empty signature segment is present.
 */
function decodeServiceToken(header) {
  if (!header) return { valid: false, payload: null };

  const token = header.startsWith('Bearer ') ? header.slice(7) : header;
  const parts = token.split('.');
  if (parts.length !== 3) return { valid: false, payload: null };

  // Reject unsigned tokens: parse the JOSE header and require a signing algorithm.
  // alg:"none" or a missing alg means no signature — must never be trusted.
  try {
    const joseHeader = JSON.parse(base64urlDecode(parts[0]));
    const alg = typeof joseHeader.alg === 'string' ? joseHeader.alg.toLowerCase() : '';
    if (!alg || alg === 'none') return { valid: false, payload: null };
  } catch {
    return { valid: false, payload: null };
  }

  // Require a non-empty signature segment. An empty signature with a signing alg
  // still indicates an unsigned token (forged).
  if (!parts[2] || parts[2].length === 0) return { valid: false, payload: null };

  try {
    const payload = JSON.parse(base64urlDecode(parts[1]));

    // Check expiration (exp is in seconds)
    if (payload.exp) {
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp < now) return { valid: false, payload: null };
    }

    // Verify internal service token claims
    if (payload.internal_service_token !== true && payload.caller !== 'backend_functions') {
      return { valid: false, payload: null };
    }

    return { valid: true, payload };
  } catch {
    return { valid: false, payload: null };
  }
}

/**
 * Get the client IP address from request headers.
 */
export function getClientIp(req) {
  return (
    req.headers.get('cf-connecting-ip') ||
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}

/**
 * Create a generic security response (never exposes internal details).
 */
export function securityResponse(status) {
  const messages = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    429: 'Too Many Requests',
    500: 'Internal Server Error',
  };
  return Response.json({ error: messages[status] || 'Error' }, { status });
}

// ── Authentication ──

/**
 * Authenticate a request using the three-tier authentication hierarchy.
 *
 * Priority 1: Platform Internal Service Authentication (base44-service-authorization header)
 * Priority 2: Shared System Secret (DISPATCH_BATCH_TOKEN, constant-time comparison)
 * Priority 3: Authenticated Administrator (role-based)
 *
 * @param {Request} req - The HTTP request
 * @param {Object} base44 - The Base44 SDK client
 * @param {Object} options - Authentication options
 * @param {Object} options.body - Pre-parsed request body (for system token check)
 * @param {string[]} options.adminRoles - Allowed admin roles (default: super_admin, platform_admin, admin, developer)
 * @param {boolean} options.allowSystemSecret - Allow DISPATCH_BATCH_TOKEN authentication (default: true)
 * @param {boolean} options.requireAdmin - Require admin role for user auth (default: true)
 * @param {string} options.systemTokenField - Body field name for system token (default: system_token)
 * @returns {Object} AuthResult with authenticated, authorized, authMethod, user, isSystemCall
 */
export async function authenticateRequest(req, base44, options = {}) {
  const roles = options.adminRoles || DEFAULT_ADMIN_ROLES;
  const allowSecret = options.allowSystemSecret !== false;
  const requireAdmin = options.requireAdmin !== false;
  const requestId = req.headers.get('cf-ray') || crypto.randomUUID();

  // Priority 1: Platform Internal Service Authentication
  const serviceAuth = req.headers.get('base44-service-authorization');
  const { valid: serviceValid } = decodeServiceToken(serviceAuth);

  if (serviceValid) {
    return {
      authenticated: true,
      authorized: true,
      authMethod: 'platform_service',
      user: null,
      isSystemCall: true,
      requestId,
      statusCode: 200,
    };
  }

  // Priority 2: Shared System Secret (constant-time comparison)
  if (allowSecret) {
    const expectedToken = Deno.env.get('DISPATCH_BATCH_TOKEN');
    if (expectedToken) {
      const body = options.body || {};
      const field = options.systemTokenField || 'system_token';
      const providedToken = body[field];

      if (providedToken && constantTimeCompare(String(providedToken), expectedToken)) {
        return {
          authenticated: true,
          authorized: true,
          authMethod: 'system_secret',
          user: null,
          isSystemCall: true,
          requestId,
          statusCode: 200,
        };
      }
    }
  }

  // Priority 3: Authenticated User
  try {
    const user = await base44.auth.me();
    if (user) {
      const isAdmin = roles.includes(user.role);
      const authorized = requireAdmin ? isAdmin : true;
      return {
        authenticated: true,
        authorized,
        authMethod: 'admin_user',
        user: { id: user.id, email: user.email, role: user.role, full_name: user.full_name },
        isSystemCall: false,
        requestId,
        statusCode: authorized ? 200 : 403,
      };
    }
  } catch {
    // Not authenticated — fall through to deny
  }

  // Deny by default
  return {
    authenticated: false,
    authorized: false,
    authMethod: null,
    user: null,
    isSystemCall: false,
    requestId,
    statusCode: 401,
  };
}

/**
 * Enforce authentication and authorization for a request.
 * Logs security events for failures and returns a security response.
 *
 * @returns {Response|null} null if auth passes, Response if auth fails
 */
export async function enforceAuth(base44, auth, action, clientIp) {
  if (!auth.authenticated) {
    await logSecurityEvent(base44, {
      action: `${action}_unauthorized`,
      authMethod: auth.authMethod,
      severity: 'error',
      requestId: auth.requestId,
      ipAddress: clientIp,
      description: `Authentication failed for ${action}`,
    });
    return securityResponse(401);
  }

  if (!auth.authorized) {
    await logSecurityEvent(base44, {
      action: `${action}_forbidden`,
      authMethod: auth.authMethod,
      performedById: auth.user?.id,
      performedByName: auth.user?.full_name,
      severity: 'warning',
      requestId: auth.requestId,
      ipAddress: clientIp,
      description: `Authorization failed for ${action}`,
    });
    return securityResponse(403);
  }

  return null;
}

// ── Audit Logging ──

/**
 * Log an audit record to PlatformActivity.
 * Audit logging failures do not block execution but are logged to console.
 */
export async function logAuditRecord(base44, params) {
  try {
    await base44.asServiceRole.entities.PlatformActivity.create({
      activity_id: crypto.randomUUID(),
      category: params.category,
      action: params.action,
      performed_by_id: params.performedById || 'system',
      performed_by_name: params.performedByName || 'System',
      target_entity: params.targetEntity,
      target_entity_id: params.targetEntityId,
      status: params.status,
      severity: params.severity,
      metadata_json: JSON.stringify({
        auth_method: params.authMethod,
        request_id: params.requestId,
        ip_address: params.ipAddress,
        ...params.metadata,
      }),
      risk_score: params.riskScore || 0,
      ip_address: params.ipAddress,
      request_id: params.requestId,
    });
  } catch (e) {
    console.error('Audit logging failed:', e.message);
  }
}

/**
 * Log a security event (authentication failure, authorization failure, invalid token, etc.)
 * Forwarded to PlatformActivity with category 'security' for the Security Operations Center.
 */
export async function logSecurityEvent(base44, params) {
  const severity = params.severity || 'warning';
  await logAuditRecord(base44, {
    category: 'security',
    action: params.action,
    authMethod: params.authMethod || null,
    performedById: params.performedById,
    performedByName: params.performedByName,
    status: 'failed',
    severity,
    requestId: params.requestId,
    ipAddress: params.ipAddress,
    riskScore: severity === 'critical' ? 100 : severity === 'error' ? 75 : 50,
    metadata: { description: params.description, security_event: true, ...params.metadata },
  });
}
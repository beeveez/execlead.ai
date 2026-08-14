import { authenticateRequest, enforceAuth, getClientIp, securityResponse } from './auth.ts';

export const KNOWLEDGE_ADMIN_ROLES = ['super_admin', 'platform_admin', 'admin', 'developer', 'founder_root_admin'];

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export async function authorizeKnowledgeFunction(req, base44, options) {
  if (req.method !== 'POST') {
    return { response: Response.json({ error: 'Method Not Allowed' }, { status: 405 }), auth: null };
  }

  const auth = await authenticateRequest(req, base44, {
    adminRoles: options.adminRoles || KNOWLEDGE_ADMIN_ROLES,
    allowSystemSecret: false,
    allowServiceToken: options.allowServiceToken === true,
    requireAdmin: true,
  });
  const denied = await enforceAuth(base44, auth, options.action, getClientIp(req));
  if (denied) return { response: denied, auth };

  const rawBody = await req.clone().text();
  if (rawBody.trim()) {
    let body;
    try { body = JSON.parse(rawBody); } catch { return { response: securityResponse(400), auth }; }
    if (!isPlainObject(body) || Object.keys(body).length > 0) {
      return { response: securityResponse(400), auth };
    }
  }

  if (auth.user) {
    try {
      const events = await base44.asServiceRole.entities.SecurityEvent.filter(
        { user_id: auth.user.id },
        '-created_date',
        100,
      );
      const cutoff = Date.now() - options.windowMs;
      const marker = `knowledge:${options.action}:allowed`;
      const count = (events || []).filter((event) =>
        event.description === marker && new Date(event.created_date).getTime() >= cutoff
      ).length;
      if (count >= options.limit) {
        return { response: securityResponse(429), auth };
      }
      await base44.asServiceRole.entities.SecurityEvent.create({
        user_id: auth.user.id,
        user_name: auth.user.full_name || auth.user.email,
        event_type: 'api_access',
        severity: 'info',
        ip_address: getClientIp(req),
        description: marker,
        action_taken: 'logged',
        metadata_json: JSON.stringify({ request_id: auth.requestId, auth_method: auth.authMethod }),
      });
    } catch {
      return { response: Response.json({ error: 'Service Unavailable' }, { status: 503 }), auth };
    }
  }

  return { response: null, auth };
}
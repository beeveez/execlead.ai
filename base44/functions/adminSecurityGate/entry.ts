import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

const GATE_VALIDITY_MINUTES = 15;
const OTP_EXPIRY_MINUTES = 10;
const MAX_OTP_REQUESTS_PER_HOUR = 5;

const GATED_ACTIONS = [
  'identity_approval',
  'organization_management',
  'subscription_management',
  'billing_management',
  'user_deletion',
  'scim_configuration',
  'api_key_management',
  'enterprise_admin_transfer',
  'security_policy_change',
  'data_export',
];

const ADMIN_ROLES = ['admin', 'super_admin', 'platform_admin', 'developer', 'enterprise_admin'];

async function hashCode(code) {
  const data = new TextEncoder().encode(code);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function maskEmail(email) {
  if (!email || !email.includes('@')) return email;
  const [local, domain] = email.split('@');
  const masked = local.length > 2 ? local[0] + '***' + local[local.length - 1] : '***';
  return masked + '@' + domain;
}

async function safeFilter(base44, entityName, filterObj, limit) {
  try {
    return await base44.asServiceRole.entities[entityName].filter(filterObj, '-created_date', limit || 100);
  } catch {
    return [];
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { action } = body;

    const getIp = () => {
      const fwd = req.headers.get('x-forwarded-for');
      if (fwd) return fwd.split(',')[0].trim();
      return req.headers.get('x-real-ip') || 'unknown';
    };

    // ---- request_gate: send OTP to admin email ----
    if (action === 'request_gate') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
      if (!ADMIN_ROLES.includes(user.role)) {
        return Response.json({ error: 'Forbidden — admin access required' }, { status: 403 });
      }

      // Rate limit: max 5 gate OTP requests per hour
      const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
      const recentRequests = await safeFilter(base44, 'SecurityEvent', {
        user_id: user.id,
        event_type: 'admin_gate_otp_requested',
        created_date: { $gte: oneHourAgo },
      });
      if (recentRequests.length >= MAX_OTP_REQUESTS_PER_HOUR) {
        return Response.json({ error: 'Too many verification requests. Please try again later.' }, { status: 429 });
      }

      // Check if already has active gate
      const activeGates = await safeFilter(base44, 'SecuritySession', {
        user_id: user.id,
        session_type: 'admin_gate',
        status: 'active',
      });
      const now = new Date();
      const activeGate = activeGates.find(g => {
        if (!g.expires_at) return false;
        return new Date(g.expires_at) > now;
      });
      if (activeGate) {
        return Response.json({
          already_verified: true,
          expires_at: activeGate.expires_at,
          gate_id: activeGate.id,
        });
      }

      // Generate CSPRNG OTP
      const code = String(100000 + (crypto.getRandomValues(new Uint32Array(1))[0] % 900000));
      const codeHash = await hashCode(code);
      const expires = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60000).toISOString();

      // Store pending gate as a SecurityEvent with OTP hash
      await base44.asServiceRole.entities.SecurityEvent.create({
        user_id: user.id,
        user_name: user.full_name || user.email,
        event_type: 'admin_gate_otp_requested',
        severity: 'low',
        description: 'Admin security gate OTP requested',
        ip_address: getIp(),
        metadata_json: JSON.stringify({
          otp_hash: codeHash,
          otp_expires: expires,
          requested_action: body.gated_action || 'general',
        }),
      });

      // Send OTP via email
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: user.email,
          subject: 'EXECLEAD.AI — Admin Security Gate Verification Code',
          body: 'Your admin verification code is: ' + code + '\n\nThis code expires in ' + OTP_EXPIRY_MINUTES + ' minutes.\n\nYou are verifying for: ' + (body.gated_action || 'administrative access') + '.\n\nIf you did not request this, please secure your account immediately and contact support.',
        });
      } catch {}

      return Response.json({
        code_sent_to: maskEmail(user.email),
        expires_at: expires,
      });
    }

    // ---- verify_gate: verify OTP and create gate session ----
    if (action === 'verify_gate') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
      if (!ADMIN_ROLES.includes(user.role)) {
        return Response.json({ error: 'Forbidden — admin access required' }, { status: 403 });
      }

      // Find the most recent OTP request
      const recentRequests = await safeFilter(base44, 'SecurityEvent', {
        user_id: user.id,
        event_type: 'admin_gate_otp_requested',
      }, 1);
      if (recentRequests.length === 0) {
        return Response.json({ error: 'No pending verification. Please request a new code.' }, { status: 400 });
      }

      const otpEvent = recentRequests[0];
      let metadata = {};
      try { metadata = JSON.parse(otpEvent.metadata_json || '{}'); } catch {}

      if (!metadata.otp_hash) {
        return Response.json({ error: 'Invalid verification state. Please request a new code.' }, { status: 400 });
      }

      const inputHash = await hashCode(body.code);
      if (metadata.otp_hash !== inputHash) {
        return Response.json({ error: 'Invalid verification code.' }, { status: 400 });
      }

      if (metadata.otp_expires && new Date(metadata.otp_expires) < new Date()) {
        return Response.json({ error: 'Verification code expired. Please request a new one.' }, { status: 400 });
      }

      // Create gate session
      const gateExpires = new Date(Date.now() + GATE_VALIDITY_MINUTES * 60000).toISOString();
      const gateSession = await base44.asServiceRole.entities.SecuritySession.create({
        user_id: user.id,
        user_name: user.full_name || user.email,
        session_type: 'admin_gate',
        status: 'active',
        ip_address: getIp(),
        expires_at: gateExpires,
        device_type: 'admin_gate',
        metadata_json: JSON.stringify({
          verified_action: body.gated_action || 'general',
          verified_at: new Date().toISOString(),
        }),
      });

      // Log successful verification
      await base44.asServiceRole.entities.SecurityEvent.create({
        user_id: user.id,
        user_name: user.full_name || user.email,
        event_type: 'admin_gate_verified',
        severity: 'medium',
        description: 'Admin security gate verified for: ' + (body.gated_action || 'administrative access'),
        ip_address: getIp(),
      });

      // Mark OTP event as consumed
      await base44.asServiceRole.entities.SecurityEvent.update(otpEvent.id, {
        severity: 'info',
        description: 'Admin security gate OTP consumed',
      });

      return Response.json({
        verified: true,
        gate_id: gateSession.id,
        expires_at: gateExpires,
        validity_minutes: GATE_VALIDITY_MINUTES,
      });
    }

    // ---- check_gate: verify user has active gate session ----
    if (action === 'check_gate') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

      const gates = await safeFilter(base44, 'SecuritySession', {
        user_id: user.id,
        session_type: 'admin_gate',
        status: 'active',
      });
      const now = new Date();
      const activeGate = gates.find(g => g.expires_at && new Date(g.expires_at) > now);

      return Response.json({
        has_active_gate: !!activeGate,
        expires_at: activeGate?.expires_at || null,
        gate_id: activeGate?.id || null,
      });
    }

    // ---- revoke_gate: manually revoke gate session ----
    if (action === 'revoke_gate') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

      const gates = await safeFilter(base44, 'SecuritySession', {
        user_id: user.id,
        session_type: 'admin_gate',
        status: 'active',
      });
      for (const g of gates) {
        await base44.asServiceRole.entities.SecuritySession.update(g.id, { status: 'revoked' });
      }

      return Response.json({ revoked: true });
    }

    // ---- get_gated_actions: list actions requiring gate ----
    if (action === 'get_gated_actions') {
      return Response.json({ gated_actions: GATED_ACTIONS });
    }

    // ---- admin_list: list all gate sessions (admin only) ----
    if (action === 'admin_list') {
      const user = await base44.auth.me();
      if (!user || !ADMIN_ROLES.includes(user.role)) {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
      }
      const sessions = await base44.asServiceRole.entities.SecuritySession.filter(
        { session_type: 'admin_gate' }, '-created_date', 100
      );
      return Response.json({ sessions });
    }

    return Response.json({ error: 'Unknown action: ' + (action || 'none') }, { status: 400 });
  } catch (error) {
    console.error('adminSecurityGate error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
});
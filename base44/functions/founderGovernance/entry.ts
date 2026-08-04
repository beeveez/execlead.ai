import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// Founder is identified by role (RBAC), never by a hardcoded email address.
const FOUNDER_ROLE = 'founder_root_admin';

// ── Risk scoring weights ──
const ACTION_BASE_RISK: Record<string, number> = {
  delete_profile: 80, remove_administrator: 75, demote_user: 60,
  promote_user: 55, create_administrator: 50, modify_permissions: 50,
  change_security_policies: 65, change_platform_settings: 45,
  configure_ai_services: 40, configure_developer_workspace: 35,
  configure_operations_workspace: 35, configure_enterprise_workspace: 35,
  configure_executive_workspace: 35, export_user_information: 55,
  edit_profile: 30, restore_profile: 25, view_audit_history: 10,
};

const ROLE_MULTIPLIERS: Record<string, number> = {
  founder_root_admin: 1.5, super_admin: 1.5, platform_admin: 1.3,
  admin: 1.2, developer: 1.1, user: 1.0,
};

const PROTECTED_ACTIONS = [
  'edit_profile', 'delete_profile', 'restore_profile',
  'create_administrator', 'remove_administrator', 'promote_user', 'demote_user',
  'modify_permissions', 'change_security_policies', 'change_platform_settings',
  'configure_ai_services', 'configure_developer_workspace', 'configure_operations_workspace',
  'configure_enterprise_workspace', 'configure_executive_workspace',
  'export_user_information', 'view_audit_history',
];

const JUSTIFICATION_CATEGORIES = [
  'personnel_change', 'security_incident', 'compliance_requirement',
  'organizational_restructure', 'user_request', 'data_correction',
  'duplicate_profile_cleanup', 'test_data_cleanup', 'platform_configuration',
  'security_configuration', 'developer_request', 'operations_request',
  'production_support', 'emergency_change', 'system_maintenance',
  'legal_requirement', 'audit_finding', 'other',
];

// ── Helpers ──

async function safeFilter(base44, entityName, filterObj, sort, limit) {
  try {
    return await base44.asServiceRole.entities[entityName].filter(filterObj, sort, limit || 100);
  } catch { return []; }
}

async function getConfig(base44) {
  try {
    const configs = await base44.asServiceRole.entities.GovernanceConfig.list('-created_date', 1);
    return configs[0] || null;
  } catch { return null; }
}

async function isFounder(base44, user) {
  if (!user) return false;
  if (user.role === 'founder_root_admin') return true;
  const config = await getConfig(base44);
  return !!(config && user.id === config.founder_user_id);
}

function calculateRiskScore(action, targetRole, impact) {
  let score = ACTION_BASE_RISK[action] || 40;
  score *= ROLE_MULTIPLIERS[targetRole] || 1.0;
  if (action.includes('security') || action.includes('permissions')) score += 15;
  if (action.includes('export') || action.includes('delete')) score += 10;
  if (action.includes('platform') || action.includes('workspace')) score += 10;
  if (impact?.security_risk === 'high') score += 10;
  if (impact?.data_sensitivity === 'high') score += 5;
  return Math.min(100, Math.round(score));
}

function getRiskLevel(score) {
  if (score <= 25) return 'low';
  if (score <= 50) return 'medium';
  if (score <= 75) return 'high';
  return 'critical';
}

function calculateImpactLevel(impact) {
  let level = 0;
  const au = impact?.affected_users || 0;
  if (au > 100) level = Math.max(level, 3);
  else if (au > 10) level = Math.max(level, 2);
  else if (au > 0) level = Math.max(level, 1);
  if ((impact?.affected_modules || 0) > 5) level = Math.max(level, 2);
  if (impact?.security_risk === 'high') level = Math.max(level, 2);
  if (impact?.security_risk === 'critical') level = Math.max(level, 3);
  if (impact?.data_sensitivity === 'high') level = Math.max(level, 2);
  if (impact?.data_sensitivity === 'critical') level = Math.max(level, 3);
  if (impact?.operational_risk === 'high') level = Math.max(level, 2);
  return ['low', 'medium', 'high', 'critical'][level];
}

function getClientInfo(req) {
  const ua = req.headers.get('user-agent') || '';
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
  let browser = 'unknown';
  if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Safari')) browser = 'Safari';
  else if (ua.includes('Edge')) browser = 'Edge';
  let device = 'desktop';
  if (ua.includes('Mobile')) device = 'mobile';
  if (ua.includes('iPad')) device = 'tablet';
  return { ip, browser, device };
}

async function logAudit(base44, entry) {
  try {
    await base44.asServiceRole.entities.GovernanceAuditLog.create({
      audit_id: crypto.randomUUID(),
      ...entry,
      timestamp: new Date().toISOString(),
    });
  } catch {}
}

async function notifyUser(base44, userId, title, message, metadata) {
  try {
    // Route through the Governance Notification Engine™ — single source of truth
    const users = await safeFilter(base44, 'User', { id: userId }, null, 1);
    const recipient = users[0];
    await base44.asServiceRole.functions.invoke('governanceNotificationEngine', {
      action: 'notify',
      recipient_user_id: userId,
      recipient_email: recipient?.email || '',
      recipient_name: recipient?.full_name || '',
      notification_type: metadata?.notification_type || 'request_submitted',
      subject: title,
      body: message,
      priority: metadata?.priority || 'normal',
      request_id: metadata?.request_id || '',
      request_action: metadata?.request_action || '',
      risk_level: metadata?.risk_level,
      deep_link: '/founder-governance',
      send_email: metadata?.send_email || false,
    });
  } catch {}
}

async function sendFounderEmail(base44, config, subject, body) {
  if (!config?.email_notifications_enabled || !config?.founder_email) return;
  try {
    await base44.asServiceRole.functions.invoke('governanceNotificationEngine', {
      action: 'notify_founder',
      notification_type: 'request_submitted',
      subject,
      body,
      priority: 'high',
      send_email: true,
    });
  } catch {}
}

// ── Main handler ──

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { action } = body;

    // ── init: initialize founder config (one-time, uses email) ──
    if (action === 'init') {
      let user = null;
      try { user = await base44.auth.me(); } catch (_) {}
      if (!user || !['super_admin', 'admin', 'founder_root_admin'].includes(user.role)) {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
      }

      const existing = await getConfig(base44);
      if (existing) {
        return Response.json({ config: { founder_user_id: existing.founder_user_id, founder_name: existing.founder_name, initialized: existing.initialized }, already_initialized: true });
      }

      // Find founder by role — RBAC, never by a hardcoded email.
      const users = await safeFilter(base44, 'User', { role: FOUNDER_ROLE }, null, 1);
      if (users.length === 0) {
        return Response.json({ error: 'No user with the founder_root_admin role was found. Assign the role in the database and retry.' }, { status: 404 });
      }
      const founder = users[0];
      const config = await base44.asServiceRole.entities.GovernanceConfig.create({
        founder_user_id: founder.id,
        founder_email: founder.email,
        founder_name: founder.full_name || founder.email,
        founder_role_name: 'Founder Root Administrator',
        initialized: true,
        email_notifications_enabled: true,
        violation_threshold: 3,
        request_expiry_hours: 72,
        updated_at: new Date().toISOString(),
      });

      return Response.json({ config: { founder_user_id: founder.id, founder_name: config.founder_name, initialized: true }, created: true });
    }

    // ── is_founder: check if current user is the Founder Root Administrator ──
    if (action === 'is_founder') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
      const founder = await isFounder(base44, user);
      const config = await getConfig(base44);
      return Response.json({ is_founder: founder, user_id: user.id, role: user.role, config_exists: !!config });
    }

    // ── submit_request: admin submits a governance approval request ──
    if (action === 'submit_request') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

      const config = await getConfig(base44);
      if (!config) return Response.json({ error: 'Governance system not initialized. Contact the Founder.' }, { status: 500 });

      // Founder doesn't need approval — they can execute directly
      if (await isFounder(base44, user)) {
        return Response.json({ error: 'Founder Root Administrator does not need approval. Execute the action directly.' }, { status: 400 });
      }

      // Validate action
      if (!PROTECTED_ACTIONS.includes(body.action)) {
        return Response.json({ error: 'Unknown protected action.' }, { status: 400 });
      }

      // Validate justification category
      if (!JUSTIFICATION_CATEGORIES.includes(body.justification_category)) {
        return Response.json({ error: 'Invalid justification category.' }, { status: 400 });
      }

      // Validate business justification (50-1000 chars)
      const justification = (body.business_justification || '').trim();
      if (justification.length < 50) {
        return Response.json({ error: 'Business justification must be at least 50 characters.' }, { status: 400 });
      }
      if (justification.length > 1000) {
        return Response.json({ error: 'Business justification must not exceed 1000 characters.' }, { status: 400 });
      }

      // If category is "other", require other_explanation
      if (body.justification_category === 'other' && !(body.other_explanation || '').trim()) {
        return Response.json({ error: 'Additional explanation required when category is "Other".' }, { status: 400 });
      }

      // Calculate risk score
      const impact = body.impact_assessment || {};
      const riskScore = calculateRiskScore(body.action, body.target_user_role, impact);
      const riskLevel = getRiskLevel(riskScore);
      const impactLevel = calculateImpactLevel(impact);

      const clientInfo = getClientInfo(req);
      const now = new Date();
      const expiresAt = new Date(now.getTime() + (config.request_expiry_hours || 72) * 3600000);

      const requestId = crypto.randomUUID();

      const request = await base44.asServiceRole.entities.GovernanceRequest.create({
        request_id: requestId,
        requester_id: user.id,
        requester_name: user.full_name || user.email,
        requester_email: user.email,
        requester_role: user.role,
        requester_department: body.requester_department || '',
        requester_workspace: body.requester_workspace || '',
        action: body.action,
        target_user_id: body.target_user_id || '',
        target_user_name: body.target_user_name || '',
        target_user_email: body.target_user_email || '',
        target_user_role: body.target_user_role || '',
        justification_category: body.justification_category,
        business_justification: justification,
        other_explanation: body.other_explanation || '',
        risk_score: riskScore,
        risk_level: riskLevel,
        impact_level: impactLevel,
        impact_assessment_json: JSON.stringify(impact),
        current_values_json: JSON.stringify(body.current_values || {}),
        requested_values_json: JSON.stringify(body.requested_values || {}),
        supporting_evidence: body.supporting_evidence || '',
        status: 'pending',
        submitted_at: now.toISOString(),
        ip_address: clientInfo.ip,
        browser: clientInfo.browser,
        device: clientInfo.device,
        workspace: body.requester_workspace || '',
        expires_at: expiresAt.toISOString(),
        expired: false,
      });

      // Notify founder
      const riskEmoji = riskLevel === 'critical' ? '🔴' : riskLevel === 'high' ? '🟠' : riskLevel === 'medium' ? '🟡' : '🟢';
      await notifyUser(base44, config.founder_user_id,
        `${riskEmoji} New Governance Request: ${body.action.replace(/_/g, ' ')}`,
        `${user.full_name || user.email} requested: ${body.action.replace(/_/g, ' ')}\nRisk: ${riskLevel} (${riskScore}/100)\nImpact: ${impactLevel}\nCategory: ${body.justification_category.replace(/_/g, ' ')}\nJustification: ${justification.substring(0, 200)}...`,
        { request_id: requestId, risk_level: riskLevel, impact_level: impactLevel }
      );

      // Email notification for high/critical/security requests
      if (['high', 'critical'].includes(riskLevel) || body.action.includes('security')) {
        await sendFounderEmail(base44, config,
          `🚨 Governance Approval Required: ${body.action.replace(/_/g, ' ')}`,
          `Request ID: ${requestId}\nRequester: ${user.full_name || user.email}\nAction: ${body.action.replace(/_/g, ' ')}\nRisk: ${riskLevel} (${riskScore}/100)\nImpact: ${impactLevel}\nCategory: ${body.justification_category.replace(/_/g, ' ')}\n\nBusiness Justification:\n${justification}\n\nReview in the Founder Governance & Approval Center.`
        );
      }

      return Response.json({ request, risk_score: riskScore, risk_level: riskLevel, impact_level: impactLevel });
    }

    // ── list_requests: filtered list of governance requests ──
    if (action === 'list_requests') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

      const status = body.status || 'pending';
      const filter: any = {};
      if (status !== 'all') filter.status = status;

      // Non-founders only see their own requests
      if (!(await isFounder(base44, user))) {
        filter.requester_id = user.id;
      }

      const requests = await base44.asServiceRole.entities.GovernanceRequest.filter(filter, '-submitted_at', body.limit || 100);
      return Response.json({ requests, count: requests.length });
    }

    // ── get_request: single request with details ──
    if (action === 'get_request') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
      if (!body.request_id) return Response.json({ error: 'request_id required' }, { status: 400 });

      const requests = await safeFilter(base44, 'GovernanceRequest', { request_id: body.request_id }, '-submitted_at', 1);
      if (requests.length === 0) return Response.json({ error: 'Request not found' }, { status: 404 });
      const request = requests[0];

      // Non-founders can only see their own
      if (!(await isFounder(base44, user)) && request.requester_id !== user.id) {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
      }

      return Response.json({ request });
    }

    // ── approve: founder approves a request ──
    if (action === 'approve') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
      if (!(await isFounder(base44, user))) {
        await logAudit(base44, {
          request_id: body.request_id || '',
          requester_id: user.id, requester_name: user.full_name || user.email,
          approver_id: user.id, approver_name: user.full_name || user.email,
          action: 'approve_attempt', decision: 'unauthorized_attempt',
          decision_notes: 'Non-founder attempted to approve a request',
          risk_score: 0, risk_level: 'critical', impact_level: 'high',
        });
        return Response.json({ error: 'Forbidden — only the Founder Root Administrator may approve requests.' }, { status: 403 });
      }

      if (!body.request_id) return Response.json({ error: 'request_id required' }, { status: 400 });
      const notes = (body.decision_notes || '').trim();
      if (notes.length < 10) {
        return Response.json({ error: 'Decision notes must be at least 10 characters.' }, { status: 400 });
      }

      const requests = await safeFilter(base44, 'GovernanceRequest', { request_id: body.request_id }, null, 1);
      if (requests.length === 0) return Response.json({ error: 'Request not found' }, { status: 404 });
      const request = requests[0];
      if (request.status !== 'pending') {
        return Response.json({ error: `Request is already ${request.status}.` }, { status: 400 });
      }

      const now = new Date();
      const duration = now.getTime() - new Date(request.submitted_at).getTime();

      await base44.asServiceRole.entities.GovernanceRequest.update(request.id, {
        status: 'approved',
        approver_id: user.id,
        approver_name: user.full_name || user.email,
        decision_notes: notes,
        decision_reason: body.decision_reason || 'Approved',
        decided_at: now.toISOString(),
        approval_duration_ms: duration,
      });

      // Immutable audit log
      await logAudit(base44, {
        request_id: request.request_id,
        requester_id: request.requester_id, requester_name: request.requester_name,
        requester_email: request.requester_email,
        approver_id: user.id, approver_name: user.full_name || user.email,
        action: request.action,
        target_user_id: request.target_user_id, target_user_name: request.target_user_name,
        justification_category: request.justification_category,
        business_justification: request.business_justification,
        decision: 'approved',
        decision_notes: notes,
        risk_score: request.risk_score, risk_level: request.risk_level, impact_level: request.impact_level,
        old_values_json: request.current_values_json,
        new_values_json: request.requested_values_json,
        approval_duration_ms: duration,
        ip_address: request.ip_address, browser: request.browser, device: request.device,
        workspace: request.workspace,
      });

      // Notify requester
      await notifyUser(base44, request.requester_id,
        '✅ Governance Request Approved',
        `Your request "${request.action.replace(/_/g, ' ')}" has been approved by the Founder.\nDecision notes: ${notes}`,
        { request_id: request.request_id, decision: 'approved' }
      );

      return Response.json({ approved: true, request_id: request.request_id });
    }

    // ── reject: founder rejects a request ──
    if (action === 'reject') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
      if (!(await isFounder(base44, user))) {
        return Response.json({ error: 'Forbidden — only the Founder Root Administrator may reject requests.' }, { status: 403 });
      }
      if (!body.request_id) return Response.json({ error: 'request_id required' }, { status: 400 });
      const reason = (body.decision_notes || '').trim();
      if (reason.length < 10) {
        return Response.json({ error: 'Rejection reason must be at least 10 characters.' }, { status: 400 });
      }

      const requests = await safeFilter(base44, 'GovernanceRequest', { request_id: body.request_id }, null, 1);
      if (requests.length === 0) return Response.json({ error: 'Request not found' }, { status: 404 });
      const request = requests[0];
      if (request.status !== 'pending') {
        return Response.json({ error: `Request is already ${request.status}.` }, { status: 400 });
      }

      const now = new Date();
      const duration = now.getTime() - new Date(request.submitted_at).getTime();

      await base44.asServiceRole.entities.GovernanceRequest.update(request.id, {
        status: 'rejected',
        approver_id: user.id,
        approver_name: user.full_name || user.email,
        decision_notes: reason,
        decision_reason: body.decision_reason || 'Rejected',
        decided_at: now.toISOString(),
        approval_duration_ms: duration,
      });

      await logAudit(base44, {
        request_id: request.request_id,
        requester_id: request.requester_id, requester_name: request.requester_name,
        requester_email: request.requester_email,
        approver_id: user.id, approver_name: user.full_name || user.email,
        action: request.action,
        target_user_id: request.target_user_id, target_user_name: request.target_user_name,
        justification_category: request.justification_category,
        business_justification: request.business_justification,
        decision: 'rejected',
        decision_notes: reason,
        risk_score: request.risk_score, risk_level: request.risk_level, impact_level: request.impact_level,
        approval_duration_ms: duration,
        ip_address: request.ip_address, browser: request.browser, device: request.device,
        workspace: request.workspace,
      });

      await notifyUser(base44, request.requester_id,
        '❌ Governance Request Rejected',
        `Your request "${request.action.replace(/_/g, ' ')}" has been rejected.\nReason: ${reason}`,
        { request_id: request.request_id, decision: 'rejected' }
      );

      return Response.json({ rejected: true, request_id: request.request_id });
    }

    // ── request_revision: founder returns request for revision ──
    if (action === 'request_revision') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
      if (!(await isFounder(base44, user))) {
        return Response.json({ error: 'Forbidden — only the Founder Root Administrator may request revisions.' }, { status: 403 });
      }
      if (!body.request_id) return Response.json({ error: 'request_id required' }, { status: 400 });
      const notes = (body.decision_notes || '').trim();
      if (notes.length < 10) {
        return Response.json({ error: 'Revision notes must be at least 10 characters.' }, { status: 400 });
      }

      const requests = await safeFilter(base44, 'GovernanceRequest', { request_id: body.request_id }, null, 1);
      if (requests.length === 0) return Response.json({ error: 'Request not found' }, { status: 404 });
      const request = requests[0];
      if (request.status !== 'pending') {
        return Response.json({ error: `Request is already ${request.status}.` }, { status: 400 });
      }

      const now = new Date();
      await base44.asServiceRole.entities.GovernanceRequest.update(request.id, {
        status: 'revision_requested',
        approver_id: user.id,
        approver_name: user.full_name || user.email,
        decision_notes: notes,
        decision_reason: 'Revision requested',
        decided_at: now.toISOString(),
        approval_duration_ms: now.getTime() - new Date(request.submitted_at).getTime(),
      });

      await notifyUser(base44, request.requester_id,
        '🔄 Governance Request — Revision Requested',
        `The Founder has requested revision on your request "${request.action.replace(/_/g, ' ')}".\nNotes: ${notes}`,
        { request_id: request.request_id, decision: 'revision_requested' }
      );

      return Response.json({ revision_requested: true, request_id: request.request_id });
    }

    // ── list_audit_log: view immutable audit trail ──
    if (action === 'list_audit_log') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
      // Only founder and admins can view audit log
      if (!(await isFounder(base44, user)) && !['super_admin', 'platform_admin', 'admin', 'developer'].includes(user.role)) {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
      }

      const entries = await base44.asServiceRole.entities.GovernanceAuditLog.filter({}, '-timestamp', body.limit || 100);
      return Response.json({ entries, count: entries.length });
    }

    // ── get_analytics: governance analytics ──
    if (action === 'get_analytics') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
      if (!(await isFounder(base44, user)) && !['super_admin', 'platform_admin', 'admin', 'developer'].includes(user.role)) {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
      }

      const all = await base44.asServiceRole.entities.GovernanceRequest.list('-submitted_at', 500);
      const approved = all.filter(r => r.status === 'approved');
      const rejected = all.filter(r => r.status === 'rejected');
      const pending = all.filter(r => r.status === 'pending');
      const critical = all.filter(r => r.risk_level === 'critical');
      const highRisk = all.filter(r => r.risk_level === 'high');

      const byCategory: Record<string, number> = {};
      for (const r of all) {
        byCategory[r.justification_category] = (byCategory[r.justification_category] || 0) + 1;
      }

      const byWorkspace: Record<string, number> = {};
      for (const r of all) {
        const ws = r.workspace || 'unspecified';
        byWorkspace[ws] = (byWorkspace[ws] || 0) + 1;
      }

      const durations = approved.map(r => r.approval_duration_ms || 0).filter(d => d > 0);
      const avgDuration = durations.length > 0 ? Math.round(durations.reduce((s, d) => s + d, 0) / durations.length) : 0;

      const unauthorized = await base44.asServiceRole.entities.GovernanceAuditLog.filter({ decision: 'unauthorized_attempt' }, '-timestamp', 100);

      return Response.json({
        total_requests: all.length,
        pending: pending.length,
        approved: approved.length,
        rejected: rejected.length,
        approval_rate: all.length > 0 ? Math.round((approved.length / all.length) * 100) : 0,
        rejection_rate: all.length > 0 ? Math.round((rejected.length / all.length) * 100) : 0,
        avg_approval_duration_ms: avgDuration,
        critical_requests: critical.length,
        high_risk_requests: highRisk.length,
        unauthorized_attempts: unauthorized.length,
        by_category: byCategory,
        by_workspace: byWorkspace,
      });
    }

    // ── check_authorization: server-side authorization check ──
    if (action === 'check_authorization') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

      const founder = await isFounder(base44, user);
      if (founder) {
        return Response.json({ authorized: true, reason: 'Founder Root Administrator — direct access' });
      }

      // Non-founder: check if they have a pending request for this action
      const existing = await safeFilter(base44, 'GovernanceRequest', {
        requester_id: user.id,
        action: body.action,
        status: 'pending',
      }, '-submitted_at', 1);

      if (existing.length > 0) {
        return Response.json({ authorized: false, reason: 'Request pending approval', request_id: existing[0].request_id });
      }

      return Response.json({
        authorized: false,
        reason: 'This is a protected operation. Submit a governance approval request first.',
        requires_approval: true,
      });
    }

    return Response.json({ error: 'Unknown action: ' + (action || 'none') }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
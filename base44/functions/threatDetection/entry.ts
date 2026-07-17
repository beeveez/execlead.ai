import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

const ADMIN_ROLES = ['admin', 'super_admin', 'platform_admin', 'developer'];

const THREAT_TYPES = {
  IMPOSSIBLE_TRAVEL: { severity: 'high', label: 'Impossible Travel', description: 'Login from geographically distant locations in a short time' },
  CREDENTIAL_STUFFING: { severity: 'high', label: 'Credential Stuffing', description: 'Multiple failed login attempts across accounts' },
  EXCESSIVE_FAILED_LOGINS: { severity: 'medium', label: 'Excessive Failed Logins', description: 'Abnormal number of failed authentication attempts' },
  SUSPICIOUS_ADMIN_ACTIVITY: { severity: 'high', label: 'Suspicious Admin Activity', description: 'Unusual administrative actions detected' },
  EXCESSIVE_AI_REQUESTS: { severity: 'medium', label: 'Excessive AI Requests', description: 'Abnormally high AI API usage' },
  API_ABUSE: { severity: 'high', label: 'API Abuse', description: 'Suspicious API call patterns' },
  BULK_EXPORT: { severity: 'medium', label: 'Bulk Export Attempt', description: 'Large volume data export detected' },
  CROSS_TENANT_ACCESS: { severity: 'critical', label: 'Cross-Tenant Access Attempt', description: 'Attempted access to data outside user tenant' },
  UNUSUAL_FILE_UPLOAD: { severity: 'medium', label: 'Unusual File Upload', description: 'Suspicious file upload pattern detected' },
  HIGH_RISK_ACCOUNT_CHANGE: { severity: 'high', label: 'High-Risk Account Change', description: 'Critical account modification detected' },
};

async function safeFilter(base44, entityName, filterObj, sort, limit) {
  try {
    return await base44.asServiceRole.entities[entityName].filter(filterObj, sort, limit || 100);
  } catch {
    return [];
  }
}

async function createThreatEvent(base44, type, userId, userName, details) {
  const config = THREAT_TYPES[type];
  if (!config) return;
  try {
    await base44.asServiceRole.entities.SecurityEvent.create({
      user_id: userId || 'system',
      user_name: userName || 'System',
      event_type: 'threat_' + type.toLowerCase(),
      severity: config.severity,
      description: config.label + ': ' + (details.description || config.description),
      ip_address: details.ip_address || 'unknown',
      metadata_json: JSON.stringify({
        threat_type: type,
        threat_label: config.label,
        evidence: details.evidence || {},
        detected_at: new Date().toISOString(),
        ...details,
      }),
    });
  } catch {}
}

// ---- Threat Detection Rules ----

async function detectImpossibleTravel(base44) {
  const threats = [];
  const oneHourAgo = new Date(Date.now() - 3600000).toISOString();

  try {
    const sessions = await safeFilter(base44, 'SecuritySession', {
      status: 'active',
      created_date: { $gte: oneHourAgo },
    }, '-created_date', 200);

    const byUser = {};
    for (const s of sessions) {
      if (!s.user_id) continue;
      if (!byUser[s.user_id]) byUser[s.user_id] = [];
      byUser[s.user_id].push(s);
    }

    for (const [userId, userSessions] of Object.entries(byUser)) {
      if (userSessions.length < 2) continue;
      const sorted = userSessions.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
      for (let i = 1; i < sorted.length; i++) {
        const prev = sorted[i - 1];
        const curr = sorted[i];
        if (prev.location && curr.location && prev.location !== curr.location) {
          const timeDiff = new Date(curr.created_date) - new Date(prev.created_date);
          if (timeDiff < 1800000) { // 30 minutes
            threats.push({
              type: 'IMPOSSIBLE_TRAVEL',
              user_id: userId,
              user_name: prev.user_name,
              details: {
                description: `Login from ${prev.location} then ${curr.location} within 30 minutes`,
                ip_address: curr.ip_address,
                evidence: { from: prev.location, to: curr.location, time_diff_ms: timeDiff },
              },
            });
          }
        }
      }
    }
  } catch {}

  return threats;
}

async function detectExcessiveFailedLogins(base44) {
  const threats = [];
  const oneHourAgo = new Date(Date.now() - 3600000).toISOString();

  try {
    const failedEvents = await safeFilter(base44, 'SecurityEvent', {
      event_type: 'login_failed',
      created_date: { $gte: oneHourAgo },
    }, '-created_date', 500);

    const byUser = {};
    for (const e of failedEvents) {
      if (!e.user_id) continue;
      if (!byUser[e.user_id]) byUser[e.user_id] = [];
      byUser[e.user_id].push(e);
    }

    for (const [userId, events] of Object.entries(byUser)) {
      if (events.length >= 10) {
        threats.push({
          type: 'EXCESSIVE_FAILED_LOGINS',
          user_id: userId,
          user_name: events[0].user_name,
          details: {
            description: `${events.length} failed login attempts in 1 hour`,
            ip_address: events[0].ip_address,
            evidence: { failed_count: events.length },
          },
        });
      }
      if (events.length >= 20) {
        threats.push({
          type: 'CREDENTIAL_STUFFING',
          user_id: userId,
          user_name: events[0].user_name,
          details: {
            description: `${events.length} failed logins — possible credential stuffing`,
            ip_address: events[0].ip_address,
            evidence: { failed_count: events.length },
          },
        });
      }
    }
  } catch {}

  return threats;
}

async function detectExcessiveAIRequests(base44) {
  const threats = [];
  const oneHourAgo = new Date(Date.now() - 3600000).toISOString();

  try {
    const aiTraces = await safeFilter(base44, 'AIRequestTrace', {
      created_date: { $gte: oneHourAgo },
    }, '-created_date', 500);

    const byUser = {};
    for (const t of aiTraces) {
      if (!t.user_id) continue;
      if (!byUser[t.user_id]) byUser[t.user_id] = [];
      byUser[t.user_id].push(t);
    }

    for (const [userId, traces] of Object.entries(byUser)) {
      if (traces.length >= 100) {
        threats.push({
          type: 'EXCESSIVE_AI_REQUESTS',
          user_id: userId,
          user_name: traces[0].user_name,
          details: {
            description: `${traces.length} AI requests in 1 hour`,
            ip_address: 'unknown',
            evidence: { request_count: traces.length },
          },
        });
      }
    }
  } catch {}

  return threats;
}

async function detectBulkExports(base44) {
  const threats = [];
  const oneHourAgo = new Date(Date.now() - 3600000).toISOString();

  try {
    const exports = await safeFilter(base44, 'SecurityEvent', {
      event_type: 'data_export',
      created_date: { $gte: oneHourAgo },
    }, '-created_date', 100);

    const byUser = {};
    for (const e of exports) {
      if (!e.user_id) continue;
      if (!byUser[e.user_id]) byUser[e.user_id] = [];
      byUser[e.user_id].push(e);
    }

    for (const [userId, events] of Object.entries(byUser)) {
      if (events.length >= 5) {
        threats.push({
          type: 'BULK_EXPORT',
          user_id: userId,
          user_name: events[0].user_name,
          details: {
            description: `${events.length} data exports in 1 hour`,
            ip_address: events[0].ip_address,
            evidence: { export_count: events.length },
          },
        });
      }
    }
  } catch {}

  return threats;
}

async function detectSuspiciousAdminActivity(base44) {
  const threats = [];
  const oneHourAgo = new Date(Date.now() - 3600000).toISOString();

  try {
    const adminEvents = await safeFilter(base44, 'SecurityEvent', {
      event_type: { $in: ['admin_gate_verified', 'user_role_changed', 'security_policy_changed', 'scim_config_changed'] },
      created_date: { $gte: oneHourAgo },
    }, '-created_date', 100);

    const byUser = {};
    for (const e of adminEvents) {
      if (!e.user_id) continue;
      if (!byUser[e.user_id]) byUser[e.user_id] = [];
      byUser[e.user_id].push(e);
    }

    for (const [userId, events] of Object.entries(byUser)) {
      if (events.length >= 5) {
        threats.push({
          type: 'SUSPICIOUS_ADMIN_ACTIVITY',
          user_id: userId,
          user_name: events[0].user_name,
          details: {
            description: `${events.length} admin actions in 1 hour`,
            ip_address: events[0].ip_address,
            evidence: { action_count: events.length, actions: events.map(e => e.event_type) },
          },
        });
      }
    }
  } catch {}

  return threats;
}

async function detectCrossTenantAccess(base44) {
  const threats = [];
  const oneDayAgo = new Date(Date.now() - 86400000).toISOString();

  try {
    const blockedEvents = await safeFilter(base44, 'SecurityEvent', {
      event_type: 'cross_tenant_access_blocked',
      created_date: { $gte: oneDayAgo },
    }, '-created_date', 100);

    for (const e of blockedEvents) {
      threats.push({
        type: 'CROSS_TENANT_ACCESS',
        user_id: e.user_id,
        user_name: e.user_name,
        details: {
          description: 'Cross-tenant access attempt blocked',
          ip_address: e.ip_address,
          evidence: { original_event: e.description },
        },
      });
    }
  } catch {}

  return threats;
}

// ---- Main Handler ----

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { action } = body;

    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // ---- analyze: run all threat detection rules ----
    if (action === 'analyze') {
      if (!ADMIN_ROLES.includes(user.role)) {
        return Response.json({ error: 'Forbidden — admin access required' }, { status: 403 });
      }

      const allThreats = [
        ...(await detectImpossibleTravel(base44)),
        ...(await detectExcessiveFailedLogins(base44)),
        ...(await detectExcessiveAIRequests(base44)),
        ...(await detectBulkExports(base44)),
        ...(await detectSuspiciousAdminActivity(base44)),
        ...(await detectCrossTenantAccess(base44)),
      ];

      // Persist new threat events (deduplicate by not creating if similar exists in last hour)
      const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
      const existingThreats = await safeFilter(base44, 'SecurityEvent', {
        event_type: { $regex: 'threat_' },
        created_date: { $gte: oneHourAgo },
      }, '-created_date', 500);

      const existingKeys = new Set(existingThreats.map(e => {
        let meta = {};
        try { meta = JSON.parse(e.metadata_json || '{}'); } catch {}
        return `${meta.threat_type}_${e.user_id}`;
      }));

      let newThreatCount = 0;
      for (const t of allThreats) {
        const key = `${t.type}_${t.user_id}`;
        if (existingKeys.has(key)) continue;
        await createThreatEvent(base44, t.type, t.user_id, t.user_name, t.details);
        newThreatCount++;
      }

      return Response.json({
        analyzed: true,
        total_threats: allThreats.length,
        new_threats: newThreatCount,
        threats: allThreats.map(t => ({
          type: t.type,
          label: THREAT_TYPES[t.type]?.label,
          severity: THREAT_TYPES[t.type]?.severity,
          user_id: t.user_id,
          user_name: t.user_name,
          description: t.details.description,
        })),
      });
    }

    // ---- get_threats: get detected threats (user sees own, admin sees all) ----
    if (action === 'get_threats') {
      const isAdmin = ADMIN_ROLES.includes(user.role);
      const filter = isAdmin ? {} : { user_id: user.id };
      const threats = await safeFilter(base44, 'SecurityEvent', {
        event_type: { $regex: 'threat_' },
        ...filter,
      }, '-created_date', 100);

      return Response.json({ threats });
    }

    // ---- get_score: compute threat score ----
    if (action === 'get_score') {
      const isAdmin = ADMIN_ROLES.includes(user.role);
      const oneDayAgo = new Date(Date.now() - 86400000).toISOString();
      const filter = isAdmin ? {} : { user_id: user.id };

      const recentThreats = await safeFilter(base44, 'SecurityEvent', {
        event_type: { $regex: 'threat_' },
        created_date: { $gte: oneDayAgo },
        ...filter,
      }, '-created_date', 200);

      let score = 100;
      const severityWeights = { critical: 25, high: 15, medium: 8, low: 3 };
      for (const t of recentThreats) {
        score -= severityWeights[t.severity] || 5;
      }
      score = Math.max(0, score);

      const bySeverity = { critical: 0, high: 0, medium: 0, low: 0 };
      for (const t of recentThreats) {
        bySeverity[t.severity] = (bySeverity[t.severity] || 0) + 1;
      }

      return Response.json({
        threat_score: score,
        total_threats_24h: recentThreats.length,
        by_severity: bySeverity,
        level: score >= 80 ? 'safe' : score >= 60 ? 'elevated' : score >= 40 ? 'high' : 'critical',
      });
    }

    // ---- report_threat: manually report a suspicious activity ----
    if (action === 'report_threat') {
      const { threat_type, description, evidence } = body;
      if (!threat_type) return Response.json({ error: 'threat_type required' }, { status: 400 });

      await createThreatEvent(base44, threat_type, user.id, user.full_name, {
        description: description || 'Manually reported threat',
        ip_address: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown',
        evidence: evidence || {},
        reported_by_user: true,
      });

      return Response.json({ reported: true });
    }

    return Response.json({ error: 'Unknown action: ' + (action || 'none') }, { status: 400 });
  } catch (error) {
    console.error('threatDetection error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
});
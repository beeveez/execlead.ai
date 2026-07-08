import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const ADMIN_ROLES = ['admin', 'super_admin', 'platform_admin'];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { action } = body;

    // Dashboard stats — available to all authenticated users
    if (action === 'dashboard_stats') {
      const isAdmin = ADMIN_ROLES.includes(user.role);
      const scope = isAdmin ? {} : { user_id: user.id };

      try {
        const [sessions, events, incidents, verifications] = await Promise.all([
          base44.asServiceRole.entities.SecuritySession.filter({ status: 'active' }),
          base44.asServiceRole.entities.SecurityEvent.list('-created_date', 200),
          base44.asServiceRole.entities.SecurityIncident.filter({}),
          isAdmin
            ? base44.asServiceRole.entities.IdentityVerification.filter({})
            : Promise.resolve([]),
        ]);

        const failedLogins = events.filter(e => e.event_type === 'failed_login').length;
        const blockedAttacks = events.filter(e => e.action_taken === 'blocked').length;
        const riskEvents = events.filter(e => ['high', 'critical'].includes(e.severity)).length;
        const verifiedUsers = verifications.filter(v => v.identity_verified).length;
        const pendingReviews = verifications.filter(v => ['submitted', 'under_review'].includes(v.identity_status)).length;
        const openIncidents = incidents.filter(i => i.status === 'open' || i.status === 'investigating').length;

        return Response.json({
          activeSessions: sessions.length,
          blockedAttacks,
          failedLogins,
          riskEvents,
          verifiedUsers,
          pendingReviews,
          openIncidents,
        });
      } catch (error) {
        return Response.json({
          activeSessions: 0, blockedAttacks: 0, failedLogins: 0, riskEvents: 0,
          verifiedUsers: 0, pendingReviews: 0, openIncidents: 0,
        });
      }
    }

    // Log a security event — available to all authenticated users
    if (action === 'log_event') {
      const { eventType, severity, description, actionTaken, metadata } = body;
      if (!eventType || !description) {
        return Response.json({ error: 'eventType and description are required' }, { status: 400 });
      }
      const event = await base44.entities.SecurityEvent.create({
        user_id: user.id,
        user_name: user.full_name || user.email,
        event_type: eventType,
        severity: severity || 'info',
        description,
        action_taken: actionTaken || 'logged',
        metadata_json: metadata ? JSON.stringify(metadata) : '',
      });
      return Response.json({ success: true, event });
    }

    // Admin-only: list all sessions
    if (action === 'list_sessions') {
      if (!ADMIN_ROLES.includes(user.role)) {
        return Response.json({ error: 'Forbidden — admin access required' }, { status: 403 });
      }
      const sessions = await base44.asServiceRole.entities.SecuritySession.list('-last_activity', 200);
      return Response.json({ sessions });
    }

    // Admin-only: terminate a session
    if (action === 'terminate_session') {
      const { sessionId } = body;
      if (!sessionId) return Response.json({ error: 'sessionId is required' }, { status: 400 });

      const session = await base44.asServiceRole.entities.SecuritySession.get(sessionId);
      if (!session) return Response.json({ error: 'Session not found' }, { status: 404 });

      // Users can terminate their own sessions; admins can terminate any
      if (session.user_id !== user.id && !ADMIN_ROLES.includes(user.role)) {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
      }

      await base44.asServiceRole.entities.SecuritySession.update(sessionId, { status: 'terminated' });
      await base44.asServiceRole.entities.SecurityEvent.create({
        user_id: session.user_id,
        user_name: session.user_name,
        event_type: 'session_terminated',
        severity: 'medium',
        description: `Session terminated by ${user.full_name || user.email}: ${session.device_name}`,
        action_taken: 'logged',
      });
      return Response.json({ success: true });
    }

    // Admin-only: list all security events
    if (action === 'list_events') {
      if (!ADMIN_ROLES.includes(user.role)) {
        return Response.json({ error: 'Forbidden — admin access required' }, { status: 403 });
      }
      const events = await base44.asServiceRole.entities.SecurityEvent.list('-created_date', 200);
      return Response.json({ events });
    }

    // Admin-only: list all incidents
    if (action === 'list_incidents') {
      if (!ADMIN_ROLES.includes(user.role)) {
        return Response.json({ error: 'Forbidden — admin access required' }, { status: 403 });
      }
      const incidents = await base44.asServiceRole.entities.SecurityIncident.list('-created_date', 100);
      return Response.json({ incidents });
    }

    // Admin-only: update an incident
    if (action === 'update_incident') {
      if (!ADMIN_ROLES.includes(user.role)) {
        return Response.json({ error: 'Forbidden — admin access required' }, { status: 403 });
      }
      const { incidentId, updates } = body;
      if (!incidentId) return Response.json({ error: 'incidentId is required' }, { status: 400 });

      const finalUpdates = { ...updates };
      if (updates.status === 'resolved' || updates.status === 'postmortem') {
        finalUpdates.resolved_date = new Date().toISOString();
      }
      const updated = await base44.asServiceRole.entities.SecurityIncident.update(incidentId, finalUpdates);
      return Response.json({ success: true, incident: updated });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
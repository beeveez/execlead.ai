import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { resolveAuthoritativeOrgAccess } from '../../shared/authoritativeOrgAccess.ts';

// ============================================================
// AI OPERATIONS — SECURE DATA RETRIEVAL
// Returns scoped UsageLog records for the AI Operations Center.
//   - Platform admins / super admins / developers → global
//   - Enterprise admins / managers → organization-scoped
//   - Everyone else → personal (own logs only)
// All reads use the service role so admins can see aggregate data;
// the scope is enforced HERE based on the caller's identity.
// ============================================================

const ADMIN_ROLES = ['super_admin', 'platform_admin', 'developer', 'security_admin', 'finance'];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const role = (user.role || 'customer').toLowerCase();
    const isGlobalAdmin = ADMIN_ROLES.includes(role);
    const orgAccess = isGlobalAdmin
      ? null
      : await resolveAuthoritativeOrgAccess(base44, user, { allowManagers: true });
    const scope = isGlobalAdmin ? 'global' : orgAccess ? 'organization' : 'personal';
    const orgId = orgAccess?.orgId || '';
    const effectiveRole = isGlobalAdmin ? role : orgAccess?.isOwner ? 'organization_owner' : orgAccess?.membership?.role || 'customer';

    const LIMIT = 1500;
    let logs: any[] = [];

    if (scope === 'global') {
      logs = await base44.asServiceRole.entities.UsageLog.list('-created_date', LIMIT);
    } else if (scope === 'organization' && orgId) {
      logs = await base44.asServiceRole.entities.UsageLog.filter({ organization_id: orgId }, '-created_date', LIMIT);
      if (logs.length === 0) {
        logs = await base44.asServiceRole.entities.UsageLog.filter({ created_by_id: user.id }, '-created_date', LIMIT);
      }
    } else {
      logs = await base44.asServiceRole.entities.UsageLog.filter({ created_by_id: user.id }, '-created_date', LIMIT);
    }

    return Response.json({
      success: true,
      scope,
      effectiveRole,
      orgId,
      orgName: orgAccess?.organization?.name || '',
      logs,
      userName: user.full_name || user.email || '',
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
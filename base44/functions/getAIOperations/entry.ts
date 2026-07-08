import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

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
const ORG_ADMIN_ROLES = ['enterprise_admin', 'organization_owner'];
const ORG_MEMBER_ROLES = ['enterprise_admin', 'organization_owner', 'enterprise_manager', 'enterprise_user'];

const CUSTOM_ROLE_MAP: Record<string, string> = {
  'organization owner': 'organization_owner',
  'enterprise admin': 'enterprise_admin',
  'enterprise manager': 'enterprise_manager',
  'enterprise user': 'enterprise_user',
};

function resolveScope(userRole: string, profile: any): { scope: string; orgId: string; effectiveRole: string } {
  const role = (userRole || 'customer').toLowerCase();
  if (ADMIN_ROLES.includes(role)) {
    return { scope: 'global', orgId: '', effectiveRole: role };
  }
  if (profile?.organization_id) {
    const custom = CUSTOM_ROLE_MAP[(profile.custom_role || '').toLowerCase()];
    if (custom && ORG_MEMBER_ROLES.includes(custom)) {
      return { scope: ORG_ADMIN_ROLES.includes(custom) ? 'organization' : 'organization', orgId: profile.organization_id, effectiveRole: custom };
    }
    return { scope: 'organization', orgId: profile.organization_id, effectiveRole: 'enterprise_user' };
  }
  return { scope: 'personal', orgId: '', effectiveRole: 'customer' };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const profiles = await base44.asServiceRole.entities.UserProfile.filter({ created_by_id: user.id });
    const profile = profiles?.[0] || null;
    const { scope, orgId, effectiveRole } = resolveScope(user.role, profile);

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
      orgName: profile?.organization_name || '',
      logs,
      userName: user.full_name || user.email || '',
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
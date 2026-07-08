import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = user.role || 'customer';

    // Fetch the user's profile to get organization context
    let orgId = '';
    try {
      const profiles = await base44.asServiceRole.entities.UserProfile.filter({ created_by_id: user.id });
      if (profiles.length > 0) {
        orgId = profiles[0].organization_id || '';
      }
    } catch (e) {
      // Profile lookup is best-effort
    }

    // Determine which workspaces the user can access
    const accessibleWorkspaces = ['executive'];

    const isEnterpriseRole = ['enterprise_user', 'enterprise_manager', 'enterprise_admin', 'organization_owner', 'platform_admin', 'super_admin'].includes(userRole);
    if (isEnterpriseRole || orgId) {
      accessibleWorkspaces.push('enterprise');
    }

    const isPlatformRole = ['platform_admin', 'support', 'sales', 'finance', 'content_manager', 'super_admin'].includes(userRole);
    if (isPlatformRole) {
      accessibleWorkspaces.push('platform');
    }

    const isDeveloperRole = ['developer', 'super_admin'].includes(userRole);
    if (isDeveloperRole) {
      accessibleWorkspaces.push('developer');
    }

    // Fetch all recent notifications using service role (bypasses RLS
    // so we can read system-generated notifications), then filter
    // server-side based on the user's identity and authorization.
    const allNotifications = await base44.asServiceRole.entities.Notification.list('-created_date', 200);

    const scoped = allNotifications.filter((n) => {
      // 1. Personal notification — only the target user
      if (n.user_id && n.user_id === user.id) {
        return true;
      }

      // If a user_id is set but doesn't match, exclude immediately
      if (n.user_id && n.user_id !== user.id) {
        return false;
      }

      // 2. Public broadcast — all authenticated users
      if (n.visibility === 'public') {
        return true;
      }

      // 3. Organization-scoped — only members of the target org
      if (n.visibility === 'organization' && n.organization_id) {
        return n.organization_id === orgId;
      }

      // 4. Workspace-scoped — only users with workspace access + role match
      if (n.visibility === 'workspace' && n.workspace) {
        if (!accessibleWorkspaces.includes(n.workspace)) {
          return false;
        }
        // Check role scope if specified
        if (n.role_scope) {
          const roles = n.role_scope.split(',').map((r) => r.trim());
          return roles.includes(userRole) || roles.includes('all');
        }
        return true;
      }

      // 5. Legacy unscoped notifications (created before scoping was added)
      //    Only visible to the creator — prevents cross-user leakage
      if (!n.user_id && !n.visibility && !n.workspace && !n.organization_id) {
        return n.created_by_id === user.id;
      }

      return false;
    });

    return Response.json({ notifications: scoped });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
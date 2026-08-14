const DEFAULT_ADMIN_ROLES = ['organization_admin'];
const DEFAULT_MANAGER_ROLES = ['organization_admin', 'department_admin', 'manager'];
const ADMIN_USER_ROLES = ['enterprise_admin', 'organization_admin'];
const MANAGER_USER_ROLES = ['enterprise_admin', 'organization_admin', 'department_admin', 'enterprise_manager', 'manager'];

export async function resolveAuthoritativeOrgAccess(base44, user, options = {}) {
  const allowedRoles = options.allowManagers ? DEFAULT_MANAGER_ROLES : DEFAULT_ADMIN_ROLES;
  const allowedUserRoles = options.allowManagers ? MANAGER_USER_ROLES : ADMIN_USER_ROLES;
  const userRole = (user.role || '').toLowerCase();
  const ownedOrganizations = await base44.asServiceRole.entities.Organization.filter(
    { admin_user_id: user.id },
    '-created_date',
    100,
  );
  const ownedOrganization = options.requestedOrgId
    ? ownedOrganizations.find((organization) => organization.id === options.requestedOrgId)
    : ownedOrganizations[0];
  if (ownedOrganization) {
    return { orgId: ownedOrganization.id, membership: null, organization: ownedOrganization, isOwner: true };
  }

  const memberships = await base44.asServiceRole.entities.OrgMembership.filter(
    { user_id: user.id, status: 'active' },
    '-created_date',
    100,
  );
  const candidates = options.requestedOrgId
    ? memberships.filter((membership) => membership.organization_id === options.requestedOrgId)
    : memberships;

  for (const membership of candidates) {
    if (!membership.organization_id) continue;
    let organization = null;
    try {
      organization = await base44.asServiceRole.entities.Organization.get(membership.organization_id);
    } catch {
      continue;
    }
    const isOwner = organization?.admin_user_id === user.id;
    const hasVerifiedRole = allowedRoles.includes(membership.role) && allowedUserRoles.includes(userRole);
    if (isOwner || hasVerifiedRole) {
      return { orgId: membership.organization_id, membership, organization, isOwner };
    }
  }
  return null;
}
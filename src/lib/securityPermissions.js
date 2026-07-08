/**
 * EXECLEAD.AI — V3.0 Security Permission Engine
 * ------------------------------------------------
 * Comprehensive RBAC permission matrix. Roles and permissions
 * are INDEPENDENT of subscription plans — subscriptions unlock
 * product features; roles govern access scope and authority.
 *
 * Every permission is individually configurable per role.
 */

export const PERMISSIONS = [
  { id: "view", label: "View", description: "Read access to records, data, and dashboards" },
  { id: "create", label: "Create", description: "Create new records and entries" },
  { id: "edit", label: "Edit", description: "Modify existing records" },
  { id: "delete", label: "Delete", description: "Remove records permanently" },
  { id: "approve", label: "Approve", description: "Approve workflows, reviews, and requests" },
  { id: "export", label: "Export", description: "Export data and generate reports" },
  { id: "import", label: "Import", description: "Import bulk data" },
  { id: "audit", label: "Audit", description: "Access audit logs and security trails" },
  { id: "manage_users", label: "Manage Users", description: "User administration and role assignment" },
  { id: "manage_billing", label: "Manage Billing", description: "Billing, invoices, and payment configuration" },
  { id: "manage_security", label: "Manage Security", description: "Security policies, MFA, and access control" },
  { id: "manage_organizations", label: "Manage Organizations", description: "Organization administration and SSO" },
  { id: "manage_companies", label: "Manage Companies", description: "Company intelligence data management" },
];

export const SECURITY_ROLES = [
  { id: "customer", label: "Customer", tier: 10, description: "Standard platform user" },
  { id: "professional_user", label: "Professional User", tier: 12, description: "Professional plan subscriber" },
  { id: "executive_user", label: "Executive User", tier: 15, description: "Executive plan subscriber" },
  { id: "enterprise_user", label: "Enterprise User", tier: 20, description: "Enterprise organization member" },
  { id: "enterprise_admin", label: "Enterprise Admin", tier: 30, description: "Enterprise organization administrator" },
  { id: "reviewer", label: "Reviewer", tier: 42, description: "Identity and content review specialist" },
  { id: "support", label: "Support", tier: 45, description: "Customer support agent" },
  { id: "sales", label: "Sales", tier: 50, description: "Sales representative" },
  { id: "developer", label: "Developer", tier: 90, description: "Engineering and system diagnostics" },
  { id: "platform_admin", label: "Platform Admin", tier: 92, description: "Platform-wide administration" },
  { id: "security_admin", label: "Security Admin", tier: 94, description: "Security operations and compliance" },
  { id: "super_admin", label: "Super Admin", tier: 100, description: "Unrestricted platform access" },
];

const ALL_PERMS = PERMISSIONS.map(p => p.id);

export const ROLE_PERMISSION_MATRIX = {
  customer: ["view"],
  professional_user: ["view"],
  executive_user: ["view"],
  enterprise_user: ["view"],
  enterprise_admin: ["view", "create", "edit", "manage_users"],
  reviewer: ["view", "approve", "audit"],
  support: ["view", "audit"],
  sales: ["view", "create", "export"],
  developer: ["view", "create", "edit", "audit"],
  platform_admin: ["view", "create", "edit", "delete", "approve", "export", "import", "audit", "manage_users", "manage_billing", "manage_organizations", "manage_companies"],
  security_admin: ["view", "audit", "manage_security", "manage_users"],
  super_admin: ALL_PERMS,
};

export function hasSecurityPermission(role, permission) {
  const perms = ROLE_PERMISSION_MATRIX[role] || [];
  return perms.includes(permission);
}

export function getRolePermissions(role) {
  return ROLE_PERMISSION_MATRIX[role] || [];
}
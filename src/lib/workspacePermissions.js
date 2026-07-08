import { normalizeRole } from "@/lib/roles";

// ============================================================
// WORKSPACE PERMISSIONS — Centralized Authorization
// ============================================================
// Single source of truth for all Developer Workspace module
// access. Roles ONLY — subscription plans are NEVER consulted.
//
// FOUNDER OVERRIDE: Super Admin bypasses ALL workspace checks.
// This is unconditional and cannot be overridden by any other
// configuration.
// ============================================================

// Roles that can access the Product Management Center
export const PM_ACCESS_ROLES = ["developer", "super_admin", "platform_admin", "product_manager"];

// All workspace module permissions — controls both access checks
// and the authorization state display in the Developer Console.
export const WORKSPACE_PERMISSIONS = {
  product_management: { label: "Product Management", roles: PM_ACCESS_ROLES },
  billing: { label: "Billing", roles: ["platform_admin", "super_admin", "finance", "developer"] },
  company_admin: { label: "Company Admin", roles: ["platform_admin", "super_admin", "content_manager", "developer"] },
  feature_flags: { label: "Feature Flags", roles: ["developer", "super_admin"] },
  database: { label: "Database Explorer", roles: ["developer", "super_admin"] },
  deployments: { label: "Deployment", roles: ["developer", "super_admin"] },
  system_health: { label: "System Health", roles: ["developer", "super_admin"] },
  api_management: { label: "API Management", roles: ["developer", "super_admin"] },
  guardian: { label: "Guardian™", roles: ["developer", "super_admin"] },
};

/**
 * Check a single workspace permission.
 * Returns { granted, reason, source, ...details }
 *
 * Founder Override: super_admin ALWAYS returns granted=true.
 */
export function checkPermission(permissionKey, userRole, developerMode = false) {
  const role = normalizeRole(userRole);

  // ---- FOUNDER OVERRIDE ----
  // Super Admin bypasses ALL internal workspace permission checks.
  if (role === "super_admin") {
    return {
      granted: true,
      reason: "Super Admin override — full bypass",
      source: "founder_override",
    };
  }

  const perm = WORKSPACE_PERMISSIONS[permissionKey];
  if (!perm) {
    return { granted: false, reason: `Unknown permission: ${permissionKey}`, source: "error" };
  }

  // Direct role match
  if (perm.roles.includes(role)) {
    return { granted: true, reason: `Role: ${role}`, source: "role" };
  }

  // Developer Mode grants access to developer workspace modules
  if (developerMode && role === "developer") {
    return { granted: true, reason: "Developer Mode enabled", source: "developer_mode" };
  }

  // Denied — return exactly what's missing
  return {
    granted: false,
    reason: `Missing Role: ${perm.roles.join(" or ")}`,
    source: "denied",
    currentRole: role,
    requiredRoles: perm.roles,
    permissionKey,
  };
}

/**
 * Product Management Center access check.
 */
export function canAccessProductManagement(userRole, developerMode = false) {
  return checkPermission("product_management", userRole, developerMode);
}

/**
 * Build the full authorization state for display in the Developer Console.
 */
export function getAuthorizationState(user, devCtx) {
  const role = normalizeRole(user?.role);
  const developerMode = devCtx?.developerMode ?? false;
  const isSuperAdmin = role === "super_admin";

  const permissions = Object.entries(WORKSPACE_PERMISSIONS).map(([key, perm]) => {
    const result = checkPermission(key, user?.role, developerMode);
    return {
      key,
      label: perm.label,
      granted: result.granted,
      reason: result.reason,
      source: result.source,
    };
  });

  return {
    role,
    roleLabel: formatRoleLabel(role),
    developerMode,
    isSuperAdmin,
    isFounderOverride: isSuperAdmin,
    permissions,
    productManagement: checkPermission("product_management", user?.role, developerMode),
  };
}

function formatRoleLabel(role) {
  return role
    .split("_")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
export const ROLES = {
  super_admin: { label: "Super Admin", tier: 100, plan: "enterprise", description: "Unrestricted platform access" },
  platform_admin: { label: "Platform Admin", tier: 90, plan: "enterprise", description: "Platform-wide administration" },
  enterprise_admin: { label: "Enterprise Admin", tier: 80, plan: "enterprise", description: "Organization administration" },
  instructor: { label: "Instructor", tier: 70, plan: "executive", description: "Create and manage learning content" },
  coach: { label: "Coach", tier: 60, plan: "executive", description: "Provide coaching to users" },
  enterprise_user: { label: "Enterprise User", tier: 50, plan: "enterprise", description: "Full enterprise feature access" },
  executive_user: { label: "Executive User", tier: 40, plan: "executive", description: "Executive-tier features" },
  professional_user: { label: "Professional User", tier: 30, plan: "professional", description: "Professional-tier features" },
  free_user: { label: "Free User", tier: 10, plan: "free", description: "Basic free-tier access" },
  admin: { label: "Admin", tier: 100, plan: "enterprise", description: "Legacy admin role" },
  user: { label: "User", tier: 10, plan: "free", description: "Legacy user role" },
};

export const ROLE_LIST = Object.entries(ROLES)
  .filter(([key]) => !["admin", "user"].includes(key))
  .map(([key, val]) => ({ id: key, ...val }));

export function getRoleInfo(role) {
  return ROLES[role] || ROLES.free_user;
}

export function getRoleTier(role) {
  return ROLES[role]?.tier ?? 0;
}

export function getRolePlan(role) {
  return ROLES[role]?.plan ?? "free";
}

export function isSuperAdmin(role) {
  return role === "super_admin" || role === "admin";
}

export function isPlatformAdmin(role) {
  return getRoleTier(role) >= 90;
}

export function isEnterpriseAdmin(role) {
  return getRoleTier(role) >= 80;
}

export function isAdminLevel(role) {
  return getRoleTier(role) >= 80;
}
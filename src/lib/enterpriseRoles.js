/**
 * Enterprise RBAC Role Hierarchy™
 * ================================
 * Canonical enterprise role definitions for EXECLEAD.AI.
 * Each role defines permissions, capabilities, accessible workspaces,
 * and inherited permissions from lower-tier roles.
 */

export const ENTERPRISE_ROLES = [
  {
    id: "super_admin",
    name: "Super Admin",
    level: 12,
    tier: "platform",
    color: "bg-red-500/10 text-red-400 border-red-500/20",
    description: "Full platform control. Can manage all organizations, billing, and system configuration.",
    capabilities: ["Platform-wide administration", "All organization management", "System configuration", "Billing administration", "Security policies", "AI policies", "Feature flags"],
    workspaces: ["executive", "developer", "enterprise", "learning", "admin", "trust", "security", "analytics"],
    inherits: ["platform_admin", "organization_admin", "department_admin", "manager", "team_lead", "coach", "mentor", "member"],
  },
  {
    id: "platform_admin",
    name: "Platform Admin",
    level: 11,
    tier: "platform",
    color: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    description: "Manages platform-level settings and all organizations. Cannot modify super admin accounts.",
    capabilities: ["Organization management", "Platform settings", "Workspace management", "License assignment", "User lifecycle"],
    workspaces: ["executive", "developer", "enterprise", "admin", "trust", "security", "analytics"],
    inherits: ["organization_admin", "department_admin", "manager", "team_lead", "coach", "mentor", "member"],
  },
  {
    id: "organization_admin",
    name: "Organization Admin",
    level: 10,
    tier: "organization",
    color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    description: "Manages their organization: departments, teams, users, licenses, workspaces, and reports.",
    capabilities: ["Department management", "Team management", "User management", "License assignment", "Workspace assignment", "Reports", "Knowledge packs"],
    workspaces: ["executive", "enterprise", "admin", "trust", "analytics"],
    inherits: ["department_admin", "manager", "team_lead", "coach", "mentor", "member"],
  },
  {
    id: "department_admin",
    name: "Department Admin",
    level: 9,
    tier: "department",
    color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    description: "Manages their department: teams, members, and reporting within the department scope.",
    capabilities: ["Team management (dept)", "Member assignment", "Department reports", "Capacity planning"],
    workspaces: ["executive", "enterprise", "analytics"],
    inherits: ["manager", "team_lead", "coach", "mentor", "member"],
  },
  {
    id: "manager",
    name: "Manager",
    level: 7,
    tier: "team",
    color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    description: "Manages a team of members. Can view reports and assign learning.",
    capabilities: ["Team member management", "Learning assignments", "Performance review", "Team reports"],
    workspaces: ["executive", "analytics"],
    inherits: ["team_lead", "member"],
  },
  {
    id: "team_lead",
    name: "Team Lead",
    level: 6,
    tier: "team",
    color: "bg-teal-500/10 text-teal-400 border-teal-500/20",
    description: "Leads a specific team. Can coordinate members and track progress.",
    capabilities: ["Member coordination", "Progress tracking", "Team dashboard"],
    workspaces: ["executive"],
    inherits: ["member"],
  },
  {
    id: "coach",
    name: "Coach",
    level: 5,
    tier: "specialist",
    color: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    description: "Provides coaching sessions. Can view member profiles and run simulations.",
    capabilities: ["Coaching sessions", "Member profiles (read)", "Simulations", "Feedback"],
    workspaces: ["executive", "learning"],
    inherits: ["member"],
  },
  {
    id: "mentor",
    name: "Mentor",
    level: 4,
    tier: "specialist",
    color: "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20",
    description: "Provides mentorship. Can view assigned mentee profiles.",
    capabilities: ["Mentorship sessions", "Mentee profiles (read)", "Guidance notes"],
    workspaces: ["executive"],
    inherits: ["member"],
  },
  {
    id: "member",
    name: "Member",
    level: 2,
    tier: "base",
    color: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    description: "Standard platform member with access to executive workspace features.",
    capabilities: ["Executive dashboard", "Leadership development", "Career tools", "Community"],
    workspaces: ["executive"],
    inherits: [],
  },
  {
    id: "guest",
    name: "Guest",
    level: 1,
    tier: "external",
    color: "bg-gray-500/10 text-gray-400 border-gray-500/20",
    description: "Limited access for external collaborators.",
    capabilities: ["Limited dashboard", "Assigned content only"],
    workspaces: [],
    inherits: [],
  },
  {
    id: "auditor",
    name: "Auditor",
    level: 3,
    tier: "external",
    color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    description: "Read-only access to compliance, audit logs, and reports.",
    capabilities: ["Audit logs (read)", "Compliance reports (read)", "Security reports (read)"],
    workspaces: ["trust", "security"],
    inherits: [],
  },
  {
    id: "read_only",
    name: "Read Only",
    level: 1,
    tier: "external",
    color: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
    description: "View-only access to assigned workspaces.",
    capabilities: ["View dashboards", "View reports"],
    workspaces: [],
    inherits: [],
  },
];

export const ROLE_BY_ID = Object.fromEntries(ENTERPRISE_ROLES.map((r) => [r.id, r]));

export function getRole(roleId) {
  return ROLE_BY_ID[roleId] || null;
}

export function getInheritedRoles(roleId) {
  const role = getRole(roleId);
  if (!role || !role.inherits) return [];
  return role.inherits.map((id) => getRole(id)).filter(Boolean);
}

export const ENTERPRISE_WORKSPACES = [
  { id: "executive", name: "Executive Workspace", description: "Leadership development, coaching, simulations, and career tools.", icon: "Briefcase" },
  { id: "developer", name: "Developer Workspace", description: "Platform administration, diagnostics, and engineering operations.", icon: "Code" },
  { id: "enterprise", name: "Enterprise Workspace", description: "Organization management, departments, teams, and administration.", icon: "Building2" },
  { id: "learning", name: "Learning Workspace", description: "Academy, courses, assignments, and certification programs.", icon: "GraduationCap" },
  { id: "admin", name: "Admin Workspace", description: "User management, billing, and organizational administration.", icon: "Settings" },
  { id: "trust", name: "Trust Workspace", description: "Trust Center, compliance, and vendor due diligence.", icon: "ShieldCheck" },
  { id: "security", name: "Security Workspace", description: "Security center, identity protection, and access control.", icon: "Lock" },
  { id: "analytics", name: "Analytics Workspace", description: "Platform analytics, AI usage, and executive intelligence.", icon: "BarChart3" },
];
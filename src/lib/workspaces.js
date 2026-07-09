/**
 * EXECLEAD.AI — Workspace & Access Architecture 3.0
 * ---------------------------------------------------
 * Separates Authentication, Subscription, Workspace, Role, and Permissions
 * into independent layers. The active workspace determines navigation;
 * the role determines authority; the subscription determines features.
 */
import {
  LayoutDashboard, GraduationCap, MessageSquare, Brain, Scale,
  Briefcase, FileText, Building2, BarChart3, PenLine,
  UserCircle, CreditCard, Settings as SettingsIcon,
  Users, Shield, DollarSign, Receipt, Lock, KeyRound, Code2,
  Calculator, Database, Mail, Boxes, Store, Cpu, TrendingUp,
  GitBranch, Rocket, ShieldCheck, Network, Activity, Fingerprint,
  Lightbulb, ClipboardCheck, Trophy, Crown, Award, Gift, Wallet,
  BookOpen,
} from "lucide-react";
import { normalizeRole } from "./roles";

/* ======================= WORKSPACE REGISTRY ======================= */

export const WORKSPACES = {
  executive: { id: "executive", label: "Executive", description: "Personal executive development", icon: Briefcase, color: "#6366f1", badge: "bg-indigo-500" },
  enterprise: { id: "enterprise", label: "Enterprise", description: "Organization workspace", icon: Building2, color: "#06b6d4", badge: "bg-cyan-500" },
  platform: { id: "platform", label: "Platform", description: "Platform administration", icon: ShieldCheck, color: "#a855f7", badge: "bg-purple-500" },
  developer: { id: "developer", label: "Developer", description: "Engineering workspace", icon: Code2, color: "#10b981", badge: "bg-emerald-500" },
};

export const WORKSPACE_HOME = {
  executive: "/dashboard",
  enterprise: "/enterprise",
  platform: "/billing-admin",
  developer: "/developer",
};

/* ======================= NAVIGATION DEFINITIONS ======================= */

export const WORKSPACE_NAV = {
  executive: [
    { label: "Platform", items: [
      { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { path: "/ai-command-center", label: "AI Command Center", icon: Cpu },
      { path: "/academy", label: "Academy", icon: GraduationCap, feature: "executive_academy" },
      { path: "/coach", label: "Executive Coach", icon: MessageSquare },
      { path: "/simulator", label: "Executive Simulator", icon: Brain, feature: "executive_simulator" },
      { path: "/council", label: "Executive Council", icon: Network, feature: "executive_council" },
      { path: "/marketplace", label: "Marketplace", icon: Store, feature: "marketplace" },
    ]},
    { label: "Network", items: [
      { path: "/network", label: "Executive Network", icon: Users },
    ]},
    { label: "Career", items: [
      { path: "/career-studio", label: "Career Studio", icon: Briefcase, feature: "career_studio" },
      { path: "/resume", label: "Resume AI", icon: FileText, feature: "resume_intelligence" },
      { path: "/companies", label: "Companies", icon: Building2, feature: "company_intelligence" },
      { path: "/journal", label: "Journal", icon: PenLine, feature: "executive_journal" },
    ]},
    { label: "Insights", items: [
      { path: "/leadership-dna", label: "Leadership DNA", icon: Fingerprint, feature: "leadership_dna" },
      { path: "/analytics", label: "Analytics", icon: BarChart3, feature: "leadership_analytics" },
      { path: "/legacy-library", label: "Legacy Library", icon: BookOpen },
      { path: "/executive/rankings", label: "Executive Rankings", icon: Trophy },
    ]},
    { label: "Account", items: [
      { path: "/profile", label: "Profile", icon: UserCircle },
      { path: "/founder", label: "Founder Portal", icon: Crown },
      { path: "/referrals", label: "Referrals", icon: Gift },
      { path: "/wallet", label: "Executive Wallet", icon: Wallet },
      { path: "/billing", label: "Billing", icon: CreditCard },
      { path: "/settings", label: "Settings", icon: SettingsIcon },
      { path: "/security", label: "Security Center", icon: ShieldCheck },
      { path: "/identity-verification", label: "Identity Verification", icon: ShieldCheck },
      { path: "/feedback", label: "Feedback", icon: Lightbulb },
    ]},
  ],
  enterprise: [
    { label: "Organization", items: [
      { path: "/enterprise", label: "Enterprise Dashboard", icon: LayoutDashboard, feature: "team_dashboard" },
      { path: "/organization/users", label: "Users", icon: Users },
      { path: "/succession-planning", label: "Teams", icon: Users, feature: "succession_planning" },
      { path: "/hr-dashboard", label: "Departments", icon: Users, feature: "hr_dashboard" },
      { path: "/learning-assignments", label: "Learning Assignments", icon: ClipboardCheck, feature: "learning_assignments" },
      { path: "/promotion-readiness", label: "Promotion Readiness", icon: TrendingUp, feature: "promotion_readiness" },
    ]},
    { label: "Insights", items: [
      { path: "/analytics", label: "Leadership Analytics", icon: BarChart3, feature: "leadership_analytics" },
      { path: "/companies", label: "Organization Intelligence", icon: Building2, feature: "company_intelligence" },
      { path: "/ai-usage", label: "Reports", icon: Cpu, feature: "ai_usage_dashboard" },
    ]},
    { label: "Administration", items: [
      { path: "/organization/billing", label: "Organization Billing", icon: CreditCard },
      { path: "/settings", label: "Organization Settings", icon: SettingsIcon },
    ]},
  ],
  platform: [
    { label: "Management", items: [
      { path: "/developer/organizations", label: "Organizations", icon: Network },
      { path: "/company-admin", label: "Companies", icon: Database },
      { path: "/marketplace", label: "Marketplace Management", icon: Store },
      { path: "/pricing-admin", label: "Subscription Management", icon: DollarSign },
      { path: "/membership-admin", label: "Membership Programs", icon: Award },
      { path: "/referral-admin", label: "Referral Engine", icon: Gift },
      { path: "/identity-verification-admin", label: "Identity Reviews", icon: ShieldCheck },
      { path: "/legacy-library/admin", label: "Legacy Moderation", icon: BookOpen },
    ]},
    { label: "Revenue", items: [
      { path: "/billing-admin", label: "Revenue Dashboard", icon: Receipt },
      { path: "/cpq-dashboard", label: "Sales Pipeline", icon: TrendingUp },
      { path: "/cpq", label: "CPQ", icon: Calculator },
    ]},
    { label: "System", items: [
      { path: "/developer/audit-logs", label: "Audit Logs", icon: FileText },
      { path: "/email-settings", label: "Email Center", icon: Mail },
      { path: "/ai-usage", label: "Usage Analytics", icon: Cpu },
      { path: "/developer/system-health", label: "System Reports", icon: Activity },
      { path: "/admin", label: "User Support", icon: Shield },
    ]},
  ],
  developer: [
    { label: "Workspace", items: [
      { path: "/developer", label: "Developer Dashboard", icon: LayoutDashboard },
      { path: "/developer/ai-command-center", label: "AI Command Center", icon: Cpu },
      { path: "/feature-management", label: "Feature Flags", icon: Boxes },
      { path: "/guardian", label: "Guardian™", icon: ShieldCheck },
    ]},
    { label: "Engineering", items: [
      { path: "/developer/api-keys", label: "API Management", icon: KeyRound },
      { path: "/developer/database", label: "Database Explorer", icon: Database },
      { path: "/developer/deployments", label: "Deployment Center", icon: Rocket },
      { path: "/developer/system-health", label: "System Health", icon: Activity },
    ]},
    { label: "Administration", items: [
      { path: "/payment-settings", label: "Payment Providers", icon: Lock },
      { path: "/pricing-admin", label: "Pricing Engine", icon: DollarSign },
      { path: "/billing-admin", label: "Billing Admin", icon: Receipt },
      { path: "/email-settings", label: "Email Templates", icon: Mail },
      { path: "/company-admin", label: "Company Admin", icon: Database },
    ]},
    { label: "System", items: [
      { path: "/developer/audit-logs", label: "Audit Logs", icon: FileText },
      { path: "/developer/migrations", label: "Migration History", icon: GitBranch },
      { path: "/developer/organizations", label: "Organization Admin", icon: Network },
      { path: "/cpq-dashboard", label: "Sales Pipeline", icon: TrendingUp },
      { path: "/cpq", label: "CPQ Wizard", icon: Calculator },
    ]},
  ],
};

/* ======================= ROUTE → WORKSPACE MAP ======================= */

const ROUTE_WORKSPACE = {
  "/dashboard": ["executive"], "/academy": ["executive"], "/coach": ["executive"],
  "/simulator": ["executive"], "/debate": ["executive"], "/council": ["executive"],
  "/marketplace": ["executive", "platform"], "/network": ["executive"], "/career-studio": ["executive"],
  "/resume": ["executive"], "/companies": ["executive", "enterprise"],
  "/analytics": ["executive", "enterprise"], "/journal": ["executive"],
  "/profile": ["executive"], "/founder": ["executive"], "/billing": ["executive"], "/wallet": ["executive"],
  "/organization/billing": ["enterprise"],
  "/settings": ["executive", "enterprise"], "/security": ["executive", "enterprise"],
  "/identity-verification": ["executive", "enterprise"],
  "/identity-verification-admin": ["platform", "developer"],
  "/legacy-library/admin": ["platform", "developer"],
  "/feedback": ["executive", "enterprise"], "/challenge": ["executive"],
  "/leadership-dna": ["executive"], "/executive-legacy": ["executive"],
  "/legacy-library": ["executive"],
  "/career": ["executive"], "/metrics": ["executive"],
  "/notifications": ["executive"], "/compare-plans": ["executive"],
  "/brand-center": ["executive"], "/executive/rankings": ["executive"],
  "/connected-accounts": ["executive"],
  "/enterprise": ["enterprise"], "/hr-dashboard": ["enterprise"],
  "/succession-planning": ["enterprise"], "/promotion-readiness": ["enterprise"],
  "/learning-assignments": ["enterprise"], "/organization/users": ["enterprise"],
  "/sso": ["enterprise"], "/ai-usage": ["enterprise", "developer", "platform"],
  "/pricing-admin": ["platform", "developer"], "/membership-admin": ["platform", "developer"], "/billing-admin": ["platform", "developer"],
  "/payment-settings": ["platform", "developer"], "/email-settings": ["platform", "developer"],
  "/company-admin": ["platform", "developer"], "/cpq": ["platform", "developer"],
  "/cpq-dashboard": ["platform", "developer"], "/admin": ["platform"],
  "/developer/organizations": ["platform", "developer"],
  "/developer/audit-logs": ["platform", "developer"],
  "/developer/system-health": ["platform", "developer"],
  "/ai-command-center": ["executive"],
  "/developer/ai-command-center": ["developer"],
  "/developer": ["developer"], "/feature-management": ["developer"], "/guardian": ["developer"],
};

export function getRouteWorkspace(path) {
  if (ROUTE_WORKSPACE[path]) return ROUTE_WORKSPACE[path];
  if (path.startsWith("/developer/")) return ["developer"];
  if (path.startsWith("/academy/")) return ["executive"];
  if (path.startsWith("/companies/")) return ["executive", "enterprise"];
  if (path.startsWith("/network/")) return ["executive"];
  if (path.startsWith("/founder")) return ["executive"];
  if (path.startsWith("/cpq/")) return ["platform", "developer"];
  if (path.startsWith("/portal/")) return ["enterprise"];
  return null;
}

/* ======================= VISIBILITY RULES ======================= */

const EXECUTIVE_ROLES = ["customer", "enterprise_user", "enterprise_manager", "enterprise_admin", "organization_owner", "support", "sales", "finance", "content_manager", "platform_admin", "developer", "super_admin"];
const ENTERPRISE_ROLES = ["enterprise_user", "enterprise_manager", "enterprise_admin", "organization_owner", "super_admin"];
const PLATFORM_ROLES = ["platform_admin", "security_admin", "support", "sales", "finance", "content_manager", "super_admin"];
const DEVELOPER_ROLES = ["developer", "super_admin"];

export function getAvailableWorkspaces(role, plan, profile, isImpersonating = false) {
  const r = normalizeRole(role);
  const available = [];
  if (EXECUTIVE_ROLES.includes(r)) available.push("executive");
  if (ENTERPRISE_ROLES.includes(r) || (!isImpersonating && profile?.organization_id) || plan === "enterprise") available.push("enterprise");
  if (PLATFORM_ROLES.includes(r)) available.push("platform");
  if (DEVELOPER_ROLES.includes(r)) available.push("developer");
  return available;
}

export function getDefaultWorkspace(available, role) {
  const r = normalizeRole(role);
  if (r === "developer" && available.includes("developer")) return "developer";
  if (r === "security_admin" && available.includes("platform")) return "platform";
  if (r === "super_admin") return available[0] || "executive";
  if (PLATFORM_ROLES.includes(r) && available.includes("platform")) return "platform";
  if (ENTERPRISE_ROLES.includes(r) && available.includes("enterprise")) return "enterprise";
  return available[0] || "executive";
}

export function canAccessWorkspace(role, plan, profile, workspaceId) {
  return getAvailableWorkspaces(role, plan, profile).includes(workspaceId);
}

/* ======================= PERMISSIONS REGISTRY ======================= */

export const PERMISSIONS = [
  "can_manage_users", "can_manage_features", "can_manage_billing", "can_manage_marketplace",
  "can_manage_companies", "can_manage_security", "can_manage_pricing", "can_access_developer",
  "can_access_platform", "can_publish_content", "can_view_audit_logs",
];

export const ROLE_PERMISSIONS = {
  customer: [],
  enterprise_user: [],
  enterprise_manager: ["can_manage_users"],
  enterprise_admin: ["can_manage_users", "can_manage_billing"],
  organization_owner: ["can_manage_users", "can_manage_billing"],
  support: ["can_view_audit_logs"],
  sales: [],
  finance: ["can_manage_billing"],
  content_manager: ["can_publish_content", "can_manage_companies", "can_manage_marketplace"],
  reviewer: ["can_view_audit_logs"],
  security_admin: ["can_manage_security", "can_manage_users", "can_view_audit_logs", "can_access_platform"],
  platform_admin: [
    "can_manage_users", "can_manage_features", "can_manage_billing", "can_manage_marketplace",
    "can_manage_companies", "can_manage_security", "can_manage_pricing", "can_access_platform",
    "can_publish_content", "can_view_audit_logs",
  ],
  developer: ["can_access_developer", "can_manage_features"],
  super_admin: [
    "can_manage_users", "can_manage_features", "can_manage_billing", "can_manage_marketplace",
    "can_manage_companies", "can_manage_security", "can_manage_pricing", "can_access_developer",
    "can_access_platform", "can_publish_content", "can_view_audit_logs",
  ],
};

export function hasPermission(role, permission) {
  const perms = ROLE_PERMISSIONS[normalizeRole(role)] || [];
  return perms.includes(permission);
}

/* ======================= NAVIGATION ENGINE ======================= */

/**
 * Dynamically resolves navigation groups for the active workspace.
 * Filters by role restrictions and organization membership.
 * Feature-flag gating is handled at the route level by <FeatureGate>.
 */
export function resolveWorkspaceNav(workspaceId, role, plan, profile) {
  const groups = WORKSPACE_NAV[workspaceId];
  if (!groups) return [];
  const r = normalizeRole(role);
  return groups
    .map((g) => ({
      label: g.label,
      items: g.items.filter((item) => {
        if (item.roles && !item.roles.includes(r)) return false;
        if (item.orgRequired && !profile?.organization_id && r !== "super_admin") return false;
        return true;
      }),
    }))
    .filter((g) => g.items.length > 0);
}
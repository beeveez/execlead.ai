/**
 * EXECLEAD.AI — Workspace & Access Architecture 4.0
 * ---------------------------------------------------
 * Four workspaces: Executive, Enterprise, Operations, Developer.
 * Operations replaces the former Platform workspace, reorganized
 * around product intelligence, customer lifecycle, observability,
 * commercial, growth, success, reports, and roadmap.
 */
import {
  LayoutDashboard, GraduationCap, MessageSquare, Brain, Scale,
  Briefcase, FileText, Building2, BarChart3, PenLine,
  UserCircle, CreditCard, Settings as SettingsIcon,
  Users, Shield, DollarSign, Receipt, Lock, KeyRound, Code2,
  Calculator, Database, Mail, Boxes, Store, Cpu, TrendingUp,
  GitBranch, Rocket, ShieldCheck, Network, Activity, Fingerprint,
  Lightbulb, ClipboardCheck, Trophy, Crown, Award, Gift, Wallet, ShoppingCart,
  BookOpen, Star, Sparkles, Target, Gauge, Radar, Heart, Map, Flag,
} from "lucide-react";
import { normalizeRole } from "./roles";

/* ======================= WORKSPACE REGISTRY ======================= */

export const WORKSPACES = {
  executive: { id: "executive", label: "Executive", description: "Personal executive development", icon: Briefcase, color: "#6366f1", badge: "bg-indigo-500" },
  enterprise: { id: "enterprise", label: "Enterprise", description: "Organization workspace", icon: Building2, color: "#06b6d4", badge: "bg-cyan-500" },
  operations: { id: "operations", label: "Operations", description: "Platform & business operations", icon: ShieldCheck, color: "#a855f7", badge: "bg-purple-500" },
  developer: { id: "developer", label: "Developer", description: "Engineering workspace", icon: Code2, color: "#10b981", badge: "bg-emerald-500" },
};

export const WORKSPACE_HOME = {
  executive: "/dashboard",
  enterprise: "/enterprise",
  operations: "/product-intelligence",
  developer: "/developer/executive-platform-status",
};

/* ======================= NAVIGATION DEFINITIONS ======================= */

export const WORKSPACE_NAV = {
  executive: [
    { label: "Platform", items: [
      { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ]},
    { label: "Career", items: [
      { path: "/career", label: "Career Advisor", icon: Briefcase, feature: "career_advisor" },
      { path: "/career-studio", label: "Career Studio", icon: Briefcase, feature: "career_studio" },
      { path: "/resume", label: "Resume AI", icon: FileText, feature: "resume_intelligence" },
      { path: "/companies", label: "Companies", icon: Building2, feature: "company_intelligence" },
      { path: "/journal", label: "Journal", icon: PenLine, feature: "executive_journal" },
    ]},
    { label: "Learning", items: [
      { path: "/academy", label: "Academy", icon: GraduationCap, feature: "executive_academy" },
      { path: "/challenge", label: "Daily Challenge", icon: Target, feature: "daily_executive_challenge" },
      { path: "/simulator", label: "Executive Simulator", icon: Brain, feature: "executive_simulator" },
      { path: "/debate", label: "Executive Debate", icon: Scale, feature: "executive_debate" },
      { path: "/council", label: "Executive Council", icon: Network, feature: "executive_council" },
      { path: "/marketplace", label: "Marketplace", icon: Store, feature: "marketplace" },
    ]},
    { label: "Leadership", items: [
      { path: "/leadership-dna", label: "Leadership DNA", icon: Fingerprint, feature: "leadership_dna" },
      { path: "/intelligence", label: "Intelligence Center", icon: Radar },
      { path: "/journey", label: "Intelligence Profile", icon: TrendingUp },
      { path: "/methodology", label: "EELM™ Methodology", icon: Brain },
      { path: "/legacy-library", label: "Legacy Library", icon: BookOpen },
      { path: "/executive-legacy", label: "Executive Legacy", icon: Award, feature: "executive_legacy" },
      { path: "/reputation", label: "Executive Reputation", icon: Star },
      { path: "/executive/rankings", label: "Executive Rankings", icon: Trophy },
    ]},
    { label: "AI Coach", items: [
      { path: "/coach", label: "Executive Coach", icon: MessageSquare },
      { path: "/ai-command-center", label: "AI Command Center", icon: Cpu },
    ]},
    { label: "Executive Readiness", items: [
      { path: "/executive-readiness", label: "Readiness", icon: Target },
    ]},
    { label: "Passport", items: [
      { path: "/executive-passport", label: "Executive Passport", icon: Briefcase },
    ]},
    { label: "Metrics", items: [
      { path: "/metrics", label: "Executive Metrics", icon: Gauge },
      { path: "/analytics", label: "Analytics", icon: BarChart3, feature: "leadership_analytics" },
    ]},
    { label: "Network", items: [
      { path: "/network", label: "Executive Network", icon: Users },
    ]},
    { label: "My Account", items: [
      { path: "/profile", label: "Profile", icon: UserCircle },
      { path: "/brand-center", label: "Executive Brand Center", icon: Sparkles },
      { path: "/founder", label: "Founder Portal", icon: Crown },
      { path: "/referrals", label: "Ambassador Program", icon: Gift },
      { path: "/wallet", label: "Executive Wallet", icon: Wallet },
      { path: "/billing", label: "Billing", icon: CreditCard },
      { path: "/settings", label: "Settings", icon: SettingsIcon },
      { path: "/security", label: "Account Security™", icon: ShieldCheck },
      { path: "/privacy-compliance", label: "Privacy & Compliance", icon: Lock },
      { path: "/identity-verification", label: "Identity Verification", icon: ShieldCheck },
      { path: "/feedback", label: "Feedback", icon: Lightbulb },
    ]},
  ],
  enterprise: [
    { label: "Organization", items: [
      { path: "/enterprise", label: "Enterprise Dashboard", icon: LayoutDashboard, feature: "team_dashboard" },
      { path: "/enterprise/organizations", label: "Organization Management™", icon: Building2 },
      { path: "/enterprise/admin", label: "Enterprise Administration™", icon: Shield },
      { path: "/enterprise/identity", label: "Enterprise Identity™", icon: Fingerprint },
      { path: "/enterprise-intelligence", label: "Intelligence", icon: TrendingUp },
      { path: "/companies", label: "Organization Intelligence", icon: Building2, feature: "company_intelligence" },
    ]},
    { label: "Users", items: [
      { path: "/organization/users", label: "Users", icon: Users },
    ]},
    { label: "Teams", items: [
      { path: "/succession-planning", label: "Teams", icon: Users, feature: "succession_planning" },
      { path: "/hr-dashboard", label: "Departments", icon: Users, feature: "hr_dashboard" },
      { path: "/learning-assignments", label: "Learning Assignments", icon: ClipboardCheck, feature: "learning_assignments" },
      { path: "/promotion-readiness", label: "Promotion Readiness", icon: TrendingUp, feature: "promotion_readiness" },
    ]},
    { label: "Procurement", items: [
      { path: "/enterprise/procurement", label: "Enterprise Procurement™", icon: ShoppingCart },
      { path: "/enterprise/vendors", label: "Vendor Management™", icon: Store },
    ]},
    { label: "Governance", items: [
      { path: "/enterprise/governance", label: "Governance Command Center™", icon: ShieldCheck },
    ]},
    { label: "Trust", items: [
      { path: "/enterprise/security", label: "Enterprise Security™", icon: ShieldCheck },
      { path: "/sso", label: "SSO & Identity", icon: KeyRound, feature: "sso" },
    ]},
    { label: "Administration", items: [
      { path: "/organization/billing", label: "Organization Billing", icon: CreditCard },
      { path: "/analytics", label: "Leadership Analytics", icon: BarChart3, feature: "leadership_analytics" },
      { path: "/ai-usage", label: "Reports", icon: Cpu, feature: "ai_usage_dashboard" },
      { path: "/settings", label: "Organization Settings", icon: SettingsIcon },
    ]},
  ],
  operations: [
    { label: "Product Intelligence", items: [
      { path: "/product-intelligence", label: "Product Intelligence™", icon: BarChart3 },
    ]},
    { label: "Beta Operations", items: [
      { path: "/beta-operations", label: "Beta Operations Center™", icon: Rocket },
      { path: "/beta-program", label: "Beta Program Center™", icon: Rocket },
    ]},
    { label: "Customer Lifecycle", items: [
      { path: "/customer-lifecycle", label: "Customer Lifecycle Management™", icon: Users },
    ]},
    { label: "Observability", items: [
      { path: "/system-status", label: "System Status Center™", icon: Activity },
      { path: "/exec-observability", label: "Observability Platform™", icon: Activity },
    ]},
    { label: "Commercial", items: [
      { path: "/enterprise/commercial", label: "Commercial Intelligence™", icon: BarChart3 },
      { path: "/cpq", label: "CPQ™", icon: Calculator },
      { path: "/cpq-dashboard", label: "Sales Pipeline", icon: TrendingUp },
    ]},
    { label: "Growth", items: [
      { path: "/pricing-admin", label: "Subscription Management", icon: DollarSign },
      { path: "/membership-admin", label: "Membership Programs", icon: Award },
      { path: "/referral-admin", label: "Referral Engine", icon: Gift },
      { path: "/founding-member-admin", label: "Founding Members", icon: Star },
      { path: "/elim", label: "ELIM™ Framework", icon: Brain },
      { path: "/payment-settings", label: "Payment Providers", icon: Lock },
    ]},
    { label: "Success Center", items: [
      { path: "/admin", label: "User Support", icon: Shield },
      { path: "/identity-verification-admin", label: "Identity Reviews", icon: ShieldCheck },
      { path: "/legacy-library/admin", label: "Legacy Moderation", icon: BookOpen },
      { path: "/feedback", label: "Feedback", icon: Lightbulb },
    ]},
    { label: "Reports", items: [
      { path: "/billing-admin", label: "Revenue Dashboard", icon: Receipt },
      { path: "/email-settings", label: "Email Center", icon: Mail },
      { path: "/company-admin", label: "Company Admin", icon: Database },
      { path: "/company-reports-admin", label: "Company Reports", icon: BarChart3 },
      { path: "/request-tracking", label: "Request Tracking", icon: ClipboardCheck },
      { path: "/developer/organizations", label: "Organizations", icon: Network },
    ]},
    { label: "Roadmap", items: [
      { path: "/developer/product", label: "Product Management™", icon: Boxes },
      { path: "/developer/launch-readiness", label: "Launch Readiness™", icon: Rocket },
      { path: "/release-readiness", label: "Release Readiness Command Center™", icon: ClipboardCheck },
      { path: "/feature-flags", label: "Feature Flag Center™", icon: Flag },
    ]},
  ],
  developer: [
    { label: "Documentation", items: [
      { path: "/developer-portal", label: "Developer Portal™", icon: FileText },
    ]},
    { label: "Architecture", items: [
      { path: "/architecture-governance", label: "Architecture Governance Board™", icon: Building2 },
    ]},
    { label: "Deployment", items: [
      { path: "/developer/deployments", label: "Deployment Center", icon: Rocket },
      { path: "/developer/migrations", label: "Migration History", icon: GitBranch },
    ]},
    { label: "Architecture", items: [
      { path: "/developer/architecture-audit", label: "Architecture Audit™", icon: Building2 },
      { path: "/developer/scalability", label: "Scalability™", icon: TrendingUp },
      { path: "/developer/performance-resilience", label: "Performance & Resilience™", icon: Gauge },
    ]},
    { label: "Registry", items: [
      { path: "/developer/report-registry", label: "Report Registry™", icon: FileText },
      { path: "/developer/form-lookup-registry", label: "Form Lookup Registry™", icon: ClipboardCheck },
    ]},
    { label: "APIs", items: [
      { path: "/developer/api-keys", label: "API Management", icon: KeyRound },
    ]},
    { label: "Security", items: [
      { path: "/developer/security-intelligence", label: "Security Intelligence™", icon: Shield },
      { path: "/guardian", label: "Guardian™", icon: ShieldCheck },
    ]},
    { label: "Privacy", items: [
      { path: "/privacy-compliance", label: "Privacy & Compliance Center™", icon: Lock },
    ]},
    { label: "AI", items: [
      { path: "/developer/cognitive", label: "Cognitive Excellence Engine™", icon: Brain },
      { path: "/developer/cognitive/memory", label: "AI Memory Intelligence™", icon: Brain },
      { path: "/developer/cognitive/personalization", label: "Personalization Intelligence™", icon: UserCircle },
      { path: "/developer/ai-command-center", label: "AI Command Center", icon: Cpu },
      { path: "/developer/knowledge-sync", label: "EXEC™ Knowledge Sync™", icon: Brain },
      { path: "/exec-admin", label: "EXEC™ Console", icon: Sparkles },
    ]},
    { label: "Platform Health", items: [
      { path: "/developer/executive-platform-status", label: "Executive Platform Status™", icon: Trophy },
      { path: "/exec-os", label: "EXEC™ Operating System™", icon: Sparkles },
      { path: "/developer", label: "Developer Dashboard", icon: LayoutDashboard },
      { path: "/developer/system-health", label: "System Health", icon: Activity },
      { path: "/developer/stability", label: "Platform Stability™", icon: Activity },
      { path: "/developer/diagnostics", label: "Platform Governance Center™", icon: Gauge },
      { path: "/developer/experience-audit", label: "Platform Autonomic Experience Engine™", icon: ClipboardCheck },
      { path: "/feature-management", label: "Feature Flags", icon: Boxes },
      { path: "/developer/database", label: "Database Explorer", icon: Database },
      { path: "/developer/audit-logs", label: "Audit Logs", icon: FileText },
    ]},
  ],
};

/* ======================= ROUTE → WORKSPACE MAP ======================= */

const ROUTE_WORKSPACE = {
  "/dashboard": ["executive"], "/academy": ["executive"], "/coach": ["executive"],
  "/simulator": ["executive"], "/debate": ["executive"], "/council": ["executive"],
  "/marketplace": ["executive"], "/network": ["executive"], "/career-studio": ["executive"],
  "/resume": ["executive"], "/companies": ["executive", "enterprise"],
  "/analytics": ["executive", "enterprise"],
  "/product-intelligence": ["operations"], "/journal": ["executive"],
  "/profile": ["executive"], "/founder": ["executive"], "/billing": ["executive"], "/wallet": ["executive"],
  "/organization/billing": ["enterprise"],
  "/settings": ["executive", "enterprise"], "/security": ["executive", "enterprise"],
  "/identity-verification": ["executive", "enterprise"],
  "/identity-verification-admin": ["operations"],
  "/beta-program": ["operations"],
  "/beta-operations": ["operations"],
  "/customer-lifecycle": ["operations"],
  "/release-readiness": ["operations", "developer"],
  "/feature-flags": ["operations", "developer"],
  "/exec-observability": ["operations"],
  "/system-status": ["operations"],
  "/exec-os": ["operations", "developer"],
  "/legacy-library/admin": ["operations"],
  "/feedback": ["executive", "enterprise", "operations"], "/challenge": ["executive"],
  "/leadership-dna": ["executive"],
  "/intelligence": ["executive"], "/executive-legacy": ["executive"], "/journey": ["executive"],
  "/executive-readiness": ["executive"], "/executive-passport": ["executive"],
  "/enterprise-intelligence": ["enterprise"],
  "/legacy-library": ["executive"],
  "/career": ["executive"], "/metrics": ["executive"],
  "/notifications": ["executive"], "/compare-plans": ["executive"],
  "/brand-center": ["executive"], "/executive/rankings": ["executive"], "/reputation": ["executive"],
  "/connected-accounts": ["executive"],
  "/enterprise": ["enterprise"], "/enterprise/organizations": ["enterprise"],
  "/enterprise/admin": ["enterprise"],
  "/enterprise/governance": ["enterprise", "operations", "developer"],
  "/enterprise/identity": ["enterprise"],
  "/enterprise/security": ["enterprise"],
  "/enterprise/procurement": ["enterprise"],
  "/enterprise/vendors": ["enterprise"],
  "/enterprise/commercial": ["enterprise", "operations"],
  "/hr-dashboard": ["enterprise"],
  "/succession-planning": ["enterprise"], "/promotion-readiness": ["enterprise"],
  "/learning-assignments": ["enterprise"], "/organization/users": ["enterprise"],
  "/sso": ["enterprise"], "/ai-usage": ["enterprise", "developer", "operations"],
  "/pricing-admin": ["operations"], "/membership-admin": ["operations"], "/billing-admin": ["operations"],
  "/elim": ["operations"],
  "/methodology": ["executive", "operations", "developer"],
  "/payment-settings": ["operations"], "/email-settings": ["operations"],
  "/company-admin": ["operations"], "/company-reports-admin": ["operations"],
  "/request-tracking": ["operations"], "/founding-member-admin": ["operations"],
  "/cpq": ["operations", "developer"], "/cpq-dashboard": ["operations", "developer"],
  "/admin": ["operations"],
  "/developer/organizations": ["operations", "developer"],
  "/architecture-governance": ["developer"],
  "/developer-portal": ["developer"],
  "/developer/audit-logs": ["developer"],
  "/developer/system-health": ["developer"],
  "/developer/architecture-audit": ["developer"],
  "/developer/stability": ["developer"],
  "/developer/launch-readiness": ["operations", "developer"],
  "/developer/scalability": ["developer"],
  "/developer/performance-resilience": ["developer"],
  "/developer/report-registry": ["developer"],
  "/developer/security-intelligence": ["developer"],
  "/developer/form-lookup-registry": ["developer"],
  "/developer/product": ["operations", "developer"],
  "/ai-command-center": ["executive"],
  "/developer/ai-command-center": ["developer"],
  "/developer": ["developer"], "/developer/executive-platform-status": ["developer"],
  "/developer/cognitive": ["developer"], "/developer/cognitive/memory": ["developer"],
  "/developer/cognitive/personalization": ["developer"],
  "/developer/knowledge-sync": ["developer"],
  "/developer/diagnostics": ["developer"],
  "/developer/experience-audit": ["developer"],
  "/developer/deployments": ["developer"],
  "/developer/migrations": ["developer"],
  "/developer/api-keys": ["developer"],
  "/developer/database": ["developer"],
  "/feature-management": ["developer"], "/guardian": ["developer"],
  "/trust-center": ["developer"],
  "/privacy-compliance": ["developer", "operations"],
  "/referrals": ["executive"], "/referral-admin": ["operations"],
  "/exec-admin": ["developer"],
};

export function getRouteWorkspace(path) {
  if (ROUTE_WORKSPACE[path]) return ROUTE_WORKSPACE[path];
  if (path.startsWith("/developer/")) return ["developer"];
  if (path.startsWith("/academy/")) return ["executive"];
  if (path.startsWith("/companies/")) return ["executive", "enterprise"];
  if (path.startsWith("/network/")) return ["executive"];
  if (path.startsWith("/founder")) return ["executive"];
  if (path.startsWith("/intelligence")) return ["executive"];
  if (path.startsWith("/cpq/")) return ["operations", "developer"];
  if (path.startsWith("/portal/")) return ["enterprise"];
  if (path.startsWith("/legacy-library/")) return ["executive"];
  return null;
}

/* ======================= VISIBILITY RULES ======================= */

const EXECUTIVE_ROLES = ["customer", "enterprise_user", "enterprise_manager", "enterprise_admin", "organization_owner", "support", "sales", "finance", "content_manager", "platform_admin", "developer", "super_admin"];
const ENTERPRISE_ROLES = ["enterprise_user", "enterprise_manager", "enterprise_admin", "organization_owner", "super_admin"];
const OPERATIONS_ROLES = ["platform_admin", "security_admin", "support", "sales", "finance", "content_manager", "super_admin"];
const DEVELOPER_ROLES = ["developer", "super_admin"];

export function getAvailableWorkspaces(role, plan, profile, isImpersonating = false) {
  const r = normalizeRole(role);
  const available = [];
  if (EXECUTIVE_ROLES.includes(r)) available.push("executive");
  if (ENTERPRISE_ROLES.includes(r) || (!isImpersonating && profile?.organization_id) || plan === "enterprise") available.push("enterprise");
  if (OPERATIONS_ROLES.includes(r)) available.push("operations");
  if (DEVELOPER_ROLES.includes(r)) available.push("developer");
  return available;
}

export function getDefaultWorkspace(available, role) {
  const r = normalizeRole(role);
  if (r === "developer" && available.includes("developer")) return "developer";
  if (r === "security_admin" && available.includes("operations")) return "operations";
  if (r === "super_admin") return available[0] || "executive";
  if (OPERATIONS_ROLES.includes(r) && available.includes("operations")) return "operations";
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
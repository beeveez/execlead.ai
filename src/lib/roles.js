import {
  LayoutDashboard, GraduationCap, MessageSquare, Brain, Scale,
  Briefcase, FileText, Building2, BarChart3, PenLine,
  UserCircle, CreditCard, Settings as SettingsIcon,
  Network, ClipboardCheck, Users, Shield, DollarSign, Receipt,
  Lock, KeyRound, Code2, Calculator, Database, Mail, Boxes, Store,
  Cpu, TrendingUp, GitBranch, Rocket, ShieldCheck, Lightbulb,
  Home, Target, Gauge, GitCompare, Compass, Award, Layers, Bell, Trophy, BadgeCheck, Star
} from "lucide-react";

// ============================================================
// ROLE DEFINITIONS
// Roles are INDEPENDENT of subscription plans.
//   - Subscription plans unlock product features (FeatureGate).
//   - Roles govern access scope and navigation visibility.
// Plans must NEVER grant administrative access — only roles do.
// ============================================================

export const ROLES = {
  guest: { label: "Guest", tier: 0, description: "Unauthenticated visitor" },
  customer: { label: "Customer", tier: 10, description: "Standard platform user" },
  enterprise_user: { label: "Enterprise User", tier: 20, description: "Enterprise organization member" },
  enterprise_manager: { label: "Enterprise Manager", tier: 25, description: "Enterprise team manager" },
  enterprise_admin: { label: "Enterprise Admin", tier: 30, description: "Enterprise organization administrator" },
  hrbp: { label: "HR Business Partner", tier: 31, description: "Organization-scoped talent intelligence access" },
  leadership_development_head: { label: "Head of Leadership Development", tier: 32, description: "Enterprise leadership development access" },
  talent_director: { label: "Talent Director", tier: 33, description: "Enterprise talent and succession administration" },
  vp_talent_management: { label: "VP Talent Management", tier: 34, description: "Enterprise talent intelligence leadership" },
  chro: { label: "CHRO", tier: 35, description: "Executive organization talent intelligence access" },
  organization_owner: { label: "Organization Owner", tier: 36, description: "Organization owner with full admin access" },
  support: { label: "Support", tier: 40, description: "Customer support agent" },
  sales: { label: "Sales", tier: 45, description: "Sales representative" },
  finance: { label: "Finance", tier: 50, description: "Finance and billing manager" },
  content_manager: { label: "Content Manager", tier: 55, description: "Learning content and company data manager" },
  reviewer: { label: "Reviewer", tier: 60, description: "Identity and content review specialist" },
  product_manager: { label: "Product Manager", tier: 65, description: "Product management and roadmap access" },
  platform_admin: { label: "Platform Admin", tier: 90, description: "Platform-wide administration" },
  security_admin: { label: "Security Admin", tier: 93, description: "Security operations and compliance administration" },
  developer: { label: "Developer", tier: 95, description: "Developer tools and diagnostics" },
  super_admin: { label: "Super Admin", tier: 100, description: "Unrestricted platform access" },
  founder_root_admin: { label: "Founder Root Admin", tier: 110, description: "Founder-level enterprise and platform access" },

  // Legacy role entries — kept for backward compatibility, excluded from ROLE_LIST
  free_user: { label: "Free User", tier: 10, description: "Legacy — maps to Customer", legacy: true },
  professional_user: { label: "Professional User", tier: 10, description: "Legacy — maps to Customer", legacy: true },
  executive_user: { label: "Executive User", tier: 10, description: "Legacy — maps to Customer", legacy: true },
  instructor: { label: "Instructor", tier: 55, description: "Legacy — maps to Content Manager", legacy: true },
  coach: { label: "Coach", tier: 10, description: "Legacy — maps to Customer", legacy: true },
  admin: { label: "Admin", tier: 100, description: "Legacy — maps to Super Admin", legacy: true },
  user: { label: "User", tier: 10, description: "Legacy — maps to Customer", legacy: true },
};

// Legacy role → normalized role
const ROLE_ALIASES = {
  admin: "super_admin",
  user: "customer",
  free_user: "customer",
  professional_user: "customer",
  executive_user: "customer",
  instructor: "content_manager",
  coach: "customer",
};

export function normalizeRole(role) {
  if (!role) return "customer";
  if (ROLE_ALIASES[role]) return ROLE_ALIASES[role];
  if (ROLES[role]) return role;
  return "customer";
}

// Maps UserProfile.custom_role display strings to role keys
const CUSTOM_ROLE_MAP = {
  "organization owner": "organization_owner",
  "enterprise admin": "enterprise_admin",
  "enterprise manager": "enterprise_manager",
  "enterprise user": "enterprise_user",
  "hr business partner": "hrbp",
  "head of leadership development": "leadership_development_head",
  "talent director": "talent_director",
  "vp talent management": "vp_talent_management",
  "chro": "chro",
};

// Computes the effective role from User.role + UserProfile (org membership + custom_role).
// Necessary because User.role cannot be changed by the app — enterprise activation
// writes custom_role + organization_id to the profile instead.
export function getEffectiveRole(userRole, profile) {
  const baseRole = normalizeRole(userRole);

  // Platform-level administrative roles take precedence
  if (["super_admin", "founder_root_admin", "platform_admin", "developer", "support", "sales", "finance", "content_manager", "hrbp", "leadership_development_head", "talent_director", "vp_talent_management", "chro"].includes(baseRole)) {
    return baseRole;
  }

  // Enterprise membership via profile
  if (profile?.organization_id) {
    const customRole = CUSTOM_ROLE_MAP[(profile.custom_role || "").toLowerCase()];
    if (customRole) return customRole;
    return "enterprise_user";
  }

  return baseRole;
}

export function canAccessDeveloperWorkspace(role) {
  const r = normalizeRole(role);
  return r === "developer" || r === "super_admin";
}

// ============================================================
// ROLE SETS — control nav group visibility
// ============================================================

const ALL_AUTHED = [
  "customer", "enterprise_user", "enterprise_manager", "enterprise_admin", "organization_owner",
  "hrbp", "leadership_development_head", "talent_director", "vp_talent_management", "chro",
  "support", "sales", "finance", "content_manager", "reviewer", "platform_admin", "security_admin", "developer", "super_admin",
];
// Customer sidebar roles — excludes enterprise roles so enterprise users
// get the Enterprise sidebar instead of the individual customer sidebar.
const CUSTOMER_NAV_ROLES = ["customer", "support", "sales", "finance", "content_manager", "platform_admin", "super_admin"];
const TALENT_INTELLIGENCE_ROLES = ["hrbp", "leadership_development_head", "talent_director", "vp_talent_management", "chro"];
const ENTERPRISE_INTELLIGENCE_ROLES = ["enterprise_admin", "platform_admin", "super_admin", "founder_root_admin"];
const ENTERPRISE_ROLES = ["enterprise_user", "enterprise_manager", "enterprise_admin", ...TALENT_INTELLIGENCE_ROLES, "organization_owner", "platform_admin", "super_admin"];
const ENTERPRISE_ADMIN_ROLES = ["enterprise_admin", "talent_director", "chro", "organization_owner", "platform_admin", "super_admin"];

// ============================================================
// NAVIGATION GROUPS — single source of truth for the sidebar.
// Filtered by role via getNavGroups().
// ============================================================

export const NAV_GROUPS = [
  {
    label: "Platform",
    roles: CUSTOMER_NAV_ROLES,
    items: [
      { path: "/home", label: "Home", icon: Home },
      { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { path: "/ai-command-center", label: "AI Command Center", icon: Cpu },
      { path: "/onboarding", label: "Onboarding", icon: Rocket },
      { path: "/challenge", label: "Daily Challenge", icon: Target },
      { path: "/academy", label: "Academy", icon: GraduationCap },
      { path: "/coach", label: "Coach", icon: MessageSquare },
      { path: "/simulator", label: "Simulator", icon: Brain },
      { path: "/debate", label: "Debate", icon: Scale },
      { path: "/marketplace", label: "Marketplace", icon: Store },
    ],
  },
  {
    label: "Career",
    roles: CUSTOMER_NAV_ROLES,
    items: [
      { path: "/career", label: "Career Advisor", icon: Compass },
      { path: "/career-studio", label: "Career Studio", icon: Briefcase },
      { path: "/resume", label: "Resume AI", icon: FileText },
      { path: "/companies", label: "Companies", icon: Building2 },
      { path: "/companies/compare", label: "Compare Companies", icon: GitCompare },
      { path: "/executive-legacy", label: "Executive Legacy", icon: Award },
      { path: "/journal", label: "Journal", icon: PenLine },
    ],
  },
  {
    label: "Insights",
    roles: CUSTOMER_NAV_ROLES,
    items: [
      { path: "/metrics", label: "Metrics", icon: Gauge },
      { path: "/analytics", label: "Analytics", icon: BarChart3 },
      { path: "/reputation", label: "Executive Reputation", icon: Star },
      { path: "/executive/rankings", label: "Executive Rankings", icon: Trophy },
      { path: "/brand-center", label: "Brand Center", icon: BadgeCheck },
    ],
  },
  {
    label: "Account",
    roles: CUSTOMER_NAV_ROLES,
    items: [
      { path: "/profile", label: "Profile", icon: UserCircle },
      { path: "/billing", label: "Billing", icon: CreditCard },
      { path: "/compare-plans", label: "Compare Plans", icon: Layers },
      { path: "/cpq/quotes", label: "My Proposals", icon: FileText },
      { path: "/notifications", label: "Notifications", icon: Bell },
      { path: "/settings", label: "Settings", icon: SettingsIcon },
      { path: "/security", label: "Security Center", icon: ShieldCheck },
      { path: "/feedback", label: "Feedback", icon: Lightbulb },
    ],
  },

  // Enterprise Sidebar — organizational workspace (replaces customer sidebar)
  {
    label: "Enterprise Workspace",
    roles: ENTERPRISE_ROLES,
    items: [
      { path: "/enterprise", label: "Enterprise Dashboard", icon: LayoutDashboard },
      { path: "/ai-command-center", label: "AI Command Center", icon: Cpu },
      { path: "/academy", label: "Executive Academy", icon: GraduationCap },
      { path: "/coach", label: "Executive Coach", icon: MessageSquare },
      { path: "/simulator", label: "Executive Simulator", icon: Brain },
      { path: "/council", label: "Executive Council", icon: Network },
      { path: "/leadership-dna", label: "Leadership DNA", icon: Scale },
      { path: "/marketplace", label: "Marketplace", icon: Store },
    ],
  },
  {
    label: "Organization",
    roles: ENTERPRISE_ROLES,
    items: [
      { path: "/companies", label: "Organization Intelligence", icon: Building2 },
      { path: "/analytics", label: "Leadership Analytics", icon: BarChart3 },
      { path: "/hr-dashboard", label: "Department Analytics", icon: Users },
      { path: "/learning-assignments", label: "Learning Assignments", icon: ClipboardCheck },
      { path: "/promotion-readiness", label: "Promotion Readiness", icon: TrendingUp },
    ],
  },
  {
    label: "Administration",
    roles: ENTERPRISE_ADMIN_ROLES,
    items: [
      { path: "/organization/users", label: "User Management", icon: Shield },
      { path: "/succession-planning", label: "Seat Management", icon: Users },
      { path: "/sso", label: "SSO & Identity", icon: KeyRound },
      { path: "/settings", label: "Organization Settings", icon: SettingsIcon },
    ],
  },
  {
    label: "Account & Billing",
    roles: ENTERPRISE_ROLES,
    items: [
      { path: "/billing", label: "Billing & Invoices", icon: CreditCard },
      { path: "/ai-usage", label: "Usage", icon: Cpu },
      { path: "/connected-accounts", label: "API Integrations", icon: KeyRound },
      { path: "/profile", label: "Profile", icon: UserCircle },
      { path: "/security", label: "Security Center", icon: ShieldCheck },
      { path: "/feedback", label: "Feedback", icon: Lightbulb },
    ],
  },

  // Functional roles — scoped toolsets added to the customer sidebar
  {
    label: "Support",
    roles: ["support", "platform_admin", "super_admin"],
    items: [
      { path: "/admin", label: "User Support", icon: Shield },
    ],
  },
  {
    label: "Sales",
    roles: ["sales", "platform_admin", "super_admin"],
    items: [
      { path: "/cpq", label: "CPQ Wizard", icon: Calculator },
      { path: "/cpq-dashboard", label: "Sales Pipeline", icon: TrendingUp },
    ],
  },
  {
    label: "Finance",
    roles: ["finance", "platform_admin", "super_admin"],
    items: [
      { path: "/billing-admin", label: "Billing Admin", icon: Receipt },
      { path: "/payment-settings", label: "Payment Settings", icon: Lock },
    ],
  },
  {
    label: "Content",
    roles: ["content_manager", "platform_admin", "super_admin"],
    items: [
      { path: "/company-admin", label: "Company Admin", icon: Database },
    ],
  },

  // Developer Mode — Developer + Super Admin only
  {
    label: "Developer",
    roles: ["developer", "super_admin"],
    items: [
      { path: "/developer", label: "Developer Console", icon: Code2 },
      { path: "/feature-management", label: "Feature Flags", icon: Boxes },
      { path: "/guardian", label: "Guardian", icon: ShieldCheck },
      { path: "/developer/audit-logs", label: "Audit Logs", icon: FileText },
      { path: "/developer/system-health", label: "System Health", icon: Cpu },
      { path: "/developer/api-keys", label: "API Keys", icon: KeyRound },
      { path: "/developer/database", label: "Database Tools", icon: Database },
      { path: "/developer/migrations", label: "Migration History", icon: GitBranch },
      { path: "/developer/deployments", label: "Deployment Center", icon: Rocket },
      { path: "/developer/organizations", label: "Organization Admin", icon: Network },
    ],
  },

  // Platform Administration — Platform Admin + Super Admin
  {
    label: "Platform Administration",
    roles: ["platform_admin", "super_admin"],
    items: [
      { path: "/pricing-admin", label: "Pricing Admin", icon: DollarSign },
      { path: "/billing-admin", label: "Billing Admin", icon: Receipt },
      { path: "/payment-settings", label: "Payment Settings", icon: Lock },
      { path: "/email-settings", label: "Email Settings", icon: Mail },
      { path: "/sso", label: "SSO & Identity", icon: KeyRound },
      { path: "/company-admin", label: "Company Admin", icon: Database },
      { path: "/cpq", label: "CPQ Wizard", icon: Calculator },
      { path: "/cpq-dashboard", label: "Sales Pipeline", icon: TrendingUp },
    ],
  },

  // Super Admin — full system access
  {
    label: "System",
    roles: ["super_admin"],
    items: [
      { path: "/admin", label: "Admin", icon: Shield },
      { path: "/developer", label: "Developer", icon: Code2 },
      { path: "/feature-management", label: "Feature Flags", icon: Boxes },
      { path: "/guardian", label: "Guardian", icon: ShieldCheck },
      { path: "/admin", label: "Audit Logs", icon: FileText },
      { path: "/developer", label: "System Health", icon: Cpu },
    ],
  },
];

export const DEVELOPER_WORKSPACE_NAV = [
  {
    label: "Developer Command Center™",
    items: [
      { path: "/developer", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Platform Operations",
    items: [
      { path: "/developer/system-health", label: "System Health", icon: Cpu },
      { path: "/developer/experience-audit", label: "Experience Audit", icon: ClipboardCheck },
    ],
  },
  {
    label: "Security & Trust",
    items: [
      { path: "/guardian", label: "Guardian", icon: ShieldCheck },
      { path: "/developer/audit-logs", label: "Audit Logs", icon: FileText },
    ],
  },
  {
    label: "Engineering",
    items: [
      { path: "/developer/api-keys", label: "API Keys", icon: KeyRound },
      { path: "/developer/database", label: "Database Tools", icon: Database },
      { path: "/developer/migrations", label: "Migration History", icon: GitBranch },
      { path: "/developer/deployments", label: "Deployment Center", icon: Rocket },
    ],
  },
  {
    label: "Configuration",
    items: [
      { path: "/feature-management", label: "Feature Flags", icon: Boxes },
    ],
  },
  {
    label: "System Administration",
    items: [
      { path: "/admin", label: "Admin Console", icon: Shield },
      { path: "/enterprise", label: "Enterprise Admin", icon: Building2 },
      { path: "/organization/users", label: "User Management", icon: Users },
      { path: "/developer/organizations", label: "Organizations", icon: Network },
      { path: "/pricing-admin", label: "Pricing Admin", icon: DollarSign },
      { path: "/billing-admin", label: "Billing Admin", icon: Receipt },
      { path: "/email-settings", label: "Email Settings", icon: Mail },
      { path: "/payment-settings", label: "Payment Providers", icon: Lock },
      { path: "/cpq", label: "CPQ Wizard", icon: Calculator },
      { path: "/cpq-dashboard", label: "Sales Pipeline", icon: TrendingUp },
      { path: "/company-admin", label: "Company Admin", icon: Database },
    ],
  },
];

export function getNavGroups(role) {
  const normalized = normalizeRole(role);
  return NAV_GROUPS
    .filter(g => g.roles.includes(normalized))
    .map(g => ({ label: g.label, items: g.items }))
    .filter(g => g.items.length > 0);
}

// ============================================================
// ROUTE ACCESS ENFORCEMENT
// Enforced on EVERY route via <RoleRoute>.
// Routes not listed here are accessible to any authenticated user
// (customer features). Plan-based feature gating is handled
// separately by <FeatureGate> at the route level.
// ============================================================

export const ROUTE_ACCESS = {
  "/developer/ai-command-center": ["developer", "super_admin"],
  "/enterprise": ENTERPRISE_ROLES,
  "/enterprise/intelligence": ENTERPRISE_INTELLIGENCE_ROLES,
  "/enterprise/chro-dashboard": ENTERPRISE_INTELLIGENCE_ROLES,
  "/enterprise/talent-analytics": ENTERPRISE_INTELLIGENCE_ROLES,
  "/enterprise/promotion-forecasts": ENTERPRISE_INTELLIGENCE_ROLES,
  "/enterprise/succession": ENTERPRISE_INTELLIGENCE_ROLES,
  "/enterprise/high-potential": ENTERPRISE_INTELLIGENCE_ROLES,
  "/enterprise/high-potential-watchlist": ENTERPRISE_INTELLIGENCE_ROLES,
  "/hr-dashboard": ENTERPRISE_ROLES,
  "/succession-planning": ENTERPRISE_ROLES,
  "/promotion-readiness": ENTERPRISE_ROLES,
  "/learning-assignments": ENTERPRISE_ROLES,
  "/organization/users": ENTERPRISE_ADMIN_ROLES,
  "/sso": ENTERPRISE_ADMIN_ROLES,
  "/admin": ["enterprise_admin", "platform_admin", "super_admin", "support"],
  "/developer": ["developer", "super_admin"],
  "/developer/audit-logs": ["developer", "super_admin"],
  "/developer/system-health": ["developer", "super_admin"],
  "/developer/api-keys": ["developer", "super_admin"],
  "/developer/database": ["developer", "super_admin"],
  "/developer/migrations": ["developer", "super_admin"],
  "/developer/deployments": ["developer", "super_admin"],
  "/developer/organizations": ["developer", "super_admin"],
  "/developer/experience-audit": ["developer", "super_admin"],
  "/feature-management": ["developer", "super_admin"],
  "/guardian": ["developer", "super_admin"],
  "/pricing-admin": ["platform_admin", "super_admin"],
  "/billing-admin": ["platform_admin", "super_admin", "finance"],
  "/payment-settings": ["platform_admin", "super_admin", "finance"],
  "/cpq-dashboard": ["platform_admin", "super_admin", "sales"],
  "/company-admin": ["platform_admin", "super_admin", "content_manager"],
  "/email-settings": ["platform_admin", "super_admin"],
};

export function canAccessRoute(role, path) {
  const normalized = normalizeRole(role);
  const allowed = path.startsWith("/enterprise/candidate/") ? ENTERPRISE_INTELLIGENCE_ROLES : ROUTE_ACCESS[path];
  if (!allowed) return true; // customer route — any authenticated user
  return allowed.includes(normalized);
}

// ============================================================
// BACKWARD-COMPATIBLE HELPERS
// ============================================================

export const ROLE_LIST = Object.entries(ROLES)
  .filter(([key, val]) => key !== "guest" && !val.legacy)
  .map(([key, val]) => ({ id: key, ...val }));

export function getRoleInfo(role) {
  const normalized = normalizeRole(role);
  return ROLES[normalized] || ROLES.customer;
}

export function getRoleTier(role) {
  return getRoleInfo(role).tier;
}

export function getRolePlan(role) {
  const r = normalizeRole(role);
  if (["platform_admin", "super_admin", "enterprise_admin", "enterprise_manager", "organization_owner", "enterprise_user", "hrbp", "leadership_development_head", "talent_director", "vp_talent_management", "chro"].includes(r)) return "enterprise";
  return "free";
}

export function isSuperAdmin(role) {
  return normalizeRole(role) === "super_admin";
}

export function isPlatformAdmin(role) {
  const r = normalizeRole(role);
  return r === "platform_admin" || r === "super_admin";
}

export function isEnterpriseAdmin(role) {
  const r = normalizeRole(role);
  return ["enterprise_admin", "organization_owner", "platform_admin", "super_admin"].includes(r);
}

export function isAdminLevel(role) {
  const r = normalizeRole(role);
  return ["enterprise_admin", "organization_owner", "platform_admin", "super_admin"].includes(r);
}
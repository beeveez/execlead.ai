/**
 * EXECLEAD.AI — Central Route Registry
 * -------------------------------------
 * The single source of truth for every route in the platform.
 * Derived from App.jsx (route → component) and enriched with
 * permissions (roles.js), features & plans (featureCatalog.js),
 * and navigation references (NAV_GROUPS).
 *
 * Each entry: { name, url, component, permission, feature, plan,
 *   status, owner, version, deprecated, lastUpdated, public, navRefs }
 */
import { ROUTE_ACCESS } from "./roles";
import { WORKSPACE_NAV } from "./workspaces";
import { DEFAULT_FEATURES, FEATURE_REGISTRY, PLAN_TIERS, normalizeFeature, isFeatureLive } from "./featureCatalog";

const ROUTE_VERSION = "2.0";
const LAST_UPDATED = "2026-07-07";

// Route → component map (mirrors src/App.jsx <Route> declarations)
const APP_ROUTES = [
  { path: "/", component: "Landing", public: true },
  { path: "/pricing", component: "Pricing", public: true },
  { path: "/login", component: "Login", public: true },
  { path: "/register", component: "Register", public: true },
  { path: "/forgot-password", component: "ForgotPassword", public: true },
  { path: "/reset-password", component: "ResetPassword", public: true },
  { path: "/legal", component: "Legal", public: true },
  { path: "/about", component: "About", public: true },
  { path: "/contact", component: "Contact", public: true },
  { path: "/u/:username", component: "PublicProfile", public: true },
  { path: "/onboarding", component: "Onboarding" },
  { path: "/home", component: "WorkspaceHome" },
  { path: "/dashboard", component: "Dashboard" },
  { path: "/ai-command-center", component: "AICommandCenter" },
  { path: "/developer/ai-command-center", component: "DeveloperAICommandCenter" },
  { path: "/challenge", component: "Challenge", feature: "daily_executive_challenge" },
  { path: "/coach", component: "Coach" },
  { path: "/simulator", component: "Simulator", feature: "executive_simulator" },
  { path: "/debate", component: "Debate", feature: "executive_debate" },
  { path: "/council", component: "ExecutiveCouncil", feature: "executive_council" },
  { path: "/marketplace", component: "Marketplace", feature: "marketplace" },
  { path: "/academy", component: "Academy", feature: "executive_academy" },
  { path: "/academy/:courseSlug", component: "CourseHome", feature: "executive_academy" },
  { path: "/academy/:courseSlug/:lessonId", component: "Lesson", feature: "executive_academy" },
  { path: "/metrics", component: "Metrics" },
  { path: "/companies", component: "Companies", feature: "company_intelligence" },
  { path: "/companies/compare", component: "CompanyCompare", feature: "company_intelligence" },
  { path: "/companies/:id", component: "CompanyDetail", feature: "company_intelligence" },
  { path: "/career", component: "Career", feature: "career_advisor" },
  { path: "/analytics", component: "Analytics", feature: "leadership_analytics" },
  { path: "/leadership-dna", component: "LeadershipDNA", feature: "leadership_dna" },
  { path: "/intelligence", component: "ExecutiveIntelligenceCenter" },
  { path: "/intelligence/competencies", component: "ExecutiveIntelligenceCenter" },
  { path: "/executive-legacy", component: "ExecutiveLegacy", feature: "executive_legacy" },
  { path: "/journal", component: "Journal", feature: "executive_journal" },
  { path: "/resume", component: "ResumeIntelligence", feature: "resume_intelligence" },
  { path: "/career-studio", component: "CareerStudio", feature: "career_studio" },
  { path: "/compare-plans", component: "ComparePlans" },
  { path: "/profile", component: "Profile" },
  { path: "/billing", component: "Billing" },
  { path: "/notifications", component: "Notifications" },
  { path: "/ai-usage", component: "AIUsage", feature: "ai_usage_dashboard" },
  { path: "/enterprise", component: "EnterpriseDashboard", feature: "team_dashboard" },
  { path: "/admin", component: "AdminConsole", feature: "admin_console" },
  { path: "/pricing-admin", component: "PricingAdmin" },
  { path: "/feature-management", component: "FeatureManagement" },
  { path: "/settings", component: "Settings" },
  { path: "/security", component: "SecurityCenter" },
  { path: "/connected-accounts", component: "ConnectedAccounts" },
  { path: "/billing-admin", component: "BillingAdmin" },
  { path: "/payment-settings", component: "PaymentSettings" },
  { path: "/developer", component: "DeveloperConsole" },
  { path: "/developer/audit-logs", component: "AuditLogs" },
  { path: "/developer/system-health", component: "SystemHealth" },
  { path: "/developer/api-keys", component: "ApiKeys" },
  { path: "/developer/database", component: "DatabaseTools" },
  { path: "/developer/migrations", component: "MigrationHistory" },
  { path: "/developer/deployments", component: "DeploymentCenter" },
  { path: "/developer/organizations", component: "OrganizationAdmin" },
  { path: "/developer/experience-audit", component: "PlatformExperienceAudit", name: "Platform Autonomic Experience Engine™" },
  { path: "/cpq", component: "CPQWizard" },
  { path: "/cpq-dashboard", component: "CPQDashboard" },
  { path: "/company-admin", component: "CompanyAdmin" },
  { path: "/email-settings", component: "EmailSettings" },
  { path: "/organization/users", component: "OrganizationUsers" },
  { path: "/cpq/quotes", component: "MyQuotes" },
  { path: "/cpq/quote/:id", component: "CPQQuoteView" },
  { path: "/portal/:quoteId", component: "EnterprisePortal" },
  { path: "/hr-dashboard", component: "HRDashboard", feature: "hr_dashboard" },
  { path: "/succession-planning", component: "SuccessionPlanning", feature: "succession_planning" },
  { path: "/promotion-readiness", component: "PromotionReadiness", feature: "promotion_readiness" },
  { path: "/learning-assignments", component: "LearningAssignments", feature: "learning_assignments" },
  { path: "/sso", component: "SSOIdentity", feature: "sso" },
  { path: "/leaderboard", component: "Leaderboard", public: true },
  { path: "/reputation", component: "Reputation" },
  { path: "/executive/rankings", component: "ExecutiveRankings" },
  { path: "/brand-center", component: "ExecutiveBrandCenter" },
  { path: "/feedback", component: "Feedback" },
  { path: "/guardian", component: "Guardian", feature: null, public: false },
  // Routes registered from App.jsx layout routes and feature pages
  { path: "/network", component: "NetworkFeed" },
  { path: "/methodology", component: "EELMMethodology" },
  { path: "/journey", component: "Journey" },
  { path: "/executive-readiness", component: "ExecutiveReadiness" },
  { path: "/executive-passport", component: "ExecutivePassport" },
  { path: "/legacy-library", component: "LegacyLibrary" },
  { path: "/founder", component: "FounderOverview" },
  { path: "/referrals", component: "ReferralDashboard" },
  { path: "/wallet", component: "ExecutiveWallet" },
  { path: "/identity-verification", component: "IdentityVerification" },
  { path: "/enterprise-intelligence", component: "EnterpriseIntelligence" },
  { path: "/organization/billing", component: "OrganizationBilling" },
  { path: "/membership-admin", component: "MembershipAdmin" },
  { path: "/elim", component: "ELIMManagementCenter" },
  { path: "/referral-admin", component: "ReferralAdmin" },
  { path: "/identity-verification-admin", component: "IdentityVerificationAdmin" },
  { path: "/legacy-library/admin", component: "LegacyAdmin" },
  { path: "/developer/diagnostics", component: "Diagnostics" },
  { path: "/exec-admin", component: "ExecAdmin" },
];

const ALL_NAV_ITEMS = Object.values(WORKSPACE_NAV).flatMap((groups) =>
  groups.flatMap((g) => g.items.map((i) => ({ ...i, group: g.label })))
);

function routeMatches(known, path) {
  if (known === path) return true;
  const a = known.split("/").filter(Boolean);
  const b = path.split("/").filter(Boolean);
  if (a.length !== b.length) return false;
  return a.every((p, i) => p.startsWith(":") || p === b[i]);
}

function deriveName(path, component) {
  if (component) return component.replace(/([A-Z])/g, " $1").trim();
  return path.split("/").filter(Boolean).pop() || path;
}

function buildRegistry() {
  const seen = new Set();
  return APP_ROUTES.map((r) => {
    const feature = r.feature || null;
    const featureDef = feature ? DEFAULT_FEATURES.find((f) => f.id === feature) : null;
    const reg = feature ? FEATURE_REGISTRY[feature] : null;
    const plan = featureDef ? featureDef.minimumPlan : (r.public ? "public" : "free");
    const permission = ROUTE_ACCESS[r.path] || null;
    const navRefs = ALL_NAV_ITEMS.filter((i) => routeMatches(r.path, i.path));
    const status = featureDef ? (normalizeFeature(featureDef).status || "live") : "live";
    const deprecated = status === "deprecated" || status === "archived";
    const owner = reg?.module || featureDef?.category || (r.public ? "Public" : "Platform");
    const duplicate = seen.has(r.path);
    seen.add(r.path);
    return {
      name: r.name || deriveName(r.path, r.component),
      url: r.path,
      component: r.component,
      permission: permission ? permission.join(", ") : "authenticated",
      permissionRaw: permission,
      feature,
      plan,
      status,
      owner,
      version: ROUTE_VERSION,
      deprecated,
      lastUpdated: LAST_UPDATED,
      public: !!r.public,
      navRefs: navRefs.map((n) => ({ label: n.label, group: n.group })),
      hasComponent: !!r.component,
      duplicate,
    };
  });
}

export const ROUTE_REGISTRY = buildRegistry();

export function getRouteByPath(path) {
  return ROUTE_REGISTRY.find((r) => routeMatches(r.url, path));
}

export function routeExists(path) {
  return ROUTE_REGISTRY.some((r) => routeMatches(r.url, path));
}

export { routeMatches };
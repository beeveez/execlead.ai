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
  { path: "/dashboard", component: "Dashboard", feature: "basic_dashboard" },
  { path: "/ai-command-center", component: "AICommandCenter", feature: "ai_command_center" },
  { path: "/developer/ai-command-center", component: "DeveloperAICommandCenter", feature: "developer_access" },
  { path: "/challenge", component: "Challenge", feature: "daily_executive_challenge" },
  { path: "/coach", component: "Coach", feature: "executive_coach" },
  { path: "/simulator", component: "Simulator", feature: "executive_simulator" },
  { path: "/debate", component: "Debate", feature: "executive_debate" },
  { path: "/council", component: "ExecutiveCouncil", feature: "executive_council" },
  { path: "/marketplace", component: "Marketplace", feature: "marketplace" },
  { path: "/academy", component: "Academy", feature: "executive_academy" },
  { path: "/academy/:courseSlug", component: "CourseHome", feature: "executive_academy" },
  { path: "/academy/:courseSlug/:lessonId", component: "Lesson", feature: "executive_academy" },
  { path: "/metrics", component: "Metrics", feature: "leadership_analytics" },
  { path: "/companies", component: "Companies", feature: "company_intelligence" },
  { path: "/companies/compare", component: "CompanyCompare", feature: "company_intelligence" },
  { path: "/companies/:id", component: "CompanyDetail", feature: "company_intelligence" },
  { path: "/career", component: "Career", feature: "career_advisor" },
  { path: "/analytics", component: "Analytics", feature: "leadership_analytics" },
  { path: "/leadership-dna", component: "LeadershipDNA", feature: "leadership_dna" },
  { path: "/intelligence", component: "ExecutiveIntelligenceCenter", feature: "basic_analytics" },
  { path: "/intelligence/competencies", component: "ExecutiveIntelligenceCenter", feature: "basic_analytics" },
  { path: "/executive-legacy", component: "ExecutiveLegacy", feature: "executive_legacy" },
  { path: "/journal", component: "Journal", feature: "executive_journal" },
  { path: "/resume", component: "ResumeIntelligence", feature: "resume_intelligence" },
  { path: "/career-studio", component: "CareerStudio", feature: "career_studio" },
  { path: "/compare-plans", component: "ComparePlans" },
  { path: "/profile", component: "Profile", feature: "basic_dashboard" },
  { path: "/billing", component: "Billing", feature: "billing_access" },
  { path: "/notifications", component: "Notifications" },
  { path: "/ai-usage", component: "AIUsage", feature: "ai_usage_dashboard" },
  { path: "/enterprise", component: "EnterpriseDashboard", feature: "team_dashboard" },
  { path: "/admin", component: "AdminConsole", feature: "admin_console" },
  { path: "/pricing-admin", component: "PricingAdmin", feature: "subscription_management" },
  { path: "/feature-management", component: "FeatureManagement", feature: "feature_flag_management" },
  { path: "/settings", component: "Settings", feature: "basic_dashboard" },
  { path: "/security", component: "SecurityCenter", feature: "security_access" },
  { path: "/connected-accounts", component: "ConnectedAccounts", feature: "connected_accounts" },
  { path: "/billing-admin", component: "BillingAdmin", feature: "revenue_dashboard" },
  { path: "/payment-settings", component: "PaymentSettings", feature: "payment_providers" },
  { path: "/developer", component: "DeveloperConsole", feature: "developer_access" },
  { path: "/developer/executive-platform-status", component: "ExecutivePlatformStatus", name: "Executive Platform Status™", feature: "developer_access" },
  { path: "/developer/audit-logs", component: "AuditLogs", feature: "developer_access" },
  { path: "/developer/system-health", component: "SystemHealth", feature: "developer_access" },
  { path: "/developer/api-keys", component: "ApiKeys", feature: "developer_access" },
  { path: "/developer/database", component: "DatabaseTools", feature: "developer_access" },
  { path: "/developer/migrations", component: "MigrationHistory", feature: "developer_access" },
  { path: "/developer/deployments", component: "DeploymentCenter", feature: "developer_access" },
  { path: "/developer/organizations", component: "OrganizationAdmin", feature: "enterprise_management" },
  { path: "/developer/experience-audit", component: "PlatformExperienceAudit", name: "Platform Autonomic Experience Engine™", feature: "developer_access" },
  { path: "/developer/cognitive", component: "CognitiveExcellenceDashboard", name: "Cognitive Excellence Engine™", feature: "developer_access" },
  { path: "/developer/cognitive/memory", component: "AIMemoryIntelligence", name: "AI Memory Intelligence™", feature: "developer_access" },
  { path: "/developer/cognitive/personalization", component: "PersonalizationIntelligence", name: "Personalization Intelligence™", feature: "developer_access" },
  { path: "/cpq", component: "CPQWizard", feature: "cpq_access" },
  { path: "/cpq-dashboard", component: "CPQDashboard", feature: "cpq_access" },
  { path: "/company-admin", component: "CompanyAdmin", feature: "company_administration" },
  { path: "/email-settings", component: "EmailSettings", feature: "email_center" },
  { path: "/organization/users", component: "OrganizationUsers", feature: "enterprise_management" },
  { path: "/enterprise/organizations", component: "OrganizationManagement", name: "Organization Management™", feature: "enterprise_management" },
  { path: "/enterprise/admin", component: "EnterpriseAdmin", name: "Enterprise Administration™", feature: "enterprise_management" },
  { path: "/enterprise/identity", component: "EnterpriseIdentity", name: "Enterprise Identity™", feature: "enterprise_management" },
  { path: "/enterprise/procurement", component: "ProcurementCommandCenter", name: "Enterprise Procurement™", feature: "enterprise_management" },
  { path: "/enterprise/vendors", component: "VendorManagement", name: "Vendor Management™", feature: "enterprise_management" },
  { path: "/enterprise/commercial", component: "CommercialIntelligence", name: "Commercial Intelligence™", feature: "enterprise_management" },
  { path: "/cpq/quotes", component: "MyQuotes", feature: "cpq_access" },
  { path: "/cpq/quote/:id", component: "CPQQuoteView", feature: "cpq_access" },
  { path: "/portal/:quoteId", component: "EnterprisePortal", feature: "cpq_access" },
  { path: "/hr-dashboard", component: "HRDashboard", feature: "hr_dashboard" },
  { path: "/succession-planning", component: "SuccessionPlanning", feature: "succession_planning" },
  { path: "/promotion-readiness", component: "PromotionReadiness", feature: "promotion_readiness" },
  { path: "/learning-assignments", component: "LearningAssignments", feature: "learning_assignments" },
  { path: "/sso", component: "SSOIdentity", feature: "sso" },
  { path: "/leaderboard", component: "Leaderboard", public: true },
  { path: "/reputation", component: "Reputation", feature: "basic_dashboard" },
  { path: "/executive/rankings", component: "ExecutiveRankings", feature: "basic_dashboard" },
  { path: "/brand-center", component: "ExecutiveBrandCenter", feature: "basic_dashboard" },
  { path: "/feedback", component: "Feedback" },
  { path: "/beta-program", component: "BetaProgramCenter", name: "Beta Program Center™" },
  { path: "/trust-center", component: "TrustCenter", public: true },
  { path: "/guardian", component: "Guardian", feature: null, public: false },
  // Routes registered from App.jsx layout routes and feature pages
  { path: "/network", component: "NetworkFeed", feature: "network_access" },
  { path: "/methodology", component: "EELMMethodology", feature: "basic_analytics" },
  { path: "/journey", component: "Journey", feature: "basic_dashboard" },
  { path: "/executive-readiness", component: "ExecutiveReadiness", feature: "basic_analytics" },
  { path: "/executive-passport", component: "ExecutivePassport", feature: "basic_dashboard" },
  { path: "/legacy-library", component: "LegacyLibrary", feature: "basic_dashboard" },
  { path: "/founder", component: "FounderOverview", feature: "founder_portal" },
  { path: "/referrals", component: "ReferralDashboard", feature: "ambassador_program" },
  { path: "/wallet", component: "ExecutiveWallet", feature: "wallet_access" },
  { path: "/identity-verification", component: "IdentityVerification", feature: "identity_verification" },
  { path: "/enterprise-intelligence", component: "EnterpriseIntelligence", feature: "enterprise_analytics" },
  { path: "/organization/billing", component: "OrganizationBilling", feature: "enterprise_management" },
  { path: "/membership-admin", component: "MembershipAdmin", feature: "membership_administration" },
  { path: "/elim", component: "ELIMManagementCenter", feature: "elim_management" },
  { path: "/referral-admin", component: "ReferralAdmin", feature: "ambassador_program" },
  { path: "/identity-verification-admin", component: "IdentityVerificationAdmin", feature: "identity_verification" },
  { path: "/legacy-library/admin", component: "LegacyAdmin", feature: "basic_dashboard" },
  { path: "/developer/diagnostics", component: "Diagnostics", feature: "developer_access" },
  { path: "/developer/knowledge-sync", component: "ExecKnowledgeSync", name: "EXEC™ Knowledge Synchronization™", feature: "developer_access" },
  { path: "/exec-admin", component: "ExecAdmin", feature: "exec_console" },
  { path: "/privacy-compliance", component: "PrivacyComplianceCenter", name: "Privacy & Compliance Center™", feature: null },
  { path: "/enterprise/governance", component: "GovernanceCommandCenter", name: "Enterprise Governance Command Center™", feature: null },
  { path: "/developer/architecture-audit", component: "PlatformArchitectureAudit", name: "Architecture Audit™", feature: "developer_access" },
  { path: "/developer/stability", component: "PlatformStabilityDashboard", name: "Platform Stability Dashboard™", feature: "developer_access" },
  { path: "/developer/launch-readiness", component: "LaunchReadiness", name: "Launch Readiness™", feature: "developer_access" },
  { path: "/developer/scalability", component: "ScalabilityAssessment", name: "Scalability Assessment™", feature: "developer_access" },
  { path: "/developer/performance-resilience", component: "PerformanceResilience", name: "Performance & Resilience™", feature: "developer_access" },
  { path: "/developer/report-registry", component: "ReportRegistry", name: "Report Registry™", feature: "developer_access" },
  { path: "/developer/security-intelligence", component: "SecurityIntelligenceCenter", name: "Security Intelligence Center™", feature: "developer_access" },
  { path: "/developer/form-lookup-registry", component: "FormLookupRegistry", name: "Form Lookup Registry™", feature: "developer_access" },
  { path: "/developer/product", component: "ProductManagement", name: "Product Management™", feature: "developer_access" },
  { path: "/exec-os", component: "ExecOSDashboard", name: "EXEC™ Operating System™", feature: null },
  { path: "/exec-observability", component: "ExecObservabilityPlatform", name: "EXEC™ Observability & Telemetry Platform™", feature: null },
  { path: "/product-intelligence", component: "ProductIntelligenceDashboard", name: "EXEC™ Product Intelligence Platform™", feature: null },
  { path: "/beta-operations", component: "BetaOperationsCenter", name: "Beta Operations Center™", feature: null },
  { path: "/customer-lifecycle", component: "CustomerLifecycleManagement", name: "Customer Lifecycle Management™", feature: null },
  { path: "/release-readiness", component: "ReleaseReadiness", name: "Release Readiness Command Center™", feature: null },
  { path: "/feature-flags", component: "FeatureFlagCenter", name: "Feature Flag Center™", feature: null },
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
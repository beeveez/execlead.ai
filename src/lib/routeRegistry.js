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
import { WORKSPACE_NAV, FOOTER_NAV } from "./workspaces";
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
  { path: "/founders", component: "FoundersWall", public: true },
  { path: "/founders-wall", component: "FoundersWall", public: true },
  { path: "/verify/:verificationId", component: "CertificateVerify", public: true },
  { path: "/beta", component: "BetaApply", public: true },
  { path: "/company-library", component: "Companies", public: true },
  { path: "/company-library/:id", component: "CompanyDetail", public: true },
  { path: "/articles", component: "ArticleHub", public: true },
  { path: "/articles/:slug", component: "ArticleDetail", public: true },
  { path: "/onboarding", component: "Onboarding" },
  { path: "/home", component: "WorkspaceHome" },
  { path: "/section/:workspaceId/:section", component: "SectionHome", name: "Section Home" },
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
  { path: "/founding-member-admin", component: "FoundingMemberAdmin", feature: "founding_member_administration" },
  { path: "/payment-settings", component: "PaymentSettings", feature: "payment_providers" },
  { path: "/developer", component: "DeveloperConsole", feature: "developer_access" },
  { path: "/developer/experience-intelligence", component: "ExperienceIntelligenceDashboard", name: "Experience Intelligence™", feature: "developer_access" },
  { path: "/developer/performance", component: "PerformanceDashboard", name: "Performance Dashboard™", feature: "developer_access" },
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
  { path: "/company-reports-admin", component: "CompanyReportsAdmin", feature: "company_administration" },
  { path: "/request-tracking", component: "RequestTracking", feature: "company_administration" },
  { path: "/email-settings", component: "EmailSettings", feature: "email_center" },
  { path: "/organization/users", component: "OrganizationUsers", feature: "enterprise_management" },
  { path: "/operations", component: "ProductCommandCenter", name: "Product Command Center™", feature: null },
  { path: "/operations/customer-intelligence", component: "OperationsDomain", name: "Customer Intelligence", feature: null },
  { path: "/operations/product-intelligence", component: "OperationsDomain", name: "Product Intelligence (Domain)", feature: null },
  { path: "/operations/beta", component: "OperationsDomain", name: "Beta Operations (Domain)", feature: null },
  { path: "/operations/strategy", component: "OperationsDomain", name: "Product Strategy", feature: null },
  { path: "/operations/launch", component: "OperationsDomain", name: "Launch Operations", feature: null },
  { path: "/operations/reports", component: "OperationsDomain", name: "Operations Reports", feature: null },
  { path: "/operations/ai", component: "AIOperationsCenter", name: "AI Operations Center™", feature: null },
  { path: "/operations/user-intelligence", component: "UserIntelligence", name: "User Intelligence™", feature: null },
  { path: "/operations/product-intelligence/geographic", component: "GeographicIntelligence", name: "Geographic Intelligence™", feature: null },
  { path: "/operations/product-intelligence/market-opportunity", component: "MarketOpportunity", name: "Market Opportunity™", feature: null },
  { path: "/operations/security", component: "SecurityOperations", name: "Security Operations Center™", feature: null },
  { path: "/operations/security-execution", component: "SecurityExecution", name: "Security Execution Framework™", feature: null },
  { path: "/operations/performance", component: "PerformanceExecution", name: "Performance Operations Center™", feature: null },
  { path: "/operations/ai-models", component: "AIModelManagement", name: "AI Model Management Center™", feature: null },
  { path: "/operations/ai-compute", component: "AIComputeCenter", name: "AI Compute Center™", feature: null },
  { path: "/operations/production-readiness", component: "ProductionReadiness", name: "Production Readiness™", feature: null },
  { path: "/voice-interview", component: "VoiceInterview", name: "Voice Interview™", feature: null },
  { path: "/responsible-ai", component: "ResponsibleAIDashboard", name: "Responsible AI Framework™", feature: null },
  { path: "/security-baseline", component: "SecurityBaselineDashboard", name: "Security Baseline™", feature: null },
  { path: "/enterprise/command-center", component: "EnterpriseCommandCenter", name: "Enterprise Command Center™", feature: null },
  { path: "/enterprise/organization-domain", component: "EnterpriseDomain", name: "Organization (Domain)", feature: null },
  { path: "/enterprise/workforce", component: "EnterpriseDomain", name: "Workforce Development", feature: null },
  { path: "/enterprise/governance-domain", component: "EnterpriseDomain", name: "Governance (Domain)", feature: null },
  { path: "/enterprise/security-identity", component: "EnterpriseDomain", name: "Security & Identity", feature: null },
  { path: "/enterprise/procurement-domain", component: "EnterpriseDomain", name: "Procurement (Domain)", feature: null },
  { path: "/enterprise/reporting", component: "EnterpriseDomain", name: "Enterprise Reporting", feature: null },
  { path: "/enterprise/organizations", component: "OrganizationManagement", name: "Organization Management™", feature: "enterprise_management" },
  { path: "/enterprise/admin", component: "EnterpriseAdmin", name: "Enterprise Administration™", feature: "enterprise_management" },
  { path: "/enterprise/identity", component: "EnterpriseIdentity", name: "Enterprise Identity™", feature: "enterprise_management" },
  { path: "/enterprise/procurement", component: "ProcurementCommandCenter", name: "Enterprise Procurement™", feature: "enterprise_management" },
  { path: "/enterprise/vendors", component: "VendorManagement", name: "Vendor Management™", feature: "enterprise_management" },
  { path: "/enterprise/commercial", component: "CommercialIntelligence", name: "Commercial Intelligence™", feature: "enterprise_management" },
  { path: "/commercial-command-center", component: "CommercialCommandCenter", name: "Commercial Command Center™", feature: null },
  { path: "/commercial-automation", component: "CommercialAutomationEngine", name: "Commercial Automation Engine™", feature: null },
  { path: "/business-intelligence", component: "BusinessIntelligenceCenter", name: "Business Intelligence™", feature: null },
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
  { path: "/privacy-compliance", component: "MyPrivacy", name: "My Privacy & Compliance™", feature: null },
  { path: "/developer/privacy-compliance", component: "PrivacyComplianceCenter", name: "Platform Privacy & Compliance™", feature: null },
  { path: "/enterprise/privacy", component: "EnterprisePrivacy", name: "Enterprise Privacy™", feature: null },
  { path: "/enterprise/security", component: "EnterpriseSecurity", name: "Enterprise Security™", feature: null },
  { path: "/enterprise/governance", component: "GovernanceCommandCenter", name: "Enterprise Governance Command Center™", feature: null },
  { path: "/developer/architecture-audit", component: "PlatformArchitectureAudit", name: "Architecture Audit™", feature: "developer_access" },
  { path: "/developer/stability", component: "PlatformStabilityDashboard", name: "Platform Stability Dashboard™", feature: "developer_access" },
  { path: "/developer/launch-readiness", component: "LaunchReadiness", name: "Launch Readiness™", feature: "developer_access" },
  { path: "/developer/scalability", component: "ScalabilityAssessment", name: "Scalability Assessment™", feature: "developer_access" },
  { path: "/developer/performance-resilience", component: "PerformanceResilience", name: "Performance & Resilience™", feature: "developer_access" },
  { path: "/developer/report-registry", component: "ReportRegistry", name: "Report Registry™", feature: "developer_access" },
  { path: "/developer/security-intelligence", component: "SecurityIntelligenceCenter", name: "Security Intelligence Center™", feature: "developer_access" },
  { path: "/developer/form-lookup-registry", component: "FormLookupRegistry", name: "Form Lookup Registry™", feature: "developer_access" },
  { path: "/developer/commercial-readiness", component: "CommercialReadinessDashboard", name: "Commercial Readiness Dashboard™", feature: "developer_access" },
  { path: "/developer/executive-product-board", component: "ExecutiveProductBoard", name: "Executive Product Board™", feature: "developer_access" },
  { path: "/developer/intelligence-suite-simulator", component: "IntelligenceSuiteSimulator", name: "Intelligence Suite Simulator™", feature: "developer_access" },
  { path: "/developer/commercial-governance", component: "CommercialGovernanceCenter", name: "Commercial Governance Center™", feature: "developer_access" },
  { path: "/developer/ai-optimization", component: "AIOptimizationDashboard", name: "AI Optimization Layer™", feature: "developer_access" },
  { path: "/developer/ai-policy", component: "AIPolicyDashboard", name: "AI Policy Engine™", feature: "developer_access" },
  { path: "/developer/model-router", component: "ModelRouterDashboard", name: "Model Router™", feature: "developer_access" },
  { path: "/developer/ai-observability", component: "AIObservabilityCenter", name: "AI Observability Center™", feature: "developer_access" },
  { path: "/developer/promotion-forecast", component: "PromotionForecastDashboard", name: "Promotion Forecast Engine™", feature: "developer_access" },
  { path: "/developer/product", component: "ProductManagement", name: "Product Management™", feature: "developer_access" },
  { path: "/exec-os", component: "ExecOSDashboard", name: "EXEC™ Operating System™", feature: null },
  { path: "/exec-observability", component: "ExecObservabilityPlatform", name: "EXEC™ Observability & Telemetry Platform™", feature: null },
  { path: "/product-intelligence", component: "ProductIntelligenceDashboard", name: "EXEC™ Product Intelligence Platform™", feature: null },
  { path: "/beta-operations", component: "BetaOperationsCenter", name: "Beta Operations Center™", feature: null },
  { path: "/customer-lifecycle", component: "CustomerLifecycleManagement", name: "Customer Lifecycle Management™", feature: null },
  { path: "/release-readiness", component: "ReleaseReadiness", name: "Release Readiness Command Center™", feature: null },
  { path: "/feature-flags", component: "FeatureFlagCenter", name: "Feature Flag Center™", feature: null },
  { path: "/system-status", component: "SystemStatusCenter", name: "System Status Center™", feature: null },
  { path: "/architecture-governance", component: "ArchitectureGovernanceBoard", name: "Architecture Governance Board™", feature: null },
  { path: "/developer-portal", component: "DeveloperPortal", name: "Developer Portal™", feature: "developer_access" },
  { path: "/executive-portfolio", component: "ExecutivePortfolio", name: "Executive Portfolio™", feature: null },
  { path: "/executive-credentials", component: "ExecutiveCredentials", name: "Executive Credentials™", feature: null },
  { path: "/verification-center", component: "VerificationCenter", name: "Verification Center™", feature: null },
  { path: "/identity-graph", component: "IdentityGraph", name: "Identity Graph™", feature: null },
  { path: "/evidence-vault", component: "EvidenceVault", name: "Executive Evidence Vault™", feature: null },
  { path: "/digital-twin", component: "ExecutiveDigitalTwin", name: "Executive Digital Twin™", feature: null },
  { path: "/action-center", component: "ExecutiveActionCenter", name: "Executive Action Center™", feature: null },
  { path: "/journey-orchestrator", component: "ExecutiveJourneyOrchestrator", name: "Executive Journey Orchestrator™", feature: null },
  { path: "/promotion-forecast", component: "PromotionForecast", name: "Promotion Forecast™", feature: null },
  { path: "/decision-intelligence", component: "ExecutiveDecisionIntelligence", name: "Executive Decision Intelligence™", feature: null },
  { path: "/executive-briefing", component: "ExecutiveBriefing", name: "Executive Briefing™", feature: null },
];

const ALL_NAV_ITEMS = [
  ...Object.values(WORKSPACE_NAV).flatMap((groups) =>
    groups.flatMap((g) => g.items.map((i) => ({ ...i, group: g.label })))
  ),
  ...FOOTER_NAV.flatMap((g) => g.items.map((i) => ({ ...i, group: g.label }))),
];

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

// ═══════════════════════════════════════════════════════════
// ROUTE CLASSIFICATION — Navigation Intelligence™
// ═══════════════════════════════════════════════════════════

export const ROUTE_CLASSIFICATIONS = {
  primary_navigation: { label: 'Primary Navigation', visibility: 'public', needsNav: true, icon: 'LayoutGrid' },
  secondary_navigation: { label: 'Secondary Navigation', visibility: 'authenticated', needsNav: true, icon: 'Navigation' },
  context_route: { label: 'Context Route', visibility: 'authenticated', needsNav: false, icon: 'Link' },
  detail_route: { label: 'Detail Route', visibility: 'authenticated', needsNav: false, icon: 'FileText' },
  modal_route: { label: 'Modal Route', visibility: 'authenticated', needsNav: false, icon: 'Square' },
  drawer_route: { label: 'Drawer Route', visibility: 'authenticated', needsNav: false, icon: 'PanelRight' },
  wizard_step: { label: 'Wizard Step', visibility: 'authenticated', needsNav: false, icon: 'Steps' },
  hidden_system_route: { label: 'Hidden System Route', visibility: 'hidden', needsNav: false, icon: 'EyeOff' },
  admin_route: { label: 'Admin Route', visibility: 'admin', needsNav: false, icon: 'Shield' },
  developer_route: { label: 'Developer Route', visibility: 'developer', needsNav: false, icon: 'Terminal' },
  enterprise_route: { label: 'Enterprise Route', visibility: 'enterprise', needsNav: false, icon: 'Building2' },
  internal_api_route: { label: 'Internal API Route', visibility: 'hidden', needsNav: false, icon: 'Server' },
  auth_route: { label: 'Authentication Route', visibility: 'public', needsNav: false, icon: 'KeyRound' },
  coming_soon: { label: 'Coming Soon', visibility: 'hidden', needsNav: false, icon: 'Clock' },
};

const AUTH_PATHS = ['/login', '/register', '/forgot-password', '/reset-password'];
const ADMIN_PATTERNS = ['/admin', '-admin', '/admin/'];
const CPQ_PATHS = ['/cpq', '/cpq-dashboard'];
const HIDDEN_PATHS = ['/guardian', '/portal/'];

// Route-specific overrides for edge cases that automatic classification
// cannot handle correctly (dynamic routes without parent list pages, etc.)
const ROUTE_OVERRIDES = {
  '/u/:username': { navType: 'detail_route', parentRoute: null, searchable: true, indexable: true },
  '/section/:workspaceId/:section': { navType: 'hidden_system_route', parentRoute: null, searchable: false, indexable: false },
  '/founders-wall': { navType: 'context_route', parentRoute: '/founders', searchable: true, indexable: false },
};

function deriveRouteId(path) {
  return path.replace(/^\//, '').replace(/[:/]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'root';
}

function deriveWorkspace(path) {
  if (path.startsWith('/developer')) return 'developer';
  if (path.startsWith('/enterprise')) return 'enterprise';
  if (path.startsWith('/operations')) return 'operations';
  if (path.startsWith('/founder')) return 'founder';
  if (path.startsWith('/network')) return 'network';
  if (path.startsWith('/community')) return 'community';
  if (path.startsWith('/legacy-library')) return 'legacy';
  if (path.startsWith('/cpq')) return 'sales';
  if (['/hr-dashboard', '/succession-planning', '/promotion-readiness', '/learning-assignments', '/sso'].includes(path)) return 'hr';
  if (path.startsWith('/privacy') || path.startsWith('/security') || path.startsWith('/identity')) return 'security';
  if (path === '/' || path.startsWith('/pricing') || path.startsWith('/about') || path.startsWith('/contact') || path.startsWith('/legal') || path.startsWith('/trust') || path.startsWith('/founders') || path.startsWith('/beta') || path.startsWith('/articles') || path.startsWith('/leaderboard') || path.startsWith('/company-library')) return 'marketing';
  if (path.startsWith('/profile') || path.startsWith('/settings') || path.startsWith('/billing') || path.startsWith('/notifications') || path.startsWith('/organization') || path.startsWith('/connected')) return 'account';
  return 'executive';
}

function deriveParentRoute(path) {
  const parts = path.split('/').filter(Boolean);
  if (parts.length <= 1) return null;
  if (path.includes(':')) {
    const paramIndex = parts.findIndex(p => p.startsWith(':'));
    if (paramIndex > 0) return '/' + parts.slice(0, paramIndex).join('/');
    if (paramIndex === 0) return null;
  }
  return '/' + parts.slice(0, -1).join('/');
}

function classifyRoute(route) {
  const path = route.path;

  if (AUTH_PATHS.includes(path)) return 'auth_route';
  if (path === '/onboarding') return 'wizard_step';
  if (HIDDEN_PATHS.some(p => path.startsWith(p))) return 'hidden_system_route';
  if (path.startsWith('/developer')) return 'developer_route';
  if (path.startsWith('/enterprise')) return 'enterprise_route';
  if (ADMIN_PATTERNS.some(p => path.includes(p))) return 'admin_route';
  if (CPQ_PATHS.some(p => path === p || path.startsWith(p + '/'))) return 'wizard_step';
  if (path.includes(':')) return 'detail_route';
  if (route.public) return 'primary_navigation';
  return 'context_route';
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
    const override = ROUTE_OVERRIDES[r.path];
    const navType = override?.navType || classifyRoute(r);
    const classification = ROUTE_CLASSIFICATIONS[navType] || ROUTE_CLASSIFICATIONS.context_route;
    const workspace = deriveWorkspace(r.path);
    const parentRoute = override?.parentRoute !== undefined ? override.parentRoute : deriveParentRoute(r.path);

    return {
      routeId: deriveRouteId(r.path),
      name: r.name || deriveName(r.path, r.component),
      url: r.path,
      component: r.component,
      permission: permission ? permission.join(", ") : "authenticated",
      requiredRole: permission ? permission.join(", ") : (r.public ? "public" : "authenticated"),
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
      // ── Navigation Intelligence™ metadata ──
      navType,
      navTypeLabel: classification.label,
      visibility: classification.visibility,
      workspace,
      parentRoute,
      needsNav: classification.needsNav,
      searchable: override?.searchable !== undefined ? override.searchable : (navType !== 'hidden_system_route' && navType !== 'auth_route' && navType !== 'internal_api_route'),
      breadcrumb: r.name || deriveName(r.path, r.component),
      indexable: override?.indexable !== undefined ? override.indexable : (!!r.public && navType === 'primary_navigation'),
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
import { base44 } from "@/api/base44Client";

export const PLAN_TIERS = { free: 0, professional: 1, executive: 2, enterprise: 3, developer_unlimited: 4 };

export const PLAN_LIMITS = {
  free: { daily_coaching: 5, weekly_challenges: 3, companies: 1, career_paths: 1 },
  professional: { daily_coaching: Infinity, weekly_challenges: Infinity, companies: Infinity, career_paths: Infinity },
  executive: { daily_coaching: Infinity, weekly_challenges: Infinity, companies: Infinity, career_paths: Infinity },
  enterprise: { daily_coaching: Infinity, weekly_challenges: Infinity, companies: Infinity, career_paths: Infinity },
  developer_unlimited: { daily_coaching: Infinity, weekly_challenges: Infinity, companies: Infinity, career_paths: Infinity }
};

export const FEATURE_ALIASES = {
  simulator: "executive_simulator",
  debate: "executive_debate",
  truth_engine: "truth_engine",
  academy: "executive_academy",
  career_advisor: "career_advisor",
  advanced_analytics: "leadership_analytics",
  board_simulator: "board_meeting_simulator",
  enterprise_dashboard: "team_dashboard",
  custom_learning: "custom_learning_paths",
  team_management: "role_management",
  daily_coaching: "ai_coaching_limited",
  weekly_challenges: "interview_simulations_limited",
  companies: "company_intelligence",
  career_paths: "career_path"
};

// ============================================================
// FEATURE REGISTRY — centralized metadata for every feature.
// Status drives visibility across navigation, pricing, and permissions.
// ============================================================

export const FEATURE_STATUS = {
  DEVELOPMENT: "development",
  INTERNAL: "internal",
  BETA: "beta",
  PREVIEW: "preview",
  LIVE: "live",
  DEPRECATED: "deprecated",
  ARCHIVED: "archived",
};

export const FEATURE_VISIBILITY = {
  PUBLIC: "public",
  INTERNAL: "internal",
  HIDDEN: "hidden",
};

export const LIVE_STATUSES = ["live", "beta", "preview"];

export const FEATURE_REGISTRY = {
  marketplace: { routePath: "/marketplace", navLabel: "Marketplace", navEnabled: true, module: "Platform" },
  executive_simulator: { routePath: "/simulator", navLabel: "Simulator", navEnabled: true, module: "Platform" },
  executive_debate: { routePath: "/debate", navLabel: "Debate", navEnabled: true, module: "Platform" },
  executive_academy: { routePath: "/academy", navLabel: "Academy", navEnabled: true, module: "Learning" },
  career_advisor: { routePath: "/career", navLabel: "Career Advisor", navEnabled: false, module: "Career" },
  company_intelligence: { routePath: "/companies", navLabel: "Companies", navEnabled: true, module: "Career" },
  leadership_analytics: { routePath: "/analytics", navLabel: "Analytics", navEnabled: true, module: "Insights" },
  daily_executive_challenge: { routePath: "/challenge", navLabel: "Challenge", navEnabled: false, module: "Platform" },
  executive_journal: { routePath: "/journal", navLabel: "Journal", navEnabled: true, module: "Career" },
  resume_intelligence: { routePath: "/resume", navLabel: "Resume AI", navEnabled: true, module: "Career" },
  career_studio: { routePath: "/career-studio", navLabel: "Career Studio", navEnabled: true, module: "Career" },
  executive_council: { routePath: "/council", navLabel: "Council", navEnabled: false, module: "Coaching" },
  leadership_dna: { routePath: "/leadership-dna", navLabel: "Leadership DNA", navEnabled: false, module: "Analytics" },
  executive_legacy: { routePath: "/executive-legacy", navLabel: "Legacy", navEnabled: false, module: "Analytics" },
  team_dashboard: { routePath: "/enterprise", navLabel: "Organization", navEnabled: true, module: "Enterprise" },
  hr_dashboard: { routePath: "/hr-dashboard", navLabel: "Department Analytics", navEnabled: true, module: "Enterprise" },
  succession_planning: { routePath: "/succession-planning", navLabel: "Seat Usage", navEnabled: true, module: "Enterprise" },
  promotion_readiness: { routePath: "/promotion-readiness", navLabel: "Organization Reports", navEnabled: true, module: "Enterprise" },
  learning_assignments: { routePath: "/learning-assignments", navLabel: "Learning Assignments", navEnabled: true, module: "Enterprise" },
  sso: { routePath: "/sso", navLabel: "SSO & Identity", navEnabled: false, module: "Enterprise" },
  ai_usage_dashboard: { routePath: "/ai-usage", navLabel: "AI Usage", navEnabled: false, module: "Analytics" },
  admin_console: { routePath: "/admin", navLabel: "Admin", navEnabled: true, module: "Enterprise" },
  ai_command_center: { routePath: "/ai-command-center", navLabel: "AI Command Center", navEnabled: false, module: "Platform" },
  executive_coach: { routePath: "/coach", navLabel: "Coach", navEnabled: true, module: "Coaching" },
  billing_access: { routePath: "/billing", navLabel: "Billing", navEnabled: false, module: "Account" },
  security_access: { routePath: "/security", navLabel: "Security", navEnabled: false, module: "Account" },
  connected_accounts: { routePath: "/connected-accounts", navLabel: "Connected Accounts", navEnabled: false, module: "Account" },
  network_access: { routePath: "/network", navLabel: "Network", navEnabled: true, module: "Network" },
  founder_portal: { routePath: "/founder", navLabel: "Founder Portal", navEnabled: false, module: "Platform" },
  ambassador_program: { routePath: "/referrals", navLabel: "Referrals", navEnabled: false, module: "Platform" },
  wallet_access: { routePath: "/wallet", navLabel: "Wallet", navEnabled: false, module: "Platform" },
  identity_verification: { routePath: "/identity-verification", navLabel: "Identity Verification", navEnabled: false, module: "Account" },
  developer_access: { routePath: "/developer", navLabel: "Developer Console", navEnabled: false, module: "Developer" },
  subscription_management: { routePath: "/pricing-admin", navLabel: "Pricing Admin", navEnabled: false, module: "Enterprise" },
  feature_flag_management: { routePath: "/feature-management", navLabel: "Feature Management", navEnabled: false, module: "Enterprise" },
  revenue_dashboard: { routePath: "/billing-admin", navLabel: "Billing Admin", navEnabled: false, module: "Enterprise" },
  payment_providers: { routePath: "/payment-settings", navLabel: "Payment Settings", navEnabled: false, module: "Enterprise" },
  enterprise_management: { routePath: "/enterprise/organizations", navLabel: "Enterprise Management", navEnabled: false, module: "Enterprise" },
  cpq_access: { routePath: "/cpq", navLabel: "CPQ Wizard", navEnabled: false, module: "Enterprise" },
  company_administration: { routePath: "/company-admin", navLabel: "Company Admin", navEnabled: false, module: "Enterprise" },
  email_center: { routePath: "/email-settings", navLabel: "Email Settings", navEnabled: false, module: "Enterprise" },
  membership_administration: { routePath: "/membership-admin", navLabel: "Membership Admin", navEnabled: false, module: "Enterprise" },
  elim_management: { routePath: "/elim", navLabel: "ELIM Management", navEnabled: false, module: "Enterprise" },
  exec_console: { routePath: "/exec-admin", navLabel: "EXEC Admin", navEnabled: false, module: "Enterprise" },
  exec_verified: { routePath: "/verification", navLabel: "EXEC™ Verified", navEnabled: false, module: "Trust" },
};

export function normalizeFeature(f) {
  if (!f) return f;
  const reg = FEATURE_REGISTRY[f.id] || {};
  return {
    ...f,
    status: f.status || "live",
    visibility: f.visibility || "public",
    module: f.module || reg.module || f.category,
    requiredRole: f.requiredRole || null,
    releaseDate: f.releaseDate || null,
    comingSoon: f.comingSoon ?? false,
    navEnabled: f.navEnabled ?? reg.navEnabled ?? false,
    pricingEnabled: f.pricingEnabled ?? true,
    routePath: f.routePath || reg.routePath || null,
    navLabel: f.navLabel || reg.navLabel || null,
    expectedRelease: f.expectedRelease || null,
  };
}

export function isFeatureLive(f) {
  return LIVE_STATUSES.includes(f.status);
}

export function isComingSoon(f) {
  return f.comingSoon === true || f.status === "development";
}

export const DEFAULT_FEATURES = [
  { id: "resume_builder", name: "Resume Builder", description: "Build and edit professional resumes", category: "Career", icon: "FileText", minimumPlan: "free", isEnabled: true, sortOrder: 0 },
  { id: "basic_dashboard", name: "Basic Dashboard", description: "Core dashboard with essential metrics", category: "Platform", icon: "LayoutDashboard", minimumPlan: "free", isEnabled: true, sortOrder: 1 },
  { id: "basic_analytics", name: "Basic Analytics", description: "Standard analytics and progress tracking", category: "Analytics", icon: "BarChart3", minimumPlan: "free", isEnabled: true, sortOrder: 2 },
  { id: "ai_coaching_limited", name: "AI Coaching Requests", description: "Daily AI executive coaching", category: "Coaching", icon: "MessageSquare", minimumPlan: "free", isEnabled: true, sortOrder: 3, limitLabel: "5/day" },
  { id: "interview_simulations_limited", name: "Interview Simulations", description: "Practice executive interview scenarios", category: "Simulator", icon: "Brain", minimumPlan: "free", isEnabled: true, sortOrder: 4, limitLabel: "3/week" },
  { id: "career_path", name: "Career Path", description: "Personalized career development path", category: "Career", icon: "Map", minimumPlan: "free", isEnabled: true, sortOrder: 5, limitLabel: "1 path" },
  { id: "company_profile", name: "Company Profile", description: "Deep-dive company intelligence profile", category: "Platform", icon: "Building2", minimumPlan: "free", isEnabled: true, sortOrder: 6, limitLabel: "1 company" },

  { id: "unlimited_ai_coach", name: "Unlimited AI Executive Coach", description: "Unlimited access to all AI coach personas", category: "Coaching", icon: "MessageSquare", minimumPlan: "professional", isEnabled: true, sortOrder: 10 },
  { id: "executive_simulator", name: "Executive Simulator", description: "Full executive simulation scenarios", category: "Simulator", icon: "Brain", minimumPlan: "professional", isEnabled: true, sortOrder: 11 },
  { id: "executive_debate", name: "Executive Debate Mode", description: "Multi-round AI debate for conviction testing", category: "Platform", icon: "Scale", minimumPlan: "professional", isEnabled: true, sortOrder: 12 },
  { id: "truth_engine", name: "Truth Engine", description: "Detects exaggeration and unsupported claims", category: "Platform", icon: "Shield", minimumPlan: "professional", isEnabled: true, sortOrder: 13 },
  { id: "executive_academy", name: "Executive Academy", description: "18 learning paths for leadership development", category: "Learning", icon: "GraduationCap", minimumPlan: "professional", isEnabled: true, sortOrder: 14 },
  { id: "career_advisor", name: "Career Advisor", description: "Personalized roadmap with certs and books", category: "Career", icon: "BookOpen", minimumPlan: "professional", isEnabled: true, sortOrder: 15 },
  { id: "company_intelligence", name: "Company Intelligence", description: "Deep profiles on 20+ global organizations", category: "Platform", icon: "Building2", minimumPlan: "professional", isEnabled: true, sortOrder: 16 },
  { id: "leadership_analytics", name: "Leadership Analytics", description: "Radar charts, trends, and heat maps", category: "Analytics", icon: "BarChart3", minimumPlan: "professional", isEnabled: true, sortOrder: 17 },
  { id: "daily_executive_challenge", name: "Daily Executive Challenge", description: "New executive challenge every day", category: "Platform", icon: "Swords", minimumPlan: "professional", isEnabled: true, sortOrder: 18 },
  { id: "executive_journal", name: "Executive Journal", description: "Reflective leadership journaling", category: "Platform", icon: "PenLine", minimumPlan: "professional", isEnabled: true, sortOrder: 19 },
  { id: "ats_resume_analyzer", name: "ATS Resume Analyzer", description: "Score resumes against ATS systems", category: "Career", icon: "FileSearch", minimumPlan: "professional", isEnabled: true, sortOrder: 20 },
  { id: "resume_intelligence", name: "Resume Intelligence", description: "AI-powered resume analysis and enhancement", category: "Career", icon: "Sparkles", minimumPlan: "professional", isEnabled: true, sortOrder: 21 },
  { id: "linkedin_optimizer", name: "LinkedIn Optimizer", description: "Optimize your LinkedIn executive presence", category: "Career", icon: "Linkedin", minimumPlan: "professional", isEnabled: true, sortOrder: 22 },
  { id: "career_studio", name: "Career Studio", description: "Complete career document workspace", category: "Career", icon: "Briefcase", minimumPlan: "professional", isEnabled: true, sortOrder: 23 },

  { id: "executive_council", name: "Executive Council", description: "AI advisory board with multiple executive personas", category: "Coaching", icon: "Users", minimumPlan: "professional", isEnabled: true, sortOrder: 24 },
  { id: "leadership_dna", name: "Leadership DNA", description: "Living executive profile with AI-generated growth insights", category: "Analytics", icon: "Fingerprint", minimumPlan: "professional", isEnabled: true, sortOrder: 25 },
  { id: "marketplace", name: "EXECLEAD Marketplace", description: "Premium content marketplace for leadership development", category: "Platform", icon: "Store", minimumPlan: "free", isEnabled: true, sortOrder: 26 },
  { id: "executive_legacy", name: "Executive Legacy", description: "35-year career legacy with case studies and executive DNA", category: "Analytics", icon: "Award", minimumPlan: "executive", isEnabled: true, sortOrder: 27 },

  { id: "board_meeting_simulator", name: "Board Meeting Simulator", description: "Practice board-level presentations", category: "Simulator", icon: "Brain", minimumPlan: "executive", isEnabled: true, sortOrder: 30 },
  { id: "cio_coaching", name: "CIO Coaching", description: "Mentorship from former CIO persona", category: "Coaching", icon: "Users", minimumPlan: "executive", isEnabled: true, sortOrder: 31 },
  { id: "cfo_coaching", name: "CFO Coaching", description: "Mentorship from former CFO persona", category: "Coaching", icon: "DollarSign", minimumPlan: "executive", isEnabled: true, sortOrder: 32 },
  { id: "coo_coaching", name: "COO Coaching", description: "Mentorship from former COO persona", category: "Coaching", icon: "Settings", minimumPlan: "executive", isEnabled: true, sortOrder: 33 },
  { id: "executive_presentation_coach", name: "Executive Presentation Coach", description: "AI coaching for executive presentations", category: "Coaching", icon: "Presentation", minimumPlan: "executive", isEnabled: true, sortOrder: 34 },
  { id: "executive_review_simulator", name: "Executive Review Simulator", description: "Simulate executive service reviews", category: "Simulator", icon: "ClipboardCheck", minimumPlan: "executive", isEnabled: true, sortOrder: 35 },
  { id: "customer_escalation_simulator", name: "Customer Escalation Simulator", description: "Handle high-stakes customer escalations", category: "Simulator", icon: "AlertCircle", minimumPlan: "executive", isEnabled: true, sortOrder: 36 },
  { id: "crisis_management", name: "Crisis Management", description: "Major incident and crisis simulation", category: "Simulator", icon: "AlertTriangle", minimumPlan: "executive", isEnabled: true, sortOrder: 37 },
  { id: "executive_negotiation_coach", name: "Executive Negotiation Coach", description: "AI coaching for executive negotiations", category: "Coaching", icon: "Handshake", minimumPlan: "executive", isEnabled: true, sortOrder: 38 },
  { id: "executive_storytelling", name: "Executive Storytelling", description: "Master executive narrative and storytelling", category: "Coaching", icon: "BookOpen", minimumPlan: "executive", isEnabled: true, sortOrder: 39 },
  { id: "executive_strategy_workshops", name: "Executive Strategy Workshops", description: "Interactive strategy development workshops", category: "Learning", icon: "Target", minimumPlan: "executive", isEnabled: true, sortOrder: 40 },
  { id: "executive_portfolio", name: "Executive Portfolio", description: "Build your executive portfolio", category: "Career", icon: "FolderOpen", minimumPlan: "executive", isEnabled: true, sortOrder: 41 },
  { id: "board_readiness_assessment", name: "Board Readiness Assessment", description: "Assess your readiness for board roles", category: "Career", icon: "Award", minimumPlan: "executive", isEnabled: true, sortOrder: 42 },

  { id: "team_dashboard", name: "Enterprise Dashboard", description: "Organization-wide enterprise analytics", category: "Enterprise", icon: "LayoutDashboard", minimumPlan: "enterprise", isEnabled: true, sortOrder: 50 },
  { id: "hr_dashboard", name: "HR Dashboard", description: "HR analytics and workforce insights", category: "Enterprise", icon: "Users", minimumPlan: "enterprise", isEnabled: true, sortOrder: 51 },
  { id: "department_analytics", name: "Department Analytics", description: "Per-department performance analytics", category: "Analytics", icon: "BarChart3", minimumPlan: "enterprise", isEnabled: true, sortOrder: 52 },
  { id: "seat_management", name: "Seat Management", description: "Manage organization seats and licenses", category: "Enterprise", icon: "UserPlus", minimumPlan: "enterprise", isEnabled: true, sortOrder: 53 },
  { id: "role_management", name: "Role Management", description: "Assign and manage user roles", category: "Enterprise", icon: "Shield", minimumPlan: "enterprise", isEnabled: true, sortOrder: 54 },
  { id: "company_branding", name: "Company Branding", description: "Customize platform with company branding", category: "Enterprise", icon: "Palette", minimumPlan: "enterprise", isEnabled: true, sortOrder: 55 },
  { id: "custom_learning_paths", name: "Custom Learning Paths", description: "Create organization-specific learning paths", category: "Learning", icon: "Route", minimumPlan: "enterprise", isEnabled: true, sortOrder: 56 },
  { id: "organization_reports", name: "Organization Reports", description: "Exportable organization-wide reports", category: "Enterprise", icon: "FileText", minimumPlan: "enterprise", isEnabled: true, sortOrder: 57 },
  { id: "sso", name: "SSO", description: "Single sign-on integration", category: "Enterprise", icon: "KeyRound", minimumPlan: "enterprise", isEnabled: true, sortOrder: 58 },
  { id: "audit_logs", name: "Audit Logs", description: "Comprehensive audit trail logging", category: "Enterprise", icon: "ScrollText", minimumPlan: "enterprise", isEnabled: true, sortOrder: 59 },
  { id: "api_access", name: "API Access", description: "Programmatic API access to platform", category: "Enterprise", icon: "Code", minimumPlan: "enterprise", isEnabled: true, sortOrder: 60 },
  { id: "ai_usage_dashboard", name: "AI Usage Dashboard", description: "Track AI token and cost usage", category: "Analytics", icon: "Cpu", minimumPlan: "enterprise", isEnabled: true, sortOrder: 61 },
  { id: "dedicated_customer_success", name: "Dedicated Customer Success", description: "Dedicated success manager", category: "Enterprise", icon: "Headset", minimumPlan: "enterprise", isEnabled: true, sortOrder: 62 },
  { id: "enterprise_analytics", name: "Enterprise Analytics", description: "Advanced enterprise-wide analytics", category: "Analytics", icon: "TrendingUp", minimumPlan: "enterprise", isEnabled: true, sortOrder: 63 },
  { id: "admin_console", name: "Admin Console", description: "Full platform administration console", category: "Enterprise", icon: "Shield", minimumPlan: "enterprise", isEnabled: true, sortOrder: 64 },

  { id: "promotion_readiness", name: "Promotion Readiness", description: "Track and assess employee promotion readiness", category: "Enterprise", icon: "TrendingUp", minimumPlan: "enterprise", isEnabled: true, sortOrder: 65 },
  { id: "succession_planning", name: "Succession Planning", description: "Identify and develop future leaders", category: "Enterprise", icon: "Users", minimumPlan: "enterprise", isEnabled: true, sortOrder: 66 },
  { id: "learning_analytics", name: "Learning Analytics", description: "Track learning outcomes and ROI across the organization", category: "Analytics", icon: "BarChart3", minimumPlan: "enterprise", isEnabled: true, sortOrder: 67 },
  { id: "learning_assignments", name: "Learning Assignments", description: "Assign and track learning paths across your team", category: "Enterprise", icon: "ClipboardCheck", minimumPlan: "enterprise", isEnabled: true, sortOrder: 74 },
  { id: "scim_ready", name: "SCIM Ready", description: "Automated user provisioning via SCIM protocol", category: "Enterprise", icon: "UserPlus", minimumPlan: "enterprise", isEnabled: true, sortOrder: 68 },
  { id: "azure_ad", name: "Azure AD", description: "Azure Active Directory integration", category: "Enterprise", icon: "KeyRound", minimumPlan: "enterprise", isEnabled: true, sortOrder: 69 },
  { id: "google_workspace", name: "Google Workspace", description: "Google Workspace SSO integration", category: "Enterprise", icon: "KeyRound", minimumPlan: "enterprise", isEnabled: true, sortOrder: 70 },
  { id: "quarterly_business_reviews", name: "Quarterly Business Reviews", description: "Regular QBR sessions with your success team", category: "Enterprise", icon: "Calendar", minimumPlan: "enterprise", isEnabled: true, sortOrder: 71 },
  { id: "priority_support", name: "Priority Support", description: "Priority response support channel", category: "Enterprise", icon: "Headset", minimumPlan: "enterprise", isEnabled: true, sortOrder: 72 },
  { id: "enterprise_sla", name: "Enterprise SLA", description: "Service level agreement with uptime guarantees", category: "Enterprise", icon: "Shield", minimumPlan: "enterprise", isEnabled: true, sortOrder: 73 },

  // Platform & account features — available to all authenticated users
  { id: "ai_command_center", name: "AI Command Center", description: "Centralized AI operations and model management", category: "Platform", icon: "Cpu", minimumPlan: "free", isEnabled: true, sortOrder: 75 },
  { id: "executive_coach", name: "Executive Coach", description: "AI-powered executive coaching conversations", category: "Coaching", icon: "MessageSquare", minimumPlan: "free", isEnabled: true, sortOrder: 76 },
  { id: "billing_access", name: "Billing Access", description: "View and manage subscription billing", category: "Account", icon: "CreditCard", minimumPlan: "free", isEnabled: true, sortOrder: 77 },
  { id: "security_access", name: "Security Center", description: "Security settings and session management", category: "Account", icon: "Shield", minimumPlan: "free", isEnabled: true, sortOrder: 78 },
  { id: "connected_accounts", name: "Connected Accounts", description: "Manage OAuth and third-party account connections", category: "Account", icon: "Link", minimumPlan: "free", isEnabled: true, sortOrder: 79 },
  { id: "network_access", name: "Executive Network", description: "Peer networking, discussions, and mentorship", category: "Network", icon: "Users", minimumPlan: "free", isEnabled: true, sortOrder: 80 },
  { id: "founder_portal", name: "Founder Portal", description: "Founding member portal with benefits and rewards", category: "Platform", icon: "Crown", minimumPlan: "free", isEnabled: true, sortOrder: 81 },
  { id: "ambassador_program", name: "Ambassador Program", description: "Referral dashboard and commission tracking", category: "Platform", icon: "Gift", minimumPlan: "free", isEnabled: true, sortOrder: 82 },
  { id: "wallet_access", name: "Executive Wallet", description: "Wallet balance and withdrawal management", category: "Platform", icon: "Wallet", minimumPlan: "free", isEnabled: true, sortOrder: 83 },
  { id: "identity_verification", name: "Identity Verification", description: "Government ID verification and trust framework", category: "Account", icon: "BadgeCheck", minimumPlan: "free", isEnabled: true, sortOrder: 84 },

  // Enterprise & administration features
  { id: "developer_access", name: "Developer Console", description: "Platform diagnostics, governance, and developer tools", category: "Developer", icon: "Terminal", minimumPlan: "enterprise", isEnabled: true, sortOrder: 90 },
  { id: "subscription_management", name: "Subscription Management", description: "Manage pricing plans and subscription tiers", category: "Enterprise", icon: "CreditCard", minimumPlan: "enterprise", isEnabled: true, sortOrder: 91 },
  { id: "feature_flag_management", name: "Feature Flag Management", description: "Toggle and configure platform feature flags", category: "Enterprise", icon: "ToggleRight", minimumPlan: "enterprise", isEnabled: true, sortOrder: 92 },
  { id: "revenue_dashboard", name: "Revenue Dashboard", description: "Billing admin dashboard with revenue analytics", category: "Enterprise", icon: "DollarSign", minimumPlan: "enterprise", isEnabled: true, sortOrder: 93 },
  { id: "payment_providers", name: "Payment Providers", description: "Configure Stripe and payment integration settings", category: "Enterprise", icon: "CreditCard", minimumPlan: "enterprise", isEnabled: true, sortOrder: 94 },
  { id: "enterprise_management", name: "Enterprise Management", description: "Organization, identity, and procurement administration", category: "Enterprise", icon: "Building2", minimumPlan: "enterprise", isEnabled: true, sortOrder: 95 },
  { id: "cpq_access", name: "CPQ Engine", description: "Configure-Price-Quote wizard and quote management", category: "Enterprise", icon: "FileText", minimumPlan: "enterprise", isEnabled: true, sortOrder: 96 },
  { id: "company_administration", name: "Company Administration", description: "Company data management and logo administration", category: "Enterprise", icon: "Building2", minimumPlan: "enterprise", isEnabled: true, sortOrder: 97 },
  { id: "email_center", name: "Email Center", description: "Email provider configuration and delivery analytics", category: "Enterprise", icon: "Mail", minimumPlan: "enterprise", isEnabled: true, sortOrder: 98 },
  { id: "membership_administration", name: "Membership Administration", description: "Membership program management and enrollment", category: "Enterprise", icon: "CardMembership", minimumPlan: "enterprise", isEnabled: true, sortOrder: 99 },
  { id: "elim_management", name: "ELIM Management", description: "Executive Leadership Intelligence Model management center", category: "Enterprise", icon: "Brain", minimumPlan: "enterprise", isEnabled: true, sortOrder: 100 },
  { id: "exec_console", name: "EXEC Console", description: "Executive administration console and platform operations", category: "Enterprise", icon: "Settings", minimumPlan: "enterprise", isEnabled: true, sortOrder: 101 }
];

export function getFeaturesForPlan(planId) {
  const tier = PLAN_TIERS[planId] ?? 0;
  return DEFAULT_FEATURES
    .map(normalizeFeature)
    .filter(f => f.isEnabled && isFeatureLive(f) && !isComingSoon(f) && (PLAN_TIERS[f.minimumPlan] ?? 0) <= tier)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function hasFeatureAccess(planId, featureId) {
  const raw = DEFAULT_FEATURES.find(x => x.id === featureId);
  const f = normalizeFeature(raw);
  if (!f || !f.isEnabled || !isFeatureLive(f) || isComingSoon(f)) return false;
  return (PLAN_TIERS[planId] ?? 0) >= (PLAN_TIERS[f.minimumPlan] ?? 0);
}

export function getUpgradePlan(featureId) {
  const f = DEFAULT_FEATURES.find(x => x.id === featureId);
  return f?.minimumPlan || "executive";
}

export function getFeatureCategories(features) {
  const cats = [];
  features.forEach(f => { if (!cats.includes(f.category)) cats.push(f.category); });
  return cats;
}

export async function getFeatureCatalog() {
  try {
    const overrides = await base44.entities.Feature.list("sort_order", 100);
    const base = DEFAULT_FEATURES.map(normalizeFeature);
    if (!overrides || overrides.length === 0) return base;
    return base.map(def => {
      const ov = overrides.find(o => o.feature_id === def.id);
      if (!ov) return def;
      return normalizeFeature({
        ...def,
        name: ov.name || def.name,
        description: ov.description || def.description,
        category: ov.category || def.category,
        icon: ov.icon || def.icon,
        minimumPlan: ov.minimum_plan || def.minimumPlan,
        isEnabled: ov.is_enabled ?? def.isEnabled,
        sortOrder: ov.sort_order ?? def.sortOrder,
        limitLabel: ov.limit_label || def.limitLabel,
        status: ov.status || def.status,
        visibility: ov.visibility || def.visibility,
        requiredRole: ov.required_role || def.requiredRole,
        comingSoon: ov.coming_soon ?? def.comingSoon,
        navEnabled: ov.nav_enabled ?? def.navEnabled,
        pricingEnabled: ov.pricing_enabled ?? def.pricingEnabled,
        releaseDate: ov.release_date || def.releaseDate,
        expectedRelease: ov.expected_release || def.expectedRelease,
      });
    });
  } catch (e) {
    return DEFAULT_FEATURES.map(normalizeFeature);
  }
}

export function getNavFeatures() {
  return DEFAULT_FEATURES
    .map(normalizeFeature)
    .filter(f => f.isEnabled && f.navEnabled && isFeatureLive(f) && !isComingSoon(f))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getPricingFeatures() {
  return DEFAULT_FEATURES
    .map(normalizeFeature)
    .filter(f => f.isEnabled && f.pricingEnabled && isFeatureLive(f) && !isComingSoon(f))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}
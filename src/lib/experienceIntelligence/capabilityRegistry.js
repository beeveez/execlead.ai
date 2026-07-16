/**
 * Capability Registry™
 * ============================================================
 * The single source of truth for every platform capability.
 *
 * A "capability" is a discrete unit of platform functionality —
 * a module, feature, or experience that a user can access, interact
 * with, or receive recommendations from.
 *
 * Each capability defines:
 *   • ID — stable identifier referenced by Experience Profiles™
 *   • Name — display name
 *   • Description — what the capability does
 *   • Owning Workspace — which workspace governs this capability
 *   • Required Plan — minimum subscription plan for access
 *   • Required Permissions — role permissions needed
 *   • Dependencies — other capabilities that must be available
 *   • Navigation Target — the route path
 *   • Recommendation Support — whether the Recommendation Engine™ can suggest it
 *   • AI Support — whether the capability invokes AI/LLM
 *
 * Experience Profiles™ reference capabilities by ID. The Experience
 * Engine™ resolves: Profile → Capabilities → Navigation →
 * Recommendations → Dashboard → Missions → Notifications.
 *
 * Benefits:
 *   ✓ One source of truth
 *   ✓ Easier feature rollout
 *   ✓ Easier A/B testing
 *   ✓ Easier entitlement management
 *   ✓ Simpler enterprise customization
 *   ✓ Future plugin architecture
 */

// ============================================================
// PLAN HIERARCHY
// ============================================================

export const PLAN_HIERARCHY = ["free", "professional", "executive", "enterprise", "developer"];

function planSatisfies(userPlan, requiredPlan) {
  if (!requiredPlan) return true;
  if (userPlan === "*" || requiredPlan === "*") return true;
  const u = PLAN_HIERARCHY.indexOf(String(userPlan).toLowerCase());
  const r = PLAN_HIERARCHY.indexOf(String(requiredPlan).toLowerCase());
  if (u === -1) return false;
  if (r === -1) return false;
  return u >= r;
}

// ============================================================
// CAPABILITY DEFINITIONS
// ============================================================

export const CAPABILITIES = [
  // ── Platform Core ──────────────────────────────────────────
  {
    id: "dashboard",
    name: "Dashboard",
    description: "Personalized executive dashboard with KPIs, priorities, and insights.",
    workspace: "executive",
    requiredPlan: "free",
    requiredPermissions: [],
    dependencies: [],
    navigationTarget: "/dashboard",
    recommendationSupport: true,
    aiSupport: true,
  },
  {
    id: "journey_orchestrator",
    name: "Journey Orchestrator™",
    description: "Orchestrates the executive journey: current objective, milestones, and career destination.",
    workspace: "executive",
    requiredPlan: "executive",
    requiredPermissions: [],
    dependencies: ["dashboard", "promotion_forecast"],
    navigationTarget: "/journey-orchestrator",
    recommendationSupport: true,
    aiSupport: true,
  },
  {
    id: "action_center",
    name: "Action Center",
    description: "Centralized hub for executive actions, tasks, and AI-generated recommendations.",
    workspace: "executive",
    requiredPlan: "free",
    requiredPermissions: [],
    dependencies: ["dashboard"],
    navigationTarget: "/action-center",
    recommendationSupport: true,
    aiSupport: true,
  },
  {
    id: "executive_briefing",
    name: "Executive Briefing™",
    description: "Weekly AI-generated executive briefing with readiness, momentum, and strategic priorities.",
    workspace: "executive",
    requiredPlan: "executive",
    requiredPermissions: [],
    dependencies: ["dashboard", "promotion_forecast"],
    navigationTarget: "/executive-briefing",
    recommendationSupport: true,
    aiSupport: true,
  },

  // ── Career ─────────────────────────────────────────────────
  {
    id: "career_advisor",
    name: "Career Advisor",
    description: "AI-powered career development plan synthesizing profile, resume, and performance data.",
    workspace: "executive",
    requiredPlan: "professional",
    requiredPermissions: [],
    dependencies: ["resume_intelligence"],
    navigationTarget: "/career",
    recommendationSupport: true,
    aiSupport: true,
  },
  {
    id: "executive_portfolio",
    name: "Executive Portfolio™",
    description: "Comprehensive executive portfolio with verified achievements, timeline, and trust.",
    workspace: "executive",
    requiredPlan: "free",
    requiredPermissions: [],
    dependencies: ["profile"],
    navigationTarget: "/executive-portfolio",
    recommendationSupport: true,
    aiSupport: false,
  },
  {
    id: "executive_credentials",
    name: "Executive Credentials™",
    description: "Verifiable executive credentials wallet with credential management and advisory.",
    workspace: "executive",
    requiredPlan: "free",
    requiredPermissions: [],
    dependencies: ["profile"],
    navigationTarget: "/executive-credentials",
    recommendationSupport: false,
    aiSupport: false,
  },
  {
    id: "career_studio",
    name: "Career Studio",
    description: "AI-driven resume builder, cover letters, portfolio, and LinkedIn optimizer.",
    workspace: "executive",
    requiredPlan: "professional",
    requiredPermissions: [],
    dependencies: ["resume_intelligence"],
    navigationTarget: "/career-studio",
    recommendationSupport: true,
    aiSupport: true,
  },
  {
    id: "resume_intelligence",
    name: "Resume Intelligence™",
    description: "AI-powered resume analysis, skill gap detection, and learning roadmap generation.",
    workspace: "executive",
    requiredPlan: "free",
    requiredPermissions: [],
    dependencies: ["profile"],
    navigationTarget: "/resume",
    recommendationSupport: true,
    aiSupport: true,
  },
  {
    id: "companies",
    name: "Company Intelligence",
    description: "Browse, search, and compare target companies with AI-enriched intelligence.",
    workspace: "executive",
    requiredPlan: "free",
    requiredPermissions: [],
    dependencies: [],
    navigationTarget: "/companies",
    recommendationSupport: true,
    aiSupport: true,
  },
  {
    id: "journal",
    name: "Executive Journal",
    description: "Leadership reflection journal with guided prompts and AI insights.",
    workspace: "executive",
    requiredPlan: "professional",
    requiredPermissions: [],
    dependencies: [],
    navigationTarget: "/journal",
    recommendationSupport: true,
    aiSupport: true,
  },

  // ── Learning ───────────────────────────────────────────────
  {
    id: "academy",
    name: "Executive Academy",
    description: "Structured executive learning courses with AI coaching and certificates.",
    workspace: "executive",
    requiredPlan: "free",
    requiredPermissions: [],
    dependencies: [],
    navigationTarget: "/academy",
    recommendationSupport: true,
    aiSupport: true,
  },
  {
    id: "challenge",
    name: "Daily Executive Challenge",
    description: "Daily leadership challenges to build streaks and improve readiness.",
    workspace: "executive",
    requiredPlan: "professional",
    requiredPermissions: [],
    dependencies: [],
    navigationTarget: "/challenge",
    recommendationSupport: true,
    aiSupport: true,
  },
  {
    id: "simulator",
    name: "Executive Simulator",
    description: "High-fidelity leadership scenario simulations with AI scoring and feedback.",
    workspace: "executive",
    requiredPlan: "professional",
    requiredPermissions: [],
    dependencies: [],
    navigationTarget: "/simulator",
    recommendationSupport: true,
    aiSupport: true,
  },
  {
    id: "debate",
    name: "Executive Debate",
    description: "AI-powered executive debate practice with multi-perspective argument analysis.",
    workspace: "executive",
    requiredPlan: "professional",
    requiredPermissions: [],
    dependencies: [],
    navigationTarget: "/debate",
    recommendationSupport: true,
    aiSupport: true,
  },
  {
    id: "council",
    name: "Executive Council",
    description: "Multi-persona AI council for strategic decision-making and risk analysis.",
    workspace: "executive",
    requiredPlan: "executive",
    requiredPermissions: [],
    dependencies: [],
    navigationTarget: "/council",
    recommendationSupport: true,
    aiSupport: true,
  },
  {
    id: "marketplace",
    name: "Marketplace",
    description: "Executive content marketplace with courses, bundles, and collections.",
    workspace: "executive",
    requiredPlan: "free",
    requiredPermissions: [],
    dependencies: [],
    navigationTarget: "/marketplace",
    recommendationSupport: false,
    aiSupport: false,
  },

  // ── Leadership ─────────────────────────────────────────────
  {
    id: "leadership_dna",
    name: "Leadership DNA™",
    description: "15-dimension leadership competency assessment with radar visualization and gap analysis.",
    workspace: "executive",
    requiredPlan: "executive",
    requiredPermissions: [],
    dependencies: ["profile"],
    navigationTarget: "/leadership-dna",
    recommendationSupport: true,
    aiSupport: true,
  },
  {
    id: "intelligence_center",
    name: "Intelligence Center",
    description: "Unified executive intelligence: readiness, competencies, benchmarks, and growth plan.",
    workspace: "executive",
    requiredPlan: "free",
    requiredPermissions: [],
    dependencies: ["leadership_dna", "promotion_forecast"],
    navigationTarget: "/intelligence",
    recommendationSupport: true,
    aiSupport: true,
  },
  {
    id: "digital_twin",
    name: "Digital Twin™",
    description: "AI digital twin modeling career trajectory, leadership forecast, and scenario simulation.",
    workspace: "executive",
    requiredPlan: "executive",
    requiredPermissions: [],
    dependencies: ["leadership_dna", "promotion_forecast"],
    navigationTarget: "/digital-twin",
    recommendationSupport: true,
    aiSupport: true,
  },
  {
    id: "decision_intelligence",
    name: "Decision Lab™",
    description: "Executive decision intelligence with scenario comparison, AI advisor, and outcome prediction.",
    workspace: "executive",
    requiredPlan: "executive",
    requiredPermissions: [],
    dependencies: ["promotion_forecast"],
    navigationTarget: "/decision-intelligence",
    recommendationSupport: true,
    aiSupport: true,
  },
  {
    id: "promotion_forecast",
    name: "Promotion Forecast™",
    description: "AI promotion readiness, probability, momentum, and timeline forecast with 15 leadership dimensions.",
    workspace: "executive",
    requiredPlan: "executive",
    requiredPermissions: [],
    dependencies: ["leadership_dna"],
    navigationTarget: "/promotion-forecast",
    recommendationSupport: true,
    aiSupport: true,
  },
  {
    id: "reputation",
    name: "Executive Reputation",
    description: "Reputation score, badges, community trust, and executive influence metrics.",
    workspace: "executive",
    requiredPlan: "free",
    requiredPermissions: [],
    dependencies: [],
    navigationTarget: "/reputation",
    recommendationSupport: false,
    aiSupport: false,
  },
  {
    id: "executive_rankings",
    name: "Executive Rankings",
    description: "Platform-wide executive leaderboard and rankings.",
    workspace: "executive",
    requiredPlan: "free",
    requiredPermissions: [],
    dependencies: [],
    navigationTarget: "/executive/rankings",
    recommendationSupport: false,
    aiSupport: false,
  },
  {
    id: "brand_center",
    name: "Executive Brand Center",
    description: "Executive brand management: public profile, digital business card, and analytics.",
    workspace: "executive",
    requiredPlan: "free",
    requiredPermissions: [],
    dependencies: ["profile"],
    navigationTarget: "/brand-center",
    recommendationSupport: false,
    aiSupport: false,
  },

  // ── AI Coach ───────────────────────────────────────────────
  {
    id: "executive_coach",
    name: "Executive Coaching™",
    description: "AI executive coach with scenario practice, leadership homework, and saved insights.",
    workspace: "executive",
    requiredPlan: "professional",
    requiredPermissions: [],
    dependencies: [],
    navigationTarget: "/coach",
    recommendationSupport: true,
    aiSupport: true,
  },
  {
    id: "ai_command_center",
    name: "AI Command Center",
    description: "Personal AI usage dashboard with cost tracking, model analytics, and optimization.",
    workspace: "executive",
    requiredPlan: "free",
    requiredPermissions: [],
    dependencies: [],
    navigationTarget: "/ai-command-center",
    recommendationSupport: false,
    aiSupport: false,
  },

  // ── Metrics ────────────────────────────────────────────────
  {
    id: "metrics",
    name: "Executive Metrics",
    description: "KPI dashboard tracking executive development progress and readiness trends.",
    workspace: "executive",
    requiredPlan: "professional",
    requiredPermissions: [],
    dependencies: [],
    navigationTarget: "/metrics",
    recommendationSupport: false,
    aiSupport: false,
  },
  {
    id: "analytics",
    name: "Analytics",
    description: "Leadership analytics with trend analysis, benchmarking, and progress visualization.",
    workspace: "executive",
    requiredPlan: "professional",
    requiredPermissions: [],
    dependencies: ["metrics"],
    navigationTarget: "/analytics",
    recommendationSupport: false,
    aiSupport: false,
  },

  // ── Identity ───────────────────────────────────────────────
  {
    id: "identity_verification",
    name: "Identity Verification",
    description: "Multi-layer identity verification: email, phone, professional, and executive credentials.",
    workspace: "executive",
    requiredPlan: "free",
    requiredPermissions: [],
    dependencies: ["profile"],
    navigationTarget: "/identity-verification",
    recommendationSupport: false,
    aiSupport: false,
  },
  {
    id: "verification_center",
    name: "Verification Center™",
    description: "Centralized verification workflow with trust score, confidence, and risk assessment.",
    workspace: "executive",
    requiredPlan: "free",
    requiredPermissions: [],
    dependencies: ["identity_verification"],
    navigationTarget: "/verification-center",
    recommendationSupport: false,
    aiSupport: false,
  },
  {
    id: "evidence_vault",
    name: "Evidence Vault™",
    description: "Evidence management with quality scoring, confidence decay, and AI review.",
    workspace: "executive",
    requiredPlan: "free",
    requiredPermissions: [],
    dependencies: ["identity_verification"],
    navigationTarget: "/evidence-vault",
    recommendationSupport: false,
    aiSupport: true,
  },
  {
    id: "identity_graph",
    name: "Identity Graph™",
    description: "Visual graph of identity relationships, evidence links, and trust propagation.",
    workspace: "executive",
    requiredPlan: "free",
    requiredPermissions: [],
    dependencies: ["verification_center"],
    navigationTarget: "/identity-graph",
    recommendationSupport: false,
    aiSupport: false,
  },
  {
    id: "security",
    name: "Account Security™",
    description: "Security center with sessions, devices, MFA, and access control.",
    workspace: "executive",
    requiredPlan: "free",
    requiredPermissions: [],
    dependencies: ["profile"],
    navigationTarget: "/security",
    recommendationSupport: false,
    aiSupport: false,
  },
  {
    id: "privacy_compliance",
    name: "Privacy & Compliance™",
    description: "Personal privacy center with consent management and data subject rights.",
    workspace: "executive",
    requiredPlan: "free",
    requiredPermissions: [],
    dependencies: ["profile"],
    navigationTarget: "/privacy-compliance",
    recommendationSupport: false,
    aiSupport: false,
  },

  // ── Account ────────────────────────────────────────────────
  {
    id: "profile",
    name: "Profile",
    description: "Executive Identity Center — personal info, experience, education, and skills.",
    workspace: "executive",
    requiredPlan: "free",
    requiredPermissions: [],
    dependencies: [],
    navigationTarget: "/profile",
    recommendationSupport: false,
    aiSupport: false,
  },
  {
    id: "billing",
    name: "Billing",
    description: "Subscription management, payment history, and plan comparison.",
    workspace: "executive",
    requiredPlan: "free",
    requiredPermissions: [],
    dependencies: [],
    navigationTarget: "/billing",
    recommendationSupport: false,
    aiSupport: false,
  },
  {
    id: "settings",
    name: "Settings",
    description: "User preferences, appearance, notifications, and account configuration.",
    workspace: "executive",
    requiredPlan: "free",
    requiredPermissions: [],
    dependencies: [],
    navigationTarget: "/settings",
    recommendationSupport: false,
    aiSupport: false,
  },
  {
    id: "compare_plans",
    name: "Compare Plans",
    description: "Subscription plan comparison and upgrade flow.",
    workspace: "executive",
    requiredPlan: "free",
    requiredPermissions: [],
    dependencies: [],
    navigationTarget: "/compare-plans",
    recommendationSupport: false,
    aiSupport: false,
  },
  {
    id: "founder_portal",
    name: "Founder Portal",
    description: "Founding member portal with benefits, community, events, and rewards.",
    workspace: "executive",
    requiredPlan: "free",
    requiredPermissions: [],
    dependencies: [],
    navigationTarget: "/founder",
    recommendationSupport: false,
    aiSupport: false,
  },
  {
    id: "referrals",
    name: "Ambassador Program",
    description: "Referral dashboard with commission tracking and withdrawal management.",
    workspace: "executive",
    requiredPlan: "free",
    requiredPermissions: [],
    dependencies: [],
    navigationTarget: "/referrals",
    recommendationSupport: false,
    aiSupport: false,
  },
  {
    id: "wallet",
    name: "Executive Wallet",
    description: "Wallet balance, commission flow, and withdrawal management.",
    workspace: "executive",
    requiredPlan: "free",
    requiredPermissions: [],
    dependencies: [],
    navigationTarget: "/wallet",
    recommendationSupport: false,
    aiSupport: false,
  },

  // ── Enterprise ─────────────────────────────────────────────
  {
    id: "enterprise_dashboard",
    name: "Enterprise Dashboard",
    description: "Organization-wide workforce development and leadership pipeline dashboard.",
    workspace: "enterprise",
    requiredPlan: "enterprise",
    requiredPermissions: [],
    dependencies: [],
    navigationTarget: "/enterprise",
    recommendationSupport: true,
    aiSupport: true,
  },
  {
    id: "hr_dashboard",
    name: "HR Dashboard",
    description: "HR command center for workforce metrics, learning assignments, and succession.",
    workspace: "enterprise",
    requiredPlan: "enterprise",
    requiredPermissions: [],
    dependencies: ["enterprise_dashboard"],
    navigationTarget: "/hr-dashboard",
    recommendationSupport: true,
    aiSupport: false,
  },
  {
    id: "succession_planning",
    name: "Succession Planning",
    description: "Leadership succession pipeline with readiness tracking and gap analysis.",
    workspace: "enterprise",
    requiredPlan: "enterprise",
    requiredPermissions: [],
    dependencies: ["hr_dashboard", "promotion_readiness"],
    navigationTarget: "/succession-planning",
    recommendationSupport: true,
    aiSupport: true,
  },
  {
    id: "learning_assignments",
    name: "Learning Assignments",
    description: "Assign and track executive learning paths across the organization.",
    workspace: "enterprise",
    requiredPlan: "enterprise",
    requiredPermissions: [],
    dependencies: ["hr_dashboard", "academy"],
    navigationTarget: "/learning-assignments",
    recommendationSupport: false,
    aiSupport: false,
  },
  {
    id: "promotion_readiness",
    name: "Promotion Readiness",
    description: "Organization-wide promotion readiness assessment and benchmarking.",
    workspace: "enterprise",
    requiredPlan: "enterprise",
    requiredPermissions: [],
    dependencies: ["hr_dashboard"],
    navigationTarget: "/promotion-readiness",
    recommendationSupport: true,
    aiSupport: true,
  },
  {
    id: "organization_users",
    name: "Organization Users",
    description: "Manage organization members, roles, and workspace assignments.",
    workspace: "enterprise",
    requiredPlan: "enterprise",
    requiredPermissions: ["can_manage_users"],
    dependencies: ["enterprise_dashboard"],
    navigationTarget: "/organization/users",
    recommendationSupport: false,
    aiSupport: false,
  },
  {
    id: "sso",
    name: "SSO & Identity",
    description: "Single sign-on configuration and identity provider management.",
    workspace: "enterprise",
    requiredPlan: "enterprise",
    requiredPermissions: [],
    dependencies: ["organization_users"],
    navigationTarget: "/sso",
    recommendationSupport: false,
    aiSupport: false,
  },

  // ── Operations / Commercial ────────────────────────────────
  {
    id: "commercial_command_center",
    name: "Commercial Intelligence™",
    description: "CRM-based commercial intelligence dashboard with KPIs, funnel, and revenue analytics.",
    workspace: "operations",
    requiredPlan: "developer",
    requiredPermissions: ["can_access_platform"],
    dependencies: [],
    navigationTarget: "/commercial-command-center",
    recommendationSupport: true,
    aiSupport: true,
  },
  {
    id: "commercial_automation",
    name: "Commercial Automation™",
    description: "Automation engine connecting commercial intelligence to tactical execution and tasks.",
    workspace: "operations",
    requiredPlan: "developer",
    requiredPermissions: ["can_access_platform"],
    dependencies: ["commercial_command_center"],
    navigationTarget: "/commercial-automation",
    recommendationSupport: true,
    aiSupport: true,
  },
  {
    id: "business_intelligence",
    name: "Business Intelligence™",
    description: "Weekly BI report with outcome metrics, automation effectiveness, and improvement loop.",
    workspace: "operations",
    requiredPlan: "developer",
    requiredPermissions: ["can_access_platform"],
    dependencies: ["commercial_command_center", "commercial_automation"],
    navigationTarget: "/business-intelligence",
    recommendationSupport: false,
    aiSupport: true,
  },

  // ── Developer ──────────────────────────────────────────────
  {
    id: "developer_console",
    name: "Developer Console",
    description: "Engineering command center for platform operations and diagnostics.",
    workspace: "developer",
    requiredPlan: "developer",
    requiredPermissions: ["can_access_developer"],
    dependencies: [],
    navigationTarget: "/developer",
    recommendationSupport: false,
    aiSupport: false,
  },
  {
    id: "system_health",
    name: "System Health",
    description: "Platform system health monitoring and incident tracking.",
    workspace: "developer",
    requiredPlan: "developer",
    requiredPermissions: ["can_access_developer"],
    dependencies: ["developer_console"],
    navigationTarget: "/developer/system-health",
    recommendationSupport: false,
    aiSupport: false,
  },
  {
    id: "experience_audit",
    name: "Autonomic Experience Engine™",
    description: "Platform experience audit and self-healing engine.",
    workspace: "developer",
    requiredPlan: "developer",
    requiredPermissions: ["can_access_developer"],
    dependencies: ["developer_console"],
    navigationTarget: "/developer/experience-audit",
    recommendationSupport: false,
    aiSupport: true,
  },
  {
    id: "guardian",
    name: "Guardian™",
    description: "Platform guardian for security monitoring and threat detection.",
    workspace: "developer",
    requiredPlan: "developer",
    requiredPermissions: ["can_access_developer"],
    dependencies: ["developer_console"],
    navigationTarget: "/guardian",
    recommendationSupport: false,
    aiSupport: true,
  },
  {
    id: "audit_logs",
    name: "Audit Logs",
    description: "Platform audit log registry with filtering and export.",
    workspace: "developer",
    requiredPlan: "developer",
    requiredPermissions: ["can_view_audit_logs"],
    dependencies: ["developer_console"],
    navigationTarget: "/developer/audit-logs",
    recommendationSupport: false,
    aiSupport: false,
  },
  {
    id: "api_keys",
    name: "API Management",
    description: "API key management and access control.",
    workspace: "developer",
    requiredPlan: "developer",
    requiredPermissions: ["can_access_developer"],
    dependencies: ["developer_console"],
    navigationTarget: "/developer/api-keys",
    recommendationSupport: false,
    aiSupport: false,
  },
  {
    id: "database_tools",
    name: "Database Explorer",
    description: "Database exploration tools and entity management.",
    workspace: "developer",
    requiredPlan: "developer",
    requiredPermissions: ["can_access_developer"],
    dependencies: ["developer_console"],
    navigationTarget: "/developer/database",
    recommendationSupport: false,
    aiSupport: false,
  },
  {
    id: "deployment_center",
    name: "Deployment Center",
    description: "Deployment pipeline management and release tracking.",
    workspace: "developer",
    requiredPlan: "developer",
    requiredPermissions: ["can_access_developer"],
    dependencies: ["developer_console"],
    navigationTarget: "/developer/deployments",
    recommendationSupport: false,
    aiSupport: false,
  },
  {
    id: "feature_management",
    name: "Feature Flags",
    description: "Feature flag management with targeting and release controls.",
    workspace: "developer",
    requiredPlan: "developer",
    requiredPermissions: ["can_manage_features"],
    dependencies: ["developer_console"],
    navigationTarget: "/feature-management",
    recommendationSupport: false,
    aiSupport: false,
  },
  {
    id: "diagnostics",
    name: "Developer Diagnostics™",
    description: "Platform governance center with diagnostics, coverage, and self-healing.",
    workspace: "developer",
    requiredPlan: "developer",
    requiredPermissions: ["can_access_developer"],
    dependencies: ["developer_console"],
    navigationTarget: "/developer/diagnostics",
    recommendationSupport: false,
    aiSupport: true,
  },
  {
    id: "ai_observability",
    name: "AI Observability Center™",
    description: "AI observability with latency, cost, and quality monitoring.",
    workspace: "developer",
    requiredPlan: "developer",
    requiredPermissions: ["can_access_developer"],
    dependencies: ["developer_console"],
    navigationTarget: "/developer/ai-observability",
    recommendationSupport: false,
    aiSupport: false,
  },
  {
    id: "platform_stability",
    name: "Platform Stability™",
    description: "Platform stability assessment and resilience engineering.",
    workspace: "developer",
    requiredPlan: "developer",
    requiredPermissions: ["can_access_developer"],
    dependencies: ["developer_console"],
    navigationTarget: "/developer/stability",
    recommendationSupport: false,
    aiSupport: false,
  },
  {
    id: "cognitive_excellence",
    name: "Cognitive Excellence Engine™",
    description: "AI cognitive excellence with memory, personalization, and capability chains.",
    workspace: "developer",
    requiredPlan: "developer",
    requiredPermissions: ["can_access_developer"],
    dependencies: ["developer_console"],
    navigationTarget: "/developer/cognitive",
    recommendationSupport: false,
    aiSupport: true,
  },
  {
    id: "scalability_assessment",
    name: "Scalability™",
    description: "Platform scalability assessment with load testing and capacity planning.",
    workspace: "developer",
    requiredPlan: "developer",
    requiredPermissions: ["can_access_developer"],
    dependencies: ["developer_console"],
    navigationTarget: "/developer/scalability",
    recommendationSupport: false,
    aiSupport: false,
  },
  {
    id: "performance_resilience",
    name: "Performance & Resilience™",
    description: "Production readiness, performance, and resilience engineering.",
    workspace: "developer",
    requiredPlan: "developer",
    requiredPermissions: ["can_access_developer"],
    dependencies: ["developer_console"],
    navigationTarget: "/developer/performance-resilience",
    recommendationSupport: false,
    aiSupport: false,
  },
  {
    id: "architecture_audit",
    name: "Architecture Audit™",
    description: "Platform architecture audit and governance board.",
    workspace: "developer",
    requiredPlan: "developer",
    requiredPermissions: ["can_access_developer"],
    dependencies: ["developer_console"],
    navigationTarget: "/developer/architecture-audit",
    recommendationSupport: false,
    aiSupport: false,
  },
  {
    id: "launch_readiness",
    name: "Launch Readiness™",
    description: "Platform launch readiness assessment and go/no-go checklist.",
    workspace: "developer",
    requiredPlan: "developer",
    requiredPermissions: ["can_access_developer"],
    dependencies: ["developer_console"],
    navigationTarget: "/developer/launch-readiness",
    recommendationSupport: false,
    aiSupport: false,
  },
  {
    id: "security_intelligence",
    name: "Security Intelligence™",
    description: "Security intelligence center with test registry, coverage, and tech debt.",
    workspace: "developer",
    requiredPlan: "developer",
    requiredPermissions: ["can_access_developer"],
    dependencies: ["developer_console"],
    navigationTarget: "/developer/security-intelligence",
    recommendationSupport: false,
    aiSupport: false,
  },
  {
    id: "organization_admin",
    name: "Organizations",
    description: "Platform organization management and administration.",
    workspace: "developer",
    requiredPlan: "developer",
    requiredPermissions: ["can_access_platform"],
    dependencies: ["developer_console"],
    navigationTarget: "/developer/organizations",
    recommendationSupport: false,
    aiSupport: false,
  },

  // ── Platform Admin ─────────────────────────────────────────
  {
    id: "admin_console",
    name: "Admin Console",
    description: "Platform administration console with users, features, and health.",
    workspace: "operations",
    requiredPlan: "developer",
    requiredPermissions: ["can_access_platform"],
    dependencies: [],
    navigationTarget: "/admin",
    recommendationSupport: false,
    aiSupport: false,
  },
  {
    id: "pricing_admin",
    name: "Pricing Admin",
    description: "Pricing plan management and configuration.",
    workspace: "operations",
    requiredPlan: "developer",
    requiredPermissions: ["can_manage_pricing"],
    dependencies: ["admin_console"],
    navigationTarget: "/pricing-admin",
    recommendationSupport: false,
    aiSupport: false,
  },
  {
    id: "billing_admin",
    name: "Billing Admin",
    description: "Platform billing administration and invoice management.",
    workspace: "operations",
    requiredPlan: "developer",
    requiredPermissions: ["can_manage_billing"],
    dependencies: ["admin_console"],
    navigationTarget: "/billing-admin",
    recommendationSupport: false,
    aiSupport: false,
  },
  {
    id: "payment_settings",
    name: "Payment Settings",
    description: "Payment provider configuration and settings.",
    workspace: "operations",
    requiredPlan: "developer",
    requiredPermissions: ["can_manage_billing"],
    dependencies: ["admin_console"],
    navigationTarget: "/payment-settings",
    recommendationSupport: false,
    aiSupport: false,
  },
  {
    id: "email_settings",
    name: "Email Settings",
    description: "Email provider configuration and diagnostics.",
    workspace: "operations",
    requiredPlan: "developer",
    requiredPermissions: ["can_access_platform"],
    dependencies: ["admin_console"],
    navigationTarget: "/email-settings",
    recommendationSupport: false,
    aiSupport: false,
  },
  {
    id: "company_admin",
    name: "Company Admin",
    description: "Company data management and logo reliability dashboard.",
    workspace: "operations",
    requiredPlan: "developer",
    requiredPermissions: ["can_manage_companies"],
    dependencies: ["admin_console"],
    navigationTarget: "/company-admin",
    recommendationSupport: false,
    aiSupport: false,
  },
];

// ============================================================
// INDEX — fast lookup by ID
// ============================================================

const CAPABILITY_INDEX = CAPABILITIES.reduce((acc, cap) => {
  acc[cap.id] = cap;
  return acc;
}, {});

// ============================================================
// REGISTRY API
// ============================================================

export function getCapabilityById(id) {
  return CAPABILITY_INDEX[id] || null;
}

export function getCapabilitiesByWorkspace(workspace) {
  return CAPABILITIES.filter((c) => c.workspace === workspace);
}

export function getCapabilitiesByPlan(plan) {
  return CAPABILITIES.filter((c) => planSatisfies(plan, c.requiredPlan));
}

export function getRecommendationCapabilities() {
  return CAPABILITIES.filter((c) => c.recommendationSupport);
}

export function getAICapabilities() {
  return CAPABILITIES.filter((c) => c.aiSupport);
}

export function getAllCapabilityIds() {
  return CAPABILITIES.map((c) => c.id);
}

export function getCapabilityCount() {
  return CAPABILITIES.length;
}

/**
 * Resolve a list of capability IDs into full capability objects.
 * Unknown IDs are silently skipped (defensive).
 */
export function resolveCapabilities(ids) {
  if (!ids) return [];
  if (ids === "*") return CAPABILITIES;
  return ids
    .map((id) => CAPABILITY_INDEX[id])
    .filter(Boolean);
}

/**
 * Check if a user can access a capability based on plan and permissions.
 * @param {string} capabilityId
 * @param {string} userPlan
 * @param {string[]} userPermissions
 * @returns {boolean}
 */
export function canAccessCapability(capabilityId, userPlan, userPermissions = []) {
  const cap = getCapabilityById(capabilityId);
  if (!cap) return false;
  if (!planSatisfies(userPlan, cap.requiredPlan)) return false;
  if (cap.requiredPermissions.length === 0) return true;
  return cap.requiredPermissions.every((perm) => userPermissions.includes(perm));
}

/**
 * Resolve the navigation target for a capability ID.
 */
export function getCapabilityPath(capabilityId) {
  const cap = getCapabilityById(capabilityId);
  return cap?.navigationTarget || null;
}

/**
 * Get dependency chain for a capability (transitive).
 */
export function getDependencyChain(capabilityId, visited = new Set()) {
  if (visited.has(capabilityId)) return [];
  visited.add(capabilityId);
  const cap = getCapabilityById(capabilityId);
  if (!cap) return [];
  const chain = [];
  for (const depId of cap.dependencies) {
    chain.push(depId);
    chain.push(...getDependencyChain(depId, visited));
  }
  return [...new Set(chain)];
}

/**
 * Registry health summary.
 */
export function getCapabilityRegistryHealth() {
  const workspaces = [...new Set(CAPABILITIES.map((c) => c.workspace))];
  const withRecommendations = CAPABILITIES.filter((c) => c.recommendationSupport);
  const withAI = CAPABILITIES.filter((c) => c.aiSupport);
  const withDependencies = CAPABILITIES.filter((c) => c.dependencies.length > 0);
  return {
    totalCapabilities: CAPABILITIES.length,
    workspaces: workspaces.length,
    workspaceList: workspaces,
    withRecommendations: withRecommendations.length,
    withAI: withAI.length,
    withDependencies: withDependencies.length,
    coverage: Math.round((withRecommendations.length / CAPABILITIES.length) * 100),
  };
}
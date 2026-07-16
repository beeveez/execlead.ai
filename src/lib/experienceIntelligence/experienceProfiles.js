/**
 * Experience Profiles™
 * ============================================================
 * Configurable profiles that drive the Experience Engine™.
 *
 * One Experience Engine. Multiple Experience Profiles.
 *
 * Each profile defines:
 *   • Dashboard layout
 *   • Available modules
 *   • Sidebar navigation
 *   • Next Best Action™
 *   • AI recommendations
 *   • Daily missions
 *   • Weekly objectives
 *   • Notifications
 *   • Feature availability
 *   • Upgrade opportunities
 *
 * The Experience Engine™ reads from the profile — it contains
 * NO per-profile orchestration logic.
 */
import { normalizeRole } from "@/lib/roles";

// ============================================================
// PROFILE DEFINITIONS
// ============================================================

export const EXPERIENCE_PROFILES = {
  // ──────────────────────────────────────────────────────────
  // FREE EXPERIENCE™
  // Focus: onboarding, profile completion, resume upload, activation
  // ──────────────────────────────────────────────────────────
  free: {
    id: "free",
    label: "Free Experience™",
    description: "Onboarding, profile completion, resume upload, and activation.",
    focus: "onboarding",
    color: "text-sky-400",
    dashboardLayout: {
      hero: "profile_completion",
      sections: ["onboarding_checklist", "first_steps", "upgrade_prompt"],
      defaultRoute: "/dashboard",
    },
    availableModules: ["dashboard", "profile", "resume_intelligence", "executive_portfolio", "companies", "academy", "settings", "compare_plans"],
    sidebarNav: [
      { label: "Platform", paths: ["/dashboard", "/onboarding", "/academy"] },
      { label: "Career", paths: ["/resume", "/companies"] },
      { label: "Account", paths: ["/profile", "/settings", "/compare-plans"] },
    ],
    nextBestAction: {
      title: "Complete your profile",
      description: "Build your Executive Identity to unlock personalized insights.",
      path: "/profile",
      priority: "high",
      estimatedMinutes: 10,
    },
    aiRecommendations: [
      { title: "Upload your resume", path: "/resume", reason: "Accelerate your profile setup with AI-powered extraction" },
      { title: "Browse companies", path: "/companies", reason: "Discover target organizations in your industry" },
      { title: "Start onboarding", path: "/onboarding", reason: "Complete your executive identity setup" },
    ],
    dailyMissions: [
      { title: "Complete one profile section", path: "/profile", estimatedMinutes: 10, impact: "profile_completion" },
      { title: "Upload your resume", path: "/resume", estimatedMinutes: 5, impact: "resume_upload" },
      { title: "Browse one company", path: "/companies", estimatedMinutes: 5, impact: "discovery" },
    ],
    weeklyObjectives: [
      { title: "Reach 50% profile completion", target: 50, metric: "profile_completeness" },
      { title: "Upload your resume", target: 1, metric: "resume_uploaded" },
      { title: "View 3 companies", target: 3, metric: "companies_viewed" },
    ],
    notifications: [
      { type: "onboarding", priority: "high", message: "Complete your profile to unlock more features" },
      { type: "resume", priority: "medium", message: "Upload your resume to accelerate your profile" },
    ],
    featureAvailability: ["dashboard", "profile", "resume_intelligence", "companies", "academy"],
    upgradeOpportunities: [
      { plan: "professional", label: "Professional Experience™", price: 29, reason: "Unlock simulations, daily challenges, and career advisor", highlight: true },
    ],
  },

  // ──────────────────────────────────────────────────────────
  // PROFESSIONAL EXPERIENCE™
  // Focus: career growth, interview preparation, simulations, promotion readiness
  // ──────────────────────────────────────────────────────────
  professional: {
    id: "professional",
    label: "Professional Experience™",
    description: "Career growth, interview preparation, simulations, and promotion readiness.",
    focus: "career_growth",
    color: "text-blue-400",
    dashboardLayout: {
      hero: "readiness_score",
      sections: ["daily_actions", "career_metrics", "recommended_simulations", "challenge_streak"],
      defaultRoute: "/dashboard",
    },
    availableModules: ["dashboard", "profile", "resume_intelligence", "executive_portfolio", "companies", "academy", "settings", "compare_plans", "career_advisor", "career_studio", "simulator", "challenge", "metrics", "analytics", "journal", "executive_coach", "ai_command_center"],
    sidebarNav: [
      { label: "Platform", paths: ["/dashboard", "/challenge", "/academy", "/coach", "/simulator"] },
      { label: "Career", paths: ["/career", "/career-studio", "/resume", "/companies", "/journal"] },
      { label: "Insights", paths: ["/metrics", "/analytics"] },
      { label: "Account", paths: ["/profile", "/billing", "/compare-plans", "/settings"] },
    ],
    nextBestAction: {
      title: "Complete today's challenge",
      description: "Build your leadership streak and improve readiness.",
      path: "/challenge",
      priority: "high",
      estimatedMinutes: 15,
    },
    aiRecommendations: [
      { title: "Run an executive simulation", path: "/simulator", reason: "Practice leadership scenarios to build readiness" },
      { title: "Review your career path", path: "/career", reason: "See how your target roles align with your profile" },
      { title: "Complete daily challenge", path: "/challenge", reason: "Maintain your streak and build momentum" },
    ],
    dailyMissions: [
      { title: "Complete daily challenge", path: "/challenge", estimatedMinutes: 15, impact: "streak" },
      { title: "Run one simulation", path: "/simulator", estimatedMinutes: 20, impact: "readiness" },
      { title: "Review career goals", path: "/career", estimatedMinutes: 10, impact: "career_focus" },
    ],
    weeklyObjectives: [
      { title: "Complete 3 simulations", target: 3, metric: "simulations_completed" },
      { title: "Complete 5 daily challenges", target: 5, metric: "challenges_completed" },
      { title: "Review career advisor session", target: 1, metric: "career_session" },
    ],
    notifications: [
      { type: "challenge", priority: "high", message: "Don't break your challenge streak — complete today's challenge" },
      { type: "simulation", priority: "medium", message: "Practice a simulation to improve readiness" },
    ],
    featureAvailability: ["dashboard", "profile", "resume_intelligence", "companies", "academy", "career_advisor", "career_studio", "simulator", "challenge", "metrics", "analytics", "journal", "executive_coach"],
    upgradeOpportunities: [
      { plan: "executive", label: "Executive Experience™", price: 79, reason: "Unlock executive coaching, briefings, leadership DNA, and career orchestration", highlight: true },
    ],
  },

  // ──────────────────────────────────────────────────────────
  // EXECUTIVE EXPERIENCE™
  // Focus: executive coaching, strategic leadership, executive briefings,
  //        leadership DNA, career orchestration
  // ──────────────────────────────────────────────────────────
  executive: {
    id: "executive",
    label: "Executive Experience™",
    description: "Executive coaching, strategic leadership, briefings, leadership DNA, and career orchestration.",
    focus: "executive_leadership",
    color: "text-indigo-400",
    dashboardLayout: {
      hero: "executive_briefing",
      sections: ["briefing_summary", "leadership_dna", "promotion_forecast", "strategic_actions", "momentum"],
      defaultRoute: "/dashboard",
    },
    availableModules: ["dashboard", "executive_briefing", "journey_orchestrator", "action_center", "executive_coach", "leadership_dna", "digital_twin", "decision_intelligence", "promotion_forecast", "intelligence_center", "council", "debate", "simulator", "challenge", "academy", "career_advisor", "career_studio", "resume_intelligence", "executive_portfolio", "companies", "metrics", "analytics", "journal", "reputation", "executive_rankings", "brand_center", "profile", "billing", "settings"],
    sidebarNav: [
      { label: "Command Center", paths: ["/dashboard", "/executive-briefing", "/journey-orchestrator", "/action-center"] },
      { label: "Leadership", paths: ["/coach", "/leadership-dna", "/digital-twin", "/decision-intelligence"] },
      { label: "Intelligence", paths: ["/promotion-forecast", "/intelligence", "/council", "/debate"] },
      { label: "Development", paths: ["/simulator", "/challenge", "/academy"] },
      { label: "Career", paths: ["/career", "/resume", "/companies", "/journal"] },
      { label: "Brand", paths: ["/reputation", "/executive/rankings", "/brand-center"] },
      { label: "Account", paths: ["/profile", "/billing", "/settings"] },
    ],
    nextBestAction: {
      title: "Review your executive briefing",
      description: "Stay aligned with your weekly executive summary and strategic priorities.",
      path: "/executive-briefing",
      priority: "high",
      estimatedMinutes: 15,
    },
    aiRecommendations: [
      { title: "Start executive coaching session", path: "/coach", reason: "Get personalized strategic leadership coaching" },
      { title: "Update Leadership DNA", path: "/leadership-dna", reason: "Refine your competency assessment for accurate forecasting" },
      { title: "Review promotion forecast", path: "/promotion-forecast", reason: "Track your executive readiness trajectory" },
      { title: "Run a strategic simulation", path: "/simulator", reason: "Practice high-stakes executive decisions" },
    ],
    dailyMissions: [
      { title: "Executive coaching session", path: "/coach", estimatedMinutes: 20, impact: "coaching" },
      { title: "Leadership reflection", path: "/journal", estimatedMinutes: 10, impact: "reflection" },
      { title: "Review strategic decisions", path: "/decision-intelligence", estimatedMinutes: 15, impact: "decision_quality" },
    ],
    weeklyObjectives: [
      { title: "Complete 2 coaching sessions", target: 2, metric: "coaching_sessions" },
      { title: "Review executive briefing", target: 1, metric: "briefing_reviewed" },
      { title: "Update Leadership DNA", target: 1, metric: "dna_updated" },
    ],
    notifications: [
      { type: "briefing", priority: "high", message: "Your weekly executive briefing is ready" },
      { type: "coaching", priority: "medium", message: "Schedule your executive coaching session this week" },
    ],
    featureAvailability: ["dashboard", "executive_briefing", "journey_orchestrator", "action_center", "executive_coach", "leadership_dna", "digital_twin", "decision_intelligence", "promotion_forecast", "intelligence_center", "council", "debate", "simulator", "challenge", "academy", "career_advisor", "career_studio", "resume_intelligence", "executive_portfolio", "companies", "metrics", "analytics", "journal", "reputation", "executive_rankings", "brand_center"],
    upgradeOpportunities: [
      { plan: "enterprise", label: "Enterprise Experience™", price: 500, reason: "Unlock organization-wide workforce development, governance, and succession planning", highlight: false },
    ],
  },

  // ──────────────────────────────────────────────────────────
  // ENTERPRISE EXPERIENCE™
  // Focus: organization health, workforce development, governance, succession planning
  // ──────────────────────────────────────────────────────────
  enterprise: {
    id: "enterprise",
    label: "Enterprise Experience™",
    description: "Organization health, workforce development, governance, and succession planning.",
    focus: "organization_health",
    color: "text-purple-400",
    dashboardLayout: {
      hero: "organization_health",
      sections: ["workforce_metrics", "governance_status", "succession_pipeline", "learning_progress", "enterprise_insights"],
      defaultRoute: "/enterprise",
    },
    availableModules: ["enterprise_dashboard", "hr_dashboard", "succession_planning", "learning_assignments", "promotion_readiness", "analytics", "academy", "executive_coach", "simulator", "council", "leadership_dna", "marketplace", "companies", "organization_users", "sso", "security", "identity_verification", "ai_command_center", "billing", "settings", "profile"],
    sidebarNav: [
      { label: "Enterprise Workspace", paths: ["/enterprise", "/ai-command-center", "/academy", "/coach", "/simulator", "/council", "/leadership-dna", "/marketplace"] },
      { label: "Organization", paths: ["/companies", "/analytics", "/hr-dashboard", "/learning-assignments", "/promotion-readiness"] },
      { label: "Administration", paths: ["/organization/users", "/succession-planning", "/sso", "/settings"] },
      { label: "Account & Billing", paths: ["/billing", "/ai-usage", "/connected-accounts", "/profile", "/security"] },
    ],
    nextBestAction: {
      title: "Review workforce metrics",
      description: "Monitor your organization's leadership development pipeline.",
      path: "/hr-dashboard",
      priority: "high",
      estimatedMinutes: 20,
    },
    aiRecommendations: [
      { title: "Check succession pipeline", path: "/succession-planning", reason: "Review readiness of your leadership bench" },
      { title: "Approve learning assignments", path: "/learning-assignments", reason: "Ensure your workforce is on track with development plans" },
      { title: "Review promotion readiness", path: "/promotion-readiness", reason: "Identify ready-for-promotion talent across teams" },
    ],
    dailyMissions: [
      { title: "Review workforce metrics", path: "/hr-dashboard", estimatedMinutes: 20, impact: "workforce_insight" },
      { title: "Check succession pipeline", path: "/succession-planning", estimatedMinutes: 15, impact: "succession" },
      { title: "Approve learning assignments", path: "/learning-assignments", estimatedMinutes: 10, impact: "development" },
    ],
    weeklyObjectives: [
      { title: "Complete workforce review", target: 1, metric: "workforce_reviewed" },
      { title: "Verify governance compliance", target: 1, metric: "governance_check" },
      { title: "Update succession plans", target: 1, metric: "succession_updated" },
    ],
    notifications: [
      { type: "workforce", priority: "high", message: "New workforce development data available" },
      { type: "governance", priority: "medium", message: "Governance compliance review needed this week" },
      { type: "succession", priority: "medium", message: "Succession pipeline updates pending review" },
    ],
    featureAvailability: ["enterprise_dashboard", "hr_dashboard", "succession_planning", "learning_assignments", "promotion_readiness", "analytics", "academy", "executive_coach", "simulator", "council", "leadership_dna", "marketplace", "companies", "organization_users", "sso", "security", "identity_verification"],
    upgradeOpportunities: [],
  },

  // ──────────────────────────────────────────────────────────
  // DEVELOPER EXPERIENCE™
  // Focus: platform operations, diagnostics, AI control plane, observability
  // ──────────────────────────────────────────────────────────
  developer: {
    id: "developer",
    label: "Developer Experience™",
    description: "Platform operations, diagnostics, AI control plane, and observability.",
    focus: "platform_operations",
    color: "text-emerald-400",
    dashboardLayout: {
      hero: "platform_health",
      sections: ["system_health", "ai_observability", "platform_stability", "commercial_intelligence", "deployment_status"],
      defaultRoute: "/developer",
    },
    availableModules: ["developer_console", "system_health", "experience_audit", "guardian", "audit_logs", "api_keys", "database_tools", "migration_history", "deployment_center", "feature_management", "organization_admin", "admin_console", "enterprise_admin", "commercial_command_center", "commercial_automation", "ai_command_center", "ai_observability", "platform_stability", "cognitive_excellence", "scalability_assessment", "performance_resilience", "architecture_audit", "launch_readiness", "commercial_readiness", "diagnostics", "security_intelligence"],
    sidebarNav: [
      { label: "Developer Command Center™", paths: ["/developer"] },
      { label: "Platform Operations", paths: ["/developer/system-health", "/developer/experience-audit"] },
      { label: "Security & Trust", paths: ["/guardian", "/developer/audit-logs"] },
      { label: "Engineering", paths: ["/developer/api-keys", "/developer/database", "/developer/migrations", "/developer/deployments"] },
      { label: "AI Control Plane", paths: ["/developer/ai-command-center", "/developer/ai-optimization", "/developer/ai-policy", "/developer/model-router", "/developer/ai-observability"] },
      { label: "Platform Intelligence", paths: ["/developer/stability", "/developer/cognitive", "/developer/scalability", "/developer/performance-resilience", "/developer/architecture-audit"] },
      { label: "Commercial", paths: ["/commercial-command-center", "/commercial-automation", "/developer/commercial-readiness"] },
      { label: "System Administration", paths: ["/admin", "/feature-management", "/enterprise", "/organization/users"] },
    ],
    nextBestAction: {
      title: "Review platform health",
      description: "Check system stability, AI observability, and deployment status.",
      path: "/developer/system-health",
      priority: "high",
      estimatedMinutes: 15,
    },
    aiRecommendations: [
      { title: "Check audit logs", path: "/developer/audit-logs", reason: "Review recent platform activity and security events" },
      { title: "Monitor AI usage", path: "/developer/ai-command-center", reason: "Track AI consumption, costs, and optimization opportunities" },
      { title: "Review deployment readiness", path: "/developer/deployments", reason: "Ensure platform changes are ready for production" },
      { title: "Check commercial health", path: "/commercial-command-center", reason: "Monitor MRR, churn, and revenue intelligence" },
    ],
    dailyMissions: [
      { title: "Review system health", path: "/developer/system-health", estimatedMinutes: 15, impact: "stability" },
      { title: "Check audit logs", path: "/developer/audit-logs", estimatedMinutes: 10, impact: "security" },
      { title: "Monitor AI usage", path: "/developer/ai-command-center", estimatedMinutes: 10, impact: "ai_optimization" },
    ],
    weeklyObjectives: [
      { title: "Complete platform stability review", target: 1, metric: "stability_reviewed" },
      { title: "Run security audit", target: 1, metric: "security_audit" },
      { title: "Verify deployment readiness", target: 1, metric: "deployment_ready" },
    ],
    notifications: [
      { type: "system", priority: "high", message: "Platform health check recommended" },
      { type: "ai", priority: "medium", message: "AI usage patterns need review" },
      { type: "deployment", priority: "medium", message: "Deployment pipeline has pending changes" },
    ],
    featureAvailability: ["developer_console", "system_health", "audit_logs", "api_keys", "database_tools", "deployment_center", "feature_management", "ai_command_center", "ai_observability", "commercial_command_center", "commercial_automation"],
    upgradeOpportunities: [],
  },

  // ──────────────────────────────────────────────────────────
  // SUPER ADMIN EXPERIENCE™
  // Focus: full system access, platform governance, commercial operations, all workspaces
  // ──────────────────────────────────────────────────────────
  super_admin: {
    id: "super_admin",
    label: "Super Admin Experience™",
    description: "Full system access, platform governance, commercial operations, and all workspaces.",
    focus: "platform_governance",
    color: "text-amber-400",
    dashboardLayout: {
      hero: "platform_overview",
      sections: ["commercial_intelligence", "platform_status", "system_health", "all_workspaces", "security_events"],
      defaultRoute: "/dashboard",
    },
    availableModules: [
      // Executive modules
      "dashboard", "executive_briefing", "journey_orchestrator", "action_center", "executive_coach", "leadership_dna", "digital_twin", "decision_intelligence", "promotion_forecast", "intelligence_center", "council", "debate", "simulator", "challenge", "academy", "career_advisor", "career_studio", "resume_intelligence", "executive_portfolio", "companies", "metrics", "analytics", "journal", "reputation", "executive_rankings", "brand_center",
      // Enterprise modules
      "enterprise_dashboard", "hr_dashboard", "succession_planning", "learning_assignments", "promotion_readiness",
      // Developer modules
      "developer_console", "system_health", "audit_logs", "api_keys", "database_tools", "deployment_center", "feature_management", "ai_command_center", "ai_observability", "platform_stability",
      // Commercial modules
      "commercial_command_center", "commercial_automation",
      // Admin modules
      "admin_console", "organization_admin", "pricing_admin", "billing_admin", "email_settings", "payment_settings", "company_admin",
      // Account
      "profile", "billing", "settings", "security", "identity_verification",
    ],
    sidebarNav: [
      { label: "Command", paths: ["/dashboard", "/executive-briefing", "/action-center"] },
      { label: "Executive", paths: ["/coach", "/leadership-dna", "/digital-twin", "/decision-intelligence", "/promotion-forecast", "/intelligence", "/council", "/debate"] },
      { label: "Enterprise", paths: ["/enterprise", "/hr-dashboard", "/succession-planning", "/learning-assignments", "/promotion-readiness"] },
      { label: "Developer", paths: ["/developer", "/developer/system-health", "/developer/audit-logs", "/developer/api-keys", "/developer/database", "/developer/deployments", "/feature-management", "/guardian"] },
      { label: "AI Control Plane", paths: ["/developer/ai-command-center", "/developer/ai-optimization", "/developer/ai-policy", "/developer/model-router", "/developer/ai-observability"] },
      { label: "Commercial", paths: ["/commercial-command-center", "/commercial-automation", "/developer/commercial-readiness"] },
      { label: "Platform Admin", paths: ["/admin", "/pricing-admin", "/billing-admin", "/payment-settings", "/email-settings", "/company-admin"] },
      { label: "Account", paths: ["/profile", "/billing", "/settings", "/security"] },
    ],
    nextBestAction: {
      title: "Review commercial health and platform status",
      description: "Monitor MRR, churn, platform stability, and security events.",
      path: "/commercial-command-center",
      priority: "high",
      estimatedMinutes: 20,
    },
    aiRecommendations: [
      { title: "Review commercial intelligence", path: "/commercial-command-center", reason: "Monitor revenue, growth, and retention metrics" },
      { title: "Check platform status", path: "/developer/system-health", reason: "Verify system health and stability" },
      { title: "Review security events", path: "/developer/audit-logs", reason: "Audit recent security activity across the platform" },
      { title: "Evaluate AI governance", path: "/developer/ai-policy", reason: "Review AI policy compliance and optimization" },
    ],
    dailyMissions: [
      { title: "Review commercial health", path: "/commercial-command-center", estimatedMinutes: 20, impact: "commercial" },
      { title: "Check platform status", path: "/developer/system-health", estimatedMinutes: 15, impact: "platform" },
      { title: "Review security events", path: "/developer/audit-logs", estimatedMinutes: 10, impact: "security" },
    ],
    weeklyObjectives: [
      { title: "Complete commercial review", target: 1, metric: "commercial_reviewed" },
      { title: "Run platform audit", target: 1, metric: "platform_audit" },
      { title: "Conduct security review", target: 1, metric: "security_review" },
    ],
    notifications: [
      { type: "commercial", priority: "high", message: "Commercial intelligence update available" },
      { type: "platform", priority: "high", message: "Platform status review recommended" },
      { type: "security", priority: "medium", message: "Security events require attention" },
    ],
    featureAvailability: ["*"],
    upgradeOpportunities: [],
  },
};

// ============================================================
// PROFILE RESOLUTION
// ============================================================

/**
 * Resolve the appropriate Experience Profile based on:
 *   • User role
 *   • Subscription plan
 *   • Active workspace
 *   • Journey stage
 *   • Feature entitlements
 *
 * Resolution priority:
 *   1. Role override (super_admin, developer)
 *   2. Workspace override (enterprise workspace)
 *   3. Subscription plan (enterprise, executive, professional)
 *   4. Default: free
 */
export function resolveExperienceProfile(user, profile, workspace, journeyStage, entitlements) {
  if (!user) return EXPERIENCE_PROFILES.free;

  const role = normalizeRole(user.role);

  // 1. Role-based override — highest priority
  if (role === "super_admin") return EXPERIENCE_PROFILES.super_admin;
  if (role === "developer") return EXPERIENCE_PROFILES.developer;

  // 2. Workspace-based override
  if (workspace === "enterprise") return EXPERIENCE_PROFILES.enterprise;
  if (workspace === "developer") return EXPERIENCE_PROFILES.developer;

  // 3. Enterprise membership via profile
  if (profile?.organization_id || role === "enterprise_admin" || role === "enterprise_manager" || role === "enterprise_user" || role === "organization_owner") {
    return EXPERIENCE_PROFILES.enterprise;
  }

  // 4. Subscription plan
  const plan = profile?.subscription_plan || profile?.planTier || entitlements?.plan || "free";
  const planLower = String(plan).toLowerCase();

  if (planLower.includes("enterprise")) return EXPERIENCE_PROFILES.enterprise;
  if (planLower.includes("executive")) return EXPERIENCE_PROFILES.executive;
  if (planLower.includes("professional")) return EXPERIENCE_PROFILES.professional;
  if (planLower.includes("founding")) return EXPERIENCE_PROFILES.executive; // Founding members get Executive experience

  // 5. Default: free
  return EXPERIENCE_PROFILES.free;
}

// ============================================================
// PROFILE ACCESSORS
// ============================================================

export function getExperienceProfile(profileId) {
  return EXPERIENCE_PROFILES[profileId] || EXPERIENCE_PROFILES.free;
}

export function getAllProfiles() {
  return Object.values(EXPERIENCE_PROFILES);
}

export function getProfileModules(profileId) {
  const profile = getExperienceProfile(profileId);
  return profile.availableModules || [];
}

export function getProfileSidebarNav(profileId) {
  const profile = getExperienceProfile(profileId);
  return profile.sidebarNav || [];
}

export function getProfileDashboardLayout(profileId) {
  const profile = getExperienceProfile(profileId);
  return profile.dashboardLayout || {};
}

export function getProfileMissions(profileId) {
  const profile = getExperienceProfile(profileId);
  return profile.dailyMissions || [];
}

export function getProfileObjectives(profileId) {
  const profile = getExperienceProfile(profileId);
  return profile.weeklyObjectives || [];
}

export function getProfileAIRecommendations(profileId) {
  const profile = getExperienceProfile(profileId);
  return profile.aiRecommendations || [];
}

export function getProfileNotifications(profileId) {
  const profile = getExperienceProfile(profileId);
  return profile.notifications || [];
}

export function getProfileUpgrades(profileId) {
  const profile = getExperienceProfile(profileId);
  return profile.upgradeOpportunities || [];
}

export function getProfileNextBestAction(profileId) {
  const profile = getExperienceProfile(profileId);
  return profile.nextBestAction || null;
}

/**
 * Convert an Experience Profile into an adaptive mode object
 * for backward compatibility with the Adaptive Experience™ system.
 */
export function profileToAdaptiveMode(profile) {
  if (!profile) return null;
  return {
    id: profile.id,
    label: profile.label,
    description: profile.description,
    priorityModules: (profile.availableModules || []).slice(0, 5),
    dashboardFocus: profile.focus,
    coachFocus: profile.focus,
    color: profile.color || "text-indigo-400",
  };
}
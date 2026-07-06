import { base44 } from "@/api/base44Client";

export const PLAN_TIERS = { free: 0, professional: 1, executive: 2, enterprise: 3 };

export const PLAN_LIMITS = {
  free: { daily_coaching: 5, weekly_challenges: 3, companies: 1, career_paths: 1 },
  professional: { daily_coaching: Infinity, weekly_challenges: Infinity, companies: Infinity, career_paths: Infinity },
  executive: { daily_coaching: Infinity, weekly_challenges: Infinity, companies: Infinity, career_paths: Infinity },
  enterprise: { daily_coaching: Infinity, weekly_challenges: Infinity, companies: Infinity, career_paths: Infinity }
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
  { id: "enterprise_sla", name: "Enterprise SLA", description: "Service level agreement with uptime guarantees", category: "Enterprise", icon: "Shield", minimumPlan: "enterprise", isEnabled: true, sortOrder: 73 }
];

export function getFeaturesForPlan(planId) {
  const tier = PLAN_TIERS[planId] ?? 0;
  return DEFAULT_FEATURES
    .filter(f => f.isEnabled && (PLAN_TIERS[f.minimumPlan] ?? 0) <= tier)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function hasFeatureAccess(planId, featureId) {
  const f = DEFAULT_FEATURES.find(x => x.id === featureId);
  if (!f || !f.isEnabled) return false;
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
    if (!overrides || overrides.length === 0) return DEFAULT_FEATURES;
    return DEFAULT_FEATURES.map(def => {
      const ov = overrides.find(o => o.feature_id === def.id);
      if (!ov) return def;
      return {
        ...def,
        name: ov.name || def.name,
        description: ov.description || def.description,
        category: ov.category || def.category,
        icon: ov.icon || def.icon,
        minimumPlan: ov.minimum_plan || def.minimumPlan,
        isEnabled: ov.is_enabled ?? def.isEnabled,
        sortOrder: ov.sort_order ?? def.sortOrder,
        limitLabel: ov.limit_label || def.limitLabel
      };
    });
  } catch (e) {
    return DEFAULT_FEATURES;
  }
}
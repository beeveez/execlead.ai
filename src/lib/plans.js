export const PLANS = {
  free: {
    id: "free",
    name: "Free",
    price: { monthly: 0, annual: 0 },
    description: "Start your executive journey",
    color: "#94a3b8",
    icon: "🌱",
    features: [
      "5 AI coaching requests/day",
      "3 interview challenges/week",
      "Basic dashboard",
      "1 career path",
      "1 company profile",
      "Basic analytics"
    ],
    limits: {
      daily_coaching: 5,
      weekly_challenges: 3,
      companies: 1,
      career_paths: 1,
      simulator: false,
      debate: false,
      truth_engine: false,
      academy: false,
      career_advisor: false,
      advanced_analytics: false,
      board_simulator: false,
      enterprise_dashboard: false,
      custom_learning: false,
      team_management: false,
    }
  },
  professional: {
    id: "professional",
    name: "Professional",
    price: { monthly: 29, annual: 290 },
    description: "For ambitious leaders",
    color: "#6366f1",
    icon: "🚀",
    features: [
      "Unlimited AI Executive Coach",
      "Executive Simulator",
      "Executive Debate Mode",
      "Truth Engine",
      "Executive Academy",
      "Career Advisor",
      "Company Intelligence",
      "Leadership Analytics",
      "Daily Executive Challenge",
      "Executive Journal",
      "Resume Builder",
      "ATS Resume Analyzer"
    ],
    limits: {
      daily_coaching: Infinity,
      weekly_challenges: Infinity,
      companies: Infinity,
      career_paths: Infinity,
      simulator: true,
      debate: true,
      truth_engine: true,
      academy: true,
      career_advisor: true,
      advanced_analytics: false,
      board_simulator: false,
      enterprise_dashboard: false,
      custom_learning: false,
      team_management: false,
    }
  },
  executive: {
    id: "executive",
    name: "Executive",
    price: { monthly: 79, annual: 790 },
    description: "For senior executives",
    color: "#a855f7",
    icon: "👑",
    features: [
      "Everything in Professional",
      "Board Meeting Simulator",
      "CIO Coaching",
      "CFO Coaching",
      "COO Coaching",
      "Executive Presentation Coach",
      "Executive Review Simulator",
      "Customer Escalation Simulator",
      "Crisis Management",
      "Executive Negotiation Coach",
      "Executive Storytelling",
      "Executive Strategy Workshops"
    ],
    limits: {
      daily_coaching: Infinity,
      weekly_challenges: Infinity,
      companies: Infinity,
      career_paths: Infinity,
      simulator: true,
      debate: true,
      truth_engine: true,
      academy: true,
      career_advisor: true,
      advanced_analytics: true,
      board_simulator: true,
      enterprise_dashboard: false,
      custom_learning: false,
      team_management: false,
    }
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    price: { monthly: 199, annual: 1990 },
    description: "For organizations",
    color: "#10b981",
    icon: "🏢",
    features: [
      "Everything in Executive",
      "Team Dashboard",
      "HR Dashboard",
      "Department Analytics",
      "Seat Management",
      "Role Management",
      "Company Branding",
      "Custom Learning Paths",
      "Organization Reports",
      "SSO Ready",
      "Audit Logs",
      "API Access",
      "AI Usage Dashboard",
      "Dedicated Customer Success"
    ],
    limits: {
      daily_coaching: Infinity,
      weekly_challenges: Infinity,
      companies: Infinity,
      career_paths: Infinity,
      simulator: true,
      debate: true,
      truth_engine: true,
      academy: true,
      career_advisor: true,
      advanced_analytics: true,
      board_simulator: true,
      enterprise_dashboard: true,
      custom_learning: true,
      team_management: true,
    }
  }
};

export const PLAN_LIST = Object.values(PLANS);

export const getPlan = (profile) => {
  const planId = profile?.subscription_plan || "free";
  return PLANS[planId] || PLANS.free;
};

export const hasFeature = (profile, feature) => {
  const plan = getPlan(profile);
  return plan.limits[feature] !== false && plan.limits[feature] !== undefined;
};
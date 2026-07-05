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
      "Progress Analytics",
      "Daily Challenges",
      "Unlimited company research"
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
      "Board Meeting Simulator",
      "CIO Coaching",
      "CFO Coaching",
      "Executive Review Simulations",
      "Customer Escalation Simulator",
      "Crisis Management",
      "Executive Presentation Coach",
      "Salary Negotiation Coach",
      "Advanced Analytics",
      "Executive Leadership Assessment"
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
      "Team Dashboard",
      "Department Analytics",
      "HR Dashboard",
      "Manager Dashboard",
      "Seat Management",
      "Role Management",
      "Company Branding",
      "Custom Learning Paths",
      "Organization Reports",
      "SSO Ready",
      "Audit Logs"
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
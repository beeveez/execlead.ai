import { base44 } from "@/api/base44Client";

export const DEFAULT_CATALOG = [
  {
    id: "free",
    name: "Free",
    description: "Start your executive journey",
    monthlyPrice: 0,
    annualPrice: 0,
    currency: "USD",
    badge: null,
    buttonText: "Start Free",
    recommended: false,
    enterpriseOnly: false,
    visible: true,
    color: "#94a3b8",
    icon: "🌱",
    sortOrder: 0,
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
      team_management: false
    }
  },
  {
    id: "professional",
    name: "Professional",
    description: "For ambitious leaders",
    monthlyPrice: 29,
    annualPrice: 290,
    currency: "USD",
    badge: null,
    buttonText: "Start 14-Day Trial",
    recommended: false,
    enterpriseOnly: false,
    visible: true,
    color: "#6366f1",
    icon: "🚀",
    sortOrder: 1,
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
      team_management: false
    }
  },
  {
    id: "executive",
    name: "Executive",
    description: "For senior executives",
    monthlyPrice: 79,
    annualPrice: 790,
    currency: "USD",
    badge: "Most Popular",
    buttonText: "Start 14-Day Trial",
    recommended: true,
    enterpriseOnly: false,
    visible: true,
    color: "#a855f7",
    icon: "👑",
    sortOrder: 2,
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
      team_management: false
    }
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For organizations",
    monthlyPrice: 199,
    annualPrice: 1990,
    currency: "USD",
    badge: null,
    buttonText: "Contact Sales",
    recommended: false,
    enterpriseOnly: true,
    visible: true,
    color: "#10b981",
    icon: "🏢",
    sortOrder: 3,
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
      team_management: true
    }
  }
];

export async function getPricingCatalog() {
  try {
    const overrides = await base44.entities.PricingPlan.list("sort_order", 50);
    if (!overrides || overrides.length === 0) return DEFAULT_CATALOG;
    return DEFAULT_CATALOG.map(def => {
      const ov = overrides.find(o => o.plan_id === def.id);
      if (!ov) return def;
      return {
        ...def,
        name: ov.name || def.name,
        description: ov.description || def.description,
        monthlyPrice: ov.monthly_price ?? def.monthlyPrice,
        annualPrice: ov.annual_price ?? def.annualPrice,
        currency: ov.currency || def.currency,
        badge: ov.badge !== undefined && ov.badge !== "" ? ov.badge : def.badge,
        buttonText: ov.button_text || def.buttonText,
        features: ov.features && ov.features.length ? ov.features : def.features,
        recommended: ov.recommended ?? def.recommended,
        enterpriseOnly: ov.enterprise_only ?? def.enterpriseOnly,
        visible: ov.visible ?? def.visible
      };
    });
  } catch (e) {
    return DEFAULT_CATALOG;
  }
}
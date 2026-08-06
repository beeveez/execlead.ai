// Enterprise Commercial Architecture™ — single source of truth for the
// EXECLEAD.AI commercial model: value-based pricing, GA enterprise licensing
// tiers, expansion revenue (Executive Simulation Credits™), Enterprise ROI
// metrics, commercial KPIs, and the long-term revenue architecture.
//
// This registry does NOT alter product functionality or Private Beta pricing.
// Private Beta keeps the current Free / Professional / Executive / Enterprise
// (Contact Sales) model; GA tiers and bundles activate at General Availability.

export const COMMERCIAL_PRINCIPLE =
  "Customers buy outcomes, not AI. EXECLEAD.AI is positioned around measurable business outcomes — never AI token usage or underlying models.";

export const VALUE_BASED_PRICING_FACTORS = [
  "Active Leaders",
  "Leadership Population",
  "Organization Size",
  "Business Units",
  "Enterprise Requirements",
  "Annual Contract Value",
];

// General Availability enterprise licensing tiers (shown as planned licensing;
// Private Beta does not introduce complex licensing).
export const GA_ENTERPRISE_TIERS = [
  {
    id: "executive_launchpad",
    name: "Executive Launchpad™",
    stage: "Planned · General Availability",
    target: "Growing companies",
    purpose: "Leadership development for emerging leaders.",
    includes: [
      "Executive Readiness™",
      "Leadership DNA™",
      "AI Coach™",
      "Basic Executive Simulations™",
      "Executive Dashboard™",
    ],
  },
  {
    id: "enterprise_leadership_os",
    name: "Enterprise Leadership OS™",
    stage: "Planned · General Availability",
    target: "Mid-market & Global Enterprises",
    purpose: "Enterprise leadership development and talent intelligence.",
    includes: [
      "Everything in Launchpad™",
      "Executive Assessment Center™",
      "Succession Planning™",
      "Promotion Readiness™",
      "Enterprise Analytics™",
      "HR Dashboard™",
      "Custom Competency Models™",
      "SSO",
      "SCIM",
      "Manager Dashboard™",
    ],
  },
  {
    id: "strategic_enterprise",
    name: "Strategic Enterprise™",
    stage: "Planned · General Availability",
    target: "Fortune 500 · Government · Defense · Large Consulting Firms",
    purpose: "Dedicated, governed enterprise leadership cloud.",
    includes: [
      "Dedicated Environment",
      "Custom Executive Simulations™",
      "Custom Leadership Frameworks™",
      "Dedicated Customer Success",
      "Priority Support",
      "Enterprise Integrations",
      "Custom AI Configuration",
      "Advanced Governance",
    ],
  },
];

// Expansion revenue — premium Executive Simulation Credits™.
export const SIMULATION_CREDIT_PROGRAM = {
  name: "Executive Simulation Credits™",
  description:
    "Enterprise accounts receive an annual allocation of premium simulation credits. Customers may purchase additional bundles or upgrade to a higher enterprise plan for a larger annual allocation — expansion that feels natural, not punitive.",
  annualAllocationPerAccount: 120,
  premiumTypes: [
    "Executive Crisis Simulations™",
    "Boardroom Decision Labs™",
    "Executive Debate Sessions™",
    "Advanced Assessment Campaigns™",
  ],
  bundles: [
    { id: "bundle_25", credits: 25, label: "Expansion Bundle — 25 Credits", note: "Available at General Availability" },
    { id: "bundle_50", credits: 50, label: "Expansion Bundle — 50 Credits", note: "Available at General Availability" },
    { id: "bundle_100", credits: 100, label: "Expansion Bundle — 100 Credits", note: "Available at General Availability" },
  ],
  upgradeNote:
    "Upgrade to Enterprise Leadership OS™ or Strategic Enterprise™ for a larger annual allocation.",
};

// Enterprise ROI Dashboard™ — measurable business outcomes.
export const ENTERPRISE_ROI_METRICS = [
  { key: "readiness_improvement", label: "Executive Readiness Improvement", computed: true, description: "Average Executive Readiness™ lift across the leadership population." },
  { key: "promotion_readiness", label: "Promotion Readiness", computed: true, description: "Leaders forecasted as ready for promotion within 12 months." },
  { key: "competency_growth", label: "Leadership Competency Growth", computed: false, description: "Growth in leadership competencies over the development period." },
  { key: "assessment_completion", label: "Assessment Completion", computed: true, description: "Executive assessments completed across the organization." },
  { key: "simulation_participation", label: "Simulation Participation", computed: true, description: "Executive simulations practiced by leaders." },
  { key: "succession_pipeline", label: "Succession Pipeline Health", computed: true, description: "Critical roles with identified successors." },
  { key: "leadership_engagement", label: "Leadership Engagement", computed: true, description: "Active leadership engagement across the platform." },
  { key: "ai_coaching_utilization", label: "AI Coaching Utilization", computed: false, description: "Utilization of AI Executive Coach sessions." },
  { key: "learning_progress", label: "Learning Progress", computed: true, description: "Progress through Executive Academy learning paths." },
  { key: "benchmark_trends", label: "Leadership Benchmark Trends", computed: false, description: "Benchmarking trends across the leadership population." },
];

// Enterprise Commercial Intelligence™ — commercial KPIs.
export const COMMERCIAL_KPIS = [
  { key: "arr", label: "Annual Recurring Revenue", computed: false },
  { key: "mrr", label: "Monthly Recurring Revenue", computed: false },
  { key: "enterprise_accounts", label: "Enterprise Accounts", computed: true },
  { key: "expansion_revenue", label: "Expansion Revenue", computed: false },
  { key: "renewals", label: "Renewals", computed: false },
  { key: "churn_risk", label: "Churn Risk", computed: false },
  { key: "acv", label: "Average Contract Value", computed: false },
  { key: "ltv", label: "Customer Lifetime Value", computed: false },
  { key: "sales_pipeline", label: "Sales Pipeline", computed: false },
  { key: "simulation_credit_usage", label: "Simulation Credit Usage", computed: false },
  { key: "enterprise_adoption", label: "Enterprise Adoption", computed: true },
];

// Long-term revenue architecture — each engine complements the OS without
// product fragmentation.
export const REVENUE_ARCHITECTURE = [
  "Enterprise SaaS",
  "Executive Leadership Cloud™",
  "Enterprise Certifications™",
  "Executive Academy™",
  "Consulting & Advisory Services™",
  "Marketplace™",
  "Enterprise APIs & Integrations™",
];
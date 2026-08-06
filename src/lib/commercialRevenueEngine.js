// Commercial Revenue Engine™ — the financial operating system for EXECLEAD.AI.
// Connects every revenue stream into one enterprise commercial architecture.
// Computes real metrics from existing entities (Subscriptions, BillingEvents,
// CPQQuotes, Organizations, Certificates, Marketplace, Purchases) and labels
// each metric by data status: live | projected | architecture.
// Does NOT alter product functionality or pricing. Beta-aware honesty enforced.

import { PLANS } from "./plans";

export const BETA_NOTE =
  "EXECLEAD.AI is in Founding Private Beta™. Live metrics reflect beta-stage activity; projected metrics apply planned GA pricing to current usage; architecture metrics are defined and awaiting data at General Availability.";

export const REVENUE_ENGINES = [
  {
    id: "enterprise_saas", name: "Enterprise SaaS™", tagline: "Core subscription licensing", icon: "Building2", color: "text-indigo-400",
    description: "Enterprise licenses, Professional, Executive, and Enterprise plans — seat growth, renewals, churn, expansion, and contract value.",
    metrics: [
      { key: "enterprise_licenses", label: "Enterprise Licenses", kind: "live" },
      { key: "professional_plans", label: "Professional Plans", kind: "live" },
      { key: "executive_plans", label: "Executive Plans", kind: "live" },
      { key: "enterprise_plans", label: "Enterprise Plans", kind: "live" },
      { key: "seat_growth", label: "Seat Growth", kind: "architecture" },
      { key: "renewals", label: "Renewals", kind: "architecture" },
      { key: "churn", label: "Churn", kind: "architecture" },
      { key: "expansion", label: "Expansion", kind: "architecture" },
      { key: "contract_value", label: "Contract Value", kind: "live" },
      { key: "revenue_by_industry", label: "Revenue by Industry", kind: "live" },
      { key: "revenue_by_geography", label: "Revenue by Geography", kind: "live" },
      { key: "revenue_by_customer_size", label: "Revenue by Customer Size", kind: "live" },
    ],
  },
  {
    id: "ai_platform", name: "AI Platform™", tagline: "AI usage & premium AI revenue", icon: "Cpu", color: "text-emerald-400",
    description: "AI usage, premium AI features, enterprise AI, simulation consumption, credit utilization, AI revenue and margin.",
    metrics: [
      { key: "ai_usage", label: "AI Usage", kind: "architecture" },
      { key: "premium_ai_features", label: "Premium AI Features", kind: "architecture" },
      { key: "enterprise_ai", label: "Enterprise AI", kind: "architecture" },
      { key: "simulation_consumption", label: "Simulation Consumption", kind: "architecture" },
      { key: "ai_credit_utilization", label: "AI Credit Utilization", kind: "architecture" },
      { key: "ai_revenue", label: "AI Revenue", kind: "architecture" },
      { key: "ai_margin", label: "AI Margin", kind: "architecture" },
      { key: "avg_ai_cost_per_customer", label: "Average AI Cost per Customer", kind: "architecture" },
      { key: "enterprise_ai_adoption", label: "Enterprise AI Adoption", kind: "architecture" },
    ],
  },
  {
    id: "leadership_cloud", name: "Leadership Cloud™", tagline: "Subscriber engagement & retention", icon: "Cloud", color: "text-sky-400",
    description: "Subscribers, MAU, DAU, retention, session length, feature adoption, subscription revenue, and expansion opportunities.",
    metrics: [
      { key: "subscribers", label: "Subscribers", kind: "live" },
      { key: "mau", label: "Monthly Active Users", kind: "architecture" },
      { key: "dau", label: "Daily Active Users", kind: "architecture" },
      { key: "retention", label: "Retention", kind: "architecture" },
      { key: "session_length", label: "Session Length", kind: "architecture" },
      { key: "feature_adoption", label: "Feature Adoption", kind: "architecture" },
      { key: "subscription_revenue", label: "Subscription Revenue", kind: "projected" },
      { key: "expansion_opportunities", label: "Expansion Opportunities", kind: "architecture" },
    ],
  },
  {
    id: "certifications", name: "Executive Certifications™", tagline: "Credentialing & corporate learning", icon: "Award", color: "text-amber-400",
    description: "Certification programs, corporate & individual certifications, enrollment, completion, renewals, and digital credentials.",
    metrics: [
      { key: "programs", label: "Certification Programs", kind: "architecture" },
      { key: "corporate_certs", label: "Corporate Certifications", kind: "architecture" },
      { key: "individual_certs", label: "Individual Certifications", kind: "live" },
      { key: "enrollment", label: "Enrollment", kind: "architecture" },
      { key: "completion_rate", label: "Completion Rate", kind: "architecture" },
      { key: "renewals", label: "Renewals", kind: "architecture" },
      { key: "certification_revenue", label: "Certification Revenue", kind: "architecture" },
      { key: "corporate_learning_contracts", label: "Corporate Learning Contracts", kind: "architecture" },
      { key: "digital_credentials", label: "Digital Credential Issuance", kind: "live" },
    ],
  },
  {
    id: "professional_services", name: "Professional Services™", tagline: "Implementation, consulting & advisory", icon: "Briefcase", color: "text-accent-orange",
    description: "Implementation projects, leadership consulting, executive workshops, custom simulations, onboarding, and advisory.",
    metrics: [
      { key: "implementation_projects", label: "Implementation Projects", kind: "architecture" },
      { key: "leadership_consulting", label: "Leadership Consulting", kind: "architecture" },
      { key: "executive_workshops", label: "Executive Workshops", kind: "architecture" },
      { key: "custom_simulations", label: "Custom Simulations", kind: "architecture" },
      { key: "enterprise_onboarding", label: "Enterprise Onboarding", kind: "architecture" },
      { key: "advisory_services", label: "Advisory Services", kind: "architecture" },
      { key: "ps_revenue", label: "Professional Services Revenue", kind: "architecture" },
      { key: "utilization_rate", label: "Utilization Rate", kind: "architecture" },
      { key: "billable_hours", label: "Billable Hours", kind: "architecture" },
      { key: "project_profitability", label: "Project Profitability", kind: "architecture" },
    ],
  },
  {
    id: "marketplace", name: "Marketplace™", tagline: "Partner & third-party content revenue", icon: "Store", color: "text-purple-400",
    description: "Marketplace listings, partners, courses, leadership programs, assessments, third-party content, sales and commission.",
    metrics: [
      { key: "listings", label: "Marketplace Listings", kind: "live" },
      { key: "partners", label: "Partners", kind: "architecture" },
      { key: "courses", label: "Courses", kind: "live" },
      { key: "leadership_programs", label: "Leadership Programs", kind: "architecture" },
      { key: "assessments", label: "Assessments", kind: "architecture" },
      { key: "third_party_content", label: "Third-Party Content", kind: "architecture" },
      { key: "marketplace_sales", label: "Marketplace Sales", kind: "architecture" },
      { key: "commission_revenue", label: "Commission Revenue", kind: "architecture" },
      { key: "partner_revenue", label: "Partner Revenue", kind: "architecture" },
      { key: "marketplace_growth", label: "Marketplace Growth", kind: "architecture" },
    ],
  },
  {
    id: "developer_platform", name: "Developer Platform & APIs™", tagline: "Usage-based developer revenue", icon: "Code", color: "text-rose-400",
    description: "API customers, keys, calls, premium APIs, enterprise integrations, usage-based revenue, and developer accounts.",
    metrics: [
      { key: "api_customers", label: "API Customers", kind: "architecture" },
      { key: "api_keys", label: "API Keys", kind: "architecture" },
      { key: "api_calls", label: "API Calls", kind: "architecture" },
      { key: "premium_apis", label: "Premium APIs", kind: "architecture" },
      { key: "enterprise_integrations", label: "Enterprise Integrations", kind: "architecture" },
      { key: "usage_based_revenue", label: "Usage-Based Revenue", kind: "architecture" },
      { key: "developer_accounts", label: "Developer Accounts", kind: "architecture" },
      { key: "partner_integrations", label: "Partner Integrations", kind: "architecture" },
      { key: "api_revenue", label: "API Revenue", kind: "architecture" },
      { key: "top_consumers", label: "Top Consumers", kind: "architecture" },
    ],
  },
];

export const KPI_DEFS = [
  { key: "arr", label: "Annual Recurring Revenue", kind: "projected", description: "Annualized recurring subscription revenue at GA pricing plus won enterprise contract ARR." },
  { key: "mrr", label: "Monthly Recurring Revenue", kind: "projected", description: "Monthly recurring subscription revenue at GA pricing." },
  { key: "qrr", label: "Quarterly Recurring Revenue", kind: "projected", description: "MRR × 3." },
  { key: "total_customers", label: "Total Customers", kind: "live", description: "Distinct customers across subscriptions and organizations." },
  { key: "enterprise_customers", label: "Enterprise Customers", kind: "live", description: "Organizations on enterprise plans or enterprise tenants." },
  { key: "nrr", label: "Net Revenue Retention", kind: "architecture", description: "Expansion + renewal revenue / starting revenue. Requires historical cohort data." },
  { key: "grr", label: "Gross Revenue Retention", kind: "architecture", description: "Retained revenue excluding expansion. Requires churn history." },
  { key: "expansion_revenue", label: "Expansion Revenue", kind: "architecture", description: "Revenue from seat additions, upgrades, and add-ons within existing accounts." },
  { key: "renewal_rate", label: "Renewal Rate", kind: "architecture", description: "Renewed contracts / expiring contracts. Requires renewal history." },
  { key: "acv", label: "Average Contract Value", kind: "live", description: "Average annual value across won enterprise quotes." },
  { key: "ltv", label: "Customer Lifetime Value", kind: "architecture", description: "Average revenue per customer over the relationship lifetime." },
  { key: "cac", label: "Customer Acquisition Cost", kind: "architecture", description: "Total sales & marketing spend / new customers acquired." },
  { key: "ltv_cac", label: "LTV:CAC Ratio", kind: "architecture", description: "Lifetime value relative to acquisition cost." },
  { key: "gross_margin", label: "Gross Margin", kind: "architecture", description: "Revenue minus cost of delivery (AI compute, infrastructure, services)." },
  { key: "growth_rate", label: "Revenue Growth Rate", kind: "architecture", description: "Period-over-period revenue growth. Requires historical revenue." },
  { key: "pipeline_value", label: "Pipeline Value", kind: "live", description: "Sum of annual value across open enterprise quotes." },
  { key: "forecast_accuracy", label: "Forecast Accuracy", kind: "architecture", description: "Actual vs. forecasted revenue variance. Requires forecast history." },
];

export const REC_ACTIONS = [
  "Upgrade to Enterprise", "Add Certifications", "Launch Leadership Academy", "Purchase Professional Services",
  "Enable API Access", "Activate Marketplace", "Increase Simulation Capacity", "Expand Leadership Coverage",
];

const WON_STATUSES = ["accepted", "contract_signed", "paid", "active", "provisioned", "invoice_issued"];
const OPEN_STATUSES = ["submitted", "under_review", "approved", ...WON_STATUSES];

export function planMonthlyPrice(plan, cycle) {
  const p = PLANS[plan];
  if (!p) return 0;
  if (cycle === "annual" && p.annualPrice) return p.annualPrice / 12;
  return p.monthlyPrice || 0;
}

export function computeKPIs({ subscriptions = [], billingEvents = [], quotes = [], orgs = [] }) {
  const activeSubs = subscriptions.filter((s) => s.status === "active" || s.status === "trialing");
  const mrrProjected = activeSubs.reduce((sum, s) => sum + planMonthlyPrice(s.plan, s.billing_cycle) * (s.seats || 1), 0);
  const arrProjected = mrrProjected * 12;
  const collectedRevenue = billingEvents.filter((b) => b.event_type === "payment_success" && b.status === "success").reduce((s, b) => s + (b.amount || 0), 0);
  const openQuotes = quotes.filter((q) => OPEN_STATUSES.includes(q.status) && !q.is_archived);
  const wonQuotes = quotes.filter((q) => WON_STATUSES.includes(q.status) && !q.is_archived);
  const pipelineValue = openQuotes.reduce((s, q) => s + (q.annual_value || 0), 0);
  const wonARR = wonQuotes.reduce((s, q) => s + (q.annual_value || 0), 0);
  const acv = wonQuotes.length ? wonARR / wonQuotes.length : 0;
  const totalCustomers = Math.max(orgs.length, new Set(subscriptions.map((s) => s.organization_id || s.owner_user_id).filter(Boolean)).size);
  const enterpriseCustomers = orgs.filter((o) => o.plan === "enterprise" || o.tenant_type === "enterprise").length;

  const val = (key, value, kind, extra) => ({ value, kind: kind || KPI_DEFS.find((k) => k.key === key)?.kind, label: KPI_DEFS.find((k) => k.key === key)?.label, ...extra });

  return {
    arr: val("arr", arrProjected + wonARR),
    mrr: val("mrr", mrrProjected),
    qrr: val("qrr", mrrProjected * 3),
    total_customers: val("total_customers", totalCustomers),
    enterprise_customers: val("enterprise_customers", enterpriseCustomers),
    nrr: val("nrr", null),
    grr: val("grr", null),
    expansion_revenue: val("expansion_revenue", null),
    renewal_rate: val("renewal_rate", null),
    acv: val("acv", acv),
    ltv: val("ltv", null),
    cac: val("cac", null),
    ltv_cac: val("ltv_cac", null),
    gross_margin: val("gross_margin", null),
    growth_rate: val("growth_rate", null),
    pipeline_value: val("pipeline_value", pipelineValue),
    forecast_accuracy: val("forecast_accuracy", null),
    _meta: { collectedRevenue, wonARR, mrrProjected, arrProjected, totalCustomers, enterpriseCustomers, openQuotes: openQuotes.length, wonQuotes: wonQuotes.length },
  };
}

export function computeEngineMetrics(engineId, data) {
  const { subscriptions = [], quotes = [], orgs = [], certificates = [], marketplaceItems = [], purchases = [] } = data;
  const engine = REVENUE_ENGINES.find((e) => e.id === engineId);
  if (!engine) return {};
  const result = {};
  const byPlan = (plan) => subscriptions.filter((s) => s.plan === plan).length;
  const seatSum = (plan) => subscriptions.filter((s) => s.plan === plan).reduce((s, x) => s + (x.seats || 1), 0);

  switch (engineId) {
    case "enterprise_saas":
      result.enterprise_licenses = { value: orgs.length, kind: "live" };
      result.professional_plans = { value: byPlan("professional"), kind: "live" };
      result.executive_plans = { value: byPlan("executive"), kind: "live" };
      result.enterprise_plans = { value: byPlan("enterprise") + orgs.filter((o) => o.plan === "enterprise").length, kind: "live" };
      result.seat_growth = { value: null, kind: "architecture" };
      result.renewals = { value: null, kind: "architecture" };
      result.churn = { value: null, kind: "architecture" };
      result.expansion = { value: null, kind: "architecture" };
      result.contract_value = { value: quotes.filter((q) => WON_STATUSES.includes(q.status)).reduce((s, q) => s + (q.total_contract_value || q.annual_value || 0), 0), kind: "live" };
      result.revenue_by_industry = { value: groupSum(quotes, "industry", "annual_value"), kind: "live", isGroup: true };
      result.revenue_by_geography = { value: groupSum(quotes, "country", "annual_value"), kind: "live", isGroup: true };
      result.revenue_by_customer_size = { value: groupSum(quotes, "company_size", "annual_value"), kind: "live", isGroup: true };
      break;
    case "leadership_cloud":
      result.subscribers = { value: subscriptions.filter((s) => ["professional", "executive", "enterprise"].includes(s.plan)).length, kind: "live" };
      result.subscription_revenue = { value: subscriptions.reduce((s, x) => s + planMonthlyPrice(x.plan, x.billing_cycle) * (x.seats || 1), 0), kind: "projected" };
      engine.metrics.filter((m) => !result[m.key]).forEach((m) => { result[m.key] = { value: null, kind: m.kind }; });
      break;
    case "certifications":
      result.individual_certs = { value: certificates.length, kind: "live" };
      result.digital_credentials = { value: certificates.length, kind: "live" };
      engine.metrics.filter((m) => !result[m.key]).forEach((m) => { result[m.key] = { value: null, kind: m.kind }; });
      break;
    case "marketplace":
      result.listings = { value: marketplaceItems.length, kind: "live" };
      result.courses = { value: marketplaceItems.filter((m) => (m.type || m.category || "").toLowerCase().includes("course")).length, kind: "live" };
      result.marketplace_sales = { value: purchases.length, kind: "live" };
      engine.metrics.filter((m) => !result[m.key]).forEach((m) => { result[m.key] = { value: null, kind: m.kind }; });
      break;
    default:
      engine.metrics.forEach((m) => { result[m.key] = { value: null, kind: m.kind }; });
  }
  return result;
}

function groupSum(arr, keyField, valField) {
  const m = {};
  arr.forEach((o) => { const k = o[keyField] || "Unknown"; m[k] = (m[k] || 0) + (o[valField] || 0); });
  return m;
}

export function forecastScenarios(currentARR, months) {
  const m = months / 12;
  const monthlyGrowth = { best: 0.10, expected: 0.06, conservative: 0.03 };
  const project = (rate) => {
    let arr = currentARR || 0;
    for (let i = 0; i < months; i++) arr *= 1 + rate;
    return Math.round(arr);
  };
  return {
    best: project(monthlyGrowth.best),
    expected: project(monthlyGrowth.expected),
    conservative: project(monthlyGrowth.conservative),
    months,
  };
}

export function expansionScore(org, subscriptions) {
  const plan = org.plan || "free";
  const seatsUsed = org.seats_used || 0;
  const seatsTotal = org.seats_total || 1;
  const seatUtil = seatsTotal > 0 ? seatsUsed / seatsTotal : 0;
  const modules = (org.enabled_modules || []).length;
  let score = 30;
  if (plan === "enterprise") score += 20;
  if (plan === "executive") score += 10;
  score += Math.round(seatUtil * 25);
  score += Math.min(20, modules * 3);
  return Math.min(100, score);
}

export function renewalRisk(org) {
  if (!org.renewal_date) return "Unknown";
  const days = (new Date(org.renewal_date) - new Date()) / 86400000;
  if (days < 30) return "High";
  if (days < 90) return "Medium";
  return "Low";
}

export const ENGINE_PRODUCTS = {
  enterprise_saas: ["Executive Readiness™", "Leadership Simulations™", "Succession Planning™", "Executive Dashboard™"],
  ai_platform: ["AI Coach™", "Executive Simulations™", "Premium AI", "Simulation Credits™"],
  leadership_cloud: ["Leadership Cloud™", "Executive Academy™", "Executive Identity™"],
  certifications: ["Executive Certifications™", "Corporate Learning", "Digital Credentials"],
  professional_services: ["Implementation", "Leadership Consulting", "Executive Workshops", "Advisory"],
  marketplace: ["Marketplace Courses", "Leadership Programs", "Assessments"],
  developer_platform: ["API Access", "Premium APIs", "Enterprise Integrations"],
};

export function productsOwned(org, subscriptions) {
  const owned = new Set();
  const plan = org.plan || "free";
  if (plan !== "free") ENGINE_PRODUCTS.enterprise_saas.forEach((p) => owned.add(p));
  if (["executive", "enterprise"].includes(plan)) ENGINE_PRODUCTS.ai_platform.slice(0, 2).forEach((p) => owned.add(p));
  (org.enabled_modules || []).forEach((m) => owned.add(m));
  subscriptions.filter((s) => s.organization_id === org.id).forEach((s) => {
    if (s.plan !== "free") ENGINE_PRODUCTS.enterprise_saas.forEach((p) => owned.add(p));
  });
  return [...owned];
}

export function recommendedNextProduct(org, owned) {
  const all = [...new Set(Object.values(ENGINE_PRODUCTS).flat())];
  const candidate = all.find((p) => !owned.includes(p));
  return candidate || "Expand Leadership Coverage";
}

export function buildRecommendationPrompt(org, context) {
  const owned = context.productsOwned || [];
  return `You are EXEC™, the AI Executive Concierge for EXECLEAD.AI — an AI Executive Leadership Operating System with multiple revenue engines (Enterprise SaaS, AI Platform, Leadership Cloud, Executive Certifications, Professional Services, Marketplace, Developer Platform & APIs). Analyze this enterprise customer and recommend commercial actions that strengthen their leadership outcomes. Each recommendation must include: action, business reason, estimated revenue opportunity (illustrative, in USD), customer benefit, and confidence level (High/Medium/Low). Do NOT invent customer data — use only the provided profile. Recommend from: ${REC_ACTIONS.join(", ")}.

CUSTOMER:
Name: ${org.name}
Plan: ${org.plan || "free"}
Industry: ${org.industry || "Not documented"}
Size: ${org.company_size || "Not documented"}
Region: ${org.country || org.region || "Not documented"}
Seats: ${org.seats_used || 0}/${org.seats_total || 0}
Products Owned: ${owned.join(", ") || "None"}
Expansion Score: ${context.expansionScore}/100
Renewal Risk: ${context.renewalRisk}

Return JSON: { "recommendations": [{ "action": string, "reason": string, "estimatedOpportunity": string, "customerBenefit": string, "confidence": "High"|"Medium"|"Low" }], "summary": string }`;
}

export function buildIntelligencePrompt(context) {
  return `You are EXEC™, the AI Executive Concierge for EXECLEAD.AI. Generate commercial intelligence insights for Executive Leadership, Finance, Sales, Product, and Customer Success. Use ONLY the provided commercial metrics. For each insight include: insight, supporting metrics, trend analysis, confidence level, and recommended action. Do NOT invent metrics.

COMMERCIAL SNAPSHOT:
${JSON.stringify(context, null, 2)}

Return JSON: { "insights": [{ "insight": string, "supportingMetrics": string, "trendAnalysis": string, "confidence": "High"|"Medium"|"Low", "recommendedAction": string }] }`;
}
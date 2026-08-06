// Strategic Market Intelligence Engine™ — V3 strategic intelligence computations.
// Public/verified information only. Never invents capabilities or market claims.

import { getMatrix, EXECLEAD_AI_MATRIX } from "./competitiveIntelligenceEngine";

// ============================================================
// STRATEGIC THREAT INDEX™
// ============================================================

export const THREAT_DIMENSIONS = [
  { key: "market_momentum", label: "Market Momentum", weight: 12 },
  { key: "enterprise_adoption", label: "Enterprise Adoption", weight: 12 },
  { key: "ai_innovation", label: "AI Innovation", weight: 12 },
  { key: "product_velocity", label: "Product Velocity", weight: 10 },
  { key: "brand_visibility", label: "Brand Visibility", weight: 10 },
  { key: "platform_breadth", label: "Platform Breadth", weight: 10 },
  { key: "executive_leadership_focus", label: "Executive Leadership Focus", weight: 12 },
  { key: "global_presence", label: "Global Presence", weight: 8 },
  { key: "enterprise_readiness", label: "Enterprise Readiness", weight: 8 },
  { key: "security_maturity", label: "Security Maturity", weight: 6 },
];

export const THREAT_LEVEL_META = {
  Critical: { color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/25", bar: "bg-rose-500" },
  High: { color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/25", bar: "bg-amber-500" },
  Moderate: { color: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/25", bar: "bg-sky-500" },
  Low: { color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/25", bar: "bg-emerald-500" },
};

export function threatLevel(score) {
  if (score >= 80) return "Critical";
  if (score >= 60) return "High";
  if (score >= 40) return "Moderate";
  return "Low";
}

export function computeThreatIndex(profile) {
  if (!profile) return null;
  const matrix = getMatrix(profile);
  const supported = (k) => ["Supported", "Publicly Confirmed"].includes(matrix[k]);
  const featCount = Object.keys(matrix).filter(supported).length;
  const enterpriseFeats = ["sso", "scim", "security", "enterprise_dashboard", "trust_center"].filter(supported).length;
  const yrs = profile.founded_year ? new Date().getFullYear() - profile.founded_year : 0;

  const dims = {
    market_momentum: profile.is_ai_native ? 8 : profile.is_legacy ? 4 : 6,
    enterprise_adoption: enterpriseFeats >= 3 ? 8 : enterpriseFeats >= 1 ? 5 : 2,
    ai_innovation: profile.is_ai_native ? 9 : 3,
    product_velocity: profile.is_ai_native ? 7 : 5,
    brand_visibility: yrs > 10 ? 8 : yrs > 4 ? 6 : 4,
    platform_breadth: Math.min(10, 3 + featCount),
    executive_leadership_focus: /leadership|executive/i.test(profile.category || "") ? 8 : /coaching/i.test(profile.category || "") ? 5 : 3,
    global_presence: /global/i.test(profile.geographic_focus || "") ? 8 : 4,
    enterprise_readiness: enterpriseFeats >= 3 ? 8 : enterpriseFeats >= 1 ? 5 : 2,
    security_maturity: supported("security") ? 8 : 3,
  };

  const weightSum = THREAT_DIMENSIONS.reduce((a, d) => a + d.weight, 0);
  const weighted = THREAT_DIMENSIONS.reduce((a, d) => a + (dims[d.key] || 0) * d.weight, 0);
  const score = Math.round((weighted / weightSum) * 10);
  const level = threatLevel(score);
  const trend = profile.is_ai_native ? "rising" : profile.is_legacy ? "stable" : "stable";
  return { score, level, dimensions: dims, trend };
}

export function computeThreatLeaderboard(competitors) {
  return competitors
    .map((c) => ({ profile: c, ...computeThreatIndex(c) }))
    .filter((x) => x.score !== null)
    .sort((a, b) => b.score - a.score);
}

// ============================================================
// EXECLEAD.AI MOAT™
// ============================================================

export const MOAT_PILLARS = [
  { key: "executive_readiness", label: "Executive Readiness™", features: ["executive_readiness", "executive_assessments"] },
  { key: "executive_identity", label: "Executive Identity™", features: ["executive_identity"] },
  { key: "evidence_based", label: "Evidence-Based Development™", features: ["evidence_ledger"] },
  { key: "simulations", label: "Leadership Simulations™", features: ["executive_simulator"] },
  { key: "success_stories", label: "Executive Success Stories™", features: [] },
  { key: "enterprise_assessment", label: "Enterprise Assessment™", features: ["executive_assessments", "leadership_analytics"] },
  { key: "executive_journey", label: "Executive Journey™", features: [] },
  { key: "executive_context", label: "Executive Context™", features: ["decision_intelligence"] },
  { key: "trust_transparency", label: "Trust & Transparency", features: ["trust_center", "security"] },
  { key: "responsible_ai", label: "Responsible AI", features: [] },
  { key: "explainability", label: "Explainability", features: ["evidence_ledger", "leadership_analytics"] },
  { key: "unified_platform", label: "Unified Leadership Platform", features: [] },
];

export const MOAT_STATUS_META = {
  "Competitive Advantage": { color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/25" },
  "Maintained": { color: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/25" },
  "Needs Attention": { color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/25" },
  "Opportunity": { color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/25" },
};

export function computeMoat(competitors) {
  const pillars = MOAT_PILLARS.map((p) => {
    const ourStatuses = p.features.map((f) => EXECLEAD_AI_MATRIX[f] || "Unknown");
    const ourSupported = ourStatuses.some((s) => s === "Supported");
    const ourPlanned = ourStatuses.some((s) => s === "Planned");
    const compSupport = competitors.filter((c) => p.features.some((f) => ["Supported", "Publicly Confirmed"].includes(getMatrix(c)[f]))).length;
    let status = "Opportunity";
    if (ourSupported && compSupport === 0) status = "Competitive Advantage";
    else if (ourSupported && compSupport > 0) status = "Maintained";
    else if (ourPlanned) status = "Needs Attention";
    return { ...p, ourStatuses, competitorSupport: compSupport, status };
  });
  const advCount = pillars.filter((p) => p.status === "Competitive Advantage").length;
  const needsCount = pillars.filter((p) => p.status === "Needs Attention").length;
  const score = Math.round((advCount / pillars.length) * 100);
  const level = score >= 60 ? "Strong Moat" : score >= 40 ? "Maintained Moat" : "Needs Attention";
  return { score, level, pillars, advCount, needsCount };
}

// ============================================================
// COMPETITIVE SIGNALS™ — signal type metadata
// ============================================================

export const SIGNAL_TYPE_META = {
  product_launch: { label: "Product Launch", color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/25" },
  major_feature_release: { label: "Major Feature Release", color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/25" },
  new_feature: { label: "New Feature", color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/25" },
  product_release: { label: "Product Release", color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/25" },
  pricing_change: { label: "Pricing Change", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/25" },
  funding: { label: "Funding", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/25" },
  acquisition: { label: "Acquisition", color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/25" },
  leadership_change: { label: "Leadership Change", color: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/25" },
  strategic_partnership: { label: "Strategic Partnership", color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/25" },
  enterprise_certification: { label: "Enterprise Certification", color: "text-teal-400", bg: "bg-teal-500/10", border: "border-teal-500/25" },
  security_certification: { label: "Security Certification", color: "text-teal-400", bg: "bg-teal-500/10", border: "border-teal-500/25" },
  responsible_ai_update: { label: "Responsible AI Update", color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/25" },
  security_announcement: { label: "Security Announcement", color: "text-teal-400", bg: "bg-teal-500/10", border: "border-teal-500/25" },
  public_integration: { label: "Public Integration", color: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/25" },
  developer_activity: { label: "Developer Activity", color: "text-white/60", bg: "bg-white/5", border: "border-white/10" },
  job_posting: { label: "Job Posting", color: "text-white/60", bg: "bg-white/5", border: "border-white/10" },
  patent_announcement: { label: "Patent Announcement", color: "text-white/60", bg: "bg-white/5", border: "border-white/10" },
  compliance: { label: "Compliance", color: "text-teal-400", bg: "bg-teal-500/10", border: "border-teal-500/25" },
  enterprise_integration: { label: "Enterprise Integration", color: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/25" },
  api_change: { label: "API Change", color: "text-white/60", bg: "bg-white/5", border: "border-white/10" },
  ai_release: { label: "AI Release", color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/25" },
};

// ============================================================
// SEED DATA
// ============================================================

export const MARKET_TREND_SEED = [
  { trend_name: "Rise of AI-Native Executive Leadership Platforms", category: "AI Leadership Platforms", trend_direction: "Rising", growth: "Accelerating", impact: "Critical", confidence: "High", strategic_relevance: "Critical", summary: "Leadership development is consolidating toward AI-native, outcome-based executive operating systems; coaching and learning delivery are commoditizing.", source: "Internal market analysis (public signals)", last_updated: "2026-08-01" },
  { trend_name: "Executive Assessments Become Strategic", category: "Executive Assessments", trend_direction: "Rising", growth: "Strong", impact: "High", confidence: "Medium", strategic_relevance: "Critical", summary: "Enterprises increasingly require evidence-based executive readiness assessments before promotion and succession decisions.", source: "Internal market analysis", last_updated: "2026-08-01" },
  { trend_name: "Succession Intelligence Goes Real-Time", category: "Succession Planning", trend_direction: "Rising", growth: "Moderate", impact: "High", confidence: "Medium", strategic_relevance: "High", summary: "Static succession benches are being replaced by continuous, evidence-based readiness and gap intelligence.", source: "Internal market analysis", last_updated: "2026-08-01" },
  { trend_name: "Enterprise Governance & Responsible AI Expectations", category: "Enterprise HR Technology", trend_direction: "Rising", growth: "Accelerating", impact: "High", confidence: "High", strategic_relevance: "Critical", summary: "Buyers expect transparency, explainability, and governance controls in AI-driven talent and leadership tools.", source: "Internal market analysis", last_updated: "2026-08-01" },
  { trend_name: "AI Coaching Commoditization", category: "Executive Coaching", trend_direction: "Rising", growth: "High", impact: "Medium", confidence: "Medium", strategic_relevance: "Medium", summary: "Conversational AI coaching is becoming broadly available and low-cost, pressuring coaching-centric vendors.", source: "Internal market analysis", last_updated: "2026-08-01" },
  { trend_name: "Agentic AI for Executive Workflows", category: "AI Agents", trend_direction: "Emerging", growth: "Early", impact: "High", confidence: "Low", strategic_relevance: "High", summary: "AI agents that orchestrate executive workflows (briefings, decisions, portfolios) are an emerging frontier.", source: "Internal market analysis", last_updated: "2026-08-01" },
  { trend_name: "Talent Intelligence Convergence", category: "Talent Intelligence", trend_direction: "Rising", growth: "Moderate", impact: "Medium", confidence: "Medium", strategic_relevance: "Medium", summary: "Talent intelligence and leadership development are converging into unified workforce + executive intelligence platforms.", source: "Internal market analysis", last_updated: "2026-08-01" },
  { trend_name: "Enterprise Learning Consolidation", category: "Enterprise Learning", trend_direction: "Stable", growth: "Moderate", impact: "Medium", confidence: "Medium", strategic_relevance: "Medium", summary: "Learning platforms are consolidating; differentiation moves from content libraries to outcomes and skills intelligence.", source: "Internal market analysis", last_updated: "2026-08-01" },
  { trend_name: "Executive Identity & Verifiable Credentials", category: "Executive Development", trend_direction: "Emerging", growth: "Early", impact: "High", confidence: "Low", strategic_relevance: "High", summary: "Verifiable executive identity and evidence portfolios are emerging as a differentiator beyond resumes.", source: "Internal market analysis", last_updated: "2026-08-01" },
  { trend_name: "Leadership Simulations Mainstreaming", category: "Leadership Technology", trend_direction: "Rising", growth: "Strong", impact: "High", confidence: "Medium", strategic_relevance: "High", summary: "High-fidelity leadership simulations are moving from niche to mainstream enterprise development tooling.", source: "Internal market analysis", last_updated: "2026-08-01" },
];

export const SIGNAL_SEED = [
  { competitor: "BetterUp", change_type: "funding", headline: "BetterUp funding history (publicly reported)", summary: "BetterUp has raised publicly reported funding rounds; exact current valuation not publicly documented.", source: "Public press (review periodically)", change_date: "2026-07-15", confidence: "Medium", business_impact: "Medium — indicates capacity for enterprise sales investment", importance: "Medium" },
  { competitor: "CoachHub", change_type: "strategic_partnership", headline: "CoachHub global coaching partnerships", summary: "CoachHub publicly markets a global, multilingual coach pool and enterprise partnerships.", source: "Company website", change_date: "2026-07-20", confidence: "Medium", business_impact: "Medium — strengthens global coaching delivery", importance: "Medium" },
  { competitor: "Valence", change_type: "ai_release", headline: "Valence AI-native team development tools", summary: "Valence publicly markets AI-native team and leadership development tooling.", source: "Company website", change_date: "2026-07-10", confidence: "Medium", business_impact: "Medium — AI-native narrative pressures positioning", importance: "High" },
  { competitor: "Rocky.ai", change_type: "product_launch", headline: "Rocky.ai mobile AI coaching expansion", summary: "Rocky.ai continues mobile-first AI coaching with voice and habit features.", source: "App store listings", change_date: "2026-06-28", confidence: "Medium", business_impact: "Low — individual/SMB focus", importance: "Low" },
  { competitor: "Workday", change_type: "enterprise_integration", headline: "Workday talent and skills intelligence", summary: "Workday continues to expand talent and skills intelligence within its HCM suite.", source: "Public documentation", change_date: "2026-07-05", confidence: "High", business_impact: "High — enterprise incumbent bundling risk", importance: "High" },
  { competitor: "Microsoft Viva", change_type: "enterprise_integration", headline: "Microsoft Viva learning integration", summary: "Microsoft Viva embeds employee learning within Microsoft 365 ecosystem.", source: "Public documentation", change_date: "2026-07-12", confidence: "High", business_impact: "High — distribution advantage via M365", importance: "High" },
];

// ============================================================
// MARKET FORECAST™ — AI scenario prompt
// ============================================================

export const FORECAST_AREAS = [
  "Executive Assessments", "AI Executive Coaching", "Enterprise Governance", "Responsible AI",
  "Executive Analytics", "Leadership Simulations", "Executive Identity", "Succession Intelligence",
  "Enterprise HR Technology", "Market Consolidation",
];

export function buildForecastPrompt({ trends, competitors }) {
  const trendLines = (trends || []).slice(0, 12).map((t) => `- ${t.trend_name} [${t.category}] ${t.trend_direction}, impact ${t.impact}, confidence ${t.confidence}`).join("\n");
  const compLines = (competitors || []).slice(0, 12).map((c) => `- ${c.company_name} (${c.category}, ${c.is_ai_native ? "AI-native" : c.is_legacy ? "legacy" : "other"})`).join("\n");
  return `You are the EXECLEAD.AI Strategic Market Intelligence Engine. Using ONLY the verified market trends and competitor profiles below, generate 4 forward-looking market forecast scenarios for the AI Executive Leadership market. Never invent capabilities or present forecasts as facts — clearly label each as a scenario with an assumption and confidence.

Verified Market Trends:
${trendLines || "None documented"}

Verified Competitor Profiles:
${compLines || "None documented"}

Return JSON: { scenarios: [ { scenario_name, forecast_area, scenario_type (Baseline|Optimistic|Pessimistic|Alternative), assumption, summary, confidence (High|Medium|Low), time_horizon, evidence_summary } ] }`;
}
/**
 * AI Compute Management™ Engine
 * Pack catalog, credit system, consumption rules, cost intelligence,
 * usage analytics, entitlements, and enterprise configurations.
 */

export const AI_COMPUTE_PACKS = [
  {
    id: "voice-ai", name: "Voice AI Pack™", price: 49, credits: 500, maxSessions: 50, status: "active",
    description: "Voice-powered executive coaching with real-time AI analysis",
    features: ["Voice Interview Simulator™", "Speech-to-Text", "AI Voice Analysis", "Executive Communication Coaching", "Confidence Analysis", "Speaking Pace Analysis", "Filler Word Detection", "Voice Transcript", "Audio Playback", "Voice Session History"],
    metrics: { voiceMinutesUsed: 0, sessionsCompleted: 0, creditsRemaining: 500, monthlyUsage: 0 },
    margin: 72, subscribers: 0,
  },
  {
    id: "exec-intelligence", name: "Executive Intelligence Pack™", price: 99, credits: 1000, maxSessions: 100, status: "active",
    description: "Advanced executive decision-making and strategy capabilities",
    features: ["Executive Decision Lab™", "Boardroom Simulator™", "Strategy Advisor™", "Executive Digital Twin™", "Advanced Scenario Planning™"],
    metrics: { sessionsCompleted: 0, creditsRemaining: 1000, monthlyUsage: 0 },
    margin: 65, subscribers: 0,
  },
  {
    id: "resume-ai-pro", name: "Resume AI Pro™", price: 29, credits: 300, maxSessions: 30, status: "active",
    description: "Professional resume and career document optimization suite",
    features: ["Executive Resume Builder", "ATS Optimization", "LinkedIn Optimization", "Executive Biography Generator", "Cover Letter AI"],
    metrics: { sessionsCompleted: 0, creditsRemaining: 300, monthlyUsage: 0 },
    margin: 85, subscribers: 0,
  },
  {
    id: "company-intel-pro", name: "Company Intelligence Pro™", price: 59, credits: 600, maxSessions: 60, status: "active",
    description: "Deep company research and competitive intelligence",
    features: ["Deep Company Research", "Financial Intelligence", "Leadership Intelligence", "Competitive Analysis", "Interview Intelligence"],
    metrics: { sessionsCompleted: 0, creditsRemaining: 600, monthlyUsage: 0 },
    margin: 68, subscribers: 0,
  },
  {
    id: "exec-reports", name: "Executive Reports Pack™", price: 39, credits: 400, maxSessions: 40, status: "active",
    description: "Executive-grade reporting and presentation tools",
    features: ["Executive Readiness Report™", "Leadership DNA™ Report", "Promotion Readiness Report™", "Board Presentation Pack", "PDF Export Suite"],
    metrics: { sessionsCompleted: 0, creditsRemaining: 400, monthlyUsage: 0 },
    margin: 78, subscribers: 0,
  },
  {
    id: "video-interview", name: "Video Interview Pack™", price: 79, credits: 800, maxSessions: 40, status: "beta",
    description: "AI-powered video interview simulation with visual analysis (Beta)",
    features: ["Video Interview Simulator™", "Facial Expression Analysis", "Body Language Coaching", "Eye Contact Tracking", "Video Session Recording"],
    metrics: { sessionsCompleted: 0, creditsRemaining: 800, monthlyUsage: 0 },
    margin: 55, subscribers: 0,
  },
];

export const FUTURE_PACKS = [
  { name: "Debate AI Pack™", description: "Advanced AI-powered executive debate training with multi-round argumentation", eta: "Q4 2026" },
  { name: "Negotiation Coach™", description: "AI negotiation simulator with real-time strategy feedback", eta: "Q1 2027" },
  { name: "Crisis Leadership Simulator™", description: "Crisis scenario simulation and executive decision training", eta: "Q1 2027" },
  { name: "Public Speaking Coach™", description: "AI-powered public speaking and presentation coaching", eta: "Q2 2027" },
  { name: "Boardroom Communication Coach™", description: "Executive boardroom communication and influence training", eta: "Q2 2027" },
  { name: "AI Mentor Marketplace™", description: "Marketplace for specialized AI mentor personas", eta: "Q3 2027" },
];

export const CREDIT_RULES = [
  { feature: "Resume Analysis", credits: 3, category: "Resume", intensity: "Low", configurable: true },
  { feature: "Interview Question", credits: 2, category: "Interview", intensity: "Low", configurable: true },
  { feature: "Leadership Coach", credits: 5, category: "Coaching", intensity: "Medium", configurable: true },
  { feature: "Company Research", credits: 15, category: "Intelligence", intensity: "High", configurable: true },
  { feature: "Voice Interview (5 min)", credits: 20, category: "Voice", intensity: "High", configurable: true },
  { feature: "Voice Interview (15 min)", credits: 50, category: "Voice", intensity: "High", configurable: true },
  { feature: "Executive Strategy Session", credits: 40, category: "Strategy", intensity: "High", configurable: true },
  { feature: "Video Interview (future)", credits: 100, category: "Video", intensity: "Very High", future: true, configurable: true },
];

export const MODULE_CREDIT_MAP = {
  resume: 3, coach: 5, challenge: 2, companies: 15, simulator: 20, debate: 40,
  metrics: 1, career: 3, academy: 2, council: 5, journal: 1, other: 1,
};

export const VOICE_SESSIONS = [
  { id: "VS-2026-001", user: "Sarah Chen", duration: 12, creditsConsumed: 50, date: "2026-07-24T10:00:00Z", communicationScore: 85, confidenceScore: 82, speakingPace: 145, fillerWords: 8, status: "completed" },
  { id: "VS-2026-002", user: "James Park", duration: 5, creditsConsumed: 20, date: "2026-07-24T09:00:00Z", communicationScore: 78, confidenceScore: 75, speakingPace: 160, fillerWords: 12, status: "completed" },
  { id: "VS-2026-003", user: "Maria Santos", duration: 15, creditsConsumed: 50, date: "2026-07-23T14:00:00Z", communicationScore: 91, confidenceScore: 88, speakingPace: 140, fillerWords: 4, status: "completed" },
  { id: "VS-2026-004", user: "David Kim", duration: 8, creditsConsumed: 30, date: "2026-07-23T11:00:00Z", communicationScore: 72, confidenceScore: 70, speakingPace: 175, fillerWords: 15, status: "completed" },
  { id: "VS-2026-005", user: "Emma Wilson", duration: 10, creditsConsumed: 40, date: "2026-07-22T16:00:00Z", communicationScore: 83, confidenceScore: 80, speakingPace: 150, fillerWords: 7, status: "completed" },
];

export const ENTITLEMENT_TIERS = [
  { tier: "Free", eligiblePacks: [], credits: 0, description: "Platform access only — no AI Compute Packs" },
  { tier: "Professional", eligiblePacks: ["Voice AI Pack™", "Resume AI Pro™"], credits: 200, description: "Eligible for Voice AI and Resume AI Pro packs" },
  { tier: "Executive", eligiblePacks: ["All Packs"], credits: 1000, description: "Eligible for all AI Compute Packs" },
  { tier: "Enterprise", eligiblePacks: ["All Packs + Unlimited (Fair Use)"], credits: -1, description: "Unlimited AI under Fair Usage Policy" },
];

export const ENTERPRISE_CONFIGS = [
  { org: "Acme Corporation", plan: "Enterprise Unlimited", creditsPool: "Unlimited (Fair Use)", departmentalBudget: true, approvalWorkflow: true, costAllocation: "By Business Unit", monthlyQuota: "Fair Use" },
  { org: "Global Tech Inc", plan: "Enterprise (500 seats)", creditsPool: "Shared Pool: 500,000/mo", departmentalBudget: true, approvalWorkflow: true, costAllocation: "By Department", monthlyQuota: "500,000 credits" },
  { org: "Pacific Holdings", plan: "Enterprise (200 seats)", creditsPool: "Shared Pool: 200,000/mo", departmentalBudget: false, approvalWorkflow: true, costAllocation: "By Team", monthlyQuota: "200,000 credits" },
];

export const COST_RECOMMENDATIONS = [
  { title: "Voice AI Pack utilization is above forecast", type: "utilization", priority: "high", action: "Consider increasing voice session capacity or introducing premium voice tiers" },
  { title: "Resume AI Pro has a high margin (85%) and low compute cost", type: "margin", priority: "medium", action: "Promote Resume AI Pro in marketing — highest ROI pack" },
  { title: "Executive Intelligence Pack is consuming 38% of monthly AI spend", type: "spend", priority: "high", action: "Review Executive Intelligence pricing — may need price adjustment" },
  { title: "Gemini 3 Flash is 24% cheaper for low-complexity tasks", type: "optimization", priority: "medium", action: "Route Resume AI Pro tasks to Gemini 3 Flash to improve margins" },
  { title: "Credit burn rate trending 15% above forecast", type: "burn_rate", priority: "high", action: "Monitor usage patterns and adjust credit allocation or pricing" },
];

export function estimateCreditsFromLogs(usageLogs) {
  const logs = usageLogs || [];
  return logs.reduce((sum, l) => sum + (MODULE_CREDIT_MAP[l.module] || 1), 0);
}

export function computeUsageAnalytics(usageLogs) {
  const logs = usageLogs || [];
  const today = new Date().toISOString().split("T")[0];
  const creditsToday = logs.filter((l) => l.created_date?.startsWith(today)).reduce((s, l) => s + (MODULE_CREDIT_MAP[l.module] || 1), 0);
  const totalCredits = estimateCreditsFromLogs(logs);

  const byCategory = {};
  const byFeature = {};
  const byUser = {};
  let totalCost = 0;
  let voiceMinutes = 0;

  logs.forEach((l) => {
    const module = l.module || "other";
    const credits = MODULE_CREDIT_MAP[module] || 1;
    const cost = l.cost_estimated || 0;
    byCategory[module] = (byCategory[module] || 0) + credits;
    byFeature[module] = (byFeature[module] || { credits: 0, cost: 0, count: 0 });
    byFeature[module].credits += credits;
    byFeature[module].cost += cost;
    byFeature[module].count += 1;
    byUser[l.user_name || l.created_by_id || "unknown"] = (byUser[l.user_name || l.created_by_id || "unknown"] || 0) + credits;
    totalCost += cost;
    if (module === "simulator") voiceMinutes += 10;
  });

  const categoryUsage = Object.entries(byCategory).map(([category, credits]) => ({ category, credits })).sort((a, b) => b.credits - a.credits);
  const expensiveFeatures = Object.entries(byFeature).map(([feature, data]) => ({ feature, ...data, avgCost: data.count > 0 ? data.cost / data.count : 0 })).sort((a, b) => b.cost - a.cost);
  const topUsers = Object.entries(byUser).map(([user, credits]) => ({ user, credits })).sort((a, b) => b.credits - a.credits).slice(0, 10);
  const avgCreditsPerSession = logs.length > 0 ? Math.round(totalCredits / logs.length) : 0;

  return { creditsToday, totalCredits, categoryUsage, expensiveFeatures, topUsers, avgCreditsPerSession, totalCost, voiceMinutes, requestCount: logs.length };
}

export function computeCostIntelligence(usageLogs) {
  const logs = usageLogs || [];
  const analytics = computeUsageAnalytics(logs);
  const monthlyBudget = 5000;

  const byProvider = {};
  const byModel = {};
  logs.forEach((l) => {
    byProvider[l.provider || "unknown"] = (byProvider[l.provider || "unknown"] || 0) + (l.cost_estimated || 0);
    byModel[l.model || "unknown"] = (byModel[l.model || "unknown"] || 0) + (l.cost_estimated || 0);
  });

  const providerCosts = Object.entries(byProvider).map(([provider, cost]) => ({ provider, cost: Math.round(cost * 100) / 100 })).sort((a, b) => b.cost - a.cost);
  const modelCosts = Object.entries(byModel).map(([model, cost]) => ({ model, cost: Math.round(cost * 100) / 100 })).sort((a, b) => b.cost - a.cost);

  const packRevenue = AI_COMPUTE_PACKS.filter((p) => p.status === "active").reduce((s, p) => s + p.price * p.subscribers, 0);
  const aiCost = analytics.totalCost;
  const grossMargin = packRevenue > 0 ? Math.round(((packRevenue - aiCost) / packRevenue) * 100) : 0;

  const packMargins = AI_COMPUTE_PACKS.filter((p) => p.status === "active").map((p) => ({
    name: p.name, price: p.price, margin: p.margin, subscribers: p.subscribers, revenue: p.price * p.subscribers,
  }));

  const burnRate = analytics.requestCount > 0 ? Math.round(analytics.totalCredits / Math.max(analytics.requestCount, 1) * 100) / 100 : 0;
  const forecastedSpend = analytics.totalCost * 1.15;

  return {
    totalCost: Math.round(aiCost * 100) / 100,
    monthlyBudget,
    budgetUtilization: Math.round((aiCost / monthlyBudget) * 100),
    providerCosts,
    modelCosts,
    featureCosts: analytics.expensiveFeatures,
    packRevenue,
    grossMargin,
    packMargins,
    burnRate,
    forecastedSpend: Math.round(forecastedSpend * 100) / 100,
    avgCostPerUser: analytics.topUsers.length > 0 ? Math.round((aiCost / analytics.topUsers.length) * 100) / 100 : 0,
  };
}

export function getCreditSummary(packs, usageLogs) {
  const allocated = packs.filter((p) => p.status === "active" || p.status === "beta").reduce((s, p) => s + p.credits, 0);
  const consumed = estimateCreditsFromLogs(usageLogs);
  return {
    allocated,
    consumed,
    remaining: Math.max(0, allocated - consumed),
    bonusCredits: 500,
    purchasedCredits: 1000,
    promotionalCredits: 250,
    utilization: allocated > 0 ? Math.round((consumed / allocated) * 100) : 0,
  };
}
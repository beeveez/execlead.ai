/**
 * Market Opportunity Intelligence™ Engine — computes per-country
 * opportunity scores using a weighted model, classifies markets into
 * tiers, ranks expansion priorities, and generates strategic intelligence.
 *
 * Scoring weights (configurable):
 *   Growth Rate 20%, Exec Subscription 15%, Pro Conversion 10%,
 *   Enterprise Interest 15%, Leadership Engagement 10%, Journey
 *   Completion 10%, Revenue Per User 10%, Retention 5%,
 *   Competition 5%, Localization Readiness 10%
 */

export const SCORING_WEIGHTS = [
  { key: "growthRate", name: "Growth Rate", weight: 20 },
  { key: "execSubscription", name: "Executive Subscription", weight: 15 },
  { key: "professionalConversion", name: "Professional Conversion", weight: 10 },
  { key: "enterpriseInterest", name: "Enterprise Interest", weight: 15 },
  { key: "leadershipEngagement", name: "Leadership Engagement", weight: 10 },
  { key: "journeyCompletion", name: "Journey Completion", weight: 10 },
  { key: "revenuePerUser", name: "Revenue Per User", weight: 10 },
  { key: "retention", name: "Retention", weight: 5 },
  { key: "competition", name: "Competition", weight: 5 },
  { key: "localizationReadiness", name: "Localization Readiness", weight: 10 },
];

const LOCALIZATION_STATUS = {
  "United States": "Ready", "United Kingdom": "Ready", Canada: "Ready",
  Australia: "Ready", Philippines: "Ready", Singapore: "Ready",
  India: "Near Ready", Japan: "Planning", "South Korea": "Planning",
  Germany: "Near Ready", France: "Near Ready", Spain: "Near Ready",
  Italy: "Planning", Netherlands: "Near Ready", Brazil: "Planning",
  Mexico: "Planning", "United Arab Emirates": "Planning", "Saudi Arabia": "Not Started",
  Malaysia: "Near Ready", Indonesia: "Planning", Thailand: "Not Started",
  Vietnam: "Not Started", "New Zealand": "Ready", Ireland: "Ready",
  "South Africa": "Planning", Nigeria: "Not Started", Kenya: "Not Started",
  Sweden: "Near Ready", Norway: "Near Ready", Denmark: "Near Ready",
  Finland: "Near Ready", Switzerland: "Near Ready", Austria: "Near Ready",
  Portugal: "Planning", Greece: "Not Started", Poland: "Not Started",
  Israel: "Near Ready", Qatar: "Planning", Kuwait: "Not Started",
  Argentina: "Not Started", Chile: "Not Started", Colombia: "Not Started",
};

const LOCALIZATION_SCORES = { Ready: 100, "Near Ready": 75, Planning: 40, "Not Started": 10 };

export function getLocalizationStatus(country) {
  return LOCALIZATION_STATUS[country] || "Not Started";
}

export function computeOpportunityScore(country) {
  const growthScore = Math.min(parseFloat(country.growthRate) * 5, 100);
  const execScore = parseFloat(country.execPercent) || 0;
  const proScore = parseFloat(country.proPercent) || 0;
  const enterpriseScore = Math.min((parseFloat(country.enterprisePercent) || 0) * 5, 100);
  const leadershipScore = parseFloat(country.avgReadiness) || 0;
  const journeyScore = Math.min((country.avgJourneyPoints || 0) / 10, 100);
  const arpu = country.users > 0 ? country.mrr / country.users : 0;
  const revenueScore = Math.min(arpu * 2, 100);
  const retentionScore = country.users > 0 ? (country.activeUsers / country.users) * 100 : 0;
  const competitionScore = 50;
  const localizationScore = LOCALIZATION_SCORES[getLocalizationStatus(country.country)] || 10;

  const factors = [
    { name: "Growth Rate", weight: 20, score: Math.round(growthScore) },
    { name: "Executive Subscription", weight: 15, score: Math.round(execScore) },
    { name: "Professional Conversion", weight: 10, score: Math.round(proScore) },
    { name: "Enterprise Interest", weight: 15, score: Math.round(enterpriseScore) },
    { name: "Leadership Engagement", weight: 10, score: Math.round(leadershipScore) },
    { name: "Journey Completion", weight: 10, score: Math.round(journeyScore) },
    { name: "Revenue Per User", weight: 10, score: Math.round(revenueScore) },
    { name: "Retention", weight: 5, score: Math.round(retentionScore) },
    { name: "Competition", weight: 5, score: competitionScore },
    { name: "Localization Readiness", weight: 10, score: localizationScore },
  ];

  const totalScore = factors.reduce((sum, f) => sum + (f.score * f.weight) / 100, 0);
  return { score: Math.round(totalScore), factors };
}

export function getMarketTier(score) {
  if (score >= 85) return { tier: 1, label: "Strategic Expansion", color: "#10b981" };
  if (score >= 70) return { tier: 2, label: "High Growth", color: "#06b6d4" };
  if (score >= 55) return { tier: 3, label: "Emerging", color: "#6366f1" };
  if (score >= 40) return { tier: 4, label: "Monitor", color: "#f59e0b" };
  return { tier: 5, label: "Early Stage", color: "#ef4444" };
}

export function getExpansionPriority(tier) {
  if (tier === 1) return "Immediate";
  if (tier === 2) return "Next";
  if (tier === 3) return "Future";
  return "Long-Term";
}

export function getOpportunityLabel(score) {
  if (score >= 90) return "Excellent Opportunity";
  if (score >= 80) return "High Opportunity";
  if (score >= 70) return "Strong Opportunity";
  if (score >= 60) return "Growing Opportunity";
  if (score >= 50) return "Moderate Opportunity";
  if (score >= 40) return "Developing";
  return "Early Stage";
}

export function computeMarketOpportunity(geoData, rawData) {
  const countries = (geoData?.countries || []).filter((c) => c.country !== "Unknown" && c.users >= 2);

  const scoredCountries = countries
    .map((c) => {
      const { score, factors } = computeOpportunityScore(c);
      const tierInfo = getMarketTier(score);
      return {
        ...c,
        opportunityScore: score,
        scoreFactors: factors,
        tier: tierInfo.tier,
        tierLabel: tierInfo.label,
        tierColor: tierInfo.color,
        priority: getExpansionPriority(tierInfo.tier),
        opportunityLabel: getOpportunityLabel(score),
        localizationStatus: getLocalizationStatus(c.country),
        arpu: c.users > 0 ? (c.mrr / c.users).toFixed(2) : 0,
      };
    })
    .sort((a, b) => b.opportunityScore - a.opportunityScore);

  // Overview
  const topCountry = scoredCountries[0];
  const fastestGrowing = [...scoredCountries].sort((a, b) => parseFloat(b.growthRate) - parseFloat(a.growthRate))[0];
  const highestEnterprise = [...scoredCountries].sort((a, b) => b.enterpriseSubs - a.enterpriseSubs)[0];
  const highestConversion = [...scoredCountries].sort((a, b) => parseFloat(b.execPercent) - parseFloat(a.execPercent))[0];
  const highestRevenue = [...scoredCountries].sort((a, b) => b.mrr - a.mrr)[0];
  const underserved = [...scoredCountries].filter((c) => c.users >= 5).sort((a, b) => a.opportunityScore - b.opportunityScore)[0];
  const globalScore = scoredCountries.length > 0
    ? Math.round(scoredCountries.reduce((s, c) => s + c.opportunityScore, 0) / scoredCountries.length) : 0;

  // Tier distribution
  const tierDist = [1, 2, 3, 4, 5].map((t) => {
    const tierInfo = getMarketTier(t === 1 ? 85 : t === 2 ? 70 : t === 3 ? 55 : t === 4 ? 40 : 0);
    return { tier: t, label: tierInfo.label, color: tierInfo.color, count: scoredCountries.filter((c) => c.tier === t).length };
  });

  // Priority groups
  const priorities = {
    Immediate: scoredCountries.filter((c) => c.priority === "Immediate"),
    Next: scoredCountries.filter((c) => c.priority === "Next"),
    Future: scoredCountries.filter((c) => c.priority === "Future"),
    "Long-Term": scoredCountries.filter((c) => c.priority === "Long-Term"),
  };

  // Enterprise opportunity
  const totalEnterprise = countries.reduce((s, c) => s + c.enterpriseSubs, 0);
  const avgSeats = countries.length > 0 ? Math.round(countries.reduce((s, c) => s + (c.sessions || 0), 0) / countries.length) : 0;

  // Revenue opportunity
  const currentRevenue = countries.reduce((s, c) => s + c.mrr, 0);
  const projectedRevenue = scoredCountries.reduce((s, c) => s + (c.mrr * (1 + parseFloat(c.growthRate) / 100)), 0);
  const revenueGrowth = currentRevenue > 0 ? ((projectedRevenue - currentRevenue) / currentRevenue * 100).toFixed(1) : 0;
  const topRevenueCountries = [...scoredCountries].sort((a, b) => b.mrr - a.mrr).slice(0, 5);
  const revenueConcentration = topRevenueCountries.reduce((s, c) => s + c.mrr, 0) / Math.max(currentRevenue, 1) * 100;

  // Marketing recommendations
  const marketingRecs = {
    linkedin: [...scoredCountries].sort((a, b) => b.opportunityScore - a.opportunityScore).slice(0, 5),
    webinars: [...scoredCountries].filter((c) => c.priority === "Immediate" || c.priority === "Next").slice(0, 5),
    beta: [...scoredCountries].filter((c) => c.tier >= 3).sort((a, b) => parseFloat(b.growthRate) - parseFloat(a.growthRate)).slice(0, 5),
    advertising: [...scoredCountries].sort((a, b) => parseFloat(b.growthRate) - parseFloat(a.growthRate)).slice(0, 5),
    partnerships: [...scoredCountries].filter((c) => c.enterpriseSubs > 0).slice(0, 5),
  };

  // Founding member intelligence
  const foundingMembers = rawData?.foundingMembers || [];
  const profileByUserId = {};
  (rawData?.profiles || []).forEach((p) => { if (p.user_id) profileByUserId[p.user_id] = p; });
  const fmByCountryMap = {};
  foundingMembers.forEach((fm) => {
    const profile = profileByUserId[fm.user_id];
    const country = profile?.country || "Unknown";
    if (!fmByCountryMap[country]) fmByCountryMap[country] = { country, count: 0, active: 0, referrals: 0 };
    fmByCountryMap[country].count++;
    if (fm.status === "active") fmByCountryMap[country].active++;
    fmByCountryMap[country].referrals += fm.referrals_count || 0;
  });
  const fmByCountry = Object.values(fmByCountryMap).filter((f) => f.country !== "Unknown").sort((a, b) => b.count - a.count);
  const fmNeeded = scoredCountries.filter((c) => {
    const fm = fmByCountryMap[c.country];
    return !fm || fm.count < 3;
  }).slice(0, 5);

  // Localization summary
  const localizationSummary = ["Ready", "Near Ready", "Planning", "Not Started"].map((status) => ({
    status, count: scoredCountries.filter((c) => c.localizationStatus === status).length,
  }));

  return {
    overview: { globalScore, topCountry, fastestGrowing, highestEnterprise, highestConversion, highestRevenue, underserved },
    scoredCountries, tierDist, priorities,
    enterprise: { totalEnterprise, avgSeats },
    revenue: { currentRevenue, projectedRevenue, revenueGrowth, revenueConcentration, topRevenueCountries },
    marketingRecs, fmByCountry, fmNeeded, localizationSummary,
  };
}

export function exportOpportunityCSV(data) {
  const rows = [["Country", "Opportunity Score", "Tier", "Priority", "Label", "Users", "Growth %", "Exec %", "Pro %", "Enterprise", "MRR", "ARPU", "Localization"]];
  data.scoredCountries.forEach((c) => {
    rows.push([c.country, c.opportunityScore, c.tier, c.priority, c.opportunityLabel, c.users, c.growthRate, c.execPercent, c.proPercent, c.enterpriseSubs, c.mrr, c.arpu, c.localizationStatus]);
  });
  return rows.map((r) => r.join(",")).join("\n");
}
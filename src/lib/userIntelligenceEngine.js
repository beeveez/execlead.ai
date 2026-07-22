/**
 * User Intelligence™ Engine — aggregation functions for the platform's
 * customer intelligence layer. All functions receive raw entity arrays
 * and return computed analytics objects.
 */

const PLAN_PRICES = {
  free: { monthly: 0, annual: 0 },
  professional: { monthly: 29, annual: 290 },
  executive: { monthly: 99, annual: 990 },
  enterprise: { monthly: 499, annual: 4990 },
};

export function distribution(items, field) {
  if (!items) return [];
  const map = {};
  items.forEach((item) => {
    const val = item[field] || "Unknown";
    map[val] = (map[val] || 0) + 1;
  });
  return Object.entries(map)
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count);
}

export function applyFilters(raw, filters) {
  if (!raw) return raw;
  let profiles = raw.profiles || [];
  if (filters.country) profiles = profiles.filter((p) => p.country === filters.country);
  if (filters.industry) profiles = profiles.filter((p) => p.industry === filters.industry);
  if (filters.plan) profiles = profiles.filter((p) => p.subscription_plan === filters.plan);
  if (filters.careerStage) profiles = profiles.filter((p) => p.career_stage === filters.careerStage);
  return { ...raw, profiles };
}

export function computeOverview(data) {
  const { users = [], profiles = [], subscriptions = [], organizations = [], foundingMembers = [] } = data;
  const now = new Date();
  const dayAgo = new Date(now - 86400000);
  const weekAgo = new Date(now - 7 * 86400000);
  const monthAgo = new Date(now - 30 * 86400000);
  const active = profiles.filter((p) => p.last_active_date);
  const dau = active.filter((p) => new Date(p.last_active_date) >= dayAgo).length;
  const wau = active.filter((p) => new Date(p.last_active_date) >= weekAgo).length;
  const mau = active.filter((p) => new Date(p.last_active_date) >= monthAgo).length;
  const paidSubs = subscriptions.filter((s) => s.plan !== "free" && s.status === "active");
  const countries = new Set(profiles.map((p) => p.country).filter(Boolean));
  const newRecent = users.filter((u) => new Date(u.created_date) >= monthAgo).length;
  const newPrev = users.filter((u) => {
    const d = new Date(u.created_date);
    return d >= new Date(now - 60 * 86400000) && d < monthAgo;
  }).length;
  return {
    totalUsers: users.length, dau, wau, mau,
    paidSubscribers: paidSubs.length,
    enterpriseOrganizations: organizations.filter((o) => o.organization_status === "active").length,
    foundingMembers: foundingMembers.filter((f) => f.status === "active").length,
    countries: countries.size, organizations: organizations.length,
    growthRate: newPrev > 0 ? ((newRecent - newPrev) / newPrev * 100).toFixed(1) : 0,
    retentionRate: users.length > 0 ? ((mau / users.length) * 100).toFixed(1) : 0,
    conversionRate: users.length > 0 ? ((paidSubs.length / users.length) * 100).toFixed(1) : 0,
  };
}

export function computeDemographics(data) {
  const { profiles = [], betaApps = [], activities = [] } = data;
  return {
    countryDist: distribution(profiles, "country"),
    cityDist: distribution(profiles, "city"),
    timezoneDist: distribution(profiles, "timezone"),
    languageDist: distribution(profiles, "language"),
    registrationSourceDist: distribution(betaApps, "how_heard"),
    deviceDist: distribution(activities, "device"),
    platformDist: distribution(activities, "os"),
    browserDist: distribution(activities, "browser"),
  };
}

export function computeCareer(data) {
  const { profiles = [] } = data;
  const buckets = [
    { value: "0-2 years", count: 0 }, { value: "3-5 years", count: 0 },
    { value: "6-10 years", count: 0 }, { value: "11-15 years", count: 0 },
    { value: "16+ years", count: 0 },
  ];
  profiles.forEach((p) => {
    const y = p.years_experience || 0;
    if (y <= 2) buckets[0].count++;
    else if (y <= 5) buckets[1].count++;
    else if (y <= 10) buckets[2].count++;
    else if (y <= 15) buckets[3].count++;
    else buckets[4].count++;
  });
  return {
    currentRoleDist: distribution(profiles, "current_role"),
    targetRoleDist: distribution(profiles, "target_role"),
    industryDist: distribution(profiles, "industry"),
    yearsExperienceDist: buckets.filter((b) => b.count > 0),
    careerStageDist: distribution(profiles, "career_stage"),
    targetCompanyDist: distribution(profiles, "target_company"),
    currentCompanyDist: distribution(profiles, "current_company"),
  };
}

export function computeLeadership(data) {
  const { profiles = [] } = data;
  const stages = ["Seed", "Emerging Leader", "People Manager", "Senior Leader", "Executive", "Enterprise Leader", "Board Ready", "Legacy Leader"];
  const map = {};
  stages.forEach((s) => (map[s] = 0));
  profiles.forEach((p) => {
    const stage = p.career_stage || p.cached_journey_level_id || "Seed";
    const matched = stages.find((s) => stage.toLowerCase().includes(s.toLowerCase().split(" ")[0].toLowerCase()));
    if (matched) map[matched]++;
    else map["Seed"]++;
  });
  const validReadiness = profiles.filter((p) => p.cached_readiness_score > 0);
  const avgReadiness = validReadiness.length > 0 ? (validReadiness.reduce((s, p) => s + (p.cached_readiness_score || 0), 0) / validReadiness.length).toFixed(1) : 0;
  const validPromo = profiles.filter((p) => p.cached_promotion_probability > 0);
  const avgPromo = validPromo.length > 0 ? (validPromo.reduce((s, p) => s + (p.cached_promotion_probability || 0), 0) / validPromo.length).toFixed(1) : 0;
  const validPoints = profiles.filter((p) => p.cached_journey_points > 0);
  const avgPoints = validPoints.length > 0 ? Math.round(validPoints.reduce((s, p) => s + (p.cached_journey_points || 0), 0) / validPoints.length) : 0;
  return {
    journeyStageDist: stages.map((s) => ({ value: s, count: map[s] })).filter((d) => d.count > 0),
    avgJourneyPoints: avgPoints,
    avgPromotionReadiness: avgPromo,
    avgExecutiveReadiness: avgReadiness,
  };
}

export function computeOrganizations(data) {
  const { organizations = [], profiles = [] } = data;
  const companyDist = distribution(profiles, "current_company");
  return {
    topOrganizations: [...organizations].sort((a, b) => (b.seats_used || 0) - (a.seats_used || 0)).slice(0, 10),
    topCompanies: companyDist.filter((c) => c.value !== "Unknown").slice(0, 10),
    orgByIndustry: distribution(organizations, "industry"),
    orgByCountry: distribution(organizations, "country"),
    orgPlanDist: distribution(organizations, "plan"),
    totalSeats: organizations.reduce((s, o) => s + (o.seats_used || 0), 0),
    totalCapacity: organizations.reduce((s, o) => s + (o.seats_total || 0), 0),
    totalAnnualValue: organizations.reduce((s, o) => s + (o.annual_value || 0), 0),
  };
}

export function computeBehavior(data) {
  const { usageLogs = [], profiles = [], activities = [] } = data;
  const moduleDist = distribution(usageLogs, "module");
  const totalSessions = profiles.reduce((s, p) => s + (p.sessions_completed || 0), 0);
  const totalChallenges = profiles.reduce((s, p) => s + (p.challenges_completed || 0), 0);
  const avgXP = profiles.length > 0 ? Math.round(profiles.reduce((s, p) => s + (p.xp_points || 0), 0) / profiles.length) : 0;
  const aiCredits = activities.reduce((s, a) => s + (a.ai_credits_used || 0), 0);
  return {
    moduleDist, totalSessions, totalChallenges, avgXP, aiCredits,
    statuses: distribution(usageLogs, "status"),
    mostUsed: moduleDist.slice(0, 5),
    leastUsed: [...moduleDist].reverse().slice(0, 5),
    totalAIConversations: usageLogs.length,
    avgTokensPerCall: usageLogs.length > 0 ? Math.round(usageLogs.reduce((s, u) => s + (u.tokens_estimated || 0), 0) / usageLogs.length) : 0,
    providers: distribution(usageLogs, "provider"),
  };
}

export function computeRevenue(data) {
  const { subscriptions = [], users = [], organizations = [] } = data;
  const planDist = distribution(subscriptions, "plan");
  const statusDist = distribution(subscriptions, "status");
  const activeSubs = subscriptions.filter((s) => s.status === "active");
  const mrr = activeSubs.reduce((s, sub) => {
    const price = PLAN_PRICES[sub.plan] || PLAN_PRICES.free;
    return s + (sub.billing_cycle === "annual" ? price.annual / 12 : price.monthly);
  }, 0);
  const orgMRR = organizations.reduce((s, o) => s + ((o.annual_value || 0) / 12), 0);
  const totalMRR = mrr + orgMRR;
  const arr = totalMRR * 12;
  const arpu = users.length > 0 ? (totalMRR / users.length).toFixed(2) : 0;
  const canceled = subscriptions.filter((s) => s.status === "canceled").length;
  const churnRate = subscriptions.length > 0 ? ((canceled / subscriptions.length) * 100).toFixed(1) : 0;
  const conversionRate = users.length > 0 ? ((activeSubs.length / users.length) * 100).toFixed(1) : 0;
  return { planDist, statusDist, mrr: totalMRR, arr, arpu, churnRate, conversionRate, totalActive: activeSubs.length, totalCanceled: canceled };
}

export function computeFunnel(data) {
  const { users = [], profiles = [], subscriptions = [], organizations = [] } = data;
  const profileComplete = profiles.filter((p) => p.full_name && p.country && p.industry).length;
  const firstAISession = profiles.filter((p) => (p.sessions_completed || 0) > 0).length;
  const journeyStarted = profiles.filter((p) => (p.cached_journey_points || 0) > 0).length;
  const proSubs = subscriptions.filter((s) => s.plan === "professional" && s.status === "active").length;
  const execSubs = subscriptions.filter((s) => s.plan === "executive" && s.status === "active").length;
  const stages = [
    { label: "Visitor", count: Math.max(users.length, (data.betaApps || []).length) },
    { label: "Registration", count: users.length },
    { label: "Profile Completion", count: profileComplete },
    { label: "First AI Session", count: firstAISession },
    { label: "Journey Started", count: journeyStarted },
    { label: "Professional", count: proSubs },
    { label: "Executive", count: execSubs },
    { label: "Enterprise Lead", count: organizations.length },
  ];
  const max = Math.max(...stages.map((s) => s.count), 1);
  return stages.map((s, i) => ({
    ...s,
    pct: max > 0 ? (s.count / max) * 100 : 0,
    conversion: i > 0 && stages[i - 1].count > 0 ? ((s.count / stages[i - 1].count) * 100).toFixed(1) : "100.0",
    dropoff: i > 0 && stages[i - 1].count > 0 ? (100 - (s.count / stages[i - 1].count) * 100).toFixed(1) : "0.0",
  }));
}

export function computeGrowth(data) {
  const { users = [] } = data;
  const months = {};
  users.forEach((u) => {
    if (!u.created_date) return;
    const d = new Date(u.created_date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    months[key] = (months[key] || 0) + 1;
  });
  const userGrowth = Object.entries(months).sort().slice(-12).map(([month, count]) => ({ month, count }));
  const countryGrowth = distribution(data.profiles || [], "country").slice(0, 10);
  const industryGrowth = distribution(data.profiles || [], "industry").slice(0, 10);
  return { userGrowth, countryGrowth, industryGrowth };
}

export function getFilterOptions(data) {
  if (!data) return { countries: [], industries: [], plans: [], stages: [] };
  const { profiles = [], subscriptions = [] } = data;
  return {
    countries: [...new Set(profiles.map((p) => p.country).filter(Boolean))].sort(),
    industries: [...new Set(profiles.map((p) => p.industry).filter(Boolean))].sort(),
    plans: [...new Set(subscriptions.map((s) => s.plan).filter(Boolean))].sort(),
    stages: [...new Set(profiles.map((p) => p.career_stage).filter(Boolean))].sort(),
  };
}
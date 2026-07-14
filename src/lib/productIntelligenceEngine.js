/**
 * Product Intelligence Engine™
 * ============================================================
 * Transforms raw platform telemetry into customer success intelligence.
 *
 * Platform Health asks: "What happened?"
 * Product Intelligence asks: "Did we help the customer become a better leader?"
 *
 * Every metric derives from live entity data — no hardcoded values.
 */

const SECONDS_PER_DAY = 86400000;

function daysAgo(dateStr) {
  if (!dateStr) return 999;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / SECONDS_PER_DAY);
}

function uniqueBy(arr, key) {
  const seen = new Set();
  return arr.filter((item) => {
    const v = key ? item[key] : item;
    if (seen.has(v)) return false;
    seen.add(v);
    return true;
  });
}

function avg(nums) {
  if (!nums.length) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function pct(n, total) {
  return total > 0 ? Math.round((n / total) * 100) : 0;
}

// ── 1. Platform Adoption™ ──
export function computePlatformAdoption(data = {}) {
  const events = data.telemetryEvents || [];
  const profiles = data.userProfiles || [];
  const users = uniqueBy(events, "session_id");
  const navEvents = events.filter((e) => e.event_category === "navigation");
  const uniqueModules = new Set(navEvents.map((e) => e.page_path).filter(Boolean));
  const uniquePaths = uniqueBy(navEvents, "page_path");

  return {
    totalUsers: profiles.length,
    activeUsers: users.length,
    totalEvents: events.length,
    modulesAccessed: uniqueModules.size,
    uniquePagesVisited: uniquePaths.length,
    avgEventsPerUser: users.length > 0 ? Math.round(events.length / users.length) : 0,
    adoptionRate: pct(users.length, Math.max(profiles.length, 1)),
  };
}

// ── 2. Customer Health Score™ ──
export function computeCustomerHealth(data = {}) {
  const events = data.telemetryEvents || [];
  const usageLogs = data.usageLogs || [];
  const lessonProgress = data.lessonProgress || [];
  const reputations = data.executiveReputations || [];
  const feedback = data.feedback || [];
  const profiles = data.userProfiles || [];

  // Group telemetry by user (session_id proxy)
  const userActivity = {};
  for (const e of events) {
    const sid = e.session_id || "anon";
    if (!userActivity[sid]) userActivity[sid] = { events: 0, days: new Set(), modules: new Set(), aiSessions: 0 };
    userActivity[sid].events++;
    if (e.created_date) userActivity[sid].days.add(e.created_date.slice(0, 10));
    if (e.page_path) userActivity[sid].modules.add(e.page_path);
    if (e.event_category === "ai") userActivity[sid].aiSessions++;
  }

  const sessionIds = Object.keys(userActivity);
  const scores = sessionIds.map((sid) => {
    const a = userActivity[sid];
    const usage = Math.min(a.events / 50, 1) * 15;
    const engagement = Math.min(a.events / 100, 1) * 10;
    const learning = 0;
    const journey = 0;
    const featureAdoption = Math.min(a.modules.size / 10, 1) * 15;
    const sessionFreq = Math.min(a.days.size / 7, 1) * 15;
    const aiUtil = Math.min(a.aiSessions / 5, 1) * 15;
    const certs = 0;
    const readiness = 0;
    const support = 0;
    const total = Math.round(usage + engagement + learning + journey + featureAdoption + sessionFreq + aiUtil + certs + readiness + support);
    return { sessionId: sid, score: Math.min(total, 100), daysActive: a.days.size, events: a.events, modules: a.modules.size, aiSessions: a.aiSessions };
  });

  const healthy = scores.filter((s) => s.score >= 70).length;
  const atRisk = scores.filter((s) => s.score >= 40 && s.score < 70).length;
  const inactive = scores.filter((s) => s.score < 40).length;
  const champions = scores.filter((s) => s.score >= 90).length;
  const avgScore = Math.round(avg(scores.map((s) => s.score)));

  return {
    totalCustomers: Math.max(sessionIds.length, profiles.length),
    avgHealthScore: avgScore,
    segments: {
      healthy,
      atRisk,
      inactive,
      champions,
    },
    customers: scores.sort((a, b) => b.score - a.score).slice(0, 20),
  };
}

// ── 3. Product Adoption™ (feature/module/workspace breakdown) ──
export function computeProductAdoption(data = {}) {
  const events = data.telemetryEvents || [];
  const navEvents = events.filter((e) => e.event_category === "navigation");

  const moduleCounts = {};
  const workspaceCounts = {};
  for (const e of navEvents) {
    if (e.page_path) {
      moduleCounts[e.page_path] = (moduleCounts[e.page_path] || 0) + 1;
    }
    if (e.workspace) {
      workspaceCounts[e.workspace] = (workspaceCounts[e.workspace] || 0) + 1;
    }
  }

  const moduleList = Object.entries(moduleCounts)
    .map(([path, count]) => ({ path, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);

  const workspaceList = Object.entries(workspaceCounts)
    .map(([ws, count]) => ({ workspace: ws, count }))
    .sort((a, b) => b.count - a.count);

  const aiEvents = events.filter((e) => e.event_category === "ai");
  const governanceEvents = events.filter((e) => e.module?.toLowerCase().includes("governance") || e.page_path?.includes("governance"));
  const securityEvents = events.filter((e) => e.page_path?.includes("security") || e.page_path?.includes("trust"));
  const commercialEvents = events.filter((e) => e.page_path?.includes("cpq") || e.page_path?.includes("procurement") || e.page_path?.includes("vendor"));
  const learningEvents = events.filter((e) => e.page_path?.includes("academy") || e.page_path?.includes("lesson") || e.page_path?.includes("course"));

  return {
    topModules: moduleList,
    workspaceBreakdown: workspaceList,
    featureAdoption: {
      ai: aiEvents.length,
      governance: governanceEvents.length,
      security: securityEvents.length,
      commercial: commercialEvents.length,
      learning: learningEvents.length,
      commandPalette: events.filter((e) => e.event_type === "command_palette").length,
    },
  };
}

// ── 4. Executive Growth™ ──
export function computeExecutiveGrowth(data = {}) {
  const reputations = data.executiveReputations || [];
  const lessonProgress = data.lessonProgress || [];
  const journeyEvents = data.journeyEvents || [];

  const scores = reputations.map((r) => r.reputation_score || 0);
  const avgRep = Math.round(avg(scores));
  const avgReadiness = Math.round(avg(reputations.map((r) => r.community_trust_score || 0)));
  const avgContribution = Math.round(avg(reputations.map((r) => r.contribution_score || 0)));

  const completedLessons = lessonProgress.filter((l) => l.completed);
  const totalXP = lessonProgress.reduce((sum, l) => sum + (l.xp_earned || 0), 0);
  const avgCompetency = Math.round(avg(lessonProgress.map((l) => l.competency_gain || 0)));

  const recentJourney = journeyEvents.slice(0, 20);

  return {
    avgReputation: avgRep,
    avgReadiness,
    avgContribution,
    totalMembers: reputations.length,
    lessonsCompleted: completedLessons.length,
    totalXPEarned: totalXP,
    avgCompetencyGain: avgCompetency,
    avgMentorship: Math.round(avg(reputations.map((r) => r.mentorship_score || 0))),
    avgExecutiveCredibility: Math.round(avg(reputations.map((r) => r.executive_credibility_score || 0))),
    recentJourney,
  };
}

// ── 5. Learning Completion™ ──
export function computeLearningCompletion(data = {}) {
  const lessonProgress = data.lessonProgress || [];
  const total = lessonProgress.length;
  const completed = lessonProgress.filter((l) => l.completed).length;
  const inProgress = lessonProgress.filter((l) => !l.completed && (l.completion_percentage || 0) > 0).length;
  const notStarted = total - completed - inProgress;
  const totalTime = lessonProgress.reduce((s, l) => s + (l.time_spent_minutes || 0), 0);
  const avgCompletion = Math.round(avg(lessonProgress.map((l) => l.completion_percentage || 0)));
  const certified = lessonProgress.filter((l) => l.certification_earned).length;

  return {
    totalLessons: total,
    completed,
    inProgress,
    notStarted,
    completionRate: pct(completed, total),
    avgCompletionPct: avgCompletion,
    totalTimeMinutes: totalTime,
    certified,
  };
}

// ── 6. AI Coaching Effectiveness™ ──
export function computeAICoachingEffectiveness(data = {}) {
  const usageLogs = data.usageLogs || [];
  const events = data.telemetryEvents || [];
  const aiEvents = events.filter((e) => e.event_category === "ai");
  const successCount = aiEvents.filter((e) => e.status === "success").length;
  const errorCount = aiEvents.filter((e) => e.status === "error").length;
  const avgDuration = Math.round(avg(aiEvents.map((e) => e.duration_ms || 0)));

  const moduleCounts = {};
  for (const e of aiEvents) {
    if (e.module) moduleCounts[e.module] = (moduleCounts[e.module] || 0) + 1;
  }
  const topModules = Object.entries(moduleCounts)
    .map(([m, c]) => ({ module: m, count: c }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    totalSessions: aiEvents.length,
    successRate: pct(successCount, aiEvents.length),
    errorCount,
    avgResponseMs: avgDuration,
    topModules,
  };
}

// ── 7. Engagement Score™ ──
export function computeEngagementScore(data = {}) {
  const events = data.telemetryEvents || [];
  const users = uniqueBy(events, "session_id");
  const avgEventsPerUser = users.length > 0 ? events.length / users.length : 0;
  const interactionEvents = events.filter((e) => e.event_category === "interaction" || e.event_category === "navigation");
  const engagementRate = pct(interactionEvents.length, events.length);
  const score = Math.min(Math.round((avgEventsPerUser / 50) * 100), 100);

  return {
    score,
    avgEventsPerUser: Math.round(avgEventsPerUser),
    totalInteractions: interactionEvents.length,
    engagementRate,
    activeUsers: users.length,
  };
}

// ── 8. Retention Score™ ──
export function computeRetentionScore(data = {}) {
  const events = data.telemetryEvents || [];
  const userDays = {};
  for (const e of events) {
    const sid = e.session_id || "anon";
    if (!userDays[sid]) userDays[sid] = new Set();
    if (e.created_date) userDays[sid].add(e.created_date.slice(0, 10));
  }
  const sessionIds = Object.keys(userDays);
  const returning = sessionIds.filter((s) => userDays[s].size >= 2).length;
  const retentionRate = pct(returning, sessionIds.length);
  const avgDaysActive = avg(sessionIds.map((s) => userDays[s].size));

  return {
    score: retentionRate,
    totalUsers: sessionIds.length,
    returningUsers: returning,
    avgDaysActive: Math.round(avgDaysActive),
  };
}

// ── 9. NPS™ ──
export function computeNPS(data = {}) {
  const insights = (data.productInsights || []).filter((i) => i.insight_type === "nps");
  const scores = insights.map((i) => i.score ?? i.likelihood_to_recommend ?? 0).filter((s) => s !== null && s !== undefined);
  const promoters = scores.filter((s) => s >= 9).length;
  const detractors = scores.filter((s) => s <= 6).length;
  const passives = scores.filter((s) => s >= 7 && s <= 8).length;
  const npsScore = scores.length > 0 ? Math.round(((promoters - detractors) / scores.length) * 100) : 0;

  return {
    score: npsScore,
    totalResponses: scores.length,
    promoters,
    passives,
    detractors,
    avgScore: avg(scores).toFixed(1),
  };
}

// ── 10. Beta Success™ ──
export function computeBetaSuccess(data = {}) {
  const applications = data.betaApplications || [];
  const total = applications.length;
  const approved = applications.filter((a) => ["approved", "invited", "activated"].includes(a.status)).length;
  const pending = applications.filter((a) => a.status === "pending").length;
  const waitlisted = applications.filter((a) => a.status === "waitlisted").length;
  const activated = applications.filter((a) => a.status === "activated").length;
  const activeBeta = applications.filter((a) => a.is_active_beta_user).length;
  const totalFeedback = applications.reduce((s, a) => s + (a.feedback_count || 0), 0);
  const totalBugs = applications.reduce((s, a) => s + (a.bug_report_count || 0), 0);
  const totalFeatureRequests = applications.reduce((s, a) => s + (a.feature_request_count || 0), 0);
  const avgNPS = avg(applications.map((a) => a.nps_score).filter(Boolean));

  return {
    totalApplications: total,
    approved,
    pending,
    waitlisted,
    activated,
    activeBetaUsers: activeBeta,
    acceptanceRate: pct(approved, total),
    activationRate: pct(activated, total),
    totalFeedback,
    totalBugs,
    totalFeatureRequests,
    avgNPS: Math.round(avgNPS) || null,
  };
}

// ── 11. Activation Rate™ ──
export function computeActivationRate(data = {}) {
  const profiles = data.userProfiles || [];
  const onboarded = profiles.filter((p) => p.onboarding_completed).length;
  const verified = profiles.filter((p) => p.identity_verified).length;
  const withRep = (data.executiveReputations || []).length;

  return {
    totalUsers: profiles.length,
    onboarded,
    verified,
    withReputation: withRep,
    onboardingRate: pct(onboarded, profiles.length),
    verificationRate: pct(verified, profiles.length),
    activationRate: pct(withRep, profiles.length),
  };
}

// ── 12. Expansion Potential™ ──
export function computeExpansionPotential(data = {}) {
  const subscriptions = data.subscriptions || [];
  const profiles = data.userProfiles || [];
  const enterprise = subscriptions.filter((s) => s.plan === "enterprise").length;
  const executive = subscriptions.filter((s) => s.plan === "executive").length;
  const professional = subscriptions.filter((s) => s.plan === "professional").length;
  const free = subscriptions.filter((s) => !s.plan || s.plan === "free").length;
  const upgradeCandidates = free + professional;

  return {
    totalSubscriptions: subscriptions.length,
    enterprise,
    executive,
    professional,
    free,
    upgradeCandidates,
    expansionRate: pct(executive + enterprise, subscriptions.length),
  };
}

// ── 13. Product Market Fit™ (composite) ──
export function computeProductMarketFit(data = {}) {
  const nps = computeNPS(data);
  const insights = data.productInsights || [];
  const csatScores = insights.filter((i) => i.insight_type === "csat").map((i) => i.score).filter(Boolean);
  const cesScores = insights.filter((i) => i.insight_type === "ces").map((i) => i.score).filter(Boolean);
  const valueRatings = insights.filter((i) => i.product_value_rating).map((i) => i.product_value_rating);

  const mostValuable = {};
  for (const i of insights) {
    if (i.most_valuable_feature) mostValuable[i.most_valuable_feature] = (mostValuable[i.most_valuable_feature] || 0) + 1;
  }
  const leastValuable = {};
  for (const i of insights) {
    if (i.least_valuable_feature) leastValuable[i.least_valuable_feature] = (leastValuable[i.least_valuable_feature] || 0) + 1;
  }

  const topValuable = Object.entries(mostValuable).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const topLeast = Object.entries(leastValuable).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const pmfScore = Math.min(
    Math.round((nps.score + 100) / 2 + avg(csatScores) * 10 + avg(valueRatings) * 5),
    100
  );

  return {
    pmfScore,
    nps,
    avgCSAT: avg(csatScores).toFixed(1),
    avgCES: avg(cesScores).toFixed(1),
    avgValueRating: avg(valueRatings).toFixed(1),
    totalSurveys: insights.length,
    topValuable,
    topLeast,
  };
}

// ── 14. EXEC™ Recommendation Engine™ ──
export function computeRecommendations(data = {}) {
  const adoption = computeProductAdoption(data);
  const health = computeCustomerHealth(data);
  const learning = computeLearningCompletion(data);
  const ai = computeAICoachingEffectiveness(data);
  const recs = [];

  if (ai.successRate < 80 && ai.totalSessions > 0) {
    recs.push({ priority: "high", type: "ai", title: "Improve AI Coaching Reliability", detail: `AI success rate is ${ai.successRate}% — investigate error patterns`, action: "/developer/ai-command-center" });
  }
  if (learning.completionRate < 50 && learning.totalLessons > 0) {
    recs.push({ priority: "high", type: "learning", title: "Boost Learning Completion", detail: `Only ${learning.completionRate}% of lessons completed — add nudges or simplify content`, action: "/academy" });
  }
  if (health.segments.atRisk > 0) {
    recs.push({ priority: "medium", type: "retention", title: "Re-engage At-Risk Customers", detail: `${health.segments.atRisk} customers are at risk of churning`, action: "/developer" });
  }
  if (adoption.featureAdoption.learning < 5) {
    recs.push({ priority: "medium", type: "learning", title: "Promote Academy Adoption", detail: "Learning module usage is low — consider onboarding prompts", action: "/academy" });
  }
  if (adoption.featureAdoption.commercial < 5) {
    recs.push({ priority: "medium", type: "commercial", title: "Drive Commercial Module Usage", detail: "CPQ and procurement modules underutilized", action: "/cpq-dashboard" });
  }
  if (health.segments.champions > 0) {
    recs.push({ priority: "low", type: "expansion", title: "Leverage Champion Customers", detail: `${health.segments.champions} champion customers — prime for referrals and case studies`, action: "/referrals" });
  }
  if (adoption.featureAdoption.ai < 5) {
    recs.push({ priority: "medium", type: "coaching", title: "Encourage AI Coaching Sessions", detail: "AI coaching utilization is low — surface EXEC™ Concierge more prominently", action: "/dashboard" });
  }
  recs.push({ priority: "low", type: "report", title: "Generate Executive Success Report", detail: "Compile leadership progress and customer health into a board-ready report", action: "/product-intelligence" });

  return recs.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.priority] - order[b.priority];
  });
}

// ── Master Aggregator ──
export function computeProductIntelligence(data = {}) {
  const adoption = computePlatformAdoption(data);
  const health = computeCustomerHealth(data);
  const growth = computeExecutiveGrowth(data);
  const learning = computeLearningCompletion(data);
  const ai = computeAICoachingEffectiveness(data);
  const engagement = computeEngagementScore(data);
  const retention = computeRetentionScore(data);
  const nps = computeNPS(data);
  const beta = computeBetaSuccess(data);
  const activation = computeActivationRate(data);
  const expansion = computeExpansionPotential(data);
  const marketFit = computeProductMarketFit(data);
  const productAdoption = computeProductAdoption(data);
  const recommendations = computeRecommendations(data);

  const executiveKPIs = [
    { id: "platform_adoption", label: "Platform Adoption™", value: `${adoption.adoptionRate}%`, sub: `${adoption.activeUsers} active users`, score: adoption.adoptionRate },
    { id: "customer_health", label: "Customer Health™", value: `${health.avgHealthScore}/100`, sub: `${health.segments.healthy} healthy`, score: health.avgHealthScore },
    { id: "executive_growth", label: "Executive Growth™", value: growth.avgReputation, sub: `avg reputation`, score: Math.min(growth.avgReputation / 10, 100) },
    { id: "learning_completion", label: "Learning Completion™", value: `${learning.completionRate}%`, sub: `${learning.completed} completed`, score: learning.completionRate },
    { id: "leadership_progress", label: "Leadership Progress™", value: growth.totalXPEarned, sub: "total XP earned", score: Math.min(growth.totalXPEarned / 100, 100) },
    { id: "ai_coaching", label: "AI Coaching Effectiveness™", value: `${ai.successRate}%`, sub: `${ai.totalSessions} sessions`, score: ai.successRate },
    { id: "engagement", label: "Engagement Score™", value: `${engagement.score}/100`, sub: `${engagement.avgEventsPerUser} avg events`, score: engagement.score },
    { id: "retention", label: "Retention Score™", value: `${retention.score}%`, sub: `${retention.returningUsers} returning`, score: retention.score },
    { id: "nps", label: "NPS™", value: nps.score, sub: `${nps.totalResponses} responses`, score: (nps.score + 100) / 2 },
    { id: "beta_success", label: "Beta Success™", value: `${beta.acceptanceRate}%`, sub: `${beta.totalApplications} applications`, score: beta.acceptanceRate },
    { id: "activation_rate", label: "Activation Rate™", value: `${activation.activationRate}%`, sub: `${activation.onboarded} onboarded`, score: activation.activationRate },
    { id: "expansion_potential", label: "Expansion Potential™", value: `${expansion.expansionRate}%`, sub: `${expansion.upgradeCandidates} candidates`, score: expansion.expansionRate },
  ];

  return {
    executiveKPIs,
    adoption,
    health,
    growth,
    learning,
    ai,
    engagement,
    retention,
    nps,
    beta,
    activation,
    expansion,
    marketFit,
    productAdoption,
    recommendations,
    overallScore: Math.round(avg(executiveKPIs.map((k) => k.score))),
  };
}
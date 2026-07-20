/**
 * Admissions Intelligence™ Engine v3.0
 *
 * Extends the Founding Member Admissions System with executive-grade
 * operational intelligence: priority scoring, diversity metrics, reviewer
 * performance, capacity forecasting, admissions health, product insights,
 * activation tracking, and observability metric registration.
 *
 * Builds on — does not duplicate — foundingAdmissionsEngine.computeAdmissionsAnalytics.
 */

import { computeAdmissionsAnalytics } from "./foundingAdmissionsEngine";

// ============================================================
// APPLICATION PRIORITY ENGINE™
// ============================================================
const READINESS_MAP = {
  c_suite: 20, founder: 20, svp: 18, vp: 16, senior_director: 14, director: 12,
  senior_manager: 10, manager: 8, team_lead: 6, consultant: 10,
  individual_contributor: 4, other: 4,
};

export function computePriorityScore(app, allRecords = []) {
  if (!app) return 0;
  let score = 0;

  score += Math.min(app.years_of_experience || 0, 15);
  score += READINESS_MAP[app.leadership_level] || 4;
  score += Math.min((app.application_score || 0) / 5, 20);

  const companyCount = allRecords.filter((r) => r.company && r.company === app.company).length;
  if (companyCount <= 1) score += 15; else if (companyCount <= 2) score += 10; else if (companyCount <= 3) score += 5;

  const countryCount = allRecords.filter((r) => r.country && r.country === app.country).length;
  if (countryCount <= 1) score += 10; else if (countryCount <= 3) score += 7; else if (countryCount <= 5) score += 4; else if (countryCount <= 10) score += 2;

  if (app.created_date) {
    const daysOld = Math.floor((Date.now() - new Date(app.created_date)) / (1000 * 60 * 60 * 24));
    score += Math.min(daysOld, 10);
  }

  if (app.linkedin_url) score += 5;
  if (app.company) score += 3;
  const whyWords = (app.why_join || "").trim().split(/\s+/).filter(Boolean).length;
  if (whyWords >= 30) score += 2;

  return Math.min(Math.round(score), 100);
}

export function getPriorityLevel(score) {
  if (score >= 70) return { level: "high", label: "High", color: "#ef4444", badge: "text-red-400 bg-red-500/10" };
  if (score >= 40) return { level: "medium", label: "Medium", color: "#f59e0b", badge: "text-amber-400 bg-amber-500/10" };
  return { level: "low", label: "Low", color: "#64748b", badge: "text-white/30 bg-white/5" };
}

// ============================================================
// ADMISSIONS INTELLIGENCE DASHBOARD™
// ============================================================
export function computeAdmissionsIntelligence(records = [], capacityInfo = null) {
  const base = computeAdmissionsAnalytics(records);
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const thisWeek = records.filter((r) => r.created_date && new Date(r.created_date) >= weekAgo).length;
  const today = records.filter((r) => r.created_date && new Date(r.created_date) >= todayStart).length;
  const interviewRequired = records.filter((r) => r.status === "interview").length;
  const capacityRemaining = capacityInfo?.remaining ?? 0;
  const waitlistSize = capacityInfo?.isFull ? Math.max(records.length - (capacityInfo?.capacity || 100), 0) : 0;

  return { ...base, thisWeek, today, interviewRequired, capacityRemaining, waitlistSize };
}

// ============================================================
// EXECUTIVE DIVERSITY DASHBOARD™
// ============================================================
function buildBreakdown(records, field, transform = (v) => v) {
  const counts = {};
  records.forEach((r) => {
    const val = transform(r[field]);
    if (val) counts[val] = (counts[val] || 0) + 1;
  });
  return Object.entries(counts).sort((a, b) => b[1] - a[1]);
}

export function computeDiversityMetrics(records = []) {
  const countries = buildBreakdown(records, "country");
  const uniqueCountries = countries.length;

  const leadershipLevels = buildBreakdown(records, "leadership_level", (v) => v?.replace(/_/g, " "));
  const uniqueLeadershipLevels = leadershipLevels.length;

  const teamSizes = buildBreakdown(records, "team_size", (v) => v?.replace(/_/g, " "));
  const primaryGoals = buildBreakdown(records, "primary_goal", (v) => v?.replace(/_/g, " "));

  const expRanges = { "0-5": 0, "6-10": 0, "11-15": 0, "16-20": 0, "20+": 0 };
  records.forEach((r) => {
    const y = r.years_of_experience || 0;
    if (y <= 5) expRanges["0-5"]++;
    else if (y <= 10) expRanges["6-10"]++;
    else if (y <= 15) expRanges["11-15"]++;
    else if (y <= 20) expRanges["16-20"]++;
    else expRanges["20+"]++;
  });
  const yearsOfExperience = Object.entries(expRanges).map(([label, count]) => [label, count]);

  return {
    uniqueCountries, countries, uniqueLeadershipLevels, leadershipLevels,
    teamSizes, primaryGoals, yearsOfExperience,
    totalRecords: records.length,
  };
}

// ============================================================
// REVIEWER PERFORMANCE™ (internal only)
// ============================================================
export function computeReviewerPerformance(records = []) {
  const reviewerMap = {};
  records.forEach((r) => {
    const name = r.reviewed_by_name || r.assigned_reviewer_name;
    if (!name) return;
    if (!reviewerMap[name]) {
      reviewerMap[name] = { name, reviewed: 0, approved: 0, declined: 0, pending: 0, reviewTimes: [] };
    }
    if (r.reviewed_at) {
      reviewerMap[name].reviewed++;
      if (r.created_date) {
        reviewerMap[name].reviewTimes.push(new Date(r.reviewed_at) - new Date(r.created_date));
      }
      if (["approved", "invitation_sent", "account_activated"].includes(r.status)) reviewerMap[name].approved++;
      if (r.status === "declined") reviewerMap[name].declined++;
    }
    if (["submitted", "email_verified", "under_review", "additional_info_required", "interview"].includes(r.status)) {
      const assignedTo = r.assigned_reviewer_name;
      if (assignedTo === name) reviewerMap[name].pending++;
    }
  });

  const now = Date.now();
  let oldestPending = null;
  records.forEach((r) => {
    if (["submitted", "email_verified", "under_review", "additional_info_required", "interview"].includes(r.status) && r.created_date) {
      const age = now - new Date(r.created_date);
      if (!oldestPending || age > oldestPending.age) oldestPending = { age, app: r };
    }
  });

  const reviewers = Object.values(reviewerMap).map((r) => ({
    ...r,
    avgReviewHours: r.reviewTimes.length > 0 ? Math.round(r.reviewTimes.reduce((a, b) => a + b, 0) / r.reviewTimes.length / (1000 * 60 * 60)) : 0,
    approvalRate: r.reviewed > 0 ? Math.round((r.approved / r.reviewed) * 100) : 0,
  }));

  return { reviewers, totalReviewers: reviewers.length, oldestPending };
}

// ============================================================
// CAPACITY FORECAST™
// ============================================================
export function computeCapacityForecast(records = [], capacityInfo = null) {
  const capacity = capacityInfo?.capacity || 100;
  const accepted = capacityInfo?.accepted || 0;
  const remaining = Math.max(capacity - accepted, 0);

  const datedRecords = records.filter((r) => r.created_date).sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
  const total = datedRecords.length;
  const appsPerDay = total > 0 ? Math.max(total / Math.max(Math.ceil((Date.now() - new Date(datedRecords[0].created_date)) / (1000 * 60 * 60 * 24)), 1), 0.1) : 0;

  const approved = records.filter((r) => ["approved", "invitation_sent", "account_activated"].includes(r.status)).length;
  const acceptanceRate = total > 0 ? Math.round((approved / total) * 100) : 0;

  const daysUntilFull = appsPerDay > 0 ? Math.ceil(remaining / appsPerDay) : 0;
  const projectedClosingDate = daysUntilFull > 0 ? new Date(Date.now() + daysUntilFull * 24 * 60 * 60 * 1000) : null;
  const projectedWaitlistSize = accepted >= capacity ? Math.ceil(appsPerDay * 7) : 0;

  return { capacity, accepted, remaining, appsPerDay: Math.round(appsPerDay * 10) / 10, acceptanceRate, daysUntilFull, projectedClosingDate, projectedWaitlistSize };
}

// ============================================================
// EXECUTIVE ADMISSIONS HEALTH™
// ============================================================
export function getHealthStatus(score) {
  if (score >= 80) return { label: "Healthy", color: "#10b981", badge: "text-emerald-400 bg-emerald-500/10" };
  if (score >= 50) return { label: "Warning", color: "#f59e0b", badge: "text-amber-400 bg-amber-500/10" };
  return { label: "Critical", color: "#ef4444", badge: "text-red-400 bg-red-500/10" };
}

export function computeAdmissionsHealth(records = [], capacityInfo = null) {
  const total = records.length;
  const reviewed = records.filter((r) => r.reviewed_at).length;
  const pending = records.filter((r) => ["submitted", "email_verified", "under_review", "additional_info_required", "interview"].includes(r.status)).length;
  const approved = records.filter((r) => ["approved", "invitation_sent", "account_activated"].includes(r.status)).length;

  const admissionsHealth = total > 0 ? Math.min(Math.round((reviewed / total) * 100), 100) : 100;

  const utilization = capacityInfo ? (capacityInfo.accepted / (capacityInfo.capacity || 100)) * 100 : 0;
  const capacityHealth = Math.max(0, Math.round(100 - utilization));

  const reviewerHealth = total > 0 ? Math.min(Math.round((1 - pending / Math.max(total, 1)) * 100), 100) : 100;

  const reviewTimes = records.filter((r) => r.created_date && r.reviewed_at).map((r) => (new Date(r.reviewed_at) - new Date(r.created_date)) / (1000 * 60 * 60));
  const avgReviewHours = reviewTimes.length > 0 ? reviewTimes.reduce((a, b) => a + b, 0) / reviewTimes.length : 0;
  const processingHealth = avgReviewHours > 0 ? Math.max(0, Math.round(100 - (avgReviewHours / 72) * 100)) : 100;

  const notificationHealth = 100;

  const approvalPipeline = total > 0 ? Math.round((approved / total) * 100) : 0;

  const overall = Math.round((admissionsHealth + capacityHealth + reviewerHealth + processingHealth + notificationHealth + approvalPipeline) / 6);

  return { admissionsHealth, capacityHealth, reviewerHealth, processingHealth, notificationHealth, approvalPipeline, overall };
}

// ============================================================
// ACTIVATION DASHBOARD™
// ============================================================
export function computeActivationMetrics(records = []) {
  const approved = records.filter((r) => ["approved", "invitation_sent", "account_activated"].includes(r.status));
  const invitationSent = approved.filter((r) => r.invitation_sent_at || ["invitation_sent", "account_activated"].includes(r.status)).length;
  const invitationAccepted = approved.filter((r) => r.invitation_accepted).length;
  const accountActivated = approved.filter((r) => r.status === "account_activated" || r.activated_at).length;
  const firstLogin = approved.filter((r) => r.user_id).length;
  const foundingBadgeAssigned = approved.filter((r) => r.founding_member_assigned).length;
  const executiveJourneyStarted = approved.filter((r) => r.is_active_beta_user).length;

  const profileCompletion = firstLogin > 0 ? Math.round((executiveJourneyStarted / Math.max(firstLogin, 1)) * 100) : 0;

  return {
    totalApproved: approved.length,
    invitationSent, invitationAccepted, accountActivated,
    firstLogin, profileCompletion, executiveJourneyStarted, foundingBadgeAssigned,
  };
}

// ============================================================
// PRODUCT INSIGHTS™ (internal only)
// ============================================================
export function computeProductInsights(records = []) {
  const countries = buildBreakdown(records, "country");
  const fastestGrowingRegion = countries[0]?.[0] || "—";

  const leadershipLevels = buildBreakdown(records, "leadership_level", (v) => v?.replace(/_/g, " "));
  const avgExecutiveLevel = leadershipLevels[0]?.[0] || "—";

  const goals = buildBreakdown(records, "primary_goal", (v) => v?.replace(/_/g, " "));
  const mostCommonGoal = goals[0]?.[0] || "—";

  const rejectionReasons = records
    .filter((r) => r.rejection_reason)
    .map((r) => r.rejection_reason);
  const reasonCounts = {};
  rejectionReasons.forEach((r) => { reasonCounts[r] = (reasonCounts[r] || 0) + 1; });
  const topRejectionReasons = Object.entries(reasonCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const capabilities = records
    .filter((r) => r.interested_capabilities)
    .flatMap((r) => { try { return JSON.parse(r.interested_capabilities); } catch { return []; } });
  const capCounts = {};
  capabilities.forEach((c) => { if (c) capCounts[c] = (capCounts[c] || 0) + 1; });
  const mostRequestedCapabilities = Object.entries(capCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const howHeard = buildBreakdown(records, "how_heard", (v) => v?.replace(/_/g, " "));

  return {
    fastestGrowingRegion, avgExecutiveLevel, mostCommonGoal,
    topRejectionReasons, mostRequestedCapabilities, howHeard,
    topCountries: countries.slice(0, 5),
  };
}

// ============================================================
// OBSERVABILITY™ — Metric Registry
// ============================================================
export function getAdmissionsObservabilityMetrics() {
  return [
    { engine: "Admissions Engine", metric: "admissions.intelligence.compute", status: "registered", description: "Core admissions metrics computation" },
    { engine: "Audit Engine", metric: "admissions.audit.capture", status: "registered", description: "Immutable audit trail event capture" },
    { engine: "Notification Engine", metric: "admissions.notification.dispatch", status: "registered", description: "10-template notification dispatch" },
    { engine: "Capacity Engine", metric: "admissions.capacity.forecast", status: "registered", description: "Capacity utilization and projection" },
    { engine: "Priority Engine", metric: "admissions.priority.score", status: "registered", description: "Application priority scoring (0-100)" },
    { engine: "Analytics Engine", metric: "admissions.analytics.aggregate", status: "registered", description: "Aggregate analytics computation" },
    { engine: "Reviewer Queue", metric: "admissions.reviewer.queue", status: "registered", description: "Reviewer assignment and performance" },
    { engine: "Dashboard Refresh", metric: "admissions.dashboard.refresh", status: "registered", description: "Real-time dashboard data refresh" },
  ];
}
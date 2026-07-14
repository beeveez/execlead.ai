/**
 * EXECLEAD.AI — Beta Operations Engine™
 * ============================================================
 * Computes the complete operational intelligence layer for the
 * Founding Private Beta program — from application funnel through
 * graduation to General Availability.
 */
import { STREAM_CONFIG } from "./streamIntelligenceEngine";

const DAY = 86400000;

function activeUsersInWindow(events, since) {
  const ids = new Set();
  const cutoff = Date.now() - since;
  for (const e of events) {
    const t = new Date(e.created_date || e.updated_date).getTime();
    if (t >= cutoff && e.created_by_id) ids.add(e.created_by_id);
  }
  return ids.size;
}

function avg(nums) {
  if (!nums || nums.length === 0) return 0;
  return Math.round(nums.reduce((s, n) => s + n, 0) / nums.length);
}

export function computeBetaOperations(data) {
  const {
    applications = [],
    invitations = [],
    cohorts = [],
    communications = [],
    telemetryEvents = [],
    productInsights = [],
    feedback = [],
    lessonProgress = [],
    usageLogs = [],
  } = data;

  // ── Application Funnel ──
  const totalApps = applications.length;
  const pending = applications.filter((a) => a.status === "pending").length;
  const approved = applications.filter((a) => a.status === "approved").length;
  const rejected = applications.filter((a) => a.status === "rejected").length;
  const invited = applications.filter((a) => a.status === "invited").length;
  const activatedApps = applications.filter((a) => a.status === "activated");
  const activated = activatedApps.length;
  const activeBeta = applications.filter((a) => a.is_active_beta_user).length;

  // ── Active Beta Users (DAU/WAU/MAU) ──
  const betaUserIds = new Set(applications.filter((a) => a.user_id).map((a) => a.user_id));
  const betaTelemetry = telemetryEvents.filter((e) => e.created_by_id && betaUserIds.has(e.created_by_id));
  const dailyActive = activeUsersInWindow(betaTelemetry, DAY);
  const weeklyActive = activeUsersInWindow(betaTelemetry, 7 * DAY);
  const monthlyActive = activeUsersInWindow(betaTelemetry, 30 * DAY);

  // ── Learning & Completion ──
  const completedLessons = lessonProgress.filter((l) => l.completed).length;
  const totalLessons = lessonProgress.length;
  const completionRate = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  // ── Retention ──
  const retentionRate = activated > 0 ? Math.round((activeBeta / activated) * 100) : 0;

  // ── NPS ──
  const npsResponses = productInsights.filter((p) => p.insight_type === "nps" && p.score != null);
  const npsScore = npsResponses.length > 0 ? avg(npsResponses.map((p) => p.score)) : null;
  const promoters = npsResponses.filter((p) => p.score >= 9).length;
  const detractors = npsResponses.filter((p) => p.score <= 6).length;
  const npsCalc = npsResponses.length > 0 ? Math.round(((promoters - detractors) / npsResponses.length) * 100) : 0;

  // ── Feedback ──
  const allFeedback = [...(productInsights || []), ...(feedback || [])];
  const bugReports = allFeedback.filter((f) => f.insight_type === "bug_report" || f.feedback_type === "bug").length;
  const featureRequests = allFeedback.filter((f) => f.insight_type === "feature_request" || f.feedback_type === "feature_request").length;
  const totalFeedback = allFeedback.length;

  // ── Executive Satisfaction ──
  const valueRatings = productInsights.filter((p) => p.product_value_rating != null);
  const execSatisfaction = valueRatings.length > 0 ? Math.round((avg(valueRatings.map((p) => p.product_value_rating)) / 5) * 100) : null;

  // ── Beta Health Score™ (composite) ──
  const engagementScore = activated > 0 ? Math.min(100, Math.round((monthlyActive / activated) * 100)) : 0;
  const learningScore = completionRate;
  const activityScore = activated > 0 ? Math.min(100, Math.round((betaTelemetry.length / activated) * 5)) : 0;
  const feedbackScore = Math.min(100, totalFeedback * 5);
  const retentionScore = retentionRate;
  const aiUsageScore = activated > 0 ? Math.min(100, Math.round((usageLogs.length / activated) * 10)) : 0;

  const betaHealthScore = Math.round(
    engagementScore * 0.2 + learningScore * 0.15 + activityScore * 0.15 +
    feedbackScore * 0.1 + retentionScore * 0.2 + aiUsageScore * 0.2
  );

  // ── Invitation Stats ──
  const invitationStats = {
    total: invitations.length,
    sent: invitations.filter((i) => ["sent", "opened", "accepted", "expired", "declined"].includes(i.status)).length,
    opened: invitations.filter((i) => ["opened", "accepted"].includes(i.status)).length,
    accepted: invitations.filter((i) => i.status === "accepted").length,
    expired: invitations.filter((i) => i.status === "expired").length,
    declined: invitations.filter((i) => i.status === "declined").length,
  };

  // ── Cohort Metrics ──
  const cohortTypeMap = { founding_a: "founding_beta", founding_b: "founding_beta", enterprise: "enterprise_beta", executive: "exec_beta", partner: "commercial_beta" };
  const cohortMetrics = cohorts.map((c) => {
    const tier = cohortTypeMap[c.cohort_type] || "founding_beta";
    const cApps = applications.filter((a) => a.beta_tier === tier);
    const cActive = cApps.filter((a) => a.is_active_beta_user).length;
    const cNps = cApps.filter((a) => a.nps_score != null);
    return {
      ...c,
      participantCount: cApps.length,
      activeCount: cActive,
      engagement: cApps.length > 0 ? Math.round((cActive / cApps.length) * 100) : 0,
      avgNps: cNps.length > 0 ? avg(cNps.map((a) => a.nps_score)) : null,
      retention: cApps.length > 0 ? Math.round((cActive / cApps.length) * 100) : 0,
    };
  });

  // ── Health Recommendations ──
  const recommendations = [];
  if (engagementScore < 40 && activated > 0)
    recommendations.push({ type: "re_engage", title: "Re-engage inactive beta users", priority: "P0", detail: `${activated - activeBeta} of ${activated} activated users are not currently active. Send re-engagement communications.` });
  if (pending > 5)
    recommendations.push({ type: "review", title: "Review pending applications", priority: "P1", detail: `${pending} applications awaiting review.` });
  if (bugReports > 3)
    recommendations.push({ type: "bugs", title: "Triage bug reports", priority: bugReports > 10 ? "P0" : "P1", detail: `${bugReports} bug reports need attention.` });
  if (retentionRate < 50 && activated > 5)
    recommendations.push({ type: "retention", title: "Improve retention", priority: "P0", detail: `Only ${retentionRate}% of activated users remain active. Investigate churn causes.` });
  if (betaHealthScore >= 75 && activated > 5)
    recommendations.push({ type: "graduate", title: "Consider graduating top performers", priority: "P2", detail: `Beta Health Score is ${betaHealthScore}/100 — eligible users should be evaluated for graduation.` });
  if (npsScore != null && npsScore < 7)
    recommendations.push({ type: "nps", title: "Address low NPS", priority: "P0", detail: `Average NPS score is ${npsScore}/10 — below the 7.0 threshold.` });

  // ── Graduation Tracking ──
  const eligibleForGraduation = activatedApps.filter((a) => a.is_active_beta_user && (a.nps_score || 0) >= 8);
  const graduation = {
    eligible: eligibleForGraduation.length,
    certified: applications.filter((a) => a.status === "activated" && a.feedback_count > 3).length,
    migrated: 0,
    pending: activatedApps.filter((a) => !a.is_active_beta_user).length,
  };

  // ── At-Risk Users ──
  const betaUserEventCounts = {};
  betaTelemetry.forEach((e) => {
    if (e.created_by_id) betaUserEventCounts[e.created_by_id] = (betaUserEventCounts[e.created_by_id] || 0) + 1;
  });
  const atRiskUsers = activatedApps.filter((a) => {
    const events = a.user_id ? (betaUserEventCounts[a.user_id] || 0) : 0;
    return events < 5;
  }).map((a) => ({
    ...a,
    eventCount: a.user_id ? (betaUserEventCounts[a.user_id] || 0) : 0,
    healthScore: a.user_id ? Math.min(100, (betaUserEventCounts[a.user_id] || 0) * 5) : 0,
  }));

  // ── Communication Stats ──
  const commStats = {
    total: communications.length,
    sent: communications.filter((c) => c.status === "sent").length,
    drafts: communications.filter((c) => c.status === "draft").length,
    totalRecipients: communications.reduce((s, c) => s + (c.recipient_count || 0), 0),
    totalOpens: communications.reduce((s, c) => s + (c.open_count || 0), 0),
  };

  return {
    dashboard: {
      applicationsReceived: totalApps,
      pendingReview: pending,
      approved, rejected, invited, activated,
      dailyActive, weeklyActive, monthlyActive,
      completionRate, retentionRate,
      nps: npsScore, npsCalc,
      feedbackReceived: totalFeedback, bugReports, featureRequests,
      executiveSatisfaction: execSatisfaction,
      betaHealthScore,
      engagementScore, learningScore, activityScore,
      feedbackScore, retentionScore, aiUsageScore,
    },
    reviewQueue: applications.filter((a) => a.status === "pending"),
    invitationStats,
    cohortMetrics,
    recommendations,
    graduation,
    atRiskUsers,
    activeBetaUsers: activatedApps.filter((a) => a.is_active_beta_user),
    commStats,
    allApplications: applications,
  };
}

export function generateInvitationCode() {
  const prefix = "EXEC-BETA";
  const random = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `${prefix}-${random}`;
}
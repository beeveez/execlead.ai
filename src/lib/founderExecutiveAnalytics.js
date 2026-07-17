/**
 * EXECLEAD.AI — Founder Executive Analytics Engine™
 * ============================================================
 * Executive dashboards with:
 * - Founder Growth (by month)
 * - Activation Rate
 * - Weekly/Monthly Active Founders
 * - Retention
 * - Feature Adoption
 * - Feedback Velocity
 * - Bug Resolution Rate
 * - Average Response Time
 * - Idea Acceptance Rate
 * - Founder Satisfaction
 * - Community Growth
 * - Executive Advisory Participation
 */

import { base44 } from "@/api/base44Client";

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MS_PER_WEEK = 7 * MS_PER_DAY;
const MS_PER_MONTH = 30 * MS_PER_DAY;

/**
 * Compute comprehensive executive analytics for the founder program.
 */
export async function computeExecutiveAnalytics() {
  const [members, feedback, auditLogs] = await Promise.all([
    base44.entities.FoundingMember.list("-created_date", 100000).catch(() => []),
    base44.entities.Feedback.filter({ type: "idea" }).catch(() => []),
    base44.entities.FoundingMemberAuditLog.list("-created_date", 500).catch(() => []),
  ]);

  const now = Date.now();
  const activeMembers = members.filter((m) => m.status === "active");

  // --- Founder Growth (by month) ---
  const monthMap = {};
  members.forEach((m) => {
    if (m.joined_date) {
      const month = m.joined_date.substring(0, 7);
      monthMap[month] = (monthMap[month] || 0) + 1;
    }
  });
  const founderGrowth = Object.entries(monthMap)
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month));

  // --- Activation Rate ---
  const activated = members.filter((m) => m.badge_status === "granted").length;
  const activationRate = members.length > 0 ? Math.round((activated / members.length) * 100) : 0;

  // --- Weekly/Monthly Active Founders ---
  // Using health_checked_at or entered_stage_date as activity proxy
  const weeklyActive = activeMembers.filter((m) => {
    const dateStr = m.health_checked_at || m.entered_stage_date || m.joined_date;
    if (!dateStr) return false;
    return (now - new Date(dateStr).getTime()) <= MS_PER_WEEK;
  }).length;

  const monthlyActive = activeMembers.filter((m) => {
    const dateStr = m.health_checked_at || m.entered_stage_date || m.joined_date;
    if (!dateStr) return false;
    return (now - new Date(dateStr).getTime()) <= MS_PER_MONTH;
  }).length;

  // --- Retention (members still active after 30 days) ---
  const membersOver30Days = members.filter((m) => {
    if (!m.joined_date) return false;
    return (now - new Date(m.joined_date).getTime()) > MS_PER_MONTH;
  });
  const retainedOver30 = membersOver30Days.filter((m) => m.status === "active").length;
  const retentionRate = membersOver30Days.length > 0
    ? Math.round((retainedOver30 / membersOver30Days.length) * 100)
    : 100;

  // --- Feature Adoption ---
  const membersWithEarlyAccess = members.filter((m) => m.early_access_enabled).length;
  const featureAdoptionRate = activeMembers.length > 0
    ? Math.round((membersWithEarlyAccess / activeMembers.length) * 100)
    : 0;

  // --- Feedback Velocity (ideas submitted in last 30 days) ---
  const recentFeedback = feedback.filter((f) => {
    if (!f.created_date) return false;
    return (now - new Date(f.created_date).getTime()) <= MS_PER_MONTH;
  }).length;

  // --- Bug Resolution Rate ---
  const bugsPromise = base44.entities.Feedback.filter({ type: "bug" }).catch(() => []);
  const bugs = await bugsPromise;
  const resolvedBugs = bugs.filter((b) => b.status === "resolved" || b.status === "closed").length;
  const bugResolutionRate = bugs.length > 0 ? Math.round((resolvedBugs / bugs.length) * 100) : 100;

  // --- Average Response Time (days from feedback to first status change) ---
  const respondedFeedback = feedback.filter((f) => f.status !== "new" && f.created_date);
  const avgResponseDays = respondedFeedback.length > 0
    ? Math.round(respondedFeedback.reduce((sum, f) => {
        const created = new Date(f.created_date).getTime();
        const updated = new Date(f.updated_date || f.created_date).getTime();
        return sum + Math.max(0, (updated - created) / MS_PER_DAY);
      }, 0) / respondedFeedback.length * 10) / 10
    : 0;

  // --- Idea Acceptance Rate ---
  const acceptedIdeas = feedback.filter((f) =>
    ["planned", "in_development", "testing", "ready_for_release", "released"].includes(f.roadmap_stage)
  ).length;
  const ideaAcceptanceRate = feedback.length > 0 ? Math.round((acceptedIdeas / feedback.length) * 100) : 0;

  // --- Founder Satisfaction (from BetaFeedback NPS) ---
  const betaFeedback = await base44.entities.BetaFeedback.list("-created_date", 500).catch(() => []);
  const npsScores = betaFeedback.filter((b) => b.would_recommend != null).map((b) => b.would_recommend);
  const avgSatisfaction = npsScores.length > 0
    ? Math.round((npsScores.reduce((s, n) => s + n, 0) / npsScores.length) * 10) / 10
    : 0;

  // --- Community Growth ---
  const totalCommunityPosts = members.reduce((s, m) => s + (m.community_posts || 0), 0);
  const totalCommunityConnections = members.reduce((s, m) => s + (m.community_connections || 0), 0);

  // --- Executive Advisory Participation ---
  const advisoryMembers = members.filter((m) => m.founding_tier === "advisory_council");
  const advisoryParticipation = advisoryMembers.length;

  // --- Lifecycle Stage Distribution ---
  const stageDistribution = {};
  members.forEach((m) => {
    const stage = m.current_stage || "application";
    stageDistribution[stage] = (stageDistribution[stage] || 0) + 1;
  });

  // --- Health Distribution ---
  const healthDistribution = { healthy: 0, at_risk: 0, inactive: 0 };
  members.forEach((m) => {
    const status = m.health_status || "healthy";
    healthDistribution[status] = (healthDistribution[status] || 0) + 1;
  });

  return {
    summary: {
      totalFounders: members.length,
      activeFounders: activeMembers.length,
      activationRate,
      weeklyActive,
      monthlyActive,
      retentionRate,
      featureAdoptionRate,
      feedbackVelocity: recentFeedback,
      bugResolutionRate,
      avgResponseDays,
      ideaAcceptanceRate,
      avgSatisfaction,
      advisoryParticipation,
    },
    growth: founderGrowth,
    community: {
      totalPosts: totalCommunityPosts,
      totalConnections: totalCommunityConnections,
    },
    lifecycle: Object.entries(stageDistribution).map(([stage, count]) => ({ stage, count })),
    health: healthDistribution,
    metrics: {
      totalIdeas: feedback.length,
      acceptedIdeas,
      totalBugs: bugs.length,
      resolvedBugs,
      totalAuditEntries: auditLogs.length,
    },
  };
}
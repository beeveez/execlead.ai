/**
 * EXECLEAD.AI — Founder Health Score Engine™
 * ============================================================
 * Calculates engagement-based health score from:
 * - Activity (sessions, platform usage)
 * - Feedback (ideas submitted, votes cast)
 * - Feature adoption (module usage)
 * - AI sessions (coach, simulator, analytics)
 * - Community engagement (posts, comments, connections)
 *
 * Health Status: Healthy (70+) | At Risk (30-69) | Inactive (0-29)
 */

import { base44 } from "@/api/base44Client";

const HEALTH_WEIGHTS = {
  last_active_days: 25,    // Recent activity (inverse — fewer days = higher score)
  feedback_count: 15,      // Ideas + feedback submitted
  votes_cast: 10,           // Community participation
  ai_sessions: 20,          // AI coach/simulator usage
  module_usage: 15,         // Feature adoption breadth
  community_engagement: 15, // Posts, comments, connections
};

const HEALTH_THRESHOLDS = {
  healthy: 70,
  at_risk: 30,
};

export const HEALTH_STATUSES = [
  { id: "healthy", label: "Healthy", color: "#10b981", icon: "💚", min: 70 },
  { id: "at_risk", label: "At Risk", color: "#f59e0b", icon: "⚠️", min: 30 },
  { id: "inactive", label: "Inactive", color: "#ef4444", icon: "🔴", min: 0 },
];

export function getHealthStatus(score) {
  return HEALTH_STATUSES.find((s) => score >= s.min) || HEALTH_STATUSES[HEALTH_STATUSES.length - 1];
}

/**
 * Compute the Founder Health Score from a FoundingMember record.
 * Uses denormalized counters on the entity for fast computation.
 */
export function computeHealthScore(fm, profileData) {
  if (!fm) return { score: 0, status: "inactive", breakdown: {} };

  // Activity score: based on profile last active date
  let activityScore = 0;
  if (profileData?.updated_date) {
    const daysSinceActive = (Date.now() - new Date(profileData.updated_date).getTime()) / (24 * 60 * 60 * 1000);
    if (daysSinceActive <= 1) activityScore = 100;
    else if (daysSinceActive <= 7) activityScore = 80;
    else if (daysSinceActive <= 14) activityScore = 60;
    else if (daysSinceActive <= 30) activityScore = 40;
    else if (daysSinceActive <= 60) activityScore = 20;
    else activityScore = 0;
  }

  // Feedback score
  const feedbackCount = (fm.feedback_submitted || 0) + (fm.accepted_suggestions || 0);
  const feedbackScore = Math.min(100, feedbackCount * 20);

  // Votes score
  const votesScore = Math.min(100, (fm.votes_cast || 0) * 10);

  // AI sessions score (using feedback_sessions_attended as proxy)
  const aiScore = Math.min(100, (fm.feedback_sessions_attended || 0) * 25);

  // Module usage score (based on early_access_modules count + other activity)
  const moduleCount = (fm.early_access_modules?.length || 0);
  const moduleScore = Math.min(100, moduleCount * 15 + (fm.community_connections || 0) * 5);

  // Community engagement score
  const communityScore = Math.min(
    100,
    (fm.community_posts || 0) * 10 +
    (fm.community_comments || 0) * 5 +
    (fm.community_connections || 0) * 3
  );

  // Weighted average
  const score = Math.round(
    (activityScore * HEALTH_WEIGHTS.last_active_days +
     feedbackScore * HEALTH_WEIGHTS.feedback_count +
     votesScore * HEALTH_WEIGHTS.votes_cast +
     aiScore * HEALTH_WEIGHTS.ai_sessions +
     moduleScore * HEALTH_WEIGHTS.module_usage +
     communityScore * HEALTH_WEIGHTS.community_engagement) / 100
  );

  return {
    score: Math.min(100, Math.max(0, score)),
    status: getHealthStatus(score).id,
    breakdown: {
      activity: { score: activityScore, weight: HEALTH_WEIGHTS.last_active_days, label: "Recent Activity" },
      feedback: { score: feedbackScore, weight: HEALTH_WEIGHTS.feedback_count, label: "Feedback & Ideas" },
      votes: { score: votesScore, weight: HEALTH_WEIGHTS.votes_cast, label: "Community Votes" },
      ai_sessions: { score: aiScore, weight: HEALTH_WEIGHTS.ai_sessions, label: "AI Sessions" },
      module_usage: { score: moduleScore, weight: HEALTH_WEIGHTS.module_usage, label: "Feature Adoption" },
      community: { score: communityScore, weight: HEALTH_WEIGHTS.community_engagement, label: "Community Engagement" },
    },
  };
}

/**
 * Recommend interventions based on health score.
 */
export function recommendInterventions(fm, healthScore) {
  const interventions = [];

  if (healthScore.status === "inactive") {
    interventions.push({
      priority: "critical",
      action: "Send re-engagement email",
      description: "Founder has been inactive. Send personalized re-engagement with new feature highlights.",
    });
    interventions.push({
      priority: "high",
      action: "Assign success contact",
      description: "Connect the founder with a platform success contact for personal onboarding assistance.",
    });
  }

  if (healthScore.status === "at_risk") {
    interventions.push({
      priority: "medium",
      action: "Send feature spotlight notification",
      description: "Highlight new features and capabilities the founder hasn't explored yet.",
    });
  }

  const breakdown = healthScore.breakdown;
  if (breakdown.feedback.score < 30) {
    interventions.push({
      priority: "low",
      action: "Invite to Product Feedback Center",
      description: "Founder hasn't submitted feedback. Invite them to the feedback center to share ideas.",
    });
  }

  if (breakdown.ai_sessions.score < 30) {
    interventions.push({
      priority: "medium",
      action: "Recommend Executive Coach session",
      description: "Founder hasn't used AI coaching. Suggest a session to showcase the value.",
    });
  }

  if (breakdown.community.score < 30) {
    interventions.push({
      priority: "low",
      action: "Invite to Founder Community",
      description: "Founder has low community engagement. Invite them to the private founder community.",
    });
  }

  return interventions;
}

/**
 * Fetch health score from backend (more accurate, uses real usage data).
 */
export async function fetchHealthScore(userId) {
  try {
    const res = await base44.functions.invoke("manageFoundingProgram", {
      action: "get_health_score",
      user_id: userId,
    });
    return res.data;
  } catch (e) {
    return { score: 0, status: "inactive", breakdown: {} };
  }
}
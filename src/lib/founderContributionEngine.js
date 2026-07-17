/**
 * EXECLEAD.AI — Founder Contribution Score Engine™
 * ============================================================
 * Computes a weighted Founder Contribution Score from:
 * - Bug reports
 * - Ideas submitted
 * - Ideas accepted (planned/in-development/released)
 * - Ideas implemented (released)
 * - Votes cast
 * - Beta feedback sessions
 * - Community engagement
 *
 * The score is 0-100 and determines the contributor tier:
 *   Elite (80+) | Active (50-79) | Contributor (20-49) | New (0-19)
 */

import { base44 } from "@/api/base44Client";

const WEIGHTS = {
  bug_reports: 3,
  ideas_submitted: 5,
  ideas_accepted: 8,
  ideas_implemented: 12,
  votes_cast: 2,
  beta_sessions: 4,
  community_posts: 1,
  feedback_sessions: 3,
};

const SCALE_FACTOR = 0.5;

export const CONTRIBUTOR_TIERS = [
  { min: 80, label: "Elite", color: "#fbbf24", icon: "👑" },
  { min: 50, label: "Active", color: "#6366f1", icon: "🔥" },
  { min: 20, label: "Contributor", color: "#10b981", icon: "⭐" },
  { min: 0, label: "New", color: "#6b7280", icon: "🌱" },
];

export function getTier(score) {
  return CONTRIBUTOR_TIERS.find((t) => score >= t.min) || CONTRIBUTOR_TIERS[CONTRIBUTOR_TIERS.length - 1];
}

/**
 * Compute the Founder Contribution Score for a user.
 * Uses the backend function for accurate data aggregation.
 */
export async function computeContributionScore(userId) {
  try {
    const res = await base44.functions.invoke("manageFoundingProgram", {
      action: "get_contribution_score",
      user_id: userId,
    });
    return res.data;
  } catch (e) {
    return { score: 0, breakdown: {}, tier: "New" };
  }
}

/**
 * Compute a local estimate from a FoundingMember record (for quick display).
 */
export function computeLocalScore(fm) {
  if (!fm) return { score: 0, tier: "New" };
  const raw =
    (fm.feedback_submitted || 0) * WEIGHTS.ideas_submitted +
    (fm.accepted_suggestions || 0) * WEIGHTS.ideas_accepted +
    (fm.implemented_ideas || 0) * WEIGHTS.ideas_implemented +
    (fm.votes_cast || 0) * WEIGHTS.votes_cast +
    (fm.feedback_sessions_attended || 0) * WEIGHTS.feedback_sessions +
    (fm.community_posts || 0) * WEIGHTS.community_posts;
  const score = Math.min(100, Math.round(raw * SCALE_FACTOR));
  return { score, tier: getTier(score).label };
}

export const SCORE_BREAKDOWN_LABELS = {
  bug_reports: { label: "Bug Reports", icon: "🐛", weight: WEIGHTS.bug_reports },
  ideas_submitted: { label: "Ideas Submitted", icon: "💡", weight: WEIGHTS.ideas_submitted },
  ideas_accepted: { label: "Ideas Accepted", icon: "✅", weight: WEIGHTS.ideas_accepted },
  ideas_implemented: { label: "Ideas Implemented", icon: "🚀", weight: WEIGHTS.ideas_implemented },
  votes_cast: { label: "Votes Cast", icon: "🗳️", weight: WEIGHTS.votes_cast },
  beta_sessions: { label: "Beta Sessions", icon: "🎯", weight: WEIGHTS.beta_sessions },
  community_posts: { label: "Community Posts", icon: "💬", weight: WEIGHTS.community_posts },
  feedback_sessions_attended: { label: "Feedback Sessions", icon: "🎙️", weight: WEIGHTS.feedback_sessions },
};
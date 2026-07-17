/**
 * EXECLEAD.AI — Founding Member Lifecycle Engine™
 * ============================================================
 * Manages every founder from application through lifelong membership.
 *
 * Lifecycle Stages:
 *   Application → Screening → Approval → Onboarding → Beta Active →
 *   Contributor → Top Contributor → Executive Advisory Circle™ →
 *   General Availability → Lifetime Founder
 *
 * Every founder record tracks: current_stage, entered_stage_date,
 * time_in_stage, progress_percentage, next_recommended_action
 */

import { base44 } from "@/api/base44Client";

export const LIFECYCLE_STAGES = [
  {
    id: "application",
    label: "Application",
    description: "Founder has submitted a beta application",
    progress: 5,
    next: "screening",
    nextAction: "Complete screening review",
    color: "#6b7280",
  },
  {
    id: "screening",
    label: "Screening",
    description: "Application under review by admin team",
    progress: 15,
    next: "approval",
    nextAction: "Admin reviews and approves application",
    color: "#3b82f6",
  },
  {
    id: "approval",
    label: "Approval",
    description: "Application approved — automated workflow triggered",
    progress: 25,
    next: "onboarding",
    nextAction: "Onboarding workflow executing (badge, pricing, certificate)",
    color: "#8b5cf6",
  },
  {
    id: "onboarding",
    label: "Onboarding",
    description: "Badge assigned, pricing locked, certificate generated",
    progress: 35,
    next: "beta_active",
    nextAction: "Founder activates their account and starts using the platform",
    color: "#a855f7",
  },
  {
    id: "beta_active",
    label: "Beta Active",
    description: "Founder is actively using EXEC™ capabilities",
    progress: 50,
    next: "contributor",
    nextAction: "Submit your first idea or feedback to become a Contributor",
    color: "#6366f1",
  },
  {
    id: "contributor",
    label: "Contributor",
    description: "Founder has submitted ideas, voted, or reported bugs",
    progress: 65,
    next: "top_contributor",
    nextAction: "Increase contribution score to reach Top Contributor status",
    color: "#10b981",
  },
  {
    id: "top_contributor",
    label: "Top Contributor",
    description: "High contribution score — eligible for Advisory Circle",
    progress: 80,
    next: "advisory_council",
    nextAction: "Awaiting Executive Advisory Circle™ invitation",
    color: "#f59e0b",
  },
  {
    id: "advisory_council",
    label: "Executive Advisory Circle™",
    description: "Invited to exclusive advisory with roadmap previews",
    progress: 90,
    next: "general_availability",
    nextAction: "Participate in strategy surveys and prototype reviews",
    color: "#fbbf24",
  },
  {
    id: "general_availability",
    label: "General Availability",
    description: "Platform transitioned to GA — founder status preserved",
    progress: 95,
    next: "lifetime_founder",
    nextAction: "Continue engaging as a lifetime founder",
    color: "#f97316",
  },
  {
    id: "lifetime_founder",
    label: "Lifetime Founder",
    description: "Permanent founder status with all benefits locked for life",
    progress: 100,
    next: null,
    nextAction: "You are a Lifetime Founder — all benefits are permanent",
    color: "#ef4444",
  },
];

export function getStage(stageId) {
  return LIFECYCLE_STAGES.find((s) => s.id === stageId) || LIFECYCLE_STAGES[0];
}

export function getNextStage(stageId) {
  const stage = getStage(stageId);
  if (!stage.next) return null;
  return getStage(stage.next);
}

/**
 * Compute the lifecycle stage a founder SHOULD be in based on their activity.
 * This is the automatic stage determination logic.
 */
export function computeExpectedStage(fm, contributionScore) {
  if (!fm) return "application";

  // If GA transitioned, they're at least in GA stage
  if (fm.ga_transitioned) return "lifetime_founder";

  // Advisory council tier
  if (fm.founding_tier === "advisory_council") return "advisory_council";

  // Top contributor: score >= 50
  if ((contributionScore || fm.health_score || 0) >= 50) return "top_contributor";

  // Contributor: has feedback/votes/ideas
  if (
    (fm.feedback_submitted || 0) > 0 ||
    (fm.votes_cast || 0) > 0 ||
    (fm.accepted_suggestions || 0) > 0 ||
    (fm.implemented_ideas || 0) > 0
  ) {
    return "contributor";
  }

  // Beta active: has badge and beta access
  if (fm.badge_status === "granted" && fm.beta_access) return "beta_active";

  // Onboarding: badge assigned but not yet active
  if (fm.badge_status === "granted") return "onboarding";

  // Approval: status is active but no badge yet
  if (fm.status === "active") return "approval";

  // Screening: pending/verified
  if (fm.status === "pending" || fm.status === "verified") return "screening";

  return "application";
}

/**
 * Get the progress percentage for a founder based on their stage.
 */
export function getProgressPercentage(stageId) {
  return getStage(stageId).progress;
}

/**
 * Get the next recommended action for a founder.
 */
export function getNextRecommendedAction(fm, contributionScore) {
  const stage = getStage(fm?.current_stage || "application");
  if (stage.next) return stage.nextAction;
  return "You are a Lifetime Founder — all benefits are permanent";
}

/**
 * Compute time in current stage (in days).
 */
export function computeTimeInStage(enteredStageDate) {
  if (!enteredStageDate) return 0;
  const diff = Date.now() - new Date(enteredStageDate).getTime();
  return Math.max(0, Math.floor(diff / (24 * 60 * 60 * 1000)));
}

/**
 * Transition a founder to a new lifecycle stage.
 * Calls the backend function which handles stage history, audit logging,
 * and workflow observability.
 */
export async function transitionLifecycleStage(foundingMemberId, newStage, reason) {
  try {
    const res = await base44.functions.invoke("manageFoundingProgram", {
      action: "lifecycle_transition",
      founding_member_id: foundingMemberId,
      new_stage: newStage,
      reason: reason || "Automatic lifecycle progression",
    });
    return res.data;
  } catch (e) {
    return { success: false, error: e.message };
  }
}

/**
 * Get the founder timeline (immutable event log) from audit logs.
 */
export async function getFounderTimeline(foundingMemberId) {
  try {
    const logs = await base44.entities.FoundingMemberAuditLog.filter(
      { founding_member_id: foundingMemberId },
      "-created_date",
      100
    );
    return logs.map((log) => ({
      id: log.id,
      timestamp: log.created_date,
      category: log.action,
      actor: log.performed_by_name || "System",
      description: log.description,
      memberName: log.member_name,
    }));
  } catch (e) {
    return [];
  }
}

/**
 * Format the lifecycle stage for display.
 */
export function formatStage(stageId) {
  return getStage(stageId).label;
}
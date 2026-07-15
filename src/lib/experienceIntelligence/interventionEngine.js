/**
 * Predictive Intervention Engine™
 * ============================================================
 * Detects risk before users ask.
 *
 * The platform acts proactively:
 *   • Momentum declining → Coach changes focus
 *   • Leadership gap widening → Journey reprioritized
 *   • No simulations → Action Center updated
 *   • Learning stalled → Briefing explains why
 */
import { base44 } from "@/api/base44Client";
import { publish } from "./eventBus";

// ============================================================
// INTERVENTION RULES
// ============================================================

const INTERVENTION_RULES = [
  {
    id: "momentum_declining",
    name: "Momentum Declining",
    description: "Career momentum has shifted to declining",
    severity: "high",
    check: (ctx) => ctx.forecast?.momentum === "declining",
    action: {
      module: "coach",
      action: "change_focus",
      message: "Your career momentum is declining. The Coach has been updated to focus on regaining momentum.",
      path: "/coach",
    },
  },
  {
    id: "leadership_gap_widening",
    name: "Leadership Gap Widening",
    description: "Readiness score below 50 with declining momentum",
    severity: "critical",
    check: (ctx) => (ctx.forecast?.readiness_score || 0) < 50 && ctx.forecast?.momentum !== "increasing",
    action: {
      module: "journey",
      action: "reprioritize",
      message: "Your leadership readiness is below target. Your journey has been reprioritized to focus on key gaps.",
      path: "/journey-orchestrator",
    },
  },
  {
    id: "no_simulations",
    name: "No Recent Simulations",
    description: "No executive simulations in the last 14 days",
    severity: "medium",
    check: (ctx) => ctx.daysSinceLastSimulation > 14,
    action: {
      module: "action_center",
      action: "add_recommendation",
      message: "You haven't run a simulation recently. A simulation recommendation has been added to your Action Center.",
      path: "/simulator",
    },
  },
  {
    id: "learning_stalled",
    name: "Learning Stalled",
    description: "No learning activity in the last 7 days",
    severity: "medium",
    check: (ctx) => ctx.daysSinceLastLearning > 7,
    action: {
      module: "briefing",
      action: "explain",
      message: "Your learning has stalled. Your next briefing will explain why and suggest next steps.",
      path: "/academy",
    },
  },
  {
    id: "low_coaching_engagement",
    name: "Low Coaching Engagement",
    description: "No coaching sessions in the last 21 days",
    severity: "low",
    check: (ctx) => ctx.daysSinceLastCoaching > 21,
    action: {
      module: "coach",
      action: "suggest_session",
      message: "It's been a while since your last coaching session. Consider scheduling one.",
      path: "/coach",
    },
  },
  {
    id: "pending_actions_overdue",
    name: "Overdue Actions",
    description: "More than 5 overdue pending actions",
    severity: "high",
    check: (ctx) => ctx.overdueActions > 5,
    action: {
      module: "action_center",
      action: "reschedule",
      message: "You have overdue actions. Consider rescheduling or completing them to maintain momentum.",
      path: "/action-center",
    },
  },
  {
    id: "profile_incomplete",
    name: "Profile Incomplete",
    description: "Executive profile below 60% completion",
    severity: "medium",
    check: (ctx) => ctx.profileCompleteness < 60,
    action: {
      module: "dashboard",
      action: "highlight",
      message: "Your profile is incomplete. Complete it to unlock better recommendations.",
      path: "/profile",
    },
  },
];

// ============================================================
// CONTEXT ASSEMBLY
// ============================================================

async function assembleInterventionContext(userId) {
  const ctx = {
    forecast: null,
    daysSinceLastSimulation: 0,
    daysSinceLastLearning: 0,
    daysSinceLastCoaching: 0,
    overdueActions: 0,
    profileCompleteness: 100,
  };

  if (!userId) return ctx;

  try {
    const now = Date.now();
    const [forecast, actions, learningProgress, coachingActions] = await Promise.all([
      base44.entities.PromotionForecast.filter({ user_id: userId }, "-created_date", 1).catch(() => []),
      base44.entities.ExecutiveAction.filter({ user_id: userId, status: "pending" }, "-created_date", 50).catch(() => []),
      base44.entities.LessonProgress.filter({ user_id: userId }, "-updated_date", 1).catch(() => []),
      base44.entities.ExecutiveAction.filter({ user_id: userId, action_type: "reflection", status: "completed" }, "-completed_date", 1).catch(() => []),
    ]);

    ctx.forecast = forecast && forecast[0] ? forecast[0] : null;

    // Overdue actions
    const today = new Date().toISOString().split("T")[0];
    ctx.overdueActions = (actions || []).filter(
      (a) => a.due_date && a.due_date < today
    ).length;

    // Days since last simulation (from actions)
    const simActions = (actions || []).filter((a) => a.source_module === "simulator");
    if (simActions.length > 0 && simActions[0].completed_date) {
      ctx.daysSinceLastSimulation = Math.floor((now - new Date(simActions[0].completed_date).getTime()) / 86400000);
    } else {
      ctx.daysSinceLastSimulation = 999;
    }

    // Days since last learning
    if (learningProgress && learningProgress[0]?.updated_date) {
      ctx.daysSinceLastLearning = Math.floor((now - new Date(learningProgress[0].updated_date).getTime()) / 86400000);
    } else {
      ctx.daysSinceLastLearning = 999;
    }

    // Days since last coaching (reflection actions)
    if (coachingActions && coachingActions[0]?.completed_date) {
      ctx.daysSinceLastCoaching = Math.floor((now - new Date(coachingActions[0].completed_date).getTime()) / 86400000);
    } else {
      ctx.daysSinceLastCoaching = 999;
    }
  } catch {}

  return ctx;
}

// ============================================================
// INTERVENTION DETECTION
// ============================================================

export async function detectInterventions(userId) {
  const ctx = await assembleInterventionContext(userId);
  const triggered = [];

  for (const rule of INTERVENTION_RULES) {
    try {
      if (rule.check(ctx)) {
        triggered.push({
          ruleId: rule.id,
          name: rule.name,
          description: rule.description,
          severity: rule.severity,
          action: rule.action,
          triggeredAt: new Date().toISOString(),
          context: {
            readiness: ctx.forecast?.readiness_score || 0,
            momentum: ctx.forecast?.momentum || "stable",
            daysSinceLastSimulation: ctx.daysSinceLastSimulation,
            daysSinceLastLearning: ctx.daysSinceLastLearning,
            daysSinceLastCoaching: ctx.daysSinceLastCoaching,
            overdueActions: ctx.overdueActions,
          },
        });
      }
    } catch {}
  }

  return triggered;
}

export async function runInterventionCheck(userId) {
  const interventions = await detectInterventions(userId);
  for (const intervention of interventions) {
    publish("MomentumChanged", {
      userId,
      intervention: intervention.ruleId,
      severity: intervention.severity,
      ...intervention.context,
    });
  }
  return interventions;
}

export function getInterventionRules() {
  return INTERVENTION_RULES;
}

export function getInterventionRuleCount() {
  return INTERVENTION_RULES.length;
}

export function getInterventionStats() {
  return {
    totalRules: INTERVENTION_RULES.length,
    bySeverity: {
      critical: INTERVENTION_RULES.filter((r) => r.severity === "critical").length,
      high: INTERVENTION_RULES.filter((r) => r.severity === "high").length,
      medium: INTERVENTION_RULES.filter((r) => r.severity === "medium").length,
      low: INTERVENTION_RULES.filter((r) => r.severity === "low").length,
    },
  };
}
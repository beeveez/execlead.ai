/**
 * Behavior Analytics™
 * ============================================================
 * Tracks behavior — not page views.
 *
 * Metrics:
 *   • Recommendations Accepted
 *   • Recommendations Ignored
 *   • Actions Completed
 *   • Coaching Frequency
 *   • Learning Consistency
 *   • Simulation Usage
 *   • Promotion Growth
 *   • Journey Progress
 *
 * Determines what actually improves leadership.
 */
import { base44 } from "@/api/base44Client";

const behaviorCache = new Map();
const SESSION_KEY = "exec_behavior_session";

// ============================================================
// BEHAVIOR TRACKING
// ============================================================

function getSessionData() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : { events: [], startTime: Date.now() };
  } catch {
    return { events: [], startTime: Date.now() };
  }
}

function saveSessionData(data) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
  } catch {}
}

export function trackBehavior(event, properties = {}) {
  const session = getSessionData();
  session.events.push({
    event,
    timestamp: new Date().toISOString(),
    properties,
  });
  // Cap session events
  if (session.events.length > 200) {
    session.events = session.events.slice(-200);
  }
  saveSessionData(session);

  // Also track via analytics
  try {
    base44.analytics.track({
      eventName: `behavior_${event}`,
      properties,
    });
  } catch {}
}

export function trackRecommendationShown(recommendationId, type) {
  trackBehavior("recommendation_shown", { recommendationId, type });
}

export function trackRecommendationAccepted(recommendationId, type) {
  trackBehavior("recommendation_accepted", { recommendationId, type });
}

export function trackRecommendationIgnored(recommendationId, type) {
  trackBehavior("recommendation_ignored", { recommendationId, type });
}

export function trackActionCompleted(actionId, actionType) {
  trackBehavior("action_completed", { actionId, actionType });
}

export function trackCoachingSession(durationMinutes) {
  trackBehavior("coaching_session", { durationMinutes });
}

export function trackLearningActivity(courseId, lessonId) {
  trackBehavior("learning_activity", { courseId, lessonId });
}

export function trackSimulationRun(scenarioId) {
  trackBehavior("simulation_run", { scenarioId });
}

// ============================================================
// BEHAVIOR ANALYTICS
// ============================================================

export function getSessionBehavior() {
  const session = getSessionData();
  const events = session.events;

  const recommendationsShown = events.filter((e) => e.event === "recommendation_shown").length;
  const recommendationsAccepted = events.filter((e) => e.event === "recommendation_accepted").length;
  const recommendationsIgnored = events.filter((e) => e.event === "recommendation_ignored").length;
  const actionsCompleted = events.filter((e) => e.event === "action_completed").length;
  const coachingSessions = events.filter((e) => e.event === "coaching_session").length;
  const learningActivities = events.filter((e) => e.event === "learning_activity").length;
  const simulationRuns = events.filter((e) => e.event === "simulation_run").length;

  const acceptanceRate = recommendationsShown > 0
    ? Math.round((recommendationsAccepted / recommendationsShown) * 100)
    : 0;

  return {
    sessionDuration: Date.now() - session.startTime,
    totalEvents: events.length,
    recommendationsShown,
    recommendationsAccepted,
    recommendationsIgnored,
    acceptanceRate,
    actionsCompleted,
    coachingSessions,
    learningActivities,
    simulationRuns,
  };
}

export async function getBehaviorInsights(userId) {
  if (!userId) return null;
  if (behaviorCache.has(userId)) return behaviorCache.get(userId);

  try {
    // Fetch recent actions to understand patterns
    const actions = await base44.entities.ExecutiveAction.filter(
      { user_id: userId },
      "-created_date",
      100
    );

    const completed = actions.filter((a) => a.status === "completed");
    const pending = actions.filter((a) => a.status === "pending");
    const skipped = actions.filter((a) => a.status === "skipped");

    // Action type distribution
    const typeCounts = {};
    completed.forEach((a) => {
      typeCounts[a.action_type] = (typeCounts[a.action_type] || 0) + 1;
    });

    // Completion rate
    const completionRate = actions.length > 0
      ? Math.round((completed.length / actions.length) * 100)
      : 0;

    // Skip rate
    const skipRate = actions.length > 0
      ? Math.round((skipped.length / actions.length) * 100)
      : 0;

    // Coaching frequency (actions with source_module "coach")
    const coachingActions = completed.filter((a) => a.source_module === "coach" || a.ai_generated);
    const coachingFrequency = coachingActions.length;

    // Learning consistency (completed learning actions over time)
    const learningActions = completed.filter((a) => a.action_type === "learning");
    const learningConsistency = learningActions.length;

    const insights = {
      totalActions: actions.length,
      completedActions: completed.length,
      pendingActions: pending.length,
      skippedActions: skipped.length,
      completionRate,
      skipRate,
      coachingFrequency,
      learningConsistency,
      simulationUsage: typeCounts.simulation || 0,
      typeDistribution: typeCounts,
      mostFrequentType: Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null,
    };

    behaviorCache.set(userId, insights);
    return insights;
  } catch {
    return {
      totalActions: 0,
      completedActions: 0,
      pendingActions: 0,
      skippedActions: 0,
      completionRate: 0,
      skipRate: 0,
      coachingFrequency: 0,
      learningConsistency: 0,
      simulationUsage: 0,
      typeDistribution: {},
      mostFrequentType: null,
    };
  }
}

export function clearBehaviorCache(userId) {
  if (userId) {
    behaviorCache.delete(userId);
  } else {
    behaviorCache.clear();
  }
}
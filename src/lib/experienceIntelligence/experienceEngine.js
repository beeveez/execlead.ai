/**
 * Experience Engine™
 * ============================================================
 * Central orchestration engine for the Executive Operating System.
 *
 * Coordinates every executive experience by determining:
 *   • Current Context
 *   • Current Goal
 *   • Current Journey
 *   • Current Priority
 *   • Current Operating Mode
 *
 * Exposes:
 *   • getCurrentExperience()
 *   • getNextExperience()
 *   • getExperienceContext()
 *
 * This is NOT another workspace. It is an orchestration layer
 * that sits between Executive Experiences and Executive Intelligence™.
 */
import { base44 } from "@/api/base44Client";
import { getExperienceByPath } from "./experienceRegistry";
import { resolveAdaptiveMode, getAdaptiveMode } from "./adaptiveExperience";
import { getAllRecommendations } from "./recommendationEngine";
import { loadExecutiveMemory, getMemoryUtilization } from "./executiveMemory";
import { getBehaviorInsights, getSessionBehavior } from "./behaviorAnalytics";
import { getNotificationQueue } from "./notificationEngine";
import { detectInterventions } from "./interventionEngine";
import { getRhythmForToday } from "./operatingRhythm";
import { getSynchronizationHealth } from "./eventBus";
import { getGraphHealth } from "./intelligenceGraph";

let currentContext = null;
let contextTimestamp = 0;
const CONTEXT_TTL = 30000; // 30 seconds

// ============================================================
// CURRENT EXPERIENCE
// ============================================================

export function getCurrentExperience(pathname) {
  return getExperienceByPath(pathname);
}

// ============================================================
// EXPERIENCE CONTEXT
// ============================================================

export async function getExperienceContext(user, pathname = "/dashboard") {
  if (!user) return null;

  const now = Date.now();
  if (currentContext && now - contextTimestamp < CONTEXT_TTL) {
    return currentContext;
  }

  const experience = getCurrentExperience(pathname);
  const adaptiveMode = resolveAdaptiveMode(user, user, null);
  const recommendations = await getAllRecommendations(user, pathname);
  const memory = await loadExecutiveMemory(user.id);
  const memoryUtil = await getMemoryUtilization(user.id);
  const behaviorInsights = await getBehaviorInsights(user.id);
  const sessionBehavior = getSessionBehavior();
  const notifications = await getNotificationQueue(user.id);
  const interventions = await detectInterventions(user.id);
  const rhythm = getRhythmForToday();

  const ctx = {
    user,
    pathname,
    experience,
    adaptiveMode: getAdaptiveMode(adaptiveMode),
    recommendations,
    memory,
    memoryUtilization: memoryUtil,
    behaviorInsights,
    sessionBehavior,
    notifications,
    interventions,
    rhythm,
    assembledAt: new Date().toISOString(),
  };

  currentContext = ctx;
  contextTimestamp = now;

  return ctx;
}

// ============================================================
// NEXT EXPERIENCE
// ============================================================

export async function getNextExperience(user, pathname = "/dashboard") {
  const ctx = await getExperienceContext(user, pathname);
  if (!ctx) return null;

  // Priority 1: If there are interventions, route to the intervention target
  if (ctx.interventions && ctx.interventions.length > 0) {
    const critical = ctx.interventions.find((i) => i.severity === "critical");
    const target = critical || ctx.interventions[0];
    return {
      reason: "intervention_triggered",
      priority: target.severity,
      experience: target.action.module,
      path: target.action.path,
      message: target.action.message,
    };
  }

  // Priority 2: Next Best Action from recommendation engine
  if (ctx.recommendations?.nextBestAction) {
    return {
      reason: "next_best_action",
      priority: ctx.recommendations.nextBestAction.priority,
      experience: ctx.recommendations.nextBestAction.type,
      path: ctx.recommendations.nextBestAction.path,
      message: ctx.recommendations.nextBestAction.title,
    };
  }

  // Priority 3: Adaptive mode priority modules
  const priorityModules = ctx.adaptiveMode?.priorityModules || [];
  if (priorityModules.length > 0) {
    const fromRegistry = getExperienceByPath(`/${priorityModules[0]}`);
    return {
      reason: "adaptive_priority",
      priority: "medium",
      experience: priorityModules[0],
      path: fromRegistry?.path || `/${priorityModules[0]}`,
      message: ctx.adaptiveMode.description,
    };
  }

  // Default: dashboard
  return {
    reason: "default",
    priority: "low",
    experience: "dashboard",
    path: "/dashboard",
    message: "Review your executive dashboard",
  };
}

// ============================================================
// EXPERIENCE HEALTH
// ============================================================

export async function getExperienceHealth(user) {
  const syncHealth = getSynchronizationHealth();
  const graphHealth = getGraphHealth();
  const memoryUtil = user?.id ? await getMemoryUtilization(user.id) : { score: 0 };
  const behaviorInsights = user?.id ? await getBehaviorInsights(user.id) : { completionRate: 0 };
  const interventions = user?.id ? await detectInterventions(user.id) : [];

  const recommendations = await getAllRecommendations(user, "/dashboard");
  const notificationQueue = user?.id ? await getNotificationQueue(user.id) : { pending: 0 };

  const overallHealth = Math.round(
    (syncHealth.syncCoverage +
      graphHealth.healthScore +
      memoryUtil.score +
      behaviorInsights.completionRate +
      (interventions.length === 0 ? 100 : Math.max(0, 100 - interventions.length * 15))) / 5
  );

  return {
    overallHealth,
    experienceHealth: graphHealth.healthScore,
    synchronizationHealth: syncHealth.syncCoverage,
    eventsToday: syncHealth.eventsToday,
    recommendationsGenerated: recommendations.all?.length || 0,
    recommendationsAccepted: behaviorInsights.completionRate,
    memoryUtilization: memoryUtil.score,
    behaviorInsights: {
      completionRate: behaviorInsights.completionRate,
      coachingFrequency: behaviorInsights.coachingFrequency,
      learningConsistency: behaviorInsights.learningConsistency,
      simulationUsage: behaviorInsights.simulationUsage,
    },
    notificationQueue: notificationQueue.pending,
    interventionsTriggered: interventions.length,
    interventions,
    operatingRhythmCompliance: 0, // Calculated from session tracking
    graphHealth,
    syncHealth,
  };
}

// ============================================================
// CONTEXT CACHE MANAGEMENT
// ============================================================

export function clearContextCache() {
  currentContext = null;
  contextTimestamp = 0;
}

export function getCurrentContextSync() {
  return currentContext;
}
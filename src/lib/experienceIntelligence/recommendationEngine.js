/**
 * Recommendation Engine™
 * ============================================================
 * Single source of truth for ALL recommendations.
 *
 * Every recommendation in the platform originates here.
 * No module generates recommendations independently.
 *
 * Consumers:
 *   Dashboard, Action Center, Executive Coach, Journey,
 *   Briefing, Promotion Forecast, Enterprise, Operations
 *
 * Produces:
 *   • Next Best Action™
 *   • Next Best Learning™
 *   • Next Best Coaching™
 *   • Next Best Simulation™
 *   • Next Best Reflection™
 */
import { base44 } from "@/api/base44Client";
import { generateContextualActions } from "@/lib/contextualActionEngine";
import { trackRecommendationShown } from "./behaviorAnalytics";
import { getAdaptiveMode, getPriorityModules } from "./adaptiveExperience";
import { getExperienceById } from "./experienceRegistry";
import {
  resolveExperienceProfile,
  getProfileMissions,
  getProfileObjectives,
  getProfileUpgrades,
  getProfileAIRecommendations,
  getProfileNextBestAction,
} from "./experienceProfiles";

let recommendationCache = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60000; // 1 minute

// ============================================================
// RECOMMENDATION TYPES
// ============================================================

export const RECOMMENDATION_TYPES = {
  action: { id: "action", label: "Next Best Action™", icon: "Zap" },
  learning: { id: "learning", label: "Next Best Learning™", icon: "BookOpen" },
  coaching: { id: "coaching", label: "Next Best Coaching™", icon: "MessageSquare" },
  simulation: { id: "simulation", label: "Next Best Simulation™", icon: "Brain" },
  reflection: { id: "reflection", label: "Next Best Reflection™", icon: "PenLine" },
};

// ============================================================
// CONTEXT ASSEMBLY
// ============================================================

async function assembleContext(user, pathname, experienceProfile) {
  const ctx = { user, pathname, profile: null, experienceProfile: null, actions: [], forecast: null };

  try {
    const [actions, forecast] = await Promise.all([
      base44.entities.ExecutiveAction.filter(
        { user_id: user.id, status: "pending" },
        "-created_date",
        20
      ).catch(() => []),
      base44.entities.PromotionForecast.filter(
        { user_id: user.id },
        "-created_date",
        1
      ).catch(() => []),
    ]);
    ctx.actions = actions || [];
    ctx.forecast = forecast && forecast[0] ? forecast[0] : null;
    ctx.profile = user;
    ctx.experienceProfile = experienceProfile || resolveExperienceProfile(user, user, null);
  } catch {}

  return ctx;
}

// ============================================================
// RECOMMENDATION GENERATORS
// ============================================================

function generateNextBestAction(ctx) {
  const pendingActions = ctx.actions || [];
  const profileAction = ctx.experienceProfile ? getProfileNextBestAction(ctx.experienceProfile.id) : null;

  // No pending actions — fall back to the Experience Profile's default Next Best Action™
  if (pendingActions.length === 0) {
    if (profileAction) {
      return {
        type: "action",
        id: `profile_${ctx.experienceProfile.id}_nba`,
        title: profileAction.title,
        description: profileAction.description || "",
        path: profileAction.path,
        priority: profileAction.priority,
        estimatedMinutes: profileAction.estimatedMinutes || 15,
        impactScore: 0,
        source: "experience_profile",
      };
    }
    return null;
  }

  // Sort by priority
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  const sorted = [...pendingActions].sort(
    (a, b) => (priorityOrder[a.priority] || 3) - (priorityOrder[b.priority] || 3)
  );

  const top = sorted[0];
  return {
    type: "action",
    id: top.id,
    title: top.title,
    description: top.description || "",
    path: top.source_path || "/action-center",
    priority: top.priority,
    estimatedMinutes: top.estimated_minutes || 15,
    impactScore: top.impact_score || 0,
    source: "recommendation_engine",
  };
}

function generateNextBestLearning(ctx) {
  // Check if there are pending learning actions
  const learningActions = (ctx.actions || []).filter((a) => a.action_type === "learning");
  if (learningActions.length > 0) {
    const top = learningActions[0];
    return {
      type: "learning",
      id: top.id,
      title: top.title,
      description: top.description || "",
      path: top.source_path || "/academy",
      priority: top.priority,
      estimatedMinutes: top.estimated_minutes || 30,
      source: "recommendation_engine",
    };
  }

  // Default: suggest academy
  return {
    type: "learning",
    id: "default_academy",
    title: "Continue Learning Path",
    description: "Pick up where you left off in the Executive Academy",
    path: "/academy",
    priority: "medium",
    estimatedMinutes: 30,
    source: "recommendation_engine",
  };
}

function generateNextBestCoaching(ctx) {
  return {
    type: "coaching",
    id: "default_coach",
    title: "Start Coaching Session",
    description: "Get personalized executive coaching tailored to your current goals",
    path: "/coach",
    priority: "medium",
    estimatedMinutes: 15,
    source: "recommendation_engine",
  };
}

function generateNextBestSimulation(ctx) {
  return {
    type: "simulation",
    id: "default_simulator",
    title: "Run Executive Simulation",
    description: "Practice a leadership scenario to build readiness",
    path: "/simulator",
    priority: "medium",
    estimatedMinutes: 20,
    source: "recommendation_engine",
  };
}

function generateNextBestReflection(ctx) {
  return {
    type: "reflection",
    id: "default_journal",
    title: "Reflect on Your Week",
    description: "Journal your leadership reflections and insights",
    path: "/journal",
    priority: "low",
    estimatedMinutes: 10,
    source: "recommendation_engine",
  };
}

// ============================================================
// ADAPTIVE PRIORITIZATION
// ============================================================

function prioritizeByMode(recommendations, modeId) {
  const priorityModules = getPriorityModules(modeId);
  // Boost recommendations whose path matches priority modules
  return recommendations.map((rec) => {
    const experience = getExperienceById(rec.id) || {};
    const moduleMatch = priorityModules.some((pm) => rec.path?.includes(pm));
    return {
      ...rec,
      boosted: moduleMatch,
      adaptivePriority: moduleMatch ? rec.priority : `${rec.priority}_neutral`,
    };
  });
}

// ============================================================
// MAIN API
// ============================================================

export async function getAllRecommendations(user, pathname = "/dashboard", experienceProfile) {
  if (!user) return emptyRecommendations();

  // Cache check
  const now = Date.now();
  if (recommendationCache && now - cacheTimestamp < CACHE_TTL) {
    return recommendationCache;
  }

  const ctx = await assembleContext(user, pathname, experienceProfile);
  const mode = resolveMode(user);

  const recommendations = {
    nextBestAction: generateNextBestAction(ctx),
    nextBestLearning: generateNextBestLearning(ctx),
    nextBestCoaching: generateNextBestCoaching(ctx),
    nextBestSimulation: generateNextBestSimulation(ctx),
    nextBestReflection: generateNextBestReflection(ctx),
    adaptiveMode: mode,
    experienceProfile: ctx.experienceProfile,
    dailyMissions: ctx.experienceProfile ? getProfileMissions(ctx.experienceProfile.id) : [],
    weeklyObjectives: ctx.experienceProfile ? getProfileObjectives(ctx.experienceProfile.id) : [],
    aiRecommendations: ctx.experienceProfile ? getProfileAIRecommendations(ctx.experienceProfile.id) : [],
    upgradeOpportunities: ctx.experienceProfile ? getProfileUpgrades(ctx.experienceProfile.id) : [],
    generatedAt: new Date().toISOString(),
  };

  // Apply adaptive prioritization
  const allRecs = [
    recommendations.nextBestAction,
    recommendations.nextBestLearning,
    recommendations.nextBestCoaching,
    recommendations.nextBestSimulation,
    recommendations.nextBestReflection,
  ].filter(Boolean);

  recommendations.all = prioritizeByMode(allRecs, mode);

  // Track that recommendations were shown
  allRecs.forEach((rec) => trackRecommendationShown(rec.id, rec.type));

  recommendationCache = recommendations;
  cacheTimestamp = now;

  return recommendations;
}

function resolveMode(user) {
  if (!user) return "new_user";
  return getAdaptiveMode("returning_executive").id;
}

export async function getNextBestAction(user, pathname) {
  const recs = await getAllRecommendations(user, pathname);
  return recs.nextBestAction;
}

export async function getNextBestLearning(user, pathname) {
  const recs = await getAllRecommendations(user, pathname);
  return recs.nextBestLearning;
}

export function getDashboardContextualActions(pathname, userContext, dashboardData) {
  return generateContextualActions({ pathname, userContext, dashboardData });
}

export function clearRecommendationCache() {
  recommendationCache = null;
  cacheTimestamp = 0;
}

// ============================================================
// EXPERIENCE PROFILE ACCESSORS
// ============================================================

export function getDailyMissions(profileId) {
  return getProfileMissions(profileId);
}

export function getWeeklyObjectives(profileId) {
  return getProfileObjectives(profileId);
}

export function getUpgradeOpportunities(profileId) {
  return getProfileUpgrades(profileId);
}

export function getAIRecommendations(profileId) {
  return getProfileAIRecommendations(profileId);
}

function emptyRecommendations() {
  return {
    nextBestAction: null,
    nextBestLearning: null,
    nextBestCoaching: null,
    nextBestSimulation: null,
    nextBestReflection: null,
    all: [],
    adaptiveMode: "new_user",
    experienceProfile: null,
    dailyMissions: [],
    weeklyObjectives: [],
    aiRecommendations: [],
    upgradeOpportunities: [],
    generatedAt: new Date().toISOString(),
  };
}

// ============================================================
// ANALYTICS
// ============================================================

export function getRecommendationStats() {
  return {
    cacheActive: recommendationCache !== null,
    cacheAge: cacheTimestamp > 0 ? Date.now() - cacheTimestamp : 0,
    types: Object.keys(RECOMMENDATION_TYPES),
  };
}
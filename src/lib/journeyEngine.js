/**
 * EXECLEAD.AI — Executive Journey Engine™ (Frontend)
 * -------------------------------------------------
 * All constants are imported from platformConfig.js (single source of truth).
 * This file provides backward-compatible exports for existing components.
 *
 * The actual computation happens in the recomputeIntelligence backend function.
 * This module is purely display metadata + helper functions.
 */
import { PLATFORM_CONFIG } from "./platformConfig";

export { JOURNEY_STAGES, getJourneyStage } from "./brandExperience";

// Re-export from platformConfig for backward compatibility
export const POINTS_CONFIG = PLATFORM_CONFIG.points;
export const JOURNEY_LEVELS = PLATFORM_CONFIG.levels;
export const ACHIEVEMENTS = PLATFORM_CONFIG.achievements;
export const STREAK_CATEGORIES = PLATFORM_CONFIG.streakCategories;
export const TIMELINE_RANGES = PLATFORM_CONFIG.timelineRanges;
export const CAREER_SKILL_MAP = PLATFORM_CONFIG.careerSkillMap;

/**
 * Journey Levels — re-exported from platformConfig.
 * To change levels, update platformConfig.js (and manageConfig backend function).
 */
export function getLevelFromPoints(points) {
  const levels = PLATFORM_CONFIG.levels;
  let current = levels[0];
  let next = null;
  for (let i = 0; i < levels.length; i++) {
    if (points >= levels[i].points) {
      current = levels[i];
      next = levels[i + 1] || null;
    }
  }
  const progress = next
    ? Math.round(((points - current.points) / (next.points - current.points)) * 100)
    : 100;
  const journeyPercent = Math.round(
    (levels.indexOf(current) / (levels.length - 1)) * 100
  );
  return { current, next, progress, journeyPercent, pointsToNext: next ? next.points - points : 0 };
}

/**
 * Merge backend achievement status with frontend definitions.
 */
export function mergeAchievements(unlockedList = []) {
  const unlockedMap = new Map(unlockedList.map((a) => [a.id, a]));
  return PLATFORM_CONFIG.achievements.map((a) => ({
    ...a,
    unlocked: unlockedMap.get(a.id)?.unlocked || false,
    unlocked_date: unlockedMap.get(a.id)?.unlocked_date || null,
  }));
}
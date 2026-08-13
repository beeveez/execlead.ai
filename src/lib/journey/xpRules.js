import { PLATFORM_CONFIG } from "@/lib/platformConfig";

export const XP_RULES = {
  leadershipDNA: 250,
  executiveSimulation: 180,
  dailyMission: 40,
  promotionReadiness: 300,
  learningModule: 75,
  executiveDebate: 120,
  weeklyReflection: 25,
};

export const READINESS_LEVELS = [
  "Emerging Leader",
  "Operational Leader",
  "Strategic Leader",
  "Enterprise Leader",
  "Executive Candidate",
  "Executive Ready",
  "Transformational Executive",
  "Legacy Leader",
];

const userXp = (user) => user?.journeyPoints ?? user?.journey_points ?? user?.xp_points;

export function deriveReadiness(user, journey) {
  const persistedXp = userXp(user);
  const journeyXp = journey?.totalPoints ?? persistedXp ?? 0;
  const isUncalibrated = user?.readiness_calibrated === false && user?.onboarding_completed !== true && journeyXp === 0;
  if (isUncalibrated) return { xp: 0, level: 0, title: "Not Calibrated", nextLevelXp: 500, progressPercent: 0, nextMilestone: "Emerging Leader" };
  const xp = journey?.totalPoints ?? persistedXp ?? 1600;
  const engineCurrent = journey?.level?.current;
  const engineNext = journey?.level?.next;
  const engineIndex = PLATFORM_CONFIG.levels.findIndex((level) => level.id === engineCurrent?.id);
  const fallbackIndex = persistedXp == null ? 2 : Math.max(0, PLATFORM_CONFIG.levels.findLastIndex((level) => xp >= level.points));
  const levelIndex = engineIndex >= 0 ? engineIndex : fallbackIndex;
  const nextLevelXp = engineNext?.points ?? (persistedXp == null && !journey ? 3699 : PLATFORM_CONFIG.levels[levelIndex + 1]?.points) ?? xp;
  const progressPercent = nextLevelXp > 0 ? Math.min(100, Math.round((xp / nextLevelXp) * 100)) : 100;
  const title = READINESS_LEVELS[levelIndex] || READINESS_LEVELS[0];
  const nextTitle = READINESS_LEVELS[levelIndex + 1];

  return {
    xp,
    level: levelIndex + 1,
    title,
    nextLevelXp,
    progressPercent,
    nextMilestone: nextTitle || "Leadership Legacy Sustained",
  };
}
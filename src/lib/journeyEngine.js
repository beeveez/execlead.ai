/**
 * EXECLEAD.AI — Executive Journey Engine™
 * ---------------------------------------
 * Centralized progression system. Every module contributes Journey Points
 * toward one continuous Executive Journey.
 *
 * This is the frontend config/metadata layer. The actual computation
 * (counting activities across entities) happens in the manageJourney
 * backend function, which returns the data these components render.
 */

export { JOURNEY_STAGES, getJourneyStage } from "./brandExperience";

/**
 * Journey Points awarded per activity — single source of truth for display.
 * Must match the backend function's POINTS config.
 */
export const POINTS_CONFIG = {
  leadership_dna: { points: 500, label: "Complete Leadership DNA™", icon: "🧬", category: "learning" },
  letter_published: { points: 250, label: "Publish Leadership Letter", icon: "✍️", category: "publishing" },
  simulation_completed: { points: 300, label: "Complete Executive Simulation", icon: "🎯", category: "leadership" },
  academy_module: { points: 150, label: "Complete Academy Module", icon: "📚", category: "learning" },
  challenge_completed: { points: 50, label: "Complete Executive Challenge", icon: "⚔️", category: "leadership" },
  identity_verified: { points: 200, label: "Identity Verified", icon: "✅", category: "verification" },
  professional_verification: { points: 200, label: "Professional Verification", icon: "🏅", category: "verification" },
  reputation_milestone: { points: 100, label: "Executive Reputation Milestone", icon: "⭐", category: "reputation" },
  mentorship: { points: 300, label: "Mentor Someone", icon: "🤝", category: "mentorship" },
  resume_completed: { points: 100, label: "Complete Resume", icon: "📄", category: "career" },
  weekly_streak: { points: 25, label: "Weekly Login Streak", icon: "🔥", category: "streak" },
  community_recognition: { points: 50, label: "Community Recognition", icon: "🏆", category: "community" },
};

/**
 * Journey Levels — 8 stages from Seed to Legacy Leader.
 */
export const JOURNEY_LEVELS = [
  { id: "seed", title: "Seed", points: 0, icon: "🌱" },
  { id: "emerging", title: "Emerging Leader", points: 500, icon: "🌿" },
  { id: "manager", title: "People Manager", points: 2000, icon: "👥" },
  { id: "senior", title: "Senior Leader", points: 5000, icon: "🎯" },
  { id: "executive", title: "Executive", points: 10000, icon: "🏆" },
  { id: "enterprise", title: "Enterprise Leader", points: 20000, icon: "⚡" },
  { id: "board", title: "Board Ready", points: 35000, icon: "👑" },
  { id: "legacy", title: "Legacy Leader", points: 50000, icon: "💎" },
];

export function getLevelFromPoints(points) {
  let current = JOURNEY_LEVELS[0];
  let next = null;
  for (let i = 0; i < JOURNEY_LEVELS.length; i++) {
    if (points >= JOURNEY_LEVELS[i].points) {
      current = JOURNEY_LEVELS[i];
      next = JOURNEY_LEVELS[i + 1] || null;
    }
  }
  const progress = next
    ? Math.round(((points - current.points) / (next.points - current.points)) * 100)
    : 100;
  const journeyPercent = Math.round(
    (JOURNEY_LEVELS.indexOf(current) / (JOURNEY_LEVELS.length - 1)) * 100
  );
  return { current, next, progress, journeyPercent, pointsToNext: next ? next.points - points : 0 };
}

/**
 * Executive Achievements — every milestone unlocks a badge.
 * The backend checks conditions and returns { id, unlocked }.
 * The frontend maps to these definitions for display.
 */
export const ACHIEVEMENTS = [
  { id: "first_leadership_dna", name: "First Leadership DNA", description: "Complete your Leadership DNA™ assessment", icon: "🧬", points: 500 },
  { id: "first_letter", name: "First Leadership Letter", description: "Publish your first Leadership Letter", icon: "✍️", points: 250 },
  { id: "first_mentorship", name: "First Mentorship", description: "Mentor your first leader", icon: "🤝", points: 300 },
  { id: "reputation_100", name: "100 Reputation", description: "Reach 100 Executive Reputation", icon: "⭐", points: 100 },
  { id: "identity_verified", name: "Identity Verified", description: "Verify your executive identity", icon: "✅", points: 200 },
  { id: "executive_contributor", name: "Executive Contributor", description: "Reach Executive level", icon: "🏆", points: 0 },
  { id: "leadership_fellow", name: "Leadership Fellow", description: "Reach Enterprise Leader level", icon: "⚡", points: 0 },
  { id: "legacy_builder", name: "Legacy Builder", description: "Reach Legacy Leader level", icon: "💎", points: 0 },
  { id: "scholar", name: "Scholar", description: "Complete 5 Academy modules", icon: "📚", points: 0 },
  { id: "simulation_master", name: "Simulation Master", description: "Complete 3 executive simulations", icon: "🎯", points: 0 },
  { id: "challenger", name: "Challenger", description: "Complete 10 executive challenges", icon: "⚔️", points: 0 },
  { id: "streak_warrior", name: "Streak Warrior", description: "Maintain a 4-week streak", icon: "🔥", points: 0 },
];

/**
 * Journey Streak Categories — reward consistency across activity types.
 */
export const STREAK_CATEGORIES = [
  { id: "learning", label: "Learning Streak", icon: "📚", description: "Consecutive weeks completing Academy modules" },
  { id: "publishing", label: "Publishing Streak", icon: "✍️", description: "Consecutive weeks publishing Leadership Letters" },
  { id: "leadership", label: "Leadership Streak", icon: "🎯", description: "Consecutive weeks completing challenges & simulations" },
  { id: "community", label: "Community Streak", icon: "🏆", description: "Consecutive weeks contributing to the community" },
  { id: "mentorship", label: "Mentorship Streak", icon: "🤝", description: "Consecutive weeks mentoring leaders" },
];

/**
 * Timeline filter ranges.
 */
export const TIMELINE_RANGES = [
  { id: "30d", label: "30 Days" },
  { id: "90d", label: "90 Days" },
  { id: "year", label: "Year" },
  { id: "lifetime", label: "Lifetime" },
];

/**
 * Merge backend achievement status with frontend definitions.
 */
export function mergeAchievements(unlockedList = []) {
  const unlockedMap = new Map(unlockedList.map((a) => [a.id, a]));
  return ACHIEVEMENTS.map((a) => ({
    ...a,
    unlocked: unlockedMap.get(a.id)?.unlocked || false,
    unlocked_date: unlockedMap.get(a.id)?.unlocked_date || null,
  }));
}

/**
 * Career Impact — map journey level to recommended skills.
 */
export const CAREER_SKILL_MAP = {
  seed: ["Communication", "Critical Thinking", "Ownership"],
  emerging: ["Influencing Without Authority", "Executive Communication", "Decision Making"],
  manager: ["People Leadership", "Performance Management", "Coaching Skills"],
  senior: ["Strategic Thinking", "Commercial Awareness", "Cross-functional Leadership"],
  executive: ["Executive Presence", "Board Communication", "Financial Acumen"],
  enterprise: ["Enterprise Leadership", "Organizational Design", "M&A Strategy"],
  board: ["Governance", "Risk Management", "Stakeholder Management"],
  legacy: ["Thought Leadership", "Legacy Building", "Succession Planning"],
};
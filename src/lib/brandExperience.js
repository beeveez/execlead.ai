/**
 * EXECLEAD.AI Brand Experience System
 * -----------------------------------
 * The central source of truth for the brand philosophy:
 * "One Leadership Journey. One AI Platform."
 *
 * Every module reinforces that leadership is a continuous journey.
 */

export const BRAND = {
  promise: "Become the Executive Every Company Wants to Hire.",
  philosophy: "One Leadership Journey. One AI Platform.",
  foundation: "Strategy. Success. Scale.",
  identity: "The Executive Leadership Operating System.",
};

/**
 * The Executive Journey — 8 stages from Seed to Legacy Leader.
 * Mapped to XP thresholds so progress is always meaningful.
 */
export const JOURNEY_STAGES = [
  { id: "seed", title: "Seed", xp: 0, icon: "🌱" },
  { id: "emerging", title: "Emerging Leader", xp: 100, icon: "🌿" },
  { id: "manager", title: "People Manager", xp: 300, icon: "👥" },
  { id: "senior", title: "Senior Leader", xp: 600, icon: "🎯" },
  { id: "executive", title: "Executive", xp: 1000, icon: "🏆" },
  { id: "enterprise", title: "Enterprise Leader", xp: 2200, icon: "⚡" },
  { id: "board", title: "Board Ready", xp: 4000, icon: "👑" },
  { id: "legacy", title: "Legacy Leader", xp: 5500, icon: "💎" },
];

/**
 * Get the user's current journey stage and progress to the next.
 */
export function getJourneyStage(xp) {
  let current = JOURNEY_STAGES[0];
  let next = null;
  for (let i = 0; i < JOURNEY_STAGES.length; i++) {
    if (xp >= JOURNEY_STAGES[i].xp) {
      current = JOURNEY_STAGES[i];
      next = JOURNEY_STAGES[i + 1] || null;
    }
  }
  const progress = next
    ? Math.round(((xp - current.xp) / (next.xp - current.xp)) * 100)
    : 100;
  return { current, next, progress, journeyPercent: Math.round((JOURNEY_STAGES.indexOf(current) / (JOURNEY_STAGES.length - 1)) * 100) };
}

/**
 * Module-specific brand messages — each reinforces the journey philosophy.
 */
export const MODULE_MESSAGES = {
  dashboard: {
    tagline: "One Leadership Journey. One AI Platform.",
    subtext: "Every session strengthens your executive capabilities.",
  },
  "leadership-dna": {
    title: "Your Executive Journey",
    subtext: "Leadership is a lifelong journey. See where you are and what's next.",
  },
  "career-studio": {
    title: "Your next opportunity is another step in your leadership journey.",
    subtext: "Build a career intentionally, not accidentally. Every role prepares you for greater leadership.",
  },
  reputation: {
    title: "Executive reputation is earned over time.",
    subtext: "Every verified achievement, leadership contribution, published insight, and professional interaction strengthens your long-term credibility.",
  },
  "legacy-library": {
    title: "Your Leadership Legacy",
    subtext: "One day your experience becomes someone else's leadership advantage. Preserve the lessons that future leaders will learn from.",
  },
  academy: {
    title: "Learning Never Ends.",
    subtext: "Leadership grows through continuous learning, reflection, and practice. Every completed lesson strengthens your executive journey.",
  },
  companies: {
    title: "Every organization defines leadership differently.",
    subtext: "Discover what executive excellence looks like inside your target company.",
  },
};

/**
 * Empty state messages — inspiring leadership messaging instead of generic copy.
 */
export const EMPTY_STATES = {
  letters: {
    title: "Every legacy begins with a first lesson.",
    description: "Share your first leadership insight with the next generation.",
  },
  certifications: {
    title: "Strengthen your executive journey with recognized certifications.",
    description: "Add your certifications to build credibility and unlock new opportunities.",
  },
  companies: {
    title: "Explore organizations and understand how leadership expectations differ across industries.",
    description: "Discover what executive excellence looks like inside your target companies.",
  },
  journal: {
    title: "Leadership grows through reflection.",
    description: "Capture today's lessons before they become tomorrow's wisdom.",
  },
  simulations: {
    title: "Great leaders prepare before critical moments.",
    description: "Start your first executive simulation.",
  },
  resume: {
    title: "Every executive story starts with a resume.",
    description: "Upload yours and let AI help you elevate it.",
  },
};
/**
 * Executive Operating Rhythm™
 * ============================================================
 * Establishes executive habits through a structured cadence:
 *
 *   Daily:    Dashboard → Action Center → Coach
 *   Weekly:   Executive Briefing → Journey Review
 *   Monthly:  Promotion Forecast → Leadership DNA Review
 *   Quarterly: Career Strategy Review → Goal Reset
 */

const RHYTHM_SCHEDULE = {
  daily: [
    { step: 1, module: "dashboard", label: "Dashboard", path: "/dashboard", description: "Review your executive health and next best action", time: "morning" },
    { step: 2, module: "action_center", label: "Action Center", path: "/action-center", description: "Complete today's prioritized actions", time: "morning" },
    { step: 3, module: "executive_coach", label: "Executive Coach", path: "/coach", description: "Get coaching on your current focus area", time: "anytime" },
  ],
  weekly: [
    { step: 1, module: "executive_briefing", label: "Executive Briefing™", path: "/executive-briefing", description: "Read your weekly leadership intelligence briefing", day: "monday" },
    { step: 2, module: "journey", label: "Journey Review", path: "/journey-orchestrator", description: "Review your journey progress and milestones", day: "friday" },
  ],
  monthly: [
    { step: 1, module: "promotion_forecast", label: "Promotion Forecast", path: "/promotion-forecast", description: "Review your promotion readiness and forecast", week: 1 },
    { step: 2, module: "leadership_dna", label: "Leadership DNA Review", path: "/leadership-dna", description: "Review your competency evolution", week: 2 },
  ],
  quarterly: [
    { step: 1, module: "career_advisor", label: "Career Strategy Review", path: "/career", description: "Review your career strategy and trajectory", quarter: 1 },
    { step: 2, module: "journey_orchestrator", label: "Goal Reset", path: "/journey-orchestrator", description: "Reset your executive goals for the new quarter", quarter: 1 },
  ],
};

// ============================================================
// RHYTHM API
// ============================================================

export function getDailyRhythm() {
  return RHYTHM_SCHEDULE.daily;
}

export function getWeeklyRhythm() {
  return RHYTHM_SCHEDULE.weekly;
}

export function getMonthlyRhythm() {
  return RHYTHM_SCHEDULE.monthly;
}

export function getQuarterlyRhythm() {
  return RHYTHM_SCHEDULE.quarterly;
}

export function getFullRhythm() {
  return RHYTHM_SCHEDULE;
}

export function getRhythmForToday() {
  const dayOfWeek = new Date().getDay(); // 0=Sunday, 1=Monday
  const isMonday = dayOfWeek === 1;
  const isFriday = dayOfWeek === 5;

  const rhythm = {
    daily: getDailyRhythm(),
    weekly: [],
  };

  if (isMonday) {
    rhythm.weekly.push(RHYTHM_SCHEDULE.weekly[0]); // Briefing
  }
  if (isFriday) {
    rhythm.weekly.push(RHYTHM_SCHEDULE.weekly[1]); // Journey Review
  }

  return rhythm;
}

// ============================================================
// RHYTHM COMPLIANCE
// ============================================================

export function calculateCompliance(sessionBehavior) {
  if (!sessionBehavior) return { score: 0, completed: [], pending: [] };

  const daily = getDailyRhythm();
  const completed = [];
  const pending = [];

  for (const step of daily) {
    // Check if user visited this module in session
    const visited = sessionBehavior.totalEvents > 0; // simplified
    if (visited) {
      completed.push(step);
    } else {
      pending.push(step);
    }
  }

  const score = Math.round((completed.length / daily.length) * 100);
  return { score, completed, pending };
}

export function getRhythmStats() {
  const totalSteps =
    RHYTHM_SCHEDULE.daily.length +
    RHYTHM_SCHEDULE.weekly.length +
    RHYTHM_SCHEDULE.monthly.length +
    RHYTHM_SCHEDULE.quarterly.length;

  return {
    cadences: ["daily", "weekly", "monthly", "quarterly"],
    totalSteps,
    dailySteps: RHYTHM_SCHEDULE.daily.length,
    weeklySteps: RHYTHM_SCHEDULE.weekly.length,
    monthlySteps: RHYTHM_SCHEDULE.monthly.length,
    quarterlySteps: RHYTHM_SCHEDULE.quarterly.length,
  };
}
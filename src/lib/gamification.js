export const XP_REWARDS = {
  challenge_complete: 50,
  simulation_complete: 100,
  debate_complete: 75,
  lesson_complete: 25,
  journal_entry: 20,
  coach_message: 5,
  daily_streak: 10,
  perfect_score: 200,
};

export const LEVELS = [
  { level: 1, title: "Aspiring Leader", xp: 0, icon: "🌱" },
  { level: 2, title: "Team Lead", xp: 100, icon: "👤" },
  { level: 3, title: "Manager", xp: 300, icon: "📊" },
  { level: 4, title: "Senior Manager", xp: 600, icon: "🎯" },
  { level: 5, title: "Director", xp: 1000, icon: "🏆" },
  { level: 6, title: "Senior Director", xp: 1500, icon: "⚡" },
  { level: 7, title: "VP", xp: 2200, icon: "🚀" },
  { level: 8, title: "SVP", xp: 3000, icon: "👑" },
  { level: 9, title: "C-Level", xp: 4000, icon: "💎" },
  { level: 10, title: "Executive Excellence", xp: 5500, icon: "🔥" },
];

export const ACHIEVEMENTS = [
  { id: "first_challenge", name: "First Steps", description: "Complete your first challenge", icon: "🎯", xp: 50, category: "challenge" },
  { id: "challenges_10", name: "Challenger", description: "Complete 10 challenges", icon: "⚔️", xp: 200, category: "challenge" },
  { id: "challenges_50", name: "Executive Warrior", description: "Complete 50 challenges", icon: "🛡️", xp: 500, category: "challenge" },
  { id: "streak_7", name: "Week Warrior", description: "Maintain a 7-day streak", icon: "🔥", xp: 100, category: "streak" },
  { id: "streak_30", name: "Unstoppable", description: "Maintain a 30-day streak", icon: "⚡", xp: 500, category: "streak" },
  { id: "simulation_5", name: "Sim Master", description: "Complete 5 simulations", icon: "🧠", xp: 300, category: "simulation" },
  { id: "debate_3", name: "Debate Champion", description: "Complete 3 debates", icon: "⚖️", xp: 250, category: "debate" },
  { id: "lessons_10", name: "Scholar", description: "Complete 10 lessons", icon: "📚", xp: 200, category: "learning" },
  { id: "level_5", name: "Director", description: "Reach Director level", icon: "🏆", xp: 0, category: "level" },
  { id: "level_10", name: "Apex", description: "Reach max level", icon: "💎", xp: 0, category: "level" },
  { id: "truth_90", name: "Truth Teller", description: "Score 90+ on Truthfulness", icon: "🛡️", xp: 150, category: "score" },
  { id: "perfect_95", name: "Perfectionist", description: "Score 95+ overall", icon: "💯", xp: 300, category: "score" },
];

export const getLevel = (xp) => {
  let current = LEVELS[0];
  let next = null;
  for (let i = 0; i < LEVELS.length; i++) {
    if (xp >= LEVELS[i].xp) {
      current = LEVELS[i];
      next = LEVELS[i + 1] || null;
    }
  }
  const progress = next ? Math.round(((xp - current.xp) / (next.xp - current.xp)) * 100) : 100;
  return { current, next, progress };
};

export const checkAchievements = (profile) => {
  const unlocked = [];
  const stats = {
    challenges_completed: profile?.challenges_completed || 0,
    sessions_completed: profile?.sessions_completed || 0,
    streak_days: profile?.streak_days || 0,
    xp_points: profile?.xp_points || 0,
  };

  for (const ach of ACHIEVEMENTS) {
    let isUnlocked = false;
    if (ach.id === "first_challenge" && stats.challenges_completed >= 1) isUnlocked = true;
    if (ach.id === "challenges_10" && stats.challenges_completed >= 10) isUnlocked = true;
    if (ach.id === "challenges_50" && stats.challenges_completed >= 50) isUnlocked = true;
    if (ach.id === "streak_7" && stats.streak_days >= 7) isUnlocked = true;
    if (ach.id === "streak_30" && stats.streak_days >= 30) isUnlocked = true;
    if (ach.id === "simulation_5" && stats.sessions_completed >= 5) isUnlocked = true;
    if (ach.id === "level_5" && stats.xp_points >= 1000) isUnlocked = true;
    if (ach.id === "level_10" && stats.xp_points >= 5500) isUnlocked = true;
    if (isUnlocked) unlocked.push(ach);
  }
  return unlocked;
};
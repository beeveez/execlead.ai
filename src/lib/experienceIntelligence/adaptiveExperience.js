/**
 * Adaptive Experience™
 * ============================================================
 * Dynamically adapts platform behavior based on the user's
 * current state, role, and journey stage.
 *
 * Adaptive Modes:
 *   • new_user → Prioritize onboarding
 *   • returning_executive → Prioritize momentum
 *   • director_candidate → Prioritize delegation
 *   • cio_candidate → Prioritize governance
 *   • founder → Prioritize strategy
 */

const ADAPTIVE_MODES = {
  new_user: {
    id: "new_user",
    label: "Onboarding",
    description: "Prioritize onboarding and profile completion",
    priorityModules: ["profile", "resume_intelligence", "executive_portfolio", "identity_verification"],
    dashboardFocus: "onboarding",
    coachFocus: "getting_started",
    color: "text-sky-400",
  },
  returning_executive: {
    id: "returning_executive",
    label: "Momentum",
    description: "Prioritize momentum and daily actions",
    priorityModules: ["dashboard", "action_center", "executive_briefing", "executive_coach"],
    dashboardFocus: "momentum",
    coachFocus: "momentum",
    color: "text-indigo-400",
  },
  director_candidate: {
    id: "director_candidate",
    label: "Delegation",
    description: "Prioritize delegation and team leadership",
    priorityModules: ["simulator", "leadership_dna", "decision_intelligence", "executive_coach"],
    dashboardFocus: "delegation",
    coachFocus: "delegation",
    color: "text-violet-400",
  },
  cio_candidate: {
    id: "cio_candidate",
    label: "Governance",
    description: "Prioritize governance and strategic oversight",
    priorityModules: ["council", "debate", "decision_intelligence", "leadership_dna"],
    dashboardFocus: "governance",
    coachFocus: "governance",
    color: "text-cyan-400",
  },
  founder: {
    id: "founder",
    label: "Strategy",
    description: "Prioritize strategy and vision",
    priorityModules: ["decision_intelligence", "council", "executive_briefing", "journey_orchestrator"],
    dashboardFocus: "strategy",
    coachFocus: "strategy",
    color: "text-amber-400",
  },
};

// ============================================================
// MODE RESOLUTION
// ============================================================

export function resolveAdaptiveMode(user, profile, journeyData) {
  if (!user) return ADAPTIVE_MODES.new_user;

  // New user: no profile data, recently registered
  const accountAgeDays = user.created_date
    ? Math.floor((Date.now() - new Date(user.created_date).getTime()) / 86400000)
    : 999;
  if (accountAgeDays < 7 || !profile?.target_role) {
    return ADAPTIVE_MODES.new_user;
  }

  // Founder
  if (profile?.is_founder || user.role === "developer" || user.role === "super_admin") {
    return ADAPTIVE_MODES.founder;
  }

  // Director / CIO candidate based on target role
  const targetRole = (profile?.target_role || "").toLowerCase();
  if (targetRole.includes("cio") || targetRole.includes("cto") || targetRole.includes("chief")) {
    return ADAPTIVE_MODES.cio_candidate;
  }
  if (targetRole.includes("director") || targetRole.includes("vp") || targetRole.includes("vice")) {
    return ADAPTIVE_MODES.director_candidate;
  }

  // Default: returning executive
  return ADAPTIVE_MODES.returning_executive;
}

export function getAdaptiveMode(modeId) {
  return ADAPTIVE_MODES[modeId] || ADAPTIVE_MODES.returning_executive;
}

export function getAllAdaptiveModes() {
  return Object.values(ADAPTIVE_MODES);
}

export function getPriorityModules(modeId) {
  const mode = getAdaptiveMode(modeId);
  return mode.priorityModules;
}

export function getDashboardFocus(modeId) {
  const mode = getAdaptiveMode(modeId);
  return mode.dashboardFocus;
}

export function getCoachFocus(modeId) {
  const mode = getAdaptiveMode(modeId);
  return mode.coachFocus;
}
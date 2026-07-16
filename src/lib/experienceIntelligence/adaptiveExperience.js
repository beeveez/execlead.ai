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

import { resolveExperienceProfile, profileToAdaptiveMode } from "./experienceProfiles";

// Legacy mode definitions — kept for backward compatibility.
// resolveAdaptiveMode now delegates to Experience Profiles™.
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

  // Delegate to Experience Profile™ resolution — single source of truth.
  const experienceProfile = resolveExperienceProfile(
    user,
    profile,
    journeyData?.workspace
  );
  const mode = profileToAdaptiveMode(experienceProfile);
  if (mode) return mode;

  // Safety fallback (should not be reached — resolveExperienceProfile always returns a profile)
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
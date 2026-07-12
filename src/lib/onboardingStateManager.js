/**
 * Onboarding State Manager™
 * ============================================================
 * Evaluates onboarding completeness using multiple signals.
 *
 * SAFEGUARD PRINCIPLE:
 *   If ANY executive data exists (journey points, readiness,
 *   leadership DNA, sessions, etc.), onboarding is considered
 *   COMPLETE — regardless of whether the profile loaded.
 *   This prevents infinite redirect loops when profile loading
 *   fails transiently.
 *
 *   Onboarding should execute exactly once. After completion,
 *   the user is never redirected back unless onboarding is
 *   explicitly reset.
 */

const ONBOARDING_VERSION = "1.0";
const SESSION_KEY = "execlead_session";

function getSessionContext() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || "{}");
  } catch {
    return {};
  }
}

/**
 * Persist onboarding completion with metadata.
 * Called after successful onboarding finalization.
 */
export function markOnboardingCompleted() {
  const current = getSessionContext();
  const updated = {
    ...current,
    onboardingCompleted: true,
    lastCompletedAt: new Date().toISOString(),
    completedVersion: ONBOARDING_VERSION,
    updatedAt: Date.now(),
  };
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
  } catch {}
}

/**
 * Explicitly reset onboarding (admin/manual only).
 * This is the ONLY way to re-trigger onboarding for a user
 * who has existing executive data.
 */
export function resetOnboarding() {
  const current = getSessionContext();
  const updated = {
    ...current,
    onboardingCompleted: false,
    lastCompletedAt: null,
    completedVersion: null,
    onboardingResetAt: new Date().toISOString(),
    updatedAt: Date.now(),
  };
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
  } catch {}
}

/**
 * Evaluate onboarding state from all available signals.
 *
 * @param {object|null} profile - UserProfile record (may be null if load failed)
 * @param {object|null} user - Authenticated user from AuthContext
 * @returns {{ status, isComplete, signals, safeguardSignals, anySafeguard, missingRequirements, reason, sessionContext, version }}
 */
export function evaluateOnboardingState(profile, user) {
  const session = getSessionContext();

  // ── Primary signals from profile ──
  const signals = {
    profileLoaded: !!profile,
    resumeUploaded: !!profile?.resume_url,
    executiveIdentityCompleted: !!(profile?.professional_headline || profile?.full_name || user?.full_name) && !!profile?.target_role,
    executivePassportCompleted: !!(profile?.target_role && profile?.target_company),
    requiredProfileFields: !!(profile?.target_role && profile?.target_company && (profile?.full_name || user?.full_name)),
    leadershipDNAStatus: (profile?.leadership_maturity > 0) ? "completed" : "pending",
    identityStatus: profile?.identity_verified ? "verified" : "pending",
    journeyInitialized: (profile?.cached_journey_points > 0) || (profile?.xp_points > 0) || (profile?.sessions_completed > 0),
  };

  // ── Safeguard signals — ANY of these means onboarding was already completed ──
  // Never redirect to onboarding if the user has ANY of these.
  const safeguardSignals = {
    hasJourneyPoints: (profile?.cached_journey_points > 0) || (profile?.xp_points > 0),
    hasReadiness: (profile?.cached_readiness_score > 0) || (profile?.interview_readiness > 0) || (profile?.promotion_readiness > 0),
    hasLeadershipDNA: (profile?.leadership_maturity > 0),
    hasExecutivePresence: (profile?.executive_presence > 0),
    hasCommercialMaturity: (profile?.commercial_maturity > 0),
    hasSessionsCompleted: (profile?.sessions_completed > 0),
    hasChallengesCompleted: (profile?.challenges_completed > 0),
    hasStreak: (profile?.streak_days > 0),
    hasResumeUrl: !!profile?.resume_url,
    hasSessionFlag: session.onboardingCompleted === true,
  };

  const anySafeguard = Object.values(safeguardSignals).some(Boolean);

  // ── Minimum requirements for onboarding to be complete ──
  const minimumRequirements = signals.executivePassportCompleted && signals.requiredProfileFields;

  // Onboarding is complete if minimum requirements are met OR any safeguard triggers
  const isComplete = minimumRequirements || anySafeguard;

  // ── Missing requirements ──
  const missingRequirements = [];
  if (!signals.executivePassportCompleted) missingRequirements.push("Executive Passport™ (target role + company)");
  if (!signals.requiredProfileFields) missingRequirements.push("Required profile fields (name, target role, target company)");
  if (!signals.resumeUploaded) missingRequirements.push("Resume upload (optional but recommended)");

  // ── Reason ──
  let reason;
  if (isComplete) {
    if (anySafeguard && !minimumRequirements) {
      reason = "Safeguard: existing executive data detected — onboarding bypassed";
    } else if (signals.hasSessionFlag && !minimumRequirements) {
      reason = "Onboarding marked complete in session storage";
    } else {
      reason = "All minimum requirements satisfied";
    }
  } else {
    reason = "Missing required onboarding fields";
  }

  return {
    status: isComplete ? "COMPLETE" : "INCOMPLETE",
    isComplete,
    signals,
    safeguardSignals,
    anySafeguard,
    missingRequirements,
    reason,
    sessionContext: {
      onboardingCompleted: session.onboardingCompleted ?? false,
      lastCompletedAt: session.lastCompletedAt || null,
      completedVersion: session.completedVersion || null,
    },
    version: ONBOARDING_VERSION,
  };
}

/**
 * Resolve whether the user should be redirected to onboarding.
 * Returns the redirect decision plus full state for diagnostics.
 */
export function resolveOnboardingRedirect(profile, user) {
  const state = evaluateOnboardingState(profile, user);
  if (state.isComplete) {
    return { shouldRedirect: false, target: "/dashboard", state };
  }
  return { shouldRedirect: true, target: "/onboarding", state };
}
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
const FAILSAFE_KEY = "execlead_onboarding_redirect_count";
const MAX_ONBOARDING_REDIRECTS = 1;

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
  // Clear failsafe counter — onboarding is complete, no more redirects needed
  try { sessionStorage.removeItem(FAILSAFE_KEY); } catch {}
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
  // Leadership DNA™, Identity Verification, and Resume Upload are OPTIONAL.
  // They improve personalization — they do NOT block platform access.
  const missingRequirements = [];
  const optionalMissing = [];
  if (!signals.executivePassportCompleted) missingRequirements.push("Executive Passport™ (target role + company)");
  if (!signals.requiredProfileFields) missingRequirements.push("Required profile fields (name, target role, target company)");
  if (!signals.resumeUploaded) optionalMissing.push("Resume upload");
  if (signals.leadershipDNAStatus === "pending") optionalMissing.push("Leadership DNA™ assessment");
  if (signals.identityStatus === "pending") optionalMissing.push("Identity verification");

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
    optionalMissing,
    sessionContext: {
      onboardingCompleted: session.onboardingCompleted ?? false,
      lastCompletedAt: session.lastCompletedAt || null,
      completedVersion: session.completedVersion || null,
    },
    version: ONBOARDING_VERSION,
  };
}

/**
 * FAILSAFE: Check and increment the onboarding redirect counter.
 * Maximum onboarding redirects: 1.
 * If a second redirect is detected, stop routing and go to Dashboard.
 */
export function checkOnboardingFailsafe() {
  let count = 0;
  try { count = parseInt(sessionStorage.getItem(FAILSAFE_KEY) || "0", 10); } catch {}
  if (count >= MAX_ONBOARDING_REDIRECTS) {
    return { shouldStop: true, count, max: MAX_ONBOARDING_REDIRECTS };
  }
  try { sessionStorage.setItem(FAILSAFE_KEY, String(count + 1)); } catch {}
  return { shouldStop: false, count, max: MAX_ONBOARDING_REDIRECTS };
}

/**
 * Clear the failsafe counter. Called when profile loads successfully
 * (returning user confirmed) or onboarding completes.
 */
export function clearOnboardingFailsafe() {
  try { sessionStorage.removeItem(FAILSAFE_KEY); } catch {}
}

/**
 * Get current failsafe state for diagnostics.
 */
export function getFailsafeState() {
  let count = 0;
  try { count = parseInt(sessionStorage.getItem(FAILSAFE_KEY) || "0", 10); } catch {}
  return { count, max: MAX_ONBOARDING_REDIRECTS, triggered: count >= MAX_ONBOARDING_REDIRECTS };
}

/**
 * Resolve whether the user should be redirected to onboarding.
 * Includes failsafe: if we've already redirected once, stop and
 * go to Dashboard to break any infinite loop.
 *
 * Returns the redirect decision plus full state for diagnostics.
 */
export function resolveOnboardingRedirect(profile, user) {
  const state = evaluateOnboardingState(profile, user);
  if (state.isComplete) {
    clearOnboardingFailsafe();
    return { shouldRedirect: false, target: "/dashboard", state, failsafe: getFailsafeState() };
  }
  // Failsafe: prevent infinite onboarding redirect loops
  const failsafe = checkOnboardingFailsafe();
  if (failsafe.shouldStop) {
    return {
      shouldRedirect: false,
      target: "/dashboard",
      state,
      failsafe,
      failsafeTriggered: true,
      reason: "FAILSAFE: Onboarding redirect limit reached — routing to Dashboard to prevent infinite loop",
    };
  }
  return { shouldRedirect: true, target: "/onboarding", state, failsafe };
}
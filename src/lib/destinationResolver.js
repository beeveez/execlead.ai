/**
 * DestinationResolver™
 * ============================================================
 * Resolves where a user should go after authentication.
 *
 * CRITICAL: This resolver NEVER redirects to /onboarding.
 * Onboarding is determined by the Onboarding Validator™
 * (onboardingStateManager.js) AFTER the Executive Runtime
 * Profile™ loads — not before.
 *
 * Priority Order:
 *   1. Authentication fails → /login (handled by ProtectedRoute)
 *   2. Explicit redirect parameter → that route
 *   3. Last session route → restore where they left off
 *   4. Default → /dashboard (Dashboard validates onboarding)
 *
 * Design Principle:
 *   Authentication should restore the user's working session,
 *   not restart their journey. Like Microsoft 365, GitHub,
 *   Salesforce, and ServiceNow — users return to where they
 *   left off.
 */

const ONBOARDING_REDIRECT_KEY = "execlead_onboarding_redirect_count";
const MAX_ONBOARDING_REDIRECTS = 1;
const SESSION_KEY = "execlead_session";
const AUTH_ROUTES = ["/login", "/register", "/forgot-password", "/reset-password"];

function isAuthRoute(path) {
  const pathname = (path || "").split("?")[0];
  if (!pathname) return false;
  return AUTH_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"));
}

function isValidRoute(path) {
  return path && path.startsWith("/") && !isAuthRoute(path);
}

function getSessionContext() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || "{}");
  } catch {
    return {};
  }
}

/**
 * Resolve the post-authentication destination.
 * Does NOT decide onboarding — that's handled after profile loads.
 */
export function resolveDestination() {
  const ctx = getSessionContext();
  const urlParams = new URLSearchParams(window.location.search);
  const redirectParam = urlParams.get("redirect");

  // Priority 1: Explicit redirect parameter from URL
  if (redirectParam && isValidRoute(redirectParam)) {
    return {
      target: redirectParam,
      reason: "Explicit redirect parameter in URL",
      source: "url_param",
    };
  }

  // Priority 2: Restore last session route
  if (ctx.lastRoute && isValidRoute(ctx.lastRoute)) {
    return {
      target: ctx.lastRoute,
      reason: `Restored last session route: ${ctx.lastRoute}`,
      source: "last_route",
      lastWorkspace: ctx.lastWorkspace || null,
    };
  }

  // Priority 3: Default to Executive Dashboard
  // (Dashboard will validate onboarding via Runtime Profile)
  return {
    target: "/dashboard",
    reason: "No previous session found — defaulting to Executive Dashboard",
    source: "default",
  };
}

// ============================================================
// FAILSAFE: Prevent infinite onboarding redirect loops
// ============================================================

/**
 * Check if we've already redirected to onboarding in this session.
 * Maximum onboarding redirects: 1.
 * If a second redirect is detected, stop routing and navigate to Dashboard.
 */
export function checkOnboardingFailsafe() {
  let count = 0;
  try {
    count = parseInt(sessionStorage.getItem(ONBOARDING_REDIRECT_KEY) || "0", 10);
  } catch {}

  if (count >= MAX_ONBOARDING_REDIRECTS) {
    return { shouldStop: true, count, max: MAX_ONBOARDING_REDIRECTS };
  }

  try {
    sessionStorage.setItem(ONBOARDING_REDIRECT_KEY, String(count + 1));
  } catch {}

  return { shouldStop: false, count, max: MAX_ONBOARDING_REDIRECTS };
}

/**
 * Clear the onboarding failsafe counter.
 * Called when:
 *   - Onboarding completes successfully
 *   - Profile loads successfully (returning user confirmed)
 *   - User manually navigates away from onboarding
 */
export function clearOnboardingFailsafe() {
  try {
    sessionStorage.removeItem(ONBOARDING_REDIRECT_KEY);
  } catch {}
}

/**
 * Get current failsafe state for diagnostics.
 */
export function getFailsafeState() {
  let count = 0;
  try {
    count = parseInt(sessionStorage.getItem(ONBOARDING_REDIRECT_KEY) || "0", 10);
  } catch {}
  return {
    count,
    max: MAX_ONBOARDING_REDIRECTS,
    triggered: count >= MAX_ONBOARDING_REDIRECTS,
  };
}
/**
 * EXECLEAD.AI — Session Restoration Engine v2.0
 * ============================================================
 * Persists and restores user context across sessions.
 *
 * CHANGES IN v2.0:
 *   - getPostAuthRedirect() NO LONGER redirects to /onboarding.
 *     Onboarding is validated AFTER the Executive Runtime Profile™
 *     loads, not before. This prevents infinite loops for returning
 *     users on new devices or cleared cache.
 *   - Tracks lastWorkspace, lastRoute, lastModule, lastVisited.
 *   - Delegates destination resolution to DestinationResolver™.
 */

import { resolveDestination } from "@/lib/destinationResolver";

const SESSION_KEY = "execlead_session";

const AUTH_ROUTES = ["/login", "/register", "/forgot-password", "/reset-password"];

function isAuthRoute(path) {
  const pathname = (path || "").split("?")[0];
  if (!pathname) return false;
  return AUTH_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"));
}

export function isValidRoute(path) {
  return path && path.startsWith("/") && !isAuthRoute(path);
}

export function getSessionContext() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || "{}");
  } catch {
    return {};
  }
}

export function saveSessionContext(partial) {
  const current = getSessionContext();
  const updated = { ...current, ...partial, updatedAt: Date.now() };
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
  } catch {}
}

export function clearSessionContext() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {}
}

export function markOnboardingCompleted() {
  saveSessionContext({
    onboardingCompleted: true,
    lastCompletedAt: new Date().toISOString(),
    completedVersion: "1.0",
  });
}

/**
 * Builds a sign-in URL that returns the user to the current page after login.
 */
export function buildSignInUrl(currentPath) {
  const returnTo = currentPath || "/dashboard";
  return `/login?redirect=${encodeURIComponent(returnTo)}`;
}

/**
 * Resolves where to send the user after authentication.
 *
 * v2.0: Does NOT redirect to /onboarding. Onboarding is validated
 * by the Onboarding State Manager™ after the Runtime Profile loads.
 *
 * Priority: redirect param → lastRoute → dashboard
 */
export function getPostAuthRedirect() {
  // Delegate to DestinationResolver™ — no onboarding redirect here
  const result = resolveDestination();
  return result.target;
}
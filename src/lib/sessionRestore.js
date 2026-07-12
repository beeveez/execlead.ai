/**
 * EXECLEAD.AI — Session Restoration Engine
 * ============================================================
 * Persists and restores user context across sessions.
 *
 * Redirect priority after authentication:
 *   1. First-time user (no onboarding completed) → /onboarding
 *   2. redirect parameter (from URL) — explicit returnTo
 *   3. stored lastRoute — the last page the user was viewing
 *   4. Executive Dashboard (/dashboard)
 *
 * Two CTA patterns:
 *   • "Sign In" links → buildSignInUrl(currentPath) → returns to current page
 *   • "Get Started" / "Start Free" CTAs → /register?redirect=/dashboard
 *     (first-time users are redirected to /onboarding by priority #1)
 */

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
 * Use for "Sign In" links in nav, footer, etc.
 */
export function buildSignInUrl(currentPath) {
  const returnTo = currentPath || "/dashboard";
  return `/login?redirect=${encodeURIComponent(returnTo)}`;
}

/**
 * Resolves where to send the user after authentication.
 * Priority: first-time check → redirect param → lastRoute → dashboard
 */
export function getPostAuthRedirect() {
  const ctx = getSessionContext();

  // 1. First-time users always go to onboarding
  if (!ctx.onboardingCompleted) {
    return "/onboarding";
  }

  // 2. Check redirect parameter from URL (explicit returnTo)
  const urlParams = new URLSearchParams(window.location.search);
  const redirectParam = urlParams.get("redirect");
  if (redirectParam && isValidRoute(redirectParam)) {
    return redirectParam;
  }

  // 3. Check stored lastRoute
  if (ctx.lastRoute && isValidRoute(ctx.lastRoute)) {
    return ctx.lastRoute;
  }

  // 4. Default to Executive Dashboard
  return "/dashboard";
}
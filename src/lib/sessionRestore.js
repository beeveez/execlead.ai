/**
 * EXECLEAD.AI — Session Restoration Engine
 * ============================================================
 * Persists and restores user context across sessions.
 *
 * Redirect priority after authentication:
 *   1. First-time user (no onboarding completed) → /onboarding
 *   2. redirect parameter (from URL)
 *   3. stored lastRoute
 *   4. Executive Dashboard (/dashboard)
 */

const SESSION_KEY = "execlead_session";

const PUBLIC_ROUTES = [
  "/", "/login", "/register", "/forgot-password", "/reset-password",
  "/trust-center", "/legal", "/about", "/contact",
  "/founders", "/founders-wall", "/pricing", "/leaderboard",
  "/company-library", "/verify",
];

function isPublicRoute(path) {
  const pathname = (path || "").split("?")[0];
  if (!pathname) return true;
  return PUBLIC_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"));
}

function isValidRoute(path) {
  return path && path.startsWith("/") && !isPublicRoute(path);
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
  saveSessionContext({ onboardingCompleted: true });
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

  // 2. Check redirect parameter from URL
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
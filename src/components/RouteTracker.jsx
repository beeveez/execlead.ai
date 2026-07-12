import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { saveSessionContext } from "@/lib/sessionRestore";

const PUBLIC_ROUTES = [
  "/", "/login", "/register", "/forgot-password", "/reset-password",
  "/trust-center", "/legal", "/about", "/contact",
  "/founders", "/founders-wall", "/pricing", "/leaderboard",
  "/company-library", "/verify",
];

function isPublicRoute(pathname) {
  if (!pathname) return true;
  return PUBLIC_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"));
}

/**
 * Tracks route changes and persists the last non-public route
 * to session context for restoration after re-authentication.
 */
export default function RouteTracker() {
  const location = useLocation();

  useEffect(() => {
    if (!isPublicRoute(location.pathname)) {
      saveSessionContext({ lastRoute: location.pathname + location.search });
    }
  }, [location.pathname, location.search]);

  return null;
}
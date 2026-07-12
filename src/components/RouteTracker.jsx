import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { saveSessionContext } from "@/lib/sessionRestore";

const AUTH_ROUTES = ["/login", "/register", "/forgot-password", "/reset-password"];

function isAuthRoute(pathname) {
  if (!pathname) return false;
  return AUTH_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"));
}

/**
 * Tracks route changes and persists the last non-auth route
 * to session context for restoration after re-authentication.
 *
 * Auth routes (login, register, etc.) are excluded so that
 * lastRoute always points to the page the user was viewing
 * before entering the auth flow.
 */
export default function RouteTracker() {
  const location = useLocation();

  useEffect(() => {
    if (!isAuthRoute(location.pathname)) {
      saveSessionContext({ lastRoute: location.pathname + location.search });
    }
  }, [location.pathname, location.search]);

  return null;
}
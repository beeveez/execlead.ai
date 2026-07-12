import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { saveSessionContext } from "@/lib/sessionRestore";
import { useWorkspace } from "@/lib/WorkspaceContext";

const AUTH_ROUTES = ["/login", "/register", "/forgot-password", "/reset-password"];

function isAuthRoute(pathname) {
  if (!pathname) return false;
  return AUTH_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"));
}

/**
 * Tracks route changes and persists the last non-auth route
 * to session context for restoration after re-authentication.
 *
 * Tracks: lastRoute, lastWorkspace, lastModule, lastVisited
 * Auth routes are excluded so lastRoute always points to the
 * page the user was viewing before entering the auth flow.
 */
export default function RouteTracker() {
  const location = useLocation();
  const { activeWorkspace } = useWorkspace();

  useEffect(() => {
    if (!isAuthRoute(location.pathname)) {
      const segments = location.pathname.split("/").filter(Boolean);
      const lastModule = segments[0] || "dashboard";
      saveSessionContext({
        lastRoute: location.pathname + location.search,
        lastModule: `/${lastModule}`,
        lastVisited: new Date().toISOString(),
        ...(activeWorkspace ? { lastWorkspace: activeWorkspace } : {}),
      });
    }
  }, [location.pathname, location.search, activeWorkspace]);

  return null;
}
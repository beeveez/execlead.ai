import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { canAccessRoute, normalizeRole } from "@/lib/roles";

/**
 * RoleRoute — enforces role-based access on every route rendered
 * inside AppLayout. If the current user's role cannot access the
 * active path (per ROUTE_ACCESS), they are redirected to /dashboard.
 *
 * This is SECURITY enforcement, not just UI hiding. Even if a user
 * manually enters a restricted URL (/admin, /developer, /cpq, etc.),
 * access is denied and they are redirected.
 *
 * Subscription-plan feature gating is handled separately by <FeatureGate>.
 */
export default function RoleRoute({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  const role = normalizeRole(user?.role);

  if (!canAccessRoute(role, location.pathname)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
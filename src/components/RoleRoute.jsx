import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { useSubscription } from "@/lib/SubscriptionContext";
import { canAccessRoute, normalizeRole, getEffectiveRole } from "@/lib/roles";

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
  const { profile, loading } = useSubscription();
  const location = useLocation();
  const baseRole = normalizeRole(user?.role);

  // Base role grants access — render immediately
  if (canAccessRoute(baseRole, location.pathname)) return children;

  // Base role doesn't grant — wait for profile to compute effective role
  if (loading) return null;

  const effectiveRole = getEffectiveRole(user?.role, profile);
  if (canAccessRoute(effectiveRole, location.pathname)) return children;

  return <Navigate to="/dashboard" replace />;
}
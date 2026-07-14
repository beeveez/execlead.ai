/**
 * Universal Workspace Router™
 * ============================================================
 * Navigates by capability, not by workspace boundaries.
 *
 * When a user clicks a governance card (or any link using this
 * router), the router:
 *   1. Resolves which workspace the destination route belongs to
 *   2. Silently switches the active workspace if needed
 *   3. Navigates to the route
 *
 * Because the workspace is set BEFORE navigation, WorkspaceGuard
 * sees a matching workspace and never shows the "Stay / Switch"
 * confirmation dialog.
 *
 * Context preservation:
 *   - Governance context (last viewed domain) is stored in
 *     sessionStorage so it survives page reloads.
 *   - Navigation state (breadcrumb trail) is passed via React
 *     Router's location.state for deep-linkable breadcrumbs.
 */

import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useWorkspace } from "./WorkspaceContext";
import { getRouteWorkspace } from "./workspaces";

const GOVERNANCE_CONTEXT_KEY = "execlead_governance_context";

/**
 * Resolve which workspace a route belongs to, preferring the
 * currently active workspace if the route is accessible from it.
 */
export function resolveDestinationWorkspace(route, availableWorkspaces, activeWorkspace) {
  const routeWorkspaces = getRouteWorkspace(route);
  if (!routeWorkspaces || routeWorkspaces.length === 0) return activeWorkspace;
  if (routeWorkspaces.includes(activeWorkspace)) return activeWorkspace;
  const accessible = routeWorkspaces.find((w) => availableWorkspaces.includes(w));
  return accessible || routeWorkspaces[0] || activeWorkspace;
}

/**
 * React hook that provides seamless workspace-aware navigation.
 *
 * Usage:
 *   const { navigateTo } = useUniversalRouter();
 *   navigateTo('/developer/diagnostics', { state: { fromGovernance: true } });
 */
export function useUniversalRouter() {
  const { activeWorkspace, availableWorkspaces, setActiveWorkspace } = useWorkspace();
  const navigate = useNavigate();

  const navigateTo = useCallback((route, options = {}) => {
    const { state, ...navOptions } = options;
    const target = resolveDestinationWorkspace(route, availableWorkspaces, activeWorkspace);
    if (target && target !== activeWorkspace) {
      setActiveWorkspace(target, { persist: true });
    }
    navigate(route, { ...navOptions, state });
  }, [activeWorkspace, availableWorkspaces, setActiveWorkspace, navigate]);

  return { navigateTo, activeWorkspace, availableWorkspaces };
}

/**
 * Store governance navigation context (last viewed domain).
 * Used to restore state when returning to the Governance Command Center.
 */
export function storeGovernanceContext(domain) {
  try {
    sessionStorage.setItem(GOVERNANCE_CONTEXT_KEY, JSON.stringify({
      domainId: domain.id,
      domainName: domain.name,
      route: domain.route,
      timestamp: Date.now(),
    }));
  } catch { /* no-op */ }
}

/**
 * Retrieve the last governance context (or null if none).
 */
export function getGovernanceContext() {
  try {
    const raw = sessionStorage.getItem(GOVERNANCE_CONTEXT_KEY);
    if (!raw) return null;
    const ctx = JSON.parse(raw);
    // Expire after 30 minutes
    if (Date.now() - ctx.timestamp > 30 * 60 * 1000) return null;
    return ctx;
  } catch {
    return null;
  }
}

/**
 * Clear governance context.
 */
export function clearGovernanceContext() {
  try {
    sessionStorage.removeItem(GOVERNANCE_CONTEXT_KEY);
  } catch { /* no-op */ }
}
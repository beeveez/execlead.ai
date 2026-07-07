import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useWorkspace } from "@/lib/WorkspaceContext";
import { getRouteWorkspace, WORKSPACE_HOME, WORKSPACES } from "@/lib/workspaces";
import { ShieldAlert, ArrowRight, ArrowLeft } from "lucide-react";

/**
 * WorkspaceGuard — enforces workspace isolation on every route.
 *
 * Navigation clicks NEVER change the active workspace.
 * If a route belongs to a different workspace than the active one,
 * the user is prompted to explicitly confirm the switch — it is never
 * done automatically. Only the Workspace Switcher or explicit user
 * confirmation updates the workspace context.
 */
export default function WorkspaceGuard({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { activeWorkspace, availableWorkspaces, setActiveWorkspace } = useWorkspace();
  const [mismatch, setMismatch] = useState(null);

  useEffect(() => {
    const routeWorkspaces = getRouteWorkspace(location.pathname);
    if (!routeWorkspaces || routeWorkspaces.length === 0) {
      setMismatch(null);
      return;
    }
    // Route is accessible from the current workspace — render normally
    if (routeWorkspaces.includes(activeWorkspace)) {
      setMismatch(null);
      return;
    }
    // Route belongs to a different workspace — do NOT auto-switch.
    // Prompt the user for explicit confirmation.
    const accessible = routeWorkspaces.find((w) => availableWorkspaces.includes(w));
    setMismatch({ targetWorkspace: accessible || null });
  }, [location.pathname, activeWorkspace, availableWorkspaces]);

  const handleSwitch = () => {
    if (mismatch?.targetWorkspace) {
      setActiveWorkspace(mismatch.targetWorkspace);
    }
  };

  const handleStay = () => {
    setMismatch(null);
    navigate(activeWorkspace ? WORKSPACE_HOME[activeWorkspace] : "/");
  };

  if (mismatch) {
    return (
      <WorkspaceMismatch
        activeWorkspace={activeWorkspace}
        targetWorkspace={mismatch.targetWorkspace}
        onSwitch={handleSwitch}
        onStay={handleStay}
      />
    );
  }

  return children;
}

function WorkspaceMismatch({ activeWorkspace, targetWorkspace, onSwitch, onStay }) {
  const activeWs = activeWorkspace ? WORKSPACES[activeWorkspace] : null;
  const targetWs = targetWorkspace ? WORKSPACES[targetWorkspace] : null;
  const activeLabel = activeWs?.label || "Current";
  const targetLabel = targetWs?.label || "Another";

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 flex items-center justify-center mb-4 border border-amber-500/20">
          <ShieldAlert size={28} className="text-amber-400" />
        </div>
        <h1 className="text-xl font-bold text-white mb-2">This page belongs to the {targetLabel} workspace</h1>
        <p className="text-white/40 text-sm mb-6">
          You're currently in the <span className="text-white/70 font-medium">{activeLabel}</span> workspace.
          Switching will change your navigation context.
        </p>
        <div className="flex flex-col gap-2">
          {targetWorkspace ? (
            <button onClick={onSwitch} className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors">
              Switch to {targetLabel} <ArrowRight size={14} />
            </button>
          ) : (
            <p className="text-white/30 text-xs px-4">You don't have access to the {targetLabel} workspace.</p>
          )}
          <button onClick={onStay} className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 text-sm font-medium transition-colors">
            <ArrowLeft size={14} /> Stay in {activeLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
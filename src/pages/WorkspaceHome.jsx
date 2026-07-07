import React from "react";
import { Navigate } from "react-router-dom";
import { useWorkspace } from "@/lib/WorkspaceContext";
import { WORKSPACE_HOME } from "@/lib/workspaces";
import WorkspaceChooser from "@/components/workspace/WorkspaceChooser";

/**
 * Smart entry point that redirects to the user's correct workspace home.
 *
 * - Not authenticated → ProtectedRoute redirects to /login
 * - Single workspace  → go straight to its home route
 * - Multiple + saved   → go to the remembered workspace
 * - Multiple + no pref  → show WorkspaceChooser
 *
 * This replaces hardcoded /dashboard links on public pages, which caused
 * workspace mismatch screens for users whose active workspace wasn't Executive.
 */
export default function WorkspaceHome() {
  const { availableWorkspaces, activeWorkspace, workspaceChosen } = useWorkspace();

  // Workspace context still initializing (auth/subscription data loading)
  if (!availableWorkspaces.length || !activeWorkspace) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="w-8 h-8 border-4 border-indigo-900 border-t-indigo-400 rounded-full animate-spin" />
      </div>
    );
  }

  // Single workspace — go directly to its home
  if (availableWorkspaces.length === 1) {
    return <Navigate to={WORKSPACE_HOME[availableWorkspaces[0]] || "/dashboard"} replace />;
  }

  // Multiple workspaces, previously chosen — go to saved workspace
  if (workspaceChosen) {
    return <Navigate to={WORKSPACE_HOME[activeWorkspace] || "/dashboard"} replace />;
  }

  // Multiple workspaces, no preference saved — let the user choose
  return <WorkspaceChooser />;
}
import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { useWorkspace } from "@/lib/WorkspaceContext";
import { getRouteWorkspace, WORKSPACE_HOME, WORKSPACES } from "@/lib/workspaces";
import { ShieldX, ArrowRight } from "lucide-react";

export default function WorkspaceGuard({ children }) {
  const location = useLocation();
  const { activeWorkspace, availableWorkspaces, setActiveWorkspace } = useWorkspace();
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    const routeWorkspaces = getRouteWorkspace(location.pathname);
    if (!routeWorkspaces || routeWorkspaces.length === 0) {
      setForbidden(false);
      return;
    }
    if (routeWorkspaces.includes(activeWorkspace)) {
      setForbidden(false);
      return;
    }
    const accessible = routeWorkspaces.find((w) => availableWorkspaces.includes(w));
    if (accessible) {
      setActiveWorkspace(accessible);
      setForbidden(false);
    } else {
      setForbidden(true);
    }
  }, [location.pathname, activeWorkspace, availableWorkspaces, setActiveWorkspace]);

  if (forbidden) return <Forbidden />;

  return children;
}

function Forbidden() {
  const { activeWorkspace, availableWorkspaces } = useWorkspace();
  const home = activeWorkspace ? WORKSPACE_HOME[activeWorkspace] : "/";
  const ws = activeWorkspace ? WORKSPACES[activeWorkspace] : null;

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/10 flex items-center justify-center mb-4 border border-red-500/20">
          <ShieldX size={28} className="text-red-400" />
        </div>
        <h1 className="text-xl font-bold text-white mb-2">403 — Access Restricted</h1>
        <p className="text-white/40 text-sm mb-6">
          This area belongs to a workspace you don't have access to. Your current workspace and role don't permit viewing this page.
        </p>
        <Link to={home} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors">
          {ws ? `Back to ${ws.label}` : "Go Home"} <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
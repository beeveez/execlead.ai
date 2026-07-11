import React, { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useWorkspace } from "@/lib/WorkspaceContext";
import { useSubscription } from "@/lib/SubscriptionContext";
import { resolveWorkspacePersona, getWorkspaceSuggestedQuestions } from "@/lib/execWorkspacePersonas";
import { MODULE_REGISTRY, WORKSPACE_REGISTRY, KNOWLEDGE_PACK_REGISTRY, SUBSCRIPTION_REGISTRY } from "@/lib/platformManifest";
import { getRouteWorkspace, WORKSPACE_HOME } from "@/lib/workspaces";
import { Network, Building2, User, Map, Package, Crown, Briefcase, Layers, ArrowRight } from "lucide-react";

export default function WorkspaceIntelligence() {
  const location = useLocation();
  const { activeWorkspace, availableWorkspaces, role, plan, profile } = useWorkspace();
  const { subscription } = useSubscription();

  const persona = useMemo(
    () => resolveWorkspacePersona(activeWorkspace, location.pathname),
    [activeWorkspace, location.pathname]
  );

  const currentModule = useMemo(
    () => MODULE_REGISTRY.find((m) => location.pathname.startsWith(m.route) && m.route !== "/dashboard") || MODULE_REGISTRY.find((m) => m.route === location.pathname),
    [location.pathname]
  );

  const workspaceInfo = WORKSPACE_REGISTRY.find((w) => w.workspaceId === activeWorkspace);
  const routeWorkspaces = getRouteWorkspace(location.pathname) || [];
  const subscriptionInfo = SUBSCRIPTION_REGISTRY.find((s) => s.planId === plan);
  const knowledgePack = currentModule?.knowledgePack
    ? KNOWLEDGE_PACK_REGISTRY.find((p) => p.packId === currentModule.knowledgePack)
    : null;

  const contextItems = [
    { label: "Current Workspace", value: workspaceInfo?.name || activeWorkspace || "Unknown", icon: Briefcase, color: "text-indigo-400" },
    { label: "Workspace ID", value: activeWorkspace || "—", icon: Network, color: "text-white/50", mono: true },
    { label: "Current Route", value: location.pathname, icon: Map, color: "text-cyan-400", mono: true },
    { label: "Current Module", value: currentModule?.moduleName || "Unregistered", icon: Layers, color: "text-purple-400" },
    { label: "Current Persona", value: persona?.tagline || "Default", icon: User, color: "text-pink-400" },
    { label: "Knowledge Pack", value: knowledgePack?.name || "None assigned", icon: Package, color: "text-amber-400" },
    { label: "Workspace Landing", value: activeWorkspace ? WORKSPACE_HOME[activeWorkspace] : "—", icon: ArrowRight, color: "text-emerald-400", mono: true },
    { label: "Current Subscription", value: subscriptionInfo?.name || plan || "free", icon: Crown, color: "text-yellow-400" },
    { label: "Current Organization", value: profile?.organization_id ? (profile?.current_company || "Organization") : "None", icon: Building2, color: "text-blue-400" },
    { label: "Context Source", value: "Workspace Registry", icon: Network, color: "text-white/40" },
  ];

  return (
    <div className="space-y-4">
      {/* Active Workspace Banner */}
      <div className="flex items-center gap-3 p-4 rounded-xl border" style={{ borderColor: `${workspaceInfo?.color || "#6366f1"}30`, background: `${workspaceInfo?.color || "#6366f1"}08` }}>
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${workspaceInfo?.color || "#6366f1"}15` }}>
          {workspaceInfo?.icon ? <workspaceInfo.icon size={20} style={{ color: workspaceInfo.color }} /> : <Network size={20} className="text-indigo-400" />}
        </div>
        <div className="flex-1">
          <div className="text-white font-semibold">{workspaceInfo?.name || activeWorkspace} Workspace</div>
          <div className="text-white/40 text-xs">{workspaceInfo?.description || "Active workspace context"}</div>
        </div>
        <div className="flex items-center gap-2">
          {availableWorkspaces.map((ws) => {
            const info = WORKSPACE_REGISTRY.find((w) => w.workspaceId === ws);
            return (
              <div key={ws} className={`px-2.5 py-1 rounded-md text-xs font-medium border ${
                ws === activeWorkspace
                  ? "bg-white/10 border-white/20 text-white"
                  : "bg-white/[0.02] border-white/5 text-white/30"
              }`}>
                {info?.name || ws}
              </div>
            );
          })}
        </div>
      </div>

      {/* Context Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        {contextItems.map((item, i) => (
          <div key={i} className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <item.icon size={12} className={item.color} />
              <span className="text-white/30 text-[10px] uppercase tracking-wider">{item.label}</span>
            </div>
            <div className={`text-sm font-medium ${item.mono ? "font-mono text-white/60" : "text-white/80"} truncate`}>
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
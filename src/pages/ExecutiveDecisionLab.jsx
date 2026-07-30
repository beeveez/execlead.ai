import React, { useState } from "react";
import { Compass, LayoutDashboard, FolderOpen, History, Fingerprint, BarChart3, Trophy, Plus, Settings } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useDecisionLab } from "@/hooks/useDecisionLab";
import DecisionLabDashboard from "@/components/decision-lab/DecisionLabDashboard";
import ScenarioBrowser from "@/components/decision-lab/ScenarioBrowser";
import ScenarioPlayer from "@/components/decision-lab/ScenarioPlayer";
import DecisionHistory from "@/components/decision-lab/DecisionHistory";
import DecisionDNA from "@/components/decision-lab/DecisionDNA";
import DecisionAnalytics from "@/components/decision-lab/DecisionAnalytics";
import DecisionAchievements from "@/components/decision-lab/DecisionAchievements";
import CreateScenario from "@/components/decision-lab/CreateScenario";
import DecisionLabSettings from "@/components/decision-lab/DecisionLabSettings";

const ADMIN_ROLES = ["super_admin", "platform_admin", "admin", "developer", "enterprise_admin"];

/**
 * ExecutiveDecisionLab — flagship Strategic Decision Intelligence workspace.
 * Internal tab navigation across Dashboard, Scenario Library, the live
 * Scenario Player, History, Decision DNA™, Analytics, Achievements, and
 * admin Scenario authoring.
 */
export default function ExecutiveDecisionLab() {
  const ld = useDecisionLab();
  const { user } = useAuth();
  const [tab, setTab] = useState("dashboard");
  const [activeScenario, setActiveScenario] = useState(null);

  const isAdmin = ADMIN_ROLES.includes(user?.role);
  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "scenarios", label: "Scenario Library™", icon: FolderOpen },
    { id: "history", label: "History", icon: History },
    { id: "dna", label: "Decision DNA™", icon: Fingerprint },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "achievements", label: "Achievements™", icon: Trophy },
    ...(isAdmin ? [{ id: "create", label: "Create Scenario", icon: Plus }] : []),
    { id: "settings", label: "Settings", icon: Settings },
  ];

  if (ld.loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-indigo-900 border-t-indigo-400 rounded-full animate-spin" /></div>;
  }

  const openScenario = (s) => { setActiveScenario(s); setTab("player"); };
  const exitScenario = () => { setActiveScenario(null); setTab("scenarios"); };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-amber-500 flex items-center justify-center">
          <Compass size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white">Executive Decision Lab™</h1>
          <p className="text-[11px] text-white/40">Strategic Decision Intelligence Platform</p>
        </div>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
        {tabs.map((t) => {
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${active ? "bg-indigo-500 text-white" : "bg-white/[0.02] border border-white/5 text-white/60 hover:text-white hover:bg-white/[0.05]"}`}>
              <t.icon size={13} /> {t.label}
            </button>
          );
        })}
      </div>

      {tab === "dashboard" && <DecisionLabDashboard ld={ld} onTab={setTab} onOpen={openScenario} />}
      {tab === "scenarios" && <ScenarioBrowser ld={ld} onOpen={openScenario} />}
      {tab === "player" && activeScenario && <ScenarioPlayer scenario={activeScenario} ld={ld} onExit={exitScenario} />}
      {tab === "history" && <DecisionHistory ld={ld} />}
      {tab === "dna" && <DecisionDNA ld={ld} />}
      {tab === "analytics" && <DecisionAnalytics ld={ld} />}
      {tab === "achievements" && <DecisionAchievements ld={ld} />}
      {tab === "create" && isAdmin && <CreateScenario ld={ld} />}
      {tab === "settings" && <DecisionLabSettings />}
    </div>
  );
}
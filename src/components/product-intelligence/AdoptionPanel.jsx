import React from "react";
import { BarChart3, Cpu, Shield, ShoppingCart, GraduationCap, Command } from "lucide-react";
import { Panel, BarRow, StatCard, Empty } from "./Shared";

export default function AdoptionPanel({ data }) {
  if (!data) return null;
  const { productAdoption, adoption } = data;
  const fa = productAdoption.featureAdoption;
  const maxModule = productAdoption.topModules[0]?.count || 1;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard icon={BarChart3} label="Active Users" value={adoption.activeUsers} sub={`${adoption.adoptionRate}% adoption`} color="indigo" />
        <StatCard icon={Cpu} label="Modules Accessed" value={adoption.modulesAccessed} sub={`${adoption.totalEvents} total events`} color="cyan" />
        <StatCard icon={Command} label="Pages Visited" value={adoption.uniquePagesVisited} sub={`${adoption.avgEventsPerUser} avg/user`} color="purple" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <FeatureStat icon={Cpu} label="AI" value={fa.ai} />
        <FeatureStat icon={Shield} label="Governance" value={fa.governance} />
        <FeatureStat icon={Shield} label="Security" value={fa.security} />
        <FeatureStat icon={ShoppingCart} label="Commercial" value={fa.commercial} />
        <FeatureStat icon={GraduationCap} label="Learning" value={fa.learning} />
        <FeatureStat icon={Command} label="Cmd Palette" value={fa.commandPalette} />
      </div>

      <Panel title="Top Modules by Usage">
        {productAdoption.topModules.length === 0 ? (
          <Empty text="No module usage recorded yet." />
        ) : (
          <div>
            {productAdoption.topModules.map((m, i) => (
              <BarRow key={i} label={m.path} value={m.count} max={maxModule} color={i === 0 ? "bg-indigo-500/60" : "bg-indigo-500/30"} />
            ))}
          </div>
        )}
      </Panel>

      <Panel title="Workspace Adoption">
        {productAdoption.workspaceBreakdown.length === 0 ? (
          <Empty text="No workspace data yet." />
        ) : (
          <div>
            {productAdoption.workspaceBreakdown.map((w, i) => (
              <BarRow key={i} label={w.workspace} value={w.count} max={productAdoption.workspaceBreakdown[0]?.count || 1} color="bg-purple-500/40" />
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}

function FeatureStat({ icon: Icon, label, value }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 text-center">
      <Icon className="mx-auto text-white/40 mb-1" size={16} />
      <div className="text-lg font-bold text-white">{value}</div>
      <div className="text-white/30 text-[10px]">{label}</div>
    </div>
  );
}
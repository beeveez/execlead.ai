import React from 'react';
import { Boxes } from 'lucide-react';
import { SectionShell, KpiCard, StatCard } from './Shared';

export default function TwinDashboard({ twin }) {
  return (
    <SectionShell title="Digital Twin Dashboard™" subtitle="Real-time model of EXECLEAD.AI as a living enterprise system" icon={Boxes}>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Modules" value={twin.stats.modules} sub={`${twin.stats.workspaces} workspaces`} color="#6366f1" />
        <StatCard label="AI Engines" value={twin.stats.aiEngines} sub={`${twin.stats.entities} entities`} color="#06b6d4" />
        <StatCard label="Capabilities" value={twin.stats.capabilities} sub={`${twin.stats.routes} routes`} color="#10b981" />
        <StatCard label="Graph Edges" value={twin.stats.edges} sub="interconnections" color="#f59e0b" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
        {twin.kpis.map((k) => <KpiCard key={k.id} kpi={k} />)}
      </div>
    </SectionShell>
  );
}
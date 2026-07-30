import React, { useMemo } from 'react';
import { AlertTriangle } from 'lucide-react';
import { SectionShell, Badge, StatCard } from './Shared';
import { computeTwinSnapshot } from '@/lib/platformDigitalTwin';

export default function RiskSimulation() {
  const twin = useMemo(() => computeTwinSnapshot(), []);
  return (
    <SectionShell title="Risk Simulation™" subtitle="Failure scenarios across modules, AI engines, and security boundaries" icon={AlertTriangle}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {twin.riskSimulations.map((r, i) => (
          <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">{r.scenario}</h3>
              <Badge color={r.severity === 'Critical' ? 'rose' : r.severity === 'High' ? 'amber' : 'slate'}>{r.severity}</Badge>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <StatCard label="Blast Radius" value={`${r.blastRadius} mods`} color="#f43f5e" />
              <StatCard label="Probability" value={`${r.probability}%`} color="#f59e0b" />
              <StatCard label="Recovery" value={r.recovery} color="#06b6d4" />
            </div>
            <p className="text-[11px] text-white/40">🛡️ {r.mitigation}</p>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}
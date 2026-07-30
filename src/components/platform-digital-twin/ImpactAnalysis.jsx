import React, { useState, useMemo } from 'react';
import { GitFork } from 'lucide-react';
import { SectionShell, Badge, StatCard } from './Shared';
import { computeTwinSnapshot, computeImpactFor } from '@/lib/platformDigitalTwin';

export default function ImpactAnalysis() {
  const twin = useMemo(() => computeTwinSnapshot(), []);
  const modules = twin.graph.nodes.filter((n) => n.type === 'module');
  const [target, setTarget] = useState(modules[0]?.refId);
  const [impact, setImpact] = useState(null);
  const [running, setRunning] = useState(false);

  const analyze = async (id) => {
    setTarget(id); setRunning(true);
    await new Promise((r) => setTimeout(r, 300));
    setImpact(computeImpactFor(`m:${id}`));
    setRunning(false);
  };

  return (
    <SectionShell title="Impact Analysis™" subtitle="Click any module to instantly compute its blast radius across the platform" icon={GitFork}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-2 max-h-[500px] overflow-y-auto">
          {modules.map((m) => (
            <button key={m.refId} onClick={() => analyze(m.refId)} className={`w-full text-left px-3 py-2 rounded-lg text-xs mb-0.5 ${target === m.refId ? 'bg-indigo-500/15 text-indigo-300' : 'text-white/60 hover:bg-white/5'}`}>{m.label}</button>
          ))}
        </div>
        <div className="lg:col-span-2">
          {running && <div className="text-xs text-white/40 py-8 text-center">Computing blast radius…</div>}
          {impact && !running && (
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between"><h3 className="text-sm font-bold text-white">{impact.node.label}</h3><Badge color="violet">{impact.node.type}</Badge></div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <StatCard label="Modules Impacted" value={impact.modulesImpacted} color="#f43f5e" />
                <StatCard label="Users Impacted" value={impact.usersImpacted.toLocaleString()} color="#6366f1" />
                <StatCard label="AI Engines Impacted" value={impact.aiEnginesImpacted} color="#ec4899" />
                <StatCard label="Routes Impacted" value={impact.routesImpacted} color="#06b6d4" />
                <StatCard label="Entities Impacted" value={impact.entitiesImpacted} color="#8b5cf6" />
                <StatCard label="Capabilities Impacted" value={impact.businessCapabilitiesImpacted} color="#14b8a6" />
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge color="amber">Exec Competencies: {impact.executiveCompetenciesImpacted}</Badge>
                <Badge color={impact.commercialImpact === 'High' ? 'rose' : 'slate'}>Commercial: {impact.commercialImpact}</Badge>
                <Badge color={impact.architectureRisk === 'Critical' ? 'rose' : impact.architectureRisk === 'High' ? 'amber' : 'emerald'}>Arch Risk: {impact.architectureRisk}</Badge>
                <Badge color={impact.securityRisk === 'Elevated' ? 'rose' : 'emerald'}>Security: {impact.securityRisk}</Badge>
                <Badge color="violet">Tech Debt Impact: {impact.technicalDebtImpact}</Badge>
              </div>
              {impact.impactedModules.length > 0 && <div><div className="text-[10px] text-white/40 uppercase mb-1">Impacted Modules</div><div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">{impact.impactedModules.map((m) => <Badge key={m.id} color="slate">{m.name}</Badge>)}</div></div>}
            </div>
          )}
          {!impact && !running && <div className="text-xs text-white/40 text-center py-8">Select a module to analyze.</div>}
        </div>
      </div>
    </SectionShell>
  );
}
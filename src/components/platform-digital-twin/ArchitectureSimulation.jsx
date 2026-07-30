import React, { useState, useMemo } from 'react';
import { FlaskConical, Play } from 'lucide-react';
import { SectionShell, Badge, StatCard } from './Shared';
import { computeTwinSnapshot, computeSimulationFor } from '@/lib/platformDigitalTwin';

export default function ArchitectureSimulation() {
  const twin = useMemo(() => computeTwinSnapshot(), []);
  const mods = twin.graph.nodes.filter((n) => n.type === 'module');
  const [action, setAction] = useState('remove');
  const [target, setTarget] = useState(mods[0]?.refId);
  const [secondary, setSecondary] = useState(mods[1]?.refId);
  const [result, setResult] = useState(null);
  const [running, setRunning] = useState(false);

  const run = async () => {
    setRunning(true);
    await new Promise((r) => setTimeout(r, 350));
    setResult(computeSimulationFor(action, target, action === 'merge' ? secondary : null));
    setRunning(false);
  };

  return (
    <SectionShell title="Architecture Simulation™" subtitle="Run what-if scenarios and measure consequences before you decide" icon={FlaskConical}>
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[10px] text-white/40 uppercase">Action</label>
            <select value={action} onChange={(e) => setAction(e.target.value)} className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white">
              {twin.actions.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
            </select>
            <p className="text-[10px] text-white/30 mt-1">{twin.actions.find((a) => a.id === action)?.desc}</p>
          </div>
          <div>
            <label className="text-[10px] text-white/40 uppercase">{action === 'merge' ? 'Primary Module' : 'Target Module'}</label>
            <select value={target} onChange={(e) => setTarget(e.target.value)} className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white">
              {mods.map((m) => <option key={m.refId} value={m.refId}>{m.label}</option>)}
            </select>
          </div>
          {action === 'merge' && (
            <div>
              <label className="text-[10px] text-white/40 uppercase">Merge With</label>
              <select value={secondary} onChange={(e) => setSecondary(e.target.value)} className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white">
                {mods.map((m) => <option key={m.refId} value={m.refId}>{m.label}</option>)}
              </select>
            </div>
          )}
        </div>
        <button onClick={run} disabled={running} className="flex items-center gap-2 px-4 py-2 bg-indigo-500/15 text-indigo-300 rounded-lg text-sm font-medium hover:bg-indigo-500/25 disabled:opacity-50">
          <Play size={14} /> {running ? 'Simulating…' : 'Run Simulation'}
        </button>
      </div>
      {result && (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div><Badge color="violet">{result.action}</Badge><h3 className="text-sm font-bold text-white mt-1">{result.target}</h3></div>
            <Badge color={result.recommendedDecision.startsWith('Approve') ? 'emerald' : result.recommendedDecision.startsWith('Reject') ? 'rose' : 'amber'}>{result.recommendedDecision}</Badge>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="Affected Modules" value={result.affectedModules} color="#f43f5e" />
            <StatCard label="Broken Dependencies" value={result.brokenDependencies} color="#f59e0b" />
            <StatCard label="Engineering Cost" value={`${result.engineeringCost}h`} color="#6366f1" />
            <StatCard label="Recovery Time" value={`${result.recoveryTime}h`} color="#06b6d4" />
            <StatCard label="Business Risk" value={result.businessRisk} color="#f43f5e" />
            <StatCard label="Executive Impact" value={result.executiveImpact} color="#8b5cf6" />
            <StatCard label="Customer Impact" value={result.customerImpact} color="#10b981" />
            <StatCard label="Revenue Risk" value={result.revenueRisk} color="#f59e0b" />
          </div>
          <div className="flex items-center gap-2"><span className="text-xs text-white/40">Architecture Score Change:</span><Badge color={result.architectureScoreChange >= 0 ? 'emerald' : 'rose'}>{result.architectureScoreChange >= 0 ? '+' : ''}{result.architectureScoreChange}</Badge></div>
          {result.dependents.length > 0 && <div><div className="text-[10px] text-white/40 uppercase mb-1">Dependents That Would Break</div><div className="flex flex-wrap gap-1">{result.dependents.map((d) => <Badge key={d} color="rose">{d}</Badge>)}</div></div>}
        </div>
      )}
    </SectionShell>
  );
}
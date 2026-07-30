import React from 'react';
import { SectionShell, Badge, EmptyState } from '@/components/platform-knowledge/PKShared';
import { getDependencyRisk } from '@/lib/platformIntelligenceEngine/index';
import { Network } from 'lucide-react';

const RISK_COLOR = { critical: '#ef4444', high: '#f59e0b', medium: '#f59e0b', low: '#10b981' };

function List({ title, items, render }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-white/60 mb-2">{title}</h3>
      {items.length === 0 ? <EmptyState text="None detected." /> : <div className="space-y-2">{items.map((it, i) => render(it, i))}</div>}
    </div>
  );
}

export default function DependencyRisk() {
  const risk = getDependencyRisk();
  return (
    <SectionShell title="Dependency Risk™" subtitle="Analyze every dependency for single points of failure, circular coupling, and bottlenecks" icon={Network}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <List title={`Single Points of Failure (${risk.singlePointsOfFailure.length})`} items={risk.singlePointsOfFailure}
          render={(f) => (
            <div key={f.module.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-white font-medium">{f.module.name}</span>
                <Badge color={RISK_COLOR[f.risk]}>{f.count} dependents</Badge>
              </div>
              <div className="text-[10px] text-white/40">Depended on by: {f.deps.join(', ')}</div>
            </div>
          )} />

        <List title={`Circular Dependencies (${risk.circularDependencies.length})`} items={risk.circularDependencies}
          render={(c, i) => <div key={i} className="bg-white/[0.02] border border-amber-500/20 rounded-xl p-3 text-xs text-amber-400 font-mono">{c}</div>} />

        <List title={`High-Risk Modules (${risk.highRiskModules.length})`} items={risk.highRiskModules}
          render={(h) => (
            <div key={h.module.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-3 flex items-center justify-between">
              <div><div className="text-sm text-white">{h.module.name}</div><div className="text-[10px] text-white/40">{h.module.securityClassification} · complexity {h.module.complexity}</div></div>
              <Badge color={RISK_COLOR[h.risk]}>{h.risk}</Badge>
            </div>
          )} />

        <List title={`Highly Coupled (${risk.highlyCoupledSystems.length})`} items={risk.highlyCoupledSystems}
          render={(f) => (
            <div key={f.module.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
              <div className="flex items-center justify-between mb-1"><span className="text-sm text-white">{f.module.name}</span><Badge color="#f59e0b">{f.count} deps</Badge></div>
              <div className="text-[10px] text-white/40">Depends on: {f.deps.join(', ')}</div>
            </div>
          )} />

        <List title={`Critical Infrastructure (${risk.criticalInfrastructure.length})`} items={risk.criticalInfrastructure}
          render={(m) => <div key={m.id} className="bg-white/[0.02] border border-rose-500/20 rounded-xl p-3"><div className="text-sm text-white">{m.name}</div><div className="text-[10px] text-white/40">{m.purpose}</div></div>} />

        <List title={`AI Engine Bottlenecks (${risk.aiEngineBottlenecks.length})`} items={risk.aiEngineBottlenecks}
          render={(b) => <div key={b.engine.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-3"><div className="text-sm text-white">{b.engine.name}</div><div className="text-[10px] text-amber-400">{b.reason}</div></div>} />

        <List title={`Database Bottlenecks (${risk.databaseBottlenecks.length})`} items={risk.databaseBottlenecks}
          render={(b) => <div key={b.entity.name} className="bg-white/[0.02] border border-white/5 rounded-xl p-3"><div className="text-sm text-white">{b.entity.name}</div><div className="text-[10px] text-amber-400">{b.reason}</div></div>} />
      </div>

      <div className="bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 rounded-2xl p-4">
        <h3 className="text-xs font-semibold text-white mb-2">Architecture Improvement Recommendations</h3>
        <div className="space-y-1.5">
          {risk.recommendations.map((r, i) => <div key={i} className="flex items-start gap-2 text-[11px] text-white/60"><span className="text-indigo-400 mt-0.5">→</span><span>{r}</span></div>)}
        </div>
      </div>
    </SectionShell>
  );
}
import React from 'react';
import { Network, Database, Target, Boxes } from 'lucide-react';

export default function GraphHealthPanel({ graphHealth, registryHealth, recStats }) {
  const metrics = [
    { icon: Network, label: "Intelligence Nodes", value: graphHealth.nodeCount, color: "text-indigo-400" },
    { icon: Network, label: "Intelligence Edges", value: graphHealth.edgeCount, color: "text-sky-400" },
    { icon: Target, label: "Graph Health™", value: `${graphHealth.healthScore}%`, color: graphHealth.healthScore === 100 ? "text-emerald-400" : "text-amber-400" },
    { icon: Boxes, label: "Experiences Registered", value: registryHealth.totalExperiences, color: "text-violet-400" },
    { icon: Database, label: "Intelligence Coverage", value: `${registryHealth.coverage}%`, color: "text-cyan-400" },
    { icon: Target, label: "Recommendation Types", value: recStats.types.length, color: "text-amber-400" },
  ];

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 text-white/50 text-xs uppercase tracking-widest mb-4">
        <Network size={12} className="text-indigo-400" />
        Intelligence Graph™ & Registry
      </div>
      <div className="grid grid-cols-2 gap-3">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Icon size={12} className={m.color} />
                <span className="text-[9px] text-white/30 uppercase tracking-wider">{m.label}</span>
              </div>
              <div className={`text-lg font-bold ${m.color}`}>{m.value}</div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 pt-3 border-t border-white/5">
        <div className="text-[10px] text-white/30 leading-relaxed">
          {graphHealth.isolatedNodes === 0
            ? "✓ No isolated intelligence — all modules are connected."
            : `${graphHealth.isolatedNodes} isolated node(s) detected.`}
        </div>
        <div className="text-[10px] text-white/30 leading-relaxed mt-1">
          Avg connections per node: {graphHealth.avgConnections} · Connectedness: {graphHealth.connectedness}%
        </div>
      </div>
    </div>
  );
}
import React from 'react';
import { Zap } from 'lucide-react';
import { NODE_TYPES, buildImpactTree, flattenImpactTree, calculateTotalImpact } from '@/lib/identityGraphEngine';

export default function ImpactExplainer({ sourceNode }) {
  if (!sourceNode) {
    return (
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6 text-center">
        <p className="text-xs text-white/30">Select a node and click "Simulate Impact Chain" to see the downstream effects.</p>
      </div>
    );
  }

  const tree = buildImpactTree(sourceNode);
  const steps = flattenImpactTree(tree);
  const { totalImpact, affectedModules } = calculateTotalImpact(sourceNode);
  const sourceMeta = NODE_TYPES[sourceNode];

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Zap size={14} className="text-violet-400" />
        <span className="text-sm font-bold text-white">Executive Impact Explainer™</span>
        <span className="text-[10px] text-white/30 ml-auto">{steps.length} impact steps</span>
      </div>

      {/* Source */}
      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/5">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: sourceMeta.color + '20' }}>
          <span className="text-xs font-bold" style={{ color: sourceMeta.color }}>{sourceMeta.label.charAt(0)}</span>
        </div>
        <div>
          <div className="text-sm font-medium text-white">{sourceMeta.label}</div>
          <div className="text-[10px] text-white/30">Source entity — change detected</div>
        </div>
      </div>

      {/* Impact Chain */}
      <div className="space-y-1 mb-4 max-h-[300px] overflow-y-auto">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-2 text-[11px]" style={{ paddingLeft: step.depth * 16 }}>
            <span className="text-white/20">{'└'}</span>
            <span className="text-violet-400 font-medium">{step.type}</span>
            <span className="text-white/40">→</span>
            <span className="text-white/70 truncate">{NODE_TYPES[step.target]?.label.replace('™', '')}</span>
            <span className="text-indigo-400 ml-auto">+{step.weight}</span>
            {step.cyclic && <span className="text-amber-400 text-[9px]">cycle</span>}
          </div>
        ))}
      </div>

      {/* Affected Modules Summary */}
      <div className="pt-3 border-t border-white/5">
        <div className="text-[10px] uppercase tracking-wider text-white/30 mb-2">Affected Modules ({affectedModules.length})</div>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {totalImpact.map(({ target, weight }) => {
            const meta = NODE_TYPES[target];
            return (
              <div key={target} className="flex items-center gap-1.5 px-2 py-1 rounded-lg" style={{ backgroundColor: meta.color + '10', border: `1px solid ${meta.color}20` }}>
                <span className="text-[10px] text-white/70">{meta.label.replace('™', '')}</span>
                <span className="text-[10px] font-bold" style={{ color: meta.color }}>+{weight}</span>
              </div>
            );
          })}
        </div>

        {/* Score breakdown */}
        <div className="bg-white/[0.02] rounded-lg p-3">
          <div className="text-[10px] uppercase tracking-wider text-white/30 mb-2">Why did this score change?</div>
          <div className="space-y-1">
            {totalImpact.map(({ target, weight }) => {
              const meta = NODE_TYPES[target];
              return (
                <div key={target} className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: meta.color }} />
                    <span className="text-white/60">{meta.label.replace('™', '')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white/30 text-[10px]">via {sourceMeta.label.replace('™', '')}</span>
                    <span className="text-white font-medium">+{weight}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
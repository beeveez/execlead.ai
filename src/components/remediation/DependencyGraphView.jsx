import React, { useMemo } from 'react';
import { X, GitBranch, Shield, TrendingUp, Award, CheckCircle2 } from 'lucide-react';
import { getDependencyGraph } from '@/lib/remediationEngine';

const NODE_STYLES = {
  blocker: { color: '#ef4444', bg: 'bg-red-500/10', border: 'border-red-500/20', label: 'Blocker' },
  dependency: { color: '#f59e0b', bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: 'Dependency' },
  kpi: { color: '#6366f1', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', label: 'KPI' },
  certification: { color: '#10b981', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: 'Certification' },
  commercial: { color: '#8b5cf6', bg: 'bg-purple-500/10', border: 'border-purple-500/20', label: 'Commercial' },
  release: { color: '#06b6d4', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', label: 'Release' },
};

export default function DependencyGraphView({ blocker, onClose }) {
  const graph = useMemo(() => getDependencyGraph(blocker), [blocker]);
  if (!graph) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-3xl bg-[#0d0d14] border border-white/10 rounded-2xl p-6 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <GitBranch size={16} className="text-white/40" />
            <h3 className="text-sm font-bold text-white">Dependency Graph</h3>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        <p className="text-xs text-white/40 mb-4">Visualizes the cascade from blocking capability → dependent capabilities → affected KPIs → certification → commercial readiness → release integrity. Click any node to navigate.</p>

        {/* Vertical Flow */}
        <div className="space-y-2">
          {graph.nodes.map((node, i) => {
            const style = NODE_STYLES[node.type] || NODE_STYLES.blocker;
            return (
              <div key={node.id}>
                <button className={`w-full flex items-center gap-3 p-3 rounded-xl ${style.bg} border ${style.border} hover:scale-[1.01] transition-transform text-left`}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${style.color}20` }}>
                    {node.type === 'blocker' ? <Shield size={14} style={{ color: style.color }} /> :
                     node.type === 'kpi' ? <TrendingUp size={14} style={{ color: style.color }} /> :
                     node.type === 'certification' || node.type === 'release' ? <Award size={14} style={{ color: style.color }} /> :
                     <CheckCircle2 size={14} style={{ color: style.color }} />}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-white font-medium">{node.label}</div>
                    <div className="text-[10px] uppercase tracking-wider" style={{ color: style.color }}>{style.label}</div>
                  </div>
                </button>
                {i < graph.nodes.length - 1 && (
                  <div className="flex justify-center py-1">
                    <div className="w-px h-4 bg-white/10" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap gap-3">
          {Object.entries(NODE_STYLES).map(([key, style]) => (
            <div key={key} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: style.color }} />
              <span className="text-[10px] text-white/40">{style.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
import React from 'react';
import { NODE_TYPES, getIncomingRelationships, getOutgoingRelationships, getDependentModules } from '@/lib/identityGraphEngine';
import { ArrowRight, ArrowLeft, GitBranch, Zap } from 'lucide-react';

export default function NodeInspector({ selected, nodeData, onSimulate }) {
  if (!selected) {
    return (
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6 text-center h-full flex flex-col items-center justify-center">
        <GitBranch size={28} className="text-white/10 mb-2" />
        <p className="text-xs text-white/30">Click any node in the graph to inspect its relationships and downstream impact.</p>
      </div>
    );
  }

  const meta = NODE_TYPES[selected];
  const incoming = getIncomingRelationships(selected);
  const outgoing = getOutgoingRelationships(selected);
  const dependents = getDependentModules(selected);
  const data = nodeData?.[selected];

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 h-full">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: meta.color + '20' }}>
          <span className="text-xs font-bold" style={{ color: meta.color }}>{meta.label.charAt(0)}</span>
        </div>
        <div>
          <div className="text-sm font-bold text-white">{meta.label}</div>
          <div className="text-[10px] uppercase tracking-wider text-white/30">{meta.category}</div>
        </div>
        {data !== undefined && data !== null && (
          <div className="ml-auto text-right">
            <div className="text-lg font-bold" style={{ color: meta.color }}>{data}</div>
            <div className="text-[9px] text-white/30">records</div>
          </div>
        )}
      </div>

      {/* Incoming */}
      <div className="mb-4">
        <div className="flex items-center gap-1.5 mb-2">
          <ArrowLeft size={11} className="text-blue-400" />
          <span className="text-[10px] uppercase tracking-wider text-white/30">Incoming Relationships</span>
        </div>
        {incoming.length === 0 ? (
          <p className="text-[11px] text-white/20">No incoming relationships</p>
        ) : (
          <div className="space-y-1">
            {incoming.map((rel, i) => (
              <div key={i} className="flex items-center gap-2 text-[11px] bg-white/[0.02] rounded px-2 py-1">
                <span className="text-white/60 truncate flex-1">{NODE_TYPES[rel.source].label}</span>
                <span className="text-blue-400 font-medium">{rel.type}</span>
                <span className="text-indigo-400">+{rel.weight}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Outgoing */}
      <div className="mb-4">
        <div className="flex items-center gap-1.5 mb-2">
          <ArrowRight size={11} className="text-emerald-400" />
          <span className="text-[10px] uppercase tracking-wider text-white/30">Outgoing Relationships</span>
        </div>
        {outgoing.length === 0 ? (
          <p className="text-[11px] text-white/20">No outgoing relationships</p>
        ) : (
          <div className="space-y-1">
            {outgoing.map((rel, i) => (
              <div key={i} className="flex items-center gap-2 text-[11px] bg-white/[0.02] rounded px-2 py-1">
                <span className="text-emerald-400 font-medium">{rel.type}</span>
                <span className="text-white/60 truncate flex-1">{NODE_TYPES[rel.target].label}</span>
                <span className="text-indigo-400">+{rel.weight}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dependent Modules */}
      <div className="mb-4">
        <div className="flex items-center gap-1.5 mb-2">
          <GitBranch size={11} className="text-violet-400" />
          <span className="text-[10px] uppercase tracking-wider text-white/30">Dependent Modules ({dependents.length})</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {dependents.map(dep => (
            <span key={dep} className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-400 border border-violet-500/20">
              {NODE_TYPES[dep].label.replace('™', '')}
            </span>
          ))}
        </div>
      </div>

      <button
        onClick={() => onSimulate(selected)}
        className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-medium hover:bg-violet-500/20 transition-colors"
      >
        <Zap size={12} /> Simulate Impact Chain
      </button>
    </div>
  );
}
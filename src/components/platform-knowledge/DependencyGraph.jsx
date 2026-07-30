import React, { useState, useMemo } from 'react';
import { SectionShell, Badge } from './PKShared';
import { MODULES, DEPENDENCY_EDGES } from '@/lib/platformKnowledgeCenter';
import { Share2 } from 'lucide-react';

const LAYER_ORDER = ['evidence-vault', 'readiness-engine', 'recommendation-intelligence', 'outcome-intelligence', 'coach', 'decision-lab', 'journey-orchestrator', 'executive-portfolio', 'dashboard', 'commercial-command-center', 'business-intelligence'];

export default function DependencyGraph({ onSelectModule }) {
  const [selected, setSelected] = useState(null);

  const nodes = useMemo(() => {
    const ids = new Set();
    DEPENDENCY_EDGES.forEach((e) => { ids.add(e.from); ids.add(e.to); });
    return [...ids].map((id) => MODULES.find((m) => m.id === id)).filter(Boolean);
  }, []);

  const layers = useMemo(() => {
    const placed = {};
    const place = (id, depth = 0) => {
      if (placed[id] !== undefined) return placed[id];
      const deps = DEPENDENCY_EDGES.filter((e) => e.to === id).map((e) => e.from);
      let d = depth;
      deps.forEach((dep) => { d = Math.max(d, place(dep, depth) + 1); });
      placed[id] = d;
      return d;
    };
    nodes.forEach((n) => place(n.id));
    const maxLayer = Math.max(...Object.values(placed), 0);
    const cols = [];
    for (let i = 0; i <= maxLayer; i++) cols.push([]);
    nodes.forEach((n) => cols[placed[n.id]]?.push(n));
    return cols;
  }, [nodes]);

  const relatedEdges = selected
    ? DEPENDENCY_EDGES.filter((e) => e.from === selected || e.to === selected)
    : DEPENDENCY_EDGES;

  return (
    <SectionShell title="Module Dependencies™" subtitle="Interactive dependency graph — click any node to explore" icon={Share2}>
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 overflow-x-auto">
        <div className="flex gap-8 min-w-max">
          {layers.map((col, i) => (
            <div key={i} className="flex flex-col gap-3">
              {col.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelected(selected === m.id ? null : m.id)}
                  className={`px-3 py-2.5 rounded-lg border text-left transition-all w-48 ${selected === m.id ? 'border-indigo-500/50 bg-indigo-500/15 ring-2 ring-indigo-500/30' : 'border-white/10 bg-white/[0.02] hover:border-white/25'}`}
                >
                  <div className="text-xs font-semibold text-white truncate">{m.name}</div>
                  <div className="text-[10px] text-white/30">{m.category}</div>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
      {selected && (
        <div className="bg-white/[0.02] border border-indigo-500/20 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white">{MODULES.find((m) => m.id === selected)?.name}</h3>
            <button onClick={() => onSelectModule?.(selected)} className="text-[11px] text-indigo-400 hover:text-indigo-300">Open module →</button>
          </div>
          <div className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Relationships ({relatedEdges.length})</div>
          <div className="space-y-1.5">
            {relatedEdges.map((e, i) => {
              const other = e.from === selected ? e.to : e.from;
              const otherMod = MODULES.find((m) => m.id === other);
              return (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <Badge color={e.from === selected ? '#10b981' : '#0ea5e9'}>{e.type}</Badge>
                  <span className="text-white/40">{e.from === selected ? '→' : '←'}</span>
                  <button onClick={() => setSelected(other)} className="text-white/70 hover:text-indigo-400">{otherMod?.name || other}</button>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {!selected && (
        <div className="text-[10px] text-white/30 text-center pt-2">{nodes.length} modules · {DEPENDENCY_EDGES.length} relationships — click a node to trace dependencies</div>
      )}
    </SectionShell>
  );
}
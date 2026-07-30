import React, { useState, useMemo } from 'react';
import { Network, X } from 'lucide-react';
import { SectionShell, Badge } from './Shared';
import { computeTwinSnapshot, WORKSPACE_META, CAPABILITIES } from '@/lib/platformDigitalTwin';

const TYPE_RING = [
  { type: 'platform', r: 8, color: '#f59e0b' },
  { type: 'workspace', r: 70, color: '#6366f1' },
  { type: 'capability', r: 130, color: '#14b8a6' },
  { type: 'module', r: 195, color: '#06b6d4' },
  { type: 'ai-engine', r: 250, color: '#ec4899' },
  { type: 'entity', r: 300, color: '#8b5cf6' },
];
const NODE_METRICS = ['health', 'businessValue', 'risk', 'complexity', 'aiQuality', 'techDebt'];

export default function ExecutiveIntelligenceGraph() {
  const twin = useMemo(() => computeTwinSnapshot(), []);
  const [selected, setSelected] = useState(null);
  const [metric, setMetric] = useState('health');
  const [focusType, setFocusType] = useState('all');

  // Position nodes on concentric rings
  const positioned = useMemo(() => {
    const cx = 350, cy = 350;
    const byType = {};
    twin.graph.nodes.forEach((n) => { (byType[n.type] = byType[n.type] || []).push(n); });
    const pos = {};
    TYPE_RING.forEach(({ type, r }) => {
      const arr = byType[type] || [];
      arr.forEach((n, i) => {
        const ang = (i / arr.length) * Math.PI * 2;
        pos[n.id] = { x: cx + r * Math.cos(ang), y: cy + r * Math.sin(ang) };
      });
    });
    return pos;
  }, [twin]);

  const visibleNodes = twin.graph.nodes.filter((n) => focusType === 'all' || n.type === focusType);
  const valFor = (n) => (n[metric] != null ? n[metric] : 50);
  const colorFor = (v) => v >= 80 ? '#10b981' : v >= 60 ? '#f59e0b' : '#f43f5e';

  return (
    <SectionShell title="Executive Intelligence Graph™" subtitle="Every workspace, module, engine, entity, and capability as an interconnected node" icon={Network}
      actions={<div className="flex gap-1 flex-wrap">
        <select value={metric} onChange={(e) => setMetric(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white">
          {NODE_METRICS.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        <select value={focusType} onChange={(e) => setFocusType(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white">
          <option value="all">All layers</option>
          {TYPE_RING.map((r) => <option key={r.type} value={r.type}>{r.type}</option>)}
        </select>
      </div>}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white/[0.02] border border-white/5 rounded-xl p-2 overflow-auto">
          <svg viewBox="0 0 700 700" className="w-full h-auto" style={{ maxHeight: 600 }}>
            {/* edges */}
            {twin.graph.edges.filter((e) => positioned[e.from] && positioned[e.to] && (focusType === 'all' || twin.graph.byId[e.from]?.type === focusType || twin.graph.byId[e.to]?.type === focusType)).map((e, i) => (
              <line key={i} x1={positioned[e.from].x} y1={positioned[e.from].y} x2={positioned[e.to].x} y2={positioned[e.to].y} stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
            ))}
            {/* nodes */}
            {visibleNodes.map((n) => {
              const p = positioned[n.id]; if (!p) return null;
              const v = valFor(n); const r = n.type === 'platform' ? 14 : n.type === 'workspace' ? 10 : n.type === 'capability' ? 8 : n.type === 'module' ? 6 : 4;
              return <circle key={n.id} cx={p.x} cy={p.y} r={r} fill={colorFor(v)} stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" className="cursor-pointer hover:opacity-80" onClick={() => setSelected(n)}><title>{n.label} — {metric}: {v}</title></circle>;
            })}
          </svg>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          {selected ? <NodeDetail node={selected} onClose={() => setSelected(null)} twin={twin} /> : <div className="text-xs text-white/40 text-center py-8">Click any node to inspect its health, dependencies, value, risk, and investment.</div>}
        </div>
      </div>
    </SectionShell>
  );
}

function NodeDetail({ node, onClose, twin }) {
  const deps = twin.graph.edges.filter((e) => e.from === node.id || e.to === node.id);
  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div><Badge color="violet">{node.type}</Badge><h3 className="text-sm font-bold text-white mt-1">{node.label}</h3>{node.owner && <p className="text-[10px] text-white/40">Owner: {node.owner}</p>}</div>
        <button onClick={onClose} className="text-white/30 hover:text-white/60"><X size={14} /></button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {NODE_METRICS.map((m) => (
          <div key={m} className="bg-white/[0.02] rounded-lg p-2">
            <div className="text-[9px] text-white/40 uppercase">{m}</div>
            <div className="text-sm font-bold text-white">{node[m] ?? '—'}</div>
          </div>
        ))}
      </div>
      <div className="text-[10px] text-white/40">Connections: {deps.length}</div>
      {node.purpose && <p className="text-[11px] text-white/50 leading-snug">{node.purpose}</p>}
    </div>
  );
}
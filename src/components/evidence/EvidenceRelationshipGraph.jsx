import React, { useMemo } from 'react';
import { Share2, Layers, ShieldCheck, Database } from 'lucide-react';
import { buildEvidenceGraph, getEvidenceTypeMeta } from '@/lib/evidenceVaultEngine';

const NODE_ICON = { evidence: Database, module: Layers, verification: ShieldCheck };

export default function EvidenceRelationshipGraph({ evidenceItems }) {
  const graph = useMemo(() => buildEvidenceGraph(evidenceItems), [evidenceItems]);

  if (!evidenceItems || evidenceItems.length === 0) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Share2 size={14} className="text-cyan-400" />
          <span className="text-sm font-bold text-white">Evidence Relationship Graph™</span>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-8 text-center">
          <Share2 size={28} className="text-white/10 mx-auto mb-2" />
          <p className="text-xs text-white/30">No evidence to graph yet. Add evidence items to see relationships.</p>
        </div>
      </div>
    );
  }

  const width = 560, height = 420;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Share2 size={14} className="text-cyan-400" />
        <span className="text-sm font-bold text-white">Evidence Relationship Graph™</span>
        <span className="text-[10px] text-white/30 ml-auto">{graph.nodes.length} nodes · {graph.edges.length} edges</span>
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-2">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" style={{ maxHeight: '420px' }}>
          {/* Edges */}
          {graph.edges.map((edge, i) => {
            const source = graph.nodes.find(n => n.id === edge.source);
            const target = graph.nodes.find(n => n.id === edge.target);
            if (!source || !target) return null;
            const color = edge.type === 'belongs_to' ? 'rgba(99,102,241,0.15)' : edge.type === 'supports' ? 'rgba(16,185,129,0.15)' : 'rgba(168,85,247,0.12)';
            return (
              <line key={i} x1={source.x} y1={source.y} x2={target.x} y2={target.y} stroke={color} strokeWidth="1.5" strokeDasharray={edge.type === 'related_to' ? '3 3' : 'none'} />
            );
          })}

          {/* Nodes */}
          {graph.nodes.map((node) => {
            const r = node.type === 'module' ? 14 : node.type === 'verification' ? 12 : 10;
            return (
              <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
                <circle r={r} fill={node.color + '20'} stroke={node.color} strokeWidth="1.5" />
                <circle r={r - 4} fill={node.color} opacity="0.4" />
                {node.type === 'evidence' && (
                  <text textAnchor="middle" dy="3" fontSize="7" fill="white" fontWeight="bold">
                    {node.quality || 0}
                  </text>
                )}
                <text textAnchor="middle" dy={r + 12} fontSize="7" fill="rgba(255,255,255,0.4)">
                  {node.label.length > 18 ? node.label.substring(0, 16) + '…' : node.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-2">
        <LegendItem color="#6366f1" label="Evidence" />
        <LegendItem color="#a855f7" label="Module" />
        <LegendItem color="#10b981" label="Verification" />
      </div>
    </div>
  );
}

function LegendItem({ color, label }) {
  return (
    <div className="flex items-center gap-1.5 text-[10px] text-white/30">
      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </div>
  );
}
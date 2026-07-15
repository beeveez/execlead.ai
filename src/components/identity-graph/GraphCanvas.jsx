import React from 'react';
import { NODE_TYPES, RELATIONSHIPS, getNodePositions } from '@/lib/identityGraphEngine';

export default function GraphCanvas({ nodeData, selected, onSelect }) {
  const positions = getNodePositions(500, 425);
  const selectedEdges = selected
    ? RELATIONSHIPS.filter(r => r.source === selected || r.target === selected)
    : [];

  const isEdgeHighlighted = (rel) =>
    selectedEdges.some(e => e.source === rel.source && e.target === rel.target);

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
      <div className="overflow-auto" style={{ maxHeight: '600px' }}>
        <svg viewBox="0 0 1000 850" className="w-full" style={{ minWidth: '700px' }}>
          {/* Edges */}
          {RELATIONSHIPS.map((rel, i) => {
            const src = positions[rel.source];
            const tgt = positions[rel.target];
            if (!src || !tgt) return null;
            const highlighted = isEdgeHighlighted(rel);
            const midX = (src.x + tgt.x) / 2;
            const midY = (src.y + tgt.y) / 2;
            return (
              <g key={i}>
                <line
                  x1={src.x} y1={src.y} x2={tgt.x} y2={tgt.y}
                  stroke={highlighted ? '#a855f7' : '#ffffff08'}
                  strokeWidth={highlighted ? 2 : 1}
                  strokeDasharray={highlighted ? '0' : '3 3'}
                />
                {highlighted && (
                  <text x={midX} y={midY - 4} textAnchor="middle"
                    className="fill-violet-400" style={{ fontSize: '8px', fontWeight: 600 }}>
                    {rel.type}
                  </text>
                )}
              </g>
            );
          })}

          {/* Nodes */}
          {Object.entries(NODE_TYPES).map(([key, meta]) => {
            const pos = positions[key];
            if (!pos) return null;
            const isSelected = selected === key;
            const isConnected = selectedEdges.some(e => e.source === key || e.target === key);
            const data = nodeData?.[key];
            const hasData = data !== undefined && data !== null && data !== 0;
            const opacity = !selected || isSelected || isConnected ? 1 : 0.4;
            return (
              <g key={key} transform={`translate(${pos.x}, ${pos.y})`}
                onClick={() => onSelect(key)} className="cursor-pointer"
                style={{ opacity, transition: 'opacity 0.2s' }}>
                <circle
                  r={isSelected ? 30 : (meta.category === 'core' ? 28 : 24)}
                  fill={meta.color + (hasData ? '20' : '08')}
                  stroke={isSelected ? meta.color : (hasData ? meta.color + '60' : '#ffffff15')}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                />
                {hasData && (
                  <text y={4} textAnchor="middle"
                    className="fill-white" style={{ fontSize: '11px', fontWeight: 700 }}>
                    {data}
                  </text>
                )}
                <text y={isSelected ? 46 : 42} textAnchor="middle"
                  className="fill-white/50" style={{ fontSize: '9px' }}>
                  {meta.label.replace('™', '')}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
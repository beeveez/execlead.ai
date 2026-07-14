import React from "react";

/**
 * Renders a directed dependency graph as an SVG.
 * Nodes are positioned by topological level (root at top).
 * Edges flow from dependencies (top) → dependents (bottom).
 */
export default function DependencyGraph({ data }) {
  const { nodes, edges } = data;
  if (!nodes || nodes.length === 0) {
    return <div className="text-center py-12 text-white/30 text-sm">No dependency data available.</div>;
  }

  const xs = nodes.map(n => n.x);
  const ys = nodes.map(n => n.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs.map((x, i) => x + nodes[i].width));
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys.map((y, i) => y + nodes[i].height));
  const pad = 60;
  const width = maxX - minX + pad * 2;
  const height = maxY - minY + pad * 2;
  const ox = -minX + pad;
  const oy = -minY + pad;

  return (
    <div className="bg-white/[0.02] border border-white/10 rounded-xl p-4 overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ minHeight: "400px", maxHeight: "600px" }}>
        <defs>
          <marker id="dep-arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
            <path d="M0,0 L8,3 L0,6 Z" fill="rgba(255,255,255,0.25)" />
          </marker>
        </defs>
        {edges.map((edge, i) => {
          const from = nodes.find(n => n.id === edge.from);
          const to = nodes.find(n => n.id === edge.to);
          if (!from || !to) return null;
          const x1 = from.x + ox + from.width / 2;
          const y1 = from.y + oy + from.height;
          const x2 = to.x + ox + to.width / 2;
          const y2 = to.y + oy;
          const midY = (y1 + y2) / 2;
          return (
            <path
              key={i}
              d={`M ${x1},${y1} C ${x1},${midY} ${x2},${midY} ${x2},${y2}`}
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="1.5"
              markerEnd="url(#dep-arrow)"
            />
          );
        })}
        {nodes.map(node => (
          <g key={node.id} transform={`translate(${node.x + ox}, ${node.y + oy})`}>
            <rect
              width={node.width}
              height={node.height}
              rx="8"
              fill={node.color + "12"}
              stroke={node.color + "50"}
              strokeWidth="1"
            />
            <text
              x={node.width / 2}
              y={node.height / 2 + 4}
              textAnchor="middle"
              fill={node.color}
              fontSize="11"
              fontWeight="600"
            >
              {node.label}
            </text>
          </g>
        ))}
      </svg>
      <p className="text-[10px] text-white/30 mt-3 text-center">
        Arrows point from a framework to the frameworks that depend on it. Top = root frameworks, bottom = dependent frameworks.
      </p>
    </div>
  );
}
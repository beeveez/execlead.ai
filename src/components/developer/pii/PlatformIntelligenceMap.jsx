import React from "react";
import { Network } from "lucide-react";
import { INTELLIGENCE_MAP_NODES, INTELLIGENCE_MAP_EDGES } from "@/lib/platformIntelligenceEngine";

/**
 * Platform Intelligence Map™ — Digital Twin
 * Visualizes live relationships between core platform services.
 * Healthy relationships appear green, warnings yellow, critical red.
 */
export default function PlatformIntelligenceMap({ piq }) {
  const getHealth = (nodeId) => piq.nodeHealth?.[nodeId] ?? 100;

  const getEdgeColor = (from, to) => {
    const fromHealth = getHealth(from);
    const toHealth = getHealth(to);
    const avg = (fromHealth + toHealth) / 2;
    if (avg >= 90) return "#10b981";
    if (avg >= 70) return "#f59e0b";
    return "#ef4444";
  };

  const getNodeColor = (nodeId) => {
    const h = getHealth(nodeId);
    if (h >= 90) return "#10b981";
    if (h >= 70) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Network size={16} className="text-indigo-400" />
        <h3 className="text-sm font-bold text-white">Platform Intelligence Map™</h3>
        <span className="text-[10px] text-white/30 ml-auto">Live Digital Twin</span>
      </div>

      <div className="relative w-full" style={{ paddingBottom: "60%" }}>
        <svg
          viewBox="0 0 100 60"
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Edges */}
          {INTELLIGENCE_MAP_EDGES.map((edge, i) => {
            const from = INTELLIGENCE_MAP_NODES.find((n) => n.id === edge.from);
            const to = INTELLIGENCE_MAP_NODES.find((n) => n.id === edge.to);
            if (!from || !to) return null;
            const color = getEdgeColor(edge.from, edge.to);
            return (
              <line
                key={i}
                x1={from.x} y1={from.y * 0.6}
                x2={to.x} y2={to.y * 0.6}
                stroke={color}
                strokeWidth="0.3"
                strokeOpacity="0.6"
              />
            );
          })}

          {/* Nodes */}
          {INTELLIGENCE_MAP_NODES.map((node) => {
            const color = getNodeColor(node.id);
            const health = getHealth(node.id);
            return (
              <g key={node.id}>
                <circle
                  cx={node.x}
                  cy={node.y * 0.6}
                  r="2.5"
                  fill={color}
                  fillOpacity="0.2"
                  stroke={color}
                  strokeWidth="0.4"
                />
                <text
                  x={node.x}
                  y={node.y * 0.6 + 5}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.6)"
                  fontSize="1.8"
                >
                  {node.label}
                </text>
                <text
                  x={node.x}
                  y={node.y * 0.6 + 7.5}
                  textAnchor="middle"
                  fill={color}
                  fontSize="1.6"
                  fontWeight="bold"
                >
                  {health}%
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 text-[10px]">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-white/40">Healthy (≥90%)</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span className="text-white/40">Warning (70–89%)</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          <span className="text-white/40">Critical (&lt;70%)</span>
        </div>
      </div>
    </div>
  );
}
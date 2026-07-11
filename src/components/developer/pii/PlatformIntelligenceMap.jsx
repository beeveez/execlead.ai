import React, { useState, useMemo } from "react";
import { Network, MousePointerClick } from "lucide-react";
import { INTELLIGENCE_MAP_NODES, INTELLIGENCE_MAP_EDGES } from "@/lib/platformIntelligenceEngine";

// Maps each service node to its Operations Center workspace
const NODE_WORKSPACE_MAP = {
  manifest: "platform-governance",
  knowledge_engine: "knowledge-operations",
  platform_state: "runtime-intelligence",
  workspace_engine: "knowledge-operations",
  journey_engine: "platform-intelligence",
  intelligence_engine: "platform-intelligence",
  guardian: "security-guardian",
  exec: "platform-intelligence",
  metadata: "architecture-center",
};

/**
 * Platform Intelligence Map™ — Animated Digital Twin
 * Visualizes live relationships between core platform services.
 * Healthy nodes emit green pulses, edges show data flow,
 * hover highlights dependency chains, click opens the service.
 */
export default function PlatformIntelligenceMap({ piq, onNavigate }) {
  const [hoveredNode, setHoveredNode] = useState(null);

  const getHealth = (nodeId) => piq.nodeHealth?.[nodeId] ?? 100;

  const getEdgeColor = (from, to) => {
    const avg = (getHealth(from) + getHealth(to)) / 2;
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

  // Precompute connected edges/nodes for hover dependency highlighting
  const connectedEdges = useMemo(() => {
    if (!hoveredNode) return null;
    const set = new Set();
    INTELLIGENCE_MAP_EDGES.forEach((e, i) => {
      if (e.from === hoveredNode || e.to === hoveredNode) set.add(i);
    });
    return set;
  }, [hoveredNode]);

  const connectedNodes = useMemo(() => {
    if (!hoveredNode) return null;
    const set = new Set([hoveredNode]);
    INTELLIGENCE_MAP_EDGES.forEach((e) => {
      if (e.from === hoveredNode) set.add(e.to);
      if (e.to === hoveredNode) set.add(e.from);
    });
    return set;
  }, [hoveredNode]);

  const handleNodeClick = (nodeId) => {
    const ws = NODE_WORKSPACE_MAP[nodeId];
    if (ws && onNavigate) onNavigate(ws);
  };

  const isEdgeActive = (idx) => !connectedEdges || connectedEdges.has(idx);
  const isNodeActive = (nodeId) => !connectedNodes || connectedNodes.has(nodeId);

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Network size={16} className="text-indigo-400" />
        <h3 className="text-sm font-bold text-white">Platform Intelligence Map™</h3>
        <span className="text-[10px] text-white/30 ml-auto">Live Digital Twin</span>
        {onNavigate && (
          <span className="text-[10px] text-indigo-400/60 flex items-center gap-1">
            <MousePointerClick size={10} /> Click a service to open
          </span>
        )}
      </div>

      <div className="relative w-full" style={{ paddingBottom: "60%" }}>
        <svg
          viewBox="0 0 100 60"
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* ── Edges with flow animation ── */}
          {INTELLIGENCE_MAP_EDGES.map((edge, i) => {
            const from = INTELLIGENCE_MAP_NODES.find((n) => n.id === edge.from);
            const to = INTELLIGENCE_MAP_NODES.find((n) => n.id === edge.to);
            if (!from || !to) return null;
            const color = getEdgeColor(edge.from, edge.to);
            const active = isEdgeActive(i);
            return (
              <g key={`edge-${i}`}>
                {/* Base line */}
                <line
                  x1={from.x} y1={from.y * 0.6}
                  x2={to.x} y2={to.y * 0.6}
                  stroke={color}
                  strokeWidth={active ? "0.5" : "0.3"}
                  strokeOpacity={active ? (hoveredNode ? "0.7" : "0.4") : "0.08"}
                  style={{ transition: "stroke-opacity 0.2s, stroke-width 0.2s" }}
                />
                {/* Flowing dashed overlay — active edges only */}
                {active && (
                  <line
                    x1={from.x} y1={from.y * 0.6}
                    x2={to.x} y2={to.y * 0.6}
                    stroke={color}
                    strokeWidth="0.4"
                    strokeOpacity="0.9"
                    className="pi-edge-flow"
                  />
                )}
              </g>
            );
          })}

          {/* ── Nodes with pulse + hover highlighting ── */}
          {INTELLIGENCE_MAP_NODES.map((node, idx) => {
            const color = getNodeColor(node.id);
            const health = getHealth(node.id);
            const active = isNodeActive(node.id);
            const isHovered = hoveredNode === node.id;
            const healthy = health >= 90;
            const clickable = onNavigate && NODE_WORKSPACE_MAP[node.id];
            return (
              <g
                key={node.id}
                style={{
                  cursor: clickable ? "pointer" : "default",
                  opacity: active ? 1 : 0.2,
                  transition: "opacity 0.2s",
                }}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => handleNodeClick(node.id)}
              >
                {/* Green pulse ring — healthy & active nodes only */}
                {healthy && active && (
                  <circle
                    cx={node.x}
                    cy={node.y * 0.6}
                    r="2.5"
                    fill="none"
                    stroke={color}
                    strokeWidth="0.3"
                    className="pi-node-pulse"
                    style={{ animationDelay: `${idx * 0.25}s` }}
                  />
                )}
                {/* Hover highlight ring */}
                {isHovered && (
                  <circle
                    cx={node.x}
                    cy={node.y * 0.6}
                    r="4"
                    fill="none"
                    stroke={color}
                    strokeWidth="0.3"
                    strokeOpacity="0.4"
                  />
                )}
                {/* Main node circle */}
                <circle
                  cx={node.x}
                  cy={node.y * 0.6}
                  r="2.5"
                  fill={color}
                  fillOpacity={isHovered ? "0.4" : "0.2"}
                  stroke={color}
                  strokeWidth="0.5"
                />
                <text
                  x={node.x}
                  y={node.y * 0.6 + 5}
                  textAnchor="middle"
                  fill={isHovered ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.6)"}
                  fontSize="1.8"
                  style={{ fontWeight: isHovered ? "bold" : "normal", pointerEvents: "none" }}
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
                  style={{ pointerEvents: "none" }}
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
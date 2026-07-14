import React, { useState, useMemo } from "react";
import {
  getKnowledgeGraph, getNode, getDirectRelationships,
  impactAnalysis, getKnowledgePath, searchNodes,
  NODE_TYPES, NODE_COLORS, NODE_TYPE_LABELS, RELATIONSHIPS,
} from "@/lib/knowledgeGraphEngine";
import { Search, AlertTriangle, ArrowRight, Box, Zap } from "lucide-react";

export default function KnowledgeGraphView() {
  const [selectedId, setSelectedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showImpact, setShowImpact] = useState(false);

  const searchResults = useMemo(() => searchNodes(searchQuery), [searchQuery]);
  const selectedNode = selectedId ? getNode(selectedId) : null;
  const relationships = selectedId ? getDirectRelationships(selectedId) : [];
  const impact = selectedId && showImpact ? impactAnalysis(selectedId) : [];
  const knowledgePath = selectedId ? getKnowledgePath(selectedId) : [];

  // Radial layout for related nodes
  const cx = 320, cy = 260, r = 190;
  const positioned = relationships.map((rel, i) => {
    const angle = (i / Math.max(relationships.length, 1)) * 2 * Math.PI - Math.PI / 2;
    return {
      ...rel,
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  });

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full">
      {/* Graph canvas */}
      <div className="flex-1 flex flex-col">
        {/* Search */}
        <div className="relative mb-3">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search modules, frameworks, workspaces… (e.g. 'Leadership DNA')"
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/40"
          />
          {searchQuery && searchResults.length > 0 && (
            <div className="absolute z-20 mt-1 w-full bg-[#0d0d14] border border-white/10 rounded-lg max-h-64 overflow-y-auto shadow-2xl">
              {searchResults.map(n => (
                <button
                  key={n.id}
                  onClick={() => { setSelectedId(n.id); setSearchQuery(""); }}
                  className="w-full text-left px-3 py-2 hover:bg-white/5 flex items-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: n.color }} />
                  <span className="text-xs text-white/70">{n.label}</span>
                  <span className="text-[9px] text-white/30 ml-auto">{NODE_TYPE_LABELS[n.type]}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* SVG graph */}
        <div className="flex-1 bg-white/[0.02] border border-white/10 rounded-xl overflow-hidden flex items-center justify-center">
          {selectedNode ? (
            <svg viewBox="0 0 640 520" className="w-full h-full" style={{ maxHeight: "560px" }}>
              <defs>
                <marker id="kg-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill="rgba(255,255,255,0.2)" />
                </marker>
              </defs>

              {/* Edges */}
              {positioned.map((rel, i) => (
                <g key={i}>
                  <line
                    x1={cx} y1={cy}
                    x2={rel.x} y2={rel.y}
                    stroke={rel.direction === "incoming" ? "rgba(245,158,11,0.2)" : "rgba(99,102,241,0.2)"}
                    strokeWidth="1.5"
                    markerEnd="url(#kg-arrow)"
                  />
                  <text
                    x={(cx + rel.x) / 2}
                    y={(cy + rel.y) / 2 - 4}
                    fill="rgba(255,255,255,0.25)"
                    fontSize="8"
                    textAnchor="middle"
                  >
                    {rel.type}
                  </text>
                </g>
              ))}

              {/* Center node */}
              <g
                onClick={() => setSelectedId(null)}
                className="cursor-pointer"
              >
                <circle cx={cx} cy={cy} r="42" fill={selectedNode.color + "20"} stroke={selectedNode.color} strokeWidth="2" />
                <text x={cx} y={cy - 2} textAnchor="middle" fill={selectedNode.color} fontSize="10" fontWeight="700">
                  {truncate(selectedNode.label, 18)}
                </text>
                <text x={cx} y={cy + 12} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="8">
                  {NODE_TYPE_LABELS[selectedNode.type]}
                </text>
              </g>

              {/* Related nodes */}
              {positioned.map((rel, i) => (
                <g
                  key={i}
                  onClick={() => setSelectedId(rel.node.id)}
                  className="cursor-pointer"
                >
                  <circle
                    cx={rel.x} cy={rel.y}
                    r="32"
                    fill={rel.node.color + "12"}
                    stroke={rel.node.color + "50"}
                    strokeWidth="1"
                    className="transition-all"
                  />
                  <text x={rel.x} y={rel.y - 2} textAnchor="middle" fill={rel.node.color} fontSize="9" fontWeight="600">
                    {truncate(rel.node.label, 14)}
                  </text>
                  <text x={rel.x} y={rel.y + 10} textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="7">
                    {NODE_TYPE_LABELS[rel.node.type]}
                  </text>
                </g>
              ))}

              {/* Impact overlay */}
              {showImpact && impact.length > 0 && (
                <text x={320} y={500} textAnchor="middle" fill="#f59e0b" fontSize="11" fontWeight="600">
                  ⚠ {impact.length} node(s) would break — see Impact Analysis panel
                </text>
              )}
            </svg>
          ) : (
            <EmptyState onSearch={setSearchQuery} />
          )}
        </div>
      </div>

      {/* Side panel */}
      {selectedNode && (
        <div className="w-full lg:w-80 flex-shrink-0 space-y-3 overflow-y-auto">
          <NodeDetailsCard node={selectedNode} />
          <RelationshipsCard relationships={relationships} onSelect={setSelectedId} />
          <KnowledgePathCard path={knowledgePath} />
          <ImpactCard
            node={selectedNode}
            impact={impact}
            show={showImpact}
            onToggle={() => setShowImpact(!showImpact)}
            onSelect={setSelectedId}
          />
        </div>
      )}
    </div>
  );
}

function EmptyState({ onSearch }) {
  const stats = useMemo(() => {
    const g = getKnowledgeGraph();
    return { nodes: g.nodes.length, edges: g.edges.length };
  }, []);
  return (
    <div className="text-center py-12">
      <Box size={48} className="text-white/10 mx-auto mb-4" />
      <p className="text-white/40 text-sm mb-1">Search for a module, framework, or workspace</p>
      <p className="text-white/20 text-xs">
        {stats.nodes} nodes · {stats.edges} relationships in the Knowledge Graph™
      </p>
      <div className="flex flex-wrap gap-2 justify-center mt-4 max-w-xs mx-auto">
        {["Leadership DNA", "Executive Trust", "EELM", "Developer Portal"].map(s => (
          <button
            key={s}
            onClick={() => onSearch(s)}
            className="text-[10px] px-2 py-1 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-white/70"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

function NodeDetailsCard({ node }) {
  return (
    <div className="bg-white/[0.02] border border-white/10 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="w-3 h-3 rounded-full" style={{ background: node.color }} />
        <h3 className="text-sm font-bold text-white">{node.label}</h3>
      </div>
      <div className="text-[10px] uppercase tracking-widest text-white/30 mb-2">{NODE_TYPE_LABELS[node.type]}</div>
      {node.data?.description && (
        <p className="text-xs text-white/50 leading-relaxed">{node.data.description.substring(0, 160)}{node.data.description.length > 160 ? "…" : ""}</p>
      )}
      {node.data?.owner && <Meta label="Owner" value={node.data.owner} />}
      {node.data?.workspace && <Meta label="Workspace" value={node.data.workspace} />}
      {node.data?.status && <Meta label="Status" value={node.data.status} />}
    </div>
  );
}

function Meta({ label, value }) {
  return (
    <div className="flex justify-between mt-2 text-[11px]">
      <span className="text-white/30">{label}</span>
      <span className="text-white/60">{value}</span>
    </div>
  );
}

function RelationshipsCard({ relationships, onSelect }) {
  const grouped = useMemo(() => {
    const g = {};
    relationships.forEach(r => {
      const key = r.type;
      if (!g[key]) g[key] = [];
      g[key].push(r);
    });
    return g;
  }, [relationships]);

  return (
    <div className="bg-white/[0.02] border border-white/10 rounded-xl p-4">
      <h4 className="text-[10px] uppercase tracking-widest text-white/30 mb-3">
        Relationships ({relationships.length})
      </h4>
      {Object.entries(grouped).map(([type, rels]) => (
        <div key={type} className="mb-3">
          <div className="text-[11px] text-white/40 mb-1">{type}</div>
          {rels.map((r, i) => (
            <button
              key={i}
              onClick={() => onSelect(r.node.id)}
              className="flex items-center gap-1.5 text-xs text-white/50 hover:text-indigo-300 py-0.5 w-full text-left"
            >
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: r.node.color }} />
              {r.direction === "incoming" ? "←" : "→"} {r.node.label}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

function KnowledgePathCard({ path }) {
  if (path.length < 2) return null;
  const { nodeMap } = getKnowledgeGraph();
  return (
    <div className="bg-white/[0.02] border border-white/10 rounded-xl p-4">
      <h4 className="text-[10px] uppercase tracking-widest text-white/30 mb-3">Knowledge Path</h4>
      <div className="flex items-center gap-1 flex-wrap">
        {path.map((id, i) => {
          const node = nodeMap.get(id);
          if (!node) return null;
          return (
            <React.Fragment key={i}>
              {i > 0 && <ArrowRight size={10} className="text-white/20" />}
              <span
                className="text-[10px] px-2 py-0.5 rounded-full"
                style={{ background: node.color + "15", color: node.color, border: `1px solid ${node.color}40` }}
              >
                {node.label}
              </span>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

function ImpactCard({ node, impact, show, onToggle, onSelect }) {
  return (
    <div className="bg-white/[0.02] border border-white/10 rounded-xl p-4">
      <button
        onClick={onToggle}
        className="flex items-center gap-2 w-full text-left"
      >
        <AlertTriangle size={14} className={show ? "text-amber-400" : "text-white/30"} />
        <h4 className="text-[10px] uppercase tracking-widest text-white/30 flex-1">
          Impact Analysis
        </h4>
        <span className={`text-[10px] ${impact.length > 0 ? "text-amber-400" : "text-emerald-400"}`}>
          {show ? (impact.length > 0 ? `${impact.length} affected` : "No impact") : "Run"}
        </span>
      </button>
      {show && impact.length > 0 && (
        <div className="mt-3 space-y-1">
          <p className="text-[10px] text-amber-400/70 mb-2">
            Removing <span className="font-bold">{node.label}</span> would break:
          </p>
          {impact.map(n => (
            <button
              key={n.id}
              onClick={() => onSelect(n.id)}
              className="flex items-center gap-1.5 text-xs text-white/50 hover:text-amber-400 py-0.5 w-full text-left"
            >
              <Zap size={10} className="text-amber-400/50" />
              {n.label}
              <span className="text-[8px] text-white/20 ml-auto">{NODE_TYPE_LABELS[n.type]}</span>
            </button>
          ))}
        </div>
      )}
      {show && impact.length === 0 && (
        <p className="text-[10px] text-emerald-400/70 mt-3">
          ✓ No modules depend on this node. Safe to remove.
        </p>
      )}
    </div>
  );
}

function truncate(str, max) {
  if (!str) return "";
  return str.length > max ? str.substring(0, max - 1) + "…" : str;
}
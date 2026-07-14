import React, { useState, useMemo } from "react";
import { Search, ArrowRight, Box, Layers, Grid3x3 } from "lucide-react";
import {
  getKnowledgeGraph, searchNodes, getNodeDegree,
  NODE_TYPES, NODE_TYPE_LABELS, NODE_COLORS,
} from "@/lib/knowledgeGraphEngine";

const TYPE_ICONS = {
  workspace: Grid3x3, framework: Layers, module: Box,
  engine: Box, api: Box, entity: Box, service: Box, registry: Box,
};

export default function RootNodePicker({ onSelect, stats }) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const graph = useMemo(() => getKnowledgeGraph(), []);

  const suggestions = useMemo(() => {
    const workspaces = graph.nodes.filter(n => n.type === NODE_TYPES.WORKSPACE);
    const frameworks = graph.nodes.filter(n => n.type === NODE_TYPES.FRAMEWORK);
    const topModules = graph.nodes
      .filter(n => n.type === NODE_TYPES.MODULE)
      .map(n => ({ ...n, _degree: getNodeDegree(n.id) }))
      .sort((a, b) => b._degree - a._degree)
      .slice(0, 8);
    return { workspaces, frameworks, topModules };
  }, [graph]);

  const searchResults = useMemo(() => {
    if (!query.trim()) return null;
    let results = searchNodes(query);
    if (typeFilter !== "all") results = results.filter(n => n.type === typeFilter);
    return results.slice(0, 20);
  }, [query, typeFilter]);

  return (
    <div className="flex flex-col h-[600px] items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-6">
          <h2 className="text-lg font-semibold text-white/90 mb-1">Knowledge Graph™ Explorer</h2>
          <p className="text-xs text-white/40">
            Select a root node to explore its neighborhood. {stats.totalNodes} nodes · {stats.totalEdges} edges available.
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search nodes by name or description…"
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2.5 text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:border-indigo-500/40"
            autoFocus
          />
        </div>

        {/* Type filter */}
        <div className="flex items-center gap-1.5 flex-wrap mb-4">
          <FilterChip label="All" active={typeFilter === "all"} onClick={() => setTypeFilter("all")} />
          {Object.values(NODE_TYPES).map(t => (
            <FilterChip key={t} label={NODE_TYPE_LABELS[t]} color={NODE_COLORS[t]}
              active={typeFilter === t} onClick={() => setTypeFilter(t)} />
          ))}
        </div>

        {/* Results / Suggestions */}
        {searchResults ? (
          <div className="space-y-1 max-h-[340px] overflow-y-auto">
            {searchResults.length === 0 ? (
              <p className="text-xs text-white/30 text-center py-8">No nodes found for "{query}"</p>
            ) : searchResults.map(node => (
              <NodeRow key={node.id} node={node} onClick={() => onSelect(node.id)} />
            ))}
          </div>
        ) : (
          <div className="space-y-4 max-h-[340px] overflow-y-auto">
            <SuggestionGroup label="Workspaces" nodes={suggestions.workspaces} onSelect={onSelect} />
            <SuggestionGroup label="Frameworks" nodes={suggestions.frameworks} onSelect={onSelect} />
            <SuggestionGroup label="Top Modules" nodes={suggestions.topModules} onSelect={onSelect} showDegree />
          </div>
        )}
      </div>
    </div>
  );
}

function FilterChip({ label, color, active, onClick }) {
  return (
    <button onClick={onClick}
      className={`text-[10px] px-2.5 py-1 rounded-full border transition-colors flex items-center gap-1.5 ${
        active ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-300" : "bg-white/5 border-white/10 text-white/40 hover:text-white/70"
      }`}>
      {color && <span className="w-2 h-2 rounded-full" style={{ background: color }} />}
      {label}
    </button>
  );
}

function SuggestionGroup({ label, nodes, onSelect, showDegree }) {
  if (!nodes?.length) return null;
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-widest text-white/20 px-1 mb-1.5">{label}</div>
      <div className="space-y-1">
        {nodes.map(node => <NodeRow key={node.id} node={node} onClick={() => onSelect(node.id)} showDegree={showDegree} degree={node._degree} />)}
      </div>
    </div>
  );
}

function NodeRow({ node, onClick, showDegree, degree }) {
  const Icon = TYPE_ICONS[node.type] || Box;
  return (
    <button onClick={onClick}
      className="flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg bg-white/[0.02] hover:bg-white/5 border border-white/5 hover:border-white/10 transition-colors group">
      <Icon size={14} style={{ color: node.color }} className="shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-white/70 truncate">{node.label}</p>
        <p className="text-[9px] text-white/20">{NODE_TYPE_LABELS[node.type]}{showDegree && degree != null ? ` · ${degree} connections` : ""}</p>
      </div>
      <ArrowRight size={12} className="text-white/20 group-hover:text-white/50 shrink-0" />
    </button>
  );
}
import React from "react";
import { Route, Focus, Maximize, Minimize } from "lucide-react";
import { NODE_TYPES, NODE_TYPE_LABELS, RELATIONSHIPS } from "@/lib/knowledgeGraphEngine";

const LAYOUTS = [
  { id: "force", label: "Force" },
  { id: "hierarchical", label: "Hier" },
  { id: "radial", label: "Radial" },
  { id: "workspace", label: "Workspace" },
  { id: "tree", label: "Tree" },
];

const WORKSPACES = ["executive", "enterprise", "operations", "developer"];
const STATUSES = ["live", "beta", "experimental", "deprecated"];

export default function GraphControls({
  layout, onLayoutChange, filters, onFilterChange,
  onExport, onFit, onTogglePath, pathMode, onToggleFullscreen, isFullscreen, stats,
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap mb-3">
      {/* Layouts */}
      <div className="flex items-center gap-0.5 bg-white/5 rounded-lg p-0.5">
        {LAYOUTS.map(l => (
          <button key={l.id} onClick={() => onLayoutChange(l.id)}
            className={`text-[10px] px-2 py-1 rounded-md transition-colors ${layout === l.id ? "bg-indigo-500/20 text-indigo-300" : "text-white/40 hover:text-white/70"}`}>
            {l.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <FilterSelect value={filters.nodeType} onChange={v => onFilterChange({ ...filters, nodeType: v })} label="Type" options={Object.values(NODE_TYPES).map(t => ({ value: t, label: NODE_TYPE_LABELS[t] }))} />
      <FilterSelect value={filters.workspace} onChange={v => onFilterChange({ ...filters, workspace: v })} label="Workspace" options={WORKSPACES.map(w => ({ value: w, label: w }))} />
      <FilterSelect value={filters.relationship} onChange={v => onFilterChange({ ...filters, relationship: v })} label="Edge" options={Object.values(RELATIONSHIPS).map(r => ({ value: r, label: r }))} />
      <FilterSelect value={filters.status} onChange={v => onFilterChange({ ...filters, status: v })} label="Status" options={STATUSES.map(s => ({ value: s, label: s }))} />

      {/* Actions */}
      <div className="ml-auto flex items-center gap-1">
        <button onClick={onTogglePath}
          className={`flex items-center gap-1 text-[10px] px-2 py-1.5 rounded-lg border transition-colors ${pathMode ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-300" : "bg-white/5 border-white/10 text-white/40 hover:text-white/70"}`}>
          <Route size={12} /> Path
        </button>

        <div className="flex items-center gap-0.5 bg-white/5 rounded-lg p-0.5">
          {["png", "svg", "json"].map(fmt => (
            <button key={fmt} onClick={() => onExport(fmt)} className="text-[10px] px-2 py-1 rounded-md text-white/40 hover:text-white/70 uppercase">{fmt}</button>
          ))}
        </div>

        <button onClick={onFit} className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-white/70" title="Fit to screen">
          <Focus size={14} />
        </button>
        <button onClick={onToggleFullscreen} className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-white/70" title="Fullscreen">
          {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
        </button>
      </div>

      {stats && <span className="text-[9px] text-white/20 w-full">{stats.totalNodes} nodes · {stats.totalEdges} edges</span>}
    </div>
  );
}

function FilterSelect({ value, onChange, label, options }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      className="bg-white/5 border border-white/10 rounded-lg text-[10px] text-white/60 px-2 py-1.5 focus:outline-none focus:border-indigo-500/40"
      style={{ colorScheme: "dark" }}>
      <option value="all" className="bg-[#0d0d14] text-white">All {label}</option>
      {options.map(o => <option key={o.value} value={o.value} className="bg-[#0d0d14] text-white">{o.label}</option>)}
    </select>
  );
}
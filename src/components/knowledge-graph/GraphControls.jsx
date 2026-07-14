import React from "react";
import { Route, Focus, Maximize, Minimize, Home, ChevronDown, Layers, GitBranch, Network, Boxes } from "lucide-react";

const LAYOUTS = [
  { id: "force", label: "Force" },
  { id: "hierarchical", label: "Hier" },
  { id: "radial", label: "Radial" },
  { id: "workspace", label: "Workspace" },
  { id: "tree", label: "Tree" },
];

const EXPAND_ACTIONS = [
  { id: "level", label: "One Level", icon: ChevronDown },
  { id: "dependencies", label: "Dependencies", icon: GitBranch },
  { id: "references", label: "References", icon: Network },
  { id: "workspace", label: "Workspace", icon: Boxes },
];

export default function GraphControls({
  layout, onLayoutChange, onExpand,
  onExport, onFit, onTogglePath, pathMode,
  onToggleFullscreen, isFullscreen, onReset,
  treeAvailable, stats,
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap mb-3">
      {/* Layouts */}
      <div className="flex items-center gap-0.5 bg-white/5 rounded-lg p-0.5">
        {LAYOUTS.map(l => {
          const disabled = l.id === "tree" && !treeAvailable;
          return (
            <button key={l.id} onClick={() => !disabled && onLayoutChange(l.id)} disabled={disabled}
              className={`text-[10px] px-2 py-1 rounded-md transition-colors ${
                disabled ? "text-white/10 cursor-not-allowed" :
                layout === l.id ? "bg-indigo-500/20 text-indigo-300" : "text-white/40 hover:text-white/70"
              }`}
              title={disabled ? "Tree layout requires a hierarchical node" : l.label}>
              {l.label}
            </button>
          );
        })}
      </div>

      {/* Expand actions */}
      {onExpand && (
        <div className="flex items-center gap-0.5 bg-white/5 rounded-lg p-0.5">
          <span className="text-[9px] text-white/20 px-1 flex items-center gap-0.5"><Layers size={9} /> Expand</span>
          {EXPAND_ACTIONS.map(a => (
            <button key={a.id} onClick={() => onExpand(a.id)}
              className="text-[10px] px-2 py-1 rounded-md text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors flex items-center gap-1">
              <a.icon size={10} /> {a.label}
            </button>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="ml-auto flex items-center gap-1">
        <button onClick={onReset}
          className="flex items-center gap-1 text-[10px] px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-white/70">
          <Home size={12} /> Root
        </button>
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

      {stats && (
        <span className="text-[9px] text-white/20 w-full">
          {stats.visibleNodes ?? stats.totalNodes} of {stats.totalNodes} nodes · {stats.totalEdges} edges
        </span>
      )}
    </div>
  );
}
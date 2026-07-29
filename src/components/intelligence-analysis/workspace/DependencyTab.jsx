import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Boxes, ArrowRight, AlertTriangle } from "lucide-react";

export default function DependencyTab({ bundle }) {
  const [selected, setSelected] = useState(null);
  const { nodes, edges } = bundle.dependencyGraph;
  const metricNode = nodes.find((n) => n.type === "metric");
  const depNodes = nodes.filter((n) => n.type === "dependency");
  const brokenEdges = edges.filter((e) => e.broken);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-3"><Boxes size={14} className="text-indigo-400" /><h3 className="text-xs font-semibold text-white/80 uppercase tracking-wider">Dependency Graph</h3></div>
        {brokenEdges.length > 0 && (
          <div className="flex items-center gap-2 mb-3 bg-red-500/[0.06] border border-red-500/20 rounded-lg p-2.5">
            <AlertTriangle size={14} className="text-red-400 shrink-0" />
            <p className="text-red-300 text-xs">{brokenEdges.length} broken dependency link(s) — fixing {metricNode?.label} will restore these connections.</p>
          </div>
        )}
      </div>

      {/* Graph visualization */}
      <div className="bg-white/[0.02] border border-white/5 rounded-lg p-6 relative overflow-x-auto" style={{ minHeight: 280 }}>
        <div className="flex flex-col items-center gap-6">
          {/* Metric node */}
          <button
            onClick={() => setSelected(metricNode)}
            className={`relative px-5 py-3 rounded-xl border-2 transition-all ${metricNode?.broken ? "border-red-500/40 bg-red-500/10" : "border-amber-500/30 bg-amber-500/10"} hover:scale-105`}
          >
            <p className="text-white font-bold text-sm">{metricNode?.label}</p>
            <p className="text-white/50 text-[10px] mt-0.5">Score: {metricNode?.score}</p>
            {metricNode?.broken && <span className="absolute -top-2 -right-2 text-red-400"><AlertTriangle size={14} /></span>}
            {/* pulse */}
            {metricNode?.broken && <span className="absolute inset-0 rounded-xl border-2 border-red-500/40 animate-ping opacity-20" />}
          </button>

          {/* Edges */}
          <div className="flex items-center justify-center gap-1 text-white/20 text-[10px]">▼ upstream / downstream ▼</div>

          {/* Dependency nodes */}
          <div className="flex flex-wrap justify-center gap-3">
            {depNodes.map((n) => {
              const edge = edges.find((e) => e.to === n.id);
              return (
                <Link
                  key={n.id}
                  to={n.to}
                  onClick={(e) => { e.stopPropagation(); }}
                  onMouseEnter={() => setSelected(n)}
                  className={`px-4 py-2 rounded-lg border transition-all ${edge?.broken ? "border-red-500/20 bg-red-500/[0.04]" : "border-indigo-500/20 bg-indigo-500/[0.06]"} hover:scale-105 hover:border-indigo-500/40`}
                >
                  <p className="text-white/80 text-xs font-medium">{n.label}</p>
                  <p className="text-white/30 text-[9px] mt-0.5 flex items-center gap-0.5">dependency <ArrowRight size={8} /></p>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected node detail */}
      {selected && (
        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-4">
          <p className="text-white/30 text-[10px] uppercase tracking-wider mb-1">Selected Node</p>
          <p className="text-white font-medium text-sm">{selected.label}</p>
          {selected.to && <Link to={selected.to} className="text-indigo-300 text-xs mt-1 inline-flex items-center gap-1">Open module <ArrowRight size={10} /></Link>}
          {selected.score != null && <p className="text-amber-400 text-xs mt-1">Score: {selected.score}</p>}
          <p className="text-white/40 text-xs mt-1">{selected.broken ? "Broken dependency — blocked by current score gap." : "Healthy dependency connection."}</p>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-[11px]">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded border-2 border-amber-500/30 bg-amber-500/10" /> Metric</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded border-2 border-indigo-500/20 bg-indigo-500/10" /> Dependency</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded border-2 border-red-500/40 bg-red-500/10" /> Broken</span>
      </div>
    </div>
  );
}
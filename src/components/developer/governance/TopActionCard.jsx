import React from "react";
import { ChevronRight, Clock, User, GitBranch, Download } from "lucide-react";

/**
 * Reusable expandable action card for the "Top 3 Actions" section.
 * Each card is clickable and opens a relevant drawer via onOpen.
 */
export default function TopActionCard({ icon: Icon, title, metric, metricLabel, progress, estimatedHours, owner, dependencies, color = "indigo", onOpen, onExport }) {
  const colorMap = {
    indigo: { text: "text-indigo-400", bg: "bg-indigo-500/5", border: "border-indigo-500/15", btn: "bg-indigo-600 hover:bg-indigo-500" },
    amber: { text: "text-amber-400", bg: "bg-amber-500/5", border: "border-amber-500/15", btn: "bg-amber-600 hover:bg-amber-500" },
    cyan: { text: "text-cyan-400", bg: "bg-cyan-500/5", border: "border-cyan-500/15", btn: "bg-cyan-600 hover:bg-cyan-500" },
    violet: { text: "text-violet-400", bg: "bg-violet-500/5", border: "border-violet-500/15", btn: "bg-violet-600 hover:bg-violet-500" },
  };
  const c = colorMap[color] || colorMap.indigo;

  return (
    <div className={`${c.bg} border ${c.border} rounded-xl p-4 flex flex-col`}>
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-8 h-8 rounded-lg ${c.bg} border ${c.border} flex items-center justify-center flex-shrink-0`}>
          <Icon size={16} className={c.text} />
        </div>
        <h4 className="text-sm font-semibold text-white flex-1">{title}</h4>
      </div>

      <div className="flex items-baseline gap-2 mb-2">
        <span className={`text-3xl font-bold ${c.text}`}>{metric}</span>
        <span className="text-[10px] text-white/40">{metricLabel}</span>
      </div>

      {progress !== undefined && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] text-white/30 uppercase tracking-wider">Progress</span>
            <span className="text-[10px] text-white/50 font-mono">{progress}%</span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: progress === 100 ? "#10b981" : "currentColor" }} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="flex items-center gap-1.5 text-[10px] text-white/40">
          <Clock size={10} /> {estimatedHours}
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-white/40">
          <User size={10} /> {owner}
        </div>
      </div>

      <div className="flex items-center gap-1.5 mb-3 flex-wrap">
        <GitBranch size={10} className="text-white/30 flex-shrink-0" />
        {dependencies.map((d) => <span key={d} className="text-[9px] text-white/30 bg-white/5 rounded px-1.5 py-0.5">{d}</span>)}
      </div>

      <div className="flex gap-2 mt-auto">
        <button onClick={onOpen} className={`flex-1 ${c.btn} text-white rounded-lg px-3 py-2 text-xs font-medium transition-colors flex items-center justify-center gap-1.5`}>
          Open <ChevronRight size={12} />
        </button>
        {onExport && (
          <button onClick={onExport} className="bg-white/5 hover:bg-white/10 text-white/60 rounded-lg px-3 py-2 text-xs transition-colors flex items-center gap-1.5">
            <Download size={12} /> PDF
          </button>
        )}
      </div>
    </div>
  );
}
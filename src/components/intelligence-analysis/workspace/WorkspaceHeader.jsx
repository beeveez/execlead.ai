import React from "react";
import { Link } from "react-router-dom";
import { X, ChevronRight, RotateCw, Download, TrendingUp, TrendingDown, Minus, ShieldAlert } from "lucide-react";

const TREND_ICON = { up: TrendingUp, down: TrendingDown, stable: Minus };

export default function WorkspaceHeader({ bundle, onClose, onRerun, onExport, isRerunning }) {
  const TrendIcon = TREND_ICON[bundle.summary.trend] || Minus;
  const sevColor = bundle.summary.severity === "high" ? "text-red-400"
    : bundle.summary.severity === "medium" ? "text-amber-400" : "text-blue-400";
  return (
    <div className="sticky top-0 z-20 bg-[#0d0d14]/95 backdrop-blur border-b border-white/10 px-5 py-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 min-w-0 text-xs text-white/40">
          <Link to="/developer/diagnostics" onClick={onClose} className="hover:text-white/70 transition-colors">Diagnostics</Link>
          <ChevronRight size={12} />
          <span className="text-white/70 truncate">Intelligence</span>
          <ChevronRight size={12} />
          <span className="text-amber-400 font-medium truncate">{bundle.label}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onExport} className="flex items-center gap-1.5 text-[11px] text-indigo-300 hover:text-indigo-200 bg-indigo-500/10 hover:bg-indigo-500/15 border border-indigo-500/20 rounded-lg px-2.5 py-1.5 transition-colors">
            <Download size={11} /> Export
          </button>
          <button onClick={onRerun} disabled={isRerunning} className="flex items-center gap-1.5 text-[11px] text-emerald-300 hover:text-emerald-200 bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/20 rounded-lg px-2.5 py-1.5 transition-colors disabled:opacity-50">
            <RotateCw size={11} className={isRerunning ? "animate-spin" : ""} /> {isRerunning ? "Analyzing…" : "Analyze Again"}
          </button>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors" aria-label="Close">
            <X size={18} className="text-white/50" />
          </button>
        </div>
      </div>
      <div className="flex items-end justify-between gap-4 mt-3 flex-wrap">
        <div>
          <h2 className="text-white font-bold text-lg">{bundle.label}</h2>
          <p className="text-white/40 text-xs">Intelligence Details Workspace™ v2.0</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-white">{bundle.summary.overallScore}</div>
            <div className="text-white/30 text-[10px] uppercase tracking-wider">Score / {bundle.summary.target}</div>
          </div>
          <div className="text-center">
            <TrendIcon size={18} className={bundle.summary.trend === "up" ? "text-emerald-400" : bundle.summary.trend === "down" ? "text-red-400" : "text-white/40"} />
            <div className="text-white/30 text-[10px] uppercase tracking-wider mt-0.5">Trend</div>
          </div>
          <div className="text-center">
            <ShieldAlert size={18} className={sevColor} />
            <div className={`text-[10px] uppercase tracking-wider mt-0.5 ${sevColor}`}>{bundle.summary.severity}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
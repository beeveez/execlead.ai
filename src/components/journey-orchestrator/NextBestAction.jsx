import React from "react";
import { Link } from "react-router-dom";
import { Zap, Clock, TrendingUp, ArrowRight } from "lucide-react";

const PRIORITY_STYLE = {
  critical: { dot: "bg-rose-500", text: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20", label: "Critical" },
  high: { dot: "bg-amber-500", text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", label: "High" },
  medium: { dot: "bg-cyan-500", text: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20", label: "Medium" },
  low: { dot: "bg-violet-500", text: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20", label: "Low" },
};

export default function NextBestAction({ action }) {
  if (!action) return null;
  const style = PRIORITY_STYLE[action.priority] || PRIORITY_STYLE.medium;

  return (
    <Link to={action.path} className="block group">
      <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 rounded-2xl p-5 hover:border-amber-500/30 transition-all">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-amber-400 text-xs uppercase tracking-widest font-semibold">
            <Zap size={14} />
            Next Best Action™
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${style.bg} ${style.text} ${style.border} border`}>
            {style.label}
          </span>
        </div>
        <h3 className="text-white font-bold text-lg mb-1">{action.title}</h3>
        <p className="text-white/50 text-sm mb-4 leading-relaxed">{action.description}</p>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1 text-white/40">
            <Clock size={12} /> {action.estimatedMinutes} min
          </span>
          <span className="flex items-center gap-1 text-emerald-400 font-medium">
            <TrendingUp size={12} /> +{action.readinessImpact}% readiness
          </span>
          <span className="text-white/30">{action.source}</span>
          <span className="ml-auto flex items-center gap-1 text-amber-400 group-hover:gap-2 transition-all">
            Start Now <ArrowRight size={12} />
          </span>
        </div>
      </div>
    </Link>
  );
}
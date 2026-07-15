import React from "react";
import { RefreshCw, History, TrendingUp, TrendingDown, Minus } from "lucide-react";

const MOMENTUM_COLORS = { increasing: "text-emerald-400", stable: "text-amber-400", declining: "text-red-400" };
const MOMENTUM_LABELS = { increasing: "Increasing", stable: "Stable", declining: "Declining" };

export default function BriefingHero({ briefing, onRegenerate, onHistory }) {
  const score = briefing.briefing_score || 0;
  const change = briefing.score_change || 0;
  const summary = briefing.executiveSummary || {};
  const circ = 2 * Math.PI * 45;
  const offset = circ - (score / 100) * circ;
  const TrendIcon = change > 0 ? TrendingUp : change < 0 ? TrendingDown : Minus;

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <div className="text-white/30 text-xs uppercase tracking-widest mb-1">Weekly Executive Intelligence</div>
          <h1 className="text-2xl font-bold text-white">Executive Briefing™</h1>
          <p className="text-white/40 text-sm mt-1">
            {briefing.briefing_date ? new Date(briefing.briefing_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : ""} · {briefing.period}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={onHistory} className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-3 py-1.5 transition-colors">
            <History size={12} /> History
          </button>
          <button onClick={onRegenerate} className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/15 border border-indigo-500/20 rounded-lg px-3 py-1.5 transition-colors">
            <RefreshCw size={12} /> Regenerate
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="relative flex-shrink-0">
          <svg viewBox="0 0 100 100" className="w-36 h-36">
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="5" className="text-white/5" />
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="5"
              strokeDasharray={circ} strokeDashoffset={offset}
              className="text-indigo-400" transform="rotate(-90 50 50)" strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-white">{score}</span>
            <span className="text-[10px] text-white/40 uppercase tracking-wider">Score</span>
          </div>
        </div>

        <div className="flex-1 space-y-3 w-full">
          <div className="flex items-center gap-2">
            <span className={`flex items-center gap-1 text-sm font-medium ${change > 0 ? "text-emerald-400" : change < 0 ? "text-red-400" : "text-white/40"}`}>
              <TrendIcon size={14} /> {change > 0 ? `+${change}` : change}
            </span>
            <span className="text-white/30 text-xs">vs last week</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Stat label="Readiness" value={`${summary.readiness ?? briefing.executive_readiness ?? 0}%`} />
            <Stat label="Probability" value={`${summary.probability ?? briefing.promotion_probability ?? 0}%`} />
            <Stat label="Momentum" value={MOMENTUM_LABELS[briefing.momentum] || "Stable"} color={MOMENTUM_COLORS[briefing.momentum]} />
            <Stat label="Confidence" value={`${summary.confidence ?? 0}%`} />
          </div>
          {briefing.ai_narrative && (
            <p className="text-sm text-white/60 leading-relaxed pt-2 border-t border-white/5">{briefing.ai_narrative}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, color = "text-white" }) {
  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-lg px-3 py-2">
      <div className="text-[10px] text-white/40 uppercase tracking-wider">{label}</div>
      <div className={`text-sm font-semibold ${color}`}>{value}</div>
    </div>
  );
}
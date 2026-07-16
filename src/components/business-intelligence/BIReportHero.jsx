import React from "react";
import { TrendingUp, TrendingDown, Minus, RefreshCw, Activity } from "lucide-react";
import { getMomentumColor, getMomentumLabel } from "@/lib/businessIntelligenceEngine";

export default function BIReportHero({ report, onGenerate, generating }) {
  const score = report?.overall_health_score || 0;
  const change = report?.score_change || 0;
  const momentum = report?.momentum || "stable";
  const period = report?.period || "—";

  const MomentumIcon = momentum === "increasing" ? TrendingUp : momentum === "declining" ? TrendingDown : Minus;
  const scoreColor = score >= 75 ? "text-emerald-400" : score >= 50 ? "text-amber-400" : score >= 25 ? "text-orange-400" : "text-red-400";
  const ringColor = score >= 75 ? "stroke-emerald-400" : score >= 50 ? "stroke-amber-400" : score >= 25 ? "stroke-orange-400" : "stroke-red-400";

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-white/40 text-xs uppercase tracking-widest mb-1">
            <Activity size={12} className="text-indigo-400" /> Business Intelligence Report
          </div>
          <h2 className="text-lg font-bold text-white">Week {period}</h2>
          <p className="text-white/40 text-sm mt-0.5">{report?.report_date || "No report generated"}</p>
        </div>
        <button
          onClick={onGenerate}
          disabled={generating}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 text-white text-sm font-medium transition-colors"
        >
          <RefreshCw size={14} className={generating ? "animate-spin" : ""} />
          {generating ? "Generating..." : "Generate Report"}
        </button>
      </div>

      <div className="flex items-center gap-8">
        <div className="relative w-32 h-32 flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" strokeWidth="8" className="stroke-white/5" />
            <circle
              cx="60" cy="60" r="52" fill="none" strokeWidth="8" strokeLinecap="round"
              className={ringColor}
              strokeDasharray={`${(score / 100) * 327} 327`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-3xl font-bold ${scoreColor}`}>{score}</span>
            <span className="text-white/30 text-[10px] uppercase tracking-widest">Health</span>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-3 gap-4">
          <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
            <div className="text-white/30 text-xs uppercase tracking-widest mb-1">Momentum</div>
            <div className={`flex items-center gap-1.5 text-sm font-medium ${getMomentumColor(momentum)}`}>
              <MomentumIcon size={14} /> {getMomentumLabel(momentum)}
            </div>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
            <div className="text-white/30 text-xs uppercase tracking-widest mb-1">Change</div>
            <div className={`text-sm font-medium ${change > 0 ? "text-emerald-400" : change < 0 ? "text-red-400" : "text-white/40"}`}>
              {change > 0 ? "+" : ""}{change} pts
            </div>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
            <div className="text-white/30 text-xs uppercase tracking-widest mb-1">Previous</div>
            <div className="text-sm font-medium text-white/60">{report?.previous_score || 0}</div>
          </div>
        </div>
      </div>

      {report?.ai_narrative && (
        <div className="mt-6 bg-indigo-500/[0.03] border border-indigo-500/10 rounded-lg p-4">
          <div className="text-indigo-400 text-xs uppercase tracking-widest mb-2">Executive Summary</div>
          <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">{report.ai_narrative}</p>
        </div>
      )}
    </div>
  );
}
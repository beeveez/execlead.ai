import React from "react";
import { Brain, CheckCircle, AlertCircle, Lightbulb, TrendingUp, Volume2, Loader2, Crown } from "lucide-react";

export default function LiveCoaching({ analysis, isAnalyzing, onReadCoaching, isSpeaking }) {
  if (isAnalyzing) {
    return (
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6 flex flex-col items-center justify-center py-12">
        <Loader2 size={32} className="animate-spin text-indigo-400 mb-3" />
        <p className="text-sm text-white/50">EXEC™ is analyzing your response…</p>
        <p className="text-[10px] text-white/30 mt-1">Evaluating communication, leadership, and executive presence</p>
      </div>
    );
  }

  if (!analysis) return null;

  const commMetrics = analysis.communication || {};
  const leaderMetrics = analysis.leadership || {};
  const coaching = analysis.coaching || {};

  return (
    <div className="space-y-4">
      {/* Overall score */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 flex items-center gap-4">
        <div className={`text-4xl font-bold ${analysis.overallScore >= 80 ? "text-emerald-400" : analysis.overallScore >= 60 ? "text-amber-400" : "text-red-400"}`}>{analysis.overallScore}</div>
        <div className="flex-1">
          <div className="text-sm font-medium text-white">Answer Score</div>
          <div className="text-xs text-white/40">{analysis.overallScore >= 80 ? "Excellent response" : analysis.overallScore >= 60 ? "Good — room for improvement" : "Needs work"}</div>
        </div>
        {onReadCoaching && (
          <button onClick={onReadCoaching} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${isSpeaking ? "bg-indigo-500/20 text-indigo-400" : "bg-white/5 text-white/50 hover:text-white/80"}`}>
            <Volume2 size={14} className={isSpeaking ? "animate-pulse" : ""} /> {isSpeaking ? "Speaking…" : "Read Coaching"}
          </button>
        )}
      </div>

      {/* Coaching summary */}
      {analysis.coachingSummary && (
        <div className="bg-indigo-500/5 border border-indigo-500/15 rounded-lg p-4">
          <p className="text-sm text-white/70 leading-relaxed italic">"{analysis.coachingSummary}"</p>
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <h4 className="text-xs font-semibold text-white mb-3 flex items-center gap-1.5"><Brain size={12} className="text-indigo-400" /> Communication</h4>
          <div className="space-y-2">
            {Object.entries(commMetrics).map(([key, val]) => <MetricBar key={key} label={formatLabel(key)} value={val} />)}
          </div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <h4 className="text-xs font-semibold text-white mb-3 flex items-center gap-1.5"><TrendingUp size={12} className="text-amber-400" /> Leadership</h4>
          <div className="space-y-2">
            {Object.entries(leaderMetrics).map(([key, val]) => <MetricBar key={key} label={formatLabel(key)} value={val} />)}
          </div>
        </div>
      </div>

      {/* Coaching feedback */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <h4 className="text-xs font-semibold text-emerald-400 mb-2 flex items-center gap-1.5"><CheckCircle size={12} /> Strengths</h4>
          <ul className="space-y-1">{coaching.strengths?.map((s, i) => <li key={i} className="text-[11px] text-white/50 flex gap-1.5"><span className="text-emerald-400/60">+</span> {s}</li>)}</ul>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <h4 className="text-xs font-semibold text-amber-400 mb-2 flex items-center gap-1.5"><AlertCircle size={12} /> Areas to Improve</h4>
          <ul className="space-y-1">{coaching.improvements?.map((s, i) => <li key={i} className="text-[11px] text-white/50 flex gap-1.5"><span className="text-amber-400/60">→</span> {s}</li>)}</ul>
        </div>
      </div>

      {/* Better wording */}
      {coaching.betterWording && (
        <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-lg p-4">
          <h4 className="text-xs font-semibold text-emerald-400 mb-2 flex items-center gap-1.5"><Lightbulb size={12} /> Better Executive Wording</h4>
          <p className="text-sm text-white/70 italic">"{coaching.betterWording}"</p>
        </div>
      )}

      {/* Leadership tips */}
      {coaching.leadershipTips?.length > 0 && (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <h4 className="text-xs font-semibold text-indigo-400 mb-2">Leadership Tips</h4>
          <ul className="space-y-1">{coaching.leadershipTips?.map((s, i) => <li key={i} className="text-[11px] text-white/50 flex gap-1.5"><span className="text-indigo-400/60">•</span> {s}</li>)}</ul>
        </div>
      )}

      {/* Executive perspective */}
      {coaching.executivePerspective && (
        <div className="bg-amber-500/5 border border-amber-500/15 rounded-lg p-4">
          <h4 className="text-xs font-semibold text-amber-400 mb-2 flex items-center gap-1.5"><Crown size={12} /> Executive Perspective</h4>
          <p className="text-sm text-white/70">{coaching.executivePerspective}</p>
        </div>
      )}
    </div>
  );
}

function MetricBar({ label, value }) {
  const color = value >= 80 ? "#10b981" : value >= 60 ? "#06b6d4" : value >= 40 ? "#f59e0b" : "#ef4444";
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-white/40 w-28 truncate">{label}</span>
      <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
      <span className="text-[10px] font-medium w-8 text-right" style={{ color }}>{value}</span>
    </div>
  );
}

function formatLabel(key) {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
}
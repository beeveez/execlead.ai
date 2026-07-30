import React from "react";
import { BarChart3 } from "lucide-react";
import { SCORING_DIMENSIONS } from "@/lib/launchDefenseEngine";

/**
 * PerformanceAnalytics™ — tracks questions answered, average score,
 * per-dimension performance (executive presence, confidence, clarity,
 * storytelling, etc.), response length, strengths and weak areas.
 */
export default function PerformanceAnalytics({ ld }) {
  const { analytics } = ld;
  if (!analytics || !analytics.total) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-4"><BarChart3 size={16} className="text-cyan-400" /><h3 className="text-white font-semibold text-sm">Performance Analytics™</h3></div>
        <p className="text-xs text-white/40 text-center py-8">No scored answers yet. Practice in the Question Bank or Simulator to see analytics.</p>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2"><BarChart3 size={16} className="text-cyan-400" /><h3 className="text-white font-semibold text-sm">Performance Analytics™</h3></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Metric label="Answers" value={analytics.total} />
        <Metric label="Avg Score" value={`${analytics.avgOverall}/100`} />
        <Metric label="Avg Length" value={`${analytics.responseLength} words`} />
        <Metric label="Dimensions" value={Object.keys(analytics.dimensionAverages).length} />
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
        <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3">Dimension Performance</h4>
        <div className="space-y-2">
          {SCORING_DIMENSIONS.map((d) => {
            const v = analytics.dimensionAverages[d.key] || 0;
            return (
              <div key={d.key} className="flex items-center gap-3">
                <span className="text-[11px] text-white/50 w-36 flex-shrink-0">{d.label}</span>
                <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${v}%`, background: d.color }} /></div>
                <span className="text-[11px] text-white/40 w-8 text-right">{v}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
          <div className="text-[11px] uppercase tracking-wider text-emerald-400 mb-2">Strengths</div>
          {analytics.strengths.map((s) => <div key={s.key} className="flex justify-between text-xs py-1"><span className="text-white/60">{SCORING_DIMENSIONS.find((d) => d.key === s.key)?.label || s.key}</span><span className="text-emerald-400">{s.value}</span></div>)}
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
          <div className="text-[11px] uppercase tracking-wider text-rose-400 mb-2">Weak Areas</div>
          {analytics.weakAreas.map((s) => <div key={s.key} className="flex justify-between text-xs py-1"><span className="text-white/60">{SCORING_DIMENSIONS.find((d) => d.key === s.key)?.label || s.key}</span><span className="text-rose-400">{s.value}</span></div>)}
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  return <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3"><div className="text-[10px] uppercase tracking-wider text-white/40">{label}</div><div className="text-lg font-bold text-white">{value}</div></div>;
}
import React from "react";
import { GitBranch, BarChart3 } from "lucide-react";

const STATUS_COLORS = {
  past: "bg-white/10 border-white/20 text-white/50",
  current: "bg-indigo-500/20 border-indigo-500/40 text-indigo-400",
  projected: "bg-violet-500/10 border-violet-500/20 text-violet-400",
  goal: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
  milestone: "bg-amber-500/10 border-amber-500/20 text-amber-400",
};

export default function BriefingTimeline({ briefing }) {
  const timeline = briefing.timeline || [];
  const scores = briefing.briefingScore || {};

  const scoreBars = [
    { label: "Leadership", value: scores.leadership || 0, color: "bg-cyan-400" },
    { label: "Promotion", value: scores.promotion || 0, color: "bg-indigo-400" },
    { label: "Learning", value: scores.learning || 0, color: "bg-emerald-400" },
    { label: "Momentum", value: scores.momentum || 0, color: "bg-violet-400" },
    { label: "Missions", value: scores.missions || 0, color: "bg-amber-400" },
    { label: "Overall", value: scores.overall || briefing.briefing_score || 0, color: "bg-white" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-white/5 border border-white/10 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <GitBranch size={16} className="text-violet-400" />
          <h3 className="text-sm font-semibold text-white">Executive Timeline</h3>
        </div>
        <div className="space-y-0">
          {timeline.map((t, i) => (
            <div key={i} className="flex items-start gap-3 pb-4 last:pb-0 relative">
              {i < timeline.length - 1 && <div className="absolute left-[7px] top-5 bottom-0 w-px bg-white/10" />}
              <div className={`w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 mt-0.5 ${STATUS_COLORS[t.status] || STATUS_COLORS.past}`} />
              <div>
                <div className="text-[10px] text-white/40 uppercase tracking-wider">{t.label}</div>
                <div className="text-sm text-white font-medium">{t.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={16} className="text-indigo-400" />
          <h3 className="text-sm font-semibold text-white">Executive Briefing Score™</h3>
        </div>
        <div className="space-y-3">
          {scoreBars.map((s) => (
            <div key={s.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-white/60">{s.label}</span>
                <span className="text-xs text-white font-semibold">{s.value}</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${s.color} transition-all duration-500`} style={{ width: `${s.value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
import React from "react";
import { TrendingUp, Target, ChevronRight } from "lucide-react";

function scoreColor(score) {
  if (score >= 90) return "#10b981";
  if (score >= 70) return "#06b6d4";
  if (score >= 50) return "#f59e0b";
  return "#ef4444";
}

export default function CognitivePillars({ pillars, supportingMetrics = [], onPillarClick }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-bold text-white mb-3">Cognitive Pillars™ — Primary Dimensions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {pillars.map((p) => {
            const color = scoreColor(p.score);
            const gap = p.target - p.score;
            const below = gap > 0;
            return (
              <div
                key={p.id}
                onClick={below && onPillarClick ? () => onPillarClick(p) : undefined}
                className={`bg-white/[0.02] border border-white/5 rounded-xl p-4 ${below && onPillarClick ? "cursor-pointer hover:bg-white/[0.04] hover:border-white/10 transition-colors" : ""}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-white/70">{p.label}</span>
                  <div className="flex items-center gap-1">
                    {p.trend !== "—" && <TrendingUp size={10} className="text-emerald-400" />}
                    <span className="text-[9px] text-white/30">{p.trend}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl font-bold" style={{ color }}>{p.score}</span>
                  <div className="flex-1">
                    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${p.score}%`, backgroundColor: color }} />
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[9px] text-white/30">Target: {p.target}</span>
                      <span className="text-[9px]" style={{ color: gap <= 0 ? "#10b981" : "#f59e0b" }}>
                        {gap <= 0 ? "Met" : `+${gap} to go`}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-white/40 leading-relaxed">{p.evidence}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[9px] text-indigo-400/60">{p.program}</span>
                  {below && onPillarClick && (
                    <span className="flex items-center gap-0.5 text-[9px] text-white/30 hover:text-indigo-300 transition-colors">
                      Blocking issue <ChevronRight size={10} />
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {supportingMetrics.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-white mb-3">Supporting Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {supportingMetrics.map((m) => {
              const color = scoreColor(m.score);
              return (
                <div key={m.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-white/70">{m.label}</span>
                    <span className="text-lg font-bold" style={{ color }}>{m.score}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden mb-2">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${m.score}%`, backgroundColor: color }} />
                  </div>
                  <p className="text-[10px] text-white/40 leading-relaxed">{m.evidence}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
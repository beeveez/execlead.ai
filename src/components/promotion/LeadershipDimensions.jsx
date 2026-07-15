import React from 'react';
import { BarChart3, Award } from 'lucide-react';

export default function LeadershipDimensions({ dimensions, strengths, skillGaps }) {
  if (!dimensions || dimensions.length === 0) {
    return (
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <p className="text-[11px] text-white/30 text-center py-6">No leadership dimension data available.</p>
      </div>
    );
  }

  const maxScore = Math.max(...dimensions.map((d) => Math.max(d.current, d.target)), 100);

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-white/80 mb-4 flex items-center gap-2">
        <BarChart3 size={14} className="text-indigo-400" />
        Leadership Dimensions — 15 Competencies
      </h3>

      {/* Dimension bars */}
      <div className="space-y-2">
        {dimensions.map((dim) => {
          const gapPct = dim.gap > 0 ? (dim.gap / dim.target) * 100 : 0;
          const hasGap = dim.gap > 5;
          return (
            <div key={dim.key} className="flex items-center gap-3">
              <span className="text-[10px] text-white/50 w-28 truncate flex-shrink-0">{dim.label}</span>
              <div className="flex-1 relative h-5 bg-white/[0.02] rounded-full overflow-hidden">
                {/* Target marker */}
                <div className="absolute top-0 bottom-0 w-px bg-white/20" style={{ left: `${(dim.target / maxScore) * 100}%` }} />
                {/* Current score */}
                <div
                  className={`h-full rounded-full transition-all duration-500 ${hasGap ? "bg-amber-500/30" : "bg-emerald-500/30"}`}
                  style={{ width: `${(dim.current / maxScore) * 100}%` }}
                />
              </div>
              <span className={`text-[11px] font-medium w-8 text-right ${hasGap ? "text-amber-400" : "text-emerald-400"}`}>{dim.current}</span>
              <span className="text-[9px] text-white/20 w-8">/{dim.target}</span>
              {hasGap && <span className="text-[9px] text-amber-400/60 w-8">-{dim.gap}</span>}
            </div>
          );
        })}
      </div>

      {/* Strengths + Gaps Summary */}
      <div className="mt-4 pt-3 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Executive Strength Index™ */}
        <div>
          <div className="text-[10px] uppercase tracking-wider text-white/40 mb-2 flex items-center gap-1">
            <Award size={10} className="text-emerald-400" />
            Executive Strength Index™
          </div>
          <div className="space-y-1.5">
            {(strengths || []).map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-[9px] text-white/30 w-4">{i + 1}.</span>
                <span className="text-[11px] text-white/60 flex-1 truncate">{s.label}</span>
                <span className="text-[11px] font-bold text-emerald-400">{s.score}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Skill Gap Analysis */}
        <div>
          <div className="text-[10px] uppercase tracking-wider text-white/40 mb-2 flex items-center gap-1">
            <BarChart3 size={10} className="text-amber-400" />
            Skill Gap Analysis
          </div>
          <div className="space-y-1.5">
            {(skillGaps || []).slice(0, 5).map((g, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-[9px] text-white/30 w-4">{i + 1}.</span>
                <span className="text-[11px] text-white/60 flex-1 truncate">{g.label}</span>
                <span className="text-[9px] text-white/30">{g.current}→{g.target}</span>
                <span className="text-[11px] font-bold text-amber-400">-{g.gap}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
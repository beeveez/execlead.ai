import React from "react";
import { SCORE_DIMENSIONS } from "@/lib/architectureGovernanceEngine";

/**
 * Architecture Impact Score™ — radar/bar visualization.
 * Renders all eight dimensions with their weighted contributions.
 */
export default function ImpactScorePanel({ scores, overallScore }) {
  const dimensions = SCORE_DIMENSIONS.map((dim) => {
    const raw = scores[dim.key] ?? 0;
    const adjusted = dim.invert ? (100 - raw) : raw;
    return { ...dim, raw, adjusted };
  });

  const getColor = (adjusted) => {
    if (adjusted >= 75) return "#10b981";
    if (adjusted >= 50) return "#f59e0b";
    if (adjusted >= 30) return "#f97316";
    return "#ef4444";
  };

  return (
    <div className="bg-white/[0.02] border border-white/10 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold text-white">Architecture Impact Score™</h4>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold" style={{ color: getColor(overallScore) }}>{overallScore}</span>
          <span className="text-xs text-white/30">/ 100</span>
        </div>
      </div>

      <div className="space-y-2.5">
        {dimensions.map((dim) => (
          <div key={dim.key}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-white/50">
                {dim.label}
                {dim.invert && <span className="text-white/20 ml-1">(inverted)</span>}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-white/30 text-[10px]">w{dim.weight}</span>
                <span className="text-white/70 font-mono w-8 text-right">{dim.raw}</span>
              </div>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${dim.adjusted}%`,
                  backgroundColor: getColor(dim.adjusted),
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-white/5 text-[10px] text-white/30">
        Complexity and Technical Debt are inverted (lower raw = better). Overall score is weight-averaged.
      </div>
    </div>
  );
}
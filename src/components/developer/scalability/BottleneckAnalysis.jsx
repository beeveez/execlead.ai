import React from "react";
import { AlertTriangle, ArrowDown } from "lucide-react";
import { BOTTLENECK_CHAIN } from "@/lib/scalabilityAssessmentEngine";

const SEVERITY_STYLES = {
  Critical: "bg-red-500/10 border-red-500/20 text-red-400",
  High: "bg-amber-500/10 border-amber-500/20 text-amber-400",
  Medium: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",
  Low: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
  "Low (unknown)": "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
};

/**
 * Bottleneck Analysis — ordered failure chain.
 * Shows which components fail first under load.
 */
export default function BottleneckAnalysis() {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle size={16} className="text-amber-400" />
        <h3 className="text-sm font-bold text-white">Bottleneck Analysis</h3>
        <span className="text-[10px] text-white/30 ml-auto">Ordered by failure sequence</span>
      </div>

      <div className="space-y-2">
        {BOTTLENECK_CHAIN.map((b, i) => (
          <React.Fragment key={b.rank}>
            <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-white/[0.02] border border-white/5">
              {/* Rank */}
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                <span className="text-xs font-bold text-white/60">{b.rank}</span>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-white">{b.component}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded border ${SEVERITY_STYLES[b.severity] || SEVERITY_STYLES.Medium}`}>
                    {b.severity}
                  </span>
                  <span className="text-[10px] text-white/30 ml-auto">{b.failurePoint}</span>
                </div>
                <p className="text-[11px] text-white/50 leading-relaxed mb-1.5">{b.reason}</p>
                <div className="flex items-start gap-1.5">
                  <span className="text-[10px] text-emerald-400/70 font-medium flex-shrink-0">Mitigation:</span>
                  <span className="text-[10px] text-white/40">{b.mitigation}</span>
                </div>
              </div>
            </div>
            {i < BOTTLENECK_CHAIN.length - 1 && (
              <div className="flex justify-center py-0.5">
                <ArrowDown size={12} className="text-white/15" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
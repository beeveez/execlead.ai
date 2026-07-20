import React from "react";

/**
 * Founding Cohort Progress — compact progress bar showing
 * Accepted Members / Capacity. Filled based on shared metrics.
 */
export default function CohortProgress({ accepted, capacity }) {
  const pct = capacity > 0 ? Math.min(Math.round((accepted / capacity) * 100), 100) : 0;

  return (
    <div className="max-w-md mx-auto mb-6" role="group" aria-label="Founding cohort progress">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] uppercase tracking-wider text-white/40 font-medium">Founding Cohort Progress</span>
        <span className="text-xs text-amber-200 font-semibold tabular-nums">
          <span aria-label={`${accepted} accepted members out of ${capacity}`}>{accepted}</span>
          <span className="text-white/30"> / {capacity}</span>
        </span>
      </div>
      <div
        className="h-1.5 rounded-full bg-white/5 overflow-hidden"
        role="progressbar"
        aria-label="Founding cohort progress"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="text-[10px] text-white/30 mt-1">{pct}% filled</div>
    </div>
  );
}
import React from "react";

/**
 * Live Status Indicator — subtle pulsing dot communicating that
 * statistics are real-time, not static marketing copy.
 */
export default function LiveStatusBadge() {
  return (
    <div
      className="inline-flex items-center gap-1.5 mb-4"
      aria-label="Live program statistics, updated in real time"
      role="status"
    >
      <span className="relative flex h-2 w-2" aria-hidden="true">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
      </span>
      <span className="text-[10px] uppercase tracking-wider text-white/40 font-medium">
        Live Program Statistics
      </span>
      <span className="text-[10px] text-white/20">· Updated in real time</span>
    </div>
  );
}
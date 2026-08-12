import React from 'react';

export default function ConfidenceFactorChip({ factor }) {
  const strength = Math.min(100, Math.round((factor.contribution / factor.maxContribution) * 100));
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-2">
      <div className="flex items-center justify-between gap-2 text-[9px]">
        <span className="text-white/55">{factor.label}</span>
        <span className="text-white/75 font-semibold">{factor.value}/100</span>
      </div>
      <div className="h-1 mt-1.5 rounded-full bg-white/[0.06] overflow-hidden">
        <div className="h-full rounded-full bg-indigo-400/75" style={{ width: `${strength}%` }} />
      </div>
      <div className="text-[8px] text-white/30 mt-1">{factor.contribution} confidence points</div>
    </div>
  );
}
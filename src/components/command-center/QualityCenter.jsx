import React from 'react';

const SEVERITY_CONFIG = {
  critical: 'bg-red-500/[0.04] border-red-500/15 text-red-400',
  high: 'bg-orange-500/[0.04] border-orange-500/15 text-orange-400',
  medium: 'bg-amber-500/[0.04] border-amber-500/15 text-amber-400',
  low: 'bg-blue-500/[0.04] border-blue-500/15 text-blue-400',
  info: 'bg-white/[0.02] border-white/5 text-white/60',
  success: 'bg-emerald-500/[0.04] border-emerald-500/15 text-emerald-400',
};

export default function QualityCenter({ summary }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {summary.map((item) => {
        const cfg = SEVERITY_CONFIG[item.severity] || SEVERITY_CONFIG.info;
        return (
          <div key={item.id} className={`border rounded-xl p-4 ${cfg}`}>
            <p className="text-[10px] uppercase tracking-wider opacity-60 mb-1">{item.label}</p>
            <p className="text-3xl font-bold">{item.value}</p>
            <p className="text-[10px] opacity-50 mt-1">Target: {item.target}</p>
          </div>
        );
      })}
    </div>
  );
}
import React from 'react';
import { TrendBadge } from './SectionShell';

export default function AIIntelligence({ metrics }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {metrics.map((m) => (
        <div key={m.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1.5">{m.label}</p>
          <div className="flex items-baseline gap-1.5 mb-1">
            <span className="text-2xl font-bold text-white">{m.value}</span>
            <span className="text-white/30 text-xs">{m.unit}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/30 text-[10px]">Target {m.target}{m.unit}</span>
            <TrendBadge trend={m.trend} change={m.change} unit={m.unit} />
          </div>
        </div>
      ))}
    </div>
  );
}
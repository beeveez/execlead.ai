import React from 'react';
import { TrendBadge } from './SectionShell';

const TREND_ICON = { up: '↑', down: '↓', stable: '—' };

export default function CustomerIntelligence({ data }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Metrics */}
      <div>
        <p className="text-white/40 text-[10px] uppercase tracking-wider mb-2">Metrics</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {data.metrics.map((m) => (
            <div key={m.id} className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
              <p className="text-white/40 text-[10px] uppercase mb-1">{m.label}</p>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-white">{m.value}</span>
                {m.unit && <span className="text-white/30 text-xs">{m.unit}</span>}
              </div>
              <div className="mt-1"><TrendBadge trend={m.trend} change={m.change} /></div>
            </div>
          ))}
        </div>
      </div>
      {/* Top Requested Features */}
      <div>
        <p className="text-white/40 text-[10px] uppercase tracking-wider mb-2">Top Requested Features</p>
        <div className="space-y-1.5">
          {data.topRequestedFeatures.map((f, i) => {
            const max = data.topRequestedFeatures[0].requests;
            return (
              <div key={f.feature} className="flex items-center gap-2">
                <span className="text-white/30 text-xs w-4">{i + 1}</span>
                <span className="text-white/60 text-xs flex-1 truncate">{f.feature}</span>
                <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${(f.requests / max) * 100}%` }} />
                </div>
                <span className="text-white/50 text-xs w-6 text-right">{f.requests}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
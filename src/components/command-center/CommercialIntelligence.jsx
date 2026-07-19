import React from 'react';
import { TrendBadge } from './SectionShell';

function formatCurrency(value) {
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
  return `$${value}`;
}

export default function CommercialIntelligence({ data }) {
  const maxMrr = Math.max(...data.growthTrend.map((t) => t.mrr));
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Metrics */}
      <div>
        <p className="text-white/40 text-[10px] uppercase tracking-wider mb-2">Revenue</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
          {data.metrics.map((m) => (
            <div key={m.id} className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
              <p className="text-white/40 text-[10px] uppercase mb-1">{m.label}</p>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-white">
                  {m.unit === 'USD' ? formatCurrency(m.value) : m.value}
                </span>
                {m.unit && m.unit !== 'USD' && <span className="text-white/30 text-xs">{m.unit}</span>}
              </div>
              <div className="mt-1"><TrendBadge trend={m.trend} change={m.change} unit={m.unit === 'USD' ? '' : m.unit} /></div>
            </div>
          ))}
        </div>
        {/* Top Plans */}
        <p className="text-white/40 text-[10px] uppercase tracking-wider mb-2">Top Plans</p>
        <div className="space-y-1.5">
          {data.topPlans.map((p) => {
            const maxRev = Math.max(...data.topPlans.map((x) => x.revenue));
            return (
              <div key={p.plan} className="flex items-center gap-2">
                <span className="text-white/60 text-xs w-24 truncate">{p.plan}</span>
                <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${(p.revenue / maxRev) * 100}%` }} />
                </div>
                <span className="text-white/50 text-xs w-16 text-right">{formatCurrency(p.revenue)}</span>
                <span className="text-white/30 text-xs w-8 text-right">{p.subscribers}</span>
              </div>
            );
          })}
        </div>
      </div>
      {/* Funnel + Growth */}
      <div>
        <p className="text-white/40 text-[10px] uppercase tracking-wider mb-2">Conversion Funnel</p>
        <div className="space-y-1.5 mb-4">
          {data.funnel.map((f, i) => (
            <div key={f.stage} className="flex items-center gap-2">
              <span className="text-white/60 text-xs w-28 truncate">{f.stage}</span>
              <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-accent-orange rounded-full" style={{ width: `${f.pct}%` }} />
              </div>
              <span className="text-white/50 text-xs w-12 text-right">{f.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
        <p className="text-white/40 text-[10px] uppercase tracking-wider mb-2">MRR Growth Trend</p>
        <div className="flex items-end justify-between gap-1.5 h-20">
          {data.growthTrend.map((t) => (
            <div key={t.month} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full bg-indigo-400/30 rounded-t" style={{ height: `${(t.mrr / maxMrr) * 100}%` }} />
              <span className="text-white/30 text-[9px]">{t.month}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
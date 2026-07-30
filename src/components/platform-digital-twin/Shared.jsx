import React from 'react';
import { Loader2 } from 'lucide-react';

export function SectionShell({ title, subtitle, icon: Icon, actions, children }) {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {Icon && <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0"><Icon size={18} className="text-indigo-400" /></div>}
          <div>
            <h1 className="text-lg font-bold text-white">{title}</h1>
            {subtitle && <p className="text-xs text-white/40 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {actions}
      </div>
      {children}
    </div>
  );
}

export function KpiCard({ kpi }) {
  const trendUp = kpi.current >= kpi.trend[0];
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs text-white/50">{kpi.label}</span>
        <span className={`text-[10px] font-semibold ${trendUp ? 'text-emerald-400' : 'text-rose-400'}`}>{trendUp ? '▲' : '▼'} {kpi.confidence}%</span>
      </div>
      <div className="flex items-end justify-between mb-2">
        <span className="text-2xl font-bold text-white">{kpi.current}</span>
        <span className="text-[10px] text-white/30">/ {kpi.target}</span>
      </div>
      <Sparkline data={kpi.trend} color={trendUp ? '#10b981' : '#f43f5e'} />
      <p className="text-[11px] text-white/40 mt-2 leading-snug">{kpi.recommendation}</p>
    </div>
  );
}

export function Sparkline({ data, color = '#6366f1', height = 28 }) {
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((d, i) => `${(i / (data.length - 1)) * 100},${height - ((d - min) / range) * height}`).join(' ');
  return (
    <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" className="w-full" style={{ height }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export function Badge({ children, color = 'indigo' }) {
  const map = { indigo: 'bg-indigo-500/15 text-indigo-300', emerald: 'bg-emerald-500/15 text-emerald-300', amber: 'bg-amber-500/15 text-amber-300', rose: 'bg-rose-500/15 text-rose-300', slate: 'bg-white/10 text-white/60', violet: 'bg-violet-500/15 text-violet-300' };
  return <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${map[color] || map.slate}`}>{children}</span>;
}

export function StatCard({ label, value, sub, color = '#6366f1' }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
      <div className="text-[10px] text-white/40 uppercase tracking-wider">{label}</div>
      <div className="text-xl font-bold mt-1" style={{ color }}>{value}</div>
      {sub && <div className="text-[10px] text-white/30 mt-0.5">{sub}</div>}
    </div>
  );
}

export function LoadingDots() {
  return <div className="flex items-center justify-center py-12 gap-2"><Loader2 size={18} className="animate-spin text-indigo-400" /><span className="text-white/40 text-sm">Computing twin…</span></div>;
}
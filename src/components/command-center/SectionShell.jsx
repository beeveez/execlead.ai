import React from 'react';

export default function SectionShell({ icon: Icon, title, subtitle, children, action }) {
  return (
    <section className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 lg:p-6">
      <div className="flex items-center justify-between mb-5 gap-3">
        <div className="flex items-center gap-2 min-w-0">
          {Icon && (
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <Icon size={14} className="text-amber-400" />
            </div>
          )}
          <div className="min-w-0">
            <h2 className="text-white font-semibold text-sm truncate">{title}</h2>
            {subtitle && <p className="text-white/30 text-xs truncate">{subtitle}</p>}
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {children}
    </section>
  );
}

export function TrendBadge({ trend, change, unit }) {
  if (trend === 'stable' || change === 0) {
    return <span className="text-white/30 text-xs">—</span>;
  }
  const positive = trend === 'up';
  const isGood = positive;
  return (
    <span className={`text-xs font-medium ${isGood ? 'text-emerald-400' : 'text-red-400'}`}>
      {positive ? '↑' : '↓'} {Math.abs(change)}{unit || ''}
    </span>
  );
}

export function ConfidenceDot({ level }) {
  const color = level === 'high' ? 'bg-emerald-400' : level === 'medium' ? 'bg-amber-400' : 'bg-red-400';
  return <span className={`inline-block w-1.5 h-1.5 rounded-full ${color}`} />;
}
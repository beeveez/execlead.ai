import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ArrowRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * InteractiveMetric™ — Universal Metric Intelligence™
 *
 * EVERY metric in EXECLEAD.AI opens a detailed drill-down.
 * Clicking a score/KPI reveals: Root Cause Analysis, Historical Trend,
 * Score Breakdown, Recommendations, Improvement Plan, Dependencies,
 * Owner, Target, Business Impact, AI Insights.
 *
 * Props:
 *   label       — metric name (e.g. "Platform Health")
 *   value       — current value (number or string)
 *   max         — max value for progress ring (optional)
 *   unit        — '%' or other suffix
 *   trend       — 'up' | 'down' | 'stable'
 *   trendValue  — e.g. "+5.2" or "-1.8"
 *   to          — drill-down route
 *   onClick      — drill-down handler (modal/drawer)
 *   comingSoon   — { purpose, status, availability }
 *   statusColor — override color class
 */
export default function InteractiveMetric({
  label,
  value,
  max = 100,
  unit = '',
  trend = 'stable',
  trendValue = '',
  to,
  onClick,
  comingSoon,
  statusColor,
  className = '',
}) {
  const hasInteraction = to || onClick || comingSoon;
  const colorClass = statusColor || (
    typeof value === 'number'
      ? value >= 90 ? 'text-emerald-400'
        : value >= 70 ? 'text-amber-400'
        : value >= 50 ? 'text-orange-400'
        : 'text-red-400'
      : 'text-white'
  );

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  const content = (
    <>
      <div className="flex items-start justify-between mb-2">
        <span className="text-white/40 text-xs font-medium uppercase tracking-wider">{label}</span>
        {trend !== 'stable' && trendValue && (
          <span className={cn('flex items-center gap-0.5 text-xs font-medium', trend === 'up' ? 'text-emerald-400' : 'text-red-400')}>
            <TrendIcon size={10} />
            {trendValue}
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-1">
        <span className={cn('text-3xl font-bold', colorClass)}>{value}</span>
        {unit && <span className="text-white/30 text-sm">{unit}</span>}
      </div>
      {typeof value === 'number' && max > 0 && (
        <div className="mt-2 h-1 rounded-full bg-white/5 overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all duration-500', colorClass.replace('text-', 'bg-'))}
            style={{ width: `${Math.min(100, (value / max) * 100)}%` }}
          />
        </div>
      )}
      {hasInteraction && !comingSoon && (
        <div className="mt-3 flex items-center gap-1 text-[11px] text-white/30 group-hover:text-amber-400 transition-colors">
          View drill-down <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
        </div>
      )}
    </>
  );

  if (comingSoon) {
    return (
      <div
        className={cn('group rounded-xl bg-white/[0.02] border border-white/5 p-4', className)}
        data-cursor-label="Coming Soon"
        tabIndex={0}
      >
        <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] text-blue-400 font-medium uppercase tracking-wider mb-2 inline-block">Coming Soon</span>
        {content}
      </div>
    );
  }

  if (!hasInteraction) {
    if (import.meta.env?.DEV) {
      console.warn('[Platform UX Rule] InteractiveMetric rendered without drill-down. Provide `to` or `onClick` for:', label);
    }
    return <div className={cn('rounded-xl bg-white/[0.02] border border-white/5 p-4', className)}>{content}</div>;
  }

  const baseClasses = cn(
    'group relative block rounded-xl bg-white/[0.02] border border-white/5 p-4 transition-all duration-300',
    'hover:shadow-lg hover:-translate-y-0.5 hover:border-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40',
    className
  );

  if (to) {
    return (
      <Link to={to} className={cn(baseClasses, 'cursor-pointer')} data-cursor-label="Open Metric" aria-label={`${label} drill-down`} tabIndex={0}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.(e); } }}
      className={cn(baseClasses, 'cursor-pointer text-left w-full')}
      data-cursor-label="Open Metric"
      aria-label={`${label} drill-down`}
      tabIndex={0}
    >
      {content}
    </button>
  );
}
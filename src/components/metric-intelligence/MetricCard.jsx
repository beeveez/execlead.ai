import React from 'react';
import { getScoreStatus, getScoreBarColor } from '@/lib/metricIntelligenceEngine';
import { openMetricDrawer } from '@/lib/metricDrawerStore';
import { logMetricOpened } from '@/lib/metricActivityLogger';
import { getMetricById } from '@/lib/metricIntelligenceEngine';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * MetricCard™ — makes any metric clickable and interactive.
 *
 * Props:
 *  - metricId: string (required — links to metric registry)
 *  - score: number (required — current score 0-100)
 *  - target: number (default 100)
 *  - previous: number (optional — for trend)
 *  - label: string (optional — overrides registry name)
 *  - icon: LucideIcon (optional)
 *  - size: 'sm' | 'md' | 'lg' (default 'md')
 *  - onClick: function (optional — custom click handler, falls back to drawer)
 */
export default function MetricCard({
  metricId,
  score,
  target = 100,
  previous = null,
  label,
  icon: Icon,
  size = 'md',
  onClick,
  className = '',
}) {
  const status = getScoreStatus(score);
  const trend = previous != null ? score - previous : null;
  const isClickable = score < 100;

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (metricId) {
      const def = getMetricById(metricId);
      if (def) logMetricOpened(def, score);
      openMetricDrawer(metricId, score, previous, label);
    }
  };

  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-5',
  };

  const scoreSize = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  return (
    <button
      onClick={handleClick}
      disabled={!isClickable && !onClick}
      className={`relative ${sizeClasses[size]} bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden transition-all text-left w-full ${
        isClickable ? 'hover:border-white/15 hover:bg-white/[0.04] cursor-pointer' : 'cursor-default'
      } ${className}`}
    >
      {/* Status accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${getScoreBarColor(score)}`} />

      {/* Header */}
      {label && (
        <div className="flex items-center gap-1.5 mb-2">
          {Icon && <Icon size={12} className="text-white/30" />}
          <span className="text-white/40 text-xs uppercase tracking-wider truncate">{label}</span>
        </div>
      )}

      {/* Score */}
      <div className="flex items-baseline gap-1.5">
        <span className={`${scoreSize[size]} font-bold text-white`}>{Math.round(score)}</span>
        {target === 100 && <span className="text-white/20 text-sm">/ 100</span>}
        {trend !== null && trend !== 0 && (
          <span className={`ml-auto flex items-center gap-0.5 text-xs ${trend > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {trend > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(trend)}
          </span>
        )}
        {trend === 0 && (
          <span className="ml-auto flex items-center gap-0.5 text-xs text-white/20">
            <Minus size={12} />
          </span>
        )}
      </div>

      {/* Status label */}
      <div className={`mt-1.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${status.bgLight} ${status.textClass}`}>
        {status.label}
      </div>

      {/* Clickable hint */}
      {isClickable && (
        <div className="absolute top-2 right-2 opacity-0 hover:opacity-100 transition-opacity">
          <span className="text-white/20 text-[10px]">Click for details →</span>
        </div>
      )}
    </button>
  );
}
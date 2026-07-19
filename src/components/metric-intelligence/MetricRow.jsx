import React from 'react';
import { getScoreStatus } from '@/lib/metricIntelligenceEngine';
import { openMetricDrawer } from '@/lib/metricDrawerStore';
import { logMetricOpened } from '@/lib/metricActivityLogger';
import { getMetricById } from '@/lib/metricIntelligenceEngine';
import { ChevronRight } from 'lucide-react';

/**
 * MetricRow™ — Shared clickable row component for list-style metric displays.
 *
 * Used by Knowledge Sync, Guardian™, and any page that displays metrics
 * in a row/list format instead of a card.
 *
 * Props:
 *  - metricId: string (required — links to metric registry)
 *  - score: number (required — current score 0-100)
 *  - label: string (optional — overrides registry name)
 *  - icon: LucideIcon (optional)
 *  - weight: string|number (optional — shown as secondary info)
 *  - onClick: function (optional — custom click handler, falls back to drawer)
 */
export default function MetricRow({
  metricId,
  score,
  label,
  icon: Icon,
  weight,
  onClick,
}) {
  const status = getScoreStatus(score);
  const belowTarget = score < 100;

  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }
    if (metricId) {
      const def = getMetricById(metricId);
      if (def) logMetricOpened(def, score);
      openMetricDrawer(metricId, score, null, label);
    }
  };

  return (
    <button
      onClick={handleClick}
      data-cursor-label="Drill Down"
      className={`w-full flex items-center gap-2.5 text-sm bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2 transition-all cursor-pointer hover:border-white/15 hover:bg-white/[0.04] ${
        belowTarget ? '' : 'hover:border-emerald-500/20'
      }`}
    >
      {Icon && <Icon size={12} className={belowTarget ? 'text-amber-400' : 'text-emerald-400'} />}
      <span className="text-white/70 flex-1 text-left">{label || metricId}</span>
      {weight != null && <span className="text-white/30 text-[10px]">{weight}</span>}
      <span className={`font-semibold ${status.textClass}`}>{Math.round(score)}%</span>
      <ChevronRight size={12} className="text-white/20" />
    </button>
  );
}
import React from 'react';
import { openMetricDrawer } from '@/lib/metricDrawerStore';
import { logMetricOpened } from '@/lib/metricActivityLogger';
import { getMetricById } from '@/lib/metricIntelligenceEngine';

/**
 * InteractiveKpiCard™ — Executive KPI Interaction Standard™
 *
 * Wraps any KPI card content with the platform-wide interaction standard:
 *   ✓ Pointer cursor
 *   ✓ Hover elevation
 *   ✓ Border highlight
 *   ✓ Smooth animation
 *   ✓ Keyboard accessibility
 *   ✓ Screen reader support
 *   ✓ Click → opens shared Metric Intelligence Drawer™
 *
 * This is NOT a duplicate of MetricCard — it wraps existing card content
 * without changing its visual design, adding only the interaction layer.
 */
export default function InteractiveKpiCard({
  metricId,
  score = 0,
  previous = null,
  label,
  className = '',
  children,
}) {
  const handleClick = () => {
    if (!metricId) return;
    const def = getMetricById(metricId);
    if (def) logMetricOpened(def, score);
    openMetricDrawer(metricId, score, previous, label);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      data-cursor-label="Drill Down"
      aria-label={`${label || 'Metric'}: ${score}. Click for detailed intelligence.`}
      className={`text-left w-full cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:border-white/15 hover:shadow-lg hover:shadow-black/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:ring-offset-1 focus:ring-offset-transparent active:scale-[0.99] ${className}`}
    >
      {children}
    </button>
  );
}
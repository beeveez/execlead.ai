/**
 * Executive Intelligence Drill-Down™ — Helper Hook
 * ----------------------------------------------------------------
 * Returns an `openDrillDown` function any dashboard can call to open
 * the reusable drill-down drawer for a metric.
 *
 * Usage:
 *   const openDrillDown = useIntelligenceDrillDown();
 *   <div onClick={() => openDrillDown(metric)}>...</div>
 *
 * Accepts either:
 *   - a metric object with an `id` field: openDrillDown({ id, label, score, ... })
 *   - a metricId string: openDrillDown('drift_health')
 */
import { useCallback } from 'react';
import { openIntelligenceAnalysis } from '@/lib/intelligenceAnalysisStore';

export function useIntelligenceDrillDown() {
  return useCallback((metric) => {
    if (typeof metric === 'string') {
      openIntelligenceAnalysis({ metricId: metric });
    } else if (metric?.id) {
      openIntelligenceAnalysis({ metricId: metric.id });
    } else if (metric?.metricId) {
      openIntelligenceAnalysis({ metricId: metric.metricId });
    }
  }, []);
}
import React, { useState, useEffect } from 'react';
import { subscribeToMetricDrawer, closeMetricDrawer } from '@/lib/metricDrawerStore';
import MetricIntelligenceDrawer from './MetricIntelligenceDrawer';

/**
 * MetricIntelligenceRoot — renders the drill-down drawer globally.
 * Add once near the app root (like ExecConcierge). Any MetricCard
 * anywhere in the app can open the drawer via openMetricDrawer().
 */
export default function MetricIntelligenceRoot() {
  const [state, setState] = useState({ open: false, metricId: null, score: 0, previous: null, label: null });

  useEffect(() => {
    return subscribeToMetricDrawer(setState);
  }, []);

  if (!state.open || !state.metricId) return null;

  return <MetricIntelligenceDrawer metricId={state.metricId} score={state.score} previous={state.previous} label={state.label} />;
}
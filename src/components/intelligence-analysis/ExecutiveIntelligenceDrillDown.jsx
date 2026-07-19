/**
 * Executive Intelligence Drill-Down™
 * ----------------------------------------------------------------
 * ONE reusable component. Every intelligence dashboard in EXECLEAD.AI
 * uses this to explain any metric below 100%.
 *
 * The drawer reads from the global intelligence analysis store and
 * automatically renders all available sections from the metric object:
 *   • Header (metric, score, target, status, trend, owner, last updated)
 *   • Why Is This Not 100? (unresolved issues)
 *   • Root Cause Analysis™
 *   • Business Impact (categorized)
 *   • Risks (deployment, operational, executive, customer)
 *   • Recommended Actions
 *   • Recovery Forecast
 *   • Related Intelligence
 *
 * Trigger from any component:
 *   import { openIntelligenceAnalysis } from '@/lib/intelligenceAnalysisStore';
 *   openIntelligenceAnalysis({ metricId: 'drift_health' });
 *
 * Or pass a full metric object:
 *   openIntelligenceAnalysis({ metric: enrichedMetricObject });
 */
export { default } from './IntelligenceAnalysisPanel';
export { default as ExecutiveIntelligenceDrillDown } from './IntelligenceAnalysisPanel';
/**
 * EXECLEAD.AI — Product Analytics™ v1.0
 * =================================================
 * Tracks per-capability usage metrics for commercialization
 * analysis. Uses the platform analytics SDK for event tracking
 * and the ProductCapabilityMetric entity for aggregate storage.
 * 
 * Tracked metrics per capability:
 *   Views, Clicks, Usage, Completion, Time Spent,
 *   AI Calls, Retention, Conversion, Favorites,
 *   Repeat Usage, Errors, Customer Satisfaction
 */

import { base44 } from '@/api/base44Client';

// ============================================================
// Event Tracking (real-time, fire-and-forget)
// ============================================================

const ANALYTICS_PREFIX = 'capability_';

/**
 * Track a capability view.
 */
export function trackView(capabilityId) {
  base44.analytics.track({
    eventName: `${ANALYTICS_PREFIX}view`,
    properties: { capability_id: capabilityId },
  });
}

/**
 * Track a capability click / interaction.
 */
export function trackClick(capabilityId) {
  base44.analytics.track({
    eventName: `${ANALYTICS_PREFIX}click`,
    properties: { capability_id: capabilityId },
  });
}

/**
 * Track capability usage (actual feature execution).
 */
export function trackUsage(capabilityId, metadata = {}) {
  base44.analytics.track({
    eventName: `${ANALYTICS_PREFIX}usage`,
    properties: {
      capability_id: capabilityId,
      ...metadata,
    },
  });
}

/**
 * Track capability completion (user finished a flow).
 */
export function trackCompletion(capabilityId, metadata = {}) {
  base44.analytics.track({
    eventName: `${ANALYTICS_PREFIX}completion`,
    properties: {
      capability_id: capabilityId,
      ...metadata,
    },
  });
}

/**
 * Track an AI call for a capability.
 */
export function trackAICall(capabilityId, tokensUsed = 0, responseTimeMs = 0) {
  base44.analytics.track({
    eventName: `${ANALYTICS_PREFIX}ai_call`,
    properties: {
      capability_id: capabilityId,
      tokens_used: tokensUsed,
      response_time_ms: responseTimeMs,
    },
  });
}

/**
 * Track an error in a capability.
 */
export function trackError(capabilityId, errorType, errorMessage) {
  base44.analytics.track({
    eventName: `${ANALYTICS_PREFIX}error`,
    properties: {
      capability_id: capabilityId,
      error_type: errorType,
      error_message: errorMessage?.substring(0, 200),
    },
  });
}

/**
 * Track time spent on a capability.
 */
export function trackTimeSpent(capabilityId, seconds) {
  base44.analytics.track({
    eventName: `${ANALYTICS_PREFIX}time_spent`,
    properties: {
      capability_id: capabilityId,
      seconds,
    },
  });
}

/**
 * Track a conversion event (upgrade, purchase).
 */
export function trackConversion(capabilityId, conversionType, value = 0) {
  base44.analytics.track({
    eventName: `${ANALYTICS_PREFIX}conversion`,
    properties: {
      capability_id: capabilityId,
      conversion_type: conversionType,
      value,
    },
  });
}

/**
 * Track a user favoriting a capability.
 */
export function trackFavorite(capabilityId) {
  base44.analytics.track({
    eventName: `${ANALYTICS_PREFIX}favorite`,
    properties: { capability_id: capabilityId },
  });
}

/**
 * Track customer satisfaction rating.
 */
export function trackSatisfaction(capabilityId, score) {
  base44.analytics.track({
    eventName: `${ANALYTICS_PREFIX}satisfaction`,
    properties: {
      capability_id: capabilityId,
      score, // 1-5
    },
  });
}

// ============================================================
// Aggregate Metric Storage
// ============================================================

/**
 * Get the current month key (e.g., "2026-07").
 */
function getMonthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Fetch aggregate metrics for all capabilities for a given period.
 */
export async function getCapabilityMetrics(period = getMonthKey()) {
  try {
    const records = await base44.entities.ProductCapabilityMetric.filter(
      { period },
      '-usage_count',
      200
    );
    return records;
  } catch {
    return [];
  }
}

/**
 * Fetch aggregate metrics for a specific capability.
 */
export async function getCapabilityMetric(capabilityId, period = getMonthKey()) {
  try {
    const records = await base44.entities.ProductCapabilityMetric.filter(
      { capability_id: capabilityId, period },
      '-created_date',
      1
    );
    return records?.[0] || null;
  } catch {
    return null;
  }
}

/**
 * Fetch metrics across multiple periods for trend analysis.
 */
export async function getMetricHistory(capabilityId, periods = 6) {
  try {
    const records = await base44.entities.ProductCapabilityMetric.filter(
      { capability_id: capabilityId },
      '-period',
      periods
    );
    return records;
  } catch {
    return [];
  }
}

// ============================================================
// Analytics Aggregation & Display
// ============================================================

/**
 * Merge registry capabilities with their metrics.
 */
export function mergeCapabilitiesWithMetrics(capabilities, metrics) {
  return capabilities.map(cap => {
    const metric = metrics.find(m => m.capability_id === cap.id);
    return {
      ...cap,
      metrics: metric || null,
      monthlyUsage: metric?.usage_count || 0,
      views: metric?.views || 0,
      clicks: metric?.clicks || 0,
      completions: metric?.completions || 0,
      timeSpentSeconds: metric?.time_spent_seconds || 0,
      aiCalls: metric?.ai_calls || 0,
      errors: metric?.errors || 0,
      uniqueUsers: metric?.unique_users || 0,
      repeatUsage: metric?.repeat_usage || 0,
      satisfactionScore: metric?.satisfaction_score || 0,
      estimatedAICost: metric?.estimated_ai_cost || 0,
      adoptionRate: metric?.unique_users ? Math.min(100, metric.unique_users * 2) : 0,
      retentionRate: metric?.retention_rate || 0,
      conversionRate: metric?.conversion_rate || 0,
    };
  });
}

/**
 * Get top used features.
 */
export function getTopUsedFeatures(capabilitiesWithMetrics, limit = 5) {
  return [...capabilitiesWithMetrics]
    .sort((a, b) => b.monthlyUsage - a.monthlyUsage)
    .slice(0, limit);
}

/**
 * Get least used features.
 */
export function getLeastUsedFeatures(capabilitiesWithMetrics, limit = 5) {
  return [...capabilitiesWithMetrics]
    .sort((a, b) => a.monthlyUsage - b.monthlyUsage)
    .slice(0, limit);
}

/**
 * Get most valuable features (by customer value × usage).
 */
export function getMostValuableFeatures(capabilitiesWithMetrics, limit = 5) {
  return [...capabilitiesWithMetrics]
    .map(c => ({ ...c, valueScore: c.customerValue * (1 + c.monthlyUsage / 100) }))
    .sort((a, b) => b.valueScore - a.valueScore)
    .slice(0, limit);
}

/**
 * Get features with highest AI cost.
 */
export function getHighestAICostFeatures(capabilitiesWithMetrics, limit = 5) {
  return [...capabilitiesWithMetrics]
    .filter(c => c.aiComputeRequired)
    .sort((a, b) => (b.estimatedAICost || b.estimatedComputeCost * b.monthlyUsage) - (a.estimatedAICost || a.estimatedComputeCost * a.monthlyUsage))
    .slice(0, limit);
}

/**
 * Get features with highest conversion influence.
 */
export function getHighestConversionFeatures(capabilitiesWithMetrics, limit = 5) {
  return [...capabilitiesWithMetrics]
    .sort((a, b) => b.conversionImpact - a.conversionImpact || b.monthlyUsage - a.monthlyUsage)
    .slice(0, limit);
}
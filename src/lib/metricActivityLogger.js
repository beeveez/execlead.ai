/**
 * Metric Activity Logger™
 *
 * Logs every metric interaction to Platform Activity Center™.
 * Events: metric_viewed, metric_opened, metric_task_created,
 *         metric_task_completed, metric_score_changed, metric_target_reached
 *
 * Silent-fail — logging never breaks the user experience.
 */

import { base44 } from '@/api/base44Client';

let seq = 0;

function genId() {
  seq = (seq + 1) % 100000;
  return `METRIC-${Date.now()}-${seq.toString(36)}`;
}

export async function logMetricInteraction(action, metricDef, metadata = {}) {
  if (!metricDef?.id) return;
  try {
    await base44.entities.PlatformActivity.create({
      activity_id: genId(),
      category: 'analytics',
      subcategory: 'metric_intelligence',
      action: `metric_${action}`,
      module: 'metric_intelligence',
      workspace: metricDef.workspace || metricDef.category || 'platform',
      target_entity: 'Metric',
      target_entity_id: metricDef.id,
      performed_by_name: metadata.userName || null,
      description: `${action.replace(/_/g, ' ')}: ${metricDef.name}`,
      tags: ['metric-intelligence', metricDef.workspace || metricDef.category, metricDef.id],
      metadata_json: JSON.stringify({
        metricId: metricDef.id,
        metricName: metricDef.name,
        workspace: metricDef.workspace || metricDef.category,
        ...metadata,
      }),
    });
  } catch {
    // Silent fail
  }
}

export async function logMetricViewed(metricDef) {
  return logMetricInteraction('viewed', metricDef);
}

export async function logMetricOpened(metricDef, score) {
  return logMetricInteraction('opened', metricDef, { score });
}

export async function logMetricTaskCreated(metricDef, action) {
  return logMetricInteraction('task_created', metricDef, { action: action.action, priority: action.priority });
}

export async function logMetricScoreChanged(metricDef, oldScore, newScore) {
  return logMetricInteraction('score_changed', metricDef, { oldScore, newScore });
}

export async function logMetricTargetReached(metricDef, score) {
  return logMetricInteraction('target_reached', metricDef, { score });
}

/**
 * Guardian™ Validation Event Logger
 *
 * Publishes validation lifecycle events to the Platform Activity Center™.
 * Events: validation_started, validation_completed, validation_failed,
 *         validation_passed, validation_warning, issue_detected,
 *         issue_resolved, guardian_score_changed, deployment_ready,
 *         deployment_blocked
 *
 * Silent-fail — logging never breaks the user experience.
 */
export async function logGuardianValidationEvent(eventType, metadata = {}) {
  try {
    await base44.entities.PlatformActivity.create({
      activity_id: genId(),
      category: 'governance',
      subcategory: 'guardian_validation',
      action: `guardian_${eventType}`,
      module: 'guardian_validation',
      workspace: 'platform',
      target_entity: 'GuardianValidation',
      description: eventType.replace(/_/g, ' '),
      tags: ['guardian', 'validation', eventType],
      metadata_json: JSON.stringify({ eventType, ...metadata }),
    });
  } catch {
    // Silent fail
  }
}

/**
 * Publish a batch of Guardian validation events based on current state.
 * Called when the Guardian drawer is opened — logs validation viewed,
 * issue detected (per failed rule), and deployment status.
 */
export async function publishGuardianEvents(metric) {
  if (!metric?.isGuardian) return;
  try {
    await logGuardianValidationEvent('validation_viewed', {
      score: metric.current,
      projectedScore: metric.estimatedFutureScore,
    });

    // Log issue_detected for each failed rule
    for (const rc of metric.rootCauses) {
      await logGuardianValidationEvent('issue_detected', {
        ruleId: rc.ruleId,
        rule: rc.rule,
        severity: rc.severity,
        contribution: rc.contribution,
      });
    }

    // Log deployment status
    if (metric.deploymentReadiness?.status === 'not_ready') {
      await logGuardianValidationEvent('deployment_blocked', {
        blockers: metric.deploymentReadiness.criticalBlockers.length,
      });
    } else if (metric.deploymentReadiness?.status === 'ready') {
      await logGuardianValidationEvent('deployment_ready', {
        score: metric.current,
      });
    }

    // Log score change if trend != 0
    if (metric.trend !== 0) {
      await logGuardianValidationEvent('guardian_score_changed', {
        previousScore: metric.previous,
        newScore: metric.current,
        trend: metric.trend,
      });
    }
  } catch {
    // Silent fail
  }
}

/**
 * Query metric analytics from Platform Activity Center.
 */
export async function getMetricAnalytics(base44Client, limit = 500) {
  try {
    const events = await base44Client.entities.PlatformActivity.filter(
      { category: 'analytics', subcategory: 'metric_intelligence' },
      '-created_date',
      limit
    );

    if (!events || events.length === 0) {
      return { totalInteractions: 0, byAction: {}, byMetric: {}, mostClicked: [], mostCommonActions: [] };
    }

    const byAction = {};
    const byMetric = {};

    for (const ev of events) {
      const action = ev.action || 'unknown';
      byAction[action] = (byAction[action] || 0) + 1;

      let metricId = ev.target_entity_id;
      let metricName = metricId;
      try {
        const meta = JSON.parse(ev.metadata_json || '{}');
        metricName = meta.metricName || metricId;
      } catch {}

      if (!byMetric[metricId]) byMetric[metricId] = { name: metricName, clicks: 0, tasksCreated: 0 };
      byMetric[metricId].clicks++;
      if (action === 'metric_task_created') byMetric[metricId].tasksCreated++;
    }

    const mostClicked = Object.entries(byMetric)
      .map(([id, data]) => ({ id, name: data.name, clicks: data.clicks, tasksCreated: data.tasksCreated }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 10);

    const mostCommonActions = Object.entries(byAction)
      .map(([action, count]) => ({ action, count }))
      .sort((a, b) => b.count - a.count);

    return {
      totalInteractions: events.length,
      byAction,
      byMetric,
      mostClicked,
      mostCommonActions,
    };
  } catch {
    return { totalInteractions: 0, byAction: {}, byMetric: {}, mostClicked: [], mostCommonActions: [] };
  }
}
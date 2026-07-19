/**
 * Rollout Readiness Score™ Engine
 *
 * The executive decision engine that determines whether EXECLEAD.AI
 * is operationally ready to expand from one beta rollout phase to the next.
 *
 * Architecture:
 *   Rollout Engine™ → Platform Metrics → Guardian™ → Platform Health™ →
 *   Capacity Monitoring → Expansion Gates → Rollout Readiness Score™ →
 *   Executive Decision → Advance RC Phase or Pause Expansion
 *
 * No duplicate calculations — consumes live metrics from foundingRolloutEngine.
 */

import { base44 } from '@/api/base44Client';
import {
  computeCapacityMetrics, checkExpansionGate, getCurrentPhase, getNextPhase,
  ROLLOUT_PHASES,
} from './foundingRolloutEngine';

// ═══════════════════════════════════════════════════════════
// CONFIGURABLE WEIGHTS (total 100%)
// ═══════════════════════════════════════════════════════════

export const DEFAULT_WEIGHTS = {
  guardianValidation: 25,
  platformHealth: 20,
  criticalIncidents: 20,
  knowledgeSync: 10,
  aiCapacity: 10,
  errorRate: 5,
  responseTime: 5,
  activeUserStability: 5,
};

const STORAGE_KEY = 'execlead_rollout_readiness_weights';

export function getWeights() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...DEFAULT_WEIGHTS, ...JSON.parse(stored) };
  } catch {}
  return DEFAULT_WEIGHTS;
}

export function setWeights(weights) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(weights));
  } catch {}
}

// ═══════════════════════════════════════════════════════════
// READINESS STATES
// ═══════════════════════════════════════════════════════════

export const READINESS_STATES = [
  { id: 'ready', label: 'Ready', min: 95, max: 100, color: 'emerald', description: 'Platform may safely expand.' },
  { id: 'nearly_ready', label: 'Nearly Ready', min: 85, max: 94, color: 'amber', description: 'Minor improvements recommended before expansion.' },
  { id: 'blocked', label: 'Expansion Blocked', min: 70, max: 84, color: 'orange', description: 'Platform requires corrective action.' },
  { id: 'critical', label: 'Critical', min: 0, max: 69, color: 'red', description: 'Expansion prohibited until issues are resolved.' },
];

export function getReadinessState(score) {
  return READINESS_STATES.find(s => score >= s.min && score <= s.max) || READINESS_STATES[3];
}

// ═══════════════════════════════════════════════════════════
// SIGNAL DEFINITIONS — maps metrics to weighted signals
// ═══════════════════════════════════════════════════════════

const SIGNAL_CONFIG = {
  guardianValidation: {
    name: 'Guardian™ Validation',
    category: 'Platform Health',
    targetDisplay: '≥95%',
    relatedMetric: 'guardian_validation',
    computeRatio: (m) => Math.min(1, (m.guardianValidation || 0) / 100),
    evidence: (m) => `Guardian validation score is ${m.guardianValidation}%, threshold is 95%`,
    target: 95,
  },
  platformHealth: {
    name: 'Platform Health™',
    category: 'Platform Health',
    targetDisplay: '≥95%',
    relatedMetric: 'platform_health',
    computeRatio: (m) => Math.min(1, (m.platformHealth || 0) / 100),
    evidence: (m) => `Platform health is ${m.platformHealth}%, threshold is 95%`,
    target: 95,
  },
  criticalIncidents: {
    name: 'Critical Incident Status',
    category: 'Security',
    targetDisplay: '0 incidents',
    relatedMetric: 'security_incidents',
    computeRatio: (m) => m.criticalIncidents === 0 ? 1 : Math.max(0, 1 - m.criticalIncidents * 0.3),
    evidence: (m) => `${m.criticalIncidents} critical incident(s) open, target is 0`,
    target: 0,
  },
  knowledgeSync: {
    name: 'Knowledge Synchronization',
    category: 'Platform Health',
    targetDisplay: 'Healthy',
    relatedMetric: 'knowledge_sync',
    computeRatio: (m) => m.knowledgeSyncHealthy ? 1 : 0,
    evidence: (m) => `Knowledge synchronization is ${m.knowledgeSyncHealthy ? 'healthy' : 'unhealthy'}`,
    target: 1,
  },
  aiCapacity: {
    name: 'AI Capacity',
    category: 'AI Performance',
    targetDisplay: '≥90% success, within credits',
    relatedMetric: 'ai_capacity',
    computeRatio: (m) => {
      const successRatio = Math.min(1, (m.aiSuccessRate || 0) / 100);
      const creditsRatio = m.aiCreditsWithinCapacity ? 1 : 0.4;
      return successRatio * creditsRatio;
    },
    evidence: (m) => `AI success rate ${m.aiSuccessRate}%, credits ${m.aiCreditsWithinCapacity ? 'within' : 'exceeding'} capacity`,
    target: 90,
  },
  errorRate: {
    name: 'Error Rate',
    category: 'Performance',
    targetDisplay: '<10%',
    relatedMetric: 'error_rate',
    computeRatio: (m) => Math.max(0, 1 - (m.errorRate || 0) / 20),
    evidence: (m) => `Error rate is ${m.errorRate}%, target is below 10%`,
    target: 10,
  },
  responseTime: {
    name: 'Average Response Time',
    category: 'Performance',
    targetDisplay: '<3000ms',
    relatedMetric: 'response_time',
    computeRatio: (m) => {
      if (!m.avgResponseTimeMs || m.avgResponseTimeMs === 0) return 1;
      return Math.min(1, 3000 / m.avgResponseTimeMs);
    },
    evidence: (m) => `Average response time is ${m.avgResponseTimeMs}ms, target is below 3000ms`,
    target: 3000,
  },
  activeUserStability: {
    name: 'Active User Stability',
    category: 'Engagement',
    targetDisplay: 'High activity ratio',
    relatedMetric: 'user_stability',
    computeRatio: (m) => {
      if (!m.registeredMembers || m.registeredMembers === 0) return 1;
      return Math.min(1, m.activeMembers / m.registeredMembers);
    },
    evidence: (m) => `${m.activeMembers} of ${m.registeredMembers} members active (${m.registeredMembers > 0 ? Math.round(m.activeMembers / m.registeredMembers * 100) : 100}%)`,
    target: 1,
  },
};

// ═══════════════════════════════════════════════════════════
// CORE SCORE COMPUTATION — deterministic, explainable
// ═══════════════════════════════════════════════════════════

export function computeReadinessScore(metrics, weights = getWeights()) {
  const signals = Object.keys(SIGNAL_CONFIG).map((id) => {
    const config = SIGNAL_CONFIG[id];
    const weight = weights[id] || 0;
    const ratio = config.computeRatio(metrics);
    const contribution = +(weight * ratio).toFixed(2);
    const impact = +(weight - contribution).toFixed(2);
    const status = ratio >= 0.95 ? 'met' : ratio >= 0.70 ? 'warning' : 'blocked';

    return {
      id,
      name: config.name,
      category: config.category,
      currentValue: config.target === 1 ? (ratio >= 0.95 ? 'Yes' : 'No') : metrics[id] ?? config.computeRatio(metrics),
      displayValue: getDisplayValue(id, metrics),
      targetValue: config.targetDisplay,
      weight,
      ratio: +(ratio * 100).toFixed(1),
      contribution,
      impact,
      status,
      evidence: config.evidence(metrics),
      relatedMetric: config.relatedMetric,
    };
  });

  const score = Math.round(signals.reduce((sum, s) => sum + s.contribution, 0));
  const state = getReadinessState(score);
  const metCount = signals.filter(s => s.status === 'met').length;
  const blockedSignals = signals.filter(s => s.status !== 'met');

  return {
    score,
    maxScore: 100,
    state,
    signals,
    metCount,
    totalCount: signals.length,
    blockedSignals,
    confidence: score >= 95 ? 'High' : score >= 85 ? 'Medium' : 'Low',
    canExpand: score >= 95,
  };
}

function getDisplayValue(id, metrics) {
  switch (id) {
    case 'guardianValidation': return `${metrics.guardianValidation}%`;
    case 'platformHealth': return `${metrics.platformHealth}%`;
    case 'criticalIncidents': return `${metrics.criticalIncidents} open`;
    case 'knowledgeSync': return metrics.knowledgeSyncHealthy ? 'Healthy' : 'Unhealthy';
    case 'aiCapacity': return `${metrics.aiSuccessRate}% success`;
    case 'errorRate': return `${metrics.errorRate}%`;
    case 'responseTime': return `${metrics.avgResponseTimeMs}ms`;
    case 'activeUserStability': return `${metrics.registeredMembers > 0 ? Math.round(metrics.activeMembers / metrics.registeredMembers * 100) : 100}% active`;
    default: return '—';
  }
}

// ═══════════════════════════════════════════════════════════
// RECOMMENDATIONS — dynamically generated from blocked signals
// ═══════════════════════════════════════════════════════════

const RECOMMENDATION_MAP = {
  guardianValidation: {
    action: 'Resolve Critical Validation Failures',
    owner: 'Developer',
    effort: '2–4 hours',
    dependencies: ['Guardian Validation Panel'],
  },
  platformHealth: {
    action: 'Run Platform Self-Healing',
    owner: 'Developer',
    effort: '4–8 hours',
    dependencies: ['Self-Healing Engine'],
  },
  criticalIncidents: {
    action: 'Resolve Platform Incidents',
    owner: 'Security Admin',
    effort: '1–4 hours',
    dependencies: ['Security Intelligence Center'],
  },
  knowledgeSync: {
    action: 'Run Knowledge Synchronization',
    owner: 'Developer',
    effort: '5–15 minutes',
    dependencies: ['EXEC Knowledge Sync'],
  },
  aiCapacity: {
    action: 'Reduce AI Capacity Utilization',
    owner: 'Developer',
    effort: '2–4 hours',
    dependencies: ['AI Command Center', 'Model Router'],
  },
  errorRate: {
    action: 'Investigate Error Sources',
    owner: 'Developer',
    effort: '1–2 hours',
    dependencies: ['Diagnostics'],
  },
  responseTime: {
    action: 'Optimize Response Times',
    owner: 'Developer',
    effort: '2–4 hours',
    dependencies: ['Performance Dashboard'],
  },
  activeUserStability: {
    action: 'Engage Inactive Members',
    owner: 'Operations',
    effort: '1–2 days',
    dependencies: ['Community'],
  },
};

export function generateRecommendations(readiness) {
  return readiness.blockedSignals
    .map((signal) => {
      const rec = RECOMMENDATION_MAP[signal.id];
      if (!rec) return null;
      return {
        signalId: signal.id,
        action: rec.action,
        priority: signal.status === 'blocked' ? 'critical' : 'high',
        owner: rec.owner,
        effort: rec.effort,
        expectedImprovement: `+${Math.round(signal.impact)}%`,
        dependencies: rec.dependencies,
      };
    })
    .filter(Boolean)
    .sort((a, b) => parseInt(b.expectedImprovement) - parseInt(a.expectedImprovement));
}

// ═══════════════════════════════════════════════════════════
// AI INSIGHT™ — deterministic executive narrative from live metrics
// ═══════════════════════════════════════════════════════════

export function generateDeterministicInsight(readiness, nextPhaseName) {
  const { score, state, blockedSignals } = readiness;

  if (state.id === 'ready') {
    return `The platform is ready to expand. Rollout Readiness is ${score}/100 with ${readiness.confidence} confidence. All critical signals are meeting their thresholds. EXECLEAD.AI can safely progress to ${nextPhaseName || 'the next rollout phase'}.`;
  }

  const reasons = blockedSignals
    .slice(0, 4)
    .map(s => s.evidence)
    .join('. ');

  const potentialGain = blockedSignals.reduce((sum, s) => sum + s.impact, 0);
  const projectedScore = Math.min(100, Math.round(score + potentialGain));

  if (state.id === 'nearly_ready') {
    return `The platform is nearly ready to expand. Rollout Readiness is ${score}/100. ${reasons}. Addressing these minor issues is expected to increase readiness to ${projectedScore}/100, enabling safe progression to ${nextPhaseName || 'the next phase'}.`;
  }

  if (state.id === 'blocked') {
    return `The platform is not currently ready to expand because ${reasons}. Rollout Readiness is ${score}/100. Corrective action is required before expansion can proceed. Resolving these issues is expected to increase readiness to ${projectedScore}/100.`;
  }

  return `Expansion is prohibited. Rollout Readiness is critically low at ${score}/100. ${reasons}. Immediate corrective action is required before any expansion can be considered.`;
}

export async function generateAIInsight(readiness, nextPhaseName) {
  try {
    const deterministic = generateDeterministicInsight(readiness, nextPhaseName);
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an executive briefing AI for EXECLEAD.AI's Rollout Readiness Score™. Based on the following live platform data, write a concise 2-3 sentence executive insight explaining the readiness status. Do not hallucinate — use only the provided data.\n\nScore: ${readiness.score}/100\nState: ${readiness.state.label}\nConfidence: ${readiness.confidence}\nNext Phase: ${nextPhaseName || 'N/A'}\nBlocked Signals:\n${readiness.blockedSignals.map(s => `- ${s.name}: ${s.evidence}`).join('\n')}\n\nDeterministic reference (do not copy, write your own):\n${deterministic}`,
      response_json_schema: {
        type: 'object',
        properties: {
          insight: { type: 'string' },
        },
      },
    });
    return response.insight || deterministic;
  } catch {
    return generateDeterministicInsight(readiness, nextPhaseName);
  }
}

// ═══════════════════════════════════════════════════════════
// READINESS SNAPSHOT — combines everything for the dashboard
// ═══════════════════════════════════════════════════════════

export async function getReadinessSnapshot(base44Client, weights = getWeights()) {
  const metrics = await computeCapacityMetrics(base44Client);
  const readiness = computeReadinessScore(metrics, weights);
  const recommendations = generateRecommendations(readiness);

  const currentPhase = getCurrentPhase(metrics.registeredMembers);
  const nextPhase = getNextPhase(currentPhase.id);
  const gate = checkExpansionGate(metrics);

  const canExpand = readiness.score >= 95 && gate.blockers.length === 0;

  const insight = generateDeterministicInsight(readiness, nextPhase?.shortName);

  const limit = currentPhase.invitationLimit;
  const slotsRemaining = limit ? Math.max(0, limit.max - metrics.registeredMembers) : null;

  return {
    metrics,
    readiness,
    recommendations,
    insight,
    currentPhase,
    nextPhase,
    gate,
    canExpand,
    expansionPaused: !canExpand,
    memberCount: metrics.registeredMembers,
    slotsUsed: metrics.registeredMembers,
    slotsRemaining,
    invitationLimit: limit,
    projectedExpansion: canExpand
      ? 'Available Immediately'
      : gate.blockers.length > 0
        ? gate.blockers[0].estimatedRecovery
        : 'Pending corrective action',
  };
}

// ═══════════════════════════════════════════════════════════
// PLATFORM ACTIVITY CENTER™ — event logging
// ═══════════════════════════════════════════════════════════

let seq = 0;
function genId() {
  seq = (seq + 1) % 100000;
  return `READINESS-${Date.now()}-${seq.toString(36)}`;
}

export async function logReadinessEvent(eventType, data = {}) {
  try {
    await base44.entities.PlatformActivity.create({
      activity_id: genId(),
      category: 'operations',
      subcategory: 'rollout_readiness',
      action: `readiness_${eventType}`,
      module: 'rollout_readiness',
      workspace: 'operations',
      target_entity: 'RolloutReadiness',
      description: eventType.replace(/_/g, ' '),
      tags: ['rollout-readiness', eventType],
      metadata_json: JSON.stringify({ eventType, ...data }),
    });
  } catch {
    // silent fail
  }
}

export async function checkAndLogReadinessChanges(snapshot, prevSnapshot) {
  if (!prevSnapshot) {
    await logReadinessEvent('score_computed', {
      score: snapshot.readiness.score,
      state: snapshot.readiness.state.id,
    });
    return;
  }

  const prevScore = prevSnapshot.readiness.score;
  const currScore = snapshot.readiness.score;

  if (currScore !== prevScore) {
    await logReadinessEvent('score_changed', { oldScore: prevScore, newScore: currScore });
  }

  if (snapshot.readiness.state.id !== prevSnapshot.readiness.state.id) {
    await logReadinessEvent('state_changed', {
      oldState: prevSnapshot.readiness.state.id,
      newState: snapshot.readiness.state.id,
    });
  }

  const wasReady = prevScore >= 95;
  const isReady = currScore >= 95;
  if (!wasReady && isReady) await logReadinessEvent('threshold_exceeded', { score: currScore });
  if (wasReady && !isReady) await logReadinessEvent('threshold_fallen_below', { score: currScore });

  const prevBlocked = prevSnapshot.gate.blockers.length;
  const currBlocked = snapshot.gate.blockers.length;
  if (prevBlocked === 0 && currBlocked > 0) {
    await logReadinessEvent('blocking_issue_detected', { count: currBlocked });
  }
  if (prevBlocked > 0 && currBlocked === 0) {
    await logReadinessEvent('blocking_issue_resolved', {});
  }

  if (!prevSnapshot.canExpand && snapshot.canExpand) {
    await logReadinessEvent('expansion_available', { score: currScore });
  }
  if (prevSnapshot.canExpand && !snapshot.canExpand) {
    await logReadinessEvent('expansion_blocked', { score: currScore });
  }
}

// ═══════════════════════════════════════════════════════════
// HISTORICAL ANALYTICS — from Platform Activity Center
// ═══════════════════════════════════════════════════════════

export async function getReadinessAnalytics(base44Client, limit = 500) {
  try {
    const events = await base44Client.entities.PlatformActivity.filter(
      { category: 'operations', subcategory: 'rollout_readiness' },
      '-created_date',
      limit
    );

    if (!events || events.length === 0) {
      return { highest: 0, lowest: 0, average: 0, totalEvents: 0, scores: [], timeBlocked: '—', timeReady: '—' };
    }

    const scoreEvents = events.filter(e =>
      e.action === 'readiness_score_changed' || e.action === 'readiness_score_computed'
    );

    const scores = scoreEvents.map(e => {
      try {
        const meta = JSON.parse(e.metadata_json || '{}');
        return { score: meta.newScore || meta.score || 0, date: e.created_date, state: meta.state };
      } catch {
        return null;
      }
    }).filter(Boolean);

    if (scores.length === 0) {
      return { highest: 0, lowest: 0, average: 0, totalEvents: events.length, scores: [], timeBlocked: '—', timeReady: '—' };
    }

    const scoreValues = scores.map(s => s.score);
    const highest = Math.max(...scoreValues);
    const lowest = Math.min(...scoreValues);
    const average = Math.round(scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length);

    const blockedCount = scores.filter(s => s.score < 70).length;
    const readyCount = scores.filter(s => s.score >= 95).length;
    const blockedPct = Math.round((blockedCount / scores.length) * 100);
    const readyPct = Math.round((readyCount / scores.length) * 100);

    return {
      highest,
      lowest,
      average,
      totalEvents: events.length,
      scores,
      timeBlocked: `${blockedPct}% of readings`,
      timeReady: `${readyPct}% of readings`,
    };
  } catch {
    return { highest: 0, lowest: 0, average: 0, totalEvents: 0, scores: [], timeBlocked: '—', timeReady: '—' };
  }
}

// ═══════════════════════════════════════════════════════════
// RELATED METRICS — links to existing platform intelligence
// ═══════════════════════════════════════════════════════════

export const RELATED_METRICS = [
  { id: 'guardian_validation', name: 'Guardian™ Validation', path: '/guardian', workspace: 'platform' },
  { id: 'platform_health', name: 'Platform Health™', path: '/developer/stability', workspace: 'developer' },
  { id: 'knowledge_sync', name: 'Knowledge Synchronization™', path: '/developer/knowledge-sync', workspace: 'developer' },
  { id: 'ai_capacity', name: 'AI Capacity', path: '/ai-command-center', workspace: 'platform' },
  { id: 'operations_health', name: 'Operations Health™', path: '/operations', workspace: 'operations' },
  { id: 'platform_activity', name: 'Platform Activity™', path: '/platform/activity', workspace: 'platform' },
  { id: 'executive_intelligence', name: 'Executive Intelligence™', path: '/intelligence', workspace: 'platform' },
  { id: 'launch_readiness', name: 'Launch Readiness™', path: '/developer/launch-readiness', workspace: 'developer' },
];
/**
 * Founding Member Rollout Engine™
 *
 * Controlled, phased Founding Member rollout strategy aligned with
 * platform maturity, infrastructure capacity, and operational readiness.
 *
 * Expansion is driven by measurable platform readiness — not arbitrary targets.
 */

import { computeGuardianScore } from './guardianValidationEngine';

// ═══════════════════════════════════════════════════════════
// ROLLOUT PHASES
// ═══════════════════════════════════════════════════════════

export const ROLLOUT_PHASES = [
  {
    id: 'rc1',
    name: 'RC1 — Founding Private Beta',
    shortName: 'RC1',
    status: 'current',
    invitationLimit: { min: 35, max: 50 },
    objectives: [
      'Validate core platform',
      'Improve Executive AI',
      'Identify UX improvements',
      'Monitor AI consumption',
      'Improve platform stability',
      'Collect testimonials',
      'Build executive case studies',
    ],
    progressionRequirements: [
      { id: 'guardian', label: 'Guardian™ Validation ≥ 95%', metric: 'guardianValidation', threshold: 95 },
      { id: 'platform_health', label: 'Platform Health ≥ 95%', metric: 'platformHealth', threshold: 95 },
      { id: 'no_critical', label: 'No Critical Incidents', metric: 'criticalIncidents', threshold: 0 },
      { id: 'ai_quality', label: 'AI Quality Verified', metric: 'aiSuccessRate', threshold: 90 },
      { id: 'knowledge_sync', label: 'Stable Knowledge Synchronization', metric: 'knowledgeSyncHealthy', threshold: true },
      { id: 'beta_feedback', label: 'Positive Beta Feedback', metric: 'betaFeedbackPositive', threshold: true },
    ],
  },
  {
    id: 'rc2',
    name: 'RC2 — Expanded Private Beta',
    shortName: 'RC2',
    invitationLimit: { max: 100 },
    objectives: [
      'Validate scalability',
      'Increase platform usage',
      'Test concurrent activity',
      'Expand executive community',
      'Optimize AI performance',
    ],
    progressionRequirements: [
      { id: 'stable_usage', label: 'Platform stable under increased usage', metric: 'platformHealth', threshold: 95 },
      { id: 'ai_credits', label: 'AI credits within monthly capacity', metric: 'aiCreditsWithinCapacity', threshold: true },
      { id: 'infra', label: 'Infrastructure operating normally', metric: 'infrastructureHealthy', threshold: true },
      { id: 'activity_center', label: 'Platform Activity Center healthy', metric: 'activityCenterHealthy', threshold: true },
      { id: 'readiness_engine', label: 'Executive Readiness Engine stable', metric: 'readinessEngineStable', threshold: true },
      { id: 'journey', label: 'Leadership Journey functioning correctly', metric: 'journeyStable', threshold: true },
    ],
  },
  {
    id: 'rc3',
    name: 'RC3 — Early Access',
    shortName: 'RC3',
    invitationLimit: { max: 150 },
    objectives: [
      'Validate commercial readiness',
      'Increase executive engagement',
      'Expand community',
      'Prepare pricing launch',
    ],
    progressionRequirements: [
      { id: 'consistent', label: 'Platform operating consistently', metric: 'platformHealth', threshold: 95 },
      { id: 'ai_stable', label: 'AI services stable', metric: 'aiSuccessRate', threshold: 92 },
      { id: 'intelligence_mature', label: 'Executive Intelligence mature', metric: 'intelligenceMature', threshold: true },
      { id: 'monitoring', label: 'Monitoring dashboards healthy', metric: 'monitoringHealthy', threshold: true },
      { id: 'ops', label: 'Operational processes established', metric: 'opsEstablished', threshold: true },
    ],
  },
  {
    id: 'open_beta',
    name: 'Open Beta — Public Waitlist',
    shortName: 'Open Beta',
    invitationLimit: { max: 250 },
    objectives: [
      'Public waitlist',
      'Broad platform validation',
      'Marketing expansion',
      'Community growth',
    ],
    progressionRequirements: [
      { id: 'proven', label: 'Platform proven stable', metric: 'platformHealth', threshold: 97 },
      { id: 'ai_verified', label: 'AI infrastructure verified', metric: 'aiSuccessRate', threshold: 95 },
      { id: 'performance', label: 'Performance validated', metric: 'avgResponseTimeMs', threshold: 2000 },
      { id: 'support', label: 'Support workflows established', metric: 'supportWorkflowsReady', threshold: true },
      { id: 'commercial', label: 'Commercial operations ready', metric: 'commercialReady', threshold: true },
    ],
  },
  {
    id: 'ga',
    name: 'General Availability',
    shortName: 'GA',
    invitationLimit: null,
    objectives: [
      'Public launch',
      'Commercial plans',
      'Free · Professional · Executive · Enterprise',
      'Founding Benefits locked',
    ],
    progressionRequirements: null,
  },
];

export function getCurrentPhase(memberCount) {
  if (memberCount >= 250) return ROLLOUT_PHASES[4];
  if (memberCount >= 150) return ROLLOUT_PHASES[3];
  if (memberCount >= 100) return ROLLOUT_PHASES[2];
  if (memberCount >= 50) return ROLLOUT_PHASES[1];
  return ROLLOUT_PHASES[0];
}

export function getNextPhase(currentPhaseId) {
  const idx = ROLLOUT_PHASES.findIndex(p => p.id === currentPhaseId);
  if (idx < 0 || idx >= ROLLOUT_PHASES.length - 1) return null;
  return ROLLOUT_PHASES[idx + 1];
}

// ═══════════════════════════════════════════════════════════
// CAPACITY METRICS COMPUTATION
// ═══════════════════════════════════════════════════════════

export async function computeCapacityMetrics(base44) {
  const metrics = {
    registeredMembers: 0,
    activeMembers: 0,
    dailyActiveUsers: 0,
    weeklyActiveUsers: 0,
    monthlyActiveUsers: 0,
    concurrentSessions: 0,
    aiRequests: 0,
    aiCreditsUsed: 0,
    integrationCreditsUsed: 0,
    guardianValidation: 0,
    platformHealth: 0,
    knowledgeSyncHealthy: true,
    errorRate: 0,
    avgResponseTimeMs: 0,
    databasePerformance: 100,
    automationQueueSize: 0,
    criticalIncidents: 0,
    aiSuccessRate: 100,
    aiCreditsWithinCapacity: true,
    infrastructureHealthy: true,
    activityCenterHealthy: true,
    readinessEngineStable: true,
    journeyStable: true,
    intelligenceMature: false,
    monitoringHealthy: true,
    opsEstablished: false,
    supportWorkflowsReady: false,
    commercialReady: false,
    betaFeedbackPositive: true,
  };

  try {
    // Founding members
    const foundingMembers = await base44.entities.FoundingMember.filter({ status: 'active' }).catch(() => []);
    metrics.registeredMembers = foundingMembers?.length || 0;
    metrics.activeMembers = foundingMembers?.filter(m => m.health_status !== 'inactive')?.length || 0;

    // Guardian validation score (deterministic)
    const guardianScore = computeGuardianScore();
    metrics.guardianValidation = guardianScore.score;

    // Governance certificate for platform health
    const certs = await base44.entities.GovernanceCertificate.list('-created_date', 1).catch(() => []);
    const cert = certs?.[0];
    if (cert) {
      metrics.platformHealth = cert.overall_governance_score || 0;
      metrics.knowledgeSyncHealthy = (cert.synchronization_health || 0) >= 90;
    }

    // Security incidents
    const openIncidents = await base44.entities.SecurityIncident.filter({
      status: { $in: ['open', 'investigating'] }
    }).catch(() => []);
    metrics.criticalIncidents = openIncidents?.filter(i => i.severity === 'critical')?.length || 0;

    // Usage logs for AI metrics
    const recentLogs = await base44.entities.UsageLog.list('-created_date', 200).catch(() => []);
    if (recentLogs && recentLogs.length > 0) {
      const successCount = recentLogs.filter(l => l.status === 'success').length;
      metrics.aiSuccessRate = Math.round((successCount / recentLogs.length) * 100);
      metrics.aiRequests = recentLogs.length;
      metrics.errorRate = 100 - metrics.aiSuccessRate;
      metrics.avgResponseTimeMs = Math.round(
        recentLogs.reduce((s, l) => s + (l.response_time_ms || 0), 0) / recentLogs.length
      );

      // AI credits approximation
      const aiCostLogs = recentLogs.filter(l => l.cost_estimated);
      metrics.aiCreditsUsed = aiCostLogs.reduce((s, l) => s + (l.cost_estimated || 0), 0);

      // DAU/WAU/MAU approximation from unique users
      const now = Date.now();
      const dayAgo = now - 86400000;
      const weekAgo = now - 7 * 86400000;
      const monthAgo = now - 30 * 86400000;
      const uniqueDay = new Set();
      const uniqueWeek = new Set();
      const uniqueMonth = new Set();
      for (const log of recentLogs) {
        const ts = new Date(log.created_date).getTime();
        const uid = log.created_by_id;
        if (ts > monthAgo && uid) uniqueMonth.add(uid);
        if (ts > weekAgo && uid) uniqueWeek.add(uid);
        if (ts > dayAgo && uid) uniqueDay.add(uid);
      }
      metrics.dailyActiveUsers = uniqueDay.size;
      metrics.weeklyActiveUsers = uniqueWeek.size;
      metrics.monthlyActiveUsers = uniqueMonth.size;
    }

    // Platform activities for automation queue
    const recentActivities = await base44.entities.PlatformActivity.filter({
      status: 'pending'
    }).catch(() => []);
    metrics.automationQueueSize = recentActivities?.length || 0;
    metrics.activityCenterHealthy = metrics.automationQueueSize < 50;

    // AI credits capacity check (Builder Plan approximation)
    metrics.aiCreditsWithinCapacity = metrics.aiCreditsUsed < 800;
    metrics.infrastructureHealthy = metrics.avgResponseTimeMs < 3000;
    metrics.intelligenceMature = metrics.guardianValidation >= 90;
  } catch {
    // Graceful degradation — return defaults
  }

  return metrics;
}

// ═══════════════════════════════════════════════════════════
// EXPANSION GATE — checks if advancement to next phase is blocked
// ═══════════════════════════════════════════════════════════

export function checkExpansionGate(metrics) {
  const blockers = [];

  if (metrics.guardianValidation < 95) {
    blockers.push({
      reason: 'Guardian™ Validation below 95%',
      owner: 'Developer',
      recommendation: 'Resolve failed validation rules to improve Guardian score',
      estimatedRecovery: '2–4 hours',
      currentValue: `${metrics.guardianValidation}%`,
      targetValue: '≥95%',
    });
  }

  if (metrics.platformHealth < 95) {
    blockers.push({
      reason: 'Platform Health below 95%',
      owner: 'Developer',
      recommendation: 'Address platform health findings and run self-healing',
      estimatedRecovery: '4–8 hours',
      currentValue: `${metrics.platformHealth}%`,
      targetValue: '≥95%',
    });
  }

  if (metrics.criticalIncidents > 0) {
    blockers.push({
      reason: `${metrics.criticalIncidents} critical platform incident(s) open`,
      owner: 'Security Admin',
      recommendation: 'Resolve all critical security incidents before expanding',
      estimatedRecovery: '1–4 hours',
      currentValue: `${metrics.criticalIncidents} open`,
      targetValue: '0 open',
    });
  }

  if (!metrics.knowledgeSyncHealthy) {
    blockers.push({
      reason: 'Knowledge Synchronization unhealthy',
      owner: 'Developer',
      recommendation: 'Run EXEC™ Knowledge Synchronization',
      estimatedRecovery: '5–15 minutes',
      currentValue: 'Unhealthy',
      targetValue: 'Healthy',
    });
  }

  if (metrics.aiSuccessRate < 90) {
    blockers.push({
      reason: 'AI response quality degraded',
      owner: 'Developer',
      recommendation: 'Investigate failing AI calls and optimize model routing',
      estimatedRecovery: '2–4 hours',
      currentValue: `${metrics.aiSuccessRate}% success`,
      targetValue: '≥90% success',
    });
  }

  if (!metrics.aiCreditsWithinCapacity) {
    blockers.push({
      reason: 'Monthly AI credits exceed safe threshold',
      owner: 'Developer',
      recommendation: 'Reduce AI consumption or upgrade plan before expanding',
      estimatedRecovery: 'Immediate',
      currentValue: `${metrics.aiCreditsUsed} credits`,
      targetValue: '< 800 credits',
    });
  }

  if (!metrics.infrastructureHealthy) {
    blockers.push({
      reason: 'Infrastructure utilization exceeds safe operating limits',
      owner: 'Developer',
      recommendation: 'Optimize performance or scale infrastructure',
      estimatedRecovery: '4–8 hours',
      currentValue: `${metrics.avgResponseTimeMs}ms avg response`,
      targetValue: '< 3000ms avg',
    });
  }

  return {
    canExpand: blockers.length === 0,
    blockers,
    status: blockers.length > 0 ? 'paused' : 'ready',
  };
}

// ═══════════════════════════════════════════════════════════
// ROLLOUT STATUS — combines phase + metrics + gate
// ═══════════════════════════════════════════════════════════

export function getRolloutStatus(metrics) {
  const currentPhase = getCurrentPhase(metrics.registeredMembers);
  const nextPhase = getNextPhase(currentPhase.id);
  const gate = nextPhase ? checkExpansionGate(metrics) : { canExpand: false, blockers: [], status: 'ga' };

  return {
    currentPhase,
    nextPhase,
    gate,
    memberCount: metrics.registeredMembers,
    slotsUsed: metrics.registeredMembers,
    slotsRemaining: currentPhase.invitationLimit
      ? Math.max(0, currentPhase.invitationLimit.max - metrics.registeredMembers)
      : null,
    expansionPaused: gate.status === 'paused',
  };
}
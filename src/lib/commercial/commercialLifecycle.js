/**
 * EXECLEAD.AI — Commercial Lifecycle™ v1.0
 * =================================================
 * Every capability progresses through a defined lifecycle:
 *
 *   Idea → Experimental → Beta → Core → Validated →
 *   Premium Candidate → Commercialized → Enterprise → Retired
 *
 * The lifecycle is visible in Product Intelligence™ and
 * drives commercialization decisions.
 */

import { getCapability, CAPABILITY_STATUS, CAPABILITY_FLAGS } from './capabilityRegistry';

// ============================================================
// Lifecycle Stages
// ============================================================

export const LIFECYCLE_STAGES = [
  { id: 'idea',               label: 'Idea',               color: '#64748b', description: 'Concept stage — not yet built',                    order: 0 },
  { id: 'experimental',       label: 'Experimental',       color: '#f59e0b', description: 'In active development — not user-facing',          order: 1 },
  { id: 'beta',               label: 'Beta',               color: '#06b6d4', description: 'Available to beta users — gathering feedback',     order: 2 },
  { id: 'core',               label: 'Core',               color: '#10b981', description: 'Generally available to all eligible plans',        order: 3 },
  { id: 'validated',          label: 'Validated',          color: '#3b82f6', description: 'Proven demand — ready for commercialization',      order: 4 },
  { id: 'premium_candidate',  label: 'Premium Candidate', color: '#a855f7', description: 'Identified for future premium suite',              order: 5 },
  { id: 'commercialized',     label: 'Commercialized',     color: '#10b981', description: 'Actively sold as part of a paid plan',             order: 6 },
  { id: 'enterprise',         label: 'Enterprise',         color: '#3b82f6', description: 'Enterprise-only capability',                       order: 7 },
  { id: 'retired',            label: 'Retired',            color: '#64748b', description: 'Decommissioned — no longer available',             order: 8 },
];

// ============================================================
// Stage Resolution
// ============================================================

/**
 * Derive the current lifecycle stage from capability status + flags + plan.
 */
export function getLifecycleStage(capability) {
  const cap = typeof capability === 'string' ? getCapability(capability) : capability;
  if (!cap) return LIFECYCLE_STAGES[0];

  // Retired
  if (cap.status === CAPABILITY_STATUS.RETIRED) return getStage('retired');

  // Future / Idea
  if (cap.status === CAPABILITY_STATUS.FUTURE) return getStage('idea');

  // Experimental
  if (cap.status === CAPABILITY_STATUS.EXPERIMENTAL) {
    if (cap.flag === CAPABILITY_FLAGS.BETA) return getStage('beta');
    return getStage('experimental');
  }

  // Internal
  if (cap.status === 'internal') return getStage('experimental');

  // Enterprise
  if (cap.status === CAPABILITY_STATUS.ENTERPRISE) return getStage('enterprise');

  // Premium Candidate
  if (cap.status === CAPABILITY_STATUS.PREMIUM_CANDIDATE) {
    // If it's already on a paid plan, it's commercialized
    if (cap.currentPlan === 'executive' || cap.currentPlan === 'professional') {
      return getStage('commercialized');
    }
    return getStage('premium_candidate');
  }

  // Validated
  if (cap.status === 'validated') return getStage('validated');

  // Core (default)
  if (cap.currentPlan === 'free') return getStage('core');
  return getStage('commercialized');
}

function getStage(id) {
  return LIFECYCLE_STAGES.find(s => s.id === id) || LIFECYCLE_STAGES[0];
}

/**
 * Get the lifecycle progress percentage (0-100).
 */
export function getLifecycleProgress(capability) {
  const stage = getLifecycleStage(capability);
  const maxOrder = LIFECYCLE_STAGES.length - 1;
  return Math.round((stage.order / maxOrder) * 100);
}

/**
 * Get the next lifecycle stage for a capability.
 */
export function getNextStage(capability) {
  const current = getLifecycleStage(capability);
  const next = LIFECYCLE_STAGES.find(s => s.order === current.order + 1);
  return next || null;
}

/**
 * Get all lifecycle stages with whether the capability has passed each.
 */
export function getLifecycleHistory(capability) {
  const current = getLifecycleStage(capability);
  return LIFECYCLE_STAGES.map(stage => ({
    ...stage,
    completed: stage.order < current.order,
    current: stage.id === current.id,
    upcoming: stage.order > current.order,
  }));
}

/**
 * Get lifecycle stage distribution across all capabilities.
 */
export function getLifecycleDistribution(capabilities) {
  const dist = {};
  LIFECYCLE_STAGES.forEach(s => { dist[s.id] = 0; });
  capabilities.forEach(cap => {
    const stage = getLifecycleStage(cap);
    dist[stage.id] = (dist[stage.id] || 0) + 1;
  });
  return LIFECYCLE_STAGES.map(stage => ({
    ...stage,
    count: dist[stage.id] || 0,
  }));
}

/**
 * Check if a capability can advance to the next lifecycle stage.
 */
export function canAdvance(capability, metrics = {}) {
  const current = getLifecycleStage(capability);
  const next = getNextStage(capability);
  if (!next) return { canAdvance: false, reason: 'Already at final stage' };

  // Gate checks based on target stage
  switch (next.id) {
    case 'beta':
      return { canAdvance: true, reason: 'Ready for beta release' };
    case 'core':
      if ((metrics.errors || 0) < 10) return { canAdvance: true, reason: 'Stable — ready for general availability' };
      return { canAdvance: false, reason: 'Too many errors — not ready for GA' };
    case 'validated':
      if ((metrics.unique_users || 0) >= 50 && (metrics.retention_rate || 0) >= 60) {
        return { canAdvance: true, reason: 'Sufficient adoption and retention to validate demand' };
      }
      return { canAdvance: false, reason: 'Insufficient adoption or retention data' };
    case 'premium_candidate':
      if ((metrics.conversion_rate || 0) >= 10) return { canAdvance: true, reason: 'Demonstrated conversion influence' };
      return { canAdvance: false, reason: 'No evidence of conversion influence yet' };
    case 'commercialized':
      return { canAdvance: true, reason: 'Approved for commercialization' };
    case 'enterprise':
      return { canAdvance: true, reason: 'Approved for enterprise tier' };
    default:
      return { canAdvance: true, reason: 'Ready to advance' };
  }
}
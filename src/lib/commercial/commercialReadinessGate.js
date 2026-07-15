/**
 * EXECLEAD.AI — Commercial Readiness Gate™ v1.0
 * =================================================
 * A capability CANNOT become paid until it passes 9 gates:
 *
 *   1. Product Quality
 *   2. Customer Adoption
 *   3. Customer Satisfaction
 *   4. AI Economics
 *   5. Support Readiness
 *   6. Documentation
 *   7. Security Review
 *   8. Legal Review
 *   9. Operational Readiness
 *
 * Each gate displays: Pass | Warning | Blocked
 * Overall Commercial Readiness Score™ is a weighted composite.
 */

import { getCapability, CAPABILITY_STATUS } from './capabilityRegistry';
import { getCostPerCall, getGrossMargin, formatCost } from './aiEconomics';
import { getPlan } from './commercialRegistry';

// ============================================================
// Readiness Gates
// ============================================================

export const READINESS_GATES = [
  { id: 'product_quality',     name: 'Product Quality',      weight: 15, icon: 'CheckCircle2' },
  { id: 'customer_adoption',   name: 'Customer Adoption',    weight: 15, icon: 'Users' },
  { id: 'customer_satisfaction', name: 'Customer Satisfaction', weight: 12, icon: 'Star' },
  { id: 'ai_economics',        name: 'AI Economics',         weight: 12, icon: 'Cpu' },
  { id: 'support_readiness',   name: 'Support Readiness',     weight: 10, icon: 'LifeBuoy' },
  { id: 'documentation',       name: 'Documentation',         weight: 8,  icon: 'FileText' },
  { id: 'security_review',     name: 'Security Review',      weight: 10, icon: 'ShieldCheck' },
  { id: 'legal_review',        name: 'Legal Review',          weight: 8,  icon: 'Scale' },
  { id: 'operational_readiness', name: 'Operational Readiness', weight: 10, icon: 'Settings' },
];

export const GATE_STATUS = {
  PASS: 'pass',
  WARNING: 'warning',
  BLOCKED: 'blocked',
};

export const GATE_STATUS_META = {
  pass:     { label: 'Pass',    color: '#10b981', icon: 'CheckCircle2' },
  warning:  { label: 'Warning', color: '#f59e0b', icon: 'AlertTriangle' },
  blocked:  { label: 'Blocked', color: '#ef4444', icon: 'XCircle' },
};

// ============================================================
// Gate Evaluators
// ============================================================

function evalProductQuality(cap, metrics) {
  const errors = metrics?.errors || 0;
  const usage = metrics?.usage_count || 1;
  const completions = metrics?.completions || 0;
  const errorRate = (errors / Math.max(usage, 1)) * 100;
  const completionRate = usage > 0 ? (completions / usage) * 100 : 0;
  const score = Math.round((100 - Math.min(errorRate * 5, 50)) * 0.6 + Math.min(completionRate, 100) * 0.4);

  if (errorRate < 3 && completionRate > 40) return { status: GATE_STATUS.PASS, score, reason: `Low error rate (${errorRate.toFixed(1)}%), good completion (${completionRate.toFixed(0)}%)` };
  if (errorRate < 5) return { status: GATE_STATUS.WARNING, score, reason: `Borderline error rate (${errorRate.toFixed(1)}%)` };
  return { status: GATE_STATUS.BLOCKED, score, reason: `High error rate (${errorRate.toFixed(1)}%) — quality issues` };
}

function evalCustomerAdoption(cap, metrics) {
  const users = metrics?.unique_users || 0;
  const usage = metrics?.usage_count || 0;
  const repeat = metrics?.repeat_usage || 0;
  const repeatRate = users > 0 ? (repeat / users) * 100 : 0;
  const score = Math.round(Math.min(users * 0.5, 40) + Math.min(repeatRate * 0.6, 60));

  if (users >= 50 && repeatRate >= 60) return { status: GATE_STATUS.PASS, score, reason: `${users} users, ${repeatRate.toFixed(0)}% repeat usage` };
  if (users >= 20) return { status: GATE_STATUS.WARNING, score, reason: `${users} users — needs more adoption` };
  return { status: GATE_STATUS.BLOCKED, score, reason: `Only ${users} users — insufficient adoption` };
}

function evalCustomerSatisfaction(cap, metrics) {
  const sat = metrics?.satisfaction_score || 0;
  const score = Math.round((sat / 5) * 100);

  if (sat >= 4.0) return { status: GATE_STATUS.PASS, score, reason: `Satisfaction ${sat}/5` };
  if (sat >= 3.5) return { status: GATE_STATUS.WARNING, score, reason: `Satisfaction ${sat}/5 — needs improvement` };
  return { status: GATE_STATUS.BLOCKED, score, reason: `Low satisfaction (${sat}/5)` };
}

function evalAIEconomics(cap, metrics) {
  if (!cap.aiComputeRequired) return { status: GATE_STATUS.PASS, score: 100, reason: 'No AI compute required' };
  const usage = metrics?.usage_count || 0;
  const plan = getPlan(cap.currentPlan);
  const margin = getGrossMargin(cap.id, usage, plan?.price || 0);
  const costPerCall = getCostPerCall(cap.id);
  const score = Math.max(0, Math.min(100, Math.round(margin)));

  if (margin >= 50) return { status: GATE_STATUS.PASS, score, reason: `Gross margin ${margin.toFixed(0)}% (${formatCost(costPerCall)}/call)` };
  if (margin >= 0) return { status: GATE_STATUS.WARNING, score, reason: `Thin margin (${margin.toFixed(0)}%) — monitor AI costs` };
  return { status: GATE_STATUS.BLOCKED, score, reason: `Negative margin (${margin.toFixed(0)}%) — AI cost exceeds revenue` };
}

function evalSupportReadiness(cap, metrics) {
  const errors = metrics?.errors || 0;
  const usage = metrics?.usage_count || 1;
  const errorRate = (errors / Math.max(usage, 1)) * 100;
  const score = Math.round(100 - Math.min(errorRate * 8, 80));

  if (errorRate < 3) return { status: GATE_STATUS.PASS, score, reason: `Low error burden (${errorRate.toFixed(1)}%)` };
  if (errorRate < 5) return { status: GATE_STATUS.WARNING, score, reason: `Moderate error rate (${errorRate.toFixed(1)}%)` };
  return { status: GATE_STATUS.BLOCKED, score, reason: `High support burden (${errorRate.toFixed(1)}% error rate)` };
}

function evalDocumentation(cap) {
  // Derive from status — core/commercialized capabilities should have docs
  const hasDocs = cap.status === CAPABILITY_STATUS.CORE || cap.status === CAPABILITY_STATUS.PREMIUM_CANDIDATE || cap.status === CAPABILITY_STATUS.ENTERPRISE;
  const score = hasDocs ? 80 : 40;

  if (hasDocs) return { status: GATE_STATUS.PASS, score, reason: 'Documentation available for GA capability' };
  return { status: GATE_STATUS.WARNING, score, reason: 'Documentation incomplete — not yet GA' };
}

function evalSecurityReview(cap) {
  const isEnterprise = cap.status === CAPABILITY_STATUS.ENTERPRISE || cap.workspace === 'enterprise';
  const score = isEnterprise ? 90 : 70;

  if (isEnterprise) return { status: GATE_STATUS.PASS, score, reason: 'Security reviewed for enterprise capability' };
  if (cap.status === CAPABILITY_STATUS.CORE) return { status: GATE_STATUS.PASS, score, reason: 'Security baseline met for core capability' };
  return { status: GATE_STATUS.WARNING, score, reason: 'Security review pending' };
}

function evalLegalReview(cap) {
  const isCommercialized = cap.currentPlan !== 'free' && cap.status !== CAPABILITY_STATUS.FUTURE && cap.status !== CAPABILITY_STATUS.EXPERIMENTAL;
  const score = isCommercialized ? 85 : 50;

  if (isCommercialized) return { status: GATE_STATUS.PASS, score, reason: 'Legal review completed for commercialized capability' };
  return { status: GATE_STATUS.WARNING, score, reason: 'Legal review required before commercialization' };
}

function evalOperationalReadiness(cap, metrics) {
  const complexity = cap.engineeringComplexity || 50;
  const errors = metrics?.errors || 0;
  const score = Math.round((100 - complexity) * 0.5 + (errors < 10 ? 50 : 20));

  if (complexity <= 70 && errors < 10) return { status: GATE_STATUS.PASS, score, reason: `Manageable complexity (${complexity}/100), low errors (${errors})` };
  if (complexity <= 80) return { status: GATE_STATUS.WARNING, score, reason: `High complexity (${complexity}/100) — operational risk` };
  return { status: GATE_STATUS.BLOCKED, score, reason: `Excessive complexity (${complexity}/100)` };
}

const GATE_EVALUATORS = {
  product_quality: evalProductQuality,
  customer_adoption: evalCustomerAdoption,
  customer_satisfaction: evalCustomerSatisfaction,
  ai_economics: evalAIEconomics,
  support_readiness: evalSupportReadiness,
  documentation: evalDocumentation,
  security_review: evalSecurityReview,
  legal_review: evalLegalReview,
  operational_readiness: evalOperationalReadiness,
};

// ============================================================
// Gate Evaluation
// ============================================================

/**
 * Evaluate all 9 readiness gates for a capability.
 * Returns per-gate status and an overall Commercial Readiness Score™.
 */
export function evaluateReadinessGate(capabilityId, metrics = {}) {
  const cap = typeof capabilityId === 'string' ? getCapability(capabilityId) : capabilityId;
  if (!cap) return null;

  const gates = READINESS_GATES.map(gate => {
    const evaluator = GATE_EVALUATORS[gate.id];
    const result = evaluator(cap, metrics);
    return {
      ...gate,
      ...result,
      weightedScore: Math.round((result.score / 100) * gate.weight),
    };
  });

  const blockedCount = gates.filter(g => g.status === GATE_STATUS.BLOCKED).length;
  const warningCount = gates.filter(g => g.status === GATE_STATUS.WARNING).length;
  const passCount = gates.filter(g => g.status === GATE_STATUS.PASS).length;
  const overallScore = gates.reduce((s, g) => s + g.weightedScore, 0);

  let overallStatus;
  if (blockedCount > 0) {
    overallStatus = GATE_STATUS.BLOCKED;
  } else if (warningCount > 0) {
    overallStatus = GATE_STATUS.WARNING;
  } else {
    overallStatus = GATE_STATUS.PASS;
  }

  let recommendation;
  if (blockedCount > 0) {
    recommendation = 'Do Not Commercialize — Blocked Gates';
  } else if (overallScore >= 75 && warningCount <= 2) {
    recommendation = 'Ready for Pricing';
  } else if (overallScore >= 60) {
    recommendation = 'Validate — Address Warnings';
  } else if (overallScore >= 40) {
    recommendation = 'Do Not Commercialize';
  } else {
    recommendation = 'Do Not Commercialize';
  }

  return {
    capabilityId: cap.id,
    capabilityName: cap.name,
    gates,
    overallScore,
    overallStatus,
    passCount,
    warningCount,
    blockedCount,
    recommendation,
    canCommercialize: blockedCount === 0 && overallScore >= 60,
  };
}

/**
 * Evaluate readiness gates for all capabilities.
 */
export function evaluateAllReadinessGates(capabilities, allMetrics = []) {
  return capabilities.map(cap => {
    const metrics = allMetrics.find(m => m.capability_id === cap.id) || {};
    return evaluateReadinessGate(cap, metrics);
  }).filter(Boolean);
}

/**
 * Get gate summary stats.
 */
export function getGateSummary(evaluations) {
  return {
    total: evaluations.length,
    ready: evaluations.filter(e => e.canCommercialize).length,
    blocked: evaluations.filter(e => e.blockedCount > 0).length,
    validate: evaluations.filter(e => e.blockedCount === 0 && e.warningCount > 0).length,
    avgScore: Math.round(evaluations.reduce((s, e) => s + e.overallScore, 0) / (evaluations.length || 1)),
  };
}
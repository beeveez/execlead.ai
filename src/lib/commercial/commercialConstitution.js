/**
 * EXECLEAD.AI — Commercial Constitution™ v1.0
 * =================================================
 * Every commercialization decision must satisfy 5 principles.
 * Displays pass/fail before any capability is approved for commercialization.
 *
 * Principles:
 *   1. Customer Value First
 *   2. Trust Before Monetization
 *   3. Operational Readiness
 *   4. Economic Sustainability
 *   5. Strategic Alignment
 */

import { getCapability, CAPABILITY_STATUS } from './capabilityRegistry';
import { getCostPerCall, getGrossMargin } from './aiEconomics';
import { getPlan } from './commercialRegistry';

// ============================================================
// Constitution Principles
// ============================================================

export const CONSTITUTION_PRINCIPLES = [
  {
    id: 'customer_value_first',
    name: 'Customer Value First',
    description: 'The capability delivers meaningful, measurable value to customers before monetization',
    weight: 25,
    icon: 'Heart',
  },
  {
    id: 'trust_before_monetization',
    name: 'Trust Before Monetization',
    description: 'The capability has earned customer trust through reliability and transparency',
    weight: 25,
    icon: 'ShieldCheck',
  },
  {
    id: 'operational_readiness',
    name: 'Operational Readiness',
    description: 'The platform can support this capability at scale without degradation',
    weight: 20,
    icon: 'Settings',
  },
  {
    id: 'economic_sustainability',
    name: 'Economic Sustainability',
    description: 'The capability is financially viable — AI costs do not exceed revenue',
    weight: 15,
    icon: 'DollarSign',
  },
  {
    id: 'strategic_alignment',
    name: 'Strategic Alignment',
    description: 'The capability aligns with EXECLEAD.AI strategic direction',
    weight: 15,
    icon: 'Compass',
  },
];

// ============================================================
// Principle Evaluation
// ============================================================

function evaluateCustomerValue(cap, metrics) {
  const value = cap.customerValue || 0;
  const usage = metrics?.usage_count || 0;
  const satisfaction = metrics?.satisfaction_score || 0;
  const score = Math.round(value * 0.5 + Math.min(usage / 10, 25) + satisfaction * 5);

  if (value >= 75 && satisfaction >= 4) {
    return { passed: true, score, reason: `High customer value (${value}) with strong satisfaction (${satisfaction}/5)` };
  }
  if (value >= 60) {
    return { passed: false, score, warning: true, reason: `Moderate value (${value}) — needs validation before monetization` };
  }
  return { passed: false, score, reason: `Low customer value (${value}) — do not commercialize` };
}

function evaluateTrustBeforeMonetization(cap, metrics) {
  const errors = metrics?.errors || 0;
  const usage = metrics?.usage_count || 1;
  const errorRate = (errors / usage) * 100;
  const retention = metrics?.retention_rate || 0;
  const score = Math.round((100 - Math.min(errorRate * 5, 50)) * 0.5 + retention * 0.5);

  if (errorRate < 3 && retention >= 70) {
    return { passed: true, score, reason: `Low error rate (${errorRate.toFixed(1)}%) with strong retention (${retention}%)` };
  }
  if (errorRate < 5 && retention >= 60) {
    return { passed: false, score, warning: true, reason: `Acceptable error rate (${errorRate.toFixed(1)}%) but retention needs improvement (${retention}%)` };
  }
  return { passed: false, score, reason: `High error rate (${errorRate.toFixed(1)}%) or low retention (${retention}%) — trust not established` };
}

function evaluateOperationalReadiness(cap, metrics) {
  const complexity = cap.engineeringComplexity || 50;
  const responseTime = cap.avgResponseTimeMs || 0;
  const errors = metrics?.errors || 0;
  const score = Math.round((100 - complexity) * 0.4 + (responseTime < 3000 ? 30 : 10) + (errors < 10 ? 30 : 10));

  if (complexity <= 70 && errors < 10) {
    return { passed: true, score, reason: `Manageable complexity (${complexity}/100) with low error count (${errors})` };
  }
  if (complexity <= 80) {
    return { passed: false, score, warning: true, reason: `High complexity (${complexity}/100) — operational risk` };
  }
  return { passed: false, score, reason: `Excessive complexity (${complexity}/100) — not operationally ready` };
}

function evaluateEconomicSustainability(cap, metrics) {
  if (!cap.aiComputeRequired) {
    return { passed: true, score: 100, reason: 'No AI compute required — economically neutral' };
  }

  const usage = metrics?.usage_count || 0;
  const uniqueUsers = metrics?.unique_users || 0;
  const plan = getPlan(cap.currentPlan);
  const planPrice = plan?.price || 0;
  const margin = getGrossMargin(cap.id, usage, planPrice);
  const costPerCall = getCostPerCall(cap.id);
  const score = Math.max(0, Math.min(100, Math.round(margin)));

  if (margin >= 50) {
    return { passed: true, score, reason: `Healthy gross margin (${margin.toFixed(0)}%) at $${planPrice}/mo plan` };
  }
  if (margin >= 0) {
    return { passed: false, score, warning: true, reason: `Thin margin (${margin.toFixed(0)}%) — AI cost ($${costPerCall.toFixed(4)}/call) may not be sustainable` };
  }
  return { passed: false, score, reason: `Negative margin (${margin.toFixed(0)}%) — AI cost exceeds plan revenue` };
}

function evaluateStrategicAlignment(cap) {
  const alignment = cap.strategicAlignment || 0;
  const score = alignment;

  if (alignment >= 80) {
    return { passed: true, score, reason: `Strong strategic alignment (${alignment}/100)` };
  }
  if (alignment >= 65) {
    return { passed: false, score, warning: true, reason: `Moderate alignment (${alignment}/100) — review strategic fit` };
  }
  return { passed: false, score, reason: `Low strategic alignment (${alignment}/100)` };
}

const EVALUATORS = {
  customer_value_first: evaluateCustomerValue,
  trust_before_monetization: evaluateTrustBeforeMonetization,
  operational_readiness: evaluateOperationalReadiness,
  economic_sustainability: evaluateEconomicSustainability,
  strategic_alignment: evaluateStrategicAlignment,
};

// ============================================================
// Constitution Evaluation
// ============================================================

/**
 * Evaluate the Commercial Constitution™ for a single capability.
 * Returns pass/fail for each principle and an overall verdict.
 */
export function evaluateConstitution(capabilityId, metrics = {}) {
  const cap = typeof capabilityId === 'string' ? getCapability(capabilityId) : capabilityId;
  if (!cap) return null;

  const principles = CONSTITUTION_PRINCIPLES.map(principle => {
    const evaluator = EVALUATORS[principle.id];
    const result = evaluator(cap, metrics);
    return {
      ...principle,
      ...result,
      weightedScore: Math.round((result.score / 100) * principle.weight),
    };
  });

  const allPassed = principles.every(p => p.passed);
  const hasWarning = principles.some(p => p.warning);
  const totalScore = principles.reduce((s, p) => s + p.weightedScore, 0);

  let verdict;
  if (allPassed) {
    verdict = 'Constitutionally Approved';
  } else if (hasWarning && totalScore >= 50) {
    verdict = 'Conditional — Address Warnings';
  } else {
    verdict = 'Do Not Commercialize';
  }

  return {
    capabilityId: cap.id,
    capabilityName: cap.name,
    principles,
    allPassed,
    hasWarning,
    totalScore,
    verdict,
  };
}

/**
 * Evaluate the constitution for all capabilities.
 */
export function evaluateAllConstitutions(capabilities, allMetrics = []) {
  return capabilities.map(cap => {
    const metrics = allMetrics.find(m => m.capability_id === cap.id) || {};
    return evaluateConstitution(cap, metrics);
  }).filter(Boolean);
}

/**
 * Get constitution summary stats.
 */
export function getConstitutionSummary(evaluations) {
  return {
    total: evaluations.length,
    approved: evaluations.filter(e => e.allPassed).length,
    conditional: evaluations.filter(e => !e.allPassed && e.hasWarning).length,
    rejected: evaluations.filter(e => !e.allPassed && !e.hasWarning).length,
    avgScore: Math.round(evaluations.reduce((s, e) => s + e.totalScore, 0) / (evaluations.length || 1)),
  };
}
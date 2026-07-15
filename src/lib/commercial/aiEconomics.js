/**
 * EXECLEAD.AI — AI Economics™ v1.0
 * =================================================
 * Calculates AI compute costs for every AI-capable feature.
 * 
 * For every AI capability:
 *   - Estimated Cost
 *   - Average Tokens
 *   - Average Response Time
 *   - Monthly Usage
 *   - Cost Per User
 *   - Cost Per Feature
 *   - Projected Gross Margin
 * 
 * Display in Developer Workspace only.
 */

import { getAICapabilities, getCapability } from './capabilityRegistry';
import { getPlan, PLANS } from './commercialRegistry';

// ============================================================
// Cost Model
// ============================================================

// Approximate LLM cost per 1K tokens (blended across models)
const COST_PER_1K_TOKENS = {
  input: 0.005,   // ~$5/1M input tokens (blended)
  output: 0.015,  // ~$15/1M output tokens (blended)
};

// Default input/output token ratio
const INPUT_OUTPUT_RATIO = 0.6; // 60% input, 40% output

/**
 * Calculate the estimated cost per single AI call for a capability.
 */
export function getCostPerCall(capabilityId) {
  const cap = getCapability(capabilityId);
  if (!cap || !cap.aiComputeRequired) return 0;

  // Use the capability's own estimate if available
  if (cap.estimatedComputeCost > 0) return cap.estimatedComputeCost;

  // Calculate from token estimates
  const totalTokens = cap.avgTokensPerCall || 0;
  if (totalTokens === 0) return 0;

  const inputTokens = totalTokens * INPUT_OUTPUT_RATIO;
  const outputTokens = totalTokens * (1 - INPUT_OUTPUT_RATIO);

  return (inputTokens / 1000) * COST_PER_1K_TOKENS.input +
         (outputTokens / 1000) * COST_PER_1K_TOKENS.output;
}

/**
 * Calculate monthly AI cost for a capability based on usage.
 */
export function getMonthlyAICost(capabilityId, monthlyUsage) {
  return getCostPerCall(capabilityId) * monthlyUsage;
}

/**
 * Calculate cost per user for a capability.
 */
export function getCostPerUser(capabilityId, monthlyUsage, uniqueUsers) {
  if (uniqueUsers === 0) return 0;
  return getMonthlyAICost(capabilityId, monthlyUsage) / uniqueUsers;
}

// ============================================================
// Platform-Level AI Economics
// ============================================================

/**
 * Calculate total monthly AI cost across all capabilities.
 */
export function getTotalMonthlyAICost(capabilityMetrics) {
  return capabilityMetrics.reduce((total, c) => {
    const usage = c.monthlyUsage || c.metrics?.usage_count || 0;
    return total + getMonthlyAICost(c.id, usage);
  }, 0);
}

/**
 * Calculate total monthly AI cost per plan tier.
 */
export function getAICostByPlan(capabilityMetrics) {
  const byPlan = {};
  PLANS.forEach(p => { byPlan[p.id] = 0; });

  capabilityMetrics.forEach(c => {
    const usage = c.monthlyUsage || c.metrics?.usage_count || 0;
    byPlan[c.currentPlan] = (byPlan[c.currentPlan] || 0) + getMonthlyAICost(c.id, usage);
  });

  return byPlan;
}

/**
 * Calculate projected gross margin for a capability.
 * Margin = (Revenue from plan - AI Cost) / Revenue from plan
 */
export function getGrossMargin(capabilityId, monthlyUsage, planPrice) {
  const aiCost = getMonthlyAICost(capabilityId, monthlyUsage);
  if (planPrice === 0) return aiCost > 0 ? -100 : 0; // Free plan with AI cost = negative margin
  return ((planPrice - aiCost) / planPrice) * 100;
}

/**
 * Get the AI economics summary for a capability.
 */
export function getCapabilityEconomics(capabilityId, metrics = {}) {
  const cap = getCapability(capabilityId);
  if (!cap) return null;

  const monthlyUsage = metrics.usage_count || metrics.monthlyUsage || 0;
  const uniqueUsers = metrics.unique_users || 0;
  const plan = getPlan(cap.currentPlan);

  const costPerCall = getCostPerCall(capabilityId);
  const monthlyCost = getMonthlyAICost(capabilityId, monthlyUsage);
  const costPerUser = getCostPerUser(capabilityId, monthlyUsage, uniqueUsers);
  const grossMargin = getGrossMargin(capabilityId, monthlyUsage, plan?.price || 0);

  return {
    capabilityId,
    capabilityName: cap.name,
    aiComputeRequired: cap.aiComputeRequired,
    costPerCall,
    avgTokens: cap.avgTokensPerCall,
    avgResponseTime: cap.avgResponseTimeMs,
    monthlyUsage,
    uniqueUsers,
    monthlyCost,
    costPerUser,
    planPrice: plan?.price || 0,
    grossMargin: Math.round(grossMargin),
    profitable: grossMargin > 0,
  };
}

/**
 * Get AI economics for all AI-capable features.
 */
export function getAllAIEconomics(allMetrics = []) {
  const aiCaps = getAICapabilities();
  return aiCaps.map(cap => {
    const metrics = allMetrics.find(m => m.capability_id === cap.id) || {};
    return getCapabilityEconomics(cap.id, metrics);
  }).filter(Boolean);
}

/**
 * Get total platform AI economics summary.
 */
export function getPlatformAIEconomics(allMetrics = []) {
  const allEcon = getAllAIEconomics(allMetrics);
  const totalCost = allEcon.reduce((s, e) => s + e.monthlyCost, 0);
  const totalUsage = allEcon.reduce((s, e) => s + e.monthlyUsage, 0);
  const totalUsers = allEcon.reduce((s, e) => s + e.uniqueUsers, 0);
  const avgCostPerCall = totalUsage > 0 ? totalCost / totalUsage : 0;
  const avgCostPerUser = totalUsers > 0 ? totalCost / totalUsers : 0;

  // Projected revenue (simplified — assumes all users on the capability's plan)
  const projectedRevenue = allEcon.reduce((s, e) => {
    return s + (e.uniqueUsers * e.planPrice);
  }, 0);

  const blendedMargin = projectedRevenue > 0
    ? Math.round(((projectedRevenue - totalCost) / projectedRevenue) * 100)
    : 0;

  return {
    totalAICost: totalCost,
    totalUsage,
    totalUsers,
    avgCostPerCall,
    avgCostPerUser,
    projectedRevenue,
    blendedGrossMargin: blendedMargin,
    capabilities: allEcon,
    highestCostCapability: allEcon.sort((a, b) => b.monthlyCost - a.monthlyCost)[0] || null,
  };
}

/**
 * Format currency for display.
 */
export function formatCost(cost) {
  if (cost === 0) return '$0.00';
  if (cost < 0.01) return '<$0.01';
  if (cost < 1) return `$${cost.toFixed(4)}`;
  return `$${cost.toFixed(2)}`;
}
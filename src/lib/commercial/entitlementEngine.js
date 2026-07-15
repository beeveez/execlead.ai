/**
 * EXECLEAD.AI — Entitlement Engine™ v1.0
 * =================================================
 * Centralized permission checking for every capability.
 * 
 * Every page checks permissions through this engine.
 * Never hardcode plan checks.
 * 
 * Usage:
 *   import { canUse } from '@/lib/commercial/entitlementEngine';
 *   if (canUse(user, 'executive_digital_twin')) { ... }
 * 
 * React hook:
 *   import { useCanUse } from '@/lib/commercial/entitlementEngine';
 *   const allowed = useCanUse('executive_digital_twin');
 */

import { getCapability, isCapabilityUsable, CAPABILITY_STATUS, CAPABILITIES } from './capabilityRegistry';
import { PLAN_TIERS, getPlan, planIncludesCapability } from './commercialRegistry';

// ============================================================
// Plan Resolution
// ============================================================

/**
 * Resolve the user's current plan from user object.
 * Checks multiple possible locations for plan data.
 */
export function resolveUserPlan(user) {
  if (!user) return 'free';

  // Direct plan field
  if (user.data?.plan) return user.data.plan;
  if (user.data?.subscription_plan) return user.data.subscription_plan;
  if (user.plan) return user.plan;

  // Role-based inference
  const role = user.role;
  if (role === 'enterprise_admin') return 'enterprise';
  if (role === 'super_admin' || role === 'platform_admin') return 'enterprise';
  if (role === 'admin' || role === 'developer') return 'enterprise';

  return 'free';
}

/**
 * Get the numeric tier for a user's plan.
 */
export function getUserTier(user) {
  return PLAN_TIERS[resolveUserPlan(user)] ?? 0;
}

// ============================================================
// Core Entitlement Check
// ============================================================

/**
 * Check if a user can use a specific capability.
 * This is THE function every page should use.
 * 
 * @param {object} user - The user object from auth context
 * @param {string} capabilityId - The capability ID from the registry
 * @returns {boolean}
 */
export function canUse(user, capabilityId) {
  const capability = getCapability(capabilityId);
  if (!capability) return false;

  // Retired and Future capabilities are never usable
  if (capability.status === CAPABILITY_STATUS.RETIRED) return false;
  if (capability.status === CAPABILITY_STATUS.FUTURE) return false;

  // Check capability flag usability
  if (!isCapabilityUsable(capability)) return false;

  // Enterprise capabilities require enterprise plan
  if (capability.status === CAPABILITY_STATUS.ENTERPRISE) {
    return resolveUserPlan(user) === 'enterprise';
  }

  // Check plan tier hierarchy
  const userTier = getUserTier(user);
  const requiredTier = PLAN_TIERS[capability.currentPlan] ?? 0;

  return userTier >= requiredTier;
}

/**
 * Check if a user can access a specific plan's features.
 */
export function canAccessPlan(user, planId) {
  const userTier = getUserTier(user);
  const planTier = PLAN_TIERS[planId] ?? 0;
  return userTier >= planTier;
}

/**
 * Get the reason a capability is not available (for upgrade prompts).
 */
export function getEntitlementReason(user, capabilityId) {
  const capability = getCapability(capabilityId);
  if (!capability) return { allowed: false, reason: 'Capability not found' };

  if (capability.status === CAPABILITY_STATUS.RETIRED) {
    return { allowed: false, reason: 'This feature has been retired' };
  }
  if (capability.status === CAPABILITY_STATUS.FUTURE) {
    return { allowed: false, reason: 'This feature is coming soon' };
  }

  if (capability.status === CAPABILITY_STATUS.ENTERPRISE) {
    if (resolveUserPlan(user) !== 'enterprise') {
      return { allowed: false, reason: 'Enterprise plan required', upgradePlan: 'enterprise' };
    }
  }

  const userTier = getUserTier(user);
  const requiredTier = PLAN_TIERS[capability.currentPlan] ?? 0;

  if (userTier < requiredTier) {
    return {
      allowed: false,
      reason: `${capability.currentPlan.charAt(0).toUpperCase() + capability.currentPlan.slice(1)} plan required`,
      upgradePlan: capability.currentPlan,
    };
  }

  return { allowed: true };
}

/**
 * Get all capabilities the user can access.
 */
export function getAccessibleCapabilities(user) {
  return CAPABILITIES.filter(c => canUse(user, c.id));
}

/**
 * Get all capabilities the user cannot access (for upsell).
 */
export function getLockedCapabilities(user) {
  return CAPABILITIES.filter(c => !canUse(user, c.id) && c.status !== CAPABILITY_STATUS.RETIRED && c.status !== CAPABILITY_STATUS.FUTURE);
}

/**
 * Get capabilities the user could unlock by upgrading.
 */
export function getUpgradeCandidates(user) {
  const userTier = getUserTier(user);
  return CAPABILITIES.filter(c => {
    const requiredTier = PLAN_TIERS[c.currentPlan] ?? 0;
    return requiredTier > userTier && c.status !== CAPABILITY_STATUS.RETIRED && c.status !== CAPABILITY_STATUS.FUTURE;
  });
}

// ============================================================
// React Hook (lazy-loaded to avoid SSR issues)
// ============================================================

import { useAuth } from '@/lib/AuthContext';

/**
 * React hook for entitlement checks.
 * 
 * @param {string} capabilityId
 * @returns {boolean}
 */
export function useCanUse(capabilityId) {
  const { user } = useAuth();
  return canUse(user, capabilityId);
}

/**
 * React hook for getting entitlement reason.
 */
export function useEntitlement(capabilityId) {
  const { user } = useAuth();
  return getEntitlementReason(user, capabilityId);
}

/**
 * React hook for getting user's plan.
 */
export function useUserPlan() {
  const { user } = useAuth();
  return resolveUserPlan(user);
}
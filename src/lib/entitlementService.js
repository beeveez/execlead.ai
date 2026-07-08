/**
 * EXECLEAD.AI — Centralized Entitlement Service
 * ===============================================
 * The SINGLE source of truth for user entitlements.
 *
 *   const entitlements = await getUserEntitlements(userId, profile)
 *
 * Returns:
 *   {
 *     subscription,         // { plan, status, cycle }
 *     isFoundingMember,     // boolean — from FoundingMember entity ONLY
 *     founderTier,          // founding_tier from the record
 *     founderNumber,        // founding_member_number
 *     founderBenefits,      // array of benefit keys
 *     lifetimeDiscount,     // 25 (or record override)
 *     betaAccess,           // boolean
 *     earlyAccess,          // boolean
 *     ...
 *   }
 *
 * Rules:
 *   - Founder status is determined SOLELY by a FoundingMember
 *     database record with an active status.
 *   - NEVER reads profile.founding_member (can be stale).
 *   - NEVER uses mock data, hardcoded flags, cached state, or
 *     developer simulation values.
 *   - Account switch (userId change) triggers a full refetch.
 *
 * All pages MUST read founder status from this service (directly
 * or via SubscriptionContext). Do not independently query
 * profile.founding_member or use local component state.
 */
import { base44 } from "@/api/base44Client";

const FOUNDER_DISCOUNT_PERCENTAGE = 25;
const ACTIVE_STATUSES = ["active", "verified", "lifetime"];

export const FOUNDER_BENEFIT_KEYS = [
  "founder_badge",
  "founder_portal",
  "lifetime_discount",
  "price_protection",
  "early_access",
  "beta_access",
  "community_access",
  "referral_program",
  "founder_rewards",
];

export const NULL_ENTITLEMENTS = Object.freeze({
  subscription: { plan: "free", status: "active", cycle: "monthly" },
  isFoundingMember: false,
  founderTier: null,
  founderNumber: null,
  founderSince: null,
  founderBatch: null,
  lifetimeDiscount: 0,
  discountEnabled: false,
  priceProtection: false,
  betaAccess: false,
  earlyAccess: false,
  communityAccess: false,
  roadmapVoting: false,
  feedbackSessions: false,
  founderBenefits: [],
  founderRecord: null,
});

/**
 * Get the complete entitlement snapshot for a user.
 * Reads ONLY from the database — no profile flags, no simulation.
 *
 * @param {string} userId - The user's ID
 * @param {object} profile - UserProfile record (for subscription info)
 * @returns {Promise<object>} Entitlement snapshot
 */
export async function getUserEntitlements(userId, profile) {
  if (!userId) return NULL_ENTITLEMENTS;

  const subscription = {
    plan: profile?.subscription_plan || "free",
    status: profile?.subscription_status || "active",
    cycle: profile?.subscription_cycle || "monthly",
  };

  // Founder status comes ONLY from the FoundingMember entity.
  // This is the single source of truth — never the profile flag.
  let founderRecord = null;
  try {
    const records = await base44.entities.FoundingMember.filter({ user_id: userId });
    founderRecord = records.length > 0 ? records[0] : null;
  } catch (e) {
    founderRecord = null;
  }

  const isFoundingMember = Boolean(
    founderRecord && ACTIVE_STATUSES.includes(founderRecord.status)
  );

  if (!isFoundingMember) {
    return {
      ...NULL_ENTITLEMENTS,
      subscription,
      founderRecord,
    };
  }

  return {
    subscription,
    isFoundingMember: true,
    founderTier: founderRecord.founding_tier || "founding_member",
    founderNumber: founderRecord.founding_member_number || null,
    founderSince: founderRecord.joined_date || null,
    founderBatch: founderRecord.founding_batch || null,
    lifetimeDiscount: founderRecord.lifetime_discount_percentage ?? FOUNDER_DISCOUNT_PERCENTAGE,
    discountEnabled: founderRecord.lifetime_discount_enabled ?? true,
    priceProtection: founderRecord.protected_pricing ?? true,
    betaAccess: founderRecord.beta_access ?? true,
    earlyAccess: founderRecord.early_access_enabled ?? true,
    communityAccess: founderRecord.community_access ?? true,
    roadmapVoting: founderRecord.roadmap_voting ?? true,
    feedbackSessions: founderRecord.feedback_sessions ?? true,
    founderBenefits: FOUNDER_BENEFIT_KEYS,
    founderRecord,
  };
}
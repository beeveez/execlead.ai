/**
 * EXECLEAD.AI — Centralized Entitlement Service (SINGLE SOURCE OF TRUTH)
 * =======================================================================
 *
 *   const entitlements = await getUserEntitlements(userId, profile)
 *
 * Returns:
 *   {
 *     subscription,         // { plan, status, cycle }
 *     isFoundingMember,     // true if an active FoundingMember record exists
 *     purchaseVerified,     // true if purchase_verified && payment_status === "paid"
 *     founderPortalEnabled, // true ONLY when ALL business rules pass
 *     founderNumber,        // founding_member_number
 *     founderTier,          // founding_tier
 *     founderSince,         // joined_date
 *     lifetimeDiscount,     // 25 (or record override)
 *     founderBenefits,      // array of benefit keys
 *     founderRecord,        // raw record (for diagnostics / portal pages)
 *     entitlementSource,    // "entitlement_service"
 *   }
 *
 * BUSINESS RULES — a user is a Founding Member ONLY when ALL are true:
 *   1. An active FoundingMember record exists (status: active/verified/lifetime)
 *   2. purchase_verified === true AND payment_status === "paid"
 *   3. Subscription plan is Professional or Executive (eligible)
 *
 * If ANY condition fails:
 *   - isFoundingMember may be true (record exists) but
 *   - founderPortalEnabled is false → badge hidden, portal hidden, benefits removed
 *
 * This service NEVER reads profile.founding_member (can be stale).
 * It NEVER uses mock data, cached state, or developer simulation.
 */
import { base44 } from "@/api/base44Client";

const FOUNDER_DISCOUNT_PERCENTAGE = 25;
const ACTIVE_STATUSES = ["active", "verified", "lifetime"];
const ELIGIBLE_PLANS = ["professional", "executive"];

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
  purchaseVerified: false,
  founderPortalEnabled: false,
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
  entitlementSource: "entitlement_service",
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
  if (!userId) return { ...NULL_ENTITLEMENTS, entitlementSource: "no_user" };

  const subscription = {
    plan: profile?.subscription_plan || "free",
    status: profile?.subscription_status || "active",
    cycle: profile?.subscription_cycle || "monthly",
  };

  // ── Read the FoundingMember record (the only DB source) ──
  let founderRecord = null;
  try {
    const records = await base44.entities.FoundingMember.filter({ user_id: userId });
    founderRecord = records.length > 0 ? records[0] : null;
  } catch (e) {
    founderRecord = null;
  }

  // ── CONDITION 1: Active record exists ──
  const hasActiveRecord = Boolean(
    founderRecord && ACTIVE_STATUSES.includes(founderRecord.status)
  );

  // ── CONDITION 2: Purchase verified (server-side payment confirmation) ──
  const purchaseVerified = Boolean(
    founderRecord &&
    founderRecord.purchase_verified === true &&
    founderRecord.payment_status === "paid"
  );

  // ── CONDITION 3: Subscription eligible (Professional or Executive) ──
  const subscriptionEligible = ELIGIBLE_PLANS.includes(subscription.plan);

  // ── founderPortalEnabled: ALL conditions must pass ──
  const founderPortalEnabled = hasActiveRecord && purchaseVerified && subscriptionEligible;

  // If not fully entitled, return null entitlements but keep diagnostic fields
  if (!founderPortalEnabled) {
    return {
      ...NULL_ENTITLEMENTS,
      subscription,
      isFoundingMember: hasActiveRecord,
      purchaseVerified,
      founderPortalEnabled: false,
      founderRecord,
      entitlementSource: "entitlement_service",
    };
  }

  // ── Fully entitled — return complete snapshot ──
  return {
    subscription,
    isFoundingMember: true,
    purchaseVerified: true,
    founderPortalEnabled: true,
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
    entitlementSource: "entitlement_service",
  };
}
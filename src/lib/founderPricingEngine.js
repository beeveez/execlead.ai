/**
 * EXECLEAD.AI — Founding Member Pricing Engine
 * ----------------------------------------------
 * The single source of truth for all price calculations across the platform.
 *
 * Founding Membership is a permanent lifetime entitlement that sits
 * ON TOP of any subscription plan — it is NOT a plan itself.
 *
 * Every page that displays or charges a price MUST call calculatePlanPrice().
 * Never hardcode prices. Never require coupon codes for founder discounts.
 * The system detects the entitlement and applies the discount automatically.
 */

export const FOUNDER_DISCOUNT_PERCENTAGE = 25;

/**
 * Calculate the final price for a plan given a founder entitlement.
 *
 * @param {object} plan - Pricing plan (from pricingCatalog / usePricingCatalog)
 * @param {object|null} membership - Founder entitlement (from SubscriptionContext.membership)
 * @param {string} cycle - "monthly" | "annual"
 * @returns {{ originalPrice, finalPrice, discount, savings, applied, protected, isFounder, membership }}
 */
export function calculatePlanPrice(plan, membership, cycle = "monthly") {
  const basePrice = cycle === "annual"
    ? (plan?.annualPrice || 0)
    : (plan?.monthlyPrice || 0);

  const isFounder = Boolean(membership);
  const discount = isFounder ? (membership.discount || FOUNDER_DISCOUNT_PERCENTAGE) : 0;

  if (!isFounder || discount <= 0 || basePrice <= 0) {
    return {
      originalPrice: basePrice,
      finalPrice: basePrice,
      discount: isFounder ? discount : 0,
      savings: 0,
      applied: false,
      protected: isFounder ? Boolean(membership.hasPriceProtection) : false,
      isFounder,
      membership: isFounder ? membership : null,
    };
  }

  const finalPrice = Math.round(basePrice * (1 - discount / 100) * 100) / 100;

  return {
    originalPrice: basePrice,
    finalPrice,
    discount,
    savings: Math.round((basePrice - finalPrice) * 100) / 100,
    applied: true,
    protected: Boolean(membership.hasPriceProtection),
    isFounder: true,
    membership,
  };
}

/**
 * Build a normalized entitlement snapshot from a membership object.
 * Used when you need the entitlement shape without a price calculation.
 */
export function buildEntitlement(membership) {
  if (!membership) return null;
  return {
    isFounder: true,
    name: membership.name || "Founding Member",
    type: membership.type,
    icon: membership.icon || "🏆",
    color: membership.color || "#f59e0b",
    number: membership.number,
    discount: membership.discount || FOUNDER_DISCOUNT_PERCENTAGE,
    hasPriceProtection: membership.hasPriceProtection ?? true,
    since: membership.since,
    isLifetime: membership.isLifetime ?? true,
  };
}
import { useCallback } from "react";
import { useSubscription } from "@/lib/SubscriptionContext";
import { calculatePlanPrice } from "@/lib/founderPricingEngine";

/**
 * Pre-wires the founder pricing engine with the current user's entitlement.
 * Any component can call `calculatePrice(plan, cycle)` and get the
 * founder-adjusted price breakdown automatically — no manual discount
 * lookups, no coupon codes.
 *
 * On public pages, unauthenticated users get `membership = null`,
 * so the engine returns the public price unchanged.
 */
export function useFounderPricing() {
  const { membership } = useSubscription();

  const calculatePrice = useCallback(
    (plan, cycle = "monthly") => calculatePlanPrice(plan, membership, cycle),
    [membership]
  );

  return {
    membership,
    isFounder: Boolean(membership),
    calculatePrice,
  };
}
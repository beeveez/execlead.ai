import { useState, useEffect, useCallback } from "react";
import {
  getUserActiveMemberships,
  applyMembershipPricing,
  getBestMembershipDiscount,
  hasLifetimePricingProtection,
  getCombinedBenefits,
} from "@/lib/membershipEngine";

/**
 * Loads the current user's active membership programs and exposes
 * pricing helpers that layer membership discounts on top of the
 * subscription plan — without changing the plan itself.
 */
export function useUserMemberships(userId) {
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    try {
      const active = await getUserActiveMemberships(userId);
      setMemberships(active);
    } catch (e) {
      setMemberships([]);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const bestDiscount = getBestMembershipDiscount(memberships);
  const hasProtection = hasLifetimePricingProtection(memberships);
  const benefits = getCombinedBenefits(memberships);

  const priceWithMembership = useCallback(
    (basePrice) => applyMembershipPricing(basePrice, memberships),
    [memberships]
  );

  return {
    memberships,
    loading,
    refresh: load,
    bestDiscount,
    hasProtection,
    benefits,
    priceWithMembership,
    hasMemberships: memberships.length > 0,
  };
}
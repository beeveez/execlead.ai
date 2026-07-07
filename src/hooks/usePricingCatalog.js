import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { DEFAULT_CATALOG, getPricingCatalog } from "@/lib/pricingCatalog";

/**
 * Pricing catalog backed by React Query.
 * Data is cached for 5 minutes — returning to Pricing (or hovering its
 * nav link) is instant because the catalog is already in the cache.
 */
export function usePricingCatalog(initialCycle) {
  const [cycle, setCycle] = useState(initialCycle || "monthly");

  const { data: plans = DEFAULT_CATALOG, isLoading: loading } = useQuery({
    queryKey: ["pricingCatalog"],
    queryFn: async () => (await getPricingCatalog()).filter((p) => p.visible),
    staleTime: 5 * 60 * 1000,
  });

  const getPrice = useCallback((plan) => {
    if (!plan) return 0;
    return cycle === "annual" ? plan.annualPrice : plan.monthlyPrice;
  }, [cycle]);

  const getPlanById = useCallback((id) => {
    return plans.find((p) => p.id === id) || DEFAULT_CATALOG.find((p) => p.id === id);
  }, [plans]);

  return { plans, loading, cycle, setCycle, getPrice, getPlanById };
}
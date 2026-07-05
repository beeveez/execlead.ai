import { useState, useEffect, useCallback } from "react";
import { DEFAULT_CATALOG, getPricingCatalog } from "@/lib/pricingCatalog";

export function usePricingCatalog(initialCycle) {
  const [plans, setPlans] = useState(DEFAULT_CATALOG);
  const [loading, setLoading] = useState(true);
  const [cycle, setCycle] = useState(initialCycle || "monthly");

  useEffect(() => {
    let active = true;
    getPricingCatalog().then(catalog => {
      if (active) {
        setPlans(catalog.filter(p => p.visible));
        setLoading(false);
      }
    });
    return () => { active = false; };
  }, []);

  const getPrice = useCallback((plan) => {
    if (!plan) return 0;
    return cycle === "annual" ? plan.annualPrice : plan.monthlyPrice;
  }, [cycle]);

  const getPlanById = useCallback((id) => {
    return plans.find(p => p.id === id) || DEFAULT_CATALOG.find(p => p.id === id);
  }, [plans]);

  return { plans, loading, cycle, setCycle, getPrice, getPlanById };
}
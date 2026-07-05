import { useState, useEffect, useCallback } from "react";
import { useSubscription } from "@/lib/SubscriptionContext";
import { DEFAULT_FEATURES, PLAN_TIERS, getFeatureCatalog, getUpgradePlan } from "@/lib/featureCatalog";

export function useEntitlements() {
  const { profile } = useSubscription();
  const [features, setFeatures] = useState(DEFAULT_FEATURES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getFeatureCatalog().then(catalog => {
      if (active) {
        setFeatures(catalog);
        setLoading(false);
      }
    });
    return () => { active = false; };
  }, []);

  const planId = profile?.subscription_plan || "free";
  const userTier = PLAN_TIERS[planId] ?? 0;

  const hasAccess = useCallback((featureId) => {
    const f = features.find(x => x.id === featureId);
    if (!f || !f.isEnabled) return false;
    return userTier >= (PLAN_TIERS[f.minimumPlan] ?? 0);
  }, [features, userTier]);

  const getFeature = useCallback((featureId) => features.find(x => x.id === featureId), [features]);

  const getFeaturesForCurrentPlan = useCallback(() => {
    return features
      .filter(f => f.isEnabled && userTier >= (PLAN_TIERS[f.minimumPlan] ?? 0))
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [features, userTier]);

  return { hasAccess, getFeature, getFeaturesForCurrentPlan, getUpgradePlan, planId, loading };
}
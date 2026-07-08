import { useState, useEffect, useCallback } from "react";
import { useSubscription } from "@/lib/SubscriptionContext";
import { useDeveloper } from "@/lib/DeveloperContext";
import { DEFAULT_FEATURES, PLAN_TIERS, getFeatureCatalog, getUpgradePlan, normalizeFeature, isFeatureLive, isComingSoon } from "@/lib/featureCatalog";

export function useEntitlements() {
  const { profile } = useSubscription();
  const { canAccessDeveloper, developerMode, simulatedPlan, featureOverrides, impersonation, getEffectivePlan } = useDeveloper();
  const [features, setFeatures] = useState(DEFAULT_FEATURES.map(normalizeFeature));
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

  const realPlan = profile?.subscription_plan || "free";
  const planId = getEffectivePlan(realPlan);
  const userTier = PLAN_TIERS[planId] ?? 0;
  const isSimulating = Boolean(simulatedPlan || impersonation);

  const hasAccess = useCallback((featureId) => {
    // Feature simulator explicit override takes precedence
    if (featureOverrides[featureId] !== undefined) {
      return featureOverrides[featureId];
    }
    // When simulating a plan, use plan-based checks to reflect the simulated tier
    if (isSimulating) {
      const f = features.find(x => x.id === featureId);
      if (!f || !f.isEnabled || !isFeatureLive(f) || isComingSoon(f)) return false;
      return userTier >= (PLAN_TIERS[f.minimumPlan] ?? 0);
    }
    // Developer mode / super admin → unlock all
    if (developerMode || canAccessDeveloper) return true;
    // Normal plan-based check
    const f = features.find(x => x.id === featureId);
    if (!f || !f.isEnabled || !isFeatureLive(f) || isComingSoon(f)) return false;
    return userTier >= (PLAN_TIERS[f.minimumPlan] ?? 0);
  }, [features, userTier, canAccessDeveloper, developerMode, isSimulating, featureOverrides]);

  const checkComingSoon = useCallback((featureId) => {
    const f = features.find(x => x.id === featureId);
    return f ? isComingSoon(f) : false;
  }, [features]);

  const getFeature = useCallback((featureId) => features.find(x => x.id === featureId), [features]);

  const getFeaturesForCurrentPlan = useCallback(() => {
    return features
      .filter(f => f.isEnabled && isFeatureLive(f) && !isComingSoon(f) && userTier >= (PLAN_TIERS[f.minimumPlan] ?? 0))
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [features, userTier]);

  return { hasAccess, getFeature, getFeaturesForCurrentPlan, getUpgradePlan, planId, loading, isComingSoon: checkComingSoon };
}
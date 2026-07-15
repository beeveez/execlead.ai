import { useState, useEffect, useCallback } from "react";
import { useSubscription } from "@/lib/SubscriptionContext";
import { useDeveloper } from "@/lib/DeveloperContext";
import { DEFAULT_FEATURES, PLAN_TIERS, getFeatureCatalog, getUpgradePlan, normalizeFeature, isFeatureLive, isComingSoon } from "@/lib/featureCatalog";

export function useEntitlements() {
  const { profile, membership, subscription } = useSubscription();
  const { canAccessDeveloper, developerMode, simulatedPlan, featureOverrides, impersonation } = useDeveloper();
  const [features, setFeatures] = useState(DEFAULT_FEATURES.map(normalizeFeature));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const timeout = setTimeout(() => {
      if (active) setLoading(false);
    }, 5000);
    getFeatureCatalog()
      .then(catalog => {
        if (active) {
          setFeatures(catalog);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; clearTimeout(timeout); };
  }, []);

  // Plan comes from the Subscription Service (backend-resolved), not profile.subscription_plan.
  // subscription.planTier already has developer simulation applied by SubscriptionContext.
  const planId = subscription?.planTier || "free";
  const userTier = PLAN_TIERS[planId] ?? 0;
  const isSimulating = Boolean(simulatedPlan || impersonation);

  // ============================================================
  // EFFECTIVE ENTITLEMENTS — computed from independent sources.
  //
  //   Effective Entitlements =
  //     Subscription Features
  //     + Founder Benefits          (permanent, NOT plan-gated)
  //     + Organization Entitlements
  //     + Purchased Add-ons
  //     + Developer Overrides
  //
  // Subscription Plan and Founder Status are SEPARATE concerns.
  // A Founding Member on the Free plan does NOT automatically
  // unlock Professional or Executive features. Founder Benefits
  // are permanent account entitlements (badge, portal, lifetime
  // 25% discount, price protection, early/beta access, community,
  // referral program, founder rewards) that sit alongside — not
  // inside — the subscription plan.
  // ============================================================
  const founderStatus = {
    isFounder: Boolean(membership),
    name: membership?.name || null,
    discount: membership?.discount || 0,
    hasPriceProtection: membership?.hasPriceProtection ?? false,
    isLifetime: membership?.isLifetime ?? false,
    since: membership?.since || null,
  };

  const organizationEntitlements = {
    hasOrg: Boolean(profile?.organization_id),
    orgId: profile?.organization_id || null,
  };

  const entitlementSources = {
    subscription: { planId, tier: userTier },
    founder: founderStatus,
    organization: organizationEntitlements,
    developer: { canAccessDeveloper, developerMode, isSimulating },
  };

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
    // Backend-computed entitlements (primary source — never hardcode plan names)
    if (subscription?.featureEntitlements?.length > 0) {
      return subscription.featureEntitlements.includes(featureId);
    }
    // Fallback: plan-based check
    const f = features.find(x => x.id === featureId);
    if (!f || !f.isEnabled || !isFeatureLive(f) || isComingSoon(f)) return false;
    return userTier >= (PLAN_TIERS[f.minimumPlan] ?? 0);
  }, [features, userTier, canAccessDeveloper, developerMode, isSimulating, featureOverrides, subscription?.featureEntitlements]);

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

  return { hasAccess, getFeature, getFeaturesForCurrentPlan, getUpgradePlan, planId, loading, isComingSoon: checkComingSoon, founderStatus, entitlementSources };
}
import { useSubscription } from "@/lib/SubscriptionContext";
import { useAuth } from "@/lib/AuthContext";
import { PLAN_TIERS } from "@/lib/featureCatalog";

/**
 * usePlanTier — lightweight plan-level access check.
 *
 * Returns hasPro / hasExec / hasEnterprise booleans based on the
 * user's effective subscription tier. Admins bypass all gates.
 *
 * Use this for sub-module gating where a full Feature entry in the
 * catalog doesn't exist (e.g. "Reputation History" within the
 * Reputation page). For top-level route features, prefer
 * useEntitlements().hasAccess(featureId) instead.
 */
export function usePlanTier() {
  const { subscription } = useSubscription();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const planId = subscription?.planTier || 'free';
  const tier = PLAN_TIERS[planId] ?? 0;
  return {
    hasPro: isAdmin || tier >= PLAN_TIERS.professional,
    hasExec: isAdmin || tier >= PLAN_TIERS.executive,
    hasEnterprise: isAdmin || tier >= PLAN_TIERS.enterprise,
    planId,
    tier,
  };
}
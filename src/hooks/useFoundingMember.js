import { useSubscription } from "@/lib/SubscriptionContext";

/**
 * Founder hook — derives member data EXCLUSIVELY from the centralized
 * Entitlement Service (via SubscriptionContext).
 *
 * `member` is non-null ONLY when founderPortalEnabled is true, meaning:
 *   1. Active FoundingMember record exists
 *   2. purchase_verified === true && payment_status === "paid"
 *   3. Subscription is Professional or Executive
 *
 * This hook NEVER queries the FoundingMember entity directly.
 */
export function useFoundingMember() {
  const { entitlements, loading, refreshProfile } = useSubscription();
  const member = entitlements?.founderPortalEnabled ? entitlements.founderRecord : null;
  return { member, loading, reload: refreshProfile };
}
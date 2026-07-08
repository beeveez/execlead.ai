/**
 * EXECLEAD.AI — Entitlement Sync (Stale Flag Cleanup ONLY)
 * =========================================================
 * Runs after login (via SubscriptionContext.loadProfile).
 *
 * This function is intentionally MINIMAL. It does NOT self-heal,
 * create records, grant badges, enable entitlements, or create
 * certificates. Those actions caused false positives where stale
 * or test FoundingMember records were "healed" into full founder
 * status for users who never purchased anything.
 *
 * The ONLY action it takes: if no FoundingMember record exists but
 * profile.founding_member is true (stale data), it clears that flag.
 *
 * Real founder status is granted exclusively by
 * grantFoundingMembership() after a verified payment, and validated
 * by getUserEntitlements() on every read.
 */
import { base44 } from "@/api/base44Client";

export async function syncFounderEntitlements(user, profile) {
  if (!user?.id) return { synced: false, rebuilt: [], member: null };

  let member = null;
  try {
    const existing = await base44.entities.FoundingMember.filter({ user_id: user.id });
    member = existing.length > 0 ? existing[0] : null;
  } catch (e) {}

  const rebuilt = [];

  // No record + stale profile flag → clear the flag. That's it.
  if (!member && profile?.founding_member && profile?.id) {
    try {
      await base44.entities.UserProfile.update(profile.id, {
        founding_member: false,
        founding_member_since: null,
      });
      rebuilt.push("cleared_stale_founder_flag");
    } catch (e) {}
  }

  return { synced: rebuilt.length > 0, rebuilt, member };
}
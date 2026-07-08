/**
 * EXECLEAD.AI — Entitlement Sync & Self-Healing Engine
 * ------------------------------------------------------
 * Verifies and rebuilds missing Founder entitlements automatically.
 *
 * Runs after login (via SubscriptionContext.loadProfile), after
 * payment webhooks, and after subscription updates — no manual
 * intervention required.
 *
 * Consistency checklist:
 *   ✓ Founder Profile (FoundingMember record)
 *   ✓ Profile Flag (profile.founding_member)
 *   ✓ Entitlements (all benefits enabled)
 *   ✓ Lifetime Discount
 *   ✓ Protected Pricing
 *   ✓ Founder Badge
 *   ✓ Referral Code
 *   ✓ Founder Certificate
 */
import { base44 } from "@/api/base44Client";
import { grantFoundingMembership, FOUNDING_MEMBER_CONFIG } from "@/lib/foundingMember";
import { generateReferralCode, ensureReferralCode } from "@/lib/referralEngine";

const REQUIRED_ENTITLEMENTS = {
  lifetime_discount_enabled: true,
  protected_pricing: true,
  badge_status: "granted",
  early_access_enabled: true,
  community_access: true,
  beta_access: true,
  roadmap_voting: true,
  feedback_sessions: true,
};

/**
 * Verify and rebuild missing Founder entitlements for a user.
 *
 * @param {object} user — Current user (from AuthContext)
 * @param {object} profile — UserProfile record
 * @returns {Promise<{synced: boolean, rebuilt: string[], member: object|null}>}
 */
export async function syncFounderEntitlements(user, profile) {
  if (!user?.id) return { synced: false, rebuilt: [], member: null };

  const rebuilt = [];
  let member = null;

  // Load existing FoundingMember record
  try {
    const existing = await base44.entities.FoundingMember.filter({ user_id: user.id });
    member = existing.length > 0 ? existing[0] : null;
  } catch (e) {}

  // Not a founding member and no record → nothing to sync
  if (!member && !profile?.founding_member) {
    return { synced: false, rebuilt: [], member: null };
  }

  // CHECK 1: Founder Profile missing but profile flag set → rebuild
  if (!member && profile?.founding_member) {
    await grantFoundingMembership(user, profile);
    rebuilt.push("founder_profile");
    try {
      const reloaded = await base44.entities.FoundingMember.filter({ user_id: user.id });
      member = reloaded.length > 0 ? reloaded[0] : null;
    } catch (e) {}
  }

  if (!member) return { synced: rebuilt.length > 0, rebuilt, member: null };

  // CHECK 2: Profile flag missing but record exists → fix profile
  if (!profile?.founding_member && profile?.id) {
    try {
      await base44.entities.UserProfile.update(profile.id, {
        founding_member: true,
        founding_member_since: member.joined_date || new Date().toISOString(),
      });
      rebuilt.push("profile_flag");
    } catch (e) {}
  }

  // CHECK 3: Lifetime discount misconfigured → fix
  if (!member.lifetime_discount_enabled || member.lifetime_discount_percentage !== FOUNDING_MEMBER_CONFIG.discountPercent) {
    try {
      member = await base44.entities.FoundingMember.update(member.id, {
        lifetime_discount_enabled: true,
        lifetime_discount_percentage: FOUNDING_MEMBER_CONFIG.discountPercent,
      });
      rebuilt.push("lifetime_discount");
    } catch (e) {}
  }

  // CHECK 4: Protected pricing disabled → enable
  if (!member.protected_pricing) {
    try {
      member = await base44.entities.FoundingMember.update(member.id, { protected_pricing: true });
      rebuilt.push("protected_pricing");
    } catch (e) {}
  }

  // CHECK 5: Badge not granted → grant
  if (member.badge_status !== "granted") {
    try {
      member = await base44.entities.FoundingMember.update(member.id, {
        badge_status: "granted",
        badge_issued_date: member.badge_issued_date || new Date().toISOString().split("T")[0],
      });
      rebuilt.push("founder_badge");
    } catch (e) {}
  }

  // CHECK 6: Missing entitlements → enable all
  const missingEntitlements = {};
  let needsEntitlementFix = false;
  for (const [key, value] of Object.entries(REQUIRED_ENTITLEMENTS)) {
    if (key === "badge_status") continue; // already checked above
    if (member[key] !== value) {
      missingEntitlements[key] = value;
      needsEntitlementFix = true;
    }
  }
  if (needsEntitlementFix) {
    try {
      member = await base44.entities.FoundingMember.update(member.id, missingEntitlements);
      rebuilt.push("entitlements");
    } catch (e) {}
  }

  // CHECK 7: Referral code not registered → register (idempotent)
  const referralCode = generateReferralCode(user.id);
  if (referralCode) {
    await ensureReferralCode(user.id, referralCode);
    rebuilt.push("referral_code");
  }

  // CHECK 8: Founder certificate missing → generate
  try {
    const certs = await base44.entities.Certificate.filter({ course_id: "founding_member" });
    const userName = user.full_name || user.email || "";
    const hasCert = certs.some(c => c.user_name === userName);
    if (!hasCert) {
      await base44.entities.Certificate.create({
        certificate_id: `FM-CERT-${String(Date.now()).slice(-8)}`,
        course_id: "founding_member",
        course_name: "Founding Member Certificate",
        user_name: userName,
        completion_date: new Date().toISOString().split("T")[0],
        verification_url: `${window.location.origin}/founder/certificates`,
      });
      // Mark certificate as issued on the member record
      if (!member.certificate_issued) {
        try {
          member = await base44.entities.FoundingMember.update(member.id, {
            certificate_issued: true,
            certificate_issued_date: new Date().toISOString().split("T")[0],
          });
        } catch (e) {}
      }
      rebuilt.push("founder_certificate");
    }
  } catch (e) {}

  return { synced: rebuilt.length > 0, rebuilt, member };
}
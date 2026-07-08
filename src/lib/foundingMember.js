import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { enrollUserInProgram } from "@/lib/membershipEngine";
import { generateReferralCode, ensureReferralCode } from "@/lib/referralEngine";

// ============================================================
// FOUNDING MEMBER PROGRAM — Configuration & Helpers
// A limited-time launch program rewarding the earliest
// supporters of EXECLEAD.AI with exclusive lifetime benefits.
// ============================================================

export const FOUNDING_MEMBER_CONFIG = {
  endDate: new Date("2026-12-31T23:59:59").getTime(),
  discountPercent: 25,
  maxMembers: 500,
};

export const FOUNDING_MEMBER_BENEFITS = [
  {
    icon: "🏅",
    title: "Lifetime Founding Member Badge",
    description: "Receive a permanent Founding Member badge displayed on your EXECLEAD.AI profile. Your badge represents your contribution as one of the platform's earliest supporters.",
  },
  {
    icon: "💰",
    title: "25% Lifetime Discount",
    description: "Lock in a 25% discount for life while your subscription remains active. Your discounted pricing is protected even if subscription prices increase in the future.",
  },
  {
    icon: "🚀",
    title: "Early Access",
    description: "Get priority access to new features before public release — Leadership DNA™, Executive Council™, Board Meeting Simulator, AI Leadership Agents, and Executive Analytics.",
  },
  {
    icon: "💡",
    title: "Influence Product Development",
    description: "Submit feature requests, vote on future capabilities, and help shape the roadmap of EXECLEAD.AI.",
  },
  {
    icon: "🤝",
    title: "Exclusive Founding Member Community",
    description: "Access a private community of ambitious professionals, managers, executives, and industry leaders. Network, collaborate, and learn from fellow founding members.",
  },
  {
    icon: "🎙",
    title: "Founder Feedback Sessions",
    description: "Receive invitations to exclusive roadmap previews, live demonstrations, beta testing, and product feedback sessions. Your insights directly influence the future of EXECLEAD.AI.",
  },
];

export const FOUNDING_MEMBER_TERMS = [
  "Lifetime discount applies while the subscription remains active.",
  "Benefits are non-transferable.",
  "Founding Member badge remains permanently attached to the member profile.",
  "Future exclusive rewards may be added for Founding Members.",
];

const TOOLTIP_TEXT = "One of the original EXECLEAD.AI members who joined during our founding launch.";
export { TOOLTIP_TEXT as FOUNDING_MEMBER_TOOLTIP };

export function useFoundingMemberCountdown() {
  const [timeLeft, setTimeLeft] = useState(Math.max(0, FOUNDING_MEMBER_CONFIG.endDate - Date.now()));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(Math.max(0, FOUNDING_MEMBER_CONFIG.endDate - Date.now()));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const expired = timeLeft === 0;
  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, expired };
}

export function isProgramActive() {
  return Date.now() < FOUNDING_MEMBER_CONFIG.endDate;
}

export function isFoundingMember(profile) {
  return profile?.founding_member === true;
}

export function getFoundingMemberPrice(amount) {
  return Math.round(amount * (1 - FOUNDING_MEMBER_CONFIG.discountPercent / 100) * 100) / 100;
}

export function getFoundingMemberSavings(amount) {
  return Math.round((amount - getFoundingMemberPrice(amount)) * 100) / 100;
}

export function formatFoundingMemberDate(date) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export const FOUNDING_MEMBER_TIERS = {
  founding_member: "Founding Member",
  investor_member: "Investor Member",
  enterprise_founder: "Enterprise Founder",
  advisory_council: "Advisory Council",
  ambassador: "Ambassador",
  partner_founder: "Partner Founder",
};

export const FOUNDING_MEMBER_STATUSES = {
  pending: "Pending",
  verified: "Verified",
  active: "Active",
  suspended: "Suspended",
  expired: "Expired",
  legacy: "Legacy",
  lifetime: "Lifetime",
};

// ============================================================
// GRANT FOUNDING MEMBERSHIP
// Called after a successful founding member checkout. Creates
// the FoundingMember record, enrolls the user in the Founding
// Member membership program, updates the profile flags, and
// sends a confirmation notification. Idempotent — safe to call
// multiple times (returns early if already a founding member).
// ============================================================
export async function grantFoundingMembership(user, profile) {
  if (!user?.id) return null;

  // Idempotency check — don't create duplicates
  try {
    const existing = await base44.entities.FoundingMember.filter({ user_id: user.id });
    if (existing.length > 0) return existing[0];
  } catch (e) {}

  const memberNumber = `FM-${String(Date.now()).slice(-6)}`;
  const today = new Date().toISOString().split("T")[0];

  // 1. Create FoundingMember record with all entitlements enabled
  await base44.entities.FoundingMember.create({
    founding_member_number: memberNumber,
    user_id: user.id,
    full_name: user.full_name || user.email || "",
    email: user.email || "",
    joined_date: today,
    founding_batch: "Batch #1",
    founding_tier: "founding_member",
    status: "active",
    subscription_plan: profile?.subscription_plan || "free",
    lifetime_discount_percentage: FOUNDING_MEMBER_CONFIG.discountPercent,
    lifetime_discount_enabled: true,
    protected_pricing: true,
    badge_status: "granted",
    badge_issued_date: today,
    early_access_enabled: true,
    community_access: true,
    beta_access: true,
    roadmap_voting: true,
    feedback_sessions: true,
    certificate_issued: true,
    certificate_issued_date: today,
  });

  // 2. Enroll in the Founding Member membership program (if it exists)
  try {
    const programs = await base44.entities.MembershipProgram.filter({ program_type: "founding_member" });
    if (programs.length > 0) {
      await enrollUserInProgram({
        program: programs[0],
        user,
        assignedBy: { id: user.id, name: user.full_name || user.email || "" },
      });
    }
  } catch (e) {}

  // 3. Update user profile with founding member flags
  if (profile?.id) {
    await base44.entities.UserProfile.update(profile.id, {
      founding_member: true,
      founding_member_since: new Date().toISOString(),
    });
  }

  // 4. Generate and register referral code (idempotent)
  try {
    const referralCode = generateReferralCode(user.id);
    if (referralCode) {
      await ensureReferralCode(user.id, referralCode);
    }
  } catch (e) {}

  // 5. Generate founder certificate
  try {
    await base44.entities.Certificate.create({
      certificate_id: `FM-CERT-${String(Date.now()).slice(-8)}`,
      course_id: "founding_member",
      course_name: "Founding Member Certificate",
      user_name: user.full_name || user.email || "",
      completion_date: today,
      verification_url: `${window.location.origin}/founder/certificates`,
    });
  } catch (e) {}

  // 6. Create a scoped notification for the user
  try {
    await base44.entities.Notification.create({
      type: "subscription",
      title: "Founding Member Status Activated",
      message: "Welcome to the Founding Member Program! Your lifetime benefits and 25% discount are now active.",
      icon: "🏆",
      action_url: "/founder",
      user_id: user.id,
      organization_id: "",
      workspace: "executive",
      visibility: "private",
      role_scope: "",
      read: false,
    });
  } catch (e) {}

  return { granted: true, memberNumber };
}
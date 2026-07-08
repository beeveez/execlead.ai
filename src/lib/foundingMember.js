import { useState, useEffect } from "react";

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
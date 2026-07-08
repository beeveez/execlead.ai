/**
 * EXECLEAD.AI — Referral & Affiliate Engine
 * ------------------------------------------
 * Central client-side engine for referral code generation, attribution
 * (90-day cookie, last-click wins), commission calculation, fraud
 * detection, stats aggregation, and leaderboard ranking.
 *
 * Server-side authoritative logic lives in the processReferral backend
 * function. This lib provides the client helpers and defaults.
 */

import { base44 } from "@/api/base44Client";

export const REFERRAL_CODE_PREFIX = "EXEC";
export const COOKIE_NAME = "execlead_referral";
export const DEFAULT_COOKIE_DAYS = 90;

export const COMMISSION_STATUSES = {
  pending: { label: "Pending", color: "text-amber-400", bg: "bg-amber-500/10" },
  approved: { label: "Approved", color: "text-blue-400", bg: "bg-blue-500/10" },
  paid: { label: "Paid", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  cancelled: { label: "Cancelled", color: "text-slate-400", bg: "bg-slate-500/10" },
  refunded: { label: "Refunded", color: "text-red-400", bg: "bg-red-500/10" },
};

export const REFERRAL_EVENTS = {
  link_clicked: { label: "Link Clicked", icon: "🔗" },
  landing_viewed: { label: "Landing Viewed", icon: "👁️" },
  registration_completed: { label: "Registration", icon: "✅" },
  email_verified: { label: "Email Verified", icon: "📧" },
  subscription_started: { label: "Subscription", icon: "💳" },
  subscription_renewed: { label: "Renewal", icon: "🔄" },
  upgrade: { label: "Upgrade", icon: "⬆️" },
  downgrade: { label: "Downgrade", icon: "⬇️" },
  cancellation: { label: "Cancellation", icon: "❌" },
  refund: { label: "Refund", icon: "↩️" },
  chargeback: { label: "Chargeback", icon: "⚠️" },
};

export const REWARD_TYPES = {
  cash_commission: { label: "Cash Commission", icon: "💵" },
  subscription_credit: { label: "Subscription Credit", icon: "🎫" },
  reward_points: { label: "Reward Points", icon: "⭐" },
  founder_rewards: { label: "Founder Rewards", icon: "🏆" },
  marketplace_credits: { label: "Marketplace Credits", icon: "🛍️" },
  academy_credits: { label: "Academy Credits", icon: "🎓" },
  exclusive_badge: { label: "Exclusive Badge", icon: "🏅" },
  leaderboard_points: { label: "Leaderboard Points", icon: "📊" },
  early_feature_unlock: { label: "Early Feature Unlock", icon: "🔓" },
};

export const PAYOUT_SCHEDULES = {
  monthly: { label: "Monthly" },
  biweekly: { label: "Bi-weekly" },
  manual: { label: "Manual" },
};

/** Default platform settings (used before an admin configures them). */
export const DEFAULT_SETTINGS = {
  commission_percentage: 10,
  founding_member_bonus_percentage: 5,
  founding_member_reward_mode: "percentage_bonus",
  cookie_duration_days: 90,
  attribution_model: "last_click",
  recurring_commission_enabled: false,
  recurring_commission_percentage: 0,
  minimum_payout_threshold: 50,
  payout_schedule: "monthly",
  self_referral_blocked: true,
  duplicate_email_blocked: true,
  duplicate_ip_blocked: false,
  same_payment_method_blocked: true,
  vpn_check_enabled: false,
  referral_expiration_days: 0,
  reward_types_enabled: ["cash_commission", "subscription_credit", "reward_points", "founder_rewards"],
  is_active: true,
};

/* ------------------------------------------------------------------ */
/* REFERRAL CODE GENERATION                                           */
/* ------------------------------------------------------------------ */

/** Generate a permanent, deterministic referral code from a user ID. */
export function generateReferralCode(userId) {
  if (!userId) return null;
  const hex = userId.replace(/-/g, "").toUpperCase().slice(0, 8);
  return `${REFERRAL_CODE_PREFIX}-${hex}`;
}

/** Build the shareable referral URL. */
export function getReferralUrl(code) {
  const base = typeof window !== "undefined" ? window.location.origin : "https://execlead.ai";
  return code ? `${base}/?ref=${code}` : base;
}

/* ------------------------------------------------------------------ */
/* ATTRIBUTION — cookie + localStorage, 90-day, last-click wins      */
/* ------------------------------------------------------------------ */

function setCookie(name, value, days) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires};path=/;SameSite=Lax`;
}

function getCookie(name) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[1]) : null;
}

function detectDevice() {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent;
  if (/tablet|ipad/i.test(ua)) return "tablet";
  if (/mobi|android|iphone/i.test(ua)) return "mobile";
  return "desktop";
}

function detectBrowser() {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent;
  if (/edg/i.test(ua)) return "Edge";
  if (/chrome/i.test(ua)) return "Chrome";
  if (/firefox/i.test(ua)) return "Firefox";
  if (/safari/i.test(ua)) return "Safari";
  return "Other";
}

/**
 * Capture referral attribution from the URL (?ref= + UTM params).
 * Stores a 90-day cookie (last-click wins) + localStorage backup.
 * Fires a click event to the backend (fire-and-forget).
 * Returns the attribution object, or null if no ref param.
 */
export function captureReferralAttribution(settings) {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const code = params.get("ref");
  if (!code) return null;

  const cookieDays = settings?.cookie_duration_days || DEFAULT_COOKIE_DAYS;
  const attribution = {
    referral_code: code,
    source: params.get("utm_source") || "direct",
    utm_source: params.get("utm_source") || "",
    utm_medium: params.get("utm_medium") || "",
    utm_campaign: params.get("utm_campaign") || "",
    landing_page: window.location.pathname,
    timestamp: new Date().toISOString(),
    device: detectDevice(),
    browser: detectBrowser(),
  };

  // Last-click wins: always overwrite when a new ref is present
  setCookie(COOKIE_NAME, JSON.stringify(attribution), cookieDays);
  try { localStorage.setItem(COOKIE_NAME, JSON.stringify(attribution)); } catch (e) {}

  // Clean the URL so the ref param doesn't persist in shares
  try {
    params.delete("ref");
    const clean = params.toString();
    window.history.replaceState({}, "", window.location.pathname + (clean ? "?" + clean : ""));
  } catch (e) {}

  // Fire click event (fire-and-forget)
  fireClickEvent(attribution);

  return attribution;
}

/** Read stored attribution from cookie or localStorage. */
export function getStoredAttribution() {
  if (typeof window === "undefined") return null;
  let raw = getCookie(COOKIE_NAME);
  if (!raw) {
    try { raw = localStorage.getItem(COOKIE_NAME); } catch (e) {}
  }
  if (!raw) return null;
  try { return JSON.parse(raw); } catch (e) { return null; }
}

/** Clear stored attribution (after registration is linked). */
export function clearStoredAttribution() {
  if (typeof document !== "undefined") {
    document.cookie = `${COOKIE_NAME}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
  }
  try { localStorage.removeItem(COOKIE_NAME); } catch (e) {}
}

async function fireClickEvent(attribution) {
  try {
    await base44.functions.invoke("processReferral", {
      action: "click",
      referral_code: attribution.referral_code,
      utm_source: attribution.utm_source,
      utm_medium: attribution.utm_medium,
      utm_campaign: attribution.utm_campaign,
      landing_page: attribution.landing_page,
      device: attribution.device,
      browser: attribution.browser,
    });
  } catch (e) {}
}

/** Ensure the user's referral code is registered server-side (idempotent). */
export async function ensureReferralCode(userId, code) {
  try {
    await base44.functions.invoke("processReferral", { action: "register_code", referral_code: code });
  } catch (e) {}
}

/* ------------------------------------------------------------------ */
/* COMMISSION CALCULATION                                            */
/* ------------------------------------------------------------------ */

/**
 * Calculate commission for a purchase.
 * @param {number} amount - Subscription amount paid
 * @param {string} plan - Plan ID (free/professional/executive/enterprise)
 * @param {boolean} isFoundingMember - Whether the referrer is a founding member
 * @param {object} settings - Platform referral settings
 */
export function calculateCommission(amount, plan, isFoundingMember, settings = DEFAULT_SETTINGS) {
  if (plan === "free" || !amount || amount <= 0) {
    return { commission: 0, rate: 0, baseRate: 0, bonus: 0, bonusAmount: 0, applied: false };
  }
  const baseRate = settings.commission_percentage || 10;
  const bonus = isFoundingMember ? (settings.founding_member_bonus_percentage || 0) : 0;
  const rate = baseRate + bonus;
  const commission = Math.round(amount * rate / 100 * 100) / 100;
  const bonusAmount = Math.round(amount * bonus / 100 * 100) / 100;
  return { commission, rate, baseRate, bonus, bonusAmount, applied: true };
}

/* ------------------------------------------------------------------ */
/* FRAUD DETECTION (client-side pre-checks)                         */
/* ------------------------------------------------------------------ */

export function detectFraud({ referrerUser, inviteeEmail, inviteeUserId, settings = DEFAULT_SETTINGS }) {
  const flags = [];
  if (settings.self_referral_blocked && referrerUser?.id && inviteeUserId && referrerUser.id === inviteeUserId) {
    flags.push({ type: "self_referral", reason: "Cannot refer yourself" });
  }
  if (settings.duplicate_email_blocked && referrerUser?.email && inviteeEmail && referrerUser.email.toLowerCase() === inviteeEmail.toLowerCase()) {
    flags.push({ type: "duplicate_email", reason: "Referrer and invitee share the same email" });
  }
  return { isFraud: flags.length > 0, flags };
}

/* ------------------------------------------------------------------ */
/* STATS AGGREGATION                                                 */
/* ------------------------------------------------------------------ */

export function aggregateReferralStats(referrals = [], events = [], transactions = []) {
  const conversions = referrals.filter(r => r.status === "converted");
  const registrations = referrals.filter(r => ["registered", "verified", "converted"].includes(r.status));
  const totalClicks = events.filter(e => e.event_type === "link_clicked").length;
  const uniqueVisitors = new Set(events.filter(e => e.event_type === "link_clicked").map(e => e.ip_address || e.id)).size;

  const byPlan = {
    free: referrals.filter(r => r.converted_plan === "free").length,
    professional: conversions.filter(r => r.converted_plan === "professional").length,
    executive: conversions.filter(r => r.converted_plan === "executive").length,
    enterprise: conversions.filter(r => r.converted_plan === "enterprise").length,
  };

  const totalEarnings = transactions.reduce((s, t) => s + (t.commission_amount || 0), 0);
  const pendingEarnings = transactions.filter(t => t.status === "pending").reduce((s, t) => s + (t.commission_amount || 0), 0);
  const paidEarnings = transactions.filter(t => t.status === "paid").reduce((s, t) => s + (t.commission_amount || 0), 0);
  const rejectedEarnings = transactions.filter(t => ["cancelled", "refunded"].includes(t.status)).reduce((s, t) => s + (t.commission_amount || 0), 0);

  const verified = referrals.filter(r => r.status === "verified" || r.status === "converted").length;
  const conversionRate = registrations.length > 0 ? Math.round((conversions.length / registrations.length) * 100) : 0;

  return {
    totalClicks,
    uniqueVisitors,
    registrations: registrations.length,
    verified,
    freeUsers: byPlan.free,
    professional: byPlan.professional,
    executive: byPlan.executive,
    enterprise: byPlan.enterprise,
    conversionRate,
    totalEarnings,
    pendingEarnings,
    paidEarnings,
    rejectedEarnings,
    lifetimeReferrals: referrals.filter(r => r.status !== "code_registered").length,
  };
}

/* ------------------------------------------------------------------ */
/* LEADERBOARD                                                       */
/* ------------------------------------------------------------------ */

export function buildLeaderboard(allReferrals = [], allTransactions = []) {
  const byUser = {};
  for (const r of allReferrals) {
    if (!r.referrer_user_id || r.status === "code_registered") continue;
    if (!byUser[r.referrer_user_id]) {
      byUser[r.referrer_user_id] = {
        referrer_user_id: r.referrer_user_id,
        referrer_name: r.referrer_name || "Anonymous",
        referrals: 0,
        conversions: 0,
        enterprise: 0,
        executive: 0,
        revenue: 0,
        commission: 0,
        isFounding: false,
      };
    }
    const u = byUser[r.referrer_user_id];
    u.referrals++;
    if (r.status === "converted") {
      u.conversions++;
      u.revenue += r.subscription_amount || 0;
      u.commission += r.commission_amount || 0;
      if (r.converted_plan === "enterprise") u.enterprise++;
      if (r.converted_plan === "executive") u.executive++;
      if (r.founding_bonus_applied) u.isFounding = true;
    }
  }
  return Object.values(byUser)
    .sort((a, b) => b.commission - a.commission)
    .map((u, i) => ({ ...u, rank: i + 1, conversionRate: u.referrals > 0 ? Math.round((u.conversions / u.referrals) * 100) : 0 }));
}

/* ------------------------------------------------------------------ */
/* SETTINGS                                                           */
/* ------------------------------------------------------------------ */

export async function getReferralSettings() {
  try {
    const list = await base44.entities.ReferralSettings.list();
    return list[0] || DEFAULT_SETTINGS;
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
}
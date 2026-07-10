/**
 * EXECLEAD.AI — Executive Ambassador Program™ Engine
 * ===================================================
 * Replaces the traditional affiliate/referral model with a
 * leadership recognition program that rewards members with
 * platform value (Journey Points, EXEC™ Credits, Reputation,
 * Badges) rather than cash commissions.
 *
 * Philosophy: "Great leaders create more leaders."
 *
 * This engine provides the ambassador level progression,
 * plan-based reward tiers, impact score computation, and
 * helper functions consumed by the dashboard and backend.
 *
 * Server-side authoritative logic lives in processReferral.
 */

// ============================================================
// AMBASSADOR LEVELS — progression based on successful referrals
// ============================================================

export const AMBASSADOR_LEVELS = [
  {
    id: "explorer",
    title: "Explorer",
    minReferrals: 0,
    icon: "🌱",
    color: "#94a3b8",
    description: "Every great leader starts somewhere. Share your link to begin your ambassador journey.",
    rewards: ["Referral Link", "QR Code", "Share Card", "Basic Tracking"],
  },
  {
    id: "connector",
    title: "Connector",
    minReferrals: 5,
    icon: "🤝",
    color: "#6366f1",
    description: "You've introduced future leaders to the community. Your network is growing.",
    rewards: ["+250 Journey Points Bonus", "Connector Badge", "Profile Recognition"],
  },
  {
    id: "leadership_advocate",
    title: "Leadership Advocate",
    minReferrals: 15,
    icon: "📢",
    color: "#8b5cf6",
    description: "You're actively championing leadership development across your network.",
    rewards: ["+500 Journey Points Bonus", "Advocate Badge", "Priority Beta Access", "100 EXEC™ Credits"],
  },
  {
    id: "executive_ambassador",
    title: "Executive Ambassador",
    minReferrals: 30,
    icon: "🎯",
    color: "#a855f7",
    description: "A recognized leader in growing the executive community.",
    rewards: ["+1,000 Journey Points Bonus", "Ambassador Badge", "Exclusive Events", "200 EXEC™ Credits", "Enhanced Reputation"],
  },
  {
    id: "leadership_fellow",
    title: "Leadership Fellow",
    minReferrals: 75,
    icon: "🏅",
    color: "#f59e0b",
    description: "An elite ambassador whose impact shapes the platform's future.",
    rewards: ["+2,500 Journey Points Bonus", "Fellow Badge", "Private Community Access", "500 EXEC™ Credits", "Roadmap Voting Rights"],
  },
  {
    id: "execlead_champion",
    title: "EXECLEAD Champion",
    minReferrals: 150,
    icon: "🏆",
    color: "#f97316",
    description: "One of the platform's most influential community builders.",
    rewards: ["+5,000 Journey Points Bonus", "Champion Badge", "Quarterly Briefings", "1,000 EXEC™ Credits", "Executive Webinar Access"],
  },
  {
    id: "legacy_builder",
    title: "Legacy Builder",
    minReferrals: 300,
    icon: "👑",
    color: "#fbbf24",
    description: "The highest honor — a member whose leadership impact will be remembered.",
    rewards: ["+10,000 Journey Points Bonus", "Legacy Badge", "Lifetime Recognition", "2,000 EXEC™ Credits", "Dedicated Success Session", "Executive Legacy Entry"],
  },
];

// ============================================================
// PLAN-BASED REWARD TIERS — non-cash platform value rewards
// ============================================================

export const PLAN_REWARDS = {
  free: {
    label: "Free Plan Rewards",
    referrer: {
      journeyPoints: 100,
      execCredits: 50,
      simulationCredits: 1,
      professionalTrialDays: 7,
      reputation: 5,
    },
    invitee: {
      journeyPoints: 100,
      execCredits: 25,
      professionalTrialDays: 7,
      badge: "Welcome Badge",
    },
  },
  professional: {
    label: "Professional Plan Rewards",
    referrer: {
      journeyPoints: 200,
      execCredits: 100,
      reputation: 10,
      professionalExtensionDays: 14,
      priorityBetaAccess: true,
    },
    invitee: {
      professionalTrialDays: 14,
      journeyPoints: 50,
      badge: "Journey Bonus",
    },
  },
  executive: {
    label: "Executive Plan Rewards",
    referrer: {
      journeyPoints: 300,
      reputation: 20,
      executiveBadgeProgress: true,
      webinarAccess: true,
      execCredits: 150,
      earlyFeatureAccess: true,
    },
    invitee: {
      executiveTrialDays: 14,
      journeyPoints: 50,
      badge: "Journey Bonus",
    },
  },
  enterprise: {
    label: "Enterprise Referral Rewards",
    referrer: {
      organizationCredits: true,
      seatDiscounts: true,
      additionalTrialSeats: 2,
      workshopInvitations: true,
      customerSuccessSession: true,
      enterpriseRecognition: true,
    },
    invitee: {
      enterpriseTrialDays: 30,
      organizationOnboarding: true,
    },
  },
};

// ============================================================
// FOUNDER MULTIPLIER — applied to all reward values
// ============================================================

export const FOUNDER_MULTIPLIER = 1.5;
export const FOUNDER_BADGES = ["Exclusive Founder Badge", "Lifetime Recognition", "Priority Roadmap Access", "Private Founder Community", "Quarterly Founder Briefings"];

// ============================================================
// JOURNEY MILESTONES — achievements for referral counts
// ============================================================

export const REFERRAL_MILESTONES = [
  { count: 1, title: "Introduced First Leader", icon: "🌟", journeyPoints: 100, achievement: "first_referral" },
  { count: 5, title: "Executive Connector", icon: "🤝", journeyPoints: 250, achievement: "connector" },
  { count: 15, title: "Community Builder", icon: "🏗️", journeyPoints: 500, achievement: "community_builder" },
  { count: 30, title: "Leadership Advocate", icon: "📢", journeyPoints: 1000, achievement: "leadership_advocate" },
  { count: 75, title: "Executive Ambassador", icon: "🎯", journeyPoints: 2500, achievement: "executive_ambassador" },
  { count: 150, title: "EXECLEAD Champion", icon: "🏆", journeyPoints: 5000, achievement: "champion" },
  { count: 300, title: "Legacy Builder", icon: "👑", journeyPoints: 10000, achievement: "legacy_builder" },
];

// ============================================================
// ANTI-FRAUD RULES
// ============================================================

export const FRAUD_RULES = {
  self_referral: { label: "Self Referral", severity: "high" },
  duplicate_email: { label: "Duplicate Email", severity: "high" },
  duplicate_account: { label: "Duplicate Account", severity: "high" },
  temporary_email: { label: "Temporary Email", severity: "medium" },
  vpn_abuse: { label: "VPN Abuse", severity: "medium" },
  fake_account: { label: "Fake Account", severity: "high" },
  referral_loop: { label: "Referral Loop", severity: "high" },
  suspicious_activity: { label: "Suspicious Activity", severity: "medium" },
};

export const TEMP_EMAIL_DOMAINS = [
  "mailinator.com", "guerrillamail.com", "10minutemail.com", "tempmail.com",
  "throwaway.email", "temp-mail.org", "fakeinbox.com", "sharklasers.com",
  "yopmail.com", "getnada.com", "trashmail.com", "maildrop.cc",
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/** Resolve the ambassador level for a given referral count. */
export function getAmbassadorLevel(referralCount) {
  let level = AMBASSADOR_LEVELS[0];
  for (const l of AMBASSADOR_LEVELS) {
    if (referralCount >= l.minReferrals) level = l;
  }
  return level;
}

/** Get the next level and progress info. */
export function getAmbassadorProgress(referralCount) {
  const current = getAmbassadorLevel(referralCount);
  const currentIdx = AMBASSADOR_LEVELS.findIndex(l => l.id === current.id);
  const next = AMBASSADOR_LEVELS[currentIdx + 1] || null;

  if (!next) {
    return {
      current,
      next: null,
      progress: 100,
      referralsToNext: 0,
      referralsInLevel: referralCount - current.minReferrals,
      levelSpan: 0,
    };
  }

  const levelSpan = next.minReferrals - current.minReferrals;
  const referralsInLevel = referralCount - current.minReferrals;
  const progress = Math.min(100, Math.round((referralsInLevel / levelSpan) * 100));
  const referralsToNext = next.minReferrals - referralCount;

  return { current, next, progress, referralsToNext, referralsInLevel, levelSpan };
}

/** Get plan-based rewards for a successful referral, applying founder multiplier. */
export function getRewardsForPlan(plan, isFoundingMember) {
  const base = PLAN_REWARDS[plan] || PLAN_REWARDS.free;
  if (!isFoundingMember) return { ...base, multiplier: 1 };

  const multiplier = FOUNDER_MULTIPLIER;
  const applyMult = (v) => (typeof v === "number" ? Math.round(v * multiplier) : v);

  return {
    label: base.label + " (Founder 1.5×)",
    referrer: Object.fromEntries(
      Object.entries(base.referrer).map(([k, v]) => [k, applyMult(v)])
    ),
    invitee: base.invitee,
    multiplier,
    founderBadges: FOUNDER_BADGES,
  };
}

/** Compute the Executive Impact Score from referral data. */
export function computeImpactScore(referrals = []) {
  const successful = referrals.filter(r => ["registered", "verified", "converted"].includes(r.status));
  const converted = referrals.filter(r => r.status === "converted");
  const enterprise = converted.filter(r => r.converted_plan === "enterprise");
  const executive = converted.filter(r => r.converted_plan === "executive");
  const professional = converted.filter(r => r.converted_plan === "professional");

  const peopleIntroduced = successful.length;
  const paidMembersGenerated = converted.length;
  const organizationsReferred = enterprise.length;

  // Weighted impact: each tier contributes more
  const leadershipInfluence = Math.min(100, Math.round(
    peopleIntroduced * 2 + professional.length * 3 + executive.length * 5 + enterprise.length * 8
  ));

  const communityContribution = Math.min(100, Math.round(peopleIntroduced * 3.5));

  // Lifetime referral impact estimate
  const lifetimeImpact = peopleIntroduced * 100 + paidMembersGenerated * 250 + organizationsReferred * 1000;

  return {
    peopleIntroduced,
    professionalsMentored: professional.length + executive.length,
    organizationsReferred,
    paidMembersGenerated,
    leadershipInfluence,
    communityContribution,
    lifetimeImpact,
  };
}

/** Check if a milestone was reached for a given count. */
export function getReachedMilestones(referralCount) {
  return REFERRAL_MILESTONES.filter(m => referralCount >= m.count);
}

/** Check for the next milestone. */
export function getNextMilestone(referralCount) {
  return REFERRAL_MILESTONES.find(m => referralCount < m.count) || null;
}

/** Detect temporary email domains. */
export function isTemporaryEmail(email) {
  if (!email) return false;
  const domain = email.split("@")[1]?.toLowerCase();
  return TEMP_EMAIL_DOMAINS.includes(domain);
}

/** Language helpers — never use "affiliate" or "commission" terminology. */
export const AMBASSADOR_LANGUAGE = {
  referral: "Leadership Introduction",
  referrals: "Leadership Introductions",
  commission: "Leadership Impact",
  affiliate: "Ambassador",
  recruiter: "Community Builder",
  sales: "Community Growth",
  earnings: "Platform Value Earned",
  payout: "Reward Redemption",
};
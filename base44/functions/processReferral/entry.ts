import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ============================================================
// EXECUTIVE AMBASSADOR PROGRAM™ — Backend Rewards Engine
// ============================================================
// Replaces cash commissions with platform value rewards:
// Journey Points, EXEC™ Credits, Reputation, Badges, Trials.
//
// Philosophy: "Great leaders create more leaders."
// This is a leadership recognition program, NOT an affiliate
// marketing program. No cash commissions are calculated.
// ============================================================

const FOUNDER_MULTIPLIER = 1.5;

const PLAN_REWARDS = {
  free: { referrer: { journeyPoints: 100, execCredits: 50, simulationCredits: 1, professionalTrialDays: 7, reputation: 5 }, invitee: { journeyPoints: 100, execCredits: 25, professionalTrialDays: 7, badge: "Welcome Badge" } },
  professional: { referrer: { journeyPoints: 200, execCredits: 100, reputation: 10, professionalExtensionDays: 14, priorityBetaAccess: true }, invitee: { professionalTrialDays: 14, journeyPoints: 50, badge: "Journey Bonus" } },
  executive: { referrer: { journeyPoints: 300, reputation: 20, executiveBadgeProgress: true, webinarAccess: true, execCredits: 150, earlyFeatureAccess: true }, invitee: { executiveTrialDays: 14, journeyPoints: 50, badge: "Journey Bonus" } },
  enterprise: { referrer: { organizationCredits: true, seatDiscounts: true, additionalTrialSeats: 2, workshopInvitations: true, customerSuccessSession: true, enterpriseRecognition: true }, invitee: { enterpriseTrialDays: 30, organizationOnboarding: true } },
};

const AMBASSADOR_LEVELS = [
  { id: "explorer", title: "Explorer", minReferrals: 0, icon: "🌱", color: "#94a3b8" },
  { id: "connector", title: "Connector", minReferrals: 5, icon: "🤝", color: "#6366f1" },
  { id: "leadership_advocate", title: "Leadership Advocate", minReferrals: 15, icon: "📢", color: "#8b5cf6" },
  { id: "executive_ambassador", title: "Executive Ambassador", minReferrals: 30, icon: "🎯", color: "#a855f7" },
  { id: "leadership_fellow", title: "Leadership Fellow", minReferrals: 75, icon: "🏅", color: "#f59e0b" },
  { id: "execlead_champion", title: "EXECLEAD Champion", minReferrals: 150, icon: "🏆", color: "#f97316" },
  { id: "legacy_builder", title: "Legacy Builder", minReferrals: 300, icon: "👑", color: "#fbbf24" },
];

const REFERRAL_MILESTONES = [
  { count: 1, title: "Introduced First Leader", icon: "🌟", journeyPoints: 100, achievement: "first_referral" },
  { count: 5, title: "Executive Connector", icon: "🤝", journeyPoints: 250, achievement: "connector" },
  { count: 15, title: "Community Builder", icon: "🏗️", journeyPoints: 500, achievement: "community_builder" },
  { count: 30, title: "Leadership Advocate", icon: "📢", journeyPoints: 1000, achievement: "leadership_advocate" },
  { count: 75, title: "Executive Ambassador", icon: "🎯", journeyPoints: 2500, achievement: "executive_ambassador" },
  { count: 150, title: "EXECLEAD Champion", icon: "🏆", journeyPoints: 5000, achievement: "champion" },
  { count: 300, title: "Legacy Builder", icon: "👑", journeyPoints: 10000, achievement: "legacy_builder" },
];

const TEMP_EMAIL_DOMAINS = ["mailinator.com","guerrillamail.com","10minutemail.com","tempmail.com","throwaway.email","temp-mail.org","fakeinbox.com","sharklasers.com","yopmail.com","getnada.com","trashmail.com","maildrop.cc"];

function getAmbassadorLevel(count) {
  let level = AMBASSADOR_LEVELS[0];
  for (const l of AMBASSADOR_LEVELS) if (count >= l.minReferrals) level = l;
  return level;
}

function isTempEmail(email) {
  if (!email) return false;
  const domain = email.split("@")[1]?.toLowerCase();
  return TEMP_EMAIL_DOMAINS.includes(domain);
}

function applyFounderMultiplier(rewards, isFounder) {
  if (!isFounder) return rewards;
  const mult = (v) => typeof v === "number" ? Math.round(v * FOUNDER_MULTIPLIER) : v;
  return Object.fromEntries(Object.entries(rewards).map(([k, v]) => [k, mult(v)]));
}

// Grant Journey Points via JourneyEvent
async function grantJourneyPoints(base44, userId, userName, points, title, category = "network") {
  if (!points || points <= 0) return;
  try {
    await base44.asServiceRole.entities.JourneyEvent.create({
      user_id: userId,
      user_name: userName,
      event_type: "ambassador_referral",
      module: "ambassador_program",
      title,
      points,
      category,
      milestone: points >= 500,
      event_date: new Date().toISOString(),
    });
  } catch (e) {}
}

// Add reputation via ExecutiveReputation
async function grantReputation(base44, userId, userName, amount) {
  if (!amount || amount <= 0) return;
  try {
    const reps = await base44.asServiceRole.entities.ExecutiveReputation.filter({ user_id: userId }, "-created_date", 1);
    if (reps[0]) {
      const newScore = (reps[0].reputation_score || 0) + amount;
      await base44.asServiceRole.entities.ExecutiveReputation.update(reps[0].id, {
        reputation_score: newScore,
        total_contributions: (reps[0].total_contributions || 0) + 1,
        last_calculated_at: new Date().toISOString(),
      });
    }
  } catch (e) {}
}

// Send notification + email to referrer
async function notifyReferrer(base44, email, title, message, icon = "🎉") {
  try {
    if (email) {
      await base44.asServiceRole.integrations.Core.SendEmail({ to: email, subject: title, body: message });
    }
  } catch (e) {}
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { action } = body;

    // Load platform settings
    let settings = null;
    try {
      const all = await base44.asServiceRole.entities.ReferralSettings.list();
      settings = all[0] || null;
    } catch (e) {}

    async function resolveReferrer(code) {
      if (!code) return null;
      const existing = await base44.asServiceRole.entities.Referral.filter(
        { referral_code: code, status: "code_registered" }, "-created_date", 1
      );
      return existing[0] || null;
    }

    // ---- REGISTER_CODE: idempotent code→user mapping ----
    if (action === "register_code") {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
      const code = body.referral_code;
      if (!code) return Response.json({ error: "referral_code required" }, { status: 400 });
      const existing = await base44.asServiceRole.entities.Referral.filter(
        { referral_code: code, status: "code_registered" }, "-created_date", 1
      );
      if (existing[0]) return Response.json({ ok: true, existing: true });
      await base44.asServiceRole.entities.Referral.create({
        referral_code: code,
        referrer_user_id: user.id,
        referrer_name: user.full_name || user.email || "",
        referrer_email: user.email || "",
        status: "code_registered",
        commission_status: "pending",
      });
      return Response.json({ ok: true, created: true });
    }

    // ---- CLICK: public, anonymous ----
    if (action === "click") {
      const { referral_code, utm_source, utm_medium, utm_campaign, landing_page, device, browser } = body;
      if (!referral_code) return Response.json({ error: "referral_code required" }, { status: 400 });
      const referrer = await resolveReferrer(referral_code);
      await base44.asServiceRole.entities.ReferralEvent.create({
        referral_code,
        referrer_user_id: referrer?.referrer_user_id || "",
        event_type: "link_clicked",
        utm_source: utm_source || "",
        utm_medium: utm_medium || "",
        utm_campaign: utm_campaign || "",
        landing_page: landing_page || "",
        device: device || "",
        browser: browser || "",
      });
      return Response.json({ ok: true });
    }

    // ---- REGISTER: link referral to a newly registered user ----
    if (action === "register") {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
      const attribution = body.attribution || {};
      const code = attribution.referral_code;
      if (!code) return Response.json({ ok: true, message: "no attribution" });

      const referrer = await resolveReferrer(code);
      if (!referrer) return Response.json({ ok: true, message: "referrer not found" });

      // Anti-fraud: self-referral
      if (referrer.referrer_user_id === user.id) {
        await base44.asServiceRole.entities.Referral.create({
          referral_code: code, referrer_user_id: referrer.referrer_user_id,
          referrer_name: referrer.referrer_name, referrer_email: referrer.referrer_email,
          invitee_user_id: user.id, invitee_email: user.email, invitee_name: user.full_name || "",
          status: "cancelled", commission_status: "cancelled",
          fraud_flag: true, fraud_reason: "self_referral",
          registration_date: new Date().toISOString(),
        });
        return Response.json({ ok: false, fraud: true, reason: "self_referral" });
      }

      // Anti-fraud: temporary email
      if (isTempEmail(user.email)) {
        await base44.asServiceRole.entities.Referral.create({
          referral_code: code, referrer_user_id: referrer.referrer_user_id,
          referrer_name: referrer.referrer_name, referrer_email: referrer.referrer_email,
          invitee_user_id: user.id, invitee_email: user.email, invitee_name: user.full_name || "",
          status: "cancelled", commission_status: "cancelled",
          fraud_flag: true, fraud_reason: "temporary_email",
          registration_date: new Date().toISOString(),
        });
        return Response.json({ ok: false, fraud: true, reason: "temporary_email" });
      }

      // Anti-fraud: duplicate email already linked
      const dupeRefs = await base44.asServiceRole.entities.Referral.filter(
        { invitee_email: user.email }, "-created_date", 10
      );
      const alreadyLinked = dupeRefs.some(r => ["registered", "verified", "converted"].includes(r.status));
      if (alreadyLinked) {
        await base44.asServiceRole.entities.Referral.create({
          referral_code: code, referrer_user_id: referrer.referrer_user_id,
          referrer_name: referrer.referrer_name, referrer_email: referrer.referrer_email,
          invitee_user_id: user.id, invitee_email: user.email, invitee_name: user.full_name || "",
          status: "cancelled", commission_status: "cancelled",
          fraud_flag: true, fraud_reason: "duplicate_email",
          registration_date: new Date().toISOString(),
        });
        return Response.json({ ok: false, fraud: true, reason: "duplicate_email" });
      }

      // Check if already linked to this referrer
      const existing = await base44.asServiceRole.entities.Referral.filter(
        { invitee_user_id: user.id, referral_code: code }, "-created_date", 1
      );
      if (existing[0]) return Response.json({ ok: true, existing: true });

      await base44.asServiceRole.entities.Referral.create({
        referral_code: code,
        referrer_user_id: referrer.referrer_user_id,
        referrer_name: referrer.referrer_name,
        referrer_email: referrer.referrer_email,
        invitee_user_id: user.id,
        invitee_email: user.email,
        invitee_name: user.full_name || "",
        status: "registered",
        commission_status: "pending",
        source: attribution.source || "",
        landing_page: attribution.landing_page || "",
        click_date: attribution.timestamp || "",
        registration_date: new Date().toISOString(),
        device: attribution.device || "",
        browser: attribution.browser || "",
        utm_source: attribution.utm_source || "",
        utm_medium: attribution.utm_medium || "",
        utm_campaign: attribution.utm_campaign || "",
      });

      await base44.asServiceRole.entities.ReferralEvent.create({
        referral_code: code, referrer_user_id: referrer.referrer_user_id,
        event_type: "registration_completed", invitee_user_id: user.id, invitee_email: user.email,
      });

      // Notify referrer about new registration
      try {
        await base44.asServiceRole.entities.Notification.create({
          type: "social", title: "New Leadership Introduction!",
          message: (user.full_name || user.email) + " joined EXECLEAD.AI through your referral. When they activate, you'll earn Journey Points and platform rewards.",
          icon: "🌱", user_id: referrer.referrer_user_id, workspace: "all", visibility: "private",
        });
      } catch (e) {}

      await notifyReferrer(base44, referrer.referrer_email,
        "New Leadership Introduction on EXECLEAD.AI",
        "Great news! " + (user.full_name || user.email) + " joined EXECLEAD.AI through your referral link. When they activate their account, you'll earn Journey Points, EXEC™ Credits, and Executive Reputation as part of the Executive Ambassador Program™.");

      return Response.json({ ok: true, linked: true });
    }

    // ---- ACTIVATE: successful referral — grant platform value rewards ----
    if (action === "activate") {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
      const { plan } = body;
      const effectivePlan = plan || "free";

      // Find the referral record for this user
      const allRefs = await base44.asServiceRole.entities.Referral.filter(
        { invitee_user_id: user.id }, "-created_date", 10
      );
      const ref = allRefs.find(r => ["registered", "verified", "converted"].includes(r.status));
      if (!ref) return Response.json({ ok: true, message: "no referral found" });

      // Already converted — don't re-grant
      if (ref.status === "converted") return Response.json({ ok: true, existing: true });

      // Check founding member status of referrer
      let isFounder = false;
      try {
        const fmAll = await base44.asServiceRole.entities.FoundingMember.filter(
          { user_id: ref.referrer_user_id }, "-created_date", 5
        );
        isFounder = fmAll.some(f => ["active", "lifetime", "verified"].includes(f.status));
      } catch (e) {}

      // Get plan-based rewards (with founder multiplier if applicable)
      const planRewards = PLAN_REWARDS[effectivePlan] || PLAN_REWARDS.free;
      const referrerRewards = applyFounderMultiplier(planRewards.referrer, isFounder);
      const inviteeRewards = planRewards.invitee || {};

      // Update referral record as converted
      await base44.asServiceRole.entities.Referral.update(ref.id, {
        status: "converted",
        converted_plan: effectivePlan,
        purchase_date: new Date().toISOString(),
        commission_status: "approved", // Rewards approved, not cash
        reward_type: "platform_value",
      });

      // ── GRANT REFERRER REWARDS ──
      // Journey Points
      await grantJourneyPoints(base44, ref.referrer_user_id, ref.referrer_name,
        referrerRewards.journeyPoints || 0,
        `Leadership Introduction: ${ref.invitee_name || ref.invitee_email} activated`);

      // Reputation
      await grantReputation(base44, ref.referrer_user_id, ref.referrer_name,
        referrerRewards.reputation || 0);

      // ── GRANT INVITEE WELCOME REWARDS ──
      if (inviteeRewards.journeyPoints) {
        await grantJourneyPoints(base44, user.id, user.full_name || user.email,
          inviteeRewards.journeyPoints,
          "Welcome to EXECLEAD.AI — Leadership Journey begins!",
          "community");
      }

      // ── CHECK AMBASSADOR LEVEL PROGRESSION ──
      const referrerRefs = await base44.asServiceRole.entities.Referral.filter(
        { referrer_user_id: ref.referrer_user_id, status: "converted" }
      );
      const totalConverted = referrerRefs.length;
      const newLevel = getAmbassadorLevel(totalConverted);
      const prevLevel = getAmbassadorLevel(totalConverted - 1);

      let levelUp = false;
      if (newLevel.id !== prevLevel.id) {
        levelUp = true;
        // Grant level-up bonus Journey Points
        const milestone = REFERRAL_MILESTONES.find(m => m.count === totalConverted);
        if (milestone) {
          await grantJourneyPoints(base44, ref.referrer_user_id, ref.referrer_name,
            milestone.journeyPoints,
            `Ambassador Level Up: ${newLevel.title}!`,
            "level");
        }
        // Notify level-up
        try {
          await base44.asServiceRole.entities.Notification.create({
            type: "social", title: `Ambassador Level Up: ${newLevel.title}!`,
            message: `Congratulations! You've reached the ${newLevel.title} level in the Executive Ambassador Program™ with ${totalConverted} successful leadership introductions.`,
            icon: newLevel.icon, user_id: ref.referrer_user_id, workspace: "all", visibility: "private",
          });
        } catch (e) {}

        await notifyReferrer(base44, ref.referrer_email,
          `Ambassador Level Up: ${newLevel.title}!`,
          `Congratulations! You've reached the ${newLevel.title} level in the Executive Ambassador Program™. You've successfully introduced ${totalConverted} future leaders to EXECLEAD.AI. ${isFounder ? "Your Founding Member 1.5× multiplier was applied to all rewards." : ""}`);
      }

      // ── NOTIFY REFERRER ABOUT ACTIVATION ──
      try {
        await base44.asServiceRole.entities.Notification.create({
          type: "social", title: "Leadership Introduction Activated!",
          message: `${ref.invitee_name || ref.invitee_email} activated their account! You earned ${referrerRewards.journeyPoints || 0} Journey Points${referrerRewards.reputation ? `, +${referrerRewards.reputation} Reputation` : ""}${referrerRewards.execCredits ? `, ${referrerRewards.execCredits} EXEC™ Credits` : ""}.`,
          icon: "🎯", user_id: ref.referrer_user_id, workspace: "all", visibility: "private",
        });
      } catch (e) {}

      // Event
      await base44.asServiceRole.entities.ReferralEvent.create({
        referral_code: ref.referral_code, referrer_user_id: ref.referrer_user_id,
        event_type: "subscription_started", invitee_user_id: user.id, invitee_email: user.email,
      });

      // Build reward summary
      const rewardSummary = {
        referrer: {
          journeyPoints: referrerRewards.journeyPoints || 0,
          execCredits: referrerRewards.execCredits || 0,
          reputation: referrerRewards.reputation || 0,
          founderMultiplierApplied: isFounder,
          levelUp,
          newLevel: levelUp ? newLevel.title : null,
        },
        invitee: {
          journeyPoints: inviteeRewards.journeyPoints || 0,
          badge: inviteeRewards.badge || null,
        },
      };

      return Response.json({ ok: true, rewards: rewardSummary });
    }

    // ---- ADMIN: resolve ambassador stats for a user ----
    if (action === "ambassador_stats") {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
      const { target_user_id } = body;
      const targetId = target_user_id || user.id;

      const refs = await base44.asServiceRole.entities.Referral.filter(
        { referrer_user_id: targetId, status: { $in: ["registered", "verified", "converted"] } }
      );
      const converted = refs.filter(r => r.status === "converted");
      const level = getAmbassadorLevel(converted.length);

      return Response.json({
        totalReferrals: refs.length,
        totalConverted: converted.length,
        currentLevel: level,
        isFounder: false,
      });
    }

    return Response.json({ error: "unknown action: " + (action || "(none)") }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
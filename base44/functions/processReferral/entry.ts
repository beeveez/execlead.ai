import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { action } = body;

    // Load platform settings (single record, fall back to defaults)
    let settings = null;
    try {
      const all = await base44.asServiceRole.entities.ReferralSettings.list();
      settings = all[0] || null;
    } catch (e) {}
    const cfg = {
      commission_percentage: settings?.commission_percentage ?? 10,
      founding_member_bonus_percentage: settings?.founding_member_bonus_percentage ?? 5,
      recurring_commission_enabled: settings?.recurring_commission_enabled ?? false,
      self_referral_blocked: settings?.self_referral_blocked ?? true,
      duplicate_email_blocked: settings?.duplicate_email_blocked ?? true,
      same_payment_method_blocked: settings?.same_payment_method_blocked ?? true,
      minimum_payout_threshold: settings?.minimum_payout_threshold ?? 50,
    };

    // Resolve a referral code to a referrer via the code-mapping records
    async function resolveReferrer(code) {
      if (!code) return null;
      const existing = await base44.asServiceRole.entities.Referral.filter(
        { referral_code: code, status: "code_registered" }, "-created_date", 1
      );
      return existing[0] || null;
    }

    // ---- REGISTER_CODE: idempotent code→user mapping (dashboard load) ----
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

      // Fraud: self-referral
      if (cfg.self_referral_blocked && referrer.referrer_user_id === user.id) {
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

      // Fraud: duplicate email already converted
      if (cfg.duplicate_email_blocked) {
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

      // Notify referrer
      try {
        await base44.asServiceRole.entities.Notification.create({
          type: "social", title: "New Referral Registration",
          message: (user.full_name || user.email) + " signed up using your referral link!",
          icon: "🎉", user_id: referrer.referrer_user_id, workspace: "all", visibility: "private",
        });
      } catch (e) {}

      // Email referrer
      try {
        if (referrer.referrer_email) {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: referrer.referrer_email,
            subject: "New Referral Registration on EXECLEAD.AI",
            body: "Great news! " + (user.full_name || user.email) + " just signed up using your referral link. You're one step closer to earning commission.",
          });
        }
      } catch (e) {}

      return Response.json({ ok: true, linked: true });
    }

    // ---- PURCHASE: calculate commission after successful payment ----
    if (action === "purchase") {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
      const { plan, amount, stripe_customer_id, stripe_charge_id } = body;
      if (plan === "free" || !amount || amount <= 0) {
        return Response.json({ ok: true, message: "no commission on free plan" });
      }

      // Find the referral record for this user
      const allRefs = await base44.asServiceRole.entities.Referral.filter(
        { invitee_user_id: user.id }, "-created_date", 10
      );
      const ref = allRefs.find(r => ["registered", "verified", "converted"].includes(r.status));
      if (!ref) return Response.json({ ok: true, message: "no referral found" });

      // Already converted — only proceed for recurring commission
      if (ref.status === "converted" && ref.commission_status !== "cancelled") {
        if (!cfg.recurring_commission_enabled) return Response.json({ ok: true, existing: true });
      }

      // Check founding member status of referrer
      let isFounding = false;
      try {
        const fmAll = await base44.asServiceRole.entities.FoundingMember.filter(
          { user_id: ref.referrer_user_id }, "-created_date", 5
        );
        isFounding = fmAll.some(f => ["active", "lifetime", "verified"].includes(f.status));
      } catch (e) {}

      const baseRate = cfg.commission_percentage;
      const bonus = isFounding ? cfg.founding_member_bonus_percentage : 0;
      const rate = baseRate + bonus;
      const commission = Math.round(amount * rate / 100 * 100) / 100;
      const bonusAmount = Math.round(amount * bonus / 100 * 100) / 100;

      // Update referral record
      await base44.asServiceRole.entities.Referral.update(ref.id, {
        status: "converted",
        converted_plan: plan,
        subscription_amount: amount,
        commission_amount: commission,
        commission_rate: rate,
        founding_bonus_applied: isFounding,
        purchase_date: new Date().toISOString(),
        stripe_customer_id: stripe_customer_id || "",
        commission_status: "pending",
        payout_status: "pending",
      });

      // Create transaction record
      await base44.asServiceRole.entities.ReferralTransaction.create({
        referral_id: ref.id,
        referrer_user_id: ref.referrer_user_id,
        referrer_name: ref.referrer_name,
        invitee_user_id: user.id,
        invitee_name: ref.invitee_name || user.full_name || "",
        invitee_email: user.email || "",
        plan,
        subscription_amount: amount,
        commission_amount: commission,
        commission_rate: rate,
        founding_bonus_applied: isFounding,
        founding_bonus_amount: bonusAmount,
        reward_type: isFounding ? "founder_rewards" : "cash_commission",
        status: "pending",
        payout_status: "pending",
        stripe_customer_id: stripe_customer_id || "",
        stripe_charge_id: stripe_charge_id || "",
      });

      // Event
      await base44.asServiceRole.entities.ReferralEvent.create({
        referral_code: ref.referral_code, referrer_user_id: ref.referrer_user_id,
        event_type: "subscription_started", invitee_user_id: user.id, invitee_email: user.email,
      });

      // Notify referrer
      try {
        await base44.asServiceRole.entities.Notification.create({
          type: "social", title: "Commission Earned!",
          message: "You earned $" + commission + " commission from " + (user.full_name || user.email) + "'s " + plan + " subscription.",
          icon: "💰", user_id: ref.referrer_user_id, workspace: "all", visibility: "private",
        });
      } catch (e) {}

      // Email referrer
      try {
        if (ref.referrer_email) {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: ref.referrer_email,
            subject: "Commission Earned on EXECLEAD.AI",
            body: "You earned $" + commission + " commission" + (isFounding ? " (includes Founding Member bonus)" : "") + " from " + (user.full_name || user.email) + "'s " + plan + " subscription.",
          });
        }
      } catch (e) {}

      return Response.json({ ok: true, commission, rate, isFounding });
    }

    // ---- APPROVE / PAY transaction (admin only) ----
    if (action === "approve" || action === "pay") {
      const user = await base44.auth.me();
      if (!user || user.role !== "admin") {
        return Response.json({ error: "Admin only" }, { status: 403 });
      }
      const { transaction_id } = body;
      if (!transaction_id) return Response.json({ error: "transaction_id required" }, { status: 400 });

      const txns = await base44.asServiceRole.entities.ReferralTransaction.filter({ id: transaction_id });
      const txn = txns[0];
      if (!txn) return Response.json({ error: "not found" }, { status: 404 });

      const newStatus = action === "approve" ? "approved" : "paid";
      const patch = {
        status: newStatus,
        payout_status: action === "pay" ? "paid" : "queued",
      };
      if (action === "pay") patch.payout_date = new Date().toISOString();

      await base44.asServiceRole.entities.ReferralTransaction.update(transaction_id, patch);
      await base44.asServiceRole.entities.Referral.update(txn.referral_id, {
        commission_status: newStatus,
        payout_status: patch.payout_status,
      });

      return Response.json({ ok: true });
    }

    return Response.json({ error: "unknown action: " + (action || "(none)") }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
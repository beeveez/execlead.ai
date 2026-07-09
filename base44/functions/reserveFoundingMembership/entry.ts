import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const action = body.action;

    // ============================================================
    // PUBLIC — Reserve a Founding Membership spot
    // No auth required: anyone on the pricing page can reserve.
    // ============================================================
    if (action === "reserve") {
      const { full_name, email, country, preferred_plan, expected_start_date, comments, referral_source } = body;
      if (!email || !preferred_plan) {
        return Response.json({ error: "Email and preferred plan are required" }, { status: 400 });
      }

      const normalizedEmail = email.toLowerCase().trim();

      // Deduplicate — one reservation per email
      const existing = await base44.asServiceRole.entities.FoundingWaitlist.filter({ email: normalizedEmail });
      if (existing.length > 0) {
        return Response.json({
          success: true,
          already_reserved: true,
          priority_number: existing[0].priority_number,
          message: "You're already on the waitlist!",
        });
      }

      // Compute sequential priority number and founder reservation number
      const all = await base44.asServiceRole.entities.FoundingWaitlist.list("-created_date", 100000);
      const priority_number = all.length + 1;
      const year = new Date().getFullYear();
      const founding_member_number = `FM-${year}-${String(priority_number).padStart(6, "0")}`;
      const certificate_id = `CERT-FM-${year}-${String(priority_number).padStart(6, "0")}`;
      const verification_id = crypto.randomUUID();
      const pricing_expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      // Link to user account if authenticated
      let user_id = "";
      try {
        const user = await base44.auth.me();
        if (user) user_id = user.id;
      } catch (e) {}

      const reservation = await base44.asServiceRole.entities.FoundingWaitlist.create({
        user_id,
        full_name: full_name || "",
        email: normalizedEmail,
        country: country || "",
        profession: body.profession || "",
        preferred_plan,
        expected_start_date: expected_start_date || "",
        comments: comments || "",
        referral_source: referral_source || "",
        public_profile: body.public_profile || false,
        reservation_date: new Date().toISOString(),
        status: "reserved",
        priority_number,
        founding_member_number,
        certificate_id,
        verification_id,
        pricing_expires_at,
        invitation_sent: false,
        payment_completed: false,
        activated: false,
        reminder_7day_sent: false,
        reminder_3day_sent: false,
      });

      // Send confirmation email with founder reservation number + certificate
      try {
        const planLabel = ({ professional: "Professional", executive: "Executive", founding_member: "Founding Member", enterprise: "Enterprise" })[preferred_plan] || preferred_plan;
        const verifyUrl = `https://execlead.ai/verify/${verification_id}`;
        await base44.integrations.Core.SendEmail({
          to: normalizedEmail,
          subject: `🎉 Founding Membership Reserved — ${founding_member_number} — EXECLEAD.AI`,
          body: `Hi ${full_name || "there"},\n\nWelcome to EXECLEAD.AI! 🎉\n\nYour Founding Membership has been officially reserved. You are now part of EXECLEAD.AI history.\n\n══════════════════════════════════\n  FOUNDER RESERVATION CONFIRMED\n══════════════════════════════════\n\n  Founder Number: ${founding_member_number}\n  Certificate ID: ${certificate_id}\n  Preferred Plan: ${planLabel}\n  Reservation Date: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}\n  Status: Reserved\n  Reserved Pricing Expires: ${new Date(pricing_expires_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}\n\n  Lifetime Founding Benefits:\n  ✓ 25% Lifetime Discount\n  ✓ Founder Badge\n  ✓ Founder Portal Access\n  ✓ Priority Roadmap Voting\n  ✓ Exclusive Founder Events\n  ✓ Founder Community Access\n  ✓ Beta Feature Access\n  ✓ Recognition Wall\n\nVerify your certificate: ${verifyUrl}\n\nWhat happens next?\n• EXECLEAD.AI is in Public Beta — register and explore today.\n• When payments go live, you'll be the first invited to activate.\n• Your reserved pricing is locked in for 30 days.\n\n— The EXECLEAD.AI Team`,
          from_name: "EXECLEAD.AI",
        });
      } catch (e) {}

      return Response.json({ success: true, reservation, priority_number });
    }

    // ============================================================
    // PUBLIC — Verify a certificate by verification_id
    // ============================================================
    if (action === "verify") {
      const { verification_id } = body;
      if (!verification_id) return Response.json({ error: "Verification ID required" }, { status: 400 });
      const results = await base44.asServiceRole.entities.FoundingWaitlist.filter({ verification_id });
      if (results.length === 0) return Response.json({ valid: false, error: "Invalid verification ID" }, { status: 404 });
      const r = results[0];
      return Response.json({
        valid: true,
        founding_member_number: r.founding_member_number,
        certificate_id: r.certificate_id,
        full_name: r.full_name,
        preferred_plan: r.preferred_plan,
        status: r.status,
        reservation_date: r.reservation_date,
        activated: r.activated,
        activation_date: r.activation_date,
        pricing_expires_at: r.pricing_expires_at,
      });
    }

    // ============================================================
    // PUBLIC — Founder Directory (opt-in members only)
    // ============================================================
    if (action === "directory") {
      const all = await base44.asServiceRole.entities.FoundingWaitlist.filter({ public_profile: true });
      const members = all
        .filter((w) => ["reserved", "approved", "invited", "activated"].includes(w.status))
        .map((w) => ({
          founding_member_number: w.founding_member_number,
          full_name: w.full_name,
          country: w.country,
          profession: w.profession,
          reservation_date: w.reservation_date,
          status: w.status,
          preferred_plan: w.preferred_plan,
        }))
        .sort((a, b) => (a.founding_member_number || "").localeCompare(b.founding_member_number || ""));
      return Response.json({ members });
    }

    // ============================================================
    // AUTHENTICATED — Get certificate for current user
    // ============================================================
    if (action === "get_certificate") {
      const certUser = await base44.auth.me();
      if (!certUser) return Response.json({ error: "Unauthorized" }, { status: 401 });
      let results = await base44.asServiceRole.entities.FoundingWaitlist.filter({ user_id: certUser.id });
      if (results.length === 0 && certUser.email) {
        results = await base44.asServiceRole.entities.FoundingWaitlist.filter({ email: certUser.email.toLowerCase() });
      }
      if (results.length === 0) return Response.json({ error: "No reservation found" }, { status: 404 });
      return Response.json({ reservation: results[0] });
    }

    // ============================================================
    // SYSTEM — Send reminder emails (called by scheduled automation)
    // ============================================================
    if (action === "send_reminders") {
      const all = await base44.asServiceRole.entities.FoundingWaitlist.list("-created_date", 100000);
      const now = Date.now();
      let sent7 = 0, sent3 = 0, expiredCount = 0;

      for (const r of all) {
        if (!r.pricing_expires_at) continue;
        const expires = new Date(r.pricing_expires_at).getTime();
        const daysLeft = (expires - now) / (24 * 60 * 60 * 1000);

        if (daysLeft <= 0 && r.status === "reserved") {
          await base44.asServiceRole.entities.FoundingWaitlist.update(r.id, { status: "expired" });
          expiredCount++;
          continue;
        }

        if (daysLeft <= 7 && daysLeft > 3 && !r.reminder_7day_sent) {
          try {
            await base44.integrations.Core.SendEmail({
              to: r.email,
              subject: `⏰ 7 Days Left — ${r.founding_member_number} — EXECLEAD.AI`,
              body: `Hi ${r.full_name || "there"},\n\nYour founding member reservation (${r.founding_member_number}) expires in 7 days.\n\nDon't lose your reserved pricing and lifetime founding benefits!\n\nYour certificate: https://execlead.ai/verify/${r.verification_id}\n\n— The EXECLEAD.AI Team`,
              from_name: "EXECLEAD.AI",
            });
            await base44.asServiceRole.entities.FoundingWaitlist.update(r.id, { reminder_7day_sent: true });
            sent7++;
          } catch (e) {}
        }

        if (daysLeft <= 3 && daysLeft > 0 && !r.reminder_3day_sent) {
          try {
            await base44.integrations.Core.SendEmail({
              to: r.email,
              subject: `🚨 3 Days Left — Activate ${r.founding_member_number} — EXECLEAD.AI`,
              body: `Hi ${r.full_name || "there"},\n\nYour founding member reservation (${r.founding_member_number}) expires in 3 days!\n\nActivate now to secure your lifetime benefits and reserved pricing.\n\n— The EXECLEAD.AI Team`,
              from_name: "EXECLEAD.AI",
            });
            await base44.asServiceRole.entities.FoundingWaitlist.update(r.id, { reminder_3day_sent: true });
            sent3++;
          } catch (e) {}
        }
      }
      return Response.json({ success: true, sent_7day: sent7, sent_3day: sent3, expired: expiredCount });
    }

    // ============================================================
    // ADMIN ACTIONS — require admin role
    // ============================================================
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") return Response.json({ error: "Admin access required" }, { status: 403 });

    // ---- List all waitlist entries ----
    if (action === "list") {
      const waitlist = await base44.asServiceRole.entities.FoundingWaitlist.list("-created_date", 500);
      return Response.json({ waitlist });
    }

    // ---- Dashboard stats ----
    if (action === "stats") {
      const all = await base44.asServiceRole.entities.FoundingWaitlist.list("-created_date", 100000);
      const PLAN_PRICES = { professional: 29, executive: 79, founding_member: 79, enterprise: 0 };
      const total = all.length;
      const foundingReservations = all.filter((w) => w.preferred_plan === "founding_member").length;
      const manualActivations = all.filter((w) => w.activated).length;
      const conversionRate = total > 0 ? Math.round((manualActivations / total) * 100) : 0;
      const estimatedMrr = all.filter((w) => w.activated).reduce((sum, w) => sum + (PLAN_PRICES[w.assigned_plan || w.preferred_plan] || 0), 0);

      const countryMap = {};
      all.forEach((w) => { if (w.country) countryMap[w.country] = (countryMap[w.country] || 0) + 1; });
      const countryDistribution = Object.entries(countryMap)
        .map(([country, count]) => ({ country, count }))
        .sort((a, b) => b.count - a.count);

      const sourceMap = {};
      all.forEach((w) => { const s = w.referral_source || "Direct"; sourceMap[s] = (sourceMap[s] || 0) + 1; });
      const topReferralSources = Object.entries(sourceMap)
        .map(([source, count]) => ({ source, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return Response.json({
        total_waitlist: total,
        founding_reservations: foundingReservations,
        manual_activations: manualActivations,
        conversion_forecast: conversionRate,
        estimated_mrr: estimatedMrr,
        country_distribution: countryDistribution,
        top_referral_sources: topReferralSources,
      });
    }

    // ---- Approve a reservation ----
    if (action === "approve") {
      const { reservation_id } = body;
      const updated = await base44.asServiceRole.entities.FoundingWaitlist.update(reservation_id, {
        status: "approved",
        invitation_sent: true,
      });
      if (updated.email) {
        try {
          await base44.integrations.Core.SendEmail({
            to: updated.email,
            subject: "✅ Your Founding Membership is Approved — EXECLEAD.AI",
            body: `Hi ${updated.full_name || "there"},\n\nGreat news! Your Founding Membership reservation has been approved.\n\nYou'll be invited to activate your subscription when payments go live. Stay tuned!\n\n— The EXECLEAD.AI Team`,
            from_name: "EXECLEAD.AI",
          });
        } catch (e) {}
      }
      return Response.json({ success: true, reservation: updated });
    }

    // ---- Activate a subscription (manual) ----
    if (action === "activate") {
      const { reservation_id, assigned_plan, payment_method, activation_reason } = body;
      const reservation = await base44.asServiceRole.entities.FoundingWaitlist.get(reservation_id);
      if (!reservation) return Response.json({ error: "Reservation not found" }, { status: 404 });

      // Update the user's profile if they have a registered account
      if (reservation.user_id) {
        try {
          const profiles = await base44.asServiceRole.entities.UserProfile.filter({ created_by_id: reservation.user_id });
          if (profiles.length > 0) {
            await base44.asServiceRole.entities.UserProfile.update(profiles[0].id, {
              subscription_plan: assigned_plan,
              subscription_status: "active",
            });
          }
        } catch (e) {}
      }

      const updated = await base44.asServiceRole.entities.FoundingWaitlist.update(reservation_id, {
        status: "activated",
        activated: true,
        payment_completed: true,
        activation_date: new Date().toISOString(),
        activated_by_id: user.id,
        activated_by_name: user.full_name || user.email || "",
        activation_reason: activation_reason || "Manual activation",
        assigned_plan,
        payment_method: payment_method || "manual",
      });

      if (updated.email) {
        try {
          const planLabel = ({ professional: "Professional", executive: "Executive", founding_member: "Founding Member", enterprise: "Enterprise" })[assigned_plan] || assigned_plan;
          await base44.integrations.Core.SendEmail({
            to: updated.email,
            subject: "🚀 Your Subscription is Activated — EXECLEAD.AI",
            body: `Hi ${updated.full_name || "there"},\n\nYour ${planLabel} subscription has been activated!\n\nYou now have full access to EXECLEAD.AI. Start your leadership journey today.\n\n— The EXECLEAD.AI Team`,
            from_name: "EXECLEAD.AI",
          });
        } catch (e) {}
      }

      return Response.json({ success: true, reservation: updated });
    }

    // ---- Assign Founding Member status ----
    if (action === "grant_founding") {
      const { reservation_id } = body;
      const reservation = await base44.asServiceRole.entities.FoundingWaitlist.get(reservation_id);
      if (!reservation) return Response.json({ error: "Reservation not found" }, { status: 404 });

      // Idempotency — don't create duplicate founding member records
      const existingFm = await base44.asServiceRole.entities.FoundingMember.filter({ user_id: reservation.user_id || reservation.email });
      let memberNumber;
      const today = new Date().toISOString().split("T")[0];

      if (existingFm.length > 0) {
        memberNumber = existingFm[0].founding_member_number;
      } else {
        memberNumber = `FM-${String(Date.now()).slice(-6)}`;
        await base44.asServiceRole.entities.FoundingMember.create({
          founding_member_number: memberNumber,
          user_id: reservation.user_id || "",
          full_name: reservation.full_name || "",
          email: reservation.email || "",
          joined_date: today,
          founding_batch: "Batch #1",
          founding_tier: "founding_member",
          status: "active",
          subscription_plan: reservation.preferred_plan || "free",
          lifetime_discount_percentage: 25,
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
      }

      const updated = await base44.asServiceRole.entities.FoundingWaitlist.update(reservation_id, {
        founding_member_assigned: true,
        founding_member_number: memberNumber,
        status: "activated",
        activated: true,
        activation_date: new Date().toISOString(),
        activated_by_id: user.id,
        activated_by_name: user.full_name || user.email || "",
        activation_reason: "Founding member assignment",
      });

      if (updated.email) {
        try {
          await base44.integrations.Core.SendEmail({
            to: updated.email,
            subject: "🏆 Welcome, Founding Member! — EXECLEAD.AI",
            body: `Hi ${updated.full_name || "there"},\n\nCongratulations! You've been granted Founding Member status.\n\nFounding Member Number: ${memberNumber}\n\nYour lifetime benefits include:\n• 25% lifetime discount\n• Exclusive Founding Member badge\n• Early access to new features\n• Private community access\n• Roadmap voting rights\n\n— The EXECLEAD.AI Team`,
            from_name: "EXECLEAD.AI",
          });
        } catch (e) {}
      }

      return Response.json({ success: true, founding_member_number: memberNumber, reservation: updated });
    }

    // ---- Grant early access (investors, partners, advisors, pilots) ----
    if (action === "early_access") {
      const { email, full_name, plan, reason } = body;
      if (!email) return Response.json({ error: "Email is required" }, { status: 400 });

      const normalizedEmail = email.toLowerCase().trim();
      const existing = await base44.asServiceRole.entities.FoundingWaitlist.filter({ email: normalizedEmail });
      const all = await base44.asServiceRole.entities.FoundingWaitlist.list("-created_date", 100000);
      const priority_number = all.length + 1;

      let reservation;
      if (existing.length > 0) {
        reservation = await base44.asServiceRole.entities.FoundingWaitlist.update(existing[0].id, {
          status: "activated",
          activated: true,
          activation_date: new Date().toISOString(),
          activated_by_id: user.id,
          activated_by_name: user.full_name || user.email || "",
          activation_reason: reason || "Early access grant",
          assigned_plan: plan || existing[0].preferred_plan,
        });
      } else {
        reservation = await base44.asServiceRole.entities.FoundingWaitlist.create({
          full_name: full_name || "",
          email: normalizedEmail,
          preferred_plan: plan || "professional",
          reservation_date: new Date().toISOString(),
          status: "activated",
          priority_number,
          activated: true,
          payment_completed: false,
          activation_date: new Date().toISOString(),
          activated_by_id: user.id,
          activated_by_name: user.full_name || user.email || "",
          activation_reason: reason || "Early access grant",
          assigned_plan: plan || "professional",
        });
      }

      return Response.json({ success: true, reservation });
    }

    // ---- Notify all reserved users that payments are live ----
    if (action === "notify_all") {
      const pending = await base44.asServiceRole.entities.FoundingWaitlist.filter({ notified_payments_live: false });
      let notified = 0;
      for (const r of pending) {
        try {
          await base44.integrations.Core.SendEmail({
            to: r.email,
            subject: "💳 Payments Are Live — Activate Your Subscription — EXECLEAD.AI",
            body: `Hi ${r.full_name || "there"},\n\nGreat news! Payments are now live on EXECLEAD.AI.\n\nAs a reserved founding member (Position #${r.priority_number}), you can now activate your subscription.\n\nActivate now: https://execlead.ai/billing\n\n— The EXECLEAD.AI Team`,
            from_name: "EXECLEAD.AI",
          });
          await base44.asServiceRole.entities.FoundingWaitlist.update(r.id, {
            notified_payments_live: true,
            invitation_sent: true,
            status: r.status === "reserved" ? "invited" : r.status,
          });
          notified++;
        } catch (e) {}
      }
      return Response.json({ success: true, notified, total: pending.length });
    }

    return Response.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
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

      // Compute sequential priority number
      const all = await base44.asServiceRole.entities.FoundingWaitlist.list("-created_date", 100000);
      const priority_number = all.length + 1;

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
        preferred_plan,
        expected_start_date: expected_start_date || "",
        comments: comments || "",
        referral_source: referral_source || "",
        reservation_date: new Date().toISOString(),
        status: "reserved",
        priority_number,
        invitation_sent: false,
        payment_completed: false,
        activated: false,
      });

      // Send welcome + confirmation email with founder position
      try {
        const planLabel = ({ professional: "Professional", executive: "Executive", founding_member: "Founding Member", enterprise: "Enterprise" })[preferred_plan] || preferred_plan;
        await base44.integrations.Core.SendEmail({
          to: normalizedEmail,
          subject: "🎉 You're In! Founding Membership Reserved — EXECLEAD.AI",
          body: `Hi ${full_name || "there"},\n\nWelcome to EXECLEAD.AI! 🎉\n\nYour Founding Membership spot has been reserved.\n\nHere are your reservation details:\n• Founder Position: #${priority_number}\n• Preferred Plan: ${planLabel}\n• Country: ${country || "Not specified"}\n\nWhat happens next?\n• EXECLEAD.AI is currently in Public Beta — you can register and start exploring the platform today.\n• When payments go live, you'll be among the first invited to activate your subscription at founding member pricing.\n• Your position (#${priority_number}) secures your spot in line.\n\nStart exploring: https://execlead.ai/dashboard\n\nThank you for being one of our earliest supporters.\n\n— The EXECLEAD.AI Team`,
          from_name: "EXECLEAD.AI",
        });
      } catch (e) {}

      return Response.json({ success: true, reservation, priority_number });
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
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const ADMIN_ROLES = ['admin', 'platform_admin', 'super_admin', 'developer'];

const EVENT_TYPE_LABELS = {
  roundtable: 'Executive Roundtable', summit: 'Leadership Summit', masterclass: 'Masterclass',
  webinar: 'Webinar', fireside_chat: 'Fireside Chat', networking: 'Executive Networking',
  workshop: 'Workshop', ama: 'AMA Session', ai_briefing: 'AI Leadership Briefing',
  boardroom: 'Boardroom Session', product_demo: 'Product Demo', founder_meetup: 'Founder Meetup',
  investor_pitch: 'Investor Pitch', community_meetup: 'Community Meetup', retreat: 'Executive Retreat',
  ai_strategy: 'AI Strategy', career_accelerator: 'Career Accelerator',
};

async function getUserDiscount(base44, userId) {
  try {
    const founding = await base44.asServiceRole.entities.FoundingMember.filter({ user_id: userId });
    const active = founding.filter(f => ['active', 'verified', 'lifetime'].includes(f.status));
    if (active.length > 0) return { tier: 'founding', percent: 100 };
  } catch (e) {}
  try {
    const subs = await base44.asServiceRole.entities.Subscription.filter({ user_id: userId });
    const activeSub = subs.find(s => s.status === 'active');
    if (activeSub) {
      const plan = (activeSub.plan || activeSub.plan_id || '').toLowerCase();
      if (plan.includes('executive')) return { tier: 'executive', percent: 25 };
      if (plan.includes('professional')) return { tier: 'professional', percent: 10 };
    }
  } catch (e) {}
  return { tier: 'free', percent: 0 };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { action } = body;
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // ── REGISTER ──
    if (action === 'register') {
      const { event_id, payment_method } = body;
      if (!event_id) return Response.json({ error: 'event_id required' }, { status: 400 });

      const event = await base44.asServiceRole.entities.NetworkEvent.get(event_id);
      if (!event) return Response.json({ error: 'Event not found' }, { status: 404 });
      if (event.status === 'cancelled') return Response.json({ error: 'Event has been cancelled' }, { status: 400 });

      const existing = await base44.asServiceRole.entities.EventRegistration.filter({ event_id, user_id: user.id });
      if (existing.some(r => r.status !== 'cancelled')) {
        return Response.json({ error: 'Already registered for this event' }, { status: 409 });
      }

      const capacity = event.max_capacity || event.capacity || 0;
      const allRegs = await base44.asServiceRole.entities.EventRegistration.filter({ event_id });
      const activeRegs = allRegs.filter(r => ['registered', 'confirmed'].includes(r.status));
      const isFull = capacity > 0 && activeRegs.length >= capacity;

      const discount = await getUserDiscount(base44, user.id);
      const basePrice = event.price || 0;
      const finalPrice = Math.max(0, Math.round(basePrice * (1 - discount.percent / 100) * 100) / 100);

      let regType = 'reserve';
      let status = 'registered';
      let amountPaid = 0;
      let payMethod = 'free';

      if (isFull) {
        regType = 'waitlist';
        status = 'waitlisted';
      } else if (basePrice > 0 && discount.percent < 100) {
        if (payment_method === 'wallet') {
          const wallets = await base44.asServiceRole.entities.ExecutiveWallet.filter({ user_id: user.id });
          if (wallets.length === 0) {
            return Response.json({ error: 'No wallet found. Set up your Executive Wallet first.' }, { status: 400 });
          }
          const wallet = wallets[0];
          if ((wallet.available_balance || 0) < finalPrice) {
            return Response.json({ error: `Insufficient balance. Need $${finalPrice}, have $${wallet.available_balance || 0}` }, { status: 400 });
          }
          const newBalance = (wallet.available_balance || 0) - finalPrice;
          await base44.asServiceRole.entities.ExecutiveWallet.update(wallet.id, {
            available_balance: newBalance,
            marketplace_spend: (wallet.marketplace_spend || 0) + finalPrice,
            total_transactions: (wallet.total_transactions || 0) + 1,
          });
          await base44.asServiceRole.entities.WalletTransaction.create({
            user_id: user.id, user_name: user.full_name || user.email,
            type: 'marketplace_purchase', description: `Event Ticket: ${event.title}`,
            amount: -finalPrice, balance_after: newBalance, status: 'completed',
            reference_id: event.id, reference_type: 'event_ticket',
          });
          status = 'confirmed';
          amountPaid = finalPrice;
          payMethod = 'wallet';
          regType = 'purchased';
        } else {
          return Response.json({ error: 'Please select wallet payment' }, { status: 400 });
        }
      } else {
        status = 'confirmed';
        amountPaid = 0;
        regType = basePrice > 0 ? 'purchased' : 'reserve';
      }

      const profiles = await base44.asServiceRole.entities.UserProfile.filter({ created_by_id: user.id });
      const profile = profiles[0];

      const registration = await base44.entities.EventRegistration.create({
        event_id, event_title: event.title,
        user_id: user.id, user_name: user.full_name || user.email, user_email: user.email,
        user_photo: profile?.photo_url || '',
        user_headline: profile?.current_role || '',
        registration_type: regType, status, ticket_type: discount.tier === 'founding' ? 'vip' : 'general',
        amount_paid: amountPaid, currency: event.currency || 'USD', payment_method: payMethod,
        attended: false, certificate_issued: false, registered_at: new Date().toISOString(),
      });

      const updateData = {};
      if (isFull) {
        updateData.waitlist_count = (event.waitlist_count || 0) + 1;
      } else {
        updateData.registered_count = activeRegs.length + 1;
      }
      await base44.asServiceRole.entities.NetworkEvent.update(event_id, updateData);

      return Response.json({
        registration,
        event: { ...event, ...updateData },
        discount: { ...discount, base_price: basePrice, final_price: finalPrice },
      });
    }

    // ── CANCEL ──
    if (action === 'cancel') {
      const { registration_id } = body;
      const regs = await base44.asServiceRole.entities.EventRegistration.filter({ id: registration_id, user_id: user.id });
      const reg = regs[0];
      if (!reg) return Response.json({ error: 'Registration not found' }, { status: 404 });

      await base44.entities.EventRegistration.update(registration_id, { status: 'cancelled' });

      if (['confirmed', 'registered'].includes(reg.status)) {
        const event = await base44.asServiceRole.entities.NetworkEvent.get(reg.event_id);
        if (event) {
          await base44.asServiceRole.entities.NetworkEvent.update(reg.event_id, {
            registered_count: Math.max(0, (event.registered_count || 0) - 1),
          });
        }
      }

      if (reg.amount_paid > 0 && reg.payment_method === 'wallet') {
        const wallets = await base44.asServiceRole.entities.ExecutiveWallet.filter({ user_id: user.id });
        if (wallets.length > 0) {
          const wallet = wallets[0];
          const newBalance = (wallet.available_balance || 0) + reg.amount_paid;
          await base44.asServiceRole.entities.ExecutiveWallet.update(wallet.id, { available_balance: newBalance });
          await base44.asServiceRole.entities.WalletTransaction.create({
            user_id: user.id, user_name: user.full_name || user.email,
            type: 'refund', description: `Refund: ${reg.event_title}`,
            amount: reg.amount_paid, balance_after: newBalance, status: 'completed',
            reference_id: reg.event_id, reference_type: 'event_refund',
          });
        }
      }

      return Response.json({ success: true });
    }

    // ── GET MY EVENTS ──
    if (action === 'get_my_events') {
      const regs = await base44.entities.EventRegistration.filter({ user_id: user.id }, '-registered_at', 50);
      return Response.json({ registrations: regs });
    }

    // ── GET EVENT DETAILS ──
    if (action === 'get_event_details') {
      const { event_id } = body;
      const event = await base44.asServiceRole.entities.NetworkEvent.get(event_id);
      if (!event) return Response.json({ error: 'Event not found' }, { status: 404 });

      const myRegs = await base44.asServiceRole.entities.EventRegistration.filter({ event_id, user_id: user.id });
      const myReg = myRegs.find(r => r.status !== 'cancelled') || null;

      const discount = await getUserDiscount(base44, user.id);
      const basePrice = event.price || 0;
      const finalPrice = Math.max(0, Math.round(basePrice * (1 - discount.percent / 100) * 100) / 100);

      const newViews = (event.views_count || 0) + 1;
      await base44.asServiceRole.entities.NetworkEvent.update(event_id, { views_count: newViews });

      const capacity = event.max_capacity || event.capacity || 0;
      const allRegs = await base44.asServiceRole.entities.EventRegistration.filter({ event_id });
      const activeCount = allRegs.filter(r => ['registered', 'confirmed'].includes(r.status)).length;

      return Response.json({
        event: { ...event, views_count: newViews },
        my_registration: myReg,
        discount: { ...discount, base_price: basePrice, final_price: finalPrice },
        spots_remaining: capacity > 0 ? Math.max(0, capacity - activeCount) : -1,
        attendee_count: activeCount,
      });
    }

    // ── AI RECOMMEND ──
    if (action === 'ai_recommend') {
      const profiles = await base44.asServiceRole.entities.UserProfile.filter({ created_by_id: user.id });
      const profile = profiles[0] || {};

      const allEvents = await base44.asServiceRole.entities.NetworkEvent.list('start_date', 50);
      const events = allEvents.filter(e =>
        (e.status === 'upcoming' || e.status === 'live' || !e.status) &&
        e.start_date && new Date(e.start_date) >= new Date()
      ).slice(0, 20);

      if (events.length === 0) return Response.json({ recommendations: [] });

      const eventSummaries = events.map(e => ({
        id: e.id, title: e.title,
        type: EVENT_TYPE_LABELS[e.event_type] || e.event_type,
        industry: e.industry || '',
        description: (e.description || '').substring(0, 200),
        tags: (e.tags || []).join(', '),
        price: e.price || 0,
      }));

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an AI executive career advisor. Based on this executive's profile, recommend the top 3 events they should attend.\n\nExecutive Profile:\n- Name: ${profile.full_name || user.full_name || 'Executive'}\n- Industry: ${profile.industry || 'Not specified'}\n- Current Role: ${profile.current_role || 'Not specified'}\n- Target Role: ${profile.target_role || 'Not specified'}\n- Career Goals: ${profile.career_goals || 'Not specified'}\n- Country: ${profile.country || 'Not specified'}\n\nAvailable Events:\n${JSON.stringify(eventSummaries)}\n\nReturn the top 3 most relevant events with a reason and match score (0-100).`,
        response_json_schema: {
          type: 'object',
          properties: {
            recommendations: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  event_id: { type: 'string' },
                  reason: { type: 'string' },
                  match_score: { type: 'number' },
                },
              },
            },
          },
        },
      });

      return Response.json({ recommendations: result.recommendations || [] });
    }

    // ── CHECK IN ──
    if (action === 'check_in') {
      const { event_id, method } = body;
      const regs = await base44.asServiceRole.entities.EventRegistration.filter({ event_id, user_id: user.id });
      const reg = regs.find(r => ['confirmed', 'registered'].includes(r.status));

      if (!reg) return Response.json({ error: 'Not registered for this event' }, { status: 404 });
      if (reg.attended) return Response.json({ error: 'Already checked in' }, { status: 409 });

      await base44.entities.EventRegistration.update(reg.id, {
        attended: true, check_in_method: method || 'manual', check_in_at: new Date().toISOString(),
      });

      const event = await base44.asServiceRole.entities.NetworkEvent.get(event_id);
      if (event) {
        await base44.asServiceRole.entities.NetworkEvent.update(event_id, {
          attended_count: (event.attended_count || 0) + 1,
        });
      }

      let certificate = null;
      if (event?.certificate_enabled) {
        try {
          certificate = await base44.asServiceRole.entities.Certificate.create({
            user_id: user.id, user_name: user.full_name || user.email,
            title: `${event.title} — Certificate of Attendance`,
            type: 'event_attendance', event_id, event_title: event.title,
            issued_date: new Date().toISOString().split('T')[0], status: 'issued',
          });
          await base44.entities.EventRegistration.update(reg.id, {
            certificate_issued: true, certificate_id: certificate.id,
          });
        } catch (e) {}
      }

      return Response.json({ checked_in: true, certificate });
    }

    // ── GET ATTENDEES ──
    if (action === 'get_attendees') {
      const { event_id } = body;
      const allRegs = await base44.asServiceRole.entities.EventRegistration.filter({ event_id }, 'registered_at', 200);
      const attendees = allRegs
        .filter(r => ['confirmed', 'registered', 'attended'].includes(r.status))
        .map(r => ({
          user_id: r.user_id, user_name: r.user_name, user_photo: r.user_photo,
          user_headline: r.user_headline, ticket_type: r.ticket_type,
          attended: r.attended, registered_at: r.registered_at,
        }));
      return Response.json({ attendees, count: attendees.length });
    }

    // ── GET ANALYTICS (admin only) ──
    if (action === 'get_analytics') {
      if (!ADMIN_ROLES.includes(user.role)) {
        return Response.json({ error: 'Admin access required' }, { status: 403 });
      }
      const events = await base44.asServiceRole.entities.NetworkEvent.list('-created_date', 100);
      const allRegs = await base44.asServiceRole.entities.EventRegistration.list('-created_date', 500);

      const confirmed = allRegs.filter(r => ['confirmed', 'registered'].includes(r.status));
      const attended = allRegs.filter(r => r.attended);
      const revenue = allRegs.filter(r => r.status === 'confirmed' || r.attended).reduce((s, r) => s + (r.amount_paid || 0), 0);

      return Response.json({
        total_events: events.length,
        upcoming_events: events.filter(e => e.status === 'upcoming').length,
        total_registrations: allRegs.length,
        confirmed_registrations: confirmed.length,
        attended: attended.length,
        no_shows: Math.max(0, confirmed.length - attended.length),
        total_revenue: revenue,
        attendance_rate: confirmed.length > 0 ? Math.round((attended.length / confirmed.length) * 100) : 0,
        total_views: events.reduce((s, e) => s + (e.views_count || 0), 0),
      });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
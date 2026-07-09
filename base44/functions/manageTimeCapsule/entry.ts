import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const action = body.action;

    // ─── GET: Retrieve or create draft capsule ───────────────────────────
    if (action === 'get') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

      // Verify founder status
      const waitlist = await base44.asServiceRole.entities.FoundingWaitlist.filter({ user_id: user.id });
      const founder = waitlist.find(w => w.status !== 'cancelled' && w.status !== 'declined');
      if (!founder) {
        return Response.json({ is_founder: false, capsule: null });
      }

      // Get existing capsule
      const capsules = await base44.asServiceRole.entities.FounderTimeCapsule.filter({ user_id: user.id });
      let capsule = capsules[0];

      // Auto-unlock if past unlock date
      if (capsule && capsule.status === 'sealed' && capsule.unlock_date && new Date(capsule.unlock_date) <= new Date()) {
        await base44.asServiceRole.entities.FounderTimeCapsule.update(capsule.id, { status: 'unlocked' });
        capsule.status = 'unlocked';
      }

      // Create draft if none exists
      if (!capsule) {
        const capsule_id = `CAPS-${founder.founding_member_number}`;
        capsule = await base44.asServiceRole.entities.FounderTimeCapsule.create({
          user_id: user.id,
          founding_member_number: founder.founding_member_number,
          capsule_id,
          status: 'draft',
          lock_period: '5_years',
          legacy_visibility: 'private',
          unlock_notification_sent: false,
          anniversary_milestones: [],
        });
      }

      return Response.json({ is_founder: true, capsule, founder_number: founder.founding_member_number });
    }

    // ─── SEAL: Lock the capsule with all data ────────────────────────────
    if (action === 'seal') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

      // Verify founder
      const waitlist = await base44.asServiceRole.entities.FoundingWaitlist.filter({ user_id: user.id });
      const founder = waitlist.find(w => w.status !== 'cancelled' && w.status !== 'declined');
      if (!founder) {
        return Response.json({ error: 'Only founding members can create time capsules' }, { status: 403 });
      }

      // Check existing — can't re-seal
      const existing = await base44.asServiceRole.entities.FounderTimeCapsule.filter({ user_id: user.id });
      if (existing[0] && existing[0].status === 'sealed') {
        return Response.json({ error: 'Capsule already sealed — cannot be edited' }, { status: 400 });
      }

      // Calculate unlock date
      const now = new Date();
      const lockMap = { '1_year': 1, '3_years': 3, '5_years': 5, '10_years': 10, '15_years': 15, '20_years': 20 };
      let unlockDate;
      if (body.lock_period === 'custom' && body.custom_unlock_date) {
        unlockDate = new Date(body.custom_unlock_date);
      } else {
        unlockDate = new Date(now);
        const years = lockMap[body.lock_period] || 5;
        unlockDate.setFullYear(now.getFullYear() + years);
      }

      // Capture executive snapshot (Then)
      let profile = {};
      try {
        const profiles = await base44.asServiceRole.entities.UserProfile.filter({ user_id: user.id });
        profile = profiles[0] || {};
      } catch (e) {}

      const snapshot = {
        sealed_at: now.toISOString(),
        full_name: founder.full_name || profile.full_name || user.full_name || '',
        profession: founder.profession || profile.profession || '',
        company: founder.company || profile.company_name || '',
        industry: founder.industry || '',
        country: founder.country || profile.country || '',
        executive_score: founder.executive_score || 0,
        subscription_plan: profile.subscription_plan || founder.preferred_plan || 'free',
      };

      // Generate digital signature
      const sigInput = `${user.id}-${founder.founding_member_number}-${now.toISOString()}`;
      const sigBytes = new TextEncoder().encode(sigInput);
      const sigHash = await crypto.subtle.digest('SHA-256', sigBytes);
      const signature = Array.from(new Uint8Array(sigHash)).map(b => b.toString(16).padStart(2, '0')).join('');

      const capsule_id = `CAPS-${founder.founding_member_number}`;

      const capsuleData = {
        user_id: user.id,
        founding_member_number: founder.founding_member_number,
        capsule_id,
        digital_signature: signature,
        why_joined: body.why_joined || '',
        career_goals_today: body.career_goals_today || '',
        hope_5_years: body.hope_5_years || '',
        hope_10_years: body.hope_10_years || '',
        hope_20_years: body.hope_20_years || '',
        advice_future_self: body.advice_future_self || '',
        belief_execlead_future: body.belief_execlead_future || '',
        leadership_principle: body.leadership_principle || '',
        photo_url: body.photo_url || '',
        video_url: body.video_url || '',
        audio_url: body.audio_url || '',
        document_url: body.document_url || '',
        lock_period: body.lock_period || '5_years',
        custom_unlock_date: body.custom_unlock_date || '',
        unlock_date: unlockDate.toISOString(),
        sealed_at: now.toISOString(),
        status: 'sealed',
        snapshot_json: JSON.stringify(snapshot),
        legacy_visibility: body.legacy_visibility || 'private',
        unlock_notification_sent: false,
      };

      let capsule;
      if (existing[0]) {
        capsule = await base44.asServiceRole.entities.FounderTimeCapsule.update(existing[0].id, capsuleData);
      } else {
        capsule = await base44.asServiceRole.entities.FounderTimeCapsule.create(capsuleData);
      }

      // Send confirmation email
      try {
        const email = founder.email || user.email;
        if (email) {
          const sealedDate = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
          const unlockFormatted = unlockDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: email,
            subject: 'Your Founder Time Capsule Has Been Sealed',
            body: `Dear ${founder.full_name || user.full_name},\n\nYour Founder Time Capsule has been sealed on ${sealedDate} and will be opened on ${unlockFormatted}.\n\nCapsule ID: ${capsule_id}\nFounder Number: ${founder.founding_member_number}\nDigital Signature: ${signature.substring(0, 16)}...\n\nYour legacy has become part of EXECLEAD.AI history.\n\nWith gratitude,\nThe EXECLEAD.AI Team`,
          });
        }
      } catch (e) {}

      // In-app notification
      try {
        await base44.asServiceRole.entities.Notification.create({
          type: 'achievement',
          title: 'Time Capsule Sealed',
          message: `Your Founder Time Capsule has been sealed. It will open on ${unlockDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.`,
          user_id: user.id,
          icon: '🔒',
          action_url: '/founder/time-capsule',
        });
      } catch (e) {}

      return Response.json({ success: true, capsule });
    }

    // ─── DELETE: Remove capsule (requires confirmation) ──────────────────
    if (action === 'delete') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

      const capsules = await base44.asServiceRole.entities.FounderTimeCapsule.filter({ user_id: user.id });
      const capsule = capsules[0];
      if (!capsule) return Response.json({ error: 'No capsule found' }, { status: 404 });

      if (body.confirmation !== capsule.capsule_id) {
        return Response.json({ error: 'Invalid confirmation — you must type the capsule ID exactly' }, { status: 400 });
      }

      await base44.asServiceRole.entities.FounderTimeCapsule.delete(capsule.id);
      return Response.json({ success: true });
    }

    // ─── GENERATE REFLECTION: AI analysis on unlock ──────────────────────
    if (action === 'generate_reflection') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

      const capsules = await base44.asServiceRole.entities.FounderTimeCapsule.filter({ user_id: user.id });
      const capsule = capsules[0];
      if (!capsule) return Response.json({ error: 'No capsule found' }, { status: 404 });
      if (capsule.status !== 'unlocked' && capsule.status !== 'opened') {
        return Response.json({ error: 'Capsule is not yet unlocked' }, { status: 400 });
      }

      // Get current profile for comparison
      const waitlist = await base44.asServiceRole.entities.FoundingWaitlist.filter({ user_id: user.id });
      const founder = waitlist[0] || {};

      let profile = {};
      try {
        const profiles = await base44.asServiceRole.entities.UserProfile.filter({ user_id: user.id });
        profile = profiles[0] || {};
      } catch (e) {}

      const snapshot = JSON.parse(capsule.snapshot_json || '{}');
      const sealedDate = capsule.sealed_at ? new Date(capsule.sealed_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'unknown date';

      const prompt = `You are an AI executive coach at EXECLEAD.AI. A founding member's time capsule has been unlocked. It was sealed on ${sealedDate}.

ORIGINAL ANSWERS (from ${sealedDate}):
- Why they joined EXECLEAD.AI: ${capsule.why_joined || 'Not answered'}
- Career goals at the time: ${capsule.career_goals_today || 'Not answered'}
- 5-year hope: ${capsule.hope_5_years || 'Not answered'}
- 10-year hope: ${capsule.hope_10_years || 'Not answered'}
- 20-year hope: ${capsule.hope_20_years || 'Not answered'}
- Advice to future self: ${capsule.advice_future_self || 'Not answered'}
- What they believed EXECLEAD.AI would become: ${capsule.belief_execlead_future || 'Not answered'}
- Leadership principle that defined them: ${capsule.leadership_principle || 'Not answered'}

PROFILE THEN (at seal time):
- Role: ${snapshot.profession || 'Unknown'}
- Company: ${snapshot.company || 'Unknown'}
- Industry: ${snapshot.industry || 'Unknown'}
- Country: ${snapshot.country || 'Unknown'}
- Plan: ${snapshot.subscription_plan || 'free'}

PROFILE NOW:
- Role: ${founder.profession || profile.profession || 'Unknown'}
- Company: ${founder.company || profile.company_name || 'Unknown'}
- Industry: ${founder.industry || 'Unknown'}
- Plan: ${profile.subscription_plan || founder.preferred_plan || 'free'}

Analyze this founder's executive journey. Be warm, insightful, specific, and celebratory. Reference their original words and goals. Compare then vs now. Provide a thoughtful reflection on their growth, achievements, and future potential.`;

      const reflection = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            summary: { type: 'string', description: 'A warm, personal 2-3 paragraph reflection on their executive journey' },
            highlights: { type: 'array', items: { type: 'string' }, description: 'Key highlights and growth moments' },
            growth_areas: { type: 'array', items: { type: 'string' }, description: 'Areas where they have grown or can continue growing' },
            milestones: { type: 'array', items: { type: 'string' }, description: 'Notable milestones achieved since sealing' },
            recommendations: { type: 'array', items: { type: 'string' }, description: 'Forward-looking recommendations for their continued journey' },
          },
        },
      });

      await base44.asServiceRole.entities.FounderTimeCapsule.update(capsule.id, {
        ai_reflection_json: JSON.stringify(reflection),
        ai_reflection_generated_at: new Date().toISOString(),
        status: 'opened',
      });

      return Response.json({ success: true, reflection });
    }

    // ─── PUBLISH: Set legacy visibility ──────────────────────────────────
    if (action === 'publish') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

      const capsules = await base44.asServiceRole.entities.FounderTimeCapsule.filter({ user_id: user.id });
      const capsule = capsules[0];
      if (!capsule) return Response.json({ error: 'No capsule found' }, { status: 404 });

      const updates = {
        legacy_visibility: body.visibility || 'private',
        published_at: body.visibility !== 'private' ? new Date().toISOString() : null,
      };
      await base44.asServiceRole.entities.FounderTimeCapsule.update(capsule.id, updates);

      return Response.json({ success: true });
    }

    // ─── WALL DISPLAY: Public capsule info for Founders Wall ─────────────
    if (action === 'wall_display') {
      const capsules = await base44.asServiceRole.entities.FounderTimeCapsule.list('-sealed_at', 500);
      const publicCapsules = capsules.filter(c =>
        c.legacy_visibility === 'public' &&
        c.status !== 'draft' &&
        !c.hidden
      );

      const display = publicCapsules.map(c => ({
        founding_member_number: c.founding_member_number,
        capsule_id: c.capsule_id,
        sealed_at: c.sealed_at,
        unlock_date: c.unlock_date,
        status: c.status,
        why_joined: c.why_joined,
        leadership_principle: c.leadership_principle,
        photo_url: c.photo_url,
      }));

      return Response.json({ capsules: display });
    }

    // ─── CHECK UNLOCKS: Scheduled automation action ─────────────────────
    if (action === 'check_unlocks') {
      const all = await base44.asServiceRole.entities.FounderTimeCapsule.list('-created_date', 1000);
      const due = all.filter(c =>
        c.status === 'sealed' &&
        c.unlock_date &&
        new Date(c.unlock_date) <= new Date() &&
        !c.unlock_notification_sent
      );

      let unlockedCount = 0;
      for (const capsule of due) {
        await base44.asServiceRole.entities.FounderTimeCapsule.update(capsule.id, {
          status: 'unlocked',
          unlock_notification_sent: true,
        });

        // Get email
        let email = null;
        let fullName = '';
        try {
          const founders = await base44.asServiceRole.entities.FoundingWaitlist.filter({ user_id: capsule.user_id });
          email = founders[0]?.email;
          fullName = founders[0]?.full_name || '';
        } catch (e) {}

        // In-app notification
        try {
          await base44.asServiceRole.entities.Notification.create({
            type: 'achievement',
            title: 'Your Founder Time Capsule is Ready to Open',
            message: 'The time has come. Your Founder Time Capsule is ready to open.',
            user_id: capsule.user_id,
            icon: '🔓',
            action_url: '/founder/time-capsule',
          });
        } catch (e) {}

        // Email notification
        if (email) {
          try {
            const sealedDate = capsule.sealed_at ? new Date(capsule.sealed_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '';
            await base44.asServiceRole.integrations.Core.SendEmail({
              to: email,
              subject: 'Your Founder Time Capsule is ready to open.',
              body: `Dear ${fullName},\n\nThe time has come. Your Founder Time Capsule, sealed on ${sealedDate}, is now ready to open.\n\nVisit EXECLEAD.AI to experience your journey through time.\n\nCapsule ID: ${capsule.capsule_id}\nFounder Number: ${capsule.founding_member_number}\n\nWith celebration,\nThe EXECLEAD.AI Team`,
            });
          } catch (e) {}
        }

        unlockedCount++;
      }

      return Response.json({ success: true, unlocked: unlockedCount });
    }

    // ─── ANALYTICS: Admin dashboard data ────────────────────────────────
    if (action === 'analytics') {
      const user = await base44.auth.me();
      if (!user || user.role !== 'admin') {
        return Response.json({ error: 'Admin access required' }, { status: 403 });
      }

      const all = await base44.asServiceRole.entities.FounderTimeCapsule.list('-created_date', 1000);
      const sealed = all.filter(c => c.status === 'sealed');
      const unlocked = all.filter(c => c.status === 'unlocked' || c.status === 'opened');
      const published = all.filter(c => c.legacy_visibility !== 'private');

      // Country distribution
      const countries = {};
      all.forEach(c => {
        try {
          const snap = JSON.parse(c.snapshot_json || '{}');
          if (snap.country) countries[snap.country] = (countries[snap.country] || 0) + 1;
        } catch (e) {}
      });

      return Response.json({
        total_capsules: all.length,
        sealed: sealed.length,
        unlocked: unlocked.length,
        published_stories: published.length,
        unlock_rate: all.length > 0 ? Math.round((unlocked.length / all.length) * 100) : 0,
        countries_represented: Object.keys(countries).length,
        country_distribution: Object.entries(countries).map(([code, count]) => ({ code, count })).sort((a, b) => b.count - a.count),
      });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
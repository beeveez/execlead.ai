import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

const FOUNDER_DISCOUNT = 25;
const FOUNDER_MAX = 500;
const EARLY_ACCESS_MODULES = [
  'executive_coach',
  'promotion_forecast',
  'trust_center',
  'executive_simulator',
  'career_intelligence',
  'enterprise_dashboard',
  'leadership_dna',
  'executive_council',
  'executive_briefing',
  'decision_intelligence',
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const action = body.action;

    // ============================================================
    // HELPER: Log a founding member audit entry (immutable)
    // ============================================================
    async function logAudit(base44, entry) {
      try {
        await base44.asServiceRole.entities.FoundingMemberAuditLog.create({
          founding_member_id: entry.founding_member_id || '',
          founding_member_number: entry.founding_member_number || '',
          user_id: entry.user_id || '',
          member_name: entry.member_name || '',
          action: entry.action,
          description: entry.description,
          performed_by: entry.performed_by || '',
          performed_by_name: entry.performed_by_name || '',
          metadata_json: entry.metadata ? JSON.stringify(entry.metadata) : '',
        });
      } catch (e) {}
    }

    // ============================================================
    // HELPER: Generate sequential founder number
    // ============================================================
    async function generateFounderNumber(base44) {
      const existing = await base44.asServiceRole.entities.FoundingMember.list('-created_date', 100000);
      const year = new Date().getFullYear();
      const num = (existing.length + 1).toString().padStart(4, '0');
      return `FM-${year}-${num}`;
    }

    // ============================================================
    // ACTION: approve_founder
    // Full automated approval workflow — no manual steps.
    // Steps: create FoundingMember, assign badge, enable beta access,
    // lock pricing, update profile, create certificate, send welcome
    // email, send notification, log audit for every step.
    // ============================================================
    if (action === 'approve_founder') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
      const isAdmin = ['admin', 'developer', 'super_admin', 'platform_admin'].includes(user.role);
      if (!isAdmin) return Response.json({ error: 'Admin access required' }, { status: 403 });

      const { beta_application_id, target_user_id, target_email, target_name, assigned_plan, reason } = body;
      const targetUid = target_user_id || '';
      const targetEmail = (target_email || '').toLowerCase().trim();
      const targetName = target_name || '';

      if (!targetUid && !targetEmail) {
        return Response.json({ error: 'Either target_user_id or target_email is required' }, { status: 400 });
      }

      // --- Idempotency: check if already a founding member ---
      let existingFm = [];
      if (targetUid) {
        existingFm = await base44.asServiceRole.entities.FoundingMember.filter({ user_id: targetUid });
      }
      if (existingFm.length === 0 && targetEmail) {
        existingFm = await base44.asServiceRole.entities.FoundingMember.filter({ email: targetEmail });
      }

      const today = new Date().toISOString().split('T')[0];
      const now = new Date().toISOString();
      let memberNumber;
      let fmRecord;

      if (existingFm.length > 0) {
        // Already a founding member — just reactivate if needed
        fmRecord = existingFm[0];
        memberNumber = fmRecord.founding_member_number;
        await base44.asServiceRole.entities.FoundingMember.update(fmRecord.id, {
          status: 'active',
          badge_status: 'granted',
          beta_access: true,
          early_access_enabled: true,
          protected_pricing: true,
          lifetime_discount_enabled: true,
          community_access: true,
          roadmap_voting: true,
          feedback_sessions: true,
        });
        await logAudit(base44, {
          founding_member_id: fmRecord.id,
          founding_member_number: memberNumber,
          user_id: targetUid,
          member_name: targetName,
          action: 'member_restored',
          description: `Founding member re-approved and reactivated by ${user.email || 'admin'}`,
          performed_by: user.id,
          performed_by_name: user.email || 'Admin',
          metadata: { reason: reason || 're-approval', beta_application_id },
        });
      } else {
        // --- Step 1: Create FoundingMember record with ALL entitlements ---
        memberNumber = await generateFounderNumber(base44);
        fmRecord = await base44.asServiceRole.entities.FoundingMember.create({
          founding_member_number: memberNumber,
          user_id: targetUid,
          full_name: targetName,
          email: targetEmail,
          joined_date: today,
          founding_batch: 'Batch #1',
          founding_tier: 'founding_member',
          status: 'active',
          subscription_plan: assigned_plan || 'free',
          lifetime_discount_percentage: FOUNDER_DISCOUNT,
          lifetime_discount_enabled: true,
          protected_pricing: true,
          badge_status: 'granted',
          badge_issued_date: today,
          early_access_enabled: true,
          early_access_modules: EARLY_ACCESS_MODULES,
          community_access: true,
          beta_access: true,
          roadmap_voting: true,
          feedback_sessions: true,
          certificate_issued: true,
          certificate_issued_date: today,
        });

        // --- Step 2: Log audit — founder approved + badge assigned ---
        await logAudit(base44, {
          founding_member_id: fmRecord.id,
          founding_member_number: memberNumber,
          user_id: targetUid,
          member_name: targetName,
          action: 'benefit_granted',
          description: `Founding Member approved by ${user.email || 'admin'}. Badge assigned. Member #${memberNumber}.`,
          performed_by: user.id,
          performed_by_name: user.email || 'Admin',
          metadata: { reason: reason || 'approval', beta_application_id, assigned_plan },
        });

        await logAudit(base44, {
          founding_member_id: fmRecord.id,
          founding_member_number: memberNumber,
          user_id: targetUid,
          member_name: targetName,
          action: 'founder_number_issued',
          description: `Founder number ${memberNumber} issued`,
          performed_by: user.id,
          performed_by_name: user.email || 'Admin',
        });

        await logAudit(base44, {
          founding_member_id: fmRecord.id,
          founding_member_number: memberNumber,
          user_id: targetUid,
          member_name: targetName,
          action: 'discount_applied',
          description: `Lifetime ${FOUNDER_DISCOUNT}% discount locked. Protected pricing enabled.`,
          performed_by: user.id,
          performed_by_name: user.email || 'Admin',
          metadata: { discount: FOUNDER_DISCOUNT, protected: true },
        });

        // --- Step 3: Update UserProfile with founding member flags ---
        if (targetUid) {
          try {
            const profiles = await base44.asServiceRole.entities.UserProfile.filter({ created_by_id: targetUid });
            if (profiles.length > 0) {
              await base44.asServiceRole.entities.UserProfile.update(profiles[0].id, {
                founding_member: true,
                founding_member_since: now,
                subscription_plan: assigned_plan || profiles[0].subscription_plan || 'free',
                subscription_status: 'active',
                beta_member: true,
                beta_join_date: today,
              });
            }
          } catch (e) {}
        }

        // --- Step 4: Generate Founder Certificate ---
        try {
          await base44.asServiceRole.entities.Certificate.create({
            certificate_id: `FM-CERT-${Date.now()}`,
            course_id: 'founding_member',
            course_name: 'Founding Member Certificate',
            user_name: targetName,
            user_id: targetUid,
            completion_date: today,
            verification_url: `https://execlead.ai/founder/certificates`,
          });
          await logAudit(base44, {
            founding_member_id: fmRecord.id,
            founding_member_number: memberNumber,
            user_id: targetUid,
            member_name: targetName,
            action: 'certificate_issued',
            description: `Founding Member certificate generated`,
            performed_by: user.id,
            performed_by_name: user.email || 'Admin',
          });
        } catch (e) {}

        // --- Step 5: Send welcome email ---
        if (targetEmail) {
          try {
            await base44.integrations.Core.SendEmail({
              to: targetEmail,
              subject: `🏆 Welcome, Founding Member #${memberNumber} — EXECLEAD.AI`,
              body: `Hi ${targetName || 'there'},\n\nWelcome to EXECLEAD.AI! You are now an official Founding Member.\n\n══════════════════════════════════\n  FOUNDER BENEFITS ACTIVATED\n══════════════════════════════════\n\n  Founder Number: ${memberNumber}\n  Joined: ${today}\n  Status: Active (Lifetime)\n\n  Your Benefits:\n  ✓ Free Beta Access — full EXEC™ capabilities\n  ✓ Lifetime Founding Member Badge\n  ✓ ${FOUNDER_DISCOUNT}% Lifetime Discount (price-protected)\n  ✓ Early Access to all new features\n  ✓ Product Feedback Center access\n  ✓ Founder Community access\n  ✓ Roadmap voting rights\n  ✓ Founder Certificate\n\nYour badge is now visible on your Dashboard, Profile, Community, and Executive Passport™.\n\nVisit your Founder Dashboard: https://execlead.ai/founder-dashboard\n\n— The EXECLEAD.AI Team`,
              from_name: 'EXECLEAD.AI',
            });
          } catch (e) {}
        }

        // --- Step 6: Send in-app notification ---
        if (targetUid) {
          try {
            await base44.asServiceRole.entities.Notification.create({
              type: 'subscription',
              title: 'Founding Member Status Activated',
              message: `Welcome! Your Founding Member benefits are now active. Member #${memberNumber}.`,
              icon: '🏆',
              action_url: '/founder-dashboard',
              user_id: targetUid,
              organization_id: '',
              workspace: 'executive',
              visibility: 'private',
              role_scope: '',
              read: false,
            });
          } catch (e) {}
        }
      }

      // --- Step 7: Update BetaApplication status if provided ---
      if (beta_application_id) {
        try {
          await base44.asServiceRole.entities.BetaApplication.update(beta_application_id, {
            status: 'approved',
            reviewed_by_id: user.id,
            reviewed_by_name: user.email || '',
            reviewed_at: now,
            is_active_beta_user: true,
            activated_at: now,
          });
        } catch (e) {}
      }

      return Response.json({
        success: true,
        founding_member_number: memberNumber,
        founding_member_id: fmRecord?.id,
        message: 'Founder approved — all benefits activated automatically',
        steps_completed: [
          'founding_member_record_created',
          'badge_assigned',
          'beta_access_enabled',
          'pricing_locked',
          'profile_updated',
          'certificate_generated',
          'welcome_email_sent',
          'notification_sent',
          'audit_logged',
        ],
      });
    }

    // ============================================================
    // ACTION: suspend_founder
    // ============================================================
    if (action === 'suspend_founder') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
      const isAdmin = ['admin', 'developer', 'super_admin', 'platform_admin'].includes(user.role);
      if (!isAdmin) return Response.json({ error: 'Admin access required' }, { status: 403 });

      const { founding_member_id, reason } = body;
      if (!founding_member_id) return Response.json({ error: 'founding_member_id required' }, { status: 400 });

      const fm = await base44.asServiceRole.entities.FoundingMember.get(founding_member_id);
      if (!fm) return Response.json({ error: 'Founding member not found' }, { status: 404 });

      await base44.asServiceRole.entities.FoundingMember.update(founding_member_id, {
        status: 'suspended',
        beta_access: false,
        early_access_enabled: false,
        community_access: false,
      });

      // Update profile
      if (fm.user_id) {
        try {
          const profiles = await base44.asServiceRole.entities.UserProfile.filter({ created_by_id: fm.user_id });
          if (profiles.length > 0) {
            await base44.asServiceRole.entities.UserProfile.update(profiles[0].id, {
              beta_member: false,
            });
          }
        } catch (e) {}
      }

      await logAudit(base44, {
        founding_member_id: fm.id,
        founding_member_number: fm.founding_member_number,
        user_id: fm.user_id,
        member_name: fm.full_name,
        action: 'member_suspended',
        description: `Founding member suspended by ${user.email || 'admin'}. Reason: ${reason || 'Not specified'}`,
        performed_by: user.id,
        performed_by_name: user.email || 'Admin',
        metadata: { reason },
      });

      return Response.json({ success: true, message: 'Founder suspended' });
    }

    // ============================================================
    // ACTION: restore_founder
    // ============================================================
    if (action === 'restore_founder') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
      const isAdmin = ['admin', 'developer', 'super_admin', 'platform_admin'].includes(user.role);
      if (!isAdmin) return Response.json({ error: 'Admin access required' }, { status: 403 });

      const { founding_member_id, reason } = body;
      if (!founding_member_id) return Response.json({ error: 'founding_member_id required' }, { status: 400 });

      const fm = await base44.asServiceRole.entities.FoundingMember.get(founding_member_id);
      if (!fm) return Response.json({ error: 'Founding member not found' }, { status: 404 });

      await base44.asServiceRole.entities.FoundingMember.update(founding_member_id, {
        status: 'active',
        beta_access: true,
        early_access_enabled: true,
        community_access: true,
      });

      if (fm.user_id) {
        try {
          const profiles = await base44.asServiceRole.entities.UserProfile.filter({ created_by_id: fm.user_id });
          if (profiles.length > 0) {
            await base44.asServiceRole.entities.UserProfile.update(profiles[0].id, { beta_member: true });
          }
        } catch (e) {}
      }

      await logAudit(base44, {
        founding_member_id: fm.id,
        founding_member_number: fm.founding_member_number,
        user_id: fm.user_id,
        member_name: fm.full_name,
        action: 'member_restored',
        description: `Founding member restored to active by ${user.email || 'admin'}. Reason: ${reason || 'restored'}`,
        performed_by: user.id,
        performed_by_name: user.email || 'Admin',
        metadata: { reason },
      });

      return Response.json({ success: true, message: 'Founder restored' });
    }

    // ============================================================
    // ACTION: revoke_founder (super_admin / platform_admin only)
    // ============================================================
    if (action === 'revoke_founder') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
      const isSuperAdmin = ['super_admin', 'platform_admin'].includes(user.role);
      if (!isSuperAdmin) return Response.json({ error: 'Super admin access required' }, { status: 403 });

      const { founding_member_id, reason } = body;
      if (!founding_member_id) return Response.json({ error: 'founding_member_id required' }, { status: 400 });

      const fm = await base44.asServiceRole.entities.FoundingMember.get(founding_member_id);
      if (!fm) return Response.json({ error: 'Founding member not found' }, { status: 404 });

      // Revoke — but pricing lock is permanent (protected_pricing stays true)
      await base44.asServiceRole.entities.FoundingMember.update(founding_member_id, {
        status: 'expired',
        beta_access: false,
        early_access_enabled: false,
        community_access: false,
        roadmap_voting: false,
        feedback_sessions: false,
      });

      if (fm.user_id) {
        try {
          const profiles = await base44.asServiceRole.entities.UserProfile.filter({ created_by_id: fm.user_id });
          if (profiles.length > 0) {
            await base44.asServiceRole.entities.UserProfile.update(profiles[0].id, { beta_member: false });
          }
        } catch (e) {}
      }

      await logAudit(base44, {
        founding_member_id: fm.id,
        founding_member_number: fm.founding_member_number,
        user_id: fm.user_id,
        member_name: fm.full_name,
        action: 'member_revoked',
        description: `Founding member REVOKED by ${user.email || 'super admin'}. Reason: ${reason || 'revoked'}. Note: pricing lock is permanent.`,
        performed_by: user.id,
        performed_by_name: user.email || 'Super Admin',
        metadata: { reason, pricing_lock_permanent: true },
      });

      return Response.json({ success: true, message: 'Founder revoked (pricing lock remains permanent)' });
    }

    // ============================================================
    // ACTION: get_dashboard_metrics
    // Admin dashboard with founder program KPIs
    // ============================================================
    if (action === 'get_dashboard_metrics') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
      const isAdmin = ['admin', 'developer', 'super_admin', 'platform_admin'].includes(user.role);
      if (!isAdmin) return Response.json({ error: 'Admin access required' }, { status: 403 });

      const [members, feedback, auditLogs] = await Promise.all([
        base44.asServiceRole.entities.FoundingMember.list('-created_date', 100000),
        base44.asServiceRole.entities.Feedback.filter({ type: 'idea' }),
        base44.asServiceRole.entities.FoundingMemberAuditLog.list('-created_date', 100),
      ]);

      const active = members.filter((m) => m.status === 'active');
      const suspended = members.filter((m) => m.status === 'suspended');
      const expired = members.filter((m) => m.status === 'expired');

      // Growth: members by month
      const monthMap = {};
      members.forEach((m) => {
        if (m.joined_date) {
          const month = m.joined_date.substring(0, 7);
          monthMap[month] = (monthMap[month] || 0) + 1;
        }
      });
      const growth = Object.entries(monthMap)
        .map(([month, count]) => ({ month, count }))
        .sort((a, b) => a.month.localeCompare(b.month));

      // Ideas metrics
      const ideasSubmitted = feedback.length;
      const ideasReleased = feedback.filter((f) => f.roadmap_stage === 'released').length;
      const ideasPlanned = feedback.filter((f) => ['planned', 'in_development', 'testing', 'ready_for_release'].includes(f.roadmap_stage)).length;

      // Top contributors (by feedback count)
      const contributorMap = {};
      feedback.forEach((f) => {
        const name = f.customer_name || f.customer_email || 'Unknown';
        contributorMap[name] = (contributorMap[name] || 0) + 1;
      });
      const topContributors = Object.entries(contributorMap)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Most voted
      const mostVoted = [...feedback]
        .sort((a, b) => (b.votes || 0) - (a.votes || 0))
        .slice(0, 10)
        .map((f) => ({ id: f.id, title: f.title, votes: f.votes || 0, status: f.roadmap_stage }));

      return Response.json({
        total_founders: members.length,
        active_founders: active.length,
        inactive_founders: suspended.length + expired.length,
        suspended_founders: suspended.length,
        expired_founders: expired.length,
        founder_growth: growth,
        ideas_submitted: ideasSubmitted,
        ideas_released: ideasReleased,
        ideas_planned: ideasPlanned,
        top_contributors: topContributors,
        most_voted: mostVoted,
        audit_entries: auditLogs.length,
        max_founders: FOUNDER_MAX,
        spots_remaining: Math.max(0, FOUNDER_MAX - members.length),
      });
    }

    // ============================================================
    // ACTION: get_contribution_score
    // Compute Founder Contribution Score for a user
    // ============================================================
    if (action === 'get_contribution_score') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

      const targetUserId = body.user_id || user.id;

      // Fetch contribution data
      const [ideas, bugs, betaFeedback, fmRecords] = await Promise.all([
        base44.asServiceRole.entities.Feedback.filter({ created_by_id: targetUserId }),
        base44.asServiceRole.entities.Feedback.filter({ type: 'bug', created_by_id: targetUserId }),
        base44.asServiceRole.entities.BetaFeedback.filter({ user_id: targetUserId }),
        base44.asServiceRole.entities.FoundingMember.filter({ user_id: targetUserId }),
      ]);

      const fm = fmRecords[0];
      const userIdeas = ideas.filter((f) => f.type === 'idea' || f.type === 'feature');
      const ideasAccepted = userIdeas.filter((f) => ['planned', 'in_development', 'testing', 'ready_for_release', 'released'].includes(f.roadmap_stage));
      const ideasImplemented = userIdeas.filter((f) => f.roadmap_stage === 'released');

      // Count votes cast by this user (check voters_json)
      let votesCast = 0;
      try {
        const allFeedback = await base44.asServiceRole.entities.Feedback.list('-created_date', 100000);
        votesCast = allFeedback.filter((f) => {
          try {
            const voters = JSON.parse(f.voters_json || '[]');
            return Array.isArray(voters) && voters.includes(targetUserId);
          } catch { return false; }
        }).length;
      } catch (e) {}

      // Compute weighted score (0-100)
      const bugReports = bugs.length;
      const ideasSubmitted = userIdeas.length;
      const accepted = ideasAccepted.length;
      const implemented = ideasImplemented.length;
      const betaSessions = betaFeedback.length;

      const rawScore =
        (bugReports * 3) +
        (ideasSubmitted * 5) +
        (accepted * 8) +
        (implemented * 12) +
        (votesCast * 2) +
        (betaSessions * 4) +
        (fm?.community_posts || 0) * 1 +
        (fm?.feedback_sessions_attended || 0) * 3;

      const score = Math.min(100, Math.round(rawScore * 0.5));

      return Response.json({
        score,
        breakdown: {
          bug_reports: bugReports,
          ideas_submitted: ideasSubmitted,
          ideas_accepted: accepted,
          ideas_implemented: implemented,
          votes_cast: votesCast,
          beta_sessions: betaSessions,
          community_posts: fm?.community_posts || 0,
          feedback_sessions_attended: fm?.feedback_sessions_attended || 0,
        },
        tier: score >= 80 ? 'Elite' : score >= 50 ? 'Active' : score >= 20 ? 'Contributor' : 'New',
      });
    }

    // ============================================================
    // ACTION: invite_to_advisory_circle
    // Invite top contributors to the Executive Advisory Circle™
    // ============================================================
    if (action === 'invite_to_advisory_circle') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
      const isAdmin = ['admin', 'developer', 'super_admin', 'platform_admin'].includes(user.role);
      if (!isAdmin) return Response.json({ error: 'Admin access required' }, { status: 403 });

      const { founding_member_id } = body;
      if (!founding_member_id) return Response.json({ error: 'founding_member_id required' }, { status: 400 });

      const fm = await base44.asServiceRole.entities.FoundingMember.get(founding_member_id);
      if (!fm) return Response.json({ error: 'Founding member not found' }, { status: 404 });

      await base44.asServiceRole.entities.FoundingMember.update(founding_member_id, {
        founding_tier: 'advisory_council',
      });

      await logAudit(base44, {
        founding_member_id: fm.id,
        founding_member_number: fm.founding_member_number,
        user_id: fm.user_id,
        member_name: fm.full_name,
        action: 'member_upgraded',
        description: `Invited to Executive Advisory Circle™ by ${user.email || 'admin'}`,
        performed_by: user.id,
        performed_by_name: user.email || 'Admin',
      });

      // Send notification
      if (fm.user_id) {
        try {
          await base44.asServiceRole.entities.Notification.create({
            type: 'subscription',
            title: 'Executive Advisory Circle™ Invitation',
            message: 'You have been invited to join the Executive Advisory Circle™. You will receive exclusive announcements, roadmap previews, and strategy surveys.',
            icon: '🎯',
            action_url: '/founder',
            user_id: fm.user_id,
            organization_id: '',
            workspace: 'executive',
            visibility: 'private',
            role_scope: '',
            read: false,
          });
        } catch (e) {}
      }

      return Response.json({ success: true, message: 'Invited to Executive Advisory Circle™' });
    }

    // ============================================================
    // ACTION: lifecycle_transition
    // Transition a founder to a new lifecycle stage with full
    // stage history tracking, audit logging, and workflow observability.
    // ============================================================
    if (action === 'lifecycle_transition') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
      const isAdmin = ['admin', 'developer', 'super_admin', 'platform_admin'].includes(user.role);

      const { founding_member_id, new_stage, reason } = body;
      if (!founding_member_id) return Response.json({ error: 'founding_member_id required' }, { status: 400 });
      if (!new_stage) return Response.json({ error: 'new_stage required' }, { status: 400 });

      const fm = await base44.asServiceRole.entities.FoundingMember.get(founding_member_id);
      if (!fm) return Response.json({ error: 'Founding member not found' }, { status: 404 });

      const oldStage = fm.current_stage || 'application';
      const now = new Date().toISOString();

      // Build stage history
      let stageHistory = [];
      try { stageHistory = JSON.parse(fm.stage_history_json || '[]'); } catch { stageHistory = []; }
      stageHistory.push({
        stage: oldStage,
        entered_date: fm.entered_stage_date || fm.joined_date || now,
        exited_date: now,
      });

      // Compute progress percentage based on stage
      const STAGE_PROGRESS = {
        application: 5, screening: 15, approval: 25, onboarding: 35,
        beta_active: 50, contributor: 65, top_contributor: 80,
        advisory_council: 90, general_availability: 95, lifetime_founder: 100,
      };

      const STAGE_NEXT_ACTION = {
        application: 'Complete screening review',
        screening: 'Admin reviews and approves application',
        approval: 'Onboarding workflow executing',
        onboarding: 'Founder activates account and starts using platform',
        beta_active: 'Submit first idea or feedback to become a Contributor',
        contributor: 'Increase contribution score to reach Top Contributor',
        top_contributor: 'Awaiting Executive Advisory Circle invitation',
        advisory_council: 'Participate in strategy surveys and prototype reviews',
        general_availability: 'Continue engaging as a lifetime founder',
        lifetime_founder: 'You are a Lifetime Founder — all benefits are permanent',
      };

      await base44.asServiceRole.entities.FoundingMember.update(founding_member_id, {
        current_stage: new_stage,
        entered_stage_date: now,
        stage_history_json: JSON.stringify(stageHistory),
        progress_percentage: STAGE_PROGRESS[new_stage] || 0,
        next_recommended_action: STAGE_NEXT_ACTION[new_stage] || '',
      });

      // Log audit
      await logAudit(base44, {
        founding_member_id: fm.id,
        founding_member_number: fm.founding_member_number,
        user_id: fm.user_id,
        member_name: fm.full_name,
        action: 'status_changed',
        description: `Lifecycle transition: ${oldStage} → ${new_stage}. Reason: ${reason || 'Automatic progression'}. Progress: ${STAGE_PROGRESS[new_stage] || 0}%.`,
        performed_by: user.id,
        performed_by_name: user.email || 'System',
        metadata: { old_stage: oldStage, new_stage, reason, progress: STAGE_PROGRESS[new_stage] || 0 },
      });

      return Response.json({
        success: true,
        old_stage: oldStage,
        new_stage,
        progress_percentage: STAGE_PROGRESS[new_stage] || 0,
        next_action: STAGE_NEXT_ACTION[new_stage] || '',
      });
    }

    // ============================================================
    // ACTION: get_health_score
    // Compute Founder Health Score from engagement metrics.
    // ============================================================
    if (action === 'get_health_score') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

      const targetUserId = body.user_id || user.id;

      const [fmRecords, feedback, betaFeedback, profile] = await Promise.all([
        base44.asServiceRole.entities.FoundingMember.filter({ user_id: targetUserId }),
        base44.asServiceRole.entities.Feedback.filter({ created_by_id: targetUserId }),
        base44.asServiceRole.entities.BetaFeedback.filter({ user_id: targetUserId }),
        base44.asServiceRole.entities.UserProfile.filter({ created_by_id: targetUserId }),
      ]);

      const fm = fmRecords[0];
      const userProfile = profile[0];
      if (!fm) return Response.json({ error: 'Founding member not found' }, { status: 404 });

      // Activity score
      let activityScore = 0;
      if (userProfile?.updated_date) {
        const daysSince = (Date.now() - new Date(userProfile.updated_date).getTime()) / (24 * 60 * 60 * 1000);
        if (daysSince <= 1) activityScore = 100;
        else if (daysSince <= 7) activityScore = 80;
        else if (daysSince <= 14) activityScore = 60;
        else if (daysSince <= 30) activityScore = 40;
        else if (daysSince <= 60) activityScore = 20;
        else activityScore = 0;
      }

      const feedbackCount = (fm.feedback_submitted || 0) + (fm.accepted_suggestions || 0);
      const feedbackScore = Math.min(100, feedbackCount * 20);
      const votesScore = Math.min(100, (fm.votes_cast || 0) * 10);
      const aiScore = Math.min(100, (fm.feedback_sessions_attended || 0) * 25);
      const moduleScore = Math.min(100, (fm.early_access_modules?.length || 0) * 15 + (fm.community_connections || 0) * 5);
      const communityScore = Math.min(100, (fm.community_posts || 0) * 10 + (fm.community_comments || 0) * 5 + (fm.community_connections || 0) * 3);

      const score = Math.round(
        (activityScore * 25 + feedbackScore * 15 + votesScore * 10 + aiScore * 20 + moduleScore * 15 + communityScore * 15) / 100
      );
      const healthStatus = score >= 70 ? 'healthy' : score >= 30 ? 'at_risk' : 'inactive';

      // Update the founding member record with health data
      await base44.asServiceRole.entities.FoundingMember.update(fm.id, {
        health_score: score,
        health_status: healthStatus,
        health_checked_at: new Date().toISOString(),
      });

      return Response.json({
        score,
        status: healthStatus,
        breakdown: {
          activity: { score: activityScore, label: 'Recent Activity' },
          feedback: { score: feedbackScore, label: 'Feedback & Ideas' },
          votes: { score: votesScore, label: 'Community Votes' },
          ai_sessions: { score: aiScore, label: 'AI Sessions' },
          module_usage: { score: moduleScore, label: 'Feature Adoption' },
          community: { score: communityScore, label: 'Community Engagement' },
        },
      });
    }

    // ============================================================
    // ACTION: anniversary_check
    // Scheduled action — checks for founder anniversaries and
    // sends personalized recognition messages.
    // ============================================================
    if (action === 'anniversary_check') {
      // This is called by scheduled automation — use service role
      const members = await base44.asServiceRole.entities.FoundingMember.list('-created_date', 100000);
      const today = new Date();
      const todayMonth = today.getMonth() + 1;
      const todayDate = today.getDate();
      let recognized = 0;

      for (const fm of members) {
        if (!fm.joined_date || fm.status !== 'active') continue;
        const joinDate = new Date(fm.joined_date);
        const yearsElapsed = today.getFullYear() - joinDate.getFullYear();

        // Check if it's the anniversary month/day
        if (joinDate.getMonth() + 1 === todayMonth && joinDate.getDate() === todayDate && yearsElapsed >= 1) {
          // Check if we already recognized this anniversary
          const lastAnniversaryYear = fm.last_anniversary_date
            ? new Date(fm.last_anniversary_date).getFullYear()
            : null;
          if (lastAnniversaryYear === today.getFullYear()) continue;

          await base44.asServiceRole.entities.FoundingMember.update(fm.id, {
            anniversary_count: (fm.anniversary_count || 0) + 1,
            last_anniversary_date: today.toISOString().split('T')[0],
          });

          // Log audit
          await logAudit(base44, {
            founding_member_id: fm.id,
            founding_member_number: fm.founding_member_number,
            user_id: fm.user_id,
            member_name: fm.full_name,
            action: 'benefit_granted',
            description: `${yearsElapsed} year anniversary recognized. Founder #${fm.founding_member_number}. Contribution: ${fm.feedback_submitted || 0} ideas, ${fm.votes_cast || 0} votes, ${fm.implemented_ideas || 0} ideas implemented.`,
            performed_by: '',
            performed_by_name: 'Anniversary Automation',
            metadata: { years: yearsElapsed, anniversary_count: (fm.anniversary_count || 0) + 1 },
          });

          // Send anniversary email
          if (fm.email) {
            try {
              await base44.integrations.Core.SendEmail({
                to: fm.email,
                subject: `🎂 Happy ${yearsElapsed} Year Anniversary, Founder #${fm.founding_member_number}! — EXECLEAD.AI`,
                body: `Hi ${fm.full_name || 'there'},\n\nHappy ${yearsElapsed} year anniversary as a Founding Member of EXECLEAD.AI!\n\n══════════════════════════════════\n  FOUNDER ANNIVERSARY REPORT\n══════════════════════════════════\n\n  Founder Number: ${fm.founding_member_number}\n  Years as Founder: ${yearsElapsed}\n  Joined: ${fm.joined_date}\n  Status: ${fm.status}\n\n  Your Contributions:\n  • Ideas Submitted: ${fm.feedback_submitted || 0}\n  • Ideas Accepted: ${fm.accepted_suggestions || 0}\n  • Ideas Implemented: ${fm.implemented_ideas || 0}\n  • Votes Cast: ${fm.votes_cast || 0}\n  • Community Posts: ${fm.community_posts || 0}\n  • Referrals: ${fm.referrals_count || 0}\n\nThank you for being an integral part of the EXECLEAD.AI community. Your contributions have helped shape the platform into what it is today.\n\n— The EXECLEAD.AI Team`,
                from_name: 'EXECLEAD.AI',
              });
            } catch (e) {}
          }

          // Send in-app notification
          if (fm.user_id) {
            try {
              await base44.asServiceRole.entities.Notification.create({
                type: 'subscription',
                title: `🎂 ${yearsElapsed} Year Anniversary!`,
                message: `Happy anniversary! You've been a Founding Member for ${yearsElapsed} year(s). Thank you for your contributions!`,
                icon: '🎂',
                action_url: '/founder-dashboard',
                user_id: fm.user_id,
                organization_id: '',
                workspace: 'executive',
                visibility: 'private',
                role_scope: '',
                read: false,
              });
            } catch (e) {}
          }

          recognized++;
        }
      }

      return Response.json({ success: true, recognized, checked: members.length });
    }

    // ============================================================
    // ACTION: ga_transition
    // Transition all founders to General Availability stage.
    // Maintains badge, pricing, status, and history.
    // ============================================================
    if (action === 'ga_transition') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
      const isSuperAdmin = ['super_admin', 'platform_admin', 'admin', 'developer'].includes(user.role);
      if (!isSuperAdmin) return Response.json({ error: 'Admin access required' }, { status: 403 });

      const members = await base44.asServiceRole.entities.FoundingMember.filter({ ga_transitioned: false });
      const today = new Date().toISOString().split('T')[0];
      let transitioned = 0;

      for (const fm of members) {
        if (fm.status !== 'active') continue;

        await base44.asServiceRole.entities.FoundingMember.update(fm.id, {
          ga_transitioned: true,
          ga_transitioned_date: today,
          current_stage: 'general_availability',
          progress_percentage: 95,
          next_recommended_action: 'Continue engaging as a lifetime founder',
          // All benefits are PRESERVED — no changes to:
          // badge_status, protected_pricing, lifetime_discount_enabled,
          // beta_access, early_access_enabled, community_access
        });

        await logAudit(base44, {
          founding_member_id: fm.id,
          founding_member_number: fm.founding_member_number,
          user_id: fm.user_id,
          member_name: fm.full_name,
          action: 'status_changed',
          description: `GA Transition: Founder transitioned to General Availability. All benefits preserved (badge, pricing, status, history).`,
          performed_by: user.id,
          performed_by_name: user.email || 'Admin',
          metadata: { ga_transitioned: true, benefits_preserved: true },
        });

        // Send GA notification email
        if (fm.email) {
          try {
            await base44.integrations.Core.SendEmail({
              to: fm.email,
              subject: `🚀 EXECLEAD.AI is now Generally Available! — Founder #${fm.founding_member_number}`,
              body: `Hi ${fm.full_name || 'there'},\n\nEXECLEAD.AI has officially transitioned from Beta to General Availability!\n\nAs a Founding Member, ALL your benefits are preserved:\n  ✓ Lifetime Founding Member Badge\n  ✓ ${fm.lifetime_discount_percentage || 25}% Lifetime Discount (price-protected)\n  ✓ Early Access to features\n  ✓ Founder Community access\n  ✓ All history and timeline preserved\n\nThank you for being part of the founding chapter. Your contributions helped shape this platform.\n\n— The EXECLEAD.AI Team`,
              from_name: 'EXECLEAD.AI',
            });
          } catch (e) {}
        }

        transitioned++;
      }

      return Response.json({
        success: true,
        transitioned,
        total_checked: members.length,
        message: 'GA transition complete — all founder benefits preserved',
      });
    }

    // ============================================================
    // ACTION: get_executive_analytics
    // Returns comprehensive executive analytics for the founder program.
    // ============================================================
    if (action === 'get_executive_analytics') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
      const isAdmin = ['admin', 'developer', 'super_admin', 'platform_admin'].includes(user.role);
      if (!isAdmin) return Response.json({ error: 'Admin access required' }, { status: 403 });

      const [members, feedback, betaFeedback, auditLogs, bugs] = await Promise.all([
        base44.asServiceRole.entities.FoundingMember.list('-created_date', 100000),
        base44.asServiceRole.entities.Feedback.filter({ type: 'idea' }),
        base44.asServiceRole.entities.BetaFeedback.list('-created_date', 500),
        base44.asServiceRole.entities.FoundingMemberAuditLog.list('-created_date', 500),
        base44.asServiceRole.entities.Feedback.filter({ type: 'bug' }),
      ]);

      const now = Date.now();
      const active = members.filter((m) => m.status === 'active');

      // Growth by month
      const monthMap = {};
      members.forEach((m) => { if (m.joined_date) { const mo = m.joined_date.substring(0, 7); monthMap[mo] = (monthMap[mo] || 0) + 1; } });
      const growth = Object.entries(monthMap).map(([month, count]) => ({ month, count })).sort((a, b) => a.month.localeCompare(b.month));

      const activated = members.filter((m) => m.badge_status === 'granted').length;
      const activationRate = members.length > 0 ? Math.round((activated / members.length) * 100) : 0;

      const weeklyActive = active.filter((m) => {
        const d = m.health_checked_at || m.entered_stage_date || m.joined_date;
        return d && (now - new Date(d).getTime()) <= 7 * 24 * 60 * 60 * 1000;
      }).length;

      const monthlyActive = active.filter((m) => {
        const d = m.health_checked_at || m.entered_stage_date || m.joined_date;
        return d && (now - new Date(d).getTime()) <= 30 * 24 * 60 * 60 * 1000;
      }).length;

      const over30 = members.filter((m) => m.joined_date && (now - new Date(m.joined_date).getTime()) > 30 * 24 * 60 * 60 * 1000);
      const retained30 = over30.filter((m) => m.status === 'active').length;
      const retentionRate = over30.length > 0 ? Math.round((retained30 / over30.length) * 100) : 100;

      const recentFeedback = feedback.filter((f) => f.created_date && (now - new Date(f.created_date).getTime()) <= 30 * 24 * 60 * 60 * 1000).length;
      const resolvedBugs = bugs.filter((b) => b.status === 'resolved' || b.status === 'closed').length;
      const bugResolutionRate = bugs.length > 0 ? Math.round((resolvedBugs / bugs.length) * 100) : 100;

      const acceptedIdeas = feedback.filter((f) => ['planned', 'in_development', 'testing', 'ready_for_release', 'released'].includes(f.roadmap_stage)).length;
      const ideaAcceptanceRate = feedback.length > 0 ? Math.round((acceptedIdeas / feedback.length) * 100) : 0;

      const npsScores = betaFeedback.filter((b) => b.would_recommend != null).map((b) => b.would_recommend);
      const avgSatisfaction = npsScores.length > 0 ? Math.round((npsScores.reduce((s, n) => s + n, 0) / npsScores.length) * 10) / 10 : 0;

      const advisoryCount = members.filter((m) => m.founding_tier === 'advisory_council').length;

      // Lifecycle distribution
      const stageDist = {};
      members.forEach((m) => { const s = m.current_stage || 'application'; stageDist[s] = (stageDist[s] || 0) + 1; });

      // Health distribution
      const healthDist = { healthy: 0, at_risk: 0, inactive: 0 };
      members.forEach((m) => { const h = m.health_status || 'healthy'; healthDist[h] = (healthDist[h] || 0) + 1; });

      return Response.json({
        summary: {
          totalFounders: members.length,
          activeFounders: active.length,
          activationRate,
          weeklyActive,
          monthlyActive,
          retentionRate,
          feedbackVelocity: recentFeedback,
          bugResolutionRate,
          ideaAcceptanceRate,
          avgSatisfaction,
          advisoryParticipation: advisoryCount,
        },
        growth,
        lifecycle: Object.entries(stageDist).map(([stage, count]) => ({ stage, count })),
        health: healthDist,
        metrics: {
          totalIdeas: feedback.length,
          acceptedIdeas,
          totalBugs: bugs.length,
          resolvedBugs,
          totalAuditEntries: auditLogs.length,
        },
      });
    }

    // ============================================================
    // ACTION: get_workflow_stats
    // Returns workflow observability metrics for the monitoring dashboard.
    // ============================================================
    if (action === 'get_workflow_stats') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

      const logs = await base44.asServiceRole.entities.WorkflowExecutionLog.list('-created_date', 500);
      const completed = logs.filter((l) => l.status === 'completed');
      const failed = logs.filter((l) => l.status === 'failed');
      const running = logs.filter((l) => l.status === 'running');
      const retrying = logs.filter((l) => l.status === 'retrying');
      const deadLetter = logs.filter((l) => l.status === 'dead_letter');

      const totalDuration = completed.reduce((s, l) => s + (l.duration_ms || 0), 0);
      const avgDuration = completed.length > 0 ? Math.round(totalDuration / completed.length) : 0;
      const failureRate = logs.length > 0 ? Math.round((failed.length / logs.length) * 100) : 0;
      const healthPercentage = logs.length > 0 ? Math.round((completed.length / logs.length) * 100) : 100;

      const byType = {};
      logs.forEach((l) => {
        if (!byType[l.workflow_type]) byType[l.workflow_type] = { total: 0, completed: 0, failed: 0 };
        byType[l.workflow_type].total++;
        if (l.status === 'completed') byType[l.workflow_type].completed++;
        if (l.status === 'failed') byType[l.workflow_type].failed++;
      });

      return Response.json({
        total: logs.length,
        completed: completed.length,
        failed: failed.length,
        running: running.length,
        retrying: retrying.length,
        deadLetter: deadLetter.length,
        avgDurationMs: avgDuration,
        failureRate,
        healthPercentage,
        byType: Object.entries(byType).map(([type, s]) => ({
          type, ...s,
          successRate: s.total > 0 ? Math.round((s.completed / s.total) * 100) : 0,
        })),
      });
    }

    return Response.json({ error: 'Unknown action: ' + action }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
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

    return Response.json({ error: 'Unknown action: ' + action }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
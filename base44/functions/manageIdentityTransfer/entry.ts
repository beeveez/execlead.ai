import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { resolveAuthoritativeOrgAccess } from '../../shared/authoritativeOrgAccess.ts';

const GRACE_PERIOD_DAYS = 30;

async function safeFilter(base44, entityName, filterObj, sort, limit) {
  try {
    return await base44.asServiceRole.entities[entityName].filter(filterObj, sort, limit || 100);
  } catch {
    return [];
  }
}

function daysBetween(endDate) {
  const now = new Date();
  const ends = new Date(endDate);
  return Math.max(0, Math.ceil((ends - now) / (1000 * 60 * 60 * 24)));
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { action } = body;

    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // ── MEMBER: Get active transfer + grace period status ──
    if (action === 'get_my_transfer') {
      const transfers = await safeFilter(base44, 'ExecutiveIdentityTransfer',
        { user_id: user.id, status: { $in: ['grace_period', 'transfer_pending'] } },
        '-created_date', 5);
      if (transfers.length === 0) {
        return Response.json({ active_transfer: null });
      }
      const transfer = transfers[0];
      const daysRemaining = daysBetween(transfer.grace_period_ends_at);
      return Response.json({
        active_transfer: transfer,
        days_remaining: daysRemaining,
        grace_period_expired: daysRemaining === 0
      });
    }

    // ── MEMBER: Review personal assets before transfer ──
    if (action === 'review_personal_assets') {
      const profiles = await safeFilter(base44, 'UserProfile', { created_by_id: user.id });
      const profile = profiles[0];
      if (!profile) return Response.json({ error: 'Profile not found' }, { status: 404 });

      const [letters, reputation, resumes, certificates, journal, simulations, challenges, wallet, legacy, dna, memory, referrals, comments, posts] = await Promise.all([
        safeFilter(base44, 'LeadershipLetter', { author_user_id: user.id }),
        safeFilter(base44, 'ExecutiveReputation', { user_id: user.id }),
        safeFilter(base44, 'ResumeVersion', { created_by_id: user.id }),
        safeFilter(base44, 'Certificate', { created_by_id: user.id }),
        safeFilter(base44, 'JournalEntry', { created_by_id: user.id }),
        safeFilter(base44, 'SimulationSession', { created_by_id: user.id }),
        safeFilter(base44, 'ChallengeResult', { created_by_id: user.id }),
        safeFilter(base44, 'ExecutiveWallet', { user_id: user.id }),
        safeFilter(base44, 'ExecutiveLegacy', { created_by_id: user.id }),
        safeFilter(base44, 'LeadershipDNA', { created_by_id: user.id }),
        safeFilter(base44, 'ExecutiveMemory', { user_id: user.id }),
        safeFilter(base44, 'Referral', { referrer_user_id: user.id }),
        safeFilter(base44, 'LetterComment', { user_id: user.id }),
        safeFilter(base44, 'NetworkPost', { created_by_id: user.id }),
      ]);

      return Response.json({
        profile: { name: profile.full_name, headline: profile.professional_headline, photo: profile.profile_photo },
        personal_assets: [
          { label: 'Executive Profile', count: 1 },
          { label: 'Leadership Letters', count: letters.length },
          { label: 'Executive Reputation', count: reputation.length },
          { label: 'Resume Versions', count: resumes.length },
          { label: 'Certificates', count: certificates.length },
          { label: 'Journal Entries', count: journal.length },
          { label: 'Simulation Sessions', count: simulations.length },
          { label: 'Challenge Results', count: challenges.length },
          { label: 'Executive Wallet', count: wallet.length },
          { label: 'Executive Legacy', count: legacy.length },
          { label: 'Leadership DNA', count: dna.length },
          { label: 'AI Memory', count: memory.length },
          { label: 'Referrals', count: referrals.length },
          { label: 'Community Comments', count: comments.length },
          { label: 'Community Posts', count: posts.length },
        ],
        company_assets: [
          'Enterprise Dashboards',
          'Organization Analytics',
          'Internal Assessments',
          'Learning Assignments',
          'Succession Plans',
          'Department Membership',
          'Manager Assignments',
          'Private Company Communities',
        ]
      });
    }

    // ── MEMBER: Complete transfer with chosen plan ──
    if (action === 'complete_transfer') {
      const { chosen_plan } = body;
      if (!['free', 'professional', 'executive'].includes(chosen_plan)) {
        return Response.json({ error: 'Invalid plan choice' }, { status: 400 });
      }

      const profiles = await safeFilter(base44, 'UserProfile', { created_by_id: user.id });
      const profile = profiles[0];
      if (!profile) return Response.json({ error: 'Profile not found' }, { status: 404 });

      const transfers = await safeFilter(base44, 'ExecutiveIdentityTransfer',
        { user_id: user.id, status: { $in: ['grace_period', 'transfer_pending'] } },
        '-created_date', 1);
      if (transfers.length === 0) {
        return Response.json({ error: 'No active transfer found' }, { status: 404 });
      }
      const transfer = transfers[0];

      // Snapshot company-specific data for employer archive
      const companyArchive = {
        custom_role: profile.custom_role,
        department: profile.department,
        department_id: profile.department_id,
        manager_id: profile.manager_id,
        manager_name: profile.manager_name,
        organization_id: profile.organization_id,
        subscription_plan: profile.subscription_plan,
      };

      // Separate: remove org associations, set new plan
      // Personal data (letters, reputation, resume, etc.) is already user-scoped — untouched.
      await base44.asServiceRole.entities.UserProfile.update(profile.id, {
        organization_id: '',
        custom_role: '',
        department: '',
        department_id: '',
        manager_id: '',
        manager_name: '',
        subscription_plan: chosen_plan,
        subscription_status: chosen_plan === 'free' ? 'active' : 'pending_payment',
        subscription_cycle: 'monthly',
      });

      // Mark transfer complete
      await base44.asServiceRole.entities.ExecutiveIdentityTransfer.update(transfer.id, {
        status: 'completed',
        chosen_plan,
        chosen_plan_at: new Date().toISOString(),
        transferred_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        company_data_archived: true,
        company_data_archive_json: JSON.stringify(companyArchive),
        enterprise_features_revoked: true,
      });

      // End the affiliation for this organization (other affiliations remain)
      const userAffs = await safeFilter(base44, 'ExecutiveAffiliation',
        { user_id: user.id, organization_id: transfer.organization_id, status: 'active' });
      if (userAffs.length > 0) {
        await base44.asServiceRole.entities.ExecutiveAffiliation.update(userAffs[0].id, {
          status: 'ended',
          ended_at: new Date().toISOString(),
        });
      }

      return Response.json({
        success: true,
        chosen_plan,
        completed_at: new Date().toISOString()
      });
    }

    // ── ADMIN: Initiate offboarding for a member ──
    if (action === 'initiate_offboarding') {
      const { target_user_id, reason, notify_member } = body;
      if (!target_user_id) return Response.json({ error: 'target_user_id required' }, { status: 400 });
      const adminAccess = await resolveAuthoritativeOrgAccess(base44, user, {
        requestedOrgId: body.organization_id,
      });
      if (!adminAccess) {
        return Response.json({ error: 'Only verified organization admins can offboard members.' }, { status: 403 });
      }

      // Founder (role-based) & last-of-kind protection (deploy retry)
      let tUser = null;
      try { tUser = await base44.asServiceRole.entities.User.get(target_user_id); } catch (_) {}
      if (tUser) {
        if (tUser.role === 'founder_root_admin') {
          return Response.json({ error: 'This is the protected Founder account and cannot be deleted.' }, { status: 400 });
        }
        const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 500);
        const covers = (u, roles) => u.role === 'super_admin' || roles.includes(u.role);
        const PA = ['super_admin', 'platform_admin'];
        if (covers(tUser, PA) && allUsers.filter(u => covers(u, PA)).length <= 1) {
          return Response.json({ error: 'Cannot delete the last Platform Administrator.' }, { status: 400 });
        }
        if (tUser.role === 'developer' && allUsers.filter(u => u.role === 'super_admin' || u.role === 'developer').length <= 1) {
          return Response.json({ error: 'Cannot delete the last Developer.' }, { status: 400 });
        }
        if (tUser.role === 'admin' && allUsers.filter(u => u.role === 'super_admin' || u.role === 'admin').length <= 1) {
          return Response.json({ error: 'Cannot delete the last Operations Administrator.' }, { status: 400 });
        }
      }

      const adminProfiles = await safeFilter(base44, 'UserProfile', { created_by_id: user.id });
      const adminProfile = adminProfiles[0];
      const targetMemberships = await safeFilter(base44, 'OrgMembership', {
        user_id: target_user_id,
        organization_id: adminAccess.orgId,
        status: 'active',
      }, '-created_date', 1);
      const targetProfiles = await safeFilter(base44, 'UserProfile', { created_by_id: target_user_id });
      const targetProfile = targetProfiles[0];
      if (!targetProfile || targetMemberships.length === 0) {
        return Response.json({ error: 'Target user is not a member of your organization.' }, { status: 400 });
      }
      if (target_user_id === user.id) {
        return Response.json({ error: 'You cannot offboard yourself. Transfer ownership first.' }, { status: 400 });
      }

      const org = adminAccess.organization;

      // Check for existing active transfer
      const existing = await safeFilter(base44, 'ExecutiveIdentityTransfer',
        { user_id: target_user_id, status: { $in: ['grace_period', 'transfer_pending'] } });
      if (existing.length > 0) {
        return Response.json({ error: 'An active offboarding already exists for this member.' }, { status: 400 });
      }

      const now = new Date();
      const graceEnds = new Date(now.getTime() + GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000);

      const transfer = await base44.asServiceRole.entities.ExecutiveIdentityTransfer.create({
        user_id: target_user_id,
        user_name: targetProfile.full_name || 'Unknown',
        user_email: targetProfile.email || '',
        organization_id: adminAccess.orgId,
        organization_name: org?.name || '',
        organization_admin_id: user.id,
        organization_admin_name: adminProfile?.full_name || user.email,
        trigger_reason: reason || 'admin_removed',
        status: 'grace_period',
        grace_period_days: GRACE_PERIOD_DAYS,
        grace_period_started_at: now.toISOString(),
        grace_period_ends_at: graceEnds.toISOString(),
        enterprise_features_revoked: false,
        previous_custom_role: targetProfile.custom_role,
        previous_department: targetProfile.department,
        previous_department_id: targetProfile.department_id,
        previous_manager_id: targetProfile.manager_id,
        previous_manager_name: targetProfile.manager_name,
        previous_subscription_plan: targetProfile.subscription_plan,
        notified: notify_member !== false,
        notified_at: notify_member !== false ? now.toISOString() : undefined,
        initiated_by_id: user.id,
        initiated_by_name: adminProfile?.full_name || user.email,
      });

      // Create affiliation record (retroactive if needed — preserves multi-org history)
      const existingAffs = await safeFilter(base44, 'ExecutiveAffiliation',
        { user_id: target_user_id, organization_id: adminAccess.orgId, status: 'active' });
      if (existingAffs.length === 0) {
        await base44.asServiceRole.entities.ExecutiveAffiliation.create({
          user_id: target_user_id,
          user_name: targetProfile.full_name || 'Unknown',
          organization_id: adminAccess.orgId,
          organization_name: org?.name || '',
          affiliation_type: 'employee',
          role_title: targetProfile.custom_role || '',
          department: targetProfile.department || '',
          department_id: targetProfile.department_id || '',
          is_primary: true,
          status: 'active',
          started_at: targetProfile.created_date || now.toISOString(),
          subscription_plan: targetProfile.subscription_plan || 'enterprise',
          sponsored_by_org: true,
        });
      }

      // Decrement seat count
      if (org && (org.seats_used || 0) > 0) {
        await base44.asServiceRole.entities.Organization.update(org.id, { seats_used: org.seats_used - 1 });
      }

      return Response.json({ success: true, transfer });
    }

    // ── ADMIN: Get offboarding queue ──
    if (action === 'get_offboarding_queue') {
      const reqId = `offboard-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      console.log(`[${reqId}] get_offboarding_queue — user: ${user.id} (${user.email})`);

      const adminAccess = await resolveAuthoritativeOrgAccess(base44, user, {
        requestedOrgId: body.organization_id,
      });
      if (!adminAccess) {
        console.warn(`[${reqId}] User ${user.id} has no authoritative organization admin membership`);
        return Response.json({
          error: 'Forbidden',
          details: 'Only verified organization admins can view the offboarding queue.'
        }, { status: 403 });
      }

      console.log(`[${reqId}] authoritative organization_id: ${adminAccess.orgId}`);

      const transfers = await safeFilter(base44, 'ExecutiveIdentityTransfer',
        { organization_id: adminAccess.orgId, status: { $in: ['grace_period', 'transfer_pending'] } },
        '-created_date', 50);

      const enriched = transfers.map(t => ({
        ...t,
        days_remaining: daysBetween(t.grace_period_ends_at),
        expired: daysBetween(t.grace_period_ends_at) === 0
      }));

      console.log(`[${reqId}] Returning ${enriched.length} offboarding records`);
      return Response.json({ queue: enriched });
    }

    // ── ADMIN: Rehire a previously offboarded member ──
    if (action === 'rehire') {
      const { target_user_id, new_custom_role } = body;
      if (!target_user_id) return Response.json({ error: 'target_user_id required' }, { status: 400 });

      const adminAccess = await resolveAuthoritativeOrgAccess(base44, user, {
        requestedOrgId: body.organization_id,
      });
      if (!adminAccess) {
        return Response.json({ error: 'Only verified organization admins can rehire members.' }, { status: 403 });
      }

      const targetProfiles = await safeFilter(base44, 'UserProfile', { created_by_id: target_user_id });
      const targetProfile = targetProfiles[0];
      if (!targetProfile) return Response.json({ error: 'Target user profile not found.' }, { status: 404 });

      // Prevent duplicate membership using the authoritative organization directory.
      const activeMemberships = await safeFilter(base44, 'OrgMembership', {
        user_id: target_user_id,
        status: 'active',
      }, '-created_date', 1);
      if (activeMemberships.length > 0) {
        return Response.json({ error: 'This member is already part of an organization.' }, { status: 400 });
      }

      const org = adminAccess.organization;

      // Rehire only into the same organization recorded by a completed transfer.
      const previousTransfers = await safeFilter(base44, 'ExecutiveIdentityTransfer',
        { user_id: target_user_id, organization_id: adminAccess.orgId, status: 'completed' }, '-created_date', 10);
      if (previousTransfers.length === 0) {
        return Response.json({ error: 'No completed transfer exists for this member in your organization.' }, { status: 403 });
      }

      // Reconnect: same profile, same reputation, same history — new org
      await base44.asServiceRole.entities.UserProfile.update(targetProfile.id, {
        organization_id: adminAccess.orgId,
        custom_role: new_custom_role || 'Enterprise User',
        subscription_plan: 'enterprise',
        subscription_status: 'active',
      });

      // Mark the most recent completed transfer as rehired
      if (previousTransfers.length > 0) {
        await base44.asServiceRole.entities.ExecutiveIdentityTransfer.update(previousTransfers[0].id, {
          rehired_to_organization_id: adminAccess.orgId,
          rehired_to_organization_name: org?.name || '',
          rehired_at: new Date().toISOString(),
        });
      }

      // Create new affiliation record (rehire — no duplicate profile)
      await base44.asServiceRole.entities.ExecutiveAffiliation.create({
        user_id: target_user_id,
        user_name: targetProfile.full_name || 'Unknown',
        organization_id: adminAccess.orgId,
        organization_name: org?.name || '',
        affiliation_type: 'employee',
        role_title: new_custom_role || 'Enterprise User',
        is_primary: true,
        status: 'active',
        started_at: new Date().toISOString(),
        subscription_plan: 'enterprise',
        sponsored_by_org: true,
      });

      // Increment seats
      if (org) {
        await base44.asServiceRole.entities.Organization.update(org.id, { seats_used: (org.seats_used || 0) + 1 });
      }

      return Response.json({
        success: true,
        rehired: true,
        previous_orgs: previousTransfers.map(t => ({ name: t.organization_name, completed_at: t.completed_at }))
      });
    }

    // ── MEMBER: Get all organization affiliations (multi-org support) ──
    if (action === 'get_affiliations') {
      const targetUserId = body.target_user_id || user.id;
      const affiliations = await safeFilter(base44, 'ExecutiveAffiliation',
        { user_id: targetUserId, status: 'active' }, '-created_date', 50);

      // Retroactive migration: synthesize affiliation from profile org_id if missing
      const profiles = await safeFilter(base44, 'UserProfile', { created_by_id: targetUserId });
      const profile = profiles[0];
      if (profile?.organization_id) {
        const hasAff = affiliations.some(a => a.organization_id === profile.organization_id);
        if (!hasAff) {
          let orgName = '';
          try {
            const org = await base44.asServiceRole.entities.Organization.get(profile.organization_id);
            orgName = org?.name || '';
          } catch {}
          const retro = await base44.asServiceRole.entities.ExecutiveAffiliation.create({
            user_id: targetUserId,
            user_name: profile.full_name || 'Unknown',
            organization_id: profile.organization_id,
            organization_name: orgName,
            affiliation_type: 'employee',
            role_title: profile.custom_role || '',
            department: profile.department || '',
            department_id: profile.department_id || '',
            is_primary: true,
            status: 'active',
            started_at: profile.created_date || new Date().toISOString(),
            subscription_plan: profile.subscription_plan || 'enterprise',
            sponsored_by_org: true,
          });
          affiliations.unshift(retro);
        }
      }

      return Response.json({ affiliations });
    }

    // ── MEMBER: Add a self-declared affiliation (board member, advisor, etc.) ──
    if (action === 'add_affiliation') {
      const { organization_name, affiliation_type, role_title, visibility } = body;
      if (!organization_name) return Response.json({ error: 'organization_name required' }, { status: 400 });

      const profiles = await safeFilter(base44, 'UserProfile', { created_by_id: user.id });
      const profile = profiles[0];

      const aff = await base44.asServiceRole.entities.ExecutiveAffiliation.create({
        user_id: user.id,
        user_name: profile?.full_name || user.email || 'Unknown',
        organization_name,
        affiliation_type: affiliation_type || 'advisor',
        role_title: role_title || '',
        is_primary: false,
        status: 'active',
        started_at: new Date().toISOString(),
        visibility: visibility || 'public',
        sponsored_by_org: false,
      });

      return Response.json({ success: true, affiliation: aff });
    }

    // ── MEMBER: End a self-declared affiliation ──
    if (action === 'end_affiliation') {
      const { affiliation_id } = body;
      if (!affiliation_id) return Response.json({ error: 'affiliation_id required' }, { status: 400 });

      const userAffs = await safeFilter(base44, 'ExecutiveAffiliation',
        { user_id: user.id, status: 'active' }, '-created_date', 500);
      const aff = userAffs.find(a => a.id === affiliation_id);
      if (!aff) return Response.json({ error: 'Affiliation not found' }, { status: 404 });

      await base44.asServiceRole.entities.ExecutiveAffiliation.update(affiliation_id, {
        status: 'ended',
        ended_at: new Date().toISOString(),
      });

      return Response.json({ success: true });
    }

    return Response.json({ error: 'Unknown action: ' + (action || 'none') }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const PLAN_TIERS = { free: 0, professional: 1, executive: 2, developer_unlimited: 3 };
const ELIGIBLE_PLANS = ['professional', 'executive'];
const ACTIVE_FOUNDER_STATUSES = ['active', 'verified', 'lifetime'];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json(
        { error: 'Authentication required. Please sign in to join this community.', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { communityId, referralSource } = body;
    if (!communityId) {
      return Response.json({ error: 'Community ID is required.' }, { status: 400 });
    }

    // ── 1. Load the community ──
    const community = await base44.asServiceRole.entities.NetworkCircle.get(communityId);
    if (!community) {
      return Response.json({ error: 'Community not found.', code: 'NOT_FOUND' }, { status: 404 });
    }

    // ── 2. Check if already a member (idempotent) ──
    const existing = await base44.asServiceRole.entities.CommunityMembership.filter({
      user_id: user.id,
      community_id: communityId,
      status: 'active',
    });

    if (existing.length > 0) {
      return Response.json({
        success: true,
        alreadyMember: true,
        membership: existing[0],
        community,
        welcomeMessage: `Welcome back to the ${community.name}!`,
      });
    }

    // ── 3. Load user profile for subscription checks ──
    const profiles = await base44.asServiceRole.entities.UserProfile.filter({ created_by_id: user.id });
    const profile = profiles[0] || null;
    const userPlan = profile?.subscription_plan || 'free';

    // ── 4. Validate subscription requirements ──
    if (community.required_plan) {
      const requiredTier = PLAN_TIERS[community.required_plan] ?? 0;
      const userTier = PLAN_TIERS[userPlan] ?? 0;
      if (userTier < requiredTier) {
        return Response.json(
          {
            error: `This community requires a ${community.required_plan} subscription or higher. Your current plan is ${userPlan}.`,
            code: 'SUBSCRIPTION_REQUIRED',
            requiredPlan: community.required_plan,
            currentPlan: userPlan,
          },
          { status: 403 }
        );
      }
    }

    // ── 5. Validate Founding Member requirements ──
    if (community.requires_founding_member) {
      let founderRecord = null;
      try {
        const records = await base44.asServiceRole.entities.FoundingMember.filter({ user_id: user.id });
        founderRecord = records.length > 0 ? records[0] : null;
      } catch {}

      const hasActiveRecord = founderRecord && ACTIVE_FOUNDER_STATUSES.includes(founderRecord.status);
      const purchaseVerified = founderRecord &&
        founderRecord.purchase_verified === true &&
        founderRecord.payment_status === 'paid';
      const subscriptionEligible = ELIGIBLE_PLANS.includes(userPlan);

      if (!(hasActiveRecord && purchaseVerified && subscriptionEligible)) {
        return Response.json(
          {
            error: 'This community is exclusive to verified Founding Members. Purchase a Founding Membership and upgrade to a Professional or Executive plan to join.',
            code: 'FOUNDER_REQUIRED',
          },
          { status: 403 }
        );
      }
    }

    // ── 6. Validate capacity ──
    if (community.max_capacity && community.max_capacity > 0) {
      const activeMembers = await base44.asServiceRole.entities.CommunityMembership.filter({
        community_id: communityId,
        status: 'active',
      });
      if (activeMembers.length >= community.max_capacity) {
        return Response.json(
          {
            error: `This community has reached its capacity of ${community.max_capacity} members.`,
            code: 'CAPACITY_REACHED',
            capacity: community.max_capacity,
          },
          { status: 403 }
        );
      }
    }

    // ── 7. Create the membership record (user-scoped) ──
    const now = new Date().toISOString();
    const membership = await base44.entities.CommunityMembership.create({
      user_id: user.id,
      user_name: user.full_name || user.email || '',
      user_email: user.email || '',
      user_photo: profile?.profile_photo || '',
      user_role: profile?.current_role || '',
      user_company: profile?.current_company || '',
      community_id: communityId,
      community_name: community.name,
      joined_at: now,
      member_role: 'member',
      status: 'active',
      reputation: 0,
      unread_count: 0,
      posts_count: 0,
      last_active: now,
      referral_source: referralSource || '',
    });

    // ── 8. Update community member count ──
    const newCount = (community.member_count || 0) + 1;
    await base44.asServiceRole.entities.NetworkCircle.update(communityId, {
      member_count: newCount,
    });

    // ── 9. Create a welcome notification ──
    try {
      await base44.entities.Notification.create({
        type: 'social',
        title: `Welcome to ${community.name}!`,
        message: `You've successfully joined the ${community.name}. Start by introducing yourself in the discussion feed.`,
        user_id: user.id,
        workspace: 'executive',
        visibility: 'private',
        action_url: `/network/c/${communityId}`,
        icon: community.icon || '🎯',
      });
    } catch {}

    // ── 10. Update referral attribution if applicable ──
    if (referralSource) {
      try {
        await base44.asServiceRole.entities.ReferralEvent.create({
          referral_code: referralSource,
          event_type: 'registration_completed',
          metadata_json: JSON.stringify({ community_id: communityId, community_name: community.name }),
        });
      } catch {}
    }

    return Response.json({
      success: true,
      alreadyMember: false,
      membership,
      community: { ...community, member_count: newCount },
      welcomeMessage: `Welcome to the ${community.name}!`,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const REPUTATION_TIERS = [
  { id: 'new_member', min: 0, max: 99 },
  { id: 'contributor', min: 100, max: 249 },
  { id: 'rising_leader', min: 250, max: 399 },
  { id: 'executive_contributor', min: 400, max: 599 },
  { id: 'distinguished_executive', min: 600, max: 799 },
  { id: 'elite_executive', min: 800, max: 949 },
  { id: 'leadership_fellow', min: 950, max: 999 },
  { id: 'global_thought_leader', min: 1000, max: 1000 },
];

function getTierFromScore(score) {
  const t = REPUTATION_TIERS.find(t => score >= t.min && score <= t.max);
  return t ? t.id : 'new_member';
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const action = body.action;

    async function getUserProfile(userId) {
      try {
        const profiles = await base44.asServiceRole.entities.UserProfile.filter({ created_by_id: userId });
        return profiles[0] || {};
      } catch (e) { return {}; }
    }

    async function getReputationRecord(userId) {
      try {
        const recs = await base44.asServiceRole.entities.ExecutiveReputation.filter({ user_id: userId });
        return recs[0] || null;
      } catch (e) { return null; }
    }

    async function logAudit(userId, userName, prevScore, newScore, reason, source, details) {
      try {
        await base44.asServiceRole.entities.ReputationAuditLog.create({
          user_id: userId,
          user_name: userName || '',
          previous_score: prevScore || 0,
          new_score: newScore || 0,
          change_amount: (newScore || 0) - (prevScore || 0),
          reason: reason || 'Recalculation',
          source: source || 'recalculation',
          details_json: JSON.stringify(details || {}),
          timestamp: new Date().toISOString(),
        });
      } catch (e) {}
    }

    async function computeReputation(userId) {
      const profile = await getUserProfile(userId);
      let user = null;
      try {
        const users = await base44.asServiceRole.entities.User.filter({ id: userId });
        user = users[0];
      } catch (e) {}

      const letters = await base44.asServiceRole.entities.LeadershipLetter.filter({ author_user_id: userId, status: 'published' }, '-created_date', 500);
      const comments = await base44.asServiceRole.entities.LetterComment.filter({ user_id: userId, status: 'active' }, '-created_date', 500);

      let isFoundingMember = false;
      try {
        const waitlist = await base44.asServiceRole.entities.FoundingWaitlist.filter({ user_id: userId });
        isFoundingMember = waitlist.some(w => w.status !== 'cancelled' && w.status !== 'declined');
      } catch (e) {}

      let hasMentorProfile = false;
      try {
        const mentors = await base44.asServiceRole.entities.MentorProfile.filter({ user_id: userId });
        hasMentorProfile = mentors.length > 0;
      } catch (e) {}

      let score = 0;
      const allQualityScores = [];
      let helpfulReactions = 0;
      let featuredCount = 0;
      let modRecognitions = 0;

      letters.forEach(l => {
        if (l.ai_moderation_score > 0) allQualityScores.push(l.ai_moderation_score);
        if (l.ai_leadership_value_score > 0) allQualityScores.push(l.ai_leadership_value_score);
        if (l.featured) featuredCount++;
        helpfulReactions += (l.likes || 0) + (l.bookmarks || 0);
      });
      comments.forEach(c => {
        if (c.ai_professional_score > 0) allQualityScores.push(c.ai_professional_score);
        if (c.ai_leadership_value_score > 0) allQualityScores.push(c.ai_leadership_value_score);
        try {
          const reactions = JSON.parse(c.reactions_json || '{}');
          Object.values(reactions).forEach(count => { helpfulReactions += count; });
        } catch (e) {}
        if (c.pinned) featuredCount++;
        if (c.pinned_type === 'editors_choice') modRecognitions++;
      });

      const avgQuality = allQualityScores.length > 0
        ? allQualityScores.reduce((s, v) => s + v, 0) / allQualityScores.length : 0;

      // 1. Volume (max 400)
      score += Math.min(200, letters.length * 15);
      score += Math.min(150, comments.length * 5);
      score += Math.min(50, Math.floor((letters.length + comments.length) / 2));

      // 2. Quality (max 250)
      score += Math.round(avgQuality * 2.5);

      // 3. Community Impact (max 200)
      score += Math.min(100, helpfulReactions * 3);
      score += Math.min(50, featuredCount * 15);
      score += Math.min(50, modRecognitions * 10);

      // 4. Mentorship (max 100)
      if (hasMentorProfile) score += 30;
      score += Math.min(70, (profile.sessions_completed || 0) * 10);

      // 5. Status Bonuses (max 100)
      if (profile.verified_executive) score += 20;
      if (isFoundingMember) score += 30;
      const fields = ['full_name', 'professional_headline', 'industry', 'country', 'current_role', 'current_company', 'bio'];
      const filled = fields.filter(f => profile[f] && String(profile[f]).trim().length > 0).length;
      const completion = Math.round((filled / fields.length) * 100);
      if (completion >= 80) score += 15;
      if (profile.identity_verified) score += 15;
      if (profile.community_standards_accepted) score += 20;

      // 6. Penalties
      const warnings = comments.filter(c => c.moderator_action === 'warn_user').length;
      const suspensions = comments.filter(c => c.moderator_action === 'suspend_user').length;
      const bans = comments.filter(c => c.moderator_action === 'ban_user').length;
      score -= warnings * 15;
      score -= suspensions * 30;
      score -= bans * 50;
      if (allQualityScores.length > 0 && avgQuality < 50) score -= 20;

      score = Math.max(0, Math.min(1000, Math.round(score)));

      const tier = getTierFromScore(score);
      const badges = [];
      const now = new Date().toISOString();
      if (isFoundingMember) badges.push({ id: 'founding_member', earned_at: now });
      if (profile.verified_executive) badges.push({ id: 'verified_executive', earned_at: now });
      if (hasMentorProfile) badges.push({ id: 'executive_mentor', earned_at: now });
      if (letters.length >= 5 && avgQuality >= 85) badges.push({ id: 'top_author', earned_at: now });
      if (comments.length >= 50 && avgQuality >= 80) badges.push({ id: 'trusted_contributor', earned_at: now });
      if (profile.subscription_plan === 'enterprise') badges.push({ id: 'enterprise_leader', earned_at: now });
      if (user && user.role === 'admin') badges.push({ id: 'community_guardian', earned_at: now });
      if (score >= 900) badges.push({ id: 'hall_of_fame', earned_at: now });
      if (helpfulReactions >= 100) badges.push({ id: 'leadership_influencer', earned_at: now });
      if (hasMentorProfile && (profile.sessions_completed || 0) >= 5) badges.push({ id: 'community_mentor', earned_at: now });

      const recs = [];
      if (letters.length < 5) recs.push('Publish more leadership letters to increase your reputation score');
      if (comments.length < 50) recs.push('Participate in more discussions to earn the Trusted Contributor badge');
      if (avgQuality < 85) recs.push('Focus on high-quality, insightful contributions to improve your average quality score');
      if (helpfulReactions < 100) recs.push('Provide helpful answers to earn more community reactions');
      if (!profile.verified_executive) recs.push('Complete identity verification to earn the Verified Executive badge');
      if ((profile.sessions_completed || 0) < 5) recs.push('Engage in mentorship sessions to earn the Community Mentor badge');
      if (warnings > 0) recs.push('Avoid policy violations — each warning reduces your reputation score');
      if (recs.length === 0) recs.push('Excellent work! Keep contributing to maintain your elite reputation');

      return {
        score, tier, badges,
        stats: {
          total_letters: letters.length,
          total_comments: comments.length,
          total_contributions: letters.length + comments.length,
          average_quality_score: Math.round(avgQuality),
          helpful_responses: helpfulReactions,
          featured_contributions: featuredCount,
          moderator_recognitions: modRecognitions,
          warnings_count: warnings,
          violations_count: suspensions + bans,
          sessions_completed: profile.sessions_completed || 0,
          verified: profile.verified_executive || false,
          founding_member: isFoundingMember,
          profile_completion: completion,
        },
        recommendations: recs,
      };
    }

    // ─── GET STATUS ────────────────────────────────────────
    if (action === 'get_status') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
      const targetUserId = body.user_id || user.id;
      const rec = await getReputationRecord(targetUserId);
      const profile = await getUserProfile(targetUserId);
      const history = await base44.asServiceRole.entities.ReputationAuditLog.filter({ user_id: targetUserId }, '-timestamp', 50);
      return Response.json({
        reputation: rec || { user_id: targetUserId, reputation_score: 0, reputation_tier: 'new_member', badges_json: '[]', total_contributions: 0, average_quality_score: 0 },
        profile,
        history: history.slice(0, 20),
        is_self: targetUserId === user.id,
      });
    }

    // ─── BATCH GET ────────────────────────────────────────
    if (action === 'batch_get') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
      const userIds = body.user_ids || [];
      const result = {};
      for (const uid of [...new Set(userIds)].slice(0, 50)) {
        const rec = await getReputationRecord(uid);
        if (rec) {
          let badges = [];
          try { badges = JSON.parse(rec.badges_json || '[]'); } catch (e) {}
          result[uid] = { score: rec.reputation_score, tier: rec.reputation_tier, badges };
        } else {
          result[uid] = { score: 0, tier: 'new_member', badges: [] };
        }
      }
      return Response.json({ reputations: result });
    }

    // ─── RECALCULATE ──────────────────────────────────────
    if (action === 'recalculate') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
      const targetUserId = body.user_id || user.id;
      if (targetUserId !== user.id && user.role !== 'admin') {
        return Response.json({ error: 'Admin access required' }, { status: 403 });
      }

      const computed = await computeReputation(targetUserId);
      const profile = await getUserProfile(targetUserId);
      const existing = await getReputationRecord(targetUserId);
      const prevScore = existing?.reputation_score || 0;
      const lifetimeScore = Math.max(prevScore, computed.score);
      const trend = computed.score > prevScore ? 'up' : computed.score < prevScore ? 'down' : 'stable';
      const now = new Date().toISOString();

      const updates = {
        user_id: targetUserId,
        user_name: profile.full_name || user.full_name || '',
        user_photo: profile.profile_photo || '',
        user_email: user.email || '',
        professional_headline: profile.professional_headline || profile.current_role || '',
        reputation_score: computed.score,
        reputation_tier: computed.tier,
        badges_json: JSON.stringify(computed.badges),
        total_letters: computed.stats.total_letters,
        total_comments: computed.stats.total_comments,
        total_contributions: computed.stats.total_contributions,
        average_quality_score: computed.stats.average_quality_score,
        helpful_responses: computed.stats.helpful_responses,
        featured_contributions: computed.stats.featured_contributions,
        moderator_recognitions: computed.stats.moderator_recognitions,
        warnings_count: computed.stats.warnings_count,
        violations_count: computed.stats.violations_count,
        sessions_completed: computed.stats.sessions_completed,
        reputation_trend: trend,
        previous_score: prevScore,
        lifetime_score: lifetimeScore,
        improvement_recommendations_json: JSON.stringify(computed.recommendations),
        last_calculated_at: now,
      };

      let rec;
      if (existing) {
        rec = await base44.asServiceRole.entities.ExecutiveReputation.update(existing.id, updates);
      } else {
        rec = await base44.asServiceRole.entities.ExecutiveReputation.create(updates);
      }

      // Log audit
      const newBadges = computed.badges.filter(b => {
        let old = [];
        try { old = JSON.parse(existing?.badges_json || '[]'); } catch (e) {}
        return !old.some(ob => ob.id === b.id);
      });
      if (computed.score !== prevScore) {
        await logAudit(targetUserId, updates.user_name, prevScore, computed.score, 'Reputation recalculated from historical data', 'recalculation', { ...computed.stats, new_badges: newBadges.map(b => b.id) });
      }
      for (const nb of newBadges) {
        await logAudit(targetUserId, updates.user_name, prevScore, computed.score, `Badge earned: ${nb.id}`, 'badge_earned', { badge_id: nb.id });
      }

      return Response.json({ success: true, reputation: rec, computed, new_badges: newBadges.map(b => b.id) });
    }

    // ─── GET HISTORY ──────────────────────────────────────
    if (action === 'get_history') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
      const targetUserId = body.user_id || user.id;
      const history = await base44.asServiceRole.entities.ReputationAuditLog.filter({ user_id: targetUserId }, '-timestamp', 100);
      return Response.json({ history });
    }

    // ─── ADMIN: LIST ───────────────────────────────────────
    if (action === 'admin_list') {
      const user = await base44.auth.me();
      if (!user || user.role !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 });
      const reputations = await base44.asServiceRole.entities.ExecutiveReputation.list('-reputation_score', 100);
      return Response.json({ reputations });
    }

    // ─── ADMIN: RECOGNIZE ──────────────────────────────────
    if (action === 'admin_recognize') {
      const user = await base44.auth.me();
      if (!user || user.role !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 });
      const { user_id, recognition_type, title } = body;
      const rec = await getReputationRecord(user_id);
      if (!rec) return Response.json({ error: 'Reputation record not found — recalculate first' }, { status: 404 });
      let monthly = [];
      try { monthly = JSON.parse(rec.monthly_recognitions_json || '[]'); } catch (e) {}
      const now = new Date();
      monthly.unshift({ type: recognition_type, title: title || '', month: now.getMonth() + 1, year: now.getFullYear(), awarded_at: now.toISOString() });
      const updated = await base44.asServiceRole.entities.ExecutiveReputation.update(rec.id, {
        monthly_recognitions_json: JSON.stringify(monthly.slice(0, 50)),
        community_awards: (rec.community_awards || 0) + 1,
      });
      await logAudit(user_id, rec.user_name, rec.reputation_score, rec.reputation_score, `Community recognition: ${title || recognition_type}`, 'community_recognition', { recognition_type, title });
      return Response.json({ success: true, reputation: updated });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
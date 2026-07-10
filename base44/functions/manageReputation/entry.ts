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

function getRating(scorePct) {
  if (scorePct >= 95) return 'A+';
  if (scorePct >= 90) return 'A';
  if (scorePct >= 85) return 'B+';
  if (scorePct >= 80) return 'B';
  if (scorePct >= 75) return 'C+';
  if (scorePct >= 70) return 'C';
  if (scorePct >= 60) return 'D';
  return 'F';
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

    async function logAudit(userId, userName, prevScore, newScore, reason, source, actionType, reviewer, details) {
      try {
        await base44.asServiceRole.entities.ReputationAuditLog.create({
          user_id: userId,
          user_name: userName || '',
          previous_score: prevScore || 0,
          new_score: newScore || 0,
          change_amount: (newScore || 0) - (prevScore || 0),
          reason: reason || 'Recalculation',
          source: source || 'recalculation',
          action_type: actionType || 'recalculate',
          reviewer_id: reviewer?.id || '',
          reviewer_name: reviewer?.name || '',
          details_json: JSON.stringify(details || {}),
          timestamp: new Date().toISOString(),
        });
      } catch (e) {}
    }

    async function notifyUser(userId, title, message, icon, actionUrl) {
      try {
        await base44.asServiceRole.entities.Notification.create({
          type: 'feedback', title, message, icon: icon || '🔔',
          action_url: actionUrl || '', user_id: userId || '',
          workspace: 'executive', visibility: 'private', read: false,
        });
      } catch (e) {}
    }

    // ═══════════════════════════════════════════════════════
    // CORE: WEIGHTED REPUTATION COMPUTATION (v2.0)
    // 10 pillars with specific weights totaling 100%
    // ═══════════════════════════════════════════════════════
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

      let simulations = [];
      try { simulations = await base44.asServiceRole.entities.SimulationSession.filter({ user_id: userId }, '-created_date', 100); } catch (e) {}

      let lessonProgress = [];
      try { lessonProgress = await base44.asServiceRole.entities.LessonProgress.filter({ user_id: userId }, '-created_date', 200); } catch (e) {}

      // ─── Aggregate quality data ─────────────────────────
      const allQualityScores = [];
      let helpfulReactions = 0;
      let featuredCount = 0;
      let modRecognitions = 0;
      let totalViews = 0;
      let innovationLetters = 0;

      letters.forEach(l => {
        if (l.ai_moderation_score > 0) allQualityScores.push(l.ai_moderation_score);
        if (l.ai_leadership_value_score > 0) allQualityScores.push(l.ai_leadership_value_score);
        if (l.featured) featuredCount++;
        helpfulReactions += (l.likes || 0) + (l.bookmarks || 0);
        totalViews += (l.views || 0);
        if ((l.category || '').toLowerCase().includes('innovation') || (l.tags || []).some(t => (t || '').toLowerCase().includes('innovation'))) innovationLetters++;
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

      const warnings = comments.filter(c => c.moderator_action === 'warn_user').length;
      const suspensions = comments.filter(c => c.moderator_action === 'suspend_user').length;
      const bans = comments.filter(c => c.moderator_action === 'ban_user').length;

      const fields = ['full_name', 'professional_headline', 'industry', 'country', 'current_role', 'current_company', 'bio'];
      const filled = fields.filter(f => profile[f] && String(profile[f]).trim().length > 0).length;
      const completion = Math.round((filled / fields.length) * 100);

      // ─── WEIGHTED SCORING (10 pillars → 1000 pts) ────────
      const pillars = [];

      // 1. Leadership Letters (25% = 250 pts max)
      const letterSub = Math.min(100, (letters.length * 10) + (avgQuality * 0.5));
      pillars.push({ id: 'letters', pillar: 'Leadership Letters', weight: 25, score: Math.round(letterSub), points: Math.round(letterSub * 2.5) });

      // 2. Comment Quality (15% = 150 pts max)
      const commentSub = Math.min(100, (Math.min(comments.length, 50) / 50 * 40) + (avgQuality * 0.6));
      pillars.push({ id: 'comments', pillar: 'Comment Quality', weight: 15, score: Math.round(commentSub), points: Math.round(commentSub * 1.5) });

      // 3. Mentoring (15% = 150 pts max)
      const mentorSub = Math.min(100, (hasMentorProfile ? 20 : 0) + Math.min(50, (profile.sessions_completed || 0) * 5) + Math.min(30, Math.floor((profile.sessions_completed || 0) * 0.5)));
      pillars.push({ id: 'mentoring', pillar: 'Mentoring', weight: 15, score: Math.round(mentorSub), points: Math.round(mentorSub * 1.5) });

      // 4. Community Participation (10% = 100 pts max)
      const partSub = Math.min(100, Math.min(50, helpfulReactions * 2) + Math.min(30, (letters.length + comments.length) * 2) + Math.min(20, totalViews / 100));
      pillars.push({ id: 'participation', pillar: 'Community Participation', weight: 10, score: Math.round(partSub), points: Math.round(partSub * 1.0) });

      // 5. Leadership Academy (10% = 100 pts max)
      const completedLessons = lessonProgress.filter(l => l.completed || l.status === 'completed').length;
      const academySub = Math.min(100, Math.min(70, completedLessons * 7) + Math.min(30, Math.floor(completedLessons / 3)));
      pillars.push({ id: 'academy', pillar: 'Leadership Academy', weight: 10, score: Math.round(academySub), points: Math.round(academySub * 1.0) });

      // 6. Executive Simulations (10% = 100 pts max)
      const completedSims = simulations.filter(s => s.status === 'completed' || s.completed).length;
      const simScores = simulations.filter(s => s.score > 0).map(s => s.score);
      const avgSimScore = simScores.length > 0 ? simScores.reduce((s, v) => s + v, 0) / simScores.length : 0;
      const simSub = Math.min(100, Math.min(60, completedSims * 10) + Math.min(40, avgSimScore * 0.4));
      pillars.push({ id: 'simulations', pillar: 'Executive Simulations', weight: 10, score: Math.round(simSub), points: Math.round(simSub * 1.0) });

      // 7. Professional Verification (5% = 50 pts max)
      const profSub = Math.min(100, (profile.verified_executive ? 50 : 0) + (completion >= 80 ? 50 : completion * 0.5));
      pillars.push({ id: 'prof_verification', pillar: 'Professional Verification', weight: 5, score: Math.round(profSub), points: Math.round(profSub * 0.5) });

      // 8. Identity Verification (5% = 50 pts max)
      const idSub = profile.identity_verified ? 100 : 0;
      pillars.push({ id: 'identity_verification', pillar: 'Identity Verification', weight: 5, score: idSub, points: Math.round(idSub * 0.5) });

      // 9. Moderator Recognition (3% = 30 pts max)
      const modSub = Math.min(100, Math.min(50, featuredCount * 15) + Math.min(50, modRecognitions * 25));
      pillars.push({ id: 'mod_recognition', pillar: 'Moderator Recognition', weight: 3, score: Math.round(modSub), points: Math.round(modSub * 0.3) });

      // 10. Community Awards (2% = 20 pts max) — from existing record
      const existingRec = await getReputationRecord(userId);
      const awardsCount = existingRec?.community_awards || 0;
      const awardsSub = Math.min(100, awardsCount * 20);
      pillars.push({ id: 'awards', pillar: 'Community Awards', weight: 2, score: awardsSub, points: Math.round(awardsSub * 0.2) });

      const totalScore = Math.max(0, Math.min(1000, Math.round(pillars.reduce((s, p) => s + p.points, 0))));
      const tier = getTierFromScore(totalScore);

      // ─── MULTI-DIMENSIONAL SCORES ────────────────────────
      const communityTrust = profile.trust_score || 40;
      const leadershipInfluence = Math.min(100, Math.round(Math.min(40, helpfulReactions * 1.5) + Math.min(30, totalViews / 50) + Math.min(20, (letters.length + comments.length) * 2) + Math.min(10, featuredCount * 5)));
      const contributionScore = Math.min(100, Math.round(Math.min(50, (letters.length + comments.length) * 2) + Math.min(50, avgQuality * 0.5)));
      const professionalConduct = Math.max(0, Math.min(100, 100 - (warnings * 10) - (suspensions * 20) - (bans * 40)));
      const mentorshipScoreVal = Math.min(100, Math.round((hasMentorProfile ? 25 : 0) + Math.min(50, (profile.sessions_completed || 0) * 5) + Math.min(25, Math.floor((profile.sessions_completed || 0) * 0.5))));
      const execCredibility = Math.round((professionalConduct * 0.3) + (avgQuality * 0.25) + (communityTrust * 0.2) + (mentorshipScoreVal * 0.15) + ((profile.verified_executive ? 100 : 0) * 0.1));
      const scorePct = (totalScore / 1000) * 100;
      const overallRating = getRating(scorePct);

      // ─── QUALITY DIMENSIONS (10 metrics) ─────────────────
      const letterGrammarScores = letters.filter(l => l.ai_grammar_score > 0);
      const letterToneScores = letters.filter(l => l.ai_tone_score > 0);
      const letterOrigScores = letters.filter(l => l.ai_originality_score > 0);
      const letterValueScores = letters.filter(l => l.ai_leadership_value_score > 0);
      const toxicComments = comments.filter(c => c.ai_toxicity_score > 0);

      const qualityDimensions = {
        professionalism: Math.round(avgQuality || 0),
        constructiveness: Math.round(avgQuality * 0.9 || 0),
        leadership_insight: letterValueScores.length > 0 ? Math.round(letterValueScores.reduce((s, l) => s + l.ai_leadership_value_score, 0) / letterValueScores.length) : Math.round(avgQuality * 0.8 || 0),
        strategic_thinking: Math.round(avgQuality * 0.85 || 0),
        communication_quality: letterGrammarScores.length > 0 ? Math.round(letterGrammarScores.reduce((s, l) => s + l.ai_grammar_score, 0) / letterGrammarScores.length) : Math.round(avgQuality || 0),
        executive_presence: letterToneScores.length > 0 ? Math.round(letterToneScores.reduce((s, l) => s + l.ai_tone_score, 0) / letterToneScores.length) : Math.round(avgQuality || 0),
        respectfulness: toxicComments.length > 0 ? Math.round(100 - (toxicComments.reduce((s, c) => s + c.ai_toxicity_score, 0) / toxicComments.length)) : 100,
        originality: letterOrigScores.length > 0 ? Math.round(letterOrigScores.reduce((s, l) => s + l.ai_originality_score, 0) / letterOrigScores.length) : 0,
        practical_value: Math.round(Math.min(100, avgQuality * 0.9 + (helpfulReactions * 0.5))),
        community_benefit: Math.round(Math.min(100, helpfulReactions * 2 + featuredCount * 10)),
      };

      // ─── COMPETENCY SCORES (10 executive competencies) ────
      const competencies = {
        strategic_leadership: Math.round(Math.min(100, (simSub * 0.4) + (letterSub * 0.4) + (avgQuality * 0.2))),
        communication: Math.round(Math.min(100, (commentSub * 0.5) + (letterSub * 0.3) + (avgQuality * 0.2))),
        decision_making: Math.round(Math.min(100, (simSub * 0.5) + (avgQuality * 0.3) + (mentorSub * 0.2))),
        innovation: Math.round(Math.min(100, (innovationLetters * 15) + (academySub * 0.3) + (avgQuality * 0.2) + (letterSub * 0.2))),
        executive_presence: Math.round(Math.min(100, (avgQuality * 0.4) + (letterSub * 0.3) + (featuredCount * 5) + (profSub * 0.1))),
        mentorship: Math.round(Math.min(100, (mentorSub * 0.7) + (mentorshipScoreVal * 0.3))),
        people_leadership: Math.round(Math.min(100, (mentorSub * 0.4) + (commentSub * 0.3) + (partSub * 0.3))),
        operational_excellence: Math.round(Math.min(100, (academySub * 0.5) + (simSub * 0.3) + (professionalConduct * 0.2))),
        business_acumen: Math.round(Math.min(100, (letterSub * 0.4) + (simSub * 0.3) + (avgQuality * 0.3))),
        digital_transformation: Math.round(Math.min(100, (academySub * 0.6) + (simSub * 0.2) + (innovationLetters * 10))),
      };

      // ─── ANTI-GAMING DETECTION ───────────────────────────
      let gamingRisk = 0;
      const gamingFlags = [];

      if (helpfulReactions > 50 && avgQuality < 50) { gamingRisk += 30; gamingFlags.push('high_engagement_low_quality'); }
      const lowQualComments = comments.filter(c => c.ai_professional_score > 0 && c.ai_professional_score < 50).length;
      if (lowQualComments > 10) { gamingRisk += 20; gamingFlags.push('many_low_quality_comments'); }
      const spamComments = comments.filter(c => c.ai_spam_score > 50).length;
      if (spamComments > 0) { gamingRisk += 25; gamingFlags.push('spam_detected'); }
      const titles = letters.map(l => (l.title || '').toLowerCase());
      const dupTitles = titles.filter((t, i) => t && titles.indexOf(t) !== i);
      if (dupTitles.length > 0) { gamingRisk += 15; gamingFlags.push('duplicate_content'); }
      gamingRisk = Math.min(100, gamingRisk);

      // ─── BADGES ──────────────────────────────────────────
      const badges = [];
      const now = new Date().toISOString();
      if (isFoundingMember) badges.push({ id: 'founding_member', earned_at: now, reason: 'Joined as a founding member' });
      if (profile.verified_executive) badges.push({ id: 'verified_executive', earned_at: now, reason: 'Executive verification completed' });
      if (hasMentorProfile) badges.push({ id: 'executive_mentor', earned_at: now, reason: 'Created a mentor profile' });
      if (letters.length >= 5 && avgQuality >= 85) badges.push({ id: 'legacy_author', earned_at: now, reason: `${letters.length} published letters, avg quality ${Math.round(avgQuality)}` });
      if (comments.length >= 50 && avgQuality >= 80) badges.push({ id: 'trusted_contributor', earned_at: now, reason: `${comments.length} quality comments` });
      if (profile.subscription_plan === 'enterprise') badges.push({ id: 'enterprise_leader', earned_at: now, reason: 'Active enterprise subscription' });
      if (user && user.role === 'admin') badges.push({ id: 'community_guardian', earned_at: now, reason: 'Platform administrator' });
      if (totalScore >= 900) badges.push({ id: 'hall_of_fame', earned_at: now, reason: `Lifetime score ≥900 (${totalScore})` });
      if (helpfulReactions >= 100) badges.push({ id: 'executive_influencer', earned_at: now, reason: `${helpfulReactions} helpful reactions received` });
      if (hasMentorProfile && (profile.sessions_completed || 0) >= 5) badges.push({ id: 'community_mentor', earned_at: now, reason: `${profile.sessions_completed} mentorship sessions` });
      if (completedSims >= 10) badges.push({ id: 'executive_council_member', earned_at: now, reason: `${completedSims} executive simulations completed` });
      if (totalViews >= 10000) badges.push({ id: 'global_speaker', earned_at: now, reason: `${totalViews} total content views` });
      if (totalScore >= 800 && hasMentorProfile && avgQuality >= 90) badges.push({ id: 'board_advisor', earned_at: now, reason: 'Elite mentor with exceptional quality' });

      // Preserve manually-awarded badges from existing record
      if (existingRec) {
        let oldBadges = [];
        try { oldBadges = JSON.parse(existingRec.badges_json || '[]'); } catch (e) {}
        for (const ob of oldBadges) {
          if (ob.manually_awarded && !badges.some(b => b.id === ob.id)) {
            badges.push(ob);
          }
        }
      }

      // ─── ACHIEVEMENTS ────────────────────────────────────
      const achievements = [];
      if (letters.length >= 1) achievements.push({ id: 'leadership_author', earned_at: now, reason: 'Published first leadership letter' });
      if (helpfulReactions >= 100) achievements.push({ id: 'thought_leader', earned_at: now, reason: `${helpfulReactions} helpful reactions` });
      if ((profile.sessions_completed || 0) >= 1) achievements.push({ id: 'executive_mentor_ach', earned_at: now, reason: 'Completed first mentorship session' });
      if (comments.length >= 50) achievements.push({ id: 'community_builder', earned_at: now, reason: `${comments.length} approved comments` });
      if (featuredCount >= 5) achievements.push({ id: 'boardroom_contributor', earned_at: now, reason: `${featuredCount} featured contributions` });
      if (innovationLetters >= 5) achievements.push({ id: 'innovation_champion', earned_at: now, reason: `${innovationLetters} innovation letters` });
      if (totalViews >= 1000) achievements.push({ id: 'executive_speaker', earned_at: now, reason: `${totalViews} total views` });
      if (isFoundingMember) achievements.push({ id: 'distinguished_founder', earned_at: now, reason: 'Active founding member' });
      if (existingRec) {
        const memberSince = new Date(existingRec.created_date || user?.created_date || now);
        if (Date.now() - memberSince.getTime() >= 365 * 24 * 60 * 60 * 1000) achievements.push({ id: 'legacy_contributor', earned_at: now, reason: 'Active for 12+ months' });
      }
      if (totalScore >= 900) achievements.push({ id: 'hall_of_fame_ach', earned_at: now, reason: 'Lifetime score ≥900' });
      if (existingRec) {
        let oldAch = [];
        try { oldAch = JSON.parse(existingRec.achievements_json || '[]'); } catch (e) {}
        for (const oa of oldAch) { if (oa.manually_awarded && !achievements.some(a => a.id === oa.id)) achievements.push(oa); }
      }

      // ─── MILESTONES ──────────────────────────────────────
      const milestones = [];
      if (letters.length >= 1) milestones.push({ id: 'first_letter', earned_at: now, value: 1 });
      if (helpfulReactions >= 100) milestones.push({ id: '100_helpful', earned_at: now, value: 100 });
      if ((profile.sessions_completed || 0) >= 1) milestones.push({ id: 'first_mentoring', earned_at: now, value: 1 });
      if (totalScore >= 100) milestones.push({ id: 'rep_100', earned_at: now, value: 100 });
      if (totalScore >= 250) milestones.push({ id: 'rep_250', earned_at: now, value: 250 });
      if (totalScore >= 500) milestones.push({ id: 'rep_500', earned_at: now, value: 500 });
      if (totalScore >= 750) milestones.push({ id: 'rep_750', earned_at: now, value: 750 });
      if (totalScore >= 900) milestones.push({ id: 'rep_900', earned_at: now, value: 900 });
      if (totalScore >= 1000) milestones.push({ id: 'rep_1000', earned_at: now, value: 1000 });
      if (existingRec) {
        let oldMs = [];
        try { oldMs = JSON.parse(existingRec.milestones_json || '[]'); } catch (e) {}
        for (const om of oldMs) { if (!milestones.some(m => m.id === om.id)) milestones.push(om); }
      }

      // ─── RECOMMENDATIONS ─────────────────────────────────
      const recs = [];
      if (letters.length < 5) recs.push('Publish more leadership letters to increase your reputation score');
      if (comments.length < 50) recs.push('Participate in more discussions to earn the Trusted Contributor badge');
      if (avgQuality < 85) recs.push('Focus on high-quality, insightful contributions to improve your average quality score');
      if (helpfulReactions < 100) recs.push('Provide helpful answers to earn more community reactions');
      if (!profile.verified_executive) recs.push('Complete identity verification to earn the Verified Executive badge');
      if ((profile.sessions_completed || 0) < 5) recs.push('Engage in mentorship sessions to earn the Community Mentor badge');
      if (completedSims < 5) recs.push('Complete executive simulations to strengthen your strategic thinking score');
      if (completedLessons < 5) recs.push('Enroll in Leadership Academy courses to boost your learning score');
      if (warnings > 0) recs.push('Avoid policy violations — each warning reduces your professional conduct score');
      if (gamingRisk > 30) recs.push('Some activity patterns may be flagged — focus on organic, quality contributions');
      if (recs.length === 0) recs.push('Exceptional work! You are a model executive contributor');

      // ─── EXECUTIVE SCORECARD ─────────────────────────────
      const mentoringHours = Math.round((profile.sessions_completed || 0) * 0.75);
      const scorecard = {
        letters_published: letters.length,
        helpful_discussions: helpfulReactions,
        simulations_completed: completedSims,
        courses_completed: completedLessons,
        mentoring_hours: mentoringHours,
        community_recognition: modRecognitions + featuredCount,
        awards: awardsCount,
        featured_articles: featuredCount,
        thought_leadership_index: Math.min(100, Math.round(totalViews / 100 + helpfulReactions * 0.5)),
        professional_certifications: 0,
      };

      // ─── QUALITY HISTORY ─────────────────────────────────
      const monthlyMap = {};
      [...letters, ...comments].forEach(item => {
        const date = new Date(item.created_date || item.submitted_at || item.published_at);
        if (isNaN(date)) return;
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const score = item.ai_moderation_score || item.ai_professional_score || item.ai_leadership_value_score || 0;
        if (score > 0) {
          if (!monthlyMap[monthKey]) monthlyMap[monthKey] = [];
          monthlyMap[monthKey].push(score);
        }
      });
      const monthlyTrend = Object.entries(monthlyMap).map(([month, scores]) => ({
        month, avg_score: Math.round(scores.reduce((s, v) => s + v, 0) / scores.length), count: scores.length,
      })).sort((a, b) => a.month.localeCompare(b.month)).slice(-12);

      const yearlyMap = {};
      Object.entries(monthlyMap).forEach(([month, scores]) => {
        const year = month.split('-')[0];
        if (!yearlyMap[year]) yearlyMap[year] = [];
        yearlyMap[year].push(...scores);
      });
      const yearlyTrend = Object.entries(yearlyMap).map(([year, scores]) => ({
        year, avg_score: Math.round(scores.reduce((s, v) => s + v, 0) / scores.length), count: scores.length,
      })).sort((a, b) => a.year.localeCompare(b.year));

      let highestRated = null;
      [...letters, ...comments].forEach(item => {
        const score = item.ai_moderation_score || item.ai_professional_score || 0;
        if (score > 0 && (!highestRated || score > highestRated.score)) {
          highestRated = { type: item.title ? 'letter' : 'comment', title: item.title || (item.content || '').substring(0, 100), score, id: item.id };
        }
      });

      let mostHelpful = null;
      comments.forEach(c => {
        let reactions = 0;
        try { reactions = Object.values(JSON.parse(c.reactions_json || '{}')).reduce((s, v) => s + v, 0); } catch (e) {}
        if (reactions > 0 && (!mostHelpful || reactions > mostHelpful.reactions)) {
          mostHelpful = { title: (c.content || '').substring(0, 100), reactions, id: c.id };
        }
      });

      const mostReadLetter = letters.length > 0
        ? (() => { const m = letters.reduce((max, l) => (l.views || 0) > (max.views || 0) ? l : max); return { title: m.title, views: m.views || 0, id: m.id }; })()
        : null;

      return {
        score: totalScore, tier, badges, achievements, milestones, competencies,
        weighted_breakdown: pillars,
        multi_dimensional: {
          community_trust: communityTrust,
          leadership_influence: leadershipInfluence,
          contribution_score: Math.round(contributionScore),
          professional_conduct: professionalConduct,
          mentorship: Math.round(mentorshipScoreVal),
          executive_credibility: execCredibility,
          overall_rating: overallRating,
        },
        quality_dimensions: qualityDimensions,
        quality_history: { monthly: monthlyTrend, yearly: yearlyTrend, highest_rated: highestRated, most_helpful: mostHelpful, most_read_letter: mostReadLetter },
        anti_gaming: { risk_score: gamingRisk, flags: gamingFlags },
        scorecard,
        recommendations: recs,
        stats: {
          total_letters: letters.length, total_comments: comments.length,
          total_contributions: letters.length + comments.length,
          average_quality_score: Math.round(avgQuality), helpful_responses: helpfulReactions,
          featured_contributions: featuredCount, moderator_recognitions: modRecognitions,
          warnings_count: warnings, violations_count: suspensions + bans,
          sessions_completed: profile.sessions_completed || 0,
          simulations_completed: completedSims, courses_completed: completedLessons,
          verified: profile.verified_executive || false, founding_member: isFoundingMember,
          profile_completion: completion, total_views: totalViews,
          mentoring_hours: mentoringHours,
        },
      };
    }

    // ═══════════════════════════════════════════════════════
    // ACTIONS
    // ═══════════════════════════════════════════════════════

    // ─── GET STATUS ────────────────────────────────────────
    if (action === 'get_status') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
      const targetUserId = body.user_id || user.id;
      const rec = await getReputationRecord(targetUserId);
      const profile = await getUserProfile(targetUserId);
      const history = await base44.asServiceRole.entities.ReputationAuditLog.filter({ user_id: targetUserId }, '-timestamp', 50);
      return Response.json({
        reputation: rec || { user_id: targetUserId, reputation_score: 0, reputation_tier: 'new_member', badges_json: '[]', achievements_json: '[]', milestones_json: '[]', competencies_json: '{}', total_contributions: 0, average_quality_score: 0 },
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
          let competencies = {};
          try { competencies = JSON.parse(rec.competencies_json || '{}'); } catch (e) {}
          let topCompetency = null;
          const compEntries = Object.entries(competencies).sort((a, b) => b[1] - a[1]);
          if (compEntries.length > 0) topCompetency = { id: compEntries[0][0], score: compEntries[0][1] };
          result[uid] = { score: rec.reputation_score, tier: rec.reputation_tier, badges, top_competency: topCompetency, community_trust: rec.community_trust_score };
        } else {
          result[uid] = { score: 0, tier: 'new_member', badges: [], top_competency: null, community_trust: 0 };
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

      // Check suspension
      const existing = await getReputationRecord(targetUserId);
      if (existing?.reputation_suspended) {
        return Response.json({ error: 'Reputation is suspended. Restore it before recalculating.' }, { status: 403 });
      }

      const computed = await computeReputation(targetUserId);
      const profile = await getUserProfile(targetUserId);
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
        achievements_json: JSON.stringify(computed.achievements),
        milestones_json: JSON.stringify(computed.milestones),
        competencies_json: JSON.stringify(computed.competencies),
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
        community_trust_score: computed.multi_dimensional.community_trust,
        leadership_influence_pct: computed.multi_dimensional.leadership_influence,
        contribution_score: computed.multi_dimensional.contribution_score,
        professional_conduct_score: computed.multi_dimensional.professional_conduct,
        mentorship_score: computed.multi_dimensional.mentorship,
        executive_credibility_score: computed.multi_dimensional.executive_credibility,
        overall_executive_rating: computed.multi_dimensional.overall_rating,
        weighted_breakdown_json: JSON.stringify(computed.weighted_breakdown),
        quality_dimensions_json: JSON.stringify(computed.quality_dimensions),
        quality_history_json: JSON.stringify(computed.quality_history),
        gaming_risk_score: computed.anti_gaming.risk_score,
        gaming_flags_json: JSON.stringify(computed.anti_gaming.flags),
        simulations_completed: computed.stats.simulations_completed,
        courses_completed: computed.stats.courses_completed,
        mentoring_hours: computed.stats.mentoring_hours,
        thought_leadership_index: computed.scorecard.thought_leadership_index,
        total_views: computed.stats.total_views,
      };

      let rec;
      if (existing) {
        rec = await base44.asServiceRole.entities.ExecutiveReputation.update(existing.id, updates);
      } else {
        rec = await base44.asServiceRole.entities.ExecutiveReputation.create(updates);
      }

      // Log audit + new badges
      let oldBadges = [];
      try { oldBadges = JSON.parse(existing?.badges_json || '[]'); } catch (e) {}
      const newBadges = computed.badges.filter(b => !oldBadges.some(ob => ob.id === b.id));

      if (computed.score !== prevScore) {
        await logAudit(targetUserId, updates.user_name, prevScore, computed.score, 'Reputation recalculated from weighted multi-dimensional scoring', 'recalculation', 'recalculate', { id: user.id, name: user.full_name }, { ...computed.stats, new_badges: newBadges.map(b => b.id) });
      }
      for (const nb of newBadges) {
        await logAudit(targetUserId, updates.user_name, prevScore, computed.score, `Badge earned: ${nb.id}`, 'badge_earned', 'award_badge', { id: user.id, name: user.full_name }, { badge_id: nb.id, reason: nb.reason });
        await notifyUser(targetUserId, '🎉 New Badge Earned!', `You earned the "${nb.id}" badge. ${nb.reason}`, '🎉', '/reputation');
      }
      let oldAch = []; try { oldAch = JSON.parse(existing?.achievements_json || '[]'); } catch (e) {}
      let oldMs = []; try { oldMs = JSON.parse(existing?.milestones_json || '[]'); } catch (e) {}
      const newAch = computed.achievements.filter(a => !oldAch.some(oa => oa.id === a.id));
      const newMs = computed.milestones.filter(m => !oldMs.some(om => om.id === m.id));
      for (const na of newAch) {
        await logAudit(targetUserId, updates.user_name, prevScore, computed.score, `Achievement earned: ${na.id}`, 'achievement_earned', 'award_achievement', { id: user.id, name: user.full_name }, { achievement_id: na.id, reason: na.reason });
        await notifyUser(targetUserId, '🏆 Achievement Unlocked!', `You earned the "${na.id}" achievement. ${na.reason}`, '🏆', '/reputation');
      }
      for (const nm of newMs) {
        await logAudit(targetUserId, updates.user_name, prevScore, computed.score, `Milestone reached: ${nm.id}`, 'milestone_reached', 'recalculate', { id: user.id, name: user.full_name }, { milestone_id: nm.id, value: nm.value });
      }

      return Response.json({ success: true, reputation: rec, computed, new_badges: newBadges.map(b => b.id), new_achievements: newAch.map(a => a.id), new_milestones: newMs.map(m => m.id) });
    }

    // ─── GENERATE AI INSIGHTS ─────────────────────────────
    if (action === 'generate_insights') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
      const targetUserId = body.user_id || user.id;

      const rec = await getReputationRecord(targetUserId);
      if (!rec) return Response.json({ error: 'Reputation record not found — recalculate first' }, { status: 404 });

      let breakdown = [];
      try { breakdown = JSON.parse(rec.weighted_breakdown_json || '[]'); } catch (e) {}
      let qualityDims = {};
      try { qualityDims = JSON.parse(rec.quality_dimensions_json || '{}'); } catch (e) {}
      let competencies = {};
      try { competencies = JSON.parse(rec.competencies_json || '{}'); } catch (e) {}

      const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `You are an AI executive reputation analyst for EXECLEAD.AI. Generate qualitative insights about this executive.

Executive: ${rec.user_name}
Reputation Score: ${rec.reputation_score}/1000 | Tier: ${rec.reputation_tier} | Rating: ${rec.overall_executive_rating}
Community Trust: ${rec.community_trust_score}/100 | Leadership Influence: ${rec.leadership_influence_pct}%
Professional Conduct: ${rec.professional_conduct_score}/100 | Mentorship: ${rec.mentorship_score}/100
Executive Credibility: ${rec.executive_credibility_score}/100

Letters: ${rec.total_letters} | Comments: ${rec.total_comments} | Avg Quality: ${rec.average_quality_score}
Helpful Responses: ${rec.helpful_responses} | Featured: ${rec.featured_contributions}
Simulations: ${rec.simulations_completed} | Courses: ${rec.courses_completed} | Mentoring Hours: ${rec.mentoring_hours}

Weighted Breakdown: ${JSON.stringify(breakdown)}
Quality Dimensions: ${JSON.stringify(qualityDims)}
Competencies: ${JSON.stringify(competencies)}

Generate:
1. insights: 5-7 short qualitative insights (e.g., "Exceptional mentor", "Highly respected in strategic leadership")
2. strengths: 3-5 key strengths based on the data
3. growth_areas: 2-3 areas for improvement
4. recommended_learning: 2-3 specific learning recommendations
5. recommended_mentoring: 1-2 mentoring recommendations
6. suggested_certifications: 1-2 certification suggestions
7. suggested_simulations: 1-2 simulation scenario suggestions

Keep insights concise, specific, and data-driven.`,
        response_json_schema: {
          type: 'object',
          properties: {
            insights: { type: 'array', items: { type: 'string' } },
            strengths: { type: 'array', items: { type: 'string' } },
            growth_areas: { type: 'array', items: { type: 'string' } },
            recommended_learning: { type: 'array', items: { type: 'string' } },
            recommended_mentoring: { type: 'array', items: { type: 'string' } },
            suggested_certifications: { type: 'array', items: { type: 'string' } },
            suggested_simulations: { type: 'array', items: { type: 'string' } },
          },
        },
      });

      await base44.asServiceRole.entities.ExecutiveReputation.update(rec.id, {
        ai_executive_insights_json: JSON.stringify(result),
        ai_insights_generated_at: new Date().toISOString(),
      });

      return Response.json({ success: true, insights: result });
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

    // ─── ADMIN: RECOGNIZE (monthly award) ──────────────────
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
      await logAudit(user_id, rec.user_name, rec.reputation_score, rec.reputation_score, `Community recognition: ${title || recognition_type}`, 'community_recognition', 'recognize', { id: user.id, name: user.full_name }, { recognition_type, title });
      await notifyUser(user_id, '🏆 Community Award Received!', `You received the "${title || recognition_type}" award.`, '🏆', '/reputation');
      return Response.json({ success: true, reputation: updated });
    }

    // ─── ADMIN: MODERATOR ACTION (unified) ─────────────────
    if (action === 'admin_moderator_action') {
      const user = await base44.auth.me();
      if (!user || user.role !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 });

      const { user_id, moderator_action, reason, badge_id, achievement_id, score_adjustment, notes, award_title, honor_type } = body;
      const rec = await getReputationRecord(user_id);
      if (!rec) return Response.json({ error: 'Reputation record not found' }, { status: 404 });

      const prevScore = rec.reputation_score || 0;
      const now = new Date().toISOString();
      const reviewer = { id: user.id, name: user.full_name };

      if (moderator_action === 'adjust_score') {
        const newScore = Math.max(0, Math.min(1000, prevScore + (score_adjustment || 0)));
        const updated = await base44.asServiceRole.entities.ExecutiveReputation.update(rec.id, {
          reputation_score: newScore,
          reputation_tier: getTierFromScore(newScore),
          lifetime_score: Math.max(rec.lifetime_score || 0, newScore),
        });
        await logAudit(user_id, rec.user_name, prevScore, newScore, reason || 'Manual score adjustment', 'manual_adjustment', 'adjust_score', reviewer, { score_adjustment, notes });
        await notifyUser(user_id, 'Reputation Adjusted', `Your reputation score was adjusted by ${score_adjustment > 0 ? '+' : ''}${score_adjustment} points. Reason: ${reason}`, '📊', '/reputation');
        return Response.json({ success: true, reputation: updated });
      }

      if (moderator_action === 'award_badge') {
        let badges = [];
        try { badges = JSON.parse(rec.badges_json || '[]'); } catch (e) {}
        if (!badges.some(b => b.id === badge_id)) {
          badges.push({ id: badge_id, earned_at: now, reason: reason || 'Manually awarded by moderator', manually_awarded: true });
          const updated = await base44.asServiceRole.entities.ExecutiveReputation.update(rec.id, { badges_json: JSON.stringify(badges) });
          await logAudit(user_id, rec.user_name, prevScore, prevScore, `Badge awarded: ${badge_id}`, 'badge_earned', 'award_badge', reviewer, { badge_id, reason });
          await notifyUser(user_id, '🎉 Badge Awarded!', `You received a new badge. Reason: ${reason}`, '🎉', '/reputation');
          return Response.json({ success: true, reputation: updated });
        }
        return Response.json({ error: 'Badge already earned' }, { status: 400 });
      }

      if (moderator_action === 'remove_badge') {
        let badges = [];
        try { badges = JSON.parse(rec.badges_json || '[]'); } catch (e) {}
        const filtered = badges.filter(b => b.id !== badge_id);
        const updated = await base44.asServiceRole.entities.ExecutiveReputation.update(rec.id, { badges_json: JSON.stringify(filtered) });
        await logAudit(user_id, rec.user_name, prevScore, prevScore, `Badge removed: ${badge_id}`, 'badge_revoked', 'remove_badge', reviewer, { badge_id, reason });
        await notifyUser(user_id, 'Badge Removed', `A badge was removed from your profile. Reason: ${reason}`, 'ℹ️', '/reputation');
        return Response.json({ success: true, reputation: updated });
      }

      if (moderator_action === 'feature_member') {
        const updated = await base44.asServiceRole.entities.ExecutiveReputation.update(rec.id, { featured_contributions: (rec.featured_contributions || 0) + 1 });
        await logAudit(user_id, rec.user_name, prevScore, prevScore, 'Member featured by moderator', 'feature', 'feature_member', reviewer, { reason });
        await notifyUser(user_id, '⭐ You\'ve Been Featured!', 'You have been featured as a standout executive contributor.', '⭐', '/reputation');
        return Response.json({ success: true, reputation: updated });
      }

      if (moderator_action === 'suspend') {
        const updated = await base44.asServiceRole.entities.ExecutiveReputation.update(rec.id, {
          reputation_suspended: true, suspended_at: now, suspension_reason: reason || '',
          suspended_by_id: user.id, suspended_by_name: user.full_name,
        });
        await logAudit(user_id, rec.user_name, prevScore, prevScore, `Reputation suspended: ${reason}`, 'suspension', 'suspend', reviewer, { reason });
        await notifyUser(user_id, 'Reputation Suspended', `Your executive reputation has been suspended. Reason: ${reason}`, '⚠️', '/reputation');
        return Response.json({ success: true, reputation: updated });
      }

      if (moderator_action === 'restore') {
        const updated = await base44.asServiceRole.entities.ExecutiveReputation.update(rec.id, {
          reputation_suspended: false, suspended_at: null, suspension_reason: '',
          suspended_by_id: '', suspended_by_name: '',
        });
        await logAudit(user_id, rec.user_name, prevScore, prevScore, 'Reputation restored', 'restoration', 'restore', reviewer, { reason });
        await notifyUser(user_id, 'Reputation Restored', 'Your executive reputation has been restored.', '✅', '/reputation');
        return Response.json({ success: true, reputation: updated });
      }

      if (moderator_action === 'award_achievement') {
        let achievements = []; try { achievements = JSON.parse(rec.achievements_json || '[]'); } catch (e) {}
        if (!achievements.some(a => a.id === achievement_id)) {
          achievements.push({ id: achievement_id, earned_at: now, reason: reason || 'Manually awarded', manually_awarded: true });
          const updated = await base44.asServiceRole.entities.ExecutiveReputation.update(rec.id, { achievements_json: JSON.stringify(achievements) });
          await logAudit(user_id, rec.user_name, prevScore, prevScore, `Achievement awarded: ${achievement_id}`, 'achievement_earned', 'award_achievement', reviewer, { achievement_id, reason });
          await notifyUser(user_id, '🏆 Achievement Awarded!', `You received a new achievement. Reason: ${reason}`, '🏆', '/reputation');
          return Response.json({ success: true, reputation: updated });
        }
        return Response.json({ error: 'Achievement already earned' }, { status: 400 });
      }

      if (moderator_action === 'award_honor') {
        let honors = []; try { honors = JSON.parse(rec.yearly_honors_json || '[]'); } catch (e) {}
        const year = new Date().getFullYear();
        honors.push({ year, award: honor_type, title: award_title || honor_type, awarded_at: now });
        const updated = await base44.asServiceRole.entities.ExecutiveReputation.update(rec.id, { yearly_honors_json: JSON.stringify(honors), community_awards: (rec.community_awards || 0) + 1 });
        await logAudit(user_id, rec.user_name, prevScore, prevScore, `Yearly honor awarded: ${honor_type} (${year})`, 'honor_awarded', 'award_honor', reviewer, { honor_type, year, title: award_title });
        await notifyUser(user_id, '🏆 Yearly Honor Awarded!', `You received the "${award_title || honor_type}" honor for ${year}.`, '🏆', '/reputation');
        return Response.json({ success: true, reputation: updated });
      }

      return Response.json({ error: 'Unknown moderator action' }, { status: 400 });
    }

    // ─── LEADERBOARD ───────────────────────────────────────
    if (action === 'get_leaderboard') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
      const category = body.category || 'leadership_quality';
      const fieldMap = {
        leadership_quality: 'reputation_score', mentorship: 'mentoring_hours', executive_authors: 'total_letters',
        community_champions: 'total_contributions', innovation: 'thought_leadership_index',
        enterprise_leaders: 'executive_credibility_score', thought_leadership: 'thought_leadership_index',
      };
      const sortField = fieldMap[category] || 'reputation_score';
      const all = await base44.asServiceRole.entities.ExecutiveReputation.list('-' + sortField, 100);
      const leaderboard = all.filter(r => !r.reputation_suspended && r.reputation_score > 0).map((r, i) => ({
        rank: i + 1, user_id: r.user_id, name: r.user_name, photo: r.user_photo,
        headline: r.professional_headline, score: r.reputation_score, tier: r.reputation_tier,
        rating: r.overall_executive_rating, value: r[sortField] || r.reputation_score,
        letters: r.total_letters, contributions: r.total_contributions, mentoring_hours: r.mentoring_hours,
      }));
      return Response.json({ leaderboard, category });
    }

    if (action === 'get_community_rank') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
      const targetUserId = body.user_id || user.id;
      const all = await base44.asServiceRole.entities.ExecutiveReputation.list('-reputation_score', 200);
      const rank = all.findIndex(r => r.user_id === targetUserId) + 1;
      return Response.json({ rank, total: all.filter(r => r.reputation_score > 0).length });
    }

    // ─── APPEALS ──────────────────────────────────────────
    if (action === 'submit_appeal') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
      const { appeal_type, appeal_reason, related_action_id, related_badge_id } = body;
      if (!appeal_reason?.trim()) return Response.json({ error: 'Please provide a reason for your appeal' }, { status: 400 });
      const existing = await base44.asServiceRole.entities.ReputationAppeal.filter({ user_id: user.id, status: 'pending' });
      if (existing.length > 0) return Response.json({ error: 'You already have a pending appeal' }, { status: 400 });
      const appeal = await base44.asServiceRole.entities.ReputationAppeal.create({
        user_id: user.id, user_name: user.full_name || '', user_email: user.email || '',
        appeal_type, appeal_reason: appeal_reason.trim(),
        related_action_id: related_action_id || '', related_badge_id: related_badge_id || '',
        status: 'pending', submitted_at: new Date().toISOString(),
      });
      try { await base44.asServiceRole.entities.Notification.create({ type: 'system', title: 'Reputation Appeal Submitted', message: `${user.full_name} submitted a ${appeal_type} appeal.`, icon: '⚖️', action_url: '/reputation', user_id: '', workspace: 'platform', visibility: 'workspace', role_scope: 'admin', severity: 'info', category: 'reputation', read: false }); } catch (e) {}
      return Response.json({ success: true, appeal });
    }

    if (action === 'get_my_appeals') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
      const appeals = await base44.asServiceRole.entities.ReputationAppeal.filter({ user_id: user.id }, '-submitted_at', 50);
      return Response.json({ appeals });
    }

    if (action === 'admin_appeals') {
      const user = await base44.auth.me();
      if (!user || user.role !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 });
      const appeals = await base44.asServiceRole.entities.ReputationAppeal.filter({ status: body.status || 'pending' }, '-submitted_at', 100);
      return Response.json({ appeals });
    }

    if (action === 'review_appeal') {
      const user = await base44.auth.me();
      if (!user || user.role !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 });
      const { appeal_id, decision, review_decision, council_notes, escalate } = body;
      const appeals = await base44.asServiceRole.entities.ReputationAppeal.filter({ id: appeal_id });
      const appeal = appeals[0];
      if (!appeal) return Response.json({ error: 'Appeal not found' }, { status: 404 });
      const status = escalate ? 'escalated' : (decision === 'approve' ? 'approved' : 'denied');
      const updated = await base44.asServiceRole.entities.ReputationAppeal.update(appeal.id, {
        status, reviewed_at: new Date().toISOString(), reviewed_by_id: user.id, reviewed_by_name: user.full_name,
        review_decision: review_decision || '', council_notes: council_notes || '', escalated_to_council: !!escalate,
      });
      await logAudit(appeal.user_id, appeal.user_name, 0, 0, `Appeal ${status}: ${appeal.appeal_type}`, 'appeal_resolution', decision === 'approve' ? 'appeal_approve' : 'appeal_deny', { id: user.id, name: user.full_name }, { appeal_id, decision, review_decision });
      await notifyUser(appeal.user_id, `Appeal ${status}`, `Your ${appeal.appeal_type} appeal has been ${status}. ${review_decision || ''}`, status === 'approved' ? '✅' : 'ℹ️', '/reputation');
      return Response.json({ success: true, appeal: updated });
    }

    // ─── COUNCIL ──────────────────────────────────────────
    if (action === 'create_council_review') {
      const user = await base44.auth.me();
      if (!user || user.role !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 });
      const { user_id, review_type, reason, priority } = body;
      const rec = await getReputationRecord(user_id);
      const profile = await getUserProfile(user_id);
      const review = await base44.asServiceRole.entities.CouncilReview.create({
        user_id, user_name: profile.full_name || rec?.user_name || '',
        review_type, reason, priority: priority || 'medium',
        status: 'open', opened_at: new Date().toISOString(),
        initiated_by_id: user.id, initiated_by_name: user.full_name,
      });
      if (rec) await base44.asServiceRole.entities.ExecutiveReputation.update(rec.id, { council_review_status: 'under_review', council_review_reason: reason, council_reviewed_at: new Date().toISOString(), council_reviewer_id: user.id, council_reviewer_name: user.full_name });
      await logAudit(user_id, rec?.user_name || '', rec?.reputation_score || 0, rec?.reputation_score || 0, `Council review opened: ${review_type}`, 'council_decision', 'council_review', { id: user.id, name: user.full_name }, { review_id: review.id, review_type, reason });
      return Response.json({ success: true, review });
    }

    if (action === 'admin_council_reviews') {
      const user = await base44.auth.me();
      if (!user || user.role !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 });
      const reviews = await base44.asServiceRole.entities.CouncilReview.filter({ status: body.status || 'open' }, '-opened_at', 100);
      return Response.json({ reviews });
    }

    if (action === 'resolve_council_review') {
      const user = await base44.auth.me();
      if (!user || user.role !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 });
      const { review_id, decision, decision_notes, resolution_status } = body;
      const reviews = await base44.asServiceRole.entities.CouncilReview.filter({ id: review_id });
      const review = reviews[0];
      if (!review) return Response.json({ error: 'Review not found' }, { status: 404 });
      const updated = await base44.asServiceRole.entities.CouncilReview.update(review.id, {
        status: 'resolved', decision, decision_notes: decision_notes || '',
        resolution_status: resolution_status || 'no_action', resolved_at: new Date().toISOString(),
      });
      const rec = await getReputationRecord(review.user_id);
      if (rec) await base44.asServiceRole.entities.ExecutiveReputation.update(rec.id, { council_review_status: 'resolved' });
      await logAudit(review.user_id, review.user_name, rec?.reputation_score || 0, rec?.reputation_score || 0, `Council review resolved: ${decision}`, 'council_decision', 'council_review', { id: user.id, name: user.full_name }, { review_id, decision, resolution_status });
      await notifyUser(review.user_id, 'Council Review Resolved', `Your reputation council review has been resolved. Decision: ${decision}`, '🏛️', '/reputation');
      return Response.json({ success: true, review: updated });
    }

    // ─── RECRUITER VIEW ────────────────────────────────────
    if (action === 'get_recruiter_view') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
      const targetUserId = body.user_id || user.id;

      const rec = await getReputationRecord(targetUserId);
      const profile = await getUserProfile(targetUserId);

      if (!rec) return Response.json({ error: 'Reputation record not found' }, { status: 404 });

      let breakdown = [];
      try { breakdown = JSON.parse(rec.weighted_breakdown_json || '[]'); } catch (e) {}
      let insights = {};
      try { insights = JSON.parse(rec.ai_executive_insights_json || '{}'); } catch (e) {}
      let qualityDims = {};
      try { qualityDims = JSON.parse(rec.quality_dimensions_json || '{}'); } catch (e) {}
      let competencies = {};
      try { competencies = JSON.parse(rec.competencies_json || '{}'); } catch (e) {}
      let honors = [];
      try { honors = JSON.parse(rec.yearly_honors_json || '[]'); } catch (e) {}

      const topPillars = breakdown.sort((a, b) => b.score - a.score).slice(0, 5);
      const topCompetencies = Object.entries(competencies).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([id, score]) => ({ id, score }));

      return Response.json({
        executive: {
          name: rec.user_name,
          headline: rec.professional_headline || profile.professional_headline || '',
          photo: rec.user_photo,
          organization: profile.current_company || '',
          industry: profile.industry || '',
          country: profile.country || '',
        },
        reputation: {
          score: rec.reputation_score,
          tier: rec.reputation_tier,
          overall_rating: rec.overall_executive_rating,
          community_trust: rec.community_trust_score,
          leadership_influence: rec.leadership_influence_pct,
          executive_credibility: rec.executive_credibility_score,
        },
        leadership_strengths: topPillars.map(p => ({ pillar: p.pillar, score: p.score, weight: p.weight })),
        top_competencies: topCompetencies,
        thought_leadership: {
          letters_published: rec.total_letters,
          thought_leadership_index: rec.thought_leadership_index,
          total_views: rec.total_views,
          featured_articles: rec.featured_contributions,
        },
        mentorship: {
          score: rec.mentorship_score,
          sessions: rec.sessions_completed,
          hours: rec.mentoring_hours,
        },
        community_standing: {
          contributions: rec.total_contributions,
          helpful_responses: rec.helpful_responses,
          awards: rec.community_awards,
          professional_conduct: rec.professional_conduct_score,
        },
        professional_verification: {
          verified: profile.verified_executive || false,
          identity_verified: profile.identity_verified || false,
          profile_completion: profile.professional_headline ? 80 : 40,
        },
        ai_insights: insights,
        quality_dimensions: qualityDims,
        yearly_honors: honors,
        top_competencies: topCompetencies,
        disclaimer: 'This information is provided for informational purposes only and does not constitute an employment guarantee, hiring recommendation, or endorsement by EXECLEAD.AI. All reputation data is algorithmically computed and should be independently verified.',
      });
    }

    // ─── ENTERPRISE VIEW ───────────────────────────────────
    if (action === 'get_enterprise_view') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

      const profile = await getUserProfile(user.id);
      if (profile.subscription_plan !== 'enterprise' && user.role !== 'admin') {
        return Response.json({ error: 'Enterprise subscription required' }, { status: 403 });
      }

      // Get all organization members' reputations
      const orgId = profile.organization_id;
      if (!orgId) return Response.json({ error: 'No organization configured' }, { status: 400 });

      const orgProfiles = await base44.asServiceRole.entities.UserProfile.filter({ organization_id: orgId, status: 'active' }, '-created_date', 200);
      const memberIds = orgProfiles.map(p => p.created_by_id).filter(Boolean);
      const memberMap = {};
      orgProfiles.forEach(p => { if (p.created_by_id) memberMap[p.created_by_id] = p; });

      const members = [];
      for (const mid of memberIds.slice(0, 100)) {
        const rec = await getReputationRecord(mid);
        if (rec) {
          members.push({
            user_id: mid,
            name: rec.user_name,
            headline: rec.professional_headline || '',
            photo: rec.user_photo,
            score: rec.reputation_score,
            tier: rec.reputation_tier,
            rating: rec.overall_executive_rating,
            letters: rec.total_letters,
            contributions: rec.total_contributions,
            mentoring_hours: rec.mentoring_hours,
            simulations: rec.simulations_completed,
            courses: rec.courses_completed,
            thought_leadership_index: rec.thought_leadership_index,
            conduct: rec.professional_conduct_score,
            credibility: rec.executive_credibility_score,
          });
        }
      }

      members.sort((a, b) => b.score - a.score);

      const topMentors = members.filter(m => m.mentoring_hours > 0).sort((a, b) => b.mentoring_hours - a.mentoring_hours).slice(0, 10);
      const topContributors = members.sort((a, b) => b.contributions - a.contributions).slice(0, 10);
      const communityChampions = members.filter(m => m.credibility >= 70).sort((a, b) => b.credibility - a.credibility).slice(0, 10);
      const avgScore = members.length > 0 ? Math.round(members.reduce((s, m) => s + m.score, 0) / members.length) : 0;
      const avgReadiness = members.length > 0 ? Math.round(members.reduce((s, m) => s + m.credibility, 0) / members.length) : 0;
      const totalLearning = members.reduce((s, m) => s + m.courses, 0);

      return Response.json({
        organization_id: orgId,
        total_members: members.length,
        average_score: avgScore,
        average_readiness: avgReadiness,
        total_learning_progress: totalLearning,
        top_mentors: topMentors,
        top_contributors: topContributors,
        community_champions: communityChampions,
        all_members: members,
      });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
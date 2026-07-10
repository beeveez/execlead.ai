import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const LEVELS = [
  { id: 'seed', title: 'Seed', points: 0, icon: '🌱' },
  { id: 'emerging', title: 'Emerging Leader', points: 500, icon: '🌿' },
  { id: 'manager', title: 'People Manager', points: 2000, icon: '👥' },
  { id: 'senior', title: 'Senior Leader', points: 5000, icon: '🎯' },
  { id: 'executive', title: 'Executive', points: 10000, icon: '🏆' },
  { id: 'enterprise', title: 'Enterprise Leader', points: 20000, icon: '⚡' },
  { id: 'board', title: 'Board Ready', points: 35000, icon: '👑' },
  { id: 'legacy', title: 'Legacy Leader', points: 50000, icon: '💎' },
];

const POINTS = {
  leadership_dna: 500, letter_published: 250, simulation_completed: 300,
  academy_module: 150, challenge_completed: 50, identity_verified: 200,
  professional_verification: 200, reputation_milestone: 100, mentorship: 300,
  resume_completed: 100, weekly_streak: 25, community_recognition: 50,
};

const READINESS_DIMENSIONS = [
  { id: 'leadership', label: 'Leadership', metric: 'leadership_maturity', benchmark: 72, icon: '👑', recommendation: 'Complete Leadership DNA™ and executive coaching sessions' },
  { id: 'strategic_thinking', label: 'Strategic Thinking', metric: 'leadership_maturity', benchmark: 68, icon: '🎯', recommendation: 'Run strategic decision simulations' },
  { id: 'executive_communication', label: 'Executive Communication', metric: 'communication_growth', benchmark: 75, icon: '💬', recommendation: 'Practice executive briefings in the Simulator' },
  { id: 'commercial_acumen', label: 'Commercial Acumen', metric: 'commercial_maturity', benchmark: 70, icon: '📈', recommendation: 'Complete Financial Leadership in the Academy' },
  { id: 'financial_literacy', label: 'Financial Literacy', metric: 'commercial_maturity', benchmark: 65, icon: '💰', recommendation: 'Complete Financial Acumen modules' },
  { id: 'decision_making', label: 'Decision Making', metric: 'leadership_maturity', benchmark: 72, icon: '⚖️', recommendation: 'Complete Executive Strategy Simulation' },
  { id: 'people_leadership', label: 'People Leadership', metric: 'leadership_maturity', benchmark: 74, icon: '👥', recommendation: 'Mentor other professionals and complete People Leadership modules' },
  { id: 'innovation', label: 'Innovation', metric: 'leadership_maturity', benchmark: 66, icon: '💡', recommendation: 'Publish Leadership Letters on innovation topics' },
  { id: 'executive_presence', label: 'Executive Presence', metric: 'executive_presence', benchmark: 71, icon: '✨', recommendation: 'Work with the Executive Coach on presence' },
  { id: 'stakeholder_management', label: 'Stakeholder Management', metric: 'communication_growth', benchmark: 73, icon: '🤝', recommendation: 'Complete Stakeholder Management simulations' },
  { id: 'change_leadership', label: 'Change Leadership', metric: 'leadership_maturity', benchmark: 69, icon: '🔄', recommendation: 'Complete Change Leadership Academy module' },
  { id: 'board_readiness', label: 'Board Readiness', metric: 'executive_presence', benchmark: 60, icon: '🏛️', recommendation: 'Join the Executive Council and publish thought leadership' },
];

const TRUST_FACTORS_DEFS = [
  { id: 'identity_verification', label: 'Identity Verification', weight: 15, icon: '🆔' },
  { id: 'professional_verification', label: 'Professional Verification', weight: 12, icon: '🏅' },
  { id: 'leadership_dna', label: 'Leadership DNA Completion', weight: 10, icon: '🧬' },
  { id: 'resume_verification', label: 'Resume Verification', weight: 8, icon: '📄' },
  { id: 'published_profile', label: 'Published Profile', weight: 8, icon: '🌐' },
  { id: 'executive_reputation', label: 'Executive Reputation', weight: 12, icon: '⭐' },
  { id: 'executive_legacy', label: 'Executive Legacy', weight: 8, icon: '📜' },
  { id: 'community_conduct', label: 'Community Conduct', weight: 10, icon: '🤝' },
  { id: 'account_security', label: 'Account Security', weight: 8, icon: '🔒' },
  { id: 'no_policy_violations', label: 'No Policy Violations', weight: 5, icon: '✓' },
  { id: 'activity_authenticity', label: 'Activity Authenticity', weight: 4, icon: '📊' },
];

const READINESS_RECS = [
  { activity: 'financial_leadership', label: 'Complete Financial Leadership', path: '/academy', icon: '💰', gain: 2 },
  { activity: 'negotiation_sim', label: 'Finish Executive Negotiation Simulation', path: '/simulator', icon: '🎯', gain: 2 },
  { activity: 'mentorship', label: 'Mentor another professional', path: '/network/mentorship', icon: '🤝', gain: 1 },
  { activity: 'publish_letters', label: 'Publish two Leadership Letters', path: '/legacy-library/new', icon: '✍️', gain: 1 },
];

function getLevel(points) {
  let current = LEVELS[0], next = null;
  for (let i = 0; i < LEVELS.length; i++) {
    if (points >= LEVELS[i].points) { current = LEVELS[i]; next = LEVELS[i + 1] || null; }
  }
  return { current, next, journeyPercent: Math.round((LEVELS.indexOf(current) / (LEVELS.length - 1)) * 100) };
}

async function getProfile(base44, userId) {
  try {
    const profiles = await base44.asServiceRole.entities.UserProfile.filter({ created_by_id: userId }, '-created_date', 5);
    return profiles[0] || null;
  } catch (e) { return null; }
}

function computeReadiness(profile, reputationScore) {
  const m = {
    leadership_maturity: profile?.leadership_maturity || 0,
    commercial_maturity: profile?.commercial_maturity || 0,
    communication_growth: profile?.communication_growth || 0,
    executive_presence: profile?.executive_presence || 0,
    confidence: profile?.confidence || 0,
    interview_readiness: profile?.interview_readiness || 0,
    promotion_readiness: profile?.promotion_readiness || 0,
  };
  const dimensions = READINESS_DIMENSIONS.map((d) => {
    const current = m[d.metric] || 0;
    const trend = current >= d.benchmark ? 'above_benchmark' : current >= d.benchmark * 0.75 ? 'approaching' : 'below_benchmark';
    return { ...d, current, gap: Math.max(0, d.benchmark - current), trend };
  });
  const overallScore = Math.round(
    (m.leadership_maturity + m.commercial_maturity + m.communication_growth +
     m.executive_presence + m.confidence + m.interview_readiness + m.promotion_readiness) / 7
  );
  const gap = Math.max(0, 100 - overallScore);
  const estimatedMonths = gap > 0 ? Math.max(1, Math.ceil(gap / 1.8)) : 0;
  const confidence = overallScore >= 70 ? 'High' : overallScore >= 50 ? 'Medium' : 'Low';
  const trend = overallScore >= 70 ? 'Improving' : overallScore >= 50 ? 'Stable' : 'Developing';
  const recommendations = READINESS_RECS.slice();
  const estimatedGain = recommendations.reduce((s, r) => s + r.gain, 0);
  return { overallScore, dimensions, estimatedMonths, confidence, trend, recommendations, estimatedGain };
}

function computeTrust(profile, journeyPoints, reputationScore, dnaCompleted) {
  const levels = [
    { id: 'email_verified', label: 'Email Verified', icon: '📧', unlocked: true },
    { id: 'phone_verified', label: 'Phone Verified', icon: '📱', unlocked: !!(profile?.mobile_number) },
    { id: 'identity_verified', label: 'Identity Verified', icon: '✅', unlocked: !!profile?.identity_verified },
    { id: 'professional_verified', label: 'Professional Verified', icon: '🏅', unlocked: !!profile?.verified_executive },
    { id: 'enterprise_verified', label: 'Enterprise Verified', icon: '🏢', unlocked: !!profile?.organization_id },
    { id: 'verified_executive', label: 'Verified Executive', icon: '⭐', unlocked: !!profile?.verified_executive && reputationScore >= 200 },
    { id: 'founding_verified', label: 'Founder Verified', icon: '👑', unlocked: !!profile?.founding_member },
  ];
  const factors = TRUST_FACTORS_DEFS.map((f) => {
    let earned = false, score = 0;
    if (f.id === 'identity_verification') { earned = !!profile?.identity_verified; score = earned ? f.weight : 0; }
    else if (f.id === 'professional_verification') { earned = !!profile?.verified_executive; score = earned ? f.weight : 0; }
    else if (f.id === 'leadership_dna') { earned = dnaCompleted; score = earned ? f.weight : 0; }
    else if (f.id === 'resume_verification') { earned = !!(profile?.resume_url); score = earned ? f.weight : 0; }
    else if (f.id === 'published_profile') { earned = !!profile?.public_profile_enabled; score = earned ? f.weight : 0; }
    else if (f.id === 'executive_reputation') { score = Math.round(f.weight * Math.min(reputationScore / 500, 1)); earned = score >= f.weight * 0.5; }
    else if (f.id === 'executive_legacy') { earned = journeyPoints >= 10000; score = earned ? f.weight : 0; }
    else if (f.id === 'community_conduct') { earned = !profile?.account_banned; score = earned ? f.weight : 0; }
    else if (f.id === 'account_security') { score = Math.round(f.weight * (profile?.identity_verified ? 1 : 0.6)); earned = score >= f.weight * 0.5; }
    else if (f.id === 'no_policy_violations') { earned = !profile?.account_banned; score = earned ? f.weight : 0; }
    else if (f.id === 'activity_authenticity') { score = Math.round(f.weight * Math.min(journeyPoints / 5000, 1)); earned = score > 0; }
    return { ...f, earned, score };
  });
  const totalScore = Math.min(100, factors.reduce((s, f) => s + f.score, 0));
  const tier = totalScore >= 90 ? 'Elite' : totalScore >= 75 ? 'High' : totalScore >= 50 ? 'Established' : 'Building';
  return { levels, factors, totalScore, tier };
}

function computeForecast(readiness, trust, journeyPoints, reputationScore) {
  const journeyFactor = Math.min(journeyPoints / 20000, 1) * 20;
  const readinessFactor = (readiness.overallScore / 100) * 35;
  const trustFactor = (trust.totalScore / 100) * 15;
  const reputationFactor = Math.min(reputationScore / 1000, 1) * 15;
  const baseline = 15;
  const probability = Math.min(95, Math.round(journeyFactor + readinessFactor + trustFactor + reputationFactor + baseline));
  const gap = Math.max(0, 100 - probability);
  const monthsLow = gap > 0 ? Math.max(1, Math.ceil(gap / 4)) : 0;
  const monthsHigh = monthsLow > 0 ? monthsLow + 4 : 0;
  const confidence = probability >= 75 ? 'High' : probability >= 50 ? 'Medium' : 'Low';
  const factorBreakdown = [
    { id: 'journey', label: 'Executive Journey', icon: '🚀', points: Math.round(journeyFactor), max: 20 },
    { id: 'readiness', label: 'Executive Readiness', icon: '📊', points: Math.round(readinessFactor), max: 35 },
    { id: 'trust', label: 'Executive Trust', icon: '🛡️', points: Math.round(trustFactor), max: 15 },
    { id: 'reputation', label: 'Executive Reputation', icon: '⭐', points: Math.round(reputationFactor), max: 15 },
    { id: 'baseline', label: 'Career Baseline', icon: '📈', points: baseline, max: 15 },
  ];
  return { probability, timelineLow: monthsLow, timelineHigh: monthsHigh, confidence, factorBreakdown };
}

async function gatherJourneySignals(base44, userId) {
  let journeyPoints = 0, dnaCompleted = false, letterCount = 0, simCount = 0, lessonCount = 0, challengeCount = 0, mentorCount = 0;
  try {
    const dna = await base44.asServiceRole.entities.LeadershipDNA.filter({ created_by_id: userId }, '-created_date', 5);
    if (dna.length > 0) { journeyPoints += POINTS.leadership_dna; dnaCompleted = true; }
  } catch (e) {}
  try {
    const letters = await base44.asServiceRole.entities.LeadershipLetter.filter({ author_user_id: userId, status: 'published' }, '-created_date', 200);
    letterCount = letters.length; journeyPoints += letterCount * POINTS.letter_published;
  } catch (e) {}
  try {
    const sims = await base44.asServiceRole.entities.SimulationSession.filter({ created_by_id: userId }, '-created_date', 200);
    simCount = sims.length; journeyPoints += simCount * POINTS.simulation_completed;
  } catch (e) {}
  try {
    const lessons = await base44.asServiceRole.entities.LessonProgress.filter({ created_by_id: userId }, '-updated_date', 500);
    lessonCount = lessons.filter((l) => l.completed).length; journeyPoints += lessonCount * POINTS.academy_module;
  } catch (e) {}
  try {
    const challenges = await base44.asServiceRole.entities.ChallengeResult.filter({ created_by_id: userId }, '-created_date', 500);
    challengeCount = challenges.length; journeyPoints += challengeCount * POINTS.challenge_completed;
  } catch (e) {}
  try {
    const mentors = await base44.asServiceRole.entities.MentorProfile.filter({ created_by_id: userId }, '-created_date', 10);
    mentorCount = mentors.length; journeyPoints += mentorCount * POINTS.mentorship;
  } catch (e) {}
  return { journeyPoints, dnaCompleted, letterCount, simCount, lessonCount, challengeCount, mentorCount };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const action = body.action || 'compute';

    if (action === 'enterprise') {
      const profile = await getProfile(base44, user.id);
      const orgId = body.organization_id || profile?.organization_id;
      if (!orgId) return Response.json({ error: 'No organization found' }, { status: 400 });
      const orgProfiles = await base44.asServiceRole.entities.UserProfile.filter({ organization_id: orgId }, '-xp_points', 500);
      const members = orgProfiles.map((p) => {
        const readinessScore = Math.round(((p.leadership_maturity || 0) + (p.commercial_maturity || 0) + (p.communication_growth || 0) + (p.executive_presence || 0) + (p.promotion_readiness || 0)) / 5);
        const level = getLevel(p.xp_points || 0);
        return { id: p.id, name: p.full_name || 'Unknown', xp: p.xp_points || 0, level: level.current, readiness: readinessScore, promotion: p.promotion_readiness || 0, target_role: p.target_role, identity_verified: p.identity_verified, trust_score: p.trust_score || 40 };
      });
      const avgReadiness = members.length > 0 ? Math.round(members.reduce((s, m) => s + m.readiness, 0) / members.length) : 0;
      const avgXp = members.length > 0 ? Math.round(members.reduce((s, m) => s + m.xp, 0) / members.length) : 0;
      const avgPromotion = members.length > 0 ? Math.round(members.reduce((s, m) => s + m.promotion, 0) / members.length) : 0;
      const avgTrust = members.length > 0 ? Math.round(members.reduce((s, m) => s + m.trust_score, 0) / members.length) : 0;
      const distribution = {};
      const readinessBuckets = { critical: 0, developing: 0, ready: 0, elite: 0 };
      members.forEach((m) => {
        distribution[m.level.id] = (distribution[m.level.id] || 0) + 1;
        if (m.readiness < 40) readinessBuckets.critical++;
        else if (m.readiness < 60) readinessBuckets.developing++;
        else if (m.readiness < 80) readinessBuckets.ready++;
        else readinessBuckets.elite++;
      });
      const highPotential = members.filter((m) => m.readiness >= 70 && m.xp >= 1000).sort((a, b) => b.xp - a.xp).slice(0, 10);
      const riskIndicators = members.filter((m) => m.readiness < 40 || m.trust_score < 30).slice(0, 10);
      const topContributors = members.sort((a, b) => b.xp - a.xp).slice(0, 5);
      return Response.json({
        totalMembers: members.length,
        averageReadiness: avgReadiness,
        averageJourney: avgXp,
        averagePromotion: avgPromotion,
        averageTrust: avgTrust,
        journeyLevel: getLevel(avgXp).current,
        distribution,
        readinessBuckets,
        highPotential,
        riskIndicators,
        topContributors,
        members: members.slice(0, 50),
      });
    }

    // === Full compute ===
    const profile = await getProfile(base44, user.id);
    const signals = await gatherJourneySignals(base44, user.id);
    const journeyLevel = getLevel(signals.journeyPoints);

    let reputationScore = 0, reputationTier = 'new_member';
    try {
      const reps = await base44.asServiceRole.entities.ExecutiveReputation.filter({ user_id: user.id }, '-updated_date', 1);
      if (reps.length > 0) { reputationScore = reps[0].reputation_score || 0; reputationTier = reps[0].reputation_tier || 'new_member'; }
    } catch (e) {}

    const readiness = computeReadiness(profile, reputationScore);
    const trust = computeTrust(profile, signals.journeyPoints, reputationScore, signals.dnaCompleted);
    const forecast = computeForecast(readiness, trust, signals.journeyPoints, reputationScore);

    if (action === 'passport') {
      let letters = [];
      try { letters = await base44.asServiceRole.entities.LeadershipLetter.filter({ author_user_id: user.id, status: 'published' }, '-published_at', 10); } catch (e) {}
      return Response.json({
        profile: profile ? {
          full_name: profile.full_name, professional_headline: profile.professional_headline,
          current_role: profile.current_role, target_role: profile.target_role, target_company: profile.target_company,
          industry: profile.industry, years_experience: profile.years_experience, country: profile.country, city: profile.city,
          bio: profile.bio, skills: profile.skills || [], public_username: profile.public_username,
          organization_id: profile.organization_id, founding_member: profile.founding_member,
          identity_verified: profile.identity_verified, verified_executive: profile.verified_executive,
          linkedin_url: profile.linkedin_url, portfolio_url: profile.portfolio_url, resume_url: profile.resume_url,
        } : null,
        journey: { level: journeyLevel, points: signals.journeyPoints, ...signals },
        readiness,
        trust,
        reputation: { score: reputationScore, tier: reputationTier },
        letters: letters.map((l) => ({ id: l.id, title: l.title, category: l.category, published_at: l.published_at })),
        forecast,
      });
    }

    if (action === 'trust') {
      const trustTimeline = [];
      trust.levels.filter((l) => l.unlocked).forEach((l) => trustTimeline.push({ level: l, date: profile?.created_date }));
      return Response.json({ trust, trustTimeline, profile: profile ? { identity_verified: profile.identity_verified, verified_executive: profile.verified_executive, founding_member: profile.founding_member } : null });
    }

    // Default: compute all
    return Response.json({
      readiness,
      trust,
      forecast,
      journey: { level: journeyLevel, points: signals.journeyPoints, signals },
      reputation: { score: reputationScore, tier: reputationTier },
      profile: profile ? {
        current_role: profile.current_role, target_role: profile.target_role, target_company: profile.target_company,
        industry: profile.industry, years_experience: profile.years_experience, career_stage: profile.career_stage,
        interview_readiness: profile.interview_readiness || 0, leadership_maturity: profile.leadership_maturity || 0,
        commercial_maturity: profile.commercial_maturity || 0, executive_presence: profile.executive_presence || 0,
        promotion_readiness: profile.promotion_readiness || 0, communication_growth: profile.communication_growth || 0,
        confidence: profile.confidence || 0, weak_areas: profile.weak_areas || [], strong_areas: profile.strong_areas || [],
        identity_verified: profile.identity_verified, verified_executive: profile.verified_executive, founding_member: profile.founding_member,
      } : null,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
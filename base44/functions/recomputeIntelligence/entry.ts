import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import {
  authenticateRequest,
  enforceAuth,
  getClientIp,
  logSecurityEvent,
  securityResponse,
} from '../../shared/auth.ts';

/**
 * recomputeIntelligence — Central computation + cache engine.
 *
 * Gathers all user signals in parallel, computes journey/readiness/trust/forecast
 * using config from manageConfig, writes canonical JourneyEvent records (M1),
 * and persists the full result to UserProfile cache fields (H2).
 *
 * Called by:
 *   - Entity automations (body.data contains the triggering entity record)
 *   - manageJourney / manageIntelligence (body.user_id when cache is stale)
 *   - Scheduled automation (body.action = 'refresh_stale' for batch refresh)
 *   - Direct user call (uses base44.auth.me())
 *   - Assessment completion (Phase 16: fire-and-forget invoke with explicit user_id)
 */

// ── Computation helpers (accept config as parameter) ──

function getLevel(points, levels) {
  let current = levels[0], next = null;
  for (let i = 0; i < levels.length; i++) {
    if (points >= levels[i].points) { current = levels[i]; next = levels[i + 1] || null; }
  }
  const progress = next ? Math.round(((points - current.points) / (next.points - current.points)) * 100) : 100;
  const journeyPercent = Math.round((levels.indexOf(current) / (levels.length - 1)) * 100);
  return { current, next, progress, journeyPercent, pointsToNext: next ? next.points - points : 0 };
}

function getWeekNum(d) {
  return Math.floor(new Date(d).getTime() / (7 * 24 * 60 * 60 * 1000));
}

function computeStreak(events, category) {
  const catEvents = events.filter((e) => e.category === category);
  if (catEvents.length === 0) return { current: 0, best: 0 };
  const weeks = [...new Set(catEvents.map((e) => getWeekNum(e.date)))].sort((a, b) => b - a);
  let current = weeks[0] === getWeekNum(new Date()) || weeks[0] === getWeekNum(new Date()) - 1 ? 1 : 0;
  if (current > 0) {
    for (let i = 1; i < weeks.length; i++) {
      if (weeks[i - 1] - weeks[i] === 1) current++; else break;
    }
  }
  let best = 1, run = 1;
  for (let i = 1; i < weeks.length; i++) {
    if (weeks[i - 1] - weeks[i] === 1) { run++; best = Math.max(best, run); } else run = 1;
  }
  return { current, best };
}

function filterByRange(events, range) {
  if (range === 'lifetime') return events;
  const now = Date.now();
  const cutoff = range === '30d' ? now - 30 * 86400000 : range === '90d' ? now - 90 * 86400000 : range === 'year' ? now - 365 * 86400000 : 0;
  return events.filter((e) => new Date(e.date).getTime() >= cutoff);
}

function computeAchievements(breakdown, totalPoints, profile, config) {
  return config.achievements.map((a) => {
    let unlocked = false;
    switch (a.id) {
      case 'first_leadership_dna':  unlocked = (breakdown.leadership_dna?.count || 0) > 0; break;
      case 'first_letter':          unlocked = (breakdown.letters?.count || 0) > 0; break;
      case 'first_mentorship':      unlocked = (breakdown.mentorship?.count || 0) > 0; break;
      case 'reputation_100':        unlocked = (breakdown.reputation?.score || 0) >= 100; break;
      case 'identity_verified':     unlocked = !!profile?.identity_verified; break;
      case 'executive_contributor': unlocked = totalPoints >= 10000; break;
      case 'leadership_fellow':     unlocked = totalPoints >= 20000; break;
      case 'legacy_builder':        unlocked = totalPoints >= 50000; break;
      case 'scholar':               unlocked = (breakdown.academy?.count || 0) >= 5; break;
      case 'simulation_master':     unlocked = (breakdown.simulations?.count || 0) >= 3; break;
      case 'challenger':            unlocked = (breakdown.challenges?.count || 0) >= 10; break;
      case 'streak_warrior':        unlocked = (breakdown.weekly_streak?.count || 0) >= 4; break;
    }
    return { id: a.id, unlocked };
  });
}

function getRecommendations(breakdown, level, config) {
  if (!level.next) return [];
  const recs = [];
  const p = config.points;
  if ((breakdown.leadership_dna?.count || 0) === 0) recs.push({ activity: 'leadership_dna', label: 'Complete Leadership DNA™', path: '/leadership-dna', points: p.leadership_dna.points, icon: '🧬' });
  if ((breakdown.letters?.count || 0) === 0) recs.push({ activity: 'letter_published', label: 'Publish a Leadership Letter', path: '/legacy-library/new', points: p.letter_published.points, icon: '✍️' });
  else if ((breakdown.letters?.count || 0) < 3) recs.push({ activity: 'letter_published', label: 'Publish another Leadership Letter', path: '/legacy-library/new', points: p.letter_published.points, icon: '✍️' });
  if ((breakdown.simulations?.count || 0) === 0) recs.push({ activity: 'simulation_completed', label: 'Complete an Executive Simulation', path: '/simulator', points: p.simulation_completed.points, icon: '🎯' });
  if ((breakdown.academy?.count || 0) < 5) recs.push({ activity: 'academy_module', label: 'Complete an Academy Module', path: '/academy', points: p.academy_module.points, icon: '📚' });
  if ((breakdown.challenges?.count || 0) < 10) recs.push({ activity: 'challenge_completed', label: 'Take an Executive Challenge', path: '/challenge', points: p.challenge_completed.points, icon: '⚔️' });
  if ((breakdown.resume?.count || 0) === 0) recs.push({ activity: 'resume_completed', label: 'Upload your Resume', path: '/resume', points: p.resume_completed.points, icon: '📄' });
  if ((breakdown.mentorship?.count || 0) === 0) recs.push({ activity: 'mentorship', label: 'Become a Mentor', path: '/network/mentorship', points: p.mentorship.points, icon: '🤝' });
  return recs.sort((a, b) => b.points - a.points).slice(0, 4);
}

function estimateDays(timeline, level, recommendations) {
  if (!level.next) return null;
  const pointsToNext = level.pointsToNext;
  if (pointsToNext <= 0) return 0;
  const thirtyDaysAgo = Date.now() - 30 * 86400000;
  const recentEvents = timeline.filter((e) => new Date(e.date).getTime() >= thirtyDaysAgo && e.points > 0);
  const recentPoints = recentEvents.reduce((sum, e) => sum + e.points, 0);
  const weeklyAvg = recentPoints / 4.3;
  if (weeklyAvg > 0) return Math.ceil((pointsToNext / weeklyAvg) * 7);
  if (recommendations.length > 0) {
    const dailyPotential = recommendations.reduce((sum, r) => sum + r.points, 0) / recommendations.length;
    return Math.ceil(pointsToNext / Math.max(dailyPotential, 1));
  }
  return null;
}

function buildDigest(timeline, level) {
  const sevenDaysAgo = Date.now() - 7 * 86400000;
  const weekEvents = timeline.filter((e) => new Date(e.date).getTime() >= sevenDaysAgo && e.points > 0);
  const weekPoints = weekEvents.reduce((sum, e) => sum + e.points, 0);
  const byType = {};
  weekEvents.forEach((e) => {
    if (!byType[e.type]) byType[e.type] = { count: 0, points: 0, label: e.title };
    byType[e.type].count++;
    byType[e.type].points += e.points;
  });
  return {
    weekPoints,
    weekActivities: weekEvents.length,
    breakdown: Object.entries(byType).map(([type, data]) => ({ type, ...data })),
    percentToNext: level.next ? Math.round(level.progress) : 100,
    nextLevel: level.next?.title || null,
    currentLevel: level.current.title,
  };
}

function computeReadiness(profile, reputationScore, config) {
  const m = {
    leadership_maturity: profile?.leadership_maturity || 0,
    commercial_maturity: profile?.commercial_maturity || 0,
    communication_growth: profile?.communication_growth || 0,
    executive_presence: profile?.executive_presence || 0,
    confidence: profile?.confidence || 0,
    interview_readiness: profile?.interview_readiness || 0,
    promotion_readiness: profile?.promotion_readiness || 0,
  };
  const dimensions = config.readinessDimensions.map((d) => {
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
  const recommendations = config.readinessRecommendations.slice();
  const estimatedGain = recommendations.reduce((s, r) => s + r.gain, 0);
  return { overallScore, dimensions, estimatedMonths, confidence, trend, recommendations, estimatedGain };
}

function computeTrust(profile, journeyPoints, reputationScore, dnaCompleted, config) {
  const levels = config.trustLevels.map((tl) => {
    let unlocked = false;
    switch (tl.id) {
      case 'email_verified':        unlocked = true; break;
      case 'phone_verified':        unlocked = !!(profile?.mobile_number); break;
      case 'identity_verified':     unlocked = !!profile?.identity_verified; break;
      case 'professional_verified': unlocked = !!profile?.verified_executive; break;
      case 'enterprise_verified':   unlocked = !!profile?.organization_id; break;
      case 'verified_executive':    unlocked = !!profile?.verified_executive && reputationScore >= 200; break;
      case 'founding_verified':     unlocked = !!profile?.founding_member; break;
    }
    return { ...tl, unlocked };
  });
  const factors = config.trustFactors.map((f) => {
    let earned = false, score = 0;
    if (f.id === 'identity_verification')     { earned = !!profile?.identity_verified; score = earned ? f.weight : 0; }
    else if (f.id === 'professional_verification') { earned = !!profile?.verified_executive; score = earned ? f.weight : 0; }
    else if (f.id === 'leadership_dna')       { earned = dnaCompleted; score = earned ? f.weight : 0; }
    else if (f.id === 'resume_verification')  { earned = !!(profile?.resume_url); score = earned ? f.weight : 0; }
    else if (f.id === 'published_profile')    { earned = !!profile?.public_profile_enabled; score = earned ? f.weight : 0; }
    else if (f.id === 'executive_reputation') { score = Math.round(f.weight * Math.min(reputationScore / 500, 1)); earned = score >= f.weight * 0.5; }
    else if (f.id === 'executive_legacy')     { earned = journeyPoints >= 10000; score = earned ? f.weight : 0; }
    else if (f.id === 'community_conduct')    { earned = !profile?.account_banned; score = earned ? f.weight : 0; }
    else if (f.id === 'account_security')     { score = Math.round(f.weight * (profile?.identity_verified ? 1 : 0.6)); earned = score >= f.weight * 0.5; }
    else if (f.id === 'no_policy_violations') { earned = !profile?.account_banned; score = earned ? f.weight : 0; }
    else if (f.id === 'activity_authenticity'){ score = Math.round(f.weight * Math.min(journeyPoints / 5000, 1)); earned = score > 0; }
    return { ...f, earned, score };
  });
  const totalScore = Math.min(100, factors.reduce((s, f) => s + f.score, 0));
  const tier = totalScore >= 90 ? 'Elite' : totalScore >= 75 ? 'High' : totalScore >= 50 ? 'Established' : 'Building';
  return { levels, factors, totalScore, tier };
}

function computeForecast(readiness, trust, journeyPoints, reputationScore, config) {
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
    { id: 'journey',    label: 'Executive Journey',    icon: '🚀', points: Math.round(journeyFactor),    max: 20 },
    { id: 'readiness',  label: 'Executive Readiness',  icon: '📊', points: Math.round(readinessFactor),  max: 35 },
    { id: 'trust',      label: 'Executive Trust',      icon: '🛡️', points: Math.round(trustFactor),      max: 15 },
    { id: 'reputation', label: 'Executive Reputation', icon: '⭐', points: Math.round(reputationFactor), max: 15 },
    { id: 'baseline',   label: 'Career Baseline',      icon: '📈', points: baseline,                     max: 15 },
  ];
  return { probability, timelineLow: monthsLow, timelineHigh: monthsHigh, confidence, factorBreakdown };
}

// ── Phase 16: Executive Readiness Assessment™ signal ──
// The persisted ReadinessAssessment is consumed server-side only. Client-supplied
// numbers are never trusted: defensive bounds are applied to every value read.
const clampAssessmentScore = (s) => Math.max(0, Math.min(100, Number(s) || 0));
const clampAssessmentXp = (x) => Math.max(0, Math.min(1000, Number(x) || 0));
const ASSESSMENT_CATEGORY_LABELS = {
  leadership: 'Leadership',
  strategic: 'Strategic Thinking',
  communication: 'Executive Communication',
  organization: 'Organizational Leadership',
  business: 'Business & Financial Acumen',
  role_specific: 'Role-Specific Readiness',
};

// ── Core computation for a single user ──

async function computeForUser(base44, config, userId, userName) {
  const startTime = Date.now();
  const warnings = [];

  // Get profile
  const profiles = await base44.asServiceRole.entities.UserProfile.filter({ created_by_id: userId }, '-created_date', 5);
  const profile = profiles[0] || null;
  if (!profile) return { error: 'Profile not found', warnings };

  // Parallel signal gathering (H3)
  const [dnaRes, lettersRes, simsRes, lessonsRes, challengesRes, mentorsRes, repsRes, resumesRes, careerResumesRes, assessmentsRes, existingEventsRes] = await Promise.allSettled([
    base44.asServiceRole.entities.LeadershipDNA.filter({ created_by_id: userId }, '-created_date', 10),
    base44.asServiceRole.entities.LeadershipLetter.filter({ author_user_id: userId, status: 'published' }, '-published_at', 200),
    base44.asServiceRole.entities.SimulationSession.filter({ created_by_id: userId }, '-created_date', 200),
    base44.asServiceRole.entities.LessonProgress.filter({ created_by_id: userId }, '-updated_date', 500),
    base44.asServiceRole.entities.ChallengeResult.filter({ created_by_id: userId }, '-created_date', 500),
    base44.asServiceRole.entities.MentorProfile.filter({ created_by_id: userId }, '-created_date', 10),
    base44.asServiceRole.entities.ExecutiveReputation.filter({ user_id: userId }, '-updated_date', 5),
    base44.asServiceRole.entities.ResumeVersion.filter({ created_by_id: userId }, '-created_date', 5),
    base44.asServiceRole.entities.CareerResume.filter({ created_by_id: userId }, '-created_date', 5),
    base44.asServiceRole.entities.ReadinessAssessment.filter({ user_id: userId }, '-created_date', 100),
    base44.asServiceRole.entities.JourneyEvent.filter({ user_id: userId }, '-event_date', 500),
  ]);

  const unwrap = (res, label) => {
    if (res.status === 'fulfilled') return res.value;
    console.error(`[recomputeIntelligence] ${label} query failed:`, res.reason?.message || res.reason);
    warnings.push(label);
    return [];
  };

  const dna = unwrap(dnaRes, 'leadership_dna');
  const letters = unwrap(lettersRes, 'letters');
  const sims = unwrap(simsRes, 'simulations');
  const lessons = unwrap(lessonsRes, 'lessons');
  const challenges = unwrap(challengesRes, 'challenges');
  const mentors = unwrap(mentorsRes, 'mentorship');
  const reps = unwrap(repsRes, 'reputation');
  const resumes = unwrap(resumesRes, 'resumes');
  const careerResumes = unwrap(careerResumesRes, 'career_resumes');
  const assessments = unwrap(assessmentsRes, 'readiness_assessment');
  const existingEvents = unwrap(existingEventsRes, 'journey_events');

  // ── Compute journey points & breakdown ──
  const p = config.points;
  const breakdown = {};
  let totalPoints = 0;

  const dnaPts = dna.length > 0 ? p.leadership_dna.points : 0;
  breakdown.leadership_dna = { count: dna.length, points: dnaPts };
  totalPoints += dnaPts;

  const letterPts = letters.length * p.letter_published.points;
  breakdown.letters = { count: letters.length, points: letterPts };
  totalPoints += letterPts;

  const simPts = sims.length * p.simulation_completed.points;
  breakdown.simulations = { count: sims.length, points: simPts };
  totalPoints += simPts;

  const completedLessons = lessons.filter((l) => l.completed);
  const lessonPts = completedLessons.length * p.academy_module.points;
  breakdown.academy = { count: completedLessons.length, points: lessonPts };
  totalPoints += lessonPts;

  const challengePts = challenges.length * p.challenge_completed.points;
  breakdown.challenges = { count: challenges.length, points: challengePts };
  totalPoints += challengePts;

  if (profile.identity_verified) {
    totalPoints += p.identity_verified.points;
    breakdown.identity_verified = { count: 1, points: p.identity_verified.points };
  }
  if (profile.verified_executive) {
    totalPoints += p.professional_verification.points;
    breakdown.professional_verification = { count: 1, points: p.professional_verification.points };
  }
  if (profile.streak_days) {
    const weeks = Math.floor(profile.streak_days / 7);
    const streakPts = weeks * p.weekly_streak.points;
    breakdown.weekly_streak = { count: weeks, points: streakPts };
    totalPoints += streakPts;
  }

  if (resumes.length > 0 || careerResumes.length > 0) {
    totalPoints += p.resume_completed.points;
    breakdown.resume = { count: 1, points: p.resume_completed.points };
  }

  let reputationScore = 0, reputationTier = 'new_member';
  if (reps.length > 0) {
    const rep = reps[0];
    reputationScore = rep.reputation_score || 0;
    reputationTier = rep.reputation_tier || 'new_member';
    const milestones = Math.floor(reputationScore / 100);
    const repPts = milestones * p.reputation_milestone.points;
    breakdown.reputation = { count: milestones, points: repPts, score: reputationScore };
    totalPoints += repPts;
    const awards = rep.community_awards || 0;
    if (awards > 0) {
      const awardPts = awards * p.community_recognition.points;
      breakdown.community_recognition = { count: awards, points: awardPts };
      totalPoints += awardPts;
    }
  }

  if (mentors.length > 0) {
    const mentorPts = mentors.length * p.mentorship.points;
    breakdown.mentorship = { count: mentors.length, points: mentorPts };
    totalPoints += mentorPts;
  }

  // Phase 16: completed assessments contribute their awarded XP. Journey points remain
  // DERIVED — every run rebuilds the total from signals, so XP can never double-accumulate.
  if (assessments.length > 0) {
    const assessmentPts = assessments.reduce((sum, a) => sum + clampAssessmentXp(a.xp_awarded), 0);
    breakdown.readiness_assessment = { count: assessments.length, points: assessmentPts };
    totalPoints += assessmentPts;
  }

  // ── Compute level, readiness, trust, forecast ──
  const level = getLevel(totalPoints, config.levels);
  const dnaCompleted = dna.length > 0;
  const readiness = computeReadiness(profile, reputationScore, config);

  // Phase 16: the LATEST completed ReadinessAssessment is the authoritative readiness
  // source. It overrides the cached score and dimensions but NEVER writes the 7
  // behavioral profile metric fields — those remain pristine evidence inputs, and
  // career_intelligence_json (Quick Baseline) is never touched here.
  const latestAssessment = assessments.length > 0 ? assessments[0] : null; // sorted -created_date → newest first
  if (latestAssessment) {
    const overall = clampAssessmentScore(latestAssessment.overall_score);
    let categoryScores = {};
    try { categoryScores = JSON.parse(latestAssessment.category_scores_json || '{}'); } catch {}
    let strengths = [];
    try { strengths = JSON.parse(latestAssessment.strengths_json || '[]'); } catch {}
    let growthOpportunities = [];
    try { growthOpportunities = JSON.parse(latestAssessment.growth_opportunities_json || '[]'); } catch {}
    const scoreGap = Math.max(0, 100 - overall);
    readiness.source = 'assessment';
    readiness.overallScore = overall;
    readiness.estimatedMonths = scoreGap > 0 ? Math.max(1, Math.ceil(scoreGap / 1.8)) : 0;
    readiness.confidence = latestAssessment.confidence || readiness.confidence;
    readiness.trend = overall >= 70 ? 'Improving' : overall >= 50 ? 'Stable' : 'Developing';
    // Assessment category scores in the display shape the Dashboard focus-area logic consumes.
    readiness.dimensions = Object.entries(categoryScores).map(([id, score]) => ({
      id,
      label: ASSESSMENT_CATEGORY_LABELS[id] || id.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      score: clampAssessmentScore(score),
      benchmark: 70,
    }));
    readiness.assessment = {
      assessment_id: latestAssessment.assessment_id,
      overall_score: overall,
      classification: latestAssessment.classification,
      classification_label: latestAssessment.classification_label,
      leadership_track: latestAssessment.leadership_track,
      target_executive_role: latestAssessment.target_executive_role,
      strengths,
      growth_opportunities: growthOpportunities,
      confidence: latestAssessment.confidence,
      completed_at: latestAssessment.completed_at,
    };
  }
  const trust = computeTrust(profile, totalPoints, reputationScore, dnaCompleted, config);
  const forecast = computeForecast(readiness, trust, totalPoints, reputationScore, config);
  const achievements = computeAchievements(breakdown, totalPoints, profile, config);
  const recommendations = getRecommendations(breakdown, level, config);

  // ── M1: Write canonical JourneyEvent records ──
  const existingKeys = new Set();
  existingEvents.forEach((e) => {
    let sourceId = '';
    if (e.metadata_json) {
      try { sourceId = JSON.parse(e.metadata_json).source_id || ''; } catch {}
    }
    existingKeys.add(`${e.event_type}:${sourceId}`);
  });

  const eventsToCreate = [];

  // Joined event
  if (!existingKeys.has('joined:')) {
    eventsToCreate.push({
      user_id: userId, user_name: userName, event_type: 'joined', module: 'Platform',
      points: 0, title: 'Joined EXECLEAD.AI', description: 'Began the executive leadership journey',
      category: 'level', milestone: true, event_date: profile.created_date || new Date().toISOString(),
      metadata_json: JSON.stringify({ source_id: '', icon: '🚀' }),
    });
  }

  // DNA event
  if (dna.length > 0 && !existingKeys.has(`leadership_dna:${dna[0].id}`)) {
    eventsToCreate.push({
      user_id: userId, user_name: userName, event_type: 'leadership_dna', module: 'Leadership DNA',
      points: p.leadership_dna.points, title: 'Leadership DNA™ Completed', description: 'Completed leadership assessment',
      category: 'learning', milestone: true, event_date: dna[0].created_date,
      metadata_json: JSON.stringify({ source_id: dna[0].id, icon: '🧬' }),
    });
  }

  // Letter events
  letters.forEach((l) => {
    const key = `letter_published:${l.id}`;
    if (!existingKeys.has(key)) {
      eventsToCreate.push({
        user_id: userId, user_name: userName, event_type: 'letter_published', module: 'Legacy Library',
        points: p.letter_published.points, title: 'Published Leadership Letter', description: l.title,
        category: 'publishing', milestone: false, event_date: l.published_at || l.created_date,
        metadata_json: JSON.stringify({ source_id: l.id, icon: '✍️' }),
      });
    }
  });

  // Simulation events
  sims.forEach((s) => {
    const key = `simulation_completed:${s.id}`;
    if (!existingKeys.has(key)) {
      eventsToCreate.push({
        user_id: userId, user_name: userName, event_type: 'simulation_completed', module: 'Simulator',
        points: p.simulation_completed.points, title: 'Executive Simulation Completed',
        description: s.scenario_title || s.title || 'Simulation',
        category: 'leadership', milestone: false, event_date: s.created_date,
        metadata_json: JSON.stringify({ source_id: s.id, icon: '🎯' }),
      });
    }
  });

  // Academy events
  completedLessons.forEach((l) => {
    const key = `academy_module:${l.id}`;
    if (!existingKeys.has(key)) {
      eventsToCreate.push({
        user_id: userId, user_name: userName, event_type: 'academy_module', module: 'Academy',
        points: p.academy_module.points, title: 'Academy Module Completed',
        description: l.lesson_title || l.course_title || 'Lesson',
        category: 'learning', milestone: false, event_date: l.updated_date || l.created_date,
        metadata_json: JSON.stringify({ source_id: l.id, icon: '📚' }),
      });
    }
  });

  // Challenge events
  challenges.forEach((c) => {
    const key = `challenge_completed:${c.id}`;
    if (!existingKeys.has(key)) {
      eventsToCreate.push({
        user_id: userId, user_name: userName, event_type: 'challenge_completed', module: 'Challenge',
        points: p.challenge_completed.points, title: 'Executive Challenge Completed',
        description: c.question || c.category || 'Challenge',
        category: 'leadership', milestone: false, event_date: c.created_date,
        metadata_json: JSON.stringify({ source_id: c.id, icon: '⚔️' }),
      });
    }
  });

  // Phase 16: exactly ONE immutable assessment_completed event per assessment —
  // idempotent via the existing source_id key (assessment_completed:<assessment_id>).
  assessments.forEach((a) => {
    const key = `assessment_completed:${a.assessment_id}`;
    if (!existingKeys.has(key)) {
      eventsToCreate.push({
        user_id: userId, user_name: userName, event_type: 'assessment_completed', module: 'Executive Readiness',
        points: clampAssessmentXp(a.xp_awarded), title: 'Executive Readiness Assessment™ Completed',
        description: a.classification_label || 'Completed the Executive Readiness Assessment™',
        category: 'learning', milestone: true, event_date: a.completed_at || a.created_date,
        metadata_json: JSON.stringify({ source_id: a.assessment_id, icon: '📊' }),
      });
    }
  });

  // Identity verified event
  if (profile.identity_verified && !existingKeys.has('identity_verified:')) {
    eventsToCreate.push({
      user_id: userId, user_name: userName, event_type: 'identity_verified', module: 'Trust',
      points: p.identity_verified.points, title: 'Identity Verified', description: 'Executive identity verified',
      category: 'verification', milestone: true, event_date: profile.trust_updated_at || profile.created_date,
      metadata_json: JSON.stringify({ source_id: '', icon: '✅' }),
    });
  }

  // Professional verification event
  if (profile.verified_executive && !existingKeys.has('professional_verification:')) {
    eventsToCreate.push({
      user_id: userId, user_name: userName, event_type: 'professional_verification', module: 'Trust',
      points: p.professional_verification.points, title: 'Professional Verification', description: 'Professional status verified',
      category: 'verification', milestone: true, event_date: profile.created_date,
      metadata_json: JSON.stringify({ source_id: '', icon: '🏅' }),
    });
  }

  // Resume event
  if ((resumes.length > 0 || careerResumes.length > 0) && !existingKeys.has('resume_completed:')) {
    const r = resumes[0] || careerResumes[0];
    eventsToCreate.push({
      user_id: userId, user_name: userName, event_type: 'resume_completed', module: 'Resume',
      points: p.resume_completed.points, title: 'Resume Completed', description: 'Executive resume uploaded',
      category: 'career', milestone: false, event_date: r.created_date,
      metadata_json: JSON.stringify({ source_id: '', icon: '📄' }),
    });
  }

  // Reputation milestone event
  if (reputationScore >= 100 && !existingKeys.has('reputation_milestone:')) {
    eventsToCreate.push({
      user_id: userId, user_name: userName, event_type: 'reputation_milestone', module: 'Reputation',
      points: p.reputation_milestone.points, title: 'Executive Reputation Milestone',
      description: `${Math.floor(reputationScore / 100) * 100} reputation score`,
      category: 'reputation', milestone: true, event_date: reps[0]?.updated_date || reps[0]?.created_date || new Date().toISOString(),
      metadata_json: JSON.stringify({ source_id: '', icon: '⭐' }),
    });
  }

  // Mentorship event
  if (mentors.length > 0 && !existingKeys.has('mentorship:')) {
    eventsToCreate.push({
      user_id: userId, user_name: userName, event_type: 'mentorship', module: 'Network',
      points: p.mentorship.points, title: 'Mentorship', description: 'Became an executive mentor',
      category: 'mentorship', milestone: true, event_date: mentors[0].created_date,
      metadata_json: JSON.stringify({ source_id: '', icon: '🤝' }),
    });
  }

  // Level-up events
  config.levels.filter((l) => totalPoints >= l.points && l.id !== 'seed').forEach((l) => {
    const key = `level_up:${l.id}`;
    if (!existingKeys.has(key)) {
      eventsToCreate.push({
        user_id: userId, user_name: userName, event_type: 'level_up', module: 'Journey',
        points: 0, title: `Reached ${l.title}`, description: `Achieved ${l.title} level`,
        category: 'level', milestone: true, event_date: new Date().toISOString(),
        metadata_json: JSON.stringify({ source_id: l.id, icon: l.icon }),
      });
    }
  });

  // Bulk create new events
  if (eventsToCreate.length > 0) {
    try {
      await base44.asServiceRole.entities.JourneyEvent.bulkCreate(eventsToCreate);
    } catch (e) {
      console.error('[recomputeIntelligence] JourneyEvent bulkCreate failed:', e.message);
      warnings.push('journey_event_write');
    }
  }

  // ── Build canonical timeline from JourneyEvent (M1) ──
  let allEvents = existingEvents;
  if (eventsToCreate.length > 0) {
    // Refetch to include newly created events
    try {
      allEvents = await base44.asServiceRole.entities.JourneyEvent.filter({ user_id: userId }, '-event_date', 500);
    } catch (e) {
      // Fall back to existing + new
      allEvents = [...existingEvents, ...eventsToCreate];
    }
  }

  const timeline = allEvents.map((e) => {
    let icon = '⭐';
    if (e.metadata_json) {
      try { icon = JSON.parse(e.metadata_json).icon || icon; } catch {}
    }
    return {
      date: e.event_date || e.created_date,
      type: e.event_type,
      title: e.title,
      description: e.description || '',
      points: e.points || 0,
      category: e.category || 'contribution',
      icon,
      milestone: e.milestone || false,
    };
  }).sort((a, b) => new Date(b.date) - new Date(a.date));

  // ── Compute streaks, digest, estimated days ──
  const estimatedDays = estimateDays(timeline, level, recommendations);
  const streaks = {
    learning:   computeStreak(timeline, 'learning'),
    publishing: computeStreak(timeline, 'publishing'),
    leadership: computeStreak(timeline, 'leadership'),
    community:  computeStreak(timeline, 'community'),
    mentorship: computeStreak(timeline, 'mentorship'),
  };
  const digest = buildDigest(timeline, level);

  // ── Signals summary ──
  const signals = {
    journeyPoints: totalPoints,
    dnaCompleted,
    letterCount: letters.length,
    simCount: sims.length,
    lessonCount: completedLessons.length,
    challengeCount: challenges.length,
    mentorCount: mentors.length,
  };

  // ── Profile summary for response ──
  const profileSummary = profile ? {
    target_role: profile.target_role, target_company: profile.target_company,
    career_stage: profile.career_stage,
    interview_readiness: profile.interview_readiness || 0,
    leadership_maturity: profile.leadership_maturity || 0,
    commercial_maturity: profile.commercial_maturity || 0,
    executive_presence: profile.executive_presence || 0,
    promotion_readiness: profile.promotion_readiness || 0,
    communication_growth: profile.communication_growth || 0,
    confidence: profile.confidence || 0,
    weak_areas: profile.weak_areas || [],
    strong_areas: profile.strong_areas || [],
    identity_verified: profile.identity_verified,
    verified_executive: profile.verified_executive,
    founding_member: profile.founding_member,
  } : null;

  const fullResult = {
    totalPoints,
    breakdown,
    level,
    achievements,
    recommendations,
    estimatedDays,
    streaks,
    digest,
    timeline: timeline.slice(0, 200),
    readiness,
    trust,
    forecast,
    journey: { level, points: totalPoints, signals },
    reputation: { score: reputationScore, tier: reputationTier },
    profile: profileSummary,
    signals,
    configVersion: config.configVersion,
    warnings,
    cached: true,
    computedAt: new Date().toISOString(),
    computeDurationMs: Date.now() - startTime,
  };

  // ── H2: Persist to UserProfile cache ──
  try {
    await base44.asServiceRole.entities.UserProfile.update(profile.id, {
      xp_points: totalPoints,
      cached_journey_points: totalPoints,
      cached_journey_level_id: level.current.id,
      cached_readiness_score: readiness.overallScore,
      cached_trust_score: trust.totalScore,
      cached_trust_tier: trust.tier,
      cached_promotion_probability: forecast.probability,
      cached_promotion_timeline_low: forecast.timelineLow,
      cached_promotion_timeline_high: forecast.timelineHigh,
      cached_promotion_confidence: forecast.confidence,
      cached_intelligence_json: JSON.stringify(fullResult),
      intelligence_computed_at: new Date().toISOString(),
      intelligence_config_version: config.configVersion,
      intelligence_warnings_json: JSON.stringify(warnings),
      intelligence_recompute_count: (profile.intelligence_recompute_count || 0) + 1,
      intelligence_compute_duration_ms: Date.now() - startTime,
    });
  } catch (e) {
    console.error('[recomputeIntelligence] Cache persist failed:', e.message);
    warnings.push('cache_persist');
  }

  return fullResult;
}

// ── Main handler ──
// SECURITY BOUNDARY (High #1 remediation): fail closed. No entity read or write
// may execute until the request passes one of the two gates below. Both use the
// shared verified authentication mechanism ONLY (SDR-001: the removed
// base44-service-authorization tier is never consulted and never authorizes).

// Roles permitted cross-user targeting — the existing platform authorization
// model (entity RLS throughout the app) grants these roles platform-level
// cross-user access: DEFAULT_ADMIN_ROLES from shared/auth.ts plus founder_root_admin.
const CROSS_USER_ROLES = ['super_admin', 'platform_admin', 'admin', 'developer', 'founder_root_admin'];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const clientIp = getClientIp(req);

    // ── Gate A — batch refresh_stale: authenticated authorized admin OR the
    // verified DISPATCH_BATCH_TOKEN system secret ONLY. No legitimate production
    // caller exists today; ordinary users are never permitted on this branch.
    if (body.action === 'refresh_stale') {
      const auth = await authenticateRequest(req, base44, {
        body,
        requireAdmin: true,
        allowSystemSecret: true,
      });
      const authError = await enforceAuth(base44, auth, 'recompute_intelligence_refresh_stale', clientIp);
      if (authError) return authError;

      // Get config from manageConfig (H1: single source of truth) — AFTER the gate
      const configRes = await base44.functions.invoke('manageConfig', {});
      const config = configRes.data;
      if (!config || !config.configVersion) {
        return Response.json({ error: 'Failed to load platform config' }, { status: 500 });
      }

      const profiles = await base44.asServiceRole.entities.UserProfile.filter(
        { status: 'active' }, '-intelligence_computed_at', 50
      );
      const stale = profiles.filter((p) => {
        if (!p.intelligence_computed_at) return true;
        if (p.intelligence_config_version !== config.configVersion) return true;
        const age = Date.now() - new Date(p.intelligence_computed_at).getTime();
        return age > 24 * 60 * 60 * 1000;
      });

      let refreshed = 0;
      const errors = [];
      for (const p of stale.slice(0, 20)) {
        try {
          await computeForUser(base44, config, p.created_by_id, p.full_name || '');
          refreshed++;
        } catch (e) {
          errors.push({ profile: p.id, error: e.message });
        }
      }
      return Response.json({ refreshed, totalStale: stale.length, errors });
    }

    // ── Gate B — single-user recompute: authenticated user ONLY (any role,
    // self-owned). The system secret does not authorize this branch, and the
    // removed service-token tier is never consulted.
    const auth = await authenticateRequest(req, base44, {
      body,
      requireAdmin: false,
      allowSystemSecret: false,
    });
    if (!auth.authenticated) {
      const authError = await enforceAuth(base44, auth, 'recompute_intelligence', clientIp);
      return authError; // always a 401 rejection — computeForUser never runs
    }

    // ── Ownership enforcement — a client-supplied target id may resolve ONLY to
    // the authenticated caller's own user ID, unless the caller holds an
    // admin/founder role (existing platform authorization model). Syntactic
    // validity of the id is never sufficient.
    const requestedUserId = body.user_id
      || (body.data ? (body.data.user_id || body.data.created_by_id || body.data.author_user_id) : null)
      || null;

    if (requestedUserId && !CROSS_USER_ROLES.includes(auth.user.role) && String(requestedUserId) !== auth.user.id) {
      await logSecurityEvent(base44, {
        action: 'recompute_intelligence_cross_user_forbidden',
        authMethod: auth.authMethod,
        performedById: auth.user.id,
        performedByName: auth.user.full_name,
        severity: 'warning',
        requestId: auth.requestId,
        ipAddress: clientIp,
        description: 'Non-admin authenticated user attempted to recompute another user\'s intelligence',
      });
      return securityResponse(403);
    }

    const userId = requestedUserId || auth.user.id;

    // Get config from manageConfig (H1: single source of truth) — AFTER the gate
    const configRes = await base44.functions.invoke('manageConfig', {});
    const config = configRes.data;
    if (!config || !config.configVersion) {
      return Response.json({ error: 'Failed to load platform config' }, { status: 500 });
    }

    const result = await computeForUser(base44, config, userId, body.user_name || '');
    return Response.json(result);
  } catch (error) {
    console.error('[recomputeIntelligence] Unhandled error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
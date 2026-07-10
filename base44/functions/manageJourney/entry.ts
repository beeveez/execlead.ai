import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const POINTS = {
  leadership_dna: 500,
  letter_published: 250,
  simulation_completed: 300,
  academy_module: 150,
  challenge_completed: 50,
  identity_verified: 200,
  professional_verification: 200,
  reputation_milestone: 100,
  mentorship: 300,
  resume_completed: 100,
  weekly_streak: 25,
  community_recognition: 50,
};

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

function getLevel(points) {
  let current = LEVELS[0];
  let next = null;
  for (let i = 0; i < LEVELS.length; i++) {
    if (points >= LEVELS[i].points) {
      current = LEVELS[i];
      next = LEVELS[i + 1] || null;
    }
  }
  const progress = next ? Math.round(((points - current.points) / (next.points - current.points)) * 100) : 100;
  const journeyPercent = Math.round((LEVELS.indexOf(current) / (LEVELS.length - 1)) * 100);
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
      if (weeks[i - 1] - weeks[i] === 1) current++;
      else break;
    }
  }
  let best = 1;
  let run = 1;
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

function computeAchievements(breakdown, totalPoints, profile) {
  return [
    { id: 'first_leadership_dna', unlocked: (breakdown.leadership_dna?.count || 0) > 0 },
    { id: 'first_letter', unlocked: (breakdown.letters?.count || 0) > 0 },
    { id: 'first_mentorship', unlocked: (breakdown.mentorship?.count || 0) > 0 },
    { id: 'reputation_100', unlocked: (breakdown.reputation?.score || 0) >= 100 },
    { id: 'identity_verified', unlocked: !!profile?.identity_verified },
    { id: 'executive_contributor', unlocked: totalPoints >= 10000 },
    { id: 'leadership_fellow', unlocked: totalPoints >= 20000 },
    { id: 'legacy_builder', unlocked: totalPoints >= 50000 },
    { id: 'scholar', unlocked: (breakdown.academy?.count || 0) >= 5 },
    { id: 'simulation_master', unlocked: (breakdown.simulations?.count || 0) >= 3 },
    { id: 'challenger', unlocked: (breakdown.challenges?.count || 0) >= 10 },
    { id: 'streak_warrior', unlocked: (breakdown.weekly_streak?.count || 0) >= 4 },
  ];
}

function getRecommendations(breakdown, level) {
  if (!level.next) return [];
  const recs = [];
  if ((breakdown.leadership_dna?.count || 0) === 0) recs.push({ activity: 'leadership_dna', label: 'Complete Leadership DNA™', path: '/leadership-dna', points: POINTS.leadership_dna, icon: '🧬' });
  if ((breakdown.letters?.count || 0) === 0) recs.push({ activity: 'letter_published', label: 'Publish a Leadership Letter', path: '/legacy-library/new', points: POINTS.letter_published, icon: '✍️' });
  else if ((breakdown.letters?.count || 0) < 3) recs.push({ activity: 'letter_published', label: 'Publish another Leadership Letter', path: '/legacy-library/new', points: POINTS.letter_published, icon: '✍️' });
  if ((breakdown.simulations?.count || 0) === 0) recs.push({ activity: 'simulation_completed', label: 'Complete an Executive Simulation', path: '/simulator', points: POINTS.simulation_completed, icon: '🎯' });
  if ((breakdown.academy?.count || 0) < 5) recs.push({ activity: 'academy_module', label: 'Complete an Academy Module', path: '/academy', points: POINTS.academy_module, icon: '📚' });
  if ((breakdown.challenges?.count || 0) < 10) recs.push({ activity: 'challenge_completed', label: 'Take an Executive Challenge', path: '/challenge', points: POINTS.challenge_completed, icon: '⚔️' });
  if ((breakdown.resume?.count || 0) === 0) recs.push({ activity: 'resume_completed', label: 'Upload your Resume', path: '/resume', points: POINTS.resume_completed, icon: '📄' });
  if ((breakdown.mentorship?.count || 0) === 0) recs.push({ activity: 'mentorship', label: 'Become a Mentor', path: '/network/mentorship', points: POINTS.mentorship, icon: '🤝' });
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

async function getProfile(base44, userId) {
  try {
    const profiles = await base44.asServiceRole.entities.UserProfile.filter({ created_by_id: userId }, '-created_date', 5);
    return profiles[0] || null;
  } catch (e) {
    console.error('[manageJourney] getProfile failed:', e.message);
    return null;
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const action = body.action || 'compute';

    // Record a new journey event
    if (action === 'record') {
      const { event_type, module, points, title, description, category, milestone } = body;
      if (!event_type || !title) return Response.json({ error: 'event_type and title required' }, { status: 400 });
      const event = await base44.asServiceRole.entities.JourneyEvent.create({
        user_id: user.id,
        user_name: user.full_name || '',
        event_type,
        module: module || '',
        points: points || 0,
        title,
        description: description || '',
        category: category || 'contribution',
        milestone: milestone || false,
        event_date: new Date().toISOString(),
      });
      return Response.json({ event });
    }

    // Enterprise aggregate view
    if (action === 'enterprise') {
      const profile = await getProfile(base44, user.id);
      const orgId = body.organization_id || profile?.organization_id;
      if (!orgId) return Response.json({ error: 'No organization found' }, { status: 400 });
      const orgProfiles = await base44.asServiceRole.entities.UserProfile.filter({ organization_id: orgId }, '-xp_points', 500);
      const distribution = {};
      let totalXp = 0;
      orgProfiles.forEach((p) => {
        const lvl = getLevel(p.xp_points || 0);
        distribution[lvl.current.id] = (distribution[lvl.current.id] || 0) + 1;
        totalXp += p.xp_points || 0;
      });
      const avgPoints = orgProfiles.length > 0 ? Math.round(totalXp / orgProfiles.length) : 0;
      const topContributors = orgProfiles.slice(0, 5).map((p) => ({
        name: p.full_name || 'Unknown',
        points: p.xp_points || 0,
        level: getLevel(p.xp_points || 0).current,
        promotion_readiness: p.promotion_readiness || 0,
      }));
      const emergingLeaders = orgProfiles.filter((p) => {
        const lvl = getLevel(p.xp_points || 0);
        return ['seed', 'emerging', 'manager'].includes(lvl.current.id);
      }).length;
      const avgPromotion = orgProfiles.length > 0 ? Math.round(orgProfiles.reduce((s, p) => s + (p.promotion_readiness || 0), 0) / orgProfiles.length) : 0;
      return Response.json({
        totalMembers: orgProfiles.length,
        averagePoints: avgPoints,
        averageLevel: getLevel(avgPoints).current,
        distribution,
        topContributors,
        emergingLeaders,
        averagePromotionReadiness: avgPromotion,
      });
    }

    // === Full compute: gather all data in parallel (H3) ===
    const warnings = [];
    const profile = await getProfile(base44, user.id);

    // Run all independent entity queries in parallel — latency = max(query) instead of sum(queries)
    const [dnaRes, lettersRes, simsRes, lessonsRes, challengesRes, resumeRes, careerResumeRes, repsRes, mentorsRes, storedRes] = await Promise.allSettled([
      base44.asServiceRole.entities.LeadershipDNA.filter({ created_by_id: user.id }, '-created_date', 10),
      base44.asServiceRole.entities.LeadershipLetter.filter({ author_user_id: user.id, status: 'published' }, '-published_at', 200),
      base44.asServiceRole.entities.SimulationSession.filter({ created_by_id: user.id }, '-created_date', 200),
      base44.asServiceRole.entities.LessonProgress.filter({ created_by_id: user.id }, '-updated_date', 500),
      base44.asServiceRole.entities.ChallengeResult.filter({ created_by_id: user.id }, '-created_date', 500),
      base44.asServiceRole.entities.ResumeVersion.filter({ created_by_id: user.id }, '-created_date', 5),
      base44.asServiceRole.entities.CareerResume.filter({ created_by_id: user.id }, '-created_date', 5),
      base44.asServiceRole.entities.ExecutiveReputation.filter({ user_id: user.id }, '-updated_date', 5),
      base44.asServiceRole.entities.MentorProfile.filter({ created_by_id: user.id }, '-created_date', 10),
      base44.asServiceRole.entities.JourneyEvent.filter({ user_id: user.id }, '-event_date', 200),
    ]);

    // Unwrap results — log failures and collect warnings instead of silent swallow (M3)
    const unwrap = (res, label) => {
      if (res.status === 'fulfilled') return res.value;
      console.error(`[manageJourney] ${label} query failed:`, res.reason?.message || res.reason);
      warnings.push(label);
      return [];
    };

    const dna = unwrap(dnaRes, 'leadership_dna');
    const letters = unwrap(lettersRes, 'letters');
    const sims = unwrap(simsRes, 'simulations');
    const lessons = unwrap(lessonsRes, 'lessons');
    const challenges = unwrap(challengesRes, 'challenges');
    const resumes = unwrap(resumeRes, 'resumes');
    const careerResumes = unwrap(careerResumeRes, 'career_resumes');
    const reps = unwrap(repsRes, 'reputation');
    const mentors = unwrap(mentorsRes, 'mentorship');
    const stored = unwrap(storedRes, 'journey_events');

    // Process results — same computation logic, now from parallel-fetched data
    const breakdown = {};
    let totalPoints = 0;
    const timeline = [];

    // Leadership DNA
    {
      const pts = dna.length > 0 ? POINTS.leadership_dna : 0;
      breakdown.leadership_dna = { count: dna.length, points: pts };
      totalPoints += pts;
      if (dna.length > 0) timeline.push({ date: dna[0].created_date, type: 'leadership_dna', title: 'Leadership DNA™ Completed', description: 'Completed leadership assessment', points: pts, category: 'learning', icon: '🧬', milestone: true });
    }

    // Published Letters
    {
      const pts = letters.length * POINTS.letter_published;
      breakdown.letters = { count: letters.length, points: pts };
      totalPoints += pts;
      letters.forEach((l) => timeline.push({ date: l.published_at || l.created_date, type: 'letter_published', title: 'Published Leadership Letter', description: l.title, points: POINTS.letter_published, category: 'publishing', icon: '✍️' }));
    }

    // Simulations
    {
      const pts = sims.length * POINTS.simulation_completed;
      breakdown.simulations = { count: sims.length, points: pts };
      totalPoints += pts;
      sims.forEach((s) => timeline.push({ date: s.created_date, type: 'simulation', title: 'Executive Simulation Completed', description: s.scenario_title || s.title || 'Simulation', points: POINTS.simulation_completed, category: 'leadership', icon: '🎯' }));
    }

    // Academy (completed lessons)
    {
      const completed = lessons.filter((l) => l.completed);
      const pts = completed.length * POINTS.academy_module;
      breakdown.academy = { count: completed.length, points: pts };
      totalPoints += pts;
      completed.forEach((l) => timeline.push({ date: l.updated_date || l.created_date, type: 'academy', title: 'Academy Module Completed', description: l.lesson_title || l.course_title || 'Lesson', points: POINTS.academy_module, category: 'learning', icon: '📚' }));
    }

    // Challenges
    {
      const pts = challenges.length * POINTS.challenge_completed;
      breakdown.challenges = { count: challenges.length, points: pts };
      totalPoints += pts;
      challenges.forEach((c) => timeline.push({ date: c.created_date, type: 'challenge', title: 'Executive Challenge Completed', description: c.question || c.category || 'Challenge', points: POINTS.challenge_completed, category: 'leadership', icon: '⚔️' }));
    }

    // Identity & Verification + Streaks (from profile, no query needed)
    if (profile) {
      if (profile.identity_verified) {
        totalPoints += POINTS.identity_verified;
        breakdown.identity_verified = { count: 1, points: POINTS.identity_verified };
        timeline.push({ date: profile.trust_updated_at || profile.created_date, type: 'identity_verified', title: 'Identity Verified', description: 'Executive identity verified', points: POINTS.identity_verified, category: 'verification', icon: '✅', milestone: true });
      }
      if (profile.verified_executive) {
        totalPoints += POINTS.professional_verification;
        breakdown.professional_verification = { count: 1, points: POINTS.professional_verification };
        timeline.push({ date: profile.created_date, type: 'professional_verification', title: 'Professional Verification', description: 'Professional status verified', points: POINTS.professional_verification, category: 'verification', icon: '🏅', milestone: true });
      }
      if (profile.streak_days) {
        const weeks = Math.floor(profile.streak_days / 7);
        const pts = weeks * POINTS.weekly_streak;
        breakdown.weekly_streak = { count: weeks, points: pts };
        totalPoints += pts;
      }
    }

    // Resume
    {
      if (resumes.length > 0 || careerResumes.length > 0) {
        totalPoints += POINTS.resume_completed;
        breakdown.resume = { count: 1, points: POINTS.resume_completed };
        const r = resumes[0] || careerResumes[0];
        timeline.push({ date: r.created_date, type: 'resume', title: 'Resume Completed', description: 'Executive resume uploaded', points: POINTS.resume_completed, category: 'career', icon: '📄' });
      }
    }

    // Reputation
    {
      if (reps.length > 0) {
        const rep = reps[0];
        const milestones = Math.floor((rep.reputation_score || 0) / 100);
        const pts = milestones * POINTS.reputation_milestone;
        breakdown.reputation = { count: milestones, points: pts, score: rep.reputation_score || 0 };
        totalPoints += pts;
        if (rep.reputation_score >= 100) {
          timeline.push({ date: rep.updated_date || rep.created_date, type: 'reputation_milestone', title: 'Executive Reputation Milestone', description: `${milestones * 100} reputation score`, points: pts, category: 'reputation', icon: '⭐', milestone: true });
        }
        const awards = rep.community_awards || 0;
        if (awards > 0) {
          const apts = awards * POINTS.community_recognition;
          breakdown.community_recognition = { count: awards, points: apts };
          totalPoints += apts;
        }
      }
    }

    // Mentorship
    {
      if (mentors.length > 0) {
        const pts = mentors.length * POINTS.mentorship;
        breakdown.mentorship = { count: mentors.length, points: pts };
        totalPoints += pts;
        timeline.push({ date: mentors[0].created_date, type: 'mentorship', title: 'Mentorship', description: 'Became an executive mentor', points: POINTS.mentorship, category: 'mentorship', icon: '🤝', milestone: true });
      }
    }

    // Joined event
    if (profile) {
      timeline.push({ date: profile.created_date, type: 'joined', title: 'Joined EXECLEAD.AI', description: 'Began the executive leadership journey', points: 0, category: 'level', icon: '🚀', milestone: true });
    }

    // Level-up events
    const level = getLevel(totalPoints);
    LEVELS.filter((l) => totalPoints >= l.points && l.id !== 'seed').forEach((l) => {
      timeline.push({ date: profile?.created_date || new Date().toISOString(), type: 'level_up', title: `Reached ${l.title}`, description: `Achieved ${l.title} level`, points: 0, category: 'level', icon: l.icon, milestone: true });
    });

    // Stored JourneyEvents
    stored.forEach((e) => timeline.push({
      date: e.event_date || e.created_date,
      type: e.event_type,
      title: e.title,
      description: e.description || '',
      points: e.points || 0,
      category: e.category || 'contribution',
      icon: '⭐',
      milestone: e.milestone || false,
    }));

    // Sort timeline
    timeline.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Timeline-only action (filtered)
    if (action === 'timeline') {
      const range = body.range || 'lifetime';
      return Response.json({ events: filterByRange(timeline, range), warnings });
    }

    // Compute everything
    const achievements = computeAchievements(breakdown, totalPoints, profile);
    const recommendations = getRecommendations(breakdown, level);
    const estimatedDays = estimateDays(timeline, level, recommendations);
    const streaks = {
      learning: computeStreak(timeline, 'learning'),
      publishing: computeStreak(timeline, 'publishing'),
      leadership: computeStreak(timeline, 'leadership'),
      community: computeStreak(timeline, 'community'),
      mentorship: computeStreak(timeline, 'mentorship'),
    };
    const digest = buildDigest(timeline, level);

    return Response.json({
      totalPoints,
      breakdown,
      level,
      achievements,
      recommendations,
      estimatedDays,
      streaks,
      digest,
      timeline: timeline.slice(0, 200),
      warnings,
      profile: profile ? {
        target_role: profile.target_role,
        target_company: profile.target_company,
        career_stage: profile.career_stage,
        interview_readiness: profile.interview_readiness || 0,
        leadership_maturity: profile.leadership_maturity || 0,
        commercial_maturity: profile.commercial_maturity || 0,
        executive_presence: profile.executive_presence || 0,
        promotion_readiness: profile.promotion_readiness || 0,
        weak_areas: profile.weak_areas || [],
      } : null,
    });
  } catch (error) {
    console.error('[manageJourney] Unhandled error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
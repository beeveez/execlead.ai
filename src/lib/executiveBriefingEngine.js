/**
 * EXECLEAD.AI — Executive Briefing Engine™
 * ============================================================
 * Generates the weekly AI-powered leadership intelligence report.
 *
 * Pipeline:
 *   Fetch 13 data sources → Compute metrics → LLM narrative generation →
 *   Assemble structured briefing → Persist to ExecutiveBriefing entity
 */
import { base44 } from "@/api/base44Client";

// ============================================================
// UTILITIES
// ============================================================

export function safeParse(jsonStr, fallback) {
  if (!jsonStr) return fallback;
  if (typeof jsonStr !== "string") return jsonStr;
  try { const v = JSON.parse(jsonStr); return v ?? fallback; }
  catch { return fallback; }
}

export function getWeeklyPeriod(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() - dayNum + 4);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

function getWeekStart(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

const WEEK_START = getWeekStart();

function isThisWeek(createdDate) {
  if (!createdDate) return false;
  return new Date(createdDate) >= WEEK_START;
}

function getLeadershipStage(readiness) {
  if (readiness >= 85) return "Executive Ready";
  if (readiness >= 70) return "Senior Leader";
  if (readiness >= 55) return "Emerging Leader";
  if (readiness >= 35) return "Developing Leader";
  return "Early Career";
}

// ============================================================
// DATA SOURCE FETCHING
// ============================================================

async function fetchDataSources(userId) {
  const sources = [
    { key: "forecast",     fetch: () => base44.entities.PromotionForecast.filter({ user_id: userId }, "-created_date", 2) },
    { key: "dna",          fetch: () => base44.entities.LeadershipDNA.filter({ user_id: userId }, "-created_date", 2) },
    { key: "journey",      fetch: () => base44.entities.JourneyEvent.filter({ user_id: userId }, "-created_date", 30) },
    { key: "actions",      fetch: () => base44.entities.ExecutiveAction.filter({ user_id: userId }, "-created_date", 50) },
    { key: "simulations",  fetch: () => base44.entities.SimulationSession.filter({ user_id: userId }, "-created_date", 20) },
    { key: "lessons",      fetch: () => base44.entities.LessonProgress.filter({ user_id: userId }, "-created_date", 50) },
    { key: "resume",       fetch: () => base44.entities.ResumeImport.filter({}, "-created_date", 2) },
    { key: "decisions",    fetch: () => base44.entities.ExecutiveDecision.filter({}, "-created_date", 20) },
    { key: "identity",     fetch: () => base44.entities.IdentityVerification.filter({ user_id: userId }, "-created_date", 1) },
    { key: "evidence",     fetch: () => base44.entities.EvidenceItem.filter({}, "-created_date", 30) },
    { key: "achievements", fetch: () => base44.entities.Achievement.filter({ user_id: userId }, "-created_date", 30) },
    { key: "journals",     fetch: () => base44.entities.JournalEntry.filter({ user_id: userId }, "-created_date", 10) },
    { key: "challenges",   fetch: () => base44.entities.ChallengeResult.filter({ user_id: userId }, "-created_date", 20) },
  ];

  const results = await Promise.allSettled(sources.map((s) => s.fetch()));
  const data = {};
  sources.forEach((s, i) => {
    data[s.key] = results[i].status === "fulfilled" ? (results[i].value || []) : [];
  });
  return data;
}

// ============================================================
// METRICS COMPUTATION
// ============================================================

function computeMetrics(data, previous) {
  const forecast = data.forecast?.[0] || {};
  const prevForecast = data.forecast?.[1] || {};
  const dna = data.dna?.[0] || {};
  const prevDna = data.dna?.[1] || {};
  const identity = data.identity?.[0] || {};

  const readiness = forecast.readiness_score || 0;
  const probability = forecast.probability_score || 0;
  const momentum = forecast.momentum || "stable";
  const confidence = forecast.confidence_score || 0;
  const prevReadiness = previous?.executive_readiness || prevForecast.readiness_score || 0;
  const readinessChange = readiness - prevReadiness;

  // This week's activity counts
  const weekActions = data.actions?.filter((a) => isThisWeek(a.created_date)) || [];
  const weekLessons = data.lessons?.filter((l) => isThisWeek(l.created_date)) || [];
  const weekSimulations = data.simulations?.filter((s) => isThisWeek(s.created_date)) || [];
  const weekChallenges = data.challenges?.filter((c) => isThisWeek(c.created_date)) || [];
  const weekDecisions = data.decisions?.filter((d) => isThisWeek(d.created_date)) || [];
  const weekEvidence = data.evidence?.filter((e) => isThisWeek(e.created_date)) || [];
  const weekAchievements = data.achievements?.filter((a) => isThisWeek(a.created_date)) || [];
  const weekJournals = data.journals?.filter((j) => isThisWeek(j.created_date)) || [];
  const weekJourney = data.journey?.filter((j) => isThisWeek(j.created_date)) || [];

  const actionsCompleted = weekActions.filter((a) => a.status === "completed").length;
  const lessonsCompleted = weekLessons.filter((l) => l.status === "completed" || l.completed).length;
  const learningHours = weekLessons.reduce((s, l) => s + (l.time_spent_minutes || l.duration_minutes || 0), 0) / 60;
  const simulationsCompleted = weekSimulations.length;
  const challengesCompleted = weekChallenges.length;
  const decisionsCompleted = weekDecisions.length;
  const evidenceCount = weekEvidence.length;
  const achievementsCount = weekAchievements.length;
  const journalCount = weekJournals.length;

  // Interview readiness from latest simulation
  const latestSim = data.simulations?.[0] || {};
  const interviewScore = latestSim.score || latestSim.overall_score || 0;

  // Trust score
  const trustScore = identity.trust_score || 0;

  // Leadership DNA changes
  const dnaChanges = [];
  if (dna.competencies_json) {
    const currentComps = safeParse(dna.competencies_json, []);
    const prevComps = safeParse(prevDna.competencies_json, []);
    currentComps.forEach((c) => {
      const prev = prevComps.find((p) => p.name === c.name || p.competency === c.name);
      const prevScore = prev?.score || prev?.value || 0;
      const currScore = c.score || c.value || 0;
      const change = currScore - prevScore;
      if (change !== 0) dnaChanges.push({ competency: c.name || c.competency, change });
    });
  }
  const dnaMaturity = dna.leadership_maturity || dna.overall_maturity || "Developing";

  // Briefing Score™ (weighted composite)
  const momentumScore = momentum === "increasing" ? 80 : momentum === "stable" ? 50 : 20;
  const learningScore = Math.min(100, (lessonsCompleted * 10) + (learningHours * 5));
  const missionScore = Math.min(100, (challengesCompleted * 15) + (actionsCompleted * 10));
  const leadershipScore = Math.min(100, 50 + dnaChanges.reduce((s, c) => s + Math.max(0, c.change), 0));
  const promotionScore = readiness;
  const overallScore = Math.round(
    leadershipScore * 0.15 + promotionScore * 0.25 + learningScore * 0.2 +
    momentumScore * 0.2 + missionScore * 0.2
  );

  const growthTrend = readinessChange > 0 ? "improving" : readinessChange < 0 ? "declining" : "stable";

  return {
    readiness, probability, momentum, confidence, readinessChange, growthTrend,
    prevReadiness, dnaMaturity, trustScore, interviewScore, dnaChanges,
    lessonsCompleted, learningHours: Math.round(learningHours * 10) / 10,
    simulationsCompleted, challengesCompleted, actionsCompleted,
    decisionsCompleted, evidenceCount, achievementsCount, journalCount,
    weekJourney, totalActivity: actionsCompleted + lessonsCompleted + simulationsCompleted + challengesCompleted + decisionsCompleted,
    briefingScore: {
      leadership: leadershipScore, promotion: promotionScore, learning: learningScore,
      momentum: momentumScore, missions: missionScore, overall: overallScore,
    },
    leadershipStage: getLeadershipStage(readiness),
    timelineLabel: forecast.timeline_label || forecast.timeline_estimate || "Assessment in progress",
  };
}

// ============================================================
// AI CONTENT GENERATION (LLM)
// ============================================================

async function generateAIContent(user, metrics, previous) {
  const prompt = `You are the Executive Briefing Engine™ for EXECLEAD.AI, the world's premier executive leadership development platform.

Generate a weekly Executive Briefing™ for ${user.full_name || "the executive"}.

EXECUTIVE SNAPSHOT:
- Executive Readiness™: ${metrics.readiness}/100 (previous: ${metrics.prevReadiness})
- Promotion Probability™: ${metrics.probability}/100
- Career Momentum™: ${metrics.momentum}
- Leadership DNA Maturity: ${metrics.dnaMaturity}
- Forecast Confidence™: ${metrics.confidence}/100
- Trust Score: ${metrics.trustScore}/100
- Interview Score: ${metrics.interviewScore}/100

THIS WEEK'S ACTIVITY:
- Learning: ${metrics.lessonsCompleted} lessons, ${metrics.learningHours} hours
- Simulations: ${metrics.simulationsCompleted} sessions
- Challenges: ${metrics.challengesCompleted} completed
- Executive Actions: ${metrics.actionsCompleted} completed
- Decisions: ${metrics.decisionsCompleted} made
- New Evidence: ${metrics.evidenceCount} items
- New Achievements: ${metrics.achievementsCount}
- Journal Entries: ${metrics.journalCount}

LEADERSHIP DNA CHANGES:
${metrics.dnaChanges.length > 0
  ? metrics.dnaChanges.map((c) => `- ${c.competency}: ${c.change > 0 ? "+" : ""}${c.change}%`).join("\n")
  : "No competency changes this week."}

PREVIOUS WEEK:
- Executive Readiness: ${previous?.executive_readiness || 0}/100
- Briefing Score: ${previous?.briefing_score || 0}/100

Generate a comprehensive Executive Briefing™. Return JSON with:
1. executive_summary: 2-3 sentence executive overview of what happened this week and the growth trend.
2. leadership_wins: Top 3-5 achievements this week [{title, description, impact}].
3. areas_for_improvement: Top 3 [{area, why_it_matters, potential_readiness_increase}].
4. executive_insights: 3-4 insight strings about patterns, strengths, and opportunities.
5. ai_narrative: 3-4 sentence Executive Growth Narrative™ — professional, encouraging, evidence-based.
6. executive_actions: Top 5 recommended actions [{title, priority, estimated_minutes, expected_readiness_increase, career_impact}].
7. looking_ahead: {next_week_focus, upcoming_milestones[], recommended_goals[], estimated_career_progress}.
8. company_intelligence: 2-3 items [{company, trend, recommendation}] about companies relevant to the executive's target role.

Tone: Professional, executive, encouraging, evidence-based. Speak directly to the executive.`;

  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          executive_summary: { type: "string" },
          leadership_wins: { type: "array", items: { type: "object", properties: { title: { type: "string" }, description: { type: "string" }, impact: { type: "string" } } } },
          areas_for_improvement: { type: "array", items: { type: "object", properties: { area: { type: "string" }, why_it_matters: { type: "string" }, potential_readiness_increase: { type: "string" } } } },
          executive_insights: { type: "array", items: { type: "string" } },
          ai_narrative: { type: "string" },
          executive_actions: { type: "array", items: { type: "object", properties: { title: { type: "string" }, priority: { type: "string" }, estimated_minutes: { type: "number" }, expected_readiness_increase: { type: "string" }, career_impact: { type: "string" } } } },
          looking_ahead: { type: "object", properties: { next_week_focus: { type: "string" }, upcoming_milestones: { type: "array", items: { type: "string" } }, recommended_goals: { type: "array", items: { type: "string" } }, estimated_career_progress: { type: "string" } } },
          company_intelligence: { type: "array", items: { type: "object", properties: { company: { type: "string" }, trend: { type: "string" }, recommendation: { type: "string" } } } }
        }
      }
    });
    return typeof response === "string" ? JSON.parse(response) : response;
  } catch {
    return {
      executive_summary: `This week your executive readiness ${metrics.readinessChange > 0 ? "increased" : "remained stable"} at ${metrics.readiness}%. ${metrics.momentum === "increasing" ? "Career momentum is strong." : "Continue building momentum through consistent learning activity."}`,
      leadership_wins: [],
      areas_for_improvement: [],
      executive_insights: [],
      ai_narrative: `You continue to develop your executive capabilities. Your current readiness score of ${metrics.readiness}% reflects ${metrics.momentum} momentum. Focus on consistent leadership development to accelerate your promotion trajectory.`,
      executive_actions: [],
      looking_ahead: { next_week_focus: "Continue your leadership development journey.", upcoming_milestones: [], recommended_goals: [], estimated_career_progress: "Steady progress expected." },
      company_intelligence: [],
    };
  }
}

// ============================================================
// BRIEFING ASSEMBLY
// ============================================================

function assembleBriefing(user, period, metrics, ai, previous) {
  const scoreChange = metrics.briefingScore.overall - (previous?.briefing_score || 0);

  return {
    user_id: user.id,
    user_name: user.full_name || "Executive",
    period,
    briefing_date: new Date().toISOString().slice(0, 10),
    status: "ready",
    briefing_score: metrics.briefingScore.overall,
    previous_score: previous?.briefing_score || 0,
    score_change: scoreChange,
    executive_readiness: metrics.readiness,
    promotion_probability: metrics.probability,
    momentum: metrics.momentum,
    growth_trend: metrics.growthTrend,
    executive_summary_json: JSON.stringify({
      summary: ai.executive_summary || "",
      readiness: metrics.readiness,
      probability: metrics.probability,
      momentum: metrics.momentum,
      stage: metrics.leadershipStage,
      confidence: metrics.confidence,
      trend: metrics.growthTrend,
      readiness_change: metrics.readinessChange,
    }),
    leadership_wins_json: JSON.stringify(ai.leadership_wins || []),
    improvement_areas_json: JSON.stringify(ai.areas_for_improvement || []),
    promotion_forecast_json: JSON.stringify({
      readiness: metrics.readiness,
      change: metrics.readinessChange,
      probability: metrics.probability,
      timeline: metrics.timelineLabel,
      confidence: metrics.confidence,
      trend: metrics.momentum,
      reason: ai.executive_summary || "",
    }),
    career_momentum_json: JSON.stringify({
      current: metrics.momentum,
      drivers: [
        { label: "Learning", value: metrics.lessonsCompleted > 0 ? "Active" : "Inactive" },
        { label: "Leadership", value: metrics.dnaMaturity },
        { label: "Coaching", value: metrics.journalCount > 0 ? "Engaged" : "Pending" },
        { label: "Interview Practice", value: metrics.simulationsCompleted > 0 ? "Active" : "Inactive" },
        { label: "Decision Intelligence", value: metrics.decisionsCompleted > 0 ? "Active" : "Inactive" },
        { label: "Mission Completion", value: `${metrics.challengesCompleted + metrics.actionsCompleted} this week` },
      ],
    }),
    leadership_dna_json: JSON.stringify(metrics.dnaChanges),
    executive_insights_json: JSON.stringify(ai.executive_insights || []),
    learning_summary_json: JSON.stringify({
      courses: metrics.lessonsCompleted,
      hours: metrics.learningHours,
      mission_progress: metrics.challengesCompleted,
      academy_progress: Math.min(100, metrics.lessonsCompleted * 5),
      next_course: "Executive Leadership Communication",
      readiness_gain: `+${Math.min(5, metrics.lessonsCompleted)}%`,
    }),
    interview_readiness_json: JSON.stringify({
      score: metrics.interviewScore,
      behavioral: Math.max(0, metrics.interviewScore - 10),
      executive: metrics.interviewScore,
      negotiation: Math.max(0, metrics.interviewScore - 15),
      recommended_practice: "Behavioral leadership scenarios and executive presence exercises.",
    }),
    company_intelligence_json: JSON.stringify(ai.company_intelligence || []),
    decision_lab_json: JSON.stringify({
      decisions: metrics.decisionsCompleted,
      quality: metrics.decisionsCompleted > 0 ? "Strong" : "No data",
      risk: "Balanced",
      reasoning: "Continue practicing strategic decision-making through Decision Lab exercises.",
    }),
    executive_actions_json: JSON.stringify(ai.executive_actions || []),
    looking_ahead_json: JSON.stringify(ai.looking_ahead || {}),
    briefing_score_json: JSON.stringify(metrics.briefingScore),
    timeline_json: JSON.stringify([
      { label: "Previous Week", value: `${previous?.executive_readiness || metrics.prevReadiness}%`, status: "past" },
      { label: "Current Week", value: `${metrics.readiness}%`, status: "current" },
      { label: "Projected Next Week", value: `${Math.min(100, metrics.readiness + Math.max(0, metrics.readinessChange))}%`, status: "projected" },
      { label: "Quarter Goal", value: `${Math.min(100, metrics.readiness + 10)}%`, status: "goal" },
      { label: "Promotion Milestone", value: metrics.timelineLabel, status: "milestone" },
    ]),
    ai_narrative: ai.ai_narrative || "",
  };
}

// ============================================================
// PUBLIC API
// ============================================================

export async function generateBriefing(user) {
  if (!user?.id) throw new Error("User required");
  const period = getWeeklyPeriod();

  // Check if briefing already exists for this week
  const existing = await getBriefingForPeriod(user.id, period);
  if (existing) return existing;

  const data = await fetchDataSources(user.id);
  const previous = await getPreviousBriefing(user.id);
  const metrics = computeMetrics(data, previous);
  const ai = await generateAIContent(user, metrics, previous);
  const briefingData = assembleBriefing(user, period, metrics, ai, previous);

  const saved = await base44.entities.ExecutiveBriefing.create(briefingData);
  return saved;
}

export async function getBriefingForPeriod(userId, period) {
  try {
    const results = await base44.entities.ExecutiveBriefing.filter({ user_id: userId, period }, "-created_date", 1);
    return results?.[0] || null;
  } catch { return null; }
}

export async function getPreviousBriefing(userId) {
  try {
    const currentPeriod = getWeeklyPeriod();
    const results = await base44.entities.ExecutiveBriefing.filter({ user_id: userId }, "-created_date", 5);
    return results?.find((b) => b.period !== currentPeriod) || null;
  } catch { return null; }
}

export async function getBriefingHistory(userId, limit = 20) {
  try {
    return await base44.entities.ExecutiveBriefing.filter({ user_id: userId }, "-created_date", limit);
  } catch { return []; }
}

export async function markBriefingRead(briefingId) {
  try {
    await base44.entities.ExecutiveBriefing.update(briefingId, {
      status: "read",
      read_date: new Date().toISOString(),
    });
  } catch {}
}

export function parseBriefing(briefing) {
  if (!briefing) return null;
  return {
    ...briefing,
    executiveSummary: safeParse(briefing.executive_summary_json, {}),
    leadershipWins: safeParse(briefing.leadership_wins_json, []),
    improvementAreas: safeParse(briefing.improvement_areas_json, []),
    promotionForecast: safeParse(briefing.promotion_forecast_json, {}),
    careerMomentum: safeParse(briefing.career_momentum_json, {}),
    leadershipDna: safeParse(briefing.leadership_dna_json, []),
    executiveInsights: safeParse(briefing.executive_insights_json, []),
    learningSummary: safeParse(briefing.learning_summary_json, {}),
    interviewReadiness: safeParse(briefing.interview_readiness_json, {}),
    companyIntelligence: safeParse(briefing.company_intelligence_json, []),
    decisionLab: safeParse(briefing.decision_lab_json, {}),
    executiveActions: safeParse(briefing.executive_actions_json, []),
    lookingAhead: safeParse(briefing.looking_ahead_json, {}),
    briefingScore: safeParse(briefing.briefing_score_json, {}),
    timeline: safeParse(briefing.timeline_json, []),
  };
}
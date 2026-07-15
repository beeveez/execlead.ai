/**
 * EXECLEAD.AI — Executive Journey Orchestrator™
 * ============================================================
 * The customer experience brain of EXECLEAD.AI.
 *
 * Orchestrates the entire executive journey by determining the
 * highest-value experience, recommendation, mission, coaching
 * session, learning path, and AI interaction for every user.
 *
 * Answers one question continuously:
 *   "What is the single highest-value thing this user should do right now?"
 *
 * Consumes: Promotion Forecast Engine™, Leadership DNA™, Executive Journey™,
 *   Executive Briefing™, Action Center™, Digital Twin™, Decision Lab™,
 *   Executive Coach™, Company Intelligence™, Executive Academy™,
 *   Interview Simulator™, Resume AI™, Executive Concierge™
 *
 * Publishes: Next Best Action™, Journey Stage, Current Objective,
 *   Recommended Experience, Mission, Learning Path
 */
import { base44 } from "@/api/base44Client";
import { getLatestForecast, LEADERSHIP_DIMENSIONS } from "./promotionForecastEngine";
import { getJourneyStage, JOURNEY_STAGES as JOURNEY_STAGES_FROM_BRAND } from "./brandExperience";

export const ORCHESTRATOR_VERSION = "1.0";

// ============================================================
// §1 — JOURNEY STAGES (8 canonical stages)
// ============================================================

export const JOURNEY_STAGE_DEFINITIONS = [
  { id: "explorer", title: "Explorer", description: "Building professional foundations.", icon: "🌱" },
  { id: "emerging", title: "Emerging Leader", description: "Developing leadership capability.", icon: "🌿" },
  { id: "manager", title: "People Manager", description: "Managing teams and operations.", icon: "👥" },
  { id: "senior", title: "Senior Leader", description: "Driving strategy and organizational impact.", icon: "🎯" },
  { id: "executive", title: "Executive", description: "Leading business functions.", icon: "🏆" },
  { id: "enterprise", title: "Enterprise Executive", description: "Leading organizations.", icon: "⚡" },
  { id: "board", title: "Board Ready", description: "Preparing for executive governance.", icon: "👑" },
  { id: "legacy", title: "Legacy Leader", description: "Mentoring future leaders.", icon: "💎" },
];

// ============================================================
// §2 — CAREER GOAL PATTERNS
// ============================================================

const CAREER_GOAL_PATTERNS = [
  { match: /team lead|team leader/i, label: "Become Team Lead", type: "role", targetStage: "manager" },
  { match: /manager/i, label: "Become Manager", type: "role", targetStage: "manager" },
  { match: /director/i, label: "Become Director", type: "role", targetStage: "senior" },
  { match: /\bcio\b/i, label: "Become CIO", type: "role", targetStage: "executive" },
  { match: /\bcto\b/i, label: "Become CTO", type: "role", targetStage: "executive" },
  { match: /\bcoo\b/i, label: "Become COO", type: "role", targetStage: "executive" },
  { match: /\bceo\b|chief exec/i, label: "Become CEO", type: "role", targetStage: "enterprise" },
  { match: /founder|entrepreneur/i, label: "Become Founder", type: "role", targetStage: "executive" },
  { match: /consult/i, label: "Transition to Consulting", type: "transition", targetStage: "executive" },
  { match: /microsoft/i, label: "Join Microsoft", type: "company", targetStage: "senior" },
  { match: /amazon|aws/i, label: "Join Amazon", type: "company", targetStage: "senior" },
  { match: /google/i, label: "Join Google", type: "company", targetStage: "senior" },
  { match: /apple/i, label: "Join Apple", type: "company", targetStage: "senior" },
  { match: /meta|facebook/i, label: "Join Meta", type: "company", targetStage: "senior" },
  { match: /netflix/i, label: "Join Netflix", type: "company", targetStage: "senior" },
];

// ============================================================
// §3 — COACHING TOPICS
// ============================================================

const COACHING_TOPICS = {
  strategic_thinking: { title: "Strategic Thinking", path: "/coach" },
  communication: { title: "Executive Communication", path: "/coach" },
  financial_acumen: { title: "Financial Leadership", path: "/academy" },
  stakeholder_management: { title: "Stakeholder Management", path: "/coach" },
  executive_presence: { title: "Executive Presence", path: "/simulator" },
  decision_making: { title: "Decision Making", path: "/decision-intelligence" },
  influence: { title: "Influence & Persuasion", path: "/debate" },
  people_leadership: { title: "People Leadership", path: "/coach" },
  governance: { title: "Governance & Ethics", path: "/academy" },
  risk_management: { title: "Risk Management", path: "/simulator" },
  innovation: { title: "Innovation & Strategy", path: "/academy" },
  business_acumen: { title: "Business Acumen", path: "/academy" },
  change_leadership: { title: "Change Leadership", path: "/coach" },
  operational_leadership: { title: "Operational Excellence", path: "/academy" },
  customer_focus: { title: "Customer-Centric Leadership", path: "/academy" },
};

// ============================================================
// §4 — MILESTONE DEFINITIONS
// ============================================================

const MILESTONE_DEFINITIONS = [
  { id: "first_challenge", label: "First Leadership Mission", check: (d) => (d.challenges?.length || 0) > 0, path: "/challenge", icon: "⚔️" },
  { id: "first_interview", label: "First Interview Simulation", check: (d) => (d.simulations?.length || 0) > 0, path: "/simulator", icon: "🎤" },
  { id: "first_forecast", label: "First Promotion Forecast™", check: (d) => !!d.forecast, path: "/promotion-forecast", icon: "📈" },
  { id: "first_briefing", label: "First Executive Briefing™", check: (d) => (d.briefings?.length || 0) > 0, path: "/executive-briefing", icon: "📋" },
  { id: "first_certification", label: "First Certification", check: (d) => (d.certificates?.length || 0) > 0, path: "/academy", icon: "📜" },
  { id: "first_resume", label: "First Resume Review", check: (d) => (d.resumes?.length || 0) > 0, path: "/resume", icon: "📄" },
  { id: "first_decision", label: "First Decision Lab™", check: (d) => (d.decisions?.length || 0) > 0, path: "/decision-intelligence", icon: "⚖️" },
  { id: "first_action", label: "First Executive Action", check: (d) => (d.actions?.length || 0) > 0, path: "/action-center", icon: "⚡" },
];

// ============================================================
// §5 — DATA FETCHING (14 sources in parallel)
// ============================================================

async function fetchJourneyData(userId) {
  const sources = [
    { key: "forecast", fetch: () => getLatestForecast(userId) },
    { key: "profile", fetch: () => base44.entities.UserProfile.filter({ user_id: userId }, "-created_date", 1) },
    { key: "actions", fetch: () => base44.entities.ExecutiveAction.filter({ user_id: userId }, "-created_date", 100) },
    { key: "lessons", fetch: () => base44.entities.LessonProgress.filter({ user_id: userId }, "-created_date", 50) },
    { key: "simulations", fetch: () => base44.entities.SimulationSession.filter({ user_id: userId }, "-created_date", 20) },
    { key: "decisions", fetch: () => base44.entities.ExecutiveDecision.filter({ created_by_id: userId }, "-created_date", 20) },
    { key: "achievements", fetch: () => base44.entities.Achievement.filter({ user_id: userId }, "-created_date", 30) },
    { key: "challenges", fetch: () => base44.entities.ChallengeResult.filter({ user_id: userId }, "-created_date", 30) },
    { key: "journey", fetch: () => base44.entities.JourneyEvent.filter({ user_id: userId }, "-created_date", 30) },
    { key: "briefings", fetch: () => base44.entities.ExecutiveBriefing.filter({ user_id: userId }, "-created_date", 5) },
    { key: "resumes", fetch: () => base44.entities.ResumeImport.filter({ created_by_id: userId }, "-created_date", 5) },
    { key: "certificates", fetch: () => base44.entities.Certificate.filter({ created_by_id: userId }, "-created_date", 10) },
    { key: "identity", fetch: () => base44.entities.IdentityVerification.filter({ user_id: userId }, "-created_date", 1) },
    { key: "dna", fetch: () => base44.entities.LeadershipDNA.filter({ user_id: userId }, "-created_date", 1) },
  ];

  const results = await Promise.allSettled(sources.map((s) => s.fetch()));
  const data = {};
  sources.forEach((s, i) => {
    if (results[i].status === "fulfilled") {
      data[s.key] = s.key === "forecast" ? results[i].value : (results[i].value || []);
    } else {
      data[s.key] = s.key === "forecast" ? null : [];
    }
  });
  return data;
}

// ============================================================
// §6 — JOURNEY STAGE DETERMINATION
// ============================================================

function estimateXP(data) {
  const profile = data.profile?.[0];
  if (profile?.xp_points) return profile.xp_points;
  if (profile?.points) return profile.points;

  const completedActions = (data.actions || []).filter((a) => a.status === "completed").length;
  const completedLessons = (data.lessons || []).filter((l) => l.status === "completed").length;
  const completedSims = (data.simulations || []).filter((s) => s.status === "completed").length;
  const challenges = (data.challenges || []).length;
  const decisions = (data.decisions || []).filter((d) => d.status === "completed" || d.status === "accepted").length;
  const achievements = (data.achievements || []).length;
  const journeyEvents = (data.journey || []).length;

  return completedActions * 50 + completedLessons * 25 + completedSims * 100 +
    challenges * 50 + decisions * 75 + achievements * 100 + journeyEvents * 50;
}

function determineJourneyStage(data) {
  const xp = estimateXP(data);
  const stageInfo = getJourneyStage(xp);
  const idx = JOURNEY_STAGES_FROM_BRAND.indexOf(stageInfo.current);
  const definition = JOURNEY_STAGE_DEFINITIONS[idx] || JOURNEY_STAGE_DEFINITIONS[0];
  return {
    id: definition.id,
    title: definition.title,
    description: definition.description,
    icon: definition.icon,
    xp,
    progress: stageInfo.progress,
    journeyPercent: stageInfo.journeyPercent,
    nextStage: stageInfo.next ? JOURNEY_STAGE_DEFINITIONS[JOURNEY_STAGES_FROM_BRAND.indexOf(stageInfo.next)] : null,
    xpToNext: stageInfo.pointsToNext || 0,
  };
}

// JOURNEY_STAGES imported at top of file from brandExperience

// ============================================================
// §7 — CAREER GOAL DETERMINATION
// ============================================================

function determineCareerGoal(data, stage) {
  const profile = data.profile?.[0] || {};
  const targetRole = profile.target_role || profile.career_goal || "";

  for (const pattern of CAREER_GOAL_PATTERNS) {
    if (pattern.match.test(targetRole)) {
      return {
        label: pattern.label,
        type: pattern.type,
        targetStage: pattern.targetStage,
        rawGoal: targetRole,
        path: pattern.type === "company" ? "/companies" : "/career",
      };
    }
  }

  // Infer from forecast target level
  const forecast = data.forecast;
  if (forecast?.target_level) {
    return {
      label: `Become ${forecast.target_level}`,
      type: "role",
      targetStage: stage.id,
      rawGoal: forecast.target_level,
      path: "/promotion-forecast",
    };
  }

  // Default based on stage
  const nextTitle = stage.nextStage?.title || "Senior Leader";
  return {
    label: `Become ${nextTitle}`,
    type: "role",
    targetStage: stage.nextStage?.id || "senior",
    rawGoal: "",
    path: "/career",
  };
}

// ============================================================
// §8 — READINESS & MOMENTUM
// ============================================================

function determineReadiness(data) {
  const forecast = data.forecast;
  return {
    score: forecast?.readiness_score || 0,
    probability: forecast?.probability_score || 0,
    momentum: forecast?.momentum || "stable",
    timeline: forecast?.timeline_label || "—",
    timelineMonths: forecast?.timeline_months || 0,
    confidence: forecast?.confidence_score || 0,
    currentLevel: forecast?.current_level || "—",
    targetLevel: forecast?.target_level || "—",
  };
}

// ============================================================
// §9 — NEXT BEST ACTION™
// ============================================================

function determineNextBestAction(data, stage, readiness) {
  // Priority 1: Pending high-priority action from Action Center
  const pendingActions = (data.actions || []).filter((a) => a.status === "pending" || a.status === "in_progress");
  const highPriority = pendingActions.find((a) => a.priority === "critical") ||
    pendingActions.find((a) => a.priority === "high");
  if (highPriority) {
    return {
      title: highPriority.title,
      description: highPriority.description || "High-priority executive action.",
      priority: highPriority.priority,
      path: highPriority.source_path || "/action-center",
      estimatedMinutes: highPriority.estimated_minutes || 15,
      readinessImpact: highPriority.impact_score || 5,
      careerImpact: "Direct impact on executive readiness",
      source: "Action Center™",
    };
  }

  // Priority 2: Top improvement priority from forecast
  const priorities = data.forecast?.improvement_priorities || [];
  if (priorities.length > 0) {
    const top = priorities[0];
    return {
      title: top.action,
      description: `Improve ${top.dimension} from ${top.current}% toward ${top.target}%.`,
      priority: "high",
      path: top.path || "/academy",
      estimatedMinutes: 30,
      readinessImpact: top.impact || 4,
      careerImpact: `+${top.impact || 4}% promotion readiness`,
      source: "Promotion Forecast™",
    };
  }

  // Priority 3: Infer from weakest dimension
  const dimensions = data.forecast?.dimensions || LEADERSHIP_DIMENSIONS;
  const weakest = [...dimensions].sort((a, b) => (a.current || 0) - (b.current || 0))[0];
  if (weakest) {
    return {
      title: `Improve ${weakest.label}`,
      description: `Your ${weakest.label} score is ${weakest.current || 0}%. Target: ${weakest.target || 85}%.`,
      priority: "medium",
      path: "/academy",
      estimatedMinutes: 30,
      readinessImpact: Math.ceil((weakest.target - weakest.current) / 5) || 3,
      careerImpact: "Closes your largest leadership gap",
      source: "Leadership DNA™",
    };
  }

  // Fallback based on journey stage
  const stageActions = {
    explorer: { title: "Complete your executive profile", path: "/profile", minutes: 10 },
    emerging: { title: "Take your first Daily Challenge", path: "/challenge", minutes: 15 },
    manager: { title: "Complete a Leadership DNA assessment", path: "/leadership-dna", minutes: 20 },
    senior: { title: "Run a Promotion Forecast", path: "/promotion-forecast", minutes: 15 },
    executive: { title: "Review your Executive Briefing™", path: "/executive-briefing", minutes: 10 },
    enterprise: { title: "Practice Executive Decision Lab™", path: "/decision-intelligence", minutes: 20 },
    board: { title: "Update your Executive Portfolio™", path: "/executive-portfolio", minutes: 20 },
    legacy: { title: "Write a Legacy Letter", path: "/legacy-library", minutes: 30 },
  };
  const fallback = stageActions[stage.id] || stageActions.explorer;
  return {
    title: fallback.title,
    description: "Continue your executive journey with this recommended next step.",
    priority: "medium",
    path: fallback.path,
    estimatedMinutes: fallback.minutes,
    readinessImpact: 3,
    careerImpact: "Advances your leadership journey",
    source: "Journey Orchestrator™",
  };
}

// ============================================================
// §10 — BOTTLENECK IDENTIFICATION
// ============================================================

function identifyBottleneck(data, readiness) {
  const dimensions = data.forecast?.dimensions || [];
  if (dimensions.length === 0) return null;

  const gaps = dimensions
    .filter((d) => d.gap > 0)
    .sort((a, b) => b.gap - a.gap);

  if (gaps.length === 0) return null;

  const top = gaps[0];
  return {
    dimension: top.label,
    current: top.current,
    target: top.target,
    gap: top.gap,
    readinessImpact: Math.ceil(top.gap / 5),
    description: `${top.label} is ${top.gap}% below target. Addressing this could unlock +${Math.ceil(top.gap / 5)}% readiness.`,
  };
}

// ============================================================
// §11 — ADAPTIVE LEARNING PATH
// ============================================================

function buildAdaptiveLearningPath(data, readiness) {
  const skillGaps = data.forecast?.skill_gaps || [];
  const completedLessons = (data.lessons || []).filter((l) => l.status === "completed");
  const completedLessonTitles = new Set(completedLessons.map((l) => l.course_title || l.title || ""));

  const path = skillGaps.slice(0, 5).map((gap, i) => {
    const topic = COACHING_TOPICS[gap.label?.toLowerCase().replace(/\s+/g, "_")] ||
      { title: gap.label, path: "/academy" };
    return {
      order: i + 1,
      title: `${gap.label} Development`,
      description: `Close a ${gap.gap}% gap (currently ${gap.current}%, target ${gap.target}%).`,
      type: i === 0 ? "course" : i === 1 ? "simulation" : i === 2 ? "challenge" : "reading",
      path: topic.path,
      estimatedTime: `${20 + i * 10} min`,
      readinessGain: gap.impact || 3,
      status: completedLessonTitles.has(gap.label) ? "completed" : "not_started",
    };
  });

  if (path.length === 0) {
    return [
      { order: 1, title: "Strategic Leadership Foundations", description: "Start your learning journey.", type: "course", path: "/academy", estimatedTime: "30 min", readinessGain: 5, status: "not_started" },
      { order: 2, title: "Executive Communication", description: "Build your communication skills.", type: "simulation", path: "/simulator", estimatedTime: "20 min", readinessGain: 4, status: "not_started" },
      { order: 3, title: "Daily Leadership Challenge", description: "Test your decision-making.", type: "challenge", path: "/challenge", estimatedTime: "15 min", readinessGain: 3, status: "not_started" },
    ];
  }

  return path;
}

// ============================================================
// §12 — COACHING FOCUS
// ============================================================

function determineCoachingFocus(data, bottleneck) {
  const dimensions = data.forecast?.dimensions || LEADERSHIP_DIMENSIONS;
  const weakest = [...dimensions].sort((a, b) => (a.current || 0) - (b.current || 0))[0];

  if (weakest) {
    const topic = COACHING_TOPICS[weakest.key] || { title: weakest.label, path: "/coach" };
    return {
      title: topic.title,
      dimension: weakest.label,
      currentScore: weakest.current || 0,
      targetScore: weakest.target || 85,
      path: topic.path,
      description: `Your ${weakest.label} score is ${weakest.current || 0}%. A coaching session can help you reach ${weakest.target || 85}%.`,
    };
  }

  return {
    title: "Strategic Thinking",
    dimension: "Strategic Thinking",
    currentScore: 0,
    targetScore: 85,
    path: "/coach",
    description: "Start with strategic thinking — the foundation of executive leadership.",
  };
}

// ============================================================
// §13 — MISSION ENGINE
// ============================================================

function generateMissions(data, stage, goal, nba) {
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);

  const actionsThisWeek = (data.actions || []).filter((a) => a.completed_date && new Date(a.completed_date) >= weekStart);
  const lessonsThisWeek = (data.lessons || []).filter((l) => l.completed_date && new Date(l.completed_date) >= weekStart);

  return [
    {
      type: "daily",
      title: nba.title,
      description: nba.description,
      progress: 0,
      status: "not_started",
      path: nba.path,
      estimatedTime: `${nba.estimatedMinutes} min`,
      impact: `+${nba.readinessImpact}% readiness`,
    },
    {
      type: "weekly",
      title: `Complete 3 executive actions this week`,
      description: "Build momentum through consistent daily action.",
      progress: Math.min(100, Math.round((actionsThisWeek.length / 3) * 100)),
      status: actionsThisWeek.length >= 3 ? "completed" : "in_progress",
      path: "/action-center",
      estimatedTime: "45 min total",
      impact: "+6% readiness",
    },
    {
      type: "monthly",
      title: `Advance toward: ${goal.label}`,
      description: `Focus on ${stage.nextStage?.title || "next stage"} competencies.`,
      progress: stage.progress,
      status: stage.progress >= 100 ? "completed" : "in_progress",
      path: goal.path,
      estimatedTime: "Ongoing",
      impact: `Journey to ${stage.nextStage?.title || "next level"}`,
    },
    {
      type: "quarterly",
      title: `Achieve ${data.forecast?.target_level || "next level"} readiness`,
      description: `Reach ${data.forecast?.readiness_score || 0 + 10}% promotion readiness.`,
      progress: Math.min(100, Math.round(((data.forecast?.readiness_score || 0) / 85) * 100)),
      status: (data.forecast?.readiness_score || 0) >= 85 ? "completed" : "in_progress",
      path: "/promotion-forecast",
      estimatedTime: "3 months",
      impact: "Promotion readiness",
    },
  ];
}

// ============================================================
// §14 — MILESTONE TRACKING
// ============================================================

function trackMilestones(data) {
  const milestones = MILESTONE_DEFINITIONS.map((m) => ({
    id: m.id,
    label: m.label,
    icon: m.icon,
    path: m.path,
    achieved: m.check(data),
  }));
  const achievedCount = milestones.filter((m) => m.achieved).length;
  const nextMilestone = milestones.find((m) => !m.achieved);
  return {
    milestones,
    achievedCount,
    total: milestones.length,
    completionRate: Math.round((achievedCount / milestones.length) * 100),
    next: nextMilestone || null,
  };
}

// ============================================================
// §15 — JOURNEY TIMELINE
// ============================================================

function buildJourneyTimeline(data, stage, goal, readiness) {
  const milestones = trackMilestones(data);
  return [
    { label: "Today", status: "current", detail: `${stage.title} — ${stage.progress}% to next stage` },
    { label: "Current Objective", status: "active", detail: goal.label },
    {
      label: "Next Milestone",
      status: "upcoming",
      detail: milestones.next ? milestones.next.label : "All milestones achieved",
    },
    {
      label: "Quarterly Goal",
      status: "upcoming",
      detail: `Reach ${Math.min(100, (readiness.score || 0) + 10)}% readiness`,
    },
    {
      label: "Promotion Goal",
      status: "future",
      detail: `${readiness.timeline} to ${readiness.targetLevel}`,
    },
    {
      label: "Executive Goal",
      status: "future",
      detail: stage.nextStage ? `Advance to ${stage.nextStage.title}` : "Maintain executive excellence",
    },
    { label: "Legacy Goal", status: "future", detail: "Mentor future leaders" },
  ];
}

// ============================================================
// §16 — ENGAGEMENT METRICS
// ============================================================

function calculateEngagement(data) {
  const today = new Date();
  const dayMs = 86400000;
  const activityDates = new Set();

  const addDates = (items, dateField) => {
    items.forEach((item) => {
      const d = item[dateField] || item.completed_date || item.created_date;
      if (d) activityDates.add(d.split("T")[0]);
    });
  };

  addDates(data.actions || [], "completed_date");
  addDates(data.lessons || [], "completed_date");
  addDates(data.simulations || [], "created_date");
  addDates(data.challenges || [], "created_date");
  addDates(data.decisions || [], "created_date");
  addDates(data.journey || [], "created_date");

  // Calculate streak
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(today.getTime() - i * dayMs);
    const dateStr = d.toISOString().split("T")[0];
    if (activityDates.has(dateStr)) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }

  // Weekly engagement
  const weekAgo = new Date(today.getTime() - 7 * dayMs);
  const weeklyActive = [...activityDates].filter((d) => new Date(d) >= weekAgo).length;

  // Monthly engagement
  const monthAgo = new Date(today.getTime() - 30 * dayMs);
  const monthlyActive = [...activityDates].filter((d) => new Date(d) >= monthAgo).length;

  // Category-specific streaks
  const lessonDates = new Set();
  (data.lessons || []).forEach((l) => {
    if (l.completed_date) lessonDates.add(l.completed_date.split("T")[0]);
  });
  let learningStreak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(today.getTime() - i * dayMs);
    if (lessonDates.has(d.toISOString().split("T")[0])) learningStreak++;
    else if (i > 0) break;
  }

  const missionDates = new Set();
  (data.actions || []).filter((a) => a.status === "completed").forEach((a) => {
    if (a.completed_date) missionDates.add(a.completed_date.split("T")[0]);
  });
  let missionStreak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(today.getTime() - i * dayMs);
    if (missionDates.has(d.toISOString().split("T")[0])) missionStreak++;
    else if (i > 0) break;
  }

  return {
    streak,
    learningStreak,
    missionStreak,
    interviewCount: (data.simulations || []).length,
    decisionCount: (data.decisions || []).length,
    weeklyActiveDays: weeklyActive,
    monthlyActiveDays: monthlyActive,
    totalActivities: activityDates.size,
  };
}

// ============================================================
// §17 — PREDICTIVE ORCHESTRATION
// ============================================================

function generatePredictions(data, engagement, readiness) {
  const streak = engagement.streak;
  const weeklyActive = engagement.weeklyActiveDays;

  // Churn risk: high if low engagement
  let churnRisk = "low";
  if (streak === 0 && weeklyActive <= 1) churnRisk = "high";
  else if (streak <= 2 && weeklyActive <= 3) churnRisk = "medium";

  // Goal completion likelihood
  const readinessScore = readiness.score || 0;
  const goalCompletion = Math.min(95, Math.round(readinessScore * 0.5 + streak * 3 + weeklyActive * 2));

  // Learning completion
  const inProgressLessons = (data.lessons || []).filter((l) => l.status === "in_progress").length;
  const completedLessons = (data.lessons || []).filter((l) => l.status === "completed").length;
  const learningCompletion = inProgressLessons + completedLessons > 0
    ? Math.round((completedLessons / (inProgressLessons + completedLessons)) * 100)
    : 0;

  // Subscription upgrade likelihood
  const featureUsage = (data.actions || []).length + (data.simulations || []).length + (data.challenges || []).length;
  let upgradeLikelihood = "low";
  if (featureUsage > 30 && readinessScore > 60) upgradeLikelihood = "high";
  else if (featureUsage > 15 && readinessScore > 40) upgradeLikelihood = "medium";

  return {
    promotionLikelihood: readiness.probability || 0,
    churnRisk,
    goalCompletionLikelihood: goalCompletion,
    learningCompletionRate: learningCompletion,
    upgradeLikelihood,
    insight: churnRisk === "high"
      ? "Low engagement detected. Consider re-engaging with daily challenges."
      : streak >= 7
      ? "Strong momentum! You're on a 7+ day streak."
      : "Keep building your daily streak for faster progress.",
  };
}

// ============================================================
// §18 — EXPERIENCE ORCHESTRATION
// ============================================================

function orchestrateExperience(data, stage, nba, coachingFocus) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  return {
    landing: { greeting: `${greeting}! You're a ${stage.title}.`, focus: nba.title },
    home: { primaryAction: nba, mission: `Continue: ${nba.title}` },
    actionCenter: { focus: "Top prioritized actions from your journey" },
    coach: { topic: coachingFocus.title },
    learning: { recommendation: "Adaptive Learning Path item #1" },
    briefing: { focus: "Weekly progress and Next Best Action" },
    mission: { priority: nba.title },
    notification: { message: `${nba.title} — ${nba.estimatedMinutes} min` },
  };
}

// ============================================================
// §19 — MAIN ENTRY POINT
// ============================================================

export async function orchestrateJourney(user) {
  try {
    const data = await fetchJourneyData(user.id);
    const stage = determineJourneyStage(data);
    const careerGoal = determineCareerGoal(data, stage);
    const readiness = determineReadiness(data);
    const nextBestAction = determineNextBestAction(data, stage, readiness);
    const bottleneck = identifyBottleneck(data, readiness);
    const learningPath = buildAdaptiveLearningPath(data, readiness);
    const coachingFocus = determineCoachingFocus(data, bottleneck);
    const missions = generateMissions(data, stage, careerGoal, nextBestAction);
    const milestones = trackMilestones(data);
    const timeline = buildJourneyTimeline(data, stage, careerGoal, readiness);
    const engagement = calculateEngagement(data);
    const predictions = generatePredictions(data, engagement, readiness);
    const experience = orchestrateExperience(data, stage, nextBestAction, coachingFocus);

    return {
      version: ORCHESTRATOR_VERSION,
      generatedAt: new Date().toISOString(),
      stage,
      careerGoal,
      readiness,
      nextBestAction,
      bottleneck,
      learningPath,
      coachingFocus,
      missions,
      milestones,
      timeline,
      engagement,
      predictions,
      experience,
    };
  } catch (error) {
    return generateFallbackOrchestration(user);
  }
}

function generateFallbackOrchestration(user) {
  const stage = { id: "explorer", title: "Explorer", description: "Building professional foundations.", icon: "🌱", xp: 0, progress: 0, journeyPercent: 0, nextStage: JOURNEY_STAGE_DEFINITIONS[1], xpToNext: 500 };
  return {
    version: ORCHESTRATOR_VERSION,
    generatedAt: new Date().toISOString(),
    stage,
    careerGoal: { label: "Become Emerging Leader", type: "role", targetStage: "emerging", rawGoal: "", path: "/career" },
    readiness: { score: 0, probability: 0, momentum: "stable", timeline: "—", timelineMonths: 0, confidence: 0, currentLevel: "—", targetLevel: "—" },
    nextBestAction: { title: "Complete your executive profile", description: "Start your journey by setting up your profile.", priority: "high", path: "/profile", estimatedMinutes: 10, readinessImpact: 10, careerImpact: "Unlocks personalized recommendations", source: "Journey Orchestrator™" },
    bottleneck: null,
    learningPath: [],
    coachingFocus: { title: "Strategic Thinking", dimension: "Strategic Thinking", currentScore: 0, targetScore: 85, path: "/coach", description: "Start with strategic thinking." },
    missions: [],
    milestones: { milestones: [], achievedCount: 0, total: 8, completionRate: 0, next: null },
    timeline: [],
    engagement: { streak: 0, learningStreak: 0, missionStreak: 0, interviewCount: 0, decisionCount: 0, weeklyActiveDays: 0, monthlyActiveDays: 0, totalActivities: 0 },
    predictions: { promotionLikelihood: 0, churnRisk: "high", goalCompletionLikelihood: 0, learningCompletionRate: 0, upgradeLikelihood: "low", insight: "Complete your profile to unlock personalized recommendations." },
    experience: { landing: { greeting: "Welcome!", focus: "Complete your profile" } },
  };
}

// ============================================================
// §20 — DEVELOPER ANALYTICS
// ============================================================

export async function getJourneyAnalytics(limit = 500) {
  try {
    const [forecasts, actions, profiles] = await Promise.all([
      base44.entities.PromotionForecast.list("-created_date", limit),
      base44.entities.ExecutiveAction.list("-created_date", limit),
      base44.entities.UserProfile.list("-created_date", limit),
    ]);

    const total = forecasts.length;
    const uniqueUsers = new Set(forecasts.map((f) => f.user_id)).size;

    // Journey stage distribution (from readiness)
    const stageBuckets = { explorer: 0, emerging: 0, manager: 0, senior: 0, executive: 0, enterprise: 0, board: 0, legacy: 0 };
    forecasts.forEach((f) => {
      const r = f.readiness_score || 0;
      if (r >= 85) stageBuckets.executive++;
      else if (r >= 70) stageBuckets.senior++;
      else if (r >= 55) stageBuckets.manager++;
      else if (r >= 40) stageBuckets.emerging++;
      else stageBuckets.explorer++;
    });

    // Goal distribution (from profiles)
    const goalCounts = {};
    profiles.forEach((p) => {
      const goal = p.target_role || p.career_goal || "Not Set";
      const matched = CAREER_GOAL_PATTERNS.find((pat) => pat.match.test(goal));
      const label = matched ? matched.label : "Other";
      goalCounts[label] = (goalCounts[label] || 0) + 1;
    });
    const goalDistribution = Object.entries(goalCounts).sort((a, b) => b[1] - a[1]).slice(0, 10);

    // Common bottlenecks (from skill gaps)
    const bottleneckCounts = {};
    forecasts.forEach((f) => {
      try {
        const gaps = JSON.parse(f.skill_gaps_json || "[]");
        if (gaps.length > 0) {
          const label = gaps[0].label || "Unknown";
          bottleneckCounts[label] = (bottleneckCounts[label] || 0) + 1;
        }
      } catch {}
    });
    const commonBottlenecks = Object.entries(bottleneckCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

    // Mission completion rates
    const totalActions = actions.length;
    const completedActions = actions.filter((a) => a.status === "completed").length;
    const missionCompletionRate = totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 0;

    // Averages
    const avgReadiness = total > 0 ? Math.round(forecasts.reduce((s, f) => s + (f.readiness_score || 0), 0) / total) : 0;
    const avgTimeline = total > 0 ? Math.round(forecasts.reduce((s, f) => s + (f.timeline_months || 0), 0) / total) : 0;

    // Momentum distribution
    const momentumDist = { increasing: 0, stable: 0, declining: 0 };
    forecasts.forEach((f) => { if (f.momentum) momentumDist[f.momentum]++; });

    return {
      totalUsers: uniqueUsers,
      totalForecasts: total,
      stageDistribution: Object.entries(stageBuckets).map(([stage, count]) => ({
        stage: JOURNEY_STAGE_DEFINITIONS.find((s) => s.id === stage)?.title || stage,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      })),
      goalDistribution: goalDistribution.map(([goal, count]) => ({ goal, count, percentage: profiles.length > 0 ? Math.round((count / profiles.length) * 100) : 0 })),
      commonBottlenecks: commonBottlenecks.map(([dimension, count]) => ({ dimension, count })),
      missionCompletionRate,
      avgReadiness,
      avgTimelineMonths: avgTimeline,
      momentumDistribution: momentumDist,
    };
  } catch {
    return {
      totalUsers: 0, totalForecasts: 0, stageDistribution: [], goalDistribution: [],
      commonBottlenecks: [], missionCompletionRate: 0, avgReadiness: 0, avgTimelineMonths: 0,
      momentumDistribution: { increasing: 0, stable: 0, declining: 0 },
    };
  }
}
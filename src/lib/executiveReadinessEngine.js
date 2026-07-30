/**
 * EXECLEAD.AI — Executive Readiness Engine™ (Frontend Command Center)
 * =====================================================================
 * Single product principle: "Become Executive Ready."
 *
 * This module shapes the cached intelligence (from manageIntelligence /
 * recomputeIntelligence backend) into the Command Center model that the
 * Executive Dashboard consumes. It does NOT recompute readiness — the
 * backend is the source of truth. It only:
 *   1. Shapes readiness + journey into the 4 command-center answers
 *   2. Generates Today's Executive Mission™ from recommendations + activity gaps
 *   3. Maps every platform module to the readiness competencies it strengthens
 *   4. Defines the Executive Readiness Loop™ (the operating rhythm)
 *
 * Every activity inside EXECLEAD.AI contributes evidence to one measurable
 * objective: Executive Readiness. Modules are never isolated — they feed
 * one continuous leadership development journey.
 */
import { getLevelFromPoints } from "./journeyEngine";
import { getModuleEngagement } from "./readinessContributionRegistry";

// ── Executive Readiness Loop™ ──
// The platform's operating rhythm. Every module participates.
export const READINESS_LOOP = [
  { id: "learn", label: "Learn", icon: "GraduationCap", description: "Acquire knowledge in the Academy", modules: ["Academy", "Company Intelligence", "Career Intelligence"], contribution: "Knowledge · Business Acumen" },
  { id: "practice", label: "Practice", icon: "PenLine", description: "Reflect and apply in the Journal", modules: ["Reflection", "Executive Coach"], contribution: "Self-awareness · Executive Maturity" },
  { id: "simulate", label: "Simulate", icon: "Brain", description: "Run executive simulations & challenges", modules: ["Simulator", "Challenge", "Debate", "Voice Interview"], contribution: "Decision Quality · Risk Management · Executive Judgment" },
  { id: "feedback", label: "AI Feedback", icon: "Sparkles", description: "Receive AI executive coaching feedback", modules: ["Executive Coach", "Simulator AI Review"], contribution: "Targeted Improvement Signals" },
  { id: "improve", label: "Improve", icon: "TrendingUp", description: "Apply feedback and close competency gaps", modules: ["Academy", "Coach", "Reflection"], contribution: "Competency Growth" },
  { id: "measure", label: "Measure", icon: "BarChart3", description: "Track readiness, trust, and momentum", modules: ["Analytics", "Executive Readiness"], contribution: "Progress Validation" },
];

// ── Module → Competency Evidence Map™ ──
// Every module contributes evidence to the readiness dimensions.
// This is the backbone of "one operating system, many capabilities."
export const MODULE_EVIDENCE_MAP = [
  { id: "coach", name: "Executive Coach", icon: "MessageSquare", path: "/coach", contributes: ["Communication", "Leadership", "Strategic Thinking"], color: "#10b981" },
  { id: "simulator", name: "Executive Simulator", icon: "Brain", path: "/simulator", contributes: ["Decision Quality", "Risk Management", "Executive Judgment"], color: "#6366f1" },
  { id: "academy", name: "Executive Academy", icon: "GraduationCap", path: "/academy", contributes: ["Knowledge", "Business Acumen"], color: "#f59e0b" },
  { id: "reflection", name: "Reflection", icon: "PenLine", path: "/journal", contributes: ["Self-awareness", "Executive Maturity"], color: "#ec4899" },
  { id: "debate", name: "Executive Debates", icon: "Scale", path: "/debate", contributes: ["Influence", "Executive Communication"], color: "#ef4444" },
  { id: "career", name: "Career Intelligence", icon: "Briefcase", path: "/career", contributes: ["Career Progression"], color: "#06b6d4" },
  { id: "companies", name: "Company Intelligence", icon: "Building2", path: "/companies", contributes: ["Strategic Awareness"], color: "#8b5cf6" },
  { id: "challenge", name: "Daily Challenge", icon: "Swords", path: "/challenge", contributes: ["Leadership", "Decision Making"], color: "#f97316" },
  { id: "voice", name: "Voice Interview", icon: "Mic", path: "/voice-interview", contributes: ["Executive Presence", "Communication"], color: "#14b8a6" },
  { id: "council", name: "Executive Council", icon: "Users", path: "/council", contributes: ["Board Readiness", "Governance"], color: "#a855f7" },
];

// ── Leadership Journey Stages (mirrors platformConfig levels) ──
// Progression: Emerging Leader → Team Leader → Manager → Senior Manager
// → Director → Executive → Future CIO (board ready)
export const LEADERSHIP_JOURNEY_STAGES = [
  { id: "seed", label: "Emerging Leader", icon: "🌿" },
  { id: "emerging", label: "Team Leader", icon: "🌱" },
  { id: "manager", label: "Manager", icon: "👥" },
  { id: "senior", label: "Senior Manager", icon: "🎯" },
  { id: "executive", label: "Director", icon: "🏆" },
  { id: "enterprise", label: "Executive", icon: "⚡" },
  { id: "board", label: "Future CIO", icon: "👑" },
  { id: "legacy", label: "Legacy Leader", icon: "💎" },
];

const READINESS_HISTORY_KEY = "exec_readiness_history";

/**
 * Track readiness score history (yesterday / last week / last month)
 * for the trend + weekly + monthly progress deltas on the command center.
 * Uses localStorage, consistent with the existing ExecutiveHealth pattern.
 */
export function trackReadinessHistory(userId, score) {
  if (!userId || score == null) return null;
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  const lastWeek = new Date(Date.now() - 604800000).toDateString();
  const lastMonth = new Date(Date.now() - 2592000000).toDateString();
  let history = {};
  try { history = JSON.parse(localStorage.getItem(READINESS_HISTORY_KEY)) || {}; } catch {}
  if (!history[userId]) history[userId] = {};
  history[userId][today] = score;
  try { localStorage.setItem(READINESS_HISTORY_KEY, JSON.stringify(history)); } catch {}
  const h = history[userId];
  return {
    yesterday: h[yesterday] != null ? score - h[yesterday] : null,
    lastWeek: h[lastWeek] != null ? score - h[lastWeek] : null,
    lastMonth: h[lastMonth] != null ? score - h[lastMonth] : null,
  };
}

/**
 * Shape the cached intelligence into the Command Center model.
 * Answers the 4 questions every user must see immediately:
 *   1. Where am I today?        → readinessScore, trend
 *   2. What should I do next?    → todaysMission
 *   3. How much have I improved? → weeklyProgress, monthlyProgress
 *   4. What should I focus on?   → focusAreas (lowest dimensions)
 */
export function buildCommandCenter(intelligence, profile) {
  const readiness = intelligence?.readiness || {};
  const journey = intelligence?.journey || {};
  const forecast = intelligence?.forecast || {};

  const overallScore = readiness.overallScore || 0;
  const progress = trackReadinessHistory(profile?.id || profile?.user_id, overallScore);

  // Journey stage from points
  const journeyLevel = getLevelFromPoints(journey.points || journey.xp_points || 0);
  const stageIndex = LEADERSHIP_JOURNEY_STAGES.findIndex((s) => s.id === journeyLevel.current?.id);
  const currentStage = LEADERSHIP_JOURNEY_STAGES[stageIndex >= 0 ? stageIndex : 0];
  const nextStage = LEADERSHIP_JOURNEY_STAGES[stageIndex + 1] || null;

  // Focus areas: lowest-scoring readiness dimensions
  const dimensions = (readiness.dimensions || []).map((d) => ({
    id: d.id,
    label: d.label,
    score: d.score ?? d.value ?? 0,
    benchmark: d.benchmark ?? 70,
    gap: Math.max(0, (d.benchmark ?? 70) - (d.score ?? d.value ?? 0)),
    recommendation: d.recommendation || "",
  }));
  const focusAreas = [...dimensions].sort((a, b) => a.score - b.score).slice(0, 3);

  const mission = generateTodaysMission(intelligence, profile);

  // Aggregate module engagement — proves every module feeds the engine.
  const engagement = getModuleEngagement();

  return {
    readinessScore: overallScore,
    readinessTrend: readiness.trend || "Stable",
    readinessConfidence: readiness.confidence || "—",
    estimatedMonths: readiness.estimatedMonths || 0,
    weeklyProgress: progress?.lastWeek,
    monthlyProgress: progress?.lastMonth,
    dailyDelta: progress?.yesterday,
    journey: {
      points: journey.points || journey.xp_points || 0,
      currentStage,
      nextStage,
      progressToNext: journeyLevel.progress || 0,
      pointsToNext: journeyLevel.pointsToNext || 0,
    },
    mission,
    focusAreas,
    dimensions,
    forecast: {
      promotionProbability: forecast?.promotion_probability ?? forecast?.probability ?? 0,
      estimatedReadinessDate: forecast?.estimated_date || null,
    },
    loop: READINESS_LOOP,
    evidenceMap: MODULE_EVIDENCE_MAP,
    // Module engagement signals — breadth of modules and competencies
    // engaged, plus Readiness Loop™ coverage. The dashboard surfaces this
    // as "Engagement Breadth" — a leading indicator of readiness velocity.
    engagement: {
      modulesEngaged: engagement.modulesEngaged,
      competencyBreadth: engagement.competencyBreadth,
      loopCoverage: engagement.loopCoverage,
      loopCoveragePct: Math.round((engagement.loopCoverage / READINESS_LOOP.length) * 100),
      recentEntries: engagement.entries,
    },
  };
}

/**
 * Generate Today's Executive Mission™.
 * A personalized daily mission assembled from readiness recommendations
 * and recent activity gaps. Each mission has 1–3 steps, estimated time,
 * and the potential readiness gain.
 */
export function generateTodaysMission(intelligence, profile) {
  const readiness = intelligence?.readiness || {};
  const recs = readiness.recommendations || [];

  // Map recommendations into mission steps with module context
  const steps = recs.slice(0, 3).map((rec, i) => ({
    id: `step_${i + 1}`,
    label: rec.label || rec.activity || "Continue your executive development",
    path: rec.path || "/dashboard",
    icon: rec.icon || "🎯",
    gain: rec.gain || 1,
    estimatedMinutes: estimateMinutes(rec.path || rec.activity),
    competencies: mapRecToCompetencies(rec),
  }));

  // Ensure at least one step (fallback for new users)
  if (steps.length === 0) {
    steps.push({
      id: "step_1",
      label: "Complete your first Executive Challenge",
      path: "/challenge",
      icon: "⚔️",
      gain: 2,
      estimatedMinutes: 10,
      competencies: ["Leadership", "Decision Making"],
    });
  }

  const totalMinutes = steps.reduce((a, s) => a + s.estimatedMinutes, 0);
  const totalGain = steps.reduce((a, s) => a + s.gain, 0);

  return {
    id: `mission_${new Date().toISOString().split("T")[0]}`,
    title: missionTitle(profile),
    steps,
    estimatedTime: totalMinutes >= 60 ? `${Math.round(totalMinutes / 60)}h ${totalMinutes % 60}m` : `${totalMinutes}m`,
    potentialGain: totalGain,
    completedCount: 0,
    totalCount: steps.length,
  };
}

function missionTitle(profile) {
  const target = profile?.target_role || "your target executive role";
  return `Daily mission toward ${target}`;
}

function estimateMinutes(pathOrActivity) {
  const p = (pathOrActivity || "").toLowerCase();
  if (p.includes("simulator") || p.includes("simulation")) return 25;
  if (p.includes("academy") || p.includes("module")) return 20;
  if (p.includes("mentor")) return 30;
  if (p.includes("letter") || p.includes("publish")) return 25;
  if (p.includes("challenge")) return 10;
  if (p.includes("coach")) return 15;
  if (p.includes("journal") || p.includes("reflect")) return 10;
  if (p.includes("debate")) return 15;
  return 15;
}

function mapRecToCompetencies(rec) {
  const activity = (rec.activity || rec.path || "").toLowerCase();
  if (activity.includes("financial") || activity.includes("finance")) return ["Financial Literacy", "Commercial Acumen"];
  if (activity.includes("negotiation") || activity.includes("sim")) return ["Decision Quality", "Executive Judgment"];
  if (activity.includes("mentor")) return ["People Leadership"];
  if (activity.includes("letter") || activity.includes("publish")) return ["Influence", "Thought Leadership"];
  if (activity.includes("coach")) return ["Communication", "Leadership"];
  if (activity.includes("academy")) return ["Knowledge", "Business Acumen"];
  return ["Leadership"];
}

/**
 * Compute the active loop stage for a user based on recent activity.
 * Returns the index of the current stage in READINESS_LOOP.
 */
export function getActiveLoopStage(intelligence) {
  // Default to "Learn" — the entry point of the operating rhythm.
  // A more sophisticated version would inspect recent entity timestamps,
  // but the loop is visual guidance, not a state machine.
  return 0;
}
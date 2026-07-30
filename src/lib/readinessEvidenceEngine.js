/**
 * EXECLEAD.AI — Executive Readiness Evidence Engine™ (Phase 2)
 * ============================================================
 * From Contribution to Evidence.
 *
 * Readiness is no longer earned by visiting pages. It is earned through
 * a graded ladder of evidence:
 *
 *   Level 1 — Exposure          (viewed)         weight: very low
 *   Level 2 — Participation      (completed)      weight: medium
 *   Level 3 — Demonstrated       (passed/solved)  weight: high
 *   Level 4 — Executive Mastery (sustained)      weight: highest
 *
 * Executive Readiness is computed as a transparent composition:
 *   Exposure + Participation + Competency Demonstration + Consistency
 *   + Reflection + Practice + Improvement Trend = Executive Readiness
 *
 * Every score change is explainable. Every recommendation references
 * evidence. Every competency has measurable proof.
 */
import { getReadinessContribution } from "./readinessContributionRegistry";

// ── Evidence Levels ──
export const EVIDENCE_LEVELS = {
  exposure: { id: "exposure", level: 1, label: "Exposure", weight: 0.05, baseScore: 1, color: "#64748b", description: "Viewed or opened" },
  participation: { id: "participation", level: 2, label: "Participation", weight: 0.15, baseScore: 3, color: "#0ea5e9", description: "Completed an activity" },
  demonstrated: { id: "demonstrated", level: 3, label: "Demonstrated Competency", weight: 0.30, baseScore: 8, color: "#6366f1", description: "Passed, solved, or demonstrated" },
  mastery: { id: "mastery", level: 4, label: "Executive Mastery", weight: 0.35, baseScore: 12, color: "#f59e0b", description: "Sustained, consistent, milestone" },
};

// ── Evidence Type → Level + Competency mapping ──
export const EVIDENCE_TYPE_MAP = {
  page_visit: { level: "exposure", competency: null, source: "navigation", label: "Page visit" },
  article_view: { level: "exposure", competency: "Knowledge", source: "academy", label: "Article read" },
  recommendation_read: { level: "exposure", competency: null, source: "dashboard", label: "Recommendation read" },

  coaching_session: { level: "participation", competency: "Communication", source: "coach", label: "Coaching session" },
  lesson_completed: { level: "participation", competency: "Knowledge", source: "academy", label: "Lesson completed" },
  journal_entry: { level: "participation", competency: "Self-awareness", source: "journal", label: "Reflection entry" },
  challenge_started: { level: "participation", competency: "Leadership", source: "challenge", label: "Challenge started" },

  simulation_completed: { level: "demonstrated", competency: "Decision Quality", source: "simulator", label: "Simulation completed" },
  challenge_solved: { level: "demonstrated", competency: "Leadership", source: "challenge", label: "Challenge solved" },
  debate_completed: { level: "demonstrated", competency: "Influence", source: "debate", label: "Debate completed" },
  voice_session: { level: "demonstrated", competency: "Executive Presence", source: "voice-interview", label: "Voice interview completed" },
  assessment_passed: { level: "demonstrated", competency: "Knowledge", source: "academy", label: "Assessment passed" },
  council_decision: { level: "demonstrated", competency: "Governance", source: "council", label: "Council decision" },

  milestone_achieved: { level: "mastery", competency: "Career Progression", source: "journey", label: "Milestone achieved" },
  streak_sustained: { level: "mastery", competency: "Consistency", source: "platform", label: "Learning streak sustained" },
  promotion_improvement: { level: "mastery", competency: "Promotion Readiness", source: "forecast", label: "Promotion readiness improved" },
  competency_strengthened: { level: "mastery", competency: null, source: "engine", label: "Competency strengthened" },
  achievement_unlocked: { level: "mastery", competency: null, source: "achievements", label: "Achievement unlocked" },
};

const LEDGER_KEY = "exec_readiness_evidence_ledger";
const MAX_RECORDS = 500;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

// ── Readiness composition weights (sum = 1.0) ──
const COMPONENT_WEIGHTS = {
  exposure: 0.05,
  participation: 0.15,
  competencyDemonstration: 0.30,
  consistency: 0.15,
  reflection: 0.10,
  practice: 0.15,
  improvementTrend: 0.10,
};

const PRACTICE_TYPES = new Set(["simulation_completed", "challenge_solved", "debate_completed", "voice_session", "council_decision"]);
const REFLECTION_TYPES = new Set(["journal_entry", "coaching_session"]);

function uid() {
  return `ev_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function readLedger() {
  if (typeof window === "undefined") return [];
  try {
    const raw = JSON.parse(localStorage.getItem(LEDGER_KEY) || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

function writeLedger(records) {
  if (typeof window === "undefined") return;
  try {
    const trimmed = records.slice(-MAX_RECORDS);
    localStorage.setItem(LEDGER_KEY, JSON.stringify(trimmed));
  } catch {}
}

/**
 * Record a single evidence entry. Deduplicates by dedupeKey when provided
 * (e.g. entity-backed evidence uses `${entity}_${id}` so re-syncing doesn't
 * double-count).
 */
export function recordEvidence(input) {
  if (!input || typeof window === "undefined") return null;
  const type = EVIDENCE_TYPE_MAP[input.evidenceType];
  if (!type && !input.evidenceLevel) return null;

  const levelId = input.evidenceLevel || type?.level || "exposure";
  const level = EVIDENCE_LEVELS[levelId] || EVIDENCE_LEVELS.exposure;
  const contribution = input.contribution || getReadinessContribution(input.module || "");
  const competency = input.competency || type?.competency || contribution.competencies?.[0] || "Leadership";

  const records = readLedger();
  if (input.dedupeKey) {
    if (records.some((r) => r.dedupeKey === input.dedupeKey)) return null;
  }
  // Rate-limit exposure evidence to 1 per path per hour
  if (levelId === "exposure" && input.module) {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    if (records.some((r) => r.module === input.module && r.evidenceLevel === "exposure" && r.timestamp > oneHourAgo)) {
      return null;
    }
  }

  const score = input.score ?? level.baseScore;
  const record = {
    id: uid(),
    timestamp: Date.now(),
    workspace: input.workspace || "executive",
    module: input.module || contribution.title || "Platform",
    competency,
    evidenceType: input.evidenceType || "page_visit",
    evidenceLevel: levelId,
    evidenceLevelLabel: level.label,
    evidenceScore: score,
    journeyStage: contribution.journeyStage?.id || "emerging",
    readinessGain: Math.round(score * level.weight * 10) / 10,
    confidence: input.aiValidation ? 0.95 : level.level >= 3 ? 0.85 : level.level === 2 ? 0.6 : 0.3,
    source: input.source || type?.source || "platform",
    aiValidation: input.aiValidation ?? (level.level >= 2),
    outcome: input.outcome || (level.level >= 3 ? "demonstrated" : level.level === 2 ? "completed" : "viewed"),
    dedupeKey: input.dedupeKey || null,
  };
  records.push(record);
  writeLedger(records);
  return record;
}

export function getEvidenceLedger() {
  return readLedger().slice().reverse();
}

export function clearEvidenceLedger() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(LEDGER_KEY);
}

// ── Aggregations ──
function recordsSince(ms) {
  const cutoff = Date.now() - ms;
  return readLedger().filter((r) => r.timestamp >= cutoff);
}

function sumScores(records) {
  return records.reduce((a, r) => a + (r.evidenceScore || 0), 0);
}

function activeDayStreak() {
  const records = readLedger();
  if (records.length === 0) return 0;
  const days = new Set(records.map((r) => new Date(r.timestamp).toDateString()));
  let streak = 0;
  let cursor = new Date();
  for (let i = 0; i < 60; i++) {
    if (days.has(cursor.toDateString())) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else if (i === 0) {
      cursor.setDate(cursor.getDate() - 1); // allow today not yet active
    } else {
      break;
    }
  }
  return streak;
}

function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

/**
 * Compute Executive Readiness from evidence composition.
 * Returns the full breakdown so every point is explainable.
 */
export function computeReadinessFromEvidence() {
  const all = readLedger();
  const thisWeek = recordsSince(WEEK_MS);
  const lastWeek = all.filter((r) => r.timestamp >= Date.now() - 2 * WEEK_MS && r.timestamp < Date.now() - WEEK_MS);

  const byLevel = (level) => all.filter((r) => r.evidenceLevel === level);

  // Component scores (each normalized 0-100)
  const exposure = clamp(byLevel("exposure").length * 1.5, 0, 100);
  const participation = clamp(byLevel("participation").length * 6, 0, 100);
  const competencyDemonstration = clamp(sumScores(byLevel("demonstrated")) * 1.5, 0, 100);
  const consistency = clamp(activeDayStreak() * 12, 0, 100);
  const reflection = clamp(all.filter((r) => REFLECTION_TYPES.has(r.evidenceType)).length * 10, 0, 100);
  const practice = clamp(all.filter((r) => PRACTICE_TYPES.has(r.evidenceType)).length * 7, 0, 100);

  // Improvement trend: weekly evidence score delta, scaled
  const weekScore = sumScores(thisWeek);
  const lastWeekScore = sumScores(lastWeek);
  const rawTrend = lastWeekScore > 0 ? (weekScore - lastWeekScore) / lastWeekScore : (weekScore > 0 ? 0.5 : 0);
  const improvementTrend = clamp(rawTrend * 100, 0, 100);

  const total =
    exposure * COMPONENT_WEIGHTS.exposure +
    participation * COMPONENT_WEIGHTS.participation +
    competencyDemonstration * COMPONENT_WEIGHTS.competencyDemonstration +
    consistency * COMPONENT_WEIGHTS.consistency +
    reflection * COMPONENT_WEIGHTS.reflection +
    practice * COMPONENT_WEIGHTS.practice +
    improvementTrend * COMPONENT_WEIGHTS.improvementTrend;

  const totalScore = Math.round(total);

  // Per-competency evidence
  const competencyMap = {};
  all.forEach((r) => {
    if (!competencyMap[r.competency]) competencyMap[r.competency] = { competency: r.competency, score: 0, count: 0, levels: { exposure: 0, participation: 0, demonstrated: 0, mastery: 0 } };
    competencyMap[r.competency].score += r.evidenceScore;
    competencyMap[r.competency].count += 1;
    competencyMap[r.competency].levels[r.evidenceLevel] += 1;
  });
  Object.values(competencyMap).forEach((c) => { c.score = clamp(c.score, 0, 100); });

  // Confidence: blend of evidence volume, competency breadth, validation ratio
  const validated = all.filter((r) => r.aiValidation).length;
  const validationRatio = all.length > 0 ? validated / all.length : 0;
  const breadth = Object.keys(competencyMap).length;
  const confidence = clamp(
    Math.round((clamp(all.length / 50, 0, 1) * 30 + clamp(breadth / 8, 0, 1) * 30 + validationRatio * 40)),
    0, 100
  );

  return {
    totalScore,
    components: {
      exposure: Math.round(exposure),
      participation: Math.round(participation),
      competencyDemonstration: Math.round(competencyDemonstration),
      consistency: Math.round(consistency),
      reflection: Math.round(reflection),
      practice: Math.round(practice),
      improvementTrend: Math.round(improvementTrend),
    },
    componentWeights: COMPONENT_WEIGHTS,
    competencyBreakdown: Object.values(competencyMap).sort((a, b) => b.score - a.score),
    confidence,
    evidenceCount: all.length,
    thisWeekCount: thisWeek.length,
    weeklyScore: weekScore,
    lastWeekScore,
    streak: activeDayStreak(),
  };
}

/**
 * Executive Insight Engine™ — evidence-based explanations.
 * "Your Strategic Thinking improved this week because you completed
 *  three executive simulations and reflected on two coaching sessions."
 */
export function generateInsights() {
  const all = readLedger();
  if (all.length === 0) {
    return [{
      id: "insight_seed",
      type: "seed",
      competency: null,
      direction: "neutral",
      headline: "Your evidence journey begins now",
      body: "Complete a challenge, simulation, or reflection to start building evidence-backed readiness. Readiness is earned through demonstrated competency — not page visits.",
      evidence: [],
    }];
  }

  const thisWeek = recordsSince(WEEK_MS);
  const lastWeek = all.filter((r) => r.timestamp >= Date.now() - 2 * WEEK_MS && r.timestamp < Date.now() - WEEK_MS);

  const byCompWeek = (records) => {
    const m = {};
    records.forEach((r) => {
      if (!m[r.competency]) m[r.competency] = { competency: r.competency, score: 0, types: {} };
      m[r.competency].score += r.evidenceScore;
      m[r.competency].types[r.evidenceType] = (m[r.competency].types[r.evidenceType] || 0) + 1;
    });
    return m;
  };
  const thisW = byCompWeek(thisWeek);
  const lastW = byCompWeek(lastWeek);

  const insights = [];
  Object.values(thisW).forEach((cw) => {
    const prev = lastW[cw.competency]?.score || 0;
    const delta = cw.score - prev;
    if (delta > 0) {
      const typeList = Object.entries(cw.types)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([t, n]) => `${n} ${EVIDENCE_TYPE_MAP[t]?.label || t}${n > 1 ? "s" : ""}`);
      insights.push({
        id: `insight_${cw.competency}`,
        type: "improvement",
        competency: cw.competency,
        direction: "up",
        headline: `Your ${cw.competency} improved this week`,
        body: `${cw.competency} grew because you ${describeTypes(cw.types)}. Keep practicing to reach mastery.`,
        evidence: Object.entries(cw.types).map(([t, n]) => ({ type: t, count: n, label: EVIDENCE_TYPE_MAP[t]?.label || t })),
      });
    }
  });

  // Plateau detection: competency with evidence last week but none this week
  Object.values(lastW).forEach((cw) => {
    if (!thisW[cw.competency] && cw.score > 0) {
      insights.push({
        id: `insight_plateau_${cw.competency}`,
        type: "plateau",
        competency: cw.competency,
        direction: "flat",
        headline: `Your ${cw.competency} has plateaued`,
        body: `You haven't practiced ${cw.competency.toLowerCase()} this week. Schedule a session to reignite growth.`,
        evidence: [],
      });
    }
  });

  // Needs more evidence: lowest-evidence competency among tracked
  const readiness = computeReadinessFromEvidence();
  const weakest = readiness.competencyBreakdown[readiness.competencyBreakdown.length - 1];
  if (weakest && weakest.count < 2) {
    insights.push({
      id: "insight_needs_evidence",
      type: "needs_evidence",
      competency: weakest.competency,
      direction: "neutral",
      headline: `${weakest.competency} needs more evidence`,
      body: `Only ${weakest.count} evidence ${weakest.count === 1 ? "item" : "items"} recorded for ${weakest.competency}. Demonstrate this competency to strengthen your readiness score.`,
      evidence: [],
    });
  }

  return insights.slice(0, 6);
}

function describeTypes(types) {
  const parts = Object.entries(types)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([t, n]) => `${n > 1 ? `${n} ` : ""}${EVIDENCE_TYPE_MAP[t]?.label || t}${n > 1 ? "s" : ""}`);
  if (parts.length === 1) return `completed ${parts[0].toLowerCase()}`;
  return `completed ${parts[0].toLowerCase()} and ${parts[1].toLowerCase()}`;
}

/**
 * Readiness Timeline — chronological evidence with competency + level + gain.
 */
export function getReadinessTimeline(limit = 50) {
  return readLedger()
    .slice()
    .reverse()
    .slice(0, limit)
    .map((r) => ({
      id: r.id,
      timestamp: r.timestamp,
      module: r.module,
      competency: r.competency,
      evidenceType: r.evidenceType,
      level: r.evidenceLevel,
      levelLabel: r.evidenceLevelLabel,
      score: r.evidenceScore,
      gain: r.readinessGain,
      source: r.source,
      outcome: r.outcome,
      validated: r.aiValidation,
    }));
}

/**
 * Dashboard Evidence Summary — the Phase 2 dashboard metrics.
 */
export function getDashboardEvidenceSummary() {
  const readiness = computeReadinessFromEvidence();
  const thisWeek = recordsSince(WEEK_MS);
  const insights = generateInsights();

  const improved = insights.filter((i) => i.type === "improvement").map((i) => i.competency);
  const strongest = insights.find((i) => i.type === "improvement");
  const needsEvidence = readiness.competencyBreakdown[readiness.competencyBreakdown.length - 1]?.competency;

  return {
    evidenceThisWeek: thisWeek.length,
    competenciesImproved: improved,
    competenciesImprovedCount: improved.length,
    strongestGrowthArea: strongest?.competency || null,
    strongestGrowthInsight: strongest?.body || null,
    needsMoreEvidence: needsEvidence || null,
    readinessConfidence: readiness.confidence,
    growthMomentum: readiness.weeklyScore - readiness.lastWeekScore,
    learningConsistency: readiness.streak,
    readinessScore: readiness.totalScore,
    components: readiness.components,
    competencyBreakdown: readiness.competencyBreakdown,
    evidenceCount: readiness.evidenceCount,
  };
}

/**
 * Map an entity record to an evidence entry (used by the sync hook).
 */
export function entityToEvidence(entityName, record) {
  const map = {
    ChallengeResult: { evidenceType: "challenge_solved", competency: "Leadership", scoreFrom: (r) => (r.score || r.total_score || 8) },
    SimulationSession: { evidenceType: "simulation_completed", competency: "Decision Quality", scoreFrom: (r) => (r.score || r.overall_score || 8) },
    JournalEntry: { evidenceType: "journal_entry", competency: "Self-awareness", scoreFrom: () => 3 },
    LessonProgress: { evidenceType: "lesson_completed", competency: "Knowledge", scoreFrom: () => 3 },
    Achievement: { evidenceType: "achievement_unlocked", competency: null, scoreFrom: () => 12 },
  };
  const m = map[entityName];
  if (!m || !record?.id) return null;
  return {
    evidenceType: m.evidenceType,
    competency: m.competency,
    score: m.scoreFrom(record),
    source: entityName,
    module: entityName,
    dedupeKey: `${entityName}_${record.id}`,
    aiValidation: true,
    outcome: "demonstrated",
  };
}
/**
 * Recommendation Effectiveness™ + Coach Effectiveness™ + Adaptive Learning
 *
 * Tracks every recommendation: shown → accepted → completed → outcome improved,
 * then computes an effectiveness score per recommendation type. Recommendations
 * producing stronger outcomes increase in priority; poor performers decrease.
 *
 * The Recommendation Engine™ evolves using observed effectiveness rather than
 * static weighting.
 */
import { ACTIVITY_LABELS } from "./outcomeAttributionEngine";

const TRACKING_KEY = "execlead_rec_tracking_v1";
const SHOWN_KEY = "execlead_rec_shown_v1";

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function writeJSON(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* ignore */ }
}

/** Record that a recommendation was presented to the user. */
export function recordRecommendationShown(recId, activityType, competency) {
  const shown = readJSON(SHOWN_KEY, {});
  shown[recId] = { activityType, competency, shownAt: Date.now() };
  writeJSON(SHOWN_KEY, shown);
}

/** Record that the user accepted (started) a recommendation. */
export function recordRecommendationAcceptance(recId, activityType, competency) {
  const tracking = readJSON(TRACKING_KEY, {});
  tracking[recId] = {
    activityType: activityType || tracking[recId]?.activityType,
    competency: competency || tracking[recId]?.competency,
    acceptedAt: Date.now(),
    completed: false,
    completedAt: null,
  };
  writeJSON(TRACKING_KEY, tracking);
}

/** Record that the user completed the recommended activity. */
export function recordRecommendationCompletion(recId) {
  const tracking = readJSON(TRACKING_KEY, {});
  if (tracking[recId]) {
    tracking[recId].completed = true;
    tracking[recId].completedAt = Date.now();
    writeJSON(TRACKING_KEY, tracking);
  }
}

export function getRecommendationTracking() {
  return readJSON(TRACKING_KEY, {});
}
export function getRecommendationShown() {
  return readJSON(SHOWN_KEY, {});
}

function gradeEffectiveness(score) {
  if (score >= 70) return { id: "high", label: "High", color: "#10b981" };
  if (score >= 45) return { id: "moderate", label: "Moderate", color: "#f59e0b" };
  if (score >= 20) return { id: "low", label: "Low", color: "#f97316" };
  return { id: "ineffective", label: "Ineffective", color: "#ef4444" };
}

/**
 * Compute Recommendation Effectiveness™ per activity type.
 * @param {Object} attributionByActivity - { activityType: { outcomes, totalGain, avgGain, avgConfidence } }
 */
export function computeRecommendationEffectiveness(attributionByActivity = {}) {
  const tracking = getRecommendationTracking();
  const shown = getRecommendationShown();

  const byType = {};
  // Shown records feed the denominator for acceptance rate.
  Object.values(shown).forEach((s) => {
    if (!s.activityType) return;
    byType[s.activityType] = byType[s.activityType] || { shown: 0, accepted: 0, completed: 0 };
    byType[s.activityType].shown += 1;
  });
  Object.values(tracking).forEach((t) => {
    if (!t.activityType) return;
    byType[t.activityType] = byType[t.activityType] || { shown: 0, accepted: 0, completed: 0 };
    byType[t.activityType].accepted += 1;
    if (t.completed) byType[t.activityType].completed += 1;
  });

  // Merge outcome attribution.
  Object.entries(attributionByActivity).forEach(([act, info]) => {
    byType[act] = byType[act] || { shown: 0, accepted: 0, completed: 0 };
    byType[act].outcomes = info.outcomes;
    byType[act].totalGain = info.totalGain;
    byType[act].avgGain = info.avgGain;
    byType[act].avgConfidence = info.avgConfidence;
  });

  const results = Object.entries(byType).map(([act, d]) => {
    const shownN = d.shown || d.accepted; // fall back to accepted if shown untracked
    const acceptanceRate = shownN ? Math.round((d.accepted / shownN) * 100) : (d.accepted ? 100 : 0);
    const completionRate = d.accepted ? Math.round((d.completed / d.accepted) * 100) : 0;
    const outcomeImprovementRate = d.completed ? Math.round(((d.outcomes || 0) / d.completed) * 100) : 0;
    // Effectiveness blends acceptance, completion, and observed outcome improvement.
    const effectivenessScore = Math.round(
      (acceptanceRate / 100) * 0.25 * 100 +
      (completionRate / 100) * 0.35 * 100 +
      (outcomeImprovementRate / 100) * 0.40 * 100
    );
    return {
      activityType: act,
      label: ACTIVITY_LABELS[act] || act,
      shown: d.shown || 0,
      accepted: d.accepted || 0,
      completed: d.completed || 0,
      outcomes: d.outcomes || 0,
      acceptanceRate,
      completionRate,
      outcomeImprovementRate,
      effectivenessScore,
      avgGain: d.avgGain || 0,
      avgConfidence: d.avgConfidence || 0,
      grade: gradeEffectiveness(effectivenessScore),
    };
  }).sort((a, b) => b.effectivenessScore - a.effectivenessScore);

  const overallScore = results.length ? Math.round(results.reduce((a, r) => a + r.effectivenessScore, 0) / results.length) : 0;

  return {
    byActivityType: results,
    overall: { effectivenessScore: overallScore, grade: gradeEffectiveness(overallScore), totalTracked: Object.keys(tracking).length },
    topPerformers: results.filter((r) => r.grade.id === "high"),
    underperformers: results.filter((r) => r.grade.id === "low" || r.grade.id === "ineffective"),
  };
}

/**
 * Coach Effectiveness™ — most effective coaching topics, exercises, scenarios,
 * highest competency growth, fastest improvement, lowest engagement.
 */
export function computeCoachEffectiveness(enrichedOutcomes = []) {
  const byTopic = {};
  const byExercise = {};
  enrichedOutcomes.forEach((o) => {
    const attr = o._attribution || null;
    if (!attr) return;
    const coachingDriver = (attr.primaryDrivers || []).find((d) => d.source === "coaching_session");
    if (!coachingDriver) return;
    const comps = o._parsedCompetencies || [];
    comps.forEach((c) => {
      byTopic[c] = byTopic[c] || { topic: c, outcomes: 0, totalGain: 0, confidences: [], firstDate: null, lastDate: null };
      byTopic[c].outcomes += 1;
      byTopic[c].totalGain += o.outcome_value || 0;
      byTopic[c].confidences.push(attr.confidence || 0);
      const d = new Date(o.outcome_date);
      if (!byTopic[c].firstDate || d < byTopic[c].firstDate) byTopic[c].firstDate = d;
      if (!byTopic[c].lastDate || d > byTopic[c].lastDate) byTopic[c].lastDate = d;
    });
    // Exercise = the outcome_type when attributed to coaching
    byExercise[o.outcome_type] = byExercise[o.outcome_type] || { exercise: o.outcome_type, outcomes: 0, totalGain: 0 };
    byExercise[o.outcome_type].outcomes += 1;
    byExercise[o.outcome_type].totalGain += o.outcome_value || 0;
  });

  const topics = Object.values(byTopic).map((t) => ({
    ...t,
    avgGain: t.outcomes ? Math.round(t.totalGain / t.outcomes) : 0,
    avgConfidence: t.confidences.length ? Math.round(t.confidences.reduce((a, b) => a + b, 0) / t.confidences.length) : 0,
    daysToOutcome: t.firstDate && t.lastDate ? Math.max(1, Math.round((t.lastDate - t.firstDate) / 86400000)) : null,
  })).sort((a, b) => b.totalGain - a.totalGain);

  const exercises = Object.values(byExercise).map((e) => ({
    ...e,
    avgGain: e.outcomes ? Math.round(e.totalGain / e.outcomes) : 0,
  })).sort((a, b) => b.totalGain - a.totalGain);

  const fastest = [...topics].filter((t) => t.daysToOutcome).sort((a, b) => a.daysToOutcome - b.daysToOutcome)[0] || null;

  return {
    byTopic: topics,
    byExercise: exercises,
    mostEffectiveTopic: topics[0] || null,
    highestGrowth: topics[0] || null,
    fastestImprovement: fastest,
    lowestEngagement: topics[topics.length - 1] || null,
  };
}

/**
 * Adaptive Recommendation Weights™ — adjust base activity weights using observed
 * effectiveness. Strong performers increase; weak performers decrease.
 */
export function getAdaptiveRecommendationWeights(baseWeights = {}) {
  const eff = computeRecommendationEffectiveness();
  const adjusted = {};
  Object.entries(baseWeights).forEach(([act, w]) => {
    const found = eff.byActivityType.find((r) => r.activityType === act);
    const factor = found ? 1 + (found.effectivenessScore / 100 - 0.5) * 0.6 : 1; // ±30%
    adjusted[act] = Math.max(0.1, Math.min(2.0, Math.round(w * factor * 1000) / 1000));
  });
  return { adjusted, effectiveness: eff };
}

export const ADAPTIVE_LEARNING_CONFIG = {
  learningRate: 0.6,
  minWeight: 0.1,
  maxWeight: 2.0,
  neutralScore: 50,
  description: "Recommendations producing stronger outcomes increase in priority; poor performers decrease.",
};
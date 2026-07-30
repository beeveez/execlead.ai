/**
 * Recommendation Intelligence™
 *
 * Continuously evaluates whether recommendations produce better leadership
 * outcomes and automatically improves future recommendations.
 *
 * Layers on top of Recommendation Effectiveness™ + Outcome Attribution:
 *  • Recommendation lifecycle (generated → presented → accepted → started →
 *    completed → outcome measured → effectiveness calculated → model updated)
 *  • Effectiveness Score™ (Excellent / Good / Average / Weak / Retire)
 *  • Model Calibration™ (predicted gain vs actual gain → accuracy, bias, drift)
 *  • Versioned models with champion / challenger + rollback
 *  • Adaptive priority — proven recommendations rise, poor ones retire
 *  • Concierge Q&A + proven-recommendation context for the Executive Coach™
 *
 * Every recommendation becomes an experiment. Every outcome becomes evidence.
 * Every user makes the platform smarter.
 */
import { ACTIVITY_LABELS } from "./outcomeAttributionEngine";

const REC_STORE_KEY = "execlead_rec_intel_v2";
const MODEL_STORE_KEY = "execlead_rec_model_v1";

const EFFECTIVENESS_GRADES = [
  { id: "excellent", label: "Excellent", color: "#10b981", min: 80 },
  { id: "good", label: "Good", color: "#84cc16", min: 60 },
  { id: "average", label: "Average", color: "#f59e0b", min: 40 },
  { id: "weak", label: "Weak", color: "#f97316", min: 20 },
  { id: "retire", label: "Retire", color: "#ef4444", min: 0 },
];

const LIFECYCLE_STAGES = [
  { id: "generated", label: "Generated" },
  { id: "presented", label: "Presented" },
  { id: "accepted", label: "Accepted" },
  { id: "started", label: "Started" },
  { id: "completed", label: "Completed" },
  { id: "outcome_measured", label: "Outcome Measured" },
  { id: "effectiveness_calculated", label: "Effectiveness Calculated" },
  { id: "model_updated", label: "Model Updated" },
];

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function writeJSON(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {
    /* ignore */
  }
}

function gradeFor(score) {
  return EFFECTIVENESS_GRADES.find((g) => score >= g.min) || EFFECTIVENESS_GRADES[EFFECTIVENESS_GRADES.length - 1];
}

function genRecId() {
  return `REC-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function getISOWeek(d) {
  const date = new Date(d.getTime());
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
  const week1 = new Date(date.getFullYear(), 0, 4);
  return (
    date.getFullYear() +
    "-W" +
    String(1 + Math.round(((date - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7)).padStart(2, "0")
  );
}

/* ============================================================
   Model Registry — versioned champion / challenger models
   ============================================================ */

function defaultModel(version) {
  return {
    version,
    createdAt: new Date().toISOString(),
    status: "champion",
    description: "Initial recommendation model",
    predictedGainByActivity: {},
  };
}

export function getModelRegistry() {
  return readJSON(MODEL_STORE_KEY, {
    activeModelVersion: "v1",
    challenger: null,
    models: { v1: defaultModel("v1") },
  });
}

export function getActiveModel() {
  const reg = getModelRegistry();
  return reg.models[reg.activeModelVersion] || Object.values(reg.models)[0] || null;
}

export function getChallengerModel() {
  const reg = getModelRegistry();
  return reg.challenger ? reg.models[reg.challenger] : null;
}

export function registerModel(version, description = "") {
  if (!version) return null;
  const reg = getModelRegistry();
  if (reg.models[version]) return null; // version must be unique
  reg.models[version] = {
    version,
    createdAt: new Date().toISOString(),
    status: "challenger",
    description,
    predictedGainByActivity: {},
  };
  reg.challenger = version;
  writeJSON(MODEL_STORE_KEY, reg);
  return reg.models[version];
}

export function promoteChallenger() {
  const reg = getModelRegistry();
  if (!reg.challenger) return null;
  if (reg.models[reg.activeModelVersion]) reg.models[reg.activeModelVersion].status = "archived";
  reg.models[reg.challenger].status = "champion";
  reg.activeModelVersion = reg.challenger;
  reg.challenger = null;
  writeJSON(MODEL_STORE_KEY, reg);
  return reg.models[reg.activeModelVersion];
}

export function rollbackTo(version) {
  const reg = getModelRegistry();
  if (!reg.models[version]) return null;
  if (reg.models[reg.activeModelVersion]) reg.models[reg.activeModelVersion].status = "archived";
  reg.models[version].status = "champion";
  reg.activeModelVersion = version;
  reg.challenger = null;
  writeJSON(MODEL_STORE_KEY, reg);
  return reg.models[version];
}

/* ============================================================
   Recommendation Records — full lifecycle
   ============================================================ */

export function getAllRecommendationRecords() {
  return readJSON(REC_STORE_KEY, []);
}

function saveRecords(records) {
  writeJSON(REC_STORE_KEY, records);
}

export function generateRecommendation({
  competency = "",
  activityType = "general",
  predictedGain = 0,
  context = "",
  priority = "medium",
  modelVersion,
} = {}) {
  const records = getAllRecommendationRecords();
  const model = getActiveModel();
  const rec = {
    recId: genRecId(),
    competency,
    activityType,
    recommendationType: activityType,
    priority,
    context,
    generatedAt: Date.now(),
    presentedAt: null,
    acceptedAt: null,
    completedAt: null,
    completionTimeMs: null,
    evidenceCreated: 0,
    outcomeId: null,
    actualGain: 0,
    predictedGain: predictedGain || model?.predictedGainByActivity?.[activityType] || 0,
    reliabilityGain: 0,
    confidenceGain: 0,
    stage: "generated",
    recVersion: records.filter((r) => r.activityType === activityType).length + 1,
    modelVersion: modelVersion || model?.version || "v1",
  };
  records.push(rec);
  saveRecords(records);
  return rec;
}

export function advanceRecommendation(recId, stage, extra = {}) {
  const records = getAllRecommendationRecords();
  const i = records.findIndex((r) => r.recId === recId);
  if (i < 0) return null;
  const r = records[i];
  const now = Date.now();
  const updates = { stage };
  if (stage === "presented") updates.presentedAt = now;
  if (stage === "accepted") updates.acceptedAt = now;
  if (stage === "completed") {
    updates.completedAt = now;
    if (r.acceptedAt) updates.completionTimeMs = now - r.acceptedAt;
  }
  if (stage === "outcome_measured") updates.outcomeMeasuredAt = now;
  Object.assign(r, updates, extra);
  records[i] = r;
  saveRecords(records);
  return r;
}

export const presentRecommendation = (id) => advanceRecommendation(id, "presented");
export const acceptRecommendation = (id) => advanceRecommendation(id, "accepted");
export const startRecommendation = (id) => advanceRecommendation(id, "started");
export const completeRecommendation = (id, extra) => advanceRecommendation(id, "completed", extra);
export const measureRecommendationOutcome = (id, extra) =>
  advanceRecommendation(id, "outcome_measured", extra);

/* ============================================================
   Calibration — predicted vs actual gain
   ============================================================ */

function calibrate(predicted, actual) {
  if (!predicted && !actual) return { accuracy: 0, bias: 0, direction: "none" };
  if (!predicted) return { accuracy: 0, bias: Math.round(actual * 10) / 10, direction: "underestimation" };
  const diff = actual - predicted;
  const ratio = Math.abs(diff) / predicted;
  const accuracy = Math.max(0, Math.round((1 - ratio) * 100));
  const direction = diff > 0.5 ? "underestimation" : diff < -0.5 ? "overestimation" : "accurate";
  return { accuracy, bias: Math.round(diff * 10) / 10, direction };
}

/* ============================================================
   Recommendation Intelligence — the orchestrator
   ============================================================ */

/**
 * @param {Object} attributionByActivity - { activityType: { outcomes, totalGain, avgConfidence } }
 *   from Outcome Attribution™ (real observed gains).
 */
export function computeRecommendationIntelligence(attributionByActivity = {}) {
  const records = getAllRecommendationRecords();
  const byType = {};

  records.forEach((r) => {
    const a = r.activityType;
    byType[a] = byType[a] || {
      activityType: a,
      generated: 0,
      presented: 0,
      accepted: 0,
      completed: 0,
      measured: 0,
      predictedSum: 0,
      actualSum: 0,
      completionTimes: [],
      competencyCounts: {},
    };
    const d = byType[a];
    d.generated += 1;
    if (r.presentedAt) d.presented += 1;
    if (r.acceptedAt) d.accepted += 1;
    if (r.completedAt) {
      d.completed += 1;
      if (r.completionTimeMs) d.completionTimes.push(r.completionTimeMs);
    }
    if (r.stage === "outcome_measured") d.measured += 1;
    d.predictedSum += r.predictedGain || 0;
    d.actualSum += r.actualGain || 0;
    if (r.competency) d.competencyCounts[r.competency] = (d.competencyCounts[r.competency] || 0) + 1;
  });

  // Merge real observed outcome gains + confidence by activity type.
  Object.entries(attributionByActivity).forEach(([act, info]) => {
    byType[act] = byType[act] || {
      activityType: act, generated: 0, presented: 0, accepted: 0, completed: 0,
      measured: 0, predictedSum: 0, actualSum: 0, completionTimes: [], competencyCounts: {},
    };
    byType[act].outcomes = info.outcomes || 0;
    byType[act].actualSum += info.totalGain || 0;
    byType[act].avgConfidence = info.avgConfidence || 0;
  });

  const results = Object.entries(byType)
    .map(([act, d]) => {
      const presented = d.presented || d.generated;
      const acceptanceRate = presented ? Math.round((d.accepted / presented) * 100) : d.accepted ? 100 : 0;
      const completionRate = d.accepted ? Math.round((d.completed / d.accepted) * 100) : 0;
      const outcomes = d.outcomes || 0;
      const outcomeImprovementRate = d.completed
        ? Math.round((outcomes / d.completed) * 100)
        : outcomes ? 100 : 0;
      const evidenceQuality = d.avgConfidence || 0;
      const avgPredicted = d.generated ? Math.round((d.predictedSum / d.generated) * 10) / 10 : 0;
      const measuredCount = d.measured + outcomes;
      const avgActual = measuredCount ? Math.round((d.actualSum / measuredCount) * 10) / 10 : 0;
      const avgCompletionMs = d.completionTimes.length
        ? Math.round(d.completionTimes.reduce((a, b) => a + b, 0) / d.completionTimes.length)
        : 0;
      // Effectiveness Score™ — acceptance, completion, outcome improvement, evidence quality.
      const effectivenessScore = Math.round(
        (acceptanceRate / 100) * 0.2 * 100 +
          (completionRate / 100) * 0.3 * 100 +
          (outcomeImprovementRate / 100) * 0.3 * 100 +
          (evidenceQuality / 100) * 0.2 * 100
      );
      const topCompetency = Object.entries(d.competencyCounts).sort((a, b) => b[1] - a[1])[0];
      const calibration = calibrate(avgPredicted, avgActual);
      return {
        activityType: act,
        label: ACTIVITY_LABELS[act] || act,
        competency: topCompetency ? topCompetency[0] : "leadership",
        generated: d.generated,
        presented: d.presented,
        accepted: d.accepted,
        completed: d.completed,
        measured: d.measured,
        outcomes,
        acceptanceRate,
        completionRate,
        outcomeImprovementRate,
        evidenceQuality,
        avgPredicted,
        avgActual,
        avgCompletionMs,
        effectivenessScore,
        grade: gradeFor(effectivenessScore),
        calibration,
      };
    })
    .sort((a, b) => b.effectivenessScore - a.effectivenessScore);

  const overall = {
    recommendationsGenerated: records.length,
    acceptanceRate: results.length ? Math.round(results.reduce((a, r) => a + r.acceptanceRate, 0) / results.length) : 0,
    completionRate: results.length ? Math.round(results.reduce((a, r) => a + r.completionRate, 0) / results.length) : 0,
    averageReadinessGain: results.length
      ? Math.round((results.reduce((a, r) => a + r.avgActual, 0) / results.length) * 10) / 10
      : 0,
    predictionAccuracy: results.length
      ? Math.round(results.reduce((a, r) => a + r.calibration.accuracy, 0) / results.length)
      : 0,
    effectivenessScore: results.length
      ? Math.round(results.reduce((a, r) => a + r.effectivenessScore, 0) / results.length)
      : 0,
    modelVersion: getActiveModel()?.version || "v1",
    challengerVersion: getChallengerModel()?.version || null,
  };

  const modelCalibration = {
    overall: overall.predictionAccuracy,
    byType: results.map((r) => ({
      activityType: r.activityType,
      label: r.label,
      avgPredicted: r.avgPredicted,
      avgActual: r.avgActual,
      accuracy: r.calibration.accuracy,
      bias: r.calibration.bias,
      direction: r.calibration.direction,
    })),
  };

  const trends = buildTrends(records);

  return {
    byActivityType: results,
    overall,
    topPerformers: results.filter((r) => r.grade.id === "excellent" || r.grade.id === "good"),
    lowestPerformers: results.filter((r) => r.grade.id === "weak" || r.grade.id === "retire"),
    retired: results.filter((r) => r.grade.id === "retire"),
    modelCalibration,
    trends,
    totalRecords: records.length,
    grades: EFFECTIVENESS_GRADES,
    lifecycle: LIFECYCLE_STAGES,
  };
}

function buildTrends(records) {
  const weeks = {};
  records.forEach((r) => {
    const week = getISOWeek(new Date(r.generatedAt));
    weeks[week] = weeks[week] || { week, generated: 0, accepted: 0, completed: 0 };
    weeks[week].generated += 1;
    if (r.acceptedAt) weeks[week].accepted += 1;
    if (r.completedAt) weeks[week].completed += 1;
  });
  return Object.values(weeks).sort((a, b) => a.week.localeCompare(b.week)).slice(-8);
}

/* ============================================================
   Adaptive Priority — proven recommendations rise, poor ones retire
   ============================================================ */

export function getAdaptivePriorities(intelligence, baseWeights = {}) {
  if (!intelligence?.byActivityType) return { adjusted: baseWeights, promotions: [], demotions: [] };
  const adjusted = {};
  const promotions = [];
  const demotions = [];
  const allActs = {
    ...baseWeights,
    ...Object.fromEntries(intelligence.byActivityType.map((r) => [r.activityType, 1])),
  };
  Object.keys(allActs).forEach((act) => {
    const found = intelligence.byActivityType.find((r) => r.activityType === act);
    const base = baseWeights[act] ?? 1;
    if (!found) {
      adjusted[act] = base;
      return;
    }
    // ±40% based on effectiveness vs neutral (50).
    const factor = 1 + (found.effectivenessScore / 100 - 0.5) * 0.8;
    const next = Math.max(0.05, Math.min(2.0, Math.round(base * factor * 1000) / 1000));
    adjusted[act] = next;
    if (found.grade.id === "excellent" || found.grade.id === "good") promotions.push({ activityType: act, label: found.label, factor });
    if (found.grade.id === "weak" || found.grade.id === "retire") demotions.push({ activityType: act, label: found.label, factor });
  });
  return { adjusted, promotions, demotions };
}

/* ============================================================
   Coach™ — proven recommendations for similar users
   ============================================================ */

export function getProvenRecommendations(intelligence) {
  if (!intelligence?.byActivityType) return [];
  return intelligence.byActivityType
    .filter((r) => r.outcomes > 0)
    .slice(0, 5)
    .map((r) => ({
      activityType: r.activityType,
      label: r.label,
      competency: r.competency,
      successRate: r.outcomeImprovementRate,
      effectivenessScore: r.effectivenessScore,
      avgGain: r.avgActual,
      narrative: `Based on your history, ${r.label} has a ${r.outcomeImprovementRate}% outcome-improvement rate for ${r.competency} (+${r.avgActual} avg readiness gain).`,
    }));
}

/**
 * Build the attributionByActivity map from Outcome Intelligence™ so the
 * Recommendation Intelligence engine can reuse real observed gains.
 */
export function attributionFromOutcomeIntelligence(outcomeIntelligence) {
  const by = outcomeIntelligence?.effectiveness?.byActivityType || [];
  const map = {};
  by.forEach((r) => {
    map[r.activityType] = {
      outcomes: r.outcomes || 0,
      totalGain: Math.round((r.avgGain || 0) * (r.outcomes || 0)),
      avgConfidence: r.avgConfidence || 0,
    };
  });
  return map;
}

/* ============================================================
   EXEC™ Concierge — recommendation questions
   ============================================================ */

function structuredAnswer(outcome, evidence, confidence, action, path) {
  const conf = confidence != null && confidence !== 0 ? `${confidence}%` : "insufficient evidence";
  const actionLine = path ? `${action} [Start →](${path})` : action;
  return `**Outcome:** ${outcome}\n\n**Supporting evidence:** ${evidence}\n\n**Attribution confidence:** ${conf}\n\n**Recommended next action:** ${actionLine}`;
}

function pathForActivity(activityType) {
  const map = {
    coaching_session: "/coach",
    simulation_completed: "/simulator",
    challenge_solved: "/challenge",
    debate_completed: "/debate",
    journal_entry: "/journal",
    lesson_completed: "/academy",
    voice_session: "/voice-interview",
    council_session: "/council",
  };
  return map[activityType] || "/recommendation-intelligence";
}

export function answerRecommendationQuestion(question, intelligence) {
  const q = (question || "").toLowerCase();
  const by = intelligence?.byActivityType || [];
  const overall = intelligence?.overall || {};
  const cal = intelligence?.modelCalibration;

  // What recommendation works best for me?
  if (q.includes("works best") || (q.includes("recommendation") && q.includes("best"))) {
    const top = by[0];
    if (!top || top.outcomes === 0)
      return structuredAnswer(
        "No recommendation has produced a measurable outcome yet.",
        "Accept and complete recommendations to learn which works best for you.",
        0,
        "Open Recommendation Intelligence to see your tracked recommendations.",
        "/recommendation-intelligence"
      );
    return structuredAnswer(
      `**${top.label}** works best for you — effectiveness **${top.effectivenessScore}/100 (${top.grade.label})**, ${top.outcomeImprovementRate}% outcome-improvement rate.`,
      `${top.accepted} accepted of ${top.generated} generated, ${top.completed} completed. Average readiness gain +${top.avgActual}.`,
      top.evidenceQuality,
      `Prioritize ${top.label} in your next coaching session.`,
      pathForActivity(top.activityType)
    );
  }

  // Which recommendation had the biggest impact?
  if (q.includes("biggest impact") || q.includes("largest impact")) {
    const top = [...by].sort((a, b) => b.avgActual - a.avgActual)[0];
    if (!top || !top.avgActual)
      return structuredAnswer(
        "No outcome impact measured yet.",
        "Complete recommended activities and record outcomes to measure impact.",
        0,
        "Record your first outcome to start measuring impact.",
        "/outcome-intelligence"
      );
    return structuredAnswer(
      `**${top.label}** produced the biggest impact — average readiness gain **+${top.avgActual}** across ${top.outcomes} outcome${top.outcomes === 1 ? "" : "s"}.`,
      `Effectiveness ${top.effectivenessScore}/100 (${top.grade.label}), outcome-improvement rate ${top.outcomeImprovementRate}%.`,
      top.evidenceQuality,
      `Repeat ${top.label} to compound this impact.`,
      pathForActivity(top.activityType)
    );
  }

  // What recommendations were ineffective?
  if (q.includes("ineffective") || q.includes("not working") || q.includes("isn't working") || q.includes("isnt working")) {
    const low = intelligence?.lowestPerformers || [];
    if (!low.length)
      return structuredAnswer(
        "No ineffective recommendations detected — every tracked recommendation is producing outcomes.",
        "All recommendations show acceptable effectiveness.",
        overall.effectivenessScore || 0,
        "Keep practicing your current recommendation mix.",
        "/recommendation-intelligence"
      );
    return structuredAnswer(
      `**${low[0].label}** is underperforming — effectiveness **${low[0].effectivenessScore}/100 (${low[0].grade.label})**.`,
      `Acceptance ${low[0].acceptanceRate}%, completion ${low[0].completionRate}%, outcome-improvement ${low[0].outcomeImprovementRate}%.`,
      low[0].evidenceQuality || 40,
      `Deprioritize ${low[0].label} and redirect effort to your top performer instead.`,
      "/recommendation-intelligence"
    );
  }

  // How accurate are my predicted gains?
  if (q.includes("predicted") || q.includes("accuracy") || q.includes("accurate") || q.includes("calibration")) {
    if (!cal || overall.predictionAccuracy === 0)
      return structuredAnswer(
        "No calibration data yet — complete recommendations with predicted gains to measure accuracy.",
        "Each completed recommendation compares its predicted gain to the actual outcome.",
        0,
        "Accept a recommendation and complete it to start calibration.",
        "/recommendation-intelligence"
      );
    const worst = [...cal.byType].sort((a, b) => a.accuracy - b.accuracy)[0];
    return structuredAnswer(
      `Your recommendation model is **${overall.predictionAccuracy}% accurate** (model ${overall.modelVersion}).`,
      cal.byType.length
        ? `Per activity: ${cal.byType.map((c) => `${c.label} ${c.accuracy}% (${c.direction})`).join("; ")}.`
        : "",
      overall.predictionAccuracy,
      worst && worst.direction === "overestimation"
        ? `${worst.label} is overestimated — expect ~${worst.avgActual} not ${worst.avgPredicted}.`
        : "Your predictions are well-calibrated; keep accepting recommendations to refine further.",
      "/recommendation-intelligence"
    );
  }

  return "I can answer: What recommendation works best for me? Which recommendation had the biggest impact? What recommendations were ineffective? How accurate are my predicted gains?";
}
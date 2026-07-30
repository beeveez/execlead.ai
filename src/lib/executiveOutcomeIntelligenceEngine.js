/**
 * Executive Outcome Intelligence™ — master orchestrator.
 *
 * Measures whether Executive Readiness correlates with real-world executive
 * growth. Answers: Is the user becoming a better leader? Which activities
 * create the biggest improvements? Which competencies predict promotions?
 * Which evidence produces lasting growth? Which recommendations are effective?
 *
 * Also provides outcome predictions, enterprise analytics, EXEC™ Concierge
 * outcome Q&A, and Executive Coach™ outcome-referenced advice.
 */
import { attributeOutcome, buildAttributionByActivity, OUTCOME_TYPES, OUTCOME_CATEGORIES } from "./outcomeAttributionEngine";
import {
  computeRecommendationEffectiveness,
  computeCoachEffectiveness,
  getAdaptiveRecommendationWeights,
} from "./recommendationEffectivenessEngine";
import { computeReadinessFromEvidence, EVIDENCE_TYPE_MAP } from "./readinessEvidenceEngine";

function parseJSON(val, fallback) {
  if (!val) return fallback;
  if (Array.isArray(val) || typeof val === "object") return val;
  try { return JSON.parse(val); } catch { return fallback; }
}
function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }
function avg(arr) { return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0; }
function unique(arr) { return Array.from(new Set(arr.filter(Boolean))); }
function groupBy(arr, keyFn) {
  return arr.reduce((acc, item) => {
    const k = typeof keyFn === "function" ? keyFn(item) : item[keyFn];
    (acc[k] = acc[k] || []).push(item);
    return acc;
  }, {});
}

const READINESS_BASE_WEIGHTS = Object.fromEntries(
  Object.keys(EVIDENCE_TYPE_MAP || {}).map((k) => [k, 1])
);

/**
 * Compute the full Outcome Intelligence picture for a user.
 */
export function computeOutcomeIntelligence(outcomes = [], readiness = null) {
  const r = readiness || computeReadinessFromEvidence();

  // Enrich each outcome with attribution + parsed fields.
  const enriched = outcomes.map((o) => {
    let attr = parseJSON(o.attribution_json, null);
    if (!attr || !attr.primaryDrivers) attr = attributeOutcome(o);
    return {
      ...o,
      _attribution: attr,
      _meta: OUTCOME_TYPES[o.outcome_type] || { label: o.outcome_type, category: o.outcome_category },
      _parsedCompetencies: parseJSON(o.competencies_json, attr.contributingCompetencies || []),
    };
  }).sort((a, b) => new Date(b.outcome_date) - new Date(a.outcome_date));

  const byCategory = groupBy(enriched, "outcome_category");
  const attributionByActivity = buildAttributionByActivity(enriched);
  const effectiveness = computeRecommendationEffectiveness(attributionByActivity);
  const coachEffectiveness = computeCoachEffectiveness(enriched);
  const mostImprovedCompetencies = computeMostImproved(enriched);
  const growthVelocity = computeGrowthVelocity(enriched);
  const predictions = predictOutcomes(r, enriched);
  const adaptiveWeights = getAdaptiveRecommendationWeights(READINESS_BASE_WEIGHTS);

  const summary = {
    totalOutcomes: enriched.length,
    careerOutcomes: (byCategory.career || []).length,
    learningOutcomes: (byCategory.learning || []).length,
    leadershipOutcomes: (byCategory.leadership || []).length,
    behaviorOutcomes: (byCategory.behavior || []).length,
    verifiedOutcomes: enriched.filter((o) => o.verified).length,
    avgAttributionConfidence: enriched.length ? Math.round(avg(enriched.map((o) => o._attribution.confidence))) : 0,
    outcomeConfidence: enriched.length ? Math.round(avg(enriched.map((o) => o._attribution.confidence))) : 0,
    executiveMomentum: computeMomentum(enriched),
    growthVelocity: growthVelocity.ratePerMonth,
    readinessScore: r?.totalScore ?? 0,
  };

  return {
    summary,
    enriched,
    byCategory,
    effectiveness,
    coachEffectiveness,
    mostImprovedCompetencies,
    growthVelocity,
    predictions,
    adaptiveWeights,
    readiness: r,
  };
}

function computeMomentum(enriched) {
  const now = Date.now();
  const last30 = enriched.filter((o) => (now - new Date(o.outcome_date).getTime()) < 30 * 86400000);
  const last90 = enriched.filter((o) => (now - new Date(o.outcome_date).getTime()) < 90 * 86400000);
  const recentGain = last30.reduce((a, o) => a + (o.outcome_value || 0), 0);
  const quarterlyGain = last90.reduce((a, o) => a + (o.outcome_value || 0), 0);
  // Momentum = recent activity volume × average gain, scaled.
  return Math.round(clamp(last30.length * 4 + recentGain * 0.5, 0, 100));
}

function computeMostImproved(enriched) {
  const byComp = {};
  enriched.forEach((o) => {
    const comps = o._parsedCompetencies || [];
    comps.forEach((c) => {
      byComp[c] = byComp[c] || { competency: c, outcomes: 0, totalGain: 0, firstDate: null, lastDate: null };
      byComp[c].outcomes += 1;
      byComp[c].totalGain += o.outcome_value || 0;
      const d = new Date(o.outcome_date);
      if (!byComp[c].firstDate || d < byComp[c].firstDate) byComp[c].firstDate = d;
      if (!byComp[c].lastDate || d > byComp[c].lastDate) byComp[c].lastDate = d;
    });
  });
  return Object.values(byComp).map((c) => ({
    ...c,
    avgGain: c.outcomes ? Math.round(c.totalGain / c.outcomes) : 0,
    daysSpan: c.firstDate && c.lastDate ? Math.max(1, Math.round((c.lastDate - c.firstDate) / 86400000)) : null,
  })).sort((a, b) => b.totalGain - a.totalGain);
}

function computeGrowthVelocity(enriched) {
  // Outcomes per month over the last 6 months.
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const count = enriched.filter((o) => {
      const d = new Date(o.outcome_date);
      return d >= start && d < end;
    }).length;
    months.push({ month: start.toLocaleString("en-US", { month: "short" }), count });
  }
  const ratePerMonth = months.reduce((a, m) => a + m.count, 0) / Math.max(1, months.filter((m) => m.count > 0).length || 1);
  const trend = months[months.length - 1].count - (months[0].count || 0);
  return { months, ratePerMonth: Math.round(ratePerMonth * 10) / 10, trend };
}

/**
 * Outcome Prediction™ — predict likely future outcomes from readiness +
 * competency alignment + historical base rates.
 */
export function predictOutcomes(readiness, enriched = []) {
  const r = readiness || computeReadinessFromEvidence();
  const totalScore = r?.totalScore ?? 0;
  const competencyMap = {};
  (r?.competencyBreakdown || []).forEach((c) => { competencyMap[c.competency] = c.score; });

  // Historical base rate: outcomes of this type per month.
  const now = Date.now();
  const byType = {};
  enriched.forEach((o) => {
    if ((now - new Date(o.outcome_date).getTime()) < 180 * 86400000) {
      byType[o.outcome_type] = (byType[o.outcome_type] || 0) + 1;
    }
  });

  const predictable = Object.entries(OUTCOME_TYPES).filter(([, m]) => m.predictable);
  return predictable.map(([type, meta]) => {
    const compAlignment = meta.primaryCompetencies.length
      ? avg(meta.primaryCompetencies.map((c) => competencyMap[c] ?? 50))
      : totalScore;
    const baseRate = (byType[type] || 0) / 6; // per month over 6mo window
    const baseRateFactor = clamp(baseRate * 20, 0, 30); // scale base rate into a 0-30 contribution
    const probability = clamp(
      Math.round(baseRateFactor + (totalScore / 100) * 45 + (compAlignment / 100) * 25),
      0, 100
    );
    const expectedTimeline = probability > 70 ? "0–3 months" : probability > 45 ? "3–6 months" : probability > 25 ? "6–12 months" : "12+ months";
    return {
      outcomeType: type,
      label: meta.label,
      category: meta.category,
      probability,
      expectedTimeline,
      confidence: clamp(Math.round((totalScore / 100) * 50 + (compAlignment / 100) * 50), 0, 100),
      drivers: meta.primaryCompetencies,
      baseRate: Math.round(baseRate * 100) / 100,
    };
  }).sort((a, b) => b.probability - a.probability);
}

/**
 * EXEC™ Concierge — outcome questions.
 *
 * Answers natural questions with a structured, evidence-backed response:
 * Outcome · Supporting evidence · Attribution confidence · Recommended next action.
 */

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
  return map[activityType] || "/outcome-intelligence";
}

export function answerOutcomeQuestion(question, intelligence) {
  const q = (question || "").toLowerCase();
  const enriched = intelligence?.enriched || [];
  const improved = intelligence?.mostImprovedCompetencies || [];
  const eff = intelligence?.effectiveness;
  const coach = intelligence?.coachEffectiveness;
  const readiness = intelligence?.readiness;
  const now = Date.now();
  const recent = enriched.filter((o) => now - new Date(o.outcome_date).getTime() < 30 * 86400000);
  const recentGain = recent.reduce((a, o) => a + (o.outcome_value || 0), 0);

  const recentDrivers = {};
  recent.forEach((o) =>
    (o._attribution?.primaryDrivers || []).forEach((d) => {
      recentDrivers[d.label] = (recentDrivers[d.label] || 0) + 1;
    })
  );
  const topRecentDrivers = Object.entries(recentDrivers).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k, v]) => `${k} (${v})`).join(", ");
  const recentConf = recent.length ? Math.round(avg(recent.map((o) => o._attribution?.confidence || 0))) : 0;
  const recentEvidence = recent.reduce((a, o) => a + (o._attribution?.evidenceCount || 0), 0);

  // Q: Why did my Executive Readiness improve this month?
  if (q.includes("readiness") && (q.includes("improve") || q.includes("improved") || q.includes("grow") || q.includes("why"))) {
    const score = readiness?.totalScore ?? 0;
    const nextAct = (eff?.byActivityType || []).find((r) => r.grade.id === "high");
    return structuredAnswer(
      `Your Executive Readiness is now **${score}/100**. This month you recorded **${recent.length} outcome${recent.length === 1 ? "" : "s"}** contributing **+${recentGain}** in demonstrated growth.`,
      recent.length ? `Recent outcomes driven by: ${topRecentDrivers || "baseline engagement"}, backed by ${recentEvidence} evidence item${recentEvidence === 1 ? "" : "s"}.` : "No outcomes recorded this month yet — complete a simulation, challenge, or coaching session to generate evidence.",
      recentConf,
      nextAct ? `Repeat **${nextAct.label}** — your highest-effectiveness activity (${nextAct.effectivenessScore}/100).` : "Run an Executive Simulation to generate your first outcome evidence this month.",
      nextAct ? pathForActivity(nextAct.activityType) : "/simulator"
    );
  }

  // Q: Which coaching sessions helped me most?
  if (q.includes("coaching") || q.includes("sessions helped")) {
    const t = coach?.mostEffectiveTopic;
    const coachingOutcomes = enriched.filter((o) => (o._attribution?.primaryDrivers || []).some((d) => d.source === "coaching_session"));
    if (!t) return structuredAnswer(
      "No coaching-linked outcomes recorded yet.",
      "Complete coaching sessions and record leadership outcomes to measure their impact.",
      0,
      "Open the Executive Coach and complete a session to start measuring coaching effectiveness.",
      "/coach"
    );
    return structuredAnswer(
      `Coaching produced the strongest results in **${t.topic}** — **+${t.totalGain}** across **${t.outcomes} outcome${t.outcomes === 1 ? "" : "s"}**.`,
      `${coachingOutcomes.length} outcome${coachingOutcomes.length === 1 ? "" : "s"} attributed to Executive Coaching, backed by ${coachingOutcomes.reduce((a, o) => a + (o._attribution?.evidenceCount || 0), 0)} evidence item${coachingOutcomes.reduce((a, o) => a + (o._attribution?.evidenceCount || 0), 0) === 1 ? "" : "s"}.`,
      t.avgConfidence,
      `Continue coaching on **${t.topic}** — book your next session to compound these gains.`,
      "/coach"
    );
  }

  // Q: What recommendation produced the biggest improvement?
  if (q.includes("biggest") || (q.includes("recommendation") && (q.includes("improve") || q.includes("produce")))) {
    const top = (eff?.byActivityType || []).find((r) => r.outcomes > 0);
    if (!top) return structuredAnswer(
      "No recommendation has produced a recorded improvement yet.",
      "Accept and complete Next Best Evidence™ recommendations, then record the outcome to measure their impact.",
      0,
      "Open Outcome Intelligence and accept your top recommendation.",
      "/outcome-intelligence"
    );
    return structuredAnswer(
      `**${top.label}** produced the biggest improvement — **${top.outcomes} outcome${top.outcomes === 1 ? "" : "s"}**, average gain **+${top.avgGain}**, effectiveness **${top.effectivenessScore}/100 (${top.grade.label})**.`,
      `Outcome improvement rate: ${top.outcomeImprovementRate}%. Completion rate: ${top.completionRate}%.`,
      top.avgConfidence,
      `Repeat **${top.label}** to sustain this improvement.`,
      pathForActivity(top.activityType)
    );
  }

  // Q: Which competency is improving fastest?
  if (q.includes("fastest") || q.includes("improving fastest") || q.includes("competency is improving")) {
    const f = coach?.fastestImprovement || improved.find((c) => c.daysSpan);
    if (!f) return structuredAnswer(
      "Not enough outcome history yet to identify the fastest-improving competency.",
      "Record outcomes across multiple dates to measure improvement velocity.",
      0,
      "Record your first outcome to start measuring velocity.",
      "/outcome-intelligence"
    );
    const compName = f.competency || f.topic;
    const compOutcomes = enriched.filter((o) => (o._parsedCompetencies || []).includes(compName));
    const span = f.daysSpan || f.daysToOutcome;
    return structuredAnswer(
      `**${compName}** is improving fastest — **${f.outcomes} outcome${f.outcomes === 1 ? "" : "s"}** over **${span} day${span === 1 ? "" : "s"}**, total gain **+${f.totalGain}**.`,
      `${compOutcomes.length} outcome${compOutcomes.length === 1 ? "" : "s"} touch this competency, backed by ${compOutcomes.reduce((a, o) => a + (o._attribution?.evidenceCount || 0), 0)} evidence item${compOutcomes.length === 1 ? "" : "s"}.`,
      compOutcomes.length ? Math.round(avg(compOutcomes.map((o) => o._attribution?.confidence || 0))) : 0,
      `Double down on **${compName}** — it's your fastest growth area.`,
      "/coach"
    );
  }

  // Q: What should I repeat?
  if (q.includes("should i repeat") || q.includes("what should i repeat") || q.includes("what should repeat")) {
    const top = (eff?.byActivityType || []).filter((r) => r.grade.id === "high");
    if (!top.length) return structuredAnswer(
      "No high-effectiveness activity identified yet.",
      "Complete activities and record outcomes to learn what's worth repeating.",
      0,
      "Run an Executive Simulation — it consistently produces strong evidence.",
      "/simulator"
    );
    return structuredAnswer(
      `Repeat **${top[0].label}** — highest effectiveness at **${top[0].effectivenessScore}/100** with **${top[0].outcomeImprovementRate}%** outcome improvement.`,
      top.length > 1 ? `Also effective: ${top.slice(1).map((t) => t.label).join(", ")}. Backed by ${top[0].outcomes} attributed outcome${top[0].outcomes === 1 ? "" : "s"}.` : `Backed by ${top[0].outcomes} attributed outcome${top[0].outcomes === 1 ? "" : "s"}.`,
      top[0].avgConfidence || 70,
      `Go to ${top[0].label} now and run a session.`,
      pathForActivity(top[0].activityType)
    );
  }

  // Q: Which recommendation isn't working?
  if (q.includes("ineffective") || q.includes("not working") || q.includes("isn't working") || q.includes("isnt working") || q.includes("isn't") || q.includes("isnt") || q.includes("poor")) {
    const low = eff?.underperformers || [];
    if (!low.length) return structuredAnswer(
      "No ineffective recommendations detected — every tracked activity is producing outcomes.",
      "All tracked recommendations show acceptable effectiveness.",
      eff?.overall?.effectivenessScore || 0,
      "Keep practicing your current mix; revisit if a recommendation stalls.",
      "/outcome-intelligence"
    );
    return structuredAnswer(
      `**${low[0].label}** is underperforming — effectiveness **${low[0].effectivenessScore}/100 (${low[0].grade.label})**, outcome improvement **${low[0].outcomeImprovementRate}%**.`,
      `Completion rate: ${low[0].completionRate}%. Accepted: ${low[0].accepted}.`,
      low[0].avgConfidence || 40,
      `Deprioritize ${low[0].label} and redirect effort to your highest-effectiveness activity instead.`,
      "/outcome-intelligence"
    );
  }

  return "I can answer: Why did my readiness improve? Which coaching sessions helped most? What recommendation produced the biggest improvement? Which competency is improving fastest? What should I repeat? Which recommendation isn't working?";
}

/**
 * Executive Coach™ — outcome-referenced advice.
 */
export function generateOutcomeCoachAdvice(intelligence) {
  const advice = [];
  const enriched = intelligence?.enriched || [];
  const improved = intelligence?.mostImprovedCompetencies || [];
  const eff = intelligence?.effectiveness;

  // Reference specific outcomes by competency.
  const byComp = {};
  enriched.forEach((o) => {
    (o._parsedCompetencies || []).forEach((c) => {
      byComp[c] = byComp[c] || [];
      byComp[c].push(o);
    });
  });
  Object.entries(byComp).slice(0, 3).forEach(([comp, list]) => {
    const gain = list.reduce((a, o) => a + (o.outcome_value || 0), 0);
    const topDriver = list[0]?._attribution?.primaryDrivers?.[0];
    if (topDriver) {
      advice.push({
        type: "outcome_evidence",
        competency: comp,
        text: `Your ${list.length} recent ${topDriver.label.toLowerCase()} ${list.length === 1 ? "session" : "sessions"} produced +${gain} in ${comp}.`,
      });
    }
  });

  // Reflection streak → Executive Presence.
  const reflectionOutcomes = enriched.filter((o) => o.outcome_type === "reflection_consistency");
  if (reflectionOutcomes.length >= 2) {
    advice.push({
      type: "streak_impact",
      text: `Your recent reflection streak has significantly improved Executive Presence and self-awareness.`,
    });
  }

  // Strongest gains.
  if (improved[0]) {
    advice.push({
      type: "strongest_gains",
      text: `${improved[0].competency} has produced your strongest leadership gains (+${improved[0].totalGain} across ${improved[0].outcomes} outcomes).`,
    });
  }

  // Repeat most effective.
  const topEff = (eff?.byActivityType || []).filter((r) => r.grade.id === "high");
  if (topEff[0]) {
    advice.push({
      type: "repeat",
      text: `${topEff[0].label} shows the highest effectiveness (${topEff[0].effectivenessScore}/100). Repeat this to compound your gains.`,
    });
  }

  return advice;
}

/**
 * Enterprise Outcome Analytics™ — aggregate outcomes across an organization.
 */
export function getEnterpriseOutcomeAnalytics(outcomes = []) {
  const enriched = outcomes.map((o) => {
    let attr = parseJSON(o.attribution_json, null);
    if (!attr || !attr.primaryDrivers) attr = attributeOutcome(o);
    return { ...o, _attribution: attr, _parsedCompetencies: parseJSON(o.competencies_json, attr.contributingCompetencies || []) };
  });

  const byDepartment = groupBy(enriched, (o) => o.department || "Unassigned");
  const byCompetency = {};
  enriched.forEach((o) => (o._parsedCompetencies || []).forEach((c) => {
    byCompetency[c] = byCompetency[c] || { competency: c, outcomes: 0, totalGain: 0 };
    byCompetency[c].outcomes += 1;
    byCompetency[c].totalGain += o.outcome_value || 0;
  }));
  const byOutcomeType = groupBy(enriched, "outcome_type");

  const promotionPipeline = (byOutcomeType.promotion || []).length;
  const leadershipOutcomes = (groupBy(enriched, "outcome_category").leadership || []).length;

  // High-potential employees: most outcomes + highest total gain.
  const byUser = groupBy(enriched, (o) => o.user_id);
  const highPotential = Object.entries(byUser).map(([uid, list]) => ({
    userId: uid,
    userName: list[0]?.user_name,
    outcomes: list.length,
    totalGain: list.reduce((a, o) => a + (o.outcome_value || 0), 0),
  })).sort((a, b) => b.totalGain - a.totalGain).slice(0, 10);

  const deptReadiness = Object.entries(byDepartment).map(([dept, list]) => ({
    department: dept,
    outcomes: list.length,
    leadershipOutcomes: list.filter((o) => o.outcome_category === "leadership").length,
    promotions: list.filter((o) => o.outcome_type === "promotion").length,
    avgGain: list.length ? Math.round(list.reduce((a, o) => a + (o.outcome_value || 0), 0) / list.length) : 0,
  })).sort((a, b) => b.leadershipOutcomes - a.leadershipOutcomes);

  const competencyGrowth = Object.values(byCompetency).map((c) => ({
    ...c,
    avgGain: c.outcomes ? Math.round(c.totalGain / c.outcomes) : 0,
  })).sort((a, b) => b.totalGain - a.totalGain);

  return {
    byDepartment: deptReadiness,
    byCompetency: competencyGrowth,
    byOutcomeType: Object.fromEntries(Object.entries(byOutcomeType).map(([k, v]) => [k, v.length])),
    highPotentialEmployees: highPotential,
    promotionPipeline,
    leadershipOutcomeCount: leadershipOutcomes,
    successionReadiness: Math.round(clamp(leadershipOutcomes * 5 + promotionPipeline * 10, 0, 100)),
    totalOutcomes: enriched.length,
    recommendationEffectiveness: computeRecommendationEffectiveness(buildAttributionByActivity(enriched)),
  };
}
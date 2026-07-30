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
 */
export function answerOutcomeQuestion(question, intelligence) {
  const q = (question || "").toLowerCase();
  const eff = intelligence?.effectiveness;
  const coach = intelligence?.coachEffectiveness;
  const improved = intelligence?.mostImprovedCompetencies || [];

  if (q.includes("help") || q.includes("most") && q.includes("activ")) {
    const top = (eff?.byActivityType || []).slice(0, 3);
    if (!top.length) return "Complete a few activities and record outcomes to see which helped you most.";
    return `Your most effective activities: ${top.map((t) => `${t.label} (${t.effectivenessScore}/100, ${t.grade.label})`).join(", ")}.`;
  }
  if (q.includes("coaching") || q.includes("session")) {
    const t = coach?.mostEffectiveTopic;
    if (!t) return "No coaching-linked outcomes yet. Complete coaching sessions and record leadership outcomes to measure impact.";
    return `Coaching produced the strongest results in ${t.topic} (+${t.totalGain} across ${t.outcomes} outcome${t.outcomes === 1 ? "" : "s"}, ${t.avgConfidence}% confidence).`;
  }
  if (q.includes("fastest") || q.includes("improved fastest")) {
    const f = coach?.fastestImprovement || improved.find((c) => c.daysSpan);
    if (!f) return "Not enough outcome history yet to identify the fastest-improving competency.";
    return `${f.competency || f.topic} improved fastest — ${f.outcomes} outcome${f.outcomes === 1 ? "" : "s"} over ${f.daysSpan || f.daysToOutcome} day${(f.daysSpan || f.daysToOutcome) === 1 ? "" : "s"}.`;
  }
  if (q.includes("repeat") || q.includes("should i")) {
    const top = (eff?.byActivityType || []).filter((r) => r.grade.id === "high");
    if (!top.length) return "Keep practicing simulations and reflections — once outcomes are recorded, I'll pinpoint what to repeat.";
    return `Repeat: ${top.map((t) => t.label).join(", ")}. These show the highest outcome improvement rate.`;
  }
  if (q.includes("ineffective") || q.includes("not working") || q.includes("poor")) {
    const low = eff?.underperformers || [];
    if (!low.length) return "No ineffective recommendations detected yet — every tracked activity is producing outcomes.";
    return `Underperforming: ${low.map((t) => `${t.label} (${t.effectivenessScore}/100)`).join(", ")}. Consider deprioritizing these.`;
  }
  return "I can answer: What activities helped me most? Which coaching sessions produced results? Which competency improved fastest? What should I repeat? What recommendations were ineffective?";
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
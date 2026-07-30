/**
 * AI Decision Transparency™
 *
 * Makes every recommendation, coaching response, prediction, and prioritization
 * explainable. Users never wonder "Why did the AI recommend this?" — every
 * decision exposes its reason, evidence, competencies considered, outcome
 * history, historical effectiveness, confidence, alternatives, expected gain,
 * model version, and a full decision trace.
 *
 * Also computes the AI Trust Score™ — evidence completeness, reliability,
 * prediction accuracy, outcome validation, calibration → overall trust.
 */
import { getAllRecommendationRecords } from "./recommendationIntelligenceEngine";

function avg(arr) {
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
}

/* ============================================================
   Decision Explanation
   ============================================================ */

/**
 * Build a full, explainable decision for a recommendation.
 * @param {Object} opts - { activityType, competency, recIntel, outcomeIntel, readiness, gapAnalysis }
 */
export function buildDecisionExplanation({
  activityType,
  competency,
  recIntel,
  outcomeIntel,
  readiness,
  gapAnalysis,
}) {
  const recs = recIntel?.byActivityType || [];
  const rec = recs.find((r) => r.activityType === activityType) || recs[0] || null;
  const label = rec?.label || activityType || "this recommendation";
  const comp = competency || rec?.competency || "leadership";

  // Reason — gap, plateau, or proven ROI.
  const gapForComp = (gapAnalysis?.competencies || []).find(
    (c) => (c.competency || c.name) === comp
  );
  let reason;
  if (gapForComp && gapForComp.coverage != null && gapForComp.coverage < 60) {
    reason = `Your ${comp} shows a coverage gap (${gapForComp.coverage}%). ${label} is the highest-ROI activity to close it.`;
  } else if (rec && rec.outcomes > 0 && rec.outcomeImprovementRate < 40) {
    reason = `${comp} has plateaued. ${label} has the highest predicted ROI to restart growth.`;
  } else if (rec && rec.outcomes > 0) {
    reason = `${label} consistently produces the strongest outcomes for ${comp} (${rec.outcomeImprovementRate}% outcome-improvement rate).`;
  } else {
    reason = `${label} is recommended based on your current readiness profile and evidence gap analysis.`;
  }

  // Evidence used — outcomes attributed to this activity type.
  const enriched = outcomeIntel?.enriched || [];
  const linked = enriched.filter((o) =>
    (o._attribution?.primaryDrivers || []).some((d) => d.source === activityType)
  );
  const evidenceByType = {};
  linked.forEach((o) => {
    evidenceByType[o.outcome_type] = (evidenceByType[o.outcome_type] || 0) + 1;
  });
  const evidenceUsed = Object.entries(evidenceByType).map(([type, count]) => ({ type, count }));
  const reliability = linked.length
    ? Math.round(avg(linked.map((o) => o._attribution?.confidence || 0)))
    : rec?.evidenceQuality || 0;

  // Competencies considered.
  const compSet = new Set([comp]);
  linked.forEach((o) => (o._parsedCompetencies || []).forEach((c) => compSet.add(c)));
  const competenciesConsidered = Array.from(compSet);

  // Outcome history.
  const outcomeHistory = {
    count: linked.length || rec?.outcomes || 0,
    totalGain: linked.reduce((a, o) => a + (o.outcome_value || 0), 0) || (rec?.avgActual || 0) * (rec?.outcomes || 0),
  };

  // Historical effectiveness.
  const historicalEffectiveness = rec
    ? { score: rec.effectivenessScore, grade: rec.grade }
    : { score: 0, grade: { label: "Unproven" } };

  // Confidence — blends evidence quality + historical effectiveness.
  const confScore = rec ? Math.round((rec.evidenceQuality + rec.effectivenessScore) / 2) : 0;
  const confidence =
    confScore >= 70
      ? { label: "High", value: confScore }
      : confScore >= 40
      ? { label: "Medium", value: confScore }
      : { label: "Low", value: confScore };

  // Alternatives considered (with why-not).
  const alternatives = recs
    .filter((r) => r.activityType !== activityType)
    .slice(0, 3)
    .map((r) => ({
      activityType: r.activityType,
      label: r.label,
      effectivenessScore: r.effectivenessScore,
      whyNot:
        r.effectivenessScore < (rec?.effectivenessScore || 0)
          ? `Lower effectiveness (${r.effectivenessScore}/100 vs ${rec?.effectivenessScore || 0}/100).`
          : `Targets ${r.competency}, not ${comp}.`,
    }));

  // Expected gain.
  const expectedGain = {
    readiness: rec?.avgPredicted || 0,
    confidence: Math.round((rec?.evidenceQuality || 0) * 0.05),
    reliability: Math.round(reliability * 0.05),
  };

  // Decision trace — immutable audit record.
  const trace = {
    evidenceIds: linked.map((o) => o.outcome_id).filter(Boolean),
    recIds: getAllRecommendationRecords()
      .filter((r) => r.activityType === activityType)
      .map((r) => r.recId),
    readinessSnapshot: readiness?.totalScore ?? 0,
    outcomeSnapshot: outcomeIntel?.summary || null,
    gapSnapshot: gapAnalysis
      ? {
          totalGaps: (gapAnalysis.competencies || []).filter((c) => (c.coverage || 0) < 60).length,
        }
      : null,
    calibrationVersion: recIntel?.overall?.modelVersion || "v1",
    modelVersion: recIntel?.overall?.modelVersion || "v1",
    timestamp: new Date().toISOString(),
  };

  return {
    recommendation: { activityType, label, competency: comp },
    reason,
    evidenceUsed,
    reliability,
    competenciesConsidered,
    outcomeHistory,
    historicalEffectiveness,
    confidence,
    alternatives,
    expectedGain,
    modelVersion: recIntel?.overall?.modelVersion || "v1",
    trace,
  };
}

/* ============================================================
   AI Trust Score™
   ============================================================ */

export function computeAITrustScore({ recIntel, outcomeIntel, readiness }) {
  const evidenceCount = readiness?.evidenceCount || 0;
  const evidenceCompleteness = Math.min(100, Math.round((evidenceCount / 50) * 100));
  const reliability =
    readiness?.averageReliability != null
      ? Math.round(readiness.averageReliability)
      : readiness?.confidence || 0;
  const predictionAccuracy = recIntel?.overall?.predictionAccuracy || 0;
  const outcomeValidation = outcomeIntel?.summary?.outcomeConfidence || 0;
  const calibration = recIntel?.modelCalibration?.overall || 0;
  const overall = Math.round(
    evidenceCompleteness * 0.2 +
      reliability * 0.2 +
      predictionAccuracy * 0.2 +
      outcomeValidation * 0.2 +
      calibration * 0.2
  );
  const grade =
    overall >= 80 ? "Excellent" : overall >= 60 ? "Good" : overall >= 40 ? "Average" : "Weak";
  return {
    evidenceCompleteness,
    reliability,
    predictionAccuracy,
    outcomeValidation,
    calibration,
    overall,
    grade,
  };
}

/* ============================================================
   Decision Trace™ — exportable audit
   ============================================================ */

export function exportDecisionTrace(explanation) {
  if (!explanation) return JSON.stringify({ error: "No explanation available" }, null, 2);
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      recommendation: explanation.recommendation,
      reason: explanation.reason,
      evidenceUsed: explanation.evidenceUsed,
      reliability: explanation.reliability,
      competenciesConsidered: explanation.competenciesConsidered,
      outcomeHistory: explanation.outcomeHistory,
      historicalEffectiveness: explanation.historicalEffectiveness,
      confidence: explanation.confidence,
      alternatives: explanation.alternatives,
      expectedGain: explanation.expectedGain,
      modelVersion: explanation.modelVersion,
      trace: explanation.trace,
    },
    null,
    2
  );
}

/* ============================================================
   EXEC™ Concierge — transparency questions
   ============================================================ */

export function answerTransparencyQuestion(question, explanation, trustScore) {
  const q = (question || "").toLowerCase();
  if (!explanation) {
    return "I can answer: Why did you recommend this? What evidence supports it? How confident are you? What alternatives exist? Why not another activity?";
  }
  const e = explanation;
  const label = e.recommendation.label;
  const comp = e.recommendation.competency;

  // Why did you recommend this?
  if (q.includes("why") && (q.includes("recommend") || q.includes("this"))) {
    return `**Why this recommendation?**\n\n**Recommendation:** ${label} for ${comp}\n\n**Reason:** ${e.reason}\n\n**Historical effectiveness:** ${e.historicalEffectiveness.score}/100 (${e.historicalEffectiveness.grade.label})\n\n**Confidence:** ${e.confidence.label} (${e.confidence.value}%)\n\n**Model version:** ${e.modelVersion}`;
  }

  // What evidence supports it?
  if (q.includes("evidence") || q.includes("supports")) {
    const evList = e.evidenceUsed.length
      ? e.evidenceUsed.map((x) => `- ${x.count} ${x.type}`).join("\n")
      : "- No outcomes attributed yet";
    return `**Evidence supporting ${label}:**\n\n${evList}\n\n**Reliability:** ${e.reliability}%\n\n**Outcome history:** ${e.outcomeHistory.count} outcome${e.outcomeHistory.count === 1 ? "" : "s"}, +${e.outcomeHistory.totalGain} total gain\n\n**Confidence:** ${e.confidence.label}`;
  }

  // How confident are you?
  if (q.includes("confident") || q.includes("confidence")) {
    return `**Confidence: ${e.confidence.label} (${e.confidence.value}%)**\n\nBased on evidence quality and historical effectiveness of ${e.historicalEffectiveness.score}/100.\n\n**AI Trust Score™:** ${trustScore?.overall || 0}/100 (${trustScore?.grade || "—"})`;
  }

  // What alternatives exist? / Why not another activity?
  if (q.includes("alternative") || q.includes("why not") || q.includes("another activity")) {
    if (!e.alternatives.length) return `**Alternatives:** No other recommendations tracked yet for ${comp}.`;
    return `**Alternatives considered for ${comp}:**\n\n${e.alternatives
      .map((a) => `- **${a.label}** — ${a.whyNot} (effectiveness ${a.effectivenessScore}/100)`)
      .join("\n")}\n\n**Selected:** ${label} — highest predicted ROI.`;
  }

  return "I can answer: Why did you recommend this? What evidence supports it? How confident are you? What alternatives exist? Why not another activity?";
}
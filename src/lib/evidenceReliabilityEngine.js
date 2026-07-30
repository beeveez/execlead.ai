/**
 * EXECLEAD.AI — Evidence Reliability Index™ (ERI) Engine
 * =======================================================
 * Measures the trustworthiness of every piece of evidence.
 *
 * Executive Readiness = f(Contribution × Confidence × Reliability)
 *
 * Not all evidence is created equal. A passed simulation carries
 * greater evidentiary weight than a self-assessment. This engine
 * computes a per-evidence Reliability Score from 12 factors, assigns
 * a reliability grade, and produces the weighted contribution that
 * feeds the readiness total.
 *
 * Reliability is versioned (ERI Model Version). Historical evidence
 * keeps its original ERI version — never overwritten.
 */
import {
  ERI_MODEL_VERSION,
  getRegistryEntry,
  getBaseReliability,
  gradeReliability,
  RELIABILITY_FACTORS,
} from "./evidenceReliabilityRegistry";

/**
 * Compute the Reliability Score for an evidence record.
 *
 * @param {Object} ctx — context derived from the evidence input + record
 *   { evidenceType, evidenceLevel, aiValidation, evidenceOrigin,
 *     validationMethod, difficulty, repeatedCount, verified,
 *     humanVerified, enterpriseVerified, aiConfidence, timestamp,
 *     competency, streak }
 * @returns {{ score, grade, factors, reason, modelVersion }}
 */
export function computeReliability(ctx = {}) {
  const entry = getRegistryEntry(ctx.evidenceType);
  const base = entry.baseReliability;
  const factors = {};
  let delta = 0;
  const reasons = [];

  // 1. Evidence Source — authoritative sources hold weight
  const sourceAdjust = ctx.evidenceLevel === "mastery" ? 0
    : ctx.evidenceLevel === "demonstrated" ? 0
    : ctx.evidenceOrigin === "User Generated" ? -4 : 0;
  factors.evidenceSource = { value: ctx.evidenceOrigin || "System Generated", adjustment: sourceAdjust };
  delta += sourceAdjust;

  // 2. Validation Method — AI/system verified boosts; unverified penalized
  const vmAdjust = ctx.aiValidation ? +3 : ctx.validationMethod === "User Submitted" ? -5 : 0;
  factors.validationMethod = { value: ctx.validationMethod || "System Generated", adjustment: vmAdjust };
  delta += vmAdjust;
  if (ctx.aiValidation) reasons.push("AI validated");

  // 3. Evidence Origin
  const originAdjust = ctx.evidenceOrigin === "AI Generated" ? +1 : ctx.evidenceOrigin === "User Generated" ? -3 : 0;
  factors.evidenceOrigin = { value: ctx.evidenceOrigin || "System Generated", adjustment: originAdjust };
  delta += originAdjust;

  // 4. Assessment Difficulty — harder demonstrations are more reliable
  const difficulty = ctx.difficulty || (ctx.evidenceLevel === "mastery" ? "high" : ctx.evidenceLevel === "demonstrated" ? "medium" : "low");
  const diffAdjust = difficulty === "high" ? +3 : difficulty === "medium" ? +1 : 0;
  factors.assessmentDifficulty = { value: difficulty, adjustment: diffAdjust };
  delta += diffAdjust;

  // 5. Recency — fresh evidence is more reliable (computed at record time → recent)
  const ageDays = ctx.timestamp ? (Date.now() - ctx.timestamp) / (1000 * 60 * 60 * 24) : 0;
  let recencyAdjust = +3;
  if (ageDays > 90) recencyAdjust = -6;
  else if (ageDays > 30) recencyAdjust = -2;
  else if (ageDays > 7) recencyAdjust = +1;
  factors.recency = { value: ageDays < 1 ? "today" : `${Math.round(ageDays)}d ago`, adjustment: recencyAdjust };
  delta += recencyAdjust;

  // 6. Repeatability — repeated behavior strengthens reliability
  const repeatCount = ctx.repeatedCount || 0;
  const repeatAdjust = repeatCount >= 5 ? +5 : repeatCount >= 3 ? +3 : repeatCount >= 2 ? +1 : 0;
  factors.repeatability = { value: `${repeatCount}×`, adjustment: repeatAdjust };
  delta += repeatAdjust;
  if (repeatCount >= 3) reasons.push(`Repeated across ${repeatCount} instances`);

  // 7. Consistency — sustained streak
  const streak = ctx.streak || 0;
  const consistencyAdjust = streak >= 14 ? +3 : streak >= 7 ? +2 : 0;
  factors.consistency = { value: `${streak}d streak`, adjustment: consistencyAdjust };
  delta += consistencyAdjust;

  // 8. Verification Status
  const verified = ctx.verified ?? ctx.aiValidation ?? false;
  const verifyAdjust = verified ? +2 : -4;
  factors.verificationStatus = { value: verified ? "Verified" : "Unverified", adjustment: verifyAdjust };
  delta += verifyAdjust;

  // 9. AI Confidence
  const aiConf = ctx.aiConfidence ?? null;
  const aiConfAdjust = aiConf === null ? 0 : aiConf >= 0.8 ? +2 : aiConf >= 0.5 ? +1 : -2;
  factors.aiConfidence = { value: aiConf === null ? "n/a" : `${Math.round(aiConf * 100)}%`, adjustment: aiConfAdjust };
  delta += aiConfAdjust;

  // 10. Human Verification
  const humanAdj = ctx.humanVerified ? +5 : 0;
  factors.humanVerification = { value: ctx.humanVerified ? "Human-verified" : "Not human-verified", adjustment: humanAdj };
  delta += humanAdj;
  if (ctx.humanVerified) reasons.push("Confirmed by reviewer");

  // 11. Enterprise Verification
  const entAdj = ctx.enterpriseVerified ? +5 : 0;
  factors.enterpriseVerification = { value: ctx.enterpriseVerified ? "Enterprise-verified" : "Not enterprise-verified", adjustment: entAdj };
  delta += entAdj;
  if (ctx.enterpriseVerified) reasons.push("Enterprise verified");

  // 12. Historical Accuracy — placeholder for future model
  factors.historicalAccuracy = { value: "baseline", adjustment: 0 };

  const score = Math.max(0, Math.min(100, Math.round(base + delta)));
  const grade = gradeReliability(score);

  // Build reason from registry label + top positive factors
  if (reasons.length === 0) {
    if (ctx.aiValidation) reasons.push("AI validated");
    if (ctx.evidenceLevel === "mastery") reasons.push("Sustained mastery");
    if (ctx.evidenceLevel === "demonstrated") reasons.push("Demonstrated competency");
  }
  const reason = reasons.length > 0 ? `${entry.label}: ${reasons.join(", ")}` : `${entry.label}: base reliability ${base}`;

  return {
    score,
    grade: { id: grade.id, label: grade.label, color: grade.color },
    factors,
    reason,
    modelVersion: ERI_MODEL_VERSION,
  };
}

/**
 * Normalize a reliability score (0-100) to a 0-1 multiplier.
 */
export function normalizeReliability(score) {
  return Math.max(0, Math.min(1, (score || 0) / 100));
}

/**
 * Compute the Weighted Contribution:
 *   Weighted = Contribution × Confidence × Reliability
 *
 * @param {number} contribution — raw readiness contribution (e.g. 2.4)
 * @param {number} confidence — 0-1
 * @param {number} reliabilityScore — 0-100
 */
export function computeWeightedContribution(contribution, confidence, reliabilityScore) {
  const reliability = normalizeReliability(reliabilityScore);
  return Math.round(contribution * confidence * reliability * 100) / 100;
}

/**
 * Aggregate Evidence Quality metrics for the Evidence Quality Dashboard™.
 *
 * Returns average reliability, grade distribution, breakdowns by
 * source / validation method / workspace, and a weekly reliability trend.
 */
export function getEvidenceQualityMetrics(records = []) {
  if (!records.length) {
    return {
      averageReliability: 0,
      distribution: { authoritative: 0, highly_reliable: 0, reliable: 0, moderate: 0, low: 0 },
      bySource: [],
      byValidationMethod: [],
      byWorkspace: [],
      trend: [],
      totalEvidence: 0,
    };
  }

  const scored = records.filter((r) => typeof r.reliabilityScore === "number");
  const safeScored = scored.length ? scored : records; // fallback: compute on the fly if not stored

  const scoredWithFallback = records.map((r) => ({
    ...r,
    reliabilityScore: typeof r.reliabilityScore === "number" ? r.reliabilityScore : getBaseReliability(r.evidenceType),
    reliabilityGradeId: r.reliabilityGrade?.id || gradeReliability(typeof r.reliabilityScore === "number" ? r.reliabilityScore : getBaseReliability(r.evidenceType)).id,
  }));

  const sum = scoredWithFallback.reduce((a, r) => a + r.reliabilityScore, 0);
  const averageReliability = Math.round(sum / records.length);

  // Grade distribution
  const distribution = { authoritative: 0, highly_reliable: 0, reliable: 0, moderate: 0, low: 0 };
  scoredWithFallback.forEach((r) => {
    if (distribution[r.reliabilityGradeId] !== undefined) distribution[r.reliabilityGradeId] += 1;
  });

  // By source
  const sourceMap = {};
  scoredWithFallback.forEach((r) => {
    const key = r.source || r.sourceModule || "Platform";
    if (!sourceMap[key]) sourceMap[key] = { source: key, count: 0, totalReliability: 0 };
    sourceMap[key].count += 1;
    sourceMap[key].totalReliability += r.reliabilityScore;
  });
  const bySource = Object.values(sourceMap)
    .map((s) => ({ source: s.source, count: s.count, averageReliability: Math.round(s.totalReliability / s.count) }))
    .sort((a, b) => b.count - a.count);

  // By validation method
  const vmMap = {};
  scoredWithFallback.forEach((r) => {
    const key = r.validationMethod || "System Generated";
    if (!vmMap[key]) vmMap[key] = { method: key, count: 0, totalReliability: 0 };
    vmMap[key].count += 1;
    vmMap[key].totalReliability += r.reliabilityScore;
  });
  const byValidationMethod = Object.values(vmMap)
    .map((m) => ({ method: m.method, count: m.count, averageReliability: Math.round(m.totalReliability / m.count) }))
    .sort((a, b) => b.count - a.count);

  // By workspace
  const wsMap = {};
  scoredWithFallback.forEach((r) => {
    const key = r.workspace || r.sourceWorkspace || "executive";
    if (!wsMap[key]) wsMap[key] = { workspace: key, count: 0, totalReliability: 0 };
    wsMap[key].count += 1;
    wsMap[key].totalReliability += r.reliabilityScore;
  });
  const byWorkspace = Object.values(wsMap)
    .map((w) => ({ workspace: w.workspace, count: w.count, averageReliability: Math.round(w.totalReliability / w.count) }))
    .sort((a, b) => b.count - a.count);

  // Weekly trend (last 8 weeks)
  const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
  const trend = [];
  for (let w = 7; w >= 0; w--) {
    const start = Date.now() - (w + 1) * WEEK_MS;
    const end = Date.now() - w * WEEK_MS;
    const weekRecords = scoredWithFallback.filter((r) => r.timestamp >= start && r.timestamp < end);
    const avg = weekRecords.length ? Math.round(weekRecords.reduce((a, r) => a + r.reliabilityScore, 0) / weekRecords.length) : 0;
    trend.push({ week: w, averageReliability: avg, count: weekRecords.length });
  }

  return { averageReliability, distribution, bySource, byValidationMethod, byWorkspace, trend, totalEvidence: records.length };
}

/**
 * Compute reliability metrics for a single competency.
 * Returns score, evidence count, average reliability, confidence.
 */
export function getCompetencyReliability(records = [], competency) {
  const compRecords = records.filter((r) => {
    if (r.competency === competency) return true;
    if (r.competenciesImpacted && Array.isArray(r.competenciesImpacted)) return r.competenciesImpacted.includes(competency);
    return false;
  });
  if (!compRecords.length) return null;

  const scored = compRecords.map((r) => ({
    ...r,
    reliabilityScore: typeof r.reliabilityScore === "number" ? r.reliabilityScore : getBaseReliability(r.evidenceType),
  }));
  const averageReliability = Math.round(scored.reduce((a, r) => a + r.reliabilityScore, 0) / scored.length);
  const averageConfidence = Math.round((scored.reduce((a, r) => a + (r.confidence || 0.5), 0) / scored.length) * 100);
  const totalScore = Math.min(100, scored.reduce((a, r) => a + (r.evidenceScore || 0), 0));
  const lastUpdated = scored[0]?.timestamp || 0;

  return {
    competency,
    score: totalScore,
    evidenceCount: scored.length,
    averageReliability,
    averageReliabilityGrade: gradeReliability(averageReliability),
    confidence: averageConfidence,
    lastUpdated,
    supportingEvidence: scored.slice(0, 8).map((r) => ({
      evidenceType: r.evidenceType,
      label: getRegistryEntry(r.evidenceType).label,
      reliabilityScore: r.reliabilityScore,
      grade: gradeReliability(r.reliabilityScore),
      source: r.source,
      timestamp: r.timestamp,
    })),
  };
}

/**
 * Answer EXEC™ reliability questions.
 * Returns structured answers the EXEC™ assistant can surface.
 */
export function answerReliabilityQuestions(records = [], competencies = []) {
  if (!records.length) {
    return {
      strongestCompetency: null,
      leastReliableEvidence: null,
      mostReliableActivities: [],
      qualityImprovementTips: ["Complete an executive simulation to produce authoritative evidence."],
    };
  }

  // Strongest competency by average reliability
  const compReliabilities = competencies
    .map((c) => getCompetencyReliability(records, c))
    .filter(Boolean)
    .sort((a, b) => b.averageReliability - a.averageReliability);
  const strongestCompetency = compReliabilities[0] || null;

  // Least reliable evidence item
  const scored = records.map((r) => ({
    ...r,
    reliabilityScore: typeof r.reliabilityScore === "number" ? r.reliabilityScore : getBaseReliability(r.evidenceType),
  }));
  const leastReliableEvidence = scored.sort((a, b) => a.reliabilityScore - b.reliabilityScore)[0] || null;

  // Most reliable activities (by evidence type average)
  const typeMap = {};
  scored.forEach((r) => {
    if (!typeMap[r.evidenceType]) typeMap[r.evidenceType] = { evidenceType: r.evidenceType, label: getRegistryEntry(r.evidenceType).label, count: 0, total: 0 };
    typeMap[r.evidenceType].count += 1;
    typeMap[r.evidenceType].total += r.reliabilityScore;
  });
  const mostReliableActivities = Object.values(typeMap)
    .map((t) => ({ ...t, averageReliability: Math.round(t.total / t.count) }))
    .sort((a, b) => b.averageReliability - a.averageReliability)
    .slice(0, 5);

  // Quality improvement tips
  const qualityImprovementTips = [];
  const lowReliabilityCount = scored.filter((r) => r.reliabilityScore < 50).length;
  if (lowReliabilityCount > 0) {
    qualityImprovementTips.push(`${lowReliabilityCount} evidence items have low reliability — demonstrate competency through simulations or assessments to strengthen them.`);
  }
  if (strongestCompetency) {
    const weakest = compReliabilities[compReliabilities.length - 1];
    if (weakest && weakest.averageReliability < strongestCompetency.averageReliability) {
      qualityImprovementTips.push(`Your ${weakest.competency} evidence is less reliable (${weakest.averageReliability}) than ${strongestCompetency.competency} (${strongestCompetency.averageReliability}). Complete a simulation or assessment to strengthen it.`);
    }
  }

  return { strongestCompetency, leastReliableEvidence, mostReliableActivities, qualityImprovementTips };
}
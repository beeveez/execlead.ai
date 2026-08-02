import { SIM_COMPETENCY_FRAMEWORK } from "@/lib/simulationIntelligenceEngine";
import { getProvenanceTimeline } from "@/lib/readinessEvidenceProvenance";
import { FORECAST_VERSION } from "@/lib/promotionForecastEngine";

// ============================================================
// Executive Trust Layer™ — Trust Object v2 (Platform Standard v1.0)
// ============================================================
// Canonical explainability shape consumed by <ExecutiveTrustLayer />.
// Every Executive Intelligence artifact normalizes into this object so the
// platform renders one consistent trust experience across all surfaces.
//
// Fields: methodology · model · modelVersion · evidenceSources ·
// evidenceWeights · confidence · coverage · reliability ·
// evidenceProvenance · topContributors · missingEvidence · recentChanges ·
// growthDrivers · trend · aiExplanation · recommendedActions · lastUpdated

const CONFIDENCE_MAP = { High: 88, Medium: 68, Developing: 45, Low: 30 };

const DEFAULT_TRUST = {
  artifactName: "Executive Intelligence",
  methodology: "—",
  model: "—",
  modelVersion: "—",
  evidenceSources: [],
  evidenceWeights: [],
  confidence: 0,
  coverage: { percent: 0, covered: 0, total: 12 },
  reliability: 0,
  evidenceProvenance: [],
  topContributors: [],
  missingEvidence: [],
  recentChanges: [],
  growthDrivers: [],
  trend: { direction: "stable", value: 0, label: "—" },
  aiExplanation: "",
  recommendedActions: [],
  lastUpdated: null,
};

export function normalizeTrust(partial) {
  const p = partial || {};
  return {
    ...DEFAULT_TRUST,
    ...p,
    coverage: { ...DEFAULT_TRUST.coverage, ...(p.coverage || {}) },
    trend: { ...DEFAULT_TRUST.trend, ...(p.trend || {}) },
  };
}

function deriveTrendFromItems(items) {
  const now = Date.now();
  const d30 = 30 * 86400000, d60 = 60 * 86400000;
  const ts = (it) => new Date(it.collectionTimestamp || it.timestamp || 0).getTime();
  const recent = items.filter((it) => { const t = ts(it); return t >= now - d30 && t <= now; }).length;
  const prev = items.filter((it) => { const t = ts(it); return t >= now - d60 && t < now - d30; }).length;
  if (recent > prev * 1.15) return { direction: "up", value: recent - prev, label: `${recent} recent evidence` };
  if (prev > 0 && recent < prev * 0.85) return { direction: "down", value: prev - recent, label: `${recent} recent evidence` };
  return { direction: "stable", value: recent, label: `${recent} recent evidence` };
}

function safeParseArr(str) {
  try { const v = JSON.parse(str); return Array.isArray(v) ? v : []; } catch { return []; }
}

// ── Executive Readiness™ ──
export function buildReadinessTrust(explanation, readiness) {
  if (!explanation) return null;
  const sm = explanation.scoringModel || {};
  const comps = explanation.competencyExplanations || [];
  const total = SIM_COMPETENCY_FRAMEWORK.length || 12;
  const coveragePct = Math.min(100, Math.round((comps.length / total) * 100));
  const confidence = readiness?.confidence
    ? CONFIDENCE_MAP[readiness.confidence] ?? 70
    : explanation.evidenceUsed
      ? Math.max(30, 100 - Math.round((explanation.lowConfidenceEvidence.length / Math.max(1, explanation.evidenceUsed)) * 100))
      : 0;

  const allItems = comps.flatMap((c) => (c.items || []).map((it) => ({ competency: c.competency, ...it })));
  const byTime = (a, b) => new Date(b.collectionTimestamp || b.timestamp || 0) - new Date(a.collectionTimestamp || a.timestamp || 0);
  const recentChanges = allItems.slice().sort(byTime).slice(0, 5).map((it) => ({
    label: `${it.sourceModule || it.module || "Evidence"} · ${it.competency || "—"}`,
    delta: `+${it.readinessContribution || 0}`,
    at: it.collectionTimestamp || it.timestamp,
  }));

  const topContributors = comps.slice().sort((a, b) => (b.readinessContribution || 0) - (a.readinessContribution || 0)).slice(0, 5)
    .map((c) => ({ label: c.competency, contribution: Math.round((c.readinessContribution || 0) * 10) / 10, evidenceCount: c.evidenceCount }));

  const coveredNames = new Set(comps.map((c) => c.competency));
  const missingEvidence = SIM_COMPETENCY_FRAMEWORK.filter((c) => !coveredNames.has(c.name)).map((c) => c.name);

  const lvl = explanation.evidenceByLevel || {};
  const evidenceSources = [
    { label: "Demonstrated", count: lvl.demonstrated || 0, weight: sm.weights?.competencyDemonstration },
    { label: "Mastery", count: lvl.mastery || 0 },
    { label: "Participation", count: lvl.participation || 0, weight: sm.weights?.participation },
    { label: "Exposure", count: lvl.exposure || 0, weight: sm.weights?.exposure },
    { label: "AI-Evaluated", count: explanation.aiEvidenceCount || 0 },
  ].filter((s) => s.count > 0);

  const evidenceWeights = sm.weights ? Object.entries(sm.weights).map(([label, weight]) => ({ label, weight })) : [];
  const lastUpdated = allItems.length ? allItems.slice().sort(byTime)[0].collectionTimestamp : null;
  const recommendedActions = (readiness?.recommendations || []).map((r) => ({ label: r.label, path: r.path, impact: r.gain ? `+${r.gain}%` : null }));
  const aiExplanation = `Score computed by ${sm.id || "Executive Readiness Model"} using ${explanation.evidenceUsed || 0} evidence items across ${comps.length}/${total} competencies. Demonstrated competency weighted highest (${Math.round((sm.weights?.competencyDemonstration || 0.3) * 100)}%). Confidence ${confidence}% reflects evidence breadth and reliability (ERI ${explanation.averageReliability || 0}%).`;

  return normalizeTrust({
    artifactName: "Executive Readiness™",
    methodology: "Evidence Composition Model",
    model: sm.id || "Executive Readiness Model v1.0",
    modelVersion: sm.version || "v1.0",
    evidenceSources,
    evidenceWeights,
    confidence,
    coverage: { percent: coveragePct, covered: comps.length, total },
    reliability: explanation.averageReliability || 0,
    evidenceProvenance: recentChanges.map((c) => ({ label: c.label, detail: c.delta, at: c.at })),
    topContributors,
    missingEvidence,
    recentChanges,
    growthDrivers: topContributors.slice(0, 3).map((c) => ({ label: c.label, detail: `${c.evidenceCount} evidence · +${c.contribution} readiness` })),
    trend: deriveTrendFromItems(allItems),
    aiExplanation,
    recommendedActions,
    lastUpdated,
  });
}

// ── Promotion Forecast™ ──
export function buildPromotionForecastTrust(forecast) {
  if (!forecast) return null;
  const components = forecast.component_scores || {};
  const dimensions = forecast.dimensions || [];
  const covered = dimensions.filter((d) => (d.current || 0) > 0).length;
  const total = dimensions.length || 15;
  const coveragePct = Math.min(100, Math.round((covered / total) * 100));
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  const evidenceSources = Object.entries(components).map(([label, c]) => ({ label: cap(label), count: c.score, weight: c.weight }));
  const evidenceWeights = Object.entries(components).map(([label, c]) => ({ label, weight: c.weight }));
  const topContributors = (forecast.strengths || []).slice(0, 5).map((s) => ({ label: s.label, contribution: s.score, evidenceCount: 0 }));
  const missingEvidence = (forecast.skill_gaps || []).slice(0, 6).map((g) => g.label);
  const momentum = forecast.momentum || "stable";
  const trendDir = momentum === "increasing" ? "up" : momentum === "declining" ? "down" : "stable";
  const recommendedActions = (forecast.improvement_priorities || []).map((p) => ({ label: p.action, path: p.path || "/academy", impact: `+${p.impact}%` }));
  const aiExplanation = `Forecast predicts ${forecast.target_level || "executive"} readiness at ${forecast.readiness_score || 0}% with ${forecast.probability_score || 0}% promotion probability. Model weights leadership (25%), learning (15%), evidence (15%), trust (10%), decisions (10%), interview (10%), resume (5%), journey (5%), actions (5%). Timeline: ${forecast.timeline_label || "—"}. Confidence ${forecast.confidence_score || 0}% based on data-source breadth.`;

  return normalizeTrust({
    artifactName: "Promotion Forecast™",
    methodology: "Multi-Signal Promotion Probability Model",
    model: "Promotion Forecast Engine™",
    modelVersion: FORECAST_VERSION || "1.0",
    evidenceSources,
    evidenceWeights,
    confidence: forecast.confidence_score || 0,
    coverage: { percent: coveragePct, covered, total },
    reliability: forecast.confidence_score || 0,
    evidenceProvenance: Object.entries(components).map(([label, c]) => ({ label: cap(label), detail: `${c.score}/100 · ${Math.round((c.weight || 0) * 100)}% weight`, at: forecast.created_date })),
    topContributors,
    missingEvidence,
    recentChanges: (forecast.improvement_priorities || []).slice(0, 5).map((p) => ({ label: p.action, delta: `+${p.impact}%`, at: forecast.created_date })),
    growthDrivers: [
      { label: "Career Momentum", detail: momentum },
      ...(forecast.strengths || []).slice(0, 2).map((s) => ({ label: s.label, detail: `${s.score}% strength` })),
    ],
    trend: { direction: trendDir, value: forecast.probability_score || 0, label: `${momentum} momentum` },
    aiExplanation,
    recommendedActions,
    lastUpdated: forecast.created_date || new Date().toISOString(),
  });
}

// ── Leadership DNA™ ──
export function buildLeadershipDNATrust(dna, competencies, stats, explanation) {
  if (!dna) return null;
  const comps = competencies || [];
  const covered = comps.filter((c) => (c.score || 0) > 0).length;
  const total = comps.length || 8;
  const coveragePct = Math.min(100, Math.round((covered / total) * 100));
  const totalEvidence = (stats?.challenges || 0) + (stats?.simulations || 0) + (stats?.lessonsCompleted || 0) + (stats?.journalEntries || 0);
  const confidence = Math.min(100, 30 + Math.round(totalEvidence * 1.2));
  const reliability = explanation?.averageReliability || 70;

  const evidenceSources = [
    { label: "Challenges", count: stats?.challenges || 0 },
    { label: "Simulations", count: stats?.simulations || 0 },
    { label: "Lessons", count: stats?.lessonsCompleted || 0 },
    { label: "Journal", count: stats?.journalEntries || 0 },
  ].filter((s) => s.count > 0);

  const topContributors = comps.slice().sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 5).map((c) => ({ label: c.competency, contribution: c.score || 0, evidenceCount: 0 }));
  const strengths = safeParseArr(dna.strengths_json);
  const weaknesses = safeParseArr(dna.weaknesses_json);
  const missingEvidence = weaknesses.length ? weaknesses : comps.filter((c) => (c.score || 0) < 40).map((c) => c.competency);

  const recommendedActions = (weaknesses.length ? weaknesses : ["Strengthen growth areas"]).slice(0, 4).map((w) => ({ label: `Strengthen ${w}`, path: "/coach" }));
  recommendedActions.push({ label: "Complete Executive Simulation™", path: "/simulator" });

  const aiExplanation = `Leadership DNA derived from ${totalEvidence} observed activities across ${comps.length} competencies. Archetype "${dna.leadership_archetype || "—"}" with executive readiness ${dna.executive_readiness_score || 0}/100. Confidence ${confidence}% from activity volume; reliability ${reliability}% from evidence quality. Strengths: ${strengths.slice(0, 3).join(", ") || "emerging"}.`;

  return normalizeTrust({
    artifactName: "Leadership DNA™",
    methodology: "Competency Observation Model",
    model: "Leadership DNA Engine™",
    modelVersion: "1.0",
    evidenceSources,
    evidenceWeights: [],
    confidence,
    coverage: { percent: coveragePct, covered, total },
    reliability,
    evidenceProvenance: comps.map((c) => ({ label: c.competency, detail: `${c.score || 0}/100`, at: dna.created_date })),
    topContributors,
    missingEvidence,
    recentChanges: (explanation?.competencyExplanations || []).slice(0, 5).flatMap((c) => (c.items || []).slice(0, 1).map((it) => ({ label: c.competency, delta: `+${it.readinessContribution || 0}`, at: it.collectionTimestamp || it.timestamp }))),
    growthDrivers: strengths.slice(0, 3).map((s) => ({ label: s, detail: "Observed strength" })),
    trend: { direction: (stats?.streak || 0) > 0 ? "up" : "stable", value: stats?.xp || 0, label: `${stats?.streak || 0} day streak` },
    aiExplanation,
    recommendedActions,
    lastUpdated: dna.created_date || dna.updated_date || new Date().toISOString(),
  });
}

// ── Executive Coach™ ──
export function buildCoachTrust({ coachingFocus, intelligence } = {}) {
  const sum = intelligence?.summary || {};
  const improved = intelligence?.mostImprovedCompetencies || [];
  if (!sum.totalOutcomes && !coachingFocus) return null;

  const confidence = sum.outcomeConfidence || 60;
  const momentum = sum.executiveMomentum || 50;
  const total = SIM_COMPETENCY_FRAMEWORK.length || 12;
  const covered = improved.length;
  const coveragePct = Math.min(100, Math.round((covered / total) * 100));

  const evidenceSources = [
    { label: "Executive Outcomes", count: sum.totalOutcomes || 0 },
    { label: "Improved Competencies", count: improved.length },
  ].filter((s) => s.count > 0);

  const focusAreas = coachingFocus?.focusAreas || coachingFocus?.gaps || (Array.isArray(coachingFocus) ? coachingFocus : []);
  const missingEvidence = Array.isArray(focusAreas) ? focusAreas.slice(0, 6) : [];

  const rawRecs = coachingFocus?.recommendations || coachingFocus?.nextActions || (Array.isArray(coachingFocus) ? coachingFocus : []);
  const recommendedActions = (Array.isArray(rawRecs) ? rawRecs : []).slice(0, 4).map((r) => ({
    label: typeof r === "string" ? r : (r.label || r.action || r.text || "Continue coaching"),
    path: r.path || "/coach",
  }));
  if (!recommendedActions.length) recommendedActions.push({ label: "Start a coaching session", path: "/coach" });

  const trendDir = momentum >= 65 ? "up" : momentum <= 40 ? "down" : "stable";
  const aiExplanation = `Coaching recommendations are grounded in ${sum.totalOutcomes || 0} observed executive outcomes. Outcome Confidence ${confidence}% · Executive Momentum ${momentum}/100. Recommendations cite the competencies that improved most and the activities proven to drive growth for this profile.`;

  return normalizeTrust({
    artifactName: "Executive Coach™",
    methodology: "Evidence-Grounded Coaching Model",
    model: "Executive Coach™",
    modelVersion: "1.0",
    evidenceSources,
    evidenceWeights: [],
    confidence,
    coverage: { percent: coveragePct, covered, total },
    reliability: momentum,
    evidenceProvenance: improved.slice(0, 5).map((c) => ({ label: c.competency, detail: `+${c.totalGain} across ${c.outcomes} outcome${c.outcomes === 1 ? "" : "s"}`, at: null })),
    topContributors: improved.slice(0, 5).map((c) => ({ label: c.competency, contribution: c.totalGain, evidenceCount: c.outcomes })),
    missingEvidence,
    recentChanges: improved.slice(0, 5).map((c) => ({ label: c.competency, delta: `+${c.totalGain}`, at: null })),
    growthDrivers: improved.slice(0, 3).map((c) => ({ label: c.competency, detail: `+${c.totalGain} from ${c.outcomes} outcome${c.outcomes === 1 ? "" : "s"}` })),
    trend: { direction: trendDir, value: momentum, label: `${momentum}/100 momentum` },
    aiExplanation,
    recommendedActions,
    lastUpdated: new Date().toISOString(),
  });
}

// ============================================================
// Executive Trust Timeline™ — reusable timeline builder
// ============================================================
export function buildReadinessTimeline(limit = 40) {
  try {
    const steps = getProvenanceTimeline(limit);
    return steps.map((s) => ({
      type: mapStepType(s.step),
      label: s.step,
      detail: s.detail,
      at: s.timestamp,
      module: s.module,
      evidenceId: s.evidenceId,
    }));
  } catch {
    return [];
  }
}

function mapStepType(step) {
  if (!step) return "evidence_added";
  if (step.includes("Readiness")) return "score_change";
  if (step.includes("Evidence Created")) return "evidence_added";
  if (step.includes("Competency")) return "competency_strengthened";
  if (step.includes("Confidence")) return "confidence_change";
  if (step.includes("Validation")) return "reliability_change";
  if (step.includes("AI")) return "evidence_added";
  return "evidence_added";
}
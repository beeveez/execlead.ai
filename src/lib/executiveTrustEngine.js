import { SIM_COMPETENCY_FRAMEWORK } from "@/lib/simulationIntelligenceEngine";

// Executive Trust Layer™ — maps an artifact's underlying evidence into a
// standardized explainability shape consumed by <ExecutiveTrustLayer />.
// Every intelligence artifact answers: How generated · Evidence sources ·
// Confidence · Coverage · Reliability · Recent changes · Top contributors ·
// Missing evidence · Next action.

const CONFIDENCE_MAP = { High: 88, Medium: 68, Developing: 45, Low: 30 };

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

  // Recent changes — most recent evidence items across competencies.
  const allItems = comps.flatMap((c) => (c.items || []).map((it) => ({ competency: c.competency, ...it })));
  const recentChanges = allItems
    .slice()
    .sort((a, b) => new Date(b.collectionTimestamp || b.timestamp || 0) - new Date(a.collectionTimestamp || a.timestamp || 0))
    .slice(0, 5)
    .map((it) => ({
      label: `${it.sourceModule || it.module || "Evidence"} · ${it.competency || "—"}`,
      delta: `+${it.readinessContribution || 0}`,
      at: it.collectionTimestamp || it.timestamp,
    }));

  const topContributors = comps
    .slice()
    .sort((a, b) => (b.readinessContribution || 0) - (a.readinessContribution || 0))
    .slice(0, 5)
    .map((c) => ({ label: c.competency, contribution: Math.round((c.readinessContribution || 0) * 10) / 10, evidenceCount: c.evidenceCount }));

  const coveredNames = new Set(comps.map((c) => c.competency));
  const missingEvidence = SIM_COMPETENCY_FRAMEWORK
    .filter((c) => !coveredNames.has(c.name))
    .map((c) => c.name);

  const lvl = explanation.evidenceByLevel || {};
  const evidenceSources = [
    { label: "Demonstrated", count: lvl.demonstrated || 0, weight: sm.weights?.competencyDemonstration },
    { label: "Mastery", count: lvl.mastery || 0 },
    { label: "Participation", count: lvl.participation || 0, weight: sm.weights?.participation },
    { label: "Exposure", count: lvl.exposure || 0, weight: sm.weights?.exposure },
    { label: "AI-Evaluated", count: explanation.aiEvidenceCount || 0 },
  ].filter((s) => s.count > 0);

  const nextAction = readiness?.recommendations?.[0]
    ? { label: readiness.recommendations[0].label, path: readiness.recommendations[0].path }
    : { label: "Complete an Executive Simulation™", path: "/simulator" };

  return {
    artifactName: "Executive Readiness™",
    howGenerated: {
      method: "Evidence Composition Model",
      model: sm.id || "Executive Readiness Model v1.0",
      version: sm.version || "v1.0",
      description: sm.description || "Demonstrated competency weighted highest; activity-only signals weighted low.",
    },
    evidenceSources,
    confidence,
    coverage: { percent: coveragePct, covered: comps.length, total },
    reliability: explanation.averageReliability || 0,
    recentChanges,
    topContributors,
    missingEvidence,
    nextAction,
  };
}
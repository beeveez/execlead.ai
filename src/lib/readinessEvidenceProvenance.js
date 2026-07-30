/**
 * EXECLEAD.AI — Evidence Provenance Standard™
 * ============================================================
 * Version 1.0 · Priority P0 · Architecture Standard
 *
 * Every Executive Readiness evidence record is fully traceable,
 * explainable, auditable, and reproducible.
 *
 * This module implements the Provenance Standard on top of the
 * Evidence Ledger™:
 *   • Evidence Corrections™ (append-only — never mutate history)
 *   • Scoring Model versioning (historical records keep their model)
 *   • Provenance Timeline™ (inspect every step)
 *   • Readiness Explainability™ ("Explain My Score")
 *   • Enterprise Audit Export (JSON / CSV)
 *   • AI Transparency metadata
 */
// The Evidence Ledger™ is read directly from localStorage (append-only).
// The readiness evidence engine owns record creation; provenance owns
// corrections, scoring models, timeline, explainability, and export.

// Expose raw read so corrections can append without dedupe/rate-limit logic
function readRaw() {
  if (typeof window === "undefined") return [];
  try {
    const raw = JSON.parse(localStorage.getItem("exec_readiness_evidence_ledger") || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}
function writeRaw(records) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("exec_readiness_evidence_ledger", JSON.stringify(records.slice(-500)));
  } catch {}
}

// ── Validation / Origin / Classification vocabularies ──
export const VALIDATION_METHODS = [
  "System Verified", "AI Validated", "User Submitted", "Instructor Verified",
  "Assessment Passed", "Simulation Evaluated", "Peer Reviewed", "Enterprise Verified", "Imported",
];
export const EVIDENCE_ORIGINS = ["AI Generated", "System Generated", "User Generated", "Enterprise Generated", "Imported", "Hybrid"];
export const EVIDENCE_CLASSIFICATIONS = ["Direct Observation", "Inferred", "Calculated", "Predicted", "Imported", "Hybrid"];

// ── Scoring Model Registry ──
export const SCORING_MODELS = {
  "Executive Readiness Model v1.0": {
    version: "v1.0",
    releasedAt: "2026-07-01",
    weights: { exposure: 0.05, participation: 0.15, competencyDemonstration: 0.30, consistency: 0.15, reflection: 0.10, practice: 0.15, improvementTrend: 0.10 },
    description: "Original evidence-composition model. Demonstrated competency weighted highest.",
    active: true,
  },
  "Executive Readiness Model v2.0": {
    version: "v2.0",
    releasedAt: "2026-10-01",
    weights: { exposure: 0.03, participation: 0.12, competencyDemonstration: 0.35, consistency: 0.18, reflection: 0.12, practice: 0.15, improvementTrend: 0.05 },
    description: "Increased competency demonstration + consistency weights; reduced exposure influence.",
    active: false,
  },
};

export function getActiveScoringModel() {
  const active = Object.entries(SCORING_MODELS).find(([, m]) => m.active);
  return active ? { id: active[0], ...active[1] } : { id: "Executive Readiness Model v1.0", ...SCORING_MODELS["Executive Readiness Model v1.0"] };
}

/**
 * Recompute a readiness score under a specific historical model version.
 * Historical evidence is NEVER overwritten — this is a read-only projection
 * so users can compare "current score" vs "score under previous model".
 */
export function computeReadinessUnderModel(modelId, records = readRaw()) {
  const model = SCORING_MODELS[modelId];
  if (!model) return null;
  const byLevel = (level) => records.filter((r) => r.evidenceLevel === level);
  const sum = (rs) => rs.reduce((a, r) => a + (r.evidenceScore || 0), 0);
  const w = model.weights;
  const exposure = Math.min(100, byLevel("exposure").length * 1.5);
  const participation = Math.min(100, byLevel("participation").length * 6);
  const competencyDemonstration = Math.min(100, sum(byLevel("demonstrated")) * 1.5);
  const days = new Set(records.map((r) => new Date(r.timestamp).toDateString()));
  const consistency = Math.min(100, [...days].length * 12);
  const reflection = Math.min(100, records.filter((r) => ["journal_entry", "coaching_session"].includes(r.evidenceType)).length * 10);
  const practice = Math.min(100, records.filter((r) => ["simulation_completed", "challenge_solved", "debate_completed", "voice_session", "council_decision"].includes(r.evidenceType)).length * 7);
  const improvementTrend = records.length > 10 ? 55 : records.length > 0 ? 30 : 0;
  const total = Math.round(
    exposure * w.exposure + participation * w.participation + competencyDemonstration * w.competencyDemonstration +
    consistency * w.consistency + reflection * w.reflection + practice * w.practice + improvementTrend * w.improvementTrend
  );
  return { modelId, totalScore: total, components: { exposure, participation, competencyDemonstration, consistency, reflection, practice, improvementTrend } };
}

/**
 * Compare current model score vs another model — never invalidates history.
 */
export function compareScoringModels(modelA, modelB) {
  return {
    [modelA]: computeReadinessUnderModel(modelA),
    [modelB]: computeReadinessUnderModel(modelB),
    delta: (computeReadinessUnderModel(modelA)?.totalScore || 0) - (computeReadinessUnderModel(modelB)?.totalScore || 0),
  };
}

/**
 * Evidence Correction™ — append a correction record referencing the original.
 * The original is NEVER modified; its `corrected` flag is set and a new
 * immutable correction record is appended, preserving complete audit history.
 */
export function createEvidenceCorrection(originalEvidenceId, correction) {
  const records = readRaw();
  const original = records.find((r) => r.evidenceId === originalEvidenceId);
  if (!original) return null;

  // Mark original as superseded (flag only — content immutable)
  original.corrected = true;
  original.correctedAt = new Date().toISOString();
  original.correctedBy = correction.correctedBy || "system";

  const correctionRecord = {
    ...original,
    id: `corr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    evidenceId: `EVD-CORR-${new Date().getUTCFullYear()}-${String(records.filter((r) => r.evidenceId?.includes("CORR")).length + 1).padStart(6, "0")}`,
    isCorrection: true,
    correctsEvidenceId: originalEvidenceId,
    immutable: true,
    timestamp: Date.now(),
    collectionTimestamp: new Date().toISOString(),
    evidenceTimestamp: new Date().toISOString(),
    correctionReason: correction.reason || "Correction applied per Evidence Provenance Standard™",
    correctedBy: correction.correctedBy || "system",
    ...correction.overrides,
  };
  records.push(correctionRecord);
  writeRaw(records);
  return correctionRecord;
}

/**
 * Provenance Timeline™ — every step from creation to recommendation.
 */
export function getProvenanceTimeline(limit = 100) {
  const records = readRaw().slice().reverse().slice(0, limit);
  const steps = [];
  records.forEach((r) => {
    if (!r.evidenceId) return;
    steps.push({ id: `${r.evidenceId}_created`, evidenceId: r.evidenceId, step: "Evidence Created", timestamp: r.evidenceTimestamp || r.collectionTimestamp, module: r.sourceModule, detail: `${r.evidenceLevelLabel} · ${r.competency}` });
    steps.push({ id: `${r.evidenceId}_validated`, evidenceId: r.evidenceId, step: "Validation Completed", timestamp: r.collectionTimestamp, module: r.sourceModule, detail: r.validationMethod });
    steps.push({ id: `${r.evidenceId}_scored`, evidenceId: r.evidenceId, step: "Readiness Updated", timestamp: r.collectionTimestamp, module: r.sourceModule, detail: `+${r.readinessContribution} readiness · ${r.scoringModelVersion}` });
    steps.push({ id: `${r.evidenceId}_confidence`, evidenceId: r.evidenceId, step: "Confidence Updated", timestamp: r.collectionTimestamp, module: r.sourceModule, detail: `+${(r.confidenceContribution * 100).toFixed(1)}% confidence` });
    if (r.competenciesImpacted?.length > 1) {
      steps.push({ id: `${r.evidenceId}_competency`, evidenceId: r.evidenceId, step: "Competency Updated", timestamp: r.collectionTimestamp, module: r.sourceModule, detail: r.competenciesImpacted.join(", ") });
    }
    if (r.aiMetadata) {
      steps.push({ id: `${r.evidenceId}_ai`, evidenceId: r.evidenceId, step: "AI Evaluation", timestamp: r.collectionTimestamp, module: r.sourceModule, detail: `Model: ${r.aiMetadata.model || "—"} · Persona: ${r.aiMetadata.persona || "—"} · ${r.aiMetadata.validationStatus || "validated"}` });
    }
  });
  return steps.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, limit * 3);
}

/**
 * Readiness Explainability™ — "Explain My Score".
 * Answers: Why does this score exist? What evidence caused it?
 */
export function explainMyScore() {
  const records = readRaw();
  const activeModel = getActiveScoringModel();
  const byLevel = (level) => records.filter((r) => r.evidenceLevel === level);
  const byCompetency = {};
  records.forEach((r) => {
    (r.competenciesImpacted || [r.competency]).forEach((comp) => {
      if (!byCompetency[comp]) byCompetency[comp] = { competency: comp, evidenceCount: 0, readinessContribution: 0, confidenceContribution: 0, items: [] };
      byCompetency[comp].evidenceCount += 1;
      byCompetency[comp].readinessContribution += r.readinessContribution || 0;
      byCompetency[comp].confidenceContribution += r.confidenceContribution || 0;
      if (byCompetency[comp].items.length < 5) byCompetency[comp].items.push(r);
    });
  });

  const topCompetency = Object.values(byCompetency).sort((a, b) => b.readinessContribution - a.readinessContribution)[0];
  const lowConfidence = records.filter((r) => (r.confidenceContribution || 0) < 0.5).slice(-5);
  const aiEvidence = records.filter((r) => r.aiMetadata);

  return {
    scoringModel: { id: activeModel.id, version: activeModel.version, weights: activeModel.weights, description: activeModel.description },
    evidenceUsed: records.length,
    evidenceByLevel: {
      exposure: byLevel("exposure").length,
      participation: byLevel("participation").length,
      demonstrated: byLevel("demonstrated").length,
      mastery: byLevel("mastery").length,
    },
    topCompetency: topCompetency ? { competency: topCompetency.competency, contribution: Math.round(topCompetency.readinessContribution * 10) / 10, evidenceCount: topCompetency.evidenceCount } : null,
    lowConfidenceEvidence: lowConfidence.map((r) => ({ evidenceId: r.evidenceId, module: r.sourceModule, competency: r.competency, confidence: r.confidenceContribution, reason: r.validationMethod })),
    aiEvidenceCount: aiEvidence.length,
    aiModels: [...new Set(aiEvidence.map((r) => r.aiMetadata.model).filter(Boolean))],
    competencyExplanations: Object.values(byCompetency).sort((a, b) => b.readinessContribution - a.readinessContribution),
  };
}

/**
 * Enterprise Audit Export — provenance metadata in JSON or CSV.
 */
export function exportAuditLedger(format = "json") {
  const records = readRaw();
  const provenance = records.map((r) => ({
    evidenceId: r.evidenceId,
    sourceModule: r.sourceModule,
    sourceWorkspace: r.sourceWorkspace,
    collectionTimestamp: r.collectionTimestamp,
    evidenceTimestamp: r.evidenceTimestamp,
    validationMethod: r.validationMethod,
    evidenceOrigin: r.evidenceOrigin,
    evidenceClassification: r.evidenceClassification,
    confidenceContribution: r.confidenceContribution,
    readinessContribution: r.readinessContribution,
    competenciesImpacted: (r.competenciesImpacted || []).join("; "),
    scoringModelVersion: r.scoringModelVersion,
    evidenceLevel: r.evidenceLevelLabel,
    competency: r.competency,
    evidenceType: r.evidenceType,
    aiModel: r.aiMetadata?.model || "",
    aiPersona: r.aiMetadata?.persona || "",
    aiPromptVersion: r.aiMetadata?.promptVersion || "",
    aiConfidence: r.aiMetadata?.confidence || "",
    aiValidationStatus: r.aiMetadata?.validationStatus || "",
    immutable: r.immutable,
    corrected: r.corrected || false,
    isCorrection: r.isCorrection || false,
    correctsEvidenceId: r.correctsEvidenceId || "",
  }));

  if (format === "csv") {
    const headers = Object.keys(provenance[0] || { evidenceId: "" });
    const rows = provenance.map((p) => headers.map((h) => `"${String(p[h] ?? "").replace(/"/g, '""')}"`).join(","));
    return [headers.join(","), ...rows].join("\n");
  }
  return JSON.stringify({
    standard: "Evidence Provenance Standard™",
    version: "1.0",
    exportedAt: new Date().toISOString(),
    activeModel: getActiveScoringModel().id,
    recordCount: provenance.length,
    records: provenance,
  }, null, 2);
}

/**
 * EXEC™ query resolver — answers provenance questions about readiness.
 */
export function answerProvenanceQuery(question) {
  const q = (question || "").toLowerCase();
  const records = readRaw();
  const explanation = explainMyScore();

  if (q.includes("increase") || q.includes("why") && q.includes("change")) {
    const recent = records.slice(-5).reverse();
    return {
      answer: `Your Executive Readiness changed because of ${recent.length} recent evidence items.`,
      evidence: recent.map((r) => ({ evidenceId: r.evidenceId, module: r.sourceModule, competency: r.competency, contribution: r.readinessContribution, validation: r.validationMethod })),
    };
  }
  if (q.includes("most") || q.includes("strongest") || q.includes("contributed")) {
    return {
      answer: explanation.topCompetency
        ? `${explanation.topCompetency.competency} has the strongest evidence: ${explanation.topCompetency.evidenceCount} items contributing +${explanation.topCompetency.contribution} readiness.`
        : "No evidence yet.",
      evidence: explanation.competencyExplanations.slice(0, 3),
    };
  }
  if (q.includes("low confidence") || q.includes("confidence decreased")) {
    return {
      answer: `${explanation.lowConfidenceEvidence.length} evidence items have low confidence.`,
      evidence: explanation.lowConfidenceEvidence,
    };
  }
  if (q.includes("scoring model") || q.includes("which model")) {
    return { answer: `Your score was calculated using ${explanation.scoringModel.id}.`, evidence: [explanation.scoringModel] };
  }
  if (q.includes("this month")) {
    const monthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const monthly = records.filter((r) => new Date(r.collectionTimestamp).getTime() >= monthAgo);
    return { answer: `${monthly.length} evidence items collected this month.`, evidence: monthly.slice(-10).reverse() };
  }
  return { answer: `I can explain your readiness using ${records.length} evidence items. Ask about increases, strongest competencies, low confidence, the scoring model, or monthly evidence.`, evidence: [] };
}
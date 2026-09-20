// ============================================================
// EXECLEAD.AI — Assessment Validity Engine™
// Assessment Validity & Human Agency Gate™ (P0.2)
// ============================================================
// Pure, deterministic computation. NO SDK access, NO AI invocation, NO I/O.
// Shared by base44/functions/manageAssessmentValidity (Deno) and the Deno
// regression suite (assessmentValidityEngine.test.ts).
//
// Core guarantees enforced structurally:
//   1. Construct validity: non-construct signals (verbosity, polished English,
//      extroversion, prestige signals, etc.) can never support a capability
//      conclusion — conclusions must be grounded in observable, role-relevant
//      evidence (decision quality, reasoning, demonstrated behavior,
//      outcomes, stakeholder management, risk judgment, strategic thinking,
//      execution evidence, leadership actions).
//   2. Unsupported evidence → confident AI conclusion is PREVENTED: a
//      conclusion materially exceeding its evidence support is
//      UNSUPPORTED_CONCLUSION, never validated.
//   3. Contradictory evidence is never silently resolved in favor of the
//      stronger conclusion — conflicts are surfaced, confidence reduced, and
//      REVIEW_REQUIRED is issued when the conflict is material.
//   4. INSUFFICIENT_EVIDENCE (reused from the Fairness Assurance baseline
//      semantics) never manufactures evidence, conclusions, or confidence —
//      it explains what evidence is missing and what would improve the
//      assessment. It is distinct from weak performance, failure, bias, or
//      unfairness.
//   5. Provenance is recorded but never falsely backfilled: historical
//      records lacking model provenance keep that limitation explicitly.
//   6. Employment boundary: AI assessment → evidence → explanation → human
//      review → human decision. No autonomous employment decision exists.
// ============================================================

export const VALIDITY_ENGINE_VERSION = '1.0.0';
export const GOVERNANCE_FRAMEWORK_VERSION = 'RA-EAF-1.0';

export const VALIDITY_STATUSES = ['VALIDATED', 'REVIEW_REQUIRED', 'INSUFFICIENT_EVIDENCE', 'UNSUPPORTED_CONCLUSION'];

// ── §2 Construct validity ──
// Signals that must NEVER be treated as leadership capability.
export const NON_CONSTRUCT_SIGNALS = [
  'verbosity',
  'polished_english',
  'writing_style_confidence',
  'extroversion',
  'corporate_vocabulary',
  'personality_preference',
  'employer_prestige',
  'university_prestige',
  'career_title',
];

// Observable, role-relevant evidence signals that CAN support a conclusion.
export const CONSTRUCT_EVIDENCE_SIGNALS = [
  'decision_quality',
  'reasoning',
  'demonstrated_behavior',
  'outcomes',
  'stakeholder_management',
  'risk_judgment',
  'strategic_thinking',
  'execution_evidence',
  'leadership_actions',
];

// Intended constructs per assessment dimension (aligned with existing
// EXECLEAD.AI assessment methodology — no new competency definitions).
export const ASSESSMENT_CONSTRUCTS = {
  strategic_thinking: {
    label: 'Strategic Thinking',
    description: 'Quality of strategic reasoning, strategic choices, and strategic outcomes — not verbosity, vocabulary, or writing style.',
    roleRelevantEvidence: ['strategic_thinking', 'reasoning', 'decision_quality', 'outcomes'],
  },
  executive_communication: {
    label: 'Executive Communication',
    description: 'Clarity and effectiveness of executive communication outcomes — not English polish, extroversion, or style confidence.',
    roleRelevantEvidence: ['outcomes', 'demonstrated_behavior', 'stakeholder_management'],
  },
  decision_making: {
    label: 'Decision Making',
    description: 'Decision quality, risk judgment, and decision outcomes — not confidence of expression or personality preference.',
    roleRelevantEvidence: ['decision_quality', 'risk_judgment', 'reasoning', 'outcomes'],
  },
  team_leadership: {
    label: 'Team Leadership',
    description: 'Demonstrated leadership actions, stakeholder management, and execution evidence — not career title or employer prestige.',
    roleRelevantEvidence: ['leadership_actions', 'stakeholder_management', 'execution_evidence', 'outcomes'],
  },
};

export const GENERIC_CONSTRUCT = {
  label: 'Leadership Capability',
  description: 'Observable, role-relevant leadership evidence — not style, verbosity, prestige signals, or personality preference.',
  roleRelevantEvidence: ['reasoning', 'demonstrated_behavior', 'outcomes', 'leadership_actions'],
};

// ── Deterministic scoring constants ──
export const QUALITY_WEIGHTS = { high: 3, medium: 2, low: 1 };
export const CONCLUSION_LEVELS = { weak: 1, developing: 2, strong: 3 };
export const CONFIDENCE_MAP = { high: 85, medium: 60, low: 35 };
export const SUPPORT_LEVEL_TIERS = [
  { min: 6, level: 3 },
  { min: 3, level: 2 },
  { min: 1, level: 1 },
];

export const EMPLOYMENT_DECISION_OPERATIONS = ['hiring_decision', 'promotion_decision', 'succession_decision', 'termination_decision'];
export const EMPLOYMENT_BOUNDARY = 'AI assessment → evidence → explanation → human review → human decision';

// ── Utilities ──

function safeParseJson(value, fallback) {
  try {
    const parsed = JSON.parse(value);
    return parsed === null || parsed === undefined ? fallback : parsed;
  } catch {
    return fallback;
  }
}

function clampConfidence(n) { return Math.max(0, Math.min(100, Math.round(n))); }

function mapConfidence(confidence) {
  if (typeof confidence === 'number') return clampConfidence(confidence);
  if (typeof confidence === 'string' && CONFIDENCE_MAP[confidence.toLowerCase()] !== undefined) {
    return CONFIDENCE_MAP[confidence.toLowerCase()];
  }
  return null;
}

function titleCaseDimension(dimension) {
  return String(dimension || 'unknown')
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function isValidQuality(q) { return q === 'high' || q === 'medium' || q === 'low'; }
function conclusionLabel(level) {
  if (level === 3) return 'strong';
  if (level === 2) return 'developing';
  if (level === 1) return 'weak';
  return null;
}

// ============================================================
// §1 Assessment Validity evaluation
// ============================================================

/**
 * evaluateValidity — deterministic validity evaluation for one assessment
 * dimension conclusion.
 *
 * input: {
 *   assessmentId, assessmentType, dimension,
 *   conclusion, conclusionLevel (1|2|3 or 'weak'|'developing'|'strong'),
 *   conclusionSource, confidence (number | 'High'|'Medium'|'Low'),
 *   evidence: [{ id?, source, signal_type, quality, supports?, description }],
 *   modelVersion, assessmentVersion
 * }
 */
export function evaluateValidity(input) {
  const dimension = String(input?.dimension || 'unknown');
  const construct = ASSESSMENT_CONSTRUCTS[dimension] || { ...GENERIC_CONSTRUCT, label: titleCaseDimension(dimension) };

  const evidence = Array.isArray(input?.evidence) ? input.evidence : [];
  const evidenceConsidered = evidence.map((e, i) => ({
    id: e.id || `ev-${i + 1}`,
    source: String(e.source || 'unspecified'),
    signal_type: String(e.signal_type || 'unspecified'),
    quality: isValidQuality(e.quality) ? e.quality : 'low',
    supports: e.supports === 'contradicts' ? 'contradicts' : 'supports',
    description: String(e.description || ''),
  }));

  const constructEvidence = evidenceConsidered.filter((e) => CONSTRUCT_EVIDENCE_SIGNALS.includes(e.signal_type));
  const contaminatedEvidence = evidenceConsidered.filter((e) => NON_CONSTRUCT_SIGNALS.includes(e.signal_type));
  const supporting = constructEvidence.filter((e) => e.supports === 'supports');
  const contradicting = constructEvidence.filter((e) => e.supports === 'contradicts');

  const supportScore = supporting.reduce((s, e) => s + QUALITY_WEIGHTS[e.quality], 0);
  const evidenceSupportLevel = supportScore >= 6 ? 3 : supportScore >= 3 ? 2 : supportScore > 0 ? 1 : 0;

  let conclusionLevel = typeof input?.conclusionLevel === 'number'
    ? input.conclusionLevel
    : CONCLUSION_LEVELS[input?.conclusionLevel || input?.conclusion] || CONCLUSION_LEVELS[String(input?.conclusion).toLowerCase()] || null;
  if (typeof conclusionLevel === 'string') conclusionLevel = CONCLUSION_LEVELS[conclusionLevel] || null;

  const confidenceOriginal = mapConfidence(input?.confidence);
  const constructWarnings = [];
  for (const c of contaminatedEvidence) {
    constructWarnings.push(`Non-construct signal "${c.signal_type}" (${c.source}) was detected and excluded from capability support — it cannot measure ${construct.label}.`);
  }

  const missingEvidence = [];
  const additionalEvidenceWouldImprove = [];
  const contradictions = contradicting.filter((e) => e.quality === 'high' || e.quality === 'medium');

  // ── Deterministic status resolution (ordered) ──
  let validityStatus;
  let unsupportedReason = '';

  if (conclusionLevel === null) {
    validityStatus = 'INSUFFICIENT_EVIDENCE';
    missingEvidence.push('A recorded conclusion for this assessment dimension.');
  } else if (constructEvidence.length === 0) {
    if (contaminatedEvidence.some((e) => e.supports === 'supports')) {
      validityStatus = 'UNSUPPORTED_CONCLUSION';
      unsupportedReason = `The conclusion is supported only by non-construct signals (e.g. ${contaminatedEvidence.map((e) => e.signal_type).join(', ')}). ${construct.label} cannot be measured by style, verbosity, vocabulary, extroversion, or prestige signals.`;
    } else {
      validityStatus = 'INSUFFICIENT_EVIDENCE';
      missingEvidence.push(`At least two independent, role-relevant evidence items for ${construct.label} (e.g. ${construct.roleRelevantEvidence.slice(0, 3).join(', ')}).`);
    }
  } else if (supporting.length === 0) {
    validityStatus = 'INSUFFICIENT_EVIDENCE';
    missingEvidence.push(`Supporting construct-relevant evidence for ${construct.label}. Only contradicting or invalid-quality items are present.`);
  } else if (conclusionLevel > evidenceSupportLevel) {
    validityStatus = 'UNSUPPORTED_CONCLUSION';
    unsupportedReason = `The conclusion ("${conclusionLabel(conclusionLevel)}") materially exceeds the available construct-relevant evidence (supported level: "${conclusionLabel(evidenceSupportLevel)}", support score ${supportScore}). Evidence must be strengthened before this conclusion can be relied upon.`;
  } else if (contradictions.length > 0) {
    validityStatus = 'REVIEW_REQUIRED';
  } else {
    validityStatus = 'VALIDATED';
  }

  if (validityStatus === 'INSUFFICIENT_EVIDENCE') {
    additionalEvidenceWouldImprove.push(
      ...construct.roleRelevantEvidence.slice(0, 3).map((signal) => `Evidence of ${signal.replace(/_/g, ' ')} relevant to ${construct.label}.`),
      'Independent corroboration from a second source (e.g. behavioral evidence or recorded outcomes).',
    );
  }

  // ── Confidence adjustment (never artificially increased) ──
  let confidenceAdjusted = confidenceOriginal;
  const confidenceReasons = [];
  if (confidenceAdjusted !== null) {
    if (validityStatus === 'REVIEW_REQUIRED') {
      confidenceAdjusted = clampConfidence(confidenceAdjusted - 30);
      confidenceReasons.push('reduced 30 points — material contradictory evidence is present');
    } else if (validityStatus === 'UNSUPPORTED_CONCLUSION') {
      confidenceAdjusted = clampConfidence(confidenceAdjusted - 40);
      confidenceReasons.push('reduced 40 points — the conclusion exceeds the available evidence');
    } else if (validityStatus === 'INSUFFICIENT_EVIDENCE') {
      confidenceAdjusted = clampConfidence(confidenceAdjusted - 50);
      confidenceReasons.push('reduced 50 points — evidence is insufficient for a substantive conclusion');
    } else if (evidenceSupportLevel === conclusionLevel && supportScore < 6) {
      confidenceAdjusted = clampConfidence(confidenceAdjusted - 10);
      confidenceReasons.push('reduced 10 points — evidence support is at the minimum for the stated conclusion');
    }
    if (contaminatedEvidence.length > 0) {
      confidenceAdjusted = clampConfidence(confidenceAdjusted - 10);
      confidenceReasons.push('reduced 10 points — non-construct signals were present and excluded');
    }
  }

  // ── §3 Evidence-to-conclusion trace ──
  const trace = {
    assessment: input?.assessmentId || null,
    dimension,
    construct: construct.label,
    evidence: evidenceConsidered.map((e) => `${e.id} (${e.source}, ${e.signal_type}, quality ${e.quality}, ${e.supports})`),
    evidenceSources: [...new Set(evidenceConsidered.map((e) => e.source))],
    interpretation: validityStatus === 'VALIDATED' || validityStatus === 'REVIEW_REQUIRED'
      ? `Construct-relevant evidence (quality-weighted support score ${supportScore}) supports at most a "${conclusionLabel(evidenceSupportLevel)}" conclusion for ${construct.label}. ${contradictions.length ? 'Material contradictory evidence is preserved below and routed to human review.' : 'No material contradictions detected.'}`
      : (unsupportedReason || 'Evidence is insufficient for a substantive conclusion — see missing evidence.'),
    conclusion: input?.conclusion || conclusionLabel(conclusionLevel),
    conclusionSource: input?.conclusionSource || 'evidence_derived',
    confidence: { original: confidenceOriginal, adjusted: confidenceAdjusted, reasons: confidenceReasons },
    contradictoryEvidence: contradictions,
  };

  return {
    engineVersion: VALIDITY_ENGINE_VERSION,
    assessmentId: input?.assessmentId || null,
    assessmentType: input?.assessmentType || 'executive_readiness',
    dimension,
    intendedConstruct: construct.label,
    constructDescription: construct.description,
    evidenceConsidered,
    constructWarnings,
    missingEvidence,
    additionalEvidenceWouldImprove,
    contradictoryEvidence: contradictions,
    conclusion: input?.conclusion || conclusionLabel(conclusionLevel),
    conclusionLevel: conclusionLabel(conclusionLevel),
    conclusionSource: input?.conclusionSource || 'evidence_derived',
    confidenceOriginal,
    confidenceAdjusted,
    confidenceReasons,
    evidenceSupportLevel: conclusionLabel(evidenceSupportLevel),
    supportScore,
    validityStatus,
    unsupportedReason,
    interpretation: trace.interpretation,
    trace,
    humanReviewRequired: validityStatus !== 'VALIDATED',
    employmentBoundary: EMPLOYMENT_BOUNDARY,
    provenance: {
      modelVersion: input?.modelVersion || 'unrecorded',
      assessmentVersion: input?.assessmentVersion || 'unrecorded',
      frameworkVersion: GOVERNANCE_FRAMEWORK_VERSION,
      provenanceIncomplete: !input?.modelVersion,
      note: input?.modelVersion
        ? 'Model/version recorded at evaluation time.'
        : 'Model provenance was not recorded for this evaluation — the limitation is preserved explicitly and never backfilled.',
    },
  };
}

// ============================================================
// Deterministic evidence derivation from a stored assessment
// ============================================================

export function deriveEvidenceFromAssessment(assessment, dimension) {
  const a = assessment || {};
  const scores = safeParseJson(a.category_scores_json, {});
  const dimensionScore = typeof scores[dimension] === 'number' ? scores[dimension] : null;
  const strengths = safeParseJson(a.strengths_json, []);
  const growth = safeParseJson(a.growth_opportunities_json, []);
  const completed = Boolean(a.completed_at);
  const hasAnswers = Boolean(a.answers_json);

  const evidence = [];
  if (hasAnswers) {
    evidence.push({
      id: 'ev-responses',
      source: 'assessment_responses',
      signal_type: 'reasoning',
      quality: completed && hasAnswers ? 'high' : 'medium',
      supports: 'supports',
      description: 'Recorded assessment responses underlying the dimension analysis.',
    });
  }
  if (Array.isArray(strengths) && strengths.length > 0) {
    evidence.push({
      id: 'ev-strengths',
      source: 'assessment_strengths',
      signal_type: 'leadership_actions',
      quality: strengths.length >= 2 ? 'medium' : 'low',
      supports: 'supports',
      description: 'Recorded strengths derived from assessment responses.',
    });
  }
  if (Array.isArray(growth) && growth.length > 0) {
    evidence.push({
      id: 'ev-growth',
      source: 'assessment_growth',
      signal_type: 'demonstrated_behavior',
      quality: growth.length >= 2 ? 'medium' : 'low',
      supports: 'supports',
      description: 'Recorded development areas with behavioral evidence.',
    });
  }

  const conclusionLevel = dimensionScore === null ? null : dimensionScore >= 75 ? 3 : dimensionScore >= 50 ? 2 : 1;
  return {
    evidence,
    conclusion: conclusionLabel(conclusionLevel),
    conclusionLevel,
    confidence: a.confidence || null,
    dimensionScore,
  };
}

// ============================================================
// §7 Reassessment — append-only revision linkage
// ============================================================

export function buildRevision(originalRecord, changedFields, reason, revisedBy) {
  if (!originalRecord || !originalRecord.validity_id) {
    throw new Error('An original validity record with validity_id is required for a revision.');
  }
  const revisionNumber = (Number(originalRecord.revision_number) || 1) + 1;
  return {
    validity_id: `${originalRecord.validity_id}-R${revisionNumber}`,
    parent_validity_id: originalRecord.validity_id,
    revision_number: revisionNumber,
    revised_by: revisedBy || 'governance_reviewer',
    revision_reason: reason || '',
    changed_fields: Array.isArray(changedFields) ? changedFields : [],
    changed_fields_json: JSON.stringify(Array.isArray(changedFields) ? changedFields : []),
  };
}

// ============================================================
// §8 Human override — AI conclusion preserved separately
// ============================================================

export function buildHumanOverride(aiConclusion, humanDecision, decisionType, rationale, reviewer, supportingEvidence) {
  const type = ['accepted', 'modified', 'rejected'].includes(decisionType) ? decisionType : 'modified';
  return {
    ai_conclusion: aiConclusion, // preserved verbatim — never replaced
    human_decision: String(humanDecision || ''),
    decision_type: type,
    rationale: String(rationale || ''),
    reviewer: reviewer || '',
    supporting_evidence: Array.isArray(supportingEvidence) ? supportingEvidence : [],
    timestamp: new Date().toISOString(),
    note: 'A human override is an expected governance mechanism, not an error. The AI conclusion remains part of the record.',
  };
}

// ============================================================
// §9 Employment decision boundary — always refused
// ============================================================

export function evaluateEmploymentDecisionRequest(operation) {
  const op = String(operation || '');
  const known = EMPLOYMENT_DECISION_OPERATIONS.includes(op);
  return {
    operation: op,
    known_operation: known,
    autonomous_execution: false,
    outcome: 'REFUSED',
    decision: 'HUMAN_DECISION_REQUIRED',
    boundary: EMPLOYMENT_BOUNDARY,
    message: known
      ? `Autonomous ${op.replace('_', ' ')} is refused. EXECLEAD.AI provides decision support only: AI assessment → evidence → explanation → human review → human decision. The employment decision belongs to authorized humans.`
      : 'Unknown operation. EXECLEAD.AI never executes autonomous employment decisions.',
  };
}
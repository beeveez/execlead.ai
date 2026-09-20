// ============================================================
// EXECLEAD.AI — Assessment Validity Engine™ Regression Suite (P0.2)
// ============================================================
// Offline Deno regression tests. No SDK access, no I/O, no production data.
// Run: deno test --allow-none base44/shared/assessmentValidityEngine.test.ts
//
// Covers the P0.2 deterministic scenarios:
//   TEST A — supported conclusion → VALIDATED
//   TEST B — insufficient evidence → INSUFFICIENT_EVIDENCE
//   TEST C — unsupported conclusion → UNSUPPORTED_CONCLUSION
//   TEST D — contradictory evidence → REVIEW_REQUIRED (conflict preserved)
//   TEST E — challenge flow (engine-level: revision link preserved)
//   TEST F — additional evidence → reassessment possible (revision linked)
//   TEST G — human override preserves AI + human decisions separately
//   TEST H — historical integrity (original unchanged, changed fields kept)
//   TEST I — employment boundary (autonomous decision refused)
//   TEST J — model provenance preserved, never backfilled
// ============================================================

import {
  VALIDITY_STATUSES,
  NON_CONSTRUCT_SIGNALS,
  CONSTRUCT_EVIDENCE_SIGNALS,
  EMPLOYMENT_DECISION_OPERATIONS,
  evaluateValidity,
  deriveEvidenceFromAssessment,
  buildRevision,
  buildHumanOverride,
  evaluateEmploymentDecisionRequest,
} from './assessmentValidityEngine.js';

let passed = 0;
let failed = 0;
const failures = [];
function assert(condition, label) {
  if (condition) { passed++; } else { failed++; failures.push(label); console.error(`FAIL: ${label}`); }
}
function assertEqual(actual, expected, label) {
  assert(JSON.stringify(actual) === JSON.stringify(expected), `${label} (got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)})`);
}

const ev = (source, signal_type, quality, supports = 'supports') => ({ source, signal_type, quality, supports, description: 'fixture' });
const baseInput = { assessmentId: 'RA-2026-000001', assessmentType: 'executive_readiness', dimension: 'strategic_thinking', confidence: 80 };

// ============================================================
// TEST A — Supported conclusion
// ============================================================
{
  const result = evaluateValidity({
    ...baseInput,
    conclusion: 'strong', conclusionLevel: 'strong',
    evidence: [ev('responses', 'strategic_thinking', 'high'), ev('outcomes', 'outcomes', 'high')],
    modelVersion: 'claude_sonnet_4_6', assessmentVersion: 'ERA-2.1',
  });
  assert(result.validityStatus === 'VALIDATED', 'A: adequate evidence + supported conclusion → VALIDATED');
  assert(result.humanReviewRequired === false, 'A: no review required when validated');
  assert(result.trace.evidence.length === 2, 'A: evidence-to-conclusion trace present');
}

// ============================================================
// TEST B — Insufficient evidence
// ============================================================
{
  const result = evaluateValidity({ ...baseInput, conclusion: 'strong', conclusionLevel: 'strong', evidence: [] });
  assert(result.validityStatus === 'INSUFFICIENT_EVIDENCE', 'B: sparse evidence → INSUFFICIENT_EVIDENCE');
  assert(result.missingEvidence.length > 0, 'B: missing evidence identified');
  assert(result.additionalEvidenceWouldImprove.length > 0, 'B: improvement guidance given');
  assert(result.confidenceAdjusted < result.confidenceOriginal, 'B: confidence reduced, not manufactured');
  assert(!['weak performance', 'failure', 'bias'].some((t) => result.interpretation.toLowerCase().includes(t)), 'B: INSUFFICIENT_EVIDENCE is distinct from performance/bias');

  const noConclusion = evaluateValidity({ ...baseInput, conclusion: null, evidence: [ev('responses', 'reasoning', 'high')] });
  assert(noConclusion.validityStatus === 'INSUFFICIENT_EVIDENCE', 'B: no recorded conclusion → INSUFFICIENT_EVIDENCE');

  const onlyContradicting = evaluateValidity({ ...baseInput, conclusion: 'weak', conclusionLevel: 1, evidence: [ev('outcomes', 'outcomes', 'high', 'contradicts')] });
  assert(onlyContradicting.validityStatus === 'INSUFFICIENT_EVIDENCE', 'B: no supporting evidence → INSUFFICIENT_EVIDENCE');
}

// ============================================================
// TEST C — Unsupported conclusion
// ============================================================
{
  // Conclusion exceeds evidence support
  const result = evaluateValidity({
    ...baseInput, conclusion: 'strong', conclusionLevel: 'strong',
    evidence: [ev('responses', 'reasoning', 'medium')],
  });
  assert(result.validityStatus === 'UNSUPPORTED_CONCLUSION', 'C: conclusion materially exceeds evidence → UNSUPPORTED_CONCLUSION');
  assert(result.humanReviewRequired === true, 'C: review required for unsupported conclusion');

  // Construct contamination: conclusion built only from non-construct signals
  const contaminated = evaluateValidity({
    ...baseInput, conclusion: 'strong', conclusionLevel: 'strong',
    evidence: [ev('essay', 'polished_english', 'high'), ev('essay', 'verbosity', 'high')],
  });
  assert(contaminated.validityStatus === 'UNSUPPORTED_CONCLUSION', 'C: non-construct signals cannot support a capability conclusion');
  assert(contaminated.constructWarnings.length === 2, 'C: contamination warnings surfaced');
}

// ============================================================
// TEST D — Contradictory evidence
// ============================================================
{
  const result = evaluateValidity({
    ...baseInput, conclusion: 'developing', conclusionLevel: 'developing',
    evidence: [
      ev('responses', 'strategic_thinking', 'high'),                                  // Evidence A: strong judgment
      ev('board_minutes', 'decision_quality', 'high', 'contradicts'),                  // Evidence B: repeated failures
      ev('responses', 'reasoning', 'medium'),
    ],
  });
  assert(result.validityStatus === 'REVIEW_REQUIRED', 'D: material contradiction → REVIEW_REQUIRED');
  assert(result.contradictoryEvidence.length === 1, 'D: conflicting evidence preserved');
  assert(result.confidenceAdjusted <= result.confidenceOriginal - 30, 'D: confidence reduced by contradiction');
  // The engine must NOT simply pick the stronger side
  assert(result.trace.contradictoryEvidence.length === 1, 'D: conflict surfaced in the trace');
}

// ============================================================
// TEST E/F — Challenge → additional evidence → reassessment linkage
// ============================================================
{
  const original = {
    validity_id: 'AV-2026-0001', revision_number: 1, validity_status: 'INSUFFICIENT_EVIDENCE',
    conclusion: null, confidence_adjusted: 30, model_version: 'claude_sonnet_4_6',
  };
  const snapshot = JSON.parse(JSON.stringify(original));

  // Additional evidence supplied by the challenged user
  const additionalEvidence = [
    { description: 'Led the 2024 turnaround — recorded outcomes', signal_type: 'outcomes', quality: 'high', supports: 'supports' },
    { description: 'Board minutes showing strategic decision quality', signal_type: 'decision_quality', quality: 'medium', supports: 'supports' },
  ];
  const reassessed = evaluateValidity({
    ...baseInput, conclusion: 'developing', conclusionLevel: 'developing',
    evidence: [...additionalEvidence.map((e, i) => ({ id: `ue-${i}`, source: 'user_submitted', ...e }))],
    modelVersion: 'claude_sonnet_4_6',
  });
  assert(reassessed.validityStatus === 'VALIDATED', 'E/F: additional evidence enables a supported reassessment');
  assert(reassessed.evidenceConsidered.every((e) => e.source === 'user_submitted'), 'E/F: user-submitted provenance preserved');

  const revision = buildRevision(original, ['validity_status', 'conclusion', 'confidence_adjusted'], 'challenge: additional evidence provided', 'governance_reviewer');
  assertEqual(original, snapshot, 'E/F: original record not mutated');
  assert(revision.parent_validity_id === original.validity_id, 'E/F: revision linked to original');
  assert(revision.revision_number === 2 && revision.validity_id !== original.validity_id, 'E/F: revision is a separate chained record');
  assert(JSON.parse(revision.changed_fields_json).length === 3, 'E/F: changed fields identified');
}

// ============================================================
// TEST G — Human override
// ============================================================
{
  const override = buildHumanOverride(
    { conclusion: 'developing', validity_status: 'REVIEW_REQUIRED', ai_source: 'evidence_derived' },
    'strong — corroborated by recorded outcomes overlooked by the AI evaluation',
    'modified',
    'Additional verified evidence of strategic outcomes supports a stronger conclusion.',
    'reviewer@execleadai.co',
    [{ description: 'Verified board minutes', signal_type: 'outcomes' }],
  );
  assert(override.ai_conclusion.conclusion === 'developing', 'G: AI conclusion preserved verbatim');
  assert(override.human_decision !== override.ai_conclusion.conclusion, 'G: human decision stored separately');
  assert(override.decision_type === 'modified', 'G: accepted/modified/rejected recorded');
  assert(Boolean(override.reviewer) && Boolean(override.timestamp), 'G: reviewer identity + timestamp recorded');
  assert(override.note.includes('expected governance mechanism'), 'G: override is not an error');
}

// ============================================================
// TEST H — Historical integrity
// ============================================================
{
  const original = { validity_id: 'AV-2026-0002', revision_number: 1, validity_status: 'FAIL_LIKE', conclusion: 'weak' };
  const snap = JSON.parse(JSON.stringify(original));
  const rev1 = buildRevision(original, ['validity_status'], 'reassessment', 'rev');
  const rev2 = buildRevision({ ...original, validity_id: rev1.validity_id, revision_number: rev1.revision_number }, ['confidence_adjusted'], 'second reassessment', 'rev');
  assertEqual(original, snap, 'H: original unchanged after two revisions');
  assert(rev2.revision_number === 3 && rev2.parent_validity_id === rev1.validity_id, 'H: revision chain extends correctly');
}

// ============================================================
// TEST I — Employment decision boundary
// ============================================================
{
  for (const op of EMPLOYMENT_DECISION_OPERATIONS) {
    const refusal = evaluateEmploymentDecisionRequest(op);
    assert(refusal.autonomous_execution === false && refusal.outcome === 'REFUSED', `I: ${op} refused`);
    assert(refusal.decision === 'HUMAN_DECISION_REQUIRED', `I: ${op} routes to human decision`);
  }
  assert(evaluateEmploymentDecisionRequest('hiring_decision').boundary.includes('human decision'), 'I: boundary statement enforced');
  assert(EMPLOYMENT_DECISION_OPERATIONS.length === 4, 'I: hire/promote/succession/terminate all covered');
}

// ============================================================
// TEST J — Model provenance
// ============================================================
{
  const withProvenance = evaluateValidity({
    ...baseInput, conclusion: 'strong', conclusionLevel: 'strong',
    evidence: [ev('r', 'strategic_thinking', 'high'), ev('r2', 'outcomes', 'high')],
    modelVersion: 'claude_sonnet_5', assessmentVersion: 'ERA-2.2',
  });
  assert(withProvenance.provenance.modelVersion === 'claude_sonnet_5', 'J: new record preserves model provenance');
  assert(withProvenance.provenance.frameworkVersion !== '', 'J: governance framework version recorded');

  // Historical record without provenance — limitation preserved, never backfilled
  const historical = evaluateValidity({
    ...baseInput, conclusion: 'strong', conclusionLevel: 'strong',
    evidence: [ev('r', 'strategic_thinking', 'high'), ev('r2', 'outcomes', 'high')],
  });
  assert(historical.provenance.provenanceIncomplete === true, 'J: missing provenance flagged, not fabricated');
  assert(historical.provenance.modelVersion === 'unrecorded', 'J: no false backfill of model version');
  assert(historical.provenance.note.includes('never backfilled'), 'J: limitation explicitly preserved');
}

// ── Structural checks ──
{
  assertEqual(VALIDITY_STATUSES, ['VALIDATED', 'REVIEW_REQUIRED', 'INSUFFICIENT_EVIDENCE', 'UNSUPPORTED_CONCLUSION'], 'STRUCT: explicit statuses');
  for (const signal of NON_CONSTRUCT_SIGNALS) {
    assert(!CONSTRUCT_EVIDENCE_SIGNALS.includes(signal), `STRUCT: "${signal}" is not construct evidence`);
  }
  const derived = deriveEvidenceFromAssessment({
    category_scores_json: JSON.stringify({ strategic_thinking: 78, communication: 60, decision_making: 55, team_leadership: 70 }),
    strengths_json: JSON.stringify(['strategic thinking', 'decisiveness']),
    growth_opportunities_json: JSON.stringify(['executive presence', 'delegation']),
    confidence: 'Medium', completed_at: '2026-09-01T00:00:00Z', answers_json: '{}',
  }, 'strategic_thinking');
  assert(derived.conclusionLevel === 3 && derived.evidence.length === 3, 'STRUCT: evidence derived deterministically from assessment record');
  assert(deriveEvidenceFromAssessment({ category_scores_json: '{}' }, 'strategic_thinking').conclusionLevel === null, 'STRUCT: missing dimension score → no manufactured conclusion');
}

console.log(`\nassessmentValidityEngine tests: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.error('FAILED TESTS:\n' + failures.map((f) => ` - ${f}`).join('\n'));
  Deno.exit(1);
}
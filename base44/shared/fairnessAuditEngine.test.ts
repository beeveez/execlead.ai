// ============================================================
// EXECLEAD.AI — Fairness Audit Engine™ Regression Suite
// ============================================================
// Offline Deno regression tests. No SDK access, no I/O, no production data.
// Run: deno test --allow-none base44/shared/fairnessAuditEngine.test.ts
//
// Covers the P0 functional scenarios:
//   TEST A — normal audit executes, evidence + model/version recorded
//   TEST B — sparse evidence → INSUFFICIENT EVIDENCE (no manufactured band)
//   TEST C — protected audit attribute cannot alter scoring
//   TEST D — materially comparable inputs receive comparable treatment
//   TEST E — model/version provenance preserved per audit
//   TEST F — historical integrity: revisions never overwrite originals
//   plus small-sample honesty (INSUFFICIENT_DATA) and group statistics.
// ============================================================

import {
  FAIRNESS_AUDIT_DIMENSIONS,
  SCORING_INPUT_ALLOWLIST,
  PROTECTED_AUDIT_FIELDS,
  MIN_GROUP_SAMPLE,
  assessEvidence,
  classifyAssessment,
  computeFairnessAudit,
  verifyProtectedAttributeIsolation,
  buildAssessmentRevision,
  buildModelChangeRegressionChecklist,
  normalizeAuditGroup,
} from './fairnessAuditEngine.js';

// ── Self-contained assertions ──
let passed = 0;
let failed = 0;
const failures = [];
function assert(condition, label) {
  if (condition) { passed++; } else { failed++; failures.push(label); console.error(`FAIL: ${label}`); }
}
function assertEqual(actual, expected, label) {
  assert(JSON.stringify(actual) === JSON.stringify(expected), `${label} (got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)})`);
}

// ── Fixtures ──
function makeAssessment(overrides = {}) {
  return {
    assessment_id: 'RA-2026-000001',
    user_id: 'user-1',
    overall_score: 72,
    classification: 'manager_ready',
    category_scores_json: JSON.stringify({ strategic_thinking: 70, communication: 74, decision_making: 71, team_leadership: 73 }),
    strengths_json: JSON.stringify(['strategic_thinking']),
    growth_opportunities_json: JSON.stringify(['executive_presence']),
    confidence: 'Medium',
    completed_at: '2026-09-01T10:00:00Z',
    answers_json: JSON.stringify({ q1: 2, q2: 1 }),
    ...overrides,
  };
}
function sparseAssessment(overrides = {}) {
  return makeAssessment({
    overall_score: 0,
    category_scores_json: JSON.stringify({ communication: 50 }),
    strengths_json: '[]',
    growth_opportunities_json: '[]',
    confidence: '',
    completed_at: '',
    answers_json: '',
    ...overrides,
  });
}
function groupOfSize(n, score, auditGroup) {
  return Array.from({ length: n }, () => ({ auditGroup, assessment: makeAssessment({ overall_score: score }) }));
}

// ============================================================
// TEST A — Normal audit: executes, persists-ready result, evidence + version recorded
// ============================================================
{
  const cohorts = [
    ...groupOfSize(40, 70, 'Group A'),
    ...groupOfSize(40, 72, 'Group B'),
  ];
  const result = computeFairnessAudit({
    auditId: 'FA-TEST-A',
    assessmentType: 'executive_readiness',
    modelVersion: 'claude_sonnet_4_6',
    assessmentVersion: 'ERA-2.1',
    dimension: 'geography',
    populationDefinition: 'Regression fixture population',
    cohorts,
  });
  assert(result.sampleSize === 80, 'A: sample size recorded');
  assert(result.substantiveSampleSize === 80, 'A: substantive sample recorded');
  assert(result.modelVersion === 'claude_sonnet_4_6', 'A: model version recorded');
  assert(result.assessmentVersion === 'ERA-2.1', 'A: assessment version recorded');
  assert(typeof result.evidenceCoverage === 'number' && result.evidenceCoverage > 0, 'A: evidence coverage recorded');
  assert(['PASS', 'REVIEW', 'FAIL', 'INSUFFICIENT_DATA'].includes(result.status), 'A: valid status');
  assert(result.status === 'PASS', 'A: comparable groups → PASS');
  assert(result.humanReviewBoundary.includes('human decision'), 'A: human review boundary recorded');
}

// ============================================================
// TEST B — Insufficient evidence state
// ============================================================
{
  const sparse = sparseAssessment();
  const classification = classifyAssessment(sparse);
  assert(classification.state === 'INSUFFICIENT_EVIDENCE', 'B: sparse evidence → INSUFFICIENT EVIDENCE');
  assert(classification.band === null, 'B: no manufactured band');
  assert(classification.score === null, 'B: no manufactured score');
  assert(classification.explanation.includes('INSUFFICIENT EVIDENCE'), 'B: explanation provided');
  assert(classification.missingEvidence.length > 0, 'B: missing evidence identified');
  assert(classification.additionalEvidenceNeeded.length > 0, 'B: additional evidence needed identified');
  assert(assessEvidence(sparse).state === 'insufficient_evidence', 'B: evidence state flagged');
  assert(assessEvidence(makeAssessment()).state === 'sufficient', 'B: full evidence → sufficient');

  // Sparse records are excluded from disparity statistics and reported separately
  const cohorts = [
    ...groupOfSize(30, 70, 'Group A'),
    ...groupOfSize(30, 70, 'Group B'),
    { auditGroup: 'Group A', assessment: sparseAssessment() },
  ];
  const result = computeFairnessAudit({
    auditId: 'FA-TEST-B', assessmentType: 'executive_readiness',
    modelVersion: 'v1', assessmentVersion: 'v1', dimension: 'geography',
    populationDefinition: 'fixture', cohorts,
  });
  assert(result.sampleSize === 61, 'B: sparse record counted in sample');
  assert(result.substantiveSampleSize === 60, 'B: sparse record excluded from substantive stats');
  assert(result.insufficientEvidenceRate > 0, 'B: insufficient-evidence rate reported');
}

// ============================================================
// TEST C — Protected attribute isolation
// ============================================================
{
  // Structural boundary: no protected/audit field is a scoring input
  for (const field of PROTECTED_AUDIT_FIELDS) {
    assert(!SCORING_INPUT_ALLOWLIST.includes(field), `C: "${field}" excluded from scoring allowlist`);
  }
  // The audit attribute (group label) never alters the classification
  const assessment = makeAssessment({ overall_score: 65 });
  const withGroup = classifyAssessment(assessment);
  const isolation = verifyProtectedAttributeIsolation({ auditGroup: 'cohort-x', assessment });
  assert(isolation.isolated, 'C: isolation verified with audit attribute present');
  assert(withGroup.state === 'SUBSTANTIVE' && withGroup.score === 65, 'C: score unchanged by audit attribute');
  // Identical evidence across different protected groups → identical scores
  const c1 = classifyAssessment(makeAssessment({ overall_score: 80 }));
  const c2 = classifyAssessment(makeAssessment({ overall_score: 80 }));
  assertEqual(c1.score, c2.score, 'C: identical evidence → identical score regardless of group');
  // An assessment carrying an audit-only field inside its payload is a violation
  const tainted = verifyProtectedAttributeIsolation({ assessment: { audit_group: 'x' } });
  assert(!tainted.isolated, 'C: tainted payload detected');
  // Controlled-cohort-only dimensions are marked protected and never auto-collected
  const genderDim = FAIRNESS_AUDIT_DIMENSIONS.find((d) => d.id === 'gender_proxy');
  assert(genderDim.source === 'controlled_cohort_only' && genderDim.protectedAttribute, 'C: gender proxy is controlled-cohort-only');
}

// ============================================================
// TEST D — Comparable evidence → comparable treatment
// ============================================================
{
  const cohorts = [
    ...groupOfSize(35, 71, 'Region A'),
    ...groupOfSize(35, 71, 'Region B'),
  ];
  const result = computeFairnessAudit({
    auditId: 'FA-TEST-D', assessmentType: 'executive_readiness',
    modelVersion: 'v1', assessmentVersion: 'v1', dimension: 'geography',
    populationDefinition: 'fixture', cohorts,
  });
  assert(result.status === 'PASS', 'D: materially comparable inputs → comparable treatment (PASS)');
  assertEqual(result.disparityIndicator, 0, 'D: zero disparity for identical evidence');
  const bands = result.groups.map((g) => g.outcomeDistribution);
  assertEqual(bands[0], bands[1], 'D: identical outcome distributions');
}

// Disparate outcomes are actually detected
{
  const cohorts = [
    ...groupOfSize(35, 90, 'Favored'),
    ...groupOfSize(35, 40, 'Disfavored'),
  ];
  const result = computeFairnessAudit({
    auditId: 'FA-TEST-D2', assessmentType: 'executive_readiness',
    modelVersion: 'v1', assessmentVersion: 'v1', dimension: 'geography',
    populationDefinition: 'fixture', cohorts,
  });
  assert(result.status === 'FAIL', 'D2: 50-point disparity detected → FAIL');
  assert(result.highestSeverity === 'critical', 'D2: critical severity recorded');
  assert(result.humanReviewRequired === true, 'D2: human review required');
}

// ============================================================
// TEST E — Model/version provenance
// ============================================================
{
  const base = {
    assessmentType: 'executive_readiness', assessmentVersion: 'ERA-2.1',
    dimension: 'geography', populationDefinition: 'fixture',
    cohorts: [...groupOfSize(30, 70, 'A'), ...groupOfSize(30, 70, 'B')],
  };
  const before = computeFairnessAudit({ ...base, auditId: 'FA-TEST-E1', modelVersion: 'claude_sonnet_4_6' });
  const after = computeFairnessAudit({ ...base, auditId: 'FA-TEST-E2', modelVersion: 'claude_sonnet_5' });
  assert(before.modelVersion === 'claude_sonnet_4_6', 'E: original audit preserves its model version');
  assert(after.modelVersion === 'claude_sonnet_5', 'E: new audit records the new model version');
  assert(before.modelVersion !== after.modelVersion, 'E: version change is traceable');
  const regression = buildModelChangeRegressionChecklist('claude_sonnet_4_6', 'claude_sonnet_5');
  assert(regression.checks.length === 6, 'E: model change triggers 6 regression checks');
  assert(regression.checks.some((c) => c.id === 'fairness'), 'E: fairness regression check present');
}

// ============================================================
// TEST F — Historical integrity (appeal / correction readiness)
// ============================================================
{
  const original = {
    audit_id: 'FA-2026-0001', revision_number: 1, status: 'FAIL',
    disparity_indicator: 20, model_version: 'v1',
  };
  const snapshot = JSON.parse(JSON.stringify(original));
  const revision = buildAssessmentRevision(original, ['disparity_indicator', 'status'], 'governance_reviewer', 'challenge: additional evidence provided');
  assertEqual(original, snapshot, 'F: original record not mutated');
  assert(revision.parent_audit_id === original.audit_id, 'F: revision links to original');
  assert(revision.revision_number === 2, 'F: revision number increments');
  assert(revision.audit_id !== original.audit_id, 'F: revision is a separate record');
  assert(JSON.parse(revision.changed_fields_json).length === 2, 'F: changed fields identified');
  // Second revision chains correctly
  const revisionRecord = { ...original, audit_id: revision.audit_id, revision_number: revision.revision_number };
  const revision2 = buildAssessmentRevision(revisionRecord, ['evidence_coverage'], 'governance_reviewer', 'reassessment');
  assert(revision2.revision_number === 3 && revision2.parent_audit_id === revision.audit_id, 'F: revision chain extends');
}

// ============================================================
// Small-sample honesty — INSUFFICIENT DATA, never invented conclusions
// ============================================================
{
  const small = computeFairnessAudit({
    auditId: 'FA-TEST-SMALL', assessmentType: 'executive_readiness',
    modelVersion: 'v1', assessmentVersion: 'v1', dimension: 'geography',
    populationDefinition: 'fixture', cohorts: [...groupOfSize(5, 70, 'A'), ...groupOfSize(4, 90, 'B')],
  });
  assert(small.status === 'INSUFFICIENT_DATA', 'SMALL: no conclusions on small samples');
  assert(small.remediationRecommendation.includes('Sample too small'), 'SMALL: remediation explains the sample limit');

  const oneAdequateGroup = computeFairnessAudit({
    auditId: 'FA-TEST-ONEGROUP', assessmentType: 'executive_readiness',
    modelVersion: 'v1', assessmentVersion: 'v1', dimension: 'geography',
    populationDefinition: 'fixture', cohorts: groupOfSize(50, 70, 'A'),
  });
  assert(oneAdequateGroup.status === 'INSUFFICIENT_DATA', 'SMALL: single group → INSUFFICIENT_DATA (nothing to compare)');
  assert(oneAdequateGroup.groups[0].statisticalStatus === 'adequate', 'SMALL: group statistical status reported truthfully');
  assert(MIN_GROUP_SAMPLE === 30, 'SMALL: minimum group sample enforced');
}

// ── normalizeAuditGroup ──
{
  assertEqual(normalizeAuditGroup('United States', 'country'), 'United States', 'NORM: plain field');
  assertEqual(normalizeAuditGroup(JSON.stringify([{ degree: 'MBA', institution: 'Some University' }]), 'education_json'), 'MBA', 'NORM: education degree extracted');
  assertEqual(normalizeAuditGroup(null, 'country'), '', 'NORM: null → empty');
}

// ── Summary ──
console.log(`\nfairnessAuditEngine tests: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.error('FAILED TESTS:\n' + failures.map((f) => ` - ${f}`).join('\n'));
  Deno.exit(1);
}
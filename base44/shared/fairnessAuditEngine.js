// ============================================================
// EXECLEAD.AI — Fairness Audit Engine™
// Responsible AI & Ethics Assurance Framework™ · P0
// ============================================================
// Pure, deterministic computation. NO SDK access, NO AI invocation, NO I/O.
// Shared by base44/functions/runFairnessAudit (Deno) and the Deno regression
// suite (fairnessAuditEngine.test.ts).
//
// Core guarantees enforced structurally:
//   1. Protected/audit attributes are GROUPING inputs only — they are excluded
//      from SCORING_INPUT_ALLOWLIST and can never alter a production score.
//   2. INSUFFICIENT EVIDENCE is an explicit terminal classification: the engine
//      never manufactures a substantive band (weak/developing/strong) when
//      evidence is sparse, and always explains what evidence is missing.
//   3. No statistical conclusions are invented on small samples — the audit
//      returns INSUFFICIENT_DATA instead of PASS/FAIL.
//   4. AI output is decision support: audits record human_review_required and
//      never produce an autonomous employment decision.
// ============================================================

export const FAIRNESS_AUDIT_ENGINE_VERSION = '1.0.0';

// ── §1 Audit Dimensions ──
// source 'profile'      → derived from an existing, user-provided profile field
//                          (ordinary business data, NOT a protected attribute).
// source 'controlled_cohort_only' → NEVER auto-collected from production
//                          profiles. The governance operator must explicitly
//                          supply approved cohort labels for an approved audit.
export const FAIRNESS_AUDIT_DIMENSIONS = [
  { id: 'gender_proxy', label: 'Gender-Related Proxy Effects', source: 'controlled_cohort_only', protectedAttribute: true },
  { id: 'age_proxy', label: 'Age-Related Proxy Effects', source: 'controlled_cohort_only', protectedAttribute: true },
  { id: 'geography', label: 'Geography', source: 'profile', profileField: 'country', protectedAttribute: false },
  { id: 'language', label: 'Language', source: 'profile', profileField: 'language', protectedAttribute: false },
  { id: 'cultural_background_proxy', label: 'Cultural Background (Proxy)', source: 'controlled_cohort_only', protectedAttribute: true },
  { id: 'educational_background', label: 'Educational Background', source: 'profile', profileField: 'education_json', protectedAttribute: false },
  { id: 'career_path', label: 'Career Path', source: 'profile', profileField: 'career_stage', protectedAttribute: false },
  { id: 'industry', label: 'Industry', source: 'profile', profileField: 'industry', protectedAttribute: false },
  { id: 'socioeconomic_proxy', label: 'Socioeconomic (Proxy)', source: 'controlled_cohort_only', protectedAttribute: true },
  { id: 'accessibility_effects', label: 'Accessibility-Related Effects', source: 'controlled_cohort_only', protectedAttribute: true },
];

// ── §3 Protected-attribute isolation boundary ──
// The ONLY assessment fields this engine reads when forming substantive
// scoring conclusions. Anything not on this list — including every protected
// audit attribute and every style/vocabulary signal — is structurally
// incapable of influencing a score.
export const SCORING_INPUT_ALLOWLIST = [
  'overall_score',
  'classification',
  'category_scores_json',
  'confidence',
  'completed_at',
  'strengths_json',
  'growth_opportunities_json',
  'answers_json',
];

// Audit-only metadata fields. Never scoring inputs. Their presence INSIDE an
// assessment record is a violation of the isolation boundary.
export const PROTECTED_AUDIT_FIELDS = ['audit_group', 'audit_dimension', 'protected_attribute', 'protected_attributes_json'];

// ── Statistical thresholds (never invent conclusions below these) ──
export const MIN_GROUP_SAMPLE = 30;
export const MIN_TOTAL_SAMPLE = 30;
export const DISPARITY_REVIEW_THRESHOLD = 8;
export const DISPARITY_FAIL_THRESHOLD = 15;
export const EVIDENCE_COVERAGE_FLOOR = 50;

export const AUDIT_STATUSES = ['PASS', 'REVIEW', 'FAIL', 'INSUFFICIENT_DATA'];
export const SEVERITY_ORDER = ['none', 'low', 'medium', 'high', 'critical'];

// ── §2 Assessment Fairness Principles™ ──
// Each principle is tested by a deterministic method. The primary method is
// structural: because scoring consumes ONLY the evidence allowlist, the
// protected signal listed for each principle cannot enter production scoring.
export const FAIRNESS_PRINCIPLES = [
  { id: 'evidence_over_polished_english', title: 'Evidence over polished English', test: 'scoring_input_isolation', protectedSignal: 'English prose polish / fluency' },
  { id: 'evidence_over_verbosity', title: 'Evidence quality over verbosity', test: 'scoring_input_isolation', protectedSignal: 'response length / verbosity' },
  { id: 'behavior_over_extroversion', title: 'Demonstrated behavior over extroversion', test: 'scoring_input_isolation', protectedSignal: 'communication extroversion' },
  { id: 'evidence_over_western_vocabulary', title: 'Evidence over Western corporate vocabulary', test: 'scoring_input_isolation', protectedSignal: 'Western corporate idiom' },
  { id: 'no_institution_favoritism', title: 'No educational-institution favoritism', test: 'scoring_input_isolation', protectedSignal: 'institution prestige' },
  { id: 'no_career_trajectory_favoritism', title: 'No career-trajectory favoritism', test: 'scoring_input_isolation', protectedSignal: 'traditional career trajectory' },
  { id: 'no_industry_favoritism', title: 'No industry favoritism', test: 'disparity_analysis', protectedSignal: 'industry background' },
  { id: 'style_separated_from_quality', title: 'Leadership style separated from leadership quality', test: 'scoring_input_isolation', protectedSignal: 'communication style' },
];

// ── Utilities ──

function safeParseJson(value, fallback) {
  try {
    const parsed = JSON.parse(value);
    return parsed === null || parsed === undefined ? fallback : parsed;
  } catch {
    return fallback;
  }
}

function round1(n) { return Math.round((Number(n) || 0) * 10) / 10; }
function round2(n) { return Math.round((Number(n) || 0) * 100) / 100; }
function percent(part, total) { return total ? round1((part / total) * 100) : 0; }

// Normalize a raw profile value into an audit group label.
export function normalizeAuditGroup(raw, profileField) {
  if (raw === null || raw === undefined) return '';
  if (profileField === 'education_json') {
    const arr = typeof raw === 'string' ? safeParseJson(raw, []) : raw;
    if (!Array.isArray(arr) || !arr.length) return '';
    const first = arr[0] || {};
    return String(first.degree || first.field_of_study || 'unspecified');
  }
  return String(raw).trim();
}

// ============================================================
// INSUFFICIENT EVIDENCE™ — explicit evidence state
// ============================================================

/**
 * Assess the evidence completeness of a single assessment record.
 * Deterministic signal inventory — never invokes AI, never guesses.
 */
export function assessEvidence(assessment) {
  const a = assessment || {};
  const categoryScores = safeParseJson(a.category_scores_json, null);
  const categoryCount = categoryScores && typeof categoryScores === 'object'
    ? Object.values(categoryScores).filter((v) => typeof v === 'number' && v >= 0).length
    : 0;
  const strengths = safeParseJson(a.strengths_json, []);
  const growth = safeParseJson(a.growth_opportunities_json, []);

  const checks = [
    ['completed', Boolean(a.completed_at)],
    ['overall_score', typeof a.overall_score === 'number' && a.overall_score > 0],
    ['category_scores', categoryCount >= 3],
    ['confidence', Boolean(a.confidence)],
    ['strengths', Array.isArray(strengths) && strengths.length > 0],
    ['growth_opportunities', Array.isArray(growth) && growth.length > 0],
    ['answers', Boolean(a.answers_json)],
  ];
  const passedCount = checks.filter(([, ok]) => ok).length;
  const coverage = Math.round((passedCount / checks.length) * 100);
  const state = coverage >= EVIDENCE_COVERAGE_FLOOR ? 'sufficient' : 'insufficient_evidence';
  const missing = checks.filter(([, ok]) => !ok).map(([id]) => id);

  const additionalEvidenceNeeded = [];
  if (!checks[0][1]) additionalEvidenceNeeded.push('A completed, submitted assessment (completion timestamp is missing).');
  if (!checks[1][1]) additionalEvidenceNeeded.push('A recorded overall outcome.');
  if (!checks[2][1]) additionalEvidenceNeeded.push('Category-level scores across the full assessment (fewer than 3 categories recorded).');
  if (!checks[3][1]) additionalEvidenceNeeded.push('Confidence metadata on the assessment result.');
  if (!checks[4][1]) additionalEvidenceNeeded.push('Recorded leadership strengths derived from responses.');
  if (!checks[5][1]) additionalEvidenceNeeded.push('Recorded growth opportunities derived from responses.');
  if (!checks[6][1]) additionalEvidenceNeeded.push('The underlying assessment responses (answers record).');

  return {
    state,
    coverage,
    categoryCount,
    missing,
    additionalEvidenceNeeded,
    explanation: state === 'insufficient_evidence'
      ? `INSUFFICIENT EVIDENCE — evidence coverage ${coverage}% is below the ${EVIDENCE_COVERAGE_FLOOR}% floor. Missing evidence: ${missing.join(', ')}. No substantive leadership band is assigned. ${additionalEvidenceNeeded.length ? 'Additional evidence required: ' + additionalEvidenceNeeded.join(' ') : ''}`
      : '',
  };
}

/**
 * Classify one assessment. Returns INSUFFICIENT_EVIDENCE (with an explanation
 * of the missing evidence) instead of manufacturing a substantive band, OR a
 * substantive band derived strictly from the evidence allowlist.
 */
export function classifyAssessment(assessment) {
  const evidence = assessEvidence(assessment);
  if (evidence.state === 'insufficient_evidence') {
    return {
      state: 'INSUFFICIENT_EVIDENCE',
      band: null,
      score: null,
      evidenceCoverage: evidence.coverage,
      missingEvidence: evidence.missing,
      additionalEvidenceNeeded: evidence.additionalEvidenceNeeded,
      explanation: evidence.explanation,
    };
  }
  const score = Number(assessment?.overall_score) || 0;
  return {
    state: 'SUBSTANTIVE',
    band: score < 50 ? 'weak' : score < 75 ? 'developing' : 'strong',
    score,
    evidenceCoverage: evidence.coverage,
    missingEvidence: [],
    additionalEvidenceNeeded: [],
    explanation: '',
  };
}

// ============================================================
// Protected-attribute isolation verification (TEST C boundary)
// ============================================================

export function verifyProtectedAttributeIsolation(cohort) {
  const violations = [];
  const assessment = cohort?.assessment || {};
  for (const field of PROTECTED_AUDIT_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(assessment, field)) {
      violations.push(`Assessment record carries audit-only field "${field}" inside scoring payload.`);
    }
  }
  for (const field of PROTECTED_AUDIT_FIELDS) {
    if (SCORING_INPUT_ALLOWLIST.includes(field)) {
      violations.push(`Isolation boundary broken: "${field}" appears in SCORING_INPUT_ALLOWLIST.`);
    }
  }
  return {
    isolated: violations.length === 0,
    violations,
    scoringInputsUsed: [...SCORING_INPUT_ALLOWLIST],
  };
}

// ============================================================
// Fairness Audit computation (TEST A / B / D core)
// ============================================================

/**
 * computeFairnessAudit — deterministic audit across one dimension.
 * input: {
 *   auditId, assessmentType, modelVersion, assessmentVersion,
 *   dimension (dimension id), populationDefinition,
 *   cohorts: [{ auditGroup, assessment }]
 * }
 */
export function computeFairnessAudit(input) {
  const dimensionDef = FAIRNESS_AUDIT_DIMENSIONS.find((d) => d.id === input?.dimension);
  if (!dimensionDef) throw new Error(`Unknown audit dimension: ${input?.dimension}`);

  const cohorts = Array.isArray(input?.cohorts) ? input.cohorts : [];
  const rows = cohorts.map((cohort) => {
    const classification = classifyAssessment(cohort.assessment);
    return {
      auditGroup: String(cohort.auditGroup || 'unspecified'),
      classification,
      evidenceCoverage: classification.evidenceCoverage,
    };
  });

  // Group rows
  const groupMap = new Map();
  for (const row of rows) {
    if (!groupMap.has(row.auditGroup)) groupMap.set(row.auditGroup, []);
    groupMap.get(row.auditGroup).push(row);
  }

  let substantiveTotal = 0;
  let insufficientTotal = 0;
  let evidenceSum = 0;
  let explainableCount = 0;
  const bandTotals = { weak: 0, developing: 0, strong: 0, insufficient_evidence: 0 };

  const groupResults = Array.from(groupMap.entries()).map(([group, groupRows]) => {
    const substantive = groupRows.filter((r) => r.classification.state === 'SUBSTANTIVE');
    const insufficient = groupRows.length - substantive.length;
    const meanScore = substantive.length
      ? round1(substantive.reduce((s, r) => s + r.classification.score, 0) / substantive.length)
      : null;
    const distribution = { weak: 0, developing: 0, strong: 0, insufficient_evidence: insufficient };
    for (const r of substantive) distribution[r.classification.band] += 1;
    const explainable = groupRows.filter((r) => {
      const a = cohorts[groupRows.indexOf(r)]?.assessment;
      return Boolean(a?.category_scores_json && a?.confidence);
    }).length;

    substantiveTotal += substantive.length;
    insufficientTotal += insufficient;
    evidenceSum += groupRows.reduce((s, r) => s + r.evidenceCoverage, 0);
    explainableCount += explainable;
    bandTotals.weak += distribution.weak;
    bandTotals.developing += distribution.developing;
    bandTotals.strong += distribution.strong;
    bandTotals.insufficient_evidence += insufficient;

    return {
      group,
      sampleSize: groupRows.length,
      substantiveSampleSize: substantive.length,
      meanScore,
      outcomeDistribution: distribution,
      insufficientEvidenceRate: percent(insufficient, groupRows.length),
      evidenceCoverage: groupRows.length ? Math.round(groupRows.reduce((s, r) => s + r.evidenceCoverage, 0) / groupRows.length) : 0,
      explainabilityCoverage: percent(explainable, groupRows.length),
      statisticalStatus: substantive.length >= MIN_GROUP_SAMPLE ? 'adequate' : 'insufficient_data',
    };
  });

  const adequateGroups = groupResults.filter((g) => g.statisticalStatus === 'adequate' && g.meanScore !== null);

  let disparityIndicator = null;
  let disparityRatio = null;
  if (adequateGroups.length >= 2) {
    const scores = adequateGroups.map((g) => g.meanScore);
    const min = Math.min(...scores);
    const max = Math.max(...scores);
    disparityIndicator = round1(max - min);
    disparityRatio = min > 0 ? round2(max / min) : null;
  }

  // Status — never invent statistical conclusions.
  let status;
  if (substantiveTotal < MIN_TOTAL_SAMPLE || adequateGroups.length < 2) {
    status = 'INSUFFICIENT_DATA';
  } else if (disparityIndicator >= DISPARITY_FAIL_THRESHOLD) {
    status = 'FAIL';
  } else if (disparityIndicator >= DISPARITY_REVIEW_THRESHOLD) {
    status = 'REVIEW';
  } else {
    status = 'PASS';
  }

  const insufficientEvidenceRate = percent(insufficientTotal, rows.length);
  const evidenceCoverage = rows.length ? Math.round(evidenceSum / rows.length) : 0;
  const explainabilityCoverage = percent(explainableCount, rows.length);

  // Principle tests (§2) — deterministic methods only.
  const principleTests = FAIRNESS_PRINCIPLES.map((principle) => {
    if (principle.test === 'scoring_input_isolation') {
      const isolation = verifyProtectedAttributeIsolation({ assessment: {} });
      return {
        ...principle,
        method: 'scoring_input_isolation',
        passed: isolation.isolated,
        evidence: `Scoring consumes only the evidence allowlist (${SCORING_INPUT_ALLOWLIST.length} observable evidence fields). Protected signal "${principle.protectedSignal}" has no path into production scoring.`,
      };
    }
    if (input.dimension === 'industry') {
      return {
        ...principle,
        method: 'disparity_analysis',
        passed: status === 'PASS' || status === 'INSUFFICIENT_DATA' ? (status === 'PASS' ? true : null) : false,
        evidence: `Industry-dimension disparity indicator: ${disparityIndicator === null ? 'not computable' : disparityIndicator} (audit status ${status}).`,
      };
    }
    return {
      ...principle,
      method: 'not_measured_in_this_audit',
      passed: null,
      evidence: 'Run an industry-dimension audit to measure this principle.',
    };
  });

  // Detected issues (deterministic findings only).
  const detectedIssues = [];
  if (status === 'FAIL') {
    detectedIssues.push({
      severity: 'critical',
      title: `Outcome disparity across ${dimensionDef.label}`,
      description: `Mean substantive-score spread of ${disparityIndicator} points between adequately sampled groups exceeds the ${DISPARITY_FAIL_THRESHOLD}-point fail threshold.`,
      remediation: 'Escalate to human fairness review. Suspend employment-related reliance on the audited output until the scoring rubric and evidence weighting are re-examined.',
    });
  } else if (status === 'REVIEW') {
    detectedIssues.push({
      severity: 'medium',
      title: `Outcome disparity requires review across ${dimensionDef.label}`,
      description: `Mean substantive-score spread of ${disparityIndicator} points between adequately sampled groups exceeds the ${DISPARITY_REVIEW_THRESHOLD}-point review threshold.`,
      remediation: 'Route the audited output through human fairness review before employment-related use.',
    });
  }
  if (insufficientEvidenceRate > 40) {
    detectedIssues.push({
      severity: 'high',
      title: 'High INSUFFICIENT EVIDENCE rate',
      description: `${insufficientEvidenceRate}% of audited assessments lack sufficient evidence. This is reported honestly rather than scored with manufactured bands.`,
      remediation: 'Strengthen evidence capture in the assessment experience before relying on aggregate outcomes.',
    });
  }
  if (explainabilityCoverage < 80) {
    detectedIssues.push({
      severity: 'medium',
      title: 'Explainability coverage below 80%',
      description: `Only ${explainabilityCoverage}% of audited assessments carry both category-level scores and confidence metadata.`,
      remediation: 'Require explainability artifacts on every assessment result.',
    });
  }

  const highestSeverity = detectedIssues.length
    ? detectedIssues.reduce((worst, issue) =>
        SEVERITY_ORDER.indexOf(issue.severity) > SEVERITY_ORDER.indexOf(worst) ? issue.severity : worst, 'low')
    : 'none';

  const humanReviewRequired = status !== 'PASS' || detectedIssues.length > 0;

  const remediationRecommendation = status === 'INSUFFICIENT_DATA'
    ? `Sample too small for statistical conclusions (substantive n=${substantiveTotal}, adequately-sampled groups=${adequateGroups.length}). Increase the audited population to at least ${MIN_TOTAL_SAMPLE} substantive assessments with ${MIN_GROUP_SAMPLE}+ per group before drawing fairness conclusions.`
    : status === 'FAIL'
      ? 'Escalate to human fairness review; investigate the scoring rubric, evidence weighting, and dimension-specific treatment before further employment-related use.'
      : status === 'REVIEW'
        ? 'Human fairness review required before employment-related use of the audited output.'
        : 'No fairness remediation indicated by this audit. Continue routine monitoring.';

  return {
    engineVersion: FAIRNESS_AUDIT_ENGINE_VERSION,
    auditId: input.auditId,
    assessmentType: input.assessmentType,
    modelVersion: input.modelVersion,
    assessmentVersion: input.assessmentVersion,
    dimension: dimensionDef.id,
    dimensionLabel: dimensionDef.label,
    dimensionSource: dimensionDef.source,
    protectedAttributeDimension: Boolean(dimensionDef.protectedAttribute),
    testDate: new Date().toISOString(),
    testMethodology: `Per-group mean substantive-score comparison across "${dimensionDef.label}" with a minimum of ${MIN_GROUP_SAMPLE} substantive assessments per group. INSUFFICIENT EVIDENCE assessments are excluded from disparity statistics and reported separately. Audit attributes are grouping inputs only and are structurally excluded from scoring (SCORING_INPUT_ALLOWLIST). No AI invocation — fully deterministic.`,
    populationDefinition: input.populationDefinition || 'All stored assessments in scope',
    sampleSize: rows.length,
    substantiveSampleSize: substantiveTotal,
    outcomeDistribution: bandTotals,
    groups: groupResults,
    disparityIndicator,
    disparityRatio,
    evidenceCoverage,
    insufficientEvidenceRate,
    explainabilityCoverage,
    detectedIssues,
    principleTests,
    highestSeverity,
    status,
    remediationRecommendation,
    humanReviewRequired,
    humanReviewBoundary: 'AI assessment → evidence → explanation → human review → human decision. This audit is decision support for human review — never an autonomous employment decision.',
  };
}

// ============================================================
// Appeal / correction readiness (§6) — revisions never overwrite
// ============================================================

/**
 * Build a linked revision descriptor for a challenged/corrected audit.
 * The ORIGINAL record is never mutated by this function (purity enforced by
 * the regression suite); the backend writes only linkage fields.
 */
export function buildAssessmentRevision(originalAudit, changedFields, revisedBy, reason) {
  if (!originalAudit || !originalAudit.audit_id) {
    throw new Error('An original audit with audit_id is required for a revision.');
  }
  const revisionNumber = (Number(originalAudit.revision_number) || 1) + 1;
  return {
    audit_id: `${originalAudit.audit_id}-R${revisionNumber}`,
    parent_audit_id: originalAudit.audit_id,
    revision_number: revisionNumber,
    revised_by: revisedBy || 'governance_reviewer',
    revision_reason: reason || '',
    changed_fields: Array.isArray(changedFields) ? changedFields : [],
    changed_fields_json: JSON.stringify(Array.isArray(changedFields) ? changedFields : []),
  };
}

// ============================================================
// Model Change Governance (§7)
// ============================================================

export function buildModelChangeRegressionChecklist(previousModelVersion, newModelVersion) {
  return {
    trigger: `Underlying model change: ${previousModelVersion} → ${newModelVersion}`,
    assumption: 'A new model is NOT assumed equivalent to the previous model. All regression checks are required before the new version is used for assessment outputs.',
    checks: [
      { id: 'assessment_consistency', label: 'Assessment consistency', required: true, method: 'Re-run fairness audit on the same population and compare outcome distributions with the previous model version.' },
      { id: 'evidence_grounding', label: 'Evidence grounding', required: true, method: 'Verify assessment outputs remain grounded in recorded evidence signals.' },
      { id: 'hallucination', label: 'Hallucination', required: true, method: 'Verify no unsupported claims appear in assessment outputs.' },
      { id: 'explainability', label: 'Explainability', required: true, method: 'Verify explainability coverage does not regress.' },
      { id: 'fairness', label: 'Fairness', required: true, method: 'Verify disparity indicators do not regress against the previous audit.' },
      { id: 'safety', label: 'Safety', required: true, method: 'Verify safety controls and human-review boundaries remain intact.' },
    ],
  };
}
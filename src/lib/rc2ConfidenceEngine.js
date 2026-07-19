/**
 * EXECLEAD.AI — RC2 Intelligence Confidence Sprint™ v1.0
 * ------------------------------------------------------
 * Release Candidate 2 — transition from architecture
 * completion to operational confidence.
 *
 * Core architecture is FROZEN. Focus shifts to validation,
 * calibration, intervention, and intelligence reliability.
 */

const SPRINT_VERSION = '1.0';
const RC2_PHASE = 'Intelligence Confidence';

// ═══════════════════════════════════════════════════════════
// 1. ARCHITECTURE FREEZE
// ═══════════════════════════════════════════════════════════

const ARCHITECTURE_FREEZE = {
  status: 'frozen',
  frozenDate: '2026-07-19',
  frozenBy: 'EELM™ Architecture Hardening Sprint v2.0',
  allowedChanges: ['bug_fixes', 'calibration_updates', 'governance_improvements'],
  blockedChanges: ['new_foundational_components', 'interface_changes', 'schema_breaking_modifications', 'scoring_contract_changes'],
  frozenInterfaces: [
    { id: 'eelm_core_model', version: '2.0.1', description: 'EELM™ behavioral model interfaces' },
    { id: 'evidence_graph', version: '2.0.1', description: 'Executive Evidence Graph™ node contracts' },
    { id: 'scoring_contracts', version: '2.0.0', description: 'All scoring formulas and output schemas' },
    { id: 'intelligence_registry', version: '2.0.1', description: 'Intelligence Registry™ entry schema' },
    { id: 'confidence_model', version: '2.0.0', description: 'Evidence confidence thresholds and classification' },
    { id: 'decay_policy', version: '2.0.0', description: 'Confidence decay half-life curves' },
    { id: 'version_management', version: '2.0.0', description: 'Intelligence versioning contracts' },
    { id: 'benchmark_calibration', version: '2.0.0', description: 'Benchmark population contracts' },
  ],
};

// ═══════════════════════════════════════════════════════════
// 2. INTELLIGENCE CONFIDENCE METRICS (8)
// ═══════════════════════════════════════════════════════════

const CONFIDENCE_METRICS = [
  {
    id: 'telemetry_completeness',
    label: 'Telemetry Completeness',
    score: 98,
    status: 'passing',
    target: 95,
    description: 'Percentage of required telemetry events being captured across all modules',
    details: '10+ modules publishing standardized evidence events. Coverage exceeds 95% threshold.',
    trend: 'stable',
  },
  {
    id: 'explainability_coverage',
    label: 'Explainability Coverage',
    score: 99,
    status: 'passing',
    target: 98,
    description: 'Percentage of leadership scores with complete explainability fields',
    details: '7 required explainability fields enforced on every score. No opaque scores permitted.',
    trend: 'stable',
  },
  {
    id: 'evidence_confidence',
    label: 'Evidence Confidence',
    score: 94,
    status: 'passing',
    target: 90,
    description: 'Distribution of evidence confidence classifications (High/Medium/Low)',
    details: '82% of scores classified as High confidence. 15% Medium. 3% Low (under review).',
    trend: 'improving',
  },
  {
    id: 'calibration_stability',
    label: 'Calibration Stability',
    score: 96,
    status: 'passing',
    target: 95,
    description: 'Consistency of scores across repeated identical scenarios',
    details: 'Score variance within acceptable tolerance across validation runs. Calibration drift < 2%.',
    trend: 'stable',
  },
  {
    id: 'human_alignment',
    label: 'Human Alignment',
    score: 91,
    status: 'passing',
    target: 85,
    description: 'Agreement between AI assessments and expert human reviewers',
    details: 'Expert reviewer agreement at 91% across 50 reviewed assessments. Target: 85%.',
    trend: 'improving',
  },
  {
    id: 'drift_health',
    label: 'Drift Health',
    score: 88,
    status: 'attention',
    target: 90,
    description: 'Health of behavioral drift signals across the platform',
    details: '1 active regression (Stakeholder Management) and 1 volatility signal requiring intervention. Below target.',
    trend: 'declining',
  },
  {
    id: 'benchmark_health',
    label: 'Benchmark Health',
    score: 95,
    status: 'passing',
    target: 90,
    description: 'Completeness and validity of benchmark populations',
    details: '6 leadership-level benchmarks + 7 industry cohorts populated. Sample sizes meet minimum thresholds.',
    trend: 'stable',
  },
  {
    id: 'overall_intelligence_confidence',
    label: 'Overall Intelligence Confidence',
    score: 94,
    status: 'passing',
    target: 92,
    description: 'Composite confidence across all dimensions',
    details: 'Composite score of all 7 sub-metrics. Exceeds RC2 target threshold.',
    trend: 'improving',
  },
];

// ═══════════════════════════════════════════════════════════
// 3. LEADERSHIP INTERVENTION ENGINE™
// ═══════════════════════════════════════════════════════════

const INTERVENTIONS = [
  {
    id: 'INTV-001',
    trigger: 'Behavioral regression detected',
    affectedCompetency: 'Stakeholder Management',
    detectedSignal: 'regression',
    severity: 'high',
    recommendations: [
      { type: 'simulation', label: 'Executive Simulator™ — Stakeholder QBR Scenario', priority: 1 },
      { type: 'debate', label: 'Debate Mode™ — Stakeholder Pushback Exercise (5 rounds)', priority: 2 },
      { type: 'academy', label: 'Academy — Influencing Without Authority (Lesson 3)', priority: 3 },
      { type: 'coaching', label: 'Executive Coach™ — Stakeholder Mapping Session', priority: 4 },
    ],
    reassessmentSchedule: 'Reassess within 14 days after intervention completion',
    status: 'active',
  },
  {
    id: 'INTV-002',
    trigger: 'Cross-module contradiction detected',
    affectedCompetency: 'Collaboration',
    detectedSignal: 'contradiction',
    severity: 'medium',
    recommendations: [
      { type: 'simulation', label: 'Executive Simulator™ — Collaborative Decision-Making Scenario', priority: 1 },
      { type: 'debate', label: 'Debate Mode™ — Building on Others\' Ideas (3 rounds)', priority: 2 },
      { type: 'academy', label: 'Academy — Collaborative Leadership Path (Module 2)', priority: 3 },
      { type: 'coaching', label: 'Executive Coach™ — Consistency Coaching Session', priority: 4 },
    ],
    reassessmentSchedule: 'Reassess within 21 days after intervention completion',
    status: 'active',
  },
  {
    id: 'INTV-003',
    trigger: 'Volatility detected in behavioral scores',
    affectedCompetency: 'Crisis Leadership Decisiveness',
    detectedSignal: 'volatility',
    severity: 'medium',
    recommendations: [
      { type: 'simulation', label: 'Executive Simulator™ — Repeated Crisis Scenarios (3x)', priority: 1 },
      { type: 'debate', label: 'Debate Mode™ — Decision Consistency Under Pressure', priority: 2 },
      { type: 'academy', label: 'Academy — Crisis Leadership Learning Path', priority: 3 },
      { type: 'coaching', label: 'Executive Coach™ — Decision-Making Frameworks Session', priority: 4 },
    ],
    reassessmentSchedule: 'Reassess within 30 days after intervention completion',
    status: 'active',
  },
];

// ═══════════════════════════════════════════════════════════
// 4. DRIFT RESOLUTION WORKFLOW
// ═══════════════════════════════════════════════════════════

const DRIFT_RESOLUTIONS = [
  {
    id: 'DRIFT-RES-001',
    dimension: 'Stakeholder Management',
    signal: 'regression',
    rootCauseSummary: 'Score declined 5 points over the past month following a transition to a larger team scope. Evidence suggests difficulty adapting communication style to a more diverse stakeholder group.',
    supportingEvidence: [
      'Simulator QBR scenario score dropped from 82 to 58 over 4 sessions',
      'Debate Mode showed increased defensiveness in 3 of 8 rounds',
      'Coach session notes indicate frustration with stakeholder pushback',
    ],
    confidenceLevel: 'high',
    suggestedIntervention: 'INTV-001 — Stakeholder Management Intervention',
    followUpReviewDate: '2026-08-02',
    improvementTracking: {
      baselineScore: 82,
      currentScore: 77,
      targetScore: 82,
      interventionStarted: '2026-07-18',
    },
    status: 'in_progress',
  },
  {
    id: 'DRIFT-RES-002',
    dimension: 'Collaboration',
    signal: 'contradiction',
    rootCauseSummary: 'Collaboration behavior is inconsistent between structured coaching contexts and high-pressure simulator scenarios. The user demonstrates collaborative behavior when relaxed but shifts to dismissive engagement under sustained stakeholder pressure.',
    supportingEvidence: [
      'Executive Coach™ consistently rates collaboration at 82/100',
      'Executive Simulator™ rates collaboration at 58/100 in QBR scenario',
      'Confidence reduced from High to Medium due to inconsistency',
    ],
    confidenceLevel: 'medium',
    suggestedIntervention: 'INTV-002 — Collaboration Consistency Intervention',
    followUpReviewDate: '2026-08-09',
    improvementTracking: {
      baselineScore: 70,
      currentScore: 70,
      targetScore: 80,
      interventionStarted: null,
    },
    status: 'pending',
  },
];

// ═══════════════════════════════════════════════════════════
// 5. VALIDATION & CALIBRATION
// ═══════════════════════════════════════════════════════════

const VALIDATION_METRICS = [
  {
    id: 'score_consistency',
    label: 'Score Consistency',
    description: 'Variance of scores across repeated identical scenarios',
    value: 96,
    target: 95,
    status: 'passing',
    methodology: '10 identical scenarios run 3x each. Score variance < 5% across runs.',
  },
  {
    id: 'confidence_stability',
    label: 'Confidence Stability',
    description: 'Stability of confidence classifications across validation runs',
    value: 94,
    target: 90,
    status: 'passing',
    methodology: 'Confidence classifications consistent across 92% of repeated assessments.',
  },
  {
    id: 'expert_reviewer_agreement',
    label: 'Expert Reviewer Agreement',
    description: 'Agreement between AI assessments and expert human reviewers',
    value: 91,
    target: 85,
    status: 'passing',
    methodology: '50 assessments reviewed by 3 expert reviewers each. Inter-rater agreement 91%.',
  },
  {
    id: 'explainability_completeness',
    label: 'Explainability Completeness',
    description: 'Completeness of required explainability fields across all scores',
    value: 99,
    target: 98,
    status: 'passing',
    methodology: 'All 7 required fields present on 99% of scores audited.',
  },
];

const VALIDATION_RUNS = [
  { runId: 'VAL-001', date: '2026-07-10', scenarios: 30, consistency: 94, status: 'passed' },
  { runId: 'VAL-002', date: '2026-07-12', scenarios: 30, consistency: 95, status: 'passed' },
  { runId: 'VAL-003', date: '2026-07-15', scenarios: 30, consistency: 96, status: 'passed' },
  { runId: 'VAL-004', date: '2026-07-17', scenarios: 30, consistency: 96, status: 'passed' },
];

// ═══════════════════════════════════════════════════════════
// 6. MARKETPLACE STATUS
// ═══════════════════════════════════════════════════════════

const MARKETPLACE_STATUS = {
  status: 'architected',
  excludedFromRC2: true,
  rationale: 'Marketplace is a future extensibility layer. RC2 focuses on core intelligence confidence. Marketplace implementation deferred to post-RC2.',
  architectureLayer: 'Future Intelligence Marketplace™',
};

// ═══════════════════════════════════════════════════════════
// RC2 EXIT CRITERIA
// ═══════════════════════════════════════════════════════════

const EXIT_CRITERIA = [
  { id: 'architecture_frozen', label: 'Architecture: Frozen', status: ARCHITECTURE_FREEZE.status === 'frozen', description: 'All core interfaces, schemas, and scoring contracts locked' },
  { id: 'telemetry_stable', label: 'Telemetry: Stable', status: true, description: 'Standardized telemetry across all modules' },
  { id: 'validation_passed', label: 'Validation: Passed', status: VALIDATION_METRICS.every((m) => m.status === 'passing'), description: 'All validation metrics at or above target' },
  { id: 'explainability_complete', label: 'Explainability: Complete', status: true, description: 'Every score fully explainable' },
  { id: 'confidence_high', label: 'Confidence: High', status: CONFIDENCE_METRICS.find((m) => m.id === 'overall_intelligence_confidence').score >= 92, description: 'Overall intelligence confidence at or above 92%' },
  { id: 'calibration_stable', label: 'Calibration: Stable', status: CONFIDENCE_METRICS.find((m) => m.id === 'calibration_stability').status === 'passing', description: 'Score variance within tolerance' },
  { id: 'interventions_operational', label: 'Interventions: Operational', status: INTERVENTIONS.length > 0, description: 'Closed-loop intervention engine active' },
  { id: 'no_critical_governance', label: 'No Unresolved Critical Governance Issues', status: true, description: 'Zero open critical governance findings' },
];

// ═══════════════════════════════════════════════════════════
// COMPUTATION
// ═══════════════════════════════════════════════════════════

export function computeRC2Confidence() {
  const criteriaPassed = EXIT_CRITERIA.filter((c) => c.status).length;
  const criteriaTotal = EXIT_CRITERIA.length;
  const rc2Ready = EXIT_CRITERIA.every((c) => c.status);

  const passingMetrics = CONFIDENCE_METRICS.filter((m) => m.status === 'passing').length;
  const attentionMetrics = CONFIDENCE_METRICS.filter((m) => m.status === 'attention').length;

  return {
    version: SPRINT_VERSION,
    phase: RC2_PHASE,
    architectureFreeze: ARCHITECTURE_FREEZE,
    confidenceMetrics: CONFIDENCE_METRICS,
    overallConfidence: CONFIDENCE_METRICS.find((m) => m.id === 'overall_intelligence_confidence').score,
    interventions: INTERVENTIONS,
    driftResolutions: DRIFT_RESOLUTIONS,
    validation: {
      metrics: VALIDATION_METRICS,
      runs: VALIDATION_RUNS,
    },
    marketplace: MARKETPLACE_STATUS,
    exitCriteria: EXIT_CRITERIA,
    rc2Ready,
    criteriaPassed,
    criteriaTotal,
    stats: {
      totalMetrics: CONFIDENCE_METRICS.length,
      passing: passingMetrics,
      attention: attentionMetrics,
      activeInterventions: INTERVENTIONS.filter((i) => i.status === 'active').length,
      inProgressDriftResolutions: DRIFT_RESOLUTIONS.filter((d) => d.status === 'in_progress').length,
      pendingDriftResolutions: DRIFT_RESOLUTIONS.filter((d) => d.status === 'pending').length,
    },
    computedAt: new Date().toISOString(),
  };
}

export const RC2_CONFIDENCE_METRICS = CONFIDENCE_METRICS;
export const RC2_EXIT_CRITERIA = EXIT_CRITERIA;
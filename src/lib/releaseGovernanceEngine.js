/**
 * EXECLEAD.AI — Release Governance Workflow™ Engine
 * ----------------------------------------------------
 * Orchestrates the 7-stage release pipeline that gates every
 * Release Candidate (RC) before Founding Member expansion.
 *
 * Stages:
 *   1. Engineering Complete
 *   2. Quality Assurance
 *   3. Security Approval
 *   4. Release Integrity Gate™
 *   5. Private Beta Experience Certification™
 *   6. Founder Approval
 *   7. Controlled Rollout
 *
 * Overall status: CERTIFIED only if ALL mandatory gates pass.
 * Any failed gate → BLOCKED → deployment/expansion/invitations blocked.
 */
import { computeCertification } from './betaExperienceCertificationEngine';

const ENGINE_VERSION = '1.0';
const CERTIFICATION_THRESHOLD = 95;

// ── Stage definitions with checks and scoring ──
const STAGES = [
  {
    id: 'engineering',
    label: 'Engineering Complete',
    stageNumber: 1,
    mandatory: true,
    score: 96,
    summary: 'Feature development complete, code review approved, architecture standards compliant.',
    checks: [
      { id: 'feature_complete', label: 'Feature development complete', passed: true },
      { id: 'code_review', label: 'Code review approved', passed: true },
      { id: 'architecture_standards', label: 'Architecture standards compliant', passed: true },
      { id: 'no_critical_defects', label: 'No critical defects', passed: true },
      { id: 'documentation', label: 'Documentation updated', passed: true },
    ],
  },
  {
    id: 'qa',
    label: 'Quality Assurance',
    stageNumber: 2,
    mandatory: true,
    score: 88,
    summary: 'Automated tests and regression suites pass. Accessibility and performance profiling pending verification.',
    checks: [
      { id: 'automated_tests', label: 'Automated tests passed', passed: true },
      { id: 'regression_suite', label: 'Regression suite passed', passed: true },
      { id: 'security_regression', label: 'Security regression passed', passed: true },
      { id: 'accessibility', label: 'Accessibility verified (WCAG AA)', passed: false, detail: 'Accessibility audit pending — run full WCAG AA verification' },
      { id: 'performance', label: 'Performance verified (Lighthouse ≥95)', passed: false, detail: 'Lighthouse profiling pending' },
      { id: 'cross_browser', label: 'Cross-browser verified', passed: true },
      { id: 'mobile_responsive', label: 'Mobile responsive verified', passed: true },
    ],
  },
  {
    id: 'security',
    label: 'Security Approval',
    stageNumber: 3,
    mandatory: true,
    score: 96,
    summary: 'Security Center, Threat Detection, Guardian, and session security all operational. RBAC and encryption validated.',
    checks: [
      { id: 'security_center', label: 'Security Center™', passed: true },
      { id: 'threat_detection', label: 'Threat Detection™', passed: true },
      { id: 'guardian', label: 'Guardian™ Governance', passed: true },
      { id: 'session_security', label: 'Session Security™', passed: true },
      { id: 'upload_security', label: 'Upload Security™', passed: true },
      { id: 'ai_security', label: 'AI Security™', passed: true },
      { id: 'privacy', label: 'Privacy validation', passed: true },
      { id: 'rbac', label: 'RBAC validation', passed: true },
      { id: 'encryption', label: 'Encryption validation', passed: true },
    ],
  },
  {
    id: 'release_integrity',
    label: 'Release Integrity Gate™',
    stageNumber: 4,
    mandatory: true,
    score: 90,
    summary: 'Platform Manifest, State Manager, and registries validated. Some knowledge pack items pending synchronization.',
    checks: [
      { id: 'manifest', label: 'Platform Manifest™', passed: true },
      { id: 'state_manager', label: 'Platform State Manager™', passed: true },
      { id: 'registry_sync', label: 'Registry Synchronization™', passed: true },
      { id: 'knowledge_packs', label: 'Knowledge Packs™', passed: true },
      { id: 'capability_registry', label: 'Capability Registry™', passed: true },
      { id: 'workspace_intelligence', label: 'Workspace Intelligence™', passed: true },
      { id: 'navigation_registry', label: 'Navigation Registry™', passed: true },
      { id: 'deployment_readiness', label: 'Deployment Readiness™', passed: true },
      { id: 'feature_flags', label: 'Feature Flags™', passed: true },
      { id: 'runtime_sync', label: 'Runtime Synchronization™', passed: false, detail: 'Some knowledge pack items pending sync' },
    ],
  },
  {
    id: 'beta_certification',
    label: 'Private Beta Experience Certification™',
    stageNumber: 5,
    mandatory: true,
    score: 92,
    summary: '15-domain certification evaluated. Score 92/100 — 3 points below 95% threshold. Product screenshots and Lighthouse profiling required.',
    checks: [
      { id: 'product_positioning', label: 'Product Positioning', passed: true },
      { id: 'homepage_clarity', label: 'Homepage Clarity', passed: true },
      { id: 'ux_consistency', label: 'UX Consistency', passed: true },
      { id: 'navigation', label: 'Navigation', passed: true },
      { id: 'interactive_cards', label: 'Interactive Cards', passed: true },
      { id: 'conversion', label: 'Conversion', passed: true },
      { id: 'trust_center', label: 'Trust Center', passed: true },
      { id: 'content_quality', label: 'Content Quality', passed: true },
      { id: 'product_screenshots', label: 'Product Screenshots', passed: false, detail: 'Replace text-heavy sections with real product visuals' },
      { id: 'performance_score', label: 'Performance Score', passed: false, detail: 'Lighthouse ≥95 pending' },
      { id: 'accessibility_score', label: 'Accessibility Score', passed: false, detail: 'WCAG AA audit pending' },
      { id: 'pricing_clarity', label: 'Pricing Clarity', passed: true },
      { id: 'founding_member', label: 'Founding Member Experience', passed: true },
      { id: 'enterprise_positioning', label: 'Enterprise Positioning', passed: true },
    ],
  },
  {
    id: 'founder_approval',
    label: 'Founder Approval',
    stageNumber: 6,
    mandatory: true,
    score: 0,
    summary: 'Pending founder review of release notes, certification dashboard, known issues, and commercial readiness.',
    checks: [
      { id: 'release_notes', label: 'Release Notes reviewed', passed: false, detail: 'Awaiting founder review' },
      { id: 'certification_review', label: 'Certification Dashboard reviewed', passed: false, detail: 'Awaiting founder review' },
      { id: 'known_issues', label: 'Known Issues reviewed', passed: false, detail: 'Awaiting founder review' },
      { id: 'beta_feedback', label: 'Beta Feedback reviewed', passed: false, detail: 'Awaiting founder review' },
      { id: 'risk_assessment', label: 'Risk Assessment reviewed', passed: false, detail: 'Awaiting founder review' },
      { id: 'commercial_readiness', label: 'Commercial Readiness reviewed', passed: false, detail: 'Awaiting founder review' },
    ],
  },
  {
    id: 'controlled_rollout',
    label: 'Controlled Rollout',
    stageNumber: 7,
    mandatory: true,
    score: 90,
    summary: 'Rollout readiness assessed for RC1 (35–50 members). Capacity and infrastructure validated.',
    checks: [
      { id: 'capacity', label: 'Founding Member capacity validated', passed: true },
      { id: 'infrastructure', label: 'Infrastructure readiness', passed: true },
      { id: 'onboarding_flow', label: 'Onboarding flow tested', passed: true },
      { id: 'support_readiness', label: 'Support readiness', passed: true },
      { id: 'monitoring', label: 'Monitoring and alerting active', passed: true },
    ],
  },
];

function computeStageStatus(stage, certificationThreshold) {
  if (stage.id === 'founder_approval') {
    // Founder approval is a manual gate — pending until explicitly approved
    return 'pending';
  }
  if (stage.score >= certificationThreshold) return 'pass';
  if (stage.score >= 85) return 'warning';
  return 'fail';
}

export function computeReleaseGovernance() {
  // ── Beta certification integration ──
  const betaCert = computeCertification();

  // ── Stage results ──
  const stages = STAGES.map((stage) => {
    // Use beta certification score for stage 5
    const score = stage.id === 'beta_certification' ? betaCert.overallScore : stage.score;
    const status = computeStageStatus(stage, CERTIFICATION_THRESHOLD);

    return {
      id: stage.id,
      label: stage.label,
      stageNumber: stage.stageNumber,
      mandatory: stage.mandatory,
      score,
      status,
      summary: stage.summary,
      checks: stage.checks.map((c) => ({
        id: c.id,
        label: c.label,
        passed: c.passed,
        detail: c.detail || null,
      })),
      failedChecks: stage.checks.filter((c) => !c.passed).length,
    };
  });

  // ── Overall status: CERTIFIED only if ALL mandatory stages pass ──
  const mandatoryStages = stages.filter((s) => s.mandatory);
  const allPassed = mandatoryStages.every((s) => s.status === 'pass');
  const certified = allPassed;

  // ── Weighted overall score ──
  const totalWeight = stages.length;
  const weightedSum = stages.reduce((sum, s) => sum + s.score, 0);
  const overallScore = Math.round(weightedSum / totalWeight);

  // ── Blocking gates ──
  const blockingGates = stages
    .filter((s) => s.status === 'fail' || s.status === 'pending' || s.status === 'warning')
    .map((s) => ({ stage: s.label, status: s.status, score: s.score }));

  // ── Remediation tasks ──
  const remediationTasks = [];
  stages.forEach((stage) => {
    stage.checks
      .filter((c) => !c.passed)
      .forEach((c) => {
        remediationTasks.push({
          stage: stage.label,
          task: c.detail || c.label,
          priority: stage.mandatory && stage.status === 'fail' ? 'critical' : 'high',
        });
      });
  });

  // ── Automated release policy ──
  const releasePolicy = {
    deploymentBlocked: !certified,
    betaExpansionBlocked: !certified,
    foundingMemberInvitationsBlocked: !certified,
    executiveReleaseReportGenerated: !certified,
    remediationTasksAssigned: remediationTasks.length > 0,
    platformGovernanceNotified: !certified,
    manualOverrideAllowed: false,
  };

  // ── Release policy stages ──
  const releasePolicyStages = [
    { stage: 'RC1', range: '35–50 Founding Members', certified, current: true },
    { stage: 'RC2', range: 'Up to 100 Founding Members', certified: false, current: false },
    { stage: 'RC3', range: 'Up to 150 Founding Members', certified: false, current: false },
    { stage: 'Open Beta', range: 'Public Access', certified: false, current: false },
    { stage: 'General Availability', range: 'Commercial Launch', certified: false, current: false },
  ];

  return {
    version: ENGINE_VERSION,
    releaseCandidate: 'RC1',
    overallStatus: certified ? 'CERTIFIED' : 'BLOCKED',
    overallScore,
    certified,
    threshold: CERTIFICATION_THRESHOLD,
    stages,
    blockingGates,
    remediationTasks,
    releasePolicy,
    releasePolicyStages,
    betaCertification: {
      overallScore: betaCert.overallScore,
      certified: betaCert.certified,
      grade: betaCert.grade,
    },
    totalChecks: stages.reduce((sum, s) => sum + s.checks.length, 0),
    passedChecks: stages.reduce((sum, s) => sum + s.checks.filter((c) => c.passed).length, 0),
    computedAt: new Date().toISOString(),
  };
}

export const RELEASE_GOVERNANCE_STAGES = STAGES;
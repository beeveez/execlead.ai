import { AUTHORIZED_DEPENDENCY_LIST, PROHIBITED_BUSINESS_MODULES, isAuthorizedPath } from './architecture/authorizedDependencyList';
import { getRepository } from './repositories/Base44Repository';

// Platform Exception Governance™ — Architecture Standard v1.0.
// Business logic MUST NEVER depend directly on Base44. Direct runtime
// access is permitted only inside approved infrastructure adapters.
// New/unauthorized direct usage = Architecture Violation (fails CI/CD).
// Pre-existing legacy usage = Architecture Debt (tracked, opportunistic).

export const ARCHITECTURE_WARNING =
  'Direct Base44 runtime access is not permitted in business modules. ' +
  'Please use the appropriate Platform Service™ or Repository™ abstraction. ' +
  'If no suitable abstraction exists, submit an Architecture Exception Request.';

// Business module manifest — known modules + their current direct-Base44 state.
// status: 'migrated' (clean) | 'debt' (legacy direct usage, opportunistic) | 'violation' (unauthorized/new)
const BUSINESS_MODULE_MANIFEST = [
  { name: 'Executive Coach™', file: 'src/pages/Coach.jsx', category: 'UI page', status: 'migrated', directBase44: false, recommendedService: 'RecommendationService™ / ExecutiveContextService™ / AIService™' },
  { name: 'Resume Builder™', file: 'src/pages/ResumeIntelligence.jsx', category: 'UI page', status: 'migrated', directBase44: false, recommendedService: 'IdentityService™ / UserService™ / AIService™ / StorageService™' },
  { name: 'Executive Simulator™', file: 'src/pages/Simulator.jsx', category: 'Feature module', status: 'debt', directBase44: true, recommendedService: 'AIService™ + ExecutiveContextService™' },
  { name: 'Executive Journey™', file: 'src/pages/Journey.jsx', category: 'Feature module', status: 'debt', directBase44: true, recommendedService: 'JourneyService™' },
  { name: 'Executive Readiness™', file: 'src/pages/ExecutiveReadiness.jsx', category: 'Feature module', status: 'debt', directBase44: true, recommendedService: 'ExecutiveContextService™ + RecommendationService™' },
  { name: 'Executive Identity™', file: 'src/pages/ExecutiveBrandCenter.jsx', category: 'Feature module', status: 'debt', directBase44: true, recommendedService: 'IdentityService™' },
  { name: 'Executive Success Stories™', file: 'src/pages/ExecutiveSuccessStories.jsx', category: 'Feature module', status: 'debt', directBase44: true, recommendedService: 'RecommendationService™' },
  { name: 'Recommendation Engine™', file: 'src/lib/recommendationIntelligenceEngine.js', category: 'Business rules', status: 'debt', directBase44: true, recommendedService: 'RecommendationService™' },
  { name: 'Experience Engine™', file: 'src/lib/experienceIntelligence/', category: 'Business rules', status: 'debt', directBase44: true, recommendedService: 'ExecutiveContextService™' },
  { name: 'Dashboard', file: 'src/pages/Dashboard.jsx', category: 'Dashboard component', status: 'debt', directBase44: true, recommendedService: 'ExecutiveContextService™ + RecommendationService™' },
];

function remediationFor(m) {
  return `Migrate "${m.name}" (${m.file}) off direct Base44 usage. Replace with ${m.recommendedService}.`;
}

// Architecture Validation™ — scan the manifest for violations + debt.
export function runArchitectureValidation() {
  const violations = BUSINESS_MODULE_MANIFEST
    .filter((m) => m.status === 'violation')
    .map((m) => ({
      id: `AV-${m.name}`,
      module: m.name,
      file: m.file,
      category: m.category,
      severity: 'high',
      reason: 'Unauthorized direct Base44 runtime access in a business module.',
      remediation: remediationFor(m),
      recommendedService: m.recommendedService,
    }));

  const debt = BUSINESS_MODULE_MANIFEST
    .filter((m) => m.status === 'debt')
    .map((m) => ({
      id: `AD-${m.name}`,
      module: m.name,
      file: m.file,
      category: m.category,
      severity: 'medium',
      reason: 'Pre-existing direct Base44 usage — migrate opportunistically when enhanced.',
      remediation: remediationFor(m),
      recommendedService: m.recommendedService,
    }));

  const migrated = BUSINESS_MODULE_MANIFEST.filter((m) => m.status === 'migrated');

  return {
    passed: violations.length === 0,
    violations,
    debt,
    migrated,
    authorizedLayers: AUTHORIZED_DEPENDENCY_LIST,
    prohibitedModules: PROHIBITED_BUSINESS_MODULES,
    summary: {
      totalModules: BUSINESS_MODULE_MANIFEST.length,
      migratedCount: migrated.length,
      debtCount: debt.length,
      violationCount: violations.length,
    },
  };
}

// Developer Experience — emit the standard architecture warning.
export function warnDirectBase44Usage(moduleName, filePath) {
  const msg = `[Architecture Governance] ${ARCHITECTURE_WARNING} (detected in ${moduleName} — ${filePath})`;
  if (typeof console !== 'undefined') console.warn(msg);
  return msg;
}

// Exception Registry™ — centralized audit of approved direct-usage exceptions.
const excRepo = () => getRepository('ArchitectureException');

export async function listArchitectureExceptions() {
  return excRepo().filter({}, '-created_date', 200).catch(() => []);
}

export async function createArchitectureException(record) {
  const payload = {
    exception_id: record.exception_id || `EXC-${Date.now().toString().slice(-6)}`,
    ...record,
    approval_status: record.approval_status || 'submitted',
    current_state: record.current_state || 'active',
  };
  return excRepo().create(payload);
}

export async function updateArchitectureException(id, patch) {
  return excRepo().update(id, patch);
}

// Exception review record template — fields every approved exception must carry.
export function getExceptionReviewTemplate() {
  return [
    'Exception ID', 'Owner', 'Date Approved', 'Reviewer', 'Affected Module',
    'Reason', 'Alternative Considered', 'Risk Assessment', 'Planned Resolution',
    'Target Removal Version', 'Current Status',
  ];
}

// ─────────────────────────────────────────────────────────────────────────
// Architecture Governance Board™ proposal engine
// (pre-existing exports — restored alongside the Platform Exception
//  Governance™ additions above so the Board UI continues to build.)
// ─────────────────────────────────────────────────────────────────────────

export const STATUS_META = {
  draft: { label: 'Draft', color: '#94a3b8' },
  submitted: { label: 'Submitted', color: '#6366f1' },
  under_review: { label: 'Under Review', color: '#f59e0b' },
  approved: { label: 'Approved', color: '#10b981' },
  approved_with_conditions: { label: 'Approved w/ Conditions', color: '#22c55e' },
  needs_revision: { label: 'Needs Revision', color: '#f97316' },
  rejected: { label: 'Rejected', color: '#ef4444' },
};

export const RECOMMENDATION_META = {
  pending: { label: 'Pending', bg: 'bg-white/5', text: 'text-white/40' },
  approve: { label: 'Approve', bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
  approve_with_conditions: { label: 'Approve w/ Conditions', bg: 'bg-emerald-500/10', text: 'text-emerald-300' },
  needs_revision: { label: 'Needs Revision', bg: 'bg-amber-500/15', text: 'text-amber-400' },
  reject: { label: 'Reject', bg: 'bg-rose-500/15', text: 'text-rose-400' },
};

export const PROPOSAL_TYPE_META = {
  new_feature: { label: 'New Feature' },
  refactor: { label: 'Refactor' },
  removal: { label: 'Removal' },
  deprecation: { label: 'Deprecation' },
  breaking_change: { label: 'Breaking Change' },
  migration: { label: 'Migration' },
  experiment: { label: 'Experiment' },
};

export const SCORE_DIMENSIONS = [
  { key: 'business_justification', label: 'Business Justification', weight: 0.15, invert: false },
  { key: 'user_impact', label: 'User Impact', weight: 0.15, invert: false },
  { key: 'technical_fit', label: 'Technical Fit', weight: 0.15, invert: false },
  { key: 'security', label: 'Security Posture', weight: 0.15, invert: false },
  { key: 'privacy', label: 'Privacy', weight: 0.10, invert: false },
  { key: 'maintainability', label: 'Maintainability', weight: 0.10, invert: false },
  { key: 'release_readiness', label: 'Release Readiness', weight: 0.10, invert: false },
  { key: 'maintenance_cost', label: 'Maintenance Cost', weight: 0.10, invert: true },
];

export function generateProposalId(existing = []) {
  let max = 0;
  for (const p of existing) {
    const m = /AP-(\d+)/.exec(p.proposal_id || '');
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return `AP-${String(max + 1).padStart(4, '0')}`;
}

export function evaluateProposal(scores = {}) {
  let weighted = 0, weightSum = 0;
  for (const dim of SCORE_DIMENSIONS) {
    const raw = scores[dim.key] ?? 50;
    const adjusted = dim.invert ? (100 - raw) : raw;
    weighted += adjusted * dim.weight;
    weightSum += dim.weight;
  }
  const overallScore = weightSum > 0 ? Math.round(weighted / weightSum) : 0;
  let recommendation = 'pending', rationale = 'Awaiting reviewer scoring.';
  if (overallScore >= 75) { recommendation = 'approve'; rationale = 'Strong architecture impact score across all dimensions.'; }
  else if (overallScore >= 60) { recommendation = 'approve_with_conditions'; rationale = 'Acceptable score — attach conditions for weaker dimensions.'; }
  else if (overallScore >= 40) { recommendation = 'needs_revision'; rationale = 'Score below threshold — revise lower-rated dimensions before approval.'; }
  else { recommendation = 'reject'; rationale = 'Insufficient architecture impact — proposal should be reworked or declined.'; }
  return { overallScore, recommendation, rationale };
}

export default {
  ARCHITECTURE_WARNING,
  runArchitectureValidation,
  warnDirectBase44Usage,
  listArchitectureExceptions,
  createArchitectureException,
  updateArchitectureException,
  getExceptionReviewTemplate,
  isAuthorizedPath,
  STATUS_META,
  RECOMMENDATION_META,
  PROPOSAL_TYPE_META,
  SCORE_DIMENSIONS,
  generateProposalId,
  evaluateProposal,
};
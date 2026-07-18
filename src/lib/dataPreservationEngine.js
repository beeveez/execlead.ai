/**
 * Data Preservation & Zero Data Loss Standard™
 * Pre-Deployment Validation Engine
 *
 * Golden Rule #1: No release may be deployed unless automated validation
 * confirms that 100% of existing user profiles, uploaded files, identity
 * documents, subscriptions, AI memories, and relationships remain intact
 * after deployment.
 *
 * This engine manages baseline snapshots and post-deployment validation
 * by calling the validateDataPreservation backend function.
 */

import { base44 } from '@/api/base44Client';

const SNAPSHOT_STORAGE_KEY = 'execlead_data_preservation_baseline';
const STANDARD_VERSION = '1.0.0';

/**
 * Protected data categories that must survive every deployment.
 * These map to the entity groups validated by the backend function.
 */
export const PROTECTED_DATA_GROUPS = [
  { id: 'user_data', label: 'User Profiles & Identity', description: 'User profiles, executive credentials, leadership DNA', critical: true },
  { id: 'career_history', label: 'Career & Documents', description: 'Resumes, career documents, portfolios, achievements', critical: true },
  { id: 'identity_documents', label: 'Identity Documents', description: 'Identity verifications, evidence, government IDs', critical: true },
  { id: 'billing_history', label: 'Billing & Subscriptions', description: 'Invoices, subscriptions, billing events, wallet', critical: true },
  { id: 'ai_memory', label: 'AI Memory & Intelligence', description: 'Executive memory, AI agent state, request traces', critical: true },
  { id: 'leadership_journey', label: 'Leadership Journey', description: 'Journey events, simulations, challenges, journals', critical: true },
  { id: 'audit_history', label: 'Audit & Compliance', description: 'Audit logs, verification logs, usage logs', critical: true },
  { id: 'credentials', label: 'Certificates & Competencies', description: 'Certificates, executive competencies', critical: true },
];

/**
 * Capture a baseline snapshot before deployment.
 * Stores in localStorage for later comparison.
 */
export async function captureBaselineSnapshot() {
  const response = await base44.functions.invoke('validateDataPreservation', {}, { params: { action: 'snapshot' } });
  const snapshot = response.data?.snapshot;

  if (!snapshot) {
    throw new Error('Failed to capture baseline snapshot');
  }

  const baselineRecord = {
    ...snapshot,
    standard_version: STANDARD_VERSION,
    stored_at: new Date().toISOString(),
  };

  localStorage.setItem(SNAPSHOT_STORAGE_KEY, JSON.stringify(baselineRecord));
  return baselineRecord;
}

/**
 * Retrieve the stored baseline snapshot from localStorage.
 */
export function getStoredBaseline() {
  try {
    const raw = localStorage.getItem(SNAPSHOT_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Clear the stored baseline (after successful validation).
 */
export function clearBaseline() {
  localStorage.removeItem(SNAPSHOT_STORAGE_KEY);
}

/**
 * Run post-deployment validation against the stored baseline.
 * Returns a structured report with pass/fail per category.
 */
export async function validateDataPreservation() {
  const baseline = getStoredBaseline();
  if (!baseline) {
    throw new Error('No baseline snapshot found. Capture a baseline before deployment first.');
  }

  const response = await base44.functions.invoke(
    'validateDataPreservation',
    { baseline },
    { params: { action: 'validate' } }
  );

  const result = response.data;
  if (!result) {
    throw new Error('Validation returned no data');
  }

  // Enrich with group metadata
  const enrichedValidations = (result.validations || []).map(v => ({
    ...v,
    group: getGroupForEntity(v.entity),
  }));

  return {
    ...result,
    standard_version: STANDARD_VERSION,
    golden_rule_enforced: true,
    validations: enrichedValidations,
    baseline_snapshot: baseline,
  };
}

/**
 * Map entity name to its protected data group.
 */
function getGroupForEntity(entityName) {
  const groupMap = {
    UserProfile: 'user_data',
    ExecutiveCredential: 'user_data',
    LeadershipDNA: 'user_data',
    CareerResume: 'career_history',
    CareerDocument: 'career_history',
    ResumeVersion: 'career_history',
    PortfolioVersion: 'career_history',
    Achievement: 'career_history',
    IdentityVerification: 'identity_documents',
    EvidenceItem: 'identity_documents',
    IdentityVersion: 'identity_documents',
    ExecutiveIdentityTransfer: 'identity_documents',
    Subscription: 'billing_history',
    Invoice: 'billing_history',
    BillingEvent: 'billing_history',
    WalletTransaction: 'billing_history',
    ExecutiveMemory: 'ai_memory',
    AIAgentState: 'ai_memory',
    AIRequestTrace: 'ai_memory',
    JourneyEvent: 'leadership_journey',
    SimulationSession: 'leadership_journey',
    ChallengeResult: 'leadership_journey',
    JournalEntry: 'leadership_journey',
    LegacyAuditLog: 'audit_history',
    VerificationLog: 'audit_history',
    UsageLog: 'audit_history',
    FoundingMemberAuditLog: 'audit_history',
    Certificate: 'credentials',
    ExecutiveCompetency: 'credentials',
  };
  return groupMap[entityName] || 'other';
}

/**
 * Get a summary of the validation result for display.
 */
export function getValidationSummary(validationResult) {
  if (!validationResult) return null;

  const groups = {};
  for (const v of validationResult.validations || []) {
    const groupId = v.group || 'other';
    if (!groups[groupId]) {
      groups[groupId] = {
        group: groupId,
        total: 0,
        passed: 0,
        data_loss: 0,
        errors: 0,
        records_baseline: 0,
        records_current: 0,
      };
    }
    groups[groupId].total++;
    groups[groupId].records_baseline += v.baseline_count || 0;
    groups[groupId].records_current += v.current_count || 0;
    if (v.status === 'ok') groups[groupId].passed++;
    else if (v.status === 'data_loss') groups[groupId].data_loss++;
    else if (v.status === 'error') groups[groupId].errors++;
  }

  return {
    golden_rule_passed: validationResult.golden_rule_passed,
    data_loss_detected: validationResult.data_loss_detected,
    total_categories: validationResult.summary?.categories_total || 0,
    categories_passed: validationResult.summary?.categories_passed || 0,
    categories_with_data_loss: validationResult.summary?.categories_with_data_loss || 0,
    categories_with_errors: validationResult.summary?.categories_with_errors || 0,
    baseline_total: validationResult.baseline_total || 0,
    current_total: validationResult.current_total || 0,
    total_delta: validationResult.total_delta || 0,
    groups: Object.values(groups),
  };
}

export { STANDARD_VERSION };
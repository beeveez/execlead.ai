/**
 * Release Integrity Gate™ v3.0
 * Enterprise Autonomous Release Governance
 *
 * 8-Phase Pipeline:
 *   1. Pre-Deployment Analysis → 2. Integrity Validation → 3. Security Validation
 *   → 4. Application Validation → 5. Business Validation → 6. Risk Scoring
 *   → 7. Deployment Decision → 8. Post Deployment Monitoring
 *
 * All 10 gates run autonomously in the backend.
 * Manual checklists are exceptions, not the primary validation method.
 */

import { base44 } from '@/api/base44Client';

const GATE_VERSION = '3.0.0';
const BASELINE_STORAGE_KEY = 'execlead_release_integrity_baseline_v3';

// ═══════════════════════════════════════════════════════════
// GATE DEFINITIONS (for UI display)
// ═══════════════════════════════════════════════════════════

export const GATES = [
  { id: 1, name: 'Data Preservation', phase: 'Integrity Validation', description: 'Record counts, critical entities, AI memory, executive journey, uploaded documents', automated: true },
  { id: 2, name: 'Relationship Integrity', phase: 'Integrity Validation', description: 'Foreign keys, parent-child relationships, orphan detection, entity consistency', automated: true },
  { id: 3, name: 'Storage Integrity', phase: 'Integrity Validation', description: 'File exists, storage reachable, checksum valid, metadata valid, encryption enabled', automated: true },
  { id: 4, name: 'Security Validation', phase: 'Security Validation', description: 'Security headers, TLS, encryption, secret rotation, JWT, MFA, rate limiting, RBAC, zero trust', automated: true },
  { id: 5, name: 'Permission Drift Detection', phase: 'Security Validation', description: 'Compare RBAC against previous release — detect privilege escalation, role expansion, public exposure', automated: true },
  { id: 6, name: 'Tenant Isolation', phase: 'Security Validation', description: 'Tenant A cannot access Tenant B — organizations, users, invoices, reports, files, AI memory', automated: true },
  { id: 7, name: 'Schema Compatibility', phase: 'Application Validation', description: 'Database migration, indexes, constraints, foreign keys, entity compatibility, API compatibility', automated: true },
  { id: 8, name: 'Application Health', phase: 'Application Validation', description: 'Smoke tests — authentication, registration, dashboard, executive workspace, AI coach, billing, notifications, search, journey', automated: true },
  { id: 9, name: 'Backup & Recovery', phase: 'Business Validation', description: 'Backup completed, restore successful, rollback package available, recovery point valid, estimated recovery time', automated: true },
  { id: 10, name: 'AI Memory Validation', phase: 'Integrity Validation', description: 'AI conversations, preferences, and progress preserved', automated: true },
];

export const PIPELINE_PHASES = [
  { id: 1, name: 'Pre-Deployment Analysis', description: 'Capture baseline snapshot of all protected entities and RLS policies' },
  { id: 2, name: 'Integrity Validation', description: 'Data preservation, relationship integrity, storage integrity, AI memory' },
  { id: 3, name: 'Security Validation', description: 'Security validation, permission drift, tenant isolation' },
  { id: 4, name: 'Application Validation', description: 'Schema compatibility, application health smoke tests' },
  { id: 5, name: 'Business Validation', description: 'Backup & recovery verification' },
  { id: 6, name: 'Risk Scoring', description: 'Enterprise Risk Score™ — 0-100 with LOW/MEDIUM/HIGH/CRITICAL levels' },
  { id: 7, name: 'Deployment Decision', description: 'Automatic deployment decision based on risk score and gate results' },
  { id: 8, name: 'Post Deployment Monitoring', description: 'Monitor errors, performance, database, storage, AI services at 5/15/30/60 min intervals' },
];

export const RISK_LEVELS = {
  LOW: { color: 'emerald', label: 'LOW', description: 'Deploy Automatically' },
  MEDIUM: { color: 'amber', label: 'MEDIUM', description: 'Require Product Owner Approval' },
  HIGH: { color: 'orange', label: 'HIGH', description: 'Require Executive Approval' },
  CRITICAL: { color: 'red', label: 'CRITICAL', description: 'Deployment Blocked — Rollback Required' },
};

// ═══════════════════════════════════════════════════════════
// BASELINE MANAGEMENT
// ═══════════════════════════════════════════════════════════

export async function captureBaseline() {
  const response = await base44.functions.invoke('validateReleaseIntegrity', { action: 'snapshot' });
  const snapshot = response.data?.snapshot;
  if (!snapshot) throw new Error('Failed to capture baseline snapshot');
  const record = { ...snapshot, gate_version: GATE_VERSION, stored_at: new Date().toISOString() };
  localStorage.setItem(BASELINE_STORAGE_KEY, JSON.stringify(record));
  return record;
}

export function getStoredBaseline() {
  try {
    const raw = localStorage.getItem(BASELINE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function clearBaseline() {
  localStorage.removeItem(BASELINE_STORAGE_KEY);
}

// ═══════════════════════════════════════════════════════════
// FULL AUTONOMOUS VALIDATION — All 10 gates run in backend
// ═══════════════════════════════════════════════════════════

export async function runAllGates() {
  const baseline = getStoredBaseline();
  if (!baseline) throw new Error('No baseline snapshot found. Capture a baseline before deployment first.');

  const response = await base44.functions.invoke('validateReleaseIntegrity', { action: 'validate', baseline });
  const result = response.data;
  if (!result) throw new Error('Backend validation returned no data');

  // Supplement Gate 4 with frontend security header checks (DOM-only, can't run in backend)
  const frontendSecurityChecks = runFrontendSecurityChecks();
  const gate4 = result.gates.find(g => g.gate === 4);
  if (gate4) {
    gate4.checks = [...(gate4.checks || []), ...frontendSecurityChecks];
    const allSecurityPassed = gate4.checks.every(c => c.status === 'ok' || c.passed);
    gate4.passed = gate4.passed && allSecurityPassed;
    gate4.status = gate4.passed ? 'PASS' : 'FAIL';
    gate4.summary = {
      total: gate4.checks.length,
      passed: gate4.checks.filter(c => c.status === 'ok' || c.passed).length,
      failed: gate4.checks.filter(c => c.status === 'fail' || (!c.passed && c.status !== 'ok')).length,
    };
  }

  // Recompute overall score after frontend supplementation
  const allPassed = result.gates.every(g => g.passed);
  result.all_passed = allPassed;
  result.overall_integrity_score = Math.round((result.gates.filter(g => g.passed).length / result.gates.length) * 100);

  // Recompute risk score if security checks failed
  if (!allPassed && result.risk_level === 'LOW') {
    result.risk_score = Math.max(result.risk_score, 30);
    result.risk_level = 'MEDIUM';
    const decisions = getDecisionForLevel('MEDIUM', false);
    result.deployment_decision = decisions.code;
    result.deployment_decision_label = decisions.label;
    result.deployment_decision_description = decisions.description;
    result.recommendation = decisions.recommendation;
    result.recommendation_detail = decisions.recommendation_detail;
  }

  result.summary = {
    total: result.gates.length,
    passed: result.gates.filter(g => g.passed).length,
    failed: result.gates.filter(g => !g.passed).length,
  };

  return result;
}

// ═══════════════════════════════════════════════════════════
// FRONTEND SECURITY CHECKS (DOM-only — supplementary to backend Gate 4)
// ═══════════════════════════════════════════════════════════

const SECURITY_HEADER_CHECKS = [
  { id: 'csp', label: 'Content-Security-Policy header', check: () => !!document.querySelector('meta[http-equiv="Content-Security-Policy"]')?.getAttribute('content') },
  { id: 'hsts', label: 'Strict-Transport-Security header', check: () => {
    const v = document.querySelector('meta[http-equiv="Strict-Transport-Security"]')?.getAttribute('content') || '';
    return v.includes('max-age');
  }},
  { id: 'xfo', label: 'X-Frame-Options: DENY', check: () => document.querySelector('meta[http-equiv="X-Frame-Options"]')?.getAttribute('content') === 'DENY' },
  { id: 'nosniff', label: 'X-Content-Type-Options: nosniff', check: () => document.querySelector('meta[http-equiv="X-Content-Type-Options"]')?.getAttribute('content') === 'nosniff' },
  { id: 'referrer', label: 'Referrer-Policy set', check: () => !!document.querySelector('meta[name="referrer-policy"]')?.getAttribute('content') },
  { id: 'permissions', label: 'Permissions-Policy set', check: () => !!document.querySelector('meta[http-equiv="Permissions-Policy"]')?.getAttribute('content') },
];

function runFrontendSecurityChecks() {
  return SECURITY_HEADER_CHECKS.map(c => ({
    label: c.label,
    passed: c.check(),
    status: c.check() ? 'ok' : 'fail',
  }));
}

// ═══════════════════════════════════════════════════════════
// DECISION HELPER (for frontend recomputation)
// ═══════════════════════════════════════════════════════════

function getDecisionForLevel(riskLevel, allGatesPassed) {
  const decisions = {
    LOW: { code: 'AUTO_DEPLOY', label: 'Deploy Automatically', description: 'Risk score is LOW. All critical validations passed.', recommendation: 'Deploy', recommendation_detail: 'All gates passed. Risk score is LOW. Deployment is authorized.' },
    MEDIUM: { code: 'PRODUCT_OWNER_APPROVAL', label: 'Require Product Owner Approval', description: 'Risk score is MEDIUM. Product owner review required.', recommendation: 'Deploy with Warnings', recommendation_detail: 'Minor issues detected. Review warnings before proceeding.' },
    HIGH: { code: 'EXECUTIVE_APPROVAL', label: 'Require Executive Approval', description: 'Risk score is HIGH. Executive review required.', recommendation: 'Delay Deployment', recommendation_detail: 'Significant issues detected. Executive approval required.' },
    CRITICAL: { code: 'BLOCKED', label: 'Deployment Blocked — Rollback Required', description: 'Risk score is CRITICAL. Rollback is required.', recommendation: 'Rollback', recommendation_detail: 'Critical issues detected. Rollback is required.' },
  };
  if (!allGatesPassed && riskLevel === 'LOW') return decisions.MEDIUM;
  return decisions[riskLevel];
}

export { GATE_VERSION };
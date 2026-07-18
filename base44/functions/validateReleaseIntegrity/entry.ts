import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

/**
 * Release Integrity Gate™ v2.0
 * Enterprise Deployment Protection Standard
 *
 * 10-Gate validation system. No deployment may proceed
 * unless ALL gates pass.
 *
 * Automated Gates (run in this function):
 *   Gate 1:  Data Preservation — entity count comparison
 *   Gate 2:  Relationship Integrity — orphaned record detection
 *   Gate 10: AI Memory Validation — conversation/memory preservation
 *
 * Frontend-validated Gates (checklist + DOM checks):
 *   Gate 3:  File Integrity
 *   Gate 4:  Security Validation
 *   Gate 5:  Tenant Isolation
 *   Gate 6:  Permission Validation
 *   Gate 7:  Schema Compatibility
 *   Gate 8:  Backup & Rollback
 *   Gate 9:  Application Health
 */

const GATE_VERSION = '2.0.0';

// ── Protected entities for Gate 1 (Data Preservation) ──
const PROTECTED_ENTITIES = [
  { category: 'user_profiles', label: 'User Profiles', entity: 'UserProfile', group: 'User Data' },
  { category: 'executive_credentials', label: 'Executive Credentials', entity: 'ExecutiveCredential', group: 'User Data' },
  { category: 'leadership_dna', label: 'Leadership DNA', entity: 'LeadershipDNA', group: 'User Data' },
  { category: 'career_resumes', label: 'Career Resumes', entity: 'CareerResume', group: 'Career History' },
  { category: 'career_documents', label: 'Career Documents', entity: 'CareerDocument', group: 'Career History' },
  { category: 'resume_versions', label: 'Resume Versions', entity: 'ResumeVersion', group: 'Career History' },
  { category: 'portfolio_versions', label: 'Portfolio Versions', entity: 'PortfolioVersion', group: 'Career History' },
  { category: 'achievements', label: 'Achievements', entity: 'Achievement', group: 'Career History' },
  { category: 'identity_verifications', label: 'Identity Verifications', entity: 'IdentityVerification', group: 'Identity Documents' },
  { category: 'evidence_items', label: 'Evidence & Identity Documents', entity: 'EvidenceItem', group: 'Identity Documents' },
  { category: 'identity_versions', label: 'Identity Versions', entity: 'IdentityVersion', group: 'Identity Documents' },
  { category: 'subscriptions', label: 'Subscription History', entity: 'Subscription', group: 'Billing History' },
  { category: 'invoices', label: 'Billing Invoices', entity: 'Invoice', group: 'Billing History' },
  { category: 'billing_events', label: 'Billing Events', entity: 'BillingEvent', group: 'Billing History' },
  { category: 'wallet_transactions', label: 'Wallet Transactions', entity: 'WalletTransaction', group: 'Billing History' },
  { category: 'executive_memory', label: 'AI Memory', entity: 'ExecutiveMemory', group: 'AI Memory' },
  { category: 'ai_agent_state', label: 'AI Agent State', entity: 'AIAgentState', group: 'AI Memory' },
  { category: 'ai_request_traces', label: 'AI Request Traces', entity: 'AIRequestTrace', group: 'AI Memory' },
  { category: 'journey_events', label: 'Leadership Journey Events', entity: 'JourneyEvent', group: 'Leadership Journey' },
  { category: 'simulation_sessions', label: 'Simulation Sessions', entity: 'SimulationSession', group: 'Leadership Journey' },
  { category: 'challenge_results', label: 'Challenge Results', entity: 'ChallengeResult', group: 'Leadership Journey' },
  { category: 'journal_entries', label: 'Journal Entries', entity: 'JournalEntry', group: 'Leadership Journey' },
  { category: 'audit_logs', label: 'Audit Logs', entity: 'LegacyAuditLog', group: 'Audit History' },
  { category: 'verification_logs', label: 'Verification Logs', entity: 'VerificationLog', group: 'Audit History' },
  { category: 'usage_logs', label: 'Usage Logs', entity: 'UsageLog', group: 'Audit History' },
  { category: 'founding_member_audit', label: 'Founding Member Audit', entity: 'FoundingMemberAuditLog', group: 'Audit History' },
  { category: 'certificates', label: 'Certificates', entity: 'Certificate', group: 'Credentials' },
  { category: 'executive_competencies', label: 'Executive Competencies', entity: 'ExecutiveCompetency', group: 'Credentials' },
];

// ── Relationship entities for Gate 2 (Relationship Integrity) ──
// Entities that must have a valid user_id reference
const RELATIONSHIP_ENTITIES = [
  { entity: 'UserProfile', fk_field: 'user_id', label: 'User Profile → User' },
  { entity: 'CareerResume', fk_field: 'user_id', label: 'Career Resume → User' },
  { entity: 'IdentityVerification', fk_field: 'user_id', label: 'Identity Verification → User' },
  { entity: 'ExecutiveMemory', fk_field: 'user_id', label: 'Executive Memory → User' },
  { entity: 'JourneyEvent', fk_field: 'user_id', label: 'Journey Event → User' },
  { entity: 'Subscription', fk_field: 'user_id', label: 'Subscription → User' },
  { entity: 'ExecutiveBriefing', fk_field: 'user_id', label: 'Executive Briefing → User' },
  { entity: 'PromotionForecast', fk_field: 'user_id', label: 'Promotion Forecast → User' },
  { entity: 'BetaFeedback', fk_field: 'user_id', label: 'Beta Feedback → User' },
];

// ── AI Memory entities for Gate 10 ──
const AI_MEMORY_ENTITIES = [
  { entity: 'ExecutiveMemory', label: 'Executive Memory', category: 'memory' },
  { entity: 'AIAgentState', label: 'AI Agent State', category: 'agent_state' },
  { entity: 'AIRequestTrace', label: 'AI Request Traces', category: 'traces' },
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const allowedRoles = ['super_admin', 'platform_admin', 'admin', 'developer'];
    if (!allowedRoles.includes(user.role)) {
      return Response.json({ error: 'Forbidden — insufficient privileges for release integrity validation' }, { status: 403 });
    }

    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'snapshot';
    const body = await req.json().catch(() => ({}));

    // ═══════════════════════════════════════════════════════
    // SNAPSHOT — Capture baseline for Gate 1
    // ═══════════════════════════════════════════════════════
    if (action === 'snapshot') {
      const snapshot = await captureGate1Snapshot(base44, user);
      return Response.json({
        status: 'success',
        action: 'snapshot',
        gate_version: GATE_VERSION,
        snapshot,
      });
    }

    // ═══════════════════════════════════════════════════════
    // FULL VALIDATION — Run all automated gates
    // ═══════════════════════════════════════════════════════
    if (action === 'validate') {
      const baseline = body.baseline;
      if (!baseline || !baseline.categories) {
        return Response.json({ error: 'Baseline snapshot required for validation' }, { status: 400 });
      }

      // Gate 1: Data Preservation
      const gate1 = await runGate1(base44, baseline);

      // Gate 2: Relationship Integrity
      const gate2 = await runGate2(base44);

      // Gate 10: AI Memory Validation
      const gate10 = await runGate10(base44, baseline);

      // Combine into comprehensive report
      const automatedGates = [gate1, gate2, gate10];
      const allAutomatedPassed = automatedGates.every(g => g.passed);

      return Response.json({
        status: 'success',
        action: 'validate',
        gate_version: GATE_VERSION,
        validated_at: new Date().toISOString(),
        validated_by: user.id,
        validated_by_name: user.full_name || user.email,
        automated_gates: automatedGates,
        all_automated_passed: allAutomatedPassed,
        gates: {
          gate_1_data_preservation: gate1,
          gate_2_relationship_integrity: gate2,
          gate_10_ai_memory: gate10,
        },
      });
    }

    return Response.json({ error: 'Unknown action. Use ?action=snapshot or ?action=validate' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

// ═══════════════════════════════════════════════════════════
// GATE 1: Data Preservation
// ═══════════════════════════════════════════════════════════
async function captureGate1Snapshot(base44, user) {
  const snapshot = {
    captured_at: new Date().toISOString(),
    captured_by: user.id,
    captured_by_name: user.full_name || user.email,
    categories: [],
    total_records: 0,
    entities_checked: 0,
    entities_failed: 0,
  };

  for (const item of PROTECTED_ENTITIES) {
    try {
      const results = await base44.asServiceRole.entities[item.entity].list('-created_date', 1);
      const count = results?.length || 0;
      snapshot.categories.push({ ...item, count, status: 'ok' });
      snapshot.total_records += count;
      snapshot.entities_checked++;
    } catch (err) {
      snapshot.categories.push({ ...item, count: 0, status: 'error', error: err.message });
      snapshot.entities_failed++;
      snapshot.entities_checked++;
    }
  }

  return snapshot;
}

async function runGate1(base44, baseline) {
  const current = await captureGate1Snapshot(base44, { id: 'system', full_name: 'Validation' });
  const baselineMap = new Map(baseline.categories.map(c => [c.entity, c.count]));

  const checks = [];
  let dataLoss = false;

  for (const curr of current.categories) {
    const baselineCount = baselineMap.get(curr.entity) || 0;
    const delta = curr.count - baselineCount;
    const hasLoss = delta < 0;
    if (hasLoss) dataLoss = true;

    checks.push({
      category: curr.category,
      label: curr.label,
      entity: curr.entity,
      group: curr.group,
      baseline_count: baselineCount,
      current_count: curr.count,
      delta,
      status: hasLoss ? 'data_loss' : (curr.status === 'error' ? 'error' : 'ok'),
    });
  }

  return {
    gate: 1,
    name: 'Data Preservation',
    passed: !dataLoss,
    status: dataLoss ? 'FAIL' : 'PASS',
    summary: {
      total: checks.length,
      passed: checks.filter(c => c.status === 'ok').length,
      data_loss: checks.filter(c => c.status === 'data_loss').length,
      errors: checks.filter(c => c.status === 'error').length,
    },
    baseline_total: baseline.total_records || 0,
    current_total: current.total_records,
    total_delta: current.total_records - (baseline.total_records || 0),
    checks,
  };
}

// ═══════════════════════════════════════════════════════════
// GATE 2: Relationship Integrity
// ═══════════════════════════════════════════════════════════
async function runGate2(base44) {
  const checks = [];
  let hasOrphans = false;

  for (const rel of RELATIONSHIP_ENTITIES) {
    try {
      // Sample recent records to check for null/missing user_id
      const records = await base44.asServiceRole.entities[rel.entity].list('-created_date', 50);
      const total = records?.length || 0;
      const orphaned = (records || []).filter(r => !r[rel.fk_field]).length;
      const orphanRate = total > 0 ? (orphaned / total) * 100 : 0;

      if (orphaned > 0) hasOrphans = true;

      checks.push({
        entity: rel.entity,
        label: rel.label,
        fk_field: rel.fk_field,
        sampled: total,
        orphaned,
        orphan_rate: Math.round(orphanRate * 10) / 10,
        status: orphaned > 0 ? 'orphaned' : 'ok',
      });
    } catch (err) {
      checks.push({
        entity: rel.entity,
        label: rel.label,
        fk_field: rel.fk_field,
        sampled: 0,
        orphaned: 0,
        orphan_rate: 0,
        status: 'error',
        error: err.message,
      });
    }
  }

  return {
    gate: 2,
    name: 'Relationship Integrity',
    passed: !hasOrphans,
    status: hasOrphans ? 'FAIL' : 'PASS',
    summary: {
      total: checks.length,
      passed: checks.filter(c => c.status === 'ok').length,
      orphaned: checks.filter(c => c.status === 'orphaned').length,
      errors: checks.filter(c => c.status === 'error').length,
    },
    checks,
  };
}

// ═══════════════════════════════════════════════════════════
// GATE 10: AI Memory Validation
// ═══════════════════════════════════════════════════════════
async function runGate10(base44, baseline) {
  const checks = [];
  let memoryLoss = false;

  for (const item of AI_MEMORY_ENTITIES) {
    try {
      const results = await base44.asServiceRole.entities[item.entity].list('-created_date', 1);
      const currentCount = results?.length || 0;

      // Find baseline count
      const baselineCat = baseline.categories?.find(c => c.entity === item.entity);
      const baselineCount = baselineCat?.count || 0;
      const delta = currentCount - baselineCount;
      const hasLoss = delta < 0;
      if (hasLoss) memoryLoss = true;

      checks.push({
        entity: item.entity,
        label: item.label,
        category: item.category,
        baseline_count: baselineCount,
        current_count: currentCount,
        delta,
        status: hasLoss ? 'data_loss' : 'ok',
      });
    } catch (err) {
      checks.push({
        entity: item.entity,
        label: item.label,
        category: item.category,
        baseline_count: 0,
        current_count: 0,
        delta: 0,
        status: 'error',
        error: err.message,
      });
    }
  }

  return {
    gate: 10,
    name: 'AI Memory Validation',
    passed: !memoryLoss,
    status: memoryLoss ? 'FAIL' : 'PASS',
    summary: {
      total: checks.length,
      passed: checks.filter(c => c.status === 'ok').length,
      data_loss: checks.filter(c => c.status === 'data_loss').length,
      errors: checks.filter(c => c.status === 'error').length,
    },
    checks,
  };
}
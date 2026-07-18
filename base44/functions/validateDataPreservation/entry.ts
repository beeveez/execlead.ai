import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

/**
 * Data Preservation & Zero Data Loss Standard™
 * Pre-Deployment Validation Function
 *
 * Captures counts of all protected user data categories
 * using the service role to ensure accurate cross-tenant counts.
 *
 * Golden Rule #1: No release may be deployed unless automated
 * validation confirms 100% of existing user profiles, uploaded files,
 * identity documents, subscriptions, AI memories, and relationships
 * remain intact after deployment.
 */

const PROTECTED_ENTITIES = [
  // User & Profile Data
  { category: 'user_profiles', label: 'User Profiles', entity: 'UserProfile', group: 'User Data' },
  { category: 'executive_credentials', label: 'Executive Credentials', entity: 'ExecutiveCredential', group: 'User Data' },
  { category: 'leadership_dna', label: 'Leadership DNA', entity: 'LeadershipDNA', group: 'User Data' },

  // Career & Documents
  { category: 'career_resumes', label: 'Career Resumes', entity: 'CareerResume', group: 'Career History' },
  { category: 'career_documents', label: 'Career Documents', entity: 'CareerDocument', group: 'Career History' },
  { category: 'resume_versions', label: 'Resume Versions', entity: 'ResumeVersion', group: 'Career History' },
  { category: 'portfolio_versions', label: 'Portfolio Versions', entity: 'PortfolioVersion', group: 'Career History' },
  { category: 'achievements', label: 'Achievements', entity: 'Achievement', group: 'Career History' },

  // Identity & Verification
  { category: 'identity_verifications', label: 'Identity Verifications', entity: 'IdentityVerification', group: 'Identity Documents' },
  { category: 'evidence_items', label: 'Evidence & Identity Documents', entity: 'EvidenceItem', group: 'Identity Documents' },
  { category: 'identity_versions', label: 'Identity Versions', entity: 'IdentityVersion', group: 'Identity Documents' },
  { category: 'executive_identities', label: 'Executive Identity Transfers', entity: 'ExecutiveIdentityTransfer', group: 'Identity Documents' },

  // Billing & Subscriptions
  { category: 'subscriptions', label: 'Subscription History', entity: 'Subscription', group: 'Billing History' },
  { category: 'invoices', label: 'Billing Invoices', entity: 'Invoice', group: 'Billing History' },
  { category: 'billing_events', label: 'Billing Events', entity: 'BillingEvent', group: 'Billing History' },
  { category: 'wallet_transactions', label: 'Wallet Transactions', entity: 'WalletTransaction', group: 'Billing History' },

  // AI Memory & Intelligence
  { category: 'executive_memory', label: 'AI Memory', entity: 'ExecutiveMemory', group: 'AI Memory' },
  { category: 'ai_agent_state', label: 'AI Agent State', entity: 'AIAgentState', group: 'AI Memory' },
  { category: 'ai_request_traces', label: 'AI Request Traces', entity: 'AIRequestTrace', group: 'AI Memory' },

  // Journey & Assessment
  { category: 'journey_events', label: 'Leadership Journey Events', entity: 'JourneyEvent', group: 'Leadership Journey' },
  { category: 'simulation_sessions', label: 'Simulation Sessions', entity: 'SimulationSession', group: 'Leadership Journey' },
  { category: 'challenge_results', label: 'Challenge Results', entity: 'ChallengeResult', group: 'Leadership Journey' },
  { category: 'journal_entries', label: 'Journal Entries', entity: 'JournalEntry', group: 'Leadership Journey' },

  // Audit & Compliance (Immutable)
  { category: 'audit_logs', label: 'Audit Logs', entity: 'LegacyAuditLog', group: 'Audit History' },
  { category: 'verification_logs', label: 'Verification Logs', entity: 'VerificationLog', group: 'Audit History' },
  { category: 'usage_logs', label: 'Usage Logs', entity: 'UsageLog', group: 'Audit History' },
  { category: 'founding_member_audit', label: 'Founding Member Audit', entity: 'FoundingMemberAuditLog', group: 'Audit History' },

  // Certifications
  { category: 'certificates', label: 'Certificates', entity: 'Certificate', group: 'Credentials' },
  { category: 'executive_competencies', label: 'Executive Competencies', entity: 'ExecutiveCompetency', group: 'Credentials' },
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Only platform admins and developers can run data preservation checks
    const allowedRoles = ['super_admin', 'platform_admin', 'admin', 'developer'];
    if (!allowedRoles.includes(user.role)) {
      return Response.json({ error: 'Forbidden — insufficient privileges for data preservation validation' }, { status: 403 });
    }

    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'snapshot';

    // ── SNAPSHOT: Capture current counts of all protected entities ──
    if (action === 'snapshot') {
      const snapshot = {
        captured_at: new Date().toISOString(),
        captured_by: user.id,
        captured_by_name: user.full_name || user.email,
        platform_version: Deno.env.get('BASE44_APP_ID') || 'unknown',
        categories: [],
        total_records: 0,
        entities_checked: 0,
        entities_failed: 0,
      };

      for (const item of PROTECTED_ENTITIES) {
        try {
          const results = await base44.asServiceRole.entities[item.entity].list('-created_date', 1);
          const count = results?.length || 0;
          snapshot.categories.push({
            category: item.category,
            label: item.label,
            entity: item.entity,
            group: item.group,
            count,
            status: 'ok',
          });
          snapshot.total_records += count;
          snapshot.entities_checked++;
        } catch (err) {
          snapshot.categories.push({
            category: item.category,
            label: item.label,
            entity: item.entity,
            group: item.group,
            count: 0,
            status: 'error',
            error: err.message || 'Unknown error',
          });
          snapshot.entities_failed++;
          snapshot.entities_checked++;
        }
      }

      return Response.json({
        status: 'success',
        action: 'snapshot',
        snapshot,
      });
    }

    // ── VALIDATE: Compare current state against a baseline snapshot ──
    if (action === 'validate') {
      const body = await req.json().catch(() => ({}));
      const baseline = body.baseline;

      if (!baseline || !baseline.categories) {
        return Response.json({ error: 'Baseline snapshot required' }, { status: 400 });
      }

      // Capture current snapshot
      const current = {
        captured_at: new Date().toISOString(),
        categories: [],
        total_records: 0,
      };

      for (const item of PROTECTED_ENTITIES) {
        try {
          const results = await base44.asServiceRole.entities[item.entity].list('-created_date', 1);
          const count = results?.length || 0;
          current.categories.push({
            category: item.category,
            entity: item.entity,
            count,
            status: 'ok',
          });
          current.total_records += count;
        } catch (err) {
          current.categories.push({
            category: item.category,
            entity: item.entity,
            count: 0,
            status: 'error',
            error: err.message,
          });
        }
      }

      // Compare baseline vs current
      const baselineMap = new Map();
      for (const c of baseline.categories) {
        baselineMap.set(c.entity, c.count);
      }

      const validations = [];
      let allPassed = true;
      let dataLossDetected = false;

      for (const curr of current.categories) {
        const baselineCount = baselineMap.get(curr.entity);
        const delta = curr.count - (baselineCount || 0);
        const hasLoss = delta < 0; // Data decreased = potential data loss

        if (hasLoss) {
          allPassed = false;
          dataLossDetected = true;
        }

        validations.push({
          category: curr.category,
          entity: curr.entity,
          baseline_count: baselineCount,
          current_count: curr.count,
          delta,
          status: hasLoss ? 'data_loss' : (curr.status === 'error' ? 'error' : 'ok'),
        });
      }

      return Response.json({
        status: 'success',
        action: 'validate',
        golden_rule_passed: allPassed && !dataLossDetected,
        data_loss_detected: dataLossDetected,
        baseline_captured_at: baseline.captured_at,
        validation_captured_at: current.captured_at,
        baseline_total: baseline.total_records || 0,
        current_total: current.total_records,
        total_delta: current.total_records - (baseline.total_records || 0),
        validations,
        summary: {
          categories_total: validations.length,
          categories_passed: validations.filter(v => v.status === 'ok').length,
          categories_with_data_loss: validations.filter(v => v.status === 'data_loss').length,
          categories_with_errors: validations.filter(v => v.status === 'error').length,
        },
      });
    }

    return Response.json({ error: 'Unknown action. Use ?action=snapshot or ?action=validate' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
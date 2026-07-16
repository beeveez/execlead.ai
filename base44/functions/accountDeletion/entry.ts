import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const GRACE_PERIOD_DAYS = 30;
const RETENTION_YEARS = 7;
const CODE_EXPIRY_MINUTES = 10;

function maskEmail(email) {
  if (!email || !email.includes('@')) return email;
  const [local, domain] = email.split('@');
  const masked = local.length > 2 ? local[0] + '***' + local[local.length - 1] : '***';
  return masked + '@' + domain;
}

async function safeFilter(base44, entityName, filterObj, limit) {
  try {
    return await base44.asServiceRole.entities[entityName].filter(filterObj, '-created_date', limit || 100);
  } catch {
    return [];
  }
}

async function runPreDeletionChecks(base44, user) {
  const blockers = [];

  // 1. Active subscription
  try {
    const profiles = await safeFilter(base44, 'UserProfile', { created_by_id: user.id });
    const p = profiles[0];
    if (p && p.subscription_status === 'active' && p.subscription_plan && p.subscription_plan !== 'free') {
      blockers.push({ key: 'active_subscription', label: 'Active subscription', detail: 'Cancel your subscription in Billing before deleting your account.' });
    }
  } catch {}
  if (!blockers.some(b => b.key === 'active_subscription')) {
    try {
      const subs = await safeFilter(base44, 'Subscription', { created_by_id: user.id });
      if (subs.some(s => s.status === 'active' || s.status === 'trialing' || s.status === 'past_due')) {
        blockers.push({ key: 'active_subscription', label: 'Active subscription', detail: 'Cancel your subscription in Billing before deleting your account.' });
      }
    } catch {}
  }

  // 2. Pending invoices
  try {
    const invoices = await safeFilter(base44, 'Invoice', { owner_user_id: user.id });
    if (invoices.some(i => i.status === 'pending' || i.status === 'failed')) {
      blockers.push({ key: 'pending_invoices', label: 'Pending invoices', detail: 'Resolve pending or failed invoices in Billing.' });
    }
  } catch {}

  // 3. Organization owner
  try {
    const orgs = await safeFilter(base44, 'Organization', { admin_user_id: user.id });
    const activeOrgs = orgs.filter(o => o.plan_status === 'active' || o.plan_status === 'pending' || !o.plan_status);
    if (activeOrgs.length > 0) {
      blockers.push({ key: 'org_owner', label: 'Organization owner', detail: 'Transfer ownership or cancel your organization "' + (activeOrgs[0].name || '') + '" before deleting.' });
    }
  } catch {}

  // 4. Enterprise administrator
  try {
    const memberships = await safeFilter(base44, 'OrgMembership', { user_id: user.id });
    if (memberships.some(m => m.role === 'enterprise_admin' || m.role === 'admin')) {
      blockers.push({ key: 'enterprise_admin', label: 'Enterprise administrator', detail: 'You are an enterprise administrator. Transfer your admin role or contact your organization before deleting.' });
    }
  } catch {}

  // 5. Pending referral commissions — only block if a referral actually converted
  //    and earned a commission that hasn't been paid out. (commission_status defaults
  //    to "pending" on every record, so checking amount + converted status avoids
  //    false positives on mere invites.)
  try {
    const referrals = await safeFilter(base44, 'Referral', { referrer_user_id: user.id, status: 'converted' }, 200);
    const owed = referrals.filter(r => (r.commission_amount || 0) > 0 && (r.commission_status === 'pending' || r.commission_status === 'approved'));
    if (owed.length > 0) {
      const total = owed.reduce((s, r) => s + (r.commission_amount || 0), 0);
      blockers.push({ key: 'pending_commission', label: 'Pending referral commissions', detail: 'You have ' + owed.length + ' unpaid referral commission' + (owed.length > 1 ? 's' : '') + ' totalling $' + total.toFixed(2) + '. Pay out or forfeit in your Wallet before deleting.' });
    }
  } catch {}

  // 6. Marketplace seller balance
  try {
    const wallet = await safeFilter(base44, 'ExecutiveWallet', { user_id: user.id });
    if (wallet[0] && (wallet[0].balance || 0) > 0) {
      blockers.push({ key: 'marketplace_balance', label: 'Marketplace seller balance', detail: 'Withdraw your wallet balance of ' + (wallet[0].currency || 'USD') + ' ' + (wallet[0].balance || 0).toFixed(2) + ' before deleting.' });
    }
  } catch {}

  // 7. Pending payouts
  try {
    const payouts = await safeFilter(base44, 'WithdrawalRequest', { user_id: user.id, status: 'pending' });
    if (payouts.length > 0) {
      blockers.push({ key: 'pending_payout', label: 'Pending payouts', detail: 'Cancel or wait for pending wallet withdrawals to complete.' });
    }
  } catch {}

  // 8. Active developer applications
  try {
    if (user.role === 'developer' || user.role === 'admin' || user.role === 'super_admin') {
      const apiKeys = await safeFilter(base44, 'FeatureFlagAudit', { user_id: user.id });
      if (apiKeys.length > 0) {
        blockers.push({ key: 'developer_apps', label: 'Active developer applications', detail: 'Revoke your API keys and developer applications before deleting.' });
      }
    }
  } catch {}

  // 9. Legal retention requirement
  try {
    const dataRequests = await safeFilter(base44, 'DataSubjectRequest', { user_id: user.id });
    if (dataRequests.some(r => r.status === 'pending' || r.status === 'in_review')) {
      blockers.push({ key: 'legal_retention', label: 'Legal retention requirement', detail: 'An active data subject request requires data retention. Contact support for details.' });
    }
  } catch {}

  // 10. Security investigation
  try {
    const incidents = await safeFilter(base44, 'SecurityIncident', { user_id: user.id });
    if (incidents.some(i => i.status === 'open' || i.status === 'investigating')) {
      blockers.push({ key: 'security_investigation', label: 'Security investigation', detail: 'A security investigation is active on your account. Contact support.' });
    }
  } catch {}

  return blockers;
}

async function exportUserData(base44, user) {
  const data = { user: { id: user.id, email: user.email, full_name: user.full_name } };
  data.profile = await safeFilter(base44, 'UserProfile', { created_by_id: user.id }, 500);
  data.leadership_dna = await safeFilter(base44, 'LeadershipDNA', { user_id: user.id }, 500);
  data.resumes = await safeFilter(base44, 'ResumeVersion', { created_by_id: user.id }, 500);
  data.career_resumes = await safeFilter(base44, 'CareerResume', { created_by_id: user.id }, 500);
  data.certificates = await safeFilter(base44, 'Certificate', { created_by_id: user.id }, 500);
  data.journal = await safeFilter(base44, 'JournalEntry', { created_by_id: user.id }, 500);
  data.achievements = await safeFilter(base44, 'Achievement', { created_by_id: user.id }, 500);
  data.wallet = await safeFilter(base44, 'ExecutiveWallet', { user_id: user.id }, 500);
  data.wallet_transactions = await safeFilter(base44, 'WalletTransaction', { user_id: user.id }, 500);
  data.referrals = await safeFilter(base44, 'Referral', { referrer_user_id: user.id }, 500);
  data.learning_progress = await safeFilter(base44, 'LessonProgress', { created_by_id: user.id }, 500);
  data.simulations = await safeFilter(base44, 'SimulationSession', { created_by_id: user.id }, 500);
  data.challenges = await safeFilter(base44, 'ChallengeResult', { created_by_id: user.id }, 500);
  data.memberships = await safeFilter(base44, 'CommunityMembership', { user_id: user.id }, 500);
  data.identity = await safeFilter(base44, 'IdentityVerification', { user_id: user.id }, 500);
  return data;
}

async function deleteUserData(base44, userId) {
  if (!userId) return [];
  const results = [];
  const safeDelete = async (entityName, filterObj) => {
    try {
      await base44.asServiceRole.entities[entityName].deleteMany(filterObj);
      results.push({ entity: entityName, status: 'deleted' });
    } catch (e) {
      results.push({ entity: entityName, status: 'skipped', error: e.message });
    }
  };

  const userIdEntities = [
    'ExecutiveWallet', 'WalletTransaction', 'ExecutiveMemory', 'AIAgentState',
    'CommunityMembership', 'EventRegistration', 'ExecutiveInterest', 'SavedJob',
    'Notification', 'SecuritySession', 'TrustedDevice', 'IdentityVerification',
    'FoundingMember', 'LeadershipDNA', 'WithdrawalRequest', 'UserMembership',
    'SecurityIncident', 'ExecutiveLegacy', 'ProfileView', 'JobApplication',
    'ReferralTransaction'
  ];
  for (const name of userIdEntities) {
    await safeDelete(name, { user_id: userId });
  }

  await safeDelete('Referral', { referrer_user_id: userId });
  await safeDelete('ReferralEvent', { referrer_user_id: userId });
  await safeDelete('Subscription', { created_by_id: userId });

  const createdByEntities = [
    'UserProfile', 'ResumeVersion', 'CareerResume', 'CareerDocument',
    'JournalEntry', 'LessonProgress', 'Certificate', 'Achievement',
    'NetworkPost', 'SimulationSession', 'ChallengeResult', 'CouncilSession',
    'LegacyCaseStudy', 'ShareEvent'
  ];
  for (const name of createdByEntities) {
    await safeDelete(name, { created_by_id: userId });
  }

  return results;
}

async function buildDeletedItems(base44, user) {
  const items = [];
  try {
    const profiles = await safeFilter(base44, 'UserProfile', { created_by_id: user.id });
    if (profiles.length > 0) items.push('Executive Profile');
  } catch {}
  try {
    const resumes = await safeFilter(base44, 'ResumeVersion', { created_by_id: user.id });
    if (resumes.length > 0 || true) items.push('Resume Intelligence');
  } catch {}
  try {
    const memory = await safeFilter(base44, 'ExecutiveMemory', { user_id: user.id });
    if (memory.length > 0 || true) items.push('Executive Memory™');
  } catch {}
  try {
    const dna = await safeFilter(base44, 'LeadershipDNA', { user_id: user.id });
    if (dna.length > 0 || true) items.push('Leadership DNA™');
  } catch {}
  try {
    const profiles = await safeFilter(base44, 'UserProfile', { created_by_id: user.id });
    if (profiles[0] && profiles[0].career_intelligence_json) items.push('Career Intelligence™');
  } catch {}
  try {
    const journey = await safeFilter(base44, 'JourneyEvent', { user_id: user.id });
    if (journey.length > 0 || true) items.push('Executive Journey™');
  } catch {}
  try {
    const sims = await safeFilter(base44, 'SimulationSession', { created_by_id: user.id });
    if (sims.length > 0 || true) items.push('AI Conversations');
  } catch {}
  try {
    const insights = await safeFilter(base44, 'ExecutiveInterest', { user_id: user.id });
    if (insights.length > 0 || true) items.push('Saved Insights');
  } catch {}
  try {
    const passport = await safeFilter(base44, 'ExecutivePassport', { user_id: user.id });
    if (passport.length > 0 || true) items.push('Executive Passport™');
  } catch {}
  // Always ensure at least the core items
  if (items.length === 0) {
    items.push('Executive Profile', 'Resume Intelligence', 'Executive Memory™', 'Leadership DNA™', 'Career Intelligence™', 'Executive Journey™', 'AI Conversations', 'Saved Insights', 'Executive Passport™');
  }
  return items;
}

async function buildWarnings(base44, user) {
  const warnings = [];
  try {
    const fm = await safeFilter(base44, 'FoundingMember', { user_id: user.id, status: 'active' });
    if (fm.length > 0) warnings.push('Founding Member benefits are permanently forfeited.');
  } catch {}
  try {
    const wallet = await safeFilter(base44, 'ExecutiveWallet', { user_id: user.id });
    if (wallet[0] && (wallet[0].balance || 0) > 0) warnings.push('Wallet balance will be lost unless withdrawn.');
  } catch {}
  try {
    const certs = await safeFilter(base44, 'Certificate', { created_by_id: user.id });
    if (certs.length > 0) warnings.push('Downloaded certificates remain valid but cannot be reissued.');
  } catch {}
  warnings.push('This action is permanent.');
  warnings.push('Your Executive Identity cannot be recovered.');
  return warnings;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { action } = body;

    const getIp = () => {
      const fwd = req.headers.get('x-forwarded-for');
      if (fwd) return fwd.split(',')[0].trim();
      return req.headers.get('x-real-ip') || 'unknown';
    };

    // ---- check_eligibility: evaluate blockers without sending code ----
    if (action === 'check_eligibility') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

      const existingPending = await safeFilter(base44, 'AccountDeletionRequest', { user_id: user.id, status: 'pending_deletion' });
      if (existingPending.length > 0) {
        return Response.json({ already_scheduled: true, scheduled_deletion_at: existingPending[0].scheduled_deletion_at });
      }

      const blockers = await runPreDeletionChecks(base44, user);
      const deletedItems = await buildDeletedItems(base44, user);
      const warnings = await buildWarnings(base44, user);

      return Response.json({
        blockers,
        eligible: blockers.length === 0,
        deleted_items: deletedItems,
        warnings,
      });
    }

    // ---- request_deletion: run pre-checks + send verification code ----
    if (action === 'request_deletion') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

      const existingPending = await safeFilter(base44, 'AccountDeletionRequest', { user_id: user.id, status: 'pending_deletion' });
      if (existingPending.length > 0) {
        return Response.json({ error: 'You already have a deletion scheduled. Restore your account first.' }, { status: 400 });
      }

      const blockers = await runPreDeletionChecks(base44, user);
      const code = String(Math.floor(100000 + Math.random() * 900000));
      const expires = new Date(Date.now() + CODE_EXPIRY_MINUTES * 60000).toISOString();

      const existing = await safeFilter(base44, 'AccountDeletionRequest', { user_id: user.id, status: 'verification_pending' });
      const payload = {
        user_email: user.email,
        user_name: user.full_name,
        status: 'verification_pending',
        verification_code: code,
        verification_code_expires: expires,
        requested_at: new Date().toISOString(),
        ip_address: getIp(),
        blocked_reasons_json: JSON.stringify(blockers),
        reason: body.reason || '',
      };
      let requestRec;
      if (existing.length > 0) {
        requestRec = await base44.asServiceRole.entities.AccountDeletionRequest.update(existing[0].id, payload);
      } else {
        requestRec = await base44.asServiceRole.entities.AccountDeletionRequest.create({ user_id: user.id, ...payload });
      }

      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: user.email,
          subject: 'EXECLEAD.AI — Account Deletion Verification Code',
          body: 'Your verification code is: ' + code + '\n\nThis code expires in ' + CODE_EXPIRY_MINUTES + ' minutes.\n\nIf you did not request account deletion, please ignore this email and secure your account.',
        });
      } catch {}

      const deletedItems = await buildDeletedItems(base44, user);
      const warnings = await buildWarnings(base44, user);

      return Response.json({
        request_id: requestRec.id,
        blockers,
        can_proceed: blockers.length === 0,
        code_sent_to: maskEmail(user.email),
        deleted_items: deletedItems,
        warnings,
      });
    }

    // ---- verify_and_schedule: verify code + start 30-day grace period ----
    if (action === 'verify_and_schedule') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

      const requests = await safeFilter(base44, 'AccountDeletionRequest', { user_id: user.id, status: 'verification_pending' });
      if (requests.length === 0) {
        return Response.json({ error: 'No pending verification. Please start again.' }, { status: 400 });
      }
      const delReq = requests[0];
      if (!delReq.verification_code || delReq.verification_code !== body.code) {
        return Response.json({ error: 'Invalid verification code.' }, { status: 400 });
      }
      if (new Date(delReq.verification_code_expires) < new Date()) {
        return Response.json({ error: 'Verification code expired. Please request a new one.' }, { status: 400 });
      }

      const blockers = await runPreDeletionChecks(base44, user);
      if (blockers.length > 0) {
        return Response.json({ error: 'Pre-deletion checks now failing. Resolve the blockers and try again.', blockers }, { status: 400 });
      }

      const now = new Date();
      const scheduled = new Date(now.getTime() + GRACE_PERIOD_DAYS * 86400000);
      const retentionExpires = new Date(now.getTime() + (GRACE_PERIOD_DAYS + RETENTION_YEARS * 365) * 86400000);

      await base44.asServiceRole.entities.AccountDeletionRequest.update(delReq.id, {
        status: 'pending_deletion',
        scheduled_deletion_at: scheduled.toISOString(),
        retention_expires_at: retentionExpires.toISOString(),
        reason: body.reason || delReq.reason || '',
        verification_code: '',
      });

      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: user.email,
          subject: 'EXECLEAD.AI — Account Deletion Scheduled',
          body: 'Your account is scheduled for permanent deletion on ' + scheduled.toUTCString() + '.\n\nYou have ' + GRACE_PERIOD_DAYS + ' days to restore your account by logging in and selecting "Restore Account".\n\nAfter this period, all data will be permanently deleted.',
        });
      } catch {}

      return Response.json({
        scheduled_deletion_at: scheduled.toISOString(),
        grace_period_days: GRACE_PERIOD_DAYS,
      });
    }

    // ---- restore: cancel pending deletion during grace period ----
    if (action === 'restore') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

      const requests = await safeFilter(base44, 'AccountDeletionRequest', { user_id: user.id, status: 'pending_deletion' });
      if (requests.length === 0) {
        return Response.json({ error: 'No pending deletion to restore.' }, { status: 400 });
      }

      await base44.asServiceRole.entities.AccountDeletionRequest.update(requests[0].id, {
        status: 'restored',
        restored_at: new Date().toISOString(),
      });

      return Response.json({ restored: true });
    }

    // ---- get_status: check for active deletion request ----
    if (action === 'get_status') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

      const all = await safeFilter(base44, 'AccountDeletionRequest', { user_id: user.id }, 50);
      const active = all.find(r => r.status === 'pending_deletion' || r.status === 'verification_pending');
      return Response.json({ active_request: active || null });
    }

    // ---- export_data: collect user data for download ----
    if (action === 'export_data') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

      const data = await exportUserData(base44, user);
      return Response.json({ data, exported_at: new Date().toISOString() });
    }

    // ---- admin_list: list all deletion requests (admin only) ----
    if (action === 'admin_list') {
      const user = await base44.auth.me();
      if (!user || user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

      const all = await base44.asServiceRole.entities.AccountDeletionRequest.list('-requested_at', 500);
      return Response.json({ requests: all });
    }

    // ---- admin_restore: admin restores a pending deletion ----
    if (action === 'admin_restore') {
      const user = await base44.auth.me();
      if (!user || user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });
      if (!body.request_id) return Response.json({ error: 'request_id required' }, { status: 400 });

      await base44.asServiceRole.entities.AccountDeletionRequest.update(body.request_id, {
        status: 'restored',
        restored_at: new Date().toISOString(),
        admin_note: 'Restored by admin ' + (user.full_name || user.email),
      });

      return Response.json({ restored: true });
    }

    // ---- process_scheduled: execute deletions past grace period (admin/automation) ----
    if (action === 'process_scheduled') {
      const user = await base44.auth.me();
      if (!user || user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

      const now = new Date();
      const pending = await base44.asServiceRole.entities.AccountDeletionRequest.filter({ status: 'pending_deletion' }, 'scheduled_deletion_at', 200);
      const due = pending.filter(r => r.scheduled_deletion_at && new Date(r.scheduled_deletion_at) <= now);

      const results = [];
      for (const delReq of due) {
        try {
          const summary = await deleteUserData(base44, delReq.user_id);
          await base44.asServiceRole.entities.AccountDeletionRequest.update(delReq.id, {
            status: 'completed',
            completed_at: now.toISOString(),
            deletion_summary_json: JSON.stringify(summary),
          });
          results.push({ user_id: delReq.user_id, status: 'completed', entities_processed: summary.length });
        } catch (e) {
          results.push({ user_id: delReq.user_id, status: 'error', error: e.message });
        }
      }

      return Response.json({ processed: results.length, results });
    }

    return Response.json({ error: 'Unknown action: ' + (action || 'none') }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
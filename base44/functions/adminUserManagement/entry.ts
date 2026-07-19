import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

const FOUNDER_EMAIL = 'dev.rayvaldez@gmail.com';
const PLATFORM_ADMIN_ROLES = ['super_admin', 'platform_admin'];
const DEVELOPER_ROLES = ['developer'];
const OPERATIONS_ROLES = ['admin'];

// super_admin covers all role categories — the founder serves as permanent safety net
const covers = (u, roles) => u.role === 'super_admin' || roles.includes(u.role);

async function safeFilter(base44, entityName, filterObj, sort, limit) {
  try {
    return await base44.asServiceRole.entities[entityName].filter(filterObj, sort, limit || 100);
  } catch {
    return [];
  }
}

async function safeDelete(base44, entityName, filterObj) {
  try {
    await base44.asServiceRole.entities[entityName].deleteMany(filterObj);
    return true;
  } catch {
    return false;
  }
}

async function logAuditEvent(base44, event) {
  try {
    await base44.asServiceRole.entities.SecurityEvent.create({
      event_type: 'admin_action',
      severity: event.severity || 'info',
      description: event.description,
      user_id: event.actor_id || 'system',
      user_name: event.actor_name || 'System',
      action_taken: 'logged',
      metadata_json: JSON.stringify(event.metadata || {}),
    });
  } catch {}
}

function checkProtection(target, allUsers) {
  // Founder protection — absolute, can never be deleted
  if (target.email === FOUNDER_EMAIL) {
    return { protected: true, reason: 'This is the protected Founder account and cannot be deleted.' };
  }
  // Last-of-kind protection (super_admin covers all categories)
  if (covers(target, PLATFORM_ADMIN_ROLES)) {
    const count = allUsers.filter(u => covers(u, PLATFORM_ADMIN_ROLES)).length;
    if (count <= 1) return { protected: true, reason: 'Cannot delete the last Platform Administrator.' };
  }
  if (covers(target, DEVELOPER_ROLES)) {
    const count = allUsers.filter(u => covers(u, DEVELOPER_ROLES)).length;
    if (count <= 1) return { protected: true, reason: 'Cannot delete the last Developer.' };
  }
  if (covers(target, OPERATIONS_ROLES)) {
    const count = allUsers.filter(u => covers(u, OPERATIONS_ROLES)).length;
    if (count <= 1) return { protected: true, reason: 'Cannot delete the last Operations Administrator.' };
  }
  return { protected: false };
}

// Reuses the same data-cleanup pattern as accountDeletion.deleteUserData
async function deleteUserData(base44, userId) {
  let cleaned = 0;
  const userIdEntities = [
    'ExecutiveWallet', 'WalletTransaction', 'ExecutiveMemory', 'AIAgentState',
    'CommunityMembership', 'EventRegistration', 'ExecutiveInterest', 'SavedJob',
    'Notification', 'SecuritySession', 'TrustedDevice', 'IdentityVerification',
    'FoundingMember', 'LeadershipDNA', 'WithdrawalRequest', 'UserMembership',
    'SecurityIncident', 'ExecutiveLegacy', 'ProfileView', 'JobApplication',
    'ReferralTransaction',
  ];
  for (const name of userIdEntities) {
    if (await safeDelete(base44, name, { user_id: userId })) cleaned++;
  }

  await safeDelete(base44, 'Referral', { referrer_user_id: userId });
  await safeDelete(base44, 'ReferralEvent', { referrer_user_id: userId });
  await safeDelete(base44, 'Subscription', { created_by_id: userId });

  const createdByEntities = [
    'UserProfile', 'ResumeVersion', 'CareerResume', 'CareerDocument',
    'JournalEntry', 'LessonProgress', 'Certificate', 'Achievement',
    'NetworkPost', 'SimulationSession', 'ChallengeResult', 'CouncilSession',
    'LegacyCaseStudy', 'ShareEvent',
  ];
  for (const name of createdByEntities) {
    if (await safeDelete(base44, name, { created_by_id: userId })) cleaned++;
  }

  return cleaned;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { action } = body;

    // Auth — admin only
    let user = null;
    try { user = await base44.auth.me(); } catch (_) {}
    if (!user || !['super_admin', 'platform_admin', 'admin', 'developer'].includes(user.role)) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // ── check_protection: is a user protected from deletion? ──
    if (action === 'check_protection') {
      const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 500);
      const target = allUsers.find(u => u.id === body.target_user_id || u.email === body.target_email);
      if (!target) return Response.json({ error: 'User not found' }, { status: 404 });
      const protection = checkProtection(target, allUsers);
      return Response.json({ user: { id: target.id, email: target.email, role: target.role }, ...protection });
    }

    // ── cleanup_test_users: delete all non-protected users ──
    if (action === 'cleanup_test_users') {
      const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 500);
      const results = [];

      for (const target of allUsers) {
        const protection = checkProtection(target, allUsers);
        if (protection.protected) {
          results.push({ email: target.email, status: 'protected', reason: protection.reason });
          continue;
        }

        // Clean up related data first (notifications, sessions, conversations, etc.)
        const entitiesCleaned = await deleteUserData(base44, target.id);

        // Delete the User record
        try {
          await base44.asServiceRole.entities.User.delete(target.id);
          results.push({ email: target.email, status: 'deleted', entities_cleaned: entitiesCleaned });

          await logAuditEvent(base44, {
            description: `User cleanup: deleted ${target.email} (${target.full_name || 'Unknown'})`,
            actor_id: user.id,
            actor_name: user.full_name || user.email,
            severity: 'high',
            metadata: { deleted_user_id: target.id, deleted_email: target.email, deleted_name: target.full_name, entities_cleaned: entitiesCleaned },
          });
        } catch (e) {
          results.push({ email: target.email, status: 'error', error: e.message });
          await logAuditEvent(base44, {
            description: `User cleanup FAILED: ${target.email} — ${e.message}`,
            actor_id: user.id,
            actor_name: user.full_name || user.email,
            severity: 'critical',
            metadata: { target_user_id: target.id, target_email: target.email, error: e.message },
          });
        }
      }

      const deleted = results.filter(r => r.status === 'deleted').length;
      const protectedCount = results.filter(r => r.status === 'protected').length;
      const errors = results.filter(r => r.status === 'error').length;

      return Response.json({ total: allUsers.length, deleted, protected: protectedCount, errors, results });
    }

    // ── delete_user: admin-initiated single user deletion ──
    if (action === 'delete_user') {
      const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 500);
      const target = allUsers.find(u => u.id === body.target_user_id);
      if (!target) return Response.json({ error: 'User not found' }, { status: 404 });

      const protection = checkProtection(target, allUsers);
      if (protection.protected) {
        await logAuditEvent(base44, {
          description: `Blocked deletion of protected user: ${target.email}`,
          actor_id: user.id,
          actor_name: user.full_name || user.email,
          severity: 'critical',
          metadata: { target_user_id: target.id, target_email: target.email, reason: protection.reason },
        });
        return Response.json({ error: protection.reason }, { status: 400 });
      }

      const entitiesCleaned = await deleteUserData(base44, target.id);
      await base44.asServiceRole.entities.User.delete(target.id);

      await logAuditEvent(base44, {
        description: `Admin deleted user: ${target.email} (${target.full_name || 'Unknown'})`,
        actor_id: user.id,
        actor_name: user.full_name || user.email,
        severity: 'high',
        metadata: { deleted_user_id: target.id, deleted_email: target.email, deleted_name: target.full_name, entities_cleaned: entitiesCleaned },
      });

      return Response.json({ deleted: true, email: target.email, entities_cleaned: entitiesCleaned });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import {
  logAuditRecord,
  securityResponse,
  getClientIp,
} from '../../shared/auth.ts';

async function safeFilter(base44, entityName, filterObj, sort, limit) {
  try {
    return await base44.asServiceRole.entities[entityName].filter(filterObj, sort, limit || 100);
  } catch {
    return [];
  }
}

async function runPreDeletionChecks(base44, org) {
  const blockers = [];

  const members = await safeFilter(base44, 'UserProfile', { organization_id: org.id });
  if (members.length > 1) {
    blockers.push({ key: 'active_members', label: 'Active Team Members', detail: `Remove all ${members.length - 1} other member(s) from the organization before deleting. Only the owner can remain.` });
  }

  const invoices = await safeFilter(base44, 'Invoice', { organization_id: org.id });
  if (invoices.some(i => i.status === 'pending' || i.status === 'failed')) {
    blockers.push({ key: 'outstanding_invoice', label: 'Outstanding Invoice', detail: 'Resolve pending or failed invoices before deletion.' });
  }

  if (org.plan_status === 'active') {
    blockers.push({ key: 'active_subscription', label: 'Active Subscription', detail: 'Archive (suspend) the organization before deleting.' });
  }

  return blockers;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { action } = body;

    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const profiles = await safeFilter(base44, 'UserProfile', { created_by_id: user.id });
    const profile = profiles[0];
    if (!profile?.organization_id) {
      return Response.json({ error: 'You are not part of an organization.' }, { status: 400 });
    }

    const org = await base44.asServiceRole.entities.Organization.get(profile.organization_id);
    if (!org) {
      return Response.json({ error: 'Organization not found.' }, { status: 404 });
    }

    const is_owner = org.admin_user_id === user.id;

    if (action === 'get_status') {
      const members = await safeFilter(base44, 'UserProfile', { organization_id: org.id });
      const eligible = members.filter(m => m.id !== profile.id && m.status !== 'inactive');
      return Response.json({
        org: { id: org.id, name: org.name, plan_status: org.plan_status, plan: org.plan, seats_used: org.seats_used, seats_total: org.seats_total },
        is_owner,
        member_count: members.length,
        eligible_owners: eligible.map(m => ({
          user_id: m.created_by_id,
          name: m.full_name || 'Unknown',
          email: m.email || '',
          role: m.custom_role || 'Enterprise User',
        })),
      });
    }

    if (!is_owner) {
      return Response.json({ error: 'Only the organization owner can perform this action.' }, { status: 403 });
    }

    if (action === 'archive') {
      await base44.asServiceRole.entities.Organization.update(org.id, { plan_status: 'suspended' });
      return Response.json({ success: true, plan_status: 'suspended' });
    }

    if (action === 'restore') {
      await base44.asServiceRole.entities.Organization.update(org.id, { plan_status: 'active' });
      return Response.json({ success: true, plan_status: 'active' });
    }

    if (action === 'transfer_ownership') {
      if (!body.new_owner_user_id) {
        return Response.json({ error: 'new_owner_user_id required' }, { status: 400 });
      }
      const newOwnerProfiles = await safeFilter(base44, 'UserProfile', { created_by_id: body.new_owner_user_id });
      const newOwner = newOwnerProfiles[0];
      if (!newOwner || newOwner.organization_id !== org.id) {
        return Response.json({ error: 'Selected user is not a member of this organization.' }, { status: 400 });
      }
      await base44.asServiceRole.entities.Organization.update(org.id, {
        admin_user_id: body.new_owner_user_id,
        admin_email: newOwner.email || user.email,
      });
      await base44.asServiceRole.entities.UserProfile.update(newOwner.id, { custom_role: 'Organization Owner' });
      if (profile.id !== newOwner.id) {
        await base44.asServiceRole.entities.UserProfile.update(profile.id, { custom_role: 'Enterprise Admin' });
      }
      await logAuditRecord(base44, {
        category: 'operations',
        action: 'organization_transfer_ownership',
        authMethod: 'admin_user',
        performedById: user.id,
        performedByName: user.full_name || user.email,
        targetEntity: 'Organization',
        targetEntityId: org.id,
        status: 'completed',
        severity: 'high',
        requestId: crypto.randomUUID(),
        ipAddress: getClientIp(req),
        metadata: { old_owner: user.email, new_owner_id: body.new_owner_user_id, new_owner_name: newOwner.full_name },
      });

      return Response.json({ success: true, new_owner: newOwner.full_name });
    }

    if (action === 'check_prerequisites') {
      const blockers = await runPreDeletionChecks(base44, org);
      return Response.json({ can_proceed: blockers.length === 0, blockers });
    }

    if (action === 'delete') {
      if (body.confirm_name !== org.name) {
        return Response.json({ error: 'Organization name does not match. Type the exact name to confirm.' }, { status: 400 });
      }
      const blockers = await runPreDeletionChecks(base44, org);
      if (blockers.length > 0) {
        return Response.json({ error: 'Prerequisites not met.', blockers }, { status: 400 });
      }
      const members = await safeFilter(base44, 'UserProfile', { organization_id: org.id });
      for (const m of members) {
        await base44.asServiceRole.entities.UserProfile.update(m.id, {
          organization_id: '', custom_role: '', department: '', department_id: '', manager_id: '', manager_name: '',
        });
      }
      try { await base44.asServiceRole.entities.Department.deleteMany({ organization_id: org.id }); } catch {}
      await base44.asServiceRole.entities.Organization.delete(org.id);

      await logAuditRecord(base44, {
        category: 'operations',
        action: 'organization_delete',
        authMethod: 'admin_user',
        performedById: user.id,
        performedByName: user.full_name || user.email,
        targetEntity: 'Organization',
        targetEntityId: org.id,
        status: 'completed',
        severity: 'critical',
        requestId: crypto.randomUUID(),
        ipAddress: getClientIp(req),
        metadata: { org_name: org.name, members_cleaned: members.length },
      });

      return Response.json({ success: true, deleted: true });
    }

    if (action === 'export_data') {
      const members = await safeFilter(base44, 'UserProfile', { organization_id: org.id });
      const departments = await safeFilter(base44, 'Department', { organization_id: org.id });
      const invoices = await safeFilter(base44, 'Invoice', { organization_id: org.id });
      return Response.json({
        data: {
          organization: { ...org },
          members: members.map(m => ({ full_name: m.full_name, email: m.email, custom_role: m.custom_role, department: m.department, status: m.status })),
          departments,
          invoices,
        },
        exported_at: new Date().toISOString(),
      });
    }

    return Response.json({ error: 'Unknown action: ' + (action || 'none') }, { status: 400 });
  } catch (error) {
    // Never expose internal error details (Standard: generic security responses)
    console.error('organizationDangerZone error:', error.message);
    return securityResponse(500);
  }
});
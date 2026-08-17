import { createClientFromRequest } from 'npm:@base44/sdk@0.8.42';
import { resolveActiveOrgMembership } from '../../shared/authoritativeOrgAccess.ts';
import { logAuditRecord, securityResponse, getClientIp } from '../../shared/auth.ts';

async function safeFilter(base44, entityName, filter, sort = '-created_date', limit = 100) {
  return base44.asServiceRole.entities[entityName].filter(filter, sort, limit);
}

async function runPreDeletionChecks(base44, organization) {
  const blockers = [];
  const [memberships, invoices] = await Promise.all([
    safeFilter(base44, 'OrgMembership', { organization_id: organization.id, status: 'active' }),
    safeFilter(base44, 'Invoice', { organization_id: organization.id }),
  ]);
  if (memberships.length > 1) blockers.push({ key: 'active_members', label: 'Active Team Members', detail: `Remove all ${memberships.length - 1} other member(s) before deleting. Only the owner can remain.` });
  if (invoices.some((invoice) => ['pending', 'failed'].includes(invoice.status))) blockers.push({ key: 'outstanding_invoice', label: 'Outstanding Invoice', detail: 'Resolve pending or failed invoices before deleting.' });
  if (organization.plan_status === 'active') blockers.push({ key: 'active_subscription', label: 'Active Subscription', detail: 'Archive the organization before deleting.' });
  return blockers;
}

async function audit(base44, req, user, organization, action, metadata = {}, severity = 'high') {
  await logAuditRecord(base44, {
    category: 'operations', action, authMethod: 'admin_user',
    performedById: user.id, performedByName: user.full_name || user.email,
    targetEntity: 'Organization', targetEntityId: organization.id,
    status: 'completed', severity, requestId: crypto.randomUUID(),
    ipAddress: getClientIp(req), metadata,
  });
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json().catch(() => ({}));
    const access = await resolveActiveOrgMembership(base44, user, {
      requestedOrgId: body.organization_id,
      allowedRoles: ['organization_admin'],
    });
    if (!access) return Response.json({ error: 'Forbidden' }, { status: 403 });

    const organization = access.organization;
    const profiles = await safeFilter(base44, 'UserProfile', { created_by_id: user.id });
    const profile = profiles[0] || null;

    if (body.action === 'get_status') {
      const memberships = await safeFilter(base44, 'OrgMembership', { organization_id: organization.id, status: 'active' });
      return Response.json({
        org: { id: organization.id, name: organization.name, plan_status: organization.plan_status, plan: organization.plan, seats_used: organization.seats_used, seats_total: organization.seats_total },
        is_owner: access.isOwner,
        member_count: memberships.length,
        eligible_owners: memberships.filter((member) => member.user_id !== user.id).map((member) => ({ user_id: member.user_id, name: member.user_name, email: member.user_email, role: member.role })),
      });
    }

    if (!access.isOwner) return Response.json({ error: 'Only the organization owner can perform this action.' }, { status: 403 });

    if (body.action === 'archive' || body.action === 'restore') {
      const planStatus = body.action === 'archive' ? 'suspended' : 'active';
      await base44.asServiceRole.entities.Organization.update(organization.id, { plan_status: planStatus });
      await audit(base44, req, user, organization, `organization_${body.action}`, { plan_status: planStatus });
      return Response.json({ success: true, plan_status: planStatus });
    }

    if (body.action === 'transfer_ownership') {
      if (!body.new_owner_user_id) return Response.json({ error: 'new_owner_user_id required' }, { status: 400 });
      const memberships = await safeFilter(base44, 'OrgMembership', { organization_id: organization.id, user_id: body.new_owner_user_id, status: 'active' });
      const newOwnerMembership = memberships[0];
      if (!newOwnerMembership) return Response.json({ error: 'Selected user is not an active member of this organization.' }, { status: 400 });
      await base44.asServiceRole.entities.Organization.update(organization.id, { admin_user_id: newOwnerMembership.user_id, admin_email: newOwnerMembership.user_email || '' });
      await base44.asServiceRole.entities.OrgMembership.update(newOwnerMembership.id, { role: 'organization_admin' });
      if (access.membership?.id) await base44.asServiceRole.entities.OrgMembership.update(access.membership.id, { role: 'organization_admin' });
      await audit(base44, req, user, organization, 'organization_transfer_ownership', { new_owner_id: newOwnerMembership.user_id, new_owner_name: newOwnerMembership.user_name });
      return Response.json({ success: true, new_owner: newOwnerMembership.user_name });
    }

    if (body.action === 'check_prerequisites') {
      const blockers = await runPreDeletionChecks(base44, organization);
      return Response.json({ can_proceed: blockers.length === 0, blockers });
    }

    if (body.action === 'delete') {
      if (body.confirm_name !== organization.name) return Response.json({ error: 'Organization name does not match.' }, { status: 400 });
      const blockers = await runPreDeletionChecks(base44, organization);
      if (blockers.length) return Response.json({ error: 'Prerequisites not met.', blockers }, { status: 400 });
      const memberships = await safeFilter(base44, 'OrgMembership', { organization_id: organization.id });
      const userIds = memberships.map((member) => member.user_id).filter(Boolean);
      const memberProfiles = userIds.length ? await base44.asServiceRole.entities.UserProfile.filter({ created_by_id: { $in: userIds } }, '-created_date', 500) : [];
      for (const memberProfile of memberProfiles) {
        await base44.asServiceRole.entities.UserProfile.update(memberProfile.id, { organization_id: '', custom_role: '', department: '', department_id: '', manager_id: '', manager_name: '' });
      }
      await base44.asServiceRole.entities.Department.deleteMany({ organization_id: organization.id });
      await base44.asServiceRole.entities.Team.deleteMany({ organization_id: organization.id });
      await base44.asServiceRole.entities.OrgMembership.deleteMany({ organization_id: organization.id });
      await audit(base44, req, user, organization, 'organization_delete', { members_cleaned: memberProfiles.length }, 'critical');
      await base44.asServiceRole.entities.Organization.delete(organization.id);
      return Response.json({ success: true, deleted: true });
    }

    if (body.action === 'export_data') {
      const [memberships, departments, invoices] = await Promise.all([
        safeFilter(base44, 'OrgMembership', { organization_id: organization.id }),
        safeFilter(base44, 'Department', { organization_id: organization.id }),
        safeFilter(base44, 'Invoice', { organization_id: organization.id }),
      ]);
      return Response.json({ data: { organization, memberships, departments, invoices }, exported_at: new Date().toISOString() });
    }

    return Response.json({ error: `Unknown action: ${body.action || 'none'}` }, { status: 400 });
  } catch (error) {
    console.error('organizationDangerZone error:', error.message);
    return securityResponse(500);
  }
}
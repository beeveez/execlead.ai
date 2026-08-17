import { createClientFromRequest } from 'npm:@base44/sdk@0.8.42';
import { resolveActiveOrgMembership } from '../../shared/authoritativeOrgAccess.ts';

const PLATFORM_ROLES = ['super_admin', 'platform_admin', 'founder_root_admin'];
const ADMIN_ROLES = ['organization_admin'];
const MANAGER_ROLES = ['organization_admin', 'department_admin', 'manager', 'team_lead'];
const MEMBER_ROLES = ['organization_admin', 'department_admin', 'manager', 'team_lead', 'coach', 'mentor', 'member', 'guest', 'auditor', 'read_only'];

const CONFIG = {
  Organization: { orgField: 'id', kind: 'organization' },
  OrgMembership: { orgField: 'organization_id', kind: 'organization' },
  Department: { orgField: 'organization_id', kind: 'organization', roles: MANAGER_ROLES },
  Team: { orgField: 'organization_id', kind: 'organization', roles: MANAGER_ROLES },
  IdentityProvider: { orgField: 'organization_id', kind: 'organization' },
  IdentitySyncEvent: { orgField: 'organization_id', kind: 'organization', createOnly: true },
  SuccessionPlan: { orgField: 'organization_id', kind: 'organization' },
  CPQQuote: { orgField: 'organization_id', kind: 'organization', memberCreate: true, owner: 'created_by_id' },
  CPQApprovalWorkflow: { orgField: 'organization_id', kind: 'organization', parentQuote: true },
  ProcurementRequest: { orgField: 'organization_id', kind: 'organization', memberCreate: true, owner: 'requester_id' },
  Vendor: { orgField: 'organization_id', kind: 'organization' },
  BetaFeedback: { orgField: 'organization_id', kind: 'hybrid', owner: 'user_id' },
  ExecutiveOutcome: { orgField: 'organization_id', kind: 'hybrid', owner: 'user_id' },
  IdentityVerification: { orgField: 'organization_id', kind: 'hybrid', owner: 'user_id' },
  Subscription: { orgField: 'organization_id', kind: 'hybrid', owner: 'created_by_id' },
  UserProfile: { orgField: 'organization_id', kind: 'hybrid', owner: 'created_by_id' },
};

const isPlatformAdmin = (user) => PLATFORM_ROLES.includes(user.role);
const owns = (record, config, user) => config.owner && record?.[config.owner] === user.id;
const cleanLimit = (value) => Math.max(1, Math.min(Number(value) || 100, 500));
const cleanQuery = (query) => query && typeof query === 'object' && !Array.isArray(query) ? { ...query } : {};

async function deriveRecordOrg(base44, entity, record, config) {
  if (entity === 'Organization') return record?.id || null;
  if (record?.[config.orgField]) return record[config.orgField];
  if (config.parentQuote && record?.quote_id) {
    const quote = await base44.asServiceRole.entities.CPQQuote.get(record.quote_id);
    return quote?.organization_id || null;
  }
  return null;
}

async function authorizeOrg(base44, user, orgId, roles = MEMBER_ROLES) {
  if (isPlatformAdmin(user)) return { orgId, isPlatformAdmin: true, isOwner: false, membership: null };
  if (!orgId) return null;
  return resolveActiveOrgMembership(base44, user, { requestedOrgId: orgId, allowedRoles: roles });
}

async function defaultOrgAccess(base44, user, roles = MEMBER_ROLES) {
  if (isPlatformAdmin(user)) return { orgId: null, isPlatformAdmin: true, isOwner: false, membership: null };
  return resolveActiveOrgMembership(base44, user, { allowedRoles: roles });
}

function scopeQuery(entity, query, config, orgId, user, ownerOnly = false) {
  const scoped = cleanQuery(query);
  if (ownerOnly && config.owner) scoped[config.owner] = user.id;
  if (orgId) {
    if (entity === 'Organization') scoped.id = orgId;
    else scoped[config.orgField] = orgId;
  }
  return scoped;
}

function sanitizeData(data, config, orgId) {
  const clean = data && typeof data === 'object' && !Array.isArray(data) ? { ...data } : {};
  if (config.orgField !== 'id') {
    delete clean[config.orgField];
    if (orgId) clean[config.orgField] = orgId;
  }
  return clean;
}

function ownerCreateData(entity, data, config, user) {
  const clean = { ...(data || {}) };
  if (config.owner && config.owner !== 'created_by_id') clean[config.owner] = user.id;
  if (config.kind === 'hybrid') delete clean[config.orgField];
  return clean;
}

function canOwnerUpdate(entity, record, updates, user) {
  if (entity === 'ProcurementRequest') {
    if (record.requester_id !== user.id || record.status !== 'draft') return false;
    const forbidden = ['status', 'approval_chain_json', 'current_approval_step', 'approved_by', 'approved_at', 'rejected_by', 'rejected_at', 'organization_id'];
    return !forbidden.some((field) => Object.prototype.hasOwnProperty.call(updates || {}, field));
  }
  return ['CPQQuote', 'BetaFeedback', 'ExecutiveOutcome', 'IdentityVerification', 'Subscription', 'UserProfile'].includes(entity);
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { entity, operation, args = {} } = body;
    const config = CONFIG[entity];
    if (!config) return Response.json({ error: 'Entity is not available through the tenant gateway.' }, { status: 400 });
    if (!['list', 'filter', 'get', 'create', 'bulkCreate', 'update', 'delete'].includes(operation)) {
      return Response.json({ error: 'Unsupported operation.' }, { status: 400 });
    }

    const api = base44.asServiceRole.entities[entity];

    if (operation === 'list' || operation === 'filter') {
      const query = cleanQuery(args.query);
      const requestedOrg = entity === 'Organization' ? query.id : query[config.orgField];
      const readRoles = config.kind === 'hybrid' ? ADMIN_ROLES : MEMBER_ROLES;
      let access = requestedOrg ? await authorizeOrg(base44, user, requestedOrg, readRoles) : await defaultOrgAccess(base44, user, readRoles);
      let ownerOnly = false;
      if (!access && config.kind === 'hybrid' && config.owner) ownerOnly = true;
      if (!access && !ownerOnly && !isPlatformAdmin(user)) return Response.json({ error: 'Forbidden' }, { status: 403 });
      const scoped = scopeQuery(entity, query, config, access?.orgId, user, ownerOnly);
      const result = await api.filter(scoped, args.sort || '-created_date', cleanLimit(args.limit));
      return Response.json({ result });
    }

    if (operation === 'get') {
      const record = await api.get(args.id);
      if (!record) return Response.json({ error: 'Record not found.' }, { status: 404 });
      const orgId = await deriveRecordOrg(base44, entity, record, config);
      const access = orgId ? await authorizeOrg(base44, user, orgId) : null;
      if (!isPlatformAdmin(user) && !owns(record, config, user) && !access) return Response.json({ error: 'Forbidden' }, { status: 403 });
      return Response.json({ result: record });
    }

    if (operation === 'create' && entity === 'Organization') {
      if (args.data?.admin_user_id && args.data.admin_user_id !== user.id && !isPlatformAdmin(user)) return Response.json({ error: 'Forbidden' }, { status: 403 });
      const result = await api.create({ ...(args.data || {}), admin_user_id: user.id, admin_email: user.email });
      if (!isPlatformAdmin(user)) {
        await base44.asServiceRole.entities.OrgMembership.create({ organization_id: result.id, organization_name: result.name, user_id: user.id, user_name: user.full_name || user.email, user_email: user.email, role: 'organization_admin', status: 'active' });
      }
      return Response.json({ result });
    }

    if (operation === 'create' || operation === 'bulkCreate') {
      const rows = operation === 'bulkCreate' ? (Array.isArray(args.data) ? args.data : []) : [args.data || {}];
      if (!rows.length) return Response.json({ error: 'Data is required.' }, { status: 400 });
      const firstOrg = rows[0]?.[config.orgField];
      let access = firstOrg ? await authorizeOrg(base44, user, firstOrg, config.memberCreate ? MEMBER_ROLES : (config.roles || ADMIN_ROLES)) : await defaultOrgAccess(base44, user, config.memberCreate ? MEMBER_ROLES : (config.roles || ADMIN_ROLES));
      if (!access && config.kind === 'hybrid') {
        const ownedRows = rows.map((row) => ownerCreateData(entity, row, config, user));
        const result = operation === 'bulkCreate' ? await api.bulkCreate(ownedRows) : await api.create(ownedRows[0]);
        return Response.json({ result });
      }
      if (!access) return Response.json({ error: 'Forbidden' }, { status: 403 });
      if (rows.some((row) => row?.[config.orgField] && row[config.orgField] !== access.orgId)) return Response.json({ error: 'Cross-organization assignment denied.' }, { status: 403 });
      const scopedRows = rows.map((row) => sanitizeData(ownerCreateData(entity, row, config, user), config, access.orgId));
      const result = operation === 'bulkCreate' ? await api.bulkCreate(scopedRows) : await api.create(scopedRows[0]);
      return Response.json({ result });
    }

    const record = await api.get(args.id);
    if (!record) return Response.json({ error: 'Record not found.' }, { status: 404 });
    const orgId = await deriveRecordOrg(base44, entity, record, config);
    const roles = operation === 'delete' ? ADMIN_ROLES : (config.roles || ADMIN_ROLES);
    const access = orgId ? await authorizeOrg(base44, user, orgId, roles) : null;
    const ownerAllowed = owns(record, config, user) && (operation === 'delete' || canOwnerUpdate(entity, record, args.data, user));
    if (!isPlatformAdmin(user) && !access && !ownerAllowed) return Response.json({ error: 'Forbidden' }, { status: 403 });
    if (config.createOnly) return Response.json({ error: 'This record is append-only.' }, { status: 403 });

    if (operation === 'delete') {
      await api.delete(args.id);
      return Response.json({ result: { id: args.id, deleted: true } });
    }
    const updates = sanitizeData(args.data, config, orgId);
    const result = await api.update(args.id, updates);
    return Response.json({ result });
  } catch (error) {
    console.error('manageTenantData error:', error.message);
    return Response.json({ error: 'Tenant operation failed.' }, { status: 500 });
  }
}
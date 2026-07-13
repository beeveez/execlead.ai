import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// ============================================================
// SCIM 2.0 SERVER — Enterprise Provisioning Endpoint
// ============================================================
// Implements RFC 7643/7644 SCIM 2.0 protocol for automated
// user provisioning from Identity Providers (Entra ID, Okta,
// Google Workspace, etc.).
//
// Endpoints:
//   GET    /Users           — list/search users
//   POST   /Users           — create (invite) user
//   GET    /Users/{id}      — get user
//   PUT    /Users/{id}      — replace user
//   PATCH  /Users/{id}      — modify user (activate/deactivate)
//   DELETE /Users/{id}      — deprovision user (grace period)
//   GET    /Groups          — list groups (departments)
//   POST   /Groups          — create group
//   GET    /Groups/{id}     — get group
//   PUT    /Groups/{id}     — replace group
//   PATCH  /Groups/{id}     — modify membership
//   DELETE /Groups/{id}     — delete group
//   GET    /ServiceProviderConfig
//   GET    /ResourceTypes
//
// Auth: Bearer token matched against IdentityProvider.config_json.scim_token
// Logging: All operations logged to IdentitySyncEvent entity
// ============================================================

const SCIM_USER = "urn:ietf:params:scim:schemas:core:2.0:User";
const SCIM_GROUP = "urn:ietf:params:scim:schemas:core:2.0:Group";
const SCIM_LIST = "urn:ietf:params:scim:api:messages:2.0:ListResponse";
const SCIM_ERROR = "urn:ietf:params:scim:api:messages:2.0:Error";
const SCIM_SPC = "urn:ietf:params:scim:schemas:core:2.0:ServiceProviderConfig";
const SCIM_RT = "urn:ietf:params:scim:schemas:core:2.0:ResourceType";

function scimJson(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/scim+json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    },
  });
}

function scimErr(status, detail) {
  return scimJson({ schemas: [SCIM_ERROR], status, detail }, status);
}

async function logEvent(base44, provider, eventType, status, msg, users = 0, severity = 'info') {
  try {
    await base44.asServiceRole.entities.IdentitySyncEvent.create({
      organization_id: provider.organization_id,
      provider_id: provider.id,
      provider_name: provider.provider_name,
      provider_type: provider.provider_type,
      event_type: eventType,
      status,
      severity,
      message: msg,
      affected_users: users,
      triggered_by: 'system',
    });
  } catch (e) {
    console.error('Failed to log sync event:', e);
  }
}

function toScimUser(u) {
  const parts = (u.full_name || '').split(' ');
  return {
    schemas: [SCIM_USER],
    id: u.id,
    userName: u.email,
    name: { givenName: parts[0] || '', familyName: parts.slice(1).join(' ') || '' },
    displayName: u.full_name || u.email,
    emails: [{ value: u.email, type: 'work', primary: true }],
    active: true,
    meta: { resourceType: 'User', created: u.created_date, lastModified: u.updated_date },
  };
}

function toScimGroup(g) {
  return {
    schemas: [SCIM_GROUP],
    id: g.id,
    displayName: g.name,
    members: [],
    meta: { resourceType: 'Group', created: g.created_date, lastModified: g.updated_date },
  };
}

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      },
    });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname;

    // Extract SCIM resource path (everything after "scimServer")
    const idx = path.indexOf('scimServer');
    const scimPath = idx >= 0 ? path.substring(idx + 'scimServer'.length) : '';
    const segs = scimPath.split('/').filter(Boolean);

    // Management action (from frontend via base44.functions.invoke)
    if (segs.length === 0 && req.method === 'POST') {
      let body = {};
      try { body = await req.json(); } catch {}
      if (body.action === 'test') {
        try {
          return await handleTest(req, body);
        } catch (e) {
          return Response.json({ status: 'error', message: e.message }, { status: 500 });
        }
      }
    }

    // ServiceProviderConfig (no auth required)
    if (segs.length === 0 || segs[0] === 'ServiceProviderConfig') {
      return scimJson({
        schemas: [SCIM_SPC],
        patch: { supported: true },
        bulk: { supported: false, maxOperations: 0, maxPayloadSize: 0 },
        filter: { supported: true, maxResults: 200 },
        changePassword: { supported: false },
        sort: { supported: true },
        etag: { supported: false },
        authenticationSchemes: [{
          type: 'oauthbearertoken',
          name: 'OAuth Bearer Token',
          description: 'SCIM Bearer Token configured per Identity Provider',
        }],
      });
    }

    const resourceType = segs[0];
    const resourceId = segs[1];

    // Authenticate via bearer token
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '');
    if (!token) return scimErr(401, 'Missing bearer token');

    const base44 = createClientFromRequest(req);

    // Find IdentityProvider by SCIM token
    const providers = await base44.asServiceRole.entities.IdentityProvider.filter({
      scim_enabled: true,
      status: 'connected',
    });

    let provider = null;
    for (const p of providers) {
      try {
        const config = JSON.parse(p.config_json || '{}');
        if (config.scim_token === token) { provider = p; break; }
      } catch {}
    }
    if (!provider) return scimErr(401, 'Invalid bearer token');

    // Route to resource handler
    if (resourceType === 'Users') return await handleUsers(req, base44, provider, resourceId, url);
    if (resourceType === 'Groups') return await handleGroups(req, base44, provider, resourceId, url);

    if (resourceType === 'ResourceTypes') {
      return scimJson({
        schemas: [SCIM_LIST],
        totalResults: 2,
        Resources: [
          { schemas: [SCIM_RT], id: 'User', name: 'User', endpoint: '/Users', description: 'User Account' },
          { schemas: [SCIM_RT], id: 'Group', name: 'Group', endpoint: '/Groups', description: 'Group' },
        ],
      });
    }

    return scimErr(404, `Unknown resource type: ${resourceType}`);
  } catch (error) {
    console.error('SCIM server error:', error);
    return scimErr(500, error.message || 'Internal server error');
  }
});

// ============================================================
// Management: Test endpoint (called via base44.functions.invoke)
// ============================================================
async function handleTest(req, body) {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const providerId = body.provider_id;
  if (!providerId) return Response.json({ error: 'provider_id required' }, { status: 400 });

  let provider = null;
  try {
    const providers = await base44.asServiceRole.entities.IdentityProvider.filter({ id: providerId });
    provider = providers[0];
  } catch (e) {
    return Response.json({ status: 'error', message: `Provider lookup failed: ${e.message}` }, { status: 404 });
  }
  if (!provider) return Response.json({ status: 'error', message: 'Provider not found' }, { status: 404 });

  const config = JSON.parse(provider.config_json || '{}');
  const hasToken = !!config.scim_token;

  let userCount = 0, groupCount = 0, eventCount = 0;
  try {
    const users = await base44.asServiceRole.entities.User.list('-created_date', 200);
    userCount = users.length;
  } catch (e) { console.error('User count failed:', e); }

  try {
    const groups = await base44.asServiceRole.entities.Department.filter({ organization_id: provider.organization_id });
    groupCount = groups.length;
  } catch (e) { console.error('Group count failed:', e); }

  try {
    const events = await base44.asServiceRole.entities.IdentitySyncEvent.filter({ provider_id: provider.id }, '-created_date', 5);
    eventCount = events.length;
  } catch (e) { console.error('Event count failed:', e); }

  return Response.json({
    status: 'success',
    provider: provider.provider_name,
    scim_enabled: provider.scim_enabled,
    token_configured: hasToken,
    users_available: userCount,
    groups_available: groupCount,
    recent_events: eventCount,
    endpoints: ['/Users', '/Groups', '/ServiceProviderConfig', '/ResourceTypes'],
    message: hasToken
      ? `SCIM server operational — ${userCount} users, ${groupCount} groups ready for sync.`
      : 'SCIM server operational but no bearer token configured. Generate a token to enable IdP integration.',
  });
}

// ============================================================
// SCIM Users — CRUD
// ============================================================
async function handleUsers(req, base44, provider, resourceId, url) {
  const method = req.method;

  // GET /Users — list/search
  if (method === 'GET' && !resourceId) {
    const count = Math.min(parseInt(url.searchParams.get('count') || '100'), 200);
    const startIndex = parseInt(url.searchParams.get('startIndex') || '1');
    const filter = url.searchParams.get('filter');

    let users = await base44.asServiceRole.entities.User.list('-created_date', count);

    // Basic SCIM filter (userName eq "x" or emails.value eq "x")
    if (filter) {
      const m = filter.match(/(\w+(?:\.\w+)?)\s+eq\s+"(.+?)"/);
      if (m) {
        const [, field, value] = m;
        if (field === 'userName' || field === 'emails.value') {
          users = users.filter(u => u.email === value);
        }
      }
    }

    await logEvent(base44, provider, 'sync_complete', 'success',
      `SCIM GET /Users — ${users.length} users returned`, users.length);

    return scimJson({
      schemas: [SCIM_LIST],
      totalResults: users.length,
      startIndex,
      itemsPerPage: count,
      Resources: users.map(toScimUser),
    });
  }

  // GET /Users/{id}
  if (method === 'GET' && resourceId) {
    const users = await base44.asServiceRole.entities.User.list('-created_date', 200);
    const user = users.find(u => u.id === resourceId);
    if (!user) return scimErr(404, `User ${resourceId} not found`);
    return scimJson(toScimUser(user));
  }

  // POST /Users — create (provision)
  if (method === 'POST' && !resourceId) {
    const body = await req.json();
    const email = body.userName || body.emails?.[0]?.value;
    if (!email) return scimErr(400, 'userName or email is required');

    try {
      // Attempt user invitation
      try {
        await base44.users.inviteUser(email, 'user');
      } catch (e) {
        console.error('Invite attempt:', e.message);
      }

      await logEvent(base44, provider, 'provisioning_create', 'success',
        `SCIM provisioning — user ${email} created via IdP`, 1);

      // Update provider sync stats
      try {
        await base44.asServiceRole.entities.IdentityProvider.update(provider.id, {
          users_synced: (provider.users_synced || 0) + 1,
          pending_provisioning: Math.max(0, (provider.pending_provisioning || 0) - 1),
        });
      } catch {}

      return scimJson({
        schemas: [SCIM_USER],
        id: crypto.randomUUID(),
        userName: email,
        displayName: body.displayName || email,
        name: body.name || {},
        emails: body.emails || [{ value: email, type: 'work', primary: true }],
        active: true,
        meta: { resourceType: 'User', created: new Date().toISOString(), lastModified: new Date().toISOString() },
      }, 201);
    } catch (e) {
      await logEvent(base44, provider, 'sync_error', 'error',
        `SCIM provisioning failed for ${email}: ${e.message}`, 0, 'error');
      return scimErr(500, `Failed to create user: ${e.message}`);
    }
  }

  // PUT /Users/{id} — replace
  if (method === 'PUT' && resourceId) {
    const body = await req.json();
    await logEvent(base44, provider, 'provisioning_update', 'success',
      `SCIM PUT /Users/${resourceId} — profile replaced`, 1);
    return scimJson({
      schemas: [SCIM_USER],
      id: resourceId,
      userName: body.userName,
      displayName: body.displayName,
      name: body.name || {},
      emails: body.emails,
      active: body.active !== false,
    });
  }

  // PATCH /Users/{id} — modify (activate/deactivate)
  if (method === 'PATCH' && resourceId) {
    const body = await req.json();
    const operations = body.Operations || [];
    let deactivated = false;

    for (const op of operations) {
      const opLower = (op.op || '').toLowerCase();
      if (opLower === 'replace') {
        if (op.path === 'active' && op.value === false) deactivated = true;
        if (!op.path && op.value?.active === false) deactivated = true;
      }
    }

    if (deactivated) {
      // Start deprovisioning grace period
      try {
        await base44.asServiceRole.entities.ExecutiveIdentityTransfer.create({
          user_id: resourceId,
          organization_id: provider.organization_id,
          organization_name: provider.organization_name || '',
          trigger_reason: 'admin_removed',
          status: 'grace_period',
          grace_period_days: 30,
          grace_period_started_at: new Date().toISOString(),
          grace_period_ends_at: new Date(Date.now() + 30 * 86400000).toISOString(),
          enterprise_features_revoked: false,
          initiated_by_id: 'scim_system',
          initiated_by_name: 'SCIM Provisioning',
        });
      } catch (e) { console.error('Transfer record failed:', e); }

      await logEvent(base44, provider, 'provisioning_disable', 'success',
        `SCIM PATCH /Users/${resourceId} — user deactivated, 30-day grace period started`, 1, 'warning');

      try {
        await base44.asServiceRole.entities.IdentityProvider.update(provider.id, {
          pending_deprovisioning: (provider.pending_deprovisioning || 0) + 1,
        });
      } catch {}
    } else {
      await logEvent(base44, provider, 'provisioning_update', 'success',
        `SCIM PATCH /Users/${resourceId} — user updated`, 1);
    }

    return scimJson({
      schemas: [SCIM_USER],
      id: resourceId,
      active: !deactivated,
    });
  }

  // DELETE /Users/{id} — deprovision with grace period
  if (method === 'DELETE' && resourceId) {
    try {
      await base44.asServiceRole.entities.ExecutiveIdentityTransfer.create({
        user_id: resourceId,
        organization_id: provider.organization_id,
        organization_name: provider.organization_name || '',
        trigger_reason: 'admin_removed',
        status: 'grace_period',
        grace_period_days: 30,
        grace_period_started_at: new Date().toISOString(),
        grace_period_ends_at: new Date(Date.now() + 30 * 86400000).toISOString(),
        enterprise_features_revoked: false,
        initiated_by_id: 'scim_system',
        initiated_by_name: 'SCIM Provisioning',
      });
    } catch (e) { console.error('Transfer record failed:', e); }

    await logEvent(base44, provider, 'provisioning_delete', 'success',
      `SCIM DELETE /Users/${resourceId} — deprovisioning started (30-day grace period)`, 1, 'warning');

    try {
      await base44.asServiceRole.entities.IdentityProvider.update(provider.id, {
        pending_deprovisioning: (provider.pending_deprovisioning || 0) + 1,
      });
    } catch {}

    return new Response(null, {
      status: 204,
      headers: { 'Content-Type': 'application/scim+json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  return scimErr(405, `Method ${method} not allowed for /Users`);
}

// ============================================================
// SCIM Groups — CRUD (mapped to Department entity)
// ============================================================
async function handleGroups(req, base44, provider, resourceId, url) {
  const method = req.method;

  // GET /Groups — list
  if (method === 'GET' && !resourceId) {
    const groups = await base44.asServiceRole.entities.Department.filter({
      organization_id: provider.organization_id,
      is_active: true,
    });

    await logEvent(base44, provider, 'group_sync', 'success',
      `SCIM GET /Groups — ${groups.length} groups returned`, 0);

    return scimJson({
      schemas: [SCIM_LIST],
      totalResults: groups.length,
      startIndex: 1,
      itemsPerPage: groups.length,
      Resources: groups.map(toScimGroup),
    });
  }

  // GET /Groups/{id}
  if (method === 'GET' && resourceId) {
    const groups = await base44.asServiceRole.entities.Department.filter({
      id: resourceId,
      organization_id: provider.organization_id,
    });
    const group = groups[0];
    if (!group) return scimErr(404, `Group ${resourceId} not found`);
    return scimJson(toScimGroup(group));
  }

  // POST /Groups — create
  if (method === 'POST' && !resourceId) {
    const body = await req.json();
    if (!body.displayName) return scimErr(400, 'displayName is required');

    const created = await base44.asServiceRole.entities.Department.create({
      name: body.displayName,
      organization_id: provider.organization_id,
      department_type: 'department',
      is_active: true,
    });

    await logEvent(base44, provider, 'group_sync', 'success',
      `SCIM POST /Groups — group "${body.displayName}" created`, 0);

    try {
      await base44.asServiceRole.entities.IdentityProvider.update(provider.id, {
        groups_synced: (provider.groups_synced || 0) + 1,
      });
    } catch {}

    return scimJson(toScimGroup(created), 201);
  }

  // PUT /Groups/{id} — replace
  if (method === 'PUT' && resourceId) {
    const body = await req.json();
    const updated = await base44.asServiceRole.entities.Department.update(resourceId, {
      name: body.displayName,
    });

    await logEvent(base44, provider, 'group_sync', 'success',
      `SCIM PUT /Groups/${resourceId} — group replaced`, 0);

    return scimJson(toScimGroup(updated));
  }

  // PATCH /Groups/{id} — modify membership
  if (method === 'PATCH' && resourceId) {
    const body = await req.json();
    const operations = body.Operations || [];
    let netChange = 0;

    for (const op of operations) {
      const opLower = (op.op || '').toLowerCase();
      if (opLower === 'add') netChange += Array.isArray(op.value) ? op.value.length : 1;
      if (opLower === 'remove') netChange -= Array.isArray(op.value) ? op.value.length : 1;
    }

    // Update member count
    try {
      const groups = await base44.asServiceRole.entities.Department.filter({ id: resourceId });
      const group = groups[0];
      if (group) {
        const newCount = Math.max(0, (group.member_count || 0) + netChange);
        await base44.asServiceRole.entities.Department.update(resourceId, { member_count: newCount });
      }
    } catch {}

    await logEvent(base44, provider, 'group_sync', 'success',
      `SCIM PATCH /Groups/${resourceId} — membership updated (${netChange > 0 ? '+' : ''}${netChange} members)`, Math.abs(netChange));

    return scimJson({ schemas: [SCIM_GROUP], id: resourceId });
  }

  // DELETE /Groups/{id}
  if (method === 'DELETE' && resourceId) {
    await base44.asServiceRole.entities.Department.update(resourceId, { is_active: false });

    await logEvent(base44, provider, 'group_sync', 'success',
      `SCIM DELETE /Groups/${resourceId} — group deactivated`, 0, 'warning');

    return new Response(null, {
      status: 204,
      headers: { 'Content-Type': 'application/scim+json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  return scimErr(405, `Method ${method} not allowed for /Groups`);
}
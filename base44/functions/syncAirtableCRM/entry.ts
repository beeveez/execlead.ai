import { createClientFromRequest } from "npm:@base44/sdk@0.8.38";

const AIRTABLE_API = "https://api.airtable.com/v0";
const MEMBERS_TABLE = "Executive Members";
const LOGS_TABLE = "Sync Logs";

// Isolate-lifetime cache — avoids re-fetching schema on every invocation
let schemaCache = null;

async function resolveSchema(token) {
  if (schemaCache) return schemaCache;

  const authHeader = { Authorization: `Bearer ${token}` };

  const basesRes = await fetch(`${AIRTABLE_API}/meta/bases`, { headers: authHeader });
  if (!basesRes.ok) throw new Error(`Airtable bases lookup failed: ${basesRes.status}`);
  const bases = (await basesRes.json()).bases || [];

  for (const base of bases) {
    const tablesRes = await fetch(`${AIRTABLE_API}/meta/bases/${base.id}/tables`, { headers: authHeader });
    if (!tablesRes.ok) continue;
    const tables = (await tablesRes.json()).tables || [];
    const members = tables.find((t) => t.name === MEMBERS_TABLE);
    const logs = tables.find((t) => t.name === LOGS_TABLE);
    if (members && logs) {
      schemaCache = {
        baseId: base.id,
        membersTableId: members.id,
        logsTableId: logs.id,
        membersFields: members.fields || [],
        logsFields: logs.fields || [],
      };
      return schemaCache;
    }
  }

  throw new Error(
    `Could not find an Airtable base containing both "${MEMBERS_TABLE}" and "${LOGS_TABLE}" tables. ` +
      `Please create these tables in your Airtable base.`
  );
}

function filterToSchema(fields, schemaFields) {
  if (!schemaFields || schemaFields.length === 0) return fields;
  const existing = new Set(schemaFields.map((f) => f.name));
  const result = {};
  for (const [key, value] of Object.entries(fields)) {
    if (existing.has(key)) result[key] = value;
  }
  return result;
}

async function gatherUserData(base44, userId) {
  const [userRes, profileRes, subRes, identityRes, forecastRes] = await Promise.allSettled([
    base44.asServiceRole.entities.User.get(userId),
    base44.asServiceRole.entities.UserProfile.filter({ created_by_id: userId }),
    base44.asServiceRole.entities.Subscription.filter({ user_id: userId }),
    base44.asServiceRole.entities.IdentityVerification.filter({ user_id: userId }),
    base44.asServiceRole.entities.PromotionForecast.filter({ user_id: userId }, "-created_date", 1),
  ]);

  const user = userRes.status === "fulfilled" ? userRes.value : null;
  if (!user) return null;

  return {
    user,
    profile: profileRes.status === "fulfilled" ? profileRes.value?.[0] : null,
    subscription: subRes.status === "fulfilled" ? subRes.value?.[0] : null,
    identity: identityRes.status === "fulfilled" ? identityRes.value?.[0] : null,
    forecast: forecastRes.status === "fulfilled" ? forecastRes.value?.[0] : null,
  };
}

function buildMemberFields(data, trigger, schemaFields) {
  const sub = data.subscription || {};
  const identity = data.identity || {};
  const forecast = data.forecast || {};
  const profile = data.profile || {};

  const allFields = {
    Email: data.user.email || "",
    "Full Name": data.user.full_name || profile.display_name || "",
    Plan: sub.plan || sub.tier || sub.subscription_plan || "",
    "Identity Verified": identity.identity_verified ? "Yes" : "No",
    "Trust Score": identity.trust_score || 0,
    "Executive Score": forecast.readiness_score || 0,
    "Promotion Readiness": forecast.probability_score || 0,
    "Promotion Momentum": forecast.momentum || "",
    "Target Level": forecast.target_level || "",
    "Registration Date": data.user.created_date || "",
    "Sync Trigger": trigger,
    "Last Synced": new Date().toISOString(),
  };

  return filterToSchema(allFields, schemaFields);
}

async function upsertByEmail(token, baseId, tableId, fields, email) {
  const authHeader = { Authorization: `Bearer ${token}` };
  const safeEmail = email.replace(/'/g, "\\'");
  const filter = encodeURIComponent(`{Email}='${safeEmail}'`);

  const listRes = await fetch(
    `${AIRTABLE_API}/${baseId}/${tableId}?filterByFormula=${filter}&pageSize=1`,
    { headers: authHeader }
  );
  if (!listRes.ok) throw new Error(`Airtable lookup failed: ${listRes.status} ${await listRes.text()}`);
  const existing = (await listRes.json()).records?.[0];

  if (existing) {
    const res = await fetch(`${AIRTABLE_API}/${baseId}/${tableId}`, {
      method: "PATCH",
      headers: { ...authHeader, "Content-Type": "application/json" },
      body: JSON.stringify({ records: [{ id: existing.id, fields }] }),
    });
    if (!res.ok) throw new Error(`Airtable update failed: ${res.status} ${await res.text()}`);
    return { action: "updated", recordId: existing.id };
  }

  const res = await fetch(`${AIRTABLE_API}/${baseId}/${tableId}`, {
    method: "POST",
    headers: { ...authHeader, "Content-Type": "application/json" },
    body: JSON.stringify({ records: [{ fields }] }),
  });
  if (!res.ok) throw new Error(`Airtable create failed: ${res.status} ${await res.text()}`);
  const created = (await res.json()).records?.[0];
  return { action: "created", recordId: created?.id };
}

async function logSyncFailure(token, schema, userId, email, errorMessage, trigger) {
  const fields = filterToSchema(
    {
      "User ID": userId || "",
      Email: email || "",
      Error: (errorMessage || "Unknown error").slice(0, 1000),
      Trigger: trigger || "",
      Timestamp: new Date().toISOString(),
      Status: "Failed",
    },
    schema.logsFields
  );

  await fetch(`${AIRTABLE_API}/${schema.baseId}/${schema.logsTableId}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ records: [{ fields }] }),
  });
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  let body = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const event = body.event;
  const entityData = body.data;
  const trigger = body.trigger || event?.entity_name || "manual";

  // Resolve the user_id from either a manual invocation or an entity automation payload
  let userId = body.user_id;
  if (!userId) {
    if (event?.entity_name === "User") {
      userId = event.entity_id;
    } else {
      userId = entityData?.user_id || entityData?.created_by_id;
    }
  }

  if (!userId) {
    return Response.json({ error: "No user_id could be resolved from the payload" }, { status: 400 });
  }

  try {
    const { accessToken } = await base44.asServiceRole.connectors.getConnection("airtable");
    const schema = await resolveSchema(accessToken);

    const data = await gatherUserData(base44, userId);
    if (!data) {
      await logSyncFailure(accessToken, schema, userId, "", "User not found in database", trigger);
      return Response.json({ error: "User not found", userId }, { status: 404 });
    }

    const fields = buildMemberFields(data, trigger, schema.membersFields);
    const result = await upsertByEmail(
      accessToken,
      schema.baseId,
      schema.membersTableId,
      fields,
      data.user.email
    );

    return Response.json({ success: true, userId, ...result });
  } catch (error) {
    // Best-effort failure logging — never mask the original error
    try {
      const { accessToken } = await base44.asServiceRole.connectors.getConnection("airtable");
      const schema = await resolveSchema(accessToken);
      const email = entityData?.email || "";
      await logSyncFailure(accessToken, schema, userId, email, error.message, trigger);
    } catch {
      // Schema/Airtable unreachable — nothing more we can do
    }
    return Response.json({ error: error.message, userId }, { status: 500 });
  }
});
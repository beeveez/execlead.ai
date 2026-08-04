import { createClientFromRequest } from "npm:@base44/sdk@0.8.38";

const AIRTABLE_API = "https://api.airtable.com/v0";

function resolveBaseId(raw) {
  if (!raw) return null;
  const trimmed = raw.trim();
  // Extract the base ID (starts with "app") from either a raw ID or a full Airtable URL
  const match = trimmed.match(/(app[a-zA-Z0-9]+)/);
  return match ? match[1] : trimmed;
}

const BASE_ID = resolveBaseId(Deno.env.get("AIRTABLE_BASE_ID"));
const PAT = Deno.env.get("AIRTABLE_API_TOKEN");

const EXEC_MEMBERS_TABLE = "Executive Members";
const SYNC_LOGS_TABLE = "Sync Logs";

// ── Executive Members field schema (26 fields) ──
const EXEC_MEMBERS_FIELDS = [
  { name: "Email", type: "singleLineText" },
  { name: "User ID", type: "singleLineText" },
  { name: "Full Name", type: "singleLineText" },
  { name: "First Name", type: "singleLineText" },
  { name: "Last Name", type: "singleLineText" },
  { name: "Company", type: "singleLineText" },
  { name: "Job Title", type: "singleLineText" },
  { name: "Country", type: "singleLineText" },
  { name: "Membership Type", type: "singleSelect", options: { choices: [
    { name: "Founding" },
    { name: "Executive" },
    { name: "Premium" },
    { name: "Free" },
  ]}},
  { name: "Current Plan", type: "singleLineText" },
  { name: "Journey Stage", type: "singleSelect", options: { choices: [
    { name: "Onboarding" },
    { name: "Active" },
    { name: "Engaged" },
    { name: "Dormant" },
    { name: "Churned" },
  ]}},
  { name: "Identity Completion", type: "number", options: { precision: 0 } },
  { name: "Identity Verified", type: "checkbox", options: { icon: "check", color: "greenBright" } },
  { name: "Executive Score", type: "number", options: { precision: 0 } },
  { name: "Promotion Readiness", type: "number", options: { precision: 0 } },
  { name: "Promotion Momentum", type: "singleSelect", options: { choices: [
    { name: "increasing" },
    { name: "stable" },
    { name: "declining" },
  ]}},
  { name: "Target Executive Level", type: "singleLineText" },
  { name: "Trust Score", type: "number", options: { precision: 0 } },
  { name: "Leadership DNA Score", type: "number", options: { precision: 0 } },
  { name: "Last Login", type: "dateTime", options: { dateFormat: { name: "iso" }, timeFormat: { name: "24hour" }, timeZone: "utc" } },
  { name: "Registration Date", type: "dateTime", options: { dateFormat: { name: "iso" }, timeFormat: { name: "24hour" }, timeZone: "utc" } },
  { name: "Sync Trigger", type: "singleLineText" },
  { name: "Last Synced", type: "dateTime", options: { dateFormat: { name: "iso" }, timeFormat: { name: "24hour" }, timeZone: "utc" } },
  { name: "Status", type: "singleSelect", options: { choices: [
    { name: "Active" },
    { name: "Inactive" },
    { name: "Suspended" },
    { name: "Trial" },
    { name: "Invited" },
  ]}},
  { name: "Notes", type: "multilineText" },
  { name: "Tags", type: "multipleSelects", options: { choices: [] } },
];

// ── Sync Logs field schema (10 fields + primary) ──
const SYNC_LOGS_FIELDS = [
  { name: "Log Entry", type: "singleLineText" },
  { name: "Timestamp", type: "dateTime", options: { dateFormat: { name: "iso" }, timeFormat: { name: "24hour" }, timeZone: "utc" } },
  { name: "User ID", type: "singleLineText" },
  { name: "Email", type: "email" },
  { name: "Trigger", type: "singleLineText" },
  { name: "Status", type: "singleSelect", options: { choices: [
    { name: "Success" },
    { name: "Failed" },
    { name: "Retrying" },
  ]}},
  { name: "Error", type: "multilineText" },
  { name: "Retry Count", type: "number", options: { precision: 0 } },
  { name: "Duration (ms)", type: "number", options: { precision: 0 } },
  { name: "Last Attempt", type: "dateTime", options: { dateFormat: { name: "iso" }, timeFormat: { name: "24hour" }, timeZone: "utc" } },
  { name: "Resolution", type: "multilineText" },
];

async function airtableFetch(path, options = {}) {
  const res = await fetch(`${AIRTABLE_API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${PAT}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  return res;
}

async function listTables() {
  const res = await airtableFetch(`/meta/bases/${BASE_ID}/tables`);
  if (!res.ok) throw new Error(`Failed to list tables: ${res.status} ${await res.text()}`);
  return (await res.json()).tables || [];
}

async function createTable(name, description, fields) {
  const res = await airtableFetch(`/meta/bases/${BASE_ID}/tables`, {
    method: "POST",
    body: JSON.stringify({ name, description, fields }),
  });
  if (!res.ok) throw new Error(`Failed to create table "${name}": ${res.status} ${await res.text()}`);
  return await res.json();
}

async function addField(tableId, field) {
  const res = await airtableFetch(`/meta/bases/${BASE_ID}/tables/${tableId}/fields`, {
    method: "POST",
    body: JSON.stringify(field),
  });
  if (!res.ok) throw new Error(`Failed to add field "${field.name}": ${res.status} ${await res.text()}`);
  return await res.json();
}

function findMissingFields(existingFields, requiredFields) {
  const existingNames = new Set(existingFields.map((f) => f.name));
  return requiredFields.filter((f) => !existingNames.has(f.name));
}

async function ensureTable(tables, name, description, requiredFields) {
  let table = tables.find((t) => t.name === name);
  if (!table) {
    // Create with just the primary field — the field creation endpoint has
    // more lenient validation than the table creation endpoint
    table = await createTable(name, description, [requiredFields[0]]);
  }

  // Add any missing fields one by one via the field creation endpoint
  const missing = findMissingFields(table.fields || [], requiredFields);
  const fieldErrors = [];
  for (const field of missing) {
    try {
      await addField(table.id, field);
    } catch (e) {
      fieldErrors.push({ field: field.name, error: e.message });
    }
  }

  // Re-fetch to get the complete field list after additions
  const refreshed = await listTables();
  table = refreshed.find((t) => t.name === name) || table;
  table._fieldErrors = fieldErrors;
  return table;
}

Deno.serve(async (req) => {
  const t0 = performance.now();
  const report = {
    connectorStatus: "unknown",
    baseId: BASE_ID,
    tables: {},
    fieldsValidated: 0,
    fieldsTotal: 0,
    testSync: {},
    overallStatus: "Failed",
  };

  // ── RBAC: authenticate + authorize BEFORE any Airtable API call ──
  // No external operation may run before authentication succeeds. (deploy retry)
  const ALLOWED_ROLES = new Set(["founder_root_admin", "platform_admin"]);
  let authUser;
  try {
    const base44 = createClientFromRequest(req);
    authUser = await base44.auth.me();
  } catch (e) {
    console.log(JSON.stringify({ event: "provisionAirtableCRM", action: "provision", result: "auth_error", error: String(e?.message || e), timestamp: new Date().toISOString() }));
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!authUser || !authUser.id) {
    console.log(JSON.stringify({ event: "provisionAirtableCRM", action: "provision", result: "unauthenticated", timestamp: new Date().toISOString() }));
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const callerRole = authUser.role || "user";
  if (!ALLOWED_ROLES.has(callerRole)) {
    console.log(JSON.stringify({ event: "provisionAirtableCRM", action: "provision", result: "forbidden", userId: authUser.id, role: callerRole, timestamp: new Date().toISOString() }));
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
  console.log(JSON.stringify({ event: "provisionAirtableCRM", action: "provision", result: "authorized", userId: authUser.id, role: callerRole, timestamp: new Date().toISOString() }));

  try {
    // ── 0. Verify secrets ──
    if (!PAT || !BASE_ID) {
      report.connectorStatus = "missing_secrets";
      report.overallStatus = "Failed";
      report.error = "AIRTABLE_API_TOKEN or AIRTABLE_BASE_ID not set";
      return Response.json(report, { status: 500 });
    }
    report.connectorStatus = "authorized";

    // ── 1. List existing tables ──
    let tables = await listTables();

    // ── 2. Ensure Executive Members table ──
    const membersTable = await ensureTable(
      tables,
      EXEC_MEMBERS_TABLE,
      "Primary commercial CRM table for EXECLEAD.AI users",
      EXEC_MEMBERS_FIELDS
    );

    // ── 3. Ensure Sync Logs table ──
    tables = await listTables(); // refresh after potential creation
    const logsTable = await ensureTable(
      tables,
      SYNC_LOGS_TABLE,
      "Audit log for all CRM synchronization events",
      SYNC_LOGS_FIELDS
    );

    // ── 4. Verify tables and fields ──
    const membersMissing = findMissingFields(membersTable.fields || [], EXEC_MEMBERS_FIELDS);
    const logsMissing = findMissingFields(logsTable.fields || [], SYNC_LOGS_FIELDS);

    report.tables[EXEC_MEMBERS_TABLE] = {
      exists: true,
      id: membersTable.id,
      fieldsValidated: EXEC_MEMBERS_FIELDS.length - membersMissing.length,
      fieldsTotal: EXEC_MEMBERS_FIELDS.length,
      missingFields: membersMissing.map((f) => f.name),
      fieldErrors: membersTable._fieldErrors || [],
    };
    report.tables[SYNC_LOGS_TABLE] = {
      exists: true,
      id: logsTable.id,
      fieldsValidated: SYNC_LOGS_FIELDS.length - logsMissing.length,
      fieldsTotal: SYNC_LOGS_FIELDS.length,
      missingFields: logsMissing.map((f) => f.name),
      fieldErrors: logsTable._fieldErrors || [],
    };
    report.fieldsValidated =
      report.tables[EXEC_MEMBERS_TABLE].fieldsValidated + report.tables[SYNC_LOGS_TABLE].fieldsValidated;
    report.fieldsTotal = EXEC_MEMBERS_FIELDS.length + SYNC_LOGS_FIELDS.length;

    // ── 5. Test sync — push sample Executive Members record ──
    const testEmail = "test-sample@execlead.ai";
    const now = new Date().toISOString();
    const sampleFields = {
      Email: testEmail,
      "User ID": "test-provisioning-001",
      "Full Name": "Integration Test Executive",
      "First Name": "Integration",
      "Last Name": "Test",
      Company: "EXECLEAD.AI",
      "Job Title": "Chief Test Officer",
      Country: "Canada",
      "Membership Type": "Executive",
      "Current Plan": "Executive",
      "Journey Stage": "Active",
      "Identity Completion": 85,
      "Identity Verified": true,
      "Executive Score": 72,
      "Promotion Readiness": 68,
      "Promotion Momentum": "increasing",
      "Target Executive Level": "VP",
      "Trust Score": 75,
      "Leadership DNA Score": 70,
      "Last Login": now,
      "Registration Date": now,
      "Sync Trigger": "provisioning_test",
      "Last Synced": now,
      Status: "Active",
      Notes: "Sample record created during CRM provisioning test.",
      Tags: [],
    };

    const createRes = await airtableFetch(`/${BASE_ID}/${membersTable.id}`, {
      method: "POST",
      body: JSON.stringify({ records: [{ fields: sampleFields }] }),
    });
    const createData = await createRes.json();
    const testRecordId = createData.records?.[0]?.id;
    const sampleRecordError = !testRecordId ? createData?.error?.message || JSON.stringify(createData) : null;

    // ── 6. Verify the sample record was received ──
    const safeEmail = testEmail.replace(/'/g, "\\'");
    const filter = encodeURIComponent(`{Email}='${safeEmail}'`);
    const verifyRes = await airtableFetch(
      `/${BASE_ID}/${membersTable.id}?filterByFormula=${filter}&pageSize=1`
    );
    const verifyData = await verifyRes.json();
    const verified = (verifyData.records?.length || 0) > 0;

    // ── 7. Test Sync Logs — success entry ──
    const successLogRes = await airtableFetch(`/${BASE_ID}/${logsTable.id}`, {
      method: "POST",
      body: JSON.stringify({ records: [{ fields: {
        "Log Entry": "Provisioning Test — Success",
        "Timestamp": now,
        "User ID": "test-provisioning-001",
        "Email": testEmail,
        "Trigger": "provisioning_test",
        "Status": "Success",
        "Error": "",
        "Retry Count": 0,
        "Duration (ms)": 1500,
        "Last Attempt": now,
        "Resolution": "Sample record synced and verified successfully.",
      } }] }),
    });
    const successLogId = (await successLogRes.json()).records?.[0]?.id;

    // ── 8. Test Sync Logs — failure entry ──
    const failLogRes = await airtableFetch(`/${BASE_ID}/${logsTable.id}`, {
      method: "POST",
      body: JSON.stringify({ records: [{ fields: {
        "Log Entry": "Provisioning Test — Simulated Failure",
        "Timestamp": now,
        "User ID": "test-provisioning-002",
        "Email": "missing-user@execlead.ai",
        "Trigger": "provisioning_test",
        "Status": "Failed",
        "Error": "Simulated failure: User not found in EXECLEAD.AI database.",
        "Retry Count": 0,
        "Duration (ms)": 800,
        "Last Attempt": now,
        "Resolution": "Test failure log created during provisioning validation.",
      } }] }),
    });
    const failLogId = (await failLogRes.json()).records?.[0]?.id;

    report.testSync = {
      sampleRecord: { created: !!testRecordId, verified, recordId: testRecordId, error: sampleRecordError },
      syncLogSuccess: { created: !!successLogId, recordId: successLogId },
      syncLogFailure: { created: !!failLogId, recordId: failLogId },
    };

    // ── 9. Clean up test records ──
    const cleanup = [];
    if (testRecordId) {
      cleanup.push(airtableFetch(`/${BASE_ID}/${membersTable.id}/${testRecordId}`, { method: "DELETE" }));
    }
    if (successLogId) {
      cleanup.push(airtableFetch(`/${BASE_ID}/${logsTable.id}/${successLogId}`, { method: "DELETE" }));
    }
    if (failLogId) {
      cleanup.push(airtableFetch(`/${BASE_ID}/${logsTable.id}/${failLogId}`, { method: "DELETE" }));
    }
    await Promise.allSettled(cleanup);
    report.testSync.cleanedUp = true;

    // ── 10. Determine overall status ──
    const allFieldsValid = membersMissing.length === 0 && logsMissing.length === 0;
    const allTestsPassed = !!testRecordId && verified && !!successLogId && !!failLogId;

    if (allFieldsValid && allTestsPassed) {
      report.overallStatus = "Healthy";
    } else if (testRecordId || successLogId || failLogId) {
      report.overallStatus = "Warning";
    } else {
      report.overallStatus = "Failed";
    }

    report.durationMs = Math.round(performance.now() - t0);
    console.log(JSON.stringify({ event: "provisionAirtableCRM", action: "provision", result: "success", userId: authUser.id, role: callerRole, timestamp: new Date().toISOString(), overallStatus: report.overallStatus }));
    return Response.json(report, { status: 200 });
  } catch (error) {
    report.error = error.message;
    report.durationMs = Math.round(performance.now() - t0);
    report.overallStatus = "Failed";
    console.log(JSON.stringify({ event: "provisionAirtableCRM", action: "provision", result: "error", userId: authUser?.id, role: callerRole, timestamp: new Date().toISOString(), error: String(error?.message || error) }));
    return Response.json(report, { status: 500 });
  }
});
/**
 * Verified Prospect Contact Capability — Phase 14E.
 * ============================================================
 * SINGLE PURPOSE: the minimum server-governed capability required for a
 * Prospect to have an explicitly VERIFIED outreach contact, so the Phase
 * 14D recipient resolver can obtain an authoritative recipient in a future
 * controlled Gmail send. Nothing else.
 *
 * WHAT THIS CAPABILITY IS:
 * - ProspectContact records are EMAIL-only, owner-anchored, tenant-bounded
 *   business data created exclusively through the governed Workforce
 *   boundary (create_own_prospect_contact).
 * - A contact NEVER becomes VERIFIED because its email is syntactically
 *   valid. VERIFIED is an explicit governed action
 *   (verify_own_prospect_contact) recorded with verified_by_user_id and
 *   verified_at; REVOKED is fail-closed terminal.
 * - At most ONE VERIFIED primary EMAIL contact may exist per Prospect —
 *   enforced server-side; demotion of a previous primary is explicit and
 *   recorded.
 * - The Phase 14D recipient resolver consumes ONLY a VERIFIED, primary,
 *   EMAIL ProspectContact bound to the server-resolved Prospect; with no
 *   such contact it fails closed (RECIPIENT_NOT_VERIFIED). No recipient is
 *   EVER inferred from a company name, domain, website, employee name,
 *   owner/user email, search results, Gmail contacts, LLM output, or any
 *   client-supplied string.
 *
 * WHAT THIS CAPABILITY IS NOT:
 * - It is NOT a generic CRM contact model: no phone, social, or arbitrary
 *   contact types exist.
 * - It sends NOTHING: creating, reading, or verifying a contact transmits
 *   no email and performs no network call of any kind. Real delivery
 *   remains disabled by the Phase 14D activation gate.
 * - It performs no verification links, no outbound verification messages,
 *   and no external verification of any kind.
 *
 * PRIVACY: contact email is sensitive business/contact data. It never
 * enters LLM prompts, AgentExecution result summaries or metadata
 * snapshots, AgentApproval metadata or notes, telemetry, UsageLog,
 * Guardian evidence, error messages, or frontend logs — enforced by the
 * execution-safe projection (projectContactSnapshot) used for every
 * snapshot/meta surface, and by the never-surfaces policy below.
 *
 * This module is pure: no imports, no database access, no entity writes,
 * no network calls, no logging, no LLM. It is written in plain JS syntax
 * so the exact shipped file can be executed by the deterministic test
 * suite.
 */

export const PROSPECT_CONTACT_MODULE_VERSION = '14E.1.0.0';
export const PROSPECT_CONTACT_AGENT_ID = 'growth_agent';
export const PROSPECT_CONTACT_TOOL_CREATE_ID = 'create_own_prospect_contact';
export const PROSPECT_CONTACT_TOOL_READ_ID = 'read_own_prospect_contacts';
export const PROSPECT_CONTACT_TOOL_VERIFY_ID = 'verify_own_prospect_contact';
export const PROSPECT_CONTACT_TARGET_TYPE = 'ENTITY';
export const PROSPECT_CONTACT_TARGET_NAME = 'ProspectContact';
export const CONTACT_TYPE_EMAIL = 'EMAIL';
export const CONTACT_STATUS_DEFAULT = 'UNVERIFIED';
export const CONTACT_VERIFICATION_STATUSES = ['UNVERIFIED', 'VERIFIED', 'REVOKED'];
export const CONTACT_VERIFICATION_METHODS = ['MANUAL', 'ORGANIZATION_CONFIRMED'];
export const CONTACT_SOURCE_GOVERNED = 'governed_verified_contact_capability';
export const PROSPECT_CONTACT_MAX_RESULTS = 50;
export const CONTACT_EMAIL_MIN_LENGTH = 5;
export const CONTACT_EMAIL_MAX_LENGTH = 320;
export const CONTACT_UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const CONTACT_EMAIL_RE = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;

/** Ownership/tenant fields a CLIENT may never supply — always derived
 * server-side from the authenticated caller. */
export const CONTACT_OWNERSHIP_FIELDS = ['owner_user_id', 'user_id', 'organization_id'];

/** Surfaces the contact email must NEVER reach. */
export const CONTACT_NEVER_SURFACES = [
  'llm_prompts',
  'llm_context',
  'AgentExecution.result_summary',
  'AgentExecution.metadata_snapshots',
  'AgentApproval.metadata',
  'AgentApproval.notes',
  'telemetry',
  'UsageLog',
  'guardian_evidence',
  'error_messages',
  'frontend_logs',
];

export const CONTACT_VERIFY_NOTICE =
  'NO EMAIL IS SENT by the verified contact capability: creating, reading, or verifying a contact transmits nothing — verification records server-side trust state only, and real delivery remains disabled by the Phase 14D activation gate.';

/** Registry definitions — exact agent allow-list, exact target, exact
 * operation. Create/read are low-risk (an UNVERIFIED contact grants no
 * trust and can never resolve as a recipient); verification is the
 * trust-granting action and is medium-risk with mandatory human approval. */
export const PROSPECT_CONTACT_CREATE_TOOL_DEF = {
  tool_id: PROSPECT_CONTACT_TOOL_CREATE_ID,
  name: 'Create Own Prospect Contact',
  description: 'Creates ONE UNVERIFIED EMAIL contact record for a Prospect owned by the authenticated caller. Grants no trust, resolves no recipient, sends nothing; explicit governed verification is required before the contact can ever be used.',
  version: '1.0.0',
  status: 'ACTIVE',
  enabled: true,
  allowed_agent_ids: [PROSPECT_CONTACT_AGENT_ID],
  target_type: PROSPECT_CONTACT_TARGET_TYPE,
  target_name: PROSPECT_CONTACT_TARGET_NAME,
  operation: 'CREATE',
  execution_scope: 'user_scoped',
  permission_scope: 'self_records',
  human_approval_required: false,
  risk_level: 'low',
  source: 'production_catalog',
};

export const PROSPECT_CONTACT_READ_TOOL_DEF = {
  tool_id: PROSPECT_CONTACT_TOOL_READ_ID,
  name: 'Read Own Prospect Contacts',
  description: 'Reads ONLY the authenticated caller\u2019s own ProspectContact records for one owned Prospect, in a fixed safe projection. Read-only; sends nothing.',
  version: '1.0.0',
  status: 'ACTIVE',
  enabled: true,
  allowed_agent_ids: [PROSPECT_CONTACT_AGENT_ID],
  target_type: PROSPECT_CONTACT_TARGET_TYPE,
  target_name: PROSPECT_CONTACT_TARGET_NAME,
  operation: 'READ',
  execution_scope: 'user_scoped',
  permission_scope: 'self_records',
  human_approval_required: false,
  risk_level: 'low',
  source: 'production_catalog',
};

export const PROSPECT_CONTACT_VERIFY_TOOL_DEF = {
  tool_id: PROSPECT_CONTACT_TOOL_VERIFY_ID,
  name: 'Verify Own Prospect Contact',
  description: 'THE explicit governed verification action: marks ONE UNVERIFIED EMAIL ProspectContact owned by the authenticated caller as VERIFIED, recording the verifying actor and timestamp server-side. The contact value can never be replaced during verification; a REVOKED contact fails closed; at most one VERIFIED primary contact may exist per Prospect. Sends nothing — verification records trust state only.',
  version: '1.0.0',
  status: 'ACTIVE',
  enabled: true,
  allowed_agent_ids: [PROSPECT_CONTACT_AGENT_ID],
  target_type: PROSPECT_CONTACT_TARGET_TYPE,
  target_name: PROSPECT_CONTACT_TARGET_NAME,
  operation: 'UPDATE',
  execution_scope: 'user_scoped',
  permission_scope: 'self_records',
  human_approval_required: true,
  risk_level: 'medium',
  source: 'production_catalog',
};

function reject(errorCode, error) {
  return { ok: false, error_code: errorCode, error: error };
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/** Deterministic FNV-1a hash — idempotency and approval input binding
 * only, never authorization. */
function fnv1a(s) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16);
}

/**
 * Strict contact email validation. Syntactic validity NEVER grants
 * verification — it only bounds the stored value.
 */
export function validateContactEmail(rawValue) {
  if (typeof rawValue !== 'string') {
    return reject('CONTACT_EMAIL_INVALID', 'The contact email value must be a string.');
  }
  const email = rawValue.trim().toLowerCase();
  if (email.length === 0) {
    return reject('CONTACT_EMAIL_REQUIRED', 'A contact email value is required.');
  }
  if (email.length > CONTACT_EMAIL_MAX_LENGTH) {
    return reject('CONTACT_EMAIL_TOO_LONG', 'The contact email value exceeds the bounded maximum length of ' + CONTACT_EMAIL_MAX_LENGTH + ' characters.');
  }
  if (email.length < CONTACT_EMAIL_MIN_LENGTH) {
    return reject('CONTACT_EMAIL_INVALID', 'The contact email value is too short to be a valid address.');
  }
  if (/[\u0000-\u001f\u007f]/.test(email)) {
    return reject('CONTACT_EMAIL_CONTROL_CHARS', 'The contact email value must not contain control characters.');
  }
  if (!CONTACT_EMAIL_RE.test(email)) {
    return reject('CONTACT_EMAIL_INVALID', 'The contact email value is not a valid email address.');
  }
  return { ok: true, email: email };
}

const CREATE_ALLOWED_FIELDS = ['prospect_id', 'contact_type', 'contact_value'];

/**
 * Strict input contract for create_own_prospect_contact. Exactly one
 * bounded prospect_id, contact_type forced to EMAIL, and one valid email
 * value. Ownership fields are rejected outright (server-derived), and
 * every other key — including verification state, primary flags, and
 * provenance — is rejected so a client can never pre-verify a contact.
 */
export function validateCreateContactInput(rawInput) {
  if (!isPlainObject(rawInput)) {
    return reject('CONTACT_INPUT_INVALID', 'The contact creation request must be a plain object.');
  }
  for (const key of Object.keys(rawInput)) {
    if (CONTACT_OWNERSHIP_FIELDS.includes(key)) {
      return reject('CONTACT_OWNERSHIP_FIELD_REJECTED',
        'Ownership and tenant fields are derived server-side and can never be supplied by a client.');
    }
    if (!CREATE_ALLOWED_FIELDS.includes(key)) {
      return reject('CONTACT_INPUT_FIELD_REJECTED',
        'Input field "' + String(key).replace(/[^\w.-]/g, '').substring(0, 40) + '" is not part of the contact creation contract — verification state, primary flags, provenance, and identity fields are never client-supplied.');
    }
  }
  if (typeof rawInput.prospect_id !== 'string' || !CONTACT_UUID_RE.test(rawInput.prospect_id.trim().toLowerCase())) {
    return reject('CONTACT_PROSPECT_ID_INVALID', 'prospect_id must be the bounded prospect identifier issued at record creation.');
  }
  if (rawInput.contact_type !== CONTACT_TYPE_EMAIL) {
    return reject('CONTACT_TYPE_UNSUPPORTED', 'Only the EMAIL contact type is supported — no phone, social, or arbitrary contact types exist.');
  }
  const emailCheck = validateContactEmail(rawInput.contact_value);
  if (!emailCheck.ok) return emailCheck;
  return {
    ok: true,
    input: {
      prospect_id: rawInput.prospect_id.trim().toLowerCase(),
      contact_type: CONTACT_TYPE_EMAIL,
      contact_value: emailCheck.email,
    },
  };
}

/**
 * Builds the ONE record this tool may create. Ownership, tenant boundary,
 * and provenance come from the server-side context — never client input.
 * Verification state is always forced UNVERIFIED with no verified actor,
 * method, or timestamp, and is_primary is always false.
 */
export function buildContactRecord(validatedInput, ctx) {
  if (!isPlainObject(ctx) || typeof ctx.owner_user_id !== 'string' || ctx.owner_user_id.length === 0) {
    return reject('CONTACT_OWNER_CONTEXT_REQUIRED', 'The server-side ownership context is required to build a contact record.');
  }
  return {
    contact_id: crypto.randomUUID(),
    prospect_id: validatedInput.prospect_id,
    contact_type: CONTACT_TYPE_EMAIL,
    contact_value: validatedInput.contact_value,
    verification_status: CONTACT_STATUS_DEFAULT,
    verification_method: null,
    verified_at: null,
    verified_by_user_id: null,
    is_primary: false,
    source: CONTACT_SOURCE_GOVERNED,
    owner_user_id: ctx.owner_user_id,
    ...(isPlainObject(ctx) && typeof ctx.organization_id === 'string' && ctx.organization_id.length > 0
      ? { organization_id: ctx.organization_id } : {}),
  };
}

const VERIFY_ALLOWED_FIELDS = ['prospect_id', 'contact_id', 'verification_method', 'make_primary'];
const VERIFY_REPLACEMENT_FIELDS = ['contact_value', 'contact_type'];

/**
 * Strict input contract for verify_own_prospect_contact. The verification
 * target is identified (prospect_id + contact_id) and the method declared;
 * the contact VALUE can never be replaced during verification, and
 * ownership fields are rejected outright.
 */
export function validateVerifyContactInput(rawInput) {
  if (!isPlainObject(rawInput)) {
    return reject('CONTACT_INPUT_INVALID', 'The contact verification request must be a plain object.');
  }
  for (const key of Object.keys(rawInput)) {
    if (CONTACT_OWNERSHIP_FIELDS.includes(key)) {
      return reject('CONTACT_OWNERSHIP_FIELD_REJECTED',
        'Ownership and tenant fields are derived server-side and can never be supplied by a client.');
    }
    if (VERIFY_REPLACEMENT_FIELDS.includes(key)) {
      return reject('CONTACT_REPLACEMENT_REJECTED',
        'Arbitrary contact replacement during verification is rejected — verification applies to the exact stored contact record and never changes its value.');
    }
    if (key === 'verification_status' || key === 'verified_at' || key === 'verified_by_user_id' || key === 'is_primary') {
      return reject('CONTACT_INPUT_FIELD_REJECTED',
        'Verification state is governed server-side and can never be supplied by a client.');
    }
    if (!VERIFY_ALLOWED_FIELDS.includes(key)) {
      return reject('CONTACT_INPUT_FIELD_REJECTED',
        'Input field "' + String(key).replace(/[^\w.-]/g, '').substring(0, 40) + '" is not part of the contact verification contract.');
    }
  }
  if (typeof rawInput.prospect_id !== 'string' || !CONTACT_UUID_RE.test(rawInput.prospect_id.trim().toLowerCase())) {
    return reject('CONTACT_PROSPECT_ID_INVALID', 'prospect_id must be the bounded prospect identifier issued at record creation.');
  }
  if (typeof rawInput.contact_id !== 'string' || !CONTACT_UUID_RE.test(rawInput.contact_id.trim().toLowerCase())) {
    return reject('CONTACT_ID_INVALID', 'contact_id must be the server-issued contact identifier.');
  }
  if (!CONTACT_VERIFICATION_METHODS.includes(rawInput.verification_method)) {
    return reject('CONTACT_VERIFICATION_METHOD_INVALID', 'verification_method must be an explicitly supported method (MANUAL or ORGANIZATION_CONFIRMED).');
  }
  if (rawInput.make_primary !== undefined && typeof rawInput.make_primary !== 'boolean') {
    return reject('CONTACT_MAKE_PRIMARY_INVALID', 'make_primary must be a boolean request flag — the primary rule itself is enforced server-side.');
  }
  return {
    ok: true,
    input: {
      prospect_id: rawInput.prospect_id.trim().toLowerCase(),
      contact_id: rawInput.contact_id.trim().toLowerCase(),
      verification_method: rawInput.verification_method,
      make_primary: rawInput.make_primary === true,
    },
  };
}

/**
 * THE deterministic verification state machine. VERIFIED is reachable only
 * from UNVERIFIED; an already-VERIFIED contact is never re-verified (no
 * self-contradictory state) and a REVOKED contact fails closed forever.
 * The update touches ONLY verification state fields — the stored contact
 * value, Prospect binding, ownership, and provenance are never changed.
 */
export function buildContactVerificationUpdate(contactRecord, validatedInput, ctx) {
  if (!isPlainObject(contactRecord) || typeof contactRecord.contact_id !== 'string') {
    return reject('CONTACT_RECORD_INVALID', 'The verification target must be a server-resolved contact record.');
  }
  if (!CONTACT_VERIFICATION_STATUSES.includes(contactRecord.verification_status)) {
    return reject('CONTACT_RECORD_INVALID', 'The contact record carries no recognized verification state.');
  }
  if (contactRecord.verification_status === 'REVOKED') {
    return reject('CONTACT_REVOKED_FAIL_CLOSED',
      'A revoked contact can never be re-verified — the revoked state is fail-closed terminal.');
  }
  if (contactRecord.verification_status === 'VERIFIED') {
    return reject('CONTACT_ALREADY_VERIFIED',
      'The contact is already VERIFIED — re-verification is refused to prevent self-contradictory verification state.');
  }
  if (!isPlainObject(ctx) || typeof ctx.verifying_user_id !== 'string' || ctx.verifying_user_id.length === 0) {
    return reject('CONTACT_VERIFY_ACTOR_REQUIRED', 'The verifying human actor must be resolved server-side and recorded.');
  }
  if (!isPlainObject(ctx) || typeof ctx.verified_at !== 'string' || ctx.verified_at.length < 10) {
    return reject('CONTACT_VERIFY_ACTOR_REQUIRED', 'The verification timestamp must be supplied server-side.');
  }
  return {
    ok: true,
    previous_status: contactRecord.verification_status,
    update: {
      verification_status: 'VERIFIED',
      verification_method: validatedInput.verification_method,
      verified_by_user_id: ctx.verifying_user_id,
      verified_at: ctx.verified_at,
      is_primary: validatedInput.make_primary === true,
    },
  };
}

/** Ownership assertion — a contact record must belong to the caller. */
export function assertContactOwnership(contactRecord, ownerId) {
  if (!isPlainObject(contactRecord) || typeof ownerId !== 'string' || ownerId.length === 0) {
    return reject('CONTACT_OWNERSHIP_MISMATCH', 'Contact ownership could not be verified against the authenticated caller.');
  }
  if (contactRecord.owner_user_id !== ownerId) {
    return reject('CONTACT_OWNERSHIP_MISMATCH',
      'The contact record does not belong to the authenticated caller — cross-user access is never permitted.');
  }
  return { ok: true };
}

/** Tenant assertion — a contact record inside a tenant boundary must
 * match the caller's organization. */
export function assertContactTenant(contactRecord, organizationId) {
  if (!isPlainObject(contactRecord)) {
    return reject('CONTACT_TENANT_MISMATCH', 'The contact record could not be verified against the tenant boundary.');
  }
  if (typeof organizationId === 'string' && organizationId.length > 0
    && typeof contactRecord.organization_id === 'string' && contactRecord.organization_id.length > 0
    && contactRecord.organization_id !== organizationId) {
    return reject('CONTACT_TENANT_MISMATCH',
      'The contact record belongs to a different organization — cross-tenant access is never permitted.');
  }
  return { ok: true };
}

/**
 * THE recipient selection rule: ONLY a VERIFIED, primary, EMAIL contact
 * bound to the given Prospect may resolve as an outreach recipient. Zero
 * matches fail closed with RECIPIENT_NOT_VERIFIED; more than one verified
 * primary is a data anomaly and also fails closed — no arbitrary pick, no
 * fallback to any other data.
 */
export function selectVerifiedPrimaryEmailContact(contactRecords, prospectId) {
  if (!Array.isArray(contactRecords)) {
    return reject('CONTACT_RECORDS_INVALID', 'The contact selection requires a server-read record list.');
  }
  const matches = contactRecords.filter((c) => isPlainObject(c)
    && c.contact_type === CONTACT_TYPE_EMAIL
    && c.verification_status === 'VERIFIED'
    && c.is_primary === true
    && (prospectId === undefined || prospectId === null
      || (typeof c.prospect_id === 'string' && c.prospect_id.trim().toLowerCase() === String(prospectId).trim().toLowerCase())));
  if (matches.length === 0) {
    return reject('RECIPIENT_NOT_VERIFIED',
      'No VERIFIED primary EMAIL contact exists for this Prospect — recipient resolution fails closed and no recipient is inferred from any other data.');
  }
  if (matches.length > 1) {
    return reject('CONTACT_MULTIPLE_PRIMARY_ANOMALY',
      'Multiple VERIFIED primary contacts exist for this Prospect — a data anomaly that fails closed; no arbitrary recipient pick is permitted.');
  }
  return { ok: true, contact: matches[0] };
}

const READ_ALLOWED_FIELDS = ['prospect_id'];

/** Strict input contract for read_own_prospect_contacts. */
export function validateReadContactsInput(rawInput) {
  if (!isPlainObject(rawInput)) {
    return reject('CONTACT_INPUT_INVALID', 'The contact read request must be a plain object.');
  }
  for (const key of Object.keys(rawInput)) {
    if (CONTACT_OWNERSHIP_FIELDS.includes(key)) {
      return reject('CONTACT_OWNERSHIP_FIELD_REJECTED',
        'Ownership and tenant fields are derived server-side and can never be supplied by a client.');
    }
    if (!READ_ALLOWED_FIELDS.includes(key)) {
      return reject('CONTACT_READ_FIELD_REJECTED',
        'Input field "' + String(key).replace(/[^\w.-]/g, '').substring(0, 40) + '" is not part of the contact read contract.');
    }
  }
  if (typeof rawInput.prospect_id !== 'string' || !CONTACT_UUID_RE.test(rawInput.prospect_id.trim().toLowerCase())) {
    return reject('CONTACT_PROSPECT_ID_INVALID', 'prospect_id must be the bounded prospect identifier issued at record creation.');
  }
  return { ok: true, input: { prospect_id: rawInput.prospect_id.trim().toLowerCase() } };
}

/** Owner-visible projection — the authenticated owner may see their own
 * contact data; internal ids and ownership anchors are excluded. */
export function projectContact(record) {
  if (!isPlainObject(record)) return null;
  return {
    contact_id: typeof record.contact_id === 'string' ? record.contact_id : null,
    prospect_id: typeof record.prospect_id === 'string' ? record.prospect_id : null,
    contact_type: typeof record.contact_type === 'string' ? record.contact_type : null,
    contact_value: typeof record.contact_value === 'string' ? record.contact_value : null,
    verification_status: typeof record.verification_status === 'string' ? record.verification_status : null,
    verification_method: typeof record.verification_method === 'string' ? record.verification_method : null,
    verified_at: typeof record.verified_at === 'string' ? record.verified_at : null,
    is_primary: record.is_primary === true,
    source: typeof record.source === 'string' ? record.source : null,
  };
}

/** Execution-safe projection — the contact email is EXCLUDED from every
 * AgentExecution snapshot/meta surface, AgentApproval metadata, and any
 * log or diagnostic. */
export function projectContactSnapshot(record) {
  const projection = projectContact(record);
  if (projection === null) return null;
  return {
    contact_id: projection.contact_id,
    prospect_id: projection.prospect_id,
    contact_type: projection.contact_type,
    verification_status: projection.verification_status,
    verification_method: projection.verification_method,
    verified_at: projection.verified_at,
    is_primary: projection.is_primary,
    source: projection.source,
  };
}

/**
 * Deterministic outcome builders. result_summary, snapshot, and meta NEVER
 * carry the contact email — those surfaces feed AgentExecution records and
 * must stay email-free (the email appears only in the caller's own
 * response projection).
 */
export function buildContactCreatedOutcome(created) {
  if (!isPlainObject(created) || typeof created.contact_id !== 'string') {
    return { ok: false, error_code: 'CONTACT_RECORD_INVALID', error: 'The created contact record is missing its server-issued identity.' };
  }
  const status = typeof created.verification_status === 'string' ? created.verification_status : CONTACT_STATUS_DEFAULT;
  return {
    ok: true,
    responseKey: 'contact',
    response: { created: true, contact: projectContact(created) },
    result_summary: 'Created prospect contact ' + created.contact_id + ' for prospect ' + created.prospect_id + ' (EMAIL, ' + status + ') via a governed Workforce execution \u2014 explicit verification is required before this contact can ever resolve as an outreach recipient.',
    snapshot: projectContactSnapshot(created),
    meta: {
      contact_id: created.contact_id,
      prospect_id: created.prospect_id,
      contact_type: created.contact_type,
      verification_status: status,
      is_primary: created.is_primary === true,
      external_verification: false,
      email_sent: false,
    },
  };
}

export function buildContactVerifiedOutcome(updated, demotedPrimaryCount) {
  if (!isPlainObject(updated) || typeof updated.contact_id !== 'string') {
    return { ok: false, error_code: 'CONTACT_RECORD_INVALID', error: 'The verified contact record is missing its server-issued identity.' };
  }
  const demoted = Number.isInteger(demotedPrimaryCount) && demotedPrimaryCount > 0 ? demotedPrimaryCount : 0;
  return {
    ok: true,
    responseKey: 'contact',
    response: { verified: true, contact: projectContact(updated) },
    result_summary: 'Verified prospect contact ' + updated.contact_id + ' (method ' + updated.verification_method + ', primary ' + (updated.is_primary === true) + (demoted > 0 ? ', previous primary demoted server-side' : '') + ') via an approved governed Workforce execution \u2014 the verifying actor and timestamp are recorded server-side and the contact value is unchanged.',
    snapshot: projectContactSnapshot(updated),
    meta: {
      contact_id: updated.contact_id,
      prospect_id: updated.prospect_id,
      verification_status: 'VERIFIED',
      verification_method: updated.verification_method,
      is_primary: updated.is_primary === true,
      previous_primary_demoted: demoted,
      contact_value_changed: false,
      external_verification: false,
      email_sent: false,
    },
  };
}

export function buildContactsReadOutcome(records, prospectId) {
  const list = Array.isArray(records) ? records : [];
  return {
    ok: true,
    responseKey: 'contacts',
    response: {
      found: list.length,
      count: list.length,
      bounded_to: PROSPECT_CONTACT_MAX_RESULTS,
      contacts: list.map(projectContact),
    },
    result_summary: list.length > 0
      ? 'Read ' + list.length + ' own prospect contact record(s) for prospect ' + prospectId + ' (bounded to ' + PROSPECT_CONTACT_MAX_RESULTS + ').'
      : 'No prospect contact records on file for prospect ' + prospectId + '.',
    snapshot: { count: list.length, prospect_id: prospectId },
    meta: {
      records_found: list.length,
      bounded_to: PROSPECT_CONTACT_MAX_RESULTS,
      external_verification: false,
      email_sent: false,
    },
  };
}

/** Deterministic hash of a contact CREATE request's allowed input fields —
 * idempotency and approval input binding only, never authorization. */
export function prospectContactCreateInputHash(input) {
  if (!isPlainObject(input)) return '';
  const s = ['prospect_id', 'contact_type', 'contact_value']
    .map((k) => (typeof input[k] === 'string' ? input[k] : ''))
    .join('|');
  return fnv1a(s);
}

/** Deterministic hash of a contact VERIFY request's allowed input fields.
 * Identical between the issuance request and the execution request so one
 * approval can never authorize different input. */
export function prospectContactVerifyInputHash(input) {
  if (!isPlainObject(input)) return '';
  const s = [
    typeof input.prospect_id === 'string' ? input.prospect_id : '',
    typeof input.contact_id === 'string' ? input.contact_id : '',
    typeof input.verification_method === 'string' ? input.verification_method : '',
    input.make_primary === true ? 'true' : 'false',
  ].join('|');
  return fnv1a(s);
}
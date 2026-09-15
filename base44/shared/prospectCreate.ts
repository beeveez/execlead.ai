/**
 * Prospect Create Tool — Phase 8 deterministic input contract & record builder.
 * ============================================================
 * The tool performs exactly ONE business operation: CREATE ONE Prospect
 * record owned by the SERVER-RESOLVED authenticated user, with status forced
 * to NEW. There is no update, no delete, no status transition, no conversion,
 * and no CRM path in this module.
 *
 * Security model:
 * - Strict allow-list input: any field outside ALLOWED_FIELDS is rejected
 *   (PROSPECT_INPUT_FIELD_REJECTED), including client-supplied status,
 *   owner_user_id, organization_id, and entity/operation/function/query
 *   selectors — those values are never read anywhere in the create path.
 * - Ownership and organization context are derived SERVER-side by the caller
 *   (Agent Orchestration Core); this module never fabricates them.
 * - No LLM, no external verification, no external calls of any kind.
 * - Provenance is truthful: the orchestration core only claims intelligence
 *   provenance when intelligence_reference resolves to a real server-issued
 *   prospect_intelligence execution owned by the same user.
 *
 * This module is written in plain JS syntax so the exact shipped file can be
 * executed by the deterministic test suite without a Deno runtime.
 */

export const PROSPECT_CREATE_TOOL = {
  tool_id: 'create_own_prospect',
  name: 'Create Own Prospect',
  target_type: 'ENTITY',
  target_name: 'Prospect',
  operation: 'CREATE',
  execution_scope: 'user_scoped',
  permission_scope: 'self_records',
  risk_level: 'medium',
  human_approval_required: true,
  allowed_agent_ids: ['growth_agent'],
  status: 'DRAFT',
  enabled: false,
};

export const PROSPECT_CREATE_SOURCE_DIRECT = 'ai_workforce_create_own_prospect';
export const PROSPECT_CREATE_SOURCE_INTELLIGENCE = 'ai_workforce_prospect_intelligence';
export const PROSPECT_STATUS_DEFAULT = 'NEW';

const ALLOWED_FIELDS = [
  'company_name', 'website', 'industry', 'location', 'notes',
  'intelligence_summary', 'qualification_score', 'intelligence_reference',
];
const CONTROL_CHAR_RE = /[\u0000-\u001F\u007F]/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function reject(error_code, error) {
  return { ok: false, error_code, error };
}

function hasControlChars(s) {
  return CONTROL_CHAR_RE.test(s);
}

/** Safe preview of a rejected field name — never echoes raw client input. */
function fieldPreview(name) {
  return String(name).replace(/[^\w.-]/g, '').substring(0, 40) || 'unknown';
}

/** Bare domain only: no scheme, path, port, query, userinfo, or whitespace. */
function isBareDomain(value) {
  if (typeof value !== 'string') return false;
  const s = value.trim().toLowerCase();
  if (s.length < 4 || s.length > 253) return false;
  if (/[/:?#@\s]/.test(s)) return false;
  if (s.includes('..') || s.startsWith('.') || s.endsWith('.') || s.startsWith('-') || s.endsWith('-')) return false;
  const labels = s.split('.');
  if (labels.length < 2) return false;
  const tld = labels[labels.length - 1];
  if (!/^[a-z]{2,63}$/.test(tld)) return false;
  return labels.every((l) => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(l));
}

/**
 * Validates and normalizes prospect CREATE input against the strict contract.
 * Returns { ok: true, input } or { ok: false, error_code, error }.
 */
export function validateProspectCreateInput(rawInput) {
  if (rawInput === null || typeof rawInput !== 'object' || Array.isArray(rawInput)) {
    return reject('PROSPECT_INPUT_INVALID', 'Prospect input must be a plain object.');
  }
  for (const key of Object.keys(rawInput)) {
    if (!ALLOWED_FIELDS.includes(key)) {
      return reject('PROSPECT_INPUT_FIELD_REJECTED',
        `Field "${fieldPreview(key)}" is not an accepted prospect input field.`);
    }
  }

  const out = {};

  // company_name — required, 2-120 characters after trim.
  if (typeof rawInput.company_name !== 'string') {
    return reject('PROSPECT_COMPANY_NAME_REQUIRED', 'company_name is required.');
  }
  const cn = rawInput.company_name.trim();
  if (cn.length < 2 || cn.length > 120) {
    return reject('PROSPECT_COMPANY_NAME_INVALID', 'company_name must be 2-120 characters.');
  }
  if (hasControlChars(cn)) {
    return reject('PROSPECT_INPUT_CONTROL_CHARACTERS', 'company_name contains control characters.');
  }
  out.company_name = cn;

  // website — optional, bare domain only.
  if (rawInput.website !== undefined && rawInput.website !== null && rawInput.website !== '') {
    if (!isBareDomain(rawInput.website)) {
      return reject('PROSPECT_WEBSITE_INVALID', 'website must be a bare domain only (no scheme, path, port, or query).');
    }
    out.website = String(rawInput.website).trim().toLowerCase();
  }

  // Optional bounded strings: industry (120), location (100), notes (1000),
  // intelligence_summary (2000).
  const boundedStrings = [['industry', 120], ['location', 100], ['notes', 1000], ['intelligence_summary', 2000]];
  for (const [key, maxLen] of boundedStrings) {
    const v = rawInput[key];
    if (v === undefined || v === null || v === '') continue;
    if (typeof v !== 'string') {
      return reject('PROSPECT_INPUT_FIELD_INVALID', `${key} must be a string.`);
    }
    const t = v.trim();
    if (t === '') continue;
    if (hasControlChars(t)) {
      return reject('PROSPECT_INPUT_CONTROL_CHARACTERS', `${key} contains control characters.`);
    }
    if (t.length > maxLen) {
      return reject('PROSPECT_INPUT_FIELD_TOO_LONG', `${key} must be at most ${maxLen} characters.`);
    }
    out[key] = t;
  }

  // qualification_score — optional integer 0-100.
  if (rawInput.qualification_score !== undefined && rawInput.qualification_score !== null) {
    const q = rawInput.qualification_score;
    if (typeof q !== 'number' || !Number.isInteger(q) || q < 0 || q > 100) {
      return reject('PROSPECT_QUALIFICATION_SCORE_INVALID', 'qualification_score must be an integer between 0 and 100.');
    }
    out.qualification_score = q;
  }

  // intelligence_reference — optional, strictly bounded UUID.
  if (rawInput.intelligence_reference !== undefined && rawInput.intelligence_reference !== null && rawInput.intelligence_reference !== '') {
    const r = rawInput.intelligence_reference;
    if (typeof r !== 'string' || r.length > 100 || !UUID_RE.test(r.trim())) {
      return reject('PROSPECT_INTELLIGENCE_REFERENCE_INVALID', 'intelligence_reference must be a bounded execution reference identifier.');
    }
    out.intelligence_reference = r.trim().toLowerCase();
  }

  return { ok: true, input: out };
}

/**
 * Builds the ONE Prospect record this tool is allowed to create. Ownership,
 * tenant boundary, provenance source, and status come from the server-side
 * context (ctx) — never from client input. Status is always forced NEW.
 */
export function buildProspectRecord(validatedInput, ctx) {
  return {
    prospect_id: crypto.randomUUID(),
    company_name: validatedInput.company_name,
    ...(validatedInput.website ? { website: validatedInput.website } : {}),
    ...(validatedInput.industry ? { industry: validatedInput.industry } : {}),
    ...(validatedInput.location ? { location: validatedInput.location } : {}),
    ...(validatedInput.notes ? { notes: validatedInput.notes } : {}),
    ...(validatedInput.intelligence_summary ? { intelligence_summary: validatedInput.intelligence_summary } : {}),
    ...(validatedInput.qualification_score !== undefined ? { qualification_score: validatedInput.qualification_score } : {}),
    ...(ctx.intelligence_reference ? { intelligence_reference: ctx.intelligence_reference } : {}),
    source: ctx.source,
    status: PROSPECT_STATUS_DEFAULT,
    owner_user_id: ctx.owner_user_id,
    ...(ctx.organization_id ? { organization_id: ctx.organization_id } : {}),
  };
}

/**
 * Deterministic hash of a prospect CREATE request's allowed input fields.
 * Used ONLY to key idempotency and to bind an approval to the exact input it
 * was issued for — never for authorization. Total over any input value.
 */
export function prospectCreateInputHash(input) {
  if (input === null || typeof input !== 'object' || Array.isArray(input)) return '';
  const parts = ALLOWED_FIELDS.map((k) => {
    const v = input[k];
    if (typeof v === 'string') return v;
    if (typeof v === 'number') return String(v);
    return '';
  });
  const s = parts.join('|');
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16);
}
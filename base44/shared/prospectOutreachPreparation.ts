/**
 * Prospect Outreach Preparation Tool — Phase 10 deterministic draft engine.
 * ============================================================
 * PREPARE ONLY — this module composes a proposed outreach DRAFT for ONE
 * Prospect owned by the SERVER-RESOLVED authenticated caller. It never
 * sends, schedules, persists, or transmits anything: no email, no SMS, no
 * messaging, no Gmail/Outlook/CRM access, no record creation of any kind,
 * no external calls, no LLM, no background work, no retries, no loops, no
 * payments. The output is advisory and return-only; it exists only in the
 * orchestration response and the AgentExecution audit record.
 *
 * Security model:
 * - Strict allow-list input: exactly one required bounded prospect_id, an
 *   optional channel (EMAIL|LINKEDIN|CALL), an optional objective (<=300
 *   characters), and an optional tone (PROFESSIONAL|EXECUTIVE|CONCISE).
 *   Every other key is rejected, including identity keys (user_id,
 *   owner_user_id, organization_id), recipient/delivery keys (recipient,
 *   email, phone, message_id, crm_id, send, schedule, execute, approve),
 *   and any entity/operation/function/query/database/table/selector/
 *   fields/filters/sort/limit mechanism. Those values are never read.
 * - Ownership is enforced by the caller (Agent Orchestration Core): the
 *   record lookup always pairs the client-identified prospect with the
 *   server-resolved owner, so a foreign Prospect resolves to the same safe
 *   not-found result as a nonexistent one.
 * - Deterministic v1: no LLM, no web search, no network, no AI credits, no
 *   ExecutiveMemory, no personalized AI context. A future LLM version MUST
 *   go through the existing Phase 6 governed AI adapter.
 * - Truthful evidence: personalization points are labeled OBSERVED /
 *   INFERRED / UNKNOWN with sources limited to prospect_record and
 *   verified_prospect_intelligence. An intelligence_reference is relied on
 *   ONLY when the caller verified it resolves to a real SUCCEEDED
 *   server-issued prospect_intelligence execution owned by the same user.
 *   Nothing about the prospect is invented — no executive names, job
 *   titles, company initiatives, revenue, funding, customers, partnerships,
 *   technology, business problems, recent events, meetings, or previous
 *   conversations. Unavailable information is identified as UNKNOWN.
 * - Confidence is bounded by evidence completeness and never reaches 100.
 *
 * This module is written in plain JS syntax so the exact shipped file can be
 * executed by the deterministic test suite without a Deno runtime.
 */

export const PROSPECT_OUTREACH_TOOL = {
  tool_id: 'prepare_prospect_outreach',
  name: 'Prepare Prospect Outreach',
  target_type: 'INTERNAL_SERVICE',
  target_name: 'prospectOutreachPreparation',
  operation: 'INVOKE',
  execution_scope: 'user_scoped',
  permission_scope: 'self_records',
  risk_level: 'low',
  human_approval_required: false,
  allowed_agent_ids: ['growth_agent'],
  status: 'DRAFT',
  enabled: false,
};

export const OUTREACH_DRAFT_NOTICE = 'DRAFT — NOT SENT. This is a preparation draft only. No message has been sent, scheduled, persisted, or transmitted, and no contact has occurred. No external research or verification was performed; all content derives solely from the Prospect record and any server-verified Prospect Intelligence result.';

/**
 * The single authoritative public website for EXECLEAD.AI, as a
 * server-controlled constant for generated outreach drafts. Introduced by
 * the deterministic preparation layer (never an LLM, never client input) so
 * recipients always see the explicit canonical URL instead of any
 * mail-provider auto-linkification of the brand name. Value parity with the
 * frontend brand registry (src/lib/brandRegistry.js website) is asserted by
 * base44/shared/outreachCanonicalUrl.test.ts.
 */
export const OUTREACH_CANONICAL_WEBSITE = 'https://execleadai.co';

export const OUTREACH_CHANNELS = ['EMAIL', 'LINKEDIN', 'CALL'];
export const OUTREACH_TONES = ['PROFESSIONAL', 'EXECUTIVE', 'CONCISE'];
export const OUTREACH_OBJECTIVE_MAX_CHARS = 300;
export const OUTREACH_ELIGIBLE_STATUSES = ['QUALIFIED', 'PURSUING'];
export const OUTREACH_EVIDENCE_SOURCES = ['prospect_record', 'verified_prospect_intelligence'];
export const OUTREACH_EVIDENCE_LABELS = ['OBSERVED', 'INFERRED', 'UNKNOWN'];
export const OUTREACH_CONFIDENCE_CAP = 90;

const ALLOWED_FIELDS = ['prospect_id', 'channel', 'objective', 'tone'];
const CONTROL_CHAR_RE = /[\u0000-\u001F\u007F]/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function reject(error_code, error) {
  return { ok: false, error_code, error };
}

/** Safe preview of a rejected field name — never echoes raw client input. */
function fieldPreview(name) {
  return String(name).replace(/[^\w.-]/g, '').substring(0, 40) || 'unknown';
}

/**
 * Validates and normalizes outreach preparation input against the strict
 * contract. Returns { ok: true, input } or { ok: false, error_code, error }.
 */
export function validateOutreachInput(rawInput) {
  if (rawInput === null || typeof rawInput !== 'object' || Array.isArray(rawInput)) {
    return reject('PROSPECT_OUTREACH_INPUT_INVALID', 'Outreach preparation input must be a plain object.');
  }
  for (const key of Object.keys(rawInput)) {
    if (!ALLOWED_FIELDS.includes(key)) {
      return reject('PROSPECT_OUTREACH_FIELD_REJECTED',
        `Field "${fieldPreview(key)}" is not an accepted outreach preparation input field.`);
    }
  }

  const out = {};

  // prospect_id — required, strictly bounded identifier issued at record creation.
  if (typeof rawInput.prospect_id !== 'string' || rawInput.prospect_id.trim() === '') {
    return reject('PROSPECT_OUTREACH_PROSPECT_ID_REQUIRED', 'prospect_id is required.');
  }
  const pid = rawInput.prospect_id.trim();
  if (pid.length > 100 || !UUID_RE.test(pid)) {
    return reject('PROSPECT_OUTREACH_PROSPECT_ID_INVALID', 'prospect_id must be the bounded prospect identifier issued at record creation.');
  }
  out.prospect_id = pid.toLowerCase();

  // channel — optional preparation preference only; nothing is ever contacted.
  if (rawInput.channel !== undefined && rawInput.channel !== null && rawInput.channel !== '') {
    if (typeof rawInput.channel !== 'string' || !OUTREACH_CHANNELS.includes(rawInput.channel)) {
      return reject('PROSPECT_OUTREACH_CHANNEL_INVALID',
        `channel must be one of: ${OUTREACH_CHANNELS.join(', ')}. The channel is a preparation preference only — no channel is ever contacted.`);
    }
    out.channel = rawInput.channel;
  }

  // tone — optional drafting style.
  if (rawInput.tone !== undefined && rawInput.tone !== null && rawInput.tone !== '') {
    if (typeof rawInput.tone !== 'string' || !OUTREACH_TONES.includes(rawInput.tone)) {
      return reject('PROSPECT_OUTREACH_TONE_INVALID',
        `tone must be one of: ${OUTREACH_TONES.join(', ')}.`);
    }
    out.tone = rawInput.tone;
  }

  // objective — optional, bounded, no control characters.
  if (rawInput.objective !== undefined && rawInput.objective !== null && rawInput.objective !== '') {
    if (typeof rawInput.objective !== 'string') {
      return reject('PROSPECT_OUTREACH_OBJECTIVE_INVALID', 'objective must be a string.');
    }
    const t = rawInput.objective.trim();
    if (t === '') {
      return reject('PROSPECT_OUTREACH_OBJECTIVE_INVALID', 'objective must not be blank.');
    }
    if (hasControlChars(t)) {
      return reject('PROSPECT_OUTREACH_CONTROL_CHARACTERS', 'objective contains control characters.');
    }
    if (t.length > OUTREACH_OBJECTIVE_MAX_CHARS) {
      return reject('PROSPECT_OUTREACH_OBJECTIVE_TOO_LONG',
        `objective must be at most ${OUTREACH_OBJECTIVE_MAX_CHARS} characters.`);
    }
    out.objective = t;
  }

  return { ok: true, input: out };
}

function hasControlChars(s) {
  return CONTROL_CHAR_RE.test(s);
}

/**
 * Deterministic hash of an outreach preparation request's allowed input
 * fields. Used ONLY to key idempotency — never for authorization. Total
 * over any input value.
 */
export function outreachInputHash(input) {
  if (input === null || typeof input !== 'object' || Array.isArray(input)) return '';
  const parts = ALLOWED_FIELDS.map((k) => (typeof input[k] === 'string' ? input[k] : ''));
  const s = parts.join('|');
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16);
}

/**
 * Lifecycle eligibility — truthful, never fabricated, never status-changing.
 */
function eligibilityFor(status) {
  if (status === 'QUALIFIED') {
    return { eligible: true, recommended: true,
      reason: 'The Prospect is QUALIFIED — outreach preparation is appropriate at this lifecycle stage.' };
  }
  if (status === 'PURSUING') {
    return { eligible: true, recommended: true,
      reason: 'The Prospect is PURSUING — outreach preparation is appropriate at this lifecycle stage.' };
  }
  if (status === 'NEW') {
    return { eligible: false, recommended: false,
      reason: 'Outreach preparation is not currently recommended — the Prospect is still NEW and has not yet been qualified.' };
  }
  if (status === 'DISQUALIFIED') {
    return { eligible: false, recommended: false,
      reason: 'Outreach preparation is not currently recommended — the Prospect is DISQUALIFIED.' };
  }
  if (status === 'CONVERTED') {
    return { eligible: false, recommended: false,
      reason: 'Active prospect outreach is not appropriate because the lifecycle is already CONVERTED.' };
  }
  return { eligible: false, recommended: false,
    reason: `Outreach preparation is not currently recommended — the Prospect status ${String(status)} is not an outreach-ready lifecycle state.` };
}

/**
 * Safe not-found preparation result — indistinguishable from a foreign
 * Prospect and a nonexistent one; reveals no cross-user record information.
 */
export function buildOutreachNotFound(prospectId) {
  return {
    preparation_status: 'NOT_FOUND',
    eligible_for_outreach_preparation: false,
    recommended: false,
    reason: 'No Prospect record matching the provided identifier is owned by the authenticated caller.',
    recommended_channel: null,
    outreach_objective: null,
    subject_or_opening: null,
    draft_message: null,
    personalization_points: [],
    call_to_action: null,
    risks: [],
    missing_information: ['prospect_record'],
    evidence: [{
      label: 'UNKNOWN',
      source: 'prospect_record',
      detail: 'No owned Prospect record was found for the provided prospect_id.',
    }],
    confidence: { score: 0, level: 'none', basis: 'No record evidence available.' },
    verification_notice: OUTREACH_DRAFT_NOTICE,
  };
}

function subjectOrOpeningFor(prospect, channel, callerName) {
  const company = prospect.company_name;
  if (channel === 'LINKEDIN') {
    return `Hello — a short note for the ${company} team.`;
  }
  if (channel === 'CALL') {
    const who = callerName || '[your name]';
    return `Opening line: "Hello, my name is ${who}. I am reaching out to ${company} to introduce EXECLEAD.AI and ask whether executive leadership development is a current priority."`;
  }
  return `Connecting with ${company} — executive leadership`;
}

function draftMessageFor(prospect, opts) {
  const { channel, tone, callerName, objective, intelligencePhrase } = opts;
  const company = prospect.company_name;
  const industryClause = prospect.industry ? `, with relevance to the ${prospect.industry} industry` : '';
  const signature = callerName ? `Best regards,\n${callerName}` : 'Best regards,\n[your name]';

  if (channel === 'CALL') {
    const who = callerName || '[your name]';
    const lines = [
      `Opening: introduce yourself as ${who} and state the purpose in one sentence.`,
      `Purpose: ${objective}`,
    ];
    if (intelligencePhrase) lines.push(`Reference point: ${intelligencePhrase}`);
    lines.push(`Ask: whether a brief follow-up conversation would be welcome.`);
    lines.push(`Close: thank them and propose a specific time window.`);
    lines.push(`Website to reference if asked: ${OUTREACH_CANONICAL_WEBSITE}`);
    return lines.join('\n');
  }

  if (channel === 'LINKEDIN') {
    const lines = [`Hello — a short note for the ${company} team.`, ``];
    if (tone === 'CONCISE') {
      lines.push(`I am reaching out to introduce EXECLEAD.AI. ${objective}`);
    } else {
      lines.push(`I am reaching out to introduce EXECLEAD.AI, an executive leadership operating platform${industryClause}. ${objective}`);
      if (intelligencePhrase) lines.push(intelligencePhrase);
    }
    lines.push(``, `You can learn more about EXECLEAD.AI at ${OUTREACH_CANONICAL_WEBSITE}.`);
    lines.push(``, `Would a brief introductory conversation be welcome?`);
    return lines.join('\n');
  }

  // EMAIL — greeting varies by tone; every claim is grounded in the record.
  const greeting = tone === 'EXECUTIVE' ? `Dear ${company} team,` : `Hello ${company} team,`;
  const lines = [greeting, ``];
  if (tone === 'CONCISE') {
    lines.push(`I am reaching out to introduce EXECLEAD.AI. ${objective}`);
  } else {
    const intro = tone === 'EXECUTIVE'
      ? `I am writing to introduce EXECLEAD.AI, an executive leadership operating platform${industryClause}.`
      : `I am reaching out to introduce EXECLEAD.AI, an executive leadership operating platform${industryClause}.`;
    lines.push(`${intro} ${objective}`);
  }
  if (intelligencePhrase) lines.push(``, intelligencePhrase);
  lines.push(``, tone === 'EXECUTIVE'
    ? `I would welcome the opportunity for a brief introductory conversation at your convenience.`
    : `Would you be open to a brief introductory conversation in the coming weeks?`);
  lines.push(``, `You can learn more about EXECLEAD.AI at ${OUTREACH_CANONICAL_WEBSITE}.`);
  lines.push(``, signature);
  return lines.join('\n');
}

function callToActionFor(channel) {
  if (channel === 'LINKEDIN') return 'Invite a short message exchange and propose moving to a brief call.';
  if (channel === 'CALL') return 'Open with the one-sentence introduction and ask whether a brief follow-up conversation would be welcome.';
  return 'Propose a brief introductory conversation — suggest two 20-minute windows in the coming week.';
}

/**
 * THE deterministic preparation model. Composes the bounded structured
 * draft from the Prospect record and verified intelligence only. Pure
 * function: no I/O, no mutation, no network, no LLM, no persistence.
 */
export function buildOutreachPreparation(prospect, ctx) {
  if (!prospect || typeof prospect !== 'object') return buildOutreachNotFound(null);
  const context = ctx || {};
  const status = typeof prospect.status === 'string' ? prospect.status : 'NEW';
  const elig = eligibilityFor(status);
  const eligible = elig.eligible === true;
  const channel = OUTREACH_CHANNELS.includes(context.requested_channel) ? context.requested_channel : 'EMAIL';
  const tone = OUTREACH_TONES.includes(context.requested_tone) ? context.requested_tone : 'PROFESSIONAL';
  const callerName = typeof context.caller_name === 'string' && context.caller_name.trim() !== ''
    ? context.caller_name.trim() : null;
  const objective = (typeof context.requested_objective === 'string' && context.requested_objective.trim() !== '')
    ? context.requested_objective.trim()
    : `Introduce EXECLEAD.AI to ${prospect.company_name} and explore whether executive leadership development is a timely fit.`;

  const personalization_points = [];
  const missing = [];
  const evidence = [];
  let score = 10;

  personalization_points.push({ label: 'OBSERVED', point: `Prospect company: ${prospect.company_name}.`, evidence_source: 'prospect_record' });
  evidence.push({ label: 'OBSERVED', source: 'prospect_record',
    detail: `company_name is present on the Prospect record (status ${status}).` });
  score += 10;

  if (prospect.industry) {
    personalization_points.push({ label: 'OBSERVED', point: `Industry on record: ${prospect.industry}.`, evidence_source: 'prospect_record' });
    evidence.push({ label: 'OBSERVED', source: 'prospect_record', detail: 'industry is present on the Prospect record.' });
    score += 10;
  } else {
    missing.push('industry');
  }

  if (prospect.website) {
    personalization_points.push({ label: 'OBSERVED', point: `Company website on record: ${prospect.website}.`, evidence_source: 'prospect_record' });
    evidence.push({ label: 'OBSERVED', source: 'prospect_record', detail: 'website is present on the Prospect record.' });
    score += 5;
  } else {
    missing.push('website');
  }

  if (prospect.location) {
    personalization_points.push({ label: 'OBSERVED', point: `Location on record: ${prospect.location}.`, evidence_source: 'prospect_record' });
    score += 5;
  } else {
    missing.push('location');
  }

  if (typeof prospect.qualification_score === 'number') {
    personalization_points.push({ label: 'OBSERVED',
      point: `Internal qualification score on record: ${prospect.qualification_score}/100 (advisory).`, evidence_source: 'prospect_record' });
    score += 5;
  }

  // Identity facts are NEVER invented — they are always UNKNOWN until known.
  missing.push('decision_maker_name', 'decision_maker_title', 'company_initiatives', 'recent_events');

  let intelligencePhrase = '';
  if (context.intelligence_verified === true && typeof prospect.intelligence_summary === 'string'
    && prospect.intelligence_summary.trim() !== '') {
    const summary = prospect.intelligence_summary.trim().slice(0, 220);
    intelligencePhrase = `From earlier internal analysis of ${prospect.company_name} (server-verified): ${summary}`;
    personalization_points.push({ label: 'OBSERVED',
      point: 'A server-verified Prospect Intelligence summary is available and reflected in the draft.',
      evidence_source: 'verified_prospect_intelligence' });
    evidence.push({ label: 'OBSERVED', source: 'verified_prospect_intelligence',
      detail: 'intelligence_reference resolved to a SUCCEEDED server-issued prospect_intelligence execution owned by the same user.' });
    score += 20;
  } else if (prospect.intelligence_reference) {
    missing.push('verified_intelligence_summary');
    evidence.push({ label: 'UNKNOWN', source: 'verified_prospect_intelligence',
      detail: 'An intelligence_reference exists but did not resolve to a verified SUCCEEDED server-issued prospect_intelligence execution — it was NOT used in the draft.' });
  } else {
    missing.push('intelligence_summary');
  }

  const confidence = {
    score: Math.max(0, Math.min(OUTREACH_CONFIDENCE_CAP, score)),
    level: score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low',
    basis: 'Confidence is bounded by the completeness of Prospect record evidence. No external verification was performed, and the score never reaches 100.',
  };

  const risks = [
    'No decision-maker is identified on the Prospect record — the draft is addressed to the company rather than a named person; do not invent one.',
    'No external verification was performed — company details reflect the Prospect record only; verify externally before sending.',
  ];
  if (!prospect.website) risks.push('No website on record — confirm the company identity through external channels before outreach.');
  if (context.intelligence_verified !== true && prospect.intelligence_reference) {
    risks.push('The stored intelligence reference did not verify server-side — the draft does not rely on it.');
  }

  return {
    preparation_status: eligible ? 'PREPARED_DRAFT' : 'NOT_RECOMMENDED',
    eligible_for_outreach_preparation: eligible,
    recommended: elig.recommended === true,
    reason: elig.reason,
    recommended_channel: eligible ? channel : null,
    outreach_objective: eligible ? objective : null,
    subject_or_opening: eligible ? subjectOrOpeningFor(prospect, channel, callerName) : null,
    draft_message: eligible
      ? draftMessageFor(prospect, { channel, tone, callerName, objective, intelligencePhrase })
      : null,
    personalization_points,
    call_to_action: eligible ? callToActionFor(channel) : null,
    risks,
    missing_information: missing,
    evidence,
    confidence,
    verification_notice: OUTREACH_DRAFT_NOTICE,
  };
}
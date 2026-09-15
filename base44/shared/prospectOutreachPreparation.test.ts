// ============================================================
// Phase 10 — prepare_prospect_outreach deterministic test suite
// Dual runner: Deno.test under Deno, sequential under plain Node.
// All tests are local/deterministic — no network, no DB, no LLM,
// no production records touched.
// Run: node --experimental-strip-types base44/shared/prospectOutreachPreparation.test.ts
// ============================================================
import {
  validateOutreachInput,
  buildOutreachPreparation,
  buildOutreachNotFound,
  outreachInputHash,
  OUTREACH_CHANNELS,
  OUTREACH_TONES,
  OUTREACH_OBJECTIVE_MAX_CHARS,
  OUTREACH_EVIDENCE_SOURCES,
  OUTREACH_EVIDENCE_LABELS,
  OUTREACH_CONFIDENCE_CAP,
  OUTREACH_DRAFT_NOTICE,
  PROSPECT_OUTREACH_TOOL,
} from './prospectOutreachPreparation.ts';

const isDeno = typeof Deno !== 'undefined' && typeof Deno.test === 'function';
const cases = [];
function test(name, fn) { cases.push([name, fn]); }
function assert(cond, label) { if (!cond) throw new Error('FAILED: ' + label); }

const QUALIFIED_PROSPECT = {
  prospect_id: '11111111-1111-4111-8111-111111111111',
  company_name: 'Northwind Systems',
  website: 'northwind.example',
  industry: 'Enterprise Software',
  location: 'Singapore',
  source: 'ai_workforce_create_own_prospect',
  status: 'QUALIFIED',
  qualification_score: 72,
  intelligence_summary: 'Northwind operates an enterprise software platform with regional presence.',
  intelligence_reference: 'exec-ref-1',
  notes: '',
  owner_user_id: 'user-a',
  organization_id: 'org-a',
};

// 1. Valid QUALIFIED fixture → PREPARED_DRAFT
test('qualified prospect prepares a draft', () => {
  const r = buildOutreachPreparation(QUALIFIED_PROSPECT, { intelligence_verified: true, caller_name: 'Alex Rivera' });
  assert(r.preparation_status === 'PREPARED_DRAFT', '1: status');
  assert(r.eligible_for_outreach_preparation === true, '1: eligible');
  assert(r.recommended === true, '1: recommended');
  assert(r.recommended_channel === 'EMAIL', '1: default channel EMAIL');
  assert(typeof r.subject_or_opening === 'string' && r.subject_or_opening.includes('Northwind Systems'), '1: subject');
  assert(typeof r.draft_message === 'string' && r.draft_message.includes('Northwind Systems'), '1: draft');
  assert(r.verification_notice === OUTREACH_DRAFT_NOTICE && r.verification_notice.includes('DRAFT — NOT SENT'), '1: draft notice');
  assert(r.confidence.score > 0 && r.confidence.score <= OUTREACH_CONFIDENCE_CAP, '1: confidence bounds');
});

// 2. Valid PURSUING fixture → PREPARED_DRAFT
test('pursuing prospect prepares a draft', () => {
  const r = buildOutreachPreparation({ ...QUALIFIED_PROSPECT, status: 'PURSUING' }, {});
  assert(r.preparation_status === 'PREPARED_DRAFT', '2: status');
  assert(r.eligible_for_outreach_preparation === true, '2: eligible');
});

// 3. NEW → NOT_RECOMMENDED, no draft
test('NEW prospect is not recommended for outreach preparation', () => {
  const r = buildOutreachPreparation({ ...QUALIFIED_PROSPECT, status: 'NEW' }, {});
  assert(r.preparation_status === 'NOT_RECOMMENDED', '3: status');
  assert(r.eligible_for_outreach_preparation === false, '3: not eligible');
  assert(r.draft_message === null && r.subject_or_opening === null, '3: no draft');
  assert(r.reason.includes('NEW'), '3: truthful NEW reason');
});

// 4. DISQUALIFIED → NOT_RECOMMENDED with truthful reason
test('DISQUALIFIED prospect is not recommended', () => {
  const r = buildOutreachPreparation({ ...QUALIFIED_PROSPECT, status: 'DISQUALIFIED' }, {});
  assert(r.preparation_status === 'NOT_RECOMMENDED', '4: status');
  assert(r.reason.includes('DISQUALIFIED'), '4: reason');
  assert(r.draft_message === null, '4: no draft');
});

// 5. CONVERTED → active outreach not appropriate
test('CONVERTED prospect returns converted-lifecycle reason', () => {
  const r = buildOutreachPreparation({ ...QUALIFIED_PROSPECT, status: 'CONVERTED' }, {});
  assert(r.preparation_status === 'NOT_RECOMMENDED', '5: status');
  assert(r.reason.includes('CONVERTED'), '5: reason mentions CONVERTED');
  assert(r.draft_message === null, '5: no draft');
});

// 6. Missing prospect_id
test('missing prospect_id is rejected', () => {
  for (const bad of [undefined, null, '', '   ']) {
    const v = validateOutreachInput({ prospect_id: bad });
    assert(!v.ok, `6: ${String(bad)} rejected`);
    assert(v.error_code === 'PROSPECT_OUTREACH_PROSPECT_ID_REQUIRED', '6: code');
  }
});

// 7. Malformed prospect_id
test('malformed prospect_id is rejected', () => {
  for (const bad of ['not-a-uuid', 'abc', '11111111-1111-1111-1111-111111111111zz']) {
    const v = validateOutreachInput({ prospect_id: bad });
    assert(!v.ok, `7: ${String(bad)} rejected`);
    assert(v.error_code === 'PROSPECT_OUTREACH_PROSPECT_ID_INVALID', '7: code');
  }
  for (const bad of [42, true, [], {}]) {
    const v = validateOutreachInput({ prospect_id: bad });
    assert(!v.ok, `7: ${JSON.stringify(String(bad))} rejected`);
    assert(v.error_code === 'PROSPECT_OUTREACH_PROSPECT_ID_REQUIRED', '7: non-string code');
  }
});

// 8. Invalid channel
test('invalid channel values are rejected', () => {
  for (const bad of ['SMS', 'email', 'WHATSAPP', 0, true, 'EMAIL '] ) {
    const v = validateOutreachInput({ prospect_id: QUALIFIED_PROSPECT.prospect_id, channel: bad });
    assert(!v.ok, `8: channel ${String(bad)} rejected`);
    assert(v.error_code === 'PROSPECT_OUTREACH_CHANNEL_INVALID', '8: code');
  }
  for (const ok of OUTREACH_CHANNELS) {
    const v = validateOutreachInput({ prospect_id: QUALIFIED_PROSPECT.prospect_id, channel: ok });
    assert(v.ok && v.input.channel === ok, `8: ${ok} accepted`);
  }
});

// 9. Invalid tone
test('invalid tone values are rejected', () => {
  for (const bad of ['FRIENDLY', 'casual', 1]) {
    const v = validateOutreachInput({ prospect_id: QUALIFIED_PROSPECT.prospect_id, tone: bad });
    assert(!v.ok, `9: tone ${String(bad)} rejected`);
    assert(v.error_code === 'PROSPECT_OUTREACH_TONE_INVALID', '9: code');
  }
  for (const ok of OUTREACH_TONES) {
    const v = validateOutreachInput({ prospect_id: QUALIFIED_PROSPECT.prospect_id, tone: ok });
    assert(v.ok && v.input.tone === ok, `9: ${ok} accepted`);
  }
});

// 10. Oversized objective
test('oversized objective is rejected', () => {
  const tooLong = 'x'.repeat(OUTREACH_OBJECTIVE_MAX_CHARS + 1);
  const v = validateOutreachInput({ prospect_id: QUALIFIED_PROSPECT.prospect_id, objective: tooLong });
  assert(!v.ok && v.error_code === 'PROSPECT_OUTREACH_OBJECTIVE_TOO_LONG', '10: code');
  const ok = validateOutreachInput({ prospect_id: QUALIFIED_PROSPECT.prospect_id, objective: 'x'.repeat(OUTREACH_OBJECTIVE_MAX_CHARS) });
  assert(ok.ok, '10: exactly at the limit passes');
});

// 11. Control characters rejected
test('control characters in objective are rejected', () => {
  const v = validateOutreachInput({ prospect_id: QUALIFIED_PROSPECT.prospect_id, objective: 'Hi\u0000there\u007F' });
  assert(!v.ok && v.error_code === 'PROSPECT_OUTREACH_CONTROL_CHARACTERS', '11: code');
});

// 12. Unknown fields, identity, selector, recipient, and delivery-flag
//     injections are ALL rejected — no generic query or send mechanism exists.
test('every unknown input key is rejected', () => {
  const banned = [
    'user_id', 'owner_user_id', 'organization_id', 'entity', 'operation',
    'function', 'query', 'database', 'table', 'selector', 'fields', 'filters',
    'sort', 'limit', 'recipient', 'email', 'phone', 'message_id', 'crm_id',
    'send', 'schedule', 'execute', 'approve', 'status', 'notes',
    'qualification_score', 'company_name', 'channel_extra',
  ];
  for (const key of banned) {
    const v = validateOutreachInput({ prospect_id: QUALIFIED_PROSPECT.prospect_id, [key]: 'x' });
    assert(!v.ok, `12: key "${key}" must be rejected`);
    assert(v.error_code === 'PROSPECT_OUTREACH_FIELD_REJECTED', `12: code for "${key}"`);
  }
});

// 13. Malformed input container rejected
test('malformed input containers are rejected', () => {
  for (const bad of ['string', 42, [], true, [{ prospect_id: 'x' }]]) {
    const v = validateOutreachInput(bad);
    assert(!v.ok, `13: ${JSON.stringify(bad)} rejected`);
    assert(v.error_code === 'PROSPECT_OUTREACH_INPUT_INVALID', '13: code');
  }
});

// 14. Fabricated personalization prevention — no invented people or facts
test('drafts never invent people, initiatives, or events', () => {
  const sparse = { prospect_id: QUALIFIED_PROSPECT.prospect_id, company_name: 'Acme Holdings', status: 'QUALIFIED' };
  const r = buildOutreachPreparation(sparse, {});
  assert(r.draft_message.includes('Acme Holdings'), '14: company from record');
  assert(r.missing_information.includes('decision_maker_name'), '14: decision maker UNKNOWN');
  assert(r.missing_information.includes('decision_maker_title'), '14: title UNKNOWN');
  assert(r.missing_information.includes('company_initiatives'), '14: initiatives UNKNOWN');
  assert(r.missing_information.includes('recent_events'), '14: events UNKNOWN');
  // No fabricated personalization: no invented person name appears in points
  for (const p of r.personalization_points) {
    assert(!/CEO|CTO|Founder of|Ms\.|Mr\./.test(p.point), '14: no invented person');
  }
  // Unverified intelligence is never used
  const withRef = buildOutreachPreparation(
    { ...sparse, intelligence_reference: 'ref', intelligence_summary: 'claim' },
    { intelligence_verified: false },
  );
  assert(!withRef.draft_message.includes('claim'), '14: unverified intelligence excluded');
  const verified = buildOutreachPreparation(
    { ...sparse, intelligence_reference: 'ref', intelligence_summary: 'grounded claim' },
    { intelligence_verified: true },
  );
  assert(verified.draft_message.includes('grounded claim'), '14: verified intelligence included');
});

// 15. Evidence labeling — labels and sources only from the allowed sets
test('evidence labels and sources are valid', () => {
  const r = buildOutreachPreparation(QUALIFIED_PROSPECT, { intelligence_verified: true });
  const items = [...r.personalization_points.map((p) => ({ label: p.label, source: p.evidence_source })),
    ...r.evidence.map((e) => ({ label: e.label, source: e.source }))];
  assert(items.length > 0, '15: evidence present');
  for (const it of items) {
    assert(OUTREACH_EVIDENCE_LABELS.includes(it.label), `15: label ${it.label}`);
    assert(OUTREACH_EVIDENCE_SOURCES.includes(it.source), `15: source ${it.source}`);
  }
});

// 16. Confidence bounds — capped, never 100, zero for not-found
test('confidence is bounded and never 100', () => {
  const rich = buildOutreachPreparation(QUALIFIED_PROSPECT, { intelligence_verified: true });
  assert(rich.confidence.score <= OUTREACH_CONFIDENCE_CAP && rich.confidence.score < 100, '16: capped below 100');
  const nf = buildOutreachNotFound('99999999-9999-4999-8999-999999999999');
  assert(nf.confidence.score === 0, '16: not-found zero confidence');
});

// 17. Draft-not-sent guarantee — no result ever implies contact occurred
test('result is clearly a DRAFT that was never sent', () => {
  for (const r of [
    buildOutreachPreparation(QUALIFIED_PROSPECT, {}),
    buildOutreachPreparation({ ...QUALIFIED_PROSPECT, status: 'NEW' }, {}),
    buildOutreachNotFound('99999999-9999-4999-8999-999999999999'),
  ]) {
    assert(r.verification_notice.includes('DRAFT — NOT SENT'), '17: draft notice');
    assert(r.preparation_status !== 'SENT' && r.preparation_status !== 'SCHEDULED', '17: never sent/scheduled');
  }
  assert(buildOutreachPreparation(QUALIFIED_PROSPECT, {}).draft_message.indexOf('we spoke') === -1, '17: no implied prior contact');
});

// 18. Zero-persistence / tool registry definition safety
test('tool definition is DRAFT + disabled + low risk + growth_agent-only', () => {
  const def = PROSPECT_OUTREACH_TOOL;
  assert(def.status === 'DRAFT', '18: DRAFT');
  assert(def.enabled === false, '18: disabled');
  assert(def.target_type === 'INTERNAL_SERVICE' && def.target_name === 'prospectOutreachPreparation', '18: target');
  assert(def.operation === 'INVOKE', '18: INVOKE');
  assert(def.risk_level === 'low', '18: low risk');
  assert(def.human_approval_required === false, '18: no approval gate');
  assert(def.execution_scope === 'user_scoped' && def.permission_scope === 'self_records', '18: scope');
  assert(def.allowed_agent_ids.length === 1 && def.allowed_agent_ids[0] === 'growth_agent', '18: allow-list');
  assert(!def.allowed_agent_ids.some((a) => a.includes('*')), '18: no wildcards');
});

// 19. Not-found result is safe and complete
test('not-found result is safe and structurally complete', () => {
  const nf = buildOutreachNotFound('99999999-9999-4999-8999-999999999999');
  assert(nf.preparation_status === 'NOT_FOUND', '19: status');
  assert(nf.eligible_for_outreach_preparation === false, '19: not eligible');
  assert(nf.draft_message === null, '19: no draft');
  assert(buildOutreachPreparation(null, {}).preparation_status === 'NOT_FOUND', '19: null prospect safe');
});

// 20. Determinism — identical inputs produce identical outputs; hashes stable
test('preparation and hashing are deterministic', () => {
  const a = buildOutreachPreparation(QUALIFIED_PROSPECT, { intelligence_verified: true, requested_channel: 'LINKEDIN', requested_tone: 'CONCISE' });
  const b = buildOutreachPreparation(QUALIFIED_PROSPECT, { intelligence_verified: true, requested_channel: 'LINKEDIN', requested_tone: 'CONCISE' });
  assert(JSON.stringify(a) === JSON.stringify(b), '20: identical output');
  assert(a.recommended_channel === 'LINKEDIN', '20: requested channel honored');
  const h1 = outreachInputHash({ prospect_id: '11111111-1111-4111-8111-111111111111', channel: 'EMAIL', objective: 'x', tone: 'PROFESSIONAL' });
  const h2 = outreachInputHash({ prospect_id: '11111111-1111-4111-8111-111111111111', channel: 'EMAIL', objective: 'x', tone: 'PROFESSIONAL' });
  const h3 = outreachInputHash({ prospect_id: '22222222-2222-4222-8222-222222222222', channel: 'EMAIL', objective: 'x', tone: 'PROFESSIONAL' });
  assert(h1 === h2 && h1 !== h3 && h1 !== '', '20: hash stable and input-discriminating');
});

if (isDeno) {
  for (const [name, fn] of cases) Deno.test(name, fn);
} else {
  let failed = 0;
  for (const [name, fn] of cases) {
    try { await fn(); console.log(`ok - ${name}`); }
    catch (e) { failed++; console.error(`FAIL - ${name}: ${e.message}`); }
  }
  console.log(`${cases.length - failed}/${cases.length} pass`);
  if (failed > 0) process.exitCode = 1;
}
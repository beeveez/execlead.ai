/**
 * Deterministic tests for the Phase 8 Prospect CREATE input contract.
 * Dual runner: Deno.test under Deno, sequential ESM execution under plain
 * node — so the exact shipped module can be executed without a Deno runtime.
 */
import {
  validateProspectCreateInput,
  buildProspectRecord,
  prospectCreateInputHash,
  PROSPECT_CREATE_TOOL,
  PROSPECT_STATUS_DEFAULT,
  PROSPECT_CREATE_SOURCE_INTELLIGENCE,
} from './prospectCreate.ts';

const tests = [];
function test(name, fn) { tests.push([name, fn]); }
function assert(cond, msg) { if (!cond) throw new Error(msg || 'assertion failed'); }
function assertErrorCode(result, code) {
  assert(!result.ok && result.error_code === code,
    `expected ${code}, got ${JSON.stringify(result).substring(0, 120)}`);
}

const VALID_INPUT = {
  company_name: 'GT Capital Holdings',
  website: 'gtcapital.com.ph',
  industry: 'Financial Services',
  location: 'Manila, Philippines',
  notes: 'Referred by founding member network.',
  intelligence_summary: 'Category-level financial services heuristics; no external verification performed.',
  qualification_score: 62,
  intelligence_reference: '01234567-89ab-cdef-0123-456789abcdef',
};

test('valid full input passes and normalizes', () => {
  const v = validateProspectCreateInput(VALID_INPUT);
  assert(v.ok, 'should be ok');
  assert(v.input.company_name === 'GT Capital Holdings');
  assert(v.input.website === 'gtcapital.com.ph');
});

test('valid minimal input passes', () => {
  const v = validateProspectCreateInput({ company_name: 'Acme Corp' });
  assert(v.ok && v.input.company_name === 'Acme Corp' && Object.keys(v.input).length === 1);
});

test('missing company_name rejected', () => {
  assertErrorCode(validateProspectCreateInput({}), 'PROSPECT_COMPANY_NAME_REQUIRED');
});

test('company_name shorter than 2 chars rejected', () => {
  assertErrorCode(validateProspectCreateInput({ company_name: 'A' }), 'PROSPECT_COMPANY_NAME_INVALID');
});

test('company_name longer than 120 chars rejected', () => {
  assertErrorCode(validateProspectCreateInput({ company_name: 'X'.repeat(121) }), 'PROSPECT_COMPANY_NAME_INVALID');
});

test('client-supplied status field rejected (NEW is forced, not requestable)', () => {
  assertErrorCode(validateProspectCreateInput({ ...VALID_INPUT, status: 'QUALIFIED' }), 'PROSPECT_INPUT_FIELD_REJECTED');
});

test('client-supplied owner_user_id rejected', () => {
  assertErrorCode(validateProspectCreateInput({ ...VALID_INPUT, owner_user_id: 'attacker-id' }), 'PROSPECT_INPUT_FIELD_REJECTED');
});

test('client-supplied organization_id rejected', () => {
  assertErrorCode(validateProspectCreateInput({ ...VALID_INPUT, organization_id: 'other-org' }), 'PROSPECT_INPUT_FIELD_REJECTED');
});

test('selector-style keys rejected (entity/operation/function/query/target)', () => {
  for (const k of ['entity', 'operation', 'function', 'query', 'target', 'collection']) {
    assertErrorCode(validateProspectCreateInput({ company_name: 'Acme Corp', [k]: 'Prospect' }), 'PROSPECT_INPUT_FIELD_REJECTED');
  }
});

test('website with scheme/path/port/query/userinfo or single label rejected', () => {
  for (const bad of [
    'https://gtcapital.com.ph', 'gtcapital.com.ph/investors', 'gtcapital.com.ph:8443',
    'gtcapital.com.ph?x=1', 'user@gtcapital.com.ph', 'gtcapital',
  ]) {
    assertErrorCode(validateProspectCreateInput({ ...VALID_INPUT, website: bad }), 'PROSPECT_WEBSITE_INVALID');
  }
});

test('control characters rejected in every string field', () => {
  assertErrorCode(validateProspectCreateInput({ ...VALID_INPUT, notes: 'line\nbreak' }), 'PROSPECT_INPUT_CONTROL_CHARACTERS');
  assertErrorCode(validateProspectCreateInput({ company_name: 'Bad\u0000Name' }), 'PROSPECT_INPUT_CONTROL_CHARACTERS');
});

test('oversized fields rejected', () => {
  assertErrorCode(validateProspectCreateInput({ ...VALID_INPUT, notes: 'N'.repeat(1001) }), 'PROSPECT_INPUT_FIELD_TOO_LONG');
  assertErrorCode(validateProspectCreateInput({ ...VALID_INPUT, intelligence_summary: 'S'.repeat(2001) }), 'PROSPECT_INPUT_FIELD_TOO_LONG');
  assertErrorCode(validateProspectCreateInput({ ...VALID_INPUT, industry: 'I'.repeat(121) }), 'PROSPECT_INPUT_FIELD_TOO_LONG');
  assertErrorCode(validateProspectCreateInput({ ...VALID_INPUT, location: 'L'.repeat(101) }), 'PROSPECT_INPUT_FIELD_TOO_LONG');
});

test('qualification_score must be an integer 0-100', () => {
  assertErrorCode(validateProspectCreateInput({ ...VALID_INPUT, qualification_score: 101 }), 'PROSPECT_QUALIFICATION_SCORE_INVALID');
  assertErrorCode(validateProspectCreateInput({ ...VALID_INPUT, qualification_score: '85' }), 'PROSPECT_QUALIFICATION_SCORE_INVALID');
  assertErrorCode(validateProspectCreateInput({ ...VALID_INPUT, qualification_score: 85.5 }), 'PROSPECT_QUALIFICATION_SCORE_INVALID');
  const ok = validateProspectCreateInput({ ...VALID_INPUT, qualification_score: 0 });
  assert(ok.ok && ok.input.qualification_score === 0);
});

test('intelligence_reference must be a bounded UUID', () => {
  assertErrorCode(validateProspectCreateInput({ ...VALID_INPUT, intelligence_reference: 'javascript:alert(1)' }), 'PROSPECT_INTELLIGENCE_REFERENCE_INVALID');
  assertErrorCode(validateProspectCreateInput({ ...VALID_INPUT, intelligence_reference: 'not-a-uuid' }), 'PROSPECT_INTELLIGENCE_REFERENCE_INVALID');
});

test('non-object input rejected', () => {
  assertErrorCode(validateProspectCreateInput('Acme'), 'PROSPECT_INPUT_INVALID');
  assertErrorCode(validateProspectCreateInput([VALID_INPUT]), 'PROSPECT_INPUT_INVALID');
  assertErrorCode(validateProspectCreateInput(null), 'PROSPECT_INPUT_INVALID');
});

test('record builder forces status NEW and server-derived ownership', () => {
  const v = validateProspectCreateInput(VALID_INPUT);
  const record = buildProspectRecord(v.input, {
    source: PROSPECT_CREATE_SOURCE_INTELLIGENCE,
    intelligence_reference: v.input.intelligence_reference,
    owner_user_id: 'user-server-side',
    organization_id: 'org-server-side',
  });
  assert(record.status === PROSPECT_STATUS_DEFAULT && record.status === 'NEW');
  assert(record.owner_user_id === 'user-server-side');
  assert(record.organization_id === 'org-server-side');
  assert(typeof record.prospect_id === 'string' && record.prospect_id.length > 30);
  assert(record.source === PROSPECT_CREATE_SOURCE_INTELLIGENCE);
  assert(!('status' in VALID_INPUT));
});

test('hash is stable, discriminating, and total', () => {
  const h1 = prospectCreateInputHash(VALID_INPUT);
  const h2 = prospectCreateInputHash({ ...VALID_INPUT, company_name: 'Different Co' });
  assert(h1 === prospectCreateInputHash(VALID_INPUT), 'stable');
  assert(h1 !== h2, 'discriminating');
  assert(prospectCreateInputHash(null) === '' && prospectCreateInputHash('x') === '' && prospectCreateInputHash([1]) === '', 'total');
});

test('tool definition is DRAFT and disabled (no execution path until activation)', () => {
  assert(PROSPECT_CREATE_TOOL.tool_id === 'create_own_prospect');
  assert(PROSPECT_CREATE_TOOL.status === 'DRAFT' && PROSPECT_CREATE_TOOL.enabled === false);
  assert(PROSPECT_CREATE_TOOL.allowed_agent_ids.length === 1 && PROSPECT_CREATE_TOOL.allowed_agent_ids[0] === 'growth_agent');
  assert(PROSPECT_CREATE_TOOL.human_approval_required === true);
  assert(PROSPECT_CREATE_TOOL.operation === 'CREATE' && PROSPECT_CREATE_TOOL.target_name === 'Prospect');
});

// Dual runner: Deno.test under Deno, sequential ESM execution under node.
if (typeof Deno !== 'undefined' && typeof Deno.test === 'function') {
  for (const [name, fn] of tests) Deno.test(name, fn);
} else {
  let passed = 0;
  const failures = [];
  for (const [name, fn] of tests) {
    try { fn(); passed++; } catch (e) { failures.push([name, e.message]); }
  }
  for (const [name, msg] of failures) console.log(`FAIL ${name}: ${msg}`);
  console.log(`RESULT ${passed}/${tests.length} deterministic tests pass`);
  if (failures.length > 0) process.exit(1);
}
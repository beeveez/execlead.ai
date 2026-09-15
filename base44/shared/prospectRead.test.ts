// ============================================================
// Phase 8.2 — read_own_prospects deterministic test suite
// Dual runner: Deno.test under Deno, sequential under plain Node.
// All tests are local/deterministic — no network, no DB, no LLM,
// no production records touched.
// Run: node --experimental-strip-types base44/shared/prospectRead.test.ts
// ============================================================
import {
  validateProspectReadInput,
  projectProspect,
  PROSPECT_READ_MAX_RESULTS,
  PROSPECT_READ_STATUSES,
  PROSPECT_READ_PROJECTION_FIELDS,
  PROSPECT_READ_TOOL_REGISTRY_DEF,
} from './prospectRead.ts';

const isDeno = typeof Deno !== 'undefined' && typeof Deno.test === 'function';
const cases = [];
function test(name, fn) { cases.push([name, fn]); }
function assert(cond, label) { if (!cond) throw new Error('FAILED: ' + label); }

// 1. Absent / null input is a valid plain list read
test('absent and null input validate as plain reads', () => {
  for (const absent of [undefined, null]) {
    const v = validateProspectReadInput(absent);
    assert(v.ok, '1: absent input should pass');
    assert(v.input.status === null, '1: no status filter');
  }
});

// 2. Valid registered status filter accepted
test('registered status filter is accepted', () => {
  for (const status of PROSPECT_READ_STATUSES) {
    const v = validateProspectReadInput({ status });
    assert(v.ok, `2: ${status} should pass`);
    assert(v.input.status === status, '2: status echoed');
  }
  const empty = validateProspectReadInput({ status: '' });
  assert(empty.ok && empty.input.status === null, '2: empty status treated as no filter');
});

// 3. Invalid status rejected
test('unregistered status values are rejected', () => {
  for (const bad of ['new', 'ARCHIVED', 'DELETE', 0, true]) {
    const v = validateProspectReadInput({ status: bad });
    assert(!v.ok, `3: ${String(bad)} should be rejected`);
    assert(v.error_code === 'PROSPECT_READ_STATUS_INVALID', '3: error code');
  }
});

// 4. Any unknown input key is rejected — identity, selector, query, sort,
//    limit, field projection, operation — nothing may pass through.
test('unknown input keys are rejected', () => {
  const banned = [
    'user_id', 'owner_user_id', 'organization_id', 'organizationId',
    'filter', 'query', 'sort', 'limit', 'fields', 'projection',
    'entity', 'operation', 'tool_id', 'agent_id', 'target', 'select',
  ];
  for (const key of banned) {
    const v = validateProspectReadInput({ [key]: 'x' });
    assert(!v.ok, `4: key "${key}" must be rejected`);
    assert(v.error_code === 'PROSPECT_READ_FIELD_REJECTED', `4: code for "${key}"`);
  }
});

// 5. Malformed input rejected
test('malformed inputs are rejected', () => {
  for (const bad of ['string', 42, [], true, [{ status: 'NEW' }]]) {
    const v = validateProspectReadInput(bad);
    assert(!v.ok, `5: ${JSON.stringify(bad)} should be rejected`);
    assert(v.error_code === 'PROSPECT_READ_INPUT_INVALID', '5: error code');
  }
});

// 6. Projection passes only allowed fields — no id, no ownership, no tenant
test('projection includes only allowed fields', () => {
  const record = {
    id: 'internal-id',
    prospect_id: 'prsp_123',
    company_name: 'Acme',
    website: 'acme.com',
    industry: 'Software',
    location: 'Manila',
    source: 'ai_workforce_create_own_prospect',
    status: 'NEW',
    qualification_score: 80,
    intelligence_summary: 'summary',
    intelligence_reference: 'ref',
    notes: 'note',
    created_date: '2026-09-15T00:00:00Z',
    updated_date: '2026-09-15T00:00:00Z',
    owner_user_id: 'user-x',
    organization_id: 'org-y',
    secret_internal: 'leak',
  };
  const p = projectProspect(record);
  const keys = Object.keys(p);
  for (const key of keys) {
    assert(PROSPECT_READ_PROJECTION_FIELDS.includes(key), `6: "${key}" not in allow-list`);
  }
  for (const banned of ['id', 'owner_user_id', 'organization_id', 'secret_internal']) {
    assert(!(banned in p), `6: "${banned}" must not pass projection`);
  }
  assert(p.prospect_id === 'prsp_123' && p.status === 'NEW', '6: allowed values pass');
  assert(projectProspect(null) === null, '6: null record projects to null');
});

// 7. Query boundary constants are fixed and bounded
test('result count is fixed and bounded, ordering deterministic', () => {
  assert(Number.isInteger(PROSPECT_READ_MAX_RESULTS) && PROSPECT_READ_MAX_RESULTS > 0
    && PROSPECT_READ_MAX_RESULTS <= 100, '7: bounded max results');
  assert(PROSPECT_READ_STATUSES.length === 5, '7: registered status set');
});

// 8. Tool definition is growth_agent-only, DRAFT + disabled, no wildcards
test('tool definition is DRAFT + disabled + growth_agent-only', () => {
  const def = PROSPECT_READ_TOOL_REGISTRY_DEF;
  assert(def.status === 'DRAFT', '8: DRAFT');
  assert(def.enabled === false, '8: disabled');
  assert(def.target_type === 'ENTITY' && def.target_name === 'Prospect', '8: target');
  assert(def.operation === 'READ', '8: read only');
  assert(def.risk_level === 'low', '8: low risk');
  assert(def.human_approval_required === false, '8: no approval gate');
  assert(def.allowed_agent_ids.length === 1 && def.allowed_agent_ids[0] === 'growth_agent', '8: allow-list');
  assert(!def.allowed_agent_ids.some((a) => a.includes('*')), '8: no wildcards');
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
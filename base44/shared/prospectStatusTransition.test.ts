// ============================================================
// Phase 9 — update_own_prospect_status deterministic test suite
// Dual runner: Deno.test under Deno, sequential under plain Node.
// All tests are local/deterministic — no network, no DB, no LLM,
// no production records touched.
// Run: node --experimental-strip-types base44/shared/prospectStatusTransition.test.ts
// ============================================================
import {
  validateTransitionInput,
  validateTransitionAgainstMatrix,
  prospectTransitionInputHash,
  PROSPECT_STATUSES,
  PROSPECT_STATUS_TRANSITIONS,
  PROSPECT_TRANSITION_REASON_MAX,
  PROSPECT_STATUS_UPDATE_TOOL_REGISTRY_DEF,
} from './prospectStatusTransition.ts';

const isDeno = typeof Deno !== 'undefined' && typeof Deno.test === 'function';
const cases = [];
function test(name, fn) { cases.push([name, fn]); }
function assert(cond, label) { if (!cond) throw new Error('FAILED: ' + label); }

const VALID_ID = '11111111-2222-4333-8444-555555555555';

// 1. Every legal transition passes the matrix
test('all six legal transitions are permitted', () => {
  const legal = [
    ['NEW', 'QUALIFIED'],
    ['NEW', 'DISQUALIFIED'],
    ['QUALIFIED', 'PURSUING'],
    ['QUALIFIED', 'DISQUALIFIED'],
    ['PURSUING', 'CONVERTED'],
    ['PURSUING', 'DISQUALIFIED'],
  ];
  for (const [from, to] of legal) {
    const v = validateTransitionAgainstMatrix(from, to);
    assert(v.ok, `1: ${from}→${to} must be permitted`);
  }
});

// 2. Every forbidden transition is rejected
test('all forbidden transitions are rejected', () => {
  const forbidden = [];
  for (const from of PROSPECT_STATUSES) {
    for (const to of PROSPECT_STATUSES) {
      const allowed = (PROSPECT_STATUS_TRANSITIONS[from] || []).includes(to);
      if (!allowed) forbidden.push([from, to]);
    }
  }
  // Forbidden set includes the explicitly named matrix denials:
  for (const pair of [['NEW', 'PURSUING'], ['NEW', 'CONVERTED'], ['QUALIFIED', 'CONVERTED'],
    ['DISQUALIFIED', 'PURSUING'], ['DISQUALIFIED', 'QUALIFIED'], ['DISQUALIFIED', 'CONVERTED']]) {
    assert(forbidden.some(([f, t]) => f === pair[0] && t === pair[1]), `2: ${pair[0]}→${pair[1]} must be in the forbidden set`);
  }
  for (const [from, to] of forbidden) {
    const v = validateTransitionAgainstMatrix(from, to);
    assert(!v.ok, `2: ${from}→${to} must be rejected`);
    assert(v.error_code === 'TRANSITION_NOT_PERMITTED', `2: code for ${from}→${to}`);
  }
  // CONVERTED and DISQUALIFIED are terminal: zero outgoing transitions
  assert(PROSPECT_STATUS_TRANSITIONS.CONVERTED.length === 0, '2: CONVERTED is terminal');
  assert(PROSPECT_STATUS_TRANSITIONS.DISQUALIFIED.length === 0, '2: DISQUALIFIED is terminal');
  // No arbitrary status strings
  for (const bad of ['new', 'ARCHIVED', 'DELETE', '', null, 0, true, 'NEW ']) {
    const v = validateTransitionAgainstMatrix('NEW', bad);
    assert(!v.ok, `2: target ${String(bad)} must be rejected`);
  }
  // Unregistered source status rejected
  assert(!validateTransitionAgainstMatrix('ARCHIVED', 'QUALIFIED').ok, '2: unregistered source rejected');
});

// 3. Valid input shapes pass
test('valid inputs validate and normalize', () => {
  const v = validateTransitionInput({ prospect_id: `  ${VALID_ID.toUpperCase()}  `, new_status: 'QUALIFIED' });
  assert(v.ok, '3: minimal valid input passes');
  assert(v.input.prospect_id === VALID_ID, '3: prospect_id normalized');
  assert(v.input.new_status === 'QUALIFIED', '3: status echoed');
  assert(v.input.transition_reason === undefined, '3: no reason');
  const withReason = validateTransitionInput({
    prospect_id: VALID_ID, new_status: 'DISQUALIFIED',
    transition_reason: '  Human-reviewed and rejected after qualification.  ',
  });
  assert(withReason.ok, '3: valid input with reason passes');
  assert(withReason.input.transition_reason === 'Human-reviewed and rejected after qualification.', '3: reason trimmed');
  const maxReason = validateTransitionInput({
    prospect_id: VALID_ID, new_status: 'QUALIFIED', transition_reason: 'a'.repeat(PROSPECT_TRANSITION_REASON_MAX),
  });
  assert(maxReason.ok, '3: reason at exactly 1000 chars passes');
});

// 4. Required-field failures
test('missing prospect_id and new_status are rejected', () => {
  const noId = validateTransitionInput({ new_status: 'QUALIFIED' });
  assert(!noId.ok && noId.error_code === 'TRANSITION_PROSPECT_ID_REQUIRED', '4: missing prospect_id');
  const nullId = validateTransitionInput({ prospect_id: null, new_status: 'QUALIFIED' });
  assert(!nullId.ok && nullId.error_code === 'TRANSITION_PROSPECT_ID_REQUIRED', '4: null prospect_id');
  const noStatus = validateTransitionInput({ prospect_id: VALID_ID });
  assert(!noStatus.ok && noStatus.error_code === 'TRANSITION_NEW_STATUS_REQUIRED', '4: missing new_status');
  const nullStatus = validateTransitionInput({ prospect_id: VALID_ID, new_status: null });
  assert(!nullStatus.ok && nullStatus.error_code === 'TRANSITION_NEW_STATUS_REQUIRED', '4: null new_status');
});

// 5. Malformed prospect_id / invalid status
test('malformed prospect_id and invalid status are rejected', () => {
  for (const bad of ['not-a-uuid', 'x'.repeat(101), 42, true, 'prsp_123', {}, []]) {
    const v = validateTransitionInput({ prospect_id: bad, new_status: 'QUALIFIED' });
    assert(!v.ok, `5: prospect_id ${JSON.stringify(bad)} must be rejected`);
    assert(v.error_code === 'TRANSITION_PROSPECT_ID_INVALID', `5: code for ${JSON.stringify(bad)}`);
  }
  for (const bad of ['new', 'QUALIFIED ', 'ARCHIVED', 42, true, 'NEW→QUALIFIED']) {
    const v = validateTransitionInput({ prospect_id: VALID_ID, new_status: bad });
    assert(!v.ok, `5: new_status ${JSON.stringify(bad)} must be rejected`);
    assert(v.error_code === 'TRANSITION_NEW_STATUS_INVALID', `5: status code for ${JSON.stringify(bad)}`);
  }
});

// 6. Unknown fields are rejected — identity, ownership, tenant, other
//    Prospect fields, and arbitrary selector/query/operation keys.
test('unknown input keys are rejected', () => {
  const banned = [
    'user_id', 'owner_user_id', 'organization_id', 'current_status',
    'qualification_score', 'company_name', 'website', 'industry', 'location',
    'source', 'notes', 'intelligence_summary', 'intelligence_reference',
    'entity', 'operation', 'function', 'query', 'database', 'filter',
    'fields', 'limit', 'sort', 'mode', 'id', 'status',
  ];
  for (const key of banned) {
    const v = validateTransitionInput({ prospect_id: VALID_ID, new_status: 'QUALIFIED', [key]: 'x' });
    assert(!v.ok, `6: key "${key}" must be rejected`);
    assert(v.error_code === 'TRANSITION_INPUT_FIELD_REJECTED', `6: code for "${key}"`);
  }
});

// 7. Malformed input object rejected
test('malformed inputs are rejected', () => {
  for (const bad of [undefined, null, 'string', 42, [], true, [{ prospect_id: VALID_ID }]]) {
    const v = validateTransitionInput(bad);
    assert(!v.ok, `7: ${JSON.stringify(bad)} should be rejected`);
    assert(v.error_code === 'TRANSITION_INPUT_INVALID', `7: code for ${JSON.stringify(bad)}`);
  }
});

// 8. transition_reason bounds and control characters
test('transition_reason bounds are enforced', () => {
  const tooLong = validateTransitionInput({
    prospect_id: VALID_ID, new_status: 'QUALIFIED', transition_reason: 'a'.repeat(PROSPECT_TRANSITION_REASON_MAX + 1),
  });
  assert(!tooLong.ok && tooLong.error_code === 'TRANSITION_REASON_TOO_LONG', '8: oversized reason rejected');
  const ctrl = validateTransitionInput({
    prospect_id: VALID_ID, new_status: 'QUALIFIED', transition_reason: 'ok\u0000reason',
  });
  assert(!ctrl.ok && ctrl.error_code === 'TRANSITION_INPUT_CONTROL_CHARACTERS', '8: control chars rejected');
  const nonString = validateTransitionInput({
    prospect_id: VALID_ID, new_status: 'QUALIFIED', transition_reason: 42,
  });
  assert(!nonString.ok && nonString.error_code === 'TRANSITION_INPUT_FIELD_INVALID', '8: non-string reason rejected');
  const blank = validateTransitionInput({
    prospect_id: VALID_ID, new_status: 'QUALIFIED', transition_reason: '   ',
  });
  assert(!blank.ok && blank.error_code === 'TRANSITION_INPUT_FIELD_INVALID', '8: blank reason rejected');
  const emptyOk = validateTransitionInput({
    prospect_id: VALID_ID, new_status: 'QUALIFIED', transition_reason: '',
  });
  assert(emptyOk.ok, '8: empty string reason treated as omitted');
});

// 9. Input hash is deterministic and total
test('input hash is deterministic and differentiates requests', () => {
  const a = prospectTransitionInputHash({ prospect_id: VALID_ID, new_status: 'QUALIFIED' });
  const b = prospectTransitionInputHash({ prospect_id: VALID_ID, new_status: 'QUALIFIED' });
  assert(a === b && a !== '', '9: same input, same hash');
  const c = prospectTransitionInputHash({ prospect_id: VALID_ID, new_status: 'DISQUALIFIED' });
  assert(a !== c, '9: different new_status, different hash');
  const d = prospectTransitionInputHash({ prospect_id: VALID_ID, new_status: 'QUALIFIED', transition_reason: 'why' });
  assert(a !== d, '9: different reason, different hash');
  const e = prospectTransitionInputHash({ prospect_id: '99999999-9999-4999-8999-999999999999', new_status: 'QUALIFIED' });
  assert(a !== e, '9: different prospect, different hash');
  assert(prospectTransitionInputHash(null) === '', '9: null input hashes empty');
  assert(prospectTransitionInputHash('string') === '', '9: non-object hashes empty');
  assert(prospectTransitionInputHash([]) === '', '9: array hashes empty');
});

// 10. Tool definition: growth_agent-only, UPDATE on Prospect, medium risk,
//     approval required, DRAFT + disabled, no wildcards.
test('tool definition is DRAFT + disabled + growth_agent-only', () => {
  const def = PROSPECT_STATUS_UPDATE_TOOL_REGISTRY_DEF;
  assert(def.tool_id === 'update_own_prospect_status', '10: tool_id');
  assert(def.status === 'DRAFT', '10: DRAFT');
  assert(def.enabled === false, '10: disabled');
  assert(def.target_type === 'ENTITY' && def.target_name === 'Prospect', '10: target');
  assert(def.operation === 'UPDATE', '10: UPDATE only');
  assert(def.risk_level === 'medium', '10: medium risk');
  assert(def.human_approval_required === true, '10: approval required');
  assert(def.execution_scope === 'user_scoped' && def.permission_scope === 'self_records', '10: scopes');
  assert(def.allowed_agent_ids.length === 1 && def.allowed_agent_ids[0] === 'growth_agent', '10: allow-list');
  assert(!def.allowed_agent_ids.some((a) => a.includes('*')), '10: no wildcards');
});

// 11. Registry status set matches the live Prospect schema exactly
test('status set matches the Prospect schema', () => {
  assert(PROSPECT_STATUSES.length === 5, '11: five registered statuses');
  for (const s of PROSPECT_STATUSES) {
    assert(Array.isArray(PROSPECT_STATUS_TRANSITIONS[s]), `11: matrix row for ${s}`);
  }
  const matrixKeys = Object.keys(PROSPECT_STATUS_TRANSITIONS);
  assert(matrixKeys.length === 5, '11: matrix has exactly five source statuses');
  for (const k of matrixKeys) assert(PROSPECT_STATUSES.includes(k), `11: matrix key ${k} registered`);
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
// ============================================================
// Phase 8.3 — qualify_own_prospect deterministic test suite
// Dual runner: Deno.test under Deno, sequential under plain Node.
// All tests are local/deterministic — no network, no DB, no LLM,
// no production records touched.
// Run: node --experimental-strip-types base44/shared/prospectQualification.test.ts
// ============================================================
import {
  validateQualifyInput,
  buildQualification,
  buildQualificationNotFound,
  qualifyInputHash,
  PROSPECT_QUALIFY_TOOL_ID,
  PROSPECT_QUALIFY_TOOL_VERSION,
  PROSPECT_QUALIFY_SCORE_CAP,
  PROSPECT_QUALIFY_STATUSES,
  PROSPECT_QUALIFY_EPISTEMIC_LABELS,
  PROSPECT_QUALIFY_TOOL_REGISTRY_DEF,
} from './prospectQualification.ts';

const isDeno = typeof Deno !== 'undefined' && typeof Deno.test === 'function';
const cases = [];
function test(name, fn) { cases.push([name, fn]); }
function assert(cond, label) { if (!cond) throw new Error('FAILED: ' + label); }

const PROSPECT_ID = '11111111-1111-4111-8111-111111111111';
const INTEL_REF = '22222222-2222-4222-8222-222222222222';

const FULL_RECORD = {
  prospect_id: PROSPECT_ID,
  company_name: 'Acme Corporation',
  website: 'acme.com',
  industry: 'Software',
  location: 'Manila',
  notes: 'Met at industry event',
  intelligence_summary: 'Prior deterministic intelligence summary',
  qualification_score: 100,
  intelligence_reference: INTEL_REF,
  source: 'ai_workforce_prospect_intelligence',
  status: 'NEW',
};

const SPARSE_RECORD = {
  prospect_id: PROSPECT_ID,
  company_name: 'Acme Corporation',
  status: 'NEW',
};

// 1. Valid input accepted and normalized
test('valid prospect_id input is accepted', () => {
  const v = validateQualifyInput({ prospect_id: PROSPECT_ID.toUpperCase() });
  assert(v.ok, '1: valid input should pass');
  assert(v.input.prospect_id === PROSPECT_ID, '1: prospect_id normalized to lowercase');
});

// 2. Missing prospect_id rejected
test('missing prospect_id is rejected', () => {
  for (const bad of [{}, { prospect_id: '' }, { prospect_id: null }, { prospect_id: undefined }]) {
    const v = validateQualifyInput(bad);
    assert(!v.ok, `2: ${JSON.stringify(bad)} should be rejected`);
    assert(v.error_code === 'QUALIFY_PROSPECT_ID_REQUIRED', '2: error code');
  }
});

// 3. Malformed prospect_id rejected
test('malformed prospect_id values are rejected', () => {
  for (const bad of ['not-a-uuid', 'x'.repeat(200), 'prsp_123', 'DROP TABLE prospects', 42, true]) {
    const v = validateQualifyInput({ prospect_id: bad });
    assert(!v.ok, `3: ${String(bad)} should be rejected`);
    assert(v.error_code === 'QUALIFY_PROSPECT_ID_INVALID', '3: error code');
  }
});

// 4. Any unknown input key is rejected — identity, ownership, tenant,
//    selector, query, database, filter, projection, and mode keys.
test('unknown input keys are rejected', () => {
  const banned = [
    'user_id', 'owner_user_id', 'organization_id', 'organizationId',
    'entity', 'operation', 'function', 'table', 'query', 'database',
    'filter', 'fields', 'limit', 'sort', 'mode', 'analysis_mode',
    'agent_id', 'tool_id', 'target', 'select',
  ];
  for (const key of banned) {
    const v = validateQualifyInput({ prospect_id: PROSPECT_ID, [key]: 'x' });
    assert(!v.ok, `4: key "${key}" must be rejected`);
    assert(v.error_code === 'QUALIFY_INPUT_FIELD_REJECTED', `4: code for "${key}"`);
  }
});

// 5. Malformed input rejected
test('malformed inputs are rejected', () => {
  for (const bad of ['string', 42, [], true, [{ prospect_id: PROSPECT_ID }]]) {
    const v = validateQualifyInput(bad);
    assert(!v.ok, `5: ${JSON.stringify(bad)} should be rejected`);
    assert(v.error_code === 'QUALIFY_INPUT_INVALID', '5: error code');
  }
});

// 6. Deterministic scoring — identical input yields identical output
test('qualification is deterministic', () => {
  const a = buildQualification(FULL_RECORD, { intelligence_verified: true });
  const b = buildQualification(FULL_RECORD, { intelligence_verified: true });
  assert(JSON.stringify(a) === JSON.stringify(b), '6: identical output for identical input');
});

// 7. Score is a bounded integer, never above the cap, explainable
test('score is bounded, integer, and explainable', () => {
  const r = buildQualification(FULL_RECORD, { intelligence_verified: true });
  assert(Number.isInteger(r.qualification_score), '7: integer score');
  assert(r.qualification_score >= 0 && r.qualification_score <= PROSPECT_QUALIFY_SCORE_CAP, '7: bounded 0-cap');
  assert(r.qualification_score < 100, '7: never 100 — no external verification');
  assert(Array.isArray(r.score_factors) && r.score_factors.length > 0, '7: score factors present');
  // Exact deterministic value: 10+10+10+5+5+10+20+15+0(NEW) = 85
  assert(r.qualification_score === 85, `7: expected 85, got ${r.qualification_score}`);
});

// 8. Missing information never inflates the score and reduces confidence
test('sparse record produces low score and LOW confidence', () => {
  const r = buildQualification(SPARSE_RECORD, { intelligence_verified: false });
  assert(r.qualification_score <= 30, '8: sparse score stays low');
  assert(r.confidence.level === 'LOW', '8: LOW confidence for sparse record');
  assert(r.missing_information.length >= 5, '8: missing information is explicit');
  assert(r.fit_assessment.label === 'INFERRED', '8: fit assessment is INFERRED');
});

// 9. Confidence levels with explicit basis; categorical, never numeric
test('confidence levels have explicit bases', () => {
  const high = buildQualification(FULL_RECORD, { intelligence_verified: true });
  assert(high.confidence.level === 'HIGH', '9: verified full record is HIGH');
  const medium = buildQualification(
    { ...SPARSE_RECORD, website: 'acme.com', industry: 'Software', location: 'Manila' },
    { intelligence_verified: false },
  );
  assert(medium.confidence.level === 'MEDIUM', '9: three core fields is MEDIUM');
  const low = buildQualification(SPARSE_RECORD, { intelligence_verified: false });
  assert(low.confidence.level === 'LOW', '9: sparse is LOW');
  for (const r of [high, medium, low]) {
    assert(typeof r.confidence.basis === 'string' && r.confidence.basis.length > 0, '9: basis present');
    assert(['LOW', 'MEDIUM', 'HIGH'].includes(r.confidence.level), '9: categorical level');
  }
});

// 10. Unverified intelligence_reference earns no points, is labeled UNKNOWN,
//     and is never presented as verified evidence.
test('unverified intelligence reference is not relied upon', () => {
  const unverified = buildQualification(FULL_RECORD, { intelligence_verified: false });
  const verified = buildQualification(FULL_RECORD, { intelligence_verified: true });
  assert(unverified.qualification_score === verified.qualification_score - 15, '10: no +15 without verification');
  assert(unverified.intelligence_reference_verified === false, '10: verified flag false');
  const unknownSignal = unverified.risk_signals.find((s) => s.label === 'UNKNOWN' && s.signal.includes('treated as unavailable'));
  assert(Boolean(unknownSignal), '10: unverified reference labeled UNKNOWN in risk signals');
  assert(!unverified.evidence.some((e) => e.source === 'verified_prospect_intelligence'), '10: no verified-intelligence evidence claimed');
  assert(verified.intelligence_reference_verified === true, '10: verified flag true when verified');
});

// 11. DISQUALIFIED status reduces the score and is echoed as recommendation
test('disqualified status is handled deterministically', () => {
  const r = buildQualification({ ...FULL_RECORD, status: 'DISQUALIFIED' }, { intelligence_verified: true });
  // 85 - 30 = 55
  assert(r.qualification_score === 55, `11: expected 55, got ${r.qualification_score}`);
  assert(r.recommended_status === 'DISQUALIFIED', '11: recommendation echoes observed status');
  assert(r.observed_status === 'DISQUALIFIED', '11: observed status reported');
});

// 12. No mutation of the input record
test('analysis never mutates the Prospect record', () => {
  const record = JSON.parse(JSON.stringify(FULL_RECORD));
  const before = JSON.stringify(record);
  buildQualification(record, { intelligence_verified: true });
  assert(JSON.stringify(record) === before, '12: record unchanged after analysis');
});

// 13. Not-found result is safe — no data leak
test('not-found result is safe', () => {
  const nf = buildQualificationNotFound(PROSPECT_ID);
  assert(nf.found === false && nf.qualification === null, '13: found=false, no qualification');
  assert(!('company_name' in nf), '13: no company data leaked');
  assert(!('owner_user_id' in nf) && !('organization_id' in nf), '13: no identity fields');
  assert(typeof nf.notice === 'string' && nf.notice.length > 0, '13: notice present');
});

// 14. Evidence integrity — labels and sources are always valid
test('evidence labels and sources are always valid', () => {
  for (const verified of [true, false]) {
    const r = buildQualification(FULL_RECORD, { intelligence_verified: verified });
    for (const e of r.evidence) {
      assert(PROSPECT_QUALIFY_EPISTEMIC_LABELS.includes(e.label), `14: label ${e.label}`);
      assert(['prospect_record', 'verified_prospect_intelligence'].includes(e.source), `14: source ${e.source}`);
    }
    for (const s of r.opportunity_signals.concat(r.risk_signals)) {
      assert(PROSPECT_QUALIFY_EPISTEMIC_LABELS.includes(s.label), `14: signal label ${s.label}`);
    }
    assert(r.verification_notice.includes('No LLM'), '14: verification notice present');
    assert(r.recommendation_only === true, '14: recommendation only');
  }
});

// 15. Tool definition is growth_agent-only, DRAFT + disabled, no wildcards
test('tool definition is DRAFT + disabled + growth_agent-only', () => {
  const def = PROSPECT_QUALIFY_TOOL_REGISTRY_DEF;
  assert(def.tool_id === 'qualify_own_prospect', '15: tool id');
  assert(def.status === 'DRAFT', '15: DRAFT');
  assert(def.enabled === false, '15: disabled');
  assert(def.target_type === 'INTERNAL_SERVICE' && def.target_name === 'prospectQualification', '15: target');
  assert(def.operation === 'INVOKE', '15: invoke only');
  assert(def.execution_scope === 'user_scoped' && def.permission_scope === 'self_records', '15: scope');
  assert(def.risk_level === 'low', '15: low risk');
  assert(def.human_approval_required === false, '15: no approval gate');
  assert(def.allowed_agent_ids.length === 1 && def.allowed_agent_ids[0] === 'growth_agent', '15: allow-list');
  assert(!def.allowed_agent_ids.some((a) => a.includes('*')), '15: no wildcards');
  assert(PROSPECT_QUALIFY_STATUSES.length === 5, '15: registered status set');
});

// 16. Input hash is deterministic, per-prospect, and total over bad input
test('input hash is deterministic and per-prospect', () => {
  const h1 = qualifyInputHash({ prospect_id: PROSPECT_ID });
  const h2 = qualifyInputHash({ prospect_id: PROSPECT_ID });
  const h3 = qualifyInputHash({ prospect_id: '33333333-3333-4333-8333-333333333333' });
  assert(h1 === h2 && h1.length > 0, '16: deterministic for same prospect');
  assert(h1 !== h3, '16: different prospects hash differently');
  assert(qualifyInputHash(null) === '' && qualifyInputHash('x') === '', '16: total over invalid input');
  assert(typeof PROSPECT_QUALIFY_TOOL_VERSION === 'string', '16: tool version defined');
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
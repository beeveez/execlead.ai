/**
 * Deterministic contract test suite — Phase 11 Outreach Execution Boundary.
 * ============================================================
 * Verifies the strict execution contract, draft/Prospect/channel binding,
 * status safety, dry-run guarantees, zero external calls, zero persistence
 * outside the orchestration audit, and the truthful verification notice.
 * No network, no database, no production records — in-memory fixtures only.
 *
 * Dual-runner: registers cases with Deno.test under Deno, or runs them
 * sequentially under plain Node.js and reports pass/fail with a nonzero
 * exit code on failure.
 */
import {
  OUTREACH_EXECUTION_TOOL,
  OUTREACH_EXECUTION_CHANNELS,
  OUTREACH_EXECUTION_ELIGIBLE_STATUSES,
  OUTREACH_RECIPIENT_RESOLUTION_STATUS,
  OUTREACH_EXECUTION_DRY_RUN_STATUS,
  OUTREACH_EXECUTION_VERIFY_NOTICE,
  validateOutreachExecutionInput,
  outreachExecutionInputHash,
  validateExecutionApprovalBinding,
  validateOutreachStatusEligibility,
  buildOutreachExecutionDryRun,
} from './prospectOutreachExecution.ts';

const PROSPECT_A = '12345678-1234-4123-8123-123456789abc';
const PROSPECT_B = '87654321-4321-4321-8321-cba987654321';
const APPROVAL_1 = 'aaaaaaaa-bbbb-4bbb-8bbb-cccccccccccc';
const DRAFT_HASH_1 = 'a1b2c3d4e5f60718';
const DRAFT_HASH_2 = 'deadbeefdeadbeef';
const IDEM_1 = 'outreach-exec-0001';
const IDEM_2 = 'outreach-exec-0002';

const VALID_INPUT = {
  prospect_id: PROSPECT_A,
  channel: 'EMAIL',
  approved_draft_hash: DRAFT_HASH_1,
  idempotency_key: IDEM_1,
};

function assert(cond, msg) {
  if (!cond) throw new Error(msg || 'assertion failed');
}
function assertEquals(a, b, msg) {
  if (a !== b) {
    throw new Error((msg || 'assertEquals') + `: expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`);
  }
}

const tests = [];
const test = (name, fn) => tests.push({ name, fn });

// ── Valid execution request ──

test('valid full execution request is accepted and normalized', () => {
  const v = validateOutreachExecutionInput({
    prospect_id: PROSPECT_A.toUpperCase(),
    channel: 'email',
    approved_draft_hash: DRAFT_HASH_1.toUpperCase(),
    idempotency_key: IDEM_1,
  });
  assert(v.ok, 'valid input must pass: ' + JSON.stringify(v));
  assertEquals(v.input.prospect_id, PROSPECT_A, 'prospect_id normalized');
  assertEquals(v.input.channel, 'EMAIL', 'channel normalized');
  assertEquals(v.input.approved_draft_hash, DRAFT_HASH_1, 'draft hash normalized');
});

test('valid execution request with approval_id is accepted', () => {
  const v = validateOutreachExecutionInput({ ...VALID_INPUT, approval_id: APPROVAL_1.toUpperCase() });
  assert(v.ok, 'valid input with approval_id must pass');
  assertEquals(v.input.approval_id, APPROVAL_1, 'approval_id normalized');
});

test('non-object input is rejected', () => {
  for (const bad of [null, undefined, 'x', 42, [], true]) {
    const v = validateOutreachExecutionInput(bad);
    assertEquals(v.ok, false, 'non-object must be rejected');
    assertEquals(v.error_code, 'OUTREACH_EXECUTION_INPUT_INVALID', 'non-object code');
  }
});

// ── Missing / malformed fields ──

test('missing required fields are rejected with distinct codes', () => {
  assertEquals(validateOutreachExecutionInput({ channel: 'EMAIL', approved_draft_hash: DRAFT_HASH_1, idempotency_key: IDEM_1 }).error_code,
    'OUTREACH_EXECUTION_PROSPECT_ID_REQUIRED', 'prospect_id required');
  assertEquals(validateOutreachExecutionInput({ prospect_id: PROSPECT_A, approved_draft_hash: DRAFT_HASH_1, idempotency_key: IDEM_1 }).error_code,
    'OUTREACH_EXECUTION_CHANNEL_REQUIRED', 'channel required');
  assertEquals(validateOutreachExecutionInput({ prospect_id: PROSPECT_A, channel: 'EMAIL', idempotency_key: IDEM_1 }).error_code,
    'OUTREACH_EXECUTION_DRAFT_HASH_REQUIRED', 'draft hash required');
  assertEquals(validateOutreachExecutionInput({ prospect_id: PROSPECT_A, channel: 'EMAIL', approved_draft_hash: DRAFT_HASH_1 }).error_code,
    'OUTREACH_EXECUTION_IDEMPOTENCY_KEY_REQUIRED', 'idempotency key required');
});

test('malformed prospect_id is rejected', () => {
  for (const bad of ['', 'not-a-uuid', '123', `${PROSPECT_A}@evil`, '12345678-1234-4123-8123']) {
    const v = validateOutreachExecutionInput({ ...VALID_INPUT, prospect_id: bad });
    assertEquals(v.ok, false, 'malformed prospect_id must be rejected');
    assertEquals(v.error_code, 'OUTREACH_EXECUTION_PROSPECT_ID_INVALID', 'malformed prospect_id code');
  }
});

test('malformed approval_id is rejected', () => {
  const v = validateOutreachExecutionInput({ ...VALID_INPUT, approval_id: 'not-a-uuid' });
  assertEquals(v.ok, false, 'malformed approval_id must be rejected');
  assertEquals(v.error_code, 'OUTREACH_EXECUTION_APPROVAL_ID_INVALID', 'malformed approval_id code');
});

test('invalid channel is rejected', () => {
  for (const bad of ['SMS', 'WHATSAPP', 'X', '', 'EMAIL; DROP', 'EMAIL LINKEDIN']) {
    const v = validateOutreachExecutionInput({ ...VALID_INPUT, channel: bad });
    assertEquals(v.ok, false, 'invalid channel must be rejected');
    assertEquals(v.error_code, 'OUTREACH_EXECUTION_CHANNEL_INVALID', 'invalid channel code');
  }
});

test('invalid draft hash is rejected', () => {
  for (const bad of ['', 'abc', 'ZZZZZZZZZZZZZZZZ', 'a1b2c3d4e5f6071z', `x'.repeat(65)`, 'a1b2c3d4 e5f60718', '<script>']) {
    const v = validateOutreachExecutionInput({ ...VALID_INPUT, approved_draft_hash: bad });
    assertEquals(v.ok, false, 'invalid draft hash must be rejected');
    assertEquals(v.error_code, 'OUTREACH_EXECUTION_DRAFT_HASH_INVALID', 'invalid draft hash code');
  }
});

test('invalid idempotency_key is rejected', () => {
  for (const bad of ['', 'short', 'has space!', 'unicode-ключ-значение', `k${'x'.repeat(70)}`, 'bad*key!']) {
    const v = validateOutreachExecutionInput({ ...VALID_INPUT, idempotency_key: bad });
    assertEquals(v.ok, false, 'invalid idempotency key must be rejected');
    assertEquals(v.error_code, 'OUTREACH_EXECUTION_IDEMPOTENCY_KEY_INVALID', 'invalid idempotency key code');
  }
});

// ── Injection classes: every non-contract key is rejected ──

test('recipient and delivery injections are rejected as unknown fields', () => {
  const injections = [
    'recipient', 'to', 'email', 'phone', 'phone_number', 'external_id', 'message_id',
    'crm_id', 'send', 'schedule', 'execute', 'deliver', 'sms_body', 'subject', 'body',
    'html', 'message', 'draft_message', 'linkedin_url', 'social_account',
  ];
  for (const key of injections) {
    const v = validateOutreachExecutionInput({ ...VALID_INPUT, [key]: 'attacker-controlled' });
    assertEquals(v.ok, false, `injected key "${key}" must be rejected`);
    assertEquals(v.error_code, 'OUTREACH_EXECUTION_FIELD_REJECTED', `injected key "${key}" code`);
  }
});

test('identity and selector injections are rejected as unknown fields', () => {
  const injections = [
    'user_id', 'owner_user_id', 'organization_id', 'entity', 'operation', 'function',
    'query', 'database', 'table', 'selector', 'fields', 'filters', 'sort', 'limit',
    'approval_status', 'status', 'approver_user_id', 'role',
  ];
  for (const key of injections) {
    const v = validateOutreachExecutionInput({ ...VALID_INPUT, [key]: 'attacker-controlled' });
    assertEquals(v.ok, false, `injected key "${key}" must be rejected`);
    assertEquals(v.error_code, 'OUTREACH_EXECUTION_FIELD_REJECTED', `injected key "${key}" code`);
  }
});

test('no arbitrary field of any kind is accepted', () => {
  const v = validateOutreachExecutionInput({ ...VALID_INPUT, totally_arbitrary: 'x' });
  assertEquals(v.ok, false, 'arbitrary fields must be rejected');
  assertEquals(v.error_code, 'OUTREACH_EXECUTION_FIELD_REJECTED', 'arbitrary field code');
});

// ── Deterministic request hashing ──

test('input hash is deterministic and stable', () => {
  const h1 = outreachExecutionInputHash(VALID_INPUT);
  const h2 = outreachExecutionInputHash({ ...VALID_INPUT });
  assertEquals(h1, h2, 'identical requests hash identically');
  assert(/^[0-9a-f]+$/.test(h1), 'hash is lowercase hex');
  assertEquals(outreachExecutionInputHash(null), '', 'invalid input hashes to empty string');
});

test('input hash changes when ANY binding field changes', () => {
  const base = outreachExecutionInputHash(VALID_INPUT);
  assert(outreachExecutionInputHash({ ...VALID_INPUT, prospect_id: PROSPECT_B }) !== base, 'prospect change changes hash');
  assert(outreachExecutionInputHash({ ...VALID_INPUT, channel: 'LINKEDIN' }) !== base, 'channel change changes hash');
  assert(outreachExecutionInputHash({ ...VALID_INPUT, approved_draft_hash: DRAFT_HASH_2 }) !== base, 'draft hash change changes hash');
  assert(outreachExecutionInputHash({ ...VALID_INPUT, idempotency_key: IDEM_2 }) !== base, 'idempotency key change changes hash');
});

test('input hash excludes approval_id so issuance and execution bind identically', () => {
  const without = outreachExecutionInputHash(VALID_INPUT);
  const withApproval = outreachExecutionInputHash({ ...VALID_INPUT, approval_id: APPROVAL_1 });
  assertEquals(without, withApproval, 'approval_id must not change the binding hash');
});

// ── Draft / Prospect / channel binding ──

const BINDING_META = {
  prospect_id: PROSPECT_A,
  channel: 'EMAIL',
  draft_hash: DRAFT_HASH_1,
  source_status: 'QUALIFIED',
};

test('fully matching approval binding passes', () => {
  const v = validateOutreachExecutionInput(VALID_INPUT);
  const b = validateExecutionApprovalBinding(v.input, BINDING_META);
  assert(b.ok, 'matching binding must pass: ' + JSON.stringify(b));
});

test('Prospect substitution is blocked with a distinct code', () => {
  const v = validateOutreachExecutionInput({ ...VALID_INPUT, prospect_id: PROSPECT_B });
  const b = validateExecutionApprovalBinding(v.input, BINDING_META);
  assertEquals(b.ok, false, 'prospect substitution must be blocked');
  assertEquals(b.error_code, 'OUTREACH_APPROVAL_PROSPECT_MISMATCH', 'prospect mismatch code');
});

test('channel substitution is blocked with a distinct code', () => {
  const v = validateOutreachExecutionInput({ ...VALID_INPUT, channel: 'LINKEDIN' });
  const b = validateExecutionApprovalBinding(v.input, BINDING_META);
  assertEquals(b.ok, false, 'channel substitution must be blocked');
  assertEquals(b.error_code, 'OUTREACH_APPROVAL_CHANNEL_MISMATCH', 'channel mismatch code');
});

test('draft hash substitution is blocked with a distinct code', () => {
  const v = validateOutreachExecutionInput({ ...VALID_INPUT, approved_draft_hash: DRAFT_HASH_2 });
  const b = validateExecutionApprovalBinding(v.input, BINDING_META);
  assertEquals(b.ok, false, 'draft hash substitution must be blocked');
  assertEquals(b.error_code, 'OUTREACH_APPROVAL_DRAFT_HASH_MISMATCH', 'draft hash mismatch code');
});

test('missing or malformed approval metadata fails closed', () => {
  const v = validateOutreachExecutionInput(VALID_INPUT);
  for (const bad of [null, undefined, {}, [], 'x', { channel: 'EMAIL', draft_hash: DRAFT_HASH_1 }]) {
    const b = validateExecutionApprovalBinding(v.input, bad);
    assertEquals(b.ok, false, 'missing metadata must fail closed');
    assertEquals(b.error_code, 'OUTREACH_APPROVAL_PROSPECT_MISMATCH', 'fail-closed binding code');
  }
});

// ── Status safety ──

test('QUALIFIED and PURSUING are the only eligible statuses', () => {
  const q = validateOutreachStatusEligibility('QUALIFIED');
  const p = validateOutreachStatusEligibility('PURSUING');
  assert(q.ok && p.ok, 'QUALIFIED and PURSUING must be eligible');
});

test('NEW, DISQUALIFIED, and CONVERTED statuses are blocked', () => {
  for (const status of ['NEW', 'DISQUALIFIED', 'CONVERTED']) {
    const e = validateOutreachStatusEligibility(status);
    assertEquals(e.ok, false, `${status} must be blocked`);
    assertEquals(e.error_code, 'OUTREACH_STATUS_NOT_ELIGIBLE', `${status} code`);
    assert(e.error.includes(status), 'refusal must truthfully name the blocking status');
  }
});

test('unknown or missing status is blocked', () => {
  for (const status of [undefined, null, '', 'ARCHIVED', 'qualified']) {
    const e = validateOutreachStatusEligibility(status);
    assertEquals(e.ok, false, 'unknown status must be blocked');
    assertEquals(e.error_code, 'OUTREACH_STATUS_NOT_ELIGIBLE', 'unknown status code');
  }
});

// ── Dry-run guarantees ──

test('dry-run result is the terminal DRY_RUN_BLOCKED_EXTERNAL_DELIVERY state', () => {
  const v = validateOutreachExecutionInput(VALID_INPUT);
  const r = buildOutreachExecutionDryRun(v.input, APPROVAL_1, { prospect_status: 'QUALIFIED' });
  assertEquals(r.execution_status, OUTREACH_EXECUTION_DRY_RUN_STATUS, 'dry-run status');
  assertEquals(r.dry_run, true, 'dry_run flag');
  assertEquals(r.external_delivery, false, 'external_delivery flag');
  assertEquals(r.delivered, false, 'delivered flag');
  assertEquals(r.sent, false, 'sent flag');
  assertEquals(r.scheduled, false, 'scheduled flag');
  assertEquals(r.persisted, false, 'persisted flag');
});

test('dry-run recipient resolution terminates at DELIVERY_NOT_IMPLEMENTED with no recipient', () => {
  const v = validateOutreachExecutionInput(VALID_INPUT);
  const r = buildOutreachExecutionDryRun(v.input, APPROVAL_1, { prospect_status: 'QUALIFIED' });
  assertEquals(r.recipient_resolution.status, OUTREACH_RECIPIENT_RESOLUTION_STATUS, 'recipient resolution status');
  assertEquals(r.recipient_resolution.resolved_recipient, null, 'no recipient is ever resolved');
  assert(r.recipient_resolution.note.includes('never accepts a client-supplied destination'), 'recipient safety note');
});

test('dry-run result binds the exact approved Prospect, channel, and draft hash', () => {
  const v = validateOutreachExecutionInput(VALID_INPUT);
  const r = buildOutreachExecutionDryRun(v.input, APPROVAL_1, { prospect_status: 'QUALIFIED' });
  assertEquals(r.prospect_id, PROSPECT_A, 'prospect binding echoed');
  assertEquals(r.channel, 'EMAIL', 'channel binding echoed');
  assertEquals(r.approved_draft_hash, DRAFT_HASH_1, 'draft hash binding echoed');
  assertEquals(r.approval_id, APPROVAL_1, 'approval linkage echoed');
});

test('dry-run verification notice explicitly states NOTHING SENT and never claims delivery', () => {
  const v = validateOutreachExecutionInput(VALID_INPUT);
  const r = buildOutreachExecutionDryRun(v.input, APPROVAL_1, { prospect_status: 'QUALIFIED' });
  assert(r.verification_notice.includes('DRY RUN — NOTHING SENT'), 'notice must state NOTHING SENT');
  assert(r.verification_notice.includes(OUTREACH_RECIPIENT_RESOLUTION_STATUS), 'notice must name the safe terminal state');
  assertEquals(r.verification_notice, OUTREACH_EXECUTION_VERIFY_NOTICE, 'canonical notice text');
  const lowered = JSON.stringify(r).toLowerCase();
  assert(!lowered.includes('"delivered":true') && !lowered.includes('"sent":true'), 'result must never claim delivery');
});

test('dry-run result is deterministic for identical input', () => {
  const v = validateOutreachExecutionInput(VALID_INPUT);
  const r1 = JSON.stringify(buildOutreachExecutionDryRun(v.input, APPROVAL_1, { prospect_status: 'QUALIFIED' }));
  const r2 = JSON.stringify(buildOutreachExecutionDryRun(v.input, APPROVAL_1, { prospect_status: 'QUALIFIED' }));
  assertEquals(r1, r2, 'identical input produces identical dry-run output');
});

// ── Tool registry configuration ──

test('tool remains DRAFT, disabled, high-risk, approval-required, growth-agent-only', () => {
  assertEquals(OUTREACH_EXECUTION_TOOL.tool_id, 'execute_prospect_outreach', 'tool id');
  assertEquals(OUTREACH_EXECUTION_TOOL.status, 'DRAFT', 'tool must remain DRAFT');
  assertEquals(OUTREACH_EXECUTION_TOOL.enabled, false, 'tool must remain disabled');
  assertEquals(OUTREACH_EXECUTION_TOOL.risk_level, 'high', 'risk level must not be lowered');
  assertEquals(OUTREACH_EXECUTION_TOOL.human_approval_required, true, 'approval requirement must stay enabled');
  assertEquals(OUTREACH_EXECUTION_TOOL.target_type, 'INTERNAL_SERVICE', 'target type');
  assertEquals(OUTREACH_EXECUTION_TOOL.target_name, 'prospectOutreachExecution', 'target name');
  assertEquals(OUTREACH_EXECUTION_TOOL.operation, 'INVOKE', 'operation');
  assertEquals(OUTREACH_EXECUTION_TOOL.execution_scope, 'user_scoped', 'execution scope');
  assertEquals(OUTREACH_EXECUTION_TOOL.permission_scope, 'self_records', 'permission scope');
  assertEquals(JSON.stringify(OUTREACH_EXECUTION_TOOL.allowed_agent_ids), JSON.stringify(['growth_agent']), 'growth agent only');
  assert(!OUTREACH_EXECUTION_TOOL.allowed_agent_ids.some((a) => a.includes('*')), 'no wildcards');
});

test('registered channels and eligible statuses match the contract', () => {
  assertEquals(JSON.stringify(OUTREACH_EXECUTION_CHANNELS), JSON.stringify(['EMAIL', 'LINKEDIN', 'CALL']), 'channels');
  assertEquals(JSON.stringify(OUTREACH_EXECUTION_ELIGIBLE_STATUSES), JSON.stringify(['QUALIFIED', 'PURSUING']), 'eligible statuses');
});

// ── Zero external capability surface (source scan of the shipped module) ──

test('module source contains no external capability surface and no persistence', async () => {
  let src = '';
  try {
    if (typeof Deno !== 'undefined' && typeof Deno.readTextFile === 'function') {
      src = await Deno.readTextFile(new URL('./prospectOutreachExecution.ts', import.meta.url));
    } else {
      const { readFileSync } = await import('node:fs');
      src = readFileSync(new URL('./prospectOutreachExecution.ts', import.meta.url), 'utf8');
    }
  } catch (err) {
    throw new Error('Could not read the shipped module source for the safety scan: ' + String(err));
  }
  const forbidden = [
    'fetch(', 'smtp', 'twilio', 'gmail', 'outlook', 'linkedin', '.entities.',
    'sendEmail', 'sendMessage', 'XMLHttpRequest', 'WebSocket', 'googleapis',
    'base44', 'createClient', 'process.env',
  ];
  for (const s of forbidden) {
    assertEquals(src.includes(s), false, `module must not contain external-capability string "${s}"`);
  }
});

// ── Runner ──

let failed = 0;
let passed = 0;
if (typeof Deno !== 'undefined' && typeof Deno.test === 'function') {
  for (const t of tests) Deno.test(t.name, t.fn);
} else {
  for (const t of tests) {
    try {
      await t.fn();
      passed++;
    } catch (e) {
      failed++;
      console.error(`FAIL: ${t.name} — ${e && e.message ? e.message : e}`);
    }
  }
  if (failed > 0) {
    console.error(`${failed} test(s) failed`);
    process.exitCode = 1;
  } else {
    console.log(`ALL ${passed} TESTS PASSED`);
  }
}
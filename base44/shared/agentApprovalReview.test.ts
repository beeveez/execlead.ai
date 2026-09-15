// ============================================================
// Agent Approval Review — deterministic UI/backend integration suite
// Dual runner: Deno.test under Deno, sequential under plain Node
// (node --experimental-strip-types base44/shared/agentApprovalReview.test.ts).
// All tests are local/deterministic — NO network, NO database, NO LLM,
// NO production records touched. The existing PENDING approvals
// 04b0f29c-4665-4fda-84d7-62da66decf17 and
// 786e0b21-efa2-4830-b0c9-7ebbb2a03aea are never read, referenced,
// or mutated by this suite.
// ============================================================
import { decideApproval, PLATFORM_ROLES } from './agentOrchestrationCore.ts';

const isDeno = typeof Deno !== 'undefined' && typeof Deno.test === 'function';
const cases = [];
function test(name, fn) { cases.push([name, fn]); }
function assert(cond, label) { if (!cond) throw new Error('FAILED: ' + label); }
function assertEquals(actual, expected, label) {
  const a = JSON.stringify(actual), e = JSON.stringify(expected);
  if (a !== e) throw new Error(`${label}: expected ${e} but got ${a}`);
}

// ── App-root-relative source reader (Deno in-repo and Node harness) ──
async function readAppFile(rel) {
  const candidates = ['../../' + rel, '/app/' + rel];
  for (const c of candidates) {
    try {
      const url = new URL(c, import.meta.url);
      if (isDeno) return Deno.readTextFileSync(url);
      // deno-lint-ignore no-nodejs
      const fs = await await_import_node_fs();
      return fs.readFileSync(url, 'utf8');
    } catch (e) { /* try next candidate */ }
  }
  throw new Error('could not locate ' + rel);
}
let __fs = null;
async function await_import_node_fs() {
  if (!__fs) __fs = await import('node:fs');
  return __fs;
}
async function readSource(rel) { return readAppFile(rel); }

const PAGE = 'src/pages/developer/AgentApprovalReview.jsx';
const CARD = 'src/components/developer/approvals/ApprovalCard.jsx';
const DIALOG = 'src/components/developer/approvals/DecisionDialog.jsx';

// ============================================================
// Backend contract — decideApproval is the single governed authority
// ============================================================
const REQUESTER_ID = 'usr-requester-000000000001';
const ADMIN_APPROVER = { id: 'usr-admin-000000000002', role: 'admin', data: { organization_id: 'org-A' } };
const PLATFORM_APPROVER = { id: 'usr-super-000000000003', role: 'super_admin', data: { organization_id: 'org-Z' } };
const WEAK_APPROVER = { id: 'usr-basic-000000000004', role: 'user', data: { organization_id: 'org-A' } };
const FUTURE = '2099-01-01T00:00:00.000Z';
const PAST = '2020-01-01T00:00:00.000Z';

function makeStore(records) {
  const store = {
    records: records.map((r) => ({ ...r })),
    updates: [],
  };
  const svc = {
    entities: {
      AgentApproval: {
        filter: async (query) => store.records.filter((r) => r.approval_id === query.approval_id),
        update: async (id, patch) => {
          const rec = store.records.find((r) => r.id === id);
          if (!rec) throw new Error('record not found');
          store.updates.push({ id, patch: { ...patch } });
          Object.assign(rec, patch);
          return { ...rec };
        },
      },
    },
  };
  return { store, svc };
}

function pendingApproval(overrides = {}) {
  return {
    id: 'rec-0001',
    approval_id: 'ap-0001',
    agent_id: 'growth_agent',
    tool_id: 'create_own_prospect',
    status: 'PENDING',
    user_id: REQUESTER_ID,
    risk_level: 'medium',
    required_approver_role: 'admin',
    approval_type: 'USER',
    requested_at: '2026-09-15T00:00:00.000Z',
    expires_at: FUTURE,
    organization_id: null,
    ...overrides,
  };
}

async function decide(svc, user, body) {
  const res = await decideApproval(svc, user, body);
  const json = await res.json();
  return { code: res.status, body: json };
}

// 1. Authorized admin can decide a pending approval
test('authorized admin can approve a pending approval', async () => {
  const { store, svc } = makeStore([pendingApproval()]);
  const r = await decide(svc, ADMIN_APPROVER, { approval_id: 'ap-0001', decision: 'approve', notes: 'reviewed' });
  assertEquals(r.code, 200, 'T1 http');
  assertEquals(r.body.status, 'APPROVED', 'T1 status');
  assertEquals(r.body.approval_id, 'ap-0001', 'T1 approval id');
  assertEquals(store.records[0].approver_user_id, ADMIN_APPROVER.id, 'T1 approver recorded');
  assertEquals(store.records[0].decision_notes, 'reviewed', 'T1 notes recorded');
  assert(store.records[0].approved_at, 'T1 approved_at set');
  assert(store.records[0].decided_at, 'T1 decided_at set');
  assert(!store.records[0].rejection_reason, 'T1 no rejection reason');
  // Approver must differ from the requester — self-approval impossible here
  assert(store.records[0].approver_user_id !== store.records[0].user_id, 'T1 not self-approved');
});

test('authorized admin can reject a pending approval', async () => {
  const { store, svc } = makeStore([pendingApproval()]);
  const r = await decide(svc, ADMIN_APPROVER, { approval_id: 'ap-0001', decision: 'reject', notes: 'not ready' });
  assertEquals(r.code, 200, 'T2 http');
  assertEquals(r.body.status, 'REJECTED', 'T2 status');
  assertEquals(store.records[0].status, 'REJECTED', 'T2 record rejected');
  assertEquals(store.records[0].rejection_reason, 'not ready', 'T2 rejection reason');
  assertEquals(store.records[0].approved_at, null, 'T2 not approved');
});

// 3. Requester can never self-approve
test('requester cannot self-approve or self-reject', async () => {
  const { store, svc } = makeStore([pendingApproval()]);
  const requester = { id: REQUESTER_ID, role: 'admin', data: {} };
  const r = await decide(svc, requester, { approval_id: 'ap-0001', decision: 'approve' });
  assertEquals(r.code, 403, 'T3 http');
  assertEquals(r.body.error_code, 'SELF_APPROVAL_PROHIBITED', 'T3 code');
  assertEquals(store.records[0].status, 'PENDING', 'T3 record untouched');
  assertEquals(store.updates.length, 0, 'T3 no writes');
  const r2 = await decide(svc, requester, { approval_id: 'ap-0001', decision: 'reject' });
  assertEquals(r2.code, 403, 'T3 reject http');
  assertEquals(store.records[0].status, 'PENDING', 'T3 reject untouched');
});

// 2. Insufficient role cannot decide
test('insufficient role cannot decide and nothing is recorded', async () => {
  const { store, svc } = makeStore([pendingApproval()]);
  const r = await decide(svc, WEAK_APPROVER, { approval_id: 'ap-0001', decision: 'approve' });
  assertEquals(r.code, 403, 'T4 http');
  assertEquals(r.body.error_code, 'APPROVER_ROLE_REQUIRED', 'T4 code');
  assertEquals(store.records[0].status, 'PENDING', 'T4 record untouched');
  assertEquals(store.updates.length, 0, 'T4 no writes');
});

test('platform roles may decide cross-organization approvals', async () => {
  const { store, svc } = makeStore([pendingApproval({ organization_id: 'org-A' })]);
  const r = await decide(svc, PLATFORM_APPROVER, { approval_id: 'ap-0001', decision: 'approve' });
  assertEquals(r.code, 200, 'T5 http');
  assertEquals(store.records[0].status, 'APPROVED', 'T5 approved');
});

test('organization boundary blocks a mismatched non-platform approver', async () => {
  const { store, svc } = makeStore([pendingApproval({ organization_id: 'org-A' })]);
  const otherOrg = { id: 'usr-other-000000000005', role: 'admin', data: { organization_id: 'org-B' } };
  const r = await decide(svc, otherOrg, { approval_id: 'ap-0001', decision: 'approve' });
  assertEquals(r.code, 403, 'T6 http');
  assertEquals(store.records[0].status, 'PENDING', 'T6 record untouched');
});

// 8. Already-decided approvals are immutable
test('already-decided approvals can never be re-decided', async () => {
  const { store, svc } = makeStore([pendingApproval({ status: 'APPROVED', decided_at: '2026-09-15T01:00:00.000Z' })]);
  const r = await decide(svc, ADMIN_APPROVER, { approval_id: 'ap-0001', decision: 'reject' });
  assertEquals(r.code, 409, 'T7 http');
  assertEquals(r.body.status, 'APPROVED', 'T7 reports decided state');
  assertEquals(store.records[0].status, 'APPROVED', 'T7 record immutable');
  assertEquals(store.updates.length, 0, 'T7 no writes');
});

// 7. Expired approvals fail closed
test('expired approvals are marked EXPIRED and never decided', async () => {
  const { store, svc } = makeStore([pendingApproval({ expires_at: PAST })]);
  const r = await decide(svc, ADMIN_APPROVER, { approval_id: 'ap-0001', decision: 'approve' });
  assertEquals(r.code, 409, 'T8 http');
  assertEquals(r.body.status, 'EXPIRED', 'T8 status');
  assertEquals(store.records[0].status, 'EXPIRED', 'T8 record expired');
  assertEquals(store.records[0].approver_user_id, undefined, 'T8 no approver recorded');
});

test('missing approval and invalid decision are rejected', async () => {
  const { svc } = makeStore([pendingApproval()]);
  const r1 = await decide(svc, ADMIN_APPROVER, { decision: 'approve' });
  assertEquals(r1.code, 400, 'T9 missing id');
  const r2 = await decide(svc, ADMIN_APPROVER, { approval_id: 'ap-0001', decision: 'maybe' });
  assertEquals(r2.code, 400, 'T9 invalid decision');
  const r3 = await decide(svc, ADMIN_APPROVER, { approval_id: 'ap-nope', decision: 'approve' });
  assertEquals(r3.code, 404, 'T9 not found');
});

// 11. Approval never auto-executes anything
test('a decision performs no execution side effect', async () => {
  const { store, svc } = makeStore([pendingApproval()]);
  const r = await decide(svc, ADMIN_APPROVER, { approval_id: 'ap-0001', decision: 'approve' });
  assertEquals(r.code, 200, 'T10 http');
  assertEquals(Object.keys(svc.entities).join(','), 'AgentApproval', 'T10 only AgentApproval touched');
  assertEquals(store.updates.length, 1, 'T10 exactly one approval write');
});

test('decided approvals remain immutable after a fresh decision (append-only)', async () => {
  const { store, svc } = makeStore([pendingApproval({ status: 'REJECTED' })]);
  const r = await decide(svc, ADMIN_APPROVER, { approval_id: 'ap-0001', decision: 'approve' });
  assertEquals(r.code, 409, 'T11 http');
  assertEquals(store.records[0].status, 'REJECTED', 'T11 stays rejected');
});

test('PLATFORM_ROLES contains exactly the platform roles', () => {
  assertEquals(PLATFORM_ROLES, ['super_admin', 'platform_admin', 'founder_root_admin'], 'T12 roles');
});

// ============================================================
// UI contract — the review surface must stay governed
// ============================================================
test('the page decides exclusively through the governed backend capability', async () => {
  const page = await readSource(PAGE);
  assert(page.includes('agentOrchestrationService'), 'U1 invokes agentOrchestrationService');
  assert(page.includes('decide_approval'), 'U1 uses decide_approval action');
  assert(page.includes('approval_id') === false || page.includes('decision,'), 'U1 decision flow');
});

test('the UI never mutates AgentApproval records or roles from the client', async () => {
  const page = await readSource(PAGE);
  const card = await readSource(CARD);
  const dialog = await readSource(DIALOG);
  for (const src of [page, card, dialog]) {
    assert(!src.includes('AgentApproval.update'), 'U2 no direct approval update');
    assert(!src.includes('AgentApproval.create'), 'U2 no approval creation');
    assert(!src.includes('AgentApproval.delete'), 'U2 no approval deletion');
    assert(!src.includes('asServiceRole'), 'U2 no service-role bypass');
    assert(!src.includes('bulkUpdate') && !src.includes('updateMany') && !src.includes('deleteMany'), 'U2 no bulk ops');
    assert(!src.includes('entities.User'), 'U2 no user/role mutation surface');
    assert(!src.includes('inviteUser'), 'U2 no invites');
  }
});

test('the UI reads approvals only through the RLS-governed client', async () => {
  const page = await readSource(PAGE);
  assert(page.includes('base44.entities.AgentApproval.filter'), 'U3 RLS read path (filter)');
  assert(page.includes('base44.entities.AgentApproval.list'), 'U3 RLS read path (list)');
});

test('explicit confirmation is required before Approve and Reject', async () => {
  const page = await readSource(PAGE);
  const dialog = await readSource(DIALOG);
  assert(dialog.includes('AlertDialog'), 'U4 confirmation dialog is an AlertDialog');
  assert(dialog.includes('Confirm Approve') && dialog.includes('Confirm Reject'), 'U4 explicit confirm labels');
  assert(page.includes('openDecision'), 'U4 decisions open via dialog');
  assert(page.includes('if (!dialog || submitting) return;'), 'U4 decision gated on dialog + not submitting');
});

test('duplicate-click protection while a decision is processing', async () => {
  const page = await readSource(PAGE);
  const card = await readSource(CARD);
  const dialog = await readSource(DIALOG);
  assert(page.includes('processingId') && page.includes('submitting'), 'U5 processing states');
  assert(page.includes('if (!dialog || submitting) return;'), 'U5 confirm guard');
  assert(page.includes('if (processingId || submitting) return;'), 'U5 open guard');
  assert(card.includes('controlsDisabled') && card.includes('disabled={controlsDisabled}'), 'U5 buttons disabled');
  assert(dialog.includes('disabled={submitting}'), 'U5 dialog disabled while submitting');
});

test('expired and already-decided approvals are handled before invoking the backend', async () => {
  const card = await readSource(CARD);
  assert(card.includes('isExpired') && card.includes('Date.parse'), 'U6 expiry detection');
  assert(card.includes('isDecided') && card.includes('approval.status !== "PENDING"'), 'U6 decided detection');
});

test('the list is re-read after every decision outcome', async () => {
  const page = await readSource(PAGE);
  assert(/finally\s*{[\s\S]*?loadApprovals\(\);/.test(page), 'U7 reload in finally after decision');
  assert(page.includes('Decision not recorded'), 'U7 backend denial surfaced');
});

test('self-approval is prevented in the UI as well as the backend', async () => {
  const card = await readSource(CARD);
  assert(card.includes('isSelf') && card.includes('approval.user_id === currentUser.id'), 'U8 self detection');
  assert(card.includes('controlsDisabled = isDecided || isSelf'), 'U8 self disables controls');
});

test('the UI performs no frontend authorization of its own', async () => {
  const page = await readSource(PAGE);
  const card = await readSource(CARD);
  assert(!page.includes('role ==='), 'U9 page never checks roles for authorization');
  assert(!card.includes('role ==='), 'U9 card never checks roles for authorization');
});

test('no sensitive credential or contact data is rendered', async () => {
  const page = await readSource(PAGE);
  const card = await readSource(CARD);
  const dialog = await readSource(DIALOG);
  for (const src of [page, card, dialog]) {
    assert(!src.includes('contact_value'), 'U10 no contact values');
    assert(!src.toLowerCase().includes('accesstoken'), 'U10 no tokens');
    assert(!src.includes('client_secret'), 'U10 no secrets');
  }
  assert(!card.includes('.metadata'), 'U10 approval metadata never rendered');
});

test('no live approval identifiers are hardcoded in the surface', async () => {
  const page = await readSource(PAGE);
  const card = await readSource(CARD);
  const dialog = await readSource(DIALOG);
  for (const src of [page, card, dialog]) {
    assert(!src.includes('04b0f29c'), 'U11 no 04b0f29c reference');
    assert(!src.includes('786e0b21'), 'U11 no 786e0b21 reference');
  }
});

test('the page is registered in the router with its navigation entry', async () => {
  const app = await readSource('src/App.jsx');
  const workspaces = await readSource('src/lib/workspaces.js');
  const registry = await readSource('src/lib/routeRegistry.js');
  assert(app.includes("AgentApprovalReview from '@/pages/developer/AgentApprovalReview'"), 'U12 App.jsx import');
  assert(app.includes('path="/developer/agent-approvals"'), 'U12 App.jsx route');
  assert(workspaces.includes('"/developer/agent-approvals"'), 'U12 workspace nav');
  assert(registry.includes('{ path: "/developer/agent-approvals", component: "AgentApprovalReview"'), 'U12 route registry');
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
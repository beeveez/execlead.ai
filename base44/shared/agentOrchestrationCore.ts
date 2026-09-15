/**
 * Agent Orchestration Core™ — the SINGLE authoritative Workforce execution boundary.
 * ============================================================
 * Phase 5.1: extracted from agentOrchestrationService so that BOTH the direct
 * orchestration entry point AND the legacy aiWorkforce compatibility adapter
 * converge on this one implementation. There is no second governance path.
 *
 * Phase 5 live capability (unchanged):
 *   agent: exec_concierge  →  tool: read_own_readiness_assessment
 *   operation: READ  →  target: ENTITY:ReadinessAssessment
 *   scope: user_scoped / self_records  →  risk: low  →  approval: NOT_REQUIRED
 *
 * Phase 7.1 live capability (FIRST business capability):
 *   agent: growth_agent  →  tool: prospect_intelligence
 *   operation: INVOKE  →  target: INTERNAL_SERVICE:prospectIntelligence
 *   scope: user_scoped / self_records  →  risk: low  →  approval: NOT_REQUIRED
 *   (tool-level human_approval_required=false; deterministic, return-only,
 *   read-only, no LLM, no external action)
 *
 * Security model (identical for BOTH capabilities — one governance chain):
 * - The client request is NEVER trusted for agent identity, tool authorization,
 *   user identity, organization identity, scope, approval requirement, or risk.
 *   All authoritative values are resolved server-side from the authenticated
 *   caller → AgentRegistry → AgentToolRegistry.
 * - AgentRegistry/AgentToolRegistry status+enabled are checked at REQUEST TIME
 *   (operational kill switches). Authorization decisions are never cached.
 * - Global execution stop + risk threshold come from AgentOrchestrationConfig
 *   (fail-closed when the record is missing).
 * - AgentExecution records are created by the service role ONLY, before the
 *   tool runs, with a server-only provenance marker. Client-created execution
 *   records are never authoritative.
 * - Append-only execution model: retries create NEW records linked via
 *   parent_execution_id + correlation_id. Terminal records are never rewritten
 *   into another attempt.
 * - Idempotency: a server-issued RUNNING or recently-SUCCEEDED execution for
 *   the same user+agent+tool logical request is returned, not re-executed.
 *   For prospect_intelligence the logical request includes a hash of the
 *   validated input so different prospects never collapse into one replay.
 * - No LLM is invoked by either tool. No AI generation path exists here.
 */

import { validateProspectInput, buildProspectIntelligence } from './prospectIntelligence.ts';

export const PHASE5_AGENT_ID = 'exec_concierge';
export const PHASE5_TOOL_ID = 'read_own_readiness_assessment';
export const PHASE5_TARGET_TYPE = 'ENTITY';
export const PHASE5_TARGET_NAME = 'ReadinessAssessment';
export const PHASE5_OPERATION = 'READ';
export const PHASE7_AGENT_ID = 'growth_agent';
export const PHASE7_TOOL_ID = 'prospect_intelligence';
export const PHASE7_TARGET_TYPE = 'INTERNAL_SERVICE';
export const PHASE7_TARGET_NAME = 'prospectIntelligence';
export const PHASE7_OPERATION = 'INVOKE';
export const PROVENANCE_SOURCE = 'agent_orchestration_service';
export const CONFIG_ID = 'agent_orchestration_global';
export const RISK_LEVELS = { low: 0, medium: 1, high: 2, critical: 3 };
export const IDEMPOTENCY_TTL_MS = 60000; // replay window for the read-only capabilities
export const PLATFORM_ROLES = ['super_admin', 'platform_admin', 'founder_root_admin'];

export function provenanceMeta(issuedBy = 'agentOrchestrationService') {
  return {
    provenance: 'server_orchestration',
    issued_by: issuedBy,
    phase: 5,
  };
}

export function correlationIdFor(userId, agentId = PHASE5_AGENT_ID, toolId = PHASE5_TOOL_ID) {
  return `wf:${userId}:${agentId}:${toolId}`;
}

/**
 * Deterministic hash of a prospect request's allowed input fields. Used ONLY
 * to key idempotency per logical request — never for authorization.
 */
function prospectInputHash(input) {
  if (input === null || typeof input !== 'object' || Array.isArray(input)) return '';
  const parts = ['company_name', 'website', 'industry', 'location', 'context']
    .map((k) => (typeof input[k] === 'string' ? input[k] : ''));
  const s = parts.join('|');
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16);
}

/**
 * Record a BLOCKED execution attempt (audit stays truthful; nothing executes).
 * `opts` allows a caller entry point to document what was actually attempted
 * (claimed agent/tool, legacy path marker). Never grants anything.
 */
export async function recordBlocked(svc, user, errorCode, errorMessage, extraMeta = {}, opts = {}) {
  const now = new Date().toISOString();
  const execution = await svc.entities.AgentExecution.create({
    execution_id: crypto.randomUUID(),
    agent_id: opts.agentId || PHASE5_AGENT_ID,
    tool_id: opts.toolId || PHASE5_TOOL_ID,
    user_id: user.id,
    initiated_by: 'user',
    initiated_by_reference: user.id,
    status: 'BLOCKED',
    execution_scope: 'user_scoped',
    permission_scope: 'self_records',
    human_approval_required: false,
    approval_status: 'NOT_REQUIRED',
    requested_at: now,
    correlation_id: opts.correlationId || correlationIdFor(user.id),
    error_code: errorCode,
    error_message: errorMessage,
    source: PROVENANCE_SOURCE,
    metadata: { ...provenanceMeta(opts.issuedBy), ...extraMeta },
  });
  return execution;
}

export function blockedResponse(errorCode, message, execution) {
  return Response.json({
    status: 'BLOCKED',
    blocked: true,
    error_code: errorCode,
    message,
    execution_id: execution ? execution.execution_id : null,
  }, { status: 403 });
}

async function resolveCapabilityStatus(svc, agentId, toolId) {
  const agentRecords = await svc.entities.AgentRegistry.filter({ agent_id: agentId });
  const agent = agentRecords[0] || null;
  const toolRecords = await svc.entities.AgentToolRegistry.filter({ tool_id: toolId });
  const tool = toolRecords[0] || null;
  return {
    agent,
    tool,
    agentOk: Boolean(agent && agent.status === 'ACTIVE' && agent.enabled === true),
    toolOk: Boolean(tool && tool.status === 'ACTIVE' && tool.enabled === true),
  };
}

export async function getStatus(svc) {
  const cfgRecords = await svc.entities.AgentOrchestrationConfig.filter({ config_id: CONFIG_ID });
  const cfg = cfgRecords[0] || null;
  const globalStop = cfg ? cfg.stop_new_executions === true : true; // fail-closed when missing

  const read = await resolveCapabilityStatus(svc, PHASE5_AGENT_ID, PHASE5_TOOL_ID);
  const growth = await resolveCapabilityStatus(svc, PHASE7_AGENT_ID, PHASE7_TOOL_ID);

  return Response.json({
    orchestration_available: !globalStop && Boolean(read.agentOk) && Boolean(read.toolOk),
    global_stop: globalStop,
    max_risk_level: cfg ? cfg.max_risk_level : 'low',
    agent: read.agent ? { agent_id: read.agent.agent_id, status: read.agent.status, enabled: read.agent.enabled } : null,
    tool: read.tool ? { tool_id: read.tool.tool_id, status: read.tool.status, enabled: read.tool.enabled, risk_level: read.tool.risk_level } : null,
    executable_capability: `${PHASE5_AGENT_ID} → ${PHASE5_TOOL_ID}`,
    capabilities: [
      {
        agent_id: PHASE5_AGENT_ID,
        tool_id: PHASE5_TOOL_ID,
        operation: PHASE5_OPERATION,
        target: `${PHASE5_TARGET_TYPE}:${PHASE5_TARGET_NAME}`,
        orchestration_available: !globalStop && read.agentOk && read.toolOk,
      },
      {
        agent_id: PHASE7_AGENT_ID,
        tool_id: PHASE7_TOOL_ID,
        operation: PHASE7_OPERATION,
        target: `${PHASE7_TARGET_TYPE}:${PHASE7_TARGET_NAME}`,
        orchestration_available: !globalStop && growth.agentOk && growth.toolOk,
      },
    ],
  });
}

// ── Tool implementations (pure, deterministic, no LLM, no external action) ──

async function runReadinessReadTool(svc, user) {
  // Ownership is enforced by the server-resolved user identity. A client-supplied
  // user_id or organization_id is never used here. Cross-user, organization-wide
  // and platform-wide lookups are structurally impossible in this filter.
  const records = await svc.entities.ReadinessAssessment.filter(
    { user_id: user.id }, '-created_date', 1,
  );
  const latest = records[0] || null;

  // Minimal projection — only the data required by the orchestration request.
  const assessment = latest ? {
    assessment_id: latest.assessment_id,
    overall_score: latest.overall_score,
    classification: latest.classification,
    classification_label: latest.classification_label,
    confidence: latest.confidence,
    leadership_track: latest.leadership_track,
    target_executive_role: latest.target_executive_role,
    completed_at: latest.completed_at,
  } : null;

  return {
    ok: true,
    responseKey: 'assessment',
    response: { found: records.length > 0, assessment },
    result_summary: latest
      ? `Read own readiness assessment ${latest.assessment_id || ''}`.trim()
      : 'No readiness assessment on record for this user.',
    snapshot: assessment,
    meta: { records_found: records.length },
  };
}

async function runProspectIntelligenceTool(body) {
  // The tool's own strict input contract is part of the registered capability —
  // the same validation enforced by the deterministic v1 engine. Rejected input
  // is a truthful tool-level failure, not a governance bypass.
  const v = validateProspectInput(body.input);
  if (!v.ok) {
    return { ok: false, error_code: v.error_code, error: v.error };
  }
  const result = buildProspectIntelligence(v.input);
  return {
    ok: true,
    responseKey: 'result',
    response: { result },
    result_summary: `Generated deterministic prospect intelligence for "${v.input.company_name}" (confidence ${result.confidence.overall}/60 — no external verification performed).`,
    snapshot: result,
    meta: {
      company_name: v.input.company_name,
      confidence_overall: result.confidence.overall,
      evidence_count: result.evidence.length,
      external_verification: false,
    },
  };
}

/**
 * THE single governed execution chain. Both authorized capabilities route
 * through this one implementation — there is no second governance path.
 * The capability (agent + tool + target + operation) is selected SERVER-side
 * by the exported wrapper; the client can IDENTIFY a request but never
 * AUTHORIZE one.
 */
async function executeGovernedCapability(svc, user, body, issuedBy, cap) {
  const requestedAt = new Date().toISOString();
  const correlationId = cap.toolId === PHASE7_TOOL_ID
    ? `${correlationIdFor(user.id, cap.agentId, cap.toolId)}:${prospectInputHash(body && body.input)}`
    : correlationIdFor(user.id, cap.agentId, cap.toolId);
  const META = provenanceMeta(issuedBy);
  const blockOpts = { issuedBy, agentId: cap.agentId, toolId: cap.toolId, correlationId };

  // ── Client-supplied identity can IDENTIFY but never AUTHORIZE ──
  // A claimed agent/tool that differs from the server-resolved capability is
  // an impersonation/privilege attempt → BLOCKED.
  // client user_id / organization_id fields are never read at all.
  if (body.agent_id !== undefined && body.agent_id !== cap.agentId) {
    const execution = await recordBlocked(svc, user, 'AGENT_IDENTITY_MISMATCH',
      'Client-supplied agent_id does not match the server-resolved capability.',
      { claimed_agent_id: String(body.agent_id), requested_capability: `${cap.agentId} → ${cap.toolId}` }, blockOpts);
    return blockedResponse('AGENT_IDENTITY_MISMATCH',
      'Agent identity is resolved server-side; the requested agent is not executable.', execution);
  }
  if (body.tool_id !== undefined && body.tool_id !== cap.toolId) {
    const execution = await recordBlocked(svc, user, 'TOOL_IDENTITY_MISMATCH',
      'Client-supplied tool_id does not match the server-resolved capability.',
      { claimed_tool_id: String(body.tool_id), requested_capability: `${cap.agentId} → ${cap.toolId}` }, blockOpts);
    return blockedResponse('TOOL_IDENTITY_MISMATCH',
      'Tool authorization is resolved server-side; the requested tool is not executable.', execution);
  }

  // ── Global execution stop + risk threshold (fail-closed) ──
  const cfgRecords = await svc.entities.AgentOrchestrationConfig.filter({ config_id: CONFIG_ID });
  const cfg = cfgRecords[0] || null;
  if (!cfg) {
    const execution = await recordBlocked(svc, user, 'GLOBAL_EXECUTION_STOP',
      'Orchestration configuration missing — orchestrator fails closed.', {}, blockOpts);
    return blockedResponse('GLOBAL_EXECUTION_STOP',
      'Workforce execution is globally stopped.', execution);
  }
  if (cfg.stop_new_executions === true) {
    const execution = await recordBlocked(svc, user, 'GLOBAL_EXECUTION_STOP',
      'Global Workforce execution stop is active.', { global_stop: true }, blockOpts);
    return blockedResponse('GLOBAL_EXECUTION_STOP',
      'Workforce execution is globally stopped.', execution);
  }

  // ── Agent registry enforcement (request-time kill switch) ──
  const agentRecords = await svc.entities.AgentRegistry.filter({ agent_id: cap.agentId });
  const agent = agentRecords[0] || null;
  if (!agent || agent.status !== 'ACTIVE' || agent.enabled !== true) {
    const reason = !agent ? 'Agent not registered.' :
      agent.status !== 'ACTIVE' ? `Agent status is ${agent.status}.` : 'Agent is disabled.';
    const execution = await recordBlocked(svc, user, 'AGENT_NOT_EXECUTABLE', reason,
      { agent_status: agent ? agent.status : 'MISSING', agent_enabled: agent ? agent.enabled : null }, blockOpts);
    return blockedResponse('AGENT_NOT_EXECUTABLE', reason, execution);
  }

  // ── Tool registry enforcement (request-time kill switch) ──
  const toolRecords = await svc.entities.AgentToolRegistry.filter({ tool_id: cap.toolId });
  const tool = toolRecords[0] || null;
  if (!tool || tool.status !== 'ACTIVE' || tool.enabled !== true) {
    const reason = !tool ? 'Tool not registered.' :
      tool.status !== 'ACTIVE' ? `Tool status is ${tool.status}.` : 'Tool is disabled.';
    const execution = await recordBlocked(svc, user, 'TOOL_NOT_EXECUTABLE', reason,
      { tool_status: tool ? tool.status : 'MISSING', tool_enabled: tool ? tool.enabled : null }, blockOpts);
    return blockedResponse('TOOL_NOT_EXECUTABLE', reason, execution);
  }

  // ── Explicit agent allow-list (no wildcards ever) ──
  const allowed = Array.isArray(tool.allowed_agent_ids)
    && tool.allowed_agent_ids.includes(cap.agentId)
    && !tool.allowed_agent_ids.some((a) => typeof a === 'string' && a.includes('*'));
  if (!allowed) {
    const execution = await recordBlocked(svc, user, 'AGENT_NOT_AUTHORIZED_FOR_TOOL',
      'Agent is not explicitly listed on the tool allow-list.', {}, blockOpts);
    return blockedResponse('AGENT_NOT_AUTHORIZED_FOR_TOOL',
      'Agent is not authorized for this tool.', execution);
  }

  // ── Exact target + operation verification (no free-form selector) ──
  if (tool.target_type !== cap.targetType || tool.target_name !== cap.targetName
    || tool.operation !== cap.operation) {
    const execution = await recordBlocked(svc, user, 'TOOL_TARGET_MISMATCH',
      'Tool target/operation does not match the registered capability.', {}, blockOpts);
    return blockedResponse('TOOL_TARGET_MISMATCH',
      'Tool target/operation mismatch.', execution);
  }

  // ── Scope verification (agent AND tool must both be user_scoped/self_records) ──
  if (tool.execution_scope !== 'user_scoped' || tool.permission_scope !== 'self_records'
    || agent.execution_scope !== 'user_scoped' || agent.permission_scope !== 'self_records') {
    const execution = await recordBlocked(svc, user, 'SCOPE_MISMATCH',
      'Tool or agent scope is not user_scoped/self_records.', {}, blockOpts);
    return blockedResponse('SCOPE_MISMATCH', 'Scope mismatch.', execution);
  }

  // ── Risk threshold gate (via config; currently low only) ──
  const maxRisk = RISK_LEVELS[cfg.max_risk_level] !== undefined ? RISK_LEVELS[cfg.max_risk_level] : 0;
  const toolRisk = RISK_LEVELS[tool.risk_level] !== undefined ? RISK_LEVELS[tool.risk_level] : 99;
  if (toolRisk > maxRisk) {
    const execution = await recordBlocked(svc, user, 'RISK_LEVEL_EXCEEDED',
      `Tool risk '${tool.risk_level}' exceeds the permitted threshold '${cfg.max_risk_level}'.`,
      { tool_risk_level: tool.risk_level, max_risk_level: cfg.max_risk_level }, blockOpts);
    return blockedResponse('RISK_LEVEL_EXCEEDED',
      `Tool risk exceeds the permitted threshold (${cfg.max_risk_level}).`, execution);
  }

  // ── Generic approval gate (not required for either live tool; branch stays dormant) ──
  let approvalStatus = 'NOT_REQUIRED';
  if (tool.human_approval_required === true) {
    approvalStatus = 'PENDING';
    const approvalId = crypto.randomUUID();
    await svc.entities.AgentApproval.create({
      approval_id: approvalId,
      agent_id: cap.agentId,
      agent_version: agent.version || '1.0.0',
      tool_id: cap.toolId,
      tool_version: tool.version || '1.0.0',
      user_id: user.id,
      requested_by: 'user',
      request_reason: 'Server-issued approval request for a human-approval-required tool.',
      requested_action: `${cap.operation} ${cap.targetType}:${cap.targetName}`,
      requested_scope: 'self_records',
      risk_level: tool.risk_level || 'medium',
      human_approval_required: true,
      approval_type: tool.execution_scope === 'user_scoped' ? 'USER' : 'ORGANIZATION_ADMIN',
      required_approver_role: 'admin',
      status: 'PENDING',
      requested_at: requestedAt,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      correlation_id: correlationId,
      source: PROVENANCE_SOURCE,
      metadata: { ...META },
    });
    const execution = await svc.entities.AgentExecution.create({
      execution_id: crypto.randomUUID(),
      agent_id: cap.agentId,
      agent_version: agent.version || '1.0.0',
      tool_id: cap.toolId,
      tool_version: tool.version || '1.0.0',
      user_id: user.id,
      initiated_by: 'user',
      initiated_by_reference: user.id,
      status: 'QUEUED',
      execution_scope: 'user_scoped',
      permission_scope: 'self_records',
      human_approval_required: true,
      approval_status: 'PENDING',
      requested_at: requestedAt,
      correlation_id: correlationId,
      source: PROVENANCE_SOURCE,
      metadata: { ...META, approval_id: approvalId },
    });
    // NEVER execute before APPROVED. No hidden callback executes on approval.
    return Response.json({
      status: 'PENDING_APPROVAL',
      execution_id: execution.execution_id,
      approval_id: approvalId,
      message: 'Human approval is required before this tool can execute.',
    }, { status: 200 });
  }

  // ── Idempotency / replay protection (server-issued records only) ──
  const priorRecords = await svc.entities.AgentExecution.filter(
    { correlation_id: correlationId, user_id: user.id, source: PROVENANCE_SOURCE },
    '-created_date', 10,
  );
  const latestPrior = priorRecords[0] || null;
  if (latestPrior && latestPrior.status === 'RUNNING') {
    return Response.json({
      status: 'RUNNING',
      idempotent_replay: true,
      execution_id: latestPrior.execution_id,
      message: 'An equivalent execution is already active.',
    }, { status: 200 });
  }
  if (latestPrior && latestPrior.status === 'SUCCEEDED' && latestPrior.completed_at
    && (Date.now() - Date.parse(latestPrior.completed_at)) < IDEMPOTENCY_TTL_MS) {
    const snapshot = (latestPrior.metadata && latestPrior.metadata.result_snapshot) || null;
    const replayBody = {
      status: 'SUCCEEDED',
      idempotent_replay: true,
      execution_id: latestPrior.execution_id,
      message: 'An equivalent execution completed within the idempotency window.',
    };
    if (cap.toolId === PHASE7_TOOL_ID) replayBody.result = snapshot;
    else replayBody.assessment = snapshot;
    return Response.json(replayBody, { status: 200 });
  }

  // ── Authoritative execution record created BEFORE the tool runs ──
  const startedAt = new Date().toISOString();
  const execution = await svc.entities.AgentExecution.create({
    execution_id: crypto.randomUUID(),
    agent_id: cap.agentId,
    agent_version: agent.version || '1.0.0',
    tool_id: cap.toolId,
    tool_version: tool.version || '1.0.0',
    user_id: user.id,
    initiated_by: 'user',
    initiated_by_reference: user.id,
    status: 'RUNNING',
    execution_scope: 'user_scoped',
    permission_scope: 'self_records',
    human_approval_required: false,
    approval_status: approvalStatus,
    requested_at: requestedAt,
    started_at: startedAt,
    correlation_id: correlationId,
    parent_execution_id: latestPrior ? latestPrior.execution_id : null,
    source: PROVENANCE_SOURCE,
    metadata: { ...META, idempotency_ttl_ms: IDEMPOTENCY_TTL_MS },
  });

  // ── THE tool runs (pure, deterministic, return-only) ──
  try {
    const startedMs = Date.now();
    const outcome = cap.toolId === PHASE7_TOOL_ID
      ? await runProspectIntelligenceTool(body)
      : await runReadinessReadTool(svc, user);
    const latencyMs = Date.now() - startedMs;

    // Tool-level truthful failure (e.g. rejected prospect input) → FAILED record.
    if (!outcome.ok) {
      await svc.entities.AgentExecution.update(execution.id, {
        status: 'FAILED',
        completed_at: new Date().toISOString(),
        error_code: outcome.error_code,
        error_message: outcome.error,
      });
      return Response.json({
        status: 'FAILED',
        execution_id: execution.execution_id,
        error_code: outcome.error_code,
        error: outcome.error,
      }, { status: 422 });
    }

    const completedAt = new Date().toISOString();
    await svc.entities.AgentExecution.update(execution.id, {
      status: 'SUCCEEDED',
      completed_at: completedAt,
      result_summary: outcome.result_summary,
      metadata: {
        ...META,
        idempotency_ttl_ms: IDEMPOTENCY_TTL_MS,
        latency_ms: latencyMs,
        ...outcome.meta,
        result_snapshot: outcome.snapshot,
      },
    });

    return Response.json({
      status: 'SUCCEEDED',
      idempotent_replay: false,
      execution_id: execution.execution_id,
      agent_id: cap.agentId,
      tool_id: cap.toolId,
      ...outcome.response,
    }, { status: 200 });
  } catch (error) {
    // Tool failure → FAILED execution with error detail; never falsely report success.
    await svc.entities.AgentExecution.update(execution.id, {
      status: 'FAILED',
      completed_at: new Date().toISOString(),
      error_code: 'TOOL_EXECUTION_ERROR',
      error_message: String(error && error.message ? error.message : error),
    });
    return Response.json({
      status: 'FAILED',
      execution_id: execution.execution_id,
      error: String(error && error.message ? error.message : error),
    }, { status: 500 });
  }
}

/**
 * Phase 5 capability — unchanged semantics. Kept as the exact entry point the
 * legacy aiWorkforce compatibility adapter and the orchestration service use.
 */
export async function executeReadinessRead(svc, user, body, issuedBy = 'agentOrchestrationService') {
  return await executeGovernedCapability(svc, user, body, issuedBy, {
    agentId: PHASE5_AGENT_ID,
    toolId: PHASE5_TOOL_ID,
    targetType: PHASE5_TARGET_TYPE,
    targetName: PHASE5_TARGET_NAME,
    operation: PHASE5_OPERATION,
  });
}

/**
 * Phase 7.1 capability — the FIRST business Workforce capability.
 * growth_agent → prospect_intelligence → INTERNAL_SERVICE:prospectIntelligence
 */
export async function executeProspectIntelligence(svc, user, body, issuedBy = 'agentOrchestrationService') {
  return await executeGovernedCapability(svc, user, body, issuedBy, {
    agentId: PHASE7_AGENT_ID,
    toolId: PHASE7_TOOL_ID,
    targetType: PHASE7_TARGET_TYPE,
    targetName: PHASE7_TARGET_NAME,
    operation: PHASE7_OPERATION,
  });
}

export async function getExecution(svc, user, body) {
  const { execution_id } = body;
  if (!execution_id) return Response.json({ error: 'execution_id required' }, { status: 400 });
  const records = await svc.entities.AgentExecution.filter({ execution_id, user_id: user.id });
  const execution = records[0] || null;
  if (!execution) return Response.json({ error: 'Execution not found' }, { status: 404 });
  return Response.json({
    execution,
    authoritative: execution.source === PROVENANCE_SOURCE,
  }, { status: 200 });
}

/**
 * Server-enforced approval decisions. Records a decision on a server-issued
 * PENDING AgentApproval. NEVER executes a tool as a side effect — an APPROVED
 * record never auto-executes.
 * Enforced: immutability of decided records, expiration, self-approval
 * prohibition, approver role verification, organization boundary.
 */
export async function decideApproval(svc, user, body) {
  const { approval_id, decision, notes } = body;
  if (!approval_id) return Response.json({ error: 'approval_id required' }, { status: 400 });
  if (decision !== 'approve' && decision !== 'reject') {
    return Response.json({ error: "decision must be 'approve' or 'reject'" }, { status: 400 });
  }

  const records = await svc.entities.AgentApproval.filter({ approval_id });
  const approval = records[0] || null;
  if (!approval) return Response.json({ error: 'Approval not found' }, { status: 404 });

  // Immutable decision record — decided approvals can never be re-decided.
  if (approval.status !== 'PENDING') {
    return Response.json({
      error: `Approval is already ${approval.status} — decision records are immutable.`,
      status: approval.status,
    }, { status: 409 });
  }

  // Expired requests can never be approved.
  if (approval.expires_at && Date.parse(approval.expires_at) < Date.now()) {
    await svc.entities.AgentApproval.update(approval.id, {
      status: 'EXPIRED',
      decided_at: new Date().toISOString(),
    });
    return Response.json({ status: 'EXPIRED', message: 'Approval expired before decision.' }, { status: 409 });
  }

  // Self-approval prohibition — the requesting user can never approve their own request.
  if (approval.user_id === user.id) {
    return Response.json({
      error: 'Self-approval is prohibited — the requester cannot decide this approval.',
      error_code: 'SELF_APPROVAL_PROHIBITED',
    }, { status: 403 });
  }

  // Approver role verification.
  const requiredRole = approval.required_approver_role;
  const roleOk = PLATFORM_ROLES.includes(user.role) || user.role === requiredRole;
  if (!roleOk) {
    return Response.json({
      error: `Approver role '${requiredRole}' required.`,
      error_code: 'APPROVER_ROLE_REQUIRED',
    }, { status: 403 });
  }

  // Organization boundary (platform roles may cross; others must match exactly).
  if (approval.organization_id && !PLATFORM_ROLES.includes(user.role)
    && approval.organization_id !== (user.data && user.data.organization_id)) {
    return Response.json({ error: 'Organization boundary mismatch.' }, { status: 403 });
  }

  const now = new Date().toISOString();
  const decided = decision === 'approve' ? 'APPROVED' : 'REJECTED';
  await svc.entities.AgentApproval.update(approval.id, {
    status: decided,
    approver_user_id: user.id,
    approved_at: decision === 'approve' ? now : null,
    decided_at: now,
    decision_notes: notes || '',
    rejection_reason: decision === 'reject' ? (notes || 'Rejected by approver.') : null,
  });

  // NO execution callback — approval never auto-executes a tool.
  return Response.json({
    status: decided,
    approval_id,
    message: decided === 'APPROVED'
      ? 'Approval recorded. Execution requires a separate orchestration request.'
      : 'Approval rejected and recorded.',
  }, { status: 200 });
}
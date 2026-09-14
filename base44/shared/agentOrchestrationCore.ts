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
 * Security model:
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
 * - No LLM is invoked by this read-only tool. No AI generation path exists here.
 */

export const PHASE5_AGENT_ID = 'exec_concierge';
export const PHASE5_TOOL_ID = 'read_own_readiness_assessment';
export const PHASE5_TARGET_TYPE = 'ENTITY';
export const PHASE5_TARGET_NAME = 'ReadinessAssessment';
export const PHASE5_OPERATION = 'READ';
export const PROVENANCE_SOURCE = 'agent_orchestration_service';
export const CONFIG_ID = 'agent_orchestration_global';
export const RISK_LEVELS = { low: 0, medium: 1, high: 2, critical: 3 };
export const IDEMPOTENCY_TTL_MS = 60000; // replay window for the read-only capability
export const PLATFORM_ROLES = ['super_admin', 'platform_admin', 'founder_root_admin'];

export function provenanceMeta(issuedBy = 'agentOrchestrationService') {
  return {
    provenance: 'server_orchestration',
    issued_by: issuedBy,
    phase: 5,
  };
}

export function correlationIdFor(userId) {
  return `wf:${userId}:${PHASE5_AGENT_ID}:${PHASE5_TOOL_ID}`;
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

export async function getStatus(svc) {
  const cfgRecords = await svc.entities.AgentOrchestrationConfig.filter({ config_id: CONFIG_ID });
  const cfg = cfgRecords[0] || null;
  const agentRecords = await svc.entities.AgentRegistry.filter({ agent_id: PHASE5_AGENT_ID });
  const agent = agentRecords[0] || null;
  const toolRecords = await svc.entities.AgentToolRegistry.filter({ tool_id: PHASE5_TOOL_ID });
  const tool = toolRecords[0] || null;

  const globalStop = cfg ? cfg.stop_new_executions === true : true; // fail-closed when missing
  const agentOk = agent && agent.status === 'ACTIVE' && agent.enabled === true;
  const toolOk = tool && tool.status === 'ACTIVE' && tool.enabled === true;

  return Response.json({
    orchestration_available: !globalStop && Boolean(agentOk) && Boolean(toolOk),
    global_stop: globalStop,
    max_risk_level: cfg ? cfg.max_risk_level : 'low',
    agent: agent ? { agent_id: agent.agent_id, status: agent.status, enabled: agent.enabled } : null,
    tool: tool ? { tool_id: tool.tool_id, status: tool.status, enabled: tool.enabled, risk_level: tool.risk_level } : null,
    executable_capability: `${PHASE5_AGENT_ID} → ${PHASE5_TOOL_ID}`,
  });
}

export async function executeReadinessRead(svc, user, body, issuedBy = 'agentOrchestrationService') {
  const requestedAt = new Date().toISOString();
  const correlationId = correlationIdFor(user.id);
  const META = provenanceMeta(issuedBy);

  // ── Client-supplied identity can IDENTIFY but never AUTHORIZE ──
  // A claimed agent/tool that differs from the server-resolved Phase 5
  // capability is an impersonation/privilege attempt → BLOCKED.
  // client user_id / organization_id fields are never read at all.
  if (body.agent_id !== undefined && body.agent_id !== PHASE5_AGENT_ID) {
    const execution = await recordBlocked(svc, user, 'AGENT_IDENTITY_MISMATCH',
      'Client-supplied agent_id does not match the server-resolved Phase 5 capability.',
      { claimed_agent_id: String(body.agent_id) }, { issuedBy });
    return blockedResponse('AGENT_IDENTITY_MISMATCH',
      'Agent identity is resolved server-side; the requested agent is not executable.', execution);
  }
  if (body.tool_id !== undefined && body.tool_id !== PHASE5_TOOL_ID) {
    const execution = await recordBlocked(svc, user, 'TOOL_IDENTITY_MISMATCH',
      'Client-supplied tool_id does not match the server-resolved Phase 5 capability.',
      { claimed_tool_id: String(body.tool_id) }, { issuedBy });
    return blockedResponse('TOOL_IDENTITY_MISMATCH',
      'Tool authorization is resolved server-side; the requested tool is not executable.', execution);
  }

  // ── Global execution stop + risk threshold (fail-closed) ──
  const cfgRecords = await svc.entities.AgentOrchestrationConfig.filter({ config_id: CONFIG_ID });
  const cfg = cfgRecords[0] || null;
  if (!cfg) {
    const execution = await recordBlocked(svc, user, 'GLOBAL_EXECUTION_STOP',
      'Orchestration configuration missing — orchestrator fails closed.', {}, { issuedBy });
    return blockedResponse('GLOBAL_EXECUTION_STOP',
      'Workforce execution is globally stopped.', execution);
  }
  if (cfg.stop_new_executions === true) {
    const execution = await recordBlocked(svc, user, 'GLOBAL_EXECUTION_STOP',
      'Global Workforce execution stop is active.', { global_stop: true }, { issuedBy });
    return blockedResponse('GLOBAL_EXECUTION_STOP',
      'Workforce execution is globally stopped.', execution);
  }

  // ── Agent registry enforcement (request-time kill switch) ──
  const agentRecords = await svc.entities.AgentRegistry.filter({ agent_id: PHASE5_AGENT_ID });
  const agent = agentRecords[0] || null;
  if (!agent || agent.status !== 'ACTIVE' || agent.enabled !== true) {
    const reason = !agent ? 'Agent not registered.' :
      agent.status !== 'ACTIVE' ? `Agent status is ${agent.status}.` : 'Agent is disabled.';
    const execution = await recordBlocked(svc, user, 'AGENT_NOT_EXECUTABLE', reason,
      { agent_status: agent ? agent.status : 'MISSING', agent_enabled: agent ? agent.enabled : null },
      { issuedBy });
    return blockedResponse('AGENT_NOT_EXECUTABLE', reason, execution);
  }

  // ── Tool registry enforcement (request-time kill switch) ──
  const toolRecords = await svc.entities.AgentToolRegistry.filter({ tool_id: PHASE5_TOOL_ID });
  const tool = toolRecords[0] || null;
  if (!tool || tool.status !== 'ACTIVE' || tool.enabled !== true) {
    const reason = !tool ? 'Tool not registered.' :
      tool.status !== 'ACTIVE' ? `Tool status is ${tool.status}.` : 'Tool is disabled.';
    const execution = await recordBlocked(svc, user, 'TOOL_NOT_EXECUTABLE', reason,
      { tool_status: tool ? tool.status : 'MISSING', tool_enabled: tool ? tool.enabled : null },
      { issuedBy });
    return blockedResponse('TOOL_NOT_EXECUTABLE', reason, execution);
  }

  // ── Explicit agent allow-list (no wildcards ever) ──
  const allowed = Array.isArray(tool.allowed_agent_ids)
    && tool.allowed_agent_ids.includes(PHASE5_AGENT_ID)
    && !tool.allowed_agent_ids.some((a) => typeof a === 'string' && a.includes('*'));
  if (!allowed) {
    const execution = await recordBlocked(svc, user, 'AGENT_NOT_AUTHORIZED_FOR_TOOL',
      'Agent is not explicitly listed on the tool allow-list.', {}, { issuedBy });
    return blockedResponse('AGENT_NOT_AUTHORIZED_FOR_TOOL',
      'Agent is not authorized for this tool.', execution);
  }

  // ── Exact target + operation verification (no free-form selector) ──
  if (tool.target_type !== PHASE5_TARGET_TYPE || tool.target_name !== PHASE5_TARGET_NAME
    || tool.operation !== PHASE5_OPERATION) {
    const execution = await recordBlocked(svc, user, 'TOOL_TARGET_MISMATCH',
      'Tool target/operation does not match the Phase 5 registered capability.', {}, { issuedBy });
    return blockedResponse('TOOL_TARGET_MISMATCH',
      'Tool target/operation mismatch.', execution);
  }

  // ── Scope verification (agent AND tool must both be user_scoped/self_records) ──
  if (tool.execution_scope !== 'user_scoped' || tool.permission_scope !== 'self_records'
    || agent.execution_scope !== 'user_scoped' || agent.permission_scope !== 'self_records') {
    const execution = await recordBlocked(svc, user, 'SCOPE_MISMATCH',
      'Tool or agent scope is not user_scoped/self_records.', {}, { issuedBy });
    return blockedResponse('SCOPE_MISMATCH', 'Scope mismatch.', execution);
  }

  // ── Risk threshold gate (Phase 5 permits low only, via config) ──
  const maxRisk = RISK_LEVELS[cfg.max_risk_level] !== undefined ? RISK_LEVELS[cfg.max_risk_level] : 0;
  const toolRisk = RISK_LEVELS[tool.risk_level] !== undefined ? RISK_LEVELS[tool.risk_level] : 99;
  if (toolRisk > maxRisk) {
    const execution = await recordBlocked(svc, user, 'RISK_LEVEL_EXCEEDED',
      `Tool risk '${tool.risk_level}' exceeds the permitted threshold '${cfg.max_risk_level}'.`,
      { tool_risk_level: tool.risk_level, max_risk_level: cfg.max_risk_level }, { issuedBy });
    return blockedResponse('RISK_LEVEL_EXCEEDED',
      `Tool risk exceeds the permitted threshold (${cfg.max_risk_level}).`, execution);
  }

  // ── Generic approval gate (not required for this tool; branch stays dormant) ──
  let approvalStatus = 'NOT_REQUIRED';
  if (tool.human_approval_required === true) {
    approvalStatus = 'PENDING';
    const approvalId = crypto.randomUUID();
    await svc.entities.AgentApproval.create({
      approval_id: approvalId,
      agent_id: PHASE5_AGENT_ID,
      agent_version: agent.version || '1.0.0',
      tool_id: PHASE5_TOOL_ID,
      tool_version: tool.version || '1.0.0',
      user_id: user.id,
      requested_by: 'user',
      request_reason: 'Server-issued approval request for a human-approval-required tool.',
      requested_action: `${PHASE5_OPERATION} ${PHASE5_TARGET_TYPE}:${PHASE5_TARGET_NAME}`,
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
      agent_id: PHASE5_AGENT_ID,
      agent_version: agent.version || '1.0.0',
      tool_id: PHASE5_TOOL_ID,
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
    return Response.json({
      status: 'SUCCEEDED',
      idempotent_replay: true,
      execution_id: latestPrior.execution_id,
      assessment: (latestPrior.metadata && latestPrior.metadata.result_snapshot) || null,
      message: 'An equivalent execution completed within the idempotency window.',
    }, { status: 200 });
  }

  // ── Authoritative execution record created BEFORE the tool runs ──
  const startedAt = new Date().toISOString();
  const execution = await svc.entities.AgentExecution.create({
    execution_id: crypto.randomUUID(),
    agent_id: PHASE5_AGENT_ID,
    agent_version: agent.version || '1.0.0',
    tool_id: PHASE5_TOOL_ID,
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

  // ── THE tool: read the authenticated user's own latest ReadinessAssessment ──
  // Ownership is enforced by the server-resolved user identity. A client-supplied
  // user_id or organization_id is never used here. Cross-user, organization-wide
  // and platform-wide lookups are structurally impossible in this filter.
  try {
    const startedMs = Date.now();
    const records = await svc.entities.ReadinessAssessment.filter(
      { user_id: user.id }, '-created_date', 1,
    );
    const latest = records[0] || null;
    const latencyMs = Date.now() - startedMs;

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

    const completedAt = new Date().toISOString();
    await svc.entities.AgentExecution.update(execution.id, {
      status: 'SUCCEEDED',
      completed_at: completedAt,
      result_summary: latest
        ? `Read own readiness assessment ${latest.assessment_id || ''}`.trim()
        : 'No readiness assessment on record for this user.',
      metadata: {
        ...META,
        idempotency_ttl_ms: IDEMPOTENCY_TTL_MS,
        latency_ms: latencyMs,
        records_found: records.length,
        result_snapshot: assessment,
      },
    });

    return Response.json({
      status: 'SUCCEEDED',
      idempotent_replay: false,
      execution_id: execution.execution_id,
      agent_id: PHASE5_AGENT_ID,
      tool_id: PHASE5_TOOL_ID,
      found: records.length > 0,
      assessment,
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
 * record never auto-executes in Phase 5.
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

  // NO execution callback — approval never auto-executes a tool in Phase 5.
  return Response.json({
    status: decided,
    approval_id,
    message: decided === 'APPROVED'
      ? 'Approval recorded. Execution requires a separate orchestration request.'
      : 'Approval rejected and recorded.',
  }, { status: 200 });
}
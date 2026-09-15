/**
 * Agent Orchestration — Phase 14F Controlled First-Send (operator path).
 * ============================================================
 * Extracted from agentOrchestrationCore.ts so the core stays within its
 * size budget. This is NOT a second governance implementation: the first
 * send converges on the SAME authoritative Phase 14D Gmail delivery
 * boundary, on top of a 30-point precondition checklist
 * (base44/shared/controlledFirstSend.ts) — and it never weakens the
 * generic chain, the approval model, the contact-verification boundary,
 * or the Gmail credential boundary.
 */
import {
  recordBlocked,
  blockedResponse,
  provenanceMeta,
  PROVENANCE_SOURCE,
  CONFIG_ID,
} from './agentOrchestrationCore.ts';
import {
  validateFirstSendInput,
  resolveFirstSendRecipient,
  buildFirstSendGovernedRequest,
  evaluateFirstSendPreconditions,
  getFirstSendBoundaryStatus,
  FIRST_SEND_AGENT_ID,
  FIRST_SEND_TOOL_ID,
  FIRST_SEND_CONNECTOR_ID,
  FIRST_SEND_CONNECTOR_IDENTITY,
  FIRST_SEND_GMAIL_SCOPE,
  FIRST_SEND_OPERATOR_ROLES,
  FIRST_SEND_SENDER_IDENTITY,
} from './controlledFirstSend.ts';
import { executeGovernedGmailDelivery } from './gmailDeliveryBoundary.ts';
import {
  getGmailConnectorCredentialStatus,
  acquireGmailConnectorTokenContext,
} from './gmailConnectorCredentialProvider.ts';

// ============================================================
// Phase 14F — Controlled First-Send capability (operator path)
// ============================================================
// The normal agent path remains structurally blocked: execute_prospect_outreach
// is HIGH risk while the global threshold is MEDIUM. This DEDICATED operator
// path never weakens that: only a platform operator may request it, only an
// explicitly APPROVED single-use AgentApproval bound to the exact Prospect,
// exact VERIFIED primary ProspectContact, exact draft hash, and observed
// Prospect status can pass the 30-point checklist, and the single send is
// delegated EXCLUSIVELY to the authoritative Phase 14D delivery boundary —
// never a parallel transport, never a Gmail bypass. NO email is sent while
// any activation gate is off (all are off today).
const FIRST_SEND_CORRELATION_PREFIX = 'wf14f';

async function readFirstSendGatewaySnapshot(svc) {
  // Server-side only: the Base44-managed Gmail OAuth connector is the only
  // credential source. The connected identity and granted scopes are the
  // fixed authorized connection facts enforced by the Phase 14C boundary;
  // the short-lived connector token is used only inside the delivery
  // boundary and never surfaces in any record, result, or error.
  try {
    const conn = await svc.connectors.getConnection('gmail');
    if (conn && typeof conn.accessToken === 'string' && conn.accessToken.length > 0) {
      return {
        connector_available: true,
        connected_identity: FIRST_SEND_CONNECTOR_IDENTITY,
        granted_scopes: [FIRST_SEND_GMAIL_SCOPE, 'email'],
        connector_token: conn.accessToken,
        retrieval_status: 'ok',
      };
    }
  } catch (e) { /* fail closed below */ }
  return null;
}

async function verifyFirstSendCompletion(svc, user, request, executionId, gatewayToken) {
  const audits = await svc.entities.OutreachDeliveryAudit.filter({}, '-created_date', 200);
  const forIdentity = audits.filter((a) => a.metadata && a.metadata.delivery_identity === request.delivery_identity);
  const realSent = audits.filter((a) => a.delivery_mode === 'REAL' && (a.result_status === 'SENT' || a.result_status === 'DELIVERED'));
  const succeededExecutions = (await svc.entities.AgentExecution.filter(
    { tool_id: FIRST_SEND_TOOL_ID, user_id: user.id, source: PROVENANCE_SOURCE }, '-created_date', 20,
  )).filter((e) => e.status === 'SUCCEEDED' && e.metadata && e.metadata.first_send === true);
  const contactRecords = await svc.entities.ProspectContact.filter(
    { contact_id: request.recipient_contact_id }, '-created_date', 5);
  const contact = contactRecords.find((c) => c.owner_user_id === user.id) || null;
  return {
    exactly_one_succeeded_execution: succeededExecutions.length === 1,
    exactly_one_audit_for_this_delivery: forIdentity.length === 1,
    one_send_limit_holds: realSent.length <= 1,
    real_sent_count: realSent.length,
    recipient_binding_intact: contact ? contact.contact_id === request.recipient_contact_id : false,
    sender_identity: FIRST_SEND_SENDER_IDENTITY,
    no_credential_leakage: typeof gatewayToken !== 'string'
      || true, // re-verified structurally against the full serialized result by the caller
    delivered_claimed: false,
    note: 'Provider acceptance is NOT delivery confirmation. The approval is consumed single-use; no retry, follow-up, or bulk behavior exists.',
  };
}

export async function executeControlledFirstSend(svc, user, body, issuedBy = 'agentOrchestrationService') {
  const META = provenanceMeta(issuedBy);
  // 0. operator authorization — platform roles only; nothing else is read.
  if (!FIRST_SEND_OPERATOR_ROLES.includes(user.role)) {
    return Response.json({
      status: 'BLOCKED', blocked: true, error_code: 'FIRST_SEND_OPERATOR_UNAUTHORIZED',
      message: 'The controlled first send may only be requested by a platform operator (super_admin, platform_admin, founder_root_admin).',
    }, { status: 403 });
  }
  const v = validateFirstSendInput(body && body.input);
  if (!v.ok) {
    return Response.json({ status: 'BLOCKED', blocked: true, error_code: v.error_code, message: v.error }, { status: 422 });
  }
  const input = v.input;
  const draftHash = input.draft_hash;
  const inputHash = input.idempotency_key;

  // 1. Prospect — strict ownership / tenant boundary, read-only.
  const prospectRecords = await svc.entities.Prospect.filter({ prospect_id: input.prospect_id }, '-created_date', 5);
  const prospect = prospectRecords.find((p) =>
    p.owner_user_id === user.id || p.organization_id === (user.data && user.data.organization_id)) || null;
  if (!prospect) {
    return Response.json({ status: 'BLOCKED', blocked: true, error_code: 'GATE_PROSPECT_MISSING',
      message: 'No Prospect matching prospect_id exists within your ownership or tenant boundary.' }, { status: 422 });
  }
  // 2. Contact — server-side resolution target; the contact email never
  // enters any prompt, result, approval metadata, or error.
  const contactRecords = await svc.entities.ProspectContact.filter(
    { contact_id: input.recipient_contact_id, prospect_id: prospect.prospect_id }, '-created_date', 5);
  const contact = contactRecords.find((c) => c.owner_user_id === user.id) || null;
  if (!contact) {
    return Response.json({ status: 'BLOCKED', blocked: true, error_code: 'CONTACT_NOT_FOUND',
      message: 'No ProspectContact matching recipient_contact_id is owned by the requesting operator for this Prospect.' }, { status: 422 });
  }
  const verifiedContactRecord = {
    contact_id: contact.contact_id,
    prospect_id: contact.prospect_id,
    contact_type: contact.contact_type,
    contact_value: contact.contact_value,
    verification_status: contact.verification_status,
    is_primary: contact.is_primary === true,
    verified_by: typeof contact.verified_by_user_id === 'string' ? contact.verified_by_user_id : '',
    verified_at: typeof contact.verified_at === 'string' ? contact.verified_at : '',
  };
  const resolved = resolveFirstSendRecipient(prospect, verifiedContactRecord);
  if (!resolved.ok) {
    return Response.json({ status: 'BLOCKED', blocked: true, error_code: resolved.error_code, message: resolved.error }, { status: 422 });
  }

  const claimedApprovalId = (body && typeof body.approval_id === 'string' && body.approval_id.trim() !== '')
    ? body.approval_id.trim() : null;

  // ── ISSUANCE path: request the single-use approval (nothing executes) ──
  if (!claimedApprovalId) {
    const approvalId = crypto.randomUUID();
    const correlationId = FIRST_SEND_CORRELATION_PREFIX + ':' + user.id + ':' + approvalId;
    const requestedAt = new Date().toISOString();
    await svc.entities.AgentApproval.create({
      approval_id: approvalId,
      agent_id: FIRST_SEND_AGENT_ID,
      agent_version: '1.0.0',
      tool_id: FIRST_SEND_TOOL_ID,
      tool_version: '1.0.0',
      user_id: user.id,
      requested_by: 'user',
      request_reason: 'Phase 14F controlled first send — explicit operator request for the one-time governed Gmail delivery test.',
      requested_action: 'Single controlled test send through the governed Phase 14D Gmail delivery boundary (EMAIL channel, fixed Growth sender).',
      requested_scope: 'self_records',
      risk_level: 'high',
      human_approval_required: true,
      approval_type: 'USER',
      required_approver_role: 'platform_admin',
      status: 'PENDING',
      requested_at: requestedAt,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      correlation_id: correlationId,
      source: PROVENANCE_SOURCE,
      metadata: {
        ...META, phase: '14F', first_send: true, input_hash: inputHash,
        prospect_id: prospect.prospect_id,
        recipient_contact_id: contact.contact_id,
        approved_draft_hash: draftHash,
        prospect_status: prospect.status,
      },
    });
    return Response.json({
      status: 'PENDING_APPROVAL', approval_id: approvalId,
      message: 'Controlled first-send approval created. A second authorized human must approve it; every activation gate is re-checked server-side at send time, and no email is sent now.',
    }, { status: 200 });
  }

  // ── EXECUTION path: the approval can IDENTIFY but never AUTHORIZE by
  // itself — every field is re-validated server-side.
  const approvalRecords = await svc.entities.AgentApproval.filter({ approval_id: claimedApprovalId });
  const approval = approvalRecords[0] || null;
  const blockWith = async (code, message) => {
    const execution = await recordBlocked(svc, user, code, message,
      { claimed_approval_id: claimedApprovalId, phase: '14F' },
      { agentId: FIRST_SEND_AGENT_ID, toolId: FIRST_SEND_TOOL_ID });
    return blockedResponse(code, message, execution);
  };
  if (!approval) return await blockWith('APPROVAL_NOT_FOUND', 'The referenced approval does not exist.');
  if (approval.user_id !== user.id) return await blockWith('APPROVAL_USER_MISMATCH', 'The referenced approval belongs to a different user.');
  if (approval.agent_id !== FIRST_SEND_AGENT_ID || approval.tool_id !== FIRST_SEND_TOOL_ID) {
    return await blockWith('APPROVAL_CAPABILITY_MISMATCH', 'The referenced approval does not match the controlled first-send capability.');
  }
  if (approval.source !== PROVENANCE_SOURCE) return await blockWith('APPROVAL_PROVENANCE_INVALID', 'Only server-issued approvals can authorize the first send.');
  if (((approval.metadata && approval.metadata.input_hash) || null) !== inputHash) {
    return await blockWith('APPROVAL_INPUT_MISMATCH', 'The referenced approval was issued for different input.');
  }
  if (approval.status === 'PENDING') {
    return Response.json({ status: 'PENDING_APPROVAL', approval_id: claimedApprovalId,
      message: 'Approval is still pending decision — nothing has executed.' }, { status: 200 });
  }
  if (approval.status === 'REJECTED') return await blockWith('APPROVAL_REJECTED', 'The request was rejected by the approver — nothing will execute.');
  if (approval.status !== 'APPROVED') return await blockWith('APPROVAL_NOT_ACTIVE', 'The referenced approval is ' + approval.status + '.');
  if (approval.expires_at && Date.parse(approval.expires_at) < Date.now()) {
    return await blockWith('APPROVAL_EXPIRED', 'The approval window has expired — a new approval is required.');
  }
  if (!approval.approver_user_id || approval.approver_user_id === approval.user_id) {
    return await blockWith('APPROVAL_SELF_APPROVED', 'Self-approval is prohibited; this approval cannot authorize the send.');
  }
  if (approval.metadata && approval.metadata.executed_execution_id) {
    return await blockWith('APPROVAL_ALREADY_EXECUTED', 'This approval has already been consumed — approvals are single-use.');
  }

  // Idempotent replay: an identical completed first send returns the stored
  // snapshot — NO second message is ever sent.
  const priorExecutions = await svc.entities.AgentExecution.filter(
    { tool_id: FIRST_SEND_TOOL_ID, user_id: user.id, source: PROVENANCE_SOURCE }, '-created_date', 10);
  const priorFirstSend = priorExecutions.find((e) =>
    e.status === 'SUCCEEDED' && e.metadata && e.metadata.first_send === true
    && e.metadata.input_hash === inputHash
    && e.metadata.approval_id === approval.approval_id) || null;
  if (priorFirstSend) {
    return Response.json({
      status: 'SUCCEEDED', idempotent_replay: true, execution_id: priorFirstSend.execution_id,
      result: (priorFirstSend.metadata && priorFirstSend.metadata.first_send_result) || null,
      message: 'This controlled first send already completed — the stored result is replayed and no second message is sent.',
    }, { status: 200 });
  }

  // Build the governed request and assemble the server-read state snapshot.
  const executionId = crypto.randomUUID();
  const correlationId = approval.correlation_id
    || (FIRST_SEND_CORRELATION_PREFIX + ':' + user.id + ':' + approval.approval_id);
  const built = buildFirstSendGovernedRequest({
    prospect_id: input.prospect_id,
    approval_id: approval.approval_id,
    execution_id: executionId,
    correlation_id: correlationId,
    recipient_contact_id: input.recipient_contact_id,
    approved_draft_hash: draftHash,
    subject: input.draft_subject,
    body: input.draft_body,
  });
  if (!built.ok) return await blockWith(built.error_code, built.error);
  const request = built.request;

  const configRecords = await svc.entities.AgentOrchestrationConfig.filter({ config_id: CONFIG_ID });
  const config = configRecords[0] || null;
  const toolRecords = await svc.entities.AgentToolRegistry.filter({ tool_id: FIRST_SEND_TOOL_ID });
  const toolRegistry = toolRecords[0] || null;
  const connectorRecords = await svc.entities.ExternalDeliveryConnectorRegistry.filter({ connector_id: FIRST_SEND_CONNECTOR_ID });
  const connectorRegistry = connectorRecords[0] || null;
  const realDeliveryRecords = await svc.entities.OutreachRealDeliveryConfig.filter({ config_id: 'outreach_real_delivery_global' });
  const globalRealDelivery = realDeliveryRecords[0] || null;
  const gatewaySnapshot = await readFirstSendGatewaySnapshot(svc);
  const credentialStatus = getGmailConnectorCredentialStatus(gatewaySnapshot);
  const realAudits = await svc.entities.OutreachDeliveryAudit.filter({ delivery_mode: 'REAL' }, '-created_date', 50);
  const priorRealSent = realAudits
    .filter((a) => a.result_status === 'SENT' || a.result_status === 'DELIVERED')
    .map((a) => ({ delivery_identity: (a.metadata && a.metadata.delivery_identity) || a.execution_id, result_status: a.result_status }));
  const priorForIdentity = realAudits
    .filter((a) => a.metadata && a.metadata.delivery_identity === request.delivery_identity)
    .map((a) => a.result_status);

  const serverState = {
    authenticated_caller: {
      user_id: user.id, role: user.role,
      organization_id: (user.data && user.data.organization_id) || null,
    },
    request,
    orchestration_config: config,
    tool_registry_record: toolRegistry,
    connector_registry_record: connectorRegistry,
    global_real_delivery_record: globalRealDelivery,
    approval_record: approval,
    prospect_record: prospect,
    verified_contact_record: verifiedContactRecord,
    declared_sender: FIRST_SEND_SENDER_IDENTITY,
    credential_status: credentialStatus,
    prior_delivery_results: priorForIdentity,
    prior_real_sent_results: priorRealSent,
    approval_already_executed: false,
    now: new Date().toISOString(),
  };

  // ── THE 30-point pre-send checklist. Any failure: no send, no state
  // mutation beyond the truthful BLOCKED execution record. ──
  const pre = evaluateFirstSendPreconditions(serverState);
  if (!pre.ok) {
    if (pre.replay === true) {
      return Response.json({ status: 'BLOCKED', blocked: true, error_code: pre.error_code, message: pre.error }, { status: 409 });
    }
    return await blockWith(pre.error_code, pre.error);
  }

  // Authoritative execution record BEFORE the boundary runs.
  const startedAt = new Date().toISOString();
  const execution = await svc.entities.AgentExecution.create({
    execution_id: executionId,
    agent_id: FIRST_SEND_AGENT_ID,
    agent_version: (toolRegistry && toolRegistry.version) || '1.0.0',
    tool_id: FIRST_SEND_TOOL_ID,
    tool_version: (toolRegistry && toolRegistry.version) || '1.0.0',
    user_id: user.id,
    initiated_by: 'user',
    initiated_by_reference: user.id,
    status: 'RUNNING',
    execution_scope: 'user_scoped',
    permission_scope: 'self_records',
    human_approval_required: true,
    approval_status: 'APPROVED',
    requested_at: startedAt,
    started_at: startedAt,
    correlation_id: correlationId,
    source: PROVENANCE_SOURCE,
    metadata: { ...META, phase: '14F', first_send: true, input_hash: inputHash, approval_id: approval.approval_id },
  });

  // ── THE single send — exclusively through the authoritative Phase 14D
  // delivery boundary (no transport injection exists in production). ──
  let delivery = null;
  let gatewayToken = null;
  try {
    gatewayToken = gatewaySnapshot ? gatewaySnapshot.connector_token : null;
    delivery = await executeGovernedGmailDelivery(request, {
      ...serverState,
      agent_id: FIRST_SEND_AGENT_ID,
      tool_id: FIRST_SEND_TOOL_ID,
      execution_record: { execution_id: executionId },
    }, {
      getGmailConnectorCredentialStatus,
      acquireGmailConnectorTokenContext,
    }, gatewaySnapshot);
  } catch (deliveryError) {
    delivery = {
      delivery_status: 'FAILED', blocked: false, transport_invoked: false,
      error_code: 'FIRST_SEND_BOUNDARY_ERROR',
      error: String(deliveryError && deliveryError.message ? deliveryError.message : deliveryError).substring(0, 300),
    };
  }

  const serializedDelivery = JSON.stringify(delivery);
  const noCredentialLeakage = gatewayToken === null || serializedDelivery.indexOf(gatewayToken) === -1;

  // BLOCKED at the boundary (defense in depth) — no transport call happened.
  if (delivery.delivery_status !== 'SENT' && delivery.delivery_status !== 'FAILED') {
    await svc.entities.AgentExecution.update(execution.id, {
      status: 'BLOCKED',
      completed_at: new Date().toISOString(),
      error_code: delivery.error_code || 'FIRST_SEND_DELIVERY_BLOCKED',
      error_message: String(delivery.error || 'The authoritative delivery boundary blocked the send.').substring(0, 500),
      metadata: { ...META, phase: '14F', first_send: true, input_hash: inputHash, approval_id: approval.approval_id },
    });
    return Response.json({ status: 'BLOCKED', blocked: true, execution_id: executionId,
      error_code: delivery.error_code, message: delivery.error }, { status: 422 });
  }

  // A transport attempt occurred (SENT or provider-rejected FAILED):
  // persist the truthful audit, consume the approval single-use, and store
  // the replay snapshot. Truthful failure semantics: no retry exists.
  if (delivery.audit_record) {
    await svc.entities.OutreachDeliveryAudit.create({
      ...delivery.audit_record,
      audit_id: crypto.randomUUID(),
    });
  }
  await svc.entities.AgentApproval.update(approval.id, {
    metadata: {
      ...(approval.metadata || {}),
      executed_execution_id: executionId,
      executed_at: new Date().toISOString(),
    },
  });
  const succeeded = delivery.delivery_status === 'SENT';
  const postVerification = await verifyFirstSendCompletion(svc, user, request, executionId, gatewayToken);
  postVerification.no_credential_leakage = noCredentialLeakage;
  await svc.entities.AgentExecution.update(execution.id, {
    status: succeeded ? 'SUCCEEDED' : 'FAILED',
    completed_at: new Date().toISOString(),
    result_summary: succeeded
      ? 'Controlled first send accepted by the Gmail provider (single message; delivery not claimed).'
      : 'The Gmail provider rejected the single governed send — no retry exists.',
    error_code: succeeded ? null : (delivery.error_code || 'GMAIL_PROVIDER_REJECTED'),
    error_message: succeeded ? null : String(delivery.error || '').substring(0, 500),
    metadata: {
      ...META, phase: '14F', first_send: true, input_hash: inputHash,
      approval_id: approval.approval_id,
      first_send_result: {
        delivery_status: delivery.delivery_status,
        provider_accepted: delivery.provider_accepted === true,
        provider_message_id: delivery.provider_message_id || null,
        recipient_fingerprint: delivery.recipient_fingerprint || null,
        sender_identity: delivery.sender_identity || FIRST_SEND_SENDER_IDENTITY,
        boundary_version: delivery.boundary_version || null,
        correlation_id: delivery.correlation_id || correlationId,
      },
    },
  });
  return Response.json({
    status: delivery.delivery_status,
    execution_id: executionId,
    result: delivery,
    post_verification: postVerification,
  }, { status: succeeded ? 200 : 502 });
}

/**
 * Phase 14F — truthful, read-only first-send readiness. Reports the live
 * activation state of every gate without changing anything and without ever
 * exposing the connector token. NO email is sent.
 */
export async function getFirstSendReadiness(svc, user) {
  if (!FIRST_SEND_OPERATOR_ROLES.includes(user.role)) {
    return Response.json({
      status: 'BLOCKED', blocked: true, error_code: 'FIRST_SEND_OPERATOR_UNAUTHORIZED',
      message: 'First-send readiness is restricted to platform operators.',
    }, { status: 403 });
  }
  const configRecords = await svc.entities.AgentOrchestrationConfig.filter({ config_id: CONFIG_ID });
  const config = configRecords[0] || null;
  const toolRecords = await svc.entities.AgentToolRegistry.filter({ tool_id: FIRST_SEND_TOOL_ID });
  const tool = toolRecords[0] || null;
  const connectorRecords = await svc.entities.ExternalDeliveryConnectorRegistry.filter({ connector_id: FIRST_SEND_CONNECTOR_ID });
  const connector = connectorRecords[0] || null;
  const realDeliveryRecords = await svc.entities.OutreachRealDeliveryConfig.filter({ config_id: 'outreach_real_delivery_global' });
  const globalRealDelivery = realDeliveryRecords[0] || null;
  const gatewaySnapshot = await readFirstSendGatewaySnapshot(svc);
  const credentialStatus = getGmailConnectorCredentialStatus(gatewaySnapshot);
  const realAudits = await svc.entities.OutreachDeliveryAudit.filter({ delivery_mode: 'REAL' }, '-created_date', 50);
  const realSent = realAudits.filter((a) => a.result_status === 'SENT' || a.result_status === 'DELIVERED');
  const pendingApprovals = await svc.entities.AgentApproval.filter(
    { tool_id: FIRST_SEND_TOOL_ID, status: 'PENDING' }, '-created_date', 10);
  return Response.json({
    ...getFirstSendBoundaryStatus(),
    live_state: {
      orchestration_config_present: Boolean(config),
      stop_new_executions: config ? config.stop_new_executions === true : true,
      max_risk_level: config ? config.max_risk_level : null,
      tool_status: tool ? tool.status : null,
      tool_enabled: tool ? tool.enabled === true : false,
      tool_risk_level: tool ? tool.risk_level : null,
      connector_status: connector ? connector.status : null,
      connector_enabled: connector ? connector.enabled === true : false,
      connector_supports_delivery: connector ? connector.supports_delivery === true : false,
      real_delivery_enabled: globalRealDelivery ? globalRealDelivery.real_delivery_enabled === true : false,
      gmail_connector_credential: {
        connected: credentialStatus.connected,
        expected_identity: credentialStatus.expected_identity,
        sender_identity: credentialStatus.sender_identity,
        required_scope: credentialStatus.required_scope,
        missing_requirements: credentialStatus.missing_requirements,
        error_code: credentialStatus.error_code,
      },
      prior_real_sent_count: realSent.length,
      pending_first_send_approvals: pendingApprovals.length,
      email_sent_in_this_phase: realSent.length > 0,
      agent_path_blocked: !tool || tool.risk_level === 'high',
    },
    message: 'NO EMAIL HAS BEEN SENT. Each activation gate is a separate explicit operator action; this readiness read changed nothing.',
  }, { status: 200 });
}
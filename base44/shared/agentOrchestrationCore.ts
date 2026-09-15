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
import {
  validateProspectCreateInput,
  buildProspectRecord,
  prospectCreateInputHash,
  PROSPECT_CREATE_SOURCE_DIRECT,
  PROSPECT_CREATE_SOURCE_INTELLIGENCE,
} from './prospectCreate.ts';
import {
  validateProspectReadInput,
  projectProspect,
  PROSPECT_READ_MAX_RESULTS,
} from './prospectRead.ts';
import {
  validateQualifyInput,
  buildQualification,
  buildQualificationNotFound,
  qualifyInputHash,
  PROSPECT_QUALIFY_SCORE_CAP,
} from './prospectQualification.ts';
import {
  validateOutreachInput,
  buildOutreachPreparation,
  buildOutreachNotFound,
  outreachInputHash,
  OUTREACH_CONFIDENCE_CAP,
} from './prospectOutreachPreparation.ts';
import {
  validateOutreachExecutionInput,
  validateExecutionApprovalBinding,
  validateOutreachStatusEligibility,
  OUTREACH_EXECUTION_DRY_RUN_STATUS,
  OUTREACH_EXECUTION_VERIFY_NOTICE,
  outreachExecutionInputHash,
} from './prospectOutreachExecution.ts';
import {
  buildSandboxDestination,
  createGovernedDeliveryRequest,
  deriveDeliveryIdentity,
  sandboxDeliver,
  buildDeliveryAuditRecord,
  getRealDeliveryReadiness,
} from './sandboxDeliveryConnector.ts';
import {
  validateTransitionInput,
  validateTransitionAgainstMatrix,
  prospectTransitionInputHash,
} from './prospectStatusTransition.ts';
import {
  validateCreateContactInput,
  buildContactRecord,
  validateReadContactsInput,
  validateVerifyContactInput,
  buildContactVerificationUpdate,
  buildContactCreatedOutcome,
  buildContactsReadOutcome,
  buildContactVerifiedOutcome,
  assertContactOwnership,
  prospectContactCreateInputHash,
  prospectContactVerifyInputHash,
  PROSPECT_CONTACT_MAX_RESULTS,
} from './prospectContact.ts';
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
export const PHASE8_AGENT_ID = 'growth_agent';
export const PHASE8_TOOL_ID = 'create_own_prospect';
export const PHASE8_TARGET_TYPE = 'ENTITY';
export const PHASE8_TARGET_NAME = 'Prospect';
export const PHASE8_OPERATION = 'CREATE';
export const PHASE82_TOOL_ID = 'read_own_prospects';
export const PHASE82_TARGET_TYPE = 'ENTITY';
export const PHASE82_TARGET_NAME = 'Prospect';
export const PHASE82_OPERATION = 'READ';
export const PHASE83_TOOL_ID = 'qualify_own_prospect';
export const PHASE83_TARGET_TYPE = 'INTERNAL_SERVICE';
export const PHASE83_TARGET_NAME = 'prospectQualification';
export const PHASE83_OPERATION = 'INVOKE';
export const PHASE9_TOOL_ID = 'update_own_prospect_status';
export const PHASE9_TARGET_TYPE = 'ENTITY';
export const PHASE9_TARGET_NAME = 'Prospect';
export const PHASE9_OPERATION = 'UPDATE';
export const PHASE10_TOOL_ID = 'prepare_prospect_outreach';
export const PHASE10_TARGET_TYPE = 'INTERNAL_SERVICE';
export const PHASE10_TARGET_NAME = 'prospectOutreachPreparation';
export const PHASE10_OPERATION = 'INVOKE';
export const PHASE11_TOOL_ID = 'execute_prospect_outreach';
export const PHASE11_TARGET_TYPE = 'INTERNAL_SERVICE';
export const PHASE11_TARGET_NAME = 'prospectOutreachExecution';
export const PHASE11_OPERATION = 'INVOKE';
export const PHASE14E_CREATE_TOOL_ID = 'create_own_prospect_contact';
export const PHASE14E_READ_TOOL_ID = 'read_own_prospect_contacts';
export const PHASE14E_VERIFY_TOOL_ID = 'verify_own_prospect_contact';
export const PHASE14E_TARGET_TYPE = 'ENTITY';
export const PHASE14E_TARGET_NAME = 'ProspectContact';
export const PHASE14E_CREATE_OPERATION = 'CREATE';
export const PHASE14E_READ_OPERATION = 'READ';
export const PHASE14E_VERIFY_OPERATION = 'UPDATE';
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
  const growthCreate = await resolveCapabilityStatus(svc, PHASE8_AGENT_ID, PHASE8_TOOL_ID);
  const growthRead = await resolveCapabilityStatus(svc, PHASE7_AGENT_ID, PHASE82_TOOL_ID);
  const growthQualify = await resolveCapabilityStatus(svc, PHASE7_AGENT_ID, PHASE83_TOOL_ID);
  const growthUpdate = await resolveCapabilityStatus(svc, PHASE7_AGENT_ID, PHASE9_TOOL_ID);
  const growthOutreach = await resolveCapabilityStatus(svc, PHASE7_AGENT_ID, PHASE10_TOOL_ID);
  const growthOutreachExec = await resolveCapabilityStatus(svc, PHASE7_AGENT_ID, PHASE11_TOOL_ID);
  const contactCreate = await resolveCapabilityStatus(svc, PHASE7_AGENT_ID, PHASE14E_CREATE_TOOL_ID);
  const contactRead = await resolveCapabilityStatus(svc, PHASE7_AGENT_ID, PHASE14E_READ_TOOL_ID);
  const contactVerify = await resolveCapabilityStatus(svc, PHASE7_AGENT_ID, PHASE14E_VERIFY_TOOL_ID);

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
      {
        agent_id: PHASE8_AGENT_ID,
        tool_id: PHASE8_TOOL_ID,
        operation: PHASE8_OPERATION,
        target: `${PHASE8_TARGET_TYPE}:${PHASE8_TARGET_NAME}`,
        human_approval_required: true,
        orchestration_available: !globalStop && growthCreate.agentOk && growthCreate.toolOk,
      },
      {
        agent_id: PHASE7_AGENT_ID,
        tool_id: PHASE82_TOOL_ID,
        operation: PHASE82_OPERATION,
        target: `${PHASE82_TARGET_TYPE}:${PHASE82_TARGET_NAME}`,
        human_approval_required: false,
        orchestration_available: !globalStop && growthRead.agentOk && growthRead.toolOk,
      },
      {
        agent_id: PHASE7_AGENT_ID,
        tool_id: PHASE83_TOOL_ID,
        operation: PHASE83_OPERATION,
        target: `${PHASE83_TARGET_TYPE}:${PHASE83_TARGET_NAME}`,
        human_approval_required: false,
        orchestration_available: !globalStop && growthQualify.agentOk && growthQualify.toolOk,
      },
      {
        agent_id: PHASE7_AGENT_ID,
        tool_id: PHASE9_TOOL_ID,
        operation: PHASE9_OPERATION,
        target: `${PHASE9_TARGET_TYPE}:${PHASE9_TARGET_NAME}`,
        human_approval_required: true,
        orchestration_available: !globalStop && growthUpdate.agentOk && growthUpdate.toolOk,
      },
      {
        agent_id: PHASE7_AGENT_ID,
        tool_id: PHASE10_TOOL_ID,
        operation: PHASE10_OPERATION,
        target: `${PHASE10_TARGET_TYPE}:${PHASE10_TARGET_NAME}`,
        human_approval_required: false,
        orchestration_available: !globalStop && growthOutreach.agentOk && growthOutreach.toolOk,
      },
      {
        agent_id: PHASE7_AGENT_ID,
        tool_id: PHASE11_TOOL_ID,
        operation: PHASE11_OPERATION,
        target: `${PHASE11_TARGET_TYPE}:${PHASE11_TARGET_NAME}`,
        human_approval_required: true,
        orchestration_available: !globalStop && growthOutreachExec.agentOk && growthOutreachExec.toolOk,
      },
      {
        agent_id: PHASE7_AGENT_ID,
        tool_id: PHASE14E_CREATE_TOOL_ID,
        operation: PHASE14E_CREATE_OPERATION,
        target: `${PHASE14E_TARGET_TYPE}:${PHASE14E_TARGET_NAME}`,
        human_approval_required: false,
        orchestration_available: !globalStop && contactCreate.agentOk && contactCreate.toolOk,
      },
      {
        agent_id: PHASE7_AGENT_ID,
        tool_id: PHASE14E_READ_TOOL_ID,
        operation: PHASE14E_READ_OPERATION,
        target: `${PHASE14E_TARGET_TYPE}:${PHASE14E_TARGET_NAME}`,
        human_approval_required: false,
        orchestration_available: !globalStop && contactRead.agentOk && contactRead.toolOk,
      },
      {
        agent_id: PHASE7_AGENT_ID,
        tool_id: PHASE14E_VERIFY_TOOL_ID,
        operation: PHASE14E_VERIFY_OPERATION,
        target: `${PHASE14E_TARGET_TYPE}:${PHASE14E_TARGET_NAME}`,
        human_approval_required: true,
        orchestration_available: !globalStop && contactVerify.agentOk && contactVerify.toolOk,
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
 * Phase 8 tool — create_own_prospect (ENTITY:Prospect, CREATE).
 * Performs exactly ONE business operation: create ONE Prospect record owned
 * by the SERVER-RESOLVED authenticated user, with status forced to NEW.
 * Ownership and tenant boundary are derived server-side; client-supplied
 * ownership, organization, or status values never reach this function (they
 * are rejected by the strict input contract). Truthful provenance: an
 * intelligence reference must resolve to a REAL server-issued
 * prospect_intelligence execution owned by the same user before intelligence
 * provenance is claimed. No update, no delete, no status transition, no
 * conversion, no CRM path exists here.
 */
async function runCreateProspectTool(svc, user, body) {
  const v = validateProspectCreateInput(body && body.input);
  if (!v.ok) {
    return { ok: false, error_code: v.error_code, error: v.error };
  }

  let source = PROSPECT_CREATE_SOURCE_DIRECT;
  let intelligenceReference = null;
  if (v.input.intelligence_reference) {
    const refRecords = await svc.entities.AgentExecution.filter({
      execution_id: v.input.intelligence_reference, user_id: user.id,
    });
    const ref = refRecords[0] || null;
    if (!ref || ref.tool_id !== PHASE7_TOOL_ID || ref.source !== PROVENANCE_SOURCE || ref.status !== 'SUCCEEDED') {
      return {
        ok: false,
        error_code: 'PROSPECT_INTELLIGENCE_REFERENCE_INVALID',
        error: 'intelligence_reference does not resolve to a successful server-issued Prospect Intelligence execution owned by this user.',
      };
    }
    source = PROSPECT_CREATE_SOURCE_INTELLIGENCE;
    intelligenceReference = v.input.intelligence_reference;
  }

  // Ownership + tenant boundary derived SERVER-side only. A client-supplied
  // owner_user_id or organization_id is never read anywhere in this path.
  const record = buildProspectRecord(v.input, {
    source,
    intelligence_reference: intelligenceReference,
    owner_user_id: user.id,
    organization_id: (user.data && user.data.organization_id) ? user.data.organization_id : null,
  });
  const created = await svc.entities.Prospect.create(record);
  const snapshot = {
    id: created.id,
    prospect_id: created.prospect_id,
    company_name: created.company_name,
    status: created.status,
    source: created.source,
    owner_user_id: created.owner_user_id,
    organization_id: created.organization_id || null,
  };
  return {
    ok: true,
    responseKey: 'prospect',
    response: { created: true, prospect: snapshot },
    result_summary: `Created prospect "${created.company_name}" (status ${created.status}, owner = authenticated user) via an approved governed Workforce execution.`,
    snapshot,
    meta: {
      prospect_id: created.prospect_id,
      status: created.status,
      source: created.source,
      from_intelligence: intelligenceReference !== null,
      external_verification: false,
    },
  };
}

/**
 * Phase 8.2 tool — read_own_prospects (ENTITY:Prospect, READ).
 * Returns the authenticated user's OWN Prospect records only. The filter
 * is anchored to the SERVER-resolved user identity — a client-supplied
 * user_id, owner_user_id, or organization_id is never read (they are also
 * rejected as unknown input keys by the strict contract). Deterministic
 * ordering, fixed bounded count, one optional registered-status filter,
 * and a fixed safe projection. No write path, no LLM, no external action.
 */
async function runReadOwnProspectsTool(svc, user, body) {
  const v = validateProspectReadInput(body && body.input);
  if (!v.ok) {
    return { ok: false, error_code: v.error_code, error: v.error };
  }
  // Ownership enforced by the server-resolved identity only. Cross-user,
  // cross-organization, and platform-wide queries are structurally
  // impossible here: the filter key is fixed and its value is user.id.
  const filter = { owner_user_id: user.id };
  if (v.input.status) filter.status = v.input.status;
  const records = await svc.entities.Prospect.filter(
    filter, '-created_date', PROSPECT_READ_MAX_RESULTS,
  );
  const prospects = records.map(projectProspect);
  return {
    ok: true,
    responseKey: 'prospects',
    response: {
      found: records.length,
      count: records.length,
      bounded_to: PROSPECT_READ_MAX_RESULTS,
      status_filter: v.input.status,
      prospects,
    },
    result_summary: records.length > 0
      ? `Read ${records.length} own prospect record(s) (bounded to ${PROSPECT_READ_MAX_RESULTS}).`
      : 'No prospect records on file for this user.',
    snapshot: { count: records.length, status_filter: v.input.status },
    meta: {
      records_found: records.length,
      bounded_to: PROSPECT_READ_MAX_RESULTS,
      status_filter: v.input.status,
      external_verification: false,
    },
  };
}

/**
 * Phase 8.3 tool — qualify_own_prospect (INTERNAL_SERVICE:prospectQualification, INVOKE).
 * READ-ONLY deterministic qualification analysis of ONE Prospect owned by the
 * SERVER-resolved authenticated caller. Answers "Is this prospect worth
 * pursuing?" and nothing else: no Prospect mutation of any field (status,
 * qualification_score, notes, intelligence_summary all untouched), no record
 * creation, no leads, no opportunities, no email, no messaging, no CRM, no
 * payments, no scheduling, no background work, no autonomous pursuit, no
 * external calls, no LLM. The recommended_status in the result is advisory
 * only — the actual Prospect.status is never changed. An
 * intelligence_reference is relied upon ONLY when it resolves to a real
 * SUCCEEDED server-issued prospect_intelligence execution owned by the same
 * user; otherwise it is treated as unavailable and labeled UNKNOWN (never
 * fabricated evidence).
 */
async function runQualifyOwnProspectTool(svc, user, body) {
  const v = validateQualifyInput(body && body.input);
  if (!v.ok) {
    return { ok: false, error_code: v.error_code, error: v.error };
  }
  // Ownership anchored to the server-resolved identity only. The filter always
  // pairs the client-identified prospect with the caller's owner_user_id, so
  // cross-user, cross-organization, and platform-wide lookups are structurally
  // impossible; a Prospect owned by anyone else resolves to the same safe
  // not-found result as a nonexistent one.
  const records = await svc.entities.Prospect.filter(
    { prospect_id: v.input.prospect_id, owner_user_id: user.id }, '-created_date', 1,
  );
  const prospect = records[0] || null;
  if (!prospect) {
    const notFound = buildQualificationNotFound(v.input.prospect_id);
    return {
      ok: true,
      responseKey: 'result',
      response: { result: notFound },
      result_summary: `No owned Prospect record for prospect_id ${v.input.prospect_id} — safe not-found qualification result returned.`,
      snapshot: { found: false, prospect_id: v.input.prospect_id },
      meta: { found: false, external_verification: false, prospect_mutation: false },
    };
  }
  // Verify the record's intelligence_reference server-side before relying on
  // it. An unresolvable reference is treated as unavailable, never fabricated.
  let intelligenceVerified = false;
  if (prospect.intelligence_reference) {
    const refRecords = await svc.entities.AgentExecution.filter({
      execution_id: prospect.intelligence_reference, user_id: user.id,
    });
    const ref = refRecords[0] || null;
    intelligenceVerified = Boolean(ref && ref.tool_id === PHASE7_TOOL_ID
      && ref.source === PROVENANCE_SOURCE && ref.status === 'SUCCEEDED');
  }
  const result = buildQualification(prospect, { intelligence_verified: intelligenceVerified });
  return {
    ok: true,
    responseKey: 'result',
    response: { result },
    result_summary: `Deterministic qualification of prospect ${prospect.prospect_id}: score ${result.qualification_score}/${PROSPECT_QUALIFY_SCORE_CAP} (${result.confidence.level} confidence, no external verification, no mutation).`,
    snapshot: {
      found: true,
      prospect_id: prospect.prospect_id,
      qualification_score: result.qualification_score,
      recommended_status: result.recommended_status,
      confidence_level: result.confidence.level,
    },
    meta: {
      found: true,
      qualification_score: result.qualification_score,
      recommended_status: result.recommended_status,
      intelligence_reference_verified: intelligenceVerified,
      external_verification: false,
      prospect_mutation: false,
    },
  };
}

/**
 * Phase 10 tool — prepare_prospect_outreach (INTERNAL_SERVICE:prospectOutreachPreparation, INVOKE).
 * READ-ONLY deterministic outreach DRAFT preparation for ONE Prospect owned
 * by the SERVER-resolved authenticated caller. PREPARE ONLY: it never sends,
 * schedules, persists, or transmits anything — no email, no SMS, no messaging,
 * no Gmail/Outlook/CRM access, no record creation of any kind, no external
 * calls, no LLM, no background work. The result is advisory and return-only.
 * The channel input is a preparation preference only — no channel is ever
 * contacted. Lifecycle-aware: QUALIFIED/PURSUING are prepared; NEW and
 * DISQUALIFIED return a truthful not-recommended result; CONVERTED returns a
 * truthful already-converted result. Ownership is anchored to the
 * server-resolved identity: the filter always pairs the client-identified
 * prospect with the caller owner_user_id, so a foreign Prospect resolves to
 * the same safe not-found result as a nonexistent one. An
 * intelligence_reference is relied on ONLY when it resolves to a real
 * SUCCEEDED server-issued prospect_intelligence execution owned by the same
 * user; otherwise it is treated as unavailable and never fabricated.
 */
async function runPrepareOutreachTool(svc, user, body) {
  const v = validateOutreachInput(body && body.input);
  if (!v.ok) {
    return { ok: false, error_code: v.error_code, error: v.error };
  }
  const records = await svc.entities.Prospect.filter(
    { prospect_id: v.input.prospect_id, owner_user_id: user.id }, '-created_date', 1,
  );
  const prospect = records[0] || null;
  if (!prospect) {
    const notFound = buildOutreachNotFound(v.input.prospect_id);
    return {
      ok: true,
      responseKey: 'result',
      response: { result: notFound },
      result_summary: `No owned Prospect record for prospect_id ${v.input.prospect_id} — safe not-found outreach preparation result returned.`,
      snapshot: { found: false, preparation_status: 'NOT_FOUND' },
      meta: { found: false, external_verification: false, prospect_mutation: false, outreach_sent: false },
    };
  }
  let intelligenceVerified = false;
  if (prospect.intelligence_reference) {
    const refRecords = await svc.entities.AgentExecution.filter({
      execution_id: prospect.intelligence_reference, user_id: user.id,
    });
    const ref = refRecords[0] || null;
    intelligenceVerified = Boolean(ref && ref.tool_id === PHASE7_TOOL_ID
      && ref.source === PROVENANCE_SOURCE && ref.status === 'SUCCEEDED');
  }
  const result = buildOutreachPreparation(prospect, {
    intelligence_verified: intelligenceVerified,
    requested_channel: v.input.channel,
    requested_tone: v.input.tone,
    requested_objective: v.input.objective,
    caller_name: (user && typeof user.full_name === 'string' && user.full_name.trim() !== '')
      ? user.full_name.trim() : null,
  });
  return {
    ok: true,
    responseKey: 'result',
    response: { result },
    result_summary: `Prepared ${result.preparation_status} outreach draft for prospect ${prospect.prospect_id} (status ${prospect.status}, channel ${result.recommended_channel}, confidence ${result.confidence.score}/${OUTREACH_CONFIDENCE_CAP} — draft only, nothing sent or persisted).`,
    snapshot: {
      found: true,
      prospect_id: prospect.prospect_id,
      preparation_status: result.preparation_status,
      eligible_for_outreach_preparation: result.eligible_for_outreach_preparation,
      recommended_channel: result.recommended_channel,
      confidence_score: result.confidence.score,
    },
    meta: {
      found: true,
      preparation_status: result.preparation_status,
      eligible_for_outreach_preparation: result.eligible_for_outreach_preparation,
      intelligence_reference_verified: intelligenceVerified,
      external_verification: false,
      prospect_mutation: false,
      outreach_sent: false,
      outreach_scheduled: false,
    },
  };
}

/**
 * Phase 11 tool — execute_prospect_outreach
 * (INTERNAL_SERVICE:prospectOutreachExecution, INVOKE).
 * THE EXTERNAL OUTREACH EXECUTION BOUNDARY. In Phase 11 this tool is a
 * governed contract only: it is registered DRAFT + disabled, and the
 * orchestration chain refuses it at the tool-registry kill switch. Even if
 * the registry were flipped without authorization, the global risk
 * threshold (unchanged at medium) refuses a high-risk tool — the external
 * side-effect capability cannot become executable without TWO deliberate,
 * separately reviewed changes.
 *
 * When a future phase activates it (after the delivery connector and
 * production safeguards are separately designed and approved), the chain is:
 * strict input contract → server-issued human approval bound to the exact
 * (requester, growth_agent, execute_prospect_outreach, Prospect, channel,
 * draft hash, input hash, risk=high) → full server-side approval
 * revalidation (existence, user/capability match, server provenance, input
 * hash binding, APPROVED status, expiry, self-approval prohibition,
 * single-use consumption) → Prospect/CHANNEL/DRAFT-HASH binding
 * revalidation against the approval metadata → live Prospect status
 * revalidation (QUALIFIED/PURSUING only, stale-approval protected) → the
 * Phase 12 SANDBOX DELIVERY CONNECTOR — the only connector implementation,
 * non-delivering, contract validation only. Recipient resolution remains
 * NOT_IMPLEMENTED: no recipient is ever accepted from the client,
 * no channel is contacted, no email/SMS/messaging/CRM action exists, no
 * network call is made, and nothing is sent, scheduled, persisted, or
 * transmitted. This tool performs NO external side effect in this phase
 * and claims none.
 */
async function runExecuteOutreachTool(svc, user, body, verifiedApproval, executionCtx) {
  const v = validateOutreachExecutionInput(body && body.input);
  if (!v.ok) {
    return { ok: false, error_code: v.error_code, error: v.error };
  }
  // Fail-closed: this tool is only reachable behind a verified approval —
  // a missing approval reference can never authorize an external action.
  if (!verifiedApproval) {
    return { ok: false, error_code: 'APPROVAL_REQUIRED',
      error: 'A verified human approval is required before any outreach execution.' };
  }
  // Draft binding: the approval is bound to the exact Prospect, channel, and
  // approved draft hash observed server-side at approval time. Any
  // substitution (another Prospect, channel, draft, or message) BLOCKS.
  const binding = validateExecutionApprovalBinding(v.input, verifiedApproval.metadata || {});
  if (!binding.ok) {
    return { ok: false, error_code: binding.error_code, error: binding.error };
  }
  // Ownership anchored to the server-resolved identity only: the filter
  // always pairs the client-identified prospect with the caller owner_user_id,
  // so a Prospect owned by anyone else resolves to the same safe not-found
  // refusal as a nonexistent one.
  const records = await svc.entities.Prospect.filter(
    { prospect_id: v.input.prospect_id, owner_user_id: user.id }, '-created_date', 1,
  );
  const prospect = records[0] || null;
  if (!prospect) {
    return { ok: false, error_code: 'OUTREACH_EXECUTION_PROSPECT_NOT_FOUND',
      error: 'No Prospect record matching prospect_id is owned by the authenticated caller — no outreach execution was performed.' };
  }
  // Stale approval protection: the approval is bound to the Prospect status
  // observed server-side at request time. If the live record no longer
  // matches, BLOCK — never execute against an outdated approval.
  const approvedSource = (verifiedApproval.metadata && typeof verifiedApproval.metadata.source_status === 'string')
    ? verifiedApproval.metadata.source_status
    : null;
  if (!approvedSource || prospect.status !== approvedSource) {
    return { ok: false, error_code: 'OUTREACH_SOURCE_STATUS_CHANGED',
      error: `The Prospect status is no longer "${approvedSource || 'the approved source status'}" — the approval is stale; no outreach execution was performed.` };
  }
  // Status safety at EXECUTION time, from the live server-derived status only.
  // A client-supplied status is never read (rejected as an unknown input key).
  const eligibility = validateOutreachStatusEligibility(prospect.status);
  if (!eligibility.ok) {
    return { ok: false, error_code: eligibility.error_code, error: eligibility.error };
  }
  // ── SANDBOX DELIVERY CONNECTOR — the only implementation behind the boundary. ──
  // All governance checks have passed up to this point. The governed
  // execution boundary (this function, inside AgentOrchestrationCore)
  // constructs the OutreachDeliveryRequest SERVER-side and hands it, with
  // an already-authorized execution context, to the Phase 12 Sandbox
  // Delivery Connector. The connector validates the delivery contract, the
  // immutable delivery identity, and the message immutability — it performs
  // no authorization of its own and NO delivery: recipient resolution
  // remains NOT_IMPLEMENTED and nothing is ever transmitted.
  const boundaryContext = {
    authorization_verified: true,
    expected: {
      prospect_id: prospect.prospect_id,
      channel: v.input.channel,
      approved_draft_hash: v.input.approved_draft_hash,
      approval_id: verifiedApproval.approval_id,
      execution_id: executionCtx.execution_id,
      correlation_id: executionCtx.correlation_id,
      delivery_identity: deriveDeliveryIdentity({
        execution_id: executionCtx.execution_id,
        approved_draft_hash: v.input.approved_draft_hash,
        prospect_id: prospect.prospect_id,
        channel: v.input.channel,
      }),
    },
  };
  const governed = createGovernedDeliveryRequest({
    prospect_id: prospect.prospect_id,
    channel: v.input.channel,
    approved_draft_hash: v.input.approved_draft_hash,
    approval_id: verifiedApproval.approval_id,
    execution_id: executionCtx.execution_id,
    correlation_id: executionCtx.correlation_id,
    destination: buildSandboxDestination(v.input.channel),
    message: {
      approved_draft_hash: v.input.approved_draft_hash,
      content_binding: 'APPROVED_DRAFT_HASH',
      subject: null,
      body: null,
    },
  }, boundaryContext);
  if (!governed.ok) {
    return { ok: false, error_code: governed.error_code, error: governed.error };
  }
  const delivery = sandboxDeliver(governed.request, boundaryContext);
  if (delivery.delivery_status === 'BLOCKED') {
    return { ok: false, error_code: delivery.error_code, error: delivery.verification };
  }
  // Delivery audit record (SANDBOX mode only, service-role write). An audit
  // linkage failure never falsifies the execution outcome.
  let deliveryAuditRecorded = true;
  try {
    await svc.entities.OutreachDeliveryAudit.create(buildDeliveryAuditRecord(governed.request, delivery, {
      audit_id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      source: PROVENANCE_SOURCE,
      user_id: user.id,
      organization_id: (user.data && user.data.organization_id) ? user.data.organization_id : null,
    }));
  } catch (auditError) { deliveryAuditRecorded = false; }
  const result = {
    execution_status: OUTREACH_EXECUTION_DRY_RUN_STATUS,
    dry_run: true,
    external_delivery: false,
    delivered: false,
    sent: false,
    scheduled: false,
    persisted: false,
    channel: v.input.channel,
    prospect_id: prospect.prospect_id,
    approved_draft_hash: v.input.approved_draft_hash,
    approval_id: verifiedApproval.approval_id,
    prospect_status_at_execution: prospect.status,
    delivery,
    recipient_resolution: {
      status: 'DELIVERY_NOT_IMPLEMENTED',
      resolved_recipient: null,
      note: 'Recipient resolution remains a future server-side step. The Sandbox Delivery Connector accepts no client-supplied destination and resolves no recipient.',
    },
    verification_notice: OUTREACH_EXECUTION_VERIFY_NOTICE,
  };
  return {
    ok: true,
    responseKey: 'result',
    response: { result },
    result_summary: `Governed outreach execution reached the Sandbox Delivery Connector for prospect ${prospect.prospect_id} (channel ${v.input.channel}, status ${prospect.status}): delivery_status ${delivery.delivery_status} (SANDBOX — NOTHING SENT) — recipient resolution NOT_IMPLEMENTED, nothing sent, scheduled, or persisted outside the delivery audit record.`,
    snapshot: {
      execution_status: result.execution_status,
      dry_run: true,
      delivery_status: delivery.delivery_status,
      external_delivery: false,
      prospect_id: prospect.prospect_id,
      channel: v.input.channel,
      approved_draft_hash: v.input.approved_draft_hash,
      approval_id: verifiedApproval.approval_id,
    },
    meta: {
      dry_run: true,
      delivery_status: delivery.delivery_status,
      sandbox_connector: true,
      external_delivery: false,
      delivered: false,
      outreach_sent: false,
      outreach_scheduled: false,
      recipient_resolved: false,
      recipient_resolution: 'NOT_IMPLEMENTED',
      network_calls: 0,
      delivery_audit_recorded: deliveryAuditRecorded,
      prospect_mutation: false,
    },
  };
}

/**
 * Phase 11 request-time state validation. Runs BEFORE any approval is
 * issued: validates the strict execution contract and re-derives the
 * CURRENT Prospect status from the database under the server-resolved
 * owner. Only a QUALIFIED or PURSUING Prospect may be bound to an outreach
 * execution approval. The observed source status, the exact channel, and
 * the exact approved draft hash are returned as approval-binding metadata
 * so a later execution request can never substitute another Prospect,
 * channel, draft, or message.
 */
async function validateOutreachExecutionRequestState(svc, user, body) {
  const v = validateOutreachExecutionInput(body && body.input);
  if (!v.ok) return v;
  const records = await svc.entities.Prospect.filter(
    { prospect_id: v.input.prospect_id, owner_user_id: user.id }, '-created_date', 1,
  );
  const prospect = records[0] || null;
  if (!prospect) {
    return { ok: false, error_code: 'OUTREACH_EXECUTION_PROSPECT_NOT_FOUND',
      error: 'No Prospect record matching prospect_id is owned by the authenticated caller — no approval was issued.' };
  }
  const eligibility = validateOutreachStatusEligibility(prospect.status);
  if (!eligibility.ok) return eligibility;
  return {
    ok: true,
    approval_meta: {
      prospect_id: prospect.prospect_id,
      channel: v.input.channel,
      draft_hash: v.input.approved_draft_hash,
      source_status: prospect.status,
    },
  };
}

/**
 * Phase 9 tool — update_own_prospect_status (ENTITY:Prospect, UPDATE).
 * Performs exactly ONE persistent state mutation: a single Prospect.status
 * transition on ONE Prospect owned by the SERVER-resolved authenticated
 * caller, validated against the explicit transition matrix. The approved
 * source status (captured server-side at approval time) is re-verified
 * against the live record before mutation — a Prospect that has moved
 * since approval blocks the execution; no last-write-wins behavior.
 * Only Prospect.status is ever written; qualification remains advisory.
 */
async function runUpdateProspectStatusTool(svc, user, body, verifiedApproval) {
  const v = validateTransitionInput(body && body.input);
  if (!v.ok) {
    return { ok: false, error_code: v.error_code, error: v.error };
  }
  // Fail-closed: this tool is only reachable behind a verified approval —
  // a missing approval reference can never authorize a mutation.
  if (!verifiedApproval) {
    return { ok: false, error_code: 'APPROVAL_REQUIRED',
      error: 'A verified human approval is required before any status mutation.' };
  }
  // Ownership anchored to the server-resolved identity only. The filter
  // always pairs the client-identified prospect with the caller's
  // owner_user_id, so a Prospect owned by anyone else resolves to the same
  // safe not-found result as a nonexistent one.
  const records = await svc.entities.Prospect.filter(
    { prospect_id: v.input.prospect_id, owner_user_id: user.id }, '-created_date', 1,
  );
  const prospect = records[0] || null;
  if (!prospect) {
    return { ok: false, error_code: 'TRANSITION_PROSPECT_NOT_FOUND',
      error: 'No Prospect record matching prospect_id is owned by the authenticated caller — no mutation was performed.' };
  }
  // Stale approval protection: the approval is bound to the source status
  // observed server-side at request time. If the live record no longer
  // matches, BLOCK — never apply an outdated transition.
  const currentStatus = prospect.status;
  const approvedSource = (verifiedApproval.metadata && typeof verifiedApproval.metadata.source_status === 'string')
    ? verifiedApproval.metadata.source_status
    : null;
  if (!approvedSource || currentStatus !== approvedSource) {
    return { ok: false, error_code: 'TRANSITION_SOURCE_STATUS_CHANGED',
      error: `The Prospect status is no longer "${approvedSource || 'the approved source status'}" — the approval is stale; no mutation was performed.` };
  }
  // Re-validate the transition from the LIVE server-derived status.
  const t = validateTransitionAgainstMatrix(currentStatus, v.input.new_status);
  if (!t.ok) {
    return { ok: false, error_code: t.error_code, error: t.error };
  }
  // THE mutation — exactly ONE field: status. Platform-managed timestamps are
  // never set manually; no other field is touched.
  const updated = await svc.entities.Prospect.update(prospect.id, { status: v.input.new_status });
  const snapshot = {
    prospect_id: prospect.prospect_id,
    previous_status: currentStatus,
    new_status: v.input.new_status,
  };
  return {
    ok: true,
    responseKey: 'transition',
    response: { updated: true, transition: snapshot },
    result_summary: `Transitioned prospect ${prospect.prospect_id} status ${currentStatus} → ${v.input.new_status} via an approved governed Workforce execution (exactly one field changed: status).`,
    snapshot,
    meta: {
      prospect_id: prospect.prospect_id,
      previous_status: currentStatus,
      new_status: v.input.new_status,
      status_transition: `${currentStatus}→${v.input.new_status}`,
      has_transition_reason: Boolean(v.input.transition_reason),
      fields_changed: 1,
      qualification_score_touched: false,
      external_verification: false,
    },
  };
}

/**
 * Phase 9 request-time state validation. Runs BEFORE any approval is issued:
 * validates the strict input contract, re-derives the CURRENT status from
 * the database under the server-resolved owner (a client-supplied
 * current_status is never trusted — it is rejected as an unknown key), and
 * validates the transition against the matrix. The observed source status
 * is returned as approval-binding metadata for stale-approval protection.
 */
async function validateTransitionRequestState(svc, user, body) {
  const v = validateTransitionInput(body && body.input);
  if (!v.ok) return v;
  const records = await svc.entities.Prospect.filter(
    { prospect_id: v.input.prospect_id, owner_user_id: user.id }, '-created_date', 1,
  );
  const prospect = records[0] || null;
  if (!prospect) {
    return { ok: false, error_code: 'TRANSITION_PROSPECT_NOT_FOUND',
      error: 'No Prospect record matching prospect_id is owned by the authenticated caller — no approval was issued.' };
  }
  const t = validateTransitionAgainstMatrix(prospect.status, v.input.new_status);
  if (!t.ok) return t;
  return {
    ok: true,
    approval_meta: {
      prospect_id: prospect.prospect_id,
      source_status: prospect.status,
      requested_new_status: v.input.new_status,
    },
  };
}

// ── Phase 14E — Verified Prospect Contact capability tools ──

/**
 * Phase 14E tool — create_own_prospect_contact (ENTITY:ProspectContact,
 * CREATE). Performs exactly ONE business operation: create ONE UNVERIFIED
 * EMAIL contact record for a Prospect owned by the SERVER-resolved
 * authenticated caller. The record grants no trust: verification_status is
 * forced UNVERIFIED, is_primary is forced false, and no verified actor,
 * method, or timestamp exists. Ownership and tenant boundary are derived
 * server-side; client-supplied ownership or verification-state fields are
 * rejected by the strict contract. No email is sent and no external action
 * exists in this path.
 */
async function runCreateProspectContactTool(svc, user, body) {
  const v = validateCreateContactInput(body && body.input);
  if (!v.ok) {
    return { ok: false, error_code: v.error_code, error: v.error };
  }
  // The contact must belong to a Prospect owned by the caller — the filter
  // always pairs the client-identified prospect with the caller owner_user_id,
  // so a foreign Prospect resolves to the same safe not-found result as a
  // nonexistent one (no cross-user or cross-tenant contact creation).
  const prospectRecords = await svc.entities.Prospect.filter(
    { prospect_id: v.input.prospect_id, owner_user_id: user.id }, '-created_date', 1,
  );
  const prospect = prospectRecords[0] || null;
  if (!prospect) {
    return { ok: false, error_code: 'CONTACT_PROSPECT_NOT_FOUND',
      error: 'No Prospect record matching prospect_id is owned by the authenticated caller — no contact was created.' };
  }
  const record = buildContactRecord(v.input, {
    owner_user_id: user.id,
    organization_id: (user.data && user.data.organization_id) ? user.data.organization_id : null,
  });
  if (record && record.error_code) {
    return { ok: false, error_code: record.error_code, error: record.error };
  }
  const created = await svc.entities.ProspectContact.create(record);
  return buildContactCreatedOutcome(created);
}

/**
 * Phase 14E tool — read_own_prospect_contacts (ENTITY:ProspectContact,
 * READ). Returns ONLY the authenticated caller's own contact records for
 * ONE owned Prospect, bounded and in a fixed safe projection. Read-only;
 * no write path, no email.
 */
async function runReadOwnProspectContactsTool(svc, user, body) {
  const v = validateReadContactsInput(body && body.input);
  if (!v.ok) {
    return { ok: false, error_code: v.error_code, error: v.error };
  }
  const prospectRecords = await svc.entities.Prospect.filter(
    { prospect_id: v.input.prospect_id, owner_user_id: user.id }, '-created_date', 1,
  );
  const prospect = prospectRecords[0] || null;
  if (!prospect) {
    return { ok: false, error_code: 'CONTACT_PROSPECT_NOT_FOUND',
      error: 'No Prospect record matching prospect_id is owned by the authenticated caller — no contacts were read.' };
  }
  const records = await svc.entities.ProspectContact.filter(
    { prospect_id: prospect.prospect_id, owner_user_id: user.id }, '-created_date', PROSPECT_CONTACT_MAX_RESULTS,
  );
  return buildContactsReadOutcome(records, prospect.prospect_id);
}

/**
 * Phase 14E tool — verify_own_prospect_contact (ENTITY:ProspectContact,
 * UPDATE). THE explicit governed verification action: marks exactly ONE
 * UNVERIFIED EMAIL contact owned by the SERVER-resolved caller as VERIFIED,
 * recording the verifying actor and timestamp server-side. The contact
 * value can never be replaced (rejected by the contract), a REVOKED
 * contact fails closed, and an already-VERIFIED contact is never
 * re-verified. The approval is bound to the exact contact and its observed
 * verification state, so a stale or substituted approval BLOCKS. If the
 * verified contact becomes primary, any previous VERIFIED primary is
 * demoted first (server-side rule; at most one VERIFIED primary per
 * Prospect). Sends nothing — verification records trust state only.
 */
async function runVerifyProspectContactTool(svc, user, body, verifiedApproval) {
  const v = validateVerifyContactInput(body && body.input);
  if (!v.ok) {
    return { ok: false, error_code: v.error_code, error: v.error };
  }
  // Fail-closed: this tool is only reachable behind a verified approval —
  // a missing approval reference can never authorize a trust grant.
  if (!verifiedApproval) {
    return { ok: false, error_code: 'APPROVAL_REQUIRED',
      error: 'A verified human approval is required before any contact verification.' };
  }
  // Approval binding: the approval was issued for the exact contact — no
  // arbitrary verification target substitution.
  const approvedContactId = (verifiedApproval.metadata && typeof verifiedApproval.metadata.contact_id === 'string')
    ? verifiedApproval.metadata.contact_id : null;
  if (!approvedContactId || approvedContactId !== v.input.contact_id) {
    return { ok: false, error_code: 'CONTACT_APPROVAL_MISMATCH',
      error: 'The approval was issued for a different contact — no verification target substitution is permitted.' };
  }
  const prospectRecords = await svc.entities.Prospect.filter(
    { prospect_id: v.input.prospect_id, owner_user_id: user.id }, '-created_date', 1,
  );
  const prospect = prospectRecords[0] || null;
  if (!prospect) {
    return { ok: false, error_code: 'CONTACT_PROSPECT_NOT_FOUND',
      error: 'No Prospect record matching prospect_id is owned by the authenticated caller — no verification was performed.' };
  }
  const contactRecords = await svc.entities.ProspectContact.filter(
    { contact_id: v.input.contact_id, prospect_id: prospect.prospect_id, owner_user_id: user.id }, '-created_date', 1,
  );
  const contact = contactRecords[0] || null;
  if (!contact) {
    return { ok: false, error_code: 'CONTACT_NOT_FOUND',
      error: 'No contact record matching contact_id is owned by the authenticated caller for this Prospect — no verification was performed.' };
  }
  const ownership = assertContactOwnership(contact, user.id);
  if (!ownership.ok) {
    return { ok: false, error_code: ownership.error_code, error: ownership.error };
  }
  // Stale approval protection: the approval is bound to the verification
  // state observed server-side at request time. A contact that moved since
  // approval BLOCKS — no last-write-wins verification.
  const approvedSourceStatus = (verifiedApproval.metadata && typeof verifiedApproval.metadata.contact_verification_status === 'string')
    ? verifiedApproval.metadata.contact_verification_status : null;
  if (!approvedSourceStatus || contact.verification_status !== approvedSourceStatus) {
    return { ok: false, error_code: 'CONTACT_STATE_CHANGED',
      error: 'The contact verification state is no longer "' + (approvedSourceStatus || 'the approved source state') + '" — the approval is stale; no verification was performed.' };
  }
  const update = buildContactVerificationUpdate(contact, v.input, {
    verifying_user_id: user.id,
    verified_at: new Date().toISOString(),
  });
  if (!update.ok) {
    return { ok: false, error_code: update.error_code, error: update.error };
  }
  // Primary rule: demote any previous VERIFIED primary FIRST so at most one
  // VERIFIED primary EMAIL contact exists per Prospect (fail-closed order —
  // a transient failure can leave no primary, never two).
  let demotedPrimaryCount = 0;
  if (update.update.is_primary === true) {
    const primaries = await svc.entities.ProspectContact.filter(
      { prospect_id: prospect.prospect_id, owner_user_id: user.id, is_primary: true, verification_status: 'VERIFIED' },
      '-created_date', 10,
    );
    for (const p of primaries) {
      if (p.contact_id !== contact.contact_id) {
        await svc.entities.ProspectContact.update(p.id, { is_primary: false });
        demotedPrimaryCount++;
      }
    }
  }
  const updated = await svc.entities.ProspectContact.update(contact.id, update.update);
  return buildContactVerifiedOutcome(updated, demotedPrimaryCount);
}

/**
 * Phase 14E request-time state validation for verify_own_prospect_contact.
 * Runs BEFORE any approval is issued: validates the strict contract and
 * re-resolves the Prospect AND contact server-side under the caller
 * ownership. Only an UNVERIFIED (non-revoked) contact may be bound to a
 * verification approval; the observed verification state is returned as
 * approval-binding metadata for stale-approval protection. The contact
 * email never enters the approval metadata.
 */
async function validateVerifyContactRequestState(svc, user, body) {
  const v = validateVerifyContactInput(body && body.input);
  if (!v.ok) return v;
  const prospectRecords = await svc.entities.Prospect.filter(
    { prospect_id: v.input.prospect_id, owner_user_id: user.id }, '-created_date', 1,
  );
  const prospect = prospectRecords[0] || null;
  if (!prospect) {
    return { ok: false, error_code: 'CONTACT_PROSPECT_NOT_FOUND',
      error: 'No Prospect record matching prospect_id is owned by the authenticated caller — no approval was issued.' };
  }
  const contactRecords = await svc.entities.ProspectContact.filter(
    { contact_id: v.input.contact_id, prospect_id: prospect.prospect_id, owner_user_id: user.id }, '-created_date', 1,
  );
  const contact = contactRecords[0] || null;
  if (!contact) {
    return { ok: false, error_code: 'CONTACT_NOT_FOUND',
      error: 'No contact record matching contact_id is owned by the authenticated caller for this Prospect — no approval was issued.' };
  }
  if (contact.verification_status === 'REVOKED') {
    return { ok: false, error_code: 'CONTACT_REVOKED_FAIL_CLOSED',
      error: 'A revoked contact can never be re-verified — fail-closed.' };
  }
  if (contact.verification_status === 'VERIFIED') {
    return { ok: false, error_code: 'CONTACT_ALREADY_VERIFIED',
      error: 'The contact is already VERIFIED — re-verification is refused.' };
  }
  return {
    ok: true,
    approval_meta: {
      prospect_id: prospect.prospect_id,
      contact_id: contact.contact_id,
      contact_verification_status: contact.verification_status,
      make_primary: v.input.make_primary === true,
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
  // Per-capability logical-request hash keys idempotency AND approval binding
  // so different payloads never collapse into one replay and one approval can
  // never authorize different input.
  const requestHash = typeof cap.requestHash === 'function' ? cap.requestHash(body) : '';
  const correlationId = requestHash
    ? `${correlationIdFor(user.id, cap.agentId, cap.toolId)}:${requestHash}`
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

  // ── Human approval gate ──
  // Not required for the two live read-only tools (their registry definitions
  // carry human_approval_required=false, so this branch stays dormant for them).
  // For approval-required tools (Phase 8: create_own_prospect), a request
  // WITHOUT an approval reference is QUEUED behind a NEW server-issued PENDING
  // AgentApproval — no mutation happens before a decision. A request WITH an
  // approval reference never trusts it: every field is re-validated
  // server-side (existence, user/capability match, server provenance,
  // input-hash binding, APPROVED status, expiry, self-approval prohibition,
  // single-use consumption) before the tool may run. Approval NEVER
  // auto-executes; an approved execution always requires this separate
  // orchestration request. There is no second approval mechanism and no
  // hidden callback.
  let approvalStatus = 'NOT_REQUIRED';
  let verifiedApproval = null;
  if (tool.human_approval_required === true) {
    // Request-time input validation: an approval is only ever issued for a
    // payload that satisfies the tool input contract. Injected or malformed
    // requests are refused BEFORE any approval record exists — truthful
    // BLOCKED audit record; nothing queued, nothing mutated.
    let requestValidation = null;
    if (typeof cap.validateRequest === 'function') {
      const v = await cap.validateRequest(svc, user, body);
      if (v && v.ok === false) {
        const execution = await recordBlocked(svc, user, v.error_code, v.error,
          { request_time_input_validation: true, approval_request_refused: true }, blockOpts);
        return Response.json({
          status: 'BLOCKED', blocked: true,
          error_code: v.error_code, error: v.error, message: v.error,
          execution_id: execution.execution_id,
        }, { status: 422 });
      }
      if (v && v.ok === true) requestValidation = v;
    }
    const claimedApprovalId = (body && typeof body.approval_id === 'string' && body.approval_id.trim() !== '')
      ? body.approval_id.trim()
      : null;

    if (!claimedApprovalId) {
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
        // Phase 9 stale-approval protection: the approval is bound to the
        // prospect state observed at request time (source status + requested
        // new status) so it can never authorize an outdated transition.
        metadata: {
          ...META,
          ...(requestHash ? { input_hash: requestHash } : {}),
          ...(requestValidation && requestValidation.approval_meta ? requestValidation.approval_meta : {}),
        },
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
        metadata: { ...META, approval_id: approvalId, ...(requestHash ? { input_hash: requestHash } : {}) },
      });
      // NEVER execute before APPROVED. No hidden callback executes on approval.
      return Response.json({
        status: 'PENDING_APPROVAL',
        execution_id: execution.execution_id,
        approval_id: approvalId,
        message: 'Human approval is required before this tool can execute.',
      }, { status: 200 });
    }

    // An approval reference was supplied. It can IDENTIFY but never AUTHORIZE
    // by itself — every field is re-validated server-side before execution.
    const approvalRecords = await svc.entities.AgentApproval.filter({ approval_id: claimedApprovalId });
    const approval = approvalRecords[0] || null;
    const blockApproval = async (code, message, extraMeta = {}) => {
      const execution = await recordBlocked(svc, user, code, message,
        { claimed_approval_id: claimedApprovalId, ...extraMeta }, blockOpts);
      return blockedResponse(code, message, execution);
    };
    if (!approval) {
      return await blockApproval('APPROVAL_NOT_FOUND', 'The referenced approval does not exist.');
    }
    if (approval.user_id !== user.id) {
      return await blockApproval('APPROVAL_USER_MISMATCH', 'The referenced approval belongs to a different user.');
    }
    if (approval.agent_id !== cap.agentId || approval.tool_id !== cap.toolId) {
      return await blockApproval('APPROVAL_CAPABILITY_MISMATCH', 'The referenced approval does not match the requested capability.');
    }
    if (approval.source !== PROVENANCE_SOURCE) {
      return await blockApproval('APPROVAL_PROVENANCE_INVALID', 'Only server-issued approvals can authorize execution.');
    }
    if (requestHash && ((approval.metadata && approval.metadata.input_hash) || null) !== requestHash) {
      return await blockApproval('APPROVAL_INPUT_MISMATCH', 'The referenced approval was issued for different input.');
    }
    if (approval.status === 'PENDING') {
      return Response.json({
        status: 'PENDING_APPROVAL',
        approval_id: claimedApprovalId,
        message: 'Approval is still pending decision — nothing has executed.',
      }, { status: 200 });
    }
    if (approval.status === 'REJECTED') {
      return await blockApproval('APPROVAL_REJECTED', 'The request was rejected by the approver — nothing will execute.');
    }
    if (approval.status !== 'APPROVED') {
      return await blockApproval('APPROVAL_NOT_ACTIVE', `The referenced approval is ${approval.status}.`);
    }
    if (approval.expires_at && Date.parse(approval.expires_at) < Date.now()) {
      return await blockApproval('APPROVAL_EXPIRED', 'The approval window has expired — a new approval is required.');
    }
    if (!approval.approver_user_id || approval.approver_user_id === approval.user_id) {
      return await blockApproval('APPROVAL_SELF_APPROVED', 'Self-approval is prohibited; this approval cannot authorize execution.');
    }
    if (approval.metadata && approval.metadata.executed_execution_id) {
      return await blockApproval('APPROVAL_ALREADY_EXECUTED', 'This approval has already been consumed by an execution.');
    }
    approvalStatus = 'APPROVED';
    verifiedApproval = approval;
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
    replayBody[cap.responseKey] = snapshot;
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
    human_approval_required: tool.human_approval_required === true,
    approval_status: approvalStatus,
    requested_at: requestedAt,
    started_at: startedAt,
    correlation_id: correlationId,
    parent_execution_id: latestPrior ? latestPrior.execution_id : null,
    source: PROVENANCE_SOURCE,
    metadata: {
      ...META,
      idempotency_ttl_ms: IDEMPOTENCY_TTL_MS,
      ...(requestHash ? { input_hash: requestHash } : {}),
      ...(verifiedApproval ? { approval_id: verifiedApproval.approval_id } : {}),
    },
  });

  // ── THE tool runs (pure, deterministic, return-only) ──
  try {
    const startedMs = Date.now();
    const outcome = cap.toolId === PHASE8_TOOL_ID
      ? await runCreateProspectTool(svc, user, body)
      : cap.toolId === PHASE7_TOOL_ID
        ? await runProspectIntelligenceTool(body)
        : cap.toolId === PHASE82_TOOL_ID
          ? await runReadOwnProspectsTool(svc, user, body)
          : cap.toolId === PHASE83_TOOL_ID
            ? await runQualifyOwnProspectTool(svc, user, body)
            : cap.toolId === PHASE9_TOOL_ID
              ? await runUpdateProspectStatusTool(svc, user, body, verifiedApproval)
              : cap.toolId === PHASE10_TOOL_ID
                ? await runPrepareOutreachTool(svc, user, body)
                : cap.toolId === PHASE11_TOOL_ID
                  ? await runExecuteOutreachTool(svc, user, body, verifiedApproval, {
                    execution_id: execution.execution_id,
                    correlation_id: execution.correlation_id,
                  })
                  : cap.toolId === PHASE14E_CREATE_TOOL_ID
                    ? await runCreateProspectContactTool(svc, user, body)
                    : cap.toolId === PHASE14E_READ_TOOL_ID
                      ? await runReadOwnProspectContactsTool(svc, user, body)
                      : cap.toolId === PHASE14E_VERIFY_TOOL_ID
                        ? await runVerifyProspectContactTool(svc, user, body, verifiedApproval)
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

    // Approval relationship recorded bidirectionally; the approval is consumed
    // after exactly ONE execution (single-use). A linkage failure never
    // falsifies the execution outcome — the linkage already exists on the
    // execution side (approval_id in metadata + correlation_id).
    if (verifiedApproval) {
      try {
        await svc.entities.AgentApproval.update(verifiedApproval.id, {
          metadata: {
            ...(verifiedApproval.metadata || {}),
            executed_execution_id: execution.execution_id,
            executed_at: completedAt,
          },
        });
      } catch (linkageError) { /* execution-side linkage remains authoritative */ }
    }

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
    responseKey: 'assessment',
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
    requestHash: (reqBody) => prospectInputHash(reqBody && reqBody.input),
    responseKey: 'result',
  });
}

/**
 * Phase 8 capability — the FIRST state-changing Workforce capability.
 * growth_agent → create_own_prospect → ENTITY:Prospect (CREATE).
 * human_approval_required=true: the request is QUEUED behind a server-issued
 * PENDING AgentApproval until a separate approved orchestration request
 * executes it. Tool is registered DRAFT + enabled=false — the chain refuses
 * it at the registry kill switch until activation.
 */
export async function executeProspectCreate(svc, user, body, issuedBy = 'agentOrchestrationService') {
  return await executeGovernedCapability(svc, user, body, issuedBy, {
    agentId: PHASE8_AGENT_ID,
    toolId: PHASE8_TOOL_ID,
    targetType: PHASE8_TARGET_TYPE,
    targetName: PHASE8_TARGET_NAME,
    operation: PHASE8_OPERATION,
    requestHash: (reqBody) => prospectCreateInputHash(reqBody && reqBody.input),
    responseKey: 'prospect',
    validateRequest: (_svc, _user, reqBody) => validateProspectCreateInput(reqBody && reqBody.input),
  });
}

/**
 * Phase 8.2 capability — read-only OWN Prospect retrieval.
 * growth_agent → read_own_prospects → ENTITY:Prospect (READ).
 * human_approval_required=false (registered low-risk read). The tool stays
 * DRAFT + disabled until activation — the chain refuses it at the registry
 * kill switch.
 */
export async function executeReadOwnProspects(svc, user, body, issuedBy = 'agentOrchestrationService') {
  return await executeGovernedCapability(svc, user, body, issuedBy, {
    agentId: PHASE7_AGENT_ID,
    toolId: PHASE82_TOOL_ID,
    targetType: PHASE82_TARGET_TYPE,
    targetName: PHASE82_TARGET_NAME,
    operation: PHASE82_OPERATION,
    responseKey: 'prospects',
  });
}

/**
 * Phase 8.3 capability — READ-ONLY deterministic qualification analysis.
 * growth_agent → qualify_own_prospect → INTERNAL_SERVICE:prospectQualification (INVOKE).
 * human_approval_required=false (registered low-risk read-only analysis). The
 * tool stays DRAFT + disabled until activation — the chain refuses it at the
 * registry kill switch. RETURN-ONLY: the result never mutates any Prospect
 * field and never executes the pursuit it recommends. Idempotency is keyed
 * per prospect via the deterministic input hash.
 */
export async function executeQualifyOwnProspect(svc, user, body, issuedBy = 'agentOrchestrationService') {
  return await executeGovernedCapability(svc, user, body, issuedBy, {
    agentId: PHASE7_AGENT_ID,
    toolId: PHASE83_TOOL_ID,
    targetType: PHASE83_TARGET_TYPE,
    targetName: PHASE83_TARGET_NAME,
    operation: PHASE83_OPERATION,
    requestHash: (reqBody) => qualifyInputHash(reqBody && reqBody.input),
    responseKey: 'result',
  });
}

/**
 * Phase 9 capability — controlled Prospect lifecycle status transition.
 * growth_agent → update_own_prospect_status → ENTITY:Prospect (UPDATE).
 * human_approval_required=true: every transition is QUEUED behind a
 * server-issued PENDING AgentApproval bound to the observed source status;
 * a stale approval is blocked when the live status has changed. The tool
 * stays DRAFT + disabled until activation — the chain refuses it at the
 * registry kill switch. This capability never decides that a prospect
 * SHOULD change status: qualification recommends, a human approves, and
 * only then does the Workforce execute the approved transition.
 */
export async function executeUpdateProspectStatus(svc, user, body, issuedBy = 'agentOrchestrationService') {
  return await executeGovernedCapability(svc, user, body, issuedBy, {
    agentId: PHASE7_AGENT_ID,
    toolId: PHASE9_TOOL_ID,
    targetType: PHASE9_TARGET_TYPE,
    targetName: PHASE9_TARGET_NAME,
    operation: PHASE9_OPERATION,
    requestHash: (reqBody) => prospectTransitionInputHash(reqBody && reqBody.input),
    responseKey: 'transition',
    validateRequest: (reqSvc, reqUser, reqBody) => validateTransitionRequestState(reqSvc, reqUser, reqBody),
  });
}

/**
 * Phase 10 capability — READ-ONLY deterministic outreach draft preparation.
 * growth_agent → prepare_prospect_outreach → INTERNAL_SERVICE:prospectOutreachPreparation (INVOKE).
 * human_approval_required=false (registered low-risk read-only preparation).
 * RETURN-ONLY: the result is a DRAFT that never sends, schedules, persists,
 * or transmits anything, and never automatically executes the proposed
 * action. Idempotency is keyed per logical request via the deterministic
 * input hash. The tool stays DRAFT + disabled until activation — the chain
 * refuses it at the registry kill switch.
 */
export async function executePrepareProspectOutreach(svc, user, body, issuedBy = 'agentOrchestrationService') {
  return await executeGovernedCapability(svc, user, body, issuedBy, {
    agentId: PHASE7_AGENT_ID,
    toolId: PHASE10_TOOL_ID,
    targetType: PHASE10_TARGET_TYPE,
    targetName: PHASE10_TARGET_NAME,
    operation: PHASE10_OPERATION,
    requestHash: (reqBody) => outreachInputHash(reqBody && reqBody.input),
    responseKey: 'result',
  });
}

/**
 * Phase 11 capability — THE EXTERNAL OUTREACH EXECUTION BOUNDARY.
 * growth_agent → execute_prospect_outreach →
 * INTERNAL_SERVICE:prospectOutreachExecution (INVOKE). risk=high,
 * human_approval_required=true. The tool is registered DRAFT + disabled and
 * the global risk threshold remains medium — this capability is
 * intentionally NOT executable: it establishes the governed contract for a
 * future external outreach execution capability and stops at the external
 * delivery boundary (DRY RUN — NOTHING SENT). No delivery connector, no
 * email, no SMS, no messaging, no CRM, no scheduling, no background work,
 * and no LLM exist anywhere in this path.
 */
export async function executeProspectOutreach(svc, user, body, issuedBy = 'agentOrchestrationService') {
  return await executeGovernedCapability(svc, user, body, issuedBy, {
    agentId: PHASE7_AGENT_ID,
    toolId: PHASE11_TOOL_ID,
    targetType: PHASE11_TARGET_TYPE,
    targetName: PHASE11_TARGET_NAME,
    operation: PHASE11_OPERATION,
    requestHash: (reqBody) => outreachExecutionInputHash(reqBody && reqBody.input),
    responseKey: 'result',
    validateRequest: (reqSvc, reqUser, reqBody) => validateOutreachExecutionRequestState(reqSvc, reqUser, reqBody),
  });
}

/**
 * Phase 14E capability — create ONE UNVERIFIED EMAIL prospect contact.
 * growth_agent → create_own_prospect_contact → ENTITY:ProspectContact (CREATE).
 * human_approval_required=false (registered low risk — an UNVERIFIED contact
 * grants no trust, resolves no recipient, and sends nothing). Ownership and
 * tenant are derived server-side; verification state is never client-supplied.
 */
export async function executeCreateProspectContact(svc, user, body, issuedBy = 'agentOrchestrationService') {
  return await executeGovernedCapability(svc, user, body, issuedBy, {
    agentId: PHASE7_AGENT_ID,
    toolId: PHASE14E_CREATE_TOOL_ID,
    targetType: PHASE14E_TARGET_TYPE,
    targetName: PHASE14E_TARGET_NAME,
    operation: PHASE14E_CREATE_OPERATION,
    requestHash: (reqBody) => prospectContactCreateInputHash(reqBody && reqBody.input),
    responseKey: 'contact',
  });
}

/**
 * Phase 14E capability — read ONLY the caller's own prospect contacts for
 * one owned Prospect. growth_agent → read_own_prospect_contacts →
 * ENTITY:ProspectContact (READ). human_approval_required=false (registered
 * low-risk read, fixed bounded projection).
 */
export async function executeReadOwnProspectContacts(svc, user, body, issuedBy = 'agentOrchestrationService') {
  return await executeGovernedCapability(svc, user, body, issuedBy, {
    agentId: PHASE7_AGENT_ID,
    toolId: PHASE14E_READ_TOOL_ID,
    targetType: PHASE14E_TARGET_TYPE,
    targetName: PHASE14E_TARGET_NAME,
    operation: PHASE14E_READ_OPERATION,
    responseKey: 'contacts',
  });
}

/**
 * Phase 14E capability — THE explicit governed verification action.
 * growth_agent → verify_own_prospect_contact → ENTITY:ProspectContact (UPDATE).
 * human_approval_required=true: every verification is QUEUED behind a
 * server-issued PENDING AgentApproval bound to the exact contact and its
 * observed verification state; a stale or substituted approval BLOCKS.
 * Verification records trust state only — nothing is ever sent.
 */
export async function executeVerifyProspectContact(svc, user, body, issuedBy = 'agentOrchestrationService') {
  return await executeGovernedCapability(svc, user, body, issuedBy, {
    agentId: PHASE7_AGENT_ID,
    toolId: PHASE14E_VERIFY_TOOL_ID,
    targetType: PHASE14E_TARGET_TYPE,
    targetName: PHASE14E_TARGET_NAME,
    operation: PHASE14E_VERIFY_OPERATION,
    requestHash: (reqBody) => prospectContactVerifyInputHash(reqBody && reqBody.input),
    responseKey: 'contact',
    validateRequest: (reqSvc, reqUser, reqBody) => validateVerifyContactRequestState(reqSvc, reqUser, reqBody),
  });
}

/**
 * Phase 12 — truthful external delivery readiness. Real delivery is NOT
 * enabled: the only connector implementation is the non-delivering sandbox
 * connector, no real provider is registered, and the execute_prospect_outreach
 * tool remains DRAFT + disabled. The registry listing is read from
 * ExternalDeliveryConnectorRegistry for verification only — a registry
 * record never authorizes anything.
 */
export async function getDeliveryReadiness(svc) {
  const registryRecords = await svc.entities.ExternalDeliveryConnectorRegistry.filter({}, 'connector_id', 50);
  const connectors = registryRecords.map((c) => ({
    connector_id: c.connector_id,
    name: c.name,
    connector_type: c.connector_type,
    version: c.version,
    status: c.status,
    enabled: c.enabled === true,
    supported_channels: Array.isArray(c.supported_channels) ? c.supported_channels : [],
    supports_delivery: c.supports_delivery === true,
    sandbox_only: c.sandbox_only === true,
    requires_human_approval: c.requires_human_approval === true,
  }));
  return Response.json({
    ...getRealDeliveryReadiness(),
    registry: connectors,
    registered_connector_count: connectors.length,
  }, { status: 200 });
}

// Phase 14F — the controlled first-send operator path lives in
// agentOrchestrationFirstSend.ts (same authoritative boundaries).
export { executeControlledFirstSend, getFirstSendReadiness } from './agentOrchestrationFirstSend.ts';

// ============================================================
// (Phase 14F block removed — see agentOrchestrationFirstSend.ts)
// ============================================================



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
      || true, // re-verified structurally below against the full result
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
  const realDeliveryRecords = await svc.entities.OutreachDeliveryConfig.filter({ config_id: 'outreach_real_delivery_global' });
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
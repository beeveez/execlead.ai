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
  buildOutreachExecutionDryRun,
  outreachExecutionInputHash,
} from './prospectOutreachExecution.ts';
import {
  validateTransitionInput,
  validateTransitionAgainstMatrix,
  prospectTransitionInputHash,
} from './prospectStatusTransition.ts';

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
 * revalidation (QUALIFIED/PURSUING only, stale-approval protected) →
 * DRY-RUN STOP. Recipient resolution terminates at
 * DELIVERY_NOT_IMPLEMENTED: no recipient is ever accepted from the client,
 * no channel is contacted, no email/SMS/messaging/CRM action exists, no
 * network call is made, and nothing is sent, scheduled, persisted, or
 * transmitted. This tool performs NO external side effect in this phase
 * and claims none.
 */
async function runExecuteOutreachTool(svc, user, body, verifiedApproval) {
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
  // ── DRY-RUN STOP — the external delivery boundary. ──
  // All governance checks have passed up to this point. Recipient resolution
  // terminates here: no external delivery connector exists in this phase, no
  // recipient is resolved, and nothing is transmitted. The result is a
  // governed dry-run proof only — it never claims delivery.
  const result = buildOutreachExecutionDryRun(v.input, verifiedApproval.approval_id, {
    prospect_status: prospect.status,
  });
  return {
    ok: true,
    responseKey: 'result',
    response: { result },
    result_summary: `Governed outreach execution DRY RUN for prospect ${prospect.prospect_id} (channel ${v.input.channel}, status ${prospect.status}): all governance checks passed up to the external delivery boundary; recipient resolution terminated at DELIVERY_NOT_IMPLEMENTED — DRY RUN, NOTHING SENT, nothing scheduled or persisted.`,
    snapshot: {
      execution_status: result.execution_status,
      dry_run: true,
      external_delivery: false,
      prospect_id: prospect.prospect_id,
      channel: v.input.channel,
      approved_draft_hash: v.input.approved_draft_hash,
      approval_id: verifiedApproval.approval_id,
    },
    meta: {
      dry_run: true,
      external_delivery: false,
      delivered: false,
      outreach_sent: false,
      outreach_scheduled: false,
      recipient_resolved: false,
      recipient_resolution: 'DELIVERY_NOT_IMPLEMENTED',
      network_calls: 0,
      records_created: 0,
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
                  ? await runExecuteOutreachTool(svc, user, body, verifiedApproval)
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
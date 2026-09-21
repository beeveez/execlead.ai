/**
 * Agent Orchestrator™ — Orchestration Core (Phase 2A)
 * ============================================================
 * Governed delegation path above the EXEC™ Tool Gateway™:
 *
 *   EXEC™ → Executive Context Engine™ → Agent Orchestrator™ →
 *   Agent Registry → Registered Agent → Tool Gateway™ →
 *   Existing Platform Tools / Services
 *
 * The core:
 *   1. receives an orchestration request
 *   2. validates the requested agent (existence)
 *   3. verifies the agent is enabled
 *   4. verifies authentication
 *   5. establishes the immutable authenticated execution context
 *      (identity is derived from the authenticated user only — a caller can
 *      never override identity or tenant context)
 *   6. validates the orchestration input (identity fields are forbidden)
 *   7. enforces the agent's allowed-tools list through a permission-checked
 *      tool accessor — tool access happens ONLY through the Tool Gateway™
 *   8. executes the registered agent exactly ONCE under a bounded timeout
 *   9. normalizes the result and emits structured telemetry
 *
 * The orchestrator contains orchestration logic ONLY — no business logic
 * from Executive Readiness, Journey, Identity, Evidence, etc. It never
 * bypasses the Tool Gateway and never executes arbitrary functions.
 *
 * Failure control: single attempt, no retries, no recursion, no autonomous
 * loops. Every failure is normalized into an error category. EXEC™'s
 * existing fallback behavior remains intact (the caller falls through).
 *
 * Dependency-free by design except the shared gateway-core primitives
 * (input validation + forbidden identity keys), which are themselves
 * dependency-free.
 */

import { validateToolInput, FORBIDDEN_IDENTITY_KEYS } from "../toolGateway/gatewayCore.js";

export const ORCHESTRATION_ERROR_CODES = {
  AGENT_NOT_FOUND: "AGENT_NOT_FOUND",
  AGENT_DISABLED: "AGENT_DISABLED",
  AUTHENTICATION_REQUIRED: "AUTHENTICATION_REQUIRED",
  FORBIDDEN_INPUT: "FORBIDDEN_INPUT",
  INVALID_INPUT: "INVALID_INPUT",
  UNAUTHORIZED_TOOL: "UNAUTHORIZED_TOOL",
  AGENT_EXECUTION_ERROR: "AGENT_EXECUTION_ERROR",
  AGENT_TIMEOUT: "AGENT_TIMEOUT",
  UNAUTHORIZED_DELEGATION: "UNAUTHORIZED_DELEGATION",
  DELEGATION_DEPTH_EXCEEDED: "DELEGATION_DEPTH_EXCEEDED",
};

export const DEFAULT_AGENT_TIMEOUT_MS = 15000;

// Phase 3A — the delegation boundary: agent-to-agent delegation is capped at
// exactly ONE hop. A delegated agent (depth 1) can never delegate further.
export const MAX_DELEGATION_DEPTH = 1;
export const ORCHESTRATION_TIMEOUT_MARK = "__AGENT_ORCHESTRATION_TIMEOUT__";

function ownKeys(input) {
  return input && typeof input === "object" && !Array.isArray(input) ? Object.keys(input) : [];
}

function newRequestId() {
  return `orch-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Invoke a registered agent through the governed orchestration path.
 *
 * @param {object} params
 * @param {string} params.agentName
 * @param {object} [params.input] — orchestration input (identity fields forbidden)
 * @param {object} params.context — { user, workspace?, runtimeProfile?, getRuntimeProfile }
 * @param {object} params.registry — a createAgentRegistry() instance
 * @param {function} params.toolInvoker — (toolName, toolInput, toolOptions) => gateway result
 * @param {function} [params.onResult] — structured telemetry sink (result, failureCategory)
 * @returns {Promise<{ok, agent, agentVersion, requestId, data?, error?, toolsRequested, toolsSucceeded, timeoutMs, durationMs, startedAt, completedAt}>}
 */
export async function orchestrateCore({ agentName, input, context, registry, toolInvoker, onResult, delegation }) {
  const startedAt = Date.now();
  const startedAtIso = new Date().toISOString();
  const requestId = newRequestId();
  const user = context?.user || null;
  const userId = user?.id || null;
  // Delegation lineage (Phase 3A) — inherited from the orchestrator, never
  // caller-controlled. A top-level orchestration runs at depth 0; a governed
  // delegation executes the child at depth 1 with the SAME immutable
  // authenticated context.
  const delegationDepth =
    typeof delegation?.depth === "number" && delegation.depth >= 0 ? delegation.depth : 0;
  const parentAgentName = typeof delegation?.parentAgentName === "string" ? delegation.parentAgentName : null;
  const parentRequestId = typeof delegation?.parentRequestId === "string" ? delegation.parentRequestId : null;

  const emit = (result, failureCategory) => {
    try {
      if (typeof onResult === "function") onResult(result, failureCategory || null);
    } catch {
      // a telemetry sink failure must never break the orchestration path
    }
    return result;
  };

  const finish = (ok, payload, meta = {}) => {
    const durationMs = Date.now() - startedAt;
    return {
      ok,
      agent: typeof agentName === "string" ? agentName : null,
      agentVersion: meta.agentVersion || null,
      requestId,
      ...(ok ? { data: payload } : { error: payload }),
      toolsRequested: meta.toolsRequested || null,
      toolsSucceeded: meta.toolsSucceeded || null,
      timeoutMs: meta.timeoutMs || null,
      durationMs,
      startedAt: startedAtIso,
      completedAt: new Date().toISOString(),
      delegation: Object.freeze({ depth: delegationDepth, parentAgentName, parentRequestId }),
    };
  };

  // 1. Agent existence (unknown agents are rejected — no arbitrary execution)
  if (typeof agentName !== "string" || !registry.has(agentName)) {
    return emit(
      finish(false, { code: ORCHESTRATION_ERROR_CODES.AGENT_NOT_FOUND, message: `Unknown agent: ${String(agentName)}` }),
      ORCHESTRATION_ERROR_CODES.AGENT_NOT_FOUND
    );
  }
  const agent = registry.get(agentName);

  // 2. Lifecycle
  if (agent.enabled === false) {
    return emit(
      finish(
        false,
        { code: ORCHESTRATION_ERROR_CODES.AGENT_DISABLED, message: `Agent ${agentName} is disabled.` },
        { agentVersion: agent.version }
      ),
      ORCHESTRATION_ERROR_CODES.AGENT_DISABLED
    );
  }

  // 3. Authentication — every orchestration operates in the authenticated
  //    user's context only.
  if (!userId) {
    return emit(
      finish(
        false,
        { code: ORCHESTRATION_ERROR_CODES.AUTHENTICATION_REQUIRED, message: "Agent orchestration requires an authenticated user." },
        { agentVersion: agent.version }
      ),
      ORCHESTRATION_ERROR_CODES.AUTHENTICATION_REQUIRED
    );
  }

  // 4. Cross-user guard — caller-supplied identity is rejected before
  //    validation or execution. Identity and tenant context are derived from
  //    the authenticated session and can never be overridden.
  const suppliedIdentity = ownKeys(input).filter((k) => FORBIDDEN_IDENTITY_KEYS.includes(k));
  if (suppliedIdentity.length > 0) {
    return emit(
      finish(
        false,
        {
          code: ORCHESTRATION_ERROR_CODES.FORBIDDEN_INPUT,
          message: `Identity is derived from the authenticated session — forbidden input field(s): ${suppliedIdentity.join(", ")}`,
        },
        { agentVersion: agent.version }
      ),
      ORCHESTRATION_ERROR_CODES.FORBIDDEN_INPUT
    );
  }

  // 5. Input validation
  const inputCheck = validateToolInput(agent.inputSchema || { type: "object", properties: {} }, input || {});
  if (!inputCheck.valid) {
    return emit(
      finish(
        false,
        { code: ORCHESTRATION_ERROR_CODES.INVALID_INPUT, message: inputCheck.error },
        { agentVersion: agent.version }
      ),
      ORCHESTRATION_ERROR_CODES.INVALID_INPUT
    );
  }

  // 6. Tool permission boundary — the ONLY tool capability accessor the
  //    agent receives. Not on the agent's allowed-tools list → rejected
  //    here, the underlying tool never executes. Authorized tools are
  //    delegated to the Tool Gateway™ (which independently re-authorizes).
  //    Delegated (child) executions are marked so audits can distinguish
  //    parent from child gateway calls.
  const workspace = context.workspace || null;
  const allowedTools = Object.freeze([...agent.allowedTools]);
  const toolOptions = Object.freeze({
    user,
    activeWorkspace: workspace,
    runtimeProfile: context.runtimeProfile || null,
    delegatedBy: delegationDepth > 0 ? parentAgentName : null,
  });
  const invokeTool = async (toolName, toolInput = {}) => {
    if (typeof toolName !== "string" || !allowedTools.includes(toolName)) {
      return {
        ok: false,
        tool: typeof toolName === "string" ? toolName : null,
        version: null,
        error: {
          code: ORCHESTRATION_ERROR_CODES.UNAUTHORIZED_TOOL,
          message: `Agent ${agent.name} is not authorized to invoke tool: ${String(toolName)}. Allowed tools: ${allowedTools.join(", ")}.`,
        },
        durationMs: 0,
        invokedAt: new Date().toISOString(),
      };
    }
    return toolInvoker(toolName, toolInput, toolOptions);
  };

  // 7. Bounded agent-to-agent delegation boundary (Phase 3A) — the ONLY
  //    delegation accessor an agent receives:
  //      • the target must be on the agent's EXPLICIT allowedDelegations
  //        whitelist (no dynamic or arbitrary agent selection);
  //      • maximum delegation depth is MAX_DELEGATION_DEPTH (1) — a
  //        delegated agent cannot delegate further;
  //      • the child executes through this same governed pipeline with the
  //        SAME immutable authenticated context and Tool Gateway™ invoker.
  //    Rejections are normalized and emitted to telemetry; no child agent
  //    ever executes for a rejected delegation.
  const delegateAgent = async (targetName, delegateInput = {}) => {
    const attemptedDepth = delegationDepth + 1;
    const reject = (code, message) =>
      emit(
        {
          ok: false,
          agent: typeof targetName === "string" ? targetName : null,
          agentVersion: null,
          requestId,
          error: { code, message },
          toolsRequested: null,
          toolsSucceeded: null,
          timeoutMs: null,
          durationMs: 0,
          startedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          delegation: Object.freeze({
            depth: attemptedDepth,
            parentAgentName: agent.name,
            parentRequestId: requestId,
          }),
        },
        code
      );
    if (attemptedDepth > MAX_DELEGATION_DEPTH) {
      return reject(
        ORCHESTRATION_ERROR_CODES.DELEGATION_DEPTH_EXCEEDED,
        `Delegation rejected: depth ${attemptedDepth} exceeds the maximum delegation depth of ${MAX_DELEGATION_DEPTH}.`
      );
    }
    const allowedDelegations = Array.isArray(agent.allowedDelegations) ? agent.allowedDelegations : [];
    if (typeof targetName !== "string" || !allowedDelegations.includes(targetName)) {
      return reject(
        ORCHESTRATION_ERROR_CODES.UNAUTHORIZED_DELEGATION,
        `Agent ${agent.name} is not authorized to delegate to: ${String(targetName)}.`
      );
    }
    return orchestrateCore({
      agentName: targetName,
      input: delegateInput,
      context,
      registry,
      toolInvoker,
      onResult,
      delegation: {
        depth: attemptedDepth,
        parentAgentName: agent.name,
        parentRequestId: requestId,
      },
    });
  };

  // 8. Immutable execution context — frozen; identity derived from the
  //    authenticated user only. The delegation lineage is inherited from
  //    the orchestrator, never caller-controlled; a delegated child receives
  //    the same frozen user/tenant identity.
  const executionContext = Object.freeze({
    requestId,
    agentName: agent.name,
    agentVersion: agent.version,
    requestedAt: startedAtIso,
    user: Object.freeze({
      id: user.id,
      fullName: user.full_name || user.fullName || null,
      email: user.email || null,
    }),
    workspace: workspace
      ? Object.freeze({ id: workspace.id || null, name: workspace.name || null })
      : null,
    tenantContext: Object.freeze({ organizationId: user?.data?.organization_id || null }),
    permissions: Object.freeze([...agent.requiredPermissions]),
    delegation: Object.freeze({
      depth: delegationDepth,
      parentAgentName,
      parentRequestId,
      maxDelegationDepth: MAX_DELEGATION_DEPTH,
    }),
    getRuntimeProfile: context.getRuntimeProfile,
    delegateAgent,
  });

  // 9. Bounded execution — exactly one attempt, no retries, no recursion.
  const timeoutMs =
    typeof agent.timeoutMs === "number" && agent.timeoutMs > 0 ? agent.timeoutMs : DEFAULT_AGENT_TIMEOUT_MS;
  const handlerPromise = Promise.resolve().then(() =>
    agent.handler({ context: executionContext, input: input || {}, invokeTool, delegateAgent })
  );
  let timer = null;
  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(ORCHESTRATION_TIMEOUT_MARK)), timeoutMs);
  });

  let data;
  try {
    data = await Promise.race([handlerPromise, timeoutPromise]);
  } catch (e) {
    clearTimeout(timer);
    const isTimeout = e?.message === ORCHESTRATION_TIMEOUT_MARK;
    return emit(
      finish(
        false,
        {
          code: isTimeout ? ORCHESTRATION_ERROR_CODES.AGENT_TIMEOUT : ORCHESTRATION_ERROR_CODES.AGENT_EXECUTION_ERROR,
          message: isTimeout
            ? `Agent ${agent.name} execution exceeded its timeout of ${timeoutMs}ms and was terminated.`
            : e?.message || "Agent execution failed.",
        },
        { agentVersion: agent.version, timeoutMs }
      ),
      isTimeout ? ORCHESTRATION_ERROR_CODES.AGENT_TIMEOUT : ORCHESTRATION_ERROR_CODES.AGENT_EXECUTION_ERROR
    );
  }
  clearTimeout(timer);

  const toolsRequested = Array.isArray(data?.toolsRequested) ? data.toolsRequested : null;
  const toolsSucceeded = Array.isArray(data?.toolsSucceeded) ? data.toolsSucceeded : null;

  // 9. Normalized success
  return emit(
    finish(true, data, { agentVersion: agent.version, toolsRequested, toolsSucceeded, timeoutMs }),
    null
  );
}
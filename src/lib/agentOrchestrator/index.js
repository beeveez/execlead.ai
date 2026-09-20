/**
 * Agent Orchestrator™ (Phase 2A)
 * ============================================================
 * Governed delegation layer above the EXEC™ Tool Gateway™:
 *
 *   EXEC™ → Executive Context Engine™ → Agent Orchestrator™ →
 *   Agent Registry → Registered Agent → Tool Gateway™ →
 *   Existing Platform Tools / Services
 *
 * Registered agents:
 *   • executive_context_agent (Phase 2A) — read-only executive context
 *     retrieval (Profile / Readiness / Journey) through the Tool Gateway™
 *   • executive_readiness_agent (Phase 2B) — evidence-grounded Executive
 *     Readiness™ development analysis; the existing readiness engine remains
 *     the sole source of truth and the authoritative score is preserved exactly
 *
 * Invariants:
 *   • The orchestrator NEVER bypasses the Tool Gateway™ — an agent's only
 *     capability accessor is the permission-checked invokeTool, which
 *     delegates authorized tools to the Tool Gateway™ (defense in depth).
 *   • Agents never execute arbitrary backend functions directly.
 *   • Identity is derived from the authenticated session; caller-supplied
 *     identity/tenant fields are rejected at both the orchestrator and the
 *     gateway. No second identity system is introduced.
 *   • Execution is bounded (per-agent timeoutMs), single-attempt, no
 *     retries, no recursion, no autonomous loops.
 *   • Telemetry reuses the existing EXEC™ reliability engine + platform
 *     analytics pipeline — no second telemetry system. No prompts,
 *     secrets, or payloads are recorded.
 *
 * Scope limit (Phase 2A): NO MCP, NO Claude/Anthropic SDK, NO external
 * agent frameworks, NO new user-facing modules.
 *
 * FUTURE AGENTS: add an agent module under agents/, register it below, and
 * (optionally) extend the router — the orchestrator itself never changes.
 */
import { base44 } from "@/api/base44Client";
import { buildExecutiveRuntimeProfile } from "@/lib/executiveRuntimeProfile";
import { invokeTool as gatewayInvokeTool } from "@/lib/toolGateway";
import { logStage, getExecEvents } from "@/lib/execReliabilityEngine";
import { createAgentRegistry } from "./registry.js";
import { orchestrateCore, ORCHESTRATION_ERROR_CODES, DEFAULT_AGENT_TIMEOUT_MS } from "./orchestratorCore.js";
import executiveContextAgent from "./agents/executiveContextAgent.js";
import executiveReadinessAgent from "./agents/executiveReadinessAgent.js";

export const AGENT_ORCHESTRATOR_VERSION = "1.0.0";

// ── Agent Registry (single registration point) ──
const agentRegistry = createAgentRegistry();
agentRegistry.register(executiveContextAgent);
agentRegistry.register(executiveReadinessAgent);

export function listRegisteredAgents() {
  return agentRegistry.list();
}

/**
 * Orchestrate a governed agent invocation.
 *
 * @param {string} agentName
 * @param {object} [input] — orchestration input; identity fields are forbidden
 * @param {object} [options] — { user, activeWorkspace, runtimeProfile }
 *   runtimeProfile: an already-built Executive Runtime Profile™ to reuse
 *   (e.g. EXEC™'s cached context). When absent, the canonical builder is used.
 * @returns {Promise<{ok, agent, agentVersion, requestId, data?, error?, toolsRequested, toolsSucceeded, timeoutMs, durationMs, startedAt, completedAt}>}
 */
export async function orchestrateAgent(agentName, input = {}, options = {}) {
  const { user, activeWorkspace = null, runtimeProfile = null } = options;

  const context = {
    user: user || null,
    workspace: activeWorkspace || null,
    runtimeProfile: runtimeProfile || null,
    getRuntimeProfile: async () => {
      if (runtimeProfile) return runtimeProfile;
      if (!user?.id) throw new Error("Authentication required: no authenticated user.");
      const rp = await buildExecutiveRuntimeProfile(user, activeWorkspace);
      if (!rp) throw new Error("Executive Runtime Profile™ unavailable.");
      return rp;
    },
  };

  return orchestrateCore({
    agentName,
    input,
    context,
    registry: agentRegistry,
    // Authorized tools are delegated to the Tool Gateway™ — never to the
    // underlying services directly.
    toolInvoker: (toolName, toolInput, toolOptions) => gatewayInvokeTool(toolName, toolInput, toolOptions),
    onResult: (result, failureCategory) => {
      // Existing EXEC™ reliability engine — same pipeline as every other
      // EXEC™ stage. No second telemetry system.
      logStage({
        correlationId: result.requestId,
        stage: "agent_orchestration",
        status: result.ok ? "success" : "failure",
        latencyMs: result.durationMs,
        error: failureCategory || null,
        extra: {
          agent: result.agent,
          agentVersion: result.agentVersion,
          requestId: result.requestId,
          toolsRequested: result.toolsRequested,
          toolsSucceeded: result.toolsSucceeded,
        },
      });
      // Platform analytics pipeline — minimal properties, no payloads, no PII
      try {
        base44.analytics.track({
          eventName: "agent_orchestration",
          properties: {
            agent: result.agent,
            agentVersion: result.agentVersion,
            success: result.ok,
            durationMs: result.durationMs,
            failureCategory: failureCategory || null,
            toolsRequestedCount: result.toolsRequested?.length ?? 0,
            toolsSucceededCount: result.toolsSucceeded?.length ?? 0,
          },
        });
      } catch {
        // analytics must never break the orchestration path
      }
    },
  });
}

/** Orchestrator status snapshot for the Developer Workspace panel. */
export function getAgentOrchestratorStatus() {
  const agents = agentRegistry.list();
  const recentInvocations = getExecEvents(200)
    .filter((e) => e.stage === "agent_orchestration")
    .slice(0, 10)
    .map((e) => ({
      requestId: e.correlationId,
      agent: e.agent || null,
      agentVersion: e.agentVersion || null,
      status: e.status,
      durationMs: e.latencyMs,
      failureCategory: e.error || null,
      toolsRequested: e.toolsRequested || [],
      toolsSucceeded: e.toolsSucceeded || [],
      timestamp: new Date(e.ts).toISOString(),
    }));
  return {
    version: AGENT_ORCHESTRATOR_VERSION,
    registeredAgentCount: agents.length,
    enabledAgentCount: agents.filter((a) => a.enabled).length,
    agents,
    recentInvocations,
  };
}

export { ORCHESTRATION_ERROR_CODES, DEFAULT_AGENT_TIMEOUT_MS };
export { matchOrchestrationIntent, formatAgentResponse } from "./agentRouter.js";
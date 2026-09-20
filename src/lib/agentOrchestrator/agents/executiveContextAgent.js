/**
 * Agent Orchestrator™ — Test Agent: executive_context_agent (Phase 2A)
 * ============================================================
 * The single registered agent of Phase 2A. This is a TECHNICAL VALIDATION
 * agent, not a user-facing product feature: it demonstrates that a
 * registered agent can obtain executive context exclusively through the
 * governed EXEC™ Tool Gateway™.
 *
 * It can request:
 *   • getExecutiveProfile
 *   • getExecutiveReadiness
 *   • getExecutiveJourney
 *
 * It performs NO mutations, accesses NO arbitrary functions, and can never
 * access another user's information (identity is derived from the immutable
 * orchestration execution context; the orchestrator and the Tool Gateway™
 * both reject caller-supplied identity independently).
 *
 * Dependency-free by design.
 */

const ALLOWED_TOOLS = Object.freeze([
  "getExecutiveProfile",
  "getExecutiveReadiness",
  "getExecutiveJourney",
]);

const executiveContextAgent = {
  name: "executive_context_agent",
  displayName: "Executive Context Agent",
  description:
    "Technical validation agent for the Phase 2A agentic architecture: obtains the authenticated member's executive context (Profile, Readiness, Journey) exclusively through the governed EXEC™ Tool Gateway™. Read-only; performs no mutations; never bypasses the Tool Gateway; never accesses another user's information.",
  purpose:
    "Demonstrates governed agent delegation from EXEC™ through the Agent Orchestrator™ to the Tool Gateway™ and the existing Executive Runtime Profile™.",
  version: "1.0.0",
  enabled: true,
  requiredPermissions: Object.freeze(["authenticated"]),
  allowedTools: ALLOWED_TOOLS,
  timeoutMs: 10000,
  handlerName: "AgentOrchestrator.gatewayInvocation",
  inputSchema: {
    type: "object",
    properties: {
      requestedTools: {
        type: "array",
        description:
          "Optional subset of the agent's allowed tools to request. Defaults to all allowed tools. Tools outside the agent's allowed-tools list are rejected by the orchestrator.",
      },
    },
    additionalProperties: false,
  },
  outputSchema: {
    type: "object",
    description: "{ tools[]: { tool, ok, data?|error? }, toolsRequested[], toolsSucceeded[] }",
  },
  async handler({ input, invokeTool }) {
    const requested =
      Array.isArray(input.requestedTools) && input.requestedTools.length > 0
        ? input.requestedTools
        : [...ALLOWED_TOOLS];

    const tools = [];
    for (const toolName of requested) {
      const res = await invokeTool(toolName, {});
      tools.push({
        tool: typeof toolName === "string" ? toolName : String(toolName),
        ok: res.ok === true,
        ...(res.ok ? { data: res.data } : { error: res.error }),
      });
    }

    return {
      tools,
      toolsRequested: requested,
      toolsSucceeded: tools.filter((t) => t.ok).map((t) => t.tool),
    };
  },
};

export default executiveContextAgent;
export { ALLOWED_TOOLS as EXECUTIVE_CONTEXT_AGENT_TOOLS };
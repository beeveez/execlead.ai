/**
 * Agent Orchestrator™ — Agent Contract & Registry (Phase 2A)
 * ============================================================
 * Centralized internal agent contract for EXECLEAD.AI agents.
 *
 * Every registered agent must define:
 *   • name                 — unique agent identifier (snake_case)
 *   • displayName         — human label for diagnostics surfaces
 *   • description          — what the agent does (and never does)
 *   • purpose              — why the orchestrator would delegate to it
 *   • version              — semver of the agent contract
 *   • enabled              — lifecycle status
 *   • requiredPermissions  — authorization requirements ("authenticated")
 *   • allowedTools         — EXPLICIT Tool Gateway™ tool whitelist; the
 *                            orchestrator rejects any tool not on this list
 *   • allowedDelegations (optional) — EXPLICIT agent-to-agent delegation
 *                            whitelist; the orchestrator rejects delegation
 *                            to any agent not on this list, and delegation
 *                            depth is capped at MAX_DELEGATION_DEPTH (1)
 *   • handler              — async ({ context, input, invokeTool }) => data
 *   • inputSchema          — JSON-schema-shaped input contract
 *   • outputSchema         — JSON-schema-shaped output contract
 *   • timeoutMs            — bounded execution policy (positive number)
 *
 * The handler NEVER invokes platform services directly: its only capability
 * accessor is the orchestrator-provided `invokeTool`, which enforces the
 * agent's allowed-tools list and delegates to the Tool Gateway™
 * (defense in depth: orchestrator permission check → gateway authorization
 * → existing service).
 *
 * Scope limit (Phase 2A): no MCP, no Claude/Anthropic SDK, no autonomous
 * loops, no agent-to-agent conversations, no recursive execution. The
 * orchestrator executes a registered agent exactly once per request.
 *
 * This registry is distinct from the governance AgentRegistry entity
 * (AI Workforce phases) — it is the EXEC™-internal agent contract.
 *
 * Dependency-free by design: no imports, testable in isolation.
 */

export const AGENT_CONTRACT_FIELDS = [
  "name",
  "displayName",
  "description",
  "purpose",
  "version",
  "enabled",
  "requiredPermissions",
  "allowedTools",
  "allowedDelegations",
  "handler",
  "inputSchema",
  "outputSchema",
  "timeoutMs",
];

export function validateAgentDefinition(def) {
  if (!def || typeof def !== "object" || Array.isArray(def)) {
    return { valid: false, error: "Agent definition must be a plain object." };
  }
  for (const field of ["name", "displayName", "description", "purpose", "version"]) {
    if (typeof def[field] !== "string" || !def[field].trim()) {
      return { valid: false, error: `Missing or invalid agent contract field: ${field}` };
    }
  }
  if (!/^[a-z][a-z0-9_]{2,}$/.test(def.name)) {
    return { valid: false, error: `Invalid agent name: ${def.name} (snake_case required).` };
  }
  if (typeof def.handler !== "function") {
    return { valid: false, error: `Agent ${def.name}: handler must be a function.` };
  }
  if (!Array.isArray(def.requiredPermissions) || def.requiredPermissions.length === 0) {
    return { valid: false, error: `Agent ${def.name}: requiredPermissions must be a non-empty array.` };
  }
  if (
    !Array.isArray(def.allowedTools) ||
    def.allowedTools.length === 0 ||
    def.allowedTools.some((t) => typeof t !== "string" || !t.trim())
  ) {
    return {
      valid: false,
      error: `Agent ${def.name}: allowedTools must be a non-empty array of tool names (explicit Tool Gateway™ whitelist).`,
    };
  }
  if (def.inputSchema?.type !== "object") {
    return { valid: false, error: `Agent ${def.name}: inputSchema must be of type object.` };
  }
  if (def.outputSchema?.type !== "object") {
    return { valid: false, error: `Agent ${def.name}: outputSchema must be of type object.` };
  }
  if (def.enabled !== undefined && typeof def.enabled !== "boolean") {
    return { valid: false, error: `Agent ${def.name}: enabled must be a boolean.` };
  }
  if (def.timeoutMs !== undefined && (typeof def.timeoutMs !== "number" || def.timeoutMs <= 0)) {
    return { valid: false, error: `Agent ${def.name}: timeoutMs must be a positive number.` };
  }
  if (def.allowedDelegations !== undefined) {
    if (
      !Array.isArray(def.allowedDelegations) ||
      def.allowedDelegations.length === 0 ||
      def.allowedDelegations.some((t) => typeof t !== "string" || !t.trim())
    ) {
      return {
        valid: false,
        error: `Agent ${def.name}: allowedDelegations must be a non-empty array of registered agent names (explicit delegation whitelist — no wildcards).`,
      };
    }
  }
  return { valid: true };
}

export function createAgentRegistry() {
  const agents = new Map();

  return {
    register(def) {
      const check = validateAgentDefinition(def);
      if (!check.valid) {
        throw new Error(`[Agent Orchestrator™] Invalid agent definition: ${check.error}`);
      }
      if (agents.has(def.name)) {
        throw new Error(`[Agent Orchestrator™] Agent already registered: ${def.name}`);
      }
      agents.set(def.name, { ...def });
    },

    get(name) {
      return agents.get(name) || null;
    },

    has(name) {
      return agents.has(name);
    },

    /** Lifecycle control (tests / Developer Workspace diagnostics only). */
    setEnabled(name, enabled) {
      const agent = agents.get(name);
      if (!agent) throw new Error(`[Agent Orchestrator™] Unknown agent: ${name}`);
      if (typeof enabled !== "boolean") {
        throw new Error(`[Agent Orchestrator™] enabled must be a boolean.`);
      }
      agent.enabled = enabled;
    },

    /** Structured snapshot for diagnostics — never exposes handler functions. */
    list() {
      return Array.from(agents.values()).map((a) => ({
        name: a.name,
        displayName: a.displayName,
        description: a.description,
        purpose: a.purpose,
        version: a.version,
        enabled: a.enabled !== false,
        requiredPermissions: [...a.requiredPermissions],
        allowedTools: [...a.allowedTools],
        allowedDelegations: Array.isArray(a.allowedDelegations) ? [...a.allowedDelegations] : null,
        timeoutMs: a.timeoutMs || null,
        handlerName: a.handlerName || a.handler.name || "anonymous",
        inputSchema: a.inputSchema,
        outputSchema: a.outputSchema,
      }));
    },

    size() {
      return agents.size;
    },
  };
}
/**
 * EXEC™ Tool Gateway™ — Tool Contract & Registry (Phase 1)
 * ============================================================
 * Centralized internal tool contract for EXEC™ tools.
 *
 * Every tool must define:
 *   • name                 — unique tool identifier (camelCase)
 *   • description          — what the tool returns
 *   • purpose              — why EXEC™ would use it
 *   • requiredPermissions  — authorization requirements ("authenticated")
 *   • inputSchema          — JSON-schema-shaped input contract
 *   • outputSchema         — JSON-schema-shaped output contract
 *   • handler              — async (executionContext) => structured data
 *   • enabled              — lifecycle status
 *   • version              — semver of the tool contract
 *
 * MCP PREPARATION (Phase 1 does NOT implement MCP):
 *   The contract shape (name, description, inputSchema, outputSchema) maps
 *   one-to-one onto a future MCP tool definition, so this registry can later
 *   be adapted to an MCP-compatible interface without changing the tools
 *   or the business logic underneath:
 *     EXEC™ → Agent Orchestrator → Tool Gateway → Internal/MCP Tools
 *
 * This registry is distinct from the governance AgentToolRegistry entity
 * (AI Workforce phases) — it is the EXEC™-internal tool contract.
 *
 * Dependency-free by design: no imports, testable in isolation.
 */

export const TOOL_CONTRACT_FIELDS = [
  "name",
  "description",
  "purpose",
  "requiredPermissions",
  "inputSchema",
  "outputSchema",
  "handler",
  "enabled",
  "version",
];

export function validateToolDefinition(def) {
  if (!def || typeof def !== "object" || Array.isArray(def)) {
    return { valid: false, error: "Tool definition must be a plain object." };
  }
  for (const field of ["name", "description", "purpose", "version"]) {
    if (typeof def[field] !== "string" || !def[field].trim()) {
      return { valid: false, error: `Missing or invalid tool contract field: ${field}` };
    }
  }
  if (!/^[a-z][A-Za-z0-9]{2,}$/.test(def.name)) {
    return { valid: false, error: `Invalid tool name: ${def.name}` };
  }
  if (typeof def.handler !== "function") {
    return { valid: false, error: `Tool ${def.name}: handler must be a function.` };
  }
  if (!Array.isArray(def.requiredPermissions) || def.requiredPermissions.length === 0) {
    return { valid: false, error: `Tool ${def.name}: requiredPermissions must be a non-empty array.` };
  }
  if (def.inputSchema?.type !== "object") {
    return { valid: false, error: `Tool ${def.name}: inputSchema must be of type object.` };
  }
  if (def.outputSchema?.type !== "object") {
    return { valid: false, error: `Tool ${def.name}: outputSchema must be of type object.` };
  }
  if (def.enabled !== undefined && typeof def.enabled !== "boolean") {
    return { valid: false, error: `Tool ${def.name}: enabled must be a boolean.` };
  }
  return { valid: true };
}

export function createToolRegistry() {
  const tools = new Map();

  return {
    register(def) {
      const check = validateToolDefinition(def);
      if (!check.valid) {
        throw new Error(`[Tool Gateway™] Invalid tool definition: ${check.error}`);
      }
      if (tools.has(def.name)) {
        throw new Error(`[Tool Gateway™] Tool already registered: ${def.name}`);
      }
      tools.set(def.name, { ...def });
    },

    get(name) {
      return tools.get(name) || null;
    },

    has(name) {
      return tools.has(name);
    },

    /** Structured snapshot for diagnostics — never exposes handler functions. */
    list() {
      return Array.from(tools.values()).map((t) => ({
        name: t.name,
        description: t.description,
        purpose: t.purpose,
        requiredPermissions: [...t.requiredPermissions],
        version: t.version,
        enabled: t.enabled !== false,
        handlerName: t.handlerName || t.handler.name || "anonymous",
        inputSchema: t.inputSchema,
        outputSchema: t.outputSchema,
      }));
    },

    size() {
      return tools.size;
    },
  };
}
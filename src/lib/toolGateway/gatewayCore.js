/**
 * EXEC™ Tool Gateway™ — Gateway Core (Phase 1)
 * ============================================================
 * Centralized governed invocation path:
 *
 *   EXEC™ → Executive Context → Tool Gateway™ → Authorized Tool →
 *   Existing Platform Service / Repository → Result → EXEC™
 *
 * The core:
 *   • validates tool existence and enabled status
 *   • enforces authentication (identity derived from the execution context)
 *   • enforces the cross-user guard (caller-supplied identity fields are
 *     rejected — a user can never retrieve another user's data)
 *   • validates input against the tool's input schema
 *   • invokes the tool handler and normalizes the result
 *   • emits structured invocation metadata for the audit layer
 *   • never contains business logic (handlers delegate to existing services)
 *   • never exposes secrets
 *
 * Dependency-free by design: no imports, testable in isolation.
 */

export const TOOL_ERROR_CODES = {
  TOOL_NOT_FOUND: "TOOL_NOT_FOUND",
  TOOL_DISABLED: "TOOL_DISABLED",
  AUTHENTICATION_REQUIRED: "AUTHENTICATION_REQUIRED",
  FORBIDDEN_INPUT: "FORBIDDEN_INPUT",
  INVALID_INPUT: "INVALID_INPUT",
  TOOL_EXECUTION_ERROR: "TOOL_EXECUTION_ERROR",
};

// Identity may NEVER be supplied by the caller. Every tool derives identity
// from the authenticated execution context — this is the cross-user guard.
export const FORBIDDEN_IDENTITY_KEYS = [
  "user_id",
  "userId",
  "id",
  "email",
  "created_by_id",
  "subject_user_id",
  "owner_user_id",
  "organization_id",
  "organizationId",
];

function ownKeys(input) {
  return input && typeof input === "object" && !Array.isArray(input) ? Object.keys(input) : [];
}

const TYPE_CHECKS = {
  string: (v) => typeof v === "string",
  number: (v) => typeof v === "number" && Number.isFinite(v),
  boolean: (v) => typeof v === "boolean",
  object: (v) => typeof v === "object" && v !== null && !Array.isArray(v),
  array: (v) => Array.isArray(v),
};

export function validateToolInput(schema, input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { valid: false, error: "Tool input must be a plain object." };
  }
  if (schema.additionalProperties === false) {
    const allowed = Object.keys(schema.properties || {});
    const unknown = ownKeys(input).filter((k) => !allowed.includes(k));
    if (unknown.length > 0) {
      return { valid: false, error: `Unexpected input field(s): ${unknown.join(", ")}` };
    }
  }
  for (const [key, propSchema] of Object.entries(schema.properties || {})) {
    const value = input[key];
    if (value === undefined || value === null) {
      if ((schema.required || []).includes(key)) {
        return { valid: false, error: `Missing required input field: ${key}` };
      }
      continue;
    }
    const check = TYPE_CHECKS[propSchema.type];
    if (check && !check(value)) {
      return { valid: false, error: `Input field ${key} must be of type ${propSchema.type}.` };
    }
  }
  return { valid: true };
}

function normalize(toolName, toolVersion, ok, payload, startedAt) {
  const durationMs = Date.now() - startedAt;
  return {
    ok,
    tool: toolName,
    version: toolVersion,
    ...(ok ? { data: payload } : { error: payload }),
    durationMs,
    invokedAt: new Date().toISOString(),
  };
}

/**
 * Invoke a registered tool through the governed gateway path.
 *
 * @param {object} params
 * @param {string} params.toolName
 * @param {object} [params.input] — caller input (identity fields forbidden)
 * @param {object} params.context — { user, getRuntimeProfile }
 * @param {object} params.registry — a createToolRegistry() instance
 * @param {function} [params.onInvocation] — structured invocation metadata sink
 * @returns {Promise<{ok, tool, version, data?, error?, durationMs, invokedAt}>}
 */
export async function invokeToolCore({ toolName, input, context, registry, onInvocation }) {
  const startedAt = Date.now();
  const userId = context?.user?.id || null;

  const emit = (result, errorCategory) => {
    const meta = {
      toolName: typeof toolName === "string" ? toolName : null,
      toolVersion: result.version || null,
      userId,
      success: result.ok,
      durationMs: result.durationMs,
      errorCategory: errorCategory || null,
      timestamp: result.invokedAt,
    };
    try {
      if (typeof onInvocation === "function") onInvocation(meta);
    } catch {
      // an audit sink failure must never break the invocation path
    }
    return result;
  };

  // 1. Tool existence (unknown tools are rejected — no arbitrary execution)
  if (typeof toolName !== "string" || !registry.has(toolName)) {
    return emit(
      normalize(toolName, null, false, { code: TOOL_ERROR_CODES.TOOL_NOT_FOUND, message: `Unknown tool: ${String(toolName)}` }, startedAt),
      TOOL_ERROR_CODES.TOOL_NOT_FOUND
    );
  }
  const tool = registry.get(toolName);

  // 2. Lifecycle
  if (tool.enabled === false) {
    return emit(
      normalize(toolName, tool.version, false, { code: TOOL_ERROR_CODES.TOOL_DISABLED, message: `Tool ${toolName} is disabled.` }, startedAt),
      TOOL_ERROR_CODES.TOOL_DISABLED
    );
  }

  // 3. Authentication — every invocation operates in the authenticated
  //    user's context only.
  if (!userId) {
    return emit(
      normalize(toolName, tool.version, false, { code: TOOL_ERROR_CODES.AUTHENTICATION_REQUIRED, message: "Tool invocation requires an authenticated user." }, startedAt),
      TOOL_ERROR_CODES.AUTHENTICATION_REQUIRED
    );
  }

  // 4. Cross-user guard — caller-supplied identity is rejected before
  //    validation or execution.
  const suppliedIdentity = ownKeys(input).filter((k) => FORBIDDEN_IDENTITY_KEYS.includes(k));
  if (suppliedIdentity.length > 0) {
    return emit(
      normalize(
        toolName,
        tool.version,
        false,
        { code: TOOL_ERROR_CODES.FORBIDDEN_INPUT, message: `Identity is derived from the authenticated session — forbidden input field(s): ${suppliedIdentity.join(", ")}` },
        startedAt
      ),
      TOOL_ERROR_CODES.FORBIDDEN_INPUT
    );
  }

  // 5. Input validation
  const inputCheck = validateToolInput(tool.inputSchema || { type: "object", properties: {} }, input || {});
  if (!inputCheck.valid) {
    return emit(
      normalize(toolName, tool.version, false, { code: TOOL_ERROR_CODES.INVALID_INPUT, message: inputCheck.error }, startedAt),
      TOOL_ERROR_CODES.INVALID_INPUT
    );
  }

  // 6. Authorized invocation — handler receives the execution context only.
  try {
    const data = await tool.handler({
      user: context.user,
      input: input || {},
      getRuntimeProfile: context.getRuntimeProfile,
    });
    return emit(normalize(toolName, tool.version, true, data, startedAt), null);
  } catch (e) {
    return emit(
      normalize(
        toolName,
        tool.version,
        false,
        { code: TOOL_ERROR_CODES.TOOL_EXECUTION_ERROR, message: e?.message || "Tool execution failed." },
        startedAt
      ),
      TOOL_ERROR_CODES.TOOL_EXECUTION_ERROR
    );
  }
}
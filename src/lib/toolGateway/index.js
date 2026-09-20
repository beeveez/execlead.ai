/**
 * EXEC™ Tool Gateway™ (Phase 1)
 * ============================================================
 * Centralized governed tool abstraction for EXEC™:
 *
 *   EXEC™ → Executive Context → Tool Gateway™ → Authorized Tool →
 *   Existing Platform Service / Repository → Result → EXEC™
 *
 * Phase 1 registers exactly three read-only tools:
 *   • getExecutiveProfile   — canonical Executive Identity/Profile
 *   • getExecutiveReadiness — current Executive Readiness™
 *   • getExecutiveJourney   — current Executive Journey™ state
 *
 * Invariants:
 *   • Every invocation operates in the authenticated user's context;
 *     identity is derived from the execution context, never from input.
 *   • The gateway contains NO business logic — handlers delegate to the
 *     existing Executive Runtime Profile™ (the canonical source built from
 *     manageJourney, manageReputation, and the validated profile snapshot).
 *   • Existing RLS/tenant isolation applies underneath (SDK calls carry the
 *     user's token); the gateway never bypasses security controls.
 *   • Every invocation is audited (in-memory recent log + platform
 *     analytics pipeline). No payloads or secrets are stored.
 *
 * MCP PREPARATION: the tool contract in registry.js maps one-to-one onto a
 * future MCP tool definition. Phase 1 deliberately adds NO MCP dependency.
 *
 * FUTURE TOOLS: add a tool module under tools/, register it below, and
 * (optionally) extend the router — EXEC™ itself never changes.
 */
import { base44 } from "@/api/base44Client";
import { buildExecutiveRuntimeProfile } from "@/lib/executiveRuntimeProfile";
import { createToolRegistry } from "./registry.js";
import { invokeToolCore } from "./gatewayCore.js";
import { recordInvocation, getRecentInvocations, getLastInvocation } from "./audit.js";
import getExecutiveProfileTool from "./tools/getExecutiveProfile.js";
import getExecutiveReadinessTool from "./tools/getExecutiveReadiness.js";
import getExecutiveJourneyTool from "./tools/getExecutiveJourney.js";

export const TOOL_GATEWAY_VERSION = "1.0.0";

// ── Tool Registry (single registration point) ──
const registry = createToolRegistry();
registry.register(getExecutiveProfileTool);
registry.register(getExecutiveReadinessTool);
registry.register(getExecutiveJourneyTool);

export function listRegisteredTools() {
  return registry.list();
}

/**
 * Invoke a Tool Gateway™ tool.
 *
 * @param {string} toolName
 * @param {object} [input] — caller input; identity fields are forbidden
 * @param {object} options — { user, activeWorkspace, runtimeProfile? }
 *   runtimeProfile: an already-built Executive Runtime Profile™ to reuse
 *   (e.g. EXEC™'s cached context). When absent, the canonical builder is used.
 * @returns {Promise<{ok, tool, version, data?, error?, durationMs, invokedAt}>}
 */
export async function invokeTool(toolName, input = {}, options = {}) {
  const { user, activeWorkspace = null, runtimeProfile = null } = options;

  const context = {
    user: user || null,
    getRuntimeProfile: async () => {
      if (runtimeProfile) return runtimeProfile;
      if (!user?.id) throw new Error("Authentication required: no authenticated user.");
      const rp = await buildExecutiveRuntimeProfile(user, activeWorkspace);
      if (!rp) throw new Error("Executive Runtime Profile™ unavailable.");
      return rp;
    },
  };

  return invokeToolCore({
    toolName,
    input,
    context,
    registry,
    onInvocation: (meta) => {
      // In-memory recent log (Developer Workspace diagnostics)
      recordInvocation(meta);
      // Platform analytics pipeline — minimal properties, no payloads, no PII
      try {
        base44.analytics.track({
          eventName: "exec_tool_invocation",
          properties: {
            tool: meta.toolName,
            version: meta.toolVersion,
            success: meta.success,
            durationMs: meta.durationMs,
            errorCategory: meta.errorCategory,
          },
        });
      } catch {
        // analytics must never break the invocation path
      }
    },
  });
}

/** Gateway status snapshot for the Developer Workspace panel. */
export function getToolGatewayStatus() {
  return {
    version: TOOL_GATEWAY_VERSION,
    registeredTools: registry.list(),
    invocations: getRecentInvocations(20),
  };
}

export { getRecentInvocations, getLastInvocation };
export { matchToolIntent, formatToolResponse } from "./execToolRouter.js";
export { TOOL_ERROR_CODES, FORBIDDEN_IDENTITY_KEYS } from "./gatewayCore.js";
/**
 * Agent Orchestrator™ — EXEC™ Orchestration Router (Phase 2A)
 * ============================================================
 * Deliberately NARROW intent matching for EXEC™ → Agent Orchestrator™
 * delegation, plus structured response formatting.
 *
 * Phase 2A delegates ONLY multi-signal executive context requests that ask
 * for BOTH Executive Readiness™ AND Executive Journey™ context together —
 * requests a single registered agent can satisfy through the Tool Gateway™.
 *
 * Single-tool requests continue on the Phase 1 direct Tool Gateway™ path
 * (matchToolIntent), and every other request falls through to the normal
 * EXEC™ AI path. Orchestration is best-effort: on any failure, EXEC™'s
 * existing fallback behavior remains fully intact.
 *
 * Dependency-free by design.
 */

import { formatToolResponse } from "../toolGateway/execToolRouter.js";

const READINESS_PATTERNS = [/\breadiness\b/i, /\bhow ready am i\b/i];
const JOURNEY_PATTERNS = [/\bjourney\b/i, /\bleadership path\b/i, /\bwhere am i\b/i];

/**
 * Match a message that should be delegated to the registered test agent.
 * Requires BOTH a readiness signal AND a journey signal — anything less is
 * not an orchestration request.
 *
 * @returns {"executive_context_agent"|null}
 */
export function matchOrchestrationIntent(text) {
  const t = (text || "").toLowerCase();
  if (!t) return null;
  const wantsReadiness = READINESS_PATTERNS.some((p) => p.test(t));
  const wantsJourney = JOURNEY_PATTERNS.some((p) => p.test(t));
  if (!wantsReadiness || !wantsJourney) return null;
  return "executive_context_agent";
}

/**
 * Format an agent orchestration result into an EXEC™ response.
 * Reuses the Phase 1 per-tool formatters (single source of formatting truth).
 * Returns null when no tool succeeded — EXEC™ then falls back to the AI path.
 */
export function formatAgentResponse(data, agentMeta = {}) {
  if (!data || !Array.isArray(data.tools)) return null;
  const succeeded = data.tools.filter((t) => t.ok);
  if (succeeded.length === 0) return null;

  const sections = succeeded.map((t) => formatToolResponse(t.tool, t.data)).filter(Boolean);
  if (sections.length === 0) return null;

  const agentName = agentMeta.agent || "executive_context_agent";
  const agentVersion = agentMeta.agentVersion || "1.0.0";
  return (
    sections.join("\n\n---\n\n") +
    `\n\n_Delivered via the Agent Orchestrator™ → \`${agentName}\` v${agentVersion} → EXEC™ Tool Gateway™ (governed delegation · authenticated context only)._`
  );
}
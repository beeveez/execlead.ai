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

// Phase 2B — readiness ANALYSIS signals. A request routes to the
// executive_readiness_agent only when it carries BOTH a readiness signal AND
// an analysis/synthesis signal. Simple factual retrieval ("what's my
// readiness score") has no analysis signal and stays on the Phase 1 direct
// Tool Gateway™ path (matchToolIntent).
const READINESS_ANALYSIS_PATTERNS = [
  /\bwhy\b.*\breadiness\b|\breadiness\b.*\bwhy\b/i,
  /\bevidence\b.*\b(readiness|supports?|state|current)\b/i,
  /\b(biggest|main|key|major)\s+gaps?\b/i,
  /\bwhat\s+should\s+i\s+work\s+on\b/i,
  /\bwork\s+on\s+next\b/i,
  /\banaly[sz]e?s?\b.*\breadiness\b|\breadiness\b.*\banaly[sz]e?s?\b/i,
  // Routing-precedence fix: development-plan / development-action requests
  // grounded in the member's readiness are leadership analysis (the broad
  // commercial fallback previously claimed bare "plan" as pricing).
  /\b(development|leadership|growth)\s+(actions?|plan|priorities)\b/i,
];

/**
 * Match a message that should be delegated to a registered agent.
 *
 * Order matters:
 *   1. BOTH a readiness signal AND a journey signal → executive_context_agent
 *      (multi-signal context retrieval, Phase 2A — unchanged).
 *   2. A readiness signal AND an analysis/synthesis signal (why / evidence /
 *      gaps / what should I work on next / analyse) → executive_readiness_agent
 *      (readiness ANALYSIS, Phase 2B).
 *
 * Everything else returns null: single-tool factual requests continue on the
 * Phase 1 direct Tool Gateway™ path, and all other requests fall through to
 * the normal EXEC™ AI path.
 *
 * @returns {"executive_context_agent"|"executive_readiness_agent"|null}
 */
export function matchOrchestrationIntent(text) {
  const t = (text || "").toLowerCase();
  if (!t) return null;
  const wantsReadiness = READINESS_PATTERNS.some((p) => p.test(t));
  const wantsJourney = JOURNEY_PATTERNS.some((p) => p.test(t));
  if (wantsReadiness && wantsJourney) return "executive_context_agent";
  if (wantsReadiness && READINESS_ANALYSIS_PATTERNS.some((p) => p.test(t))) {
    return "executive_readiness_agent";
  }
  return null;
}

function gapLine(g) {
  if (g.type === "competency_development") {
    return `• ${g.label} — ${g.value} (competency development opportunity — AI synthesis derived from the measured value)`;
  }
  if (g.type === "incomplete_verification") {
    return `• ${g.description} (verified platform data)`;
  }
  return `• ${g.description} (${g.type.replace(/_/g, " ")} — verified platform data)`;
}

function priorityLine(p) {
  if (p.dimension) return `${p.label} (${p.value})`;
  return `${p.evidence_source} — raise evidence coverage (currently ${p.coverage}%)`;
}

/**
 * Format an executive_readiness_agent result into an EXEC™ response.
 *
 * Fail-closed rule: the readiness source itself (getExecutiveReadiness) must
 * have succeeded — a readiness analysis without the authoritative readiness
 * source is never presented; EXEC™ falls back to the AI path instead.
 * Unavailable data is stated as unavailable, never estimated.
 */
function formatReadinessAnalysisResponse(data, agentMeta = {}) {
  const a = data.analysis;
  const readinessOk = (data.tools || []).some((t) => t.tool === "getExecutiveReadiness" && t.ok);
  if (!a || !readinessOk) return null;

  const lines = ["**Executive Readiness™ Analysis**", ""];

  if (a.current_readiness) {
    lines.push(
      `**Current Executive Readiness™:** ${a.current_readiness.readinessScore}% — preserved exactly from the authoritative platform engine (never recalculated by the agent).`
    );
    if (a.current_readiness.lastUpdated) lines.push(`_Last updated: ${a.current_readiness.lastUpdated}_`);
  } else {
    lines.push(
      "**Current Executive Readiness™:** currently unavailable from the authoritative source — no value is invented here."
    );
  }

  const ev = a.evidence_summary || {};
  const evLines = [];
  if (a.evidence_coverage !== null && a.evidence_coverage !== undefined) {
    evLines.push(`• Overall evidence coverage: ${a.evidence_coverage}%`);
  }
  for (const s of ev.sources || []) {
    evLines.push(`• ${s.label || "Evidence source"}: ${s.coverage ?? "—"}% coverage (${s.evidence_class})`);
  }
  for (const d of ev.measured_dimensions || []) {
    evLines.push(`• ${d.label}: ${d.value} (measured)`);
  }
  if (evLines.length > 0) {
    lines.push("", "**Evidence Supporting Your Current State** (verified platform data)", evLines.join("\n"));
  } else {
    lines.push(
      "",
      "**Evidence Supporting Your Current State:** no evidence-source or dimension-level data is currently available from the authoritative source."
    );
  }
  if (ev.interpretation?.text) {
    lines.push(`\n_Interpretation (AI synthesis): ${ev.interpretation.text}_`);
  }

  if ((a.key_strengths || []).length > 0) {
    lines.push(
      "",
      "**Key Strengths** (AI synthesis derived from verified measurements)",
      a.key_strengths.map((s) => `• ${s.label} — ${s.value}`).join("\n")
    );
  }

  if ((a.key_gaps || []).length > 0) {
    lines.push("", "**Key Gaps**", a.key_gaps.map(gapLine).join("\n"));
  } else {
    lines.push("", "**Key Gaps:** none identified from the currently available platform data.");
  }

  if ((a.development_priorities || []).length > 0) {
    lines.push(
      "",
      "**Development Priorities**",
      a.development_priorities.map((p, i) => `${i + 1}. ${priorityLine(p)}`).join("\n")
    );
  }

  if ((a.recommended_actions || []).length > 0) {
    lines.push(
      "",
      "**Recommended Actions** — _AI-generated recommendations grounded in the retrieved platform data; not verified facts._",
      a.recommended_actions.map((r, i) => `${i + 1}. ${r.action}`).join("\n")
    );
  } else {
    lines.push(
      "",
      "**Recommended Actions:** not enough verified platform context is currently available to generate grounded recommendations."
    );
  }

  // Phase 3A — delegated evidence intelligence (governed 1-hop delegation)
  if (a.evidence_delegation?.ok && a.evidence_analysis) {
    const ea = a.evidence_analysis;
    const evLines2 = [];
    if (ea.evidence_summary?.overallCoverage != null) {
      evLines2.push(`• Overall evidence coverage: ${ea.evidence_summary.overallCoverage}%`);
    }
    if (ea.evidence_summary?.source_counts) {
      evLines2.push(
        `• Sources — fully documented: ${ea.evidence_summary.source_counts.verified}, partial: ${ea.evidence_summary.source_counts.partial}, missing/limited: ${ea.evidence_summary.source_counts.missing}`
      );
    }
    for (const v of ea.verified_evidence || []) evLines2.push(`• Fully documented: ${v.label} (${v.coverage}%)`);
    for (const p of ea.partial_evidence || []) evLines2.push(`• Partially documented: ${p.label} (${p.coverage}%)`);
    for (const m of ea.missing_evidence || []) evLines2.push(`• Missing/limited: ${m.label} (${m.coverage}%)`);
    if (
      evLines2.length > 0 ||
      (ea.evidence_gaps || []).length > 0 ||
      (ea.recommended_evidence_actions || []).length > 0
    ) {
      lines.push(
        "",
        `**Evidence Intelligence** (governed 1-hop delegation → executive_evidence_agent v${ea.agent_version || "1.0.0"} — read-only evidence analysis)`
      );
      if (evLines2.length > 0) lines.push(evLines2.join("\n"));
      if (ea.evidence_summary?.interpretation?.text) {
        lines.push(`\n_Interpretation (AI synthesis): ${ea.evidence_summary.interpretation.text}_`);
      }
      if ((ea.evidence_gaps || []).length > 0) {
        lines.push("", "**Evidence Gaps** (verified platform data)", ea.evidence_gaps.map((g) => `• ${g.description}`).join("\n"));
      }
      if ((ea.recommended_evidence_actions || []).length > 0) {
        lines.push(
          "",
          "**Recommended Evidence Actions** — _recommendations grounded in retrieved evidence; not verified facts._",
          ea.recommended_evidence_actions.map((r, i) => `${i + 1}. ${r.action}`).join("\n")
        );
      }
      if ((ea.unavailable_notes || []).length > 0) {
        lines.push("", `_Evidence notes: ${ea.unavailable_notes.join(" ")}_`);
      }
    }
  } else if (a.evidence_delegation && a.evidence_delegation.ok === false) {
    lines.push(
      "",
      `**Evidence Intelligence:** unavailable (${a.evidence_delegation.error_code}) — no evidence analysis is fabricated.`
    );
  }

  if (a.confidence) {
    lines.push(
      "",
      `**Analysis Confidence:** ${a.confidence.value}% (evidence coverage from the authoritative readiness engine — no independent confidence metric created).`
    );
  }

  if ((a.unavailable_notes || []).length > 0) {
    lines.push("", "**Unavailable Data** (stated, never estimated)", a.unavailable_notes.map((u) => `• ${u}`).join("\n"));
  }

  lines.push(
    "",
    "**Evidence Provenance**",
    (data.tools || [])
      .map((t) => (t.ok ? `• ${t.tool} — succeeded (verified platform data)` : `• ${t.tool} — unavailable (${t.error?.code || "failed"})`))
      .join("\n")
  );

  const agentName = agentMeta.agent || a.agent || "executive_readiness_agent";
  const agentVersion = agentMeta.agentVersion || a.agent_version || "1.0.0";
  lines.push(
    "",
    `_Delivered via the Agent Orchestrator™ → \`${agentName}\` v${agentVersion} → EXEC™ Tool Gateway™ (governed delegation · authenticated context only · readiness value preserved from the authoritative source)._`
  );
  return lines.join("\n");
}

/**
 * Format an agent orchestration result into an EXEC™ response.
 * Reuses the Phase 1 per-tool formatters (single source of formatting truth).
 * Returns null when no tool succeeded — EXEC™ then falls back to the AI path.
 */
export function formatAgentResponse(data, agentMeta = {}) {
  if (!data) return null;
  // Phase 2B — readiness analysis result
  if (data.analysis && data.analysis.agent === "executive_readiness_agent") {
    return formatReadinessAnalysisResponse(data, agentMeta);
  }
  if (!Array.isArray(data.tools)) return null;
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
/**
 * Agent Orchestrator™ — Production Agent: executive_evidence_agent (Phase 3A)
 * ============================================================
 * The third registered agent and the target of the FIRST controlled
 * multi-agent workflow: executive_readiness_agent → executive_evidence_agent
 * (bounded, structured, exactly one hop).
 *
 * It answers, for the authenticated member:
 *   What leadership evidence is currently available, what is fully
 *   documented, what is partial or missing, and what evidence gaps are most
 *   relevant to the requested readiness analysis?
 *
 * SOURCE-OF-TRUTH RULES (inviolable):
 *   • Evidence information comes EXCLUSIVELY from the authoritative
 *     EXECLEAD.AI sources surfaced by the governed Tool Gateway™
 *     (getExecutiveReadiness evidence coverage/sources; getExecutiveProfile
 *     verification status). No new evidence database, no competing evidence
 *     calculation system, no duplicated evidence logic.
 *   • The agent NEVER calculates or modifies Executive Readiness™. Any
 *     readiness values received as delegation context are context only and
 *     are never emitted, recalculated, or altered.
 *   • Provenance labeling is mandatory on every output item:
 *       - "verified_platform_data" — retrieved from the authoritative source
 *       - "ai_synthesis"          — interpretation derived from retrieved data
 *       - "recommendation"        — suggested evidence-development action
 *   • Nothing is invented: no achievements, certifications, competencies,
 *     leadership experience, verification status, evidence records, or
 *     organizational context. Unavailable evidence is stated as unavailable.
 *
 * DELEGATION RULES (inviolable):
 *   • This agent has NO allowedDelegations — it can NEVER delegate to
 *     another agent (delegation depth is capped at 1 by the orchestrator).
 *   • It never receives a caller-controlled user ID or tenant ID — it
 *     inherits the immutable authenticated execution context.
 *   • Read-only: no mutation tools, no administrative tools, no cross-user
 *     tools. It operates only through Agent Orchestrator™ → Tool Gateway™.
 *
 * Dependency-free by design.
 */

const ALLOWED_TOOLS = Object.freeze([
  "getExecutiveProfile",
  "getExecutiveReadiness",
]);

// Display labels for the platform-computed dimension fields surfaced by
// getExecutiveReadiness (the authoritative source). No other dimensions exist.
const DIMENSION_LABELS = {
  interview_readiness: "Interview Readiness",
  promotion_readiness: "Promotion Readiness",
  leadership_maturity: "Leadership Maturity",
  executive_presence: "Executive Presence",
  commercial_maturity: "Commercial Maturity",
};

const DOCUMENTED_MIN = 70; // evidence coverage considered fully documented
const PARTIAL_MIN = 40; // evidence coverage considered partial (below: missing)

function dimLabel(key) {
  return DIMENSION_LABELS[key] || key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

async function handler({ context, input, invokeTool }) {
  const requested = [...ALLOWED_TOOLS];
  const tools = [];
  const byTool = {};
  for (const toolName of requested) {
    const res = await invokeTool(toolName, {});
    byTool[toolName] = res;
    tools.push({
      tool: toolName,
      ok: res.ok === true,
      ...(res.ok ? { data: res.data } : { error: res.error }),
    });
  }

  // ── Retrieved authoritative data (or explicit absence) ──
  const readiness = byTool.getExecutiveReadiness?.ok ? byTool.getExecutiveReadiness.data : null;
  const profile = byTool.getExecutiveProfile?.ok ? byTool.getExecutiveProfile.data : null;

  const unavailable = [];
  if (!readiness) {
    unavailable.push(
      "Evidence coverage data could not be retrieved from the authoritative source — evidence sections are omitted rather than estimated."
    );
  }
  if (!profile) {
    unavailable.push("Executive Profile data could not be retrieved — verification status is omitted.");
  }

  const overallCoverage = readiness?.evidence?.overallCoverage ?? null;
  const evidenceSources = Array.isArray(readiness?.evidence?.sources) ? readiness.evidence.sources : [];
  const dimEntries = Object.entries(readiness?.dimensions || {}).filter(
    ([, v]) => typeof v === "number"
  );

  if (readiness && evidenceSources.length === 0) {
    unavailable.push("No evidence-source coverage data is currently available from the authoritative source.");
  }
  if (readiness && overallCoverage === null) {
    unavailable.push("Overall evidence coverage is not currently reported by the authoritative source.");
  }

  // ── Classification of retrieved evidence (verified platform data) ──
  const verified_evidence = [];
  const partial_evidence = [];
  const missing_evidence = [];
  const unquantified_evidence = [];
  for (const s of evidenceSources) {
    const item = {
      label: s.label || null,
      coverage: typeof s.coverage === "number" ? s.coverage : null,
      status: s.status || null,
      provenance: "verified_platform_data",
    };
    if (typeof s.coverage !== "number") {
      unquantified_evidence.push(item);
    } else if (s.coverage >= DOCUMENTED_MIN) {
      verified_evidence.push(item);
    } else if (s.coverage >= PARTIAL_MIN) {
      partial_evidence.push(item);
    } else {
      missing_evidence.push(item);
    }
  }

  // ── Evidence gaps — grounded in retrieved data only ──
  const evidence_gaps = [
    ...missing_evidence.map((s) => ({
      gap_type: "missing_documentation",
      area: s.label,
      coverage: s.coverage,
      description: `${s.label} evidence is documented at only ${s.coverage}% coverage.`,
      provenance: "verified_platform_data",
    })),
    ...partial_evidence.map((s) => ({
      gap_type: "partial_documentation",
      area: s.label,
      coverage: s.coverage,
      description: `${s.label} evidence is only partially documented (${s.coverage}% coverage).`,
      provenance: "verified_platform_data",
    })),
    ...(profile && profile.identity && profile.identity.identityVerified === false
      ? [
          {
            gap_type: "incomplete_verification",
            area: "Identity Verification",
            coverage: null,
            description: "Executive identity verification is not complete.",
            provenance: "verified_platform_data",
          },
        ]
      : []),
  ];

  // ── Relevant dimensions — intersection of the requested analysis scope
  //    with the platform-computed measurements (never invented) ──
  const requestedDims = Array.isArray(input?.relevant_dimensions)
    ? input.relevant_dimensions.filter((d) => typeof d === "string")
    : [];
  const relevant_dimensions = dimEntries
    .filter(([k]) => requestedDims.length === 0 || requestedDims.includes(k))
    .map(([k, v]) => ({
      dimension: k,
      label: dimLabel(k),
      value: v,
      provenance: "verified_platform_data",
    }));

  // ── Recommended evidence-development actions (RECOMMENDATION provenance) ──
  const recommended_evidence_actions = [
    ...missing_evidence.slice(0, 3).map((s) => ({
      action: `Document additional evidence for ${s.label} to raise its coverage above ${PARTIAL_MIN}%.`,
      basis: { evidence_source: s.label, coverage: s.coverage },
      provenance: "recommendation",
    })),
    ...partial_evidence.slice(0, 2).map((s) => ({
      action: `Strengthen ${s.label} evidence documentation to move it from partial (${s.coverage}%) to fully documented.`,
      basis: { evidence_source: s.label, coverage: s.coverage },
      provenance: "recommendation",
    })),
  ];

  // ── Summary interpretation (AI synthesis of verified data) ──
  const interpretationParts = [];
  if (overallCoverage !== null) {
    interpretationParts.push(`Overall evidence coverage is ${overallCoverage}%.`);
  }
  if (evidenceSources.length > 0) {
    interpretationParts.push(
      `${verified_evidence.length} fully documented, ${partial_evidence.length} partial, and ${missing_evidence.length} missing/limited evidence source(s).`
    );
  }

  return {
    agent: "executive_evidence_agent",
    agent_version: "1.0.0",
    request_id: context?.requestId || null,
    generated_at: context?.requestedAt || null,
    requested_analysis: typeof input?.requested_analysis === "string" ? input.requested_analysis : "evidence_inventory",

    // Structured evidence intelligence
    evidence_summary: {
      overallCoverage,
      source_counts: {
        verified: verified_evidence.length,
        partial: partial_evidence.length,
        missing: missing_evidence.length,
        unquantified: unquantified_evidence.length,
      },
      interpretation:
        interpretationParts.length > 0
          ? { text: interpretationParts.join(" "), provenance: "ai_synthesis" }
          : null,
    },
    verified_evidence,
    partial_evidence,
    missing_evidence,
    unquantified_evidence,
    evidence_gaps,
    relevant_dimensions,
    recommended_evidence_actions,

    // Confidence = the authoritative evidence coverage, when reported.
    // No independent confidence metric is created.
    confidence:
      overallCoverage !== null
        ? {
            value: overallCoverage,
            basis: "evidence coverage reported by the authoritative readiness engine",
            provenance: "verified_platform_data",
          }
        : null,

    // Provenance of every source consulted — successes AND failures.
    provenance: {
      policy:
        "All evidence items are retrieved from authoritative EXECLEAD.AI sources via the Tool Gateway™; interpretation is labeled ai_synthesis; suggested actions are labeled recommendation. The agent never calculates or modifies Executive Readiness™.",
      evidence_references: tools.map((t) => ({
        tool: t.tool,
        status: t.ok ? "succeeded" : "failed",
        error_code: t.ok ? null : t.error?.code || null,
        provenance: t.ok ? "verified_platform_data" : "unavailable",
      })),
    },

    unavailable_notes: unavailable,

    tools,
    toolsRequested: requested,
    toolsSucceeded: tools.filter((t) => t.ok).map((t) => t.tool),
  };
}

const executiveEvidenceAgent = {
  name: "executive_evidence_agent",
  displayName: "Executive Evidence Agent",
  description:
    "Production specialized agent: analyzes the authenticated member's leadership evidence and evidence gaps (available, fully documented, partial, missing) from authoritative EXECLEAD.AI sources via the Tool Gateway™. Read-only evidence intelligence only — it never calculates or modifies Executive Readiness™, cites only retrievable evidence, distinguishes verified data from AI synthesis and recommendations, and states explicitly when evidence is unavailable. It has NO delegation rights (delegation depth is capped at 1) and never bypasses the Tool Gateway™.",
  purpose:
    "Target of the first governed multi-agent workflow — receives a structured, bounded 1-hop delegation from executive_readiness_agent and returns evidence intelligence for the readiness analysis. Remains responsible for evidence only; the readiness agent remains responsible for the final readiness analysis.",
  version: "1.0.0",
  enabled: true,
  requiredPermissions: Object.freeze(["authenticated"]),
  allowedTools: ALLOWED_TOOLS,
  timeoutMs: 8000,
  handlerName: "AgentOrchestrator.evidenceAnalysis",
  inputSchema: {
    type: "object",
    properties: {
      requested_analysis: {
        type: "string",
        description:
          "Type of evidence analysis requested by the delegating agent (e.g. evidence_gap_analysis). Defaults to evidence_inventory. Identity fields are forbidden and rejected by the orchestrator.",
      },
      relevant_dimensions: {
        type: "array",
        items: { type: "string" },
        description:
          "Optional subset of the platform's measured dimension keys the analysis is relevant to. Unknown dimensions are ignored — never invented. Defaults to all measured dimensions.",
      },
      readiness_context: {
        type: "object",
        description:
          "Non-authoritative context from the delegating agent (e.g. { readinessScore, evidenceCoverage }). Context only — never emitted, recalculated, or treated as evidence.",
      },
    },
    additionalProperties: false,
  },
  outputSchema: {
    type: "object",
    description:
      "{ agent, agent_version, requested_analysis, evidence_summary, verified_evidence[], partial_evidence[], missing_evidence[], evidence_gaps[], relevant_dimensions[], recommended_evidence_actions[], confidence, provenance, unavailable_notes[], tools[], toolsRequested[], toolsSucceeded[] }",
  },
  handler,
};

export default executiveEvidenceAgent;
export { ALLOWED_TOOLS as EXECUTIVE_EVIDENCE_AGENT_TOOLS };
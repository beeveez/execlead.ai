/**
 * Agent Orchestrator™ — Production Agent: executive_readiness_agent (Phase 2B)
 * ============================================================
 * The first real production specialized sub-agent. It is an
 * INTELLIGENCE/SYNTHESIS layer on top of the existing Executive Readiness™
 * engine — never a replacement for it.
 *
 * It answers four questions for the authenticated member:
 *   1. Where am I now?
 *   2. What evidence supports my current state?
 *   3. What are my meaningful gaps?
 *   4. What should I work on next?
 *
 * SOURCE-OF-TRUTH RULES (inviolable):
 *   • The Executive Readiness™ engine remains the SOLE source of readiness
 *     calculations and scores. The agent preserves the retrieved value
 *     EXACTLY — it never recalculates, invents, or alters a score, never
 *     creates a second readiness algorithm, a second evidence database, or a
 *     second gap-analysis engine.
 *   • Every cited evidence item comes from the authoritative Tool Gateway™
 *     sources. If data is unavailable, the agent SAYS it is unavailable —
 *     it never fabricates achievements, certifications, experience,
 *     competencies, evidence, scores, verification status, or employment.
 *   • Every output item carries a provenance label:
 *       - "verified_platform_data" — retrieved from the authoritative source
 *       - "ai_synthesis"           — interpretation derived from verified data
 *       - "recommendation"         — suggested action (never a verified fact)
 *
 * It performs NO mutations, has NO administrative or cross-user tools, and
 * can never bypass the Tool Gateway™ (the orchestrator enforces this
 * agent's allowed-tools whitelist; the gateway re-authorizes independently).
 *
 * Dependency-free by design.
 */

const ALLOWED_TOOLS = Object.freeze([
  "getExecutiveProfile",
  "getExecutiveReadiness",
  "getExecutiveJourney",
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

// Grounded development actions per measured dimension. Each references real
// EXECLEAD.AI modules and is always delivered as a RECOMMENDATION with the
// measurement that motivated it — never as a verified fact.
const DIMENSION_ACTIONS = {
  interview_readiness:
    "Practice executive interview simulations to generate verifiable interview evidence (Executive Simulator).",
  promotion_readiness:
    "Complete Executive Readiness™ assessment activities to strengthen promotion evidence.",
  leadership_maturity:
    "Work with the EXEC™ leadership coach to build documented leadership evidence.",
  executive_presence:
    "Use executive coaching and Decision Lab™ sessions to generate documented executive-presence evidence.",
  commercial_maturity:
    "Generate commercial decision evidence through the Executive Decision Lab™.",
};

const STRENGTH_THRESHOLD = 70; // measured dimension value considered a key strength
const LIMITED_EVIDENCE_BELOW = 40; // evidence coverage considered limited
const PARTIAL_EVIDENCE_BELOW = 70; // evidence coverage considered partial

function dimLabel(key) {
  return DIMENSION_LABELS[key] || key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Evidence classification — interpretation of a VERIFIED coverage number. */
function classifyCoverage(coverage) {
  if (typeof coverage !== "number") return "unquantified";
  if (coverage >= PARTIAL_EVIDENCE_BELOW) return "documented";
  if (coverage >= LIMITED_EVIDENCE_BELOW) return "partial";
  return "limited";
}

async function handler({ context, invokeTool }) {
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
  const journey = byTool.getExecutiveJourney?.ok ? byTool.getExecutiveJourney.data : null;

  const unavailable = [];
  if (!readiness) {
    unavailable.push(
      "Executive Readiness™ data could not be retrieved from the authoritative source — readiness sections are omitted rather than estimated."
    );
  }
  if (!profile) {
    unavailable.push("Executive Profile data could not be retrieved — verification status is omitted.");
  }
  if (!journey) {
    unavailable.push("Executive Journey™ data could not be retrieved — journey context is omitted.");
  }

  const score = readiness?.readinessScore ?? null;
  const overallCoverage = readiness?.evidence?.overallCoverage ?? null;
  const evidenceSources = Array.isArray(readiness?.evidence?.sources) ? readiness.evidence.sources : [];
  const dimEntries = Object.entries(readiness?.dimensions || {}).filter(
    ([, v]) => typeof v === "number"
  );

  if (readiness && score === null) {
    unavailable.push(
      "The Executive Readiness™ score is currently unavailable from the authoritative source — no value is invented."
    );
  }
  if (readiness && dimEntries.length === 0) {
    unavailable.push("No dimension-level readiness measurements are currently available.");
  }
  if (readiness && evidenceSources.length === 0) {
    unavailable.push("No evidence-source coverage data is currently available.");
  }
  if (readiness && overallCoverage === null) {
    unavailable.push("Overall evidence coverage is currently not reported by the authoritative source.");
  }

  // ── Synthesis (interpretation of verified data only) ──
  const sortedDims = [...dimEntries].sort((a, b) => a[1] - b[1]);
  const limitedEvidence = evidenceSources.filter(
    (s) => typeof s.coverage === "number" && s.coverage < LIMITED_EVIDENCE_BELOW
  );
  const partialEvidence = evidenceSources.filter(
    (s) => typeof s.coverage === "number" && s.coverage >= LIMITED_EVIDENCE_BELOW && s.coverage < PARTIAL_EVIDENCE_BELOW
  );
  const developmentDims = sortedDims.filter(([, v]) => v < STRENGTH_THRESHOLD);

  const interpretationParts = [];
  if (overallCoverage !== null) {
    interpretationParts.push(
      `Overall evidence coverage is ${overallCoverage}% — a ${classifyCoverage(overallCoverage)} evidence base.`
    );
  }
  if (dimEntries.length > 0) {
    interpretationParts.push(
      `${dimEntries.length} readiness dimension(s) carry platform-computed measurements.`
    );
  }

  const analysis = {
    agent: "executive_readiness_agent",
    agent_version: "1.0.0",
    request_id: context?.requestId || null,
    generated_at: context?.requestedAt || null,

    // 1. Where am I now? — VERIFIED, preserved EXACTLY, never recalculated.
    current_readiness:
      score !== null
        ? {
            readinessScore: score,
            source: readiness.sourceOfTruth,
            lastUpdated: readiness.lastUpdated,
            provenance: "verified_platform_data",
          }
        : null,
    readiness_source:
      "Executive Readiness™ engine — Executive Runtime Profile™ via Tool Gateway™ getExecutiveReadiness. The agent preserves the authoritative value exactly and never recalculates it.",

    // 2. What evidence supports my current state?
    evidence_summary: {
      overallCoverage,
      sources: evidenceSources.map((s) => ({
        label: s.label || null,
        coverage: typeof s.coverage === "number" ? s.coverage : null,
        evidence_class: classifyCoverage(s.coverage),
        status: s.status || null,
        provenance: "verified_platform_data",
      })),
      measured_dimensions: dimEntries.map(([k, v]) => ({
        dimension: k,
        label: dimLabel(k),
        value: v,
        provenance: "verified_platform_data",
      })),
      interpretation:
        interpretationParts.length > 0
          ? { text: interpretationParts.join(" "), provenance: "ai_synthesis" }
          : null,
    },
    evidence_coverage: overallCoverage,

    // Key strengths — AI synthesis FROM verified measurements.
    key_strengths: dimEntries
      .filter(([, v]) => v >= STRENGTH_THRESHOLD)
      .sort((a, b) => b[1] - a[1])
      .map(([k, v]) => ({
        dimension: k,
        label: dimLabel(k),
        value: v,
        provenance: "ai_synthesis",
        basis: "derived from the platform-computed measurement",
      })),

    // 3. What are my meaningful gaps? — grounded, never invented.
    key_gaps: [
      ...limitedEvidence.map((s) => ({
        type: "limited_evidence",
        description: `${s.label || "Evidence source"}: ${s.coverage}% evidence coverage`,
        provenance: "verified_platform_data",
      })),
      ...partialEvidence.map((s) => ({
        type: "partial_evidence",
        description: `${s.label || "Evidence source"}: ${s.coverage}% evidence coverage`,
        provenance: "verified_platform_data",
      })),
      ...(profile && profile.identity && profile.identity.identityVerified === false
        ? [
            {
              type: "incomplete_verification",
              description: "Executive identity is not yet verified.",
              provenance: "verified_platform_data",
            },
          ]
        : []),
      ...developmentDims.map(([k, v]) => ({
        type: "competency_development",
        dimension: k,
        label: dimLabel(k),
        value: v,
        provenance: "ai_synthesis",
        basis: "derived from the measured dimension value",
      })),
    ],

    // 4. What should I work on next? — priorities, then grounded recommendations.
    development_priorities: [
      ...developmentDims.map(([k, v]) => ({
        dimension: k,
        label: dimLabel(k),
        value: v,
        provenance: "ai_synthesis",
      })),
      ...limitedEvidence.map((s) => ({
        evidence_source: s.label || "Evidence source",
        coverage: s.coverage,
        provenance: "verified_platform_data",
      })),
    ],

    recommended_actions: [
      ...developmentDims.slice(0, 3).map(([k, v]) => ({
        action:
          DIMENSION_ACTIONS[k] ||
          `Generate additional evidence for ${dimLabel(k)} through platform activities (coaching, simulations, Decision Lab™).`,
        basis: { dimension: k, label: dimLabel(k), measured_value: v },
        provenance: "recommendation",
      })),
      ...limitedEvidence.slice(0, 2).map((s) => ({
        action: `Raise evidence coverage for ${s.label || "this source"} (currently ${s.coverage}%) by completing the associated evidence items.`,
        basis: { evidence_source: s.label || null, coverage: s.coverage },
        provenance: "recommendation",
      })),
    ],

    // Provenance of every source consulted — successes AND failures.
    evidence_references: tools.map((t) => ({
      tool: t.tool,
      status: t.ok ? "succeeded" : "failed",
      error_code: t.ok ? null : t.error?.code || null,
      provenance: t.ok ? "verified_platform_data" : "unavailable",
    })),

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

    unavailable_notes: unavailable,
  };

  return {
    analysis,
    tools,
    toolsRequested: requested,
    toolsSucceeded: tools.filter((t) => t.ok).map((t) => t.tool),
  };
}

const executiveReadinessAgent = {
  name: "executive_readiness_agent",
  displayName: "Executive Readiness Agent",
  description:
    "Production specialized agent: produces an evidence-grounded Executive Readiness™ development analysis (current state, supporting evidence, meaningful gaps, next development actions) for the authenticated member. The existing Executive Readiness™ engine remains the sole source of truth — this agent preserves the authoritative score exactly, cites only retrievable platform evidence, distinguishes verified data from AI synthesis and recommendations, and states explicitly when data is unavailable. Read-only; no mutations; no administrative or cross-user tools; never bypasses the Tool Gateway™.",
  purpose:
    "Delegates readiness ANALYSIS and SYNTHESIS requests from EXEC™ through the Agent Orchestrator™ to the governed Tool Gateway™ and the existing readiness, evidence, and journey sources.",
  version: "1.0.0",
  enabled: true,
  requiredPermissions: Object.freeze(["authenticated"]),
  allowedTools: ALLOWED_TOOLS,
  timeoutMs: 10000,
  handlerName: "AgentOrchestrator.readinessAnalysis",
  inputSchema: {
    type: "object",
    properties: {},
    additionalProperties: false,
  },
  outputSchema: {
    type: "object",
    description:
      "{ analysis { current_readiness, readiness_source, evidence_summary, evidence_coverage, key_strengths, key_gaps, development_priorities, recommended_actions, evidence_references, confidence, unavailable_notes }, tools[], toolsRequested[], toolsSucceeded[] }",
  },
  handler,
};

export default executiveReadinessAgent;
export { ALLOWED_TOOLS as EXECUTIVE_READINESS_AGENT_TOOLS };
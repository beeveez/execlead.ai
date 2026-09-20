/**
 * EXEC™ Tool Gateway™ — Tool: getExecutiveReadiness (Phase 1)
 * ============================================================
 * Retrieves the authenticated member's current Executive Readiness™.
 *
 * SOURCE OF TRUTH: the canonical resolved readiness from the Executive
 * Runtime Profile™ (profile.cached_readiness_score, produced by the
 * existing recomputeIntelligence pipeline). This tool NEVER recalculates
 * readiness independently and never invents values — absent dimensions
 * are returned as absent.
 *
 * Dependency-free by design.
 */

const getExecutiveReadinessTool = {
  name: "getExecutiveReadiness",
  description:
    "Retrieves the authenticated member's current Executive Readiness™ score, dimensions, evidence status, and major gaps where already computed.",
  purpose:
    "Gives EXEC™ governed read access to the member's Executive Readiness™ from the existing platform source of truth.",
  requiredPermissions: ["authenticated"],
  version: "1.0.0",
  enabled: true,
  handlerName: "ExecutiveRuntimeProfile.resolved.executiveReadiness",
  inputSchema: { type: "object", properties: {}, additionalProperties: false },
  outputSchema: {
    type: "object",
    description:
      "{ readinessScore, dimensions {}, evidence { overallCoverage, sources[] }, majorGaps[], lastUpdated, sourceOfTruth }",
  },
  handler: async (ctx) => {
    const rp = await ctx.getRuntimeProfile();
    if (!rp) throw new Error("Executive Runtime Profile™ unavailable.");
    const profile = rp.profile || {};

    // Dimensions — only where the existing platform has already computed them.
    const dimensionFields = [
      "interview_readiness",
      "promotion_readiness",
      "leadership_maturity",
      "executive_presence",
      "commercial_maturity",
    ];
    const dimensions = {};
    for (const f of dimensionFields) {
      if (typeof profile[f] === "number") dimensions[f] = profile[f];
    }

    // Evidence status — from the existing evidence coverage computation.
    const evidenceSources = Array.isArray(rp.evidence?.sources)
      ? rp.evidence.sources.map((s) => ({
          label: s.label || null,
          coverage: typeof s.coverage === "number" ? s.coverage : null,
          status: s.status || null,
        }))
      : [];

    // Major gaps — only where already computed (low evidence coverage).
    const majorGaps = evidenceSources
      .filter((s) => typeof s.coverage === "number" && s.coverage < 50)
      .map((s) => `${s.label}: ${s.coverage}% evidence coverage`);

    return {
      readinessScore: rp.resolved?.executiveReadiness ?? null,
      dimensions,
      evidence: {
        overallCoverage: rp.resolved?.evidenceCoverage ?? null,
        sources: evidenceSources,
      },
      majorGaps,
      lastUpdated: rp.loadedAt || null,
      sourceOfTruth:
        "Executive Runtime Profile™ — resolved from profile.cached_readiness_score (recomputeIntelligence). Never recalculated by the tool.",
    };
  },
};

export default getExecutiveReadinessTool;
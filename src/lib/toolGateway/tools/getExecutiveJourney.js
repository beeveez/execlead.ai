/**
 * EXEC™ Tool Gateway™ — Tool: getExecutiveJourney (Phase 1)
 * ============================================================
 * Retrieves the authenticated member's current Executive Journey™ state.
 *
 * SOURCE OF TRUTH: the existing manageJourney (compute) result carried by
 * the Executive Runtime Profile™. This tool NEVER creates a second
 * journey calculation engine and never recomputes progression.
 *
 * Dependency-free by design.
 */

const getExecutiveJourneyTool = {
  name: "getExecutiveJourney",
  description:
    "Retrieves the authenticated member's current Executive Journey™ stage, progression, journey points, objectives, and next-stage information.",
  purpose:
    "Gives EXEC™ governed read access to the member's Executive Journey™ from the existing journey source of truth.",
  requiredPermissions: ["authenticated"],
  version: "1.0.0",
  enabled: true,
  handlerName: "ExecutiveRuntimeProfile.journey (manageJourney compute)",
  inputSchema: { type: "object", properties: {}, additionalProperties: false },
  outputSchema: {
    type: "object",
    description:
      "{ currentStage, journeyPoints, journeyLevel, progression { percent, progress, pointsToNext, nextStage }, currentObjectives[], estimatedDays, lastUpdated, sourceOfTruth }",
  },
  handler: async (ctx) => {
    const rp = await ctx.getRuntimeProfile();
    if (!rp) throw new Error("Executive Runtime Profile™ unavailable.");
    const journey = rp.journey || {};
    const level = journey.level || rp.resolved?.journeyLevel || {};

    return {
      currentStage: level?.current?.title || null,
      journeyPoints: rp.resolved?.journeyPoints ?? journey.totalPoints ?? null,
      journeyLevel: level || null,
      progression: {
        percent: level?.journeyPercent ?? null,
        progress: level?.progress ?? null,
        pointsToNext: level?.pointsToNext ?? null,
        nextStage: level?.next?.title || null,
      },
      currentObjectives: Array.isArray(journey.recommendations)
        ? journey.recommendations.map((r) => ({ label: r.label || null, points: r.points ?? null }))
        : [],
      estimatedDays: journey.estimatedDays ?? null,
      lastUpdated: rp.loadedAt || null,
      sourceOfTruth:
        "Executive Runtime Profile™ — manageJourney (compute). Never recalculated by the tool.",
    };
  },
};

export default getExecutiveJourneyTool;
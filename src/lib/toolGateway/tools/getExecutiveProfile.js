/**
 * EXEC™ Tool Gateway™ — Tool: getExecutiveProfile (Phase 1)
 * ============================================================
 * Retrieves the authenticated member's canonical Executive Identity /
 * Profile information.
 *
 * SOURCE OF TRUTH: the Executive Runtime Profile™ supplied by the gateway
 * execution context (built from the existing manageReputation profile
 * snapshot + validated merges). This tool NEVER queries entities directly
 * and never creates a second profile data source. Identity is derived from
 * the authenticated execution context — a caller can never request another
 * user's profile.
 *
 * Dependency-free by design.
 */

const getExecutiveProfileTool = {
  name: "getExecutiveProfile",
  description:
    "Retrieves the authenticated member's canonical Executive Identity and profile information (structured data only).",
  purpose:
    "Gives EXEC™ governed read access to the member's Executive Profile without the member's data ever being recomputed or duplicated.",
  requiredPermissions: ["authenticated"],
  version: "1.0.0",
  enabled: true,
  handlerName: "ExecutiveRuntimeProfile.identity",
  inputSchema: { type: "object", properties: {}, additionalProperties: false },
  outputSchema: {
    type: "object",
    description:
      "{ identity, executivePassport { targetRole, targetCompany }, subscriptionPlan, runtimeProfileLoadedAt, sourceOfTruth }",
  },
  handler: async (ctx) => {
    const rp = await ctx.getRuntimeProfile();
    if (!rp) throw new Error("Executive Runtime Profile™ unavailable.");
    const profile = rp.profile || {};
    return {
      identity: rp.identity || null,
      executivePassport: {
        targetRole: profile.target_role || null,
        targetCompany: profile.target_company || null,
      },
      subscriptionPlan: profile.subscription_plan || null,
      runtimeProfileLoadedAt: rp.loadedAt || null,
      sourceOfTruth:
        "Executive Runtime Profile™ — the single canonical profile source (manageReputation profile snapshot, validated + conflict-resolved).",
    };
  },
};

export default getExecutiveProfileTool;
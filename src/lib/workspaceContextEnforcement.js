/**
 * EXEC™ Workspace Context Enforcement™
 * =====================================
 * Enforces strict workspace-first intelligence.
 *
 * The active workspace is the PRIMARY SOURCE OF TRUTH for:
 *   • Default persona
 *   • Default summary
 *   • Default recommendations
 *   • Default quick actions
 *   • Default terminology
 *   • Default KPIs
 *
 * Executive information never appears automatically while the
 * Developer Workspace is active. Cross-workspace content only
 * appears when the user explicitly requests a context switch.
 */

export const WORKSPACE_CONTEXTS = {
  executive: {
    id: "executive",
    persona: "Executive Coach™",
    defaultSummary: "Executive Leadership Summary",
    focus: [
      "Leadership Journey", "Leadership DNA™", "Executive Readiness™",
      "Executive Reputation™", "Promotion Forecast™", "Career Development",
    ],
    terminology: [
      "Journey Points", "Readiness Score", "Reputation Tier",
      "Leadership DNA", "Executive Passport", "Promotion Probability",
    ],
    kpis: [
      "Executive Readiness %", "Reputation Score",
      "Journey Level", "Promotion Probability",
    ],
  },
  developer: {
    id: "developer",
    persona: "Developer Copilot™",
    defaultSummary: "Developer Operations Summary",
    focus: [
      "Platform Health", "Foundation Certification™", "Platform Intelligence Quotient™",
      "Deployment Readiness", "Guardian™", "Platform State™", "Feature Flags",
      "Architecture", "Metadata", "Platform Governance", "Current Sprint",
      "Technical Recommendations",
    ],
    terminology: [
      "Platform Health Score", "PIQ", "Foundation Certified",
      "Guardian Findings", "Manifest Coverage", "Self-Healing",
    ],
    kpis: [
      "Platform Health", "PIQ Score", "Foundation Readiness %",
      "Deployment Status", "Guardian Status",
    ],
  },
  enterprise: {
    id: "enterprise",
    persona: "Enterprise Advisor™",
    defaultSummary: "Enterprise Executive Summary",
    focus: [
      "Organizations", "Users", "Seats", "Billing", "Identity",
      "Compliance", "Analytics", "Enterprise Intelligence",
    ],
    terminology: [
      "Seats", "Organizations", "Identity Verifications",
      "Enterprise Intelligence", "Succession Pipeline",
    ],
    kpis: [
      "Seat Utilization", "Organization Count",
      "Readiness Distribution", "High-Potential Talent",
    ],
  },
  platform: {
    id: "platform",
    persona: "Platform Administrator™",
    defaultSummary: "Platform Operations Summary",
    focus: [
      "Subscription Management", "Payment Settings", "Pricing Plans",
      "Feature Management", "Email Settings", "Membership Programs",
    ],
    terminology: [
      "Pricing Catalog", "Feature Flags", "Payment Provider",
      "Membership Program", "CPQ",
    ],
    kpis: [
      "Active Subscriptions", "Revenue",
      "Feature Adoption", "Email Delivery Rate",
    ],
  },
};

/**
 * Build the Workspace Context Enforcement™ directive for the active workspace.
 * Injected into EXEC™'s system prompt to enforce strict workspace isolation.
 *
 * @param {string} workspaceId - active workspace from persona.baseWorkspace
 * @returns {string} enforcement directive block
 */
export function buildEnforcementDirective(workspaceId) {
  const active = WORKSPACE_CONTEXTS[workspaceId] || WORKSPACE_CONTEXTS.executive;
  const others = Object.values(WORKSPACE_CONTEXTS).filter((c) => c.id !== active.id);

  return `WORKSPACE CONTEXT ENFORCEMENT™ — STRICT ISOLATION
==================================================
Active Workspace: ${active.id.toUpperCase()}
Active Persona: ${active.persona}
Default Summary: ${active.defaultSummary}

The active workspace is the PRIMARY SOURCE OF TRUTH for all responses.
It determines: default persona, default summary, recommendations, quick actions, terminology, and KPIs.

ALLOWED CONTENT FOR THIS WORKSPACE:
${active.focus.map((f) => `  • ${f}`).join("\n")}

ALLOWED TERMINOLOGY:
${active.terminology.map((t) => `  • ${t}`).join("\n")}

ALLOWED KPIs:
${active.kpis.map((k) => `  • ${k}`).join("\n")}

FORBIDDEN CONTENT (belongs to other workspaces — do NOT include unless the user explicitly requests a context switch):
${others.map((c) => `  • ${c.id.toUpperCase()}: ${c.focus.slice(0, 4).join(", ")}, ...`).join("\n")}

EXECUTIVE SUMMARY COMMAND:
When the user says "Executive Summary", "Give me a summary", or "Summary":
  • In the ${active.id.toUpperCase()} workspace → respond with "${active.defaultSummary}".
  • Never produce a different workspace's summary unless the user explicitly names it.

CONTEXT SWITCHING:
If the user explicitly requests information belonging to another workspace (e.g., "Show my Executive Journey" while in the Developer workspace):
  1. Acknowledge: "Switching to [workspace] context..."
  2. Display ONLY the requested information from that workspace.
  3. After completing the response, state: "Returning to ${active.id} workspace."
  4. Do NOT continue surfacing the other workspace's content in subsequent responses unless asked again.

RESPONSE VALIDATION — before EVERY response, verify:
  ✓ Active Workspace: ${active.id}
  ✓ Active Persona: ${active.persona}
  ✓ Active Module: (from page context below)
  ✓ Active Route: (from page context below)
  ✓ Active Knowledge Pack: (from workspace persona below)
  ✓ Active Recommendations: (from workspace persona below)
If any content in your draft response belongs to another workspace and the user did NOT explicitly request it: REMOVE IT before responding.

SUCCESS CRITERIA:
  • EXEC™ never mixes Executive, Developer, Enterprise, or Platform contexts.
  • Responses are always aligned with the active workspace unless the user explicitly requests a context switch.
  • The active workspace is the primary source of truth for summaries, recommendations, KPIs, terminology, and suggested actions.`;
}
/**
 * EXEC™ Tool Gateway™ — EXEC™ Tool Router (Phase 1)
 * ============================================================
 * Minimal intent matching so EXEC™ can determine when one of the three
 * Phase 1 tools is appropriate, plus structured-data response formatting.
 *
 * Scope is deliberately NARROW: only direct personal-data retrieval
 * questions route through the Tool Gateway™. Everything else falls through
 * to the normal EXEC™ AI path (which already receives the Executive
 * Runtime Profile™ in its prompt). Informational questions
 * ("what is executive readiness") and improvement questions
 * ("how can I improve my readiness") never match — every pattern requires
 * the possessive "my".
 *
 * Dependency-free by design.
 */

const TOOL_INTENTS = [
  {
    tool: "getExecutiveReadiness",
    patterns: [
      /\b(what'?s|what is|how'?s|how is)\s+my\s+(current\s+|executive\s+)?readiness\b/i,
      /\bmy\s+(executive\s+)?readiness\s+(score|level|status|right now|today)\b/i,
      /\b(check|show|tell me)\s+(me\s+)?my\s+(executive\s+)?readiness\b/i,
    ],
  },
  {
    tool: "getExecutiveJourney",
    patterns: [
      /\bwhere am i\s+(in|on)\s+(my\s+|the\s+)?(leadership\s+)?journey\b/i,
      /\b(show|check|what'?s|what is|tell me about)\s+(me\s+)?my\s+(leadership\s+)?journey\b/i,
      /\bmy\s+(leadership\s+)?journey\s+(stage|progress|points|status)\b/i,
    ],
  },
  {
    tool: "getExecutiveProfile",
    patterns: [
      /\b(show|view|see|check|what'?s|what is|tell me about)\s+(me\s+)?my\s+(executive\s+)?profile\b/i,
    ],
  },
];

export function matchToolIntent(text) {
  const t = (text || "").toLowerCase();
  if (!t) return null;
  for (const intent of TOOL_INTENTS) {
    if (intent.patterns.some((p) => p.test(t))) return intent.tool;
  }
  return null;
}

function fmt(v) {
  return v === null || v === undefined || v === "" ? "—" : String(v);
}

export function formatToolResponse(toolName, data) {
  if (!data) return null;

  let body = "";
  if (toolName === "getExecutiveProfile") {
    const id = data.identity || {};
    const passport = data.executivePassport || {};
    body = `**Executive Profile**\n\n` +
      `• Name: **${fmt(id.fullName)}**\n` +
      `• Headline: ${fmt(id.professionalHeadline)}\n` +
      `• Current Role: ${fmt(id.currentRole)}${id.currentCompany ? ` @ ${id.currentCompany}` : ""}\n` +
      `• Industry: ${fmt(id.industry)}${id.country ? ` · ${id.country}` : ""}\n` +
      `• Target Role: ${fmt(passport.targetRole)}\n` +
      `• Target Company: ${fmt(passport.targetCompany)}\n` +
      `• Identity Verified: ${id.identityVerified ? "Yes" : "No"}\n` +
      `• Membership Plan: ${fmt(data.subscriptionPlan)}`;
  } else if (toolName === "getExecutiveReadiness") {
    const dimLines = Object.entries(data.dimensions || {})
      .map(([k, v]) => `• ${k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}: ${v}`)
      .join("\n");
    const gapLines = (data.majorGaps || []).map((g) => `• ${g}`).join("\n");
    body = `**Executive Readiness™**\n\n` +
      `• Current Readiness: **${data.readinessScore ?? "—"}%**\n` +
      `• Evidence Coverage: ${data.evidence?.overallCoverage ?? "—"}%\n` +
      (dimLines ? `\n**Dimensions (where measured)**\n${dimLines}\n` : "") +
      (gapLines ? `\n**Major Gaps (where computed)**\n${gapLines}\n` : "") +
      `\n_Last updated: ${fmt(data.lastUpdated)}_`;
  } else if (toolName === "getExecutiveJourney") {
    const prog = data.progression || {};
    const objLines = (data.currentObjectives || [])
      .map((o) => `• ${o.label}${o.points ? ` (+${o.points} pts)` : ""}`)
      .join("\n");
    body = `**Executive Journey™**\n\n` +
      `• Current Stage: **${fmt(data.currentStage)}**\n` +
      `• Journey Points: **${fmt(data.journeyPoints?.toLocaleString ? data.journeyPoints.toLocaleString() : data.journeyPoints)}**\n` +
      `• Progress: ${prog.percent ?? "—"}% complete${prog.pointsToNext != null ? ` · ${prog.pointsToNext.toLocaleString()} points to ${fmt(prog.nextStage)}` : ""}\n` +
      (data.estimatedDays != null ? `• Estimated ~${data.estimatedDays} days to next stage\n` : "") +
      (objLines ? `\n**Recommended Next Activities**\n${objLines}` : "");
  } else {
    return null;
  }

  return `${body}\n\n_Retrieved via the EXEC™ Tool Gateway™ — \`${toolName}\` v1.0.0 · Source: Executive Runtime Profile™ (single source of truth)._`;
}
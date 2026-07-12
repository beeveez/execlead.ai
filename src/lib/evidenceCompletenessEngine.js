/**
 * Evidence Completeness Engine™
 * ============================================================
 * Computes evidence coverage across every EXECLEAD.AI data source
 * before EXEC™ generates a response.
 *
 * Every EXEC™ response begins by calculating current evidence
 * coverage, then continues answering based on available evidence,
 * clearly stating where additional data would improve precision.
 *
 * Pure function — no side effects. Takes userContext and returns
 * a structured evidence report.
 */

/**
 * Compute evidence coverage from live user context.
 *
 * @param {object} userContext - { profile, reputation, journey }
 * @returns {{ sources, overallConfidence, gaps, topGaps }}
 */
export function computeEvidenceCoverage(userContext) {
  const profile = userContext?.profile || {};
  const reputation = userContext?.reputation || {};
  const journey = userContext?.journey;

  const sources = [
    {
      id: "resume",
      label: "Resume",
      coverage: profile.resume_url ? 100 : 0,
      weight: 12,
      detail: profile.resume_url ? "Resume uploaded and processed" : "No resume on file",
      improveAction: profile.resume_url ? null : { label: "Upload Resume", path: "/resume" },
    },
    {
      id: "career_history",
      label: "Career History",
      coverage: profile.experience_json ? 100 : 0,
      weight: 10,
      detail: profile.experience_json ? "Career history documented" : "No career history recorded",
      improveAction: profile.experience_json ? null : { label: "Add Experience", path: "/profile" },
    },
    {
      id: "journey",
      label: "Executive Journey™",
      coverage: journey && journey.totalPoints > 0 ? 100 : 0,
      weight: 10,
      detail: journey ? `Level: ${journey.level?.current?.title || "—"} (${journey.totalPoints?.toLocaleString() || 0} points)` : "Journey not started",
      improveAction: journey ? null : { label: "Start Journey", path: "/journey" },
    },
    {
      id: "readiness",
      label: "Executive Readiness™",
      coverage: profile.cached_readiness_score || profile.interview_readiness || 0,
      weight: 15,
      detail: `${profile.cached_readiness_score || profile.interview_readiness || 0}% readiness score`,
      improveAction: { label: "Improve Readiness", path: "/executive-readiness" },
    },
    {
      id: "leadership_dna",
      label: "Leadership DNA™",
      coverage: profile.leadership_maturity || 0,
      weight: 12,
      detail: profile.leadership_maturity > 0 ? `${profile.leadership_maturity}% leadership maturity` : "Assessment not completed",
      improveAction: { label: "Take Assessment", path: "/leadership-dna" },
    },
    {
      id: "competencies",
      label: "Competencies™",
      coverage: Math.min(100, Math.round(((profile.executive_presence || 0) + (profile.communication_growth || 0) + (profile.confidence || 0) + (profile.commercial_maturity || 0)) / 4)),
      weight: 10,
      detail: "Based on executive presence, communication, confidence, and commercial maturity",
      improveAction: { label: "Build Competencies", path: "/intelligence" },
    },
    {
      id: "simulation",
      label: "Simulation History",
      coverage: Math.min(100, (profile.challenges_completed || 0) * 20),
      weight: 8,
      detail: `${profile.challenges_completed || 0} simulations completed`,
      improveAction: { label: "Run Simulation", path: "/simulator" },
    },
    {
      id: "identity",
      label: "Identity Verification",
      coverage: profile.identity_verified ? 100 : 0,
      weight: 8,
      detail: profile.identity_verified ? "Identity verified" : "Not verified",
      improveAction: profile.identity_verified ? null : { label: "Verify Identity", path: "/identity-verification" },
    },
    {
      id: "academy",
      label: "Academy",
      coverage: Math.min(100, (profile.sessions_completed || 0) * 15),
      weight: 7,
      detail: `${profile.sessions_completed || 0} sessions completed`,
      improveAction: { label: "Continue Learning", path: "/academy" },
    },
    {
      id: "activity",
      label: "Platform Activity",
      coverage: Math.min(100, Math.max(profile.streak_days ? Math.min(100, profile.streak_days * 5) : 0, profile.xp_points ? Math.min(100, Math.round(profile.xp_points / 10)) : 0)),
      weight: 8,
      detail: `${profile.streak_days || 0} day streak, ${profile.xp_points?.toLocaleString() || 0} XP`,
      improveAction: { label: "View Dashboard", path: "/dashboard" },
    },
  ];

  const overallConfidence = Math.round(sources.reduce((sum, s) => sum + (s.coverage * s.weight / 100), 0));
  const gaps = sources.filter((s) => s.coverage < 50).sort((a, b) => a.coverage - b.coverage);
  const topGaps = gaps.slice(0, 3);

  return { sources, overallConfidence, gaps, topGaps };
}

/**
 * Format evidence coverage as a prompt section for EXEC™.
 * Injects into buildExecPrompt so EXEC™ reasons over evidence.
 */
export function formatEvidenceForPrompt(coverage) {
  if (!coverage) return "";

  const lines = coverage.sources.map(
    (s) => `• ${s.label}: ${s.coverage}%${s.coverage < 50 ? " ⚠️" : ""}`
  );

  const gapNote = coverage.topGaps.length > 0
    ? `\n\nEVIDENCE GAPS: ${coverage.topGaps.map((g) => `${g.label} (${g.coverage}%)`).join(", ")}.`
    : "";

  return `EVIDENCE COMPLETENESS ENGINE™:
Current Evidence Coverage:
${lines.join("\n")}
Overall Intelligence Confidence: ${coverage.overallConfidence}%
${gapNote}

EVIDENCE-BASED REASONING INSTRUCTION:
Ground every recommendation in available evidence. Where coverage is below 50%, clearly state what additional data would improve precision — e.g., "Completing your Leadership DNA™ assessment would strengthen my ability to recommend targeted competency development." Never make recommendations based on unsupported assumptions. Prioritize actions backed by the highest evidence coverage. Always be transparent about confidence level.`;
}

/**
 * Format a brief evidence summary for the executive briefing.
 */
export function formatEvidenceBriefing(coverage) {
  if (!coverage) return "";
  const gapLabels = coverage.topGaps.map((g) => g.label);
  if (gapLabels.length > 0) {
    return `**Evidence Confidence: ${coverage.overallConfidence}%** — strengthen precision by adding: ${gapLabels.join(", ")}`;
  }
  return `**Evidence Confidence: ${coverage.overallConfidence}%** — strong evidence base across all sources`;
}
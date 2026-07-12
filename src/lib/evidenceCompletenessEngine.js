/**
 * Evidence Completeness Engine™ v2.0
 * ============================================================
 * Weighted evidence coverage across ALL available data sources.
 *
 * ARCHITECTURE:
 *   Each evidence source contributes INDEPENDENTLY to the overall
 *   coverage. A missing source reduces confidence — it NEVER
 *   zeroes out the result. EXEC™ always coaches with available
 *   evidence and notes where additional data improves precision.
 *
 *   Coverage is based on whether EVIDENCE EXISTS, not on score
 *   values. A LeadershipDNA record existing = 100% coverage for
 *   that source, regardless of what the denormalized
 *   profile.leadership_maturity field says.
 */

/**
 * Compute weighted evidence coverage from live user context.
 *
 * @param {object} userContext - { profile, journey, leadershipDNA, competencies, simulations, lessonProgress, loadErrors, activeWorkspace }
 * @returns {{ sources, overallCoverage, behavioralConfidence, careerConfidence, leadershipConfidence, recommendationConfidence, hasAnyData, diagnostics, topGaps }}
 */
export function computeEvidenceCoverage(userContext) {
  const profile = userContext?.profile || {};
  const journey = userContext?.journey;
  const leadershipDNA = userContext?.leadershipDNA;
  const competencies = userContext?.competencies || [];
  const simulations = userContext?.simulations || [];
  const lessonProgress = userContext?.lessonProgress || [];
  const loadErrors = userContext?.loadErrors || {};
  const activeWorkspace = userContext?.activeWorkspace;

  // ── Helper: profile field completeness ──
  const fieldCompleteness = (fields) => {
    const filled = fields.filter((f) => profile[f] !== undefined && profile[f] !== null && profile[f] !== "").length;
    return Math.round((filled / fields.length) * 100);
  };

  // ── 15 Evidence Sources (weights sum to 100) ──
  const sources = [
    {
      id: "resume",
      label: "Resume",
      coverage: profile.resume_url ? 100 : 0,
      weight: 14,
      status: loadErrors.resume ? "failed" : (profile.resume_url ? "available" : "missing"),
      detail: profile.resume_url ? "Resume uploaded and processed" : "No resume on file",
      improveAction: profile.resume_url ? null : { label: "Upload Resume", path: "/resume" },
    },
    {
      id: "career_history",
      label: "Career History",
      coverage: profile.experience_json ? 100 : 0,
      weight: 7,
      status: profile.experience_json ? "available" : "missing",
      detail: profile.experience_json ? "Career history documented" : "No career history recorded",
      improveAction: profile.experience_json ? null : { label: "Add Experience", path: "/profile" },
    },
    {
      id: "journey",
      label: "Executive Journey™",
      coverage: journey && (journey.totalPoints > 0 || journey.level) ? 100 : 0,
      weight: 12,
      status: journey ? "available" : "missing",
      detail: journey ? `Level: ${journey.level?.current?.title || "—"} (${journey.totalPoints?.toLocaleString() || 0} points)` : "Journey not started",
      improveAction: journey ? null : { label: "Start Journey", path: "/journey" },
    },
    {
      id: "readiness",
      label: "Executive Readiness™",
      coverage: profile.cached_readiness_score || leadershipDNA?.executive_readiness_score || profile.interview_readiness || 0,
      weight: 12,
      status: (profile.cached_readiness_score || leadershipDNA?.executive_readiness_score || profile.interview_readiness) > 0 ? "available" : "missing",
      detail: `${profile.cached_readiness_score || leadershipDNA?.executive_readiness_score || profile.interview_readiness || 0}% readiness score`,
      improveAction: { label: "Improve Readiness", path: "/executive-readiness" },
    },
    {
      id: "passport",
      label: "Executive Passport™",
      coverage: fieldCompleteness(["target_role", "target_company", "professional_headline", "current_company", "industry", "years_experience"]),
      weight: 8,
      status: "available",
      detail: "Profile completeness for Executive Passport™",
      improveAction: { label: "Complete Profile", path: "/profile" },
    },
    {
      id: "leadership_dna",
      label: "Leadership DNA™",
      coverage: leadershipDNA ? 100 : 0,
      weight: 10,
      status: loadErrors.leadershipDNA ? "failed" : (leadershipDNA ? "available" : "missing"),
      detail: leadershipDNA ? `Assessment complete — archetype: ${leadershipDNA.leadership_archetype || "—"}` : "Assessment not completed",
      improveAction: leadershipDNA ? null : { label: "Take Assessment", path: "/leadership-dna" },
    },
    {
      id: "competencies",
      label: "Executive Competencies™",
      coverage: Math.min(100, competencies.length * 20),
      weight: 10,
      status: loadErrors.competencies ? "failed" : (competencies.length > 0 ? "available" : "missing"),
      detail: `${competencies.length} verified competencies`,
      improveAction: { label: "Build Competencies", path: "/intelligence" },
    },
    {
      id: "simulator",
      label: "Executive Simulator™",
      coverage: Math.min(100, simulations.length * 25),
      weight: 8,
      status: loadErrors.simulations ? "failed" : (simulations.length > 0 ? "available" : "missing"),
      detail: `${simulations.length} simulation sessions completed`,
      improveAction: { label: "Run Simulation", path: "/simulator" },
    },
    {
      id: "academy",
      label: "Academy Progress",
      coverage: Math.min(100, Math.max(lessonProgress.length * 25, (profile.sessions_completed || 0) * 15)),
      weight: 5,
      status: loadErrors.lessonProgress ? "failed" : ((lessonProgress.length > 0 || (profile.sessions_completed || 0) > 0) ? "available" : "missing"),
      detail: `${lessonProgress.length} lessons, ${profile.sessions_completed || 0} sessions`,
      improveAction: { label: "Continue Learning", path: "/academy" },
    },
    {
      id: "certifications",
      label: "Certifications",
      coverage: profile.certifications_json ? 100 : 0,
      weight: 3,
      status: profile.certifications_json ? "available" : "missing",
      detail: profile.certifications_json ? "Certifications documented" : "No certifications recorded",
      improveAction: profile.certifications_json ? null : { label: "Add Certifications", path: "/profile" },
    },
    {
      id: "activity",
      label: "Platform Activity",
      coverage: Math.min(100, Math.max(
        profile.streak_days ? Math.min(100, profile.streak_days * 5) : 0,
        profile.xp_points ? Math.min(100, Math.round(profile.xp_points / 10)) : 0,
      )),
      weight: 2,
      status: (profile.xp_points > 0 || profile.streak_days > 0) ? "available" : "missing",
      detail: `${profile.streak_days || 0} day streak, ${profile.xp_points?.toLocaleString() || 0} XP`,
      improveAction: { label: "View Dashboard", path: "/dashboard" },
    },
    {
      id: "identity",
      label: "Identity Verification",
      coverage: profile.identity_verified ? 100 : 0,
      weight: 3,
      status: profile.identity_verified ? "available" : "missing",
      detail: profile.identity_verified ? "Identity verified" : "Not verified",
      improveAction: profile.identity_verified ? null : { label: "Verify Identity", path: "/identity-verification" },
    },
    {
      id: "organization",
      label: "Organization Context",
      coverage: profile.organization_id ? 100 : 0,
      weight: 3,
      status: profile.organization_id ? "available" : "missing",
      detail: profile.organization_id ? "Organization linked" : "No organization",
      improveAction: null,
    },
    {
      id: "workspace",
      label: "Workspace Context",
      coverage: activeWorkspace ? 100 : 100,
      weight: 2,
      status: "available",
      detail: activeWorkspace ? `Active: ${activeWorkspace}` : "Default workspace active",
      improveAction: null,
    },
    {
      id: "executive_identity",
      label: "Executive Identity™",
      coverage: fieldCompleteness(["preferred_name", "professional_headline", "current_role", "current_company", "linkedin_url"]),
      weight: 1,
      status: "available",
      detail: "Executive identity profile completeness",
      improveAction: { label: "Complete Profile", path: "/profile" },
    },
  ];

  // ── Has any data? (Never return 0% if user has any evidence) ──
  const hasAnyData = !!(
    profile.id || profile.target_role || profile.resume_url || profile.experience_json ||
    journey || leadershipDNA || competencies.length > 0 || simulations.length > 0 ||
    lessonProgress.length > 0 || (profile.xp_points > 0) || profile.organization_id
  );

  if (!hasAnyData) {
    return {
      sources: sources.map((s) => ({ ...s, coverage: 0, status: s.status === "failed" ? "failed" : "missing" })),
      overallCoverage: 0,
      behavioralConfidence: 0,
      careerConfidence: 0,
      leadershipConfidence: 0,
      recommendationConfidence: 0,
      hasAnyData: false,
      diagnostics: { available: [], missing: sources, failed: sources.filter((s) => s.status === "failed") },
      gaps: sources,
      topGaps: sources.slice(0, 3),
    };
  }

  // ── Overall weighted coverage ──
  const overallCoverage = Math.round(sources.reduce((sum, s) => sum + (s.coverage * s.weight / 100), 0));

  // ── Confidence Dimensions ──
  const avg = (ids) => {
    const subset = sources.filter((s) => ids.includes(s.id));
    return Math.round(subset.reduce((sum, s) => sum + s.coverage, 0) / subset.length);
  };

  const behavioralConfidence = avg(["leadership_dna", "competencies", "simulator"]);
  const careerConfidence = avg(["resume", "career_history", "certifications", "academy"]);
  const leadershipConfidence = avg(["journey", "readiness", "passport", "identity"]);
  const recommendationConfidence = Math.round((overallCoverage + behavioralConfidence + careerConfidence + leadershipConfidence) / 4);

  // ── Diagnostics ──
  const available = sources.filter((s) => s.coverage > 0 && s.status !== "failed");
  const missing = sources.filter((s) => s.coverage === 0 && s.status !== "failed");
  const failed = sources.filter((s) => s.status === "failed");
  const topGaps = [...missing].sort((a, b) => b.weight - a.weight).slice(0, 3);

  return {
    sources,
    overallCoverage,
    behavioralConfidence,
    careerConfidence,
    leadershipConfidence,
    recommendationConfidence,
    hasAnyData: true,
    diagnostics: { available, missing, failed },
    gaps: missing,
    topGaps,
  };
}

/**
 * Format evidence coverage as a prompt section for EXEC™.
 * Coaching-first: missing evidence reduces confidence, never prevents coaching.
 */
export function formatEvidenceForPrompt(coverage) {
  if (!coverage) return "";

  const lines = coverage.sources.map((s) => {
    const flag = s.status === "failed" ? " (LOAD FAILED)" : s.coverage < 50 ? " ⚠️" : "";
    return `• ${s.label}: ${s.coverage}%${flag}`;
  });

  const gapNote = coverage.topGaps.length > 0
    ? `\n\nEVIDENCE GAPS (highest impact): ${coverage.topGaps.map((g) => `${g.label} (${g.coverage}%)`).join(", ")}.`
    : "\n\nNo significant evidence gaps — strong evidence base across all sources.";

  return `EVIDENCE COMPLETENESS ENGINE™:
Current Evidence Coverage:
${lines.join("\n")}

Overall Evidence Coverage: ${coverage.overallCoverage}%
Behavioral Confidence: ${coverage.behavioralConfidence}%
Career Confidence: ${coverage.careerConfidence}%
Leadership Confidence: ${coverage.leadershipConfidence}%
Recommendation Confidence: ${coverage.recommendationConfidence}%
${gapNote}

EVIDENCE-BASED COACHING INSTRUCTION:
You must ALWAYS answer using every available evidence source. Missing evidence reduces confidence — it NEVER prevents coaching. You must never refuse to coach because one evidence source is unavailable.

If a key source like Leadership DNA™ is missing, say: "I can provide a high-confidence recommendation based on your current evidence. Completing Leadership DNA™ will further improve behavioral precision."

Every recommendation must include:
- **Evidence Used**: which sources informed this recommendation
- **Evidence Missing**: which sources would improve precision (if any)
- **Confidence**: high / medium / low, based on available evidence
- **Why**: the reasoning behind the recommendation
- **Frameworks**: which EXECLEAD.AI frameworks apply (EELM™, ELIM™, EECF™, Leadership DNA™, Readiness, Reputation, Journey, Trust, Passport)
- **Knowledge Packs**: which knowledge packs were referenced
- **Expected Impact**: how this improves the user's executive readiness

Prioritize actions backed by the highest evidence coverage. Always be transparent about confidence level. Always provide value based on available evidence.`;
}

/**
 * Format a brief evidence summary for the executive briefing.
 */
export function formatEvidenceBriefing(coverage) {
  if (!coverage) return "";
  if (!coverage.hasAnyData) return "";
  const gapLabels = coverage.topGaps.map((g) => g.label);
  if (gapLabels.length > 0) {
    return `**Evidence Confidence: ${coverage.overallCoverage}%** (Behavioral ${coverage.behavioralConfidence}% • Career ${coverage.careerConfidence}% • Leadership ${coverage.leadershipConfidence}%) — strengthen precision by adding: ${gapLabels.join(", ")}`;
  }
  return `**Evidence Confidence: ${coverage.overallCoverage}%** — strong evidence base across all sources`;
}
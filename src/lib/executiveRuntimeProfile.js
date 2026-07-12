import { base44 } from "@/api/base44Client";
import { computeEvidenceCoverage } from "@/lib/evidenceCompletenessEngine";

/**
 * Executive Runtime Profile™
 * ============================================================
 * The single canonical context object injected into every EXEC™ response.
 *
 * ROOT CAUSE FIXED:
 *   Previously, EXEC™ read scattered data sources (manageReputation,
 *   manageJourney, LeadershipDNA, etc.) independently. If any source
 *   failed or a journey-triggered recompute raced with a reputation
 *   profile snapshot, EXEC™ saw contradictory values (e.g., Journey
 *   Points 1600 in one response, 0 in the next).
 *
 *   Now, ALL sources are loaded in a deterministic order, validated,
 *   merged, and conflict-resolved into ONE object. EXEC™ never queries
 *   entities itself — it receives only this profile.
 *
 * RUNTIME FLOW:
 *   Load entities → Validate → Merge → Resolve conflicts →
 *   Compute evidence coverage → Compute confidence → Return profile
 *
 * INVARIANTS:
 *   - Missing sources REDUCE confidence — they NEVER zero out the profile.
 *   - Validation failures surface diagnostics — never fabricated data.
 *   - Canonical resolved values are the single source of truth for
 *     Journey Points, Executive Readiness, and Evidence Coverage.
 */

const READINESS_CONFLICT_THRESHOLD = 5;

/**
 * Build the Executive Runtime Profile™ for a user.
 * @param {object} user - The authenticated user object (from AuthContext).
 * @param {string} activeWorkspace - The active workspace id.
 * @returns {Promise<object|null>} The canonical runtime profile, or null if no user.
 */
export async function buildExecutiveRuntimeProfile(user, activeWorkspace) {
  if (!user?.id) return null;

  const loadedAt = new Date().toISOString();
  const conflicts = [];
  const diagnostics = [];
  const loadErrors = {};

  // ── 1. LOAD (order matters) ──
  // Journey FIRST: manageJourney may trigger recomputeIntelligence which
  // updates cached_* fields on the UserProfile. Reputation SECOND: reads
  // the fresh profile snapshot. This eliminates the race where reputation's
  // profile predates a journey-triggered recompute.

  let journey = null;
  try {
    const journeyRes = await base44.functions.invoke("manageJourney", { action: "compute" });
    journey = journeyRes.data || journeyRes;
  } catch (e) {
    loadErrors.journey = e.message;
  }

  let reputation = null;
  let profile = null;
  let history = [];
  try {
    const res = await base44.functions.invoke("manageReputation", {
      action: "get_status",
      user_id: user.id,
    });
    const data = res.data || res;
    reputation = data?.reputation || null;
    profile = data?.profile || null;
    history = data?.history || [];
  } catch (e) {
    loadErrors.reputation = e.message;
  }

  let leadershipDNA = null;
  try {
    const dnaRes = await base44.entities.LeadershipDNA.list("-created_date", 1);
    leadershipDNA = dnaRes?.[0] || null;
  } catch (e) {
    loadErrors.leadershipDNA = e.message;
  }

  let competencies = [];
  try {
    competencies = await base44.entities.ExecutiveCompetency.list("-created_date", 50);
  } catch (e) {
    loadErrors.competencies = e.message;
  }

  let simulations = [];
  try {
    simulations = await base44.entities.SimulationSession.list("-created_date", 50);
  } catch (e) {
    loadErrors.simulations = e.message;
  }

  let lessonProgress = [];
  try {
    lessonProgress = await base44.entities.LessonProgress.list("-created_date", 50);
  } catch (e) {
    loadErrors.lessonProgress = e.message;
  }

  // ── 2. VALIDATE ──
  const validation = {
    profileLoaded: !!profile,
    journeyLoaded: !!journey,
    readinessLoaded: !!(profile?.cached_readiness_score || leadershipDNA?.executive_readiness_score || profile?.interview_readiness),
    identityLoaded: profile?.identity_verified !== undefined,
    workspaceLoaded: !!activeWorkspace,
    subscriptionLoaded: !!(profile?.subscription_plan),
    confidenceCalculated: false,
  };

  // ── 3. MERGE + 4. RESOLVE CONFLICTS ──
  // Journey points: prefer journey.totalPoints (newest, post-recompute).
  let resolvedJourneyPoints = 0;
  let resolvedJourneyLevel = null;
  if (journey?.totalPoints !== undefined && journey?.totalPoints !== null) {
    resolvedJourneyPoints = journey.totalPoints;
    resolvedJourneyLevel = journey.level || null;
    const cached = profile?.cached_journey_points;
    if (cached !== undefined && cached !== null && cached !== resolvedJourneyPoints) {
      conflicts.push({
        field: "journey_points",
        sourceA: "manageJourney",
        valueA: resolvedJourneyPoints,
        sourceB: "profile.cached_journey_points",
        valueB: cached,
        resolution: "preferred manageJourney (newest validated, post-recompute)",
      });
    }
  } else if (profile?.cached_journey_points) {
    resolvedJourneyPoints = profile.cached_journey_points;
    diagnostics.push("Journey loaded from profile cache fallback (manageJourney unavailable).");
  }

  // Executive Readiness: prefer profile.cached_readiness_score (canonical, from recomputeIntelligence).
  let resolvedReadiness = profile?.cached_readiness_score || 0;
  const dnaReadiness = leadershipDNA?.executive_readiness_score;
  if (dnaReadiness !== undefined && dnaReadiness !== null && Math.abs(dnaReadiness - resolvedReadiness) > READINESS_CONFLICT_THRESHOLD) {
    conflicts.push({
      field: "executive_readiness",
      sourceA: "profile.cached_readiness_score",
      valueA: resolvedReadiness,
      sourceB: "leadershipDNA.executive_readiness_score",
      valueB: dnaReadiness,
      resolution: "preferred cached_readiness_score (canonical computed value)",
    });
  }
  if (!resolvedReadiness && dnaReadiness) {
    resolvedReadiness = dnaReadiness;
  }

  // ── 5. COMPUTE EVIDENCE COVERAGE (from merged profile, never from a single source) ──
  const evidenceContext = {
    profile: profile || {},
    journey,
    leadershipDNA,
    competencies,
    simulations,
    lessonProgress,
    loadErrors,
    activeWorkspace,
  };
  const evidence = computeEvidenceCoverage(evidenceContext);

  // ── 6. COMPUTE CONFIDENCE ──
  const confidence = {
    overall: evidence.overallCoverage,
    behavioral: evidence.behavioralConfidence,
    career: evidence.careerConfidence,
    leadership: evidence.leadershipConfidence,
    recommendation: evidence.recommendationConfidence,
  };
  validation.confidenceCalculated = true;
  validation.allPassed = (
    validation.profileLoaded &&
    validation.journeyLoaded &&
    validation.readinessLoaded &&
    validation.workspaceLoaded &&
    validation.subscriptionLoaded &&
    validation.confidenceCalculated
  );

  // Surface diagnostics for failed loads
  Object.entries(loadErrors).forEach(([source, msg]) => {
    diagnostics.push(`Failed to load ${source}: ${msg}`);
  });
  if (!validation.allPassed) {
    const failed = Object.entries(validation)
      .filter(([k, v]) => k !== "allPassed" && k !== "confidenceCalculated" && !v)
      .map(([k]) => k);
    if (failed.length > 0) {
      diagnostics.push(`Validation failures: ${failed.join(", ")}.`);
    }
  }

  // ── 7. CREATE RUNTIME PROFILE ──
  return {
    loaded: true,
    schema: "Executive Runtime Profile™ v1.0",
    loadedAt,
    identity: {
      userId: user.id,
      fullName: user.full_name,
      email: user.email,
      preferredName: profile?.preferred_name || profile?.first_name || user.full_name?.split(" ")[0] || "",
      professionalHeadline: profile?.professional_headline || profile?.current_role || "",
      currentRole: profile?.current_role || "",
      currentCompany: profile?.current_company || "",
      industry: profile?.industry || "",
      country: profile?.country || "",
      identityVerified: profile?.identity_verified || false,
    },
    // Canonical resolved values — single source of truth
    resolved: {
      journeyPoints: resolvedJourneyPoints,
      journeyLevel: resolvedJourneyLevel,
      executiveReadiness: resolvedReadiness,
      evidenceCoverage: evidence.overallCoverage,
    },
    // Raw source data (for backward compat with prompt builders)
    profile: profile || {},
    reputation,
    journey,
    leadershipDNA,
    competencies,
    simulations,
    lessonProgress,
    // Computed
    evidence,
    confidence,
    // Integrity
    validation,
    conflicts,
    diagnostics,
    loadErrors,
    activeWorkspace,
  };
}

/**
 * Format the Executive Runtime Profile™ as the single canonical prompt block.
 * This replaces all scattered user-context injection.
 */
export function formatRuntimeProfileForPrompt(profile) {
  if (!profile) return "";

  const r = profile.resolved;
  const v = profile.validation;
  const e = profile.evidence;
  const c = profile.confidence;
  const id = profile.identity;

  let block = `EXECUTIVE RUNTIME PROFILE™ (SINGLE SOURCE OF TRUTH — ${profile.schema})
Loaded: ${profile.loadedAt}
Active Workspace: ${profile.activeWorkspace || "executive"}

VALIDATION CHECKLIST:
${v.profileLoaded ? "✓" : "✗"} Profile Loaded
${v.journeyLoaded ? "✓" : "✗"} Journey Loaded
${v.readinessLoaded ? "✓" : "✗"} Readiness Loaded
${v.identityLoaded ? "✓" : "✗"} Identity Loaded
${v.workspaceLoaded ? "✓" : "✗"} Workspace Loaded
${v.subscriptionLoaded ? "✓" : "✗"} Subscription Loaded
${v.confidenceCalculated ? "✓" : "✗"} Confidence Calculated
Validation: ${v.allPassed ? "PASSED" : "FAILED — see diagnostics below"}

CANONICAL RESOLVED VALUES (use these EXACT numbers in every response — never recompute, never fabricate):
• Journey Points: ${r.journeyPoints?.toLocaleString() || 0}
• Journey Level: ${r.journeyLevel?.current?.title || "Seed"}
• Executive Readiness: ${r.executiveReadiness}%
• Evidence Coverage: ${r.evidenceCoverage}%

CONFIDENCE SCORES:
• Overall: ${c.overall}%
• Behavioral: ${c.behavioral}%
• Career: ${c.career}%
• Leadership: ${c.leadership}%
• Recommendation: ${c.recommendation}%

EVIDENCE SOURCES:`;

  for (const s of e.sources) {
    const flag = s.status === "failed" ? " (LOAD FAILED)" : s.coverage < 50 ? " ⚠️" : "";
    block += `\n• ${s.label}: ${s.coverage}%${flag}`;
  }

  block += `\n\nEXECUTIVE IDENTITY:
• Name: ${id.fullName || "—"}
• Headline: ${id.professionalHeadline || "—"}
• Company: ${id.currentCompany || "—"}
• Industry: ${id.industry || "—"}
• Country: ${id.country || "—"}
• Identity Verified: ${id.identityVerified}`;

  if (profile.reputation) {
    const rep = profile.reputation;
    block += `\n\nEXECUTIVE REPUTATION: Score ${rep.reputation_score}, Tier: ${rep.reputation_tier}, Trend: ${rep.reputation_trend}, Sessions: ${rep.sessions_completed || 0}`;
  }

  if (profile.journey) {
    const j = profile.journey;
    block += `\n\nEXECUTIVE JOURNEY: Level ${j.level?.current?.title || "Seed"} (${j.totalPoints?.toLocaleString() || 0} points, ${j.level?.journeyPercent || 0}% complete).`;
    if (j.level?.next) {
      block += ` Next: ${j.level.next.title} — ${j.level.pointsToNext?.toLocaleString() || 0} points to go (${j.level.progress || 0}% progress, ~${j.estimatedDays || 0} days).`;
      if (j.recommendations?.length > 0) {
        block += ` Recommended activities: ${j.recommendations.map((rec) => `${rec.label} (+${rec.points} pts)`).join(", ")}.`;
      }
      block += ` When discussing journey, use these EXACT numbers.`;
    } else {
      block += ` Highest level reached — encourage mentoring and legacy building.`;
    }
  }

  block += `\n\nSUBSCRIPTION: ${profile.profile?.subscription_plan || "free"}`;

  if (profile.conflicts.length > 0) {
    block += `\n\nCONFLICTS RESOLVED (newest validated data preferred):`;
    for (const cf of profile.conflicts) {
      block += `\n• ${cf.field}: ${cf.sourceA}=${cf.valueA} vs ${cf.sourceB}=${cf.valueB} → ${cf.resolution}`;
    }
  }

  if (profile.diagnostics.length > 0) {
    block += `\n\nDIAGNOSTICS:`;
    for (const d of profile.diagnostics) {
      block += `\n⚠️ ${d}`;
    }
  }

  block += `\n\nCRITICAL RULES:
- Use ONLY the canonical resolved values above for Journey Points, Executive Readiness, and Evidence Coverage.
- NEVER report different numbers for the same metric across responses. These values are the single source of truth.
- If validation FAILED, acknowledge the gap transparently — do NOT fabricate or reset user state to zero.
- Missing evidence reduces confidence — it NEVER prevents coaching. State what is missing and how it affects precision.
- For decision analysis JSON, populate kpi_dashboard with the EXACT canonical resolved values above.`;

  return block;
}
/**
 * EXECLEAD.AI — Evidence Reliability Registry™
 * =================================================
 * The single source of truth for evidence trustworthiness.
 *
 * Executive Readiness should not treat all evidence equally.
 * A completed executive simulation carries greater evidentiary
 * weight than an unverified self-assessment. This registry defines
 * the base reliability of every evidence type — centrally managed,
 * never hardcoded inside modules.
 *
 * Every registry entry defines:
 *   • baseReliability  — the trust floor for this evidence type (0-100)
 *   • label            — human-readable evidence type
 *   • validationRules  — how this evidence is validated
 *   • owner            — accountable owner of the reliability definition
 *   • version          — registry version this entry belongs to
 *
 * Reliability grades:
 *   95–100  Authoritative
 *   85–94   Highly Reliable
 *   70–84   Reliable
 *   50–69   Moderately Reliable
 *   0–49    Low Reliability
 */

export const ERI_MODEL_VERSION = "ERI v1.0";
export const ERI_REGISTRY_VERSION = "ERI Registry v1.0";

// ── Reliability Grade Classification ──
export const ERI_GRADES = [
  { id: "authoritative", label: "Authoritative", min: 95, max: 100, color: "#f59e0b" },
  { id: "highly_reliable", label: "Highly Reliable", min: 85, max: 94, color: "#10b981" },
  { id: "reliable", label: "Reliable", min: 70, max: 84, color: "#0ea5e9" },
  { id: "moderate", label: "Moderately Reliable", min: 50, max: 69, color: "#8b5cf6" },
  { id: "low", label: "Low Reliability", min: 0, max: 49, color: "#ef4444" },
];

/**
 * The Evidence Reliability Registry™.
 * Maps evidence types to their base reliability, validation rules, and owner.
 * This is the single source of truth — modules reference this, never hardcode.
 */
export const RELIABILITY_REGISTRY = {
  // ── Authoritative (95–100): demonstrated, verified, enterprise-grade ──
  simulation_completed: {
    evidenceType: "simulation_completed",
    label: "Executive Simulation Passed",
    baseReliability: 100,
    validationRules: ["AI Evaluated", "Score Threshold", "Outcome Recorded"],
    adjustments: { difficulty: +2, aiConfidence: +1 },
    owner: "Readiness Engine",
    version: ERI_REGISTRY_VERSION,
  },
  assessment_passed: {
    evidenceType: "assessment_passed",
    label: "Leadership Assessment Passed",
    baseReliability: 100,
    validationRules: ["Score Threshold", "Pass Criteria Met"],
    adjustments: { difficulty: +2 },
    owner: "Academy",
    version: ERI_REGISTRY_VERSION,
  },
  achievement_unlocked: {
    evidenceType: "achievement_unlocked",
    label: "Enterprise Verified Achievement",
    baseReliability: 100,
    validationRules: ["Enterprise Verified", "Milestone Criteria Met"],
    adjustments: { enterpriseVerification: +5 },
    owner: "Achievements",
    version: ERI_REGISTRY_VERSION,
  },
  milestone_achieved: {
    evidenceType: "milestone_achieved",
    label: "Leadership Milestone Achieved",
    baseReliability: 100,
    validationRules: ["Journey Verified", "Stage Criteria Met"],
    adjustments: { enterpriseVerification: +3 },
    owner: "Journey Engine",
    version: ERI_REGISTRY_VERSION,
  },

  // ── Highly Reliable (85–94): system/AI verified ──
  council_decision: {
    evidenceType: "council_decision",
    label: "Executive Council Decision",
    baseReliability: 95,
    validationRules: ["Multi-Persona Deliberation", "Governance Recorded"],
    adjustments: { difficulty: +2 },
    owner: "Council Engine",
    version: ERI_REGISTRY_VERSION,
  },
  challenge_solved: {
    evidenceType: "challenge_solved",
    label: "System Verified Challenge",
    baseReliability: 97,
    validationRules: ["Score Threshold", "AI Evaluated"],
    adjustments: { aiConfidence: +1 },
    owner: "Challenge Engine",
    version: ERI_REGISTRY_VERSION,
  },
  debate_completed: {
    evidenceType: "debate_completed",
    label: "AI Validated Executive Debate",
    baseReliability: 94,
    validationRules: ["AI Validated", "Adversarial Score"],
    adjustments: { aiConfidence: +1 },
    owner: "Debate Engine",
    version: ERI_REGISTRY_VERSION,
  },
  coaching_session: {
    evidenceType: "coaching_session",
    label: "AI Evaluated Coaching Session",
    baseReliability: 92,
    validationRules: ["AI Evaluated", "Session Recorded"],
    adjustments: {},
    owner: "Coach Engine",
    version: ERI_REGISTRY_VERSION,
  },
  voice_session: {
    evidenceType: "voice_session",
    label: "Voice Interview Completed",
    baseReliability: 90,
    validationRules: ["Transcribed", "AI Evaluated"],
    adjustments: {},
    owner: "Voice Interview",
    version: ERI_REGISTRY_VERSION,
  },

  // ── Reliable (70–84): completed participation ──
  journal_entry: {
    evidenceType: "journal_entry",
    label: "Executive Reflection Journal",
    baseReliability: 82,
    validationRules: ["User Submitted", "Structured Reflection"],
    adjustments: { userSubmitted: -2 },
    owner: "Journal",
    version: ERI_REGISTRY_VERSION,
  },
  lesson_completed: {
    evidenceType: "lesson_completed",
    label: "Lesson Completion",
    baseReliability: 80,
    validationRules: ["Completion Verified", "Progress Recorded"],
    adjustments: {},
    owner: "Academy",
    version: ERI_REGISTRY_VERSION,
  },

  // ── Moderate (50–69): imported / self-reported ──
  challenge_started: {
    evidenceType: "challenge_started",
    label: "Challenge Started",
    baseReliability: 65,
    validationRules: ["Participation Recorded"],
    adjustments: {},
    owner: "Challenge Engine",
    version: ERI_REGISTRY_VERSION,
  },

  // ── Low (0–49): exposure / preference ──
  article_view: {
    evidenceType: "article_view",
    label: "Article Read",
    baseReliability: 45,
    validationRules: ["View Recorded"],
    adjustments: {},
    owner: "Academy",
    version: ERI_REGISTRY_VERSION,
  },
  page_visit: {
    evidenceType: "page_visit",
    label: "Page Visit",
    baseReliability: 40,
    validationRules: ["Navigation Recorded"],
    adjustments: {},
    owner: "Platform",
    version: ERI_REGISTRY_VERSION,
  },
  recommendation_read: {
    evidenceType: "recommendation_read",
    label: "Recommendation Read",
    baseReliability: 40,
    validationRules: ["View Recorded"],
    adjustments: {},
    owner: "Dashboard",
    version: ERI_REGISTRY_VERSION,
  },
  streak_sustained: {
    evidenceType: "streak_sustained",
    label: "Learning Streak Sustained",
    baseReliability: 70,
    validationRules: ["Consistency Verified"],
    adjustments: { consistency: +3 },
    owner: "Platform",
    version: ERI_REGISTRY_VERSION,
  },
  promotion_improvement: {
    evidenceType: "promotion_improvement",
    label: "Promotion Readiness Improved",
    baseReliability: 88,
    validationRules: ["Forecast Verified"],
    adjustments: {},
    owner: "Forecast Engine",
    version: ERI_REGISTRY_VERSION,
  },
  competency_strengthened: {
    evidenceType: "competency_strengthened",
    label: "Competency Strengthened",
    baseReliability: 85,
    validationRules: ["Engine Computed"],
    adjustments: {},
    owner: "Readiness Engine",
    version: ERI_REGISTRY_VERSION,
  },
};

// ── The 12 Reliability Factors ──
export const RELIABILITY_FACTORS = [
  { id: "evidenceSource", label: "Evidence Source", description: "Where the evidence originated" },
  { id: "validationMethod", label: "Validation Method", description: "How the evidence was validated" },
  { id: "evidenceOrigin", label: "Evidence Origin", description: "System, AI, or user generated" },
  { id: "assessmentDifficulty", label: "Assessment Difficulty", description: "Difficulty of the demonstrated competency" },
  { id: "recency", label: "Recency", description: "How recent the evidence is" },
  { id: "repeatability", label: "Repeatability", description: "Whether the behavior was repeated" },
  { id: "consistency", label: "Consistency", description: "Consistency over time" },
  { id: "verificationStatus", label: "Verification Status", description: "Whether evidence was verified" },
  { id: "aiConfidence", label: "AI Confidence", description: "AI confidence in the evidence" },
  { id: "humanVerification", label: "Human Verification", description: "Whether a human verified this" },
  { id: "enterpriseVerification", label: "Enterprise Verification", description: "Whether enterprise systems verified this" },
  { id: "historicalAccuracy", label: "Historical Accuracy", description: "Track record of this evidence type" },
];

/**
 * Get the registry entry for an evidence type.
 * Falls back to a moderate default for unmapped types.
 */
export function getRegistryEntry(evidenceType) {
  return (
    RELIABILITY_REGISTRY[evidenceType] || {
      evidenceType,
      label: evidenceType,
      baseReliability: 50,
      validationRules: ["Unmapped"],
      adjustments: {},
      owner: "Platform",
      version: ERI_REGISTRY_VERSION,
    }
  );
}

/**
 * Get the base reliability score for an evidence type.
 */
export function getBaseReliability(evidenceType) {
  return getRegistryEntry(evidenceType).baseReliability;
}

/**
 * Classify a reliability score into its grade.
 */
export function gradeReliability(score) {
  for (const g of ERI_GRADES) {
    if (score >= g.min && score <= g.max) return g;
  }
  return ERI_GRADES[ERI_GRADES.length - 1];
}

/**
 * Return the full registry audit — every entry's reliability definition.
 */
export function getReliabilityAudit() {
  return Object.values(RELIABILITY_REGISTRY).map((e) => ({
    evidenceType: e.evidenceType,
    label: e.label,
    baseReliability: e.baseReliability,
    grade: gradeReliability(e.baseReliability).label,
    validationRules: e.validationRules,
    owner: e.owner,
    version: e.version,
  }));
}
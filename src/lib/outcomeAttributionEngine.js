/**
 * Executive Outcome Attribution™
 *
 * For every positive outcome, estimates the evidence, competencies, coaching,
 * simulations, reflections, debates, and lessons that contributed — with a
 * confidence score and a human-readable narrative.
 *
 * Attribution is evidence-backed: it inspects the Evidence Ledger™ in a lookback
 * window before the outcome date and weights contributions by recency,
 * reliability, and the outcome type's expected driver mix.
 */
import { getEvidenceLedger } from "./readinessEvidenceEngine";

export const OUTCOME_CATEGORIES = {
  career: { label: "Career Outcomes", color: "#f59e0b" },
  learning: { label: "Learning Outcomes", color: "#10b981" },
  leadership: { label: "Leadership Outcomes", color: "#6366f1" },
  behavior: { label: "Behavior Outcomes", color: "#8b5cf6" },
};

export const ACTIVITY_LABELS = {
  coaching_session: "Executive Coaching",
  simulation_completed: "Strategic Simulation",
  challenge_solved: "Executive Challenge",
  debate_completed: "Executive Debate",
  journal_entry: "Reflection",
  lesson_completed: "Academy Lesson",
  voice_session: "Voice Interview",
  council_session: "Executive Council",
  achievement_unlocked: "Achievement",
  resume_imported: "Resume Intelligence",
  company_researched: "Company Intelligence",
};

const LOOKBACK_DAYS = 90;

/**
 * Outcome type catalog. Each entry defines:
 *  - label, category, unit, typicalGain
 *  - primaryCompetencies: competencies the outcome reflects
 *  - contributingActivities: prior-activity weights that typically drive it
 *  - predictable: whether the prediction model forecasts this outcome
 */
export const OUTCOME_TYPES = {
  // ── Career ──
  promotion: { label: "Promotion", category: "career", unit: "level", typicalGain: 1, predictable: true, primaryCompetencies: ["Strategic Thinking", "Executive Presence", "People Leadership"], contributingActivities: { coaching_session: 0.30, simulation_completed: 0.25, debate_completed: 0.15, journal_entry: 0.10, challenge_solved: 0.10, lesson_completed: 0.10 } },
  internal_mobility: { label: "Internal Mobility", category: "career", unit: "count", typicalGain: 1, predictable: true, primaryCompetencies: ["Adaptability", "Strategic Thinking", "Stakeholder Management"], contributingActivities: { coaching_session: 0.25, simulation_completed: 0.20, lesson_completed: 0.20, journal_entry: 0.15, challenge_solved: 0.20 } },
  interview_success: { label: "Interview Success", category: "career", unit: "count", typicalGain: 1, predictable: true, primaryCompetencies: ["Communication", "Executive Presence", "Strategic Thinking"], contributingActivities: { voice_session: 0.30, simulation_completed: 0.25, coaching_session: 0.20, challenge_solved: 0.15, debate_completed: 0.10 } },
  new_job: { label: "New Job", category: "career", unit: "count", typicalGain: 1, predictable: true, primaryCompetencies: ["Career Strategy", "Communication", "Executive Presence"], contributingActivities: { resume_imported: 0.25, coaching_session: 0.25, simulation_completed: 0.20, voice_session: 0.15, company_researched: 0.15 } },
  salary_growth: { label: "Salary Growth", category: "career", unit: "percent", typicalGain: 10, predictable: true, primaryCompetencies: ["Negotiation", "Executive Presence", "Career Strategy"], contributingActivities: { coaching_session: 0.30, voice_session: 0.20, simulation_completed: 0.20, debate_completed: 0.15, resume_imported: 0.15 } },
  expanded_responsibilities: { label: "Expanded Responsibilities", category: "career", unit: "count", typicalGain: 1, predictable: true, primaryCompetencies: ["Stakeholder Management", "Strategic Thinking", "Delegation"], contributingActivities: { coaching_session: 0.25, simulation_completed: 0.25, challenge_solved: 0.20, lesson_completed: 0.15, journal_entry: 0.15 } },

  // ── Learning ──
  certification_earned: { label: "Certification Earned", category: "learning", unit: "count", typicalGain: 1, predictable: true, primaryCompetencies: ["Knowledge", "Consistency", "Discipline"], contributingActivities: { lesson_completed: 0.45, challenge_solved: 0.20, journal_entry: 0.15, coaching_session: 0.10, simulation_completed: 0.10 } },
  course_completed: { label: "Course Completed", category: "learning", unit: "count", typicalGain: 1, predictable: true, primaryCompetencies: ["Knowledge", "Consistency"], contributingActivities: { lesson_completed: 0.60, journal_entry: 0.20, challenge_solved: 0.20 } },
  competency_improved: { label: "Competency Improved", category: "learning", unit: "readiness_points", typicalGain: 8, predictable: true, primaryCompetencies: [], contributingActivities: { simulation_completed: 0.25, coaching_session: 0.25, challenge_solved: 0.20, journal_entry: 0.15, debate_completed: 0.15 } },
  knowledge_growth: { label: "Knowledge Growth", category: "learning", unit: "score", typicalGain: 10, predictable: true, primaryCompetencies: ["Knowledge", "Strategic Thinking"], contributingActivities: { lesson_completed: 0.40, journal_entry: 0.20, challenge_solved: 0.20, coaching_session: 0.20 } },

  // ── Leadership ──
  better_decision_making: { label: "Better Decision Making", category: "leadership", unit: "readiness_points", typicalGain: 8, predictable: true, primaryCompetencies: ["Decision Quality", "Strategic Thinking", "Judgment"], contributingActivities: { simulation_completed: 0.35, coaching_session: 0.25, debate_completed: 0.20, journal_entry: 0.20 } },
  improved_executive_presence: { label: "Improved Executive Presence", category: "leadership", unit: "readiness_points", typicalGain: 8, predictable: true, primaryCompetencies: ["Executive Presence", "Communication", "Confidence"], contributingActivities: { voice_session: 0.25, coaching_session: 0.25, simulation_completed: 0.20, debate_completed: 0.15, journal_entry: 0.15 } },
  communication_growth: { label: "Communication Growth", category: "leadership", unit: "readiness_points", typicalGain: 8, predictable: true, primaryCompetencies: ["Communication", "Active Listening", "Clarity"], contributingActivities: { voice_session: 0.30, debate_completed: 0.25, coaching_session: 0.25, journal_entry: 0.20 } },
  strategic_thinking: { label: "Strategic Thinking", category: "leadership", unit: "readiness_points", typicalGain: 8, predictable: true, primaryCompetencies: ["Strategic Thinking", "Systems Thinking", "Foresight"], contributingActivities: { simulation_completed: 0.35, challenge_solved: 0.25, debate_completed: 0.20, journal_entry: 0.20 } },
  influence: { label: "Influence", category: "leadership", unit: "readiness_points", typicalGain: 8, predictable: true, primaryCompetencies: ["Influence", "Persuasion", "Stakeholder Management"], contributingActivities: { debate_completed: 0.35, coaching_session: 0.25, simulation_completed: 0.20, journal_entry: 0.20 } },
  stakeholder_management: { label: "Stakeholder Management", category: "leadership", unit: "readiness_points", typicalGain: 8, predictable: true, primaryCompetencies: ["Stakeholder Management", "Empathy", "Negotiation"], contributingActivities: { simulation_completed: 0.30, coaching_session: 0.25, debate_completed: 0.25, journal_entry: 0.20 } },
  conflict_resolution: { label: "Conflict Resolution", category: "leadership", unit: "readiness_points", typicalGain: 8, predictable: true, primaryCompetencies: ["Conflict Resolution", "Empathy", "Active Listening"], contributingActivities: { simulation_completed: 0.30, debate_completed: 0.25, coaching_session: 0.25, journal_entry: 0.20 } },
  delegation: { label: "Delegation", category: "leadership", unit: "readiness_points", typicalGain: 8, predictable: true, primaryCompetencies: ["Delegation", "People Leadership", "Trust"], contributingActivities: { coaching_session: 0.30, simulation_completed: 0.25, challenge_solved: 0.25, journal_entry: 0.20 } },

  // ── Behavior ──
  reflection_consistency: { label: "Reflection Consistency", category: "behavior", unit: "count", typicalGain: 1, predictable: false, primaryCompetencies: ["Self-Awareness", "Consistency"], contributingActivities: { journal_entry: 0.70, coaching_session: 0.30 } },
  practice_frequency: { label: "Practice Frequency", category: "behavior", unit: "count", typicalGain: 1, predictable: false, primaryCompetencies: ["Discipline", "Consistency"], contributingActivities: { simulation_completed: 0.30, challenge_solved: 0.30, debate_completed: 0.20, voice_session: 0.20 } },
  learning_streak: { label: "Learning Streak", category: "behavior", unit: "count", typicalGain: 1, predictable: false, primaryCompetencies: ["Consistency", "Discipline"], contributingActivities: { lesson_completed: 0.60, challenge_solved: 0.20, journal_entry: 0.20 } },
  scenario_completion: { label: "Scenario Completion", category: "behavior", unit: "count", typicalGain: 1, predictable: false, primaryCompetencies: ["Application", "Decision Quality"], contributingActivities: { simulation_completed: 0.60, challenge_solved: 0.25, voice_session: 0.15 } },
  coaching_adoption: { label: "Coaching Adoption", category: "behavior", unit: "count", typicalGain: 1, predictable: false, primaryCompetencies: ["Coachability", "Self-Awareness"], contributingActivities: { coaching_session: 0.80, journal_entry: 0.20 } },
};

const DEFAULT_META = { label: "Outcome", category: "leadership", unit: "readiness_points", typicalGain: 5, predictable: false, primaryCompetencies: [], contributingActivities: { coaching_session: 0.25, simulation_completed: 0.25, journal_entry: 0.25, challenge_solved: 0.25 } };

function parseJSON(val, fallback) {
  if (!val) return fallback;
  if (Array.isArray(val) || typeof val === "object") return val;
  try { return JSON.parse(val); } catch { return fallback; }
}
function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }
function unique(arr) { return Array.from(new Set(arr.filter(Boolean))); }
function avg(arr) { return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0; }

function mapEvidenceToActivity(evidenceType) {
  return ACTIVITY_LABELS[evidenceType] ? evidenceType : null;
}

function recencyFactor(date, ref) {
  const days = Math.max(1, (ref - new Date(date)) / 86400000);
  // Newer evidence weighs more; half-life ~45 days.
  return Math.exp(-days / 65);
}

/**
 * Attribute a single outcome to its contributing activities.
 * @param {Object} outcome - ExecutiveOutcome record
 * @param {Array} [ledger] - evidence ledger (defaults to stored ledger)
 * @returns {Object} attribution
 */
export function attributeOutcome(outcome, ledger = null) {
  const evidence = ledger || getEvidenceLedger();
  const meta = OUTCOME_TYPES[outcome.outcome_type] || DEFAULT_META;
  const outcomeDate = new Date(outcome.outcome_date || Date.now());
  const windowStart = new Date(outcomeDate);
  windowStart.setDate(windowStart.getDate() - LOOKBACK_DAYS);

  const competencies = parseJSON(outcome.competencies_json, meta.primaryCompetencies || []);
  const activityWeights = meta.contributingActivities || {};

  const inWindow = evidence.filter((e) => {
    const d = new Date(e.timestamp || e.created_date || Date.now());
    return d >= windowStart && d <= outcomeDate;
  });

  const byActivity = {};
  const matchedEvidence = [];
  inWindow.forEach((e) => {
    const act = e.activityType || mapEvidenceToActivity(e.evidenceType);
    if (!act) return;
    // If the outcome names competencies, prefer evidence touching them; otherwise include all.
    if (competencies.length > 0 && e.competency && !competencies.includes(e.competency)) return;
    const recency = recencyFactor(new Date(e.timestamp || e.created_date || Date.now()), outcomeDate);
    const reliability = e.reliabilityScore || 70;
    const base = activityWeights[act] ?? 0.1;
    const score = base * recency * (reliability / 100);
    byActivity[act] = (byActivity[act] || 0) + score;
    matchedEvidence.push(e);
  });

  const total = Object.values(byActivity).reduce((a, b) => a + b, 0) || 1;
  const primaryDrivers = Object.entries(byActivity)
    .map(([act, score]) => ({
      source: act,
      label: ACTIVITY_LABELS[act] || act,
      weight: Math.round(score * 1000) / 1000,
      percentage: Math.round((score / total) * 100),
    }))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 5);

  const evidenceCount = matchedEvidence.length;
  const diversity = Object.keys(byActivity).length;
  const confidence = clamp(
    Math.round(
      Math.min(evidenceCount, 20) / 20 * 40 +
      Math.min(diversity, 5) / 5 * 30 +
      (primaryDrivers[0]?.percentage ? Math.min(primaryDrivers[0].percentage, 40) / 40 * 30 : 15)
    ),
    0, 100
  );

  const contributingCompetencies = unique([
    ...competencies,
    ...matchedEvidence.map((e) => e.competency).filter(Boolean),
  ]).slice(0, 6);

  const driverText = primaryDrivers.slice(0, 4).map((d) => `${d.label} (${d.percentage}%)`).join(", ");
  const sign = (outcome.outcome_value ?? 0) >= 0 ? "+" : "";
  const narrative = `${meta.label || outcome.outcome_type} ${sign}${outcome.outcome_value ?? 0} ${outcome.outcome_unit || ""}.`.trim() +
    (driverText ? ` Primary Drivers: ${driverText}.` : " Baseline engagement — insufficient evidence to attribute drivers.");

  return {
    primaryDrivers,
    contributingCompetencies,
    contributingActivities: Object.keys(byActivity),
    confidence,
    narrative,
    evidenceCount,
    diversity,
    meta,
  };
}

/**
 * Build an aggregation of outcomes attributed per activity type.
 * Used by the Recommendation Effectiveness™ engine.
 */
export function buildAttributionByActivity(enrichedOutcomes) {
  const map = {};
  enrichedOutcomes.forEach((o) => {
    const attr = o._attribution || parseJSON(o.attribution_json, null) || attributeOutcome(o);
    const drivers = attr.primaryDrivers || [];
    drivers.forEach((d) => {
      if (!map[d.source]) map[d.source] = { outcomes: 0, totalGain: 0, confidences: [] };
      map[d.source].outcomes += 1;
      map[d.source].totalGain += o.outcome_value || 0;
      map[d.source].confidences.push(attr.confidence || 0);
    });
  });
  Object.values(map).forEach((v) => {
    v.avgGain = v.outcomes ? Math.round(v.totalGain / v.outcomes) : 0;
    v.avgConfidence = v.confidences.length ? Math.round(avg(v.confidences)) : 0;
  });
  return map;
}
/**
 * EXECLEAD.AI — Evidence Gap Analysis™ Engine
 * =================================================
 * The proactive intelligence layer for the Executive Readiness Framework™.
 *
 * Instead of describing where a leader is today, this engine identifies
 * the shortest path toward stronger executive capability by detecting
 * missing evidence and prescribing the highest-value next activity.
 *
 * It answers:
 *   • What evidence am I missing?
 *   • Why is this competency weak?
 *   • What should I do next?
 *   • Which activity gives the biggest improvement?
 *   • Which competencies need stronger evidence?
 *   • What is preventing Executive Mastery?
 *
 * Architecture:
 *   Every competency is evaluated for Coverage, Reliability, Confidence,
 *   Recency, Consistency, Diversity, and Mastery — then classified into a
 *   Gap Status (Complete → Critical Gap). Missing evidence types are
 *   identified and the Next Best Evidence™ is prescribed with estimated
 *   readiness, confidence, and reliability gains.
 *
 *   Readiness = Contribution × Confidence × Reliability
 *   Coverage  = Observed Evidence Types / Expected Evidence Types
 */
import {
  getEvidenceLedger,
  computeReadinessFromEvidence,
  EVIDENCE_TYPE_MAP,
  EVIDENCE_LEVELS,
} from "./readinessEvidenceEngine";
import {
  RELIABILITY_REGISTRY,
  getBaseReliability,
} from "./evidenceReliabilityRegistry";

// ── Competency → Expected Evidence mapping ──
// Defines what evidence types SHOULD be observed for a competency to be
// considered "complete." This is the coverage denominator.
const EXPECTED_EVIDENCE = {
  Communication: ["coaching_session", "voice_session", "debate_completed"],
  Leadership: ["challenge_solved", "challenge_started", "coaching_session", "journal_entry"],
  "Strategic Thinking": ["simulation_completed", "debate_completed", "lesson_completed", "article_view"],
  "Decision Quality": ["simulation_completed", "challenge_solved", "debate_completed"],
  "Risk Management": ["simulation_completed", "council_decision"],
  "Executive Judgment": ["simulation_completed", "council_decision", "debate_completed"],
  "Executive Presence": ["voice_session", "debate_completed", "coaching_session"],
  Influence: ["debate_completed", "coaching_session", "voice_session"],
  "Board Readiness": ["council_decision", "simulation_completed"],
  Governance: ["council_decision", "simulation_completed"],
  Knowledge: ["lesson_completed", "assessment_passed", "article_view"],
  "Business Acumen": ["lesson_completed", "article_view", "simulation_completed"],
  "Self-awareness": ["journal_entry", "coaching_session"],
  "Executive Maturity": ["journal_entry", "coaching_session", "milestone_achieved"],
  "Career Progression": ["milestone_achieved", "simulation_completed"],
  Consistency: ["streak_sustained", "challenge_solved", "journal_entry"],
  "Promotion Readiness": ["promotion_improvement", "simulation_completed", "milestone_achieved"],
  "People Leadership": ["coaching_session", "journal_entry", "challenge_solved"],
  "Career Positioning": ["milestone_achieved", "coaching_session"],
  "Network Strength": ["milestone_achieved", "coaching_session"],
  Reputation: ["achievement_unlocked", "milestone_achieved"],
  "Thought Leadership": ["journal_entry", "achievement_unlocked"],
  Legacy: ["achievement_unlocked", "milestone_achieved", "journal_entry"],
  "Readiness Velocity": ["challenge_solved", "simulation_completed", "journal_entry"],
  "Self-Direction": ["journal_entry", "coaching_session", "challenge_solved"],
  "Competency Inventory": ["lesson_completed", "assessment_passed"],
  "Leadership Alignment": ["simulation_completed", "coaching_session"],
  "Enterprise Leadership": ["council_decision", "simulation_completed", "lesson_completed"],
};

const DEFAULT_EXPECTED = ["coaching_session", "journal_entry", "simulation_completed", "challenge_solved"];

function expectedFor(competency) {
  return EXPECTED_EVIDENCE[competency] || DEFAULT_EXPECTED;
}

// ── Evidence Type → Activity (module path + label + icon hint) ──
const EVIDENCE_ACTIVITY = {
  simulation_completed: { path: "/simulator", label: "Executive Simulation", icon: "Brain", category: "simulate", estMinutes: 25 },
  challenge_solved: { path: "/challenge", label: "Daily Executive Challenge", icon: "Swords", category: "simulate", estMinutes: 10 },
  challenge_started: { path: "/challenge", label: "Daily Executive Challenge", icon: "Swords", category: "simulate", estMinutes: 10 },
  debate_completed: { path: "/debate", label: "Executive Debate", icon: "Scale", category: "simulate", estMinutes: 15 },
  coaching_session: { path: "/coach", label: "Executive Coach", icon: "MessageSquare", category: "feedback", estMinutes: 15 },
  voice_session: { path: "/voice-interview", label: "Voice Interview", icon: "Mic", category: "practice", estMinutes: 20 },
  council_decision: { path: "/council", label: "Executive Council", icon: "Users", category: "simulate", estMinutes: 30 },
  journal_entry: { path: "/journal", label: "Reflection Journal", icon: "PenLine", category: "practice", estMinutes: 10 },
  lesson_completed: { path: "/academy", label: "Executive Academy", icon: "GraduationCap", category: "learn", estMinutes: 20 },
  assessment_passed: { path: "/academy", label: "Leadership Assessment", icon: "GraduationCap", category: "learn", estMinutes: 25 },
  article_view: { path: "/academy", label: "Executive Academy", icon: "BookOpen", category: "learn", estMinutes: 8 },
  milestone_achieved: { path: "/journey", label: "Leadership Journey", icon: "Map", category: "improve", estMinutes: 15 },
  streak_sustained: { path: "/challenge", label: "Daily Challenge Streak", icon: "Flame", category: "improve", estMinutes: 10 },
  promotion_improvement: { path: "/promotion-forecast", label: "Promotion Forecast", icon: "TrendingUp", category: "measure", estMinutes: 10 },
  achievement_unlocked: { path: "/executive-portfolio", label: "Achievement", icon: "Award", category: "measure", estMinutes: 5 },
};

// ── Gap Status Classification ──
export const GAP_STATUSES = [
  { id: "complete", label: "Complete", color: "#10b981", order: 0, description: "Strong evidence coverage and reliability" },
  { id: "strong", label: "Strong", color: "#0ea5e9", order: 1, description: "Solid evidence with minor gaps" },
  { id: "developing", label: "Developing", color: "#6366f1", order: 2, description: "Partial evidence — growth in progress" },
  { id: "needs_evidence", label: "Needs Evidence", color: "#f59e0b", order: 3, description: "Insufficient evidence to validate competency" },
  { id: "critical_gap", label: "Critical Gap", color: "#ef4444", order: 4, description: "Severe evidence deficit" },
  { id: "unknown", label: "Unknown", color: "#94a3b8", order: 5, description: "No evidence observed yet" },
];

function classifyGap(coverage, reliability, confidence, evidenceCount) {
  if (evidenceCount === 0) return GAP_STATUSES[5]; // unknown
  if (coverage >= 0.9 && reliability >= 80 && confidence >= 80) return GAP_STATUSES[0]; // complete
  if (coverage >= 0.7 && reliability >= 70) return GAP_STATUSES[1]; // strong
  if (coverage >= 0.5) return GAP_STATUSES[2]; // developing
  if (coverage >= 0.25) return GAP_STATUSES[3]; // needs_evidence
  return GAP_STATUSES[4]; // critical_gap
}

// ── Gap Type Detection ──
const GAP_TYPE_DEFS = [
  { id: "no_simulation", label: "No Simulation Evidence", test: (observed) => !observed.has("simulation_completed") },
  { id: "no_debate", label: "No Debate Evidence", test: (observed) => !observed.has("debate_completed") },
  { id: "no_reflection", label: "No Reflection Evidence", test: (observed) => !observed.has("journal_entry") },
  { id: "no_assessment", label: "No Assessment Evidence", test: (observed) => !observed.has("assessment_passed") },
  { id: "no_council", label: "No Council Evidence", test: (observed) => !observed.has("council_decision") },
  { id: "no_voice", label: "No Voice Evidence", test: (observed) => !observed.has("voice_session") },
  { id: "low_reliability", label: "Low Reliability", test: (_, metrics) => metrics.avgReliability > 0 && metrics.avgReliability < 60 },
  { id: "low_confidence", label: "Low Confidence", test: (_, metrics) => metrics.confidence > 0 && metrics.confidence < 60 },
  { id: "old_evidence", label: "Old Evidence", test: (_, metrics) => metrics.daysSinceLast > 30 },
  { id: "insufficient_repetition", label: "Insufficient Repetition", test: (_, metrics) => metrics.count > 0 && metrics.count < 3 },
  { id: "insufficient_diversity", label: "Insufficient Diversity", test: (_, metrics) => metrics.diversity < 2 },
  { id: "missing_behaviors", label: "Missing Executive Behaviors", test: (observed) => !observed.has("simulation_completed") && !observed.has("council_decision") && !observed.has("challenge_solved") },
  { id: "missing_scenario", label: "Missing Leadership Scenario", test: (observed) => !observed.has("simulation_completed") && !observed.has("council_decision") },
];

function identifyGapTypes(observedTypes, metrics) {
  const observed = new Set(observedTypes);
  return GAP_TYPE_DEFS.filter((g) => g.test(observed, metrics)).map((g) => ({ id: g.id, label: g.label }));
}

// ── Mastery Level ──
function masteryLevel(levels) {
  if (!levels) return { id: "none", label: "None", level: 0 };
  if (levels.mastery > 0) return { id: "mastery", label: "Executive Mastery", level: 4 };
  if (levels.demonstrated > 0) return { id: "demonstrated", label: "Demonstrated", level: 3 };
  if (levels.participation > 0) return { id: "participation", label: "Participation", level: 2 };
  if (levels.exposure > 0) return { id: "exposure", label: "Exposure", level: 1 };
  return { id: "none", label: "None", level: 0 };
}

// ── Improvement Estimation for a missing evidence type ──
function estimateGain(evidenceType, currentReliability, currentConfidence) {
  const entry = RELIABILITY_REGISTRY[evidenceType];
  const baseR = entry ? entry.baseReliability : getBaseReliability(evidenceType);
  const levelInfo = EVIDENCE_TYPE_MAP[evidenceType];
  const levelWeight = levelInfo ? (EVIDENCE_LEVELS[levelInfo.level]?.weight || 0.15) : 0.15;

  // Readiness gain scales with evidence level weight
  const readinessGain = Math.round((levelWeight * 100) * (baseR / 100));
  // Reliability gain: new evidence pulls the average up
  const reliabilityGain = Math.max(0, Math.round((baseR - currentReliability) / 3));
  // Confidence gain: more evidence increases confidence
  const confidenceGain = Math.round(readinessGain * 1.2);

  return {
    readiness: Math.max(1, readinessGain),
    reliability: reliabilityGain,
    confidence: Math.max(1, confidenceGain),
  };
}

/**
 * Analyze a single competency for evidence gaps.
 */
export function analyzeCompetencyGap(competencyName, readiness, ledger) {
  const records = (ledger || getEvidenceLedger()).filter(
    (r) => r.competency === competencyName || (r.competenciesImpacted || []).includes(competencyName)
  );

  const expected = expectedFor(competencyName);
  const observedTypes = [...new Set(records.map((r) => r.evidenceType))];
  const observedExpected = expected.filter((t) => observedTypes.includes(t));
  const missing = expected.filter((t) => !observedTypes.includes(t));
  const coverage = expected.length > 0 ? observedExpected.length / expected.length : 0;

  const cb = (readiness?.competencyBreakdown || []).find((c) => c.competency === competencyName);
  const score = cb?.score ?? 0;
  const confidence = cb?.confidence ?? 0;
  const avgReliability = cb?.reliability ?? 0;
  const evidenceCount = records.length;
  const diversity = observedTypes.length;

  const lastTimestamp = records.length ? Math.max(...records.map((r) => r.timestamp)) : 0;
  const daysSinceLast = lastTimestamp ? Math.floor((Date.now() - lastTimestamp) / (24 * 60 * 60 * 1000)) : Infinity;

  const levels = cb?.levels || { exposure: 0, participation: 0, demonstrated: 0, mastery: 0 };
  const mastery = masteryLevel(levels);

  const metrics = { count: evidenceCount, avgReliability, confidence, daysSinceLast, diversity };
  const gapTypes = identifyGapTypes(observedTypes, metrics);
  const status = classifyGap(coverage, avgReliability, confidence, evidenceCount);

  // Next Best Evidence — highest-impact missing activity
  let nextBest = null;
  if (missing.length > 0) {
    const ranked = missing.map((t) => {
      const gain = estimateGain(t, avgReliability, confidence);
      const activity = EVIDENCE_ACTIVITY[t] || {};
      const baseR = getBaseReliability(t);
      return { evidenceType: t, baseReliability: baseR, gain, activity, diversityBonus: !observedTypes.includes(t) ? 1 : 0 };
    }).sort((a, b) => (b.gain.readiness + b.gain.reliability) - (a.gain.readiness + a.gain.reliability));
    nextBest = ranked[0] || null;
  }

  // Improvement opportunity — total if all gaps closed
  const totalImprovement = missing.reduce((acc, t) => {
    const g = estimateGain(t, avgReliability, confidence);
    return { readiness: acc.readiness + g.readiness, reliability: acc.reliability + g.reliability, confidence: acc.confidence + g.confidence };
  }, { readiness: 0, reliability: 0, confidence: 0 });

  return {
    competency: competencyName,
    currentScore: score,
    confidence,
    evidenceReliability: avgReliability,
    coverage: Math.round(coverage * 100),
    coverageRatio: coverage,
    evidenceDiversity: diversity,
    recency: daysSinceLast === Infinity ? null : daysSinceLast,
    consistency: readiness?.streak || 0,
    mastery,
    expectedEvidence: expected,
    observedEvidence: observedTypes,
    missingEvidence: missing,
    gapTypes,
    status,
    evidenceCount,
    nextBest,
    improvementOpportunity: {
      readiness: Math.round(totalImprovement.readiness),
      reliability: Math.round(totalImprovement.reliability),
      confidence: Math.round(totalImprovement.confidence),
    },
  };
}

/**
 * Analyze all competencies and compute the full Evidence Gap picture.
 */
export function analyzeAllGaps(readiness) {
  const r = readiness || computeReadinessFromEvidence();
  const ledger = getEvidenceLedger();

  // Collect all competencies — from the breakdown + any observed in the ledger
  const competencySet = new Set();
  (r.competencyBreakdown || []).forEach((c) => competencySet.add(c.competency));
  ledger.forEach((rec) => {
    if (rec.competency) competencySet.add(rec.competency);
    (rec.competenciesImpacted || []).forEach((c) => competencySet.add(c));
  });

  const analyses = [...competencySet]
    .map((name) => analyzeCompetencyGap(name, r, ledger))
    .sort((a, b) => b.improvementOpportunity.readiness - a.improvementOpportunity.readiness);

  // Overall coverage = total observed / total expected across all competencies
  let totalExpected = 0;
  let totalObserved = 0;
  analyses.forEach((a) => {
    totalExpected += a.expectedEvidence.length;
    totalObserved += a.expectedEvidence.filter((t) => a.observedEvidence.includes(t)).length;
  });
  const overallCoverage = totalExpected > 0 ? Math.round((totalObserved / totalExpected) * 100) : 0;

  // Top 5 gaps — sorted by improvement opportunity (readiness gain)
  const topGaps = [...analyses]
    .filter((a) => a.missingEvidence.length > 0)
    .sort((a, b) => b.improvementOpportunity.readiness - a.improvementOpportunity.readiness)
    .slice(0, 5);

  return {
    competencies: analyses,
    overallCoverage,
    confidence: r.confidence,
    reliability: r.averageReliability,
    readiness: r.totalScore,
    topGaps,
    summary: {
      totalCompetencies: analyses.length,
      complete: analyses.filter((a) => a.status.id === "complete").length,
      strong: analyses.filter((a) => a.status.id === "strong").length,
      developing: analyses.filter((a) => a.status.id === "developing").length,
      needsEvidence: analyses.filter((a) => a.status.id === "needs_evidence").length,
      criticalGap: analyses.filter((a) => a.status.id === "critical_gap").length,
      unknown: analyses.filter((a) => a.status.id === "unknown").length,
    },
  };
}

/**
 * Get the Next Best Evidence™ activities across all competencies.
 * Returns ranked recommendations with AI prioritization.
 */
export function getNextBestActivities(limit = 8, readiness) {
  const r = readiness || computeReadinessFromEvidence();
  const ledger = getEvidenceLedger();
  const competencySet = new Set();
  (r.competencyBreakdown || []).forEach((c) => competencySet.add(c.competency));
  ledger.forEach((rec) => {
    if (rec.competency) competencySet.add(rec.competency);
    (rec.competenciesImpacted || []).forEach((c) => competencySet.add(c));
  });

  const recommendations = [];
  [...competencySet].forEach((name) => {
    const analysis = analyzeCompetencyGap(name, r, ledger);
    analysis.missingEvidence.forEach((evType) => {
      const gain = estimateGain(evType, analysis.evidenceReliability, analysis.confidence);
      const activity = EVIDENCE_ACTIVITY[evType] || {};
      // Competency importance: how far from 100 (bigger gap = more important)
      const competencyImportance = 100 - analysis.currentScore;
      // Learning efficiency: gain per minute
      const learningEfficiency = activity.estMinutes ? (gain.readiness + gain.reliability) / activity.estMinutes : 0.5;
      recommendations.push({
        competency: name,
        evidenceType: evType,
        activity: activity.label || evType,
        path: activity.path || "/dashboard",
        icon: activity.icon || "Target",
        category: activity.category || "practice",
        estMinutes: activity.estMinutes || 15,
        estimatedGain: gain,
        baseReliability: getBaseReliability(evType),
        competencyImportance,
        learningEfficiency,
        // Composite ROI score for ranking
        roiScore: (gain.readiness * 2) + gain.reliability + gain.confidence + (competencyImportance * 0.3) + (learningEfficiency * 5),
        currentCoverage: analysis.coverage,
        gapStatus: analysis.status,
      });
    });
  });

  // Rank by ROI score
  const ranked = recommendations.sort((a, b) => b.roiScore - a.roiScore);

  // Categorize
  const highestROI = ranked[0] || null;
  const quickWins = ranked.filter((r) => r.estMinutes <= 12 && r.estimatedGain.readiness >= 2).slice(0, 3);
  const longTermGrowth = ranked.filter((r) => r.estimatedGain.readiness >= 5 || r.category === "simulate").slice(0, 3);

  return {
    all: ranked.slice(0, limit),
    highestROI,
    quickWins,
    longTermGrowth,
  };
}

/**
 * Get the overall Evidence Coverage™ metric.
 */
export function getEvidenceCoverage(readiness) {
  const r = readiness || computeReadinessFromEvidence();
  const ledger = getEvidenceLedger();
  const competencySet = new Set();
  (r.competencyBreakdown || []).forEach((c) => competencySet.add(c.competency));
  ledger.forEach((rec) => {
    if (rec.competency) competencySet.add(rec.competency);
    (rec.competenciesImpacted || []).forEach((c) => competencySet.add(c));
  });

  let totalExpected = 0;
  let totalObserved = 0;
  [...competencySet].forEach((name) => {
    const expected = expectedFor(name);
    const observedTypes = [...new Set(ledger.filter((rec) => rec.competency === name || (rec.competenciesImpacted || []).includes(name)).map((rec) => rec.evidenceType))];
    totalExpected += expected.length;
    totalObserved += expected.filter((t) => observedTypes.includes(t)).length;
  });

  return {
    coverage: totalExpected > 0 ? Math.round((totalObserved / totalExpected) * 100) : 0,
    observed: totalObserved,
    expected: totalExpected,
    readiness: r.totalScore,
    confidence: r.confidence,
    reliability: r.averageReliability,
  };
}

/**
 * EXEC™ Concierge integration — answer evidence gap questions in natural language.
 */
export function answerGapQuestion(question) {
  const q = (question || "").toLowerCase();
  const gaps = analyzeAllGaps();
  const nextBest = getNextBestActivities(5);

  // What evidence am I missing?
  if (q.includes("missing") || q.includes("what evidence")) {
    const missing = gaps.topGaps.slice(0, 3).map((g) => `${g.competency}: ${g.missingEvidence.map((t) => EVIDENCE_ACTIVITY[t]?.label || t).join(", ")}`);
    return `You are missing evidence in ${gaps.topGaps.length} key competencies. The most impactful gaps:\n\n${missing.join("\n")}\n\nClosing these gaps would add an estimated +${gaps.topGaps[0]?.improvementOpportunity.readiness || 0} readiness points to your strongest gap.`;
  }

  // Which competency has the biggest gap?
  if (q.includes("biggest gap") || q.includes("largest gap") || q.includes("which competency")) {
    const biggest = gaps.topGaps[0];
    if (!biggest) return "All your competencies have complete evidence coverage. Continue practicing to sustain mastery.";
    return `Your biggest gap is in ${biggest.competency} (${biggest.status.label}). Coverage is ${biggest.coverage}% with ${biggest.missingEvidence.length} missing evidence types. Completing ${EVIDENCE_ACTIVITY[biggest.nextBest?.evidenceType]?.label || "the recommended activity"} would add +${biggest.improvementOpportunity.readiness} readiness.`;
  }

  // What activity gives the largest readiness increase?
  if (q.includes("biggest") && q.includes("increase")) {
    const top = nextBest.all[0];
    if (!top) return "No recommended activities right now. Your evidence coverage is strong.";
    return `The highest-ROI activity is ${top.activity} for ${top.competency}. It would add +${top.estimatedGain.readiness} readiness, +${top.estimatedGain.reliability} reliability, and +${top.estimatedGain.confidence} confidence. Estimated time: ${top.estMinutes} minutes.`;
  }

  // Why is my confidence low?
  if (q.includes("confidence") && q.includes("low")) {
    const lowConf = gaps.competencies.filter((c) => c.confidence < 60).slice(0, 2);
    if (lowConf.length === 0) return `Your confidence is ${gaps.confidence}% — driven by ${gaps.competencies.length} competencies with evidence. Low confidence usually means insufficient evidence diversity or repetition.`;
    return `Your confidence is constrained by ${lowConf.map((c) => `${c.competency} (${c.confidence}%)`).join(" and ")}. These competencies need ${lowConf[0].missingEvidence.length > 0 ? "more diverse evidence types" : "more repeated evidence"} to build confidence.`;
  }

  // How can I reach Executive Mastery?
  if (q.includes("mastery")) {
    const mastered = gaps.competencies.filter((c) => c.mastery.level >= 3).length;
    const nearMastery = gaps.competencies.filter((c) => c.mastery.level === 3).length;
    return `You have demonstrated competency in ${mastered} areas, with ${nearMastery} near Executive Mastery. To reach Mastery, sustain consistent practice in your demonstrated competencies and close the ${gaps.topGaps.length} top gaps. Focus on ${nextBest.highestROI?.activity || "the recommended activity"} first.`;
  }

  // Which competency needs attention first?
  if (q.includes("attention first") || q.includes("focus")) {
    const top = gaps.topGaps[0];
    if (!top) return "Your evidence is well-distributed. Focus on sustaining your streak and advancing toward mastery in your strongest competencies.";
    return `Focus on ${top.competency} first — it has the largest improvement opportunity (+${top.improvementOpportunity.readiness} readiness). Start with ${EVIDENCE_ACTIVITY[top.nextBest?.evidenceType]?.label || "a simulation"}.`;
  }

  // Default
  return `Your Evidence Coverage is ${gaps.overallCoverage}%. Readiness ${gaps.readiness}, Confidence ${gaps.confidence}%, Reliability ${gaps.reliability}%. The top gap is ${gaps.topGaps[0]?.competency || "none"}. Ask: "What evidence am I missing?" or "Which competency has the biggest gap?"`;
}

/**
 * Executive Coach™ integration — generate personalized gap-based advice.
 */
export function generateCoachAdvice(readiness) {
  const gaps = analyzeAllGaps(readiness);
  const nextBest = getNextBestActivities(3, readiness);
  const advice = [];

  gaps.topGaps.slice(0, 2).forEach((gap) => {
    if (gap.gapTypes.some((g) => g.id === "missing_behaviors")) {
      advice.push({
        competency: gap.competency,
        type: "missing_behaviors",
        message: `Your ${gap.competency} score is constrained by missing behavioral evidence rather than poor performance. Complete an Executive Simulation to demonstrate this competency in action.`,
        activity: EVIDENCE_ACTIVITY[gap.nextBest?.evidenceType]?.label || "Executive Simulation",
        path: EVIDENCE_ACTIVITY[gap.nextBest?.evidenceType]?.path || "/simulator",
      });
    } else if (gap.gapTypes.some((g) => g.id === "low_reliability")) {
      advice.push({
        competency: gap.competency,
        type: "low_reliability",
        message: `Your ${gap.competency} relies heavily on ${gap.observedEvidence.length > 0 ? "low-reliability evidence" : "self-reflection"}. Complete an Executive Simulation or Assessment to strengthen evidence reliability.`,
        activity: EVIDENCE_ACTIVITY[gap.nextBest?.evidenceType]?.label || "Assessment",
        path: EVIDENCE_ACTIVITY[gap.nextBest?.evidenceType]?.path || "/academy",
      });
    } else if (gap.gapTypes.some((g) => g.id === "insufficient_diversity")) {
      advice.push({
        competency: gap.competency,
        type: "low_coverage",
        message: `You have strong evidence quality but limited evidence coverage in ${gap.competency}. Complete ${gap.missingEvidence.length} more evidence type${gap.missingEvidence.length > 1 ? "s" : ""} this week.`,
        activity: EVIDENCE_ACTIVITY[gap.nextBest?.evidenceType]?.label || "activity",
        path: EVIDENCE_ACTIVITY[gap.nextBest?.evidenceType]?.path || "/dashboard",
      });
    } else if (gap.missingEvidence.length > 0) {
      advice.push({
        competency: gap.competency,
        type: "missing_evidence",
        message: `Your ${gap.competency} is missing ${gap.missingEvidence.length} evidence type${gap.missingEvidence.length > 1 ? "s" : ""}. Completing ${EVIDENCE_ACTIVITY[gap.nextBest?.evidenceType]?.label || "the recommended activity"} would add +${gap.improvementOpportunity.readiness} readiness.`,
        activity: EVIDENCE_ACTIVITY[gap.nextBest?.evidenceType]?.label || "activity",
        path: EVIDENCE_ACTIVITY[gap.nextBest?.evidenceType]?.path || "/dashboard",
      });
    }
  });

  if (advice.length === 0) {
    advice.push({
      competency: null,
      type: "sustain",
      message: "Your evidence coverage is strong across all competencies. Continue practicing to sustain mastery and advance to the next leadership stage.",
      activity: "Daily Challenge",
      path: "/challenge",
    });
  }

  return advice;
}

/**
 * Enterprise Gap Analytics — organizational gap aggregation.
 * Aggregates individual gap analyses into org-level insights.
 */
export function getEnterpriseGapAnalytics(members = []) {
  // Aggregate across member readiness data
  const allCompetencyGaps = {};
  const departmentCoverage = {};

  members.forEach((m) => {
    const gaps = analyzeAllGaps(m.readiness);
    gaps.competencies.forEach((c) => {
      if (!allCompetencyGaps[c.competency]) allCompetencyGaps[c.competency] = { competency: c.competency, gapCount: 0, totalCoverage: 0, members: 0, statuses: {} };
      allCompetencyGaps[c.competency].gapCount += c.missingEvidence.length;
      allCompetencyGaps[c.competency].totalCoverage += c.coverage;
      allCompetencyGaps[c.competency].members += 1;
      allCompetencyGaps[c.competency].statuses[c.status.id] = (allCompetencyGaps[c.competency].statuses[c.status.id] || 0) + 1;
    });
    const dept = m.department || "Unassigned";
    if (!departmentCoverage[dept]) departmentCoverage[dept] = { department: dept, totalCoverage: 0, members: 0 };
    departmentCoverage[dept].totalCoverage += gaps.overallCoverage;
    departmentCoverage[dept].members += 1;
  });

  const competencyCoverage = Object.values(allCompetencyGaps).map((c) => ({
    competency: c.competency,
    avgCoverage: c.members > 0 ? Math.round(c.totalCoverage / c.members) : 0,
    gapCount: c.gapCount,
    members: c.members,
    mostCommonStatus: Object.entries(c.statuses).sort((a, b) => b[1] - a[1])[0]?.[0] || "unknown",
  })).sort((a, b) => b.gapCount - a.gapCount);

  const departmentAgg = Object.values(departmentCoverage).map((d) => ({
    department: d.department,
    avgCoverage: d.members > 0 ? Math.round(d.totalCoverage / d.members) : 0,
    members: d.members,
  }));

  return {
    mostCommonGaps: competencyCoverage.slice(0, 10),
    departmentCoverage: departmentAgg,
    competencyCoverage,
    totalMembers: members.length,
  };
}
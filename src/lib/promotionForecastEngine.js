/**
 * EXECLEAD.AI — Promotion Forecast Engine™
 * ============================================================
 * Core Intelligence Service #1
 *
 * The centralized intelligence engine for estimating executive
 * promotion readiness, probability, leadership trajectory, and
 * personalized growth recommendations.
 *
 *   Executive Data → Leadership DNA™ → Executive Journey™ →
 *   Promotion Forecast Engine™ → [Action Center, Coach, Dashboard,
 *   Weekly Review, Digital Twin, Leadership Analytics, Decision Lab,
 *   Career Timeline, Concierge]
 *
 * Answers four questions:
 *   1. Where am I today?
 *   2. What is preventing my next promotion?
 *   3. What should I improve first?
 *   4. When am I likely to be promotion-ready?
 */

import { base44 } from "@/api/base44Client";

export const FORECAST_VERSION = "1.0";

// ============================================================
// §1 — LEADERSHIP DIMENSIONS (15)
// ============================================================

export const LEADERSHIP_DIMENSIONS = [
  { key: "strategic_thinking", label: "Strategic Thinking", target: 85 },
  { key: "operational_leadership", label: "Operational Leadership", target: 85 },
  { key: "communication", label: "Communication", target: 85 },
  { key: "executive_presence", label: "Executive Presence", target: 85 },
  { key: "influence", label: "Influence", target: 85 },
  { key: "financial_acumen", label: "Financial Acumen", target: 85 },
  { key: "decision_making", label: "Decision Making", target: 85 },
  { key: "innovation", label: "Innovation", target: 80 },
  { key: "people_leadership", label: "People Leadership", target: 85 },
  { key: "business_acumen", label: "Business Acumen", target: 85 },
  { key: "governance", label: "Governance", target: 80 },
  { key: "risk_management", label: "Risk Management", target: 80 },
  { key: "stakeholder_management", label: "Stakeholder Management", target: 85 },
  { key: "change_leadership", label: "Change Leadership", target: 80 },
  { key: "customer_focus", label: "Customer Focus", target: 80 },
];

const IMPROVEMENT_ACTIONS = [
  { dimension: "financial_acumen", action: "Complete Executive Finance™ course", path: "/academy", impact: 4 },
  { dimension: "communication", action: "Practice Executive Debate", path: "/debate", impact: 3 },
  { dimension: "executive_presence", action: "Complete Executive Simulator session", path: "/simulator", impact: 3 },
  { dimension: "decision_making", action: "Use Decision Lab™ for a career decision", path: "/decision-intelligence", impact: 3 },
  { dimension: "strategic_thinking", action: "Complete Strategic Leadership module", path: "/academy", impact: 4 },
  { dimension: "influence", action: "Expand your executive network", path: "/network", impact: 2 },
  { dimension: "people_leadership", action: "Complete People Leadership course", path: "/academy", impact: 3 },
  { dimension: "governance", action: "Submit governance evidence for verification", path: "/evidence-vault", impact: 2 },
  { dimension: "risk_management", action: "Complete Risk Management simulation", path: "/simulator", impact: 2 },
  { dimension: "innovation", action: "Complete Innovation & Strategy module", path: "/academy", impact: 3 },
  { dimension: "stakeholder_management", action: "Complete Stakeholder Management course", path: "/academy", impact: 2 },
  { dimension: "change_leadership", action: "Document a change leadership journey event", path: "/journey", impact: 2 },
  { dimension: "business_acumen", action: "Complete Business Acumen module", path: "/academy", impact: 3 },
  { dimension: "operational_leadership", action: "Complete Operational Excellence course", path: "/academy", impact: 3 },
  { dimension: "customer_focus", action: "Add customer impact evidence", path: "/evidence-vault", impact: 2 },
];

// ============================================================
// §2 — DATA SOURCES
// ============================================================

async function fetchAllData(userId) {
  const sources = [
    { name: "competencies", fetch: () => base44.entities.ExecutiveCompetency.filter({ user_id: userId }, "-created_date", 50) },
    { name: "journey", fetch: () => base44.entities.JourneyEvent.filter({ user_id: userId }, "-created_date", 30) },
    { name: "lessons", fetch: () => base44.entities.LessonProgress.filter({ user_id: userId }, "-created_date", 50) },
    { name: "simulations", fetch: () => base44.entities.SimulationSession.filter({ user_id: userId }, "-created_date", 20) },
    { name: "decisions", fetch: () => base44.entities.ExecutiveDecision.filter({ created_by_id: userId }, "-created_date", 20) },
    { name: "evidence", fetch: () => base44.entities.EvidenceItem.filter({ created_by_id: userId }, "-created_date", 50) },
    { name: "verification", fetch: () => base44.entities.IdentityVerification.filter({ user_id: userId }, "-created_date", 1) },
    { name: "journals", fetch: () => base44.entities.JournalEntry.filter({ created_by_id: userId }, "-created_date", 30) },
    { name: "challenges", fetch: () => base44.entities.ChallengeResult.filter({ user_id: userId }, "-created_date", 30) },
    { name: "profile", fetch: () => base44.entities.UserProfile.filter({ user_id: userId }, "-created_date", 1) },
    { name: "actions", fetch: () => base44.entities.ExecutiveAction.filter({ user_id: userId }, "-created_date", 100) },
    { name: "resumeImports", fetch: () => base44.entities.ResumeImport.filter({ created_by_id: userId }, "-created_date", 5) },
    { name: "leadershipDNA", fetch: () => base44.entities.LeadershipDNA.filter({ user_id: userId }, "-created_date", 1) },
  ];

  const results = await Promise.all(
    sources.map(async (s) => {
      try { return { name: s.name, data: await s.fetch() }; }
      catch { return { name: s.name, data: [] }; }
    })
  );

  const data = {};
  results.forEach((r) => { data[r.name] = r.data; });
  return data;
}

// ============================================================
// §3 — COMPONENT SCORING
// ============================================================

function scoreLeadership(data) {
  const dna = data.leadershipDNA?.[0];
  if (dna) {
    const score = dna.score || dna.overall_score || dna.leadership_score || dna.dna_score;
    if (score) return Math.min(100, Math.round(score));
  }
  const comps = data.competencies || [];
  if (comps.length > 0) {
    const avg = comps.reduce((s, c) => s + (c.score || c.level || c.proficiency || 50), 0) / comps.length;
    return Math.min(100, Math.round(avg));
  }
  return 40;
}

function scoreLearning(data) {
  const lessons = data.lessons || [];
  if (lessons.length === 0) return 25;
  const completed = lessons.filter((l) => l.status === "completed").length;
  const inProgress = lessons.filter((l) => l.status === "in_progress").length;
  return Math.min(100, Math.round(20 + completed * 8 + inProgress * 3));
}

function scoreEvidence(data) {
  const evidence = data.evidence || [];
  if (evidence.length === 0) return 20;
  const verified = evidence.filter((e) => e.verification_status === "verified").length;
  return Math.min(100, Math.round(20 + evidence.length * 3 + verified * 5));
}

function scoreTrust(data) {
  const ver = data.verification?.[0];
  if (!ver) return 15;
  return Math.min(100, (ver.trust_level || 0) * 20);
}

function scoreDecisions(data) {
  const decisions = data.decisions || [];
  if (decisions.length === 0) return 25;
  const completed = decisions.filter((d) => d.status === "completed" || d.status === "accepted").length;
  return Math.min(100, Math.round(30 + decisions.length * 5 + completed * 5));
}

function scoreInterview(data) {
  const sims = data.simulations || [];
  if (sims.length === 0) return 20;
  return Math.min(100, Math.round(25 + sims.length * 8));
}

function scoreResume(data) {
  const imports = data.resumeImports || [];
  if (imports.length === 0) return 30;
  const approved = imports.filter((i) => i.import_status === "approved").length;
  return Math.min(100, Math.round(40 + approved * 15));
}

function scoreJourney(data) {
  const events = data.journey || [];
  if (events.length === 0) return 25;
  return Math.min(100, Math.round(30 + events.length * 4));
}

function scoreActions(data) {
  const actions = data.actions || [];
  if (actions.length === 0) return 25;
  const completed = actions.filter((a) => a.status === "completed").length;
  return Math.min(100, Math.round(30 + completed * 5));
}

// ============================================================
// §4 — CORE CALCULATIONS
// ============================================================

function calculateReadiness(data) {
  const components = {
    leadership: { score: scoreLeadership(data), weight: 0.25 },
    learning: { score: scoreLearning(data), weight: 0.15 },
    evidence: { score: scoreEvidence(data), weight: 0.15 },
    trust: { score: scoreTrust(data), weight: 0.10 },
    decisions: { score: scoreDecisions(data), weight: 0.10 },
    interview: { score: scoreInterview(data), weight: 0.10 },
    resume: { score: scoreResume(data), weight: 0.05 },
    journey: { score: scoreJourney(data), weight: 0.05 },
    actions: { score: scoreActions(data), weight: 0.05 },
  };

  const readiness = Math.round(
    Object.values(components).reduce((sum, c) => sum + c.score * c.weight, 0)
  );

  return { readiness, components };
}

function calculateProbability(readiness, data, momentum) {
  // Base: 40% of readiness (capability is necessary but not sufficient)
  let probability = readiness * 0.4;

  // Internal activity factors (max ~35)
  const journeyCount = data.journey?.length || 0;
  probability += Math.min(6, journeyCount * 1.2);

  if (data.competencies?.length > 0) probability += 4;

  const recentLessons = (data.lessons || []).filter((l) => {
    const d = new Date(l.created_date);
    return (Date.now() - d) / 86400000 <= 30;
  }).length;
  probability += Math.min(6, recentLessons * 1.5);

  const simCount = data.simulations?.length || 0;
  probability += Math.min(6, simCount * 1.5);

  const verification = data.verification?.[0];
  if (verification?.trust_level >= 4) probability += 5;
  else if (verification?.trust_level >= 3) probability += 3;

  if (data.evidence?.length > 5) probability += 4;
  else if (data.evidence?.length > 0) probability += 2;

  // External factors (baseline — org opportunity, market, role availability)
  probability += 12;

  // Momentum adjustment
  if (momentum === "increasing") probability += 4;
  else if (momentum === "declining") probability -= 4;

  return Math.max(0, Math.min(100, Math.round(probability)));
}

function calculateMomentum(data) {
  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 86400000;
  const sixtyDaysAgo = now - 60 * 86400000;

  const countRecent = countActivity(data, thirtyDaysAgo, now);
  const countPrevious = countActivity(data, sixtyDaysAgo, thirtyDaysAgo);

  if (countRecent > countPrevious * 1.15) return "increasing";
  if (countRecent < countPrevious * 0.85 && countPrevious > 0) return "declining";
  return "stable";
}

function countActivity(data, from, to) {
  let count = 0;
  const inRange = (dateStr) => {
    if (!dateStr) return false;
    const d = new Date(dateStr).getTime();
    return d >= from && d < to;
  };
  [["lessons"], ["simulations"], ["decisions"], ["journals"], ["challenges"], ["evidence"], ["actions"]].forEach(([key]) => {
    (data[key] || []).forEach((item) => {
      if (inRange(item.created_date)) count++;
      if (key === "actions" && item.status === "completed" && inRange(item.completed_date)) count++;
    });
  });
  return count;
}

// ============================================================
// §5 — LEADERSHIP DIMENSIONS
// ============================================================

function scoreDimension(dim, data) {
  const comps = data.competencies || [];
  const matching = comps.find((c) => {
    const name = (c.competency_name || c.competency_key || c.name || "").toLowerCase().replace(/_/g, " ");
    const dimLabel = dim.label.toLowerCase();
    return name.includes(dimLabel) || dimLabel.includes(name) ||
      name.includes(dim.key.split("_")[0]) || dimLabel.includes(name.split(" ")[0]);
  });

  if (matching) {
    const score = matching.score || matching.level || matching.proficiency || matching.percentage || 50;
    return Math.min(100, Math.round(score));
  }

  // Derive from activity
  let base = 40;
  if (dim.key === "decision_making" || dim.key === "strategic_thinking" || dim.key === "innovation") {
    base += Math.min(25, (data.decisions?.length || 0) * 3);
  }
  if (dim.key === "executive_presence" || dim.key === "risk_management" || dim.key === "communication") {
    base += Math.min(25, (data.simulations?.length || 0) * 3);
  }
  if (dim.key === "financial_acumen" || dim.key === "business_acumen" || dim.key === "innovation") {
    base += Math.min(15, (data.lessons?.length || 0) * 2);
  }
  if (dim.key === "people_leadership" || dim.key === "change_leadership" || dim.key === "operational_leadership") {
    base += Math.min(15, (data.journey?.length || 0) * 2);
  }
  if (dim.key === "governance" || dim.key === "customer_focus" || dim.key === "stakeholder_management") {
    base += Math.min(15, (data.evidence?.length || 0) * 2);
  }
  if (dim.key === "influence" || dim.key === "communication") {
    base += Math.min(10, (data.journals?.length || 0) * 2);
  }
  if (comps.length > 0) base += 5;

  return Math.min(100, base);
}

function evaluateDimensions(data) {
  return LEADERSHIP_DIMENSIONS.map((dim) => {
    const current = scoreDimension(dim, data);
    const gap = Math.max(0, dim.target - current);
    const impact = Math.ceil(gap / 5);
    return { ...dim, current, gap, impact };
  });
}

// ============================================================
// §6 — STRENGTH INDEX & SKILL GAPS
// ============================================================

function calculateStrengthIndex(dimensions) {
  return [...dimensions]
    .sort((a, b) => b.current - a.current)
    .slice(0, 5)
    .map((d) => ({ label: d.label, score: d.current }));
}

function calculateSkillGaps(dimensions) {
  return [...dimensions]
    .filter((d) => d.gap > 0)
    .sort((a, b) => b.gap - a.gap)
    .map((d) => ({
      label: d.label,
      current: d.current,
      target: d.target,
      gap: d.gap,
      impact: d.impact,
    }));
}

// ============================================================
// §7 — IMPROVEMENT PRIORITY™
// ============================================================

function generateImprovementPriorities(dimensions) {
  return dimensions
    .filter((d) => d.gap > 0)
    .map((d) => {
      const action = IMPROVEMENT_ACTIONS.find((a) => a.dimension === d.key);
      return {
        dimension: d.label,
        action: action?.action || `Improve ${d.label}`,
        path: action?.path || "/academy",
        impact: action?.impact || Math.ceil(d.gap / 5),
        current: d.current,
        target: d.target,
        gap: d.gap,
      };
    })
    .sort((a, b) => b.impact - a.impact)
    .slice(0, 5);
}

// ============================================================
// §8 — PROMOTION TIMELINE™
// ============================================================

function estimateTimeline(readiness, dimensions) {
  const criticalGaps = dimensions.filter((d) => d.gap > 20).length;

  if (readiness >= 85 && criticalGaps <= 1) return { estimate: "ready_now", label: "Ready Now", confidence: "high", months: 0 };
  if (readiness >= 70) return { estimate: "3_months", label: "3 Months", confidence: "high", months: 3 };
  if (readiness >= 55) return { estimate: "6_months", label: "6 Months", confidence: "medium", months: 6 };
  if (readiness >= 40) return { estimate: "12_months", label: "12 Months", confidence: "medium", months: 12 };
  if (readiness >= 25) return { estimate: "18_months", label: "18 Months", confidence: "low", months: 18 };
  return { estimate: "24_plus_months", label: "24+ Months", confidence: "low", months: 24 };
}

// ============================================================
// §9 — CONFIDENCE ENGINE
// ============================================================

function calculateConfidence(data) {
  let confidence = 0;

  const sourcesWithData = Object.values(data).filter((d) => d && d.length > 0).length;
  confidence += Math.min(30, sourcesWithData * 3);

  if (data.lessons?.length > 5) confidence += 15;
  else if (data.lessons?.length > 0) confidence += 8;

  if (data.simulations?.length > 3) confidence += 15;
  else if (data.simulations?.length > 0) confidence += 8;

  if (data.evidence?.length > 5) confidence += 15;
  else if (data.evidence?.length > 0) confidence += 8;

  if (data.actions?.length > 10) confidence += 10;
  else if (data.actions?.length > 0) confidence += 5;

  if (data.competencies?.length > 5) confidence += 15;
  else if (data.competencies?.length > 0) confidence += 8;

  return Math.min(100, Math.round(confidence));
}

// ============================================================
// §10 — LEVEL DETERMINATION
// ============================================================

function determineLevel(readiness, profile) {
  const title = (profile?.[0]?.current_title || profile?.[0]?.title || "").toLowerCase();
  if (title.includes("ceo") || title.includes("cfo") || title.includes("coo") || title.includes("cto") || title.includes("chief")) return "C-Suite";
  if (title.includes("vp") || title.includes("vice president") || title.includes("svp")) return "VP / Executive";
  if (title.includes("director")) return "Director";
  if (title.includes("senior")) return "Senior Manager";

  if (readiness >= 85) return "Executive";
  if (readiness >= 70) return "Director";
  if (readiness >= 55) return "Senior Manager";
  if (readiness >= 40) return "Manager";
  return "Individual Contributor";
}

function determineTargetLevel(currentLevel, profile) {
  const targetRole = (profile?.[0]?.target_role || profile?.[0]?.career_goal || "").toLowerCase();
  if (targetRole) {
    if (targetRole.includes("ceo") || targetRole.includes("chief")) return "C-Suite";
    if (targetRole.includes("vp") || targetRole.includes("executive")) return "VP / Executive";
    if (targetRole.includes("director")) return "Director";
    if (targetRole.includes("senior")) return "Senior Manager";
  }
  const levels = ["Individual Contributor", "Manager", "Senior Manager", "Director", "VP / Executive", "C-Suite"];
  const idx = levels.indexOf(currentLevel);
  return levels[Math.min(idx + 1, levels.length - 1)];
}

// ============================================================
// §11 — CAREER TIMELINE
// ============================================================

export function generateCareerTimeline(forecast) {
  const readiness = forecast.readiness_score;
  const timeline = forecast.timeline_label || "6 Months";
  const timelineConfidence = forecast.timeline_confidence || "medium";

  return [
    { level: "Current Role", status: "current", estimatedDate: "Now", confidence: "high" },
    { level: "Next Promotion", status: readiness >= 85 ? "ready" : "targeting", estimatedDate: timeline, confidence: timelineConfidence },
    { level: "Senior Leadership", status: "future", estimatedDate: readiness >= 70 ? "12-18 months" : "2-3 years", confidence: "medium" },
    { level: "Executive", status: "future", estimatedDate: readiness >= 70 ? "3-5 years" : "5+ years", confidence: "low" },
    { level: "Board Ready", status: "future", estimatedDate: "7+ years", confidence: "low" },
  ];
}

// ============================================================
// §12 — AI GROWTH NARRATIVE™
// ============================================================

export async function generateGrowthNarrative(user, forecast) {
  try {
    const strengths = (forecast.strengths || []).slice(0, 3).map((s) => `${s.label} (${s.score}%)`).join(", ");
    const gaps = (forecast.skill_gaps || []).slice(0, 3).map((g) => `${g.label} (gap: ${g.gap}%)`).join(", ");
    const priorities = (forecast.improvement_priorities || []).slice(0, 3).map((p) => `${p.action} (+${p.impact}%)`).join(", ");

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an executive AI coach for EXECLEAD.AI. Generate a growth narrative for the following promotion forecast.

Executive: ${user.full_name || "Unknown"}
Current Level: ${forecast.current_level}
Target Level: ${forecast.target_level}
Promotion Readiness: ${forecast.readiness_score}%
Promotion Probability: ${forecast.probability_score}%
Career Momentum: ${forecast.momentum}
Timeline: ${forecast.timeline_label}
Confidence: ${forecast.confidence_score}%

Top Strengths: ${strengths || "Insufficient data"}
Top Gaps: ${gaps || "No significant gaps"}
Recommended Actions: ${priorities || "Continue current trajectory"}

Answer these four questions concisely (2-3 sentences each):
1. Where am I today?
2. What is preventing my next promotion?
3. What should I improve first?
4. When am I likely to be promotion-ready?

Be specific, encouraging, and actionable.`,
      response_json_schema: {
        type: "object",
        properties: {
          where_am_i: { type: "string" },
          whats_preventing: { type: "string" },
          what_to_improve: { type: "string" },
          when_ready: { type: "string" },
          summary: { type: "string" },
        },
      },
    });
    return response;
  } catch {
    return null;
  }
}

// ============================================================
// §13 — MAIN ENTRY POINT
// ============================================================

export async function generatePromotionForecast(user) {
  const data = await fetchAllData(user.id);

  const { readiness, components } = calculateReadiness(data);
  const momentum = calculateMomentum(data);
  const probability = calculateProbability(readiness, data, momentum);
  const dimensions = evaluateDimensions(data);
  const strengths = calculateStrengthIndex(dimensions);
  const skillGaps = calculateSkillGaps(dimensions);
  const improvementPriorities = generateImprovementPriorities(dimensions);
  const timeline = estimateTimeline(readiness, dimensions);
  const confidence = calculateConfidence(data);
  const currentLevel = determineLevel(readiness, data.profile);
  const targetLevel = determineTargetLevel(currentLevel, data.profile);

  const forecast = {
    user_id: user.id,
    user_name: user.full_name,
    readiness_score: readiness,
    probability_score: probability,
    momentum,
    timeline_estimate: timeline.estimate,
    timeline_label: timeline.label,
    timeline_months: timeline.months,
    timeline_confidence: timeline.confidence,
    confidence_score: confidence,
    current_level: currentLevel,
    target_level: targetLevel,
    dimensions,
    strengths,
    skill_gaps: skillGaps,
    improvement_priorities: improvementPriorities,
    component_scores: components,
    period: getWeekKey(),
  };

  // Persist to entity for history
  try {
    await base44.entities.PromotionForecast.create({
      user_id: user.id,
      user_name: user.full_name,
      readiness_score: readiness,
      probability_score: probability,
      momentum,
      timeline_estimate: timeline.estimate,
      timeline_label: timeline.label,
      timeline_months: timeline.months,
      timeline_confidence: timeline.confidence,
      confidence_score: confidence,
      current_level: currentLevel,
      target_level: targetLevel,
      dimensions_json: JSON.stringify(dimensions),
      skill_gaps_json: JSON.stringify(skillGaps),
      strengths_json: JSON.stringify(strengths),
      improvement_priorities_json: JSON.stringify(improvementPriorities),
      component_scores_json: JSON.stringify(components),
      period: forecast.period,
    });
  } catch {}

  return forecast;
}

// ============================================================
// §14 — FORECAST RETRIEVAL
// ============================================================

export async function getLatestForecast(userId) {
  try {
    const forecasts = await base44.entities.PromotionForecast.filter({ user_id: userId }, "-created_date", 1);
    if (forecasts.length === 0) return null;
    const f = forecasts[0];
    return {
      ...f,
      dimensions: safeParse(f.dimensions_json, []),
      strengths: safeParse(f.strengths_json, []),
      skill_gaps: safeParse(f.skill_gaps_json, []),
      improvement_priorities: safeParse(f.improvement_priorities_json, []),
      component_scores: safeParse(f.component_scores_json, {}),
      growth_narrative: safeParse(f.growth_narrative_json, null),
    };
  } catch {
    return null;
  }
}

export async function getForecastHistory(userId, limit = 12) {
  try {
    return await base44.entities.PromotionForecast.filter({ user_id: userId }, "-created_date", limit);
  } catch {
    return [];
  }
}

// ============================================================
// §15 — PLATFORM ANALYTICS (Developer Dashboard)
// ============================================================

export async function getForecastAnalytics(limit = 500) {
  try {
    const forecasts = await base44.entities.PromotionForecast.list("-created_date", limit);

    const total = forecasts.length;
    const uniqueUsers = new Set(forecasts.map((f) => f.user_id)).size;
    const avgReadiness = total > 0 ? Math.round(forecasts.reduce((s, f) => s + (f.readiness_score || 0), 0) / total) : 0;
    const avgProbability = total > 0 ? Math.round(forecasts.reduce((s, f) => s + (f.probability_score || 0), 0) / total) : 0;
    const avgConfidence = total > 0 ? Math.round(forecasts.reduce((s, f) => s + (f.confidence_score || 0), 0) / total) : 0;

    // Timeline distribution
    const timelineDist = {};
    forecasts.forEach((f) => {
      const t = f.timeline_label || "Unknown";
      timelineDist[t] = (timelineDist[t] || 0) + 1;
    });

    // Momentum distribution
    const momentumDist = { increasing: 0, stable: 0, declining: 0 };
    forecasts.forEach((f) => { if (f.momentum) momentumDist[f.momentum]++; });

    // Confidence distribution
    const confDist = { high: 0, medium: 0, low: 0 };
    forecasts.forEach((f) => {
      if (f.confidence_score >= 75) confDist.high++;
      else if (f.confidence_score >= 50) confDist.medium++;
      else confDist.low++;
    });

    // Top skill gaps (aggregate)
    const gapCounts = {};
    forecasts.forEach((f) => {
      const gaps = safeParse(f.skill_gaps_json, []);
      gaps.forEach((g) => {
        gapCounts[g.label] = (gapCounts[g.label] || 0) + 1;
      });
    });
    const topGaps = Object.entries(gapCounts)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Top recommendations (aggregate)
    const recCounts = {};
    forecasts.forEach((f) => {
      const recs = safeParse(f.improvement_priorities_json, []);
      recs.forEach((r) => {
        recCounts[r.action] = (recCounts[r.action] || 0) + 1;
      });
    });
    const topRecs = Object.entries(recCounts)
      .map(([action, count]) => ({ action, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Level distribution
    const levelDist = {};
    forecasts.forEach((f) => {
      const l = f.current_level || "Unknown";
      levelDist[l] = (levelDist[l] || 0) + 1;
    });

    return {
      total, uniqueUsers, avgReadiness, avgProbability, avgConfidence,
      timelineDist, momentumDist, confDist, topGaps, topRecs, levelDist,
      recentForecasts: forecasts.slice(0, 15),
    };
  } catch {
    return { total: 0, uniqueUsers: 0, avgReadiness: 0, avgProbability: 0, avgConfidence: 0, timelineDist: {}, momentumDist: {}, confDist: {}, topGaps: [], topRecs: [], levelDist: {}, recentForecasts: [] };
  }
}

// ============================================================
// §16 — ACTION CENTER INTEGRATION
// Top 5 highest-impact actions with estimated readiness increase
// ============================================================

export function getTopImpactActions(forecast) {
  if (!forecast?.improvement_priorities) return [];
  const today = new Date().toISOString().split("T")[0];
  return forecast.improvement_priorities.slice(0, 5).map((p) => ({
    title: p.action,
    description: `Improve ${p.dimension}: ${p.current}% → ${p.target}% (gap: ${p.gap}%). Estimated readiness increase: +${p.impact}%.`,
    action_type: "learning",
    priority: p.impact >= 4 ? "high" : "medium",
    source_module: "Promotion Forecast",
    source_path: p.path || "/academy",
    impact_score: p.impact * 10,
    estimated_minutes: 30,
    action_date: today,
  }));
}

// ============================================================
// §17 — HELPERS
// ============================================================

function getWeekKey() {
  const now = new Date();
  const year = now.getFullYear();
  const start = new Date(year, 0, 1);
  const days = Math.floor((now - start) / 86400000);
  const week = Math.ceil((days + start.getDay() + 1) / 7);
  return `${year}-W${String(week).padStart(2, "0")}`;
}

function safeParse(str, fallback) {
  try { return JSON.parse(str) || fallback; } catch { return fallback; }
}
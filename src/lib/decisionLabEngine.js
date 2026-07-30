/**
 * Executive Decision Lab™ — Strategic Decision Intelligence Platform
 *
 * AI-powered environment where executives practice making strategic business
 * decisions in realistic scenarios. Evaluates judgment, reasoning, trade-offs,
 * communication, stakeholder management, and long-term thinking.
 */
import { base44 } from "@/api/base44Client";

export const DECISION_CATEGORIES = [
  "Leadership", "Finance", "Operations", "Technology", "Cybersecurity",
  "AI Governance", "Digital Transformation", "Crisis Management", "Board Relations",
  "HR", "Mergers", "Product Strategy", "Customer Experience", "Innovation",
  "Compliance", "Government",
];

export const SCORING_DIMENSIONS = [
  { key: "strategic_thinking", label: "Strategic Thinking", color: "#6366f1" },
  { key: "risk_assessment", label: "Risk Assessment", color: "#ef4444" },
  { key: "financial_judgment", label: "Financial Judgment", color: "#f59e0b" },
  { key: "leadership", label: "Leadership", color: "#10b981" },
  { key: "communication", label: "Communication", color: "#0ea5e9" },
  { key: "stakeholder_awareness", label: "Stakeholder Awareness", color: "#ec4899" },
  { key: "innovation", label: "Innovation", color: "#a855f7" },
  { key: "ethics", label: "Ethics", color: "#22c55e" },
  { key: "execution", label: "Execution", color: "#eab308" },
  { key: "long_term_thinking", label: "Long-Term Thinking", color: "#8b5cf6" },
];

export const PERSPECTIVE_ROLES = [
  "CEO", "CFO", "CTO", "CHRO", "COO", "Board Member", "Customer", "Investor", "Government",
];

export const DNA_ARCHETYPES = [
  { name: "Risk Taker", color: "#ef4444", dims: ["innovation", "execution"], desc: "Bold, decisive, comfortable with ambiguity" },
  { name: "Data Driven", color: "#0ea5e9", dims: ["risk_assessment", "financial_judgment"], desc: "Anchors decisions in evidence and metrics" },
  { name: "People First", color: "#ec4899", dims: ["leadership", "stakeholder_awareness"], desc: "Centers people and culture in every call" },
  { name: "Strategic Thinker", color: "#6366f1", dims: ["strategic_thinking", "long_term_thinking"], desc: "Thinks in systems and second-order effects" },
  { name: "Consensus Builder", color: "#10b981", dims: ["stakeholder_awareness", "communication"], desc: "Aligns stakeholders before moving" },
  { name: "Innovator", color: "#a855f7", dims: ["innovation", "long_term_thinking"], desc: "Sees possibilities others miss" },
  { name: "Operational Optimizer", color: "#eab308", dims: ["execution", "financial_judgment"], desc: "Turns strategy into disciplined execution" },
  { name: "Visionary", color: "#8b5cf6", dims: ["strategic_thinking", "innovation"], desc: "Paints a future and pulls others toward it" },
  { name: "Balanced Leader", color: "#14b8a6", dims: ["leadership", "communication", "execution"], desc: "Even-handed across every dimension" },
];

export const ACHIEVEMENTS = [
  { id: "first_decision", name: "First Decision™", description: "Complete your first scenario", icon: "🎯" },
  { id: "strategic_thinker", name: "Strategic Thinker™", description: "Score 80+ in Strategic Thinking on 5 scenarios", icon: "🧠" },
  { id: "board_ready", name: "Board Ready™", description: "Complete 5 Board Relations scenarios", icon: "🏛️" },
  { id: "crisis_leader", name: "Crisis Leader™", description: "Complete 5 Crisis Management scenarios", icon: "🚨" },
  { id: "innovation_champion", name: "Innovation Champion™", description: "Complete 5 Innovation scenarios", icon: "💡" },
  { id: "decision_master", name: "Decision Master™", description: "Score 90+ overall on 10 scenarios", icon: "🏆" },
  { id: "250_scenarios", name: "250 Scenarios Completed™", description: "Complete 250 scenarios", icon: "👑" },
];

/* ============================================================
   AI Evaluation — full decision intelligence in one call
   ============================================================ */

export async function evaluateDecision(scenario, chosenStrategy, explanation) {
  const optionsText = (scenario.strategy_options || [])
    .map((o) => `- ${o.name}: ${o.description} (trade-offs: ${o.trade_offs || "n/a"})`)
    .join("\n");

  const prompt = `You are the EXEC™ Executive Decision Mentor evaluating a leader's decision in a high-stakes business scenario. You never simply say "correct" — you teach reasoning, challenge assumptions, and surface alternatives.

SCENARIO: ${scenario.title}
CATEGORY: ${scenario.category}
DIFFICULTY: ${scenario.difficulty}

BACKGROUND: ${scenario.background}
BUSINESS CONTEXT: ${scenario.business_context || ""}
CONSTRAINTS: ${(scenario.constraints || []).join("; ")}
STAKEHOLDERS: ${(scenario.stakeholders || []).join("; ")}
RISKS: ${(scenario.risks || []).join("; ")}
UNKNOWN INFORMATION: ${(scenario.unknown_information || []).join("; ")}
TIME PRESSURE: ${scenario.time_pressure || ""}
SUCCESS CRITERIA: ${(scenario.success_criteria || []).join("; ")}

STRATEGY OPTIONS:
${optionsText}

LEADER'S CHOSEN STRATEGY: ${chosenStrategy?.name || ""}
LEADER'S EXPLANATION:
"""
${explanation}
"""

Evaluate the decision rigorously. Score 0-100 on each of the 10 dimensions. Identify strengths, blind spots, missed opportunities, and alternative strategies. Generate 4 challenging questions an executive mentor would ask (e.g., "What would your CFO say?", "What happens in 12 months?", "What assumptions are you making?"). Provide viewpoints from CEO, CFO, CTO, CHRO, COO, Board Member, Customer, Investor, Government (1-2 sentences each). Compare the leader's decision vs an alternative vs the expert strategy vs your AI recommendation, explaining trade-offs, advantages, risks, and expected outcomes. Provide 4 reflection prompts. Return JSON only.`;

  const schema = {
    type: "object",
    properties: {
      scores: {
        type: "object",
        properties: Object.fromEntries(SCORING_DIMENSIONS.map((d) => [d.key, { type: "number" }])),
      },
      overall: { type: "number" },
      strengths: { type: "array", items: { type: "string" } },
      blind_spots: { type: "array", items: { type: "string" } },
      missed_opportunities: { type: "array", items: { type: "string" } },
      alternative_strategies: { type: "array", items: { type: "string" } },
      business_impact: { type: "string" },
      confidence_level: { type: "number" },
      evidence_quality: { type: "number" },
      challenge_questions: {
        type: "array",
        items: { type: "object", properties: { question: { type: "string" }, focus: { type: "string" } } },
      },
      perspectives: {
        type: "array",
        items: { type: "object", properties: { role: { type: "string" }, viewpoint: { type: "string" } } },
      },
      comparison: {
        type: "object",
        properties: {
          your_decision_summary: { type: "string" },
          alternative_summary: { type: "string" },
          expert_strategy: { type: "string" },
          ai_recommendation: { type: "string" },
          trade_offs: { type: "string" },
          advantages: { type: "string" },
          risks: { type: "string" },
          expected_outcomes: { type: "string" },
        },
      },
      reflection_prompts: { type: "array", items: { type: "string" } },
      feedback: { type: "string" },
    },
    required: ["scores", "overall", "strengths", "blind_spots", "challenge_questions", "perspectives", "comparison", "feedback"],
  };

  return await base44.integrations.Core.InvokeLLM({ prompt, response_json_schema: schema });
}

/* ============================================================
   Decision DNA™ — archetype profile from decision history
   ============================================================ */

export function computeDNA(attempts) {
  const dimSums = {};
  const dimCounts = {};
  attempts.forEach((a) => {
    let s = a.scores_json;
    if (typeof s === "string") { try { s = JSON.parse(s); } catch { s = {}; } }
    Object.entries(s || {}).forEach(([k, v]) => {
      dimSums[k] = (dimSums[k] || 0) + (v || 0);
      dimCounts[k] = (dimCounts[k] || 0) + 1;
    });
  });
  const dimensionAverages = {};
  Object.keys(dimSums).forEach((k) => { dimensionAverages[k] = Math.round(dimSums[k] / (dimCounts[k] || 1)); });

  const archetypeScores = DNA_ARCHETYPES.map((arch) => {
    const vals = arch.dims.map((d) => dimensionAverages[d] || 0);
    const score = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
    return { name: arch.name, color: arch.color, desc: arch.desc, score };
  }).sort((a, b) => b.score - a.score);

  const balanced = Object.values(dimensionAverages);
  const variance = balanced.length ? Math.round(Math.sqrt(balanced.reduce((a, b) => a + Math.pow(b - (balanced.reduce((x, y) => x + y, 0) / balanced.length), 2), 0) / balanced.length)) : 0;
  if (variance < 8 && attempts.length >= 5) {
    archetypeScores.unshift({ name: "Balanced Leader", color: "#14b8a6", desc: "Even-handed across every dimension", score: Math.round(balanced.reduce((a, b) => a + b, 0) / balanced.length) });
  }

  return {
    archetypes: archetypeScores.slice(0, 5),
    dominant_archetype: archetypeScores[0]?.name || "Undecided",
    dimensionAverages,
  };
}

/* ============================================================
   Patterns, analytics, achievements
   ============================================================ */

export function computePatterns(attempts) {
  const strengthCount = {};
  const weaknessCount = {};
  const strategyCount = {};
  const catCount = {};
  attempts.forEach((a) => {
    (a.strengths || []).forEach((s) => { strengthCount[s] = (strengthCount[s] || 0) + 1; });
    (a.blind_spots || []).forEach((s) => { weaknessCount[s] = (weaknessCount[s] || 0) + 1; });
    if (a.chosen_strategy_name) strategyCount[a.chosen_strategy_name] = (strategyCount[a.chosen_strategy_name] || 0) + 1;
    if (a.category) catCount[a.category] = (catCount[a.category] || 0) + 1;
  });
  const top = (obj, n) => Object.entries(obj).sort((a, b) => b[1] - a[1]).slice(0, n).map(([k]) => k);
  const categories = Object.keys(catCount);
  const diversity = categories.length;
  return {
    recurring_strengths: top(strengthCount, 5),
    recurring_weaknesses: top(weaknessCount, 5),
    favorite_strategies: top(strategyCount, 3),
    categoryDistribution: catCount,
    decision_diversity: diversity,
  };
}

export function getAnalytics(attempts) {
  if (!attempts.length) return { total: 0, avgQuality: 0, dimensionAverages: {}, categoryBreakdown: {}, trend: [], reflectionRate: 0, confidence: 0 };
  const dimSums = {}; const dimCounts = {};
  const catSums = {}; const catCounts = {};
  let confSum = 0; let reflected = 0;
  const trend = attempts.slice().reverse().map((a, i) => ({ index: i + 1, score: a.overall_score || 0 }));
  attempts.forEach((a) => {
    let s = a.scores_json; if (typeof s === "string") { try { s = JSON.parse(s); } catch { s = {}; } }
    Object.entries(s || {}).forEach(([k, v]) => { dimSums[k] = (dimSums[k] || 0) + (v || 0); dimCounts[k] = (dimCounts[k] || 0) + 1; });
    if (a.category) { catSums[a.category] = (catSums[a.category] || 0) + (a.overall_score || 0); catCounts[a.category] = (catCounts[a.category] || 0) + 1; }
    confSum += a.confidence_level || 0;
    if (a.reflection_json) reflected++;
  });
  const dimensionAverages = {}; Object.keys(dimSums).forEach((k) => { dimensionAverages[k] = Math.round(dimSums[k] / (dimCounts[k] || 1)); });
  const categoryBreakdown = {}; Object.keys(catSums).forEach((k) => { categoryBreakdown[k] = Math.round(catSums[k] / (catCounts[k] || 1)); });
  return {
    total: attempts.length,
    avgQuality: Math.round(attempts.reduce((a, x) => a + (x.overall_score || 0), 0) / attempts.length),
    dimensionAverages,
    categoryBreakdown,
    trend,
    reflectionRate: Math.round((reflected / attempts.length) * 100),
    confidence: Math.round(confSum / attempts.length),
  };
}

export function getAchievements({ attempts }) {
  const catCount = {};
  let highStrat = 0; let highOverall = 0;
  attempts.forEach((a) => {
    catCount[a.category] = (catCount[a.category] || 0) + 1;
    let s = a.scores_json; if (typeof s === "string") { try { s = JSON.parse(s); } catch { s = {}; } }
    if ((s?.strategic_thinking || 0) >= 80) highStrat++;
    if ((a.overall_score || 0) >= 90) highOverall++;
  });
  const check = (id, cond) => ({ ...ACHIEVEMENTS.find((a) => a.id === id), earned: cond });
  return [
    check("first_decision", attempts.length >= 1),
    check("strategic_thinker", highStrat >= 5),
    check("board_ready", (catCount["Board Relations"] || 0) >= 5),
    check("crisis_leader", (catCount["Crisis Management"] || 0) >= 5),
    check("innovation_champion", (catCount["Innovation"] || 0) >= 5),
    check("decision_master", highOverall >= 10),
    check("250_scenarios", attempts.length >= 250),
  ];
}

export function difficultyColor(d) {
  return d === "expert" ? "#ef4444" : d === "advanced" ? "#f59e0b" : d === "intermediate" ? "#0ea5e9" : "#10b981";
}
export function categoryColor(c) {
  const i = DECISION_CATEGORIES.indexOf(c);
  const palette = ["#6366f1", "#f59e0b", "#10b981", "#0ea5e9", "#ef4444", "#a855f7", "#8b5cf6", "#ec4899", "#eab308", "#14b8a6", "#f97316", "#22c55e", "#06b6d4", "#d946ef", "#64748b", "#84cc16"];
  return palette[i % palette.length];
}
export function uid(prefix = "id") { return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`; }
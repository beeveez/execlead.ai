import { callAI } from "@/lib/ai";

// ============================================================
// EXECUTIVE SIMULATION INTELLIGENCE™ — Unified Evaluation Engine
// Version 3.0
// ------------------------------------------------------------
// Unifies Executive Simulator™, Executive Debate™, and
// Executive Council™ under ONE evaluation framework, evidence
// model, and readiness contribution model.
//
// Every simulation produces:
//   • Per-competency explainable scores (Executive Competency Framework™)
//   • Decision Intelligence™ multi-dimensional evaluation
//   • Verified evidence (Evidence Generator™ → Evidence Ledger™)
//   • AI Coaching Feedback™ referencing demonstrated evidence
//   • Executive Readiness™ gain (competency-demonstrated, not activity-only)
//   • Optional Council Report™ (multiple executive personas)
//   • Optional Debate Evaluation™ (structured argument assessment)
//
// Reuses: EECF competency names, EvidenceItem shape, readiness engine.
// ============================================================

// ── Executive Competency Framework™ — the 12 canonical competencies ──
export const SIM_COMPETENCY_FRAMEWORK = [
  { id: "strategic_thinking", name: "Strategic Thinking", domain: "lead_business", description: "Frames decisions in long-term, market, and enterprise context." },
  { id: "executive_communication", name: "Executive Communication", domain: "lead_legacy", description: "Articulates decisions with clarity, structure, and executive presence." },
  { id: "decision_quality", name: "Decision Quality", domain: "lead_yourself", description: "Weighs evidence, alternatives, and risk before committing." },
  { id: "business_acumen", name: "Business Acumen", domain: "lead_business", description: "Reads commercial, financial, and market implications accurately." },
  { id: "executive_presence", name: "Executive Presence", domain: "lead_yourself", description: "Projects confidence, gravitas, and credibility under pressure." },
  { id: "influence", name: "Influence", domain: "lead_legacy", description: "Moves stakeholders toward a position without coercive power." },
  { id: "stakeholder_management", name: "Stakeholder Management", domain: "lead_change", description: "Identifies and aligns divergent stakeholder interests." },
  { id: "delegation", name: "Delegation", domain: "lead_people", description: "Distributes accountability while retaining ownership of outcomes." },
  { id: "change_leadership", name: "Change Leadership", domain: "lead_change", description: "Mobilizes the organization through transformation and resistance." },
  { id: "risk_leadership", name: "Risk Leadership", domain: "lead_legacy", description: "Recognizes, owns, and mitigates enterprise risk decisively." },
  { id: "organizational_leadership", name: "Organizational Leadership", domain: "lead_people", description: "Aligns structure, talent, and culture to execute strategy." },
  { id: "innovation_leadership", name: "Innovation Leadership", domain: "lead_technology", description: "Champions new approaches and creates space for experimentation." },
];

// ── Executive Scenario Library™ — domains × scenarios ──
export const SCENARIO_LIBRARY = [
  // Technology Leadership
  { id: "tech_cybersecurity_crisis", domain: "Technology Leadership", title: "Cybersecurity Crisis", difficulty: "expert", paths: ["Technology Leadership", "Future Executive Leaders"], competencies: ["risk_leadership", "decision_quality", "executive_communication", "stakeholder_management", "change_leadership"], description: "A zero-day breach is live. Contain, communicate, and recover without destroying trust." },
  { id: "tech_digital_transformation", domain: "Technology Leadership", title: "Digital Transformation", difficulty: "advanced", paths: ["Technology Leadership", "Business Leadership"], competencies: ["strategic_thinking", "change_leadership", "innovation_leadership", "organizational_leadership", "stakeholder_management"], description: "Lead a multi-year transformation across legacy systems and resistant teams." },
  { id: "tech_ai_governance", domain: "Technology Leadership", title: "AI Governance", difficulty: "advanced", paths: ["Technology Leadership"], competencies: ["risk_leadership", "decision_quality", "business_acumen", "innovation_leadership"], description: "Set enterprise AI policy balancing speed, ethics, and competitive pressure." },
  { id: "tech_enterprise_architecture", domain: "Technology Leadership", title: "Enterprise Architecture", difficulty: "advanced", paths: ["Technology Leadership"], competencies: ["strategic_thinking", "organizational_leadership", "decision_quality", "innovation_leadership"], description: "Re-architect the platform to survive 10x scale without halting delivery." },

  // Business Leadership
  { id: "biz_market_expansion", domain: "Business Leadership", title: "Market Expansion", difficulty: "advanced", paths: ["Business Leadership", "Future Executive Leaders"], competencies: ["strategic_thinking", "business_acumen", "risk_leadership", "stakeholder_management"], description: "Enter a new geography with uncertain demand and entrenched incumbents." },
  { id: "biz_budget_reduction", domain: "Business Leadership", title: "Budget Reduction", difficulty: "intermediate", paths: ["Business Leadership", "Operations Leadership"], competencies: ["decision_quality", "organizational_leadership", "stakeholder_management", "executive_communication"], description: "Cut 15% of spend without crippling growth or losing critical talent." },
  { id: "biz_org_restructuring", domain: "Business Leadership", title: "Organizational Restructuring", difficulty: "expert", paths: ["Business Leadership", "People Leadership"], competencies: ["change_leadership", "organizational_leadership", "stakeholder_management", "executive_communication"], description: "Redesign the operating model after a merger; retain the best, release with dignity." },

  // Finance Leadership
  { id: "fin_capital_allocation", domain: "Finance Leadership", title: "Capital Allocation", difficulty: "expert", paths: ["Finance Leadership"], competencies: ["business_acumen", "decision_quality", "strategic_thinking", "risk_leadership"], description: "Allocate this year's capital across competing bets with asymmetric returns." },
  { id: "fin_investment_decisions", domain: "Finance Leadership", title: "Investment Decisions", difficulty: "advanced", paths: ["Finance Leadership"], competencies: ["business_acumen", "risk_leadership", "decision_quality"], description: "Approve or reject a major acquisition with incomplete diligence." },
  { id: "fin_financial_risk", domain: "Finance Leadership", title: "Financial Risk", difficulty: "advanced", paths: ["Finance Leadership"], competencies: ["risk_leadership", "decision_quality", "stakeholder_management"], description: "Hedge exposure amid a currency crisis with treasury and the board watching." },

  // Human Resources
  { id: "hr_succession_planning", domain: "Human Resources", title: "Succession Planning", difficulty: "expert", paths: ["People Leadership", "Future Executive Leaders"], competencies: ["organizational_leadership", "stakeholder_management", "strategic_thinking", "executive_communication"], description: "Build a credible successor bench for three C-level roles in 12 months." },
  { id: "hr_executive_hiring", domain: "Human Resources", title: "Executive Hiring", difficulty: "advanced", paths: ["People Leadership"], competencies: ["decision_quality", "stakeholder_management", "executive_presence", "influence"], description: "Choose between an internal rising star and a decorated external candidate." },
  { id: "hr_workforce_transformation", domain: "Human Resources", title: "Workforce Transformation", difficulty: "advanced", paths: ["People Leadership", "Change Leadership"], competencies: ["change_leadership", "organizational_leadership", "delegation", "stakeholder_management"], description: "Reskill 40% of the workforce as AI reshapes core roles." },

  // Healthcare
  { id: "health_patient_safety_crisis", domain: "Healthcare Leadership", title: "Patient Safety Crisis", difficulty: "expert", paths: ["Healthcare Leadership"], competencies: ["risk_leadership", "decision_quality", "executive_communication", "change_leadership"], description: "A sentinel event is public. Lead clinical, regulatory, and family response simultaneously." },
  { id: "health_regulatory_compliance", domain: "Healthcare Leadership", title: "Regulatory Compliance", difficulty: "advanced", paths: ["Healthcare Leadership"], competencies: ["risk_leadership", "organizational_leadership", "stakeholder_management"], description: "Close a compliance gap before a regulator arrives, without halting care." },

  // Government
  { id: "gov_public_policy", domain: "Government & Public Sector", title: "Public Policy Decisions", difficulty: "expert", paths: ["Government & Public Sector Leadership"], competencies: ["strategic_thinking", "stakeholder_management", "executive_communication", "decision_quality"], description: "Choose a policy path with competing citizen, fiscal, and political pressures." },
  { id: "gov_crisis_management", domain: "Government & Public Sector", title: "Crisis Management", difficulty: "expert", paths: ["Government & Public Sector Leadership"], competencies: ["risk_leadership", "executive_communication", "decision_quality", "change_leadership"], description: "Lead a multi-agency response to a fast-moving public emergency." },
];

// ── Council Personas — multiple executive viewpoints ──
export const COUNCIL_PERSONAS = [
  { id: "ceo", name: "CEO Perspective", lens: "Enterprise strategy, growth, and shareholder value.", focus: "Does this move the enterprise forward and create durable value?" },
  { id: "cfo", name: "CFO Perspective", lens: "Capital, risk, and financial sustainability.", focus: "Is this financially sound and properly risk-weighted?" },
  { id: "coo", name: "COO Perspective", lens: "Execution, operations, and delivery.", focus: "Can the organization actually execute this, and at what cost?" },
  { id: "chro", name: "CHRO Perspective", lens: "People, culture, and talent.", focus: "What happens to the people, and does culture survive?" },
  { id: "cto", name: "CTO / CIO Perspective", lens: "Technology, architecture, and AI.", focus: "Is the technology choice sound and future-proof?" },
  { id: "board", name: "Board Member Perspective", lens: "Governance, ethics, and oversight.", focus: "Would the board approve this on governance and ethics grounds?" },
  { id: "risk", name: "Risk Officer Perspective", lens: "Enterprise risk and resilience.", focus: "What is the worst credible outcome, and can we survive it?" },
];

// ── Debate Evaluation Dimensions ──
export const DEBATE_DIMENSIONS = [
  { id: "argument_quality", name: "Argument Quality" },
  { id: "strategic_reasoning", name: "Strategic Reasoning" },
  { id: "evidence_usage", name: "Evidence Usage" },
  { id: "executive_communication", name: "Executive Communication" },
  { id: "influence", name: "Influence" },
  { id: "negotiation", name: "Negotiation" },
  { id: "counterargument_handling", name: "Counterargument Handling" },
  { id: "decision_consistency", name: "Decision Consistency" },
];

// ── Decision Intelligence™ Dimensions ──
export const DECISION_DIMENSIONS = [
  { id: "decision_summary", name: "Decision Summary" },
  { id: "strategic_alignment", name: "Strategic Alignment" },
  { id: "risk_assessment", name: "Risk Assessment" },
  { id: "stakeholder_impact", name: "Stakeholder Impact" },
  { id: "business_impact", name: "Business Impact" },
  { id: "ethical_considerations", name: "Ethical Considerations" },
  { id: "communication_effectiveness", name: "Communication Effectiveness" },
  { id: "execution_feasibility", name: "Execution Feasibility" },
  { id: "long_term_sustainability", name: "Long-Term Sustainability" },
  { id: "alternative_approaches", name: "Alternative Approaches" },
];

// ── Simulation types ──
export const SIM_TYPES = {
  simulator: "Executive Simulator™",
  debate: "Executive Debate™",
  council: "Executive Council™",
};

// ── Enterprise Framework Mapping (Enterprise Mode) ──
// Extends the canonical framework with mapped external competencies.
export function mapEnterpriseFramework(mapping) {
  // mapping: { frameworkName, mappings: [{ externalCompetency, eecfCompetencyId }] }
  if (!mapping || !mapping.mappings) return { framework: SIM_COMPETENCY_FRAMEWORK, mapped: false };
  const extended = SIM_COMPETENCY_FRAMEWORK.map((c) => {
    const ext = mapping.mappings.filter((m) => m.eecfCompetencyId === c.id).map((m) => m.externalCompetency);
    return { ...c, enterpriseAliases: ext };
  });
  return { framework: extended, mapped: true, frameworkName: mapping.frameworkName };
}

// ── Deterministic Readiness Gain ──
// Competency-demonstrated gain (not activity count). Capped at a per-simulation ceiling.
export function computeReadinessGain(competencyEvaluations) {
  if (!competencyEvaluations || competencyEvaluations.length === 0) {
    return { points: 0, avgContribution: 0, competenciesImproved: [], confidenceIncrease: 0, simulationImpact: "Minimal" };
  }
  const contributing = competencyEvaluations.filter((c) => (c.readinessContribution || 0) > 0);
  const avg = contributing.length
    ? Math.round(contributing.reduce((s, c) => s + (c.readinessContribution || 0), 0) / contributing.length)
    : 0;
  const points = Math.min(8, Math.round(avg / 12)); // up to +8 readiness points per simulation
  const competenciesImproved = contributing
    .filter((c) => (c.score || 0) >= 60)
    .map((c) => c.competency);
  const confidenceIncrease = Math.min(5, Math.round(avg / 20));
  const impact = points >= 6 ? "High" : points >= 3 ? "Moderate" : points >= 1 ? "Low" : "Minimal";
  return { points, avgContribution: avg, competenciesImproved, confidenceIncrease, simulationImpact: impact };
}

// ── Build the Evidence Generator™ record (EvidenceItem shape) ──
export function buildSimulationEvidenceRecord(evalResult, context = {}) {
  if (!evalResult) return null;
  const competencies = (evalResult.competencyEvaluations || [])
    .filter((c) => (c.score || 0) >= 60)
    .map((c) => c.competency);
  return {
    title: `${context.scenarioTitle || "Executive Simulation"} — ${context.simType || "Simulation"} Evidence`,
    evidence_type: "project_summary",
    source: "Executive Simulation Intelligence™",
    source_type: "ai_extracted",
    verification_status: "verified",
    confidence: evalResult.evidenceRecord?.evidenceConfidence || 0,
    evidence_quality: evalResult.evidenceRecord?.evidenceReliability || 0,
    authenticity: 80,
    freshness: 100,
    overall_quality: evalResult.evidenceRecord?.evidenceConfidence || 0,
    related_competencies: JSON.stringify(competencies),
    description: [
      `Scenario: ${context.scenarioTitle || "—"}`,
      `Decision: ${evalResult.decisionSummary || "—"}`,
      `Competencies demonstrated: ${competencies.join(", ") || "—"}`,
      `Strengths: ${(evalResult.strengths || []).join("; ") || "—"}`,
      `Growth areas: ${(evalResult.growthAreas || []).join("; ") || "—"}`,
      `Readiness gain: +${(evalResult.readinessGain?.points) || 0} points`,
    ].join("\n"),
    related_modules: JSON.stringify(["Executive Simulator™", "Executive Portfolio™", "Executive Identity Graph™", "Evidence Ledger™"]),
  };
}

// ── Main evaluation entry point ──
// type: "simulator" | "debate" | "council"
// input: { scenario, decision, explanation, leadershipPath, userContext, enterpriseFramework, includeCouncil, includeDebate }
export async function evaluateSimulation(input) {
  const {
    type = "simulator",
    scenario,
    decision,
    explanation = "",
    leadershipPath,
    userContext,
    enterpriseFramework,
    includeCouncil = false,
    includeDebate = false,
  } = input;

  const simTypeLabel = SIM_TYPES[type] || SIM_TYPES.simulator;
  const { framework, mapped, frameworkName } = mapEnterpriseFramework(enterpriseFramework);
  const competencyList = framework
    .map((c) => `- ${c.name}${c.enterpriseAliases?.length ? ` (also: ${c.enterpriseAliases.join(", ")})` : ""}`)
    .join("\n");

  const profileBlock = userContext
    ? `EXECUTIVE RUNTIME PROFILE:\n${JSON.stringify(userContext).slice(0, 1200)}`
    : "EXECUTIVE RUNTIME PROFILE: not provided (evaluate on the demonstrated decision alone).";

  const scenarioBlock = scenario
    ? `SCENARIO: ${scenario.title || scenario}\nDomain: ${scenario.domain || "—"}\nDifficulty: ${scenario.difficulty || "—"}\n${scenario.description || ""}`
    : "SCENARIO: not specified.";

  const decisionBlock = `DECISION MADE:\n${decision || "—"}\n\nPARTICIPANT'S RATIONALE:\n${explanation || "—"}`;

  const pathBlock = leadershipPath
    ? `LEADERSHIP PATH: ${leadershipPath}. Weight the evaluation toward competencies this path demands.`
    : "LEADERSHIP PATH: not specified; evaluate all competencies equally.";

  const enterpriseBlock = mapped
    ? `ENTERPRISE FRAMEWORK ACTIVE: "${frameworkName}". Where an enterprise competency maps to a canonical one, report both names.`
    : "ENTERPRISE FRAMEWORK: none. Use the canonical Executive Competency Framework™.";

  const councilBlock = includeCouncil
    ? `COUNCIL REPORT REQUIRED: After the core evaluation, produce councilPerspectives for each of these personas, each critiquing the decision from its own viewpoint: ${COUNCIL_PERSONAS.map((p) => p.name).join(", ")}.`
    : "COUNCIL REPORT: not required (set councilReport to null).";

  const debateBlock = includeDebate
    ? `DEBATE EVALUATION REQUIRED: Evaluate the participant's argument using these dimensions: ${DEBATE_DIMENSIONS.map((d) => d.name).join(", ")}. Populate debateEvaluation.`
    : "DEBATE EVALUATION: not required (set debateEvaluation to null).";

  const prompt = `You are the Executive Simulation Intelligence™ evaluation engine — an AI Executive Assessment Center, not a chatbot. You evaluate a participant's executive decision in a high-stakes simulation and produce a fully explainable, evidence-generating assessment.

${profileBlock}

${scenarioBlock}

${decisionBlock}

${pathBlock}

${enterpriseBlock}

${councilBlock}

${debateBlock}

EXECUTIVE COMPETENCY FRAMEWORK™ — evaluate the participant against each:
${competencyList}

For EVERY competency, assign:
- score (0-100) — demonstrated capability in THIS decision
- confidence (0-100) — how confident you are in that score given the available evidence
- evidenceQuality (0-100) — how much usable evidence the decision exposed
- improvementTrend ("up" | "steady" | "down") — inferred trajectory vs. a typical peer
- readinessContribution (0-12) — how much this demonstration advances Executive Readiness™
- why — 1-2 sentences explaining WHY this score was assigned, citing specific behaviors in the decision. NEVER return a score without a why.

DECISION INTELLIGENCE™ — evaluate the decision across these dimensions (each 0-100 with a one-sentence why):
${DECISION_DIMENSIONS.map((d) => `- ${d.name}`).join("\n")}

STRENGTHS: 3-5 specific demonstrated strengths (reference the decision).
GROWTH AREAS: 3-5 specific areas to develop (reference the decision).

COACHING FEEDBACK: Write as EXEC™ — a personalized, evidence-referenced coaching message (2-3 sentences) plus 3 specific recommendations. Recommendations must reference verified evidence from this simulation, not generic advice. Example tone: "You demonstrated strong strategic thinking, but your stakeholder communication introduced unnecessary risk."

READINESS GAIN: Summarize the measurable readiness impact — which competencies improved, a confidence increase (0-5), and a simulationImpact label (Minimal/Low/Moderate/High).

EVIDENCE RECORD: Produce a verified evidence record with: evidenceLevel ("Demonstrated" | "Emerging" | "Insufficient"), evidenceConfidence (0-100), evidenceReliability (0-100), journeyProgress (Journey Points earned, 0-300), source ("Executive Simulation Intelligence™"), and a one-line summary.

RULES:
- Every score MUST have a why. Scores without explanations are not permitted.
- Be a rigorous, evidence-based assessor — do not flatter. If a competency wasn't demonstrated, score it low and say so.
- Do not invent competencies beyond the framework.
- Respond ONLY with the JSON object matching the schema.`;

  const schema = {
    type: "object",
    properties: {
      simulationType: { type: "string" },
      decisionSummary: { type: "string", description: "One-paragraph summary of the decision made." },
      competencyEvaluations: {
        type: "array",
        items: {
          type: "object",
          properties: {
            competency: { type: "string" },
            score: { type: "number" },
            confidence: { type: "number" },
            evidenceQuality: { type: "number" },
            improvementTrend: { type: "string", enum: ["up", "steady", "down"] },
            readinessContribution: { type: "number" },
            why: { type: "string" },
          },
        },
      },
      decisionIntelligence: {
        type: "array",
        items: {
          type: "object",
          properties: {
            dimension: { type: "string" },
            score: { type: "number" },
            why: { type: "string" },
          },
        },
      },
      strengths: { type: "array", items: { type: "string" } },
      growthAreas: { type: "array", items: { type: "string" } },
      coachingFeedback: {
        type: "object",
        properties: {
          message: { type: "string" },
          recommendations: { type: "array", items: { type: "string" } },
          evidenceReferences: { type: "array", items: { type: "string" } },
        },
      },
      readinessGain: {
        type: "object",
        properties: {
          competenciesImproved: { type: "array", items: { type: "string" } },
          confidenceIncrease: { type: "number" },
          simulationImpact: { type: "string", enum: ["Minimal", "Low", "Moderate", "High"] },
          journeyPoints: { type: "number" },
        },
      },
      evidenceRecord: {
        type: "object",
        properties: {
          evidenceLevel: { type: "string", enum: ["Demonstrated", "Emerging", "Insufficient"] },
          evidenceConfidence: { type: "number" },
          evidenceReliability: { type: "number" },
          journeyProgress: { type: "number" },
          source: { type: "string" },
          summary: { type: "string" },
        },
      },
      councilReport: {
        type: "object",
        properties: {
          personas: {
            type: "array",
            items: {
              type: "object",
              properties: {
                persona: { type: "string" },
                viewpoint: { type: "string" },
                sentiment: { type: "string", enum: ["support", "caution", "oppose"] },
                keyConcerns: { type: "array", items: { type: "string" } },
              },
            },
          },
          unifiedSummary: { type: "string" },
        },
      },
      debateEvaluation: {
        type: "object",
        properties: {
          dimensions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                dimension: { type: "string" },
                score: { type: "number" },
                why: { type: "string" },
              },
            },
          },
          feedback: { type: "string" },
        },
      },
    },
  };

  const result = await callAI("simulation_intelligence", { prompt, response_json_schema: schema });

  // Deterministic readiness gain override (single source of truth)
  const deterministicGain = computeReadinessGain(result?.competencyEvaluations);
  const merged = {
    ...result,
    readinessGain: {
      ...(result?.readinessGain || {}),
      points: deterministicGain.points,
      competenciesImproved: deterministicGain.competenciesImproved,
      confidenceIncrease: deterministicGain.confidenceIncrease,
      simulationImpact: deterministicGain.simulationImpact,
      journeyPoints: result?.evidenceRecord?.journeyProgress || deterministicGain.points * 40,
    },
  };
  return merged;
}

// ── Analytics: simulation history aggregation (Executive Analytics™) ──
// Operates on stored DecisionAttempt/SimulationSession records the pages already persist.
export function aggregateSimulationAnalytics(attempts) {
  if (!attempts || attempts.length === 0) {
    return {
      total: 0,
      avgOverall: 0,
      competencyGrowth: {},
      mostImprovedCompetency: null,
      highestRiskArea: null,
      growthVelocity: 0,
      readinessTrend: [],
    };
  }
  const byCompetency = {};
  attempts.forEach((a, i) => {
    const scores = a.scores_json ? safeParse(a.scores_json) : null;
    if (!scores) return;
    Object.entries(scores).forEach(([comp, score]) => {
      if (!byCompetency[comp]) byCompetency[comp] = [];
      byCompetency[comp].push({ idx: i, score });
    });
  });
  const competencyGrowth = {};
  let mostImproved = null;
  let mostImprovedDelta = -Infinity;
  Object.entries(byCompetency).forEach(([comp, arr]) => {
    const first = arr[0]?.score || 0;
    const last = arr[arr.length - 1]?.score || 0;
    const delta = last - first;
    competencyGrowth[comp] = { first, last, delta, count: arr.length };
    if (delta > mostImprovedDelta) { mostImprovedDelta = delta; mostImproved = comp; }
  });
  // Highest risk area = lowest current competency
  let highestRiskArea = null;
  let lowestScore = Infinity;
  Object.entries(competencyGrowth).forEach(([comp, g]) => {
    if (g.last < lowestScore) { lowestScore = g.last; highestRiskArea = comp; }
  });
  const readinessTrend = attempts.map((a, i) => ({ idx: i, readiness: a.overall_score || 0 }));
  const growthVelocity = readinessTrend.length > 1
    ? Math.round((readinessTrend[readinessTrend.length - 1].readiness - readinessTrend[0].readiness) / (readinessTrend.length - 1))
    : 0;
  return {
    total: attempts.length,
    avgOverall: Math.round(attempts.reduce((s, a) => s + (a.overall_score || 0), 0) / attempts.length),
    competencyGrowth,
    mostImprovedCompetency: mostImproved,
    highestRiskArea,
    growthVelocity,
    readinessTrend,
  };
}

function safeParse(s) { try { return typeof s === "string" ? JSON.parse(s) : s; } catch { return null; } }

// ── Scenario helpers ──
export function scenariosForPath(leadershipPath) {
  if (!leadershipPath) return SCENARIO_LIBRARY;
  return SCENARIO_LIBRARY.filter((s) => (s.paths || []).includes(leadershipPath));
}

export function scenariosForDomain(domain) {
  return SCENARIO_LIBRARY.filter((s) => s.domain === domain);
}

export const SCENARIO_DOMAINS = [...new Set(SCENARIO_LIBRARY.map((s) => s.domain))];
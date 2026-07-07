import { callAI } from "@/lib/ai";

// ============================================================
// EXECUTIVE COUNCIL 3.0 — AI BOARD OF DIRECTORS ENGINE
// Three-phase deliberation: Perspectives → Debate → Brief
// ============================================================

const PERSPECTIVE_SCHEMA = {
  type: "object",
  properties: {
    perspectives: {
      type: "array",
      items: {
        type: "object",
        properties: {
          persona_id: { type: "string" },
          viewpoint: { type: "string", description: "2-3 paragraphs from this executive's functional perspective" },
          sentiment: { type: "string", enum: ["support", "caution", "oppose"], description: "Overall stance on the proposal" },
          confidence: { type: "number", description: "0-100 confidence in their assessment" },
          stance_summary: { type: "string", description: "One-sentence summary of their position" },
          key_points: { type: "array", items: { type: "string" } },
          key_concerns: { type: "array", items: { type: "string" } },
          conditions: { type: "string", description: "Conditions for support, if applicable" },
        },
      },
    },
  },
};

const DEBATE_SCHEMA = {
  type: "object",
  properties: {
    exchanges: {
      type: "array",
      items: {
        type: "object",
        properties: {
          from: { type: "string", description: "Persona name speaking" },
          to: { type: "string", description: "Persona name being addressed" },
          type: { type: "string", enum: ["agree", "disagree", "concern", "question"] },
          content: { type: "string", description: "1-2 sentences" },
        },
      },
    },
    key_debates: { type: "array", items: { type: "string" }, description: "Summary of major debate points" },
    consensus_areas: { type: "array", items: { type: "string" } },
    divergence_areas: { type: "array", items: { type: "string" } },
  },
};

const BRIEF_SCHEMA = {
  type: "object",
  properties: {
    executive_summary: { type: "string", description: "2-3 paragraph board-quality summary" },
    recommendation: { type: "string", description: "Clear, decisive recommendation" },
    confidence_level: { type: "number", description: "0-100 overall board confidence" },
    consensus_level: { type: "string", enum: ["unanimous", "strong", "moderate", "divided"] },
    risk_matrix: {
      type: "array",
      items: {
        type: "object",
        properties: {
          risk: { type: "string" },
          likelihood: { type: "string", enum: ["low", "medium", "high"] },
          impact: { type: "string", enum: ["low", "medium", "high"] },
          mitigation: { type: "string" },
        },
      },
    },
    financial_impact: { type: "string" },
    operational_impact: { type: "string" },
    people_impact: { type: "string" },
    technology_impact: { type: "string" },
    action_items: {
      type: "array",
      items: {
        type: "object",
        properties: {
          action: { type: "string" },
          owner: { type: "string" },
          priority: { type: "string", enum: ["high", "medium", "low"] },
          timeline: { type: "string" },
        },
      },
    },
    timeline: { type: "string", description: "Overall execution timeline" },
    alternatives: {
      type: "array",
      items: {
        type: "object",
        properties: {
          option: { type: "string" },
          pros: { type: "string" },
          cons: { type: "string" },
          feasibility: { type: "number", description: "0-100" },
        },
      },
    },
  },
};

// ------------------------------------------------------------

export function buildCouncilContext(profile, organization) {
  const parts = [];
  if (profile) {
    parts.push(`EXECUTIVE PROFILE:`);
    if (profile.professional_headline) parts.push(`- Headline: ${profile.professional_headline}`);
    if (profile.current_role) parts.push(`- Current Role: ${profile.current_role}`);
    if (profile.current_company) parts.push(`- Current Company: ${profile.current_company}`);
    if (profile.target_role) parts.push(`- Target Role: ${profile.target_role}`);
    if (profile.target_company) parts.push(`- Target Company: ${profile.target_company}`);
    if (profile.industry) parts.push(`- Industry: ${profile.industry}`);
    if (profile.years_experience) parts.push(`- Years of Experience: ${profile.years_experience}`);
    if (profile.target_country) parts.push(`- Target Country: ${profile.target_country}`);
    if (profile.career_goals) parts.push(`- Career Goals: ${profile.career_goals}`);
    if (profile.skills?.length) parts.push(`- Key Skills: ${profile.skills.join(", ")}`);
  }
  if (organization) {
    parts.push(`\nORGANIZATION CONTEXT:`);
    if (organization.name) parts.push(`- Organization: ${organization.name}`);
    if (organization.industry) parts.push(`- Industry: ${organization.industry}`);
    if (organization.country) parts.push(`- Country: ${organization.country}`);
    if (organization.plan) parts.push(`- Plan: ${organization.plan}`);
    if (organization.description) parts.push(`- Description: ${organization.description}`);
  }
  return parts.join("\n");
}

// ------------------------------------------------------------

export async function runCouncil(personas, question, context, onPhase) {
  const personaList = personas
    .map((p) => `- ${p.name} (${p.title}): Focus areas — ${p.focus}`)
    .join("\n");

  // PHASE 1: Individual Perspectives
  onPhase?.("perspectives");
  const perspectivesRes = await callAI("council", {
    prompt: `You are simulating an Executive Board of Directors. Each board member below will respond INDEPENDENTLY to the strategic question from their functional perspective.

BOARD MEMBERS:
${personaList}

${context ? context + "\n" : ""}

STRATEGIC QUESTION:
${question}

For EACH board member, provide:
- viewpoint: 2-3 paragraphs of their independent perspective, direct and opinionated
- sentiment: their overall stance (support, caution, or oppose)
- confidence: 0-100 how confident they are in their assessment
- stance_summary: one-sentence summary of their position
- key_points: 2-4 key supporting points
- key_concerns: 1-3 concerns or risks they see
- conditions: any conditions for their support (or empty if unconditional)

Be realistic: executives should have different opinions, some may disagree. Use the persona_id exactly as provided. Ensure every selected board member has a response.`,
    response_json_schema: PERSPECTIVE_SCHEMA,
  });

  const perspectives = (perspectivesRes?.perspectives || []).map((p) => {
    const persona = personas.find((pe) => pe.id === p.persona_id || pe.name === p.persona_id);
    return { ...p, persona: persona || { id: p.persona_id, name: p.persona_id, title: "", icon: "👤" } };
  });

  // PHASE 2: Structured Debate
  onPhase?.("debate");
  const perspectivesSummary = perspectives
    .map((p) => `${p.persona.name} (${p.sentiment}, ${p.confidence}%): ${p.stance_summary}\nKey points: ${(p.key_points || []).join("; ")}\nConcerns: ${(p.key_concerns || []).join("; ")}`)
    .join("\n\n");

  const debateRes = await callAI("council", {
    prompt: `You are simulating a board debate. The following executives have provided their initial perspectives on a strategic question. Now they debate with one another — agreeing, disagreeing, raising concerns, and asking questions.

STRATEGIC QUESTION:
${question}

${context ? context + "\n" : ""}

INITIAL PERSPECTIVES:
${perspectivesSummary}

Generate a realistic board debate with 6-10 exchanges where executives directly address each other. Include:
- exchanges: array of {from, to, type (agree/disagree/concern/question), content (1-2 sentences)}
- key_debates: 2-4 summary points of the major debates that emerged
- consensus_areas: areas where the board found agreement
- divergence_areas: areas where the board remained divided

Use persona names exactly as listed. Make the debate substantive — executives should challenge each other's assumptions with specific reasoning.`,
    response_json_schema: DEBATE_SCHEMA,
  });

  // PHASE 3: Executive Decision Brief
  onPhase?.("brief");
  const debateSummary = (debateRes?.key_debates || []).join("; ");
  const consensusAreas = (debateRes?.consensus_areas || []).join("; ");
  const divergenceAreas = (debateRes?.divergence_areas || []).join("; ");

  const briefRes = await callAI("council", {
    prompt: `You are the Board Chair compiling the final Executive Decision Brief after board deliberation. Synthesize all perspectives and debate into a board-quality recommendation.

STRATEGIC QUESTION:
${question}

${context ? context + "\n" : ""}

BOARD PERSPECTIVES:
${perspectivesSummary}

DEBATE SUMMARY:
Key debates: ${debateSummary}
Consensus areas: ${consensusAreas}
Divergence areas: ${divergenceAreas}

Compile the Executive Decision Brief with:
- executive_summary: 2-3 paragraph board-quality summary of the deliberation and outcome
- recommendation: clear, decisive recommendation (proceed, proceed with conditions, do not proceed, or pursue alternative)
- confidence_level: 0-100 overall board confidence
- consensus_level: unanimous, strong, moderate, or divided
- risk_matrix: 3-6 key risks with likelihood, impact, and mitigation
- financial_impact, operational_impact, people_impact, technology_impact: each 1-2 sentences
- action_items: 3-6 specific actions with suggested owner (persona name), priority, and timeline
- timeline: overall execution timeline
- alternatives: 1-3 viable alternatives with pros, cons, and feasibility (0-100)

This should read like a real board decision brief — authoritative, specific, and actionable.`,
    response_json_schema: BRIEF_SCHEMA,
  });

  return { perspectives, debate: debateRes, brief: briefRes };
}
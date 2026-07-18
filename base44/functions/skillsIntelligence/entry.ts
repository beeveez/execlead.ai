import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

/**
 * Skills Intelligence™ API v3.0
 * Enterprise Skills Intelligence Platform — Shared Service
 *
 * This is the authoritative Skills Intelligence API consumed by:
 *   Executive Coach™, Leadership DNA™, Executive Readiness™,
 *   Executive Journey™, Career Intelligence™, Company Intelligence™,
 *   Executive Simulator™, Interview Simulator™, Resume AI™,
 *   Promotion Forecast™, Executive Briefing™, Recommendation Engine™
 *
 * Actions:
 *   getExecutiveSkillScore — overall score with domain breakdown
 *   getCompanyMatch        — benchmark skills against a target company
 *   getRoleMatch           — benchmark skills against a target role
 *   getInsights            — AI-generated executive skill insights
 *   getRecommendations     — AI-powered skill recommendations with learning actions
 */

const DEMAND_MULTIPLIERS = { high_demand: 1.2, growing: 1.15, emerging: 1.1, stable: 1.0, declining: 0.8, legacy: 0.7 };

const EXECUTIVE_DOMAINS = [
  "technology", "leadership", "strategy", "operations", "governance",
  "finance", "communication", "people_leadership", "transformation",
  "innovation", "risk", "customer_success"
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const action = body.action;

    // Load user's skills
    const skills = await base44.entities.Skill.filter({ user_id: user.id }, '-created_date', 200);
    const skillList = Array.isArray(skills) ? skills : [];

    // ═══════════════════════════════════════════════════════
    // GET EXECUTIVE SKILL SCORE™
    // ═══════════════════════════════════════════════════════
    if (action === 'getExecutiveSkillScore') {
      const result = calculateScore(skillList);
      return Response.json({ status: 'success', ...result });
    }

    // ═══════════════════════════════════════════════════════
    // GET COMPANY MATCH™
    // ═══════════════════════════════════════════════════════
    if (action === 'getCompanyMatch') {
      const companyName = body.companyName;
      if (!companyName) return Response.json({ error: 'companyName required' }, { status: 400 });

      const skillsSummary = skillList.map(s =>
        `- ${s.skill_name} (${s.capability_domain || 'technology'}, ${s.confidence_score || 0}% confidence, ${s.proficiency || 'intermediate'}, ${s.years_of_experience || 0}y exp, ${s.market_demand || 'stable'} demand)`
      ).join('\n');

      const res = await base44.integrations.Core.InvokeLLM({
        model: "gemini_3_flash",
        prompt: `You are an executive skills benchmark analyst. Compare this executive's skills against what's expected at ${companyName}.

Executive's Skills (${skillList.length} total):
${skillsSummary}

Analyze the match and return:
{
  "current_match": number (0-100, how well the skills match ${companyName}'s executive expectations),
  "missing_skills": ["skills commonly expected at ${companyName} but missing"],
  "competitive_advantage": ["skills where the user is particularly strong for ${companyName}"],
  "market_gap": ["emerging skills that would be valuable at ${companyName}"],
  "executive_readiness": number (0-100, readiness for an executive role at ${companyName}),
  "analysis": "brief executive summary"
}`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            current_match: { type: "number" },
            missing_skills: { type: "array", items: { type: "string" } },
            competitive_advantage: { type: "array", items: { type: "string" } },
            market_gap: { type: "array", items: { type: "string" } },
            executive_readiness: { type: "number" },
            analysis: { type: "string" },
          },
        },
      });

      return Response.json({ status: 'success', company: companyName, match: res });
    }

    // ═══════════════════════════════════════════════════════
    // GET ROLE MATCH™
    // ═══════════════════════════════════════════════════════
    if (action === 'getRoleMatch') {
      const roleName = body.roleName;
      if (!roleName) return Response.json({ error: 'roleName required' }, { status: 400 });

      const skillsSummary = skillList.map(s =>
        `- ${s.skill_name} (${s.capability_domain || 'technology'}, ${s.confidence_score || 0}% confidence, ${s.proficiency || 'intermediate'})`
      ).join('\n');

      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an executive role benchmark analyst. Compare this executive's skills against what's required for the role of ${roleName}.

Executive's Skills (${skillList.length} total):
${skillsSummary}

Return:
{
  "estimated_readiness": number (0-100),
  "required_skills": ["skills required for ${roleName}"],
  "strong_skills": ["skills where the user exceeds expectations"],
  "missing_skills": ["required skills the user is missing"],
  "recommended_skills": ["skills to develop for ${roleName}"],
  "analysis": "brief analysis of fit"
}`,
        response_json_schema: {
          type: "object",
          properties: {
            estimated_readiness: { type: "number" },
            required_skills: { type: "array", items: { type: "string" } },
            strong_skills: { type: "array", items: { type: "string" } },
            missing_skills: { type: "array", items: { type: "string" } },
            recommended_skills: { type: "array", items: { type: "string" } },
            analysis: { type: "string" },
          },
        },
      });

      return Response.json({ status: 'success', role: roleName, match: res });
    }

    // ═══════════════════════════════════════════════════════
    // GET INSIGHTS™
    // ═══════════════════════════════════════════════════════
    if (action === 'getInsights') {
      const targetRole = body.targetRole || 'Executive';

      const skillsSummary = skillList.map(s =>
        `- ${s.skill_name} (${s.capability_domain || 'technology'}, ${s.confidence_score || 0}% confidence, ${s.market_demand || 'stable'} demand, ${s.proficiency || 'intermediate'}, ${s.years_of_experience || 0}y exp)`
      ).join('\n');

      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an executive skills intelligence analyst. Generate insights for this executive targeting the role of ${targetRole}.

Total Skills: ${skillList.length}

Skills:
${skillsSummary}

Generate 4-6 insights. Each must be specific, data-driven, and actionable.

Return:
{
  "insights": [
    {
      "type": "strength" | "improvement" | "gap" | "trend" | "competitive_advantage",
      "title": "short title",
      "description": "detailed insight with specific data",
      "action": "recommended action"
    }
  ],
  "growth_trend": "increasing" | "stable" | "needs_attention",
  "top_strength": "strongest executive capability",
  "top_gap": "largest skill gap for target role"
}`,
        response_json_schema: {
          type: "object",
          properties: {
            insights: { type: "array", items: { type: "object", properties: {
              type: { type: "string" },
              title: { type: "string" },
              description: { type: "string" },
              action: { type: "string" },
            }}},
            growth_trend: { type: "string" },
            top_strength: { type: "string" },
            top_gap: { type: "string" },
          },
        },
      });

      return Response.json({ status: 'success', insights: res, target_role: targetRole });
    }

    // ═══════════════════════════════════════════════════════
    // GET RECOMMENDATIONS™ (with learning actions)
    // ═══════════════════════════════════════════════════════
    if (action === 'getRecommendations') {
      const targetRole = body.targetRole || 'Executive';

      const skillsSummary = skillList.map(s =>
        `- ${s.skill_name} (${s.capability_domain || 'technology'}, ${s.confidence_score || 0}% confidence)`
      ).join('\n');

      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an executive skills development advisor. Recommend skills for this executive targeting ${targetRole}.

Current Skills:
${skillsSummary}

Return 3-5 recommendations with learning actions:
{
  "recommendations": [
    {
      "skill_name": "string",
      "capability_domain": "one of: ${EXECUTIVE_DOMAINS.join(', ')}",
      "reason": "WHY this skill matters for ${targetRole}",
      "market_demand": "high_demand | growing | emerging | stable | legacy",
      "estimated_readiness_increase": number (0-15),
      "learning_actions": ["sequence of learning steps: e.g. Executive Coach™ → Leadership Mission™ → Scenario Practice™ → Reassessment"],
      "related_skills": ["connected skills in the graph"]
    }
  ]
}`,
        response_json_schema: {
          type: "object",
          properties: {
            recommendations: { type: "array", items: { type: "object", properties: {
              skill_name: { type: "string" },
              capability_domain: { type: "string" },
              reason: { type: "string" },
              market_demand: { type: "string" },
              estimated_readiness_increase: { type: "number" },
              learning_actions: { type: "array", items: { type: "string" } },
              related_skills: { type: "array", items: { type: "string" } },
            }}},
          },
        },
      });

      return Response.json({ status: 'success', recommendations: res.recommendations || [], target_role: targetRole });
    }

    return Response.json({ error: 'Unknown action. Available: getExecutiveSkillScore, getCompanyMatch, getRoleMatch, getInsights, getRecommendations' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

// ═══════════════════════════════════════════════════════════
// HELPER: Calculate Executive Skill Score
// ═══════════════════════════════════════════════════════════
function calculateScore(skills) {
  if (!skills || skills.length === 0) {
    return { overall_score: 0, domain_coverage_score: 0, weighted_confidence_score: 0, total_skills: 0, verified_skills: 0, avg_confidence: 0, domain_scores: [] };
  }

  // Domain aggregation
  const domainMap = {};
  for (const domain of EXECUTIVE_DOMAINS) {
    domainMap[domain] = { total: 0, confidence_sum: 0, verified: 0 };
  }

  for (const s of skills) {
    const d = s.capability_domain || 'technology';
    if (!domainMap[d]) domainMap[d] = { total: 0, confidence_sum: 0, verified: 0 };
    domainMap[d].total++;
    domainMap[d].confidence_sum += s.confidence_score || 0;
    if (s.verification_state && s.verification_state !== 'self_reported') domainMap[d].verified++;
  }

  const domainScores = Object.entries(domainMap).map(([id, d]) => ({
    domain: id,
    coverage: d.total > 0 ? Math.min(100, Math.round(d.total * 12 + (d.confidence_sum / d.total) * 0.4)) : 0,
    skill_count: d.total,
    avg_confidence: d.total > 0 ? Math.round(d.confidence_sum / d.total) : 0,
    verified_count: d.verified,
  }));

  const activeDomains = domainScores.filter(d => d.skill_count > 0);
  const domainCoverageScore = activeDomains.length > 0
    ? Math.round(activeDomains.reduce((s, d) => s + d.coverage, 0) / activeDomains.length)
    : 0;

  const weightedConfidence = skills.reduce((sum, s) => {
    const multiplier = DEMAND_MULTIPLIERS[s.market_demand] || 1.0;
    return sum + (s.confidence_score || 0) * multiplier;
  }, 0) / skills.length;

  const overallScore = Math.round(Math.min(100, domainCoverageScore * 0.55 + weightedConfidence * 0.45));

  return {
    overall_score: overallScore,
    domain_coverage_score: domainCoverageScore,
    weighted_confidence_score: Math.round(weightedConfidence),
    total_skills: skills.length,
    verified_skills: skills.filter(s => s.verification_state && s.verification_state !== 'self_reported').length,
    avg_confidence: Math.round(skills.reduce((s, sk) => s + (sk.confidence_score || 0), 0) / skills.length),
    domain_scores: domainScores,
  };
}
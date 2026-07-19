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

    // ═══════════════════════════════════════════════════════
    // IMPORT SKILLS™ — Server-side AI extraction + upsert
    // Moved from frontend to reduce latency (8.2s → ~3s) by
    // eliminating client round-trips for LLM + bulk operations.
    // ═══════════════════════════════════════════════════════
    if (action === 'importSkills') {
      // Load user profile for context
      const profiles = await base44.entities.UserProfile.filter({ user_id: user.id });
      const profile = (profiles && profiles[0]) || {};

      const targetRole = profile.target_role || profile.current_role || 'Executive';
      const experience = parseJSON(profile.experience_json, []);
      const existingSkillsList = skillList;

      const prompt = `You are an executive skills intelligence analyst. Extract skills from this executive's work experience.

Target Role: ${targetRole}
Current Role: ${profile.current_role || 'Unknown'}
Industry: ${profile.preferred_industry || profile.industry || 'Unknown'}
Years: ${profile.years_experience || 'Unknown'}

Work Experience:
${Array.isArray(experience) ? experience.map(e => `- ${e.role || e.title || 'Role'} at ${e.company || 'Company'}`).join('\n') : 'Not provided'}

Existing Skills: ${existingSkillsList.map(s => s.skill_name).join(', ') || 'None'}

Extract 5-15 skills. For each: skill_name, capability_domain (one of: ${EXECUTIVE_DOMAINS.join(', ')}), proficiency (beginner|intermediate|advanced|expert), years_of_experience, acquired_year, verification_state (resume_verified|experience_verified|ai_detected), market_demand (high_demand|growing|emerging|stable|legacy), evidence array of {source,type,description}, related_skills array.

Return JSON: { "extracted_skills": [...] }`;

      const res = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            extracted_skills: { type: "array", items: { type: "object", properties: {
              skill_name: { type: "string" },
              capability_domain: { type: "string" },
              proficiency: { type: "string" },
              years_of_experience: { type: "number" },
              acquired_year: { type: "number" },
              verification_state: { type: "string" },
              market_demand: { type: "string" },
              evidence: { type: "array", items: { type: "object", properties: {
                source: { type: "string" }, type: { type: "string" }, description: { type: "string" },
              }}},
              related_skills: { type: "array", items: { type: "string" } },
            }}},
          },
        },
      });

      // ── Idempotent Upsert ──
      const existingMap = new Map();
      for (const s of existingSkillsList) {
        const key = normalizeSkillName(s.skill_name);
        if (!existingMap.has(key)) existingMap.set(key, s);
      }

      const toCreate = [];
      const toUpdate = [];
      const seenInBatch = new Set();

      for (const s of (res.extracted_skills || [])) {
        const key = normalizeSkillName(s.skill_name);
        if (!key || seenInBatch.has(key)) continue;
        seenInBatch.add(key);

        const existing = existingMap.get(key);
        if (existing) {
          // UPSERT: merge evidence + refresh metadata
          const existingEvidence = parseJSON(existing.evidence_json, []);
          const newEvidence = Array.isArray(s.evidence) ? s.evidence : [];
          const mergedEvidence = [...existingEvidence];
          for (const ev of newEvidence) {
            const sig = `${ev.source}|${ev.type}`.toLowerCase().trim();
            const idx = mergedEvidence.findIndex(e => `${e.source}|${e.type}`.toLowerCase().trim() === sig);
            if (idx >= 0) mergedEvidence[idx] = { ...mergedEvidence[idx], description: ev.description };
            else mergedEvidence.push(ev);
          }

          const existingRelated = parseJSON(existing.related_skills_json, []);
          const newRelated = Array.isArray(s.related_skills) ? s.related_skills : [];
          const mergedRelated = [...new Set([...existingRelated, ...newRelated])];

          const confidence = calculateConfidenceScore({ ...s, evidence_json: JSON.stringify(mergedEvidence) });
          const level = getConfidenceLevel(confidence);

          toUpdate.push({
            id: existing.id,
            skill_name: existing.skill_name,
            capability_domain: s.capability_domain || existing.capability_domain || 'technology',
            proficiency: s.proficiency || existing.proficiency || 'intermediate',
            years_of_experience: s.years_of_experience ?? existing.years_of_experience ?? 0,
            acquired_year: s.acquired_year ?? existing.acquired_year,
            verification_state: s.verification_state || existing.verification_state || 'ai_detected',
            confidence_score: confidence,
            confidence_level: level,
            market_demand: s.market_demand || existing.market_demand || 'stable',
            source: 'resume',
            evidence_json: JSON.stringify(mergedEvidence),
            related_skills_json: JSON.stringify(mergedRelated),
            change_history_json: appendChangeHistory(existing.change_history_json || '[]', 'skill_updated', 'Enriched via AI Skill Import™ (server-side)'),
          });
        } else {
          // CREATE
          const confidence = calculateConfidenceScore({ ...s, evidence_json: JSON.stringify(s.evidence || []) });
          const level = getConfidenceLevel(confidence);
          toCreate.push({
            skill_name: s.skill_name,
            capability_domain: s.capability_domain || 'technology',
            proficiency: s.proficiency || 'intermediate',
            years_of_experience: s.years_of_experience || 0,
            acquired_year: s.acquired_year,
            verification_state: s.verification_state || 'ai_detected',
            confidence_score: confidence,
            confidence_level: level,
            market_demand: s.market_demand || 'stable',
            source: 'resume',
            evidence_json: JSON.stringify(s.evidence || []),
            related_skills_json: JSON.stringify(s.related_skills || []),
            change_history_json: appendChangeHistory('[]', 'skill_created', 'Extracted via AI Skill Import Engine™ (server-side)'),
            user_id: user.id,
          });
        }
      }

      if (toCreate.length > 0) await base44.entities.Skill.bulkCreate(toCreate);
      if (toUpdate.length > 0) await base44.entities.Skill.bulkUpdate(toUpdate);

      return Response.json({
        status: 'success',
        created: toCreate.length,
        updated: toUpdate.length,
        total: existingSkillsList.length + toCreate.length,
      });
    }

    return Response.json({ error: 'Unknown action. Available: getExecutiveSkillScore, getCompanyMatch, getRoleMatch, getInsights, getRecommendations, importSkills' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

// ═══════════════════════════════════════════════════════════
// HELPER FUNCTIONS (for importSkills)
// ═══════════════════════════════════════════════════════════

function parseJSON(str, fallback) {
  try { return typeof str === 'string' ? JSON.parse(str) : (str || fallback); }
  catch { return fallback; }
}

function normalizeSkillName(name) {
  return (name || '').toLowerCase().trim().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ');
}

const VERIFICATION_WEIGHTS = {
  self_reported: 5, ai_detected: 10, resume_verified: 20,
  experience_verified: 25, certification_verified: 30,
  manager_verified: 35, peer_verified: 30, enterprise_verified: 35,
};
const PROFICIENCY_WEIGHTS = { beginner: 2, intermediate: 5, advanced: 8, expert: 10 };

function calculateConfidenceScore(skill) {
  if (!skill) return 0;
  let score = 0;
  const evidence = parseJSON(skill.evidence_json, []);
  score += Math.min(evidence.length * 8, 40);
  score += VERIFICATION_WEIGHTS[skill.verification_state] || 5;
  score += Math.min((skill.years_of_experience || 0) * 2, 15);
  score += PROFICIENCY_WEIGHTS[skill.proficiency] || 5;
  return Math.min(100, Math.round(score));
}

function getConfidenceLevel(score) {
  if (score >= 70) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

function appendChangeHistory(existingHistory, event, details) {
  const history = parseJSON(existingHistory, '[]');
  history.push({ timestamp: new Date().toISOString(), event, details });
  return JSON.stringify(history);
}

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
import { ELIM_VERSION, ELIM_FRAMEWORKS, INTELLIGENCE_SCORES, EVIDENCE_SOURCES } from "./elimFrameworks";
import { computeDomainSummary, computeGapAnalysis, getExecCoachingSummary } from "./competencyCatalog";

// ============================================================
// ELIM™ ENGINE — One Intelligence Engine
// All AI capabilities consume scores computed here.
// ============================================================

const avg = (comps) =>
  comps.length > 0 ? Math.round(comps.reduce((s, c) => s + (c.competency_score || 0), 0) / comps.length) : 0;

const confidenceFrom = (comps) => {
  const total = comps.length;
  if (total === 0) return 0;
  const verified = comps.filter((c) => c.verified).length;
  const withEvidence = comps.filter((c) => (c.evidence_count || 0) > 0).length;
  return Math.min(100, Math.round(((verified * 1.0 + withEvidence * 0.5) / total) * 100));
};

const trendFrom = (comps) => {
  const up = comps.filter((c) => c.growth_trend === "up").length;
  const down = comps.filter((c) => c.growth_trend === "down").length;
  return up > down ? "up" : down > up ? "down" : "stable";
};

const makeScore = (comps, framework, externalValue) => {
  const value = externalValue !== undefined ? externalValue : avg(comps);
  return {
    value,
    confidence: externalValue !== undefined ? Math.min(100, value) : confidenceFrom(comps),
    trend: trendFrom(comps),
    evidenceCount: comps.reduce((s, c) => s + (c.evidence_count || 0), 0),
    lastUpdated: new Date().toISOString(),
    growthRate: 0,
    framework,
  };
};

// ============================================================
// 14 EXECUTIVE INTELLIGENCE SCORES
// ============================================================
export function computeIntelligenceScores(competencies = [], reputation = null, profile = null) {
  const byCat = (cat) => competencies.filter((c) => c.category === cat);
  const bySub = (cat, sub) => competencies.filter((c) => c.category === cat && c.subcategory === sub);
  const byName = (name) => competencies.filter((c) => c.competency_name === name);

  const leadYourself = byCat("lead_yourself");
  const leadPeople = byCat("lead_people");
  const leadBusiness = byCat("lead_business");
  const leadTech = byCat("lead_technology");
  const leadChange = byCat("lead_change");
  const leadLegacy = byCat("lead_legacy");

  const scores = {
    competency: makeScore(competencies, "eecf"),
    leadership: makeScore([...leadYourself, ...leadPeople], "eecf"),
    strategic_thinking: makeScore(bySub("lead_business", "Strategy"), "eecf"),
    business_acumen: makeScore([...bySub("lead_business", "Finance"), ...bySub("lead_business", "Commercial")], "eecf"),
    technology_leadership: makeScore(leadTech, "eecf"),
    executive_presence: makeScore([...byName("Executive Presence"), ...bySub("lead_legacy", "Influence")], "eecf"),
    people_leadership: makeScore(leadPeople, "eecf"),
    communication: makeScore([...bySub("lead_legacy", "Communication"), ...byName("Communication During Change")], "eecf"),
    innovation: makeScore([...bySub("lead_business", "Growth"), ...byName("Innovation Leadership"), ...byName("Innovation")], "eecf"),
    influence: makeScore([...bySub("lead_legacy", "Influence"), ...byName("Executive Presence")], "eecf"),
    legacy: makeScore(leadLegacy, "eecf"),
    reputation: makeScore([], "erf", reputation ? Math.round((reputation.reputation_score || 0) / 10) : 0),
    readiness: makeScore([], "eri", profile?.cached_readiness_score || 0),
    trust: makeScore([], "erf", profile?.cached_trust_score || 0),
  };

  // Enrich with growth rate
  Object.values(scores).forEach((s) => {
    s.growthRate = s.trend === "up" ? 5 : s.trend === "down" ? -3 : 0;
  });

  return scores;
}

// ============================================================
// EXECUTIVE PROFILE GRAPH — Living Executive Profile
// ============================================================
export function computeExecutiveIntelligence(profile = {}, competencies = [], reputation = null, journey = null) {
  const scores = computeIntelligenceScores(competencies, reputation, profile);
  const domains = computeDomainSummary(competencies);
  const gap = computeGapAnalysis(competencies, profile?.target_role);
  const coaching = getExecCoachingSummary(competencies, profile?.target_role);

  return {
    version: ELIM_VERSION,
    computedAt: new Date().toISOString(),
    frameworks: ELIM_FRAMEWORKS.map((f) => ({ id: f.id, name: f.shortName, version: f.version, status: f.status })),
    scores,
    profile: {
      userId: profile?.id,
      fullName: profile?.full_name,
      targetRole: profile?.target_role,
      targetCompany: profile?.target_company,
      industry: profile?.industry,
      careerStage: profile?.career_stage,
    },
    competencies: {
      total: competencies.length,
      verified: competencies.filter((c) => c.verified).length,
      growing: competencies.filter((c) => c.growth_trend === "up").length,
      domains,
      gap,
    },
    reputation: reputation
      ? { score: reputation.reputation_score, tier: reputation.reputation_tier, trend: reputation.reputation_trend }
      : null,
    journey: journey
      ? { level: journey.level?.current?.title, points: journey.totalPoints, percent: journey.level?.journeyPercent }
      : null,
    trust: {
      score: profile?.cached_trust_score || 0,
      tier: profile?.cached_trust_tier,
      identityVerified: profile?.identity_verified,
    },
    readiness: {
      score: profile?.cached_readiness_score || 0,
      promotionProbability: profile?.cached_promotion_probability || 0,
      timelineLow: profile?.cached_promotion_timeline_low || 0,
      timelineHigh: profile?.cached_promotion_timeline_high || 0,
      confidence: profile?.cached_promotion_confidence,
    },
    coaching,
  };
}

// ============================================================
// EXEC™ INTELLIGENCE CONSUMER
// EXEC™ queries ELIM™ — it does not invent recommendations.
// ============================================================
export function getExecIntelligence(intelligence, targetRole) {
  const { scores, coaching } = intelligence;
  if (!scores) return null;

  const sorted = Object.entries(scores)
    .filter(([, v]) => v.value > 0)
    .sort((a, b) => b[1].value - a[1].value);

  const strongest = sorted[0];
  const weakest = sorted[sorted.length - 1];
  const insights = [];

  if (strongest) {
    const def = INTELLIGENCE_SCORES.find((s) => s.id === strongest[0]);
    insights.push(`Your strongest intelligence dimension is **${def?.label}** (${strongest[1].value}%).`);
  }
  if (weakest && weakest[0] !== strongest?.[0]) {
    const def = INTELLIGENCE_SCORES.find((s) => s.id === weakest[0]);
    insights.push(`Your greatest development opportunity is **${def?.label}** (${weakest[1].value}%).`);
  }
  if (coaching?.gap?.missing?.length > 0) {
    insights.push(`To reach **${coaching.gap.targetRole}** readiness, focus on: ${coaching.gap.missing.slice(0, 3).map((m) => m.name).join(", ")}.`);
  }
  if (scores.readiness.value < 80 && coaching?.gap?.missing?.length > 0) {
    const gain = Math.min(15, coaching.gap.missing.length * 3);
    insights.push(`Completing the missing competencies would increase your readiness by approximately **${gain}%**.`);
  }
  if (scores.business_acumen.value < 50 && scores.business_acumen.value > 0) {
    insights.push(`Improving **Business Acumen** and **Financial Literacy** will significantly increase your Executive Readiness.`);
  }

  return {
    insights,
    strongest: strongest ? { id: strongest[0], ...strongest[1] } : null,
    weakest: weakest ? { id: weakest[0], ...weakest[1] } : null,
    summary: insights.join("\n\n"),
  };
}

// ============================================================
// CAREER INTELLIGENCE — Predictions & Recommendations
// ============================================================
export function computeCareerIntelligence(intelligence, targetRole) {
  const { scores, competencies, profile, readiness } = intelligence;
  const gap = competencies?.gap;

  const promotionProbability = readiness?.promotionProbability || Math.min(85, Math.round((scores.readiness?.value || 0) * 0.8 + (scores.competency?.value || 0) * 0.2));
  const timelineLow = readiness?.timelineLow || Math.max(6, Math.round(24 * (1 - (scores.readiness?.value || 0) / 100)));
  const timelineHigh = readiness?.timelineHigh || timelineLow + 12;

  return {
    targetRole: targetRole || profile?.targetRole,
    promotionReadiness: promotionProbability,
    estimatedTimelineMonths: `${timelineLow}-${timelineHigh}`,
    confidenceLevel: (scores.readiness?.confidence || 0) > 60 ? "high" : (scores.readiness?.confidence || 0) > 30 ? "medium" : "low",
    competencyGaps: gap?.missing?.map((m) => m.name) || [],
    targetRoleReadiness: gap?.readinessPct || 0,
    recommendations: _generateCareerRecommendations(scores, gap),
  };
}

function _generateCareerRecommendations(scores, gap) {
  const recs = [];
  if ((scores.business_acumen?.value || 0) < 50) recs.push({ type: "learning", label: "Executive Finance Learning Path", reason: "Strengthen Business Acumen and Financial Literacy" });
  if ((scores.executive_presence?.value || 0) < 50) recs.push({ type: "simulation", label: "Executive Presence Simulation", reason: "Develop executive presence and influence" });
  if ((scores.communication?.value || 0) < 50) recs.push({ type: "coaching", label: "Executive Communication Coaching", reason: "Enhance communication effectiveness" });
  if (gap?.missing?.length > 0) recs.push({ type: "competency", label: `Develop: ${gap.missing.slice(0, 2).map((m) => m.name).join(", ")}`, reason: "Close target role competency gaps" });
  if ((scores.strategic_thinking?.value || 0) < 50) recs.push({ type: "learning", label: "Strategic Leadership Academy Module", reason: "Build strategic thinking capability" });
  if ((scores.technology_leadership?.value || 0) < 50) recs.push({ type: "simulation", label: "Digital Transformation Simulation", reason: "Strengthen technology leadership" });
  return recs.slice(0, 5);
}

// ============================================================
// ENTERPRISE INTELLIGENCE — Organizational Aggregation
// ============================================================
export function computeEnterpriseIntelligence(members = []) {
  const total = members.length;
  if (total === 0) return null;

  let totalReadiness = 0, totalTrust = 0, totalReputation = 0, totalCompetencies = 0;
  const readinessBuckets = { elite: 0, ready: 0, developing: 0, critical: 0 };
  const journeyBuckets = {};
  const highPotentials = [];
  const riskIndicators = [];

  members.forEach((m) => {
    const r = m.profile?.cached_readiness_score || m.readiness || 0;
    const t = m.profile?.cached_trust_score || m.trust || 0;
    const rep = m.reputation?.reputation_score || 0;
    totalReadiness += r;
    totalTrust += t;
    totalReputation += rep;
    totalCompetencies += m.competencyCount || 0;

    if (r >= 80) readinessBuckets.elite++;
    else if (r >= 60) readinessBuckets.ready++;
    else if (r >= 40) readinessBuckets.developing++;
    else readinessBuckets.critical++;

    const level = m.profile?.cached_journey_level_id || m.journeyLevel || "seed";
    journeyBuckets[level] = (journeyBuckets[level] || 0) + 1;

    if (r >= 75 && rep >= 500) {
      highPotentials.push({ userId: m.profile?.id || m.userId, name: m.profile?.full_name || m.name, readiness: r, reputation: rep });
    }
    if (r < 30 || t < 30) {
      riskIndicators.push({ userId: m.profile?.id || m.userId, name: m.profile?.full_name || m.name, readiness: r, trust: t, risk: r < 30 ? "low_readiness" : "low_trust" });
    }
  });

  return {
    total,
    averages: {
      readiness: Math.round(totalReadiness / total),
      trust: Math.round(totalTrust / total),
      reputation: Math.round(totalReputation / total),
      competencies: Math.round(totalCompetencies / total),
    },
    readinessDistribution: readinessBuckets,
    journeyDistribution: journeyBuckets,
    highPotentials: highPotentials.sort((a, b) => b.readiness - a.readiness).slice(0, 10),
    riskIndicators,
    topContributors: members
      .filter((m) => m.reputation)
      .sort((a, b) => (b.reputation?.reputation_score || 0) - (a.reputation?.reputation_score || 0))
      .slice(0, 10)
      .map((m) => ({ name: m.profile?.full_name || m.name, score: m.reputation.reputation_score, tier: m.reputation.reputation_tier })),
  };
}

// ============================================================
// EVIDENCE CONFIDENCE CALCULATOR
// ============================================================
export function getEvidenceConfidence(evidenceSources = []) {
  if (evidenceSources.length === 0) return 0;
  let totalWeight = 0;
  let weightedConfidence = 0;
  evidenceSources.forEach((src) => {
    const def = EVIDENCE_SOURCES.find((s) => s.id === src);
    if (def) {
      totalWeight += def.weight;
      weightedConfidence += def.weight * 100;
    }
  });
  return totalWeight > 0 ? Math.min(100, Math.round(weightedConfidence / totalWeight)) : 0;
}
/**
 * Skills Intelligence™ Engine v2.0
 * Evidence, Verification & Executive Skill Graph
 *
 * Core engine for:
 *  - Skill Confidence Score™ calculation
 *  - Verification Engine™ state management
 *  - Executive Capability Domains™ coverage
 *  - Executive Skill Scorecard™ aggregation
 *  - Executive Skill Graph™ relationship mapping
 *  - Skill Timeline™ generation
 *  - Market Intelligence™ demand tracking
 */

// ═══════════════════════════════════════════════════════════
// EXECUTIVE CAPABILITY DOMAINS™
// ═══════════════════════════════════════════════════════════

export const EXECUTIVE_DOMAINS = [
  { id: "technology", label: "Technology", icon: "Code", color: "indigo" },
  { id: "leadership", label: "Leadership", icon: "Crown", color: "amber" },
  { id: "strategy", label: "Strategy", icon: "Target", color: "purple" },
  { id: "operations", label: "Operations", icon: "Settings", color: "blue" },
  { id: "governance", label: "Governance", icon: "Shield", color: "emerald" },
  { id: "finance", label: "Finance", icon: "DollarSign", color: "green" },
  { id: "communication", label: "Communication", icon: "MessageSquare", color: "cyan" },
  { id: "people_leadership", label: "People Leadership", icon: "Users", color: "rose" },
  { id: "transformation", label: "Transformation", icon: "RefreshCw", color: "orange" },
  { id: "innovation", label: "Innovation", icon: "Lightbulb", color: "yellow" },
  { id: "risk", label: "Risk", icon: "AlertTriangle", color: "red" },
  { id: "customer_success", label: "Customer Success", icon: "Heart", color: "pink" },
];

// ═══════════════════════════════════════════════════════════
// VERIFICATION ENGINE™ STATES
// ═══════════════════════════════════════════════════════════

export const VERIFICATION_STATES = {
  self_reported:       { label: "Self Reported",       icon: "User",        color: "slate",   weight: 5  },
  ai_detected:         { label: "AI Detected",          icon: "Sparkles",    color: "purple",  weight: 10 },
  resume_verified:     { label: "Resume Verified",     icon: "FileText",    color: "blue",    weight: 20 },
  experience_verified: { label: "Experience Verified", icon: "Briefcase",   color: "indigo",  weight: 25 },
  certification_verified: { label: "Certification Verified", icon: "Award", color: "amber",   weight: 30 },
  manager_verified:    { label: "Manager Verified",   icon: "ShieldCheck", color: "emerald", weight: 35 },
  peer_verified:       { label: "Peer Verified",       icon: "Users",       color: "cyan",    weight: 30 },
  enterprise_verified: { label: "Enterprise Verified",  icon: "Building2",   color: "green",   weight: 35 },
};

// ═══════════════════════════════════════════════════════════
// MARKET INTELLIGENCE™ DEMAND LEVELS
// ═══════════════════════════════════════════════════════════

export const MARKET_DEMAND_LEVELS = {
  high_demand: { label: "High Demand", icon: "TrendingUp",   color: "emerald", priority: 5 },
  growing:     { label: "Growing",     icon: "TrendingUp",   color: "blue",    priority: 4 },
  emerging:    { label: "Emerging",    icon: "Sparkles",    color: "purple",   priority: 3 },
  stable:      { label: "Stable",      icon: "Minus",       color: "slate",   priority: 2 },
  legacy:      { label: "Legacy",      icon: "TrendingDown", color: "orange",  priority: 1 },
  declining:   { label: "Declining",   icon: "TrendingDown", color: "red",     priority: 0 },
};

// ═══════════════════════════════════════════════════════════
// SKILL CONFIDENCE SCORE™ CALCULATION
// ═══════════════════════════════════════════════════════════

const PROFICIENCY_WEIGHTS = { beginner: 2, intermediate: 5, advanced: 8, expert: 10 };

export function calculateConfidenceScore(skill) {
  if (!skill) return 0;
  let score = 0;

  // Evidence sources (up to 40 points — 8 per evidence item)
  const evidence = parseJSON(skill.evidence_json, []);
  score += Math.min(evidence.length * 8, 40);

  // Verification state (up to 35 points)
  const vState = VERIFICATION_STATES[skill.verification_state] || VERIFICATION_STATES.self_reported;
  score += vState.weight;

  // Years of experience (up to 15 points — 2 per year)
  score += Math.min((skill.years_of_experience || 0) * 2, 15);

  // Proficiency level (up to 10 points)
  score += PROFICIENCY_WEIGHTS[skill.proficiency] || 5;

  return Math.min(100, Math.round(score));
}

export function getConfidenceLevel(score) {
  if (score >= 70) return "high";
  if (score >= 40) return "medium";
  return "low";
}

// ═══════════════════════════════════════════════════════════
// EXECUTIVE SKILL SCORECARD™ — Domain Coverage
// ═══════════════════════════════════════════════════════════

export function aggregateDomainCoverage(skills) {
  const domainMap = {};
  for (const domain of EXECUTIVE_DOMAINS) {
    domainMap[domain.id] = { ...domain, skills: [], coverage: 0, avgConfidence: 0, verifiedCount: 0 };
  }

  for (const skill of skills) {
    const domainId = skill.capability_domain || mapCategoryToDomain(skill.category);
    if (domainMap[domainId]) {
      domainMap[domainId].skills.push(skill);
    }
  }

  // Calculate coverage: based on count (up to 5 skills = 100%) and avg confidence
  for (const domain of Object.values(domainMap)) {
    const countScore = Math.min(domain.skills.length / 5, 1) * 60;
    const confScore = domain.skills.length > 0
      ? (domain.skills.reduce((s, sk) => s + (sk.confidence_score || 0), 0) / domain.skills.length) * 0.4
      : 0;
    domain.coverage = Math.round(countScore + confScore);
    domain.avgConfidence = domain.skills.length > 0
      ? Math.round(domain.skills.reduce((s, sk) => s + (sk.confidence_score || 0), 0) / domain.skills.length)
      : 0;
    domain.verifiedCount = domain.skills.filter(s => s.verification_state !== "self_reported").length;
  }

  return domainMap;
}

export function calculateOverallScorecard(skills) {
  const domains = aggregateDomainCoverage(skills);
  const domainList = Object.values(domains);
  const overallCoverage = domainList.length > 0
    ? Math.round(domainList.reduce((s, d) => s + d.coverage, 0) / domainList.length)
    : 0;
  const avgConfidence = skills.length > 0
    ? Math.round(skills.reduce((s, sk) => s + (sk.confidence_score || 0), 0) / skills.length)
    : 0;
  const verifiedCount = skills.filter(s => s.verification_state !== "self_reported").length;
  const highDemandCount = skills.filter(s => s.market_demand === "high_demand" || s.market_demand === "growing").length;

  return { overallCoverage, avgConfidence, verifiedCount, highDemandCount, totalSkills: skills.length };
}

// ═══════════════════════════════════════════════════════════
// EXECUTIVE SKILL GRAPH™ — Related Skills
// ═══════════════════════════════════════════════════════════

export function buildSkillGraph(skills) {
  const nodes = skills.map(s => ({
    id: s.id,
    name: s.skill_name,
    domain: s.capability_domain || mapCategoryToDomain(s.category),
    confidence: s.confidence_score || 0,
  }));

  const edges = [];
  const nameMap = new Map(skills.map(s => [s.skill_name.toLowerCase(), s]));

  for (const skill of skills) {
    const related = parseJSON(skill.related_skills_json, []);
    for (const relatedName of related) {
      const relatedSkill = nameMap.get(relatedName.toLowerCase());
      if (relatedSkill) {
        edges.push({ source: skill.id, target: relatedSkill.id, source_name: skill.skill_name, target_name: relatedSkill.skill_name });
      }
    }
  }

  return { nodes, edges };
}

// ═══════════════════════════════════════════════════════════
// SKILL TIMELINE™ — Career Evolution
// ═══════════════════════════════════════════════════════════

export function generateSkillTimeline(skills) {
  const yearMap = new Map();

  for (const skill of skills) {
    const year = skill.acquired_year;
    if (!year) continue;
    if (!yearMap.has(year)) yearMap.set(year, []);
    yearMap.get(year).push(skill);
  }

  const sortedYears = [...yearMap.keys()].sort((a, b) => a - b);

  return sortedYears.map((year, idx) => {
    const prevYear = idx > 0 ? sortedYears[idx - 1] : null;
    const nextYear = idx < sortedYears.length - 1 ? sortedYears[idx + 1] : null;
    return {
      year,
      skills: yearMap.get(year),
      isFirst: idx === 0,
      isLast: idx === sortedYears.length - 1,
      prevYear,
      nextYear,
    };
  });
}

// ═══════════════════════════════════════════════════════════
// SKILL CHANGE HISTORY™
// ═══════════════════════════════════════════════════════════

export function appendChangeHistory(existingHistory, event, details) {
  const history = parseJSON(existingHistory, "[]");
  history.push({ timestamp: new Date().toISOString(), event, details });
  return JSON.stringify(history);
}

// ═══════════════════════════════════════════════════════════
// EXECUTIVE SKILL HEALTH™
// ═══════════════════════════════════════════════════════════

export const SKILL_HEALTH_STATES = {
  healthy:       { label: "Healthy",       color: "emerald", icon: "CheckCircle2" },
  growing:       { label: "Growing",       color: "blue",    icon: "TrendingUp" },
  emerging:      { label: "Emerging",      color: "purple",  icon: "Sparkles" },
  needs_refresh: { label: "Needs Refresh", color: "amber",   icon: "RefreshCw" },
  legacy:        { label: "Legacy",        color: "orange",  icon: "AlertTriangle" },
  deprecated:    { label: "Deprecated",    color: "red",     icon: "XCircle" },
};

export function calculateSkillHealth(skill) {
  if (!skill) return "healthy";

  // Market demand directly maps to certain health states
  if (skill.market_demand === "legacy") return "legacy";
  if (skill.market_demand === "declining") return "needs_refresh";

  // Check recency from last_used
  const lastUsed = (skill.last_used || "").toLowerCase().trim();
  if (lastUsed === "current" || lastUsed === "present" || lastUsed === "") {
    return skill.market_demand === "growing" ? "growing" : skill.market_demand === "emerging" ? "emerging" : "healthy";
  }

  // Parse year from last_used
  const year = parseInt(lastUsed);
  if (!isNaN(year)) {
    const yearsSince = new Date().getFullYear() - year;
    if (yearsSince <= 1) return "healthy";
    if (yearsSince <= 3) return "growing";
    if (yearsSince <= 5) return "needs_refresh";
    return "legacy";
  }

  // Fallback to market demand
  if (skill.market_demand === "emerging") return "emerging";
  if (skill.market_demand === "growing") return "growing";
  return "healthy";
}

export function getHealthMeta(statusId) {
  return SKILL_HEALTH_STATES[statusId] || SKILL_HEALTH_STATES.healthy;
}

// ═══════════════════════════════════════════════════════════
// EXECUTIVE SKILL SCORE™
// ═══════════════════════════════════════════════════════════

const DEMAND_MULTIPLIERS = { high_demand: 1.2, growing: 1.15, emerging: 1.1, stable: 1.0, declining: 0.8, legacy: 0.7 };

export function calculateExecutiveSkillScore(skills) {
  if (!skills || skills.length === 0) {
    return { overall_score: 0, domain_coverage_score: 0, weighted_confidence_score: 0, domain_scores: [], total_skills: 0, verified_skills: 0, avg_confidence: 0 };
  }

  const domains = aggregateDomainCoverage(skills);
  const domainList = Object.values(domains);
  const domainCoverageScore = domainList.length > 0
    ? Math.round(domainList.reduce((s, d) => s + d.coverage, 0) / domainList.length)
    : 0;

  // Weighted confidence (market demand multiplier)
  const weightedConfidence = skills.reduce((sum, s) => {
    const multiplier = DEMAND_MULTIPLIERS[s.market_demand] || 1.0;
    return sum + (s.confidence_score || 0) * multiplier;
  }, 0) / skills.length;

  const overallScore = Math.round(Math.min(100, domainCoverageScore * 0.55 + weightedConfidence * 0.45));

  return {
    overall_score: overallScore,
    domain_coverage_score: domainCoverageScore,
    weighted_confidence_score: Math.round(weightedConfidence),
    domain_scores: domainList.map(d => ({ domain: d.id, label: d.label, coverage: d.coverage, skills: d.skills.length, avg_confidence: d.avgConfidence })),
    total_skills: skills.length,
    verified_skills: skills.filter(s => s.verification_state !== "self_reported").length,
    avg_confidence: Math.round(skills.reduce((s, sk) => s + (sk.confidence_score || 0), 0) / skills.length),
  };
}

// ═══════════════════════════════════════════════════════════
// EXECUTIVE SKILL IMPACT™
// ═══════════════════════════════════════════════════════════

const DOMAIN_IMPACT_WEIGHTS = {
  leadership:        { leadership_dna: 12, executive_readiness: 8,  promotion_forecast: 7, career_momentum: 5, interview_performance: 6 },
  strategy:          { leadership_dna: 8,  executive_readiness: 10, promotion_forecast: 9, career_momentum: 7, interview_performance: 7 },
  technology:        { leadership_dna: 4,  executive_readiness: 6,  promotion_forecast: 5, career_momentum: 6, interview_performance: 5 },
  operations:        { leadership_dna: 7,  executive_readiness: 8,  promotion_forecast: 6, career_momentum: 5, interview_performance: 4 },
  governance:        { leadership_dna: 6,  executive_readiness: 7,  promotion_forecast: 8, career_momentum: 4, interview_performance: 5 },
  finance:           { leadership_dna: 5,  executive_readiness: 7,  promotion_forecast: 8, career_momentum: 5, interview_performance: 4 },
  communication:     { leadership_dna: 9,  executive_readiness: 8,  promotion_forecast: 6, career_momentum: 7, interview_performance: 10 },
  people_leadership: { leadership_dna: 10, executive_readiness: 8,  promotion_forecast: 8, career_momentum: 6, interview_performance: 7 },
  transformation:    { leadership_dna: 7,  executive_readiness: 9,  promotion_forecast: 7, career_momentum: 6, interview_performance: 5 },
  innovation:        { leadership_dna: 6,  executive_readiness: 7,  promotion_forecast: 6, career_momentum: 8, interview_performance: 5 },
  risk:              { leadership_dna: 5,  executive_readiness: 7,  promotion_forecast: 7, career_momentum: 3, interview_performance: 4 },
  customer_success:  { leadership_dna: 6,  executive_readiness: 7,  promotion_forecast: 5, career_momentum: 6, interview_performance: 5 },
};

const IMPACT_LABELS = {
  leadership_dna: "Leadership DNA™",
  executive_readiness: "Executive Readiness™",
  promotion_forecast: "Promotion Forecast™",
  career_momentum: "Career Momentum™",
  interview_performance: "Interview Performance™",
};

export function getSkillImpact(skill) {
  if (!skill) return { impacts: {}, coaching_priority: "low" };

  const domain = skill.capability_domain || "technology";
  const baseImpact = DOMAIN_IMPACT_WEIGHTS[domain] || DOMAIN_IMPACT_WEIGHTS.technology;
  const confidenceMultiplier = (skill.confidence_score || 0) / 100;
  const experienceBonus = Math.min((skill.years_of_experience || 0) / 10, 0.2);
  const totalMultiplier = confidenceMultiplier + experienceBonus;

  const impacts = {};
  for (const [key, value] of Object.entries(baseImpact)) {
    impacts[key] = Math.min(15, Math.round(value * totalMultiplier));
  }

  const coaching_priority = (skill.confidence_score || 0) < 40 ? "high" : (skill.confidence_score || 0) < 70 ? "medium" : "low";

  return { impacts, coaching_priority, impact_labels: IMPACT_LABELS };
}

export { IMPACT_LABELS };

// ═══════════════════════════════════════════════════════════
// HELPER UTILITIES
// ═══════════════════════════════════════════════════════════

export function mapCategoryToDomain(category) {
  const mapping = {
    technical: "technology",
    leadership: "leadership",
    business: "strategy",
    ai_digital: "innovation",
  };
  return mapping[category] || "technology";
}

export function parseJSON(str, fallback) {
  try { return typeof str === "string" ? JSON.parse(str) : (str || fallback); }
  catch { return fallback; }
}

export function getDomainMeta(domainId) {
  return EXECUTIVE_DOMAINS.find(d => d.id === domainId) || EXECUTIVE_DOMAINS[0];
}

export function getVerificationMeta(stateId) {
  return VERIFICATION_STATES[stateId] || VERIFICATION_STATES.self_reported;
}

export function getMarketDemandMeta(levelId) {
  return MARKET_DEMAND_LEVELS[levelId] || MARKET_DEMAND_LEVELS.stable;
}
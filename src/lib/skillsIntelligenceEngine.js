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
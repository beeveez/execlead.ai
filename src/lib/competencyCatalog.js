import {
  User, Users, TrendingUp, Cpu, Sparkles, Crown,
  Award, FileText, Fingerprint, ClipboardCheck, Briefcase,
  Shield, Brain, Server, Package, DollarSign, CheckSquare,
  MessageSquare, Target, Globe, Zap, Heart, BookOpen, Star,
} from "lucide-react";

// ============================================================
// EECF™ — EXECLEAD EXECUTIVE COMPETENCY FRAMEWORK
// Version 1.0 — The Global Leadership Competency Standard
// ============================================================
export const EECF_VERSION = "1.0";

// ============================================================
// EXECUTIVE MATURITY MODEL (8 levels)
// ============================================================
export const PROFICIENCY_LEVELS = [
  { id: "awareness", label: "Awareness", level: 1, color: "#94a3b8", minYears: 0, description: "Familiar with the fundamentals" },
  { id: "foundation", label: "Foundation", level: 2, color: "#64748b", minYears: 1, description: "Can apply with guidance" },
  { id: "practitioner", label: "Practitioner", level: 3, color: "#0ea5e9", minYears: 3, description: "Applies independently" },
  { id: "advanced", label: "Advanced", level: 4, color: "#3b82f6", minYears: 6, description: "Proficient and guiding others" },
  { id: "executive", label: "Executive", level: 5, color: "#6366f1", minYears: 10, description: "Strategic leader in this domain" },
  { id: "enterprise_leader", label: "Enterprise Leader", level: 6, color: "#8b5cf6", minYears: 14, description: "Leads at enterprise scale" },
  { id: "global_leader", label: "Global Leader", level: 7, color: "#f59e0b", minYears: 18, description: "Sets global direction" },
  { id: "legacy_leader", label: "Legacy Leader", level: 8, color: "#ec4899", minYears: 20, description: "Defines the field and builds legacy" },
];

export const VERIFICATION_SOURCES = [
  { id: "resume", label: "Resume", icon: FileText },
  { id: "experience", label: "Experience", icon: Briefcase },
  { id: "certification", label: "Certification", icon: Award },
  { id: "leadership_dna", label: "Leadership DNA™", icon: Fingerprint },
  { id: "assessment", label: "Assessment", icon: ClipboardCheck },
  { id: "ai_validation", label: "AI Validation", icon: Sparkles },
  { id: "manual", label: "Self-Reported", icon: User },
];

// ============================================================
// SIX EXECUTIVE CAPABILITY DOMAINS
// ============================================================
export const COMPETENCY_CATEGORIES = [
  {
    id: "lead_yourself",
    label: "Lead Yourself",
    icon: User,
    color: "#6366f1",
    description: "Personal mastery before leading others",
    domain_number: 1,
  },
  {
    id: "lead_people",
    label: "Lead People",
    icon: Users,
    color: "#f97316",
    description: "Develop high-performing teams",
    domain_number: 2,
  },
  {
    id: "lead_business",
    label: "Lead the Business",
    icon: TrendingUp,
    color: "#f59e0b",
    description: "Drive organizational success",
    domain_number: 3,
  },
  {
    id: "lead_technology",
    label: "Lead Technology",
    icon: Cpu,
    color: "#06b6d4",
    description: "Technology-enabled leadership",
    domain_number: 4,
  },
  {
    id: "lead_change",
    label: "Lead Change",
    icon: Sparkles,
    color: "#8b5cf6",
    description: "Transformation leadership",
    domain_number: 5,
  },
  {
    id: "lead_legacy",
    label: "Lead Legacy",
    icon: Crown,
    color: "#ec4899",
    description: "Long-term executive impact",
    domain_number: 6,
  },
  {
    id: "certifications",
    label: "Certifications",
    icon: Award,
    color: "#eab308",
    description: "Professional certifications and credentials",
    domain_number: 7,
  },
];

// Alias for semantic clarity
export const EECF_DOMAINS = COMPETENCY_CATEGORIES;

// ============================================================
// GLOBAL COMPETENCY LIBRARY — Mapped to 6 Domains
// ============================================================
export const COMPETENCY_LIBRARY = [
  // ── DOMAIN 1: LEAD YOURSELF ──
  { name: "Self-Awareness", category: "lead_yourself", subcategory: "Personal Mastery" },
  { name: "Emotional Intelligence", category: "lead_yourself", subcategory: "Personal Mastery" },
  { name: "Resilience", category: "lead_yourself", subcategory: "Personal Mastery" },
  { name: "Adaptability", category: "lead_yourself", subcategory: "Personal Mastery" },
  { name: "Learning Agility", category: "lead_yourself", subcategory: "Personal Mastery" },
  { name: "Personal Accountability", category: "lead_yourself", subcategory: "Personal Mastery" },
  { name: "Ethics & Integrity", category: "lead_yourself", subcategory: "Personal Mastery" },
  { name: "Executive Presence", category: "lead_yourself", subcategory: "Executive Presence" },
  { name: "Time & Energy Management", category: "lead_yourself", subcategory: "Personal Mastery" },
  { name: "Decision Confidence", category: "lead_yourself", subcategory: "Decision Making" },
  { name: "Decision Making", category: "lead_yourself", subcategory: "Decision Making" },
  { name: "Ethical Leadership", category: "lead_yourself", subcategory: "Personal Mastery" },

  // ── DOMAIN 2: LEAD PEOPLE ──
  { name: "Coaching", category: "lead_people", subcategory: "Team Development" },
  { name: "Mentoring", category: "lead_people", subcategory: "Team Development" },
  { name: "Talent Development", category: "lead_people", subcategory: "Talent" },
  { name: "Performance Management", category: "lead_people", subcategory: "Talent" },
  { name: "Delegation", category: "lead_people", subcategory: "Team Development" },
  { name: "Conflict Resolution", category: "lead_people", subcategory: "Team Development" },
  { name: "Team Building", category: "lead_people", subcategory: "Team Development" },
  { name: "Psychological Safety", category: "lead_people", subcategory: "Culture" },
  { name: "Employee Engagement", category: "lead_people", subcategory: "Culture" },
  { name: "Diversity & Inclusion", category: "lead_people", subcategory: "Culture" },
  { name: "Succession Planning", category: "lead_people", subcategory: "Talent" },
  { name: "People Leadership", category: "lead_people", subcategory: "Team Development" },
  { name: "Leadership Coaching", category: "lead_people", subcategory: "Team Development" },
  { name: "Organizational Development", category: "lead_people", subcategory: "Culture" },

  // ── DOMAIN 3: LEAD THE BUSINESS ──
  { name: "Strategic Thinking", category: "lead_business", subcategory: "Strategy" },
  { name: "Business Acumen", category: "lead_business", subcategory: "Strategy" },
  { name: "Financial Literacy", category: "lead_business", subcategory: "Finance" },
  { name: "Budget Management", category: "lead_business", subcategory: "Finance" },
  { name: "P&L Management", category: "lead_business", subcategory: "Finance" },
  { name: "Commercial Thinking", category: "lead_business", subcategory: "Commercial" },
  { name: "Customer Centricity", category: "lead_business", subcategory: "Commercial" },
  { name: "Innovation", category: "lead_business", subcategory: "Growth" },
  { name: "Growth Strategy", category: "lead_business", subcategory: "Growth" },
  { name: "Market Intelligence", category: "lead_business", subcategory: "Strategy" },
  { name: "Corporate Strategy", category: "lead_business", subcategory: "Strategy" },
  { name: "Business Strategy", category: "lead_business", subcategory: "Strategy" },
  { name: "Strategic Planning", category: "lead_business", subcategory: "Strategy" },
  { name: "Competitive Intelligence", category: "lead_business", subcategory: "Strategy" },
  { name: "Market Analysis", category: "lead_business", subcategory: "Strategy" },
  { name: "Business Model Innovation", category: "lead_business", subcategory: "Growth" },
  { name: "Innovation Management", category: "lead_business", subcategory: "Growth" },
  { name: "Revenue Growth", category: "lead_business", subcategory: "Commercial" },
  { name: "Pricing Strategy", category: "lead_business", subcategory: "Commercial" },
  { name: "Commercial Strategy", category: "lead_business", subcategory: "Commercial" },
  { name: "Cost Optimization", category: "lead_business", subcategory: "Finance" },
  { name: "Operational Excellence", category: "lead_business", subcategory: "Commercial" },
  { name: "Portfolio Management", category: "lead_business", subcategory: "Strategy" },

  // ── DOMAIN 4: LEAD TECHNOLOGY ──
  { name: "Digital Transformation", category: "lead_technology", subcategory: "Digital" },
  { name: "AI Strategy", category: "lead_technology", subcategory: "AI" },
  { name: "AI Governance", category: "lead_technology", subcategory: "AI" },
  { name: "Enterprise Architecture", category: "lead_technology", subcategory: "Architecture" },
  { name: "Product Strategy", category: "lead_technology", subcategory: "Product" },
  { name: "Data Literacy", category: "lead_technology", subcategory: "Data" },
  { name: "Cybersecurity Awareness", category: "lead_technology", subcategory: "Security" },
  { name: "Cloud Strategy", category: "lead_technology", subcategory: "Cloud" },
  { name: "IT Governance", category: "lead_technology", subcategory: "Governance" },
  { name: "Automation Strategy", category: "lead_technology", subcategory: "AI" },
  { name: "Artificial Intelligence", category: "lead_technology", subcategory: "AI" },
  { name: "Generative AI", category: "lead_technology", subcategory: "AI" },
  { name: "Enterprise AI", category: "lead_technology", subcategory: "AI" },
  { name: "Prompt Engineering", category: "lead_technology", subcategory: "AI" },
  { name: "Machine Learning", category: "lead_technology", subcategory: "AI" },
  { name: "AI Ethics", category: "lead_technology", subcategory: "AI" },
  { name: "Automation", category: "lead_technology", subcategory: "AI" },
  { name: "AI Product Management", category: "lead_technology", subcategory: "AI" },
  { name: "Solution Architecture", category: "lead_technology", subcategory: "Architecture" },
  { name: "SaaS Architecture", category: "lead_technology", subcategory: "Architecture" },
  { name: "Cloud Computing", category: "lead_technology", subcategory: "Cloud" },
  { name: "Azure", category: "lead_technology", subcategory: "Cloud" },
  { name: "AWS", category: "lead_technology", subcategory: "Cloud" },
  { name: "Google Cloud", category: "lead_technology", subcategory: "Cloud" },
  { name: "Cybersecurity", category: "lead_technology", subcategory: "Security" },
  { name: "Digital Workplace", category: "lead_technology", subcategory: "Digital" },
  { name: "Data Strategy", category: "lead_technology", subcategory: "Data" },
  { name: "Data Analytics", category: "lead_technology", subcategory: "Data" },
  { name: "API Strategy", category: "lead_technology", subcategory: "Architecture" },
  { name: "Platform Engineering", category: "lead_technology", subcategory: "Architecture" },
  { name: "Product Management", category: "lead_technology", subcategory: "Product" },
  { name: "Product Roadmapping", category: "lead_technology", subcategory: "Product" },
  { name: "Product Discovery", category: "lead_technology", subcategory: "Product" },
  { name: "Product Design", category: "lead_technology", subcategory: "Product" },
  { name: "UX Strategy", category: "lead_technology", subcategory: "Product" },
  { name: "Innovation Leadership", category: "lead_technology", subcategory: "Product" },
  { name: "Platform Strategy", category: "lead_technology", subcategory: "Architecture" },
  { name: "Customer Obsession", category: "lead_technology", subcategory: "Product" },
  { name: "IT Service Management", category: "lead_technology", subcategory: "Governance" },
  { name: "ServiceNow", category: "lead_technology", subcategory: "Governance" },
  { name: "ITIL", category: "lead_technology", subcategory: "Governance" },

  // ── DOMAIN 5: LEAD CHANGE ──
  { name: "Change Management", category: "lead_change", subcategory: "Transformation" },
  { name: "Transformation Leadership", category: "lead_change", subcategory: "Transformation" },
  { name: "Crisis Leadership", category: "lead_change", subcategory: "Resilience" },
  { name: "Organizational Agility", category: "lead_change", subcategory: "Agility" },
  { name: "Communication During Change", category: "lead_change", subcategory: "Transformation" },
  { name: "Stakeholder Alignment", category: "lead_change", subcategory: "Transformation" },
  { name: "Enterprise Execution", category: "lead_change", subcategory: "Execution" },
  { name: "Continuous Improvement", category: "lead_change", subcategory: "Execution" },
  { name: "Business Transformation", category: "lead_change", subcategory: "Transformation" },
  { name: "Digital Strategy", category: "lead_change", subcategory: "Transformation" },
  { name: "Transformational Leadership", category: "lead_change", subcategory: "Transformation" },
  { name: "Stakeholder Management", category: "lead_change", subcategory: "Transformation" },
  { name: "Delivery Governance", category: "lead_change", subcategory: "Execution" },
  { name: "Program Management", category: "lead_change", subcategory: "Delivery" },
  { name: "Agile", category: "lead_change", subcategory: "Delivery" },
  { name: "Scrum", category: "lead_change", subcategory: "Delivery" },
  { name: "Kanban", category: "lead_change", subcategory: "Delivery" },
  { name: "Lean", category: "lead_change", subcategory: "Delivery" },
  { name: "Lean Six Sigma", category: "lead_change", subcategory: "Delivery" },
  { name: "PMO", category: "lead_change", subcategory: "Execution" },
  { name: "Risk Management", category: "lead_change", subcategory: "Resilience" },
  { name: "Incident Management", category: "lead_change", subcategory: "Execution" },
  { name: "Problem Management", category: "lead_change", subcategory: "Execution" },
  { name: "Release Management", category: "lead_change", subcategory: "Execution" },
  { name: "Capacity Management", category: "lead_change", subcategory: "Execution" },
  { name: "Availability Management", category: "lead_change", subcategory: "Execution" },
  { name: "Disaster Recovery", category: "lead_change", subcategory: "Resilience" },
  { name: "Business Continuity", category: "lead_change", subcategory: "Resilience" },
  { name: "Service Delivery", category: "lead_change", subcategory: "Execution" },
  { name: "Service Operations", category: "lead_change", subcategory: "Execution" },
  { name: "Management Consulting", category: "lead_change", subcategory: "Advisory" },
  { name: "Technology Consulting", category: "lead_change", subcategory: "Advisory" },
  { name: "Business Consulting", category: "lead_change", subcategory: "Advisory" },
  { name: "Business Process Reengineering", category: "lead_change", subcategory: "Transformation" },
  { name: "Operating Model Design", category: "lead_change", subcategory: "Transformation" },

  // ── DOMAIN 6: LEAD LEGACY ──
  { name: "Executive Reputation", category: "lead_legacy", subcategory: "Reputation" },
  { name: "Board Readiness", category: "lead_legacy", subcategory: "Board" },
  { name: "Executive Influence", category: "lead_legacy", subcategory: "Influence" },
  { name: "Public Speaking", category: "lead_legacy", subcategory: "Communication" },
  { name: "Thought Leadership", category: "lead_legacy", subcategory: "Thought" },
  { name: "Knowledge Sharing", category: "lead_legacy", subcategory: "Thought" },
  { name: "Mentorship", category: "lead_legacy", subcategory: "Contribution" },
  { name: "Ethical Stewardship", category: "lead_legacy", subcategory: "Contribution" },
  { name: "Community Contribution", category: "lead_legacy", subcategory: "Contribution" },
  { name: "Legacy Building", category: "lead_legacy", subcategory: "Thought" },
  { name: "Board Communication", category: "lead_legacy", subcategory: "Board" },
  { name: "Executive Communication", category: "lead_legacy", subcategory: "Communication" },
  { name: "Influence", category: "lead_legacy", subcategory: "Influence" },
  { name: "Media Communication", category: "lead_legacy", subcategory: "Communication" },
  { name: "Crisis Communication", category: "lead_legacy", subcategory: "Communication" },
  { name: "Influencing", category: "lead_legacy", subcategory: "Influence" },
  { name: "Storytelling", category: "lead_legacy", subcategory: "Communication" },
  { name: "Executive Presentations", category: "lead_legacy", subcategory: "Communication" },
  { name: "Business Writing", category: "lead_legacy", subcategory: "Communication" },
  { name: "Technical Writing", category: "lead_legacy", subcategory: "Communication" },
  { name: "Corporate Governance", category: "lead_legacy", subcategory: "Board" },
  { name: "Enterprise Risk Management", category: "lead_legacy", subcategory: "Board" },
  { name: "Compliance", category: "lead_legacy", subcategory: "Board" },
  { name: "Audit", category: "lead_legacy", subcategory: "Board" },
  { name: "Internal Controls", category: "lead_legacy", subcategory: "Board" },
  { name: "Data Privacy", category: "lead_legacy", subcategory: "Board" },
  { name: "ESG", category: "lead_legacy", subcategory: "Board" },

  // ── Certifications ──
  { name: "PMP", category: "certifications", subcategory: "Project Management" },
  { name: "PRINCE2", category: "certifications", subcategory: "Project Management" },
  { name: "Scrum Master", category: "certifications", subcategory: "Agile" },
  { name: "CISSP", category: "certifications", subcategory: "Security" },
  { name: "CISM", category: "certifications", subcategory: "Security" },
  { name: "CISA", category: "certifications", subcategory: "Security" },
  { name: "Azure Certifications", category: "certifications", subcategory: "Cloud" },
  { name: "AWS Certifications", category: "certifications", subcategory: "Cloud" },
  { name: "Google Cloud Certifications", category: "certifications", subcategory: "Cloud" },
  { name: "ServiceNow CSA", category: "certifications", subcategory: "IT Service" },
  { name: "TOGAF", category: "certifications", subcategory: "Architecture" },
];

// ============================================================
// EXECUTIVE ROLE LADDER — Target Role Mapping
// ============================================================
export const EXECUTIVE_ROLE_LADDER = [
  { role: "Operations Manager", level: 1, nextRole: "Director" },
  { role: "Director", level: 2, nextRole: "Senior Director" },
  { role: "Senior Director", level: 3, nextRole: "Vice President" },
  { role: "Vice President", level: 4, nextRole: "General Manager" },
  { role: "General Manager", level: 5, nextRole: "Chief Operating Officer" },
  { role: "Chief Operating Officer", level: 6, nextRole: "Chief Executive Officer" },
  { role: "Chief Executive Officer", level: 7, nextRole: null },
];

export const ROLE_RECOMMENDATIONS = {
  "operations manager": ["Operational Excellence", "Change Management", "Program Management", "Service Operations", "Budget Management", "Stakeholder Alignment", "Team Building"],
  "director": ["Strategic Thinking", "Stakeholder Management", "Executive Communication", "Program Management", "Change Management", "Executive Presence", "Decision Making"],
  "senior director": ["Strategic Planning", "Executive Influence", "Business Acumen", "Enterprise Execution", "Talent Development", "Change Management", "Stakeholder Alignment"],
  "vice president": ["Executive Leadership", "Strategic Planning", "Stakeholder Management", "Executive Presence", "Decision Making", "Board Communication", "Business Strategy"],
  "general manager": ["P&L Management", "Business Acumen", "Strategic Thinking", "Operational Excellence", "Talent Development", "Commercial Thinking", "Enterprise Execution"],
  "chief operating officer": ["Operational Excellence", "Enterprise Execution", "P&L Management", "Change Management", "Strategic Planning", "Organizational Agility", "Talent Development"],
  "chief executive officer": ["Corporate Strategy", "Executive Leadership", "Board Readiness", "Stakeholder Management", "Executive Presence", "Vision Setting", "Corporate Governance", "Legacy Building"],
  cio: ["Budget Management", "Executive Communication", "AI Governance", "Enterprise Architecture", "Digital Transformation", "IT Governance", "Vendor Management", "Cybersecurity Awareness"],
  cto: ["AI Strategy", "Cloud Strategy", "Enterprise Architecture", "Technology Consulting", "Product Strategy", "Platform Engineering", "Cybersecurity Awareness", "Innovation"],
  cfo: ["Financial Literacy", "P&L Management", "Cost Optimization", "Enterprise Risk Management", "Contract Negotiation", "Investment Analysis", "Compliance", "Business Acumen"],
  founder: ["Business Strategy", "Product Strategy", "Growth Strategy", "Executive Leadership", "Revenue Growth", "Business Model Innovation", "Legacy Building"],
};

// ============================================================
// INDUSTRY MAPPING — Competency Weighting by Industry
// ============================================================
export const INDUSTRY_MAPPING = {
  technology: { primary: ["lead_technology", "lead_business"], weight: 1.2, focus: ["AI Strategy", "Cloud Strategy", "Product Strategy", "Innovation", "Digital Transformation"] },
  finance: { primary: ["lead_business", "lead_legacy"], weight: 1.2, focus: ["Financial Literacy", "P&L Management", "Risk Management", "Compliance", "Corporate Governance"] },
  healthcare: { primary: ["lead_change", "lead_people"], weight: 1.1, focus: ["Change Management", "Compliance", "Operational Excellence", "Stakeholder Alignment", "Crisis Leadership"] },
  government: { primary: ["lead_legacy", "lead_change"], weight: 1.1, focus: ["Corporate Governance", "Compliance", "Stakeholder Alignment", "Ethical Stewardship", "Risk Management"] },
  manufacturing: { primary: ["lead_business", "lead_change"], weight: 1.1, focus: ["Operational Excellence", "Continuous Improvement", "Lean Six Sigma", "Supply Chain", "Program Management"] },
  retail: { primary: ["lead_business", "lead_technology"], weight: 1.1, focus: ["Customer Centricity", "Commercial Thinking", "Digital Transformation", "Data Literacy", "Growth Strategy"] },
  energy: { primary: ["lead_change", "lead_business"], weight: 1.1, focus: ["Risk Management", "Sustainability", "Operational Excellence", "Compliance", "Strategic Planning"] },
  consulting: { primary: ["lead_change", "lead_legacy"], weight: 1.2, focus: ["Thought Leadership", "Stakeholder Management", "Business Consulting", "Executive Communication", "Knowledge Sharing"] },
  education: { primary: ["lead_people", "lead_legacy"], weight: 1.0, focus: ["Mentorship", "Knowledge Sharing", "Talent Development", "Community Contribution", "Thought Leadership"] },
  telecommunications: { primary: ["lead_technology", "lead_change"], weight: 1.1, focus: ["Digital Transformation", "Cloud Strategy", "Operational Excellence", "Customer Centricity", "Program Management"] },
};

export const INDUSTRIES = Object.keys(INDUSTRY_MAPPING);

// ============================================================
// COMPANY-SPECIFIC COMPETENCIES
// ============================================================
export const COMPANY_RECOMMENDATIONS = {
  microsoft: ["Azure", "AI Strategy", "Product Strategy", "Cloud Computing", "Platform Strategy"],
  amazon: ["Operational Excellence", "Customer Obsession", "Personal Accountability", "AWS", "Platform Engineering"],
  accenture: ["Management Consulting", "Business Transformation", "Executive Communication", "Business Process Reengineering", "Digital Transformation"],
  google: ["Innovation", "Artificial Intelligence", "Product Strategy", "Google Cloud", "Data Strategy"],
  deloitte: ["Executive Advisory", "Corporate Strategy", "Business Transformation", "Compliance", "Audit"],
};

export const POPULAR_COMPETENCIES = [
  "Executive Presence", "Strategic Thinking", "Executive Communication",
  "Change Management", "Decision Making", "Stakeholder Alignment",
  "Digital Transformation", "AI Strategy", "Cloud Strategy",
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================
export function getCategoryById(id) {
  return COMPETENCY_CATEGORIES.find((c) => c.id === id);
}

export function getDomainById(id) {
  return getCategoryById(id);
}

export function getProficiencyById(id) {
  return PROFICIENCY_LEVELS.find((p) => p.id === id);
}

export function getCompetencyByName(name) {
  return COMPETENCY_LIBRARY.find((c) => c.name === name);
}

export function getSubcategories(categoryId) {
  const comps = COMPETENCY_LIBRARY.filter((c) => c.category === categoryId);
  return [...new Set(comps.map((c) => c.subcategory))];
}

export function searchCompetencies(query, exclude = []) {
  if (!query) return [];
  const q = query.toLowerCase();
  return COMPETENCY_LIBRARY.filter(
    (c) => c.name.toLowerCase().includes(q) && !exclude.includes(c.name)
  ).slice(0, 20);
}

export function getByCategory(categoryId, exclude = []) {
  return COMPETENCY_LIBRARY.filter(
    (c) => c.category === categoryId && !exclude.includes(c.name)
  );
}

export function getBySubcategory(categoryId, subcategory, exclude = []) {
  return COMPETENCY_LIBRARY.filter(
    (c) => c.category === categoryId && c.subcategory === subcategory && !exclude.includes(c.name)
  );
}

export function getRecentlyUsed(userId) {
  try {
    const raw = localStorage.getItem(`exec_competencies_recent_${userId || "anon"}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addRecentlyUsed(userId, name) {
  try {
    const key = `exec_competencies_recent_${userId || "anon"}`;
    const current = getRecentlyUsed(userId);
    const updated = [name, ...current.filter((n) => n !== name)].slice(0, 20);
    localStorage.setItem(key, JSON.stringify(updated));
  } catch {}
}

export function getSuggested(targetRole, exclude = []) {
  const roleKey = (targetRole || "").toLowerCase().trim();
  const matchKey = Object.keys(ROLE_RECOMMENDATIONS).find(
    (k) => roleKey.includes(k) || k.includes(roleKey)
  );
  const names = matchKey
    ? ROLE_RECOMMENDATIONS[matchKey]
    : POPULAR_COMPETENCIES;
  return names
    .filter((n) => !exclude.includes(n))
    .map((n) => getCompetencyByName(n))
    .filter(Boolean);
}

export function getPopular(exclude = []) {
  return POPULAR_COMPETENCIES
    .filter((n) => !exclude.includes(n))
    .map((n) => getCompetencyByName(n))
    .filter(Boolean);
}

export function getCompanyRecommendations(companyName, exclude = []) {
  const key = (companyName || "").toLowerCase().trim();
  const matchKey = Object.keys(COMPANY_RECOMMENDATIONS).find(
    (k) => key.includes(k) || k.includes(key)
  );
  if (!matchKey) return [];
  return COMPANY_RECOMMENDATIONS[matchKey]
    .filter((n) => !exclude.includes(n))
    .map((n) => getCompetencyByName(n))
    .filter(Boolean);
}

export function getIndustryFocus(industry) {
  const key = (industry || "").toLowerCase().trim();
  const matchKey = Object.keys(INDUSTRY_MAPPING).find(
    (k) => key.includes(k) || k.includes(key)
  );
  if (!matchKey) return null;
  return INDUSTRY_MAPPING[matchKey];
}

// ============================================================
// DOMAIN SUMMARY — Powers EXEC™ Coaching & Leadership DNA™
// ============================================================
export function computeDomainSummary(competencies) {
  const domains = {};
  COMPETENCY_CATEGORIES.filter((c) => c.id !== "certifications").forEach((d) => {
    domains[d.id] = { ...d, count: 0, totalScore: 0, avgScore: 0, verified: 0, growing: 0, competencies: [] };
  });

  competencies.forEach((c) => {
    const d = domains[c.category];
    if (!d) return;
    d.count++;
    d.totalScore += c.competency_score || 0;
    if (c.verified) d.verified++;
    if (c.growth_trend === "up") d.growing++;
    d.competencies.push(c);
  });

  Object.values(domains).forEach((d) => {
    d.avgScore = d.count > 0 ? Math.round(d.totalScore / d.count) : 0;
  });

  return Object.values(domains).sort((a, b) => a.domain_number - b.domain_number);
}

// ============================================================
// EXEC™ COACHING SUMMARY
// ============================================================
export function getExecCoachingSummary(competencies, targetRole) {
  const domains = computeDomainSummary(competencies);
  if (domains.every((d) => d.count === 0)) return null;

  const sorted = [...domains].sort((a, b) => b.avgScore - a.avgScore);
  const strongest = sorted[0];
  const weakest = sorted[sorted.length - 1];

  const gap = computeGapAnalysis(competencies, targetRole);

  const insights = [];
  if (strongest && strongest.count > 0) {
    insights.push(`Your strongest capability is **${strongest.label}** (${strongest.avgScore}%).`);
  }
  if (weakest && weakest.count > 0 && weakest.id !== strongest?.id) {
    insights.push(`Your greatest opportunity is **${weakest.label}** (${weakest.avgScore}%).`);
  }
  if (gap && gap.missing.length > 0) {
    insights.push(`To reach **${gap.targetRole}** readiness, focus on: ${gap.missing.slice(0, 3).map((m) => m.name).join(", ")}.`);
  }

  return { strongest, weakest, domains, gap, insights };
}

// ============================================================
// GAP ANALYSIS — Target Role Readiness
// ============================================================
export function computeGapAnalysis(competencies, targetRole) {
  const roleKey = (targetRole || "").toLowerCase().trim();
  const matchKey = Object.keys(ROLE_RECOMMENDATIONS).find(
    (k) => roleKey.includes(k) || k.includes(roleKey)
  );
  if (!matchKey) return null;

  const required = ROLE_RECOMMENDATIONS[matchKey];
  const have = competencies.map((c) => c.competency_name);
  const missing = required.filter((n) => !have.includes(n));

  const totalRequired = required.length;
  const haveCount = totalRequired - missing.length;
  const readinessPct = Math.round((haveCount / totalRequired) * 100);

  const ladder = EXECUTIVE_ROLE_LADDER.find((r) => r.role.toLowerCase() === matchKey);

  return {
    targetRole: ladder?.role || matchKey.replace(/\b\w/g, (c) => c.toUpperCase()),
    nextRole: ladder?.nextRole,
    missing: missing.map((n) => getCompetencyByName(n)).filter(Boolean),
    have: required.filter((n) => have.includes(n)).map((n) => getCompetencyByName(n)).filter(Boolean),
    readinessPct,
    totalRequired,
    haveCount,
  };
}
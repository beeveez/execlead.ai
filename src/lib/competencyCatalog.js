import {
  Crown, TrendingUp, Brain, Cpu, Server, Package, DollarSign,
  CheckSquare, Users, MessageSquare, Briefcase, Shield, Award,
  FileText, Fingerprint, ClipboardCheck, Sparkles, User,
} from "lucide-react";

// ============================================================
// COMPETENCY MATURITY MODEL (8 levels)
// ============================================================
export const PROFICIENCY_LEVELS = [
  { id: "awareness", label: "Awareness", color: "#94a3b8", minYears: 0, description: "Familiar with the fundamentals" },
  { id: "working", label: "Working Knowledge", color: "#64748b", minYears: 1, description: "Can apply with guidance" },
  { id: "practitioner", label: "Practitioner", color: "#0ea5e9", minYears: 3, description: "Applies independently" },
  { id: "advanced", label: "Advanced", color: "#3b82f6", minYears: 6, description: "Proficient and guiding others" },
  { id: "expert", label: "Expert", color: "#6366f1", minYears: 10, description: "Recognized authority" },
  { id: "executive", label: "Executive", color: "#8b5cf6", minYears: 14, description: "Strategic leader in this domain" },
  { id: "industry_leader", label: "Industry Leader", color: "#f59e0b", minYears: 18, description: "Sets industry direction" },
  { id: "thought_leader", label: "Thought Leader", color: "#ec4899", minYears: 20, description: "Defines the field" },
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
// COMPETENCY DOMAINS (12)
// ============================================================
export const COMPETENCY_CATEGORIES = [
  { id: "executive_leadership", label: "Executive Leadership", icon: Crown, color: "#6366f1", description: "Core executive leadership capabilities" },
  { id: "business_strategy", label: "Business & Strategy", icon: TrendingUp, color: "#f59e0b", description: "Strategic thinking and business acumen" },
  { id: "ai", label: "Artificial Intelligence", icon: Brain, color: "#8b5cf6", description: "AI strategy, governance, and application" },
  { id: "technology_leadership", label: "Technology Leadership", icon: Cpu, color: "#06b6d4", description: "Technical architecture and infrastructure" },
  { id: "it_leadership", label: "IT Leadership", icon: Server, color: "#3b82f6", description: "IT service management and operations" },
  { id: "product_innovation", label: "Product & Innovation", icon: Package, color: "#10b981", description: "Product strategy and innovation" },
  { id: "commercial_finance", label: "Commercial & Finance", icon: DollarSign, color: "#84cc16", description: "Financial and commercial leadership" },
  { id: "project_delivery", label: "Project & Delivery", icon: CheckSquare, color: "#ec4899", description: "Delivery methodologies and frameworks" },
  { id: "people_culture", label: "People & Culture", icon: Users, color: "#f97316", description: "Talent and organizational development" },
  { id: "communication", label: "Communication", icon: MessageSquare, color: "#14b8a6", description: "Executive communication and influence" },
  { id: "consulting", label: "Consulting", icon: Briefcase, color: "#a855f7", description: "Advisory and consulting capabilities" },
  { id: "governance_risk", label: "Governance & Risk", icon: Shield, color: "#ef4444", description: "Governance, risk, and compliance" },
  { id: "certifications", label: "Certifications", icon: Award, color: "#eab308", description: "Professional certifications and credentials" },
];

// ============================================================
// GLOBAL COMPETENCY LIBRARY
// ============================================================
export const COMPETENCY_LIBRARY = [
  // 1. Executive Leadership
  { name: "Executive Leadership", category: "executive_leadership", subcategory: "Core Leadership" },
  { name: "Strategic Leadership", category: "executive_leadership", subcategory: "Core Leadership" },
  { name: "Vision Setting", category: "executive_leadership", subcategory: "Core Leadership" },
  { name: "Executive Presence", category: "executive_leadership", subcategory: "Core Leadership" },
  { name: "Decision Making", category: "executive_leadership", subcategory: "Core Leadership" },
  { name: "Leadership Coaching", category: "executive_leadership", subcategory: "Core Leadership" },
  { name: "Organizational Leadership", category: "executive_leadership", subcategory: "Core Leadership" },
  { name: "People Leadership", category: "executive_leadership", subcategory: "Core Leadership" },
  { name: "Ethical Leadership", category: "executive_leadership", subcategory: "Core Leadership" },
  { name: "Transformational Leadership", category: "executive_leadership", subcategory: "Leadership Styles" },
  { name: "Servant Leadership", category: "executive_leadership", subcategory: "Leadership Styles" },
  { name: "Situational Leadership", category: "executive_leadership", subcategory: "Leadership Styles" },
  { name: "Executive Communication", category: "executive_leadership", subcategory: "Influence" },
  { name: "Influence", category: "executive_leadership", subcategory: "Influence" },
  { name: "Stakeholder Management", category: "executive_leadership", subcategory: "Influence" },
  { name: "Board Communication", category: "executive_leadership", subcategory: "Influence" },
  { name: "Board Readiness", category: "executive_leadership", subcategory: "Influence" },
  { name: "Ownership", category: "executive_leadership", subcategory: "Core Leadership" },

  // 2. Business & Strategy
  { name: "Corporate Strategy", category: "business_strategy", subcategory: "Strategy" },
  { name: "Business Strategy", category: "business_strategy", subcategory: "Strategy" },
  { name: "Strategic Planning", category: "business_strategy", subcategory: "Strategy" },
  { name: "Business Transformation", category: "business_strategy", subcategory: "Transformation" },
  { name: "Digital Strategy", category: "business_strategy", subcategory: "Transformation" },
  { name: "Growth Strategy", category: "business_strategy", subcategory: "Strategy" },
  { name: "Competitive Intelligence", category: "business_strategy", subcategory: "Analysis" },
  { name: "Market Analysis", category: "business_strategy", subcategory: "Analysis" },
  { name: "Business Model Innovation", category: "business_strategy", subcategory: "Innovation" },
  { name: "Portfolio Management", category: "business_strategy", subcategory: "Strategy" },
  { name: "Innovation Management", category: "business_strategy", subcategory: "Innovation" },

  // 3. Artificial Intelligence
  { name: "Artificial Intelligence", category: "ai", subcategory: "Core AI" },
  { name: "Generative AI", category: "ai", subcategory: "Core AI" },
  { name: "Enterprise AI", category: "ai", subcategory: "Core AI" },
  { name: "AI Governance", category: "ai", subcategory: "Governance" },
  { name: "AI Strategy", category: "ai", subcategory: "Strategy" },
  { name: "Prompt Engineering", category: "ai", subcategory: "Core AI" },
  { name: "Machine Learning", category: "ai", subcategory: "Core AI" },
  { name: "AI Ethics", category: "ai", subcategory: "Governance" },
  { name: "Automation", category: "ai", subcategory: "Core AI" },
  { name: "AI Product Management", category: "ai", subcategory: "Strategy" },

  // 4. Technology Leadership
  { name: "Enterprise Architecture", category: "technology_leadership", subcategory: "Architecture" },
  { name: "Solution Architecture", category: "technology_leadership", subcategory: "Architecture" },
  { name: "SaaS Architecture", category: "technology_leadership", subcategory: "Architecture" },
  { name: "Cloud Strategy", category: "technology_leadership", subcategory: "Cloud" },
  { name: "Cloud Computing", category: "technology_leadership", subcategory: "Cloud" },
  { name: "Azure", category: "technology_leadership", subcategory: "Cloud" },
  { name: "AWS", category: "technology_leadership", subcategory: "Cloud" },
  { name: "Google Cloud", category: "technology_leadership", subcategory: "Cloud" },
  { name: "Cybersecurity", category: "technology_leadership", subcategory: "Security" },
  { name: "Digital Workplace", category: "technology_leadership", subcategory: "Infrastructure" },
  { name: "Data Strategy", category: "technology_leadership", subcategory: "Data" },
  { name: "Data Analytics", category: "technology_leadership", subcategory: "Data" },
  { name: "API Strategy", category: "technology_leadership", subcategory: "Architecture" },
  { name: "Platform Engineering", category: "technology_leadership", subcategory: "Architecture" },

  // 5. IT Leadership
  { name: "IT Service Management", category: "it_leadership", subcategory: "Service Management" },
  { name: "IT Governance", category: "it_leadership", subcategory: "Governance" },
  { name: "Service Delivery", category: "it_leadership", subcategory: "Service Management" },
  { name: "Service Operations", category: "it_leadership", subcategory: "Operations" },
  { name: "Incident Management", category: "it_leadership", subcategory: "Operations" },
  { name: "Problem Management", category: "it_leadership", subcategory: "Operations" },
  { name: "Change Management", category: "it_leadership", subcategory: "Operations" },
  { name: "Release Management", category: "it_leadership", subcategory: "Operations" },
  { name: "Capacity Management", category: "it_leadership", subcategory: "Operations" },
  { name: "Availability Management", category: "it_leadership", subcategory: "Operations" },
  { name: "Disaster Recovery", category: "it_leadership", subcategory: "Resilience" },
  { name: "Business Continuity", category: "it_leadership", subcategory: "Resilience" },
  { name: "ServiceNow", category: "it_leadership", subcategory: "Platforms" },
  { name: "ITIL", category: "it_leadership", subcategory: "Frameworks" },

  // 6. Product & Innovation
  { name: "Product Management", category: "product_innovation", subcategory: "Core Product" },
  { name: "Product Strategy", category: "product_innovation", subcategory: "Core Product" },
  { name: "Product Roadmapping", category: "product_innovation", subcategory: "Core Product" },
  { name: "Product Discovery", category: "product_innovation", subcategory: "Core Product" },
  { name: "Product Design", category: "product_innovation", subcategory: "Design" },
  { name: "UX Strategy", category: "product_innovation", subcategory: "Design" },
  { name: "Innovation Leadership", category: "product_innovation", subcategory: "Innovation" },
  { name: "Platform Strategy", category: "product_innovation", subcategory: "Core Product" },
  { name: "Customer Obsession", category: "product_innovation", subcategory: "Core Product" },
  { name: "Product Leadership", category: "product_innovation", subcategory: "Core Product" },

  // 7. Commercial & Finance
  { name: "P&L Management", category: "commercial_finance", subcategory: "Finance" },
  { name: "Financial Planning", category: "commercial_finance", subcategory: "Finance" },
  { name: "Budget Management", category: "commercial_finance", subcategory: "Finance" },
  { name: "Commercial Strategy", category: "commercial_finance", subcategory: "Commercial" },
  { name: "Revenue Growth", category: "commercial_finance", subcategory: "Commercial" },
  { name: "Pricing Strategy", category: "commercial_finance", subcategory: "Commercial" },
  { name: "Sales Leadership", category: "commercial_finance", subcategory: "Commercial" },
  { name: "Vendor Management", category: "commercial_finance", subcategory: "Commercial" },
  { name: "Procurement", category: "commercial_finance", subcategory: "Commercial" },
  { name: "Contract Negotiation", category: "commercial_finance", subcategory: "Commercial" },
  { name: "Investment Analysis", category: "commercial_finance", subcategory: "Finance" },
  { name: "Cost Optimization", category: "commercial_finance", subcategory: "Finance" },
  { name: "Operational Excellence", category: "commercial_finance", subcategory: "Commercial" },

  // 8. Project & Delivery
  { name: "Program Management", category: "project_delivery", subcategory: "Management" },
  { name: "Portfolio Management", category: "project_delivery", subcategory: "Management" },
  { name: "Agile", category: "project_delivery", subcategory: "Methodologies" },
  { name: "Scrum", category: "project_delivery", subcategory: "Methodologies" },
  { name: "Kanban", category: "project_delivery", subcategory: "Methodologies" },
  { name: "Lean", category: "project_delivery", subcategory: "Methodologies" },
  { name: "Lean Six Sigma", category: "project_delivery", subcategory: "Methodologies" },
  { name: "PMO", category: "project_delivery", subcategory: "Management" },
  { name: "Risk Management", category: "project_delivery", subcategory: "Management" },
  { name: "Delivery Governance", category: "project_delivery", subcategory: "Management" },

  // 9. People & Culture
  { name: "Talent Development", category: "people_culture", subcategory: "Talent" },
  { name: "Succession Planning", category: "people_culture", subcategory: "Talent" },
  { name: "Organizational Development", category: "people_culture", subcategory: "Organization" },
  { name: "Executive Coaching", category: "people_culture", subcategory: "Development" },
  { name: "Mentoring", category: "people_culture", subcategory: "Development" },
  { name: "Conflict Resolution", category: "people_culture", subcategory: "Development" },
  { name: "Performance Management", category: "people_culture", subcategory: "Talent" },
  { name: "Employee Engagement", category: "people_culture", subcategory: "Organization" },
  { name: "Change Management", category: "people_culture", subcategory: "Organization" },
  { name: "Coaching", category: "people_culture", subcategory: "Development" },

  // 10. Communication
  { name: "Public Speaking", category: "communication", subcategory: "Verbal" },
  { name: "Executive Presentations", category: "communication", subcategory: "Verbal" },
  { name: "Storytelling", category: "communication", subcategory: "Verbal" },
  { name: "Negotiation", category: "communication", subcategory: "Influence" },
  { name: "Business Writing", category: "communication", subcategory: "Written" },
  { name: "Technical Writing", category: "communication", subcategory: "Written" },
  { name: "Media Communication", category: "communication", subcategory: "Verbal" },
  { name: "Crisis Communication", category: "communication", subcategory: "Influence" },
  { name: "Influencing", category: "communication", subcategory: "Influence" },

  // 11. Consulting
  { name: "Management Consulting", category: "consulting", subcategory: "Advisory" },
  { name: "Technology Consulting", category: "consulting", subcategory: "Advisory" },
  { name: "Business Consulting", category: "consulting", subcategory: "Advisory" },
  { name: "Digital Transformation", category: "consulting", subcategory: "Transformation" },
  { name: "Business Process Reengineering", category: "consulting", subcategory: "Transformation" },
  { name: "Operating Model Design", category: "consulting", subcategory: "Transformation" },

  // 12. Governance & Risk
  { name: "Corporate Governance", category: "governance_risk", subcategory: "Governance" },
  { name: "Enterprise Risk Management", category: "governance_risk", subcategory: "Risk" },
  { name: "Compliance", category: "governance_risk", subcategory: "Compliance" },
  { name: "Audit", category: "governance_risk", subcategory: "Compliance" },
  { name: "Internal Controls", category: "governance_risk", subcategory: "Compliance" },
  { name: "Data Privacy", category: "governance_risk", subcategory: "Compliance" },
  { name: "ESG", category: "governance_risk", subcategory: "Governance" },

  // Certifications
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
// ROLE-BASED RECOMMENDATIONS
// ============================================================
export const ROLE_RECOMMENDATIONS = {
  cio: ["Budget Management", "Executive Communication", "AI Governance", "Enterprise Architecture", "Digital Transformation", "IT Governance", "Vendor Management"],
  cto: ["AI Strategy", "Cloud Strategy", "Enterprise Architecture", "Technology Consulting", "Product Strategy", "Platform Engineering", "Cybersecurity"],
  ceo: ["Corporate Strategy", "Executive Leadership", "Board Readiness", "Stakeholder Management", "Executive Presence", "Vision Setting", "Corporate Governance"],
  cfo: ["Financial Planning", "P&L Management", "Cost Optimization", "Enterprise Risk Management", "Contract Negotiation", "Investment Analysis", "Compliance"],
  coo: ["Operational Excellence", "Program Management", "Change Leadership", "Vendor Management", "Process Improvement", "Delivery Governance"],
  "operations director": ["Financial Planning", "Executive Communication", "Change Management", "Program Management", "Risk Management", "Service Operations"],
  "operations manager": ["Service Operations", "Incident Management", "Change Management", "Program Management", "Vendor Management"],
  director: ["Strategic Planning", "Stakeholder Management", "Executive Communication", "Program Management", "Change Management", "Executive Presence"],
  vp: ["Executive Leadership", "Strategic Planning", "Stakeholder Management", "Executive Presence", "Decision Making", "Board Communication"],
  founder: ["Business Strategy", "Product Strategy", "Growth Strategy", "Executive Leadership", "Revenue Growth", "Business Model Innovation"],
  "it manager": ["IT Service Management", "ITIL", "Incident Management", "Change Management", "Vendor Management", "ServiceNow"],
};

// ============================================================
// COMPANY-SPECIFIC COMPETENCIES
// ============================================================
export const COMPANY_RECOMMENDATIONS = {
  microsoft: ["Azure", "AI Strategy", "Product Leadership", "Cloud Computing", "Platform Strategy"],
  amazon: ["Operational Excellence", "Customer Obsession", "Ownership", "AWS", "Platform Engineering"],
  accenture: ["Management Consulting", "Business Transformation", "Executive Communication", "Process Improvement", "Digital Transformation"],
  google: ["Innovation Management", "Artificial Intelligence", "Product Strategy", "Google Cloud", "Data Strategy"],
  deloitte: ["Executive Advisory", "Corporate Strategy", "Enterprise Transformation", "Compliance", "Audit"],
};

export const POPULAR_COMPETENCIES = [
  "Executive Leadership", "Strategic Planning", "Executive Communication",
  "Change Management", "Decision Making", "Stakeholder Management",
  "Digital Transformation", "Artificial Intelligence", "Cloud Strategy",
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================
export function getCategoryById(id) {
  return COMPETENCY_CATEGORIES.find((c) => c.id === id);
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

// ============================================================
// GAP ANALYSIS
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

  return {
    targetRole: matchKey.toUpperCase(),
    missing: missing.map((n) => getCompetencyByName(n)).filter(Boolean),
    have: required.filter((n) => have.includes(n)).map((n) => getCompetencyByName(n)).filter(Boolean),
    readinessPct,
    totalRequired,
    haveCount,
  };
}
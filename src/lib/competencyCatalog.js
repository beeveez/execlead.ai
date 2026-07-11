import {
  Crown, TrendingUp, Brain, Cpu, Package, Server, CheckSquare,
  DollarSign, Users, MessageSquare, Briefcase, Award,
  FileText, Fingerprint, ClipboardCheck, Sparkles, User,
} from "lucide-react";

export const PROFICIENCY_LEVELS = [
  { id: "beginner", label: "Beginner", color: "#64748b", minYears: 0, description: "Learning the fundamentals" },
  { id: "intermediate", label: "Intermediate", color: "#0ea5e9", minYears: 3, description: "Applying independently" },
  { id: "advanced", label: "Advanced", color: "#6366f1", minYears: 6, description: "Proficient and guiding others" },
  { id: "expert", label: "Expert", color: "#f59e0b", minYears: 11, description: "Recognized authority" },
  { id: "executive", label: "Executive", color: "#8b5cf6", minYears: 15, description: "Strategic leader" },
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

export const COMPETENCY_CATEGORIES = [
  { id: "leadership", label: "Leadership", icon: Crown, color: "#6366f1", description: "Core executive leadership capabilities" },
  { id: "business_strategy", label: "Business Strategy", icon: TrendingUp, color: "#f59e0b", description: "Strategic thinking and business acumen" },
  { id: "ai", label: "Artificial Intelligence", icon: Brain, color: "#8b5cf6", description: "AI strategy, governance, and application" },
  { id: "technology", label: "Technology", icon: Cpu, color: "#06b6d4", description: "Technical architecture and infrastructure" },
  { id: "product", label: "Product", icon: Package, color: "#10b981", description: "Product strategy and execution" },
  { id: "it_leadership", label: "IT Leadership", icon: Server, color: "#3b82f6", description: "IT service management and operations" },
  { id: "project_delivery", label: "Project & Delivery", icon: CheckSquare, color: "#ec4899", description: "Delivery methodologies and frameworks" },
  { id: "commercial", label: "Commercial", icon: DollarSign, color: "#84cc16", description: "Financial and commercial leadership" },
  { id: "people", label: "People", icon: Users, color: "#f97316", description: "Talent and organizational development" },
  { id: "communication", label: "Communication", icon: MessageSquare, color: "#14b8a6", description: "Executive communication and influence" },
  { id: "consulting", label: "Consulting", icon: Briefcase, color: "#a855f7", description: "Advisory and consulting capabilities" },
  { id: "certifications", label: "Certifications", icon: Award, color: "#eab308", description: "Professional certifications and credentials" },
];

export const COMPETENCY_LIBRARY = [
  // Leadership
  { name: "Executive Leadership", category: "leadership" },
  { name: "Strategic Leadership", category: "leadership" },
  { name: "Transformational Leadership", category: "leadership" },
  { name: "Servant Leadership", category: "leadership" },
  { name: "Situational Leadership", category: "leadership" },
  { name: "Change Leadership", category: "leadership" },
  { name: "Executive Presence", category: "leadership" },
  { name: "Decision Making", category: "leadership" },
  { name: "Leadership Coaching", category: "leadership" },
  { name: "Organizational Leadership", category: "leadership" },
  { name: "Stakeholder Management", category: "leadership" },
  { name: "Executive Communication", category: "leadership" },
  { name: "Board Readiness", category: "leadership" },
  { name: "Ownership", category: "leadership" },

  // Business Strategy
  { name: "Business Strategy", category: "business_strategy" },
  { name: "Corporate Strategy", category: "business_strategy" },
  { name: "Strategic Planning", category: "business_strategy" },
  { name: "Business Transformation", category: "business_strategy" },
  { name: "Growth Strategy", category: "business_strategy" },
  { name: "Market Analysis", category: "business_strategy" },
  { name: "Competitive Intelligence", category: "business_strategy" },
  { name: "Product Strategy", category: "business_strategy" },
  { name: "Business Model Innovation", category: "business_strategy" },
  { name: "Portfolio Management", category: "business_strategy" },
  { name: "Digital Transformation", category: "business_strategy" },

  // Artificial Intelligence
  { name: "Artificial Intelligence", category: "ai" },
  { name: "Generative AI", category: "ai" },
  { name: "AI Governance", category: "ai" },
  { name: "AI Strategy", category: "ai" },
  { name: "Prompt Engineering", category: "ai" },
  { name: "Enterprise AI", category: "ai" },
  { name: "Machine Learning", category: "ai" },
  { name: "AI Product Management", category: "ai" },
  { name: "AI Ethics", category: "ai" },
  { name: "Automation", category: "ai" },

  // Technology
  { name: "Enterprise Architecture", category: "technology" },
  { name: "Solution Architecture", category: "technology" },
  { name: "SaaS Architecture", category: "technology" },
  { name: "Cloud Computing", category: "technology" },
  { name: "Azure", category: "technology" },
  { name: "AWS", category: "technology" },
  { name: "Google Cloud", category: "technology" },
  { name: "Cybersecurity", category: "technology" },
  { name: "Data Analytics", category: "technology" },
  { name: "API Strategy", category: "technology" },

  // Product
  { name: "Product Management", category: "product" },
  { name: "Product Roadmapping", category: "product" },
  { name: "Product Discovery", category: "product" },
  { name: "Product Design", category: "product" },
  { name: "UX Strategy", category: "product" },
  { name: "Innovation Management", category: "product" },
  { name: "Customer Obsession", category: "product" },
  { name: "Product Leadership", category: "product" },

  // IT Leadership
  { name: "IT Service Management", category: "it_leadership" },
  { name: "IT Operations", category: "it_leadership" },
  { name: "IT Governance", category: "it_leadership" },
  { name: "Digital Workplace", category: "it_leadership" },
  { name: "ServiceNow", category: "it_leadership" },
  { name: "ITIL", category: "it_leadership" },
  { name: "Incident Management", category: "it_leadership" },
  { name: "Problem Management", category: "it_leadership" },
  { name: "Change Management", category: "it_leadership" },
  { name: "Release Management", category: "it_leadership" },
  { name: "Disaster Recovery", category: "it_leadership" },

  // Project & Delivery
  { name: "Agile", category: "project_delivery" },
  { name: "Scrum", category: "project_delivery" },
  { name: "Lean", category: "project_delivery" },
  { name: "Lean Six Sigma", category: "project_delivery" },
  { name: "Program Management", category: "project_delivery" },
  { name: "Portfolio Management", category: "project_delivery" },
  { name: "PMO", category: "project_delivery" },
  { name: "Risk Management", category: "project_delivery" },
  { name: "Vendor Management", category: "project_delivery" },

  // Commercial
  { name: "Financial Planning", category: "commercial" },
  { name: "Budget Management", category: "commercial" },
  { name: "P&L Management", category: "commercial" },
  { name: "Cost Optimization", category: "commercial" },
  { name: "Revenue Growth", category: "commercial" },
  { name: "Commercial Strategy", category: "commercial" },
  { name: "Sales Leadership", category: "commercial" },
  { name: "Pricing Strategy", category: "commercial" },
  { name: "Procurement", category: "commercial" },
  { name: "Contract Negotiation", category: "commercial" },
  { name: "Operational Excellence", category: "commercial" },

  // People
  { name: "Talent Management", category: "people" },
  { name: "Succession Planning", category: "people" },
  { name: "Organizational Development", category: "people" },
  { name: "Coaching", category: "people" },
  { name: "Mentoring", category: "people" },
  { name: "Employee Engagement", category: "people" },
  { name: "Performance Management", category: "people" },
  { name: "Conflict Resolution", category: "people" },

  // Communication
  { name: "Public Speaking", category: "communication" },
  { name: "Executive Presentations", category: "communication" },
  { name: "Storytelling", category: "communication" },
  { name: "Negotiation", category: "communication" },
  { name: "Influencing", category: "communication" },
  { name: "Crisis Communication", category: "communication" },
  { name: "Technical Writing", category: "communication" },
  { name: "Business Writing", category: "communication" },

  // Consulting
  { name: "Management Consulting", category: "consulting" },
  { name: "Business Consulting", category: "consulting" },
  { name: "Technology Consulting", category: "consulting" },
  { name: "Enterprise Consulting", category: "consulting" },
  { name: "Process Improvement", category: "consulting" },
  { name: "Business Process Reengineering", category: "consulting" },

  // Certifications
  { name: "PMP", category: "certifications" },
  { name: "PRINCE2", category: "certifications" },
  { name: "Scrum Master", category: "certifications" },
  { name: "CISSP", category: "certifications" },
  { name: "CISM", category: "certifications" },
  { name: "CISA", category: "certifications" },
  { name: "Azure Certifications", category: "certifications" },
  { name: "AWS Certifications", category: "certifications" },
  { name: "Google Cloud Certifications", category: "certifications" },
  { name: "ServiceNow CSA", category: "certifications" },
  { name: "TOGAF", category: "certifications" },
];

export const ROLE_RECOMMENDATIONS = {
  cio: ["Budget Management", "Executive Communication", "AI Governance", "Enterprise Architecture", "Digital Transformation"],
  cto: ["AI Strategy", "Cloud Computing", "Enterprise Architecture", "Technology Consulting", "Product Strategy"],
  ceo: ["Corporate Strategy", "Executive Leadership", "Board Readiness", "Stakeholder Management", "Executive Presence"],
  cfo: ["Financial Planning", "P&L Management", "Cost Optimization", "Risk Management", "Contract Negotiation"],
  coo: ["Operational Excellence", "Program Management", "Change Leadership", "Vendor Management", "Process Improvement"],
  "operations director": ["Financial Planning", "Executive Communication", "Change Leadership", "Program Management", "Risk Management"],
  director: ["Strategic Planning", "Stakeholder Management", "Executive Communication", "Program Management", "Change Management"],
  vp: ["Executive Leadership", "Strategic Planning", "Stakeholder Management", "Executive Presence", "Decision Making"],
  founder: ["Business Strategy", "Product Strategy", "Growth Strategy", "Executive Leadership", "Revenue Growth"],
};

export const COMPANY_RECOMMENDATIONS = {
  microsoft: ["Azure", "AI Strategy", "Product Leadership", "Cloud Computing"],
  amazon: ["Operational Excellence", "Customer Obsession", "Ownership", "AWS"],
  accenture: ["Management Consulting", "Business Transformation", "Executive Communication", "Process Improvement"],
  google: ["Innovation Management", "Artificial Intelligence", "Product Strategy", "Google Cloud"],
};

export const POPULAR_COMPETENCIES = [
  "Executive Leadership", "Strategic Planning", "Executive Communication",
  "Change Leadership", "Decision Making", "Stakeholder Management",
  "Digital Transformation", "Artificial Intelligence",
];

export function getCategoryById(id) {
  return COMPETENCY_CATEGORIES.find((c) => c.id === id);
}

export function getProficiencyById(id) {
  return PROFICIENCY_LEVELS.find((p) => p.id === id);
}

export function getCompetencyByName(name) {
  return COMPETENCY_LIBRARY.find((c) => c.name === name);
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
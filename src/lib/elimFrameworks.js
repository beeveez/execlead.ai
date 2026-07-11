import {
  Fingerprint, Dna, Target, Star, TrendingUp, Brain, Cpu,
  Users, Crown, Shield, Award, BookOpen, Scale, FlaskConical,
} from "lucide-react";

// ============================================================
// ELIM™ — EXECLEAD LEADERSHIP INTELLIGENCE MODEL
// Version 1.0 — The Executive Operating Model for AI Leadership Development
// ============================================================
export const ELIM_VERSION = "1.0";

// ============================================================
// FIVE INTERCONNECTED FRAMEWORKS
// ============================================================
export const ELIM_FRAMEWORKS = [
  {
    id: "eecf",
    name: "EXECLEAD Executive Competency Framework™",
    shortName: "EECF™",
    version: "1.0",
    status: "active",
    description: "Defines what executives must know and demonstrate.",
    domain: "Competency",
    color: "#6366f1",
    icon: Fingerprint,
    components: ["6 Executive Capability Domains", "140+ Competencies", "8-Level Maturity Model", "Industry Mapping", "Role Mapping", "Company Mapping"],
    powers: ["Leadership DNA™", "Executive Readiness™", "Executive Journey™", "Career Studio™", "Resume AI™", "EXEC™"],
  },
  {
    id: "leadership_dna",
    name: "Leadership DNA™",
    shortName: "Leadership DNA™",
    version: "2.0",
    status: "active",
    description: "How executives naturally think, communicate, decide, influence, and lead.",
    domain: "Behavioral",
    color: "#8b5cf6",
    icon: Dna,
    components: ["Leadership Style", "Decision Style", "Communication Style", "Learning Style", "Risk Appetite", "Influence Style", "Conflict Style", "Coaching Style", "Executive Presence", "Emotional Intelligence", "Adaptability"],
    powers: ["Executive Coach™", "Executive Council™", "Executive Simulator™", "EXEC™"],
  },
  {
    id: "eri",
    name: "Executive Readiness Index™",
    shortName: "ERI™",
    version: "1.2",
    status: "active",
    description: "How prepared an executive is for the next leadership role.",
    domain: "Readiness",
    color: "#f59e0b",
    icon: Target,
    components: ["Competencies", "Experience", "Evidence", "Executive Behaviors", "Industry Alignment", "Target Role", "Target Company", "Target Level", "Leadership Growth", "Simulation Performance", "Confidence", "Forecast"],
    powers: ["Promotion Forecast™", "Career Studio™", "Enterprise Intelligence™", "EXEC™"],
  },
  {
    id: "erf",
    name: "Executive Reputation Framework™",
    shortName: "ERF™",
    version: "1.1",
    status: "active",
    description: "How the executive is perceived, trusted, and recognized.",
    domain: "Reputation",
    color: "#ec4899",
    icon: Star,
    components: ["Community Trust", "Professional Trust", "Verified Identity", "Knowledge Sharing", "Mentorship", "Executive Letters", "Community Recognition", "Peer Endorsements", "Professional Conduct", "Leadership Influence"],
    powers: ["Executive Rankings™", "Executive Passport™", "Marketplace™", "EXEC™"],
  },
  {
    id: "ejf",
    name: "Executive Journey Framework™",
    shortName: "EJF™",
    version: "1.0",
    status: "active",
    description: "How leadership capability evolves over time.",
    domain: "Journey",
    color: "#10b981",
    icon: TrendingUp,
    components: ["Journey Points", "Milestones", "Achievements", "Growth Trends", "Learning Velocity", "Consistency", "Leadership Development", "Career Progress"],
    powers: ["Executive Intelligence Profile™", "Enterprise Intelligence™", "EXEC™"],
  },
];

// ============================================================
// EVIDENCE ENGINE — Sources & Quality Weights
// ============================================================
export const EVIDENCE_SOURCES = [
  { id: "resume", label: "Resume", weight: 0.6, category: "self_reported" },
  { id: "experience", label: "Professional Experience", weight: 0.8, category: "verified" },
  { id: "certifications", label: "Certifications", weight: 0.9, category: "verified" },
  { id: "leadership_dna", label: "Leadership DNA™", weight: 0.85, category: "assessment" },
  { id: "executive_coach", label: "Executive Coach™", weight: 0.7, category: "behavioral" },
  { id: "executive_simulator", label: "Executive Simulator™", weight: 0.9, category: "performance" },
  { id: "executive_council", label: "Executive Council™", weight: 0.75, category: "behavioral" },
  { id: "academy", label: "Academy™", weight: 0.7, category: "learning" },
  { id: "challenges", label: "Executive Challenges™", weight: 0.65, category: "performance" },
  { id: "letters", label: "Executive Letters™", weight: 0.75, category: "contribution" },
  { id: "reputation", label: "Executive Reputation™", weight: 0.8, category: "community" },
  { id: "journey", label: "Executive Journey™", weight: 0.6, category: "activity" },
  { id: "identity_verification", label: "Identity Verification", weight: 1.0, category: "trust" },
  { id: "professional_verification", label: "Professional Verification", weight: 0.95, category: "trust" },
  { id: "enterprise_verification", label: "Enterprise Verification", weight: 1.0, category: "trust" },
  { id: "mentorship", label: "Mentorship", weight: 0.7, category: "contribution" },
  { id: "community", label: "Community Contributions", weight: 0.6, category: "community" },
  { id: "learning_progress", label: "Learning Progress", weight: 0.65, category: "learning" },
  { id: "marketplace", label: "Marketplace Activities", weight: 0.6, category: "contribution" },
  { id: "behavioral", label: "Behavioral Signals", weight: 0.7, category: "behavioral" },
  { id: "ai_conversation", label: "AI Conversation Analysis", weight: 0.65, category: "behavioral" },
];

export const EVIDENCE_CATEGORIES = [
  { id: "self_reported", label: "Self-Reported", color: "#94a3b8", confidenceCap: 40 },
  { id: "verified", label: "Verified", color: "#3b82f6", confidenceCap: 80 },
  { id: "assessment", label: "Assessment-Based", color: "#8b5cf6", confidenceCap: 85 },
  { id: "performance", label: "Performance-Based", color: "#10b981", confidenceCap: 90 },
  { id: "behavioral", label: "Behavioral", color: "#f59e0b", confidenceCap: 75 },
  { id: "learning", label: "Learning", color: "#06b6d4", confidenceCap: 70 },
  { id: "contribution", label: "Contribution", color: "#ec4899", confidenceCap: 75 },
  { id: "community", label: "Community", color: "#f97316", confidenceCap: 70 },
  { id: "activity", label: "Activity", color: "#64748b", confidenceCap: 60 },
  { id: "trust", label: "Trust", color: "#22c55e", confidenceCap: 100 },
];

// ============================================================
// 14 EXECUTIVE INTELLIGENCE SCORES
// ============================================================
export const INTELLIGENCE_SCORES = [
  { id: "competency", label: "Competency Score", framework: "eecf", category: "Core", description: "Overall executive competency across all domains" },
  { id: "leadership", label: "Leadership Score", framework: "eecf", category: "Core", description: "Leadership capability across self-mastery and people leadership" },
  { id: "strategic_thinking", label: "Strategic Thinking Score", framework: "eecf", category: "Cognitive", description: "Strategic and analytical thinking capability" },
  { id: "business_acumen", label: "Business Acumen Score", framework: "eecf", category: "Cognitive", description: "Commercial and financial leadership" },
  { id: "technology_leadership", label: "Technology Leadership Score", framework: "eecf", category: "Domain", description: "Technology-enabled leadership capability" },
  { id: "executive_presence", label: "Executive Presence Score", framework: "eecf", category: "Behavioral", description: "Presence, gravitas, and professional authority" },
  { id: "people_leadership", label: "People Leadership Score", framework: "eecf", category: "Core", description: "Team development and people leadership" },
  { id: "communication", label: "Communication Score", framework: "eecf", category: "Behavioral", description: "Executive communication effectiveness" },
  { id: "innovation", label: "Innovation Score", framework: "eecf", category: "Cognitive", description: "Innovation and growth mindset" },
  { id: "influence", label: "Influence Score", framework: "eecf", category: "Behavioral", description: "Executive influence and persuasion" },
  { id: "reputation", label: "Reputation Score", framework: "erf", category: "External", description: "Professional reputation and community recognition" },
  { id: "readiness", label: "Readiness Score", framework: "eri", category: "Predictive", description: "Readiness for next leadership role" },
  { id: "legacy", label: "Legacy Score", framework: "eecf", category: "Core", description: "Long-term executive impact and thought leadership" },
  { id: "trust", label: "Trust Score", framework: "erf", category: "External", description: "Verified identity and professional trust" },
];

// ============================================================
// KNOWLEDGE PACK ENGINE
// ============================================================
export const KNOWLEDGE_PACKS = [
  {
    id: "kp_eecf",
    framework_id: "eecf",
    name: "EECF™ Knowledge Pack",
    version: "1.0",
    status: "active",
    description: "Complete competency framework with 6 domains, 140+ competencies, and 8-level maturity model.",
    contents: ["Methodology", "Competencies", "Evidence Rules", "Scoring Rules", "Learning", "Recommendations", "Role Mapping", "Industry Mapping", "Simulation Mapping"],
  },
  {
    id: "kp_leadership_dna",
    framework_id: "leadership_dna",
    name: "Leadership DNA™ Knowledge Pack",
    version: "2.0",
    status: "active",
    description: "Behavioral leadership assessment measuring 11 leadership style dimensions.",
    contents: ["Methodology", "Behavioral Dimensions", "Assessment Rules", "Scoring Rules", "Growth Tracking", "Recommendations"],
  },
  {
    id: "kp_eri",
    framework_id: "eri",
    name: "Executive Readiness Index™ Knowledge Pack",
    version: "1.2",
    status: "active",
    description: "Readiness calculation engine evaluating 12 readiness factors with forecasting.",
    contents: ["Methodology", "Readiness Factors", "Evidence Rules", "Scoring Rules", "Forecast Model", "Role Alignment", "Recommendations"],
  },
  {
    id: "kp_erf",
    framework_id: "erf",
    name: "Executive Reputation Framework™ Knowledge Pack",
    version: "1.1",
    status: "active",
    description: "Reputation scoring across 10 reputation dimensions with anti-gaming protection.",
    contents: ["Methodology", "Reputation Dimensions", "Evidence Rules", "Scoring Rules", "Anti-Gaming", "Tier Progression", "Recommendations"],
  },
  {
    id: "kp_ejf",
    framework_id: "ejf",
    name: "Executive Journey Framework™ Knowledge Pack",
    version: "1.0",
    status: "active",
    description: "Journey progression system with 8 levels, points, milestones, and streaks.",
    contents: ["Methodology", "Journey Levels", "Points System", "Milestones", "Achievements", "Streaks", "Recommendations"],
  },
  {
    id: "kp_platform",
    framework_id: "ejf",
    name: "Platform Operations Knowledge Pack",
    version: "1.0",
    status: "active",
    description: "Platform-level operations knowledge covering module navigation, diagnostics, platform state, billing, and organizational administration.",
    contents: ["Module Registry", "Route Registry", "Platform State", "Diagnostics", "Billing", "Organization Management", "Navigation", "System Events"],
  },
];

// ============================================================
// RESEARCH FOUNDATION
// ============================================================
export const RESEARCH_FOUNDATION = [
  { id: "leadership_theory", label: "Leadership Theory", description: "Transformational, transactional, servant, and situational leadership models", frameworks: ["eecf", "leadership_dna"] },
  { id: "competency_modeling", label: "Competency Modeling", description: "Behavioral competency frameworks and proficiency modeling", frameworks: ["eecf"] },
  { id: "organizational_psychology", label: "Organizational Psychology", description: "Motivation, engagement, and organizational behavior science", frameworks: ["eecf", "ejf"] },
  { id: "executive_coaching", label: "Executive Coaching", description: "Evidence-based coaching methodologies and developmental frameworks", frameworks: ["leadership_dna", "eri"] },
  { id: "adult_learning", label: "Adult Learning Theory", description: "Andragogy, experiential learning, and learning transfer", frameworks: ["ejf", "eecf"] },
  { id: "behavioral_science", label: "Behavioral Science", description: "Behavioral economics, decision science, and habit formation", frameworks: ["leadership_dna"] },
  { id: "decision_science", label: "Decision Science", description: "Decision-making frameworks, cognitive biases, and risk assessment", frameworks: ["leadership_dna", "eri"] },
  { id: "strategic_management", label: "Strategic Management", description: "Strategy formulation, competitive analysis, and business model innovation", frameworks: ["eecf", "eri"] },
];

// ============================================================
// AI PLATFORM INTEGRATION — Modules that consume ELIM™
// ============================================================
export const ELIM_CONSUMERS = [
  "Executive Coach™", "Leadership DNA™", "Executive Journey™", "Executive Reputation™",
  "Executive Passport™", "Career Studio™", "Resume AI™", "Executive Simulator™",
  "Executive Council™", "Company Intelligence™", "Executive Rankings™", "Marketplace™",
  "Promotion Forecast™", "EXEC™",
];

// ============================================================
// HELPERS
// ============================================================
export function getFrameworkById(id) {
  return ELIM_FRAMEWORKS.find((f) => f.id === id);
}

export function getEvidenceSourceById(id) {
  return EVIDENCE_SOURCES.find((s) => s.id === id);
}

export function getScoreDefinitionById(id) {
  return INTELLIGENCE_SCORES.find((s) => s.id === id);
}

export function getKnowledgePacksByFramework(frameworkId) {
  return KNOWLEDGE_PACKS.filter((p) => p.framework_id === frameworkId);
}

export function getEvidenceByCategory(categoryId) {
  return EVIDENCE_SOURCES.filter((s) => s.category === categoryId);
}
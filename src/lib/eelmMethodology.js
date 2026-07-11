/**
 * EELM™ — EXECLEAD EXECUTIVE LEADERSHIP METHODOLOGY™
 * Version 1.0
 * ---------------------------------------------------
 * The formal leadership development methodology that defines how
 * EXECLEAD.AI evaluates, develops, validates, measures, predicts,
 * and continuously improves executive leadership capability.
 *
 * This methodology GOVERNS the ELIM™ (Executive Leadership Intelligence
 * Model) intelligence architecture. Every AI recommendation, assessment,
 * simulation, competency evaluation, and executive insight must align
 * with EELM™.
 */
import {
  Eye, GraduationCap, BadgeCheck, BarChart3, TrendingUp,
  Dna, Fingerprint, Target, Star, Brain, BookOpen, ScrollText,
  Users, Sparkles, Activity, Building2, ShieldCheck, Lightbulb,
  CheckCircle2, Repeat, Layers, Cpu,
} from "lucide-react";

export const EELM_VERSION = "1.0";
export const EELM_NAME = "EXECLEAD Executive Leadership Methodology™";
export const EELM_SHORT_NAME = "EELM™";
export const EELM_TAGLINE = "The Scientific Methodology Behind the Executive Leadership Operating System";

export const EELM_CORE_BELIEF = {
  statement: "Leadership is not determined by job title. Leadership is a measurable, developable, and continuously evolving capability.",
  elaboration: "Every executive follows a unique journey. Artificial Intelligence should accelerate that journey through structured evidence, personalized coaching, continuous assessment, and measurable growth.",
};

export const EELM_PRINCIPLES = [
  {
    id: "assess",
    name: "Assess",
    number: 1,
    icon: Eye,
    color: "#6366f1",
    summary: "Understand the executive.",
    objectives: ["Measure current capability", "Collect evidence", "Establish baseline"],
  },
  {
    id: "develop",
    name: "Develop",
    number: 2,
    icon: GraduationCap,
    color: "#8b5cf6",
    summary: "Deliver personalized learning.",
    objectives: ["Recommend simulations", "Recommend coaching", "Recommend practice", "Strengthen weaknesses", "Expand strengths"],
  },
  {
    id: "validate",
    name: "Validate",
    number: 3,
    icon: BadgeCheck,
    color: "#f59e0b",
    summary: "Do not rely on self-declaration.",
    objectives: ["Experience", "Evidence", "Behavior", "Performance", "Assessment", "Simulation", "Community Contribution", "Professional Verification", "Enterprise Verification"],
  },
  {
    id: "measure",
    name: "Measure",
    number: 4,
    icon: BarChart3,
    color: "#10b981",
    summary: "Continuously calculate.",
    objectives: ["Executive Readiness™", "Leadership DNA™", "Executive Reputation™", "Executive Journey™", "Executive Trust™", "Competency Growth", "Career Progression", "Executive Intelligence™"],
  },
  {
    id: "evolve",
    name: "Evolve",
    number: 5,
    icon: TrendingUp,
    color: "#ec4899",
    summary: "Leadership never ends.",
    objectives: ["Every interaction", "Every lesson", "Every simulation", "Every mentoring session", "Every leadership letter", "Every career achievement"],
    closing: "updates the Executive Intelligence Profile™",
  },
];

export const EELM_INTELLIGENCE_LOOP = [
  { id: "observe", label: "Observe", icon: Eye, color: "#6366f1" },
  { id: "assess", label: "Assess", icon: Activity, color: "#8b5cf6" },
  { id: "coach", label: "Coach", icon: GraduationCap, color: "#a855f7" },
  { id: "practice", label: "Practice", icon: BookOpen, color: "#d946ef" },
  { id: "validate", label: "Validate", icon: BadgeCheck, color: "#f59e0b" },
  { id: "measure", label: "Measure", icon: BarChart3, color: "#10b981" },
  { id: "improve", label: "Improve", icon: TrendingUp, color: "#06b6d4" },
  { id: "repeat", label: "Repeat", icon: Repeat, color: "#ec4899" },
];

export const EELM_FRAMEWORKS = [
  {
    id: "leadership_dna",
    question: "WHO",
    questionLabel: "WHO the executive naturally is",
    name: "Leadership DNA™",
    icon: Dna,
    color: "#8b5cf6",
    measures: ["Leadership Style", "Communication Style", "Decision Style", "Learning Style", "Influence Style", "Risk Style", "Executive Presence"],
  },
  {
    id: "eecf",
    question: "WHAT",
    questionLabel: "WHAT the executive knows and demonstrates",
    name: "Executive Competency Framework™",
    icon: Fingerprint,
    color: "#6366f1",
    measures: ["Leadership", "Business", "Technology", "People", "Finance", "Governance", "Innovation"],
  },
  {
    id: "eri",
    question: "HOW READY",
    questionLabel: "HOW READY the executive is",
    name: "Executive Readiness Index™",
    icon: Target,
    color: "#f59e0b",
    measures: ["Target Role Readiness", "Promotion Readiness", "Board Readiness", "Career Readiness"],
  },
  {
    id: "erf",
    question: "HOW TRUSTED",
    questionLabel: "HOW TRUSTED the executive is",
    name: "Executive Reputation Framework™",
    icon: Star,
    color: "#ec4899",
    measures: ["Credibility", "Influence", "Community", "Professional Conduct", "Executive Trust™", "Thought Leadership"],
  },
  {
    id: "ejf",
    question: "HOW",
    questionLabel: "HOW the executive grows",
    name: "Executive Journey Framework™",
    icon: TrendingUp,
    color: "#10b981",
    measures: ["Journey Points", "Milestones", "Learning", "Experience", "Achievements", "Growth Velocity"],
  },
];

export const EELM_EVIDENCE_SOURCES = [
  { id: "resume", label: "Resume", category: "Self-Reported" },
  { id: "career_history", label: "Career History", category: "Self-Reported" },
  { id: "leadership_dna", label: "Leadership DNA™", category: "Assessment" },
  { id: "executive_coach", label: "Executive Coach™", category: "Behavioral" },
  { id: "executive_simulator", label: "Executive Simulator™", category: "Performance" },
  { id: "executive_council", label: "Executive Council™", category: "Behavioral" },
  { id: "executive_academy", label: "Executive Academy™", category: "Learning" },
  { id: "executive_challenges", label: "Executive Challenges™", category: "Performance" },
  { id: "leadership_letters", label: "Leadership Letters™", category: "Contribution" },
  { id: "executive_reputation", label: "Executive Reputation™", category: "Community" },
  { id: "executive_journey", label: "Executive Journey™", category: "Activity" },
  { id: "executive_competencies", label: "Executive Competencies™", category: "Assessment" },
  { id: "identity_verification", label: "Identity Verification", category: "Trust" },
  { id: "professional_verification", label: "Professional Verification", category: "Trust" },
  { id: "enterprise_validation", label: "Enterprise Validation", category: "Trust" },
  { id: "mentorship", label: "Mentorship", category: "Contribution" },
  { id: "community_activity", label: "Community Activity", category: "Community" },
  { id: "learning_progress", label: "Learning Progress", category: "Learning" },
  { id: "behavioral_signals", label: "Behavioral Signals", category: "Behavioral" },
  { id: "ai_conversation", label: "AI Conversation Analysis", category: "Behavioral" },
];

export const EELM_DECISION_CHAIN = [
  { id: "evidence", label: "Evidence", icon: Eye, color: "#6366f1" },
  { id: "leadership_intelligence", label: "Leadership Intelligence", icon: Brain, color: "#8b5cf6" },
  { id: "framework_rules", label: "Framework Rules", icon: ScrollText, color: "#a855f7" },
  { id: "knowledge_pack", label: "Knowledge Pack", icon: BookOpen, color: "#d946ef" },
  { id: "executive_context", label: "Executive Context", icon: Users, color: "#ec4899" },
  { id: "personalized_recommendation", label: "Personalized Recommendation", icon: Sparkles, color: "#f59e0b" },
];

export const EELM_MATURITY_STAGES = [
  { id: "seed", label: "Seed", level: 1, color: "#64748b" },
  { id: "emerging_leader", label: "Emerging Leader", level: 2, color: "#3b82f6" },
  { id: "people_manager", label: "People Manager", level: 3, color: "#06b6d4" },
  { id: "senior_leader", label: "Senior Leader", level: 4, color: "#10b981" },
  { id: "executive", label: "Executive", level: 5, color: "#f59e0b" },
  { id: "enterprise_leader", label: "Enterprise Leader", level: 6, color: "#8b5cf6" },
  { id: "board_ready", label: "Board Ready", level: 7, color: "#ec4899" },
  { id: "legacy_leader", label: "Legacy Leader", level: 8, color: "#fbbf24" },
];

export const EELM_KNOWLEDGE_PACK_REQUIREMENTS = [
  "Supported Framework", "Competencies", "Evidence Sources", "Learning Outcomes",
  "Scoring Rules", "Recommendations", "Version", "Research References",
];

export const EELM_GOVERNANCE_ITEMS = [
  "Framework versions", "Competency taxonomy", "Evidence rules", "Scoring methodology",
  "Knowledge Packs", "Research references", "Industry mappings", "Role mappings",
  "AI recommendation rules",
];

export const EELM_ENTERPRISE_APPLICATIONS = [
  "Assess leaders", "Develop succession pipelines", "Identify competency gaps",
  "Benchmark departments", "Support leadership reviews", "Measure leadership ROI",
  "Guide executive coaching", "Support internal mobility",
];

export const EELM_RESEARCH_DOMAINS = [
  "Leadership competency modeling", "Executive coaching", "Organizational psychology",
  "Adult learning", "Behavioral science", "Strategic management",
  "Decision science", "Change leadership", "Human performance",
];

export const EELM_TRANSPARENCY_ITEMS = [
  "Why a score changed", "Why a recommendation exists", "Which evidence contributed",
  "Confidence level", "Missing evidence", "How users can improve",
];

export const EELM_SUCCESS_CRITERIA = [
  "Every AI module uses the same methodology.",
  "Leadership DNA™, Executive Competencies™, Executive Readiness™, Executive Reputation™, Executive Journey™, and Executive Trust™ operate as one integrated system.",
  "Enterprise customers can understand and review the methodology.",
  "Methodology versions are documented.",
  "AI recommendations are evidence-based and explainable.",
  "The methodology becomes a core differentiator of EXECLEAD.AI.",
];

export const EELM_PHILOSOPHY = {
  statement: "EXECLEAD.AI is not simply an AI application. It is an Executive Leadership Operating System built upon a transparent, evidence-informed, continuously evolving leadership methodology.",
  principles: [
    "Technology enables the experience.",
    "Methodology creates the value.",
    "One Leadership Journey.",
    "One AI Platform.",
    "One Executive Leadership Methodology™.",
  ],
  closing: ["Build leaders.", "Measure growth.", "Earn trust.", "Create legacy."],
};

export const EELM_DISCLAIMER = "EELM™ is an original EXECLEAD.AI framework informed by established leadership and organizational research. It does not claim endorsement or certification unless one actually exists.";

export const EELM_SECTIONS = [
  { id: "belief", label: "Core Belief", icon: Lightbulb },
  { id: "principles", label: "Five Principles", icon: Layers },
  { id: "loop", label: "Intelligence Loop", icon: Repeat },
  { id: "frameworks", label: "Core Frameworks", icon: Fingerprint },
  { id: "evidence", label: "Evidence Model", icon: Eye },
  { id: "decision", label: "AI Decision Model", icon: Cpu },
  { id: "maturity", label: "Maturity Model", icon: TrendingUp },
  { id: "enterprise", label: "Enterprise", icon: Building2 },
  { id: "governance", label: "Governance", icon: ShieldCheck },
  { id: "research", label: "Research", icon: BookOpen },
  { id: "transparency", label: "Transparency", icon: BadgeCheck },
  { id: "philosophy", label: "Philosophy", icon: Sparkles },
];
/**
 * EXEC™ Module Persona Overrides
 * =================================
 * Specialized personas activated by URL path, overlaying the
 * base workspace persona when the user is on specific module pages.
 *
 * Priority: Active Workspace > Current Module
 * The base workspace persona is ALWAYS determined by activeWorkspace.
 * Module overrides only specialize quick actions, tasks, questions,
 * and promptContext for the specific page the user is viewing.
 */
import {
  Database, GitBranch, ShieldCheck, MessageCircle, ClipboardCheck,
  KeyRound, Code2, Activity, AlertTriangle, Rocket,
  Award, Star, TrendingUp, Target, Fingerprint, BookOpen, Map, Trophy,
} from "lucide-react";

export const MODULE_PERSONA_OVERRIDES = [
  // ── DATABASE EXPLORER ──
  {
    id: "database_expert",
    match: (pathname) => pathname.startsWith("/developer/database"),
    subtitle: "AI Database Expert",
    tagline: "Database",
    color: "#3b82f6",
    expertise: ["Database Schema", "Queries", "Migrations", "Data Integrity"],
    quickActions: [
      { label: "Schema Overview", message: "Give me a database schema overview.", icon: Database },
      { label: "Recent Migrations", message: "What are the recent migrations?", icon: GitBranch },
      { label: "Data Integrity", message: "Are there any data integrity issues?", icon: ShieldCheck },
      { label: "Ask Anything", message: "", icon: MessageCircle, focusOnly: true },
    ],
    tasks: [
      { label: "Database Explorer", path: "/developer/database", icon: Database },
      { label: "Migrations", path: "/developer/migrations", icon: GitBranch },
      { label: "Audit Logs", path: "/developer/audit-logs", icon: ClipboardCheck },
    ],
    suggestedQuestions: [
      "What's the current database schema?",
      "Are there any pending migrations?",
      "How do I query for specific entities?",
      "What's the data integrity status?",
    ],
    promptContext: `You are operating in **Database Explorer** context within the Developer Workspace. Your persona is **Database Expert**. Focus on database schema, queries, migrations, and data integrity. Help the user navigate the database structure, understand entity relationships, and troubleshoot data issues.`,
  },

  // ── API MANAGEMENT ──
  {
    id: "api_architect",
    match: (pathname) => pathname.startsWith("/developer/api-keys"),
    subtitle: "AI API Architect",
    tagline: "API",
    color: "#8b5cf6",
    expertise: ["API Keys", "Endpoints", "Authentication", "Rate Limits"],
    quickActions: [
      { label: "API Overview", message: "Give me an API management overview.", icon: KeyRound },
      { label: "Endpoints", message: "What API endpoints are available?", icon: Code2 },
      { label: "Rate Limits", message: "What are the API rate limits?", icon: Activity },
      { label: "Ask Anything", message: "", icon: MessageCircle, focusOnly: true },
    ],
    tasks: [
      { label: "API Keys", path: "/developer/api-keys", icon: KeyRound },
      { label: "Audit Logs", path: "/developer/audit-logs", icon: ClipboardCheck },
      { label: "System Health", path: "/developer/system-health", icon: Activity },
    ],
    suggestedQuestions: [
      "How do I create a new API key?",
      "What are the available API endpoints?",
      "What are the rate limits?",
      "How is API authentication handled?",
    ],
    promptContext: `You are operating in **API Management** context within the Developer Workspace. Your persona is **API Architect**. Focus on API keys, endpoints, authentication, and rate limits. Help the user manage API access and understand the platform's API architecture.`,
  },

  // ── GUARDIAN™ ──
  {
    id: "guardian_advisor",
    match: (pathname) => pathname.startsWith("/guardian"),
    subtitle: "AI Security & Quality Advisor",
    tagline: "Guardian™",
    color: "#ef4444",
    expertise: ["Consistency Checks", "Data Integrity", "Security Audits", "Quality Gates"],
    quickActions: [
      { label: "Guardian Status", message: "What is the Guardian™ consistency engine status?", icon: ShieldCheck },
      { label: "Recent Findings", message: "Show me recent Guardian™ findings.", icon: AlertTriangle },
      { label: "Run Checks", message: "How do I run Guardian™ consistency checks?", icon: Activity },
      { label: "Ask Anything", message: "", icon: MessageCircle, focusOnly: true },
    ],
    tasks: [
      { label: "Guardian™", path: "/guardian", icon: ShieldCheck },
      { label: "Audit Logs", path: "/developer/audit-logs", icon: ClipboardCheck },
      { label: "System Health", path: "/developer/system-health", icon: Activity },
    ],
    suggestedQuestions: [
      "What is the Guardian™ consistency engine?",
      "Are there any recent findings or alerts?",
      "How do I run consistency checks?",
      "What does the Guardian™ monitor?",
    ],
    promptContext: `You are operating in **Guardian™** context within the Developer Workspace. Your persona is **Security & Quality Advisor**. Focus on consistency checks, data integrity, security audits, and quality gates. The Guardian™ engine monitors platform consistency, detects anomalies, and enforces data quality rules. Help the user understand findings and remediate issues.`,
  },

  // ── DEPLOYMENT CENTER ──
  {
    id: "release_engineer",
    match: (pathname) => pathname.startsWith("/developer/deployments"),
    subtitle: "AI Release Engineer",
    tagline: "Deployments",
    color: "#f97316",
    expertise: ["Deployments", "Releases", "Rollbacks", "CI/CD"],
    quickActions: [
      { label: "Deployment Status", message: "What's the current deployment status?", icon: Rocket },
      { label: "Recent Releases", message: "Show me recent release history.", icon: GitBranch },
      { label: "Rollback", message: "How do I rollback a deployment?", icon: Activity },
      { label: "Ask Anything", message: "", icon: MessageCircle, focusOnly: true },
    ],
    tasks: [
      { label: "Deployments", path: "/developer/deployments", icon: Rocket },
      { label: "Migrations", path: "/developer/migrations", icon: GitBranch },
      { label: "System Health", path: "/developer/system-health", icon: Activity },
    ],
    suggestedQuestions: [
      "What's the current deployment status?",
      "What was the most recent release?",
      "How do I rollback a deployment?",
      "Are there any deployment failures?",
    ],
    promptContext: `You are operating in **Deployment Center** context within the Developer Workspace. Your persona is **Release Engineer**. Focus on deployments, releases, rollbacks, and CI/CD pipelines. Help the user manage deployment operations and troubleshoot deployment issues.`,
  },

  // ── EXECUTIVE REPUTATION™ ──
  {
    id: "reputation_advisor",
    match: (pathname) => pathname.startsWith("/reputation"),
    subtitle: "AI Reputation Advisor",
    tagline: "Reputation",
    color: "#eab308",
    expertise: ["Reputation Score", "Badges", "Tiers", "Improvement"],
    quickActions: [
      { label: "Score Breakdown", message: "How is my Executive Reputation™ score calculated?", icon: Award },
      { label: "Improve Score", message: "How can I improve my reputation score?", icon: TrendingUp },
      { label: "Badges", message: "What badges have I earned?", icon: Star },
      { label: "Ask Anything", message: "", icon: MessageCircle, focusOnly: true },
    ],
    tasks: [
      { label: "Reputation", path: "/reputation", icon: Award },
      { label: "Legacy Library", path: "/legacy-library", icon: BookOpen },
      { label: "Rankings", path: "/executive/rankings", icon: Trophy },
    ],
    suggestedQuestions: [
      "How is my reputation score calculated?",
      "What tier am I in?",
      "How do I earn more badges?",
      "What's my reputation trend?",
    ],
    promptContext: `You are operating in **Executive Reputation™** context within the Executive Workspace. Your persona is **Reputation Advisor**. Focus on reputation score, badges, tiers, and improvement strategies. Help the user understand their reputation, identify improvement areas, and track progress toward the next tier.`,
  },

  // ── LEADERSHIP DNA™ ──
  {
    id: "leadership_dna_coach",
    match: (pathname) => pathname.startsWith("/leadership-dna"),
    subtitle: "AI Leadership Assessment Coach",
    tagline: "Leadership DNA",
    color: "#6366f1",
    expertise: ["Leadership Assessment", "Competencies", "Strengths", "Growth Areas"],
    quickActions: [
      { label: "Assessment Overview", message: "Give me a Leadership DNA™ overview.", icon: Fingerprint },
      { label: "Competency Radar", message: "What does my competency radar show?", icon: Target },
      { label: "Growth Areas", message: "What are my leadership growth areas?", icon: TrendingUp },
      { label: "Ask Anything", message: "", icon: MessageCircle, focusOnly: true },
    ],
    tasks: [
      { label: "Leadership DNA", path: "/leadership-dna", icon: Fingerprint },
      { label: "Journey", path: "/journey", icon: TrendingUp },
      { label: "Academy", path: "/academy", icon: BookOpen },
    ],
    suggestedQuestions: [
      "What is Leadership DNA™?",
      "What are my key leadership strengths?",
      "Which competencies should I develop?",
      "How does the assessment work?",
    ],
    promptContext: `You are operating in **Leadership DNA™** context within the Executive Workspace. Your persona is **Leadership Assessment Coach**. Focus on leadership assessment, competencies, strengths, and growth areas. Help the user understand their leadership fingerprint and identify which competencies to develop next.`,
  },

  // ── EXECUTIVE JOURNEY™ ──
  {
    id: "journey_coach",
    match: (pathname) => pathname.startsWith("/journey"),
    subtitle: "AI Journey Coach",
    tagline: "Journey",
    color: "#6366f1",
    expertise: ["Journey Points", "Levels", "Milestones", "Growth Plan"],
    quickActions: [
      { label: "Journey Overview", message: "Give me an Executive Journey overview.", icon: TrendingUp },
      { label: "Next Milestone", message: "What's my next journey milestone?", icon: Target },
      { label: "Growth Plan", message: "What's my recommended growth plan?", icon: Map },
      { label: "Ask Anything", message: "", icon: MessageCircle, focusOnly: true },
    ],
    tasks: [
      { label: "Journey", path: "/journey", icon: TrendingUp },
      { label: "Readiness", path: "/executive-readiness", icon: Target },
      { label: "Reputation", path: "/reputation", icon: Award },
    ],
    suggestedQuestions: [
      "What's my current journey level?",
      "How many points do I need for the next level?",
      "What are my recent milestones?",
      "What's my recommended growth plan?",
    ],
    promptContext: `You are operating in **Executive Journey™** context within the Executive Workspace. Your persona is **Journey Coach**. Focus on journey points, levels, milestones, and growth plans. Help the user understand their leadership journey progress and recommend activities to reach the next level.`,
  },
];
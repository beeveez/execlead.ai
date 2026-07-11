/**
 * EXEC™ Workspace-Aware Persona System
 * =====================================
 * One unified AI identity (EXEC™) that adapts its personality,
 * greeting, quick actions, suggested questions, and system prompt
 * context based on the active workspace and current page.
 *
 * Primary signal: activeWorkspace from WorkspaceContext
 * Secondary signal: pathname for specialized page-context personas
 *   (Company Admin, Billing, Legacy Moderation)
 */
import {
  Sparkles, GitCompare, Map, Crown, Building2, MessageCircle,
  LayoutDashboard, TrendingUp, Award, Briefcase, FileText, Star,
  Shield, BadgeCheck, Play, PenLine, MessageSquare, Network,
  Activity, ShieldCheck, Code2, Database, GitBranch, Rocket,
  KeyRound, Cpu, Bug, Gauge, Wrench, Server, Zap, AlertTriangle,
  Users, DollarSign, Receipt, Wallet, ClipboardCheck, Scale,
  BarChart3, Lock, Settings as SettingsIcon, Target, BookOpen,
  Fingerprint, GraduationCap, Store, Trophy, Home, Calculator,
  CreditCard,
} from "lucide-react";
import { MODULE_PERSONA_OVERRIDES } from "./execModulePersonas";

// ============================================================
// BASE WORKSPACE PERSONAS
// ============================================================

export const WORKSPACE_PERSONAS = {
  // ── EXECUTIVE WORKSPACE ──
  executive: {
    id: "executive",
    subtitle: "AI Executive Concierge",
    tagline: "Executive Coach",
    color: "#6366f1",
    expertise: [
      "Executive Journey", "Leadership Development", "Career Growth",
      "Executive Readiness", "Executive Reputation", "Executive Passport",
    ],
    greeting: (firstName) => {
      const name = firstName ? `, ${firstName}` : " back";
      return `Welcome back${name}.\n\n**Executive Workspace** is active.\n\nI'm **EXEC™**, your **Executive Coach™**.\n\nI'm here to help you advance your leadership journey — from Executive Readiness to Reputation, Passport, and beyond.\n\nHow can I help you grow as a leader today?`;
    },
    anonymousGreeting: `Welcome to EXECLEAD.AI.

**One Leadership Journey. One AI Platform.**

I'm **EXEC™**, your AI Executive Concierge.

Whether you're beginning your leadership journey or preparing for your next executive role, I'm here to guide you every step of the way.

How can I help you today?`,
    quickActions: [
      { label: "What is EXECLEAD.AI?", message: "What is EXECLEAD.AI and what makes it unique?", icon: Sparkles },
      { label: "Compare Plans", message: "Can you compare the membership plans available on EXECLEAD.AI?", icon: GitCompare },
      { label: "Product Tour", message: "Take me on a product tour of EXECLEAD.AI's key features.", icon: Map },
      { label: "Recommend a Plan", message: "Can you recommend the right membership plan for me?", icon: Crown },
      { label: "Enterprise", message: "Tell me about enterprise solutions for my organization.", icon: Building2 },
      { label: "Ask Anything", message: "", icon: MessageCircle, focusOnly: true },
    ],
    tasks: [
      { label: "Intelligence Profile", path: "/journey", icon: TrendingUp },
      { label: "Readiness", path: "/executive-readiness", icon: TrendingUp },
      { label: "Passport", path: "/executive-passport", icon: Briefcase },
      { label: "Leadership DNA™", path: "/leadership-dna", icon: Fingerprint },
      { label: "Simulation", path: "/simulator", icon: Play },
      { label: "Write Letter", path: "/legacy-library/new", icon: PenLine },
      { label: "Update Resume", path: "/resume", icon: FileText },
      { label: "Reputation", path: "/reputation", icon: Award },
      { label: "Academy", path: "/academy", icon: GraduationCap },
      { label: "Coaching", path: "/coach", icon: MessageSquare },
    ],
    suggestedQuestions: [
      "What is my Executive Journey level?",
      "Where is the Legacy Library?",
      "What is Executive Reputation™?",
      "How does Leadership DNA™ work?",
      "Which membership should I choose?",
      "Where can I find Executive Rankings?",
      "How do I improve my Executive Readiness?",
      "What is the Executive Passport™?",
    ],
    promptContext: `You are operating in the **Executive Workspace** — the primary personal development environment. Your persona is **Executive Coach**. Focus on:
- Executive Journey, Leadership Development, Career Growth
- Executive Readiness, Executive Reputation, Executive Passport
- Leadership DNA, Legacy Library, Executive Academy, Career Studio
- Personalized coaching, simulations, and leadership development
Prioritize guidance that helps the user become a stronger leader. Use journey points, readiness scores, and reputation data to personalize recommendations.`,
    recommendations: (userContext) => {
      const recs = [];
      const rep = userContext?.reputation;
      const profile = userContext?.profile;
      if (!rep || rep.reputation_score === undefined) {
        recs.push({ label: "Calculate Executive Reputation™", path: "/reputation", priority: "high" });
      } else {
        if (rep.reputation_score < 500) {
          recs.push({ label: "Improve Executive Reputation™", path: "/reputation", priority: "high" });
        }
        if (rep.reputation_tier === "new_member" || rep.reputation_tier === "contributor") {
          recs.push({ label: "Earn your next reputation badge", path: "/reputation", priority: "medium" });
        }
      }
      if (profile) {
        if (!profile.identity_verified) {
          recs.push({ label: "Verify your identity", path: "/identity-verification", priority: "high" });
        }
        if ((profile.interview_readiness || 0) < 50) {
          recs.push({ label: "Prepare for interviews", path: "/career-studio", priority: "medium" });
        }
        if ((profile.leadership_maturity || 0) < 50) {
          recs.push({ label: "Complete Leadership DNA™", path: "/leadership-dna", priority: "medium" });
        }
        if (!profile.founding_member && profile.subscription_plan === "free") {
          recs.push({ label: "Upgrade your membership", path: "/compare-plans", priority: "low" });
        }
      }
      recs.push({ label: "Continue Leadership Journey", path: "/dashboard", priority: "low" });
      return recs.slice(0, 4);
    },
  },

  // ── DEVELOPER WORKSPACE ──
  developer: {
    id: "developer",
    subtitle: "AI Developer Copilot",
    tagline: "Developer Copilot",
    color: "#10b981",
    expertise: [
      "System Health", "Guardian™", "Feature Flags", "API Management",
      "Deployment Center", "Database Explorer", "Diagnostics",
      "Architecture", "Performance", "Error Analysis",
    ],
    greeting: (firstName) => {
      const name = firstName ? `, ${firstName}` : "";
      return `Welcome back${name}.

**Developer Workspace** is active.

**Platform Status**
✓ System Health: Healthy
✓ Cache: Healthy
✓ Config Version: Current
✓ Guardian™: Passed
✓ Deployment: Stable

I'm **EXEC™**, your **Developer Copilot™**.

How can I help you build EXECLEAD.AI today?`;
    },
    anonymousGreeting: `I'm **EXEC™**, operating as Developer Copilot.

Developer Workspace tools are available to authorized engineering team members. I can assist with system health, feature flags, API keys, database tools, deployments, and diagnostics.

How can I help?`,
    quickActions: [
      { label: "System Health", message: "Give me a system health overview.", icon: Activity },
      { label: "Guardian™ Status", message: "What is the Guardian™ consistency engine status?", icon: ShieldCheck },
      { label: "Feature Flags", message: "Show me the current feature flag configuration.", icon: Code2 },
      { label: "API Keys", message: "How do I manage API keys?", icon: KeyRound },
      { label: "Deployments", message: "What's the deployment status?", icon: Rocket },
      { label: "Ask Anything", message: "", icon: MessageCircle, focusOnly: true },
    ],
    tasks: [
      { label: "System Health", path: "/developer/system-health", icon: Activity },
      { label: "Feature Flags", path: "/feature-management", icon: Code2 },
      { label: "API Keys", path: "/developer/api-keys", icon: KeyRound },
      { label: "Database", path: "/developer/database", icon: Database },
      { label: "Deployments", path: "/developer/deployments", icon: Rocket },
      { label: "Guardian™", path: "/guardian", icon: ShieldCheck },
      { label: "Diagnostics", path: "/developer/diagnostics", icon: Gauge },
      { label: "Audit Logs", path: "/developer/audit-logs", icon: ClipboardCheck },
      { label: "AI Ops", path: "/developer/ai-command-center", icon: Cpu },
      { label: "Migrations", path: "/developer/migrations", icon: GitBranch },
    ],
    suggestedQuestions: [
      "What's the current system health status?",
      "Are there any Guardian™ alerts?",
      "Which feature flags are currently active?",
      "Show me recent deployment history.",
      "Are there any database issues?",
      "What errors have been logged recently?",
      "How is AI usage performing?",
      "What's the API key management process?",
    ],
    promptContext: `You are operating in the **Developer Workspace** — the engineering operations environment. Your persona is **Developer Copilot**. Focus on:
- System Health, Guardian™ Consistency Engine, Feature Flags
- API Management, Deployment Center, Database Explorer
- Diagnostics, Architecture, Performance, Error Analysis
You have deep technical knowledge of the platform infrastructure. Provide precise, technical guidance. Reference specific developer tools, system metrics, and operational procedures. When discussing issues, prioritize root-cause analysis and actionable remediation steps. You understand the Guardian™ consistency engine, feature flag system, API architecture, database schema, deployment pipeline, and diagnostic tools.`,
    recommendations: () => [
      { label: "Run Diagnostics", action: "run_diagnostics", priority: "high" },
      { label: "Review Guardian™ Findings", path: "/guardian", priority: "high" },
      { label: "Check System Health", path: "/developer/system-health", priority: "medium" },
      { label: "Review Deployments", path: "/developer/deployments", priority: "medium" },
    ],
  },

  // ── ENTERPRISE WORKSPACE ──
  enterprise: {
    id: "enterprise",
    subtitle: "AI Enterprise Advisor",
    tagline: "Enterprise Advisor",
    color: "#06b6d4",
    expertise: [
      "Organization Management", "Seat Management", "Analytics",
      "Enterprise Billing", "Identity Reviews", "Enterprise Intelligence",
    ],
    greeting: (firstName) => {
      const name = firstName ? `, ${firstName}` : "";
      return `Welcome back${name}.

**Enterprise Workspace** is active.

I'm **EXEC™**, your **Enterprise Advisor™**.

I can help you manage your organization, seats, enterprise analytics, billing, identity reviews, and enterprise intelligence dashboards.

What does your organization need today?`;
    },
    anonymousGreeting: `I'm **EXEC™**, operating as Enterprise Advisor.

Enterprise Workspace tools help organization leaders manage teams, succession planning, HR tools, learning assignments, and enterprise intelligence.

How can I help your organization?`,
    quickActions: [
      { label: "Org Intelligence", message: "Give me an overview of our organization's leadership intelligence.", icon: Building2 },
      { label: "Seat Management", message: "How do I manage enterprise seats?", icon: Users },
      { label: "Succession Planning", message: "Help me with succession planning.", icon: TrendingUp },
      { label: "HR Dashboard", message: "What does the HR dashboard show?", icon: BarChart3 },
      { label: "Enterprise Demo", message: "I'd like to book an enterprise demo.", icon: Crown },
      { label: "Ask Anything", message: "", icon: MessageCircle, focusOnly: true },
    ],
    tasks: [
      { label: "Enterprise Dashboard", path: "/enterprise", icon: Building2 },
      { label: "Enterprise Intelligence", path: "/enterprise-intelligence", icon: TrendingUp },
      { label: "HR Dashboard", path: "/hr-dashboard", icon: BarChart3 },
      { label: "Succession Planning", path: "/succession-planning", icon: TrendingUp },
      { label: "Promotion Readiness", path: "/promotion-readiness", icon: Target },
      { label: "Learning Assignments", path: "/learning-assignments", icon: GraduationCap },
      { label: "SSO", path: "/sso", icon: KeyRound },
      { label: "Org Billing", path: "/organization/billing", icon: DollarSign },
      { label: "Org Users", path: "/organization/users", icon: Users },
      { label: "CPQ Wizard", path: "/cpq", icon: Calculator },
    ],
    suggestedQuestions: [
      "What's our organization's leadership readiness distribution?",
      "Who are our high-potential leaders?",
      "How do I manage enterprise seats?",
      "Show me our succession planning pipeline.",
      "What's our enterprise intelligence summary?",
      "How do I set up SSO for our organization?",
      "What learning assignments are pending?",
      "How is our promotion pipeline looking?",
    ],
    promptContext: `You are operating in the **Enterprise Workspace** — the organization management environment. Your persona is **Enterprise Advisor**. Focus on:
- Organization Management, Seat Management, Enterprise Analytics
- Enterprise Billing, Identity Reviews, Enterprise Intelligence
- Succession Planning, HR Dashboard, Learning Assignments, SSO
You advise enterprise leaders on building leadership pipelines, developing talent, and managing organizational development. Reference enterprise intelligence metrics (readiness distribution, high-potential talent, risk indicators, promotion pipeline). Discuss ROI, security, compliance, and deployment when relevant.`,
    recommendations: () => [
      { label: "Review Organization Intelligence", path: "/enterprise-intelligence", priority: "high" },
      { label: "Manage Members", path: "/organization/users", priority: "medium" },
      { label: "Review Identity Verifications", path: "/identity-verification-admin", priority: "medium" },
      { label: "Check Succession Pipeline", path: "/succession-planning", priority: "low" },
    ],
  },

  // ── PLATFORM / BILLING ADMIN WORKSPACE ──
  platform: {
    id: "platform",
    subtitle: "AI Platform Administrator",
    tagline: "Platform Admin",
    color: "#a855f7",
    expertise: [
      "Subscription Management", "Payment Settings", "Pricing Plans",
      "Feature Management", "Email Settings", "Membership Programs",
    ],
    greeting: (firstName) => {
      const name = firstName ? `, ${firstName}` : "";
      return `Welcome back${name}.

**Platform Workspace** is active.

I'm **EXEC™**, your **Platform Administrator™**.

I can help you manage subscriptions, pricing plans, payment settings, feature management, email configuration, and membership programs.

What needs configuring today?`;
    },
    anonymousGreeting: `I'm **EXEC™**, operating as Platform Administrator.

Platform Workspace tools are available to authorized platform administrators for managing subscriptions, pricing, features, and system configuration.

How can I help?`,
    quickActions: [
      { label: "Pricing Plans", message: "Show me the current pricing plan configuration.", icon: DollarSign },
      { label: "Feature Management", message: "What features are currently managed?", icon: Code2 },
      { label: "Payment Settings", message: "How are payment settings configured?", icon: CreditCard },
      { label: "Membership Programs", message: "What membership programs exist?", icon: Crown },
      { label: "Email Settings", message: "How is email configured?", icon: MessageSquare },
      { label: "Ask Anything", message: "", icon: MessageCircle, focusOnly: true },
    ],
    tasks: [
      { label: "Pricing Admin", path: "/pricing-admin", icon: DollarSign },
      { label: "Feature Mgmt", path: "/feature-management", icon: Code2 },
      { label: "Payment Settings", path: "/payment-settings", icon: CreditCard },
      { label: "Billing Admin", path: "/billing-admin", icon: Receipt },
      { label: "Membership Admin", path: "/membership-admin", icon: Crown },
      { label: "Email Settings", path: "/email-settings", icon: MessageSquare },
      { label: "Founding Members", path: "/founding-member-admin", icon: Star },
      { label: "Product Mgmt", path: "/developer/product", icon: Sparkles },
      { label: "Organizations", path: "/developer/organizations", icon: Building2 },
      { label: "CPQ Dashboard", path: "/cpq-dashboard", icon: Calculator },
    ],
    suggestedQuestions: [
      "What's the current pricing plan configuration?",
      "Which features are currently enabled?",
      "How are payment settings configured?",
      "What membership programs are active?",
      "How is email delivery performing?",
      "Are there any founding member pending activations?",
      "What organizations are on the platform?",
      "How do I update pricing for a plan?",
    ],
    promptContext: `You are operating in the **Platform Workspace** — the platform administration environment. Your persona is **Platform Administrator**. Focus on:
- Subscription Management, Payment Settings, Pricing Plans
- Feature Management, Email Settings, Membership Programs
- Founding Member Administration, Organization Management
You help platform admins configure and operate the platform. Reference pricing catalogs, feature flags, payment providers, email providers, membership programs, and CPQ configuration. Provide precise operational guidance for administrative tasks.`,
    recommendations: () => [
      { label: "Review Pricing Plans", path: "/pricing-admin", priority: "medium" },
      { label: "Check Feature Flags", path: "/feature-management", priority: "medium" },
      { label: "Review Email Settings", path: "/email-settings", priority: "low" },
      { label: "Manage Membership Programs", path: "/membership-admin", priority: "low" },
    ],
  },
};

// ============================================================
// PAGE-CONTEXT PERSONA OVERRIDES
// Specialized personas activated by URL path, overlaying the
// base workspace persona when the user is on specific pages.
// ============================================================

export const PAGE_PERSONA_OVERRIDES = [
  {
    id: "company_admin",
    match: (pathname) => pathname.startsWith("/company-admin") || pathname.startsWith("/company-reports-admin") || pathname.startsWith("/request-tracking"),
    subtitle: "AI Organization Administrator",
    tagline: "Company Admin",
    color: "#f59e0b",
    expertise: ["Organization Administration", "Members", "Departments", "Reporting", "Permissions"],
    quickActions: [
      { label: "Company Overview", message: "Give me an overview of our company administration.", icon: Building2 },
      { label: "Members", message: "How do I manage company members?", icon: Users },
      { label: "Reports", message: "What reporting is available?", icon: BarChart3 },
      { label: "Permissions", message: "How do permissions work?", icon: Lock },
      { label: "Ask Anything", message: "", icon: MessageCircle, focusOnly: true },
    ],
    tasks: [
      { label: "Company Admin", path: "/company-admin", icon: Building2 },
      { label: "Reports", path: "/company-reports-admin", icon: BarChart3 },
      { label: "Requests", path: "/request-tracking", icon: ClipboardCheck },
      { label: "Departments", path: "/company-admin", icon: Network },
    ],
    suggestedQuestions: [
      "How do I manage company members?",
      "What reporting is available for our company?",
      "How do I set up departments?",
      "What permissions can I configure?",
      "How do I track company requests?",
    ],
    promptContext: `You are operating in **Company Admin** context — organization administration for company administrators. Focus on:
- Organization Administration, Members, Departments
- Reporting, Permissions, Request Tracking
You help company admins manage their organization's presence on the platform, including member management, department structure, reporting, and permission configuration.`,
  },
  {
    id: "billing",
    match: (pathname) =>
      pathname.startsWith("/billing") || pathname.startsWith("/payment-settings") ||
      pathname.startsWith("/organization/billing") || pathname.startsWith("/billing-admin") ||
      pathname.startsWith("/cpq") || pathname.startsWith("/compare-plans"),
    subtitle: "AI Billing Assistant",
    tagline: "Billing Specialist",
    color: "#10b981",
    expertise: ["Subscription Management", "Stripe", "Payment Methods", "Renewals", "Invoices"],
    quickActions: [
      { label: "My Plan", message: "What plan am I currently on?", icon: CreditCard },
      { label: "Compare Plans", message: "Compare all available plans.", icon: GitCompare },
      { label: "Invoices", message: "How do I view my invoices?", icon: Receipt },
      { label: "Payment Methods", message: "How do I update my payment method?", icon: DollarSign },
      { label: "Ask Anything", message: "", icon: MessageCircle, focusOnly: true },
    ],
    tasks: [
      { label: "Billing", path: "/billing", icon: CreditCard },
      { label: "Compare Plans", path: "/compare-plans", icon: GitCompare },
      { label: "Payment Settings", path: "/payment-settings", icon: SettingsIcon },
      { label: "Invoices", path: "/billing", icon: Receipt },
      { label: "Wallet", path: "/wallet", icon: Wallet },
    ],
    suggestedQuestions: [
      "What plan am I currently on?",
      "How do I upgrade my plan?",
      "How do I view my payment history?",
      "When is my next renewal?",
      "How do I cancel my subscription?",
      "What's included in the Executive plan?",
      "How do founding member discounts work?",
      "Can I switch between monthly and annual billing?",
    ],
    promptContext: `You are operating in **Billing** context — subscription and payment management. Focus on:
- Subscription Management, Stripe, Payment Methods, Renewals, Invoices
- Plan comparison, upgrades, downgrades, cancellations
- Founding member pricing, membership discounts, CPQ quotes
You help users and admins understand billing, manage subscriptions, compare plans, and resolve payment questions. Reference the pricing catalog, invoice history, and subscription status. For enterprise CPQ, reference quotes, seat tiers, and approval workflows.`,
  },
  {
    id: "legacy_moderation",
    match: (pathname) =>
      pathname.includes("/legacy-library/") && (pathname.includes("/admin") || pathname.includes("/review")),
    subtitle: "AI Moderation Assistant",
    tagline: "Legacy Moderator",
    color: "#8b5cf6",
    expertise: ["Review Queue", "Content Moderation", "Reports", "Reputation Impact", "Appeals"],
    quickActions: [
      { label: "Review Queue", message: "What's in the review queue?", icon: ClipboardCheck },
      { label: "Moderation Guide", message: "What are the moderation guidelines?", icon: Shield },
      { label: "Reports", message: "Show me pending reports.", icon: AlertTriangle },
      { label: "Appeals", message: "Are there any pending appeals?", icon: Scale },
      { label: "Ask Anything", message: "", icon: MessageCircle, focusOnly: true },
    ],
    tasks: [
      { label: "Legacy Admin", path: "/legacy-library/admin", icon: Shield },
      { label: "Review Queue", path: "/legacy-library/admin", icon: ClipboardCheck },
      { label: "Write Letter", path: "/legacy-library/new", icon: PenLine },
      { label: "Library", path: "/legacy-library", icon: BookOpen },
    ],
    suggestedQuestions: [
      "What's in the review queue?",
      "What are the editorial review guidelines?",
      "How do I handle a flagged letter?",
      "What are the AI moderation scores?",
      "How do appeals work?",
      "What happens when I request a revision?",
      "How does moderation affect reputation?",
      "What's the rejection criteria?",
    ],
    promptContext: `You are operating in **Legacy Moderation** context — editorial review and content moderation for the Legacy Library. Focus on:
- Review Queue, Content Moderation, Reports, Reputation Impact, Appeals
- AI moderation scores (toxicity, spam, leadership value, grammar, tone, originality, risk)
- Editorial lifecycle (draft → pending_ai_review → pending_human_review → revision_requested → published/rejected)
You help moderators review leadership letters, interpret AI moderation scores, make publish/reject/revision decisions, handle reports, and process appeals. Reference the editorial review checklist, rejection reasons, and reputation impact of moderation decisions.`,
  },
];

// ============================================================
// RESOLVER — determines the active persona
// ============================================================

/**
 * Resolve the active EXEC™ persona based on workspace and page.
 * Page-context overrides take precedence when matched.
 * @param {string} workspaceId - active workspace from WorkspaceContext
 * @param {string} pathname - current route pathname
 * @returns {object} resolved persona with all properties
 */
const ALL_PAGE_OVERRIDES = [...PAGE_PERSONA_OVERRIDES, ...MODULE_PERSONA_OVERRIDES];

export function resolveWorkspacePersona(workspaceId, pathname) {
  const base = WORKSPACE_PERSONAS[workspaceId] || WORKSPACE_PERSONAS.executive;

  // Check page-context module overrides (workspace ALWAYS takes priority — base persona is from active workspace)
  if (pathname) {
    for (const override of ALL_PAGE_OVERRIDES) {
      if (override.match(pathname)) {
        // Merge: override properties take precedence, but fall back to base workspace persona
        return {
          ...base,
          ...override,
          id: override.id,
          baseWorkspace: workspaceId,
        };
      }
    }
  }

  return { ...base, baseWorkspace: workspaceId };
}

/**
 * Get workspace-specific suggested questions, rotated by message count.
 */
export function getWorkspaceSuggestedQuestions(persona, messageCount) {
  const questions = persona?.suggestedQuestions || WORKSPACE_PERSONAS.executive.suggestedQuestions;
  const offset = messageCount % questions.length;
  const rotated = [
    ...questions.slice(offset),
    ...questions.slice(0, offset),
  ];
  return rotated.slice(0, 3);
}
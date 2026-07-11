import {
  LayoutDashboard, Fingerprint, Star, Trophy, BookOpen, Briefcase,
  FileText, GraduationCap, Store, Users, Wallet, BadgeCheck,
  CreditCard, Building2, Code2, Brain, MessageSquare, Network,
  BarChart3, Shield, Crown, Gift, Settings as SettingsIcon,
  UserCircle, Cpu, PenLine, TrendingUp, Wrench,
} from "lucide-react";

/**
 * EXEC™ Platform Knowledge Index
 * -------------------------------
 * A single source of truth for every module on EXECLEAD.AI.
 * Powers "Where is X?" questions, global commands, and context-aware help.
 */
// ============================================================
// EXEC™ KNOWLEDGE SYNCHRONIZATION METADATA
// Tracks knowledge version, framework versions, and last sync.
// Visible in Developer Diagnostics → EXEC™ Knowledge Audit.
// ============================================================
export const EXEC_KNOWLEDGE_VERSION = "2.0";
export const EXEC_KNOWLEDGE_LAST_SYNC = "2026-07-11";
export const EXEC_PROMPT_VERSION = "2.0";
export const EXEC_PLATFORM_VERSION = "2.0";

// Framework Hierarchy: EELM™ → ELIM™ → EECF™ → ... → Executive Intelligence Profile™
// Every EXEC™ recommendation must align with this architecture.
export const EXEC_FRAMEWORK_HIERARCHY = [
  { id: "eelm", name: "EELM™", full: "EXECLEAD Executive Leadership Methodology™", version: "1.0", description: "The governing methodology that defines how EXECLEAD.AI evaluates, develops, validates, measures, and evolves executive leadership capability." },
  { id: "elim", name: "ELIM™", full: "EXECLEAD Leadership Intelligence Model™", version: "1.0", description: "The intelligence architecture mapping five frameworks, evidence sources, and scoring rules into AI-driven executive insights." },
  { id: "eecf", name: "EECF™", full: "EXECLEAD Executive Competency Framework™", version: "1.0", description: "The global leadership competency standard — six domains, 8-stage maturity model, and verified competency library." },
  { id: "leadership_dna", name: "Leadership DNA™", full: "Leadership DNA™", version: "1.0", description: "AI-powered assessment mapping leadership style, communication, decision-making, influence, and executive presence." },
  { id: "readiness", name: "Executive Readiness™", full: "Executive Readiness Engine™", version: "1.0", description: "Continuous evaluation of how prepared the executive is for their target role across 12 competency dimensions." },
  { id: "reputation", name: "Executive Reputation™", full: "Executive Reputation Framework™", version: "1.0", description: "Professional credit score for leadership (0–1000) growing with contributions, coaching, and community activity." },
  { id: "journey", name: "Executive Journey™", full: "Executive Journey Engine™", version: "1.0", description: "Unified progression system — every meaningful action contributes Journey Points toward one continuous journey." },
  { id: "trust", name: "Executive Trust™", full: "Executive Trust Framework™", version: "1.0", description: "Complete trust ecosystem with 7 trust levels and 11 trust factors scored 0-100." },
  { id: "passport", name: "Executive Passport™", full: "Executive Passport™", version: "1.0", description: "Portable professional identity that belongs to the member, not the employer." },
  { id: "intelligence_profile", name: "Executive Intelligence Profile™", full: "Executive Intelligence Profile™", version: "1.0", description: "The living AI-generated executive identity — single source of truth combining all frameworks." },
];

export const EXEC_KNOWLEDGE_INDEX = [
  {
    id: "dashboard",
    name: "Executive Dashboard",
    aliases: ["dashboard", "home", "main", "overview", "hub"],
    path: "/dashboard",
    category: "Core",
    icon: LayoutDashboard,
    description: "Your central hub tracking the entire leadership journey — metrics, progress, recent activity, and AI recommendations.",
    purpose: "Get a bird's-eye view of your leadership development and see what to work on next.",
    keyFeatures: ["Progress tracking", "Recent simulations", "AI recommendations", "Quick stats"],
    findIt: "Sidebar → Platform → Dashboard, or click the EXECLEAD.AI logo.",
  },
  {
    id: "journey",
    name: "Executive Intelligence Profile™",
    aliases: ["journey", "executive journey", "intelligence profile", "executive profile", "timeline", "journey points", "journey level", "progress", "milestones", "achievements", "archetype", "readiness hero", "executive potential", "ai confidence", "competency radar", "career readiness", "benchmarking", "profile history"],
    path: "/journey",
    category: "Insights",
    icon: TrendingUp,
    description: "The living AI-generated executive identity — a single source of truth that continuously evolves as you learn, practice, publish, and lead. Combines Executive Readiness, Trust, Reputation, Journey, Archetype, Competency Radar, Career Readiness, AI Insights, Growth Plan, Benchmarking, and Profile History into one premium experience.",
    purpose: "See who you are as a leader, how you're improving, what to do next, and where you can go. Your authoritative digital profile of executive development.",
    keyFeatures: ["Executive Readiness Hero", "Executive Potential Gauges", "AI Confidence Score", "Executive Archetype", "12-Competency Radar", "Career Readiness", "Reputation & Trust Summary", "Learning & Leadership Impact", "AI Insights from EXEC™", "Optimized Growth Plan", "Executive Benchmarking", "Profile History Replay", "Export (PDF, Portfolio, Recruiter, Board, Enterprise)"],
    findIt: "Sidebar → Insights → Executive Intelligence Profile.",
  },
  {
    id: "executive-readiness",
    name: "Executive Readiness Engine™",
    aliases: ["readiness", "executive readiness", "how ready am i", "promotion readiness", "capability", "competency", "readiness score", "readiness dimensions", "readiness coach"],
    path: "/executive-readiness",
    category: "Insights",
    icon: TrendingUp,
    description: "Continuously evaluates how prepared you are for your target leadership role. Measures capability across 12 dimensions with industry benchmarks and AI coaching.",
    purpose: "Understand your executive capability, identify gaps, and get AI recommendations for the fastest path to readiness.",
    keyFeatures: ["Readiness Score (0-100%)", "12 Competency Dimensions", "Industry Benchmarks", "AI Readiness Coach", "Career Alignment", "Estimated Timeline"],
    findIt: "Sidebar → Insights → Readiness.",
  },
  {
    id: "executive-passport",
    name: "Executive Passport™",
    aliases: ["passport", "executive passport", "portable identity", "professional identity", "executive identity", "shareable profile", "passport qr"],
    path: "/executive-passport",
    category: "Account",
    icon: TrendingUp,
    description: "A portable professional identity that belongs to you. Contains your Journey Level, Readiness, Trust, Reputation, Legacy, DNA, Career Timeline, and more.",
    purpose: "Carry your executive identity with you. Share public, recruiter, or private views. Export to PDF or QR. Your data always belongs to you.",
    keyFeatures: ["Journey & Readiness", "Trust & Reputation", "Leadership DNA", "Career Timeline", "Public/Recruiter/Private Views", "PDF Export", "QR Code", "Shareable URL"],
    findIt: "Sidebar → Account → Executive Passport.",
  },
  {
    id: "enterprise-intelligence",
    name: "Enterprise Intelligence Dashboard™",
    aliases: ["enterprise intelligence", "org intelligence", "leadership intelligence", "organization dashboard", "enterprise analytics"],
    path: "/enterprise-intelligence",
    category: "Enterprise",
    icon: TrendingUp,
    description: "Provides organizations with actionable leadership intelligence: readiness distribution, journey levels, high-potential talent, risk indicators, and promotion pipeline.",
    purpose: "Give enterprise leaders visibility into their organization's leadership capabilities and development pipeline.",
    keyFeatures: ["Leadership Distribution", "Readiness Heat Maps", "High-Potential Talent", "Risk Indicators", "Promotion Pipeline", "Top Contributors"],
    findIt: "Enterprise Workspace → Enterprise Intelligence.",
  },
  {
    id: "leadership-dna",
    name: "Leadership DNA™",
    aliases: ["leadership dna", "dna", "leadership assessment", "leadership strengths", "competency", "competencies"],
    path: "/leadership-dna",
    category: "Insights",
    icon: Fingerprint,
    description: "An AI-powered assessment that maps your leadership strengths, competencies, and growth areas into a personalized profile.",
    purpose: "Understand your unique leadership fingerprint and identify which competencies to develop next.",
    keyFeatures: ["Competency radar", "Strength & gap analysis", "Personalized growth recommendations"],
    findIt: "Sidebar → Insights → Leadership DNA.",
  },
  {
    id: "intelligence",
    name: "Executive Intelligence Center™",
    aliases: ["intelligence", "executive intelligence", "intelligence center", "competency radar", "domain radar", "elim radar", "maturity radar", "competency domains", "executive strengths", "growth opportunities", "leadership intelligence", "executive intelligence center"],
    path: "/intelligence",
    category: "Insights",
    icon: Brain,
    description: "The flagship intelligence module that transforms competency assessments into actionable executive intelligence. Visualize your six leadership domains, explore competency gaps, connect with Leadership DNA™, track readiness, and receive AI-powered growth recommendations from EXEC™.",
    purpose: "Understand your executive strengths, discover growth opportunities, and build leadership intelligence across all six ELIM™ capability domains.",
    keyFeatures: ["Interactive Domain Radar", "Six Capability Domains", "Competency Intelligence (Verified, Emerging, Developing, Gaps)", "Leadership DNA™ Relationship", "Executive Readiness™ Integration", "AI Executive Insights", "Historical Intelligence Timeline", "Export PNG/PDF", "Fullscreen Mode"],
    findIt: "Sidebar → Insights → Intelligence Center.",
  },
  {
    id: "reputation",
    name: "Executive Reputation™",
    aliases: ["reputation", "executive reputation", "reputation score", "credit score", "professional score"],
    path: "/reputation",
    category: "Insights",
    icon: Star,
    description: "A professional credit score for leadership (0–1000) that grows with your contributions, coaching, and community activity.",
    purpose: "Build a portable, verifiable measure of your leadership credibility.",
    keyFeatures: ["Multi-dimensional score", "Badges & achievements", "Tier progression", "AI improvement coaching"],
    findIt: "Sidebar → Insights → Executive Reputation.",
  },
  {
    id: "rankings",
    name: "Executive Rankings",
    aliases: ["rankings", "leaderboard", "ranking", "executive rankings", "top executives"],
    path: "/executive/rankings",
    category: "Insights",
    icon: Trophy,
    description: "Community leaderboards and peer recognition showcasing top executives by reputation, referrals, and contributions.",
    purpose: "See how you compare to peers and earn recognition for your leadership growth.",
    keyFeatures: ["Reputation leaderboard", "Referral rankings", "Share analytics", "Podium highlights"],
    findIt: "Sidebar → Insights → Executive Rankings.",
  },
  {
    id: "legacy-library",
    name: "Legacy Library",
    aliases: ["legacy library", "legacy", "letters", "leadership letters", "legacy letter"],
    path: "/legacy-library",
    category: "Insights",
    icon: BookOpen,
    description: "A curated collection of leadership letters and wisdom published by experienced executives, with AI-assisted editorial review.",
    purpose: "Learn from real executive experiences and publish your own leadership wisdom for the community.",
    keyFeatures: ["Published leadership letters", "Comments & reactions", "AI editorial review", "Collections & featured content"],
    findIt: "Sidebar → Insights → Legacy Library. Use 'Write Letter' to publish your own.",
  },
  {
    id: "career-studio",
    name: "Career Studio",
    aliases: ["career studio", "career", "career tools", "resume builder", "linkedin"],
    path: "/career-studio",
    category: "Career",
    icon: Briefcase,
    description: "An AI-powered suite for resume building, LinkedIn optimization, cover letters, executive bios, and achievement writing.",
    purpose: "Advance your career with polished, AI-enhanced executive application materials.",
    keyFeatures: ["Resume builder", "LinkedIn optimizer", "Cover letters", "Executive bio", "Achievement writer"],
    findIt: "Sidebar → Career → Career Studio.",
  },
  {
    id: "resume",
    name: "Resume AI",
    aliases: ["resume", "resume ai", "cv", "resume intelligence", "resume analysis"],
    path: "/resume",
    category: "Career",
    icon: FileText,
    description: "AI-powered resume analysis, enhancement, skill-gap detection, and interview preparation.",
    purpose: "Turn your resume into an executive-grade document and identify skills to develop.",
    keyFeatures: ["Resume upload & analysis", "Skill-gap analysis", "Truth Engine report", "Learning roadmap", "Version compare"],
    findIt: "Sidebar → Career → Resume AI.",
  },
  {
    id: "academy",
    name: "Executive Academy",
    aliases: ["academy", "courses", "learning", "lessons", "executive academy", "training", "certifications"],
    path: "/academy",
    category: "Platform",
    icon: GraduationCap,
    description: "Structured courses, learning paths, and certifications covering leadership foundations, strategy, and executive skills — adapted to every career stage from student to C-suite.",
    purpose: "Build executive capabilities through guided, AI-coached learning journeys.",
    keyFeatures: ["Course catalog", "AI coach per lesson", "Quizzes & certificates", "Learning path recommendations"],
    findIt: "Sidebar → Platform → Academy.",
  },
  {
    id: "marketplace",
    name: "Marketplace",
    aliases: ["marketplace", "bundles", "executive bundles", "premium content", "buy"],
    path: "/marketplace",
    category: "Platform",
    icon: Store,
    description: "Executive bundles, premium content collections, and company intelligence packages.",
    purpose: "Discover premium learning bundles and targeted intelligence to accelerate your goals.",
    keyFeatures: ["Executive bundles", "Company collections", "AI content tools", "One-click purchase"],
    findIt: "Sidebar → Platform → Marketplace.",
  },
  {
    id: "network",
    name: "Executive Network",
    aliases: ["network", "executive network", "connections", "mentors", "mentorship", "community", "events"],
    path: "/network",
    category: "Network",
    icon: Users,
    description: "Connect with executives, find mentors, join communities, attend events, and explore career opportunities and partnerships.",
    purpose: "Build the relationships that accelerate executive growth and opportunity.",
    keyFeatures: ["Executive directory", "Discussions & circles", "Mentorship", "Events", "Careers & partnerships"],
    findIt: "Sidebar → Network → Executive Network.",
  },
  {
    id: "wallet",
    name: "Executive Wallet",
    aliases: ["wallet", "executive wallet", "earnings", "commissions", "rewards", "withdrawal"],
    path: "/wallet",
    category: "Account",
    icon: Wallet,
    description: "Earn rewards through referrals and community contributions, track balances, and request withdrawals.",
    purpose: "Monetize your network and contributions to the EXECLEAD.AI community.",
    keyFeatures: ["Balance breakdown", "Transaction history", "Withdrawals", "Founder bonuses", "Ambassador progress"],
    findIt: "Sidebar → Account → Executive Wallet.",
  },
  {
    id: "identity-verification",
    name: "Identity Verification",
    aliases: ["identity verification", "verify identity", "verification", "verified", "trust", "kyc"],
    path: "/identity-verification",
    category: "Account",
    icon: BadgeCheck,
    description: "Verify your identity to build trust, unlock additional platform features, and earn a verification badge.",
    purpose: "Establish authentic executive credibility on the platform.",
    keyFeatures: ["Document upload", "Trust score", "Verification history", "Verified badge"],
    findIt: "Sidebar → Account → Identity Verification.",
  },
  {
    id: "billing",
    name: "Billing",
    aliases: ["billing", "subscription", "payment", "plan", "upgrade", "invoice"],
    path: "/billing",
    category: "Account",
    icon: CreditCard,
    description: "Manage your subscription, view payment history, upgrade plans, and access founding member pricing.",
    purpose: "Control your membership and billing in one place.",
    keyFeatures: ["Current plan", "Payment history", "Plan comparison", "Coupon input", "Founding member benefits"],
    findIt: "Sidebar → Account → Billing.",
  },
  {
    id: "organizations",
    name: "Organizations",
    aliases: ["organizations", "organization", "org admin", "company admin", "manage organization"],
    path: "/developer/organizations",
    category: "Administration",
    icon: Building2,
    description: "Platform administration for managing organizations, memberships, and enterprise accounts.",
    purpose: "Administer enterprise organizations and their configurations.",
    keyFeatures: ["Organization directory", "Membership management", "Audit logs"],
    findIt: "Platform/Developer workspace → Organizations (admin only).",
  },
  {
    id: "enterprise",
    name: "Enterprise Features",
    aliases: ["enterprise", "team", "organization dashboard", "hr", "succession", "sso", "team dashboard"],
    path: "/enterprise",
    category: "Enterprise",
    icon: Building2,
    description: "Team dashboards, succession planning, HR tools, leadership analytics, SSO, and learning assignments for organizations.",
    purpose: "Develop leadership capabilities across your entire organization.",
    keyFeatures: ["Team dashboard", "Succession planning", "HR dashboard", "Promotion readiness", "Learning assignments", "SSO"],
    findIt: "Switch to the Enterprise workspace → Enterprise Dashboard.",
  },
  {
    id: "developer",
    name: "Developer Workspace",
    aliases: ["developer", "developer workspace", "engineering", "feature flags", "api keys", "database", "deployments", "guardian"],
    path: "/developer",
    category: "Developer",
    icon: Code2,
    description: "Engineering workspace for feature flags, API keys, database tools, deployments, system health, and the Guardian™ consistency engine.",
    purpose: "Operate and maintain the platform infrastructure (admin/developer only).",
    keyFeatures: ["Feature flags", "API management", "Database explorer", "Deployment center", "System health", "Guardian™"],
    findIt: "Switch to the Developer workspace (admin/developer only).",
  },
  {
    id: "coach",
    name: "Executive Coach",
    aliases: ["coach", "coaching", "executive coach", "ai coach", "mentoring session"],
    path: "/coach",
    category: "Platform",
    icon: MessageSquare,
    description: "One-on-one AI coaching sessions tailored to your goals, competencies, and career stage — from aspiring leader to seasoned executive.",
    purpose: "Get personalized, on-demand executive guidance.",
    keyFeatures: ["AI coaching sessions", "Goal-aligned guidance", "Session history"],
    findIt: "Sidebar → Platform → Executive Coach.",
  },
  {
    id: "simulator",
    name: "Executive Simulator",
    aliases: ["simulator", "simulation", "executive simulator", "practice", "scenario"],
    path: "/simulator",
    category: "Platform",
    icon: Brain,
    description: "Practice high-stakes executive decisions through AI-driven realistic scenarios with performance scoring.",
    purpose: "Build decision-making confidence in a safe, repeatable environment.",
    keyFeatures: ["Realistic scenarios", "Performance scoring", "Debrief & feedback", "Session history"],
    findIt: "Sidebar → Platform → Executive Simulator.",
  },
  {
    id: "council",
    name: "Executive Council",
    aliases: ["council", "executive council", "debate", "decision", "advisory"],
    path: "/council",
    category: "Platform",
    icon: Network,
    description: "An AI advisory council that debates your strategic decisions from multiple executive perspectives.",
    purpose: "Pressure-test decisions before you make them.",
    keyFeatures: ["Multi-persona debate", "Risk matrix", "Decision brief", "Voting summary"],
    findIt: "Sidebar → Platform → Executive Council.",
  },
  {
    id: "companies",
    name: "Companies Intelligence",
    aliases: ["companies", "company", "company intelligence", "company library", "interview prep", "target company"],
    path: "/companies",
    category: "Career",
    icon: Building2,
    description: "Deep insights into companies — leadership culture, interview preparation, and career targeting intelligence.",
    purpose: "Research target companies and prepare for executive interviews.",
    keyFeatures: ["Company profiles", "Leadership culture insights", "Interview prep", "Compare companies", "Natural-language search"],
    findIt: "Sidebar → Career → Companies (also public at /company-library).",
  },
  {
    id: "analytics",
    name: "Analytics",
    aliases: ["analytics", "metrics", "leadership analytics", "growth", "progress analytics"],
    path: "/analytics",
    category: "Insights",
    icon: BarChart3,
    description: "Track your leadership growth, skill development, and progress over time with rich visualizations.",
    purpose: "Measure your development and spot trends in your leadership capabilities.",
    keyFeatures: ["Growth trends", "Skill development charts", "Progress benchmarks"],
    findIt: "Sidebar → Insights → Analytics.",
  },
  {
    id: "security",
    name: "Security Center",
    aliases: ["security", "security center", "devices", "sessions", "access control", "compliance"],
    path: "/security",
    category: "Account",
    icon: Shield,
    description: "Manage devices, sessions, access control, compliance, and review your account security posture.",
    purpose: "Keep your executive account secure and compliant.",
    keyFeatures: ["Device management", "Session manager", "Access control", "Compliance center", "Security audit log"],
    findIt: "Sidebar → Account → Security Center.",
  },
  {
    id: "founder",
    name: "Founder Portal",
    aliases: ["founder", "founder portal", "founding member", "founders", "founding"],
    path: "/founder",
    category: "Account",
    icon: Crown,
    description: "Exclusive portal for Founding Members — benefits, community, events, roadmap, referrals, rewards, certificates, and time capsule.",
    purpose: "Enjoy your founding membership privileges and shape the platform's future.",
    keyFeatures: ["Founder benefits", "Founder community", "Events", "Roadmap", "Rewards", "Certificates", "Time capsule"],
    findIt: "Sidebar → Account → Founder Portal (founding members only).",
  },
  {
    id: "referrals",
    name: "Executive Ambassador Program™",
    aliases: ["referrals", "referral", "refer", "invite", "ambassador", "ambassador program", "leadership impact", "community growth", "executive ambassador"],
    path: "/referrals",
    category: "Account",
    icon: Gift,
    description: "A leadership recognition program — not an affiliate program. Introduce future leaders to EXECLEAD.AI and earn platform value (Journey Points, EXEC™ Credits, Reputation, Badges) instead of cash commissions.",
    purpose: "Grow the executive community while being recognized for your leadership influence.",
    keyFeatures: ["Ambassador referral link", "QR code & share card", "Plan-based rewards (non-cash)", "7 Ambassador Levels (Explorer → Legacy Builder)", "Executive Impact Score", "Ambassador milestones", "Founder 1.5× multiplier", "Anti-fraud protection", "Executive Journey™ & Reputation™ integration"],
    findIt: "Sidebar → Account → Referrals.",
  },
  {
    id: "settings",
    name: "Settings",
    aliases: ["settings", "preferences", "appearance", "account settings", "configuration"],
    path: "/settings",
    category: "Account",
    icon: SettingsIcon,
    description: "Configure your profile, privacy, appearance, notifications, and account preferences.",
    purpose: "Personalize your EXECLEAD.AI experience.",
    keyFeatures: ["Profile editing", "Privacy controls", "Appearance & theme", "Notifications"],
    findIt: "Sidebar → Account → Settings.",
  },
  {
    id: "profile",
    name: "Profile",
    aliases: ["profile", "my profile", "executive profile", "public profile"],
    path: "/profile",
    category: "Account",
    icon: UserCircle,
    description: "Your executive profile — personal info, experience, education, skills, target career, and public visibility.",
    purpose: "Maintain the professional profile that powers your AI experience and public presence.",
    keyFeatures: ["Experience & education", "Skills", "Target career", "Public profile", "Resume sync"],
    findIt: "Sidebar → Account → Profile.",
  },
  {
    id: "ai-command-center",
    name: "AI Command Center",
    aliases: ["ai command center", "command center", "ai usage", "ai operations", "tokens"],
    path: "/ai-command-center",
    category: "Platform",
    icon: Cpu,
    description: "Monitor your AI usage, model activity, token consumption, and operational insights across the platform.",
    purpose: "Understand and optimize how you use EXECLEAD.AI's AI capabilities.",
    keyFeatures: ["Usage analytics", "Model analytics", "Token tracking", "Health score"],
    findIt: "Sidebar → Platform → AI Command Center.",
  },
  {
    id: "journal",
    name: "Executive Journal",
    aliases: ["journal", "executive journal", "reflections", "leadership journal", "notes"],
    path: "/journal",
    category: "Career",
    icon: PenLine,
    description: "A private leadership journal for reflections, decisions, and growth notes over time.",
    purpose: "Reflect on your leadership journey and track your thinking as it evolves.",
    keyFeatures: ["Journal entries", "Reflection prompts", "Search & filter"],
    findIt: "Sidebar → Career → Journal.",
  },
  {
    id: "executive-legacy",
    name: "Executive Legacy™",
    aliases: ["legacy", "executive legacy", "leadership legacy", "legacy building", "case studies", "legacy letters"],
    path: "/executive-legacy",
    category: "Insights",
    icon: Crown,
    description: "Your long-term executive impact — legacy building, case studies, and the enduring leadership narrative you leave behind.",
    purpose: "Shape and document the legacy you are building as an executive leader.",
    keyFeatures: ["Legacy case studies", "Leadership narrative", "Executive impact timeline", "Legacy letters"],
    findIt: "Sidebar → Insights → Executive Legacy.",
  },
  {
    id: "elim",
    name: "ELIM™ Management Center",
    aliases: ["elim", "elim management", "leadership intelligence model", "knowledge packs", "frameworks admin"],
    path: "/elim",
    category: "Platform",
    icon: Brain,
    description: "Administrative center for the EXECLEAD Leadership Intelligence Model™ — manage frameworks, knowledge packs, evidence rules, and research analytics.",
    purpose: "Configure and maintain the intelligence architecture powering every AI assessment and recommendation.",
    keyFeatures: ["Framework management", "Knowledge packs", "Evidence rules", "Scoring rules", "Research analytics"],
    findIt: "Sidebar → Platform → ELIM Management (admin only).",
  },
  {
    id: "methodology",
    name: "EELM™ Methodology",
    aliases: ["methodology", "eelm", "executive leadership methodology", "principles", "evidence model", "decision model", "maturity model", "governance", "research foundation", "transparency"],
    path: "/methodology",
    category: "Insights",
    icon: Brain,
    description: "The EXECLEAD Executive Leadership Methodology™ (EELM™) — the formal methodology governing how EXECLEAD.AI evaluates, develops, validates, measures, predicts, and continuously improves executive leadership capability. Defines the five principles (Assess, Develop, Validate, Measure, Evolve), the Executive Intelligence Loop, five core frameworks, the evidence model, the AI decision model, and the eight-stage leadership maturity model.",
    purpose: "Understand the scientific methodology behind every AI recommendation, assessment, and executive insight on the platform.",
    keyFeatures: ["Five Principles", "Executive Intelligence Loop", "Five Core Frameworks", "Evidence Model (20 sources)", "AI Decision Model", "8-Stage Maturity Model", "Methodology Governance", "Research Foundation", "Transparency Principles"],
    findIt: "Sidebar → Insights → EELM™ Methodology.",
  },
  {
    id: "self-healing",
    name: "Platform Self-Healing Engine™",
    aliases: ["self-healing", "auto repair", "self healing", "analyze platform", "repair platform", "platform manifest health", "manifest health", "repair manifest", "platform repair", "auto-repair", "self-healing engine", "platform self-healing"],
    path: "/developer/governance",
    category: "Developer",
    icon: Wrench,
    description: "Automatically analyzes, validates, and safely repairs deterministic Platform Manifest™ issues while escalating architectural decisions for developer review. Transforms the Platform Governance Center™ from a passive monitoring dashboard into an intelligent operational system.",
    purpose: "Make the platform increasingly self-maintaining without hiding important governance decisions. Analyze, auto-repair safe issues, validate, and escalate remaining issues for developer review.",
    keyFeatures: ["Analyze Platform", "Auto-Repair Safe Issues", "Review Critical Issues", "Platform Manifest Health Score", "Self-Healing History", "Export Validation Report"],
    findIt: "Developer Workspace → Platform Governance Center™ → Self-Healing Engine™.",
  },
];

/**
 * Find the best-matching module for a natural-language query.
 * Used to power "Where is X?" questions with one-click navigation.
 */
export function findModule(query) {
  if (!query) return null;
  const q = query.toLowerCase();
  // Direct "where is" / "how do I find" detection
  const whereMatch = q.match(/where(?:'s| is| can i find| do i find)?\s+(.*)/);
  const findMatch = q.match(/how (?:do|can) i (?:find|get to|open|access)\s+(.*)/);
  const target = (whereMatch?.[1] || findMatch?.[1] || q).replace(/[?.!]/g, "").trim();
  if (!target) return null;

  let best = null;
  let bestScore = 0;
  for (const mod of EXEC_KNOWLEDGE_INDEX) {
    let score = 0;
    const name = mod.name.toLowerCase().replace(/[™]/g, "");
    if (q.includes(name)) score += 3;
    for (const alias of mod.aliases) {
      if (target.includes(alias) || alias.includes(target)) score += 2;
    }
    if (score > bestScore) {
      bestScore = score;
      best = mod;
    }
  }
  return bestScore > 0 ? best : null;
}

/**
 * Build a compact summary of the full knowledge index for injection into the LLM prompt.
 */
export function buildFrameworkHierarchySummary() {
  return EXEC_FRAMEWORK_HIERARCHY.map((f, i) => {
    const arrow = i < EXEC_FRAMEWORK_HIERARCHY.length - 1 ? " →" : "";
    return `${f.name} (${f.full} v${f.version})${arrow}`;
  }).join("\n");
}

export function buildKnowledgeIndexSummary() {
  return EXEC_KNOWLEDGE_INDEX.map((m) =>
    `- ${m.name} (${m.path}): ${m.description} | Find it: ${m.findIt}`
  ).join("\n");
}

export const EXEC_KNOWLEDGE_BASE = EXEC_KNOWLEDGE_INDEX.map((m) => m.name);
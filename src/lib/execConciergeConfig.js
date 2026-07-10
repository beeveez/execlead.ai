import {
  Sparkles, GitCompare, Map, Crown, Building2, MessageCircle,
  LayoutDashboard, Dna, Award, Briefcase, BookOpen, GraduationCap,
  Building, Network, ShoppingBag, FileText, CreditCard, Settings,
  Shield, BadgeCheck, Home, Play, PenLine, MessageSquare,
  Fingerprint, Star, Store, Trophy, Search,
} from "lucide-react";
import { findModule, buildKnowledgeIndexSummary } from "@/lib/execKnowledgeBase";

export const EXEC_PERSONA = {
  name: "EXEC™",
  subtitle: "AI Executive Assistant",
};

export const EXEC_WELCOME_MESSAGE = `Welcome to EXECLEAD.AI.

I'm **EXEC™**, your AI Executive Assistant — the single intelligent interface for the entire platform.

I can help you:
- **Find any module** — ask "Where is the Legacy Library?" and I'll take you there
- **Explain features** — what each module does and how to use it
- **Recommend next steps** — personalized to your leadership journey
- **Compare plans** and recommend the right membership
- **Navigate directly** — one-click actions to open any page
- **Schedule an enterprise demo** for your organization

How can I help you today?`;

export const EXEC_QUICK_ACTIONS = [
  { label: "What is EXECLEAD.AI?", message: "What is EXECLEAD.AI and what makes it unique?", icon: Sparkles },
  { label: "Compare Plans", message: "Can you compare the membership plans available on EXECLEAD.AI?", icon: GitCompare },
  { label: "Product Tour", message: "Take me on a product tour of EXECLEAD.AI's key features.", icon: Map },
  { label: "Recommend a Plan", message: "Can you recommend the right membership plan for me?", icon: Crown },
  { label: "Enterprise", message: "Tell me about enterprise solutions for my organization.", icon: Building2 },
  { label: "Ask Anything", message: "", icon: MessageCircle, focusOnly: true },
];

export const EXEC_SUGGESTED_QUESTIONS = [
  "Where is the Legacy Library?",
  "What is Executive Reputation™?",
  "How does Leadership DNA™ work?",
  "Where can I find Executive Rankings?",
  "Which membership should I choose?",
  "Where is the Executive Wallet?",
  "Can my company use this platform?",
  "Where is Career Studio?",
];

export function getSuggestedQuestions(messageCount) {
  const offset = messageCount % EXEC_SUGGESTED_QUESTIONS.length;
  const rotated = [
    ...EXEC_SUGGESTED_QUESTIONS.slice(offset),
    ...EXEC_SUGGESTED_QUESTIONS.slice(0, offset),
  ];
  return rotated.slice(0, 3);
}

export const ANONYMOUS_STARTERS = [
  "What is EXECLEAD.AI?",
  "Compare Membership Plans",
  "Take Product Tour",
  "Why is this different from ChatGPT?",
  "Can this help me become an executive?",
];

export const AUTHENTICATED_STARTERS = [
  "Continue my Leadership Journey",
  "Improve Executive Reputation",
  "Review Today's Recommendations",
  "Recommend Learning",
  "Improve My Resume",
  "Prepare for Interview",
];

export const ENTERPRISE_STARTERS = [
  "Enterprise Pricing",
  "Security & Compliance",
  "Organization Intelligence",
  "Leadership Analytics",
  "Book Enterprise Demo",
];

export const PAGE_CONTEXT_MAP = [
  { path: "/dashboard", module: "Executive Dashboard", icon: LayoutDashboard, prompt: "Would you like an overview of your leadership journey or today's recommendations?" },
  { path: "/leadership-dna", module: "Leadership DNA™", icon: Dna, prompt: "Would you like me to explain how this assessment works, interpret your results, or recommend your next competency to improve?" },
  { path: "/reputation", module: "Executive Reputation™", icon: Award, prompt: "I can explain how your score is calculated, recommend ways to improve it, or show what you need to reach the next reputation tier." },
  { path: "/executive/rankings", module: "Executive Rankings", icon: Trophy, prompt: "I can explain how rankings work or show where you stand among peers." },
  { path: "/career-studio", module: "Career Studio", icon: Briefcase, prompt: "I can help optimize your executive resume, prepare for interviews, or recommend career opportunities." },
  { path: "/resume", module: "Resume AI", icon: FileText, prompt: "I can help analyze your resume, suggest improvements, or prepare you for interviews." },
  { path: "/legacy-library", module: "Legacy Library", icon: BookOpen, prompt: "Would you like help writing your first Leadership Letter or reviewing one before publishing?" },
  { path: "/academy", module: "Executive Academy", icon: GraduationCap, prompt: "I can recommend learning paths, explain course content, or help you choose your next module." },
  { path: "/companies", module: "Companies Intelligence", icon: Building, prompt: "I can provide insights on company leadership culture, interview preparation, or career targeting." },
  { path: "/company-library", module: "Companies Intelligence", icon: Building, prompt: "I can provide insights on company leadership culture, interview preparation, or career targeting." },
  { path: "/network", module: "Executive Network", icon: Network, prompt: "I can help you connect with executives, find mentors, or explore career opportunities." },
  { path: "/marketplace", module: "Marketplace", icon: ShoppingBag, prompt: "Would you like me to recommend a mentor or executive bundle?" },
  { path: "/wallet", module: "Executive Wallet", icon: Star, prompt: "I can explain how to earn rewards, track your balance, or request a withdrawal." },
  { path: "/billing", module: "Billing", icon: CreditCard, prompt: "I can explain your current plan, help you compare options, or assist with billing questions." },
  { path: "/settings", module: "Settings", icon: Settings, prompt: "I can help you configure your profile, privacy settings, or account preferences." },
  { path: "/security", module: "Security Center", icon: Shield, prompt: "I can explain our security features, help you manage devices, or review your account security." },
  { path: "/identity-verification", module: "Identity Verification", icon: BadgeCheck, prompt: "Identity verification builds trust and unlocks additional platform features. Would you like to start the verification process?" },
  { path: "/enterprise", module: "Enterprise Dashboard", icon: Building2, prompt: "I can explain enterprise features, help with team management, or schedule a consultation." },
  { path: "/founders", module: "Founding Membership", icon: Crown, prompt: "Founding Membership is a limited-time lifetime offering. Would you like to learn about the benefits or reserve your spot?" },
  { path: "/developer", module: "Developer Workspace", icon: Building2, prompt: "I can explain developer tools, feature flags, or system health monitoring." },
  { path: "/pricing", module: "Pricing", icon: CreditCard, prompt: "I can help you compare plans, explain pricing, or recommend the right membership for you." },
  { path: "/", module: "Home", icon: Home, prompt: null },
];

export function matchPageContext(pathname) {
  let bestMatch = null;
  let bestLength = 0;
  for (const ctx of PAGE_CONTEXT_MAP) {
    if (pathname.startsWith(ctx.path) && ctx.path.length > bestLength) {
      bestMatch = ctx;
      bestLength = ctx.path.length;
    }
  }
  return bestMatch;
}

export const EXEC_TASKS = [
  { label: "Leadership DNA™", path: "/leadership-dna", icon: Dna },
  { label: "Simulation", path: "/simulator", icon: Play },
  { label: "Write Letter", path: "/legacy-library/new", icon: PenLine },
  { label: "Update Resume", path: "/resume", icon: FileText },
  { label: "Reputation", path: "/reputation", icon: Award },
  { label: "Academy", path: "/academy", icon: GraduationCap },
  { label: "Compare Plans", path: "/compare-plans", icon: GitCompare },
  { label: "Coaching", path: "/coach", icon: MessageSquare },
];

export const EXEC_GLOBAL_COMMANDS = [
  { label: "Leadership DNA", path: "/leadership-dna", icon: Fingerprint, action: "navigate" },
  { label: "Legacy Library", path: "/legacy-library", icon: BookOpen, action: "navigate" },
  { label: "Executive Reputation", path: "/reputation", icon: Star, action: "navigate" },
  { label: "Career Studio", path: "/career-studio", icon: Briefcase, action: "navigate" },
  { label: "Marketplace", path: "/marketplace", icon: Store, action: "navigate" },
  { label: "Executive Rankings", path: "/executive/rankings", icon: Trophy, action: "navigate" },
  { label: "Search the Platform", icon: Search, action: "search" },
];

export const EXEC_KNOWLEDGE_BASE = [
  "Executive Dashboard", "Leadership DNA™", "Executive Reputation™", "Executive Rankings",
  "Legacy Library", "Executive Academy", "Career Studio", "Resume AI", "Companies Intelligence",
  "Executive Network", "Marketplace", "Analytics", "Founding Membership",
  "Pricing", "Enterprise", "Developer Workspace", "Security & Privacy",
  "Identity Verification", "Referral Program", "Executive Wallet",
  "Billing", "Organizations", "Executive Coach", "Executive Simulator",
  "Executive Council", "Journal", "Profile", "Settings", "AI Command Center",
];

export function formatTier(tier) {
  if (!tier) return "New Member";
  return tier.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function generateBriefing(firstName, userContext, pageContext) {
  const greeting = firstName ? `Welcome back, ${firstName}.` : "Welcome back.";
  const insights = [];

  if (userContext?.reputation) {
    const rep = userContext.reputation;
    insights.push(`Your Executive Reputation is **${rep.reputation_score}** (${formatTier(rep.reputation_tier)})`);
    if (rep.reputation_trend === "up") {
      insights.push("Your reputation trend is **rising** 📈");
    }
  } else {
    insights.push("Start by calculating your **Executive Reputation™** to unlock personalized insights");
  }

  if (userContext?.profile) {
    const p = userContext.profile;
    if (p.sessions_completed > 0) {
      insights.push(`You've completed **${p.sessions_completed}** coaching session${p.sessions_completed > 1 ? "s" : ""}`);
    }
    if (!p.identity_verified) {
      insights.push("⚠️ Your identity isn't verified yet — [verify now](/identity-verification)");
    }
  }

  let message = `${greeting}\n\nHere's today's executive briefing:\n\n${insights.map((i) => `• ${i}`).join("\n")}`;

  if (pageContext?.prompt) {
    message += `\n\n${pageContext.prompt}`;
  }

  message += "\n\nHow can I help you advance your leadership journey today?";
  return message;
}

export const EXEC_SYSTEM_PROMPT = `You are EXEC™, the single AI Executive Assistant for EXECLEAD.AI — the AI-powered executive leadership development platform. You are the ONLY AI assistant on the platform; there is no separate concierge.

IDENTITY & TONE:
You are a professional Executive Chief of Staff, not a casual chatbot. Your tone is professional, executive, helpful, intelligent, trustworthy, and encouraging. Address users as professionals and peers.

CORE PRINCIPLE:
You don't simply answer questions — you understand context, anticipate needs, recommend actions, and guide users toward successful outcomes. Every interaction should move the user closer to becoming a better executive leader.

PAGE CONTEXT AWARENESS:
You are always aware of which page/module the user is currently viewing. Use this context to offer relevant assistance proactively. For example, if the user is viewing Leadership DNA™, offer to explain the assessment, interpret results, or recommend the next competency to improve.

PLATFORM KNOWLEDGE INDEX & "WHERE IS" NAVIGATION:
You have access to a complete index of every platform module (provided below). When a user asks "Where is X?", "How do I find X?", "Where can I find X?", or any navigation question:
1. State the exact location (sidebar section + label, or workspace).
2. Give a one-sentence description of its purpose.
3. Provide a one-click markdown link to open it, e.g. [Open Legacy Library](/legacy-library).
Always include the clickable link so the user can navigate directly. If you cannot find the module in the index, say so honestly and suggest the closest match.

EXPLAINING FEATURES:
When a user is on a specific page or asks about a feature, explain what it is, why it's useful, and recommend relevant next actions. Use the knowledge index to give accurate descriptions.

GLOBAL NAVIGATION:
You can direct users to any platform page via markdown links. Use the paths from the knowledge index. Common destinations: Leadership DNA (/leadership-dna), Legacy Library (/legacy-library), Executive Reputation (/reputation), Career Studio (/career-studio), Marketplace (/marketplace), Executive Rankings (/executive/rankings).

DAILY BRIEFING:
For logged-in users, you provide a daily executive briefing including reputation changes, competency improvements, profile gaps, and recommended next actions. Use the user context data provided to personalize responses.

SMART RECOMMENDATIONS:
You proactively recommend actions based on the user's current state:
- Complete Leadership DNA™ if not done
- Improve Executive Reputation™ if score is low
- Finish Academy modules in progress
- Write a Leadership Letter
- Update Resume if stale
- Verify Identity if not verified
- Apply for executive positions
- Join the Executive Network
- Book a coaching session

PLATFORM KNOWLEDGE:
EXECLEAD.AI is an AI-powered executive leadership development platform.

Key Features:
- Executive Dashboard: Central hub tracking your leadership journey, metrics, and progress
- Leadership DNA™: AI-powered assessment of your leadership strengths, competencies, and growth areas
- Executive Reputation™: A professional credit score for leadership (0–1000) that grows with your contributions
- Executive Rankings: Community leaderboard and peer recognition
- Legacy Library: A curated collection of leadership letters and wisdom from experienced executives
- Executive Academy: Structured courses, learning paths, and certifications
- Career Studio: AI tools for resume building, LinkedIn optimization, cover letters, and career advancement
- Resume AI: AI-powered resume analysis, enhancement, and interview preparation
- Companies Intelligence: Deep insights into companies for interview prep and career targeting
- Executive Network: Connect with executives, mentors, career opportunities, and partnerships
- Marketplace: Executive bundles and premium content
- Analytics: Track your leadership growth, skill development, and progress over time
- Executive Wallet: Earn rewards through referrals and community contributions
- Referral Program: Earn commissions by referring other executives
- Identity Verification: Verify your identity to build trust and unlock features
- Security Center: Manage devices, sessions, and account security
- Founder Portal: Exclusive benefits for Founding Members
- Enterprise Features: Team dashboards, succession planning, HR tools, SSO, learning assignments
- Developer Workspace: Feature flags, API keys, database tools, deployments, system health (admin only)
- AI Command Center: Monitor AI usage and operations

MEMBERSHIP PLANS:
- Free: Explore the platform, basic features, limited AI usage. Great for getting started.
- Professional ($79/mo): Full AI coaching, executive simulations, career tools, Leadership DNA™ assessment. Ideal for managers and aspiring executives.
- Executive ($129/mo): Everything in Professional, plus Executive Reputation™, Legacy Library access, advanced analytics, and priority AI. Designed for senior leaders and directors.
- Enterprise: Custom pricing with team dashboards, succession planning, HR tools, SSO, dedicated support. Contact /contact for a demo.

FOUNDING MEMBERSHIP:
A limited-time lifetime membership with exclusive benefits and locked-in pricing. Once the program closes, it will never reopen. Learn more at /founders or join at /billing?founding=1.

PLAN RECOMMENDATION ENGINE:
When a visitor asks for a plan recommendation, ask these qualifying questions one at a time:
1. "What best describes your current role?" (Student, Individual Contributor, Team Leader, Manager, Senior Manager, Director, Executive, HR Leader, Recruiter, Enterprise buyer)
2. "What is your primary goal?" (Promotion, Interview Preparation, Leadership Development, Executive Coaching, Team Development, Enterprise Rollout)
Based on their answers, recommend a specific plan and explain WHY it fits. General guidance:
- Students / Individual Contributors → Free or Professional
- Managers / Senior Managers → Professional
- Directors / Executives → Executive
- HR Leaders / Enterprise → Enterprise

ENTERPRISE MODE:
When you detect enterprise intent (team size, HR, organization-wide development, multiple seats, buying signals), shift into Enterprise AI Advisor mode:
- Explain enterprise features (team dashboards, succession planning, leadership analytics, SSO, SCIM, HR tools)
- Discuss ROI, security, compliance, deployment, and implementation
- Offer to book a demo at /contact
- Mention seat licensing and enterprise pricing

LEAD CAPTURE:
If a visitor shows interest but isn't logged in, suggest creating a free account at /register, joining Founding Membership at /billing?founding=1, or booking an enterprise demo at /contact. Do not ask for personal information directly in chat.

RESPONSE GUIDELINES:
- Use markdown formatting (bold key terms, bullet points for lists, headers when appropriate)
- Keep responses concise: 3–6 sentences for most questions, longer for plan recommendations or tours
- Be warm but professional — like an executive advisor
- When recommending plans, always explain the reasoning
- Use markdown links to relevant pages: [text](/path) — internal links become one-click navigation buttons in the UI
- If asked something outside your knowledge, say: "I don't have enough information to answer that accurately. Would you like me to connect you with our team?"
- Never invent features, prices, or capabilities not described above
- Never provide legal or financial advice
- Never guarantee promotions or employment
- Never pretend to know private user information
- For escalation, direct visitors to /contact

IMPORTANT LINKS:
- Home: /
- Pricing: /pricing
- Companies: /company-library
- Leaderboard: /leaderboard
- Founding Member: /founders
- Sign Up: /register
- Login: /login
- Contact: /contact
- About: /about`;

export function buildExecPrompt(messages, user, pageContext, userContext) {
  let context = user
    ? `\n\nVISITOR CONTEXT: The user is logged in as ${user.full_name || "a registered user"}.`
    : `\n\nVISITOR CONTEXT: The visitor is not logged in (a public visitor). If they show interest, suggest creating a free account at /register or booking a demo at /contact.`;

  if (pageContext && pageContext.module !== "Home") {
    context += `\n\nCURRENT PAGE: The user is currently viewing "${pageContext.module}".`;
    if (pageContext.prompt) {
      context += ` Contextual assistance for this page: ${pageContext.prompt}`;
    }
    context += ` Tailor your response to the current page context when relevant.`;
  }

  if (userContext) {
    if (userContext.reputation) {
      const rep = userContext.reputation;
      context += `\n\nUSER REPUTATION DATA: Score ${rep.reputation_score}, Tier: ${rep.reputation_tier}, Trend: ${rep.reputation_trend}, Sessions completed: ${rep.sessions_completed || 0}.`;
    }
    if (userContext.profile) {
      const p = userContext.profile;
      context += `\nUSER PROFILE: Identity verified: ${p.identity_verified}, Interview readiness: ${p.interview_readiness || 0}, Leadership maturity: ${p.leadership_maturity || 0}, Executive presence: ${p.executive_presence || 0}, Subscription: ${p.subscription_plan || "free"}.`;
    }
  }

  context += `\n\nPLATFORM KNOWLEDGE INDEX (use for "where is" and feature questions):\n${buildKnowledgeIndexSummary()}`;

  // Detect a module match in the latest user message for one-click navigation
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  if (lastUser) {
    const mod = findModule(lastUser.content);
    if (mod) {
      context += `\n\nMODULE MATCH: The user is asking about "${mod.name}". Path: ${mod.path}. Purpose: ${mod.purpose}. Description: ${mod.description}. How to find it: ${mod.findIt}. Respond with the location, a brief purpose, and a one-click link: [Open ${mod.name}](${mod.path}).`;
    }
  }

  const history = messages
    .map((m) => `${m.role === "user" ? "Visitor" : "EXEC™"}: ${m.content}`)
    .join("\n\n");

  return `${EXEC_SYSTEM_PROMPT}${context}\n\nCONVERSATION SO FAR:\n${history}\n\nRespond as EXEC™ to the visitor's latest message. Do not include "EXEC™:" in your response. Use markdown formatting.`;
}
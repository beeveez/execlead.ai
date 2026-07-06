import { GitBranch, Lightbulb, Compass, AlertCircle, Trophy, Handshake, RefreshCw, Building2, Users, LayoutGrid, Mic } from "lucide-react";

export const LEGACY_SECTIONS = [
  { id: "major_decisions", label: "Major Decisions", icon: GitBranch, color: "indigo", desc: "Pivotal career-defining choices" },
  { id: "lessons_learned", label: "Lessons Learned", icon: Lightbulb, color: "amber", desc: "Wisdom gained through experience" },
  { id: "leadership_philosophy", label: "Leadership Philosophy", icon: Compass, color: "violet", desc: "Core principles that guide you" },
  { id: "failures", label: "Failures", icon: AlertCircle, color: "red", desc: "Setbacks that shaped your growth" },
  { id: "successes", label: "Successes", icon: Trophy, color: "emerald", desc: "Achievements and milestones" },
  { id: "negotiation_style", label: "Negotiation Style", icon: Handshake, color: "cyan", desc: "How you win at the table" },
  { id: "transformation_stories", label: "Transformation Stories", icon: RefreshCw, color: "blue", desc: "Organizational transformations led" },
  { id: "board_experiences", label: "Board Experiences", icon: Building2, color: "purple", desc: "Boardroom engagements and governance" },
  { id: "mentoring_sessions", label: "Mentoring Sessions", icon: Users, color: "teal", desc: "Leaders developed under your guidance" },
  { id: "decision_frameworks", label: "Decision Frameworks", icon: LayoutGrid, color: "orange", desc: "Mental models for complex choices" },
  { id: "recorded_conversations", label: "Recorded Conversations", icon: Mic, color: "pink", desc: "Dialogues worth preserving" },
];

export const SECTION_COLORS = {
  indigo: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  violet: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  red: "bg-red-500/10 text-red-400 border-red-500/20",
  emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  cyan: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  teal: "bg-teal-500/10 text-teal-400 border-teal-500/20",
  orange: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  pink: "bg-pink-500/10 text-pink-400 border-pink-500/20",
};

export const DEFAULT_DNA_SCORES = [
  { competency: "Communication", score: 92 },
  { competency: "Decision Quality", score: 88 },
  { competency: "Strategic Thinking", score: 90 },
  { competency: "Financial Thinking", score: 71 },
  { competency: "Coaching", score: 95 },
  { competency: "Innovation", score: 74 },
  { competency: "Executive Presence", score: 89 },
  { competency: "Commercial Thinking", score: 67 },
  { competency: "Risk Management", score: 91 },
];

export const INDUSTRIES = ["Technology", "Finance", "Healthcare", "Manufacturing", "Retail", "Energy", "Media", "Telecom", "Consulting", "Public Sector", "Education", "Other"];

export const RISK_LEVELS = ["low", "medium", "high"];

export const COMPANY_SIZES = ["Startup (<50)", "Small (50-250)", "Mid-market (250-1000)", "Enterprise (1000-10000)", "Large Enterprise (10000+)"];
export const LETTER_CATEGORIES = [
  "Letter to Future Leaders",
  "Leadership Lessons",
  "My Biggest Career Mistake",
  "Turning Point",
  "Lessons from Failure",
  "Lessons from Success",
  "My First Leadership Role",
  "Advice to New Managers",
  "Advice to Future CEOs",
  "Boardroom Reflections",
  "Digital Transformation Journey",
  "AI Leadership",
  "Executive Career Story",
  "Founder Story",
  "Retirement Reflections",
  "Legacy Letter",
];

export const CURATED_COLLECTIONS = [
  { id: "top_ceo", label: "Top CEO Letters", icon: "👑" },
  { id: "women_leadership", label: "Women in Leadership", icon: "♀️" },
  { id: "tech_leaders", label: "Technology Leaders", icon: "💻" },
  { id: "healthcare_leaders", label: "Healthcare Leaders", icon: "⚕️" },
  { id: "public_sector", label: "Public Sector Leaders", icon: "🏛️" },
  { id: "startup_founders", label: "Startup Founders", icon: "🚀" },
  { id: "board_directors", label: "Board Directors", icon: "📋" },
  { id: "ai_leadership", label: "AI Leadership", icon: "🤖" },
  { id: "future_work", label: "Future of Work", icon: "🔮" },
  { id: "crisis_leadership", label: "Leadership During Crisis", icon: "⚡" },
  { id: "career_growth", label: "Career Growth", icon: "📈" },
  { id: "executive_presence", label: "Executive Presence", icon: "✨" },
];

export const LEADERSHIP_LEVELS = [
  "C-Suite (CEO, CFO, CTO, etc.)",
  "SVP / EVP",
  "VP",
  "Director",
  "Senior Manager",
  "Manager",
  "Founder / Entrepreneur",
  "Board Member",
  "Advisor / Consultant",
];

export const INDUSTRIES = [
  "Technology", "Finance", "Healthcare", "Manufacturing", "Retail",
  "Education", "Government", "Non-Profit", "Media", "Energy",
  "Real Estate", "Transportation", "Legal", "Consulting", "Other",
];

export const REJECTION_REASONS = [
  { value: "spam", label: "Spam" },
  { value: "low_quality", label: "Low Quality" },
  { value: "duplicate", label: "Duplicate" },
  { value: "policy_violation", label: "Policy Violation" },
  { value: "incomplete", label: "Incomplete" },
  { value: "copyright_issue", label: "Copyright Issue" },
  { value: "other", label: "Other" },
];

export const REPORT_TYPES = [
  { value: "spam", label: "Spam" },
  { value: "offensive", label: "Offensive" },
  { value: "harassment", label: "Harassment" },
  { value: "misinformation", label: "Misinformation" },
  { value: "copyright", label: "Copyright" },
  { value: "other", label: "Other" },
];

export const FEATURED_TYPES = [
  { value: "featured", label: "Featured", icon: "Star" },
  { value: "pinned", label: "Pinned", icon: "Pin" },
  { value: "editors_pick", label: "Editor's Pick", icon: "Bookmark" },
  { value: "founders_choice", label: "Founder's Choice", icon: "Crown" },
  { value: "trending", label: "Trending", icon: "TrendingUp" },
  { value: "homepage_featured", label: "Homepage Featured", icon: "Home" },
];

export const MODERATOR_CHECKLIST = [
  "Professional tone",
  "Valuable leadership insight",
  "Original content",
  "No confidential information",
  "No hate speech",
  "No spam",
  "Grammar acceptable",
  "Suitable category",
  "Proper formatting",
  "Images appropriate",
  "Sources verified (if applicable)",
];

export const STATUS_LABELS = {
  draft: "Draft",
  pending_ai_review: "Pending AI Review",
  pending_human_review: "Pending Human Review",
  revision_requested: "Revision Requested",
  published: "Published",
  rejected: "Rejected",
  archived: "Archived",
};

export const STATUS_COLORS = {
  draft: "text-white/40 bg-white/5 border-white/10",
  pending_ai_review: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  pending_human_review: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  revision_requested: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  published: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  rejected: "text-red-400 bg-red-500/10 border-red-500/20",
  archived: "text-white/30 bg-white/5 border-white/10",
};

export const AI_RECOMMENDATION_LABELS = {
  approve: "Ready for Human Approval",
  needs_review: "Needs Human Review",
  reject: "AI Recommends Rejection",
};

export function formatCount(n) {
  if (!n) return "0";
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return String(n);
}

export function parseList(text) {
  if (!text) return [];
  return text.split("\n").map(s => s.trim()).filter(Boolean);
}

export function arrayToText(arr) {
  if (!arr || !Array.isArray(arr)) return "";
  return arr.join("\n");
}

export function scoreColor(score) {
  if (score >= 80) return "text-emerald-400";
  if (score >= 60) return "text-amber-400";
  if (score >= 40) return "text-orange-400";
  return "text-red-400";
}

export function scoreBg(score) {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 60) return "bg-amber-500";
  if (score >= 40) return "bg-orange-500";
  return "bg-red-500";
}
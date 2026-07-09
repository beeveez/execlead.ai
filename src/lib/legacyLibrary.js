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
export const ACHIEVEMENT_TYPES = {
  lesson_completed: { label: "Executive Lesson Completed", icon: "BookOpen", badge: "📚", color: "#6366f1" },
  learning_path_completed: { label: "Learning Path Completed", icon: "Route", badge: "🎯", color: "#10b981" },
  certificate_earned: { label: "Executive Certificate Earned", icon: "Award", badge: "🏆", color: "#f59e0b" },
  promotion_readiness: { label: "Promotion Readiness Score", icon: "TrendingUp", badge: "📈", color: "#06b6d4" },
  leadership_dna_milestone: { label: "Leadership DNA Milestone", icon: "Fingerprint", badge: "🧬", color: "#a855f7" },
  resume_score_improved: { label: "Resume Score Improved", icon: "FileText", badge: "📄", color: "#3b82f6" },
  ats_score_improved: { label: "ATS Score Improved", icon: "Search", badge: "🔍", color: "#8b5cf6" },
  interview_score: { label: "Interview Score", icon: "MessageSquare", badge: "💬", color: "#ec4899" },
  simulator_result: { label: "Executive Simulator Result", icon: "Brain", badge: "🧠", color: "#6366f1" },
  debate_victory: { label: "Debate Victory", icon: "Scale", badge: "⚖️", color: "#14b8a6" },
  council_completed: { label: "Executive Council Session", icon: "Users", badge: "👥", color: "#a855f7" },
  career_milestone: { label: "Career Milestone", icon: "Briefcase", badge: "💼", color: "#f97316" },
  certification_completed: { label: "Certification Completed", icon: "GraduationCap", badge: "🎓", color: "#10b981" },
  company_target: { label: "Company Target Selected", icon: "Building2", badge: "🏢", color: "#64748b" },
  promotion_achieved: { label: "Promotion Achieved", icon: "Rocket", badge: "🚀", color: "#ef4444" },
  new_subscription: { label: "New Subscription", icon: "Sparkles", badge: "✨", color: "#6366f1" },
  founding_member: { label: "Founding Member", icon: "Crown", badge: "👑", color: "#f59e0b" },
};

export const SHARE_PLATFORMS = {
  linkedin: { label: "LinkedIn", icon: "Briefcase", color: "#0A66C2", shareUrl: (url) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}` },
  twitter: { label: "X", icon: "MessageSquare", color: "#000000", shareUrl: (url, text) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}` },
  facebook: { label: "Facebook", icon: "ThumbsUp", color: "#1877F2", shareUrl: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
  threads: { label: "Threads", icon: "AtSign", color: "#000000", shareUrl: (url, text) => `https://threads.net/intent/post?text=${encodeURIComponent(text + " " + url)}` },
  whatsapp: { label: "WhatsApp", icon: "Phone", color: "#25D366", shareUrl: (url, text) => `https://wa.me/?text=${encodeURIComponent(text + " " + url)}` },
  telegram: { label: "Telegram", icon: "Send", color: "#0088cc", shareUrl: (url, text) => `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}` },
  email: { label: "Email", icon: "Mail", color: "#6b7280", shareUrl: (url, text) => `mailto:?subject=${encodeURIComponent("My Executive Leadership Journey on EXECLEAD.AI")}&body=${encodeURIComponent(text + "\n\n" + url)}` },
  copy: { label: "Copy Link", icon: "Copy", color: "#6b7280" },
};

export const PRIVACY_OPTIONS = [
  { value: "public", label: "Public", desc: "Anyone can see your achievement" },
  { value: "connections", label: "Connections Only", desc: "Only your network can see this" },
  { value: "private", label: "Private", desc: "Only you can see this" },
];

export const DEFAULT_REFERRAL_REWARDS = [
  { name: "First Referral", required_referrals: 1, reward_type: "free_months", reward_description: "1 month Professional free", months_rewarded: 1, plan_scope: "professional" },
  { name: "Leadership Circle", required_referrals: 5, reward_type: "plan_upgrade", reward_description: "Executive Plan for 3 months", months_rewarded: 3, plan_scope: "executive" },
  { name: "Enterprise Referral", required_referrals: 1, reward_type: "custom", reward_description: "Custom enterprise rewards", months_rewarded: 0, plan_scope: "enterprise" },
];

const ACTION_PHRASES = {
  lesson_completed: "completed an executive lesson",
  learning_path_completed: "completed a learning path",
  certificate_earned: "earned an executive certificate",
  promotion_readiness: "achieved a promotion readiness score",
  leadership_dna_milestone: "reached a Leadership DNA milestone",
  resume_score_improved: "improved my resume score",
  ats_score_improved: "improved my ATS score",
  interview_score: "completed an executive interview simulation",
  simulator_result: "completed an executive simulator session",
  debate_victory: "won an executive debate",
  council_completed: "completed an Executive Council session",
  career_milestone: "reached a career milestone",
  certification_completed: "completed a certification",
  company_target: "set my target company",
  promotion_achieved: "achieved a promotion",
  new_subscription: "started my executive leadership journey",
  founding_member: "became a Founding Member",
};

export function buildLinkedInPost({ achievementType, achievementTitle, userName, executiveScore, leadershipLevel, customMessage }) {
  if (customMessage) return customMessage;
  const action = ACTION_PHRASES[achievementType] || "achieved a milestone";
  const lines = [`I just ${action} on EXECLEAD.AI.`];
  if (executiveScore) lines.push(`Executive Score: ${executiveScore}/100`);
  if (leadershipLevel) lines.push(`Leadership Level: ${leadershipLevel}`);
  lines.push("", "My leadership journey continues as I prepare for executive roles.", "", "#Leadership #ExecutiveDevelopment #CareerGrowth #EXECLEAD");
  return lines.join("\n");
}

export function getUserReferralCode(userId) {
  if (!userId) return null;
  return `EXEC-${userId.replace(/-/g, "").toUpperCase().slice(0, 8)}`;
}

export function getShareUrl(referralCode) {
  const base = typeof window !== "undefined" ? window.location.origin : "https://execlead.ai";
  return referralCode ? `${base}/?ref=${referralCode}` : base;
}

export function getQrUrl(data) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(data)}`;
}

export function generateCertificateNumber() {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `CERT-${year}-${random}`;
}

export function captureReferralCode() {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const ref = params.get("ref");
  if (ref) localStorage.setItem("execlead_referral_code", ref);
  return ref;
}

export function getStoredReferralCode() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("execlead_referral_code");
}
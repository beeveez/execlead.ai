/**
 * EXECLEAD.AI — Social Sharing & Viral Growth Engine
 * Version 1.0
 *
 * One-click sharing across 12 destinations, branded smart share cards,
 * referral tracking, privacy controls, and share analytics.
 */

export const SHARE_VERSION = "1.0";
export const SHARE_CTA = "Advance your executive career with EXECLEAD.AI.";
export const SHARE_WEBSITE = "https://execlead.ai";

/* ------------------------------------------------------------------ */
/* ACHIEVEMENT TYPES (legacy — used by certificates & celebrations)    */
/* ------------------------------------------------------------------ */
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

/* ------------------------------------------------------------------ */
/* SHARE TYPES — what users can share across the platform             */
/* ------------------------------------------------------------------ */
export const SHARE_TYPES = {
  landing: { label: "EXECLEAD.AI Platform", badge: "🚀", color: "#6366f1", phrase: "Exploring executive leadership development on EXECLEAD.AI" },
  dashboard: { label: "Executive Dashboard", badge: "📊", color: "#06b6d4", phrase: "Tracking my executive growth on EXECLEAD.AI" },
  leadership_dna: { label: "Leadership DNA Score", badge: "🧬", color: "#a855f7", phrase: "discovered my Leadership DNA profile" },
  promotion_readiness: { label: "Promotion Readiness Score", badge: "📈", color: "#06b6d4", phrase: "reached a Promotion Readiness score" },
  learning_path: { label: "Completed Learning Path", badge: "🎯", color: "#10b981", phrase: "completed an executive learning path" },
  certificate: { label: "Executive Certificate", badge: "🏆", color: "#f59e0b", phrase: "earned an executive certificate" },
  resume_score: { label: "Resume Health Score", badge: "📄", color: "#3b82f6", phrase: "improved my Resume Health Score" },
  career_milestone: { label: "Career Milestone", badge: "💼", color: "#f97316", phrase: "reached a career milestone" },
  interview_success: { label: "Interview Success", badge: "💬", color: "#ec4899", phrase: "completed an executive interview challenge" },
  council_insight: { label: "Executive Council Insight", badge: "👥", color: "#a855f7", phrase: "gained strategic insight from the Executive Council" },
  marketplace: { label: "Marketplace Resource", badge: "📚", color: "#6366f1", phrase: "found executive intelligence on the EXECLEAD Marketplace" },
  company: { label: "Company Intelligence", badge: "🏢", color: "#64748b", phrase: "Exploring Executive Company Intelligence on EXECLEAD.AI" },
  referral: { label: "Referral Link", badge: "🎁", color: "#f59e0b", phrase: "inviting colleagues to advance their executive careers on EXECLEAD.AI" },
};

/* ------------------------------------------------------------------ */
/* SHARE DESTINATIONS — 12 platforms + native + QR + copy             */
/* ------------------------------------------------------------------ */
export const SHARE_PLATFORMS = {
  linkedin: { label: "LinkedIn", icon: "Briefcase", color: "#0A66C2", shareUrl: (url, text) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}` },
  twitter: { label: "X", icon: "MessageSquare", color: "#000000", shareUrl: (url, text) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}` },
  facebook: { label: "Facebook", icon: "ThumbsUp", color: "#1877F2", shareUrl: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
  threads: { label: "Threads", icon: "AtSign", color: "#000000", shareUrl: (url, text) => `https://threads.net/intent/post?text=${encodeURIComponent(text + " " + url)}` },
  bluesky: { label: "Bluesky", icon: "Cloud", color: "#1185FE", shareUrl: (url, text) => `https://bsky.app/intent/compose?text=${encodeURIComponent(text + " " + url)}` },
  whatsapp: { label: "WhatsApp", icon: "Phone", color: "#25D366", shareUrl: (url, text) => `https://wa.me/?text=${encodeURIComponent(text + " " + url)}` },
  telegram: { label: "Telegram", icon: "Send", color: "#0088cc", shareUrl: (url, text) => `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}` },
  messenger: { label: "Messenger", icon: "MessageCircle", color: "#7B61FF", shareUrl: (url) => `https://www.facebook.com/dialog/send?link=${encodeURIComponent(url)}&app_id=execlead&redirect_uri=${encodeURIComponent(url)}` },
  reddit: { label: "Reddit", icon: "Newspaper", color: "#FF4500", shareUrl: (url, text) => `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}` },
  email: { label: "Email", icon: "Mail", color: "#6b7280", shareUrl: (url, text) => `mailto:?subject=${encodeURIComponent("My Executive Leadership Journey on EXECLEAD.AI")}&body=${encodeURIComponent(text + "\n\n" + url)}` },
  copy: { label: "Copy Link", icon: "Copy", color: "#6b7280" },
  native: { label: "More", icon: "Share2", color: "#6b7280" },
};

export const PLATFORM_ORDER = ["linkedin", "twitter", "facebook", "threads", "bluesky", "whatsapp", "telegram", "messenger", "reddit", "email", "copy", "native"];

/* ------------------------------------------------------------------ */
/* PRIVACY & SETTINGS                                                 */
/* ------------------------------------------------------------------ */
export const PRIVACY_OPTIONS = [
  { value: "public", label: "Public", desc: "Anyone can see your achievement" },
  { value: "organization_only", label: "Organization Only", desc: "Only your organization members can see this" },
  { value: "connections", label: "Connections Only", desc: "Only your network can see this" },
  { value: "private", label: "Private", desc: "Only you can see this" },
];

export const HIDE_OPTIONS = [
  { key: "hide_name", label: "Name" },
  { key: "hide_score", label: "Scores" },
  { key: "hide_company", label: "Company" },
  { key: "hide_resume", label: "Resume" },
  { key: "hide_personal_info", label: "Personal Info" },
];

/** Content that must NEVER be shared unless explicitly approved by the user. */
export const PRIVACY_RESTRICTED = [
  "Resume contents", "Private coaching sessions", "Executive Council discussions",
  "Organization data", "Internal analytics", "Personal information",
];

/* ------------------------------------------------------------------ */
/* REFERRAL PROGRAM                                                   */
/* ------------------------------------------------------------------ */
export const DEFAULT_REFERRAL_REWARDS = [
  { name: "First Referral", required_referrals: 1, reward_type: "free_months", reward_description: "1 month Professional free", months_rewarded: 1, plan_scope: "professional" },
  { name: "Leadership Circle", required_referrals: 5, reward_type: "plan_upgrade", reward_description: "Executive Plan for 3 months", months_rewarded: 3, plan_scope: "executive" },
  { name: "Enterprise Referral", required_referrals: 1, reward_type: "custom", reward_description: "Custom enterprise rewards", months_rewarded: 0, plan_scope: "enterprise" },
];

/* ------------------------------------------------------------------ */
/* MESSAGE BUILDERS                                                   */
/* ------------------------------------------------------------------ */
const ACHIEVEMENT_PHRASES = {
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

export function buildShareMessage({ shareType, achievementType, title, userName, score, level, customMessage }) {
  if (customMessage) return customMessage;

  let phrase;
  if (shareType && SHARE_TYPES[shareType]) {
    phrase = SHARE_TYPES[shareType].phrase;
  } else if (achievementType && ACHIEVEMENT_PHRASES[achievementType]) {
    phrase = ACHIEVEMENT_PHRASES[achievementType];
  } else {
    phrase = "achieved a milestone";
  }

  const isAction = phrase.startsWith("reached") || phrase.startsWith("achieved") || phrase.startsWith("completed") ||
    phrase.startsWith("improved") || phrase.startsWith("discovered") || phrase.startsWith("earned") ||
    phrase.startsWith("won") || phrase.startsWith("set") || phrase.startsWith("started") || phrase.startsWith("became") ||
    phrase.startsWith("gained") || phrase.startsWith("inviting") || phrase.startsWith("found");

  const lines = [];
  if (shareType === "landing" || shareType === "company" || shareType === "marketplace" || shareType === "referral") {
    lines.push(phrase);
  } else if (shareType === "council_insight") {
    lines.push(`I ${phrase} on EXECLEAD.AI.`);
  } else {
    lines.push(`I just ${phrase} on EXECLEAD.AI.`);
  }

  if (title && shareType !== "landing") lines.push(title);
  if (score) lines.push(`Score: ${score}`);
  if (level) lines.push(`Level: ${level}`);

  lines.push("", SHARE_CTA, "", "#Leadership #ExecutiveDevelopment #CareerGrowth #EXECLEAD");
  return lines.join("\n");
}

/** Legacy alias for backward compatibility. */
export function buildLinkedInPost(opts) {
  return buildShareMessage({ ...opts, achievementType: opts.achievementType });
}

/* ------------------------------------------------------------------ */
/* REFERRAL & URL HELPERS                                             */
/* ------------------------------------------------------------------ */
export function getUserReferralCode(userId) {
  if (!userId) return null;
  return `EXEC-${userId.replace(/-/g, "").toUpperCase().slice(0, 8)}`;
}

export function getShareUrl(referralCode) {
  const base = typeof window !== "undefined" ? window.location.origin : SHARE_WEBSITE;
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

/* ------------------------------------------------------------------ */
/* NATIVE SHARE API (mobile)                                          */
/* ------------------------------------------------------------------ */
export function canNativeShare() {
  return typeof navigator !== "undefined" && typeof navigator.share === "function";
}

export async function nativeShare({ title, text, url }) {
  if (!canNativeShare()) return false;
  try {
    await navigator.share({ title: title || "EXECLEAD.AI", text, url });
    return true;
  } catch (e) {
    return false;
  }
}

/* ------------------------------------------------------------------ */
/* SHARE ANALYTICS                                                    */
/* ------------------------------------------------------------------ */
export async function trackShareEvent({ shareType, achievementType, title, platform, privacy, settings, score, level, referralCode, userId }) {
  try {
    const { base44 } = await import("@/api/base44Client");
    await base44.entities.ShareEvent.create({
      achievement_type: shareType || achievementType || "career_milestone",
      achievement_title: title,
      platform,
      privacy_level: privacy || "public",
      hide_name: !!settings?.hide_name,
      hide_score: !!settings?.hide_score,
      hide_company: !!settings?.hide_company,
      hide_resume: !!settings?.hide_resume,
      hide_personal_info: !!settings?.hide_personal_info,
      executive_score: score,
      leadership_level: level,
      referrer_user_id: userId,
      referral_code: referralCode,
    });
  } catch (e) {}
}

/** Resolve a unified config object (badge, color, label) from either a share type or achievement. */
export function resolveShareConfig(shareType, achievementType) {
  if (shareType && SHARE_TYPES[shareType]) return { ...SHARE_TYPES[shareType], kind: "share" };
  if (achievementType && ACHIEVEMENT_TYPES[achievementType]) return { ...ACHIEVEMENT_TYPES[achievementType], kind: "achievement" };
  return { ...SHARE_TYPES.landing, kind: "share" };
}
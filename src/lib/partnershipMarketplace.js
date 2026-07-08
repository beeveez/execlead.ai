import {
  Briefcase, Users, Lightbulb, Handshake, GitMerge, Rocket,
  GraduationCap, Megaphone, Mic, Wrench, TrendingUp, Cpu,
  Building2, FlaskConical, Brain, Share2, Landmark, DollarSign,
  Star, Crown, Zap, Award, BadgeCheck,
} from "lucide-react";

// ============================================================
// PARTNERSHIP CATEGORIES (19 types)
// ============================================================
export const CATEGORIES = [
  { id: "fractional_executive", label: "Fractional Executive", icon: Briefcase },
  { id: "board_opportunities", label: "Board Opportunities", icon: Users },
  { id: "advisory_roles", label: "Advisory Roles", icon: Lightbulb },
  { id: "strategic_partnerships", label: "Strategic Partnerships", icon: Handshake },
  { id: "joint_ventures", label: "Joint Ventures", icon: GitMerge },
  { id: "startup_cofounder", label: "Startup Co-Founder Search", icon: Rocket },
  { id: "executive_mentorship", label: "Executive Mentorship", icon: GraduationCap },
  { id: "executive_coaching", label: "Executive Coaching", icon: Megaphone },
  { id: "speaking_engagements", label: "Speaking Engagements", icon: Mic },
  { id: "consulting_projects", label: "Consulting Projects", icon: Wrench },
  { id: "investment_opportunities", label: "Investment Opportunities", icon: TrendingUp },
  { id: "technology_partnerships", label: "Technology Partnerships", icon: Cpu },
  { id: "enterprise_collaboration", label: "Enterprise Collaboration", icon: Building2 },
  { id: "university_collaboration", label: "University Collaboration", icon: FlaskConical },
  { id: "research_partnerships", label: "Research Partnerships", icon: Brain },
  { id: "ai_product_partnerships", label: "AI Product Partnerships", icon: Cpu },
  { id: "channel_partnerships", label: "Channel Partnerships", icon: Share2 },
  { id: "government_partnerships", label: "Government Partnerships", icon: Landmark },
  { id: "venture_capital", label: "Venture Capital Opportunities", icon: DollarSign },
];

// ============================================================
// PARTNER TYPES (11 types)
// ============================================================
export const PARTNER_TYPES = [
  { id: "enterprise", label: "Enterprise" },
  { id: "startup", label: "Startup" },
  { id: "venture_capital", label: "Venture Capital" },
  { id: "private_equity", label: "Private Equity" },
  { id: "executive_search", label: "Executive Search Firm" },
  { id: "university", label: "University" },
  { id: "government", label: "Government Agency" },
  { id: "technology", label: "Technology Company" },
  { id: "consulting", label: "Consulting Firm" },
  { id: "event_organizer", label: "Event Organizer" },
  { id: "verified_executive", label: "Verified Executive" },
];

// ============================================================
// LISTING TIERS (monetization)
// ============================================================
export const LISTING_TIERS = [
  { id: "basic", label: "Basic Listing", price: 99, color: "text-white/60", badge: "" },
  { id: "featured", label: "Featured Listing", price: 299, color: "text-indigo-400", badge: "Featured" },
  { id: "premium", label: "Premium Listing", price: 599, color: "text-amber-400", badge: "Premium" },
  { id: "urgent", label: "Urgent Listing", price: 199, color: "text-red-400", badge: "Urgent" },
  { id: "sponsored", label: "Sponsored Listing", price: 499, color: "text-emerald-400", badge: "Sponsored" },
];

export const LISTING_STATUSES = [
  { id: "open", label: "Open", color: "bg-emerald-500/10 text-emerald-400" },
  { id: "closed", label: "Closed", color: "bg-white/5 text-white/40" },
  { id: "filled", label: "Filled", color: "bg-blue-500/10 text-blue-400" },
  { id: "draft", label: "Draft", color: "bg-white/5 text-white/30" },
  { id: "archived", label: "Archived", color: "bg-white/5 text-white/20" },
];

export const WORK_MODELS = [
  { id: "remote", label: "Remote" },
  { id: "hybrid", label: "Hybrid" },
  { id: "onsite", label: "Onsite" },
];

export const EXECUTIVE_LEVELS = [
  { id: "c_level", label: "C-Level" },
  { id: "svp", label: "SVP" },
  { id: "vp", label: "VP" },
  { id: "director", label: "Director" },
  { id: "head", label: "Head" },
  { id: "board", label: "Board" },
  { id: "global", label: "Global" },
];

export const STARTUP_STAGES = [
  { id: "pre_seed", label: "Pre-Seed" },
  { id: "seed", label: "Seed" },
  { id: "series_a", label: "Series A" },
  { id: "series_b", label: "Series B" },
  { id: "series_c", label: "Series C" },
  { id: "growth", label: "Growth" },
  { id: "public", label: "Public" },
];

export const SPONSORED_BADGES = [
  { id: "featured", label: "Featured", color: "bg-indigo-500/15 text-indigo-300", icon: Star },
  { id: "sponsored", label: "Sponsored", color: "bg-emerald-500/15 text-emerald-300", icon: Crown },
  { id: "urgent", label: "Urgent Hiring", color: "bg-red-500/15 text-red-300", icon: Zap },
  { id: "executive_pick", label: "Executive Pick", color: "bg-amber-500/15 text-amber-300", icon: Award },
  { id: "verified_partner", label: "Verified Partner", color: "bg-blue-500/15 text-blue-300", icon: BadgeCheck },
];

export const INTEREST_STATUSES = [
  { id: "pending", label: "Pending", color: "bg-amber-500/10 text-amber-400" },
  { id: "accepted", label: "Accepted", color: "bg-emerald-500/10 text-emerald-400" },
  { id: "rejected", label: "Rejected", color: "bg-red-500/10 text-red-400" },
  { id: "withdrawn", label: "Withdrawn", color: "bg-white/5 text-white/30" },
  { id: "meeting_scheduled", label: "Meeting Scheduled", color: "bg-blue-500/10 text-blue-400" },
  { id: "closed", label: "Closed", color: "bg-white/5 text-white/20" },
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================
export function getCategory(id) {
  return CATEGORIES.find(c => c.id === id) || { id, label: id?.replace(/_/g, " "), icon: Briefcase };
}
export function getPartnerType(id) {
  return PARTNER_TYPES.find(p => p.id === id) || { id, label: id?.replace(/_/g, " ") };
}
export function getListingTier(id) {
  return LISTING_TIERS.find(t => t.id === id) || LISTING_TIERS[0];
}
export function getListingStatus(id) {
  return LISTING_STATUSES.find(s => s.id === id) || LISTING_STATUSES[0];
}
export function getWorkModel(id) {
  return WORK_MODELS.find(w => w.id === id) || { id, label: id };
}
export function getExecutiveLevel(id) {
  return EXECUTIVE_LEVELS.find(e => e.id === id) || { id, label: id };
}
export function getStartupStage(id) {
  return STARTUP_STAGES.find(s => s.id === id) || { id, label: id };
}
export function getInterestStatus(id) {
  return INTEREST_STATUSES.find(s => s.id === id) || INTEREST_STATUSES[0];
}

export function getSponsoredBadges(listing) {
  const badges = [];
  if (listing.is_featured) badges.push(SPONSORED_BADGES[0]);
  if (listing.is_sponsored) badges.push(SPONSORED_BADGES[1]);
  if (listing.is_urgent) badges.push(SPONSORED_BADGES[2]);
  if (listing.is_executive_pick) badges.push(SPONSORED_BADGES[3]);
  if (listing.is_verified_partner) badges.push(SPONSORED_BADGES[4]);
  return badges;
}

export function formatCompensation(listing) {
  if (!listing) return "Competitive";
  const parts = [];
  if (listing.compensation) parts.push(listing.compensation);
  if (listing.equity_percent > 0) parts.push(`${listing.equity_percent}% equity`);
  if (listing.retainer) parts.push(`${listing.retainer} retainer`);
  if (listing.hourly_rate > 0) parts.push(`$${listing.hourly_rate}/hr`);
  if (listing.revenue_share_percent > 0) parts.push(`${listing.revenue_share_percent}% rev share`);
  return parts.length > 0 ? parts.join(" • ") : "Competitive";
}

export function formatRelative(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;
  const days = Math.floor(diff / 86400000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export function formatDeadline(dateStr) {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  const now = new Date();
  const diff = date - now;
  const days = Math.ceil(diff / 86400000);
  if (days < 0) return { label: "Expired", color: "text-red-400" };
  if (days === 0) return { label: "Today", color: "text-red-400" };
  if (days <= 3) return { label: `${days}d left`, color: "text-amber-400" };
  if (days <= 7) return { label: `${days}d left`, color: "text-yellow-400" };
  return { label: `${days}d left`, color: "text-white/40" };
}

export function getMatchColor(score) {
  if (score >= 85) return { text: "text-emerald-400", bg: "bg-emerald-500/10", ring: "ring-emerald-500/30" };
  if (score >= 70) return { text: "text-indigo-400", bg: "bg-indigo-500/10", ring: "ring-indigo-500/30" };
  if (score >= 55) return { text: "text-amber-400", bg: "bg-amber-500/10", ring: "ring-amber-500/30" };
  return { text: "text-white/40", bg: "bg-white/5", ring: "ring-white/10" };
}

export function getMatchLabel(score) {
  if (score >= 85) return "Excellent Match";
  if (score >= 70) return "Strong Match";
  if (score >= 55) return "Good Match";
  return "Fair Match";
}
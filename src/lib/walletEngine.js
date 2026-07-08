/**
 * EXECLEAD.AI — Executive Wallet Engine
 * Static definitions for ambassador levels, reward tiers, withdrawal methods,
 * spending categories, transaction types, and commission statuses.
 */
import {
  CreditCard, Crown, Users, RefreshCw, MessageSquare, Cpu, Fingerprint,
  FileText, Brain, Building2, Store, GraduationCap, Award, Boxes, Gift, Calendar,
} from "lucide-react";

export const AMBASSADOR_LEVELS = [
  { level: "diamond", label: "Diamond", min: 10000, color: "#b9f2ff", icon: "💠", commission_bonus: 20, benefits: ["20% extra commission", "Diamond badge", "50% marketplace discount", "Private Diamond lounge", "All beta features", "Founder VIP events", "Priority support"] },
  { level: "platinum", label: "Platinum", min: 5000, color: "#e5e4e2", icon: "💎", commission_bonus: 15, benefits: ["15% extra commission", "Platinum badge", "40% marketplace discount", "Private Platinum community", "Early beta access", "Priority support"] },
  { level: "gold", label: "Gold", min: 1000, color: "#ffd700", icon: "🥇", commission_bonus: 12, benefits: ["12% extra commission", "Gold badge", "25% marketplace discount", "Private Gold community", "Beta feature access"] },
  { level: "silver", label: "Silver", min: 500, color: "#c0c0c0", icon: "🥈", commission_bonus: 8, benefits: ["8% extra commission", "Silver badge", "15% marketplace discount", "Private Silver community"] },
  { level: "bronze", label: "Bronze", min: 100, color: "#cd7f32", icon: "🥉", commission_bonus: 5, benefits: ["5% extra commission", "Bronze badge", "10% marketplace discount"] },
];

export const REWARD_TIERS = [
  { tier: "legend", label: "EXECLEAD Legend", min: 500, icon: "💎", benefits: ["Ultimate badge", "30% bonus commission", "Lifetime VIP status", "Exclusive legend merchandise"] },
  { tier: "partner", label: "Elite Executive Partner", min: 100, icon: "👑", benefits: ["Elite badge", "20% bonus commission", "Exclusive rewards", "Founder event invitations"] },
  { tier: "champion", label: "Executive Champion", min: 50, icon: "🏆", benefits: ["Champion badge", "15% bonus commission", "Premium templates", "VIP event access"] },
  { tier: "ambassador", label: "Leadership Ambassador", min: 25, icon: "🏅", benefits: ["Ambassador badge", "10% bonus commission", "Marketplace discounts"] },
  { tier: "influencer", label: "Executive Influencer", min: 10, icon: "🌟", benefits: ["Influencer badge", "5% bonus commission", "Community perks"] },
  { tier: "supporter", label: "Executive Supporter", min: 1, icon: "⭐", benefits: ["Supporter badge", "Community recognition"] },
];

export const WITHDRAWAL_METHODS = [
  { value: "bank_transfer", label: "Bank Transfer", icon: "🏦", fields: ["Account Holder Name", "Bank Name", "Account Number", "Routing / SWIFT Code"] },
  { value: "paypal", label: "PayPal", icon: "🅿️", fields: ["PayPal Email"] },
  { value: "wise", label: "Wise", icon: "🌍", fields: ["Wise Email or Account ID"] },
  { value: "payoneer", label: "Payoneer", icon: "💳", fields: ["Payoneer Email or Account ID"] },
  { value: "stripe_connect", label: "Stripe Connect", icon: "⚡", fields: ["Stripe Connected Account Email"] },
];

export const WAYS_TO_SPEND = [
  { label: "Professional Subscription", icon: CreditCard, category: "Subscriptions" },
  { label: "Executive Subscription", icon: Crown, category: "Subscriptions" },
  { label: "Enterprise Seat Upgrades", icon: Users, category: "Subscriptions" },
  { label: "Subscription Renewal", icon: RefreshCw, category: "Subscriptions" },
  { label: "Executive Coach Credits", icon: MessageSquare, category: "AI Features" },
  { label: "AI Credits", icon: Cpu, category: "AI Features" },
  { label: "Leadership DNA Reports", icon: Fingerprint, category: "AI Features" },
  { label: "Resume Intelligence", icon: FileText, category: "AI Features" },
  { label: "Executive Simulator Sessions", icon: Brain, category: "AI Features" },
  { label: "Company Intelligence Reports", icon: Building2, category: "Intelligence" },
  { label: "Marketplace Products", icon: Store, category: "Marketplace" },
  { label: "Executive Academy Courses", icon: GraduationCap, category: "Education" },
  { label: "Certification Programs", icon: Award, category: "Education" },
  { label: "Premium Templates", icon: Boxes, category: "Marketplace" },
  { label: "Exclusive Founder Merchandise", icon: Gift, category: "Exclusive" },
  { label: "VIP Events", icon: Calendar, category: "Exclusive" },
  { label: "Community Membership", icon: Users, category: "Exclusive" },
];

export const COMMISSION_STATUS = {
  pending: { label: "Pending", color: "#f59e0b", bg: "bg-amber-500/10", text: "text-amber-400" },
  approved: { label: "Approved", color: "#3b82f6", bg: "bg-blue-500/10", text: "text-blue-400" },
  paid: { label: "Paid", color: "#10b981", bg: "bg-emerald-500/10", text: "text-emerald-400" },
  rejected: { label: "Rejected", color: "#ef4444", bg: "bg-red-500/10", text: "text-red-400" },
  expired: { label: "Expired", color: "#6b7280", bg: "bg-gray-500/10", text: "text-gray-400" },
  fraud_review: { label: "Fraud Review", color: "#dc2626", bg: "bg-red-500/10", text: "text-red-400" },
  cancelled: { label: "Cancelled", color: "#6b7280", bg: "bg-gray-500/10", text: "text-gray-400" },
  refunded: { label: "Refunded", color: "#8b5cf6", bg: "bg-purple-500/10", text: "text-purple-400" },
};

export const TRANSACTION_TYPES = {
  referral_commission: { label: "Referral Commission", icon: "👥", positive: true },
  founder_bonus: { label: "Founder Bonus", icon: "👑", positive: true },
  subscription_purchase: { label: "Subscription Purchase", icon: "💳", positive: false },
  subscription_renewal: { label: "Subscription Renewal", icon: "🔄", positive: false },
  marketplace_purchase: { label: "Marketplace Purchase", icon: "🛒", positive: false },
  ai_credits: { label: "AI Credits", icon: "🤖", positive: false },
  refund: { label: "Refund", icon: "↩️", positive: true },
  withdrawal: { label: "Withdrawal", icon: "🏦", positive: false },
  bonus_credit: { label: "Bonus Credit", icon: "🎁", positive: true },
  manual_adjustment: { label: "Manual Adjustment", icon: "⚙️", positive: null },
  wallet_credit: { label: "Wallet Credit", icon: "💰", positive: true },
};

export const TRANSACTION_STATUS = {
  pending: { label: "Pending", bg: "bg-amber-500/10", text: "text-amber-400" },
  approved: { label: "Approved", bg: "bg-blue-500/10", text: "text-blue-400" },
  processing: { label: "Processing", bg: "bg-indigo-500/10", text: "text-indigo-400" },
  completed: { label: "Completed", bg: "bg-emerald-500/10", text: "text-emerald-400" },
  rejected: { label: "Rejected", bg: "bg-red-500/10", text: "text-red-400" },
  cancelled: { label: "Cancelled", bg: "bg-gray-500/10", text: "text-gray-400" },
  expired: { label: "Expired", bg: "bg-gray-500/10", text: "text-gray-400" },
};

export const MONEY_FLOW_STEPS = [
  { step: 1, label: "Referral Link Shared", icon: "🔗" },
  { step: 2, label: "Visitor Clicks Link", icon: "🖱️" },
  { step: 3, label: "Visitor Registers", icon: "📝" },
  { step: 4, label: "Referral Recorded", icon: "✅" },
  { step: 5, label: "Subscription Purchased", icon: "💳" },
  { step: 6, label: "Commission Generated", icon: "⚙️" },
  { step: 7, label: "Fraud Validation", icon: "🛡️" },
  { step: 8, label: "Approved", icon: "✅" },
  { step: 9, label: "Wallet Credited", icon: "💰" },
];

export function formatWalletCurrency(amount) {
  return `$${(amount || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function getAmbassadorLevelForEarnings(lifetimeEarnings) {
  for (const l of AMBASSADOR_LEVELS) {
    if (lifetimeEarnings >= l.min) return l;
  }
  return { level: "none", label: "None", min: 0, color: "#666", icon: "⚪", commission_bonus: 0, benefits: ["Standard commission"] };
}

export function getRewardTierForReferrals(lifetimeReferrals) {
  for (const t of REWARD_TIERS) {
    if (lifetimeReferrals >= t.min) return t;
  }
  return { tier: "none", label: "None", min: 0, icon: "⚪", benefits: [] };
}

export function getNextAmbassadorLevel(lifetimeEarnings) {
  for (const l of [...AMBASSADOR_LEVELS].reverse()) {
    if (lifetimeEarnings < l.min) return l;
  }
  return null;
}

export function getNextRewardTier(lifetimeReferrals) {
  for (const t of [...REWARD_TIERS].reverse()) {
    if (lifetimeReferrals < t.min) return t;
  }
  return null;
}
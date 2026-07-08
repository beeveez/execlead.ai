import { base44 } from "@/api/base44Client";

// ============================================================
// MEMBERSHIP PROGRAM ENGINE
// Independent of subscription plans. A user may belong to one
// subscription plan AND zero or more membership programs.
// Membership benefits layer on top of the subscription — they
// modify pricing, unlock perks, and assign badges without
// changing the underlying plan.
// ============================================================

export const PROGRAM_TYPES = {
  founding_member: { label: "Founding Member", icon: "🏆", color: "#f59e0b", prefix: "FM" },
  beta_tester: { label: "Beta Tester", icon: "🧪", color: "#3b82f6", prefix: "BT" },
  ambassador: { label: "Ambassador", icon: "🌟", color: "#a855f7", prefix: "AM" },
  partner: { label: "Partner", icon: "🤝", color: "#10b981", prefix: "PT" },
  internal_staff: { label: "Internal Staff", icon: "👤", color: "#6b7280", prefix: "IS" },
  advisory_council: { label: "Advisory Council", icon: "🎓", color: "#8b5cf6", prefix: "AC" },
  custom: { label: "Custom Program", icon: "✨", color: "#6366f1", prefix: "CP" },
};

export const MEMBERSHIP_STATUSES = {
  active: { label: "Active", color: "text-emerald-400", bg: "bg-emerald-500/10", dot: "bg-emerald-400" },
  suspended: { label: "Suspended", color: "text-amber-400", bg: "bg-amber-500/10", dot: "bg-amber-400" },
  expired: { label: "Expired", color: "text-white/40", bg: "bg-white/5", dot: "bg-white/30" },
  revoked: { label: "Revoked", color: "text-red-400", bg: "bg-red-500/10", dot: "bg-red-400" },
  pending: { label: "Pending", color: "text-blue-400", bg: "bg-blue-500/10", dot: "bg-blue-400" },
};

export const BENEFIT_FIELDS = [
  { key: "community_access", label: "Community Access", description: "Access to exclusive member community" },
  { key: "early_feature_access", label: "Early Feature Access", description: "Priority access to new features before public release" },
  { key: "roadmap_voting", label: "Roadmap Voting", description: "Vote on future platform capabilities" },
  { key: "feedback_sessions", label: "Founder Feedback Sessions", description: "Invitations to roadmap previews and feedback sessions" },
  { key: "referral_bonus_enabled", label: "Referral Bonuses", description: "Earn rewards for referring new members" },
];

// Format a sequential membership number: FM-000001
export function formatMembershipNumber(prefix, sequence) {
  return `${prefix || "CP"}-${String(sequence || 1).padStart(6, "0")}`;
}

// A membership is active if status is active and not expired
export function isMembershipActive(membership) {
  if (!membership) return false;
  if (membership.status !== "active") return false;
  if (membership.is_lifetime) return true;
  if (membership.expires_at && new Date(membership.expires_at) < new Date()) return false;
  return true;
}

// Best (highest) discount percentage across all active memberships
export function getBestMembershipDiscount(memberships = []) {
  const active = memberships.filter(isMembershipActive);
  if (active.length === 0) return 0;
  return Math.max(...active.map((m) => m.discount_percentage || 0));
}

// Apply membership pricing to a base price — the core pricing integration.
// Returns the adjusted price plus metadata for display.
export function applyMembershipPricing(basePrice, memberships = []) {
  const discount = getBestMembershipDiscount(memberships);
  if (discount <= 0 || basePrice <= 0) {
    return { price: basePrice, originalPrice: basePrice, discount: 0, savings: 0, applied: false };
  }
  const adjusted = Math.round(basePrice * (1 - discount / 100) * 100) / 100;
  return {
    price: adjusted,
    originalPrice: basePrice,
    discount,
    savings: Math.round((basePrice - adjusted) * 100) / 100,
    applied: true,
  };
}

// Whether any active membership grants lifetime pricing protection
export function hasLifetimePricingProtection(memberships = []) {
  return memberships.filter(isMembershipActive).some((m) => m.lifetime_pricing_protection);
}

// Union of all benefit flags across active memberships
export function getCombinedBenefits(memberships = []) {
  const active = memberships.filter(isMembershipActive);
  return {
    community_access: active.some((m) => m.community_access),
    early_feature_access: active.some((m) => m.early_feature_access),
    roadmap_voting: active.some((m) => m.roadmap_voting),
    feedback_sessions: active.some((m) => m.feedback_sessions),
    referral_bonus_enabled: active.some((m) => m.referral_bonus_enabled),
  };
}

// Fetch all membership programs (admin)
export async function getMembershipPrograms() {
  try {
    return await base44.entities.MembershipProgram.list("sort_order", 100);
  } catch (e) {
    return [];
  }
}

// Fetch active programs only (public)
export async function getActiveMembershipPrograms() {
  try {
    const all = await getMembershipPrograms();
    return all.filter((p) => p.is_active);
  } catch (e) {
    return [];
  }
}

// Fetch all memberships for a user
export async function getUserMemberships(userId) {
  if (!userId) return [];
  try {
    return await base44.entities.UserMembership.filter({ user_id: userId }, "-created_date", 50);
  } catch (e) {
    return [];
  }
}

// Fetch only active memberships for a user
export async function getUserActiveMemberships(userId) {
  const all = await getUserMemberships(userId);
  return all.filter(isMembershipActive);
}

// Fetch all members enrolled in a program
export async function getProgramMembers(programId) {
  try {
    return await base44.entities.UserMembership.filter({ program_id: programId }, "-created_date", 500);
  } catch (e) {
    return [];
  }
}

// Enroll a user into a program — generates the next sequential
// membership number, snapshots the benefit configuration, and
// increments the program's sequence counter.
export async function enrollUserInProgram({ program, user, assignedBy }) {
  const seq = program.next_sequence || 1;
  const membershipNumber = formatMembershipNumber(program.membership_number_prefix, seq);

  const benefits = {
    community_access: program.community_access,
    early_feature_access: program.early_feature_access,
    roadmap_voting: program.roadmap_voting,
    feedback_sessions: program.feedback_sessions,
    referral_bonus_enabled: program.referral_bonus_enabled,
    referral_bonus_amount: program.referral_bonus_amount || 0,
  };

  let expiresAt = null;
  let isLifetime = true;
  if (program.benefit_duration_type === "time_limited" && program.benefit_duration_days > 0) {
    isLifetime = false;
    const d = new Date();
    d.setDate(d.getDate() + program.benefit_duration_days);
    expiresAt = d.toISOString();
  }

  const membership = await base44.entities.UserMembership.create({
    user_id: user.id,
    user_name: user.full_name || user.email || "",
    user_email: user.email || "",
    program_id: program.id,
    program_name: program.name,
    program_type: program.program_type,
    membership_number: membershipNumber,
    status: "active",
    joined_date: new Date().toISOString().split("T")[0],
    expires_at: expiresAt,
    is_lifetime: isLifetime,
    discount_percentage: program.discount_percentage || 0,
    lifetime_pricing_protection: program.lifetime_pricing_protection || false,
    benefits_json: JSON.stringify(benefits),
    badge: program.exclusive_badge || program.name,
    badge_color: program.badge_color || program.color || "#f59e0b",
    assigned_by_id: assignedBy?.id || "",
    assigned_by_name: assignedBy?.name || "",
    notes: "",
  });

  await base44.entities.MembershipProgram.update(program.id, {
    next_sequence: seq + 1,
    enrolled_count: (program.enrolled_count || 0) + 1,
  });

  return membership;
}

// Change a membership's status (suspend, revoke, reactivate)
export async function updateMembershipStatus(membershipId, status) {
  return await base44.entities.UserMembership.update(membershipId, { status });
}

// Delete a membership record
export async function revokeMembership(membershipId) {
  return await base44.entities.UserMembership.delete(membershipId);
}

// Create a default program template for a given type
export function createDefaultProgram(programType = "custom") {
  const meta = PROGRAM_TYPES[programType] || PROGRAM_TYPES.custom;
  return {
    name: "",
    slug: "",
    description: "",
    program_type: programType,
    is_active: true,
    campaign_start_date: "",
    campaign_end_date: "",
    max_participants: 0,
    benefit_duration_type: "lifetime",
    benefit_duration_days: 0,
    discount_percentage: 0,
    lifetime_pricing_protection: false,
    exclusive_badge: "",
    badge_color: meta.color,
    community_access: false,
    early_feature_access: false,
    roadmap_voting: false,
    feedback_sessions: false,
    referral_bonus_enabled: false,
    referral_bonus_amount: 0,
    membership_number_prefix: meta.prefix,
    next_sequence: 1,
    icon: meta.icon,
    color: meta.color,
    sort_order: 0,
    enrolled_count: 0,
  };
}
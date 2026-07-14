/**
 * Beta Program Engine™
 * ============================================================
 * Manages the Founding Private Beta Program™ lifecycle, stages,
 * feature flag tiers, and application review workflow.
 *
 * Beta Stages (progressive rollout):
 *   1. founding_private_beta — 50-100 invited users, application only
 *   2. early_access           — 300-500 users, invite codes
 *   3. open_beta              — Public registration, waitlist if needed
 *   4. general_availability   — Open to everyone, paid subscriptions
 *
 * Beta Tiers (feature flags):
 *   • founding_beta   — Founding Private Beta™ flag
 *   • private_beta    — Private Beta™ flag
 *   • exec_beta       — EXEC Beta™ flag
 *   • enterprise_beta — Enterprise Beta™ flag
 *   • commercial_beta — Commercial Beta™ flag
 */

import { base44 } from "@/api/base44Client";

export const BETA_STAGES = {
  founding_private_beta: {
    id: "founding_private_beta",
    label: "Founding Private Beta",
    description: "50–100 invited users. Application-only access.",
    ctaLabel: "Apply for Private Beta",
    maxUsers: 100,
    registrationMode: "application",
    color: "#f59e0b",
    version: "RC1",
    icon: "🚀",
  },
  early_access: {
    id: "early_access",
    label: "Early Access",
    description: "300–500 users. Invite code registration.",
    ctaLabel: "Join Early Access",
    maxUsers: 500,
    registrationMode: "invite_code",
    color: "#6366f1",
    version: "RC2",
    icon: "✨",
  },
  open_beta: {
    id: "open_beta",
    label: "Open Beta",
    description: "Public registration. Waitlist if capacity exceeded.",
    ctaLabel: "Join Beta",
    maxUsers: null,
    registrationMode: "public_waitlist",
    color: "#06b6d4",
    version: "Beta",
    icon: "🌐",
  },
  general_availability: {
    id: "general_availability",
    label: "General Availability",
    description: "Open to everyone. Paid subscriptions active.",
    ctaLabel: "Start Free",
    maxUsers: null,
    registrationMode: "open",
    color: "#10b981",
    version: "GA",
    icon: "✅",
  },
};

export const BETA_TIERS = {
  founding_beta: {
    id: "founding_beta",
    label: "Founding Beta™",
    description: "Founding Private Beta feature flag — earliest access tier",
    color: "#f59e0b",
  },
  private_beta: {
    id: "private_beta",
    label: "Private Beta™",
    description: "Private Beta feature flag — application-approved users",
    color: "#6366f1",
  },
  exec_beta: {
    id: "exec_beta",
    label: "EXEC Beta™",
    description: "EXEC Beta feature flag — executive coaching features",
    color: "#06b6d4",
  },
  enterprise_beta: {
    id: "enterprise_beta",
    label: "Enterprise Beta™",
    description: "Enterprise Beta feature flag — enterprise dashboard features",
    color: "#8b5cf6",
  },
  commercial_beta: {
    id: "commercial_beta",
    label: "Commercial Beta™",
    description: "Commercial Beta feature flag — marketplace & commerce features",
    color: "#10b981",
  },
};

export const APPLICATION_STATUSES = {
  pending: { id: "pending", label: "Pending Review", color: "#f59e0b", bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20" },
  approved: { id: "approved", label: "Approved", color: "#10b981", bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
  waitlisted: { id: "waitlisted", label: "Waitlisted", color: "#6366f1", bg: "bg-indigo-500/10", text: "text-indigo-400", border: "border-indigo-500/20" },
  rejected: { id: "rejected", label: "Rejected", color: "#ef4444", bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20" },
  invited: { id: "invited", label: "Invited", color: "#06b6d4", bg: "bg-cyan-500/10", text: "text-cyan-400", border: "border-cyan-500/20" },
  activated: { id: "activated", label: "Activated", color: "#10b981", bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
  withdrawn: { id: "withdrawn", label: "Withdrawn", color: "#64748b", bg: "bg-slate-500/10", text: "text-slate-400", border: "border-slate-500/20" },
};

export const LEADERSHIP_LEVELS = {
  individual_contributor: "Individual Contributor",
  team_lead: "Team Lead / Supervisor",
  manager: "Manager",
  senior_manager: "Senior Manager",
  director: "Director",
  senior_director: "Senior Director",
  vp: "Vice President",
  svp: "Senior Vice President",
  c_suite: "C-Level Executive",
  founder: "Founder / Business Owner",
  consultant: "Consultant",
  other: "Other",
};

export const TEAM_SIZE_OPTIONS = {
  individual: "Individual (No Direct Reports)",
  "1_5": "1–5",
  "6_10": "6–10",
  "11_25": "11–25",
  "26_50": "26–50",
  "51_100": "51–100",
  "101_250": "101–250",
  "251_500": "251–500",
  "500_plus": "500+",
};

export const HOW_HEARD_OPTIONS = {
  linkedin: "LinkedIn",
  twitter: "Twitter / X",
  facebook: "Facebook",
  youtube: "YouTube",
  reddit: "Reddit",
  google_search: "Google Search",
  ai_assistant: "ChatGPT / AI Assistant",
  friend_colleague: "Friend or Colleague",
  employer: "Employer",
  conference_event: "Conference / Event",
  newsletter: "Newsletter",
  direct_invitation: "Direct Invitation",
  other: "Other",
};

/**
 * Sanitize a { key: label } options object into a clean array of
 * { value, label } objects.
 *
 * Pipeline:
 *   1. Convert object → array
 *   2. Filter out null / undefined / "" / whitespace-only labels
 *   3. Remove duplicate labels (case-insensitive)
 *   4. Optionally sort alphabetically by label
 *   5. Optionally move "Other" to the end
 */
function sanitizeOptions(obj, { sort = false, otherLast = false } = {}) {
  const entries = Object.entries(obj)
    .filter(([, label]) => typeof label === "string" && label.trim().length > 0)
    .map(([value, label]) => ({ value, label: label.trim() }));

  const seen = new Set();
  const deduped = entries.filter((opt) => {
    const key = opt.label.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  let result = deduped;
  if (sort) {
    result = deduped
      .filter((opt) => opt.value !== "other")
      .sort((a, b) => a.label.localeCompare(b.label));
    const other = deduped.find((opt) => opt.value === "other");
    if (other) result.push(other);
  } else if (otherLast) {
    result = deduped.filter((opt) => opt.value !== "other");
    const other = deduped.find((opt) => opt.value === "other");
    if (other) result.push(other);
  }

  return result;
}

export function getLeadershipLevelOptions() {
  return sanitizeOptions(LEADERSHIP_LEVELS, { otherLast: true });
}

export function getTeamSizeOptions() {
  return sanitizeOptions(TEAM_SIZE_OPTIONS);
}

export function getHowHeardOptions() {
  return sanitizeOptions(HOW_HEARD_OPTIONS, { sort: true, otherLast: true });
}

/**
 * Form Lookup Registry™ — metadata for developer mode.
 * Returns an array of lookup field descriptors with live validation.
 */
export function getFormLookupRegistry() {
  const now = new Date().toISOString();
  const fields = [
    { field_name: "Leadership Level", data_source: "betaProgramEngine.LEADERSHIP_LEVELS", getter: getLeadershipLevelOptions, fallback_source: "Built-in defaults (no external dependency)" },
    { field_name: "Team Size", data_source: "betaProgramEngine.TEAM_SIZE_OPTIONS", getter: getTeamSizeOptions, fallback_source: "Built-in defaults (no external dependency)" },
    { field_name: "How did you hear about EXECLEAD.AI?", data_source: "betaProgramEngine.HOW_HEARD_OPTIONS", getter: getHowHeardOptions, fallback_source: "Built-in defaults (no external dependency)" },
  ];

  return fields.map(({ field_name, data_source, getter, fallback_source }) => {
    let options = [];
    let load_status = "loaded";
    let validation_status = "passed";
    try {
      options = getter();
      if (!Array.isArray(options) || options.length === 0) {
        load_status = "empty";
        validation_status = "failed";
      }
    } catch {
      options = [];
      load_status = "error";
      validation_status = "failed";
    }
    return {
      field_name,
      data_source,
      option_count: options.length,
      load_status,
      last_refresh: now,
      fallback_source,
      validation_status,
    };
  });
}

/**
 * Current beta stage — controlled by platform configuration.
 * Defaults to founding_private_beta.
 * Can be overridden via PaymentSettings.beta_stage or env.
 */
export const CURRENT_BETA_STAGE = "founding_private_beta";

/**
 * Beta Metrics Mode — global configuration for public-facing beta counters.
 *   "live"  — Fetch actual BetaApplication records from the database.
 *             If no records exist, counters are replaced with non-numeric
 *             launch status indicators (no fabricated numbers shown).
 *   "demo"  — Show clearly labeled sample/preview values for staging or
 *             demo environments. A "Preview Data" badge is displayed above
 *             the counters so values are never mistaken for live metrics.
 */
export const BETA_METRICS_MODE = "live";

/**
 * Get the current beta stage configuration.
 */
export function getCurrentBetaStage() {
  return BETA_STAGES[CURRENT_BETA_STAGE] || BETA_STAGES.founding_private_beta;
}

/**
 * Submit a beta application.
 */
export async function submitBetaApplication(formData) {
  return await base44.entities.BetaApplication.create({
    ...formData,
    status: "pending",
    beta_tier: "founding_beta",
    beta_stage: CURRENT_BETA_STAGE,
    is_active_beta_user: false,
  });
}

/**
 * Review an application — approve, waitlist, or reject.
 */
export async function reviewApplication(applicationId, decision, reviewData = {}, reviewer = null) {
  const update = {
    status: decision,
    reviewed_at: new Date().toISOString(),
    reviewed_by_id: reviewer?.id || "system",
    reviewed_by_name: reviewer?.full_name || "System",
    ...reviewData,
  };

  if (decision === "approved") {
    update.is_active_beta_user = true;
  }

  return await base44.entities.BetaApplication.update(applicationId, update);
}

/**
 * Send invitation to an approved applicant.
 */
export async function sendInvitation(applicationId) {
  return await base44.entities.BetaApplication.update(applicationId, {
    status: "invited",
    invitation_sent_at: new Date().toISOString(),
  });
}

/**
 * Mark an invited applicant as activated (account created).
 */
export async function activateBetaUser(applicationId, userId) {
  return await base44.entities.BetaApplication.update(applicationId, {
    status: "activated",
    activated_at: new Date().toISOString(),
    user_id: userId,
    is_active_beta_user: true,
  });
}

/**
 * Get beta program statistics for the admin center.
 */
export async function getBetaProgramStats() {
  try {
    const all = await base44.entities.BetaApplication.list("-created_date", 500);
    return {
      total: all.length,
      pending: all.filter((a) => a.status === "pending").length,
      approved: all.filter((a) => a.status === "approved").length,
      waitlisted: all.filter((a) => a.status === "waitlisted").length,
      rejected: all.filter((a) => a.status === "rejected").length,
      invited: all.filter((a) => a.status === "invited").length,
      activated: all.filter((a) => a.status === "activated").length,
      activeBetaUsers: all.filter((a) => a.is_active_beta_user).length,
      capacity: BETA_STAGES[CURRENT_BETA_STAGE].maxUsers || Infinity,
      capacityUsedPct: BETA_STAGES[CURRENT_BETA_STAGE].maxUsers
        ? Math.round((all.filter((a) => a.is_active_beta_user).length / BETA_STAGES[CURRENT_BETA_STAGE].maxUsers) * 100)
        : 0,
      tierBreakdown: Object.keys(BETA_TIERS).reduce((acc, tier) => {
        acc[tier] = all.filter((a) => a.beta_tier === tier).length;
        return acc;
      }, {}),
    };
  } catch {
    return {
      total: 0, pending: 0, approved: 0, waitlisted: 0, rejected: 0,
      invited: 0, activated: 0, activeBetaUsers: 0, capacity: 100, capacityUsedPct: 0,
      tierBreakdown: {},
    };
  }
}
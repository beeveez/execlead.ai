import { getCurrentPlatformMode, usePlatformLaunchMode } from "@/lib/launchMode";

// ============================================================
// Beta-Aware Membership Recommendation Engine™
// ------------------------------------------------------------
// Maps the platform's release phase to a Commercial Lifecycle
// status and produces recommendations that match actual
// commercial availability. During Private Beta the primary
// recommendation is always the Founding Executive Beta — never
// a General Availability subscription plan.
// ============================================================

export const COMMERCIAL_STATUS = {
  private_beta: { id: "private_beta", label: "Private Beta", isBeta: true, gaAvailable: false },
  public_beta: { id: "public_beta", label: "Public Beta", isBeta: true, gaAvailable: false },
  general_availability: { id: "general_availability", label: "General Availability", isBeta: false, gaAvailable: true },
};

const MODE_TO_COMMERCIAL = {
  internal_development: "private_beta",
  developer_preview: "private_beta",
  founding_private_beta: "private_beta",
  early_access: "private_beta",
  open_beta: "public_beta",
  general_availability: "general_availability",
};

export function getCommercialStatus() {
  const mode = getCurrentPlatformMode();
  return COMMERCIAL_STATUS[MODE_TO_COMMERCIAL[mode.id] || "private_beta"];
}

export function useCommercialStatus() {
  const { isBeta } = usePlatformLaunchMode();
  return { ...getCommercialStatus(), isBeta };
}

// ⭐ Founding Executive Beta — primary recommendation during Private Beta
export const FOUNDING_EXECUTIVE_BETA = {
  id: "founding_executive_beta",
  name: "Founding Executive Beta",
  status: "Applications Open",
  headline: "Join the Founding Executive Beta",
  description:
    "Become one of the first professionals to experience EXECLEAD.AI before public launch. Help shape the platform through direct feedback while receiving exclusive Founding Member benefits.",
  benefits: [
    "Early access to all eligible beta capabilities",
    "Lifetime Founding Member pricing (if offered)",
    "Priority feature access",
    "Direct influence on product development",
    "Founding Member recognition",
    "Early access to new AI capabilities",
  ],
  primaryCta: { label: "Apply for Beta", href: "/beta" },
  secondaryCta: { label: "Learn About Founding Membership", href: "/founders" },
};

// GA plans shown as future availability during beta
export const GA_FUTURE_PLAN_LABELS = {
  professional: {
    badge: "Available at General Availability",
    description:
      "Designed for professionals ready to accelerate their leadership journey after public launch.",
    cta: "Notify Me at Launch",
  },
  executive: {
    badge: "Available at General Availability",
    description:
      "Designed for senior leaders seeking advanced Executive Intelligence™, Executive Identity™, and enterprise-level leadership development.",
    cta: "Notify Me at Launch",
  },
};

// Predictive Membership Path™
export const PREDICTIVE_MEMBERSHIP_PATH = [
  { id: "today", label: "Today" },
  { id: "apply", label: "Apply for Founding Executive Beta" },
  { id: "assess", label: "Complete Executive Readiness Assessment™" },
  { id: "coach", label: "Receive AI Coaching™" },
  { id: "feedback", label: "Provide Feedback" },
  { id: "ga", label: "General Availability" },
  { id: "transition", label: "Transition to Professional or Executive Membership" },
];

// Executive Options Analysis™
export const BETA_OPTIONS_ANALYSIS = [
  {
    id: "founding_executive_beta",
    rank: 1,
    name: "Founding Executive Beta",
    recommended: true,
    status: "Now",
    pros: [
      "Early access",
      "Exclusive Founding Member benefits",
      "Opportunity to shape EXECLEAD.AI",
      "Potential lifetime pricing",
      "Priority access to new features",
    ],
    cons: ["Beta features may continue evolving"],
    risk: "Very Low",
    confidence: 99,
    availability: "Now",
  },
  {
    id: "professional",
    rank: 2,
    name: "Professional",
    recommended: false,
    status: "Available at General Availability",
    pros: ["AI Executive Coaching™", "Executive Simulations™", "Leadership DNA™", "Executive Readiness™"],
    cons: ["Not available during Private Beta"],
    risk: "Low",
    availability: "GA",
  },
  {
    id: "executive",
    rank: 3,
    name: "Executive",
    recommended: false,
    status: "Available at General Availability",
    pros: ["Executive Identity™", "Executive Reputation™", "Advanced Executive Intelligence™", "Premium analytics"],
    cons: ["Not available during Private Beta"],
    risk: "Low",
    availability: "GA",
  },
];

// Map a Plan Finder goal → the GA plan the user would transition to at GA
export const GOAL_TO_FUTURE_PLAN = {
  explore: "professional",
  first: "professional",
  director: "executive",
  lead: "executive",
  develop: "enterprise",
};

// AI Membership Recommendation™ — the message EXEC™ delivers during Private Beta
export const PRIVATE_BETA_RECOMMENDATION_MESSAGE = `Based on your goals, my recommendation is to apply for the Founding Executive Beta.

EXECLEAD.AI is currently in Private Beta, which means the best way to begin your leadership journey is by joining the Founding Member program.

If accepted, you'll receive early access to the platform, help shape its evolution through feedback, and may qualify for exclusive Founding Member benefits before General Availability.

Once EXECLEAD.AI reaches General Availability, I'll recommend the most appropriate subscription plan based on your Executive Readiness™, leadership goals, and platform usage.`;

export const FOUNDING_MEMBER_MESSAGING =
  "You're joining EXECLEAD.AI at the beginning of its journey. Founding Members receive early access, influence the platform's future through feedback, and may secure exclusive benefits before General Availability.";
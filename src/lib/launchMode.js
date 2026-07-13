import { base44 } from "@/api/base44Client";

// ============================================================
// EXECLEAD.AI — Platform Launch Mode™
// ------------------------------------------------------------
// Controls the platform's public-facing behavior based on the
// current release stage. Each mode changes CTAs, registration
// gating, and messaging automatically — no UI rebuild needed
// when transitioning to General Availability.
//
// Platform Launch Modes:
//   internal_development  — internal testing
//   developer_preview     — limited developer access
//   founding_private_beta — invitation-only beta (ACTIVE)
//   early_access          — invite code registration
//   open_beta             — public registration with waitlist
//   general_availability  — open to everyone, paid subscriptions
//
// Payment Launch Modes (legacy, still used for billing behavior):
//   development  — simulated payments
//   public_beta  — no payment processing
//   production   — live payment providers
// ============================================================

export const PLATFORM_LAUNCH_MODES = {
  internal_development: {
    id: "internal_development",
    label: "Internal Development",
    description: "Internal testing — not publicly accessible.",
    color: "#94a3b8",
    icon: "🧪",
    version: "Dev",
    registrationMode: "closed",
    isBeta: true,
    showPricing: false,
  },
  developer_preview: {
    id: "developer_preview",
    label: "Developer Preview",
    description: "Limited developer access for feedback and testing.",
    color: "#a855f7",
    icon: "🔬",
    version: "Preview",
    registrationMode: "invite_code",
    isBeta: true,
    showPricing: false,
  },
  founding_private_beta: {
    id: "founding_private_beta",
    label: "Founding Private Beta™",
    description: "Invitation-only beta. Application required.",
    color: "#f59e0b",
    icon: "🚀",
    version: "RC1",
    buildLabel: "Release Candidate 1",
    registrationMode: "application",
    isBeta: true,
    showPricing: true,
    ctaLabels: {
      free: "Apply for Private Beta™",
      professional: "Join Founding Beta™",
      executive: "Join Executive Beta™",
      enterprise: "Request Enterprise Beta™",
      primary: "Apply for Private Beta™",
      secondary: "Request Enterprise Beta™",
      learnMore: "Learn More™",
    },
  },
  early_access: {
    id: "early_access",
    label: "Early Access",
    description: "Invite code registration. Expanding access.",
    color: "#6366f1",
    icon: "✨",
    version: "RC2",
    registrationMode: "invite_code",
    isBeta: true,
    showPricing: true,
    ctaLabels: {
      free: "Join Early Access",
      professional: "Join Founding Beta™",
      executive: "Join Executive Beta™",
      enterprise: "Request Enterprise Beta™",
      primary: "Join Early Access",
      secondary: "Request Enterprise Beta™",
      learnMore: "Learn More™",
    },
  },
  open_beta: {
    id: "open_beta",
    label: "Open Beta",
    description: "Public registration open. Waitlist if capacity exceeded.",
    color: "#06b6d4",
    icon: "🌐",
    version: "Beta",
    registrationMode: "public_waitlist",
    isBeta: true,
    showPricing: true,
    ctaLabels: {
      free: "Join Beta",
      professional: "Start Free Trial",
      executive: "Start Free Trial",
      enterprise: "Request Enterprise Beta™",
      primary: "Join Beta",
      secondary: "Contact Sales",
      learnMore: "Learn More™",
    },
  },
  general_availability: {
    id: "general_availability",
    label: "General Availability",
    description: "Open to everyone. Paid subscriptions active.",
    color: "#10b981",
    icon: "✅",
    version: "GA",
    registrationMode: "open",
    isBeta: false,
    showPricing: true,
    ctaLabels: {
      free: "Start Free",
      professional: "Start 14-Day Trial",
      executive: "Start 14-Day Trial",
      enterprise: "Configure Proposal",
      primary: "Start Free",
      secondary: "Contact Sales",
      learnMore: "Learn More",
    },
  },
};

/**
 * Current Platform Launch Mode.
 * Change this single value to transition the entire platform.
 */
export const CURRENT_PLATFORM_MODE = "founding_private_beta";

export function getCurrentPlatformMode() {
  return PLATFORM_LAUNCH_MODES[CURRENT_PLATFORM_MODE] || PLATFORM_LAUNCH_MODES.founding_private_beta;
}

export function isBetaMode() {
  return getCurrentPlatformMode().isBeta;
}

export function isRegistrationOpen() {
  return getCurrentPlatformMode().registrationMode === "open";
}

export function isApplicationRequired() {
  const mode = getCurrentPlatformMode();
  return mode.registrationMode === "application" || mode.registrationMode === "invite_code";
}

export function isPaymentEnabled() {
  return getCurrentPlatformMode().id === "general_availability";
}

export function getBetaTierLink(planId) {
  const tierMap = {
    free: "founding_beta",
    professional: "founding_beta",
    executive: "exec_beta",
    enterprise: "enterprise_beta",
  };
  return `/beta?tier=${tierMap[planId] || "founding_beta"}`;
}

/**
 * Get the CTA label for a plan, respecting the current launch mode.
 */
export function getPlanCta(planId) {
  const mode = getCurrentPlatformMode();
  if (mode.ctaLabels && mode.ctaLabels[planId]) {
    return mode.ctaLabels[planId];
  }
  // GA fallback
  const gaLabels = PLATFORM_LAUNCH_MODES.general_availability.ctaLabels;
  return gaLabels[planId] || "Start Free";
}

export function getPrimaryCta() {
  return getCurrentPlatformMode().ctaLabels?.primary || "Start Free";
}

export function getSecondaryCta() {
  return getCurrentPlatformMode().ctaLabels?.secondary || "Contact Sales";
}

export function getLearnMoreCta() {
  return getCurrentPlatformMode().ctaLabels?.learnMore || "Learn More";
}

// ============================================================
// Legacy Payment Launch Mode (billing behavior)
// ============================================================

export const LAUNCH_MODES = {
  development: {
    id: "development",
    label: "Development",
    description: "Internal testing — simulated payments, no real transactions.",
    color: "#94a3b8",
    icon: "🧪",
  },
  public_beta: {
    id: "public_beta",
    label: "Public Beta",
    description: "Public registrations open. Payments coming soon. Founding Member reservations active.",
    color: "#f59e0b",
    icon: "🚀",
  },
  production: {
    id: "production",
    label: "Production",
    description: "Live payment providers enabled. Subscriptions activated automatically.",
    color: "#10b981",
    icon: "✅",
  },
};

export const PROVIDER_STATUSES = {
  not_connected: { id: "not_connected", label: "Not Connected", color: "#ef4444", betaBilling: true },
  simulation: { id: "simulation", label: "Simulation", color: "#a855f7", betaBilling: true },
  test_mode: { id: "test_mode", label: "Test Mode", color: "#f59e0b", betaBilling: true },
  live: { id: "live", label: "Live", color: "#10b981", betaBilling: false },
};

function mapProviderStatus(settings) {
  if (!settings) return "not_connected";
  if (settings.status === "connected") return "live";
  if (settings.status === "pending") return "test_mode";
  if (settings.status === "error") return "not_connected";
  return "not_connected";
}

export function deriveLaunchMode(providerStatusId, explicitMode) {
  if (explicitMode && explicitMode !== "auto") return explicitMode;
  if (providerStatusId === "live") return "production";
  if (providerStatusId === "simulation") return "development";
  return "public_beta";
}

let cachedSettings = null;
let cacheExpiry = 0;
const CACHE_TTL = 30000;

function computeState(settings) {
  const providerStatusId = mapProviderStatus(settings);
  const explicitMode = settings?.launch_mode || "auto";
  const launchModeId = deriveLaunchMode(providerStatusId, explicitMode);
  return {
    settings,
    launchModeId,
    launchMode: LAUNCH_MODES[launchModeId],
    providerStatusId,
    providerStatus: PROVIDER_STATUSES[providerStatusId],
    betaBillingMode: PROVIDER_STATUSES[providerStatusId].betaBilling,
    paymentsLive: providerStatusId === "live",
  };
}

export async function getLaunchState() {
  const now = Date.now();
  if (cachedSettings && now < cacheExpiry) {
    return computeState(cachedSettings);
  }
  try {
    const settings = await base44.entities.PaymentSettings.list();
    cachedSettings = settings[0] || null;
    cacheExpiry = now + CACHE_TTL;
    return computeState(cachedSettings);
  } catch (e) {
    return computeState(null);
  }
}

export function clearLaunchStateCache() {
  cachedSettings = null;
  cacheExpiry = 0;
}

// ============================================================
// React hooks
// ============================================================
import { useState, useEffect } from "react";

export function useLaunchMode() {
  const [state, setState] = useState({
    betaBillingMode: true,
    paymentsLive: false,
    launchModeId: "public_beta",
    launchMode: LAUNCH_MODES.public_beta,
    providerStatusId: "not_connected",
    providerStatus: PROVIDER_STATUSES.not_connected,
    loading: true,
  });

  useEffect(() => {
    getLaunchState()
      .then((s) => setState({ ...s, loading: false }))
      .catch(() => setState((prev) => ({ ...prev, loading: false })));
  }, []);

  return state;
}

/**
 * Hook for the Platform Launch Mode™ system.
 * Returns the current platform mode config + helper flags.
 */
export function usePlatformLaunchMode() {
  const mode = getCurrentPlatformMode();
  return {
    mode,
    isBeta: mode.isBeta,
    isApplicationRequired: isApplicationRequired(),
    isRegistrationOpen: isRegistrationOpen(),
    isPaymentEnabled: isPaymentEnabled(),
    showPricing: mode.showPricing,
    ctaLabels: mode.ctaLabels || {},
  };
}
import { base44 } from "@/api/base44Client";

// ============================================================
// EXECLEAD.AI — Launch Mode & Beta Billing Strategy
// ------------------------------------------------------------
// Allows the platform to launch publicly even when no live
// payment gateway is connected. Three launch modes:
//
//   development  — internal testing, simulated payments
//   public_beta  — public registrations, no payment processing,
//                  founding member reservations instead
//   production   — live payment providers, recurring billing
//
// When the payment provider is NOT connected, Beta Billing Mode
// is automatically enabled: premium plans stay visible, but
// "Subscribe" buttons become "Reserve My Founding Membership".
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

/**
 * Maps the raw PaymentSettings.status to a provider status.
 * disconnected/error → not_connected, pending → test_mode, connected → live.
 */
function mapProviderStatus(settings) {
  if (!settings) return "not_connected";
  if (settings.status === "connected") return "live";
  if (settings.status === "pending") return "test_mode";
  if (settings.status === "error") return "not_connected";
  return "not_connected"; // disconnected
}

/**
 * Derives the launch mode from the provider status, unless an
 * explicit override is set on PaymentSettings.launch_mode.
 */
export function deriveLaunchMode(providerStatusId, explicitMode) {
  if (explicitMode && explicitMode !== "auto") return explicitMode;
  if (providerStatusId === "live") return "production";
  if (providerStatusId === "simulation") return "development";
  return "public_beta";
}

let cachedSettings = null;
let cacheExpiry = 0;
const CACHE_TTL = 30000; // 30 seconds

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

/**
 * Returns the full launch state, derived from PaymentSettings.
 * Cached for 30s to avoid repeated API calls.
 */
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
    // Default to beta billing mode if settings can't be loaded —
    // this ensures the platform never blocks on a missing config.
    return computeState(null);
  }
}

export function clearLaunchStateCache() {
  cachedSettings = null;
  cacheExpiry = 0;
}

// ============================================================
// React hook for components
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
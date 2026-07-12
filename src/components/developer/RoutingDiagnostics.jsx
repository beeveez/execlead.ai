import React, { useState } from "react";
import { Activity, ChevronDown, ChevronUp } from "lucide-react";
import {
  getFailsafeState,
  evaluateOnboardingState,
} from "@/lib/onboardingStateManager";
import { getSessionContext } from "@/lib/sessionRestore";

/**
 * Routing Diagnostics™
 * ============================================================
 * Hidden developer panel showing the full routing decision state.
 * Only visible to admin/developer users.
 *
 * Displays:
 *   - Authentication Status
 *   - Runtime Profile Loaded
 *   - Onboarding Status
 *   - Current / Previous Route
 *   - Redirect Reason
 *   - Destination
 *   - Workspace
 *   - Cache / Session Version
 *   - Failsafe State
 *   - All Safeguard Signals
 */
export default function RoutingDiagnostics({
  user,
  profile,
  loadingProfile,
  profileError,
  profileLoadAttempted,
  isAuthenticated,
  activeWorkspace,
  currentRoute,
  decision,
  redirectReason,
}) {
  const [expanded, setExpanded] = useState(false);

  const session = getSessionContext();
  const failsafe = getFailsafeState();
  const onboardingState = evaluateOnboardingState(profile, user);

  // Hidden — only visible to admin/developer users
  const isDev = user?.role === "admin" || user?.role === "developer";
  if (!isDev) return null;

  const rows = [
    {
      label: "Authentication Status",
      value: isAuthenticated ? "✓ Authenticated" : "✗ Not Authenticated",
      color: isAuthenticated ? "text-emerald-400" : "text-red-400",
    },
    {
      label: "Runtime Profile Loaded",
      value: profile
        ? "✓ Loaded"
        : profileError
        ? "✗ Load Failed"
        : "○ Not Found",
      color: profile
        ? "text-emerald-400"
        : profileError
        ? "text-red-400"
        : "text-amber-400",
    },
    {
      label: "Profile Load Attempted",
      value: profileLoadAttempted ? "✓ Yes" : "✗ No",
      color: profileLoadAttempted ? "text-emerald-400" : "text-amber-400",
    },
    {
      label: "Profile Loading",
      value: loadingProfile ? "○ Loading..." : "✓ Complete",
      color: loadingProfile ? "text-amber-400" : "text-emerald-400",
    },
    {
      label: "Profile Error",
      value: profileError || "—",
      color: profileError ? "text-red-400" : "text-white/50",
    },
    {
      label: "Onboarding Status",
      value: onboardingState.status,
      color: onboardingState.isComplete
        ? "text-emerald-400"
        : "text-amber-400",
    },
    {
      label: "Onboarding Reason",
      value: onboardingState.reason,
      color: "text-white/50",
    },
    {
      label: "Current Route",
      value: currentRoute,
      color: "text-white/70",
    },
    {
      label: "Previous Route",
      value: session.lastRoute || "—",
      color: "text-white/50",
    },
    {
      label: "Redirect Reason",
      value: redirectReason || "—",
      color: "text-white/50",
    },
    {
      label: "Destination",
      value: decision?.target || "—",
      color: "text-white/70",
    },
    {
      label: "Workspace",
      value: activeWorkspace || "—",
      color: "text-white/70",
    },
    {
      label: "Last Workspace",
      value: session.lastWorkspace || "—",
      color: "text-white/50",
    },
    {
      label: "Cache Version",
      value: session.completedVersion || "—",
      color: "text-white/50",
    },
    {
      label: "Session Updated",
      value: session.updatedAt
        ? new Date(session.updatedAt).toISOString()
        : "—",
      color: "text-white/50",
    },
    {
      label: "Failsafe Count",
      value: `${failsafe.count}/${failsafe.max}`,
      color: failsafe.triggered ? "text-red-400" : "text-white/50",
    },
  ];

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.03] transition-colors"
      >
        <div className="flex items-center gap-2">
          <Activity size={14} className="text-indigo-400" />
          <span className="text-white/70 text-xs font-medium uppercase tracking-wider">
            Routing Diagnostics
          </span>
        </div>
        {expanded ? (
          <ChevronUp size={14} className="text-white/30" />
        ) : (
          <ChevronDown size={14} className="text-white/30" />
        )}
      </button>
      {expanded && (
        <div className="border-t border-white/5 p-4 space-y-2">
          {rows.map((row, i) => (
            <div
              key={i}
              className="flex items-center justify-between text-xs gap-4"
            >
              <span className="text-white/40 flex-shrink-0">{row.label}</span>
              <span
                className={`font-mono text-right truncate ${row.color}`}
                title={typeof row.value === "string" ? row.value : ""}
              >
                {String(row.value)}
              </span>
            </div>
          ))}

          {/* Safeguard Signals */}
          <div className="border-t border-white/5 pt-3 mt-3">
            <p className="text-white/30 text-xs uppercase tracking-wider mb-2">
              Safeguard Signals
            </p>
            <div className="grid grid-cols-2 gap-1">
              {Object.entries(onboardingState.safeguardSignals || {}).map(
                ([key, val]) => (
                  <div
                    key={key}
                    className="flex items-center gap-1.5 text-xs"
                  >
                    <span
                      className={val ? "text-emerald-400" : "text-white/20"}
                    >
                      {val ? "✓" : "○"}
                    </span>
                    <span className="text-white/30">{key}</span>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Onboarding Signals */}
          <div className="border-t border-white/5 pt-3 mt-3">
            <p className="text-white/30 text-xs uppercase tracking-wider mb-2">
              Onboarding Signals
            </p>
            <div className="grid grid-cols-2 gap-1">
              {Object.entries(onboardingState.signals || {}).map(
                ([key, val]) => (
                  <div
                    key={key}
                    className="flex items-center gap-1.5 text-xs"
                  >
                    <span
                      className={val ? "text-emerald-400" : "text-white/20"}
                    >
                      {typeof val === "boolean"
                        ? val
                          ? "✓"
                          : "○"
                        : "→"}
                    </span>
                    <span className="text-white/30">
                      {key}: {String(val)}
                    </span>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
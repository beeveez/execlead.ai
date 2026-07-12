import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useSubscription } from "@/lib/SubscriptionContext";
import { useWorkspace } from "@/lib/WorkspaceContext";
import {
  resolveOnboardingRedirect,
  clearOnboardingFailsafe,
} from "@/lib/onboardingStateManager";
import RoutingDiagnostics from "@/components/developer/RoutingDiagnostics";

/**
 * Session & Routing Manager™
 * ============================================================
 * The single routing authority between ProtectedRoute and the
 * application pages. Implements the 6-step post-auth flow:
 *
 *   1. Authenticate user          (AuthContext)
 *   2. Load Executive Runtime Profile™  (SubscriptionContext)
 *   3. Validate Runtime Profile   (onboardingStateManager)
 *   4. Restore previous workspace (WorkspaceContext)
 *   5. Restore previous route     (sessionRestore / destinationResolver)
 *   6. Navigate
 *
 * CRITICAL: Onboarding is NEVER evaluated from a single boolean
 * or a null profile. The manager waits until the profile has
 * genuinely loaded (or failed with an error) before deciding.
 * This eliminates the race condition where the Dashboard saw
 * loading=false + profile=null and redirected to /onboarding.
 */
function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-indigo-900 border-t-indigo-400 rounded-full animate-spin" />
        <p className="text-white/40 text-sm">
          Loading your Executive Runtime Profile™...
        </p>
      </div>
    </div>
  );
}

function ProfileErrorScreen({ error, onRetry, diagnostics }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] p-4">
      <div className="max-w-lg w-full space-y-4">
        <div className="bg-amber-500/5 border border-amber-500/15 rounded-2xl p-6 text-center">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="text-amber-400" size={24} />
          </div>
          <h2 className="text-white font-bold text-lg mb-2">
            Profile temporarily unavailable
          </h2>
          <p className="text-white/50 text-sm mb-4">
            Your executive data is safe, but we couldn't load your profile
            right now.
          </p>
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <RefreshCw size={14} /> Retry
          </button>
        </div>
        {diagnostics}
      </div>
    </div>
  );
}

function FailsafeScreen({ diagnostics }) {
  return (
    <div className="min-h-screen bg-[#0a0a0f] p-4">
      <div className="max-w-4xl mx-auto mt-20 space-y-6">
        <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-400 text-sm font-medium">
              Routing failsafe triggered
            </p>
            <p className="text-white/40 text-xs mt-1">
              Onboarding redirect limit reached. Loading Dashboard to prevent
              an infinite loop. Your profile data is safe.
            </p>
          </div>
        </div>
        {diagnostics}
      </div>
    </div>
  );
}

export default function SessionRoutingManager() {
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const {
    profile,
    loading: loadingProfile,
    profileError,
    profileLoadAttempted,
    refreshProfile,
  } = useSubscription();
  const { activeWorkspace } = useWorkspace();
  const location = useLocation();

  // ── Step 1: Wait for authentication ──
  if (isLoadingAuth || !isAuthenticated) {
    return <LoadingScreen />;
  }

  // ── Step 2: Wait for Executive Runtime Profile™ to load ──
  // profileLoadAttempted guards against the race condition where
  // loading is briefly false between the auth state change and
  // the profile load effect running.
  if (loadingProfile || !profileLoadAttempted) {
    return <LoadingScreen />;
  }

  const diagnosticsProps = {
    user,
    profile,
    loadingProfile,
    profileError,
    profileLoadAttempted,
    isAuthenticated,
    activeWorkspace,
    currentRoute: location.pathname,
  };

  // ── Step 3: Validate Runtime Profile ──
  // If the profile LOAD FAILED (network error, timeout, etc.),
  // show a retry screen — NOT onboarding. We don't have enough
  // information to make an onboarding decision.
  if (!profile && profileError) {
    return (
      <ProfileErrorScreen
        error={profileError}
        onRetry={refreshProfile}
        diagnostics={
          <RoutingDiagnostics
            {...diagnosticsProps}
            redirectReason="Profile load failed — showing retry state"
          />
        }
      />
    );
  }

  // ── Step 4: Onboarding validation ──
  // Only evaluated when the profile genuinely doesn't exist
  // (no error, just no profile found = first-time user).
  if (!profile) {
    const decision = resolveOnboardingRedirect(null, user);

    // Failsafe: redirect loop detected
    if (decision.failsafeTriggered) {
      return (
        <FailsafeScreen
          diagnostics={
            <RoutingDiagnostics
              {...diagnosticsProps}
              decision={decision}
              redirectReason="FAILSAFE: Redirect loop detected — routing to Dashboard"
            />
          }
        />
      );
    }

    // First-time user — redirect to onboarding
    if (decision.shouldRedirect) {
      return <Navigate to="/onboarding" replace />;
    }

    // Safeguard says complete (e.g., session flag) but profile
    // didn't load — show retry instead of redirecting
    return (
      <ProfileErrorScreen
        error="Safeguard triggered but profile data not found"
        onRetry={refreshProfile}
        diagnostics={
          <RoutingDiagnostics
            {...diagnosticsProps}
            decision={decision}
            redirectReason="Safeguard: existing data detected — showing retry"
          />
        }
      />
    );
  }

  // ── Step 5 & 6: Profile loaded — clear failsafe and render ──
  // The user is authenticated and has an Executive Runtime Profile™.
  // Restore happens naturally via React Router (the URL is already
  // correct). Workspace restoration is handled by WorkspaceContext.
  clearOnboardingFailsafe();

  return <Outlet />;
}
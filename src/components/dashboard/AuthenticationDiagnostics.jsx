import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { useWorkspace } from "@/lib/WorkspaceContext";
import { evaluateOnboardingState, getFailsafeState } from "@/lib/onboardingStateManager";
import { getSessionContext } from "@/lib/sessionRestore";
import { Shield, ChevronDown, ChevronUp, CheckCircle2, AlertTriangle, Zap } from "lucide-react";

export default function AuthenticationDiagnostics({ profile, loading, failsafeTriggered }) {
  const { user } = useAuth();
  const location = useLocation();
  const { activeWorkspace } = useWorkspace();
  const [expanded, setExpanded] = useState(false);

  const state = evaluateOnboardingState(profile, user);
  const failsafe = getFailsafeState();
  const session = getSessionContext();

  const showWarning = failsafeTriggered || failsafe.triggered;

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors"
      >
        <Shield size={14} className="text-white/30" />
        <span className="text-xs font-medium text-white/40 uppercase tracking-wider flex-1 text-left">
          Authentication Diagnostics™
        </span>
        {showWarning ? (
          <Zap size={14} className="text-amber-400" />
        ) : (
          <CheckCircle2 size={14} className="text-emerald-400" />
        )}
        {expanded ? <ChevronUp size={14} className="text-white/30" /> : <ChevronDown size={14} className="text-white/30" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3">
          {showWarning && (
            <div className="bg-amber-500/5 border border-amber-500/15 rounded-lg p-3 flex items-start gap-2">
              <AlertTriangle size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-amber-400/80 text-xs">
                Failsafe triggered — onboarding redirect limit reached. Routing to Dashboard to prevent infinite loop.
              </p>
            </div>
          )}

          <Row label="Authentication Status" value={user ? "Authenticated" : "Not authenticated"} />
          <Row label="Current Route" value={location.pathname} />
          <Row label="Runtime Profile" value={loading ? "Loading..." : profile ? "Loaded" : "Not loaded"} />
          <Row label="Onboarding Status" value={state.status} color={state.isComplete ? "text-emerald-400" : "text-amber-400"} />
          <Row label="Decision Reason" value={state.reason} />
          <Row label="Redirect Source" value={state.anySafeguard ? "Safeguard (no redirect)" : "Onboarding validator"} />
          <Row label="Last Route" value={session.lastRoute || "None"} />
          <Row label="Last Workspace" value={session.lastWorkspace || activeWorkspace || "None"} />
          <Row label="Last Visited" value={session.lastVisited ? new Date(session.lastVisited).toLocaleString() : "Never"} />
          <Row label="Current Workspace" value={activeWorkspace || "executive"} />
          <Row label="Cache Version" value={state.sessionContext.completedVersion || "—"} />
          <Row label="Runtime Version" value={state.version} />
          <Row label="Failsafe Count" value={`${failsafe.count} / ${failsafe.max}`} color={failsafe.triggered ? "text-amber-400" : "text-white/60"} />

          {state.optionalMissing.length > 0 && (
            <div>
              <div className="text-white/30 text-[10px] uppercase tracking-wider mb-1">Optional (does not block access)</div>
              <div className="flex flex-wrap gap-1.5">
                {state.optionalMissing.map((item, i) => (
                  <span key={i} className="text-white/30 text-[10px] bg-white/5 px-2 py-0.5 rounded">{item}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Row({ label, value, color }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-white/30 text-xs whitespace-nowrap">{label}</span>
      <span className={`text-xs font-medium text-right truncate ${color || "text-white/60"}`}>{value}</span>
    </div>
  );
}
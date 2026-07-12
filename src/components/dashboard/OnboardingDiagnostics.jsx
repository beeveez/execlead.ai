import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { evaluateOnboardingState } from "@/lib/onboardingStateManager";
import { Activity, ChevronDown, ChevronUp, RefreshCw, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function OnboardingDiagnostics({ profile, loading, loadError }) {
  const { user } = useAuth();
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);
  const state = evaluateOnboardingState(profile, user);

  const StatusIcon = state.isComplete ? CheckCircle2 : AlertTriangle;
  const statusColor = state.isComplete ? "text-emerald-400" : "text-amber-400";

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors"
      >
        <Activity size={14} className="text-white/30" />
        <span className="text-xs font-medium text-white/40 uppercase tracking-wider flex-1 text-left">
          Onboarding Diagnostics
        </span>
        <StatusIcon size={14} className={statusColor} />
        <span className={`text-xs font-medium ${statusColor}`}>{state.status}</span>
        {expanded ? <ChevronUp size={14} className="text-white/30" /> : <ChevronDown size={14} className="text-white/30" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3">
          <DiagnosticRow label="Current Route" value={location.pathname} />
          <DiagnosticRow label="Onboarding Status" value={state.status} color={statusColor} />
          <DiagnosticRow label="Reason" value={state.reason} />
          <DiagnosticRow label="Last Completed" value={state.sessionContext.lastCompletedAt ? new Date(state.sessionContext.lastCompletedAt).toLocaleString() : "Never"} />
          <DiagnosticRow label="Completed Version" value={state.sessionContext.completedVersion || "—"} />
          <DiagnosticRow label="Profile Loaded" value={state.signals.profileLoaded ? "Yes" : "No"} />
          <DiagnosticRow label="Runtime Profile" value={loading ? "Loading..." : state.signals.profileLoaded ? "Loaded" : "Not loaded"} />
          <DiagnosticRow label="Cache Version" value={state.sessionContext.completedVersion || "—"} />
          <DiagnosticRow label="Redirect Source" value={state.anySafeguard ? "Safeguard (no redirect)" : "Onboarding check"} />

          {state.missingRequirements.length > 0 && (
            <div>
              <div className="text-white/30 text-[10px] uppercase tracking-wider mb-1">Missing Requirements</div>
              <ul className="space-y-1">
                {state.missingRequirements.map((req, i) => (
                  <li key={i} className="text-amber-400/70 text-xs flex items-start gap-1.5">
                    <span className="text-amber-400">•</span> {req}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <div className="text-white/30 text-[10px] uppercase tracking-wider mb-1">Safeguard Signals</div>
            <div className="grid grid-cols-2 gap-1.5">
              {Object.entries(state.safeguardSignals).map(([key, val]) => (
                <div key={key} className="flex items-center gap-1.5 text-xs">
                  <span className={`w-1.5 h-1.5 rounded-full ${val ? "bg-emerald-400" : "bg-white/10"}`} />
                  <span className="text-white/40">{key.replace(/([A-Z])/g, " $1").replace(/^./, c => c.toUpperCase())}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DiagnosticRow({ label, value, color }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-white/30 text-xs">{label}</span>
      <span className={`text-xs font-medium text-right truncate ${color || "text-white/60"}`}>{value}</span>
    </div>
  );
}
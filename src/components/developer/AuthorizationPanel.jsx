import React from "react";
import { useAuth } from "@/lib/AuthContext";
import { useDeveloper } from "@/lib/DeveloperContext";
import { getAuthorizationState } from "@/lib/workspacePermissions";
import { ShieldCheck, ShieldX, Crown, KeyRound, CheckCircle2, XCircle, Lock } from "lucide-react";

/**
 * Authorization State Panel
 * Displays the current user's role, developer mode status, and a
 * complete permission checklist for every Developer Workspace module.
 *
 * If access is denied for any module, the exact missing role or
 * permission is shown instead of a generic message.
 */
export default function AuthorizationPanel() {
  const { user } = useAuth();
  const dev = useDeveloper();

  const authState = getAuthorizationState(user, dev);

  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <KeyRound size={16} className="text-indigo-400" />
        <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider">Authorization State</h2>
      </div>

      {/* Current User Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div className="rounded-lg bg-white/[0.02] border border-white/5 p-3">
          <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Role</div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium text-white">{authState.roleLabel}</span>
          </div>
        </div>
        <div className="rounded-lg bg-white/[0.02] border border-white/5 p-3">
          <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Developer Mode</div>
          <div className="flex items-center gap-1.5">
            {authState.developerMode ? (
              <CheckCircle2 size={14} className="text-emerald-400" />
            ) : (
              <XCircle size={14} className="text-white/30" />
            )}
            <span className={`text-sm font-medium ${authState.developerMode ? "text-emerald-400" : "text-white/30"}`}>
              {authState.developerMode ? "Enabled" : "Disabled"}
            </span>
          </div>
        </div>
        <div className="rounded-lg bg-white/[0.02] border border-white/5 p-3">
          <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Founder Override</div>
          <div className="flex items-center gap-1.5">
            {authState.isFounderOverride ? (
              <Crown size={14} className="text-amber-400" />
            ) : (
              <Lock size={14} className="text-white/20" />
            )}
            <span className={`text-sm font-medium ${authState.isFounderOverride ? "text-amber-400" : "text-white/30"}`}>
              {authState.isFounderOverride ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
      </div>

      {/* Founder Override Banner */}
      {authState.isFounderOverride && (
        <div className="flex items-center gap-2 rounded-lg bg-amber-500/5 border border-amber-500/15 p-3 mb-4">
          <Crown size={14} className="text-amber-400" />
          <span className="text-amber-400/80 text-xs font-medium">
            Founder Override active — Super Admin bypasses all workspace permission checks
          </span>
        </div>
      )}

      {/* Permissions Checklist */}
      <div className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Permissions</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {authState.permissions.map(perm => (
          <div
            key={perm.key}
            className={`flex items-center justify-between rounded-lg p-2.5 border transition-colors ${
              perm.granted
                ? "bg-emerald-500/[0.03] border-emerald-500/10"
                : "bg-red-500/[0.03] border-red-500/10"
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              {perm.granted ? (
                <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
              ) : (
                <ShieldX size={14} className="text-red-400/70 shrink-0" />
              )}
              <span className={`text-xs font-medium truncate ${perm.granted ? "text-white/70" : "text-white/40"}`}>
                {perm.label}
              </span>
            </div>
            <span className={`text-[9px] shrink-0 ml-2 ${perm.granted ? "text-emerald-400/60" : "text-red-400/60"}`}>
              {perm.granted ? "✓" : "✗"}
            </span>
          </div>
        ))}
      </div>

      {/* Denied Permission Details */}
      {authState.permissions.filter(p => !p.granted).length > 0 && !authState.isFounderOverride && (
        <div className="mt-3 bg-red-500/5 border border-red-500/15 rounded-lg p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <ShieldX size={12} className="text-red-400" />
            <span className="text-red-400/80 text-xs font-medium uppercase tracking-wider">Denied Permissions</span>
          </div>
          <div className="space-y-1.5">
            {authState.permissions.filter(p => !p.granted).map(perm => (
              <div key={perm.key} className="text-xs text-red-300/60 flex items-start gap-1.5">
                <XCircle size={10} className="text-red-400/60 shrink-0 mt-0.5" />
                <span>
                  <span className="text-white/50">{perm.label}:</span>{" "}
                  <span className="text-red-400">{perm.reason}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
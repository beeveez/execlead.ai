import React, { useMemo } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useSubscription } from "@/lib/SubscriptionContext";
import { useDeveloper } from "@/lib/DeveloperContext";
import { useWorkspace } from "@/lib/WorkspaceContext";
import { Stethoscope, RefreshCw, ShieldCheck, ShieldAlert, Crown, CheckCircle2, XCircle } from "lucide-react";

/**
 * Developer Diagnostic Panel — Entitlement Inspector
 * Visible only in the Developer Workspace.
 *
 * Shows the complete entitlement state so inconsistencies can be
 * identified at a glance: user ID, subscription, workspace, founder
 * status, purchase verification, founder number, entitlement source,
 * simulation mode, developer override, and last refresh timestamp.
 */
export default function EntitlementDiagnostic() {
  const { user } = useAuth();
  const { profile, subscription, entitlements, loading, refreshProfile, lastEntitlementRefresh } = useSubscription();
  const { canAccessDeveloper, isSimulating, simulation, developerMode } = useDeveloper();
  const { activeWorkspace } = useWorkspace();

  const rows = useMemo(() => [
    { label: "Current User ID", value: user?.id || "—", mono: true },
    { label: "Current Subscription", value: subscription?.planName ? `${subscription.planName} (${subscription.planTier})` : "—", status: subscription?.status },
    { label: "Current Workspace", value: activeWorkspace ? activeWorkspace.charAt(0).toUpperCase() + activeWorkspace.slice(1) : "—" },
    { label: "Founding Member", value: entitlements?.isFoundingMember ? "Yes" : "No", bool: entitlements?.isFoundingMember },
    { label: "Purchase Verified", value: entitlements?.purchaseVerified ? "Yes" : "No", bool: entitlements?.purchaseVerified },
    { label: "Founder Portal Enabled", value: entitlements?.founderPortalEnabled ? "Yes" : "No", bool: entitlements?.founderPortalEnabled },
    { label: "Founder Number", value: entitlements?.founderNumber || "—", mono: true },
    { label: "Founder Tier", value: entitlements?.founderTier || "—" },
    { label: "Entitlement Source", value: entitlements?.entitlementSource || "—", mono: true },
    { label: "Simulation Mode", value: isSimulating ? "On" : "Off", bool: isSimulating, warn: isSimulating },
    { label: "Developer Override", value: developerMode ? "On" : "Off", bool: developerMode, warn: developerMode },
    { label: "Last Entitlement Refresh", value: lastEntitlementRefresh ? new Date(lastEntitlementRefresh).toLocaleString() : "—" },
  ], [user, subscription, activeWorkspace, entitlements, isSimulating, developerMode, lastEntitlementRefresh]);

  // Show the failing conditions explicitly
  const failingConditions = useMemo(() => {
    if (!entitlements) return [];
    const fails = [];
    if (!entitlements.isFoundingMember) fails.push("No active FoundingMember record");
    if (!entitlements.purchaseVerified) fails.push("Purchase not verified (purchase_verified / payment_status)");
    const plan = entitlements.subscription?.plan;
    if (!["professional", "executive"].includes(plan)) fails.push(`Subscription "${plan}" is not eligible (requires Professional or Executive)`);
    return fails;
  }, [entitlements]);

  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Stethoscope size={16} className="text-cyan-400" />
          <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider">Entitlement Diagnostic</h2>
        </div>
        <button
          onClick={refreshProfile}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/60 transition-colors disabled:opacity-40"
        >
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* Summary banner */}
      <div className={`flex items-center gap-2 rounded-lg p-3 mb-4 ${entitlements?.founderPortalEnabled ? "bg-emerald-500/5 border border-emerald-500/15" : "bg-white/[0.02] border border-white/5"}`}>
        {entitlements?.founderPortalEnabled ? (
          <>
            <ShieldCheck size={16} className="text-emerald-400" />
            <span className="text-emerald-400 text-sm font-medium">Founder Portal: ENABLED</span>
          </>
        ) : (
          <>
            <ShieldAlert size={16} className="text-white/40" />
            <span className="text-white/50 text-sm font-medium">Founder Portal: DISABLED</span>
          </>
        )}
      </div>

      {/* Failing conditions (only shown when portal is disabled but user has some founder data) */}
      {failingConditions.length > 0 && (
        <div className="bg-amber-500/5 border border-amber-500/15 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Crown size={12} className="text-amber-400" />
            <span className="text-amber-400/80 text-xs font-medium uppercase tracking-wider">Failing Conditions</span>
          </div>
          <ul className="space-y-1">
            {failingConditions.map((c, i) => (
              <li key={i} className="text-amber-300/60 text-xs flex items-center gap-1.5">
                <XCircle size={10} className="text-amber-400/60 shrink-0" /> {c}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Diagnostic rows */}
      <div className="space-y-1">
        {rows.map((row, i) => (
          <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
            <span className="text-white/40 text-xs">{row.label}</span>
            <div className="flex items-center gap-2">
              {row.bool !== undefined && (
                row.bool
                  ? <CheckCircle2 size={12} className="text-emerald-400" />
                  : <XCircle size={12} className={row.warn ? "text-amber-400" : "text-white/30"} />
              )}
              <span className={`text-xs ${row.warn ? "text-amber-400" : row.bool === false ? "text-white/30" : row.bool === true ? "text-emerald-400" : "text-white/70"} ${row.mono ? "font-mono" : ""}`}>
                {row.value}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Simulation details */}
      {isSimulating && (
        <div className="mt-3 bg-cyan-500/5 border border-cyan-500/15 rounded-lg p-3">
          <div className="text-cyan-400/80 text-xs font-medium mb-2">Active Simulation Details</div>
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div><span className="text-white/30">Simulated Plan:</span> <span className="text-white/60 font-mono">{simulation.plan || "—"}</span></div>
            <div><span className="text-white/30">Simulated Founder:</span> <span className="text-white/60 font-mono">{simulation.founder === null ? "—" : String(simulation.founder)}</span></div>
            <div><span className="text-white/30">Impersonation:</span> <span className="text-white/60 font-mono">{simulation.role || "—"}</span></div>
            <div><span className="text-white/30">Sub Status:</span> <span className="text-white/60 font-mono">{simulation.subscriptionStatus || "—"}</span></div>
          </div>
        </div>
      )}
    </div>
  );
}
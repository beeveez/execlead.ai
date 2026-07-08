import React from "react";
import { useDeveloper } from "@/lib/DeveloperContext";
import { useSubscription } from "@/lib/SubscriptionContext";
import FoundingMemberBadge from "@/components/founding/FoundingMemberBadge";
import { FOUNDING_MEMBER_TIERS } from "@/lib/foundingMember";
import {
  Crown, Loader2, Power, Hash, ToggleLeft, ToggleRight, Award, Shield, Eye, AlertTriangle,
} from "lucide-react";

const TIERS = Object.entries(FOUNDING_MEMBER_TIERS);

/**
 * Developer-only Founder UI Testing.
 *
 * IMPORTANT: This panel uses SIMULATION ONLY — it never creates,
 * modifies, or deletes real FoundingMember database records. Real
 * founder status can only be granted by the server-side
 * `manageFounderEntitlement` function after payment verification.
 *
 * Simulation is:
 *   - Dev-role users only (gated by DeveloperContext)
 *   - Non-persistent (localStorage cleared on user switch)
 *   - Never written to the FoundingMember entity
 *   - Never visible to real users
 */
export default function FoundingMemberTesting() {
  const { simulation, setSimulatedFounder, clearSimulation, canAccessDeveloper } = useDeveloper();
  const { entitlements, loading } = useSubscription();

  if (loading) {
    return <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-amber-400" /></div>;
  }

  if (!canAccessDeveloper) {
    return (
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <Shield size={16} className="text-white/40" />
          <h3 className="text-white/60 font-semibold text-sm">Founder Testing — Developer Access Required</h3>
        </div>
        <p className="text-white/30 text-xs">This panel is available to developer-role accounts only.</p>
      </div>
    );
  }

  const isSimulated = simulation?.founder === true;
  const realStatus = entitlements?.isFoundingMember ?? false;
  const realRecord = entitlements?.founderRecord;

  const enableSimulation = () => setSimulatedFounder(true);
  const disableSimulation = () => setSimulatedFounder(false);

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Crown size={16} className="text-amber-400" />
        <h3 className="text-white font-semibold text-sm">Founder UI Testing (Simulation)</h3>
      </div>

      {/* Warning banner */}
      <div className="flex items-start gap-2 bg-amber-500/5 border border-amber-500/15 rounded-lg p-3 mb-4">
        <AlertTriangle size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="text-amber-300/70 text-xs leading-relaxed">
          Simulation only — no database records are created. Real Founder status requires
          server-side payment verification. Simulation resets when you switch accounts.
        </p>
      </div>

      {/* Real status indicator */}
      <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 mb-4">
        <div className="text-white/30 text-[10px] uppercase tracking-wider mb-1">Real Entitlement (Server-Validated)</div>
        <div className="flex items-center gap-2">
          {realStatus ? (
            <>
              <Shield size={14} className="text-emerald-400" />
              <span className="text-emerald-400 text-sm font-medium">Active Founder</span>
              {realRecord?.founding_member_number && (
                <span className="text-white/40 text-xs font-mono">#{realRecord.founding_member_number}</span>
              )}
            </>
          ) : (
            <>
              <Shield size={14} className="text-white/30" />
              <span className="text-white/40 text-sm">Not a Founding Member</span>
            </>
          )}
        </div>
      </div>

      {/* Simulation toggle */}
      {!isSimulated ? (
        <div className="text-center py-4">
          <p className="text-white/40 text-sm mb-4">Founder simulation is OFF. Enable to preview the Founder UI.</p>
          <button
            onClick={enableSimulation}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 text-sm font-medium transition-colors"
          >
            <Power size={14} /> Simulate Founder Status
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-amber-500/5 border border-amber-500/10 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <FoundingMemberBadge size={12} />
              <span className="text-amber-400/60 text-xs font-mono">SIMULATED</span>
            </div>
            <button
              onClick={disableSimulation}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/5 text-red-400 hover:bg-red-500/10 text-xs font-medium transition-colors"
            >
              <ToggleRight size={14} /> Disable Simulation
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
              <div className="text-white/30 text-[10px] uppercase tracking-wider mb-2 flex items-center gap-1"><Eye size={10} /> Badge Preview</div>
              <FoundingMemberBadge size={12} />
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
              <div className="text-white/30 text-[10px] uppercase tracking-wider mb-2 flex items-center gap-1"><Shield size={10} /> Simulated Benefits</div>
              <div className="space-y-1 text-[10px] text-white/50">
                <div className="flex items-center gap-1"><ToggleRight size={10} className="text-emerald-400" /> Discount: 25%</div>
                <div className="flex items-center gap-1"><ToggleRight size={10} className="text-emerald-400" /> Early Access: On</div>
                <div className="flex items-center gap-1"><ToggleRight size={10} className="text-emerald-400" /> Community: On</div>
              </div>
            </div>
          </div>

          <button
            onClick={clearSimulation}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 text-xs font-medium transition-colors"
          >
            <Award size={14} /> Clear All Simulations
          </button>
        </div>
      )}
    </div>
  );
}
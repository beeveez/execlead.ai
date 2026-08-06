import React from "react";
import { Sparkles, Package } from "lucide-react";
import { SIMULATION_CREDIT_PROGRAM } from "@/lib/enterpriseCommercialArchitecture";

export default function EnterpriseSimulationCredits({ used }) {
  const total = SIMULATION_CREDIT_PROGRAM.annualAllocationPerAccount;
  const hasUsed = used != null;
  const pctVal = hasUsed ? Math.min(100, Math.round((used / total) * 100)) : 0;
  return (
    <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/[0.04] p-5">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles size={15} className="text-indigo-400" />
        <h3 className="text-white text-sm font-semibold">{SIMULATION_CREDIT_PROGRAM.name}</h3>
      </div>
      <p className="text-white/50 text-xs mb-4">{SIMULATION_CREDIT_PROGRAM.description}</p>
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="text-white/60">Annual allocation used</span>
        <span className="text-white font-semibold">
          {hasUsed ? `${used} / ${total} credits · ${pctVal}%` : "Collecting"}
        </span>
      </div>
      <div className="h-2 rounded-full bg-white/8 overflow-hidden mb-4">
        <div className="h-full bg-gradient-to-r from-indigo-500 to-accent-orange" style={{ width: `${pctVal}%` }} />
      </div>
      <div className="text-[10px] uppercase tracking-wider text-white/40 font-semibold mb-2">Premium credit types</div>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {SIMULATION_CREDIT_PROGRAM.premiumTypes.map((p) => (
          <span key={p} className="text-[11px] px-2 py-1 rounded-full bg-white/5 border border-white/10 text-white/60">
            {p}
          </span>
        ))}
      </div>
      <div className="text-[10px] uppercase tracking-wider text-white/40 font-semibold mb-2">Expansion bundles</div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {SIMULATION_CREDIT_PROGRAM.bundles.map((b) => (
          <div key={b.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
            <div className="flex items-center gap-1.5 text-white/80 text-xs font-semibold mb-1">
              <Package size={12} /> {b.credits} credits
            </div>
            <div className="text-[10px] text-white/40">{b.note}</div>
          </div>
        ))}
      </div>
      <p className="text-white/40 text-[11px] mt-3">{SIMULATION_CREDIT_PROGRAM.upgradeNote}</p>
    </div>
  );
}
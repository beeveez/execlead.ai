import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePricingCatalog } from "@/hooks/usePricingCatalog";
import { getFoundingMemberPrice } from "@/lib/foundingMember";
import { Calculator, Info } from "lucide-react";

export default function FoundingMemberValueCalc() {
  const { plans, getPrice } = usePricingCatalog();
  const paidPlans = plans.filter((p) => p.monthlyPrice > 0 && !p.enterpriseOnly);
  const [selectedId, setSelectedId] = useState(
    paidPlans.find((p) => p.id === "executive")?.id || paidPlans[0]?.id || "executive"
  );

  const plan = paidPlans.find((p) => p.id === selectedId) || paidPlans[0];
  if (!plan) return null;

  const plannedGaPrice = getPrice(plan);
  const illustrativeValue = getFoundingMemberPrice(plannedGaPrice);

  return (
    <div className="bg-card border border-border rounded-2xl p-8 md:p-10 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center">
          <Calculator size={18} className="text-amber-400" />
        </div>
        <div>
          <h3 className="text-foreground font-semibold text-lg">Future GA Pricing Preview™</h3>
          <p className="text-amber-400/50 text-xs">Illustrative only — not available during beta</p>
        </div>
      </div>
      <p className="text-muted-foreground text-sm leading-relaxed mb-6 max-w-3xl">
        This preview shows planned General Availability pricing for reference only. Current beta
        participants are not charged during the Founding Private Beta™.
      </p>
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2.5 block">
            Select Plan
          </label>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full bg-background border border-border rounded-xl px-4 h-11 text-sm text-foreground focus:outline-none focus:border-amber-500/50 transition-colors"
          >
            {paidPlans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Stat label="Planned GA Price" value={`$${plannedGaPrice.toFixed(2)}/mo`} />
          <Stat label="Illustrative Future Value" value={`$${illustrativeValue.toFixed(2)}/mo`} gold />
        </div>
      </div>
      <div className="mt-6 pt-6 border-t border-border flex items-start gap-2">
        <Info size={16} className="text-amber-400/60 flex-shrink-0 mt-0.5" />
        <p className="text-muted-foreground text-sm">
          <span className="font-medium text-amber-400/80">Pricing Subject to Change.</span>{" "}
          All figures are illustrative estimates for future General Availability. Actual pricing, plans, and features may differ at launch.
        </p>
      </div>
    </div>
  );
}

function Stat({ label, value, gold }) {
  return (
    <div className="bg-background rounded-xl p-4 border border-border">
      <div className="text-muted-foreground text-[11px] uppercase tracking-wider mb-1.5 font-medium">{label}</div>
      <div className={`text-lg font-bold ${gold ? "gold-shimmer" : "text-foreground"}`}>
        {value}
      </div>
    </div>
  );
}
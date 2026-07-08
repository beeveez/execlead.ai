import React, { useState } from "react";
import { usePricingCatalog } from "@/hooks/usePricingCatalog";
import {
  getFoundingMemberPrice,
  getFoundingMemberSavings,
} from "@/lib/foundingMember";
import { Calculator } from "lucide-react";

export default function FoundingMemberValueCalc() {
  const { plans, getPrice } = usePricingCatalog();
  const paidPlans = plans.filter((p) => p.monthlyPrice > 0 && !p.enterpriseOnly);
  const [selectedId, setSelectedId] = useState(
    paidPlans.find((p) => p.id === "executive")?.id || paidPlans[0]?.id || "executive"
  );

  const plan = paidPlans.find((p) => p.id === selectedId) || paidPlans[0];
  if (!plan) return null;

  const regular = getPrice(plan);
  const foundingPrice = getFoundingMemberPrice(regular);
  const monthlySavings = getFoundingMemberSavings(regular);
  const annualSavings = monthlySavings * 12;
  const lifetimeSavings = annualSavings * 5;

  return (
    <div className="bg-gradient-to-br from-amber-500/5 to-transparent border border-amber-500/15 rounded-2xl p-6 md:p-8">
      <div className="flex items-center gap-2 mb-6">
        <Calculator size={18} className="text-amber-400" />
        <h3 className="text-white font-semibold">Value Calculator</h3>
      </div>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/3">
          <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-2 block">
            Select Plan
          </label>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 h-10 text-sm text-white/90 focus:outline-none focus:border-amber-500/50"
          >
            {paidPlans.map((p) => (
              <option key={p.id} value={p.id} className="bg-[#0d0d14]">
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat label="Regular Price" value={`$${regular.toFixed(2)}/mo`} muted />
          <Stat label="Founding Price" value={`$${foundingPrice.toFixed(2)}/mo`} gold />
          <Stat label="Monthly Savings" value={`$${monthlySavings.toFixed(2)}`} />
          <Stat label="Annual Savings" value={`$${annualSavings.toFixed(0)}`} />
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-amber-500/10 flex items-center justify-between">
        <span className="text-white/40 text-sm">Estimated Lifetime Savings (5 years)</span>
        <span className="text-2xl font-bold gold-shimmer">
          ${lifetimeSavings.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </span>
      </div>
    </div>
  );
}

function Stat({ label, value, gold, muted }) {
  return (
    <div className="bg-white/[0.02] rounded-xl p-3">
      <div className="text-white/30 text-[10px] uppercase tracking-wider mb-1">{label}</div>
      <div className={`text-lg font-bold ${gold ? "gold-shimmer" : muted ? "text-white/50" : "text-white"}`}>
        {value}
      </div>
    </div>
  );
}
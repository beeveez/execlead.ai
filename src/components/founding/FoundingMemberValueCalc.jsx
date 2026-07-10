import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
    <div className="bg-card border border-border rounded-2xl p-8 md:p-10 shadow-sm">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center">
          <Calculator size={18} className="text-amber-400" />
        </div>
        <h3 className="text-foreground font-semibold text-lg">Value Calculator</h3>
      </div>
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
        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat label="Regular Price" value={`$${regular.toFixed(2)}/mo`} />
          <Stat label="Founding Price" value={`$${foundingPrice.toFixed(2)}/mo`} gold />
          <Stat label="Monthly Savings" value={`$${monthlySavings.toFixed(2)}`} green />
          <Stat label="Annual Savings" value={`$${annualSavings.toFixed(0)}`} green />
        </div>
      </div>
      <div className="mt-6 pt-6 border-t border-border flex items-center justify-between">
        <span className="text-muted-foreground text-sm font-medium">Estimated Lifetime Savings (5 years)</span>
        <AnimatePresence mode="wait">
          <motion.span
            key={selectedId}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="text-3xl font-bold gold-shimmer"
          >
            ${lifetimeSavings.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}

function Stat({ label, value, gold, green }) {
  return (
    <div className="bg-background rounded-xl p-4 border border-border">
      <div className="text-muted-foreground text-[11px] uppercase tracking-wider mb-1.5 font-medium">{label}</div>
      <div className={`text-lg font-bold ${gold ? "gold-shimmer" : green ? "text-emerald-500" : "text-foreground"}`}>
        {value}
      </div>
    </div>
  );
}
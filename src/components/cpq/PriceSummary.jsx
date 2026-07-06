import React from "react";
import { formatCPQPrice } from "@/lib/cpqEngine";
import { TrendingUp, AlertTriangle, Calendar, Receipt } from "lucide-react";

export default function PriceSummary({ breakdown, catalog }) {
  if (!breakdown) return null;
  const { currencies } = catalog || {};
  const fmt = (amt) => formatCPQPrice(amt, breakdown.currency, currencies);

  const rows = [
    { label: "Platform Fee", value: breakdown.platformFee },
    { label: `Seats (${breakdown.seats} × $${breakdown.seatPricePerUser})`, value: breakdown.seatCost },
    { label: "Modules", value: breakdown.moduleCost },
    { label: `AI: ${breakdown.aiPackage?.name || "None"}`, value: breakdown.aiCost },
    { label: `Support: ${breakdown.supportPackage?.name || "None"}`, value: breakdown.supportCost },
    { label: "Services & Add-ons", value: breakdown.servicesCost },
  ];

  return (
    <div className="bg-gradient-to-b from-indigo-500/5 to-transparent border border-indigo-500/10 rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-2 text-indigo-400 text-xs font-medium uppercase tracking-wider">
        <TrendingUp size={14} /> Live Price Summary
      </div>

      <div className="space-y-2">
        {rows.map((r, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span className="text-white/40">{r.label}</span>
            <span className="text-white/70">{fmt(r.value)}</span>
          </div>
        ))}
        <div className="border-t border-white/5 pt-2 flex justify-between text-sm">
          <span className="text-white/50 font-medium">Annual Recurring</span>
          <span className="text-white font-medium">{fmt(breakdown.annualRecurring)}</span>
        </div>
        {breakdown.discount.amount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-emerald-400">Discount ({breakdown.discount.rule})</span>
            <span className="text-emerald-400">-{fmt(breakdown.discount.amount)}</span>
          </div>
        )}
        {breakdown.multiYearDiscount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-emerald-400">Multi-Year Bonus</span>
            <span className="text-emerald-400">-{fmt(breakdown.multiYearDiscount)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-white/40">Tax ({(breakdown.tax.rate * 100).toFixed(0)}%){breakdown.tax.exempt && " · Exempt"}</span>
          <span className="text-white/40">{fmt(breakdown.tax.amount)}</span>
        </div>
      </div>

      <div className="bg-white/5 rounded-lg p-4 space-y-1">
        <div className="flex justify-between items-baseline">
          <span className="text-white/60 text-sm">Grand Total ({breakdown.contractLength}yr)</span>
          <span className="text-2xl font-bold text-white">{fmt(breakdown.convertedTotal)}</span>
        </div>
        {breakdown.currency !== "USD" && (
          <div className="text-right text-xs text-white/30">≈ ${Math.round(breakdown.grandTotal).toLocaleString()} USD</div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white/[0.02] rounded-lg p-2 text-center">
          <div className="text-white/30 text-[10px] uppercase">Monthly</div>
          <div className="text-white/70 text-sm font-medium">{fmt(breakdown.monthlyEquivalent)}</div>
        </div>
        <div className="bg-white/[0.02] rounded-lg p-2 text-center">
          <div className="text-white/30 text-[10px] uppercase">Annual</div>
          <div className="text-white/70 text-sm font-medium">{fmt(breakdown.annualEquivalent)}</div>
        </div>
        <div className="bg-white/[0.02] rounded-lg p-2 text-center">
          <div className="text-white/30 text-[10px] uppercase">3-Year</div>
          <div className="text-white/70 text-sm font-medium">{fmt(breakdown.threeYearEquivalent)}</div>
        </div>
      </div>

      {breakdown.multiYearSavings > 0 && (
        <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-3 flex items-center gap-2">
          <Calendar size={14} className="text-emerald-400 flex-shrink-0" />
          <span className="text-emerald-400 text-sm">{fmt(breakdown.multiYearSavings)} saved with {breakdown.contractLength}-year contract</span>
        </div>
      )}

      {breakdown.discount.requiresApproval && (
        <div className="bg-amber-500/5 border border-amber-500/10 rounded-lg p-3 flex items-start gap-2">
          <AlertTriangle size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
          <span className="text-amber-400 text-xs">Discount exceeds approval threshold ({fmt(breakdown.discount.approvalThreshold)}). Manager approval required.</span>
        </div>
      )}
    </div>
  );
}
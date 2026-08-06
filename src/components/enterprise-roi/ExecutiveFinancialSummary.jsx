import React from "react";
import { TrendingUp, Wallet, Clock, Percent, ShieldAlert, BadgeCheck } from "lucide-react";
import { fmtCurrency, fmtPct } from "@/lib/enterpriseRoiEngine";

export default function ExecutiveFinancialSummary({ summary }) {
  const cards = [
    { icon: TrendingUp, label: "Annual Value", value: fmtCurrency(summary.annualValue), color: "text-emerald-400" },
    { icon: Wallet, label: "Net Business Impact", value: fmtCurrency(summary.netBusinessImpact), color: summary.netBusinessImpact >= 0 ? "text-emerald-400" : "text-rose-400" },
    { icon: Clock, label: "Payback", value: summary.payback ? `${summary.payback} mo` : "—", color: "text-indigo-400" },
    { icon: Percent, label: "ROI", value: fmtPct(summary.roi), color: "text-accent-orange" },
    { icon: ShieldAlert, label: "Risk", value: summary.risk, color: "text-amber-400" },
    { icon: BadgeCheck, label: "Confidence", value: summary.confidence, color: "text-emerald-400" },
  ];
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white text-sm font-semibold">Executive Financial Summary™</h3>
        <span className="text-[11px] px-2 py-1 rounded-full bg-accent-orange/10 border border-accent-orange/20 text-accent-orange font-medium">{summary.commercialRecommendation}</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-white/8 bg-white/[0.02] p-3">
            <c.icon size={14} className={`${c.color} mb-1.5`} />
            <div className="text-[10px] uppercase tracking-wider text-white/40 font-semibold mb-0.5">{c.label}</div>
            <div className="text-sm font-bold text-white">{c.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
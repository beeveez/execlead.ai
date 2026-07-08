import React from "react";
import { ArrowRight, TrendingUp } from "lucide-react";
import { MONEY_FLOW_STEPS, COMMISSION_STATUS, formatWalletCurrency } from "@/lib/walletEngine";

export default function CommissionFlow({ breakdown, referralStats }) {
  const statuses = [
    { key: "pending", ...COMMISSION_STATUS.pending },
    { key: "approved", ...COMMISSION_STATUS.approved },
    { key: "paid", ...COMMISSION_STATUS.paid },
    { key: "rejected", ...COMMISSION_STATUS.rejected },
    { key: "cancelled", ...COMMISSION_STATUS.cancelled },
    { key: "fraud_review", ...COMMISSION_STATUS.fraud_review },
  ];

  return (
    <div className="space-y-4">
      {/* Money Flow */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <TrendingUp size={18} className="text-indigo-400" />
          <h2 className="text-white font-semibold">How Money Flows</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {MONEY_FLOW_STEPS.map((step, idx) => (
            <React.Fragment key={step.step}>
              <div className="flex flex-col items-center gap-1.5 min-w-[80px]">
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-lg">
                  {step.icon}
                </div>
                <span className="text-[10px] text-white/40 text-center leading-tight">{step.label}</span>
              </div>
              {idx < MONEY_FLOW_STEPS.length - 1 && (
                <ArrowRight size={14} className="text-white/20 shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Commission Status Breakdown */}
      {breakdown && (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
          <h2 className="text-white font-semibold mb-4">Commission Status</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {statuses.map((s) => {
              const data = breakdown[s.key] || { count: 0, amount: 0 };
              return (
                <div key={s.key} className="px-4 py-3 bg-white/[0.02] rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-2 h-2 rounded-full`} style={{ backgroundColor: s.color }} />
                    <span className="text-white/60 text-xs font-medium">{s.label}</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-white font-bold text-sm">{data.count}</span>
                    <span className="text-white/30 text-xs">{formatWalletCurrency(data.amount)}</span>
                  </div>
                </div>
              );
            })}
          </div>
          {referralStats && (
            <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap gap-4 text-xs">
              <span className="text-white/40">Clicks: <span className="text-white font-medium">{referralStats.clicks}</span></span>
              <span className="text-white/40">Registrations: <span className="text-white font-medium">{referralStats.registrations}</span></span>
              <span className="text-white/40">Conversions: <span className="text-white font-medium">{referralStats.conversions}</span></span>
              <span className="text-white/40">Conversion Rate: <span className="text-emerald-400 font-medium">{referralStats.conversionRate.toFixed(1)}%</span></span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
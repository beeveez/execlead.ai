import React from "react";
import { formatCurrency } from "@/lib/payments";
import { Calendar, CreditCard, RefreshCw, TrendingUp, X, Play, ArrowRightLeft } from "lucide-react";

export default function CurrentPlanCard({ profile, currentPlan, cycle, getPrice, renewalDate, onCancel, onResume, onSwitchCycle }) {
  const isCanceled = profile?.subscription_status === "canceled";
  const isTrialing = profile?.subscription_status === "trialing";
  const price = getPrice(currentPlan);

  return (
    <div className="bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/10 rounded-xl p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{currentPlan.icon}</span>
            <div>
              <h2 className="text-xl font-bold text-white">{currentPlan.name} Plan</h2>
              <p className="text-white/40 text-sm">{currentPlan.description}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-3">
            <span className="text-2xl font-bold text-white">{price === 0 ? "Free" : formatCurrency(price, currentPlan.currency)}<span className="text-sm text-white/40 font-normal">/{cycle === "monthly" ? "mo" : "yr"}</span></span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${isTrialing ? "bg-amber-500/10 text-amber-400" : isCanceled ? "bg-red-500/10 text-red-400" : "bg-emerald-500/10 text-emerald-400"}`}>
              {profile?.subscription_status || "active"}
            </span>
          </div>
        </div>

        {currentPlan.id !== "free" && (
          <div className="flex flex-col gap-2">
            {!isCanceled && (
              <button onClick={onSwitchCycle} className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-xs font-medium transition-colors">
                <ArrowRightLeft size={12} /> Switch to {cycle === "monthly" ? "Annual" : "Monthly"}
              </button>
            )}
            {isCanceled ? (
              <button onClick={onResume} className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-medium transition-colors">
                <Play size={12} /> Resume
              </button>
            ) : (
              <button onClick={onCancel} className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-red-500/10 text-white/40 hover:text-red-400 text-xs font-medium transition-colors">
                <X size={12} /> Cancel
              </button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/5">
        <div>
          <div className="flex items-center gap-1.5 text-white/30 text-xs mb-1"><Calendar size={11} /> Billing Cycle</div>
          <div className="text-white/70 text-sm capitalize">{cycle}</div>
        </div>
        <div>
          <div className="flex items-center gap-1.5 text-white/30 text-xs mb-1"><RefreshCw size={11} /> Renewal Date</div>
          <div className="text-white/70 text-sm">{renewalDate ? new Date(renewalDate).toLocaleDateString() : "—"}</div>
        </div>
        <div>
          <div className="flex items-center gap-1.5 text-white/30 text-xs mb-1"><CreditCard size={11} /> Payment Method</div>
          <div className="text-white/70 text-sm">{currentPlan.id === "free" ? "—" : "•••• 4242"}</div>
        </div>
        <div>
          <div className="flex items-center gap-1.5 text-white/30 text-xs mb-1"><TrendingUp size={11} /> Next Invoice</div>
          <div className="text-white/70 text-sm">{price === 0 ? "—" : formatCurrency(price, currentPlan.currency)}</div>
        </div>
      </div>
    </div>
  );
}
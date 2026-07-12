import React from "react";
import { DollarSign, Lightbulb } from "lucide-react";
import { COST_PROJECTIONS, COST_CATEGORIES, COST_OPTIMIZATION_RECS } from "@/lib/performanceResilienceEngine";

const PRIORITY_STYLES = {
  Critical: "bg-red-500/10 border-red-500/20 text-red-400",
  High: "bg-amber-500/10 border-amber-500/20 text-amber-400",
  Medium: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",
  Low: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
};

export default function CostProjection() {
  return (
    <div className="space-y-4">
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign size={16} className="text-emerald-400" />
          <h3 className="text-sm font-bold text-white">Monthly Cost Projection</h3>
          <span className="text-[10px] text-white/30 ml-auto">5 user tiers</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {COST_PROJECTIONS.map((c) => {
            const total = c.getTotal();
            return (
              <div key={c.users} className="rounded-lg bg-white/[0.02] border border-white/5 p-4">
                <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">{c.users.toLocaleString()} users</div>
                <div className="text-2xl font-bold text-white mb-0.5">${total.toLocaleString()}</div>
                <div className="text-[9px] text-white/30 mb-3">{c.plan}</div>
                <div className="space-y-1">
                  {COST_CATEGORIES.filter((cat) => c[cat.key] > 0).map((cat) => (
                    <div key={cat.key} className="flex items-center justify-between">
                      <span className="text-[10px] text-white/40">{cat.label}</span>
                      <span className="text-[10px] text-white/60 font-medium">${c[cat.key].toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                  <span className="text-[10px] text-white/30 uppercase tracking-wider">Total/mo</span>
                  <span className="text-xs font-bold text-emerald-400">${total.toLocaleString()}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-3 px-4 py-2 rounded-lg bg-violet-500/5 border border-violet-500/15">
          <p className="text-[10px] text-white/50">
            <span className="text-violet-400 font-medium">AI dominates cost at scale.</span> At 100K users, AI = 76% of total cost.
            At 1M users, AI = 84%. Cost optimization is primarily AI response caching and model routing.
          </p>
        </div>
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb size={14} className="text-amber-400" />
          <h3 className="text-sm font-bold text-white">Optimization Recommendations</h3>
        </div>
        <div className="space-y-2">
          {COST_OPTIMIZATION_RECS.map((r, i) => (
            <div key={i} className="flex items-start gap-3 px-3 py-2 rounded-lg bg-white/[0.02]">
              <span className={`text-[9px] px-1.5 py-0.5 rounded border flex-shrink-0 ${PRIORITY_STYLES[r.priority]}`}>{r.priority}</span>
              <span className="text-[11px] text-white/60 flex-1">{r.rec}</span>
              <span className="text-[10px] text-emerald-400/70 font-medium flex-shrink-0">{r.savings}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
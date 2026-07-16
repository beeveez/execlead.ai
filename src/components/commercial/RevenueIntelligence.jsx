import React from "react";
import { DollarSign, TrendingUp, Crown, BarChart3, ArrowUpRight } from "lucide-react";

const REV_COLORS = { emerald: "text-emerald-400 bg-emerald-500/10", indigo: "text-indigo-400 bg-indigo-500/10", amber: "text-amber-400 bg-amber-500/10", purple: "text-purple-400 bg-purple-500/10" };
const PLAN_BAR_COLORS = { free: "bg-slate-500", professional: "bg-indigo-500", executive: "bg-purple-500", enterprise: "bg-emerald-500", "founding member": "bg-amber-500" };

function RevenueCard({ icon: Icon, label, value, sub, color = "emerald" }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${REV_COLORS[color]}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-xs text-white/40 mt-0.5">{label}</div>
      {sub && <div className="text-xs text-white/30 mt-1">{sub}</div>}
    </div>
  );
}

export default function RevenueIntelligence({ revenue, kpis }) {
  if (!revenue) return null;
  const fmt = (n) => n >= 1000000 ? `$${(n / 1000000).toFixed(2)}M` : n >= 1000 ? `$${(n / 1000).toFixed(1)}K` : `$${n.toFixed(0)}`;
  const maxMix = Math.max(...(revenue.subscriptionMix || []).map(m => m.revenue), 1);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <RevenueCard icon={DollarSign} label="Monthly Recurring Revenue" value={fmt(revenue.mrr)} color="emerald" />
        <RevenueCard icon={TrendingUp} label="MRR Forecast" value={fmt(revenue.mrrForecast)} sub={`+${kpis?.revenueGrowth || 0}% projected`} color="emerald" />
        <RevenueCard icon={DollarSign} label="Annual Recurring Revenue" value={fmt(revenue.arr)} color="indigo" />
        <RevenueCard icon={TrendingUp} label="ARR Forecast" value={fmt(revenue.arrForecast)} color="indigo" />
        <RevenueCard icon={ArrowUpRight} label="30-Day Revenue" value={fmt(revenue.revenue30d)} color="emerald" />
        <RevenueCard icon={ArrowUpRight} label="90-Day Revenue" value={fmt(revenue.revenue90d)} color="emerald" />
        <RevenueCard icon={Crown} label="Founding Member Revenue" value={fmt(revenue.foundingRevenue)} sub="Monthly recurring" color="amber" />
        <RevenueCard icon={DollarSign} label="Average Revenue Per User" value={fmt(kpis?.arpu || 0)} color="purple" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-semibold text-white/70">Subscription Mix</span>
          </div>
          <div className="space-y-2">
            {(revenue.subscriptionMix || []).map((m) => (
              <div key={m.plan} className="flex items-center gap-2">
                <span className="text-xs text-white/60 w-28 capitalize truncate">{m.plan}</span>
                <div className="flex-1 h-5 bg-white/5 rounded overflow-hidden">
                  <div className={`h-full ${PLAN_BAR_COLORS[m.plan] || "bg-indigo-500"} rounded`} style={{ width: `${(m.revenue / maxMix) * 100}%` }} />
                </div>
                <span className="text-xs text-white/60 w-24 text-right">{fmt(m.revenue)} ({m.pct}%)</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-semibold text-white/70">Upgrade Forecast</span>
          </div>
          <div className="space-y-3">
            {(revenue.upgradeForecast || []).map((u) => (
              <div key={u.fromPlan + u.toPlan} className="flex items-center justify-between p-2 bg-white/[0.02] rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/60 capitalize">{u.fromPlan}</span>
                  <ArrowUpRight className="w-3 h-3 text-white/40" />
                  <span className="text-xs text-white/80 capitalize">{u.toPlan}</span>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-emerald-400">+{fmt(u.projectedRevenue)}</div>
                  <div className="text-[10px] text-white/40">{u.projectedUpgrades} upgrades</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
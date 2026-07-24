import React from "react";
import { DollarSign, TrendingUp, Percent, Activity } from "lucide-react";

export default function ProfitabilityDashboard({ profitability }) {
  return (
    <div className="space-y-4">
      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={DollarSign} label="Total Revenue" value={`$${profitability.totalRevenue.toLocaleString()}`} color="#10b981" sub="Pack + Credit revenue" />
        <KpiCard icon={DollarSign} label="AI Cost" value={`$${profitability.aiCost.toFixed(2)}`} color="#ef4444" sub="Compute + API costs" />
        <KpiCard icon={DollarSign} label="Gross Profit" value={`$${profitability.grossProfit.toFixed(2)}`} color="#06b6d4" />
        <KpiCard icon={Percent} label="Gross Margin" value={`${profitability.grossMargin}%`} color={profitability.grossMargin >= 60 ? "#10b981" : "#f59e0b"} />
        <KpiCard icon={TrendingUp} label="Forecasted Revenue" value={`$${profitability.forecastedRevenue.toLocaleString()}`} sub="next month" color="#6366f1" />
        <KpiCard icon={TrendingUp} label="Forecasted Cost" value={`$${profitability.forecastedCost.toFixed(2)}`} sub="next month" color="#f59e0b" />
        <KpiCard icon={Activity} label="ROI" value={`${profitability.roi}%`} color="#a855f7" />
        <KpiCard icon={DollarSign} label="Pack Revenue" value={`$${profitability.packRevenue.toLocaleString()}`} color="#14b8a6" />
      </div>

      {/* Cost by provider */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-3">AI Cost by Provider</h3>
        {profitability.costByProvider.length > 0 ? (
          <div className="space-y-2">
            {profitability.costByProvider.map((p, i) => {
              const max = profitability.costByProvider[0]?.cost || 1;
              return (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs text-white/60 w-24 capitalize">{p.provider}</span>
                  <div className="flex-1 h-5 bg-white/5 rounded-md overflow-hidden">
                    <div className="h-full rounded-md flex items-center pl-2" style={{ width: `${(p.cost / max) * 100}%`, backgroundColor: "#ef4444", minWidth: "40px" }}>
                      <span className="text-[9px] text-white font-medium">{p.percentage}%</span>
                    </div>
                  </div>
                  <span className="text-xs text-white/40 w-16 text-right">${p.cost.toFixed(2)}</span>
                </div>
              );
            })}
          </div>
        ) : <p className="text-white/30 text-xs">No cost data available.</p>}
      </div>

      {/* Revenue breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-3">Revenue Breakdown</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between"><span className="text-xs text-white/60">AI Pack Subscriptions</span><span className="text-sm font-bold text-emerald-400">${profitability.packRevenue.toLocaleString()}</span></div>
            <div className="flex items-center justify-between"><span className="text-xs text-white/60">Credit Purchases</span><span className="text-sm font-bold text-emerald-400">${profitability.creditRevenue.toLocaleString()}</span></div>
            <div className="flex items-center justify-between border-t border-white/5 pt-3"><span className="text-xs text-white/60">Total Revenue</span><span className="text-sm font-bold text-white">${profitability.totalRevenue.toLocaleString()}</span></div>
            <div className="flex items-center justify-between"><span className="text-xs text-white/60">AI Cost</span><span className="text-sm font-bold text-red-400">-${profitability.aiCost.toFixed(2)}</span></div>
            <div className="flex items-center justify-between border-t border-white/5 pt-3"><span className="text-xs text-white/60">Gross Profit</span><span className="text-sm font-bold text-cyan-400">${profitability.grossProfit.toFixed(2)}</span></div>
          </div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-3">Cost by AI Model</h3>
          {profitability.costByModel.length > 0 ? (
            <div className="space-y-2">
              {profitability.costByModel.slice(0, 8).map((m, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="text-white/60">{m.model}</span>
                  <span className="text-white/40">${m.cost.toFixed(2)}</span>
                </div>
              ))}
            </div>
          ) : <p className="text-white/30 text-xs">No model cost data.</p>}
        </div>
      </div>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <Icon size={16} style={{ color }} />
      <div className="text-xl font-bold text-white mt-2">{value}</div>
      <div className="text-xs text-white/40">{label}</div>
      {sub && <div className="text-[10px] text-white/30 mt-0.5">{sub}</div>}
    </div>
  );
}
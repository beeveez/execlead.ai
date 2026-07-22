import React from "react";
import { DollarSign, TrendingUp, Repeat, Target, CreditCard, Filter } from "lucide-react";
import { StatCard, SectionCard, DistributionTable, DonutChartCard, BarChartCard, COLORS, EmptyState } from "./shared";

export default function RevenueTab({ revenue, funnel }) {
  if (!revenue) return <EmptyState />;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={DollarSign} label="MRR" value={`$${(revenue.mrr || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`} color="#10b981" />
        <StatCard icon={TrendingUp} label="ARR" value={`$${(revenue.arr || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`} color="#06b6d4" />
        <StatCard icon={Target} label="ARPU" value={`$${revenue.arpu || 0}`} color="#6366f1" />
        <StatCard icon={Repeat} label="Churn Rate" value={`${revenue.churnRate}%`} color="#ef4444" />
        <StatCard icon={CreditCard} label="Active Subscriptions" value={revenue.totalActive} color="#a855f7" />
        <StatCard icon={Target} label="Conversion Rate" value={`${revenue.conversionRate}%`} color="#f59e0b" />
        <StatCard icon={CreditCard} label="Canceled" value={revenue.totalCanceled} color="#ef4444" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="Subscription Plan Distribution" icon={CreditCard}>
          <DonutChartCard data={revenue.planDist} height={250} />
        </SectionCard>
        <SectionCard title="Subscription Status" icon={Filter}>
          <DistributionTable data={revenue.statusDist} max={6} />
        </SectionCard>
      </div>

      <SectionCard title="Conversion Funnel" icon={Filter}>
        <div className="space-y-3">
          {funnel.map((stage, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-36 text-xs text-white/60">{stage.label}</div>
              <div className="flex-1 relative">
                <div className="h-8 bg-white/5 rounded-md overflow-hidden">
                  <div className="h-full rounded-md flex items-center justify-end pr-2 transition-all" style={{ width: `${stage.pct}%`, backgroundColor: COLORS[i % COLORS.length], minWidth: "50px" }}>
                    <span className="text-[10px] text-white font-medium">{stage.count}</span>
                  </div>
                </div>
              </div>
              <div className="text-[10px] text-white/40 w-16 text-right">Conv: {stage.conversion}%</div>
              <div className="text-[10px] text-red-400/60 w-16 text-right">Drop: {stage.dropoff}%</div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
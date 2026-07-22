import React from "react";
import { Users, Activity, Crown, Building2, Globe, CreditCard, TrendingUp, Target, Repeat } from "lucide-react";
import { StatCard, SectionCard, DonutChartCard } from "./shared";
import ExecutiveInsights from "./ExecutiveInsights";

export default function OverviewTab({ overview, revenue, funnel, data }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Users} label="Total Users" value={overview.totalUsers} color="#6366f1" />
        <StatCard icon={Activity} label="Daily Active" value={overview.dau} sub="DAU" color="#06b6d4" />
        <StatCard icon={Activity} label="Weekly Active" value={overview.wau} sub="WAU" color="#0ea5e9" />
        <StatCard icon={Activity} label="Monthly Active" value={overview.mau} sub="MAU" color="#3b82f6" />
        <StatCard icon={CreditCard} label="Paid Subscribers" value={overview.paidSubscribers} color="#f59e0b" />
        <StatCard icon={Building2} label="Enterprise Orgs" value={overview.enterpriseOrganizations} color="#a855f7" />
        <StatCard icon={Crown} label="Founding Members" value={overview.foundingMembers} color="#f97316" />
        <StatCard icon={Globe} label="Countries" value={overview.countries} color="#10b981" />
        <StatCard icon={Building2} label="Organizations" value={overview.organizations} color="#ec4899" />
        <StatCard icon={TrendingUp} label="Growth Rate" value={`${overview.growthRate}%`} sub="30-day" color="#14b8a6" />
        <StatCard icon={Repeat} label="Retention Rate" value={`${overview.retentionRate}%`} sub="MAU / Total" color="#8b5cf6" />
        <StatCard icon={Target} label="Conversion Rate" value={`${overview.conversionRate}%`} sub="Free → Paid" color="#ef4444" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SectionCard title="Subscription Distribution" icon={CreditCard}>
          {revenue?.planDist?.length > 0 ? <DonutChartCard data={revenue.planDist} /> : <p className="text-white/30 text-sm">No subscription data</p>}
        </SectionCard>
        <SectionCard title="Revenue Snapshot" icon={TrendingUp}>
          <div className="space-y-3">
            <div className="flex justify-between"><span className="text-white/40 text-sm">MRR</span><span className="text-white font-semibold">${(revenue?.mrr || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span></div>
            <div className="flex justify-between"><span className="text-white/40 text-sm">ARR</span><span className="text-white font-semibold">${(revenue?.arr || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span></div>
            <div className="flex justify-between"><span className="text-white/40 text-sm">ARPU</span><span className="text-white font-semibold">${revenue?.arpu || 0}</span></div>
            <div className="flex justify-between"><span className="text-white/40 text-sm">Churn Rate</span><span className="text-white font-semibold">{revenue?.churnRate || 0}%</span></div>
          </div>
        </SectionCard>
      </div>

      <ExecutiveInsights data={data} overview={overview} revenue={revenue} funnel={funnel} />
    </div>
  );
}
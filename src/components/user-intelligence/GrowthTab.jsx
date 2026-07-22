import React from "react";
import { TrendingUp, Globe, Building2 } from "lucide-react";
import { StatCard, SectionCard, TrendChartCard, DistributionTable, EmptyState } from "./shared";

export default function GrowthTab({ growth }) {
  if (!growth) return <EmptyState />;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={TrendingUp} label="Total Growth (30d)" value={growth.userGrowth.slice(-1)[0]?.count || 0} sub="new users this month" color="#6366f1" />
        <StatCard icon={Globe} label="Country Growth" value={growth.countryGrowth.length} sub="countries represented" color="#10b981" />
        <StatCard icon={Building2} label="Industry Growth" value={growth.industryGrowth.length} sub="industries represented" color="#f59e0b" />
      </div>

      <SectionCard title="User Growth — Monthly Trend" icon={TrendingUp}>
        <TrendChartCard data={growth.userGrowth} height={300} color="#6366f1" />
      </SectionCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="Growth by Country" icon={Globe}>
          <DistributionTable data={growth.countryGrowth} max={12} />
        </SectionCard>
        <SectionCard title="Growth by Industry" icon={Building2}>
          <DistributionTable data={growth.industryGrowth} max={12} />
        </SectionCard>
      </div>
    </div>
  );
}
import React from "react";
import { Briefcase, Target, Building2, Clock, TrendingUp } from "lucide-react";
import { StatCard, SectionCard, DistributionTable, BarChartCard, EmptyState } from "./shared";

export default function CareerTab({ career }) {
  if (!career) return <EmptyState />;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Briefcase} label="Current Roles" value={career.currentRoleDist.filter((d) => d.value !== "Unknown").length} color="#6366f1" />
        <StatCard icon={Target} label="Target Roles" value={career.targetRoleDist.filter((d) => d.value !== "Unknown").length} color="#06b6d4" />
        <StatCard icon={Building2} label="Industries" value={career.industryDist.filter((d) => d.value !== "Unknown").length} color="#10b981" />
        <StatCard icon={TrendingUp} label="Companies" value={career.currentCompanyDist.filter((d) => d.value !== "Unknown").length} color="#f59e0b" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="Current Role Distribution" icon={Briefcase}>
          <DistributionTable data={career.currentRoleDist} max={12} />
        </SectionCard>
        <SectionCard title="Target Executive Role" icon={Target}>
          <DistributionTable data={career.targetRoleDist} max={12} />
        </SectionCard>
        <SectionCard title="Industry Intelligence" icon={Building2}>
          <BarChartCard data={career.industryDist.slice(0, 10)} height={280} />
        </SectionCard>
        <SectionCard title="Years of Experience" icon={Clock}>
          <BarChartCard data={career.yearsExperienceDist} height={250} />
        </SectionCard>
        <SectionCard title="Career Stage" icon={TrendingUp}>
          <DistributionTable data={career.careerStageDist} max={10} />
        </SectionCard>
        <SectionCard title="Target Companies" icon={Building2}>
          <DistributionTable data={career.targetCompanyDist} max={10} />
        </SectionCard>
      </div>
    </div>
  );
}
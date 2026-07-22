import React from "react";
import { Users, Globe, Clock, Languages, Monitor, Smartphone } from "lucide-react";
import { StatCard, SectionCard, DistributionTable, BarChartCard, EmptyState } from "./shared";

export default function DemographicsTab({ demo }) {
  if (!demo) return <EmptyState />;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Globe} label="Countries" value={demo.countryDist.filter((d) => d.value !== "Unknown").length} color="#10b981" />
        <StatCard icon={Clock} label="Timezones" value={demo.timezoneDist.filter((d) => d.value !== "Unknown").length} color="#06b6d4" />
        <StatCard icon={Languages} label="Languages" value={demo.languageDist.filter((d) => d.value !== "Unknown").length} color="#a855f7" />
        <StatCard icon={Users} label="Cities" value={demo.cityDist.filter((d) => d.value !== "Unknown").length} color="#f59e0b" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="Users by Country" icon={Globe}>
          <DistributionTable data={demo.countryDist} max={15} />
        </SectionCard>
        <SectionCard title="Users by City" icon={Users}>
          <DistributionTable data={demo.cityDist} max={15} />
        </SectionCard>
        <SectionCard title="Timezone Distribution" icon={Clock}>
          <DistributionTable data={demo.timezoneDist} max={10} />
        </SectionCard>
        <SectionCard title="Preferred Language" icon={Languages}>
          <DistributionTable data={demo.languageDist} max={10} />
        </SectionCard>
        <SectionCard title="Registration Source" icon={Monitor}>
          <DistributionTable data={demo.registrationSourceDist} max={10} />
        </SectionCard>
        <SectionCard title="Device Type" icon={Smartphone}>
          <DistributionTable data={demo.deviceDist} max={8} />
        </SectionCard>
        <SectionCard title="Platform" icon={Monitor}>
          <DistributionTable data={demo.platformDist} max={8} />
        </SectionCard>
        <SectionCard title="Browser" icon={Monitor}>
          <DistributionTable data={demo.browserDist} max={8} />
        </SectionCard>
      </div>
    </div>
  );
}
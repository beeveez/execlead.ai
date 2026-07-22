import React from "react";
import { Building2, Users, DollarSign, Layers } from "lucide-react";
import { StatCard, SectionCard, DistributionTable, BarChartCard, EmptyState } from "./shared";

export default function OrganizationsTab({ orgs }) {
  if (!orgs) return <EmptyState />;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Building2} label="Total Organizations" value={orgs.topOrganizations.length} color="#a855f7" />
        <StatCard icon={Users} label="Total Seats Used" value={orgs.totalSeats} sub={`of ${orgs.totalCapacity}`} color="#6366f1" />
        <StatCard icon={Layers} label="Seat Utilization" value={`${orgs.totalCapacity > 0 ? ((orgs.totalSeats / orgs.totalCapacity) * 100).toFixed(0) : 0}%`} color="#10b981" />
        <StatCard icon={DollarSign} label="Total Annual Value" value={`$${orgs.totalAnnualValue.toLocaleString()}`} color="#f59e0b" />
      </div>

      <SectionCard title="Top Organizations" icon={Building2}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-white/40 border-b border-white/5">
                <th className="text-left py-2 px-2">Organization</th>
                <th className="text-left py-2 px-2">Industry</th>
                <th className="text-left py-2 px-2">Country</th>
                <th className="text-right py-2 px-2">Seats</th>
                <th className="text-right py-2 px-2">Annual Value</th>
                <th className="text-left py-2 px-2">Plan</th>
              </tr>
            </thead>
            <tbody>
              {orgs.topOrganizations.map((org, i) => (
                <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                  <td className="py-2 px-2 text-white/80">{org.name || "—"}</td>
                  <td className="py-2 px-2 text-white/50">{org.industry || "—"}</td>
                  <td className="py-2 px-2 text-white/50">{org.country || "—"}</td>
                  <td className="py-2 px-2 text-right text-white/60">{org.seats_used || 0}/{org.seats_total || 0}</td>
                  <td className="py-2 px-2 text-right text-white/60">${(org.annual_value || 0).toLocaleString()}</td>
                  <td className="py-2 px-2 text-white/50 capitalize">{org.plan || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="Top Companies (User Employers)" icon={Building2}>
          <DistributionTable data={orgs.topCompanies} max={10} />
        </SectionCard>
        <SectionCard title="Organizations by Industry" icon={Layers}>
          <BarChartCard data={orgs.orgByIndustry.slice(0, 10)} height={250} />
        </SectionCard>
        <SectionCard title="Organizations by Country" icon={Building2}>
          <DistributionTable data={orgs.orgByCountry} max={10} />
        </SectionCard>
        <SectionCard title="Organization Plan Distribution" icon={DollarSign}>
          <DistributionTable data={orgs.orgPlanDist} max={6} />
        </SectionCard>
      </div>
    </div>
  );
}
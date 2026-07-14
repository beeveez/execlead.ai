import React, { useState } from "react";
import { Building2, Users, TrendingUp, DollarSign, Shield, Award, Brain } from "lucide-react";
import { SectionCard, StatCard, ScoreRing, StatusBadge, EmptyState } from "./Shared";

export default function Organization360({ data }) {
  const [selectedOrg, setSelectedOrg] = useState(null);
  const { organizations } = data;

  if (!organizations?.length) return <EmptyState message="No organizations found" />;

  const org = selectedOrg || organizations[0];
  const totalRevenue = organizations.reduce((s, o) => s + o.revenue, 0);
  const totalMembers = organizations.reduce((s, o) => s + o.memberCount, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Organizations" value={organizations.length} icon={Building2} accent="indigo" />
        <StatCard label="Total Members" value={totalMembers} icon={Users} accent="cyan" />
        <StatCard label="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} icon={DollarSign} accent="emerald" />
        <StatCard label="Avg Health" value={`${Math.round(organizations.reduce((s, o) => s + o.avgHealth, 0) / organizations.length)}/100`} icon={TrendingUp} accent="purple" />
      </div>

      <div className="flex gap-1 flex-wrap">
        {organizations.slice(0, 10).map((o, i) => (
          <button key={i} onClick={() => setSelectedOrg(o)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${org === o ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30" : "bg-white/5 text-white/40 border border-white/10 hover:text-white/60"}`}>
            {o.organization.name || o.organization.organization_name || `Org ${i + 1}`}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <SectionCard title="Organization Health" icon={TrendingUp}>
          <div className="flex items-center justify-center py-2">
            <ScoreRing score={org.avgHealth} size={80} label="Avg Health" />
          </div>
          <div className="mt-3">
            <StatusBadge status={org.healthLevel} color={org.healthLevel} />
          </div>
        </SectionCard>

        <SectionCard title="Members" icon={Users}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-white/30 text-xs">Total Members</p>
              <p className="text-white text-lg font-bold">{org.memberCount}</p>
            </div>
            <div>
              <p className="text-white/30 text-xs">Active</p>
              <p className="text-emerald-400 text-lg font-bold">{org.activeMembers}</p>
            </div>
          </div>
          <div className="mt-3 space-y-1">
            {org.members.slice(0, 5).map((m, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="text-white/60">{m.fullName || m.email}</span>
                <span className="text-white/40">{m.health.total}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Usage & Revenue" icon={DollarSign}>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-white/40">AI Usage Logs</span>
              <span className="text-white/70">{org.usageCount}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-white/40">Lessons Completed</span>
              <span className="text-white/70">{org.completedLessons}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-white/40">Simulations</span>
              <span className="text-white/70">{org.simulationCount}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-white/40">Invoices</span>
              <span className="text-white/70">{org.invoiceCount}</span>
            </div>
            <div className="flex justify-between text-xs border-t border-white/5 pt-2 mt-2">
              <span className="text-white/40">Revenue</span>
              <span className="text-emerald-400 font-bold">${org.revenue.toLocaleString()}</span>
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Security & Privacy" icon={Shield}>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-white/30 text-xs">Security Events</p>
            <p className="text-white/70 text-lg font-bold">{org.securityEventCount}</p>
          </div>
          <div>
            <p className="text-white/30 text-xs">Active Members</p>
            <p className="text-emerald-400 text-lg font-bold">{org.activeMembers}</p>
          </div>
          <div>
            <p className="text-white/30 text-xs">Health Level</p>
            <div className="mt-1"><StatusBadge status={org.healthLevel} color={org.healthLevel} /></div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
import React from "react";
import { Users, UserPlus, Activity, DollarSign, TrendingUp, TrendingDown, Crown, Building2, Target, Brain, Sparkles, Gauge, Repeat, ArrowUpRight } from "lucide-react";

const COLORS = {
  indigo: "bg-indigo-500/10 text-indigo-400",
  emerald: "bg-emerald-500/10 text-emerald-400",
  amber: "bg-amber-500/10 text-amber-400",
  purple: "bg-purple-500/10 text-purple-400",
  rose: "bg-rose-500/10 text-rose-400",
  cyan: "bg-cyan-500/10 text-cyan-400",
};

function KpiCard({ icon: Icon, label, value, sub, color = "indigo" }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${COLORS[color]}`}>
          <Icon className="w-4 h-4" />
        </div>
        {sub && <span className="text-xs text-white/40">{sub}</span>}
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-xs text-white/40 mt-0.5">{label}</div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-white/60 mb-3">{title}</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">{children}</div>
    </div>
  );
}

function DistributionCard({ title, data, color }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map(d => d.count), 1);
  const barColor = color === "purple" ? "bg-purple-500" : "bg-indigo-500";
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-white/60 mb-3">{title}</h3>
      <div className="space-y-2">
        {data.map((d) => (
          <div key={d.bucket} className="flex items-center gap-2">
            <span className="text-xs text-white/40 w-12">{d.bucket}</span>
            <div className="flex-1 h-5 bg-white/5 rounded overflow-hidden">
              <div className={`h-full ${barColor} rounded transition-all`} style={{ width: `${(d.count / max) * 100}%` }} />
            </div>
            <span className="text-xs text-white/60 w-8 text-right">{d.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CommercialKPIs({ kpis }) {
  if (!kpis) return null;
  const fmt = (n) => n >= 1000 ? `$${(n / 1000).toFixed(1)}K` : `$${n.toFixed(0)}`;

  return (
    <div className="space-y-6">
      <Section title="User Metrics">
        <KpiCard icon={Users} label="Total Users" value={kpis.totalUsers} color="indigo" />
        <KpiCard icon={UserPlus} label="New Today" value={kpis.newUsersToday} color="emerald" />
        <KpiCard icon={UserPlus} label="New This Week" value={kpis.newUsersThisWeek} color="emerald" />
        <KpiCard icon={Activity} label="Active (7d)" value={kpis.active7d} color="cyan" />
        <KpiCard icon={Activity} label="Active (30d)" value={kpis.active30d} color="cyan" />
      </Section>

      <Section title="Membership Breakdown">
        <KpiCard icon={Users} label="Free Members" value={kpis.freeMembers} color="indigo" />
        <KpiCard icon={Sparkles} label="Professional" value={kpis.professionalMembers} color="purple" />
        <KpiCard icon={Crown} label="Executive" value={kpis.executiveMembers} color="amber" />
        <KpiCard icon={Building2} label="Enterprise" value={kpis.enterpriseCustomers} color="emerald" />
        <KpiCard icon={Crown} label="Founding Members" value={`${kpis.foundingMembers} / ${kpis.foundingLimit}`} color="amber" />
      </Section>

      <Section title="Conversion Rates">
        <KpiCard icon={Users} label="Trial Users" value={kpis.trialUsers} color="cyan" />
        <KpiCard icon={Repeat} label="Trial Conversion" value={`${kpis.trialConversionRate}%`} color="emerald" />
        <KpiCard icon={TrendingUp} label="Professional Conv." value={`${kpis.professionalConversionRate}%`} color="purple" />
        <KpiCard icon={TrendingUp} label="Executive Conv." value={`${kpis.executiveConversionRate}%`} color="amber" />
        <KpiCard icon={TrendingUp} label="Enterprise Conv." value={`${kpis.enterpriseConversionRate}%`} color="emerald" />
      </Section>

      <Section title="Revenue Metrics">
        <KpiCard icon={DollarSign} label="MRR" value={fmt(kpis.mrr)} color="emerald" />
        <KpiCard icon={DollarSign} label="ARR" value={fmt(kpis.arr)} color="emerald" />
        <KpiCard icon={DollarSign} label="ARPU" value={fmt(kpis.arpu)} color="indigo" />
        <KpiCard icon={DollarSign} label="Customer LTV" value={fmt(kpis.clv)} color="indigo" />
        <KpiCard icon={kpis.churnRate > 5 ? TrendingDown : TrendingUp} label="Churn Rate" value={`${kpis.churnRate}%`} color={kpis.churnRate > 5 ? "rose" : "emerald"} />
      </Section>

      <Section title="Intelligence Metrics">
        <KpiCard icon={Gauge} label="Avg Executive Score" value={kpis.avgExecScore} color="purple" />
        <KpiCard icon={Brain} label="Avg Identity Completion" value={`${kpis.avgIdentityCompletion}%`} color="indigo" />
        <KpiCard icon={ArrowUpRight} label="Revenue Growth" value={`${kpis.revenueGrowth}%`} color="emerald" />
      </Section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DistributionCard title="Executive Readiness Distribution" data={kpis.execReadinessDistribution} color="purple" />
        <DistributionCard title="Promotion Readiness Distribution" data={kpis.promotionReadinessDistribution} color="indigo" />
      </div>
    </div>
  );
}
import React, { useMemo } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Building2, AlertTriangle, ShieldCheck, DollarSign, TrendingUp, Plus, Star, Gauge } from "lucide-react";
import DashboardKPI from "@/components/enterprise/DashboardKPI";
import {
  computeVendorMetrics, computeSpendByCategory, computeRiskDistribution,
  computePerformanceDistribution, computeTopVendors, formatCurrency,
  getStatusBadge, getRiskBadge, getPerformanceTierBadge,
} from "@/lib/vendorEngine";

const RISK_COLORS = { low: "#10b981", medium: "#f59e0b", high: "#f97316", critical: "#ef4444" };
const TIER_COLORS = { preferred: "#10b981", approved: "#3b82f6", conditional: "#f59e0b", restricted: "#ef4444" };

export default function VendorDashboard({ vendors, onNewVendor, onSelectVendor }) {
  const metrics = useMemo(() => computeVendorMetrics(vendors), [vendors]);
  const spendByCat = useMemo(() => computeSpendByCategory(vendors), [vendors]);
  const riskDist = useMemo(() => computeRiskDistribution(vendors), [vendors]);
  const tierDist = useMemo(() => computePerformanceDistribution(vendors), [vendors]);
  const topVendors = useMemo(() => computeTopVendors(vendors, 8), [vendors]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-white/40 text-sm">Real-time vendor management & risk overview.</p>
        <button onClick={onNewVendor} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors">
          <Plus size={16} /> Add Vendor
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <DashboardKPI icon={Building2} label="Total Vendors" value={metrics.total} color="indigo" />
        <DashboardKPI icon={TrendingUp} label="Active" value={metrics.active} color="emerald" />
        <DashboardKPI icon={DollarSign} label="Total Spend" value={formatCurrency(metrics.totalSpend)} color="blue" />
        <DashboardKPI icon={Gauge} label="Avg Performance" value={metrics.avgPerformance} color={metrics.avgPerformance >= 80 ? "emerald" : metrics.avgPerformance >= 60 ? "amber" : "red"} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <DashboardKPI icon={AlertTriangle} label="At Risk" value={metrics.atRisk} color="red" />
        <DashboardKPI icon={ShieldCheck} label="Compliance Rate" value={`${metrics.complianceRate}%`} color={metrics.complianceRate >= 90 ? "emerald" : "amber"} />
        <DashboardKPI icon={ShieldCheck} label="Security Passed" value={`${metrics.securityRate}%`} color={metrics.securityRate >= 90 ? "emerald" : "amber"} />
        <DashboardKPI icon={Star} label="Preferred" value={metrics.preferred} color="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Risk Distribution">
          {riskDist.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={riskDist} dataKey="count" nameKey="label" cx="50%" cy="50%" outerRadius={80} innerRadius={40}>
                  {riskDist.map((e) => <Cell key={e.id} fill={RISK_COLORS[e.id]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#0d0d14", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <EmptyChart />}
          <div className="flex flex-wrap gap-2 mt-2">
            {riskDist.map((r) => (
              <span key={r.id} className="flex items-center gap-1.5 text-xs text-white/50">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: RISK_COLORS[r.id] }} />
                {r.label} ({r.count})
              </span>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Spend by Category">
          {spendByCat.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={spendByCat} layout="vertical" margin={{ left: 10 }}>
                <XAxis type="number" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} />
                <YAxis type="category" dataKey="label" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }} width={100} />
                <Tooltip contentStyle={{ background: "#0d0d14", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} formatter={(v) => [formatCurrency(v), "Spend"]} />
                <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyChart />}
        </ChartCard>
      </div>

      <ChartCard title="Top Vendors by Spend">
        {topVendors.length > 0 ? (
          <div className="space-y-2">
            {topVendors.map((v, i) => {
              const risk = getRiskBadge(v.risk_level);
              return (
                <button key={v.id} onClick={() => onSelectVendor(vendors.find((x) => x.id === v.id))} className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] hover:bg-white/5 transition-colors text-left">
                  <span className="text-xs font-mono text-white/30 w-6">#{i + 1}</span>
                  <span className="text-sm text-white/80 truncate flex-1">{v.name}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${risk.badge} shrink-0`}>{risk.label}</span>
                  <span className="text-xs text-white/40 shrink-0 w-20 text-right">{formatCurrency(v.spend)}</span>
                </button>
              );
            })}
          </div>
        ) : <div className="text-center py-8 text-white/30 text-sm">No vendor data yet.</div>}
        </ChartCard>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <h3 className="text-white/80 text-sm font-semibold uppercase tracking-wider mb-3">{title}</h3>
      {children}
    </div>
  );
}
function EmptyChart() { return <div className="h-[220px] flex items-center justify-center text-white/20 text-sm">No data yet</div>; }
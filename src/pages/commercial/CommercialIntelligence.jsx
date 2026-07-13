import React, { useState, useEffect, useMemo } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, LineChart, Line, Area, AreaChart } from "recharts";
import { DollarSign, TrendingUp, Building2, ShoppingCart, FileText, PiggyBank, Gauge, Activity, Loader2, Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";
import DashboardKPI from "@/components/enterprise/DashboardKPI";
import { formatCurrency, computeCommercialMetrics, computeSpendByCategory, computeMonthlySpendTrend, computeVendorPerformanceRanking, computeProcurementPipeline } from "@/lib/commercialEngine";
import { getRiskBadge, formatCurrency as formatVendorCurrency } from "@/lib/vendorEngine";

const CATEGORY_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"];

export default function CommercialIntelligence() {
  const [procurementRequests, setProcurementRequests] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [cpqQuotes, setCpqQuotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const reqs = await base44.entities.ProcurementRequest.list("-created_date", 500);
        setProcurementRequests(Array.isArray(reqs) ? reqs : []);
      } catch (e) { console.error("Procurement load failed:", e); }
      try {
        const vends = await base44.entities.Vendor.list("-created_date", 500);
        setVendors(Array.isArray(vends) ? vends : []);
      } catch (e) { console.error("Vendor load failed:", e); }
      try {
        const quotes = await base44.entities.CPQQuote.list("-created_date", 200);
        setCpqQuotes(Array.isArray(quotes) ? quotes : []);
      } catch (e) { console.error("CPQ quotes load failed:", e); }
      setLoading(false);
    };
    loadData();
  }, []);

  const metrics = useMemo(() => computeCommercialMetrics(procurementRequests, vendors, cpqQuotes), [procurementRequests, vendors, cpqQuotes]);
  const spendByCat = useMemo(() => computeSpendByCategory(procurementRequests, vendors), [procurementRequests, vendors]);
  const monthlyTrend = useMemo(() => computeMonthlySpendTrend(procurementRequests), [procurementRequests]);
  const vendorRanking = useMemo(() => computeVendorPerformanceRanking(vendors, 8), [vendors]);
  const pipeline = useMemo(() => computeProcurementPipeline(procurementRequests), [procurementRequests]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-indigo-400" size={24} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
          <Sparkles size={12} className="text-indigo-400" /> Enterprise Commercial Platform™
        </div>
        <h1 className="text-2xl font-bold text-white">Commercial Intelligence™</h1>
        <p className="text-white/40 text-sm mt-1">Unified spend analytics, procurement pipeline, vendor performance, budget consumption, and savings intelligence.</p>
      </div>

      {/* Commercial KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <DashboardKPI icon={DollarSign} label="Total Commercial Spend" value={formatCurrency(metrics.totalCommercialSpend)} color="indigo" />
        <DashboardKPI icon={TrendingUp} label="Pipeline Value" value={formatCurrency(metrics.totalPipeline)} color="amber" />
        <DashboardKPI icon={Building2} label="Vendor Spend" value={formatCurrency(metrics.vendorSpend)} color="blue" />
        <DashboardKPI icon={FileText} label="Contract Value" value={formatCurrency(metrics.totalContractValue)} color="emerald" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <DashboardKPI icon={ShoppingCart} label="Procurement Spend" value={formatCurrency(metrics.procurementSpend)} color="teal" />
        <DashboardKPI icon={FileText} label="CPQ Pipeline" value={formatCurrency(metrics.cpqPipeline)} color="blue" />
        <DashboardKPI icon={Gauge} label="Budget Utilization" value={`${metrics.budgetUtilization}%`} color={metrics.budgetUtilization > 80 ? "red" : "blue"} />
        <DashboardKPI icon={PiggyBank} label="Savings Opportunities" value={formatCurrency(metrics.savingsOpportunities)} color="emerald" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Spend by Category" icon={PieChart}>
          {spendByCat.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={spendByCat} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={90} innerRadius={45}>
                  {spendByCat.map((_, i) => <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => [formatCurrency(v), "Spend"]} />
              </PieChart>
            </ResponsiveContainer>
          ) : <EmptyChart />}
          <div className="flex flex-wrap gap-2 mt-2">
            {spendByCat.map((s, i) => (
              <span key={s.id} className="flex items-center gap-1.5 text-xs text-white/50">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} />
                {s.label} ({formatCurrency(s.value)})
              </span>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Monthly Spend Trend" icon={Activity}>
          {monthlyTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={monthlyTrend}>
                <defs>
                  <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} tickFormatter={(v) => formatCurrency(v)} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => [formatCurrency(v), "Spend"]} />
                <Area type="monotone" dataKey="spend" stroke="#6366f1" strokeWidth={2} fill="url(#spendGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : <EmptyChart />}
        </ChartCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Procurement Pipeline" icon={ShoppingCart}>
          {pipeline.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={pipeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="status" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} tickFormatter={(v) => v.replace(/_/g, " ")} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v, n) => [n === "count" ? v : formatCurrency(v), n === "count" ? "Requests" : "Value"]} />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyChart />}
        </ChartCard>

        <ChartCard title="Top Vendor Performance" icon={Building2}>
          {vendorRanking.length > 0 ? (
            <div className="space-y-2">
              {vendorRanking.map((v, i) => {
                const risk = getRiskBadge(v.risk_level);
                return (
                  <div key={v.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.02]">
                    <span className="text-xs font-mono text-white/30 w-6">#{i + 1}</span>
                    <span className="text-sm text-white/80 truncate flex-1">{v.name}</span>
                    <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${v.performance >= 80 ? "bg-emerald-500" : v.performance >= 60 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${v.performance}%` }} />
                    </div>
                    <span className={`text-xs ${v.performance >= 80 ? "text-emerald-400" : v.performance >= 60 ? "text-amber-400" : "text-red-400"} w-8 text-right`}>{v.performance}</span>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full border ${risk.badge} shrink-0`}>{risk.label}</span>
                  </div>
                );
              })}
            </div>
          ) : <EmptyChart />}
        </ChartCard>
      </div>

      {/* Budget & Savings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Gauge size={14} className="text-indigo-400" />
            <h3 className="text-white/80 text-sm font-semibold uppercase tracking-wider">Budget Consumption</h3>
          </div>
          <div className="flex items-center justify-center py-4">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                <circle cx="50" cy="50" r="40" fill="none" stroke={metrics.budgetUtilization > 80 ? "#ef4444" : metrics.budgetUtilization > 60 ? "#f59e0b" : "#10b981"} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 40}`} strokeDashoffset={`${2 * Math.PI * 40 * (1 - metrics.budgetUtilization / 100)}`} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-white">{metrics.budgetUtilization}%</span>
                <span className="text-[9px] text-white/30">Utilized</span>
              </div>
            </div>
          </div>
          <div className="text-center text-xs text-white/40">of {formatCurrency(metrics.totalContractValue)} contract value</div>
        </div>

        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <PiggyBank size={14} className="text-emerald-400" />
            <h3 className="text-white/80 text-sm font-semibold uppercase tracking-wider">Savings Intelligence™</h3>
          </div>
          <div className="space-y-2">
            <SavingsRow label="Identified Opportunities" value={formatCurrency(metrics.savingsOpportunities)} />
            <SavingsRow label="Procurement Spend" value={formatCurrency(metrics.procurementSpend)} />
            <SavingsRow label="Pending Procurement" value={formatCurrency(metrics.pendingProcurement)} />
            <SavingsRow label="CPQ Closed Won" value={formatCurrency(metrics.cpqClosed)} />
            <SavingsRow label="Avg Vendor Performance" value={`${metrics.avgVendorPerformance}/100`} />
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Activity size={14} className="text-amber-400" />
            <h3 className="text-white/80 text-sm font-semibold uppercase tracking-wider">Pipeline Summary</h3>
          </div>
          <div className="space-y-2">
            <PipelineRow label="Approved Requests" value={metrics.approvedReqs} color="text-emerald-400" />
            <PipelineRow label="Pending Approval" value={metrics.pendingReqs} color="text-amber-400" />
            <PipelineRow label="Rejected" value={metrics.rejectedReqs} color="text-red-400" />
            <PipelineRow label="Active Vendors" value={metrics.activeVendors} color="text-blue-400" />
            <PipelineRow label="At-Risk Vendors" value={metrics.atRiskVendors} color="text-red-400" />
          </div>
        </div>
      </div>
    </div>
  );
}

const tooltipStyle = { background: "#0d0d14", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 };

function ChartCard({ title, icon: Icon, children }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        {Icon && <Icon size={14} className="text-indigo-400" />}
        <h3 className="text-white/80 text-sm font-semibold uppercase tracking-wider">{title}</h3>
      </div>
      {children}
    </div>
  );
}
function EmptyChart() { return <div className="h-[240px] flex items-center justify-center text-white/20 text-sm">No data yet</div>; }
function SavingsRow({ label, value }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-white/50">{label}</span>
      <span className="text-white/80 font-medium">{value}</span>
    </div>
  );
}
function PipelineRow({ label, value, color }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-white/50">{label}</span>
      <span className={`font-medium ${color}`}>{value}</span>
    </div>
  );
}
import React, { useMemo } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import {
  ShoppingCart, Clock, DollarSign, CheckCircle2, AlertTriangle,
  TrendingUp, Plus, Activity, Gauge,
} from "lucide-react";
import DashboardKPI from "@/components/enterprise/DashboardKPI";
import {
  computeDashboardMetrics, computeStatusDistribution, computeCategoryBreakdown,
  computeSLASummary, formatCurrency, getStatusBadge, getPriorityBadge, getSLABadgeClass,
} from "@/lib/procurementEngine";

const STATUS_COLORS = {
  draft: "#6b7280", pending_approval: "#f59e0b", approved: "#10b981",
  rejected: "#ef4444", fulfilled: "#14b8a6", cancelled: "#6b7280", withdrawn: "#6b7280",
};

export default function ProcurementDashboard({ requests, onNewRequest, onSelectRequest }) {
  const metrics = useMemo(() => computeDashboardMetrics(requests), [requests]);
  const statusDist = useMemo(() => computeStatusDistribution(requests), [requests]);
  const categoryBreakdown = useMemo(() => computeCategoryBreakdown(requests), [requests]);
  const slaSummary = useMemo(() => computeSLASummary(requests), [requests]);
  const recent = useMemo(
    () => [...(requests || [])].sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).slice(0, 5),
    [requests]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-white/40 text-sm">Real-time procurement governance overview.</p>
        <button onClick={onNewRequest} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors">
          <Plus size={16} /> New Procurement Request
        </button>
      </div>

      {/* Row 1: Core KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <DashboardKPI icon={ShoppingCart} label="Total Requests" value={metrics.total} color="indigo" />
        <DashboardKPI icon={Clock} label="Pending Approval" value={metrics.pending} sub={formatCurrency(metrics.pendingSpend)} color="amber" />
        <DashboardKPI icon={DollarSign} label="Total Spend" value={formatCurrency(metrics.totalSpend)} color="emerald" />
        <DashboardKPI icon={Gauge} label="SLA Compliance" value={`${metrics.slaCompliance}%`} color={metrics.slaCompliance >= 90 ? "emerald" : metrics.slaCompliance >= 70 ? "amber" : "red"} />
      </div>

      {/* Row 2: Status KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <DashboardKPI icon={CheckCircle2} label="Approved" value={metrics.approved} color="emerald" />
        <DashboardKPI icon={AlertTriangle} label="Rejected" value={metrics.rejected} color="red" />
        <DashboardKPI icon={TrendingUp} label="Fulfilled" value={metrics.fulfilled} color="teal" />
        <DashboardKPI icon={Activity} label="Budget Utilization" value={`${metrics.budgetUtilization}%`} color={metrics.budgetUtilization > 80 ? "red" : "blue"} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <PieChartIcon />
            <h3 className="text-white/80 text-sm font-semibold uppercase tracking-wider">Status Distribution</h3>
          </div>
          {statusDist.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusDist} dataKey="count" nameKey="label" cx="50%" cy="50%" outerRadius={80} innerRadius={40}>
                  {statusDist.map((entry) => <Cell key={entry.id} fill={STATUS_COLORS[entry.id]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#0d0d14", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <EmptyChart />}
          <div className="flex flex-wrap gap-2 mt-2">
            {statusDist.map((s) => (
              <span key={s.id} className="flex items-center gap-1.5 text-xs text-white/50">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_COLORS[s.id] }} />
                {s.label} ({s.count})
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <BarChartIcon />
            <h3 className="text-white/80 text-sm font-semibold uppercase tracking-wider">Category Breakdown</h3>
          </div>
          {categoryBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={categoryBreakdown} layout="vertical" margin={{ left: 10 }}>
                <XAxis type="number" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} />
                <YAxis type="category" dataKey="label" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }} width={100} />
                <Tooltip contentStyle={{ background: "#0d0d14", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} formatter={(v) => [`${v} requests`, "Count"]} />
                <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyChart />}
        </div>
      </div>

      {/* SLA Summary */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Clock size={14} className="text-indigo-400" />
          <h3 className="text-white/80 text-sm font-semibold uppercase tracking-wider">SLA Tracking™</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <SLACard label="On Track" count={slaSummary.on_track} color="emerald" />
          <SLACard label="At Risk" count={slaSummary.at_risk} color="amber" />
          <SLACard label="Breached" count={slaSummary.breached} color="red" />
        </div>
      </div>

      {/* Recent Requests */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white/80 text-sm font-semibold uppercase tracking-wider">Recent Requests</h3>
        </div>
        {recent.length > 0 ? (
          <div className="space-y-2">
            {recent.map((r) => {
              const status = getStatusBadge(r.status);
              const priority = getPriorityBadge(r.priority);
              return (
                <button key={r.id} onClick={() => onSelectRequest(r)} className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] hover:bg-white/5 transition-colors text-left">
                  <span className="text-xs font-mono text-indigo-400 shrink-0">{r.request_number}</span>
                  <span className="text-sm text-white/80 truncate flex-1">{r.title}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${priority.badge} shrink-0`}>{priority.label}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${status.badge} shrink-0`}>{status.label}</span>
                  <span className="text-xs text-white/40 shrink-0">{formatCurrency(r.amount, r.currency)}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-white/30 text-sm">No procurement requests yet. Create your first request to get started.</div>
        )}
      </div>
    </div>
  );
}

function SLACard({ label, count, color }) {
  const colorMap = { emerald: "text-emerald-400 bg-emerald-500/10", amber: "text-amber-400 bg-amber-500/10", red: "text-red-400 bg-red-500/10" };
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02]">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorMap[color]}`}>
        <span className="text-lg font-bold">{count}</span>
      </div>
      <span className="text-white/50 text-sm">{label}</span>
    </div>
  );
}
function PieChartIcon() { return <div className="w-4 h-4 rounded-full border-2 border-indigo-400/40 border-t-indigo-400" />; }
function BarChartIcon() { return <div className="w-4 h-4 flex items-end gap-0.5"><div className="w-1 h-2 bg-indigo-400/60" /><div className="w-1 h-3 bg-indigo-400" /><div className="w-1 h-1.5 bg-indigo-400/40" /></div>; }
function EmptyChart() { return <div className="h-[220px] flex items-center justify-center text-white/20 text-sm">No data yet</div>; }
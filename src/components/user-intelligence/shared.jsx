import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
  AreaChart, Area, CartesianGrid, RadialBarChart, RadialBar,
} from "recharts";

export const COLORS = ["#6366f1", "#06b6d4", "#a855f7", "#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#ec4899", "#14b8a6", "#f97316"];

const tooltipStyle = {
  background: "#0d0d14", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12,
};

export function StatCard({ icon: Icon, label, value, sub, color = "#6366f1" }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      {Icon && <Icon size={16} style={{ color }} />}
      <div className="text-2xl font-bold text-white mt-2">{value}</div>
      <div className="text-xs text-white/40">{label}</div>
      {sub && <div className="text-[10px] text-white/30 mt-0.5">{sub}</div>}
    </div>
  );
}

export function SectionCard({ title, children, action, icon: Icon }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          {Icon && <Icon size={14} className="text-indigo-400" />} {title}
        </h3>
        {action}
      </div>
      {children}
    </div>
  );
}

export function DistributionTable({ data, max = 10 }) {
  const total = data.reduce((sum, d) => sum + d.count, 0) || 1;
  return (
    <div className="space-y-2">
      {data.slice(0, max).map((d, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="w-28 md:w-36 text-xs text-white/60 truncate capitalize">{d.value}</div>
          <div className="flex-1 h-5 bg-white/5 rounded-md overflow-hidden">
            <div className="h-full rounded-md transition-all" style={{ width: `${(d.count / total) * 100}%`, backgroundColor: COLORS[i % COLORS.length] }} />
          </div>
          <div className="text-xs text-white/40 w-8 text-right">{d.count}</div>
          <div className="text-[10px] text-white/30 w-10 text-right">{((d.count / total) * 100).toFixed(0)}%</div>
        </div>
      ))}
    </div>
  );
}

export function BarChartCard({ data, dataKey = "count", nameKey = "value", height = 250 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey={nameKey} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} angle={-30} textAnchor="end" height={60} interval={0} />
        <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
        <Bar dataKey={dataKey} radius={[4, 4, 0, 0]}>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function DonutChartCard({ data, height = 250 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={data} dataKey="count" nameKey="value" cx="50%" cy="50%" outerRadius={80} innerRadius={50}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}
          style={{ fontSize: 10, fill: "rgba(255,255,255,0.6)" }}>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function TrendChartCard({ data, dataKey = "count", nameKey = "month", height = 250, color = "#6366f1" }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey={nameKey} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} />
        <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} />
        <Tooltip contentStyle={tooltipStyle} />
        <Area type="monotone" dataKey={dataKey} stroke={color} fill={`url(#grad-${color})`} strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function LoadingState({ message = "Loading intelligence data…" }) {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-4 border-indigo-900 border-t-indigo-400 rounded-full animate-spin mr-3" />
      <span className="text-white/40 text-sm">{message}</span>
    </div>
  );
}

export function EmptyState({ message = "No data available" }) {
  return <div className="text-center py-12"><p className="text-white/30 text-sm">{message}</p></div>;
}
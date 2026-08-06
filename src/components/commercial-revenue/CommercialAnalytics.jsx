import React from "react";
import { BarChart3, PieChart as PieIcon } from "lucide-react";
import { SectionHeader, BetaBanner, fmtCurrency, fmtNum, StatusPill, MetricRow } from "./shared";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const PIE_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#a855f7", "#0ea5e9", "#f43f5e", "#84cc16"];

export default function CommercialAnalytics({ kpis, quotes, subscriptions, orgs }) {
  const industry = group(quotes, "industry", "annual_value");
  const geography = group(quotes, "country", "annual_value");
  const size = group(quotes, "company_size", "annual_value");
  const planMix = group(subscriptions, "plan", null, true);

  const mixData = Object.entries(planMix).map(([name, value]) => ({ name, value }));
  const revenueMix = [
    { name: "Enterprise SaaS", value: kpis.mrr.value * 12 },
    { name: "Won Enterprise", value: kpis._meta.wonARR },
    { name: "Collected", value: kpis._meta.collectedRevenue },
  ];

  return (
    <div>
      <SectionHeader icon={BarChart3} title="Commercial Analytics™" subtitle="Revenue mix, recurring vs non-recurring, margins, waterfalls, churn, and revenue concentration." />
      <BetaBanner />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <ChartCard title="Revenue Mix"><ResponsiveContainer width="100%" height={220}><PieChart><Pie data={revenueMix} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={(e) => e.name}>{revenueMix.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}</Pie><Tooltip formatter={(v) => fmtCurrency(v)} contentStyle={{ background: "#0d0d14", border: "1px solid rgba(255,255,255,0.1)", fontSize: 12 }} /></PieChart></ResponsiveContainer></ChartCard>
        <ChartCard title="Customer Plan Mix"><ResponsiveContainer width="100%" height={220}><PieChart><Pie data={mixData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={(e) => e.name}>{mixData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}</Pie><Tooltip contentStyle={{ background: "#0d0d14", border: "1px solid rgba(255,255,255,0.1)", fontSize: 12 }} /></PieChart></ResponsiveContainer></ChartCard>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <ChartCard title="Revenue by Industry">
          <ResponsiveContainer width="100%" height={200}><BarChart data={Object.entries(industry).map(([k, v]) => ({ name: k, value: v }))} layout="vertical" margin={{ left: 20 }}><CartesianGrid stroke="rgba(255,255,255,0.05)" /><XAxis type="number" stroke="rgba(255,255,255,0.4)" fontSize={11} tickFormatter={fmtCurrency} /><YAxis type="category" dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={11} width={70} /><Tooltip formatter={(v) => fmtCurrency(v)} contentStyle={{ background: "#0d0d14", border: "1px solid rgba(255,255,255,0.1)", fontSize: 12 }} /><Bar dataKey="value" fill="#6366f1" /></BarChart></ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Revenue by Geography">
          <ResponsiveContainer width="100%" height={200}><BarChart data={Object.entries(geography).map(([k, v]) => ({ name: k, value: v }))} layout="vertical" margin={{ left: 20 }}><CartesianGrid stroke="rgba(255,255,255,0.05)" /><XAxis type="number" stroke="rgba(255,255,255,0.4)" fontSize={11} tickFormatter={fmtCurrency} /><YAxis type="category" dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={11} width={70} /><Tooltip formatter={(v) => fmtCurrency(v)} contentStyle={{ background: "#0d0d14", border: "1px solid rgba(255,255,255,0.1)", fontSize: 12 }} /><Bar dataKey="value" fill="#10b981" /></BarChart></ResponsiveContainer>
        </ChartCard>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
        <h3 className="text-white text-sm font-semibold mb-2">Financial Metrics (architecture — awaiting GA data)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
          {["Recurring vs Non-Recurring", "Gross Margin", "Contribution Margin", "Revenue per Employee", "Revenue per Customer", "ARR Waterfall", "MRR Waterfall", "Expansion Waterfall", "Churn Analysis", "Revenue Concentration"].map((m) => <MetricRow key={m} label={m} value="—" kind="architecture" />)}
        </div>
      </div>
    </div>
  );
}

function group(arr, key, val, countMode) {
  const m = {};
  arr.forEach((o) => { const k = o[key] || "Unknown"; m[k] = countMode ? (m[k] || 0) + 1 : (m[k] || 0) + (o[val] || 0); });
  return m;
}
function ChartCard({ title, children }) {
  return <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4"><h3 className="text-white text-sm font-semibold mb-3">{title}</h3>{children}</div>;
}
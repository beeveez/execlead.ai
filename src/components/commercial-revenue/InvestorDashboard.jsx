import React from "react";
import { Landmark } from "lucide-react";
import { SectionHeader, BetaBanner, KpiCard, fmtCurrency, fmtNum } from "./shared";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { forecastScenarios } from "@/lib/commercialRevenueEngine";

export default function InvestorDashboard({ kpis, orgs }) {
  const fc = forecastScenarios(kpis.arr.value || 0, 24);
  const data = Array.from({ length: 9 }, (_, i) => {
    const m = i * 3; let a = kpis.arr.value || 0; for (let j = 0; j < m; j++) a *= 1.06; return { period: `M${m}`, arr: Math.round(a) };
  });
  const topCustomers = [...orgs].sort((a, b) => (b.annual_value || 0) - (a.annual_value || 0)).slice(0, 5);

  return (
    <div>
      <SectionHeader icon={Landmark} title="Investor Dashboard™" subtitle="Board-level and investor-ready metrics, growth, retention, and forecast — one executive view." />
      <BetaBanner />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
        <KpiCard label="ARR" value={fmtCurrency(kpis.arr.value)} kind="projected" />
        <KpiCard label="MRR" value={fmtCurrency(kpis.mrr.value)} kind="projected" />
        <KpiCard label="Pipeline" value={fmtCurrency(kpis.pipeline_value.value)} kind="live" />
        <KpiCard label="Enterprise Customers" value={fmtNum(kpis.enterprise_customers.value)} kind="live" />
        <KpiCard label="NRR" value="—" kind="architecture" description="Net Revenue Retention — cohort data at GA." />
        <KpiCard label="GRR" value="—" kind="architecture" />
        <KpiCard label="CAC" value="—" kind="architecture" />
        <KpiCard label="LTV" value="—" kind="architecture" />
        <KpiCard label="Payback Period" value="—" kind="architecture" />
        <KpiCard label="Burn Multiple" value="—" kind="architecture" description="Net burn / net new ARR (optional)." />
        <KpiCard label="Rule of 40" value="—" kind="architecture" description="Growth % + margin % (optional)." />
        <KpiCard label="Gross Margin" value="—" kind="architecture" />
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 mb-4">
        <h3 className="text-white text-sm font-semibold mb-3">24-Month ARR Forecast (Expected)</h3>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="period" stroke="rgba(255,255,255,0.4)" fontSize={11} />
            <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} tickFormatter={fmtCurrency} width={55} />
            <Tooltip formatter={(v) => fmtCurrency(v)} contentStyle={{ background: "#0d0d14", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} />
            <Line type="monotone" dataKey="arr" stroke="#10b981" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <h3 className="text-white text-sm font-semibold mb-2">Top Customers by Contract Value</h3>
          {topCustomers.length ? topCustomers.map((c) => (
            <div key={c.id} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0"><span className="text-xs text-white/70">{c.name}</span><span className="text-xs text-white/80 font-medium">{fmtCurrency(c.annual_value || 0)}</span></div>
          )) : <p className="text-white/40 text-xs">No enterprise customers yet.</p>}
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <h3 className="text-white text-sm font-semibold mb-2">Revenue Mix & Expansion Rate</h3>
          <div className="space-y-1.5 text-xs text-white/60">
            <div className="flex justify-between"><span>Enterprise SaaS ARR</span><span className="text-white/80">{fmtCurrency(kpis.arr.value)}</span></div>
            <div className="flex justify-between"><span>Won Enterprise ARR</span><span className="text-white/80">{fmtCurrency(kpis._meta.wonARR)}</span></div>
            <div className="flex justify-between"><span>Collected Revenue</span><span className="text-white/80">{fmtCurrency(kpis._meta.collectedRevenue)}</span></div>
            <div className="flex justify-between"><span>Expansion Rate</span><span className="text-white/80">—</span></div>
            <div className="flex justify-between"><span>24-Mo Expected ARR</span><span className="text-emerald-400 font-medium">{fmtCurrency(fc.expected)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
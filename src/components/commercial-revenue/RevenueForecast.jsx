import React, { useState } from "react";
import { LineChart, Loader2 } from "lucide-react";
import { SectionHeader, BetaBanner, fmtCurrency } from "./shared";
import { forecastScenarios } from "@/lib/commercialRevenueEngine";
import { LineChart as RLine, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

const HORIZONS = [{ months: 12, label: "12 Months" }, { months: 24, label: "24 Months" }, { months: 36, label: "36 Months" }];
const SEGMENTS = ["Revenue Engine", "Customer Segment", "Region", "Industry", "Enterprise Tier"];

export default function RevenueForecast({ kpis }) {
  const [horizon, setHorizon] = useState(12);
  const [segment, setSegment] = useState(SEGMENTS[0]);
  const base = kpis.arr.value || kpis._meta.collectedRevenue || 0;
  const fc = forecastScenarios(base, horizon);

  const data = Array.from({ length: Math.ceil(horizon / 3) + 1 }, (_, i) => {
    const m = i * 3;
    const proj = (rate) => { let a = base; for (let j = 0; j < m; j++) a *= 1 + rate; return Math.round(a); };
    return { period: `M${m}`, best: proj(0.10), expected: proj(0.06), conservative: proj(0.03) };
  });

  return (
    <div>
      <SectionHeader icon={LineChart} title="Revenue Forecast™" subtitle="Best / Expected / Conservative scenarios by revenue engine, segment, region, industry, and enterprise tier." />
      <BetaBanner />
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="flex items-center gap-1.5">{HORIZONS.map((h) => <button key={h.months} onClick={() => setHorizon(h.months)} className={`px-3 py-1.5 rounded-full text-xs font-medium ${horizon === h.months ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30" : "text-white/40 border border-transparent"}`}>{h.label}</button>)}</div>
        <select value={segment} onChange={(e) => setSegment(e.target.value)} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white">
          {SEGMENTS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-4">
        <ScenarioCard label="Best Case" value={fmtCurrency(fc.best)} color="text-emerald-400" />
        <ScenarioCard label="Expected" value={fmtCurrency(fc.expected)} color="text-indigo-400" />
        <ScenarioCard label="Conservative" value={fmtCurrency(fc.conservative)} color="text-amber-400" />
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 mb-4">
        <h3 className="text-white text-sm font-semibold mb-3">Forecast Trajectory ({segment})</h3>
        <ResponsiveContainer width="100%" height={260}>
          <RLine data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="period" stroke="rgba(255,255,255,0.4)" fontSize={11} />
            <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} tickFormatter={(v) => fmtCurrency(v)} width={55} />
            <Tooltip formatter={(v) => fmtCurrency(v)} contentStyle={{ background: "#0d0d14", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line type="monotone" dataKey="best" stroke="#10b981" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="expected" stroke="#6366f1" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="conservative" stroke="#f59e0b" strokeWidth={2} dot={false} />
          </RLine>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <InfoCard label="Forecast Accuracy" value="Architecture" text="Actual vs. forecasted variance — activates with forecast history." />
        <InfoCard label="Pipeline Contribution" value={fmtCurrency(kpis.pipeline_value.value)} text="Open enterprise quote annual value feeding the forecast." kind="live" />
        <InfoCard label="Renewal & Expansion Forecast" value="Architecture" text="Cohort-based renewal and expansion projections activate at GA." />
      </div>
      <p className="text-[10px] text-white/35 mt-4">Forecasts are illustrative scenario projections from current ARR/pipeline at assumed growth rates (10%/6%/3% monthly). Not guarantees.</p>
    </div>
  );
}

function ScenarioCard({ label, value, color }) {
  return <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4"><div className="text-[10px] uppercase tracking-wider text-white/40 font-semibold mb-1">{label}</div><div className={`text-xl font-bold ${color}`}>{value}</div></div>;
}
function InfoCard({ label, value, text, kind }) {
  return <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4"><div className="text-[10px] uppercase tracking-wider text-white/40 font-semibold mb-1">{label}</div><div className="text-sm font-bold text-white">{value}</div>{kind && <span className="text-[9px] text-emerald-400 uppercase">{kind}</span>}<p className="text-[11px] text-white/45 mt-1">{text}</p></div>;
}
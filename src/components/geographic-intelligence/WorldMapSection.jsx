import React, { useState } from "react";
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import { Globe, MapPin, Users, DollarSign, TrendingUp, Building2 } from "lucide-react";
import { SectionCard, COLORS } from "@/components/user-intelligence/shared";

const METRICS = [
  { id: "users", label: "Total Users", icon: Users },
  { id: "activeUsers", label: "Active Users", icon: Users },
  { id: "mrr", label: "Revenue (MRR)", icon: DollarSign },
  { id: "growthRate", label: "Growth Rate", icon: TrendingUp },
  { id: "execSubs", label: "Executive Subscribers", icon: Building2 },
];

const tooltipStyle = { background: "#0d0d14", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 };

export default function WorldMapSection({ data, selectedCountry, setSelectedCountry }) {
  const [metric, setMetric] = useState("users");
  const countries = (data?.countries || []).filter((c) => c.country !== "Unknown");
  const maxValue = Math.max(...countries.map((c) => parseFloat(c[metric]) || 0), 1);

  const getIntensity = (val) => {
    const ratio = parseFloat(val) / maxValue;
    if (ratio > 0.75) return "#10b981";
    if (ratio > 0.5) return "#06b6d4";
    if (ratio > 0.25) return "#6366f1";
    if (ratio > 0) return "#a855f7";
    return "rgba(255,255,255,0.05)";
  };

  const selected = countries.find((c) => c.country === selectedCountry);

  return (
    <SectionCard title="Interactive World Map — Geographic Intelligence" icon={Globe} action={
      <select value={metric} onChange={(e) => setMetric(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white/80 focus:outline-none focus:border-indigo-500/40">
        {METRICS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
      </select>
    }>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Heat Bar Map */}
        <div>
          <h4 className="text-xs text-white/40 mb-3">Country Heat Map — {METRICS.find((m) => m.id === metric)?.label}</h4>
          <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1">
            {countries.map((c, i) => (
              <div key={i} onClick={() => setSelectedCountry(c.country)} className={`flex items-center gap-2 cursor-pointer group rounded-md p-1 transition-colors ${selectedCountry === c.country ? "bg-indigo-500/10" : "hover:bg-white/[0.02]"}`}>
                <div className="w-28 text-xs text-white/60 truncate group-hover:text-white/90">{c.country}</div>
                <div className="flex-1 h-6 bg-white/5 rounded-md overflow-hidden">
                  <div className="h-full rounded-md transition-all flex items-center pl-2" style={{ width: `${(parseFloat(c[metric]) / maxValue) * 100}%`, backgroundColor: getIntensity(c[metric]), minWidth: "30px" }}>
                    <span className="text-[10px] text-white font-medium">{c[metric]}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bubble Chart */}
        <div>
          <h4 className="text-xs text-white/40 mb-3">Growth vs. User Base — bubble size = MRR</h4>
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="growthRate" name="Growth %" type="number" domain={[0, "dataMax"]} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} />
              <YAxis dataKey="users" name="Users" type="number" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} />
              <ZAxis dataKey="mrr" range={[50, 500]} name="MRR" />
              <Tooltip contentStyle={tooltipStyle} cursor={{ strokeDasharray: "3 3" }} formatter={(value, name, props) => [value, `${name} (${props.payload.country})`]} />
              <Scatter data={countries} onClick={(payload) => setSelectedCountry(payload.country)} cursor="pointer">
                {countries.map((c, i) => <Cell key={i} fill={selectedCountry === c.country ? "#f59e0b" : COLORS[i % COLORS.length]} />)}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Country Drill-down */}
      {selected && (
        <div className="mt-4 bg-white/[0.02] border border-indigo-500/20 rounded-lg p-4 animate-fade-in">
          <div className="flex items-center gap-2 mb-3">
            <MapPin size={14} className="text-indigo-400" />
            <h4 className="text-sm font-semibold text-white">{selected.country}</h4>
            <span className="text-[10px] text-white/30">{selected.continent} · {selected.region}</span>
            <button onClick={() => setSelectedCountry(null)} className="ml-auto text-[10px] text-white/30 hover:text-white/60">✕ Close</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <DrillStat label="Total Users" value={selected.users} />
            <DrillStat label="Active Users" value={selected.activeUsers} />
            <DrillStat label="New This Month" value={selected.newUsers} />
            <DrillStat label="Growth Rate" value={`${selected.growthRate}%`} />
            <DrillStat label="Executive Subs" value={selected.execSubs} sub={`${selected.execPercent}%`} />
            <DrillStat label="Professional Subs" value={selected.proSubs} sub={`${selected.proPercent}%`} />
            <DrillStat label="Enterprise Subs" value={selected.enterpriseSubs} />
            <DrillStat label="MRR" value={`$${selected.mrr}`} />
            <DrillStat label="Avg Readiness" value={`${selected.avgReadiness}%`} />
            <DrillStat label="Avg Promotion" value={`${selected.avgPromotion}%`} />
            <DrillStat label="Avg Journey Points" value={selected.avgJourneyPoints} />
            <DrillStat label="Total Sessions" value={selected.sessions} />
          </div>
        </div>
      )}
    </SectionCard>
  );
}

function DrillStat({ label, value, sub }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
      <div className="text-lg font-bold text-white">{value}</div>
      <div className="text-[10px] text-white/40">{label}</div>
      {sub && <div className="text-[10px] text-white/30">{sub}</div>}
    </div>
  );
}
import React, { useState } from "react";
import Panel from "./Panel";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { BarChart3 } from "lucide-react";
import { fmtNum, fmtCost, fmtMs } from "@/lib/aiOperations";
import { CHART_TOOLTIP } from "./Panel";

const METRICS = [
  { key: "requests", label: "Requests", color: "#6366f1", fmt: fmtNum },
  { key: "tokens", label: "Tokens", color: "#10b981", fmt: fmtNum },
  { key: "cost", label: "Cost", color: "#a855f7", fmt: fmtCost },
  { key: "latency", label: "Avg Latency", color: "#3b82f6", fmt: fmtMs },
];

export default function MonthlyTrend({ analytics }) {
  const [metric, setMetric] = useState("requests");
  const active = METRICS.find((m) => m.key === metric);
  const data = analytics.monthly.map((m) => ({ ...m, name: new Date(m.month + "-01").toLocaleDateString("en", { month: "short", year: "2-digit" }) }));
  if (data.length === 0) return null;
  return (
    <Panel title="Monthly Trend" icon={BarChart3} action={
      <div className="flex items-center gap-1">
        {METRICS.map((m) => (
          <button key={m.key} onClick={() => setMetric(m.key)} className={`px-2 py-1 rounded-md text-[10px] font-medium transition-colors ${metric === m.key ? "bg-white/10 text-white" : "text-white/30 hover:text-white/60"}`}>
            {m.label}
          </button>
        ))}
      </div>
    }>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis dataKey="name" tick={{ fill: "#ffffff40", fontSize: 10 }} />
            <YAxis tick={{ fill: "#ffffff40", fontSize: 10 }} tickFormatter={(v) => active.fmt(v)} width={50} />
            <Tooltip contentStyle={CHART_TOOLTIP} cursor={{ fill: "#ffffff08" }} formatter={(v) => [active.fmt(v), active.label]} />
            <Bar dataKey={metric} fill={active.color} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}
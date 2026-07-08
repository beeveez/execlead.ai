import React, { useState } from "react";
import Panel from "./Panel";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Activity } from "lucide-react";
import { fmtNum, fmtCost, fmtMs, fmtPct } from "@/lib/aiOperations";
import { CHART_TOOLTIP } from "./Panel";

const METRICS = [
  { key: "tokens", label: "Tokens", color: "#10b981", fmt: fmtNum },
  { key: "requests", label: "Requests", color: "#6366f1", fmt: fmtNum },
  { key: "cost", label: "Cost", color: "#a855f7", fmt: fmtCost },
  { key: "latency", label: "Latency", color: "#3b82f6", fmt: fmtMs },
  { key: "errors", label: "Errors", color: "#ef4444", fmt: fmtNum },
];

export default function DailyTrend({ analytics }) {
  const [metric, setMetric] = useState("tokens");
  // Aggregate to weekly buckets if the range is large to keep charts readable.
  let data = analytics.daily;
  if (data.length > 60) {
    const weeks = [];
    for (let i = 0; i < data.length; i += 7) {
      const chunk = data.slice(i, i + 7);
      weeks.push({
        date: chunk[0].date,
        tokens: chunk.reduce((a, d) => a + d.tokens, 0),
        requests: chunk.reduce((a, d) => a + d.requests, 0),
        cost: chunk.reduce((a, d) => a + d.cost, 0),
        latency: chunk.reduce((a, d) => a + d.latency, 0) / chunk.length,
        errors: chunk.reduce((a, d) => a + d.errors, 0),
      });
    }
    data = weeks;
  }
  const active = METRICS.find((m) => m.key === metric);
  const fmtDate = (d) => new Date(d).toLocaleDateString("en", { month: "short", day: "numeric" });

  return (
    <Panel title="Daily Trend" icon={Activity} action={
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
          <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradTrend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={active.color} stopOpacity={0.3} />
                <stop offset="100%" stopColor={active.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis dataKey="date" tickFormatter={fmtDate} tick={{ fill: "#ffffff40", fontSize: 10 }} minTickGap={30} />
            <YAxis tick={{ fill: "#ffffff40", fontSize: 10 }} tickFormatter={(v) => active.fmt(v)} width={50} />
            <Tooltip contentStyle={CHART_TOOLTIP} labelFormatter={fmtDate} formatter={(v) => [active.fmt(v), active.label]} />
            <Line type="monotone" dataKey={metric} stroke={active.color} strokeWidth={2} dot={false} fill="url(#gradTrend)" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}
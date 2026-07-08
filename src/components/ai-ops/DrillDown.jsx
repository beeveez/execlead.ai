import React, { useState, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from "recharts";
import { X } from "lucide-react";
import { fmtNum, fmtCost, fmtMs, MODULE_LABELS } from "@/lib/aiOperations";
import { CHART_TOOLTIP } from "./Panel";

const METRIC_CONFIG = {
  todayTokens: { series: "tokens", title: "Daily Token Usage" },
  monthTokens: { series: "tokens", title: "Daily Token Usage" },
  monthCost: { series: "cost", title: "Daily Cost" },
  totalRequests: { series: "requests", title: "Daily Requests" },
  avgLatency: { series: "latency", title: "Daily Latency" },
  successRate: { series: "requests", title: "Daily Requests" },
  failed: { series: "errors", title: "Daily Errors" },
  budget: { series: "cost", title: "Daily Cost vs Budget" },
  projectedMonthly: { series: "cost", title: "Daily Cost Trend" },
  projectedAnnual: { series: "cost", title: "Daily Cost Trend" },
};

const FMT = { tokens: fmtNum, requests: fmtNum, cost: fmtCost, latency: fmtMs, errors: fmtNum };
const COLORS = { tokens: "#10b981", requests: "#6366f1", cost: "#a855f7", latency: "#3b82f6", errors: "#ef4444" };

export default function DrillDown({ open, metricKey, label, analytics, onClose }) {
  const [view, setView] = useState("trend");
  const cfg = METRIC_CONFIG[metricKey] || { series: "tokens", title: "Daily Trend" };
  const fmtDate = (d) => new Date(d).toLocaleDateString("en", { month: "short", day: "numeric" });

  const moduleBreakdown = useMemo(() => analytics.byModule.slice().sort((a, b) => {
    const key = cfg.series === "cost" ? "cost" : cfg.series === "tokens" ? "tokens" : "requests";
    return b[key] - a[key];
  }).slice(0, 8), [analytics.byModule, cfg.series]);

  if (!open) return null;
  const data = analytics.daily;
  const fmt = FMT[cfg.series] || fmtNum;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#0d0d14] border border-white/10 rounded-xl w-full max-w-3xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div>
            <div className="text-xs text-white/30 uppercase tracking-wider">Drill-Down</div>
            <h3 className="text-lg font-bold text-white">{label}</h3>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white/60"><X size={20} /></button>
        </div>
        <div className="p-5">
          <div className="flex items-center gap-1 mb-4">
            <button onClick={() => setView("trend")} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${view === "trend" ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70"}`}>{cfg.title}</button>
            <button onClick={() => setView("breakdown")} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${view === "breakdown" ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70"}`}>By Module</button>
          </div>
          {view === "trend" ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="date" tickFormatter={fmtDate} tick={{ fill: "#ffffff40", fontSize: 10 }} minTickGap={30} />
                  <YAxis tick={{ fill: "#ffffff40", fontSize: 10 }} tickFormatter={(v) => fmt(v)} width={55} />
                  <Tooltip contentStyle={CHART_TOOLTIP} labelFormatter={fmtDate} formatter={(v) => [fmt(v), cfg.series]} />
                  <Line type="monotone" dataKey={cfg.series} stroke={COLORS[cfg.series]} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={moduleBreakdown.map((m) => ({ name: m.label, value: cfg.series === "cost" ? m.cost : cfg.series === "tokens" ? m.tokens : m.requests }))} margin={{ left: 0, right: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="name" tick={{ fill: "#ffffff40", fontSize: 9 }} angle={-25} textAnchor="end" height={60} />
                  <YAxis tick={{ fill: "#ffffff40", fontSize: 10 }} tickFormatter={(v) => fmt(v)} width={55} />
                  <Tooltip contentStyle={CHART_TOOLTIP} cursor={{ fill: "#ffffff08" }} formatter={(v) => [fmt(v), cfg.series]} />
                  <Bar dataKey="value" fill={COLORS[cfg.series]} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
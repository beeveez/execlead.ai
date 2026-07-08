import React from "react";
import Panel from "./Panel";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Boxes } from "lucide-react";
import { fmtNum, fmtCost, fmtMs, fmtPct } from "@/lib/aiOperations";
import { CHART_TOOLTIP } from "./Panel";

export default function ModuleAnalytics({ analytics, onSelectModule }) {
  const modules = analytics.byModule;
  if (modules.length === 0) return null;
  const chartData = modules.map((m) => ({ name: m.label, requests: m.requests, tokens: m.tokens, cost: +m.cost.toFixed(4) }));
  return (
    <Panel title="Module Analytics" icon={Boxes}>
      <div className="h-48 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
            <XAxis type="number" tick={{ fill: "#ffffff40", fontSize: 10 }} />
            <YAxis type="category" dataKey="name" tick={{ fill: "#ffffff60", fontSize: 10 }} width={120} />
            <Tooltip contentStyle={CHART_TOOLTIP} cursor={{ fill: "#ffffff08" }} />
            <Bar dataKey="requests" fill="#6366f1" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="overflow-x-auto -mx-2">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-white/30 border-b border-white/5">
              <th className="text-left font-medium py-2 px-2">Module</th>
              <th className="text-right font-medium px-2">Requests</th>
              <th className="text-right font-medium px-2">Tokens</th>
              <th className="text-right font-medium px-2">Cost</th>
              <th className="text-right font-medium px-2">Latency</th>
              <th className="text-right font-medium px-2">Success</th>
            </tr>
          </thead>
          <tbody>
            {modules.map((m) => (
              <tr key={m.module} onClick={() => onSelectModule(m.module)} className="border-b border-white/5 hover:bg-white/[0.04] cursor-pointer transition-colors">
                <td className="py-2 px-2 text-white font-medium">{m.label}</td>
                <td className="text-right text-white/60 px-2">{fmtNum(m.requests)}</td>
                <td className="text-right text-white/60 px-2">{fmtNum(m.tokens)}</td>
                <td className="text-right text-emerald-400/80 px-2">{fmtCost(m.cost)}</td>
                <td className="text-right text-white/60 px-2">{fmtMs(m.avgLatency)}</td>
                <td className={`text-right font-medium px-2 ${m.successRate < 95 ? "text-amber-400" : "text-emerald-400"}`}>{fmtPct(m.successRate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
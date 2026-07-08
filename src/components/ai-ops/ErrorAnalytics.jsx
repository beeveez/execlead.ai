import React from "react";
import Panel from "./Panel";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { AlertTriangle } from "lucide-react";
import { fmtNum, fmtPct } from "@/lib/aiOperations";
import { CHART_TOOLTIP } from "./Panel";

const ERROR_LABELS = {
  error: "Provider Errors", timeout: "Timeouts", rate_limited: "Rate Limits",
  network_error: "Network Errors", validation_error: "Validation Errors",
};

export default function ErrorAnalytics({ analytics }) {
  const { errors, errorRate } = analytics;
  const total = errors.total || 0;
  if (total === 0 && errorRate === 0) {
    return (
      <Panel title="Error Analytics" icon={AlertTriangle}>
        <div className="text-center py-8">
          <AlertTriangle size={24} className="mx-auto text-emerald-400/40 mb-2" />
          <p className="text-emerald-400 text-sm font-medium">No errors detected</p>
          <p className="text-white/30 text-xs mt-1">All requests completed successfully</p>
        </div>
      </Panel>
    );
  }
  const chartData = Object.entries(errors.byType).filter(([, v]) => v > 0).map(([k, v]) => ({ name: ERROR_LABELS[k] || k, count: v }));
  return (
    <Panel title="Error Analytics" icon={AlertTriangle}>
      <div className="grid grid-cols-3 gap-2 mb-4">
        <ErrorStat label="Total Errors" value={fmtNum(total)} color="text-red-400" />
        <ErrorStat label="Failed" value={fmtNum(errors.failed)} color="text-orange-400" />
        <ErrorStat label="Error Rate" value={fmtPct(errorRate)} color="text-amber-400" />
      </div>
      {chartData.length > 0 && (
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
              <XAxis type="number" tick={{ fill: "#ffffff40", fontSize: 10 }} />
              <YAxis type="category" dataKey="name" tick={{ fill: "#ffffff60", fontSize: 10 }} width={110} />
              <Tooltip contentStyle={CHART_TOOLTIP} cursor={{ fill: "#ffffff08" }} />
              <Bar dataKey="count" fill="#ef4444" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Panel>
  );
}

function ErrorStat({ label, value, color }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-lg p-2.5 text-center">
      <div className={`text-lg font-bold ${color}`}>{value}</div>
      <div className="text-white/30 text-[10px]">{label}</div>
    </div>
  );
}
import React, { useState } from "react";
import { BarChart3, FileText, TrendingUp, Download } from "lucide-react";
import { generateReport } from "@/lib/admissionsOperationsEngine";

const PERIODS = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

export default function ExecutiveReportPanel({ applications }) {
  const [period, setPeriod] = useState("weekly");
  const report = generateReport(applications, period);
  const m = report.metrics;

  const metrics = [
    { label: "Applications", value: m.applications, color: "#06b6d4" },
    { label: "Approvals", value: m.approvals, color: "#10b981" },
    { label: "Rejections", value: m.rejections, color: "#ef4444" },
    { label: "Interview Rate", value: `${m.interview_rate}%`, color: "#8b5cf6" },
    { label: "Acceptance Rate", value: `${m.acceptance_rate}%`, color: "#10b981" },
    { label: "Activation Rate", value: `${m.activation_rate}%`, color: "#06b6d4" },
    { label: "Avg Processing Time", value: `${m.avg_processing_time_hours}h`, color: "#f59e0b" },
    { label: "Avg Time to Invitation", value: `${m.avg_time_to_invitation_hours}h`, color: "#f97316" },
    { label: "Avg Time to Activation", value: `${m.avg_time_to_activation_hours}h`, color: "#3b82f6" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 size={14} className="text-cyan-400" />
          <h3 className="text-sm font-semibold text-white/70">Executive Reporting™</h3>
        </div>
        <div className="flex items-center gap-1">
          {PERIODS.map((p) => (
            <button key={p.value} onClick={() => setPeriod(p.value)} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${period === p.value ? "bg-cyan-500/15 text-cyan-400" : "text-white/30 hover:text-white/60"}`}>{p.label}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3">
        {metrics.map((metric, i) => (
          <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="text-2xl font-bold" style={{ color: metric.color }}>{metric.value}</div>
            <div className="text-[10px] text-white/30 mt-1">{metric.label}</div>
          </div>
        ))}
      </div>

      <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 flex items-center gap-2 text-[10px] text-white/30">
        <FileText size={11} />
        Report period: {new Date(report.period_start).toLocaleDateString()} — {new Date(report.period_end).toLocaleDateString()}
      </div>
    </div>
  );
}
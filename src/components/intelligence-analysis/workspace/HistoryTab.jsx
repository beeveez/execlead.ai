import React, { useState } from "react";
import { BarChart3, Download, FileJson, FileText, Table, FileSpreadsheet } from "lucide-react";

const RANGES = [7, 30, 90];

export default function HistoryTab({ bundle, onClose }) {
  const [range, setRange] = useState(30);
  const series = bundle.scoreHistory[range] || [];
  const maxScore = Math.max(...series.map((p) => p.score), bundle.summary.target);
  const minScore = Math.min(...series.map((p) => p.score), 0);

  const exportData = (format) => {
    const data = {
      metric: bundle.label,
      metricId: bundle.metricId,
      summary: bundle.summary,
      issues: bundle.issues,
      components: bundle.components,
      fixes: bundle.fixes,
      impactAnalysis: bundle.impactAnalysis,
      timeline: bundle.timeline,
      scoreHistory: bundle.scoreHistory,
    };
    let content, mime, ext;
    if (format === "json") {
      content = JSON.stringify(data, null, 2); mime = "application/json"; ext = "json";
    } else if (format === "csv") {
      const rows = ["Title,Severity,Status,Owner,Estimated Improvement,Detected,Last Updated", ...bundle.issues.map((i) => `"${i.title}",${i.severity},${i.status},${i.owner},"${i.estimatedImprovement}",${i.detectedDate},${i.lastUpdated}`)];
      content = rows.join("\n"); mime = "text/csv"; ext = "csv";
    } else if (format === "markdown") {
      content = `# ${bundle.label} — Intelligence Report\n\n**Score:** ${bundle.summary.overallScore}/${bundle.summary.target}\n**Severity:** ${bundle.summary.severity}\n**Trend:** ${bundle.summary.trend}\n\n## Issues\n${bundle.issues.map((i) => `- **${i.title}** (${i.severity}): ${i.description}`).join("\n")}\n\n## Fixes\n${bundle.fixes.map((f) => `- **${f.title}** — ${f.expectedImprovement} (${f.estimatedTime})`).join("\n")}`;
      mime = "text/markdown"; ext = "md";
    } else if (format === "excel") {
      const rows = [
        ["Field", "Value"],
        ["Metric", bundle.label], ["Score", bundle.summary.overallScore], ["Target", bundle.summary.target],
        ["Severity", bundle.summary.severity], ["Issues", bundle.summary.issueCount], ["Resolved", bundle.summary.resolvedCount],
        ...bundle.issues.map((i) => ["Issue", i.title]),
      ];
      content = rows.map((r) => r.join(",")).join("\n"); mime = "text/csv"; ext = "xls";
    } else {
      content = `${bundle.label} — Intelligence Report\n\nScore: ${bundle.summary.overallScore}/${bundle.summary.target}\nSeverity: ${bundle.summary.severity}\nTrend: ${bundle.summary.trend}\nIssues: ${bundle.summary.issueCount}\nResolved: ${bundle.summary.resolvedCount}\n\n${bundle.issues.map((i) => `- ${i.title} (${i.severity}): ${i.description}`).join("\n")}`;
      mime = "text/plain"; ext = "txt";
    }
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${bundle.metricId}-intelligence.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    onClose?.();
  };

  return (
    <div className="space-y-6">
      {/* Score History Chart */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2"><BarChart3 size={14} className="text-amber-400" /><h3 className="text-xs font-semibold text-white/80 uppercase tracking-wider">Score History</h3></div>
          <div className="flex gap-1">
            {RANGES.map((r) => (
              <button key={r} onClick={() => setRange(r)} className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${range === r ? "bg-amber-500/15 text-amber-300 border border-amber-500/30" : "bg-white/[0.03] text-white/50 border border-white/10 hover:text-white/70"}`}>{r}d</button>
            ))}
          </div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-4">
          <div className="flex items-end justify-between gap-0.5 h-32 mb-2">
            {series.map((p, i) => {
              const heightPct = maxScore === minScore ? 100 : ((p.score - minScore) / (maxScore - minScore)) * 100;
              const isLast = i === series.length - 1;
              return (
                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                  <div className={`w-full rounded-t transition-all ${isLast ? "bg-emerald-500/40" : "bg-indigo-500/25"} group-hover:bg-amber-500/40`} style={{ height: `${heightPct}%` }} />
                  <span className="absolute -top-4 opacity-0 group-hover:opacity-100 text-[9px] text-white/70 transition-opacity">{p.score}</span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between text-[10px] text-white/30">
            <span>{range} days ago</span>
            <span className="text-emerald-400">Current: {bundle.summary.overallScore}</span>
            <span>Today</span>
          </div>
          <div className="flex items-center gap-2 mt-2 text-[10px]">
            <span className="text-white/30">Target: <span className="text-white/70">{bundle.summary.target}</span></span>
            <span className="text-white/30">· Trend: <span className={bundle.summary.trend === "up" ? "text-emerald-400" : bundle.summary.trend === "down" ? "text-red-400" : "text-white/50"}>{bundle.summary.trend}</span></span>
          </div>
        </div>
      </div>

      {/* Export */}
      <div>
        <div className="flex items-center gap-2 mb-3"><Download size={14} className="text-indigo-400" /><h3 className="text-xs font-semibold text-white/80 uppercase tracking-wider">Export Intelligence Report</h3></div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {[
            { fmt: "pdf", label: "PDF", icon: FileText },
            { fmt: "excel", label: "Excel", icon: FileSpreadsheet },
            { fmt: "csv", label: "CSV", icon: Table },
            { fmt: "markdown", label: "Markdown", icon: FileText },
            { fmt: "json", label: "JSON", icon: FileJson },
          ].map(({ fmt, label, icon: Icon }) => (
            <button key={fmt} onClick={() => exportData(fmt)} className="flex flex-col items-center gap-1.5 bg-white/[0.02] border border-white/10 hover:border-indigo-500/30 hover:bg-indigo-500/10 rounded-lg p-3 text-white/60 hover:text-indigo-300 transition-colors">
              <Icon size={16} />
              <span className="text-[11px] font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
import React, { useState } from "react";
import { FileText, Download, CheckCircle2, XCircle } from "lucide-react";
import { generateCertificationReport } from "@/lib/foundationCertificationEngine";

/**
 * EXECLEAD.AI Foundation Certification Report™
 * Generates and downloads the formal certification report.
 */
export default function FoundationCertificationReport({ cert }) {
  const [report, setReport] = useState(null);

  const generate = () => {
    setReport(generateCertificationReport(cert));
  };

  const download = () => {
    const r = report || generateCertificationReport(cert);
    const blob = new Blob([JSON.stringify(r, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `execlead-foundation-certification-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <FileText size={16} className="text-indigo-400" />
        <h3 className="text-sm font-bold text-white">Foundation Certification Report™</h3>
        <div className="ml-auto flex gap-2">
          <button
            onClick={generate}
            className="text-xs px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20"
          >
            Generate Report
          </button>
          <button
            onClick={download}
            className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:bg-white/10"
          >
            <Download size={12} /> Download JSON
          </button>
        </div>
      </div>

      {report && (
        <div className="space-y-4 animate-fade-in">
          {/* Executive Summary */}
          <div className="bg-white/[0.02] rounded-lg p-4">
            <div className="text-[10px] text-white/40 uppercase tracking-wider mb-2">
              Executive Summary
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <ReportStat
                label="Certified"
                value={report.executiveSummary.certified ? "YES" : "NO"}
              />
              <ReportStat
                label="Foundation Score"
                value={`${report.executiveSummary.foundationScore}%`}
              />
              <ReportStat
                label="Total Blockers"
                value={report.executiveSummary.totalBlockers}
              />
              <ReportStat label="Est. Completion" value={report.executiveSummary.estimatedCompletion} />
            </div>
          </div>

          {/* Metrics */}
          <div className="bg-white/[0.02] rounded-lg p-4">
            <div className="text-[10px] text-white/40 uppercase tracking-wider mb-2">
              Certification Metrics
            </div>
            <div className="space-y-1">
              {report.metrics.map((m) => (
                <div key={m.key} className="flex items-center gap-2 text-xs">
                  {m.passed ? (
                    <CheckCircle2 size={12} className="text-emerald-400" />
                  ) : (
                    <XCircle size={12} className="text-red-400" />
                  )}
                  <span className="text-white/70 flex-1">{m.label}</span>
                  <span className={m.passed ? "text-emerald-400" : "text-red-400"}>
                    {m.value}%{m.exact ? " (=100%)" : ` (≥${m.threshold}%)`}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Architectural Gate Summary */}
          <div className="bg-white/[0.02] rounded-lg p-4">
            <div className="text-[10px] text-white/40 uppercase tracking-wider mb-2">
              Architectural Gate Summary
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {report.architecturalGate.categories.map((c) => (
                <div key={c.category} className="text-center px-2 py-1.5 rounded bg-white/[0.02]">
                  <div className="text-sm font-bold text-white">{c.count}</div>
                  <div className="text-[9px] text-white/40">{c.category}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white/[0.02] rounded-lg p-4">
            <div className="text-[10px] text-white/40 uppercase tracking-wider mb-2">
              Recommendations
            </div>
            <div className="space-y-1">
              {report.recommendations.map((rec, i) => (
                <div key={i} className="text-xs text-white/60 flex items-start gap-2">
                  <span className="text-white/30 mt-0.5">•</span>
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ReportStat({ label, value }) {
  return (
    <div>
      <div className="text-[9px] text-white/30 uppercase tracking-wider">{label}</div>
      <div className="text-sm font-bold text-white">{value}</div>
    </div>
  );
}
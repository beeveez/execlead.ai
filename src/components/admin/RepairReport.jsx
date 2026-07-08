import React, { useState } from "react";
import { Shield, Check, X, Download, RotateCcw, Eye, Clock, Activity, FileText, AlertCircle } from "lucide-react";

function StatCard({ label, value, color, icon: Icon }) {
  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
      {Icon && <Icon size={14} style={{ color }} className="mb-1" />}
      <div className="text-2xl font-bold" style={{ color }}>{value}</div>
      <div className="text-xs text-white/40 mt-0.5">{label}</div>
    </div>
  );
}

export default function RepairReport({ report, onClose, onRollback }) {
  const [showChanges, setShowChanges] = useState(true);
  if (!report) return null;

  const downloadReport = () => {
    const data = {
      id: report.id,
      timestamp: report.timestamp,
      executionTimeMs: report.executionTimeMs,
      riskLevel: report.riskLevel,
      stats: report.stats,
      levelBreakdown: report.levelBreakdown,
      changes: (report.changes || []).map((c) => ({
        type: c.type,
        findingTitle: c.findingTitle,
        actionLabel: c.actionLabel,
        result: c.result,
      })),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `guardian-repair-${report.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const hasChanges = report.changes && report.changes.length > 0;
  const hasRemaining = report.stats.remaining > 0;

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#0d0d14] border border-white/10 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-indigo-400" />
            <span className="text-sm font-semibold text-white">Guardian Repair Report</span>
          </div>
          <button onClick={onClose} className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 transition-colors">
            <X size={15} />
          </button>
        </div>

        <div className="overflow-auto p-5 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard label="Issues Scanned" value={report.stats.scanned} color="#a855f7" icon={Activity} />
            <StatCard label="Issues Fixed" value={report.stats.fixed} color="#22c55e" icon={Check} />
            <StatCard label="Remaining" value={report.stats.remaining} color="#f59e0b" icon={AlertCircle} />
            <StatCard label="Files Updated" value={report.stats.filesUpdated} color="#06b6d4" icon={FileText} />
          </div>

          <div className="flex items-center gap-4 text-xs text-white/50 flex-wrap">
            <span className="flex items-center gap-1.5"><Clock size={12} /> {(report.executionTimeMs / 1000).toFixed(2)}s</span>
            <span className="flex items-center gap-1.5"><Shield size={12} /> Risk: <span className="capitalize text-white/70">{report.riskLevel}</span></span>
            <span className="text-white/30">{new Date(report.timestamp).toLocaleString()}</span>
          </div>

          {hasChanges && (
            <div className="rounded-xl bg-white/[0.02] border border-white/5 overflow-hidden">
              <button onClick={() => setShowChanges(!showChanges)} className="w-full flex items-center justify-between px-4 py-2.5 text-xs text-white/60 hover:text-white/80 transition-colors">
                <span className="flex items-center gap-2"><Eye size={12} /> Changes Applied ({report.changes.length})</span>
                <span className="text-indigo-400">{showChanges ? "Hide" : "View Changes"}</span>
              </button>
              {showChanges && (
                <div className="px-4 pb-3 space-y-1.5">
                  {report.changes.map((c, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      {c.result === "applied" ? <Check size={12} className="text-emerald-400 mt-0.5 shrink-0" /> : <X size={12} className="text-red-400 mt-0.5 shrink-0" />}
                      <div>
                        <span className="text-white/70">{c.findingTitle}</span>
                        <span className="text-white/30"> — {c.actionLabel}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {hasRemaining && (
            <div className="rounded-xl bg-amber-500/5 border border-amber-500/15 p-3 space-y-1">
              <div className="text-xs text-white/50 mb-1">Remaining Issues</div>
              {report.levelBreakdown?.guided > 0 && <p className="text-xs text-amber-400">🟡 {report.levelBreakdown.guided} guided fix(es) ready for review</p>}
              {report.levelBreakdown?.manual > 0 && <p className="text-xs text-red-400">🔴 {report.levelBreakdown.manual} manual fix(es) require developer attention</p>}
            </div>
          )}

          {!hasChanges && (
            <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4 text-center">
              <p className="text-sm text-white/50">No automatic repairs were needed.</p>
              {hasRemaining && <p className="text-xs text-white/30 mt-1">{report.stats.remaining} issue(s) require guided or manual resolution.</p>}
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t border-white/10 flex items-center gap-2 flex-wrap">
          {hasChanges && (
            <button onClick={() => onRollback(report.id)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-medium transition-colors">
              <RotateCcw size={12} /> Rollback
            </button>
          )}
          <button onClick={downloadReport} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-xs font-medium transition-colors">
            <Download size={12} /> Download Report
          </button>
          <button onClick={onClose} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-xs font-medium transition-colors ml-auto">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
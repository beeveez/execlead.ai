import React from "react";
import { History, Download, CheckCircle2, XCircle, UserCheck } from "lucide-react";

/**
 * AIAuditLogPanel — AI Audit Log™: immutable record of every governed decision
 * (timestamp, user, model, evidence used, policy applied, recommendation,
 * confidence, decision trace, reviewer). Exportable CSV for enterprise audit.
 */
export default function AIAuditLogPanel({ auditLog, onExport }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History size={16} className="text-amber-400" />
          <h3 className="text-white font-semibold text-sm">AI Audit Log™</h3>
          <span className="text-[10px] text-white/30">{auditLog.length} decisions</span>
        </div>
        <button
          onClick={onExport}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-white/60 hover:text-white/80 transition-colors"
        >
          <Download size={12} />
          Export CSV
        </button>
      </div>

      {auditLog.length === 0 ? (
        <p className="text-xs text-white/40">No governed decisions logged yet.</p>
      ) : (
        <div className="space-y-1.5 max-h-96 overflow-y-auto">
          {auditLog.slice(0, 50).map((e) => (
            <div key={e.id} className="bg-white/[0.02] border border-white/5 rounded-lg p-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  {e.passed ? <CheckCircle2 size={12} className="text-emerald-400 flex-shrink-0" /> : <XCircle size={12} className="text-rose-400 flex-shrink-0" />}
                  <span className="text-xs text-white/80 truncate">{e.recommendation?.label || "—"} · {e.recommendation?.competency || ""}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {e.humanReviewRequired && !e.reviewer && <UserCheck size={11} className="text-amber-400" />}
                  <span className="text-[10px] text-white/40">{new Date(e.timestamp).toLocaleString()}</span>
                </div>
              </div>
              <div className="text-[10px] text-white/30 mt-1 flex flex-wrap gap-x-3">
                <span>user: {e.user}</span>
                <span>model: {e.model || "—"}</span>
                <span>conf: {e.confidence}%</span>
                <span>gov: {e.governanceScore}/100</span>
                {e.reviewer && <span>reviewer: {e.reviewer}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
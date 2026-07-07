import React from "react";
import { Check, X, Clock, AlertTriangle } from "lucide-react";

export default function GuardianPendingApprovals({ pending, onApprove, onDismiss }) {
  if (!pending || pending.length === 0) {
    return (
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-8 text-center">
        <Check className="mx-auto text-emerald-400/60 mb-2" size={28} />
        <p className="text-white/50 text-sm font-medium">No pending approvals</p>
        <p className="text-white/30 text-xs mt-1">All queued repairs have been resolved.</p>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {pending.map((a) => (
        <div key={a.id} className="bg-amber-500/[0.04] border border-amber-500/20 rounded-xl p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <AlertTriangle size={14} className="text-amber-400 shrink-0" />
                <span className="text-sm font-semibold text-white truncate">{a.issue}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  {a.confidence_score}% confidence
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 text-white/40 border border-white/10 uppercase">{a.category}</span>
              </div>
              <p className="text-xs text-white/50 mt-1.5">
                Suggested action: <span className="text-white/70 font-medium">{a.action_taken}</span>
              </p>
              <p className="text-[10px] text-white/30 mt-1 flex items-center gap-1">
                <Clock size={9} /> Queued {a.created_date ? new Date(a.created_date).toLocaleString() : ""}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => onApprove(a)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-medium transition-colors">
                <Check size={12} /> Approve
              </button>
              <button onClick={() => onDismiss(a)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 text-xs transition-colors">
                <X size={12} /> Dismiss
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
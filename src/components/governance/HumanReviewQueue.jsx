import React from "react";
import { UserCheck, Check } from "lucide-react";

/**
 * HumanReviewQueue — entries from the AI Audit Log™ that require human review
 * (low confidence, low evidence, high-impact, or policy violation), with a
 * one-click "approve / acknowledge review" action.
 */
export default function HumanReviewQueue({ auditLog, onReview }) {
  const queue = auditLog.filter((e) => e.humanReviewRequired && !e.reviewer);

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <UserCheck size={16} className="text-amber-400" />
        <h3 className="text-white font-semibold text-sm">Human Review™</h3>
        <span className="text-[10px] text-white/30">{queue.length} pending</span>
      </div>

      {queue.length === 0 ? (
        <p className="text-xs text-white/40">No recommendations pending human review.</p>
      ) : (
        <div className="space-y-2">
          {queue.map((e) => (
            <div key={e.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-white/80 font-medium truncate">
                    {e.recommendation?.label || "Recommendation"} · {e.recommendation?.competency || ""}
                  </div>
                  <div className="text-[11px] text-white/40 mt-0.5">
                    Confidence {e.confidence}% · {new Date(e.timestamp).toLocaleString()} · {e.highImpact ? "high-impact" : "threshold not met"}
                  </div>
                </div>
                <button
                  onClick={() => onReview(e.id)}
                  className="flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 text-[11px] transition-colors"
                >
                  <Check size={12} />
                  Review
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
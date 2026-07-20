import React, { useMemo } from "react";
import { computeReviewerPerformance } from "@/lib/admissionsIntelligenceEngine";
import { Clock, CheckCircle2, XCircle, AlertCircle, UserCog } from "lucide-react";

export default function ReviewerPerformance({ records }) {
  const perf = useMemo(() => computeReviewerPerformance(records), [records]);

  if (perf.totalReviewers === 0) {
    return (
      <div className="text-center py-12">
        <UserCog size={28} className="text-white/20 mx-auto mb-3" />
        <p className="text-sm text-white/40">No reviewer activity yet. Reviewer performance appears as applications are reviewed.</p>
      </div>
    );
  }

  const oldestDays = perf.oldestPending?.age ? Math.floor(perf.oldestPending.age / (1000 * 60 * 60 * 24)) : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <UserCog size={14} className="text-amber-400" />
        <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">Reviewer Performance</span>
        <span className="text-[10px] text-white/30 ml-auto">Internal Only</span>
      </div>

      {/* Oldest pending alert */}
      {perf.oldestPending && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/5 border border-amber-500/15">
          <AlertCircle size={14} className="text-amber-400 shrink-0" />
          <span className="text-xs text-white/50">
            Oldest pending application: <strong className="text-white/70">{perf.oldestPending.app.full_name}</strong>
            {" "}({perf.oldestPending.app.application_id}) — {oldestDays} day{oldestDays !== 1 ? "s" : ""} old
          </span>
        </div>
      )}

      {/* Reviewer table */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
        <div className="grid grid-cols-5 gap-2 px-4 py-2.5 border-b border-white/5 text-[10px] text-white/30 uppercase tracking-wider font-medium">
          <span>Reviewer</span>
          <span className="text-center">Reviewed</span>
          <span className="text-center">Avg Time</span>
          <span className="text-center">Approval Rate</span>
          <span className="text-center">Pending</span>
        </div>
        <div className="divide-y divide-white/5">
          {perf.reviewers.map((r) => (
            <div key={r.name} className="grid grid-cols-5 gap-2 px-4 py-3 items-center hover:bg-white/[0.02] transition-colors">
              <span className="text-xs text-white/70 font-medium truncate">{r.name}</span>
              <span className="text-xs text-white/50 text-center">{r.reviewed}</span>
              <span className="text-xs text-indigo-400 text-center flex items-center justify-center gap-1">
                <Clock size={10} /> {r.avgReviewHours > 0 ? `${r.avgReviewHours}h` : "—"}
              </span>
              <span className="text-xs text-emerald-400 text-center">{r.approvalRate}%</span>
              <span className="text-xs text-amber-400 text-center">{r.pending}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        <SummaryStat label="Total Reviewers" value={perf.totalReviewers} icon={UserCog} />
        <SummaryStat label="Total Reviewed" value={perf.reviewers.reduce((a, r) => a + r.reviewed, 0)} icon={CheckCircle2} />
        <SummaryStat label="Total Pending" value={perf.reviewers.reduce((a, r) => a + r.pending, 0)} icon={Clock} />
      </div>
    </div>
  );
}

function SummaryStat({ label, value, icon: Icon }) {
  return (
    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-center">
      <Icon size={14} className="mx-auto text-white/30" />
      <div className="text-lg font-bold text-white mt-1">{value}</div>
      <div className="text-[10px] text-white/30 uppercase tracking-wider">{label}</div>
    </div>
  );
}
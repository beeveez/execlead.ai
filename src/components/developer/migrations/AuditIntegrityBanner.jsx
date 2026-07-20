import React from "react";
import { ShieldCheck, AlertTriangle, CheckCircle2, GitBranch } from "lucide-react";

export default function AuditIntegrityBanner({ integrity }) {
  if (!integrity) return null;

  const { allPassed, score, totalMigrations, appliedCount, pendingCount, certifiedCount } = integrity;

  return (
    <div className={`rounded-xl border p-3 ${allPassed ? "bg-emerald-500/[0.04] border-emerald-500/15" : "bg-amber-500/[0.04] border-amber-500/15"}`}>
      <div className="flex items-center gap-2 mb-2">
        {allPassed ? <ShieldCheck size={14} className="text-emerald-400" /> : <AlertTriangle size={14} className="text-amber-400" />}
        <span className={`text-xs font-semibold ${allPassed ? "text-emerald-400" : "text-amber-400"}`}>Audit Integrity {allPassed ? "Passed" : "Issues Detected"}</span>
        <span className="text-white/20 text-[10px] ml-auto">{score}% integrity score</span>
      </div>
      <div className="flex items-center gap-4 text-[11px] text-white/40">
        <span className="flex items-center gap-1"><GitBranch size={10} /> {totalMigrations} total</span>
        <span className="flex items-center gap-1"><CheckCircle2 size={10} className="text-emerald-400" /> {appliedCount} applied</span>
        <span className="flex items-center gap-1"><CheckCircle2 size={10} className="text-amber-400" /> {pendingCount} pending</span>
        <span className="flex items-center gap-1"><ShieldCheck size={10} className="text-indigo-400" /> {certifiedCount} certified</span>
      </div>
    </div>
  );
}
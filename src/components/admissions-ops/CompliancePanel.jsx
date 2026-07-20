import React from "react";
import { ShieldCheck, AlertCircle, CheckCircle2 } from "lucide-react";

export default function CompliancePanel({ compliance }) {
  if (!compliance) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <ShieldCheck size={14} className="text-cyan-400" />
        <h3 className="text-sm font-semibold text-white/70">Audit & Compliance™ — Record Integrity Validation</h3>
      </div>

      <div className="flex items-center gap-6 p-4 rounded-xl bg-white/[0.02] border border-white/5">
        <div className="relative w-16 h-16 shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="5" />
            <circle cx="32" cy="32" r="28" fill="none" stroke={compliance.compliance_pct >= 80 ? "#10b981" : "#f59e0b"} strokeWidth="5" strokeLinecap="round" strokeDasharray={2 * Math.PI * 28} strokeDashoffset={2 * Math.PI * 28 - (compliance.compliance_pct / 100) * 2 * Math.PI * 28} />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center"><span className="text-sm font-bold text-white">{compliance.compliance_pct}%</span></div>
        </div>
        <div>
          <div className="text-sm text-white/70 font-medium">{compliance.valid} of {compliance.total} records compliant</div>
          <p className="text-xs text-white/40 mt-0.5">{compliance.issues.length} record(s) with missing data</p>
        </div>
      </div>

      {compliance.issues.length > 0 ? (
        <div className="space-y-1.5 max-h-80 overflow-y-auto">
          {compliance.issues.map((issue, i) => (
            <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-red-500/[0.03] border border-red-500/10">
              <AlertCircle size={12} className="text-red-400 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/70 font-medium">{issue.full_name}</span>
                  <span className="text-[9px] text-amber-400 font-mono">{issue.application_id}</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {issue.missing.map((m) => (
                    <span key={m} className="text-[9px] px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-400">{m} Missing</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <CheckCircle2 size={24} className="text-emerald-400 mx-auto mb-2" />
          <p className="text-xs text-white/50">All records are fully compliant</p>
        </div>
      )}
    </div>
  );
}
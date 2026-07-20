import React from "react";
import { Gavel, History, ShieldAlert, CheckCircle2 } from "lucide-react";
import { GOVERNANCE_RULES, CHANGE_HISTORY } from "@/lib/execVerifiedFreeze";

export default function GovernanceChangePanel() {
  return (
    <div className="space-y-4">
      {/* Governance Rules */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Gavel size={16} className="text-indigo-400" />
          <h3 className="text-sm font-semibold text-white/80">Long-Term Governance</h3>
        </div>
        <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/15 mb-3">
          <p className="text-[11px] text-amber-400/80 leading-relaxed">{GOVERNANCE_RULES.rule}</p>
        </div>
        <div className="space-y-2">
          <div className="text-[10px] text-white/30 uppercase tracking-wider">Changes Require</div>
          {GOVERNANCE_RULES.changes_require.map((req) => (
            <div key={req} className="flex items-center gap-2 text-xs text-white/50">
              <ShieldAlert size={12} className="text-amber-400/60" />
              {req}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/5">
          <GovFlag label="Change History" value={GOVERNANCE_RULES.change_history_required} />
          <GovFlag label="Approval Required" value={GOVERNANCE_RULES.approval_required} />
          <GovFlag label="Version Increment" value={GOVERNANCE_RULES.version_increment_required} />
        </div>
      </div>

      {/* Change History */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <History size={16} className="text-indigo-400" />
          <h3 className="text-sm font-semibold text-white/80">Change History</h3>
          <span className="text-[9px] text-white/20 ml-auto">{CHANGE_HISTORY.length} versions</span>
        </div>
        <div className="space-y-3">
          {CHANGE_HISTORY.map((entry, i) => (
            <div key={entry.version} className="relative pl-6">
              {i < CHANGE_HISTORY.length - 1 && <div className="absolute left-[7px] top-4 bottom-0 w-px bg-white/5" />}
              <div className={`absolute left-0 top-1 w-3.5 h-3.5 rounded-full border-2 ${entry.version === "3.0.0" ? "bg-indigo-500 border-indigo-400" : "bg-white/10 border-white/20"}`} />
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-white/70">v{entry.version}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-white/40">{entry.type}</span>
                <span className="text-[10px] text-white/20 ml-auto">{entry.date}</span>
              </div>
              <p className="text-[11px] text-white/40 leading-relaxed">{entry.description}</p>
              <p className="text-[10px] text-white/20 mt-1">Approved by: {entry.approved_by}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function GovFlag({ label, value }) {
  return (
    <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-white/[0.02] border border-white/5">
      {value ? <CheckCircle2 size={12} className="text-emerald-400" /> : <div className="w-3 h-3 rounded-full bg-white/10" />}
      <span className="text-[9px] text-white/30 text-center leading-tight">{label}</span>
    </div>
  );
}
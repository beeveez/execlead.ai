import React, { useState } from "react";
import { ChevronRight, AlertCircle, User, Clock, Wrench, ListChecks, FileWarning, GitBranch, CheckCircle2 } from "lucide-react";
import { useRepairWorkflow } from "@/components/developer/repair/RepairWorkflowProvider";

const PRIORITY_STYLE = {
  P0: { color: "#ef4444", bg: "bg-red-500/10 border-red-500/20", label: "P0 — Critical" },
  P1: { color: "#f59e0b", bg: "bg-amber-500/10 border-amber-500/20", label: "P1 — High" },
  P2: { color: "#3b82f6", bg: "bg-blue-500/10 border-blue-500/20", label: "P2 — Medium" },
};

function DetailRow({ icon: Icon, label, value, color }) {
  return (
    <div className="flex items-start gap-2 py-1.5">
      <Icon size={13} className="text-white/40 mt-0.5 shrink-0" style={color ? { color } : undefined} />
      <div className="min-w-0">
        <div className="text-[10px] text-white/30 uppercase tracking-wider">{label}</div>
        <div className="text-xs text-white/70">{value}</div>
      </div>
    </div>
  );
}

export default function StreamBlockerDetail({ blocker, onRepaired, onVerified }) {
  const [expanded, setExpanded] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const { openRepairWorkflow } = useRepairWorkflow();
  const style = PRIORITY_STYLE[blocker.priority] || PRIORITY_STYLE.P2;

  const handleVerify = (e) => {
    e.stopPropagation();
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      onVerified?.(blocker);
    }, 1500);
  };

  return (
    <div className={`rounded-lg border ${expanded ? style.bg : "border-white/5 bg-white/[0.02]"} transition-colors`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-3 py-2.5 text-left"
      >
        <AlertCircle size={14} style={{ color: style.color }} className="shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-xs text-white/80 font-medium truncate">{blocker.title}</div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded" style={{ color: style.color, backgroundColor: `${style.color}1a` }}>
              {style.label}
            </span>
            <span className="text-[10px] text-white/30">{blocker.category}</span>
          </div>
        </div>
        <ChevronRight size={14} className={`text-white/30 transition-transform ${expanded ? "rotate-90" : ""}`} />
      </button>

      {expanded && (
        <div className="px-3 pb-4 pt-2 border-t border-white/5">
          <DetailRow icon={User} label="Engineering Owner" value={blocker.owner} />
          <DetailRow icon={AlertCircle} label="Priority" value={style.label} color={style.color} />
          <DetailRow icon={ListChecks} label="Status" value={blocker.status} />
          <DetailRow icon={Clock} label="Estimated Effort" value={blocker.estimatedEffort} />
          <DetailRow icon={Wrench} label="Recommended Repair" value={blocker.recommendedFix} />
          <DetailRow icon={AlertCircle} label="Root Cause" value={blocker.rootCause || "Under investigation"} />
          <DetailRow icon={Wrench} label="Affected Module" value={blocker.affectedModule || "Platform"} />
          {blocker.dependencies && blocker.dependencies.length > 0 && (
            <DetailRow icon={GitBranch} label="Dependencies" value={blocker.dependencies.join(", ")} />
          )}
          {blocker.evidence.length > 0 && (
            <div className="py-1.5">
              <div className="flex items-center gap-2 mb-1">
                <FileWarning size={13} className="text-white/40" />
                <span className="text-[10px] text-white/30 uppercase tracking-wider">Related Evidence</span>
              </div>
              <ul className="space-y-1">
                {blocker.evidence.map((e, i) => (
                  <li key={i} className="text-[11px] text-white/50 font-mono bg-white/[0.02] rounded px-2 py-1">{e}</li>
                ))}
              </ul>
            </div>
          )}
          {blocker.auditHistory && blocker.auditHistory.length > 0 && (
            <div className="py-1.5">
              <div className="flex items-center gap-2 mb-1">
                <Clock size={13} className="text-white/40" />
                <span className="text-[10px] text-white/30 uppercase tracking-wider">Audit History</span>
              </div>
              <ul className="space-y-1">
                {blocker.auditHistory.map((h, i) => (
                  <li key={i} className="text-[11px] text-white/40 bg-white/[0.02] rounded px-2 py-1">
                    <span className="text-white/50">{h.action}</span> — {new Date(h.timestamp).toLocaleString()} <span className="text-white/30">by {h.by}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex gap-2 mt-3">
            <button
              onClick={(e) => { e.stopPropagation(); openRepairWorkflow(blocker, { source: `${blocker.category || "Stream"} Intelligence™` }); onRepaired?.(blocker); }}
              className="inline-flex items-center gap-1 text-[10px] px-2.5 py-1.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
            >
              <Wrench size={10} /> Repair
            </button>
            <button
              onClick={handleVerify}
              disabled={verifying}
              className="inline-flex items-center gap-1 text-[10px] px-2.5 py-1.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
            >
              <CheckCircle2 size={10} /> {verifying ? "Verifying..." : "Verify"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
import React, { useState, useCallback } from "react";
import { X, Wrench } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { getRepairState, getRepairHistory } from "@/lib/repairWorkflowEngine";
import RepairInfoPanel from "@/components/developer/repair/RepairInfoPanel";
import RepairActionBar from "@/components/developer/repair/RepairActionBar";
import RepairHistory from "@/components/developer/repair/RepairHistory";
import RepairPipeline from "@/components/developer/repair/RepairPipeline";

const SEV_STYLE = {
  Critical: "text-red-400 bg-red-500/10 border-red-500/20",
  High: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  Medium: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  low: "text-white/50 bg-white/5 border-white/10",
  medium: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  high: "text-amber-400 bg-amber-500/10 border-amber-500/20",
};

const STATUS_STYLE = {
  open: "text-white/40 bg-white/5",
  applied: "text-blue-400 bg-blue-500/10",
  verified: "text-emerald-400 bg-emerald-500/10",
  failed: "text-red-400 bg-red-500/10",
  rolled_back: "text-amber-400 bg-amber-500/10",
  repairing: "text-amber-400 bg-amber-500/10",
};

export default function RepairWorkflowDrawer({ finding, onClose }) {
  const { user } = useAuth();
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((t) => t + 1), []);

  const repairState = getRepairState(finding.id);
  const history = getRepairHistory(finding.id);
  const status = repairState.status || "open";
  const sevStyle = SEV_STYLE[finding.severity] || SEV_STYLE.medium;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-[#0a0a0f] border-l border-white/10 flex flex-col h-full animate-fade-in overflow-hidden">
        {/* Header */}
        <div className="shrink-0 border-b border-white/10 px-4 py-3 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
            <Wrench size={14} className="text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold text-white truncate">Repair Workflow™</h2>
            <p className="text-[10px] text-white/40 truncate">{finding.source} · {finding.verificationEngine}</p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {/* Issue Title + Badges */}
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className={`text-[9px] px-1.5 py-0.5 rounded border ${sevStyle}`}>{finding.severity}</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${STATUS_STYLE[status] || STATUS_STYLE.open}`}>{status}</span>
              {finding.autoRepairable && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">Auto-Repairable</span>
              )}
            </div>
            <h3 className="text-sm text-white font-medium leading-snug">{finding.issue}</h3>
          </div>

          <RepairPipeline repairState={repairState} />

          <RepairInfoPanel finding={finding} repairState={repairState} />

          <RepairActionBar
            key={tick}
            finding={finding}
            repairState={repairState}
            user={user}
            onStateChange={refresh}
          />

          <RepairHistory history={history} />
        </div>
      </div>
    </div>
  );
}
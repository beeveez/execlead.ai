import React from "react";
import { History, CheckCircle2, XCircle, Wrench, Zap, ShieldCheck, RotateCcw, UserPlus } from "lucide-react";

const ACTION_ICONS = {
  auto_repair_started: Wrench,
  repair_applied: CheckCircle2,
  repair_failed: XCircle,
  verified: ShieldCheck,
  verification_failed: XCircle,
  patch_generated: Zap,
  rolled_back: RotateCcw,
  owner_assigned: UserPlus,
};

export default function RepairHistory({ history }) {
  if (!history || history.length === 0) {
    return (
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 text-center">
        <History size={14} className="text-white/20 mx-auto mb-1" />
        <p className="text-[10px] text-white/30">No repair actions yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <History size={12} className="text-white/30" />
        <h4 className="text-xs font-bold text-white">Repair History</h4>
        <span className="text-[10px] text-white/30 ml-auto">{history.length} events</span>
      </div>
      <div className="space-y-1.5 max-h-48 overflow-y-auto">
        {history.map((h, i) => {
          const Icon = ACTION_ICONS[h.action] || History;
          const isFail = h.action.includes("failed");
          return (
            <div key={i} className="flex items-start gap-2 text-[10px]">
              <Icon size={10} className={`mt-0.5 flex-shrink-0 ${isFail ? "text-red-400" : "text-emerald-400"}`} />
              <div className="min-w-0 flex-1">
                <span className={isFail ? "text-red-400" : "text-white/60"}>{h.action.replace(/_/g, " ")}</span>
                {h.detail && <span className="text-white/30"> — {h.detail}</span>}
                <div className="text-[9px] text-white/20">{new Date(h.timestamp).toLocaleString()}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
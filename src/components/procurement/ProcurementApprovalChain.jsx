import React from "react";
import { Check, X, Clock, ChevronRight } from "lucide-react";
import { parseApprovalChain } from "@/lib/procurementEngine";

export default function ProcurementApprovalChain({ request }) {
  const chain = parseApprovalChain(request);
  if (chain.length === 0) return <div className="text-white/30 text-sm">No approval chain configured.</div>;
  const currentStep = request.current_approval_step || 0;

  return (
    <div className="space-y-1">
      {chain.map((s, i) => {
        const isCurrent = i === currentStep && request.status === "pending_approval";
        const isApproved = s.status === "approved";
        const isRejected = s.status === "rejected";
        const isPending = s.status === "pending";
        return (
          <React.Fragment key={s.step}>
            <div className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
              isApproved ? "bg-emerald-500/5 border-emerald-500/20" :
              isRejected ? "bg-red-500/5 border-red-500/20" :
              isCurrent ? "bg-amber-500/5 border-amber-500/20" :
              "bg-white/[0.02] border-white/5"
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                isApproved ? "bg-emerald-500/20 text-emerald-400" :
                isRejected ? "bg-red-500/20 text-red-400" :
                isCurrent ? "bg-amber-500/20 text-amber-400" :
                "bg-white/5 text-white/30"
              }`}>
                {isApproved ? <Check size={14} /> : isRejected ? <X size={14} /> : isCurrent ? <Clock size={14} /> : <span className="text-xs font-bold">{s.step}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-white/80 font-medium">{s.label}</span>
                  <span className="text-[10px] text-white/30 px-1.5 py-0.5 rounded bg-white/5">{s.role}</span>
                </div>
                {s.approver_name && (
                  <div className="text-xs text-white/40 mt-0.5">
                    {isApproved ? `Approved by ${s.approver_name}` : isRejected ? `Rejected by ${s.approver_name}` : `Action taken by ${s.approver_name}`}
                    {s.acted_at && ` · ${new Date(s.acted_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}`}
                  </div>
                )}
                {s.note && <div className="text-xs text-white/30 mt-0.5 italic">"{s.note}"</div>}
                {isCurrent && <div className="text-xs text-amber-400 mt-0.5">Awaiting approval...</div>}
              </div>
              <div className="shrink-0">
                {isApproved && <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Approved</span>}
                {isRejected && <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">Rejected</span>}
                {isCurrent && <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse">Pending</span>}
                {isPending && !isCurrent && <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/30 border border-white/10">Queued</span>}
              </div>
            </div>
            {i < chain.length - 1 && <div className="flex justify-center"><ChevronRight size={12} className="text-white/10 rotate-90" /></div>}
          </React.Fragment>
        );
      })}
    </div>
  );
}
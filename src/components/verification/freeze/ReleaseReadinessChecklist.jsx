import React from "react";
import { ClipboardCheck, CheckCircle2 } from "lucide-react";
import { RELEASE_READINESS_CHECKLIST } from "@/lib/execVerifiedFreeze";

export default function ReleaseReadinessChecklist() {
  const validated = RELEASE_READINESS_CHECKLIST.filter((i) => i.status === "validated").length;

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <ClipboardCheck size={16} className="text-indigo-400" />
        <h3 className="text-sm font-semibold text-white/80">Release Readiness</h3>
        <span className="text-[10px] px-2 py-0.5 rounded-full ml-auto text-emerald-400 bg-emerald-500/10">
          {validated}/{RELEASE_READINESS_CHECKLIST.length} Validated
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {RELEASE_READINESS_CHECKLIST.map((item) => (
          <div key={item.id} className="flex items-start gap-2.5 p-3 rounded-lg bg-white/[0.02] border border-white/5">
            <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-white/70">{item.label}</div>
              <div className="text-[10px] text-white/30 mt-0.5 leading-relaxed">{item.notes}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
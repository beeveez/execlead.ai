import React from "react";
import { GitBranch, CheckCircle2, Circle } from "lucide-react";
import { getLifecycleStages } from "@/lib/verificationIntelligenceEngine";

export default function VerificationLifecycle({ verification }) {
  const stages = getLifecycleStages(verification);

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <GitBranch size={16} className="text-indigo-400" />
        <h3 className="text-sm font-semibold text-white/80">Verification Lifecycle™</h3>
      </div>
      <div className="space-y-0">
        {stages.map((stage, index) => (
          <div key={stage.id} className="flex items-stretch gap-3">
            <div className="flex flex-col items-center">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors ${
                stage.completed ? "bg-emerald-500/15 border-emerald-500/30" : "bg-white/[0.02] border-white/10"
              } ${stage.current ? "ring-2 ring-indigo-500/30" : ""}`}>
                {stage.completed ? <CheckCircle2 size={14} className="text-emerald-400" /> : <Circle size={14} className="text-white/20" />}
              </div>
              {index < stages.length - 1 && (
                <div className={`w-px flex-1 my-0.5 ${stage.completed ? "bg-emerald-500/20" : "bg-white/5"}`} />
              )}
            </div>
            <div className="pb-3 flex-1">
              <div className={`text-xs font-medium ${stage.completed ? "text-white/70" : stage.current ? "text-indigo-400" : "text-white/30"}`}>
                {stage.label}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
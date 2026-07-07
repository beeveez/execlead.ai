import React from "react";
import { ORCHESTRATION_PIPELINE } from "@/lib/securityArchitecture";
import { getIcon } from "@/components/security/SecuritySection";
import { ChevronDown, Server } from "lucide-react";

export default function OrchestrationPipeline() {
  return (
    <div className="bg-gradient-to-br from-violet-500/[0.05] to-transparent border border-violet-500/10 rounded-xl p-5">
      <div className="flex items-center gap-2 text-violet-400 text-xs font-medium uppercase tracking-wider mb-1">
        <Server size={14} /> AI Orchestration Pipeline
      </div>
      <p className="text-white/40 text-xs mb-4">
        Every AI request flows through this server-side pipeline. Orchestration logic is never exposed to the browser — the client only receives the final response.
      </p>
      <div className="space-y-0">
        {ORCHESTRATION_PIPELINE.map((stage, i) => {
          const Icon = getIcon(stage.icon);
          const isLast = i === ORCHESTRATION_PIPELINE.length - 1;
          const isClient = i === 0 || isLast;
          return (
            <div key={i} className="flex items-stretch">
              <div className="flex flex-col items-center mr-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${isClient ? "bg-blue-500/10 border border-blue-500/20" : "bg-violet-500/10 border border-violet-500/20"}`}>
                  <Icon size={16} className={isClient ? "text-blue-400" : "text-violet-400"} />
                </div>
                {!isLast && <div className="w-px flex-1 bg-gradient-to-b from-violet-500/20 to-violet-500/5 my-1" />}
              </div>
              <div className="flex-1 pb-4">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${isClient ? "text-blue-300" : "text-white/80"}`}>{stage.step}</span>
                  {isClient && <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400">Client</span>}
                  {!isClient && <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-400">Server</span>}
                </div>
                <p className="text-xs text-white/40 mt-0.5">{stage.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
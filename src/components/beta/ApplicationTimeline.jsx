import React from "react";
import { Check } from "lucide-react";
import { TIMELINE_STAGES, getTimelineProgress } from "@/lib/foundingAdmissionsEngine";

export default function ApplicationTimeline({ status }) {
  const { currentIndex } = getTimelineProgress(status);
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <div className="text-[10px] text-white/30 uppercase tracking-wider mb-3">Application Timeline</div>
      <div className="space-y-0">
        {TIMELINE_STAGES.map((stage, i) => {
          const isDone = i < currentIndex;
          const isCurrent = i === currentIndex;
          const isFuture = i > currentIndex;
          return (
            <div key={stage.id} className="flex items-start gap-3 relative">
              {i < TIMELINE_STAGES.length - 1 && (
                <div className={`absolute left-[7px] top-5 bottom-0 w-px ${isDone ? "bg-emerald-500/30" : "bg-white/5"}`} />
              )}
              <div className={`w-3.5 h-3.5 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center ${
                isDone ? "bg-emerald-500 border-emerald-500" :
                isCurrent ? "bg-amber-500 border-amber-400" :
                "bg-transparent border-white/15"
              }`}>
                {isDone && <Check size={8} className="text-white" />}
                {isCurrent && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
              <div className="pb-3">
                <div className={`text-xs font-medium ${isCurrent ? "text-amber-400" : isDone ? "text-white/70" : "text-white/30"}`}>
                  {stage.label}
                </div>
                {(isCurrent || isDone) && (
                  <div className="text-[10px] text-white/30 mt-0.5">{stage.desc}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
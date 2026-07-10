import React from "react";
import { Check } from "lucide-react";
import { JOURNEY_STAGES, getJourneyStage } from "@/lib/brandExperience";

/**
 * LeadershipJourneyPath — visual progression of the 8-stage executive journey
 * (Seed → Emerging Leader → ... → Legacy Leader) with the user's current
 * position highlighted and percentage completion.
 */
export default function LeadershipJourneyPath({ xp = 0 }) {
  const { current, journeyPercent } = getJourneyStage(xp);
  const currentIndex = JOURNEY_STAGES.indexOf(current);

  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider">Your Executive Journey</h2>
          <p className="text-white/30 text-xs mt-0.5">From Seed to Legacy Leader — {journeyPercent}% complete</p>
        </div>
        <div className="text-right">
          <span className="text-2xl">{current.icon}</span>
          <div className="text-white font-semibold text-sm">{current.title}</div>
        </div>
      </div>

      {/* Overall progress bar */}
      <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-6">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 rounded-full transition-all duration-700"
          style={{ width: `${journeyPercent}%` }}
        />
      </div>

      {/* Stage path */}
      <div className="flex items-start justify-between gap-1 overflow-x-auto pb-2">
        {JOURNEY_STAGES.map((stage, i) => {
          const completed = i < currentIndex;
          const active = i === currentIndex;
          return (
            <div key={stage.id} className="flex flex-col items-center gap-1.5 flex-shrink-0 min-w-[70px]">
              <div className="flex items-center w-full">
                {i > 0 && <div className={`flex-1 h-0.5 ${i <= currentIndex ? "bg-indigo-500/40" : "bg-white/5"}`} />}
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm transition-all ${
                    active
                      ? "bg-indigo-500/20 ring-2 ring-indigo-500/40 scale-110"
                      : completed
                        ? "bg-emerald-500/15 text-emerald-400"
                        : "bg-white/5 text-white/30"
                  }`}
                >
                  {completed ? <Check size={14} /> : stage.icon}
                </div>
                {i < JOURNEY_STAGES.length - 1 && <div className={`flex-1 h-0.5 ${i < currentIndex ? "bg-indigo-500/40" : "bg-white/5"}`} />}
              </div>
              <span className={`text-[10px] text-center leading-tight ${active ? "text-indigo-400 font-medium" : completed ? "text-white/50" : "text-white/25"}`}>
                {stage.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
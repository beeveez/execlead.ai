import React from "react";
import { ArrowRight } from "lucide-react";

export default function JourneyStageHero({ data, user }) {
  const { stage } = data;

  return (
    <div className="bg-gradient-to-br from-indigo-500/10 via-violet-500/5 to-transparent border border-indigo-500/15 rounded-2xl p-6">
      <div className="flex items-start gap-4">
        <div className="text-4xl">{stage.icon}</div>
        <div>
          <div className="text-[10px] uppercase tracking-widest text-indigo-400 font-semibold">Journey Stage</div>
          <h1 className="text-2xl font-bold text-white">{stage.title}</h1>
          <p className="text-white/40 text-sm">{stage.description}</p>
        </div>
      </div>

      {stage.nextStage && (
        <>
          <div className="mt-5 flex items-center gap-2 text-sm text-white/50 flex-wrap">
            <span className="text-white/30">Next:</span>
            <span className="text-indigo-400 font-medium">{stage.nextStage.title}</span>
            <ArrowRight size={12} className="text-white/30" />
            <span className="text-white/40 text-xs">{stage.nextStage.description}</span>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-white/40 mb-1.5">
              <span>Progress to {stage.nextStage.title}</span>
              <span className="text-white/60 font-medium">{stage.progress}%</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all" style={{ width: `${stage.progress}%` }} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
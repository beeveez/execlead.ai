import React from "react";
import { Crosshair } from "lucide-react";

export default function CurrentObjectiveCard({ coachingFocus, bottleneck }) {
  if (!coachingFocus) return null;
  const objective = `Develop ${coachingFocus.dimension || coachingFocus.title}`;

  return (
    <div className="bg-gradient-to-br from-indigo-500/10 to-violet-500/5 border border-indigo-500/15 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <Crosshair size={16} className="text-indigo-400" />
        <h3 className="text-sm font-semibold text-white">Current Objective</h3>
      </div>
      <p className="text-lg font-bold text-white mb-2">{objective}</p>
      {coachingFocus.description && (
        <p className="text-sm text-white/50 leading-relaxed">{coachingFocus.description}</p>
      )}
      {bottleneck && (
        <div className="mt-3 pt-3 border-t border-white/5 text-xs text-white/40">
          Focus area: <span className="text-white/60">{bottleneck.dimension}</span> · Gap: {bottleneck.gap}%
        </div>
      )}
    </div>
  );
}
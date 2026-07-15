import React from "react";
import { Sparkles } from "lucide-react";

export default function FutureVisionCard({ predictions, stage }) {
  if (!predictions) return null;
  return (
    <div className="bg-gradient-to-br from-violet-500/10 to-indigo-500/5 border border-violet-500/15 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={16} className="text-violet-400" />
        <h3 className="text-sm font-semibold text-white">Future Vision</h3>
      </div>
      <p className="text-sm text-white/60 leading-relaxed">
        {predictions.insight || "Continue your journey to unlock future projections."}
      </p>
      {stage?.nextStage && (
        <div className="mt-3 pt-3 border-t border-white/5 text-xs text-white/40">
          Likely next milestone: <span className="text-violet-400">{stage.nextStage.title}</span>
        </div>
      )}
    </div>
  );
}
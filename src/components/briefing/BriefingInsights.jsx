import React from "react";
import { Sparkles, Lightbulb } from "lucide-react";

export default function BriefingInsights({ briefing }) {
  const insights = briefing.executiveInsights || [];

  if (insights.length === 0) return null;

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={16} className="text-violet-400" />
        <h3 className="text-sm font-semibold text-white">Executive Insights™</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {insights.map((insight, i) => (
          <div key={i} className="flex items-start gap-2 bg-violet-500/5 border border-violet-500/10 rounded-lg p-3">
            <Lightbulb size={14} className="text-violet-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-white/70 leading-relaxed">{insight}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
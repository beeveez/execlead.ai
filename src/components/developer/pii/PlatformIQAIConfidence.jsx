import React from "react";
import { Sparkles, Gauge } from "lucide-react";

/**
 * AI Confidence card — shows how confidently EXEC™ can reason about
 * the platform's current intelligence state, with a qualitative level.
 */
function getConfidenceLevel(score) {
  if (score >= 85) return { label: "High", color: "#10b981", bg: "bg-emerald-500/10", border: "border-emerald-500/20" };
  if (score >= 60) return { label: "Medium", color: "#f59e0b", bg: "bg-amber-500/10", border: "border-amber-500/20" };
  return { label: "Low", color: "#ef4444", bg: "bg-red-500/10", border: "border-red-500/20" };
}

export default function PlatformIQAIConfidence({ piqScore, aiConfidence }) {
  const level = getConfidenceLevel(aiConfidence);

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={16} className="text-violet-400" />
        <h3 className="text-sm font-bold text-white">AI Confidence</h3>
        <span className="text-[10px] text-white/30 ml-auto">EXEC™ Reasoning Assurance</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Platform IQ™ */}
        <div className="flex flex-col items-center justify-center bg-white/[0.02] rounded-lg p-4">
          <span className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Platform IQ™</span>
          <span className="text-4xl font-bold text-white">{piqScore}</span>
          <span className="text-[10px] text-white/30 mt-1">Current Quotient</span>
        </div>

        {/* AI Confidence */}
        <div className="flex flex-col items-center justify-center bg-white/[0.02] rounded-lg p-4">
          <span className="text-[10px] text-white/40 uppercase tracking-wider mb-1">AI Confidence</span>
          <span className="text-4xl font-bold" style={{ color: level.color }}>{aiConfidence}%</span>
          <div className={`flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md ${level.bg} border ${level.border}`}>
            <Gauge size={10} style={{ color: level.color }} />
            <span className="text-[10px] font-medium" style={{ color: level.color }}>{level.label}</span>
          </div>
        </div>
      </div>

      {/* Confidence Bar */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-[10px] text-white/30 mb-1">
          <span>Confidence Level</span>
          <span style={{ color: level.color }}>{level.label}</span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${aiConfidence}%`, backgroundColor: level.color }}
          />
        </div>
        <div className="flex justify-between text-[9px] text-white/20 mt-1">
          <span>Low</span>
          <span>Medium</span>
          <span>High</span>
        </div>
      </div>
    </div>
  );
}
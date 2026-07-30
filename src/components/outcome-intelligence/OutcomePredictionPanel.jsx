import React from "react";
import { Compass, Clock, Sparkles } from "lucide-react";
import { OUTCOME_CATEGORIES } from "@/lib/outcomeAttributionEngine";

/**
 * OutcomePredictionPanel — predicts likely future outcomes from readiness,
 * competency alignment, and historical base rates. Proves that Executive
 * Readiness predicts measurable outcomes.
 */
export default function OutcomePredictionPanel({ predictions = [] }) {
  if (!predictions.length) return null;

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-1">
        <Compass size={16} className="text-cyan-400" />
        <h3 className="text-white font-semibold text-sm">Outcome Prediction™</h3>
        <span className="text-[10px] text-white/30">Readiness → likely outcomes</span>
      </div>
      <p className="text-white/40 text-[11px] mb-4">Predicted from your readiness score, competency alignment, and observed outcome history.</p>

      <div className="space-y-2">
        {predictions.slice(0, 8).map((p) => {
          const cat = OUTCOME_CATEGORIES[p.category] || { color: "#6366f1" };
          return (
            <div key={p.outcomeType} className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
              <span className="text-white/70 text-xs w-36 truncate">{p.label}</span>
              <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${p.probability}%`, backgroundColor: cat.color }} />
              </div>
              <span className="text-xs font-bold w-9 text-right" style={{ color: cat.color }}>{p.probability}%</span>
              <span className="text-[10px] text-white/40 w-20 text-right flex items-center gap-0.5 justify-end">
                <Clock size={9} /> {p.expectedTimeline}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-1.5 text-[10px] text-white/40">
        <Sparkles size={10} className="text-amber-400" />
        Higher readiness + competency alignment → higher outcome probability.
      </div>
    </div>
  );
}
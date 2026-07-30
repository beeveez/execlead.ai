import React from "react";
import { History } from "lucide-react";
import { categoryColor } from "@/lib/decisionLabEngine";

/**
 * DecisionHistory — decision timeline with score, category, chosen strategy,
 * and reflection. Clicking expands the AI feedback and blind spots.
 */
export default function DecisionHistory({ ld }) {
  const { attempts } = ld;
  if (!attempts.length) return <div className="text-center py-12 text-xs text-white/40">No decisions yet. Start a scenario to build your history.</div>;
  return (
    <div>
      <div className="flex items-center gap-2 mb-4"><History size={16} className="text-violet-400" /><h3 className="text-white font-semibold text-sm">Decision History™</h3><span className="text-xs text-white/30">({attempts.length})</span></div>
      <div className="space-y-2">
        {attempts.map((a) => (
          <details key={a.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
            <summary className="cursor-pointer flex items-start justify-between gap-2 list-none">
              <div>
                <div className="text-sm text-white/80">{a.scenario_title}</div>
                <div className="text-[11px] text-white/40 mt-0.5 flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded" style={{ background: `${categoryColor(a.category)}22`, color: categoryColor(a.category) }}>{a.category}</span>
                  {a.chosen_strategy_name && <span>→ {a.chosen_strategy_name}</span>}
                  <span>· {new Date(a.completed_at).toLocaleDateString()}</span>
                </div>
              </div>
              <span className="text-lg font-bold text-white">{a.overall_score}<span className="text-xs text-white/30">/100</span></span>
            </summary>
            <div className="mt-3 pt-3 border-t border-white/5 space-y-2 text-xs">
              {a.explanation && <div><div className="text-white/40 mb-0.5">Your reasoning</div><p className="text-white/60">{a.explanation}</p></div>}
              {a.business_impact && <div><div className="text-white/40 mb-0.5">Business Impact</div><p className="text-white/60">{a.business_impact}</p></div>}
              {a.strengths?.length > 0 && <div><div className="text-emerald-400 mb-0.5">Strengths</div><p className="text-white/60">{a.strengths.join(" • ")}</p></div>}
              {a.blind_spots?.length > 0 && <div><div className="text-rose-400 mb-0.5">Blind Spots</div><p className="text-white/60">{a.blind_spots.join(" • ")}</p></div>}
              {a.feedback && <div><div className="text-indigo-400 mb-0.5">EXEC™ Feedback</div><p className="text-white/60">{a.feedback}</p></div>}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
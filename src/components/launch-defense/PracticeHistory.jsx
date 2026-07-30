import React from "react";
import { History } from "lucide-react";

/**
 * PracticeHistory™ — every practice session: date, scenario, persona,
 * questions answered, overall score, weak areas, recommendations.
 */
export default function PracticeHistory({ ld }) {
  const { sessions } = ld;
  return (
    <div>
      <div className="flex items-center gap-2 mb-4"><History size={16} className="text-violet-400" /><h3 className="text-white font-semibold text-sm">Practice History™</h3></div>
      {sessions.length === 0 ? (
        <p className="text-xs text-white/40 text-center py-8">No practice sessions yet. Start a simulation to build your history.</p>
      ) : (
        <div className="space-y-2">
          {sessions.map((s) => (
            <div key={s.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-sm text-white/80">{s.scenario_name}</div>
                  <div className="text-[11px] text-white/40 mt-0.5">{s.persona} · {new Date(s.completed_at).toLocaleString()}</div>
                </div>
                <span className="text-lg font-bold text-white">{s.overall_score}<span className="text-xs text-white/30">/100</span></span>
              </div>
              {s.weak_areas?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {s.weak_areas.map((w, i) => <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-300">{w}</span>)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
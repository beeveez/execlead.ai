import React from "react";
import { Trophy } from "lucide-react";

/**
 * DecisionAchievements — badges earned through decision practice.
 */
export default function DecisionAchievements({ ld }) {
  const { achievements } = ld;
  return (
    <div>
      <div className="flex items-center gap-2 mb-4"><Trophy size={16} className="text-amber-400" /><h3 className="text-white font-semibold text-sm">Achievements™</h3></div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {achievements.map((a) => (
          <div key={a.id} className={`rounded-xl p-4 border transition-all ${a.earned ? "bg-amber-500/10 border-amber-500/30" : "bg-white/[0.02] border-white/5 opacity-60"}`}>
            <div className="text-2xl mb-1">{a.icon}</div>
            <div className="text-sm font-semibold text-white">{a.name}</div>
            <div className="text-[11px] text-white/40 mt-0.5">{a.description}</div>
            {a.earned && <div className="text-[10px] text-amber-400 mt-1 uppercase tracking-wider">Earned</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
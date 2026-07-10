import React from "react";
import { EXECUTIVE_COMPETENCIES, parseJSON } from "@/lib/reputationSystem";

export default function CompetencyRadar({ reputation }) {
  if (!reputation) return null;
  const competencies = parseJSON(reputation.competencies_json, {});

  const sorted = EXECUTIVE_COMPETENCIES.map(c => ({ ...c, score: competencies[c.id] || 0 })).sort((a, b) => b.score - a.score);
  const top = sorted[0];

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm">🎯</span>
        <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider">Executive Competency Reputation</h3>
      </div>
      {top && top.score > 0 && (
        <div className="mb-4 bg-indigo-500/5 border border-indigo-500/10 rounded-xl p-3 text-center">
          <div className="text-white/40 text-[10px] mb-1">Top Competency</div>
          <div className="text-2xl mb-1">{top.icon}</div>
          <div className="text-indigo-400 text-sm font-medium">{top.name}</div>
          <div className="text-white/60 text-lg font-bold mt-0.5">{top.score}<span className="text-white/30 text-xs">/100</span></div>
        </div>
      )}
      <div className="space-y-2.5">
        {sorted.map((c) => {
          const score = c.score || 0;
          const barColor = score >= 85 ? 'bg-emerald-500' : score >= 70 ? 'bg-blue-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-500';
          return (
            <div key={c.id} className="flex items-center gap-2.5">
              <span className="text-sm flex-shrink-0 w-5 text-center">{c.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-white/60 text-[11px] truncate">{c.name}</span>
                  <span className={`text-xs font-semibold ${score >= 85 ? 'text-emerald-400' : score >= 70 ? 'text-blue-400' : score >= 50 ? 'text-amber-400' : 'text-red-400'}`}>{score}</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className={`h-full ${barColor} transition-all duration-500`} style={{ width: `${score}%` }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
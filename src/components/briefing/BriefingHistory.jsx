import React, { useState } from "react";
import { ArrowLeft, Calendar, TrendingUp, TrendingDown } from "lucide-react";

export default function BriefingHistory({ briefings = [], onSelect, onBack }) {
  const [compareIdx, setCompareIdx] = useState(null);
  const sorted = [...briefings].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

  return (
    <div className="max-w-6xl mx-auto space-y-4 p-4 md:p-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 transition-colors">
          <ArrowLeft size={12} /> Back to Briefing
        </button>
        <h2 className="text-lg font-bold text-white">Briefing History</h2>
      </div>

      {sorted.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
          <Calendar size={32} className="text-white/20 mx-auto mb-3" />
          <p className="text-white/40 text-sm">No previous briefings found.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((b, i) => {
            const change = b.score_change || 0;
            const isSelected = compareIdx === i;
            return (
              <div key={b.id} className={`bg-white/5 border rounded-xl p-4 transition-colors cursor-pointer ${isSelected ? "border-indigo-500/40" : "border-white/10 hover:border-white/20"}`}
                onClick={() => onSelect ? onSelect(b) : setCompareIdx(isSelected ? null : i)}>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-white">{b.briefing_score || 0}</span>
                    </div>
                    <div>
                      <div className="text-sm text-white font-medium">
                        {b.briefing_date ? new Date(b.briefing_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : b.period}
                      </div>
                      <div className="text-xs text-white/40">{b.period} · {b.status}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-xs text-white/40">Readiness</div>
                      <div className="text-sm text-white font-semibold">{b.executive_readiness || 0}%</div>
                    </div>
                    {change !== 0 && (
                      <div className={`flex items-center gap-1 text-xs ${change > 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {change > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {change > 0 ? `+${change}` : change}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
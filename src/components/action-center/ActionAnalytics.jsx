import React from 'react';
import { BarChart3, Award } from 'lucide-react';

const TYPE_COLORS = {
  verification: "bg-amber-500/30",
  learning: "bg-cyan-500/30",
  practice: "bg-violet-500/30",
  reflection: "bg-indigo-500/30",
  career: "bg-emerald-500/30",
  task: "bg-blue-500/30",
  networking: "bg-pink-500/30",
  health: "bg-rose-500/30",
  ai_recommendation: "bg-violet-500/30",
  goal: "bg-orange-500/30",
};

export default function ActionAnalytics({ analytics }) {
  const maxImpact = Math.max(...(analytics.byType || []).map((t) => t.impact), 1);

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-white/80 mb-4 flex items-center gap-2">
        <BarChart3 size={14} className="text-indigo-400" />
        Impact Breakdown by Action Type
      </h3>

      {analytics.byType && analytics.byType.length > 0 ? (
        <div className="space-y-2.5">
          {analytics.byType.map((item) => (
            <div key={item.type} className="flex items-center gap-3">
              <span className="text-[11px] text-white/50 capitalize w-24 truncate">{item.type?.replace(/_/g, " ")}</span>
              <div className="flex-1 h-5 bg-white/[0.02] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${TYPE_COLORS[item.type] || "bg-white/10"}`}
                  style={{ width: `${Math.max((item.impact / maxImpact) * 100, 5)}%` }}
                />
              </div>
              <span className="text-[10px] text-white/40 w-8 text-right">{item.count}</span>
              <span className="text-[10px] text-cyan-400 w-10 text-right">{item.impact}pts</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6">
          <Award size={20} className="text-white/10 mx-auto mb-2" />
          <p className="text-[11px] text-white/30">Complete actions to see your impact breakdown.</p>
        </div>
      )}

      {/* Summary stats */}
      <div className="mt-4 pt-3 border-t border-white/5 grid grid-cols-4 gap-2 text-center">
        <div>
          <div className="text-[9px] text-white/30 uppercase">Total</div>
          <div className="text-sm font-bold text-white">{analytics.total}</div>
        </div>
        <div>
          <div className="text-[9px] text-white/30 uppercase">Completed</div>
          <div className="text-sm font-bold text-emerald-400">{analytics.completed}</div>
        </div>
        <div>
          <div className="text-[9px] text-white/30 uppercase">Rate</div>
          <div className="text-sm font-bold text-cyan-400">{analytics.completionRate}%</div>
        </div>
        <div>
          <div className="text-[9px] text-white/30 uppercase">Last 7d</div>
          <div className="text-sm font-bold text-indigo-400">{analytics.last7}</div>
        </div>
      </div>
    </div>
  );
}
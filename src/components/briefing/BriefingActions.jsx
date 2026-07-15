import React from "react";
import { Zap, Compass, Clock, TrendingUp } from "lucide-react";

const PRIORITY_COLORS = {
  critical: "text-red-400 bg-red-500/10 border-red-500/20",
  high: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  medium: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
  low: "text-white/40 bg-white/5 border-white/10",
};

export default function BriefingActions({ briefing }) {
  const actions = briefing.executiveActions || [];
  const ahead = briefing.lookingAhead || {};

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-white/5 border border-white/10 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Zap size={16} className="text-indigo-400" />
          <h3 className="text-sm font-semibold text-white">Executive Actions</h3>
        </div>
        {actions.length > 0 ? (
          <div className="space-y-2">
            {actions.map((a, i) => (
              <div key={i} className="bg-white/[0.03] border border-white/5 rounded-lg p-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm text-white font-medium">{a.title}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border capitalize ${PRIORITY_COLORS[a.priority] || PRIORITY_COLORS.medium}`}>
                    {a.priority}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs">
                  {a.estimated_minutes && (
                    <span className="flex items-center gap-1 text-white/40">
                      <Clock size={10} /> {a.estimated_minutes} min
                    </span>
                  )}
                  {a.expected_readiness_increase && (
                    <span className="flex items-center gap-1 text-emerald-400">
                      <TrendingUp size={10} /> {a.expected_readiness_increase}
                    </span>
                  )}
                </div>
                {a.career_impact && <p className="text-xs text-white/50 mt-2">{a.career_impact}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-white/30">No actions recommended this week.</p>
        )}
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Compass size={16} className="text-violet-400" />
          <h3 className="text-sm font-semibold text-white">Looking Ahead</h3>
        </div>
        {ahead.next_week_focus && (
          <div className="mb-3">
            <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Next Week Focus</div>
            <p className="text-sm text-white/70">{ahead.next_week_focus}</p>
          </div>
        )}
        {ahead.upcoming_milestones?.length > 0 && (
          <div className="mb-3">
            <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Upcoming Milestones</div>
            <ul className="space-y-1">
              {ahead.upcoming_milestones.map((m, i) => (
                <li key={i} className="text-xs text-white/60 flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-violet-400" /> {m}
                </li>
              ))}
            </ul>
          </div>
        )}
        {ahead.recommended_goals?.length > 0 && (
          <div className="mb-3">
            <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Recommended Goals</div>
            <ul className="space-y-1">
              {ahead.recommended_goals.map((g, i) => (
                <li key={i} className="text-xs text-white/60 flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-indigo-400" /> {g}
                </li>
              ))}
            </ul>
          </div>
        )}
        {ahead.estimated_career_progress && (
          <div className="pt-3 border-t border-white/5">
            <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Estimated Career Progress</div>
            <p className="text-xs text-emerald-400">{ahead.estimated_career_progress}</p>
          </div>
        )}
      </div>
    </div>
  );
}
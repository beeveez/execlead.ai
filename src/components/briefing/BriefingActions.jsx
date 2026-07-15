import React from "react";
import { Link } from "react-router-dom";
import { Compass, ArrowRight, Zap } from "lucide-react";

export default function BriefingActions({ briefing }) {
  const ahead = briefing.lookingAhead || {};
  const actionCount = (briefing.executiveActions || []).length;

  return (
    <div className="space-y-4">
      <Link
        to="/action-center"
        className="block group bg-white/5 hover:bg-white/[0.07] border border-white/10 hover:border-white/20 rounded-xl p-5 transition-all"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-amber-400" />
            <span className="text-sm font-semibold text-white">Executive Action Center™</span>
          </div>
          <ArrowRight size={14} className="text-white/20 group-hover:text-white/40 group-hover:translate-x-0.5 transition-all" />
        </div>
        <p className="text-xs text-white/50 mt-2">
          {actionCount > 0
            ? `${actionCount} actions recommended this week`
            : "View your recommended executive actions"}
        </p>
      </Link>

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
            <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Weekly Recommendations</div>
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
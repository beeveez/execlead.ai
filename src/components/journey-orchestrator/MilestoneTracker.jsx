import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Circle, ArrowRight } from "lucide-react";

export default function MilestoneTracker({ milestones }) {
  if (!milestones) return null;
  const { milestones: items, achievedCount, total, completionRate, next } = milestones;

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider">Milestone Tracker™</h2>
        <span className="text-xs text-white/40">{achievedCount}/{total} unlocked</span>
      </div>

      {next && (
        <div className="mb-4 bg-indigo-500/5 border border-indigo-500/10 rounded-lg px-3 py-2.5">
          <div className="text-[10px] uppercase tracking-wider text-indigo-400 font-semibold mb-0.5">Next Milestone</div>
          <div className="text-white text-sm font-medium">{next.icon} {next.label}</div>
        </div>
      )}

      <div className="space-y-1.5">
        {items.map((m) => (
          <Link key={m.id} to={m.path} className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-white/5 transition-colors group">
            {m.achieved ? (
              <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
            ) : (
              <Circle size={16} className="text-white/20 flex-shrink-0" />
            )}
            <span className={`text-sm flex-1 ${m.achieved ? "text-white/40 line-through" : "text-white/70"}`}>
              {m.icon} {m.label}
            </span>
            {!m.achieved && <ArrowRight size={12} className="text-white/20 group-hover:text-indigo-400 transition-colors" />}
          </Link>
        ))}
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-[10px] text-white/30 mb-1">
          <span>Completion</span>
          <span className="text-white/50 font-medium">{completionRate}%</span>
        </div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" style={{ width: `${completionRate}%` }} />
        </div>
      </div>
    </div>
  );
}
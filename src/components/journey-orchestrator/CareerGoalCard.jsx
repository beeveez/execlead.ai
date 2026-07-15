import React from "react";
import { Target, Building2, Briefcase, Clock } from "lucide-react";

export default function CareerGoalCard({ goal, readiness }) {
  if (!goal) return null;
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Target size={16} className="text-indigo-400" />
        <h3 className="text-sm font-semibold text-white">Career Goal</h3>
      </div>
      <p className="text-lg font-bold text-white mb-3">{goal.label}</p>
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="flex items-center gap-2 text-white/50">
          <Briefcase size={11} className="text-white/30" /> {readiness?.currentLevel || "Current"}
        </div>
        <div className="flex items-center gap-2 text-white/50">
          <Building2 size={11} className="text-white/30" /> {readiness?.targetLevel || "Target"}
        </div>
        <div className="flex items-center gap-2 text-white/50">
          <Clock size={11} className="text-white/30" /> {readiness?.timeline || "—"}
        </div>
        <div className="flex items-center gap-2 text-indigo-400">
          <Target size={11} /> {goal.type || "role"}
        </div>
      </div>
    </div>
  );
}
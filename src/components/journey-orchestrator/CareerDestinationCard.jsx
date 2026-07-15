import React from "react";
import { MapPin } from "lucide-react";

export default function CareerDestinationCard({ goal, readiness, milestones }) {
  if (!goal) return null;
  const remainingMilestones = milestones?.total ? milestones.total - milestones.achievedCount : 0;

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <MapPin size={16} className="text-emerald-400" />
        <h3 className="text-sm font-semibold text-white">Career Destination</h3>
      </div>
      <p className="text-lg font-bold text-white mb-3">{goal.label}</p>
      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-white/40">Target Leadership Level</span>
          <span className="text-white font-medium">{readiness?.targetLevel || "—"}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-white/40">Estimated Journey</span>
          <span className="text-white font-medium">{readiness?.timeline || "—"}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-white/40">Major Milestones Remaining</span>
          <span className="text-white font-medium">{remainingMilestones}</span>
        </div>
      </div>
    </div>
  );
}
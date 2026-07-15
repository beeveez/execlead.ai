import React from "react";
import { History } from "lucide-react";

export default function JourneyHistoryCard({ milestones }) {
  const achieved = milestones?.milestones?.filter((m) => m.achieved) || [];
  if (achieved.length === 0) return null;

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <History size={16} className="text-cyan-400" />
        <h3 className="text-sm font-semibold text-white">Journey History</h3>
        <span className="text-[10px] text-white/30 ml-auto">{achieved.length} milestones completed</span>
      </div>
      <div className="space-y-2">
        {achieved.map((m, i) => (
          <div key={i} className="flex items-center gap-3 bg-white/[0.02] border border-white/5 rounded-lg p-3">
            <span className="text-lg">{m.icon}</span>
            <div className="text-sm text-white font-medium">{m.label}</div>
            <span className="ml-auto text-[10px] text-emerald-400/60">✓ Achieved</span>
          </div>
        ))}
      </div>
    </div>
  );
}
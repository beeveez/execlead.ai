import React from "react";
import { Link } from "react-router-dom";
const MISSION_CONFIG = {
  daily: { label: "Daily Mission", icon: "☀️", color: "text-amber-400", border: "border-amber-500/20", bg: "from-amber-500/5" },
  weekly: { label: "Weekly Mission", icon: "📅", color: "text-cyan-400", border: "border-cyan-500/20", bg: "from-cyan-500/5" },
  monthly: { label: "Monthly Mission", icon: "🎯", color: "text-violet-400", border: "border-violet-500/20", bg: "from-violet-500/5" },
  quarterly: { label: "Quarterly Objective", icon: "🏆", color: "text-emerald-400", border: "border-emerald-500/20", bg: "from-emerald-500/5" },
};

export default function MissionBoard({ missions }) {
  if (!missions || missions.length === 0) return null;

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
      <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-4">Mission Engine™</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {missions.map((mission) => {
          const config = MISSION_CONFIG[mission.type] || MISSION_CONFIG.daily;
          return (
            <Link key={mission.type} to={mission.path} className={`block bg-gradient-to-br ${config.bg} to-transparent border ${config.border} rounded-xl p-4 hover:border-white/15 transition-all group`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{config.icon}</span>
                <span className={`text-[10px] font-semibold uppercase tracking-wider ${config.color}`}>{config.label}</span>
                {mission.status === "completed" && <span className="ml-auto text-[10px] text-emerald-400">✓ Done</span>}
              </div>
              <p className="text-white font-medium text-sm mb-1">{mission.title}</p>
              <p className="text-white/40 text-xs mb-3 line-clamp-2">{mission.description}</p>
              <div className="flex items-center justify-between text-[10px] text-white/30">
                <span>{mission.estimatedTime}</span>
                <span className="text-white/40">{mission.impact}</span>
              </div>
              {mission.progress > 0 && (
                <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-white/20 rounded-full" style={{ width: `${mission.progress}%` }} />
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
import React from "react";
import { Flame, BookOpen, Zap, Scale, Calendar } from "lucide-react";

export default function EngagementMetrics({ metrics }) {
  if (!metrics) return null;

  const stats = [
    { icon: Flame, label: "Activity Streak", value: `${metrics.streak} days`, color: "text-amber-400" },
    { icon: BookOpen, label: "Learning Streak", value: `${metrics.learningStreak} days`, color: "text-indigo-400" },
    { icon: Zap, label: "Mission Streak", value: `${metrics.missionStreak} days`, color: "text-emerald-400" },
    { icon: Scale, label: "Decisions", value: metrics.decisionCount, color: "text-violet-400" },
    { icon: Calendar, label: "Weekly Active", value: `${metrics.weeklyActiveDays} days`, color: "text-cyan-400" },
  ];

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
      <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-4">Engagement Engine™</h2>
      <div className="space-y-2">
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center ${stat.color}`}>
              <stat.icon size={14} />
            </div>
            <span className="text-white/50 text-sm flex-1">{stat.label}</span>
            <span className="text-white font-bold text-sm">{stat.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
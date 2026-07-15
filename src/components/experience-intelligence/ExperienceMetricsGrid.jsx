import React from 'react';
import { Activity, Brain, Zap, Bell, Database, TrendingUp, Target, Clock } from 'lucide-react';

const ICON_MAP = { Activity, Brain, Zap, Bell, Database, TrendingUp, Target, Clock };

export default function ExperienceMetricsGrid({ health }) {
  const metrics = [
    { icon: "Activity", label: "Experience Health™", value: `${health.experienceHealth}%`, color: "text-indigo-400", desc: "Intelligence graph connectedness" },
    { icon: "Zap", label: "Synchronization Health™", value: `${health.synchronizationHealth}%`, color: "text-sky-400", desc: "Event-driven cross-module sync" },
    { icon: "TrendingUp", label: "Events Today", value: health.eventsToday, color: "text-cyan-400", desc: "Executive events published" },
    { icon: "Target", label: "Recommendations Generated", value: health.recommendationsGenerated, color: "text-violet-400", desc: "From single source of truth" },
    { icon: "Brain", label: "Recommendations Accepted", value: `${health.recommendationsAccepted}%`, color: "text-emerald-400", desc: "Action completion rate" },
    { icon: "Database", label: "Memory Utilization™", value: `${health.memoryUtilization}%`, color: "text-amber-400", desc: "Leadership memory domains" },
    { icon: "Bell", label: "Notification Queue", value: health.notificationQueue, color: "text-rose-400", desc: "Pending notifications" },
    { icon: "Zap", label: "Interventions Triggered", value: health.interventionsTriggered, color: health.interventionsTriggered > 0 ? "text-amber-400" : "text-emerald-400", desc: "Predictive interventions" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {metrics.map((m) => {
        const Icon = ICON_MAP[m.icon] || Activity;
        return (
          <div key={m.label} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon size={14} className={m.color} />
              <span className="text-[9px] text-white/30 uppercase tracking-wider">{m.label}</span>
            </div>
            <div className={`text-2xl font-bold ${m.color} mb-1`}>{m.value}</div>
            <div className="text-[10px] text-white/30 leading-tight">{m.desc}</div>
          </div>
        );
      })}
    </div>
  );
}
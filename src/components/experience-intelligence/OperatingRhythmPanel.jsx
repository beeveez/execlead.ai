import React from 'react';
import { Clock, Calendar, CalendarDays, RefreshCw } from 'lucide-react';

const CADENCE_ICONS = { daily: Clock, weekly: Calendar, monthly: CalendarDays, quarterly: RefreshCw };
const CADENCE_COLORS = { daily: "text-sky-400", weekly: "text-indigo-400", monthly: "text-violet-400", quarterly: "text-amber-400" };

export default function OperatingRhythmPanel({ rhythmStats }) {
  const cadences = [
    { key: "daily", label: "Daily", steps: rhythmStats.dailySteps, items: ["Dashboard", "Action Center", "Coach"] },
    { key: "weekly", label: "Weekly", steps: rhythmStats.weeklySteps, items: ["Executive Briefing™", "Journey Review"] },
    { key: "monthly", label: "Monthly", steps: rhythmStats.monthlySteps, items: ["Promotion Forecast", "Leadership DNA Review"] },
    { key: "quarterly", label: "Quarterly", steps: rhythmStats.quarterlySteps, items: ["Career Strategy Review", "Goal Reset"] },
  ];

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-white/50 text-xs uppercase tracking-widest">
          <Clock size={12} className="text-indigo-400" />
          Executive Operating Rhythm™
        </div>
        <span className="text-[10px] text-white/30">{rhythmStats.totalSteps} total steps</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {cadences.map((c) => {
          const Icon = CADENCE_ICONS[c.key];
          const color = CADENCE_COLORS[c.key];
          return (
            <div key={c.key} className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Icon size={12} className={color} />
                <span className={`text-[10px] font-semibold uppercase tracking-wider ${color}`}>{c.label}</span>
              </div>
              <div className="space-y-1">
                {c.items.map((item, i) => (
                  <div key={i} className="text-[10px] text-white/40 flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-white/20 flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
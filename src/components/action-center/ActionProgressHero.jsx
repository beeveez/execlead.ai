import React from 'react';
import { Flame, TrendingUp, CheckCircle, Target } from 'lucide-react';

export default function ActionProgressHero({ analytics, todaysActions }) {
  const todayCompleted = todaysActions.filter((a) => a.status === "completed").length;
  const todayTotal = todaysActions.length;
  const todayPct = todayTotal > 0 ? Math.round((todayCompleted / todayTotal) * 100) : 0;

  return (
    <div className="bg-gradient-to-br from-indigo-500/5 via-cyan-500/[0.02] to-transparent border border-indigo-500/10 rounded-2xl p-6">
      <div className="flex items-center gap-6 flex-wrap">
        {/* Today's progress ring */}
        <div className="flex flex-col items-center">
          <div className="relative w-28 h-28">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="6" className="text-white/5" />
              <circle
                cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="6"
                className="text-indigo-400 transition-all duration-700"
                strokeDasharray={`${(todayPct / 100) * 264} 264`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-white">{todayCompleted}/{todayTotal}</span>
              <span className="text-[9px] text-white/30 uppercase">today</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex-1 min-w-[280px] grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat icon={Flame} label="Streak" value={`${analytics.streak} days`} color="text-orange-400" />
          <Stat icon={CheckCircle} label="Completed" value={analytics.completed} sublabel={`all time`} color="text-emerald-400" />
          <Stat icon={TrendingUp} label="Momentum" value={analytics.momentum >= 0 ? `+${analytics.momentum}` : analytics.momentum} sublabel="vs last week" color={analytics.momentum >= 0 ? "text-emerald-400" : "text-rose-400"} />
          <Stat icon={Target} label="Impact" value={analytics.totalImpact} sublabel="points earned" color="text-cyan-400" />
        </div>
      </div>

      {/* 7-day trend */}
      {analytics.trend.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/5">
          <div className="text-[10px] text-white/30 uppercase tracking-wider mb-2">7-Day Completion Trend</div>
          <div className="flex items-end gap-2 h-16">
            {analytics.trend.map((day, i) => {
              const max = Math.max(...analytics.trend.map((d) => d.completed), 1);
              const h = (day.completed / max) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex-1 flex items-end">
                    <div
                      className={`w-full rounded-t transition-all duration-500 ${day.completed > 0 ? "bg-indigo-500/40" : "bg-white/[0.03]"}`}
                      style={{ height: `${Math.max(h, 4)}%` }}
                      title={`${day.completed} completed`}
                    />
                  </div>
                  <span className="text-[8px] text-white/30">{day.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ icon: Icon, label, value, sublabel, color = "text-white" }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon size={11} className={color} />
        <span className="text-[9px] uppercase tracking-wider text-white/40">{label}</span>
      </div>
      <div className={`text-lg font-bold ${color}`}>{value}</div>
      {sublabel && <div className="text-[9px] text-white/25">{sublabel}</div>}
    </div>
  );
}
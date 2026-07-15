import React from 'react';
import { ShieldCheck, TrendingUp, AlertTriangle } from 'lucide-react';

export default function ExperienceHealthHero({ health }) {
  const score = health.overallHealth;
  const color = score >= 80 ? "text-emerald-400" : score >= 60 ? "text-amber-400" : "text-rose-400";
  const ringColor = score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#f43f5e";
  const status = score >= 80 ? "Healthy" : score >= 60 ? "Needs Attention" : "Critical";
  const icon = score >= 80 ? <ShieldCheck size={20} /> : score >= 60 ? <TrendingUp size={20} /> : <AlertTriangle size={20} />;

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
      <div className="flex items-center justify-between gap-6 flex-wrap">
        <div className="flex items-center gap-5">
          {/* Score Ring */}
          <div className="relative w-24 h-24 flex-shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
              <circle
                cx="50" cy="50" r="42" fill="none" stroke={ringColor} strokeWidth="6"
                strokeDasharray={`${(score / 100) * 264} 264`}
                strokeLinecap="round"
              />
            </svg>
            <div className={`absolute inset-0 flex flex-col items-center justify-center ${color}`}>
              <span className="text-2xl font-bold leading-none">{score}</span>
              <span className="text-[8px] text-white/30 uppercase tracking-wider mt-0.5">Health</span>
            </div>
          </div>
          {/* Label */}
          <div>
            <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-1">
              {icon}
              Experience Health™
            </div>
            <div className={`text-xl font-bold ${color}`}>{status}</div>
            <div className="text-white/40 text-xs mt-1">
              Overall orchestration health across all Experience Intelligence™ services
            </div>
          </div>
        </div>
        {/* Quick Stats */}
        <div className="flex gap-4 flex-wrap">
          <QuickStat label="Sync Health" value={`${health.synchronizationHealth}%`} color="text-indigo-400" />
          <QuickStat label="Events Today" value={health.eventsToday} color="text-sky-400" />
          <QuickStat label="Memory" value={`${health.memoryUtilization}%`} color="text-violet-400" />
          <QuickStat label="Interventions" value={health.interventionsTriggered} color={health.interventionsTriggered > 0 ? "text-amber-400" : "text-emerald-400"} />
        </div>
      </div>
    </div>
  );
}

function QuickStat({ label, value, color }) {
  return (
    <div className="text-center">
      <div className={`text-lg font-bold ${color}`}>{value}</div>
      <div className="text-[9px] text-white/30 uppercase tracking-wider">{label}</div>
    </div>
  );
}
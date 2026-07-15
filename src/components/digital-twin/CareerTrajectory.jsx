import React from 'react';
import { ChevronRight, MapPin, Clock, TrendingUp } from 'lucide-react';

const STATUS_STYLES = {
  active: { color: '#6366f1', bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', label: 'Current' },
  on_track: { color: '#10b981', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', label: 'On Track' },
  preparing: { color: '#f59e0b', bg: 'bg-amber-500/10', border: 'border-amber-500/30', label: 'Preparing' },
  building: { color: '#06b6d4', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', label: 'Building' },
  aspirational: { color: '#a855f7', bg: 'bg-violet-500/10', border: 'border-violet-500/30', label: 'Aspirational' },
};

function TrajectoryStage({ stage, isLast }) {
  const style = STATUS_STYLES[stage.status] || STATUS_STYLES.preparing;
  return (
    <div className="flex items-start gap-3 flex-1">
      <div className="flex flex-col items-center">
        <div className={`w-14 h-14 rounded-2xl ${style.bg} ${style.border} border flex items-center justify-center`}>
          <div className="text-center">
            <div className="text-sm font-bold" style={{ color: style.color }}>{stage.confidence}%</div>
            <div className="text-[7px] text-white/30 uppercase">conf.</div>
          </div>
        </div>
        {!isLast && (
          <div className="w-0.5 flex-1 mt-2 bg-gradient-to-b from-white/20 to-white/5 min-h-[40px]" />
        )}
      </div>
      <div className="flex-1 pt-1">
        <div className="flex items-center gap-2">
          <span className={`text-[9px] px-2 py-0.5 rounded-full ${style.bg} ${style.border} border font-medium`} style={{ color: style.color }}>
            {style.label}
          </span>
          <span className="text-[9px] text-white/30 flex items-center gap-0.5">
            <Clock size={9} /> {stage.timeline}
          </span>
        </div>
        <div className="text-sm font-bold text-white mt-1">{stage.role}</div>
        <div className="text-[10px] text-white/30">{stage.label}</div>
      </div>
    </div>
  );
}

export default function CareerTrajectory({ trajectory }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <MapPin size={16} className="text-cyan-400" />
        <h2 className="text-lg font-bold text-white">Career Trajectory™</h2>
        <span className="text-[10px] text-white/30 ml-auto">From current role to executive goal</span>
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-stretch gap-4 md:gap-0">
          {trajectory.stages.map((stage, i) => (
            <React.Fragment key={stage.id}>
              <TrajectoryStage stage={stage} isLast={i === trajectory.stages.length - 1} />
              {i < trajectory.stages.length - 1 && (
                <div className="hidden md:flex items-center px-2">
                  <ChevronRight size={16} className="text-white/20" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="mt-6 flex items-center gap-2 text-[11px] text-white/50 bg-cyan-500/[0.03] border border-cyan-500/10 rounded-lg p-3">
          <TrendingUp size={12} className="text-cyan-400 flex-shrink-0 mt-0.5" />
          <span>{trajectory.summary}</span>
        </div>

        {/* Progress bar across stages */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-[9px] text-white/30 mb-1.5">
            <span>Current</span>
            <span>Executive Goal</span>
          </div>
          <div className="relative h-2 rounded-full bg-white/5 overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-cyan-500/40 via-violet-500/40 to-amber-500/40"
              style={{ width: `${Math.min(100, trajectory.stages[0].score)}%` }}
            />
            {trajectory.stages.slice(1).map((s, i) => (
              <div
                key={s.id}
                className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border-2"
                style={{
                  left: `calc(${Math.min(100, s.score)}% - 5px)`,
                  borderColor: STATUS_STYLES[s.status]?.color || '#64748b',
                  backgroundColor: 'var(--background)',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
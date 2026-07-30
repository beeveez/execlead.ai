import React from "react";
import { Brain, TrendingUp, Zap, Flame, Trophy } from "lucide-react";

/**
 * CoachEffectivenessPanel — measures the Executive Coach™:
 * most effective topics, exercises, scenarios, highest competency growth,
 * fastest improvement, and lowest engagement.
 */
export default function CoachEffectivenessPanel({ coachEffectiveness }) {
  if (!coachEffectiveness) return null;
  const topics = coachEffectiveness.byTopic || [];

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Brain size={16} className="text-violet-400" />
        <h3 className="text-white font-semibold text-sm">Coach Effectiveness™</h3>
        <span className="text-[10px] text-white/30">Which coaching produces results</span>
      </div>

      {/* Highlight cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <Highlight
          icon={Trophy}
          label="Most effective topic"
          value={coachEffectiveness.mostEffectiveTopic?.topic || "—"}
          sub={coachEffectiveness.mostEffectiveTopic ? `+${coachEffectiveness.mostEffectiveTopic.totalGain} · ${coachEffectiveness.mostEffectiveTopic.outcomes} outcomes` : "no data"}
          color="#10b981"
        />
        <Highlight
          icon={Zap}
          label="Fastest improvement"
          value={coachEffectiveness.fastestImprovement?.topic || coachEffectiveness.fastestImprovement?.competency || "—"}
          sub={coachEffectiveness.fastestImprovement ? `${coachEffectiveness.fastestImprovement.daysToOutcome} days` : "no data"}
          color="#f59e0b"
        />
        <Highlight
          icon={Flame}
          label="Lowest engagement"
          value={coachEffectiveness.lowestEngagement?.topic || "—"}
          sub={coachEffectiveness.lowestEngagement ? `${coachEffectiveness.lowestEngagement.outcomes} outcome${coachEffectiveness.lowestEngagement.outcomes === 1 ? "" : "s"}` : "no data"}
          color="#ef4444"
        />
      </div>

      {/* Topic breakdown */}
      {topics.length === 0 ? (
        <div className="text-center py-4 text-white/40 text-xs">
          No coaching-linked outcomes yet. Complete coaching sessions and record leadership outcomes to measure coach effectiveness.
        </div>
      ) : (
        <div className="space-y-2">
          <div className="text-[10px] text-white/40 uppercase tracking-wider flex items-center gap-1">
            <TrendingUp size={10} /> Coaching topics by total gain
          </div>
          {topics.map((t) => (
            <div key={t.topic} className="flex items-center gap-3">
              <span className="text-white/70 text-xs w-32 truncate">{t.topic}</span>
              <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-violet-500 to-indigo-400 rounded-full" style={{ width: `${Math.min((t.totalGain / (topics[0]?.totalGain || 1)) * 100, 100)}%` }} />
              </div>
              <span className="text-emerald-400 text-xs font-semibold w-12 text-right">+{t.totalGain}</span>
              <span className="text-white/30 text-[10px] w-16 text-right">{t.avgConfidence}% conf</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Highlight({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
      <div className="flex items-center gap-1.5 mb-1.5">
        <Icon size={12} style={{ color }} />
        <span className="text-[10px] text-white/40 uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-sm font-bold truncate" style={{ color }}>{value}</div>
      <div className="text-[10px] text-white/30 mt-0.5">{sub}</div>
    </div>
  );
}
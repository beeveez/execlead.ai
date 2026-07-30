import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Target, Clock, Zap, CheckCircle2, ArrowRight, Sparkles } from "lucide-react";

/**
 * TodaysExecutiveMission — answers "What should I do next?"
 *
 * A personalized daily mission assembled by the Executive Readiness Engine
 * from readiness recommendations. Each step links directly to the module
 * that contributes the most evidence toward readiness.
 */
export default function TodaysExecutiveMission({ mission }) {
  const [completed, setCompleted] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`mission_${mission?.id}`)) || []; } catch { return []; }
  });

  function toggle(id) {
    const next = completed.includes(id) ? completed.filter((x) => x !== id) : [...completed, id];
    setCompleted(next);
    try { localStorage.setItem(`mission_${mission?.id}`, JSON.stringify(next)); } catch {}
  }

  if (!mission) return null;
  const doneCount = completed.length;
  const progress = mission.totalCount > 0 ? Math.round((doneCount / mission.totalCount) * 100) : 0;

  return (
    <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/15 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target size={16} className="text-amber-400" />
          <h3 className="text-white font-semibold text-sm">Today's Executive Mission™</h3>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <Clock size={12} className="text-white/40" />
          <span className="text-white/50">{mission.estimatedTime}</span>
          {mission.potentialGain > 0 && (
            <>
              <span className="text-white/20">·</span>
              <Zap size={12} className="text-amber-400" />
              <span className="text-amber-400 font-medium">+{mission.potentialGain}% readiness</span>
            </>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-[10px] text-white/40 uppercase tracking-wider mb-1.5">
          <span>Completion Progress</span>
          <span className="text-amber-400">{doneCount}/{mission.totalCount}</span>
        </div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <motion.div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
        </div>
      </div>

      {/* Mission steps */}
      <div className="space-y-2">
        {mission.steps.map((step) => {
          const isDone = completed.includes(step.id);
          return (
            <div key={step.id} className={`flex items-center gap-3 rounded-xl border transition-all ${isDone ? "bg-emerald-500/5 border-emerald-500/15" : "bg-white/[0.02] border-white/5"}`}>
              <button onClick={() => toggle(step.id)} className="flex-shrink-0 p-2.5" aria-label={isDone ? "Mark incomplete" : "Mark complete"}>
                {isDone ? <CheckCircle2 size={18} className="text-emerald-400" /> : <div className="w-[18px] h-[18px] rounded-full border-2 border-white/20 hover:border-amber-400/50 transition-colors" />}
              </button>
              <Link to={step.path} className="flex-1 flex items-center gap-3 py-2.5 pr-3 min-w-0 group">
                <span className="text-lg flex-shrink-0">{step.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm truncate ${isDone ? "text-white/40 line-through" : "text-white/80 group-hover:text-amber-400 transition-colors"}`}>{step.label}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {step.competencies?.slice(0, 2).map((c) => (
                      <span key={c} className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-white/40">{c}</span>
                    ))}
                    <span className="text-[9px] text-amber-400/60">+{step.gain}%</span>
                  </div>
                </div>
                <ArrowRight size={14} className="text-white/20 group-hover:text-amber-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
              </Link>
            </div>
          );
        })}
      </div>

      {doneCount === mission.totalCount && (
        <div className="mt-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <Sparkles size={13} className="text-emerald-400" />
          <span className="text-xs text-emerald-400">Mission complete — your Executive Readiness has grown today.</span>
        </div>
      )}
    </div>
  );
}
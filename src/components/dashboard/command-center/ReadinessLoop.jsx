import React from "react";
import { Repeat } from "lucide-react";

/**
 * ReadinessLoop — the platform's operating rhythm visualized.
 *
 * Learn → Practice → Simulate → AI Feedback → Improve → Measure → Repeat
 *
 * Every module participates in this loop. Every activity contributes
 * evidence toward one measurable objective: Executive Readiness.
 */
export default function ReadinessLoop({ activeIndex = 0 }) {
  const stages = [
    { id: "learn", label: "Learn", icon: "🎓", contribution: "Knowledge · Business Acumen" },
    { id: "practice", label: "Practice", icon: "✏️", contribution: "Self-awareness · Maturity" },
    { id: "simulate", label: "Simulate", icon: "🧠", contribution: "Decision Quality · Judgment" },
    { id: "feedback", label: "AI Feedback", icon: "✨", contribution: "Improvement Signals" },
    { id: "improve", label: "Improve", icon: "📈", contribution: "Competency Growth" },
    { id: "measure", label: "Measure", icon: "📊", contribution: "Progress Validation" },
  ];

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Repeat size={16} className="text-indigo-400" />
        <h3 className="text-white font-semibold text-sm">Executive Readiness Loop™</h3>
        <span className="text-[10px] text-white/30">Your operating rhythm</span>
      </div>

      <div className="flex items-center gap-1 overflow-x-auto pb-2">
        {stages.map((stage, i) => {
          const isActive = i === activeIndex;
          const isPast = i < activeIndex;
          return (
            <React.Fragment key={stage.id}>
              <div className={`flex flex-col items-center min-w-[72px] transition-all ${isActive ? "scale-105" : ""}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg border transition-all ${isActive ? "bg-indigo-500/20 border-indigo-500/40 shadow-lg shadow-indigo-500/10" : isPast ? "bg-emerald-500/10 border-emerald-500/20" : "bg-white/[0.02] border-white/5"}`}>
                  {stage.icon}
                </div>
                <span className={`text-[10px] mt-1.5 font-medium ${isActive ? "text-indigo-400" : "text-white/40"}`}>{stage.label}</span>
              </div>
              {i < stages.length - 1 && (
                <div className={`h-px flex-1 min-w-[12px] transition-colors ${isPast ? "bg-emerald-500/30" : "bg-white/10"}`} />
              )}
            </React.Fragment>
          );
        })}
        <div className="flex flex-col items-center min-w-[72px]">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg border border-indigo-500/20 bg-indigo-500/5">
            🔁
          </div>
          <span className="text-[10px] mt-1.5 font-medium text-white/40">Repeat</span>
        </div>
      </div>

      <p className="text-white/40 text-[11px] mt-3 text-center">
        Every module feeds one continuous journey — <span className="text-white/60">Become Executive Ready.</span>
      </p>
    </div>
  );
}
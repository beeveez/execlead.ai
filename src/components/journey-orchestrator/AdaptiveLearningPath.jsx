import React from "react";
import { CheckCircle2, Circle, Clock, TrendingUp, ArrowRight } from "lucide-react";

const TYPE_BADGE = {
  course: { label: "Course", color: "text-indigo-400 bg-indigo-500/10" },
  simulation: { label: "Simulation", color: "text-violet-400 bg-violet-500/10" },
  challenge: { label: "Challenge", color: "text-amber-400 bg-amber-500/10" },
  reading: { label: "Reading", color: "text-cyan-400 bg-cyan-500/10" },
};

export default function AdaptiveLearningPath({ path }) {
  if (!path || path.length === 0) return null;

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
      <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-4">Adaptive Learning Path™</h2>
      <div className="space-y-2">
        {path.map((item) => {
          const badge = TYPE_BADGE[item.type] || TYPE_BADGE.course;
          const completed = item.status === "completed";
          return (
            <div key={item.order} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${completed ? "bg-emerald-500/5 border-emerald-500/10" : "bg-white/[0.02] border-white/5 hover:border-white/10"}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${completed ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-white/40"}`}>
                {completed ? <CheckCircle2 size={14} /> : item.order}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-white/80 text-sm font-medium truncate">{item.title}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${badge.color}`}>{badge.label}</span>
                </div>
                <p className="text-white/30 text-xs truncate">{item.description}</p>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-white/30 flex-shrink-0">
                <span className="flex items-center gap-1"><Clock size={10} />{item.estimatedTime}</span>
                <span className="flex items-center gap-1 text-emerald-400"><TrendingUp size={10} />+{item.readinessGain}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
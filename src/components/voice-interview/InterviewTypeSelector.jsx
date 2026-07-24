import React from "react";
import { Mic, Briefcase, Crown, Clock, Zap } from "lucide-react";

const DIFFICULTY_COLORS = { Easy: "#10b981", Medium: "#06b6d4", Hard: "#f59e0b", "Very Hard": "#ef4444", Configurable: "#6366f1" };

export default function InterviewTypeSelector({ types, selected, onSelect }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {types.map((t) => (
        <button
          key={t.id}
          onClick={() => onSelect(t)}
          className={`text-left bg-white/[0.02] border rounded-xl p-4 transition-all hover:-translate-y-0.5 ${selected?.id === t.id ? "border-indigo-500/40 bg-indigo-500/5" : "border-white/5 hover:border-white/10"}`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${t.mode === "executive" ? "bg-amber-500/10" : "bg-indigo-500/10"}`}>
                {t.mode === "executive" ? <Crown size={16} className="text-amber-400" /> : <Briefcase size={16} className="text-indigo-400" />}
              </div>
              <span className="text-sm font-semibold text-white">{t.name}</span>
            </div>
            <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${DIFFICULTY_COLORS[t.difficulty]}20`, color: DIFFICULTY_COLORS[t.difficulty] }}>{t.difficulty}</span>
          </div>
          <p className="text-[11px] text-white/40 leading-relaxed mb-3">{t.description}</p>
          <div className="flex items-center gap-3 text-[10px] text-white/30">
            <span className="flex items-center gap-1"><Clock size={10} /> {t.estimatedMinutes} min</span>
            <span className="flex items-center gap-1"><Zap size={10} /> {t.estimatedCredits} credits</span>
            <span className={`px-1.5 py-0.5 rounded-full font-medium ${t.mode === "executive" ? "bg-amber-500/10 text-amber-400" : "bg-indigo-500/10 text-indigo-400"}`}>{t.mode === "executive" ? "Executive" : "Professional"}</span>
          </div>
        </button>
      ))}
    </div>
  );
}
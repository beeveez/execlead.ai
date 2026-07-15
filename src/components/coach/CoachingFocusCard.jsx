import React from "react";
import { Target } from "lucide-react";

export default function CoachingFocusCard({ focus }) {
  if (!focus) return null;
  return (
    <div className="bg-gradient-to-br from-indigo-500/10 to-violet-500/5 border border-indigo-500/15 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <Target size={14} className="text-indigo-400" />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400">Today's Coaching Focus</span>
      </div>
      <h3 className="text-lg font-bold text-white mb-1">{focus.title}</h3>
      <p className="text-xs text-white/40">{focus.description}</p>
    </div>
  );
}
import React from "react";
import { Link } from "react-router-dom";
import { MessageSquare, AlertTriangle, ArrowRight } from "lucide-react";

export default function CoachingFocus({ focus, bottleneck }) {
  return (
    <div className="space-y-4">
      {focus && (
        <Link to={focus.path} className="block group">
          <div className="bg-gradient-to-br from-violet-500/10 to-indigo-500/5 border border-violet-500/15 rounded-2xl p-5 hover:border-violet-500/25 transition-all">
            <div className="flex items-center gap-2 text-violet-400 text-xs uppercase tracking-widest font-semibold mb-3">
              <MessageSquare size={14} /> Today's Coaching Focus
            </div>
            <h3 className="text-white font-bold text-base mb-1">{focus.title}</h3>
            <p className="text-white/50 text-sm mb-3 leading-relaxed">{focus.description}</p>
            <div className="flex items-center gap-3 text-xs">
              <span className="text-white/40">Current: <span className="text-white font-bold">{focus.currentScore}%</span></span>
              <span className="text-white/40">Target: <span className="text-white font-bold">{focus.targetScore}%</span></span>
              <span className="ml-auto flex items-center gap-1 text-violet-400 group-hover:gap-2 transition-all">
                Start Session <ArrowRight size={12} />
              </span>
            </div>
          </div>
        </Link>
      )}

      {bottleneck && (
        <div className="bg-rose-500/5 border border-rose-500/15 rounded-2xl p-5">
          <div className="flex items-center gap-2 text-rose-400 text-xs uppercase tracking-widest font-semibold mb-2">
            <AlertTriangle size={14} /> Current Bottleneck
          </div>
          <h3 className="text-white font-bold text-base mb-1">{bottleneck.dimension}</h3>
          <p className="text-white/50 text-sm leading-relaxed">{bottleneck.description}</p>
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full" style={{ width: `${bottleneck.current}%` }} />
            </div>
            <span className="text-xs text-white/40">{bottleneck.current}% / {bottleneck.target}%</span>
          </div>
        </div>
      )}
    </div>
  );
}
import React from "react";
import { Link } from "react-router-dom";
import { Compass, ArrowRight } from "lucide-react";

/**
 * LeadershipJourneyCard — answers "What should I focus on now?"
 *
 * Displays the current leadership stage and progression toward the next
 * milestone. Stages: Emerging Leader → Team Leader → Manager → Senior
 * Manager → Director → Executive → Future CIO.
 */
export default function LeadershipJourneyCard({ journey }) {
  if (!journey) return null;
  const { currentStage, nextStage, progressToNext, pointsToNext, points } = journey;

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Compass size={16} className="text-violet-400" />
        <h3 className="text-white font-semibold text-sm">Leadership Journey</h3>
      </div>

      <div className="flex items-center gap-4 mb-5">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/10 border border-violet-500/20 flex items-center justify-center text-2xl flex-shrink-0">
          {currentStage?.icon || "🌱"}
        </div>
        <div className="min-w-0">
          <div className="text-white/30 text-[10px] uppercase tracking-wider">Current Stage</div>
          <h4 className="text-white font-bold text-base truncate">{currentStage?.label || "Emerging Leader"}</h4>
          <p className="text-white/40 text-xs mt-0.5">{points.toLocaleString()} journey points</p>
        </div>
      </div>

      {nextStage ? (
        <>
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-white/40">Progress to <span className="text-violet-400 font-medium">{nextStage.label}</span></span>
            <span className="text-white/60 font-medium">{progressToNext}%</span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-2">
            <div className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-700" style={{ width: `${progressToNext}%` }} />
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-white/30">{pointsToNext.toLocaleString()} points to next milestone</span>
            <Link to="/journey" className="flex items-center gap-1 text-violet-400 hover:text-violet-300 transition-colors">
              View journey <ArrowRight size={11} />
            </Link>
          </div>
        </>
      ) : (
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <span className="text-base">💎</span>
          <span className="text-xs text-amber-400">You've reached the highest leadership stage — Legacy Leader.</span>
        </div>
      )}
    </div>
  );
}
import React from "react";
import { getTierInfo, getNextTier, parseJSON } from "@/lib/reputationConfig";
import { Sparkles, CheckCircle2, Circle, Target, Clock } from "lucide-react";

export default function AICoach({ rep, recommendations }) {
  const score = rep.reputation_score || 0;
  const tier = getTierInfo(rep.reputation_tier);
  const nextTier = getNextTier(rep.reputation_tier);
  const pointsNeeded = nextTier ? Math.max(0, nextTier.min - score) : 0;

  const goals = nextTier ? [
    { label: `Reach ${nextTier.min} points`, done: score >= nextTier.min, progress: `${score} / ${nextTier.min}` },
    { label: 'Publish 2 more Leadership Letters', done: (rep.total_letters || 0) >= 7, progress: `${Math.min(rep.total_letters || 0, 7)} / 7` },
    { label: 'Complete 5 Executive Simulations', done: (rep.simulations_completed || 0) >= 5, progress: `${Math.min(rep.simulations_completed || 0, 5)} / 5` },
    { label: 'Earn 20 Helpful Contributions', done: (rep.helpful_responses || 0) >= 20, progress: `${Math.min(rep.helpful_responses || 0, 20)} / 20` },
    { label: 'Maintain Professional Conduct (30 days)', done: (rep.professional_conduct_score || 0) >= 90, progress: `${rep.professional_conduct_score || 0} / 90` },
    { label: 'Complete Leadership Academy Module 4', done: (rep.courses_completed || 0) >= 4, progress: `${Math.min(rep.courses_completed || 0, 4)} / 4` },
  ] : [{ label: 'Maximum tier achieved', done: true, progress: 'Complete' }];

  return (
    <div className="bg-gradient-to-br from-indigo-500/5 to-transparent border border-indigo-500/15 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles size={16} className="text-indigo-400" />
        <h2 className="text-sm font-semibold text-white/90">AI Reputation Coach</h2>
      </div>
      <p className="text-white/40 text-xs mb-4">
        {nextTier
          ? <>To reach <span className="text-indigo-400 font-medium">{nextTier.label}</span>, you need <span className="text-white/70 font-medium">{pointsNeeded} more points</span>. Complete the goals below:</>
          : <span className="text-amber-400">You've reached the highest tier — Global Thought Leader.</span>}
      </p>
      <div className="space-y-2 mb-4">
        {goals.map((g, i) => (
          <div key={i} className="flex items-center gap-2.5">
            {g.done ? <CheckCircle2 size={15} className="text-emerald-400 flex-shrink-0" /> : <Circle size={15} className="text-white/20 flex-shrink-0" />}
            <span className={`text-xs flex-1 ${g.done ? 'text-white/40 line-through' : 'text-white/70'}`}>{g.label}</span>
            <span className="text-[10px] text-white/30">{g.progress}</span>
          </div>
        ))}
      </div>
      {recommendations.length > 0 && (
        <div className="pt-3 border-t border-white/5">
          <div className="flex items-center gap-1.5 text-white/40 text-[10px] font-semibold uppercase tracking-wider mb-2">
            <Target size={11} /> Recommendations
          </div>
          <ul className="space-y-1.5">
            {recommendations.slice(0, 4).map((r, i) => (
              <li key={i} className="flex items-start gap-1.5 text-white/50 text-xs">
                <span className="text-indigo-400 mt-0.5">•</span> {r}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
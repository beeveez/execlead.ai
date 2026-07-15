import React from "react";
import { CheckCircle, Clock, TrendingUp } from "lucide-react";
import ActionList from "./ActionList";

export default function CompletedToday({ actions, onNavigate }) {
  if (!actions || actions.length === 0) return null;

  const totalTime = actions.reduce((sum, a) => sum + (a.estimated_minutes || 0), 0);
  const totalImpact = actions.reduce((sum, a) => sum + (a.impact_score || 0), 0);

  return (
    <div className="bg-emerald-500/[0.03] border border-emerald-500/10 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <CheckCircle size={14} className="text-emerald-400" />
        <h3 className="text-sm font-semibold text-white/80">Completed Today</h3>
        <span className="text-[10px] text-emerald-400/60 ml-auto flex items-center gap-3">
          <span className="flex items-center gap-1"><CheckCircle size={9} /> {actions.length} done</span>
          <span className="flex items-center gap-1"><Clock size={9} /> {totalTime}m invested</span>
          <span className="flex items-center gap-1"><TrendingUp size={9} /> +{totalImpact} impact</span>
        </span>
      </div>
      <ActionList actions={actions} onComplete={() => {}} onSkip={() => {}} onNavigate={onNavigate} />
    </div>
  );
}
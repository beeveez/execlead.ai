import React from "react";
import { Sparkles, Loader2, ArrowRight } from "lucide-react";
import { getAgent, getAgentColor } from "@/lib/aiAgents";

const PRIORITY_COLORS = {
  high: 'bg-red-500/10 text-red-300 border-red-500/20',
  medium: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  low: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
};

export default function RecommendationsList({ recommendations, loading, onAssign }) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Loader2 size={22} className="animate-spin text-indigo-400 mb-2" />
        <p className="text-white/40 text-sm">Analyzing your profile for recommendations...</p>
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="text-center py-8">
        <Sparkles size={28} className="mx-auto text-white/10 mb-2" />
        <p className="text-white/40 text-sm">No recommendations yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {recommendations.map((rec, i) => {
        const agent = getAgent(rec.agent_id);
        const colors = agent ? getAgentColor(agent.color) : null;
        const Icon = agent?.icon;
        return (
          <div key={i} className="bg-white/[0.03] border border-white/5 rounded-lg p-3 flex items-start gap-3">
            {Icon && (
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${colors.gradient} flex items-center justify-center flex-shrink-0`}>
                <Icon size={14} className={colors.icon} />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h4 className="text-white text-sm font-medium">{rec.title}</h4>
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium border ${PRIORITY_COLORS[rec.priority] || PRIORITY_COLORS.medium}`}>
                  {rec.priority}
                </span>
              </div>
              <p className="text-white/40 text-xs leading-relaxed">{rec.description}</p>
              {agent && onAssign && (
                <button
                  onClick={() => onAssign(agent)}
                  className="flex items-center gap-1 mt-1.5 text-[11px] text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                >
                  Delegate to {agent.short} <ArrowRight size={10} />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
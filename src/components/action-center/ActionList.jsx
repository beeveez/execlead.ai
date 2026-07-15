import React from 'react';
import { Check, SkipForward, ArrowRight, Clock, Sparkles } from 'lucide-react';
import { PRIORITY_COLORS } from '@/lib/executiveActionEngine';

const TYPE_LABELS = {
  goal: "Goal", task: "Task", learning: "Learning", verification: "Verification",
  networking: "Networking", career: "Career", health: "Health",
  reflection: "Reflection", practice: "Practice", ai_recommendation: "AI Recommendation",
};

export default function ActionList({ actions, onComplete, onSkip, onNavigate }) {
  if (!actions || actions.length === 0) {
    return (
      <div className="text-center py-12">
        <Check size={28} className="text-emerald-400/30 mx-auto mb-2" />
        <p className="text-white/40 text-sm">No pending actions. You're all caught up!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {actions.map((action) => {
        const isCompleted = action.status === "completed";
        const isSkipped = action.status === "skipped";
        const pri = PRIORITY_COLORS[action.priority] || PRIORITY_COLORS.medium;

        return (
          <div
            key={action.id}
            className={`border rounded-xl p-3 transition-all ${
              isCompleted ? "bg-emerald-500/[0.03] border-emerald-500/10 opacity-60" :
              isSkipped ? "bg-white/[0.01] border-white/5 opacity-40" :
              `${pri.bg} ${pri.border}`
            }`}
          >
            <div className="flex items-start gap-3">
              {/* Priority dot */}
              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${isCompleted ? "bg-emerald-500" : isSkipped ? "bg-white/20" : pri.dot}`} />

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[12px] font-medium ${isCompleted ? "text-white/40 line-through" : "text-white/80"}`}>
                    {action.title}
                  </span>
                  {action.ai_generated && (
                    <span className="flex items-center gap-0.5 text-[8px] text-violet-400 bg-violet-500/10 px-1.5 py-0.5 rounded-full">
                      <Sparkles size={8} /> AI
                    </span>
                  )}
                  <span className={`text-[8px] uppercase tracking-wider ${pri.text}`}>{action.priority}</span>
                  <span className="text-[8px] text-white/30 uppercase">{TYPE_LABELS[action.action_type] || action.action_type}</span>
                </div>
                {action.description && !isCompleted && (
                  <p className="text-[10px] text-white/40 mt-0.5 leading-relaxed">{action.description}</p>
                )}
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="flex items-center gap-0.5 text-[9px] text-white/25">
                    <Clock size={9} /> {action.estimated_minutes || 15}m
                  </span>
                  <span className="text-[9px] text-white/25">{action.impact_score || 0} impact</span>
                  {action.source_module && (
                    <span className="text-[9px] text-white/20">{action.source_module}</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {!isCompleted && !isSkipped && (
                  <>
                    <button
                      onClick={() => onComplete(action.id)}
                      className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors"
                      title="Complete"
                    >
                      <Check size={12} />
                    </button>
                    <button
                      onClick={() => onSkip(action.id)}
                      className="p-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] text-white/30 transition-colors"
                      title="Skip"
                    >
                      <SkipForward size={12} />
                    </button>
                    {action.source_path && (
                      <button
                        onClick={() => onNavigate(action.source_path)}
                        className="p-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] text-white/40 transition-colors"
                        title="Go to module"
                      >
                        <ArrowRight size={12} />
                      </button>
                    )}
                  </>
                )}
                {isCompleted && (
                  <span className="text-[9px] text-emerald-400/60 flex items-center gap-0.5">
                    <Check size={10} /> Done
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
import React from 'react';
import { GitBranch, CheckCircle2, Clock, MessageSquare } from 'lucide-react';

export default function TranslationReviewWorkflow({ workflow }) {
  if (!workflow) return null;
  const { stages, currentStage, currentStageOrder, progress, reviewer, editor, comments, auditHistory } = workflow;

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <GitBranch size={16} className="text-indigo-400" />
        <h3 className="text-sm font-semibold text-white">Translation Review Workflow™</h3>
        <span className="text-[10px] text-white/30 ml-auto">{workflow.language} · {progress}% complete</span>
      </div>

      <div className="flex items-center gap-1 mb-4 overflow-x-auto">
        {stages.map((stage, i) => {
          const isComplete = stage.order < currentStageOrder;
          const isCurrent = stage.id === currentStage;
          const color = isComplete ? '#10b981' : isCurrent ? '#6366f1' : '#6b7280';
          return (
            <React.Fragment key={stage.id}>
              <div className="flex flex-col items-center gap-1 shrink-0 min-w-[80px]">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border-2" style={{ borderColor: color, backgroundColor: isCurrent ? `${color}15` : 'transparent', color }}>
                  {isComplete ? <CheckCircle2 size={14} /> : stage.order}
                </div>
                <span className="text-[9px] text-center" style={{ color: isCurrent || isComplete ? '#fff' : 'rgba(255,255,255,0.3)' }}>{stage.label}</span>
              </div>
              {i < stages.length - 1 && <div className="h-0.5 flex-1 min-w-[20px]" style={{ backgroundColor: isComplete ? '#10b981' : 'rgba(255,255,255,0.1)' }} />}
            </React.Fragment>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-white/[0.02] rounded-lg p-2 border border-white/5">
          <div className="text-[9px] text-white/30">Editor</div>
          <div className="text-xs text-white/60">{editor}</div>
        </div>
        <div className="bg-white/[0.02] rounded-lg p-2 border border-white/5">
          <div className="text-[9px] text-white/30">Reviewer</div>
          <div className="text-xs text-white/60">{reviewer}</div>
        </div>
      </div>

      {comments.length > 0 && (
        <div className="mb-3">
          <div className="text-[10px] uppercase tracking-wider text-white/30 mb-2 flex items-center gap-1"><MessageSquare size={10} /> Comments</div>
          <div className="space-y-1.5">
            {comments.map((c, i) => (
              <div key={i} className="bg-white/[0.02] rounded-lg p-2 border border-white/5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] text-white/60 font-medium">{c.author}</span>
                  <span className="text-[9px] text-white/30">{new Date(c.timestamp).toLocaleDateString()}</span>
                </div>
                <p className="text-[10px] text-white/50">{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="text-[10px] uppercase tracking-wider text-white/30 mb-2 flex items-center gap-1"><Clock size={10} /> Audit History</div>
        <div className="space-y-1">
          {auditHistory.map((h, i) => (
            <div key={i} className="flex items-center gap-2 text-[10px] py-1 border-b border-white/[0.02] last:border-0">
              <CheckCircle2 size={10} className="text-emerald-400 shrink-0" />
              <span className="text-white/50">{h.event}</span>
              <span className="text-white/30 ml-auto">{h.actor} · {new Date(h.timestamp).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
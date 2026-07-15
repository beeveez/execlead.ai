import React, { useState } from 'react';
import { Clock, Upload, Eye, FileSearch, CheckCircle2, TrendingUp, FolderCheck, Award, Lock, ChevronRight } from 'lucide-react';
import { WORKFLOW_STAGES, VERIFICATION_CATEGORIES, getCurrentStage, parseWorkflowStages } from '@/lib/verificationWorkflowEngine';

const ICON_MAP = { Clock, Upload, Eye, FileSearch, CheckCircle2, TrendingUp, FolderCheck, Award, Lock };

export default function VerificationWorkflowTracker({ verification }) {
  const [selectedCategory, setSelectedCategory] = useState(VERIFICATION_CATEGORIES[0]?.key);

  const stages = parseWorkflowStages(verification);
  const cat = VERIFICATION_CATEGORIES.find(c => c.key === selectedCategory);
  const catStage = stages[selectedCategory] || { stage: 'requested' };
  const currentOrder = WORKFLOW_STAGES.find(s => s.id === catStage.stage)?.order || 1;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Clock size={14} className="text-blue-400" />
        <span className="text-sm font-bold text-white">Verification Workflow™</span>
        <span className="text-[10px] text-white/30 ml-auto">9-stage lifecycle</span>
      </div>

      {/* Category selector */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {VERIFICATION_CATEGORIES.map(c => (
          <button
            key={c.key}
            onClick={() => setSelectedCategory(c.key)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
              selectedCategory === c.key
                ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20'
                : 'bg-white/[0.02] text-white/40 border border-white/5 hover:text-white/60'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Workflow stages */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs text-white/60 font-medium">{cat?.label}</span>
          <span className="text-[10px] text-white/30">Stage {currentOrder} of {WORKFLOW_STAGES.length}</span>
        </div>

        <div className="space-y-0">
          {WORKFLOW_STAGES.map((stage, idx) => {
            const StageIcon = ICON_MAP[stage.icon] || Clock;
            const isComplete = stage.order <= currentOrder;
            const isCurrent = stage.order === currentOrder;
            const isFuture = stage.order > currentOrder;
            const enteredDate = catStage.entered_date;

            return (
              <div key={stage.id} className="flex gap-3">
                {/* Vertical connector + icon */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                      isCurrent ? 'ring-2 ring-offset-2 ring-offset-[#0a0a0f]' : ''
                    }`}
                    style={{
                      backgroundColor: isComplete ? stage.color + '20' : 'rgba(255,255,255,0.03)',
                      boxShadow: isCurrent ? `0 0 0 2px ${stage.color}40` : 'none',
                    }}
                  >
                    <StageIcon size={14} style={{ color: isComplete ? stage.color : '#64748b' }} />
                  </div>
                  {idx < WORKFLOW_STAGES.length - 1 && (
                    <div className="w-px h-6" style={{ backgroundColor: isComplete ? stage.color + '30' : 'rgba(255,255,255,0.05)' }} />
                  )}
                </div>

                {/* Stage info */}
                <div className="flex-1 pb-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium ${isComplete ? 'text-white' : 'text-white/40'}`}>{stage.label}</span>
                    {isCurrent && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded font-medium" style={{ backgroundColor: stage.color + '20', color: stage.color }}>
                        Current
                      </span>
                    )}
                    {isComplete && !isCurrent && (
                      <CheckCircle2 size={11} className="text-emerald-400" />
                    )}
                  </div>
                  {isComplete && enteredDate && idx === currentOrder - 1 && (
                    <div className="text-[10px] text-white/30 mt-0.5">Entered: {new Date(enteredDate).toLocaleString()}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="mt-4 pt-3 border-t border-white/5">
          <div className="flex items-center justify-between text-[10px] text-white/30 mb-1.5">
            <span>Workflow Progress</span>
            <span>{Math.round((currentOrder / WORKFLOW_STAGES.length) * 100)}%</span>
          </div>
          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(currentOrder / WORKFLOW_STAGES.length) * 100}%`,
                background: `linear-gradient(90deg, #3b82f6, #10b981, #a855f7)`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
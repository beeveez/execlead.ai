import React from 'react';
import { FileText, ShieldCheck, TrendingUp, Award, FolderCheck, ArrowUpCircle, Target, Lock, CheckCircle2, Circle } from 'lucide-react';
import { buildEvidenceChain } from '@/lib/evidenceIntelligenceEngine';

const ICON_MAP = { FileText, ShieldCheck, TrendingUp, Award, FolderCheck, ArrowUpCircle, Target };

export default function EvidenceChain({ evidence }) {
  if (!evidence) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Target size={14} className="text-indigo-400" />
          <span className="text-sm font-bold text-white">Executive Evidence Chain™</span>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-8 text-center">
          <Target size={28} className="text-white/10 mx-auto mb-2" />
          <p className="text-xs text-white/30">Select an evidence item to view its provenance chain.</p>
        </div>
      </div>
    );
  }

  const chain = buildEvidenceChain(evidence);

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Target size={14} className="text-indigo-400" />
        <span className="text-sm font-bold text-white">Executive Evidence Chain™</span>
        <span className="text-[10px] text-white/30 ml-auto">{evidence.title}</span>
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
        <div className="flex items-center gap-1 overflow-x-auto pb-2">
          {chain.map((stage, idx) => {
            const StageIcon = ICON_MAP[stage.icon] || Circle;
            const isActive = stage.status === 'active';
            const isComplete = stage.status === 'complete';
            const isLocked = stage.status === 'locked';
            const color = isComplete ? '#10b981' : isActive ? '#f59e0b' : '#64748b';

            return (
              <React.Fragment key={stage.key}>
                <div className="flex flex-col items-center min-w-[80px]">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all" style={{ borderColor: color, backgroundColor: color + '15' }}>
                      {isComplete ? <CheckCircle2 size={16} style={{ color }} /> : isLocked ? <Lock size={12} className="text-white/20" /> : <StageIcon size={14} style={{ color }} />}
                    </div>
                  </div>
                  <span className="text-[9px] text-white/50 mt-1.5 text-center font-medium leading-tight">{stage.label}</span>
                  <span className="text-[8px] mt-0.5" style={{ color }}>{stage.score}%</span>
                </div>
                {idx < chain.length - 1 && (
                  <div className="flex-1 h-0.5 min-w-[12px] rounded-full" style={{ backgroundColor: isComplete ? color + '40' : 'rgba(255,255,255,0.05)' }} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Stage descriptions */}
        <div className="mt-3 pt-3 border-t border-white/5">
          <div className="text-[10px] uppercase tracking-wider text-white/30 mb-2">Provenance Stages</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {chain.map(stage => {
              const color = stage.status === 'complete' ? '#10b981' : stage.status === 'active' ? '#f59e0b' : '#64748b';
              return (
                <div key={stage.key} className="flex items-start gap-2 text-[11px]">
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: color }} />
                  <div>
                    <span className="text-white/60 font-medium">{stage.label}</span>
                    <span className="text-white/30 ml-1">— {stage.description}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
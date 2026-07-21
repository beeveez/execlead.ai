import React from 'react';
import { Award, CheckCircle2, XCircle, Lock } from 'lucide-react';

export default function AICertificationPanel({ certification }) {
  const { certified, gates, passedCount, totalCount, score, inventoryCertification, blockers } = certification;

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Award size={16} className={certified ? 'text-emerald-400' : 'text-red-400'} />
          <h3 className="text-sm font-semibold text-white">Responsible AI Certification™</h3>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${certified ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
          {certified ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
          {certified ? 'CERTIFIED' : 'BLOCKED'}
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-white/40">{passedCount}/{totalCount} certification gates passed</span>
          <span className="text-white font-bold">{score}%</span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all ${certified ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${score}%` }} />
        </div>
      </div>

      <div className="space-y-1.5 mb-4">
        {gates.map((gate) => (
          <div key={gate.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
            {gate.passed ? <CheckCircle2 size={14} className="text-emerald-400 shrink-0" /> : <Lock size={14} className="text-red-400 shrink-0" />}
            <span className={`text-xs flex-1 ${gate.passed ? 'text-white/70' : 'text-red-300'}`}>{gate.label}</span>
            <span className={`text-[10px] font-medium ${gate.passed ? 'text-emerald-400/60' : 'text-red-400/60'}`}>{gate.pillarScore}%</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/15 text-center">
          <div className="text-lg font-bold text-emerald-400">{inventoryCertification.certified}</div>
          <div className="text-[10px] text-white/40">Certified</div>
        </div>
        <div className="p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/15 text-center">
          <div className="text-lg font-bold text-amber-400">{inventoryCertification.pending}</div>
          <div className="text-[10px] text-white/40">Pending</div>
        </div>
        <div className="p-2.5 rounded-lg bg-red-500/5 border border-red-500/15 text-center">
          <div className="text-lg font-bold text-red-400">{inventoryCertification.failed}</div>
          <div className="text-[10px] text-white/40">Failed</div>
        </div>
      </div>
    </div>
  );
}
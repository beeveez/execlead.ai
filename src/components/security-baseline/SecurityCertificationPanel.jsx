import React from 'react';
import { Award, CheckCircle2, XCircle, Lock } from 'lucide-react';

export default function SecurityCertificationPanel({ certification }) {
  const { certified, gates, passedCount, totalCount, score, blockers } = certification;

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Award size={16} className={certified ? 'text-emerald-400' : 'text-red-400'} />
          <h3 className="text-sm font-semibold text-white">Security Certification™</h3>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${certified ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
          {certified ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
          {certified ? 'CERTIFIED' : 'BLOCKED'}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-white/40">{passedCount}/{totalCount} certification gates passed</span>
          <span className="text-white font-bold">{score}%</span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all ${certified ? 'bg-emerald-500' : 'bg-amber-500'}`}
            style={{ width: `${score}%` }} />
        </div>
      </div>

      {/* Gates */}
      <div className="space-y-1.5">
        {gates.map((gate) => (
          <div key={gate.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
            {gate.passed ? (
              <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
            ) : (
              <Lock size={14} className="text-red-400 shrink-0" />
            )}
            <span className={`text-xs flex-1 ${gate.passed ? 'text-white/70' : 'text-red-300'}`}>{gate.label}</span>
            <span className={`text-[10px] font-medium ${gate.passed ? 'text-emerald-400/60' : 'text-red-400/60'}`}>
              {gate.domainScore}%
            </span>
          </div>
        ))}
      </div>

      {/* Blockers */}
      {blockers.length > 0 && (
        <div className="mt-4 p-3 rounded-lg bg-red-500/5 border border-red-500/15">
          <p className="text-xs font-semibold text-red-400 mb-2">Production Blockers ({blockers.length})</p>
          <div className="space-y-1.5">
            {blockers.map((blocker, i) => (
              <div key={i} className="text-[11px] text-red-300/80">
                <span className="font-medium">✗ {blocker.gate}</span>
                <p className="text-red-300/50 mt-0.5">{blocker.remediation}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
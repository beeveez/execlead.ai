import React from 'react';
import { CheckCircle2, XCircle, Rocket, ShieldCheck } from 'lucide-react';

export default function LocalizationReadinessSection({ readiness }) {
  const statusColor = readiness.allPassed ? '#10b981' : readiness.criticalPassed ? '#f59e0b' : '#ef4444';
  const statusBg = readiness.allPassed ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-amber-500/10 border-amber-500/20';

  return (
    <div className={`rounded-xl p-5 border ${statusBg}`}>
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          {readiness.allPassed ? <Rocket size={24} className="text-emerald-400" /> : <ShieldCheck size={24} className="text-amber-400" />}
          <div>
            <h3 className="text-sm font-semibold text-white">Localization Readiness™</h3>
            <p className="text-xs mt-0.5" style={{ color: statusColor }}>{readiness.status} · Score {readiness.score}%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mt-4">
        {readiness.checks.map((check) => (
          <div key={check.id} className="flex items-center gap-2 bg-white/[0.02] rounded-lg p-2.5 border border-white/5">
            {check.passed ? <CheckCircle2 size={14} className="text-emerald-400 shrink-0" /> : <XCircle size={14} className="text-rose-400 shrink-0" />}
            <div className="min-w-0 flex-1">
              <div className="text-[10px] text-white/40 truncate">{check.label}</div>
              <div className={`text-xs font-medium ${check.passed ? 'text-emerald-400' : 'text-rose-400'}`}>{check.value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
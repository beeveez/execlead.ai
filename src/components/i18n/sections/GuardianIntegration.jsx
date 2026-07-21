import React from 'react';
import { ShieldCheck, AlertTriangle, ChevronRight } from 'lucide-react';

export default function GuardianIntegration({ guardian, onIssueClick }) {
  const scoreColor = guardian.overallScore >= 80 ? '#10b981' : guardian.overallScore >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <ShieldCheck size={16} className="text-emerald-400" />
        <h3 className="text-sm font-semibold text-white">Guardian™ Integration</h3>
        <span className="text-[10px] text-white/30 ml-auto">Localization Readiness: {guardian.localizationReadiness}</span>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold" style={{ color: scoreColor }}>{guardian.overallScore}</div>
          <div className="text-[10px] text-white/40">Overall Score</div>
        </div>
        <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-2">
          <div className="bg-white/[0.02] rounded-lg p-2 text-center border border-white/5">
            <div className="text-sm font-bold text-rose-400">{guardian.blockingModules.length}</div>
            <div className="text-[9px] text-white/30">Blocking Modules</div>
          </div>
          <div className="bg-white/[0.02] rounded-lg p-2 text-center border border-white/5">
            <div className="text-sm font-bold text-amber-400">{guardian.criticalMissingStrings}</div>
            <div className="text-[9px] text-white/30">Critical Missing</div>
          </div>
          <div className="bg-white/[0.02] rounded-lg p-2 text-center border border-white/5">
            <div className="text-sm font-bold text-amber-400">{guardian.hardcodedViolations}</div>
            <div className="text-[9px] text-white/30">Hardcoded</div>
          </div>
          <div className="bg-white/[0.02] rounded-lg p-2 text-center border border-white/5">
            <div className="text-sm font-bold text-rose-400">{guardian.fallbackFailures}</div>
            <div className="text-[9px] text-white/30">Fallback Failures</div>
          </div>
          <div className="bg-white/[0.02] rounded-lg p-2 text-center border border-white/5">
            <div className="text-sm font-bold text-rose-400">{guardian.runtimeErrors}</div>
            <div className="text-[9px] text-white/30">Runtime Errors</div>
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        {guardian.issues.length === 0 ? (
          <div className="flex items-center gap-2 text-xs text-emerald-400 py-2">
            <ShieldCheck size={14} /> No localization issues detected. All systems operational.
          </div>
        ) : (
          guardian.issues.map((issue) => (
            <button key={issue.id} onClick={() => onIssueClick?.(issue.id)} className="w-full flex items-center gap-2 bg-white/[0.02] hover:bg-white/[0.04] rounded-lg p-3 border border-white/5 transition-colors text-left group">
              <AlertTriangle size={14} className={issue.severity === 'high' ? 'text-rose-400' : 'text-amber-400'} />
              <div className="flex-1 min-w-0">
                <div className="text-xs text-white font-medium">{issue.label}</div>
                <div className="text-[10px] text-white/30 truncate">{issue.detail}</div>
              </div>
              <ChevronRight size={12} className="text-white/20 group-hover:text-white/40 transition-colors shrink-0" />
            </button>
          ))
        )}
      </div>
    </div>
  );
}
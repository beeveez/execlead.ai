import React from 'react';
import { ShieldCheck, CheckCircle2, XCircle } from 'lucide-react';

export default function ResponseValidationSection({ validation }) {
  const overallColor = validation.overallStatus === 'pass' ? '#10b981' : '#ef4444';

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <ShieldCheck size={16} style={{ color: overallColor }} />
        <h3 className="text-sm font-semibold text-white">AI Response Validation™</h3>
        <span className="text-[10px] px-2 py-0.5 rounded-full ml-auto" style={{ backgroundColor: `${overallColor}15`, color: overallColor }}>
          {validation.passed}/{validation.totalChecks} Passed
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {validation.checks.map((check) => {
          const passed = check.status === 'pass';
          const color = passed ? '#10b981' : '#ef4444';
          return (
            <div key={check.id} className="flex items-center gap-3 bg-white/[0.02] rounded-lg p-3 border border-white/5">
              {passed ? <CheckCircle2 size={16} className="text-emerald-400 shrink-0" /> : <XCircle size={16} className="text-rose-400 shrink-0" />}
              <div className="flex-1 min-w-0">
                <div className="text-xs text-white font-medium">{check.label}</div>
                <div className="text-[10px] text-white/30">{check.description}</div>
              </div>
              <span className="text-[10px] font-medium" style={{ color }}>{check.failures === 0 ? 'PASS' : `${check.failures} fail`}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
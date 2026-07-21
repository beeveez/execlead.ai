import React from 'react';
import { Lock, ShieldCheck } from 'lucide-react';

export default function EnterpriseTerminologySection({ terminology }) {
  const { terms, summary } = terminology;

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Lock size={16} className="text-amber-400" />
        <h3 className="text-sm font-semibold text-white">Enterprise Terminology Protection™</h3>
        <span className="text-[10px] text-white/30 ml-auto">{summary.totalTerms} protected terms · {summary.violations} violations</span>
      </div>

      <div className="flex items-center gap-2 mb-4 p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
        <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
        <p className="text-xs text-emerald-300">Enforcement active — branded platform terminology is never translated. Only surrounding UI text, descriptions, and explanatory content may be localized.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {terms.map((t) => (
          <div key={t.term} className="flex items-center gap-2 bg-white/[0.02] rounded-lg p-2.5 border border-white/5">
            <Lock size={12} className="text-amber-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-xs text-white font-medium truncate">{t.term}</div>
              <div className="text-[9px] text-white/30">{t.category}</div>
            </div>
            {t.locked && <span className="text-[8px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400">LOCKED</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
import React from 'react';
import { Check, AlertTriangle, Gauge } from 'lucide-react';

export default function GapAnalysisPanel({ gap }) {
  return (
    <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white">Leadership Gap Analysis™</h3>
        <span className="flex items-center gap-1 text-[10px] text-white/50"><Gauge size={12} /> Confidence: <span className="text-accent-orange font-medium">{gap.confidence}</span></span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-emerald-400 mb-2">Top Strengths</div>
          <div className="space-y-1.5">
            {gap.strengths.map((s) => (
              <div key={s.label} className="flex items-center gap-2 bg-emerald-500/8 border border-emerald-500/15 rounded-lg px-3 py-2">
                <Check size={13} className="text-emerald-400 shrink-0" />
                <span className="text-xs text-white/80 flex-1">{s.label}</span>
                <span className="text-xs font-bold text-emerald-400">{s.score}</span>
              </div>
            ))}
            {!gap.strengths.length && <div className="text-[11px] text-white/30">—</div>}
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-amber-400 mb-2">Growth Opportunities</div>
          <div className="space-y-1.5">
            {gap.opportunities.map((s) => (
              <div key={s.label} className="flex items-center gap-2 bg-amber-500/8 border border-amber-500/15 rounded-lg px-3 py-2">
                <AlertTriangle size={13} className="text-amber-400 shrink-0" />
                <span className="text-xs text-white/80 flex-1">{s.label}</span>
                <span className="text-xs font-bold text-amber-400">{s.score}</span>
              </div>
            ))}
            {!gap.opportunities.length && <div className="text-[11px] text-white/30">All categories at target.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
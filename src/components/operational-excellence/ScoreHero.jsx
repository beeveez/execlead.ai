import React from 'react';
import { Gauge, RefreshCw } from 'lucide-react';

export default function ScoreHero({ score, onRefresh, refreshing }) {
  const tone = score >= 90 ? 'text-emerald-400' : score >= 75 ? 'text-amber-400' : 'text-rose-400';
  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-500/10 to-transparent p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-5">
        <div><div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/40"><Gauge size={16} className="text-indigo-400" />Operational Excellence Score™</div><div className={`text-5xl font-bold ${tone}`}>{score}<span className="text-lg text-white/25">/100</span></div><p className="mt-2 text-sm text-white/45">Lean Six Sigma health from live quality, journey, AI, and readiness signals.</p></div>
        <button onClick={onRefresh} disabled={refreshing} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-medium text-white/70 hover:bg-white/10 disabled:opacity-50"><RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />Refresh controls</button>
      </div>
    </div>
  );
}
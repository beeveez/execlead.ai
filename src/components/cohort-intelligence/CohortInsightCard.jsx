import React from 'react';
import { TrendingUp, MessageSquare, Gauge } from 'lucide-react';

export default function CohortInsightCard({ cohort }) {
  return (
    <article className="rounded-2xl border border-white/8 bg-white/[0.02] p-5">
      <div className="flex items-start justify-between gap-3 mb-4"><div><h3 className="text-sm font-semibold text-white">{cohort.label}</h3><p className="text-[10px] text-white/40 mt-1">{cohort.participantCount} participants · {cohort.completedActions} aggregate actions</p></div><Gauge size={16} className="text-indigo-400" /></div>
      <div className="space-y-2">
        {cohort.strongestBehaviors.map((item) => <div key={item.key} className="rounded-lg border border-white/8 bg-white/[0.02] p-3"><div className="flex justify-between gap-2 text-xs"><span className="text-white/70">{item.label}</span><span className="text-emerald-400 font-semibold">+{item.averageReadinessChange}</span></div><div className="flex gap-3 mt-1 text-[9px] text-white/40"><span><TrendingUp size={9} className="inline" /> {item.readinessImprovementRate}% improved</span><span><MessageSquare size={9} className="inline" /> {item.communicationGrowthSignal}/100 communication</span></div></div>)}
      </div>
      {cohort.fastestCompetencies.length > 0 && <div className="mt-4 pt-3 border-t border-white/8"><div className="text-[10px] uppercase tracking-wider text-white/35 mb-2">Fastest-improving competencies</div><div className="flex flex-wrap gap-1.5">{cohort.fastestCompetencies.map((item) => <span key={item.competency} className="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-2 py-1 text-[9px] text-indigo-300">{item.competency} · {item.growthSignal}</span>)}</div></div>}
    </article>
  );
}
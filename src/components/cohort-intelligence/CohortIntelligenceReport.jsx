import React, { useEffect, useState } from 'react';
import { Loader2, ShieldCheck, Users } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import CohortInsightCard from '@/components/cohort-intelligence/CohortInsightCard';

const FALLBACK = 'Insufficient cohort data for a privacy-safe benchmark';

export default function CohortIntelligenceReport({ mode }) {
  const [data, setData] = useState(null);
  useEffect(() => { base44.functions.invoke('getCohortLeadershipIntelligence', { mode }).then((res) => setData(res.data)).catch(() => setData({ available: false, message: FALLBACK })); }, [mode]);
  if (!data) return <div className="flex justify-center py-16"><Loader2 className="animate-spin text-indigo-400" /></div>;
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-5"><div className="flex items-center gap-2"><Users size={16} className="text-indigo-400" /><h2 className="text-base font-semibold text-white">Cohort Leadership Intelligence™</h2></div><p className="text-xs text-white/45 mt-2">Aggregate behavioral signals across technical leadership cohorts. No individual or employer-specific data is exposed.</p><div className="flex items-center gap-1 text-[10px] text-emerald-400 mt-3"><ShieldCheck size={11} /> Privacy threshold enforced at {data.minimumCohortSize || 10} active participants</div></div>
      {!data.available ? <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-8 text-center text-sm text-white/45">{data.message || FALLBACK}</div> : <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">{data.cohorts.map((cohort) => <CohortInsightCard key={cohort.key} cohort={cohort} />)}</div>}
    </div>
  );
}
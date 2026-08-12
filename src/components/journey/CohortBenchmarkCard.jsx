import React, { useEffect, useState } from 'react';
import { Users, Loader2, ShieldCheck } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const FALLBACK = 'Insufficient cohort data for a privacy-safe benchmark';

export default function CohortBenchmarkCard() {
  const [data, setData] = useState(null);
  useEffect(() => { base44.functions.invoke('getCohortLeadershipIntelligence', { mode: 'journey' }).then((res) => setData(res.data)).catch(() => setData({ available: false, message: FALLBACK })); }, []);
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-5">
      <div className="flex items-center gap-2 mb-3"><Users size={15} className="text-indigo-400" /><h3 className="text-sm font-semibold text-white">Cohort Leadership Benchmark</h3></div>
      {!data ? <Loader2 size={16} className="animate-spin text-white/40" /> : data.available ? (
        <div><div className="text-3xl font-bold text-white">{data.percentile}<span className="text-sm text-white/40">th percentile</span></div><p className="text-xs text-white/55 mt-1">Readiness improvement within {data.cohort}</p><div className="flex items-center gap-1 text-[10px] text-emerald-400 mt-3"><ShieldCheck size={11} /> Anonymized benchmark · minimum cohort {data.minimumCohortSize}</div></div>
      ) : <p className="text-xs text-white/45">{data.message || FALLBACK}</p>}
    </div>
  );
}
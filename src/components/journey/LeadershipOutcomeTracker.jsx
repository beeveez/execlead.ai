import React, { useEffect, useState } from 'react';
import { Target, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import OutcomeCaptureForm from '@/components/journey/OutcomeCaptureForm';
import OutcomeHistory from '@/components/journey/OutcomeHistory';

export default function LeadershipOutcomeTracker() {
  const [user, setUser] = useState(null);
  const [outcomes, setOutcomes] = useState(null);
  const load = async () => { const me = await base44.auth.me(); setUser(me); setOutcomes(await base44.entities.ExecutiveOutcome.filter({ user_id: me.id }, '-outcome_date', 20)); };
  useEffect(() => { load(); }, []);
  return <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-5"><div className="flex items-center gap-2 mb-2"><Target size={15} className="text-indigo-400" /><h3 className="text-sm font-semibold text-white">Real-World Leadership Outcomes</h3></div><p className="text-xs text-white/45 mb-4">Record advancement signals that help validate whether platform insights correspond to meaningful leadership growth.</p>{!user || !outcomes ? <Loader2 size={16} className="animate-spin text-white/40" /> : <div className="grid grid-cols-1 lg:grid-cols-2 gap-5"><OutcomeCaptureForm user={user} onSaved={load} /><OutcomeHistory outcomes={outcomes} /></div>}</div>;
}
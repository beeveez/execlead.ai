import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function OutcomeHistory({ outcomes }) {
  if (!outcomes.length) return <p className="text-xs text-white/40">No real-world leadership outcomes recorded yet.</p>;
  return <div className="space-y-2">{outcomes.slice(0, 5).map((outcome) => <div key={outcome.id} className="flex items-start gap-2 rounded-lg border border-white/8 bg-white/[0.02] p-3"><CheckCircle2 size={13} className="mt-0.5 text-emerald-400" /><div><div className="text-xs text-white/75">{outcome.outcome_title}</div><div className="text-[10px] text-white/35">{outcome.outcome_date} · {outcome.verification_source === 'self_reported' ? 'Self-reported' : 'Verified'}</div></div></div>)}</div>;
}
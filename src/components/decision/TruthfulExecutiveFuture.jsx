import React from 'react';
import { Clock, ShieldCheck, Compass } from 'lucide-react';

const GUIDANCE = [
  { icon: ShieldCheck, title: 'Evidence', text: 'Build verified evidence through real responsibilities, assessed practice, and documented outcomes.' },
  { icon: Compass, title: 'Development', text: 'Use readiness and Journey metrics to guide platform development, not to predict a future title.' },
  { icon: Clock, title: 'Timing', text: 'Your timeline cannot be reliably predicted from the current evidence.' },
];

export default function TruthfulExecutiveFuture() {
  return <div className="space-y-5">
    <div className="rounded-xl border border-amber-500/15 bg-amber-500/[0.03] p-4">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-300">Development Pathway — Not a Career Prediction</p>
      <p className="mt-2 text-sm text-white/70">EXECLEAD.AI can help you develop and demonstrate leadership capabilities earlier through structured practice and evidence. Actual career progression depends on experience, opportunities, performance, and market conditions.</p>
    </div>
    <div className="grid gap-3 md:grid-cols-3">{GUIDANCE.map(({ icon: Icon, title, text }) => <div key={title} className="rounded-xl border border-white/5 bg-white/[0.02] p-4"><Icon size={16} className="text-indigo-300"/><h3 className="mt-3 text-sm font-bold text-white">{title}</h3><p className="mt-1 text-xs leading-relaxed text-white/50">{text}</p></div>)}</div>
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-xs leading-relaxed text-white/50"><strong className="text-white/70">Unknown:</strong> Promotion probability, salary outcome, future role, and career timing are not currently estimable from available evidence.</div>
  </div>;
}
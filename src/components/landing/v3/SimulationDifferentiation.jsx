import React from 'react';
import { Check, X } from 'lucide-react';

const generic = ['Conversation', 'Advice', 'One-off interaction', 'Limited continuity'];
const execlead = ['Assessment', 'Coaching', 'Simulation', 'Evidence', 'Executive Identity', 'Longitudinal development'];

export default function SimulationDifferentiation() {
  return <section className="border-t border-white/5 px-6 py-20 lg:px-8">
    <div className="mx-auto max-w-5xl">
      <div className="mb-10 text-center"><p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-accent-orange">The Difference</p><h2 className="text-3xl font-bold md:text-4xl">More than AI coaching.</h2></div>
      <div className="grid overflow-hidden rounded-2xl border border-white/10 md:grid-cols-2">
        <div className="bg-white/[0.02] p-7"><h3 className="mb-5 text-sm font-semibold uppercase tracking-wider text-white/45">Generic AI Coaching</h3><ul className="space-y-3">{generic.map(item => <li key={item} className="flex items-center gap-2 text-sm text-white/50"><X size={14} className="text-white/25" />{item}</li>)}</ul></div>
        <div className="border-t border-white/10 bg-indigo-500/[0.05] p-7 md:border-l md:border-t-0"><h3 className="mb-5 text-sm font-semibold uppercase tracking-wider text-indigo-300">EXECLEAD.AI</h3><ul className="grid gap-3 sm:grid-cols-2">{execlead.map(item => <li key={item} className="flex items-center gap-2 text-sm text-white/75"><Check size={14} className="text-emerald-400" />{item}</li>)}</ul></div>
      </div>
      <p className="mx-auto mt-8 max-w-3xl text-center text-sm font-semibold uppercase leading-6 tracking-wide text-white/80">Most AI coaching tools provide conversations. EXECLEAD.AI builds a continuously evolving executive capability profile.</p>
      <p className="mt-4 text-center text-sm font-bold text-accent-orange">Evidence — not impressions — is the moat.</p>
    </div>
  </section>;
}
import React from 'react';
import { Check } from 'lucide-react';

const capabilities = ['Assessment', 'Coaching', 'Simulation', 'Evidence capture', 'Executive Identity', 'Longitudinal development'];

export default function SimulationDifferentiation() {
  return <section className="border-t border-white/5 px-6 py-20 lg:px-8">
    <div className="mx-auto max-w-5xl">
      <div className="mb-10 text-center"><p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-accent-orange">Integrated Development</p><h2 className="text-3xl font-bold md:text-4xl">More than a coaching conversation.</h2></div>
      <div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-indigo-500/[0.05] p-7">
        <h3 className="mb-5 text-sm font-semibold uppercase tracking-wider text-indigo-300">EXECLEAD.AI capabilities</h3>
        <ul className="grid gap-3 sm:grid-cols-2">{capabilities.map(item => <li key={item} className="flex items-center gap-2 text-sm text-white/75"><Check size={14} className="text-emerald-400" />{item}</li>)}</ul>
      </div>
      <p className="mx-auto mt-8 max-w-3xl text-center text-sm leading-6 text-white/60">EXECLEAD.AI connects assessment, coaching, simulation feedback, capability signals, and executive identity in one development experience.</p>
    </div>
  </section>;
}
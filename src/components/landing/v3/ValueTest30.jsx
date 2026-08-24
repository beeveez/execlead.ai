import React from 'react';
import { ArrowDown } from 'lucide-react';

const journey = ['Assess', 'Coach', 'Simulate', 'Demonstrate', 'Build Evidence', 'Develop Executive Identity'];

export default function ValueTest30() {
  return <section className="border-t border-white/5 px-6 py-16 lg:px-8" aria-labelledby="what-is-execlead">
    <div className="mx-auto max-w-5xl text-center">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-accent-orange">What is EXECLEAD.AI?</p>
      <h2 id="what-is-execlead" className="text-3xl font-bold md:text-4xl">One platform for the executive leadership journey.</h2>
      <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-white/55">EXECLEAD.AI helps ambitious professionals across functions and industries assess their Executive Readiness™, practice leadership decisions, receive AI-powered coaching, build evidence of demonstrated capability, and develop an evolving executive identity.</p>
      <div className="mx-auto mt-10 flex max-w-xl flex-col items-center">{journey.map((step,index)=><React.Fragment key={step}><div className="w-full rounded-lg border border-white/10 bg-white/[0.025] px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white/75">{step}</div>{index<journey.length-1&&<ArrowDown size={15} className="my-1 text-accent-orange/60"/>}</React.Fragment>)}</div>
    </div>
  </section>;
}
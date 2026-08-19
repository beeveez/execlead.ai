import React from 'react';
import { ArrowDown, ShieldCheck } from 'lucide-react';

const flow = ['Assessment','Coaching','Simulation','Demonstrated Behavior','Evidence','Executive Readiness','Executive Identity'];
const signals = [['Strategic Thinking','Demonstrated'],['Decision Quality','Developing'],['Executive Communication','Strong'],['Leadership Presence','Improving']];

export default function EvidenceEngine() {
  return <section className="border-t border-white/5 px-6 py-20 lg:px-8" aria-labelledby="evidence-title">
    <div className="mx-auto max-w-6xl"><div className="mb-10 text-center"><p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-accent-orange">The Evidence Engine</p><h2 id="evidence-title" className="text-3xl font-bold md:text-4xl">Leadership should be measured by evidence.</h2><p className="mx-auto mt-3 max-w-2xl text-sm text-white/50">EXECLEAD.AI transforms leadership activity into a growing evidence profile.</p></div>
      <div className="grid gap-8 lg:grid-cols-[1fr_1.15fr] lg:items-center"><div className="flex flex-col items-center">{flow.map((step,index)=><React.Fragment key={step}><div className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-center text-xs font-medium text-white/75">{step}</div>{index<flow.length-1&&<ArrowDown size={15} className="my-1 text-white/25"/>}</React.Fragment>)}</div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6"><div className="mb-5 flex items-center justify-between"><div><p className="text-[10px] uppercase tracking-wider text-white/40">Sample Executive Evidence View</p><h3 className="mt-1 text-lg font-semibold">Capability evidence profile</h3></div><ShieldCheck className="text-emerald-400"/></div><div className="space-y-3">{signals.map(([label,status],index)=><div key={label} className="flex items-center justify-between rounded-xl border border-white/8 bg-black/20 p-4"><span className="text-sm text-white/70">{label}</span><span className={index===1?'text-xs font-medium text-amber-300':'text-xs font-medium text-emerald-400'}>{status}</span></div>)}</div><p className="mt-4 text-[11px] leading-relaxed text-white/35">Demo content only. These are not actual user results.</p></div>
      </div>
    </div>
  </section>;
}
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Fingerprint } from 'lucide-react';

const signals = [['Strategic Thinking','Demonstrated'],['Decision Quality','Developing'],['Executive Communication','Strong'],['Leadership Presence','Improving']];

export default function IdentityPreviewCard() {
  return <article className="group rounded-2xl border border-white/10 bg-white/[0.025] p-5 md:p-6">
    <div className="mb-4 flex items-center justify-between text-[10px] uppercase tracking-wider text-white/40"><span>Sample Executive Identity View</span><Fingerprint size={14} className="text-cyan-400"/></div>
    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
      <div className="flex items-start justify-between"><div><p className="text-[10px] text-white/35">Executive positioning</p><h3 className="mt-1 text-base font-semibold text-white">Strategic Technology Leader</h3><p className="mt-1 text-[11px] text-white/50">Evidence-backed growth trajectory</p></div><div className="rounded-full border border-cyan-400/30 bg-cyan-400/10 p-3"><Fingerprint size={20} className="text-cyan-400"/></div></div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">{signals.map(([label,status])=><div key={label} className="rounded-lg border border-white/8 bg-white/[0.03] p-3"><p className="text-[10px] text-white/40">{label}</p><p className="mt-1 text-xs font-medium text-white/80">{status}</p></div>)}</div>
      <div className="mt-4 border-t border-white/10 pt-3"><p className="text-[10px] uppercase tracking-wider text-white/35">Leadership evidence</p><p className="mt-1 text-[11px] text-white/55">Assessment, coaching, and simulation signals contribute to this sample identity view and its readiness-for-next-level trajectory.</p></div>
    </div>
    <Link to="/executive-portfolio" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-accent-orange">Explore Executive Identity <ArrowRight size={14}/></Link>
  </article>;
}
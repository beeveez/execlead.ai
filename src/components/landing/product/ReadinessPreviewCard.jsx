import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp } from 'lucide-react';

const competencies = [['Strategic Judgment', 78], ['Executive Communication', 72], ['Decision Quality', 68], ['Stakeholder Influence', 64]];

export default function ReadinessPreviewCard() {
  return <article className="group rounded-2xl border border-white/10 bg-white/[0.025] p-5 md:p-6">
    <div className="mb-4 flex items-center justify-between text-[10px] uppercase tracking-wider text-white/40"><span>Sample View · Executive Readiness Report™</span><span className="text-emerald-400">Demo Experience</span></div>
    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
      <div className="flex items-center gap-4"><div className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-full border-4 border-amber-400/70"><strong className="text-2xl text-white">70</strong><span className="text-[9px] text-white/40">READINESS</span></div><div><p className="text-xs text-white/40">Readiness trajectory</p><p className="mt-1 flex items-center gap-1 text-sm font-semibold text-emerald-400"><TrendingUp size={14}/>Improving</p><p className="mt-2 text-[11px] text-white/50">Strength: strategic judgment<br/>Gap: executive presence</p></div></div>
      <div className="mt-4 space-y-2">{competencies.map(([label,value])=><div key={label}><div className="mb-1 flex justify-between text-[10px] text-white/50"><span>{label}</span><span>{value}</span></div><div className="h-1.5 rounded-full bg-white/10"><div className="h-full rounded-full bg-amber-400" style={{width:`${value}%`}}/></div></div>)}</div>
      <p className="mt-4 border-t border-white/10 pt-3 text-[11px] leading-relaxed text-white/55">AI observation: Your strongest evidence appears when balancing risk with long-term value.</p>
    </div>
    <Link to="/executive-readiness" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-accent-orange">View Readiness Experience <ArrowRight size={14}/></Link>
  </article>;
}
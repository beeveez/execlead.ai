import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Brain } from 'lucide-react';

export default function CoachPreviewCard() {
  return <article className="group rounded-2xl border border-white/10 bg-white/[0.025] p-5 md:p-6">
    <div className="mb-4 flex items-center justify-between text-[10px] uppercase tracking-wider text-white/40"><span>Demo Experience · EXEC™ Coach</span><Brain size={14} className="text-indigo-400"/></div>
    <div className="space-y-3 rounded-xl border border-white/10 bg-black/20 p-4">
      <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3"><p className="text-[9px] uppercase tracking-wider text-white/35">Executive Scenario</p><p className="mt-1 text-xs text-white/70">The board challenges your recommendation after the CFO raises cost concerns.</p></div>
      <div className="ml-8 rounded-xl rounded-tr-sm bg-indigo-500/15 p-3 text-xs text-white/75"><span className="mb-1 block text-[9px] uppercase text-indigo-300">Your response</span>I would defend the investment because the long-term risk is greater.</div>
      <div className="mr-5 rounded-xl rounded-tl-sm border border-white/10 bg-white/[0.04] p-3 text-xs leading-relaxed text-white/70"><span className="mb-1 block text-[9px] uppercase text-accent-orange">EXEC™ challenge</span>You stated a position, but not an executive case. What evidence connects the investment to business continuity and board-level risk?</div>
      <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/[0.05] p-3 text-[11px] text-emerald-300">Feedback: strengthen financial framing and stakeholder alignment.</div>
    </div>
    <Link to="/coach" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-accent-orange">Meet EXEC™ <ArrowRight size={14}/></Link>
  </article>;
}
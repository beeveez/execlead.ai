import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Brain } from 'lucide-react';

export default function CoachPreviewCard() {
  return <article className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 md:p-6">
    <div className="mb-4 flex items-center justify-between text-[10px] uppercase tracking-wider text-white/40"><span>Demo Conversation</span><Brain size={14} className="text-indigo-400" /></div>
    <div className="space-y-3 rounded-xl border border-white/10 bg-black/20 p-4">
      <div className="mr-6 rounded-xl rounded-tl-sm border border-white/10 bg-white/[0.04] p-3 text-xs leading-relaxed text-white/70"><span className="mb-1 block text-[9px] uppercase text-accent-orange">EXEC™</span>You've protected the budget, but what risk have you shifted to the organization?</div>
      <div className="ml-8 rounded-xl rounded-tr-sm bg-indigo-500/15 p-3 text-xs text-white/75"><span className="mb-1 block text-[9px] uppercase text-indigo-300">User</span>I would escalate the risk to the executive committee.</div>
      <div className="mr-6 rounded-xl rounded-tl-sm border border-white/10 bg-white/[0.04] p-3 text-xs leading-relaxed text-white/70"><span className="mb-1 block text-[9px] uppercase text-accent-orange">EXEC™ challenge</span>Before you escalate it, quantify the operational impact. What decision do you want the committee to make?</div>
      <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/[0.05] p-3"><p className="text-[9px] uppercase text-emerald-400">Leadership feedback</p><p className="mt-1 text-[11px] text-white/60">Move from escalation to an evidence-backed executive recommendation.</p><p className="mt-2 text-[10px] text-white/35">Follow-up decision: define the requested action and risk threshold.</p></div>
    </div>
    <Link to="/coach" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-accent-orange">Meet EXEC™ <ArrowRight size={14} /></Link>
  </article>;
}
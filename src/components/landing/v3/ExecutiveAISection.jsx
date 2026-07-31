import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, MessageSquare, Swords, Layers, ArrowRight } from 'lucide-react';

const PRODUCTS = [
  {
    icon: Brain, title: 'Executive Coach™', to: '/coach',
    mockup: (
      <div className="space-y-2">
        <div className="flex justify-end"><div className="max-w-[85%] rounded-lg rounded-br-sm bg-accent-orange/15 border border-accent-orange/20 px-2.5 py-2"><div className="h-1.5 bg-white/25 rounded mb-1" /><div className="h-1.5 bg-white/15 rounded w-2/3" /></div></div>
        <div className="flex justify-start"><div className="max-w-[85%] rounded-lg rounded-bl-sm bg-white/5 border border-white/10 px-2.5 py-2"><div className="h-1.5 bg-white/20 rounded mb-1" /><div className="h-1.5 bg-white/15 rounded w-4/5" /></div></div>
      </div>
    ),
    blurb: 'Rehearses executive thinking through Socratic challenge — not scripts.',
  },
  {
    icon: MessageSquare, title: 'Executive Concierge™', to: '/dashboard',
    mockup: (
      <div className="space-y-1.5">
        <div className="rounded-lg bg-white/5 border border-white/10 px-2.5 py-2"><div className="h-1.5 bg-white/20 rounded mb-1" /><div className="h-1.5 bg-white/15 rounded w-3/4" /></div>
        <div className="grid grid-cols-2 gap-1">{['Next best action', 'Open simulator'].map((a) => <div key={a} className="rounded-md bg-accent-orange/10 border border-accent-orange/20 px-2 py-1.5 text-[10px] text-accent-orange">{a}</div>)}</div>
      </div>
    ),
    blurb: 'Turns your evidence into the single next executive action.',
  },
  {
    icon: Swords, title: 'Executive Debate™', to: '/debate',
    mockup: (
      <div className="space-y-1.5">
        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-2"><div className="text-[9px] text-emerald-400 mb-0.5">Pro</div><div className="h-1.5 bg-white/20 rounded w-4/5" /></div>
        <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 px-2.5 py-2"><div className="text-[9px] text-rose-400 mb-0.5">Con</div><div className="h-1.5 bg-white/20 rounded w-3/4" /></div>
      </div>
    ),
    blurb: 'Pressure-tests your position with opposing executive viewpoints.',
  },
  {
    icon: Layers, title: 'Executive Decision Lab™', to: '/decision-lab',
    mockup: (
      <div className="space-y-1.5">
        {['Option A · 62%', 'Option B · 78%', 'Option C · 54%'].map((o, i) => (
          <div key={o} className={`flex items-center justify-between rounded-md px-2 py-1.5 ${i === 1 ? 'bg-accent-orange/10 border border-accent-orange/30' : 'bg-white/5 border border-white/8'}`}><span className="text-[10px] text-white/70">{o.split(' · ')[0]}</span><span className="text-[9px] text-white/40">{o.split(' · ')[1]}</span></div>
        ))}
        <div className="flex items-center justify-between pt-0.5"><span className="text-[9px] text-white/40">AI Transparency</span><span className="text-[10px] font-bold text-indigo-300">High</span></div>
      </div>
    ),
    blurb: 'Surfaces alternatives, trade-offs, and AI confidence behind every call.',
  },
];

export default function ExecutiveAISection({ authed }) {
  return (
    <section className="py-20 md:py-28 px-6 lg:px-8 border-t border-white/5 bg-white/[0.015]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="text-[11px] uppercase tracking-wider text-indigo-400/80 font-semibold mb-2">Executive AI</div>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">AI That Challenges. Not AI That Simply Answers.</h2>
          <p className="text-white/45 max-w-2xl mx-auto text-sm">Four executive AI experiences that rehearse judgment, surface alternatives, and pressure-test your thinking with real executive scenarios.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PRODUCTS.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.div key={p.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}>
                <Link to={authed ? p.to : '/beta'} className="group block rounded-2xl border border-white/8 bg-white/[0.02] hover:border-accent-orange/25 hover:bg-white/[0.04] p-5 transition-all h-full">
                  <div className="w-10 h-10 rounded-xl bg-accent-orange/15 flex items-center justify-center mb-3"><Icon size={18} className="text-accent-orange" /></div>
                  <div className="text-[14px] font-semibold text-white mb-3">{p.title}</div>
                  <div className="rounded-lg border border-white/8 bg-[#0d0d14] p-2.5 mb-3">{p.mockup}</div>
                  <p className="text-[11.5px] text-white/50 leading-relaxed mb-3">{p.blurb}</p>
                  <div className="flex items-center gap-1 text-[11px] text-accent-orange opacity-0 group-hover:opacity-100 transition-opacity">Open <ArrowRight size={12} /></div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
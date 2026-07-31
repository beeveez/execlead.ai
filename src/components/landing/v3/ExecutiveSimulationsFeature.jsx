import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Swords, ArrowRight, Users, DollarSign, Cpu, AlertTriangle, MessageSquare, GitBranch } from 'lucide-react';

const SCENARIOS = [
  { icon: Users, label: 'Board Meetings' },
  { icon: DollarSign, label: 'Budget Decisions' },
  { icon: Cpu, label: 'Digital Transformation' },
  { icon: AlertTriangle, label: 'Stakeholder Conflict' },
  { icon: MessageSquare, label: 'Executive Communication' },
  { icon: GitBranch, label: 'Decision Making' },
];

export default function ExecutiveSimulationsFeature({ authed }) {
  return (
    <section className="py-20 md:py-28 px-6 lg:px-8 border-t border-white/5 bg-white/[0.015]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="order-2 lg:order-1">
          <div className="rounded-2xl border border-white/10 bg-[#0d0d14] overflow-hidden">
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/8 bg-white/[0.02]">
              <Swords size={14} className="text-accent-orange" />
              <span className="text-[11px] text-white/50 font-medium">Executive Simulator™ · Stakeholder Conflict</span>
            </div>
            <div className="p-5 space-y-3">
              <div className="rounded-lg bg-white/[0.03] border border-white/8 p-3">
                <div className="text-[9px] uppercase tracking-wider text-white/30 mb-1">Situation</div>
                <p className="text-[12px] text-white/70 leading-relaxed">Two SVPs are openly clashing over a shared platform investment. The CEO wants alignment by Friday.</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {['Facilitate a structured alignment session', 'Escalate and decide unilaterally', 'Delay until data arrives', 'Split the investment'].map((o, i) => (
                  <div key={o} className={`rounded-lg p-2.5 text-[11px] ${i === 0 ? 'bg-accent-orange/10 border border-accent-orange/30 text-white' : 'bg-white/5 border border-white/8 text-white/60'}`}>{o}</div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-1">
                <div className="text-[10px] text-white/40">Decision Quality</div>
                <div className="text-[12px] font-bold text-emerald-400">88 / 100</div>
              </div>
            </div>
          </div>
        </motion.div>
        <div className="order-1 lg:order-2">
          <div className="text-[11px] uppercase tracking-wider text-accent-orange/80 font-semibold mb-2">Executive Simulations</div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Practice Real Executive Decisions. Before They Cost You.</h2>
          <p className="text-white/55 leading-relaxed mb-6">
            Step into the scenarios executives actually face — then receive evidence-based feedback on your reasoning,
            trade-offs, and blind spots. Every simulation builds your leadership evidence.
          </p>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {SCENARIOS.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="flex items-center gap-2.5 rounded-xl bg-white/[0.03] border border-white/8 p-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0"><Icon size={15} className="text-indigo-300" /></div>
                  <span className="text-[12px] font-medium text-white/75">{s.label}</span>
                </div>
              );
            })}
          </div>
          <Link to={authed ? '/simulator' : '/beta'} className="inline-flex items-center gap-1.5 text-sm text-accent-orange hover:text-accent-orange/80 transition-colors font-medium">
            Open Executive Simulations™ <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
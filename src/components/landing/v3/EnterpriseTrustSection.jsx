import React from 'react';
import { motion } from 'framer-motion';
import { Scale, Eye, GitBranch, Lock, ShieldCheck, KeyRound, History, Brain } from 'lucide-react';

const TRUST = [
  { icon: Scale, label: 'AI Governance™' },
  { icon: Eye, label: 'Decision Transparency™' },
  { icon: GitBranch, label: 'Evidence Provenance™' },
  { icon: Lock, label: 'Executive Privacy™' },
  { icon: ShieldCheck, label: 'Secure Authentication' },
  { icon: KeyRound, label: 'Role-Based Access' },
  { icon: History, label: 'Audit Trail' },
  { icon: Brain, label: 'Explainable AI' },
];

export default function EnterpriseTrustSection() {
  return (
    <section className="py-16 md:py-20 px-6 lg:px-8 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <div className="text-[11px] uppercase tracking-wider text-indigo-400/80 font-semibold mb-2">Enterprise Trust</div>
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Built for Enterprise Trust.</h2>
          <p className="text-white/45 max-w-2xl mx-auto text-sm">Every executive insight is traceable, explainable, and supported by verified evidence.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {TRUST.map((t, i) => {
            const Icon = t.icon;
            return (
              <motion.div key={t.label} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}
                className="flex flex-col items-center text-center gap-2 rounded-xl border border-white/8 bg-white/[0.02] p-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500/15 to-accent-orange/10 flex items-center justify-center"><Icon size={16} className="text-white/70" /></div>
                <span className="text-[11px] font-medium text-white/65 leading-tight">{t.label}</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
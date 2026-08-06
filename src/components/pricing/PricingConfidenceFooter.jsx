import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Sparkles, Gauge, Fingerprint, Database } from 'lucide-react';

const CONTINUITY = [
  { icon: Gauge, label: 'Executive Readiness™' },
  { icon: Database, label: 'Evidence Engine™' },
  { icon: Fingerprint, label: 'Executive Identity™' },
];

export default function PricingConfidenceFooter() {
  return (
    <section className="px-4 py-12">
      <div className="max-w-5xl mx-auto space-y-4">
        <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.05] p-5 flex items-start gap-3">
          <ShieldCheck size={20} className="text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-white font-semibold text-sm mb-1">No Risk to Start</h3>
            <p className="text-white/55 text-sm leading-relaxed">You can begin with Free and upgrade at any time. Your Executive Journey remains intact — nothing is lost when you change plans.</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-2xl border border-white/8 bg-white/[0.02] p-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} className="text-accent-orange/70" />
            <h3 className="text-white font-semibold text-sm">What Stays With You Across Every Plan</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {CONTINUITY.map((t) => (
              <div key={t.label} className="flex items-center gap-2.5 rounded-xl bg-white/[0.03] border border-white/8 px-3 py-2.5">
                <t.icon size={15} className="text-accent-orange shrink-0" />
                <span className="text-white/70 text-xs font-medium">{t.label}</span>
              </div>
            ))}
          </div>
          <p className="text-white/40 text-[11px] mt-3">Your evidence, readiness, and identity continue with you across every plan — and every step of your journey.</p>
        </motion.div>
      </div>
    </section>
  );
}
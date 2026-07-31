import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Gauge, TrendingUp, BookOpen, Network, ArrowRight } from 'lucide-react';

const SOURCES = ['Every coaching session', 'Every simulation', 'Every decision', 'Every reflection', 'Every achievement'];

const FLOW = [
  { icon: ShieldCheck, title: 'Evidence™', desc: 'Verified leadership actions captured from across the platform.' },
  { icon: Gauge, title: 'Evidence Reliability™', desc: 'Each evidence item scored for confidence and provenance.' },
  { icon: TrendingUp, title: 'Outcome Intelligence™', desc: 'Evidence aggregated into measurable leadership growth.' },
  { icon: BookOpen, title: 'Executive Success Story™', desc: 'Growth synthesized into a verified executive narrative.' },
  { icon: Network, title: 'Executive Identity™', desc: 'A living, evidence-based identity that evolves with you.' },
];

export default function EvidenceEngineSection() {
  return (
    <section className="py-20 md:py-28 px-6 lg:px-8 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="text-[11px] uppercase tracking-wider text-accent-orange/80 font-semibold mb-2">The Evidence Engine</div>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Leadership Should Be Earned Through Evidence.</h2>
          <p className="text-white/45 max-w-2xl mx-auto text-sm">EXECLEAD.AI is built on a simple principle: leadership development must be proven, not claimed.</p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {SOURCES.map((s) => (
            <span key={s} className="px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-[12px] text-white/65">{s}</span>
          ))}
          <span className="px-3 py-1.5 rounded-full bg-accent-orange/15 border border-accent-orange/25 text-[12px] text-accent-orange font-medium">creates verified leadership evidence.</span>
        </div>

        <div className="flex flex-col lg:flex-row items-stretch gap-3 max-w-5xl mx-auto">
          {FLOW.map((f, i) => {
            const Icon = f.icon;
            return (
              <React.Fragment key={f.title}>
                <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="flex-1 rounded-2xl border border-white/8 bg-white/[0.02] p-4 text-center">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500/15 to-accent-orange/10 flex items-center justify-center mx-auto mb-3"><Icon size={20} className="text-accent-orange" /></div>
                  <div className="text-[13px] font-semibold text-white mb-1.5">{f.title}</div>
                  <p className="text-[11px] text-white/45 leading-relaxed">{f.desc}</p>
                </motion.div>
                {i < FLOW.length - 1 && (
                  <div className="hidden lg:flex items-center justify-center text-accent-orange/50"><ArrowRight size={18} /></div>
                )}
              </React.Fragment>
            );
          })}
        </div>
        <p className="text-center text-[12px] text-white/40 mt-8 max-w-2xl mx-auto">This evidence chain is one of EXECLEAD.AI's strongest differentiators — your leadership growth is demonstrated, not asserted.</p>
      </div>
    </section>
  );
}
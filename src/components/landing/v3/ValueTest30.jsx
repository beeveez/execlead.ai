import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Layers, Users, Rocket } from 'lucide-react';

/**
 * 30-Second Executive Test™ — compact orientation block near the top.
 * Preserves the IT → Executive Leadership positioning.
 */
const ITEMS = [
  {
    icon: Zap,
    q: 'What is EXECLEAD.AI?',
    a: 'An AI-powered Executive Leadership Operating System™ for technology professionals moving into leadership roles.',
  },
  {
    icon: Layers,
    q: 'Why is it different?',
    a: 'It combines Executive Readiness™, realistic leadership simulations, AI coaching, evidence-based growth tracking, and Executive Identity™ development in one integrated platform.',
  },
  {
    icon: Users,
    q: 'Who is it for?',
    a: 'IT professionals, architects, service delivery leaders, operations managers, engineering leaders, and digital transformation professionals preparing for management, director, and executive responsibilities.',
  },
  {
    icon: Rocket,
    q: 'Why act now?',
    a: 'Founding Members receive early access, direct influence on the product roadmap, and the opportunity to shape the first generation of evidence-based executive leadership intelligence.',
  },
];

export default function ValueTest30() {
  return (
    <section className="py-14 md:py-16 px-6 lg:px-8 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="text-[11px] uppercase tracking-wider text-accent-orange/80 font-semibold mb-2">
            In 30 Seconds
          </div>
          <h2 className="text-2xl md:text-3xl font-bold">Understand EXECLEAD.AI — Fast.</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {ITEMS.map((it, i) => (
            <motion.div
              key={it.q}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl border border-white/10 bg-white/[0.02] p-5"
            >
              <it.icon size={18} className="text-accent-orange mb-3" />
              <div className="text-[11px] uppercase tracking-wider text-white/45 font-semibold mb-1.5">
                {it.q}
              </div>
              <p className="text-sm text-white/70 leading-relaxed">{it.a}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
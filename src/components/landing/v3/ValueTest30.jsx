import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Users, Layers, Rocket } from 'lucide-react';

/**
 * 30-Second Executive Test — compact orientation block near the top.
 * Four short, one-sentence answers. Preserves IT → Executive positioning.
 */
const ITEMS = [
  {
    icon: Users,
    q: 'Who is it for?',
    a: 'Technology leaders, managers, directors, emerging executives, and organizations developing their next generation of leaders.',
  },
  {
    icon: Layers,
    q: 'What does it do?',
    a: 'It combines executive readiness assessment, AI coaching, leadership simulations, evidence tracking, and executive identity development.',
  },
  {
    icon: Zap,
    q: 'Why is it different?',
    a: 'It does not simply generate leadership advice. It builds a continuously evolving executive capability profile from leadership evidence.',
  },
];

export default function ValueTest30() {
  return (
    <section className="py-14 md:py-16 px-6 lg:px-8 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="text-[11px] uppercase tracking-wider text-accent-orange/80 font-semibold mb-2">
            The 30-Second Executive Test
          </div>
          <h2 className="text-2xl md:text-3xl font-bold">What is EXECLEAD.AI?</h2>
          <p className="mx-auto mt-3 max-w-3xl text-sm leading-relaxed text-white/50">EXECLEAD.AI is an AI Executive Leadership Operating System designed to help technology and business professionals develop executive readiness, judgment, and strategic leadership.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
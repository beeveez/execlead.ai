import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Users, Layers, Rocket } from 'lucide-react';

/**
 * 30-Second Value Test™ — compact orientation block near the top of the page.
 * Lets a first-time visitor answer: What is it? Who is it for? Why different? Why now?
 */
const ITEMS = [
  {
    icon: Zap,
    q: 'What is EXECLEAD.AI?',
    a: 'An AI-powered Executive Leadership Operating System™.',
  },
  {
    icon: Users,
    q: 'Who is it for?',
    a: 'Ambitious professionals preparing for management, director, executive, and enterprise leadership roles.',
  },
  {
    icon: Layers,
    q: 'Why is it different?',
    a: 'It continuously measures, develops, and demonstrates Executive Readiness™ through coaching, simulations, evidence, identity, and outcomes.',
  },
  {
    icon: Rocket,
    q: 'Why act now?',
    a: 'Founding Members receive early access, influence the product roadmap, and help shape the first generation of evidence-based executive leadership intelligence.',
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
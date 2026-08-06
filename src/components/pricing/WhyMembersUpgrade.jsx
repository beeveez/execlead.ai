import React from 'react';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

const QUOTES = [
  { text: 'I wanted structured executive development.', role: 'Professional Member' },
  { text: 'I needed measurable Executive Readiness™.', role: 'Executive Member' },
  { text: 'I was preparing for Director interviews.', role: 'Executive Member' },
  { text: 'I wanted continuous coaching.', role: 'Professional Member' },
];

export default function WhyMembersUpgrade() {
  return (
    <section className="px-4 py-16">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <div className="text-[11px] uppercase tracking-wider text-accent-orange/80 font-semibold mb-2">Why Members Upgrade</div>
          <h2 className="text-2xl md:text-3xl font-bold mb-2">The Reasons Leaders Choose to Grow</h2>
          <p className="text-white/45 text-sm max-w-xl mx-auto">The motivations behind upgrading — not features, outcomes.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {QUOTES.map((q, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="rounded-2xl border border-white/8 bg-white/[0.02] p-5 flex items-start gap-3">
              <Quote size={18} className="text-accent-orange/60 shrink-0 mt-0.5" />
              <div>
                <p className="text-white/80 text-sm leading-relaxed">"{q.text}"</p>
                <p className="text-white/35 text-[11px] mt-2">{q.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
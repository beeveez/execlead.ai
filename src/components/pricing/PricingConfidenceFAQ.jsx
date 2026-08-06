import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const FAQ = [
  { q: 'Can I upgrade later?', a: 'Yes. You can start with Free and upgrade to Professional or Executive at any time. Your Executive Journey, evidence, and progress remain fully intact across every change.' },
  { q: 'Can I cancel?', a: 'Absolutely. You can cancel anytime from your billing settings. You keep access until the end of your billing period, and your leadership evidence and Executive Identity™ are always yours.' },
  { q: 'What happens after the assessment?', a: 'After the Executive Readiness Assessment™ you receive a personalized report — your readiness score, gap analysis, and a tailored growth roadmap. From there you move into your Executive Dashboard and AI coaching journey.' },
  { q: 'Do I need leadership experience?', a: 'No. EXECLEAD.AI adapts to your level — from early-career professionals exploring leadership to senior managers preparing for executive roles. Free is the perfect place to discover where you stand.' },
  { q: 'How long until I see progress?', a: 'Most members see measurable growth within 3–6 months of consistent practice. Your Executive Readiness™ score tracks real development over time, so progress is visible — not vague.' },
];

export default function PricingConfidenceFAQ() {
  const [open, setOpen] = useState(0);
  return (
    <section className="px-4 py-16">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="text-[11px] uppercase tracking-wider text-accent-orange/80 font-semibold mb-2">Pricing FAQ</div>
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Answers Before You Decide</h2>
          <p className="text-white/45 text-sm max-w-xl mx-auto">The questions most members ask before selecting a plan.</p>
        </div>
        <div className="space-y-2">
          {FAQ.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={i} className="rounded-xl border border-white/8 bg-white/[0.02] overflow-hidden">
                <button onClick={() => setOpen(isOpen ? -1 : i)} className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left">
                  <span className="text-sm font-medium text-white/85">{item.q}</span>
                  <ChevronDown size={16} className={`text-white/40 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <p className="px-4 pb-4 text-white/55 text-sm leading-relaxed">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
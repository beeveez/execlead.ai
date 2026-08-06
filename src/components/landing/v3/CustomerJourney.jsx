import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const STEPS = [
  { label: 'Landing', desc: 'Discover the platform', route: '/' },
  { label: 'Executive Readiness Assessment', desc: 'Measure where you are', route: '/assessment' },
  { label: 'Personalized Report', desc: 'See your gaps and roadmap', route: '/executive-readiness' },
  { label: 'Executive Dashboard', desc: 'Your command center', route: '/dashboard' },
  { label: 'AI Executive Coach', desc: 'Develop continuously', route: '/coach' },
  { label: 'Leadership Journey', desc: 'Practice and prove growth', route: '/journey' },
  { label: 'Upgrade Recommendation', desc: 'Advance when ready', route: '/pricing' },
];

export default function CustomerJourney() {
  return (
    <section className="py-16 md:py-24 px-6 lg:px-8 border-t border-white/5">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="text-[11px] uppercase tracking-wider text-accent-orange/80 font-semibold mb-2">One Continuous Journey</div>
          <h2 className="text-2xl md:text-4xl font-bold mb-3">From First Visit to Executive Ready</h2>
          <p className="text-white/45 max-w-2xl mx-auto text-sm">Every step builds on the last. No dead ends — only the next meaningful action.</p>
        </div>
        <div className="flex flex-col gap-2">
          {STEPS.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}>
              <Link to={s.route} className="group flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.02] hover:border-accent-orange/25 hover:bg-accent-orange/[0.03] px-4 py-3 transition-all">
                <div className="w-8 h-8 rounded-lg bg-accent-orange/10 flex items-center justify-center text-accent-orange text-xs font-bold shrink-0">{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white">{s.label}</div>
                  <div className="text-[11px] text-white/40">{s.desc}</div>
                </div>
                <ArrowRight size={15} className="text-white/25 group-hover:text-accent-orange group-hover:translate-x-0.5 transition-all shrink-0" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
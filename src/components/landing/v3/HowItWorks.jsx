import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Target, Gauge, Map, Swords, Network, Crown, ArrowRight } from 'lucide-react';

const STEPS = [
  { icon: Target, title: 'Choose Your Leadership Goal', to: '/assessment' },
  { icon: Gauge, title: 'Executive Readiness Assessment™', to: '/assessment' },
  { icon: Map, title: 'Personalized AI Leadership Journey', to: '/journey' },
  { icon: Swords, title: 'Practice Through Executive Simulations™', to: '/simulator' },
  { icon: Network, title: 'Build Your Executive Identity™', to: '/executive-identity-graph' },
  { icon: Crown, title: 'Become Executive Ready™', to: '/dashboard' },
];

export default function HowItWorks({ authed }) {
  return (
    <section className="py-20 md:py-28 px-6 lg:px-8 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="text-[11px] uppercase tracking-wider text-accent-orange/80 font-semibold mb-2">How It Works</div>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">A Guided Path to Executive Leadership.</h2>
          <p className="text-white/45 max-w-2xl mx-auto text-sm">Six connected steps. One continuous journey. Every step builds verified evidence of your growth.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div key={s.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}>
                <Link to={authed ? s.to : '/beta'} className="group block rounded-2xl border border-white/8 bg-white/[0.02] hover:border-accent-orange/25 hover:bg-white/[0.04] p-5 transition-all h-full">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/15 to-accent-orange/10 flex items-center justify-center"><Icon size={18} className="text-accent-orange" /></div>
                    <span className="text-[11px] font-bold text-white/20">0{i + 1}</span>
                  </div>
                  <div className="text-[13px] font-semibold text-white leading-tight mb-3">{s.title}</div>
                  <div className="flex items-center gap-1 text-[11px] text-accent-orange opacity-0 group-hover:opacity-100 transition-opacity">Open <ArrowRight size={12} /></div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
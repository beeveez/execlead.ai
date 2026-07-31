import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Gauge, Brain, Map, BookOpen, TrendingUp, ArrowRight } from 'lucide-react';

const METRICS = [
  { icon: Gauge, label: 'Readiness Trend', value: '+18', color: 'text-emerald-400', bars: [40, 50, 45, 60, 55, 70, 68, 82] },
  { icon: Brain, label: 'Competency Growth', value: '+12', color: 'text-accent-orange', bars: [30, 35, 45, 50, 58, 60, 65, 72] },
  { icon: Map, label: 'Leadership Journey', value: '6 levels', color: 'text-indigo-300', bars: [25, 30, 40, 50, 55, 60, 70, 78] },
  { icon: BookOpen, label: 'Executive Story', value: 'Verified', color: 'text-white/80', bars: [20, 25, 30, 40, 50, 55, 60, 70] },
  { icon: TrendingUp, label: 'Promotion Forecast', value: '9 mo', color: 'text-amber-400', bars: [35, 40, 45, 50, 58, 65, 72, 80] },
];

export default function OutcomeIntelligenceFeature({ authed }) {
  return (
    <section className="py-20 md:py-28 px-6 lg:px-8 border-t border-white/5 bg-white/[0.015]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="text-[11px] uppercase tracking-wider text-indigo-400/80 font-semibold mb-2">Executive Outcomes</div>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Measurable Leadership Growth. Not Learning Activity.</h2>
          <p className="text-white/45 max-w-2xl mx-auto text-sm">EXECLEAD.AI tracks how your executive readiness, competency, evidence, and story actually grow — and forecasts your next move.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
          {METRICS.map((m, i) => {
            const Icon = m.icon;
            return (
              <motion.div key={m.label} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="rounded-2xl border border-white/8 bg-white/[0.02] p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center"><Icon size={15} className="text-white/60" /></div>
                  <span className={`text-base font-bold ${m.color}`}>{m.value}</span>
                </div>
                <div className="text-[11px] font-medium text-white/75 mb-3">{m.label}</div>
                <div className="h-10 flex items-end gap-0.5">
                  {m.bars.map((h, j) => (
                    <div key={j} className="flex-1 rounded-t bg-gradient-to-t from-indigo-500/30 to-accent-orange/40" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
        <div className="text-center">
          <Link to={authed ? '/outcome-intelligence' : '/beta'} className="inline-flex items-center gap-1.5 text-sm text-accent-orange hover:text-accent-orange/80 transition-colors font-medium">
            Explore Outcome Intelligence™ <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
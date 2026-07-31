import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Target, Shield, RefreshCw, TrendingUp, ArrowRight } from 'lucide-react';
import ExecutiveReadinessSample from '../../readiness-assessment/ExecutiveReadinessSample';

const ATTRIBUTES = [
  { icon: Target, title: 'Personalized', desc: 'Every question adapts to your selected Leadership Track and target executive role.' },
  { icon: Shield, title: 'Evidence-Based', desc: 'Your score reflects demonstrated competency — not time spent or pages viewed.' },
  { icon: RefreshCw, title: 'Adaptive', desc: 'The assessment evolves as your leadership context and responsibilities grow.' },
  { icon: TrendingUp, title: 'Outcome-Focused', desc: 'You leave with a roadmap and a forecast — not just a number.' },
];

export default function ExecutiveReadinessFeature({ authed }) {
  return (
    <section className="py-20 md:py-28 px-6 lg:px-8 border-t border-white/5 bg-white/[0.015]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="text-[11px] uppercase tracking-wider text-accent-orange/80 font-semibold mb-2">Executive Readiness</div>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">The Assessment That Starts Everything.</h2>
          <p className="text-white/45 max-w-2xl mx-auto text-sm">A 10-minute, evidence-based assessment that reveals your leadership gaps and unlocks your personalized journey.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {ATTRIBUTES.map((a, i) => {
            const Icon = a.icon;
            return (
              <motion.div key={a.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} className="rounded-2xl border border-white/8 bg-white/[0.02] p-5">
                <div className="w-10 h-10 rounded-xl bg-accent-orange/15 flex items-center justify-center mb-3"><Icon size={18} className="text-accent-orange" /></div>
                <div className="text-[13px] font-semibold text-white mb-1.5">{a.title}</div>
                <p className="text-[11.5px] text-white/45 leading-relaxed">{a.desc}</p>
              </motion.div>
            );
          })}
        </div>
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="px-2.5 py-1 rounded-full bg-accent-orange/15 border border-accent-orange/25 text-[10px] font-semibold text-accent-orange uppercase tracking-wider">Sample Report</span>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#0d0d14] p-5 md:p-8">
            <ExecutiveReadinessSample />
          </div>
          <div className="text-center mt-6">
            <Link to={authed ? '/assessment' : '/beta'} className="inline-flex items-center gap-1.5 text-sm text-accent-orange hover:text-accent-orange/80 transition-colors font-medium">
              Take the Executive Readiness Assessment™ <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
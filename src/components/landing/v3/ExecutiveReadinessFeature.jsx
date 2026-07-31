import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, GitBranch, MessageSquare, Users, TrendingUp, Gauge, ArrowRight } from 'lucide-react';
import ExecutiveReadinessSample from '../../readiness-assessment/ExecutiveReadinessSample';

const MEASURES = [
  { icon: Gauge, title: 'Leadership Capability', desc: 'Delegation, coaching, conflict resolution, and team leadership.' },
  { icon: GitBranch, title: 'Executive Decision Quality', desc: 'How you decide with incomplete data and competing priorities.' },
  { icon: TrendingUp, title: 'Strategic Thinking', desc: 'Connecting your work to business strategy over 12–24 months.' },
  { icon: MessageSquare, title: 'Executive Communication', desc: 'Influence, board presence, and stakeholder alignment.' },
  { icon: Users, title: 'Influence', desc: 'Moving stakeholders who do not report to you.' },
  { icon: Activity, title: 'Leadership Growth', desc: 'Measured improvement across every dimension over time.' },
];

export default function ExecutiveReadinessFeature({ authed }) {
  return (
    <section className="py-20 md:py-28 px-6 lg:px-8 border-t border-white/5 bg-white/[0.015]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <div className="text-[11px] uppercase tracking-wider text-accent-orange/80 font-semibold mb-2">The Executive Readiness Difference</div>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Not a Personality Test. A Leadership Readiness Measurement.</h2>
          <p className="text-white/45 max-w-2xl mx-auto text-sm">Not another personality test. Not another learning assessment. The Executive Readiness Assessment™ measures what actually determines executive readiness.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-12 max-w-5xl mx-auto">
          {MEASURES.map((m, i) => {
            const Icon = m.icon;
            return (
              <motion.div key={m.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="flex items-start gap-3 rounded-xl border border-white/8 bg-white/[0.02] p-4">
                <div className="w-9 h-9 rounded-lg bg-accent-orange/15 flex items-center justify-center shrink-0"><Icon size={16} className="text-accent-orange" /></div>
                <div>
                  <div className="text-[13px] font-semibold text-white mb-1">{m.title}</div>
                  <p className="text-[11.5px] text-white/45 leading-relaxed">{m.desc}</p>
                </div>
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
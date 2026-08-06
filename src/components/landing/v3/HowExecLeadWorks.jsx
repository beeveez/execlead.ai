import React from 'react';
import { motion } from 'framer-motion';
import { X, Check, ArrowRight } from 'lucide-react';

const COLUMNS = [
  { name: 'Traditional Learning', accent: false, points: ['Passive courses', 'No measurable readiness', 'Generic content', 'Forgotten after completion'] },
  { name: 'Interview Practice', accent: false, points: ['Rehearsed answers', 'Polish, not development', 'No evidence of growth', 'Stops after the interview'] },
  { name: 'Generic AI', accent: false, points: ['No executive context', 'No verified evidence', 'No leadership identity', 'Not built for careers'] },
  { name: 'EXECLEAD.AI', accent: true, points: ['Assess → Develop → Prove', 'Evidence-based Executive Readiness™', 'Verified Executive Identity™', 'Continuous, lifelong growth'] },
];

const FLOW = ['Learn', 'Practice', 'Simulate', 'Receive AI Feedback', 'Measure Growth', 'Become Executive Ready'];

export default function HowExecLeadWorks() {
  return (
    <section className="py-16 md:py-24 px-6 lg:px-8 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="text-[11px] uppercase tracking-wider text-accent-orange/80 font-semibold mb-2">What Makes EXECLEAD.AI Different?</div>
          <h2 className="text-2xl md:text-4xl font-bold mb-3">Not Training. Executive Readiness.</h2>
          <p className="text-white/45 max-w-2xl mx-auto text-sm">Traditional learning, interview practice, and generic AI each solve part of the problem. EXECLEAD.AI solves the whole journey.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
          {COLUMNS.map((col, i) => (
            <motion.div key={col.name} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className={`rounded-2xl border p-5 ${col.accent ? 'border-accent-orange/30 bg-gradient-to-br from-accent-orange/[0.08] to-transparent' : 'border-white/8 bg-white/[0.02]'}`}>
              <div className={`text-[11px] uppercase tracking-wider font-semibold mb-4 ${col.accent ? 'text-accent-orange' : 'text-white/35'}`}>{col.name}</div>
              <div className="space-y-3">
                {col.points.map((p) => (
                  <div key={p} className="flex items-start gap-2.5">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${col.accent ? 'bg-accent-orange/15' : 'bg-white/5'}`}>
                      {col.accent ? <Check size={12} className="text-accent-orange" /> : <X size={11} className="text-white/40" />}
                    </span>
                    <span className={`text-xs leading-relaxed ${col.accent ? 'text-white/90 font-medium' : 'text-white/50'}`}>{p}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-6 md:p-8">
          <div className="text-center mb-6">
            <div className="text-[11px] uppercase tracking-wider text-white/40 font-semibold mb-1">The EXECLEAD.AI Method™</div>
            <h3 className="text-lg md:text-xl font-semibold text-white">From Learning to Executive Ready</h3>
          </div>
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">
            {FLOW.map((step, i) => (
              <React.Fragment key={step}>
                <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} className={`flex-1 text-center rounded-xl px-3 py-3 text-xs font-medium ${i === FLOW.length - 1 ? 'bg-accent-orange/15 border border-accent-orange/30 text-accent-orange' : 'bg-white/[0.03] border border-white/8 text-white/70'}`}>
                  {step}
                </motion.div>
                {i < FLOW.length - 1 && <ArrowRight size={16} className="hidden md:block text-white/25 mx-0.5 shrink-0" />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
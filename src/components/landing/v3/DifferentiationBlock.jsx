import React from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

/**
 * Differentiation Block™ —
 * "Coaching Platforms Help You Improve. EXECLEAD.AI Helps You Prove It."
 */
const ROWS = [
  { coaching: 'Periodic sessions', learning: 'Static courses', execlead: 'Continuous Executive Readiness™' },
  { coaching: 'Subjective feedback', learning: 'Completion certificates', execlead: 'Evidence-backed leadership growth' },
  { coaching: 'Difficult to measure', learning: 'Limited personalization', execlead: 'AI coaching + simulations + identity + outcomes' },
  { coaching: 'Separate tools', learning: 'Separate tools', execlead: 'One integrated Executive Leadership Operating System™' },
];

export default function DifferentiationBlock() {
  return (
    <section className="py-20 md:py-24 px-6 lg:px-8 border-t border-white/5">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <div className="text-[11px] uppercase tracking-wider text-accent-orange/80 font-semibold mb-2">
            Differentiation Block
          </div>
          <h2 className="text-2xl md:text-3xl font-bold leading-tight max-w-3xl mx-auto">
            Coaching Platforms Help You Improve. <span className="text-accent-orange">EXECLEAD.AI Helps You Prove It.</span>
          </h2>
          <p className="text-sm text-white/45 max-w-2xl mx-auto mt-3 italic">
            Most platforms help leaders learn. EXECLEAD.AI helps professionals become executive-ready through continuous coaching, practice, evidence, and measurable growth.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden"
        >
          {/* Header row */}
          <div className="grid grid-cols-3 bg-white/[0.03] border-b border-white/10">
            <div className="p-4 text-xs font-semibold text-white/50 uppercase tracking-wider">Traditional Coaching</div>
            <div className="p-4 text-xs font-semibold text-white/50 uppercase tracking-wider border-l border-white/10">Learning Platforms</div>
            <div className="p-4 text-xs font-semibold text-accent-orange uppercase tracking-wider border-l border-white/10 bg-accent-orange/5">EXECLEAD.AI</div>
          </div>
          {/* Body rows */}
          {ROWS.map((r, i) => (
            <div key={i} className={`grid grid-cols-3 ${i !== ROWS.length - 1 ? 'border-b border-white/8' : ''}`}>
              <div className="p-4 flex items-start gap-2 text-xs text-white/55">
                <X size={13} className="text-white/30 mt-0.5 flex-shrink-0" /> {r.coaching}
              </div>
              <div className="p-4 flex items-start gap-2 text-xs text-white/55 border-l border-white/10">
                <X size={13} className="text-white/30 mt-0.5 flex-shrink-0" /> {r.learning}
              </div>
              <div className="p-4 flex items-start gap-2 text-xs text-white/85 font-medium border-l border-white/10 bg-accent-orange/[0.04]">
                <Check size={13} className="text-emerald-400 mt-0.5 flex-shrink-0" /> {r.execlead}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
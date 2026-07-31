import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Check } from 'lucide-react';

/**
 * EXEC™ Personalized Preview™ — AI-generated competency emphasis shown
 * immediately after a leadership path is selected. Dynamic per path.
 */
export default function ExecPersonalizedPreview({ trackLabel, competencies }) {
  if (!competencies?.length) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-xl bg-gradient-to-br from-indigo-500/[0.07] to-transparent border border-indigo-500/20 p-4 mb-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-lg bg-indigo-500/15 flex items-center justify-center"><Sparkles size={14} className="text-indigo-400" /></div>
        <div className="text-[11px] uppercase tracking-wider text-indigo-300/80 font-semibold">EXEC™ Preview</div>
      </div>
      <p className="text-[11.5px] text-white/55 leading-relaxed mb-3">
        Based on your selected <span className="text-white font-medium">{trackLabel}</span> path, your Executive Leadership journey will emphasize:
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1.5 gap-x-3">
        {competencies.map((c) => (
          <div key={c} className="flex items-center gap-2 text-[11.5px] text-white/65"><Check size={12} className="text-indigo-400 shrink-0" /> {c}</div>
        ))}
      </div>
      <p className="text-[10.5px] text-white/40 mt-3 leading-relaxed">Your Executive Coach™ will prioritize these competencies throughout your journey.</p>
    </motion.div>
  );
}
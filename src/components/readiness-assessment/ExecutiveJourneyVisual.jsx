import React from 'react';
import { motion } from 'framer-motion';
import { Flag } from 'lucide-react';

const LEVELS = ['Professional', 'Team Lead', 'Manager', 'Senior Manager', 'Director', 'Vice President', 'C-Level Executive'];

/**
 * Executive Journey Visual™ — aspirational career ladder that highlights the
 * destination implied by the selected leadership path / target role.
 */
export default function ExecutiveJourneyVisual({ destination }) {
  const dest = destination || 'Director';
  const destIndex = Math.max(0, LEVELS.indexOf(dest));
  return (
    <div className="mb-9 rounded-2xl bg-gradient-to-br from-white/[0.03] to-transparent border border-white/8 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2"><Flag size={14} className="text-accent-orange" /><div className="text-[11px] uppercase tracking-wider text-white/40 font-semibold">Executive Journey</div></div>
        <div className="text-[11px] text-white/50">Destination: <span className="text-accent-orange font-semibold">{dest}</span></div>
      </div>
      <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1">
        {LEVELS.map((lvl, i) => {
          const reached = i <= destIndex;
          const isDest = i === destIndex;
          return (
            <React.Fragment key={lvl}>
              <div className="flex flex-col items-center min-w-[68px]">
                <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: i * 0.06 }}
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${isDest ? 'bg-accent-orange text-white shadow-lg shadow-accent-orange/30 animate-pulse' : reached ? 'bg-accent-orange/20 text-accent-orange' : 'bg-white/5 text-white/40'}`}>
                  {reached && !isDest ? '✓' : i + 1}
                </motion.div>
                <span className={`text-[9.5px] mt-1 text-center leading-tight ${isDest ? 'text-accent-orange font-semibold' : reached ? 'text-white/70' : 'text-white/40'}`}>{lvl}</span>
              </div>
              {i < LEVELS.length - 1 && (
                <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.3 + i * 0.06 }}
                  className={`h-px flex-1 origin-left min-w-[8px] ${i < destIndex ? 'bg-accent-orange/40' : 'bg-white/10'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
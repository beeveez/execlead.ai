import React from 'react';
import { motion } from 'framer-motion';
import { Gauge, TrendingUp, Sparkles, AlertCircle } from 'lucide-react';

/**
 * Executive Readiness Preview™ — a sample report card showing what members receive.
 * Clearly labeled as sample data.
 */
export default function ExecutiveReadinessSample() {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="relative rounded-2xl bg-gradient-to-br from-white/[0.04] to-transparent border border-white/10 p-5">
      <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-white/8 text-[9px] text-white/50 font-medium">Sample Report</div>
      <div className="flex items-center gap-2 mb-4"><Gauge size={15} className="text-accent-orange" /><div className="text-[11px] uppercase tracking-wider text-white/40 font-semibold">Executive Readiness™</div></div>
      <div className="flex items-end gap-6 mb-4">
        <div>
          <div className="text-3xl font-bold text-white leading-none">78%</div>
          <div className="text-[10px] text-white/40 mt-1">Current Leadership Level</div>
          <div className="text-[12px] font-semibold text-accent-orange mt-0.5">Manager Ready</div>
        </div>
        <div className="flex-1 grid grid-cols-1 gap-2">
          <div className="flex items-center gap-2 text-[11px]"><TrendingUp size={12} className="text-emerald-400 shrink-0" /><span className="text-white/40">Top Strength:</span><span className="text-white font-medium">Strategic Thinking</span></div>
          <div className="flex items-center gap-2 text-[11px]"><AlertCircle size={12} className="text-amber-400 shrink-0" /><span className="text-white/40">Growth Opportunity:</span><span className="text-white font-medium">Executive Communication</span></div>
        </div>
      </div>
      <div className="rounded-xl bg-indigo-500/[0.06] border border-indigo-500/20 p-3 flex items-start gap-2">
        <Sparkles size={13} className="text-indigo-400 mt-0.5 shrink-0" />
        <p className="text-[11px] text-white/60 leading-relaxed"><span className="text-white font-medium">AI Insight:</span> You demonstrate strong strategic capability but should strengthen executive stakeholder communication before pursuing Director-level roles.</p>
      </div>
      <div className="text-center text-[10px] text-white/30 mt-3">Your actual results will be personalized.</div>
    </motion.div>
  );
}
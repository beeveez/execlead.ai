import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

/**
 * EXEC™ Insights — pattern-based observations, not generic summaries.
 */
export default function PatternInsights({ insights }) {
  if (!insights?.length) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-emerald-500/[0.07] to-transparent border border-emerald-500/20 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center"><Sparkles size={14} className="text-emerald-400" /></div>
        <div><div className="text-[10px] uppercase tracking-wider text-white/30">EXEC™ Insights</div><h3 className="text-sm font-semibold text-white">Patterns I'm Noticing</h3></div>
      </div>
      <div className="space-y-2">
        {insights.map((ins, i) => (
          <div key={i} className="flex items-start gap-2 text-[12px] text-white/65 leading-relaxed">
            <span className="text-emerald-400/60 mt-1">•</span><span>{ins}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
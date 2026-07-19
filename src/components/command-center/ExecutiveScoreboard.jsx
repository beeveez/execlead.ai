import React from 'react';
import { motion } from 'framer-motion';
import { TrendBadge, ConfidenceDot } from './SectionShell';

export default function ExecutiveScoreboard({ metrics }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {metrics.map((m, i) => {
        const meets = m.value >= m.target;
        return (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="bg-white/[0.02] border border-white/5 rounded-xl p-4 hover:bg-white/[0.04] transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/40 text-[10px] uppercase tracking-wider">{m.label}</span>
              <ConfidenceDot level={m.confidence} />
            </div>
            <div className="flex items-baseline gap-1.5 mb-1">
              <span className={`text-2xl font-bold ${meets ? 'text-emerald-400' : 'text-amber-400'}`}>{m.value}{m.unit}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/30 text-[10px]">Target {m.target}{m.unit}</span>
              <TrendBadge trend={m.trend} change={m.change} unit={m.unit} />
            </div>
            <p className="text-white/20 text-[9px] mt-1.5">Updated {m.lastUpdated}</p>
          </motion.div>
        );
      })}
    </div>
  );
}
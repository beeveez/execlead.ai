import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, ClipboardList } from 'lucide-react';

export default function HardeningPhases({ phases }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <ClipboardList size={16} className="text-indigo-400" />
        <h3 className="text-white font-semibold text-sm">Hardening Program Phases</h3>
      </div>
      <div className="space-y-4">
        {phases.map((p, i) => (
          <motion.div
            key={p.phase}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="flex items-start gap-4"
          >
            <div className="flex flex-col items-center flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <Circle size={14} className="text-amber-400" />
              </div>
              {i < phases.length - 1 && <div className="w-px h-full min-h-[2rem] bg-white/5 mt-1" />}
            </div>
            <div className="flex-1 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-amber-400 text-xs font-mono">Phase {p.phase}</span>
                <h4 className="text-white font-semibold text-sm">{p.name}</h4>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {p.items.map((item, idx) => (
                  <span key={idx} className="text-[10px] px-2 py-0.5 bg-white/5 border border-white/5 rounded text-white/40">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
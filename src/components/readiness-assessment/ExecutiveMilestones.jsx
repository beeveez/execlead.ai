import React from "react";
import { motion } from "framer-motion";
import { Flag, ChevronRight } from "lucide-react";

export default function ExecutiveMilestones({ milestone }) {
  if (!milestone) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-gradient-to-r from-indigo-500/[0.07] to-transparent border border-indigo-500/20 p-5">
      <div className="flex items-center gap-2 mb-3"><Flag size={15} className="text-indigo-400" /><div className="text-[10px] uppercase tracking-wider text-white/30">Executive Milestones</div></div>
      <div className="flex items-center gap-3">
        <div className="text-center px-3">
          <div className="text-[9px] uppercase tracking-wider text-white/30">Current</div>
          <div className="text-sm font-semibold text-white mt-0.5">{milestone.current}</div>
        </div>
        <ChevronRight size={18} className="text-white/30" />
        <div className="text-center px-3">
          <div className="text-[9px] uppercase tracking-wider text-indigo-400">Next</div>
          <div className="text-sm font-semibold text-indigo-300 mt-0.5">{milestone.next}</div>
        </div>
      </div>
      <div className="mt-4">
        <div className="flex items-center justify-between text-[11px] mb-1.5"><span className="text-white/40">Progress to {milestone.next}</span><span className="text-white font-semibold">{milestone.progress}%</span></div>
        <div className="h-2 bg-white/8 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-indigo-500 to-accent-orange" style={{ width: `${milestone.progress}%` }} /></div>
        <div className="flex items-center justify-between text-[10px] text-white/40 mt-2"><span>Target: {milestone.targetRole}</span><span>Expected: {milestone.expected}</span></div>
      </div>
    </motion.div>
  );
}
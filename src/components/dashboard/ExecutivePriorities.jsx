import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ListChecks, ArrowRight } from "lucide-react";

const PRIORITY_COLORS = {
  P1: "text-rose-400 bg-rose-500/10",
  P2: "text-amber-400 bg-amber-500/10",
  P3: "text-blue-400 bg-blue-500/10",
};

export default function ExecutivePriorities({ priorities }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <ListChecks size={14} className="text-indigo-400" />
        <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider">Executive Priorities™</h2>
      </div>
      <div className="space-y-2">
        {(!priorities || priorities.length === 0) ? (
          <div className="bg-white/[0.02] border border-white/5 rounded-lg p-4 text-center">
            <p className="text-white/30 text-sm">No priorities generated yet.</p>
          </div>
        ) : (
          priorities.map((p, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
              <Link to={p.path || "/dashboard"} className="block bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-white/10 rounded-lg p-3 transition-all group">
                <div className="flex items-center gap-3 mb-1.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${PRIORITY_COLORS[p.priorityLevel] || PRIORITY_COLORS.P3}`}>{p.priorityLevel || `P${i + 1}`}</span>
                  <span className="text-white/80 text-sm font-medium flex-1 truncate">{p.label}</span>
                  <span className="text-white/30 text-xs whitespace-nowrap">{p.estimatedTime}</span>
                  <ArrowRight size={12} className="text-white/20 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-white/30 text-xs ml-1">{p.reason}</p>
                <div className="flex items-center gap-3 ml-1 mt-1.5">
                  {p.journeyGain > 0 && <span className="text-indigo-400 text-[10px] font-medium">+{p.journeyGain} Journey</span>}
                  {p.readinessGain > 0 && <span className="text-emerald-400 text-[10px] font-medium">+{p.readinessGain} Readiness</span>}
                  <span className="text-white/20 text-[10px]">{p.confidence || 0}% confidence</span>
                </div>
              </Link>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
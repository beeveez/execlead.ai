import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Target, Clock, ArrowRight, TrendingUp } from "lucide-react";

/**
 * Executive Action Center™ — "Your Top Priorities".
 * Shows only the three highest-impact actions. Insight → action.
 */
export default function ExecutiveActionCenter({ priorities }) {
  if (!priorities?.length) return null;
  return (
    <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-accent-orange/[0.06] to-transparent border border-accent-orange/20 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-accent-orange/15 flex items-center justify-center"><Target size={16} className="text-accent-orange" /></div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-white/30">So what should I do next?</div>
          <h3 className="text-sm font-semibold text-white">Your Top Priorities</h3>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {priorities.map((p) => (
          <div key={p.priority} className="rounded-xl bg-white/[0.03] border border-white/8 p-4 flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-accent-orange/15 text-accent-orange text-[11px] font-bold flex items-center justify-center">{p.priority}</span>
              <span className="text-[11px] font-semibold text-white leading-tight">{p.action}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 mb-1"><TrendingUp size={11} /> +{p.impact} Readiness Points</div>
            <div className="flex items-center gap-1.5 text-[11px] text-white/40 mb-3"><Clock size={11} /> ~{p.weeks} weeks</div>
            <Link to={p.link} className="mt-auto inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-accent-orange/15 hover:bg-accent-orange/25 text-[11px] text-accent-orange font-medium transition-colors">
              Start Now <ArrowRight size={11} />
            </Link>
          </div>
        ))}
      </div>
    </motion.section>
  );
}
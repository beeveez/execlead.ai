import React from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

const STATUS_STYLE = {
  on_target: { text: "text-emerald-400", bar: "from-emerald-500 to-teal-400", badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25" },
  in_progress: { text: "text-amber-400", bar: "from-amber-500 to-orange-400", badge: "bg-amber-500/15 text-amber-400 border-amber-500/25" },
  at_risk: { text: "text-rose-400", bar: "from-rose-500 to-pink-400", badge: "bg-rose-500/15 text-rose-400 border-rose-500/25" },
};

export default function CategoryScoreGrid({ categories, onSelect, selected }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {categories.map((c, i) => {
        const s = STATUS_STYLE[c.status];
        const active = selected?.key === c.key;
        return (
          <motion.button
            key={c.key}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            onClick={() => onSelect?.(c)}
            className={`text-left rounded-2xl border p-4 transition-colors ${
              active ? "bg-white/[0.06] border-indigo-500/40" : "bg-white/[0.02] border-white/8 hover:bg-white/[0.04]"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-wider text-white/30">Phase {c.phase}</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-semibold ${s.badge}`}>
                {c.status === "on_target" ? "On Target" : c.status === "in_progress" ? "In Progress" : "At Risk"}
              </span>
            </div>
            <div className="text-sm font-semibold text-white mb-1">{c.label}</div>
            <div className={`text-2xl font-bold ${s.text}`}>{c.score}<span className="text-sm text-white/30">%</span></div>
            <div className="h-1.5 bg-white/8 rounded-full mt-2 overflow-hidden">
              <div className={`h-full bg-gradient-to-r ${s.bar}`} style={{ width: `${c.score}%` }} />
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-[10px] text-white/40">Target {c.target}%</span>
              {c.gap > 0 && <span className="text-[10px] text-white/40 flex items-center gap-0.5">gap {c.gap} <ChevronRight size={10} /></span>}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
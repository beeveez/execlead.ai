import React from "react";
import { motion } from "framer-motion";
import { Activity, ArrowUp, ArrowDown, GitCompare, HelpCircle } from "lucide-react";

const MOMENTUM_STYLE = {
  Accelerating: { color: "text-emerald-400", bg: "bg-emerald-500/15", border: "border-emerald-500/30", dot: "bg-emerald-400" },
  Steady: { color: "text-blue-400", bg: "bg-blue-500/15", border: "border-blue-500/30", dot: "bg-blue-400" },
  'Needs Attention': { color: "text-amber-400", bg: "bg-amber-500/15", border: "border-amber-500/30", dot: "bg-amber-400" },
  Declining: { color: "text-rose-400", bg: "bg-rose-500/15", border: "border-rose-500/30", dot: "bg-rose-400" },
};

export function ExecutiveMomentum({ momentum }) {
  const s = MOMENTUM_STYLE[momentum.state] || MOMENTUM_STYLE.Steady;
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border ${s.border} ${s.bg} p-4`}>
      <div className="flex items-center gap-2 mb-1.5">
        <Activity size={15} className={s.color} />
        <div className="text-[10px] uppercase tracking-wider text-white/30">Executive Momentum™</div>
      </div>
      <div className="flex items-center gap-2 mb-2">
        <span className={`w-2.5 h-2.5 rounded-full ${s.dot} animate-pulse`} />
        <span className={`text-lg font-bold ${s.color}`}>{momentum.state}</span>
      </div>
      <p className="text-[11px] text-white/55 leading-relaxed">
        Your Executive Momentum is {momentum.state.toLowerCase()} because your profile shows {momentum.reason}.
      </p>
    </motion.div>
  );
}

export function WhatChanged({ changes }) {
  if (!changes?.length) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-white/[0.02] border border-white/8 p-4">
      <div className="flex items-center gap-2 mb-2"><GitCompare size={14} className="text-indigo-400" /><div className="text-[10px] uppercase tracking-wider text-white/30">What Changed?</div></div>
      <div className="space-y-2">
        {changes.map((c, i) => {
          const up = typeof c.to === 'number' ? c.to > c.from : c.to !== c.from;
          return (
            <div key={i} className="flex items-center justify-between text-[12px]">
              <span className="text-white/60">{c.metric}</span>
              <span className="flex items-center gap-1.5 font-medium text-white">
                <span className="text-white/40">{String(c.from)}{c.unit === '%' ? '%' : ''}</span>
                {up ? <ArrowUp size={12} className="text-emerald-400" /> : <ArrowDown size={12} className="text-rose-400" />}
                <span className="text-emerald-400">{String(c.to)}{c.unit === '%' ? '%' : c.type === 'text' ? '' : ''}</span>
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

export function WhatIfScenarios({ scenarios }) {
  if (!scenarios?.length) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-white/[0.02] border border-white/8 p-4">
      <div className="flex items-center gap-2 mb-2"><HelpCircle size={14} className="text-amber-400" /><div className="text-[10px] uppercase tracking-wider text-white/30">What If?</div></div>
      <div className="space-y-2">
        {scenarios.map((s, i) => (
          <div key={i} className="text-[11px] text-white/60 leading-relaxed pl-3 border-l-2 border-amber-500/30">{s}</div>
        ))}
      </div>
    </motion.div>
  );
}
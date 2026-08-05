import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Target } from "lucide-react";

const STATUS_COLOR = {
  on_target: "text-emerald-400",
  in_progress: "text-amber-400",
  at_risk: "text-rose-400",
};

export default function MigrationReadinessHero({ overall }) {
  const { score, target, gap } = overall;
  const radius = 52;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-indigo-500/10 to-transparent border border-indigo-500/20 rounded-2xl p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-indigo-500/15 flex items-center justify-center">
          <ShieldCheck size={16} className="text-indigo-400" />
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-white/30">Migration Readiness Initiative™</div>
          <h2 className="text-base font-semibold text-white">Migration Health Dashboard™</h2>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="relative shrink-0">
          <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-90">
            <circle cx="70" cy="70" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
            <circle
              cx="70" cy="70" r={radius} fill="none"
              stroke="url(#grad)" strokeWidth="10" strokeLinecap="round"
              strokeDasharray={circ} strokeDashoffset={offset}
              style={{ transition: "stroke-dashoffset 1s ease" }}
            />
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#22d3ee" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold text-white leading-none">{score}<span className="text-base text-white/40">%</span></div>
            <div className="text-[10px] text-white/40 mt-1">Overall Readiness</div>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-2 gap-3 w-full">
          <div className="rounded-xl bg-white/[0.03] border border-white/8 p-3">
            <div className="flex items-center gap-1.5 text-[10px] text-white/40 mb-1"><Target size={11} /> Target</div>
            <div className="text-xl font-bold text-white">{target}%</div>
          </div>
          <div className="rounded-xl bg-white/[0.03] border border-white/8 p-3">
            <div className="text-[10px] text-white/40 mb-1">Gap to Target</div>
            <div className={`text-xl font-bold ${gap <= 0 ? "text-emerald-400" : "text-amber-400"}`}>{gap > 0 ? `+${gap}` : "0"}</div>
          </div>
          <div className="rounded-xl bg-white/[0.03] border border-white/8 p-3 col-span-2">
            <div className="text-[10px] text-white/40 mb-1">Status</div>
            <div className={`text-sm font-semibold ${gap <= 0 ? "text-emerald-400" : "text-amber-400"}`}>
              {gap <= 0 ? "On Target — Migration Ready" : "Architecture Hardening in Progress"}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
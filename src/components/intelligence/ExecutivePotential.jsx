import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, Crown, Briefcase } from "lucide-react";

/**
 * ExecutivePotential — three predictive gauges:
 * Executive Potential, Promotion Readiness, Board Readiness.
 */
export default function ExecutivePotential({ forecast, readiness }) {
  const promotion = forecast?.probability || 0;
  const execPotential = readiness?.overallScore || 0;
  const boardReadiness = Math.round((readiness?.dimensions?.find((d) => d.id === "board_readiness")?.current || 0));

  const gauges = [
    { label: "Executive Potential", value: execPotential, projected: Math.min(100, execPotential + 8), icon: TrendingUp, color: "#6366f1", timeline: forecast?.timelineHigh || 0 },
    { label: "Promotion Readiness", value: promotion, projected: Math.min(100, promotion + 12), icon: Briefcase, color: "#10b981", timeline: forecast?.timelineLow || 0 },
    { label: "Board Readiness", value: boardReadiness, projected: Math.min(100, boardReadiness + 5), icon: Crown, color: "#a855f7", timeline: 0 },
  ];

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
      <h3 className="text-white/40 text-xs uppercase tracking-widest mb-4">Executive Potential</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {gauges.map((g, i) => (
          <motion.div
            key={g.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white/[0.02] border border-white/5 rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <g.icon size={16} style={{ color: g.color }} />
              <span className="text-white/30 text-[10px]">{g.timeline > 0 ? `~${g.timeline}mo` : "—"}</span>
            </div>
            <div className="relative w-16 h-16 mx-auto mb-2">
              <svg className="w-16 h-16 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                <motion.circle
                  cx="50" cy="50" r="38" fill="none" stroke={g.color} strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 38}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 38 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 38 * (1 - g.value / 100) }}
                  transition={{ duration: 1, delay: i * 0.1 }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-white">{g.value}%</span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-white/60 text-xs font-medium">{g.label}</div>
              <div className="text-white/30 text-[10px] mt-0.5">Projected: <span className="text-emerald-400">{g.projected}%</span></div>
              <div className="text-white/30 text-[10px]">Confidence: <span className="text-white/50">{forecast?.confidence || "—"}</span></div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
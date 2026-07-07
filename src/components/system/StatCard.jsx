import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

/**
 * Standardized metric/stat card.
 * Props: label, value, icon, trend(number), trendLabel, accent('indigo'|'emerald'|'amber'|'cyan'|'violet'|'rose')
 */
const ACCENTS = {
  indigo: { bg: "bg-indigo-500/10", text: "text-indigo-400", glow: "bg-indigo-500/20" },
  emerald: { bg: "bg-emerald-500/10", text: "text-emerald-400", glow: "bg-emerald-500/20" },
  amber: { bg: "bg-amber-500/10", text: "text-amber-400", glow: "bg-amber-500/20" },
  cyan: { bg: "bg-cyan-500/10", text: "text-cyan-400", glow: "bg-cyan-500/20" },
  violet: { bg: "bg-violet-500/10", text: "text-violet-400", glow: "bg-violet-500/20" },
  rose: { bg: "bg-rose-500/10", text: "text-rose-400", glow: "bg-rose-500/20" },
};

export default function StatCard({ label, value, icon: Icon, trend, trendLabel, accent = "indigo", onClick }) {
  const a = ACCENTS[accent] || ACCENTS.indigo;
  const isUp = typeof trend === "number" && trend >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      whileHover={onClick ? { y: -2 } : undefined}
      onClick={onClick}
      className={`relative bg-white/[0.02] border border-white/5 rounded-2xl p-5 transition-colors ${onClick ? "cursor-pointer hover:border-white/10" : ""}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="text-white/30 text-xs uppercase tracking-wider font-medium">{label}</div>
        {Icon && (
          <div className={`w-9 h-9 rounded-xl ${a.bg} flex items-center justify-center`}>
            <Icon size={17} className={a.text} />
          </div>
        )}
      </div>
      <div className="text-2xl md:text-3xl font-bold text-white tracking-tight">{value}</div>
      {(typeof trend === "number" || trendLabel) && (
        <div className="flex items-center gap-1.5 mt-2">
          {typeof trend === "number" && (
            <span className={`flex items-center gap-0.5 text-xs font-medium ${isUp ? "text-emerald-400" : "text-rose-400"}`}>
              {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {isUp ? "+" : ""}{trend}%
            </span>
          )}
          {trendLabel && <span className="text-white/30 text-xs">{trendLabel}</span>}
        </div>
      )}
    </motion.div>
  );
}
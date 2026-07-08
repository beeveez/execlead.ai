import React from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

export default function KpiCard({ icon: Icon, label, value, sub, color = "#6366f1", onClick, delay = 0 }) {
  const clickable = !!onClick;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl border border-white/5 bg-white/[0.02] p-4 ${clickable ? "cursor-pointer hover:border-white/15 hover:bg-white/[0.04] transition-colors" : ""}`}
    >
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ background: `radial-gradient(circle at top right, ${color}, transparent 70%)` }} />
      <div className="relative flex items-start justify-between">
        <div>
          <div className="text-2xl font-bold text-white">{value}</div>
          <div className="text-[10px] text-white/40 uppercase tracking-wider mt-0.5">{label}</div>
          {sub && <div className="text-[10px] text-white/30 mt-1">{sub}</div>}
        </div>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}15` }}>
          {Icon && <Icon size={15} style={{ color }} />}
        </div>
      </div>
      {clickable && (
        <div className="absolute bottom-2 right-2 text-white/20 group-hover:text-white/40">
          <ChevronRight size={12} />
        </div>
      )}
    </motion.div>
  );
}
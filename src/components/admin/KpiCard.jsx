import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

/**
 * Reusable, clickable KPI card with drill-down behavior.
 * Used across every admin dashboard in EXECLEAD.AI — any metric
 * displayed as a number can be clicked to inspect the underlying records.
 *
 * Hover: card elevates, border glows, pointer cursor, arrow appears.
 * Click: 150ms ripple. Tooltip: "View details".
 */
export default function KpiCard({ label, value, icon: Icon, color = "text-indigo-400", to, onClick, tooltip = "View details" }) {
  const [ripple, setRipple] = useState({ x: 0, y: 0, key: 0, active: false });

  const triggerRipple = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setRipple({ x: e.clientX - rect.left, y: e.clientY - rect.top, key: Date.now(), active: true });
    setTimeout(() => setRipple((r) => ({ ...r, active: false })), 500);
  };

  const handleClick = (e) => {
    triggerRipple(e);
    onClick?.(e);
  };

  const cardClass =
    "group relative overflow-hidden bg-white/[0.02] border border-white/5 hover:border-white/25 hover:bg-white/[0.04] hover:shadow-xl hover:shadow-black/40 hover:-translate-y-0.5 rounded-xl p-4 cursor-pointer transition-all duration-150";

  const inner = (
    <>
      <div className="flex items-center justify-between mb-2">
        <Icon size={16} className={color} />
        <motion.span
          key={value}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="text-xl font-bold text-white"
        >
          {value}
        </motion.span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-white/30 text-xs">{label}</span>
        <ArrowRight
          size={12}
          className="text-white/0 -translate-x-1 group-hover:text-white/50 group-hover:translate-x-0 transition-all duration-150"
        />
      </div>
      {ripple.active && (
        <motion.span
          key={ripple.key}
          initial={{ scale: 0, opacity: 0.35 }}
          animate={{ scale: 3.5, opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="pointer-events-none absolute rounded-full bg-white/30"
          style={{ left: ripple.x - 25, top: ripple.y - 25, width: 50, height: 50 }}
        />
      )}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={cardClass} title={tooltip}>
        {inner}
      </Link>
    );
  }
  return (
    <div onClick={handleClick} className={cardClass} title={tooltip}>
      {inner}
    </div>
  );
}
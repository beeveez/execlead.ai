import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Logo({ size = "lg", showAiTag = true, aiTagClass = "ml-2" }) {
  const sizeClass = size === "sm" ? "text-base" : "text-lg";

  return (
    <Link
      to="/"
      aria-label="EXECLEAD.AI — Go to home"
      className="inline-flex items-center cursor-pointer select-none group"
    >
      <motion.span
        className={`${sizeClass} font-bold tracking-tight inline-flex items-baseline`}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 22 }}
      >
        <span className="text-indigo-400 group-hover:text-indigo-300 transition-colors">EXEC</span>
        <span className="text-white/80 group-hover:text-white transition-colors">LEAD</span>
        <span className="text-indigo-400 group-hover:text-indigo-300 transition-colors">.</span>
        {showAiTag && (
          <span className={`text-[10px] text-white/30 font-normal tracking-widest uppercase ${aiTagClass}`}>AI</span>
        )}
      </motion.span>
    </Link>
  );
}
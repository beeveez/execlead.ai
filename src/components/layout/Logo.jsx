import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BrandRegistry } from "@/lib/brandRegistry";
import ExecutiveMark from "@/components/layout/ExecutiveMark";

export default function Logo({ size = "lg", showAiTag = true, aiTagClass = "ml-2", showMark = true }) {
  const sizeClass = size === "sm" ? "text-base" : size === "xl" ? "text-xl" : "text-lg";
  const markSize = size === "sm" ? 18 : size === "xl" ? 28 : 22;

  return (
    <Link
      to="/"
      aria-label={`${BrandRegistry.brandName} — Go to home`}
      className="inline-flex items-center cursor-pointer select-none group"
    >
      <motion.span
        className={`${sizeClass} font-bold tracking-tight inline-flex items-center`}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 22 }}
      >
        {showMark && (
          <ExecutiveMark size={markSize} className="mr-2 group-hover:opacity-80 transition-opacity shrink-0" />
        )}
        <span className="inline-flex items-baseline">
          <span className="text-indigo-400 group-hover:text-indigo-300 transition-colors">{BrandRegistry.logo.parts.prefix}</span>
          <span className="text-white/80 group-hover:text-white transition-colors">{BrandRegistry.logo.parts.middle}</span>
          <span className="text-indigo-400 group-hover:text-indigo-300 transition-colors">{BrandRegistry.logo.parts.dot}</span>
          {showAiTag && (
            <span className={`text-[10px] text-white/30 font-normal tracking-widest uppercase ${aiTagClass}`}>{BrandRegistry.logo.parts.suffix}</span>
          )}
        </span>
      </motion.span>
    </Link>
  );
}
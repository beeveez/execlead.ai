import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { BRAND, MODULE_MESSAGES } from "@/lib/brandExperience";

/**
 * BrandExperience — a reusable brand banner that adapts its message
 * based on the current module while maintaining a consistent brand voice.
 *
 * Props:
 *   module — key from MODULE_MESSAGES (e.g. "dashboard", "legacy-library")
 *   variant — "full" (default) | "compact" (inline, less padding)
 */
export default function BrandExperience({ module = "dashboard", variant = "full" }) {
  const msg = MODULE_MESSAGES[module] || MODULE_MESSAGES.dashboard;
  const compact = variant === "compact";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`relative overflow-hidden rounded-2xl border border-indigo-500/15 bg-gradient-to-br from-indigo-500/8 via-purple-500/4 to-transparent ${compact ? "p-4" : "p-6"}`}
    >
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="relative flex items-start gap-3">
        <div className={`flex-shrink-0 rounded-xl bg-indigo-500/15 flex items-center justify-center ${compact ? "w-9 h-9" : "w-10 h-10"}`}>
          <Sparkles size={compact ? 16 : 18} className="text-indigo-400" />
        </div>
        <div>
          {msg.title ? (
            <h3 className={`font-semibold text-white ${compact ? "text-sm" : "text-base"}`}>{msg.title}</h3>
          ) : (
            <p className={`font-medium text-white/80 ${compact ? "text-sm" : "text-base"}`}>{msg.tagline}</p>
          )}
          <p className={`text-white/40 leading-relaxed mt-1 ${compact ? "text-xs" : "text-sm"}`}>{msg.subtext}</p>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * BrandTagline — minimal inline tagline for footers, sidebars, etc.
 */
export function BrandTagline({ className = "" }) {
  return (
    <div className={className}>
      <p className="text-white/60 text-sm font-medium">{BRAND.philosophy}</p>
      <p className="text-white/25 text-xs mt-0.5">{BRAND.identity}</p>
    </div>
  );
}
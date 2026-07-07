import React from "react";
import { motion } from "framer-motion";

/**
 * Reusable empty state — every module uses this instead of "No Data".
 * Props: icon, title, description, action, secondaryAction
 */
export default function EmptyState({
  icon: Icon,
  title = "Nothing here yet",
  description,
  action,
  secondaryAction,
  compact = false,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`flex flex-col items-center justify-center text-center ${compact ? "py-10" : "py-16"} px-4`}
    >
      {Icon && (
        <div className={`relative mb-5 ${compact ? "w-14 h-14" : "w-20 h-20"}`}>
          <div className="absolute inset-0 bg-indigo-500/10 rounded-2xl blur-xl" />
          <div className={`relative ${compact ? "w-14 h-14" : "w-20 h-20"} rounded-2xl bg-gradient-to-br from-indigo-500/15 to-purple-500/5 border border-white/5 flex items-center justify-center`}>
            <Icon size={compact ? 26 : 34} className="text-indigo-400/70" />
          </div>
        </div>
      )}
      <h3 className="text-white font-semibold text-base mb-1.5">{title}</h3>
      {description && (
        <p className="text-white/40 text-sm max-w-sm leading-relaxed mb-6">{description}</p>
      )}
      {(action || secondaryAction) && (
        <div className="flex items-center gap-2.5">
          {secondaryAction}
          {action}
        </div>
      )}
    </motion.div>
  );
}
import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Standardized page header — every module uses this for consistency.
 * Props: title, description, breadcrumb[{label,path}], primaryAction, secondaryAction, helpText, icon
 */
export default function PageHeader({
  title,
  description,
  breadcrumb = [],
  primaryAction,
  secondaryAction,
  helpText,
  icon: Icon,
  actions,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="mb-6"
    >
      {/* Breadcrumb */}
      {breadcrumb.length > 0 && (
        <nav className="flex items-center gap-1.5 text-xs text-white/30 mb-3" aria-label="Breadcrumb">
          {breadcrumb.map((b, i) => (
            <React.Fragment key={i}>
              {i > 0 && <ChevronRight size={12} className="text-white/15" />}
              {b.path ? (
                <Link to={b.path} className="hover:text-white/60 transition-colors">{b.label}</Link>
              ) : (
                <span className="text-white/50">{b.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2.5">
            {Icon && (
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                <Icon size={18} className="text-indigo-400" />
              </div>
            )}
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight truncate">{title}</h1>
            {helpText && (
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="text-white/20 hover:text-white/50 transition-colors mt-0.5" aria-label="Help">
                      <HelpCircle size={15} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs text-xs">
                    <p>{helpText}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          {description && (
            <p className="text-white/40 text-sm mt-1.5 leading-relaxed">{description}</p>
          )}
        </div>

        {/* Actions */}
        {(actions || primaryAction || secondaryAction) && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {actions}
            {secondaryAction}
            {primaryAction}
          </div>
        )}
      </div>
    </motion.div>
  );
}
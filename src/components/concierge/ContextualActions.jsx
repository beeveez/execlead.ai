import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown, ChevronRight, Sparkles, Zap, Compass, FileBarChart,
  ArrowRight, Clock, TrendingUp,
} from "lucide-react";

const IMPACT_STYLES = {
  Critical: "text-red-400 bg-red-500/10 border-red-500/20",
  High: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  Medium: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  Low: "text-blue-400 bg-blue-500/10 border-blue-500/20",
};

const PRIORITY_STYLES = {
  P0: "text-red-400 bg-red-500/10 border-red-500/20",
  P1: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  P2: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  P3: "text-blue-400 bg-blue-500/10 border-blue-500/20",
};

function ActionRow({ action, isPrimary, onAction }) {
  const Icon = action.icon;
  const impactStyle = IMPACT_STYLES[action.impact] || IMPACT_STYLES.Low;
  const priorityStyle = PRIORITY_STYLES[action.priority] || PRIORITY_STYLES.P3;

  return (
    <button
      onClick={() => onAction(action)}
      className={`w-full text-left rounded-lg border transition-all duration-200 group ${
        isPrimary
          ? "bg-gradient-to-r from-amber-500/10 to-transparent border-amber-500/30 hover:border-amber-500/50"
          : "bg-muted/50 border-border hover:bg-accent hover:border-border/80"
      }`}
    >
      <div className="flex items-start gap-2.5 p-2.5">
        {/* Icon */}
        <div
          className={`flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center ${
            isPrimary
              ? "bg-amber-500/15 text-amber-500"
              : "bg-muted text-muted-foreground group-hover:text-foreground"
          }`}
        >
          <Icon size={14} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`text-xs font-semibold ${isPrimary ? "text-foreground" : "text-foreground/90"}`}>
              {action.label}
            </span>
            {action.priority && (
              <span className={`text-[9px] font-bold px-1 py-0.5 rounded border ${priorityStyle}`}>
                {action.priority}
              </span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
            {action.description}
          </p>
          {/* Meta */}
          <div className="flex items-center gap-2 mt-1.5">
            {action.effort && (
              <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                <Clock size={9} />
                {action.effort}
              </span>
            )}
            {action.impact && (
              <span className={`flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded border ${impactStyle}`}>
                <TrendingUp size={9} />
                {action.impact}
              </span>
            )}
          </div>
        </div>

        {/* Arrow */}
        <ChevronRight
          size={14}
          className={`flex-shrink-0 mt-1 transition-transform group-hover:translate-x-0.5 ${
            isPrimary ? "text-amber-500" : "text-muted-foreground/50"
          }`}
        />
      </div>
    </button>
  );
}

function ActionGroup({ label, icon: Icon, actions, defaultOpen, onAction }) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  if (!actions || actions.length === 0) return null;

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-1 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors w-full"
      >
        <ChevronDown size={10} className={`transition-transform ${open ? "" : "-rotate-90"}`} />
        <Icon size={10} />
        {label}
        <span className="text-muted-foreground/50 normal-case tracking-normal">({actions.length})</span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="space-y-1 pt-1">
              {actions.map((action) => (
                <ActionRow key={action.id} action={action} onAction={onAction} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ContextualActions({ actions, dashboardLabel, onAction }) {
  if (!actions || (!actions.primaryAction && actions.allActions.length === 0)) return null;

  const { primaryAction, secondaryActions, navigationActions, automationActions, reportingActions } = actions;

  return (
    <div className="space-y-2 pt-1">
      {/* Header */}
      <div className="flex items-center gap-1.5 px-1">
        <Sparkles size={11} className="text-amber-500" />
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Recommended Next Actions
        </p>
      </div>
      {dashboardLabel && (
        <p className="text-[10px] text-muted-foreground/60 px-1 -mt-1">
          Contextual to {dashboardLabel}
        </p>
      )}

      {/* Primary Action — always visible, highlighted */}
      {primaryAction && (
        <div className="relative">
          <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-0.5 h-8 bg-amber-500 rounded-full" />
          <ActionRow action={primaryAction} isPrimary onAction={onAction} />
        </div>
      )}

      {/* Secondary Actions — collapsible */}
      {secondaryActions.length > 0 && (
        <ActionGroup
          label="Secondary Actions"
          icon={Zap}
          actions={secondaryActions}
          defaultOpen
          onAction={onAction}
        />
      )}

      {/* Navigation Actions */}
      {navigationActions.length > 0 && (
        <ActionGroup
          label="Navigate"
          icon={Compass}
          actions={navigationActions}
          onAction={onAction}
        />
      )}

      {/* Automation Actions */}
      {automationActions.length > 0 && (
        <ActionGroup
          label="Automate"
          icon={Zap}
          actions={automationActions}
          onAction={onAction}
        />
      )}

      {/* Reporting Actions */}
      {reportingActions.length > 0 && (
        <ActionGroup
          label="Reports"
          icon={FileBarChart}
          actions={reportingActions}
          onAction={onAction}
        />
      )}
    </div>
  );
}
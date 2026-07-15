import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, ChevronRight, AlertCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { STATUS_CONFIG, TREND_CONFIG } from "@/lib/diagnosticRegistry";
import DiagnosticDrawer from "@/components/shared/DiagnosticDrawer";

const TREND_ICONS = { up: TrendingUp, down: TrendingDown, stable: Minus };

/**
 * DiagnosticMetricCard™ — Interactive Diagnostic Entry Point
 * ============================================================
 * Transforms static KPIs into clickable diagnostic entry points.
 *
 * Every metric answers: "Why is this value what it is?"
 *
 * Props:
 *   title          — Card title
 *   score          — 0-100 numeric score
 *   status         — healthy | warning | critical
 *   trend          — up | down | stable
 *   icon           — Lucide icon component
 *   severity       — optional severity label
 *   evidenceCount  — number of evidence items
 *   diagnosticType — key into DIAGNOSTIC_TYPES registry
 *   lastUpdated    — ISO timestamp
 *   onOpen         — optional custom open handler (bypasses drawer)
 *   onClick        — alias for onOpen
 *
 * Drawer content props (passed through to DiagnosticDrawer):
 *   evidence, timeline, recommendations, summary, actions, links, onAction
 */
export default function DiagnosticMetricCard({
  title,
  score,
  status = "healthy",
  trend = "stable",
  icon: Icon,
  severity,
  evidenceCount = 0,
  diagnosticType,
  lastUpdated,
  onOpen,
  onClick,
  // Drawer content
  evidence,
  timeline,
  recommendations,
  summary,
  actions,
  links,
  onAction,
  description,
  className = "",
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const statusCfg = STATUS_CONFIG[status] || STATUS_CONFIG.healthy;
  const trendCfg = TREND_CONFIG[trend] || TREND_CONFIG.stable;
  const TrendIcon = TREND_ICONS[trend] || Minus;

  // Score ring
  const ringColor = statusCfg.scoreColor;
  const circumference = 2 * Math.PI * 38;
  const strokeDashoffset = useMemo(
    () => circumference - ((score || 0) / 100) * circumference,
    [score, circumference]
  );

  const handleClick = () => {
    base44.analytics.track({
      eventName: "diagnostic_metric_opened",
      properties: { diagnostic_type: diagnosticType, title, score, status },
    });

    if (onOpen || onClick) {
      (onOpen || onClick)();
      return;
    }
    setDrawerOpen(true);
  };

  return (
    <>
      <motion.div
        whileHover={{ y: -2 }}
        onClick={handleClick}
        onMouseEnter={(e) => e.currentTarget.classList.add("ring-1", statusCfg.borderColor.split("/")[0] + "/30")}
        onMouseLeave={(e) => e.currentTarget.classList.remove("ring-1", statusCfg.borderColor.split("/")[0] + "/30")}
        className={`
          relative bg-white/[0.02] border border-white/5 rounded-xl p-4
          cursor-pointer transition-all hover:bg-white/[0.04] hover:border-white/10
          group ${className}
        `}
      >
        {/* Header: Icon + Title */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {Icon && (
              <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${statusCfg.bgColor}`}>
                <Icon size={16} className={statusCfg.textColor} />
              </div>
            )}
            <div>
              <h3 className="text-sm font-medium text-white/80">{title}</h3>
              {severity && (
                <span className={`text-[10px] uppercase tracking-wide ${statusCfg.textColor}`}>{severity}</span>
              )}
            </div>
          </div>
          {evidenceCount > 0 && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5">
              <AlertCircle size={10} className="text-white/30" />
              <span className="text-[10px] text-white/40">{evidenceCount}</span>
            </div>
          )}
        </div>

        {/* Score Ring + Trend */}
        <div className="flex items-center gap-4">
          <div className="relative flex-shrink-0">
            <svg width="90" height="90" viewBox="0 0 90 90" className="-rotate-90">
              <circle cx="45" cy="45" r="38" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="5" />
              <motion.circle
                cx="45" cy="45" r="38" fill="none" stroke={ringColor}
                strokeWidth="5" strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-bold text-white">{score ?? 0}</span>
              <span className="text-[9px] text-white/30 uppercase">Score</span>
            </div>
          </div>

          <div className="flex-1 space-y-1.5">
            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusCfg.bgColor} ${statusCfg.textColor}`}>
              {statusCfg.label}
            </div>
            <div className={`flex items-center gap-1 ${trendCfg.textColor}`}>
              <TrendIcon size={12} />
              <span className="text-xs">{trendCfg.label}</span>
            </div>
            {lastUpdated && (
              <p className="text-[10px] text-white/25">
                {new Date(lastUpdated).toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>

        {/* Hover hint */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-[10px] text-white/40">Open Diagnostics</span>
          <ChevronRight size={12} className="text-white/40" />
        </div>
      </motion.div>

      {/* Diagnostic Drawer */}
      <DiagnosticDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title={title}
        description={description}
        diagnosticType={diagnosticType}
        score={score}
        status={status}
        trend={trend}
        evidence={evidence}
        timeline={timeline}
        recommendations={recommendations}
        summary={summary}
        actions={actions}
        links={links}
        onAction={onAction}
      />
    </>
  );
}